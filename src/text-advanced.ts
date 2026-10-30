import type { Editor } from 'tinymce';
import { readDeform, isWarp, pathGlyphs, warpSvg } from './text-deform';
import { paintTextStroke, straightTextGlyphs, strokeVisible } from './text-stroke';
import { needsFillSvg, paintFillLayers } from './text-fill';
import { renderTextBackground, textBackgroundStyles } from './text-background';

const ns = 'http://www.w3.org/2000/svg';
const boxes = 'span[data-text-draggable]';
const renderKeys = new WeakMap<HTMLElement, string>();
const sourceSelector = ':scope > [data-text-source]';
export const advancedTextStyles = `
${textBackgroundStyles}
[data-text-source]{display:block;min-height:1em;white-space:pre-wrap;overflow-wrap:anywhere}
[data-text-render]{display:block;line-height:0;pointer-events:none;user-select:none;text-shadow:none}
[data-text-render] > svg{display:block;width:100%;height:auto;overflow:visible}
[data-text-stroke-render],[data-text-fill-render]{position:relative}
[data-text-stroke-render] > [data-text-source],[data-text-fill-render] > [data-text-source]{visibility:hidden}
[data-text-stroke-render] > [data-text-render],[data-text-fill-render] > [data-text-render]{position:absolute;left:0;top:0;width:100%;text-shadow:none}
[data-text-curve] > [data-text-source]{display:none}
[data-text-deform-kind=warp]{position:relative}
[data-text-deform-kind=warp] > [data-text-source]{display:block;position:absolute;left:0;top:0;width:100%;visibility:hidden}
[data-text-deform-kind=warp].text-advanced-editing > [data-text-source]{position:static;visibility:visible}
[data-text-curve].text-advanced-editing > [data-text-source]{display:block}
[data-text-stroke-render].text-advanced-editing > [data-text-source],[data-text-fill-render].text-advanced-editing > [data-text-source]{visibility:visible}
[data-text-stroke-render].text-advanced-editing > [data-text-render],[data-text-fill-render].text-advanced-editing > [data-text-render]{display:none}
[data-text-curve].text-advanced-editing > [data-text-render]{display:none}
`;

