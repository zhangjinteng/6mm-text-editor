import { ensureSource, textSource } from './text-advanced';

export interface BasicTextSettings { fontFamily: string; fontSize: string; textColor: string; highlightColor: string }

/** Read the editable source, never generated SVGs or the object-selection caret. */
export function readBasicTextSettings(box: HTMLElement): BasicTextSettings {
  const source = textSource(box), doc = box.ownerDocument;
  const walker = doc.createTreeWalker(source, NodeFilter.SHOW_TEXT);
  let first = source;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent || node.parentElement?.closest('[data-mce-bogus], [data-text-render], [data-text-background-render]')) continue;
    first = node.parentElement!; break;
  }
  const style = doc.defaultView!.getComputedStyle(first);
  let highlightColor = 'transparent';
  for (let node: HTMLElement | null = first; node && node !== box; node = node.parentElement) {
    const color = doc.defaultView!.getComputedStyle(node).backgroundColor;
    if (color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)') { highlightColor = color; break; }
  }
  return { fontFamily: style.fontFamily, fontSize: String(parseFloat(style.fontSize) || 24), textColor: style.color, highlightColor };
}

export function validateBasicTextSettings(settings: BasicTextSettings, doc: Document): string {
  if (!settings.fontSize.trim() || !Number.isFinite(Number(settings.fontSize)) || Number(settings.fontSize) < 1 || Number(settings.fontSize) > 1000) return '请输入 1—1000 px 范围内的字号。';
  const probe = doc.createElement('span');
  probe.style.fontFamily = settings.fontFamily;
  if (!probe.style.fontFamily) return '请选择有效的字体。';
  for (const value of [settings.textColor, settings.highlightColor]) {
    probe.style.color = ''; probe.style.color = value;
    if (!/^(#[0-9a-f]{3,8}|[a-z]+|rgba?\([\d.,%\s]+\))$/i.test(value) || !probe.style.color) return '请输入有效的颜色。';
  }
  return '';
}

/** Only changed fields override rich text; other mixed formatting stays intact. */
export function applyBasicTextSettings(box: HTMLElement, draft: BasicTextSettings, initial: BasicTextSettings) {
  const changed = (['fontFamily', 'fontSize', 'textColor', 'highlightColor'] as const).filter(key => draft[key] !== initial[key]);
  if (!changed.length) return;
  const source = ensureSource(box);
  const properties = { fontFamily: 'font-family', fontSize: 'font-size', textColor: 'color', highlightColor: 'background-color' } as const;
  const attributes = { fontFamily: 'face', fontSize: 'size', textColor: 'color', highlightColor: 'bgcolor' } as const;
  for (const key of changed) {
    for (const node of [source, ...source.querySelectorAll<HTMLElement>('*')]) {
      node.style.removeProperty(properties[key]);
      if (node.tagName === 'FONT' || key === 'highlightColor') node.removeAttribute(attributes[key]);
      node.removeAttribute('data-mce-style');
    }
    if (key === 'highlightColor') {
      if (draft.highlightColor !== 'transparent') {
        const highlight = box.ownerDocument.createElement('span'); highlight.style.backgroundColor = draft.highlightColor;
        while (source.firstChild) highlight.append(source.firstChild);
        source.append(highlight);
      }
    } else box.style.setProperty(properties[key], key === 'fontSize' ? `${Number(draft[key])}px` : draft[key]);
  }
  box.removeAttribute('data-mce-style');
}
