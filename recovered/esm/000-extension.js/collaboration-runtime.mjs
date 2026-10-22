// Durable cooperative task execution. Private contexts never enter public snapshots or exports.
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { acquireResources } from './concurrency-runtime.mjs';
import { now, digest, publicAgentId, fail, cleanText, requiredText, defaultCategories, taskOptions, resolveTaskRoute, modelReference, skillNames, turnBudget, validateReportShape, evidenceAssessment, EXECUTION_SCOPED_TOOLS } from './collaboration-contracts.mjs';
import { canonicalPath, withinRoot, planWorkspace, prepareWorkspace, verifyWorkspace, scopedArguments, assertWritePaths, artifactManifest, workspaceDiff } from './collaboration-workspaces.mjs';

const MAX_PRIVATE_BYTES = 64 * 1024 * 1024;
const MAX_RECORD_BYTES = 4 * 1024 * 1024;
const COMMAND_TOOLS = new Set(['get_command_output', 'send_command_input', 'cancel_command']);
const CONTROL_TOOLS = new Set(['set_todos', 'update_plan', 'report_progress', 'list_skills', 'bridge_get_effective_rules', 'bridge_acknowledge_rules']);
const knownWrites = new Set(['apply_patch', 'run_command', 'send_command_input', 'cancel_command']);
const unknown = operation => ['issued', 'unknown'].includes(operation.state) && operation.mutating || operation.commandState === 'running';
const currentAttempt = task => task.attempts?.find(attempt => attempt.id === task.activeAttemptId);
const alive = pid => { if (!Number.isSafeInteger(pid) || pid < 1) return false; try { process.kill(pid, 0); return true; } catch (error) { return error.code === 'EPERM'; } };
function safeAttempt(attempt, includeOperations = false, own = false) {
  if (!attempt) return null;
  const { privateOwner, operations, checkpoint, privateBytes, ...result } = structuredClone(attempt);
  result.checkpointAvailable = !!checkpoint;
  result.receiptCount = operations.length;
  result.unknownOperations = operations.filter(operation => operation.mutating && ['issued', 'unknown'].includes(operation.state)).length + (attempt.workspaceOutcome !== 'completed' ? 1 : 0);
  result.runningCommands = operations.filter(operation => operation.name === 'run_command' && operation.commandState === 'running').length;
  if (['running', 'preparing'].includes(result.state) && !alive(result.hostPid)) result.displayState = 'interrupted';
  if (includeOperations) result.receipts = operations.map(operation => {
    const { resultRef, commandId, ...item } = operation;
    return { ...item, ...own && commandId ? { command_id: commandId } : {} };
  });
  return result;
}
function commandPurpose(command) {
  // Conservative metadata, not shell interpretation or proof of test quality.
  if (typeof command !== 'string' || /[\n\r;&|<>`$]/.test(command) || /(?:^|\s)(?:--(?:help|version|listTests|list-tests|showConfig|show-config|collect-only|dry-run|passWithNoTests|allow-no-tests)|-[hV])(?:\s|=|$)/i.test(command)) return 'command';
  if (/^\s*(?:npm|pnpm|yarn|bun)\s+(?:run\s+)?(?:test(?::[\w-]+)?|vitest|jest)(?:\s+[\w./:=@,\-]+)*\s*$/.test(command) || /^\s*(?:pytest|python(?:3)?\s+-m\s+pytest|node\s+--test)(?:\s+[\w./:=@,\-]+)*\s*$/.test(command)) return 'test';
  if (/^\s*(?:npm|pnpm|yarn|bun)\s+(?:run\s+)?(?:build(?::[\w-]+)?|compile|typecheck)(?:\s+[\w./:=@,\-]+)*\s*$/.test(command) || /^\s*(?:tsc|dotnet\s+build)(?:\s+[\w./:=@,\-]+)*\s*$/.test(command)) return 'build';
  return 'command';
}
export function initializeCollaborationState(state) {
  state.taskCategories ??= defaultCategories();
  state.messages ??= [];
  state.messageSequence ??= 0;
  for (const task of state.tasks) {
    task.categoryId ??= task.roleId === 'reviewer' ? 'review' : task.roleId === 'documentation' ? 'writing' : ['planner', 'observer', 'tester'].includes(task.roleId) ? 'explore' : 'implementation';
    task.isolation ??= 'auto'; task.requiredArtifacts ??= []; task.attempts ??= [];
    if (task.owner && !task.attempts.length) { task.status = 'blocked'; task.revision++; task.output = ((task.output || '') + '\n旧执行没有隔离与工具回执；保留所有权，先核对后交接，不自动续写。').slice(0, 32000); }
    task.executionState ??= task.status === 'queued' ? 'not_started' : task.status === 'blocked' ? 'blocked' : task.status === 'running' ? 'running' : 'legacy_unverified';
    task.validationState ??= 'unverified'; task.validationScope ??= [];
    task.testsRun ??= false; task.testsPassed ??= false;
    task.acceptanceState ??= task.acceptedBy === 'local-user' ? 'accepted' : task.status === 'review' ? 'pending' : 'not_required';
  }
  return state;
}
export function validateCollaborationState(state) {
  if (!Array.isArray(state.taskCategories) || !state.taskCategories.length || state.taskCategories.length > 32 || new Set(state.taskCategories.map(item => item.id)).size !== state.taskCategories.length || !Array.isArray(state.messages) || state.messages.length > 1000 || !Number.isSafeInteger(state.messageSequence)) fail('COLLABORATION_DATA_INVALID', '协作执行数据无效，拒绝覆盖。');
  for (const category of state.taskCategories) { requiredText(category.id, 100); requiredText(category.name, 200); modelReference(category.model); skillNames(category.skills); turnBudget(category.maxTurns); if (!Number.isSafeInteger(category.version)) fail('COLLABORATION_DATA_INVALID', '类别版本无效。'); }
  for (const task of state.tasks) {
    if (!Array.isArray(task.attempts) || task.attempts.length > 24 || !Array.isArray(task.requiredArtifacts) || !['auto', 'worktree', 'single-writer'].includes(task.isolation)) fail('COLLABORATION_DATA_INVALID', '任务执行记录无效。');
    for (const attempt of task.attempts) if (typeof attempt.id !== 'string' || !Array.isArray(attempt.operations) || attempt.operations.length > 512) fail('COLLABORATION_DATA_INVALID', '执行尝试或回执记录无效。');
    if (task.activeAttemptId && !currentAttempt(task)) fail('COLLABORATION_DATA_INVALID', '当前执行尝试引用丢失。');
  }
}

export class CollaborationRuntime {
  constructor(service) { this.service = service; this.contextRoot = path.join(service.directory, 'executions'); this.worktreeHome = service.directory + '-worktrees'; }
  task(state, id) { return this.service.task(state, id); }
  ownedTask(state, owner, id) {
    const task = id ? this.task(state, id) : state.tasks.find(item => item.owner === publicAgentId(owner));
    if (task && task.owner !== publicAgentId(owner)) fail('TASK_NOT_OWNED', '任务不属于当前真实调用者。');
    return task;
  }
  attempt(task, id = task.activeAttemptId) { const value = task.attempts.find(item => item.id === id); if (!value) fail('TASK_ATTEMPT_UNKNOWN', '执行尝试必须来自当前任务记录。'); return value; }
  assertLease(task, owner, lease) { if (task.owner !== publicAgentId(owner) || task.lease !== lease) fail('TASK_NOT_OWNED', '任务所有权或执行令牌已变化。'); }
  assertRules(task, owner, state) {
    const rules = this.service.effective(task.workspaceId, owner, state);
    if (this.service.acknowledged.get(this.service.key(owner, task.workspaceId)) !== rules.rules_hash) fail('RULES_ACK_REQUIRED', '请完整读取并确认任务工作区的当前规则。', { workspace_id: task.workspaceId, rules_hash: rules.rules_hash });
    return rules;
  }
  publicAttempts(task) { return task.attempts.map(attempt => safeAttempt(attempt)); }
  hasUnknown(task) { const attempt = currentAttempt(task); return !!attempt && (attempt.workspaceOutcome !== 'completed' || attempt.operations.some(unknown)); }
  async resumeExternalTask(input, owner) {
    const before = this.task(this.service.read(), input.task_id); this.assertLease(before, owner, input.lease);
    const attempt = this.attempt(before);
    this.service.beforeClaimTask?.(before, owner, this.service.read());
    if (attempt.kind !== 'mcp' || before.status !== 'blocked') fail('TASK_RECOVERY_UNAVAILABLE', '此接口只继续原调用者持有的外部阻塞任务。');
    if (attempt.operations.some(unknown) || attempt.workspaceOutcome !== 'completed') fail('TASK_OUTCOME_UNKNOWN', '仍有未知副作用或在途命令，不能继续写入。');
    const checkpoint = attempt.checkpoint ? await this.loadCheckpoint(before) : null;
    await verifyWorkspace(attempt.workspace, this.service.options.gitExecutable);
    return this.service.mutate('tasks', state => {
      const task = this.task(state, input.task_id); this.assertLease(task, owner, input.lease);
      const current = this.attempt(task), rules = this.assertRules(task, owner, state);
      if (task.revision !== input.expected_revision || current.id !== attempt.id || current.operations.some(unknown)) fail('TASK_VERSION_CONFLICT', '继续期间任务已变化。');
      if (rules.rules_hash !== task.claimRulesHash) fail('TASK_RULES_STALE', '规则已变化，需要核对后作为新尝试。');
      task.lease = crypto.randomUUID(); task.status = 'running'; task.executionState = 'running'; task.revision++; task.updatedAt = now(); current.state = 'running'; current.phase = 'resumed-external'; current.updatedAt = now();
      return { task: this.service.publicTask(task), lease: task.lease, checkpoint, model_session_restored: false, tool_execution_lease_field: 'execution_lease' };
    });
  }
  route(task, state = this.service.read()) { return resolveTaskRoute(task, state); }
  assertRoute(task, route, state = this.service.read()) { const { hash, ...current } = resolveTaskRoute(task, state); if (current.model && digest(current.model) !== digest(route.model) || digest({ ...current, model: route.model }) !== route.hash) fail('TASK_ROUTING_CHANGED', '类别、模型、Skills 或预算已变化，请重新明确确认，不使用过期启动配置。'); }
  fileToolRoots(owner, roots) {
    const state = this.service.read(); if (!this.service.isCollaborationEnabled(state)) return roots;
    const task = this.ownedTask(state, owner), attempt = task && currentAttempt(task), workspace = attempt?.workspace;
    return workspace?.mode === 'worktree' && roots.some(root => withinRoot(workspace.sourceRoot, root)) ? [...roots, workspace.root] : roots;
  }
  async saveCategory(input) {
    return this.service.mutate('task-categories', state => {
      const prior = input.id ? state.taskCategories.find(item => item.id === input.id) : null;
      if (input.id && !prior || prior && prior.version !== input.expected_version) fail('TASK_CATEGORY_CONFLICT', '类别已变化，请刷新后保存。');
      if (!prior && state.taskCategories.length >= 32) fail('TASK_CATEGORY_LIMIT', '最多 32 个任务类别。');
      const value = { id: prior?.id || 'category_' + crypto.randomUUID(), name: requiredText(input.name), model: modelReference(input.model), skills: skillNames(input.skills), maxTurns: turnBudget(input.max_turns ?? 12), version: (prior?.version || 0) + 1 };
      if (prior) Object.assign(prior, value); else state.taskCategories.push(value);
      return value;
    });
  }
  async recordAuthorization(entries) {
    return this.service.mutate('executions', state => {
      for (const [index, entry] of entries.entries()) {
        const task = this.task(state, entry.id);
        if (task.revision !== entry.taskRevision) fail('TASK_VERSION_CONFLICT', '任务在确认期间已变化，尚未启动。'); this.assertRoute(task, entry.route, state);
        task.nativeStartIntent = { route: structuredClone(entry.route), queuePosition: index, confirmedAt: now(), hostPid: process.pid, resume: entry.resume, restartRequiresConfirmation: true, automaticRestart: false };
      }
      return { recorded: entries.length, automatically_restarted: false };
    });
  }
  async configureTask(input) {
    return this.service.mutate('tasks', state => {
      const task = this.task(state, input.task_id);
      if (task.revision !== input.expected_revision || task.owner || task.status !== 'queued') fail('TASK_VERSION_CONFLICT', '只能配置当前未领取的待执行任务。');
      Object.assign(task, taskOptions(input, state, task.roleId)); task.revision++; task.updatedAt = now();
      return this.service.publicTask(task);
    });
  }
  async createTask(input, owner = 'local-user', allocation) {
    return this.service.mutate('tasks', state => {
      const workspace = this.service.workspace(input.workspace_id || this.service.currentWorkspaceId(), state);
      const title = requiredText(input.title), goal = requiredText(input.goal, 16000), roleId = input.role_id || 'developer';
      if (!state.roles.some(role => role.id === roleId)) fail('ROLE_UNKNOWN', '职位不存在。');
      if (!Array.isArray(input.dependencies ?? [])) fail('TASK_DEPENDENCIES', '依赖必须是任务 ID 数组。');
      const dependencies = [...new Set(input.dependencies || [])];
      if (dependencies.length > 30 || dependencies.some(id => this.task(state, id).workspaceId !== workspace.id)) fail('TASK_DEPENDENCIES', '最多 30 项依赖且必须在同一工作区。');
      const options = taskOptions(input, state, roleId), clientKey = input.client_request_id ? digest(owner + '\0' + requiredText(input.client_request_id, 200)) : null;
      const bodyHash = digest({ workspaceId: workspace.id, title, goal, roleId, dependencies, ...options });
      if (clientKey) { const prior = state.tasks.find(task => task.clientKey === clientKey); if (prior) { if (prior.bodyHash !== bodyHash) fail('TASK_IDEMPOTENCY_CONFLICT', '同一请求键不能对应不同任务内容。'); return this.service.publicTask(prior); } }
      if (state.tasks.length >= 500) fail('TASK_LIMIT', '协作任务记录达到 500；不会自动删除历史。');
      const task = { id: (this.service.taskIdPrefix || 'job_') + crypto.randomUUID(), title, goal, workspaceId: workspace.id, roleId, dependencies, ...options, status: 'queued', revision: 1, output: '', attempts: [], executionState: 'not_started', validationState: 'unverified', validationScope: [], testsRun: false, testsPassed: false, acceptanceState: 'not_required', createdAt: now(), updatedAt: now(), createdBy: owner === 'local-user' ? owner : publicAgentId(owner), clientKey, bodyHash };
      this.service.decorateNewTask?.(task, input, owner, state, allocation);
      state.tasks.push(task); return this.service.publicTask(task);
    });
  }
  async claimTask(id, revision, owner) {
    const state = this.service.read(), task = this.task(state, id), role = this.service.role(owner, state), rules = this.assertRules(task, owner, state);
    if (!role || role.id !== task.roleId && role.id !== 'planner') fail('TASK_ROLE_MISMATCH', '当前职位与任务不一致。');
    if (task.revision !== revision || task.owner || !['queued', 'blocked'].includes(task.status)) fail('TASK_VERSION_CONFLICT', '任务不可领取或已被其他执行者修改。');
    this.service.beforeClaimTask?.(task, owner, state);
    const attemptId = 'attempt_' + crypto.randomUUID();
    if (rules.policies.allowCommands === false && task.isolation === 'worktree') fail('POLICY_COMMANDS_DISABLED', '当前策略不允许为 worktree 执行 Git。');
    let plan = await planWorkspace(this.service.workspace(task.workspaceId, state).root, rules.policies.allowCommands === false ? 'single-writer' : task.isolation, rules.policies.readOnly || role.readOnly, this.worktreeHome, task.id, attemptId, this.service.options.gitExecutable, rules.policies.allowCommands !== false, this.contextRoot);
    plan = this.service.adjustWorkspacePlan?.(task, plan) || plan;
    const claimed = await this.service.mutate('tasks', latest => {
      const current = this.task(latest, id), currentRules = this.assertRules(current, owner, latest), currentRole = this.service.role(owner, latest);
      if (currentRules.rules_hash !== rules.rules_hash || !currentRole || currentRole.id !== current.roleId && currentRole.id !== 'planner') fail('TASK_RULES_STALE', '准备期间规则或职位已变化，请重新读取后领取。');
      if (current.revision !== revision || current.owner || !['queued', 'blocked'].includes(current.status)) fail('TASK_VERSION_CONFLICT', '任务在准备期间已变化。');
      this.service.beforeClaimTask?.(current, owner, latest);
      const allTasks = [...latest.tasks, ...(this.service.supplementalWriterTasks?.() || [])];
      if (allTasks.some(other => other.owner === publicAgentId(owner))) fail('TASK_EXECUTION_ALREADY_BOUND', '同一调用者一次只绑定一个协作任务，避免工具进入错误工作副本。');
      if (current.dependencies.some(dep => this.task(latest, dep).status !== 'completed')) fail('TASK_DEPENDENCIES_PENDING', '等待依赖完成。');
      if (current.attempts.length >= 24) fail('TASK_ATTEMPT_LIMIT', '本任务已达到 24 次执行记录；请保留历史后新建任务。');
      if (plan.mode === 'single-writer' && allTasks.some(other => other.owner && currentAttempt(other)?.workspace?.mode === 'single-writer' && (withinRoot(currentAttempt(other).workspace.root, plan.root) || withinRoot(plan.root, currentAttempt(other).workspace.root)))) fail('TASK_WRITER_BUSY', '同一源工作区已有协作写入者；等待完成或明确核对交接，不超时抢占。');
      current.owner = publicAgentId(owner); current.lease = crypto.randomUUID(); current.claimRulesHash = rules.rules_hash; current.status = 'running'; current.executionState = 'running'; current.validationState = 'unverified'; current.validationScope = []; current.testsRun = false; current.testsPassed = false; current.acceptanceState = 'not_required'; delete current.result; current.artifacts = []; current.revision++; current.updatedAt = now();
      const attempt = { id: attemptId, taskId: id, ownerAgentId: current.owner, privateOwner: owner.startsWith('native-chat:automation:') ? owner : undefined, kind: owner.startsWith('native-chat:automation:') ? 'native' : 'mcp', hostPid: process.pid, state: 'preparing', phase: 'workspace-intent', rulesHash: rules.rules_hash, workspace: plan, workspaceOutcome: 'pending', operations: [], privateBytes: 0, requests: 0, checkpointSequence: 0, createdAt: now(), updatedAt: now() };
      current.attempts.push(attempt); current.activeAttemptId = attemptId;
      return { task: this.service.publicTask(current), lease: current.lease, attempt: safeAttempt(attempt), tool_execution_lease_field: 'execution_lease', tool_execution_lease_required: attempt.kind === 'mcp' };
    });
    try {
      await prepareWorkspace(plan, this.service.options.gitExecutable);
      const initialDiff = await workspaceDiff(plan, this.service.options.gitExecutable);
      const initialAttempt = this.attempt(this.task(this.service.read(), id));
      const baselineRef = await this.storePrivate(task, initialAttempt, 'baseline_' + crypto.randomUUID() + '.json', initialDiff);
      await this.editAttempt(id, owner, claimed.lease, attempt => { attempt.baselineDiffRef = baselineRef; attempt.privateBytes += baselineRef.bytes; attempt.baselineDiffAvailable = initialDiff.available; attempt.baselineNotice = initialDiff.reason || '执行开始时已有的差异，不能算成本次修改。'; attempt.state = 'running'; attempt.workspaceOutcome = 'completed'; attempt.phase = 'ready'; });
      return { ...claimed, task: this.service.publicTask(this.task(this.service.read(), id)), attempt: safeAttempt(currentAttempt(this.task(this.service.read(), id))) };
    } catch (error) {
      await this.service.mutate('executions', latest => { const current = this.task(latest, id); this.assertLease(current, owner, claimed.lease); const attempt = this.attempt(current); attempt.state = 'blocked'; attempt.phase = 'workspace-outcome-unknown'; attempt.workspaceOutcome = 'unknown'; attempt.failure = String(error.message).slice(0, 2000); current.status = 'blocked'; current.executionState = 'blocked'; current.output = '工作副本准备未确认完成，不能自动重建：' + error.message; current.revision++; current.updatedAt = now(); }).catch(() => {});
      const blocked = this.task(this.service.read(), id);
      return { ...claimed, task: this.service.publicTask(blocked), attempt: safeAttempt(currentAttempt(blocked)), blocked: true, reason: '任务与执行意图已保留，请先核对工作副本结果。' + error.message };
    }
  }
  async editAttempt(id, owner, lease, action) {
    return this.service.mutate('executions', state => { const task = this.task(state, id); this.assertLease(task, owner, lease); const attempt = this.attempt(task); const result = action(attempt, task, state); attempt.updatedAt = now(); return result; });
  }
  privatePath(attemptId, name) {
    if (!/^attempt_[a-f0-9-]{36}$/.test(attemptId) || !/^[a-zA-Z0-9_-]+\.json$/.test(name)) fail('TASK_RECORD_PATH_INVALID', '执行记录路径无效。');
    return path.join(this.contextRoot, attemptId, name);
  }
  async storePrivate(task, attempt, name, value) {
    const bytes = Buffer.byteLength(JSON.stringify(value, null, 2) + '\n');
    if (bytes > MAX_RECORD_BYTES || (attempt.privateBytes || 0) + bytes > MAX_PRIVATE_BYTES) fail('TASK_CHECKPOINT_BUDGET', '私有记录超过单条 4 MiB 或每次执行 64 MiB 上限；已保留旧记录，不截断上下文。');
    const file = this.privatePath(attempt.id, name);
    await this.service.atomic(file, value);
    const written = await fsp.readFile(file);
    return { name, sha256: digest(written.toString('utf8')), bytes: written.length };
  }
  async readPrivate(attemptId, reference) {
    const bytes = await fsp.readFile(this.privatePath(attemptId, reference.name));
    if (bytes.length > MAX_RECORD_BYTES + 1024 || digest(bytes.toString('utf8')) !== reference.sha256) fail('TASK_CHECKPOINT_CHANGED', '私有检查点或回执哈希不一致；不会静默恢复。');
    return JSON.parse(bytes.toString('utf8'));
  }
  async saveCheckpoint(id, owner, lease, value, expectedRevision) {
    const task = this.task(this.service.read(), id); this.assertLease(task, owner, lease); if (expectedRevision !== undefined && task.revision !== expectedRevision) fail('TASK_VERSION_CONFLICT', '检查点版本已变化。'); const attempt = this.attempt(task);
    const reference = await this.storePrivate(task, attempt, 'checkpoint_' + crypto.randomUUID() + '.json', { format: 'opencode.execution-checkpoint.v1', taskId: id, attemptId: attempt.id, payload: value });
    let taskRevision;
    await this.editAttempt(id, owner, lease, (current, activeTask) => { if (expectedRevision !== undefined && activeTask.revision !== expectedRevision) fail('TASK_VERSION_CONFLICT', '检查点写入期间任务已变化，保留原检查点。'); current.checkpoint = reference; current.checkpointSequence++; current.privateBytes += reference.bytes; current.phase = value.pendingCalls?.length ? 'tools' : 'model-ready'; if (expectedRevision !== undefined) { activeTask.revision++; activeTask.updatedAt = now(); } taskRevision = activeTask.revision; });
    return { attempt_id: attempt.id, sequence: attempt.checkpointSequence + 1, task_revision: taskRevision, checkpoint_saved: true };
  }
  async loadCheckpoint(task) { const attempt = this.attempt(task); if (!attempt.checkpoint) fail('TASK_CHECKPOINT_MISSING', '没有可恢复检查点，请核对后交接为新执行。'); const record = await this.readPrivate(attempt.id, attempt.checkpoint); if (record.taskId !== task.id || record.attemptId !== attempt.id) fail('TASK_CHECKPOINT_CHANGED', '检查点归属不一致。'); return record.payload; }
  async startModelRequest(id, owner, lease, route, model) {
    return this.editAttempt(id, owner, lease, (attempt, task, state) => {
      const rules = this.assertRules(task, owner, state); this.assertRoute(task, route, state);
      if (attempt.workspaceOutcome !== 'completed' || task.status !== 'running' || task.claimRulesHash !== rules.rules_hash) fail('TASK_RULES_STALE', '任务状态或规则已变化。');
      if (attempt.operations.some(operation => operation.mutating && ['issued', 'unknown'].includes(operation.state))) fail('TASK_OUTCOME_UNKNOWN', '有结果未知的副作用，先核查，不追加模型调用。');
      if (attempt.requests >= route.maxTurns) fail('TASK_MODEL_BUDGET', '达到本次执行的模型轮次预算，不因恢复而重置。');
      attempt.route ??= structuredClone(route); attempt.requestedModel ??= route.model;
      const actual = { vendor: model.vendor, id: model.id, name: model.name };
      if (attempt.actualModel && (attempt.actualModel.vendor !== actual.vendor || attempt.actualModel.id !== actual.id)) fail('TASK_MODEL_CHANGED', '恢复不能静默换模型，请核对后创建新执行尝试。');
      this.service.beforeModelRequest?.(task, owner, state);
      attempt.actualModel = actual; attempt.requests++; attempt.phase = 'model-in-flight'; attempt.state = 'running';
      return attempt.requests;
    });
  }
  executionArguments(name, input, owner, lease) {
    const state = this.service.read();
    if (!this.service.isCollaborationEnabled(state)) { if (lease) fail('COLLABORATION_DISABLED', '原协作执行已停用，旧令牌不继续调用工具。'); return input; }
    const task = this.ownedTask(state, owner);
    if (!task) { if (lease) fail('TASK_NOT_OWNED', '原执行所有权已释放，旧模型循环不能继续调用工具。'); return input; }
    if (lease) this.assertLease(task, owner, lease);
    const attempt = currentAttempt(task);
    if (attempt?.kind === 'mcp' && EXECUTION_SCOPED_TOOLS.has(name) && !lease) fail('TASK_EXECUTION_LEASE_REQUIRED', '领取任务后的工作区／命令调用必须带 execution_lease，使用最近 claim/resume 的 lease。');
    if (!attempt) { if (!this.service.readOnlyOperation(name, input) && !CONTROL_TOOLS.has(name) && !name.startsWith('bridge_')) fail('TASK_LEGACY_EXECUTION_UNFENCED', '旧执行没有隔离或回执，先核对交接，不直接续写。'); return input; }
    if (CONTROL_TOOLS.has(name) || name.startsWith('bridge_')) return input;
    if (attempt.workspace.mode === 'worktree' && ['get_diagnostics', 'lsp'].includes(name)) fail('TASK_WORKTREE_IDE_SCOPE', '此 IDE 工具仍绑定原工作区，不能冒充工作副本结果；请用已绑定工作副本的文件工具，不自动启动新语言服务。');
    const args = scopedArguments(name, input, attempt.workspace.root), readOnly = this.service.readOnlyOperation(name, args);
    this.service.assertTaskPaths?.(task, name, args, readOnly);
    if (COMMAND_TOOLS.has(name)) {
      if (!attempt.operations.some(operation => operation.commandId === args.command_id)) fail('TASK_COMMAND_NOT_OWNED', '此命令不属于当前执行尝试。');
    } else if (!readOnly) {
      if (task.status !== 'running' || attempt.state !== 'running' || attempt.workspaceOutcome !== 'completed') fail('TASK_EXECUTION_BLOCKED', '任务已阻塞，不能继续发出副作用操作。');
      if (attempt.operations.some(unknown)) fail('TASK_OUTCOME_UNKNOWN', '旧操作结果未知，禁止盲目重放或继续写入。');
      if (!knownWrites.has(name)) fail('TASK_TOOL_EXECUTION_SCOPE', '此工具没有任务工作副本绑定能力，不向隔离执行者授予未限定的外部副作用。');
      if (attempt.workspace.mode === 'read-only') fail('POLICY_READ_ONLY', '本执行尝试保持只读。');
      assertWritePaths(name, args, attempt.workspace.root);
    }
    return args;
  }
  async beginTool(name, args, owner, extra = {}) {
    const state = this.service.read(); if (!this.service.isCollaborationEnabled(state)) return null;
    const task = this.ownedTask(state, owner); if (!task || !currentAttempt(task) || CONTROL_TOOLS.has(name) || name.startsWith('bridge_') && !this.service.recordControlTool?.(name)) return null;
    if (extra.executionLease) this.assertLease(task, owner, extra.executionLease);
    const guardArgs=this.service.recordControlTool?.(name)&&args.task_id?{...args,workspace_id:this.task(state,args.task_id).workspaceId}:args;
    await this.service.guard(name, guardArgs, owner);
    const lease = task.lease, attempt = currentAttempt(task);
    return this.editAttempt(task.id, owner, lease, current => {
      if (current.operations.length >= 512) fail('TASK_RECEIPT_LIMIT', '本次执行达到 512 条回执预算，后续操作未执行。');
      if (!this.service.readOnlyOperation(name, args) && !COMMAND_TOOLS.has(name) && current.operations.some(unknown)) fail('TASK_OUTCOME_UNKNOWN', '同一执行已有在途或未知写入，后续副作用尚未执行。');
      const receipt = { id: 'receipt_' + crypto.randomUUID(), name, callId: extra.workerCallId || null, argsHash: digest(args), mutating: !this.service.readOnlyOperation(name, args), state: 'issued', purpose: name === 'run_command' ? commandPurpose(args.command) : 'inspection', startedAt: now() };
      this.service.decorateReceipt?.(receipt, name, args);
      current.operations.push(receipt); current.phase = 'tool-issued';
      return { taskId: task.id, attemptId: attempt.id, receiptId: receipt.id, lease, owner, name, commandId: args.command_id, filePaths: Array.isArray(args.files) ? args.files.map(file => file.path) : undefined };
    });
  }
  async finishTool(record, result) {
    if (!record) return result;
    const state = this.service.read(), task = this.task(state, record.taskId), attempt = this.attempt(task, record.attemptId);
    const reference = await this.storePrivate(task, attempt, record.receiptId + '.json', { format: 'opencode.execution-receipt.v1', taskId: task.id, attemptId: attempt.id, receiptId: record.receiptId, result });
    let receipt;
    await this.editAttempt(task.id, record.owner, record.lease, current => {
      const operation = current.operations.find(item => item.id === record.receiptId); if (!operation) fail('TASK_RECEIPT_UNKNOWN', '执行回执不存在。');
      const data = result.structuredContent || {}, partial = data.summary?.failed > 0 || data.summary?.skipped > 0 || data.summary?.truncated > 0 || data.truncated === true || data.output_lost === true;
      operation.state = result.isError && operation.mutating ? 'unknown' : 'completed'; operation.toolError = result.isError === true; operation.partial = !!partial; operation.resultRef = reference; operation.finishedAt = now();
      if (record.name === 'read_files' && Array.isArray(data.files)) operation.files = data.files.map((file, index) => ({ path: record.filePaths?.[index] || file.path, version: file.version, startLine: file.start_line, endLine: file.end_line, status: file.status, truncated: file.truncated === true }));
      if (record.name === 'apply_patch' && Array.isArray(data.files)) operation.changes = data.files.map(file => ({ path: file.path, destinationPath: file.destination_path, action: file.action, oldVersion: file.old_version, newVersion: file.new_version }));
      if (record.name === 'run_command' && data.command_id) { operation.commandId = data.command_id; operation.commandState = data.status; operation.exitCode = data.exit_code; }
      if (COMMAND_TOOLS.has(record.name)) {
        const command = current.operations.find(item => item.commandId === record.commandId && item.name === 'run_command');
        if (command && data.status && !result.isError) { command.commandState = data.status; if (data.exit_code !== undefined) command.exitCode = data.exit_code; operation.purpose = command.purpose; operation.commandState = data.status; operation.exitCode = data.exit_code; }
      }
      current.privateBytes += reference.bytes; current.phase = operation.state === 'unknown' ? 'outcome-unknown' : 'tool-returned'; receipt = structuredClone(operation);
    });
    return { ...result, content: [...(result.content || []), { type: 'text', text: 'OpenCode 执行回执：' + JSON.stringify({ attempt_id: record.attemptId, receipt_id: receipt.id, state: receipt.state, purpose: receipt.purpose, command_state: receipt.commandState, exit_code: receipt.exitCode }) }], _meta: { ...(result._meta || {}), opencodeExecution: { attempt_id: record.attemptId, receipt_id: receipt.id, state: receipt.state } } };
  }
  async toolOutcomeUnknown(record, message) {
    if (!record) return;
    await this.editAttempt(record.taskId, record.owner, record.lease, attempt => { const operation = attempt.operations.find(item => item.id === record.receiptId); if (operation) { operation.state = 'unknown'; operation.failure = cleanText(String(message).slice(0, 2000), 2000); } attempt.phase = 'outcome-unknown'; }).catch(() => {});
  }
  async recoveredToolResult(task, callId, args) {
    const attempt = this.attempt(task), operation = attempt.operations.findLast(item => item.callId === callId);
    if (!operation) return null;
    if (operation.argsHash !== digest(args)) fail('TASK_RECOVERY_INPUT_CHANGED', '恢复的工具调用内容已变化。');
    if (operation.resultRef) {
      const record = await this.readPrivate(attempt.id, operation.resultRef);
      if (record.receiptId !== operation.id || record.attemptId !== attempt.id) fail('TASK_CHECKPOINT_CHANGED', '回执归属不一致。');
      return { ...record.result, content: [...(record.result.content || []), { type: 'text', text: '恢复自已持久化回执，未重发工具：' + operation.id }], _meta: { ...(record.result._meta || {}), opencodeExecution: { attempt_id: attempt.id, receipt_id: operation.id, state: operation.state, recovered: true } } };
    }
    if (operation.mutating) fail('TASK_OUTCOME_UNKNOWN', '该副作用调用没有可恢复回执，不能自动重发。');
    return null; // Re-reading is permitted; a new receipt will record its actual outcome.
  }
  async recordedPatchDiff(attempt) {
    const blocks = []; let bytes = 0, partial = false;
    for (const operation of attempt.operations.filter(item => item.name === 'apply_patch' && item.state === 'completed' && !item.toolError && item.resultRef)) {
      const record = await this.readPrivate(attempt.id, operation.resultRef), data = record.result?.structuredContent;
      if (!data?.diff) continue;
      const text = '# 回执 ' + operation.id + '\n' + data.diff;
      if (bytes + Buffer.byteLength(text) > 2 * 1024 * 1024) { partial = true; break; }
      bytes += Buffer.byteLength(text); blocks.push(text); partial ||= data.diff_truncated === true;
    }
    return { text: blocks.join('\n\n'), available: blocks.length > 0, untracked: [], scope: 'recorded-patches', partial, includesUntrackedContents: false, reason: '仅保留已回执的 apply_patch 差异；没有完整 Git 基线，Shell 或其他工具改动不在此差异内。' };
  }
  async submitTask(input, owner) {
    const state = this.service.read(), task = this.task(state, input.task_id); this.assertLease(task, owner, input.lease);
    if (task.revision !== input.expected_revision || !['blocked', 'review', 'completed'].includes(input.status)) fail('TASK_VERSION_CONFLICT', '任务修订或提交状态无效。');
    if (input.status === 'blocked') return this.service.mutate('tasks', latest => {
      const current = this.task(latest, task.id); this.assertLease(current, owner, input.lease); if (current.revision !== input.expected_revision) fail('TASK_VERSION_CONFLICT', '任务已变化。');
      current.status = 'blocked'; current.executionState = 'blocked'; current.output = cleanText(input.output ?? '执行受阻。'); current.completionMode = 'blocked'; current.revision++; current.updatedAt = now();
      const attempt = currentAttempt(current); if (attempt) { attempt.state = 'blocked'; attempt.phase = attempt.operations.some(unknown) ? 'outcome-unknown' : 'blocked'; attempt.updatedAt = now(); }
      return this.service.publicTask(current);
    });
    const rules = this.assertRules(task, owner, state);
    if (task.claimRulesHash !== rules.rules_hash) fail('TASK_RULES_STALE', '规则或职位已变化，旧执行不能提交完成。');
    const attempt = this.attempt(task);
    if (attempt.workspaceOutcome !== 'completed' || attempt.operations.some(unknown)) fail('TASK_OUTCOME_UNKNOWN', '仍有未知副作用或运行中命令，不能提交完成。');
    this.service.beforeTaskCompletion?.(task, owner, state);
    const report = validateReportShape(input.result), assessment = evidenceAssessment(report, attempt.operations);
    const artifacts = await artifactManifest(attempt.workspace.root, [...task.requiredArtifacts, ...report.artifacts]);
    if (!artifacts.length && !attempt.operations.some(operation => operation.state === 'completed' && !operation.toolError) && task.roleId !== 'planner' && !this.service.allowEmptyDelivery?.(task, owner)) fail('TASK_DELIVERY_EVIDENCE_REQUIRED', '没有实际产物或成功工具回执；纯规划任务可交付结构化文本，其余不能只用一段回复完成。');
    let diff = await workspaceDiff(attempt.workspace, this.service.options.gitExecutable);
    if (!diff.available) { const recorded = await this.recordedPatchDiff(attempt); if (recorded.available) diff = recorded; }
    const diffRef = diff.available ? await this.storePrivate(task, attempt, 'diff_' + crypto.randomUUID() + '.json', diff) : null;
    const delivery=this.service.prepareTaskDelivery?await this.service.prepareTaskDelivery(task,artifacts):null;
    return this.service.mutate('tasks', latest => {
      const current = this.task(latest, task.id); this.assertLease(current, owner, input.lease);
      if (current.revision !== input.expected_revision || current.claimRulesHash !== this.service.effective(current.workspaceId, owner, latest).rules_hash) fail('TASK_VERSION_CONFLICT', '提交期间任务或规则已变化。');
      this.service.beforeTaskCompletion?.(current, owner, latest);
      const active = this.attempt(current); if (active.id !== attempt.id || active.operations.length !== attempt.operations.length || active.operations.some(unknown)) fail('TASK_EXECUTION_CHANGED', '产物收集期间执行状态已变化。');
      const needsReview = input.status === 'review' || owner.startsWith('native-chat:automation:') && latest.nativeTaskReviewRequired === true;
      current.status = needsReview ? 'review' : 'completed'; current.executionState = 'completed'; current.output = cleanText(input.output || report.summary); current.result = report; current.artifacts = artifacts; Object.assign(current, assessment);
      current.acceptanceState = needsReview ? 'pending' : 'not_required'; current.completedBy = publicAgentId(owner); current.completedAt = needsReview ? undefined : now(); current.completionMode = needsReview ? 'awaiting-review' : owner.startsWith('native-chat:automation:') ? 'native-auto' : 'agent-auto'; current.revision++; current.updatedAt = now();
      active.state = 'completed'; active.phase = 'submitted'; active.acceptanceState = needsReview ? 'pending' : 'not_required'; active.result = structuredClone(report); Object.assign(active, assessment); active.updatedAt = now(); active.artifacts = artifacts; active.diffAvailable = diff.available; active.diffUntracked = diff.untracked; active.diffNotice = diff.reason || 'diff 不包含未跟踪文件正文，须单独审查。'; if (diffRef) { active.diffRef = diffRef; active.privateBytes += diffRef.bytes; }
      if(delivery)this.service.finalizeTaskDelivery?.(current,delivery);
      delete current.owner; delete current.lease;
      return this.service.publicTask(current);
    });
  }
  async resumeNativeTask(id, revision, owner, route, signal) {
    const before = this.task(this.service.read(), id), old = this.attempt(before);
    const release = await acquireResources(['automation-attempt:' + old.id], { signal, timeoutMs: 1000 });
    try {
      this.service.beforeClaimTask?.(before, owner, this.service.read());
      if (old.kind !== 'native' || !['blocked', 'running'].includes(before.status)) fail('TASK_RECOVERY_UNAVAILABLE', '仅恢复有检查点的原生执行，不驱动外部 MCP 模型会话。');
      const payload = await this.loadCheckpoint(before);
      if (old.operations.some(unknown) || old.workspaceOutcome !== 'completed') fail('TASK_OUTCOME_UNKNOWN', '存在未知副作用或运行中命令，先核对交接，不能自动恢复。');
      if (!old.route || old.route.hash !== route.hash || old.actualModel && (old.actualModel.vendor !== route.model?.vendor || old.actualModel.id !== route.model?.id)) fail('TASK_RECOVERY_ROUTE_CHANGED', '模型、Skills 或预算已变化；请核对后作为新执行尝试，不静默替换。');
      await verifyWorkspace(old.workspace, this.service.options.gitExecutable);
      const claim = await this.service.mutate('tasks', state => {
        const task = this.task(state, id), attempt = this.attempt(task); const rules = this.assertRules(task, owner, state);
        if (task.revision !== revision || attempt.id !== old.id || attempt.operations.some(unknown)) fail('TASK_VERSION_CONFLICT', '恢复期间任务已变化。');
        if (task.claimRulesHash !== rules.rules_hash) fail('TASK_RULES_STALE', '规则已变化，旧模型上下文不能直接续跑。');
        task.owner = publicAgentId(owner); task.lease = crypto.randomUUID(); task.status = 'running'; task.executionState = 'running'; task.revision++; task.updatedAt = now(); attempt.ownerAgentId = task.owner; attempt.privateOwner = owner; attempt.hostPid = process.pid; attempt.state = 'running'; attempt.phase = 'resumed'; attempt.resumes = (attempt.resumes || 0) + 1;
        return { task: this.service.publicTask(task), lease: task.lease, attempt: safeAttempt(attempt) };
      });
      return { ...claim, payload, release };
    } catch (error) { release(); throw error; }
  }
  async blockInterruptedForHandoff(id, revision) {
    const before = this.task(this.service.read(), id), attempt = this.attempt(before);
    if (before.status !== 'running') return this.service.publicTask(before);
    if (attempt.kind !== 'native' || alive(attempt.hostPid)) fail('TASK_OWNER_ACTIVE', '执行进程仍存在或不是可确认中断的原生任务；不能强抢。');
    const release = await acquireResources(['automation-attempt:' + attempt.id], { timeoutMs: 1000 });
    try {
      return await this.service.mutate('tasks', state => { const task = this.task(state, id); if (task.revision !== revision || task.activeAttemptId !== attempt.id) fail('TASK_VERSION_CONFLICT', '任务已变化。'); task.status = 'blocked'; task.executionState = 'blocked'; task.revision++; task.updatedAt = now(); const current = this.attempt(task); current.state = 'blocked'; current.phase = 'interrupted'; return this.service.publicTask(task); });
    } finally { release(); }
  }
  async getExecution(input, owner = 'local-user') {
    const task = this.task(this.service.read(), input.task_id), attempt = this.attempt(task, input.attempt_id || task.activeAttemptId), own = owner === 'local-user' || attempt.ownerAgentId === publicAgentId(owner);
    const result = safeAttempt(attempt, true, own), offset = input.offset || 0, limit = Math.min(input.limit || 30, 100), receipts = result.receipts;
    result.receipts = receipts.slice(offset, offset + limit);
    return { task_id: task.id, task_revision: task.revision, attempt: result, total_count: receipts.length, next_offset: offset + result.receipts.length, has_more: offset + result.receipts.length < receipts.length };
  }
  async getDiff(taskId, attemptId) { const task = this.task(this.service.read(), taskId), attempt = this.attempt(task, attemptId || task.activeAttemptId); if (!attempt.diffRef) fail('TASK_DIFF_UNAVAILABLE', '没有已生成 diff；不把文件列表当作已审查。'); const current = await this.readPrivate(attempt.id, attempt.diffRef), baseline = attempt.baselineDiffRef ? await this.readPrivate(attempt.id, attempt.baselineDiffRef) : null; return { ...current, text: '# 执行开始时已有差异（不算作本次新增）\n' + (baseline?.available ? baseline.text : baseline?.reason || '无可用 Git 基线差异') + (current.scope === 'recorded-patches' ? '\n# 已记录的 apply_patch 差异（不是完整快照，Shell 等未覆盖）\n' : '\n# 提交时相对 Git 基线的当前差异（含原有改动，请区分）\n') + (current.partial ? '[差异预览不完整；完整已知工具结果仍保留在私有回执中]\n' : '') + current.text + '\n# Git hooks / filters 已禁用；LFS 等可能保留原始指针。diff 不是测试或审查通过。' }; }
  closeForHandoff(task, reason) { const attempt = currentAttempt(task); if (attempt) { if (attempt.state !== 'completed') attempt.state = 'handed-off'; if (attempt.acceptanceState === 'pending') attempt.acceptanceState = 'rejected'; attempt.phase = 'local-user-handoff'; attempt.handoffNote = reason; attempt.reconciliation = { by: 'local-user', at: now(), scope: 'explicit-handoff-only', recordedUnknownReceipts: attempt.operations.filter(unknown).map(operation => operation.id), workspaceOutcome: attempt.workspaceOutcome, automaticReplay: false }; attempt.updatedAt = now(); } }
  async sendMessage(input, owner = 'local-user') {
    return this.service.mutate('messages', state => {
      const task = this.task(state, input.task_id), sender = owner === 'local-user' ? owner : publicAgentId(owner);
      if (owner !== 'local-user' && this.service.role(owner, state)?.id === 'observer') fail('ROLE_TOOL_DENIED', '未分配成员不能发送协作决策。');
      let recipient = input.recipient;
      if (recipient === 'coordinator') recipient = task.createdBy;
      const peers = this.service.snapshot(task.workspaceId).agents;
      if (recipient !== 'local-user' && !state.agents[recipient] && !peers.some(agent => agent.id === recipient) && !state.tasks.some(item => item.owner === recipient || item.createdBy === recipient)) fail('MESSAGE_RECIPIENT_UNKNOWN', '收件人必须来自成员或任务记录；不按显示名猜测。');
      if (!['finding', 'question', 'handoff', 'blocked'].includes(input.kind)) fail('MESSAGE_KIND_INVALID', '消息类型无效。');
      const text = requiredText(input.text, 8000), attemptId = input.attempt_id || task.activeAttemptId || null;
      if (attemptId && !task.attempts.some(attempt => attempt.id === attemptId)) fail('TASK_ATTEMPT_UNKNOWN', '消息执行尝试不属于此任务。');
      const key = input.client_request_id ? digest(sender + '\0' + requiredText(input.client_request_id, 200)) : null, bodyHash = digest({ taskId: task.id, recipient, kind: input.kind, text, attemptId });
      if (key) { const previous = state.messages.find(item => item.clientKey === key); if (previous) { if (previous.bodyHash !== bodyHash) fail('MESSAGE_IDEMPOTENCY_CONFLICT', '同一请求键不能对应不同消息。'); return this.publicMessage(previous); } }
      if (state.messages.length >= 1000) fail('MESSAGE_LIMIT', '消息达到 1000 条；不会自动删除历史。');
      const message = { id: 'message_' + crypto.randomUUID(), sequence: ++state.messageSequence, taskId: task.id, workspaceId: task.workspaceId, attemptId, sender, recipient, kind: input.kind, text, state: 'sent', createdAt: now(), clientKey: key, bodyHash };
      state.messages.push(message); return this.publicMessage(message);
    });
  }
  publicMessage(message) { const { clientKey, bodyHash, ...result } = structuredClone(message); return result; }
  async listMessages(input = {}, owner = 'local-user') {
    return this.service.mutate('messages', state => {
      const recipient = owner === 'local-user' ? owner : publicAgentId(owner), workspaceId = input.workspace_id || (input.task_id ? this.task(state, input.task_id).workspaceId : this.service.currentWorkspaceId()), after = input.after_sequence || 0, limit = Math.min(input.limit || 30, 100);
      const visible = state.messages.filter(message => message.sequence > after && message.workspaceId === workspaceId && (!input.task_id || message.taskId === input.task_id) && (owner === 'local-user' || message.recipient === recipient || input.include_sent === true && message.sender === recipient)).sort((a, b) => a.sequence - b.sequence);
      const items = visible.slice(0, limit);
      for (const message of items) if (message.recipient === recipient && message.state === 'sent') { message.state = 'delivered'; message.deliveredAt = now(); }
      return { messages: items.map(message => this.publicMessage(message)), next_sequence: items.at(-1)?.sequence || after, has_more: visible.length > items.length, delivered_is_not_processed: true };
    });
  }
  async acknowledgeMessage(input, owner = 'local-user') {
    return this.service.mutate('messages', state => { const message = state.messages.find(item => item.id === input.message_id); if (!message) fail('MESSAGE_UNKNOWN', '消息 ID 必须来自收件箱。'); const recipient = owner === 'local-user' ? owner : publicAgentId(owner); if (message.recipient !== recipient) fail('MESSAGE_NOT_RECIPIENT', '只有实际收件人能标记处理。'); message.state = 'processed'; message.processedAt = now(); return this.publicMessage(message); });
  }
}
