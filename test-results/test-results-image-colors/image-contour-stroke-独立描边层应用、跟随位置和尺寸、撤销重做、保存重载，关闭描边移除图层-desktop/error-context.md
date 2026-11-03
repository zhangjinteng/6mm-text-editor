# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: image-contour-stroke.spec.ts >> 独立描边层应用、跟随位置和尺寸、撤销重做、保存重载，关闭描边移除图层
- Location: tests/image-contour-stroke.spec.ts:46:1

# Error details

```
Error: locator.fill: Error: strict mode violation: getByRole('dialog', { name: '图片设置', exact: true }).getByLabel('描边颜色') resolved to 3 elements:
    1) <button type="button" aria-label="选择描边颜色" aria-expanded="false" aria-haspopup="dialog" class="text-color-trigger"></button> aka getByRole('button', { name: '选择描边颜色' })
    2) <input hidden="" type="color" tabindex="-1" aria-hidden="true" aria-label="选择描边颜色" data-image-color="strokeColor"/> aka getByRole('tabpanel', { name: '描边' }).locator('input[type="color"]')
    3) <input type="text" aria-label="描边颜色" name="strokeColor" spellcheck="false"/> aka getByRole('textbox', { name: '描边颜色' })

Call log:
  - waiting for getByRole('dialog', { name: '图片设置', exact: true }).getByLabel('描边颜色')

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
        - generic [ref=e16]: 保存中
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
              - tab "图片" [selected] [ref=e244] [cursor=pointer]
              - tab "外观" [ref=e245] [cursor=pointer]
              - tab "阴影" [ref=e246] [cursor=pointer]
              - tab "蒙版" [ref=e247] [cursor=pointer]
              - tab "滤镜" [ref=e248] [cursor=pointer]
              - tab "描边" [ref=e249] [cursor=pointer]
              - tab "排版" [ref=e250] [cursor=pointer]
            - tabpanel "图片" [ref=e251]:
              - heading "插入 / 编辑图片" [level=3] [ref=e252]
              - generic [ref=e253]:
                - text: 图片地址
                - textbox "图片地址" [ref=e254]: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAE/UlEQVR4AeybMW8dRRSFj+0KgZSKFpIqYErKgJLWtJgKyTS2FLrwA14Y4h+Au1hyGixRYVrcEgElJQGqBFoqJBCV87hnR5YIxYS3b+fcu+iOZrxrz5t7zz2f5u1m894msoVyIIGEwgEkkAQSzIFgcnKHJJBgDgSTkzskgQRzIJic3CEJJJgDweT02SHBipyTnAQSjFYCSSDBHAgmJ3dIAgnmQDA5uUMSSDAHgsnJHZJAgjkQTM6cdkgw6/rISSB9fB0dNYGMtq7PwgTSx9fRURPIaOv6LJwXkENcR8G+jfs2vrbxGJ/gDzsuh1HPH9s55/iafXAN5tPiA6GhBfdQ8AMu8BOAExu3bdy0cRVLvGjH2uv5VfuFc3zNybCGaxmDsWwyco8L5B5uoOCLwVBgAWDbxtjOtQsQaLGYjD02Uud18YAUvIKCz/AU3wLYtTF13x1iMwdzTR19zXixgPD6sIFHVtOejd59D8zFnL0zrRA/DpCC+6b75Jlrgv2ha+c1h9ekmrtrqv8a3B/IR3gBBV8B4EXYDi79NqiBWuDbfIHQgCs4Nwt2bHj3HVALNTkq8QVyBV9a7bxFtUOIftOgUJObGD8g9X07ws74t/k7qNrg0XyA1Dsbz2vG87zmNWX/eS/qMa8Hwnv/DRwheqNGahXr1AOBPV2qt5viUldMVzUerrhq7ZdrgdRHFntrq9YF2LOnaDd06dRf+nyKO5hbE2vW7ZBDXDcWuzbm1nftTZbaV9E9+rU6IBd4f7RK74VC7TogwLvevq6RX6ZdA6S+XW2vYYj30m3UGrrr0AC5wNvdK+mdQFSDBgjwZm+/BPElNaiAvC4wrHcKSQ0qIK/2dksQX1KDBsgGXhYY1jeFqAYNkPpcqK9hvaOLatAA6W3W/yh+E8hkdW7gz8lieQUS1aABssRvXj5OlldUgwYI8MtkxvgFktSgAvKjn4+TZZbUoALy/WS2+AWS1KABsoVv/HycKLOoBg2QBX42W/iZXTvMsj9CraG7eA2QWobrB9CqhNE/Zdp1QLbw+Wg7vBcKteuA1C1/5u3tiPxnqrcratMBqdmOAJ7MaGziCMKmBXIX31ltpzbm0k9RNcv0aoHUshYQPReq6Ub+rBoXI1ePXqYHUvArlriD6I0aqVWsUw+EBRY8sMOxjaj9GFUj1M0HCKss+NAO/PaUHUL1c1Rt8Gh+QFjt7+AH0B7yNMh4iKrJTY4vkE/xlxmwY9VH2CnngxZqMkFe3RcIq6YBBe/Yqec15RjUQC3wbf5ALuuv79sHqLebl3/te6y5DlBzI0KLA4Ru8M5mCX4GeOV/PHL5iuPUbr+3wZyI02IBoS+89y/4AJt4y37t8ezrbIjNHMxlSSL1eEAu3blrj1kK3sMWXrM/8bt+6/x/CtceDrEYk7EtaMQeF8ilW3xKXOyJUsEbg6HAgU3xBoC3y0+euebUa8ITm+ccX3MwrOFaxmAsm4zc4wP5p3s0lO/5vAgX3ELBNXyMl+y4MYx6fs3Ob6G+5oHy0TkmaPMCMkHB0UMkkGCEEkgCCeZAMDm5QxJIMAeacvSTuUP0njczJpCmPfrJBKL3vJkxgTTt0U8mEL3nzYwJpGmPfjKB6D1vZkwgTXv0kwlE73kzYwJp2tNnshU1gbTccZhLIA6mt1ImkJY7DnMJxMH0VsoE0nLHYS6BOJjeSplAWu44zCUQB9NbKf8GAAD//7XSCyEAAAAGSURBVAMAD5vMyZqwzn8AAAAASUVORK5CYII=
              - button "选择本地图片" [ref=e255] [cursor=pointer]
              - paragraph [ref=e256]: 支持 PNG、JPG、WebP、GIF、SVG，最大 5 MB。替换保留位置和尺寸，重置旧裁剪。
              - generic [ref=e257]:
                - text: 图片描述
                - textbox "图片描述" [ref=e258]
              - generic [ref=e259]:
                - text: 图片标题
                - textbox "图片标题" [ref=e260]
              - generic [ref=e261]:
                - generic [ref=e262]:
                  - text: 宽度（px）
                  - spinbutton "图片宽度" [ref=e263]: "100"
                - generic [ref=e264]:
                  - text: 高度（px）
                  - spinbutton "图片高度" [ref=e265]: "100"
              - generic [ref=e266]:
                - checkbox "保持宽高比" [checked] [ref=e267]
                - text: 保持宽高比
              - button "裁剪图片" [ref=e268] [cursor=pointer]
              - generic [ref=e269]:
                - generic [ref=e270]:
                  - checkbox "水平翻转" [ref=e271]
                  - text: 水平翻转
                - generic [ref=e272]:
                  - checkbox "垂直翻转" [ref=e273]
                  - text: 垂直翻转
                - generic [ref=e274]:
                  - checkbox "锁定位置与尺寸" [ref=e275]
                  - text: 锁定位置与尺寸
              - paragraph [ref=e276]: 锁定后仍可选中图片并在这里解锁。
              - generic [ref=e277]:
                - generic [ref=e278]:
                  - text: 旋转角度
                  - status "旋转角度" [ref=e279]: 0°
                - slider "旋转角度" [ref=e280] [cursor=pointer]: "0"
              - generic [ref=e281]:
                - button "↶ 左转 90°" [ref=e282] [cursor=pointer]
                - button "↷ 右转 90°" [ref=e283] [cursor=pointer]
          - button "重置效果" [ref=e285] [cursor=pointer]
    - contentinfo [ref=e286]:
      - generic [ref=e287]: 编辑器已就绪
      - generic [ref=e289]: 6mm 源码构建 · GPLv2+ · 28 个插件已注册
      - generic [ref=e290]: 本地文档
  - dialog "图片设置" [ref=e291]:
    - banner [ref=e292]:
      - generic [ref=e293]:
        - heading "图片设置" [level=2] [ref=e294]
        - paragraph [ref=e295]: 预览调整效果，应用后保存到图片
      - button "关闭图片设置" [ref=e296] [cursor=pointer]: ×
    - generic [ref=e297]:
      - generic [ref=e298]:
        - img "图片效果预览" [ref=e299]
        - generic [ref=e300]: 效果预览
      - generic [ref=e301]:
        - tablist "图片设置分类" [ref=e302]:
          - tab "图片" [ref=e303] [cursor=pointer]
          - tab "外观" [ref=e304] [cursor=pointer]
          - tab "阴影" [ref=e305] [cursor=pointer]
          - tab "蒙版" [ref=e306] [cursor=pointer]
          - tab "滤镜" [ref=e307] [cursor=pointer]
          - tab "描边" [selected] [ref=e308] [cursor=pointer]
          - tab "排版" [ref=e309] [cursor=pointer]
        - tabpanel "描边" [ref=e310]:
          - generic [ref=e311]:
            - checkbox "启用描边" [checked] [active] [ref=e312]
            - text: 启用描边
          - generic [ref=e313]:
            - generic [ref=e314]: 描边颜色
            - generic [ref=e315]:
              - button "选择描边颜色" [ref=e316] [cursor=pointer]
              - textbox "描边颜色" [ref=e317]: "#ffffff"
          - generic [ref=e318]:
            - generic [ref=e319]:
              - text: 描边粗细
              - status "描边粗细" [ref=e320]: 4px
            - slider "描边粗细" [ref=e321] [cursor=pointer]: "4"
          - generic [ref=e322]:
            - text: 描边位置
            - combobox "描边位置" [ref=e323]:
              - option "内描边"
              - option "居中描边"
              - option "外描边" [selected]
          - generic [ref=e324]:
            - text: 描边预设
            - combobox "描边预设" [ref=e325]:
              - option "基础实线" [selected]
              - option "装饰 · 虚线"
              - option "装饰 · 点线"
          - paragraph [ref=e326]: 描边沿裁剪、圆角和蒙版处理后的最终轮廓生成，外描边可延伸至图片外。渐隐、柔边以 50% 透明度轮廓为边界。
    - contentinfo [ref=e327]:
      - button "重置效果" [ref=e328] [cursor=pointer]
      - generic [ref=e329]:
        - button "取消" [ref=e330] [cursor=pointer]
        - button "应用设置" [ref=e331] [cursor=pointer]
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | 
  3   | test('透明主体、孔洞、蒙版与裁剪使用最终轮廓，支持三种描边位置', async ({ page }) => {
  4   |   await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  5   |   const results = await page.evaluate(async () => {
  6   |     // @ts-expect-error Vite serves this browser-only module.
  7   |     const { createImageStroke } = await import('/src/image-stroke.ts');
  8   |     const c = document.createElement('canvas'); c.width = c.height = 100;
  9   |     const ctx = c.getContext('2d')!; ctx.fillStyle = 'white'; ctx.fillRect(25, 25, 50, 50); ctx.clearRect(40, 40, 20, 20);
  10  |     const settings = { stroke: true, strokeWidth: 6, strokeColor: '#ff0000', strokeStyle: 'solid', strokePosition: 'inside', mask: 'none', radius: 0 };
  11  |     async function render(source: string, options: object, crop?: object) {
  12  |       const result = await createImageStroke(source, 100, 100, { ...settings, ...options }, crop);
  13  |       const image = new Image(); image.src = result.url; await image.decode();
  14  |       const output = document.createElement('canvas'); output.width = image.naturalWidth; output.height = image.naturalHeight;
  15  |       const cc = output.getContext('2d')!; cc.drawImage(image, 0, 0);
  16  |       const pixel = (x: number, y: number) => cc.getImageData(Math.round((x + result.pad) * image.naturalWidth / result.width), Math.round((y + result.pad) * image.naturalHeight / result.height), 1, 1).data[3]!;
  17  |       return { result, pixel };
  18  |     }
  19  |     const checks: Record<string, unknown> = {};
  20  |     for (const position of ['inside', 'center', 'outside']) {
  21  |       const { result, pixel } = await render(c.toDataURL(), { strokePosition: position });
  22  |       checks[position] = { method: result.method, outer: pixel(22, 30), inner: pixel(28, 30), hole: pixel(43, 50), corner: pixel(1, 1), body: pixel(35, 35) };
  23  |     }
  24  |     ctx.fillRect(0, 0, 100, 100);
  25  |     const triangle = await render(c.toDataURL(), { mask: 'triangle', strokePosition: 'outside' });
  26  |     checks.triangle = { method: triangle.result.method, outside: triangle.pixel(50, -2), corner: triangle.pixel(0, 0) };
  27  |     const round = await render(c.toDataURL(), { radius: 20, strokePosition: 'outside' });
  28  |     checks.round = { corner: round.pixel(0, 0), top: round.pixel(50, -2) };
  29  |     const cropped = await render(c.toDataURL(), { strokePosition: 'outside' }, { x: .5, y: 0, width: .5, height: 1 });
  30  |     checks.crop = { edge: cropped.pixel(-2, 50), center: cropped.pixel(50, 50) };
  31  |     for (const preset of ['dashed', 'dotted']) {
  32  |       const { result } = await render(c.toDataURL(), { strokeStyle: preset, mask: 'ellipse', strokePosition: 'center' });
  33  |       checks[preset] = result.method;
  34  |     }
  35  |     return checks;
  36  |   });
  37  |   expect(results.inside).toEqual({ method: 'pixels', outer: 0, inner: 255, hole: 0, corner: 0, body: 0 });
  38  |   expect(results.outside).toEqual({ method: 'pixels', outer: 255, inner: 0, hole: 255, corner: 0, body: 0 });
  39  |   expect((results.center as { corner: number }).corner).toBe(0);
  40  |   expect(results.triangle).toEqual({ method: 'path', outside: 255, corner: 0 });
  41  |   expect(results.round).toEqual({ corner: 0, top: 255 });
  42  |   expect(results.crop).toEqual({ edge: 255, center: 0 });
  43  |   expect(results.dashed).toBe('path'); expect(results.dotted).toBe('path');
  44  | });
  45  | 
  46  | test('独立描边层应用、跟随位置和尺寸、撤销重做、保存重载，关闭描边移除图层', async ({ page }) => {
  47  |   await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  48  |   await page.evaluate(() => {
  49  |     const c = document.createElement('canvas'); c.width = c.height = 100; const cc = c.getContext('2d')!;
  50  |     cc.fillStyle = 'green'; cc.beginPath(); cc.arc(50, 50, 25, 0, Math.PI * 2); cc.fill();
  51  |     const e = window.tinymce.activeEditor;
  52  |     e.setContent(`<p><img id="subject" src="${c.toDataURL()}" width="100" height="100" style="position:absolute;left:150px;top:100px;width:100px;height:100px"></p>`);
  53  |     e.undoManager.clear(); e.undoManager.add(); e.focus(); e.selection.select(e.getBody().querySelector('img')!); e.nodeChanged();
  54  |   });
  55  |   const image = page.frameLocator('.tox-edit-area iframe').locator('#subject');
  56  |   const layer = page.frameLocator('.tox-edit-area iframe').locator('[data-image-stroke-for]');
  57  |   const open = async () => { await image.click(); await page.locator('.tox-pop:visible [data-mce-name="imagesettings"]').click(); return page.getByRole('dialog', { name: '图片设置', exact: true }); };
  58  |   let d = await open(); await d.getByRole('tab', { name: '描边', exact: true }).click();
  59  |   await d.getByLabel('启用描边', { exact: true }).check(); await d.getByLabel('描边位置').selectOption('outside');
> 60  |   await d.getByLabel('描边颜色').fill('#ff0000');
      |                              ^ Error: locator.fill: Error: strict mode violation: getByRole('dialog', { name: '图片设置', exact: true }).getByLabel('描边颜色') resolved to 3 elements:
  61  |   await expect.poll(async () => d.locator('.image-settings-stroke-preview').evaluate(el => !!(el as HTMLElement).style.backgroundImage)).toBe(true);
  62  |   const previewCenter = await d.locator('.image-settings-preview').evaluate(stage => {
  63  |     const picture = stage.querySelector('img')!.getBoundingClientRect(), stroke = stage.querySelector('.image-settings-stroke-preview')!.getBoundingClientRect();
  64  |     return Math.max(Math.abs(picture.x + picture.width / 2 - stroke.x - stroke.width / 2), Math.abs(picture.y + picture.height / 2 - stroke.y - stroke.height / 2));
  65  |   });
  66  |   expect(previewCenter).toBeLessThan(1);
  67  |   await d.getByRole('button', { name: '应用设置', exact: true }).click();
  68  |   await expect(layer).toHaveCount(1); await expect(layer).toHaveAttribute('data-stroke-method', 'pixels');
  69  |   await expect(image).toHaveCSS('outline-style', 'none'); await expect(image).toHaveCSS('width', '100px');
  70  |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo()); await expect(layer).toHaveCount(0);
  71  |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo()); await expect(layer).toHaveCount(1);
  72  |   await page.evaluate(() => {
  73  |     const e = window.tinymce.activeEditor, image = e.getBody().querySelector<HTMLElement>('#subject')!;
  74  |     e.dom.setStyles(image, { left: '210px', top: '130px', width: '160px', height: '120px', rotate: '30deg', scale: '-1 1', zIndex: '8' }); e.dispatch('ResizeContent');
  75  |   });
  76  |   await expect(layer).toHaveCSS('rotate', '30deg'); await expect(layer).toHaveCSS('scale', '-1 1'); await expect(layer).toHaveCSS('z-index', '8');
  77  |   await expect.poll(async () => layer.evaluate(el => parseFloat((el as HTMLElement).style.left) + Number(el.getAttribute('data-stroke-pad')))).toBe(210);
  78  |   await expect.poll(async () => layer.evaluate(el => parseFloat((el as HTMLElement).style.width) - 2 * Number(el.getAttribute('data-stroke-pad')))).toBe(160);
  79  |   const html = await page.evaluate(() => window.tinymce.activeEditor.getContent()); expect(html).toContain('data-image-stroke-for'); expect(html).toContain('data:image/png');
  80  |   await page.getByRole('button', { name: '保存文档', exact: true }).click(); await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  81  |   await expect(layer).toHaveCount(1); await expect(image).toHaveCSS('rotate', '30deg');
  82  |   await page.evaluate(() => { const e = window.tinymce.activeEditor; e.dom.setStyle(e.getBody().querySelector('#subject')!, 'left', '260px'); e.dispatch('ResizeContent'); });
  83  |   await expect.poll(async () => layer.evaluate(el => parseFloat((el as HTMLElement).style.left) + Number(el.getAttribute('data-stroke-pad')))).toBe(260);
  84  |   expect(await page.evaluate(() => {
  85  |     const e = window.tinymce.activeEditor, parsed = new DOMParser().parseFromString(e.getContent(), 'text/html');
  86  |     const saved = parsed.querySelector<HTMLElement>('[data-image-stroke-for]')!;
  87  |     return parseFloat(saved.style.left) + Number(saved.getAttribute('data-stroke-pad'));
  88  |   })).toBe(260);
  89  |   d = await open(); await d.getByRole('tab', { name: '描边', exact: true }).click(); await expect(d.getByLabel('描边位置')).toHaveValue('outside');
  90  |   await d.getByLabel('启用描边', { exact: true }).uncheck(); await d.getByRole('button', { name: '应用设置', exact: true }).click(); await expect(layer).toHaveCount(0);
  91  | });
  92  | 
  93  | test('透明描边复制后独立关联，裁剪后重建轮廓；跨域失败保留原图', async ({ page }) => {
  94  |   await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  95  |   await page.evaluate(() => {
  96  |     const c = document.createElement('canvas'); c.width = c.height = 100; const ctx = c.getContext('2d')!;
  97  |     ctx.fillStyle = 'blue'; ctx.fillRect(20, 20, 60, 60);
  98  |     const settings = { stroke: true, strokeWidth: 6, strokeColor: '#ff0000', strokeStyle: 'solid', strokePosition: 'outside', mask: 'none', radius: 0 };
  99  |     const e = window.tinymce.activeEditor; e.setContent(`<p><img id="first" src="${c.toDataURL()}" width="100" height="100" style="position:absolute;left:100px;top:100px" data-image-settings='${JSON.stringify(settings)}'></p>`);
  100 |   });
  101 |   const frame = page.frameLocator('.tox-edit-area iframe'), layers = frame.locator('[data-image-stroke-for]');
  102 |   await expect(layers).toHaveCount(1);
  103 |   await page.evaluate(() => {
  104 |     const e = window.tinymce.activeEditor, first = e.getBody().querySelector<HTMLImageElement>('#first')!, second = first.cloneNode(true) as HTMLImageElement;
  105 |     second.id = 'second'; second.style.left = '300px'; first.after(second); second.after(e.getBody().querySelector('[data-image-stroke-for]')!.cloneNode(true));
  106 |     e.dispatch('ResizeContent');
  107 |   });
  108 |   await expect(layers).toHaveCount(2);
  109 |   await expect.poll(async () => frame.locator('img').evaluateAll(images => new Set(images.map(i => i.getAttribute('data-image-stroke-id'))).size)).toBe(2);
  110 |   await expect(layers).toHaveCount(2);
  111 |   const before = await layers.evaluateAll(elements => elements.map(el => (el as HTMLElement).style.backgroundImage));
  112 |   await page.evaluate(() => {
  113 |     const e = window.tinymce.activeEditor, first = e.getBody().querySelector<HTMLImageElement>('#first')!;
  114 |     e.dom.setAttrib(first, 'data-image-crop', JSON.stringify({ x: .5, y: 0, width: .5, height: 1 }));
  115 |     e.dom.setStyles(first, { objectViewBox: 'inset(0% 0% 0% 50%)', width: '50px', height: '100px' }); e.dispatch('ResizeContent');
  116 |   });
  117 |   await expect.poll(async () => layers.first().evaluate(el => (el as HTMLElement).style.backgroundImage)).not.toBe(before[0]);
  118 |   await expect(layers.nth(1)).toHaveCSS('left', /29/);
  119 |   await page.route('https://stroke-no-cors.invalid/**', route => route.abort());
  120 |   await frame.locator('#second').click(); await page.locator('.tox-pop:visible [data-mce-name="imagesettings"]').click();
  121 |   const dialog = page.getByRole('dialog', { name: '图片设置', exact: true });
  122 |   const original = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  123 |   await dialog.getByLabel('图片地址').fill('https://stroke-no-cors.invalid/missing.png');
  124 |   await dialog.getByRole('button', { name: '应用设置', exact: true }).click();
  125 |   await expect(dialog.getByRole('alert')).toBeVisible(); await expect(dialog).toBeVisible();
  126 |   await dialog.getByRole('button', { name: '取消', exact: true }).click();
  127 |   expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(original);
  128 | });
  129 | 
```