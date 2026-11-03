import { expect, test, type Page, type Locator } from '@playwright/test';
const frame = (p: Page) => p.frameLocator('.tox-edit-area iframe');
const box = (p: Page) => frame(p).locator('body > p > #words');
const panel = (p: Page) => p.getByRole('complementary', { name: '文字配置面板' });
const tab = async (p: Page, name: string) => panel(p).getByRole('tab', { name, exact: true }).click();
async function setup(page: Page, text = '这是一份测试文字<br>Abc 123 测试', size = 32) {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(({ text, size }) => {
    const e = window.tinymce.activeEditor;
    e.setContent(`<p><span id="words" data-text-draggable="true" style="position:absolute;left:160px;top:100px;display:inline-block;width:360px;font-size:${size}px;line-height:1.5;color:#25342f">${text}</span></p>`);
    e.undoManager.clear(); e.undoManager.add();
  }, { text, size });
  await box(page).click();
}
async function drag(page: Page, target: Locator, dx: number, dy: number, during?: () => Promise<void>) {
  const r = (await target.boundingBox())!;
  await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2); await page.mouse.down();
  await page.mouse.move(r.x + r.width / 2 + dx, r.y + r.height / 2 + dy, { steps: 6 });
  await during?.(); await page.mouse.up();
}
const content = (p: Page) => p.evaluate(() => window.tinymce.activeEditor.getContent());
const pose = (p: Page) => box(p).evaluate(el => { const r = el.getBoundingClientRect(), w = el.ownerDocument.defaultView!; return { x: r.x + w.scrollX, y: r.y + w.scrollY, width: r.width, height: r.height }; });

test('B01 图片填充上传立即应用，拖动缩放和重新打开保留', async ({ page }) => {
  await setup(page); await tab(page, '填充');
  await panel(page).getByRole('combobox', { name: '填充类型', exact: true }).selectOption('image');
  const data = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d')!; x.fillStyle = '#f60'; x.fillRect(0, 0, 32, 32); return c.toDataURL().split(',')[1]!; });
  await panel(page).locator('[data-fill-upload]').setInputFiles({ name: 'fill.png', mimeType: 'image/png', buffer: Buffer.from(data, 'base64') });
  await expect(box(page)).toHaveAttribute('data-text-fills', /data:image\/png/);
  const saved = await box(page).getAttribute('data-text-fills');
  await drag(page, box(page), 50, 25);
  await drag(page, frame(page).locator('[data-text-resize=se]'), 70, 20);
  await expect(box(page)).toHaveAttribute('data-text-fills', saved!);
  await expect(box(page).locator('[data-text-render] image')).toHaveCount(1);
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(box(page)).toHaveAttribute('data-text-fills', saved!);
});

test('B02 超高文字滚动后拖动，提交与预览一致，Esc 恢复', async ({ page }) => {
  await setup(page, '这是一份测试文字<br>Abc 123 测试', 100);
  await box(page).scrollIntoViewIfNeeded();
  const before = await pose(page); let preview!: Awaited<ReturnType<typeof pose>>;
  await drag(page, box(page), 50, 25, async () => { preview = await pose(page); });
  const after = await pose(page);
  expect(after.x).toBeCloseTo(preview.x, 0); expect(after.y).toBeCloseTo(preview.y, 0);
  expect(after.y).toBeCloseTo(before.y + 25, 0);
  const saved = await content(page);
  await drag(page, box(page), 20, 20, async () => { await page.keyboard.press('Escape'); });
  expect(await content(page)).toBe(saved);
});

async function appearance(page: Page, effect: string) {
  await tab(page, '外观'); await panel(page).getByRole('tab', { name: effect, exact: true }).click();
}
async function addEffect(page: Page, kind: string) {
  if (kind === '描边') { await appearance(page, '描边'); await panel(page).getByRole('checkbox', { name: '启用文字描边', exact: true }).check(); }
  if (kind === '背景') { await appearance(page, '背景'); await panel(page).getByRole('button', { name: '添加背景', exact: true }).click(); }
  if (kind === '渐变') { await tab(page, '填充'); await panel(page).getByRole('combobox', { name: '填充类型', exact: true }).selectOption('gradient'); }
}
for (const kind of ['描边', '背景', '渐变']) for (const vertical of [false, true]) test(`B03 ${kind}${vertical ? '竖排' : '横排'}预览实时同步，序列化与取消不保存临时效果`, async ({ page }) => {
  await setup(page); await addEffect(page, kind);
  if (vertical) { await tab(page, '排版'); await panel(page).getByRole('combobox', { name: '文字排列', exact: true }).selectOption('vertical-rl'); }
  const selector = kind === '背景' ? '[data-text-background-render]' : '[data-text-render]';
  const measure = () => box(page).locator(selector).evaluate(el => { const r = el.getBoundingClientRect(); return { width: r.width, height: r.height }; });
  const original = await content(page); let preview!: Awaited<ReturnType<typeof measure>>;
  await drag(page, frame(page).locator('[data-text-resize=se]'), vertical ? 20 : 100, vertical ? 70 : 25, async () => {
    const bounds = await pose(page); preview = await measure();
    expect(Math.abs(preview.width - bounds.width - (kind === '背景' ? 20 : 0))).toBeLessThan(1.1);
    expect(Math.abs(preview.height - bounds.height - (kind === '背景' ? 12 : 0))).toBeLessThan(1.1);
    expect(await content(page)).toBe(original);
    expect(await measure()).toEqual(preview);
  });
  const after = await measure(); expect(after.width).toBeCloseTo(preview.width, 0); expect(after.height).toBeCloseTo(preview.height, 0);
  const saved = await content(page);
  await drag(page, frame(page).locator('[data-text-resize=se]'), 40, 20, async () => { await page.keyboard.press('Escape'); });
  expect(await content(page)).toBe(saved); expect(await measure()).toEqual(after);
});

