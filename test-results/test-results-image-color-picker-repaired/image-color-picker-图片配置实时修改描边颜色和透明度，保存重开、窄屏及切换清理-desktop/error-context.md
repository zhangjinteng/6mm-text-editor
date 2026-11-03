# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: image-color-picker.spec.ts >> 图片配置实时修改描边颜色和透明度，保存重开、窄屏及切换清理
- Location: tests/image-color-picker.spec.ts:50:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.text-color-popover:visible').getByRole('button', { name: '关闭颜色选择器' })

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
                    - button "保存" [ref=e109]
                    - button "恢复上次的草稿" [ref=e110]
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
                - paragraph
                - paragraph [ref=f2e3]: 作品颜色
          - generic [ref=e212]:
            - generic [ref=e213]:
              - group "Element Path" [ref=e214]:
                - button "p" [ref=e215]
              - generic [ref=e216]: 按 Alt+0 获得帮助
              - generic [ref=e217]:
                - button "4 字" [ref=e218]
                - link "使用 TinyMCE 构建" [ref=e220]:
                  - /url: https://www.tiny.cloud/powered-by-tiny?utm_campaign=poweredby&utm_source=tiny&utm_medium=referral&utm_content=v7
                  - text: 使用 构建
            - separator "按上下箭头键以调整编辑器大小。" [ref=e227]
      - complementary "画布配置面板" [ref=e231]:
        - generic [ref=e232]:
          - generic [ref=e233]:
            - heading "画布配置" [level=2] [ref=e234]
            - paragraph [ref=e235]: 调整即时生效，可撤销
          - button "收起画布配置" [ref=e236] [cursor=pointer]
        - generic [ref=e240]:
          - tablist "画布配置分类" [ref=e241]:
            - tab "背景" [selected] [ref=e242] [cursor=pointer]
            - tab "插入" [ref=e243] [cursor=pointer]
          - tabpanel "背景" [ref=e244]:
            - generic [ref=e245]:
              - text: 背景颜色
              - generic [ref=e246]:
                - button "背景颜色色板" [ref=e247] [cursor=pointer]
                - textbox "背景颜色" [ref=e248]: "#ffffff"
            - generic [ref=e249]:
              - text: 背景透明度
              - generic [ref=e250]:
                - spinbutton "背景透明度数值" [ref=e251]: "0"
                - text: "%"
            - slider "背景透明度" [ref=e252]: "0"
            - generic [ref=e253]:
              - generic [ref=e254]: 不透明
              - generic [ref=e255]: 完全透明
            - paragraph [ref=e256]: 只调整画布背景颜色的透明度，文字和图片保持原有效果。
        - button "清除背景颜色" [disabled] [ref=e258]
    - contentinfo [ref=e259]:
      - generic [ref=e260]: 编辑器已就绪
      - generic [ref=e262]: 6mm 源码构建 · GPLv2+ · 28 个插件已注册
      - generic [ref=e263]: 最近保存 01:30
  - toolbar [ref=e266]:
    - group [ref=e267]:
      - button "画布设置" [ref=e268]
      - button "切换位置：居右 / 居下" [ref=e269]
      - button "源代码" [ref=e270]
      - button "预览" [ref=e271]
      - button "全屏" [ref=e272]
