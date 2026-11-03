import { expect, test } from '@playwright/test';

for (const kind of ['普通', '源文本', '特效']) test(`缩放${kind}富文本时字号同步，取消和撤销恢复`, async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(kind => {
    const effects = kind === '特效';
    const editor = window.tinymce.activeEditor;
    const text = '<em><strong style="font-size:48px">测试文字</strong></em>';
    editor.setContent(`<h1><span id="words" data-text-draggable="true" ${effects ? 'data-text-stroke-enabled="true" data-text-stroke-width="1" data-text-stroke-color="#147d64"' : ''} style="position:absolute;left:160px;top:120px;width:300px;font-size:32px;line-height:1.4">${kind === '普通' ? text : `<span data-text-source="true">${text}</span>`}</span></h1>`);
    editor.undoManager.clear(); editor.undoManager.add();
  }, kind);
  const frame = page.frameLocator('.tox-edit-area iframe');
  const box = frame.locator('#words');
  if (kind === '特效') await expect(box.locator('[data-text-render]')).toBeVisible();
  await box.click();
  const panel = page.getByRole('complementary', { name: '文字配置面板' });
  const size = panel.getByRole('textbox', { name: '字号', exact: true });
  const toolbar = page.locator('.tox-toolbar input').first();
  const actualSize = () => box.locator('strong').evaluate(el => parseFloat(getComputedStyle(el).fontSize));
  const synced = async () => {
    const actual = await actualSize();
    await expect.poll(async () => parseFloat(await toolbar.inputValue())).toBeCloseTo(actual, 2);
    await expect.poll(async () => Number(await size.inputValue())).toBeCloseTo(actual, 2);
    return actual;
  };
  await expect(size).toHaveValue('48');
  const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  const resize = async (dx: number, cancel = false) => {
    const handle = (await frame.locator('[data-text-resize="se"]').boundingBox())!;
    const x = handle.x + handle.width / 2, y = handle.y + handle.height / 2;
    await page.mouse.move(x, y); await page.mouse.down();
    await page.mouse.move(x + dx, y, { steps: 5 });
    await synced();
    if (cancel) await page.keyboard.press('Escape');
    await page.mouse.up();
    return synced();
  };
  const enlarged = await resize(90); expect(enlarged).toBeGreaterThan(48);
  expect(await resize(-60)).toBeLessThan(enlarged);
  if (kind === '特效') await page.screenshot({ path: 'screenshots/text-resize-font-size.png' });
  const committed = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  await resize(50, true);
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(committed);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  await box.click(); expect(await synced()).toBeCloseTo(enlarged, 2);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  await box.click(); expect(await synced()).toBe(48);
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  await box.click(); expect(await synced()).toBeCloseTo(enlarged, 2);
});
