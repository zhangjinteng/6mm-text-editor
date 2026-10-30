import { expect, test, type Page } from '@playwright/test';
import type { Editor } from 'tinymce';
import { textTool } from './helpers/text-tools';
declare global { interface Window { tinymce: { activeEditor: Editor } } }
const source = '<p id="neighbor">相邻段落</p><p><span data-text-draggable="true" style="position:absolute;left:120px;top:120px;width:320px;font-size:20px;line-height:1.5;z-index:3"><span style="color:#e03e2d;font-size:16px">前面</span><strong style="font-size:24px">中间</strong>后面<br>第二行文字</span></p>';
async function selectCharacters(page: Page, text: string) {
  await page.evaluate(text => {
    const e = window.tinymce.activeEditor; const root = e.getBody().querySelector('[data-text-draggable]')!;
    const walker = e.getDoc().createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const at = n.textContent!.indexOf(text); if (at < 0) continue;
      const range = e.getDoc().createRange(); range.setStart(n, at); range.setEnd(n, at + text.length);
      e.focus(); e.selection.setRng(range); e.nodeChanged(); e.dispatch('mouseup'); break;
    }
  }, text);
}
async function layout(page: Page, name: string) {
  const panel = page.locator('[data-toolbar-group="textgrouplayout"]');
  if (!await panel.isVisible()) await page.locator('.tox-pop:visible [data-mce-name="textgrouplayout"]').click();
  await expect(panel).toBeVisible(); return panel.locator(`[data-mce-name="${name}"]`);
}
test.beforeEach(async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(html => { const e = window.tinymce.activeEditor; e.setContent(html); e.undoManager.clear(); e.undoManager.add(); }, source);
});
test('object fonts, toggles, colors and highlighting apply to the whole box, preserve geometry and undo', async ({ page }) => {
  const frame = page.frameLocator('.tox-edit-area iframe'); const box = frame.locator('[data-text-draggable]');
  await box.click(); const bounds = (await box.boundingBox())!;
  await (await textTool(page, 'bold')).click();
  expect(await box.evaluate(el => (() => { const w=el.ownerDocument.createTreeWalker(el,NodeFilter.SHOW_TEXT); for(let n=w.nextNode();n;n=w.nextNode()) if(parseInt(getComputedStyle(n.parentElement!).fontWeight)<600) return false; return true; })())).toBe(true);
  await page.locator('.tox-pop:visible input').fill('28px'); await page.locator('.tox-pop:visible input').press('Enter');
  const fonts = await box.evaluate(el => { const w=el.ownerDocument.createTreeWalker(el,NodeFilter.SHOW_TEXT); const sizes=[]; for(let n=w.nextNode();n;n=w.nextNode()) sizes.push(getComputedStyle(n.parentElement!).fontSize); return sizes; });
  expect(new Set(fonts)).toEqual(new Set(['28px']));
  await (await textTool(page, 'forecolor-chevron')).click(); await page.locator('[data-mce-color="#3598DB"]').click();
  await (await textTool(page, 'backcolor-chevron')).click(); await page.locator('[data-mce-color="#F1C40F"]').click();
  expect(await box.evaluate(el => { const w=el.ownerDocument.createTreeWalker(el,NodeFilter.SHOW_TEXT); const colors=[]; for(let n=w.nextNode();n;n=w.nextNode()) colors.push(getComputedStyle(n.parentElement!).color); return colors.every(v=>v==='rgb(53, 152, 219)'); })).toBe(true);
  expect(await box.evaluate(el=>{const w=el.ownerDocument.createTreeWalker(el,NodeFilter.SHOW_TEXT);for(let n=w.nextNode();n;n=w.nextNode()){let p=n.parentElement;let colored=false;while(p&&el.contains(p)){if(getComputedStyle(p).backgroundColor==='rgb(241, 196, 15)'){colored=true;break;}p=p.parentElement;}if(!colored)return false;}return true;})).toBe(true);
  const now = (await box.boundingBox())!; expect(now.x).toBeCloseTo(bounds.x,0); expect(now.y).toBeCloseTo(bounds.y,0); expect(now.width).toBeCloseTo(bounds.width,0);
  expect(await box.evaluate(el=>el.parentElement!.tagName)).toBe('P');
  await expect(box).toHaveCount(1); await expect(frame.locator('#neighbor')).toHaveText('相邻段落');
  const formatted = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).not.toBe(formatted);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(formatted);
});
test('editing range changes only selected characters, and a collapsed caret styles subsequent input', async ({ page }) => {
  const frame = page.frameLocator('.tox-edit-area iframe'); const box = frame.locator('[data-text-draggable]');
  await box.dblclick(); await selectCharacters(page, '中间');
  await page.evaluate(() => { const e=window.tinymce.activeEditor; e.execCommand('mceApplyTextcolor', 'forecolor' as unknown as boolean, '#3598db'); e.execCommand('TextLetterSpacing',false,'3'); });
  expect(await box.locator('strong').evaluate(el => getComputedStyle(el.querySelector('span') ?? el).letterSpacing)).toBe('3px');
  await expect(box.locator('span').first()).toHaveCSS('color','rgb(224, 62, 45)');
  await selectCharacters(page,'后面');
  await page.evaluate(() => { const e=window.tinymce.activeEditor; e.selection.collapse(false); e.execCommand('mceApplyTextcolor','forecolor' as unknown as boolean,'#008000'); });
  await page.keyboard.insertText('新增'); expect((await box.textContent())!.replaceAll('\uFEFF','')).toContain('后面新增');
  expect(await box.evaluate(el=>{const w=el.ownerDocument.createTreeWalker(el,NodeFilter.SHOW_TEXT);for(let n=w.nextNode();n;n=w.nextNode())if(n.textContent?.includes('新增'))return getComputedStyle(n.parentElement!).color;return ''; })).toBe('rgb(0, 128, 0)');
});
test('layout controls style the box, spacing dialog handles mixed text, save/reload preserves formatting', async ({ page }) => {
  const frame = page.frameLocator('.tox-edit-area iframe'); const box = frame.locator('[data-text-draggable]');
  await box.click(); const before = (await box.boundingBox())!;
  await (await layout(page,'textaligncenter')).click(); await expect(box).toHaveCSS('text-align','center');
  await page.screenshot({path:'screenshots/text-typography-controls.png'});
  await (await layout(page,'textlineheight')).click(); await page.getByRole('menuitemcheckbox',{name:'2 倍',exact:true}).click();
  await expect(box).toHaveCSS('line-height','40px');
  await (await layout(page,'textspacing')).click();
  const dialog=page.getByRole('dialog',{name:'字间距',exact:true}); await dialog.getByRole('textbox').fill('2'); await dialog.getByRole('button',{name:'应用',exact:true}).click();
  const now=(await box.boundingBox())!;expect(now.x).toBeCloseTo(before.x,0);expect(now.width).toBeCloseTo(before.width,0);
  await expect(frame.locator('#neighbor')).not.toHaveCSS('text-align','center');
  await page.getByRole('button',{name:'保存文档',exact:true}).click(); await page.reload(); await page.waitForFunction(()=>window.tinymce?.activeEditor?.initialized);
  await expect(box).toHaveCSS('text-align','center');await expect(box).toHaveCSS('line-height','40px');
  expect(await box.evaluate(el=>{const w=el.ownerDocument.createTreeWalker(el,NodeFilter.SHOW_TEXT);const a=[];for(let n=w.nextNode();n;n=w.nextNode())a.push(getComputedStyle(n.parentElement!).letterSpacing);return a.every(x=>x==='2px');})).toBe(true);
});
test('mixed spacing is explicit, cancel leaves content unchanged, and font family/clear-format preserve the box', async ({ page }) => {
  const frame=page.frameLocator('.tox-edit-area iframe');const box=frame.locator('[data-text-draggable]');
  await page.evaluate(()=>{const e=window.tinymce.activeEditor;e.getBody().querySelector<HTMLElement>('[data-text-draggable] > span')!.style.letterSpacing='4px';});
  await box.click(); const before=await page.evaluate(()=>window.tinymce.activeEditor.getContent());
  await (await layout(page,'textspacing')).click();
  const dialog=page.getByRole('dialog',{name:'字间距',exact:true});
  await expect(dialog.getByRole('textbox')).toHaveValue('');await expect(dialog.getByRole('textbox')).toHaveAttribute('placeholder','混合，请输入新值');
  await dialog.getByRole('button',{name:'取消',exact:true}).click();expect(await page.evaluate(()=>window.tinymce.activeEditor.getContent())).toBe(before);
  await page.evaluate(()=>window.tinymce.activeEditor.execCommand('FontName',false,'Arial'));
  expect(await box.evaluate(el=>{const w=el.ownerDocument.createTreeWalker(el,NodeFilter.SHOW_TEXT);for(let n=w.nextNode();n;n=w.nextNode())if(!getComputedStyle(n.parentElement!).fontFamily.includes('Arial'))return false;return true;})).toBe(true);
  await page.evaluate(()=>window.tinymce.activeEditor.execCommand('RemoveFormat'));
  await expect(box).toHaveCSS('left','120px');await expect(box).toHaveCSS('width','320px');await expect(box).toHaveCSS('z-index','3');await expect(box).toHaveCount(1);
});

test('selecting all characters in edit mode keeps highlight inside the positioned wrapper', async ({page})=>{
  const box=page.frameLocator('.tox-edit-area iframe').locator('[data-text-draggable]');await box.dblclick();
  await page.evaluate(()=>{const e=window.tinymce.activeEditor;e.selection.select(e.getBody().querySelector('[data-text-draggable]')!,true);e.execCommand('mceApplyTextcolor','hilitecolor' as unknown as boolean,'#ffff00');});
  expect(await box.evaluate(el=>el.parentElement!.tagName)).toBe('P');
  expect(await box.locator('[style*="background-color"]').count()).toBeGreaterThan(0);
  await expect(box).toHaveCSS('left','120px');
});
