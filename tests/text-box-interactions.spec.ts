import { expect, test, type Page, type Locator } from '@playwright/test';
import type { Editor } from 'tinymce';
declare global { interface Window { tinymce: { activeEditor: Editor } } }
async function drag(page: Page, locator: Locator, dx: number, dy: number, cancel = false) {
  const b = (await locator.boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2 + dx, b.y + b.height / 2 + dy, { steps: 10 });
  if (cancel) await page.keyboard.press('Escape');
  await page.mouse.up();
}
test.beforeEach(async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    e.setContent('<p><span data-text-draggable="true" style="position:absolute;left:150px;top:120px;width:300px;font-size:20px;line-height:1.5">文字编辑测试 ABCDEFGHIJKLMNOPQRSTUVWXYZ 一二三四五六七八九十</span></p>');
    e.undoManager.clear(); e.undoManager.add();
  });
});
test('single click selects; direct drag moves; double click edits and drag selects characters; Escape returns to object mode', async ({ page }) => {
  const frame = page.frameLocator('.tox-edit-area iframe'); const box = frame.locator('[data-text-draggable]');
  await box.click(); await expect(frame.locator('body')).toHaveClass(/text-object-selected/);
  await page.screenshot({ path: 'screenshots/text-box-controls.png' });
  const before = (await box.boundingBox())!;
  await drag(page, box, 80, 40);
  const moved = (await box.boundingBox())!; expect(moved.x - before.x).toBeCloseTo(80, 0); expect(moved.y - before.y).toBeCloseTo(40, 0);
  await box.dblclick(); await expect(frame.locator('body')).toHaveClass(/text-content-editing/);
  const text = await box.textContent();
  const b = (await box.boundingBox())!;
  await page.mouse.move(b.x + 5, b.y + 10); await page.mouse.down(); await page.mouse.move(b.x + 100, b.y + 10, { steps: 10 }); await page.mouse.up();
  expect(await page.evaluate(() => window.tinymce.activeEditor.selection.getContent({ format: 'text' }))).not.toBe('');
  expect((await box.boundingBox())!.x).toBeCloseTo(moved.x, 0);
  await page.keyboard.type('替换'); expect(await box.textContent()).not.toBe(text);
  await page.keyboard.press('Escape'); await expect(frame.locator('body')).toHaveClass(/text-object-selected/);
  await drag(page, box, 50, 20, true); expect((await box.boundingBox())!.x).toBeCloseTo(moved.x, 0);
});
test('corner scales fonts; side changes wrapping without font changes; undo redo and reload preserve geometry', async ({ page }) => {
  const frame = page.frameLocator('.tox-edit-area iframe'); const box = frame.locator('[data-text-draggable]');
  await box.click(); const before = (await box.boundingBox())!;
  await drag(page, frame.locator('[data-text-resize="se"]'), 90, 0);
  const enlarged = (await box.boundingBox())!; expect(enlarged.width).toBeGreaterThan(before.width + 80);
  const font = await box.evaluate(el => parseFloat(getComputedStyle(el).fontSize)); expect(font).toBeGreaterThan(20);
  await drag(page, frame.locator('[data-text-resize="w"]'), 180, 0);
  const narrowed = (await box.boundingBox())!;
  expect(narrowed.width).toBeCloseTo(enlarged.width - 180, 0); expect(narrowed.x + narrowed.width).toBeCloseTo(enlarged.x + enlarged.width, 0);
  expect(await box.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBe(font);
  expect(narrowed.height).toBeGreaterThan(enlarged.height);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo()); expect((await box.boundingBox())!.width).toBeCloseTo(enlarged.width, 0);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo()); expect((await box.boundingBox())!.width).toBeCloseTo(narrowed.width, 0);
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  expect((await box.boundingBox())!.width).toBeCloseTo(narrowed.width, 0);
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).not.toContain('text-box-frame');
});
test('ordinary paragraphs become text boxes while tables remain native', async ({ page }) => {
  await page.evaluate(() => window.tinymce.activeEditor.setContent('<p>普通段落文字</p><table><tbody><tr><td>表格内容</td></tr></tbody></table>'));
  const frame = page.frameLocator('.tox-edit-area iframe');
  await frame.getByText('普通段落文字', { exact: true }).click({ position: { x: 10, y: 10 } });
  await expect(frame.locator('p > [data-text-draggable]')).toHaveText('普通段落文字');
  await frame.locator('td').click(); await expect(frame.locator('td [data-text-draggable]')).toHaveCount(0);
});
test('editing keeps Enter inside the text box; object mode blocks typing; cancelled resize leaves no history or preview styles', async ({ page }) => {
  const frame = page.frameLocator('.tox-edit-area iframe'); const box = frame.locator('[data-text-draggable]');
  await box.click(); const original = await box.textContent();
  await page.keyboard.type('ignored'); expect(await box.textContent()).toBe(original);
  await box.dblclick(); await page.keyboard.press('End'); await page.keyboard.press('Enter'); await page.keyboard.type('new line');
  await expect(box).toContainText('new line'); await expect(box).toHaveCount(1); await expect(box.locator('br')).toHaveCount(1);
  await page.keyboard.press('Escape'); const before = (await box.boundingBox())!;
  const content = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  await drag(page, frame.locator('[data-text-resize="nw"]'), -50, -50, true);
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(content);
  expect((await box.boundingBox())!.width).toBeCloseTo(before.width, 0);
});
