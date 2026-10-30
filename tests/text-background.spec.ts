import { expect, test, type Page, type Locator } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import type { Editor } from 'tinymce';
import type { TextBackground } from '../src/text-background';
declare global { interface Window { tinymce: { activeEditor: Editor } } }
const frame = (page: Page) => page.frameLocator('.tox-edit-area iframe');
const box = (page: Page) => frame(page).locator('#background-text');
const preview = (page: Page) => page.frameLocator('iframe[title="文字效果预览"]').locator('body > [data-text-draggable]');
const background = (node: Locator) => node.locator(':scope > [data-text-background-render]');
const dialog = (page: Page) => page.getByRole('dialog', { name: '文字设置', exact: true });
const field = (page: Page, name: string) => dialog(page).getByRole('textbox', { name, exact: true });
const button = (page: Page, name: string) => dialog(page).getByRole('button', { name, exact: true });
const preset = (page: Page, name: string) => dialog(page).getByRole('listbox', { name: '背景样式', exact: true }).getByRole('option', { name, exact: true });
const content = (page: Page) => page.evaluate(() => window.tinymce.activeEditor.getContent());
const stored = async (page: Page): Promise<TextBackground | null> => JSON.parse((await box(page).getAttribute('data-text-background-settings')) || 'null');
async function open(page: Page) { await box(page).click(); await page.locator('.tox-pop:visible [data-mce-name="textsettings"]').click(); await dialog(page).getByRole('tab', { name: '背景', exact: true }).click(); }
async function apply(page: Page) { await button(page, '应用设置').click(); await expect(dialog(page)).toHaveCount(0); }
async function textGeometry(node: Locator) {
  return node.evaluate(box => { const origin = box.getBoundingClientRect(); return Array.from(box.querySelectorAll('.row1,.row2,.row3')).map(node => { const rect = node.getBoundingClientRect(); return [rect.x - origin.x, rect.y - origin.y, rect.width, rect.height].map(n => Math.round(n * 100) / 100); }); });
}
async function pixels(svg: Locator, point?: { x: number; y: number }) {
  return svg.evaluate(async (element, point) => {
    const svg = element as SVGSVGElement, image = new Image(); image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg)); await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = Math.ceil(Number(svg.getAttribute('width'))); canvas.height = Math.ceil(Number(svg.getAttribute('height'))); const ctx = canvas.getContext('2d')!; ctx.drawImage(image, 0, 0); const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let colored = 0, maxAlpha = 0; for (let i = 3; i < data.length; i += 4) { maxAlpha = Math.max(maxAlpha, data[i]!); if (data[i]! > 30) colored++; }
    const x = Math.round((point?.x ?? 0) - svg.viewBox.baseVal.x), y = Math.round((point?.y ?? 0) - svg.viewBox.baseVal.y);
    return { colored, maxAlpha, gapAlpha: point && x >= 0 && y >= 0 && x < canvas.width && y < canvas.height ? ctx.getImageData(x, y, 1, 1).data[3] : undefined };
  }, point);
}
test.beforeEach(async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => { const e = window.tinymce.activeEditor; e.setContent('<p><span id="background-text" data-text-draggable="true" style="position:absolute;left:120px;top:90px;width:340px;font:32px/1.5 Arial"><strong class="row1" style="color:#147d64">背景样式</strong><br><span class="row2">BACKGROUND</span><br><em class="row3">最后一行</em></span></p>'); e.undoManager.clear(); e.undoManager.add(); });
});
test('preset gallery selects distinct contours, previews real shapes and never mutates text before Apply', async ({ page }) => {
  const before = await content(page), geometry = await textGeometry(box(page)); await open(page);
  await expect(dialog(page).getByRole('listbox', { name: '背景样式', exact: true }).getByRole('option')).toHaveCount(15); await expect(preset(page, '无背景')).toHaveAttribute('aria-selected', 'true');
  const shapes = new Set<string>();
  for (const name of ['矩形背景', '圆角背景', '胶囊背景', '椭圆背景', '气泡背景', '斜切背景', '云朵背景', '波浪背景', '六边形背景', '切角背景', '票券背景', '丝带背景']) {
    await preset(page, name).click(); await expect(preset(page, name)).toHaveAttribute('aria-selected', 'true'); await expect(background(preview(page)).locator('path')).toHaveCount(1);
    shapes.add((await background(preview(page)).locator('path').getAttribute('d'))!); expect((await pixels(background(preview(page)).locator('svg'))).colored).toBeGreaterThan(3000);
  }
  expect(shapes.size).toBe(12); expect(await content(page)).toBe(before); await preset(page, '云朵背景').click(); await page.screenshot({ path: 'screenshots/text-background-gallery.png' });
  await apply(page); expect(await stored(page)).toMatchObject({ preset: 'cloud', shape: 'cloud' }); expect(await textGeometry(box(page))).toEqual(geometry); await expect(box(page)).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo()); expect(await content(page)).toBe(before); await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo()); await expect(background(box(page))).toBeVisible();
});
test('independent alpha, expansion, size and offsets do not rewrap text; cancel and reset are isolated', async ({ page }) => {
  const geometry = await textGeometry(box(page)); await open(page); await preset(page, '矩形背景').click(); await field(page, '背景颜色').fill('#ff0000'); await field(page, '背景不透明度').fill('50'); await field(page, '水平扩张').fill('40'); await field(page, '垂直扩张').fill('20');
  await dialog(page).getByText('尺寸与偏移', { exact: true }).click(); await field(page, '背景宽度').fill('120'); await field(page, '背景高度').fill('150'); await field(page, '背景水平偏移').fill('15'); await field(page, '背景垂直偏移').fill('-10');
  const raster = await pixels(background(preview(page)).locator('svg')); expect(raster.maxAlpha).toBeGreaterThanOrEqual(127); expect(raster.maxAlpha).toBeLessThanOrEqual(128); await expect(preview(page)).toHaveCSS('opacity', '1'); await expect(preview(page).locator('.row1')).toHaveCSS('color', 'rgb(20, 125, 100)');
  await expect(preset(page, '自定义背景')).toHaveAttribute('aria-selected', 'true'); await apply(page); expect(await textGeometry(box(page))).toEqual(geometry); await expect(box(page)).toHaveCSS('padding', '0px'); const model = await stored(page); expect(model).toMatchObject({ opacity: 50, expandX: 40, expandY: 20, scaleX: 120, scaleY: 150, offsetX: 15, offsetY: -10 });
  const committed = await content(page); await open(page); await button(page, '重置效果').click(); await expect(background(preview(page))).toHaveCount(0); await button(page, '取消').click(); expect(await content(page)).toBe(committed);
  await open(page); await preset(page, '无背景').click(); await page.keyboard.press('Escape'); expect(await content(page)).toBe(committed);
  await open(page); await button(page, '重置效果').click(); await apply(page); await expect(background(box(page))).toHaveCount(0); expect(await textGeometry(box(page))).toEqual(geometry);
});
test('per-line backgrounds follow rich text and joined backgrounds fill line gaps without accumulating alpha', async ({ page }) => {
  await open(page); await preset(page, '逐行背景').click(); await field(page, '背景不透明度').fill('50'); await field(page, '垂直扩张').fill('0');
  await expect(background(preview(page)).locator('path')).toHaveCount(3);
  const point = await preview(page).evaluate(box => { const root = box.getBoundingClientRect(), a = box.querySelector('.row1')!.getBoundingClientRect(), b = box.querySelector('.row2')!.getBoundingClientRect(); const sx = root.width / (box as HTMLElement).offsetWidth, sy = root.height / (box as HTMLElement).offsetHeight; return { x: (a.left - root.left) / sx + 15, y: ((a.bottom + b.top) / 2 - root.top) / sy }; });
  expect((await pixels(background(preview(page)).locator('svg'), point)).gapAlpha).toBe(0);
  await dialog(page).getByRole('combobox', { name: '背景布局', exact: true }).selectOption('connected'); await expect(background(preview(page)).locator('path')).toHaveCount(1); const joined = await pixels(background(preview(page)).locator('svg'), point); expect(joined.gapAlpha).toBeGreaterThanOrEqual(127); expect(joined.maxAlpha).toBeLessThanOrEqual(128);
  await page.screenshot({ path: 'screenshots/text-background-connected.png' }); await apply(page); expect(await stored(page)).toMatchObject({ layout: 'connected', opacity: 50 });
  await box(page).dblclick(); await page.keyboard.press('End'); await page.keyboard.insertText('新增'); await page.keyboard.press('Escape'); await expect(box(page).locator('[data-text-source]')).toContainText('新增'); await expect(background(box(page)).locator('path')).toHaveCount(1);
});
test('legacy background preserves text padding; hidden parameters survive save/reload, delete/add reset defaults', async ({ page }) => {
  await page.evaluate(() => { const e = window.tinymce.activeEditor, box = e.getBody().querySelector<HTMLElement>('#background-text')!; e.dom.setStyles(box, { backgroundColor: 'rgba(10,20,30,0.4)', padding: '12px', borderRadius: '9px', boxSizing: 'border-box' }); e.dom.setAttrib(box, 'data-text-background', 'true'); e.dispatch('change'); });
  const geometry = await textGeometry(box(page)); await open(page); await expect(field(page, '背景颜色')).toHaveValue('#0a141e'); await expect(field(page, '背景不透明度')).toHaveValue('40'); await expect(field(page, '背景圆角')).toHaveValue('9');
  await button(page, '隐藏背景').click(); await apply(page); const hidden = await stored(page); expect(hidden).toMatchObject({ visible: false, color: '#0a141e', opacity: 40, radius: 9 }); expect(await textGeometry(box(page))).toEqual(geometry); await expect(box(page)).toHaveCSS('padding', '12px');
  await page.getByRole('button', { name: '保存文档', exact: true }).click(); await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized); expect(await stored(page)).toEqual(hidden); await expect(background(box(page))).toHaveCount(0);
  await open(page); await button(page, '显示背景').click(); await apply(page); expect(await textGeometry(box(page))).toEqual(geometry); await expect(background(box(page)).locator('g')).toHaveAttribute('opacity', '0.4');
  await open(page); await button(page, '删除背景').click(); await apply(page); await expect(box(page)).not.toHaveAttribute('data-text-background-settings'); await expect(box(page)).toHaveCSS('padding', '12px');
  await open(page); await button(page, '添加背景').click(); await expect(field(page, '背景不透明度')).toHaveValue('100'); await expect(field(page, '背景圆角')).toHaveValue('8'); await apply(page);
});
test('resize remeasures line backgrounds; duplication and clear format retain the independent background and source', async ({ page }) => {
  await open(page); await preset(page, '逐行背景').click(); await apply(page); const original = await stored(page); await expect(background(box(page)).locator('path')).toHaveCount(3);
  const handle = frame(page).locator('[data-text-resize="e"]'), bounds = (await handle.boundingBox())!; await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2); await page.mouse.down(); await page.mouse.move(bounds.x + bounds.width / 2 - 170, bounds.y + bounds.height / 2, { steps: 8 }); await page.mouse.up();
  expect(await background(box(page)).locator('path').count()).toBeGreaterThan(3); expect(await stored(page)).toEqual(original);
  await page.evaluate(() => window.tinymce.activeEditor.execCommand('RemoveFormat')); await expect(box(page).locator(':scope > [data-text-source]')).toHaveCount(1); await expect(background(box(page))).toHaveCount(1); expect(await stored(page)).toEqual(original);
  await page.evaluate(() => window.tinymce.activeEditor.execCommand('TextDuplicate')); const boxes = frame(page).locator('p > [data-text-draggable]'); await expect(boxes).toHaveCount(2); expect(await boxes.nth(1).getAttribute('data-text-background-settings')).toBe(await boxes.nth(0).getAttribute('data-text-background-settings'));
  await expect(boxes.nth(1).locator(':scope > [data-text-background-render]')).toHaveCount(1); await expect(boxes.nth(1).locator(':scope > [data-text-source]')).toContainText('BACKGROUND');
});
test('background composes with fill, shadow and curve and exports from preview as a standalone visible SVG', async ({ page }) => {
  await open(page); await preset(page, '胶囊背景').click(); await field(page, '背景不透明度').fill('60');
  await dialog(page).getByRole('tab', { name: '填充', exact: true }).click(); await dialog(page).getByRole('combobox', { name: '填充类型', exact: true }).selectOption('gradient');
  await dialog(page).getByRole('tab', { name: '外观', exact: true }).click(); await dialog(page).getByRole('tab', { name: '投影', exact: true }).click(); await button(page, '添加投影').click();
  await dialog(page).getByRole('tab', { name: '变形', exact: true }).click(); await dialog(page).getByRole('button', { name: '上拱', exact: true }).click(); await apply(page);
  await expect(box(page).locator('[data-text-render]')).toContainText('BACKGROUND'); await expect(background(box(page)).locator('path')).toHaveCount(1); await expect(box(page).locator('[data-text-shadow-layer]')).toHaveCount(1);
  await page.getByRole('button', { name: '保存文档', exact: true }).click(); await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized); await expect(background(box(page)).locator('g')).toHaveAttribute('opacity', '0.6');
  await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click(); await page.getByRole('button', { name: '导出', exact: true }).click(); const request = page.waitForEvent('download'); await page.getByRole('button', { name: 'HTML 文档', exact: true }).click(); const html = await readFile((await (await request).path())!, 'utf8');
  const standalone = await page.context().newPage(); await standalone.setContent(html); const exported = standalone.locator('#background-text'); await expect(background(exported)).toBeVisible(); await expect(background(exported)).toHaveCSS('z-index', '-1'); await expect(exported).toHaveCSS('isolation', 'isolate'); expect((await pixels(background(exported).locator('svg'))).colored).toBeGreaterThan(1000); await expect(exported.locator('[data-text-render] linearGradient')).toHaveCount(1); await standalone.close();
});
test('preset keyboard navigation, invalid drafts, visibility cancellation and narrow layout remain usable', async ({ page }) => {
  await open(page); const before = await content(page); await preset(page, '无背景').press('ArrowRight'); await expect(preset(page, '连体背景')).toHaveAttribute('aria-selected', 'true'); await preset(page, '连体背景').press('ArrowDown'); await expect(preset(page, '圆角背景')).toHaveAttribute('aria-selected', 'true');
  await field(page, '水平扩张').fill('101'); await button(page, '应用设置').click(); await expect(dialog(page).getByRole('alert')).toBeVisible(); expect(await content(page)).toBe(before); await field(page, '水平扩张').fill('10'); await field(page, '背景颜色').fill('url(https://example.com/x)'); await button(page, '应用设置').click(); await expect(dialog(page).getByRole('alert')).toContainText('颜色'); await field(page, '背景颜色').fill('#ff000080'); await expect(field(page, '背景不透明度')).toHaveValue('50');
  await button(page, '隐藏背景').click(); await expect(background(preview(page))).toHaveCount(0); await button(page, '取消').click(); expect(await content(page)).toBe(before);
  await page.setViewportSize({ width: 390, height: 844 }); await page.getByRole('button', { name: '收起直播弹幕', exact: true }).click(); await open(page); await preset(page, '云朵背景').click(); await expect(background(preview(page))).toBeVisible(); const bounds = (await dialog(page).boundingBox())!; expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.width).toBeLessThanOrEqual(390); await page.screenshot({ path: 'screenshots/text-background-mobile.png' }); await apply(page);
});
