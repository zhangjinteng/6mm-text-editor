# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: text-fill-layers.spec.ts >> fill alpha leaves shadow opaque, and multilayer text remains editable, formattable and independently duplicable
- Location: tests/text-fill-layers.spec.ts:112:1

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.fill: Test timeout of 90000ms exceeded.
Call log:
  - waiting for getByRole('dialog', { name: '文字设置', exact: true }).getByRole('textbox', { name: '填充不透明度', exact: true })

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
                  - button "字体Arial" [ref=e117]:
                    - generic [ref=e118]: Arial
                  - generic [ref=e122]:
                    - button "Decrease font size" [ref=e123]
                    - textbox [ref=e127]: 64px
                    - button "Increase font size" [ref=e128]
                - group [ref=e132]:
                  - button "粗体" [pressed] [ref=e133]
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
          - iframe [ref=e211]:
            - generic [ref=f4e1]:
              - paragraph:
                - generic [ref=f4e2]:
                  - strong [ref=f4e3]: FILL Aa
                  - emphasis [ref=f4e4]: 测试文字
        - generic [ref=e212]:
          - generic [ref=e213]:
            - group "Element Path" [ref=e214]:
              - button "p" [ref=e215]
              - generic [aria-hidden] [ref=e216]: ›
              - button "span" [ref=e217]
              - generic [aria-hidden] [ref=e218]: ›
              - button "strong" [ref=e219]
            - generic [ref=e220]: 按 Alt+0 获得帮助
            - generic [ref=e221]:
              - button "6 字" [ref=e222]
              - link "使用 TinyMCE 构建" [ref=e224]:
                - /url: https://www.tiny.cloud/powered-by-tiny?utm_campaign=poweredby&utm_source=tiny&utm_medium=referral&utm_content=v7
                - text: 使用 构建
          - separator "按上下箭头键以调整编辑器大小。" [ref=e231]
    - complementary "直播弹幕面板" [ref=e235]:
      - generic [ref=e236]:
        - heading "直播弹幕" [level=2] [ref=e237]
        - button "收起直播弹幕" [ref=e238] [cursor=pointer]
      - generic [ref=e242]:
        - generic [ref=e243]:
          - strong [ref=e251]: 未连接
          - generic [ref=e252]: APP 1717059966646
          - button "连接直播间" [ref=e253] [cursor=pointer]
          - alert [ref=e256]:
            - generic [ref=e259]: B 站返回 7003：心跳过期或GameId错误
        - group [ref=e260]:
          - generic "自动订阅：给容器添加属性" [ref=e261]
        - generic [ref=e262]:
          - textbox "搜索弹幕" [ref=e267]:
            - /placeholder: 搜索弹幕或用户
          - combobox "弹幕类型" [ref=e268]:
            - option "全部" [selected]
            - option "弹幕"
            - option "醒目留言"
            - option "礼物"
            - option "大航海"
        - generic [ref=e269]:
          - generic [ref=e270]: 0 条消息 · 已选 0
          - button "清空弹幕" [disabled] [ref=e271]
        - generic [ref=e275]: 暂无弹幕消息
        - generic [ref=e284]:
          - generic [ref=e285]:
            - checkbox "包含用户名" [checked] [ref=e286]
            - text: 包含用户名
          - button "插入选中" [disabled] [ref=e287]
  - contentinfo [ref=e290]:
    - generic [ref=e291]: 编辑器已就绪
    - generic [ref=e293]: 6mm 源码构建 · GPLv2+ · 28 个插件已注册
    - generic [ref=e294]: 最近保存 00:10
