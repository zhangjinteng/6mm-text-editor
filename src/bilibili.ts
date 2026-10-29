export interface LiveMessage {
  id: string;
  type: 'chat' | 'gift' | 'superchat' | 'guard' | 'entry';
  name: string;
  text: string;
  time: string;
  source?: string;
  avatar?: string;
  role?: 'owner' | 'moderator' | 'member' | '';
  guardLevel?: number;
  price?: number;
  giftName?: string;
  giftCount?: number;
}

export interface LiveStatus {
  configured: boolean;
  appId: string;
  running: boolean;
  retained?: boolean;
  retainedUntil?: string;
  busy: boolean;
  anchor?: { name: string; roomId: number; avatar: string };
  lastHeartbeat?: string;
  error?: string;
}

export interface LiveConnection {
  anchor: NonNullable<LiveStatus['anchor']>;
  websocketInfo: { auth_body: string; wss_link: string[] };
}

interface SocketOptions {
  url: string;
  urlList: string[];
  rid: number;
  uid: number;
  protover: number;
  retry: boolean;
  retryMaxCount: number;
  customAuthParam: { key: string; value: string | number; type: 'string' | 'number' }[];
  onReceivedMessage: (message: unknown) => void;
  onReceiveAuthRes: (response: { code?: number } | { code?: number }[]) => void;
  onHeartBeatReply: () => void;
  onOpen: () => void;
  onClose: () => void;
  onError: () => void;
  onListConnectError: () => void;
}
export interface DanmakuSocket { destroy: () => void }
type SocketConstructor = new (options: SocketOptions) => DanmakuSocket;
declare global { interface Window { DanmakuWebSocket?: SocketConstructor } }

let sdkPromise: Promise<SocketConstructor> | undefined;

/** Load the unmodified SDK supplied in js-demo.zip; no access secret is required by it. */
export function loadDanmakuSdk(): Promise<SocketConstructor> {
  if (window.DanmakuWebSocket) return Promise.resolve(window.DanmakuWebSocket);
  if (!sdkPromise) {
    sdkPromise = new Promise<SocketConstructor>((resolve, reject) => {
      const script = document.createElement('script');
      const timeout = setTimeout(() => { script.remove(); reject(new Error('弹幕 SDK 加载超时')); }, 10000);
      script.src = '/vendor/bilibili/danmaku-websocket.min.js';
      script.onload = () => {
        clearTimeout(timeout);
        if (window.DanmakuWebSocket) resolve(window.DanmakuWebSocket);
        else reject(new Error('弹幕 SDK 初始化失败'));
      };
      script.onerror = () => { clearTimeout(timeout); script.remove(); reject(new Error('弹幕 SDK 加载失败')); };
      document.head.append(script);
    }).catch((cause: unknown) => { sdkPromise = undefined; throw cause; });
  }
  return sdkPromise;
}

/** Map all primitive auth fields, retaining SDK-supported zlib protocol and official server URLs. */
export function socketAuth(connection: LiveConnection) {
  const auth = JSON.parse(connection.websocketInfo.auth_body);
  if (!auth || typeof auth !== 'object' || !auth.key) throw new Error('弹幕认证信息缺少 key');
  return {
    url: connection.websocketInfo.wss_link[0], urlList: connection.websocketInfo.wss_link,
    rid: Number(auth.roomid) || 0, uid: Number(auth.uid) || 0,
    protover: 2, retry: true, retryMaxCount: 3,
    customAuthParam: Object.entries(auth)
      .filter(([key, value]) => !['uid', 'roomid', 'protover', 'protoover'].includes(key) && (typeof value === 'string' || typeof value === 'number'))
      .map(([key, value]) => ({ key, value: value as string | number, type: (typeof value === 'number' ? 'number' : 'string') as 'number' | 'string' }))
  };
}

