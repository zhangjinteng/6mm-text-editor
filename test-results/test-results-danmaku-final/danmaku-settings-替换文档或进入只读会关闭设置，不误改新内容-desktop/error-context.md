# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: danmaku-settings.spec.ts >> 替换文档或进入只读会关闭设置，不误改新内容
- Location: tests/danmaku-settings.spec.ts:69:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('.tox-pop:visible').getByRole('button')
Expected: 2
Received: 0
Timeout:  20000ms

Call log:
  - Expect "toHaveCount" locator('.tox-pop:visible').getByRole('button') with timeout 20000ms
  - waiting for locator('.tox-pop:visible').getByRole('button')
    43 × locator resolved to 0 elements
       - unexpected value "0"

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
      - generic [ref=e16]: 尚未保存
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
                  - button "恢复上次的草稿" [ref=e110]
                - group [ref=e111]:
                  - button "文本块段落" [ref=e112]:
                    - generic [ref=e113]: 段落
                  - button "字体Microsoft YaHei,PingFang SC,sans-serif" [ref=e117]:
                    - generic [ref=e118]: Microsoft YaHei,PingFang SC,sans-serif
                  - generic [ref=e122]:
                    - button "Decrease font size" [ref=e123]
                    - textbox [ref=e127]: 14px
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
          - iframe [ref=e211]:
            - generic [ref=f1e1]:
              - paragraph:
                - generic [ref=f1e2]: 底层文字
              - paragraph [ref=f1e5]: 等待消息 · 连接直播间后自动显示
              - paragraph:
                - generic [ref=f1e6]: 上层文字
        - generic [ref=e212]:
          - generic [ref=e213]:
            - group "Element Path" [ref=e214]:
              - button "div" [ref=e215]
            - generic [ref=e216]: 按 Alt+0 获得帮助
            - generic [ref=e217]:
              - button "8 字" [ref=e218]
              - link "使用 TinyMCE 构建" [ref=e220]:
                - /url: https://www.tiny.cloud/powered-by-tiny?utm_campaign=poweredby&utm_source=tiny&utm_medium=referral&utm_content=v7
                - text: 使用 构建
          - separator "按上下箭头键以调整编辑器大小。" [ref=e227]
  - contentinfo [ref=e231]:
    - generic [ref=e232]: 编辑器已就绪
    - generic [ref=e234]: 6mm 源码构建 · GPLv2+ · 28 个插件已注册
    - generic [ref=e235]: 本地文档
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
> 8  |   await expect(toolbar.getByRole('button')).toHaveCount(2);
     |                                             ^ Error: expect(locator).toHaveCount(expected) failed
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
  59 |   await expect(page.getByRole('complementary', { name: '文字配置面板' })).toBeHidden();
  60 |   await expect(d.getByRole('button', { name: '居中对齐', exact: true })).toHaveAttribute('aria-pressed', 'true');
  61 |   await expect(d.getByRole('button', { name: '置于顶层', exact: true })).toBeDisabled();
  62 |   await page.setViewportSize({ width: 390, height: 844 });
  63 |   const box = (await d.boundingBox())!;
  64 |   expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(390);
  65 |   expect(box.y + box.height).toBeLessThanOrEqual(844);
  66 |   await page.screenshot({ path: 'screenshots/danmaku-settings-mobile.png' });
  67 | });
  68 | 
  69 | test('替换文档或进入只读会关闭设置，不误改新内容', async ({ page }) => {
  70 |   const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  71 |   const d = await open(page);
  72 |   await d.getByRole('button', { name: '右对齐', exact: true }).click();
  73 |   await page.evaluate(() => window.tinymce.activeEditor.mode.set('readonly'));
  74 |   await expect(d).toHaveCount(0);
  75 |   expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  76 |   await page.evaluate(() => window.tinymce.activeEditor.mode.set('design'));
  77 |   await open(page);
  78 |   await page.evaluate(() => window.tinymce.activeEditor.setContent('<p>新文档</p>'));
  79 |   await expect(d).toHaveCount(0);
  80 |   await expect(page.frameLocator('.tox-edit-area iframe').locator('body')).toHaveText('新文档');
  81 | });
  82 | 
```