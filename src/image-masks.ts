/** Shared mask assets for CSS previews, saved images and raster contour effects. */
export const maskCategories = { basic: '基础', shape: '图形', letter: '字母', number: '数字', brush: '笔刷' } as const;
export type MaskCategory = keyof typeof maskCategories;
export type ImageMask = { label: string; category: MaskCategory; clip: string; image: string; asset?: string };
const svg = (body: string) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" preserveAspectRatio="none"><g fill="white">${body}</g></svg>`)}`;
const vector = (label: string, category: MaskCategory, body: string): ImageMask => {
  const asset = svg(body); return { label, category, clip: 'none', image: `url("${asset}")`, asset };
};
const path = (label: string, category: MaskCategory, d: string) => vector(label, category, `<path d="${d}"/>`);
const basic = (label: string, clip: string, image = 'none'): ImageMask => ({ label, category: 'basic', clip, image });
export const imageMasks: Record<string, ImageMask> = {
  none: basic('无蒙版', 'none'),
  rounded: vector('圆角矩形', 'basic', '<rect width="100" height="100" rx="20"/>'),
  octagon: vector('切角矩形', 'basic', '<polygon points="20,0 80,0 100,20 100,80 80,100 20,100 0,80 0,20"/>'),
  circle: basic('圆形', 'circle(closest-side at 50% 50%)'),
  ellipse: basic('椭圆', 'ellipse(50% 50% at 50% 50%)'),
  diamond: basic('菱形', 'polygon(50% 0%,100% 50%,50% 100%,0% 50%)'),
  triangle: basic('三角形', 'polygon(50% 0%,100% 100%,0% 100%)'),
  hexagon: basic('六边形', 'polygon(25% 0%,75% 0%,100% 50%,75% 100%,25% 100%,0% 50%)'),
  star: basic('星形', 'polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 94%,50% 72%,21% 94%,32% 57%,2% 35%,39% 35%)'),
  wave: path('波浪', 'basic', 'M0 20C30-10 60 50 100 20V80C60 110 30 50 0 80Z'),
  flower: path('花形', 'basic', 'M50 5C62-5 78 5 77 21C98 18 108 43 89 53C108 74 86 99 68 87C59 108 33 100 33 84C10 99-5 75 11 58C-7 42 5 18 26 22C23 3 42-6 50 5Z'),
  blob: path('不规则形', 'basic', 'M28 3C55-10 63 23 80 31C110 47 101 88 83 94C64 102 53 87 39 94C5 108-8 50 7 23C12 13 17 7 28 3Z'),
  fade: basic('向下渐隐', 'none', 'linear-gradient(to bottom,#000 20%,transparent 100%)'),
  soft: basic('柔边蒙版', 'none', 'radial-gradient(ellipse closest-side,#000 60%,transparent 100%)'),
  heart: path('爱心', 'shape', 'M50 94C42 86 3 59 3 30C3 3 35-6 50 19C65-6 97 3 97 30C97 59 58 86 50 94Z'),
  arch: path('拱门', 'shape', 'M5 100V45A45 45 0 0 1 95 45V100Z'),
  shield: path('盾牌', 'shape', 'M5 5H95V52C95 78 72 90 50 100C28 90 5 78 5 52Z'),
  pentagon: vector('五边形', 'shape', '<polygon points="50,0 98,36 80,94 20,94 2,36"/>'),
  cloud: path('云朵', 'shape', 'M20 85C-7 85-7 47 15 44C7 16 42 1 56 23C77 3 104 26 90 46C114 63 98 85 83 85Z'),
  bubble: path('对话框', 'shape', 'M15 5H85Q100 5 100 20V65Q100 80 85 80H45L18 100V80H15Q0 80 0 65V20Q0 5 15 5Z'),
  cross: vector('十字', 'shape', '<path d="M32 0H68V32H100V68H68V100H32V68H0V32H32Z"/>'),
  ticket: path('票券', 'shape', 'M0 10H100V35A15 15 0 0 0 100 65V90H0V65A15 15 0 0 0 0 35Z'),
  brushSweep: path('横向笔刷', 'brush', 'M8 21L94 12L85 20L100 25L93 34L98 43L88 48L98 59L84 64L94 77L7 90L14 80L0 73L8 63L1 53L11 45L2 35L14 31Z'),
  brushDiagonal: path('斜向笔刷', 'brush', 'M0 67L72 0L76 10L89 5L86 19L100 16L94 32L100 37L28 100L24 89L10 94L15 80L2 82L7 71Z'),
  brushDry: vector('干刷纹理', 'brush', '<path d="M5 20L94 11L99 25L2 39ZM1 44L95 29L100 43L4 59ZM6 63L96 48L99 66L2 77ZM9 81L93 70L95 84L5 95Z"/>'),
  brushInk: path('墨迹', 'brush', 'M21 4L36 10L53 1L63 11L84 4L84 20L100 29L90 43L98 60L84 69L88 90L67 85L55 100L40 89L19 96L20 78L1 68L10 51L0 33L18 25Z'),
  brushOval: path('笔刷圆斑', 'brush', 'M13 19L27 8L38 12L52 1L65 8L79 8L86 23L97 35L91 48L100 59L88 73L80 89L65 87L53 100L39 91L23 94L19 80L4 69L9 54L0 40L14 31Z')
};
for (const letter of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') imageMasks[`letter-${letter}`] = vector(`字母 ${letter}`, 'letter', `<text x="50" y="85" text-anchor="middle" font-family="Arial,sans-serif" font-size="94" font-weight="900">${letter}</text>`);
for (const digit of '0123456789') imageMasks[`number-${digit}`] = vector(`数字 ${digit}`, 'number', `<text x="50" y="85" text-anchor="middle" font-family="Arial,sans-serif" font-size="94" font-weight="900">${digit}</text>`);
export function validCustomMask(source: unknown): source is string {
  return typeof source === 'string' && source.length < 6 * 1024 * 1024 && /^data:image\/png;base64,[a-z\d+/=]+$/i.test(source);
}
export function maskAsset(mask: string, source = ''): string | undefined {
  return mask === 'custom' ? (validCustomMask(source) ? source : undefined) : imageMasks[mask]?.asset;
}
export function maskStyle(mask: string, source = '') {
  if ((mask === 'custom' || imageMasks[mask]?.asset) && validCustomMask(source)) return { clip: 'none', image: `url("${source}")` };
  return imageMasks[mask] ?? imageMasks.none!;
}
/** Normalize local mask files to self-contained PNGs: no uploaded SVG markup is stored. */
export async function importImageMask(file: File, mode: 'auto' | 'alpha' | 'luminance' = 'auto'): Promise<string> {
  if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('请选择不超过 5 MB 的 PNG、JPG、WebP、GIF 或 SVG 蒙版。');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => { image.onload = image.onerror = null; reject(new Error('蒙版读取超时，请换一个文件重试。')); }, 10000);
      image.onload = () => { clearTimeout(timer); resolve(); };
      image.onerror = () => { clearTimeout(timer); reject(new Error('无法读取蒙版图片，请检查文件。')); }; image.src = url;
    });
    const ratio = Math.min(1, 1024 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio)); canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!; ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height), data = pixels.data;
    let transparent = false; for (let i = 3; i < data.length; i += 4) if (data[i]! < 254) { transparent = true; break; }
    const luminance = mode === 'luminance' || (mode === 'auto' && !transparent);
    let visible = false;
    for (let i = 0; i < data.length; i += 4) {
      if (luminance) data[i + 3] = Math.round(data[i + 3]! * (.2126 * data[i]! + .7152 * data[i + 1]! + .0722 * data[i + 2]!) / 255);
      if (data[i + 3]! > 0) visible = true;
      data[i] = data[i + 1] = data[i + 2] = 255;
    }
    if (!visible) throw new Error('蒙版没有可见区域，请换一张图片或改用透明通道。');
    ctx.putImageData(pixels, 0, 0); const source = canvas.toDataURL('image/png');
    if (!validCustomMask(source)) throw new Error('蒙版数据过大，请缩小图片后重试。');
    return source;
  } finally { URL.revokeObjectURL(url); }
}

const rasterCache = new Map<string, Promise<string>>();
/** Persist generated presets as PNG because the editor deliberately filters SVG data URLs. */
export function rasterizePresetMask(mask: string): Promise<string> {
  const asset = imageMasks[mask]?.asset; if (!asset) return Promise.resolve('');
  let pending = rasterCache.get(mask);
  if (!pending) {
    pending = (async () => {
      const image = new Image(); image.src = asset; await image.decode();
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 1024;
      canvas.getContext('2d')!.drawImage(image, 0, 0, 1024, 1024);
      return canvas.toDataURL('image/png');
    })();
    rasterCache.set(mask, pending); pending.catch(() => rasterCache.delete(mask));
  }
  return pending;
}
