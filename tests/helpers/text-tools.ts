import { type Page } from '@playwright/test';

/** Native top-toolbar controls continue to cover selection-specific formatting. */
export async function textTool(page: Page, name: string) {
  return page.locator(`.tox-editor-header [data-mce-name="${name}"]`);
}
