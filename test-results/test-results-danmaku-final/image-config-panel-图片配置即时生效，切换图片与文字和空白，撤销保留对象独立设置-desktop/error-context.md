# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: image-config-panel.spec.ts >> 图片配置即时生效，切换图片与文字和空白，撤销保留对象独立设置
- Location: tests/image-config-panel.spec.ts:14:1

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.check: Test timeout of 90000ms exceeded.
Call log:
  - waiting for getByRole('complementary', { name: '图片配置面板' }).getByLabel('水平翻转', { exact: true })
    - locator resolved to <input name="flipX" type="checkbox"/>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - performing click action
    - click action done
    - waiting for scheduled navigations to finish
    - navigations have finished

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
              - paragraph
              - paragraph:
                - generic [ref=f2e4]: 文字配置切换
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
    - generic [ref=e235]: 最近保存 01:15
```

# Test source

```ts
  1  | import { expect, test, type Page } from '@playwright/test';
  2  | const frame = (p: Page) => p.frameLocator('.tox-edit-area iframe');
  3  | const panel = (p: Page) => p.getByRole('complementary', { name: '图片配置面板' });
  4  | test.beforeEach(async ({ page }) => {
  5  |   await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  6  |   await page.evaluate(async () => {
  7  |     const c = document.createElement('canvas'); c.width = 180; c.height = 100;
  8  |     const ctx = c.getContext('2d')!; ctx.fillStyle = '#147d64'; ctx.fillRect(0, 0, 90, 100); ctx.fillStyle = '#f5ad58'; ctx.fillRect(90, 0, 90, 100);
  9  |     const e = window.tinymce.activeEditor;
  10 |     e.setContent(`<p><img id="a" src="${c.toDataURL()}" style="position:absolute;left:50px;top:50px;width:180px;height:100px"></p><p><img id="b" src="${c.toDataURL()}" style="position:absolute;left:300px;top:50px;width:180px;height:100px"></p><p><span id="words" data-text-draggable="true" style="position:absolute;left:50px;top:230px;font-size:28px">文字配置切换</span></p>`);
  11 |     await e.uploadImages(); e.undoManager.clear(); e.undoManager.add();
  12 |   });
  13 | });
  14 | test('图片配置即时生效，切换图片与文字和空白，撤销保留对象独立设置', async ({ page }) => {
  15 |   await expect(panel(page)).toBeHidden();
  16 |   await frame(page).locator('body > p > #a').click();
  17 |   await expect(panel(page)).toBeVisible();
  18 |   await expect(page.locator('.tox-pop:visible [data-mce-name="imagesettings"]')).toBeVisible();
> 19 |   await panel(page).getByLabel('水平翻转', { exact: true }).check();
     |                                                         ^ Error: locator.check: Test timeout of 90000ms exceeded.
  20 |   await expect(frame(page).locator('#a')).toHaveCSS('scale', '-1 1');
  21 |   await panel(page).getByRole('tab', { name: '外观', exact: true }).click();
  22 |   await panel(page).getByRole('slider', { name: '不透明度', exact: true }).fill('65');
  23 |   await expect(frame(page).locator('#a')).toHaveCSS('opacity', '0.65');
  24 |   await frame(page).locator('#b').click();
  25 |   await panel(page).getByRole('tab', { name: '外观', exact: true }).click();
  26 |   await expect(panel(page).getByRole('slider', { name: '不透明度', exact: true })).toHaveValue('100');
  27 |   await panel(page).getByRole('slider', { name: '不透明度', exact: true }).fill('80');
  28 |   await expect(frame(page).locator('#b')).toHaveCSS('opacity', '0.8');
  29 |   await expect(frame(page).locator('#a')).toHaveCSS('opacity', '0.65');
  30 |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  31 |   await expect(frame(page).locator('#b')).toHaveCSS('opacity', '1');
  32 |   await frame(page).locator('#words').click();
  33 |   await expect(page.getByRole('complementary', { name: '文字配置面板' })).toBeVisible();
  34 |   await expect(panel(page)).toBeHidden();
  35 |   await frame(page).locator('#a').click();
  36 |   await expect(panel(page)).toBeVisible();
  37 |   await expect(page.getByRole('complementary', { name: '文字配置面板' })).toBeHidden();
  38 |   await page.screenshot({ path: 'screenshots/image-config-panel-desktop.png' });
  39 |   await frame(page).locator('body').click({ position: { x: 550, y: 360 } });
  40 |   await expect(panel(page)).toBeHidden();
  41 | });
  42 | test('图片侧栏支持蒙版滤镜描边和锁定，弹窗隔离预览仍可取消', async ({ page }) => {
  43 |   await frame(page).locator('#a').click();
  44 |   await panel(page).getByLabel('锁定位置与尺寸', { exact: true }).check();
  45 |   await expect(frame(page).locator('#a')).toHaveAttribute('data-image-locked', 'true');
  46 |   await panel(page).getByLabel('锁定位置与尺寸', { exact: true }).uncheck();
  47 |   await expect(frame(page).locator('#a')).not.toHaveAttribute('data-image-locked');
  48 |   await panel(page).getByRole('tab', { name: '蒙版', exact: true }).click();
  49 |   await panel(page).getByRole('button', { name: '圆形', exact: true }).click();
  50 |   await expect(frame(page).locator('#a')).toHaveCSS('clip-path', /^circle\((closest-side )?at 50% 50%\)$/);
  51 |   await panel(page).getByRole('tab', { name: '滤镜', exact: true }).click();
  52 |   await panel(page).getByRole('button', { name: '黑白', exact: true }).click();
  53 |   await expect(frame(page).locator('#a')).toHaveCSS('filter', /grayscale\(1\)/);
  54 |   await panel(page).getByRole('tab', { name: '描边', exact: true }).click();
  55 |   await panel(page).getByLabel('启用描边', { exact: true }).check();
  56 |   await expect(frame(page).locator('#a')).toHaveAttribute('data-image-stroke-id');
  57 |   await frame(page).locator('#a').click();
  58 |   await page.locator('.tox-pop:visible [data-mce-name="imagesettings"]').click();
  59 |   const d = page.getByRole('dialog', { name: '图片设置', exact: true });
  60 |   await d.getByLabel('水平翻转', { exact: true }).check();
  61 |   await expect(frame(page).locator('#a')).toHaveCSS('scale', '1');
  62 |   await d.getByRole('button', { name: '取消', exact: true }).click();
  63 |   await expect(panel(page)).toBeVisible();
  64 |   await panel(page).getByRole('button', { name: '重置效果', exact: true }).click();
  65 |   await expect(frame(page).locator('#a')).not.toHaveAttribute('data-image-stroke-id');
  66 |   await expect(frame(page).locator('#a')).toHaveCSS('clip-path', 'none');
  67 |   await page.setViewportSize({ width: 390, height: 844 });
  68 |   await panel(page).scrollIntoViewIfNeeded();
  69 |   const bounds = (await panel(page).boundingBox())!; expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.width).toBeLessThanOrEqual(390);
  70 |   await page.screenshot({ path: 'screenshots/image-config-panel-mobile.png' });
  71 | });
  72 | test('替换图片先验证来源，失败不改原图；读取中切换对象不会误应用', async ({ page }) => {
  73 |   await frame(page).locator('#a').click();
  74 |   const before = await frame(page).locator('#a').getAttribute('src');
  75 |   await panel(page).getByRole('textbox', { name: '图片地址', exact: true }).fill('javascript:bad');
  76 |   await panel(page).getByRole('textbox', { name: '图片地址', exact: true }).press('Tab');
  77 |   await expect(panel(page).getByRole('alert')).toContainText('HTTP');
  78 |   await expect(frame(page).locator('#a')).toHaveAttribute('src', before!);
  79 |   await page.route('**/slow-image.png', async route => {
  80 |     await new Promise(resolve => setTimeout(resolve, 500));
  81 |     await route.fulfill({ contentType: 'image/png', body: Buffer.from(before!.split(',')[1]!, 'base64') });
  82 |   });
  83 |   await panel(page).getByRole('textbox', { name: '图片地址', exact: true }).fill('http://localhost:5184/slow-image.png');
  84 |   await panel(page).getByRole('textbox', { name: '图片地址', exact: true }).press('Tab');
  85 |   await frame(page).locator('#b').click();
  86 |   await page.waitForTimeout(650);
  87 |   await expect(frame(page).locator('#a')).toHaveAttribute('src', before!);
  88 |   await expect(frame(page).locator('#b')).toHaveAttribute('src', before!);
  89 | });
  90 | 
```