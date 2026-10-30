import { expect, test, type Page } from '@playwright/test';
import type { Editor } from 'tinymce';
declare global { interface Window { tinymce: { activeEditor: Editor } } }
const frame=(page:Page)=>page.frameLocator('.tox-edit-area iframe');
const original=(page:Page)=>frame(page).locator('body > p > #advanced');
async function tool(page:Page,name:string){
 if (['textfill','textcurve'].includes(name)) {
  const settings=page.locator('.tox-pop:visible [data-mce-name="textsettings"]');
  if (await settings.isDisabled()) return settings;
  await settings.click();return page.getByRole('dialog',{name:'文字设置',exact:true}).getByRole('tab',{name:name==='textfill'?'填充':'变形',exact:true});
 }
 const panel=page.locator('[data-toolbar-group="textgroupobject"]');if(!await panel.isVisible())await page.locator('.tox-pop:visible [data-mce-name="textgroupobject"]').click();await expect(panel).toBeVisible();return panel.locator(`[data-mce-name="${name}"]`);
}
async function fillDialog(page:Page){await(await tool(page,'textfill')).click();return page.getByRole('dialog',{name:'文字设置',exact:true});}
async function curve(page:Page,direction:string,strength='60'){await(await tool(page,'textcurve')).click();const d=page.getByRole('dialog',{name:'文字设置',exact:true});await d.getByRole('button',{name:direction==='up'?'上拱':direction==='down'?'下弯':'无变形',exact:true}).click();if(direction!=='none')await d.getByRole('combobox',{name:'多行处理',exact:true}).selectOption('join');if(direction!=='none')await d.getByRole('textbox',{name:'变形程度',exact:true}).fill(strength);await d.getByRole('button',{name:'应用设置',exact:true}).click();}
async function gradient(page:Page){const d=await fillDialog(page);await d.getByRole('combobox',{name:'填充类型',exact:true}).selectOption('gradient');await d.getByRole('textbox',{name:'色标颜色',exact:true}).fill('#ef4444');await d.getByRole('slider',{name:'渐变色标 2',exact:true}).click();await d.getByRole('textbox',{name:'色标颜色',exact:true}).fill('#2563eb');await d.getByRole('textbox',{name:'渐变角度（0—360°）',exact:true}).fill('90');await d.getByRole('button',{name:'应用设置',exact:true}).click();}
test.beforeEach(async({page})=>{await page.goto('/');await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);await page.evaluate(()=>{const e=window.tinymce.activeEditor;e.setContent('<p><span id="advanced" data-text-draggable="true" style="position:absolute;left:140px;top:100px;width:420px;font-size:38px;font-family:Arial;line-height:1.5"><strong style="color:#147d64">弧形文字测试</strong><br>CURVED TEXT</span></p>');e.undoManager.clear();e.undoManager.add();});await original(page).click();});
test('gradient fill preserves source formatting, is undoable and survives save/reload and static preview',async({page})=>{
 const box=original(page);const before=await page.evaluate(()=>window.tinymce.activeEditor.getContent());await gradient(page);
 const source=box.locator(':scope > [data-text-source]');await expect(source.locator('strong')).toHaveCSS('color','rgb(20, 125, 100)');await expect(source).toHaveCSS('-webkit-text-fill-color','rgba(0, 0, 0, 0)');expect(await source.evaluate(el=>getComputedStyle(el).backgroundImage)).toContain('linear-gradient');
 await page.evaluate(()=>window.tinymce.activeEditor.undoManager.undo());expect(await page.evaluate(()=>window.tinymce.activeEditor.getContent())).toBe(before);await page.evaluate(()=>window.tinymce.activeEditor.undoManager.redo());await expect(box).toHaveAttribute('data-text-fill','gradient');
 await page.getByRole('button',{name:'保存文档',exact:true}).click();await page.reload();await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);await expect(box.locator('[data-text-source]')).toHaveCSS('-webkit-text-fill-color','rgba(0, 0, 0, 0)');
 await page.getByRole('navigation',{name:'文档视图'}).getByRole('button',{name:'预览',exact:true}).click();const preview=page.frameLocator('iframe[title="文档预览"]').locator('#advanced [data-text-source]');expect(await preview.evaluate(el=>getComputedStyle(el).backgroundImage)).toContain('linear-gradient');
});
test('curve renders SVG, edits original text, switches direction and restores rich line breaks',async({page})=>{
 const box=original(page);await gradient(page);await curve(page,'up');await expect(box.locator('svg textPath')).toContainText('弧形文字测试 CURVED TEXT');await expect(box.locator('[data-text-source]')).toBeHidden();const path=await box.locator('svg path').getAttribute('d');
 expect(await box.locator('svg text').getAttribute('fill')).toMatch(/^url\(#text-/);
 await box.dblclick();await expect(box.locator('[data-text-source]')).toBeVisible();await expect(box.locator('[data-text-render]')).toBeHidden();await page.keyboard.press('End');await page.keyboard.insertText('新增');await page.keyboard.press('Escape');await expect(box.locator('svg textPath')).toContainText('新增');
 await curve(page,'down');expect(await box.locator('svg path').getAttribute('d')).not.toBe(path);
 await page.getByRole('button',{name:'保存文档',exact:true}).click();await page.reload();await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);await expect(box.locator('svg textPath')).toContainText('新增');
 expect(await page.evaluate(()=>window.tinymce.activeEditor.getContent())).not.toContain('text-advanced-editing');
 await page.getByRole('navigation',{name:'文档视图'}).getByRole('button',{name:'预览',exact:true}).click();await expect(page.frameLocator('iframe[title="文档预览"]').locator('#advanced svg textPath')).toContainText('新增');
 await page.getByRole('navigation',{name:'文档视图'}).getByRole('button',{name:'编辑',exact:true}).click();await box.click();await curve(page,'none');await expect(box.locator('textPath')).toHaveCount(0);await expect(box.locator('linearGradient')).toHaveCount(1);await expect(box.locator('[data-text-source] br')).toHaveCount(1);await expect(box.locator('[data-text-source] strong')).toHaveCSS('font-weight','700');
});
test('local image fill is embedded, supports curve patterns and duplicate IDs are independent',async({page})=>{
 const uri=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d')!;ctx.fillStyle='#f59e0b';ctx.fillRect(0,0,128,128);ctx.fillStyle='#7c3aed';ctx.fillRect(0,0,64,64);return c.toDataURL('image/png');});
 const d=await fillDialog(page);await d.getByRole('combobox',{name:'填充类型',exact:true}).selectOption('image');const chooserPromise=page.waitForEvent('filechooser');await d.getByRole('button',{name:'选择本地图片',exact:true}).click();const chooser=await chooserPromise;await chooser.setFiles({name:'texture.png',mimeType:'image/png',buffer:Buffer.from(uri.split(',')[1],'base64')});await expect(d.getByRole('combobox',{name:'填充类型',exact:true})).toHaveValue('image');await d.getByRole('button',{name:'应用设置',exact:true}).click();
 const box=original(page);await expect(box).toHaveAttribute('data-text-image',/^data:image\/png;base64,/);expect(await box.locator('[data-text-source]').evaluate(el=>getComputedStyle(el).backgroundImage)).toContain('data:image/png');await curve(page,'up');await expect(box.locator('svg pattern image')).toHaveAttribute('href',/^data:image\/png;base64,/);
 await(await tool(page,'textduplicate')).click();const all=frame(page).locator('body > p > [data-text-draggable]');await expect(all).toHaveCount(2);const ids=await all.evaluateAll(nodes=>nodes.map(el=>el.getAttribute('data-text-render-id')));expect(new Set(ids).size).toBe(2);
 for(let i=0;i<2;i++){const child=all.nth(i);expect(await child.locator('textPath').getAttribute('href')).toBe('#'+ids[i]+'-path');await expect(child.locator('path')).toHaveAttribute('id',ids[i]+'-path');}
 await page.evaluate(()=>{const e=window.tinymce.activeEditor;const copy=e.getBody().querySelectorAll<HTMLElement>('p > [data-text-draggable]')[1]!;e.dom.setStyles(copy,{left:'480px',top:'320px'});e.dispatch('ResizeContent');});
 await page.screenshot({path:'screenshots/text-advanced.png'});
 await page.getByRole('button',{name:'保存文档',exact:true}).click();await page.reload();await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);
 await expect(frame(page).locator('body > p > [data-text-draggable] svg pattern image')).toHaveCount(2);
 expect(await page.evaluate(()=>window.tinymce.activeEditor.getContent())).not.toContain('data-text-caret');
 await page.getByRole('navigation',{name:'文档视图'}).getByRole('button',{name:'预览',exact:true}).click();await expect(page.frameLocator('iframe[title="文档预览"]').locator('svg pattern image')).toHaveCount(2);
});
test('invalid/cancelled settings do not change content; lock disables advanced tools',async({page})=>{
 const before=await page.evaluate(()=>window.tinymce.activeEditor.getContent());let d=await fillDialog(page);await d.getByRole('combobox',{name:'填充类型',exact:true}).selectOption('image');await d.getByRole('textbox',{name:'图片地址（HTTPS 或本地上传）',exact:true}).fill('javascript:alert(1)');await d.getByRole('button',{name:'应用设置',exact:true}).click();await expect(d.getByRole('alert')).toBeVisible();expect(await page.evaluate(()=>window.tinymce.activeEditor.getContent())).toBe(before);await d.getByRole('button',{name:'取消',exact:true}).click();
 await(await tool(page,'textlock')).click();await expect(await tool(page,'textfill')).toBeDisabled();await expect(await tool(page,'textcurve')).toBeDisabled();
});

