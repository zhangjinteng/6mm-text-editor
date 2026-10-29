import { expect, test } from '@playwright/test';
import type { Editor } from 'tinymce';
declare global { interface Window { tinymce: { activeEditor: Editor } } }

test('设为背景覆盖编辑区、不遮挡编辑，支持替换移除、撤销及保存预览', async ({ page }) => {
  await page.goto('/');await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);
  await page.evaluate(async()=>{
    const canvas=document.createElement('canvas');canvas.width=200;canvas.height=100;
    const ctx=canvas.getContext('2d')!;ctx.fillStyle='#a3d9c0';ctx.fillRect(0,0,200,100);
    const first=canvas.toDataURL();ctx.fillStyle='#efb366';ctx.fillRect(0,0,200,100);const second=canvas.toDataURL();
    const e=window.tinymce.activeEditor;
    e.setContent(`<p><strong>背景上可编辑文字</strong></p><div style="position:relative;transform:translateX(5px);overflow:hidden;width:120px;height:90px"><img id="source" src="${first}" style="width:120px;height:90px"></div><p><img id="other" src="${second}" style="position:absolute;left:300px;top:150px;width:160px;height:80px"></p>`);
    await e.uploadImages();e.undoManager.clear();e.undoManager.add();
  });
  const frame=page.frameLocator('.tox-edit-area iframe');
  await frame.locator('#source').click();await page.locator('.tox-pop [data-mce-name="imagebackground"]').click();
  const background=frame.locator('img[data-document-background]');
  await expect(background).toHaveCount(1);await expect(background).toHaveAttribute('id','source');
  await expect(background).toHaveCSS('position','fixed');await expect(background).toHaveCSS('object-fit','cover');
  await expect(background).toHaveCSS('z-index','-1');await expect(background).toHaveCSS('pointer-events','none');
  const area=(await page.locator('.tox-edit-area iframe').boundingBox())!;const box=(await background.boundingBox())!;
  expect(box.x).toBeCloseTo(area.x,0);expect(box.y).toBeCloseTo(area.y,0);expect(box.width).toBeCloseTo(area.width,0);expect(box.height).toBeCloseTo(area.height,0);
  await page.locator('.tox-edit-area').screenshot({path:'screenshots/image-background.png'});
  await page.evaluate(()=>window.tinymce.activeEditor.undoManager.undo());
  await expect(background).toHaveCount(0);await expect(frame.locator('div > #source')).toHaveCount(1);
  await page.evaluate(()=>window.tinymce.activeEditor.undoManager.redo());await expect(background).toHaveCount(1);
  await frame.locator('strong').click();await page.keyboard.press('End');await page.keyboard.insertText('可继续输入');
  await expect(frame.locator('strong')).toContainText('可继续输入');
  await frame.locator('#other').click();await page.locator('.tox-pop [data-mce-name="imagebackground"]').click();
  await expect(background).toHaveCount(1);await expect(background).toHaveAttribute('id','other');
  await page.getByRole('menuitem',{name:'格式',exact:true}).click();
  await page.getByRole('menuitem',{name:'移除图片背景',exact:true}).click();await expect(background).toHaveCount(0);
  await page.evaluate(()=>window.tinymce.activeEditor.undoManager.undo());await expect(background).toHaveCount(1);
  await page.getByRole('button',{name:'保存文档',exact:true}).click();await page.reload();await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);
  await expect(background).toHaveAttribute('id','other');await expect(background).toHaveCSS('z-index','-1');
  await page.getByRole('navigation',{name:'文档视图'}).getByRole('button',{name:'预览',exact:true}).click();
  const preview=page.frameLocator('iframe[title="文档预览"]');
  await expect(preview.locator('img[data-document-background]')).toHaveCSS('object-fit','cover');
  await expect(preview.locator('img[data-document-background]')).toHaveCSS('z-index','-1');
  await expect(preview.locator('strong')).toContainText('可继续输入');
});
