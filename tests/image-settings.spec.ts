import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import type { Editor } from 'tinymce';
declare global { interface Window { tinymce: { activeEditor: Editor } } }
async function setup(page: Page) {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(async () => {
    const canvas = document.createElement('canvas'); canvas.width = 200; canvas.height = 100;
    const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#ed6038'; ctx.fillRect(0, 0, 100, 100); ctx.fillStyle = '#38a0df'; ctx.fillRect(100, 0, 100, 100);
    const e = window.tinymce.activeEditor;
    e.setContent(`<p><img id="photo" src="${canvas.toDataURL()}" width="200" height="100" style="position:absolute;left:150px;top:100px;width:200px;height:100px"></p>`);
    await e.uploadImages(); e.undoManager.clear(); e.undoManager.add();
  });
}
async function open(page: Page) {
  await page.frameLocator('.tox-edit-area iframe').locator('#photo').click();
  await page.locator('.tox-pop:visible [data-mce-name="imagesettings"]').click();
  return page.getByRole('dialog', { name: '图片设置', exact: true });
}
test('图片设置预览不修改原图，应用效果可撤销并保留到保存、预览和导出', async ({ page }) => {
  await setup(page);
  const frame = page.frameLocator('.tox-edit-area iframe'); const image = frame.locator('#photo');
  const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  let dialog = await open(page);
  await dialog.getByLabel('水平翻转', { exact: true }).check();
  await dialog.getByRole('tab', { name: '外观', exact: true }).click();
  await dialog.getByRole('slider', { name: '不透明度', exact: true }).fill('60');
  await dialog.getByRole('slider', { name: '圆角', exact: true }).fill('20');
  await expect(dialog.locator('img')).toHaveCSS('opacity', '0.6');
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await dialog.getByRole('button', { name: '取消', exact: true }).click();
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  dialog = await open(page);
  await dialog.getByLabel('水平翻转', { exact: true }).check();
  await dialog.getByLabel('垂直翻转', { exact: true }).check();
  await dialog.getByRole('tab', { name: '外观', exact: true }).click();
  for (const [name, value] of [['不透明度', '60'], ['圆角', '20'], ['亮度', '120'], ['对比度', '110'], ['饱和度', '80'], ['色相', '30']]) await dialog.getByRole('slider', { name, exact: true }).fill(value!);
  await dialog.getByRole('tab', { name: '阴影', exact: true }).click();
  await dialog.getByLabel('启用阴影', { exact: true }).check();
  await dialog.getByRole('slider', { name: '水平偏移', exact: true }).fill('5');
  await page.screenshot({ path: '/tmp/test44-image-settings-panel.png' });
  await dialog.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(image).toHaveCSS('opacity', '0.6'); await expect(image).toHaveCSS('border-radius', '20px');
  await expect(image).toHaveCSS('scale', '-1');
  await expect(image).toHaveCSS('filter', 'brightness(1.2) contrast(1.1) saturate(0.8) hue-rotate(30deg)');
  await expect(image).toHaveCSS('box-shadow', 'rgba(0, 0, 0, 0.25) 5px 8px 16px 0px');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo()); await expect(image).not.toHaveAttribute('data-image-settings');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo()); await expect(image).toHaveCSS('opacity', '0.6');
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(image).toHaveCSS('scale', '-1'); await expect(image).toHaveCSS('opacity', '0.6');
  await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  await expect(page.frameLocator('iframe[title="文档预览"]').locator('#photo')).toHaveCSS('opacity', '0.6');
  await page.getByRole('button', { name: '导出', exact: true }).click(); const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'HTML 文档', exact: true }).click();
  const html = await readFile(await (await downloaded).path(), 'utf8'); expect(html).toContain('data-image-settings'); expect(html).toContain('hue-rotate(30deg)');
});
test('锁定后禁止移动、缩放、铺满和对齐，解锁后恢复，翻转不破坏拖动', async ({ page }) => {
  await setup(page); const frame = page.frameLocator('.tox-edit-area iframe'); const image = frame.locator('#photo');
  let dialog = await open(page); await dialog.getByLabel('水平翻转', { exact: true }).check(); await dialog.getByLabel('锁定位置与尺寸', { exact: true }).check();
  await dialog.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(image).toHaveAttribute('data-image-locked', 'true'); await image.click();
  const original = (await image.boundingBox())!;
  await page.mouse.move(original.x + 50, original.y + 50); await page.mouse.down(); await page.mouse.move(original.x + 110, original.y + 90, { steps: 6 }); await page.mouse.up();
  expect(await image.boundingBox()).toEqual(original);
  await expect(frame.locator('#objectResizeHandlenw')).toBeHidden();
  await page.evaluate(() => { const e = window.tinymce.activeEditor; e.selection.select(e.getBody().querySelector('img')!); e.execCommand('mceImageFill'); e.execCommand('JustifyRight'); });
  expect(await image.boundingBox()).toEqual(original);
  dialog = await open(page); await dialog.getByLabel('锁定位置与尺寸', { exact: true }).uncheck(); await dialog.getByRole('button', { name: '应用设置', exact: true }).click();
  await image.click(); await expect(frame.locator('#objectResizeHandlenw')).toBeVisible();
  await page.mouse.move(original.x + 50, original.y + 50); await page.mouse.down(); await page.mouse.move(original.x + 110, original.y + 90, { steps: 6 }); await page.mouse.up();
  const moved = (await image.boundingBox())!; expect(moved.x).toBeCloseTo(original.x + 60, 0); expect(moved.y).toBeCloseTo(original.y + 40, 0);
  await expect(image).toHaveCSS('scale', '-1 1');
});
test('本地替换保留位置尺寸与效果、清除旧裁剪，坏地址不应用，效果可重置', async ({ page }) => {
  await setup(page); const image = page.frameLocator('.tox-edit-area iframe').locator('#photo');
  await page.evaluate(() => { const e = window.tinymce.activeEditor; const i = e.getBody().querySelector('img')!; e.dom.setAttrib(i, 'data-image-crop', '{"x":0.5,"y":0,"width":0.5,"height":1}'); e.dom.setStyle(i, 'object-view-box', 'inset(0% 0% 0% 50%)'); });
  const original = (await image.boundingBox())!; const oldSrc = await image.getAttribute('src');
  let dialog = await open(page);
  await dialog.getByLabel('图片地址', { exact: true }).fill('javascript:alert(1)');
  await dialog.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('HTTP'); await expect(image).toHaveAttribute('src', oldSrc!);
  await dialog.locator('input[type=file]').setInputFiles({ name: 'new.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="160"><rect width="80" height="160" fill="green"/></svg>') });
  await expect(dialog.locator('img')).toHaveAttribute('src', /^data:image\/svg\+xml/);
  await dialog.getByRole('tab', { name: '外观', exact: true }).click(); await dialog.getByRole('slider', { name: '不透明度', exact: true }).fill('70');
  await dialog.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(dialog).toHaveCount(0); expect(await image.boundingBox()).toEqual(original);
  await expect(image).not.toHaveAttribute('data-image-crop'); await expect(image).toHaveCSS('object-view-box', 'none'); await expect(image).toHaveCSS('opacity', '0.7');
  dialog = await open(page); await dialog.getByRole('button', { name: '重置效果', exact: true }).click(); await dialog.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(image).toHaveCSS('opacity', '1'); await expect(image).toHaveCSS('border-radius', '0px');
});

