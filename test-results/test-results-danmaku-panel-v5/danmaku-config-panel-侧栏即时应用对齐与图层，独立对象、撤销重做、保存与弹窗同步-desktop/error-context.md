# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: danmaku-config-panel.spec.ts >> 侧栏即时应用对齐与图层，独立对象、撤销重做、保存与弹窗同步
- Location: tests/danmaku-config-panel.spec.ts:41:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('complementary', { name: '弹幕配置面板' }).getByRole('button', { name: '左对齐', exact: true })
    - locator resolved to <button type="button" aria-pressed="false">左对齐</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - performing click action
    - <div role="toolbar" class="tox-toolbar" aria-disabled="false">…</div> from <section aria-label="文档编辑区" class="editor-pane">…</section> subtree intercepts pointer events
  - retrying click action
    - waiting for element to be visible, enabled and stable
    - element is not visible
  - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
      - waiting 100ms
    24 × waiting for element to be visible, enabled and stable
       - element is not visible
     - retrying click action
       - waiting 500ms
    - waiting for element to be visible, enabled and stable
  - element was detached from the DOM, retrying

```

# Page snapshot

```yaml
- generic [ref=e1]:
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
                    - button "字体思源黑体 常规" [ref=e117]:
                      - generic [ref=e118]: 思源黑体 常规
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
                - paragraph [ref=f2e4]: 等待消息 · 连接直播间后自动显示
                - paragraph [ref=f2e7]: 等待消息 · 连接直播间后自动显示
                - paragraph:
                  - generic [ref=f2e8]: 切换到文字
                - paragraph
          - generic [ref=e212]:
            - generic [ref=e213]:
              - group "Element Path" [ref=e214]:
                - button "p" [ref=e215]
                - generic [aria-hidden] [ref=e216]: ›
                - button "span" [ref=e217]
              - generic [ref=e218]: 按 Alt+0 获得帮助
              - generic [ref=e219]:
                - button "5 字" [ref=e220]
                - link "使用 TinyMCE 构建" [ref=e222]:
                  - /url: https://www.tiny.cloud/powered-by-tiny?utm_campaign=poweredby&utm_source=tiny&utm_medium=referral&utm_content=v7
                  - text: 使用 构建
            - separator "按上下箭头键以调整编辑器大小。" [ref=e229]
      - complementary "画布配置面板" [ref=e233]:
        - generic [ref=e234]:
          - generic [ref=e235]:
            - heading "画布配置" [level=2] [ref=e236]
            - paragraph [ref=e237]: 调整即时生效，可撤销
          - button "收起画布配置" [ref=e238] [cursor=pointer]
        - generic [ref=e242]:
          - tablist "画布配置分类" [ref=e243]:
            - tab "背景" [selected] [ref=e244] [cursor=pointer]
            - tab "插入" [ref=e245] [cursor=pointer]
          - tabpanel "背景" [ref=e246]:
            - generic [ref=e247]:
              - text: 背景颜色
              - generic [ref=e248]:
                - button "背景颜色色板" [ref=e249] [cursor=pointer]
                - textbox "背景颜色" [ref=e250]: "#ffffff"
            - generic [ref=e251]:
              - text: 背景透明度
              - generic [ref=e252]:
                - spinbutton "背景透明度数值" [ref=e253]: "0"
                - text: "%"
            - slider "背景透明度" [ref=e254]: "0"
            - generic [ref=e255]:
              - generic [ref=e256]: 不透明
              - generic [ref=e257]: 完全透明
            - paragraph [ref=e258]: 只调整画布背景颜色的透明度，文字和图片保持原有效果。
        - button "清除背景颜色" [disabled] [ref=e260]
    - contentinfo [ref=e261]:
      - generic [ref=e262]: 编辑器已就绪
      - generic [ref=e264]: 6mm 源码构建 · GPLv2+ · 28 个插件已注册
      - generic [ref=e265]: 最近保存 01:26
  - toolbar [ref=e268]:
    - group [ref=e269]:
      - button "画布设置" [ref=e270]
      - button "切换位置：居右 / 居下" [ref=e271]
      - button "源代码" [ref=e272]
      - button "预览" [ref=e273]
      - button "全屏" [ref=e274]
