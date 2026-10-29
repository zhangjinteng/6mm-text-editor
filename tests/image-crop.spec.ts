import { expect, test } from '@playwright/test';
import type { Editor } from 'tinymce';
declare global { interface Window { tinymce: { activeEditor: Editor } } }

test.beforeEach(async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(async () => {
    const canvas=document.createElement('canvas'); canvas.width=200; canvas.height=100;
    const ctx=canvas.getContext('2d')!; ctx.fillStyle='red';ctx.fillRect(0,0,100,100);ctx.fillStyle='blue';ctx.fillRect(100,0,100,100);
    const e=window.tinymce.activeEditor;
    e.setContent(`<p>裁剪测试</p><p><img src="${canvas.toDataURL()}" style="position:absolute;left:120px;top:80px;width:200px;height:100px" alt="双色测试图片"></p>`);
    await e.uploadImages();e.undoManager.clear();e.undoManager.add();
  });
});

test('图片工具栏裁剪右半边，支持撤销重做、保存预览及重新裁剪恢复原图', async ({ page }) => {
  const image=page.frameLocator('.tox-edit-area iframe').locator('img');
  const original=await image.getAttribute('src');
  await image.click(); await page.locator('.tox-pop [data-mce-name="imagecrop"]').click();
  const dialog=page.getByRole('dialog',{name:'裁剪图片',exact:true});
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('裁剪宽度百分比').fill('50');
  await dialog.getByLabel('裁剪左侧百分比').fill('50');
  await dialog.getByRole('button',{name:'应用裁剪',exact:true}).click();
  await expect(dialog).toHaveCount(0);
  await expect(image).toHaveCSS('width','100px');await expect(image).toHaveCSS('height','100px');
  await expect(image).toHaveCSS('left','120px'); await expect(image).toHaveCSS('top','80px');
  await expect(image).toHaveCSS('object-view-box','inset(0% 0% 0% 50%)');
  await expect(image).toHaveAttribute('src',original!);
  await image.screenshot({path:'screenshots/image-crop-blue.png'});
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  await expect(image).not.toHaveAttribute('data-image-crop');await expect(image).toHaveCSS('width','200px');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  await expect(image).toHaveCSS('width','100px');
  await page.getByRole('button',{name:'保存文档',exact:true}).click();await page.reload();
  await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(image).toHaveCSS('object-view-box','inset(0% 0% 0% 50%)');
  await page.getByRole('navigation',{name:'文档视图'}).getByRole('button',{name:'预览',exact:true}).click();
  await expect(page.frameLocator('iframe[title="文档预览"]').locator('img')).toHaveCSS('object-view-box','inset(0% 0% 0% 50%)');
  await page.getByRole('navigation',{name:'文档视图'}).getByRole('button',{name:'编辑',exact:true}).click();
  await image.click();await page.locator('.tox-pop [data-mce-name="imagecrop"]').click();
  await expect(dialog.getByLabel('裁剪左侧百分比')).toHaveValue('50');
  await dialog.getByRole('button',{name:'重置',exact:true}).click();
  await dialog.getByRole('button',{name:'应用裁剪',exact:true}).click();
  await expect(image).toHaveCSS('width','200px');await expect(image).toHaveCSS('object-view-box','inset(0%)');
});

test('裁剪框可拖动和缩放，取消及 Esc 不修改正文', async ({ page }) => {
  const image=page.frameLocator('.tox-edit-area iframe').locator('img');
  const before=await page.evaluate(() => window.tinymce.activeEditor.getContent());
  await image.click();await page.locator('.tox-pop [data-mce-name="imagecrop"]').click();
  const dialog=page.getByRole('dialog',{name:'裁剪图片',exact:true});
  await dialog.getByRole('button',{name:'1:1',exact:true}).click();
  const selection=dialog.locator('.crop-selection');const box=(await selection.boundingBox())!;
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
  await page.mouse.move(box.x+box.width/2+40,box.y+box.height/2,{steps:8});await page.mouse.up();
  expect(Number(await dialog.getByLabel('裁剪左侧百分比').inputValue())).toBeGreaterThan(25);
  const corner=(await dialog.getByRole('button',{name:'调整se裁剪角'}).boundingBox())!;
  await page.mouse.move(corner.x+3,corner.y+3);await page.mouse.down();await page.mouse.move(corner.x-45,corner.y-20,{steps:8});await page.mouse.up();
  expect(Number(await dialog.getByLabel('裁剪宽度百分比').inputValue())).toBeLessThan(50);
  await dialog.screenshot({path:'screenshots/image-crop-dialog.png'});
  await dialog.getByRole('button',{name:'取消',exact:true}).click();
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await image.click();await page.locator('.tox-pop [data-mce-name="imagecrop"]').click();
  await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
});

test('没有 CORS 授权的远程图片也可裁剪，保留原始 URL', async ({ page }) => {
  const source=await page.frameLocator('.tox-edit-area iframe').locator('img').getAttribute('src');
  const remote='https://i0.hdslb.com/crop-fixture.png';
  await page.route(remote, route=>route.fulfill({contentType:'image/png',body:Buffer.from(source!.split(',')[1]!, 'base64')}));
  await page.evaluate(url => {
    const e=window.tinymce.activeEditor;
    e.dom.setAttrib(e.getBody().querySelector('img')!, 'src', url);
  }, remote);
  const image=page.frameLocator('.tox-edit-area iframe').locator('img');
  await expect.poll(()=>image.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
  await image.click();await page.locator('.tox-pop [data-mce-name="imagecrop"]').click();
  const dialog=page.getByRole('dialog',{name:'裁剪图片',exact:true});
  await dialog.getByRole('button',{name:'1:1',exact:true}).click();
  await dialog.getByRole('button',{name:'应用裁剪',exact:true}).click();
  await expect(image).toHaveAttribute('src',remote);
  await expect(image).toHaveCSS('width','100px');await expect(image).toHaveCSS('height','100px');
  await expect(image).toHaveAttribute('data-image-crop',JSON.stringify({x:0.25,y:0,width:0.5,height:1}));
});
