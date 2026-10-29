import { expect, test, type Page } from '@playwright/test';
import { createMessageStore } from '../src/live/store';
import { normalizeMessage } from '../src/bilibili';
import { mockPlatform } from './helpers/platform';

const sample = (id: string, source = 'bilibili:100') => ({ id, source, type: 'chat' as const, name: '观众', text: `内容${id}`, time: '18:00' });
const regions = `
<h2>三个弹幕区</h2>
<div data-danmaku-id="a" data-danmaku-source="current" data-danmaku-skin="simple"><p>原始回退A</p></div>
<div data-danmaku-id="b" data-danmaku-source="current" data-danmaku-skin="card" data-danmaku-types="superchat"><p>原始回退B</p></div>
<div data-danmaku-id="c" data-danmaku-source="bilibili:100" data-danmaku-skin="blivechat"><p>原始回退C</p></div>`;

async function openSource(page: Page, html: string) {
  await page.locator('[data-mce-name="code"]').click();
  await page.getByRole('dialog').getByRole('textbox').fill(html);
  await page.getByRole('dialog').getByRole('button', { name: '保存', exact: true }).click();
}

async function publish(page: Page, id: string) {
  await page.evaluate(async (id) => {
    const { liveMessages } = await import('/src/live/store.ts');
    liveMessages.publish([{ id, type: 'chat', name: '新观众', text: `新消息${id}`, time: '18:08' }]);
  }, id);
}

async function start(page: Page) {
  const commands = await mockPlatform(page);
  await page.goto('/');
  await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(page.getByRole('button', { name: '直播弹幕', exact: true })).toHaveClass('selected');
  await page.getByRole('button', { name: '连接直播间' }).click();
  await expect(page.locator('.live-state strong')).toHaveText('已连接');
  await expect(page.locator('.live-message')).toHaveCount(2);
  return commands;
}

test('仓库回放、去重、容量、指定来源、独立取消订阅', () => {
  const store = createMessageStore(2);
  store.setSource('bilibili:100');
  store.publish([sample('1'), sample('2')]);
  const a: string[][] = []; const b: string[][] = [];
  const stopA = store.subscribe('current', (items) => a.push(items.map((item) => item.id)));
  store.subscribe('bilibili:100', (items) => b.push(items.map((item) => item.id)));
  expect(a).toEqual([['1', '2']]);
  store.publish([sample('2'), sample('3')]);
  expect(a.at(-1)).toEqual(['2', '3']);
  stopA(); store.publish([sample('4')]);
  expect(a.at(-1)).toEqual(['2', '3']); expect(b.at(-1)).toEqual(['3', '4']);
  store.setSource('bilibili:200');
  expect(store.snapshot()).toEqual([]);
  expect(store.snapshot('bilibili:100')).toHaveLength(2);
  store.clear(); expect(b.at(-1)).toEqual([]);
});

test('结构化信息不丢失、不修改原包、不凭空推断身份', () => {
  const data = { msg_id: 'g', user_info: { uname: '舰长' }, guard_level: 3 };
  const guard = normalizeMessage({ cmd: 'LIVE_OPEN_PLATFORM_GUARD', data });
  expect(guard).toMatchObject({ name: '舰长', type: 'guard', guardLevel: 3, role: 'member' });
  expect(data).not.toHaveProperty('uname');
  expect(normalizeMessage({ cmd: 'LIVE_OPEN_PLATFORM_DM', data: { uname: '主播昵称', msg: 'hello' } })?.role).toBe('');
  expect(normalizeMessage({ cmd: 'LIVE_OPEN_PLATFORM_SUPER_CHAT', data: { message: '支持', rmb: 30, uface: 'javascript:alert(1)' } })).toMatchObject({ price: 30, avatar: '' });
});

