import { expect, test, type Page } from '@playwright/test';
import type { Editor } from 'tinymce';
declare global { interface Window { tinymce: { activeEditor: Editor } } }
const box = (p: Page) => p.frameLocator('.tox-edit-area iframe').locator('#deform');
const dialog = (p: Page) => p.getByRole('dialog', { name: '文字设置', exact: true });
const preview = (p: Page) => p.frameLocator('iframe[title="文字效果预览"]').locator('body > [data-text-draggable]');
async function open(p: Page) { await box(p).click(); await p.locator('.tox-pop:visible [data-mce-name="textsettings"]').click(); await dialog(p).getByRole('tab', { name: '变形', exact: true }).click(); }
async function choose(p: Page, name: string) { await dialog(p).getByRole('button', { name, exact: true }).click(); }
async function apply(p: Page) { await dialog(p).getByRole('button', { name: '应用设置', exact: true }).click(); await expect(dialog(p)).toHaveCount(0); }
test.beforeEach(async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => { const e = window.tinymce.activeEditor; e.setContent('<p><span id="deform" data-text-draggable="true" style="position:absolute;left:100px;top:80px;width:420px;font-size:42px;line-height:1.4;font-family:Arial"><strong style="color:#147d64">文字变形</strong><em style="font-size:30px;color:#2563eb"> DESIGN</em><br>第二行 TEXT</span></p>'); e.undoManager.clear(); e.undoManager.add(); });
});
test('all path and envelope presets render actual geometry, preserve rich source and preview without committing', async ({ page, context }) => {
  const before = await page.evaluate(() => window.tinymce.activeEditor.getContent()); await open(page);
  await expect(dialog(page).getByRole('group', { name: '变形预设' }).getByRole('button')).toHaveCount(17);
  const gallery: { name: string; svg: string }[] = [];
  for (const name of ['上拱', '下弯', '圆形', '三角形', '矩形', '五边形', '心形', '自定义曲线', '拱带', '扇形', '内凹', '上凸', '下凸', '鼓起', '倾斜', '波浪']) {
    await choose(page, name);
    await expect(dialog(page).getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'true');
    const svg = preview(page).locator(':scope > [data-text-render] > svg'); await expect(svg).toBeVisible();
    if (['拱带', '扇形', '内凹', '上凸', '下凸', '鼓起', '倾斜', '波浪'].includes(name)) {
      await expect(svg).toHaveAttribute('data-text-warp', /.+/); expect(await svg.locator('path[data-text-glyph]').count()).toBeGreaterThan(1);
      const contours = await svg.locator('path[data-text-glyph]').evaluateAll(nodes => nodes.map(n => n.getAttribute('d'))); expect(new Set(contours).size).toBeGreaterThan(1); await expect(svg.locator('use')).toHaveCount(0);
    } else { expect(await svg.locator('textPath').count()).toBeGreaterThanOrEqual(2); await expect(svg.locator('tspan[font-style="italic"]').first()).toHaveAttribute('fill', 'rgb(37, 99, 235)'); }
    const markup = await svg.evaluate(el => new XMLSerializer().serializeToString(el)); gallery.push({ name, svg: markup });
    const pixels = await svg.evaluate(async el => { const copy = el.cloneNode(true) as SVGSVGElement; copy.style.cssText = ''; const image = new Image(); image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(copy)); await image.decode(); const c = document.createElement('canvas'); c.width = Number(copy.getAttribute('width')); c.height = Number(copy.getAttribute('height')); const ctx = c.getContext('2d')!; ctx.drawImage(image, 0, 0); const data = ctx.getImageData(0, 0, c.width, c.height).data; let count = 0, solid = 0; for (let i = 3; i < data.length; i += 4) { if (data[i]! > 100) count++; if (data[i]! > 250) solid++; } return { count, solid }; });
    expect(pixels.count, name).toBeGreaterThan(500); expect(pixels.solid, name).toBeGreaterThan(100);
  }
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await page.screenshot({ path: 'screenshots/text-deform-dialog.png' });
  const sheet = await context.newPage(); await sheet.setViewportSize({ width: 1440, height: 1300 });
  await sheet.setContent('<style>body{margin:0;background:#f3f6f4;font:14px sans-serif;padding:24px}main{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}figure{margin:0;background:white;border:1px solid #d8e3dd;border-radius:8px;padding:12px;height:260px;display:flex;align-items:center;justify-content:center;flex-direction:column}svg{width:100%;height:225px;overflow:visible}figcaption{color:#365b46}</style><main>' + gallery.map(item => '<figure>' + item.svg + '<figcaption>' + item.name + '</figcaption></figure>').join('') + '</main>');
  await sheet.screenshot({ path: 'screenshots/text-deform-gallery.png', fullPage: true }); await sheet.close();
  await dialog(page).getByRole('button', { name: '取消', exact: true }).click(); expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
});
test('path parameters, mixed styles, multiline, custom controls and one-step undo survive reload and static preview', async ({ page }) => {
  await open(page); await choose(page, '圆形');
  await dialog(page).getByRole('textbox', { name: '路径半径', exact: true }).fill('160');
  await dialog(page).getByRole('textbox', { name: '起始角度', exact: true }).fill('35');
  await dialog(page).getByRole('checkbox', { name: '反向排列', exact: true }).check();
  await dialog(page).getByRole('combobox', { name: '路径适配', exact: true }).selectOption('spacing');
  await expect(preview(page).locator('textPath')).toHaveCount(2); await apply(page);
  const saved = await box(page).getAttribute('data-text-deform');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo()); await expect(box(page)).not.toHaveAttribute('data-text-deform');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo()); await expect(box(page)).toHaveAttribute('data-text-deform', saved!);
  await page.getByRole('button', { name: '保存文档', exact: true }).click(); await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(box(page).locator('tspan[font-style="italic"]').first()).toHaveAttribute('font-size', '30px');
  await open(page); await choose(page, '自定义曲线');
  const handle = dialog(page).getByRole('slider', { name: '起始控制点', exact: true }); await handle.focus(); await handle.press('ArrowRight'); await expect(handle).toHaveAttribute('cx', '26');
  const beforePath = await preview(page).locator('defs > path').first().getAttribute('d');
  const handle2 = dialog(page).getByRole('slider', { name: '结束控制点', exact: true }); await handle2.scrollIntoViewIfNeeded(); const r = (await handle2.boundingBox())!;
  await page.mouse.move(r.x + r.width / 2, r.y + r.height / 2); await page.mouse.down(); await page.mouse.move(r.x - 20, r.y - 30, { steps: 5 }); await page.mouse.up();
  expect(await preview(page).locator('defs > path').first().getAttribute('d')).not.toBe(beforePath); await apply(page);
  await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  await expect(page.frameLocator('iframe[title="文档预览"]').locator('#deform textPath')).toHaveCount(2);
});
test('warp composes with fill and stroke, persists glyph contours, edits text and restores source', async ({ page }) => {
  await open(page); await choose(page, '波浪'); await dialog(page).getByRole('textbox', { name: '变形程度', exact: true }).fill('-75');
  await dialog(page).getByRole('tab', { name: '外观', exact: true }).click(); await dialog(page).getByRole('tab', { name: '描边', exact: true }).click();
  await dialog(page).getByRole('checkbox', { name: '启用文字描边', exact: true }).check(); await dialog(page).getByRole('textbox', { name: '描边宽度（0—10 px）', exact: true }).fill('3');
  await apply(page); await expect(box(page).locator('[data-text-warp]')).toHaveAttribute('data-text-warp', 'flag');
  await box(page).dblclick(); await expect(box(page).locator('[data-text-source]')).toBeVisible(); await page.keyboard.press('End'); await page.keyboard.insertText('新增'); await page.keyboard.press('Escape'); await expect(box(page).locator('[data-text-source]')).toContainText('新增');
  await page.getByRole('button', { name: '保存文档', exact: true }).click(); await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  expect(await box(page).locator('path[data-text-glyph]').count()).toBeGreaterThan(1); await expect(box(page).locator('[data-text-stroke-layer]')).toHaveCount(1);
  await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click(); await expect(page.frameLocator('iframe[title="文档预览"]').locator('#deform [data-text-warp]')).toHaveCount(1);
  await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '编辑', exact: true }).click();
  await open(page); await choose(page, '无变形'); await apply(page); await expect(box(page)).not.toHaveAttribute('data-text-curve'); await expect(box(page).locator('[data-text-source] br')).toHaveCount(1); await expect(box(page).locator('[data-text-source] em')).toHaveCSS('font-size', '30px');
});
test('invalid settings cannot apply; narrow dialog keeps preset selection and cancel usable', async ({ page }) => {
  await open(page); await page.setViewportSize({ width: 390, height: 844 }); await choose(page, '上拱');
  const original = await page.evaluate(() => window.tinymce.activeEditor.getContent()); await dialog(page).getByRole('textbox', { name: '路径半径', exact: true }).fill('-1'); await dialog(page).getByRole('button', { name: '应用设置', exact: true }).click(); await expect(dialog(page).getByRole('alert')).toBeVisible(); expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(original);
  await page.keyboard.press('Escape'); await expect(dialog(page)).toHaveCount(0); expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(original);
});

