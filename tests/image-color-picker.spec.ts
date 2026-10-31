import { expect, test, type Page, type Locator } from '@playwright/test';

const frame = (p: Page) => p.frameLocator('.tox-edit-area iframe');
const photo = (p: Page) => frame(p).locator('#color-photo');
const sidebar = (p: Page) => p.getByRole('complementary', { name: '图片配置面板' });
const picker = (p: Page) => p.locator('.text-color-popover:visible');
async function choose(page: Page, scope: Locator, label: string, hex: string, opacity: string) {
  await scope.getByRole('button', { name: `选择${label}`, exact: true }).click();
  await picker(page).getByRole('textbox', { name: 'HEX 颜色', exact: true }).fill(hex);
  await picker(page).getByRole('textbox', { name: '颜色不透明度', exact: true }).fill(opacity);
}
test.beforeEach(async ({ page }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(async () => {
    const c = document.createElement('canvas'); c.width = 200; c.height = 140;
    const ctx = c.getContext('2d')!; ctx.fillStyle = '#147d64'; ctx.fillRect(20, 20, 160, 100);
    const e = window.tinymce.activeEditor;
    e.setContent(`<p><img id="color-photo" src="${c.toDataURL()}" style="position:absolute;left:120px;top:80px;width:300px;height:210px"></p><p style="color:#3598db">作品颜色</p>`);
    await e.uploadImages(); e.undoManager.clear(); e.undoManager.add();
  });
  await photo(page).click();
});

test('图片设置复用取色器，阴影透明度同步，预览可取消且应用可撤销', async ({ page }) => {
  const before = await page.evaluate(() => window.tinymce.activeEditor.getContent());
  await page.locator('.tox-pop:visible [data-mce-name="imagesettings"]').click();
  const dialog = page.getByRole('dialog', { name: '图片设置', exact: true });
  await dialog.getByRole('tab', { name: '阴影', exact: true }).click();
  await dialog.getByLabel('启用阴影', { exact: true }).check();
  await choose(page, dialog, '阴影颜色', '#ff0000', '40');
  await expect(picker(page).getByRole('button', { name: '使用颜色 #3598db', exact: true })).toBeVisible();
  await expect(dialog.getByRole('slider', { name: '阴影不透明度', exact: true })).toHaveValue('40');
  await expect(dialog.locator('.image-settings-preview img')).toHaveCSS('box-shadow', 'rgba(255, 0, 0, 0.4) 0px 8px 16px 0px');
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await page.screenshot({ path: 'screenshots/image-color-picker-dialog.png' });
  await page.keyboard.press('Escape'); await expect(picker(page)).toHaveCount(0); await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: '取消', exact: true }).click();
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
  await page.locator('.tox-pop:visible [data-mce-name="imagesettings"]').click();
  await dialog.getByRole('tab', { name: '阴影', exact: true }).click();
  await dialog.getByLabel('启用阴影', { exact: true }).check();
  await choose(page, dialog, '阴影颜色', '#112233', '60');
  await picker(page).getByRole('button', { name: '关闭颜色选择器' }).click();
  await dialog.getByRole('button', { name: '应用设置', exact: true }).click();
  await expect(photo(page)).toHaveCSS('box-shadow', 'rgba(17, 34, 51, 0.6) 0px 8px 16px 0px');
  await page.evaluate(() => window.tinymce.activeEditor.undoManager.undo());
  expect(await page.evaluate(() => window.tinymce.activeEditor.getContent())).toBe(before);
});

test('图片配置实时修改描边颜色和透明度，保存重开、窄屏及切换清理', async ({ page }) => {
  const panel = sidebar(page);
  await panel.getByRole('tab', { name: '描边', exact: true }).click();
  await panel.getByLabel('启用描边', { exact: true }).check();
  await choose(page, panel, '描边颜色', '#3598db', '35');
  await expect(photo(page)).toHaveAttribute('data-image-settings', /"strokeColor":"rgba\(53,152,219,0.35\)"/);
  await expect(photo(page)).toHaveAttribute('data-image-stroke-id');
  await page.screenshot({ path: 'screenshots/image-color-picker-sidebar.png' });
  await picker(page).getByRole('button', { name: '关闭颜色选择器' }).click();
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await photo(page).click(); await panel.getByRole('tab', { name: '描边', exact: true }).click();
  await panel.getByRole('button', { name: '选择描边颜色', exact: true }).click();
  await expect(picker(page).getByRole('textbox', { name: 'HEX 颜色', exact: true })).toHaveValue('#3598db');
  await expect(picker(page).getByRole('textbox', { name: '颜色不透明度', exact: true })).toHaveValue('35%');
  await page.setViewportSize({ width: 390, height: 844 });
  const bounds = (await picker(page).boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.x + bounds.width).toBeLessThanOrEqual(390);
  await page.screenshot({ path: 'screenshots/image-color-picker-mobile.png' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await frame(page).locator('body').click({ position: { x: 650, y: 360 } });
  await expect(picker(page)).toHaveCount(0);
});

test('透明主体的实线与虚线描边都保留颜色 alpha', async ({ page }) => {
  const results = await page.evaluate(async () => {
    // @ts-expect-error Browser-only module served by Vite.
    const { createImageStroke } = await import('/src/image-stroke.ts');
    const source = (window.tinymce.activeEditor.getBody().querySelector('#color-photo') as HTMLImageElement).src;
    const maxima = [];
    for (const strokeStyle of ['solid', 'dashed']) {
      const result = await createImageStroke(source, 200, 140, { stroke: true, strokeWidth: 8, strokeColor: 'rgba(53,152,219,0.35)', strokeStyle, strokePosition: 'inside', mask: 'none', radius: 0 });
      const image = new Image(); image.src = result.url; await image.decode();
      const c = document.createElement('canvas'); c.width = image.width; c.height = image.height;
      const ctx = c.getContext('2d')!; ctx.drawImage(image, 0, 0);
      const data = ctx.getImageData(0, 0, c.width, c.height).data;
      let max = 0; for (let i = 3; i < data.length; i += 4) max = Math.max(max, data[i]!);
      maxima.push(max);
    }
    return maxima;
  });
  for (const alpha of results) { expect(alpha).toBeGreaterThan(80); expect(alpha).toBeLessThanOrEqual(90); }
});
