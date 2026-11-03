import { expect, test, type Page, type Locator } from '@playwright/test';
const frame = (p: Page) => p.frameLocator('.tox-edit-area iframe');
const panel = (p: Page) => p.getByRole('complementary', { name: '图片配置面板' });
const image = (p: Page) => frame(p).locator('#subject');
const tab = (p: Page, name: string) => panel(p).getByRole('tab', { name, exact: true }).click();
async function start(page: Page, target: Locator, dx: number, dy: number) {
  const b = (await target.boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2 + dx, b.y + b.height / 2 + dy, { steps: 8 });
}
async function aligned(page: Page) {
  await expect.poll(() => page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    const a = e.getBody().querySelector('#subject')!.getBoundingClientRect();
    const b = e.getBody().querySelector('[data-image-stroke-for]')?.getBoundingClientRect();
    return b ? Math.hypot(a.x + a.width / 2 - b.x - b.width / 2, a.y + a.height / 2 - b.y - b.height / 2) : Infinity;
  })).toBeLessThan(1.5);
}
test.beforeEach(async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = 240; c.height = 180;
    const ctx = c.getContext('2d')!; ctx.fillStyle = '#ff9900'; ctx.beginPath(); ctx.ellipse(120, 90, 96, 72, 0, 0, Math.PI * 2); ctx.fill();
    const e = window.tinymce.activeEditor;
    e.setContent(`<p><img id="subject" src="${c.toDataURL()}" style="position:absolute;left:260px;top:160px;width:240px;height:180px"></p><p><img id="other" src="${c.toDataURL()}" style="position:absolute;left:620px;top:100px;width:100px;height:75px"></p>`);
    e.undoManager.clear(); e.undoManager.add();
  });
  await image(page).click();
});
for (const effect of ['白边贴纸', '柔和投影', '粉色光晕', '爱心环绕']) test(`${effect}拖动和旋转后左上角缩放全程跟随，取消与撤销恢复`, async ({ page }) => {
  await tab(page, '特效'); await panel(page).getByRole('button', { name: effect, exact: true }).click();
  await aligned(page);
  const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  await start(page, image(page), 80, 50); await aligned(page);
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await page.keyboard.press('Escape'); await page.mouse.up(); await aligned(page);
  await expect(image(page)).toHaveCSS('left', '260px');
  await start(page, image(page), 80, 50); await aligned(page); await page.mouse.up(); await aligned(page);
  await tab(page, '图片'); await panel(page).getByRole('slider', { name: '旋转角度', exact: true }).fill('30');
  await panel(page).getByLabel('水平翻转', { exact: true }).check(); await aligned(page);
  const handle = frame(page).locator('#objectResizeHandlenw');
  await start(page, handle, -45, -55); await aligned(page);
  await page.keyboard.press('Escape'); await page.mouse.up(); await aligned(page);
  await expect(image(page)).toHaveCSS('width', '240px');
  await start(page, handle, -45, -55); await aligned(page); await page.mouse.up(); await aligned(page);
  await expect.poll(() => image(page).evaluate(el => parseFloat(getComputedStyle(el).width))).toBeGreaterThan(240);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo()); await aligned(page);
  await expect(image(page)).toHaveCSS('width', '240px');
});
for (const angle of [0, 30]) for (const corner of ['se', 'nw']) test(`关闭宽高比后 ${angle}° ${corner} 图片自由缩放，开关随图片保存且支持撤销`, async ({ page }) => {
  await panel(page).getByLabel('保持宽高比', { exact: true }).uncheck();
  await expect(image(page)).toHaveAttribute('data-image-settings', /"keepRatio":false/);
  await panel(page).getByRole('slider', { name: '旋转角度', exact: true }).fill(String(angle));
  const rad = angle * Math.PI / 180;
  const opposite = frame(page).locator(`#objectResizeHandle${corner === 'se' ? 'nw' : 'se'}`);
  const anchor = (await opposite.boundingBox())!;
  const delta = corner === 'se' ? 80 : -80;
  await start(page, frame(page).locator(`#objectResizeHandle${corner}`), delta * Math.cos(rad), delta * Math.sin(rad)); await page.mouse.up();
  await expect(image(page)).toHaveCSS('width', '320px'); await expect(image(page)).toHaveCSS('height', '180px');
  const fixed = (await opposite.boundingBox())!;
  expect(fixed.x).toBeCloseTo(anchor.x, 0); expect(fixed.y).toBeCloseTo(anchor.y, 0);
  await expect(panel(page).getByLabel('保持宽高比', { exact: true })).not.toBeChecked();
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  await expect(image(page)).toHaveCSS('width', '240px');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  await frame(page).locator('#other').click(); await expect(panel(page).getByLabel('保持宽高比', { exact: true })).toBeChecked();
  await image(page).click(); await expect(panel(page).getByLabel('保持宽高比', { exact: true })).not.toBeChecked();
  await page.getByRole('button', { name: '保存文档', exact: true }).click(); await page.reload();
  await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized); await image(page).click();
  await expect(panel(page).getByLabel('保持宽高比', { exact: true })).not.toBeChecked();
  await panel(page).getByLabel('保持宽高比', { exact: true }).check();
  await expect(image(page)).toHaveAttribute('data-image-settings', /"keepRatio":true/);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  await expect(panel(page).getByLabel('保持宽高比', { exact: true })).not.toBeChecked();
});
for (const keepRatio of [true, false]) test(`20×15 图片向内缩小不反向放大（宽高比 ${keepRatio}）`, async ({ page }) => {
  await panel(page).getByLabel('保持宽高比', { exact: true }).uncheck();
  await panel(page).getByLabel('图片宽度', { exact: true }).fill('20');
  await panel(page).getByLabel('图片高度', { exact: true }).fill('15');
  await expect(image(page)).toHaveCSS('height', '15px');
  if (keepRatio) await panel(page).getByLabel('保持宽高比', { exact: true }).check();
  await start(page, frame(page).locator('#objectResizeHandlese'), -5, -5); await page.mouse.up();
  const size = await image(page).evaluate(el => ({ w: parseFloat(getComputedStyle(el).width), h: parseFloat(getComputedStyle(el).height) }));
  expect(size.w).toBeLessThan(20); expect(size.h).toBeLessThan(15); expect(size.w).toBeGreaterThanOrEqual(1); expect(size.h).toBeGreaterThanOrEqual(1);
  if (keepRatio) expect(size.w / size.h).toBeCloseTo(4 / 3, 2);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  await expect(image(page)).toHaveCSS('width', '20px'); await expect(image(page)).toHaveCSS('height', '15px');
  await image(page).click();
  await start(page, frame(page).locator('#objectResizeHandlese'), -200, -200); await page.mouse.up();
  await expect(image(page)).toHaveCSS('height', '1px');
  await expect.poll(() => image(page).evaluate(el => parseFloat(getComputedStyle(el).width))).toBeGreaterThanOrEqual(1);
});
for (const name of ['外观', '描边', '动画']) test(`拖动图片保留${name}页签及面板，空白与切换对象正常`, async ({ page }) => {
  await tab(page, name);
  await start(page, image(page), 70, 40);
  await expect(panel(page)).toBeVisible(); await expect(panel(page).getByRole('tab', { name, exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.mouse.up(); await expect(panel(page).getByRole('tab', { name, exact: true })).toHaveAttribute('aria-selected', 'true');
  await start(page, frame(page).locator('#objectResizeHandlese'), 40, 30); await page.mouse.up();
  await expect(panel(page).getByRole('tab', { name, exact: true })).toHaveAttribute('aria-selected', 'true');
  await frame(page).locator('body').click({ position: { x: 800, y: 440 } }); await expect(panel(page)).toBeHidden();
  await frame(page).locator('#other').click(); await expect(panel(page).getByRole('tab', { name: '图片', exact: true })).toHaveAttribute('aria-selected', 'true');
});
