import type { Editor } from 'tinymce';

export const layoutDefaults = {
  textSizing: 'auto-height', boxWidth: '300', boxHeight: '100',
  verticalAlignment: 'top', firstLineIndent: '0', paragraphSpacing: '0', caseMode: 'none', listStyle: 'none'
};
export type TextLayoutSettings = typeof layoutDefaults;
export const sizingModes = ['auto-height', 'auto-width', 'fixed', 'auto-font'];
const sourceOf = (box: HTMLElement) => box.querySelector<HTMLElement>(':scope > [data-text-source]') ?? box;
const composingDocuments = new WeakSet<Document>();
export const isTextComposing = (doc: Document) => composingDocuments.has(doc);
export function ensureLayoutSource(box: HTMLElement) {
  const existing = sourceOf(box); if (existing !== box) return existing;
  const source = box.ownerDocument.createElement('span'); source.dataset.textSource = 'true';
  while (box.firstChild) source.append(box.firstChild);
  box.append(source); return source;
}
export function readTextLayout(box: HTMLElement): TextLayoutSettings {
  const vertical = box.ownerDocument.defaultView!.getComputedStyle(box).writingMode.startsWith('vertical');
  return {
    textSizing: box.dataset.textSizing ?? (vertical ? 'auto-width' : box.style.width && box.style.width !== 'auto' ? 'auto-height' : 'auto-width'),
    boxWidth: String(Math.round(box.offsetWidth * 100) / 100 || 300), boxHeight: String(Math.round(box.offsetHeight * 100) / 100 || 100),
    verticalAlignment: box.dataset.textVerticalAlignment ?? 'top', firstLineIndent: box.dataset.textFirstLineIndent ?? '0',
    paragraphSpacing: box.dataset.textParagraphSpacing ?? '0', caseMode: 'none',
    listStyle: box.closest('ol') ? 'ordered' : box.closest('ul') ? 'unordered' : 'none'
  };
}
export function validateTextLayout(s: TextLayoutSettings) {
  if (!sizingModes.includes(s.textSizing) || !['top', 'middle', 'bottom'].includes(s.verticalAlignment) ||
      !['none', 'uppercase', 'lowercase', 'capitalize'].includes(s.caseMode) || !['none', 'ordered', 'unordered'].includes(s.listStyle)) return '请选择有效的文字排版设置。';
  for (const [key, min, max, label] of [['boxWidth', 1, 10000, '文本框宽度'], ['boxHeight', 1, 10000, '文本框高度'], ['firstLineIndent', 0, 100, '首行缩进'], ['paragraphSpacing', 0, 10, '段落间距']] as const) {
    if (!s[key].trim() || !Number.isFinite(Number(s[key])) || Number(s[key]) < min || Number(s[key]) > max) return `${label}须在 ${min}—${max} 之间。`;
  }
  return '';
}

