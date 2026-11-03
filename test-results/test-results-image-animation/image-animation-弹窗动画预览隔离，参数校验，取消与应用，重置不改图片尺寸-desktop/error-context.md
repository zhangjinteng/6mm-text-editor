# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: image-animation.spec.ts >> 弹窗动画预览隔离，参数校验，取消与应用，重置不改图片尺寸
- Location: tests/image-animation.spec.ts:52:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('.tox-pop:visible [data-mce-name="imagesettings"]')

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
                  - button "插入/编辑图片" [pressed] [ref=e172]
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
              - paragraph
              - paragraph
        - generic [ref=e212]:
          - generic [ref=e213]:
            - group "Element Path" [ref=e214]:
              - button "p" [ref=e215]
              - generic [aria-hidden] [ref=e216]: ›
              - button "img" [ref=e217]
            - generic [ref=e218]: 按 Alt+0 获得帮助
            - generic [ref=e219]:
              - button "0 字" [ref=e220]
              - link "使用 TinyMCE 构建" [ref=e222]:
                - /url: https://www.tiny.cloud/powered-by-tiny?utm_campaign=poweredby&utm_source=tiny&utm_medium=referral&utm_content=v7
                - text: 使用 构建
          - separator "按上下箭头键以调整编辑器大小。" [ref=e229]
    - complementary "图片配置面板" [ref=e233]:
      - generic "图片设置" [ref=e235]:
        - generic [ref=e236]:
          - generic [ref=e237]:
            - heading "图片配置" [level=2] [ref=e238]
            - paragraph [ref=e239]: 调整即时生效，可撤销
          - button "收起图片配置" [ref=e240] [cursor=pointer]: ×
        - generic [ref=e242]:
          - tablist "图片设置分类" [ref=e243]:
            - tab "图片" [ref=e244] [cursor=pointer]
            - tab "外观" [ref=e245] [cursor=pointer]
            - tab "特效" [ref=e246] [cursor=pointer]
            - tab "阴影" [ref=e247] [cursor=pointer]
            - tab "蒙版" [ref=e248] [cursor=pointer]
            - tab "滤镜" [ref=e249] [cursor=pointer]
            - tab "描边" [ref=e250] [cursor=pointer]
            - tab "排版" [ref=e251] [cursor=pointer]
            - tab "动画" [active] [selected] [ref=e252] [cursor=pointer]
          - tabpanel "动画" [ref=e253]:
            - generic [ref=e255]:
              - generic [ref=e256]:
                - strong [ref=e257]: 动画效果
                - button "无动画" [pressed] [ref=e258] [cursor=pointer]
              - group "动画效果" [ref=e259]:
                - button "bounce" [ref=e260] [cursor=pointer]:
                  - generic [ref=e264]: 弹跳
                - button "flash" [ref=e265] [cursor=pointer]:
                  - generic [ref=e268]: 闪烁
                - button "pulse" [ref=e269] [cursor=pointer]:
                  - generic [ref=e273]: 脉冲
                - button "rubberBand" [ref=e274] [cursor=pointer]:
                  - generic [ref=e278]: 橡皮筋
                - button "shakeX" [ref=e279] [cursor=pointer]:
                  - generic [ref=e283]: 左右摇动
                - button "shakeY" [ref=e284] [cursor=pointer]:
                  - generic [ref=e288]: 上下摇动
                - button "headShake" [ref=e289] [cursor=pointer]:
                  - generic [ref=e293]: 摇头
                - button "swing" [ref=e294] [cursor=pointer]:
                  - generic [ref=e298]: 摆动
                - button "tada" [ref=e299] [cursor=pointer]:
                  - generic [ref=e302]: 欢呼
                - button "wobble" [ref=e303] [cursor=pointer]:
                  - generic [ref=e307]: 晃动
                - button "jello" [ref=e308] [cursor=pointer]:
                  - generic [ref=e311]: 果冻
                - button "heartBeat" [ref=e312] [cursor=pointer]:
                  - generic [ref=e316]: 心跳
              - generic [ref=e317]:
                - generic [ref=e318]:
                  - text: 每轮时长（秒）
                  - spinbutton "每轮时长（秒）" [disabled] [ref=e319]: "1"
                - generic [ref=e320]:
                  - text: 循环播放
                  - checkbox "循环播放" [disabled] [ref=e321]
                - generic [ref=e322]:
                  - text: 循环总时长（秒）
                  - spinbutton "循环总时长（秒）" [disabled] [ref=e323]: "0"
                - paragraph [ref=e324]: 总时长为 0 时持续循环
        - button "重置效果" [ref=e326] [cursor=pointer]
  - contentinfo [ref=e327]:
    - generic [ref=e328]: 编辑器已就绪
    - generic [ref=e330]: 6mm 源码构建 · GPLv2+ · 28 个插件已注册
    - generic [ref=e331]: 最近保存 02:11
