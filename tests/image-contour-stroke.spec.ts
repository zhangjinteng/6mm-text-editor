import { expect, test } from '@playwright/test';

test('透明主体、孔洞、蒙版与裁剪使用最终轮廓，支持三种描边位置', async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  const results = await page.evaluate(async () => {
    // @ts-expect-error Vite serves this browser-only module.
    const { createImageStroke } = await import('/src/image-stroke.ts');
    const c = document.createElement('canvas'); c.width = c.height = 100;
    const ctx = c.getContext('2d')!; ctx.fillStyle = 'white'; ctx.fillRect(25, 25, 50, 50); ctx.clearRect(40, 40, 20, 20);
    const settings = { stroke: true, strokeWidth: 6, strokeColor: '#ff0000', strokeStyle: 'solid', strokePosition: 'inside', mask: 'none', radius: 0 };
    async function render(source: string, options: object, crop?: object) {
      const result = await createImageStroke(source, 100, 100, { ...settings, ...options }, crop);
      const image = new Image(); image.src = result.url; await image.decode();
      const output = document.createElement('canvas'); output.width = image.naturalWidth; output.height = image.naturalHeight;
      const cc = output.getContext('2d')!; cc.drawImage(image, 0, 0);
      const pixel = (x: number, y: number) => cc.getImageData(Math.round((x + result.pad) * image.naturalWidth / result.width), Math.round((y + result.pad) * image.naturalHeight / result.height), 1, 1).data[3]!;
      return { result, pixel };
    }
    const checks: Record<string, unknown> = {};
    for (const position of ['inside', 'center', 'outside']) {
      const { result, pixel } = await render(c.toDataURL(), { strokePosition: position });
      checks[position] = { method: result.method, outer: pixel(22, 30), inner: pixel(28, 30), hole: pixel(43, 50), corner: pixel(1, 1), body: pixel(35, 35) };
    }
    ctx.fillRect(0, 0, 100, 100);
    const triangle = await render(c.toDataURL(), { mask: 'triangle', strokePosition: 'outside' });
    checks.triangle = { method: triangle.result.method, outside: triangle.pixel(50, -2), corner: triangle.pixel(0, 0) };
    const round = await render(c.toDataURL(), { radius: 20, strokePosition: 'outside' });
    checks.round = { corner: round.pixel(0, 0), top: round.pixel(50, -2) };
    const cropped = await render(c.toDataURL(), { strokePosition: 'outside' }, { x: .5, y: 0, width: .5, height: 1 });
    checks.crop = { edge: cropped.pixel(-2, 50), center: cropped.pixel(50, 50) };
    for (const preset of ['dashed', 'dotted']) {
      const { result } = await render(c.toDataURL(), { strokeStyle: preset, mask: 'ellipse', strokePosition: 'center' });
      checks[preset] = result.method;
    }
    return checks;
  });
  expect(results.inside).toEqual({ method: 'pixels', outer: 0, inner: 255, hole: 0, corner: 0, body: 0 });
  expect(results.outside).toEqual({ method: 'pixels', outer: 255, inner: 0, hole: 255, corner: 0, body: 0 });
  expect((results.center as { corner: number }).corner).toBe(0);
  expect(results.triangle).toEqual({ method: 'path', outside: 255, corner: 0 });
  expect(results.round).toEqual({ corner: 0, top: 255 });
  expect(results.crop).toEqual({ edge: 255, center: 0 });
  expect(results.dashed).toBe('path'); expect(results.dotted).toBe('path');
});

