import { appendFile, mkdir, readdir, unlink } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

export type LogLevel = 'info' | 'warn' | 'error';
export type LogFields = Record<string, unknown>;
export interface Diagnostics {
  write: (level: LogLevel, event: string, fields?: LogFields) => void;
  protect: (values: string[]) => void;
}
export const silentDiagnostics: Diagnostics = { write: () => undefined, protect: () => undefined };

/** Append bounded, redacted JSON lines; file failures never interrupt live-session operations. */
export function createDiagnostics(options: {
  directory: string;
  secrets?: string[];
  now?: () => Date;
  console?: (line: string) => void;
}) {
  const directory = resolve(options.directory);
  const secrets = new Set((options.secrets ?? []).filter(Boolean));
  const instanceId = randomUUID();
  const clock = options.now ?? (() => new Date());
  const output = options.console ?? ((line: string) => console.warn(line));
  let pending = Promise.resolve();
  let lastPrunedDay = '';
  let lastWriteFailure = 0;

  /** Redact by both field names and exact configured/runtime credential values. */
  function sanitize(value: unknown, depth = 0): unknown {
    if (depth > 5) return '[truncated]';
    if (typeof value === 'string') {
      let text = value;
      for (const secret of [...secrets].sort((a, b) => b.length - a.length)) text = text.replaceAll(secret, '[redacted]');
      return text.slice(0, 1024);
    }
    if (value instanceof Error) return sanitize({ name: value.name, message: value.message }, depth + 1);
    if (Array.isArray(value)) return value.slice(0, 30).map((item) => sanitize(item, depth + 1));
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).slice(0, 40).map(([key, item]) => [
        key,
        /secret|authorization|cookie|token|identity|access.?key|auth.?body|^(key|owner|code|game_?id)$/i.test(key)
          ? '[redacted]' : sanitize(item, depth + 1)
      ]));
    }
    return typeof value === 'bigint' ? String(value) : value;
  }

  /** Only prune files owned by this logger; unrelated files in .data are never touched. */
  async function prune(date: Date, day: string) {
    if (lastPrunedDay === day) return;
    const cutoff = new Date(date.getTime() - 6 * 86400000).toISOString().slice(0, 10);
    for (const name of await readdir(directory)) {
      const match = /^bilibili-(\d{4}-\d{2}-\d{2})\.jsonl$/.exec(name);
      if (match && match[1] < cutoff) await unlink(join(directory, name)).catch(() => undefined);
    }
    lastPrunedDay = day;
  }

  return {
    directory,
    protect(values: string[]) { for (const value of values) if (value) secrets.add(value); },
    write(level: LogLevel, event: string, fields: LogFields = {}) {
      try {
        const date = clock();
        const day = date.toISOString().slice(0, 10);
        const line = JSON.stringify({ timestamp: date.toISOString(), level, event, pid: process.pid, instanceId, details: sanitize(fields) });
        if (level !== 'info') { try { output(`[bilibili] ${line}`); } catch { /* Console failures must not affect the API. */ } }
        pending = pending.then(async () => {
          await mkdir(directory, { recursive: true, mode: 0o700 });
          await prune(date, day);
          await appendFile(join(directory, `bilibili-${day}.jsonl`), line + '\n', { encoding: 'utf8', mode: 0o600 });
        }).catch(() => {
          // An unwritable disk is reported at most once per minute, without logging the failed data again.
          if (!lastWriteFailure || Date.now() - lastWriteFailure > 60000) {
            lastWriteFailure = Date.now();
            try { output('[bilibili] diagnostic_log_write_failed: unable to write local log file'); } catch { /* Keep the application available. */ }
          }
        });
      } catch { /* Malformed diagnostic fields must never break a live request. */ }
    },
    /** Wait for pending writes during tests and graceful server shutdown. */
    async flush() { await pending; }
  };
}