test('源码保存即绑定三个独立区域，共用连接、回放历史且不写入文档', async ({ page }) => {
  const commands = await start(page);
  await openSource(page, regions);
  const body = page.frameLocator('.tox-edit-area iframe').locator('body');
  const a = body.locator('[data-danmaku-id="a"]');
  const b = body.locator('[data-danmaku-id="b"]');
  const c = body.locator('[data-danmaku-id="c"]');
  await expect(a.locator('[data-message-id]')).toHaveCount(2);
  await expect(b.locator('[data-message-id]')).toHaveCount(1);
  await expect(c.locator('yt-live-chat-text-message-renderer > #content > #message')).toHaveText('第一条真实协议弹幕');
  await expect(c.locator('yt-live-chat-paid-message-renderer > #card > #content > #message')).toHaveText('<img src=x onerror=alert(1)>');
  await expect(body.locator('script,img[onerror]')).toHaveCount(0);
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  const before = await page.evaluate(() => ({ html: window.tinymce.activeEditor.getContent(), undo: window.tinymce.activeEditor.undoManager.data.length }));
  await publish(page, 'new');
  await expect(a.locator('[data-message-id]')).toHaveCount(3);
  await expect(b.locator('[data-message-id]')).toHaveCount(1);
  await expect(c.locator('[data-message-id]')).toHaveCount(3);
  expect(await page.evaluate(() => ({ html: window.tinymce.activeEditor.getContent(), undo: window.tinymce.activeEditor.undoManager.data.length }))).toEqual(before);
  expect(before.html).toContain('原始回退A'); expect(before.html).not.toContain('第一条真实协议弹幕');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('test44.tinymce.document.v1') || '{}').content)).toBe(before.html);
  expect(commands.filter((action) => action === 'start')).toHaveLength(1);
  await page.screenshot({ path: 'screenshots/danmaku-subscriptions.png', fullPage: true });
});

test('暂停、取消绑定、重复 ID、无效皮肤、撤销重做彼此隔离', async ({ page }) => {
  await start(page); await openSource(page, regions);
  const body = page.frameLocator('.tox-edit-area iframe').locator('body');
  const a = body.locator('[data-danmaku-id="a"]');
  await expect(a.locator('[data-message-id]')).toHaveCount(2);
  await page.evaluate(() => window.tinymce.activeEditor.getBody().querySelector('[data-danmaku-id="a"]')!.setAttribute('data-danmaku-paused', 'true'));
  await expect.poll(() => a.evaluate((node) => node.getAttribute('data-danmaku-paused'))).toBe('true');
  await publish(page, 'pause');
  await expect(body.locator('[data-danmaku-id="c"] [data-message-id]')).toHaveCount(3);
  await expect(a.locator('[data-message-id]')).toHaveCount(2);
  await page.evaluate(() => window.tinymce.activeEditor.getBody().querySelector('[data-danmaku-id="a"]')!.removeAttribute('data-danmaku-paused'));
  await expect(a.locator('[data-message-id]')).toHaveCount(3);
  await page.evaluate(() => window.tinymce.activeEditor.getBody().querySelector('[data-danmaku-id="a"]')!.removeAttribute('data-danmaku-source'));
  await expect.poll(() => a.evaluate((node) => node.shadowRoot?.querySelector('slot') !== null)).toBe(true);
  await openSource(page, regions + '<div data-danmaku-id="a" data-danmaku-source="current" data-danmaku-skin="bad"><p>bad</p></div>');
  await expect(body.locator('[data-danmaku-id="a"]')).toHaveCount(1);
  await expect(body.getByText('未知皮肤', { exact: false })).toBeVisible();
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  await expect(body.getByText('未知皮肤', { exact: false })).toHaveCount(0);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  await expect(body.getByText('未知皮肤', { exact: false })).toBeVisible();
  await expect(body.locator('[data-danmaku-id="c"] [data-message-id]')).toHaveCount(3);
});

