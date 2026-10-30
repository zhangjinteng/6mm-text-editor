import { expect, test, type Page, type Locator } from '@playwright/test';
import type { Editor } from 'tinymce';
declare global { interface Window { tinymce: { activeEditor: Editor } } }

async function dragText(page: Page, text: Locator, dx: number, dy: number, cancel = false) {
  const box = (await text.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + dx, box.y + box.height / 2 + dy, { steps: 12 });
  if (cancel) await page.keyboard.press('Escape');
  await page.mouse.up();
}

test('文字自由拖动保留格式、支持撤销取消、保存和恢复正文', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    e.setContent('<p>前面<strong style="color: #e03e2d">可拖动文字</strong>后面</p>');
    e.focus(); e.selection.select(e.getBody().querySelector('strong')!, true); e.fire('mouseup');
  });
  await page.locator('.tox-pop [data-mce-name="textdrag"]').click();
  const body = page.frameLocator('.tox-edit-area iframe').locator('body');
  const text = body.locator('[data-text-draggable]');
  await expect(text).toHaveText('可拖动文字');
  const before = (await text.boundingBox())!;
  await dragText(page, text, 120, 90);
  await expect(text).toHaveCSS('position', 'absolute');
  const after = (await text.boundingBox())!;
  expect(after.x-before.x).toBeCloseTo(120, 0); expect(after.y-before.y).toBeCloseTo(90, 0);
  await expect(body.locator('strong')).toHaveCSS('color', 'rgb(224, 62, 45)');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  await expect(text).not.toHaveCSS('position', 'absolute');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  await expect(text).toHaveCSS('position', 'absolute');
  const cancelBefore = (await text.boundingBox())!;
  await dragText(page, text, 60, 60, true);
  const cancelAfter = (await text.boundingBox())!;
  expect(cancelAfter.x).toBeCloseTo(cancelBefore.x,0); expect(cancelAfter.y).toBeCloseTo(cancelBefore.y,0);
  await page.getByRole('button',{name:'保存文档',exact:true}).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(text).toHaveCSS('position','absolute');
  const saved = (await text.boundingBox())!;
  expect(saved.x).toBeCloseTo(after.x,0); expect(saved.y).toBeCloseTo(after.y,0);
  await text.click();
  await page.locator('.tox-pop [data-mce-name="textdrag"]').click();
  await expect(text).toHaveCount(0);
  await expect(body.locator('p')).toHaveText('前面可拖动文字后面');
  await expect(body.locator('strong')).toHaveCSS('color','rgb(224, 62, 45)');
});

test('动画文字拖动后仍能播放，恢复正文保留动画', async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e=window.tinymce.activeEditor;
    e.setContent('<p><span data-text-animation="pulse" style="animation-duration:2s;animation-iteration-count:infinite">动画文字</span></p>');
    e.focus(); e.selection.select(e.getBody().querySelector('p')!,true); e.fire('mouseup');
  });
  await page.locator('.tox-pop [data-mce-name="textdrag"]').click();
  const body=page.frameLocator('.tox-edit-area iframe').locator('body');
  const text=body.locator('[data-text-draggable]');
  await expect(text).not.toHaveAttribute('data-text-animation', 'pulse');
  await expect(text.locator('[data-text-animation="pulse"]')).toHaveCount(1);
  const box=(await text.boundingBox())!;
  await dragText(page, text, 100, 80);
  await expect(text).toHaveCSS('position','absolute');
  await expect(text.locator('[data-text-animation]')).toHaveCSS('animation-name','pulse');
  await text.click(); await page.locator('.tox-pop [data-mce-name="textdrag"]').click();
  await expect(text).toHaveCount(0);
  await expect(body.locator('[data-text-animation]')).toHaveCSS('animation-name','pulse');
});

test('首次拖动脱离正文后，文字在编辑区下方仍完整可见和可点击', async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e=window.tinymce.activeEditor;
    e.setContent('<h2>留在原处的文字</h2><p><span data-text-animation="pulse" style="animation-duration:1ms;transform:translateZ(0)"><span data-text-draggable="true" style="display:inline-block"><strong>首次拖动文字</strong></span></span></p>');
  });
  const text=page.frameLocator('.tox-edit-area iframe').locator('[data-text-draggable]');
  const before=(await text.boundingBox())!;
  await dragText(page, text, 80, 180);
  await expect(text).toHaveCSS('position','absolute');
  const visible = () => text.evaluate(element => {
    const box=element.getBoundingClientRect();
    const hit=element.ownerDocument.elementFromPoint(box.left+box.width/2,box.bottom-3);
    return { withinBody: box.bottom <= element.ownerDocument.body.getBoundingClientRect().bottom,
      clickable: !!hit && element.contains(hit) };
  });
  expect(await visible()).toEqual({withinBody:true,clickable:true});
  await page.getByRole('button',{name:'保存文档',exact:true}).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  expect(await visible()).toEqual({withinBody:true,clickable:true});
  await page.getByRole('navigation',{name:'文档视图'}).getByRole('button',{name:'预览',exact:true}).click();
  const preview=page.frameLocator('iframe[title="文档预览"]').locator('[data-text-draggable]');
  expect(await preview.evaluate(e=>e.getBoundingClientRect().bottom<=e.ownerDocument.body.getBoundingClientRect().bottom)).toBe(true);
});

