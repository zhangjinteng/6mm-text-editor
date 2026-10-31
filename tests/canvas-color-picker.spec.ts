import { expect, test } from '@playwright/test';

const pickerSelector = '.text-color-popover:visible';
test.beforeEach(async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    e.setContent('<p style="color:#3598db">作品颜色</p>'); e.undoManager.clear(); e.undoManager.add();
  });
});

test('画布配置共享取色器，同步透明度并支持撤销、重开与切换清理', async ({ page }) => {
  const panel = page.getByRole('complementary', { name: '画布配置面板' });
  const layer = page.frameLocator('.tox-edit-area iframe').locator('.document-background-color');
  await panel.getByRole('button', { name: '背景颜色色板', exact: true }).click();
  const picker = page.locator(pickerSelector);
  await expect(picker.getByRole('button', { name: '使用颜色 #3598db' })).toBeVisible();
  await picker.getByRole('textbox', { name: 'HEX 颜色' }).fill('#112233');
  await picker.getByRole('textbox', { name: '颜色不透明度', exact: true }).fill('40');
  await expect(layer).toHaveCSS('background-color', 'rgba(17, 34, 51, 0.4)');
  await expect(panel.getByRole('slider', { name: '背景透明度', exact: true })).toHaveValue('60');
  await page.keyboard.press('Escape');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  await expect(layer).toHaveCSS('background-color', 'rgb(17, 34, 51)');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  await panel.getByRole('button', { name: '背景颜色色板', exact: true }).click();
  await expect(picker.getByRole('textbox', { name: '颜色不透明度', exact: true })).toHaveValue('40%');
  await page.screenshot({ path: 'screenshots/canvas-color-picker.png' });
  await panel.getByRole('tab', { name: '插入', exact: true }).click(); await expect(picker).toHaveCount(0);
  await panel.getByRole('tab', { name: '背景', exact: true }).click();
  await panel.getByRole('slider', { name: '背景透明度', exact: true }).fill('75');
  await panel.getByRole('button', { name: '背景颜色色板', exact: true }).click();
  await expect(picker.getByRole('textbox', { name: '颜色不透明度', exact: true })).toHaveValue('25%');
  await page.setViewportSize({width:390,height:844});
  const bounds = (await picker.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.x+bounds.width).toBeLessThanOrEqual(390);
  await page.keyboard.press('Escape'); await panel.getByRole('button', { name: '清除背景颜色' }).click();
  await expect(layer).toHaveCount(0);
});

test('画布设置弹窗共享取色器，取消无副作用、颜色和透明度一起应用撤销', async ({ page }) => {
  const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  const open = () => page.evaluate(() => window.tinymce.activeEditor.ui.registry.getAll().buttons.canvassettings!.onAction({} as never));
  const dialog = page.getByRole('dialog', { name: '画布设置', exact: true });
  const picker = page.locator(pickerSelector);
  for (const action of ['取消', '应用设置']) {
    await open();
    await dialog.getByRole('button', { name: '背景颜色色板', exact: true }).click();
    await picker.getByRole('textbox', { name: 'HEX 颜色' }).fill('#ff0000');
    await picker.getByRole('textbox', { name: '颜色不透明度', exact: true }).fill('35');
    await expect(dialog.getByRole('textbox', { name: '背景透明度（0–100%）' })).toHaveValue('65');
    await expect(picker.locator('.text-color-sv')).toHaveCSS('height', '140px');
    if (action === '应用设置') await page.screenshot({ path: 'screenshots/canvas-color-picker-dialog.png' });
    expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
    await page.keyboard.press('Escape'); await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: action, exact: true }).click();
    if (action === '取消') expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  }
  await expect(page.frameLocator('.tox-edit-area iframe').locator('.document-background-color')).toHaveCSS('background-color', 'rgba(255, 0, 0, 0.35)');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await expect(picker).toHaveCount(0);
});