test('独立描边层应用、跟随位置和尺寸、撤销重做、保存重载，关闭描边移除图层', async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = c.height = 100; const cc = c.getContext('2d')!;
    cc.fillStyle = 'green'; cc.beginPath(); cc.arc(50, 50, 25, 0, Math.PI * 2); cc.fill();
    const e = window.tinymce.activeEditor;
    e.setContent(`<p><img id="subject" src="${c.toDataURL()}" width="100" height="100" style="position:absolute;left:150px;top:100px;width:100px;height:100px"></p>`);
    e.undoManager.clear(); e.undoManager.add(); e.focus(); e.selection.select(e.getBody().querySelector('img')!); e.nodeChanged();
  });
  const image = page.frameLocator('.tox-edit-area iframe').locator('#subject');
  const layer = page.frameLocator('.tox-edit-area iframe').locator('[data-image-stroke-for]');
  const open = async () => { await image.click(); await page.locator('.tox-pop:visible [data-mce-name="imagesettings"]').click(); return page.getByRole('dialog', { name: '图片设置', exact: true }); };
  let d = await open(); await d.getByRole('tab', { name: '描边', exact: true }).click();
  await d.getByLabel('启用描边', { exact: true }).check(); await d.getByLabel('描边位置').selectOption('outside');
  await d.getByLabel('描边颜色').fill('#ff0000');
  await expect.poll(async () => d.locator('.image-settings-stroke-preview').evaluate(el => !!(el as HTMLElement).style.backgroundImage)).toBe(true);
  const previewCenter = await d.locator('.image-settings-preview').evaluate(stage => {
    const picture = stage.querySelector('img')!.getBoundingClientRect(), stroke = stage.querySelector('.image-settings-stroke-preview')!.getBoundingClientRect();
    return Math.max(Math.abs(picture.x + picture.width / 2 - stroke.x - stroke.width / 2), Math.abs(picture.y + picture.height / 2 - stroke.y - stroke.height / 2));
  });
  expect(previewCenter).toBeLessThan(1);
  await d.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(layer).toHaveCount(1); await expect(layer).toHaveAttribute('data-stroke-method', 'pixels');
  await expect(image).toHaveCSS('outline-style', 'none'); await expect(image).toHaveCSS('width', '100px');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo()); await expect(layer).toHaveCount(0);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo()); await expect(layer).toHaveCount(1);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor, image = e.getBody().querySelector<HTMLElement>('#subject')!;
    e.dom.setStyles(image, { left: '210px', top: '130px', width: '160px', height: '120px', rotate: '30deg', scale: '-1 1', zIndex: '8' }); e.dispatch('ResizeContent');
  });
  await expect(layer).toHaveCSS('rotate', '30deg'); await expect(layer).toHaveCSS('scale', '-1 1'); await expect(layer).toHaveCSS('z-index', '8');
  await expect.poll(async () => layer.evaluate(el => parseFloat((el as HTMLElement).style.left) + Number(el.getAttribute('data-stroke-pad')))).toBe(210);
  await expect.poll(async () => layer.evaluate(el => parseFloat((el as HTMLElement).style.width) - 2 * Number(el.getAttribute('data-stroke-pad')))).toBe(160);
  const html = await page.evaluate(() => window.tinymce.activeEditor.getContent()); expect(html).toContain('data-image-stroke-for'); expect(html).toContain('data:image/png');
  await page.getByRole('button', { name: '保存文档', exact: true }).click(); await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(layer).toHaveCount(1); await expect(image).toHaveCSS('rotate', '30deg');
  await page.evaluate(() => { const e = window.tinymce.activeEditor; e.dom.setStyle(e.getBody().querySelector('#subject')!, 'left', '260px'); e.dispatch('ResizeContent'); });
  await expect.poll(async () => layer.evaluate(el => parseFloat((el as HTMLElement).style.left) + Number(el.getAttribute('data-stroke-pad')))).toBe(260);
  expect(await page.evaluate(() => {
    const e = window.tinymce.activeEditor, parsed = new DOMParser().parseFromString(e.getContent(), 'text/html');
    const saved = parsed.querySelector<HTMLElement>('[data-image-stroke-for]')!;
    return parseFloat(saved.style.left) + Number(saved.getAttribute('data-stroke-pad'));
  })).toBe(260);
  d = await open(); await d.getByRole('tab', { name: '描边', exact: true }).click(); await expect(d.getByLabel('描边位置')).toHaveValue('outside');
  await d.getByLabel('启用描边', { exact: true }).uncheck(); await d.getByRole('button', { name: '应用设置', exact: true }).click(); await expect(layer).toHaveCount(0);
});

test('透明描边复制后独立关联，裁剪后重建轮廓；跨域失败保留原图', async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const c = document.createElement('canvas'); c.width = c.height = 100; const ctx = c.getContext('2d')!;
    ctx.fillStyle = 'blue'; ctx.fillRect(20, 20, 60, 60);
    const settings = { stroke: true, strokeWidth: 6, strokeColor: '#ff0000', strokeStyle: 'solid', strokePosition: 'outside', mask: 'none', radius: 0 };
    const e = window.tinymce.activeEditor; e.setContent(`<p><img id="first" src="${c.toDataURL()}" width="100" height="100" style="position:absolute;left:100px;top:100px" data-image-settings='${JSON.stringify(settings)}'></p>`);
  });
  const frame = page.frameLocator('.tox-edit-area iframe'), layers = frame.locator('[data-image-stroke-for]');
  await expect(layers).toHaveCount(1);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor, first = e.getBody().querySelector<HTMLImageElement>('#first')!, second = first.cloneNode(true) as HTMLImageElement;
    second.id = 'second'; second.style.left = '300px'; first.after(second); second.after(e.getBody().querySelector('[data-image-stroke-for]')!.cloneNode(true));
    e.dispatch('ResizeContent');
  });
  await expect(layers).toHaveCount(2);
  await expect.poll(async () => frame.locator('img').evaluateAll(images => new Set(images.map(i => i.getAttribute('data-image-stroke-id'))).size)).toBe(2);
  await expect(layers).toHaveCount(2);
  const before = await layers.evaluateAll(elements => elements.map(el => (el as HTMLElement).style.backgroundImage));
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor, first = e.getBody().querySelector<HTMLImageElement>('#first')!;
    e.dom.setAttrib(first, 'data-image-crop', JSON.stringify({ x: .5, y: 0, width: .5, height: 1 }));
    e.dom.setStyles(first, { objectViewBox: 'inset(0% 0% 0% 50%)', width: '50px', height: '100px' }); e.dispatch('ResizeContent');
  });
  await expect.poll(async () => layers.first().evaluate(el => (el as HTMLElement).style.backgroundImage)).not.toBe(before[0]);
  await expect(layers.nth(1)).toHaveCSS('left', /29/);
  await page.route('https://stroke-no-cors.invalid/**', route => route.abort());
  await frame.locator('#second').click(); await page.locator('.tox-pop:visible [data-mce-name="imagesettings"]').click();
  const dialog = page.getByRole('dialog', { name: '图片设置', exact: true });
  const original = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  await dialog.getByLabel('图片地址').fill('https://stroke-no-cors.invalid/missing.png');
  await dialog.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(dialog.getByRole('alert')).toBeVisible(); await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: '取消', exact: true }).click();
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(original);
});
