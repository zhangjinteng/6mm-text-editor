import { svgNode } from './text-stroke';

export const deformPresets = [
  ['none', '无变形', 'none'], ['up', '上拱', 'path'], ['down', '下弯', 'path'], ['circle', '圆形', 'path'],
  ['triangle', '三角形', 'path'], ['rectangle', '矩形', 'path'], ['pentagon', '五边形', 'path'], ['heart', '心形', 'path'], ['custom', '自定义曲线', 'path'],
  ['arch', '拱带', 'warp'], ['sector', '扇形', 'warp'], ['concave', '内凹', 'warp'], ['dome', '上凸', 'warp'],
  ['bowl', '下凸', 'warp'], ['bulge', '鼓起', 'warp'], ['slant', '倾斜', 'warp'], ['flag', '波浪', 'warp']
] as const;
export type DeformPreset = typeof deformPresets[number][0];
export interface TextDeform {
  version: 1; preset: DeformPreset; amount: number; aspect: number; radius: number; start: number; sweep: number;
  reverse: boolean; lines: 'join' | 'preserve'; fit: 'natural' | 'spacing' | 'stretch'; c1x: number; c1y: number; c2x: number; c2y: number;
}
export const defaultDeform: TextDeform = { version: 1, preset: 'none', amount: 40, aspect: 100, radius: 0, start: 0, sweep: 180, reverse: false, lines: 'preserve', fit: 'natural', c1x: 25, c1y: 0, c2x: 75, c2y: 100 };
export const deformLimits = { amount: [-100, 100], aspect: [25, 200], radius: [0, 1000], start: [-360, 360], sweep: [10, 360], c1x: [0, 100], c1y: [0, 100], c2x: [0, 100], c2y: [0, 100] } as const;
export function validateDeform(value: TextDeform): string {
  if (!value || value.version !== 1 || !deformPresets.some(([key]) => key === value.preset) || typeof value.reverse !== 'boolean' || !['join', 'preserve'].includes(value.lines) || !['natural', 'spacing', 'stretch'].includes(value.fit)) return '请选择有效的变形预设和排版方式。';
  for (const [key, [min, max]] of Object.entries(deformLimits)) {
    const n = value[key as keyof typeof deformLimits]; if (typeof n !== 'number' || !Number.isFinite(n) || n < min || n > max) return '请输入变形参数标注范围内的有效数值。';
  }
  return '';
}
export function readDeform(box: HTMLElement): TextDeform {
  try { const d = JSON.parse(box.dataset.textDeform ?? 'null'); if (!validateDeform(d)) return d; } catch { /* Legacy curve. */ }
  if (!box.dataset.textCurve) return structuredClone(defaultDeform);
  return { ...defaultDeform, preset: box.dataset.textCurve === 'down' ? 'down' : box.dataset.textCurve ? 'up' : 'none', amount: Math.max(0, Math.min(100, Number(box.dataset.textCurveStrength) || 40)), lines: 'join' };
}
export function writeDeform(box: HTMLElement, value: TextDeform) {
  box.dataset.textDeform = JSON.stringify(value);
  if (value.preset === 'none') box.removeAttribute('data-text-curve'); else box.dataset.textCurve = value.preset;
  box.dataset.textCurveStrength = String(Math.abs(value.amount));
}
export const isWarp = (preset: DeformPreset) => deformPresets.find(([key]) => key === preset)?.[2] === 'warp';

