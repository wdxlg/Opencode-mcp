// 工作（work-store）与自动化（autopilot-store）检查。Local-only and deterministic: temp dirs, temp HOME/profile and
// OPENCODE_AUTOMATION_HOME; no app launch, no network, no real user data. On Windows it additionally:
//   - runs the generated PowerShell launcher against a temp pointer (deferral / nothing-due / install_moved branches;
//     the branch that starts OpenCode is never exercised here);
//   - registers ONE real scheduled task named "OpenCode Automations TEST-<random>" and deletes it in the same test.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-work-auto-'));
process.once('exit', () => fs.rmSync(temp, { recursive: true, force: true }));
for (const key of ['HOME', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA', 'XDG_CONFIG_HOME', 'XDG_DATA_HOME']) {
  const dir = path.join(temp, 'profile', key); fs.mkdirSync(dir, { recursive: true }); process.env[key] = dir;
}
process.env.OPENCODE_AUTOMATION_HOME = path.join(temp, 'automation-default');
const shared = rel => import(pathToFileURL(path.join(root, 'recovered/shared', rel)).href);
const W = await shared('work-store.mjs');
const A = await shared('autopilot-store.mjs');
const { WorkStore, handleWorkTool, actorForOwner, WORK_TOOL_NAMES, WORK_BRIDGE_RULE } = W;
const { AutopilotStore, WindowsTaskScheduler, parseCron, nextCronAfter, nextPlanned, previewSchedule, describeSchedule, runKey, taskXml, launcherPs1Source } = A;

let seq = 0;
const mkdir = name => { const dir = path.join(temp, `${name}-${++seq}`); fs.mkdirSync(dir, { recursive: true }); return dir; };
const codeOf = fn => { try { fn(); } catch (error) { return error.code; } return null; };
const agent = { kind: 'agent', id: 'mcp:test-agent', name: '测试代理' };
const user = { kind: 'user', id: 'user', name: '我' };
const hasGit = (() => { try { execFileSync('git', ['--version'], { stdio: 'ignore' }); return true; } catch { return false; } })();

test('isolation guard: all state directories live under the temp root', () => {
  for (const key of ['HOME', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA', 'OPENCODE_AUTOMATION_HOME']) assert(process.env[key].startsWith(temp), key);
  assert(W.sharedAutomationRoot().startsWith(temp));
  assert(A.defaultLauncherDirectory().startsWith(temp));
});

// ------------------------------------------------------------------ work store
test('work: create / CAS update / conflict / atomic file', () => {
  const store = new WorkStore({ directory: mkdir('work') });
  const item = store.create({ title: '修复登录', description: '验收：能登录', projectName: '网站' }, user);
  assert.equal(item.status, 'todo'); assert.equal(item.revision, 1); assert.equal(item.number, 1);
  assert.equal(store.projects()[0].name, '网站');
  const next = store.update(item.id, { expected_revision: 1, priority: 'high', comment: '先看日志' }, user);
  assert.equal(next.revision, 2); assert.equal(next.comments.length, 1);
  assert.equal(codeOf(() => store.update(item.id, { expected_revision: 1, title: '旧版本' }, user)), 'WORK_REVISION_CONFLICT');
  assert.equal(codeOf(() => store.update(item.id, { title: '缺版本' }, user)), 'WORK_REVISION_REQUIRED');
  const unchanged = store.update(item.id, { expected_revision: 2, priority: 'high' }, user);
  assert.equal(unchanged.unchanged, true); assert.equal(store.get(item.id).revision, 2);
  const files = fs.readdirSync(path.dirname(store.file));
  assert(!files.some(f => f.endsWith('.tmp')), 'no temp files left'); assert(!files.some(f => f.includes('.lock')), 'lock released');
  // a second store instance (another window / process) sees the same data
  const other = new WorkStore({ directory: path.dirname(path.dirname(store.file)) });
  assert.equal(other.get(item.id).priority, 'high');
});

test('work: Multica semantics — done is user-only, blocked needs a reason, in_review needs a summary', () => {
  const store = new WorkStore({ directory: mkdir('work') });
  const item = store.create({ title: '写周报' }, user);
  assert.equal(codeOf(() => store.create({ title: 'x', status: 'done' }, agent)), 'WORK_DONE_USER_ONLY');
  assert.equal(codeOf(() => store.update(item.id, { expected_revision: 1, status: 'done' }, agent)), 'WORK_DONE_USER_ONLY');
  assert.equal(codeOf(() => store.update(item.id, { expected_revision: 1, status: 'blocked' }, agent)), 'WORK_BLOCKED_REASON_REQUIRED');
  const claimed = store.claim(item.id, agent, { taskId: 'task_1' });
  assert.equal(claimed.status, 'in_progress'); assert.equal(claimed.assignee.id, agent.id); assert.equal(claimed.taskId, 'task_1'); assert(claimed.startedAt);
  const other = { kind: 'agent', id: 'mcp:other', name: '另一个代理' };
  assert.equal(codeOf(() => store.claim(item.id, other)), 'WORK_ITEM_TAKEN');
  assert.equal(codeOf(() => store.update(item.id, { expected_revision: claimed.revision, status: 'in_review' }, agent)), 'WORK_SUMMARY_REQUIRED');
  const review = store.update(item.id, { expected_revision: claimed.revision, status: 'in_review', summary: '已写好，见 docs/weekly.md' }, agent);
  assert.equal(review.status, 'in_review'); assert.equal(review.delivery.summary, '已写好，见 docs/weekly.md');
  assert.equal(review.comments.filter(c => c.kind === 'delivery').length, 1);
  const blocked = store.update(item.id, { expected_revision: review.revision, status: 'blocked', blockedReason: '缺少数据源权限' }, agent);
  assert.equal(blocked.blockedReason, '缺少数据源权限');
  const done = store.update(item.id, { expected_revision: blocked.revision, status: 'done' }, user);
  assert.equal(done.status, 'done'); assert(done.completedAt); assert.equal(done.blockedReason, '');
  assert.equal(codeOf(() => store.claim(item.id, agent)), 'WORK_ITEM_CLOSED');
  assert(done.activity.some(a => a.action === 'status' && a.detail.includes('已完成')));
});

test('work: in_review with only a comment uses it as the summary once', () => {
  const store = new WorkStore({ directory: mkdir('work') });
  const item = store.claim(store.create({ title: 't' }, user).id, agent);
  const r = store.update(item.id, { expected_revision: item.revision, status: 'in_review', comment: '完成：改了 a.js' }, agent);
  assert.equal(r.delivery.summary, '完成：改了 a.js'); assert.equal(r.comments.length, 1);
});

test('work: git baseline at in_progress and diff stat at in_review', { skip: !hasGit && 'git not available' }, () => {
  const repo = mkdir('repo');
  const git = (...args) => execFileSync('git', ['-C', repo, ...args], { stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' });
  git('init', '-q'); git('config', 'user.email', 't@example.invalid'); git('config', 'user.name', 'test'); git('config', 'commit.gpgsign', 'false');
  fs.writeFileSync(path.join(repo, 'a.txt'), 'one\n'); git('add', '.'); git('commit', '-q', '-m', 'init');
  const store = new WorkStore({ directory: mkdir('work') });
  const project = store.saveProject({ name: '仓库', folder: repo });
  const item = store.claim(store.create({ title: 'git', projectId: project.id }, user).id, agent);
  assert.match(item.git.baseline, /^[0-9a-f]{40}$/);
  fs.appendFileSync(path.join(repo, 'a.txt'), 'two\nthree\n');
  const r = store.update(item.id, { expected_revision: item.revision, status: 'in_review', summary: '加了两行' }, agent);
  assert.match(r.delivery.diffStat, /1 file changed, 2 insertions/);
  assert(r.comments.at(-1).body.includes('改动统计'));
});

test('work: Bridge tool handler (list/get/create/update/claim) and caller identities', () => {
  const store = new WorkStore({ directory: mkdir('work') });
  assert.deepEqual([...WORK_TOOL_NAMES], ['work_list', 'work_get', 'work_create', 'work_update', 'work_claim']);
  const me = actorForOwner('mcp:abc');
  assert.equal(me.kind, 'agent'); assert.equal(actorForOwner('native-chat:1234').kind, 'session');
  const ctx = { actor: me, taskIdFor: () => 'task_42' };
  const created = handleWorkTool(store, 'work_create', { title: '查 CI', project: '基础设施' }, ctx).item;
  assert.equal(created.project, '基础设施');
  const listed = handleWorkTool(store, 'work_list', {}, ctx);
  assert.equal(listed.items.length, 1); assert.equal(listed.rule, WORK_BRIDGE_RULE);
  assert.equal(handleWorkTool(store, 'work_list', { mine: true }, ctx).items.length, 0);
  const claimed = handleWorkTool(store, 'work_claim', { id: created.id }, ctx);
  assert.equal(claimed.item.status, 'in_progress'); assert.equal(claimed.item.task_id, 'task_42');
  assert.equal(handleWorkTool(store, 'work_list', { mine: true }, ctx).items.length, 1);
  const got = handleWorkTool(store, 'work_get', { id: created.id }, ctx);
  assert(got.activity.length >= 2);
  assert.equal(codeOf(() => handleWorkTool(store, 'work_update', { id: created.id, expected_revision: got.revision, status: 'done' }, ctx)), 'WORK_DONE_USER_ONLY');
  const delivered = handleWorkTool(store, 'work_update', { id: created.id, expected_revision: got.revision, status: 'in_review', summary: 'CI 绿了' }, ctx);
  assert.equal(delivered.item.status, 'in_review'); assert.equal(delivered.delivery.summary, 'CI 绿了');
  // pure Q&A: a comment-only update keeps the status
  const qa = handleWorkTool(store, 'work_update', { id: created.id, expected_revision: delivered.item.revision, comment: '答：是 node 22' }, ctx);
  assert.equal(qa.item.status, 'in_review');
  assert.equal(codeOf(() => handleWorkTool(store, 'work_list', { project: '不存在' }, ctx)), 'WORK_PROJECT_UNKNOWN');
});

test('work: AutomationService exposes the work tools without a rules ACK and lists them in bridge_start', async () => {
  const { AutomationService, AUTOMATION_TOOL_DEFINITIONS } = await shared('automation-store.mjs');
  const names = AUTOMATION_TOOL_DEFINITIONS.map(t => t.name);
  for (const n of ['work_list', 'work_get', 'work_create', 'work_update', 'work_claim', 'automation_list', 'automation_run_now']) assert(names.includes(n), n);
  const directory = mkdir('rules'), wsRoot = mkdir('ws');
  const svc = new AutomationService({ directory, leaseSweep: false, currentRoot: () => wsRoot, workspaces: () => [{ root: wsRoot, name: 'work-test' }], log() {} });
  await svc.initialize?.();
  const store = new WorkStore({ directory });
  svc.workBoard = { handleTool: async (name, args, owner) => handleWorkTool(store, name, args, { actor: actorForOwner(owner) }) };
  const owner = 'mcp:work-test';
  const created = await svc.handleTool('work_create', { title: '通过 Bridge 创建' }, owner);
  assert.equal(created.isError, undefined); assert.equal(created.structuredContent.item.title, '通过 Bridge 创建');
  const listed = await svc.handleTool('work_list', {}, owner);
  assert.equal(listed.structuredContent.items.length, 1);
  const started = svc.start(owner, {});
  assert(started.next_steps.includes(WORK_BRIDGE_RULE));
  assert(started.next_steps.join('\n').length < 1200, 'bridge_start next_steps stays small');
  svc.workBoard = null;
  await assert.rejects(() => svc.handleTool('work_list', {}, owner), /WORK_UNAVAILABLE/);
  svc.dispose?.();
});

// ------------------------------------------------------------------ schedules
const TZ = 'Asia/Shanghai';
const at = s => Date.parse(s);
test('autopilot: cron in Asia/Shanghai, shorthands, interval, end date', () => {
  assert.equal(new Date(nextCronAfter('0 9 * * *', TZ, at('2026-11-13T10:00:00Z'))).toISOString(), '2026-11-14T01:00:00.000Z');
  assert.equal(new Date(nextCronAfter('30 18 * * 1-5', TZ, at('2026-11-13T10:00:00Z'))).toISOString(), '2026-11-13T10:30:00.000Z');
  assert.equal(new Date(nextCronAfter('0 9 * * 7', TZ, at('2026-11-13T10:00:00Z'))).toISOString(), '2026-11-15T01:00:00.000Z');
  assert.equal(new Date(nextCronAfter('@daily', TZ, at('2026-11-13T10:00:00Z'))).toISOString(), '2026-11-13T16:00:00.000Z');
  assert.equal(new Date(nextCronAfter('0 0 1 * *', TZ, at('2026-11-13T10:00:00Z'))).toISOString(), '2026-11-30T16:00:00.000Z');
  assert.equal(new Date(nextCronAfter('0 2 * * *', 'America/New_York', at('2026-03-08T00:00:00Z'))).toISOString(), '2026-03-09T06:00:00.000Z', 'skips the nonexistent DST hour');
  assert.throws(() => parseCron('61 * * * *'), /CRON_INVALID/); assert.throws(() => parseCron('* * *'), /CRON_INVALID/);
  const interval = { schedule: { kind: 'interval', everyMinutes: 90, startAt: '2026-11-13T00:00:00Z', timezone: TZ }, createdAt: '2026-11-13T00:00:00Z' };
  assert.equal(new Date(nextPlanned(interval, at('2026-11-13T01:00:00Z'))).toISOString(), '2026-11-13T01:30:00.000Z');
  const ending = { schedule: { kind: 'cron', cron: '0 9 * * *', timezone: TZ }, endAt: '2026-11-15T00:00:00Z', createdAt: '2026-11-13T00:00:00Z' };
  assert.equal(previewSchedule(ending, at('2026-11-13T10:00:00Z'), 5).length, 1);
  assert.equal(describeSchedule({ kind: 'cron', cron: '0 9 * * 1,3' }), '每周一、三 09:00');
  assert.equal(describeSchedule({ kind: 'interval', everyMinutes: 120 }), '每 2 小时');
});

function automationInput(folder, extra = {}) { return { name: '晨报', prompt: '汇总昨天的提交', folder, mode: 'run_only', schedule: { kind: 'cron', cron: '0 9 * * *', timezone: TZ }, ...extra }; }
test('autopilot: missed-run policy run_latest (default) runs once and skips older; skip_missed skips all', () => {
  let now = at('2026-11-10T00:30:00Z');
  const store = new AutopilotStore({ directory: mkdir('ap'), now: () => now });
  const a = store.save(automationInput(mkdir('folder')));
  const b = store.save(automationInput(mkdir('folder'), { name: '跳过型', missedPolicy: 'skip_missed' }));
  assert.equal(store.plan().length, 0, 'nothing due yet');
  now = at('2026-11-13T02:00:00Z'); // 11-10, 11-11, 11-12, 11-13 09:00 Shanghai passed
  const plans = store.plan();
  const pa = plans.find(p => p.automation.id === a.id), pb = plans.find(p => p.automation.id === b.id);
  assert.equal(new Date(pa.run).toISOString(), '2026-11-13T01:00:00.000Z'); assert.equal(pa.skip.length, 3);
  assert.equal(pb.run, null, 'latest slot is 1h old > grace'); assert.equal(pb.skip.length, 4);
  now = at('2026-11-13T01:05:00Z');
  assert.notEqual(store.plan().find(p => p.automation.id === b.id).run, null, 'within grace window it still runs');
  // a slot already recorded (e.g. by the launcher as install_moved) is not run again
  store.appendRun({ id: 'run_x', automationId: a.id, key: runKey(a.id, at('2026-11-13T01:00:00Z')), plannedAt: '2026-11-13T01:00:00.000Z', status: 'skipped', reason: 'install_moved' });
  now = at('2026-11-13T02:00:00Z');
  const again = store.plan().find(p => p.automation.id === a.id);
  assert.equal(new Date(again.run).toISOString(), '2026-11-12T01:00:00.000Z', 'falls back to the latest unrecorded slot');
  store.patchState(a.id, { cursor: new Date(pa.cursor).toISOString() });
  assert.equal(store.plan().find(p => p.automation.id === a.id), undefined, 'cursor advanced');
  // disabled / ended automations are never due
  store.setEnabled(b.id, false);
  assert.equal(store.plan().length, 0);
});

test('autopilot: per-run idempotency claim, run history merge, interrupted recovery', () => {
  const store = new AutopilotStore({ directory: mkdir('ap') });
  const key = runKey('auto_1', at('2026-11-13T01:00:00Z'));
  assert.equal(store.claim(key, 'instance-a'), true);
  assert.equal(store.claim(key, 'instance-b'), false, 'second claimant loses');
  store.appendRun({ id: 'run_1', automationId: 'auto_1', key, plannedAt: '2026-11-13T01:00:00.000Z', status: 'running', startedAt: new Date().toISOString(), pid: 999999 });
  store.appendRun({ id: 'run_2', automationId: 'auto_1', key: 'k2', plannedAt: '2026-11-12T01:00:00.000Z', status: 'running', startedAt: new Date().toISOString(), pid: process.pid });
  store.recoverInterrupted(r => r.pid === process.pid);
  const runs = store.runs();
  assert.equal(runs.find(r => r.id === 'run_1').status, 'failed'); assert.equal(runs.find(r => r.id === 'run_1').reason, 'interrupted');
  assert.equal(runs.find(r => r.id === 'run_2').status, 'running');
  assert(store.terminalKeys().has(key));
});

test('autopilot: single-instance scheduler lock with stale takeover', () => {
  let now = Date.now();
  const store = new AutopilotStore({ directory: mkdir('ap'), now: () => now });
  assert.equal(store.acquireLock('A', {}), true);
  assert.equal(store.acquireLock('B', {}), false, 'fresh lock held by a live pid');
  assert.equal(store.acquireLock('A', {}), true, 'holder refreshes');
  now += 4 * 60000;
  assert.equal(store.acquireLock('B', {}), true, 'stale heartbeat is taken over');
  assert.equal(store.acquireLock('C', {}, () => true), false);
  store.releaseLock('B'); assert.equal(store.readLock(), null);
  assert.equal(store.acquireLock('D', {}, () => false), true);
  assert.equal(store.acquireLock('E', {}, () => false), true, 'dead pid lock is reclaimed');
});

test('autopilot: schedule.json and Windows task reconcile (fake schtasks)', async () => {
  let now = at('2026-11-13T00:00:00Z');
  const dir = mkdir('ap');
  const store = new AutopilotStore({ directory: dir, now: () => now, launcherDirectory: path.join(dir, 'launcher') });
  const calls = [];
  const exec = async (file, args) => { calls.push(args); if (args[0] === '/Create') { const xml = fs.readFileSync(args[args.indexOf('/XML') + 1]); calls.at(-1).xml = xml; } return { code: args[0] === '/Query' ? (calls.some(c => c[0] === '/Create') ? 0 : 1) : 0, stdout: '', stderr: '' }; };
  const sched = new WindowsTaskScheduler(store, { taskName: 'OpenCode Automations TEST-fake', exec, platform: 'win32', env: { USERDOMAIN: 'PC', USERNAME: 'u' } });
  assert.equal((await sched.ensure()).action, 'none', 'no automation → nothing registered, no schtasks call');
  assert.equal(calls.length, 0);
  const a = store.save(automationInput(mkdir('folder')));
  const r1 = await sched.ensure();
  assert.equal(r1.action, 'registered'); assert.equal(r1.at, '2026-11-13T01:00:00.000Z');
  const create = calls.find(c => c[0] === '/Create');
  assert.equal(create.xml[0], 0xff); assert.equal(create.xml[1], 0xfe, 'UTF-16LE BOM');
  const xml = create.xml.slice(2).toString('utf16le');
  assert.match(xml, /<TimeTrigger><StartBoundary>[^<]+<\/StartBoundary>/); assert.match(xml, /<LogonType>InteractiveToken<\/LogonType>/);
  assert.match(xml, /<Command>wscript\.exe<\/Command>/); assert.match(xml, /launcher\.vbs/); assert.match(xml, /<StartWhenAvailable>true/);
  assert.equal((await sched.ensure()).action, 'unchanged', 'same trigger time → no re-registration');
  const up = store.readSchedule().upcoming;
  assert.equal(up[0].automationId, a.id); assert.equal(up[0].plannedAt, '2026-11-13T01:00:00.000Z'); assert.equal(up[0].folder, a.folder);
  store.setEnabled(a.id, false);
  const r2 = await sched.ensure();
  assert.equal(r2.action, 'removed'); assert(calls.some(c => c[0] === '/Delete'));
  assert.equal(store.readSchedule().registered, null);
  const ptr = sched.writePointer({ exe: 'C:\\nowhere\\OpenCode.exe', installDir: 'C:\\nowhere' });
  assert.equal(ptr.dataDir, dir);
  const ps1 = fs.readFileSync(path.join(store.launcherDirectory, 'launcher.ps1'));
  assert.deepEqual([...ps1.slice(0, 3)], [0xef, 0xbb, 0xbf]);
  assert(/^[\x00-\x7f]*$/.test(launcherPs1Source()), 'launcher.ps1 is ASCII');
  assert(fs.readFileSync(path.join(store.launcherDirectory, 'launcher.vbs'), 'latin1').includes('launcher.ps1'));
  assert(taskXml({ taskName: 'x&y', launcherVbs: 'C:\\a b\\launcher.vbs', startMs: now }).includes('x&amp;y'));
});

// ------------------------------------------------------------------ Windows-only: real launcher + one test-named task
const isWin = process.platform === 'win32';
function runLauncher(dir) { return spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', path.join(dir, 'launcher.ps1')], { encoding: 'utf8', timeout: 60000, windowsHide: true }); }
test('launcher.ps1: defers to a running OpenCode, records install_moved, never starts anything here', { skip: !isWin && 'Windows only' }, () => {
  const dir = mkdir('ap');
  let now = Date.now() - 3 * 86400000;
  const store = new AutopilotStore({ directory: dir, now: () => now, launcherDirectory: path.join(dir, 'launcher') });
  const sched = new WindowsTaskScheduler(store, { taskName: 'OpenCode Automations TEST-none-' + crypto.randomBytes(3).toString('hex'), platform: 'win32' });
  const a = store.save(automationInput(mkdir('folder')));
  now = Date.now(); store.writeSchedule(now);
  assert(store.readSchedule().upcoming.some(u => Date.parse(u.plannedAt) <= now), 'a slot is due');
  sched.writePointer({ exe: path.join(dir, 'moved-away', 'OpenCode.exe'), installDir: path.join(dir, 'moved-away') });
  const launcherLog = () => fs.readFileSync(path.join(store.launcherDirectory, 'launcher.log'), 'utf8');
  // 1) a fresh in-app scheduler lock (this live node pid) → deferred, nothing recorded
  assert.equal(store.acquireLock('test-instance', {}), true);
  let r = runLauncher(store.launcherDirectory);
  assert.equal(r.status, 0, r.stderr); assert.match(launcherLog(), /deferred: in-app scheduler/);
  assert.equal(store.runs().length, 0);
  store.releaseLock('test-instance');
  // 2) no lock, exe missing → skipped: install_moved for each due slot
  r = runLauncher(store.launcherDirectory);
  assert.equal(r.status, 0, r.stderr); assert.match(launcherLog(), /install moved/);
  const runs = store.runs();
  assert(runs.length >= 1); assert(runs.every(x => x.status === 'skipped' && x.reason === 'install_moved' && x.automationId === a.id));
  // the planner treats those slots as handled
  for (const x of runs) assert(store.terminalKeys().has(x.key));
  // 3) nothing due → exits
  store.setEnabled(a.id, false); store.writeSchedule(Date.now());
  r = runLauncher(store.launcherDirectory);
  assert.equal(r.status, 0, r.stderr); assert.match(launcherLog(), /nothing due/);
});

test('Task Scheduler: register, query and delete one clearly test-named task', { skip: !isWin && 'Windows only' }, async () => {
  const dir = mkdir('ap');
  const store = new AutopilotStore({ directory: dir, launcherDirectory: path.join(dir, 'launcher') });
  const name = 'OpenCode Automations TEST-' + crypto.randomBytes(4).toString('hex');
  const sched = new WindowsTaskScheduler(store, { taskName: name });
  try {
    store.save(automationInput(mkdir('folder'), { schedule: { kind: 'cron', cron: '0 3 1 1 *', timezone: TZ } }));
    const r = await sched.ensure({ force: true });
    assert.equal(r.action, 'registered'); assert.equal(r.registered, true, JSON.stringify(r));
    const q = await sched.query();
    assert.equal(q.exists, true); assert(q.startBoundary, 'has a one-shot StartBoundary');
  } finally {
    const d = await sched.unregister();
    assert.equal(d.removed, true, JSON.stringify(d));
    assert.equal((await sched.query()).exists, false, 'test task deleted');
  }
});
