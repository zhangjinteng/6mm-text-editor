import { expect, test } from '@playwright/test';
import { openTextGroup, textTool } from './helpers/text-tools';

test('连续点击样式或段落入口关闭面板时，文字工具栏与选区保留', async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor; e.setContent('<p id="toggle-text">前面选中后面</p>');
    const text = e.getBody().querySelector('p')!.firstChild!;
    const range = e.getDoc().createRange(); range.setStart(text, 2); range.setEnd(text, 4);
    e.focus(); e.selection.setRng(range); e.dispatch('mouseup');
  });
  const toolbar = page.locator('.tox-pop:visible');
  for (const name of ['style', 'paragraph'] as const) {
    const button = toolbar.locator(`[data-mce-name="textgroup${name}"]`);
    const panel = page.locator(`[data-toolbar-group="textgroup${name}"]`);
    for (let round = 0; round < 3; round++) {
      await button.click(); await expect(panel).toBeVisible();
      await button.click(); await expect(panel).toBeHidden();
      // 等待 TinyMCE 的异步 focusout 检查完成，避免在关闭前误判通过。
      await page.waitForTimeout(80);
      await expect(toolbar).toBeVisible();
      expect(await page.evaluate(() => window.tinymce.activeEditor.selection.getContent({ format: 'text' }))).toBe('选中');
    }
  }
  await (await textTool(page, 'bold')).click();
  await expect(page.frameLocator('.tox-edit-area iframe').locator('#toggle-text strong')).toHaveText('选中');
});

test('点击文字工具栏及分组的空白、边框和控件不会关闭，字号仍可编辑', async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor; e.setContent('<p id="focus-text">工具栏保持显示</p>');
    e.focus(); e.selection.select(e.getBody().querySelector('p')!, true); e.dispatch('mouseup');
  });
  const toolbar = page.locator('.tox-pop:visible');
  const clickBlank = async (locator: import('@playwright/test').Locator) => {
    await expect.poll(async () => {
      const first = (await locator.boundingBox())!;
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      const second = (await locator.boundingBox())!;
      return Math.abs(first.x - second.x) + Math.abs(first.y - second.y);
    }).toBeLessThan(1);
    const box = (await locator.boundingBox())!;
    await page.mouse.click(box.x + box.width / 2, box.y + 2);
    // focusout 的关闭逻辑异步运行，下一次断言前等待连续帧。
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await expect(toolbar).toBeVisible();
  };
  await clickBlank(toolbar);
  for (const group of await toolbar.locator('.tox-toolbar__group').all()) await clickBlank(group);
  const input = toolbar.locator('input');
  await input.fill('28px'); await input.press('Enter');
  await expect(toolbar).toBeVisible();
  await expect(page.frameLocator('.tox-edit-area iframe').locator('#focus-text span')).toHaveCSS('font-size', '28px');
  for (const name of ['style', 'paragraph'] as const) {
    const panel = await openTextGroup(page, name);
    await clickBlank(panel);
    await page.keyboard.press('Escape');
    await expect(toolbar).toBeVisible();
  }
  await (await textTool(page, 'bold')).click();
  await expect(toolbar).toBeVisible();
  await expect(page.frameLocator('.tox-edit-area iframe').locator('#focus-text strong')).toHaveText('工具栏保持显示');
});

// 原生分组面板复用控件，布局和编辑行为一起检查。
test('文字工具栏分类收纳，面板操作保留选区，标题与颜色生效', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor; e.setContent('<p id="words">前面选中后面</p>'); e.undoManager.clear(); e.undoManager.add();
    const text = e.getBody().querySelector('p')!.firstChild!; const range = e.getDoc().createRange(); range.setStart(text, 2); range.setEnd(text, 4);
    e.focus(); e.selection.setRng(range); e.nodeChanged(); e.dispatch('mouseup');
  });
  const toolbar = page.locator('.tox-pop:visible');
  for (const group of ['style', 'paragraph']) await expect(toolbar.locator(`[data-mce-name="textgroup${group}"]`)).toBeVisible();
  await expect(toolbar.locator('[data-mce-name="textgroupfont"],[data-mce-name="textgroupcolor"]')).toHaveCount(0);
  await expect(toolbar.locator('[data-mce-name="forecolor"]')).toBeVisible();
  await expect(toolbar.locator('[data-mce-name="backcolor"]')).toBeVisible();
  await expect(toolbar.locator('[data-mce-name="fontfamily"]')).toBeVisible();
  await expect(toolbar.locator('[data-mce-name="bold"],[data-mce-name="h2"]')).toHaveCount(0);
  await expect(toolbar.locator('[data-mce-name="textdrag"]')).toHaveCount(1);
  const frame = page.frameLocator('.tox-edit-area iframe');
  await (await textTool(page, 'bold')).click();
  await expect(frame.locator('#words strong')).toHaveText('选中');
  await toolbar.locator('input').fill('26px'); await toolbar.locator('input').press('Enter');
  await expect(frame.locator('#words span').filter({ hasText: '选中' }).first()).toHaveCSS('font-size', '26px');
  await (await textTool(page, 'backcolor-chevron')).click();
  await page.locator('[data-mce-color="#E03E2D"]').click();
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toContain('background-color: #e03e2d');
  const paragraph = await openTextGroup(page, 'paragraph');
  await expect(paragraph.locator('[data-mce-name^="h"]')).toHaveCount(6);
  await paragraph.locator('[data-mce-name="h2"]').click();
  await expect(frame.locator('[data-selection-heading="h2"]')).toHaveText('选中');
  await page.keyboard.press('Escape');
  await toolbar.locator('[data-mce-name="textanimation"]').click();
  await expect(page.getByRole('dialog', { name: '文字动画设置' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('分类面板在分类按钮附近显示，居右时向左展开，切换对象正确关闭', async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    e.setContent('<p id="group-text">分类面板测试</p><p><img alt="切换对象" width="80" height="60" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"></p>');
    e.focus(); e.selection.select(e.getBody().querySelector('#group-text')!, true); e.nodeChanged(); e.dispatch('mouseup');
  });
  const toolbar = page.locator('.tox-pop:visible');
  const panel = await openTextGroup(page, 'style');
  await expect.poll(async () => {
    const box = (await panel.boundingBox())!;
    const button = (await toolbar.locator('[data-mce-name="textgroupstyle"]').boundingBox())!;
    return Math.max(Math.abs(box.x + box.width / 2 - button.x - button.width / 2), Math.abs(box.y + box.height + 8 - button.y));
  }).toBeLessThan(2);
  await expect(panel.locator('.tox-toolbar__group')).toHaveCSS('grid-template-columns', '44px 44px 44px');
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(toolbar).toBeVisible();
  await toolbar.locator('[data-mce-name="toolbarposition"]').click();
  const style = await openTextGroup(page, 'style');
  await expect.poll(async () => {
    const box = (await style.boundingBox())!;
    const button = (await toolbar.locator('[data-mce-name="textgroupstyle"]').boundingBox())!;
    return Math.abs(box.x + box.width + 8 - button.x);
  }).toBeLessThan(2);
  await page.keyboard.press('Escape');
  await toolbar.locator('[data-mce-name="fontfamily"]').click();
  await page.locator('.tox-menu:visible').getByText('Arial', { exact: true }).click();
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toMatch(/font-family: arial/i);
  await openTextGroup(page, 'style');
  await page.frameLocator('.tox-edit-area iframe').locator('img').click();
  await expect(toolbar.locator('[data-mce-name="imagefill"]')).toBeVisible();
  await expect(page.locator('[data-toolbar-group="textgroupstyle"]')).toBeHidden();
});
