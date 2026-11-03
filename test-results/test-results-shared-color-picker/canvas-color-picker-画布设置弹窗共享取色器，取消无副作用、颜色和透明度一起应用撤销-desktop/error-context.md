# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: canvas-color-picker.spec.ts >> 画布设置弹窗共享取色器，取消无副作用、颜色和透明度一起应用撤销
- Location: tests/canvas-color-picker.spec.ts:41:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('dialog', { name: '画布设置', exact: true })
Expected: visible
Timeout: 20000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('dialog', { name: '画布设置', exact: true }) with timeout 20000ms
  - waiting for getByRole('dialog', { name: '画布设置', exact: true })

```

```yaml
- banner:
  - link "TinyMCE Studio":
    - /url: /
    - text: TinyMCE Studio VUE PLAYGROUND
  - textbox "文档名称": 创作手记
  - text: 尚未保存
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
      - text: 按 Alt+0 获得帮助
      - button "4 字"
      - link "使用 TinyMCE 构建":
        - /url: https://www.tiny.cloud/powered-by-tiny?utm_campaign=poweredby&utm_source=tiny&utm_medium=referral&utm_content=v7
        - text: 使用
        - img
        - text: 构建
      - separator "按上下箭头键以调整编辑器大小。":
        - img
  - complementary "画布配置面板":
    - heading "画布配置" [level=2]
    - paragraph: 调整即时生效，可撤销
    - button "收起画布配置"
    - tablist "画布配置分类":
      - tab "背景" [selected]
      - tab "插入"
    - tabpanel "背景":
      - text: 背景颜色
      - button "背景颜色色板"
      - textbox "背景颜色": "#ffffff"
      - text: 背景透明度
      - spinbutton "背景透明度数值": "0"
      - text: "%"
      - slider "背景透明度": "0"
      - text: 不透明 完全透明
      - paragraph: 只调整画布背景颜色的透明度，文字和图片保持原有效果。
    - button "清除背景颜色" [disabled]
- contentinfo: 编辑器已就绪 6mm 源码构建 · GPLv2+ · 28 个插件已注册 本地文档
- toolbar:
  - group:
    - button "画布设置":
      - img
    - button "切换位置：居右 / 居下":
      - img
    - button "源代码":
      - img
    - button "预览":
      - img
    - button "全屏":
      - img
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | const pickerSelector = '.text-color-popover:visible';
  4  | test.beforeEach(async ({ page }) => {
  5  |   await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  6  |   await page.evaluate(() => {
  7  |     const e = window.tinymce.activeEditor;
  8  |     e.setContent('<p style="color:#3598db">作品颜色</p>'); e.undoManager.clear(); e.undoManager.add();
  9  |   });
  10 | });
  11 | 
  12 | test('画布配置共享取色器，同步透明度并支持撤销、重开与切换清理', async ({ page }) => {
  13 |   const panel = page.getByRole('complementary', { name: '画布配置面板' });
  14 |   const layer = page.frameLocator('.tox-edit-area iframe').locator('.document-background-color');
  15 |   await panel.getByRole('button', { name: '背景颜色色板', exact: true }).click();
  16 |   const picker = page.locator(pickerSelector);
  17 |   await expect(picker.getByRole('button', { name: '使用颜色 #3598db' })).toBeVisible();
  18 |   await picker.getByRole('textbox', { name: 'HEX 颜色' }).fill('#112233');
  19 |   await picker.getByRole('textbox', { name: '颜色不透明度', exact: true }).fill('40');
  20 |   await expect(layer).toHaveCSS('background-color', 'rgba(17, 34, 51, 0.4)');
  21 |   await expect(panel.getByRole('slider', { name: '背景透明度', exact: true })).toHaveValue('60');
  22 |   await page.keyboard.press('Escape');
  23 |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  24 |   await expect(layer).toHaveCSS('background-color', 'rgb(17, 34, 51)');
  25 |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  26 |   await panel.getByRole('button', { name: '背景颜色色板', exact: true }).click();
  27 |   await expect(picker.getByRole('textbox', { name: '颜色不透明度', exact: true })).toHaveValue('40%');
  28 |   await page.screenshot({ path: 'screenshots/canvas-color-picker.png' });
  29 |   await panel.getByRole('tab', { name: '插入', exact: true }).click(); await expect(picker).toHaveCount(0);
  30 |   await panel.getByRole('tab', { name: '背景', exact: true }).click();
  31 |   await panel.getByRole('slider', { name: '背景透明度', exact: true }).fill('75');
  32 |   await panel.getByRole('button', { name: '背景颜色色板', exact: true }).click();
  33 |   await expect(picker.getByRole('textbox', { name: '颜色不透明度', exact: true })).toHaveValue('25%');
  34 |   await page.setViewportSize({width:390,height:844});
  35 |   const bounds = (await picker.boundingBox())!;
  36 |   expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.x+bounds.width).toBeLessThanOrEqual(390);
  37 |   await page.keyboard.press('Escape'); await panel.getByRole('button', { name: '清除背景颜色' }).click();
  38 |   await expect(layer).toHaveCount(0);
  39 | });
  40 | 
  41 | test('画布设置弹窗共享取色器，取消无副作用、颜色和透明度一起应用撤销', async ({ page }) => {
  42 |   const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  43 |   const open = () => page.evaluate(() => window.tinymce.activeEditor.ui.registry.getAll().buttons.canvassettings!.onAction({} as never));
  44 |   const dialog = page.getByRole('dialog', { name: '画布设置', exact: true });
  45 |   const picker = page.locator(pickerSelector);
  46 |   for (const action of ['取消', '应用设置']) {
  47 |     await open();
  48 |     await dialog.getByRole('button', { name: '背景颜色色板', exact: true }).click();
  49 |     await picker.getByRole('textbox', { name: 'HEX 颜色' }).fill('#ff0000');
  50 |     await picker.getByRole('textbox', { name: '颜色不透明度', exact: true }).fill('35');
  51 |     await expect(dialog.getByRole('textbox', { name: '背景透明度（0–100%）' })).toHaveValue('65');
  52 |     expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
> 53 |     await page.keyboard.press('Escape'); await expect(dialog).toBeVisible();
     |                                                               ^ Error: expect(locator).toBeVisible() failed
  54 |     await dialog.getByRole('button', { name: action, exact: true }).click();
  55 |     if (action === '取消') expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  56 |   }
  57 |   await expect(page.frameLocator('.tox-edit-area iframe').locator('.document-background-color')).toHaveCSS('background-color', 'rgba(255, 0, 0, 0.35)');
  58 |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  59 |   expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  60 |   await expect(picker).toHaveCount(0);
  61 | });
  62 | 
```