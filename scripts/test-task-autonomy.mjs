// Opt-in pure regression cases. Added as source; NOT run by build/update/source-only.
// No application, profile, model, network request, or tool execution is started by these cases.
import test from 'node:test';
import assert from 'node:assert/strict';
import { clarifyBundledTaskWorkflow, nativeTaskCompletionStatus } from '../recovered/shared/automation-store.mjs';
import { initializeCollaborationState } from '../recovered/shared/collaboration-runtime.mjs';
import { createRequire } from 'node:module';
// Recovered source uses CommonJS builtins; production bundling supplies require.
globalThis.require = createRequire(import.meta.url);
const { BridgeTaskStore } = await import('../recovered/esm/000-extension.js/module-0144.mjs');
const legacy='每次对话先创建或更新 Bridge 任务卡，等待确认。';
function fixture(){return initializeCollaborationState({
  format:'opencode.rules-and-collaboration',schemaVersion:4,revision:8,
  globalPresetId:'general',globalSelectionVersion:1,
  presets:[{id:'general',name:'通用规则',version:2,policies:{readOnly:false,allowCommands:true},rules:[{id:'rule_workflow',name:'任务卡与工作流',text:legacy,enabled:true,libraryRuleId:'lib_task_workflow',libraryVersion:1}]}],
  roles:[],tasks:[],bindings:{},workspaces:{},agents:{},events:[],
  ruleLibrary:[{id:'lib_task_workflow',name:'任务卡与工作流',text:legacy,version:1,origin:'bundled-copy-prompt'}],ruleLibraryVersion:1
});}
test('unchanged bundled workflow clarifies tool receipt without mutating the input',()=>{
  const state=fixture(),before=JSON.stringify(state),next=clarifyBundledTaskWorkflow(state);
  assert.ok(next);assert.equal(JSON.stringify(state),before);
  assert.match(next.ruleLibrary[0].text,/工具返回的成功回执/);
  assert.match(next.ruleLibrary[0].text,/不得要求用户手动完成/);
  assert.equal(next.ruleLibrary[0].version,2);assert.equal(next.ruleLibraryVersion,2);
  assert.equal(next.presets[0].version,3);assert.equal(next.presets[0].rules[0].libraryVersion,2);
  assert.equal(next.revision,9);assert.equal(clarifyBundledTaskWorkflow(next),null);
});
test('custom workflow text and origin remain untouched',()=>{
  const state=fixture();state.ruleLibrary[0].text='用户自定义的工作流。';assert.equal(clarifyBundledTaskWorkflow(state),null);
  const other=fixture();other.ruleLibrary[0].origin='user';assert.equal(clarifyBundledTaskWorkflow(other),null);
});
test('renamed independent rule reference is not overwritten',()=>{
  const state=fixture();state.presets[0].rules[0].name='我的独立规则';state.presets[0].rules[0].text='独立正文';
  const next=clarifyBundledTaskWorkflow(state);assert.equal(next.presets[0].rules[0].text,'独立正文');assert.equal(next.presets[0].version,2);
});
test('native success completes by default and manual review is opt-in',()=>{
  const owner='native-chat:automation:fixture';
  assert.equal(nativeTaskCompletionStatus('completed',owner,{}),'completed');
  assert.equal(nativeTaskCompletionStatus('completed',owner,{nativeTaskReviewRequired:false}),'completed');
  assert.equal(nativeTaskCompletionStatus('completed',owner,{nativeTaskReviewRequired:true}),'review');
});
test('blocked or explicitly reviewed work is not promoted to completed',()=>{
  const state={nativeTaskReviewRequired:true},owner='native-chat:automation:fixture';
  assert.equal(nativeTaskCompletionStatus('blocked',owner,state),'blocked');
  assert.equal(nativeTaskCompletionStatus('review',owner,state),'review');
});
test('existing external completion API is not silently changed by the native-only preference',()=>{
  assert.equal(nativeTaskCompletionStatus('completed','mcp:fixture',{nativeTaskReviewRequired:true}),'completed');
});

