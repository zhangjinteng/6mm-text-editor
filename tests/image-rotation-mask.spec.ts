import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import type { Editor } from 'tinymce';
declare global { interface Window { tinymce: { activeEditor: Editor } } }
async function setup(page: Page) {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(async () => {
    const c = document.createElement('canvas'); c.width = 200; c.height = 100; const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#e56d32'; ctx.fillRect(0, 0, 100, 100); ctx.fillStyle = '#147d64'; ctx.fillRect(100, 0, 100, 100);
    const e = window.tinymce.activeEditor;
    e.setContent(`<p><img id="rotated" src="${c.toDataURL()}" width="200" height="100" style="position:absolute;left:200px;top:150px;width:200px;height:100px"></p>`);
    await e.uploadImages(); e.undoManager.clear(); e.undoManager.add();
  });
}
async function open(page: Page) {
  await page.frameLocator('.tox-edit-area iframe').locator('#rotated').click();
  await page.locator('.tox-pop:visible [data-mce-name="imagesettings"]').click();
  return page.getByRole('dialog', { name: '图片设置', exact: true });
}
test('旋转与蒙版可预览、取消、应用、撤销、保存和导出，形状切换无残留', async ({ page }) => {
  await setup(page);
  const image = page.frameLocator('.tox-edit-area iframe').locator('#rotated');
  let d = await open(page);
  await d.getByRole('slider', { name: '旋转角度', exact: true }).fill('30');
  await d.getByRole('button', { name: '右转 90°', exact: false }).click();
  await expect(d.getByRole('slider', { name: '旋转角度', exact: true })).toHaveValue('120');
  await d.getByRole('button', { name: '左转 90°', exact: false }).click();
  await d.getByRole('tab', { name: '蒙版', exact: true }).click();
  for (const mask of ['圆形', '椭圆', '菱形', '三角形', '六边形', '星形', '向下渐隐', '柔边蒙版', '无蒙版']) {
    await d.getByRole('button', { name: mask, exact: true }).click();
    await expect(d.getByRole('button', { name: mask, exact: true })).toHaveAttribute('aria-pressed', 'true');
  }
  await expect(d.locator('img')).toHaveCSS('clip-path', 'none'); await expect(d.locator('img')).toHaveCSS('mask-image', 'none');
  await d.getByRole('button', { name: '菱形', exact: true }).click();
  await page.screenshot({ path: '/tmp/test44-rotation-mask.png' });
  await expect(image).toHaveCSS('rotate', 'none');
  await d.getByRole('button', { name: '取消', exact: true }).click();
  await expect(image).not.toHaveAttribute('data-image-settings');
  d = await open(page); await d.getByRole('slider', { name: '旋转角度', exact: true }).fill('30');
  await d.getByRole('tab', { name: '蒙版', exact: true }).click(); await d.getByRole('button', { name: '菱形', exact: true }).click();
  await d.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(image).toHaveCSS('rotate', '30deg'); await expect(image).toHaveCSS('clip-path', /polygon/);
  await expect(image).toHaveCSS('width', '200px'); await expect(image).toHaveCSS('height', '100px');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo()); await expect(image).toHaveCSS('rotate', 'none');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo()); await expect(image).toHaveCSS('rotate', '30deg');
  await page.getByRole('button', { name: '保存文档', exact: true }).click(); await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(image).toHaveCSS('rotate', '30deg'); await expect(image).toHaveCSS('clip-path', /polygon/);
  await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  await expect(page.frameLocator('iframe[title="文档预览"]').locator('#rotated')).toHaveCSS('rotate', '30deg');
  await page.getByRole('button', { name: '导出', exact: true }).click(); const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'HTML 文档', exact: true }).click();
  const html = await readFile(await (await download).path(), 'utf8'); expect(html).toContain('rotate: 30deg'); expect(html).toContain('clip-path: polygon');
});
for (const angle of [30, 90, -45]) test(`旋转 ${angle}° 并翻转后，拖动预览与提交一致，缩放固定对角且保持原比例`, async ({ page }) => {
  await setup(page); let d = await open(page);
  await d.getByRole('slider', { name: '旋转角度', exact: true }).fill(String(angle)); await d.getByLabel('水平翻转', { exact: true }).check();
  await d.getByRole('button', { name: '应用设置', exact: true }).click();
  const frame = page.frameLocator('.tox-edit-area iframe'), image = frame.locator('#rotated');
  for (let round = 0; round < 2; round++) {
    const before = (await image.boundingBox())!;
    await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2); await page.mouse.down();
    await page.mouse.move(before.x + before.width / 2 + 30, before.y + before.height / 2 + 20, { steps: 5 });
    const preview = (await image.boundingBox())!;
    expect(preview.x).toBeCloseTo(before.x + 30, 0); expect(preview.y).toBeCloseTo(before.y + 20, 0);
    await page.mouse.up(); const after = (await image.boundingBox())!;
    expect(after.x).toBeCloseTo(preview.x, 0); expect(after.y).toBeCloseTo(preview.y, 0);
    await expect(image).toHaveCSS('width', '200px'); await expect(image).toHaveCSS('height', '100px');
  }
  await image.click();
  const overlay = frame.locator('.object-selection-frame'); await expect(overlay).toHaveCSS('rotate', `${angle}deg`);
  const anchorBefore = (await frame.locator('#objectResizeHandlenw').boundingBox())!, handle = (await frame.locator('#objectResizeHandlese').boundingBox())!;
  const rad = angle * Math.PI / 180; const dx = 40 * Math.cos(rad) - 20 * Math.sin(rad), dy = 40 * Math.sin(rad) + 20 * Math.cos(rad);
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2); await page.mouse.down();
  await page.mouse.move(handle.x + handle.width / 2 + dx, handle.y + handle.height / 2 + dy, { steps: 6 });
  const during = (await image.boundingBox())!; await page.mouse.up();
  await expect(image).toHaveCSS('width', '240px'); await expect(image).toHaveCSS('height', '120px');
  const anchorAfter = (await frame.locator('#objectResizeHandlenw').boundingBox())!;
  expect(anchorAfter.x).toBeCloseTo(anchorBefore.x, 0); expect(anchorAfter.y).toBeCloseTo(anchorBefore.y, 0);
  const after = (await image.boundingBox())!; expect(after.x).toBeCloseTo(during.x, 0); expect(after.y).toBeCloseTo(during.y, 0);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo()); await expect(image).toHaveCSS('width', '200px');
});

