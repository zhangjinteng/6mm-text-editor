import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import type { Editor } from 'tinymce';
declare global { interface Window { tinymce: { activeEditor: Editor } } }
async function setup(page: Page) {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(async () => {
    const c = document.createElement('canvas'); c.width = 200; c.height = 100; const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#ff6842'; ctx.fillRect(0, 0, 100, 100); ctx.fillStyle = '#387bc0'; ctx.fillRect(100, 0, 100, 100);
    const e = window.tinymce.activeEditor; e.setContent(`<p><img id="effect" width="200" height="100" src="${c.toDataURL()}" style="position:absolute;left:200px;top:100px;width:200px;height:100px"></p>`);
    await e.uploadImages(); e.undoManager.clear(); e.undoManager.add();
  });
}
async function open(page: Page) {
  await page.frameLocator('.tox-edit-area iframe').locator('#effect').click();
  await page.locator('.tox-pop:visible [data-mce-name="imagesettings"]').click();
  return page.getByRole('dialog', { name: '图片设置', exact: true });
}
test('全部滤镜可预览并调强度，与基础调色叠加，取消不写入、原图清除滤镜', async ({ page }) => {
  await setup(page); const image = page.frameLocator('.tox-edit-area iframe').locator('#effect');
  const original = await page.evaluate(() => window.tinymce.activeEditor.getContent()); let d = await open(page);
  await d.getByRole('tab', { name: '滤镜', exact: true }).click();
  for (const name of ['黑白', '复古', '暖色', '冷色', '鲜艳', '柔和', '高反差']) {
    await d.getByRole('button', { name, exact: true }).click();
    await expect(d.getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'true');
  }
  await d.getByRole('button', { name: '黑白', exact: true }).click();
  await d.getByRole('slider', { name: '滤镜强度', exact: true }).fill('50');
  await expect(d.locator('img')).toHaveCSS('filter', /grayscale\(0.5\)/);
  await d.getByRole('tab', { name: '外观', exact: true }).click(); await d.getByRole('slider', { name: '亮度', exact: true }).fill('120');
  await expect(d.locator('img')).toHaveCSS('filter', /brightness\(1.2\).*grayscale\(0.5\)/);
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(original);
  await d.getByRole('button', { name: '取消', exact: true }).click(); expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(original);
  d = await open(page); await d.getByRole('tab', { name: '滤镜', exact: true }).click(); await d.getByRole('button', { name: '黑白', exact: true }).click();
  await d.getByRole('slider', { name: '滤镜强度', exact: true }).fill('0'); await expect(d.locator('img')).not.toHaveCSS('filter', /grayscale/);
  await d.getByRole('slider', { name: '滤镜强度', exact: true }).fill('50'); await d.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(image).toHaveCSS('filter', /grayscale\(0.5\)/);
  d = await open(page); await d.getByRole('tab', { name: '滤镜', exact: true }).click();
  await expect(d.getByRole('slider', { name: '滤镜强度', exact: true })).toHaveValue('50'); await d.getByRole('button', { name: '原图', exact: true }).click();
  await d.getByRole('button', { name: '应用设置', exact: true }).click(); await expect(image).not.toHaveCSS('filter', /grayscale/);
});
test('描边支持样式和颜色，保留旋转蒙版和外框尺寸，保存预览导出撤销均保留', async ({ page }) => {
  await setup(page); const frame = page.frameLocator('.tox-edit-area iframe'), image = frame.locator('#effect');
  let d = await open(page); await d.getByRole('slider', { name: '旋转角度', exact: true }).fill('30');
  await d.getByRole('tab', { name: '蒙版', exact: true }).click(); await d.getByRole('button', { name: '椭圆', exact: true }).click();
  await d.getByRole('tab', { name: '滤镜', exact: true }).click(); await d.getByRole('button', { name: '复古', exact: true }).click();
  await d.getByRole('tab', { name: '描边', exact: true }).click(); await d.getByLabel('启用描边', { exact: true }).check();
  await d.getByLabel('描边颜色', { exact: true }).fill('#ff0000'); await d.getByRole('slider', { name: '描边粗细', exact: true }).fill('8');
  for (const style of ['dashed', 'dotted', 'solid']) {
    await d.getByLabel('描边预设', { exact: true }).selectOption(style); await expect(d.locator('.image-settings-stroke-preview')).toBeVisible();
  }
  await page.screenshot({ path: '/tmp/test44-filter-stroke.png' });
  await d.getByRole('button', { name: '应用设置', exact: true }).click();
  const layer = frame.locator('[data-image-stroke-for]');
  await expect(layer).toHaveCount(1); await expect(layer).toHaveAttribute('data-stroke-method', 'path');
  await expect(image).toHaveCSS('outline-style', 'none');
  await expect(image).toHaveCSS('width', '200px'); await expect(image).toHaveCSS('height', '100px'); await expect(image).toHaveCSS('rotate', '30deg');
  await expect(image).toHaveCSS('clip-path', /ellipse/); await expect(image).toHaveCSS('filter', /sepia/);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo()); await expect(image).not.toHaveAttribute('data-image-settings');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo()); await expect(layer).toHaveCount(1);
  await page.getByRole('button', { name: '保存文档', exact: true }).click(); await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(layer).toHaveCount(1); await expect(image).toHaveCSS('filter', /sepia/);
  await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  await expect(page.frameLocator('iframe[title="文档预览"]').locator('[data-image-stroke-for]')).toHaveCount(1);
  await page.getByRole('button', { name: '导出', exact: true }).click(); const downloaded = page.waitForEvent('download'); await page.getByRole('button', { name: 'HTML 文档', exact: true }).click();
  const html = await readFile(await (await downloaded).path(), 'utf8'); expect(html).toContain('data-image-stroke-for'); expect(html).toContain('background-image:'); expect(html).toContain('sepia(');
  await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '编辑', exact: true }).click();
  d = await open(page); await d.getByRole('button', { name: '重置效果', exact: true }).click(); await d.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(layer).toHaveCount(0); await expect(image).toHaveCSS('outline-style', 'none'); await expect(image).not.toHaveCSS('filter', /sepia/);
});
