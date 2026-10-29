import { expect, test } from '@playwright/test';
import { frame, mockPlatform } from './helpers/platform';
import { normalizeMessage } from '../src/bilibili';

test('message adapter ignores unrelated events and limits payload size', () => {
  expect(normalizeMessage({ cmd: 'unknown', data: {} })).toBeNull();
  const message = normalizeMessage({ cmd: 'LIVE_OPEN_PLATFORM_DM', data: { uname: 'x'.repeat(200), msg: 'x'.repeat(5000) } });
  expect(message?.name).toHaveLength(80);
  expect(message?.text).toHaveLength(2000);
});

test('official SDK decodes messages, pauses/resumes, and explicitly ends the session', async ({ page }) => {
  const commands = await mockPlatform(page);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(page.getByRole('button', { name: '直播弹幕', exact: true })).toHaveClass('selected');
  await page.getByRole('button', { name: '连接直播间' }).click();
  await expect(page.locator('.live-state strong')).toHaveText('已连接');
  await expect.poll(() => commands.filter((action) => action === 'client-event').length).toBeGreaterThan(0);
  await expect(page.locator('.live-message')).toHaveCount(2);
  await page.getByRole('textbox', { name: '搜索弹幕' }).fill('第一条');
  await expect(page.locator('.live-message')).toHaveCount(1);
  await page.getByRole('textbox', { name: '搜索弹幕' }).fill('');
  await page.getByRole('checkbox', { name: '选择 小白 的消息' }).check();
  await page.getByRole('checkbox', { name: '选择 <script>名字</script> 的消息' }).check();
  await page.getByRole('button', { name: '插入选中 2' }).click();
  const body = page.frameLocator('.tox-edit-area iframe').locator('body');
  await expect(body).toContainText('第一条真实协议弹幕');
  await expect(body).toContainText('<img src=x onerror=alert(1)>');
  await expect(body.locator('script,img[onerror]')).toHaveCount(0);
  await page.screenshot({ path: 'screenshots/bilibili-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'screenshots/bilibili-mobile.png', fullPage: true });
  await page.getByRole('button', { name: '收起直播弹幕' }).click();
  expect(commands.filter((action) => action === 'stop')).toHaveLength(0);
  await page.getByRole('button', { name: '直播弹幕', exact: true }).click();
  await page.getByRole('button', { name: '暂停接收' }).click();
  await expect(page.locator('.live-state strong')).toHaveText('已暂停');
  await expect(page.locator('.live-session-actions')).toContainText('保留至');
  expect(commands.filter((action) => action === 'start')).toHaveLength(1);
  expect(commands.filter((action) => action === 'pause')).toHaveLength(1);
  expect(commands.filter((action) => action === 'stop')).toHaveLength(0);
  await page.screenshot({ path: 'screenshots/bilibili-paused-mobile.png', fullPage: true });
  await page.getByRole('button', { name: '恢复接收' }).click();
  await expect(page.locator('.live-state strong')).toHaveText('已连接');
  await page.getByRole('button', { name: '结束场次', exact: true }).click();
  await expect(page.locator('.live-state strong')).toHaveText('未连接');
  expect(commands.filter((action) => action === 'stop')).toHaveLength(1);
  expect(errors).toEqual([]);
});

test('paused sessions survive refresh and polling without automatically reconnecting', async ({ page }) => {
  const commands = await mockPlatform(page);
  await page.goto('/');
  await expect(page.getByRole('button', { name: '直播弹幕', exact: true })).toHaveClass('selected');
  await page.getByRole('button', { name: '连接直播间' }).click();
  await expect(page.locator('.live-state strong')).toHaveText('已连接');
  await page.getByRole('button', { name: '暂停接收' }).click();
  await expect(page.locator('.live-state strong')).toHaveText('已暂停');
  const deadline = await page.locator('.live-session-actions span').innerText();
  await page.reload();
  await expect(page.getByRole('button', { name: '直播弹幕', exact: true })).toHaveClass('selected');
  await expect(page.locator('.live-state strong')).toHaveText('已暂停');
  await expect(page.locator('.live-session-actions span')).toHaveText(deadline);
  await page.clock.install();
  await page.clock.runFor(31000);
  expect(commands.filter((action) => action === 'start')).toHaveLength(1);
  expect(commands.filter((action) => action === 'pause')).toHaveLength(1);
  expect(commands.filter((action) => action === 'stop')).toHaveLength(0);
  await expect(page.locator('.live-session-actions span')).toHaveText(deadline);
  await page.screenshot({ path: 'screenshots/bilibili-paused-desktop.png', fullPage: true });
});

test('upstream business errors are visible and can be retried', async ({ page }) => {
  await mockPlatform(page, true);
  await page.goto('/');
  await expect(page.getByRole('button', { name: '直播弹幕', exact: true })).toHaveClass('selected');
  await page.getByRole('button', { name: '连接直播间' }).click();
  await expect(page.locator('.live-state strong')).toHaveText('连接失败');
  await expect(page.locator('.live-inline-error')).toContainText('7003');
  await expect(page.getByRole('button', { name: '连接直播间' })).toBeEnabled();
});

test('socket authentication rejection ends unusable credentials instead of retaining them', async ({ page }) => {
  const commands = await mockPlatform(page);
  await page.routeWebSocket('wss://broadcastlv.chat.bilibili.com/sub', (socket) => {
    socket.onMessage((message) => {
      const packet = typeof message === 'string' ? Buffer.from(message) : message;
      if (packet.readUInt32BE(8) === 7) socket.send(frame(8, '{"code":-101}'));
    });
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: '直播弹幕', exact: true })).toHaveClass('selected');
  await page.getByRole('button', { name: '连接直播间' }).click();
  await expect(page.locator('.live-state strong')).toHaveText('连接失败');
  await expect(page.locator('.live-inline-error')).toContainText('认证失败');
  expect(commands.filter((action) => action === 'stop')).toHaveLength(1);
  expect(commands.filter((action) => action === 'pause')).toHaveLength(0);
  await expect(page.getByRole('button', { name: '连接直播间' })).toBeEnabled();
});
