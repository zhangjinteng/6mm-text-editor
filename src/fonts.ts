import catalog from './fonts.generated.json';

/** The names and order mirror 稿定 → 字体 → 热门. Files are served locally. */
export const popularFonts = catalog;
export const defaultFontFamily = 'GD-206607';
export const fontStylesheetUrl = `${import.meta.env.BASE_URL}fonts/gaoding/fonts.css`;
export const fontFamilyFormats = popularFonts.map(font => `${font.name}=GD-${font.id}`).join(';');

export function installFonts(doc: Document) {
  if (doc.querySelector('link[data-project-fonts]')) return;
  const link = doc.createElement('link');
  link.rel = 'stylesheet'; link.href = new URL(fontStylesheetUrl, window.location.href).href;
  link.dataset.projectFonts = 'true'; doc.head.append(link);
}

function includesCharacter(range: string, characters: number[]) {
  return range.split(',').some(part => {
    const [start, end = start] = part.trim().replace(/^U\+/i, '').split('-');
    return characters.some(code => code >= parseInt(start!, 16) && code <= parseInt(end!, 16));
  });
}

/** Embed just the fonts and character slices used by this document for offline HTML. */
export async function embedDocumentFonts(doc: Document) {
  const response = await fetch(fontStylesheetUrl);
  if (!response.ok) throw new Error('无法读取本地字体样式，请重试导出。');
  const css = await response.text();
  const markup = doc.body.outerHTML;
  const families = new Set([defaultFontFamily, ...markup.matchAll(/GD-\d+/g)].map(item => typeof item === 'string' ? item : item[0]));
  const characters = [...new Set(Array.from(doc.body.textContent || '').map(char => char.codePointAt(0)!))];
  const rules = (css.match(/@font-face\s*\{[^}]+\}/g) || []).filter(rule => {
    const family = rule.match(/font-family:\s*['"]?(GD-\d+)/)?.[1];
    const range = rule.match(/unicode-range:\s*([^;}]+)/)?.[1];
    return family && families.has(family) && (!range || includesCharacter(range, characters));
  });
  // Bound concurrency so documents with many fonts don't flood the local server.
  const embedded = new Array<string>(rules.length);
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(8, rules.length) }, async () => {
    while (next < rules.length) {
      const index = next++, rule = rules[index]!;
      const url = rule.match(/url\(['"]?([^)'"\s]+)['"]?\)/)?.[1];
      if (!url) throw new Error('字体资源地址无效。');
      const result = await fetch(new URL(url, new URL(fontStylesheetUrl, window.location.href)));
      if (!result.ok) throw new Error('字体文件加载失败，请重试导出。');
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('读取字体文件失败。'));
        void result.blob().then(blob => reader.readAsDataURL(blob), reject);
      });
      embedded[index] = rule.replace(/url\([^)]+\)/, `url("${dataUrl}")`);
    }
  }));
  doc.querySelectorAll('link[data-project-fonts]').forEach(link => link.remove());
  const style = doc.createElement('style'); style.dataset.projectFonts = 'embedded';
  style.textContent = embedded.join('\n'); doc.head.append(style);
}
