import { expect, test } from '@playwright/test';
import type { Editor } from 'tinymce';
import catalog from '../src/data/bilibili-gifts.json' with { type: 'json' };
declare global { interface Window { tinymce: { activeEditor: Editor } } }

test('本地礼物快照完整且 ID 唯一，图片地址有效', () => {
  expect(catalog.gifts.length).toBeGreaterThan(900);
  expect(new Set(catalog.gifts.map(g => g.id)).size).toBe(catalog.gifts.length);
  for (const gift of catalog.gifts) {
    expect(gift.name.length).toBeGreaterThan(0);
    expect(new URL(gift.image).hostname).toMatch(/\.hdslb\.com$/);
    expect(new URL(gift.image).protocol).toBe('https:');
  }
});

test('原生表情窗口可切换 bilibili礼物、搜索插入并保存预览', async ({ page }) => {
  const apiCalls: string[] = [];
  page.on('request', request => { if (request.url().includes('api.live.bilibili.com')) apiCalls.push(request.url()); });
  // 图标加载独立于外部网络，检查原始 URL 后提供固定的测试图片。
  await page.route(/https:\/\/[^/]+\.hdslb\.com\//, route => route.fulfill({
    contentType:'image/svg+xml', body:'<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="pink"/></svg>'
  }));
  await page.goto('/'); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await page.evaluate(() => { const e=window.tinymce.activeEditor; e.setContent('<p>礼物：</p>'); e.focus(); e.selection.select(e.getBody().querySelector('p')!,true); e.selection.collapse(false); });
  const emojiArea = (await page.locator('.tox-edit-area iframe').boundingBox())!;
  await page.mouse.click(emojiArea.x + emojiArea.width - 20, emojiArea.y + 30);
  await page.locator('[data-mce-name="emoticons"]').click();
  const dialog=page.getByRole('dialog');
  await dialog.getByRole('tab',{name:'bilibili礼物',exact:true}).click();
  const gift=catalog.gifts[0];
  await dialog.getByRole('textbox',{name:'搜索',exact:true}).fill(String(gift.id));
  await expect(dialog.locator('img')).toHaveCount(1);
  const item=dialog.getByLabel(`bilibili礼物：${gift.name}（${gift.id}）`,{exact:true});
  await expect(item).toBeVisible();
  await item.click();
  await expect(dialog).toHaveCount(0);
  const image=page.frameLocator('.tox-edit-area iframe').locator(`img[data-bilibili-gift-id="${gift.id}"]`);
  await expect(image).toHaveAttribute('src',gift.image);
  await expect(image).toHaveAttribute('alt',gift.name);
  await expect.poll(() => image.evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
  await page.getByRole('button',{name:'保存文档',exact:true}).click();
  await page.reload(); await page.waitForFunction(() => window.tinymce?.activeEditor?.initialized);
  await expect(image).toHaveAttribute('src',gift.image);
  await page.getByRole('navigation',{name:'文档视图'}).getByRole('button',{name:'预览',exact:true}).click();
  await expect(page.frameLocator('iframe[title="文档预览"]').locator(`img[data-bilibili-gift-id="${gift.id}"]`)).toHaveAttribute('src',gift.image);
  expect(apiCalls).toEqual([]);
});
