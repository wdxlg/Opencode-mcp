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
