import { svgNode } from './text-stroke';

export type FillType = 'original' | 'empty' | 'solid' | 'gradient' | 'image';
export interface FillStop { id: string; color: string; position: number; opacity: number }
export interface FillLayer {
  id: string; type: FillType; visible: boolean; opacity: number; color: string;
  gradient: 'linear' | 'radial'; angle: number; centerX: number; centerY: number; radius: number; stops: FillStop[];
  image: string; scale: number; offsetX: number; offsetY: number; rotation: number; repeat: boolean; fit: 'cover' | 'contain';
}
export const fillNames: Record<FillType, string> = { original: '原始文字颜色', empty: '无填充', solid: '纯色', gradient: '渐变', image: '图片' };
export function newFill(type: FillType = 'solid', id: string = crypto.randomUUID()): FillLayer {
  return { id, type, visible: true, opacity: 100, color: '#147d64', gradient: 'linear', angle: 90, centerX: 50, centerY: 50, radius: 50,
    stops: [{ id: 'start', color: '#147d64', position: 0, opacity: 100 }, { id: 'end', color: '#3598db', position: 100, opacity: 100 }],
    image: '', scale: 100, offsetX: 0, offsetY: 0, rotation: 0, repeat: false, fit: 'cover' };
}
export const copyFills = (layers: FillLayer[]) => structuredClone(layers);
export function fillImageUrl(value: string): string | undefined {
  if (/^data:image\/(png|jpeg|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(value) && value.length <= 7 * 1024 * 1024) return value;
  try { const url = new URL(value); if (url.protocol === 'https:' && !url.username && !url.password && value.length <= 4096) return url.href; } catch { /* Invalid source. */ }
}
export function fillColor(value: unknown, doc: Document): value is string {
  if (typeof value !== 'string' || !/^(#[\da-f]{3,8}|[a-z]+|rgba?\([\d.,%\s]+\))$/i.test(value)) return false;
  const probe = doc.createElement('span'); probe.style.color = value; return !!probe.style.color;
}
const bounded = (n: unknown, min: number, max: number): n is number => typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max;
/** Hidden layers retain their draft settings, but malformed persisted data is never rendered. */
export function validateFills(layers: FillLayer[], doc: Document, requireImages = true): string {
  if (!Array.isArray(layers) || layers.length > 16) return '最多添加 16 层填充。';
  const ids = new Set<string>();
  for (const layer of layers) {
    if (!layer || typeof layer.id !== 'string' || !/^[\w-]{1,80}$/.test(layer.id) || ids.has(layer.id) || !Object.hasOwn(fillNames, layer.type)) return '填充图层数据无效。';
    ids.add(layer.id);
    if (typeof layer.visible !== 'boolean' || !bounded(layer.opacity, 0, 100) || !fillColor(layer.color, doc)) return '请输入有效的填充颜色和不透明度（0—100%）。';
    if (!['linear', 'radial'].includes(layer.gradient) || !bounded(layer.angle, 0, 360) || !bounded(layer.centerX, 0, 100) || !bounded(layer.centerY, 0, 100) || !bounded(layer.radius, 1, 200)) return '请输入有效的渐变角度、中心位置和范围。';
    if (!Array.isArray(layer.stops) || layer.stops.length < 2 || layer.stops.length > 16) return '渐变需要 2—16 个色标。';
    const stops = new Set<string>();
    for (const stop of layer.stops) {
      if (!stop || typeof stop.id !== 'string' || stops.has(stop.id) || !fillColor(stop.color, doc) || !bounded(stop.position, 0, 100) || !bounded(stop.opacity, 0, 100)) return '请输入有效的色标颜色、位置和不透明度。';
      stops.add(stop.id);
    }
    if (!bounded(layer.scale, 10, 400) || !bounded(layer.offsetX, -100, 100) || !bounded(layer.offsetY, -100, 100) || !bounded(layer.rotation, -180, 180) || typeof layer.repeat !== 'boolean' || !['cover', 'contain'].includes(layer.fit) || typeof layer.image !== 'string') return '请输入有效的图片缩放、偏移和旋转角度。';
    if (requireImages && layer.type === 'image' && layer.visible && !fillImageUrl(layer.image.trim())) return '请输入 HTTPS 图片地址或上传本地图片。';
  }
  return '';
}
export function readFills(box: HTMLElement): FillLayer[] {
  if (box.dataset.textFills) {
    try { const layers = JSON.parse(box.dataset.textFills) as FillLayer[]; if (!validateFills(layers, box.ownerDocument, false)) return layers; } catch { /* Fall back to legacy fields. */ }
  }
  const type = box.dataset.textFill;
  const layer = newFill(type === 'gradient' || type === 'image' ? type : 'original', 'base');
  if (type === 'gradient') {
    layer.stops[0]!.color = box.dataset.textGradientStart || '#147d64'; layer.stops[1]!.color = box.dataset.textGradientEnd || '#3598db';
    layer.angle = Number(box.dataset.textGradientAngle ?? 90);
  }
  if (type === 'image') layer.image = box.dataset.textImage || '';
  return validateFills([layer], box.ownerDocument, false) ? [newFill('original', 'base')] : [layer];
}
export function needsFillSvg(box: HTMLElement) {
  if (!box.hasAttribute('data-text-fills')) return false;
  const layers = readFills(box);
  return layers.length !== 1 || layers[0]!.type !== 'original' || !layers[0]!.visible || layers[0]!.opacity !== 100;
}
export function writeFills(box: HTMLElement, layers: FillLayer[]) {
  // Default original color needs no extra rendering or migration of untouched text.
  if (layers.length === 1 && layers[0]!.type === 'original' && layers[0]!.visible && layers[0]!.opacity === 100) box.removeAttribute('data-text-fills');
  else box.dataset.textFills = JSON.stringify(layers);
  const primary = layers.find(layer => layer.visible && layer.type !== 'empty');
  if (primary?.type === 'gradient' || primary?.type === 'image') box.dataset.textFill = primary.type; else box.removeAttribute('data-text-fill');
  if (primary?.type === 'gradient') {
    const sorted = [...primary.stops].sort((a, b) => a.position - b.position);
    box.dataset.textGradientStart = sorted[0]!.color; box.dataset.textGradientEnd = sorted.at(-1)!.color; box.dataset.textGradientAngle = String(primary.angle);
  }
  if (primary?.type === 'image') box.dataset.textImage = primary.image.trim(); else box.removeAttribute('data-text-image');
}
export function fillSwatch(layer: FillLayer): string {
  if (layer.type === 'solid') return `linear-gradient(${layer.color},${layer.color})`;
  if (layer.type === 'image') { const source = fillImageUrl(layer.image.trim()); return source ? `url(${JSON.stringify(source)})` : 'none'; }
  if (layer.type === 'gradient') {
    const stops = [...layer.stops].sort((a, b) => a.position - b.position).map(stop => `color-mix(in srgb, ${stop.color} ${stop.opacity}%, transparent) ${stop.position}%`).join(',');
    return layer.gradient === 'radial' ? `radial-gradient(circle at ${layer.centerX}% ${layer.centerY}%,${stops})` : `linear-gradient(${layer.angle}deg,${stops})`;
  }
  return layer.type === 'original' ? 'linear-gradient(135deg,#334b41,#9aad9f)' : 'none';
}
function paintServer(layer: FillLayer, defs: Element, id: string, width: number, height: number): string {
  const doc = defs.ownerDocument;
  if (layer.type === 'empty') return 'none';
  if (layer.type === 'solid') return layer.color;
  if (layer.type === 'gradient') {
    let gradient: Element;
    if (layer.gradient === 'radial') gradient = svgNode(doc, 'radialGradient', { id, gradientUnits: 'userSpaceOnUse', cx: String(width * layer.centerX / 100), cy: String(height * layer.centerY / 100), r: String(Math.max(width, height) * layer.radius / 100) }, defs);
    else {
      const radians = layer.angle * Math.PI / 180, dx = Math.sin(radians), dy = -Math.cos(radians), length = Math.abs(width * dx) + Math.abs(height * dy);
      gradient = svgNode(doc, 'linearGradient', { id, gradientUnits: 'userSpaceOnUse', x1: String(width / 2 - dx * length / 2), y1: String(height / 2 - dy * length / 2), x2: String(width / 2 + dx * length / 2), y2: String(height / 2 + dy * length / 2) }, defs);
    }
    for (const stop of [...layer.stops].sort((a, b) => a.position - b.position)) svgNode(doc, 'stop', { offset: String(stop.position / 100), 'stop-color': stop.color, 'stop-opacity': String(stop.opacity / 100) }, gradient);
    return `url(#${id})`;
  }
  const source = fillImageUrl(layer.image.trim()); if (!source) return 'none';
  const w = width * layer.scale / 100, h = height * layer.scale / 100, x = width * layer.offsetX / 100, y = height * layer.offsetY / 100;
  const pattern = svgNode(doc, 'pattern', { id, patternUnits: 'userSpaceOnUse', width: String(layer.repeat ? w : width), height: String(layer.repeat ? h : height), ...(layer.repeat ? { patternTransform: `translate(${x} ${y}) rotate(${layer.rotation} ${w / 2} ${h / 2})` } : {}) }, defs);
  svgNode(doc, 'image', { href: source, x: String(layer.repeat ? 0 : (width - w) / 2 + x), y: String(layer.repeat ? 0 : (height - h) / 2 + y), width: String(w), height: String(h), preserveAspectRatio: `xMidYMid ${layer.fit === 'cover' ? 'slice' : 'meet'}`, ...(!layer.repeat ? { transform: `rotate(${layer.rotation} ${width / 2 + x} ${height / 2 + y})` } : {}) }, pattern);
  return `url(#${id})`;
}
/** Topmost-first settings are painted bottom-to-top; the stroke is drawn only once. */
export function paintFillLayers(box: HTMLElement, svg: Element, defs: Element, glyphs: Element, uid: string, width: number, height: number) {
  if (!box.hasAttribute('data-text-fills')) return;
  const layers = readFills(box); glyphs.remove();
  for (let index = layers.length - 1; index >= 0; index--) {
    const layer = layers[index]!; if (!layer.visible || layer.type === 'empty') continue;
    const copy = glyphs.cloneNode(true) as Element;
    copy.setAttribute('data-text-fill-layer', layer.id); copy.setAttribute('opacity', String(layer.opacity / 100));
    if (layer.type !== 'original') {
      const paint = paintServer(layer, defs, `${uid}-fill-${index}`, width, height);
      for (const node of [copy, ...copy.querySelectorAll('text,tspan,path[data-text-glyph]')]) node.setAttribute('fill', paint);
    }
    svg.append(copy);
  }
}
