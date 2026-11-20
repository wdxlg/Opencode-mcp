// 「工作」看板与「自动化」：扩展侧集成（webview 面板、Bridge 工具接线、应用内调度器、无界面运行器）。
// 设计借鉴 Multica（Work / Autopilot 的语义），代码与界面为 OpenCode 自行实现。
//
// 运行器选择（详见 docs/work-and-automations.md）：模型密钥保存在 VS Code SecretStorage（Electron safeStorage 加密），
// 只有扩展宿主能读取；ELECTRON_RUN_AS_NODE 的独立 node 进程拿不到密钥，也拿不到 Bridge 工具。因此「关闭时运行」
// 采用：计划任务 → 启动器以 OPENCODE_AUTOMATION_RUN=1 启动 OpenCode.exe → 本模块在扩展宿主中用 vscode.lm
// （与协作原生执行器相同的模型通道）+ Bridge 调度器执行提示词 → 写运行记录 → 自行退出。每次运行有超时与轮次上限。
const vscode = require('vscode');
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { WorkStore, handleWorkTool, actorForOwner, WORK_TOOL_NAMES, WORK_STATUS_LABELS } from './work-store.mjs';
import { AutopilotStore, WindowsTaskScheduler, previewSchedule, describeSchedule, runKey, nextPlanned, pidAlive, AUTOPILOT_TOOL_NAMES, MISSED_POLICIES, RUN_MODES, DEFAULT_TIMEZONE } from './autopilot-store.mjs';
import { nativeMcpResultParts } from './external-mcp-content.mjs';