export function textSource(box: HTMLElement) { return box.querySelector<HTMLElement>(sourceSelector) ?? box; }
export function setAdvancedEditing(box: HTMLElement | undefined, editing: boolean) {
  box?.classList.toggle('text-advanced-editing', editing);
  if (editing) box?.querySelector(':scope > [data-text-caret]')?.remove();
}
/** A visible-layout, transparent caret host keeps TinyMCE's selection inside a curved object. */
export function selectAdvancedObject(editor: Editor, box: HTMLElement) {
  if (!box.querySelector(':scope > [data-text-render]')) { editor.selection.setCursorLocation(textSource(box), 0); return; }
  let caret = box.querySelector<HTMLElement>(':scope > [data-text-caret]');
  if (!caret) {
    caret = box.ownerDocument.createElement('span'); caret.dataset.textCaret = 'true'; caret.setAttribute('data-mce-bogus', 'all');
    caret.style.cssText = 'position:absolute;left:0;top:0;opacity:0;pointer-events:none;width:1px;height:1em'; caret.textContent = '\uFEFF'; box.append(caret);
  }
  const first = box.ownerDocument.createTreeWalker(textSource(box), NodeFilter.SHOW_TEXT).nextNode()?.parentElement ?? textSource(box);
  const computed = editor.getWin().getComputedStyle(first);
  Object.assign(caret.style, { fontSize: computed.fontSize, fontFamily: computed.fontFamily, fontWeight: computed.fontWeight, fontStyle: computed.fontStyle, color: computed.color });
  editor.selection.setCursorLocation(caret.firstChild!, 0);
}
export function ensureSource(box: HTMLElement) {
  const existing = box.querySelector<HTMLElement>(sourceSelector); if (existing) return existing;
  const source = box.ownerDocument.createElement('span'); source.dataset.textSource = 'true';
  while (box.firstChild) source.append(box.firstChild);
  box.append(source); return source;
}
function validColor(value: string, doc: Document) {
  const probe = doc.createElement('span'); probe.style.color = value;
  return /^(#[0-9a-f]{3,8}|rgba?\([\d.,%\s]+\))$/i.test(value) && !!probe.style.color;
}
function imageUrl(value: string): string | undefined {
  if (/^data:image\/(png|jpeg|webp|gif);base64,[a-z0-9+/=\s]+$/i.test(value) && value.length <= 7 * 1024 * 1024) return value;
  try { const url = new URL(value); if (url.protocol === 'https:' && !url.username && !url.password && value.length <= 4096) return url.href; } catch { /* Invalid URL. */ }
}
function plainText(source: HTMLElement) {
  const copy = source.cloneNode(true) as HTMLElement;
  copy.querySelectorAll('[data-mce-bogus]').forEach(node => node.remove());
  copy.querySelectorAll('br').forEach(node => node.replaceWith(copy.ownerDocument.createTextNode('\n')));
  return (copy.textContent ?? '').replaceAll('\uFEFF', '').replace(/\s+/g, ' ').trim();
}

/** Rebuild only declarative generated markup; original rich text remains the editing model. */
export function renderAdvancedText(box: HTMLElement) {
  // A hidden editor has no measurable layout. Preserve its last valid SVG for preview/export.
  if (!box.getClientRects().length || box.offsetWidth === 0) return;
  const doc = box.ownerDocument; const view = doc.defaultView!;
  // Migrate legacy browser strokes once, retaining their centered-width semantics.
  const legacy = parseFloat(box.style.getPropertyValue('-webkit-text-stroke-width')) || 0;
  if (legacy && !box.dataset.textStrokeEnabled) {
    box.dataset.textStrokeEnabled = 'true'; box.dataset.textStrokeWidth = String(legacy);
    box.dataset.textStrokeColor = box.style.getPropertyValue('-webkit-text-stroke-color') || '#000000';
    box.dataset.textStrokePosition = 'center'; box.dataset.textStrokeJoin = 'miter';
    for (const property of ['-webkit-text-stroke', '-webkit-text-stroke-width', '-webkit-text-stroke-color', 'paint-order']) box.style.removeProperty(property);
    box.removeAttribute('data-mce-style'); ensureSource(box);
  }
  if (box.hasAttribute('data-text-background-settings')) ensureSource(box);
  const source = box.querySelector<HTMLElement>(sourceSelector); if (!source) return;
  const layered = box.hasAttribute('data-text-fills'), fillSvg = needsFillSvg(box);
  const deformation = readDeform(box); const deformed = deformation.preset !== 'none';
  const warp = deformed && isWarp(deformation.preset);
  if (deformed) box.dataset.textDeformKind = warp ? 'warp' : 'path'; else delete box.dataset.textDeformKind;
  const curved = deformed;
  if (strokeVisible(box) && !curved) box.dataset.textStrokeRender = 'true'; else delete box.dataset.textStrokeRender;

  if (fillSvg && !curved) box.dataset.textFillRender = 'true'; else delete box.dataset.textFillRender;
  const firstNode = doc.createTreeWalker(source, NodeFilter.SHOW_TEXT).nextNode()?.parentElement ?? source;
  const observed = view.getComputedStyle(firstNode);
  if ((curved || strokeVisible(box) || fillSvg) && !box.dataset.textRenderId) box.dataset.textRenderId = 'text-' + crypto.randomUUID();
  const signature = JSON.stringify([source.innerHTML, box.dataset.textDeform, box.dataset.textBackgroundSettings, box.dataset.textShadow, box.dataset.textFills, box.dataset.textFill, box.dataset.textGradientStart, box.dataset.textGradientEnd, box.dataset.textGradientAngle, box.dataset.textImage, box.dataset.textCurve, box.dataset.textCurveStrength, box.dataset.textRenderId, box.dataset.textStrokeEnabled, box.dataset.textStrokeWidth, box.dataset.textStrokeColor, box.dataset.textStrokePosition, box.dataset.textStrokeJoin, box.style.cssText, box.clientWidth, observed.fontFamily, observed.fontSize, observed.fontWeight, observed.fontStyle, observed.color, observed.letterSpacing]);
  if (renderKeys.get(box) === signature && (!(curved || strokeVisible(box) || fillSvg) || box.querySelector(':scope > [data-text-render]'))) { renderTextBackground(box); return; }
  renderKeys.set(box, signature);
  const fill = box.dataset.textFill;
  const start = validColor(box.dataset.textGradientStart ?? '', doc) ? box.dataset.textGradientStart! : '#147d64';
  const end = validColor(box.dataset.textGradientEnd ?? '', doc) ? box.dataset.textGradientEnd! : '#3598db';
  const angle = Math.max(0, Math.min(360, Number(box.dataset.textGradientAngle) || 0));
  const image = imageUrl(box.dataset.textImage ?? '');
  const background = fill === 'gradient' ? `linear-gradient(${angle}deg, ${start}, ${end})` : fill === 'image' && image ? `url(${JSON.stringify(image)})` : '';
  for (const [name, value] of Object.entries({ backgroundImage: background, backgroundSize: background ? 'cover' : '', backgroundPosition: background ? 'center' : '', backgroundRepeat: background ? 'no-repeat' : '', backgroundClip: background ? 'text' : '', webkitBackgroundClip: background ? 'text' : '', webkitTextFillColor: background ? 'transparent' : '' })) {
    source.style.setProperty(name.replace(/[A-Z]/g, letter => '-' + letter.toLowerCase()).replace(/^webkit-/, '-webkit-'), value);
  }
  source.removeAttribute('data-mce-style');
  const previous = box.querySelector<HTMLElement>(':scope > [data-text-render]');
  const bendValue = Math.max(0, Math.min(100, Number(box.dataset.textCurveStrength) || 0));
  if (!curved && !strokeVisible(box) && !fillSvg) { previous?.remove(); renderTextBackground(box); return; }
  const walker = doc.createTreeWalker(source, NodeFilter.SHOW_TEXT);
  const first = walker.nextNode()?.parentElement ?? source;
  const computed = view.getComputedStyle(first);
  const parentStyle = view.getComputedStyle(box);
  const size = parseFloat(computed.fontSize) || 24;
  const width = Math.max(32, box.clientWidth - (parseFloat(parentStyle.paddingLeft) || 0) - (parseFloat(parentStyle.paddingRight) || 0));
  const padding = Math.max(size * 1.25, 12); const bend = Math.min(width * 0.5, 200) * bendValue / 100;
  const height = warp ? Math.max(16, source.offsetHeight) : curved ? padding * 2 + bend : source.offsetHeight;
  const up = box.dataset.textCurve !== 'down';
  const y = padding + (up ? bend : 0); const control = padding + (up ? -bend : 2 * bend);
  const uid = box.dataset.textRenderId ||= `text-${crypto.randomUUID()}`;
  const svg = doc.createElementNS(ns, 'svg'); svg.setAttribute('xmlns', ns); svg.setAttribute('viewBox', `0 0 ${width} ${height}`); svg.setAttribute('width', String(width)); svg.setAttribute('height', String(height)); svg.setAttribute('aria-hidden', 'true');
  if (!layered && parentStyle.textShadow && parentStyle.textShadow !== 'none') svg.style.filter = `drop-shadow(${parentStyle.textShadow})`;
  function node(name: string, attrs: Record<string, string>, parent: Element) {
    const element = doc.createElementNS(ns, name); for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value); parent.append(element); return element;
  }
  const defs = node('defs', {}, svg);
  function shadow(glyphs: Element) {
    if (!layered || !parentStyle.textShadow || parentStyle.textShadow === 'none') return;
    const offsets = parentStyle.textShadow.match(/-?\d+(?:\.\d+)?px/g) ?? [];
    const color = parentStyle.textShadow.replace(/-?\d+(?:\.\d+)?px/g, '').trim();
    const layer = node('g', { 'data-text-shadow-layer': 'true', transform: `translate(${parseFloat(offsets[0] ?? '') || 0} ${parseFloat(offsets[1] ?? '') || 0})` }, svg);
    const blur = Math.max(0, parseFloat(offsets[2] ?? '') || 0); if (blur) (layer as SVGElement).style.filter = `blur(${blur / 2}px)`;
    const copy = glyphs.cloneNode(true) as Element;
    for (const item of [copy, ...copy.querySelectorAll('text,tspan,path[data-text-glyph]')]) {
      item.setAttribute('fill', color);
      if (strokeVisible(box) && box.dataset.textStrokePosition !== 'inside') {
        item.setAttribute('stroke', color); item.setAttribute('stroke-width', String(Number(box.dataset.textStrokeWidth) * (box.dataset.textStrokePosition === 'outside' ? 2 : 1))); item.setAttribute('stroke-linejoin', box.dataset.textStrokeJoin || 'miter');
      }
    }
    layer.append(copy); glyphs.before(layer);
  }

  const left = Math.min(padding * 0.5, width * 0.1); const right = width - left;
  if (curved && !box.dataset.textDeform) node('path', { id: `${uid}-path`, d: `M ${left} ${y} Q ${width / 2} ${control} ${right} ${y}`, fill: 'none' }, defs);
  let paint = computed.color;
  if (!layered && fill === 'gradient') {
    const radians = angle * Math.PI / 180;
    const gradient = node('linearGradient', { id: `${uid}-fill`, x1: String(0.5 - Math.sin(radians) / 2), y1: String(0.5 + Math.cos(radians) / 2), x2: String(0.5 + Math.sin(radians) / 2), y2: String(0.5 - Math.cos(radians) / 2) }, defs);
    node('stop', { offset: '0', 'stop-color': start }, gradient); node('stop', { offset: '1', 'stop-color': end }, gradient); paint = `url(#${uid}-fill)`;
  } else if (!layered && fill === 'image' && image) {
    const pattern = node('pattern', { id: `${uid}-fill`, patternUnits: 'userSpaceOnUse', width: String(width), height: String(height) }, defs);
    node('image', { href: image, width: String(width), height: String(height), preserveAspectRatio: 'xMidYMid slice' }, pattern); paint = `url(#${uid}-fill)`;
  }
  if (deformed && box.dataset.textDeform) {
    let glyphs: Element;
    let renderWidth = width, renderHeight = height;
    if (warp) glyphs = straightTextGlyphs(source, svg, !layered && (fill === 'gradient' || fill === 'image') ? paint : undefined);
    else {
      const result = pathGlyphs(source, svg, defs, uid, deformation, width, !layered && (fill === 'gradient' || fill === 'image') ? paint : undefined);
      glyphs = result.glyphs; renderWidth = result.width; renderHeight = result.height;
      svg.setAttribute('viewBox', `0 0 ${renderWidth} ${renderHeight}`); svg.setAttribute('width', String(renderWidth)); svg.setAttribute('height', String(renderHeight));
    }
    if (warp) { warpSvg(svg, defs, uid, deformation, width, height); renderWidth = Number(svg.getAttribute('width')); renderHeight = Number(svg.getAttribute('height')); }
    shadow(glyphs); paintFillLayers(box, svg, defs, glyphs, uid, renderWidth, renderHeight); paintTextStroke(box, svg, defs, glyphs, uid, renderWidth, renderHeight);
    const render = doc.createElement('span'); render.dataset.textRender = 'true'; render.contentEditable = 'false'; render.append(svg);
    if (previous) previous.replaceWith(render); else box.append(render); renderTextBackground(box); return;
  }
  if (!curved) {
    const glyphs = straightTextGlyphs(source, svg, !layered && (fill === 'gradient' || fill === 'image') ? paint : undefined);
    shadow(glyphs);
    paintFillLayers(box, svg, defs, glyphs, uid, width, height);
    paintTextStroke(box, svg, defs, glyphs, uid, width, height);
    const render = doc.createElement('span'); render.dataset.textRender = 'true'; render.contentEditable = 'false';
    render.style.left = `${source.offsetLeft}px`; render.style.top = `${source.offsetTop}px`; render.style.width = `${width}px`;
    render.append(svg); if (previous) previous.replaceWith(render); else box.append(render); renderTextBackground(box); return;
  }
  const text = node('text', { fill: paint, 'font-family': computed.fontFamily, 'font-size': String(size), 'font-weight': computed.fontWeight, 'font-style': computed.fontStyle, 'letter-spacing': computed.letterSpacing, 'text-anchor': 'middle', 'paint-order': 'stroke fill' }, svg);
  if (computed.textDecorationLine !== 'none') text.setAttribute('text-decoration', computed.textDecorationLine);
  const pathText = node('textPath', { href: `#${uid}-path`, startOffset: '50%' }, text);
  const content = plainText(source); pathText.textContent = content;
  // Long text fits the path instead of losing trailing glyphs outside it.
  const canvas = doc.createElement('canvas'); const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.font = `${computed.fontStyle} ${computed.fontWeight} ${size}px ${computed.fontFamily}`;
    const natural = ctx.measureText(content).width + Math.max(0, content.length - 1) * (parseFloat(computed.letterSpacing) || 0);
    let length = 0; let px = left; let py = y;
    for (let i = 1; i <= 50; i++) { const t = i / 50; const x = (1 - t) ** 2 * left + 2 * (1 - t) * t * width / 2 + t * t * right; const yy = (1 - t) ** 2 * y + 2 * (1 - t) * t * control + t * t * y; length += Math.hypot(x - px, yy - py); px = x; py = yy; }
    if (natural > length * 0.92) { pathText.setAttribute('textLength', String(length * 0.92)); pathText.setAttribute('lengthAdjust', 'spacingAndGlyphs'); }
  }
  shadow(text);
  paintFillLayers(box, svg, defs, text, uid, width, height);
  paintTextStroke(box, svg, defs, text, uid, width, height);
  const render = doc.createElement('span'); render.dataset.textRender = 'true'; render.contentEditable = 'false'; render.append(svg);
  if (previous) previous.replaceWith(render); else box.append(render); renderTextBackground(box);
}

