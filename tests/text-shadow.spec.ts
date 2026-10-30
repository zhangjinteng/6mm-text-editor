import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import type { Editor } from 'tinymce';
import type { TextShadow } from '../src/text-shadow';
declare global { interface Window { tinymce: { activeEditor: Editor } } }
const box = (page: Page) => page.frameLocator('.tox-edit-area iframe').locator('#shadow-text');
const preview = (page: Page) => page.frameLocator('iframe[title="文字效果预览"]').locator('body > [data-text-draggable]');
const dialog = (page: Page) => page.getByRole('dialog', { name: '文字设置', exact: true });
const field = (page: Page, name: string) => dialog(page).getByRole('textbox', { name, exact: true });
const button = (page: Page, name: string) => dialog(page).getByRole('button', { name, exact: true });
async function open(page: Page) { await box(page).click(); await page.locator('.tox-pop:visible [data-mce-name="textsettings"]').click(); await dialog(page).getByRole('tab', { name: '投影', exact: true }).click(); }
const stored = async (page: Page): Promise<TextShadow | null> => JSON.parse((await box(page).getAttribute('data-text-shadow')) || 'null');
const content = (page: Page) => page.evaluate(() => window.tinymce.activeEditor.getContent());
async function apply(page: Page) { await button(page, '应用设置').click(); await expect(dialog(page)).toHaveCount(0); }
async function coordinates(page: Page) { await dialog(page).getByText('坐标偏移', { exact: true }).click(); }
test.beforeEach(async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => { const e = window.tinymce.activeEditor; e.setContent('<p><span id="shadow-text" data-text-draggable="true" style="position:absolute;left:120px;top:100px;width:360px;font:48px/1.5 Arial"><strong style="color:#147d64">投影设置</strong><br>SHADOW TEXT</span></p>'); e.undoManager.clear(); e.undoManager.add(); });
});
test('basic shadow adds color, independent opacity, polar offset and linked XY with isolated preview and atomic undo', async ({ page }) => {
  const before = await content(page); await open(page); await button(page, '添加投影').click();
  await expect(button(page, '投影设置')).toHaveAttribute('aria-expanded', 'true');
  await field(page, '投影颜色').fill('#336699'); await field(page, '投影不透明度').fill('35'); await field(page, '投影距离').fill('10'); await field(page, '投影角度').fill('90'); await field(page, '投影模糊度').fill('6');
  await expect(preview(page)).toHaveCSS('text-shadow', 'rgba(51, 102, 153, 0.35) 0px -10px 6px'); await expect(preview(page)).toHaveCSS('opacity', '1'); await expect(box(page)).toHaveCSS('text-shadow', 'none');
  expect(await content(page)).toBe(before); await coordinates(page); await expect(field(page, '水平偏移（px）')).toHaveValue('0'); await expect(field(page, '垂直偏移（px）')).toHaveValue('-10');
  await field(page, '水平偏移（px）').fill('3'); await field(page, '垂直偏移（px）').fill('4'); expect(Number(await field(page, '投影距离').inputValue())).toBeCloseTo(5, 3); expect(Number(await field(page, '投影角度').inputValue())).toBeCloseTo(-53.13, 2);
  await button(page, '隐藏投影').click(); await expect(preview(page)).toHaveCSS('text-shadow', 'none'); await button(page, '显示投影').click();
  await button(page, '收起投影设置').click(); await expect(field(page, '投影颜色')).toBeHidden(); await button(page, '投影设置').click(); await expect(field(page, '投影颜色')).toHaveValue('#336699');
  await page.screenshot({ path: 'screenshots/text-shadow-settings.png' }); await apply(page);
  expect(await stored(page)).toMatchObject({ color: '#336699', opacity: 35, distance: 5, visible: true }); await expect(box(page)).toHaveCSS('text-shadow', 'rgba(51, 102, 153, 0.35) 3px 4px 6px');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo()); expect(await content(page)).toBe(before); await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo()); await expect(box(page)).toHaveCSS('text-shadow', 'rgba(51, 102, 153, 0.35) 3px 4px 6px');
});
test('legacy CSS migrates, hiding preserves every parameter across reload, while delete removes and add restores defaults', async ({ page }) => {
  await page.evaluate(() => { const e = window.tinymce.activeEditor; e.dom.setStyle(e.getBody().querySelector('#shadow-text')!, 'textShadow', 'rgba(20,40,60,0.4) 3px -4px 9px'); e.dispatch('change'); });
  await open(page); await expect(field(page, '投影颜色')).toHaveValue('#14283c'); await expect(field(page, '投影不透明度')).toHaveValue('40'); await expect(field(page, '投影距离')).toHaveValue('5'); await expect(field(page, '投影模糊度')).toHaveValue('9');
  await button(page, '隐藏投影').click(); await expect(preview(page)).toHaveCSS('text-shadow', 'none'); await apply(page); const hidden = await stored(page); expect(hidden).toMatchObject({ visible: false, color: '#14283c', opacity: 40, distance: 5, blur: 9 });
  await page.getByRole('button', { name: '保存文档', exact: true }).click(); await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(box(page)).toHaveCSS('text-shadow', 'none'); expect(await stored(page)).toEqual(hidden); await open(page); await expect(field(page, '投影不透明度')).toHaveValue('40'); await button(page, '显示投影').click(); await apply(page); await expect(box(page)).toHaveCSS('text-shadow', 'rgba(20, 40, 60, 0.4) 3px -4px 9px');
  await open(page); await button(page, '删除投影').click(); await expect(button(page, '添加投影')).toBeVisible(); await apply(page); await expect(box(page)).not.toHaveAttribute('data-text-shadow'); await expect(box(page)).toHaveCSS('text-shadow', 'none');
  await open(page); await button(page, '添加投影').click(); await expect(field(page, '投影不透明度')).toHaveValue('50'); await expect(field(page, '投影距离')).toHaveValue('8'); await expect(field(page, '投影角度')).toHaveValue('-45'); await expect(field(page, '投影模糊度')).toHaveValue('4'); await apply(page);
});
test('direction dial supports presets, dragging, keyboard, zero distance and Escape without closing the modal', async ({ page }) => {
  await open(page); await button(page, '添加投影').click(); await field(page, '投影距离').fill('20'); await button(page, '设置投影方向').click();
  const dial = dialog(page).getByRole('slider', { name: '投影方向', exact: true }); await button(page, '向上投影').click(); await expect(field(page, '投影角度')).toHaveValue('90'); await expect(preview(page)).toHaveCSS('text-shadow', 'rgba(0, 0, 0, 0.5) 0px -20px 4px');
  const bounds = (await dial.boundingBox())!; await page.mouse.move(bounds.x + bounds.width * .85, bounds.y + bounds.height * .5); await page.mouse.down(); await page.mouse.move(bounds.x + bounds.width * .5, bounds.y + bounds.height * .85, { steps: 8 }); await page.mouse.up();
  expect(Number(await field(page, '投影角度').inputValue())).toBeCloseTo(-90, 0); await dial.press('Home'); await expect(field(page, '投影角度')).toHaveValue('0'); await dial.press('Shift+ArrowRight'); await expect(field(page, '投影角度')).toHaveValue('15');
  await field(page, '投影距离').fill('0'); await expect(preview(page)).toHaveCSS('text-shadow', 'rgba(0, 0, 0, 0.5) 0px 0px 4px'); await page.keyboard.press('Escape'); await expect(dial).toBeHidden(); await expect(dialog(page)).toBeVisible();
  await button(page, '设置投影方向').click(); await button(page, '向右下投影').click(); await field(page, '投影距离').fill('12');
  await page.screenshot({ path: 'screenshots/text-shadow-direction.png' }); await apply(page); expect(await stored(page)).toMatchObject({ distance: 12, angle: -45 });
});
test('invalid values never commit and cancel, Escape, delete and reset are draft-only', async ({ page }) => {
  const before = await content(page); await open(page); await button(page, '添加投影').click();
  for (const [label, value, valid] of [['投影不透明度', '101', '50'], ['投影距离', '-1', '8'], ['投影角度', '181', '-45'], ['投影模糊度', '', '4'], ['投影颜色', 'url(https://example.com/x)', '#000000']]) {
    await field(page, label!).fill(value!); await button(page, '应用设置').click(); await expect(dialog(page).getByRole('alert')).toBeVisible(); expect(await content(page)).toBe(before); await field(page, label!).fill(valid!);
  }
  await button(page, '取消').click(); expect(await content(page)).toBe(before);
  await open(page); await button(page, '添加投影').click(); await field(page, '投影颜色').fill('#ff000080'); await expect(field(page, '投影不透明度')).toHaveValue('50'); await apply(page); const committed = await content(page);
  await open(page); await button(page, '删除投影').click(); await page.keyboard.press('Escape'); expect(await content(page)).toBe(committed);
  await open(page); await button(page, '重置效果').click(); await expect(button(page, '添加投影')).toBeVisible(); await expect(preview(page)).toHaveCSS('text-shadow', 'none'); await button(page, '取消').click(); expect(await content(page)).toBe(committed);
  await open(page); await button(page, '重置效果').click(); await apply(page); await expect(box(page)).not.toHaveAttribute('data-text-shadow');
});
test('shadow alpha stays independent of filled curved text, duplicates and standalone HTML export', async ({ page }) => {
  await open(page); await button(page, '添加投影').click(); await field(page, '投影颜色').fill('#000000'); await field(page, '投影不透明度').fill('80'); await field(page, '投影距离').fill('15'); await field(page, '投影角度').fill('0'); await field(page, '投影模糊度').fill('0');
  await dialog(page).getByRole('tab', { name: '填充', exact: true }).click(); await dialog(page).getByRole('combobox', { name: '填充类型', exact: true }).selectOption('solid'); await field(page, '填充颜色').fill('#ff0000'); await field(page, '填充不透明度').fill('0');
  await dialog(page).getByRole('tab', { name: '变形', exact: true }).click(); await dialog(page).getByRole('button', { name: '上拱', exact: true }).click(); await apply(page);
  await expect(box(page).locator('[data-text-shadow-layer]')).toHaveAttribute('transform', 'translate(15 0)'); await expect(box(page).locator('[data-text-shadow-layer] text').first()).toHaveAttribute('fill', 'rgba(0, 0, 0, 0.8)');
  await page.evaluate(() => window.tinymce.activeEditor.execCommand('TextDuplicate')); const boxes = page.frameLocator('.tox-edit-area iframe').locator('p > [data-text-draggable]'); await expect(boxes).toHaveCount(2); expect(await boxes.nth(1).getAttribute('data-text-shadow')).toBe(await boxes.nth(0).getAttribute('data-text-shadow'));
  await page.getByRole('button', { name: '保存文档', exact: true }).click(); await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click(); await page.getByRole('button', { name: '导出', exact: true }).click(); const request = page.waitForEvent('download'); await page.getByRole('button', { name: 'HTML 文档', exact: true }).click();
  const html = await readFile((await (await request).path())!, 'utf8'); const standalone = await page.context().newPage(); await standalone.setContent(html); await expect(standalone.locator('[data-text-shadow-layer]')).toHaveCount(2); await expect(standalone.locator('[data-text-shadow-layer] text').first()).toHaveAttribute('fill', 'rgba(0, 0, 0, 0.8)');
  const pixels = await standalone.locator('#shadow-text svg').evaluate(async element => { const svg = element as SVGSVGElement; const image = new Image(); image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg)); await image.decode(); const canvas = document.createElement('canvas'); canvas.width = Number(svg.getAttribute('width')); canvas.height = Number(svg.getAttribute('height')); const ctx = canvas.getContext('2d')!; ctx.drawImage(image, 0, 0); const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data; let opaqueShadow = 0; for (let i = 0; i < data.length; i += 4) if (data[i]! < 10 && data[i+1]! < 10 && data[i+2]! < 10 && data[i+3]! > 195) opaqueShadow++; return opaqueShadow; }); expect(pixels).toBeGreaterThan(100); await standalone.close();
});
test('narrow modal keeps preview, shadow controls and direction actions usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: '收起直播弹幕', exact: true }).click();
  await page.evaluate(() => { const e = window.tinymce.activeEditor; const node = e.getBody().querySelector<HTMLElement>('#shadow-text')!; e.dom.setStyle(node, 'width', '220px'); e.dispatch('ResizeContent'); });
  await open(page); await button(page, '添加投影').click(); await field(page, '投影不透明度').fill('65'); await button(page, '设置投影方向').click(); await button(page, '向右下投影').click();
  await expect(preview(page)).toBeVisible(); const bounds = (await dialog(page).boundingBox())!; expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.width).toBeLessThanOrEqual(390); await page.screenshot({ path: 'screenshots/text-shadow-mobile.png' });
  await apply(page); expect(await stored(page)).toMatchObject({ opacity: 65, angle: -45 });
});
