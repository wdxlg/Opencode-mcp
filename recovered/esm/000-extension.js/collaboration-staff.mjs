// Explicitly authorized employees. No model, server, profile or migration starts here.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { AsyncLocalStorage } from 'node:async_hooks';
import { acquireResources } from './concurrency-runtime.mjs';
import { now, digest, publicAgentId, fail, requiredText, cleanText } from './collaboration-contracts.mjs';
import { canonicalPath, withinRoot } from './collaboration-workspaces.mjs';
import { StaffStore, createStaffFacade } from './collaboration-staff-store.mjs';
import { STAFF_TOOL_NAMES, STAFF_READ_TOOLS, STAFF_MANAGER_TOOLS, STAFF_RECEIPT_TOOLS, STAFF_NATIVE_HIDDEN, MANAGER_INSTRUCTIONS, employeeInput, integer, isStaffTask, publicEmployee } from './collaboration-staff-contracts.mjs';
import { integrateTask, publishTeam, reconcileIntegration, captureDelivery, finalizeDelivery } from './collaboration-staff-integration.mjs';

const finished = task => ['completed', 'review', 'blocked', 'cancelled'].includes(task.status);
const attemptOf = task => task.attempts?.find(item => item.id === task.activeAttemptId);
const controllerTools = new Set(['set_todos', 'update_plan', 'report_progress', 'list_skills', 'bridge_get_effective_rules', 'bridge_acknowledge_rules', 'bridge_join_employee', 'bridge_get_collaboration', 'get_command_output', 'cancel_command']);
const baseReadTools = ['read_files', 'read_image', 'find_files', 'search_files', 'list_directory', 'get_diagnostics', 'get_command_output', 'list_skills', 'bridge_get_collaboration', 'bridge_get_execution'];
const baseTaskTools = ['bridge_claim_task', 'bridge_update_task', 'bridge_send_message', 'bridge_list_messages', 'bridge_ack_message', 'bridge_checkpoint_task', 'bridge_resume_task'];
function result(value) { return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }], structuredContent: value }; }
function hasUnknown(task) { const attempt = attemptOf(task); return !!attempt && !attempt.reconciliation && (attempt.workspaceOutcome !== 'completed' || attempt.operations.some(item => item.commandState === 'running' || item.mutating && ['issued', 'unknown'].includes(item.state))); }
function unresolved(task) { const attempt = attemptOf(task); if (!attempt || attempt.reconciliation) return false; if (attempt.workspaceOutcome === 'unknown' || attempt.operations.some(item => item.mutating && item.state === 'unknown')) return true; if (task.status === 'blocked' || attempt.state === 'blocked') return hasUnknown(task); if (attempt.kind === 'native' && Number.isSafeInteger(attempt.hostPid)) { try { process.kill(attempt.hostPid, 0); } catch (error) { if (error.code === 'ESRCH') return hasUnknown(task); } } return false; }
function safeRelative(root, file) { if (!withinRoot(file, root)) fail('STAFF_SCOPE_ESCAPE', '文件路径不在本次执行目录内。'); return path.relative(root, file).replaceAll('\\', '/'); }