```

# Test source

```ts
  1   | import { expect, test, type Page } from '@playwright/test';
  2   | import { readFile } from 'node:fs/promises';
  3   | const names = ['bounce', 'flash', 'pulse', 'rubberBand', 'shakeX', 'shakeY', 'headShake', 'swing', 'tada', 'wobble', 'jello', 'heartBeat'];
  4   | const frame = (p: Page) => p.frameLocator('.tox-edit-area iframe');
  5   | const image = (p: Page) => frame(p).locator('#animated-image');
  6   | const panel = (p: Page) => p.getByRole('complementary', { name: '图片配置面板' });
  7   | const dialog = (p: Page) => p.getByRole('dialog', { name: '图片设置', exact: true });
  8   | async function select(page: Page) {
  9   |   await image(page).evaluate(node => node.getAnimations().forEach(a => { a.pause(); a.currentTime = 0; }));
  10  |   await image(page).click();
  11  |   await panel(page).getByRole('tab', { name: '动画', exact: true }).click();
  12  | }
  13  | test.beforeEach(async ({ page }) => {
  14  |   await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  15  |   await page.evaluate(() => {
  16  |     const canvas = document.createElement('canvas'); canvas.width = 160; canvas.height = 120;
  17  |     const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#147d64'; ctx.fillRect(15, 15, 130, 90);
  18  |     const e = window.tinymce.activeEditor;
  19  |     e.setContent(`<p><img id="animated-image" src="${canvas.toDataURL()}" style="position:absolute;left:80px;top:90px;width:160px;height:120px"></p><p><img id="other-image" src="${canvas.toDataURL()}" style="position:absolute;left:400px;top:90px;width:160px;height:120px"></p>`);
  20  |     e.undoManager.clear(); e.undoManager.add();
  21  |   });
  22  | });
  23  | 
  24  | test('图片配置复用十二种动画，参数即时应用、独立切换、撤销与无动画', async ({ page }) => {
  25  |   await select(page);
  26  |   await expect(panel(page).getByRole('group', { name: '动画效果', exact: true }).getByRole('button')).toHaveCount(12);
  27  |   for (const name of names) {
  28  |     await panel(page).getByRole('button', { name, exact: true }).click();
  29  |     await expect(image(page)).toHaveAttribute('data-image-animation', name);
  30  |     await expect(image(page)).toHaveCSS('animation-name', `image-${name}`);
  31  |   }
  32  |   await panel(page).getByRole('spinbutton', { name: '每轮时长（秒）', exact: true }).fill('2');
  33  |   await expect(image(page)).toHaveCSS('animation-duration', '2s');
  34  |   await panel(page).getByRole('checkbox', { name: '循环播放', exact: true }).check();
  35  |   await expect(image(page)).toHaveCSS('animation-iteration-count', 'infinite');
  36  |   await panel(page).getByRole('spinbutton', { name: '循环总时长（秒）', exact: true }).fill('10');
  37  |   await expect(image(page)).toHaveCSS('animation-iteration-count', '5');
  38  |   await page.screenshot({ path: 'screenshots/image-animation-sidebar.png' });
  39  |   await frame(page).locator('#other-image').click();
  40  |   await panel(page).getByRole('tab', { name: '动画', exact: true }).click();
  41  |   await expect(panel(page).getByRole('button', { name: '无动画', exact: true })).toHaveAttribute('aria-pressed', 'true');
  42  |   await select(page);
  43  |   await expect(panel(page).getByRole('spinbutton', { name: '每轮时长（秒）', exact: true })).toHaveValue('2');
  44  |   await panel(page).getByRole('button', { name: '无动画', exact: true }).click();
  45  |   await expect(image(page)).not.toHaveAttribute('data-image-animation');
  46  |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  47  |   await expect(image(page)).toHaveAttribute('data-image-animation', 'heartBeat');
  48  |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  49  |   await expect(image(page)).toHaveCSS('animation-name', 'none');
  50  | });
  51  | 
  52  | test('弹窗动画预览隔离，参数校验，取消与应用，重置不改图片尺寸', async ({ page }) => {
  53  |   await select(page); const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
> 54  |   await page.locator('.tox-pop:visible [data-mce-name="imagesettings"]').click();
      |                                                                          ^ Error: locator.click: Test timeout of 30000ms exceeded.
  55  |   const d = dialog(page), preview = d.locator('.image-settings-preview img');
  56  |   await d.getByRole('tab', { name: '动画', exact: true }).click();
  57  |   for (const name of names) {
  58  |     await d.getByRole('button', { name, exact: true }).click();
  59  |     await expect(preview).toHaveCSS('animation-name', `image-${name}`);
  60  |     await expect(image(page)).not.toHaveAttribute('data-image-animation');
  61  |   }
  62  |   await d.getByRole('spinbutton', { name: '每轮时长（秒）', exact: true }).fill('0');
  63  |   await d.getByRole('button', { name: '应用设置', exact: true }).click();
  64  |   await expect(d.getByRole('alert')).toContainText('0.1—60');
  65  |   await d.getByRole('button', { name: '取消', exact: true }).click();
  66  |   expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  67  |   await page.locator('.tox-pop:visible [data-mce-name="imagesettings"]').click();
  68  |   await d.getByRole('tab', { name: '动画', exact: true }).click();
  69  |   await d.getByRole('button', { name: 'pulse', exact: true }).click();
  70  |   await d.getByRole('button', { name: '应用设置', exact: true }).click();
  71  |   await expect(image(page)).toHaveAttribute('data-image-animation', 'pulse');
  72  |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  73  |   expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  74  |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  75  |   await select(page);
  76  |   await panel(page).getByRole('button', { name: '重置效果', exact: true }).click();
  77  |   await expect(image(page)).not.toHaveAttribute('data-image-animation');
  78  |   await expect(image(page)).toHaveCSS('width', '160px');
  79  |   await expect(image(page)).toHaveCSS('height', '120px');
  80  | });
  81  | 
  82  | test('动画随图片保存、预览、离线导出并遵守减少动态效果', async ({ page }) => {
  83  |   await select(page);
  84  |   await panel(page).getByRole('button', { name: 'shakeX', exact: true }).click();
  85  |   await panel(page).getByRole('checkbox', { name: '循环播放', exact: true }).check();
  86  |   await expect(image(page)).toHaveAttribute('data-animation-loop', 'true');
  87  |   await page.getByRole('button', { name: '保存文档', exact: true }).click();
  88  |   await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  89  |   await expect(image(page)).toHaveCSS('animation-name', 'image-shakeX');
  90  |   await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  91  |   await expect(page.frameLocator('iframe[title="文档预览"]').locator('#animated-image')).toHaveCSS('animation-name', 'image-shakeX');
  92  |   await page.getByRole('button', { name: '导出', exact: true }).click();
  93  |   const downloading = page.waitForEvent('download');
  94  |   await page.getByRole('button', { name: 'HTML 文档', exact: true }).click();
  95  |   const download = await downloading;
  96  |   const html = await readFile((await download.path())!, 'utf8');
  97  |   const exported = await page.context().newPage(); await exported.route('**/*', route => route.abort());
  98  |   await exported.setContent(html);
  99  |   await expect(exported.locator('#animated-image')).toHaveCSS('animation-name', 'image-shakeX');
  100 |   await exported.emulateMedia({ reducedMotion: 'reduce' });
  101 |   await expect(exported.locator('#animated-image')).toHaveCSS('animation-duration', '0.001s');
  102 |   await exported.close();
  103 | });
  104 | 
  105 | test('循环动画与旋转翻转描边同步，动画中对齐不改变布局尺寸', async ({ page }) => {
  106 |   await select(page);
  107 |   await panel(page).getByRole('tab', { name: '图片', exact: true }).click();
  108 |   await panel(page).getByLabel('水平翻转', { exact: true }).check();
  109 |   await panel(page).getByRole('slider', { name: '旋转角度', exact: true }).fill('25');
  110 |   await expect(image(page)).toHaveCSS('rotate', '25deg');
  111 |   await panel(page).getByRole('tab', { name: '描边', exact: true }).click();
  112 |   await panel(page).getByLabel('启用描边', { exact: true }).check();
  113 |   const stroke = frame(page).locator('[data-image-stroke-for]'); await expect(stroke).toHaveCount(1);
  114 |   await panel(page).getByRole('tab', { name: '动画', exact: true }).click();
  115 |   await panel(page).getByRole('button', { name: 'wobble', exact: true }).click();
  116 |   await panel(page).getByRole('checkbox', { name: '循环播放', exact: true }).check();
  117 |   await expect(stroke).toHaveCSS('animation-name', 'image-wobble');
  118 |   await expect(stroke).toHaveCSS('animation-iteration-count', 'infinite');
  119 |   await expect(image(page)).toHaveCSS('scale', '-1 1');
  120 |   await expect.poll(() => page.evaluate(() => {
  121 |     const body = window.tinymce.activeEditor.getBody();
  122 |     return body.querySelector('#animated-image')!.getAnimations()[0]?.startTime === body.querySelector('[data-image-stroke-for]')!.getAnimations()[0]?.startTime;
  123 |   })).toBe(true);
  124 |   await panel(page).getByRole('tab', { name: '排版', exact: true }).click();
  125 |   await panel(page).getByRole('button', { name: '居中对齐', exact: true }).click();
  126 |   const geometry = await page.evaluate(async () => {
  127 |     const { imageLayoutRect } = await import('/src/image-animation.ts');
  128 |     const e = window.tinymce.activeEditor, img = e.getBody().querySelector<HTMLElement>('#animated-image')!;
  129 |     const rect = imageLayoutRect(img), body = e.getBody().getBoundingClientRect();
  130 |     return { center: rect.x + rect.width / 2, expected: body.x + body.width / 2 };
  131 |   });
  132 |   expect(geometry.center).toBeCloseTo(geometry.expected, 0);
  133 |   await expect(image(page)).toHaveCSS('width', '160px'); await expect(image(page)).toHaveCSS('height', '120px');
  134 | });
  135 | 
```