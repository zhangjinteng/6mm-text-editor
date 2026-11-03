import { expect, test, type Page } from '@playwright/test';
const frame = (p: Page) => p.frameLocator('.tox-edit-area iframe');
const box = (p: Page) => frame(p).locator('#layout-text');
const panel = (p: Page) => p.getByRole('complementary', { name: '文字配置面板' });
async function open(p: Page, modal = false) {
  await box(p).click();
  if (modal) {
    await p.locator('.tox-pop:visible [data-mce-name="textsettings"]').click();
    const dialog = p.getByRole('dialog', { name: '文字设置', exact: true });
    await dialog.getByRole('tab', { name: '排版', exact: true }).click(); return dialog;
  }
  await panel(p).getByRole('tab', { name: '排版', exact: true }).click(); return panel(p);
}
test.beforeEach(async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    e.setContent('<p><span id="layout-text" data-text-draggable="true" style="position:absolute;left:80px;top:50px;width:300px;font-size:32px;line-height:1.5">Hello <strong>World</strong><br>第二段文字</span></p>');
    e.undoManager.clear(); e.undoManager.add();
  });
});
test('弹窗预览不污染原文，固定尺寸、框内对齐、缩进段距大小写可应用保存撤销', async ({ page }) => {
  const original = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  let d = await open(page, true);
  const configure = async () => {
    await d.getByRole('button', { name: '固定宽高', exact: true }).click();
    await d.getByRole('textbox', { name: '文本框高度', exact: true }).fill('300');
    await d.getByRole('group', { name: '框内垂直对齐' }).getByRole('button', { name: '下对齐', exact: true }).click();
    await d.getByRole('textbox', { name: '首行缩进', exact: true }).fill('2');
    await d.getByRole('textbox', { name: '段落间距', exact: true }).fill('1');
    await d.getByRole('combobox', { name: '大小写', exact: true }).selectOption('uppercase');
  };
  await configure();
  const preview = page.frameLocator('iframe[title="文字效果预览"]').locator('[data-text-draggable]');
  await expect(preview).toHaveCSS('height', '300px'); await expect(preview).toContainText('HELLO WORLD');
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(original);
  await d.getByRole('button', { name: '取消', exact: true }).click();
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(original);
  d = await open(page, true); await configure();
  await d.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(box(page)).toHaveCSS('height', '300px'); await expect(box(page).locator('strong')).toHaveText('WORLD');
  const paragraphs = box(page).locator('[data-text-paragraph]'); await expect(paragraphs).toHaveCount(2);
  await expect(paragraphs.first()).toHaveCSS('text-indent', '64px');
  await expect(paragraphs.last()).toHaveCSS('margin-block-start', '32px');
  const bounds = (await box(page).boundingBox())!, content = (await box(page).locator('[data-text-source]').boundingBox())!;
  expect(content.y + content.height).toBeCloseTo(bounds.y + bounds.height, 0);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(original);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  await page.getByRole('button', { name: '保存文档', exact: true }).click(); await page.reload();
  await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(box(page)).toHaveCSS('height', '300px'); await expect(box(page).locator('strong')).toHaveText('WORLD');
});
test('四种尺寸模式随内容变化，自动字号缩小并恢复且框不变', async ({ page }) => {
  let p = await open(page);
  const changeText = async (text: string) => page.evaluate(text => {
    const e = window.tinymce.activeEditor, b = e.getBody().querySelector('#layout-text')!;
    (b.querySelector('[data-text-source]') ?? b).textContent = text; e.dispatch('input');
  }, text);
  await p.getByRole('button', { name: '自动宽度', exact: true }).click();
  await changeText('短'); const small = (await box(page).boundingBox())!;
  await changeText('这是一段比较长的文字'); expect((await box(page).boundingBox())!.width).toBeGreaterThan(small.width * 5);
  await p.getByRole('button', { name: '自动高度', exact: true }).click();
  await p.getByRole('textbox', { name: '文本框宽度', exact: true }).fill('180');
  await changeText('短'); const short = (await box(page).boundingBox())!;
  await changeText('较长文字'.repeat(12)); const tall = (await box(page).boundingBox())!;
  expect(tall.width).toBeCloseTo(180, 0); expect(tall.height).toBeGreaterThan(short.height);
  await p.getByRole('button', { name: '固定宽高', exact: true }).click();
  await p.getByRole('textbox', { name: '文本框高度', exact: true }).fill('100');
  await changeText('较长文字'.repeat(20)); await expect(box(page)).toHaveCSS('height','100px');
  await p.getByRole('button', { name: '自动字号', exact: true }).click();
  const fitted = await box(page).evaluate(el => parseFloat(getComputedStyle(el).fontSize)); expect(fitted).toBeLessThan(32);
  expect(await box(page).locator('[data-text-source]').evaluate(el => el.scrollHeight)).toBeLessThanOrEqual(101);
  await changeText('短'); expect(await box(page).evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThan(fitted);
  await expect(box(page)).toHaveCSS('width','180px'); await expect(box(page)).toHaveCSS('height','100px');
});
test('列表弹窗草稿支持无样式，侧栏仍与原生工具栏同步', async ({ page }) => {
  let d = await open(page, true);
  await d.getByRole('button', { name:'有序列表',exact:true }).click();
  await expect(frame(page).locator('ol #layout-text')).toHaveCount(0);
  await expect(page.frameLocator('iframe[title="文字效果预览"]').locator('[data-text-list-marker]')).toHaveText('1.');
  await d.getByRole('button', { name:'应用设置',exact:true }).click();
  await expect(frame(page).locator('ol #layout-text')).toHaveCount(1);
  d = await open(page, true); await d.getByRole('button',{name:'无样式',exact:true}).click();
  await d.getByRole('button',{name:'应用设置',exact:true}).click();
  await expect(frame(page).locator('ol #layout-text,ul #layout-text')).toHaveCount(0);
  const p = await open(page); await p.getByRole('button',{name:'无序列表',exact:true}).click();
  await expect(frame(page).locator('ul #layout-text')).toHaveCount(1);
  await p.getByRole('button',{name:'无样式',exact:true}).click(); await expect(frame(page).locator('ul #layout-text')).toHaveCount(0);
});
test('输入范围、加减、首字母转换与新段落编辑', async ({ page }) => {
  let p = await open(page);
  await p.getByRole('button',{name:'增加首行缩进',exact:true}).click();
  await expect(p.getByRole('textbox',{name:'首行缩进',exact:true})).toHaveValue('1');
  await p.getByRole('textbox',{name:'段落间距',exact:true}).fill('10');
  await expect(p.getByRole('button',{name:'增加段落间距',exact:true})).toBeDisabled();
  await p.getByRole('textbox',{name:'段落间距',exact:true}).fill('1');
  await p.getByRole('combobox',{name:'大小写',exact:true}).selectOption('lowercase');
  await expect(box(page).locator('strong')).toHaveText('world');
  await p.getByRole('combobox',{name:'大小写',exact:true}).selectOption('capitalize');
  await expect(box(page).locator('strong')).toHaveText('World');
  await box(page).dblclick(); await page.keyboard.press('End'); await page.keyboard.press('Enter'); await page.keyboard.insertText('新段');
  await expect(box(page)).toContainText('新段'); await expect(box(page).locator('[data-text-paragraph]')).toHaveCount(3);
  await page.keyboard.press('Escape');
  const d = await open(page,true);
  await d.getByRole('textbox',{name:'首行缩进',exact:true}).fill('101'); await d.getByRole('button',{name:'应用设置',exact:true}).click();
  await expect(d.getByRole('alert')).toContainText('0—100');
  await d.getByRole('textbox',{name:'首行缩进',exact:true}).fill('2');
  await d.locator('.text-settings-controls').evaluate(el => { el.scrollTop = 0; });
  await d.screenshot({path:'screenshots/text-layout-settings.png'});
});

test('固定框可调高度、横竖排保留尺寸，组合输入期间不重算字号', async ({ page }) => {
  const p = await open(page);
  await p.getByRole('button',{name:'固定宽高',exact:true}).click();
  await p.getByRole('textbox',{name:'文本框高度',exact:true}).fill('180');
  await p.getByRole('combobox',{name:'文字排列',exact:true}).selectOption('vertical-rl');
  await expect(box(page)).toHaveCSS('width','300px'); await expect(box(page)).toHaveCSS('height','180px');
  await p.getByRole('combobox',{name:'文字排列',exact:true}).selectOption('horizontal-tb');
  await box(page).click();
  const h = (await frame(page).locator('[data-text-resize="s"]').boundingBox())!;
  await page.mouse.move(h.x+5,h.y+5); await page.mouse.down(); await page.mouse.move(h.x+5,h.y+65,{steps:5}); await page.mouse.up();
  await expect(box(page)).toHaveCSS('height','240px');
  await p.getByRole('button',{name:'自动字号',exact:true}).click();
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor, b = e.getBody().querySelector<HTMLElement>('#layout-text')!;
    e.dispatch('compositionstart');
    const source = b.querySelector('[data-text-source]')!; source.textContent = '中文组合输入'.repeat(80);
    e.dispatch('input');
  });
  const before = await box(page).evaluate(el => parseFloat(getComputedStyle(el).fontSize));
  expect(before).toBeGreaterThan(30);
  await page.evaluate(() => window.tinymce.activeEditor.dispatch('compositionend'));
  expect(await box(page).evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeLessThan(before);
  await expect(box(page)).toHaveCSS('height','240px');
});
