import { createHash, createHmac, randomBytes, randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Connect, Plugin } from 'vite';
import { createDiagnostics, silentDiagnostics, type Diagnostics } from './diagnostics.ts';
import { resolve } from 'node:path';

export interface BiliConfig {
  accessKeyId: string;
  accessKeySecret: string;
  appId: string;
  identityCode: string;
}

interface Anchor { name: string; roomId: number; avatar: string }
const HEARTBEAT_INTERVAL_MS = 20000;
const SESSION_RETENTION_MS = 10 * 60 * 1000;
interface LiveSession {
  gameId: string;
  owner: string;
  anchor: Anchor;
  websocketInfo: { auth_body: string; wss_link: string[] };
  createdAt: number;
  lastSeen: number;
  lastHeartbeat: string;
  verifiedAt: number;
  pausedAt?: number;
}

export class BiliError extends Error {
  status: number;
  upstreamCode?: number;
  requestId?: string;
  constructor(message: string, status = 502, upstreamCode?: number) {
    super(message); this.status = status; this.upstreamCode = upstreamCode;
  }
}

/** Sign the exact JSON bytes sent upstream; the secret is never returned to the browser. */
export function signRequest(body: string, config: BiliConfig, timestamp: number = Math.floor(Date.now() / 1000), nonce: string = randomUUID()) {
  const headers = {
    'x-bili-accesskeyid': config.accessKeyId,
    'x-bili-content-md5': createHash('md5').update(body).digest('hex'),
    'x-bili-signature-method': 'HMAC-SHA256',
    'x-bili-signature-nonce': nonce,
    'x-bili-signature-version': '1.0',
    'x-bili-timestamp': String(timestamp)
  };
  const canonical = Object.entries(headers).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}:${value}`).join('\n');
  return {
    ...headers,
    Authorization: createHmac('sha256', config.accessKeySecret).update(canonical).digest('hex'),
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };
}

/** One configured broadcaster session per local demo; only its browser owner may operate it. */
export class BiliSessionManager {
  private session?: LiveSession;
  private starting?: Promise<LiveSession>;
  private stopping?: Promise<void>;
  private heartbeat?: Promise<void>;
  private heartbeatAttemptAt = 0;
  private heartbeatError?: Error;
  private heartbeatFailures = 0;
  private lastError = '';
  private lastStart = 0;
  private timer?: ReturnType<typeof setInterval>;
  private reclaimTimer?: ReturnType<typeof setTimeout>;
  private disposed = false;
  private previousRequests = new Map<string, number>();
  private recentRequests: { at: number; path: string }[] = [];
  private lastRequestAt?: number;
  private outcomes = new Map<string, { lastSuccessAt?: number; firstFailureAt?: number; failures: number }>();
  private logger: Diagnostics;

  private config: BiliConfig;
  private fetcher: typeof fetch;
  constructor(config: BiliConfig, fetcher: typeof fetch = fetch, logger: Diagnostics = silentDiagnostics) {
    this.config = config; this.fetcher = fetcher; this.logger = logger;
    logger.protect([config.accessKeyId, config.accessKeySecret, config.identityCode]);
  }

  /** Hash sensitive identifiers so events can be correlated without exposing session credentials. */
  private tag(value?: string) { return value ? createHash('sha256').update(value).digest('hex').slice(0, 12) : undefined; }

  /** Keyed fingerprints allow config comparison across restarts without exposing identity codes. */
  private configTag(value: string) {
    return createHmac('sha256', this.config.accessKeySecret).update(value).digest('hex').slice(0, 16);
  }

  private context() {
    return { appId: this.config.appId, sessionTag: this.tag(this.session?.gameId), ownerTag: this.tag(this.session?.owner) };
  }

  /** Middleware/browser diagnostics use bounded fields, never arbitrary request or response bodies. */
  diagnostic(level: 'info' | 'warn' | 'error', event: string, fields: Record<string, unknown>) {
    this.logger.write(level, event, { ...this.context(), ...fields });
  }

  private redact(text: string, limit = 240) {
    for (const value of [this.config.accessKeyId, this.config.accessKeySecret, this.config.identityCode]) {
      if (value) text = text.replaceAll(value, '[redacted]');
    }
    return text.slice(0, limit);
  }

  /** Use only the fixed official API host, forbid redirects, and surface safe business errors. */
  private async api(path: '/v2/app/start' | '/v2/app/end' | '/v2/app/heartbeat', params: object) {
    const body = JSON.stringify(params);
    const requestId = randomUUID();
    const startedAt = Date.now();
    const previous = this.previousRequests.get(path);
    this.previousRequests.set(path, startedAt);
    const signedHeaders = signRequest(body, this.config);
    const session = this.session;
    const requestParams = params as { game_id?: string; app_id?: number; code?: string };
    const sinceAnyRequestMs = this.lastRequestAt === undefined ? undefined : startedAt - this.lastRequestAt;
    this.lastRequestAt = startedAt;
    // Count a bounded recent window including this request, across all three endpoints.
    this.recentRequests = this.recentRequests.filter((request) => startedAt - request.at < 60000).slice(-999);
    this.recentRequests.push({ at: startedAt, path });
    const outcome = this.outcomes.get(path) ?? { failures: 0 };
    this.outcomes.set(path, outcome);
    const context = {
      ...this.context(), requestId, path, method: 'POST', startedAt: new Date(startedAt).toISOString(),
      sincePreviousRequestMs: previous === undefined ? undefined : startedAt - previous,
      heartbeatFailureCount: this.heartbeatFailures,
      sinceAnyRequestMs,
      requestContext: {
        credentialTag: this.configTag(this.config.accessKeyId),
        broadcasterTag: this.configTag(this.config.identityCode),
        gameTag: this.tag(requestParams.game_id),
        gameMatchesSession: requestParams.game_id === undefined ? undefined : requestParams.game_id === session?.gameId,
        requestAppId: requestParams.app_id,
        parameterNames: Object.keys(params).sort(),
        bodyBytes: Buffer.byteLength(body),
        signedTimestamp: signedHeaders['x-bili-timestamp'],
        sessionAgeMs: session ? startedAt - session.createdAt : undefined,
        lastHeartbeat: session?.lastHeartbeat || null,
        sinceHeartbeatMs: session?.lastHeartbeat ? startedAt - Date.parse(session.lastHeartbeat) : undefined,
        clientIdleMs: session ? startedAt - session.lastSeen : undefined,
        paused: session ? session.pausedAt !== undefined : undefined,
        expiresAt: session ? new Date(this.expiresAt(session)).toISOString() : undefined,
        recentRequests60s: {
          start: this.recentRequests.filter((request) => request.path === '/v2/app/start').length,
          heartbeat: this.recentRequests.filter((request) => request.path === '/v2/app/heartbeat').length,
          end: this.recentRequests.filter((request) => request.path === '/v2/app/end').length
        }
      }
    };
    let httpStatus: number | undefined;
    let upstreamRequestId: string | undefined;
    let retryAfter: string | undefined;
    let responseContext: Record<string, unknown> | undefined;
    let upstreamMessage: string | undefined;
    let phase = 'transport';
    this.logger.write('info', 'upstream.request_started', context);
    try {
      const response = await this.fetcher(`https://live-open.biliapi.com${path}`, {
        method: 'POST', body, headers: signedHeaders,
        redirect: 'error', signal: AbortSignal.timeout(15000)
      });
      httpStatus = response.status;
      upstreamRequestId = response.headers.get('x-request-id') ?? response.headers.get('x-bili-trace-id') ?? undefined;
      retryAfter = response.headers.get('retry-after') ?? undefined;
      const serverDate = response.headers.get('date');
      const receivedAt = Date.now();
      responseContext = {
        requestIdHeader: response.headers.get('x-request-id') ?? undefined,
        traceIdHeader: response.headers.get('x-bili-trace-id') ?? undefined,
        serverDate: serverDate ?? undefined,
        // Approximate only: HTTP Date has second precision and includes network delay.
        serverClockOffsetMs: serverDate && Number.isFinite(Date.parse(serverDate)) ? Date.parse(serverDate) - receivedAt : undefined
      };
      phase = 'http';
      if (!response.ok) throw new BiliError(`B 站开放平台 HTTP ${response.status}`);
      phase = 'parse';
      const data = await response.json().catch(() => { throw new BiliError('B 站开放平台返回了无效 JSON'); });
      if (!data || typeof data.code !== 'number') throw new BiliError('B 站开放平台响应格式异常');
      phase = 'business';
      if (typeof data.request_id === 'string') {
        upstreamRequestId ??= data.request_id;
        responseContext.bodyRequestId = data.request_id;
      }
      // Protect the returned game credential even if it is echoed in later error messages.
      if (path === '/v2/app/start' && typeof data.data?.game_info?.game_id === 'string') {
        this.logger.protect([data.data.game_info.game_id]);
      }
      if (data.code !== 0 && typeof data.message === 'string') upstreamMessage = this.redact(data.message, 1024);
      if (data.code !== 0) throw new BiliError(`B 站返回 ${data.code}：${this.redact(String(data.message || '请求失败'))}`, 502, data.code);
      // Credentials in a successful start response are protected before any later validation/logging.
      if (path === '/v2/app/start' && typeof data.data?.websocket_info?.auth_body === 'string') {
        const authBody = data.data.websocket_info.auth_body;
        this.logger.protect([authBody]);
        try {
          const auth = JSON.parse(authBody);
          if (typeof auth.key === 'string') this.logger.protect([auth.key]);
        } catch { /* Session validation handles malformed auth data without logging its contents. */ }
      }
      const recoveredFromFailures = outcome.failures;
      outcome.lastSuccessAt = Date.now();
      outcome.firstFailureAt = undefined;
      outcome.failures = 0;
      this.logger.write('info', 'upstream.request_succeeded', { ...context, httpStatus, upstreamRequestId, responseContext, upstreamCode: 0, recoveredFromFailures, durationMs: Date.now() - startedAt,
        returnedGameTag: path === '/v2/app/start' && typeof data.data?.game_info?.game_id === 'string' ? this.tag(data.data.game_info.game_id) : undefined });
      return data.data;
    } catch (cause) {
      const failure = cause instanceof BiliError ? cause : new BiliError('无法连接 B 站开放平台，请检查网络后重试');
      failure.requestId = requestId;
      outcome.firstFailureAt ??= Date.now();
      ++outcome.failures;
      const transport = cause instanceof Error ? cause as Error & { cause?: { code?: unknown } } : undefined;
      this.logger.write('error', 'upstream.request_failed', {
        ...context, phase, httpStatus, upstreamRequestId, retryAfter, responseContext, upstreamMessage,
        endpointFailures: outcome.failures,
        firstEndpointFailureAt: new Date(outcome.firstFailureAt).toISOString(),
        lastEndpointSuccessAt: outcome.lastSuccessAt === undefined ? null : new Date(outcome.lastSuccessAt).toISOString(),
        restrictionReason: failure.upstreamCode === 4009 ? 'upstream_unspecified_access_restriction' : undefined,
        upstreamCode: failure.upstreamCode, durationMs: Date.now() - startedAt,
        message: failure.message, errorName: transport?.name,
        transportCode: typeof transport?.cause?.code === 'string' && /^[A-Z0-9_]{1,64}$/.test(transport.cause.code) ? transport.cause.code : undefined
      });
      throw failure;
    }
  }

  /** Active polling renews browser presence; paused polling must never extend retention. */
  status(owner: string, receiving = true) {
    const own = this.session?.owner === owner;
    const session = own ? this.session : undefined;
    if (receiving && session && session.pausedAt === undefined && Date.now() < this.expiresAt(session)) {
      session.lastSeen = Date.now();
      this.scheduleReclaim(session);
    }
    return {
      configured: Boolean(this.config.accessKeyId && this.config.accessKeySecret && this.config.identityCode && this.config.appId),
      appId: this.config.appId,
      running: Boolean(session && session.pausedAt === undefined && Date.now() < this.expiresAt(session)),
      retained: Boolean(session && session.pausedAt !== undefined && Date.now() < this.expiresAt(session)),
      retainedUntil: session?.pausedAt !== undefined ? new Date(this.expiresAt(session)).toISOString() : undefined,
      busy: Boolean(this.starting || this.stopping || (this.session && !own)),
      anchor: own ? this.session?.anchor : undefined,
      lastHeartbeat: own ? this.session?.lastHeartbeat : undefined,
      error: this.lastError
    };
  }

  /** Concurrent starts share a single upstream request, without sharing access across browsers. */
  async start(owner: string) {
    if (this.disposed) throw new BiliError('服务正在关闭', 503);
    if (!this.status(owner, false).configured || !/^\d+$/.test(this.config.appId) || !Number.isSafeInteger(Number(this.config.appId))) {
      throw new BiliError('服务端 B 站应用配置缺失或 app_id 无效', 503);
    }
    if (this.stopping) await this.stopping;
    if (!this.starting) this.starting = this.acquireSession(owner).finally(() => { this.starting = undefined; });
    const session = await this.starting;
    if (session.owner !== owner) throw new BiliError('直播连接正由另一个浏览器使用', 409);
    session.lastSeen = Date.now();
    return { anchor: session.anchor, websocketInfo: session.websocketInfo };
  }

  /** Reuse only this owner's verified session; transient validation failures never create duplicates. */
  private async acquireSession(owner: string): Promise<LiveSession> {
    const cached = this.session;
    if (cached) {
      if (cached.owner !== owner) throw new BiliError('直播连接正由另一个浏览器使用', 409);
      if (Date.now() >= this.expiresAt(cached)) await this.endSession(cached, 'client_timeout');
      else {
        if (this.heartbeat || Date.now() - cached.verifiedAt >= HEARTBEAT_INTERVAL_MS) {
          try { await this.checkHeartbeat(cached); }
          catch (cause) { if (this.session === cached) throw cause; }
        }
        if (this.session === cached) {
          cached.pausedAt = undefined;
          cached.lastSeen = Date.now();
          this.scheduleReclaim(cached);
          this.diagnostic('info', 'session.reused', { lastHeartbeat: cached.lastHeartbeat || null });
          return cached;
        }
      }
    }
    if (Date.now() - this.lastStart < 5000) throw new BiliError('连接操作过于频繁，请稍后重试', 429);
    this.lastStart = Date.now();
    this.lastError = '';
    return this.createSession(owner);
  }

  /** Pause is idempotent: repeated requests/status polls cannot reset its ten-minute deadline. */
  async pause(owner: string) {
    if (this.starting) await this.starting.catch(() => undefined);
    if (this.stopping) await this.stopping;
    const session = this.session;
    if (!session) return;
    if (session.owner !== owner) throw new BiliError('无权暂停其他浏览器的直播连接', 403);
    if (session.pausedAt === undefined) {
      session.pausedAt = Date.now();
      this.scheduleReclaim(session);
      this.diagnostic('info', 'session.paused', { retainedUntil: new Date(this.expiresAt(session)).toISOString(), retentionMs: SESSION_RETENTION_MS });
    }
  }

  private expiresAt(session: LiveSession) { return (session.pausedAt ?? session.lastSeen) + SESSION_RETENTION_MS; }

  /** An independent deadline releases idle sessions even when heartbeats or status polling continue. */
  private scheduleReclaim(session: LiveSession) {
    clearTimeout(this.reclaimTimer);
    this.reclaimTimer = setTimeout(() => {
      void (async () => {
        if (this.starting) await this.starting.catch(() => undefined);
        if (this.session === session && Date.now() >= this.expiresAt(session)) await this.endSession(session, 'client_timeout');
      })().catch(() => undefined);
    }, Math.max(0, this.expiresAt(session) - Date.now()));
    this.reclaimTimer.unref();
  }

  private async createSession(owner: string): Promise<LiveSession> {
    const data = await this.api('/v2/app/start', { code: this.config.identityCode, app_id: Number(this.config.appId) });
    const gameId = data?.game_info?.game_id;
    const websocket = data?.websocket_info;
    try {
      if (typeof gameId !== 'string' || !gameId || typeof websocket?.auth_body !== 'string' ||
        !Array.isArray(websocket.wss_link) || !websocket.wss_link.length ||
        !websocket.wss_link.every((link: unknown) => {
          if (typeof link !== 'string') return false;
          try { const url = new URL(link); return url.protocol === 'wss:' && url.hostname.endsWith('.bilibili.com'); }
          catch { return false; }
        })) throw new BiliError('B 站未返回有效的场次或弹幕连接信息，请检查应用状态');
      JSON.parse(websocket.auth_body);
      const anchorInfo = data.anchor_info ?? {};
      this.session = {
        owner, gameId, createdAt: Date.now(), lastSeen: Date.now(), lastHeartbeat: '', verifiedAt: Date.now(),
        anchor: { name: String(anchorInfo.uname || '主播'), roomId: Number(anchorInfo.room_id) || 0, avatar: typeof anchorInfo.uface === 'string' && anchorInfo.uface.startsWith('https://') ? anchorInfo.uface : '' },
        websocketInfo: { auth_body: websocket.auth_body, wss_link: websocket.wss_link }
      };
      this.heartbeatError = undefined;
      this.heartbeatAttemptAt = 0;
      this.heartbeatFailures = 0;
      this.timer = setInterval(() => void this.tick(), HEARTBEAT_INTERVAL_MS);
      this.timer.unref();
      this.scheduleReclaim(this.session);
      this.diagnostic('info', 'session.created', { roomId: this.session.anchor.roomId, heartbeatIntervalMs: HEARTBEAT_INTERVAL_MS });
      return this.session;
    } catch (cause) {
      this.diagnostic('error', 'session.invalid_start_response', { message: cause instanceof BiliError ? cause.message : 'Invalid start response' });
      if (typeof gameId === 'string' && gameId) await this.api('/v2/app/end', { game_id: gameId, app_id: Number(this.config.appId) }).catch(() => undefined);
      throw cause instanceof BiliError ? cause : new BiliError('B 站弹幕认证信息格式异常');
    }
  }

  /** Keep both active and retained sessions alive; idle expiry is independent of heartbeat success. */
  private async tick() {
    const session = this.session;
    if (!session || this.starting || this.heartbeat || this.stopping) return;
    if (Date.now() >= this.expiresAt(session)) { await this.endSession(session, 'client_timeout').catch(() => undefined); return; }
    await this.checkHeartbeat(session).catch(() => undefined);
  }

  /** Share one heartbeat between reconnection validation and the timer; only 7003 proves expiry. */
  private checkHeartbeat(session: LiveSession): Promise<void> {
    if (this.heartbeat) return this.heartbeat;
    // A failed validation is also cached for one heartbeat interval to avoid click-driven API bursts.
    if (this.heartbeatError && Date.now() - this.heartbeatAttemptAt < HEARTBEAT_INTERVAL_MS) return Promise.reject(this.heartbeatError);
    this.heartbeatAttemptAt = Date.now();
    const pending: Promise<void> = this.api('/v2/app/heartbeat', { game_id: session.gameId }).then(() => {
      if (this.session !== session) return;
      session.lastHeartbeat = new Date().toISOString();
      session.verifiedAt = Date.now();
      this.heartbeatError = undefined;
      if (this.heartbeatFailures) this.diagnostic('info', 'heartbeat.recovered', { previousFailureCount: this.heartbeatFailures });
      this.heartbeatFailures = 0;
      this.lastError = '';
    }).catch((cause: unknown) => {
      if (this.session !== session) throw cause;
      this.heartbeatError = cause instanceof Error ? cause : new BiliError('B 站场次心跳失败');
      this.lastError = cause instanceof Error ? cause.message : 'B 站场次心跳失败';
      ++this.heartbeatFailures;
      this.diagnostic('warn', 'heartbeat.failed', { failureCount: this.heartbeatFailures, requestId: cause instanceof BiliError ? cause.requestId : undefined, lastHeartbeat: session.lastHeartbeat || null });
      if (cause instanceof BiliError && cause.upstreamCode === 7003) {
        this.diagnostic('warn', 'session.invalidated', { upstreamCode: cause.upstreamCode, requestId: cause.requestId });
        this.session = undefined;
        clearInterval(this.timer);
        clearTimeout(this.reclaimTimer);
        this.heartbeatFailures = 0;
      }
      throw cause;
    }).finally(() => { if (this.heartbeat === pending) this.heartbeat = undefined; });
    this.heartbeat = pending;
    return pending;
  }

  /** Wait for an in-flight start before ending; never end a different browser's session. */
  async stop(owner: string, reason: 'user' | 'client_timeout' | 'service_shutdown' = 'user') {
    if (this.starting) await this.starting.catch(() => undefined);
    const session = this.session;
    if (!session) return;
    if (session.owner !== owner) throw new BiliError('无权关闭其他浏览器的直播连接', 403);
    await this.endSession(session, reason);
  }

  /** Internal ending does not await starting, allowing acquireSession to retire an expired cache. */
  private async endSession(session: LiveSession, reason: 'user' | 'client_timeout' | 'service_shutdown') {
    if (this.heartbeat) await this.heartbeat.catch(() => undefined);
    if (this.session !== session) return;
    if (!this.stopping) {
      this.diagnostic('info', 'session.stop_requested', { reason });
      this.stopping = this.api('/v2/app/end', { game_id: session.gameId, app_id: Number(this.config.appId) })
        .then(() => { this.diagnostic('info', 'session.stopped', { reason }); this.session = undefined; this.heartbeatFailures = 0; this.lastError = ''; clearInterval(this.timer); clearTimeout(this.reclaimTimer); })
        .catch((cause: unknown) => { this.lastError = cause instanceof Error ? cause.message : '结束场次失败'; throw cause; })
        .finally(() => { this.stopping = undefined; });
    }
    await this.stopping;
  }

  async dispose() {
    this.disposed = true;
    clearInterval(this.timer);
    clearTimeout(this.reclaimTimer);
    if (this.starting) await this.starting.catch(() => undefined);
    clearInterval(this.timer);
    clearTimeout(this.reclaimTimer);
    if (this.session) await this.stop(this.session.owner, 'service_shutdown').catch(() => undefined);
  }
}

