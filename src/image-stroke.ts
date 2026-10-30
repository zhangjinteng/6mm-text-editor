import type { Editor } from 'tinymce';

export type StrokeOptions = {
  stroke: boolean; strokeWidth: number; strokeColor: string; strokeStyle: 'solid' | 'dashed' | 'dotted';
  strokePosition: 'inside' | 'center' | 'outside'; mask: string; radius: number;
};
export const strokePositions = { inside: '内描边', center: '居中描边', outside: '外描边' } as const;
export const strokePresets = { solid: '基础实线', dashed: '装饰 · 虚线', dotted: '装饰 · 点线' } as const;
const layers = '[data-image-stroke-for]';
const sourceCache = new Map<string, Promise<HTMLImageElement>>();
function load(source: string) {
  let promise = sourceCache.get(source);
  if (!promise) {
    promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image(); image.crossOrigin = 'anonymous'; image.referrerPolicy = 'no-referrer';
      const timer = window.setTimeout(() => { image.onload = image.onerror = null; reject(new Error('图片轮廓读取超时，请检查图片地址后重试。')); }, 15000);
      image.onload = () => { clearTimeout(timer); resolve(image); };
      image.onerror = () => { clearTimeout(timer); reject(new Error('无法读取图片透明轮廓，请使用本地图片或允许跨域读取的图片地址。')); };
      image.src = source;
    });
    sourceCache.set(source, promise);
    if (sourceCache.size > 12) sourceCache.delete(sourceCache.keys().next().value!);
    promise.catch(() => sourceCache.delete(source));
  }
  return promise;
}
function canvas(width: number, height: number) {
  const c = document.createElement('canvas'); c.width = width; c.height = height; return c;
}
function shape(mask: string, w: number, h: number, radius: number): Path2D {
  const path = new Path2D();
  if (mask === 'circle' || mask === 'ellipse') path.ellipse(w / 2, h / 2, mask === 'circle' ? Math.min(w, h) / 2 : w / 2, mask === 'circle' ? Math.min(w, h) / 2 : h / 2, 0, 0, Math.PI * 2);
  else {
    const vertices: Record<string, number[][]> = {
      diamond: [[.5, 0], [1, .5], [.5, 1], [0, .5]], triangle: [[.5, 0], [1, 1], [0, 1]],
      hexagon: [[.25, 0], [.75, 0], [1, .5], [.75, 1], [.25, 1], [0, .5]],
      star: [[.5, 0], [.61, .35], [.98, .35], [.68, .57], [.79, .94], [.5, .72], [.21, .94], [.32, .57], [.02, .35], [.39, .35]]
    };
    const points = vertices[mask];
    if (points) { points.forEach(([x, y], i) => i ? path.lineTo(x! * w, y! * h) : path.moveTo(x! * w, y! * h)); path.closePath(); }
    else path.roundRect(0, 0, w, h, Math.min(radius, w / 2, h / 2));
  }
  return path;
}
/** Exact squared Euclidean distance transform: linear time in the number of pixels. */
function distances(binary: Uint8Array, width: number, height: number, target: number) {
  const data = new Float64Array(width * height);
  for (let i = 0; i < data.length; i++) data[i] = binary[i] === target ? 0 : 1e12;
  const n = Math.max(width, height), f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1);
  const line = (length: number) => {
    let k = 0; v[0] = 0; z[0] = -Infinity; z[1] = Infinity;
    for (let q = 1; q < length; q++) {
      let s = ((f[q]! + q * q) - (f[v[k]!]! + v[k]! * v[k]!)) / (2 * (q - v[k]!));
      while (s <= z[k]!) { k--; s = ((f[q]! + q * q) - (f[v[k]!]! + v[k]! * v[k]!)) / (2 * (q - v[k]!)); }
      k++; v[k] = q; z[k] = s; z[k + 1] = Infinity;
    }
    k = 0;
    for (let q = 0; q < length; q++) { while (z[k + 1]! < q) k++; d[q] = (q - v[k]!) ** 2 + f[v[k]!]!; }
  };
  for (let x = 0; x < width; x++) { for (let y = 0; y < height; y++) f[y] = data[y * width + x]!; line(height); for (let y = 0; y < height; y++) data[y * width + x] = d[y]!; }
  for (let y = 0; y < height; y++) { for (let x = 0; x < width; x++) f[x] = data[y * width + x]!; line(width); for (let x = 0; x < width; x++) data[y * width + x] = d[x]!; }
  return data;
}
/** Trace connected pixel boundary loops, including holes, for decorative dash presets. */
function boundary(binary: Uint8Array, w: number, h: number) {
  const edges = new Map<number, number[]>(), stride = w + 1;
  const edge = (a: number, b: number) => { const list = edges.get(a) ?? []; list.push(b); edges.set(a, list); };
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (binary[y * w + x]) {
    const a = y * stride + x;
    if (!y || !binary[(y - 1) * w + x]) edge(a, a + 1);
    if (x === w - 1 || !binary[y * w + x + 1]) edge(a + 1, a + stride + 1);
    if (y === h - 1 || !binary[(y + 1) * w + x]) edge(a + stride + 1, a + stride);
    if (!x || !binary[y * w + x - 1]) edge(a + stride, a);
  }
  const path = new Path2D();
  while (edges.size) {
    const start = edges.keys().next().value!; let at = start;
    path.moveTo(at % stride, Math.floor(at / stride));
    do {
      const list = edges.get(at); if (!list?.length) break;
      const next = list.pop()!; if (!list.length) edges.delete(at);
      path.lineTo(next % stride, Math.floor(next / stride)); at = next;
    } while (at !== start);
    path.closePath();
  }
  return path;
}
export async function createImageStroke(source: string, width: number, height: number, settings: StrokeOptions, crop = { x: 0, y: 0, width: 1, height: 1 }) {
  const original = await load(source);
  const scale = Math.min(2, 2048 / Math.max(width, height)), w = Math.max(1, Math.round(width * scale)), h = Math.max(1, Math.round(height * scale));
  const thickness = settings.strokeWidth * scale, pad = Math.ceil(thickness + 3), W = w + 2 * pad, H = h + 2 * pad;
  const alpha = canvas(W, H), ctx = alpha.getContext('2d', { willReadFrequently: true })!;
  ctx.translate(pad, pad);
  const geometry = shape(settings.mask, w, h, settings.radius * scale);
  ctx.save(); ctx.clip(geometry);
  // Rounded corners intersect the selected mask, just as border-radius + clip-path do in CSS.
  if (settings.radius) ctx.clip(shape('none', w, h, settings.radius * scale));
  ctx.drawImage(original, crop.x * original.naturalWidth, crop.y * original.naturalHeight, crop.width * original.naturalWidth, crop.height * original.naturalHeight, 0, 0, w, h);
  ctx.restore();
  let pixels: ImageData;
  try { pixels = ctx.getImageData(0, 0, W, H); } catch { throw new Error('此图片未允许跨域像素读取，无法生成透明轮廓描边。请先下载后上传本地图片。'); }
  let opaque = true;
  // Detect intrinsic transparency separately from the geometric mask.
  const probe = canvas(w, h), pc = probe.getContext('2d', { willReadFrequently: true })!;
  pc.drawImage(original, crop.x * original.naturalWidth, crop.y * original.naturalHeight, crop.width * original.naturalWidth, crop.height * original.naturalHeight, 0, 0, w, h);
  const raw = pc.getImageData(0, 0, w, h).data;
  for (let i = 3; i < raw.length; i += 4) if (raw[i]! < 254) { opaque = false; break; }
  if (settings.mask === 'fade' || settings.mask === 'soft') {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const px = (x - pad + .5) / w, py = (y - pad + .5) / h;
      const coverage = settings.mask === 'fade' ? Math.min(1, Math.max(0, (1 - py) / .8)) : Math.min(1, Math.max(0, (1 - Math.hypot((px - .5) * 2, (py - .5) * 2)) / .4));
      pixels.data[(y * W + x) * 4 + 3] = Math.round(pixels.data[(y * W + x) * 4 + 3]! * coverage);
    }
    ctx.putImageData(pixels, 0, 0); opaque = false;
  }
  const output = canvas(W, H), out = output.getContext('2d')!;
  const vector = opaque && (!settings.radius || ['none', 'circle', 'ellipse'].includes(settings.mask));
  const binary = new Uint8Array(W * H);
  for (let i = 0; i < binary.length; i++) binary[i] = pixels.data[i * 4 + 3]! >= 128 ? 1 : 0;
  if (vector || settings.strokeStyle !== 'solid') {
    out.strokeStyle = settings.strokeColor; out.lineJoin = 'round'; out.lineCap = settings.strokeStyle === 'dotted' ? 'round' : 'butt';
    out.lineWidth = thickness * (settings.strokePosition === 'center' ? 1 : 2);
    if (settings.strokeStyle !== 'solid') out.setLineDash(settings.strokeStyle === 'dashed' ? [thickness * 3, thickness * 2] : [.01, thickness * 2]);
    if (vector) { out.translate(pad, pad); out.stroke(geometry); out.resetTransform(); }
    else out.stroke(boundary(binary, W, H));
    if (settings.strokePosition !== 'center') {
      out.globalCompositeOperation = settings.strokePosition === 'inside' ? 'destination-in' : 'destination-out';
      out.drawImage(alpha, 0, 0); out.globalCompositeOperation = 'source-over';
    }
  } else {
    const toInside = distances(binary, W, H, 1), toOutside = distances(binary, W, H, 0), result = out.createImageData(W, H);
    const rgb = [1, 3, 5].map(i => parseInt(settings.strokeColor.slice(i, i + 2), 16));
    const radius = thickness * (settings.strokePosition === 'center' ? .5 : 1);
    for (let i = 0; i < binary.length; i++) {
      const inside = binary[i] === 1;
      if ((settings.strokePosition === 'inside' && !inside) || (settings.strokePosition === 'outside' && inside)) continue;
      const distance = Math.sqrt((inside ? toOutside : toInside)[i]!) - .5;
      const coverage = Math.min(1, Math.max(0, radius + .5 - distance));
      result.data.set([rgb[0]!, rgb[1]!, rgb[2]!, Math.round(255 * coverage)], i * 4);
    }
    out.putImageData(result, 0, 0);
  }
  return { url: output.toDataURL(), pad: pad / scale, width: W / scale, height: H / scale, method: vector ? 'path' : 'pixels' };
}

