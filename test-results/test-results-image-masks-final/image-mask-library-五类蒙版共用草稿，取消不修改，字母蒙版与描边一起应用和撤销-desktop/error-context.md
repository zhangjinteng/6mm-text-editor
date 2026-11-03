# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: image-mask-library.spec.ts >> 五类蒙版共用草稿，取消不修改，字母蒙版与描边一起应用和撤销
- Location: tests/image-mask-library.spec.ts:20:1

# Error details

```
Error: expect(locator).toHaveCSS(expected) failed

Locator: locator('.tox-edit-area iframe').contentFrame().locator('#mask-photo')
Expected pattern: /data:image\/svg/
Received string:  "none"
Timeout: 20000ms

Call log:
  - Expect "toHaveCSS" locator('.tox-edit-area iframe').contentFrame().locator('#mask-photo') with timeout 20000ms
  - waiting for locator('.tox-edit-area iframe').contentFrame().locator('#mask-photo')
    43 × locator resolved to <img width="200" height="200" id="mask-photo" data-image-stroke-id="stroke-d19dbbe9-0efc-4790-a33e-4692ee2a7c7e" data-mce-style="position: absolute; left: 100px; top: 80px; width: 200px; height: 200px; outline: none; outline-offset: 0px; opacity: 1; border-radius: 0px; scale: 1; rotate: 0deg; transform-origin: 50% 50%; clip-path: none; mask-mode: alpha; mask-size: 100% 100%; mask-repeat: no-repeat; filter: brightness(100%) contrast(100%) saturate(100%) hue-rotate(0deg); box-shadow: none;" data-imag…/>
       - unexpected value "none"

```

```yaml
- img
```

# Test source

