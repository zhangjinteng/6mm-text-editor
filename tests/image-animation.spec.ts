import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const names = ['bounce', 'flash', 'pulse', 'rubberBand', 'shakeX', 'shakeY', 'headShake', 'swing', 'tada', 'wobble', 'jello', 'heartBeat'];
const frame = (p: Page) => p.frameLocator('.tox-edit-area iframe');
const image = (p: Page) => frame(p).locator('#animated-image');
const panel = (p: Page) => p.getByRole('complementary', { name: '图片配置面板' });
const dialog = (p: Page) => p.getByRole('dialog', { name: '图片设置', exact: true });
async function select(page: Page) {
  await image(page).evaluate(node => node.getAnimations().forEach(a => { a.pause(); a.currentTime = 0; }));
  await image(page).click();
  await panel(page).getByRole('tab', { name: '动画', exact: true }).click();
}
test.beforeEach(async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 160; canvas.height = 120;
    const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#147d64'; ctx.fillRect(15, 15, 130, 90);
    const e = window.tinymce.activeEditor;
    e.setContent(`<p><img id="animated-image" src="${canvas.toDataURL()}" style="position:absolute;left:80px;top:90px;width:160px;height:120px"></p><p><img id="other-image" src="${canvas.toDataURL()}" style="position:absolute;left:400px;top:90px;width:160px;height:120px"></p>`);
    e.undoManager.clear(); e.undoManager.add();
  });
});

