# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: image-rotation-mask.spec.ts >> 旋转 -45° 并翻转后，拖动预览与提交一致，缩放固定对角且保持原比例
- Location: tests/image-rotation-mask.spec.ts:54:36

# Error details

```
Error: expect(locator).toHaveCSS(expected) failed

Locator:  locator('.tox-edit-area iframe').contentFrame().locator('#rotated')
Expected: "240px"
Received: "239.984px"
Timeout:  20000ms

Call log:
  - Expect "toHaveCSS" locator('.tox-edit-area iframe').contentFrame().locator('#rotated') with timeout 20000ms
  - waiting for locator('.tox-edit-area iframe').contentFrame().locator('#rotated')
    42 × locator resolved to <img width="200" id="rotated" height="100" data-mce-selected="1" data-mce-style="position: absolute; inset: 172.926px auto auto 261.194px; width: 240px; height: 120px; outline: none; outline-offset: 0px; opacity: 1; --image-animation-opacity: 1; border-radius: 0px; scale: -1 1; rotate: -45deg; transform-origin: 50% 50%; clip-path: none; mask-image: none; mask-mode: alpha; mask-size: 100% 100%; mask-repeat: no-repeat; filter: brightness(100%) contrast(100%) saturate(100%) hue-rotate(0deg); box-shado…/>
       - unexpected value "239.984px"

```

```yaml
- img
```

# Test source