test('预览继续订阅，HTML 导出为无需脚本的快照，重建/刷新保留声明', async ({ page, context }) => {
  const commands = await start(page); await openSource(page, regions);
  await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  const preview = page.frameLocator('iframe[title="文档预览"]');
  await expect(preview.locator('[data-danmaku-id="a"] [data-message-id]')).toHaveCount(2);
  await publish(page, 'preview');
  await expect(preview.locator('[data-danmaku-id="a"] [data-message-id]')).toHaveCount(3);
  await page.getByRole('button', { name: '导出', exact: true }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'HTML 文档', exact: true }).click();
  const download = await downloadPromise;
  const fs = await import('node:fs/promises');
  const html = await fs.readFile((await download.path())!, 'utf8');
  expect(html).toContain('shadowrootmode="open"'); expect(html).not.toContain('<script');
  const exported = await context.newPage();
  await exported.route('http://snapshot.test/', (route) => route.fulfill({ contentType: 'text/html', body: html }));
  await exported.goto('http://snapshot.test/');
  await expect(exported.locator('[data-danmaku-id="a"] [data-message-id]')).toHaveCount(3);
  await expect(exported.locator('[data-danmaku-id="b"] [data-message-id]')).toHaveCount(1);
  await exported.close();
  await page.getByRole('button', { name: '编辑', exact: true }).first().click();
  await page.getByRole('button', { name: '编辑器配置' }).click();
  await page.getByLabel('自适应文档高度', { exact: true }).check();
  await page.getByRole('button', { name: '应用配置' }).click();
  await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized && !!window.tinymce.activeEditor.plugins.autoresize);
  await expect(page.frameLocator('.tox-edit-area iframe').locator('[data-danmaku-id="a"] [data-message-id]')).toHaveCount(3);
  expect(commands.filter((action) => action === 'start')).toHaveLength(1);
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(page.frameLocator('.tox-edit-area iframe').locator('[data-danmaku-id="a"] [data-message-id]')).toHaveCount(2);
});


test('空容器、类型与条数更新、移除再创建、嵌套后恢复均可重新绑定', async ({ page }) => {
  await start(page);
  await openSource(page, '<div data-danmaku-source="current" data-danmaku-skin="simple"></div>');
  const body = page.frameLocator('.tox-edit-area iframe').locator('body');
  await expect(body.locator('[data-message-id]')).toHaveCount(2);
  await page.evaluate(() => {
    const root = window.tinymce.activeEditor.getBody().querySelector('[data-danmaku-source]')!;
    root.setAttribute('data-danmaku-limit', '1');
    root.setAttribute('data-danmaku-types', 'chat');
  });
  await expect(body.locator('[data-message-id]')).toHaveCount(1);
  await expect(body.locator('[data-message-id]')).toContainText('第一条真实协议弹幕');
  await openSource(page, regions);
  await page.evaluate(() => {
    const doc = window.tinymce.activeEditor.getBody();
    doc.querySelector('[data-danmaku-id="a"]')!.append(doc.querySelector('[data-danmaku-id="c"]')!);
  });
  await expect.poll(() => body.locator('[data-danmaku-id="c"]').evaluate((element) => element.shadowRoot?.querySelector('slot') !== null)).toBe(true);
  await page.evaluate(() => {
    const doc = window.tinymce.activeEditor.getBody();
    doc.append(doc.querySelector('[data-danmaku-id="c"]')!);
  });
  await publish(page, 'restored');
  await expect(body.locator('[data-danmaku-id="c"] [data-message-id]')).toHaveCount(3);
  await page.evaluate(() => window.tinymce.activeEditor.getBody().querySelector('[data-danmaku-id="c"]')!.remove());
  await publish(page, 'removed');
  await expect(body.locator('[data-danmaku-id="a"] [data-message-id]')).toHaveCount(4);
  await openSource(page, regions);
  await expect(body.locator('[data-danmaku-id="c"] [data-message-id]')).toHaveCount(4);
});