test('旋转后裁剪和替换仍用原始布局尺寸，渐隐可保存并通过重置清除', async ({ page }) => {
  await setup(page); let d = await open(page);
  await d.getByRole('slider', { name: '旋转角度', exact: true }).fill('90');
  await d.getByRole('tab', { name: '蒙版', exact: true }).click(); await d.getByRole('button', { name: '向下渐隐', exact: true }).click();
  await d.getByRole('button', { name: '应用设置', exact: true }).click();
  const frame = page.frameLocator('.tox-edit-area iframe'), image = frame.locator('#rotated');
  await expect(image).toHaveCSS('mask-image', /linear-gradient/);
  await image.click(); await page.locator('.tox-pop:visible [data-mce-name="imagecrop"]').click();
  const crop = page.getByRole('dialog', { name: '裁剪图片', exact: true });
  await crop.getByRole('button', { name: '重置', exact: true }).click();
  await crop.getByRole('button', { name: '应用裁剪', exact: true }).click();
  await expect(image).toHaveCSS('width', '200px'); await expect(image).toHaveCSS('height', '100px');
  d = await open(page);
  await d.locator('input[type=file]').setInputFiles({ name: 'replacement.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="60" height="120"><rect width="60" height="120" fill="blue"/></svg>') });
  await expect(d.locator('img')).toHaveAttribute('src', /^data:image\/svg/);
  await d.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(image).toHaveCSS('width', '200px'); await expect(image).toHaveCSS('height', '100px'); await expect(image).toHaveCSS('rotate', '90deg');
  await page.getByRole('button', { name: '保存文档', exact: true }).click(); await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(image).toHaveCSS('mask-image', /linear-gradient/);
  d = await open(page); await d.getByRole('button', { name: '重置效果', exact: true }).click(); await d.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(image).toHaveCSS('rotate', '0deg'); await expect(image).toHaveCSS('mask-image', 'none'); await expect(image).toHaveCSS('clip-path', 'none');
});
