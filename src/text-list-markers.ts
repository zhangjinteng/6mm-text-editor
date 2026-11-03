import type { Editor } from 'tinymce';
import { ensureSource, textSource } from './text-advanced';
import { isTextComposing } from './text-layout';

export const textListStyles = `
li[data-text-list-host]::marker{content:''}
[data-text-list-marker]{white-space:pre;user-select:none;pointer-events:none}
`;

function ordinal(item: HTMLElement, list: HTMLElement): number {
  const items = Array.from(list.children).filter(node => node.tagName === 'LI');
  const reversed = list.hasAttribute('reversed');
  let value = Number(list.getAttribute('start') ?? (reversed ? items.length : 1));
  for (const sibling of items) {
    if (sibling.hasAttribute('value')) value = Number(sibling.getAttribute('value'));
    if (sibling === item) return value;
    value += reversed ? -1 : 1;
  }
  return value;
}

function numberLabel(value: number, style: string): string {
  if (style === 'decimal-leading-zero') return String(value).padStart(2, '0');
  if (/^(lower|upper)-(alpha|latin)$/.test(style) && value > 0) {
    let text = '';
    for (let n = value; n > 0; n = Math.floor((n - 1) / 26)) text = String.fromCharCode(97 + (n - 1) % 26) + text;
    return style.startsWith('upper') ? text.toUpperCase() : text;
  }
  if (/^(lower|upper)-roman$/.test(style) && value > 0 && value < 4000) {
    let text = '', remaining = value;
    for (const [amount, letters] of [[1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']] as const) {
      while (remaining >= amount) { text += letters; remaining -= amount; }
    }
    return style.startsWith('lower') ? text.toLowerCase() : text;
  }
  return String(value);
}

/** Keep native list semantics, but paint the marker inside the positioned text object. */
export function syncTextListMarkers(editor: Editor) {
  const body = editor.getBody(); if (!body) return;
  if (isTextComposing(editor.getDoc())) return;
  const hosts = new Set<HTMLElement>();
  for (const box of body.querySelectorAll<HTMLElement>('span[data-text-draggable]')) {
    if (box.closest('[data-mce-bogus]')) continue;
    const item = box.closest<HTMLElement>('li');
    const list = item?.parentElement;
    const markers = Array.from(textSource(box).querySelectorAll<HTMLElement>('[data-text-list-marker]'));
    if (!item || !list?.matches('ol,ul')) { markers.forEach(marker => marker.remove()); continue; }
    hosts.add(item);
    const style = editor.getWin().getComputedStyle(item).listStyleType;
    const symbol = { disc: '•', circle: '◦', square: '▪' }[style];
    const label = style === 'none' ? '' : symbol ?? `${numberLabel(ordinal(item, list), style)}.`;
    if (!label) { markers.forEach(marker => marker.remove()); continue; }
    const source = ensureSource(box);
    let marker = markers.shift(); markers.forEach(extra => extra.remove());
    if (!marker) {
      marker = editor.getDoc().createElement('span');
      marker.dataset.textListMarker = 'true';
      marker.contentEditable = 'false';
      marker.setAttribute('aria-hidden', 'true');
    }
    if (marker.textContent !== label + '\u00a0') marker.textContent = label + '\u00a0';
    if (source.firstChild !== marker) source.prepend(marker);
    const walker = editor.getDoc().createTreeWalker(source, NodeFilter.SHOW_TEXT, {
      acceptNode: node => node.textContent?.trim() && !node.parentElement?.closest('[data-text-list-marker],[data-mce-bogus]')
        ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT
    });
    const first = walker.nextNode()?.parentElement ?? source;
    const computed = editor.getWin().getComputedStyle(first);
    for (const property of ['font-family', 'font-size', 'font-weight', 'font-style', 'color', 'line-height', 'letter-spacing']) {
      const value = computed.getPropertyValue(property);
      if (marker.style.getPropertyValue(property) !== value) marker.style.setProperty(property, value);
    }
    marker.removeAttribute('data-mce-style');
  }
  for (const old of body.querySelectorAll<HTMLElement>('[data-text-list-host]')) {
    if (!hosts.has(old)) old.removeAttribute('data-text-list-host');
  }
  for (const host of hosts) if (!host.hasAttribute('data-text-list-host')) host.dataset.textListHost = 'true';
}

export function registerTextListMarkers(editor: Editor) {
  const sync = () => syncTextListMarkers(editor);
  // Normalize before undo snapshots and serialization, including older saved documents.
  editor.on('init SetContent BeforeAddUndo BeforeGetContent ExecCommand Undo Redo input change compositionend', sync);
}
