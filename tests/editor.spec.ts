import { expect, test } from '@playwright/test';
import type { Editor } from 'tinymce';
import { defaultSettings, resolvePlugins } from '../src/plugins';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

declare global { interface Window { tinymce: { activeEditor: Editor } } }

test('插件仅使用源码仓库中可用的开源插件', () => {
  const full = resolvePlugins(defaultSettings);
  expect(full).toContain('image');
  expect(full).toContain('code');
  expect(full).not.toContain('editimage');
  expect(full).not.toContain('advcode');
  expect(full).not.toContain('uploadcare');
  expect(full).toHaveLength(28);
  expect(resolvePlugins({ autoresize: true })).toHaveLength(29);
});

test.beforeEach(async ({ page }) => {
  await page.route((url) => url.hostname === 'tiny.cloud' || url.hostname.endsWith('.tiny.cloud'), (route) => route.abort());
  await page.goto('/');
  await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized, { timeout: 60000 });
});

test('编辑、自动保存、刷新、HTML、预览、导出及本地版本', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await expect(page.frameLocator('.tox-edit-area iframe').locator('h1')).toHaveText('把想法，写成作品。');
  await page.evaluate(() => {
    const editor = window.tinymce.activeEditor;
    editor.setContent('<h1>浏览器回归测试</h1><p>持久化内容 123</p>');
    editor.fire('change');
  });
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('test44.tinymce.document.v1') || '{}').content)).toContain('持久化内容 123');
  await page.reload();
  await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(page.frameLocator('.tox-edit-area iframe').locator('body')).toContainText('持久化内容 123');
  await page.getByRole('button', { name: 'HTML', exact: true }).click();
  await page.getByRole('textbox', { name: 'HTML 源码' }).fill('<h1>源码已修改</h1><p>第二个版本</p>');
  await page.getByRole('button', { name: '应用修改' }).click();
  await expect(page.frameLocator('.tox-edit-area iframe').locator('h1')).toHaveText('源码已修改');
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.getByRole('button', { name: '本地版本', exact: true }).click();
  await expect(page.locator('.revision-row')).toHaveCount(1);
  await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  await expect(page.frameLocator('iframe[title="文档预览"]').locator('h1')).toHaveText('源码已修改');
  await page.getByRole('button', { name: '导出', exact: true }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'HTML 文档' }).click();
  expect((await download).suggestedFilename()).toBe('创作手记.html');
  expect(errors).toEqual([]);
});

test('导入 HTML 并保留源码模式刷新前的修改', async ({ page }) => {
  await page.locator('input[type="file"]').setInputFiles({ name: '导入测试.html', mimeType: 'text/html', buffer: Buffer.from('<h1>导入成功</h1><p>正文内容</p>') });
  await expect(page.frameLocator('.tox-edit-area iframe').locator('h1')).toHaveText('导入成功');
  await page.getByRole('button', { name: 'HTML', exact: true }).click();
  await page.getByRole('textbox', { name: 'HTML 源码' }).fill('<h1>未点应用也可刷新恢复</h1>');
  await page.reload();
  await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(page.frameLocator('.tox-edit-area iframe').locator('h1')).toHaveText('未点应用也可刷新恢复');
});

test('本地源码、表格和表情对话框正常，无商业插件按钮', async ({ page }) => {
  await page.locator('[data-mce-name="code"]').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  const emojiArea = (await page.locator('.tox-edit-area iframe').boundingBox())!;
  await page.mouse.click(emojiArea.x + emojiArea.width - 20, emojiArea.y + 30);
  await page.locator('[data-mce-name="emoticons"]').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.locator('[data-mce-name="table"]').click();
  await expect(page.locator('.tox-menu').first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-mce-name="math"], [data-mce-name="exportword"], [data-mce-name="tinycomments"]')).toHaveCount(0);
});

test('切换自适应高度不丢失内容', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const loaded = await page.evaluate(() => Object.keys(window.tinymce.activeEditor.plugins));
  for (const name of ['code', 'image', 'table', 'codesample', 'emoticons']) expect(loaded).toContain(name);
  await page.evaluate(() => { window.tinymce.activeEditor.setContent('<p>切换后保留</p>'); window.tinymce.activeEditor.fire('change'); });
  await page.getByRole('button', { name: '编辑器配置' }).click();
  await page.getByLabel('自适应文档高度', { exact: true }).check();
  await page.getByRole('button', { name: '应用配置' }).click();
  await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized && Boolean(window.tinymce.activeEditor.plugins.autoresize));
  await expect(page.frameLocator('.tox-edit-area iframe').locator('body')).toContainText('切换后保留');
  expect(errors).toEqual([]);
});

