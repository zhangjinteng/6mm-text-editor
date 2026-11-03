import { expect, test, type Page } from '@playwright/test';

const frame = (page: Page) => page.frameLocator('.tox-edit-area iframe');
const box = (page: Page) => frame(page).locator('#vertical-text');
const panel = (page: Page) => page.getByRole('complementary', { name: '文字配置面板' });
const saved = (page: Page) => page.evaluate(() => window.tinymce.activeEditor.getContent());
async function layout(page: Page) {
  await box(page).click();
  await panel(page).getByRole('tab', { name: '排版', exact: true }).click();
  return panel(page).getByLabel('文字排列', { exact: true });
}
test.beforeEach(async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    e.setContent('<p><span id="vertical-text" data-text-draggable="true" style="position:absolute;left:160px;top:70px;width:280px;font-size:32px;line-height:1.5"><strong style="color:#147d64">春风拂面</strong><br>花开有时 ABC</span></p>');
    e.undoManager.clear(); e.undoManager.add();
  });
});

test('侧栏横竖排切换保持位置与字号，竖排字符及换列方向正确，保存撤销重做', async ({ page }) => {
  const mode = await layout(page), original = await saved(page), before = (await box(page).boundingBox())!;
  await expect(mode).toHaveValue('horizontal-tb'); await mode.selectOption('vertical-rl');
  await expect(box(page)).toHaveCSS('writing-mode', 'vertical-rl');
  await expect(box(page)).toHaveCSS('font-size', '32px');
  await expect(box(page).locator('strong')).toHaveCSS('color', 'rgb(20, 125, 100)');
  const bounds = (await box(page).boundingBox())!;
  expect(bounds.x).toBeCloseTo(before.x, 0); expect(bounds.y).toBeCloseTo(before.y, 0);
  expect(bounds.height).toBeCloseTo(before.width, 0); expect(bounds.width).toBeLessThan(bounds.height);
  const chars = await box(page).evaluate(el => {
    const walker = el.ownerDocument.createTreeWalker(el, NodeFilter.SHOW_TEXT), rects: { x: number; y: number }[] = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.parentElement?.closest('[data-mce-bogus]')) continue;
      for (let i = 0; i < (node.textContent?.length ?? 0); i++) {
        const r = el.ownerDocument.createRange(); r.setStart(node, i); r.setEnd(node, i + 1);
        const b = r.getBoundingClientRect(); rects.push({ x: b.x, y: b.y });
      }
    }
    return rects;
  });
  expect(chars[1]!.x).toBeCloseTo(chars[0]!.x, 0); expect(chars[1]!.y).toBeGreaterThan(chars[0]!.y);
  expect(chars[4]!.x).toBeLessThan(chars[0]!.x);
  await page.screenshot({ path: 'screenshots/text-writing-mode-vertical.png' });
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo()); expect(await saved(page)).toBe(original);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  await expect(box(page)).toHaveCSS('writing-mode', 'vertical-rl');
  await page.getByRole('button', { name: '保存文档', exact: true }).click(); await page.reload();
  await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(await layout(page)).toHaveValue('vertical-rl');
  await (await layout(page)).selectOption('horizontal-tb');
  await expect(box(page)).toHaveCSS('writing-mode', 'horizontal-tb');
  expect((await box(page).boundingBox())!.width).toBeCloseTo(before.width, 0);
});