```

# Test source

```ts
  1   | import { expect, test, type Page } from '@playwright/test';
  2   | const frame = (p: Page) => p.frameLocator('.tox-edit-area iframe');
  3   | const panel = (p: Page) => p.getByRole('complementary', { name: '弹幕配置面板' });
  4   | const modal = (p: Page) => p.getByRole('dialog', { name: '弹幕设置', exact: true });
  5   | async function choose(page: Page, id = 'a') {
  6   |   await frame(page).locator(`#${id}`).click({ position: { x: 15, y: 15 } });
  7   |   await expect(panel(page)).toBeVisible();
  8   | }
  9   | test.beforeEach(async ({ page }) => {
  10  |   await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  11  |   await page.evaluate(() => {
  12  |     const e = window.tinymce.activeEditor;
  13  |     e.setContent('<div id="a" data-danmaku-id="panel-a" data-danmaku-source="current" style="position:absolute;left:40px;top:120px;width:180px;height:160px;z-index:2"></div><div id="b" data-danmaku-id="panel-b" data-danmaku-source="current" style="position:absolute;left:440px;top:120px;width:180px;height:160px;z-index:3"></div><p><span id="text" data-text-draggable="true" style="position:absolute;left:40px;top:20px;z-index:1">切换到文字</span></p><p><img id="picture" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="position:absolute;left:260px;top:20px;width:80px;height:60px;z-index:4"></p>');
  14  |     e.undoManager.clear(); e.undoManager.add();
  15  |   });
  16  | });
  17  | 
  18  | test('选中弹幕显示配置，切换其他对象与空白互斥，关闭可重新打开', async ({ page }) => {
  19  |   await expect(panel(page)).toBeHidden();
  20  |   await choose(page);
  21  |   await expect(page.locator('.tox-pop:visible [data-mce-name="danmakusettings"]')).toBeVisible();
  22  |   await expect(page.getByRole('complementary', { name: '画布配置面板' })).toBeHidden();
  23  |   await frame(page).locator('#text').click();
  24  |   await expect(panel(page)).toBeHidden();
  25  |   await expect(page.getByRole('complementary', { name: '文字配置面板' })).toBeVisible();
  26  |   await choose(page);
  27  |   await expect(page.getByRole('complementary', { name: '文字配置面板' })).toBeHidden();
  28  |   await frame(page).locator('#picture').click();
  29  |   await expect(panel(page)).toBeHidden();
  30  |   await expect(page.getByRole('complementary', { name: '图片配置面板' })).toBeVisible();
  31  |   await choose(page);
  32  |   await expect(page.getByRole('complementary', { name: '图片配置面板' })).toBeHidden();
  33  |   await panel(page).getByRole('button', { name: '收起弹幕配置' }).click();
  34  |   await expect(panel(page)).toBeHidden();
  35  |   await choose(page);
  36  |   await frame(page).locator('body').click({ position: { x: 700, y: 380 } });
  37  |   await expect(panel(page)).toBeHidden();
  38  |   await expect(page.getByRole('complementary', { name: '画布配置面板' })).toBeVisible();
  39  | });
  40  | 
  41  | test('侧栏即时应用对齐与图层，独立对象、撤销重做、保存与弹窗同步', async ({ page }) => {
  42  |   await choose(page);
  43  |   const before = await frame(page).locator('#a').getAttribute('style');
  44  |   await panel(page).getByRole('button', { name: '居中对齐', exact: true }).click();
  45  |   const center = await frame(page).locator('#a').getAttribute('data-danmaku-x');
  46  |   const body = (await frame(page).locator('body').boundingBox())!, a = (await frame(page).locator('#a').boundingBox())!;
  47  |   expect(a.x).toBeCloseTo(body.x + (body.width - a.width) / 2, 0);
  48  |   await expect(panel(page).getByRole('button', { name: '居中对齐', exact: true })).toHaveAttribute('aria-pressed', 'true');
  49  |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  50  |   await expect(frame(page).locator('#a')).toHaveAttribute('style', before!);
  51  |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  52  |   await expect(frame(page).locator('#a')).toHaveAttribute('data-danmaku-x', center!);
  53  |   await expect(panel(page).getByRole('button', { name: '居中对齐', exact: true })).toHaveAttribute('aria-pressed', 'true');
  54  |   await panel(page).getByRole('button', { name: '置于顶层', exact: true }).click();
  55  |   await expect(frame(page).locator('#a')).toHaveCSS('z-index', '4');
  56  |   await expect(panel(page).getByRole('button', { name: '上一层', exact: true })).toBeDisabled();
  57  |   await page.screenshot({ path: 'screenshots/danmaku-config-panel-desktop.png' });
  58  |   // 让第二个弹幕露在第一个对象之外，再检查侧栏切换。
> 59  |   await panel(page).getByRole('button', { name: '左对齐', exact: true }).click();
      |                                                                       ^ Error: locator.click: Test timeout of 30000ms exceeded.
  60  |   await choose(page, 'b');
  61  |   await expect(panel(page).getByRole('button', { name: '左对齐', exact: true })).toHaveAttribute('aria-pressed', 'false');
  62  |   await expect(frame(page).locator('#b')).not.toHaveAttribute('data-danmaku-x');
  63  |   await choose(page);
  64  |   await page.locator('.tox-pop:visible [data-mce-name="danmakusettings"]').click();
  65  |   await expect(modal(page).getByRole('button', { name: '左对齐', exact: true })).toHaveAttribute('aria-pressed', 'true');
  66  |   await modal(page).getByRole('button', { name: '右对齐', exact: true }).click();
  67  |   await modal(page).getByRole('button', { name: '取消', exact: true }).click();
  68  |   await expect(panel(page).getByRole('button', { name: '左对齐', exact: true })).toHaveAttribute('aria-pressed', 'true');
  69  |   await page.locator('.tox-pop:visible [data-mce-name="danmakusettings"]').click();
  70  |   await modal(page).getByRole('button', { name: '居中对齐', exact: true }).click();
  71  |   await modal(page).getByRole('button', { name: '应用设置', exact: true }).click();
  72  |   await expect(panel(page).getByRole('button', { name: '居中对齐', exact: true })).toHaveAttribute('aria-pressed', 'true');
  73  |   await page.getByRole('button', { name: '保存文档', exact: true }).click();
  74  |   await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  75  |   await choose(page);
  76  |   await expect(panel(page).getByRole('button', { name: '居中对齐', exact: true })).toHaveAttribute('aria-pressed', 'true');
  77  |   await expect(panel(page).getByRole('button', { name: '置于顶层', exact: true })).toBeDisabled();
  78  | });
  79  | 
  80  | test('窄屏在画布下方显示，文档与模式切换清理配置', async ({ page }) => {
  81  |   await choose(page);
  82  |   await page.setViewportSize({ width: 390, height: 844 });
  83  |   await panel(page).scrollIntoViewIfNeeded();
  84  |   const bounds = (await panel(page).boundingBox())!, area = (await page.locator('.editor-container').boundingBox())!;
  85  |   expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  86  |   expect(bounds.y).toBeGreaterThanOrEqual(area.y + area.height);
  87  |   await page.screenshot({ path: 'screenshots/danmaku-config-panel-mobile.png' });
  88  |   await page.setViewportSize({ width: 1440, height: 1000 });
  89  |   await page.evaluate(() => window.tinymce.activeEditor.mode.set('readonly'));
  90  |   await expect(panel(page)).toBeHidden();
  91  |   await page.evaluate(() => window.tinymce.activeEditor.mode.set('design'));
  92  |   await choose(page);
  93  |   await page.getByRole('button', { name: 'HTML', exact: true }).click();
  94  |   await expect(panel(page)).toBeHidden();
  95  |   await page.getByRole('button', { name: '编辑', exact: true }).click();
  96  |   await choose(page);
  97  |   await page.evaluate(() => window.tinymce.activeEditor.setContent('<p>新文档</p>'));
  98  |   await expect(panel(page)).toBeHidden();
  99  | });
  100 | 
```