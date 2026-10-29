import { textTool } from './helpers/text-tools';
import { expect, test, type Page } from '@playwright/test';
import type { Editor } from 'tinymce';
declare global { interface Window { tinymce: { activeEditor: Editor } } }

async function checkPosition(page: Page, mode: 'bottom' | 'right') {
  const popup = page.locator('.tox-pop:visible');
  await expect(popup).toHaveAttribute('data-editor-docked-toolbar', 'true');
  await expect(popup).toHaveAttribute('data-editor-toolbar-position', mode);
  await expect(popup.locator('[data-mce-name="toolbarposition"]')).toHaveCount(1);
  await expect.poll(async () => {
    // 检查实际显示的面板，不能只检查可能被原生 max-height 缩小的外层容器。
    const toolbar = (await popup.locator('.tox-pop__dialog').boundingBox())!;
    const area = (await page.locator('.tox-edit-area').boundingBox())!;
    return mode === 'bottom'
      ? Math.max(Math.abs(toolbar.x + toolbar.width / 2 - area.x - area.width / 2), Math.abs(area.y + area.height - toolbar.y - toolbar.height - 50))
      : Math.max(Math.abs(toolbar.y + toolbar.height / 2 - area.y - area.height / 2), Math.abs(area.x + area.width - toolbar.x - toolbar.width - 50));
  }).toBeLessThan(2);
  await expect(popup.locator('[data-mce-name="toolbarposition"]')).toHaveAttribute('aria-pressed', mode === 'right' ? 'true' : 'false');
  const controls = popup.locator('.tox-toolbar__group > *');
  const boxes = await controls.evaluateAll(nodes => nodes.map(node => {
    const box = node.getBoundingClientRect();
    return { x: box.x, y: box.y, width: box.width, height: box.height };
  }).filter(box => box.width > 0 && box.height > 0));
  if (mode === 'right') {
    expect(boxes.length).toBeGreaterThan(1);
    for (let index = 1; index < boxes.length; index++) {
      expect(Math.abs(boxes[index].x + boxes[index].width / 2 - boxes[0].x - boxes[0].width / 2)).toBeLessThan(2);
      expect(boxes[index].y).toBeGreaterThanOrEqual(boxes[index - 1].y + boxes[index - 1].height - 1);
    }
  } else {
    expect(Math.max(...boxes.map(box => box.y)) - Math.min(...boxes.map(box => box.y))).toBeLessThan(2);
  }

}

test('图片原锚点空间较小时，居右工具栏仍按完整面板上下居中', async ({ page }) => {
  await page.setViewportSize({ width: 1863, height: 930 });
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    window.tinymce.activeEditor.setContent('<p><img style="position:absolute;left:490px;top:180px" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" width="200" height="200"></p>');
  });
  await page.frameLocator('.tox-edit-area iframe').locator('img').click();
  await page.locator('.tox-pop:visible [data-mce-name="toolbarposition"]').click();
  await checkPosition(page, 'right');
  const popup = page.locator('.tox-pop:visible');
  await expect(popup).toHaveCSS('max-height', 'none');
  const container = (await popup.boundingBox())!;
  const panel = (await popup.locator('.tox-pop__dialog').boundingBox())!;
  expect(container.height).toBeCloseTo(panel.height, 0);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await checkPosition(page, 'right');
});

