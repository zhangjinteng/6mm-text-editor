# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: danmaku-settings.spec.ts >> 对齐与图层一次应用和撤销，保存刷新回显，窄屏可用
- Location: tests/danmaku-settings.spec.ts:40:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator:  getByRole('dialog', { name: '弹幕设置', exact: true }).getByRole('button', { name: '居中对齐', exact: true })
Expected: "true"
Received: "false"
Timeout:  20000ms

Call log:
  - Expect "toHaveAttribute" getByRole('dialog', { name: '弹幕设置', exact: true }).getByRole('button', { name: '居中对齐', exact: true }) with timeout 20000ms
  - waiting for getByRole('dialog', { name: '弹幕设置', exact: true }).getByRole('button', { name: '居中对齐', exact: true })
    43 × locator resolved to <button type="button" data-align="center" aria-pressed="false">居中对齐</button>
       - unexpected value "false"

```

```yaml
- button "居中对齐"
```

# Test source

```ts
  1  | import { expect, test, type Page } from '@playwright/test';
  2  | 
  3  | const region = (p: Page) => p.frameLocator('.tox-edit-area iframe').locator('#settings-danmaku');
  4  | const dialog = (p: Page) => p.getByRole('dialog', { name: '弹幕设置', exact: true });
  5  | async function open(page: Page) {
  6  |   await region(page).click({ position: { x: 20, y: 20 } });
  7  |   const toolbar = page.locator('.tox-pop:visible');
  8  |   await expect(toolbar.getByRole('button')).toHaveCount(2);
  9  |   await expect(toolbar.locator('[data-mce-name="layersettings"],[data-mce-name^="danmakualign"]')).toHaveCount(0);
  10 |   await toolbar.getByRole('button', { name: '弹幕设置', exact: true }).click();
  11 |   return dialog(page);
  12 | }
  13 | test.beforeEach(async ({ page }) => {
  14 |   await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  15 |   await page.evaluate(() => {
  16 |     const e = window.tinymce.activeEditor;
  17 |     e.setContent('<p><span id="lower" data-text-draggable="true" style="position:absolute;left:20px;top:30px;z-index:1">底层文字</span></p><div id="settings-danmaku" data-danmaku-id="settings" data-danmaku-source="current" style="position:absolute;left:100px;top:100px;width:220px;height:180px;background:#edf5f1;z-index:2"></div><p><span id="upper" data-text-draggable="true" style="position:absolute;left:420px;top:30px;z-index:3">上层文字</span></p>');
  18 |     e.undoManager.clear(); e.undoManager.add();
  19 |   });
  20 | });
  21 | 
  22 | test('工具栏收纳设置，草稿不改原对象；取消、关闭与 Esc 均丢弃', async ({ page }) => {
  23 |   const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  24 |   for (const exit of ['取消', '关闭弹幕设置', 'Escape']) {
  25 |     const d = await open(page);
  26 |     await d.getByRole('button', { name: '居中对齐', exact: true }).click();
  27 |     await d.getByRole('button', { name: '上一层', exact: true }).click();
  28 |     await expect(d.getByRole('button', { name: '置于顶层', exact: true })).toBeDisabled();
  29 |     await d.getByRole('button', { name: '下一层', exact: true }).click();
  30 |     await d.getByRole('button', { name: '置于底层', exact: true }).click();
  31 |     await expect(d.getByRole('button', { name: '下一层', exact: true })).toBeDisabled();
  32 |     expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  33 |     if (exit === 'Escape') await page.keyboard.press('Escape');
  34 |     else await d.getByRole('button', { name: exit, exact: true }).click();
  35 |     await expect(d).toHaveCount(0);
  36 |     expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  37 |   }
  38 | });
  39 | 
  40 | test('对齐与图层一次应用和撤销，保存刷新回显，窄屏可用', async ({ page }) => {
  41 |   const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  42 |   const original = (await region(page).boundingBox())!;
  43 |   let d = await open(page);
  44 |   await d.getByRole('button', { name: '居中对齐', exact: true }).click();
  45 |   await d.getByRole('button', { name: '置于顶层', exact: true }).click();
  46 |   await page.screenshot({ path: 'screenshots/danmaku-settings-desktop.png' });
  47 |   await d.getByRole('button', { name: '应用设置', exact: true }).click();
  48 |   await expect(region(page)).toHaveCSS('z-index', '3');
  49 |   const area = (await page.frameLocator('.tox-edit-area iframe').locator('body').boundingBox())!;
  50 |   expect((await region(page).boundingBox())!.x).toBeCloseTo(area.x + (area.width - original.width) / 2, 0);
  51 |   expect((await region(page).boundingBox())!.y).toBeCloseTo(original.y, 0);
  52 |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  53 |   expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  54 |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  55 |   await expect(region(page)).toHaveCSS('z-index', '3');
  56 |   await page.getByRole('button', { name: '保存文档', exact: true }).click();
  57 |   await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  58 |   d = await open(page);
  59 |   await page.screenshot({ path: 'screenshots/danmaku-settings-reopen-debug.png' });
  60 |   console.log(await page.locator('aside:visible').allTextContents());
> 61 |   await expect(d.getByRole('button', { name: '居中对齐', exact: true })).toHaveAttribute('aria-pressed', 'true');
     |                                                                      ^ Error: expect(locator).toHaveAttribute(expected) failed
  62 |   await expect(d.getByRole('button', { name: '置于顶层', exact: true })).toBeDisabled();
  63 |   await page.setViewportSize({ width: 390, height: 844 });
  64 |   const box = (await d.boundingBox())!;
  65 |   expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(390);
  66 |   expect(box.y + box.height).toBeLessThanOrEqual(844);
  67 |   await page.screenshot({ path: 'screenshots/danmaku-settings-mobile.png' });
  68 | });
  69 | 
  70 | test('替换文档或进入只读会关闭设置，不误改新内容', async ({ page }) => {
  71 |   const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  72 |   const d = await open(page);
  73 |   await d.getByRole('button', { name: '右对齐', exact: true }).click();
  74 |   await page.evaluate(() => window.tinymce.activeEditor.mode.set('readonly'));
  75 |   await expect(d).toHaveCount(0);
  76 |   expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  77 |   await page.evaluate(() => window.tinymce.activeEditor.mode.set('design'));
  78 |   await open(page);
  79 |   await page.evaluate(() => window.tinymce.activeEditor.setContent('<p>新文档</p>'));
  80 |   await expect(d).toHaveCount(0);
  81 |   await expect(page.frameLocator('.tox-edit-area iframe').locator('body')).toHaveText('新文档');
  82 | });
  83 | 
```