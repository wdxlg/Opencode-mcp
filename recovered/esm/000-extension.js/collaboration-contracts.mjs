// Cooperative execution contracts. Model choice and task categories never grant tools.
import crypto from 'node:crypto';

export const now = () => new Date().toISOString();
export const digest = value => crypto.createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
export const publicAgentId = owner => 'agent_' + digest(owner).slice(0, 24);
export const EXECUTION_SCOPED_TOOLS = new Set(['read_files', 'read_image', 'find_files', 'search_files', 'list_directory', 'get_diagnostics', 'lsp', 'apply_patch', 'run_command', 'get_command_output', 'send_command_input', 'cancel_command']);
export function fail(code, message, details) { throw Object.assign(new Error(`${code}: ${message}`), { code, details }); }
export function cleanText(value, max = 32000) {
  if (typeof value !== 'string' || value.length > max || value.includes('\0')) fail('INVALID_TEXT', '文字无效或过长。');
  return value;
}
export function requiredText(value, max = 200) {
  const result = cleanText(value, max).trim();
  if (!result) fail('INVALID_TEXT', '文字不能为空。');
  return result;
}
export function modelReference(value) {
  if (value == null) return null;
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('MODEL_REFERENCE_INVALID', '模型必须提供 vendor 和 id，不接受显示名称作为身份。');
  return { vendor: requiredText(value.vendor, 100), id: requiredText(value.id, 300) };
}
export function skillNames(value = []) {
  if (!Array.isArray(value) || value.length > 12) fail('TASK_SKILLS_INVALID', '每次任务最多选择 12 项已安装的 Skill。');
  return [...new Set(value.map(name => requiredText(name, 160)))];
}
export function turnBudget(value = 12) {
  if (!Number.isSafeInteger(value) || value < 1 || value > 12) fail('TASK_BUDGET_INVALID', '模型轮次必须在 1–12 之间。');
  return value;
}
export function defaultCategories() {
  return [
    ['explore', '只读调查'], ['implementation', '实现'], ['review', '审查'], ['writing', '文档']
  ].map(([id, name]) => ({ id, name, model: null, skills: [], maxTurns: 12, version: 1 }));
}
export function taskOptions(input, state, roleId) {
  const categoryId = input.category_id || (roleId === 'reviewer' ? 'review' : roleId === 'documentation' ? 'writing' : ['observer', 'planner', 'tester'].includes(roleId) ? 'explore' : 'implementation');
  if (!state.taskCategories.some(category => category.id === categoryId)) fail('TASK_CATEGORY_UNKNOWN', '类别必须来自协作页面或任务清单。');
  const isolation = input.isolation || 'auto';
  if (!['auto', 'worktree', 'single-writer'].includes(isolation)) fail('TASK_ISOLATION_INVALID', '隔离方式必须是 auto、worktree 或 single-writer。');
  const artifacts = input.required_artifacts || [];
  if (!Array.isArray(artifacts) || artifacts.length > 30) fail('TASK_ARTIFACTS_INVALID', '必须交付的文件最多 30 项。');
  return { categoryId, model: modelReference(input.model), skills: input.skills === undefined ? null : skillNames(input.skills), maxTurns: input.max_turns === undefined ? null : turnBudget(input.max_turns), isolation, requiredArtifacts: artifacts.map(file => requiredText(file, 4096)) };
}
export function resolveTaskRoute(task, state) {
  const category = state.taskCategories.find(item => item.id === task.categoryId);
  if (!category) fail('TASK_CATEGORY_UNKNOWN', '任务类别不存在，不能静默改用其他模型。');
  const route = { categoryId: category.id, categoryVersion: category.version, model: modelReference(task.model || category.model), skills: skillNames(task.skills ?? category.skills), maxTurns: turnBudget(task.maxTurns ?? category.maxTurns) };
  return { ...route, hash: digest(route) };
}
export const MODEL_SCHEMA = { type: 'object', properties: { vendor: { type: 'string', minLength: 1, maxLength: 100 }, id: { type: 'string', minLength: 1, maxLength: 300 } }, required: ['vendor', 'id'], additionalProperties: false };
export const TASK_OPTION_FIELDS = {
  category_id: { type: 'string', minLength: 1, maxLength: 100, description: '来自清单的任务类别；类别不改变职位或权限。' },
  model: MODEL_SCHEMA,
  skills: { type: 'array', items: { type: 'string', minLength: 1, maxLength: 160 }, maxItems: 12, description: '覆盖类别的 Skills；空数组表示本任务不加载。仅可使用实际安装且启用的 Skill。' },
  max_turns: { type: 'integer', minimum: 1, maximum: 12 },
  isolation: { type: 'string', enum: ['auto', 'worktree', 'single-writer'], description: 'auto 在干净 Git 项目使用 worktree，其余使用协作单写者；不是 OS 沙箱。' },
  required_artifacts: { type: 'array', maxItems: 30, items: { type: 'string', minLength: 1, maxLength: 4096 }, description: '必须存在的工作副本内文件。不会自动执行测试。' }
};
const referenceList = { type: 'array', items: { type: 'string', minLength: 1, maxLength: 100 }, maxItems: 40 };
export const RESULT_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: {
    summary: { type: 'string', minLength: 1, maxLength: 16000 },
    artifacts: { type: 'array', maxItems: 30, items: { type: 'string', minLength: 1, maxLength: 4096 } },
    claims: { type: 'array', maxItems: 40, items: { type: 'object', properties: { text: { type: 'string', minLength: 1, maxLength: 2000 }, critical: { type: 'boolean' }, evidence: referenceList }, required: ['text', 'critical', 'evidence'], additionalProperties: false } },
    checks: { type: 'array', maxItems: 40, items: { type: 'object', properties: { name: { type: 'string', minLength: 1, maxLength: 300 }, kind: { type: 'string', enum: ['inspection', 'build', 'test'] }, status: { type: 'string', enum: ['passed', 'failed', 'not_run'] }, evidence: referenceList }, required: ['name', 'kind', 'status', 'evidence'], additionalProperties: false } },
    unverified: { type: 'array', maxItems: 40, items: { type: 'string', minLength: 1, maxLength: 1000 } }
  }, required: ['summary', 'artifacts', 'claims', 'checks', 'unverified']
};
export const RESULT_INSTRUCTIONS = `最终结果必须是一个 JSON 对象，不要用普通非空回复代替完成判定：
{"outcome":"completed 或 blocked","summary":"实际完成的内容","artifacts":["实际文件路径"],"claims":[{"text":"关键事实","critical":true,"evidence":["工具返回的 receipt_id"]}],"checks":[{"name":"检查范围","kind":"inspection 或 build 或 test","status":"passed 或 failed 或 not_run","evidence":["receipt_id"]}],"unverified":["未验证项"]}。
没有执行的检查写 not_run，evidence 为空；共识不能代替证据。关键事实必须引用本次或已恢复执行的真实回执。文件存在不等于功能通过；构建不等于测试。默认不运行测试，不安装依赖，不启停已有实例，不提交或发送。只根据本次授权目标判断执行完成，验证和用户验收另行记录。`;
export function parseWorkerResult(text) {
  const stripped = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  let result;
  try { result = JSON.parse(stripped); } catch { fail('TASK_RESULT_REQUIRED', '最终回复不是结构化结果；已保留上下文，不把模型答完当作任务完成。'); }
  if (!['completed', 'blocked'].includes(result?.outcome)) fail('TASK_RESULT_REQUIRED', '结果必须声明 outcome=completed 或 blocked。');
  const { outcome, ...report } = result;
  return { outcome, report };
}
export function validateReportShape(report) {
  if (!report || typeof report !== 'object' || Array.isArray(report)) fail('TASK_RESULT_REQUIRED', '提交完成必须提供结构化 result，不能只给 output。');
  const summary = requiredText(report.summary, 16000);
  for (const [key, max] of [['artifacts', 30], ['claims', 40], ['checks', 40], ['unverified', 40]]) if (!Array.isArray(report[key]) || report[key].length > max) fail('TASK_RESULT_INVALID', `result.${key} 缺失或超过上限。`);
  const refs = list => {
    if (!Array.isArray(list) || list.length > 40) fail('TASK_EVIDENCE_INVALID', '证据必须是实际回执 ID 数组。');
    return [...new Set(list.map(value => requiredText(value, 100)))];
  };
  return {
    summary, artifacts: report.artifacts.map(value => requiredText(value, 4096)),
    claims: report.claims.map(item => {
      if (typeof item?.critical !== 'boolean') fail('TASK_RESULT_INVALID', '事实必须明确 critical 标记。');
      return { text: requiredText(item.text, 2000), critical: item.critical, evidence: refs(item.evidence) };
    }),
    checks: report.checks.map(item => {
      if (!['inspection', 'build', 'test'].includes(item?.kind) || !['passed', 'failed', 'not_run'].includes(item?.status)) fail('TASK_RESULT_INVALID', '检查类型或状态无效。');
      return { name: requiredText(item.name, 300), kind: item.kind, status: item.status, evidence: refs(item.evidence) };
    }),
    unverified: report.unverified.map(value => requiredText(value, 1000))
  };
}
export function evidenceAssessment(report, operations) {
  const receipts = new Map(operations.map(operation => [operation.id, operation]));
  const successful = id => { const item = receipts.get(id); return item && item.state === 'completed' && item.toolError !== true && (item.commandState == null || item.commandState === 'completed' && item.exitCode === 0) && item.partial !== true; };
  for (const claim of report.claims) {
    if (claim.evidence.some(id => !receipts.has(id))) fail('TASK_EVIDENCE_UNKNOWN', '事实引用了不存在的回执。');
    if (claim.critical && (!claim.evidence.length || !claim.evidence.every(successful))) fail('TASK_CRITICAL_EVIDENCE_REQUIRED', '关键事实即使所有模型一致，也必须有成功且范围完整的工具回执。');
  }
  for (const check of report.checks) {
    if (check.evidence.some(id => !receipts.has(id))) fail('TASK_EVIDENCE_UNKNOWN', '检查引用了不存在的回执。');
    if (check.status === 'not_run' && check.evidence.length) fail('TASK_CHECK_INVALID', '未运行检查不应引用已执行回执。');
    if (check.status !== 'not_run' && !check.evidence.length) fail('TASK_CHECK_EVIDENCE_REQUIRED', '已执行检查必须引用真实回执。');
    if (check.status === 'passed' && !check.evidence.every(successful)) fail('TASK_CHECK_NOT_PASSED', '失败、部分成功、未知或仍运行的回执不能证明检查通过。');
    if (check.status !== 'not_run' && ['build', 'test'].includes(check.kind) && !check.evidence.some(id => { const receipt = receipts.get(id); return ['run_command', 'get_command_output'].includes(receipt?.name) && receipt.purpose === check.kind && receipt.commandState !== 'running' && receipt.commandState != null && (check.status !== 'passed' || receipt.exitCode === 0); })) fail('TASK_CHECK_COMMAND_REQUIRED', '构建或测试必须引用对应类型的真实终态命令回执；通过还要求退出码为 0。无法识别的任意 Shell 或复合命令不认证为测试/构建，不能用 echo 或阅读文件充数。');
  }
  const executed = report.checks.filter(check => check.status !== 'not_run');
  return {
    validationState: executed.some(check => check.status === 'failed') ? 'failed' : !executed.length ? 'unverified' : report.unverified.length || report.checks.some(check => check.status !== 'passed') ? 'partial' : 'verified',
    validationScope: executed.filter(check => check.status === 'passed').map(check => check.name),
    testsRun: report.checks.some(check => check.kind === 'test' && check.status !== 'not_run'),
    testsPassed: report.checks.some(check => check.kind === 'test') && report.checks.filter(check => check.kind === 'test').every(check => check.status === 'passed')
  };
}
