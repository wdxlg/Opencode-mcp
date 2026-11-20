// recovered.33 collaboration v2 checks. Local-only: temp dirs, temp HOME/profile and OPENCODE_AUTOMATION_HOME,
// in-process service objects (fake services as in test-collab-lease.mjs, plus a real AutomationService on a
// temp rules directory for persisted rule ACKs). No app launch, no Bridge, no network, no git, no real user data.
// Policy gates are only *evaluated* here; no command in this file is ever executed.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// 系统 TEMP 可能就在受保护的 E:/OpenCode 下（便携版 data/tmp），那样所有临时路径都会被默认门禁拦下；改到仓库 generated/tmp。
const tempBase = /^[a-z]:[\\/]opencode[\\/]/i.test(os.tmpdir()) ? path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([a-z]:)/i, '$1')), '..', 'generated', 'tmp') : os.tmpdir();
fs.mkdirSync(tempBase, { recursive: true });
const temp = fs.mkdtempSync(path.join(tempBase, 'opencode-collab-v2-'));
process.once('exit', () => fs.rmSync(temp, { recursive: true, force: true }));
for (const key of ['HOME', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA', 'XDG_CONFIG_HOME', 'XDG_DATA_HOME']) {
  const dir = path.join(temp, 'profile', key); fs.mkdirSync(dir, { recursive: true }); process.env[key] = dir;
}
process.env.OPENCODE_AUTOMATION_HOME = path.join(temp, 'automation-default');
for (const key of Object.keys(process.env)) if (key.startsWith('OPENCODE_COLLAB_')) delete process.env[key];

const shared = rel => import(pathToFileURL(path.join(root, 'recovered/shared', rel)).href);
const policyMod = await shared('collaboration-policy.mjs');
const { CollaborationPolicy, resolveLimits, collaborationLimits, waitForChange, LIMIT_DEFAULTS, LIMIT_MAXIMA, LIMIT_ENV,
  TOOL_GATES_FILE, WORKSPACE_TOOL_GATES_FILE, LIMITS_FILE, LIMIT_EXTENSIONS_FILE, CALLER_ACKS_FILE, GATE_EVENTS_FILE } = policyMod;
const { CollaborationRuntime } = await shared('collaboration-runtime.mjs');
const { publicAgentId } = await shared('collaboration-contracts.mjs');
const { AutomationService } = await shared('automation-store.mjs');

let seq = 0;
const mkdir = name => { const dir = path.join(temp, `${name}-${++seq}`); fs.mkdirSync(dir, { recursive: true }); return dir; };
const writeJson = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(value, null, 2)); };
const delay = ms => new Promise(r => setTimeout(r, ms));
async function atomic(file, value) { fs.mkdirSync(path.dirname(file), { recursive: true }); const tmp = `${file}.${crypto.randomUUID()}.tmp`; fs.writeFileSync(tmp, JSON.stringify(value, null, 2) + '\n'); fs.renameSync(tmp, file); }
function policyFor(directory, settings) { return new CollaborationPolicy({ directory, options: { collaborationLimits: () => settings, log() {} }, atomic, emit() {} }); }
function codeOf(fn) { try { fn(); } catch (error) { return error; } return null; }
async function until(check, ms = 3000) { const end = Date.now() + ms; while (Date.now() < end) { if (check()) return true; await delay(25); } return check(); }

