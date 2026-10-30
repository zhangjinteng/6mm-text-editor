import { expect, test, type Page } from '@playwright/test';
import type { Editor } from 'tinymce';
declare global { interface Window { tinymce: { activeEditor: Editor } } }
const frame = (page: Page) => page.frameLocator('.tox-edit-area iframe');
const box = (page: Page) => frame(page).locator('#stroke');
async function tool(page: Page, name: string) {
  if (['textappearance', 'textcurve'].includes(name)) {
    await page.locator('.tox-pop:visible [data-mce-name="textsettings"]').click();
    if (name === 'textcurve') await page.getByRole('dialog', { name: '文字设置', exact: true }).getByRole('tab', { name: '变形', exact: true }).click();
    return;
  }
  if (name === 'textappearance' || name === 'textcurve') {
    await page.evaluate(tab => window.tinymce.activeEditor.execCommand('TextSettings', false, tab), name === 'textcurve' ? 'curve' : 'appearance'); return;
  }
  const panel = page.locator('[data-toolbar-group="textgroupobject"]');
  if (!await panel.isVisible()) await page.locator('.tox-pop:visible [data-mce-name="textgroupobject"]').click();
  await panel.locator(`[data-mce-name="${name}"]`).click();
}
async function appearance(page: Page) {
  await tool(page, 'textappearance');
  const dialog = page.getByRole('dialog', { name: '文字设置', exact: true });
  await dialog.getByRole('tab', { name: '描边', exact: true }).click(); return dialog;
}
async function stroke(page: Page, position: string, join: string, enabled = true) {
  const dialog = await appearance(page);
  const checked = await box(page).getAttribute('data-text-stroke-enabled') === 'true';
  if (checked !== enabled) await dialog.getByText('启用文字描边', { exact: true }).click();
  await dialog.getByRole('textbox', { name: '描边宽度（0—10 px）', exact: true }).fill('4');
  await dialog.getByRole('textbox', { name: '描边颜色', exact: true }).fill('#ef4444');
  await dialog.getByRole('combobox', { name: '描边位置', exact: true }).selectOption(position);
  await dialog.getByRole('combobox', { name: '拐角', exact: true }).selectOption(join);
  await dialog.getByRole('button', { name: '应用设置', exact: true }).click();
}
test.beforeEach(async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    e.setContent('<p><span id="stroke" data-text-draggable="true" style="position:absolute;left:120px;top:100px;width:320px;font-size:48px;font-family:Arial;line-height:1.5"><strong style="color:#147d64">AM文字描边</strong><br><em style="color:#2563eb">Wrap text sample</em></span></p>');
    e.undoManager.clear(); e.undoManager.add();
  }); await box(page).click();
});
test('positions and joins use shared SVG glyph masks and preserve rich multiline layout', async ({ page }) => {
  const before = await box(page).boundingBox();
  for (const [position, join, width] of [['inside', 'miter', '8'], ['center', 'bevel', '4'], ['outside', 'round', '8']]) {
    await stroke(page, position!, join!);
    const outline = box(page).locator('[data-text-stroke-layer]');
    await expect(outline).toHaveAttribute('stroke-width', width!);
    await expect(outline).toHaveAttribute('stroke-linejoin', join!);
    await expect(box(page).locator('mask')).toHaveCount(position === 'center' ? 0 : 1);
    await expect(box(page)).toHaveCSS('-webkit-text-stroke-width', '0px');
    const after = (await box(page).boundingBox())!;
    expect(after.width).toBeCloseTo(before!.width, 0); expect(after.height).toBeCloseTo(before!.height, 0);
    const runs = box(page).locator('svg > g:not([data-text-stroke-layer]) > text');
    expect(await runs.count()).toBeGreaterThanOrEqual(2);
    await expect(runs.first()).toHaveAttribute('fill', 'rgb(20, 125, 100)');
  }
  await page.screenshot({ path: 'screenshots/text-stroke.png' });
  await box(page).dblclick(); await expect(box(page).locator('[data-text-source]')).toBeVisible();
  await page.keyboard.press('End'); await page.keyboard.insertText('新增'); await page.keyboard.press('Escape');
  await expect(box(page).locator('svg > g:not([data-text-stroke-layer])')).toContainText('新增');
  await page.evaluate(() => window.tinymce.activeEditor.execCommand('FontSize', false, '56px'));
  await expect(box(page).locator('svg > g:not([data-text-stroke-layer]) > text').first()).toHaveAttribute('font-size', '56px');
});
test('visibility retains settings; undo, reload, duplicate and static preview retain SVG', async ({ page }) => {
  await stroke(page, 'outside', 'round');
  await stroke(page, 'outside', 'round', false);
  await expect(box(page).locator('svg')).toHaveCount(0);
  const dialog = await appearance(page);
  await expect(dialog.getByRole('textbox', { name: '描边宽度（0—10 px）', exact: true })).toHaveValue('4');
  await dialog.getByRole('button', { name: '取消', exact: true }).click();
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  await expect(box(page).locator('[data-text-stroke-layer]')).toHaveCount(1);
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(box(page).locator('[data-text-stroke-layer]')).toHaveAttribute('stroke-linejoin', 'round');
  const id = await box(page).getAttribute('data-text-render-id');
  await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  const preview = page.frameLocator('iframe[title="文档预览"]').locator('#stroke');
  await expect(preview.locator('mask')).toHaveAttribute('id', `${id}-stroke-mask`);
  await expect(preview.locator('[data-text-stroke-layer]')).toHaveAttribute('mask', `url(#${id}-stroke-mask)`);
  await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '编辑', exact: true }).click();
  await box(page).click(); await tool(page, 'textduplicate');
  const ids = await frame(page).locator('[data-text-draggable]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-text-render-id')));
  expect(ids.length).toBe(2); expect(new Set(ids).size).toBe(2);
});
test('curve uses identical position and join semantics and returns to straight SVG', async ({ page }) => {
  await stroke(page, 'inside', 'bevel'); await tool(page, 'textcurve');
  const dialog = page.getByRole('dialog', { name: '文字设置', exact: true });
  await dialog.getByRole('button', { name: '上拱', exact: true }).click();
  await dialog.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(box(page).locator('svg > g[data-text-stroke-layer]')).toHaveAttribute('stroke-width', '8');
  await expect(box(page).locator('svg > g[data-text-stroke-layer]')).toHaveAttribute('stroke-linejoin', 'bevel');
  await tool(page, 'textcurve');
  const again = page.getByRole('dialog', { name: '文字设置', exact: true });
  await again.getByRole('button', { name: '无变形', exact: true }).click();
  await again.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(box(page).locator('svg > g[data-text-stroke-layer]')).toHaveAttribute('stroke-width', '8');
});
test('legacy CSS strokes migrate to SVG and invalid/cancelled changes do not mutate content', async ({ page }) => {
  await page.evaluate(() => { const e = window.tinymce.activeEditor; const b = e.getBody().querySelector<HTMLElement>('#stroke')!; b.style.webkitTextStroke = '3px #ef4444'; e.dispatch('change'); });
  await expect(box(page).locator('[data-text-stroke-layer]')).toHaveAttribute('stroke-width', '3');
  const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  const dialog = await appearance(page);
  await dialog.getByRole('textbox', { name: '描边宽度（0—10 px）', exact: true }).fill('11');
  await dialog.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await dialog.getByRole('button', { name: '取消', exact: true }).click();
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
});