test('弹窗横竖排预览可取消；竖排缩放、调整列长和编辑可用', async ({ page }) => {
  await layout(page); const original = await saved(page);
  await box(page).click();
  await page.locator('.tox-pop:visible [data-mce-name="textsettings"]').click();
  const dialog = page.getByRole('dialog', { name: '文字设置', exact: true });
  await dialog.getByRole('tab', { name: '排版', exact: true }).click();
  await dialog.getByLabel('文字排列', { exact: true }).selectOption('vertical-rl');
  await expect(page.frameLocator('iframe[title="文字效果预览"]').locator('[data-text-draggable]')).toHaveCSS('writing-mode', 'vertical-rl');
  expect(await saved(page)).toBe(original); await dialog.getByRole('button', { name: '取消', exact: true }).click();
  await (await layout(page)).selectOption('vertical-rl');
  const drag = async (side: string, dx: number, dy: number) => {
    const h = (await frame(page).locator(`[data-text-resize="${side}"]`).boundingBox())!;
    await page.mouse.move(h.x + 5, h.y + 5); await page.mouse.down();
    await page.mouse.move(h.x + 5 + dx, h.y + 5 + dy, { steps: 6 }); await page.mouse.up();
  };
  await expect(frame(page).locator('[data-text-resize="s"]')).toBeVisible();
  await drag('se', 20, 70);
  expect(await box(page).evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThan(32);
  const size = await box(page).evaluate(el => getComputedStyle(el).fontSize), height = (await box(page).boundingBox())!.height;
  await drag('s', 0, 40); expect((await box(page).boundingBox())!.height).toBeCloseTo(height + 40, 0);
  await expect(box(page)).toHaveCSS('font-size', size);
  await box(page).dblclick(); await page.keyboard.press('End'); await page.keyboard.insertText('新增');
  await expect(box(page)).toContainText('新增'); await expect(box(page)).toHaveCSS('writing-mode', 'vertical-rl');
});

test('竖排保留描边填充并在切回横排时恢复曲线变形', async ({ page }) => {
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor, el = e.getBody().querySelector<HTMLElement>('#vertical-text')!;
    const source = e.getDoc().createElement('span'); source.dataset.textSource = 'true'; source.append(...el.childNodes); el.append(source);
    Object.assign(el.dataset, { textStrokeEnabled: 'true', textStrokeWidth: '2', textStrokeColor: '#f08030', textFill: 'gradient', textCurve: 'up', textCurveStrength: '40' });
    e.dispatch('change');
  });
  await expect(box(page).locator('textPath')).toHaveCount(2);
  await (await layout(page)).selectOption('vertical-rl');
  await expect(box(page).locator('textPath')).toHaveCount(0);
  await expect(box(page).locator('[data-text-stroke-layer]')).toHaveCount(1);
  const glyphs = box(page).locator('svg > g:not([data-text-stroke-layer]) > text');
  await expect(glyphs.first()).toHaveCSS('writing-mode', 'vertical-rl');
  await expect(box(page).locator('linearGradient')).toHaveCount(1);
  await page.screenshot({ path: 'screenshots/text-writing-mode-effects.png' });
  await page.evaluate(() => { const e = window.tinymce.activeEditor; e.setContent(e.getContent()); });
  await expect(box(page).locator('svg > g:not([data-text-stroke-layer]) > text').first()).toHaveCSS('writing-mode', 'vertical-rl');
  await (await layout(page)).selectOption('horizontal-tb'); await expect(box(page).locator('textPath')).toHaveCount(2);
});

test('竖排逐行背景按列包围文字，连体背景随排列方向切换', async ({ page }) => {
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor, el = e.getBody().querySelector<HTMLElement>('#vertical-text')!;
    el.dataset.textBackgroundSettings = JSON.stringify({ visible: true, preset: 'lines', shape: 'rounded', layout: 'lines', color: '#ded2ff', opacity: 100, expandX: 4, expandY: 4, radius: 6, scaleX: 100, scaleY: 100, offsetX: 0, offsetY: 0 });
    e.dispatch('change');
  });
  await (await layout(page)).selectOption('vertical-rl');
  const paths = box(page).locator('[data-text-background-render] svg path');
  await expect(paths).toHaveCount(2);
  const rects = await paths.evaluateAll(nodes => nodes.map(n => n.getBoundingClientRect().toJSON()));
  expect(Math.abs(rects[0].x - rects[1].x)).toBeGreaterThan(20);
  expect(rects.every(r => r.height > r.width)).toBe(true);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor, el = e.getBody().querySelector<HTMLElement>('#vertical-text')!;
    const value = JSON.parse(el.dataset.textBackgroundSettings!); value.layout = 'connected'; value.preset = 'connected';
    el.dataset.textBackgroundSettings = JSON.stringify(value); e.dispatch('change');
  });
  await expect(paths).toHaveCount(1); await expect(paths).toHaveAttribute('transform', 'matrix(0 1 1 0 0 0)');
  await (await layout(page)).selectOption('horizontal-tb'); await expect(paths).not.toHaveAttribute('transform');
});

test('竖排定位与复制保留自动列宽', async ({ page }) => {
  await (await layout(page)).selectOption('vertical-rl');
  await panel(page).getByRole('button', { name: '水平居中', exact: true }).click();
  expect(await box(page).evaluate(el => el.style.width)).toBe('auto');
  await page.evaluate(() => window.tinymce.activeEditor.execCommand('TextDuplicate'));
  const objects = frame(page).locator('[data-text-draggable]');
  await expect(objects).toHaveCount(2);
  await expect(objects.nth(1)).toHaveCSS('writing-mode', 'vertical-rl');
  expect(await objects.nth(1).evaluate(el => el.style.width)).toBe('auto');
});
