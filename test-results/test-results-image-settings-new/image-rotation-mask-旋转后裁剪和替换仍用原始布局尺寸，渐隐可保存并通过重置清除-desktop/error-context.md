# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: image-rotation-mask.spec.ts >> 旋转后裁剪和替换仍用原始布局尺寸，渐隐可保存并通过重置清除
- Location: tests/image-rotation-mask.spec.ts:83:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('dialog', { name: '裁剪图片', exact: true }).getByRole('button', { name: '重置', exact: true })
    - locator resolved to <button type="button" data-ratio="reset">重置</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is not stable
  - retrying click action
    - waiting for element to be visible, enabled and stable
  - element was detached from the DOM, retrying

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - link "TinyMCE Studio" [ref=e5] [cursor=pointer]:
      - /url: /
      - generic [ref=e11]:
        - text: TinyMCE Studio
        - generic [ref=e12]: VUE PLAYGROUND
    - generic [ref=e14]:
      - textbox "文档名称" [ref=e15]: 创作手记
      - generic [ref=e16]: 已保存到本地
    - generic [ref=e19]:
      - button "新建文档" [ref=e20] [cursor=pointer]
      - button "导入文件" [ref=e22] [cursor=pointer]
      - button "保存文档" [ref=e25] [cursor=pointer]
      - button "导出" [ref=e31] [cursor=pointer]
      - button "编辑器配置" [ref=e38] [cursor=pointer]
  - navigation "文档视图" [ref=e42]:
    - generic [ref=e43]:
      - button "编辑" [ref=e44] [cursor=pointer]
      - button "HTML" [ref=e47] [cursor=pointer]
      - button "预览" [ref=e52] [cursor=pointer]
    - generic [ref=e56]:
      - generic [ref=e57]: 6mm · 本地
      - button "直播弹幕" [ref=e59] [cursor=pointer]
      - button "本地版本" [ref=e67] [cursor=pointer]:
        - generic [ref=e72]: 版本
        - generic [ref=e73]: "0"
      - button "插件 28" [ref=e74] [cursor=pointer]:
        - generic [ref=e77]: 插件
        - generic [ref=e78]: "28"
  - main [ref=e79]:
    - region "文档编辑区" [ref=e80]:
      - application [ref=e82]:
        - generic [ref=e83]:
          - generic [ref=e84]:
            - menubar [ref=e86]:
              - menuitem "文件" [ref=e87]
              - menuitem "编辑" [ref=e89]
              - menuitem "查看" [ref=e91]
              - menuitem "插入" [ref=e93]
              - menuitem "格式" [ref=e95]
              - menuitem "工具" [ref=e97]
              - menuitem "表格" [ref=e99]
              - menuitem "帮助" [ref=e101]
            - generic [ref=e103]:
              - toolbar [ref=e104]:
                - group [ref=e105]:
                  - button "恢复" [disabled] [ref=e106]
                  - button "重做" [disabled] [ref=e107]
                - group [ref=e108]:
                  - button "保存" [ref=e109]
                  - button "恢复上次的草稿" [ref=e110]
                - group [ref=e111]:
                  - button "文本块段落" [ref=e112]:
                    - generic [ref=e113]: 段落
                  - button "字体PingFang SC,Microsoft YaHei,sans-serif" [ref=e117]:
                    - generic [ref=e118]: PingFang SC,Microsoft YaHei,sans-serif
                  - generic [ref=e122]:
                    - button "Decrease font size" [ref=e123]
                    - textbox [ref=e127]: 15px
                    - button "Increase font size" [ref=e128]
                - group [ref=e132]:
                  - button "粗体" [ref=e133]
                  - button "斜体" [ref=e134]
                  - button "下划线" [ref=e135]
                  - button "删除线" [ref=e136]
                - group [ref=e137]:
                  - button "文本颜色 黑色" [ref=e138]
                  - button "字体颜色菜单" [ref=e139]
                  - button "背景颜色 黑色" [ref=e142]
                  - button "背景颜色菜单" [ref=e143]
                - group [ref=e146]:
                  - button "清除格式" [ref=e147]
              - toolbar [ref=e148]:
                - group [ref=e149]:
                  - button "左对齐" [ref=e150]
                  - button "居中对齐" [ref=e151]
                  - button "右对齐" [ref=e152]
                  - button "两端对齐" [ref=e153]
                - group [ref=e154]:
                  - button "无序列表" [ref=e155]
                  - button "无序列表" [ref=e156]
                  - button "有序列表" [ref=e159]
                  - button "有序列表" [ref=e160]
                - group [ref=e163]:
                  - button "减少缩进" [disabled] [ref=e164]
                  - button "增加缩进" [ref=e165]
                  - button "行高" [ref=e166]
                - group [ref=e170]:
                  - button "插入/编辑链接" [ref=e171]
                  - button "插入/编辑图片" [ref=e172]
                  - button "插入/编辑媒体" [ref=e173]
                  - button "表格" [ref=e174]
                - group [ref=e178]:
                  - button "特殊字符" [ref=e179]
                - group [ref=e180]:
                  - button "查找和替换" [ref=e181]
              - toolbar [ref=e182]:
                - group [ref=e183]:
                  - button "源代码" [ref=e184]
                  - button "预览" [ref=e185]
                  - button "打印" [ref=e186]
                - group [ref=e187]:
                  - button "插入折叠面板" [ref=e188]
                  - button "删除折叠面板" [ref=e189]
                - group [ref=e190]:
                  - button "锚点" [ref=e191]
                  - button "分页符" [ref=e192]
                  - button "不间断空格" [ref=e193]
                  - button "插入日期/时间" [ref=e194]
                  - button "插入日期/时间菜单" [ref=e195]
                  - button "插入/编辑代码示例" [ref=e198]
                - group [ref=e199]:
                  - button "由左到右" [ref=e200]
                  - button "由右到左" [ref=e201]
                - group [ref=e202]:
                  - button "下标" [ref=e203]
                  - button "上标" [ref=e204]
                - group [ref=e205]:
                  - button "显示区块边框" [ref=e206]
                  - button "显示不可见字符" [ref=e207]
                  - button "帮助" [ref=e208]
          - iframe [active] [ref=e211]:
            - generic [active] [ref=f2e1]:
              - paragraph
        - generic [ref=e212]:
          - generic [ref=e213]:
            - group "Element Path" [ref=e214]:
              - button "p" [ref=e215]
            - generic [ref=e216]: 按 Alt+0 获得帮助
            - generic [ref=e217]:
              - button "0 字" [ref=e218]
              - link "使用 TinyMCE 构建" [ref=e220]:
                - /url: https://www.tiny.cloud/powered-by-tiny?utm_campaign=poweredby&utm_source=tiny&utm_medium=referral&utm_content=v7
                - text: 使用 构建
          - separator "按上下箭头键以调整编辑器大小。" [ref=e227]
  - contentinfo [ref=e231]:
    - generic [ref=e232]: 编辑器已就绪
    - generic [ref=e234]: 6mm 源码构建 · GPLv2+ · 28 个插件已注册
    - generic [ref=e235]: 最近保存 00:42
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
  33  |   await expect(d.locator('img')).toHaveCSS('clip-path', 'none'); await expect(d.locator('img')).toHaveCSS('mask-image', 'none');
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
  76  |   await expect(image).toHaveCSS('width', '240px'); await expect(image).toHaveCSS('height', '120px');
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
> 92  |   await crop.getByRole('button', { name: '重置', exact: true }).click();
      |                                                               ^ Error: locator.click: Test timeout of 30000ms exceeded.
  93  |   await crop.getByRole('button', { name: '应用裁剪', exact: true }).click();
  94  |   await expect(image).toHaveCSS('width', '200px'); await expect(image).toHaveCSS('height', '100px');
  95  |   d = await open(page);
  96  |   await d.locator('input[type=file]').setInputFiles({ name: 'replacement.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="60" height="120"><rect width="60" height="120" fill="blue"/></svg>') });
  97  |   await expect(d.locator('img')).toHaveAttribute('src', /^data:image\/svg/);
  98  |   await d.getByRole('button', { name: '应用设置', exact: true }).click();
  99  |   await expect(image).toHaveCSS('width', '200px'); await expect(image).toHaveCSS('height', '100px'); await expect(image).toHaveCSS('rotate', '90deg');
  100 |   await page.getByRole('button', { name: '保存文档', exact: true }).click(); await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  101 |   await expect(image).toHaveCSS('mask-image', /linear-gradient/);
  102 |   d = await open(page); await d.getByRole('button', { name: '重置效果', exact: true }).click(); await d.getByRole('button', { name: '应用设置', exact: true }).click();
  103 |   await expect(image).toHaveCSS('rotate', '0deg'); await expect(image).toHaveCSS('mask-image', 'none'); await expect(image).toHaveCSS('clip-path', 'none');
  104 | });
  105 | 
```