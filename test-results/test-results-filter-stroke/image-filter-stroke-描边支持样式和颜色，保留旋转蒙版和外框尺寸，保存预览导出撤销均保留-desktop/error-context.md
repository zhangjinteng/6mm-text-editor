# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: image-filter-stroke.spec.ts >> 描边支持样式和颜色，保留旋转蒙版和外框尺寸，保存预览导出撤销均保留
- Location: tests/image-filter-stroke.spec.ts:42:1

# Error details

```
Error: expect(locator).toHaveCSS(expected) failed

Locator:  locator('.tox-edit-area iframe').contentFrame().locator('#effect')
Expected: "none"
Received: "solid"
Timeout:  20000ms

Call log:
  - Expect "toHaveCSS" locator('.tox-edit-area iframe').contentFrame().locator('#effect') with timeout 20000ms
  - waiting for locator('.tox-edit-area iframe').contentFrame().locator('#effect')
    43 × locator resolved to <img id="effect" width="200" height="100" data-mce-selected="1" data-mce-style="position: absolute; left: 200px; top: 100px; width: 200px; height: 100px;" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABkCAYAAADDhn8LAAADMUlEQVR4AezTQW7bMBBAUSOn6rqn6R16udzMWRkQHEWOaFKc4bwCRRLbkjhv/D/u//7e/Y9j8Of/593/OAYfN/8IEPhRQCA/0niDwO0mEN8CAgcCAjnA8RaBgYHAJZBfQCD5d2iCgQICGYjr1vkFBJJ/hyYYKCCQgbhunV8gZyD53U2QREAgSRblmHMEBDLH3VOTCAgkyaIcc46AQOa4e2oSAYE8LcqfBLYCAtlq+J3Ak4BAnkD8SWArIJCtht8JPAkI5AnEnwS2AgLZa…/>
       - unexpected value "solid"

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
  8  |     const c = document.createElement('canvas'); c.width = 200; c.height = 100; const ctx = c.getContext('2d')!;
  9  |     ctx.fillStyle = '#ff6842'; ctx.fillRect(0, 0, 100, 100); ctx.fillStyle = '#387bc0'; ctx.fillRect(100, 0, 100, 100);
  10 |     const e = window.tinymce.activeEditor; e.setContent(`<p><img id="effect" width="200" height="100" src="${c.toDataURL()}" style="position:absolute;left:200px;top:100px;width:200px;height:100px"></p>`);
  11 |     await e.uploadImages(); e.undoManager.clear(); e.undoManager.add();
  12 |   });
  13 | }
  14 | async function open(page: Page) {
  15 |   await page.frameLocator('.tox-edit-area iframe').locator('#effect').click();
  16 |   await page.locator('.tox-pop:visible [data-mce-name="imagesettings"]').click();
  17 |   return page.getByRole('dialog', { name: '图片设置', exact: true });
  18 | }
  19 | test('全部滤镜可预览并调强度，与基础调色叠加，取消不写入、原图清除滤镜', async ({ page }) => {
  20 |   await setup(page); const image = page.frameLocator('.tox-edit-area iframe').locator('#effect');
  21 |   const original = await page.evaluate(() => window.tinymce.activeEditor.getContent()); let d = await open(page);
  22 |   await d.getByRole('tab', { name: '滤镜', exact: true }).click();
  23 |   for (const name of ['黑白', '复古', '暖色', '冷色', '鲜艳', '柔和', '高反差']) {
  24 |     await d.getByRole('button', { name, exact: true }).click();
  25 |     await expect(d.getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'true');
  26 |   }
  27 |   await d.getByRole('button', { name: '黑白', exact: true }).click();
  28 |   await d.getByRole('slider', { name: '滤镜强度', exact: true }).fill('50');
  29 |   await expect(d.locator('img')).toHaveCSS('filter', /grayscale\(0.5\)/);
  30 |   await d.getByRole('tab', { name: '外观', exact: true }).click(); await d.getByRole('slider', { name: '亮度', exact: true }).fill('120');
  31 |   await expect(d.locator('img')).toHaveCSS('filter', /brightness\(1.2\).*grayscale\(0.5\)/);
  32 |   expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(original);
  33 |   await d.getByRole('button', { name: '取消', exact: true }).click(); expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(original);
  34 |   d = await open(page); await d.getByRole('tab', { name: '滤镜', exact: true }).click(); await d.getByRole('button', { name: '黑白', exact: true }).click();
  35 |   await d.getByRole('slider', { name: '滤镜强度', exact: true }).fill('0'); await expect(d.locator('img')).not.toHaveCSS('filter', /grayscale/);
  36 |   await d.getByRole('slider', { name: '滤镜强度', exact: true }).fill('50'); await d.getByRole('button', { name: '应用设置', exact: true }).click();
  37 |   await expect(image).toHaveCSS('filter', /grayscale\(0.5\)/);
  38 |   d = await open(page); await d.getByRole('tab', { name: '滤镜', exact: true }).click();
  39 |   await expect(d.getByRole('slider', { name: '滤镜强度', exact: true })).toHaveValue('50'); await d.getByRole('button', { name: '原图', exact: true }).click();
  40 |   await d.getByRole('button', { name: '应用设置', exact: true }).click(); await expect(image).not.toHaveCSS('filter', /grayscale/);
  41 | });
  42 | test('描边支持样式和颜色，保留旋转蒙版和外框尺寸，保存预览导出撤销均保留', async ({ page }) => {
  43 |   await setup(page); const frame = page.frameLocator('.tox-edit-area iframe'), image = frame.locator('#effect');
  44 |   let d = await open(page); await d.getByRole('slider', { name: '旋转角度', exact: true }).fill('30');
  45 |   await d.getByRole('tab', { name: '蒙版', exact: true }).click(); await d.getByRole('button', { name: '椭圆', exact: true }).click();
  46 |   await d.getByRole('tab', { name: '滤镜', exact: true }).click(); await d.getByRole('button', { name: '复古', exact: true }).click();
  47 |   await d.getByRole('tab', { name: '描边', exact: true }).click(); await d.getByLabel('启用描边', { exact: true }).check();
  48 |   await d.getByLabel('描边颜色', { exact: true }).fill('#ff0000'); await d.getByRole('slider', { name: '描边粗细', exact: true }).fill('8');
  49 |   for (const style of ['dashed', 'dotted', 'solid']) {
  50 |     await d.getByLabel('描边样式', { exact: true }).selectOption(style); await expect(d.locator('img')).toHaveCSS('outline-style', style);
  51 |   }
  52 |   await page.screenshot({ path: '/tmp/test44-filter-stroke.png' });
  53 |   await d.getByRole('button', { name: '应用设置', exact: true }).click();
  54 |   await expect(image).toHaveCSS('outline-color', 'rgb(255, 0, 0)'); await expect(image).toHaveCSS('outline-width', '8px'); await expect(image).toHaveCSS('outline-offset', '-8px');
  55 |   await expect(image).toHaveCSS('width', '200px'); await expect(image).toHaveCSS('height', '100px'); await expect(image).toHaveCSS('rotate', '30deg');
  56 |   await expect(image).toHaveCSS('clip-path', /ellipse/); await expect(image).toHaveCSS('filter', /sepia/);
> 57 |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo()); await expect(image).toHaveCSS('outline-style', 'none');
     |                                                                                                  ^ Error: expect(locator).toHaveCSS(expected) failed
  58 |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo()); await expect(image).toHaveCSS('outline-width', '8px');
  59 |   await page.getByRole('button', { name: '保存文档', exact: true }).click(); await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  60 |   await expect(image).toHaveCSS('outline-width', '8px'); await expect(image).toHaveCSS('filter', /sepia/);
  61 |   await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  62 |   await expect(page.frameLocator('iframe[title="文档预览"]').locator('#effect')).toHaveCSS('outline-width', '8px');
  63 |   await page.getByRole('button', { name: '导出', exact: true }).click(); const downloaded = page.waitForEvent('download'); await page.getByRole('button', { name: 'HTML 文档', exact: true }).click();
  64 |   const html = await readFile(await (await downloaded).path(), 'utf8'); expect(html).toContain('outline:'); expect(html).toContain('sepia(');
  65 |   await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '编辑', exact: true }).click();
  66 |   d = await open(page); await d.getByRole('button', { name: '重置效果', exact: true }).click(); await d.getByRole('button', { name: '应用设置', exact: true }).click();
  67 |   await expect(image).toHaveCSS('outline-style', 'none'); await expect(image).not.toHaveCSS('filter', /sepia/);
  68 | });
  69 | 
```