export function registerAdvancedText(editor: Editor) {
  editor.on('init', () => {
    const doc = editor.getDoc(); let updating = false;
    const observer = new MutationObserver(records => {
      if (records.every(record => (record.target as Element).closest?.('[data-text-render], [data-text-background-render], [data-mce-bogus]'))) return;
      sync();
    });
    function sync() {
      if (updating || editor.removed) return; updating = true; observer.disconnect();
      try {
        const seen = new Set<string>();
        for (const box of doc.body.querySelectorAll<HTMLElement>(`${boxes}[data-text-deform],${boxes}[data-text-background-settings],${boxes}[data-text-shadow],${boxes}[data-text-fills],${boxes}[data-text-fill],${boxes}[data-text-curve],${boxes}[data-text-stroke-enabled],${boxes}[style*='text-stroke'],${boxes}:has(>[data-text-source])`)) {
          if (box.closest('[data-mce-bogus]')) continue;
          const uid = box.dataset.textRenderId;
          if (uid && seen.has(uid)) box.dataset.textRenderId = `text-${crypto.randomUUID()}`;
          renderAdvancedText(box); if (box.dataset.textRenderId) seen.add(box.dataset.textRenderId);
        }
      } finally { observer.observe(doc.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['style', 'data-text-deform', 'data-text-background-settings', 'data-text-shadow', 'data-text-fills', 'data-text-fill', 'data-text-curve', 'data-text-stroke-enabled', 'data-text-stroke-width', 'data-text-stroke-color', 'data-text-stroke-position', 'data-text-stroke-join'] }); updating = false; }
    }
    editor.serializer.addAttributeFilter('class', nodes => {
      for (const node of nodes) { const classes = (node.attr('class') ?? '').split(/\s+/).filter(name => name !== 'text-advanced-editing'); node.attr('class', classes.join(' ') || null); }
    });
    doc.addEventListener('input', sync, true);
    editor.on('BeforeGetContent input change SetContent Undo Redo ResizeContent CanvasTextInserted', sync);
    const fontsChanged = () => { for (const box of doc.querySelectorAll<HTMLElement>(boxes)) renderKeys.delete(box); sync(); };
    doc.fonts.addEventListener('loadingdone', fontsChanged);
    sync();
    editor.on('remove', () => { doc.fonts.removeEventListener('loadingdone', fontsChanged); observer.disconnect(); doc.removeEventListener('input', sync, true); editor.off('BeforeGetContent input change SetContent Undo Redo ResizeContent CanvasTextInserted', sync); });
  });
}