/** Restrict this credential-bearing demo API to loopback and same-origin JSON commands. */
export function createBiliMiddleware(manager: BiliSessionManager): Connect.NextHandleFunction {
  return (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
    const path = req.url?.split('?')[0];
    if (!path?.startsWith('/api/bilibili/')) { next(); return; }
    const send = (status: number, body: object) => {
      res.statusCode = status;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.end(JSON.stringify(body));
    };
    void (async () => {
      let host: URL;
      try { host = new URL(`http://${req.headers.host}`); } catch { throw new BiliError('非法 Host', 403); }
      if (!['localhost', '127.0.0.1', '[::1]'].includes(host.hostname)) throw new BiliError('仅允许本机访问', 403);
      if (req.headers.origin && req.headers.origin !== host.origin) throw new BiliError('禁止跨站调用', 403);
      if (req.method !== 'GET' && (req.headers['x-editor-request'] !== '1' || req.headers['content-type'] !== 'application/json')) {
        throw new BiliError('必须使用同源 JSON 请求', 403);
      }
      const cookie = req.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith('bili_demo_session='))?.slice('bili_demo_session='.length);
      const owner = cookie && /^[a-f0-9]{64}$/.test(cookie) ? cookie : randomBytes(32).toString('hex');
      if (owner !== cookie) res.setHeader('Set-Cookie', `bili_demo_session=${owner}; HttpOnly; SameSite=Strict; Path=/api/bilibili; Max-Age=86400`);
      if (path === '/api/bilibili/status' && req.method === 'GET') { send(200, { data: manager.status(owner, req.headers['x-editor-receiving'] !== '0') }); return; }
      if (!['/api/bilibili/start', '/api/bilibili/pause', '/api/bilibili/stop', '/api/bilibili/client-event'].includes(path)) throw new BiliError('接口不存在', 404);
      if (req.method !== 'POST') throw new BiliError('不支持的请求方法', 405);
      let length = 0;
      const chunks: Buffer[] = [];
      for await (const chunk of req) {
        length += chunk.length;
        if (length > 1024) throw new BiliError('请求体过大', 413);
        chunks.push(Buffer.from(chunk));
      }
      let body: unknown;
      try { body = JSON.parse(Buffer.concat(chunks).toString() || '{}'); } catch { throw new BiliError('无效 JSON', 400); }
      if (path.endsWith('/client-event')) {
        const allowedEvents = ['ws.connected', 'ws.reconnecting', 'ws.auth_failed', 'ws.timeout', 'ws.connect_failed', 'sdk.load_failed', 'client.status_failed'];
        const event = body as { event?: unknown; code?: unknown } | null;
        if (!event || typeof event !== 'object' || Array.isArray(event) || Object.keys(event).some((key) => !['event', 'code'].includes(key)) ||
          typeof event.event !== 'string' || !allowedEvents.includes(event.event) ||
          (event.code !== undefined && (typeof event.code !== 'number' || !Number.isSafeInteger(event.code)))) throw new BiliError('无效的诊断事件', 400);
        manager.diagnostic(event.event === 'ws.connected' ? 'info' : 'warn', 'client.event', {
          clientEvent: event.event, clientCode: event.code, reporterTag: createHash('sha256').update(owner).digest('hex').slice(0, 12)
        });
        send(200, { data: { recorded: true } }); return;
      }
      if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).length) throw new BiliError('此接口不接收客户端密钥或参数', 400);
      if (path.endsWith('/start')) send(200, { data: await manager.start(owner) });
      else if (path.endsWith('/pause')) { await manager.pause(owner); send(200, { data: manager.status(owner) }); }
      else { await manager.stop(owner); send(200, { data: { stopped: true } }); }
    })().catch((cause: unknown) => {
      const failure = cause instanceof BiliError ? cause : new BiliError('直播服务内部错误');
      const requestId = failure.requestId ?? randomUUID();
      manager.diagnostic('error', 'local.request_failed', { path, method: req.method, status: failure.status, message: failure.message, upstreamCode: failure.upstreamCode, requestId });
      send(failure.status, { error: failure.message, upstreamCode: failure.upstreamCode, requestId });
    });
  };
}

/** Install the local API for both Vite dev and preview; preview is not a public production API. */
export function bilibiliPlugin(env: Record<string, string | undefined>): Plugin {
  const config: BiliConfig = { accessKeyId: env.BILI_ACCESS_KEY_ID || '', accessKeySecret: env.BILI_ACCESS_KEY_SECRET || '', appId: env.BILI_APP_ID || '', identityCode: env.BILI_IDENTITY_CODE || '' };
  const logger = createDiagnostics({ directory: resolve(process.cwd(), '.data/logs/bilibili') });
  const manager = new BiliSessionManager(config, fetch, logger);
  const ready = () => logger.write('info', 'service.ready', { appId: config.appId, logDirectory: logger.directory });
  const close = async () => { await manager.dispose(); await logger.flush(); };
  return {
    name: 'local-bilibili-api',
    configureServer(server) {
      ready();
      server.middlewares.use(createBiliMiddleware(manager));
      server.httpServer?.once('close', () => void close());
    },
    configurePreviewServer(server) {
      ready();
      server.middlewares.use(createBiliMiddleware(manager));
      server.httpServer.once('close', () => void close());
    }
  };
}
