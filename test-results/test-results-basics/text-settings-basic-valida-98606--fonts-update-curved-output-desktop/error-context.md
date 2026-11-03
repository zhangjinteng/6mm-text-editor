# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: text-settings.spec.ts >> basic validation and cancel preserve rich formatting; changed fonts update curved output
- Location: tests/text-settings.spec.ts:126:1

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for locator('.tox-edit-area iframe').contentFrame().locator('#settings-text')
    - locator resolved to <span id="settings-text" data-text-draggable="true" data-mce-style="position: absolute; left: 100px; top: 100px; width: 360px; font-size: 38px; line-height: 1.5;">…</span>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="live-bottom">…</div> from <aside aria-label="直播弹幕面板" class="side-panel live-panel">…</aside> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <svg width="28" height="28" fill="none" stroke-width="2" aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-radio" xmlns="http://www.w3.org/2000/svg">…</svg> from <aside aria-label="直播弹幕面板" class="side-panel live-panel">…</aside> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <svg width="28" height="28" fill="none" stroke-width="2" aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-radio" xmlns="http://www.w3.org/2000/svg">…</svg> from <aside aria-label="直播弹幕面板" class="side-panel live-panel">…</aside> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="live-bottom">…</div> from <aside aria-label="直播弹幕面板" class="side-panel live-panel">…</aside> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <svg width="28" height="28" fill="none" stroke-width="2" aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-radio" xmlns="http://www.w3.org/2000/svg">…</svg> from <aside aria-label="直播弹幕面板" class="side-panel live-panel">…</aside> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <svg width="28" height="28" fill="none" stroke-width="2" aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-radio" xmlns="http://www.w3.org/2000/svg">…</svg> from <aside aria-label="直播弹幕面板" class="side-panel live-panel">…</aside> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <svg width="28" height="28" fill="none" stroke-width="2" aria-hidden="true" viewBox="0 0 24 24" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-radio" xmlns="http://www.w3.org/2000/svg">…</svg> from <aside aria-label="直播弹幕面板" class="side-panel live-panel">…</aside> subtree intercepts pointer events
  - retrying click action
    - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - locator resolved to <span id="settings-text" data-text-draggable="true" data-mce-style="position: absolute; left: 100px; top: 100px; width: 360px; font-size: 38px; line-height: 1.5;">…</span>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <label class="live-search">…</label> from <aside aria-label="直播弹幕面板" class="side-panel live-panel">…</aside> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="live-content">…</div> from <aside aria-label="直播弹幕面板" class="side-panel live-panel">…</aside> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    33 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="live-content">…</div> from <aside aria-label="直播弹幕面板" class="side-panel live-panel">…</aside> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <label class="live-search">…</label> from <aside aria-label="直播弹幕面板" class="side-panel live-panel">…</aside> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="live-content">…</div> from <aside aria-label="直播弹幕面板" class="side-panel live-panel">…</aside> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
       - waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="live-content">…</div> from <aside aria-label="直播弹幕面板" class="side-panel live-panel">…</aside> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <div class="live-content">…</div> from <aside aria-label="直播弹幕面板" class="side-panel live-panel">…</aside> subtree intercepts pointer events
  - retrying click action
    - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <label class="live-search">…</label> from <aside aria-label="直播弹幕面板" class="side-panel live-panel">…</aside> subtree intercepts pointer events
  - retrying click action
    - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - locator resolved to <span id="settings-text" data-text-draggable="true" data-mce-style="position: absolute; left: 100px; top: 100px; width: 360px; font-size: 38px; line-height: 1.5;">…</span>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <label class="live-search">…</label> from <aside aria-label="直播弹幕面板" class="side-panel live-panel">…</aside> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="live-content">…</div> from <aside aria-label="直播弹幕面板" class="side-panel live-panel">…</aside> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <div class="live-content">…</div> from <aside aria-label="直播弹幕面板" class="side-panel live-panel">…</aside> subtree intercepts pointer events
  - retrying click action
    - waiting 500ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <label class="live-search">…</label> from <aside aria-label="直播弹幕面板" class="side-panel live-panel">…</aside> subtree intercepts pointer events
  2 × retrying click action
      - waiting 500ms
      - waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="live-content">…</div> from <aside aria-label="直播弹幕面板" class="side-panel live-panel">…</aside> subtree intercepts pointer events
  - retrying click action
    - waiting 500ms
    - waiting for element to be visible, enabled and stable

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - link "TinyMCE Studio" [ref=e5] [cursor=pointer]:
      - /url: /
    - generic [ref=e12]:
      - textbox "文档名称" [ref=e13]: 创作手记
      - generic [ref=e14]: 已保存到本地
    - generic [ref=e17]:
      - button "新建文档" [ref=e18] [cursor=pointer]
      - button "导入文件" [ref=e20] [cursor=pointer]
      - button "保存文档" [ref=e23] [cursor=pointer]
      - button "导出" [ref=e29] [cursor=pointer]
      - button "编辑器配置" [ref=e36] [cursor=pointer]
  - navigation "文档视图" [ref=e40]:
    - generic [ref=e41]:
      - button "编辑" [ref=e42] [cursor=pointer]
      - button "HTML" [ref=e45] [cursor=pointer]
      - button "预览" [ref=e50] [cursor=pointer]
    - generic [ref=e54]:
      - button "直播弹幕" [ref=e55] [cursor=pointer]
      - button "本地版本" [ref=e62] [cursor=pointer]:
        - generic [ref=e67]: "0"
      - button "28" [ref=e68] [cursor=pointer]
  - main [ref=e72]:
    - region "文档编辑区" [ref=e73]:
      - application [ref=e75]:
        - generic [ref=e76]:
          - generic [ref=e77]:
            - menubar [ref=e79]:
              - menuitem "文件" [ref=e80]
              - menuitem "编辑" [ref=e82]
              - menuitem "查看" [ref=e84]
              - menuitem "插入" [ref=e86]
              - menuitem "格式" [ref=e88]
              - menuitem "工具" [ref=e90]
              - menuitem "表格" [ref=e92]
              - menuitem "帮助" [ref=e94]
            - group [ref=e96]:
              - toolbar [ref=e97]:
                - group [ref=e98]:
                  - button "恢复" [disabled] [ref=e99]
                  - button "重做" [disabled] [ref=e100]
                - group [ref=e101]:
                  - button "保存" [disabled] [ref=e102]
                  - button "恢复上次的草稿" [disabled] [ref=e103]
                - group [ref=e104]:
                  - button "显示或隐藏其他工具栏项" [ref=e105]
          - iframe [ref=e108]:
            - generic [ref=f8e1]:
              - paragraph:
                - generic [ref=f8e2]:
                  - strong [ref=f8e3]: 预览我的文字
                  - text: LIVE PREVIEW
        - generic [ref=e109]:
          - generic [ref=e110]:
            - group "Element Path" [ref=e111]:
              - button "p" [ref=e112]
              - generic [aria-hidden] [ref=e113]: ›
              - button "span" [ref=e114]
              - generic [aria-hidden] [ref=e115]: ›
              - button "strong" [ref=e116]
            - generic [ref=e117]:
              - button "8 字" [ref=e118]
              - link "使用 TinyMCE 构建" [ref=e120]:
                - /url: https://www.tiny.cloud/powered-by-tiny?utm_campaign=poweredby&utm_source=tiny&utm_medium=referral&utm_content=v7
                - text: 使用 构建
          - separator "按上下箭头键以调整编辑器大小。" [ref=e127]
    - complementary "直播弹幕面板" [ref=e131]:
      - generic [ref=e132]:
        - heading "直播弹幕" [level=2] [ref=e133]
        - button "收起直播弹幕" [ref=e134] [cursor=pointer]
      - generic [ref=e138]:
        - generic [ref=e139]:
          - strong [ref=e147]: 未连接
          - generic [ref=e148]: APP 1717059966646
          - button "连接直播间" [ref=e149] [cursor=pointer]
          - alert [ref=e152]:
            - generic [ref=e155]: B 站返回 7003：心跳过期或GameId错误
        - group [ref=e156]:
          - generic "自动订阅：给容器添加属性" [ref=e157]
        - generic [ref=e158]:
          - textbox "搜索弹幕" [ref=e163]:
            - /placeholder: 搜索弹幕或用户
          - combobox "弹幕类型" [ref=e164]:
            - option "全部" [selected]
            - option "弹幕"
            - option "醒目留言"
            - option "礼物"
            - option "大航海"
        - generic [ref=e165]:
          - generic [ref=e166]: 0 条消息 · 已选 0
          - button "清空弹幕" [disabled] [ref=e167]
        - generic [ref=e171]: 暂无弹幕消息
        - generic [ref=e180]:
          - generic [ref=e181]:
            - checkbox "包含用户名" [checked] [ref=e182]
            - text: 包含用户名
          - button "插入选中" [disabled] [ref=e183]
  - contentinfo [ref=e186]:
    - generic [ref=e187]: 编辑器已就绪
    - generic [ref=e189]: 最近保存 00:09
