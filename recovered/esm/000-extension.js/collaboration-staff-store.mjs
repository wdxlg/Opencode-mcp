// Separate, lazy staff ledger. Ordinary rules reads never load or migrate this file.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { withResourceLocks } from './concurrency-runtime.mjs';
import { CollaborationRuntime, validateCollaborationState } from './collaboration-runtime.mjs';
import { now, fail, publicAgentId } from './collaboration-contracts.mjs';
import { STAFF_FORMAT, STAFF_SCHEMA, STAFF_TASK_PREFIX } from './collaboration-staff-contracts.mjs';

const MAX_BYTES = 16 * 1024 * 1024;
const mutable = new Set(['tasks', 'messages', 'messageSequence', 'events', 'revision', 'staffRuns']);
function empty() { return { format: STAFF_FORMAT, schemaVersion: STAFF_SCHEMA, revision: 1, employees: [], runs: [], tasks: [], messages: [], messageSequence: 0, events: [] }; }
function envelope(state) { return JSON.stringify(Object.fromEntries(Object.entries(state).filter(([key]) => !mutable.has(key)))); }
function valid(data) {
  if (data?.format !== STAFF_FORMAT || data.schemaVersion !== STAFF_SCHEMA) fail('STAFF_SCHEMA_UNSUPPORTED', '员工账本格式不支持；不会改动或重置共享规则库。');
  for (const [key, max] of [['employees', 64], ['runs', 100], ['tasks', 500], ['messages', 1000], ['events', 200]]) if (!Array.isArray(data[key]) || data[key].length > max) fail('STAFF_DATA_INVALID', '员工账本字段无效或达到保留上限：' + key);
  if (!Number.isSafeInteger(data.revision) || !Number.isSafeInteger(data.messageSequence)) fail('STAFF_DATA_INVALID', '员工账本版本无效。');
  for (const key of ['employees', 'runs', 'tasks']) if (new Set(data[key].map(item => item?.id)).size !== data[key].length) fail('STAFF_DATA_INVALID', '员工账本 ID 重复。');
  for (const employee of data.employees) if (!/^employee_[a-f0-9-]{36}$/.test(employee.id) || !['api', 'mcp'].includes(employee.kind) || !Number.isSafeInteger(employee.version) || !Array.isArray(employee.allowedPaths)) fail('STAFF_DATA_INVALID', '员工配置无效。');
  for (const run of data.runs) if (!/^team_[a-f0-9-]{36}$/.test(run.id) || !Array.isArray(run.memberIds) || !Number.isSafeInteger(run.version) || !Number.isSafeInteger(run.nativeRequests) || !Array.isArray(run.integrations)) fail('STAFF_DATA_INVALID', '团队记录无效。');
  for (const task of data.tasks) if (!task.id.startsWith(STAFF_TASK_PREFIX) || !data.runs.some(run => run.id === task.staff?.runId) || !data.employees.some(employee => employee.id === task.staff?.employeeId)) fail('STAFF_DATA_INVALID', '团队任务或员工引用无效。');
  return data;
}
export class StaffStore {
  constructor(parent) { this.parent = parent; this.directory = path.join(parent.directory, 'staff'); this.file = path.join(this.directory, 'employees-and-teams.v1.json'); this.seen = false; }
  read() {
    try {
      if (fs.lstatSync(this.directory).isSymbolicLink() || fs.lstatSync(this.file).isSymbolicLink()) fail('STAFF_DATA_LINK', '员工账本不能是链接。');
      const bytes = fs.readFileSync(this.file); if (bytes.length > MAX_BYTES) fail('STAFF_DATA_TOO_LARGE', '员工账本超过 16 MiB，不截断或重置。');
      let data; try { data = JSON.parse(bytes.toString('utf8')); } catch { fail('STAFF_DATA_INVALID', '员工账本 JSON 无法解析，保留原文件。'); }
      valid(data); this.seen = true; return data;
    } catch (error) { if (error.code === 'ENOENT' && !this.seen) return empty(); if (error.code === 'ENOENT') fail('STAFF_DATA_MISSING', '使用中的员工账本已缺失；不重置或重放任务。'); throw error; }
  }
  async mutate(kind, action) {
    const value = await withResourceLocks([this.parent.file, this.file], async () => {
      const data = this.read(), result = await action(data); data.revision++; data.events.push({ id: crypto.randomUUID(), kind, at: now() }); data.events = data.events.slice(-200); valid(data);
      if (Buffer.byteLength(JSON.stringify(data)) > MAX_BYTES) fail('STAFF_DATA_TOO_LARGE', '员工账本达到 16 MiB；请明确归档，不自动删除历史。');
      await this.parent.atomic(this.file, data); this.seen = true; return result;
    });
    this.parent.emit(kind.startsWith('staff')?kind:'staff-'+kind); return value;
  }
}
export function createStaffFacade(parent, staff) {
  // Reuse the existing execution engine without writing team jobs into the shared rules JSON.
  const facade = Object.assign(Object.create(Object.getPrototypeOf(parent)), parent);
  facade.file = staff.store.file; facade.taskIdPrefix = STAFF_TASK_PREFIX; facade.staffRegistry = staff; facade.isStaffService = true;
  facade.read = () => join(staff.store.read());
  function join(data) {
    const base = parent.read(), agents = { ...base.agents };
    for (const [owner, binding] of staff.bindings) {
      const employee = data.employees.find(item => item.id === binding.employeeId);
      if (employee) agents[publicAgentId(owner)] = { id: publicAgentId(owner), name: employee.name, roleId: employee.enabled ? employee.roleId : 'observer', kind: employee.kind, employeeId: employee.id };
    }
    return { ...base, tasks: data.tasks, messages: data.messages, messageSequence: data.messageSequence, events: data.events, revision: data.revision, agents, staffRuns: data.runs, staffEmployees: data.employees };
  }
  facade.mutate = (kind, action) => staff.store.mutate(kind, async data => {
    const state = join(data), before = envelope(state), value = await action(state);
    if (envelope(state) !== before) fail('STAFF_RULES_IMMUTABLE', '团队执行不允许改写共享职位、规则、绑定或模型配置。');
    validateCollaborationState(state);
    for (const key of ['tasks', 'messages', 'messageSequence', 'events']) data[key] = state[key]; data.runs = state.staffRuns;
    return value;
  });
  facade.currentMcpConnections=()=>parent.currentMcpConnections();
  facade.sourceIdentityFor=owner=>parent.sourceIdentityFor(owner);
  facade.sourceIdentityById=id=>parent.sourceIdentityById(id);
  facade.registerWorkspace = (...args) => parent.registerWorkspace(...args);
  facade.forCaller = () => facade;
  facade.collaboration = new CollaborationRuntime(facade);
  facade.collaboration.contextRoot = path.join(parent.directory, 'staff', 'executions');
  facade.collaboration.worktreeHome = parent.directory + '-staff-worktrees';
  facade.supplementalWriterTasks = () => parent.read().tasks;
  facade.beforeClaimTask = (task, owner, state) => staff.beforeClaim(task, owner, state);
  facade.adjustWorkspacePlan = (task, plan) => task.staff?.manager && plan.mode === 'single-writer' ? { ...plan, mode: 'read-only', reason: '经理在单写者项目中只协调与核对；员工串行写入，不让经理长期占用写者。' } : plan;
  facade.beforeModelRequest = (task, owner, state) => staff.beforeModelRequest(task, owner, state);
  facade.assertTaskPaths = (task, name, args, readOnly) => staff.assertPaths(task, name, args, readOnly);
  facade.allowEmptyDelivery = (task, owner) => task.staff?.publication === true && task.staff.noFileChanges === true && staff.bindings.get(owner)?.internalPublication === true;
  facade.prepareTaskDelivery=(task,artifacts)=>staff.prepareDelivery(task,artifacts);
  facade.finalizeTaskDelivery=(task,delivery)=>staff.finalizeDelivery(task,delivery);
  facade.beforeTaskCompletion = (task, owner, state) => staff.beforeComplete(task, owner, state);
  facade.decorateReceipt = (receipt, name, args) => { if (['bridge_read_task_result', 'bridge_read_artifact'].includes(name)) receipt.sourceTaskId = args.task_id; };
  facade.recordControlTool = name => ['bridge_read_task_result', 'bridge_read_artifact'].includes(name);
  facade.decorateNewTask = (task, input, owner, state, allocation) => staff.decorateTask(task, input, owner, state, allocation);
  facade.beforeNativeRun = (owner, task, entry) => staff.bindNative(owner, task, entry);
  facade.afterNativeRun = owner => staff.unbindNative(owner);
  facade.isManagerTask = task => task.staff?.manager === true;
  facade.queueBlocked = (task, entry, state) => { const others=[...state.tasks,...parent.read().tasks];if(state.tasks.some(other=>other.id!==task.id&&other.owner&&other.staff.employeeId===task.staff.employeeId))return true;if(task.dependencies.some(id=>state.tasks.find(other=>other.id===id)?.staff.review?.decision!=='accept'))return true;if(entry.waitingWriter){const root=parent.workspace(task.workspaceId).root;return others.some(other=>other.owner&&other.attempts?.find(attempt=>attempt.id===other.activeAttemptId)?.workspace?.mode==='single-writer'&&other.workspaceId===task.workspaceId);}return false; };
  facade.authorizeWorkerEntries = (entries, resume) => staff.authorizeEntries(entries, resume);
  facade.workerInstructions = (task, owner) => staff.instructions(task, owner);
  // member-custom: the employee record behind a team job (personal prompt, tool/write limits, model params, fallback model).
  facade.memberForTask = task => { try { return task?.staff?.employeeId ? staff.employee(staff.store.read(), task.staff.employeeId) : null; } catch { return null; } };
  facade.allowNativeTool = (name, task) => staff.allowNativeTool(name, task);
  facade.nativeToolDefinition = (tool, task) => staff.nativeToolDefinition(tool, task);
  facade.nativeToolInput = (name, input, task, lease, callId) => staff.nativeToolInput(name, input, task, lease, callId);
  facade.waitForTeam = (task, owner, lease, signal) => staff.waitForTeam(task, owner, lease, signal);
  const originalHandle = parent.handleTool;
  facade.handleTool = async (name, args, owner, extra = {}) => {
    if(name==='bridge_join_collaboration')return {content:[{type:'text',text:JSON.stringify(staff.infoFor(owner))}],structuredContent:staff.infoFor(owner)};
    if(name==='bridge_update_task'&&args.status==='blocked'){const filled=facade.collaboration.fillTaskHandles(name,args,owner);let value=await facade.updateTask(filled.args,owner);if(filled.normalized.length)value={...value,normalized:filled.normalized};return {content:[{type:'text',text:JSON.stringify(value)}],structuredContent:value};}
    // Either handle kind: an ordinary collaboration task ID is resolved in the shared rules store.
    if(name==='bridge_get_execution'&&typeof args?.task_id==='string'&&!args.task_id.startsWith(STAFF_TASK_PREFIX)&&parent.read().tasks.some(task=>task.id===args.task_id))return originalHandle.call(parent, name, args, owner, extra);
    if (name === 'bridge_create_task') fail('STAFF_ASSIGNMENT_REQUIRED', '团队任务必须用 bridge_delegate_task 指定员工与稳定请求键。');
    const result = await originalHandle.call(facade, name, args, owner, extra);
    if (name === 'bridge_get_collaboration') {
      const extra = staff.infoFor(owner), allowed = new Set(extra.runs.map(run => run.id)); result.structuredContent.tasks = result.structuredContent.tasks.filter(task => allowed.has(task.staff?.runId)); result.structuredContent.staff = extra; result.content = [{ type: 'text', text: JSON.stringify(result.structuredContent, null, 2) }];
    }
    return result;
  };
  facade.role = (owner, state = facade.read()) => { const role = parent.role.call(facade, owner, state), binding = staff.bindings.get(owner), employee = binding && state.staffEmployees.find(item => item.id === binding.employeeId); return role && employee ? { ...role, instructions: role.instructions + '\n当前员工：' + employee.name + ' (' + employee.id + ')；写入目录：' + employee.allowedPaths.join('、') + '；Shell：' + (employee.allowShell ? '明确启用，非OS沙箱' : '未启用') + '。员工仍须领取实际分配的团队任务；不能靠名称、API或模型选择提权。' } : role; };
  facade.readOnlyOperation = (name, args) => staff.isReadTool(name) || parent.readOnlyOperation(name, args);
  facade.guard = async (name, args, owner) => { staff.guardCall(name, args, owner); return parent.guard.call(facade, name, args, owner); };
  return facade;
}
