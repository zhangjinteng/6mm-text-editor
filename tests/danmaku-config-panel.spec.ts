import { expect, test, type Page } from '@playwright/test';
const frame = (p: Page) => p.frameLocator('.tox-edit-area iframe');
const panel = (p: Page) => p.getByRole('complementary', { name: '弹幕配置面板' });
const modal = (p: Page) => p.getByRole('dialog', { name: '弹幕设置', exact: true });
async function choose(page: Page, id = 'a') {
  await frame(page).locator(`#${id}`).click({ position: { x: 15, y: 15 } });
  await expect(panel(page)).toBeVisible();
}
test.beforeEach(async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    e.setContent('<div id="a" data-danmaku-id="panel-a" data-danmaku-source="current" style="position:absolute;left:40px;top:120px;width:180px;height:160px;z-index:2"></div><div id="b" data-danmaku-id="panel-b" data-danmaku-source="current" style="position:absolute;left:440px;top:120px;width:180px;height:160px;z-index:3"></div><p><span id="text" data-text-draggable="true" style="position:absolute;left:40px;top:20px;z-index:1">切换到文字</span></p><p><img id="picture" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="position:absolute;left:260px;top:20px;width:80px;height:60px;z-index:4"></p>');
    e.undoManager.clear(); e.undoManager.add();
  });
});

test('选中弹幕显示配置，切换其他对象与空白互斥，关闭可重新打开', async ({ page }) => {
  await expect(panel(page)).toBeHidden();
  await choose(page);
  await expect(page.locator('.tox-pop:visible [data-mce-name="danmakusettings"]')).toBeVisible();
  await expect(page.getByRole('complementary', { name: '画布配置面板' })).toBeHidden();
  await frame(page).locator('#text').click();
  await expect(panel(page)).toBeHidden();
  await expect(page.getByRole('complementary', { name: '文字配置面板' })).toBeVisible();
  await choose(page);
  await expect(page.getByRole('complementary', { name: '文字配置面板' })).toBeHidden();
  await frame(page).locator('#picture').click();
  await expect(panel(page)).toBeHidden();
  await expect(page.getByRole('complementary', { name: '图片配置面板' })).toBeVisible();
  await choose(page);
  await expect(page.getByRole('complementary', { name: '图片配置面板' })).toBeHidden();
  await panel(page).getByRole('button', { name: '收起弹幕配置' }).click();
  await expect(panel(page)).toBeHidden();
  await choose(page);
  await frame(page).locator('body').click({ position: { x: 700, y: 380 } });
  await expect(panel(page)).toBeHidden();
  await expect(page.getByRole('complementary', { name: '画布配置面板' })).toBeVisible();
});

test('从弹幕切换图片时旧选区事件不重开弹幕配置，所有配置最多显示一个', async ({ page }) => {
  const visiblePanels = page.locator('aside[aria-label$="配置面板"]:visible');
  await choose(page);
  await page.evaluate(() => {
    const editor = window.tinymce.activeEditor;
    const image = editor.getBody().querySelector<HTMLElement>('#picture')!;
    // 图片 pointerdown 已选择新对象，但 TinyMCE 的原生选区尚未更新。
    editor.dispatch('ObjectSelectionChanged', { element: image });
    editor.nodeChanged();
    editor.selection.select(image); editor.nodeChanged();
  });
  await expect(page.getByRole('complementary', { name: '图片配置面板' })).toBeVisible();
  await expect(visiblePanels).toHaveCount(1);
  await expect(panel(page)).toBeHidden();
  for (const id of ['a', 'picture', 'b', 'text', 'a', 'picture']) {
    await frame(page).locator(`#${id}`).click({ position: { x: 15, y: 15 } });
    await expect(visiblePanels).toHaveCount(1);
    const name = id === 'picture' ? '图片配置面板' : id === 'text' ? '文字配置面板' : '弹幕配置面板';
    await expect(page.getByRole('complementary', { name })).toBeVisible();
  }
  await page.getByRole('button', { name: '收起图片配置' }).click();
  await expect(visiblePanels).toHaveCount(0);
  await choose(page); await expect(visiblePanels).toHaveCount(1);
});

test('侧栏即时应用对齐与图层，独立对象、撤销重做、保存与弹窗同步', async ({ page }) => {
  await choose(page);
  const before = await frame(page).locator('#a').getAttribute('style');
  await panel(page).getByRole('button', { name: '水平居中', exact: true }).click();
  const center = await frame(page).locator('#a').getAttribute('data-danmaku-x');
  const body = (await frame(page).locator('body').boundingBox())!, a = (await frame(page).locator('#a').boundingBox())!;
  expect(a.x).toBeCloseTo(body.x + (body.width - a.width) / 2, 0);
  await expect(panel(page).getByRole('button', { name: '水平居中', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  await expect(frame(page).locator('#a')).toHaveAttribute('style', before!);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  await expect(frame(page).locator('#a')).toHaveAttribute('data-danmaku-x', center!);
  await expect(panel(page).getByRole('button', { name: '水平居中', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await panel(page).getByRole('button', { name: '置于顶层', exact: true }).click();
  await expect(frame(page).locator('#a')).toHaveCSS('z-index', '4');
  await expect(panel(page).getByRole('button', { name: '上一层', exact: true })).toBeDisabled();
  await page.screenshot({ path: 'screenshots/danmaku-config-panel-desktop.png' });
  // 让第二个弹幕露在第一个对象之外，再检查侧栏切换。
  await panel(page).getByRole('button', { name: '贴左侧', exact: true }).click();
  await choose(page, 'b');
  await expect(panel(page).getByRole('button', { name: '贴左侧', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await expect(frame(page).locator('#b')).not.toHaveAttribute('data-danmaku-x');
  await choose(page);
  await page.locator('.tox-pop:visible [data-mce-name="danmakusettings"]').click();
  await expect(modal(page).getByRole('button', { name: '贴左侧', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await modal(page).getByRole('button', { name: '贴右侧', exact: true }).click();
  await modal(page).getByRole('button', { name: '取消', exact: true }).click();
  await expect(panel(page).getByRole('button', { name: '贴左侧', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.locator('.tox-pop:visible [data-mce-name="danmakusettings"]').click();
  await modal(page).getByRole('button', { name: '水平居中', exact: true }).click();
  await modal(page).getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(panel(page).getByRole('button', { name: '水平居中', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await choose(page);
  await expect(panel(page).getByRole('button', { name: '水平居中', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(panel(page).getByRole('button', { name: '置于顶层', exact: true })).toBeDisabled();
});

test('窄屏在画布下方显示，文档与模式切换清理配置', async ({ page }) => {
  await choose(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await panel(page).scrollIntoViewIfNeeded();
  const bounds = (await panel(page).boundingBox())!, area = (await page.locator('.editor-container').boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  expect(bounds.y).toBeGreaterThanOrEqual(area.y + area.height);
  await page.screenshot({ path: 'screenshots/danmaku-config-panel-mobile.png' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => window.tinymce.activeEditor.mode.set('readonly'));
  await expect(panel(page)).toBeHidden();
  await page.evaluate(() => window.tinymce.activeEditor.mode.set('design'));
  await choose(page);
  await page.getByRole('button', { name: 'HTML', exact: true }).click();
  await expect(panel(page)).toBeHidden();
  await page.getByRole('button', { name: '编辑', exact: true }).click();
  await choose(page);
  await page.evaluate(() => window.tinymce.activeEditor.setContent('<p>新文档</p>'));
  await expect(panel(page)).toBeHidden();
});