test('远程替换支持无 CORS 图片，关闭或 Esc 不写入，窄屏页签可用', async ({ page }) => {
  await setup(page);
  await page.route('https://image-settings.test/**', route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="80"><rect width="120" height="80" fill="#147d64"/></svg>' }));
  const image = page.frameLocator('.tox-edit-area iframe').locator('#photo'); const oldSource = await image.getAttribute('src');
  let dialog = await open(page);
  await dialog.getByLabel('图片地址', { exact: true }).fill('https://image-settings.test/new.svg');
  await dialog.getByRole('tab', { name: '外观', exact: true }).click();
  await expect(dialog.locator('img')).toHaveAttribute('src', 'https://image-settings.test/new.svg');
  await page.keyboard.press('Escape'); await expect(dialog).toHaveCount(0); await expect(image).toHaveAttribute('src', oldSource!);
  dialog = await open(page);
  await dialog.getByLabel('图片地址', { exact: true }).fill('https://image-settings.test/new.svg');
  await dialog.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(image).toHaveAttribute('src', 'https://image-settings.test/new.svg');
  await page.getByRole('button', { name: '收起直播弹幕', exact: true }).click();
  dialog = await open(page);
  // 在打开的面板上改变视口，独立验证面板的响应式布局。
  await page.setViewportSize({ width: 390, height: 844 });
  const box = (await dialog.boundingBox())!; expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(390);
  await dialog.getByRole('tab', { name: '图片', exact: true }).focus();
  await page.keyboard.press('ArrowRight'); await expect(dialog.getByRole('tab', { name: '外观', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.screenshot({ path: '/tmp/test44-image-settings-mobile.png' });
  await dialog.getByRole('button', { name: '取消', exact: true }).click();
});
