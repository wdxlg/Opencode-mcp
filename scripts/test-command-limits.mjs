// Focused in-memory regressions: no application launch, sockets, or user processes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../recovered/esm/000-extension.js/',import.meta.url);
const read=name=>fs.readFileSync(new URL(name,root),'utf8');
const broker=read('module-0165.mjs');
// Full-line comments describe removed mechanisms; they are not executable declarations.
const executableBroker=broker.split(/\r?\n/).filter(line=>!/^\s*\/\//.test(line)).join('\n');
assert(!/MAX_MANAGED_TERMINAL_SLOTS|MAX_IDLE_TERMINALS|TERMINAL_POOL_LIMIT|new ProcessBudget|this\.processBudget|pruneIdleTerminals|workspace-mutation(?!-soft)|WORKSPACE_BUSY/.test(executableBroker)); // recovered.33 同目录软等待（workspace-mutation-soft）是有意保留的
const acquire=broker.slice(broker.indexOf('  async acquireTerminal('),broker.indexOf('  displayCwd('));
let creations=0;
const scope={currentManagedSandboxMode:()=>'off',managedSandboxWritableRoots:()=>[],resolveWorkspacePath:()=>({absolute:'project'}),vscode15:{window:{createTerminal(){creations++;return {show(){},dispose(){}};}},TerminalLocation:{Panel:1},ThemeIcon:class{},ThemeColor:class{}},ManagedCommandPseudoterminal:class{async ensureStarted(){} dispose(){}}};
const manager=vm.runInNewContext(`({${acquire}})`,scope);
Object.assign(manager,{slots:new Map(Array.from({length:20},(_,i)=>[String(i),{ownerId:'owner',busyCommandId:'busy'+i,closed:false}])),nextTerminalId:21,currentSlotCwd:slot=>slot.initialCwd});
const slot=await manager.acquireTerminal('owner','new-command',{absolute:'project'});
assert.equal(creations,1);assert.equal(manager.slots.size,21);assert.equal(slot.slot.busyCommandId,'new-command');
console.log('PASS: 20 busy terminals do not reject the next terminal');
const resolver=read('module-0148.mjs');
const resolveBridgeToolName=vm.runInNewContext(resolver.slice(resolver.indexOf('function resolveBridgeToolName'),resolver.indexOf('export {'))+';resolveBridgeToolName');
const dispatcher=read('module-0143.mjs');
const exempt=vm.runInNewContext(dispatcher.slice(dispatcher.indexOf('var CONCURRENCY_EXEMPT_TOOLS'),dispatcher.indexOf('function configureMcpActivityArgs'))+';CONCURRENCY_EXEMPT_TOOLS');
const method=dispatcher.slice(dispatcher.indexOf('  async dispatch('),dispatcher.indexOf('  /** Feed one completion'));
const mock=vm.runInNewContext(`new (class {${method}})()`,{resolveBridgeToolName,CONCURRENCY_EXEMPT_TOOLS:exempt,NATIVE_MANAGED_COMMAND_OWNER_ID:'native',
  // dispatch 现在包着身份上下文、超时、超长输出落盘和重复调用提醒；这些与数量门禁无关，用直通替身隔离。
  OC_ACTOR_STORE:{getStore:()=>({}),run:(_a,fn)=>fn()},ocActorFromExtra:()=>({}),BRIDGE_BATCH_TOOL:{name:'bridge_batch'},
  runWithToolTimeout:(_n,_ms,signal,fn)=>fn(signal),toolTimeoutMs:()=>0,spillLargeResult:(_n,r)=>r});
// dispatch also accounts for the existing host-step tracker; isolate it in this quantity-gate unit.
mock.guardToolName=n=>n;mock.guardCategory=()=>'';mock.repeatGuard={annotate:(_o,_n,_a,r)=>r};
let budgetBegins=0,budgetEnds=0;mock.beginStepBudgetTracking=()=>{budgetBegins++;return null;};mock.endStepBudgetTracking=()=>{budgetEnds++;};
let calls=0;mock.handleExecutionToolCall=async(name,args,extra)=>{calls++;assert.equal(extra.commandOwnerId,'owner');return 'handled';};
for(const name of ['run_command','mcp__bridge__run_command','mcp_bridge_run_command','cancel_command','get_command_output','send_command_input'])assert.equal(await mock.dispatch(name,{}, {commandOwnerId:'owner'}),'handled');
assert.equal(calls,6);
mock.handleExecutionToolCall=async()=>{throw new Error('permission denied');};
await assert.rejects(mock.dispatch('run_command',{}, {commandOwnerId:'owner'}),/permission denied/);
assert.equal(budgetBegins,7);assert.equal(budgetEnds,7);
console.log('PASS: command calls and aliases skip quantity gates but retain execution/permission dispatch');
const retention=read('module-0167.mjs');
const prune=vm.runInNewContext(retention.slice(retention.indexOf('var MANAGED_COMMAND_COMPLETED_STATE_TTL_MS'),retention.indexOf('export {'))+';managedCommandStateIdsToPrune');
const records=Array.from({length:100},(_,i)=>({id:String(i),ownerId:'owner',status:'completed',endedAt:1000}));
assert.equal(prune(records,2000).length,0);
assert.equal(prune([...records,{id:'active',status:'running'}],3601001).length,100);
console.log('PASS: 100 completed handles retained within TTL; age cleanup and running-state protection remain');