test('native collaboration UUID is accepted without erasing the authenticated owner namespace',()=>{
  const store=new BridgeTaskStore(100,()=>1000),uuid='12345678-1234-4abc-8def-123456789abc',owner='native-chat:automation:'+uuid;
  const card=store.ensureNativeChat(owner,'fixture');
  assert.equal(store.tasks.get(card.id).owner,owner);assert.equal(store.tasks.get(card.id).overviewSessionId,uuid);
  assert.throws(()=>store.resolve('native-chat:'+uuid,{task_id:card.id}),/different client session/);
});
test('AI can finish its own ordinary card with a real revision, without a local user completion action',()=>{
  const store=new BridgeTaskStore(100,()=>1000),owner='native-chat:automation:12345678-1234-4abc-8def-123456789abc';
  const card=store.ensureNativeChat(owner,'fixture');
  const done=store.update(owner,[{id:'work',title:'完成当前授权工作',status:'completed'}],{task_id:card.id,expected_revision:card.revision,lifecycle:'completed'});
  assert.equal(done.state,'completed');
});

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import * as pres027 from '../recovered/esm/027-workbench.desktop.main.js/module-2763.mjs';
// The disabled native Agents entry is not the active main-window task shelf.

test('configurePersistence preserves legacy files and restores durable task records', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-task-reset-'));
  try {
    const histDir = path.join(tmp, 'bridge-task-history');
    fs.mkdirSync(histDir, { recursive: true });
    const legacyFile = path.join(histDir, 'legacy.json');
    fs.writeFileSync(legacyFile, JSON.stringify({ format: 'opencode-bridge-tasks-v1', workspaceKey: 'legacy', tasks: [{ id: 'old' }] }));
    let now = 1_000;
    const store = new BridgeTaskStore(24, () => now);
    store.update('bridge:s1', [{ id: 'a', title: 'step', status: 'in_progress' }], { new_task: true, task_title: 'Old In-Memory' });
    store.configurePersistence(tmp, 'D:/project');
    assert.equal(store.snapshot().tasks.length, 0);
    assert.equal(fs.existsSync(legacyFile), true);
    // Subsequent updates create durable per-task records without deleting legacy snapshots.
    store.update('bridge:s2', [{ id: 'b', title: 'step', status: 'completed' }], { new_task: true, lifecycle: 'completed' });
    const restored = new BridgeTaskStore(24, () => now);
    restored.configurePersistence(tmp, 'D:/project');
    assert.equal(restored.snapshot().tasks.length, 1);
    assert.equal(restored.snapshot().tasks[0].state, 'completed');
    assert.equal(fs.existsSync(legacyFile), true);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});

test('completed tasks stay in durable main-window history without ten-minute expiry', () => {
  let now = 10_000;
  const store = new BridgeTaskStore(24, () => now);
  const running = store.update('bridge:s1', [{ id: 's1', title: 'Run', status: 'in_progress' }], { new_task: true, task_title: 'Active Task' });
  const done = store.update('bridge:s2', [{ id: 's2', title: 'Done', status: 'completed' }], { new_task: true, task_title: 'Finished Task', lifecycle: 'completed' });

  for (const mod of [pres027]) {
    const snap1 = store.snapshot().tasks;
    const part1 = mod.partitionBridgeTaskDisplay(snap1, now + 5 * 60_000);
    assert.deepEqual(part1.slots.map((t) => t.id), [running.id]);
    assert.deepEqual(part1.history.map((t) => t.id), [done.id]);
  }

  // Keep active task alive with tool activity at t + 6m, then advance to t + 10m
  now = 10_000 + 6 * 60_000;
  store.beginOwnerActivity('bridge:s1');
  store.endOwnerActivity('bridge:s1');

  now = 10_000 + 10 * 60_000;
  const snapAfter10m = store.snapshot().tasks;
  assert.deepEqual(new Set(snapAfter10m.map((t) => t.id)), new Set([running.id, done.id]));
  for (const mod of [pres027]) {
    const part2 = mod.partitionBridgeTaskDisplay(snapAfter10m, now);
    assert.deepEqual(part2.slots.map((t) => t.id), [running.id]);
    assert.deepEqual(part2.history.map(t => t.id), [done.id]);
  }
});