test('弹幕容器可拖动，途中不保存，松开提交坐标并支持撤销重做和刷新', async ({ page }) => {
  await start(page);
  await openSource(page, '<div data-danmaku-id="chat-a" data-danmaku-source="current" data-danmaku-skin="blivechat" data-danmaku-limit="50" style="background:#dcdcdc;width:300px;height:200px;box-sizing:border-box;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end"></div>');
  const region = page.frameLocator('.tox-edit-area iframe').locator('[data-danmaku-id="chat-a"]');
  await expect(region.locator('[data-message-id]')).toHaveCount(2);
  const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  const box = (await region.boundingBox())!;
  await page.mouse.move(box.x + 12, box.y + 12);
  await page.mouse.down();
  await page.mouse.move(box.x + 102, box.y + 112, { steps: 6 });
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await page.mouse.up();
  const moved = (await region.boundingBox())!;
  expect(moved.x - box.x).toBeCloseTo(90, 0);
  expect(moved.y - box.y).toBeCloseTo(100, 0);
  await expect(region).toHaveCSS('position', 'absolute');
  const saved = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  expect(saved).toContain('position: absolute'); expect(saved).not.toContain('第一条真实协议弹幕');
  const coordinates = await region.evaluate((element: HTMLElement) => ({ x: element.getAttribute('data-danmaku-x'), y: element.getAttribute('data-danmaku-y'), left: parseFloat(element.style.left), top: parseFloat(element.style.top) }));
  expect(Number(coordinates.x)).toBe(coordinates.left); expect(Number(coordinates.y)).toBe(coordinates.top);
  expect(saved).toContain('data-danmaku-x='); expect(saved).toContain('data-danmaku-y=');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  await expect(region).toHaveCSS('position', 'static');
  await expect(region).not.toHaveAttribute('data-danmaku-x');
  await expect(region).not.toHaveAttribute('data-danmaku-y');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  await expect(region).toHaveCSS('position', 'absolute');
  await publish(page, 'dragging');
  await expect(region.locator('[data-message-id]')).toHaveCount(3);
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(region).toHaveCSS('position', 'absolute');
  const restored = (await region.boundingBox())!;
  expect(restored.x).toBeCloseTo(moved.x, 0); expect(restored.y).toBeCloseTo(moved.y, 0);
});

test('拖动支持取消和禁用，不影响父容器中的坐标', async ({ page }) => {
  await start(page);
  await openSource(page, '<div style="position:relative;height:500px;padding:20px"><div data-danmaku-id="a" data-danmaku-source="current" style="width:200px;height:100px;background:#ddd"></div></div>');
  const region = page.frameLocator('.tox-edit-area iframe').locator('[data-danmaku-id="a"]');
  const box = (await region.boundingBox())!;
  await page.mouse.move(box.x + 10, box.y + 10); await page.mouse.down();
  await page.mouse.move(box.x + 70, box.y + 60, { steps: 4 });
  await page.keyboard.press('Escape'); await page.mouse.up();
  const cancelled = (await region.boundingBox())!;
  expect(cancelled.x).toBeCloseTo(box.x, 0); expect(cancelled.y).toBeCloseTo(box.y, 0);
  await page.mouse.move(box.x + 10, box.y + 10); await page.mouse.down();
  await page.mouse.move(box.x + 70, box.y + 60, { steps: 4 }); await page.mouse.up();
  const moved = (await region.boundingBox())!;
  expect(moved.x - box.x).toBeCloseTo(60, 0); expect(moved.y - box.y).toBeCloseTo(50, 0);
  await page.evaluate(() => window.tinymce.activeEditor.getBody().querySelector('[data-danmaku-id="a"]')!.setAttribute('data-danmaku-draggable', 'false'));
  await page.mouse.move(moved.x + 10, moved.y + 10); await page.mouse.down();
  await page.mouse.move(moved.x + 70, moved.y + 60, { steps: 4 }); await page.mouse.up();
  const disabled = (await region.boundingBox())!;
  expect(disabled.x).toBeCloseTo(moved.x, 0); expect(disabled.y).toBeCloseTo(moved.y, 0);
});


