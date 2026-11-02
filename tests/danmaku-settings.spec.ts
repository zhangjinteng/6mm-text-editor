import { expect, test, type Page } from '@playwright/test';

const region = (p: Page) => p.frameLocator('.tox-edit-area iframe').locator('#settings-danmaku');
const dialog = (p: Page) => p.getByRole('dialog', { name: '弹幕设置', exact: true });
async function open(page: Page) {
  await region(page).click({ position: { x: 20, y: 20 } });
  const toolbar = page.locator('.tox-pop:visible');
  await expect(toolbar.getByRole('button')).toHaveCount(2);
  await expect(toolbar.locator('[data-mce-name="layersettings"],[data-mce-name^="danmakualign"]')).toHaveCount(0);
  await toolbar.getByRole('button', { name: '弹幕设置', exact: true }).click();
  return dialog(page);
}
test.beforeEach(async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    e.setContent('<p><span id="lower" data-text-draggable="true" style="position:absolute;left:20px;top:30px;z-index:1">底层文字</span></p><div id="settings-danmaku" data-danmaku-id="settings" data-danmaku-source="current" style="position:absolute;left:100px;top:100px;width:220px;height:180px;background:#edf5f1;z-index:2"></div><p><span id="upper" data-text-draggable="true" style="position:absolute;left:420px;top:30px;z-index:3">上层文字</span></p>');
    e.undoManager.clear(); e.undoManager.add();
  });
});

test('工具栏收纳设置，草稿不改原对象；取消、关闭与 Esc 均丢弃', async ({ page }) => {
  const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  for (const exit of ['取消', '关闭弹幕设置', 'Escape']) {
    const d = await open(page);
    await d.getByRole('button', { name: '水平居中', exact: true }).click();
    await d.getByRole('button', { name: '上一层', exact: true }).click();
    await expect(d.getByRole('button', { name: '置于顶层', exact: true })).toBeDisabled();
    await d.getByRole('button', { name: '下一层', exact: true }).click();
    await d.getByRole('button', { name: '置于底层', exact: true }).click();
    await expect(d.getByRole('button', { name: '下一层', exact: true })).toBeDisabled();
    expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
    if (exit === 'Escape') await page.keyboard.press('Escape');
    else await d.getByRole('button', { name: exit, exact: true }).click();
    await expect(d).toHaveCount(0);
    expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  }
});

test('对齐与图层一次应用和撤销，保存刷新回显，窄屏可用', async ({ page }) => {
  const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  const original = (await region(page).boundingBox())!;
  let d = await open(page);
  await d.getByRole('button', { name: '水平居中', exact: true }).click();
  await d.getByRole('button', { name: '置于顶层', exact: true }).click();
  await page.screenshot({ path: 'screenshots/danmaku-settings-desktop.png' });
  await d.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(region(page)).toHaveCSS('z-index', '3');
  const area = (await page.frameLocator('.tox-edit-area iframe').locator('body').boundingBox())!;
  expect((await region(page).boundingBox())!.x).toBeCloseTo(area.x + (area.width - original.width) / 2, 0);
  expect((await region(page).boundingBox())!.y).toBeCloseTo(original.y, 0);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  await expect(region(page)).toHaveCSS('z-index', '3');
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  d = await open(page);
  await expect(page.getByRole('complementary', { name: '文字配置面板' })).toBeHidden();
  await expect(d.getByRole('button', { name: '水平居中', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(d.getByRole('button', { name: '置于顶层', exact: true })).toBeDisabled();
  await page.setViewportSize({ width: 390, height: 844 });
  const box = (await d.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(390);
  expect(box.y + box.height).toBeLessThanOrEqual(844);
  await page.screenshot({ path: 'screenshots/danmaku-settings-mobile.png' });
});

test('替换文档或进入只读会关闭设置，不误改新内容', async ({ page }) => {
  const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  const d = await open(page);
  await d.getByRole('button', { name: '贴右侧', exact: true }).click();
  await page.evaluate(() => window.tinymce.activeEditor.mode.set('readonly'));
  await expect(d).toHaveCount(0);
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await page.evaluate(() => window.tinymce.activeEditor.mode.set('design'));
  await open(page);
  await page.evaluate(() => window.tinymce.activeEditor.setContent('<p>新文档</p>'));
  await expect(d).toHaveCount(0);
  await expect(page.frameLocator('.tox-edit-area iframe').locator('body')).toHaveText('新文档');
});