test('重复框选整段切换拖动不会累积 span，并能清除旧的嵌套拖动层', async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => window.tinymce.activeEditor.setContent('<p><strong style="color:#e03e2d">重复切换</strong></p>'));
  const body = page.frameLocator('.tox-edit-area iframe').locator('body');
  const toggle = async () => {
    await page.evaluate(() => {
      const e = window.tinymce.activeEditor;
      e.focus(); e.selection.select(e.getBody().querySelector('p')!,true); e.fire('mouseup');
    });
    await page.locator('.tox-pop [data-mce-name="textdrag"]').click();
  };
  for (let i=0;i<8;i++) {
    await toggle();
    await expect(body.locator('[data-text-draggable]')).toHaveCount(i%2===0 ? 1 : 0);
    await expect(body.locator('span span')).toHaveCount(0);
  }
  await page.evaluate(() => window.tinymce.activeEditor.setContent('<p><span data-text-draggable="true"><span data-text-draggable="true"><span data-text-animation="pulse"><strong style="color:#e03e2d">旧嵌套文字</strong></span></span></span></p>'));
  await toggle();
  await expect(body.locator('[data-text-draggable]')).toHaveCount(0);
  await expect(body.locator('[data-text-animation="pulse"]')).toHaveText('旧嵌套文字');
  await expect(body.locator('strong')).toHaveCSS('color','rgb(224, 62, 45)');
});

test('拖动后双击输入及框选文字不再移动对象，手柄不保存或导出', async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    e.setContent('<p><span data-text-draggable="true"><strong style="color:#e03e2d"><span data-text-animation="pulse" style="animation-duration:1ms">文字可以编辑</span></strong></span></p>');
  });
  const text = page.frameLocator('.tox-edit-area iframe').locator('[data-text-draggable]');
  await dragText(page, text, 120, 120);
  const position = await text.evaluate(e => ({ left: (e as HTMLElement).style.left, top: (e as HTMLElement).style.top }));
  await text.dblclick();
  await page.keyboard.press('End'); await page.keyboard.insertText('新增');
  await expect(text).toContainText('新增');
  const box = (await text.boundingBox())!;
  await page.mouse.move(box.x+5,box.y+14); await page.mouse.down();
  await page.mouse.move(box.x+box.width-5,box.y+14,{steps:10}); await page.mouse.up();
  expect(await page.evaluate(() => window.tinymce.activeEditor.selection.getContent({format:'text'}))).not.toBe('');
  expect(await text.evaluate(e => ({left:(e as HTMLElement).style.left,top:(e as HTMLElement).style.top}))).toEqual(position);
  await expect(text.locator('strong')).toHaveCSS('color','rgb(224, 62, 45)');
  await expect(text.locator('[data-text-animation]')).toHaveCSS('animation-name','pulse');
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).not.toContain('data-text-move-handle');
  await page.getByRole('button',{name:'保存文档',exact:true}).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(text).toContainText('新增');
  expect(await text.evaluate(e => ({left:(e as HTMLElement).style.left,top:(e as HTMLElement).style.top}))).toEqual(position);
  await text.click();
  await expect(page.frameLocator('.tox-edit-area iframe').locator('.text-box-frame')).toBeVisible();
  await page.getByRole('navigation',{name:'文档视图'}).getByRole('button',{name:'预览',exact:true}).click();
  await expect(page.frameLocator('iframe[title="文档预览"]').locator('[data-text-move-handle]')).toHaveCount(0);
});

for (const tag of ['h2', 'p']) {
  test(`框选整个 ${tag} 后单击内部文本框即可拖动`, async ({ page }) => {
    await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
    await page.mouse.move(1200, 30);
    await page.evaluate(tag => {
      const e = window.tinymce.activeEditor;
      e.setContent(`<${tag}><span data-text-draggable="true"><strong>整块选择文字</strong></span> 同段文字</${tag}><p>普通文字</p>`);
      e.focus(); e.selection.select(e.getBody().querySelector(tag)!, true);
      e.nodeChanged(); e.dispatch('SelectionChange');
    }, tag);
    expect(await page.evaluate(() => window.tinymce.activeEditor.selection.getNode().tagName.toLowerCase())).toBe(tag);
    const frame = page.frameLocator('.tox-edit-area iframe');
    const text = frame.locator('[data-text-draggable]');

    const before = (await text.boundingBox())!;
    await dragText(page, text, 100, 80);
    const after = (await text.boundingBox())!;
    expect(after.x-before.x).toBeCloseTo(100,0); expect(after.y-before.y).toBeCloseTo(80,0);
    await expect(text).toHaveCount(1);
    await page.evaluate(() => {
      const e=window.tinymce.activeEditor;
      e.selection.select(e.getBody().querySelector('p:last-of-type')!,true);
      e.nodeChanged(); e.dispatch('SelectionChange');
    });
    await frame.getByText('普通文字', {exact:true}).click({position:{x:10,y:10}});
    await expect(frame.locator('.text-box-frame')).toBeVisible();
  });
}

test('跨多个拖动文字块的选区不误显示某一个块的手柄', async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e=window.tinymce.activeEditor;
    e.setContent('<p><span data-text-draggable="true">第一块</span><span data-text-draggable="true">第二块</span></p>');
    e.focus(); e.selection.select(e.getBody().querySelector('p')!,true);
    e.nodeChanged(); e.dispatch('SelectionChange');
  });
  await expect(page.frameLocator('.tox-edit-area iframe').getByRole('button',{name:'拖动文字',exact:true})).toBeHidden();
});
