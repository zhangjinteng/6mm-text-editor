# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: image-settings.spec.ts >> 图片设置预览不修改原图，应用效果可撤销并保留到保存、预览和导出
- Location: tests/image-settings.spec.ts:20:1

# Error details

```
Error: expect(locator).toHaveCSS(expected) failed

Locator:  locator('.tox-edit-area iframe').contentFrame().locator('#photo')
Expected: "-1 -1"
Received: "-1"
Timeout:  20000ms

Call log:
  - Expect "toHaveCSS" locator('.tox-edit-area iframe').contentFrame().locator('#photo') with timeout 20000ms
  - waiting for locator('.tox-edit-area iframe').contentFrame().locator('#photo')
    43 × locator resolved to <img id="photo" width="200" height="100" data-mce-selected="1" data-image-settings="{"flipX":true,"flipY":true,"locked":false,"opacity":60,"radius":20,"brightness":120,"contrast":110,"saturation":80,"hue":30,"shadow":true,"shadowX":5,"shadowY":8,"shadowBlur":16,"shadowOpacity":25,"shadowColor":"#000000"}" data-mce-style="position: absolute; left: 150px; top: 100px; width: 200px; height: 100px; opacity: 0.6; border-radius: 20px; scale: -1; filter: brightness(120%) contrast(110%) saturate(80%) hue-ro…/>
       - unexpected value "-1"

```

```yaml
- img
```

# Test source

