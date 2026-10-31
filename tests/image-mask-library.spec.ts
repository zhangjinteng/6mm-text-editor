import { expect, test, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
const photo = (p: Page) => p.frameLocator('.tox-edit-area iframe').locator('#mask-photo');
const panel = (p: Page) => p.getByRole('complementary', { name: '图片配置面板' });
const dialog = (p: Page) => p.getByRole('dialog', { name: '图片设置', exact: true });
async function open(p: Page) {
  await photo(p).click(); await p.locator('.tox-pop:visible [data-mce-name=imagesettings]').click();
  await dialog(p).getByRole('tab', { name: '蒙版', exact: true }).click(); return dialog(p);
}
test.beforeEach(async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(async () => {
    const c = document.createElement('canvas'); c.width = c.height = 200; const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#147d64'; ctx.fillRect(0, 0, 100, 200); ctx.fillStyle = '#f3a54c'; ctx.fillRect(100, 0, 100, 200);
    const e = window.tinymce.activeEditor; e.setContent(`<p><img id="mask-photo" src="${c.toDataURL()}" width="200" height="200" style="position:absolute;left:100px;top:80px;width:200px;height:200px"></p>`);
    await e.uploadImages(); e.undoManager.clear(); e.undoManager.add();
  });
});

test('五类蒙版共用草稿，取消不修改，字母蒙版与描边一起应用和撤销', async ({ page }) => {
  const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  let d = await open(page);
  await expect(d.getByRole('group', { name: '蒙版分类' }).getByRole('button')).toHaveText(['基础','图形','字母','数字','笔刷']);
  for (const name of ['圆角矩形','切角矩形','波浪','花形','不规则形']) await expect(d.getByRole('button',{name,exact:true})).toBeVisible();
  for (const [category, name] of [['图形','爱心'], ['字母','字母 A'], ['数字','数字 8'], ['笔刷','干刷纹理']]) {
    await d.getByRole('group',{name:'蒙版分类'}).getByRole('button',{name:category,exact:true}).click();
    await d.getByRole('button',{name,exact:true}).click();
    await expect(d.locator('.image-settings-preview img')).toHaveCSS('mask-image', /data:image\/svg/);
    expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  }
  await d.getByRole('button',{name:'取消',exact:true}).click();
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  d = await open(page);
  await d.getByRole('group',{name:'蒙版分类'}).getByRole('button',{name:'字母',exact:true}).click();
  await expect(d.locator('[data-mask^="letter-"]:visible')).toHaveCount(26);
  await d.getByRole('button',{name:'字母 O',exact:true}).click();
  await page.screenshot({path:'screenshots/image-mask-letters.png'});
  await d.getByRole('tab',{name:'描边',exact:true}).click();
  await d.getByLabel('启用描边',{exact:true}).check();
  await d.getByRole('button',{name:'应用设置',exact:true}).click();
  await expect(photo(page)).toHaveAttribute('data-image-settings', /"mask":"letter-O"/);
  await expect(photo(page)).toHaveCSS('mask-image', /data:image\/png/);
  await expect(page.frameLocator('.tox-edit-area iframe').locator('[data-image-stroke-for]')).toHaveCount(1);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(photo(page)).toHaveCSS('mask-image', /data:image\/png/);
  d = await open(page);
  await expect(d.getByRole('button', { name: '字母 O', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(d.getByRole('group', { name: '蒙版分类' }).getByRole('button', { name: '字母', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('自定义蒙版可取消、保存重载、预览导出，窄屏仍只有一个滚动区', async ({page}) => {
  const source = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="black"/><circle cx="50" cy="50" r="40" fill="white"/></svg>');
  const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  const d = await open(page);
  await d.locator('[data-mask-file]').setInputFiles({name:'圆形蒙版.svg',mimeType:'image/svg+xml',buffer:source});
  await expect(d.getByRole('button',{name:'自定义蒙版',exact:true})).toHaveAttribute('aria-pressed','true');
  await d.getByRole('button',{name:'取消',exact:true}).click();
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await photo(page).click();const p=panel(page);await p.getByRole('tab',{name:'蒙版',exact:true}).click();
  await p.locator('[data-mask-file]').setInputFiles({name:'bad.png',mimeType:'image/png',buffer:Buffer.from('invalid image')});
  await expect(p.getByRole('alert')).toContainText('无法读取蒙版');
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await p.locator('[data-mask-file]').setInputFiles({name:'圆形蒙版.svg',mimeType:'image/svg+xml',buffer:source});
  await expect(photo(page)).toHaveAttribute('data-image-settings', /"maskSource":"data:image\/png;base64/);
  await expect(photo(page)).toHaveCSS('mask-image', /data:image\/png/);
  await page.getByRole('button',{name:'保存文档',exact:true}).click();await page.reload();await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);
  await photo(page).click();await p.getByRole('tab',{name:'蒙版',exact:true}).click();
  await expect(p.getByRole('button',{name:'自定义蒙版',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.setViewportSize({width:390,height:844});
  await p.scrollIntoViewIfNeeded();
  const scrolls=await p.evaluate(root=>[root,...root.querySelectorAll('*')].filter(el=>el.clientHeight>0&&['auto','scroll'].includes(getComputedStyle(el).overflowY)&&el.scrollHeight>el.clientHeight+1).length);
  expect(scrolls).toBeLessThanOrEqual(1);
  await page.screenshot({path:'screenshots/image-mask-mobile.png'});
  await page.setViewportSize({width:1440,height:1000});
  await page.getByRole('navigation',{name:'文档视图'}).getByRole('button',{name:'预览',exact:true}).click();
  await expect(page.frameLocator('iframe[title="文档预览"]').locator('#mask-photo')).toHaveCSS('mask-image', /data:image\/png/);
  await page.getByRole('button',{name:'导出',exact:true}).click();const download=page.waitForEvent('download');await page.getByRole('button',{name:'HTML 文档',exact:true}).click();
  const html=await readFile(await(await download).path(),'utf8');expect(html).toContain('mask-image:');expect(html).toContain('data:image/png');
});

test('新蒙版轮廓保留孔洞，上传自动识别明度和透明通道且拒绝空蒙版', async ({page}) => {
  const result = await page.evaluate(async()=>{
    // @ts-expect-error Vite browser module
    const {createImageStroke}=await import('/src/image-stroke.ts');
    // @ts-expect-error Vite browser module
    const {importImageMask,imageMasks}=await import('/src/image-masks.ts');
    const image=window.tinymce.activeEditor.getBody().querySelector<HTMLImageElement>('#mask-photo')!;
    const options={stroke:true,strokeWidth:4,strokeColor:'#ff0000',strokeStyle:'solid',strokePosition:'inside',mask:'letter-O',radius:0};
    const stroke=await createImageStroke(image.src,100,100,options);
    const sample=async(url:string)=>{const img=new Image();img.src=url;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d')!;ctx.drawImage(img,0,0);return {width:c.width,height:c.height,data:Array.from(ctx.getImageData(0,0,c.width,c.height).data)};};
    const outline=await sample(stroke.url);const center=outline.data[(Math.floor(outline.height/2)*outline.width+Math.floor(outline.width/2))*4+3];
    const file=(body:string)=>new File([`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">${body}</svg>`],'mask.svg',{type:'image/svg+xml'});
    const opaque=await sample(await importImageMask(file('<rect width="100" height="100" fill="black"/><rect width="50" height="100" fill="white"/>')));
    const transparent=await sample(await importImageMask(file('<rect width="50" height="100" fill="black"/>')));
    let emptyRejected=false;try{await importImageMask(file(''));}catch{emptyRejected=true;}
    const custom=await importImageMask(file('<rect width="50" height="100" fill="white"/>'));
    const customStroke=await createImageStroke(image.src,100,100,{...options,mask:'custom',maskSource:custom});
    const customPixels=await sample(customStroke.url);const at=(x:number,y:number)=>customPixels.data[((y+customStroke.pad*2)*customPixels.width+x+customStroke.pad*2)*4+3];
    return {count:Object.keys(imageMasks).length,center,outlineVisible:outline.data.some((n,i)=>i%4===3&&n>0),opaque:[opaque.data[(50*100+25)*4+3],opaque.data[(50*100+75)*4+3]],transparent:[transparent.data[(50*100+25)*4+3],transparent.data[(50*100+75)*4+3]],emptyRejected,customRight:at(160,100)};
  });
  expect(result.count).toBeGreaterThan(60);expect(result.center).toBe(0);expect(result.outlineVisible).toBe(true);
  expect(result.opaque).toEqual([255,0]);expect(result.transparent).toEqual([255,0]);expect(result.emptyRejected).toBe(true);expect(result.customRight).toBe(0);
});
