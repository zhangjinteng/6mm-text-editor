import { expect, test } from '@playwright/test';
import type { Editor } from 'tinymce';
declare global { interface Window { tinymce: { activeEditor: Editor } } }

test.beforeEach(async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto('/');await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);
  await page.evaluate(async()=>{
    const canvas=document.createElement('canvas');canvas.width=100;canvas.height=80;canvas.getContext('2d')!.fillRect(0,0,100,80);
    const e=window.tinymce.activeEditor;e.setContent(`<p>前面的文字</p><p><img id="original" alt="复制测试" src="${canvas.toDataURL()}" data-image-crop='{"x":0.1,"y":0,"width":0.8,"height":1}' style="position:absolute;left:150px;top:130px;width:100px;height:80px;object-view-box:inset(0% 10% 0% 10%)"></p><p id="text">普通文字</p>`);
    await e.uploadImages();e.undoManager.clear();e.undoManager.add();
  });
  const localSource=await page.frameLocator('.tox-edit-area iframe').locator('img').getAttribute('src');
  const url='https://images.example.test/copy.png';
  await page.route(url,route=>route.fulfill({contentType:'image/png',body:Buffer.from(localSource!.split(',')[1]!, 'base64')}));
  await page.evaluate(url=>{
    const e=window.tinymce.activeEditor;e.dom.setAttrib(e.getBody().querySelector('img')!,'src',url);e.undoManager.clear();e.undoManager.add();
  },url);
  await expect.poll(()=>page.frameLocator('.tox-edit-area iframe').locator('img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
});

test('真实快捷键复制定位图片并连续粘贴，副本错开且保留裁剪，支持撤销和保存', async ({ page }) => {
  const frame=page.frameLocator('.tox-edit-area iframe');const images=frame.locator('img');
  await frame.locator('#original').click();await page.keyboard.press('ControlOrMeta+c');await page.keyboard.press('ControlOrMeta+v');
  await expect(images).toHaveCount(2);
  await expect(images.nth(0)).toHaveCSS('left','150px');await expect(images.nth(1)).toHaveCSS('left','174px');
  await expect(images.nth(1)).toHaveCSS('top','154px');await expect(images.nth(1)).toHaveAttribute('data-image-crop');
  await expect(frame.locator('#original')).toHaveCount(1);
  await expect(images.nth(1)).toHaveCSS('object-view-box','inset(0% 10%)');
  await page.keyboard.press('ControlOrMeta+v');await expect(images).toHaveCount(3);await expect(images.nth(2)).toHaveCSS('left','198px');
  await expect.poll(()=>page.evaluate(()=>{const levels=window.tinymce.activeEditor.undoManager.data;return (levels.at(-1)?.content.match(/<img/g)||[]).length;})).toBe(3);
  await page.locator('.tox-tinymce [data-mce-name="undo"]').click();await expect(images).toHaveCount(2);
  await page.getByRole('button',{name:'保存文档',exact:true}).click();await page.reload();await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);
  await expect(images).toHaveCount(2);await expect(images.nth(1)).toHaveCSS('left','174px');
});

test('普通图片也能复制粘贴，文字替换与剪切仍保持原生行为', async ({ page }) => {
  const frame=page.frameLocator('.tox-edit-area iframe');const images=frame.locator('img');
  await page.evaluate(()=>window.tinymce.activeEditor.dom.setStyles(window.tinymce.activeEditor.getBody().querySelector('img')!,{position:'static',left:'auto',top:'auto'}));
  await images.click();await page.keyboard.press('ControlOrMeta+c');await page.keyboard.press('ControlOrMeta+v');await expect(images).toHaveCount(2);
  await images.nth(1).click();await page.keyboard.press('ControlOrMeta+x');await expect(images).toHaveCount(1);
  await page.keyboard.press('ControlOrMeta+v');await expect(images).toHaveCount(2);
  await frame.locator('#text').click();
  await page.evaluate(()=>{const e=window.tinymce.activeEditor;e.selection.select(e.getBody().querySelector('#text')!,true);});
  await page.keyboard.press('ControlOrMeta+c');
  await page.keyboard.press('ControlOrMeta+v');await expect(frame.locator('#text')).toHaveText('普通文字');
  await expect(images).toHaveCount(2);
});
