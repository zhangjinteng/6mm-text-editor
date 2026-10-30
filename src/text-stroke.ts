/** Both straight and curved text use the same SVG glyph clipping and compositing. */
const ns = 'http://www.w3.org/2000/svg';
export function svgNode(doc: Document, name: string, attrs: Record<string, string>, parent: Element) {
  const element = doc.createElementNS(ns, name);
  for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
  parent.append(element); return element;
}
export function strokeVisible(box: HTMLElement) {
  return box.dataset.textStrokeEnabled === 'true' && Number(box.dataset.textStrokeWidth) > 0;
}
export function paintTextStroke(box: HTMLElement, svg: Element, defs: Element, glyphs: Element, uid: string, width: number, height: number) {
  if (!strokeVisible(box)) return;
  const doc = box.ownerDocument;
  const amount = Math.max(0, Math.min(10, Number(box.dataset.textStrokeWidth) || 0));
  const position = box.dataset.textStrokePosition || 'center';
  const join = ['miter', 'bevel', 'round'].includes(box.dataset.textStrokeJoin ?? '') ? box.dataset.textStrokeJoin! : 'miter';
  const color = box.dataset.textStrokeColor || '#000000';
  const outline = glyphs.cloneNode(true) as Element;
  // Fill attributes live on rich-text runs, so override every run for the stroke layer.
  for (const node of [outline, ...outline.querySelectorAll('text,tspan,path[data-text-glyph]')]) {
    node.setAttribute('fill', 'none'); node.setAttribute('stroke', color);
    node.setAttribute('stroke-width', String(amount * (position === 'center' ? 1 : 2)));
    node.setAttribute('stroke-linejoin', join); node.setAttribute('stroke-miterlimit', '4');
  }
  outline.setAttribute('data-text-stroke-layer', 'true');
  if (position !== 'center') {
    const mask = svgNode(doc, 'mask', { id: `${uid}-stroke-mask`, maskUnits: 'userSpaceOnUse', maskContentUnits: 'userSpaceOnUse', x: '-100', y: '-100', width: String(width + 200), height: String(height + 200), 'mask-type': 'luminance' }, defs);
    svgNode(doc, 'rect', { x: '-100', y: '-100', width: String(width + 200), height: String(height + 200), fill: position === 'outside' ? 'white' : 'black' }, mask);
    const silhouette = glyphs.cloneNode(true) as Element;
    for (const node of [silhouette, ...silhouette.querySelectorAll('text,tspan,path[data-text-glyph]')]) { node.setAttribute('fill', position === 'outside' ? 'black' : 'white'); node.setAttribute('stroke', 'none'); }
    mask.append(silhouette); outline.setAttribute('mask', `url(#${uid}-stroke-mask)`);
  }
  svg.append(outline);
}

/** Measure the original DOM's wrapped rich-text runs. SVG never becomes the editing model. */
export function straightTextGlyphs(source: HTMLElement, svg: Element, paint: string | undefined) {
  const doc = source.ownerDocument; const view = doc.defaultView!;
  const group = svgNode(doc, 'g', {}, svg); const origin = source.getBoundingClientRect();
  const canvas = doc.createElement('canvas'); const ctx = canvas.getContext('2d');
  const walker = doc.createTreeWalker(source, NodeFilter.SHOW_TEXT);
  let current: Node | null;
  while ((current = walker.nextNode())) {
    if (current.parentElement?.closest('[data-mce-bogus]')) continue;
    const content = current.textContent ?? ''; const computed = view.getComputedStyle(current.parentElement!);
    const size = parseFloat(computed.fontSize) || 24;
    if (ctx) ctx.font = `${computed.fontStyle} ${computed.fontWeight} ${size}px ${computed.fontFamily}`;
    const metrics = ctx?.measureText('Mg');
    const ascent = metrics?.fontBoundingBoxAscent ?? size * 0.8;
    const descent = metrics?.fontBoundingBoxDescent ?? size * 0.2;
    let start = 0;
    while (start < content.length) {
      const range = doc.createRange(); range.setStart(current, start);
      let end = start + (content.codePointAt(start)! > 0xffff ? 2 : 1); range.setEnd(current, end);
      const initial = range.getBoundingClientRect();
      while (end < content.length && content[end - 1] !== '\n') {
        const next = end + (content.codePointAt(end)! > 0xffff ? 2 : 1);
        const probe = doc.createRange(); probe.setStart(current, end); probe.setEnd(current, next);
        const rect = probe.getBoundingClientRect();
        if (Math.abs(rect.top - initial.top) > 1 || Math.abs(rect.bottom - initial.bottom) > 1 || content[end] === '\n') break;
        end = next;
      }
      range.setEnd(current, end); const rect = range.getBoundingClientRect();
      if (rect.width > 0 && content.slice(start, end).trim()) {
        // Inline highlights belong behind the glyphs, outside the stroke silhouette.
        let background = 'rgba(0, 0, 0, 0)';
        for (let parent = current.parentElement; parent && parent !== source; parent = parent.parentElement) {
          const candidate = view.getComputedStyle(parent).backgroundColor;
          if (candidate !== 'transparent' && candidate !== 'rgba(0, 0, 0, 0)') { background = candidate; break; }
        }
        if (background !== 'rgba(0, 0, 0, 0)') {
          const highlight = svgNode(doc, 'rect', { x: String(rect.left - origin.left), y: String(rect.top - origin.top), width: String(rect.width), height: String(rect.height), fill: background }, svg);
          group.before(highlight);
        }
        const rtl = computed.direction === 'rtl';
        const text = svgNode(doc, 'text', { x: String((rtl ? rect.right : rect.left) - origin.left), y: String(rect.top - origin.top + (rect.height - ascent - descent) / 2 + ascent), fill: paint ?? computed.color, 'font-family': computed.fontFamily, 'font-size': computed.fontSize, 'font-weight': computed.fontWeight, 'font-style': computed.fontStyle, 'letter-spacing': computed.letterSpacing, 'text-decoration': computed.textDecorationLine, direction: computed.direction, 'text-anchor': 'start', 'xml:space': 'preserve', textLength: String(rect.width), lengthAdjust: 'spacingAndGlyphs' }, group);
        text.textContent = content.slice(start, end);
      }
      start = end;
    }
  }
  return group;
}