const TICK_MS = 30000, INSTANCE_FRESH_MS = 90000, HEADLESS_SIBLING_WINDOW_MS = 120000;
const MAX_TURNS = 40, MAX_FAILURES_BEFORE_PAUSE = 3;
const BLOCKED_TOOLS = new Set(['bridge_ask_user', 'configure_mcp']);
const AUTOMATION_TOOLS_ALLOWED = new Set(['start', 'bridge_get_effective_rules', 'bridge_acknowledge_rules', 'bridge_get_tool_gates']);
const nowIso = (ms = Date.now()) => new Date(ms).toISOString();
const newId = prefix => `${prefix}_${Date.now().toString(36)}${crypto.randomBytes(4).toString('hex')}`;
const clip = (s, n) => { const t = String(s ?? ''); return t.length > n ? t.slice(0, n) + '…' : t; };
const shanghai = ms => new Intl.DateTimeFormat('zh-CN', { timeZone: DEFAULT_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(ms));
class RunError extends Error { constructor(code, message) { super(message); this.code = code; } }

function installInfo() {
  try {
    const installDir = path.resolve(vscode.env.appRoot, '..', '..');
    let exe = path.join(installDir, 'OpenCode.exe');
    if (!fs.existsSync(exe)) { const name = fs.readdirSync(installDir).find(n => /\.exe$/i.test(n) && !/unins|update|helper/i.test(n)); exe = name ? path.join(installDir, name) : null; }
    return exe ? { exe, installDir } : null;
  } catch { return null; }
}

function codiconDirectory() {
  try { const dir = path.join(vscode.env.appRoot, 'out', 'media'); return fs.existsSync(path.join(dir, 'codicon.ttf')) ? vscode.Uri.file(dir) : null; } catch { return null; }
}

export function registerWorkAndAutomations(context, bridge, output) {
  const service = bridge.automation;
  const root = service?.directory;
  if (!root) { output.appendLine('[work] 共享存储根不可用，工作与自动化未启用。'); return; }
  const log = message => output.appendLine('[work] ' + message);
  const work = new WorkStore({ directory: root });
  const store = new AutopilotStore({ directory: root });
  const scheduler = new WindowsTaskScheduler(store);
  const instanceId = crypto.randomUUID();
  const headless = process.env.OPENCODE_AUTOMATION_RUN === '1';
  const startedAt = Date.now();
  const runnerOwners = new Map(); // native-chat owner → { automation, runId }
  const activeRuns = new Map();   // runId → { cts, automationId }
  const panels = new Map();
  let holder = false, disposed = false, queue = Promise.resolve(), lastEnsure = null, lastEnsureError = null;
  const instancesDir = path.join(store.directory, 'instances');

  // ---------------- identities ----------------
  const automationActor = a => ({ kind: 'automation', id: a.id, name: '自动化 · ' + a.name });
  const userActor = { kind: 'user', id: 'user', name: '我' };
  const taskStore = () => bridge.dispatcher?.taskStore;
  const taskIdFor = owner => { try { return taskStore()?.currentByOwner?.get(owner) || null; } catch { return null; } };
  const actorFor = owner => { const r = runnerOwners.get(owner); if (r) return automationActor(r.automation); let name; try { name = service.connections?.get(owner)?.name; } catch {} if (!name) { try { const t = taskStore()?.tasks?.get(taskIdFor(owner) || ''); if (t?.title) name = t.title.slice(0, 40); } catch {} } return actorForOwner(owner, name); };
  const baselineFor = item => { try { return item.taskId ? service.taskGitBaselines?.get(item.taskId) || null : null; } catch { return null; } };
  const assigneeOptions = () => {
    const out = [{ kind: 'user', id: 'user', name: '我（用户）' }];
    try { for (const t of [...(taskStore()?.tasks?.values() || [])].slice(-40).reverse()) if (t?.owner && !t.displayDeleted) out.push({ kind: String(t.owner).startsWith('native-chat:') ? 'session' : 'agent', id: t.owner, name: clip(t.title || t.owner, 40) + (String(t.owner).startsWith('native-chat:') ? '（对话）' : '（Bridge）') }); } catch {}
    for (const a of store.list()) out.push({ kind: 'automation', id: a.id, name: '自动化 · ' + a.name });
    const seen = new Set(); return out.filter(o => { const k = o.kind + o.id; if (seen.has(k)) return false; seen.add(k); return true; });
  };

  // ---------------- Bridge tools (routed from AutomationService.handleTool) ----------------
  service.workBoard = {
    handleTool: async (name, args, owner) => {
      if (WORK_TOOL_NAMES.has(name)) return handleWorkTool(work, name, args, { actor: actorFor(owner), taskIdFor: () => taskIdFor(owner), baselineFor });
      if (name === 'automation_list') return { automations: store.list().map(a => ({ id: a.id, name: a.name, enabled: a.enabled, schedule: describeSchedule(a.schedule), mode: a.mode, folder: a.folder, next: (() => { const n = nextPlanned(a, Date.now()); return n ? nowIso(n) : null; })(), last_status: a.state?.lastStatus || null })) };
      if (name === 'automation_run_now') { const a = store.get(args.id); enqueue(() => executeRun(a, Date.now(), { trigger: 'manual_tool' })); return { queued: true, id: a.id, note: '已排队在本窗口执行；结果见「自动化」页的运行历史。' }; }
      throw Object.assign(new Error('未知工具：' + name), { code: 'TOOL_UNKNOWN' });
    }
  };

  // ---------------- runner ----------------
  async function pickModel(a) {
    const groups = await Promise.allSettled(['opencode', 'opencode-codex'].map(vendor => vscode.lm.selectChatModels({ vendor })));
    const models = groups.flatMap(g => g.status === 'fulfilled' ? g.value : []);
    if (a.model?.id) { const hit = models.find(m => m.id === a.model.id && (!a.model.vendor || m.vendor === a.model.vendor)); if (hit) return hit; throw new RunError('model_unavailable', `指定模型不可用：${a.model.vendor}/${a.model.id}`); }
    if (!models.length) throw new RunError('no_model', '没有可用的 OpenCode 模型（未配置提供商或密钥）。');
    return models[0];
  }
  function toolAllowed(name) {
    if (BLOCKED_TOOLS.has(name) || name.startsWith('ext__')) return false;
    if (service.hasTool?.(name)) return AUTOMATION_TOOLS_ALLOWED.has(name) || name.startsWith('bridge_memory_') || WORK_TOOL_NAMES.has(name);
    return true;
  }
  async function agentLoop({ model, owner, prompt, token, signal, transcript, chatTask }) {
    const definitions = await bridge.nativeWorkerToolDefinitions();
    const tools = definitions.filter(t => toolAllowed(t.name)).map(t => ({ name: t.name, description: t.description, inputSchema: t.inputSchema }));
    const allowed = new Set(tools.map(t => t.name));
    const messages = [vscode.LanguageModelChatMessage.User(prompt)];
    let calls = 0;
    for (let turn = 1; turn <= MAX_TURNS; turn++) {
      if (signal.aborted) throw new RunError('timeout', '超过时间预算，已停止模型循环（已发出的命令不一定已停止）。');
      const response = await model.sendRequest(messages, { tools, toolMode: vscode.LanguageModelChatToolMode.Auto }, token);
      let text = ''; const pending = [];
      for await (const part of response.stream) {
        if (signal.aborted) throw new RunError('timeout', '超过时间预算，模型输出被中止。');
        if (part instanceof vscode.LanguageModelTextPart) text += part.value;
        else if (part instanceof vscode.LanguageModelToolCallPart) pending.push(part);
      }
      if (text) transcript.push({ at: nowIso(), role: 'assistant', text: clip(text, 4000) });
      messages.push(vscode.LanguageModelChatMessage.Assistant([...(text ? [new vscode.LanguageModelTextPart(text)] : []), ...pending]));
      if (!pending.length) return { text: text.trim(), turns: turn, calls };
      const results = [];
      for (const call of pending) {
        calls++;
        let result;
        if (!allowed.has(call.name)) result = { content: [{ type: 'text', text: `自动化运行中不可用的工具：${call.name}` }], isError: true };
        else {
          try { result = await bridge.dispatcher.dispatch(call.name, call.input || {}, { signal, commandOwnerId: owner, taskOwnerId: owner }); }
          catch (error) { result = { content: [{ type: 'text', text: '工具调用失败：' + (error?.message || error) }], isError: true }; }
        }
        if (!result?.isError && ['set_todos', 'update_plan'].includes(call.name) && result?.structuredContent?.task_id === chatTask.id && Number.isSafeInteger(result.structuredContent.task_revision)) chatTask.revision = result.structuredContent.task_revision;
        const resultText = (result?.content || []).filter(c => c?.type === 'text').map(c => c.text).join('\n');
        transcript.push({ at: nowIso(), role: 'tool', tool: call.name, input: clip(JSON.stringify(call.input || {}), 1500), isError: !!result?.isError, result: clip(resultText, 1500) });
        results.push(new vscode.LanguageModelToolResultPart(call.callId, nativeMcpResultParts(vscode, result)));
      }
      messages.push(vscode.LanguageModelChatMessage.User(results));
    }
    throw new RunError('turn_budget', `超过 ${MAX_TURNS} 轮模型请求上限。`);
  }
  function buildPrompt(a, run, rules, chatTask, item) {
    return [
      '【OpenCode 自动化运行（无人值守）】',
      `自动化：${a.name}（ID ${a.id}）；计划时间：${shanghai(Date.parse(run.plannedAt))}（${DEFAULT_TIMEZONE}）；触发方式：${run.trigger}。`,
      `目标工作区：${a.folder}`,
      rules?.instructions ? '\n' + rules.instructions + '\n' : '',
      `本次运行已建立任务卡 ID ${chatTask.id}（修订 ${chatTask.revision}），用 set_todos 维护它；结束前如实收尾。`,
      item ? `关联「工作」项 #${item.number}（ID ${item.id}）已由系统置为 in_progress；系统会根据你的最终答复把它交付到 in_review。不要把它设为 done；需要补充过程记录时用 work_update 加 comment。` : '',
      `约束：无人值守，不能向用户提问；遇到需要授权、歧义或缺少条件时停止，最终答复以「受阻：」开头说明原因。不要启动常驻或后台进程。时间预算 ${a.timeoutMinutes} 分钟、最多 ${MAX_TURNS} 轮。`,
      '\n任务：',
      a.prompt,
      '\n最后用简体中文给出结果摘要：做了什么、产出在哪里、如何验证、遗留问题。'
    ].filter(Boolean).join('\n');
  }
  async function executeRun(automation, plannedMs, { trigger = 'scheduled' } = {}) {
    const manual = trigger.startsWith('manual');
    const a = store.list().find(x => x.id === automation.id) || automation;
    const key = manual ? `${a.id}@manual-${nowIso()}` : runKey(a.id, plannedMs);
    if (!store.claim(key, instanceId)) { log(`跳过已被其他实例领取的运行 ${key}`); return null; }
    const run = { id: newId('run'), automationId: a.id, name: a.name, key, plannedAt: nowIso(plannedMs), trigger: headless && !manual ? 'scheduled_while_closed' : trigger, status: 'running', startedAt: nowIso(), pid: process.pid, instanceId, timeoutMinutes: a.timeoutMinutes, mode: a.mode };
    store.appendRun(run); postAll();
    const transcript = [{ at: nowIso(), role: 'system', text: `运行 ${run.id} 开始` }];
    const owner = 'native-chat:' + crypto.randomUUID();
    const cts = new vscode.CancellationTokenSource(), controller = new AbortController();
    const timer = setTimeout(() => { controller.abort(); cts.cancel(); }, a.timeoutMinutes * 60000);
    activeRuns.set(run.id, { cts, controller, automationId: a.id });
    let item = null, chatTask = null, status = 'ok', reason = null, detail = null, summary = '', model = null, stats = {};
    try {
      if (!fs.existsSync(a.folder)) throw new RunError('folder_missing', `目标文件夹不存在：${a.folder}`);
      if (a.mode === 'create_work_item') {
        let projectId = a.projectId && work.projects().some(p => p.id === a.projectId) ? a.projectId : null;
        item = work.create({ title: `${a.name} · ${shanghai(plannedMs)}`, description: a.prompt, projectId, projectName: projectId ? undefined : '自动化', status: 'in_progress', assignee: automationActor(a), automationId: a.id, runId: run.id, folder: a.folder }, automationActor(a));
      }
      model = await pickModel(a);
      runnerOwners.set(owner, { automation: a, runId: run.id });
      const rules = await service.prepareNative(owner, a.folder, 'code');
      chatTask = bridge.dispatcher.ensureNativeChatTask(owner, model.id, '自动化：' + a.name);
      if (item) item = work.update(item.id, { expected_revision: item.revision, taskId: chatTask.id }, automationActor(a));
      const result = await agentLoop({ model, owner, prompt: buildPrompt(a, run, rules, chatTask, item), token: cts.token, signal: controller.signal, transcript, chatTask });
      summary = result.text || '（模型没有给出文字答复）'; stats = { turns: result.turns, toolCalls: result.calls };
      if (/^\s*受阻[:：]/.test(summary)) { status = 'failed'; reason = 'agent_blocked'; detail = clip(summary.replace(/^\s*受阻[:：]\s*/, ''), 1000); }
    } catch (error) {
      status = 'failed'; reason = error?.code && typeof error.code === 'string' ? error.code : (controller.signal.aborted ? 'timeout' : 'error'); detail = clip(error?.message || error, 1500);
      transcript.push({ at: nowIso(), role: 'system', text: '失败：' + detail });
    } finally {
      clearTimeout(timer); activeRuns.delete(run.id); runnerOwners.delete(owner);
      try { if (chatTask) bridge.finishNativeChatTask(owner, chatTask.id, chatTask.revision, status === 'ok'); } catch {}
      try { service.nativeAssignments?.delete(owner); service.connections?.delete(owner); } catch {}
      cts.dispose();
    }
    if (item) {
      try {
        const cur = work.get(item.id);
        if (status === 'ok') work.update(item.id, { expected_revision: cur.revision, status: 'in_review', summary: clip(summary, 15000) }, automationActor(a), { baselineFor });
        else work.update(item.id, { expected_revision: cur.revision, status: 'blocked', blockedReason: `${reason}：${clip(detail, 1500)}` }, automationActor(a));
      } catch (error) { log('工作项状态未能更新：' + error.message); }
    }
    store.saveTranscript(run.id, { runId: run.id, automationId: a.id, model: model ? `${model.vendor}/${model.id}` : null, entries: transcript.slice(-300) });
    store.appendRun({ id: run.id, automationId: a.id, key, plannedAt: run.plannedAt, status, reason, detail, summary: clip(summary, 4000), endedAt: nowIso(), workItemId: item?.id || null, workItemNumber: item?.number || null, chatTaskId: chatTask?.id || null, model: model ? `${model.vendor}/${model.id}` : null, ...stats });
    const failures = status === 'ok' ? 0 : (a.state?.consecutiveFailures || 0) + 1;
    try {
      store.patchState(a.id, { lastRunId: run.id, lastStatus: status, lastRunAt: nowIso(), consecutiveFailures: failures });
      if (!manual && failures >= MAX_FAILURES_BEFORE_PAUSE) {
        const latest = store.get(a.id);
        if (latest.enabled) { store.save({ ...latest, enabled: false, expected_revision: latest.revision }); store.patchState(a.id, { pausedReason: `连续 ${failures} 次失败，已自动停用；修复后重新启用。` }); void vscode.window.showWarningMessage(`自动化「${a.name}」连续 ${failures} 次失败，已自动停用。`); }
      }
    } catch (error) { log('自动化状态未能更新：' + error.message); }
    log(`运行 ${run.id}（${a.name}）结束：${status}${reason ? ' / ' + reason : ''}`);
    postAll();
    void ensureTask();
    return { runId: run.id, status };
  }
  function enqueue(fn) { const next = queue.then(fn, fn).catch(error => log('运行队列错误：' + (error?.message || error))); queue = next; return next; }

  // ---------------- scheduling ----------------
  async function ensureTask(force = false) {
    if (process.platform !== 'win32') return null;
    try { lastEnsure = await scheduler.ensure({ force }); lastEnsureError = lastEnsure?.registered === false && lastEnsure.reason !== 'not_windows' ? (lastEnsure.detail || lastEnsure.reason) : null; }
    catch (error) { lastEnsureError = error.message; log('计划任务登记失败：' + error.message); }
    return lastEnsure;
  }
  function heartbeatInstance() {
    try { fs.mkdirSync(instancesDir, { recursive: true }); fs.writeFileSync(path.join(instancesDir, instanceId + '.json'), JSON.stringify({ instanceId, pid: process.pid, startedAt: nowIso(startedAt), heartbeatAt: nowIso(), headless })); } catch {}
  }
  function otherUserInstances() {
    const out = [];
    try { for (const f of fs.readdirSync(instancesDir)) { const v = JSON.parse(fs.readFileSync(path.join(instancesDir, f), 'utf8')); if (v.instanceId === instanceId) continue; if (Date.now() - Date.parse(v.heartbeatAt) > INSTANCE_FRESH_MS || !pidAlive(v.pid)) { fs.rmSync(path.join(instancesDir, f), { force: true }); continue; } const sibling = v.headless && Math.abs(Date.parse(v.startedAt) - startedAt) < HEADLESS_SIBLING_WINDOW_MS; if (!sibling) out.push(v); } } catch {}
    return out;
  }
  /** Plan due slots: record skipped ones, advance cursors, queue the one run per automation. Only the lock holder does this. */
  async function processDue() {
    const plans = store.plan(Date.now());
    const jobs = [];
    for (const p of plans) {
      for (const t of p.skip.slice(-20)) if (store.claim(runKey(p.automation.id, t), instanceId)) store.appendRun({ id: newId('run'), automationId: p.automation.id, name: p.automation.name, key: runKey(p.automation.id, t), plannedAt: nowIso(t), status: 'skipped', reason: p.automation.missedPolicy === 'skip_missed' ? 'missed' : 'missed_older', detail: p.automation.missedPolicy === 'skip_missed' ? '错过计划时间，按策略跳过。' : '错过多次，按策略只补跑最近一次。', endedAt: nowIso() });
      if (p.skip.length > 20) log(`自动化「${p.automation.name}」另有 ${p.skip.length - 20} 次更早的错过运行未逐条记录。`);
      store.patchState(p.automation.id, { cursor: nowIso(p.cursor) });
      if (p.run !== null) jobs.push(enqueue(() => executeRun(p.automation, p.run, { trigger: 'scheduled' })));
    }
    await Promise.all(jobs);
    return jobs.length;
  }
  let processing = null;
  async function tick() {
    if (disposed) return;
    heartbeatInstance();
    try {
      holder = store.acquireLock(instanceId, { headless, version: vscode.version }); // also refreshes the heartbeat during long runs
      if (!holder || processing) return;
      processing = processDue().catch(error => log('调度出错：' + (error?.message || error))).finally(() => { processing = null; });
      await ensureTask();
    } catch (error) { log('调度出错：' + (error?.message || error)); }
  }
  async function startup() {
    const info = installInfo();
    if (info && process.platform === 'win32') { try { scheduler.writePointer(info); } catch (error) { log('pointer.json 写入失败：' + error.message); } }
    heartbeatInstance();
    holder = store.acquireLock(instanceId, { headless, version: vscode.version });
    if (holder) {
      store.recoverInterrupted(r => activeRuns.has(r.id) || (r.pid && r.pid !== process.pid && pidAlive(r.pid) && Date.now() - Date.parse(r.startedAt) < ((r.timeoutMinutes || 20) + 10) * 60000));
      store.pruneClaims();
    }
    if (headless) return runHeadless();
    await ensureTask(true); await tick();
  }
  async function waitForModels(ms) { const end = Date.now() + ms; while (Date.now() < end) { try { const m = await vscode.lm.selectChatModels({ vendor: 'opencode' }); const c = await vscode.lm.selectChatModels({ vendor: 'opencode-codex' }); if (m.length + c.length) return true; } catch {} await new Promise(r => setTimeout(r, 2000)); } return false; }
  async function runHeadless() {
    log('以自动化模式启动（OPENCODE_AUTOMATION_RUN=1）：执行到期运行后自动退出。');
    const plansPreview = store.plan(Date.now()).filter(p => p.run !== null);
    const budgetMs = Math.min(3 * 3600000, plansPreview.reduce((s, p) => s + p.automation.timeoutMinutes * 60000, 0) + 10 * 60000);
    const watchdog = setTimeout(() => { log('自动化模式总时长超限，强制结束。'); for (const r of activeRuns.values()) { r.controller.abort(); r.cts.cancel(); } void quitIfAlone(true); }, budgetMs);
    void vscode.window.setStatusBarMessage(`$(opencode-automations) OpenCode 正在执行 ${plansPreview.length} 个到期自动化，完成后自动退出`, budgetMs);
    try {
      await waitForModels(60000);
      for (let i = 0; i < 20 && !holder; i++) { await new Promise(r => setTimeout(r, 3000)); holder = store.acquireLock(instanceId, { headless, version: vscode.version }); }
      if (holder) await (processing = processDue()); else log('另一个 OpenCode 实例持有调度锁，本实例不执行。');
      await queue;
      await ensureTask();
    } catch (error) { log('自动化模式出错：' + (error?.message || error)); }
    finally { clearTimeout(watchdog); }
    await quitIfAlone(false);
  }
  async function quitIfAlone(force) {
    const others = otherUserInstances();
    if (others.length && !force) { log(`有 ${others.length} 个用户打开的窗口，自动化完成后不退出。`); void vscode.window.showInformationMessage('OpenCode 自动化已完成；检测到你打开了其他窗口，所以没有自动退出。'); return; }
    store.releaseLock(instanceId); holder = false;
    log('自动化模式完成，退出 OpenCode。');
    setTimeout(() => { void vscode.commands.executeCommand('workbench.action.quit'); }, 1500);
  }

  // ---------------- webview panels ----------------
  const screens = {
    work: { viewType: 'opencode.work', title: '工作', html: 'work.html', script: 'work.js' },
    automations: { viewType: 'opencode.automations', title: '自动化', html: 'automations.html', script: 'automations.js' }
  };
  async function modelOptions() { try { const groups = await Promise.allSettled(['opencode', 'opencode-codex'].map(vendor => vscode.lm.selectChatModels({ vendor }))); return groups.flatMap(g => g.status === 'fulfilled' ? g.value : []).map(m => ({ vendor: m.vendor, id: m.id, name: m.name })); } catch { return []; } }
  let modelCache = [];
  function snapshot(page) {
    if (page === 'work') return { ...work.snapshot(), assignees: assigneeOptions(), automations: store.list().map(a => ({ id: a.id, name: a.name })) };
    const now = Date.now(), runs = store.runs({ limit: 150 });
    const automations = store.list().map(a => { const next = store.isActive(a, now) ? (store.missedTimes(a, now, 1)[0] ?? nextPlanned(a, Math.max(now, Date.parse(a.state?.cursor || a.createdAt)))) : null; return { ...a, scheduleText: describeSchedule(a.schedule), next: next ? nowIso(next) : null, nextText: next ? shanghai(next) : null, lastRun: runs.find(r => r.automationId === a.id) || null, running: [...activeRuns.values()].some(r => r.automationId === a.id) }; });
    const pointer = scheduler.readPointer(), lock = store.readLock(), sched = store.readSchedule();
    return { automations, runs, models: modelCache, projects: work.projects().map(p => ({ id: p.id, name: p.name })), policies: MISSED_POLICIES, modes: RUN_MODES, timezone: DEFAULT_TIMEZONE, platform: process.platform,
      scheduler: { holder, instanceId, lock: lock ? { pid: lock.pid, heartbeatAt: lock.heartbeatAt, mine: lock.instanceId === instanceId } : null, registered: sched.registered, lastEnsure, lastEnsureError, taskName: scheduler.taskName, pointer: pointer ? { exe: pointer.exe, updatedAt: pointer.updatedAt } : null, launcherDir: scheduler.launcherDir, dataDir: store.directory } };
  }
  function post(page) { const panel = panels.get(page); if (!panel) return; try { panel.webview.postMessage({ type: 'state', value: snapshot(page) }); } catch (error) { try { panel.webview.postMessage({ type: 'error', message: error.message }); } catch {} } }
  function postAll() { for (const page of panels.keys()) post(page); }
  async function pickFolder(title) { const choice = await vscode.window.showOpenDialog({ canSelectFolders: true, canSelectFiles: false, canSelectMany: false, title }); return choice?.[0]?.fsPath || null; }
  async function handle(page, action, input) {
    if (action === 'refresh') { if (page === 'automations') modelCache = await modelOptions(); return null; }
    if (action === 'pickFolder') return pickFolder(input.title || '选择文件夹');
    if (page === 'work') switch (action) {
      case 'saveProject': return work.saveProject(input);
      case 'deleteProject': { const ok = await vscode.window.showWarningMessage('删除这个项目？其中已结束的工作项会保留为「无项目」。', { modal: true }, '删除'); return ok === '删除' ? work.deleteProject(input.id) : null; }
      case 'createItem': return work.create(input, userActor);
      case 'updateItem': return work.update(input.id, input.patch || {}, userActor, { baselineFor });
      case 'markDone': { const cur = work.get(input.id); return work.update(input.id, { expected_revision: input.expected_revision ?? cur.revision, status: 'done', ...(input.comment ? { comment: input.comment } : {}) }, userActor); }
      case 'deleteItem': { const ok = await vscode.window.showWarningMessage('永久删除这个工作项及其评论？', { modal: true }, '删除'); return ok === '删除' ? work.remove(input.id) : null; }
      case 'openTask': { try { await vscode.commands.executeCommand('opencode.bridge.getStatus'); } catch {} return null; }
    }
    if (page === 'automations') switch (action) {
      case 'save': { const saved = store.save(input); await ensureTask(); return saved; }
      case 'toggle': { const saved = store.setEnabled(input.id, input.enabled === true); await ensureTask(); return saved; }
      case 'remove': { const ok = await vscode.window.showWarningMessage('删除这个自动化？运行历史会保留。', { modal: true }, '删除'); if (ok !== '删除') return null; const r = store.remove(input.id); await ensureTask(); return r; }
      case 'runNow': { const a = store.get(input.id); void enqueue(() => executeRun(a, Date.now(), { trigger: 'manual' })); return { queued: true }; }
      case 'cancelRun': { const r = activeRuns.get(input.runId); if (r) { r.controller.abort(); r.cts.cancel(); } return { cancelled: !!r }; }
      case 'preview': { try { return { times: previewSchedule({ schedule: input.schedule, createdAt: nowIso(), startAt: null, endAt: input.endAt || null }, Date.now(), 5).map(t => shanghai(Date.parse(t))), text: describeSchedule(input.schedule) }; } catch (error) { return { error: error.message }; } }
      case 'transcript': return store.readTranscript(input.runId);
      case 'reregister': return ensureTask(true);
    }
    throw new Error('此页面不支持该操作。');
  }
  async function open(page) {
    const screen = screens[page]; if (!screen) return;
    const existing = panels.get(page); if (existing) { existing.reveal(); post(page); return; }
    const directory = vscode.Uri.joinPath(context.extensionUri, 'media', 'task-workbench');
    // 界面图标使用 VS Code 自带的 codicon 字体（应用目录 out/media/codicon.ttf），不复制进扩展；找不到时页面退回纯文字按钮。
    const codicons = codiconDirectory();
    const panel = vscode.window.createWebviewPanel(screen.viewType, screen.title, vscode.ViewColumn.Active, { enableScripts: true, retainContextWhenHidden: true, localResourceRoots: codicons ? [directory, codicons] : [directory] });
    panel.iconPath = { light: vscode.Uri.joinPath(directory, 'icons', page + '-light.svg'), dark: vscode.Uri.joinPath(directory, 'icons', page + '-dark.svg') };
    panels.set(page, panel);
    let html = fs.readFileSync(path.join(directory.fsPath, screen.html), 'utf8');
    const nonce = crypto.randomBytes(18).toString('base64');
    const style = panel.webview.asWebviewUri(vscode.Uri.joinPath(directory, 'automation.css')), own = panel.webview.asWebviewUri(vscode.Uri.joinPath(directory, 'work.css')), script = panel.webview.asWebviewUri(vscode.Uri.joinPath(directory, screen.script));
    const font = codicons ? panel.webview.asWebviewUri(vscode.Uri.joinPath(codicons, 'codicon.ttf')) : null;
    const csp = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${panel.webview.cspSource} data:; style-src ${panel.webview.cspSource} 'nonce-${nonce}'; font-src ${panel.webview.cspSource}; script-src 'nonce-${nonce}'; connect-src 'none'; object-src 'none'; base-uri 'none'">`;
    const fontFace = font ? `<style nonce="${nonce}">@font-face{font-family:"codicon";font-display:block;src:url("${font}") format("truetype")}</style>` : '';
    panel.webview.html = html.replace('<head>', '<head>' + csp + fontFace).replace('href="automation.css"', 'href="' + style + '"').replace('href="work.css"', 'href="' + own + '"').replace('src="' + screen.script + '"', 'nonce="' + nonce + '" src="' + script + '"').replace('<body class="wk-app', font ? '<body class="oc-codicons wk-app' : '<body class="wk-app');
    panel.onDidDispose(() => { if (panels.get(page) === panel) panels.delete(page); });
    panel.webview.onDidReceiveMessage(async message => {
      if (!message || typeof message !== 'object') return;
      if (message.type === 'ready') { if (page === 'automations') modelCache = await modelOptions(); post(page); return; }
      if (message.type !== 'action' || typeof message.action !== 'string' || typeof message.id !== 'string') return;
      try { const value = await handle(page, message.action, message.input && typeof message.input === 'object' ? message.input : {}); panel.webview.postMessage({ type: 'result', id: message.id, value: value ?? null }); }
      catch (error) { panel.webview.postMessage({ type: 'result', id: message.id, error: String(error?.reason || error?.message || error).replace(/^[A-Z][A-Z0-9_]+: /, ''), code: error?.code, details: error?.details }); }
      post(page);
    });
  }

  // ---------------- status bar entries ----------------
  // 让「工作」「自动化」不依赖对话视图也能找到；右键状态栏可单独隐藏。
  const statusWork = vscode.window.createStatusBarItem('opencode.work.status', vscode.StatusBarAlignment.Left, 40);
  statusWork.name = 'OpenCode 工作'; statusWork.command = 'opencode.work.open';
  const statusAuto = vscode.window.createStatusBarItem('opencode.automations.status', vscode.StatusBarAlignment.Left, 39);
  statusAuto.name = 'OpenCode 自动化'; statusAuto.command = 'opencode.automations.open';
  let statusRunning = -1;
  function updateWorkStatus() {
    try {
      const items = work.snapshot().items, review = items.filter(i => i.status === 'in_review').length, blocked = items.filter(i => i.status === 'blocked').length, open = items.filter(i => !['done', 'cancelled'].includes(i.status)).length;
      statusWork.text = '$(opencode-work) 工作' + (review ? ' ' + review : '');
      statusWork.tooltip = `打开「工作」看板 · ${open} 项未结束${review ? `，${review} 项待验收` : ''}${blocked ? `，${blocked} 项受阻` : ''}`;
    } catch { statusWork.text = '$(opencode-work) 工作'; statusWork.tooltip = '打开「工作」看板'; }
    // 左下角不再显示：入口只留在对话视图右上角（view/title）。
  }
  function updateAutoStatus(force = false) {
    const running = activeRuns.size;
    if (!force && running === statusRunning) return;
    statusRunning = running;
    statusAuto.text = running ? '$(sync~spin) 自动化' : '$(opencode-automations) 自动化';
    try { const enabled = store.list().filter(a => a.enabled).length; statusAuto.tooltip = running ? `${running} 个自动化正在运行 · 打开「自动化」` : `打开「自动化」 · ${enabled} 个已启用`; } catch { statusAuto.tooltip = '打开「自动化」'; }
    // 同上：不在状态栏显示「自动化」。
  }
  updateWorkStatus(); updateAutoStatus(true);
  const statusTimer = setInterval(() => updateAutoStatus(), 5000); statusTimer.unref?.();

  // ---------------- lifecycle ----------------
  const unsubscribe = [work.onDidChange(() => { post('work'); updateWorkStatus(); }), store.onDidChange(() => { post('automations'); updateAutoStatus(true); })];
  const timer = setInterval(() => { void tick(); }, TICK_MS); timer.unref?.();
  const uiTimer = setInterval(() => { if (panels.size) postAll(); }, 15000); uiTimer.unref?.();
  setTimeout(() => { void startup().catch(error => log('启动失败：' + (error?.message || error))); }, headless ? 4000 : 8000);
  context.subscriptions.push(
    vscode.commands.registerCommand('opencode.work.open', () => open('work')),
    vscode.commands.registerCommand('opencode.automations.open', () => open('automations')),
    statusWork, statusAuto,
    { dispose() { disposed = true; clearInterval(timer); clearInterval(uiTimer); clearInterval(statusTimer); for (const u of unsubscribe) u(); for (const r of activeRuns.values()) { r.controller.abort(); r.cts.cancel(); } store.releaseLock(instanceId); try { fs.rmSync(path.join(instancesDir, instanceId + '.json'), { force: true }); } catch {} for (const p of panels.values()) p.dispose(); panels.clear(); if (service.workBoard) service.workBoard = null; } }
  );
  return { work, store, scheduler, open };
}
