import type { Page } from '@playwright/test';
import { deflateSync } from 'node:zlib';

/** Fake only the upstream wire format, exercising the actual bundled Bilibili SDK. */
export function frame(operation: number, body: string | Buffer, version = 1) {
  const data = typeof body === 'string' ? Buffer.from(body) : body;
  const packet = Buffer.alloc(16 + data.length);
  packet.writeUInt32BE(packet.length, 0); packet.writeUInt16BE(16, 4);
  packet.writeUInt16BE(version, 6); packet.writeUInt32BE(operation, 8); packet.writeUInt32BE(1, 12);
  data.copy(packet, 16);
  return packet;
}

export async function mockPlatform(page: Page, failure = false) {
  let running = false;
  let retained = false;
  let retainedUntil: string | undefined;
  const commands: string[] = [];
  await page.route('**/api/bilibili/**', async (route) => {
    const action = route.request().url().split('/').pop()!;
    commands.push(action);
    if (action === 'start' && failure) {
      await route.fulfill({ status: 502, json: { error: 'B 站返回 7003：应用尚未上线', upstreamCode: 7003 } }); return;
    }
    if (action === 'start') { running = true; retained = false; retainedUntil = undefined; }
    if (action === 'pause') { running = false; retained = true; retainedUntil ??= new Date(Date.now() + 600000).toISOString(); }
    if (action === 'stop') { running = false; retained = false; retainedUntil = undefined; }
    await route.fulfill({ json: { data: action === 'start' ? {
      anchor: { name: '测试主播', roomId: 100, avatar: '' },
      websocketInfo: { auth_body: '{"uid":0,"roomid":100,"key":"test-auth","group":"test-group"}', wss_link: ['wss://broadcastlv.chat.bilibili.com/sub'] }
    } : action === 'stop' ? { stopped: true } : { configured: true, appId: '1234567890123', running, retained, retainedUntil, busy: false } } });
  });
  await page.routeWebSocket('wss://broadcastlv.chat.bilibili.com/sub', (socket) => {
    let sent = false;
    socket.onMessage((message) => {
      const packet = typeof message === 'string' ? Buffer.from(message) : message;
      const op = packet.readUInt32BE(8);
      if (op === 7) socket.send(frame(8, '{"code":0}'));
      if (op === 2) {
        const count = Buffer.alloc(4); count.writeUInt32BE(100);
        socket.send(frame(3, count));
        if (!sent) {
          sent = true;
          const packets = Buffer.concat([
            frame(5, JSON.stringify({ cmd: 'LIVE_OPEN_PLATFORM_DM', data: { msg_id: 'one', uname: '小白', msg: '第一条真实协议弹幕', timestamp: 1700000000 } })),
            frame(5, JSON.stringify({ cmd: 'LIVE_OPEN_PLATFORM_SUPER_CHAT', data: { msg_id: 'two', uname: '<script>名字</script>', message: '<img src=x onerror=alert(1)>', timestamp: 1700000001 } }))
          ]);
          socket.send(frame(5, deflateSync(packets), 2));
        }
      }
    });
  });
  return commands;
}

