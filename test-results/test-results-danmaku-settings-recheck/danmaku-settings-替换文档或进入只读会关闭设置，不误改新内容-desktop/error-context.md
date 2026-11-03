# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: danmaku-settings.spec.ts >> 替换文档或进入只读会关闭设置，不误改新内容
- Location: tests/danmaku-settings.spec.ts:69:1

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for locator('.tox-pop:visible').getByRole('button', { name: '弹幕设置', exact: true })

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
                - paragraph:
                  - generic [ref=f2e2]: 底层文字
                - paragraph [ref=f2e5]: 等待消息 · 连接直播间后自动显示
                - paragraph:
                  - generic [ref=f2e6]: 上层文字
          - generic [ref=e212]:
            - generic [ref=e213]:
              - group "Element Path" [ref=e214]:
                - button "p" [ref=e215]
                - generic [aria-hidden] [ref=e216]: ›
                - button "span" [ref=e217]
              - generic [ref=e218]: 按 Alt+0 获得帮助
              - generic [ref=e219]:
                - button "8 字" [ref=e220]
                - link "使用 TinyMCE 构建" [ref=e222]:
                  - /url: https://www.tiny.cloud/powered-by-tiny?utm_campaign=poweredby&utm_source=tiny&utm_medium=referral&utm_content=v7
                  - text: 使用 构建
            - separator "按上下箭头键以调整编辑器大小。" [ref=e229]
      - complementary "文字配置面板" [ref=e233]:
        - generic "文字设置" [ref=e235]:
          - generic [ref=e236]:
            - generic [ref=e237]:
              - heading "文字配置" [level=2] [ref=e238]
              - paragraph [ref=e239]: 调整即时生效，可撤销
            - button "收起文字配置" [ref=e240] [cursor=pointer]: ×
          - generic [ref=e242]:
            - tablist "文字设置分类" [ref=e243]:
              - tab "基础" [selected] [ref=e244] [cursor=pointer]
              - tab "样式" [ref=e245] [cursor=pointer]
              - tab "段落" [ref=e246] [cursor=pointer]
              - tab "排版" [ref=e247] [cursor=pointer]
              - tab "外观" [ref=e248] [cursor=pointer]
              - tab "填充" [ref=e249] [cursor=pointer]
              - tab "变形" [ref=e250] [cursor=pointer]
              - tab "动画" [ref=e251] [cursor=pointer]
              - tab "对象" [ref=e252] [cursor=pointer]
            - tabpanel "基础" [ref=e253]:
              - generic [ref=e254]:
                - text: 字体
                - combobox "字体" [ref=e255]:
                  - option "Aa剑豪体 Regular"
                  - option "阿朱泡泡体"
                  - option "标小智龙珠体"
                  - option "标小智无界黑"
                  - option "点点像素体"
                  - option "抖音美好体"
                  - option "二字元心游手绘"
                  - option "汉字之美斑驳标宋 特黑"
                  - option "鸿雷板书简体"
                  - option "鸿雷拙书简体"
                  - option "汇文港黑 Medium"
                  - option "汇文明朝体"
                  - option "胡晓波男神体"
                  - option "胡晓波青年宋 粗"
                  - option "胡晓波骚包体"
                  - option "胡晓波刷刷体 Regular"
                  - option "胡晓波影隶简体 Regular"
                  - option "胡晓波真帅体"
                  - option "江西拙楷"
                  - option "荆南缘默体"
                  - option "快去写作业-CJK 常规 Regular"
                  - option "励字侠义简繁"
                  - option "沐瑶软笔手写体"
                  - option "庞门正道粗书体"
                  - option "庞门正道真贵楷体"
                  - option "清松手写体"
                  - option "锐字真言体免费商用"
                  - option "手书体"
                  - option "文鼎新艺体"
                  - option "小濑字体"
                  - option "写意体 Regular"
                  - option "演示佛系体"
                  - option "演示秋鸿楷"
                  - option "优设标题黑"
                  - option "优设标题圆"
                  - option "有字库龙藏体"
                  - option "余繁细柳体 ExtraLight"
                  - option "站酷快乐体"
                  - option "钟齐志莽行书"
                  - option "字恋狂深夜简繁"
                  - option "字体圈欣意冠黑体"
                  - option "字由棒棒体"
                  - option "字由芳华体"
                  - option "字由文艺黑"
                  - option "字制区喜脉喜欢体"
                  - option "Fondamento Regular"
                  - option "Molle"
                  - option "Open Sans Bold"
                  - option "Open Sans Regular"
                  - option "Saira Stencil One"
                  - option "思源黑体 常规" [selected]
                  - option "StarLoveMarker Regular"
                  - option "StarLovePencil Regular"
              - generic [ref=e256]:
                - text: 字号
                - generic [ref=e257]:
                  - button "减小字号" [ref=e258] [cursor=pointer]: −
                  - textbox "字号" [ref=e259]:
                    - /placeholder: 1—1000
                    - text: "15"
                  - generic [ref=e260]: px
                  - button "增大字号" [ref=e261] [cursor=pointer]: +
              - generic [ref=e262]:
                - text: 文字颜色
                - generic [ref=e263]:
                  - button "文字颜色色板" [ref=e264] [cursor=pointer]
                  - textbox "文字颜色" [ref=e265]: rgb(37, 52, 47)
              - generic [ref=e266]:
                - text: 背景颜色
                - generic [ref=e267]:
                  - button "背景颜色色板" [ref=e268] [cursor=pointer]
                  - textbox "背景颜色" [ref=e269]: transparent
              - button "清除背景颜色" [disabled] [ref=e270]
              - paragraph [ref=e271]: 应用到当前文字对象。背景颜色用于文字高亮，背景形状可在“外观 → 背景”中设置。
          - button "重置效果" [ref=e273] [cursor=pointer]
    - contentinfo [ref=e274]:
      - generic [ref=e275]: 编辑器已就绪
      - generic [ref=e277]: 6mm 源码构建 · GPLv2+ · 28 个插件已注册
      - generic [ref=e278]: 最近保存 01:13
  - toolbar [ref=e281]:
    - group [ref=e282]:
      - button "文字设置" [ref=e283]
    - group [ref=e284]:
      - button "切换位置：居右 / 居下" [ref=e285]
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
> 10 |   await toolbar.getByRole('button', { name: '弹幕设置', exact: true }).click();
     |                                                                    ^ Error: locator.click: Test timeout of 90000ms exceeded.
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
  61 |   await expect(d.getByRole('button', { name: '居中对齐', exact: true })).toHaveAttribute('aria-pressed', 'true');
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