test('编辑器及插件确实来自自有仓库构建，不请求 Tiny Cloud', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (request) => { if (new URL(request.url()).hostname.endsWith('tiny.cloud')) external.push(request.url()); });
  await page.reload();
  await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  const response = await page.request.get('/vendor/tinymce/build-info.json');
  const info = await response.json();
  expect(info.repository).toBe('https://github.com/zhangjinteng/6mm-tinymce');
  expect(info.plugins).toHaveLength(29);
  const source = await readFile('6mm-tinymce/modules/tinymce/js/tinymce/tinymce.min.js');
  const runtime = await (await page.request.get('/vendor/tinymce/tinymce.min.js')).body();
  expect(runtime.equals(source)).toBe(true);
  expect(createHash('sha256').update(runtime).digest('hex')).toBe(info.sha256);
  await expect(page.locator('script[src*="/vendor/tinymce/tinymce.min.js"]')).toHaveCount(1);
  expect(await page.evaluate(() => window.tinymce.activeEditor.options.get('license_key'))).toBe('gpl');
  expect(await page.evaluate(() => Object.keys(window.tinymce.activeEditor.plugins).sort())).toEqual(resolvePlugins(defaultSettings).sort());
  const plugins = await page.evaluate(() => Object.keys(window.tinymce.activeEditor.plugins));
  for (const plugin of plugins) expect((await page.request.get(`/vendor/tinymce/plugins/${plugin}/plugin.min.js`)).ok()).toBe(true);
  expect(external).toEqual([]);
});

test('旧的云插件配置不会影响本地加载，也不会清空已保存的文档', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('test44.tinymce.settings.v1', JSON.stringify({ premium: true, imageMode: 'uploadcare', uploadcareKey: 'old-key', ai: 'trial', autoresize: false }));
    localStorage.setItem('test44.tinymce.document.v1', JSON.stringify({
      title: '迁移前的文档', content: '<p>保留内容 123</p>', updatedAt: new Date().toISOString(),
      revisions: [{ revisionId: 'before-local', createdAt: new Date().toISOString(), content: '<p>保留内容 123</p>', author: { id: 'local-author', name: '本地用户' } }]
    }));
  });
  await page.reload();
  await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(page.frameLocator('.tox-edit-area iframe').locator('body')).toContainText('保留内容 123');
  await expect(page.getByRole('textbox', { name: '文档名称' })).toHaveValue('迁移前的文档');
  expect(await page.evaluate(() => Boolean(window.tinymce.activeEditor.plugins.uploadcare))).toBe(false);
  await page.getByRole('button', { name: '本地版本', exact: true }).click();
  await expect(page.locator('.revision-row')).toHaveCount(1);
});

test('桌面与手机布局、图片和错误状态', async ({ page }) => {
  const image = page.frameLocator('.tox-edit-area iframe').locator('figure img');
  await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
  await page.screenshot({ path: 'screenshots/desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(await page.frameLocator('.tox-edit-area iframe').locator('body').evaluate((node) => node.clientHeight)).toBeGreaterThan(250);
  await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true);
  await page.screenshot({ path: 'screenshots/mobile.png', fullPage: true });
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('Quota', 'QuotaExceededError'); }; });
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await expect(page.locator('.error-banner')).toContainText('本地存储不可用或空间不足');
  await expect(page.locator('.save-state')).toHaveText('保存失败');
});

