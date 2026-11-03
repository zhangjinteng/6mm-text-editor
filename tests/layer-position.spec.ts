import { test, expect, type Page } from '@playwright/test';
const frame = (p: Page) => p.frameLocator('.tox-edit-area iframe');
const object = (p: Page) => frame(p).locator('#positioned');
const cases = [['图片', 'image'], ['文字', 'text'], ['弹幕', 'danmaku']] as const;
const labels = ['水平居中', '垂直居中', '贴顶部', '贴底部', '画布中心', '贴右侧', '贴左侧'];
async function setup(page: Page, kind: string) {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(kind => {
    const e = window.tinymce.activeEditor;
    const style = 'position:absolute;left:80px;top:60px;width:160px;height:90px';
    const element = kind === 'image' ? `<img id="positioned" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" style="${style}">` : kind === 'text' ?
      `<span id="positioned" data-text-draggable="true" style="${style};text-align:right;font-size:20px">定位文字</span>` :
      `<div id="positioned" data-danmaku-source="current" data-danmaku-id="position" style="${style}"></div>`;
    e.setContent(`<div style="position:relative;left:65px;top:30px;width:430px;height:320px">${element}</div>`);
    e.undoManager.clear(); e.undoManager.add();
  }, kind);
}
async function geometry(page: Page) {
  return page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    return { object: e.getBody().querySelector('#positioned')!.getBoundingClientRect().toJSON(), canvas: e.getBody().getBoundingClientRect().toJSON() };
  });
}
async function expectPosition(page: Page, label: string, before: Awaited<ReturnType<typeof geometry>>) {
  await expect.poll(async () => {
    const { object: o, canvas: c } = await geometry(page);
    const x = label === '贴左侧' ? c.x : label === '贴右侧' ? c.right - o.width : ['水平居中', '画布中心'].includes(label) ? c.x + (c.width - o.width) / 2 : before.object.x;
    const y = label === '贴顶部' ? c.y : label === '贴底部' ? c.bottom - o.height : ['垂直居中', '画布中心'].includes(label) ? c.y + (c.height - o.height) / 2 : before.object.y;
    return Math.max(Math.abs(o.x - x), Math.abs(o.y - y), Math.abs(o.width - before.object.width), Math.abs(o.height - before.object.height));
  }).toBeLessThan(1);
}
for (const [name, kind] of cases) test(`${name}七种图层位置按画布定位，嵌套容器、单轴保留、撤销与保存`, async ({ page }) => {
  await setup(page, kind); await object(page).click({ position: { x: 20, y: 20 } });
  const panel = page.getByRole('complementary', { name: `${name}配置面板` });
  if (kind !== 'danmaku') await panel.getByRole('tab', { name: '排版', exact: true }).click();
  const group = panel.getByRole('group', { name: '图层位置', exact: true });
  await expect(group.getByRole('button')).toHaveCount(7);
  if (kind === 'text') await expect(panel.getByRole('group', { name: '文字对齐', exact: true })).toBeVisible();
  for (const label of labels) {
    const before = await geometry(page);
    await group.getByRole('button', { name: label, exact: true }).click();
    await expectPosition(page, label, before);
  }
  const before = await geometry(page);
  const beforeHtml = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  await group.getByRole('button', { name: '画布中心', exact: true }).click();
  await expectPosition(page, '画布中心', before);
  await page.screenshot({ path: `screenshots/layer-position-${kind}.png` });
  const afterHtml = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(beforeHtml);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(afterHtml);
  if (kind === 'text') await expect(object(page)).toHaveCSS('text-align', 'right');
  if (kind === 'danmaku') {
    const coordinates = await object(page).evaluate(el => ({ x: el.getAttribute('data-danmaku-x'), y: el.getAttribute('data-danmaku-y'), left: (el as HTMLElement).style.left, top: (el as HTMLElement).style.top }));
    expect(Number(coordinates.x)).toBeCloseTo(parseFloat(coordinates.left)); expect(Number(coordinates.y)).toBeCloseTo(parseFloat(coordinates.top));
  }
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(afterHtml);
});

for (const [name, kind] of cases) test(`${name}设置弹窗累计两个方向，取消不改正文，应用一次撤销`, async ({ page }) => {
  await setup(page, kind); await object(page).click({ position: { x: 20, y: 20 } });
  const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  const open = async () => {
    await page.locator(`.tox-pop:visible [data-mce-name="${kind === 'image' ? 'imagesettings' : kind === 'text' ? 'textsettings' : 'danmakusettings'}"]`).click();
    const d = page.getByRole('dialog', { name: `${name}设置`, exact: true });
    if (kind !== 'danmaku') await d.getByRole('tab', { name: '排版', exact: true }).click();
    await d.getByRole('button', { name: '贴顶部', exact: true }).click();
    await d.getByRole('button', { name: '贴右侧', exact: true }).click();
    return d;
  };
  let d = await open();
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await d.getByRole('button', { name: '取消', exact: true }).click();
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  d = await open(); await d.getByRole('button', { name: '应用设置', exact: true }).click();
  const { object: o, canvas: c } = await geometry(page);
  expect(o.right).toBeCloseTo(c.right, 0); expect(o.top).toBeCloseTo(c.top, 0);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
});
