# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: danmaku-config-panel.spec.ts >> 侧栏即时应用对齐与图层，独立对象、撤销重做、保存与弹窗同步
- Location: tests/danmaku-config-panel.spec.ts:41:1

# Error details

```
Error: expect(locator).toHaveAttribute(expected) failed

Locator: getByRole('dialog', { name: '弹幕设置', exact: true }).getByRole('button', { name: '左对齐', exact: true })
Expected: "true"
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toHaveAttribute" getByRole('dialog', { name: '弹幕设置', exact: true }).getByRole('button', { name: '左对齐', exact: true }) with timeout 20000ms
  - waiting for getByRole('dialog', { name: '弹幕设置', exact: true }).getByRole('button', { name: '左对齐', exact: true })

```

```yaml
- banner:
  - link "TinyMCE Studio":
    - /url: /
    - text: TinyMCE Studio VUE PLAYGROUND
  - textbox "文档名称": 创作手记
  - text: 已保存到本地
  - button "新建文档"
  - button "导入文件"
  - button "保存文档"
  - button "导出"
  - button "编辑器配置"
- navigation "文档视图":
  - button "编辑"
  - button "HTML"
  - button "预览"
  - text: 6mm · 本地
  - button "直播弹幕"
  - button "本地版本": 版本 0
  - button "插件 28"
- main:
  - region "文档编辑区":
    - application:
      - menubar:
        - menuitem "文件"
        - menuitem "编辑"
        - menuitem "查看"
        - menuitem "插入"
        - menuitem "格式"
        - menuitem "工具"
        - menuitem "表格"
        - menuitem "帮助"
      - toolbar:
        - group:
          - button "恢复":
            - img
          - button "重做" [disabled]:
            - img
        - group:
          - button "保存":
            - img
          - button "恢复上次的草稿" [disabled]:
            - img
        - group:
          - button "文本块段落":
            - text: 段落
            - img
          - button "字体思源黑体 常规":
            - text: 思源黑体 常规
            - img
          - button "Decrease font size":
            - img
          - textbox: 15px
          - button "Increase font size":
            - img
        - group:
          - button "粗体":
            - img
          - button "斜体":
            - img
          - button "下划线":
            - img
          - button "删除线":
            - img
        - group:
          - button "文本颜色 黑色":
            - img
          - button "字体颜色菜单":
            - img
          - button "背景颜色 黑色":
            - img
          - button "背景颜色菜单":
            - img
        - group:
          - button "清除格式":
            - img
      - toolbar:
        - group:
          - button "左对齐":
            - img
          - button "居中对齐":
            - img
          - button "右对齐":
            - img
          - button "两端对齐":
            - img
        - group:
          - button "无序列表":
            - img
          - button "无序列表":
            - img
          - button "有序列表":
            - img
          - button "有序列表":
            - img
        - group:
          - button "减少缩进" [disabled]:
            - img
          - button "增加缩进":
            - img
          - button "行高":
            - img
            - img
        - group:
          - button "插入/编辑链接":
            - img
          - button "插入/编辑图片":
            - img
          - button "插入/编辑媒体":
            - img
          - button "表格":
            - img
            - img
        - group:
          - button "特殊字符":
            - img
        - group:
          - button "查找和替换":
            - img
      - toolbar:
        - group:
          - button "源代码":
            - img
          - button "预览":
            - img
          - button "打印":
            - img
        - group:
          - button "插入折叠面板":
            - img
          - button "删除折叠面板":
            - img
        - group:
          - button "锚点":
            - img
          - button "分页符":
            - img
          - button "不间断空格":
            - img
          - button "插入日期/时间":
            - img
          - button "插入日期/时间菜单":
            - img
          - button "插入/编辑代码示例":
            - img
        - group:
          - button "由左到右":
            - img
          - button "由右到左":
            - img
        - group:
          - button "下标":
            - img
          - button "上标":
            - img
        - group:
          - button "显示区块边框":
            - img
          - button "显示不可见字符":
            - img
          - button "帮助":
            - img
      - iframe
      - group "Element Path":
        - button "p"
        - button "span"
      - text: 按 Alt+0 获得帮助
      - button "5 字"
      - link "使用 TinyMCE 构建":
        - /url: https://www.tiny.cloud/powered-by-tiny?utm_campaign=poweredby&utm_source=tiny&utm_medium=referral&utm_content=v7
        - text: 使用
        - img
        - text: 构建
      - separator "按上下箭头键以调整编辑器大小。":
        - img
  - complementary "弹幕配置面板":
    - heading "弹幕配置" [level=2]
    - paragraph: 调整即时生效，可撤销
    - button "收起弹幕配置"
    - heading "对齐" [level=3]
    - group "弹幕对齐":
      - button "左对齐" [pressed]
      - button "居中对齐"
      - button "右对齐"
    - paragraph: 对齐弹幕框，不改变消息文字的对齐方式。
    - heading "图层设置 第 4 / 4 层" [level=3]
    - group "图层设置":
      - button "下一层"
      - button "上一层" [disabled]
      - button "置于底层"
      - button "置于顶层" [disabled]
- contentinfo: 编辑器已就绪 6mm 源码构建 · GPLv2+ · 28 个插件已注册 最近保存 01:26
- toolbar:
  - group:
    - button "文字设置":
      - img
  - group:
    - button "切换位置：居右 / 居下":
      - img
- text: 文字设置
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
  59  |   await panel(page).getByRole('button', { name: '左对齐', exact: true }).click();
  60  |   await choose(page, 'b');
  61  |   await expect(panel(page).getByRole('button', { name: '左对齐', exact: true })).toHaveAttribute('aria-pressed', 'false');
  62  |   await expect(frame(page).locator('#b')).not.toHaveAttribute('data-danmaku-x');
  63  |   await choose(page);
  64  |   await page.locator('.tox-pop:visible [data-mce-name="danmakusettings"]').click();
> 65  |   await expect(modal(page).getByRole('button', { name: '左对齐', exact: true })).toHaveAttribute('aria-pressed', 'true');
      |                                                                               ^ Error: expect(locator).toHaveAttribute(expected) failed
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