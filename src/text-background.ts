import { svgNode } from './text-stroke';
import { parseShadowColor as parseColor } from './text-shadow';

export const backgroundShapes = { rect: '矩形', rounded: '圆角矩形', pill: '胶囊', ellipse: '椭圆', bubble: '气泡', slant: '斜切', cloud: '云朵', wave: '波浪', hexagon: '六边形', bevel: '切角', ticket: '票券', ribbon: '丝带' } as const;
export type BackgroundShape = keyof typeof backgroundShapes;
export interface TextBackground {
  visible: boolean; preset: string; shape: BackgroundShape; layout: 'box' | 'lines' | 'connected';
  color: string; opacity: number; expandX: number; expandY: number; radius: number;
  scaleX: number; scaleY: number; offsetX: number; offsetY: number;
}
export interface BackgroundRect { x: number; y: number; width: number; height: number }
export const newBackground = (): TextBackground => ({ visible: true, preset: 'rounded', shape: 'rounded', layout: 'box', color: '#ded2ff', opacity: 100, expandX: 10, expandY: 6, radius: 8, scaleX: 100, scaleY: 100, offsetX: 0, offsetY: 0 });
export const backgroundPresets: Record<string, { label: string; settings: Partial<TextBackground> }> = {
  connected: { label: '连体背景', settings: { shape: 'rounded', layout: 'connected', color: '#fff05a', radius: 10 } },
  pill: { label: '胶囊背景', settings: { shape: 'pill', color: '#fff05a' } },
  ellipse: { label: '椭圆背景', settings: { shape: 'ellipse', color: '#ffd5bf', expandX: 16, expandY: 12 } },
  rounded: { label: '圆角背景', settings: { shape: 'rounded', color: '#ded2ff' } },
  bubble: { label: '气泡背景', settings: { shape: 'bubble', color: '#f9d2e8' } },
  slant: { label: '斜切背景', settings: { shape: 'slant', color: '#d3efb7', expandX: 16 } },
  rect: { label: '矩形背景', settings: { shape: 'rect', color: '#d3efb7', radius: 0 } },
  cloud: { label: '云朵背景', settings: { shape: 'cloud', color: '#83b7fa', expandX: 16, expandY: 12 } },
  wave: { label: '波浪背景', settings: { shape: 'wave', color: '#ffe76b', expandY: 10 } },
  hexagon: { label: '六边形背景', settings: { shape: 'hexagon', color: '#ffe76b', expandX: 18 } },
  bevel: { label: '切角背景', settings: { shape: 'bevel', color: '#d3efb7', radius: 10 } },
  ticket: { label: '票券背景', settings: { shape: 'ticket', color: '#b9e4ef', expandX: 16 } },
  ribbon: { label: '丝带背景', settings: { shape: 'ribbon', color: '#a6cbed', expandX: 18 } },
  lines: { label: '逐行背景', settings: { shape: 'rounded', layout: 'lines', color: '#ded2ff', radius: 6 } }
};
export function presetBackground(id: string): TextBackground { return { ...newBackground(), ...backgroundPresets[id]!.settings, preset: id }; }
export function validateBackground(value: TextBackground | null): string {
  if (value === null) return '';
  if (!value || typeof value !== 'object' || typeof value.visible !== 'boolean' || !Object.hasOwn(backgroundShapes, value.shape) || !['box', 'lines', 'connected'].includes(value.layout) || (value.preset !== 'custom' && !Object.hasOwn(backgroundPresets, value.preset))) return '请选择有效的背景样式和布局。';
  if (!/^#[\da-f]{6}$/i.test(value.color)) return '请输入有效的背景颜色。';
  for (const [key, min, max] of [['opacity', 0, 100], ['expandX', 0, 100], ['expandY', 0, 100], ['radius', 0, 100], ['scaleX', 10, 300], ['scaleY', 10, 300], ['offsetX', -200, 200], ['offsetY', -200, 200]] as const) {
    const number = value[key]; if (typeof number !== 'number' || !Number.isFinite(number) || number < min || number > max) return '背景不透明度、扩张和圆角为 0—100，宽高为 10—300%，偏移为 −200—200 px。';
  }
  return '';
}
export function readBackground(box: HTMLElement): TextBackground | null {
  if (box.dataset.textBackgroundSettings) {
    try { const value = JSON.parse(box.dataset.textBackgroundSettings) as TextBackground; if (value && !validateBackground(value)) return value; } catch { /* Legacy CSS remains usable. */ }
  }
  if (!box.style.backgroundColor) return null;
  const color = parseColor(box.style.backgroundColor, box.ownerDocument); if (!color) return null;
  const radius = Math.max(0, Math.min(100, parseFloat(box.style.borderRadius) || 0));
  return { ...newBackground(), preset: 'custom', shape: radius ? 'rounded' : 'rect', color: color.color, opacity: color.opacity ?? 100, expandX: 0, expandY: 0, radius };
}
export function writeBackground(box: HTMLElement, value: TextBackground | null) {
  if (value) { box.dataset.textBackgroundSettings = JSON.stringify(value); box.dataset.textBackground = 'true'; }
  else { box.removeAttribute('data-text-background-settings'); box.removeAttribute('data-text-background'); }
  // Existing padding is text layout. Background adjustments must never remove or change it.
  box.style.backgroundColor = ''; box.style.borderRadius = ''; box.removeAttribute('data-mce-style');
}
const f = (number: number) => Number(number.toFixed(3));
type Point = [number, number];
function polygon(points: Point[], radius = 0) {
  const rounded = points.map((point, index) => {
    const prev = points[(index + points.length - 1) % points.length]!, next = points[(index + 1) % points.length]!;
    const a = Math.hypot(prev[0] - point[0], prev[1] - point[1]), b = Math.hypot(next[0] - point[0], next[1] - point[1]);
    const r = Math.min(radius, a / 2, b / 2);
    return { point, before: [point[0] + (prev[0] - point[0]) * r / (a || 1), point[1] + (prev[1] - point[1]) * r / (a || 1)], after: [point[0] + (next[0] - point[0]) * r / (b || 1), point[1] + (next[1] - point[1]) * r / (b || 1)] };
  });
  return rounded.map((vertex, index) => `${index ? 'L' : 'M'} ${vertex.before.map(f).join(' ')} Q ${vertex.point.map(f).join(' ')} ${vertex.after.map(f).join(' ')}`).join(' ') + ' Z';
}
export function backgroundPath(shape: BackgroundShape, rect: BackgroundRect, radius: number): string {
  const { x, y, width: w, height: h } = rect;
  const p = (a: number, b: number) => `${f(x + w * a)} ${f(y + h * b)}`;
  const points = (values: Point[], r = 0) => polygon(values.map(([a, b]) => [x + w * a, y + h * b]), r);
  if (shape === 'ellipse') return `M ${p(0, .5)} A ${f(w / 2)} ${f(h / 2)} 0 1 0 ${p(1, .5)} A ${f(w / 2)} ${f(h / 2)} 0 1 0 ${p(0, .5)} Z`;
  if (shape === 'slant') return points([[.06, .06], [1, 0], [.94, .94], [0, 1]], Math.min(h * .1, 6));
  if (shape === 'hexagon') return points([[.08, 0], [.92, 0], [1, .5], [.92, 1], [.08, 1], [0, .5]]);
  if (shape === 'bevel') { const cut = Math.min(radius, w / 4, h / 2); return polygon([[x + cut, y], [x + w - cut, y], [x + w, y + cut], [x + w, y + h - cut], [x + w - cut, y + h], [x + cut, y + h], [x, y + h - cut], [x, y + cut]]); }
  if (shape === 'ribbon') return points([[0, 0], [1, 0], [.94, .5], [1, 1], [0, 1], [.06, .5]]);
  if (shape === 'ticket') return `M ${p(.03, 0)} L ${p(.97, 0)} Q ${p(1, 0)} ${p(1, .12)} L ${p(1, .35)} C ${p(.92, .35)} ${p(.92, .65)} ${p(1, .65)} L ${p(1, .88)} Q ${p(1, 1)} ${p(.97, 1)} L ${p(.03, 1)} Q ${p(0, 1)} ${p(0, .88)} L ${p(0, .65)} C ${p(.08, .65)} ${p(.08, .35)} ${p(0, .35)} L ${p(0, .12)} Q ${p(0, 0)} ${p(.03, 0)} Z`;
  if (shape === 'wave') return `M ${p(0, .06)} C ${p(.2, .2)} ${p(.3, 0)} ${p(.5, .06)} S ${p(.8, .2)} ${p(1, .06)} L ${p(1, .94)} C ${p(.8, .8)} ${p(.7, 1)} ${p(.5, .94)} S ${p(.2, .8)} ${p(0, .94)} Z`;
  if (shape === 'cloud') return `M ${p(.03, .34)} C ${p(-.01, .12)} ${p(.12, .03)} ${p(.22, .12)} C ${p(.28, -.02)} ${p(.43, -.02)} ${p(.48, .1)} C ${p(.59, -.02)} ${p(.73, .01)} ${p(.77, .12)} C ${p(.95, .01)} ${p(1, .18)} ${p(.97, .4)} C ${p(1.03, .65)} ${p(.96, .92)} ${p(.8, .9)} C ${p(.73, 1.03)} ${p(.59, 1.02)} ${p(.5, .9)} C ${p(.37, 1.03)} ${p(.22, 1.01)} ${p(.17, .88)} C ${p(0, .98)} ${p(-.02, .68)} ${p(.03, .34)} Z`;
  if (shape === 'bubble') return `M ${p(.1, .08)} C ${p(.32, -.02)} ${p(.76, -.02)} ${p(.91, .12)} C ${p(1.03, .24)} ${p(1.02, .72)} ${p(.91, .87)} C ${p(.72, 1.03)} ${p(.25, 1)} ${p(.1, .88)} C ${p(-.03, .76)} ${p(-.03, .24)} ${p(.1, .08)} Z`;
  return polygon([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], shape === 'pill' ? Math.min(w, h) / 2 : radius);
}
function connectedPath(rects: BackgroundRect[], radius: number) {
  if (rects.length === 1) return backgroundPath('rounded', rects[0]!, radius);
  const points: Point[] = [], first = rects[0]!, last = rects.at(-1)!;
  points.push([first.x, first.y], [first.x + first.width, first.y]);
  for (let i = 0; i < rects.length - 1; i++) {
    const a = rects[i]!, b = rects[i + 1]!, boundary = (a.y + a.height + b.y) / 2;
    points.push([a.x + a.width, boundary], [b.x + b.width, boundary]);
  }
  points.push([last.x + last.width, last.y + last.height], [last.x, last.y + last.height]);
  for (let i = rects.length - 1; i > 0; i--) {
    const a = rects[i]!, b = rects[i - 1]!, boundary = (b.y + b.height + a.y) / 2;
    points.push([a.x, boundary], [b.x, boundary]);
  }
  return polygon(points, radius);
}
/** Multiple rich-text fragments on one visual line share a single background. */
function textLines(box: HTMLElement): BackgroundRect[] {
  const source = box.querySelector<HTMLElement>(':scope > [data-text-source]'); if (!source) return [];
  const origin = box.getBoundingClientRect(), scaleX = origin.width / (box.offsetWidth || 1), scaleY = origin.height / (box.offsetHeight || 1);
  const walker = box.ownerDocument.createTreeWalker(source, NodeFilter.SHOW_TEXT), rects: BackgroundRect[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent?.trim() || node.parentElement?.closest('[data-mce-bogus]')) continue;
    const range = box.ownerDocument.createRange(); range.selectNodeContents(node);
    for (const rect of range.getClientRects()) if (rect.width > .1 && rect.height > .1) rects.push({ x: (rect.left - origin.left) / scaleX, y: (rect.top - origin.top) / scaleY, width: rect.width / scaleX, height: rect.height / scaleY });
  }
  rects.sort((a, b) => a.y - b.y || a.x - b.x); const lines: BackgroundRect[] = [];
  for (const rect of rects) {
    const line = lines.find(line => Math.min(line.y + line.height, rect.y + rect.height) - Math.max(line.y, rect.y) > Math.min(line.height, rect.height) * .6);
    if (!line) lines.push({ ...rect });
    else { const right = Math.max(line.x + line.width, rect.x + rect.width), bottom = Math.max(line.y + line.height, rect.y + rect.height); line.x = Math.min(line.x, rect.x); line.y = Math.min(line.y, rect.y); line.width = right - line.x; line.height = bottom - line.y; }
  }
  return lines;
}
export function drawBackground(parent: Element, value: TextBackground, rects: BackgroundRect[]) {
  const group = svgNode(parent.ownerDocument, 'g', { opacity: String(value.opacity / 100) }, parent);
  if (value.layout === 'connected') svgNode(parent.ownerDocument, 'path', { d: connectedPath(rects, value.radius), fill: value.color }, group);
  else for (const rect of rects) svgNode(parent.ownerDocument, 'path', { d: backgroundPath(value.shape, rect, value.radius), fill: value.color }, group);
}
const signatures = new WeakMap<HTMLElement, string>();
export function renderTextBackground(box: HTMLElement) {
  const existing = box.querySelector<HTMLElement>(':scope > [data-text-background-render]');
  if (!box.hasAttribute('data-text-background-settings')) { existing?.remove(); signatures.delete(box); return; }
  const value = readBackground(box);
  if (!value?.visible) { existing?.remove(); signatures.delete(box); return; }
  if (!box.offsetWidth || !box.offsetHeight) return;
  const curved = !!box.dataset.textCurve;
  const measured = value.layout !== 'box' && !curved ? textLines(box) : [];
  const base = measured.length ? measured : [{ x: 0, y: 0, width: box.offsetWidth, height: box.offsetHeight }];
  const rects = base.map(rect => ({ x: f(rect.x + rect.width * (1 - value.scaleX / 100) / 2 - value.expandX + value.offsetX), y: f(rect.y + rect.height * (1 - value.scaleY / 100) / 2 - value.expandY + value.offsetY), width: f(rect.width * value.scaleX / 100 + value.expandX * 2), height: f(rect.height * value.scaleY / 100 + value.expandY * 2) }));
  const signature = JSON.stringify([value, rects]); if (existing && signatures.get(box) === signature) return;
  const left = Math.min(...rects.map(rect => rect.x)), top = Math.min(...rects.map(rect => rect.y)), right = Math.max(...rects.map(rect => rect.x + rect.width)), bottom = Math.max(...rects.map(rect => rect.y + rect.height));
  const width = Math.max(1, f(right - left)), height = Math.max(1, f(bottom - top));
  const doc = box.ownerDocument, layer = doc.createElement('span'); layer.dataset.textBackgroundRender = 'true'; layer.dataset.backgroundLayout = value.layout; layer.contentEditable = 'false'; layer.setAttribute('aria-hidden', 'true');
  Object.assign(layer.style, { left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` });
  const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); svg.setAttribute('viewBox', `${left} ${top} ${width} ${height}`); svg.setAttribute('width', String(width)); svg.setAttribute('height', String(height)); svg.setAttribute('aria-hidden', 'true');
  drawBackground(svg, value, rects); layer.append(svg); if (existing) existing.replaceWith(layer); else box.prepend(layer); signatures.set(box, signature);
}
export const textBackgroundStyles = `
[data-text-background-settings]{position:relative;isolation:isolate}
[data-text-background-render]{position:absolute;z-index:-1;display:block;pointer-events:none;user-select:none;line-height:0;text-shadow:none}
[data-text-background-render] svg{display:block;width:100%;height:100%;max-width:none;overflow:visible}
`;
