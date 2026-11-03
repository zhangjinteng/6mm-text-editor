# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: canvas-background.spec.ts >> 点击空白显示画布背景色工具，色板自定义清除支持保存、预览、导出和撤销
- Location: tests/canvas-background.spec.ts:6:1

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for locator('[data-mce-name="自定义颜色"]')

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
                  - button "表情符号" [ref=e180]
                - group [ref=e181]:
                  - button "查找和替换" [ref=e182]
              - toolbar [ref=e183]:
                - group [ref=e184]:
                  - button "源代码" [ref=e185]
                  - button "全屏" [ref=e186]
                  - button "预览" [ref=e187]
                  - button "打印" [ref=e188]
                - group [ref=e189]:
                  - button "插入折叠面板" [ref=e190]
                  - button "删除折叠面板" [ref=e191]
                - group [ref=e192]:
                  - button "锚点" [ref=e193]
                  - button "分页符" [ref=e194]
                  - button "不间断空格" [ref=e195]
                  - button "插入日期/时间" [ref=e196]
                  - button "插入日期/时间菜单" [ref=e197]
                  - button "插入/编辑代码示例" [ref=e200]
                - group [ref=e201]:
                  - button "由左到右" [ref=e202]
                  - button "由右到左" [ref=e203]
                - group [ref=e204]:
                  - button "下标" [ref=e205]
                  - button "上标" [ref=e206]
                - group [ref=e207]:
                  - button "显示区块边框" [ref=e208]
                  - button "显示不可见字符" [ref=e209]
                  - button "帮助" [ref=e210]
          - iframe [ref=e213]:
            - generic [ref=f3e1]:
              - paragraph
              - paragraph [ref=f3e2]:
                - strong [ref=f3e3]: 文字不染色
        - generic [ref=e214]:
          - generic [ref=e215]:
            - group "Element Path"
            - generic [ref=e216]: 按 Alt+0 获得帮助
            - generic [ref=e217]:
              - button "5 字" [ref=e218]
              - link "使用 TinyMCE 构建" [ref=e220]:
                - /url: https://www.tiny.cloud/powered-by-tiny?utm_campaign=poweredby&utm_source=tiny&utm_medium=referral&utm_content=v7
                - text: 使用 构建
          - separator "按上下箭头键以调整编辑器大小。" [ref=e227]
    - complementary "直播弹幕面板" [ref=e231]:
      - generic [ref=e232]:
        - heading "直播弹幕" [level=2] [ref=e233]
        - button "收起直播弹幕" [ref=e234] [cursor=pointer]
      - generic [ref=e238]:
        - generic [ref=e239]:
          - strong [ref=e247]: 未连接
          - generic [ref=e248]: APP 1717059966646
          - button "连接直播间" [disabled] [ref=e249]
          - generic [ref=e252]: 连接正由其他浏览器使用
          - alert [ref=e253]:
            - generic [ref=e256]: B 站返回 4009：接口访问限制
        - group [ref=e257]:
          - generic "自动订阅：给容器添加属性" [ref=e258]
        - generic [ref=e259]:
          - textbox "搜索弹幕" [ref=e264]:
            - /placeholder: 搜索弹幕或用户
          - combobox "弹幕类型" [ref=e265]:
            - option "全部" [selected]
            - option "弹幕"
            - option "醒目留言"
            - option "礼物"
            - option "大航海"
        - generic [ref=e266]:
          - generic [ref=e267]: 0 条消息 · 已选 0
          - button "清空弹幕" [disabled] [ref=e268]
        - generic [ref=e272]: 暂无弹幕消息
        - generic [ref=e281]:
          - generic [ref=e282]:
            - checkbox "包含用户名" [checked] [ref=e283]
            - text: 包含用户名
          - button "插入选中" [disabled] [ref=e284]
  - contentinfo [ref=e287]:
    - generic [ref=e288]: 编辑器已就绪
    - generic [ref=e290]: 6mm 源码构建 · GPLv2+ · 28 个插件已注册
    - generic [ref=e291]: 最近保存 23:42