test('idle, in-flight and awaiting-user unfinished tasks all remain available', () => {
  let now = 50_000;
  const store = new BridgeTaskStore(24, () => now);
  const abandoned = store.update('bridge:abandoned', [{ id: 'a', title: 'Work', status: 'in_progress' }], { new_task: true });
  const busy = store.update('bridge:busy', [{ id: 'b', title: 'Long build', status: 'in_progress' }], { new_task: true });
  const asking = store.update('bridge:asking', [{ id: 'c', title: 'Clarify', status: 'in_progress' }], { new_task: true });
  store.askQuestion('bridge:asking', {
    task_id: asking.id,
    question: 'Choose mode?',
    options: [{ id: 'm1', label: 'Mode 1' }, { id: 'm2', label: 'Mode 2' }]
  });
  store.beginOwnerActivity('bridge:busy');

  // Advance 11 minutes: all unfinished work stays visible; real in-flight/question status remains intact.
  now += 11 * 60_000;
  const remainingIds = store.snapshot().tasks.map((t) => t.id).sort();
  assert.deepEqual(remainingIds, [abandoned.id, asking.id, busy.id].sort());
  assert.equal(store.snapshot().tasks.find((t) => t.id === busy.id).state, 'running');
  assert.equal(store.snapshot().tasks.find((t) => t.id === asking.id).state, 'awaiting_user');

  // A tool receipt refreshes tracking but does not authorize deleting work after later silence.
  store.endOwnerActivity('bridge:busy');
  now += 9 * 60_000;
  assert.ok(store.snapshot().tasks.some((t) => t.id === busy.id));
  now += 60_000;
  assert.equal(store.snapshot().tasks.some((t) => t.id === busy.id), true);
  assert.equal(store.snapshot().tasks.some((t) => t.id === abandoned.id), true);
});

test('disconnect retains unfinished displays; next task only hides previous completed display in same memory', t => {
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'opencode-autonomy-retention-'));
  t.after(()=>fs.rmSync(tmp,{recursive:true,force:true}));
  let now = 100_000;
  const store = new BridgeTaskStore(24, () => now);
  store.configurePersistence(tmp, 'D:/task-autonomy');
  const firstUnfinished = store.update('bridge:s1', [{ id: '1', title: 'Step 1', status: 'in_progress' }], { new_task: true });
  // New task creation must not cancel or remove the earlier unfinished task.
  const secondFinished = store.update('bridge:s1', [{ id: '2', title: 'Step 2', status: 'completed' }], { new_task: true, lifecycle: 'completed' });
  const thirdUnfinished = store.update('bridge:s1', [{ id: '3', title: 'Step 3', status: 'in_progress' }], { new_task: true });

  assert.equal(store.tasks.get(firstUnfinished.id).state, 'running');
  assert.equal(store.tasks.get(secondFinished.id).state, 'completed');
  assert.equal(store.tasks.get(thirdUnfinished.id).state, 'running');

  // Disconnect closes local tracking. A dropped MCP session is not a finished job (cad9cfa6): the unfinished
  // card stays 'running' but is marked executionUnverified, so it lands in the red group and stays resumable.
  assert.equal(store.disconnect('bridge:s1'), true);
  assert.equal(store.tasks.get(thirdUnfinished.id).state, 'running');
  assert.equal(store.tasks.get(thirdUnfinished.id).executionUnverified, true);
  assert.equal(store.tasks.get(secondFinished.id).state, 'completed');

  for (const mod of [pres027]) {
    const part = mod.partitionBridgeTaskDisplay(store.snapshot().tasks, now + 60_000);
    assert.deepEqual(part.slots, []);
    assert.deepEqual(part.history, []);
    // One card per dialogue: the newest task supersedes the display of the same owner's earlier cards
    // (module-0144 isStartingTask); the superseded unfinished card is kept, not cancelled or deleted.
    assert.deepEqual(new Set(part.unfinished.map(t => t.id)), new Set([thirdUnfinished.id]));
    assert.equal(store.tasks.get(firstUnfinished.id).state, 'running');
    assert.equal(store.tasks.get(firstUnfinished.id).displayDeletedReason, 'superseded');
    assert(fs.existsSync(store.tasks.get(secondFinished.id).memory.checkpointPath));
  }
});
