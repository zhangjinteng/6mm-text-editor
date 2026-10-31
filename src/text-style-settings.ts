import { ensureSource, textSource } from './text-advanced';

type Toggle = 'on' | 'off' | 'mixed';
export interface TextStyleSettings {
  styleBold: Toggle; styleItalic: Toggle; styleUnderline: Toggle; styleStrike: Toggle;
  styleScript: 'normal' | 'sub' | 'super' | 'mixed';
  textAlign: string; lineHeight: string; letterSpacing: string;
}
export interface PlainTextStyle { fontFamily: string; fontSize: string; textColor: string; lineHeight: string }
const styleKeys = ['styleBold', 'styleItalic', 'styleUnderline', 'styleStrike'] as const;
export const defaultTextStyle: TextStyleSettings = {
  styleBold: 'off', styleItalic: 'off', styleUnderline: 'off', styleStrike: 'off', styleScript: 'normal',
  textAlign: 'start', lineHeight: '1.5', letterSpacing: '0'
};
function textElements(box: HTMLElement): HTMLElement[] {
  const source = textSource(box), walker = box.ownerDocument.createTreeWalker(source, NodeFilter.SHOW_TEXT);
  const elements = new Set<HTMLElement>();
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.textContent?.trim() && !node.parentElement?.closest('[data-mce-bogus],[data-text-render],[data-text-background-render]')) elements.add(node.parentElement!);
  }
  return elements.size ? [...elements] : [source];
}
export function readTextStyle(box: HTMLElement): TextStyleSettings {
  const view = box.ownerDocument.defaultView!, elements = textElements(box);
  const common = (values: string[], fallback = 'mixed') => new Set(values).size === 1 ? values[0]! : fallback;
  const hasDecoration = (element: HTMLElement, token: string) => {
    for (let node: HTMLElement | null = element; node && box.contains(node); node = node.parentElement) {
      if (view.getComputedStyle(node).textDecorationLine.includes(token)) return true;
    }
    return false;
  };
  const toggle = (predicate: (element: HTMLElement) => boolean) => common(elements.map(el => predicate(el) ? 'on' : 'off')) as Toggle;
  const computed = view.getComputedStyle(box);
  const height = parseFloat(computed.lineHeight) / parseFloat(computed.fontSize);
  return {
    styleBold: toggle(el => parseInt(view.getComputedStyle(el).fontWeight) >= 600),
    styleItalic: toggle(el => /italic|oblique/.test(view.getComputedStyle(el).fontStyle)),
    styleUnderline: toggle(el => hasDecoration(el, 'underline')),
    styleStrike: toggle(el => hasDecoration(el, 'line-through')),
    styleScript: common(elements.map(el => {
      for (let node: HTMLElement | null = el; node && box.contains(node); node = node.parentElement) {
        const align = view.getComputedStyle(node).verticalAlign;
        if (align === 'sub' || align === 'super') return align;
      }
      return 'normal';
    })) as TextStyleSettings['styleScript'],
    textAlign: computed.textAlign,
    lineHeight: Number.isFinite(height) ? String(Math.round(height * 100) / 100) : '1.2',
    letterSpacing: common(elements.map(el => String(parseFloat(view.getComputedStyle(el).letterSpacing) || 0)), '')
  };
}
export function validateTextStyle(s: TextStyleSettings): string {
  if (!styleKeys.every(key => ['on', 'off', 'mixed'].includes(s[key])) || !['normal', 'sub', 'super', 'mixed'].includes(s.styleScript)
    || !['start', 'end', 'left', 'center', 'right', 'justify', '-webkit-auto'].includes(s.textAlign)) return '请选择有效的文字样式。';
  if (!s.lineHeight.trim() || !Number.isFinite(Number(s.lineHeight)) || Number(s.lineHeight) < 0.5 || Number(s.lineHeight) > 5) return '行距倍数须在 0.5—5 之间。';
  if (s.letterSpacing !== '' && (!s.letterSpacing.trim() || !Number.isFinite(Number(s.letterSpacing)) || Number(s.letterSpacing) < -10 || Number(s.letterSpacing) > 100)) return '字间距须在 -10—100 px 之间。';
  return '';
}
/** Replace semantic tags without throwing away links, colors or other attributes. */
function neutralize(source: HTMLElement, selector: string) {
  for (const node of source.querySelectorAll<HTMLElement>(selector)) {
    const span = source.ownerDocument.createElement('span');
    for (const attribute of node.attributes) if (!attribute.name.startsWith('data-mce-')) span.setAttribute(attribute.name, attribute.value);
    span.append(...node.childNodes); node.replaceWith(span);
  }
}
export function applyTextStyle(box: HTMLElement, draft: TextStyleSettings, initial: TextStyleSettings) {
  const keys = [...styleKeys, 'styleScript', 'textAlign', 'lineHeight', 'letterSpacing'] as const;
  if (!keys.some(key => draft[key] !== initial[key])) return;
  const source = ensureSource(box);
  const nodes = () => [box, source, ...source.querySelectorAll<HTMLElement>('*')];
  for (const [key, tags, property, on, off] of [
    ['styleBold', 'b,strong', 'font-weight', '700', '400'],
    ['styleItalic', 'i,em', 'font-style', 'italic', 'normal']
  ] as const) {
    if (draft[key] === initial[key] || draft[key] === 'mixed') continue;
    neutralize(source, tags);
    nodes().forEach(node => node.style.removeProperty(property));
    box.style.setProperty(property, draft[key] === 'on' ? on : off);
  }
  for (const [key, tags, token] of [['styleUnderline', 'u', 'underline'], ['styleStrike', 's,strike,del', 'line-through']] as const) {
    if (draft[key] === initial[key] || draft[key] === 'mixed') continue;
    neutralize(source, tags);
    for (const node of nodes()) {
      const tokens = node.style.textDecorationLine.split(/\s+/).filter(value => value && value !== token && value !== 'none');
      node.style.textDecorationLine = tokens.join(' ') || 'none';
    }
    if (draft[key] === 'on') box.style.textDecorationLine = [...new Set([...box.style.textDecorationLine.split(/\s+/).filter(value => value !== 'none'), token])].join(' ');
  }
  if (draft.styleScript !== initial.styleScript && draft.styleScript !== 'mixed') {
    neutralize(source, 'sub,sup');
    nodes().forEach(node => { if (['sub', 'super'].includes(node.style.verticalAlign)) { node.style.removeProperty('vertical-align'); node.style.removeProperty('font-size'); } });
    if (draft.styleScript !== 'normal') {
      const script = box.ownerDocument.createElement(draft.styleScript === 'sub' ? 'sub' : 'sup');
      script.append(...source.childNodes); source.append(script);
    }
  }
  for (const [key, property, unit] of [['textAlign', 'text-align', ''], ['lineHeight', 'line-height', ''], ['letterSpacing', 'letter-spacing', 'px']] as const) {
    if (draft[key] === initial[key] || draft[key] === '') continue;
    nodes().forEach(node => node.style.removeProperty(property));
    box.style.setProperty(property, draft[key] + unit);
  }
  nodes().forEach(node => node.removeAttribute('data-mce-style'));
}

/** Clear character formatting while preserving geometry, effects, animation and rich content. */
export function clearTextStyle(box: HTMLElement, plain: PlainTextStyle) {
  const source = ensureSource(box);
  neutralize(source, 'b,strong,i,em,u,s,strike,del,sub,sup,font');
  const properties = ['font-family', 'font-size', 'color', 'font-weight', 'font-style', 'text-decoration', 'text-decoration-line', 'vertical-align', 'letter-spacing', 'line-height'];
  for (const node of [box, source, ...source.querySelectorAll<HTMLElement>('*')]) {
    properties.forEach(property => node.style.removeProperty(property));
    if (node !== box || box.dataset.textBackground !== 'true') node.style.removeProperty('background-color');
    node.removeAttribute('data-selection-heading'); node.removeAttribute('data-mce-style');
    for (const name of ['face', 'size', 'color', 'bgcolor']) node.removeAttribute(name);
  }
  Object.assign(box.style, { fontFamily: plain.fontFamily, fontSize: `${plain.fontSize}px`, color: plain.textColor, lineHeight: plain.lineHeight,
    fontWeight: '400', fontStyle: 'normal', textDecoration: 'none', letterSpacing: '0px' });
}