type Point = { x: number; y: number };
function poly(points: Point[], t: number): Point {
  const lengths = points.slice(1).map((p, i) => Math.hypot(p.x - points[i]!.x, p.y - points[i]!.y));
  let distance = Math.max(0, Math.min(1, t)) * lengths.reduce((sum, n) => sum + n, 0);
  for (let i = 0; i < lengths.length; i++) {
    const length = lengths[i]!; if (distance <= length || i === lengths.length - 1) { const k = length ? distance / length : 0; return { x: points[i]!.x + (points[i + 1]!.x - points[i]!.x) * k, y: points[i]!.y + (points[i + 1]!.y - points[i]!.y) * k }; }
    distance -= length;
  }
  return points[0]!;
}
/** Sampled paths make reverse, starting angle and closed-shape layout share one geometry. */
export function deformPath(d: TextDeform, width: number, size: number, line = 0): { path: string; width: number; height: number; length: number; closed: boolean } {
  const pad = size * 1.4 + 12, rx = Math.max(16, (d.radius || Math.max(24, width / 2 - pad)) + line * size * 1.5), ry = rx * d.aspect / 100;
  const w = Math.max(width, 2 * (rx + pad)), h = 2 * (ry + pad);
  const cx = w / 2, cy = h / 2;
  const closed = ['circle', 'triangle', 'rectangle', 'pentagon', 'heart'].includes(d.preset);
  let polygon: Point[] = [];
  if (['triangle', 'pentagon'].includes(d.preset)) {
    const sides = d.preset === 'triangle' ? 3 : 5;
    polygon = Array.from({ length: sides }, (_, i) => ({ x: cx + rx * Math.cos(-Math.PI / 2 + i * 2 * Math.PI / sides), y: cy + ry * Math.sin(-Math.PI / 2 + i * 2 * Math.PI / sides) })); polygon.push(polygon[0]!);
  } else if (d.preset === 'rectangle') polygon = [{ x: cx - rx, y: cy - ry }, { x: cx + rx, y: cy - ry }, { x: cx + rx, y: cy + ry }, { x: cx - rx, y: cy + ry }, { x: cx - rx, y: cy - ry }];
  const points: Point[] = [];
  for (let i = 0; i <= 240; i++) {
    let t = i / 240; if (d.reverse) t = 1 - t;
    let p: Point;
    if (closed) {
      t = ((t + d.start / 360) % 1 + 1) % 1;
      if (polygon.length) p = poly(polygon, t);
      else if (d.preset === 'heart') { const a = 2 * Math.PI * t; p = { x: cx + rx * Math.sin(a) ** 3, y: cy - ry * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 17 }; }
      else { const a = -Math.PI / 2 + t * Math.PI * 2; p = { x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) }; }
    } else if (d.preset === 'custom') {
      const a = 1 - t; p = { x: pad + (w - pad * 2) * (3 * a * a * t * d.c1x / 100 + 3 * a * t * t * d.c2x / 100 + t ** 3), y: pad + (h - pad * 2) * (a ** 3 * .5 + 3 * a * a * t * d.c1y / 100 + 3 * a * t * t * d.c2y / 100 + t ** 3 * .5) };
    } else {
      const sign = (d.preset === 'down' ? -1 : 1) * (d.amount < 0 ? -1 : 1), half = d.sweep * Math.PI / 360;
      const a = (t * 2 - 1) * half + d.start * Math.PI / 180;
      p = { x: cx + rx * Math.sin(a), y: cy - sign * ry * (Math.cos(a) - Math.cos(half)) * Math.abs(d.amount) / 100 };
    }
    points.push(p);
  }
  let length = 0; for (let i = 1; i < points.length; i++) length += Math.hypot(points[i]!.x - points[i - 1]!.x, points[i]!.y - points[i - 1]!.y);
  const minX = Math.min(...points.map(p => p.x)), minY = Math.min(...points.map(p => p.y));
  const maxX = Math.max(...points.map(p => p.x)), maxY = Math.max(...points.map(p => p.y));
  return { path: points.map((p, i) => `${i ? 'L' : 'M'}${(p.x - minX + pad).toFixed(3)} ${(p.y - minY + pad).toFixed(3)}`).join(' '), width: Math.max(width, maxX - minX + pad * 2), height: maxY - minY + pad * 2, length, closed };
}