for (const preset of ['up', 'custom', 'arch', 'circle']) test(`B04 ${preset}变形缩放保持对角锚点，松手不跳变`, async ({ page }) => {
  await setup(page); await tab(page, '变形'); await panel(page).locator(`[data-deform-preset=${preset}]`).click();
  for (const side of ['nw', 'se', 'e']) {
    const before = await pose(page); let preview!: Awaited<ReturnType<typeof pose>>;
    await drag(page, frame(page).locator(`[data-text-resize=${side}]`), side === 'nw' ? -100 : side === 'e' ? -50 : 80, side === 'nw' ? -40 : 20, async () => {
      preview = await pose(page);
      if (side === 'nw') {
        expect(preview.x + preview.width).toBeCloseTo(before.x + before.width, 0);
        expect(preview.y + preview.height).toBeCloseTo(before.y + before.height, 0);
      }
    });
    const after = await pose(page);
    for (const key of ['x', 'y', 'width', 'height'] as const) expect(after[key]).toBeCloseTo(preview[key], 0);
  }
});

for (const kind of ['描边', '渐变', '变形']) test(`B05 ${kind}缩放撤销重做不产生空白行`, async ({ page }) => {
  await setup(page, '这是一份测试文字');
  if (kind === '变形') { await tab(page, '变形'); await panel(page).locator('[data-deform-preset=up]').click(); }
  else await addEffect(page, kind);
  const before = await pose(page);
  await drag(page, frame(page).locator('[data-text-resize=se]'), 70, 20);
  const enlarged = await pose(page);
  for (let i = 0; i < 2; i++) {
    await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
    await expect.poll(async () => (await pose(page)).height).toBeCloseTo(before.height, 0);
    await box(page).click(); expect((await pose(page)).height).toBeCloseTo(before.height, 0);
    await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
    await expect.poll(async () => (await pose(page)).height).toBeCloseTo(enlarged.height, 0);
  }
  expect(await box(page).evaluate(el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent?.includes('\uFEFF')))).toBe(false);
});

for (const animation of ['bounce', 'flash', 'pulse', 'rubberBand', 'shakeX', 'shakeY', 'headShake', 'swing', 'tada', 'wobble', 'jello', 'heartBeat']) test(`B06 ${animation}背景与文字共享动画时间线，变换不重播`, async ({ page }) => {
  await setup(page); await addEffect(page, '背景'); await addEffect(page, '渐变');
  await tab(page, '动画'); await panel(page).locator(`[data-animation=${animation}]`).click();
  await panel(page).getByRole('checkbox', { name: '循环播放', exact: true }).check();
  await panel(page).getByRole('spinbutton', { name: '每轮时长（秒）', exact: true }).fill('2');
  const times = () => box(page).evaluate(el => [...el.children].flatMap(child => child.getAnimations().map(a => ({ start: Number(a.startTime), time: Number(a.currentTime) }))));
  await expect.poll(async () => { const t = await times(); return t.length >= 3 && Math.max(...t.map(a => a.start)) - Math.min(...t.map(a => a.start)) < 1; }).toBe(true);
  const start = (await times())[0]!.start;
  await drag(page, box(page), 50, 25);
  await drag(page, frame(page).locator('[data-text-resize=se]'), 70, 20);
  const after = await times();
  for (const a of after) expect(a.start).toBeCloseTo(start, 0);
});

test('B06 动画暂停在放大帧时，重绘不把动画变换烘焙进字形', async ({ page }) => {
  await setup(page, '这是一份测试文字'); await addEffect(page, '渐变');
  const original = await box(page).locator('[data-text-render] text').first().getAttribute('textLength');
  await tab(page, '动画'); await panel(page).locator('[data-animation=pulse]').click();
  await panel(page).getByRole('checkbox', { name: '循环播放', exact: true }).check();
  await box(page).evaluate(el => el.getAnimations({ subtree: true }).forEach(a => { a.pause(); a.currentTime = 500; }));
  await drag(page, box(page), 40, 20);
  expect(Number(await box(page).locator('[data-text-render] text').first().getAttribute('textLength'))).toBeCloseTo(Number(original), 0);
  const states = await box(page).evaluate(el => el.getAnimations({ subtree: true }).map(a => ({ time: a.currentTime, state: a.playState })));
  for (const state of states) { expect(state.state).toBe('paused'); expect(state.time).toBe(500); }
});

for (const size of [1, 4, 8]) test(`B07 ${size}px 文字向内缩放不会反向放大`, async ({ page }) => {
  await setup(page, Array(8).fill('测试文字').join('<br>'), size);
  const before = await pose(page);
  await drag(page, frame(page).locator('[data-text-resize=se]'), -40, -2);
  const after = await pose(page);
  const font = await box(page).evaluate(el => parseFloat(getComputedStyle(el).fontSize));
  expect(after.width).toBeLessThanOrEqual(before.width); expect(font).toBeLessThanOrEqual(size); expect(font).toBeGreaterThanOrEqual(1);
  if (size > 1) expect(font).toBeLessThan(size);
});

for (const effect of ['背景', '描边', '投影']) test(`B08 ${effect}子页在拖动、缩放后保持`, async ({ page }) => {
  await setup(page); await appearance(page, effect);
  await drag(page, box(page), 50, 25);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await expect(panel(page).getByRole('tab', { name: effect, exact: true })).toHaveAttribute('aria-selected', 'true');
  await drag(page, frame(page).locator('[data-text-resize=se]'), 70, 20);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await expect(panel(page).getByRole('tab', { name: effect, exact: true })).toHaveAttribute('aria-selected', 'true');
});
