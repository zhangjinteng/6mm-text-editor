import { textTool } from './helpers/text-tools';
import { expect, test } from '@playwright/test';
import type { Editor } from 'tinymce';
declare global { interface Window { tinymce: { activeEditor: Editor } } }

for (const full of [false, true]) {
  test(`文字工具栏背景色与清除格式保留定位外层，支持撤销（${full ? '整段' : '局部'}）`, async ({ page }) => {
    await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
    await page.evaluate(full => {
      const e = window.tinymce.activeEditor;
      e.setContent('<p><span data-text-draggable="true" style="position:absolute;left:150px;top:80px;display:inline-block;width:300px;font-size:24px;color:rgb(200,0,0);z-index:5"><strong id="words">前面选中后面</strong></span></p>');
      e.undoManager.clear(); e.undoManager.add();
      const text = e.getBody().querySelector('#words')!.firstChild!;
      const range = e.getDoc().createRange(); range.setStart(text, full ? 0 : 2); range.setEnd(text, full ? text.textContent!.length : 4);
      e.focus(); e.selection.setRng(range); e.nodeChanged(); e.dispatch('mouseup');
    }, full);
    const toolbar = page.locator('.tox-pop:visible');
    const frame = page.frameLocator('.tox-edit-area iframe');
    await (await textTool(page, 'backcolor-chevron')).click();
    await page.locator('[data-mce-color="#E03E2D"]').click();
    await expect(frame.locator('.document-background-color')).toHaveCount(0);
    const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
    expect(before).toContain('background-color: #e03e2d');
    await (await textTool(page, 'removeformat')).click();
    const wrapper = frame.locator('[data-text-draggable]');
    await expect(wrapper).toHaveCount(1);
    await expect(wrapper).toHaveCSS('position', 'absolute'); await expect(wrapper).toHaveCSS('left', '150px'); await expect(wrapper).toHaveCSS('top', '80px');
    await expect(wrapper).toHaveCSS('width', '300px'); await expect(wrapper).toHaveCSS('z-index', '5');
    await expect(wrapper).toHaveText('前面选中后面');
    const cleaned = await page.evaluate(() => window.tinymce.activeEditor.getContent());
    expect(cleaned).not.toContain('background-color: #e03e2d');
    if (full) await expect(wrapper.locator('strong')).toHaveCount(0);
    else {
      await expect(wrapper.locator('strong')).toHaveText(['前面', '后面']);
      await expect(wrapper).toHaveCSS('font-size', '15px');
    }
    await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
    expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
    await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
    expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(cleaned);
  });
}

test('清除局部标题后同时清除标题标记，按钮高亮恢复', async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor; e.setContent('<p>前选后</p>');
    const text = e.getBody().querySelector('p')!.firstChild!; const range = e.getDoc().createRange(); range.setStart(text, 1); range.setEnd(text, 2);
    e.focus(); e.selection.setRng(range); e.nodeChanged(); e.dispatch('mouseup');
  });
  const toolbar = page.locator('.tox-pop:visible');
  await (await textTool(page, 'h2')).click();
  await (await textTool(page, 'removeformat')).click();
  await expect(page.frameLocator('.tox-edit-area iframe').locator('[data-selection-heading]')).toHaveCount(0);
  await expect((await textTool(page, 'h2'))).toHaveAttribute('aria-pressed', 'false');
});