export function registerImageStrokes(editor: Editor) {
  let observer: MutationObserver | undefined, resize: ResizeObserver | undefined, scheduled = 0, removed = false;
  const observed = new Set<HTMLImageElement>();
  const signatures = new WeakMap<HTMLImageElement, string>();
  const pending = new WeakMap<HTMLImageElement, number>(); let revision = 0;
  const write = (image: HTMLImageElement, result: Awaited<ReturnType<typeof createImageStroke>>) => {
    let id = image.getAttribute('data-image-stroke-id');
    if (!id) { id = `stroke-${crypto.randomUUID()}`; editor.dom.setAttrib(image, 'data-image-stroke-id', id); }
    let layer = Array.from(editor.getBody().querySelectorAll<HTMLElement>(layers)).find(el => el.getAttribute('data-image-stroke-for') === id);
    if (!layer) { layer = editor.dom.create('span', { 'data-image-stroke-for': id, contenteditable: 'false', 'aria-hidden': 'true' }); layer.textContent = '\u00a0'; image.after(layer); }
    layer.setAttribute('data-stroke-pad', String(result.pad)); layer.setAttribute('data-stroke-method', result.method);
    layer.style.backgroundImage = `url("${result.url}")`; layer.style.backgroundSize = '100% 100%';
    position(image, layer);
    return layer;
  };
  function position(image: HTMLImageElement, layer: HTMLElement) {
    const pad = Number(layer.getAttribute('data-stroke-pad')) || 0;
    const s = editor.getWin().getComputedStyle(image);
    // Both nodes share the same containing block; do not use the rotated bounding rectangle.
    const properties = { position: 'absolute', display: 'block', pointerEvents: 'none', userSelect: 'none',
      left: `${image.offsetLeft - pad}px`, top: `${image.offsetTop - pad}px`, width: `${image.offsetWidth + 2 * pad}px`, height: `${image.offsetHeight + 2 * pad}px`,
      margin: '0', padding: '0', border: '0', fontSize: '0', lineHeight: '0', opacity: s.opacity, rotate: s.rotate, scale: s.scale, transform: s.transform,
      transformOrigin: '50% 50%', zIndex: s.zIndex === 'auto' ? 'auto' : s.zIndex };
    for (const [key, value] of Object.entries(properties)) if (layer.style[key as 'left'] !== value) (layer.style as unknown as Record<string, string>)[key] = value;
    layer.removeAttribute('data-mce-style');
    if (layer.previousSibling !== image) image.after(layer);
  }
  const update = () => {
    if (removed || !editor.getBody()) return;
    editor.undoManager.ignore(() => {
      const images = Array.from(editor.getBody().querySelectorAll<HTMLImageElement>('img[data-image-settings]'));
      const ids = new Set<string>();
      for (const image of images) {
        const id = image.getAttribute('data-image-stroke-id');
        if (id && ids.has(id)) editor.dom.setAttrib(image, 'data-image-stroke-id', `stroke-${crypto.randomUUID()}`);
        const unique = image.getAttribute('data-image-stroke-id'); if (unique) ids.add(unique);
      }
      for (const image of observed) if (!images.includes(image)) { resize?.unobserve(image); observed.delete(image); }
      const seen = new Set<string>();
      for (const layer of editor.getBody().querySelectorAll<HTMLElement>(layers)) {
        const id = layer.getAttribute('data-image-stroke-for')!;
        if (!ids.has(id) || seen.has(id)) layer.remove(); else seen.add(id);
      }
      for (const image of images) {
        let settings: StrokeOptions; try { settings = JSON.parse(image.getAttribute('data-image-settings')!); } catch { continue; }
        const id = image.getAttribute('data-image-stroke-id');
        const layer = Array.from(editor.getBody().querySelectorAll<HTMLElement>(layers)).find(el => el.getAttribute('data-image-stroke-for') === id);
        if (!settings.stroke) { layer?.remove(); signatures.delete(image); pending.set(image, ++revision); continue; }
        if (image.style.outline !== 'none') editor.dom.setStyles(image, { outline: 'none', outlineOffset: '0px' });
        if (layer) position(image, layer);
        if (!observed.has(image)) { resize?.observe(image); observed.add(image); }
        const signature = JSON.stringify([image.src, image.offsetWidth, image.offsetHeight, image.getAttribute('data-image-crop'), settings]);
        if (signatures.get(image) === signature && layer) continue;
        signatures.set(image, signature); const version = ++revision; pending.set(image, version);
        let crop; try { crop = JSON.parse(image.getAttribute('data-image-crop') || 'null') ?? undefined; } catch { /* full image */ }
        createImageStroke(image.src, image.offsetWidth, image.offsetHeight, { ...settings, strokePosition: settings.strokePosition ?? 'inside' }, crop).then(result => {
          if (!removed && image.isConnected && pending.get(image) === version) editor.undoManager.ignore(() => write(image, result));
        }).catch(() => { if (pending.get(image) === version) signatures.delete(image); });
      }
    });
  };
  const schedule = () => { if (!scheduled && !removed) scheduled = requestAnimationFrame(() => { scheduled = 0; update(); }); };
  editor.on('init', () => {
    observer = new MutationObserver(schedule); observer.observe(editor.getBody(), { subtree: true, childList: true, attributes: true, attributeFilter: ['style', 'src', 'data-image-settings', 'data-image-crop'] });
    resize = new ResizeObserver(schedule); editor.getBody().addEventListener('load', schedule, true); update();
  });
  editor.on('NodeChange ResizeContent SetContent Undo Redo', schedule);
  editor.on('BeforeGetContent', update);
  editor.on('remove', () => { removed = true; observer?.disconnect(); resize?.disconnect(); cancelAnimationFrame(scheduled); editor.getBody()?.removeEventListener('load', schedule, true); });
  return { write };
}
