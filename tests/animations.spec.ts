import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import type { Editor } from 'tinymce';
declare global { interface Window { tinymce: { activeEditor: Editor } } }
const names = ['bounce', 'flash', 'pulse', 'rubberBand', 'shakeX', 'shakeY', 'headShake', 'swing', 'tada', 'wobble', 'jello', 'heartBeat'];
const box = (page: Page) => page.frameLocator('.tox-edit-area iframe').locator('#animation-text');
const preview = (page: Page) => page.frameLocator('iframe[title="文字效果预览"]').locator('body > [data-text-draggable]');
const dialog = (page: Page) => page.getByRole('dialog', { name: '文字设置', exact: true });
const content = (page: Page) => page.evaluate(() => window.tinymce.activeEditor.getContent());
async function open(page: Page) {
  await box(page).click();
  await expect(page.locator('.tox-pop:visible [data-mce-name="textanimation"]')).toHaveCount(0);
  await page.locator('.tox-pop:visible [data-mce-name="textsettings"]').click();
  await dialog(page).getByRole('tab', { name: '动画', exact: true }).click();
  return dialog(page);
}
test.beforeEach(async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    e.setContent('<p>前面</p><p><span id="animation-text" data-text-draggable="true" style="position:absolute;left:100px;top:100px;width:300px;font-size:38px"><strong style="color:#e03e2d">动画文字</strong></span></p><p>后面</p>');
    e.undoManager.clear(); e.undoManager.add();
  });
});

