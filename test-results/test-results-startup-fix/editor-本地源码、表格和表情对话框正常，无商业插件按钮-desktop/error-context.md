# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: editor.spec.ts >> 本地源码、表格和表情对话框正常，无商业插件按钮
- Location: tests/editor.spec.ts:65:1

# Error details

```
Error: locator.click: Error: strict mode violation: locator('[data-mce-name="code"]') resolved to 2 elements:
    1) <button type="button" tabindex="-1" aria-label="源代码" class="tox-tbtn" data-mce-name="code" aria-disabled="false">…</button> aka getByRole('region', { name: '文档编辑区' }).getByRole('button', { name: '源代码' })
    2) <button type="button" tabindex="-1" aria-label="源代码" class="tox-tbtn" data-mce-name="code" aria-disabled="false">…</button> aka getByRole('button', { name: '源代码' }).nth(1)

Call log:
  - waiting for locator('[data-mce-name="code"]')

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
        - generic [ref=e16]: 尚未保存
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
                    - button "字体思源黑体 常规" [ref=e117]:
                      - generic [ref=e118]: 思源黑体 常规
                    - generic [ref=e122]:
                      - button "Decrease font size" [ref=e123]
                      - textbox [ref=e127]: 11pt
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
            - iframe [active] [ref=e211]:
              - generic [active] [ref=f1e1]:
                - paragraph [ref=f1e2]:
                  - strong [ref=f1e3]: 工作手记 / 001
                - heading "把想法，写成作品。" [level=1] [ref=f1e4]
                - paragraph [ref=f1e5]: 一份关于专注、表达与创造的工作记录。
                - figure "留一点空间，给下一个好想法。" [ref=f1e6]:
                  - img "桌面上的笔记本、书籍和写作工具" [ref=f1e7]
                - heading "01 / 从一个清晰的想法开始" [level=2] [ref=f1e9]
                - paragraph [ref=f1e10]: 好的表达不必复杂。把重要的事情放在前面，让每一个段落都有自己的方向，也让每一张图片、每一处留白有存在的理由。
                - blockquote [ref=f1e11]:
                  - paragraph [ref=f1e12]: 写作不是把所有东西放进来，而是找到真正值得留下的部分。
                - heading "02 / 本周工作安排" [level=2] [ref=f1e13]
                - table [ref=f1e14]:
                  - rowgroup [ref=f1e15]:
                    - row [ref=f1e16]:
                      - columnheader "事项" [ref=f1e17]
                      - columnheader "负责人" [ref=f1e18]
                      - columnheader "状态" [ref=f1e19]
                  - rowgroup [ref=f1e20]:
                    - row [ref=f1e21]:
                      - cell "整理创意与参考资料" [ref=f1e22]
                      - cell "林晓" [ref=f1e23]
                      - cell "已完成" [ref=f1e24]
                    - row [ref=f1e25]:
                      - cell "完成第一版内容" [ref=f1e26]
                      - cell "陈予" [ref=f1e27]
                      - cell "进行中" [ref=f1e28]
                    - row [ref=f1e29]:
                      - cell "校对与发布" [ref=f1e30]
                      - cell "周宁" [ref=f1e31]
                      - cell "待开始" [ref=f1e32]
                - heading "03 / 下一步" [level=2] [ref=f1e33]
                - list [ref=f1e34]:
                  - listitem [ref=f1e35]: 梳理文章结构与核心观点
                  - listitem [ref=f1e36]: 补充图片、引用和数据
                  - listitem [ref=f1e37]: 与团队一起完成最后一轮审阅
                - paragraph [ref=f1e38]: 让每一次记录，都成为下一次出发的起点。
          - generic [ref=e212]:
            - generic [ref=e213]:
              - group "Element Path" [ref=e214]:
                - button "p" [ref=e215]
                - generic [aria-hidden] [ref=e216]: ›
                - button "strong" [ref=e217]
              - generic [ref=e218]: 按 Alt+0 获得帮助
              - generic [ref=e219]:
                - button "229 字" [ref=e220]
                - link "使用 TinyMCE 构建" [ref=e222]:
                  - /url: https://www.tiny.cloud/powered-by-tiny?utm_campaign=poweredby&utm_source=tiny&utm_medium=referral&utm_content=v7
                  - text: 使用 构建
            - separator "按上下箭头键以调整编辑器大小。" [ref=e229]
      - complementary "画布配置面板" [ref=e233]:
        - generic [ref=e234]:
          - generic [ref=e235]:
            - heading "画布配置" [level=2] [ref=e236]
            - paragraph [ref=e237]: 调整即时生效，可撤销
          - button "收起画布配置" [ref=e238] [cursor=pointer]
        - generic [ref=e242]:
          - tablist "画布配置分类" [ref=e243]:
            - tab "背景" [selected] [ref=e244] [cursor=pointer]
            - tab "插入" [ref=e245] [cursor=pointer]
          - tabpanel "背景" [ref=e246]:
            - generic [ref=e247]:
              - text: 背景颜色
              - generic [ref=e248]:
                - button "背景颜色色板" [ref=e249] [cursor=pointer]
                - textbox "背景颜色" [ref=e250]: "#ffffff"
            - generic [ref=e251]:
              - text: 背景透明度
              - generic [ref=e252]:
                - spinbutton "背景透明度数值" [ref=e253]: "0"
                - text: "%"
            - slider "背景透明度" [ref=e254]: "0"
            - generic [ref=e255]:
              - generic [ref=e256]: 不透明
              - generic [ref=e257]: 完全透明
            - paragraph [ref=e258]: 只调整画布背景颜色的透明度，文字和图片保持原有效果。
        - button "清除背景颜色" [disabled] [ref=e260]
    - contentinfo [ref=e261]:
      - generic [ref=e262]: 编辑器已就绪
      - generic [ref=e264]: 6mm 源码构建 · GPLv2+ · 28 个插件已注册
      - generic [ref=e265]: 本地文档
  - toolbar [ref=e268]:
    - group [ref=e269]:
      - button "画布设置" [ref=e270]
      - button "切换位置：居右 / 居下" [ref=e271]
      - button "源代码" [ref=e272]
      - button "预览" [ref=e273]
      - button "全屏" [ref=e274]
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | import type { Editor } from 'tinymce';
  3   | import { defaultSettings, resolvePlugins } from '../src/plugins';
  4   | import { createHash } from 'node:crypto';
  5   | import { readFile } from 'node:fs/promises';
  6   | 
  7   | declare global { interface Window { tinymce: { activeEditor: Editor } } }
  8   | 
  9   | test('插件仅使用源码仓库中可用的开源插件', () => {
  10  |   const full = resolvePlugins(defaultSettings);
  11  |   expect(full).toContain('image');
  12  |   expect(full).toContain('code');
  13  |   expect(full).not.toContain('editimage');
  14  |   expect(full).not.toContain('advcode');
  15  |   expect(full).not.toContain('uploadcare');
  16  |   expect(full).toHaveLength(28);
  17  |   expect(resolvePlugins({ autoresize: true })).toHaveLength(29);
  18  | });
  19  | 
  20  | test.beforeEach(async ({ page }) => {
  21  |   await page.route((url) => url.hostname === 'tiny.cloud' || url.hostname.endsWith('.tiny.cloud'), (route) => route.abort());
  22  |   await page.goto('/');
  23  |   await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized, { timeout: 60000 });
  24  | });
  25  | 
  26  | test('编辑、自动保存、刷新、HTML、预览、导出及本地版本', async ({ page }) => {
  27  |   const errors: string[] = [];
  28  |   page.on('pageerror', (error) => errors.push(error.message));
  29  |   await expect(page.frameLocator('.tox-edit-area iframe').locator('h1')).toHaveText('把想法，写成作品。');
  30  |   await page.evaluate(() => {
  31  |     const editor = window.tinymce.activeEditor;
  32  |     editor.setContent('<h1>浏览器回归测试</h1><p>持久化内容 123</p>');
  33  |     editor.fire('change');
  34  |   });
  35  |   await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('test44.tinymce.document.v1') || '{}').content)).toContain('持久化内容 123');
  36  |   await page.reload();
  37  |   await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  38  |   await expect(page.frameLocator('.tox-edit-area iframe').locator('body')).toContainText('持久化内容 123');
  39  |   await page.getByRole('button', { name: 'HTML', exact: true }).click();
  40  |   await page.getByRole('textbox', { name: 'HTML 源码' }).fill('<h1>源码已修改</h1><p>第二个版本</p>');
  41  |   await page.getByRole('button', { name: '应用修改' }).click();
  42  |   await expect(page.frameLocator('.tox-edit-area iframe').locator('h1')).toHaveText('源码已修改');
  43  |   await page.getByRole('button', { name: '保存文档', exact: true }).click();
  44  |   await page.getByRole('button', { name: '本地版本', exact: true }).click();
  45  |   await expect(page.locator('.revision-row')).toHaveCount(1);
  46  |   await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  47  |   await expect(page.frameLocator('iframe[title="文档预览"]').locator('h1')).toHaveText('源码已修改');
  48  |   await page.getByRole('button', { name: '导出', exact: true }).click();
  49  |   const download = page.waitForEvent('download');
  50  |   await page.getByRole('button', { name: 'HTML 文档' }).click();
  51  |   expect((await download).suggestedFilename()).toBe('创作手记.html');
  52  |   expect(errors).toEqual([]);
  53  | });
  54  | 
  55  | test('导入 HTML 并保留源码模式刷新前的修改', async ({ page }) => {
  56  |   await page.locator('input[type="file"]').setInputFiles({ name: '导入测试.html', mimeType: 'text/html', buffer: Buffer.from('<h1>导入成功</h1><p>正文内容</p>') });
  57  |   await expect(page.frameLocator('.tox-edit-area iframe').locator('h1')).toHaveText('导入成功');
  58  |   await page.getByRole('button', { name: 'HTML', exact: true }).click();
  59  |   await page.getByRole('textbox', { name: 'HTML 源码' }).fill('<h1>未点应用也可刷新恢复</h1>');
  60  |   await page.reload();
  61  |   await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  62  |   await expect(page.frameLocator('.tox-edit-area iframe').locator('h1')).toHaveText('未点应用也可刷新恢复');
  63  | });
  64  | 
  65  | test('本地源码、表格和表情对话框正常，无商业插件按钮', async ({ page }) => {
> 66  |   await page.locator('[data-mce-name="code"]').click();
      |                                                ^ Error: locator.click: Error: strict mode violation: locator('[data-mce-name="code"]') resolved to 2 elements:
  67  |   await expect(page.getByRole('dialog')).toBeVisible();
  68  |   await page.keyboard.press('Escape');
  69  |   const emojiArea = (await page.locator('.tox-edit-area iframe').boundingBox())!;
  70  |   await page.mouse.click(emojiArea.x + emojiArea.width - 20, emojiArea.y + 30);
  71  |   await page.locator('[data-mce-name="canvassettings"]').click();
  72  |   await page.getByRole('dialog', { name: '画布设置', exact: true }).getByRole('button', { name: '表情符号', exact: true }).click();
  73  |   await expect(page.getByRole('dialog').filter({ has: page.getByRole('textbox', { name: '搜索', exact: true }) })).toBeVisible();
  74  |   await page.keyboard.press('Escape');
  75  |   await page.getByRole('dialog', { name: '画布设置', exact: true }).getByRole('button', { name: '取消', exact: true }).click();
  76  |   await page.locator('[data-mce-name="table"]').click();
  77  |   await expect(page.locator('.tox-menu').first()).toBeVisible();
  78  |   await page.keyboard.press('Escape');
  79  |   await expect(page.locator('[data-mce-name="math"], [data-mce-name="exportword"], [data-mce-name="tinycomments"]')).toHaveCount(0);
  80  | });
  81  | 
  82  | test('切换自适应高度不丢失内容', async ({ page }) => {
  83  |   const errors: string[] = [];
  84  |   page.on('pageerror', (error) => errors.push(error.message));
  85  |   const loaded = await page.evaluate(() => Object.keys(window.tinymce.activeEditor.plugins));
  86  |   for (const name of ['code', 'image', 'table', 'codesample', 'emoticons']) expect(loaded).toContain(name);
  87  |   await page.evaluate(() => { window.tinymce.activeEditor.setContent('<p>切换后保留</p>'); window.tinymce.activeEditor.fire('change'); });
  88  |   await page.getByRole('button', { name: '编辑器配置' }).click();
  89  |   await page.getByLabel('自适应文档高度', { exact: true }).check();
  90  |   await page.getByRole('button', { name: '应用配置' }).click();
  91  |   await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized && Boolean(window.tinymce.activeEditor.plugins.autoresize));
  92  |   await expect(page.frameLocator('.tox-edit-area iframe').locator('body')).toContainText('切换后保留');
  93  |   expect(errors).toEqual([]);
  94  | });
  95  | 
  96  | test('编辑器及插件确实来自自有仓库构建，不请求 Tiny Cloud', async ({ page }) => {
  97  |   const external: string[] = [];
  98  |   page.on('request', (request) => { if (new URL(request.url()).hostname.endsWith('tiny.cloud')) external.push(request.url()); });
  99  |   await page.reload();
  100 |   await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  101 |   const response = await page.request.get('/vendor/tinymce/build-info.json');
  102 |   const info = await response.json();
  103 |   expect(info.repository).toBe('https://github.com/zhangjinteng/6mm-tinymce');
  104 |   expect(info.plugins).toHaveLength(29);
  105 |   const source = await readFile('6mm-tinymce/modules/tinymce/js/tinymce/tinymce.min.js');
  106 |   const runtime = await (await page.request.get('/vendor/tinymce/tinymce.min.js')).body();
  107 |   expect(runtime.equals(source)).toBe(true);
  108 |   expect(createHash('sha256').update(runtime).digest('hex')).toBe(info.sha256);
  109 |   await expect(page.locator('script[src*="/vendor/tinymce/tinymce.min.js"]')).toHaveCount(1);
  110 |   expect(await page.evaluate(() => window.tinymce.activeEditor.options.get('license_key'))).toBe('gpl');
  111 |   expect(await page.evaluate(() => Object.keys(window.tinymce.activeEditor.plugins).sort())).toEqual(resolvePlugins(defaultSettings).sort());
  112 |   const plugins = await page.evaluate(() => Object.keys(window.tinymce.activeEditor.plugins));
  113 |   for (const plugin of plugins) expect((await page.request.get(`/vendor/tinymce/plugins/${plugin}/plugin.min.js`)).ok()).toBe(true);
  114 |   expect(external).toEqual([]);
  115 | });
  116 | 
  117 | test('旧的云插件配置不会影响本地加载，也不会清空已保存的文档', async ({ page }) => {
  118 |   await page.addInitScript(() => {
  119 |     localStorage.setItem('test44.tinymce.settings.v1', JSON.stringify({ premium: true, imageMode: 'uploadcare', uploadcareKey: 'old-key', ai: 'trial', autoresize: false }));
  120 |     localStorage.setItem('test44.tinymce.document.v1', JSON.stringify({
  121 |       title: '迁移前的文档', content: '<p>保留内容 123</p>', updatedAt: new Date().toISOString(),
  122 |       revisions: [{ revisionId: 'before-local', createdAt: new Date().toISOString(), content: '<p>保留内容 123</p>', author: { id: 'local-author', name: '本地用户' } }]
  123 |     }));
  124 |   });
  125 |   await page.reload();
  126 |   await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  127 |   await expect(page.frameLocator('.tox-edit-area iframe').locator('body')).toContainText('保留内容 123');
  128 |   await expect(page.getByRole('textbox', { name: '文档名称' })).toHaveValue('迁移前的文档');
  129 |   expect(await page.evaluate(() => Boolean(window.tinymce.activeEditor.plugins.uploadcare))).toBe(false);
  130 |   await page.getByRole('button', { name: '本地版本', exact: true }).click();
  131 |   await expect(page.locator('.revision-row')).toHaveCount(1);
  132 | });
  133 | 
  134 | test('桌面与手机布局、图片和错误状态', async ({ page }) => {
  135 |   const image = page.frameLocator('.tox-edit-area iframe').locator('figure img');
  136 |   await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
  137 |   await page.screenshot({ path: 'screenshots/desktop.png', fullPage: true });
  138 |   await page.setViewportSize({ width: 390, height: 844 });
  139 |   await page.reload();
  140 |   await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  141 |   expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  142 |   expect(await page.frameLocator('.tox-edit-area iframe').locator('body').evaluate((node) => node.clientHeight)).toBeGreaterThan(250);
  143 |   await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
  144 |   await page.screenshot({ path: 'screenshots/mobile.png', fullPage: true });
  145 |   await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('Quota', 'QuotaExceededError'); }; });
  146 |   await page.getByRole('button', { name: '保存文档', exact: true }).click();
  147 |   await expect(page.locator('.error-banner')).toContainText('本地存储不可用或空间不足');
  148 |   await expect(page.locator('.save-state')).toHaveText('保存失败');
  149 | });
  150 | 
  151 | test('图片自由拖动、取消、撤销重做、保存刷新，并保留缩放手柄', async ({ page }) => {
  152 |   await page.evaluate(() => {
  153 |     const editor = window.tinymce.activeEditor;
  154 |     editor.setContent('<p>图片拖动测试</p><p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" width="180" height="120" alt="拖动图片">旁边文字</p>');
  155 |     editor.undoManager.clear(); editor.undoManager.add();
  156 |   });
  157 |   const image = page.frameLocator('.tox-edit-area iframe').locator('img[alt="拖动图片"]');
  158 |   async function expectHandlesAtImage() {
  159 |     const box = (await image.boundingBox())!;
  160 |     for (const [name, x, y] of [
  161 |       ['nw', box.x, box.y], ['ne', box.x + box.width, box.y],
  162 |       ['sw', box.x, box.y + box.height], ['se', box.x + box.width, box.y + box.height]
  163 |     ] as const) {
  164 |       const handle = page.frameLocator('.tox-edit-area iframe').locator(`#objectResizeHandle${name}`);
  165 |       await expect.poll(async () => {
  166 |         const corner = await handle.boundingBox();
```