import { expect, test, type Page } from '@playwright/test';
import type { Editor } from 'tinymce';
declare global { interface Window { tinymce: { activeEditor: Editor } } }
const target = (page: Page) => page.frameLocator('.tox-edit-area iframe').locator('#paragraph-text');
const preview = (page: Page) => page.frameLocator('iframe[title="文字效果预览"]').locator('body > [data-text-draggable]');
async function open(page: Page) {
  await target(page).click();
  await expect(page.locator('.tox-pop:visible [data-mce-name="textgroupparagraph"]')).toHaveCount(0);
  await page.locator('.tox-pop:visible [data-mce-name="textsettings"]').click();
  const dialog = page.getByRole('dialog', { name: '文字设置', exact: true });
  await dialog.getByRole('tab', { name: '段落', exact: true }).click();
  return dialog;
}
test.beforeEach(async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    e.setContent('<p><span id="paragraph-text" data-text-draggable="true" style="position:absolute;left:60px;top:80px;width:260px;font-size:24px">段落设置<strong style="color:#147d64">保留颜色</strong><br>第二行</span></p>');
    e.undoManager.clear(); e.undoManager.add();
  });
});
test('段落在弹窗中预览、取消、应用、回显和撤销，正文及其他格式保留', async ({ page }) => {
  const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  let d = await open(page);
  await d.getByLabel('段落样式', { exact: true }).selectOption('h2');
  await d.getByLabel('文字方向', { exact: true }).selectOption('rtl');
  await d.getByLabel('引用段落', { exact: true }).check();
  await expect(preview(page).locator('[data-selection-heading="h2"]')).toHaveCSS('font-size', '21px');
  await expect(preview(page)).toHaveCSS('direction', 'rtl');
  await expect(preview(page)).toHaveCSS('border-inline-start-width', '3px');
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await d.getByRole('button', { name: '取消', exact: true }).click();
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  d = await open(page);
  await d.getByLabel('段落样式', { exact: true }).selectOption('h2');
  await d.getByLabel('文字方向', { exact: true }).selectOption('rtl');
  await d.getByLabel('引用段落', { exact: true }).check();
  await page.screenshot({ path: 'screenshots/text-settings-paragraph-desktop.png' });
  await d.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(target(page).locator('[data-selection-heading="h2"]')).toHaveCSS('font-size', '21px');
  await expect(target(page).locator('strong')).toHaveCSS('color', 'rgb(20, 125, 100)');
  await expect(target(page).locator('br')).toHaveCount(1);
  await expect(target(page)).toHaveCSS('direction', 'rtl');
  await expect(target(page)).toHaveAttribute('data-text-quote', 'true');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  d = await open(page);
  await expect(d.getByLabel('段落样式', { exact: true })).toHaveValue('h2');
  await expect(d.getByLabel('文字方向', { exact: true })).toHaveValue('rtl');
  await expect(d.getByLabel('引用段落', { exact: true })).toBeChecked();
  await d.getByRole('button', { name: '重置效果', exact: true }).click();
  await expect(d.getByLabel('段落样式', { exact: true })).toHaveValue('h2');
  await d.getByLabel('段落样式', { exact: true }).selectOption('p');
  await d.getByLabel('文字方向', { exact: true }).selectOption('ltr');
  await d.getByLabel('引用段落', { exact: true }).uncheck();
  await d.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(target(page).locator('[data-selection-heading="p"]')).toHaveCSS('font-size', '15px');
  await expect(target(page)).toHaveCSS('direction', 'ltr');
  await expect(target(page)).not.toHaveAttribute('data-text-quote');
  // Persisted HTML must restore the same editable structure and heading state.
  await page.evaluate(() => { const e = window.tinymce.activeEditor; e.setContent(e.getContent()); });
  d = await open(page);
  await expect(d.getByLabel('段落样式', { exact: true })).toHaveValue('p');
});
test('段落页在窄屏下可用，切换标题不会破坏填充变形', async ({ page }) => {
  let d = await open(page);
  await d.getByRole('tab', { name: '填充', exact: true }).click();
  await d.getByLabel('填充类型', { exact: true }).selectOption('gradient');
  await d.getByRole('tab', { name: '变形', exact: true }).click();
  await d.getByRole('button', { name: '上拱', exact: true }).click();
  await d.getByRole('tab', { name: '段落', exact: true }).click();
  await d.getByLabel('段落样式', { exact: true }).selectOption('h1');
  await expect(preview(page).locator('textPath').first()).toContainText('段落设置');
  await expect(preview(page).locator('linearGradient')).not.toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  const bounds = (await d.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.width).toBeLessThanOrEqual(390);
  await expect(d.getByLabel('段落样式', { exact: true })).toBeVisible();
  expect(await d.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.screenshot({ path: 'screenshots/text-settings-paragraph-mobile.png' });
  await d.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(target(page)).toHaveAttribute('data-text-curve', 'up');
  await expect(target(page).locator('[data-selection-heading="h1"]')).toHaveCSS('font-size', '32px');
});