test('curved text follows whole-box font changes and resizing; undo restores the previous path',async({page})=>{
 await gradient(page);await curve(page,'up');const box=original(page);
 await page.evaluate(()=>window.tinymce.activeEditor.execCommand('FontSize',false,'42px'));await expect(box.locator('svg text')).toHaveAttribute('font-size','42');
 const oldPath=await box.locator('svg path').getAttribute('d');const handle=frame(page).locator('[data-text-resize="se"]');const b=(await handle.boundingBox())!;
 await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2+80,b.y+b.height/2+20,{steps:10});await page.mouse.up();
 expect(Number(await box.locator('svg text').getAttribute('font-size'))).toBeGreaterThan(42);expect(await box.locator('svg path').getAttribute('d')).not.toBe(oldPath);
 await page.evaluate(()=>window.tinymce.activeEditor.undoManager.undo());await expect(box.locator('svg text')).toHaveAttribute('font-size','42');expect(await box.locator('svg path').getAttribute('d')).toBe(oldPath);
 await box.click();const d=await fillDialog(page);await d.getByRole('combobox',{name:'填充类型',exact:true}).selectOption('none');await d.getByRole('button',{name:'应用设置',exact:true}).click();await expect(box).not.toHaveAttribute('data-text-fill');expect(await box.locator('svg text').getAttribute('fill')).not.toContain('url(');
 await curve(page,'none');await page.getByRole('button',{name:'保存文档',exact:true}).click();await page.reload();await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);await expect(box.locator('[data-text-source]')).not.toHaveCSS('-webkit-text-fill-color','rgba(0, 0, 0, 0)');
});
test('larger local textures are compressed before embedding and remain saveable',async({page})=>{
 const uri=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=c.height=512;const ctx=c.getContext('2d')!;const image=ctx.createImageData(512,512);let seed=12345;for(let i=0;i<image.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;image.data[i]=seed&255;image.data[i+1]=(seed>>>8)&255;image.data[i+2]=(seed>>>16)&255;image.data[i+3]=255;}ctx.putImageData(image,0,0);return c.toDataURL('image/png');});
 const buffer=Buffer.from(uri.split(',')[1],'base64');expect(buffer.length).toBeGreaterThan(128*1024);
 const d=await fillDialog(page);await d.getByRole('combobox',{name:'填充类型',exact:true}).selectOption('image');const request=page.waitForEvent('filechooser');await d.getByRole('button',{name:'选择本地图片',exact:true}).click();await(await request).setFiles({name:'texture-large.png',mimeType:'image/png',buffer});await expect(d.getByRole('combobox',{name:'填充类型',exact:true})).toHaveValue('image');await d.getByRole('button',{name:'应用设置',exact:true}).click();
 const box=original(page);await expect(box).toHaveAttribute('data-text-image',/^data:image\/webp;base64,/);expect((await box.getAttribute('data-text-image'))!.length).toBeLessThanOrEqual(500000);
 await page.getByRole('button',{name:'保存文档',exact:true}).click();await page.reload();await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);await expect(box).toHaveAttribute('data-text-fill','image');
});
