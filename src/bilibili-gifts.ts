import catalog from './data/bilibili-gifts.json';

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]!));

/** 本地快照接入原生表情分类，不依赖用户登录或运行时请求礼物接口。 */
export const bilibiliGiftEmoticons = Object.fromEntries(catalog.gifts.map(gift => [
  `bilibili礼物：${gift.name}（${gift.id}）`,
  {
    category: 'bilibili礼物',
    keywords: [gift.name, String(gift.id), gift.description, 'bilibili', '哔哩哔哩', '礼物'],
    char: `<img src="${escapeHtml(gift.image)}" alt="${escapeHtml(gift.name)}" title="${escapeHtml(gift.name)}" data-bilibili-gift-id="${gift.id}" width="32" height="32" style="object-fit:contain;vertical-align:middle" loading="lazy" decoding="async" referrerpolicy="no-referrer" />`
  }
]));