/** Split explicit paragraph breaks while cloning inline formatting, never soft wraps. */
function splitParagraphs(node: Node, doc: Document): DocumentFragment[] {
  if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? '').split('\n').map(text => { const f = doc.createDocumentFragment(); f.append(doc.createTextNode(text)); return f; });
  const el = node as HTMLElement;
  if (el.tagName === 'BR' && !el.hasAttribute('data-text-soft-break')) return [doc.createDocumentFragment(), doc.createDocumentFragment()];
  if (el.hasAttribute?.('data-text-list-marker')) return [doc.createDocumentFragment()];
  const result = [doc.createDocumentFragment()]; let wrapper = el.cloneNode(false);
  result[0]!.append(wrapper);
  for (const child of Array.from(node.childNodes)) {
    const parts = splitParagraphs(child, doc);
    parts.forEach((part, i) => {
      if (i) { const f = doc.createDocumentFragment(); wrapper = el.cloneNode(false); f.append(wrapper); result.push(f); }
      wrapper.appendChild(part);
    });
  }
  return result;
}
export function normalizeTextParagraphs(box: HTMLElement) {
  const source = ensureLayoutSource(box), doc = box.ownerDocument;
  const paragraphs = Array.from(source.querySelectorAll<HTMLElement>(':scope > [data-text-paragraph]'));
  const roots = paragraphs.length && paragraphs.length === source.children.length ? paragraphs : [source];
  if (paragraphs.length && !paragraphs.some(p => p.querySelector('br:not([data-text-soft-break]):not([data-text-empty])') || /\n/.test(p.textContent ?? ''))) return;
  const output: HTMLElement[] = [];
  for (const root of roots) {
    let parts = [doc.createDocumentFragment()];
    for (const child of Array.from(root.childNodes)) {
      if ((child as HTMLElement).hasAttribute?.('data-text-empty')) continue;
      const next = splitParagraphs(child, doc);
      parts[parts.length - 1]!.append(next[0]!); parts.push(...next.slice(1));
    }
    for (const part of parts) {
      const p = doc.createElement('span'); p.dataset.textParagraph = 'true'; p.append(part);
      if (!p.textContent && !p.querySelector('img,br,[data-mce-type=bookmark]')) { const br = doc.createElement('br'); br.dataset.textEmpty = 'true'; p.append(br); }
      output.push(p);
    }
  }
  source.replaceChildren(...output);
}
function changeCase(box: HTMLElement, mode: string) {
  if (mode === 'none') return;
  const walker = box.ownerDocument.createTreeWalker(sourceOf(box), NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let wordStart = true;
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.nodeType === Node.ELEMENT_NODE) {
      const el = n as HTMLElement;
      if (el.tagName === 'BR' || el.hasAttribute('data-text-paragraph')) wordStart = true;
      continue;
    }
    if (n.parentElement?.closest('[data-text-list-marker],[data-mce-bogus]')) continue;
    n.textContent = Array.from(n.textContent ?? '').map(c => {
      const letter = /\p{L}/u.test(c);
      const result = mode === 'uppercase' || (mode === 'capitalize' && wordStart) ? c.toLocaleUpperCase() : c.toLocaleLowerCase();
      wordStart = !letter && !/\p{N}/u.test(c); return result;
    }).join('');
  }
}
export function applyTextLayout(box: HTMLElement, draft: TextLayoutSettings, initial: TextLayoutSettings, fontSize?: string) {
  const changed = (key: keyof TextLayoutSettings) => draft[key] !== initial[key];
  if (changed('caseMode')) changeCase(box, draft.caseMode);
  if (changed('firstLineIndent') || changed('paragraphSpacing')) {
    box.dataset.textFirstLineIndent = draft.firstLineIndent; box.dataset.textParagraphSpacing = draft.paragraphSpacing;
    normalizeTextParagraphs(box);
  }
  if (changed('verticalAlignment')) { ensureLayoutSource(box); box.dataset.textVerticalAlignment = draft.verticalAlignment; }
  if (changed('textSizing') || changed('boxWidth') || changed('boxHeight')) {
    ensureLayoutSource(box); box.dataset.textSizing = draft.textSizing;
    box.style.width = `${Number(draft.boxWidth)}px`; box.style.height = `${Number(draft.boxHeight)}px`;
    box.style.boxSizing = 'border-box';
  }
  if (draft.textSizing === 'auto-font' && (changed('textSizing') || fontSize)) {
    const source = ensureLayoutSource(box);
    box.dataset.textAutoFontMax = fontSize ?? String(parseFloat(box.ownerDocument.defaultView!.getComputedStyle(box).fontSize));
    const base = parseFloat(box.ownerDocument.defaultView!.getComputedStyle(box).fontSize) || 24;
    for (const node of source.querySelectorAll<HTMLElement>('[style]')) {
      if (node.style.fontSize) node.dataset.textFontRatio = String(parseFloat(box.ownerDocument.defaultView!.getComputedStyle(node).fontSize) / base);
    }
  }
  updateTextLayout(box);
}