/** Only expose useful event text; raw protocol payloads and HTML never enter the document. */
export function normalizeMessage(value: unknown): LiveMessage | null {
  if (!value || typeof value !== 'object') return null;
  const message = value as { cmd?: unknown; data?: Record<string, unknown> };
  if (!message.data || typeof message.data !== 'object') return null;
  const data = { ...message.data };
  let text: string;
  let type: LiveMessage['type'];
  switch (message.cmd) {
    case 'LIVE_OPEN_PLATFORM_DM': type = 'chat'; text = String(data.msg || ''); break;
    case 'LIVE_OPEN_PLATFORM_SUPER_CHAT': type = 'superchat'; text = String(data.message || ''); break;
    case 'LIVE_OPEN_PLATFORM_SEND_GIFT': type = 'gift'; text = `赠送 ${String(data.gift_name || '礼物')} × ${Number(data.gift_num) || 1}`; break;
    case 'LIVE_OPEN_PLATFORM_GUARD': {
      type = 'guard';
      const user = data.user_info;
      if (user && typeof user === 'object') data.uname ??= (user as { uname?: unknown }).uname;
      text = '开通大航海'; break;
    }
    default: return null;
  }
  if (!text) return null;
  const seconds = Number(data.timestamp || data.start_time);
  const timestamp = Number.isFinite(seconds) && seconds > 0 && seconds < 1e11 ? seconds * 1000 : Date.now();
  const guardLevel = Number(data.guard_level) || 0;
  const avatar = typeof data.uface === 'string' ? data.uface : '';
  const price = Number(data.price ?? data.rmb);
  return {
    avatar: /^https?:\/\//.test(avatar) ? avatar : '',
    role: data.is_anchor === true ? 'owner' : data.is_admin === true ? 'moderator' : guardLevel > 0 ? 'member' : '',
    guardLevel,
    price: Number.isFinite(price) && price >= 0 ? price : undefined,
    giftName: type === 'gift' ? String(data.gift_name || '礼物').slice(0, 100) : undefined,
    giftCount: type === 'gift' ? Math.max(1, Number(data.gift_num) || 1) : undefined,
    id: typeof data.msg_id === 'string' && data.msg_id ? data.msg_id : crypto.randomUUID(),
    name: String(data.uname || '观众').slice(0, 80), type, text: text.slice(0, 2000),
    time: new Date(timestamp).toLocaleTimeString('zh-CN', { hour12: false })
  };
}

/** Status reads renew presence only while this browser is receiving, not while paused or failed. */
export async function biliRequest<T>(action: 'status' | 'start' | 'pause' | 'stop', keepalive = false, receiving = true): Promise<T> {
  const response = await fetch(`/api/bilibili/${action}`, {
    method: action === 'status' ? 'GET' : 'POST', credentials: 'same-origin', keepalive,
    headers: { 'Content-Type': 'application/json', 'X-Editor-Request': '1', 'X-Editor-Receiving': receiving ? '1' : '0' },
    body: action === 'status' ? undefined : '{}', signal: AbortSignal.timeout(20000)
  });
  const result = await response.json().catch(() => { throw new Error('直播服务没有返回 JSON，请确认使用 pnpm dev 启动'); });
  if (!response.ok) throw new Error(result.error || `直播请求失败 (${response.status})`);
  return result.data as T;
}

export type BiliClientEvent = 'ws.connected' | 'ws.reconnecting' | 'ws.auth_failed' | 'ws.timeout' | 'ws.connect_failed' | 'sdk.load_failed' | 'client.status_failed';

/** Send only whitelisted event names/numeric codes, never socket frames, tokens, or message text. */
export function reportBiliEvent(event: BiliClientEvent, code?: number) {
  void fetch('/api/bilibili/client-event', {
    method: 'POST', credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', 'X-Editor-Request': '1' },
    body: JSON.stringify({ event, code: Number.isSafeInteger(code) ? code : undefined }),
    signal: AbortSignal.timeout(5000)
  }).then((response) => { if (!response.ok) throw new Error('Diagnostic delivery failed'); })
    .catch(() => console.warn('[bilibili] diagnostic delivery failed:', event));
}