test('图片配置复用十二种动画，参数即时应用、独立切换、撤销与无动画', async ({ page }) => {
  await select(page);
  await expect(panel(page).getByRole('group', { name: '动画效果', exact: true }).getByRole('button')).toHaveCount(12);
  for (const name of names) {
    await panel(page).getByRole('button', { name, exact: true }).click();
    await expect(image(page)).toHaveAttribute('data-image-animation', name);
    await expect(image(page)).toHaveCSS('animation-name', `image-${name}`);
  }
  await panel(page).getByRole('spinbutton', { name: '每轮时长（秒）', exact: true }).fill('2');
  await expect(image(page)).toHaveCSS('animation-duration', '2s');
  await panel(page).getByRole('checkbox', { name: '循环播放', exact: true }).check();
  await expect(image(page)).toHaveCSS('animation-iteration-count', 'infinite');
  await panel(page).getByRole('spinbutton', { name: '循环总时长（秒）', exact: true }).fill('10');
  await expect(image(page)).toHaveCSS('animation-iteration-count', '5');
  await page.screenshot({ path: 'screenshots/image-animation-sidebar.png' });
  await frame(page).locator('#other-image').click();
  await panel(page).getByRole('tab', { name: '动画', exact: true }).click();
  await expect(panel(page).getByRole('button', { name: '无动画', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await select(page);
  await expect(panel(page).getByRole('spinbutton', { name: '每轮时长（秒）', exact: true })).toHaveValue('2');
  await panel(page).getByRole('button', { name: '无动画', exact: true }).click();
  await expect(image(page)).not.toHaveAttribute('data-image-animation');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  await expect(image(page)).toHaveAttribute('data-image-animation', 'heartBeat');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  await expect(image(page)).toHaveCSS('animation-name', 'none');
});

test('弹窗动画预览隔离，参数校验，取消与应用，重置不改图片尺寸', async ({ page }) => {
  await select(page); const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  await image(page).click();
  await page.locator('.tox-pop:visible [data-mce-name="imagesettings"]').click();
  const d = dialog(page), preview = d.locator('.image-settings-preview img');
  await d.getByRole('tab', { name: '动画', exact: true }).click();
  for (const name of names) {
    await d.getByRole('button', { name, exact: true }).click();
    await expect(preview).toHaveCSS('animation-name', `image-${name}`);
    await expect(image(page)).not.toHaveAttribute('data-image-animation');
  }
  await d.getByRole('spinbutton', { name: '每轮时长（秒）', exact: true }).fill('0');
  await d.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(d.getByRole('alert')).toContainText('0.1—60');
  await d.getByRole('button', { name: '取消', exact: true }).click();
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await page.locator('.tox-pop:visible [data-mce-name="imagesettings"]').click();
  await d.getByRole('tab', { name: '动画', exact: true }).click();
  await d.getByRole('button', { name: 'pulse', exact: true }).click();
  await d.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(image(page)).toHaveAttribute('data-image-animation', 'pulse');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  await select(page);
  await panel(page).getByRole('button', { name: '重置效果', exact: true }).click();
  await expect(image(page)).not.toHaveAttribute('data-image-animation');
  await expect(image(page)).toHaveCSS('width', '160px');
  await expect(image(page)).toHaveCSS('height', '120px');
});

test('动画随图片保存、预览、离线导出并遵守减少动态效果', async ({ page }) => {
  await select(page);
  await panel(page).getByRole('button', { name: 'shakeX', exact: true }).click();
  await panel(page).getByRole('checkbox', { name: '循环播放', exact: true }).check();
  await expect(image(page)).toHaveAttribute('data-animation-loop', 'true');
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(image(page)).toHaveCSS('animation-name', 'image-shakeX');
  await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  await expect(page.frameLocator('iframe[title="文档预览"]').locator('#animated-image')).toHaveCSS('animation-name', 'image-shakeX');
  await page.getByRole('button', { name: '导出', exact: true }).click();
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'HTML 文档', exact: true }).click();
  const download = await downloading;
  const html = await readFile((await download.path())!, 'utf8');
  const exported = await page.context().newPage(); await exported.route('**/*', route => route.abort());
  await exported.setContent(html);
  await expect(exported.locator('#animated-image')).toHaveCSS('animation-name', 'image-shakeX');
  await exported.emulateMedia({ reducedMotion: 'reduce' });
  await expect(exported.locator('#animated-image')).toHaveCSS('animation-duration', '0.001s');
  await exported.close();
});

test('循环动画与旋转翻转描边同步，动画中对齐不改变布局尺寸', async ({ page }) => {
  await select(page);
  await panel(page).getByRole('tab', { name: '图片', exact: true }).click();
  await panel(page).getByLabel('水平翻转', { exact: true }).check();
  await panel(page).getByRole('slider', { name: '旋转角度', exact: true }).fill('25');
  await expect(image(page)).toHaveCSS('rotate', '25deg');
  await panel(page).getByRole('tab', { name: '描边', exact: true }).click();
  await panel(page).getByLabel('启用描边', { exact: true }).check();
  await panel(page).getByLabel('描边位置', { exact: true }).selectOption('outside');
  const stroke = frame(page).locator('[data-image-stroke-for]'); await expect(stroke).toHaveCount(1);
  await panel(page).getByRole('tab', { name: '动画', exact: true }).click();
  await panel(page).getByRole('button', { name: 'wobble', exact: true }).click();
  await panel(page).getByRole('checkbox', { name: '循环播放', exact: true }).check();
  await expect(stroke).toHaveCSS('animation-name', 'image-wobble');
  await expect(stroke).toHaveCSS('animation-iteration-count', 'infinite');
  await expect(image(page)).toHaveCSS('scale', '-1 1');
  await expect.poll(() => page.evaluate(() => {
    const body = window.tinymce.activeEditor.getBody();
    return body.querySelector('#animated-image')!.getAnimations()[0]?.startTime === body.querySelector('[data-image-stroke-for]')!.getAnimations()[0]?.startTime;
  })).toBe(true);
  const centers = await page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    const nodes = [e.getBody().querySelector('#animated-image')!, e.getBody().querySelector('[data-image-stroke-for]')!];
    nodes.forEach(node => node.getAnimations().forEach(a => { a.pause(); a.currentTime = 150; }));
    // The contour has padding and a content-box transform reference. Compare
    // rendered centers: computed transform matrices can use border-box sizes.
    return nodes.map(node => { const r = node.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
  });
  expect(centers[0]!.x).toBeCloseTo(centers[1]!.x, 1);
  expect(centers[0]!.y).toBeCloseTo(centers[1]!.y, 1);
  await panel(page).getByRole('tab', { name: '排版', exact: true }).click();
  await panel(page).getByRole('button', { name: '水平居中', exact: true }).click();
  const geometry = await page.evaluate(async () => {
    const { imageLayoutRect } = await import('/src/image-animation.ts');
    const e = window.tinymce.activeEditor, img = e.getBody().querySelector<HTMLElement>('#animated-image')!;
    const rect = imageLayoutRect(img), body = e.getBody().getBoundingClientRect();
    return { center: rect.x + rect.width / 2, expected: body.x + body.width / 2 };
  });
  expect(geometry.center).toBeCloseTo(geometry.expected, 0);
  await expect(image(page)).toHaveCSS('width', '160px'); await expect(image(page)).toHaveCSS('height', '120px');
});

test('动画中的拖动缩放使用布局尺寸，闪烁保留原有透明度', async ({ page }) => {
  await select(page);
  await panel(page).getByRole('button', { name: 'pulse', exact: true }).click();
  await image(page).evaluate(node => node.getAnimations().forEach(a => { a.pause(); a.currentTime = 500; }));
  const box = (await image(page).boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 60, box.y + box.height / 2 + 40, { steps: 6 }); await page.mouse.up();
  await expect(image(page)).toHaveCSS('left', '140px'); await expect(image(page)).toHaveCSS('top', '130px');
  await expect(image(page)).toHaveCSS('width', '160px'); await expect(image(page)).toHaveCSS('height', '120px');
  const handle = frame(page).locator('#objectResizeHandlese');
  const corner = (await handle.boundingBox())!;
  await page.mouse.move(corner.x + corner.width / 2, corner.y + corner.height / 2); await page.mouse.down();
  await page.mouse.move(corner.x + corner.width / 2 + 40, corner.y + corner.height / 2 + 30, { steps: 6 }); await page.mouse.up();
  await expect(image(page)).toHaveCSS('width', '200px'); await expect(image(page)).toHaveCSS('height', '150px');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  await expect(image(page)).toHaveCSS('width', '160px');
  await select(page);
  await panel(page).getByRole('tab', { name: '外观', exact: true }).click();
  await panel(page).getByRole('slider', { name: '不透明度', exact: true }).fill('50');
  await panel(page).getByRole('tab', { name: '动画', exact: true }).click();
  await panel(page).getByRole('button', { name: 'flash', exact: true }).click();
  await image(page).evaluate(node => node.getAnimations().forEach(a => { a.pause(); a.currentTime = 500; }));
  await expect(image(page)).toHaveCSS('opacity', '0.5');
  await image(page).evaluate(node => node.getAnimations().forEach(a => { a.currentTime = 250; }));
  await expect(image(page)).toHaveCSS('opacity', '0');
});
