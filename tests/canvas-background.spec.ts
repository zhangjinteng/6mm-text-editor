import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

async function settings(page: Page) {
  const area = (await page.locator('.tox-edit-area iframe').boundingBox())!;
  await page.mouse.click(area.x + 300, area.y + 220);
  await page.locator('.tox-pop:visible [data-mce-name="canvassettings"]').click();
  return page.getByRole('dialog', { name: '画布设置', exact: true });
}
test.beforeEach(async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor; e.setContent('<p><strong>前景不透明</strong></p>'); e.undoManager.clear(); e.undoManager.add();
  });
});
test('画布背景设置支持取消、颜色透明度、撤销重做和保存预览导出', async ({ page }) => {
  const frame = page.frameLocator('.tox-edit-area iframe'); const layer = frame.locator('.document-background-color');
  let dialog = await settings(page);
  expect((await dialog.boundingBox())!.width).toBeCloseTo(790, 0);
  expect((await dialog.locator('.canvas-settings-preview').boundingBox())!.width).toBeGreaterThan(400);
  await dialog.getByRole('textbox', { name: '背景颜色', exact: true }).fill('#E03E2D');
  await dialog.getByRole('textbox', { name: '背景透明度（0–100%）', exact: true }).fill('60');
  await expect(layer).toHaveCount(0);
  await expect(page.frameLocator('iframe[title="画布效果预览"]').locator('.document-background-color')).toHaveCSS('background-color', 'rgba(224, 62, 45, 0.4)');
  await page.screenshot({ path: 'screenshots/canvas-settings.png' });
  await dialog.getByRole('button', { name: '取消', exact: true }).click();
  await expect(layer).toHaveCount(0);
  dialog = await settings(page);
  await dialog.getByRole('textbox', { name: '背景颜色', exact: true }).fill('#E03E2D');
  await dialog.getByRole('textbox', { name: '背景透明度（0–100%）', exact: true }).fill('60');
  await dialog.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(layer).toHaveCSS('background-color', 'rgba(224, 62, 45, 0.4)');
  await expect(frame.locator('strong')).toHaveCSS('opacity', '1');
  await expect(frame.locator('strong')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo()); await expect(layer).toHaveCount(0);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo()); await expect(layer).toHaveCount(1);
  dialog = await settings(page);
  await expect(dialog.getByRole('textbox', { name: '背景透明度（0–100%）', exact: true })).toHaveValue('60');
  await dialog.getByRole('textbox', { name: '背景颜色', exact: true }).fill('#3598DB');
  await dialog.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(layer).toHaveCSS('background-color', 'rgba(53, 152, 219, 0.4)');
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(layer).toHaveCSS('background-color', 'rgba(53, 152, 219, 0.4)');
  await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  await expect(page.frameLocator('iframe[title="文档预览"]').locator('.document-background-color')).toHaveCSS('background-color', 'rgba(53, 152, 219, 0.4)');
  await page.getByRole('button', { name: '导出', exact: true }).click(); const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'HTML 文档', exact: true }).click();
  expect(await readFile(await (await download).path(), 'utf8')).toContain('rgba(53, 152, 219, 0.4)');
});
test('背景输入校验、完全透明、清除与窄屏弹窗', async ({ page }) => {
  const layer = page.frameLocator('.tox-edit-area iframe').locator('.document-background-color');
  let dialog = await settings(page);
  await dialog.getByRole('textbox', { name: '背景透明度（0–100%）', exact: true }).fill('101');
  await dialog.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(page.getByText('请输入 0 到 100 之间的透明度。', { exact: true })).toBeVisible();
  await page.getByRole('alertdialog').getByRole('button', { name: '确定', exact: true }).click();
  await dialog.getByRole('textbox', { name: '背景透明度（0–100%）', exact: true }).fill('100');
  await expect(dialog.getByRole('slider', { name: '背景透明度滑块' })).toHaveValue('100');
  await dialog.getByRole('slider', { name: '背景透明度滑块' }).press('ArrowLeft');
  await expect(dialog.getByRole('textbox', { name: '背景透明度（0–100%）', exact: true })).toHaveValue('99');
  await dialog.getByRole('slider', { name: '背景透明度滑块' }).press('End');
  await dialog.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(layer).toHaveCSS('background-color', 'rgba(255, 255, 255, 0)');
  dialog = await settings(page);
  await dialog.getByRole('button', { name: '清除背景颜色', exact: true }).click();
  await expect(layer).toHaveCount(1);
  await dialog.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(layer).toHaveCount(0);
  dialog = await settings(page); await page.setViewportSize({ width: 390, height: 844 });
  const box = (await dialog.boundingBox())!; expect(box.x).toBeGreaterThanOrEqual(0); expect(box.width).toBeLessThanOrEqual(390);
  await dialog.getByRole('tab', { name: '插入', exact: true }).click();
  await expect(dialog.getByRole('button', { name: '表情符号', exact: true })).toBeVisible();
  await page.screenshot({ path: 'screenshots/canvas-settings-mobile.png' });
});