```ts
  1   | import { expect, test, type Page } from '@playwright/test';
  2   | import { readFile } from 'node:fs/promises';
  3   | const photo = (p: Page) => p.frameLocator('.tox-edit-area iframe').locator('#mask-photo');
  4   | const panel = (p: Page) => p.getByRole('complementary', { name: '图片配置面板' });
  5   | const dialog = (p: Page) => p.getByRole('dialog', { name: '图片设置', exact: true });
  6   | async function open(p: Page) {
  7   |   await photo(p).click(); await p.locator('.tox-pop:visible [data-mce-name=imagesettings]').click();
  8   |   await dialog(p).getByRole('tab', { name: '蒙版', exact: true }).click(); return dialog(p);
  9   | }
  10  | test.beforeEach(async ({ page }) => {
  11  |   await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  12  |   await page.evaluate(async () => {
  13  |     const c = document.createElement('canvas'); c.width = c.height = 200; const ctx = c.getContext('2d')!;
  14  |     ctx.fillStyle = '#147d64'; ctx.fillRect(0, 0, 100, 200); ctx.fillStyle = '#f3a54c'; ctx.fillRect(100, 0, 100, 200);
  15  |     const e = window.tinymce.activeEditor; e.setContent(`<p><img id="mask-photo" src="${c.toDataURL()}" width="200" height="200" style="position:absolute;left:100px;top:80px;width:200px;height:200px"></p>`);
  16  |     await e.uploadImages(); e.undoManager.clear(); e.undoManager.add();
  17  |   });
  18  | });
  19  | 
  20  | test('五类蒙版共用草稿，取消不修改，字母蒙版与描边一起应用和撤销', async ({ page }) => {
  21  |   const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  22  |   let d = await open(page);
  23  |   await expect(d.getByRole('group', { name: '蒙版分类' }).getByRole('button')).toHaveText(['基础','图形','字母','数字','笔刷']);
  24  |   for (const name of ['圆角矩形','切角矩形','波浪','花形','不规则形']) await expect(d.getByRole('button',{name,exact:true})).toBeVisible();
  25  |   for (const [category, name] of [['图形','爱心'], ['字母','字母 A'], ['数字','数字 8'], ['笔刷','干刷纹理']]) {
  26  |     await d.getByRole('group',{name:'蒙版分类'}).getByRole('button',{name:category,exact:true}).click();
  27  |     await d.getByRole('button',{name,exact:true}).click();
  28  |     await expect(d.locator('.image-settings-preview img')).toHaveCSS('mask-image', /data:image\/svg/);
  29  |     expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  30  |   }
  31  |   await d.getByRole('button',{name:'取消',exact:true}).click();
  32  |   expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  33  |   d = await open(page);
  34  |   await d.getByRole('group',{name:'蒙版分类'}).getByRole('button',{name:'字母',exact:true}).click();
  35  |   await expect(d.locator('[data-mask^="letter-"]:visible')).toHaveCount(26);
  36  |   await d.getByRole('button',{name:'字母 O',exact:true}).click();
  37  |   await page.screenshot({path:'screenshots/image-mask-letters.png'});
  38  |   await d.getByRole('tab',{name:'描边',exact:true}).click();
  39  |   await d.getByLabel('启用描边',{exact:true}).check();
  40  |   await d.getByRole('button',{name:'应用设置',exact:true}).click();
  41  |   await expect(photo(page)).toHaveAttribute('data-image-settings', /"mask":"letter-O"/);
  42  |   await expect(photo(page)).toHaveCSS('mask-image', /data:image\/svg/);
  43  |   await expect(page.frameLocator('.tox-edit-area iframe').locator('[data-image-stroke-for]')).toHaveCount(1);
  44  |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  45  |   expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  46  |   await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  47  |   await page.getByRole('button', { name: '保存文档', exact: true }).click();
  48  |   await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
> 49  |   await expect(photo(page)).toHaveCSS('mask-image', /data:image\/svg/);
      |                             ^ Error: expect(locator).toHaveCSS(expected) failed
  50  |   d = await open(page);
  51  |   await expect(d.getByRole('button', { name: '字母 O', exact: true })).toHaveAttribute('aria-pressed', 'true');
  52  |   await expect(d.getByRole('group', { name: '蒙版分类' }).getByRole('button', { name: '字母', exact: true })).toHaveAttribute('aria-pressed', 'true');
  53  | });
  54  | 
  55  | test('自定义蒙版可取消、保存重载、预览导出，窄屏仍只有一个滚动区', async ({page}) => {
  56  |   const source = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="black"/><circle cx="50" cy="50" r="40" fill="white"/></svg>');
  57  |   const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  58  |   const d = await open(page);
  59  |   await d.locator('[data-mask-file]').setInputFiles({name:'圆形蒙版.svg',mimeType:'image/svg+xml',buffer:source});
  60  |   await expect(d.getByRole('button',{name:'自定义蒙版',exact:true})).toHaveAttribute('aria-pressed','true');
  61  |   await d.getByRole('button',{name:'取消',exact:true}).click();
  62  |   expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  63  |   await photo(page).click();const p=panel(page);await p.getByRole('tab',{name:'蒙版',exact:true}).click();
  64  |   await p.locator('[data-mask-file]').setInputFiles({name:'bad.png',mimeType:'image/png',buffer:Buffer.from('invalid image')});
  65  |   await expect(p.getByRole('alert')).toContainText('无法读取蒙版');
  66  |   expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  67  |   await p.locator('[data-mask-file]').setInputFiles({name:'圆形蒙版.svg',mimeType:'image/svg+xml',buffer:source});
  68  |   await expect(photo(page)).toHaveAttribute('data-image-settings', /"maskSource":"data:image\/png;base64/);
  69  |   await expect(photo(page)).toHaveCSS('mask-image', /data:image\/png/);
  70  |   await page.getByRole('button',{name:'保存文档',exact:true}).click();await page.reload();await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);
  71  |   await photo(page).click();await p.getByRole('tab',{name:'蒙版',exact:true}).click();
  72  |   await expect(p.getByRole('button',{name:'自定义蒙版',exact:true})).toHaveAttribute('aria-pressed','true');
  73  |   await page.setViewportSize({width:390,height:844});
  74  |   await p.scrollIntoViewIfNeeded();
  75  |   const scrolls=await p.evaluate(root=>[root,...root.querySelectorAll('*')].filter(el=>el.clientHeight>0&&['auto','scroll'].includes(getComputedStyle(el).overflowY)&&el.scrollHeight>el.clientHeight+1).length);
  76  |   expect(scrolls).toBeLessThanOrEqual(1);
  77  |   await page.screenshot({path:'screenshots/image-mask-mobile.png'});
  78  |   await page.setViewportSize({width:1440,height:1000});
  79  |   await page.getByRole('navigation',{name:'文档视图'}).getByRole('button',{name:'预览',exact:true}).click();
  80  |   await expect(page.frameLocator('iframe[title="文档预览"]').locator('#mask-photo')).toHaveCSS('mask-image', /data:image\/png/);
  81  |   await page.getByRole('button',{name:'导出',exact:true}).click();const download=page.waitForEvent('download');await page.getByRole('button',{name:'HTML 文档',exact:true}).click();
  82  |   const html=await readFile(await(await download).path(),'utf8');expect(html).toContain('mask-image:');expect(html).toContain('data:image/png');
  83  | });
  84  | 
  85  | test('新蒙版轮廓保留孔洞，上传自动识别明度和透明通道且拒绝空蒙版', async ({page}) => {
  86  |   const result = await page.evaluate(async()=>{
  87  |     // @ts-expect-error Vite browser module
  88  |     const {createImageStroke}=await import('/src/image-stroke.ts');
  89  |     // @ts-expect-error Vite browser module
  90  |     const {importImageMask,imageMasks}=await import('/src/image-masks.ts');
  91  |     const image=window.tinymce.activeEditor.getBody().querySelector<HTMLImageElement>('#mask-photo')!;
  92  |     const options={stroke:true,strokeWidth:4,strokeColor:'#ff0000',strokeStyle:'solid',strokePosition:'inside',mask:'letter-O',radius:0};
  93  |     const stroke=await createImageStroke(image.src,100,100,options);
  94  |     const sample=async(url:string)=>{const img=new Image();img.src=url;await img.decode();const c=document.createElement('canvas');c.width=img.width;c.height=img.height;const ctx=c.getContext('2d')!;ctx.drawImage(img,0,0);return {width:c.width,height:c.height,data:Array.from(ctx.getImageData(0,0,c.width,c.height).data)};};
  95  |     const outline=await sample(stroke.url);const center=outline.data[(Math.floor(outline.height/2)*outline.width+Math.floor(outline.width/2))*4+3];
  96  |     const file=(body:string)=>new File([`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">${body}</svg>`],'mask.svg',{type:'image/svg+xml'});
  97  |     const opaque=await sample(await importImageMask(file('<rect width="100" height="100" fill="black"/><rect width="50" height="100" fill="white"/>')));
  98  |     const transparent=await sample(await importImageMask(file('<rect width="50" height="100" fill="black"/>')));
  99  |     let emptyRejected=false;try{await importImageMask(file(''));}catch{emptyRejected=true;}
  100 |     const custom=await importImageMask(file('<rect width="50" height="100" fill="white"/>'));
  101 |     const customStroke=await createImageStroke(image.src,100,100,{...options,mask:'custom',maskSource:custom});
  102 |     const customPixels=await sample(customStroke.url);const at=(x:number,y:number)=>customPixels.data[((y+customStroke.pad*2)*customPixels.width+x+customStroke.pad*2)*4+3];
  103 |     return {count:Object.keys(imageMasks).length,center,outlineVisible:outline.data.some((n,i)=>i%4===3&&n>0),opaque:[opaque.data[(50*100+25)*4+3],opaque.data[(50*100+75)*4+3]],transparent:[transparent.data[(50*100+25)*4+3],transparent.data[(50*100+75)*4+3]],emptyRejected,customRight:at(160,100)};
  104 |   });
  105 |   expect(result.count).toBeGreaterThan(60);expect(result.center).toBe(0);expect(result.outlineVisible).toBe(true);
  106 |   expect(result.opaque).toEqual([255,0]);expect(result.transparent).toEqual([255,0]);expect(result.emptyRejected).toBe(true);expect(result.customRight).toBe(0);
  107 | });
  108 | 
```