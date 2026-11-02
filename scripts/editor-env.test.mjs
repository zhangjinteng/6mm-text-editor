import assert from 'node:assert/strict';
import { test } from 'node:test';
import { delimiter, join } from 'node:path';
import { editorBuildEnv } from './editor-env.mjs';

test('nested editor builds do not inherit the app package-manager identity or workspace', () => {
  const inherited = {
    PATH: '/app/node_modules/.bin:/usr/bin', INIT_CWD: '/app', PNPM_SCRIPT_SRC_DIR: '/app',
    npm_config_user_agent: 'pnpm/11.12.0', npm_execpath: '/pnpm/bin/pnpm.cjs', npm_node_execpath: '/node',
    npm_command: 'run-script', npm_lifecycle_event: 'dev', npm_lifecycle_script: 'node scripts/editor.mjs --prepare',
    npm_package_json: '/app/package.json', npm_package_name: 'app', npm_config_local_prefix: '/app',
    NPM_CONFIG_USER_AGENT: 'pnpm/11.12.0', npm_config_workspace: 'app',
    npm_config_registry: 'https://registry.npmjs.org', HTTPS_PROXY: 'http://proxy.local:8080'
  };
  const original = { ...inherited };
  const env = editorBuildEnv('/app/6mm-tinymce', inherited);
  assert.deepEqual(env, {
    PATH: [join('/app/6mm-tinymce', 'node_modules', '.bin'), inherited.PATH].join(delimiter),
    INIT_CWD: '/app/6mm-tinymce', npm_config_registry: inherited.npm_config_registry, HTTPS_PROXY: inherited.HTTPS_PROXY
  });
  assert.deepEqual(inherited, original);
});

test('direct and IDE invocations also expose the editor workspace binaries', () => {
  assert.deepEqual(editorBuildEnv('/editor', { BUN_BIN: '/custom/bun' }), {
    BUN_BIN: '/custom/bun', INIT_CWD: '/editor', PATH: join('/editor', 'node_modules', '.bin')
  });
});