test('rasterized straight and curved SVG places stroke pixels on the requested side of glyphs', async ({ page }) => {
  for (const curved of [false, true]) {
    if (curved) {
      await tool(page, 'textcurve');
      const d = page.getByRole('dialog', { name: '文字设置', exact: true });
      await d.getByRole('button', { name: '上拱', exact: true }).click();
      await d.getByRole('button', { name: '应用设置', exact: true }).click();
    }
    for (const position of ['inside', 'center', 'outside']) {
      await stroke(page, position, 'round');
      const pixels = await box(page).locator('svg').evaluate(async element => {
        const svg = element as SVGSVGElement;
        async function raster(bare: boolean) {
          const copy = svg.cloneNode(true) as SVGSVGElement;
          const w = Number(svg.getAttribute('width')); const h = Number(svg.getAttribute('height'));
          copy.setAttribute('viewBox', `-20 -20 ${w + 40} ${h + 40}`);
          copy.setAttribute('width', String(w + 40)); copy.setAttribute('height', String(h + 40));
          copy.style.cssText = '';
          if (bare) { copy.querySelector('[data-text-stroke-layer]')?.remove(); copy.querySelectorAll('text').forEach(text => text.setAttribute('fill', 'black')); }
          const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(copy)); await img.decode();
          const canvas = document.createElement('canvas'); canvas.width = Math.ceil(w + 40); canvas.height = Math.ceil(h + 40);
          const ctx = canvas.getContext('2d')!; ctx.drawImage(img, 0, 0); return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        }
        const base = await raster(true); const painted = await raster(false);
        let red = 0; let inside = 0; let outside = 0; let solidInside = 0;
        for (let i = 0; i < base.length; i += 4) {
          if (painted[i]! > 180 && painted[i + 1]! < 90 && painted[i + 2]! < 90 && painted[i + 3]! > 150) {
            red++; if (base[i + 3]! > 240) solidInside++; if (base[i + 3]! > 20) inside++; if (base[i + 3]! < 20) outside++;
          }
        }
        return { red, inside, outside, solidInside };
      });
      expect(pixels.red).toBeGreaterThan(100);
      if (position === 'inside') { expect(pixels.inside / pixels.red).toBeGreaterThan(0.95); expect(pixels.outside / pixels.red).toBeLessThan(0.05); }
      // Antialiased boundary pixels can belong to both layers; solid glyph interiors must stay clear.
      if (position === 'outside') { expect(pixels.outside / pixels.red).toBeGreaterThan(0.6); expect(pixels.solidInside / pixels.red).toBeLessThan(0.05); }
      if (position === 'center') { expect(pixels.inside / pixels.red).toBeGreaterThan(0.1); expect(pixels.outside / pixels.red).toBeGreaterThan(0.1); }
    }
  }
});
