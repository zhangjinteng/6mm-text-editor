import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, '6mm-tinymce');
const built = join(source, 'modules/tinymce/js/tinymce');
const target = join(root, 'public/vendor/tinymce');
const mode = process.argv[2] || '--prepare';
if (!['--build', '--prepare', '--sync'].includes(mode)) throw new Error('Expected --build, --prepare, or --sync');
if (!existsSync(join(source, 'modules/tinymce/package.json'))) throw new Error('Missing 6mm-tinymce source checkout. Clone https://github.com/zhangjinteng/6mm-tinymce into this project first.');
const git = (...args) => execFileSync('git', args, { cwd: source, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim();
// Keep the exact local editor fixes reproducible without pushing to the upstream source repo.
const patch = join(root, 'patches/6mm-tinymce.patch');
if (existsSync(patch)) {
  const check = (args) => spawnSync('git', args, { cwd: source, encoding: 'utf8' });
  const applied = check(['apply', '--reverse', '--check', patch]);
  if (applied.status !== 0) {
    const applicable = check(['apply', '--check', patch]);
    if (applicable.status !== 0) throw new Error('Editor patch conflicts with local source changes. Resolve patches/6mm-tinymce.patch before building.');
    git('apply', patch);
  }
}
const commit = git('rev-parse', 'HEAD');

/** Fingerprint local changes as well as HEAD so edits cannot silently use an older editor. */
async function fingerprint() {
  const hash = createHash('sha256').update(commit).update(git('diff', '--binary', 'HEAD'));
  for (const name of git('ls-files', '--others', '--exclude-standard').split('\n').filter(Boolean).sort()) hash.update(name).update(await readFile(join(source, name)));
  return hash.digest('hex');
}

function run(command, args) {
  const result = spawnSync(command, args, { cwd: source, stdio: 'inherit', env: process.env });
  if (result.error) throw new Error(`Unable to run ${command}: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed (${result.status})`);
}

const sourceFingerprint = await fingerprint();
let previous;
try { previous = JSON.parse(await readFile(join(target, 'build-info.json'), 'utf8')); } catch { /* First build. */ }
if (mode === '--build' || (mode === '--prepare' && (!existsSync(join(built, 'tinymce.min.js')) || previous?.sourceFingerprint !== sourceFingerprint))) {
  const bun = process.env.BUN_BIN || 'bun';
  run(bun, ['install', '--frozen-lockfile']);
  run(bun, ['run', 'build']);
}
if (!existsSync(join(built, 'tinymce.min.js'))) throw new Error('Source has not been built. Run pnpm editor:build.');
const version = JSON.parse(await readFile(join(source, 'modules/tinymce/package.json'), 'utf8')).version;
const sha256 = createHash('sha256').update(await readFile(join(built, 'tinymce.min.js'))).digest('hex');
if (mode === '--prepare' && previous?.sourceFingerprint === sourceFingerprint && previous?.sha256 === sha256 && existsSync(join(target, 'langs/zh-CN.js'))) {
  console.log(`[editor] Local 6mm-tinymce ${version} is ready (${commit.slice(0, 7)}).`);
  process.exit(0);
}

// This exclusively generated directory is separate from the source repo and the Bilibili SDK.
await rm(target, { recursive: true, force: true });
await cp(built, target, { recursive: true, filter: (path) => !path.endsWith('.map') });
await mkdir(join(target, 'langs'), { recursive: true });
const i18n = join(root, 'node_modules/tinymce-i18n');
await cp(join(i18n, 'langs8/zh-CN.js'), join(target, 'langs/zh-CN.js'));
for (const name of ['LICENSE.md', 'NOTICE.md']) if (existsSync(join(i18n, name))) await cp(join(i18n, name), join(target, 'langs', name));
await cp(join(source, 'LICENSE.md'), join(target, 'license.md'));
await cp(join(source, 'NOTICES.txt'), join(target, 'notices.txt'));
const plugins = (await readdir(join(target, 'plugins'))).sort();
await writeFile(join(target, 'build-info.json'), JSON.stringify({
  repository: 'https://github.com/zhangjinteng/6mm-tinymce', commit, version,
  sourceFingerprint: await fingerprint(), sha256, plugins, license: 'GPL-2.0-or-later', builtAt: new Date().toISOString()
}, null, 2) + '\n');
console.log(`[editor] Using own-source TinyMCE ${version}, ${plugins.length} plugins, commit ${commit.slice(0, 7)}.`);
