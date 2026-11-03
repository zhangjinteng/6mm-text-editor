# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: toolbar-position.spec.ts >> 拖动文字的合并工具栏仅显示一个位置按钮，切换不更改正文
- Location: tests/toolbar-position.spec.ts:89:1

# Error details

```
Error: Timeout 20000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- generic [ref=f44e3]:
  - generic [ref=f44e4]: "[plugin:vite:import-analysis] Failed to resolve import \"./components/CanvasConfigPanel.vue\" from \"src/App.vue\". Does the file exist?"
  - generic [ref=f44e5]: /Users/mac/Downloads/test44/src/App.vue:12:30
  - generic [ref=f44e6]: "9 | import TextConfigPanel from \"./components/TextConfigPanel.vue\"; 10 | import ImageConfigPanel from \"./components/ImageConfigPanel.vue\"; 11 | import CanvasConfigPanel from \"./components/CanvasConfigPanel.vue\"; | ^ 12 | import { liveSession } from \"./live/session\"; 13 | import { bindDanmaku, bindDanmakuEditor } from \"./live/bindings\";"
  - generic [ref=f44e7]: at TransformPluginContext._formatLog (file:///Users/mac/Downloads/test44/node_modules/.pnpm/vite@8.3.5_@types+node@22.20.5/node_modules/vite/dist/node/chunks/node.js:8803:39) at TransformPluginContext.error (file:///Users/mac/Downloads/test44/node_modules/.pnpm/vite@8.3.5_@types+node@22.20.5/node_modules/vite/dist/node/chunks/node.js:8800:14) at resolveId (file:///Users/mac/Downloads/test44/node_modules/.pnpm/vite@8.3.5_@types+node@22.20.5/node_modules/vite/dist/node/chunks/node.js:26594:18) at async file:///Users/mac/Downloads/test44/node_modules/.pnpm/vite@8.3.5_@types+node@22.20.5/node_modules/vite/dist/node/chunks/node.js:26693:23 at async Promise.all (index 10) at async TransformPluginContext.transform (file:///Users/mac/Downloads/test44/node_modules/.pnpm/vite@8.3.5_@types+node@22.20.5/node_modules/vite/dist/node/chunks/node.js:26666:4) at async EnvironmentPluginContainer.transform (file:///Users/mac/Downloads/test44/node_modules/.pnpm/vite@8.3.5_@types+node@22.20.5/node_modules/vite/dist/node/chunks/node.js:8582:14) at async loadAndTransform (file:///Users/mac/Downloads/test44/node_modules/.pnpm/vite@8.3.5_@types+node@22.20.5/node_modules/vite/dist/node/chunks/node.js:20155:26)
  - generic [ref=f44e8]:
    - text: Click outside, press Esc key, or fix the code to dismiss.You can also disable this overlay by setting
    - code [ref=f44e9]: server.hmr.overlay
    - text: to
    - code [ref=f44e10]: "false"
    - text: in
    - code [ref=f44e11]: vite.config.ts
    - text: .
```

# Test source

