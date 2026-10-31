import { expect, test, type Page, type Locator } from '@playwright/test';
import type { Editor } from 'tinymce';
declare global { interface Window { tinymce: { activeEditor: Editor } } }
const box = (page: Page) => page.frameLocator('.tox-edit-area iframe').locator('body > p > #color-text');
const panel = (page: Page) => page.getByRole('complementary', { name: '文字配置面板' });
const picker = (page: Page) => page.locator('.text-color-popover:visible');
async function open(page: Page) {
  await box(page).click(); await page.locator('.tox-pop:visible [data-mce-name="textsettings"]').click();
  return page.getByRole('dialog', { name: '文字设置', exact: true });
}
async function choose(page: Page, scope: Locator, label: string, color = '#ff0000', opacity = '40') {
  await scope.getByRole('button', { name: label + '色板', exact: true }).click();
  const p = picker(page); await expect(p).toBeVisible();
  await p.getByRole('textbox', { name: 'HEX 颜色', exact: true }).fill(color);
  await p.getByRole('textbox', { name: '颜色不透明度', exact: true }).fill(opacity);
  return p;
}
test.beforeEach(async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => { const e = window.tinymce.activeEditor; e.setContent('<p><span id="color-text" data-text-draggable="true" style="position:absolute;left:90px;top:90px;width:320px;font-size:32px;color:#147d64">统一颜色选择</span></p><p><span id="second-text" data-text-draggable="true" style="position:absolute;left:90px;top:240px;color:#3598db">另一个对象</span></p>'); e.undoManager.clear(); e.undoManager.add(); });
});
test('文字颜色浮层支持透明度、作品色、隔离预览、取消、应用和撤销', async ({ page }) => {
  const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  let d = await open(page); let p = await choose(page, d, '文字颜色');
  await expect(p.getByRole('button', { name: '使用颜色 #3598db', exact: true })).toBeVisible();
  await expect(page.frameLocator('iframe[title="文字效果预览"]').locator('[data-text-draggable]')).toHaveCSS('color', 'rgba(255, 0, 0, 0.4)');
  await expect(box(page)).toHaveCSS('color', 'rgb(20, 125, 100)');
  await page.screenshot({ path: 'screenshots/text-color-picker-dialog.png' });
  await page.keyboard.press('Escape'); await expect(picker(page)).toHaveCount(0); await expect(d).toBeVisible();
  await d.getByRole('button', { name: '取消', exact: true }).click();
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  d = await open(page); await choose(page, d, '文字颜色');
  await page.keyboard.press('Escape'); await d.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(box(page)).toHaveCSS('color', 'rgba(255, 0, 0, 0.4)');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
});
test('背景、高亮、描边、投影、填充与渐变色标均使用统一控件并回显透明度', async ({ page }) => {
  const d = await open(page);
  await choose(page, d, '背景颜色', '#112233', '30'); await page.keyboard.press('Escape');
  await d.getByRole('tab', { name: '外观', exact: true }).click(); await d.getByRole('tab', { name: '描边', exact: true }).click();
  await d.getByLabel('启用文字描边', { exact: true }).check();
  await choose(page, d, '描边颜色', '#445566', '60'); await page.keyboard.press('Escape');
  for (const [tab, label] of [['投影', '投影颜色'], ['背景', '背景颜色']]) {
    await d.getByRole('tab', { name: tab, exact: true }).click(); await d.getByRole('button', { name: `添加${tab}`, exact: true }).click();
    await choose(page, d, label!, '#336699', '25'); await page.keyboard.press('Escape');
    await expect(d.getByRole('textbox', { name: `${tab}不透明度`, exact: true })).toHaveValue('25');
    await d.getByRole('button', { name: label + '色板', exact: true }).click();
    await expect(picker(page).getByRole('textbox', { name: '颜色不透明度', exact: true })).toHaveValue('25%'); await page.keyboard.press('Escape');
  }
  await d.getByRole('tab', { name: '填充', exact: true }).click();
  await d.getByRole('combobox', { name: '填充类型', exact: true }).selectOption('solid');
  await choose(page, d, '填充颜色', '#123456', '55'); await page.keyboard.press('Escape');
  await expect(d.getByRole('textbox', { name: '填充不透明度', exact: true })).toHaveValue('55');
  await d.getByRole('combobox', { name: '填充类型', exact: true }).selectOption('gradient');
  await choose(page, d, '色标颜色', '#abcdef', '35'); await page.keyboard.press('Escape');
  await expect(d.getByRole('textbox', { name: '色标不透明度', exact: true })).toHaveValue('35');
  await d.getByRole('slider', { name: '渐变色标 2', exact: true }).click();
  await d.getByRole('button', { name: '色标颜色色板', exact: true }).click();
  await expect(picker(page).getByRole('textbox', { name: 'HEX 颜色', exact: true })).toHaveValue('#3598db');
  await expect(picker(page).getByRole('textbox', { name: '颜色不透明度', exact: true })).toHaveValue('100%');
  await page.keyboard.press('Escape'); await d.getByRole('button', { name: '应用设置', exact: true }).click();
  const fills = await box(page).getAttribute('data-text-fills'); expect(JSON.parse(fills!)[0].stops[0]).toMatchObject({ color: '#abcdef', opacity: 35 });
  await expect(box(page)).toHaveAttribute('data-text-stroke-color', 'rgba(68,85,102,0.6)');
});
test('侧栏即时生效、键盘与拖动可用，切换对象关闭浮层', async ({ page }) => {
  await box(page).click(); const sidebar = panel(page);
  const p = await choose(page, sidebar, '文字颜色', '#112233', '70');
  await expect(box(page)).toHaveCSS('color', 'rgba(17, 34, 51, 0.7)');
  await p.getByRole('slider', { name: '色相', exact: true }).press('Home');
  const sv = p.getByRole('slider', { name: '饱和度与明度', exact: true });
  const bounds = (await sv.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width * .3, bounds.y + bounds.height * .3); await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width * .9, bounds.y + bounds.height * .1, { steps: 4 }); await page.mouse.up();
  await expect(p.getByRole('textbox', { name: 'HEX 颜色', exact: true })).not.toHaveValue('#112233');
  await p.getByRole('button', { name: '使用颜色 #3598db', exact: true }).click();
  await expect(box(page)).toHaveCSS('color', 'rgba(53, 152, 219, 0.7)');
  await page.screenshot({ path: 'screenshots/text-color-picker-sidebar.png' });
  await page.frameLocator('.tox-edit-area iframe').locator('body > p > #second-text').click();
  await expect(picker(page)).toHaveCount(0);
});
test('窄屏浮层保持在视口内，非法输入不改变颜色，取色器可用', async ({ page }) => {
  await page.addInitScript(() => { Object.assign(window, { EyeDropper: class { async open() { return { sRGBHex: '#aabbcc' }; } } }); });
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => { const e=window.tinymce.activeEditor; e.setContent('<p><span id="color-text" data-text-draggable="true" style="position:absolute;left:20px;top:30px;width:180px">窄屏取色</span></p>'); });
  const d = await open(page); await page.setViewportSize({ width: 390, height: 844 });
  const p = await choose(page, d, '文字颜色', '#112233', '100');
  await p.getByRole('textbox', { name: 'HEX 颜色', exact: true }).fill('#badcolor');
  await expect(p.getByRole('status')).toContainText('有效');
  await p.getByRole('button', { name: '屏幕取色', exact: true }).click();
  await expect(p.getByRole('textbox', { name: 'HEX 颜色', exact: true })).toHaveValue('#aabbcc');
  const bounds = (await p.boundingBox())!; expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.x + bounds.width).toBeLessThanOrEqual(390); expect(bounds.y + bounds.height).toBeLessThanOrEqual(844);
  await page.screenshot({ path: 'screenshots/text-color-picker-mobile.png' });
});