export class StaffService {
  constructor(parent) {
    this.parent = parent; this.internalContext=new AsyncLocalStorage(); this.store = new StaffStore(parent); this.bindings = new Map(); this.grants = new Map(); this.bootId = crypto.randomUUID(); this.bridge = null; this.workers = null; this.scheduling = false; this.scheduled = false; this.again = false; this.facade = createStaffFacade(parent, this);
    this.timer=setInterval(()=>{if(this.grants.size)this.schedule();},1000);this.timer.unref?.();
    this.unsubscribe = parent.onDidChange(kind => { if (kind.startsWith('staff')) this.schedule(); else if (kind === 'collaboration-switch' && !parent.isCollaborationEnabled()) void this.pauseAll('协作已关闭，记录与所有权保留。'); });
  }
  attach(bridge, workers) { this.bridge = bridge; this.workers = workers; this.refreshSkillRoots(); }
  refreshSkillRoots() { try { const listing=this.bridge.dispatcher.handleListSkills().result; this.skillRoots=listing.isError?[]:(listing.structuredContent?.skills||[]).filter(item=>item.enabled&&item.loaded).map(item=>item.directory); } catch { this.skillRoots=[]; } }
  employee(data, id) { const employee = data.employees.find(item => item.id === id); if (!employee) fail('STAFF_EMPLOYEE_UNKNOWN', '员工 ID 必须来自本地员工列表。'); return employee; }
  run(data, id) { const run = data.runs.find(item => item.id === id); if (!run) fail('STAFF_TEAM_UNKNOWN', '团队 ID 必须来自已授权团队。'); return run; }
  task(data, id) { const task = data.tasks.find(item => item.id === id); if (!task) fail('TASK_UNKNOWN', '团队任务 ID 必须来自实际清单。'); return task; }
  bound(owner, data = this.store.read()) { const binding = this.bindings.get(owner); return binding ? this.employee(data, binding.employeeId) : null; }
  forCaller(owner, input = {}) { return this.bindings.has(owner) || isStaffTask(input?.task_id) || isStaffTask(input?.manager_task_id) ? this.facade : this.parent; }
  isReadTool(name) { return STAFF_READ_TOOLS.has(name); }
  async saveEmployee(input) {
    this.parent.requireCollaboration(); const value = employeeInput(input), role = this.parent.read().roles.find(item => item.id === value.roleId);
    if (!role || role.id === 'observer') fail('STAFF_ROLE_REQUIRED', '请选择明确分配的职位；未分配只读不是员工的隐式提权入口。');
    if (value.canManage && !this.parent.allows(role, 'bridge_delegate_task')) fail('STAFF_MANAGER_ROLE', '该职位未授权派工；请显式创建经理职位模板或调整职位白名单。');
    if (value.allowShell && !value.allowedPaths.includes('.')) fail('STAFF_SHELL_SCOPE', '子目录责任范围不启用通用Shell；cwd不是目录沙箱。');
    return this.store.mutate('staff-employees', data => {
      const previous = input.id ? this.employee(data, input.id) : null;
      if (previous && previous.version !== input.expected_version) fail('STAFF_VERSION_CONFLICT', '员工配置已变化，重新读取后保存。');
      if (previous && data.tasks.some(task => task.staff.employeeId === previous.id && task.owner)) fail('STAFF_EMPLOYEE_BUSY', '员工仍持有执行，先结束或核对交接，不在运行中换身份/职位/模型。');
      if (!previous && data.employees.length >= 64) fail('STAFF_LIMIT', '最多保留 64 名员工；不自动删除。');
      const employee = { ...(previous || {}), ...value, id: previous?.id || 'employee_' + crypto.randomUUID(), version: (previous?.version || 0) + 1, updatedAt: now() };
      if (previous && previous.kind !== value.kind && (previous.pairedAgentId || [...this.bindings.values()].some(binding => binding.employeeId === previous.id))) fail('STAFF_BINDING_ACTIVE', '先解除连接绑定，再改变执行后端。');
      if (previous) Object.assign(previous, employee); else data.employees.push(employee);
      return publicEmployee(employee);
    });
  }
  async createRoleTemplate(kind) {
    this.parent.requireCollaboration();
    const manager = kind === 'manager', review = kind === 'reviewer';
    if (!manager && !review) fail('STAFF_ROLE_TEMPLATE', '只提供经理与团队审查模板，不改写已有自定义职位。');
    return this.parent.saveRole({ name: manager ? '经理 / 团队派工与整合' : '团队审查 / 只读', readOnly: review, instructions: manager ? MANAGER_INSTRUCTIONS : '只读核对团队真实产物和执行回执；没有运行的检查不得宣称通过。', allowedTools: [...new Set([...baseReadTools, ...baseTaskTools, ...STAFF_READ_TOOLS, ...(manager ? [...STAFF_MANAGER_TOOLS, 'apply_patch'] : ['lsp'])])] });
  }
  async issuePairing(id, version) {
    this.parent.requireCollaboration(); const token = crypto.randomBytes(24).toString('base64url');
    const expiry = Date.now() + 10 * 60000;
    await this.store.mutate('staff-pairing', data => { const employee = this.employee(data, id); if (employee.kind !== 'mcp' || employee.version !== version || !employee.enabled) fail('STAFF_VERSION_CONFLICT', 'MCP员工配置已变化或未启用。'); employee.pairingHash = digest(token); employee.pairingExpiresAt = expiry; employee.pairingConsumedAt = null; });
    return { employee_id: id, enrollment_token: token, expires_at: new Date(expiry).toISOString() };
  }
  validateBinding(owner, employee, data) {
    if (this.parent.read().tasks.some(task => task.owner === publicAgentId(owner))) fail('STAFF_CALLER_BUSY', '当前调用者已有普通协作任务，先完成或明确交接，不切换工具所属执行。');
    const old = this.bindings.get(owner); if (old && old.employeeId !== employee.id) fail('STAFF_CALLER_BOUND', '同一真实连接只绑定一名员工，不能通过显示名切换身份。');
    if ([...this.bindings].some(([other, binding]) => other !== owner && binding.employeeId === employee.id && (this.parent.currentMcpConnections().some(peer => peer.owner === other) || data.tasks.some(task => task.owner === publicAgentId(other))))) fail('STAFF_EMPLOYEE_BUSY', '员工已有实际连接或持有任务，不超时夺取。');
    if (data.tasks.some(task => task.staff.employeeId === employee.id && task.owner && task.owner !== publicAgentId(owner))) fail('STAFF_EMPLOYEE_BUSY', '旧执行所有权仍保留，请核对后交接，不能借配对码取得旧命令句柄。');
  }
  async bindMcp(id, agentId) {
    this.parent.requireCollaboration(); const peer = this.parent.currentMcpConnections().find(item => publicAgentId(item.owner) === agentId);
    if (!peer) fail('STAFF_CONNECTION_UNKNOWN', '连接必须来自当前实际确认的MCP成员，不按名称猜测。');
    await this.store.mutate('staff-binding', data => { const employee = this.employee(data, id); if (employee.kind !== 'mcp' || !employee.enabled) fail('STAFF_KIND_INVALID', '只能绑定启用的MCP员工。'); this.validateBinding(peer.owner, employee, data); employee.pairedAgentId = agentId; employee.pairingHash = null; employee.updatedAt = now(); });
    if(this.parent.read().agents[agentId]?.roleId&&this.parent.read().agents[agentId].roleId!=='observer')await this.parent.assignAgent(agentId,'observer');
    this.bindings.set(peer.owner, { employeeId: id, kind: 'mcp' }); this.parent.issued.delete(this.parent.key(peer.owner, this.parent.currentWorkspaceId())); this.parent.emit('staff'); return { employee_id: id, agent_id: agentId, reread_rules: true };
  }
  async join(owner, input) {
    this.parent.requireCollaboration();
    const rules = this.parent.effective(this.parent.currentWorkspaceId(), owner);
    if (!this.bindings.has(owner) && this.parent.acknowledged.get(this.parent.key(owner, rules.workspace_id)) !== rules.rules_hash) fail('RULES_ACK_REQUIRED', '先完整读取并确认当前连接规则，再配对员工。');
    await this.store.mutate('staff-enrollment', data => {
      const employee = this.employee(data, input.employee_id); if (employee.kind !== 'mcp' || !employee.enabled) fail('STAFF_EMPLOYEE_DISABLED', 'MCP员工未启用。'); this.validateBinding(owner, employee, data);
      const already = employee.pairedAgentId === publicAgentId(owner);
      if (!already) { const token = typeof input.enrollment_token === 'string' ? input.enrollment_token : ''; if (!employee.pairingHash || employee.pairingConsumedAt || employee.pairingExpiresAt < Date.now() || !crypto.timingSafeEqual(Buffer.from(digest(token)), Buffer.from(employee.pairingHash))) fail('STAFF_PAIRING_DENIED', '配对码无效、过期或已使用；请由本地用户绑定实际连接或重新复制配对码。'); }
      employee.pairedAgentId = publicAgentId(owner); employee.pairingConsumedAt = now();
    });
    const actualAgent=publicAgentId(owner);if(this.parent.read().agents[actualAgent]?.roleId&&this.parent.read().agents[actualAgent].roleId!=='observer')await this.parent.assignAgent(actualAgent,'observer');
    this.bindings.set(owner, { employeeId: input.employee_id, kind: 'mcp' }); this.parent.emit('staff');
    return { employee: publicEmployee(this.employee(this.store.read(), input.employee_id)), agent_id: publicAgentId(owner), reread_rules: true, rule_read_tool: 'bridge_get_effective_rules', dispatch: 'client-pulls-assigned-team-tasks', provider_session_restored: false };
  }
  async unbind(id) {
    return this.store.mutate('staff-unbind', data => { const employee = this.employee(data, id); if (data.tasks.some(task => task.staff.employeeId === id && task.owner)) fail('STAFF_EMPLOYEE_BUSY', '先处理员工仍持有的任务，不通过解绑绕过所有权。'); for (const [owner, binding] of this.bindings) if (binding.employeeId === id) this.bindings.delete(owner); delete employee.pairedAgentId; delete employee.pairingHash; delete employee.pairingExpiresAt; employee.updatedAt = now(); return { unbound: true }; });
  }
  async saveTeam(input) {
    this.parent.requireCollaboration(); const workspace = this.parent.workspace(input.workspace_id); if (!workspace.root) fail('STAFF_WORKSPACE_REQUIRED', '团队必须指定实际项目目录。');
    if (!['auto', 'worktree', 'single-writer'].includes(input.isolation)) fail('TASK_ISOLATION_INVALID', '请选择明确的隔离方式。');
    const members = [...new Set(input.memberIds || [])]; if (!members.length || members.length > 20 || members.includes(input.managerId)) fail('STAFF_MEMBERS_INVALID', '团队需 1–20 名员工，经理不能同时占员工席位。');
    const value = { name: requiredText(input.name), goal: requiredText(input.goal, 16000), workspaceId: workspace.id, managerId: requiredText(input.managerId, 100), memberIds: members, maxTasks: integer(input.maxTasks, 2, 40, '任务总数'), maxNativeRequests: integer(input.maxNativeRequests, 1, 120, '原生模型请求总数'), isolation: input.isolation, requireIntegration: input.requireIntegration === true, publishToSource: input.publishToSource === true };
    if (value.publishToSource && !value.requireIntegration) fail('STAFF_INTEGRATION_REQUIRED', '应用回原项目须先启用结果整合。');
    return this.store.mutate('staff-teams', data => {
      const old = input.id ? this.run(data, input.id) : null; if (old && (old.version !== input.expected_version || this.grants.has(old.id) || old.phase==='active' )) fail('STAFF_VERSION_CONFLICT', '团队运行中或配置已变化；先暂停并核对执行。');
      const manager = this.employee(data, value.managerId); if (!manager.enabled || !manager.canManage) fail('STAFF_MANAGER_REQUIRED', '选择本地明确赋予经理能力的员工。');
      for (const id of members) if (!this.employee(data, id).enabled) fail('STAFF_EMPLOYEE_DISABLED', '团队含停用员工。');
      if(old&&data.tasks.some(task=>task.staff.runId===old.id&&task.owner)){const unchanged=['goal','workspaceId','managerId','memberIds','isolation','requireIntegration','publishToSource'].every(key=>JSON.stringify(old[key])===JSON.stringify(value[key]));if(!unchanged)fail('STAFF_TEAM_BUSY','仍有保留所有权的执行，只允许暂停后调整预算，不静默改任务目标或范围。');}
      if(old&&(value.maxNativeRequests<old.nativeRequests||value.maxTasks<data.tasks.filter(task=>task.staff.runId===old.id).length))fail('STAFF_BUDGET_INVALID','预算不能低于已实际使用的请求或任务数。');
      if (old && (old.workspaceId !== value.workspaceId || old.managerId !== value.managerId || JSON.stringify(old.memberIds) !== JSON.stringify(value.memberIds))) fail('STAFF_TEAM_IDENTITY_FIXED', '已有团队不更换项目、经理或成员身份；请保留历史后建立新团队。');
      const run = { ...(old || { id: 'team_' + crypto.randomUUID(), phase: 'draft', nativeRequests: 0, integrations: [], createdAt: now() }), ...value, version: (old?.version || 0) + 1, updatedAt: now() };
      if (old) Object.assign(old, run); else data.runs.push(run); return this.publicRun(run, data);
    });
  }
  previewActivation(id) {
    this.parent.requireCollaboration(); const data = this.store.read(), run = this.run(data, id);
    if (!this.workers || !this.bridge) fail('STAFF_EXECUTOR_UNAVAILABLE', '团队执行器尚未绑定。');
    if (this.grants.has(id) || this.workers.active.size && [...this.workers.active.keys()].some(taskId => this.task(data, taskId).staff.runId === id)) fail('STAFF_TEAM_ACTIVE', '团队仍在本机执行；先暂停并等待当前调用结束。');
    if (data.tasks.some(task => task.staff.runId === id && hasUnknown(task)) || run.integrations.some(item => ['issued', 'unknown', 'partial'].includes(item.state) && !item.reconciled)) fail('STAFF_OUTCOME_UNKNOWN', '团队仍有未知副作用或整合结果，先核对，不自动续跑。');
    const people = [run.managerId, ...run.memberIds].map(employeeId => this.employee(data, employeeId));
    for (const employee of people) if (!employee.enabled || !this.parent.read().roles.some(role => role.id === employee.roleId)) fail('STAFF_EMPLOYEE_DISABLED', '员工停用或职位已不存在。');
    const manager = people[0], role = this.parent.read().roles.find(item => item.id === manager.roleId);
    const roots=this.bridge.dispatcher.deps.fileToolRoots?.()||this.bridge.dispatcher.deps.workspaceRoots();const workspaceRoot=this.parent.workspace(run.workspaceId).root;if(!roots.some(root=>withinRoot(workspaceRoot,root)))fail('STAFF_WORKSPACE_NOT_ALLOWED','项目不在当前文件访问范围；请由本地用户打开项目或明确调整文件访问设置，不自动扩权。');
    if((run.requireIntegration||run.publishToSource)&&this.parent.effective(run.workspaceId).policies.readOnly)fail('POLICY_READ_ONLY','当前工作区规则只读，不能授权写入整合。');
    if (!manager.canManage || !this.parent.allows(role, 'bridge_delegate_task') || !this.parent.allows(role, 'bridge_review_task')) fail('STAFF_MANAGER_ROLE', '经理缺少派工或审查权限。');
    if(run.requireIntegration&&people.slice(1).some(employee=>employee.allowedPaths.some(prefix=>!manager.allowedPaths.some(allowed=>allowed==='.'||prefix!=='.'&&(prefix===allowed||prefix.startsWith(allowed+'/'))))))fail('STAFF_MANAGER_SCOPE','经理写入范围不足以整合所选员工的目录责任，先在本地调整配置。');
    if(run.isolation==='worktree'&&this.parent.effective(run.workspaceId).policies.allowCommands===false)fail('POLICY_COMMANDS_DISABLED','规则不允许为独立worktree调用Git。');
    if (run.requireIntegration && (role.readOnly || !this.parent.allows(role, 'bridge_integrate_task') || !this.parent.allows(role, 'apply_patch'))) fail('STAFF_MANAGER_ROLE', '整合需显式的整合与apply_patch权限；不能靠模型或职位名字提权。');
    if (run.publishToSource && !this.parent.allows(role, 'bridge_publish_team')) fail('STAFF_MANAGER_ROLE', '经理未获准应用回原项目。');
    const fingerprint=this.activationFingerprint(run,data);
    return { run: this.publicRun(run, data), version: run.version, fingerprint, employees: people.map(employee => publicEmployee(employee)), workspace: this.parent.workspace(run.workspaceId), resumableTasks: data.tasks.filter(task => task.staff.runId === id && ['blocked', 'running'].includes(task.status) && attemptOf(task)?.kind === 'native' && attemptOf(task)?.checkpoint && !task.staff.supersededBy).map(task => task.id) };
  }
  activationFingerprint(run,data) { const rules=this.parent.read(); return digest({ run:this.publicRun(run,data), employees:[run.managerId,...run.memberIds].map(id=>publicEmployee(this.employee(data,id))), roles:rules.roles.filter(role=>[run.managerId,...run.memberIds].some(id=>this.employee(data,id).roleId===role.id)), rules:this.parent.effective(run.workspaceId).rules_hash, globalRules:this.parent.effective('global').rules_hash, collaborationVersion:rules.collaborationVersion }); }
  async activate(id, version, fingerprint) {
    const preview = this.previewActivation(id); if (preview.version !== version || preview.fingerprint !== fingerprint) fail('STAFF_VERSION_CONFLICT', '团队已变化，请重新确认。');
    const release = await acquireResources(['opencode-staff-run:' + id], { timeoutMs: 1000 });
    try {
      await this.store.mutate('staff-authorization', data => {
        const run = this.run(data, id); if (run.version !== version || this.activationFingerprint(run,data)!==fingerprint) fail('STAFF_VERSION_CONFLICT', '授权期间团队、规则、职位或员工配置已变化。');
        run.employeeVersions = Object.fromEntries([run.managerId, ...run.memberIds].map(employeeId => [employeeId, this.employee(data, employeeId).version])); run.roleVersions = Object.fromEntries([run.managerId, ...run.memberIds].map(employeeId => { const employee = this.employee(data, employeeId); return [employee.roleId, this.parent.read().roles.find(role => role.id === employee.roleId).version]; }));
        run.phase = 'active'; run.authorizationHost = this.bootId; run.authorizationPid = process.pid; run.authorizedAt = now(); run.version++; run.lastError = null;
        for (const task of data.tasks.filter(task => task.staff.runId === id && !task.attempts.length && ['queued', 'blocked'].includes(task.status))) { const employee = this.employee(data, task.staff.employeeId); task.staff.employeeVersion = employee.version; task.roleId = employee.roleId; task.model = employee.kind === 'api' ? employee.model : null; task.status = 'queued'; task.revision++; task.updatedAt = now(); }
      });
      this.grants.set(id, { release, resumeTasks: new Set(preview.resumableTasks) });
      if (!this.store.read().tasks.some(task => task.staff.runId === id && task.staff.manager)) await this.facade.createTask({ workspace_id: preview.workspace.id, title: preview.run.name + ' / 经理', goal: preview.run.goal, role_id: preview.employees[0].roleId, category_id: 'implementation', isolation: preview.run.isolation, model: preview.employees[0].model || undefined, max_turns: 12, client_request_id: 'manager:' + id }, 'local-user', { runId: id, employeeId: preview.employees[0].id, manager: true });
      this.schedule(); return { authorized: true, run: this.publicRun(this.run(this.store.read(), id), this.store.read()) };
    } catch (error) { this.grants.delete(id); release(); throw error; }
  }
  async pause(id, reason = '本地用户暂停团队；不代表已有命令或外部MCP进程已停止。') {
    const grant = this.grants.get(id); this.grants.delete(id); grant?.release();
    const data = this.store.read(); for (const task of data.tasks.filter(task => task.staff.runId === id)) this.workers?.stop(task.id);
    return this.store.mutate('staff-pause', current => { const run = this.run(current, id); run.phase = 'paused'; run.pauseReason = reason; run.version++; run.updatedAt = now(); return this.publicRun(run, current); });
  }
  async pauseAll(reason) { for (const id of [...this.grants.keys()]) await this.pause(id, reason).catch(error => this.parent.options.log?.(error.message)); }
  requireGrant(run, data) {
    this.parent.requireCollaboration(); if (run.phase !== 'active' || run.authorizationHost !== this.bootId || !this.grants.has(run.id)) fail('STAFF_AUTHORIZATION_REQUIRED', '团队未在本进程明确授权或已暂停；重启不自动产生模型费用。');
    for (const id of [run.managerId, ...run.memberIds]) { const employee = this.employee(data, id), role = this.parent.read().roles.find(item => item.id === employee.roleId); if (!employee.enabled || employee.version !== run.employeeVersions?.[id] || !role || role.version !== run.roleVersions?.[employee.roleId]) fail('STAFF_CONFIG_CHANGED', '员工、职位或模型配置已变化，请暂停并重新明确授权，不使用旧启动配置。'); }
    return run;
  }
  decorateTask(task, input, owner, state, allocation) {
    if (!allocation) fail('STAFF_ASSIGNMENT_REQUIRED', '团队任务必须由显式派工创建。');
    const data = { employees: state.staffEmployees, runs: state.staffRuns, tasks: state.tasks }, run = this.requireGrant(this.run(data, allocation.runId), data), employee = this.employee(data, allocation.employeeId);
    if (task.workspaceId !== run.workspaceId || ![run.managerId, ...run.memberIds].includes(employee.id)) fail('STAFF_ASSIGNMENT_SCOPE', '任务或员工越过本次授权团队。');
    if (state.tasks.filter(item => item.staff.runId === run.id).length >= run.maxTasks) fail('STAFF_TASK_BUDGET', '达到授权任务总数，不自动扩张团队。');
    if (!allocation.manager && !allocation.publication) this.manager(owner, allocation.managerTaskId, allocation.lease, state);
    task.roleId = employee.roleId; task.model = employee.kind === 'api' ? employee.model : null; task.isolation = allocation.publication ? 'single-writer' : run.isolation;
    task.staff = { runId: run.id, employeeId: employee.id, employeeVersion: employee.version, manager: allocation.manager === true, publication: allocation.publication === true, reworkOf: allocation.reworkOf || null, review: null, integrated: false };
    if (employee.id === run.managerId && !task.staff.manager && !task.staff.publication) fail('STAFF_MANAGER_ASSIGNMENT', '经理不能同时冒充普通员工领取自己的派工。');
    if(allocation.reworkOf){const previous=this.task(data,allocation.reworkOf);if(previous.staff.runId!==run.id||!finished(previous)||hasUnknown(previous))fail('STAFF_REWORK_REFUSED','未知或未结束执行不能返工替代。');if(this.workers?.active.has(previous.id))fail('STAFF_EMPLOYEE_BUSY','原生执行尚未退出，等待实际循环结束后再返工。');const old=attemptOf(previous);if(old){old.state='superseded-known';old.phase='manager-approved-rework';old.handoffNote='经理在已授权团队内明确创建后继任务；旧结果已知，无在途命令，不是自动重放。';old.reconciliation={by:'manager-employee',employeeId:run.managerId,at:now(),scope:'known-terminal-only',automaticReplay:false};}delete previous.owner;delete previous.lease;previous.staff.supersededBy=task.id;previous.revision++;previous.updatedAt=now();}
    run.version++; run.updatedAt = now();
  }
  beforeClaim(task, owner, state) {
    const data = { employees: state.staffEmployees, runs: state.staffRuns, tasks: state.tasks }, binding = this.bindings.get(owner), employee = binding && this.employee(data, binding.employeeId), run = this.requireGrant(this.run(data, task.staff.runId), data);
    if(task.staff.publication&&!binding?.internalPublication)fail('STAFF_PUBLICATION_INTERNAL','回写执行只由已授权的宿主接口持有，外部客户端不能领取。');
    if(task.staff.supersededBy)fail('STAFF_TASK_SUPERSEDED','该执行已被明确返工任务替代，不恢复旧租约。');
    if (!employee || employee.id !== task.staff.employeeId || employee.version !== task.staff.employeeVersion) fail('STAFF_ASSIGNMENT_MISMATCH', '该任务只分配给指定员工，不能仅靠相同职位领取。');
    if(task.dependencies.some(id=>{const dependency=this.task(data,id);return dependency.staff.review?.decision!=='accept';}))fail('STAFF_DEPENDENCY_REVIEW_PENDING','依赖结果还未由经理实际审查接受。');
    if (!task.staff.publication && state.tasks.some(other => other.id !== task.id && other.staff.employeeId === employee.id && other.owner)) fail('STAFF_EMPLOYEE_BUSY', '员工已有执行，不并发复用同一员工上下文。');
    if (state.tasks.some(other => other.staff.runId === run.id && unresolved(other))) fail('STAFF_OUTCOME_UNKNOWN', '团队存在未知副作用，不能借新任务继续变更。');
  }
  bindNative(owner, task) { const data = this.store.read(), employee = this.employee(data, task.staff.employeeId); this.requireGrant(this.run(data, task.staff.runId), data); if (employee.kind !== 'api' && !task.staff.publication) fail('STAFF_KIND_INVALID', '外部MCP员工必须主动接单，不由原生模型冒充。'); this.bindings.set(owner, { employeeId: employee.id, kind: 'api' }); }
  unbindNative(owner) { this.bindings.delete(owner); }
  beforeModelRequest(task, owner, state) {
    const data = { employees: state.staffEmployees, runs: state.staffRuns, tasks: state.tasks }, run = this.requireGrant(this.run(data, task.staff.runId), data);
    if (state.tasks.some(item => item.staff.runId === run.id && unresolved(item))) fail('STAFF_OUTCOME_UNKNOWN', '团队存在未知结果，不追加模型请求。');
    if (run.nativeRequests >= run.maxNativeRequests) fail('STAFF_MODEL_BUDGET', '团队达到原生模型请求总上限，恢复不重置。');
    run.nativeRequests++; run.version++;
  }
  assertPaths(task, name, args, readOnly) {
    const data = this.store.read(), employee = this.employee(data, task.staff.employeeId), attempt = attemptOf(task); if (!attempt) fail('TASK_ATTEMPT_UNKNOWN', '员工尚未建立执行尝试。');
    if (['run_command', 'send_command_input'].includes(name) && (!employee.allowShell || !employee.allowedPaths.includes('.'))) fail('STAFF_SHELL_DISABLED', '此员工未明确启用通用Shell；子目录范围不能靠cwd伪装成沙箱。');
    const paths = name === 'apply_patch' ? [...String(args.patch || '').matchAll(/^\*\*\* (?:Add File|Update File|Delete File|Move to): (.+)$/gm)].map(match => match[1]) : name === 'read_files' ? (args.files || []).map(file => file.path) : [args.path, args.cwd].filter(Boolean);
    for (const file of paths) {
      if (readOnly) {
        const roots = [attempt.workspace.root, this.parent.workspace(task.workspaceId).root, ...(this.skillRoots || [])].filter(Boolean);
        if (!roots.some(root => withinRoot(file, root))) fail('STAFF_READ_OUTSIDE_PROJECT', '员工只读取授权项目、执行副本或实际安装的Skill；其他员工产物请用 bridge_read_artifact。');
      } else {
        const relative = safeRelative(attempt.workspace.root, file),key=process.platform==='win32'?relative.toLowerCase():relative;
        if (key.split('/').includes('.git') || !employee.allowedPaths.some(prefix => {const p=process.platform==='win32'?prefix.toLowerCase():prefix;return p==='.'||key===p||key.startsWith(p+'/');})) fail('STAFF_WRITE_SCOPE', '写入超出该员工的目录责任范围。');
      }
    }
  }
  guardCall(name, args, owner) {
    if (!this.bindings.has(owner)) { if (!controllerTools.has(name)) fail('STAFF_EMPLOYEE_REQUIRED', '先以真实连接绑定员工。'); return; }
    if (controllerTools.has(name) || STAFF_TOOL_NAMES.has(name)) return;
    const data = this.store.read(), task = data.tasks.find(item => item.owner === publicAgentId(owner));
    if (!task) fail('STAFF_TASK_REQUIRED', '员工先从获准清单领取分配给自己的任务，再访问项目工具。');
    if (name === 'bridge_update_task' && args.status === 'blocked') return;
    if(args.task_id&&isStaffTask(args.task_id))this.allowedRun(owner,this.task(data,args.task_id).staff.runId,data);
    const run = this.requireGrant(this.run(data, task.staff.runId), data);
    if((task.staff.manager||task.staff.publication)&&['apply_patch','run_command','send_command_input'].includes(name)&&this.internalContext.getStore()?.owner!==owner)fail('STAFF_MANAGER_TYPED_WRITES','经理只使用已授权的审查、整合与回写接口，不直接修改文件或启动Shell。');
    if (!this.facade.readOnlyOperation(name, args) && !name.startsWith('bridge_') && data.tasks.some(item => item.staff.runId === run.id && unresolved(item))) fail('STAFF_OUTCOME_UNKNOWN', '团队有未知副作用，禁止追加变更。');
  }
  manager(owner, taskId, lease, state = this.facade.read()) {
    const task = this.facade.task(state, taskId); this.facade.collaboration.assertLease(task, owner, lease);
    const data = { employees: state.staffEmployees, runs: state.staffRuns, tasks: state.tasks }, employee = this.bound(owner, data), run = this.requireGrant(this.run(data, task.staff.runId), data);
    if (!employee?.canManage || employee.id !== run.managerId || !task.staff.manager || task.status !== 'running') fail('STAFF_MANAGER_REQUIRED', '只有本次团队经理的有效执行可管理员工，职位名称或模型选择不授权。');
    return { task, employee, run, data };
  }
  allowedRun(owner, runId, data = this.store.read()) { const employee = this.bound(owner, data), run = this.run(data, runId); if (!employee || !employee.enabled || ![run.managerId, ...run.memberIds].includes(employee.id)) fail('STAFF_TEAM_DENIED', '员工不在此团队授权范围。'); return run; }
  publicRun(run, data) {
    const tasks = data.tasks.filter(task => task.staff.runId === run.id), manager = tasks.find(task => task.staff.manager);
    const phase = manager?.status === 'completed' ? 'completed' : run.phase === 'active' && manager?.status === 'review' ? 'awaiting_acceptance' : run.phase === 'active' && manager?.status === 'blocked' ? 'needs_attention' : run.phase === 'active' && !this.grants.has(run.id) ? 'confirmation_required' : run.phase;
    return { id: run.id, name: run.name, goal: run.goal, workspaceId: run.workspaceId, managerId: run.managerId, memberIds: run.memberIds, maxTasks: run.maxTasks, maxNativeRequests: run.maxNativeRequests, nativeRequests: run.nativeRequests, taskCount: tasks.length, isolation: run.isolation, requireIntegration: run.requireIntegration, publishToSource: run.publishToSource, version: run.version, phase, managerTaskId: manager?.id || null, integrationRoot: manager && attemptOf(manager)?.workspace.root || null, lastError: run.lastError || null, pauseReason: run.pauseReason || null, externalModelCostsMetered: false, restartRequiresConfirmation: true, authorizedHere:this.grants.has(run.id), integrations: run.integrations.map(item => ({ id: item.id, taskId: item.taskId, state: item.state, error: item.error, reconciled: item.reconciled === true })), updatedAt: run.updatedAt };
  }
  connection(employee) {
    const entries = [...this.bindings].filter(([, binding]) => binding.employeeId === employee.id), peers = this.parent.currentMcpConnections();
    const entry = entries.find(([owner]) => employee.kind === 'api' || peers.some(peer => peer.owner === owner));
    return { configured: employee.enabled, connected: employee.kind === 'mcp' && !!entry, active: employee.kind === 'api' && !!entry, agentId: entry ? publicAgentId(entry[0]) : null, connectionMeaning: employee.kind === 'api' ? '配置引用或当前执行，不是供应商健康认证' : '真实MCP连接确认，不是已执行任务证明' };
  }
  snapshot(workspaceId) {
    try { const data = this.store.read(); return { revision: data.revision, employees: data.employees.map(employee => publicEmployee(employee, this.connection(employee))), runs: data.runs.filter(run => run.workspaceId === workspaceId).map(run => this.publicRun(run, data)), tasks: data.tasks.filter(task => task.workspaceId === workspaceId).map(task => this.facade.publicTask(task)), workers: this.workers?.snapshot() || { active: [], queued: [], limit: 2, managerLimit: 1 } }; }
    catch (error) { return { error: error.message, employees: [], runs: [], tasks: [], workers: { active: [], queued: [], limit: 2, managerLimit: 1 } }; }
  }
  infoFor(owner) { const data = this.store.read(), employee = this.bound(owner, data); if (!employee) fail('STAFF_EMPLOYEE_REQUIRED', '先由本地用户绑定员工或使用配对接口。'); return { employee: publicEmployee(employee, this.connection(employee)), runs: data.runs.filter(run => [run.managerId, ...run.memberIds].includes(employee.id)).map(run => this.publicRun(run, data)) }; }
  async authorizeEntries(entries, resume) {
    const data = this.store.read();
    for (const entry of entries) { const task = this.task(data, entry.id), run = this.requireGrant(this.run(data, task.staff.runId), data), employee = this.employee(data, task.staff.employeeId); if (employee.kind !== 'api' || task.staff.publication || task.staff.employeeVersion !== employee.version || digest(entry.route.model) !== digest(employee.model)) fail('STAFF_EXECUTION_CONFIG', 'API执行必须匹配已授权员工、实际模型与当前任务配置。'); if (resume && !this.grants.get(run.id).resumeTasks.has(task.id)) fail('STAFF_RESUME_CONFIRMATION', '恢复任务不在本次明确确认范围。'); }
    return true;
  }
  allowNativeTool(name, task) { if(task.staff.manager&&['apply_patch','run_command','send_command_input'].includes(name))return false; if (STAFF_NATIVE_HIDDEN.has(name)) return false; if (STAFF_MANAGER_TOOLS.has(name) || name === 'bridge_wait_team') return task.staff.manager === true; if (['run_command', 'send_command_input'].includes(name)) { const employee = this.employee(this.store.read(), task.staff.employeeId); return employee.allowShell && employee.allowedPaths.includes('.'); } return true; }
  nativeToolDefinition(tool) {
    if (!STAFF_MANAGER_TOOLS.has(tool.name) && tool.name !== 'bridge_wait_team') return tool;
    const properties = { ...tool.inputSchema.properties }; for (const key of ['manager_task_id', 'lease', 'client_request_id']) delete properties[key]; return { ...tool, inputSchema: { ...tool.inputSchema, properties, required: tool.inputSchema.required.filter(key => !['manager_task_id', 'lease', 'client_request_id'].includes(key)) } };
  }
  nativeToolInput(name, input, task, lease, callId) { if (STAFF_MANAGER_TOOLS.has(name) || name === 'bridge_wait_team') return { ...input, manager_task_id: task.id, lease, ...(STAFF_MANAGER_TOOLS.has(name) ? { client_request_id: 'staff-' + attemptOf(task).id + '-' + callId } : {}) }; return input; }
  instructions(task) {
    const data = this.store.read(), run = this.run(data, task.staff.runId), employee = this.employee(data, task.staff.employeeId);
    return `\n员工：${employee.name} (${employee.id})；后端：${employee.kind}；团队：${run.id}；工作区任务：${task.id}\n写入目录前缀：${employee.allowedPaths.join('、')}；通用Shell：${employee.allowShell ? '明确启用，但仍非OS沙箱' : '未启用'}。不读取其他项目或内部账本；同团队交付物用 bridge_read_task_result / bridge_read_artifact。\n${task.staff.manager ? MANAGER_INSTRUCTIONS + '\n当前团队状态：' + JSON.stringify(this.publicRun(run, data)) : '只完成分配给自己的任务。依赖任务：' + JSON.stringify(task.dependencies) + '。不要自行创建团队、派工、换职位或切换模型。'}\n`;
  }
  deliveryState(state,runId) { const children=state.tasks.filter(item=>item.staff.runId===runId&&!item.staff.manager&&!item.staff.publication);const successor=(item,seen=new Set())=>{if(seen.has(item.id))return false;seen.add(item.id);return children.some(next=>next.staff.reworkOf===item.id&&(next.status==='completed'&&next.staff.review?.decision==='accept'||successor(next,seen)));};const accepted=children.filter(item=>item.status==='completed'&&item.staff.review?.decision==='accept'&&!successor(item));return {children,accepted,settled:children.length>0&&children.every(item=>item.status==='completed'&&item.staff.review?.decision==='accept'||successor(item)),fingerprint:digest(children.map(item=>({id:item.id,revision:item.revision,attempt:item.activeAttemptId,status:item.status,review:item.staff.review?.key,integration:item.staff.integrationId,rework:item.staff.reworkOf}))) }; }
  beforeComplete(task, owner, state) {
    const run = this.run({ runs: state.staffRuns }, task.staff.runId); this.requireGrant(run, { employees: state.staffEmployees, runs: state.staffRuns, tasks: state.tasks });
    if (!task.staff.manager) return;
    const delivery=this.deliveryState(state,run.id);
    if(!delivery.settled)fail('STAFF_CHILDREN_PENDING','经理需实际派工并完成审查/返工闭环，不能只交一段计划。');
    if(run.requireIntegration&&attemptOf(task).workspace.mode==='read-only')for(const child of delivery.accepted)for(const file of child.staff.deliveryManifest?.files||[]){const target=path.join(attemptOf(child).workspace.root,file.relative);let current=null;try{current=crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex');}catch(error){if(error.code!=='ENOENT')throw error;}if(current!==file.sha256)fail('STAFF_INPLACE_ARTIFACT_CHANGED','单写者项目的已接受文件已被改变，不能把旧结果当作最终整合。');}
    if(run.requireIntegration&&delivery.accepted.some(item=>!item.staff.integrated||item.staff.integrationAttemptId!==attemptOf(task).id))fail('STAFF_INTEGRATION_PENDING','仍有交付未整合到当前经理执行副本。');
    if(run.publishToSource){const publication=state.tasks.find(item=>item.staff.runId===run.id&&item.staff.publication&&item.staff.managerAttemptId===attemptOf(task).id&&item.staff.deliveryFingerprint===delivery.fingerprint&&item.status==='completed');if(!publication)fail('STAFF_PUBLICATION_PENDING','当前已审查交付还没有匹配的回写结果。');for(const file of publication.artifacts||[]){try{const bytes=fs.readFileSync(file.path);if(crypto.createHash('sha256').update(bytes).digest('hex')!==file.sha256)fail('STAFF_SOURCE_CHANGED','源文件在回写后已变化，需重新核对。');}catch(error){if(error.code==='ENOENT')fail('STAFF_SOURCE_CHANGED','回写后的源文件已缺失。');throw error;}}}

  }
  async delegate(owner, input) {
    const actor = this.manager(owner, input.manager_task_id, input.lease), data = this.store.read();
    if (!actor.run.memberIds.includes(input.employee_id)) fail('STAFF_ASSIGNMENT_SCOPE', '经理只能向本次授权员工派工。');
    if (data.tasks.some(task => task.staff.runId === actor.run.id && unresolved(task))) fail('STAFF_OUTCOME_UNKNOWN', '未知副作用不能通过新任务名重放。');
    if(input.rework_of&&(input.dependencies||[]).includes(input.rework_of))fail('STAFF_REWORK_DEPENDENCY','返工不能等待失败前项完成，请用rework_of保留关联。');
    if (input.rework_of) { const previous = this.task(data, input.rework_of); if (previous.staff.runId !== actor.run.id || !finished(previous) || hasUnknown(previous) || !['blocked', 'cancelled'].includes(previous.status) && previous.staff.review?.decision !== 'rework') fail('STAFF_REWORK_REFUSED', '返工只针对已知失败或经理明确退回的终态任务。'); }
    const employee = this.employee(data, input.employee_id);
    return this.facade.createTask({ workspace_id: actor.run.workspaceId, title: input.title, goal: input.goal, role_id: employee.roleId, dependencies: input.dependencies || [], category_id: input.category_id, skills: input.skills, max_turns: input.max_turns, required_artifacts: input.required_artifacts || [], client_request_id: input.client_request_id, isolation: actor.run.isolation, model: employee.model || undefined }, owner, { runId: actor.run.id, employeeId: employee.id, managerTaskId: actor.task.id, lease: input.lease, reworkOf: input.rework_of });
  }
  async review(owner, input) {
    const actor = this.manager(owner, input.manager_task_id, input.lease);
    return this.facade.mutate('staff-review', state => {
      const current = this.manager(owner, input.manager_task_id, input.lease, state), task = this.facade.task(state, input.task_id);
      if (task.staff.runId !== current.run.id || task.staff.manager || task.staff.publication || !finished(task) || hasUnknown(task)) fail('STAFF_REVIEW_STATE', '只能审查本团队当前已知终态交付。');
      const body = digest({ taskId: task.id, decision: input.decision, note: input.note, evidence: input.evidence }), key = digest(owner + '\0' + input.client_request_id);
      if (task.staff.review?.key === key) { if (task.staff.review.body !== body) fail('STAFF_IDEMPOTENCY_CONFLICT', '同一审查键不能改变内容。'); return this.facade.publicTask(task); }
      if (task.revision !== input.expected_revision) fail('TASK_VERSION_CONFLICT', '员工结果已变化，请重新读取后审查。');
      if (input.decision === 'accept' && task.status !== 'completed') fail('STAFF_REVIEW_STATE', '失败、取消或等待本地验收的任务不能当作完成接受。');
      const operations = attemptOf(current.task).operations;
      if (!input.evidence.length || input.evidence.some(id => !operations.some(op => op.id === id && op.state === 'completed' && !op.toolError && !op.partial)) || !input.evidence.some(id => operations.some(op => op.id === id && STAFF_RECEIPT_TOOLS.has(op.name) && op.sourceTaskId === task.id && !op.partial))) fail('STAFF_REVIEW_EVIDENCE', '先实际读取此员工结果/产物，再引用经理自己的完整成功回执。');
      if (input.decision === 'accept' && task.artifacts?.length && !input.evidence.some(id => operations.some(op => op.id === id && op.name === 'bridge_read_artifact' && op.sourceTaskId === task.id && !op.partial))) fail('STAFF_REVIEW_ARTIFACT_REQUIRED', '有文件产物的交付至少核对一个实际产物，不能只看摘要。');
      task.staff.reviewHistory??=[];if(task.staff.reviewHistory.length>=24)fail('STAFF_REVIEW_LIMIT','审查记录达到24次，请保留历史后建立新任务。');if(task.staff.review)task.staff.reviewHistory.push(task.staff.review);
      task.staff.review = { decision: input.decision, note: requiredText(input.note, 16000), evidence: [...input.evidence], by: actor.employee.id, at: now(), key, body }; task.revision++; task.updatedAt = now(); current.run.version++;
      return this.facade.publicTask(task);
    });
  }
  async readResult(owner, input, artifact = false) {
    const data = this.store.read(), task = this.task(data, input.task_id); this.allowedRun(owner, task.staff.runId, data);
    if (!['completed', 'review', 'blocked', 'cancelled'].includes(task.status)) fail('STAFF_RESULT_NOT_READY', '员工还未提交已知结果。');
    if (!artifact) return { task: this.facade.publicTask(task), note: '这是员工已记录的结果，不是独立功能验证；关键事实继续核对产物与真实回执。' };
    const item = task.artifacts?.[input.artifact_index]; if (!item) fail('STAFF_ARTIFACT_UNKNOWN', '产物索引必须来自实际结果清单。');
    const attempt = attemptOf(task); if (!withinRoot(item.path, attempt.workspace.root) || path.relative(attempt.workspace.root, item.path).split(/[\\/]/).includes('.git')) fail('STAFF_ARTIFACT_PATH', '拒绝内部Git文件或执行目录外产物。');
    const stat = fs.statSync(item.path); if (!stat.isFile() || stat.size > 16 * 1024 * 1024) fail('STAFF_ARTIFACT_LIMIT', '只读取 16 MiB 以内的实际文本产物。');
    const bytes = fs.readFileSync(item.path), sha = crypto.createHash('sha256').update(bytes).digest('hex'); if (sha !== item.sha256) fail('STAFF_ARTIFACT_CHANGED', '产物在提交后已变化，不冒充原回执内容。');
    const text = bytes.toString('utf8'); if (!Buffer.from(text, 'utf8').equals(bytes) || text.includes('\0')) fail('STAFF_ARTIFACT_BINARY', '产物不是可安全读取的UTF-8文本；保留路径和哈希。');
    const offset = input.offset || 0, limit = input.limit || 32000, content = text.slice(offset, offset + limit);
    return { task_id: task.id, artifact: item, content, offset, total_chars: text.length, next_offset: offset + content.length, has_more: offset + content.length < text.length, complete_file_text: offset === 0 && offset + content.length === text.length, truncated: false, scope: '完整文件SHA-256核对及所请求文本片段，不代表整份文件已审查' };
  }
  async waitForTeam(task, owner, lease, signal) {
    this.manager(owner, task.id, lease);
    for (;;) { if (signal.aborted) throw Error('经理等待已取消，不代表外部命令已停止。'); const data = this.store.read(), run = this.allowedRun(owner, task.staff.runId, data); this.requireGrant(run, data); const children = data.tasks.filter(item => item.staff.runId === run.id && !item.staff.manager && !item.staff.publication); if (!children.length || children.every(finished) || children.some(item => item.status==='completed'&&!item.staff.review || ['blocked', 'cancelled', 'review'].includes(item.status)&&!item.staff.supersededBy)) return this.teamFor(owner, run.id); await new Promise(resolve => { const timer = setTimeout(done, 1000); const unsubscribe = this.parent.onDidChange(done); function done() { clearTimeout(timer); unsubscribe(); resolve(); } }); }
  }
  teamFor(owner, id, offset = 0, limit = 30) {
    const data = this.store.read(), employee = this.bound(owner, data); if (!employee) fail('STAFF_EMPLOYEE_REQUIRED', '连接尚未绑定员工。');
    const owned = data.tasks.find(task => task.owner === publicAgentId(owner)), run = this.allowedRun(owner, id || owned?.staff.runId || data.runs.findLast(item => item.phase==='active'&&[item.managerId,...item.memberIds].includes(employee.id))?.id || data.runs.findLast(item=>[item.managerId,...item.memberIds].includes(employee.id))?.id, data);
    const tasks = data.tasks.filter(task => task.staff.runId === run.id), page = tasks.slice(offset, offset + limit);
    return { run: this.publicRun(run, data), employees: [run.managerId, ...run.memberIds].map(employeeId => publicEmployee(this.employee(data, employeeId), this.connection(this.employee(data, employeeId)))), tasks: page.map(task => this.facade.publicTask(task)), total_count: tasks.length, next_offset: offset + page.length, has_more: offset + page.length < tasks.length, manager_task_id: owned?.staff.manager ? owned.id : null };
  }
  async handleTool(name, args, owner) {
    this.parent.requireCollaboration();
    if (name === 'bridge_join_employee') return result(await this.join(owner, args));
    const data = this.store.read(), employee = this.bound(owner, data); if (!employee) fail('STAFF_EMPLOYEE_REQUIRED', '先通过本地绑定或一次性配对加入员工。');
    let workspaceId;
    if (args.task_id) workspaceId = this.task(data, args.task_id).workspaceId;
    else if (args.manager_task_id) workspaceId = this.task(data, args.manager_task_id).workspaceId;
    else workspaceId = this.teamFor(owner, args.run_id).run.workspaceId;
    await this.facade.guard(name, { ...args, workspace_id: workspaceId }, owner);
    let value;
    if (name === 'bridge_list_employees') value = { employees: this.teamFor(owner, args.run_id).employees };
    else if (name === 'bridge_get_team') value = this.teamFor(owner, args.run_id, args.offset || 0, args.limit || 30);
    else if (name === 'bridge_delegate_task') value = await this.delegate(owner, args);
    else if (name === 'bridge_review_task') value = await this.review(owner, args);
    else if (name === 'bridge_read_task_result') value = await this.readResult(owner, args);
    else if (name === 'bridge_read_artifact') value = await this.readResult(owner, args, true);
    else if (name === 'bridge_integrate_task') value = await integrateTask(this, owner, args);
    else if (name === 'bridge_publish_team') value = await publishTeam(this, owner, args);
    else if (name === 'bridge_wait_team') { this.manager(owner, args.manager_task_id, args.lease); value = { ...this.teamFor(owner, undefined), external_client_polling_required: true, native_host_wait_available: true }; }
    else fail('TOOL_UNKNOWN', '员工工具不存在。');
    return result(value);
  }
  async internalTool(owner, lease, name, args, callId) { return this.internalContext.run({owner,callId},()=>this.bridge.dispatcher.handleExecutionToolCall(name, args, { commandOwnerId: owner, taskOwnerId: owner, executionLease: lease, workerCallId: callId })); }
  prepareDelivery(task,artifacts){return captureDelivery(this,task,artifacts);}
  finalizeDelivery(task,delivery){return finalizeDelivery(task,delivery);}
  async reconcile(id) { return reconcileIntegration(this, id); }
  schedule() { if (!this.workers) return; if (this.scheduling) { this.again = true; return; } if (this.scheduled) return; this.scheduled = true; queueMicrotask(() => { this.scheduled = false; void this.pump().catch(error => this.parent.options.log?.('[staff] ' + error.message)); }); }
  async pump() {
    if (this.scheduling || !this.workers) return; this.scheduling = true;
    try {
      const data = this.store.read();
      for (const id of [...this.grants.keys()]) {
        const run = this.run(data, id), manager = data.tasks.find(task => task.staff.runId === id && task.staff.manager);
        if (manager?.status === 'completed') { const grant = this.grants.get(id); this.grants.delete(id); grant.release(); await this.store.mutate('staff-completed', current => { const active = this.run(current, id); active.phase = 'completed'; active.version++; active.updatedAt = now(); }); continue; }
        if(run.phase!=='active'||run.authorizationHost!==this.bootId){const grant=this.grants.get(id);this.grants.delete(id);grant?.release();for(const task of data.tasks.filter(item=>item.staff.runId===id))this.workers.stop(task.id);continue;}
        const jobs = data.tasks.filter(task => task.staff.runId === id && !task.staff.publication && this.employee(data, task.staff.employeeId).kind === 'api');
        const queued = jobs.filter(task => task.status === 'queued' && !task.owner && !this.workers.active.has(task.id) && !this.workers.queued.has(task.id));
        const resumes = jobs.filter(task => !task.staff.supersededBy && this.grants.get(id)?.resumeTasks.has(task.id) && ['blocked', 'running'].includes(task.status) && !this.workers.active.has(task.id) && !this.workers.queued.has(task.id));
        try { if (queued.length) await this.workers.authorize(queued.map(task => task.id)); if (resumes.length) { await this.workers.authorize(resumes.map(task => task.id), true); for (const task of resumes) this.grants.get(id)?.resumeTasks.delete(task.id); } }
        catch (error) { await this.store.mutate('staff-dispatch-blocked', current => { const active = this.run(current, id); active.lastError = error.message; active.version++; for (const task of current.tasks.filter(item => queued.some(queuedTask => queuedTask.id === item.id) && item.status === 'queued' && !item.owner)) { task.status = 'blocked'; task.executionState = 'blocked'; task.output = error.message; task.revision++; task.updatedAt = now(); } }); }
      }
    } finally { this.scheduling = false; if (this.again) { this.again = false; this.schedule(); } }
  }
  disconnect(owner) { if (!owner.startsWith('native-chat:automation:')) this.bindings.delete(owner); }
  dispose() { clearInterval(this.timer);this.unsubscribe(); for (const grant of this.grants.values()) grant.release(); this.grants.clear(); this.bindings.clear(); }
}