test('isolation guard: all state directories live under the temp root', () => {
  for (const key of ['HOME', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA', 'OPENCODE_AUTOMATION_HOME']) assert(process.env[key].startsWith(temp), key);
});

// ---------------------------------------------------------------- policy gates
// default.deny-git-push 已在 2599e7d6 按要求删除：git 命令都不再受默认门禁限制。
test('git commands, including git push, are not gated by default', () => {
  const p = policyFor(mkdir('gate-push'));
  for (const command of ['git push', 'git push origin main', 'git status', 'git log --oneline -5', 'git diff', 'npm test']) assert.equal(p.evaluate('run_command', { command }), null, command);
  const error = codeOf(() => p.check('write_file', { path: 'E:/OpenCode/x.txt' }, 'mcp:owner-push'));
  assert.equal(error?.code, 'POLICY_DENIED');
  assert.equal(error.details.rule, 'default.deny-official-install-write');
  assert.equal(error.details.tool, 'write_file');
});

test('default gate denies file-tool writes under E:/OpenCode (any spelling) but not the recovery checkout next to it', () => {
  const p = policyFor(mkdir('gate-write'));
  const denied = [
    ['write_file', { path: 'E:/OpenCode/resources/app/x.js' }], ['write_file', { path: 'e:\\OpenCode\\x.txt' }], ['edit_file', { file_path: '/e/OpenCode/a.json' }],
    ['apply_patch', { patch: '*** Begin Patch\n*** Add File: E:/OpenCode/new.txt\n+x\n*** End Patch' }],
    // default.deny-official-install-command-write 已在 92f7204a（权限改造）删除，命令写入不再由默认门禁判断。
  ];
  for (const [tool, args] of denied) assert.equal(p.evaluate(tool, args)?.effect, 'deny', `${tool} ${JSON.stringify(args)}`);
  const allowed = [
    ['write_file', { path: 'E:/OpenCode-Source-Recovery-20261013/scripts/x.mjs' }], ['write_file', { path: path.join(temp, 'ok.txt') }],
    ['run_command', { command: 'type E:\\OpenCode\\readme.txt' }], ['run_command', { command: 'rm -rf E:/OpenCode-Source-Recovery-20261013/generated/tmp' }]
  ];
  for (const [tool, args] of allowed) assert.equal(p.evaluate(tool, args), null, `${tool} ${JSON.stringify(args)}`);
});

// default.deny-stop-opencode / default.deny-kill-protected-process 已按用户决定删除（2026-11-18 确认保留）：结束进程不再受默认门禁限制。
test('stopping processes is not gated by default (stop/kill gates removed)', () => {
  const p = policyFor(mkdir('gate-kill'));
  for (const command of ['taskkill /IM OpenCode.exe /F', 'Stop-Process -Name OpenCode', 'pkill -f opencode', 'taskkill /PID 4194303 /F']) assert.equal(p.evaluate('run_command', { command }), null, command);
  assert.equal(p.evaluate('ext__windows__process', { mode: 'kill', name: 'OpenCode.exe' }), null);
  assert.equal(p.evaluate('ext__windows__process', { mode: 'list' }), null);
});

test('model tools cannot edit gate/limit files, by file tool or by command', () => {
  const dir = mkdir('gate-files'), ws = mkdir('gate-files-ws');
  const p = policyFor(dir);
  for (const file of [path.join(dir, TOOL_GATES_FILE), path.join(dir, LIMITS_FILE), path.join(dir, LIMIT_EXTENSIONS_FILE), path.join(ws, WORKSPACE_TOOL_GATES_FILE)]) {
    assert.equal(p.evaluate('write_file', { path: file })?.rule, 'default.deny-policy-file-edit', file);
  }
  assert.equal(p.evaluate('run_command', { command: 'notepad collaboration-limits.v1.json' })?.rule, 'default.deny-policy-file-command');
  assert.equal(p.evaluate('run_command', { command: 'Set-Content .opencode-project/tool-gates.json "{}"' })?.effect, 'deny');
});

test('denials are logged to the gate event file with a hashed owner only', () => {
  const dir = mkdir('gate-events'), owner = 'mcp:RAW_OWNER_CANARY_42';
  const p = policyFor(dir);
  assert.throws(() => p.check('write_file', { path: 'E:/OpenCode/x.txt' }, owner), e => e.code === 'POLICY_DENIED');
  const raw = fs.readFileSync(path.join(dir, GATE_EVENTS_FILE), 'utf8');
  assert(!raw.includes('RAW_OWNER_CANARY_42'));
  const events = p.recentEvents(10);
  assert.equal(events.at(-1).effect, 'deny'); assert.equal(events.at(-1).rule, 'default.deny-official-install-write'); assert.match(events.at(-1).owner, /^[0-9a-f]{16}$/);
});

test('workspace tool-gates.json can only tighten: it adds deny rules and protected paths, never disables defaults', () => {
  const dir = mkdir('gate-ws'), ws = mkdir('gate-ws-root');
  writeJson(path.join(ws, WORKSPACE_TOOL_GATES_FILE), {
    disabled_default_rules: ['default.deny-policy-file-edit', 'default.deny-official-install-write'],
    replace_default_protected: true,
    protected: { paths: ['D:/Secret'] },
    rules: [{ id: 'allow-everything', effect: 'allow', tools: ['*'] }, { id: 'no-publish', effect: 'deny', tools: ['run_command'], command_regex: 'npm\\s+publish', reason: 'workspace forbids publishing' }]
  });
  const p = policyFor(dir), opts = { workspaceRoot: ws };
  assert.equal(p.evaluate('write_file', { path: path.join(ws, WORKSPACE_TOOL_GATES_FILE) }, opts)?.rule, 'default.deny-policy-file-edit');
  assert.equal(p.evaluate('write_file', { path: 'E:/OpenCode/x' }, opts)?.effect, 'deny', 'replace_default_protected is ignored in a workspace file');
  const publish = p.evaluate('run_command', { command: 'npm publish --access public' }, opts);
  assert.equal(publish?.rule, 'workspace:no-publish'); assert.equal(publish.source, 'workspace');
  assert.equal(p.evaluate('write_file', { path: 'D:/Secret/keys.txt' }, opts)?.effect, 'deny', 'workspace may add protected paths');
  assert.equal(p.evaluate('write_file', { path: 'D:/Secret/keys.txt' }), null, 'workspace additions apply only to that workspace');
  const eff = p.effectivePolicy(ws);
  assert(eff.sources.some(s => s.kind === 'workspace' && s.add_only === true));
  assert(eff.warnings.some(w => w.includes('allow-everything')), 'an allow rule is rejected with a warning');
  assert(eff.protected.paths.includes('E:/OpenCode'));
  const view = p.publicPolicy(ws);
  assert.equal(view.editable_by_model, false);
  assert.doesNotThrow(() => JSON.stringify(view));
});

test('only the user global file may loosen defaults; a broken global file keeps the defaults', () => {
  const loose = mkdir('gate-global');
  writeJson(path.join(loose, TOOL_GATES_FILE), { disabled_default_rules: ['default.deny-official-install-write'] });
  assert.equal(policyFor(loose).evaluate('write_file', { path: 'E:/OpenCode/x.txt' }), null);
  const broken = mkdir('gate-broken');
  fs.writeFileSync(path.join(broken, TOOL_GATES_FILE), '{ not json');
  const p = policyFor(broken);
  assert.equal(p.evaluate('write_file', { path: 'E:/OpenCode/x.txt' })?.rule, 'default.deny-official-install-write');
  assert(p.effectivePolicy().warnings.some(w => /POLICY_FILE_INVALID/.test(w)));
});

test('ask rules require approval of the identical call; no approval channel means deny', () => {
  const dir = mkdir('gate-ask');
  writeJson(path.join(dir, TOOL_GATES_FILE), { rules: [{ id: 'ask-install', effect: 'ask', tools: ['run_command'], command_regex: 'npm\\s+install', reason: 'confirm installs' }] });
  const p = policyFor(dir), args = { command: 'npm install left-pad' };
  const ask = codeOf(() => p.check('run_command', args, 'mcp:a'));
  assert.equal(ask?.code, 'POLICY_ASK_REQUIRED'); assert.match(ask.details.fingerprint, /^[0-9a-f]{32}$/);
  p.approve('mcp:a', ask.details.fingerprint);
  assert.equal(p.check('run_command', args, 'mcp:a')?.approved, true);
  assert.equal(codeOf(() => p.check('run_command', { command: 'npm install other' }, 'mcp:a'))?.code, 'POLICY_ASK_REQUIRED', 'approval is per identical call');
  assert.equal(codeOf(() => p.check('run_command', args, 'mcp:b'))?.code, 'POLICY_ASK_REQUIRED', 'approval is per owner');
  assert.equal(codeOf(() => p.check('run_command', args, 'mcp:c', { askAvailable: false }))?.code, 'POLICY_DENIED');
});

// ---------------------------------------------------------------- real AutomationService: gate wiring + persisted ACKs
async function realService(directory, wsRoot) {
  const svc = new AutomationService({ directory, leaseSweep: false, currentRoot: () => wsRoot, workspaces: () => [{ root: wsRoot, name: 'collab-v2-test' }], log() {} });
  assert.equal(path.resolve(svc.directory), path.resolve(directory));
  return svc;
}

test('AutomationService.checkToolGates applies defaults and the current workspace file', async () => {
  const saved = process.env.OPENCODE_AUTOMATION_HOME; delete process.env.OPENCODE_AUTOMATION_HOME;
  const dir = mkdir('svc-gates'), ws = mkdir('svc-gates-ws');
  writeJson(path.join(ws, WORKSPACE_TOOL_GATES_FILE), { rules: [{ id: 'no-publish', effect: 'deny', tools: ['run_command'], command_regex: 'npm\\s+publish' }] });
  const svc = await realService(dir, ws);
  try {
    await svc.initialize();
    assert.equal(codeOf(() => svc.checkToolGates('write_file', { path: 'E:/OpenCode/x.txt' }, 'mcp:svc'))?.code, 'POLICY_DENIED');
    assert.equal(codeOf(() => svc.checkToolGates('run_command', { command: 'npm publish' }, 'mcp:svc'))?.details?.rule, 'workspace:no-publish');
    assert.equal(svc.checkToolGates('run_command', { command: 'git status' }, 'mcp:svc'), null);
    const view = svc.toolGatesView({}, 'mcp:svc');
    assert.equal(view.editable_by_model, false);
    assert.equal(view.collaboration_limits.modelRequestsPerAttempt, LIMIT_DEFAULTS.modelRequestsPerAttempt);
  } finally { svc.dispose(); process.env.OPENCODE_AUTOMATION_HOME = saved; }
});

test('rules ACK is persisted per caller identity, survives a service restart and is invalidated by a new rules_hash', async () => {
  const saved = process.env.OPENCODE_AUTOMATION_HOME; delete process.env.OPENCODE_AUTOMATION_HOME;
  const dir = mkdir('svc-acks'), ws = mkdir('svc-acks-ws');
  const owner = 'mcp:session-1:RAW_ACK_CANARY', srcA = 'mcp:conn-1:assistant-source:BINDING_X', srcB = 'mcp:conn-2:assistant-source:BINDING_X', nativeAuto = 'native-chat:automation:job-1';
  const first = await realService(dir, ws);
  let second;
  try {
    await first.initialize();
    const wsId = first.currentWorkspaceId();
    const ack = who => { const rules = first.getRules(who, wsId); first.acknowledge(who, rules.workspace_id, rules.rules_hash); return rules.rules_hash; };
    const hash = ack(owner); ack(srcA); ack(nativeAuto);
    assert.equal(first.getRules(owner, wsId).rules_hash, hash);
    assert(await until(() => first.policy.persistedAck(owner, wsId) === hash && first.policy.persistedAck('assistant-source:BINDING_X', wsId) === hash), 'ACK file written');
    const raw = fs.readFileSync(path.join(dir, CALLER_ACKS_FILE), 'utf8');
    assert(!raw.includes('RAW_ACK_CANARY') && !raw.includes('BINDING_X'), 'identities are stored hashed');
    second = await realService(dir, ws); // simulated restart: fresh in-memory maps, same rules directory
    assert.equal(second.isAcknowledged(owner, wsId, hash), true);
    assert.equal(second.isAcknowledged('mcp:session-2:other', wsId, hash), false, 'another caller is not covered');
    assert.equal(second.isAcknowledged(srcB, wsId, hash), true, 'same assistant-source binding shares the ACK across connections');
    assert.equal(second.isAcknowledged(nativeAuto, wsId, hash), false, 'native automation owners are never persisted');
    assert.equal(second.isAcknowledged(owner, wsId, 'f'.repeat(64)), false, 'a changed rules_hash needs a new ACK');
    assert.equal(second.rulesAckState(owner, wsId)?.acknowledged, true);
  } finally { first.dispose(); second?.dispose(); process.env.OPENCODE_AUTOMATION_HOME = saved; }
});

// ---------------------------------------------------------------- lease / revision auto-fill (fake service)
function handleRuntime(tasks) {
  const state = { collaborationEnabled: true, tasks };
  return { state, runtime: new CollaborationRuntime({ directory: mkdir('handles'), options: {}, read: () => state, isCollaborationEnabled: s => s.collaborationEnabled === true }) };
}
const A = 'mcp:owner-a', B = 'mcp:owner-b', C = 'mcp:owner-c';
const card = (id, owner, extra = {}) => ({ id, title: id, status: owner ? 'running' : 'queued', revision: 3, owner: owner ? publicAgentId(owner) : undefined, lease: owner ? `lease-${id}` : undefined, attempts: [], activeAttemptId: owner ? `attempt-${id}` : undefined, ...extra });

test('lease, task_id and expected_revision are auto-filled when the caller holds exactly one task', () => {
  const { runtime } = handleRuntime([card('job_a', A), card('job_b', B), card('job_q', null)]);
  const { args, normalized } = runtime.fillTaskHandles('bridge_update_task', { status: 'review' }, A);
  assert.equal(args.task_id, 'job_a'); assert.equal(args.lease, 'lease-job_a'); assert.equal(args.expected_revision, 3);
  assert.equal(normalized.length, 3);
  const claim = runtime.fillTaskHandles('bridge_claim_task', { task_id: 'job_q' }, C);
  assert.equal(claim.args.expected_revision, 3); assert.equal(claim.args.lease, undefined);
  const explicit = runtime.fillTaskHandles('bridge_update_task', { task_id: 'job_a', lease: 'given', expected_revision: 1 }, A);
  assert.deepEqual([explicit.args.lease, explicit.args.expected_revision, explicit.normalized.length], ['given', 1, 0], 'explicit values pass through unchanged');
});

test('ambiguity is explicit: TASK_LEASE_AMBIGUOUS / TASK_AMBIGUOUS with candidates, TASK_NOT_OWNED without', () => {
  const { runtime, state } = handleRuntime([card('job_a', A), card('job_b', B)]);
  const lease = codeOf(() => runtime.fillTaskHandles('bridge_update_task', { task_id: 'job_b' }, A));
  assert.equal(lease?.code, 'TASK_LEASE_AMBIGUOUS');
  assert.deepEqual(lease.details.candidates.map(c => c.task_id), ['job_a']);
  assert.equal(codeOf(() => runtime.fillTaskHandles('bridge_update_task', { task_id: 'job_b' }, C))?.code, 'TASK_NOT_OWNED');
  assert.equal(codeOf(() => runtime.fillTaskHandles('bridge_update_task', {}, C))?.code, 'TASK_NOT_OWNED');
  state.tasks.push(card('job_a2', A));
  const two = codeOf(() => runtime.fillTaskHandles('bridge_update_task', {}, A));
  assert.equal(two?.code, 'TASK_AMBIGUOUS');
  assert.deepEqual(two.details.candidates.map(c => c.task_id).sort(), ['job_a', 'job_a2']);
  assert.equal(runtime.fillTaskHandles('bridge_update_task', { task_id: 'job_a2' }, A).args.lease, 'lease-job_a2', 'naming one owned task still fills its lease');
  assert.equal(codeOf(() => runtime.fillTaskHandles('bridge_update_task', { task_id: 'job_missing' }, A))?.details?.handle_kind, 'unknown');
});

test('omitted expected_revision: merged when only non-conflict fields changed, TASK_VERSION_CONFLICT when status/owner/lease changed', () => {
  const { runtime, state } = handleRuntime([card('job_a', A)]);
  const task = state.tasks[0];
  runtime.noteRead(A, ['job_a']);
  task.revision = 4; task.output = 'progress only';
  const merged = runtime.fillTaskHandles('bridge_update_task', { task_id: 'job_a' }, A);
  assert.equal(merged.args.expected_revision, 4);
  assert(merged.normalized.some(n => n.includes('无冲突字段变化')));
  runtime.noteRead(A, ['job_a']);
  task.revision = 5; task.status = 'blocked';
  const conflict = codeOf(() => runtime.fillTaskHandles('bridge_update_task', { task_id: 'job_a' }, A));
  assert.equal(conflict?.code, 'TASK_VERSION_CONFLICT');
  assert.equal(conflict.details.current_revision, 5); assert.equal(conflict.details.last_read_revision, 4);
  runtime.forget(A);
  assert.equal(runtime.fillTaskHandles('bridge_update_task', { task_id: 'job_a' }, A).args.expected_revision, 5, 'with no recorded read the current revision is used');
});

// ---------------------------------------------------------------- aliases (module-0143 normalizeBridgeAliases, sliced from source)
function loadAliasNormalizer() {
  const source = fs.readFileSync(path.join(root, 'recovered/esm/000-extension.js/module-0143.mjs'), 'utf8');
  const begin = source.indexOf('var TODO_STATUS_ALIASES'), end = source.indexOf('function attachNormalized', begin);
  assert(begin >= 0 && end > begin, 'alias normalizer not found in module-0143.mjs');
  return new Function(source.slice(begin, end) + '\nreturn normalizeBridgeAliases;')();
}

test('alias normalization for collaboration and task-card tools reports every rewrite', () => {
  const normalize = loadAliasNormalizer();
  const upd = normalize('bridge_update_task', { task_id: 'job_a', state: 'review', revision: 4, execution_lease: 'L1' });
  assert.deepEqual(upd.args, { task_id: 'job_a', status: 'review', expected_revision: 4, lease: 'L1' });
  assert.deepEqual(upd.notes, ['state → status', 'revision → expected_revision', 'execution_lease → lease']);
  assert.deepEqual(normalize('bridge_update_task', { status: 'completed', state: 'blocked' }).args, { status: 'completed', state: 'blocked' }, 'canonical field wins; alias is left alone');
  assert.deepEqual(normalize('bridge_claim_task', { task_id: 'x', task_revision: 2 }).args, { task_id: 'x', expected_revision: 2 });
  const todos = normalize('set_todos', { items: ['写测试', { content: '跑检查', state: 'done' }, { text: '交接', completed: false, extra: 1 }, { id: 7, title: 't', status: 'Doing' }], state: 'completed' });
  assert.deepEqual(todos.args.todos, [
    { title: '写测试', status: 'pending', id: 'step-1' }, { title: '跑检查', status: 'completed', id: 'step-2' },
    { title: '交接', status: 'pending', id: 'step-3' }, { id: '7', title: 't', status: 'in_progress' }
  ]);
  assert.equal(todos.args.lifecycle, 'completed');
  assert(todos.notes.includes('items → todos') && todos.notes.some(n => n.includes('extra 已忽略')));
  assert.equal(normalize('set_todos', { mode: 'patch', todos: [{ title: 'x', status: 'todo' }] }).args.todos[0].id, undefined, 'patch mode never invents ids');
  assert.deepEqual(normalize('update_plan', { steps: [{ title: 'x', status: 'doing' }] }).args.plan, [{ step: 'x', status: 'in_progress' }]);
  assert.deepEqual(normalize('ext__peer__set_todos', { tasks: [{ name: 'n', status: 'finished' }] }).args.todos, [{ title: 'n', status: 'completed', id: 'step-1' }]);
  const untouched = { files: [{ path: 'a' }], state: 'x' };
  const read = normalize('read_files', untouched);
  assert.equal(read.args, untouched); assert.deepEqual(read.notes, []);
});

// ---------------------------------------------------------------- bridge_wait_messages (fake service, real runtime)
function messageService() {
  const dir = mkdir('wait'), file = path.join(dir, 'rules-and-collaboration.v1.json'); fs.writeFileSync(file, '{}');
  const state = { collaborationEnabled: true, tasks: [], messages: [], messageSequence: 0, agents: {} };
  const listeners = new Set();
  const service = {
    directory: dir, file, options: {}, read: () => state, isCollaborationEnabled: s => s.collaborationEnabled === true,
    async mutate(kind, action) { const value = await action(state); for (const l of listeners) l(kind); return value; },
    onDidChange(l) { listeners.add(l); return () => listeners.delete(l); }, emit(kind) { for (const l of listeners) l(kind); }, emitMessage() {},
    snapshot: () => ({ agents: [] }), role: () => null, currentWorkspaceId: () => 'ws_test',
    task(s, id) { const t = s.tasks.find(x => x.id === id); if (!t) throw Object.assign(new Error('TASK_UNKNOWN'), { code: 'TASK_UNKNOWN' }); return t; }
  };
  state.tasks.push({ id: 'job_w', title: 'w', workspaceId: 'ws_test', status: 'running', revision: 1, owner: publicAgentId(B), lease: 'L', createdBy: 'local-user', attempts: [], activeAttemptId: null });
  state.tasks.push({ id: 'job_other', title: 'o', workspaceId: 'ws_test', status: 'running', revision: 1, owner: publicAgentId(C), lease: 'L2', createdBy: 'local-user', attempts: [], activeAttemptId: null });
  return { service, state, runtime: new CollaborationRuntime(service), listeners };
}

test('bridge_wait_messages wakes on a sent message well before the 5 s fallback and before timeout', async () => {
  const { runtime, state, listeners } = messageService();
  const started = Date.now();
  const waiting = runtime.waitMessages({ workspace_id: 'ws_test', timeout_ms: 10000 }, B);
  setTimeout(() => { void runtime.sendMessage({ task_id: 'job_w', recipient: publicAgentId(B), kind: 'finding', text: 'WAKE_CANARY' }, 'local-user'); }, 300);
  const r = await waiting;
  assert.equal(r.timed_out, false);
  assert.equal(r.messages.length, 1); assert.equal(r.messages[0].text, 'WAKE_CANARY');
  assert(r.wakeups >= 1);
  assert(Date.now() - started < 4000, `woke after ${Date.now() - started} ms; the event path must beat the 5 s fallback`);
  assert.equal(r.next_sequence, 1);
  assert.equal(state.messages[0].state, 'delivered');
  assert.equal(listeners.size, 0, 'the change subscription is released after waking');
  const immediate = await runtime.waitMessages({ workspace_id: 'ws_test', timeout_ms: 10000 }, B);
  assert.equal(immediate.wakeups, 0, 'an already-queued message returns without waiting');
});

test('bridge_wait_messages times out cleanly, ignores other recipients, honours after_sequence, abort and watch_tasks', async () => {
  const { runtime, state, service, listeners } = messageService();
  const t0 = Date.now();
  const idle = await runtime.waitMessages({ workspace_id: 'ws_test', timeout_ms: 400 }, B);
  assert.equal(idle.timed_out, true); assert.deepEqual(idle.messages, []); assert(Date.now() - t0 >= 350 && Date.now() - t0 < 3000);
  const other = runtime.waitMessages({ workspace_id: 'ws_test', timeout_ms: 700 }, B);
  setTimeout(() => { void runtime.sendMessage({ task_id: 'job_other', recipient: publicAgentId(C), kind: 'finding', text: 'NOT_FOR_B' }, 'local-user'); }, 100);
  const o = await other;
  assert.equal(o.timed_out, true); assert(o.wakeups >= 1, 'woken by the change but nothing for B');
  await runtime.sendMessage({ task_id: 'job_w', recipient: publicAgentId(B), kind: 'question', text: 'Q1' }, 'local-user');
  const seqNow = state.messageSequence;
  assert.equal((await runtime.waitMessages({ workspace_id: 'ws_test', timeout_ms: 300, after_sequence: seqNow }, B)).timed_out, true);
  assert.equal((await runtime.waitMessages({ workspace_id: 'ws_test', timeout_ms: -5 }, B)).timed_out, false, 'negative timeout clamps to 0 and returns queued Q1 immediately');
  const ctrl = new AbortController(); setTimeout(() => ctrl.abort(), 100);
  const t1 = Date.now(), aborted = await runtime.waitMessages({ workspace_id: 'ws_test', timeout_ms: 10000, after_sequence: seqNow }, B, ctrl.signal);
  assert.equal(aborted.aborted, true); assert(Date.now() - t1 < 3000);
  const watch = runtime.waitMessages({ workspace_id: 'ws_test', timeout_ms: 10000, after_sequence: seqNow, watch_tasks: [{ task_id: 'job_w', revision: 1 }] }, B);
  setTimeout(() => { void service.mutate('tasks', s => { s.tasks[0].revision = 2; s.tasks[0].status = 'blocked'; }); }, 150);
  const w = await watch;
  assert.equal(w.timed_out, false); assert.deepEqual(w.changed_tasks.map(c => [c.task_id, c.revision, c.status]), [['job_w', 2, 'blocked']]);
  assert.equal(listeners.size, 0);
});

test('waitForChange resolves on subscribe, on a watched file change, on fallback and on timeout; never busy-polls', async () => {
  let fire; const subscribe = l => { fire = l; return () => { fire = null; }; };
  const p = waitForChange({ subscribe, timeoutMs: 5000, fallbackMs: 0 }); setTimeout(() => fire?.(), 50);
  assert.equal(await p, 'change'); assert.equal(fire, null, 'unsubscribed on resolve');
  const dir = mkdir('wfc'), file = path.join(dir, 'state.json'); fs.writeFileSync(file, '1');
  const fsWait = waitForChange({ files: [file], timeoutMs: 5000, fallbackMs: 0 }); setTimeout(() => fs.writeFileSync(file, '22'), 100);
  assert.equal(await fsWait, 'fs');
  assert.equal(await waitForChange({ timeoutMs: 1000, fallbackMs: 50 }), 'fallback');
  assert.equal(await waitForChange({ timeoutMs: 50, fallbackMs: 0 }), 'timeout');
  const ctrl = new AbortController(); ctrl.abort();
  assert.equal(await waitForChange({ timeoutMs: 1000, signal: ctrl.signal }), 'aborted');
});

// ---------------------------------------------------------------- limits + extendLimit
test('limits precedence: env > settings > rules-dir file > defaults, clamped to maxima, invalid values ignored', () => {
  const dir = mkdir('limits');
  writeJson(path.join(dir, LIMITS_FILE), { modelRequestsPerAttempt: 20, nativeExecutorSlots: 3, managerSlots: 99, integrationMaxFiles: 'abc', integrationMaxFileKiB: 0 });
  const saved = {}; for (const env of Object.values(LIMIT_ENV)) { saved[env] = process.env[env]; delete process.env[env]; }
  try {
    const fileOnly = resolveLimits(dir);
    assert.equal(fileOnly.modelRequestsPerAttempt, 20); assert.equal(fileOnly.sources.modelRequestsPerAttempt, 'file');
    assert.equal(fileOnly.managerSlots, LIMIT_MAXIMA.managerSlots, 'clamped to maximum');
    assert.equal(fileOnly.integrationMaxFiles, LIMIT_DEFAULTS.integrationMaxFiles); assert.equal(fileOnly.integrationMaxFileKiB, LIMIT_DEFAULTS.integrationMaxFileKiB);
    const withSettings = resolveLimits(dir, { nativeExecutorSlots: 5, modelRequestsPerAttempt: '30' });
    assert.equal(withSettings.nativeExecutorSlots, 5); assert.equal(withSettings.sources.nativeExecutorSlots, 'settings');
    assert.equal(withSettings.modelRequestsPerAttempt, 30);
    process.env[LIMIT_ENV.modelRequestsPerAttempt] = '40'; process.env[LIMIT_ENV.nativeExecutorSlots] = '0'; process.env[LIMIT_ENV.integrationMaxTotalKiB] = '999999';
    const withEnv = resolveLimits(dir, { nativeExecutorSlots: 5, modelRequestsPerAttempt: 30 });
    assert.equal(withEnv.modelRequestsPerAttempt, 40); assert.equal(withEnv.sources.modelRequestsPerAttempt, 'env');
    assert.equal(withEnv.nativeExecutorSlots, 5, 'env 0 is invalid and ignored');
    assert.equal(withEnv.integrationMaxTotalKiB, LIMIT_MAXIMA.integrationMaxTotalKiB);
    assert.deepEqual(Object.keys(resolveLimits()).sort(), Object.keys(LIMIT_DEFAULTS).sort(), '`sources` is non-enumerable');
    const p = policyFor(dir, { managerSlots: 2 });
    assert.equal(p.limits().managerSlots, 2);
    assert.equal(collaborationLimits().managerSlots, 2, 'module-level limits follow the most recently constructed policy');
    assert.equal(collaborationLimits().modelRequestsPerAttempt, 40);
  } finally { for (const env of Object.values(LIMIT_ENV)) { if (saved[env] === undefined) delete process.env[env]; else process.env[env] = saved[env]; } }
});

test('extendLimit is local-user only, additive, validated, persisted in its own file, and raises the request cap', async () => {
  const dir = mkdir('extend'), p = policyFor(dir);
  const attemptId = 'attempt_' + crypto.randomUUID(), runId = 'team_' + crypto.randomUUID();
  await assert.rejects(p.extend({ kind: 'attempt-model-requests', attempt_id: attemptId, by: 6 }, 'mcp:model'), e => e.code === 'LIMIT_EXTEND_LOCAL_ONLY');
  await assert.rejects(p.extend({ kind: 'attempt-model-requests', attempt_id: 'attempt_bogus', by: 6 }), e => e.code === 'LIMIT_EXTEND_INVALID');
  await assert.rejects(p.extend({ kind: 'attempt-model-requests', attempt_id: attemptId, by: 0 }), e => e.code === 'LIMIT_EXTEND_INVALID');
  await assert.rejects(p.extend({ kind: 'reset-everything' }), e => e.code === 'LIMIT_EXTEND_INVALID');
  assert.equal((await p.extend({ kind: 'attempt-model-requests', attempt_id: attemptId, by: 6 })).totals.by, 6);
  assert.equal((await p.extend({ kind: 'attempt-model-requests', attempt_id: attemptId, by: 4 })).totals.by, 10, 'extensions add up');
  assert.equal(p.extraRequests('attempts', attemptId), 10);
  await p.extend({ kind: 'integration', run_id: runId, files: 5, total_kib: 128 });
  assert.deepEqual(p.integrationExtra(runId), { files: 5, fileKiB: 0, totalKiB: 128 });
  const stored = JSON.parse(fs.readFileSync(path.join(dir, LIMIT_EXTENSIONS_FILE), 'utf8'));
  assert.equal(stored.format, 'opencode.collaboration-limit-extensions'); assert.equal(stored.attempts[attemptId].history.length, 2);
  const runtime = new CollaborationRuntime({ directory: dir, options: {}, policy: p, read: () => ({ tasks: [] }) });
  const base = collaborationLimits().modelRequestsPerAttempt;
  assert.deepEqual(runtime.requestCap({ maxTurns: 12 }, { id: attemptId }), { base, extension: 10, total: base + 10 });
  assert.equal(runtime.requestCap({ maxTurns: 5 }, { id: attemptId }).base, Math.min(5, base));
  const reason = p.blockReason('attempt-model-requests', { attempt_id: attemptId });
  assert.equal(reason.code, 'LIMIT_REACHED'); assert.equal(reason.extend.model_tool, false);
});

test.after(() => { fs.rmSync(temp, { recursive: true, force: true }); });
