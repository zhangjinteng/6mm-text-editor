# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: text-tool-groups.spec.ts >> 点击文字工具栏及分组的空白、边框和控件不会关闭，字号仍可编辑
- Location: tests/text-tool-groups.spec.ts:4:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.tox-pop:visible')
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('.tox-pop:visible') with timeout 20000ms
  - waiting for locator('.tox-pop:visible')

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
          - button "字体PingFang SC,Microsoft YaHei,sans-serif":
            - text: PingFang SC,Microsoft YaHei,sans-serif
            - img
          - button "Decrease font size":
            - img
          - textbox: 28px
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
      - button "7 字"
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
    - button "连接直播间" [disabled]
    - text: 连接正由其他浏览器使用
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
- contentinfo: 编辑器已就绪 6mm 源码构建 · GPLv2+ · 28 个插件已注册 最近保存 00:58
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | import { openTextGroup, textTool } from './helpers/text-tools';
  3   | 
  4   | test('点击文字工具栏及分组的空白、边框和控件不会关闭，字号仍可编辑', async ({ page }) => {
  5   |   await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  6   |   await page.evaluate(() => {
  7   |     const e = window.tinymce.activeEditor; e.setContent('<p id="focus-text">工具栏保持显示</p>');
  8   |     e.focus(); e.selection.select(e.getBody().querySelector('p')!, true); e.dispatch('mouseup');
  9   |   });
  10  |   const toolbar = page.locator('.tox-pop:visible');
  11  |   const clickBlank = async (locator: import('@playwright/test').Locator) => {
  12  |     const box = (await locator.boundingBox())!;
  13  |     await page.mouse.click(box.x + 1, box.y + 1);
  14  |     // focusout 的关闭逻辑异步运行，下一次断言前等待连续帧。
  15  |     await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
> 16  |     await expect(toolbar).toBeVisible();
      |                           ^ Error: expect(locator).toBeVisible() failed
  17  |   };
  18  |   await clickBlank(toolbar);
  19  |   for (const group of await toolbar.locator('.tox-toolbar__group').all()) await clickBlank(group);
  20  |   const input = toolbar.locator('input');
  21  |   await input.fill('28px'); await input.press('Enter');
  22  |   await expect(toolbar).toBeVisible();
  23  |   await expect(page.frameLocator('.tox-edit-area iframe').locator('#focus-text span')).toHaveCSS('font-size', '28px');
  24  |   for (const name of ['style', 'color', 'paragraph'] as const) {
  25  |     const panel = await openTextGroup(page, name);
  26  |     await clickBlank(panel);
  27  |     await page.keyboard.press('Escape');
  28  |     await expect(toolbar).toBeVisible();
  29  |   }
  30  |   await (await textTool(page, 'bold')).click();
  31  |   await expect(toolbar).toBeVisible();
  32  |   await expect(page.frameLocator('.tox-edit-area iframe').locator('#focus-text strong')).toHaveText('工具栏保持显示');
  33  | });
  34  | 
  35  | // 原生分组面板复用控件，布局和编辑行为一起检查。
  36  | test('文字工具栏分类收纳，面板操作保留选区，标题与颜色生效', async ({ page }) => {
  37  |   const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  38  |   await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  39  |   await page.evaluate(() => {
  40  |     const e = window.tinymce.activeEditor; e.setContent('<p id="words">前面选中后面</p>'); e.undoManager.clear(); e.undoManager.add();
  41  |     const text = e.getBody().querySelector('p')!.firstChild!; const range = e.getDoc().createRange(); range.setStart(text, 2); range.setEnd(text, 4);
  42  |     e.focus(); e.selection.setRng(range); e.nodeChanged(); e.dispatch('mouseup');
  43  |   });
  44  |   const toolbar = page.locator('.tox-pop:visible');
  45  |   for (const group of ['style', 'color', 'paragraph']) await expect(toolbar.locator(`[data-mce-name="textgroup${group}"]`)).toBeVisible();
  46  |   await expect(toolbar.locator('[data-mce-name="textgroupfont"]')).toHaveCount(0);
  47  |   await expect(toolbar.locator('[data-mce-name="fontfamily"]')).toBeVisible();
  48  |   await expect(toolbar.locator('[data-mce-name="bold"],[data-mce-name="h2"]')).toHaveCount(0);
  49  |   await expect(toolbar.locator('[data-mce-name="textdrag"]')).toHaveCount(1);
  50  |   const frame = page.frameLocator('.tox-edit-area iframe');
  51  |   await (await textTool(page, 'bold')).click();
  52  |   await expect(frame.locator('#words strong')).toHaveText('选中');
  53  |   await toolbar.locator('input').fill('26px'); await toolbar.locator('input').press('Enter');
  54  |   await expect(frame.locator('#words span').filter({ hasText: '选中' }).first()).toHaveCSS('font-size', '26px');
  55  |   await (await textTool(page, 'backcolor-chevron')).click();
  56  |   await page.locator('[data-mce-color="#E03E2D"]').click();
  57  |   expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toContain('background-color: #e03e2d');
  58  |   const paragraph = await openTextGroup(page, 'paragraph');
  59  |   await expect(paragraph.locator('[data-mce-name^="h"]')).toHaveCount(6);
  60  |   await paragraph.locator('[data-mce-name="h2"]').click();
  61  |   await expect(frame.locator('[data-selection-heading="h2"]')).toHaveText('选中');
  62  |   await page.keyboard.press('Escape');
  63  |   await toolbar.locator('[data-mce-name="textanimation"]').click();
  64  |   await expect(page.getByRole('dialog', { name: '文字动画设置' })).toBeVisible();
  65  |   expect(errors).toEqual([]);
  66  | });
  67  | 
  68  | test('分类面板在分类按钮附近显示，居右时向左展开，切换对象正确关闭', async ({ page }) => {
  69  |   await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  70  |   await page.evaluate(() => {
  71  |     const e = window.tinymce.activeEditor;
  72  |     e.setContent('<p id="group-text">分类面板测试</p><p><img alt="切换对象" width="80" height="60" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"></p>');
  73  |     e.focus(); e.selection.select(e.getBody().querySelector('#group-text')!, true); e.nodeChanged(); e.dispatch('mouseup');
  74  |   });
  75  |   const toolbar = page.locator('.tox-pop:visible');
  76  |   const panel = await openTextGroup(page, 'style');
  77  |   await expect.poll(async () => {
  78  |     const box = (await panel.boundingBox())!;
  79  |     const button = (await toolbar.locator('[data-mce-name="textgroupstyle"]').boundingBox())!;
  80  |     return Math.max(Math.abs(box.x + box.width / 2 - button.x - button.width / 2), Math.abs(box.y + box.height + 8 - button.y));
  81  |   }).toBeLessThan(2);
  82  |   await expect(panel.locator('.tox-toolbar__group')).toHaveCSS('grid-template-columns', '44px 44px 44px');
  83  |   await page.keyboard.press('Escape');
  84  |   await expect(panel).toBeHidden();
  85  |   await expect(toolbar).toBeVisible();
  86  |   await toolbar.locator('[data-mce-name="toolbarposition"]').click();
  87  |   const color = await openTextGroup(page, 'color');
  88  |   await expect.poll(async () => {
  89  |     const box = (await color.boundingBox())!;
  90  |     const button = (await toolbar.locator('[data-mce-name="textgroupcolor"]').boundingBox())!;
  91  |     return Math.abs(box.x + box.width + 8 - button.x);
  92  |   }).toBeLessThan(2);
  93  |   await page.keyboard.press('Escape');
  94  |   await toolbar.locator('[data-mce-name="fontfamily"]').click();
  95  |   await page.locator('.tox-menu:visible').getByText('Arial', { exact: true }).click();
  96  |   expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toMatch(/font-family: arial/i);
  97  |   await openTextGroup(page, 'style');
  98  |   await page.frameLocator('.tox-edit-area iframe').locator('img').click();
  99  |   await expect(toolbar.locator('[data-mce-name="imagefill"]')).toBeVisible();
  100 |   await expect(page.locator('[data-toolbar-group="textgroupstyle"]')).toBeHidden();
  101 | });
  102 | 
```