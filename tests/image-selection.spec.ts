import { expect, test } from '@playwright/test';

test('选中及侧栏编辑不覆盖图片颜色，仍可缩放、删除和撤销', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(async () => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 120;
    const ctx = canvas.getContext('2d')!; ctx.fillStyle = '#ff8000'; ctx.fillRect(0, 0, 120, 120);
    const editor = window.tinymce.activeEditor;
    editor.setContent(`<p><img id="subject" src="${canvas.toDataURL()}" style="position:absolute;left:160px;top:100px;width:120px;height:120px"></p><p>普通文字</p>`);
    await editor.uploadImages(); editor.undoManager.clear(); editor.undoManager.add();
  });
  const frame = page.frameLocator('.tox-edit-area iframe');
  const image = frame.locator('#subject');
  const pixel = async () => {
    // Inspect rendered pixels, not computed opacity: the native selection tint
    // isn't a CSS overlay and is invisible to style assertions.
    const screenshot = await image.screenshot();
    return page.evaluate(async (data) => {
      const img = new Image(); img.src = `data:image/png;base64,${data}`; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
      const ctx = c.getContext('2d')!; ctx.drawImage(img, 0, 0);
      return [...ctx.getImageData(Math.floor(c.width / 2), Math.floor(c.height / 2), 1, 1).data];
    }, screenshot.toString('base64'));
  };
  await image.click();
  await expect.poll(pixel).toEqual([255, 128, 0, 255]);
  await expect(frame.locator('.object-selection-frame')).toBeVisible();
  await page.getByRole('complementary', { name: '图片配置面板' }).getByRole('tab', { name: '特效', exact: true }).click();
  await expect.poll(pixel).toEqual([255, 128, 0, 255]);
  await expect.poll(() => page.evaluate(() => window.tinymce.activeEditor.selection.getNode().id)).toBe('subject');
  await image.click();
  const handle = (await frame.locator('#objectResizeHandlese').boundingBox())!;
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await page.mouse.down(); await page.mouse.move(handle.x + 35, handle.y + 35, { steps: 5 }); await page.mouse.up();
  await expect.poll(() => image.evaluate(img => img.getBoundingClientRect().width)).toBeGreaterThan(140);
  await image.click(); await page.keyboard.press('Backspace');
  await expect(image).toHaveCount(0);
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  await expect(image).toHaveCount(1);
  await image.click(); await expect.poll(pixel).toEqual([255, 128, 0, 255]);
  await frame.locator('body').click({ position: { x: 650, y: 350 } });
  await expect(page.getByRole('complementary', { name: '画布配置面板' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.tinymce.activeEditor.selection.getNode().nodeName)).not.toBe('IMG');
});