test('文字、图片、弹幕工具栏共用居下/居右位置，切换对象和缩放布局保持状态', async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    e.setContent('<p id="text">选择这段文字</p><p><img src="data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"100\" height=\"80\"/%3E" width="100" height="80" /></p><div data-danmaku-source="current" style="position:absolute;left:300px;top:180px;width:200px;height:100px">弹幕</div>');
    e.focus(); e.selection.select(e.getBody().querySelector('#text')!, true); e.fire('mouseup');
  });
  const popup = page.locator('.tox-pop:visible');
  await checkPosition(page, 'bottom');
  await expect(popup.locator('[data-mce-name="textgroupstyle"]')).toBeVisible();
  await popup.locator('[data-mce-name="toolbarposition"]').click();
  await checkPosition(page, 'right');
  await (await textTool(page, 'forecolor-chevron')).click();
  await expect(page.locator('[data-mce-color="#E03E2D"]')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.frameLocator('.tox-edit-area iframe').locator('img').click();
  await expect(popup.locator('[data-mce-name="imagefill"]')).toBeVisible();
  await checkPosition(page, 'right');
  await popup.locator('[data-mce-name="toolbarposition"]').click();
  await checkPosition(page, 'bottom');
  await page.frameLocator('.tox-edit-area iframe').locator('[data-danmaku-source]').click();
  await expect(popup.locator('[data-mce-name="danmakualignleft"]')).toBeVisible();
  await checkPosition(page, 'bottom');
  await popup.locator('[data-mce-name="toolbarposition"]').click();
  await checkPosition(page, 'right');
  await page.setViewportSize({ width: 1200, height: 900 });
  await checkPosition(page, 'right');
  await popup.locator('[data-mce-name="toolbarposition"]').click();
  await checkPosition(page, 'bottom');
  await page.evaluate(() => { window.tinymce.activeEditor.focus(); window.tinymce.activeEditor.selection.select(window.tinymce.activeEditor.getBody().querySelector('#text')!, true); window.tinymce.activeEditor.fire('mouseup'); });
  await expect(popup.locator('[data-mce-name="textgroupstyle"]')).toBeVisible();
  await checkPosition(page, 'bottom');
});

test('拖动文字的合并工具栏仅显示一个位置按钮，切换不更改正文', async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    e.setContent('<p><span data-text-draggable="true" style="display:inline-block">拖动文字</span></p>');
    e.focus(); e.selection.select(e.getBody().querySelector('span')!, true); e.fire('mouseup');
  });
  const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  const popup = page.locator('.tox-pop:visible');
  await checkPosition(page, 'bottom');
  await popup.locator('[data-mce-name="toolbarposition"]').click();
  await checkPosition(page, 'right');
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
});

test('全屏仅在画布工具栏显示并可进入和退出全屏', async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    e.setContent('<p id="fullscreen-text">全屏回归文字</p><p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" width="100" height="80" alt="全屏图片"></p><div data-danmaku-source="current" style="position:absolute;left:300px;top:180px;width:180px;height:100px">弹幕</div>');
  });
  const frame = page.frameLocator('.tox-edit-area iframe');
  const popup = page.locator('.tox-pop:visible');
  for (const kind of ['text', 'image', 'danmaku', 'blank']) {
    if (kind === 'text') await page.evaluate(() => {
      const e = window.tinymce.activeEditor; e.focus(); e.selection.select(e.getBody().querySelector('#fullscreen-text')!, true); e.nodeChanged(); e.dispatch('mouseup');
    });
    else if (kind === 'image') await frame.locator('img').click();
    else if (kind === 'danmaku') await frame.locator('[data-danmaku-source]').click({ position: { x: 20, y: 20 } });
    else {
      const area = (await page.locator('.tox-edit-area iframe').boundingBox())!;
      await page.mouse.click(area.x + area.width - 20, area.y + 30);
    }
    const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
    const fullscreen = popup.locator('[data-mce-name="fullscreen"]');
    if (kind !== 'blank') {
      await expect(fullscreen).toHaveCount(0);
      await expect(page.locator('.tox-toolbar-overlord [data-mce-name="fullscreen"]')).toHaveCount(0);
      continue;
    }
    await expect(fullscreen).toHaveCount(1);
    await checkPosition(page, 'bottom');
    await fullscreen.click();
    await expect(page.locator('.tox-tinymce'), `进入全屏：${kind}`).toHaveClass(/tox-fullscreen/);
    await expect(fullscreen).toHaveAttribute('aria-pressed', 'true');
    await checkPosition(page, 'bottom');
    await fullscreen.click();
    await expect(page.locator('.tox-tinymce')).not.toHaveClass(/tox-fullscreen/);
    await expect(fullscreen).toHaveAttribute('aria-pressed', 'false');
    await checkPosition(page, 'bottom');
    expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  }
});