test('XY 属性保存后定位、覆盖旧 inset，源码改坐标、拖动回写及预览保持一致', async ({ page }) => {
  await start(page);
  const html = '<div data-danmaku-id="xy" data-danmaku-source="current" data-danmaku-skin="blivechat" data-danmaku-x="34" data-danmaku-y="32" style="background:#dcdcdc;width:300px;height:200px;overflow:hidden;position:absolute;inset:100px auto auto 200px"></div>';
  await openSource(page, html);
  const region = page.frameLocator('.tox-edit-area iframe').locator('[data-danmaku-id="xy"]');
  await expect(region).toHaveCSS('left', '34px'); await expect(region).toHaveCSS('top', '32px');
  const box = (await region.boundingBox())!;
  await page.mouse.move(box.x + 10, box.y + 10); await page.mouse.down();
  await page.mouse.move(box.x + 70, box.y + 60, { steps: 4 });
  await expect(region).toHaveAttribute('data-danmaku-x', '34');
  await expect(region).toHaveAttribute('data-danmaku-y', '32');
  await page.mouse.up();
  await expect(region).toHaveAttribute('data-danmaku-x', '94'); await expect(region).toHaveAttribute('data-danmaku-y', '82');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  await expect(region).toHaveAttribute('data-danmaku-x', '34'); await expect(region).toHaveCSS('left', '34px');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  await expect(region).toHaveAttribute('data-danmaku-x', '94'); await expect(region).toHaveCSS('left', '94px');
  await openSource(page, html.replace('data-danmaku-x="34"', 'data-danmaku-x="120.5"').replace('data-danmaku-y="32"', 'data-danmaku-y="80"'));
  await expect(region).toHaveCSS('left', '120.5px'); await expect(region).toHaveCSS('top', '80px');
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(region).toHaveAttribute('data-danmaku-x', '120.5'); await expect(region).toHaveCSS('left', '120.5px');
  await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  const preview = page.frameLocator('iframe[title="文档预览"]').locator('[data-danmaku-id="xy"]');
  await expect(preview).toHaveCSS('left', '120.5px'); await expect(preview).toHaveCSS('top', '80px');
});

test('XY 属性支持负数、单轴与禁用拖动，非法值不进入 CSS', async ({ page }) => {
  await start(page);
  await openSource(page, '<div data-danmaku-id="xy" data-danmaku-source="current" data-danmaku-draggable="false" data-danmaku-x="-10.5" data-danmaku-y="invalid" style="width:200px;height:100px;top:50px"></div>');
  const region = page.frameLocator('.tox-edit-area iframe').locator('[data-danmaku-id="xy"]');
  await expect(region).toHaveCSS('left', '-10.5px'); await expect(region).toHaveCSS('top', '50px');
  await page.evaluate(() => {
    const element = window.tinymce.activeEditor.getBody().querySelector('[data-danmaku-id="xy"]')!;
    element.setAttribute('data-danmaku-x', '12'); element.setAttribute('data-danmaku-y', '24');
  });
  await expect(region).toHaveCSS('left', '12px'); await expect(region).toHaveCSS('top', '24px');
});

test('弹幕拖动后选中或拖动图片不还原位置，保存刷新和预览保持坐标', async ({ page }) => {
  await start(page);
  await openSource(page, '<p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="位置回归图片" width="180" height="120"></p><div data-danmaku-id="stable" data-danmaku-source="current" data-danmaku-x="300" data-danmaku-y="40" style="width:200px;height:100px;background:#ddd"></div>');
  const frame = page.frameLocator('.tox-edit-area iframe');
  const region = frame.locator('[data-danmaku-id="stable"]');
  const image = frame.locator('img[alt="位置回归图片"]');
  const original = (await region.boundingBox())!;
  await page.mouse.move(original.x + 20, original.y + 20); await page.mouse.down();
  await page.mouse.move(original.x + 100, original.y + 80, { steps: 5 }); await page.mouse.up();
  await image.click();
  await expect(region).toHaveCSS('left', '380px'); await expect(region).toHaveCSS('top', '100px');
  await expect(region).toHaveAttribute('data-danmaku-x', '380'); await expect(region).toHaveAttribute('data-danmaku-y', '100');
  const box = (await image.boundingBox())!;
  await page.mouse.move(box.x + 30, box.y + 30); await page.mouse.down();
  await page.mouse.move(box.x + 70, box.y + 60, { steps: 4 }); await page.mouse.up();
  await expect(region).toHaveCSS('left', '380px'); await expect(region).toHaveCSS('top', '100px');
  await publish(page, 'after-image-drag');
  await expect(region).toHaveCSS('left', '380px');
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(region).toHaveCSS('left', '380px'); await expect(region).toHaveCSS('top', '100px');
  await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  const preview = page.frameLocator('iframe[title="文档预览"]').locator('[data-danmaku-id="stable"]');
  await expect(preview).toHaveCSS('left', '380px'); await expect(preview).toHaveCSS('top', '100px');
});