test('图片自由拖动、取消、撤销重做、保存刷新，并保留缩放手柄', async ({ page }) => {
  await page.evaluate(() => {
    const editor = window.tinymce.activeEditor;
    editor.setContent('<p>图片拖动测试</p><p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" width="180" height="120" alt="拖动图片">旁边文字</p>');
    editor.undoManager.clear(); editor.undoManager.add();
  });
  const image = page.frameLocator('.tox-edit-area iframe').locator('img[alt="拖动图片"]');
  async function expectHandlesAtImage() {
    const box = (await image.boundingBox())!;
    for (const [name, x, y] of [
      ['nw', box.x, box.y], ['ne', box.x + box.width, box.y],
      ['sw', box.x, box.y + box.height], ['se', box.x + box.width, box.y + box.height]
    ] as const) {
      const handle = page.frameLocator('.tox-edit-area iframe').locator(`#objectResizeHandle${name}`);
      await expect.poll(async () => {
        const corner = await handle.boundingBox();
        return corner ? Math.hypot(corner.x + corner.width / 2 - x, corner.y + corner.height / 2 - y) : Infinity;
      }).toBeLessThan(2);
    }
  }
  const initial = (await image.boundingBox())!;
  const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  await image.click();
  const toolbar = page.locator('.tox-pop:visible');
  await expect(toolbar).toBeVisible();
  async function expectToolbarAtImage() {
    await expect.poll(async () => {
      const current = await toolbar.boundingBox();
      const area = await page.locator('.tox-edit-area').boundingBox();
      return current && area ? Math.max(Math.abs(current.x + current.width / 2 - area.x - area.width / 2), Math.abs(area.y + area.height - current.y - current.height - 50)) : Infinity;
    }).toBeLessThan(2);
  }
  await expect(page.frameLocator('.tox-edit-area iframe').locator('.object-selection-frame [data-corner]').first()).toBeVisible();
  await page.mouse.move(initial.x + 50, initial.y + 60); await page.mouse.down();
  await page.mouse.move(initial.x + 130, initial.y + 120, { steps: 6 });
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await expectHandlesAtImage();
  await expectToolbarAtImage();
  await page.keyboard.press('Escape'); await page.mouse.up();
  expect((await image.boundingBox())!.x).toBeCloseTo(initial.x, 0);
  await expectHandlesAtImage();
  await expectToolbarAtImage();
  await page.mouse.move(initial.x + 50, initial.y + 60); await page.mouse.down();
  await page.mouse.move(initial.x + 130, initial.y + 120, { steps: 6 }); await page.mouse.up();
  await expectHandlesAtImage();
  await expectToolbarAtImage();
  const moved = (await image.boundingBox())!;
  expect(moved.x - initial.x).toBeCloseTo(80, 0); expect(moved.y - initial.y).toBeCloseTo(60, 0);
  expect(moved.width).toBeCloseTo(initial.width, 0); expect(moved.height).toBeCloseTo(initial.height, 0);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  await expect(image).toHaveCSS('position', 'absolute');
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  expect((await image.boundingBox())!.x).toBeCloseTo(moved.x, 0);
  expect((await image.boundingBox())!.y).toBeCloseTo(moved.y, 0);
  await image.click();
  const handle = page.frameLocator('.tox-edit-area iframe').locator('#objectResizeHandlese');
  const corner = (await handle.boundingBox())!;
  await page.mouse.move(corner.x + corner.width / 2, corner.y + corner.height / 2);
  await page.mouse.down();
  await page.mouse.move(corner.x + corner.width / 2 + 45, corner.y + corner.height / 2 + 30, { steps: 6 });
  await page.mouse.up();
  expect((await image.boundingBox())!.width).toBeGreaterThan(moved.width + 20);
});

test('图片与弹幕复用选中框，图片四角等比缩放及撤销保存', async ({ page }) => {
  await page.evaluate(() => window.tinymce.activeEditor.setContent('<p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="共用选中框" width="240" height="160" style="position:absolute;left:260px;top:140px"></p><div data-danmaku-id="shared" data-danmaku-source="current" style="position:absolute;left:550px;top:180px;width:150px;height:100px"></div>'));
  await page.evaluate(() => { const editor = window.tinymce.activeEditor; editor.undoManager.clear(); editor.undoManager.add(); });
  const frame = page.frameLocator('.tox-edit-area iframe');
  const image = frame.locator('img[alt="共用选中框"]');
  const overlay = frame.locator('.object-selection-frame');
  const region = frame.locator('[data-danmaku-id="shared"]');
  for (const corner of ['nw', 'ne', 'sw', 'se']) {
    await region.click({ position: { x: 20, y: 20 } });
    await expect(overlay).toHaveCount(1);
    expect((await overlay.boundingBox())!.width).toBeCloseTo((await region.boundingBox())!.width, 0);
    await image.click();
    await expect(overlay).toHaveCount(1);
    await expect(frame.locator('.mce-resizehandle')).toHaveCount(0);
    const initial = (await image.boundingBox())!;
    const handle = (await frame.locator(`#objectResizeHandle${corner}`).boundingBox())!;
    const dx = corner.includes('w') ? -30 : 30; const dy = corner.includes('n') ? -20 : 20;
    const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
    await page.mouse.move(handle.x + 5, handle.y + 5); await page.mouse.down();
    await page.mouse.move(handle.x + 5 + dx, handle.y + 5 + dy, { steps: 4 });
    expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
    await page.mouse.up();
    const resized = (await image.boundingBox())!;
    expect(resized.width).toBeCloseTo(initial.width + 30, 0); expect(resized.height).toBeCloseTo(initial.height + 20, 0);
    expect(resized.x).toBeCloseTo(initial.x + (corner.includes('w') ? dx : 0), 0);
    expect(resized.y).toBeCloseTo(initial.y + (corner.includes('n') ? dy : 0), 0);
    await expect(image).not.toHaveAttribute('data-danmaku-x');
    await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
    expect((await image.boundingBox())!.width).toBeCloseTo(initial.width, 0);
    await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
    expect((await image.boundingBox())!.width).toBeCloseTo(resized.width, 0);
  }
  const saved = (await image.boundingBox())!;
  const html = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  expect(html).not.toContain('object-selection-frame'); expect(html).not.toContain('objectResizeHandle');
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  const restored = (await image.boundingBox())!;
  expect(restored.width).toBeCloseTo(saved.width, 0); expect(restored.height).toBeCloseTo(saved.height, 0);
  expect(restored.x).toBeCloseTo(saved.x, 0); expect(restored.y).toBeCloseTo(saved.y, 0);
});