```ts
  1   | import { readFile } from 'node:fs/promises';
  2   | import { expect, test, type Page } from '@playwright/test';
  3   | import type { Editor } from 'tinymce';
  4   | declare global { interface Window { tinymce: { activeEditor: Editor } } }
  5   | async function setup(page: Page) {
  6   |   await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  7   |   await page.evaluate(async () => {
  8   |     const c = document.createElement('canvas'); c.width = 200; c.height = 100; const ctx = c.getContext('2d')!;
  9   |     ctx.fillStyle = '#e56d32'; ctx.fillRect(0, 0, 100, 100); ctx.fillStyle = '#147d64'; ctx.fillRect(100, 0, 100, 100);
  10  |     const e = window.tinymce.activeEditor;
  11  |     e.setContent(`<p><img id="rotated" src="${c.toDataURL()}" width="200" height="100" style="position:absolute;left:200px;top:150px;width:200px;height:100px"></p>`);
  12  |     await e.uploadImages(); e.undoManager.clear(); e.undoManager.add();
  13  |   });
  14  | }
  15  | async function open(page: Page) {
  16  |   await page.frameLocator('.tox-edit-area iframe').locator('#rotated').click();
  17  |   await page.locator('.tox-pop:visible [data-mce-name="imagesettings"]').click();
  18  |   return page.getByRole('dialog', { name: '图片设置', exact: true });
  19  | }
  20  | test('旋转与蒙版可预览、取消、应用、撤销、保存和导出，形状切换无残留', async ({ page }) => {
  21  |   await setup(page);
  22  |   const image = page.frameLocator('.tox-edit-area iframe').locator('#rotated');
  23  |   let d = await open(page);
  24  |   await d.getByRole('slider', { name: '旋转角度', exact: true }).fill('30');
  25  |   await d.getByRole('button', { name: '右转 90°', exact: false }).click();
  26  |   await expect(d.getByRole('slider', { name: '旋转角度', exact: true })).toHaveValue('120');
  27  |   await d.getByRole('button', { name: '左转 90°', exact: false }).click();
  28  |   await d.getByRole('tab', { name: '蒙版', exact: true }).click();
  29  |   for (const mask of ['圆形', '椭圆', '菱形', '三角形', '六边形', '星形', '向下渐隐', '柔边蒙版', '无蒙版']) {
  30  |     await d.getByRole('button', { name: mask, exact: true }).click();
  31  |     await expect(d.getByRole('button', { name: mask, exact: true })).toHaveAttribute('aria-pressed', 'true');
  32  |   }
  33  |   await expect(d.locator('.image-settings-preview img')).toHaveCSS('clip-path', 'none'); await expect(d.locator('.image-settings-preview img')).toHaveCSS('mask-image', 'none');
  34  |   await d.getByRole('button', { name: '菱形', exact: true }).click();
  35  |   await page.screenshot({ path: '/tmp/test44-rotation-mask.png' });
  36  |   await expect(image).toHaveCSS('rotate', 'none');
  37  |   await d.getByRole('button', { name: '取消', exact: true }).click();
  38  |   await expect(image).not.toHaveAttribute('data-image-settings');
  39  |   d = await open(page); await d.getByRole('slider', { name: '旋转角度', exact: true }).fill('30');
  40  |   await d.getByRole('tab', { name: '蒙版', exact: true }).click(); await d.getByRole('button', { name: '菱形', exact: true }).click();
  41  |   await d.getByRole('button', { name: '应用设置', exact: true }).click();
  42  |   await expect(image).toHaveCSS('rotate', '30deg'); await expect(image).toHaveCSS('clip-path', /polygon/);
  43  |   await expect(image).toHaveCSS('width', '200px'); await expect(image).toHaveCSS('height', '100px');
  44  |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo()); await expect(image).toHaveCSS('rotate', 'none');
  45  |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo()); await expect(image).toHaveCSS('rotate', '30deg');
  46  |   await page.getByRole('button', { name: '保存文档', exact: true }).click(); await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  47  |   await expect(image).toHaveCSS('rotate', '30deg'); await expect(image).toHaveCSS('clip-path', /polygon/);
  48  |   await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  49  |   await expect(page.frameLocator('iframe[title="文档预览"]').locator('#rotated')).toHaveCSS('rotate', '30deg');
  50  |   await page.getByRole('button', { name: '导出', exact: true }).click(); const download = page.waitForEvent('download');
  51  |   await page.getByRole('button', { name: 'HTML 文档', exact: true }).click();
  52  |   const html = await readFile(await (await download).path(), 'utf8'); expect(html).toContain('rotate: 30deg'); expect(html).toContain('clip-path: polygon');
  53  | });
  54  | for (const angle of [30, 90, -45]) test(`旋转 ${angle}° 并翻转后，拖动预览与提交一致，缩放固定对角且保持原比例`, async ({ page }) => {
  55  |   await setup(page); let d = await open(page);
  56  |   await d.getByRole('slider', { name: '旋转角度', exact: true }).fill(String(angle)); await d.getByLabel('水平翻转', { exact: true }).check();
  57  |   await d.getByRole('button', { name: '应用设置', exact: true }).click();
  58  |   const frame = page.frameLocator('.tox-edit-area iframe'), image = frame.locator('#rotated');
  59  |   for (let round = 0; round < 2; round++) {
  60  |     const before = (await image.boundingBox())!;
  61  |     await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2); await page.mouse.down();
  62  |     await page.mouse.move(before.x + before.width / 2 + 30, before.y + before.height / 2 + 20, { steps: 5 });
  63  |     const preview = (await image.boundingBox())!;
  64  |     expect(preview.x).toBeCloseTo(before.x + 30, 0); expect(preview.y).toBeCloseTo(before.y + 20, 0);
  65  |     await page.mouse.up(); const after = (await image.boundingBox())!;
  66  |     expect(after.x).toBeCloseTo(preview.x, 0); expect(after.y).toBeCloseTo(preview.y, 0);
  67  |     await expect(image).toHaveCSS('width', '200px'); await expect(image).toHaveCSS('height', '100px');
  68  |   }
  69  |   await image.click();
  70  |   const overlay = frame.locator('.object-selection-frame'); await expect(overlay).toHaveCSS('rotate', `${angle}deg`);
  71  |   const anchorBefore = (await frame.locator('#objectResizeHandlenw').boundingBox())!, handle = (await frame.locator('#objectResizeHandlese').boundingBox())!;
  72  |   const rad = angle * Math.PI / 180; const dx = 40 * Math.cos(rad) - 20 * Math.sin(rad), dy = 40 * Math.sin(rad) + 20 * Math.cos(rad);
  73  |   await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2); await page.mouse.down();
  74  |   await page.mouse.move(handle.x + handle.width / 2 + dx, handle.y + handle.height / 2 + dy, { steps: 6 });
  75  |   const during = (await image.boundingBox())!; await page.mouse.up();
> 76  |   await expect(image).toHaveCSS('width', '240px'); await expect(image).toHaveCSS('height', '120px');
      |                       ^ Error: expect(locator).toHaveCSS(expected) failed
  77  |   const anchorAfter = (await frame.locator('#objectResizeHandlenw').boundingBox())!;
  78  |   expect(anchorAfter.x).toBeCloseTo(anchorBefore.x, 0); expect(anchorAfter.y).toBeCloseTo(anchorBefore.y, 0);
  79  |   const after = (await image.boundingBox())!; expect(after.x).toBeCloseTo(during.x, 0); expect(after.y).toBeCloseTo(during.y, 0);
  80  |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo()); await expect(image).toHaveCSS('width', '200px');
  81  | });
  82  | 
  83  | test('旋转后裁剪和替换仍用原始布局尺寸，渐隐可保存并通过重置清除', async ({ page }) => {
  84  |   await setup(page); let d = await open(page);
  85  |   await d.getByRole('slider', { name: '旋转角度', exact: true }).fill('90');
  86  |   await d.getByRole('tab', { name: '蒙版', exact: true }).click(); await d.getByRole('button', { name: '向下渐隐', exact: true }).click();
  87  |   await d.getByRole('button', { name: '应用设置', exact: true }).click();
  88  |   const frame = page.frameLocator('.tox-edit-area iframe'), image = frame.locator('#rotated');
  89  |   await expect(image).toHaveCSS('mask-image', /linear-gradient/);
  90  |   await image.click(); await page.locator('.tox-pop:visible [data-mce-name="imagesettings"]').click(); await page.getByRole('dialog',{name:'图片设置',exact:true}).getByRole('button',{name:'裁剪图片',exact:true}).click();
  91  |   const crop = page.getByRole('dialog', { name: '裁剪图片', exact: true });
  92  |   await crop.getByRole('button', { name: '重置', exact: true }).click();
  93  |   await crop.getByRole('button', { name: '应用裁剪', exact: true }).click();
  94  |   await page.getByRole('dialog', { name: '图片设置', exact: true }).getByRole('button', { name: '应用设置', exact: true }).click();
  95  |   await expect(image).toHaveCSS('width', '200px'); await expect(image).toHaveCSS('height', '100px');
  96  |   d = await open(page);
  97  |   await d.locator('input[data-image-file]').setInputFiles({ name: 'replacement.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="60" height="120"><rect width="60" height="120" fill="blue"/></svg>') });
  98  |   await expect(d.locator('.image-settings-preview img')).toHaveAttribute('src', /^data:image\/svg/);
  99  |   await d.getByRole('button', { name: '应用设置', exact: true }).click();
  100 |   await expect(image).toHaveCSS('width', '200px'); await expect(image).toHaveCSS('height', '100px'); await expect(image).toHaveCSS('rotate', '90deg');
  101 |   await page.getByRole('button', { name: '保存文档', exact: true }).click(); await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  102 |   await expect(image).toHaveCSS('mask-image', /linear-gradient/);
  103 |   d = await open(page); await d.getByRole('button', { name: '重置效果', exact: true }).click(); await d.getByRole('button', { name: '应用设置', exact: true }).click();
  104 |   await expect(image).toHaveCSS('rotate', '0deg'); await expect(image).toHaveCSS('mask-image', 'none'); await expect(image).toHaveCSS('clip-path', 'none');
  105 | });
  106 | 
```