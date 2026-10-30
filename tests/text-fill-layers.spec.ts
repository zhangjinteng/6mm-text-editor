import { expect, test, type Page, type Locator } from '@playwright/test';
import type { Editor } from 'tinymce';
import { readFile } from 'node:fs/promises';
import type { FillLayer } from '../src/text-fill';
declare global { interface Window { tinymce: { activeEditor: Editor } } }
const box = (p: Page) => p.frameLocator('.tox-edit-area iframe').locator('#fill-text');
const preview = (p: Page) => p.frameLocator('iframe[title="文字效果预览"]').locator('body > [data-text-draggable]');
const d = (p: Page) => p.getByRole('dialog', { name: '文字设置', exact: true });
async function open(p: Page) { await box(p).click(); await p.locator('.tox-pop:visible [data-mce-name="textsettings"]').click(); await d(p).getByRole('tab', { name: '填充', exact: true }).click(); }
const field = (p: Page, name: string) => d(p).getByRole('textbox', { name, exact: true });
const button = (p: Page, name: string) => d(p).getByRole('button', { name, exact: true });
const mode = (p: Page, value: string) => d(p).getByRole('combobox', { name: '填充类型', exact: true }).selectOption(value);
const apply = (p: Page) => button(p, '应用设置').click();
async function saved(p: Page): Promise<FillLayer[]> { return JSON.parse((await box(p).getAttribute('data-text-fills'))!); }
async function pixels(svg: Locator) {
  return svg.evaluate(async element => {
    const copy = element.cloneNode(true) as SVGSVGElement; copy.style.cssText = '';
    const image = new Image(); image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(copy)); await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = Number(copy.getAttribute('width')); canvas.height = Number(copy.getAttribute('height'));
    const ctx = canvas.getContext('2d')!; ctx.drawImage(image, 0, 0); const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let purple = 0, redHalf = 0, blue = 0, black = 0, visible = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]!, g = data[i + 1]!, b = data[i + 2]!, a = data[i + 3]!;
      if (a > 30) visible++;
      if (a > 240 && r > 110 && r < 145 && b > 110 && b < 145 && g < 10) purple++;
      if (a > 115 && a < 140 && r > 240 && g < 10 && b < 10) redHalf++;
      if (a > 240 && b > 240 && r < 10 && g < 10) blue++;
      if (a > 240 && r < 10 && g < 10 && b < 10) black++;
    }
    return { purple, redHalf, blue, black, visible };
  });
}
test.beforeEach(async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => { const e = window.tinymce.activeEditor; e.setContent('<p><span id="fill-text" data-text-draggable="true" style="position:absolute;left:100px;top:90px;width:360px;font:64px/1.4 Arial"><strong style="color:#000">FILL Aa</strong><br><em style="color:#147d64">测试文字</em></span></p>'); e.undoManager.clear(); e.undoManager.add(); });
});
test('fill opacity composites real glyph pixels; visibility, order and no-fill preserve strokes and source', async ({ page }) => {
  const before = await page.evaluate(() => window.tinymce.activeEditor.getContent()); await open(page);
  await mode(page, 'solid'); await field(page, '填充颜色').fill('#0000ff');
  await button(page, '添加填充').click(); await field(page, '填充颜色').fill('#ff0000'); await field(page, '填充不透明度').fill('50');
  expect((await pixels(preview(page).locator(':scope > [data-text-render] svg'))).purple).toBeGreaterThan(500);
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await button(page, '隐藏填充 1').click(); expect((await pixels(preview(page).locator(':scope > [data-text-render] svg'))).blue).toBeGreaterThan(500);
  await button(page, '显示填充 1').click(); await button(page, '下移填充 1').click(); expect((await pixels(preview(page).locator(':scope > [data-text-render] svg'))).blue).toBeGreaterThan(500);
  await button(page, '上移填充 2').click(); await button(page, '删除填充 2').click();
  expect((await pixels(preview(page).locator(':scope > [data-text-render] svg'))).redHalf).toBeGreaterThan(500);
  await d(page).getByRole('tab', { name: '外观', exact: true }).click(); await d(page).getByRole('tab', { name: '描边', exact: true }).click(); await d(page).getByRole('checkbox', { name: '启用文字描边', exact: true }).check();
  await field(page, '描边宽度（0—10 px）').fill('3'); await d(page).getByRole('combobox', { name: '描边位置', exact: true }).selectOption('outside');
  const composed = await pixels(preview(page).locator(':scope > [data-text-render] svg')); expect(composed.redHalf).toBeGreaterThan(500); expect(composed.black).toBeGreaterThan(100);
  await d(page).getByRole('tab', { name: '背景', exact: true }).click(); await button(page, '添加背景').click(); await field(page, '背景颜色').fill('#eeeeee');
  await apply(page); await expect(box(page)).toHaveCSS('opacity', '1'); await expect(box(page).locator('[data-text-background-render] path')).toHaveAttribute('fill', '#eeeeee');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo()); expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo()); await open(page); await mode(page, 'empty');
  expect((await pixels(preview(page).locator(':scope > [data-text-render] svg'))).redHalf).toBe(0); expect((await pixels(preview(page).locator(':scope > [data-text-render] svg'))).black).toBeGreaterThan(100);
  await apply(page); await expect(box(page).locator('[data-text-fill-layer]')).toHaveCount(0); await expect(box(page).locator('[data-text-stroke-layer]')).toHaveCount(1);
  await open(page); await button(page, '删除填充 1').click(); await expect(d(page).getByRole('combobox', { name: '填充类型', exact: true })).toHaveCount(0); await apply(page);
  expect(await saved(page)).toEqual([]); await expect(box(page).locator('[data-text-source] strong')).toHaveText('FILL Aa');
});
test('multi-stop gradients support alpha, drag, keyboard, radial geometry and independent layer settings', async ({ page }) => {
  await open(page); await mode(page, 'gradient'); await field(page, '色标颜色').fill('#ff0000');
  await d(page).getByRole('slider', { name: '渐变色标 2', exact: true }).click(); await field(page, '色标颜色').fill('#0000ff');
  await button(page, '添加色标').click(); await field(page, '色标颜色').fill('#ffff00'); await field(page, '色标位置').fill('30'); await field(page, '色标不透明度').fill('40');
  const marker = d(page).getByRole('slider', { name: '渐变色标 3', exact: true }); await marker.press('Shift+ArrowRight'); await expect(marker).toHaveAttribute('aria-valuenow', '40');
  const track = (await d(page).locator('.text-fill-stop-track').boundingBox())!; const handle = (await marker.boundingBox())!;
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2); await page.mouse.down(); await page.mouse.move(track.x + track.width * .65, handle.y + handle.height / 2, { steps: 6 }); await page.mouse.up();
  expect(Number(await marker.getAttribute('aria-valuenow'))).toBeCloseTo(65, 0);
  await d(page).getByRole('combobox', { name: '渐变类型', exact: true }).selectOption('radial'); await field(page, '渐变中心 X').fill('30'); await field(page, '渐变中心 Y').fill('60'); await field(page, '渐变范围').fill('80');
  await expect(preview(page).locator('radialGradient stop')).toHaveCount(3); await expect(preview(page).locator('radialGradient stop').nth(1)).toHaveAttribute('stop-opacity', '0.4');
  await button(page, '添加填充').scrollIntoViewIfNeeded(); await page.screenshot({ path: 'screenshots/text-fill-gradient.png' });
  await button(page, '添加填充').click(); await field(page, '填充颜色').fill('#ffffff'); await field(page, '填充不透明度').fill('15'); await button(page, '隐藏填充 1').click(); await button(page, '编辑填充 2').click();
  await expect(d(page).getByRole('combobox', { name: '渐变类型', exact: true })).toHaveValue('radial'); await expect(field(page, '渐变中心 X')).toHaveValue('30');
  await apply(page); const layers = await saved(page); expect(layers).toHaveLength(2); expect(layers[0]!.visible).toBe(false); expect(layers[1]!.stops).toHaveLength(3);
  await page.getByRole('button', { name: '保存文档', exact: true }).click(); await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  expect(await saved(page)).toEqual(layers); await expect(box(page).locator('radialGradient stop')).toHaveCount(3);
  await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  const exported = page.frameLocator('iframe[title="文档预览"]').locator('#fill-text'); await expect(exported.locator('radialGradient')).toHaveAttribute('cx', '108'); await expect(exported.locator('stop').nth(1)).toHaveAttribute('stop-opacity', '0.4');
  await page.getByRole('button', { name: '导出', exact: true }).click(); const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'HTML 文档', exact: true }).click();
  const html = await readFile((await (await download).path())!, 'utf8');
  const standalone = await page.context().newPage(); await standalone.setContent(html);
  await expect(standalone.locator('#fill-text [data-text-source]')).toBeHidden(); await expect(standalone.locator('script')).toHaveCount(0);
  await expect(standalone.locator('radialGradient')).toHaveAttribute('gradientUnits', 'userSpaceOnUse');
  expect((await pixels(standalone.locator('#fill-text svg'))).visible).toBeGreaterThan(500); await standalone.close();

});
test('image placement, rotation, scaling and tiling paint pixels and survive reload and curved rendering', async ({ page }) => {
  const uri = await page.evaluate(() => { const c = document.createElement('canvas'); c.width = c.height = 64; const ctx = c.getContext('2d')!; ctx.fillStyle = 'red'; ctx.fillRect(0, 0, 32, 64); ctx.fillStyle = 'blue'; ctx.fillRect(32, 0, 32, 64); return c.toDataURL(); });
  await open(page); await mode(page, 'image'); const chooser = page.waitForEvent('filechooser'); await button(page, '选择本地图片').click(); await (await chooser).setFiles({ name: 'texture.png', mimeType: 'image/png', buffer: Buffer.from(uri.split(',')[1]!, 'base64') });
  await expect(field(page, '图片地址（HTTPS 或本地上传）')).toHaveValue(/^data:image/);
  await field(page, '图片缩放').fill('40'); await field(page, '图片水平偏移').fill('20'); await field(page, '图片垂直偏移').fill('-10'); await field(page, '图片旋转').fill('30');
  await expect(preview(page).locator('pattern image')).toHaveAttribute('transform', /rotate\(30 /);
  const cropped = await pixels(preview(page).locator(':scope > [data-text-render] svg')); await d(page).getByRole('checkbox', { name: '平铺图片', exact: true }).check();
  await expect(preview(page).locator('pattern')).toHaveAttribute('patternTransform', /rotate\(30 /);
  const tiled = await pixels(preview(page).locator(':scope > [data-text-render] svg')); expect(tiled.visible).toBeGreaterThan(cropped.visible * 1.3);
  await d(page).getByRole('combobox', { name: '图片适配', exact: true }).selectOption('contain'); await expect(preview(page).locator('pattern image')).toHaveAttribute('preserveAspectRatio', 'xMidYMid meet');
  await d(page).getByRole('tab', { name: '变形', exact: true }).click(); await d(page).getByRole('button', { name: '上拱', exact: true }).click(); await apply(page); await expect(d(page)).toHaveCount(0);
  const layers = await saved(page); expect(layers[0]).toMatchObject({ scale: 40, offsetX: 20, offsetY: -10, rotation: 30, repeat: true, fit: 'contain' });
  await expect(box(page).locator('textPath')).toHaveText(['FILL Aa', '测试文字']); await expect(box(page).locator('pattern')).toHaveAttribute('patternTransform', /rotate\(30 /);
  await page.getByRole('button', { name: '保存文档', exact: true }).click(); await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  expect(await saved(page)).toEqual(layers); await expect(box(page).locator('pattern')).toHaveAttribute('patternTransform', /rotate\(30 /);
  await open(page); await button(page, '重置图片位置').click(); await expect(field(page, '图片缩放')).toHaveValue('100'); await expect(field(page, '图片旋转')).toHaveValue('0'); await expect(d(page).getByRole('checkbox', { name: '平铺图片', exact: true })).not.toBeChecked(); await button(page, '取消').click(); expect(await saved(page)).toEqual(layers);
});
test('invalid input and failed image loads never commit; hidden incomplete fills and narrow screens remain editable', async ({ page }) => {
  const before = await page.evaluate(() => window.tinymce.activeEditor.getContent()); await open(page); await mode(page, 'gradient'); await field(page, '色标位置').fill('120'); await apply(page); await expect(d(page).getByRole('alert')).toBeVisible(); expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await field(page, '色标位置').fill('0'); await mode(page, 'image'); await field(page, '图片地址（HTTPS 或本地上传）').fill('javascript:alert(1)'); await apply(page); await expect(d(page).getByRole('alert')).toContainText('HTTPS');
  await page.route('https://example.com/no-image.png', route => route.abort()); await field(page, '图片地址（HTTPS 或本地上传）').fill('https://example.com/no-image.png'); await apply(page); await expect(d(page).getByRole('alert')).toContainText('加载失败'); expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await field(page, '图片地址（HTTPS 或本地上传）').fill(''); await button(page, '隐藏填充 1').click(); await apply(page); expect((await saved(page))[0]!.visible).toBe(false);
  await open(page); await page.setViewportSize({ width: 390, height: 844 }); await button(page, '添加填充').click(); await mode(page, 'gradient'); await button(page, '添加色标').click(); await field(page, '色标颜色').fill('#ffcc33');
  const bounds = (await d(page).boundingBox())!; expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.width).toBeLessThanOrEqual(390); await button(page, '添加填充').scrollIntoViewIfNeeded(); await page.screenshot({ path: 'screenshots/text-fill-mobile.png' });
  await button(page, '取消').click(); expect((await saved(page))).toHaveLength(1);
});

test('fill alpha leaves shadow opaque, and multilayer text remains editable, formattable and independently duplicable', async ({ page }) => {
  await open(page); await mode(page, 'solid'); await field(page, '填充颜色').fill('#ff0000'); await field(page, '填充不透明度').fill('0');
  await d(page).getByRole('tab', { name: '外观', exact: true }).click(); await d(page).getByRole('tab', { name: '投影', exact: true }).click(); await button(page, '添加投影').click();await field(page, '投影不透明度').fill('100');await d(page).getByText('坐标偏移', { exact: true }).click();
  await field(page, '投影颜色').fill('#000000'); await field(page, '水平偏移（px）').fill('30'); await field(page, '垂直偏移（px）').fill('0'); await field(page, '投影模糊度').fill('0');
  expect((await pixels(preview(page).locator(':scope > [data-text-render] svg'))).black).toBeGreaterThan(500); await expect(preview(page).locator('[data-text-shadow-layer]')).toHaveAttribute('transform', 'translate(30 0)');
  await d(page).getByRole('tab', { name: '填充', exact: true }).click(); await field(page, '填充不透明度').fill('50'); await button(page, '添加填充').click(); await mode(page, 'gradient'); await field(page, '填充不透明度').fill('40'); await apply(page);
  await box(page).dblclick(); await expect(box(page).locator('[data-text-source]')).toBeVisible(); await page.keyboard.press('End'); await page.keyboard.insertText('新增'); await page.keyboard.press('Escape'); await expect(box(page).locator('[data-text-fill-layer]').first()).toContainText('新增');
  await page.evaluate(() => window.tinymce.activeEditor.execCommand('FontSize', false, '48px')); const runs = box(page).locator('[data-text-fill-layer] text');
  for (const node of await runs.all()) await expect(node).toHaveAttribute('font-size', '48px');
  await page.evaluate(() => window.tinymce.activeEditor.execCommand('TextDuplicate')); const boxes = page.frameLocator('.tox-edit-area iframe').locator('p > [data-text-draggable]'); await expect(boxes).toHaveCount(2);
  const ids = await boxes.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-text-render-id'))); expect(new Set(ids).size).toBe(2);
  for (let i = 0; i < 2; i++) { await expect(boxes.nth(i).locator('linearGradient')).toHaveAttribute('id', `${ids[i]}-fill-0`); await expect(boxes.nth(i).locator('[data-text-shadow-layer]')).toHaveAttribute('transform', 'translate(30 0)'); }
});

test('an outdated image validation cannot apply a newer draft or block reset', async ({ page }) => {
  let release: (() => void) | undefined;
  await page.route('https://example.com/slow.png', async route => { await new Promise<void>(resolve => { release = resolve; }); await route.abort(); });
  await open(page); await mode(page, 'image'); await field(page, '图片地址（HTTPS 或本地上传）').fill('https://example.com/slow.png'); await apply(page);
  await expect(button(page, '检查图片…')).toBeDisabled();
  await button(page, '重置效果').click(); await expect(button(page, '应用设置')).toBeEnabled(); await mode(page, 'solid'); await field(page, '填充颜色').fill('#112233');
  release?.(); await apply(page); await expect(d(page)).toHaveCount(0); expect((await saved(page))[0]!.color).toBe('#112233');
});
