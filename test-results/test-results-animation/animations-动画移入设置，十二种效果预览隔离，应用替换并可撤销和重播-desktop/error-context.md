# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: animations.spec.ts >> 动画移入设置，十二种效果预览隔离，应用替换并可撤销和重播
- Location: tests/animations.spec.ts:26:1

# Error details

```
Error: expect(locator).toHaveCSS(expected) failed

Locator: locator('iframe[title="文字效果预览"]').contentFrame().locator('body > [data-text-draggable]')
Expected: "none"
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toHaveCSS" locator('iframe[title="文字效果预览"]').contentFrame().locator('body > [data-text-draggable]') with timeout 20000ms
  - waiting for locator('iframe[title="文字效果预览"]').contentFrame().locator('body > [data-text-draggable]')

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
          - button "恢复" [disabled]:
            - img
          - button "重做" [disabled]:
            - img
        - group:
          - button "保存" [disabled]:
            - img
          - button "恢复上次的草稿" [disabled]:
            - img
        - group:
          - button "文本块段落":
            - text: 段落
            - img
          - button "字体PingFang SC,Microsoft YaHei,sans-serif":
            - text: PingFang SC,Microsoft YaHei,sans-serif
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
      - text: 按 Alt+0 获得帮助
      - button "8 字"
      - link "使用 TinyMCE 构建":
        - /url: https://www.tiny.cloud/powered-by-tiny?utm_campaign=poweredby&utm_source=tiny&utm_medium=referral&utm_content=v7
        - text: 使用
        - img
        - text: 构建
      - separator "按上下箭头键以调整编辑器大小。":
        - img
  - complementary "直播弹幕面板":
    - heading "直播弹幕" [level=2]
    - button "收起直播弹幕"
    - strong: 未连接
    - text: APP 1717059966646
    - button "连接直播间"
    - alert: B 站返回 7003：心跳过期或GameId错误
    - group: 自动订阅：给容器添加属性
    - textbox "搜索弹幕":
      - /placeholder: 搜索弹幕或用户
    - combobox "弹幕类型":
      - option "全部" [selected]
      - option "弹幕"
      - option "醒目留言"
      - option "礼物"
      - option "大航海"
    - text: 0 条消息 · 已选 0
    - button "清空弹幕" [disabled]
    - text: 暂无弹幕消息
    - checkbox "包含用户名" [checked]
    - text: 包含用户名
    - button "插入选中" [disabled]
- contentinfo: 编辑器已就绪 6mm 源码构建 · GPLv2+ · 28 个插件已注册 最近保存 00:10
```

# Test source

