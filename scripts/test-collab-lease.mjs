// Unit tests for external (MCP) execution lease expiry. Pure in-memory fake service; no Bridge, no disk state.
import test from 'node:test';
import assert from 'node:assert/strict';
import { CollaborationRuntime, externalLeaseExpired, EXTERNAL_LEASE_TTL_MS, EXTERNAL_LEASE_COMMAND_TTL_MS } from '../recovered/shared/collaboration-runtime.mjs';

const T0 = Date.parse('2026-11-05T00:00:00.000Z');
const iso = ms => new Date(ms).toISOString();
function makeTask({ id = 'task_1', kind = 'mcp', status = 'running', state = 'running', last = T0, operations = [] } = {}) {
  return { id, status, executionState: status, revision: 3, owner: 'agent_a', lease: 'lease-1', updatedAt: iso(last), output: '', activeAttemptId: 'attempt_x',
    attempts: [{ id: 'attempt_x', kind, state, phase: 'tool-returned', updatedAt: iso(last), operations }] };
}
function makeService(tasks, { enabled = true, options = {} } = {}) {
  const state = { collaborationEnabled: enabled, tasks };
  let mutations = 0;
  return { state, options, get mutations() { return mutations; }, read: () => state, isCollaborationEnabled: s => s.collaborationEnabled === true,
    mutate: async (kind, action) => { assert.equal(kind, 'executions'); mutations++; return action(state); } };
}

test('fresh external lease is not expired', () => {
  assert.equal(externalLeaseExpired(makeTask(), T0 + EXTERNAL_LEASE_TTL_MS - 1), false);
});
test('silent external lease expires after TTL', () => {
  assert.equal(externalLeaseExpired(makeTask(), T0 + EXTERNAL_LEASE_TTL_MS + 1), true);
});
test('native, blocked and unowned attempts never expire here', () => {
  const late = T0 + EXTERNAL_LEASE_COMMAND_TTL_MS * 10;
  assert.equal(externalLeaseExpired(makeTask({ kind: 'native' }), late), false);
  assert.equal(externalLeaseExpired(makeTask({ status: 'blocked' }), late), false);
  const unowned = makeTask(); delete unowned.owner; delete unowned.lease;
  assert.equal(externalLeaseExpired(unowned, late), false);
});
test('a running command extends the window to the command TTL', () => {
  const ops = [{ name: 'run_command', commandState: 'running', startedAt: iso(T0) }];
  assert.equal(externalLeaseExpired(makeTask({ operations: ops }), T0 + EXTERNAL_LEASE_TTL_MS + 1), false);
  assert.equal(externalLeaseExpired(makeTask({ operations: ops }), T0 + EXTERNAL_LEASE_COMMAND_TTL_MS + 1), true);
});
test('latest receipt time counts as activity', () => {
  const ops = [{ name: 'read_files', startedAt: iso(T0), finishedAt: iso(T0 + EXTERNAL_LEASE_TTL_MS) }];
  assert.equal(externalLeaseExpired(makeTask({ operations: ops }), T0 + EXTERNAL_LEASE_TTL_MS + 60000), false);
});
test('sweep blocks expired tasks, keeps owner and lease for resume', async () => {
  const stale = makeTask({ id: 'task_stale' }), fresh = makeTask({ id: 'task_fresh', last: T0 + EXTERNAL_LEASE_TTL_MS });
  const service = makeService([stale, fresh]);
  const ids = await new CollaborationRuntime({ ...service, directory: '/tmp/x' }).expireStaleExternalLeases(T0 + EXTERNAL_LEASE_TTL_MS + 1);
  assert.deepEqual(ids, ['task_stale']);
  assert.equal(stale.status, 'blocked'); assert.equal(stale.executionState, 'blocked'); assert.equal(stale.revision, 4);
  assert.equal(stale.owner, 'agent_a'); assert.equal(stale.lease, 'lease-1');
  assert.equal(stale.attempts[0].state, 'blocked'); assert.equal(stale.attempts[0].phase, 'lease-expired');
  assert.match(stale.output, /租约超时/);
  assert.equal(fresh.status, 'running');
});
test('sweep does nothing when collaboration is disabled or nothing is due', async () => {
  const off = makeService([makeTask()], { enabled: false });
  assert.deepEqual(await new CollaborationRuntime({ ...off, directory: '/tmp/x' }).expireStaleExternalLeases(T0 + EXTERNAL_LEASE_TTL_MS * 4), []);
  const none = makeService([makeTask()]);
  const runtime = new CollaborationRuntime(Object.assign(none, { directory: '/tmp/x' }));
  assert.deepEqual(await runtime.expireStaleExternalLeases(T0 + 1000), []);
  assert.equal(none.mutations, 0);
});
test('TTL can be configured through service options', async () => {
  const task = makeTask();
  const service = makeService([task], { options: { externalLeaseTtlMs: 60000 } });
  assert.deepEqual(await new CollaborationRuntime({ ...service, directory: '/tmp/x' }).expireStaleExternalLeases(T0 + 60001), ['task_1']);
});
test('re-check under the lock skips a task renewed meanwhile', async () => {
  const task = makeTask();
  const service = makeService([task]);
  const mutate = service.mutate;
  service.mutate = async (kind, action) => { task.attempts[0].updatedAt = iso(T0 + EXTERNAL_LEASE_TTL_MS); return mutate(kind, action); };
  assert.deepEqual(await new CollaborationRuntime({ ...service, directory: '/tmp/x', mutate: service.mutate }).expireStaleExternalLeases(T0 + EXTERNAL_LEASE_TTL_MS + 1), []);
  assert.equal(task.status, 'running');
});
