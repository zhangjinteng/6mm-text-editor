import { expect, test } from '@playwright/test';

test('排版列表按钮与工具栏同步，支持切换、取消、撤销及保存', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    e.setContent('<p><span id="list-text" data-text-draggable="true" style="position:absolute;left:180px;top:100px;width:300px;font-size:32px">列表<strong>文字</strong><br>第二行</span></p><p id="neighbor">其他段落</p>');
    e.undoManager.clear(); e.undoManager.add();
  });
  const frame = page.frameLocator('.tox-edit-area iframe');
  const box = frame.locator('#list-text');
  const panel = page.getByRole('complementary', { name: '文字配置面板' });
  const lists = panel.getByRole('group', { name: '文字列表', exact: true });
  const ordered = lists.getByRole('button', { name: '有序列表', exact: true });
  const unordered = lists.getByRole('button', { name: '无序列表', exact: true });
  const open = async () => {
    await box.click();
    await panel.getByRole('tab', { name: '排版', exact: true }).click();
  };
  await open();
  await expect(ordered).toHaveAttribute('aria-pressed', 'false');
  await unordered.click();
  await expect(frame.locator('ul #list-text')).toHaveCount(1);
  await expect(box.locator('[data-text-list-marker]')).toHaveText('•');
  await expect(unordered).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.tox-toolbar [data-mce-name="bullist"]').first()).toHaveAttribute('aria-pressed', 'true');
  await ordered.click();
  await expect(frame.locator('ol #list-text')).toHaveCount(1);
  await expect(box.locator('[data-text-list-marker]')).toHaveText('1.');
  await expect(ordered).toHaveAttribute('aria-pressed', 'true');
  await expect(unordered).toHaveAttribute('aria-pressed', 'false');
  await expect(frame.locator('ol #neighbor,ul #neighbor')).toHaveCount(0);
  await expect(box.locator('strong')).toHaveText('文字');
  await expect(box.locator('br')).toHaveCount(1);
  await expect(box).toHaveCSS('left', '180px');
  await expect(box).toHaveCSS('width', '300px');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  await expect(frame.locator('ul #list-text')).toHaveCount(1);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
  await expect(frame.locator('ol #list-text')).toHaveCount(1);
  await open();
  await expect(ordered).toHaveAttribute('aria-pressed', 'true');
  await ordered.click();
  await expect(frame.locator('ol #list-text,ul #list-text')).toHaveCount(0);
  await expect(box.locator('[data-text-list-marker]')).toHaveCount(0);
  await expect(ordered).toHaveAttribute('aria-pressed', 'false');
  // A toolbar change must also update the sidebar buttons.
  await page.evaluate(() => window.tinymce.activeEditor.execCommand('InsertUnorderedList'));
  await expect(unordered).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload();
  await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await open();
  await expect(unordered).toHaveAttribute('aria-pressed', 'true');
  await expect(frame.locator('ul #list-text')).toHaveCount(1);
  await lists.screenshot({ path: 'screenshots/text-list-buttons.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await lists.scrollIntoViewIfNeeded();
  const bounds = (await lists.boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  await ordered.focus(); await page.keyboard.press('Enter');
  await expect(frame.locator('ol #list-text')).toHaveCount(1);
});

test('旧列表标记回到文字框内，拖动缩放、编号样式和保存后位置正确', async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    e.setContent('<ol start="3" style="list-style-type:upper-alpha"><li>普通列表项</li><li><span id="marker-box" data-text-draggable="true" style="position:absolute;left:240px;top:100px;width:440px;font-size:40px;line-height:1.5;color:#147d64"><strong>文字列表</strong><br>第二行内容</span></li></ol>');
    e.undoManager.clear(); e.undoManager.add();
  });
  const frame = page.frameLocator('.tox-edit-area iframe');
  const box = frame.locator('#marker-box'), marker = box.locator('[data-text-list-marker]');
  await expect(marker).toHaveText('D.');
  await expect(marker).toHaveCSS('font-size', '40px');
  await expect(marker).toHaveCSS('color', 'rgb(20, 125, 100)');
  expect(await frame.locator('li').last().evaluate(el => getComputedStyle(el, '::marker').content)).toBe('""');
  expect(await frame.locator('li').first().evaluate(el => el.hasAttribute('data-text-list-host'))).toBe(false);
  const assertInside = async () => {
    const outer = (await box.boundingBox())!, inner = (await marker.boundingBox())!;
    expect(inner.x).toBeGreaterThanOrEqual(outer.x - 1);
    expect(inner.y).toBeGreaterThanOrEqual(outer.y - 1);
    expect(inner.x + inner.width).toBeLessThanOrEqual(outer.x + outer.width + 1);
    expect(inner.y + inner.height).toBeLessThanOrEqual(outer.y + outer.height + 1);
    return inner;
  };
  const before = await assertInside();
  await box.click();
  const b = (await box.boundingBox())!;
  await page.mouse.move(b.x + 120, b.y + 30); await page.mouse.down();
  await page.mouse.move(b.x + 200, b.y + 70, { steps: 10 }); await page.mouse.up();
  const after = await assertInside();
  expect(after.x - before.x).toBeCloseTo(80, 0);
  expect(after.y - before.y).toBeCloseTo(40, 0);
  const handle = (await frame.locator('[data-text-resize="se"]').boundingBox())!;
  await page.mouse.move(handle.x + 5, handle.y + 5); await page.mouse.down();
  await page.mouse.move(handle.x + 93, handle.y + 5, { steps: 10 }); await page.mouse.up();
  await assertInside();
  expect(await marker.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThan(40);
  await page.screenshot({ path: 'screenshots/text-list-markers-inside.png' });
  // The native toolbar changes the same list and keeps its marker inside the object.
  await page.locator('.tox-toolbar [data-mce-name="bullist"]').first().click();
  await expect(marker).toHaveText('•'); await assertInside();
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(marker).toHaveCount(1); await expect(marker).toHaveText('•'); await assertInside();
});
