import { expect, test } from '@playwright/test';
import type { Editor } from 'tinymce';
declare global { interface Window { tinymce: { activeEditor: Editor } } }

test('空段落与画布空白共用按钮组，按 Enter 进入空段落也可设置画布底色', async ({ page }) => {
  await page.goto('/');await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);
  await page.evaluate(()=>{
    const e=window.tinymce.activeEditor;e.setContent('<p id="start">正文</p>');e.focus();e.selection.setCursorLocation(e.getBody().querySelector('p')!.firstChild!,2);
  });
  await page.keyboard.press('Enter');
  const toolbar=page.locator('.tox-pop .tox-toolbar');
  await expect(toolbar.locator('[data-mce-name="backcolor"]')).toBeVisible();
  const names=()=>toolbar.locator('[data-mce-name]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('data-mce-name')));
  const emptyItems=await names();
  expect(emptyItems).toContain('canvastext');expect(emptyItems).toContain('canvasimage');expect(emptyItems).toContain('emoticons');
  expect(emptyItems).not.toContain('quickimage');expect(emptyItems).not.toContain('quicktable');expect(emptyItems).not.toContain('layersettings');
  expect(emptyItems.filter(name=>name==='toolbarposition')).toHaveLength(1);
  await toolbar.locator('[data-mce-name="backcolor-chevron"]').click();await page.locator('[data-mce-color="#BFEDD2"]').click();
  await expect(page.frameLocator('.tox-edit-area iframe').locator('.document-background-color')).toHaveCSS('background-color','rgb(191, 237, 210)');
  await page.evaluate(()=>{const e=window.tinymce.activeEditor;e.focus();e.selection.setCursorLocation(e.getBody().querySelector('p:last-of-type')!,0);});
  await page.keyboard.insertText('新段落');
  await expect(page.frameLocator('.tox-edit-area iframe').locator('p:last-of-type')).toHaveText('新段落');
  const bounds=(await page.locator('.tox-edit-area iframe').boundingBox())!;
  await page.mouse.click(bounds.x+300,bounds.y+250);
  await expect(toolbar.locator('[data-mce-name="backcolor"]')).toBeVisible();
  expect(await names()).toEqual(emptyItems);
  expect(await page.evaluate(()=>Boolean(window.tinymce.activeEditor.ui.registry.getAll().contextToolbars.quickblock))).toBe(false);
});

test('表格内空单元格不会触发画布工具栏', async ({ page }) => {
  await page.goto('/');await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);
  await page.evaluate(()=>{
    const e=window.tinymce.activeEditor;e.setContent('<table><tbody><tr><td><p><br></p></td></tr></tbody></table>');e.focus();
    e.selection.setCursorLocation(e.getBody().querySelector('td p')!,0);e.nodeChanged();e.fire('keyup',{keyCode:39});
  });
  await expect(page.locator('.tox-pop [data-mce-name="canvastext"]')).toHaveCount(0);
  await expect(page.locator('.tox-pop [data-mce-name="canvasimage"]')).toHaveCount(0);
});