test('deformed glyph contours preserve translucent fill alpha without seams', async ({ page }) => {
  await open(page); await choose(page, '下凸');
  await dialog(page).getByRole('tab', { name: '填充', exact: true }).click();
  await dialog(page).getByRole('combobox', { name: '填充类型', exact: true }).selectOption('solid');
  await dialog(page).getByRole('textbox', { name: '填充颜色', exact: true }).fill('#000000');
  await dialog(page).getByRole('textbox', { name: '填充不透明度', exact: true }).fill('50');
  const pixels = await preview(page).locator(':scope > [data-text-render] > svg').evaluate(async el => {
    const copy = el.cloneNode(true) as SVGSVGElement; copy.style.cssText = ''; const image = new Image(); image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(copy)); await image.decode();
    const c = document.createElement('canvas'); c.width = Number(copy.getAttribute('width')); c.height = Number(copy.getAttribute('height')); const ctx = c.getContext('2d')!; ctx.drawImage(image, 0, 0); const pixels = ctx.getImageData(0, 0, c.width, c.height).data;
    let max = 0, count = 0; for (let i = 3; i < pixels.length; i += 4) { max = Math.max(max, pixels[i]!); if (pixels[i]! > 100) count++; } return { max, count };
  });
  expect(pixels.max).toBeLessThanOrEqual(130); expect(pixels.count).toBeGreaterThan(500);
});