test('图片与弹幕切换选中只保留当前边框，点击正文清除选中框', async ({ page }) => {
  await page.evaluate(() => window.tinymce.activeEditor.setContent('<p>点击这里取消选中</p><p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="互斥图片" width="160" height="100"></p><div data-danmaku-id="exclusive" data-danmaku-source="current" style="position:absolute;left:400px;top:100px;width:180px;height:120px"></div>'));
  const frame = page.frameLocator('.tox-edit-area iframe');
  const image = frame.locator('img[alt="互斥图片"]');
  const region = frame.locator('[data-danmaku-id="exclusive"]');
  const overlay = frame.locator('.object-selection-frame');
  for (let iteration = 0; iteration < 3; iteration++) {
    await image.click();
    await expect(overlay).toBeVisible();
    expect((await overlay.boundingBox())!.x).toBeCloseTo((await image.boundingBox())!.x, 0);
    await region.click({ position: { x: 20, y: 20 } });
    await expect(image).not.toHaveAttribute('data-mce-selected', { timeout: 1500 });
    await expect(overlay).toHaveCount(1);
    const box = (await region.boundingBox())!; const selected = (await overlay.boundingBox())!;
    expect(selected.x).toBeCloseTo(box.x, 0); expect(selected.width).toBeCloseTo(box.width, 0);
    await expect(page.locator('.tox-pop:visible')).toHaveCount(1);
    await expect(page.locator('.tox-pop:visible').getByRole('button')).toHaveCount(5);
    await expect(page.locator('.tox-pop:visible').getByRole('button', { name: '填充满', exact: true })).toHaveCount(0);
    await image.click();
    expect((await overlay.boundingBox())!.x).toBeCloseTo((await image.boundingBox())!.x, 0);
    await expect(frame.locator('.mce-resizehandle')).toHaveCount(0);
    await expect(frame.locator('.object-selection-frame [data-corner]:visible')).toHaveCount(4);
  }
  await frame.getByText('点击这里取消选中', { exact: true }).click();
  await expect(overlay).toBeHidden();
  await expect(image).not.toHaveAttribute('data-mce-selected');
});