```

# Test source

```ts
  1  | import { expect, test, type Page, type Locator } from '@playwright/test';
  2  | 
  3  | const frame = (p: Page) => p.frameLocator('.tox-edit-area iframe');
  4  | const photo = (p: Page) => frame(p).locator('#color-photo');
  5  | const sidebar = (p: Page) => p.getByRole('complementary', { name: '图片配置面板' });
  6  | const picker = (p: Page) => p.locator('.text-color-popover:visible');
  7  | async function choose(page: Page, scope: Locator, label: string, hex: string, opacity: string) {
  8  |   await scope.getByRole('button', { name: `选择${label}`, exact: true }).click();
  9  |   await picker(page).getByRole('textbox', { name: 'HEX 颜色', exact: true }).fill(hex);
  10 |   await picker(page).getByRole('textbox', { name: '颜色不透明度', exact: true }).fill(opacity);
  11 | }
  12 | test.beforeEach(async ({ page }) => {
  13 |   await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  14 |   await page.evaluate(async () => {
  15 |     const c = document.createElement('canvas'); c.width = 200; c.height = 140;
  16 |     const ctx = c.getContext('2d')!; ctx.fillStyle = '#147d64'; ctx.fillRect(20, 20, 160, 100);
  17 |     const e = window.tinymce.activeEditor;
  18 |     e.setContent(`<p><img id="color-photo" src="${c.toDataURL()}" style="position:absolute;left:120px;top:80px;width:300px;height:210px"></p><p style="color:#3598db">作品颜色</p>`);
  19 |     await e.uploadImages(); e.undoManager.clear(); e.undoManager.add();
  20 |   });
  21 |   await photo(page).click();
  22 | });
  23 | 
  24 | test('图片设置复用取色器，阴影透明度同步，预览可取消且应用可撤销', async ({ page }) => {
  25 |   const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  26 |   await page.locator('.tox-pop:visible [data-mce-name="imagesettings"]').click();
  27 |   const dialog = page.getByRole('dialog', { name: '图片设置', exact: true });
  28 |   await dialog.getByRole('tab', { name: '阴影', exact: true }).click();
  29 |   await dialog.getByLabel('启用阴影', { exact: true }).check();
  30 |   await choose(page, dialog, '阴影颜色', '#ff0000', '40');
  31 |   await expect(picker(page).getByRole('button', { name: '使用颜色 #3598db', exact: true })).toBeVisible();
  32 |   await expect(dialog.getByRole('slider', { name: '阴影不透明度', exact: true })).toHaveValue('40');
  33 |   await expect(dialog.locator('.image-settings-preview img')).toHaveCSS('box-shadow', 'rgba(255, 0, 0, 0.4) 0px 8px 16px 0px');
  34 |   expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  35 |   await page.screenshot({ path: 'screenshots/image-color-picker-dialog.png' });
  36 |   await page.keyboard.press('Escape'); await expect(picker(page)).toHaveCount(0); await expect(dialog).toBeVisible();
  37 |   await dialog.getByRole('button', { name: '取消', exact: true }).click();
  38 |   expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  39 |   await page.locator('.tox-pop:visible [data-mce-name="imagesettings"]').click();
  40 |   await dialog.getByRole('tab', { name: '阴影', exact: true }).click();
  41 |   await dialog.getByLabel('启用阴影', { exact: true }).check();
  42 |   await choose(page, dialog, '阴影颜色', '#112233', '60');
  43 |   await picker(page).getByRole('button', { name: '关闭颜色选择器' }).click();
  44 |   await dialog.getByRole('button', { name: '应用设置', exact: true }).click();
  45 |   await expect(photo(page)).toHaveCSS('box-shadow', 'rgba(17, 34, 51, 0.6) 0px 8px 16px 0px');
  46 |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  47 |   expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  48 | });
  49 | 
  50 | test('图片配置实时修改描边颜色和透明度，保存重开、窄屏及切换清理', async ({ page }) => {
  51 |   const panel = sidebar(page);
  52 |   await panel.getByRole('tab', { name: '描边', exact: true }).click();
  53 |   await panel.getByLabel('启用描边', { exact: true }).check();
  54 |   await choose(page, panel, '描边颜色', '#3598db', '35');
  55 |   await expect(photo(page)).toHaveAttribute('data-image-settings', /"strokeColor":"rgba\(53,152,219,0.35\)"/);
  56 |   await expect(photo(page)).toHaveAttribute('data-image-stroke-id');
  57 |   await page.screenshot({ path: 'screenshots/image-color-picker-sidebar.png' });
> 58 |   await picker(page).getByRole('button', { name: '关闭颜色选择器' }).click();
     |                                                               ^ Error: locator.click: Test timeout of 30000ms exceeded.
  59 |   await page.getByRole('button', { name: '保存文档', exact: true }).click();
  60 |   await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  61 |   await photo(page).click(); await panel.getByRole('tab', { name: '描边', exact: true }).click();
  62 |   await panel.getByRole('button', { name: '选择描边颜色', exact: true }).click();
  63 |   await expect(picker(page).getByRole('textbox', { name: 'HEX 颜色', exact: true })).toHaveValue('#3598db');
  64 |   await expect(picker(page).getByRole('textbox', { name: '颜色不透明度', exact: true })).toHaveValue('35%');
  65 |   await page.setViewportSize({ width: 390, height: 844 });
  66 |   const bounds = (await picker(page).boundingBox())!;
  67 |   expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  68 |   await page.screenshot({ path: 'screenshots/image-color-picker-mobile.png' });
  69 |   await page.setViewportSize({ width: 1440, height: 1000 });
  70 |   await frame(page).locator('body').click({ position: { x: 650, y: 360 } });
  71 |   await expect(picker(page)).toHaveCount(0);
  72 | });
  73 | 
  74 | test('透明主体的实线与虚线描边都保留颜色 alpha', async ({ page }) => {
  75 |   const results = await page.evaluate(async () => {
  76 |     // @ts-expect-error Browser-only module served by Vite.
  77 |     const { createImageStroke } = await import('/src/image-stroke.ts');
  78 |     const source = (window.tinymce.activeEditor.getBody().querySelector('#color-photo') as HTMLImageElement).src;
  79 |     const maxima = [];
  80 |     for (const strokeStyle of ['solid', 'dashed']) {
  81 |       const result = await createImageStroke(source, 200, 140, { stroke: true, strokeWidth: 8, strokeColor: 'rgba(53,152,219,0.35)', strokeStyle, strokePosition: 'inside', mask: 'none', radius: 0 });
  82 |       const image = new Image(); image.src = result.url; await image.decode();
  83 |       const c = document.createElement('canvas'); c.width = image.width; c.height = image.height;
  84 |       const ctx = c.getContext('2d')!; ctx.drawImage(image, 0, 0);
  85 |       const data = ctx.getImageData(0, 0, c.width, c.height).data;
  86 |       let max = 0; for (let i = 3; i < data.length; i += 4) max = Math.max(max, data[i]!);
  87 |       maxima.push(max);
  88 |     }
  89 |     return maxima;
  90 |   });
  91 |   for (const alpha of results) { expect(alpha).toBeGreaterThan(80); expect(alpha).toBeLessThanOrEqual(90); }
  92 | });
  93 | 
```