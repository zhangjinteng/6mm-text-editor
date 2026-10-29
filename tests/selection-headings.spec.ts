import { textTool } from './helpers/text-tools';
import { expect, test, type Page } from '@playwright/test';
import type { Editor } from 'tinymce';
declare global { interface Window { tinymce: { activeEditor: Editor } } }

async function selectText(page: Page, selector: string, start: number, end: number) {
  await page.evaluate(({ selector, start, end }) => {
    const e = window.tinymce.activeEditor; const text = e.getBody().querySelector(selector)!.firstChild!;
    const range = e.getDoc().createRange(); range.setStart(text, start); range.setEnd(text, end);
    e.focus(); e.selection.setRng(range); e.nodeChanged(); e.dispatch('mouseup');
  }, { selector, start, end });
}
test.beforeEach(async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
});

test('拖动文字中选中一个字，H2/H3 仅改变选区，支持撤销和保存', async ({ page }) => {
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    e.setContent('<h3 id="block"><span data-text-draggable="true" style="position:absolute;left:200px;top:60px;width:320px;display:inline-block"><strong id="words">前面文字选后面文字</strong></span></h3>');
    e.undoManager.clear(); e.undoManager.add();
  });
  const frame = page.frameLocator('.tox-edit-area iframe');
  const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  await selectText(page, '#words', 4, 5);
  const toolbar = page.locator('.tox-pop:visible');
  await (await textTool(page, 'h2')).click();
  await expect(frame.locator('#words [data-selection-heading="h2"]')).toHaveText('选');
  await expect(frame.locator('#words [data-selection-heading="h2"]')).toHaveCSS('font-size', '21px');
  await expect(frame.locator('#words')).toHaveCSS('font-size', '18px');
  await expect(frame.locator('h3#block')).toHaveCount(1);
  await expect(frame.locator('[data-text-draggable]')).toHaveCSS('left', '200px');
  await expect((await textTool(page, 'h2'))).toHaveAttribute('aria-pressed', 'true');
  await expect((await textTool(page, 'h3'))).toHaveAttribute('aria-pressed', 'false');
  expect(await page.evaluate(() => window.tinymce.activeEditor.selection.getContent({ format: 'text' }))).toBe('选');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  await expect(frame.locator('#words [data-selection-heading="h2"]')).toHaveCSS('font-size', '21px');
  await (await textTool(page, 'h3')).click();
  await expect(frame.locator('#words [data-selection-heading="h3"]')).toHaveText('选');
  await expect(frame.locator('#words [data-selection-heading="h3"]')).toHaveCSS('font-size', '18px');
  await expect(frame.locator('#words [data-selection-heading="h2"]')).toHaveCount(0);
  await expect(frame.locator('[data-text-draggable]')).toHaveCount(1);
  await expect(frame.locator('#words')).toHaveCSS('font-size', '18px');
  await expect((await textTool(page, 'h2'))).toHaveAttribute('aria-pressed', 'false');
  await expect((await textTool(page, 'h3'))).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(frame.locator('#words [data-selection-heading="h3"]')).toHaveText('选');
});

test('字体和字号仅作用于选区；完整段落与光标模式仍可转换标题', async ({ page }) => {
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    e.setContent('<p id="normal">前面文字后面文字</p><p id="full">完整标题</p>');
  });
  const frame = page.frameLocator('.tox-edit-area iframe');
  await selectText(page, '#normal', 2, 4);
  await page.locator('[data-mce-name="fontfamily"]').click();
  await page.locator('.tox-menu:visible').getByText('Arial', { exact: true }).click();
  const selected = frame.locator('#normal span');
  await expect(selected).toHaveText('文字');
  await expect(selected).toHaveCSS('font-family', /arial/i);
  await expect(frame.locator('#normal')).toHaveCSS('font-size', '15px');
  await page.evaluate(() => window.tinymce.activeEditor.execCommand('FontSize', false, '30px'));
  await expect(selected).toHaveCSS('font-size', '30px');
  await expect(frame.locator('#normal')).toHaveCSS('font-size', '15px');
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor; e.focus(); e.selection.select(e.getBody().querySelector('#full')!, true); e.nodeChanged();
    e.execCommand('mceToggleFormat', false, 'h2');
  });
  await expect(frame.locator('h2#full')).toHaveText('完整标题');
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor; e.selection.setCursorLocation(e.getBody().querySelector('#full')!, 0); e.execCommand('FormatBlock', false, 'h3');
  });
  await expect(frame.locator('h3#full')).toHaveText('完整标题');
});

test('已有字号和字体的拖动文字局部转换不拆分定位外层，顶部标题命令也遵守选区', async ({ page }) => {
  await page.evaluate(() => window.tinymce.activeEditor.setContent('<p><span id="drag" data-text-draggable="true" style="position:absolute;left:200px;top:60px;width:320px;display:inline-block;font-size:24px;color:rgb(200,0,0);font-family:Arial">甲乙丙丁</span></p>'));
  await selectText(page, '#drag', 1, 2);
  await page.evaluate(() => window.tinymce.activeEditor.execCommand('FormatBlock', false, 'h2'));
  const frame = page.frameLocator('.tox-edit-area iframe');
  await expect(frame.locator('[data-text-draggable]')).toHaveCount(1);
  await expect(frame.locator('#drag')).toHaveCSS('font-size', '24px');
  await expect(frame.locator('#drag [data-selection-heading="h2"]')).toHaveText('乙');
  await expect(frame.locator('#drag [data-selection-heading="h2"]')).toHaveCSS('font-size', '21px');
  await expect(frame.locator('#drag [data-selection-heading="h2"]')).toHaveCSS('font-family', 'Arial');
  await expect(frame.locator('#drag [data-selection-heading="h2"]')).toHaveCSS('color', 'rgb(200, 0, 0)');
});
