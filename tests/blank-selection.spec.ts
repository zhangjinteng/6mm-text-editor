import { expect, test } from '@playwright/test';
import type { Editor } from 'tinymce';
declare global { interface Window { tinymce: { activeEditor: Editor } } }

test('图片选中后点击画布及行尾空白，只取消选中，不激活远处文字', async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);
  await page.evaluate(async()=>{
    const e=window.tinymce.activeEditor;
    const canvas=document.createElement('canvas');canvas.width=80;canvas.height=80;canvas.getContext('2d')!.fillRect(0,0,80,80);
    e.setContent(`<h3><span data-text-draggable="true" style="position:absolute;left:400px;top:40px;display:inline-block"><em>定位文字</em></span></h3><p><img src="${canvas.toDataURL()}" style="position:absolute;left:200px;top:200px;width:80px;height:80px"></p><p id="plain" style="position:absolute;top:310px;left:100px;width:700px">普通段落文字</p>`);
    await e.uploadImages();
  });
  const frame=page.frameLocator('.tox-edit-area iframe');const text=frame.locator('[data-text-draggable]');
  const image=frame.locator('img');const imageBefore=await image.boundingBox();const textBefore=await text.boundingBox();
  const area=(await page.locator('.tox-edit-area iframe').boundingBox())!;
  const handle=frame.getByRole('button',{name:'拖动文字',exact:true});
  for (const [x,y] of [[700,180],[700,325]]) {
    await image.click();await expect(page.locator('.tox-pop [data-mce-name="imagefill"]')).toBeVisible();
    await page.mouse.click(area.x+x,area.y+y);await page.waitForTimeout(150);
    await expect(handle).toBeHidden();await expect(page.locator('.tox-pop [data-mce-name="backcolor"]')).toBeVisible();
    await expect(page.locator('.tox-pop [data-mce-name="textdrag"]')).toHaveCount(0);
    await expect(page.locator('.tox-pop [data-mce-name="imagefill"]')).toHaveCount(0);
    await expect(frame.locator('.object-selection-frame')).toBeHidden();
    expect(await image.boundingBox()).toEqual(imageBefore);expect(await text.boundingBox()).toEqual(textBefore);
    expect(await page.evaluate(()=>window.tinymce.activeEditor.selection.getNode().closest('[data-text-draggable]')!==null)).toBe(false);
  }
  await text.click();await expect(handle).toBeVisible();
  await expect(page.locator('.tox-pop [data-mce-name="textdrag"]')).toBeVisible();
  await page.keyboard.press('End');await page.keyboard.down('Shift');await page.keyboard.press('Home');await page.keyboard.up('Shift');
  await expect(page.locator('.tox-pop [data-mce-name="textgroupstyle"]')).toBeVisible();
  expect(await page.evaluate(()=>window.tinymce.activeEditor.selection.getContent({format:'text'}))).not.toBe('');
  await page.mouse.click(area.x+800,area.y+400);await expect(handle).toBeHidden();
  await frame.locator('#plain').click({position:{x:25,y:14}});
  await page.keyboard.press('End');await page.keyboard.insertText('新增');
  await expect(frame.locator('#plain')).toContainText('新增');
});
