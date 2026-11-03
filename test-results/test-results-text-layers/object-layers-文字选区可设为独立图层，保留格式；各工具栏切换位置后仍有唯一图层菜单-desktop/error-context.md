# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: object-layers.spec.ts >> 文字选区可设为独立图层，保留格式；各工具栏切换位置后仍有唯一图层菜单
- Location: tests/object-layers.spec.ts:62:1

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for getByRole('complementary', { name: '文字配置面板' }).getByRole('tab', { name: '对象', exact: true })

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
                  - button "保存" [disabled] [ref=e109]
                  - button "恢复上次的草稿" [disabled] [ref=e110]
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
              - paragraph [ref=f2e2]:
                - text: 选中
                - strong [ref=f2e3]: 粗体
                - text: 文字
              - paragraph [ref=f2e4]:
                - img "另一图层" [ref=f2e5]
              - paragraph [ref=f2e8]: 等待消息 · 连接直播间后自动显示
        - generic [ref=e212]:
          - generic [ref=e213]:
            - group "Element Path" [ref=e214]:
              - button "p" [ref=e215]
            - generic [ref=e216]: 按 Alt+0 获得帮助
            - generic [ref=e217]:
              - button "6 字" [ref=e218]
              - link "使用 TinyMCE 构建" [ref=e220]:
                - /url: https://www.tiny.cloud/powered-by-tiny?utm_campaign=poweredby&utm_source=tiny&utm_medium=referral&utm_content=v7
                - text: 使用 构建
          - separator "按上下箭头键以调整编辑器大小。" [ref=e227]
  - contentinfo [ref=e231]:
    - generic [ref=e232]: 编辑器已就绪
    - generic [ref=e234]: 6mm 源码构建 · GPLv2+ · 28 个插件已注册
    - generic [ref=e235]: 最近保存 00:28
