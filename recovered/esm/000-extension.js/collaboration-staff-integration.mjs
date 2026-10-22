// Conservative text integration: compare versions, then use the existing fenced file tool.
// No shell-generated patches, commits, dependency installs, tests or arbitrary merge drivers.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { acquireResources } from './concurrency-runtime.mjs';
import { now, digest, fail, publicAgentId } from './collaboration-contracts.mjs';
import { git, withinRoot } from './collaboration-workspaces.mjs';

const MAX_FILE = 256 * 1024, MAX_TOTAL = 512 * 1024, MAX_FILES = 30;
const attemptOf = task => task.attempts.find(item => item.id === task.activeAttemptId);
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const canonicalText = text => text.replace(/\r\n/g, '\n');
function textFile(bytes, label) {
  if (bytes.length > MAX_FILE) fail('STAFF_INTEGRATION_LIMIT', '自动整合单文件最多 256 KiB：' + label);
  const text = bytes.toString('utf8');
  if (text.includes('\0') || text.startsWith('\uFEFF') || !Buffer.from(text, 'utf8').equals(bytes) || /\r(?!\n)/.test(text) || text && !text.endsWith('\n')) fail('STAFF_INTEGRATION_TEXT_ONLY', '自动整合只处理非BOM、有末尾换行的UTF-8文本；其他文件保留产物并阻塞，不转换或丢弃：' + label);
  return { text: canonicalText(text), sha256: hash(bytes), canonicalHash: hash(Buffer.from(canonicalText(text))), bytes: bytes.length };
}
function workingFile(root, relative) {
  if (!relative || relative.split('/').some(part => ['..', '.git'].includes(part)) || path.isAbsolute(relative)) fail('STAFF_INTEGRATION_PATH', '整合路径必须是执行副本内的规范相对路径。');
  const file = path.join(root, relative); if (!withinRoot(file, root)) fail('STAFF_INTEGRATION_PATH', '拒绝链接或目录逃逸。');
  try { const stat = fs.lstatSync(file); if (!stat.isFile() || stat.isSymbolicLink()) fail('STAFF_INTEGRATION_PATH', '不自动整合链接或目录：' + relative); return { exists: true, ...textFile(fs.readFileSync(file), relative) }; }
  catch (error) { if (error.code === 'ENOENT') return { exists: false, text: null, sha256: null, canonicalHash: null, bytes: 0 }; throw error; }
}
async function baseFile(staff, attempt, relative) {
  try { const bytes = await git(attempt.workspace.root, ['cat-file', 'blob', attempt.workspace.baseRef + ':' + relative], { executable: staff.parent.options.gitExecutable, hooksPath: attempt.workspace.hooksPath, encoding: 'buffer', maxBuffer: MAX_FILE + 1024 }); return { exists: true, ...textFile(bytes, relative + ' (基线)') }; }
  catch (error) { if (error.code === 128 && /does not exist|exists on disk, but not in|Not a valid object name|path .* not in/i.test(error.gitMessage || '')) return { exists: false, text: null, sha256: null, canonicalHash: null, bytes: 0 }; throw error; }
}
function permitted(employee, relative) { const key = process.platform === 'win32' ? relative.toLowerCase() : relative; return employee.allowedPaths.some(prefix => prefix === '.' || key === (process.platform === 'win32' ? prefix.toLowerCase() : prefix) || key.startsWith((process.platform === 'win32' ? prefix.toLowerCase() : prefix) + '/')); }
async function changes(staff, task, additional = []) {
  const attempt = attemptOf(task); if (!attempt?.workspace.baseRef || attempt.workspace.mode !== 'worktree') return [];
  const options = { executable: staff.parent.options.gitExecutable, hooksPath: attempt.workspace.hooksPath };
  const modified = (await git(attempt.workspace.root, ['diff', '--name-only', '--no-renames', '-z', attempt.workspace.baseRef, '--', '.'], options)).split('\0').filter(Boolean);
  const untracked = (await git(attempt.workspace.root, ['ls-files', '--others', '--exclude-standard', '-z', '--', '.'], options)).split('\0').filter(Boolean);
  const recorded = attempt.operations.filter(op=>op.name==='apply_patch'&&op.state==='completed'&&!op.toolError).flatMap(op=>(op.changes||[]).flatMap(file=>[file.path,file.destinationPath].filter(Boolean))).map(file=>path.relative(attempt.workspace.root,file).replaceAll('\\','/'));
  const reported = (task.artifacts || []).map(item => path.relative(attempt.workspace.root, item.path).replaceAll('\\', '/'));
  const paths = [...new Set([...modified, ...untracked, ...reported, ...recorded, ...additional])]; if (paths.length > MAX_FILES) fail('STAFF_INTEGRATION_LIMIT', '一次整合最多 30 个文本文件，超出保留差异并阻塞。');
  const employee = staff.employee(staff.store.read(), task.staff.employeeId), output = []; let total = 0;
  for (const relative of paths) {
    if (!permitted(employee, relative)) fail('STAFF_WRITE_SCOPE', '交付含员工责任范围之外的变化：' + relative);
    const before = await baseFile(staff, attempt, relative), after = workingFile(attempt.workspace.root, relative);
    if (before.canonicalHash === after.canonicalHash) continue;
    if (after.exists && !after.text) fail('STAFF_INTEGRATION_TEXT_ONLY', '空文件不通过文本补丁自动重建：' + relative);
    total += before.bytes + after.bytes; if (total > MAX_TOTAL) fail('STAFF_INTEGRATION_LIMIT', '一次整合文本总量最多 512 KiB，未写入后续文件。');
    output.push({ relative, before, after });
  }
  return output;
}
function patchFor(root, files) {
  const parts = ['*** Begin Patch'], versions = {};
  const lines = text => text.split('\n').slice(0, -1);
  for (const item of files) {
    const file = path.join(root, item.relative).replaceAll('\\', '/');
    if (item.current.exists) versions[file] = 'sha256:' + item.current.sha256;
    if (!item.after.exists) parts.push('*** Delete File: ' + file);
    else if (!item.current.exists) parts.push('*** Add File: ' + file, ...lines(item.after.text).map(line => '+' + line));
    else parts.push('*** Update File: ' + file, '@@', ...lines(item.current.text).map(line => '-' + line), ...lines(item.after.text).map(line => '+' + line));
  }
  parts.push('*** End Patch'); return { patch: parts.join('\n') + '\n', expected_versions: versions };
}
function publicFiles(files) { return files.map(item => ({ relative: item.relative, beforeSha256: item.current.sha256, beforeCanonicalHash: item.current.canonicalHash, afterCanonicalHash: item.after.canonicalHash, deleted: !item.after.exists })); }
async function markUnknown(staff, runId, intentId, managerTaskId, error) {
  await staff.store.mutate('staff-integration-unknown', data => { const run = staff.run(data, runId), intent = run.integrations.find(item => item.id === intentId); if (intent) { intent.state = 'unknown'; intent.error = String(error.message).slice(0, 2000); } run.lastError = String(error.message).slice(0, 2000); run.version++; const manager = staff.task(data, managerTaskId); if (manager.owner) { manager.status = 'blocked'; manager.executionState = 'blocked'; manager.output = '整合结果未确认，禁止盲目重放：' + error.message; manager.revision++; manager.updatedAt = now(); } }).catch(() => {});
}
async function applyIntent(staff, actor, input, targetTask, files, publication = false) {
  const attempt = attemptOf(targetTask), key = digest(actor.owner + '\0' + input.client_request_id), bodyHash = digest({ targetTask: targetTask.id, sourceTask: input.task_id || null, revision: input.expected_revision || null, publication });
  const previous = staff.run(staff.store.read(), actor.run.id).integrations.find(item => item.key === key);
  if (previous) { if (previous.bodyHash !== bodyHash) fail('STAFF_IDEMPOTENCY_CONFLICT', '整合请求键与内容不一致。'); if (previous.state === 'completed') return previous.result; fail('STAFF_INTEGRATION_UNKNOWN', '这次整合已有意图但未确认完成，先由本地核对，不重发补丁。'); }
  const intentId = 'integration_' + crypto.randomUUID(), patch = files.some(item => !item.noWrite) ? patchFor(attempt.workspace.root, files.filter(item => !item.noWrite)) : null;
  const ref = await staff.facade.collaboration.storePrivate(targetTask, attempt, intentId + '.json', { format: 'opencode.staff-integration.v1', files: publicFiles(files), targetRoot: attempt.workspace.root, patch });
  await staff.facade.collaboration.editAttempt(targetTask.id, actor.owner, actor.lease, current => { current.privateBytes += ref.bytes; });
  await staff.store.mutate('staff-integration-intent', data => { const run = staff.run(data, actor.run.id); staff.requireGrant(run, data); if (run.integrations.length >= 200) fail('STAFF_INTEGRATION_LIMIT', '本团队达到 200 条整合记录，保留历史后新建团队。'); run.integrations.push({ id: intentId, key, bodyHash, taskId: input.task_id || targetTask.id, managerTaskId: actor.task.id, targetTaskId: targetTask.id, targetAttemptId: attempt.id, targetRoot: attempt.workspace.root, recordRef: ref, files: publicFiles(files), state: 'issued', publication, createdAt: now() }); run.version++; });
  let toolResult;
  try {
    if (patch) { toolResult = await staff.internalTool(actor.owner, actor.lease, 'apply_patch', patch, intentId); if (toolResult.isError) fail('STAFF_PATCH_OUTCOME_UNKNOWN', '文件工具报告失败或部分失败，实际执行回执保留，需核对。'); }
    const actual = files.map(item => ({ ...item, written: workingFile(attempt.workspace.root, item.relative) }));
    if (actual.some(item => item.written.canonicalHash !== item.after.canonicalHash)) fail('STAFF_INTEGRATION_CHANGED', '文件内容与期望不符，可能被转换或并发改变；不重复写入。');
    const value = { integration_id: intentId, state: 'completed', task_id: input.task_id || targetTask.id, target_root: attempt.workspace.root, files: actual.map(item => ({ relative: item.relative, sha256: item.written.sha256, canonicalHash: item.written.canonicalHash, deleted: !item.written.exists })), receipt_id: toolResult?._meta?.opencodeExecution?.receipt_id || null, tests_run: false, note: patch ? '通过版本限定的真实apply_patch整合；保留目标换行风格，不认证构建或功能。' : '没有需要写入的文件；不把空操作称为测试通过。' };
    await staff.store.mutate('staff-integrated', data => { const run = staff.run(data, actor.run.id), intent = run.integrations.find(item => item.id === intentId); intent.state = 'completed'; intent.result = value; intent.finishedAt = now(); run.version++; if (input.task_id) { const child = staff.task(data, input.task_id); child.staff.integrated = true; child.staff.integrationAttemptId = attemptOf(actor.task).id; child.staff.integrationId = intentId; child.revision++; child.updatedAt = now(); } });
    return value;
  } catch (error) { await markUnknown(staff, actor.run.id, intentId, actor.task.id, error); throw error; }
}
export async function captureDelivery(staff, task, artifacts) {
  const attempt=attemptOf(task);
  if(attempt.workspace.mode!=='worktree'){
    const paths=[...new Set([...artifacts.map(file=>file.path),...attempt.operations.filter(op=>op.name==='apply_patch'&&op.state==='completed'&&!op.toolError).flatMap(op=>(op.changes||[]).flatMap(file=>[file.path,file.destinationPath].filter(Boolean)))])];
    const files=[];if(paths.length>90)return {available:false,reason:'记录文件超过90项，保留原回执，不伪造完整快照。',files:[],artifacts};
    for(const target of paths){if(!withinRoot(target,attempt.workspace.root))fail('STAFF_DELIVERY_PATH','交付越过实际执行目录。');let stat;try{stat=fs.lstatSync(target);}catch(error){if(error.code==='ENOENT'){files.push({relative:path.relative(attempt.workspace.root,target).replaceAll('\\','/'),sha256:null,canonicalHash:null,deleted:true,bytes:0});continue;}throw error;}if(!stat.isFile()||stat.isSymbolicLink()||stat.size>128*1024*1024)return {available:false,reason:'文件类型或大小不支持快照，保留原产物。',files:[],artifacts};const h=crypto.createHash('sha256');for await(const chunk of fs.createReadStream(target))h.update(chunk);files.push({relative:path.relative(attempt.workspace.root,target).replaceAll('\\','/'),sha256:h.digest('hex'),canonicalHash:null,deleted:false,bytes:stat.size});}
    return {available:true,mode:'in-place-or-read-only',files,artifacts};
  }
  try {
    const extra=artifacts.map(file=>path.relative(attempt.workspace.root,file.path).replaceAll('\\','/'));
    const files=await changes(staff,task,extra);
    if(task.staff.manager){const data=staff.store.read(),delivery=staff.deliveryState(data,task.staff.runId),run=staff.run(data,task.staff.runId);const approved=new Map(delivery.accepted.flatMap(child=>run.integrations.find(intent=>intent.id===child.staff.integrationId)?.result?.files||[]).map(file=>[file.relative,file.canonicalHash]));if(files.some(file=>!approved.has(file.relative)||approved.get(file.relative)!==file.after.canonicalHash))fail('STAFF_MANAGER_UNREVIEWED','经理副本含未经审查整合的变化，不能当作团队最终交付。');}
    return {available:true,mode:'worktree-text',files:files.map(file=>({relative:file.relative,sha256:file.after.sha256,canonicalHash:file.after.canonicalHash,deleted:!file.after.exists,bytes:file.after.bytes})),artifacts};
  }catch(error){if(!task.staff.manager&&['STAFF_INTEGRATION_LIMIT','STAFF_INTEGRATION_TEXT_ONLY','STAFF_INTEGRATION_PATH'].includes(error.code))return {available:false,reason:error.message,files:[],artifacts};throw error;}
}
export function finalizeDelivery(task, delivery) {
  task.staff.deliveryManifest={available:delivery.available,mode:delivery.mode,reason:delivery.reason,files:delivery.files};
  if(!delivery.available)return;
  const attempt=attemptOf(task),all=new Map(task.artifacts.map(file=>[file.path,file]));
  for(const file of delivery.files){const targetPath=path.join(attempt.workspace.root,file.relative);let actual;if(delivery.mode==='worktree-text')actual=workingFile(attempt.workspace.root,file.relative);else{try{const bytes=fs.readFileSync(targetPath);actual={sha256:hash(bytes),bytes:bytes.length};}catch(error){if(error.code!=='ENOENT')throw error;actual={sha256:null,bytes:0};}}if(actual.sha256!==file.sha256)fail('STAFF_DELIVERY_CHANGED','提交期间文件已变化，不能保存过期产物快照。');if(!file.deleted){const target=path.join(attempt.workspace.root,file.relative);all.set(target,{path:target,relativePath:file.relative,bytes:actual.bytes,sha256:actual.sha256,discoveredByHost:true});}}
  task.artifacts=[...all.values()];attempt.artifacts=task.artifacts;
}
export async function integrateTask(staff, owner, input) {
  const actor = { ...staff.manager(owner, input.manager_task_id, input.lease), owner, lease: input.lease }, data = staff.store.read(), child = staff.task(data, input.task_id), target = actor.task;
  if (child.staff.runId !== actor.run.id || child.staff.manager || child.staff.publication || child.status !== 'completed' || child.staff.review?.decision !== 'accept') fail('STAFF_INTEGRATION_REVIEW', '只整合本团队已经接受的已完成员工交付。');
  const key = digest(owner + '\0' + input.client_request_id), old = actor.run.integrations.find(item => item.key === key);
  if (old) { if (old.bodyHash !== digest({ targetTask: target.id, sourceTask: input.task_id || null, revision: input.expected_revision || null, publication: false })) fail('STAFF_IDEMPOTENCY_CONFLICT', '整合键与内容不一致。'); if (old.state === 'completed') return old.result; fail('STAFF_INTEGRATION_UNKNOWN', '原整合结果不确定，请本地核对，不能重发。'); }
  if (child.revision !== input.expected_revision) fail('TASK_VERSION_CONFLICT', '员工结果已变化，请重新读取。');
  if (attemptOf(target).workspace.mode === 'read-only') {
    const files = []; for (const saved of child.staff.deliveryManifest?.files||[]) {const file=path.join(attemptOf(child).workspace.root,saved.relative);let actual=null;try{actual=hash(fs.readFileSync(file));}catch(error){if(error.code!=='ENOENT')throw error;}if(actual!==saved.sha256)fail('STAFF_INPLACE_ARTIFACT_CHANGED','单写者文件在提交后已变化，不能冒充旧结果。');}
    for (const item of child.artifacts || []) { if (!withinRoot(item.path, attemptOf(target).workspace.root) || hash(fs.readFileSync(item.path)) !== item.sha256) fail('STAFF_INPLACE_ARTIFACT_CHANGED', '单写者交付已被后续改变，不能冒充原结果。'); files.push({ relative: path.relative(attemptOf(target).workspace.root, item.path).replaceAll('\\', '/'), sha256: item.sha256 }); }
    return staff.store.mutate('staff-inplace-verified', current => { const task = staff.task(current, child.id), run = staff.run(current, actor.run.id); if (task.revision !== input.expected_revision) fail('TASK_VERSION_CONFLICT', '核对期间员工结果已变化。'); const value = { state: 'verified-in-place', task_id: task.id, files, writes_performed: false, note: '员工已串行写入原项目；只核对声明产物，不声称捕获任意Shell的全部变化或完成测试。' }; const intentId = 'integration_' + crypto.randomUUID(); run.integrations.push({ id: intentId, key, bodyHash: digest({ targetTask: target.id, sourceTask: child.id, revision: input.expected_revision, publication: false }), taskId: child.id, targetTaskId: target.id, targetAttemptId: attemptOf(target).id, state: 'completed', result: value, createdAt: now(), inPlace: true }); task.staff.integrated = true; task.staff.integrationId = intentId; task.staff.integrationAttemptId = attemptOf(target).id; task.staff.inPlaceFiles = files; task.revision++; run.version++; return value; });
  }
  if(child.staff.deliveryManifest?.available!==true||child.staff.deliveryManifest.mode!=='worktree-text')fail('STAFF_DELIVERY_NOT_MERGEABLE','员工交付没有完整的可整合文本快照：'+(child.staff.deliveryManifest?.reason||'请保留历史并重新交付。'));
  const previous = child.staff.reworkOf ? data.tasks.find(item => item.id === child.staff.reworkOf) : null;
  const previousIntegration = previous && actor.run.integrations.findLast(item => item.taskId === previous.id && item.state === 'completed' && item.targetAttemptId === attemptOf(target).id);
  const extra = previousIntegration?.result?.files.map(item => item.relative) || [], manifest=child.staff.deliveryManifest.files,files=[];
  const collected=[];for(const relative of [...new Set([...manifest.map(file=>file.relative),...extra])]){const actual=workingFile(attemptOf(child).workspace.root,relative),saved=manifest.find(file=>file.relative===relative);if(saved&&actual.sha256!==saved.sha256)fail('STAFF_DELIVERY_CHANGED','员工文件在提交后变化，不整合未审查内容：'+relative);const before=await baseFile(staff,attemptOf(child),relative);if(!saved&&actual.canonicalHash!==before.canonicalHash)fail('STAFF_DELIVERY_CHANGED','返工文件不在保存的交付快照内。');collected.push({relative,before,after:actual});}
  for (const item of collected) {
    const current = workingFile(attemptOf(target).workspace.root, item.relative);
    if (current.canonicalHash === item.after.canonicalHash) { files.push({ ...item, current, noWrite: true }); continue; }
    const predecessor = previousIntegration?.result?.files.find(file => file.relative === item.relative);
    if (current.canonicalHash !== item.before.canonicalHash && current.canonicalHash !== predecessor?.canonicalHash) fail('STAFF_INTEGRATION_CONFLICT', '经理副本中此文件已变化，未覆盖；请基于实际产物安排明确返工：' + item.relative);
    files.push({ ...item, current });
  }
  return applyIntent(staff, actor, input, target, files);
}
export async function publishTeam(staff, owner, input) {
  const actor = { ...staff.manager(owner, input.manager_task_id, input.lease), owner, lease: input.lease };
  if (!actor.run.publishToSource) fail('STAFF_PUBLICATION_NOT_AUTHORIZED', '本地授权没有勾选应用回原项目；经理不能自行扩大写入目标。');
  const data=staff.store.read(),delivery=staff.deliveryState(data,actor.run.id),accepted=delivery.accepted;
  if(!delivery.settled||accepted.some(task=>!task.staff.integrated||task.staff.integrationAttemptId!==attemptOf(actor.task).id))fail('STAFF_PUBLICATION_PENDING','需先完成当前经理执行中的全部结果审查、返工与整合。');
  const key = digest(owner + '\0' + input.client_request_id), existing = actor.run.integrations.find(item => item.key === key);
  if (existing) { if (existing.state === 'completed') return existing.result; fail('STAFF_INTEGRATION_UNKNOWN', '原回写有未确认意图，不重复执行。'); }
  let publication = data.tasks.find(task => task.staff.runId === actor.run.id && task.staff.publication && task.staff.managerAttemptId === attemptOf(actor.task).id && task.staff.deliveryFingerprint===delivery.fingerprint && task.status === 'completed');
  if (publication) return { state: 'completed', publication_task_id: publication.id, tests_run: false };
  const release = await acquireResources(['staff-publication:' + actor.run.id], { timeoutMs: 1000 });
  const hostOwner = 'native-chat:automation:' + crypto.randomUUID(); let claim;
  try {
    const publicTask = await staff.facade.createTask({ workspace_id: actor.run.workspaceId, title: actor.run.name + ' / 应用整合结果', goal: '仅按本次团队授权及版本校验，将已审查文本变更应用回原项目。不提交、不测试、不安装。', role_id: actor.employee.roleId, category_id: 'implementation', isolation: 'single-writer', model: actor.employee.model || undefined, max_turns: 1, client_request_id: 'publish:' + actor.run.id + ':' + attemptOf(actor.task).id + ':' + input.client_request_id }, 'local-user', { runId: actor.run.id, employeeId: actor.employee.id, publication: true });
    publication = staff.task(staff.store.read(), publicTask.id);
    await staff.store.mutate('staff-publication-bind', current => { const task = staff.task(current, publication.id); task.staff.managerAttemptId = attemptOf(actor.task).id;task.staff.deliveryFingerprint=delivery.fingerprint; });
    staff.bindNative(hostOwner, publication); staff.bindings.get(hostOwner).internalPublication = true;
    const root = staff.parent.workspace(actor.run.workspaceId).root;
    await staff.facade.prepareNative(hostOwner, root, 'code', actor.employee.roleId);
    const globalRules = staff.facade.getRules(hostOwner, 'global'); staff.facade.acknowledge(hostOwner, 'global', globalRules.rules_hash);
    claim = await staff.facade.claimTask(publication.id, publication.revision, hostOwner);
    if (claim.blocked) fail('STAFF_PUBLICATION_PREPARATION', claim.reason);
    publication = staff.task(staff.store.read(), publication.id);
    let collected = attemptOf(actor.task).workspace.mode === 'worktree' ? await changes(staff, actor.task) : [];
    const approvedFiles = accepted.flatMap(task => { const intent = actor.run.integrations.find(item => item.id === task.staff.integrationId); return intent?.result?.files || task.staff.inPlaceFiles || []; });
    const approved = new Map(approvedFiles.map(file => [file.relative, file]));
    if (collected.some(item => !approved.has(item.relative) || approved.get(item.relative).canonicalHash !== item.after.canonicalHash)) fail('STAFF_PUBLICATION_UNREVIEWED', '经理副本含未经过审查整合的额外内容，不能自动回写。');
    const files = [];
    for (const item of collected) { const current = workingFile(root, item.relative); if (current.canonicalHash === item.after.canonicalHash) {files.push({...item,current,noWrite:true});continue;} if (current.canonicalHash !== item.before.canonicalHash) fail('STAFF_SOURCE_CHANGED', '原项目存在本次基线以外的改变，未覆盖：' + item.relative); files.push({ ...item, current }); }
    if (!files.some(item=>!item.noWrite)) await staff.store.mutate('staff-empty-publication', current => { staff.task(current, publication.id).staff.noFileChanges = true; });
    const published = await applyIntent(staff, { ...actor, requestOwner: owner, owner: hostOwner, lease: claim.lease }, input, publication, files, true);
    const receipt = published.receipt_id, current = staff.task(staff.store.read(), publication.id);
    const artifacts = published.files.filter(file => !file.deleted).map(file => path.join(root, file.relative));
    await staff.facade.updateTask({ task_id: current.id, expected_revision: current.revision, lease: claim.lease, status: 'completed', output: '已按授权应用整合结果；未运行功能测试。', result: { summary: '已核对并应用团队整合结果到原项目；保留源目录中的非本次文件，不提交、不测试。', artifacts, claims: receipt ? [{ text: '列出的文本变化已由版本限定文件工具处理。', critical: true, evidence: [receipt] }] : [], checks: receipt ? [{ name: '授权文本补丁执行回执', kind: 'inspection', status: 'passed', evidence: [receipt] }] : [], unverified: ['未运行构建、测试或业务功能验收；文件回写不是需求全部达成证明。'] } }, hostOwner);
    return { ...published, publication_task_id: publication.id };
  } catch (error) {
    if (claim?.lease) { const task = staff.task(staff.store.read(), publication.id); await staff.facade.updateTask({ task_id: task.id, expected_revision: task.revision, lease: claim.lease, status: 'blocked', output: '回写阻塞：' + error.message }, hostOwner).catch(() => {}); }
    throw error;
  } finally { staff.facade.connections.delete(hostOwner); staff.facade.nativeAssignments.delete(hostOwner); staff.unbindNative(hostOwner); release(); }
}
export async function reconcileIntegration(staff, runId) {
  const data = staff.store.read(), run = staff.run(data, runId), pending = run.integrations.filter(item => ['issued', 'unknown', 'partial'].includes(item.state));
  const observations = pending.map(intent => ({ intent, files: intent.files.map(file => ({ expected: file, actual: workingFile(intent.targetRoot, file.relative) })) }));
  return staff.store.mutate('staff-local-reconciliation', current => {
    const active = staff.run(current, runId);
    for (const observed of observations) {
      const intent = active.integrations.find(item => item.id === observed.intent.id); if (!intent || intent.state === 'completed') continue;
      const complete = observed.files.every(item => item.actual.canonicalHash === item.expected.afterCanonicalHash), untouched = observed.files.every(item => item.actual.canonicalHash === item.expected.beforeCanonicalHash);
      intent.reconciliation = { by: 'local-user', at: now(), classification: complete ? 'matches-requested-files' : untouched ? 'matches-before-files' : 'partial-or-changed', actual: observed.files.map(item => ({ relative: item.expected.relative, sha256: item.actual.sha256 })) };
      intent.reconciled = complete || untouched; intent.state = complete ? 'completed' : untouched ? 'failed-known' : 'partial';
      if (complete) { intent.result = { integration_id: intent.id, state: 'completed', task_id: intent.taskId, target_root: intent.targetRoot, files: observed.files.map(item => ({ relative: item.expected.relative, sha256: item.actual.sha256, canonicalHash: item.actual.canonicalHash, deleted: !item.actual.exists })), receipt_id: null, tests_run: false, note: '本地明确核对后，当前文件哈希匹配目标；不改写旧工具回执，不声称测试通过。' }; const child = current.tasks.find(task => task.id === intent.taskId && !task.staff.publication); if (child && !child.staff.manager) { child.staff.integrated = true; child.staff.integrationId = intent.id; child.staff.integrationAttemptId = intent.targetAttemptId; child.revision++; } }
    }
    active.version++; return { observations: active.integrations.filter(item => pending.some(previous => previous.id === item.id)).map(item => ({ id: item.id, state: item.state, reconciliation: item.reconciliation })), tool_receipts_rewritten: false, automatic_replay: false };
  });
}