```ts
  1  | import { readFile } from 'node:fs/promises';
  2  | import { expect, test, type Page } from '@playwright/test';
  3  | import type { Editor } from 'tinymce';
  4  | declare global { interface Window { tinymce: { activeEditor: Editor } } }
  5  | async function setup(page: Page) {
  6  |   await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  7  |   await page.evaluate(async () => {
  8  |     const canvas = document.createElement('canvas'); canvas.width = 200; canvas.height = 100;
  9  |     const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#ed6038'; ctx.fillRect(0, 0, 100, 100); ctx.fillStyle = '#38a0df'; ctx.fillRect(100, 0, 100, 100);
  10 |     const e = window.tinymce.activeEditor;
  11 |     e.setContent(`<p><img id="photo" src="${canvas.toDataURL()}" width="200" height="100" style="position:absolute;left:150px;top:100px;width:200px;height:100px"></p>`);
  12 |     await e.uploadImages(); e.undoManager.clear(); e.undoManager.add();
  13 |   });
  14 | }
  15 | async function open(page: Page) {
  16 |   await page.frameLocator('.tox-edit-area iframe').locator('#photo').click();
  17 |   await page.locator('.tox-pop:visible [data-mce-name="imagesettings"]').click();
  18 |   return page.getByRole('dialog', { name: '图片设置', exact: true });
  19 | }
  20 | test('图片设置预览不修改原图，应用效果可撤销并保留到保存、预览和导出', async ({ page }) => {
  21 |   await setup(page);
  22 |   const frame = page.frameLocator('.tox-edit-area iframe'); const image = frame.locator('#photo');
  23 |   const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  24 |   let dialog = await open(page);
  25 |   await dialog.getByLabel('水平翻转', { exact: true }).check();
  26 |   await dialog.getByRole('tab', { name: '外观', exact: true }).click();
  27 |   await dialog.getByRole('slider', { name: '不透明度', exact: true }).fill('60');
  28 |   await dialog.getByRole('slider', { name: '圆角', exact: true }).fill('20');
  29 |   await expect(dialog.locator('img')).toHaveCSS('opacity', '0.6');
  30 |   expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  31 |   await dialog.getByRole('button', { name: '取消', exact: true }).click();
  32 |   expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  33 |   dialog = await open(page);
  34 |   await dialog.getByLabel('水平翻转', { exact: true }).check();
  35 |   await dialog.getByLabel('垂直翻转', { exact: true }).check();
  36 |   await dialog.getByRole('tab', { name: '外观', exact: true }).click();
  37 |   for (const [name, value] of [['不透明度', '60'], ['圆角', '20'], ['亮度', '120'], ['对比度', '110'], ['饱和度', '80'], ['色相', '30']]) await dialog.getByRole('slider', { name, exact: true }).fill(value!);
  38 |   await dialog.getByRole('tab', { name: '阴影', exact: true }).click();
  39 |   await dialog.getByLabel('启用阴影', { exact: true }).check();
  40 |   await dialog.getByRole('slider', { name: '水平偏移', exact: true }).fill('5');
  41 |   await page.screenshot({ path: 'test-results/image-settings-panel.png' });
  42 |   await dialog.getByRole('button', { name: '应用设置', exact: true }).click();
  43 |   await expect(dialog).toHaveCount(0);
  44 |   await expect(image).toHaveCSS('opacity', '0.6'); await expect(image).toHaveCSS('border-radius', '20px');
> 45 |   await expect(image).toHaveCSS('scale', '-1 -1');
     |                       ^ Error: expect(locator).toHaveCSS(expected) failed
  46 |   await expect(image).toHaveCSS('filter', 'brightness(1.2) contrast(1.1) saturate(0.8) hue-rotate(30deg)');
  47 |   await expect(image).toHaveCSS('box-shadow', 'rgba(0, 0, 0, 0.25) 5px 8px 16px 0px');
  48 |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo()); await expect(image).not.toHaveAttribute('data-image-settings');
  49 |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo()); await expect(image).toHaveCSS('opacity', '0.6');
  50 |   await page.getByRole('button', { name: '保存文档', exact: true }).click();
  51 |   await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  52 |   await expect(image).toHaveCSS('scale', '-1 -1'); await expect(image).toHaveCSS('opacity', '0.6');
  53 |   await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  54 |   await expect(page.frameLocator('iframe[title="文档预览"]').locator('#photo')).toHaveCSS('opacity', '0.6');
  55 |   await page.getByRole('button', { name: '导出', exact: true }).click(); const downloaded = page.waitForEvent('download');
  56 |   await page.getByRole('button', { name: 'HTML 文档', exact: true }).click();
  57 |   const html = await readFile(await (await downloaded).path(), 'utf8'); expect(html).toContain('data-image-settings'); expect(html).toContain('hue-rotate(30deg)');
  58 | });
  59 | test('锁定后禁止移动、缩放、铺满和对齐，解锁后恢复，翻转不破坏拖动', async ({ page }) => {
  60 |   await setup(page); const frame = page.frameLocator('.tox-edit-area iframe'); const image = frame.locator('#photo');
  61 |   let dialog = await open(page); await dialog.getByLabel('水平翻转', { exact: true }).check(); await dialog.getByLabel('锁定位置与尺寸', { exact: true }).check();
  62 |   await dialog.getByRole('button', { name: '应用设置', exact: true }).click();
  63 |   await expect(image).toHaveAttribute('data-image-locked', 'true'); await image.click();
  64 |   const original = (await image.boundingBox())!;
  65 |   await page.mouse.move(original.x + 50, original.y + 50); await page.mouse.down(); await page.mouse.move(original.x + 110, original.y + 90, { steps: 6 }); await page.mouse.up();
  66 |   expect(await image.boundingBox()).toEqual(original);
  67 |   await expect(frame.locator('#objectResizeHandlenw')).toBeHidden();
  68 |   await page.evaluate(() => { const e = window.tinymce.activeEditor; e.selection.select(e.getBody().querySelector('img')!); e.execCommand('mceImageFill'); e.execCommand('JustifyRight'); });
  69 |   expect(await image.boundingBox()).toEqual(original);
  70 |   dialog = await open(page); await dialog.getByLabel('锁定位置与尺寸', { exact: true }).uncheck(); await dialog.getByRole('button', { name: '应用设置', exact: true }).click();
  71 |   await image.click(); await expect(frame.locator('#objectResizeHandlenw')).toBeVisible();
  72 |   await page.mouse.move(original.x + 50, original.y + 50); await page.mouse.down(); await page.mouse.move(original.x + 110, original.y + 90, { steps: 6 }); await page.mouse.up();
  73 |   const moved = (await image.boundingBox())!; expect(moved.x).toBeCloseTo(original.x + 60, 0); expect(moved.y).toBeCloseTo(original.y + 40, 0);
  74 |   await expect(image).toHaveCSS('scale', '-1 1');
  75 | });
  76 | test('本地替换保留位置尺寸与效果、清除旧裁剪，坏地址不应用，效果可重置', async ({ page }) => {
  77 |   await setup(page); const image = page.frameLocator('.tox-edit-area iframe').locator('#photo');
  78 |   await page.evaluate(() => { const e = window.tinymce.activeEditor; const i = e.getBody().querySelector('img')!; e.dom.setAttrib(i, 'data-image-crop', '{"x":0.5,"y":0,"width":0.5,"height":1}'); e.dom.setStyle(i, 'object-view-box', 'inset(0% 0% 0% 50%)'); });
  79 |   const original = (await image.boundingBox())!; const oldSrc = await image.getAttribute('src');
  80 |   let dialog = await open(page);
  81 |   await dialog.getByLabel('图片地址', { exact: true }).fill('javascript:alert(1)');
  82 |   await dialog.getByRole('button', { name: '应用设置', exact: true }).click();
  83 |   await expect(dialog.getByRole('alert')).toContainText('HTTP'); await expect(image).toHaveAttribute('src', oldSrc!);
  84 |   await dialog.locator('input[type=file]').setInputFiles({ name: 'new.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="80" height="160"><rect width="80" height="160" fill="green"/></svg>') });
  85 |   await expect(dialog.locator('img')).toHaveAttribute('src', /^data:image\/svg\+xml/);
  86 |   await dialog.getByRole('tab', { name: '外观', exact: true }).click(); await dialog.getByRole('slider', { name: '不透明度', exact: true }).fill('70');
  87 |   await dialog.getByRole('button', { name: '应用设置', exact: true }).click();
  88 |   await expect(dialog).toHaveCount(0); expect(await image.boundingBox()).toEqual(original);
  89 |   await expect(image).not.toHaveAttribute('data-image-crop'); await expect(image).toHaveCSS('object-view-box', 'none'); await expect(image).toHaveCSS('opacity', '0.7');
  90 |   dialog = await open(page); await dialog.getByRole('button', { name: '重置效果', exact: true }).click(); await dialog.getByRole('button', { name: '应用设置', exact: true }).click();
  91 |   await expect(image).toHaveCSS('opacity', '1'); await expect(image).toHaveCSS('border-radius', '0px');
  92 | });
  93 | 
```