import { ensureSource, textSource } from './text-advanced';

export const paragraphFormats = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
export interface ParagraphSettings { paragraphFormat: string; textDirection: string; paragraphQuote: boolean }
export type ParagraphStyles = Record<string, { fontSize: string; fontWeight: string }>;

export function readParagraphSettings(box: HTMLElement): ParagraphSettings {
  const source = textSource(box), walker = box.ownerDocument.createTreeWalker(source, NodeFilter.SHOW_TEXT);
  const formats = new Set<string>();
  let first = source;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (!node.textContent?.trim() || node.parentElement?.closest('[data-mce-bogus],[data-text-render],[data-text-background-render]')) continue;
    if (!formats.size) first = node.parentElement!;
    formats.add(node.parentElement!.closest('[data-selection-heading]')?.getAttribute('data-selection-heading')
      ?? node.parentElement!.closest('h1,h2,h3,h4,h5,h6')?.tagName.toLowerCase() ?? 'p');
  }
  return {
    paragraphFormat: formats.size > 1 ? '' : [...formats][0] ?? 'p',
    textDirection: box.ownerDocument.defaultView!.getComputedStyle(first).direction,
    paragraphQuote: box.dataset.textQuote === 'true'
  };
}

/** Capture the document's heading sizes so the isolated preview uses the same typography. */
export function readParagraphStyles(doc: Document): ParagraphStyles {
  return Object.fromEntries(paragraphFormats.map(format => {
    const probe = doc.createElement(format); probe.setAttribute('data-mce-bogus', 'all');
    probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none'; doc.body.append(probe);
    const style = doc.defaultView!.getComputedStyle(probe);
    const result = { fontSize: style.fontSize, fontWeight: style.fontWeight }; probe.remove();
    return [format, result];
  }));
}

export function validateParagraphSettings(settings: ParagraphSettings): string {
  return (!settings.paragraphFormat || (paragraphFormats as readonly string[]).includes(settings.paragraphFormat))
    && ['ltr', 'rtl'].includes(settings.textDirection) ? '' : '请选择有效的段落设置。';
}

export function applyParagraphSettings(box: HTMLElement, draft: ParagraphSettings, initial: ParagraphSettings, styles: ParagraphStyles) {
  if (draft.paragraphFormat && draft.paragraphFormat !== initial.paragraphFormat) {
    const source = ensureSource(box);
    for (const node of [source, ...source.querySelectorAll<HTMLElement>('*')]) {
      node.style.removeProperty('font-size');
      if (node.hasAttribute('data-selection-heading')) {
        node.removeAttribute('data-selection-heading'); node.style.removeProperty('font-weight');
      }
      node.removeAttribute('data-mce-style');
    }
    const heading = box.ownerDocument.createElement('span');
    heading.dataset.selectionHeading = draft.paragraphFormat;
    Object.assign(heading.style, styles[draft.paragraphFormat]);
    while (source.firstChild) heading.append(source.firstChild);
    source.append(heading);
  }
  if (draft.textDirection !== initial.textDirection) {
    const source = textSource(box);
    for (const node of [source, ...source.querySelectorAll<HTMLElement>('[dir],[style]')]) {
      node.removeAttribute('dir'); node.style.removeProperty('direction'); node.removeAttribute('data-mce-style');
    }
    box.dir = draft.textDirection; box.style.direction = draft.textDirection;
  }
  if (draft.paragraphQuote !== initial.paragraphQuote) {
    if (draft.paragraphQuote) box.dataset.textQuote = 'true'; else delete box.dataset.textQuote;
  }
}
