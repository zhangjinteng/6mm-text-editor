import { expect, test, type Page } from '@playwright/test';
const frame = (p: Page) => p.frameLocator('.tox-edit-area iframe');
test.beforeEach(async ({page}) => {
  await page.goto('/'); await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);
  await page.evaluate(async()=>{
    const c=document.createElement('canvas');c.width=200;c.height=100;const ctx=c.getContext('2d')!;ctx.fillStyle='#147d64';ctx.fillRect(0,0,200,100);
    const e=window.tinymce.activeEditor;
    e.setContent(`<p><img id="photo" src="${c.toDataURL()}" style="position:absolute;left:180px;top:100px;width:200px;height:100px"></p><p><span id="words" data-text-draggable="true" style="position:absolute;left:180px;top:250px;width:240px;font-size:20px;line-height:1.2">平滑缩放文字</span></p><div id="live" data-danmaku-source="current" data-danmaku-id="resize" style="position:absolute;left:450px;top:100px;width:160px;height:120px"></div>`);
    await e.uploadImages();e.undoManager.clear();e.undoManager.add();
  });
});

for (const angle of [0,30,90]) for (const corner of ['se','nw']) test(`图片 ${angle}° ${corner} 匀速经过原主轴切换点时连续，固定对角且提交不跳变`,async({page})=>{
  await page.evaluate(angle=>{const e=window.tinymce.activeEditor;e.dom.setStyle(e.getBody().querySelector('#photo')!,'rotate',`${angle}deg`);e.undoManager.clear();e.undoManager.add();},angle);
  const image=frame(page).locator('#photo');await image.click();
  const before=await page.evaluate(()=>window.tinymce.activeEditor.getContent());
  const handle=(await frame(page).locator(`#objectResizeHandle${corner}`).boundingBox())!;
  const opposite=frame(page).locator(`#objectResizeHandle${corner==='se'?'nw':'se'}`),anchor=(await opposite.boundingBox())!;
  const start={x:handle.x+handle.width/2,y:handle.y+handle.height/2};
  await page.mouse.move(start.x,start.y);await page.mouse.down();
  const widths:number[]=[];const sign=corner==='se'?1:-1;const rad=angle*Math.PI/180;
  for(const dy of [38,39,40,41,42]){
    const x=40*sign,y=dy*sign;
    await page.mouse.move(start.x+x*Math.cos(rad)-y*Math.sin(rad),start.y+x*Math.sin(rad)+y*Math.cos(rad));
    widths.push(await image.evaluate(el=>parseFloat(getComputedStyle(el).width)));
    const fixed=(await opposite.boundingBox())!;expect(fixed.x).toBeCloseTo(anchor.x,0);expect(fixed.y).toBeCloseTo(anchor.y,0);
  }
  expect(Math.max(...widths.slice(1).map((w,i)=>Math.abs(w-widths[i]!)))).toBeLessThan(3);
  expect(await page.evaluate(()=>window.tinymce.activeEditor.getContent())).toBe(before);
  const preview=(await image.boundingBox())!;await page.mouse.up();const after=(await image.boundingBox())!;
  for(const key of ['x','y','width','height'] as const)expect(after[key]).toBeCloseTo(preview[key],0);
  expect(await image.evaluate(el=>parseFloat(getComputedStyle(el).width)/parseFloat(getComputedStyle(el).height))).toBeCloseTo(2,3);
  await page.evaluate(()=>window.tinymce.activeEditor.undoManager.undo());expect(await page.evaluate(()=>window.tinymce.activeEditor.getContent())).toBe(before);
});

test('文字角点反向偏移经过主轴切换点时连续，取消恢复原尺寸',async({page})=>{
  const text=frame(page).locator('#words');await text.click();const before=await page.evaluate(()=>window.tinymce.activeEditor.getContent());
  const box=(await text.boundingBox())!,handle=(await frame(page).locator('[data-text-resize=se]').boundingBox())!;
  const x=handle.x+handle.width/2,y=handle.y+handle.height/2;await page.mouse.move(x,y);await page.mouse.down();
  const widths:number[]=[];
  for(const offset of [2,1,0,-1,-2]){await page.mouse.move(x+box.width*.15,y-box.height*.15+offset);widths.push(await text.evaluate(el=>parseFloat(getComputedStyle(el).width)));}
  expect(Math.max(...widths.slice(1).map((w,i)=>Math.abs(w-widths[i]!)))).toBeLessThan(3);
  await page.keyboard.press('Escape');await page.mouse.up();expect(await page.evaluate(()=>window.tinymce.activeEditor.getContent())).toBe(before);
  expect((await text.boundingBox())!.width).toBeCloseTo(box.width,0);
});

test('弹幕自由缩放连续，最小尺寸处折返不会累计误差',async({page})=>{
  const live=frame(page).locator('#live');await live.click({position:{x:20,y:20}});
  const before=await page.evaluate(()=>window.tinymce.activeEditor.getContent());const box=(await live.boundingBox())!;
  const handle=(await frame(page).locator('#objectResizeHandlese').boundingBox())!;
  const x=handle.x+handle.width/2,y=handle.y+handle.height/2;await page.mouse.move(x,y);await page.mouse.down();
  for(const dx of [-200,-129,-128,-127,-126,0,20]){await page.mouse.move(x+dx,y+10);const bounds=(await live.boundingBox())!;expect(bounds.width).toBeCloseTo(Math.max(32,box.width+dx),0);expect(bounds.height).toBeCloseTo(box.height+10,0);}
  const preview=(await live.boundingBox())!;await page.mouse.up();expect((await live.boundingBox())!.width).toBeCloseTo(preview.width,0);
  await page.evaluate(()=>window.tinymce.activeEditor.undoManager.undo());expect(await page.evaluate(()=>window.tinymce.activeEditor.getContent())).toBe(before);
});
