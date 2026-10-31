import { expect, test, type Page } from '@playwright/test';
const frame = (page: Page) => page.frameLocator('.tox-edit-area iframe');
const panel = (page: Page) => page.getByRole('complementary', { name: '文字配置面板' });
const content = (page: Page) => page.evaluate(() => window.tinymce.activeEditor.getContent());
const order = (page: Page) => page.evaluate(() => Array.from(window.tinymce.activeEditor.getBody().querySelectorAll<HTMLElement>('#a,#b,#image')).sort((a,b) => Number(a.style.zIndex) - Number(b.style.zIndex)).map(node => node.id));
async function modal(page: Page) {
  await page.locator('.tox-pop:visible [data-mce-name="textsettings"]').click();
  const dialog = page.getByRole('dialog', { name: '文字设置', exact: true });
  await dialog.getByRole('tab', { name: '对象', exact: true }).click();
  return dialog;
}
test.beforeEach(async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    e.setContent('<p><span id="a" data-text-draggable="true" style="position:absolute;left:80px;top:80px;width:240px;font-size:32px;z-index:5">调整图层文字</span><span id="b" data-text-draggable="true" style="position:absolute;left:80px;top:200px;z-index:10">另一个文字</span><img id="image" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="position:absolute;left:400px;top:80px;width:100px;height:100px;z-index:15"></p>');
    e.undoManager.clear(); e.undoManager.add();
  });
  await frame(page).locator('#a').click();
});
test('侧栏四种图层操作即时生效，边界禁用，保存重载并支持撤销', async ({ page }) => {
  await expect(page.locator('.tox-pop:visible [data-mce-name="layersettings"]')).toHaveCount(0);
  await panel(page).getByRole('tab', { name: '对象', exact: true }).click();
  await expect(panel(page).getByRole('button', { name: '下一层', exact: true })).toBeDisabled();
  await panel(page).getByRole('button', { name: '上一层', exact: true }).click();
  expect(await order(page)).toEqual(['b','a','image']);
  await panel(page).getByRole('button', { name: '置于顶层', exact: true }).click();
  expect(await order(page)).toEqual(['b','image','a']);
  await expect(panel(page).getByRole('button', { name: '上一层', exact: true })).toBeDisabled();
  await panel(page).getByRole('button', { name: '下一层', exact: true }).click();
  expect(await order(page)).toEqual(['b','a','image']);
  await panel(page).getByRole('button', { name: '置于底层', exact: true }).click();
  expect(await order(page)).toEqual(['a','b','image']);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  expect(await order(page)).toEqual(['b','a','image']);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  expect(await order(page)).toEqual(['a','b','image']);
  await page.getByRole('button', { name: '保存文档', exact: true }).click(); await page.reload();
  await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  expect(await order(page)).toEqual(['a','b','image']);
  await frame(page).locator('#a').click(); await panel(page).getByRole('tab', { name: '对象', exact: true }).click();
  await panel(page).getByRole('checkbox', { name: '锁定文本框', exact: true }).check();
  for (const name of ['上一层','下一层','置于顶层','置于底层']) await expect(panel(page).getByRole('button', { name, exact: true })).toBeDisabled();
  await page.screenshot({ path: 'screenshots/text-layer-panel.png' });
});
test('弹窗层级草稿可取消，与字体修改一起应用并一次撤销', async ({ page }) => {
  const before = await content(page);
  await page.evaluate(() => { const e = window.tinymce.activeEditor; e.focus(); e.selection.select(e.getBody().querySelector('#a')!, true); e.dispatch('mouseup'); });
  await expect(page.locator('.tox-pop:visible [data-mce-name="layersettings"]')).toHaveCount(0);
  let d = await modal(page);
  await d.getByRole('button', { name: '置于顶层', exact: true }).click();
  await expect(d.locator('[data-layer-position]')).toHaveText('第 3 / 3 层');
  expect(await content(page)).toBe(before);
  await d.getByRole('button', { name: '取消', exact: true }).click();
  expect(await content(page)).toBe(before);
  d = await modal(page);
  await d.getByRole('button', { name: '上一层', exact: true }).click();
  await d.getByRole('tab', { name: '基础', exact: true }).click();
  await d.getByRole('textbox', { name: '字号', exact: true }).fill('40');
  await d.getByRole('tab', { name: '对象', exact: true }).click();
  await page.screenshot({ path: 'screenshots/text-layer-dialog.png' });
  await d.getByRole('button', { name: '应用设置', exact: true }).click();
  expect(await order(page)).toEqual(['b','a','image']);
  await expect(frame(page).locator('#a')).toHaveCSS('font-size', '40px');
  await expect(frame(page).locator('#a')).toHaveCSS('left', '80px');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  expect(await content(page)).toBe(before);
});
