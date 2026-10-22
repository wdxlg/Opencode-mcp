// Real ownerSession implementation, mocked transport: no process, engine, model or target is started.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync(new URL('../scripts/rea-bridge.mjs', import.meta.url), 'utf8');
const start = source.indexOf('async function ownerSession('), end = source.indexOf('const upstream =', start);
assert(start >= 0 && end > start);
function fixture() {
  const state = { created: 0, closed: 0, transportClosed: 0, fail: true };
  const context = {
    sessions: new Map(), closing: false, env: {}, root: '/isolated', process: { execPath: 'not-executed' },
    crypto: { randomUUID: () => 'fixture-' + state.created }, sessionDirectory: () => '/isolated/session',
    Client: class {
      constructor() { state.created++; }
      async connect() { if (state.fail) throw new Error('fixture connection failed'); }
      async close() { state.closed++; }
    },
    StdioClientTransport: class { async close() { state.transportClosed++; } }
  };
  const get = vm.runInNewContext(source.slice(start, end) + ';ownerSession', context);
  return { state, context, get };
}
test('failed connections release capacity and close their resources before another attempt', async () => {
  const { state, context, get } = fixture();
  for (let i = 0; i < 10; i++) {
    await assert.rejects(get('owner-' + i));
    assert.equal(context.sessions.size, 0);
    assert.equal(state.closed, i + 1); assert.equal(state.transportClosed, i + 1);
  }
  state.fail = false;
  const session = await get('recovered'); assert.ok(session.id); assert.equal(context.sessions.size, 1);
});
test('concurrent calls for one owner share one live session', async () => {
  const { state, get } = fixture(); state.fail = false;
  const [a, b] = await Promise.all([get('same'), get('same')]);
  assert.equal(a, b); assert.equal(state.created, 1);
});
test('distinct live owners stay isolated and the existing capacity bound remains enforced', async () => {
  const { state, get } = fixture(); state.fail = false;
  const sessions = await Promise.all(Array.from({ length: 8 }, (_, i) => get('owner-' + i)));
  assert.equal(new Set(sessions).size, 8);
  await assert.rejects(get('ninth'), /REA_SESSION_LIMIT/); assert.equal(state.created, 8);
});
test('shutdown does not start a new owner transport', async () => {
  const { state, context, get } = fixture(); state.fail = false; context.closing = true;
  await assert.rejects(get('late'), /REA_SHUTTING_DOWN/); assert.equal(state.created, 0);
});
