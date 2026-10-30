import { expect, test, type Page } from '@playwright/test';
import type { Editor } from 'tinymce';
declare global { interface Window { tinymce: { activeEditor: Editor } } }
const source='<p><span id="original" data-text-draggable="true" style="position:absolute;left:160px;top:120px;width:300px;font-size:28px;z-index:2"><strong style="color:#e03e2d">文字外观</strong><br>第二行</span></p><p><span id="other" data-text-draggable="true" style="position:absolute;left:500px;top:120px;width:200px;z-index:1">其他文字</span></p>';
const frame = (page:Page) => page.frameLocator('.tox-edit-area iframe');
async function toolbar(page:Page,name:string) {
 if (name === 'textappearance') return page.locator('.tox-pop:visible [data-mce-name="textsettings"]');
 if (['textduplicate','textlock'].includes(name)) {
  const panel=page.locator('[data-toolbar-group="textgroupobject"]');
  if (!await panel.isVisible()) await page.locator('.tox-pop:visible [data-mce-name="textgroupobject"]').click();
  await expect(panel).toBeVisible(); return panel.locator(`[data-mce-name="${name}"]`);
 }
 return page.locator(`.tox-pop:visible [data-mce-name="${name}"]`);
}
async function openAppearance(page:Page){await (await toolbar(page,'textappearance')).click();const d=page.getByRole('dialog',{name:'文字设置',exact:true});await expect(d).toBeVisible();return d;}
async function drag(page:Page,locator:import('@playwright/test').Locator,dx:number,dy:number){const b=(await locator.boundingBox())!;await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2+dx,b.y+b.height/2+dy,{steps:8});await page.mouse.up();}
test.beforeEach(async({page})=>{await page.goto('/');await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);await page.evaluate(html=>{const e=window.tinymce.activeEditor;e.setContent(html);e.undoManager.clear();e.undoManager.add();},source);await frame(page).locator('body > p #original').click();});
test('duplicate retains formatting, offsets independently and supports one-step undo',async({page})=>{
 const original=frame(page).locator('body > p #original');const before=(await original.boundingBox())!;
 await (await toolbar(page,'textduplicate')).click();const boxes=frame(page).locator('[data-text-draggable]');await expect(boxes).toHaveCount(3);
 const clone=boxes.nth(1);const b=(await clone.boundingBox())!;expect(b.x-before.x).toBeCloseTo(24,0);expect(b.y-before.y).toBeCloseTo(24,0);
 await expect(clone.locator('strong')).toHaveCSS('color','rgb(224, 62, 45)');await expect(clone).not.toHaveAttribute('id');
 await drag(page,clone,50,40);expect((await original.boundingBox())!.x).toBeCloseTo(before.x,0);
 await page.evaluate(()=>{const e=window.tinymce.activeEditor;e.undoManager.undo();e.undoManager.undo();});await expect(boxes).toHaveCount(2);
 await page.evaluate(()=>window.tinymce.activeEditor.undoManager.redo());await expect(boxes).toHaveCount(3);
});
test('locked text remains selectable and unlockable; gestures, typing, delete, formatting and layers are blocked after reload',async({page})=>{
 const original=frame(page).locator('body > p #original');const before=(await original.boundingBox())!;
 await (await toolbar(page,'textlock')).click();await expect(original).toHaveAttribute('data-text-locked','true');await expect(original).toHaveAttribute('contenteditable','false');
 await expect(await toolbar(page,'textlock')).toHaveAttribute('aria-pressed','true');await expect(await toolbar(page,'textappearance')).toBeDisabled();await expect(await toolbar(page,'layersettings')).toBeDisabled();
 await expect(frame(page).locator('[data-text-resize="se"]')).toBeHidden();await drag(page,original,70,50);expect((await original.boundingBox())!.x).toBeCloseTo(before.x,0);
 await original.dblclick();await expect(frame(page).locator('body')).not.toHaveClass(/text-content-editing/);
 await page.keyboard.press('Backspace');await page.keyboard.type('禁止输入');await expect(original).toHaveText('文字外观第二行');
 const saved=await page.evaluate(()=>window.tinymce.activeEditor.getContent());await page.evaluate(()=>window.tinymce.activeEditor.execCommand('FontSize',false,'60px'));expect(await page.evaluate(()=>window.tinymce.activeEditor.getContent())).toBe(saved);
 await page.getByRole('button',{name:'保存文档',exact:true}).click();await page.reload();await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);
 await original.click();await expect(await toolbar(page,'textlock')).toBeVisible();await (await toolbar(page,'textlock')).click();await expect(original).not.toHaveAttribute('data-text-locked');
 await drag(page,original,40,20);expect((await original.boundingBox())!.x).toBeCloseTo(before.x+40,0);
});
test('appearance changes are atomic, persist to reload and preview, and can be disabled',async({page})=>{
 const original=frame(page).locator('body > p #original');const before=(await original.boundingBox())!;const d=await openAppearance(page);
 await d.getByRole('textbox',{name:'整体不透明度（0—100%）',exact:true}).fill('65');
 await d.getByRole('tab',{name:'背景',exact:true}).click();await d.getByRole('button',{name:'添加背景',exact:true}).click();await d.getByRole('textbox',{name:'背景颜色',exact:true}).fill('#eef5ff');await d.getByRole('textbox',{name:'水平扩张',exact:true}).fill('12');await d.getByRole('textbox',{name:'背景圆角',exact:true}).fill('8');
 await d.getByRole('tab',{name:'描边',exact:true}).click();await d.getByText('启用文字描边',{exact:true}).click();await d.getByRole('textbox',{name:'描边颜色',exact:true}).fill('#123456');await d.getByRole('textbox',{name:'描边宽度（0—10 px）',exact:true}).fill('1.5');
 await d.getByRole('tab',{name:'投影',exact:true}).click();await d.getByRole('button',{name:'添加投影',exact:true}).click();await d.getByRole('textbox',{name:'投影颜色',exact:true}).fill('#00000080');await d.getByText('坐标偏移',{exact:true}).click();await d.getByRole('textbox',{name:'水平偏移（px）',exact:true}).fill('3');await d.getByRole('textbox',{name:'垂直偏移（px）',exact:true}).fill('2');
 await d.getByRole('button',{name:'应用设置',exact:true}).click();await expect(d).toHaveCount(0);
 await expect(original).toHaveCSS('opacity','0.65');await expect(original.locator('[data-text-background-render] path')).toHaveAttribute('fill','#eef5ff');await expect(original).toHaveCSS('padding','0px');await expect(original).toHaveAttribute('data-text-stroke-width','1.5');await expect(original.locator('[data-text-stroke-layer]')).toHaveCount(1);await expect(original).toHaveCSS('text-shadow','rgba(0, 0, 0, 0.5) 3px 2px 4px');
 await toolbar(page,'textappearance'); await page.screenshot({path:'screenshots/text-object-tools.png'});
 expect((await original.boundingBox())!.width).toBeCloseTo(before.width,0);expect((await original.boundingBox())!.x).toBeCloseTo(before.x,0);
 await page.evaluate(()=>window.tinymce.activeEditor.undoManager.undo());await expect(original).toHaveCSS('opacity','1');await page.evaluate(()=>window.tinymce.activeEditor.undoManager.redo());await expect(original).toHaveCSS('opacity','0.65');
 await page.getByRole('button',{name:'保存文档',exact:true}).click();await page.reload();await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);await expect(original).toHaveAttribute('data-text-stroke-width','1.5');await expect(original.locator('[data-text-stroke-layer]')).toHaveCount(1);
 await page.getByRole('navigation',{name:'文档视图'}).getByRole('button',{name:'预览',exact:true}).click();const preview=page.frameLocator('iframe[title="文档预览"]').locator('#original');await expect(preview).toHaveCSS('opacity','0.65');await expect(preview).toHaveAttribute('data-text-stroke-width','1.5');await expect(preview.locator('[data-text-stroke-layer]')).toHaveCount(1);
 await page.getByRole('navigation',{name:'文档视图'}).getByRole('button',{name:'编辑',exact:true}).click();await original.click();const again=await openAppearance(page);await again.getByRole('tab',{name:'描边',exact:true}).click();await again.getByText('启用文字描边',{exact:true}).click();await again.getByRole('button',{name:'应用设置',exact:true}).click();await expect(original).toHaveCSS('-webkit-text-stroke-width','0px');await expect(original).toHaveCSS('opacity','0.65');
 await page.evaluate(()=>window.tinymce.activeEditor.execCommand('RemoveFormat')); await expect(original.locator('[data-text-background-render] path')).toHaveAttribute('fill','#eef5ff'); await expect(original).toHaveCSS('padding','0px'); await expect(original).toHaveCSS('opacity','0.65');
});
test('cancel and invalid input leave content unchanged; layers reuse the existing order menu',async({page})=>{
 const original=frame(page).locator('body > p #original');const content=await page.evaluate(()=>window.tinymce.activeEditor.getContent());let d=await openAppearance(page);await d.getByRole('textbox',{name:'整体不透明度（0—100%）',exact:true}).fill('20');await d.getByRole('button',{name:'取消',exact:true}).click();expect(await page.evaluate(()=>window.tinymce.activeEditor.getContent())).toBe(content);
 d=await openAppearance(page);await d.getByRole('textbox',{name:'整体不透明度（0—100%）',exact:true}).fill('200');await d.getByRole('button',{name:'应用设置',exact:true}).click();await expect(d.getByRole('alert')).toBeVisible();expect(await page.evaluate(()=>window.tinymce.activeEditor.getContent())).toBe(content);await d.getByRole('button',{name:'取消',exact:true}).click();
 await (await toolbar(page,'layersettings')).click();await page.getByRole('menuitem',{name:'置于底层',exact:true}).click();const z=await original.evaluate(el=>parseInt(getComputedStyle(el).zIndex));expect(z).toBeLessThan(await frame(page).locator('#other').evaluate(el=>parseInt(getComputedStyle(el).zIndex)));
});

test('lock is undoable; copying a locked box creates an unlocked copy without changing the original',async({page})=>{
 const original=frame(page).locator('body > p #original');
 await (await toolbar(page,'textlock')).click();await expect(original).toHaveAttribute('data-text-locked','true');
 await page.evaluate(()=>window.tinymce.activeEditor.undoManager.undo());await expect(original).not.toHaveAttribute('data-text-locked');
 await page.evaluate(()=>window.tinymce.activeEditor.undoManager.redo());await expect(original).toHaveAttribute('data-text-locked','true');
 await original.click();await (await toolbar(page,'textduplicate')).click();
 const copy=frame(page).locator('body > p > [data-text-draggable]').nth(1);await expect(copy).not.toHaveAttribute('data-text-locked');await expect(copy).not.toHaveAttribute('contenteditable');await expect(original).toHaveAttribute('data-text-locked','true');
 await drag(page,copy,30,20);await expect(original).toHaveCSS('left','160px');
});