```

# Test source

```ts
  1  | import { expect, test, type Page } from '@playwright/test';
  2  | import type { Editor } from 'tinymce';
  3  | declare global { interface Window { tinymce: { activeEditor: Editor } } }
  4  | 
  5  | const source = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  6  | async function action(page: Page, label: string) {
  7  |   const button = page.locator('.tox-pop:visible').getByRole('button', { name: '图层设置', exact: true });
  8  |   if (await button.count() === 0) {
  9  |     const panel = page.getByRole('complementary', { name: '文字配置面板' });
> 10 |     await panel.getByRole('tab', { name: '对象', exact: true }).click();
     |                                                               ^ Error: locator.click: Test timeout of 90000ms exceeded.
  11 |     await panel.getByRole('button', { name: label, exact: true }).click();
  12 |     return;
  13 |   }
  14 |   await expect(button).toHaveCount(1);
  15 |   await button.click();
  16 |   await page.getByRole('menuitem', { name: label, exact: true }).click();
  17 | }
  18 | async function order(page: Page) {
  19 |   return page.evaluate(() => Array.from(window.tinymce.activeEditor.getBody().querySelectorAll<HTMLElement>('[data-layer-test]'))
  20 |     .sort((a, b) => Number(a.style.zIndex) - Number(b.style.zIndex)).map(element => element.id));
  21 | }
  22 | 
  23 | test.beforeEach(async ({ page }) => {
  24 |   await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  25 | });
  26 | 
  27 | test('四种图层操作改变图片、文字、弹幕的遮挡顺序，支持撤销、重做、保存和预览', async ({ page }) => {
  28 |   await page.evaluate(source => {
  29 |     const e = window.tinymce.activeEditor;
  30 |     e.setContent(`<p><img id="image" data-layer-test="true" src="${source}" alt="图层图片" style="position:absolute;left:40px;top:60px;width:180px;height:100px;z-index:0"><span id="text" data-layer-test="true" data-text-draggable="true" style="position:absolute;left:40px;top:60px;width:180px;height:100px;z-index:10;background:green">图层文字</span></p><div id="danmaku" data-layer-test="true" data-danmaku-source="current" style="position:absolute;left:40px;top:60px;width:180px;height:100px;z-index:20;background:#ddd"></div>`);
  31 |     e.undoManager.clear(); e.undoManager.add();
  32 |     e.focus(); e.selection.select(e.getBody().querySelector('#image')!); e.nodeChanged();
  33 |   }, source);
  34 |   const frame = page.frameLocator('.tox-edit-area iframe');
  35 |   const before = (await frame.locator('#image').boundingBox())!;
  36 |   await page.locator('.tox-pop:visible').getByRole('button', { name: '图层设置', exact: true }).click();
  37 |   await expect(page.locator('.tox-menu:visible').getByRole('menuitem')).toHaveText(['下一层', '上一层', '置于底层', '置于顶层']);
  38 |   await page.keyboard.press('Escape');
  39 |   await action(page, '上一层'); expect(await order(page)).toEqual(['text', 'image', 'danmaku']);
  40 |   await action(page, '上一层'); expect(await order(page)).toEqual(['text', 'danmaku', 'image']);
  41 |   const hit = () => page.evaluate(() => {
  42 |     const e = window.tinymce.activeEditor; const box = e.getBody().querySelector('#image')!.getBoundingClientRect();
  43 |     return e.getDoc().elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)?.id;
  44 |   });
  45 |   expect(await hit()).toBe('image');
  46 |   await action(page, '下一层'); expect(await order(page)).toEqual(['text', 'image', 'danmaku']); expect(await hit()).toBe('danmaku');
  47 |   await action(page, '置于底层'); expect(await order(page)).toEqual(['image', 'text', 'danmaku']);
  48 |   await action(page, '置于顶层'); expect(await order(page)).toEqual(['text', 'danmaku', 'image']);
  49 |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  50 |   expect(await order(page)).toEqual(['image', 'text', 'danmaku']);
  51 |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  52 |   expect(await order(page)).toEqual(['text', 'danmaku', 'image']);
  53 |   const after = (await frame.locator('#image').boundingBox())!;
  54 |   expect(after).toEqual(before);
  55 |   await page.getByRole('button', { name: '保存文档', exact: true }).click();
  56 |   await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  57 |   expect(await order(page)).toEqual(['text', 'danmaku', 'image']); expect(await hit()).toBe('image');
  58 |   await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  59 |   await expect(page.frameLocator('iframe[title="文档预览"]').locator('#image')).toHaveCSS('z-index', '3');
  60 | });
  61 | 
  62 | test('文字选区可设为独立图层，保留格式；各工具栏切换位置后仍有唯一图层菜单', async ({ page }) => {
  63 |   await page.evaluate(source => {
  64 |     const e = window.tinymce.activeEditor;
  65 |     e.setContent(`<p id="plain">选中<strong>粗体</strong>文字</p><p><img src="${source}" alt="另一图层" width="80" height="60"></p><div data-danmaku-source="current" style="width:180px;height:100px;background:#ddd"></div>`);
  66 |     e.undoManager.clear(); e.undoManager.add(); e.focus(); e.selection.select(e.getBody().querySelector('#plain')!, true); e.fire('mouseup');
  67 |   }, source);
  68 |   await action(page, '置于顶层');
  69 |   const frame = page.frameLocator('.tox-edit-area iframe');
  70 |   await expect(frame.locator('#plain [data-text-draggable]')).toHaveCount(1);
  71 |   await expect(frame.locator('#plain strong')).toHaveText('粗体');
  72 |   await expect(frame.locator('#plain [data-text-draggable]')).toHaveCSS('z-index', '3');
  73 |   await page.locator('.tox-pop:visible [data-mce-name="toolbarposition"]').click();
  74 |   await expect(page.locator('.tox-pop:visible')).toHaveAttribute('data-editor-toolbar-position', 'right');
  75 |   await action(page, '置于底层');
  76 |   await expect(frame.locator('#plain [data-text-draggable]')).toHaveCSS('z-index', '1');
  77 |   await frame.locator('img').click();
  78 |   await action(page, '置于顶层'); await expect(frame.locator('img')).toHaveCSS('z-index', '3');
  79 |   await frame.locator('[data-danmaku-source]').click({ position: { x: 20, y: 20 } });
  80 |   await action(page, '置于顶层'); await expect(frame.locator('[data-danmaku-source]')).toHaveCSS('z-index', '3');
  81 | });
  82 | 
```