test('弹幕四角缩放、取消、撤销重做及保存刷新，与图片复用选中框', async ({ page }) => {
  await start(page);
  await openSource(page, '<p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="切换图片" width="80" height="60"></p><div data-danmaku-id="sized" data-danmaku-source="current" data-danmaku-x="300" data-danmaku-y="140" style="width:200px;height:120px;background:#ddd;overflow:hidden"></div>');
  const frame = page.frameLocator('.tox-edit-area iframe');
  const region = frame.locator('[data-danmaku-id="sized"]');
  for (const corner of ['se', 'nw', 'ne', 'sw']) {
    await region.click({ position: { x: 20, y: 20 } });
    const handle = frame.locator(`#objectResizeHandle${corner}`);
    await expect(handle).toBeVisible();
    const initial = (await region.boundingBox())!;
    const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
    const box = (await handle.boundingBox())!;
    const dx = corner.includes('w') ? -40 : 40;
    const dy = corner.includes('n') ? -30 : 30;
    await page.mouse.move(box.x + 5, box.y + 5); await page.mouse.down();
    await page.mouse.move(box.x + 5 + dx, box.y + 5 + dy, { steps: 4 });
    expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
    const preview = (await region.boundingBox())!;
    expect(preview.width).toBeCloseTo(initial.width + 40, 0); expect(preview.height).toBeCloseTo(initial.height + 30, 0);
    await page.keyboard.press('Escape'); await page.mouse.up();
    expect((await region.boundingBox())!.width).toBeCloseTo(initial.width, 0);
    await page.mouse.move(box.x + 5, box.y + 5); await page.mouse.down();
    await page.mouse.move(box.x + 5 + dx, box.y + 5 + dy, { steps: 4 }); await page.mouse.up();
    const resized = (await region.boundingBox())!;
    expect(resized.width).toBeCloseTo(initial.width + 40, 0); expect(resized.height).toBeCloseTo(initial.height + 30, 0);
    expect(resized.x).toBeCloseTo(initial.x + (corner.includes('w') ? dx : 0), 0);
    expect(resized.y).toBeCloseTo(initial.y + (corner.includes('n') ? dy : 0), 0);
    await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
    expect((await region.boundingBox())!.width).toBeCloseTo(initial.width, 0);
    await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
    expect((await region.boundingBox())!.width).toBeCloseTo(resized.width, 0);
  }
  await region.click({ position: { x: 20, y: 20 } });
  const beforeShrink = (await region.boundingBox())!;
  const shrinkHandle = (await frame.locator('#objectResizeHandlese').boundingBox())!;
  await page.mouse.move(shrinkHandle.x + 5, shrinkHandle.y + 5); await page.mouse.down();
  await page.mouse.move(shrinkHandle.x - 45, shrinkHandle.y - 35, { steps: 4 }); await page.mouse.up();
  expect((await region.boundingBox())!.width).toBeCloseTo(beforeShrink.width - 50, 0);
  expect((await region.boundingBox())!.height).toBeCloseTo(beforeShrink.height - 40, 0);
  const beforeMove = (await region.boundingBox())!;
  await page.mouse.move(beforeMove.x + 20, beforeMove.y + 20); await page.mouse.down();
  await page.mouse.move(beforeMove.x + 55, beforeMove.y + 40, { steps: 4 }); await page.mouse.up();
  const saved = (await region.boundingBox())!;
  expect(saved.x).toBeCloseTo(beforeMove.x + 35, 0); expect(saved.y).toBeCloseTo(beforeMove.y + 20, 0);
  const movedCorner = (await frame.locator('#objectResizeHandlese').boundingBox())!;
  expect(Math.abs(movedCorner.x + 5 - saved.x - saved.width)).toBeLessThan(2);
  expect(Math.abs(movedCorner.y + 5 - saved.y - saved.height)).toBeLessThan(2);
  await frame.locator('img[alt="切换图片"]').click();
  await expect(frame.locator('.object-selection-frame')).toHaveCount(1);
  const imageBox = (await frame.locator('img[alt="切换图片"]').boundingBox())!;
  const selectedFrame = (await frame.locator('.object-selection-frame').boundingBox())!;
  expect(selectedFrame.x).toBeCloseTo(imageBox.x, 0); expect(selectedFrame.width).toBeCloseTo(imageBox.width, 0);
  await expect(frame.locator('.mce-resizehandle')).toHaveCount(0);
  expect((await region.boundingBox())!.width).toBeCloseTo(saved.width, 0);
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  const restored = (await region.boundingBox())!;
  expect(restored.width).toBeCloseTo(saved.width, 0); expect(restored.height).toBeCloseTo(saved.height, 0);
  expect(restored.x).toBeCloseTo(saved.x, 0); expect(restored.y).toBeCloseTo(saved.y, 0);
  await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  const preview = page.frameLocator('iframe[title="文档预览"]').locator('[data-danmaku-id="sized"]');
  await expect(preview).toHaveCSS('width', `${saved.width}px`); await expect(preview).toHaveCSS('height', `${saved.height}px`);
});

