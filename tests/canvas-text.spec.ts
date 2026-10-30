import { expect, test, type Page } from '@playwright/test';
import type { Editor } from 'tinymce';
declare global { interface Window { tinymce: { activeEditor: Editor } } }

async function openTextDialog(page: Page) {
  const area = (await page.locator('.tox-edit-area iframe').boundingBox())!;
  await page.mouse.click(area.x + 250, area.y + 170);
  await page.locator('.tox-pop:visible [data-mce-name="canvastext"]').click();
  return page.getByRole('dialog', { name: '插入文字', exact: true });
}
test.beforeEach(async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor; e.setContent('<p>原有文字</p>'); e.undoManager.clear(); e.undoManager.add();
  });
});

test('画布插入纯文本和换行，位于点击处，可拖动、撤销重做、保存与预览', async ({ page }) => {
  const text = '第一行 <b>纯文本</b>\n第二行  保留空格';
  const dialog = await openTextDialog(page);
  await expect(dialog.getByRole('button', { name: '插入', exact: true })).toBeDisabled();
  await dialog.getByRole('textbox', { name: '文本内容', exact: true }).fill(text);
  await dialog.getByRole('button', { name: '插入', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  const frame = page.frameLocator('.tox-edit-area iframe');
  const inserted = frame.locator('[data-text-draggable]');
  await expect(inserted).toHaveText(text);
  await expect(inserted.locator('b')).toHaveCount(0);
  await expect(inserted).toHaveCSS('white-space', 'pre-wrap');
  const area = (await page.locator('.tox-edit-area iframe').boundingBox())!;
  const box = (await inserted.boundingBox())!;
  expect(box.x).toBeCloseTo(area.x + 250, 0); expect(box.y).toBeCloseTo(area.y + 170, 0);
  await inserted.click();
  const handle = (await inserted.boundingBox())!;
  await page.mouse.move(handle.x + 10, handle.y + 10); await page.mouse.down();
  await page.mouse.move(handle.x + 50, handle.y + 40, { steps: 4 }); await page.mouse.up();
  const moved = (await inserted.boundingBox())!;
  expect(moved.x).toBeCloseTo(box.x + 40, 0); expect(moved.y).toBeCloseTo(box.y + 30, 0);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  expect((await inserted.boundingBox())!.x).toBeCloseTo(box.x, 0);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  await expect(inserted).toHaveCount(0);
  await expect(frame.locator('body')).toHaveText('原有文字');
  await page.evaluate(() => { const e = window.tinymce.activeEditor; e.undoManager.redo(); e.undoManager.redo(); });
  await expect(inserted).toHaveText(text);
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(inserted).toHaveText(text);
  expect((await inserted.boundingBox())!.x).toBeCloseTo(moved.x, 0);
  await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  await expect(page.frameLocator('iframe[title="文档预览"]').locator('[data-text-draggable]')).toHaveText(text);
});

test('取消或仅输入空格不插入文字，按钮只存在于画布工具栏', async ({ page }) => {
  const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  const dialog = await openTextDialog(page);
  await dialog.getByRole('textbox', { name: '文本内容', exact: true }).fill('  \n  ');
  await expect(dialog.getByRole('button', { name: '插入', exact: true })).toBeDisabled();
  await dialog.getByRole('button', { name: '取消', exact: true }).click();
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await page.frameLocator('.tox-edit-area iframe').getByText('原有文字', { exact: true }).click({ position: { x: 10, y: 10 } });
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor; e.focus(); e.selection.select(e.getBody().querySelector('p')!, true); e.nodeChanged(); e.dispatch('mouseup');
  });
  await expect(page.locator('.tox-pop:visible [data-mce-name="textgroupstyle"]')).toBeVisible();
  await expect(page.locator('.tox-pop:visible [data-mce-name="canvastext"]')).toHaveCount(0);
});
