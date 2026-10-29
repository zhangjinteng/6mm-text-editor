import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const source = 'https://api.live.bilibili.com/xlive/web-room/v1/giftPanel/giftConfig?platform=pc&room_id=23975022';
// Pass a previously fetched response to reproduce a snapshot without another request.
const response = process.argv[2]
  ? JSON.parse(await readFile(process.argv[2], 'utf8'))
  : await (await fetch(source, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://live.bilibili.com/' }, signal: AbortSignal.timeout(30000) })).json();
if (response.code !== 0 || !Array.isArray(response.data?.list)) throw new Error(`礼物接口响应无效：${response.message || response.code}`);
const imageUrl = value => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && (url.hostname === 'hdslb.com' || url.hostname.endsWith('.hdslb.com')) ? url.href : '';
  } catch { return ''; }
};
const unique = new Map();
for (const item of response.data.list) {
  const image = imageUrl(item.img_basic);
  if (!Number.isSafeInteger(item.id) || item.id <= 0 || typeof item.name !== 'string' || !item.name.trim() || !image) continue;
  unique.set(item.id, {
    id: item.id, name: item.name.trim(), price: item.price, coinType: item.coin_type,
    description: typeof item.desc === 'string' ? item.desc : '', image,
    dynamicImage: imageUrl(item.img_dynamic), gif: imageUrl(item.gif), webp: imageUrl(item.webp)
  });
}
if (!unique.size) throw new Error('礼物列表为空，保留原有 JSON');
const catalog = { source, fetchedAt: new Date().toISOString(), roomId: 23975022,
  note: '礼物配置快照，活动及房间专属礼物可能随时间变化；图片使用哔哩哔哩 CDN 地址。',
  gifts: [...unique.values()] };
const directory = fileURLToPath(new URL('../src/data/', import.meta.url));
await mkdir(directory, { recursive: true });
const target = `${directory}bilibili-gifts.json`;
await writeFile(`${target}.tmp`, JSON.stringify(catalog, null, 2) + '\n');
await rename(`${target}.tmp`, target);
console.log(`已保存 ${catalog.gifts.length} 个礼物到 ${target}`);