test('弹幕浮动工具栏左右居中对齐，坐标持久化且不改变消息文字对齐', async ({ page }) => {
  await start(page);
  await openSource(page, '<p id="alignment-reference">弹幕对齐测试</p><div data-danmaku-id="aligned" data-danmaku-source="current" style="width:200px;height:120px;background:#ddd"></div>');
  const frame = page.frameLocator('.tox-edit-area iframe');
  const region = frame.locator('[data-danmaku-id="aligned"]');
  const reference = (await frame.locator('#alignment-reference').boundingBox())!;
  const initial = (await region.boundingBox())!;
  const textAlign = await region.evaluate((node) => getComputedStyle(node).textAlign);
  for (const [label, ratio] of [['居中对齐', 0.5], ['右对齐', 1], ['左对齐', 0]] as const) {
    await region.click({ position: { x: 20, y: 20 } });
    const toolbar = page.locator('.tox-pop:visible');
    await expect(toolbar.getByRole('button')).toHaveCount(5);
    await toolbar.getByRole('button', { name: label, exact: true }).click();
    await expect.poll(async () => (await region.boundingBox())!.x).toBeCloseTo(reference.x + (reference.width - initial.width) * ratio, 0);
    const box = (await region.boundingBox())!;
    expect(box.y).toBeCloseTo(initial.y, 0); expect(box.width).toBeCloseTo(initial.width, 0); expect(box.height).toBeCloseTo(initial.height, 0);
    await expect(region).toHaveCSS('text-align', textAlign);
    const coordinates = await region.evaluate((node: HTMLElement) => ({ x: Number(node.getAttribute('data-danmaku-x')), left: parseFloat(node.style.left), y: Number(node.getAttribute('data-danmaku-y')), top: parseFloat(node.style.top) }));
    expect(coordinates.x).toBe(coordinates.left); expect(coordinates.y).toBe(coordinates.top);
    await expect(toolbar.getByRole('button', { name: label, exact: true })).toHaveAttribute('aria-pressed', 'true');
    const border = (await frame.locator('.object-selection-frame').boundingBox())!;
    expect(border.x).toBeCloseTo(box.x, 0);
  }
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  expect((await region.boundingBox())!.x).toBeCloseTo(reference.x + reference.width - initial.width, 0);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  await publish(page, 'after-align');
  expect((await region.boundingBox())!.x).toBeCloseTo(reference.x, 0);
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  expect((await region.boundingBox())!.x).toBeCloseTo(reference.x, 0);
  await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  const preview = page.frameLocator('iframe[title="文档预览"]').locator('[data-danmaku-id="aligned"]');
  await expect(preview).toHaveCSS('width', '200px');
});
