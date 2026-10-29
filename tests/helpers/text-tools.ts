import { expect, type Page } from '@playwright/test';

export async function openTextGroup(page: Page, group: 'style' | 'paragraph') {
  const panel = page.locator(`[data-toolbar-group="textgroup${group}"]`);
  if (!await panel.isVisible()) await page.locator(`.tox-pop:visible [data-mce-name="textgroup${group}"]`).click();
  await expect(panel).toBeVisible();
  return panel;
}

export async function textTool(page: Page, name: string) {
  if (['fontfamily', 'fontsizeinput', 'plus', 'minus', 'forecolor', 'forecolor-chevron', 'backcolor', 'backcolor-chevron'].includes(name)) return page.locator(`.tox-pop:visible [data-mce-name="${name}"]`);
  const group = /^h[1-6]$/.test(name) || ['ltr', 'rtl', 'blockquote'].includes(name) ? 'paragraph' : 'style';
  return (await openTextGroup(page, group)).locator(`[data-mce-name="${name}"]`);
}
