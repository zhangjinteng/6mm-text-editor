import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import type { Editor } from 'tinymce';
declare global { interface Window { tinymce: { activeEditor: Editor } } }

test('画布透明度支持换色保留、撤销、完全透明和保存预览导出', async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => window.tinymce.activeEditor.setContent('<p><strong>前景不透明</strong></p>'));
  const frame = page.frameLocator('.tox-edit-area iframe');
  const layer = frame.locator('.document-background-color');
  const openCanvas = async () => {
    const area = (await page.locator('.tox-edit-area iframe').boundingBox())!;
    await page.mouse.click(area.x + 300, area.y + 220);
  };
  const setTransparency = async (value: string) => {
    await openCanvas();
    await page.locator('.tox-pop [data-mce-name="canvasopacity"]').click();
    const dialog = page.getByRole('dialog', { name: '背景透明度', exact: true });
    await dialog.getByRole('textbox', { name: '透明度（0–100%）', exact: true }).fill(value);
    await dialog.getByRole('button', { name: '保存', exact: true }).click();
  };
  await openCanvas();
  await page.locator('.tox-pop [data-mce-name="backcolor-chevron"]').click();
  await page.locator('[data-mce-color="#E03E2D"]').click();
  await setTransparency('60');
  await expect(layer).toHaveCSS('background-color', 'rgba(224, 62, 45, 0.4)');
  await expect(frame.locator('strong')).toHaveCSS('opacity', '1');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  await expect(layer).toHaveCSS('background-color', 'rgb(224, 62, 45)');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  await expect(layer).toHaveCSS('background-color', 'rgba(224, 62, 45, 0.4)');
  await openCanvas();
  await page.locator('.tox-pop [data-mce-name="backcolor-chevron"]').click();
  await page.locator('[data-mce-color="#3598DB"]').click();
  await expect(layer).toHaveCSS('background-color', 'rgba(53, 152, 219, 0.4)');
  await setTransparency('100');
  await expect(layer).toHaveCSS('background-color', 'rgba(53, 152, 219, 0)');
  await setTransparency('60');
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(layer).toHaveCSS('background-color', 'rgba(53, 152, 219, 0.4)');
  await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  await expect(page.frameLocator('iframe[title="文档预览"]').locator('.document-background-color')).toHaveCSS('background-color', 'rgba(53, 152, 219, 0.4)');
  await page.getByRole('button', { name: '导出', exact: true }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'HTML 文档', exact: true }).click();
  expect(await readFile(await (await download).path(), 'utf8')).toContain('rgba(53, 152, 219, 0.4)');
});

test('点击空白显示画布背景色工具，色板自定义清除支持保存、预览、导出和撤销', async ({ page }) => {
  await page.goto('/');await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);
  await page.evaluate(()=>{
    const e=window.tinymce.activeEditor;
    e.setContent('<p><strong>文字不染色</strong></p>');e.undoManager.clear();e.undoManager.add();
  });
  const open=async()=>{
    const box=(await page.locator('.tox-edit-area iframe').boundingBox())!;
    await page.mouse.click(box.x+250,box.y+200);
    const toolbar=page.locator('.tox-pop .tox-toolbar');
    await expect(toolbar.locator('[data-mce-name="backcolor"]')).toBeVisible();
    await expect(toolbar.locator('[data-mce-name="forecolor"]')).toHaveCount(0);
    await toolbar.locator('[data-mce-name="backcolor-chevron"]').click();
  };
  await open();
  await page.locator('[data-mce-color="#E03E2D"]').click();
  const frame=page.frameLocator('.tox-edit-area iframe');const layer=frame.locator('.document-background-color');
  await expect(layer).toHaveCSS('background-color','rgb(224, 62, 45)');
  await expect(layer).toHaveCSS('pointer-events','none');
  const bounds=(await layer.boundingBox())!,area=(await page.locator('.tox-edit-area iframe').boundingBox())!;
  expect(bounds.width).toBeCloseTo(area.width,0);expect(bounds.height).toBeCloseTo(area.height,0);
  await expect(frame.locator('strong')).toHaveCSS('color','rgb(37, 52, 47)');
  await page.evaluate(()=>window.tinymce.activeEditor.undoManager.undo());await expect(layer).toHaveCount(0);
  await page.evaluate(()=>window.tinymce.activeEditor.undoManager.redo());await expect(layer).toHaveCount(1);
  await open();await page.locator('[data-mce-name="Custom color"]').click();
  const dialog=page.getByRole('dialog',{name:'选色器'});
  await dialog.getByRole('textbox',{name:'十六进制颜色代码',exact:true}).fill('123456');
  await dialog.getByRole('button',{name:'保存',exact:true}).click();
  await expect(layer).toHaveCSS('background-color','rgb(18, 52, 86)');
  await page.getByRole('button',{name:'保存文档',exact:true}).click();await page.reload();await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);
  await expect(layer).toHaveCSS('background-color','rgb(18, 52, 86)');
  await page.getByRole('navigation',{name:'文档视图'}).getByRole('button',{name:'预览',exact:true}).click();
  await expect(page.frameLocator('iframe[title="文档预览"]').locator('.document-background-color')).toHaveCSS('background-color','rgb(18, 52, 86)');
  await page.getByRole('button',{name:'导出',exact:true}).click();
  const downloaded=page.waitForEvent('download');
  await page.getByRole('button',{name:'HTML 文档',exact:true}).click();
  const html=await readFile(await (await downloaded).path(),'utf8');
  expect(html).toContain('document-background-color');expect(html).toContain('background-color:');
  await page.getByRole('navigation',{name:'文档视图'}).getByRole('button',{name:'编辑',exact:true}).click();
  await open();await page.locator('[data-mce-name="Remove color"]').click();await expect(layer).toHaveCount(0);
});

test('顶部与空白工具栏复用同一个原生 backcolor，分别设置画布底色和文字背景', async ({ page }) => {
  await page.goto('/');await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);
  await page.evaluate(()=>window.tinymce.activeEditor.setContent('<p><strong>共用背景色控件</strong></p>'));
  expect(await page.evaluate(()=>Boolean(window.tinymce.activeEditor.ui.registry.getAll().buttons.canvasbackground))).toBe(false);
  const area=(await page.locator('.tox-edit-area iframe').boundingBox())!;
  await page.mouse.click(area.x+300,area.y+200);
  await expect(page.locator('.tox-pop [data-mce-name="backcolor"]')).toBeVisible();
  const topButton=page.locator('.tox-tinymce [data-mce-name="backcolor-chevron"]');
  await topButton.click();await page.locator('[data-mce-color="#E03E2D"]').click();
  const frame=page.frameLocator('.tox-edit-area iframe');
  await expect(frame.locator('.document-background-color')).toHaveCSS('background-color','rgb(224, 62, 45)');
  await expect(frame.locator('strong')).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
  await frame.locator('strong').click();
  await page.evaluate(()=>{
    const e=window.tinymce.activeEditor;e.selection.select(e.getBody().querySelector('strong')!,true);e.fire('mouseup');
  });
  await topButton.click();await page.locator('[data-mce-color="#3598DB"]').click();
  const textBackground=frame.locator('strong span[style*="background-color"], span[style*="background-color"]:has(strong)');
  await expect(textBackground).toHaveCSS('background-color','rgb(53, 152, 219)');
  await expect(frame.locator('.document-background-color')).toHaveCSS('background-color','rgb(224, 62, 45)');
});
