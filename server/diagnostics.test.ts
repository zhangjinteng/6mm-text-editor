import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { createDiagnostics } from './diagnostics.ts';

test('writes structured daily records, redacts credentials, and retains only seven days', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'bili-log-test-'));
  const output: string[] = [];
  const logger = createDiagnostics({ directory, secrets: ['credential-secret', 'identity-value'], now: () => new Date('2026-10-28T10:00:00Z'), console: (line) => output.push(line) });
  try {
    await writeFile(join(directory, 'bilibili-2026-10-21.jsonl'), 'old');
    await writeFile(join(directory, 'bilibili-2026-10-22.jsonl'), 'retained');
    await writeFile(join(directory, 'unrelated.txt'), 'do not remove');
    logger.protect(['runtime-ws-token']);
    logger.write('error', 'upstream.request_failed', {
      path: '/v2/app/heartbeat', upstreamCode: 4009, requestId: 'request-one',
      message: 'credential-secret identity-value runtime-ws-token\nsecond line',
      Authorization: 'signed-header', Cookie: 'browser-session',
      nested: { auth_body: 'auth-response', accessKeyId: 'access-id', game_id: 'raw-game-id', code: 'identity-in-body' }
    });
    logger.write('info', 'heartbeat.recovered', { previousFailureCount: 1 });
    await logger.flush();
    const file = join(directory, 'bilibili-2026-10-28.jsonl');
    const text = await readFile(file, 'utf8');
    const records = text.trim().split('\n').map((line) => JSON.parse(line));
    assert.equal(records.length, 2);
    assert.equal(records[0].details.upstreamCode, 4009);
    assert.equal(records[0].timestamp, '2026-10-28T10:00:00.000Z');
    assert.equal(records[0].pid, process.pid);
    assert.equal(records[0].instanceId, records[1].instanceId);
    for (const secret of ['credential-secret', 'identity-value', 'runtime-ws-token', 'signed-header', 'browser-session', 'auth-response', 'access-id', 'raw-game-id', 'identity-in-body']) {
      assert.ok(!text.includes(secret)); assert.ok(!output.join('\n').includes(secret));
    }
    assert.equal(output.length, 1);
    assert.equal((await stat(file)).mode & 0o777, 0o600);
    assert.ok(!(await readdir(directory)).includes('bilibili-2026-10-21.jsonl'));
    assert.equal(await readFile(join(directory, 'bilibili-2026-10-22.jsonl'), 'utf8'), 'retained');
    assert.equal(await readFile(join(directory, 'unrelated.txt'), 'utf8'), 'do not remove');
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('unwritable log destinations and broken console sinks never reject the write queue', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'bili-log-failure-'));
  try {
    const file = join(directory, 'not-a-directory');
    await writeFile(file, 'occupied');
    const output: string[] = [];
    const logger = createDiagnostics({ directory: file, console: (line) => output.push(line) });
    logger.write('info', 'one'); logger.write('info', 'two');
    await assert.doesNotReject(logger.flush());
    assert.equal(output.filter((line) => line.includes('diagnostic_log_write_failed')).length, 1);
    const brokenConsole = createDiagnostics({ directory: join(directory, 'logs'), console: () => { throw new Error('console unavailable'); } });
    assert.doesNotThrow(() => brokenConsole.write('error', 'example'));
    await brokenConsole.flush();
    assert.equal((await readdir(join(directory, 'logs'))).length, 1);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