export function updateTextLayout(box: HTMLElement) {
  const mode = box.dataset.textSizing, source = sourceOf(box), view = box.ownerDocument.defaultView!;
  if (source === box) return;
  const vertical = view.getComputedStyle(box).writingMode.startsWith('vertical');
  const set = (node: HTMLElement, key: string, value: string) => { if (node.style.getPropertyValue(key) !== value) { node.style.setProperty(key, value); node.removeAttribute('data-mce-style'); } };
  if (mode) {
    set(box, 'max-width', 'none'); set(box, 'max-height', 'none');
    if (mode === 'auto-height') { set(box, 'height', vertical ? 'max-content' : 'auto'); set(source, 'white-space', vertical ? 'pre' : 'pre-wrap'); }
    if (mode === 'auto-width') { set(box, 'width', 'max-content'); set(source, 'white-space', vertical ? 'pre-wrap' : 'pre'); if (!vertical) set(box, 'height', 'auto'); }
    if (mode === 'fixed' || mode === 'auto-font') set(source, 'white-space', 'pre-wrap');
    set(source, 'width', vertical ? 'max-content' : '100%'); set(source, 'height', vertical ? mode === 'auto-height' ? 'max-content' : '100%' : 'auto');
  }
  if (box.hasAttribute('data-text-first-line-indent')) {
    set(box, '--text-first-line-indent', `${Number(box.dataset.textFirstLineIndent) || 0}em`);
    set(box, '--text-paragraph-spacing', `${Number(box.dataset.textParagraphSpacing) || 0}em`);
  }
  if (mode === 'auto-font') {
    const maximum = Math.max(1, Math.min(1000, Number(box.dataset.textAutoFontMax) || 24));
    const size = (value: number) => {
      set(box, 'font-size', `${value}px`);
      for (const child of source.querySelectorAll<HTMLElement>('[data-text-font-ratio]')) set(child, 'font-size', `${value * Number(child.dataset.textFontRatio)}px`);
    };
    let low = 1, high = maximum;
    for (let i = 0; i < 14; i++) {
      const middle = (low + high) / 2; size(middle);
      if (source.scrollWidth <= box.clientWidth + 0.5 && source.scrollHeight <= box.clientHeight + 0.5) low = middle; else high = middle;
    }
    size(Math.floor(low * 100) / 100);
  }
  const alignment = box.dataset.textVerticalAlignment;
  const fixedHeight = mode === 'fixed' || mode === 'auto-font' || (mode === 'auto-width' && vertical);
  const range = box.ownerDocument.createRange(); range.selectNodeContents(source);
  const contentHeight = vertical ? range.getBoundingClientRect().height : source.offsetHeight;
  const free = fixedHeight ? Math.max(0, box.clientHeight - contentHeight) : 0;
  set(box, '--text-content-y', `${alignment === 'bottom' ? free : alignment === 'middle' ? free / 2 : 0}px`);
}

export const textLayoutStyles = `
[data-text-paragraph]{display:block;min-height:1lh;text-indent:var(--text-first-line-indent,0);margin:0;padding:0}
[data-text-paragraph]+[data-text-paragraph]{margin-block-start:var(--text-paragraph-spacing,0)}
[data-text-vertical-alignment] > [data-text-source]{position:relative;top:var(--text-content-y,0)}
[data-text-vertical-alignment] > [data-text-render]{top:var(--text-content-y,0)!important}
[data-text-sizing="fixed"],[data-text-sizing="auto-font"]{overflow:hidden}
`;

export function registerTextLayout(editor: Editor) {
  let composing = false, running = false;
  const sync = () => {
    if (composing || running || editor.removed || !editor.getBody()) return;
    running = true;
    try { for (const box of editor.getBody().querySelectorAll<HTMLElement>('span[data-text-draggable]')) {
      if (box.hasAttribute('data-text-first-line-indent')) {
        const source = sourceOf(box);
        if (!source.querySelector('[data-text-paragraph]') || source.querySelector('[data-text-paragraph] br:not([data-text-soft-break]):not([data-text-empty])') || /\n/.test(source.textContent ?? '')) {
          const focused = box.contains(editor.selection.getNode());
          const bookmark = focused ? editor.selection.getBookmark() : undefined;
          normalizeTextParagraphs(box);
          if (bookmark) editor.selection.moveToBookmark(bookmark);
        }
      }
      updateTextLayout(box);
    } }
    finally { running = false; }
  };
  editor.on('compositionstart', () => { composing = true; composingDocuments.add(editor.getDoc()); });
  editor.on('compositionend', () => { composing = false; composingDocuments.delete(editor.getDoc()); sync(); });
  editor.on('init SetContent input change ExecCommand Undo Redo ResizeContent BeforeGetContent', sync);
  editor.on('init', () => {
    const fonts = editor.getDoc().fonts; fonts.addEventListener('loadingdone', sync);
    editor.on('remove', () => fonts.removeEventListener('loadingdone', sync));
  });
}
