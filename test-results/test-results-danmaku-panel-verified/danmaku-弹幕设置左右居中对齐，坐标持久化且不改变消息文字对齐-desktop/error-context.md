# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: danmaku.spec.ts >> 弹幕设置左右居中对齐，坐标持久化且不改变消息文字对齐
- Location: tests/danmaku.spec.ts:366:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: '连接直播间' })

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
              - generic [active] [ref=f4e1]:
                - paragraph [ref=f4e2]:
                  - strong [ref=f4e3]: 工作手记 / 001
                - heading "把想法，写成作品。" [level=1] [ref=f4e4]
                - paragraph [ref=f4e5]: 一份关于专注、表达与创造的工作记录。
                - figure "留一点空间，给下一个好想法。" [ref=f4e6]:
                  - img "桌面上的笔记本、书籍和写作工具" [ref=f4e7]
                - heading "01 / 从一个清晰的想法开始" [level=2] [ref=f4e9]
                - paragraph [ref=f4e10]: 好的表达不必复杂。把重要的事情放在前面，让每一个段落都有自己的方向，也让每一张图片、每一处留白有存在的理由。
                - blockquote [ref=f4e11]:
                  - paragraph [ref=f4e12]: 写作不是把所有东西放进来，而是找到真正值得留下的部分。
                - heading "02 / 本周工作安排" [level=2] [ref=f4e13]
                - table [ref=f4e14]:
                  - rowgroup [ref=f4e15]:
                    - row [ref=f4e16]:
                      - columnheader "事项" [ref=f4e17]
                      - columnheader "负责人" [ref=f4e18]
                      - columnheader "状态" [ref=f4e19]
                  - rowgroup [ref=f4e20]:
                    - row [ref=f4e21]:
                      - cell "整理创意与参考资料" [ref=f4e22]
                      - cell "林晓" [ref=f4e23]
                      - cell "已完成" [ref=f4e24]
                    - row [ref=f4e25]:
                      - cell "完成第一版内容" [ref=f4e26]
                      - cell "陈予" [ref=f4e27]
                      - cell "进行中" [ref=f4e28]
                    - row [ref=f4e29]:
                      - cell "校对与发布" [ref=f4e30]
                      - cell "周宁" [ref=f4e31]
                      - cell "待开始" [ref=f4e32]
                - heading "03 / 下一步" [level=2] [ref=f4e33]
                - list [ref=f4e34]:
                  - listitem [ref=f4e35]: 梳理文章结构与核心观点
                  - listitem [ref=f4e36]: 补充图片、引用和数据
                  - listitem [ref=f4e37]: 与团队一起完成最后一轮审阅
                - paragraph [ref=f4e38]: 让每一次记录，都成为下一次出发的起点。
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
      - generic [ref=e265]: 最近保存 01:28
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
  1   | import { expect, test, type Page } from '@playwright/test';
  2   | import { createMessageStore } from '../src/live/store';
  3   | import { normalizeMessage } from '../src/bilibili';
  4   | import { mockPlatform } from './helpers/platform';
  5   | 
  6   | const sample = (id: string, source = 'bilibili:100') => ({ id, source, type: 'chat' as const, name: '观众', text: `内容${id}`, time: '18:00' });
  7   | const regions = `
  8   | <h2>三个弹幕区</h2>
  9   | <div data-danmaku-id="a" data-danmaku-source="current" data-danmaku-skin="simple"><p>原始回退A</p></div>
  10  | <div data-danmaku-id="b" data-danmaku-source="current" data-danmaku-skin="card" data-danmaku-types="superchat"><p>原始回退B</p></div>
  11  | <div data-danmaku-id="c" data-danmaku-source="bilibili:100" data-danmaku-skin="blivechat"><p>原始回退C</p></div>`;
  12  | 
  13  | async function openSource(page: Page, html: string) {
  14  |   await page.locator('[data-mce-name="code"]').click();
  15  |   await page.getByRole('dialog').getByRole('textbox').fill(html);
  16  |   await page.getByRole('dialog').getByRole('button', { name: '保存', exact: true }).click();
  17  | }
  18  | 
  19  | async function publish(page: Page, id: string) {
  20  |   await page.evaluate(async (id) => {
  21  |     const { liveMessages } = await import('/src/live/store.ts');
  22  |     liveMessages.publish([{ id, type: 'chat', name: '新观众', text: `新消息${id}`, time: '18:08' }]);
  23  |   }, id);
  24  | }
  25  | 
  26  | async function start(page: Page) {
  27  |   const commands = await mockPlatform(page);
  28  |   await page.goto('/');
  29  |   await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  30  |   await expect(page.getByRole('button', { name: '直播弹幕', exact: true })).not.toHaveClass('selected');
  31  |   await expect(page.getByRole('complementary', { name: '直播弹幕面板' })).toBeHidden();
  32  |   await page.getByRole('button', { name: '直播弹幕', exact: true }).click();
  33  |   await expect(page.getByRole('button', { name: '直播弹幕', exact: true })).toHaveClass('selected');
> 34  |   await page.getByRole('button', { name: '连接直播间' }).click();
      |                                                     ^ Error: locator.click: Test timeout of 30000ms exceeded.
  35  |   await expect(page.locator('.live-state strong')).toHaveText('已连接');
  36  |   await expect(page.locator('.live-message')).toHaveCount(2);
  37  |   return commands;
  38  | }
  39  | 
  40  | test('仓库回放、去重、容量、指定来源、独立取消订阅', () => {
  41  |   const store = createMessageStore(2);
  42  |   store.setSource('bilibili:100');
  43  |   store.publish([sample('1'), sample('2')]);
  44  |   const a: string[][] = []; const b: string[][] = [];
  45  |   const stopA = store.subscribe('current', (items) => a.push(items.map((item) => item.id)));
  46  |   store.subscribe('bilibili:100', (items) => b.push(items.map((item) => item.id)));
  47  |   expect(a).toEqual([['1', '2']]);
  48  |   store.publish([sample('2'), sample('3')]);
  49  |   expect(a.at(-1)).toEqual(['2', '3']);
  50  |   stopA(); store.publish([sample('4')]);
  51  |   expect(a.at(-1)).toEqual(['2', '3']); expect(b.at(-1)).toEqual(['3', '4']);
  52  |   store.setSource('bilibili:200');
  53  |   expect(store.snapshot()).toEqual([]);
  54  |   expect(store.snapshot('bilibili:100')).toHaveLength(2);
  55  |   store.clear(); expect(b.at(-1)).toEqual([]);
  56  | });
  57  | 
  58  | test('结构化信息不丢失、不修改原包、不凭空推断身份', () => {
  59  |   const data = { msg_id: 'g', user_info: { uname: '舰长' }, guard_level: 3 };
  60  |   const guard = normalizeMessage({ cmd: 'LIVE_OPEN_PLATFORM_GUARD', data });
  61  |   expect(guard).toMatchObject({ name: '舰长', type: 'guard', guardLevel: 3, role: 'member' });
  62  |   expect(data).not.toHaveProperty('uname');
  63  |   expect(normalizeMessage({ cmd: 'LIVE_OPEN_PLATFORM_DM', data: { uname: '主播昵称', msg: 'hello' } })?.role).toBe('');
  64  |   expect(normalizeMessage({ cmd: 'LIVE_OPEN_PLATFORM_SUPER_CHAT', data: { message: '支持', rmb: 30, uface: 'javascript:alert(1)' } })).toMatchObject({ price: 30, avatar: '' });
  65  | });
  66  | 
  67  | test('源码保存即绑定三个独立区域，共用连接、回放历史且不写入文档', async ({ page }) => {
  68  |   const commands = await start(page);
  69  |   await openSource(page, regions);
  70  |   const body = page.frameLocator('.tox-edit-area iframe').locator('body');
  71  |   const a = body.locator('[data-danmaku-id="a"]');
  72  |   const b = body.locator('[data-danmaku-id="b"]');
  73  |   const c = body.locator('[data-danmaku-id="c"]');
  74  |   await expect(a.locator('[data-message-id]')).toHaveCount(2);
  75  |   await expect(b.locator('[data-message-id]')).toHaveCount(1);
  76  |   await expect(c.locator('yt-live-chat-text-message-renderer > #content > #message')).toHaveText('第一条真实协议弹幕');
  77  |   await expect(c.locator('yt-live-chat-paid-message-renderer > #card > #content > #message')).toHaveText('<img src=x onerror=alert(1)>');
  78  |   await expect(body.locator('script,img[onerror]')).toHaveCount(0);
  79  |   await page.getByRole('button', { name: '保存文档', exact: true }).click();
  80  |   const before = await page.evaluate(() => ({ html: window.tinymce.activeEditor.getContent(), undo: window.tinymce.activeEditor.undoManager.data.length }));
  81  |   await publish(page, 'new');
  82  |   await expect(a.locator('[data-message-id]')).toHaveCount(3);
  83  |   await expect(b.locator('[data-message-id]')).toHaveCount(1);
  84  |   await expect(c.locator('[data-message-id]')).toHaveCount(3);
  85  |   expect(await page.evaluate(() => ({ html: window.tinymce.activeEditor.getContent(), undo: window.tinymce.activeEditor.undoManager.data.length }))).toEqual(before);
  86  |   expect(before.html).toContain('原始回退A'); expect(before.html).not.toContain('第一条真实协议弹幕');
  87  |   await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('test44.tinymce.document.v1') || '{}').content)).toBe(before.html);
  88  |   expect(commands.filter((action) => action === 'start')).toHaveLength(1);
  89  |   await page.screenshot({ path: 'screenshots/danmaku-subscriptions.png', fullPage: true });
  90  | });
  91  | 
  92  | test('暂停、取消绑定、重复 ID、无效皮肤、撤销重做彼此隔离', async ({ page }) => {
  93  |   await start(page); await openSource(page, regions);
  94  |   const body = page.frameLocator('.tox-edit-area iframe').locator('body');
  95  |   const a = body.locator('[data-danmaku-id="a"]');
  96  |   await expect(a.locator('[data-message-id]')).toHaveCount(2);
  97  |   await page.evaluate(() => window.tinymce.activeEditor.getBody().querySelector('[data-danmaku-id="a"]')!.setAttribute('data-danmaku-paused', 'true'));
  98  |   await expect.poll(() => a.evaluate((node) => node.getAttribute('data-danmaku-paused'))).toBe('true');
  99  |   await publish(page, 'pause');
  100 |   await expect(body.locator('[data-danmaku-id="c"] [data-message-id]')).toHaveCount(3);
  101 |   await expect(a.locator('[data-message-id]')).toHaveCount(2);
  102 |   await page.evaluate(() => window.tinymce.activeEditor.getBody().querySelector('[data-danmaku-id="a"]')!.removeAttribute('data-danmaku-paused'));
  103 |   await expect(a.locator('[data-message-id]')).toHaveCount(3);
  104 |   await page.evaluate(() => window.tinymce.activeEditor.getBody().querySelector('[data-danmaku-id="a"]')!.removeAttribute('data-danmaku-source'));
  105 |   await expect.poll(() => a.evaluate((node) => node.shadowRoot?.querySelector('slot') !== null)).toBe(true);
  106 |   await openSource(page, regions + '<div data-danmaku-id="a" data-danmaku-source="current" data-danmaku-skin="bad"><p>bad</p></div>');
  107 |   await expect(body.locator('[data-danmaku-id="a"]')).toHaveCount(1);
  108 |   await expect(body.getByText('未知皮肤', { exact: false })).toBeVisible();
  109 |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  110 |   await expect(body.getByText('未知皮肤', { exact: false })).toHaveCount(0);
  111 |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  112 |   await expect(body.getByText('未知皮肤', { exact: false })).toBeVisible();
  113 |   await expect(body.locator('[data-danmaku-id="c"] [data-message-id]')).toHaveCount(3);
  114 | });
  115 | 
  116 | test('预览继续订阅，HTML 导出为无需脚本的快照，重建/刷新保留声明', async ({ page, context }) => {
  117 |   const commands = await start(page); await openSource(page, regions);
  118 |   await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  119 |   const preview = page.frameLocator('iframe[title="文档预览"]');
  120 |   await expect(preview.locator('[data-danmaku-id="a"] [data-message-id]')).toHaveCount(2);
  121 |   await publish(page, 'preview');
  122 |   await expect(preview.locator('[data-danmaku-id="a"] [data-message-id]')).toHaveCount(3);
  123 |   await page.getByRole('button', { name: '导出', exact: true }).click();
  124 |   const downloadPromise = page.waitForEvent('download');
  125 |   await page.getByRole('button', { name: 'HTML 文档', exact: true }).click();
  126 |   const download = await downloadPromise;
  127 |   const fs = await import('node:fs/promises');
  128 |   const html = await fs.readFile((await download.path())!, 'utf8');
  129 |   expect(html).toContain('shadowrootmode="open"'); expect(html).not.toContain('<script');
  130 |   const exported = await context.newPage();
  131 |   await exported.route('http://snapshot.test/', (route) => route.fulfill({ contentType: 'text/html', body: html }));
  132 |   await exported.goto('http://snapshot.test/');
  133 |   await expect(exported.locator('[data-danmaku-id="a"] [data-message-id]')).toHaveCount(3);
  134 |   await expect(exported.locator('[data-danmaku-id="b"] [data-message-id]')).toHaveCount(1);
```