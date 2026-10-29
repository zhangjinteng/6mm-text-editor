import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createDiagnostics } from './diagnostics.ts';
import { createHash, createHmac } from 'node:crypto';
import { createServer, request as httpRequest } from 'node:http';
import { test } from 'node:test';
import { BiliError, BiliSessionManager, createBiliMiddleware, signRequest, type BiliConfig } from './bilibili.ts';
import type { Diagnostics, LogFields } from './diagnostics.ts';

const config: BiliConfig = { accessKeyId: 'test-key', accessKeySecret: 'test-secret', appId: '1234567890123', identityCode: 'test-identity' };
const success = {
  game_info: { game_id: 'test-game' },
  websocket_info: { auth_body: '{"key":"temporary-auth","roomid":100}', wss_link: ['wss://broadcastlv.chat.bilibili.com/sub'] },
  anchor_info: { uname: '测试主播', room_id: 100 }
};

test('signs exact bytes with sorted official headers', () => {
  const body = JSON.stringify({ code: '中文', app_id: 123 });
  const headers = signRequest(body, config, 1700000000, 'fixed-nonce');
  assert.equal(headers['x-bili-content-md5'], createHash('md5').update(body).digest('hex'));
  const canonical = Object.entries(headers).filter(([key]) => key.startsWith('x-bili-')).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}:${value}`).join('\n');
  assert.equal(headers.Authorization, createHmac('sha256', config.accessKeySecret).update(canonical).digest('hex'));
});

test('concurrent starts reuse one session, enforce ownership, and end once', async () => {
  const paths: string[] = [];
  const manager = new BiliSessionManager(config, async (url, options) => {
    paths.push(String(url));
    assert.equal(options?.redirect, 'error');
    if (String(url).endsWith('/start')) {
      assert.deepEqual(JSON.parse(String(options?.body)), { code: config.identityCode, app_id: Number(config.appId) });
      return Response.json({ code: 0, data: success });
    }
    return Response.json({ code: 0, data: {} });
  });
  try {
    const [one, two] = await Promise.all([manager.start('one'), manager.start('one')]);
    assert.deepEqual(one, two);
    assert.equal(paths.length, 1);
    await assert.rejects(manager.start('two'), (error: unknown) => error instanceof BiliError && error.status === 409);
    await assert.rejects(manager.stop('two'), (error: unknown) => error instanceof BiliError && error.status === 403);
    await assert.rejects(manager.pause('two'), (error: unknown) => error instanceof BiliError && error.status === 403);
    await Promise.all([manager.stop('one'), manager.stop('one')]);
    assert.equal(paths.filter((path) => path.endsWith('/end')).length, 1);
    assert.equal(manager.status('one').running, false);
  } finally { await manager.dispose(); }
});

test('upstream errors preserve codes while redacting credentials', async () => {
  const manager = new BiliSessionManager(config, async () => Response.json({ code: 7003, message: `denied ${config.accessKeySecret} ${config.identityCode}` }));
  await assert.rejects(manager.start('one'), (error: unknown) => {
    assert.ok(error instanceof BiliError);
    assert.equal(error.upstreamCode, 7003);
    assert.ok(!error.message.includes(config.accessKeySecret));
    assert.ok(!error.message.includes(config.identityCode));
    return true;
  });
  await manager.dispose();
});

test('stop during an in-flight start leaves no orphaned session', async () => {
  let complete: (value: Response) => void = () => undefined;
  const response = new Promise<Response>((resolve) => { complete = resolve; });
  const paths: string[] = [];
  const manager = new BiliSessionManager(config, async (url) => {
    paths.push(String(url));
    return String(url).endsWith('/start') ? response : Response.json({ code: 0, data: {} });
  });
  const start = manager.start('one');
  const stop = manager.stop('one');
  complete(Response.json({ code: 0, data: success }));
  await Promise.all([start, stop]);
  assert.equal(manager.status('one').running, false);
  assert.equal(paths.filter((path) => path.endsWith('/end')).length, 1);
  await manager.dispose();
});

test('game heartbeats run every twenty seconds and abandoned sessions expire at ten minutes', async (context) => {
  context.mock.timers.enable({ apis: ['Date', 'setInterval', 'setTimeout'], now: new Date('2026-01-01T00:00:00Z') });
  const paths: string[] = [];
  const manager = new BiliSessionManager(config, async (url) => {
    paths.push(String(url));
    return Response.json({ code: 0, data: String(url).endsWith('/start') ? success : {} });
  });
  try {
    await manager.start('one');
    for (let i = 0; i < 30; i++) {
      context.mock.timers.tick(20000);
      await new Promise<void>((resolve) => setImmediate(resolve));
    }
    assert.equal(paths.filter((path) => path.endsWith('/heartbeat')).length, 29);
    assert.equal(paths.filter((path) => path.endsWith('/end')).length, 1);
    assert.equal(manager.status('one').running, false);
  } finally { await manager.dispose(); context.mock.timers.reset(); }
});

test('paused polling and repeated pauses never extend the ten-minute deadline', async (context) => {
  context.mock.timers.enable({ apis: ['Date', 'setInterval', 'setTimeout'], now: new Date('2026-01-01T00:00:00Z') });
  const paths: string[] = [];
  const manager = new BiliSessionManager(config, async (url) => {
    paths.push(String(url));
    return Response.json({ code: 0, data: String(url).endsWith('/start') ? success : {} });
  });
  try {
    await manager.start('one');
    context.mock.timers.tick(5000);
    await manager.pause('one');
    const until = manager.status('one').retainedUntil;
    assert.equal(until, '2026-01-01T00:10:05.000Z');
    for (let i = 0; i < 29; i++) {
      context.mock.timers.tick(20000);
      await new Promise<void>((resolve) => setImmediate(resolve));
      await manager.pause('one');
      assert.equal(manager.status('one').retainedUntil, until);
      assert.equal(manager.status('one').retained, true);
      assert.equal(manager.status('one').running, false);
    }
    context.mock.timers.tick(19999);
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.equal(paths.filter((path) => path.endsWith('/end')).length, 0);
    assert.equal(manager.status('one').retained, true);
    context.mock.timers.tick(1);
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.equal(paths.filter((path) => path.endsWith('/end')).length, 1);
    assert.equal(manager.status('one').retained, false);
    assert.ok(paths.filter((path) => path.endsWith('/heartbeat')).length >= 29);
  } finally { await manager.dispose(); context.mock.timers.reset(); }
});

test('active presence keeps a session past ten minutes and fast resumes never create again', async (context) => {
  context.mock.timers.enable({ apis: ['Date', 'setInterval', 'setTimeout'], now: new Date('2026-01-01T00:00:00Z') });
  const paths: string[] = [];
  const manager = new BiliSessionManager(config, async (url) => {
    paths.push(String(url));
    return Response.json({ code: 0, data: String(url).endsWith('/start') ? success : {} });
  });
  try {
    await manager.start('one');
    for (let i = 0; i < 3; i++) { await manager.pause('one'); await manager.start('one'); }
    assert.equal(paths.length, 1);
    for (let i = 0; i < 60; i++) {
      context.mock.timers.tick(20000);
      await new Promise<void>((resolve) => setImmediate(resolve));
      assert.equal(manager.status('one').running, true);
    }
    assert.equal(paths.filter((path) => path.endsWith('/start')).length, 1);
    assert.equal(paths.filter((path) => path.endsWith('/end')).length, 0);
    await manager.pause('one');
    await manager.stop('one');
    assert.equal(paths.filter((path) => path.endsWith('/end')).length, 1);
    assert.equal(manager.status('one').retained, false);
  } finally { await manager.dispose(); context.mock.timers.reset(); }
});

test('concurrent resumes validate stale retained credentials with one heartbeat', async (context) => {
  context.mock.timers.enable({ apis: ['Date', 'setInterval', 'setTimeout'], now: new Date('2026-01-01T00:00:00Z') });
  const paths: string[] = [];
  let complete: (response: Response) => void = () => undefined;
  const response = new Promise<Response>((resolve) => { complete = resolve; });
  const manager = new BiliSessionManager(config, async (url) => {
    paths.push(String(url));
    return String(url).endsWith('/heartbeat') ? response : Response.json({ code: 0, data: String(url).endsWith('/start') ? success : {} });
  });
  try {
    await manager.start('one');
    await manager.pause('one');
    context.mock.timers.setTime(Date.now() + 60000);
    const one = manager.start('one');
    const two = manager.start('one');
    const intruder = assert.rejects(manager.start('two'), (error: unknown) => error instanceof BiliError && error.status === 409);
    complete(Response.json({ code: 0, data: {} }));
    assert.deepEqual(await one, await two);
    await intruder;
    assert.equal(paths.filter((path) => path.endsWith('/start')).length, 1);
    assert.equal(paths.filter((path) => path.endsWith('/heartbeat')).length, 1);
    assert.equal(manager.status('one').running, true);
    assert.equal(manager.status('one').retained, false);
  } finally { await manager.dispose(); context.mock.timers.reset(); }
});

test('transient heartbeat failures retain the session and validation never creates a duplicate', async (context) => {
  context.mock.timers.enable({ apis: ['Date', 'setInterval', 'setTimeout'], now: new Date('2026-01-01T00:00:00Z') });
  const paths: string[] = [];
  let failing = true;
  const manager = new BiliSessionManager(config, async (url) => {
    paths.push(String(url));
    if (String(url).endsWith('/heartbeat') && failing) return Response.json({ code: 4009, message: '接口访问限制' });
    return Response.json({ code: 0, data: String(url).endsWith('/start') ? success : {} });
  });
  try {
    await manager.start('one');
    await manager.pause('one');
    const until = manager.status('one').retainedUntil;
    for (let i = 0; i < 3; i++) { context.mock.timers.tick(20000); await new Promise<void>((resolve) => setImmediate(resolve)); }
    assert.equal(manager.status('one').retained, true);
    await assert.rejects(manager.start('one'), (error: unknown) => error instanceof BiliError && error.upstreamCode === 4009);
    await assert.rejects(manager.start('one'), (error: unknown) => error instanceof BiliError && error.upstreamCode === 4009);
    assert.equal(paths.filter((path) => path.endsWith('/heartbeat')).length, 3);
    assert.equal(manager.status('one').retainedUntil, until);
    assert.equal(paths.filter((path) => path.endsWith('/start')).length, 1);
    assert.equal(paths.filter((path) => path.endsWith('/end')).length, 0);
    failing = false;
    context.mock.timers.tick(20000);
    await new Promise<void>((resolve) => setImmediate(resolve));
    await manager.start('one');
    assert.equal(manager.status('one').running, true);
    assert.equal(manager.status('one').error, '');
    assert.equal(paths.filter((path) => path.endsWith('/start')).length, 1);
  } finally { await manager.dispose(); context.mock.timers.reset(); }
});

test('status reads from an idle or failed browser cannot indefinitely renew an unpaused session', async (context) => {
  context.mock.timers.enable({ apis: ['Date', 'setInterval', 'setTimeout'], now: new Date('2026-01-01T00:00:00Z') });
  const paths: string[] = [];
  const manager = new BiliSessionManager(config, async (url) => {
    paths.push(String(url));
    return Response.json({ code: 0, data: String(url).endsWith('/start') ? success : {} });
  });
  try {
    await manager.start('one');
    for (let i = 0; i < 30; i++) {
      context.mock.timers.tick(20000);
      await new Promise<void>((resolve) => setImmediate(resolve));
      manager.status('one', false);
    }
    assert.equal(paths.filter((path) => path.endsWith('/end')).length, 1);
    assert.equal(manager.status('one').running, false);
  } finally { await manager.dispose(); context.mock.timers.reset(); }
});

test('definitively expired retained sessions are discarded before a single replacement start', async (context) => {
  context.mock.timers.enable({ apis: ['Date', 'setInterval', 'setTimeout'], now: new Date('2026-01-01T00:00:00Z') });
  const paths: string[] = [];
  const manager = new BiliSessionManager(config, async (url) => {
    paths.push(String(url));
    if (String(url).endsWith('/heartbeat')) return Response.json({ code: 7003, message: '心跳过期' });
    return Response.json({ code: 0, data: String(url).endsWith('/start') ? success : {} });
  });
  try {
    await manager.start('one');
    await manager.pause('one');
    context.mock.timers.setTime(Date.now() + 60000);
    await Promise.all([manager.start('one'), manager.start('one')]);
    assert.equal(paths.filter((path) => path.endsWith('/heartbeat')).length, 1);
    assert.equal(paths.filter((path) => path.endsWith('/start')).length, 2);
    assert.equal(manager.status('one').running, true);
  } finally { await manager.dispose(); context.mock.timers.reset(); }
});

test('a resume started before expiry cancels reclamation even if validation finishes after expiry', async (context) => {
  context.mock.timers.enable({ apis: ['Date', 'setInterval', 'setTimeout'], now: new Date('2026-01-01T00:00:00Z') });
  const paths: string[] = [];
  let complete: (response: Response) => void = () => undefined;
  const response = new Promise<Response>((resolve) => { complete = resolve; });
  const manager = new BiliSessionManager(config, async (url) => {
    paths.push(String(url));
    return String(url).endsWith('/heartbeat') ? response : Response.json({ code: 0, data: String(url).endsWith('/start') ? success : {} });
  });
  try {
    await manager.start('one');
    await manager.pause('one');
    context.mock.timers.tick(599000);
    const resume = manager.start('one');
    context.mock.timers.tick(1001);
    complete(Response.json({ code: 0, data: {} }));
    await resume;
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.equal(paths.filter((path) => path.endsWith('/end')).length, 0);
    assert.equal(paths.filter((path) => path.endsWith('/start')).length, 1);
    assert.equal(manager.status('one').running, true);
  } finally { await manager.dispose(); context.mock.timers.reset(); }
});

test('pause during an in-flight start keeps one retained session rather than ending it', async () => {
  let complete: (response: Response) => void = () => undefined;
  const response = new Promise<Response>((resolve) => { complete = resolve; });
  const paths: string[] = [];
  const manager = new BiliSessionManager(config, async (url) => {
    paths.push(String(url));
    return String(url).endsWith('/start') ? response : Response.json({ code: 0, data: {} });
  });
  try {
    const start = manager.start('one');
    const pause = manager.pause('one');
    complete(Response.json({ code: 0, data: success }));
    await Promise.all([start, pause]);
    assert.equal(manager.status('one').retained, true);
    assert.equal(manager.status('one').running, false);
    assert.equal(paths.filter((path) => path.endsWith('/end')).length, 0);
  } finally { await manager.dispose(); }
});

test('bad upstream socket hosts are rejected and allocated games are cleaned up', async () => {
  const paths: string[] = [];
  const manager = new BiliSessionManager(config, async (url) => {
    paths.push(String(url));
    return Response.json({ code: 0, data: String(url).endsWith('/start') ? { ...success, websocket_info: { ...success.websocket_info, wss_link: ['ws://127.0.0.1/internal'] } } : {} });
  });
  await assert.rejects(manager.start('one'), /未返回有效/);
  assert.ok(paths.some((path) => path.endsWith('/end')));
  await manager.dispose();
});

test('middleware rejects cross-origin, rebinding, oversized and credential-bearing requests', async () => {
  const records: { event: string; fields?: LogFields }[] = [];
  const logger: Diagnostics = { protect: () => undefined, write: (_level, event, fields) => records.push({ event, fields }) };
  const manager = new BiliSessionManager(config, async () => Response.json({ code: 0, data: success }), logger);
  const middleware = createBiliMiddleware(manager);
  const server = createServer((req, res) => middleware(req, res, () => { res.statusCode = 404; res.end(); }));
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const url = `http://127.0.0.1:${address.port}`;
  try {
    const status = await fetch(`${url}/api/bilibili/status`);
    const body = await status.text();
    assert.ok(status.headers.get('set-cookie')?.includes('HttpOnly'));
    assert.ok(!body.includes(config.accessKeyId));
    assert.ok(!body.includes(config.identityCode));
    assert.equal((await fetch(`${url}/api/bilibili/start`, { method: 'POST', headers: { Origin: 'https://evil.example' } })).status, 403);
    const reboundStatus = await new Promise<number | undefined>((resolve, reject) => {
      const request = httpRequest(`${url}/api/bilibili/status`, { headers: { Host: 'evil.example' } }, (response) => { response.resume(); resolve(response.statusCode); });
      request.on('error', reject); request.end();
    });
    assert.equal(reboundStatus, 403);
    assert.equal((await fetch(`${url}/api/bilibili/start`, { method: 'POST', body: '{}' })).status, 403);
    const headers = { 'Content-Type': 'application/json', 'X-Editor-Request': '1', Origin: url };
    assert.equal((await fetch(`${url}/api/bilibili/start`, { method: 'POST', headers, body: JSON.stringify({ secret: 'never-accept' }) })).status, 400);
    assert.equal((await fetch(`${url}/api/bilibili/start`, { method: 'POST', headers, body: JSON.stringify({ huge: 'x'.repeat(2000) }) })).status, 413);
    const invalidEvent = await fetch(`${url}/api/bilibili/client-event`, { method: 'POST', headers, body: JSON.stringify({ event: 'ws.auth_failed', token: 'do-not-log-this' }) });
    assert.equal(invalidEvent.status, 400);
    const failure = await invalidEvent.json();
    assert.equal(typeof failure.requestId, 'string');
    assert.ok(records.some((record) => record.event === 'local.request_failed' && record.fields?.requestId === failure.requestId));
    assert.equal((await fetch(`${url}/api/bilibili/client-event`, { method: 'POST', headers, body: JSON.stringify({ event: 'ws.auth_failed', code: -101 }) })).status, 200);
    assert.ok(records.some((record) => record.event === 'client.event' && record.fields?.clientCode === -101));
    assert.ok(!JSON.stringify(records).includes('do-not-log-this'));
  } finally {
    await manager.dispose();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test('pause API retains only its browser owner session and explicit stop ends it', async () => {
  const paths: string[] = [];
  const manager = new BiliSessionManager(config, async (url) => {
    paths.push(String(url));
    return Response.json({ code: 0, data: String(url).endsWith('/start') ? success : {} });
  });
  const middleware = createBiliMiddleware(manager);
  const server = createServer((req, res) => middleware(req, res, () => { res.statusCode = 404; res.end(); }));
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  const url = `http://127.0.0.1:${address.port}`;
  try {
    const status = await fetch(`${url}/api/bilibili/status`);
    const cookie = status.headers.get('set-cookie')!.split(';')[0];
    await status.arrayBuffer();
    const headers = { 'Content-Type': 'application/json', 'X-Editor-Request': '1', Cookie: cookie, Origin: url };
    const start = await fetch(`${url}/api/bilibili/start`, { method: 'POST', headers, body: '{}' });
    assert.equal(start.status, 200); await start.arrayBuffer();
    const paused = await fetch(`${url}/api/bilibili/pause`, { method: 'POST', headers, body: '{}' });
    assert.equal(paused.status, 200);
    const data = (await paused.json()).data;
    assert.equal(data.running, false); assert.equal(data.retained, true);
    assert.equal(typeof data.retainedUntil, 'string');
    assert.equal(JSON.stringify(data).includes('temporary-auth'), false);
    const intruder = await fetch(`${url}/api/bilibili/pause`, { method: 'POST', headers: { ...headers, Cookie: '' }, body: '{}' });
    assert.equal(intruder.status, 403); await intruder.arrayBuffer();
    const resumed = await fetch(`${url}/api/bilibili/start`, { method: 'POST', headers, body: '{}' });
    assert.equal(resumed.status, 200); await resumed.arrayBuffer();
    assert.equal(paths.filter((path) => path.endsWith('/start')).length, 1);
    assert.equal(paths.filter((path) => path.endsWith('/end')).length, 0);
    const stop = await fetch(`${url}/api/bilibili/stop`, { method: 'POST', headers, body: '{}' });
    assert.equal(stop.status, 200); await stop.arrayBuffer();
    assert.equal(paths.filter((path) => path.endsWith('/end')).length, 1);
  } finally { await manager.dispose(); await new Promise<void>((resolve) => server.close(() => resolve())); }
});

test('4009 heartbeat diagnostics include endpoint, request IDs, timing and recovery', async (context) => {
  context.mock.timers.enable({ apis: ['Date', 'setInterval', 'setTimeout'], now: new Date('2026-10-28T10:00:00Z') });
  const records: { level: string; event: string; fields?: LogFields }[] = [];
  let heartbeats = 0;
  const manager = new BiliSessionManager(config, async (url) => {
    if (String(url).endsWith('/heartbeat') && ++heartbeats === 1) return Response.json({ code: 4009, message: '接口访问限制' }, { headers: { 'x-request-id': 'upstream-one', 'retry-after': '20' } });
    return Response.json({ code: 0, data: String(url).endsWith('/start') ? success : {} });
  }, { protect: () => undefined, write: (level, event, fields) => records.push({ level, event, fields }) });
  try {
    await manager.start('one');
    for (let i = 0; i < 2; i++) { context.mock.timers.tick(20000); await new Promise<void>((resolve) => setImmediate(resolve)); }
    const error = records.find((record) => record.event === 'upstream.request_failed');
    assert.equal(error?.fields?.path, '/v2/app/heartbeat');
    assert.equal(error?.fields?.upstreamCode, 4009);
    assert.equal(error?.fields?.httpStatus, 200);
    assert.equal(error?.fields?.upstreamRequestId, 'upstream-one');
    assert.equal(error?.fields?.retryAfter, '20');
    assert.equal(typeof error?.fields?.requestId, 'string');
    assert.equal(error?.fields?.phase, 'business');
    assert.equal(error?.fields?.durationMs, 0);
    const failed = records.find((record) => record.event === 'heartbeat.failed');
    assert.equal(failed?.fields?.failureCount, 1);
    assert.equal(failed?.fields?.requestId, error?.fields?.requestId);
    assert.ok(records.some((record) => record.event === 'heartbeat.recovered' && record.fields?.previousFailureCount === 1));
    assert.ok(records.some((record) => record.event === 'upstream.request_succeeded' && record.fields?.path === '/v2/app/heartbeat' && record.fields?.sincePreviousRequestMs === 20000));
    assert.ok(!JSON.stringify(records).includes('temporary-auth'));
    assert.ok(!JSON.stringify(records).includes('test-game'));
  } finally { await manager.dispose(); context.mock.timers.reset(); }
});

test('network, HTTP and malformed JSON failures have distinguishable diagnostics', async () => {
  const cases = [
    { phase: 'transport', fetcher: async () => { throw Object.assign(new TypeError('fetch failed'), { cause: { code: 'ECONNRESET' } }); } },
    { phase: 'http', fetcher: async () => new Response('do-not-log-response-body', { status: 503 }) },
    { phase: 'parse', fetcher: async () => new Response('invalid-auth-body-secret', { status: 200 }) }
  ];
  for (const item of cases) {
    const records: LogFields[] = [];
    const manager = new BiliSessionManager(config, item.fetcher, { protect: () => undefined, write: (_level, event, fields) => { if (event === 'upstream.request_failed') records.push(fields!); } });
    try { await assert.rejects(manager.start('one')); }
    finally { await manager.dispose(); }
    assert.equal(records.length, 1);
    assert.equal(records[0].phase, item.phase);
    if (item.phase === 'transport') assert.equal(records[0].transportCode, 'ECONNRESET');
    assert.ok(!JSON.stringify(records).includes('do-not-log-response-body'));
    assert.ok(!JSON.stringify(records).includes('invalid-auth-body-secret'));
  }
});


test('4009 evidence correlates game, config, request rate, clock and recovery without leaking credentials', async (context) => {
  context.mock.timers.enable({ apis: ['Date', 'setInterval', 'setTimeout'], now: new Date('2026-10-30T10:00:00Z') });
  const directory = await mkdtemp(join(tmpdir(), 'bili-4009-'));
  const consoleLines: string[] = [];
  const logger = createDiagnostics({ directory, console: (line) => consoleLines.push(line) });
  let heartbeats = 0;
  let endings = 0;
  const manager = new BiliSessionManager(config, async (url) => {
    const path = String(url);
    if ((path.endsWith('/heartbeat') && ++heartbeats <= 2) || (path.endsWith('/end') && ++endings === 1)) {
      return Response.json({ code: 4009, message: `接口访问限制 ${config.accessKeyId} ${config.identityCode} ${config.accessKeySecret} test-game`, request_id: 'body-trace', data: { token: 'never-log-error-data' } }, {
        headers: { 'x-request-id': 'header-request', 'x-bili-trace-id': 'header-trace', 'retry-after': '20', date: 'Fri, 30 Oct 2026 10:00:20 GMT', 'set-cookie': 'never-log-cookie' }
      });
    }
    return Response.json({ code: 0, data: path.endsWith('/start') ? success : {} });
  }, logger);
  try {
    await manager.start('browser-owner');
    for (let i = 0; i < 3; i++) {
      context.mock.timers.tick(20000);
      await new Promise<void>((resolve) => setImmediate(resolve));
    }
    await assert.rejects(manager.stop('browser-owner'));
    await manager.stop('browser-owner');
    await logger.flush();
    const text = await readFile(join(directory, 'bilibili-2026-10-30.jsonl'), 'utf8');
    const rows = text.trim().split('\n').map((line) => JSON.parse(line));
    const failures = rows.filter((row) => row.event === 'upstream.request_failed').map((row) => row.details);
    assert.equal(failures.length, 3);
    const first = failures[0];
    const second = failures[1];
    assert.equal(first.requestContext.gameMatchesSession, true);
    assert.equal(first.requestContext.gameTag, first.sessionTag);
    const started = rows.find((row) => row.event === 'upstream.request_succeeded' && row.details.path.endsWith('/start')).details;
    assert.equal(started.returnedGameTag, first.sessionTag);
    assert.equal(started.requestContext.credentialTag, first.requestContext.credentialTag);
    assert.equal(started.requestContext.broadcasterTag, first.requestContext.broadcasterTag);
    assert.deepEqual(first.requestContext.parameterNames, ['game_id']);
    assert.equal(first.requestContext.sessionAgeMs, 20000);
    assert.equal(first.requestContext.lastHeartbeat, null);
    assert.equal(first.requestContext.clientIdleMs, 20000);
    assert.equal(first.requestContext.signedTimestamp, String(Date.parse('2026-10-30T10:00:20Z') / 1000));
    assert.deepEqual(first.requestContext.recentRequests60s, { start: 1, heartbeat: 1, end: 0 });
    assert.equal(first.sinceAnyRequestMs, 20000);
    assert.equal(first.endpointFailures, 1);
    assert.equal(second.endpointFailures, 2);
    assert.equal(first.firstEndpointFailureAt, second.firstEndpointFailureAt);
    assert.equal(first.lastEndpointSuccessAt, null);
    assert.equal(first.restrictionReason, 'upstream_unspecified_access_restriction');
    assert.equal(first.responseContext.requestIdHeader, 'header-request');
    assert.equal(first.responseContext.traceIdHeader, 'header-trace');
    assert.equal(first.responseContext.bodyRequestId, 'body-trace');
    assert.equal(first.responseContext.serverClockOffsetMs, 0);
    assert.equal(first.retryAfter, '20');
    assert.ok(rows.some((row) => row.event === 'upstream.request_succeeded' && row.details.path.endsWith('/heartbeat') && row.details.recoveredFromFailures === 2));
    assert.equal(failures[2].path, '/v2/app/end');
    assert.equal(failures[2].requestContext.requestAppId, Number(config.appId));
    assert.equal(failures[2].requestContext.sinceHeartbeatMs, 0);
    for (const secret of [config.accessKeyId, config.accessKeySecret, config.identityCode, 'test-game', 'temporary-auth', 'browser-owner', 'never-log-error-data', 'never-log-cookie']) {
      assert.ok(!text.includes(secret), secret);
      assert.ok(!consoleLines.join('\n').includes(secret), secret);
    }
  } finally {
    await manager.dispose();
    await logger.flush();
    context.mock.timers.reset();
    await rm(directory, { recursive: true, force: true });
  }
});
