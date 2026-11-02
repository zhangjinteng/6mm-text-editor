import { delimiter, join } from 'node:path';

/** The editor is a separate Bun workspace, even when launched by the app's pnpm scripts. */
export function editorBuildEnv(source, inherited = process.env) {
  const env = { ...inherited };
  for (const key of Object.keys(env)) {
    if (/^npm_(execpath|node_execpath|command|lifecycle_.*|package_.*)$/i.test(key)
      || /^npm_config_(user_agent|local_prefix|prefix|workspace|workspaces|filter)$/i.test(key)
      || key === 'PNPM_SCRIPT_SRC_DIR') delete env[key];
  }
  env.INIT_CWD = source;
  env.PATH = [join(source, 'node_modules', '.bin'), env.PATH].filter(Boolean).join(delimiter);
  return env;
}