interface RichRun { content: string; style: CSSStyleDeclaration }
function richLines(source: HTMLElement): RichRun[][] {
  const doc = source.ownerDocument, lines: RichRun[][] = [[]];
  const walker = doc.createTreeWalker(source, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT); let current: Node | null;
  while ((current = walker.nextNode())) {
    if (current.parentElement?.closest('[data-mce-bogus]')) continue;
    if (current.nodeType === Node.ELEMENT_NODE) { if ((current as Element).tagName === 'BR') lines.push([]); continue; }
    const style = doc.defaultView!.getComputedStyle(current.parentElement!);
    const parts = (current.textContent ?? '').replaceAll('\uFEFF', '').split('\n');
    parts.forEach((content, i) => { if (i) lines.push([]); if (content) lines.at(-1)!.push({ content, style }); });
  }
  return lines;
}
export function pathGlyphs(source: HTMLElement, svg: Element, defs: Element, uid: string, d: TextDeform, width: number, paint?: string) {
  const doc = source.ownerDocument, group = svgNode(doc, 'g', { 'data-text-path-glyphs': 'true' }, svg);
  const original = richLines(source); const lines = d.lines === 'join' ? [original.flatMap((line, i) => i && line.length ? [{ content: ' ', style: line[0]!.style }, ...line] : line)] : original;
  const ctx = doc.createElement('canvas').getContext('2d')!;
  let totalHeight = 0, totalWidth = width;
  lines.forEach((runs, index) => {
    const size = Math.max(16, ...runs.map(run => parseFloat(run.style.fontSize) || 24));
    const geometry = deformPath(d, width, size, ['circle', 'heart', 'triangle', 'rectangle', 'pentagon'].includes(d.preset) ? index : 0);
    const offsetY = geometry.closed ? (lines.length - index - 1) * size * 1.5 * d.aspect / 100 : totalHeight;
    const offsetX = geometry.closed ? (lines.length - index - 1) * size * 1.5 : 0;
    totalHeight = geometry.closed ? Math.max(totalHeight, geometry.height + offsetY * 2) : totalHeight + geometry.height;
    totalWidth = Math.max(totalWidth, geometry.width + offsetX * 2);
    const pathId = `${uid}-path${index ? '-' + index : ''}`;
    svgNode(doc, 'path', { id: pathId, d: geometry.path, fill: 'none' }, defs);
    const text = svgNode(doc, 'text', { 'xml:space': 'preserve', 'text-anchor': 'middle', direction: runs[0]?.style.direction ?? 'ltr', 'font-size': String(parseFloat(runs[0]?.style.fontSize ?? '') || size), fill: paint ?? runs[0]?.style.color ?? '#000000', transform: `translate(${offsetX} ${offsetY})` }, group);
    const textPath = svgNode(doc, 'textPath', { href: '#' + pathId, startOffset: '50%' }, text);
    let natural = 0;
    for (const run of runs) {
      const s = run.style; ctx.font = `${s.fontStyle} ${s.fontWeight} ${s.fontSize} ${s.fontFamily}`;
      natural += ctx.measureText(run.content).width + Math.max(0, run.content.length - 1) * (parseFloat(s.letterSpacing) || 0);
      const span = svgNode(doc, 'tspan', { fill: paint ?? s.color, 'font-family': s.fontFamily, 'font-size': s.fontSize, 'font-weight': s.fontWeight, 'font-style': s.fontStyle, 'letter-spacing': s.letterSpacing, 'text-decoration': s.textDecorationLine, 'baseline-shift': s.verticalAlign === 'super' ? 'super' : s.verticalAlign === 'sub' ? 'sub' : 'baseline' }, textPath); span.textContent = run.content;
    }
    if (natural > geometry.length * .92 || d.fit !== 'natural') { textPath.setAttribute('textLength', String(geometry.length * .92)); textPath.setAttribute('lengthAdjust', natural > geometry.length * .92 || d.fit === 'stretch' ? 'spacingAndGlyphs' : 'spacing'); }
  });
  return { glyphs: group, width: totalWidth, height: Math.max(32, totalHeight) };
}

/** Trace the browser's actual selected font at subpixel resolution, then deform its
 * contours. Filled paths render once, preserving alpha and sharp edges without mesh seams. */