```

# Test source

```ts
  13  | const apply = (p: Page) => button(p, '应用设置').click();
  14  | async function saved(p: Page): Promise<FillLayer[]> { return JSON.parse((await box(p).getAttribute('data-text-fills'))!); }
  15  | async function pixels(svg: Locator) {
  16  |   return svg.evaluate(async element => {
  17  |     const copy = element.cloneNode(true) as SVGSVGElement; copy.style.cssText = '';
  18  |     const image = new Image(); image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(copy)); await image.decode();
  19  |     const canvas = document.createElement('canvas'); canvas.width = Number(copy.getAttribute('width')); canvas.height = Number(copy.getAttribute('height'));
  20  |     const ctx = canvas.getContext('2d')!; ctx.drawImage(image, 0, 0); const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  21  |     let purple = 0, redHalf = 0, blue = 0, black = 0, visible = 0;
  22  |     for (let i = 0; i < data.length; i += 4) {
  23  |       const r = data[i]!, g = data[i + 1]!, b = data[i + 2]!, a = data[i + 3]!;
  24  |       if (a > 30) visible++;
  25  |       if (a > 240 && r > 110 && r < 145 && b > 110 && b < 145 && g < 10) purple++;
  26  |       if (a > 115 && a < 140 && r > 240 && g < 10 && b < 10) redHalf++;
  27  |       if (a > 240 && b > 240 && r < 10 && g < 10) blue++;
  28  |       if (a > 240 && r < 10 && g < 10 && b < 10) black++;
  29  |     }
  30  |     return { purple, redHalf, blue, black, visible };
  31  |   });
  32  | }
  33  | test.beforeEach(async ({ page }) => {
  34  |   await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  35  |   await page.evaluate(() => { const e = window.tinymce.activeEditor; e.setContent('<p><span id="fill-text" data-text-draggable="true" style="position:absolute;left:100px;top:90px;width:360px;font:64px/1.4 Arial"><strong style="color:#000">FILL Aa</strong><br><em style="color:#147d64">测试文字</em></span></p>'); e.undoManager.clear(); e.undoManager.add(); });
  36  | });
  37  | test('fill opacity composites real glyph pixels; visibility, order and no-fill preserve strokes and source', async ({ page }) => {
  38  |   const before = await page.evaluate(() => window.tinymce.activeEditor.getContent()); await open(page);
  39  |   await mode(page, 'solid'); await field(page, '填充颜色').fill('#0000ff');
  40  |   await button(page, '添加填充').click(); await field(page, '填充颜色').fill('#ff0000'); await field(page, '填充不透明度').fill('50');
  41  |   expect((await pixels(preview(page).locator(':scope > [data-text-render] svg'))).purple).toBeGreaterThan(500);
  42  |   expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  43  |   await button(page, '隐藏填充 1').click(); expect((await pixels(preview(page).locator(':scope > [data-text-render] svg'))).blue).toBeGreaterThan(500);
  44  |   await button(page, '显示填充 1').click(); await button(page, '下移填充 1').click(); expect((await pixels(preview(page).locator(':scope > [data-text-render] svg'))).blue).toBeGreaterThan(500);
  45  |   await button(page, '上移填充 2').click(); await button(page, '删除填充 2').click();
  46  |   expect((await pixels(preview(page).locator(':scope > [data-text-render] svg'))).redHalf).toBeGreaterThan(500);
  47  |   await d(page).getByRole('tab', { name: '外观', exact: true }).click(); await d(page).getByRole('tab', { name: '描边', exact: true }).click(); await d(page).getByRole('checkbox', { name: '启用文字描边', exact: true }).check();
  48  |   await field(page, '描边宽度（0—10 px）').fill('3'); await d(page).getByRole('combobox', { name: '描边位置', exact: true }).selectOption('outside');
  49  |   const composed = await pixels(preview(page).locator(':scope > [data-text-render] svg')); expect(composed.redHalf).toBeGreaterThan(500); expect(composed.black).toBeGreaterThan(100);
  50  |   await d(page).getByRole('tab', { name: '背景', exact: true }).click(); await button(page, '添加背景').click(); await field(page, '背景颜色').fill('#eeeeee');
  51  |   await apply(page); await expect(box(page)).toHaveCSS('opacity', '1'); await expect(box(page).locator('[data-text-background-render] path')).toHaveAttribute('fill', '#eeeeee');
  52  |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo()); expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  53  |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo()); await open(page); await mode(page, 'empty');
  54  |   expect((await pixels(preview(page).locator(':scope > [data-text-render] svg'))).redHalf).toBe(0); expect((await pixels(preview(page).locator(':scope > [data-text-render] svg'))).black).toBeGreaterThan(100);
  55  |   await apply(page); await expect(box(page).locator('[data-text-fill-layer]')).toHaveCount(0); await expect(box(page).locator('[data-text-stroke-layer]')).toHaveCount(1);
  56  |   await open(page); await button(page, '删除填充 1').click(); await expect(d(page).getByRole('combobox', { name: '填充类型', exact: true })).toHaveCount(0); await apply(page);
  57  |   expect(await saved(page)).toEqual([]); await expect(box(page).locator('[data-text-source] strong')).toHaveText('FILL Aa');
  58  | });
  59  | test('multi-stop gradients support alpha, drag, keyboard, radial geometry and independent layer settings', async ({ page }) => {
  60  |   await open(page); await mode(page, 'gradient'); await field(page, '色标颜色').fill('#ff0000');
  61  |   await d(page).getByRole('slider', { name: '渐变色标 2', exact: true }).click(); await field(page, '色标颜色').fill('#0000ff');
  62  |   await button(page, '添加色标').click(); await field(page, '色标颜色').fill('#ffff00'); await field(page, '色标位置').fill('30'); await field(page, '色标不透明度').fill('40');
  63  |   const marker = d(page).getByRole('slider', { name: '渐变色标 3', exact: true }); await marker.press('Shift+ArrowRight'); await expect(marker).toHaveAttribute('aria-valuenow', '40');
  64  |   const track = (await d(page).locator('.text-fill-stop-track').boundingBox())!; const handle = (await marker.boundingBox())!;
  65  |   await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2); await page.mouse.down(); await page.mouse.move(track.x + track.width * .65, handle.y + handle.height / 2, { steps: 6 }); await page.mouse.up();
  66  |   expect(Number(await marker.getAttribute('aria-valuenow'))).toBeCloseTo(65, 0);
  67  |   await d(page).getByRole('combobox', { name: '渐变类型', exact: true }).selectOption('radial'); await field(page, '渐变中心 X').fill('30'); await field(page, '渐变中心 Y').fill('60'); await field(page, '渐变范围').fill('80');
  68  |   await expect(preview(page).locator('radialGradient stop')).toHaveCount(3); await expect(preview(page).locator('radialGradient stop').nth(1)).toHaveAttribute('stop-opacity', '0.4');
  69  |   await button(page, '添加填充').scrollIntoViewIfNeeded(); await page.screenshot({ path: 'screenshots/text-fill-gradient.png' });
  70  |   await button(page, '添加填充').click(); await field(page, '填充颜色').fill('#ffffff'); await field(page, '填充不透明度').fill('15'); await button(page, '隐藏填充 1').click(); await button(page, '编辑填充 2').click();
  71  |   await expect(d(page).getByRole('combobox', { name: '渐变类型', exact: true })).toHaveValue('radial'); await expect(field(page, '渐变中心 X')).toHaveValue('30');
  72  |   await apply(page); const layers = await saved(page); expect(layers).toHaveLength(2); expect(layers[0]!.visible).toBe(false); expect(layers[1]!.stops).toHaveLength(3);
  73  |   await page.getByRole('button', { name: '保存文档', exact: true }).click(); await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  74  |   expect(await saved(page)).toEqual(layers); await expect(box(page).locator('radialGradient stop')).toHaveCount(3);
  75  |   await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  76  |   const exported = page.frameLocator('iframe[title="文档预览"]').locator('#fill-text'); await expect(exported.locator('radialGradient')).toHaveAttribute('cx', '108'); await expect(exported.locator('stop').nth(1)).toHaveAttribute('stop-opacity', '0.4');
  77  |   await page.getByRole('button', { name: '导出', exact: true }).click(); const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'HTML 文档', exact: true }).click();
  78  |   const html = await readFile((await (await download).path())!, 'utf8');
  79  |   const standalone = await page.context().newPage(); await standalone.setContent(html);
  80  |   await expect(standalone.locator('#fill-text [data-text-source]')).toBeHidden(); await expect(standalone.locator('script')).toHaveCount(0);
  81  |   await expect(standalone.locator('radialGradient')).toHaveAttribute('gradientUnits', 'userSpaceOnUse');
  82  |   expect((await pixels(standalone.locator('#fill-text svg'))).visible).toBeGreaterThan(500); await standalone.close();
  83  | 
  84  | });
  85  | test('image placement, rotation, scaling and tiling paint pixels and survive reload and curved rendering', async ({ page }) => {
  86  |   const uri = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = c.height = 64; const ctx = c.getContext('2d')!; ctx.fillStyle = 'red'; ctx.fillRect(0, 0, 32, 64); ctx.fillStyle = 'blue'; ctx.fillRect(32, 0, 32, 64); return c.toDataURL(); });
  87  |   await open(page); await mode(page, 'image'); const chooser = page.waitForEvent('filechooser'); await button(page, '选择本地图片').click(); await (await chooser).setFiles({ name: 'texture.png', mimeType: 'image/png', buffer: Buffer.from(uri.split(',')[1]!, 'base64') });
  88  |   await expect(field(page, '图片地址（HTTPS 或本地上传）')).toHaveValue(/^data:image/);
  89  |   await field(page, '图片缩放').fill('40'); await field(page, '图片水平偏移').fill('20'); await field(page, '图片垂直偏移').fill('-10'); await field(page, '图片旋转').fill('30');
  90  |   await expect(preview(page).locator('pattern image')).toHaveAttribute('transform', /rotate\(30 /);
  91  |   const cropped = await pixels(preview(page).locator(':scope > [data-text-render] svg')); await d(page).getByRole('checkbox', { name: '平铺图片', exact: true }).check();
  92  |   await expect(preview(page).locator('pattern')).toHaveAttribute('patternTransform', /rotate\(30 /);
  93  |   const tiled = await pixels(preview(page).locator(':scope > [data-text-render] svg')); expect(tiled.visible).toBeGreaterThan(cropped.visible * 1.3);
  94  |   await d(page).getByRole('combobox', { name: '图片适配', exact: true }).selectOption('contain'); await expect(preview(page).locator('pattern image')).toHaveAttribute('preserveAspectRatio', 'xMidYMid meet');
  95  |   await d(page).getByRole('tab', { name: '变形', exact: true }).click(); await d(page).getByRole('button', { name: '上拱', exact: true }).click(); await apply(page); await expect(d(page)).toHaveCount(0);
  96  |   const layers = await saved(page); expect(layers[0]).toMatchObject({ scale: 40, offsetX: 20, offsetY: -10, rotation: 30, repeat: true, fit: 'contain' });
  97  |   await expect(box(page).locator('textPath')).toHaveText(['FILL Aa', '测试文字']); await expect(box(page).locator('pattern')).toHaveAttribute('patternTransform', /rotate\(30 /);
  98  |   await page.getByRole('button', { name: '保存文档', exact: true }).click(); await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  99  |   expect(await saved(page)).toEqual(layers); await expect(box(page).locator('pattern')).toHaveAttribute('patternTransform', /rotate\(30 /);
  100 |   await open(page); await button(page, '重置图片位置').click(); await expect(field(page, '图片缩放')).toHaveValue('100'); await expect(field(page, '图片旋转')).toHaveValue('0'); await expect(d(page).getByRole('checkbox', { name: '平铺图片', exact: true })).not.toBeChecked(); await button(page, '取消').click(); expect(await saved(page)).toEqual(layers);
  101 | });
  102 | test('invalid input and failed image loads never commit; hidden incomplete fills and narrow screens remain editable', async ({ page }) => {
  103 |   const before = await page.evaluate(() => window.tinymce.activeEditor.getContent()); await open(page); await mode(page, 'gradient'); await field(page, '色标位置').fill('120'); await apply(page); await expect(d(page).getByRole('alert')).toBeVisible(); expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  104 |   await field(page, '色标位置').fill('0'); await mode(page, 'image'); await field(page, '图片地址（HTTPS 或本地上传）').fill('javascript:alert(1)'); await apply(page); await expect(d(page).getByRole('alert')).toContainText('HTTPS');
  105 |   await page.route('https://example.com/no-image.png', route => route.abort()); await field(page, '图片地址（HTTPS 或本地上传）').fill('https://example.com/no-image.png'); await apply(page); await expect(d(page).getByRole('alert')).toContainText('加载失败'); expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  106 |   await field(page, '图片地址（HTTPS 或本地上传）').fill(''); await button(page, '隐藏填充 1').click(); await apply(page); expect((await saved(page))[0]!.visible).toBe(false);
  107 |   await open(page); await page.setViewportSize({ width: 390, height: 844 }); await button(page, '添加填充').click(); await mode(page, 'gradient'); await button(page, '添加色标').click(); await field(page, '色标颜色').fill('#ffcc33');
  108 |   const bounds = (await d(page).boundingBox())!; expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.width).toBeLessThanOrEqual(390); await button(page, '添加填充').scrollIntoViewIfNeeded(); await page.screenshot({ path: 'screenshots/text-fill-mobile.png' });
  109 |   await button(page, '取消').click(); expect((await saved(page))).toHaveLength(1);
  110 | });
  111 | 
  112 | test('fill alpha leaves shadow opaque, and multilayer text remains editable, formattable and independently duplicable', async ({ page }) => {
> 113 |   await open(page); await mode(page, 'solid'); await field(page, '填充颜色').fill('#ff0000'); await field(page, '填充不透明度').fill('0');
      |                                                                                                                       ^ Error: locator.fill: Test timeout of 90000ms exceeded.
  114 |   await d(page).getByRole('tab', { name: '外观', exact: true }).click(); await d(page).getByRole('tab', { name: '投影', exact: true }).click(); await button(page, '添加投影').click();await field(page, '投影不透明度').fill('100');await d(page).getByText('坐标偏移', { exact: true }).click();
  115 |   await field(page, '投影颜色').fill('#000000'); await field(page, '水平偏移（px）').fill('30'); await field(page, '垂直偏移（px）').fill('0'); await field(page, '投影模糊度').fill('0');
  116 |   expect((await pixels(preview(page).locator(':scope > [data-text-render] svg'))).black).toBeGreaterThan(500); await expect(preview(page).locator('[data-text-shadow-layer]')).toHaveAttribute('transform', 'translate(30 0)');
  117 |   await d(page).getByRole('tab', { name: '填充', exact: true }).click(); await field(page, '填充不透明度').fill('50'); await button(page, '添加填充').click(); await mode(page, 'gradient'); await field(page, '填充不透明度').fill('40'); await apply(page);
  118 |   await box(page).dblclick(); await expect(box(page).locator('[data-text-source]')).toBeVisible(); await page.keyboard.press('End'); await page.keyboard.insertText('新增'); await page.keyboard.press('Escape'); await expect(box(page).locator('[data-text-fill-layer]').first()).toContainText('新增');
  119 |   await page.evaluate(() => window.tinymce.activeEditor.execCommand('FontSize', false, '48px')); const runs = box(page).locator('[data-text-fill-layer] text');
  120 |   for (const node of await runs.all()) await expect(node).toHaveAttribute('font-size', '48px');
  121 |   await page.evaluate(() => window.tinymce.activeEditor.execCommand('TextDuplicate')); const boxes = page.frameLocator('.tox-edit-area iframe').locator('p > [data-text-draggable]'); await expect(boxes).toHaveCount(2);
  122 |   const ids = await boxes.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-text-render-id'))); expect(new Set(ids).size).toBe(2);
  123 |   for (let i = 0; i < 2; i++) { await expect(boxes.nth(i).locator('linearGradient')).toHaveAttribute('id', `${ids[i]}-fill-0`); await expect(boxes.nth(i).locator('[data-text-shadow-layer]')).toHaveAttribute('transform', 'translate(30 0)'); }
  124 | });
  125 | 
  126 | test('an outdated image validation cannot apply a newer draft or block reset', async ({ page }) => {
  127 |   let release: (() => void) | undefined;
  128 |   await page.route('https://example.com/slow.png', async route => { await new Promise<void>(resolve => { release = resolve; }); await route.abort(); });
  129 |   await open(page); await mode(page, 'image'); await field(page, '图片地址（HTTPS 或本地上传）').fill('https://example.com/slow.png'); await apply(page);
  130 |   await expect(button(page, '检查图片…')).toBeDisabled();
  131 |   await button(page, '重置效果').click(); await expect(button(page, '应用设置')).toBeEnabled(); await mode(page, 'solid'); await field(page, '填充颜色').fill('#112233');
  132 |   release?.(); await apply(page); await expect(d(page)).toHaveCount(0); expect((await saved(page))[0]!.color).toBe('#112233');
  133 | });
  134 | 
```