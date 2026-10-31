import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = new URL('../public/fonts/gaoding/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('manifest.json', root), 'utf8'));
const catalog = JSON.parse(await readFile(new URL('../src/fonts.generated.json', import.meta.url), 'utf8'));
const css = await readFile(new URL('fonts.css', root), 'utf8');
const paths = new Set();
let count = 0, bytes = 0;
for (const font of manifest.fonts) {
  if (!catalog.some(item => item.id === font.id && item.name === font.name)) throw new Error(`Catalog mismatch: ${font.name}`);
  if (!css.includes(`font-family:"GD-${font.id}"`)) throw new Error(`Missing CSS: ${font.name}`);
  for (const file of font.files) {
    const data = await readFile(new URL(file.path, root));
    const signature = data.subarray(0, 4).toString('hex');
    if (!['774f4646', '774f4632', '00010000', '4f54544f'].includes(signature)) throw new Error(`Invalid font: ${file.path}`);
    if (data.length !== file.bytes || createHash('sha256').update(data).digest('hex') !== file.sha256) throw new Error(`Corrupt font: ${file.path}`);
    paths.add(`./${file.path}`); count++; bytes += data.length;
  }
}
if (manifest.fonts.length !== catalog.length) throw new Error('Font count mismatch');
const referenced = new Set([...css.matchAll(/url\("([^"]+)"\)/g)].map(match => match[1]));
if (referenced.size !== paths.size || [...referenced].some(path => !paths.has(path))) throw new Error('CSS asset references do not match manifest');
console.log(`Verified ${catalog.length} fonts, ${count} files, ${(bytes / 1024 / 1024).toFixed(1)} MiB. All hashes and local CSS references match.`);
