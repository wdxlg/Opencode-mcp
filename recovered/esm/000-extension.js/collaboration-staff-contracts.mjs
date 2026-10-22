// Staff configuration and team runs are independent of the shared rules schema.
import { cleanText, requiredText, modelReference, fail } from './collaboration-contracts.mjs';

export const STAFF_FORMAT = 'opencode.employees-and-teams';
export const STAFF_SCHEMA = 1;
export const STAFF_TASK_PREFIX = 'staffjob_';
export const STAFF_READ_TOOLS = new Set(['bridge_list_employees', 'bridge_get_team', 'bridge_read_task_result', 'bridge_read_artifact', 'bridge_wait_team']);
export const STAFF_MANAGER_TOOLS = new Set(['bridge_delegate_task', 'bridge_review_task', 'bridge_integrate_task', 'bridge_publish_team']);
export const STAFF_TOOL_NAMES = new Set(['bridge_join_employee', ...STAFF_READ_TOOLS, ...STAFF_MANAGER_TOOLS]);
export const STAFF_RECEIPT_TOOLS = new Set(['bridge_read_task_result', 'bridge_read_artifact']);
export const STAFF_NATIVE_HIDDEN = new Set(['bridge_join_employee', 'bridge_create_task']);
const id = { type: 'string', minLength: 1, maxLength: 100 };
const requestId = { type: 'string', minLength: 1, maxLength: 200, description: '同一逻辑请求重试必须复用此键；不同内容不得复用。' };
const managerFields = { manager_task_id: id, lease: { ...id, description: '经理当前 claim/resume 返回的 lease，不是其他任务或旧尝试的令牌。' } };
function tool(name, title, description, properties, required, readOnly = true) {
  return { name, title, description, inputSchema: { type: 'object', properties, required, additionalProperties: false }, outputSchema: { type: 'object', additionalProperties: true }, annotations: { title, readOnlyHint: readOnly, destructiveHint: ['bridge_integrate_task', 'bridge_publish_team'].includes(name), idempotentHint: true, openWorldHint: false } };
}
export const STAFF_TOOL_DEFINITIONS = [
  tool('bridge_join_employee', '连接为 MCP 员工', '仅完整外部AI代理使用。绑定本地用户已配置的MCP员工；本地绑定或一次性配对码才授权职位，名字不授权。配对成功后重新读取并确认规则。不会替外部模型生成回答或自动唤醒外部程序。', { employee_id: id, enrollment_token: { type: 'string', minLength: 1, maxLength: 200, description: '用户从本地员工配置复制的短时一次性配对码；不要写入任务正文、日志或共享配置。已由本地绑定的当前调用者可省略。' } }, ['employee_id'], false),
  tool('bridge_list_employees', '读取团队员工', '只返回当前员工获准参与的团队成员、配置引用和连接确认，不含API密钥、配对码、调用者原始身份或其他团队。API模型目录不是健康检查或真实模型认证。', { run_id: id }, []),
  tool('bridge_get_team', '读取团队进展', '读取所属团队的授权范围、原生请求预算、派工、审查与整合状态。外部MCP客户端自己的模型费用无法由本机计量。任务完成、经理审查、功能验证和本地验收分别记录。', { run_id: id, offset: { type: 'integer', minimum: 0 }, limit: { type: 'integer', minimum: 1, maximum: 50 } }, []),
  tool('bridge_delegate_task', '经理派工', '经理只可向本地授权团队内的员工派工，不能创建员工、改职位、改API或扩大预算。结果复用稳定请求键；rework_of仅允许已知终态的任务，未知副作用不能借新任务重放。API员工由既有提供方执行；MCP员工须主动接单。', { ...managerFields, employee_id: id, title: { type: 'string', minLength: 1, maxLength: 200 }, goal: { type: 'string', minLength: 1, maxLength: 16000 }, dependencies: { type: 'array', maxItems: 30, items: id }, category_id: id, skills: { type: 'array', maxItems: 12, items: id }, max_turns: { type: 'integer', minimum: 1, maximum: 12 }, required_artifacts: { type: 'array', maxItems: 30, items: { type: 'string', minLength: 1, maxLength: 4096 } }, rework_of: id, client_request_id: requestId }, ['manager_task_id', 'lease', 'employee_id', 'title', 'goal', 'client_request_id'], false),
  tool('bridge_read_task_result', '读取员工结构化结果', '读取同一授权团队的实际结果、验证状态与产物清单，生成本调用者的读取回执。员工声明仍不是独立功能验收；关键事实要继续核对真实产物。', { task_id: id }, ['task_id']),
  tool('bridge_read_artifact', '读取已交付产物', '按实际产物索引读取同团队交付文件，读取前核对路径、SHA-256和执行目录。只支持有界UTF-8文本，不读取任意私有记录。片段不能证明整份文件已审查。', { task_id: id, artifact_index: { type: 'integer', minimum: 0, maximum: 59 }, offset: { type: 'integer', minimum: 0 }, limit: { type: 'integer', minimum: 1, maximum: 32000 } }, ['task_id', 'artifact_index']),
  tool('bridge_wait_team', '等待员工进展', '经理在有未结束员工任务时使用，避免空转模型请求。原生经理由宿主挂起等待状态变化；外部MCP调用返回当前状态和安全轮询提示，不代表外部AI已自动唤醒。', { ...managerFields }, ['manager_task_id', 'lease']),
  tool('bridge_review_task', '经理审查交付', '经理审查已结束任务，accept必须引用经理自己读取该结果/产物的真实成功回执。不把经理同意改成测试通过或本地用户验收。返工创建新任务，保留旧尝试。', { ...managerFields, task_id: id, expected_revision: { type: 'integer', minimum: 1 }, decision: { type: 'string', enum: ['accept', 'rework'] }, note: { type: 'string', minLength: 1, maxLength: 16000 }, evidence: { type: 'array', minItems: 1, maxItems: 40, items: id }, client_request_id: requestId }, ['manager_task_id', 'lease', 'task_id', 'expected_revision', 'decision', 'note', 'evidence', 'client_request_id'], false),
  tool('bridge_integrate_task', '整合员工变更', '仅整合经理已接受、无未知副作用的真实交付。worktree内按基线/当前版本逐文件核对，再通过已有apply_patch及执行回执写入经理副本；冲突、二进制、过大变更阻塞，不覆盖胜出、不提交。单写者模式只核对已在源目录的产物。', { ...managerFields, task_id: id, expected_revision: { type: 'integer', minimum: 1 }, client_request_id: requestId }, ['manager_task_id', 'lease', 'task_id', 'expected_revision', 'client_request_id'], false),
  tool('bridge_publish_team', '应用整合结果到原项目', '只有本地团队授权已明确勾选应用回原项目才可用。只应用已审查整合的有界文本变化，逐文件校验原项目基线，使用独立单写者执行和真实回执。不提交、不测试、不安装；未知或冲突结果不重放。', { ...managerFields, client_request_id: requestId }, ['manager_task_id', 'lease', 'client_request_id'], false)
];
export function scopePaths(value) {
  const source = value == null || value === '' ? ['.'] : Array.isArray(value) ? value : cleanText(value, 8000).split(/\r?\n/);
  if (source.length > 30) fail('STAFF_SCOPE_INVALID', '每名员工最多 30 项写入目录。');
  const result = [...new Set(source.map(item => cleanText(item, 4096).trim()).filter(Boolean).map(item => item.replaceAll('\\', '/').replace(/\/+$/, '')))];
  if (!result.length) return ['.'];
  if (result.some(item => item !== '.' && (item.startsWith('/') || /^[a-z]:/i.test(item) || item.split('/').some(part => ['..', '.', '.git'].includes(part))))) fail('STAFF_SCOPE_INVALID', '写入范围必须是项目内的规范相对路径，不接受绝对路径、.. 或 .git。');
  return result.includes('.') ? ['.'] : result;
}
export function employeeInput(input) {
  if (!['api', 'mcp'].includes(input.kind)) fail('STAFF_KIND_INVALID', '员工后端必须是 api 或 mcp。');
  if (typeof input.enabled !== 'boolean' || typeof input.canManage !== 'boolean') fail('STAFF_CONFIG_INVALID', '启用与经理能力必须明确选择。');
  const model = input.kind === 'api' ? modelReference(input.model) : null;
  if (input.kind === 'api' && !model) fail('STAFF_MODEL_REQUIRED', 'API员工须选择现有提供方中的真实模型引用，先用模型/API设置配置账号，不把密钥写进职位。');
  return { name: requiredText(input.name), kind: input.kind, roleId: requiredText(input.roleId, 100), model, enabled: input.enabled, canManage: input.canManage, allowedPaths: scopePaths(input.allowedPaths), allowShell: input.allowShell === true };
}
export function integer(value, low, high, label) { if (!Number.isSafeInteger(value) || value < low || value > high) fail('STAFF_BUDGET_INVALID', label + '必须在 ' + low + '–' + high + ' 之间。'); return value; }
export function isStaffTask(id) { return typeof id === 'string' && id.startsWith(STAFF_TASK_PREFIX); }
export function publicEmployee(value, connection = {}) {
  return { id: value.id, name: value.name, kind: value.kind, roleId: value.roleId, model: value.model, enabled: value.enabled, canManage: value.canManage, allowedPaths: value.allowedPaths, allowShell: value.allowShell === true, version: value.version, ...connection };
}
export const MANAGER_INSTRUCTIONS = `你是本地用户授权的团队经理。使用 bridge_get_team / bridge_list_employees 了解真实员工与预算，使用 bridge_delegate_task 指定员工，不要用普通 bridge_create_task 绕过派工。
把工作拆为可独立交付的部分，明确文件责任和验收事实。API员工由宿主驱动；MCP员工必须由外部客户端主动接单执行，不能因显示已连接就声称对方已工作。
已有员工任务未结束时调用 bridge_wait_team，宿主会等待，不空转模型请求。已知失败可审查后创建 rework_of 后继任务；未知副作用必须阻塞，不能换一个任务名重放。
读取每个员工的真实结构化结果和实际产物，再引用你自己的读取回执 bridge_review_task。经理同意不是测试通过。团队要求整合时接受后 bridge_integrate_task；未要求时保留真实交付，不自行扩大写入。冲突和过大/二进制变化不能强行覆盖。
如果团队授权要求应用回原项目，完成整合后调用 bridge_publish_team。不自动提交、安装、测试或启停实例。结束前核实所有派工、审查、整合与授权目标，而不是只写一段计划。`;