export function warpSvg(svg: Element, _defs: Element, _uid: string, d: TextDeform, width: number, height: number) {
  const doc = svg.ownerDocument, amount = d.amount / 100, extra = height * .65;
  const map = (x: number, y: number): Point => {
    const u = x / width, v = y / height, wave = Math.sin(Math.PI * u), hump = Math.sin(2 * Math.PI * u), arch = Math.sqrt(Math.max(0, 1 - (2 * u - 1) ** 2));
    let top = 0, bottom = height, skew = 0;
    switch (d.preset) {
      case 'arch': top = -extra * wave * amount; bottom -= extra * wave * amount; break;
      case 'sector': top = -extra * arch * amount; bottom += extra * (1 - arch) * amount; skew = .35 * width * (u - .5) * amount; break;
      case 'concave': top = height * .38 * wave * amount; bottom -= height * .38 * wave * amount; break;
      case 'dome': top = -extra * wave * amount; break;
      case 'bowl': bottom += extra * wave * amount; break;
      case 'bulge': top = -extra * wave * amount; bottom += extra * wave * amount; break;
      case 'slant': top = -extra * (2 * u - 1) * amount; bottom -= extra * (2 * u - 1) * amount; skew = -height * .5 * amount; break;
      case 'flag': top = extra * .6 * hump * amount; bottom += extra * .6 * hump * amount; break;
    }
    return { x: x + skew * (v - .5), y: top + v * Math.max(height * .12, bottom - top) * d.aspect / 100 };
  };
  let minX = 0, maxX = width, minY = 0, maxY = height;
  for (let i = 0; i <= 100; i++) for (const y of [0, height]) { const p = map(width * i / 100, y); minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); }
  for (const text of [...svg.querySelectorAll('text')]) {
    if (text.closest('defs')) continue;
    const canvas = doc.createElement('canvas'), ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    const size = parseFloat(text.getAttribute('font-size') ?? '') || 24;
    const font = `${text.getAttribute('font-style') || 'normal'} ${text.getAttribute('font-weight') || '400'} ${size}px ${text.getAttribute('font-family') || 'sans-serif'}`;
    ctx.font = font; const rtl = text.getAttribute('direction') === 'rtl'; ctx.direction = rtl ? 'rtl' : 'ltr'; const spacing = text.getAttribute('letter-spacing'); if (spacing && spacing !== 'normal') ctx.letterSpacing = spacing;
    const content = text.textContent ?? '', metrics = ctx.measureText(content), targetWidth = Number(text.getAttribute('textLength')) || metrics.width;
    const stretch = targetWidth / Math.max(.01, metrics.width), pad = Math.max(4, size * .3);
    const ascent = metrics.fontBoundingBoxAscent || size, descent = metrics.fontBoundingBoxDescent || size * .3;
    const rasterWidth = Math.max(1, targetWidth + pad * 2 + Math.max(0, metrics.actualBoundingBoxRight * stretch - targetWidth)), rasterHeight = ascent + descent + pad * 2;
    const scale = Math.min(4, 4096 / rasterWidth, Math.sqrt(2000000 / (rasterWidth * rasterHeight)));
    canvas.width = Math.ceil(rasterWidth * scale); canvas.height = Math.ceil(rasterHeight * scale);
    ctx.scale(scale, scale); ctx.font = font; ctx.direction = rtl ? 'rtl' : 'ltr'; if (spacing && spacing !== 'normal') ctx.letterSpacing = spacing;
    ctx.fillStyle = '#ffffff'; ctx.translate(pad + (rtl ? targetWidth : 0), pad + ascent); ctx.scale(stretch, 1); ctx.fillText(content, 0, 0);
    const decoration = text.getAttribute('text-decoration') ?? '';
    if (decoration.includes('underline')) ctx.fillRect(0, size * .1, metrics.width, Math.max(1, size / 16));
    if (decoration.includes('line-through')) ctx.fillRect(0, -size * .3, metrics.width, Math.max(1, size / 16));
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data, w = canvas.width, h = canvas.height, stride = w + 1;
    const edges = new Map<number, number[]>();
    const add = (a: number, b: number) => { const list = edges.get(a); if (list) list.push(b); else edges.set(a, [b]); };
    const filled = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && data[(y * w + x) * 4 + 3]! >= 128;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!filled(x, y)) continue; const a = y * stride + x, b = a + 1, c = a + stride, e = c + 1;
      if (!filled(x, y - 1)) add(a, b); if (!filled(x + 1, y)) add(b, e); if (!filled(x, y + 1)) add(e, c); if (!filled(x - 1, y)) add(c, a);
    }
    const originX = Number(text.getAttribute('x')) - (rtl ? targetWidth : 0) - pad, originY = Number(text.getAttribute('y')) - pad - ascent;
    const paths: string[] = [];
    while (edges.size) {
      const start = edges.keys().next().value!; let cursor = start, previous = start - 1; const contour: Point[] = [];
      do {
        contour.push({ x: (cursor % stride) / scale + originX, y: Math.floor(cursor / stride) / scale + originY });
        const nexts = edges.get(cursor); if (!nexts?.length) break;
        let choice = 0;
        if (nexts.length > 1) { const direction = (n: number) => n === 1 ? 0 : n === stride ? 1 : n === -1 ? 2 : 3; const incoming = direction(cursor - previous); const rank = (n: number) => [1, 0, 3, 2].indexOf((direction(n - cursor) - incoming + 4) % 4); choice = rank(nexts[1]!) < rank(nexts[0]!) ? 1 : 0; }
        const next = nexts.splice(choice, 1)[0]!; if (!nexts.length) edges.delete(cursor); previous = cursor; cursor = next;
      } while (cursor !== start);
      if (contour.length < 3) continue;
      const simple = simplifyContour(contour, .16);
      paths.push(simple.map((p, i) => { const q = map(p.x, p.y); minX = Math.min(minX, q.x); minY = Math.min(minY, q.y); maxX = Math.max(maxX, q.x); maxY = Math.max(maxY, q.y); return `${i ? 'L' : 'M'}${q.x.toFixed(3)} ${q.y.toFixed(3)}`; }).join(' ') + 'Z');
    }
    const path = svgNode(doc, 'path', { d: paths.join(' '), fill: text.getAttribute('fill') || '#000000', 'fill-rule': 'evenodd', 'data-text-glyph': 'true' }, text.parentElement!);
    text.replaceWith(path);
  }
  svg.setAttribute('data-text-warp', d.preset);
  const margin = 12; svg.setAttribute('viewBox', `${minX - margin} ${minY - margin} ${maxX - minX + margin * 2} ${maxY - minY + margin * 2}`);
  svg.setAttribute('width', String(maxX - minX + margin * 2)); svg.setAttribute('height', String(maxY - minY + margin * 2));
}
function simplifyContour(points: Point[], tolerance: number): Point[] {
  // Iterative Douglas–Peucker avoids recursion limits on long text contours.
  const closed = [...points, points[0]!], keep = new Set([0, closed.length - 1]), stack = [[0, closed.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop()!; const p = closed[a!]!, q = closed[b!]!, dx = q.x - p.x, dy = q.y - p.y, length = dx * dx + dy * dy;
    let far = tolerance * tolerance, index = -1;
    for (let i = a! + 1; i < b!; i++) { const r = closed[i]!, t = length ? Math.max(0, Math.min(1, ((r.x - p.x) * dx + (r.y - p.y) * dy) / length)) : 0, distance = (r.x - p.x - t * dx) ** 2 + (r.y - p.y - t * dy) ** 2; if (distance > far) { far = distance; index = i; } }
    if (index >= 0) { keep.add(index); stack.push([a!, index], [index, b!]); }
  }
  return [...keep].sort((a, b) => a - b).slice(0, -1).map(index => closed[index]!);
}