test('拖动定位的图片工具栏可左右居中对齐，支持撤销和保存', async ({ page }) => {
  await page.evaluate(() => {
    const editor = window.tinymce.activeEditor;
    editor.setContent('<p>对齐回归</p><p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="对齐图片" width="160" height="100"></p>');
    editor.undoManager.clear(); editor.undoManager.add();
  });
  const frame = page.frameLocator('.tox-edit-area iframe');
  const image = frame.locator('img[alt="对齐图片"]');
  const original = (await image.boundingBox())!;
  await page.mouse.move(original.x + 30, original.y + 30); await page.mouse.down();
  await page.mouse.move(original.x + 130, original.y + 80, { steps: 5 }); await page.mouse.up();
  await expect(image).toHaveCSS('position', 'absolute');
  const initial = (await image.boundingBox())!;
  const edges = await image.evaluate((node) => {
    const parent = node.parentElement!; const rect = parent.getBoundingClientRect();
    return { left: rect.left, width: rect.width };
  });
  const iframe = (await page.locator('.tox-edit-area iframe').boundingBox())!;
  for (const [label, ratio] of [['居中对齐', 0.5], ['右对齐', 1], ['左对齐', 0]] as const) {
    await image.click();
    const toolbar = page.locator('.tox-pop:visible');
    await toolbar.getByRole('button', { name: label, exact: true }).click();
    await expect.poll(async () => (await image.boundingBox())!.x).toBeCloseTo(iframe.x + edges.left + (edges.width - initial.width) * ratio, 0);
    const aligned = (await image.boundingBox())!;
    expect(aligned.y).toBeCloseTo(initial.y, 0); expect(aligned.width).toBeCloseTo(initial.width, 0);
    const border = (await frame.locator('.object-selection-frame').boundingBox())!;
    expect(border.x).toBeCloseTo(aligned.x, 0);
    await expect(toolbar.getByRole('button', { name: label, exact: true })).toHaveAttribute('aria-pressed', 'true');
  }
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  const undone = (await image.boundingBox())!;
  expect(undone.x).toBeCloseTo(iframe.x + edges.left + edges.width - initial.width, 0);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  const saved = (await image.boundingBox())!;
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  expect((await image.boundingBox())!.x).toBeCloseTo(saved.x, 0);
  expect((await image.boundingBox())!.y).toBeCloseTo(saved.y, 0);
});

for (const absolute of [false, true]) {
  test(`图片填充满正文宽度并保持比例，支持撤销和保存（${absolute ? '拖动定位' : '普通图片'}）`, async ({ page }) => {
    await page.evaluate((absolute) => {
      const editor = window.tinymce.activeEditor;
      editor.setContent(`<p>填充测试</p><p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="填充图片" width="160" height="100"${absolute ? ' style="position:absolute;left:300px;top:100px"' : ''}></p>`);
      editor.undoManager.clear(); editor.undoManager.add();
    }, absolute);
    const frame = page.frameLocator('.tox-edit-area iframe');
    const image = frame.locator('img[alt="填充图片"]');
    const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
    await image.click();
    await page.locator('.tox-pop:visible').getByRole('button', { name: '填充满', exact: true }).click();
    const geometry = () => image.evaluate((node) => {
      const box = node.getBoundingClientRect(); const parent = node.parentElement!.getBoundingClientRect();
      return { width: box.width, height: box.height, left: box.left, parentLeft: parent.left, parentWidth: parent.width };
    });
    const filled = await geometry();
    expect(filled.width).toBeCloseTo(filled.parentWidth, 0); expect(filled.left).toBeCloseTo(filled.parentLeft, 0);
    expect(filled.width / filled.height).toBeCloseTo(1.6, 2);
    const outline = (await frame.locator('.object-selection-frame').boundingBox())!;
    expect(outline.width).toBeCloseTo(filled.width, 0);
    await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
    expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
    await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
    expect((await geometry()).width).toBeCloseTo(filled.width, 0);
    await page.getByRole('button', { name: '保存文档', exact: true }).click();
    await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
    const restored = await geometry();
    expect(restored.width).toBeCloseTo(restored.parentWidth, 0); expect(restored.width / restored.height).toBeCloseTo(1.6, 2);
  });
}

test('编辑区禁用横纵滚动条，溢出内容不触发滚轮滚动', async ({ page }) => {
  await page.evaluate(() => {
    const editor = window.tinymce.activeEditor;
    editor.setContent('<p>滚动条检查</p><div style="position:absolute;left:2000px;top:2000px;width:400px;height:300px">溢出内容</div>');
    editor.getWin().scrollTo(0, 0);
  });
  const frame = page.frameLocator('.tox-edit-area iframe');
  await expect(frame.locator('html')).toHaveCSS('overflow-x', 'hidden');
  await expect(frame.locator('html')).toHaveCSS('overflow-y', 'hidden');
  await expect(frame.locator('body')).toHaveCSS('overflow-x', 'hidden');
  await expect(frame.locator('body')).toHaveCSS('overflow-y', 'hidden');
  await frame.getByText('滚动条检查', { exact: true }).hover();
  await page.mouse.wheel(500, 500);
  await expect.poll(() => page.evaluate(() => {
    const view = window.tinymce.activeEditor.getWin();
    return { x: view.scrollX, y: view.scrollY };
  })).toEqual({ x: 0, y: 0 });
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toContain('溢出内容');
});