```ts
  1   | import { readFile } from 'node:fs/promises';
  2   | import { expect, test, type Page } from '@playwright/test';
  3   | import type { Editor } from 'tinymce';
  4   | declare global { interface Window { tinymce: { activeEditor: Editor } } }
  5   | const names = ['bounce', 'flash', 'pulse', 'rubberBand', 'shakeX', 'shakeY', 'headShake', 'swing', 'tada', 'wobble', 'jello', 'heartBeat'];
  6   | const box = (page: Page) => page.frameLocator('.tox-edit-area iframe').locator('#animation-text');
  7   | const preview = (page: Page) => page.frameLocator('iframe[title="文字效果预览"]').locator('body > [data-text-draggable]');
  8   | const dialog = (page: Page) => page.getByRole('dialog', { name: '文字设置', exact: true });
  9   | const content = (page: Page) => page.evaluate(() => window.tinymce.activeEditor.getContent());
  10  | async function open(page: Page) {
  11  |   await box(page).click();
  12  |   await expect(page.locator('.tox-pop:visible [data-mce-name="textanimation"]')).toHaveCount(0);
  13  |   await page.locator('.tox-pop:visible [data-mce-name="textsettings"]').click();
  14  |   await dialog(page).getByRole('tab', { name: '动画', exact: true }).click();
  15  |   return dialog(page);
  16  | }
  17  | test.beforeEach(async ({ page }) => {
  18  |   await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  19  |   await page.evaluate(() => {
  20  |     const e = window.tinymce.activeEditor;
  21  |     e.setContent('<p>前面</p><p><span id="animation-text" data-text-draggable="true" style="position:absolute;left:100px;top:100px;width:300px;font-size:38px"><strong style="color:#e03e2d">动画文字</strong></span></p><p>后面</p>');
  22  |     e.undoManager.clear(); e.undoManager.add();
  23  |   });
  24  | });
  25  | 
  26  | test('动画移入设置，十二种效果预览隔离，应用替换并可撤销和重播', async ({ page }) => {
  27  |   const before = await content(page), d = await open(page);
  28  |   const grid = d.getByRole('group', { name: '动画效果', exact: true });
  29  |   await expect(grid.getByRole('button')).toHaveCount(12);
  30  |   expect(await grid.evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(3);
  31  |   for (const name of names) {
  32  |     await d.getByRole('button', { name, exact: true }).click();
  33  |     await expect(d.getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'true');
  34  |     await expect(preview(page).locator('[data-text-source]')).toHaveCSS('animation-name', name);
> 35  |     await expect(preview(page)).toHaveCSS('animation-name', 'none');
      |                                 ^ Error: expect(locator).toHaveCSS(expected) failed
  36  |     expect(await content(page)).toBe(before);
  37  |   }
  38  |   await page.screenshot({ path: 'screenshots/text-settings-animation-desktop.png' });
  39  |   await d.getByRole('button', { name: '应用设置', exact: true }).click();
  40  |   await expect(box(page)).toHaveAttribute('data-text-animation', 'heartBeat');
  41  |   await expect(box(page).locator('[data-text-source]')).toHaveCSS('animation-name', 'heartBeat');
  42  |   await expect(box(page).locator('strong')).toHaveCSS('color', 'rgb(224, 62, 45)');
  43  |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  44  |   expect(await content(page)).toBe(before);
  45  |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  46  |   await open(page);
  47  |   await expect(d.getByRole('button', { name: 'heartBeat', exact: true })).toHaveAttribute('aria-pressed', 'true');
  48  |   await d.getByRole('button', { name: 'heartBeat', exact: true }).click();
  49  |   expect(await preview(page).locator('[data-text-source]').evaluate(node => node.getAnimations().some(a => a.playState === 'running'))).toBe(true);
  50  |   await d.getByRole('button', { name: 'bounce', exact: true }).click();
  51  |   await d.getByRole('button', { name: '应用设置', exact: true }).click();
  52  |   await expect(box(page)).toHaveAttribute('data-text-animation', 'bounce');
  53  |   await expect(box(page).locator('[data-text-animation]')).toHaveCount(0);
  54  | });
  55  | 
  56  | test('播放时长和循环校验、取消、重置、无动画及窄屏布局', async ({ page }) => {
  57  |   const before = await content(page), d = await open(page);
  58  |   await expect(d.getByRole('spinbutton', { name: '每轮时长（秒）', exact: true })).toBeDisabled();
  59  |   await d.getByRole('button', { name: 'pulse', exact: true }).click();
  60  |   await d.getByRole('spinbutton', { name: '每轮时长（秒）', exact: true }).fill('0');
  61  |   await d.getByRole('button', { name: '应用设置', exact: true }).click();
  62  |   await expect(d.getByRole('alert')).toContainText('0.1—60'); expect(await content(page)).toBe(before);
  63  |   await d.getByRole('spinbutton', { name: '每轮时长（秒）', exact: true }).fill('2');
  64  |   await d.getByRole('checkbox', { name: '循环播放', exact: true }).check();
  65  |   await d.getByRole('spinbutton', { name: '循环总时长（秒）', exact: true }).fill('10');
  66  |   await expect(preview(page).locator('[data-text-source]')).toHaveCSS('animation-duration', '2s');
  67  |   await expect(preview(page).locator('[data-text-source]')).toHaveCSS('animation-iteration-count', '5');
  68  |   await d.getByRole('button', { name: '应用设置', exact: true }).click();
  69  |   const applied = await content(page);
  70  |   await open(page);
  71  |   await expect(d.getByRole('spinbutton', { name: '每轮时长（秒）', exact: true })).toHaveValue('2');
  72  |   await expect(d.getByRole('checkbox', { name: '循环播放', exact: true })).toBeChecked();
  73  |   await expect(d.getByRole('spinbutton', { name: '循环总时长（秒）', exact: true })).toHaveValue('10');
  74  |   await d.getByRole('spinbutton', { name: '循环总时长（秒）', exact: true }).fill('3601');
  75  |   await d.getByRole('button', { name: '应用设置', exact: true }).click();
  76  |   await expect(d.getByRole('alert')).toContainText('0—3600');
  77  |   await d.getByRole('spinbutton', { name: '循环总时长（秒）', exact: true }).fill('0');
  78  |   await expect(preview(page).locator('[data-text-source]')).toHaveCSS('animation-iteration-count', 'infinite');
  79  |   await page.setViewportSize({ width: 390, height: 844 });
  80  |   await expect(d.getByRole('button', { name: 'heartBeat', exact: true })).toBeVisible();
  81  |   const bounds = (await d.boundingBox())!; expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.width).toBeLessThanOrEqual(390);
  82  |   await page.screenshot({ path: 'screenshots/text-settings-animation-mobile.png' });
  83  |   await page.keyboard.press('Escape'); expect(await content(page)).toBe(applied);
  84  |   await page.setViewportSize({ width: 1440, height: 1000 });
  85  |   await open(page); await d.getByRole('button', { name: '重置效果', exact: true }).click();
  86  |   await expect(preview(page)).not.toHaveAttribute('data-text-animation');
  87  |   await expect(d.getByRole('button', { name: '无动画', exact: true })).toHaveAttribute('aria-pressed', 'true');
  88  |   await d.getByRole('button', { name: '取消', exact: true }).click(); expect(await content(page)).toBe(applied);
  89  |   await open(page); await d.getByRole('button', { name: '无动画', exact: true }).click();
  90  |   await d.getByRole('button', { name: '应用设置', exact: true }).click();
  91  |   await expect(box(page)).not.toHaveAttribute('data-text-animation');
  92  |   expect(await content(page)).not.toContain('animation-duration');
  93  |   await expect(box(page).locator('strong')).toHaveText('动画文字');
  94  | });
  95  | 
  96  | test('动画与填充变形共存，保存、预览、导出并保留拖动定位', async ({ page }) => {
  97  |   const d = await open(page);
  98  |   await d.getByRole('button', { name: 'swing', exact: true }).click();
  99  |   await d.getByRole('checkbox', { name: '循环播放', exact: true }).check();
  100 |   await d.getByRole('tab', { name: '填充', exact: true }).click();
  101 |   await d.getByRole('combobox', { name: '填充类型', exact: true }).selectOption('gradient');
  102 |   await d.getByRole('tab', { name: '变形', exact: true }).click();
  103 |   await d.getByRole('button', { name: '上拱', exact: true }).click();
  104 |   await expect(preview(page).locator('[data-text-render]')).toHaveCSS('animation-name', 'swing');
  105 |   await expect(preview(page).locator('linearGradient')).not.toHaveCount(0);
  106 |   await d.getByRole('button', { name: '应用设置', exact: true }).click();
  107 |   await expect(box(page)).toHaveCSS('left', '100px'); await expect(box(page)).toHaveCSS('transform', 'none');
  108 |   await expect(box(page).locator('[data-text-render]')).toHaveCSS('animation-name', 'swing');
  109 |   await page.getByRole('button', { name: '保存文档', exact: true }).click();
  110 |   await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  111 |   await expect(box(page)).toHaveAttribute('data-text-animation', 'swing');
  112 |   await expect(box(page).locator('[data-text-render]')).toHaveCSS('animation-iteration-count', 'infinite');
  113 |   await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  114 |   await expect(page.frameLocator('iframe[title="文档预览"]').locator('#animation-text [data-text-render]')).toHaveCSS('animation-name', 'swing');
  115 |   await page.getByRole('button', { name: '导出', exact: true }).click();
  116 |   const downloaded = page.waitForEvent('download');
  117 |   await page.getByRole('button', { name: 'HTML 文档', exact: true }).click();
  118 |   const html = await readFile(await (await downloaded).path(), 'utf8');
  119 |   expect(html).toContain('@keyframes swing'); expect(html).toContain('data-text-animation="swing"');
  120 | });
  121 | 
  122 | test('旧版内层动画可读取，取消保留原始格式，替换与清除不嵌套', async ({ page }) => {
  123 |   await page.evaluate(() => {
  124 |     const e = window.tinymce.activeEditor;
  125 |     e.setContent('<p><span id="animation-text" data-text-draggable="true"><span data-text-animation="pulse" style="animation-duration:2s;animation-iteration-count:infinite"><strong>旧动画</strong></span></span></p>');
  126 |   });
  127 |   const before = await content(page), d = await open(page);
  128 |   await expect(d.getByRole('button', { name: 'pulse', exact: true })).toHaveAttribute('aria-pressed', 'true');
  129 |   await expect(d.getByRole('spinbutton', { name: '每轮时长（秒）', exact: true })).toHaveValue('2');
  130 |   await expect(d.getByRole('checkbox', { name: '循环播放', exact: true })).toBeChecked();
  131 |   await d.getByRole('button', { name: '取消', exact: true }).click(); expect(await content(page)).toBe(before);
  132 |   await open(page); await d.getByRole('button', { name: 'flash', exact: true }).click();
  133 |   await d.getByRole('button', { name: '应用设置', exact: true }).click();
  134 |   await expect(box(page)).toHaveAttribute('data-text-animation', 'flash');
  135 |   await expect(box(page).locator('[data-text-animation]')).toHaveCount(0);
```