```

# Test source

```ts
  1   | import { expect, test, type Page } from '@playwright/test';
  2   | import type { Editor } from 'tinymce';
  3   | declare global { interface Window { tinymce: { activeEditor: Editor } } }
  4   | const box = (page: Page) => page.frameLocator('.tox-edit-area iframe').locator('#settings-text');
  5   | const preview = (page: Page) => page.frameLocator('iframe[title="文字效果预览"]').locator('body [data-text-draggable]');
  6   | const dialog = (page: Page) => page.getByRole('dialog', { name: '文字设置', exact: true });
  7   | async function open(page: Page) {
> 8   |   await box(page).click();
      |                   ^ Error: locator.click: Test timeout of 90000ms exceeded.
  9   |   await page.locator('.tox-pop:visible [data-mce-name="textsettings"]').click();
  10  |   await expect(dialog(page)).toBeVisible();
  11  |   await expect(preview(page)).toContainText('预览我的文字');
  12  |   await dialog(page).getByRole('tab', { name: '外观', exact: true }).click();
  13  |   return dialog(page);
  14  | }
  15  | test.beforeEach(async ({ page }) => {
  16  |   await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  17  |   await page.evaluate(() => {
  18  |     const editor = window.tinymce.activeEditor;
  19  |     editor.setContent('<p><span id="settings-text" data-text-draggable="true" style="position:absolute;left:100px;top:100px;width:360px;font-size:38px;line-height:1.5"><strong style="color:#147d64">预览我的文字</strong><br>LIVE PREVIEW</span></p>');
  20  |     editor.undoManager.clear(); editor.undoManager.add();
  21  |   });
  22  | });
  23  | test('one toolbar entry opens all effects; previews stay isolated and apply as one undo step', async ({ page }) => {
  24  |   const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  25  |   const d = await open(page);
  26  |   await expect(d.getByRole('tablist', { name: '文字设置分类', exact: true }).getByRole('tab')).toHaveCount(6);
  27  |   await d.getByRole('textbox', { name: '整体不透明度（0—100%）', exact: true }).fill('65');
  28  |   await expect(preview(page)).toHaveCSS('opacity', '0.65'); await expect(box(page)).toHaveCSS('opacity', '1');
  29  |   await d.getByRole('tab', { name: '描边', exact: true }).click();
  30  |   await d.getByRole('checkbox', { name: '启用文字描边', exact: true }).check();
  31  |   await d.getByRole('textbox', { name: '描边宽度（0—10 px）', exact: true }).fill('2');
  32  |   await d.getByRole('tab', { name: '填充', exact: true }).click();
  33  |   await d.getByRole('combobox', { name: '填充类型', exact: true }).selectOption('gradient');
  34  |   await d.getByRole('textbox', { name: '色标颜色', exact: true }).fill('#ef4444');
  35  |   await d.getByRole('tab', { name: '变形', exact: true }).click();
  36  |   await d.getByRole('button', { name: '上拱', exact: true }).click();
  37  |   await d.getByRole('combobox', { name: '多行处理', exact: true }).selectOption('join');
  38  |   await d.getByRole('textbox', { name: '变形程度', exact: true }).fill('70');
  39  |   await expect(preview(page).locator('textPath').first()).toContainText('预览我的文字 LIVE PREVIEW');
  40  |   await expect(preview(page).locator('linearGradient stop').first()).toHaveAttribute('stop-color', '#ef4444');
  41  |   await expect(preview(page).locator('[data-text-stroke-layer]')).toHaveAttribute('stroke-width', '2');
  42  |   expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  43  |   await page.screenshot({ path: 'screenshots/text-settings-desktop.png' });
  44  |   await d.getByRole('button', { name: '应用设置', exact: true }).click();
  45  |   await expect(box(page)).toHaveAttribute('data-text-fill', 'gradient');
  46  |   await expect(box(page)).toHaveAttribute('data-text-curve', 'up');
  47  |   await expect(box(page)).toHaveCSS('opacity', '0.65');
  48  |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  49  |   expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  50  |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  51  |   await expect(box(page)).toHaveAttribute('data-text-curve-strength', '70');
  52  |   await open(page); await d.getByRole('tab', { name: '变形', exact: true }).click();
  53  |   await expect(d.getByRole('textbox', { name: '变形程度', exact: true })).toHaveValue('70');
  54  |   await d.getByRole('button', { name: '重置效果', exact: true }).click();
  55  |   await expect(preview(page)).toHaveCSS('opacity', '1'); await expect(preview(page).locator('svg')).toHaveCount(0);
  56  |   await expect(box(page)).toHaveCSS('opacity', '0.65');
  57  |   await d.getByRole('button', { name: '取消', exact: true }).click();
  58  |   await expect(box(page)).toHaveAttribute('data-text-curve', 'up');
  59  |   await open(page); await d.getByRole('button', { name: '重置效果', exact: true }).click(); await d.getByRole('button', { name: '应用设置', exact: true }).click();
  60  |   await expect(box(page)).not.toHaveAttribute('data-text-curve'); await expect(box(page)).not.toHaveAttribute('data-text-fill');
  61  |   await expect(box(page).locator('[data-text-source] br')).toHaveCount(1);
  62  | });
  63  | test('Escape and close discard changes; keyboard tabs and narrow layout remain usable', async ({ page }) => {
  64  |   const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  65  |   let d = await open(page);
  66  |   await d.getByRole('textbox', { name: '整体不透明度（0—100%）', exact: true }).fill('10');
  67  |   await page.keyboard.press('Escape'); await expect(d).toHaveCount(0);
  68  |   expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  69  |   d = await open(page);
  70  |   await d.getByRole('tab', { name: '外观', exact: true }).press('ArrowRight');
  71  |   await expect(d.getByRole('tab', { name: '填充', exact: true })).toHaveAttribute('aria-selected', 'true');
  72  |   await d.getByRole('tab', { name: '填充', exact: true }).press('End');
  73  |   await expect(d.getByRole('tab', { name: '动画', exact: true })).toBeFocused();
  74  |   await d.getByRole('tab', { name: '变形', exact: true }).click();
  75  |   await page.setViewportSize({ width: 390, height: 844 });
  76  |   await expect(preview(page)).toBeVisible();
  77  |   const bounds = (await d.boundingBox())!; expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.width).toBeLessThanOrEqual(390);
  78  |   await d.getByRole('button', { name: '下弯', exact: true }).click();
  79  |   await expect(preview(page)).toHaveAttribute('data-text-curve', 'down');
  80  |   await page.screenshot({ path: 'screenshots/text-settings-mobile.png' });
  81  |   await d.getByRole('button', { name: '关闭文字设置', exact: true }).click();
  82  |   expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  83  | });
  84  | 
  85  | test('basic settings replace toolbar controls, preview in isolation, apply together, persist and undo', async ({ page }) => {
  86  |   const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  87  |   await box(page).click();
  88  |   const toolbar = page.locator('.tox-pop:visible');
  89  |   await expect(toolbar.locator('[data-mce-name="fontfamily"], [data-mce-name="fontsizeinput"], [data-mce-name="forecolor"], [data-mce-name="backcolor"]')).toHaveCount(0);
  90  |   await toolbar.locator('[data-mce-name="textsettings"]').click();
  91  |   const d = dialog(page);
  92  |   await expect(d.getByRole('tab', { name: '基础', exact: true })).toHaveAttribute('aria-selected', 'true');
  93  |   await expect(d.getByRole('textbox', { name: '字号', exact: true })).toHaveValue('38');
  94  |   await d.getByRole('combobox', { name: '字体', exact: true }).selectOption({ label: 'Arial' });
  95  |   await d.getByRole('textbox', { name: '字号', exact: true }).fill('42');
  96  |   await d.getByRole('button', { name: '增大字号', exact: true }).click();
  97  |   await expect(d.getByRole('textbox', { name: '字号', exact: true })).toHaveValue('43');
  98  |   await d.getByRole('button', { name: '减小字号', exact: true }).click();
  99  |   await d.getByRole('textbox', { name: '文字颜色', exact: true }).fill('#3598db');
  100 |   await d.getByRole('textbox', { name: '背景颜色', exact: true }).fill('#f1c40f');
  101 |   await expect(preview(page).locator('strong')).toHaveCSS('font-size', '42px');
  102 |   await expect(preview(page).locator('strong')).toHaveCSS('color', 'rgb(53, 152, 219)');
  103 |   await expect(preview(page).locator('[style*="background-color"]')).toHaveCSS('background-color', 'rgb(241, 196, 15)');
  104 |   expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  105 |   await page.screenshot({ path: 'screenshots/text-settings-basic-desktop.png' });
  106 |   await d.getByRole('button', { name: '应用设置', exact: true }).click();
  107 |   await expect(box(page).locator('strong')).toHaveCSS('font-size', '42px');
  108 |   await expect(box(page).locator('strong')).toHaveCSS('color', 'rgb(53, 152, 219)');
```