test('动画移入设置，十二种效果预览隔离，应用替换并可撤销和重播', async ({ page }) => {
  const before = await content(page), d = await open(page);
  const grid = d.getByRole('group', { name: '动画效果', exact: true });
  await expect(grid.getByRole('button')).toHaveCount(12);
  expect(await grid.evaluate(node => getComputedStyle(node).gridTemplateColumns.split(' ').length)).toBe(3);
  for (const name of names) {
    await d.getByRole('button', { name, exact: true }).click();
    await expect(d.getByRole('button', { name, exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(preview(page).locator('[data-text-source]')).toHaveCSS('animation-name', name);
    await expect(preview(page)).toHaveCSS('animation-name', 'none');
    expect(await content(page)).toBe(before);
  }
  await page.screenshot({ path: 'screenshots/text-settings-animation-desktop.png' });
  await d.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(box(page)).toHaveAttribute('data-text-animation', 'heartBeat');
  await expect(box(page).locator('[data-text-source]')).toHaveCSS('animation-name', 'heartBeat');
  await expect(box(page).locator('strong')).toHaveCSS('color', 'rgb(224, 62, 45)');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  expect(await content(page)).toBe(before);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  await open(page);
  await expect(d.getByRole('button', { name: 'heartBeat', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await d.getByRole('button', { name: 'heartBeat', exact: true }).click();
  expect(await preview(page).locator('[data-text-source]').evaluate(node => node.getAnimations().some(a => a.playState === 'running'))).toBe(true);
  await d.getByRole('button', { name: 'bounce', exact: true }).click();
  await d.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(box(page)).toHaveAttribute('data-text-animation', 'bounce');
  await expect(box(page).locator('[data-text-animation]')).toHaveCount(0);
});

test('播放时长和循环校验、取消、重置、无动画及窄屏布局', async ({ page }) => {
  const before = await content(page), d = await open(page);
  await expect(d.getByRole('spinbutton', { name: '每轮时长（秒）', exact: true })).toBeDisabled();
  await d.getByRole('button', { name: 'pulse', exact: true }).click();
  await d.getByRole('spinbutton', { name: '每轮时长（秒）', exact: true }).fill('0');
  await d.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(d.getByRole('alert')).toContainText('0.1—60'); expect(await content(page)).toBe(before);
  await d.getByRole('spinbutton', { name: '每轮时长（秒）', exact: true }).fill('2');
  await d.getByRole('checkbox', { name: '循环播放', exact: true }).check();
  await d.getByRole('spinbutton', { name: '循环总时长（秒）', exact: true }).fill('10');
  await expect(preview(page).locator('[data-text-source]')).toHaveCSS('animation-duration', '2s');
  await expect(preview(page).locator('[data-text-source]')).toHaveCSS('animation-iteration-count', '5');
  await d.getByRole('button', { name: '应用设置', exact: true }).click();
  const applied = await content(page);
  await open(page);
  await expect(d.getByRole('spinbutton', { name: '每轮时长（秒）', exact: true })).toHaveValue('2');
  await expect(d.getByRole('checkbox', { name: '循环播放', exact: true })).toBeChecked();
  await expect(d.getByRole('spinbutton', { name: '循环总时长（秒）', exact: true })).toHaveValue('10');
  await d.getByRole('spinbutton', { name: '循环总时长（秒）', exact: true }).fill('3601');
  await d.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(d.getByRole('alert')).toContainText('0—3600');
  await d.getByRole('spinbutton', { name: '循环总时长（秒）', exact: true }).fill('0');
  await expect(preview(page).locator('[data-text-source]')).toHaveCSS('animation-iteration-count', 'infinite');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(d.getByRole('button', { name: 'heartBeat', exact: true })).toBeVisible();
  const bounds = (await d.boundingBox())!; expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.width).toBeLessThanOrEqual(390);
  await page.screenshot({ path: 'screenshots/text-settings-animation-mobile.png' });
  await page.keyboard.press('Escape'); expect(await content(page)).toBe(applied);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await open(page); await d.getByRole('button', { name: '重置效果', exact: true }).click();
  await expect(preview(page)).not.toHaveAttribute('data-text-animation');
  await expect(d.getByRole('button', { name: '无动画', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await d.getByRole('button', { name: '取消', exact: true }).click(); expect(await content(page)).toBe(applied);
  await open(page); await d.getByRole('button', { name: '无动画', exact: true }).click();
  await d.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(box(page)).not.toHaveAttribute('data-text-animation');
  expect(await content(page)).not.toContain('animation-duration');
  await expect(box(page).locator('strong')).toHaveText('动画文字');
});

test('动画与填充变形共存，保存、预览、导出并保留拖动定位', async ({ page }) => {
  const d = await open(page);
  await d.getByRole('button', { name: 'swing', exact: true }).click();
  await d.getByRole('checkbox', { name: '循环播放', exact: true }).check();
  await d.getByRole('tab', { name: '填充', exact: true }).click();
  await d.getByRole('combobox', { name: '填充类型', exact: true }).selectOption('gradient');
  await d.getByRole('tab', { name: '变形', exact: true }).click();
  await d.getByRole('button', { name: '上拱', exact: true }).click();
  await expect(preview(page).locator('[data-text-render]')).toHaveCSS('animation-name', 'swing');
  await expect(preview(page).locator('linearGradient')).not.toHaveCount(0);
  await d.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(box(page)).toHaveCSS('left', '100px'); await expect(box(page)).toHaveCSS('transform', 'none');
  await expect(box(page).locator('[data-text-render]')).toHaveCSS('animation-name', 'swing');
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(box(page)).toHaveAttribute('data-text-animation', 'swing');
  await expect(box(page).locator('[data-text-render]')).toHaveCSS('animation-iteration-count', 'infinite');
  await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  await expect(page.frameLocator('iframe[title="文档预览"]').locator('#animation-text [data-text-render]')).toHaveCSS('animation-name', 'swing');
  await page.getByRole('button', { name: '导出', exact: true }).click();
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'HTML 文档', exact: true }).click();
  const html = await readFile(await (await downloaded).path(), 'utf8');
  expect(html).toContain('@keyframes swing'); expect(html).toContain('data-text-animation="swing"');
});

test('旧版内层动画可读取，取消保留原始格式，替换与清除不嵌套', async ({ page }) => {
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    e.setContent('<p><span id="animation-text" data-text-draggable="true"><span data-text-animation="pulse" style="animation-duration:2s;animation-iteration-count:infinite"><strong>旧动画</strong></span></span></p>');
  });
  const before = await content(page), d = await open(page);
  await expect(d.getByRole('button', { name: 'pulse', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(d.getByRole('spinbutton', { name: '每轮时长（秒）', exact: true })).toHaveValue('2');
  await expect(d.getByRole('checkbox', { name: '循环播放', exact: true })).toBeChecked();
  await d.getByRole('button', { name: '取消', exact: true }).click(); expect(await content(page)).toBe(before);
  await open(page); await d.getByRole('button', { name: 'flash', exact: true }).click();
  await d.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(box(page)).toHaveAttribute('data-text-animation', 'flash');
  await expect(box(page).locator('[data-text-animation]')).toHaveCount(0);
  await expect(box(page).locator('strong')).toHaveText('旧动画');
  await expect(page.locator('.tox-pop:visible [data-mce-name="textdrag"]')).toHaveCount(0);
  await open(page); await d.getByRole('button', { name: '无动画', exact: true }).click();
  await d.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(box(page)).not.toHaveAttribute('data-text-animation');
  await expect(box(page).locator('strong')).toHaveText('旧动画');
});