```ts
  1   | import { textTool } from './helpers/text-tools';
  2   | import { expect, test, type Page } from '@playwright/test';
  3   | import type { Editor } from 'tinymce';
  4   | declare global { interface Window { tinymce: { activeEditor: Editor } } }
  5   | 
  6   | async function checkPosition(page: Page, mode: 'bottom' | 'right') {
  7   |   const popup = page.locator('.tox-pop:visible');
  8   |   await expect(popup).toHaveAttribute('data-editor-docked-toolbar', 'true');
  9   |   await expect(popup).toHaveAttribute('data-editor-toolbar-position', mode);
  10  |   await expect(popup.locator('[data-mce-name="toolbarposition"]')).toHaveCount(1);
  11  |   await expect.poll(async () => {
  12  |     // 检查实际显示的面板，不能只检查可能被原生 max-height 缩小的外层容器。
  13  |     const toolbar = (await popup.locator('.tox-pop__dialog').boundingBox())!;
  14  |     const area = (await page.locator('.tox-edit-area').boundingBox())!;
  15  |     return mode === 'bottom'
  16  |       ? Math.max(Math.abs(toolbar.x + toolbar.width / 2 - area.x - area.width / 2), Math.abs(area.y + area.height - toolbar.y - toolbar.height - 50))
  17  |       : Math.max(Math.abs(toolbar.y + toolbar.height / 2 - area.y - area.height / 2), Math.abs(area.x + area.width - toolbar.x - toolbar.width - 50));
> 18  |   }).toBeLessThan(2);
      |      ^ Error: Timeout 20000ms exceeded while waiting on the predicate
  19  |   await expect(popup.locator('[data-mce-name="toolbarposition"]')).toHaveAttribute('aria-pressed', mode === 'right' ? 'true' : 'false');
  20  |   const controls = popup.locator('.tox-toolbar__group > *');
  21  |   const boxes = await controls.evaluateAll(nodes => nodes.map(node => {
  22  |     const box = node.getBoundingClientRect();
  23  |     return { x: box.x, y: box.y, width: box.width, height: box.height };
  24  |   }).filter(box => box.width > 0 && box.height > 0));
  25  |   if (mode === 'right') {
  26  |     expect(boxes.length).toBeGreaterThan(1);
  27  |     for (let index = 1; index < boxes.length; index++) {
  28  |       expect(Math.abs(boxes[index].x + boxes[index].width / 2 - boxes[0].x - boxes[0].width / 2)).toBeLessThan(2);
  29  |       expect(boxes[index].y).toBeGreaterThanOrEqual(boxes[index - 1].y + boxes[index - 1].height - 1);
  30  |     }
  31  |   } else {
  32  |     expect(Math.max(...boxes.map(box => box.y)) - Math.min(...boxes.map(box => box.y))).toBeLessThan(2);
  33  |   }
  34  | 
  35  | }
  36  | 
  37  | test('图片原锚点空间较小时，居右工具栏仍按完整面板上下居中', async ({ page }) => {
  38  |   await page.setViewportSize({ width: 1863, height: 930 });
  39  |   await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  40  |   await page.evaluate(() => {
  41  |     window.tinymce.activeEditor.setContent('<p><img style="position:absolute;left:490px;top:180px" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" width="200" height="200"></p>');
  42  |   });
  43  |   await page.frameLocator('.tox-edit-area iframe').locator('img').click();
  44  |   await page.locator('.tox-pop:visible [data-mce-name="toolbarposition"]').click();
  45  |   await checkPosition(page, 'right');
  46  |   const popup = page.locator('.tox-pop:visible');
  47  |   await expect(popup).toHaveCSS('max-height', 'none');
  48  |   const container = (await popup.boundingBox())!;
  49  |   const panel = (await popup.locator('.tox-pop__dialog').boundingBox())!;
  50  |   expect(container.height).toBeCloseTo(panel.height, 0);
  51  |   await page.setViewportSize({ width: 1440, height: 1000 });
  52  |   await checkPosition(page, 'right');
  53  | });
  54  | 
  55  | test('文字、图片、弹幕工具栏共用居下/居右位置，切换对象和缩放布局保持状态', async ({ page }) => {
  56  |   await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  57  |   await page.evaluate(() => {
  58  |     const e = window.tinymce.activeEditor;
  59  |     e.setContent('<p id="text">选择这段文字</p><p><img src="data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"80\"/%3E" width="100" height="80" /></p><div data-danmaku-source="current" style="position:absolute;left:300px;top:180px;width:200px;height:100px">弹幕</div>');
  60  |     e.focus(); e.selection.select(e.getBody().querySelector('#text')!, true); e.fire('mouseup');
  61  |   });
  62  |   const popup = page.locator('.tox-pop:visible');
  63  |   await checkPosition(page, 'bottom');
  64  |   await expect(popup.locator('[data-mce-name="textsettings"]')).toBeVisible();
  65  |   await popup.locator('[data-mce-name="toolbarposition"]').click();
  66  |   await checkPosition(page, 'right');
  67  |   await (await textTool(page, 'forecolor-chevron')).click();
  68  |   await expect(page.locator('[data-mce-color="#E03E2D"]')).toBeVisible();
  69  |   await page.keyboard.press('Escape');
  70  |   await page.frameLocator('.tox-edit-area iframe').locator('img').click();
  71  |   await expect(popup.locator('[data-mce-name="imagefill"]')).toBeVisible();
  72  |   await checkPosition(page, 'right');
  73  |   await popup.locator('[data-mce-name="toolbarposition"]').click();
  74  |   await checkPosition(page, 'bottom');
  75  |   await page.frameLocator('.tox-edit-area iframe').locator('[data-danmaku-source]').click();
  76  |   await expect(popup.locator('[data-mce-name="danmakusettings"]')).toBeVisible();
  77  |   await checkPosition(page, 'bottom');
  78  |   await popup.locator('[data-mce-name="toolbarposition"]').click();
  79  |   await checkPosition(page, 'right');
  80  |   await page.setViewportSize({ width: 1200, height: 900 });
  81  |   await checkPosition(page, 'right');
  82  |   await popup.locator('[data-mce-name="toolbarposition"]').click();
  83  |   await checkPosition(page, 'bottom');
  84  |   await page.evaluate(() => { window.tinymce.activeEditor.focus(); window.tinymce.activeEditor.selection.select(window.tinymce.activeEditor.getBody().querySelector('#text')!, true); window.tinymce.activeEditor.fire('mouseup'); });
  85  |   await expect(popup.locator('[data-mce-name="textsettings"]')).toBeVisible();
  86  |   await checkPosition(page, 'bottom');
  87  | });
  88  | 
  89  | test('拖动文字的合并工具栏仅显示一个位置按钮，切换不更改正文', async ({ page }) => {
  90  |   await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  91  |   await page.evaluate(() => {
  92  |     const e = window.tinymce.activeEditor;
  93  |     e.setContent('<p><span data-text-draggable="true" style="display:inline-block">拖动文字</span></p>');
  94  |     e.focus(); e.selection.select(e.getBody().querySelector('span')!, true); e.fire('mouseup');
  95  |   });
  96  |   const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  97  |   const popup = page.locator('.tox-pop:visible');
  98  |   await checkPosition(page, 'bottom');
  99  |   await popup.locator('[data-mce-name="toolbarposition"]').click();
  100 |   await checkPosition(page, 'right');
  101 |   expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  102 | });
  103 | 
  104 | test('全屏仅在画布工具栏显示并可进入和退出全屏', async ({ page }) => {
  105 |   await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  106 |   await page.evaluate(() => {
  107 |     const e = window.tinymce.activeEditor;
  108 |     e.setContent('<p id="fullscreen-text">全屏回归文字</p><p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" width="100" height="80" alt="全屏图片"></p><div data-danmaku-source="current" style="position:absolute;left:300px;top:180px;width:180px;height:100px">弹幕</div>');
  109 |   });
  110 |   const frame = page.frameLocator('.tox-edit-area iframe');
  111 |   const popup = page.locator('.tox-pop:visible');
  112 |   for (const kind of ['text', 'image', 'danmaku', 'blank']) {
  113 |     if (kind === 'text') await page.evaluate(() => {
  114 |       const e = window.tinymce.activeEditor; e.focus(); e.selection.select(e.getBody().querySelector('#fullscreen-text')!, true); e.nodeChanged(); e.dispatch('mouseup');
  115 |     });
  116 |     else if (kind === 'image') await frame.locator('img').click();
  117 |     else if (kind === 'danmaku') await frame.locator('[data-danmaku-source]').click({ position: { x: 20, y: 20 } });
  118 |     else {
```