test('表情符号仅在画布工具栏显示并可插入', async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    e.setContent('<p id="emoji-text">表情回归</p><p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="表情测试图片" width="100" height="80"></p><div data-danmaku-source="current" style="position:absolute;left:300px;top:180px;width:180px;height:100px">弹幕</div>');
  });
  const frame = page.frameLocator('.tox-edit-area iframe');
  for (const kind of ['text', 'image', 'danmaku', 'blank']) {
    if (kind === 'text') await page.evaluate(() => {
      const e = window.tinymce.activeEditor; e.focus(); e.selection.select(e.getBody().querySelector('#emoji-text')!, true); e.nodeChanged(); e.dispatch('mouseup');
    });
    else if (kind === 'image') await frame.locator('img').click();
    else if (kind === 'danmaku') await frame.locator('[data-danmaku-source]').click({ position: { x: 20, y: 20 } });
    else {
      const area = (await page.locator('.tox-edit-area iframe').boundingBox())!;
      await page.mouse.click(area.x + area.width - 20, area.y + 30);
    }
    const popup = page.locator('.tox-pop:visible');
    if (kind !== 'blank') {
      await expect(popup.locator('[data-mce-name="emoticons"]')).toHaveCount(0);
      await expect(page.locator('.tox-toolbar-overlord [data-mce-name="emoticons"]')).toHaveCount(0);
      continue;
    }
    await expect(popup.locator('[data-mce-name="emoticons"]')).toHaveCount(1);
    await checkPosition(page, 'bottom');
    await popup.locator('[data-mce-name="emoticons"]').click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('textbox', { name: '搜索', exact: true })).toBeVisible();
    if (kind === 'blank') {
      await dialog.getByRole('textbox', { name: '搜索', exact: true }).fill('grinning');
      const emoji = dialog.locator('.tox-collection__item').first();
      await expect(emoji).toBeVisible();
      const symbol = await emoji.innerText();
      await emoji.click();
      await expect(dialog).toHaveCount(0);
      await expect(frame.locator('body')).toContainText(symbol.trim());
      await expect(frame.locator('[data-danmaku-source]')).not.toContainText(symbol.trim());
    } else {
      await dialog.getByRole('button', { name: '关闭', exact: true }).first().click();
    }
  }
});

for (const origin of ['image', 'danmaku']) {
  test(`画布工具栏插入新图片，不替换现有图片或写入弹幕内部（${origin}）`, async ({ page }) => {
    await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
    await page.evaluate(() => {
      const e = window.tinymce.activeEditor;
      e.setContent('<p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" alt="原有图片" width="100" height="80"></p><div data-danmaku-source="current" style="position:absolute;left:300px;top:180px;width:180px;height:100px">弹幕</div>');
      e.undoManager.clear(); e.undoManager.add();
    });
    const frame = page.frameLocator('.tox-edit-area iframe');
    if (origin === 'image') await frame.locator('img').click();
    else await frame.locator('[data-danmaku-source]').click({ position: { x: 20, y: 20 } });
    const area = (await page.locator('.tox-edit-area iframe').boundingBox())!;
    await page.mouse.click(area.x + area.width - 20, area.y + 30);
    const popup = page.locator('.tox-pop:visible');
    await expect(popup.locator('[data-mce-name="canvasimage"]')).toHaveCount(1);
    await popup.locator('[data-mce-name="canvasimage"]').click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('combobox', { name: '地址', exact: true })).toHaveValue('');
    await dialog.getByRole('combobox', { name: '地址', exact: true }).fill('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7');
    await dialog.getByRole('textbox', { name: '替代描述', exact: true }).fill('画布插入图片');
    await dialog.getByRole('button', { name: '保存', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(frame.locator('img')).toHaveCount(2);
    await expect(frame.locator('img[alt="原有图片"]')).toHaveCount(1);
    await expect(frame.locator('[data-danmaku-source] img')).toHaveCount(0);
    await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
    await expect(frame.locator('img')).toHaveCount(1);
    await page.evaluate(() => window.tinymce.activeEditor.undoManager.redo());
    await expect(frame.locator('img[alt="画布插入图片"]')).toHaveCount(1);
    await page.getByRole('button', { name: '保存文档', exact: true }).click();
    await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
    await expect(frame.locator('img')).toHaveCount(2);
  });
}
