// Opt-in regression suite. Do not run as part of generation or against a live profile.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { AutomationService, AUTOMATION_TOOL_DEFINITIONS } from '../recovered/shared/automation-store.mjs';

const owner = 'mcp:rules-scope-regression';
async function fixture(run) {
  const temp = await fs.mkdtemp(path.join(os.tmpdir(), 'opencode-rules-scope-'));
  const previousHome = process.env.OPENCODE_AUTOMATION_HOME;
  process.env.OPENCODE_AUTOMATION_HOME = path.join(temp, 'rules');
  const root = path.join(temp, 'workspace');
  const outside = path.join(temp, 'external');
  const nested = path.join(root, 'nested');
  let service;
  try {
    service = new AutomationService({
      directory: path.join(temp, 'rules'), currentRoot: () => root,
      workspaces: () => [{ root }, { root: nested }],
      initialText: () => 'Isolated global fixture rules.',
      workspaceLegacy: value => value === root ? 'Isolated workspace fixture rules.' : undefined,
      trusted: () => true
    });
    await service.initialize();
    await run({ service, root, outside, nested });
  } finally {
    service?.dispose();
    if (previousHome === undefined) delete process.env.OPENCODE_AUTOMATION_HOME;
    else process.env.OPENCODE_AUTOMATION_HOME = previousHome;
    // dispose 后服务可能还有一次异步落盘，Windows 上 rmdir 会报 ENOTEMPTY；重试清理，不影响断言。
    await fs.rm(temp, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 });
  }
}
function acknowledge(service, who, id) {
  const rules = service.getRules(who, id);
  return service.acknowledge(who, rules.workspace_id, rules.rules_hash);
}
async function targetRules(service, target, who = owner) {
  return (await service.handleTool('bridge_get_effective_rules', { target_arguments: target }, who)).structuredContent;
}

test('rules scope regression (isolated, explicit opt-in)', async t => {
  await t.test('legacy response remains compatible; target schema is discoverable', () => fixture(async ({ service }) => {
    const reply = await service.handleTool('bridge_get_effective_rules', {}, owner);
    assert.equal(reply.structuredContent.workspace_id, service.currentWorkspaceId());
    assert.ok(reply.structuredContent.rules_hash);
    assert.ok(AUTOMATION_TOOL_DEFINITIONS.find(x => x.name === 'bridge_get_effective_rules').inputSchema.properties.target_arguments);
  }));
  await t.test('workspace acknowledgement never silently covers external/global scope', () => fixture(async ({ service, outside }) => {
    acknowledge(service, owner, service.currentWorkspaceId());
    await assert.rejects(service.guard('run_command', { cwd: outside }, owner), error => {
      assert.equal(error.code, 'RULES_ACK_REQUIRED');
      assert.equal(error.details.workspace_id, 'global');
      assert.deepEqual(error.details.get_arguments, { workspace_id: 'global' });
      assert.match(error.message, /workspace_id="global"/);
      assert.match(error.message, /bridge_get_effective_rules/);
      return true;
    });
    const result = await targetRules(service, { cwd: outside });
    assert.deepEqual(result.target_workspace_ids, ['global']);
    assert.equal(result.rules[0].workspace_id, 'global');
    assert.equal(service.acknowledged.has(service.key(owner, 'global')), false);
    for (const rules of result.rules) service.acknowledge(owner, rules.workspace_id, rules.rules_hash);
    // guard only: no command is spawned and no external directory is accessed.
    await assert.doesNotReject(service.guard('run_command', { cwd: outside }, owner));
  }));
  await t.test('global acknowledgement never silently covers workspace or another caller', () => fixture(async ({ service, root, outside }) => {
    acknowledge(service, owner, 'global');
    await assert.rejects(service.guard('run_command', { cwd: root }, owner), { code: 'RULES_ACK_REQUIRED' });
    await assert.rejects(service.guard('run_command', { cwd: outside }, 'mcp:other-caller'), { code: 'RULES_ACK_REQUIRED' });
    const rules = service.effective('global', 'mcp:other-caller');
    assert.throws(() => service.acknowledge('mcp:other-caller', 'global', rules.rules_hash), { code: 'RULES_STALE' });
  }));
  await t.test('mixed files, nested roots, and boundary-adjacent paths use guard resolution', () => fixture(async ({ service, root, nested, outside }) => {
    const args = { files: [{ path: path.join(root, 'a.txt') }, { path: path.join(nested, 'b.txt') }, { path: path.join(outside, 'c.txt') }] };
    const result = await targetRules(service, args);
    assert.deepEqual(result.target_workspace_ids, service.targetIds(args, owner));
    assert.equal(result.rules.length, 3);
    assert.equal(new Set(result.target_workspace_ids).size, 3);
    const adjacent = await targetRules(service, { path: root + '-other/file.txt' });
    assert.deepEqual(adjacent.target_workspace_ids, ['global']);
    for (const rules of result.rules) service.acknowledge(owner, rules.workspace_id, rules.rules_hash);
    await assert.doesNotReject(service.guard('read_files', args, owner));
  }));
  await t.test('patch and relative-path previews use the same resolver', () => fixture(async ({ service, root, outside }) => {
    for (const args of [{ path: 'relative.txt' }, { patch: `*** Begin Patch\n*** Update File: ${path.join(root, 'a.txt')}\n*** Move to: ${path.join(outside, 'b.txt')}\n*** End Patch` }]) {
      const result = await targetRules(service, args);
      assert.deepEqual(result.target_workspace_ids, service.targetIds(args, owner));
      assert.deepEqual(result.rules.map(r => r.workspace_id), result.target_workspace_ids);
    }
  }));
  await t.test('changed global policy invalidates old acknowledgement; fresh ack preserves read-only policy', () => fixture(async ({ service, outside }) => {
    const old = service.getRules(owner, 'global');
    service.acknowledge(owner, 'global', old.rules_hash);
    await service.mutate('regression-fixture', state => {
      const preset = state.presets.find(p => p.id === state.globalPresetId);
      preset.policies.readOnly = true;
      preset.version++;
    });
    await assert.rejects(service.guard('run_command', { cwd: outside }, owner), { code: 'RULES_ACK_REQUIRED' });
    assert.throws(() => service.acknowledge(owner, 'global', old.rules_hash), { code: 'RULES_STALE' });
    acknowledge(service, owner, 'global');
    await assert.rejects(service.guard('run_command', { cwd: outside }, owner), { code: 'POLICY_READ_ONLY' });
  }));
  await t.test('ambiguous selectors, unknown scopes and protected ledger paths remain rejected', () => fixture(async ({ service }) => {
    await assert.rejects(service.handleTool('bridge_get_effective_rules', { workspace_id: 'global', target_arguments: {} }, owner), { code: 'RULES_TARGET_AMBIGUOUS' });
    await assert.rejects(targetRules(service, { workspace_id: 'not-a-registered-workspace' }), { code: 'WORKSPACE_UNKNOWN' });
    await assert.rejects(targetRules(service, { path: service.file }), { code: 'POLICY_RULE_STORE_PROTECTED' });
  }));
});
