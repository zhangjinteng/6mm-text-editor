import { expect, test, type Page } from '@playwright/test';
import type { Editor } from 'tinymce';
declare global { interface Window { tinymce: { activeEditor: Editor } } }

const source = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
async function action(page: Page, label: string) {
  const button = page.locator('.tox-pop:visible').getByRole('button', { name: '图层设置', exact: true });
  await expect(button).toHaveCount(1);
  await button.click();
  await page.getByRole('menuitem', { name: label, exact: true }).click();
}
async function order(page: Page) {
  return page.evaluate(() => Array.from(window.tinymce.activeEditor.getBody().querySelectorAll<HTMLElement>('[data-layer-test]'))
    .sort((a, b) => Number(a.style.zIndex) - Number(b.style.zIndex)).map(element => element.id));
}

test.beforeEach(async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
});

test('四种图层操作改变图片、文字、弹幕的遮挡顺序，支持撤销、重做、保存和预览', async ({ page }) => {
  await page.evaluate(source => {
    const e = window.tinymce.activeEditor;
    e.setContent(`<p><img id="image" data-layer-test="true" src="${source}" alt="图层图片" style="position:absolute;left:40px;top:60px;width:180px;height:100px;z-index:0"><span id="text" data-layer-test="true" data-text-draggable="true" style="position:absolute;left:40px;top:60px;width:180px;height:100px;z-index:10;background:green">图层文字</span></p><div id="danmaku" data-layer-test="true" data-danmaku-source="current" style="position:absolute;left:40px;top:60px;width:180px;height:100px;z-index:20;background:#ddd"></div>`);
    e.undoManager.clear(); e.undoManager.add();
    e.focus(); e.selection.select(e.getBody().querySelector('#image')!); e.nodeChanged();
  }, source);
  const frame = page.frameLocator('.tox-edit-area iframe');
  const before = (await frame.locator('#image').boundingBox())!;
  await page.locator('.tox-pop:visible').getByRole('button', { name: '图层设置', exact: true }).click();
  await expect(page.locator('.tox-menu:visible').getByRole('menuitem')).toHaveText(['下一层', '上一层', '置于底层', '置于顶层']);
  await page.keyboard.press('Escape');
  await action(page, '上一层'); expect(await order(page)).toEqual(['text', 'image', 'danmaku']);
  await action(page, '上一层'); expect(await order(page)).toEqual(['text', 'danmaku', 'image']);
  const hit = () => page.evaluate(() => {
    const e = window.tinymce.activeEditor; const box = e.getBody().querySelector('#image')!.getBoundingClientRect();
    return e.getDoc().elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)?.id;
  });
  expect(await hit()).toBe('image');
  await action(page, '下一层'); expect(await order(page)).toEqual(['text', 'image', 'danmaku']); expect(await hit()).toBe('danmaku');
  await action(page, '置于底层'); expect(await order(page)).toEqual(['image', 'text', 'danmaku']);
  await action(page, '置于顶层'); expect(await order(page)).toEqual(['text', 'danmaku', 'image']);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  expect(await order(page)).toEqual(['image', 'text', 'danmaku']);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  expect(await order(page)).toEqual(['text', 'danmaku', 'image']);
  const after = (await frame.locator('#image').boundingBox())!;
  expect(after).toEqual(before);
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  expect(await order(page)).toEqual(['text', 'danmaku', 'image']); expect(await hit()).toBe('image');
  await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  await expect(page.frameLocator('iframe[title="文档预览"]').locator('#image')).toHaveCSS('z-index', '3');
});

test('文字选区可设为独立图层，保留格式；各工具栏切换位置后仍有唯一图层菜单', async ({ page }) => {
  await page.evaluate(source => {
    const e = window.tinymce.activeEditor;
    e.setContent(`<p id="plain">选中<strong>粗体</strong>文字</p><p><img src="${source}" alt="另一图层" width="80" height="60"></p><div data-danmaku-source="current" style="width:180px;height:100px;background:#ddd"></div>`);
    e.undoManager.clear(); e.undoManager.add(); e.focus(); e.selection.select(e.getBody().querySelector('#plain')!, true); e.fire('mouseup');
  }, source);
  await action(page, '置于顶层');
  const frame = page.frameLocator('.tox-edit-area iframe');
  await expect(frame.locator('#plain [data-text-draggable]')).toHaveCount(1);
  await expect(frame.locator('#plain strong')).toHaveText('粗体');
  await expect(frame.locator('#plain [data-text-draggable]')).toHaveCSS('z-index', '3');
  await page.locator('.tox-pop:visible [data-mce-name="toolbarposition"]').click();
  await expect(page.locator('.tox-pop:visible')).toHaveAttribute('data-editor-toolbar-position', 'right');
  await action(page, '置于底层');
  await expect(frame.locator('#plain [data-text-draggable]')).toHaveCSS('z-index', '1');
  await frame.locator('img').click();
  await action(page, '置于顶层'); await expect(frame.locator('img')).toHaveCSS('z-index', '3');
  await frame.locator('[data-danmaku-source]').click({ position: { x: 20, y: 20 } });
  await action(page, '置于顶层'); await expect(frame.locator('[data-danmaku-source]')).toHaveCSS('z-index', '3');
});