```

# Test source

```ts
  1  | import { readFile } from 'node:fs/promises';
  2  | import { expect, test } from '@playwright/test';
  3  | import type { Editor } from 'tinymce';
  4  | declare global { interface Window { tinymce: { activeEditor: Editor } } }
  5  | 
  6  | test('点击空白显示画布背景色工具，色板自定义清除支持保存、预览、导出和撤销', async ({ page }) => {
  7  |   await page.goto('/');await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);
  8  |   await page.evaluate(()=>{
  9  |     const e=window.tinymce.activeEditor;
  10 |     e.setContent('<p><strong>文字不染色</strong></p>');e.undoManager.clear();e.undoManager.add();
  11 |   });
  12 |   const open=async()=>{
  13 |     const box=(await page.locator('.tox-edit-area iframe').boundingBox())!;
  14 |     await page.mouse.click(box.x+250,box.y+200);
  15 |     const toolbar=page.locator('.tox-pop .tox-toolbar');
  16 |     await expect(toolbar.locator('[data-mce-name="backcolor"]')).toBeVisible();
  17 |     await expect(toolbar.locator('[data-mce-name="forecolor"]')).toHaveCount(0);
  18 |     await toolbar.locator('[data-mce-name="backcolor-chevron"]').click();
  19 |   };
  20 |   await open();
  21 |   await page.locator('[data-mce-color="#E03E2D"]').click();
  22 |   const frame=page.frameLocator('.tox-edit-area iframe');const layer=frame.locator('.document-background-color');
  23 |   await expect(layer).toHaveCSS('background-color','rgb(224, 62, 45)');
  24 |   await expect(layer).toHaveCSS('pointer-events','none');
  25 |   const bounds=(await layer.boundingBox())!,area=(await page.locator('.tox-edit-area iframe').boundingBox())!;
  26 |   expect(bounds.width).toBeCloseTo(area.width,0);expect(bounds.height).toBeCloseTo(area.height,0);
  27 |   await expect(frame.locator('strong')).toHaveCSS('color','rgb(37, 52, 47)');
  28 |   await page.evaluate(()=>window.tinymce.activeEditor.undoManager.undo());await expect(layer).toHaveCount(0);
  29 |   await page.evaluate(()=>window.tinymce.activeEditor.undoManager.redo());await expect(layer).toHaveCount(1);
> 30 |   await open();await page.locator('[data-mce-name="Custom color"]').click();
     |                                                              ^ Error: locator.click: Test timeout of 90000ms exceeded.
  31 |   const dialog=page.getByRole('dialog',{name:'选色器'});
  32 |   await dialog.getByRole('textbox',{name:'十六进制颜色代码',exact:true}).fill('123456');
  33 |   await dialog.getByRole('button',{name:'保存',exact:true}).click();
  34 |   await expect(layer).toHaveCSS('background-color','rgb(18, 52, 86)');
  35 |   await page.getByRole('button',{name:'保存文档',exact:true}).click();await page.reload();await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);
  36 |   await expect(layer).toHaveCSS('background-color','rgb(18, 52, 86)');
  37 |   await page.getByRole('navigation',{name:'文档视图'}).getByRole('button',{name:'预览',exact:true}).click();
  38 |   await expect(page.frameLocator('iframe[title="文档预览"]').locator('.document-background-color')).toHaveCSS('background-color','rgb(18, 52, 86)');
  39 |   await page.getByRole('button',{name:'导出',exact:true}).click();
  40 |   const downloaded=page.waitForEvent('download');
  41 |   await page.getByRole('button',{name:'HTML 文档',exact:true}).click();
  42 |   const html=await readFile(await (await downloaded).path(),'utf8');
  43 |   expect(html).toContain('document-background-color');expect(html).toContain('background-color:');
  44 |   await page.getByRole('navigation',{name:'文档视图'}).getByRole('button',{name:'编辑',exact:true}).click();
  45 |   await open();await page.locator('[data-mce-name="Remove color"]').click();await expect(layer).toHaveCount(0);
  46 | });
  47 | 
  48 | test('顶部与空白工具栏复用同一个原生 backcolor，分别设置画布底色和文字背景', async ({ page }) => {
  49 |   await page.goto('/');await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);
  50 |   await page.evaluate(()=>window.tinymce.activeEditor.setContent('<p><strong>共用背景色控件</strong></p>'));
  51 |   expect(await page.evaluate(()=>Boolean(window.tinymce.activeEditor.ui.registry.getAll().buttons.canvasbackground))).toBe(false);
  52 |   const area=(await page.locator('.tox-edit-area iframe').boundingBox())!;
  53 |   await page.mouse.click(area.x+300,area.y+200);
  54 |   await expect(page.locator('.tox-pop [data-mce-name="backcolor"]')).toBeVisible();
  55 |   const topButton=page.locator('.tox-tinymce [data-mce-name="backcolor-chevron"]');
  56 |   await topButton.click();await page.locator('[data-mce-color="#E03E2D"]').click();
  57 |   const frame=page.frameLocator('.tox-edit-area iframe');
  58 |   await expect(frame.locator('.document-background-color')).toHaveCSS('background-color','rgb(224, 62, 45)');
  59 |   await expect(frame.locator('strong')).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
  60 |   await frame.locator('strong').click();
  61 |   await page.evaluate(()=>{
  62 |     const e=window.tinymce.activeEditor;e.selection.select(e.getBody().querySelector('strong')!,true);e.fire('mouseup');
  63 |   });
  64 |   await topButton.click();await page.locator('[data-mce-color="#3598DB"]').click();
  65 |   const textBackground=frame.locator('strong span[style*="background-color"], span[style*="background-color"]:has(strong)');
  66 |   await expect(textBackground).toHaveCSS('background-color','rgb(53, 152, 219)');
  67 |   await expect(frame.locator('.document-background-color')).toHaveCSS('background-color','rgb(224, 62, 45)');
  68 | });
  69 | 
```