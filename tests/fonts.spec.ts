import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
const catalog: { id: string; name: string }[] = JSON.parse(readFileSync(new URL('../src/fonts.generated.json', import.meta.url), 'utf8'));

test('热门字体完整替换默认列表，实际从本地加载并可保存', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => {
    const e = window.tinymce.activeEditor;
    e.setContent('<p><span id="font-sample" data-text-draggable="true" style="position:absolute;left:70px;top:60px;width:550px;font-size:42px">你好，创作从这里开始！ABC 0123</span></p>');
    e.undoManager.clear(); e.undoManager.add();
  });
  const frame = page.frameLocator('.tox-edit-area iframe');
  const sample = frame.locator('#font-sample');
  await sample.click();
  const select = page.getByRole('complementary', { name: '文字配置面板' }).getByRole('combobox', { name: '字体', exact: true });
  expect(await select.locator('option:not([disabled])').allTextContents()).toEqual(catalog.map(font => font.name));
  await expect(select).toHaveValue('GD-206607');
  await select.selectOption({ label: '抖音美好体' });
  await expect(sample).toHaveCSS('font-family', 'GD-193408044');
  const loaded = await page.evaluate(async fonts => {
    const doc = window.tinymce.activeEditor.getDoc();
    const failed: string[] = [];
    // Exercise the actual WOFF/TTF decoder, not merely computed font-family.
    for (const font of fonts) {
      try {
        const faces = await doc.fonts.load(`32px "GD-${font.id}"`, '你好ABC0123');
        if (!faces.length || faces.some(face => face.status !== 'loaded')) failed.push(font.name);
      } catch { failed.push(font.name); }
    }
    return failed;
  }, catalog);
  expect(loaded).toEqual([]);
  await page.locator('[data-mce-name="fontfamily"]').click();
  const menu = page.locator('.tox-menu:visible');
  await expect(menu.getByText('Aa剑豪体 Regular', { exact: true })).toBeVisible();
  await expect(menu.getByText('Arial', { exact: true })).toHaveCount(0);
  await page.screenshot({ path: 'screenshots/gaoding-popular-fonts.png' });
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '保存文档', exact: true }).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(sample).toHaveCSS('font-family', 'GD-193408044');
});

test('预览加载本地字体，导出的 HTML 离线保留字形', async ({ page, context }) => {
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => window.tinymce.activeEditor.setContent('<p id="offline" style="font-family:GD-193408044;font-size:42px">你好ABC0123</p>'));
  await page.getByRole('navigation', { name: '文档视图' }).getByRole('button', { name: '预览', exact: true }).click();
  const preview = page.frameLocator('iframe[title="文档预览"]');
  await expect(preview.locator('#offline')).toHaveCSS('font-family', 'GD-193408044');
  expect(await preview.locator('body').evaluate(async body => (await body.ownerDocument.fonts.load('42px GD-193408044', '你好ABC0123')).length)).toBeGreaterThan(0);
  await page.getByRole('button', { name: '导出', exact: true }).click();
  const request = page.waitForEvent('download');
  await page.getByRole('button', { name: 'HTML 文档', exact: true }).click();
  const file = (await (await request).path())!;
  const html = await readFile(file, 'utf8');
  expect(html).toContain('data-project-fonts="embedded"');
  expect(html).toMatch(/data:font\/woff;base64/);
  expect(html).not.toContain('fonts/gaoding/');
  expect(html).not.toContain('gd-font.dancf.com');
  const offline = await context.newPage();
  await context.setOffline(true);
  await offline.setContent(html);
  expect(await offline.evaluate(async () => {
    const fonts = await document.fonts.load('42px GD-193408044', '你好ABC0123');
    return fonts.length > 0 && fonts.every(font => font.status === 'loaded');
  })).toBe(true);
});
