(() => {
'use strict';
// 「自动化」页面 webview：列表、编辑（计划选择器 + cron + 未来 5 次预览）、启用/停用、立即运行、运行历史、后台调度状态。
// 协议不变：ready / action{id,action,input} ← state / result / error。
const vscode = acquireVsCodeApi(), $ = id => document.getElementById(id), pending = new Map();
let sequence = 0, data = null, editing = null, editorOpen = false, previewTimer = 0, runsFilter = '', runsStatus = '', feedbackTimer = 0, scheduleKind = 'daily', menu = null, tab = 'list', editorDirty = false, escArmed = 0;
const saved = vscode.getState() || {};
if (['list', 'runs', 'sched'].includes(saved.tab)) tab = saved.tab;
const STATUS = { ok: '成功', failed: '失败', skipped: '跳过', running: '运行中' };
const STATUS_ICON = { ok: 'pass-filled', failed: 'error', skipped: 'circle-slash', running: 'sync' };
const REASON = { missed_older: '错过多次，只补最近一次', missed: '错过计划时间（按策略跳过）', install_moved: '安装目录已移动', interrupted: 'OpenCode 中途关闭', timeout: '超时', turn_budget: '超出轮次上限', no_model: '没有可用模型', model_unavailable: '指定模型不可用', folder_missing: '目标文件夹不存在', agent_blocked: '模型报告受阻', error: '错误' };
const TRIGGER = { scheduled: '定时', scheduled_while_closed: '定时（OpenCode 关闭时）', manual: '手动', manual_tool: 'Bridge 工具' };
const MODE_SHORT = { create_work_item: '建工作项', run_only: '只运行' };
const DAYS = ['日', '一', '二', '三', '四', '五', '六'];

// ---------- 通用 ----------
function el(tag, text, className) { const n = document.createElement(tag); if (text !== undefined && text !== null) n.textContent = text; if (className) n.className = className; return n; }
function icon(name, extra = '') { const i = el('span', undefined, `codicon codicon-${name}${extra ? ' ' + extra : ''}`); i.setAttribute('aria-hidden', 'true'); return i; }
function opt(value, text, selected) { const o = el('option', text); o.value = value; if (selected) o.selected = true; return o; }
function button(label, { cls = 'wk-btn', ic, title, onClick } = {}) { const b = el('button', undefined, cls); b.type = 'button'; if (ic) b.append(icon(ic)); if (label) b.append(document.createTextNode(label)); if (title) { b.title = title; if (!label) { b.setAttribute('aria-label', title); b.dataset.label = title; } } if (onClick) b.addEventListener('click', onClick); return b; }
function notice(text, error = false) {
  const box = $('feedback'); clearTimeout(feedbackTimer); box.replaceChildren(); box.classList.toggle('error', !!error);
  if (!text) return;
  box.append(icon(error ? 'error' : 'info'), el('span', text));
  if (!error) feedbackTimer = setTimeout(() => box.replaceChildren(), 4000);
}
function api(action, input = {}) { return new Promise((resolve, reject) => { const id = 'auto_' + (++sequence); pending.set(id, { resolve, reject }); vscode.postMessage({ type: 'action', id, action, input }); }); }
async function act(action, input, button, ok = '已保存') { if (button) button.disabled = true; try { const v = await api(action, input); if (ok) notice(ok); return v; } catch (e) { notice(e.message, true); throw e; } finally { if (button) button.disabled = false; } }
const fmt = iso => { if (!iso) return ''; const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleString('zh-CN', { hour12: false }); };
const p2 = n => String(n).padStart(2, '0');
function rel(ms) {
  if (ms === null || ms === undefined || isNaN(ms)) return '';
  const diff = ms - Date.now(), a = Math.abs(diff), min = 60000, hour = 60 * min, day = 24 * hour;
  const v = a < min ? null : a < hour ? `${Math.round(a / min)} 分钟` : a < day ? `${Math.round(a / hour)} 小时` : `${Math.round(a / day)} 天`;
  if (!v) return diff >= 0 ? '即将' : '刚刚';
  return diff >= 0 ? `${v}后` : `${v}前`;
}
const relIso = iso => iso ? rel(Date.parse(iso)) : '';
function timeEl(iso, cls = '') { const t = el('time', relIso(iso), cls); if (iso) { t.dateTime = iso; t.title = fmt(iso); } return t; }
function duration(a, b) { const s = Math.round((Date.parse(b) - Date.parse(a)) / 1000); if (!(s >= 0)) return ''; return s < 60 ? `${s} 秒` : s < 3600 ? `${Math.round(s / 60)} 分钟` : `${(s / 3600).toFixed(1)} 小时`; }
function badge(status) { const b = el('span', undefined, 'wk-badge ' + status); b.append(icon(STATUS_ICON[status] || 'circle-filled', status === 'running' ? 'codicon-spin' : ''), el('span', STATUS[status] || status)); return b; }
// 「2026/11/14 09:00」（服务端按 Asia/Shanghai 格式化）→ 毫秒 + 星期
function parseShanghai(text) { const m = /^(\d{4})\/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})/.exec(text || ''); if (!m) return null; const [y, mo, d, h, mi] = m.slice(1).map(Number); return { ms: Date.UTC(y, mo - 1, d, h - 8, mi), weekday: new Date(Date.UTC(y, mo - 1, d)).getUTCDay(), label: `${mo}月${d}日`, time: `${p2(h)}:${p2(mi)}` }; }
function persist() { vscode.setState({ tab }); }

// ---------- 标签页 ----------
function setTab(next, focus = false) {
  tab = next; persist(); closeMenu();
  for (const [t, panel] of [['list', 'panel-list'], ['runs', 'panel-runs'], ['sched', 'panel-sched']]) {
    const b = $('tab-' + t), on = t === tab; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; $(panel).hidden = !on;
    if (on && focus) b.focus();
  }
}
for (const t of ['list', 'runs', 'sched']) $('tab-' + t).addEventListener('click', () => setTab(t));
$('tab-list').parentElement.addEventListener('keydown', e => {
  const order = ['list', 'runs', 'sched'], i = order.indexOf(tab);
  if (e.key === 'ArrowRight') { e.preventDefault(); setTab(order[(i + 1) % 3], true); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); setTab(order[(i + 2) % 3], true); }
});

// ---------- 浮动菜单 ----------
function closeMenu(focusBack = false) { if (!menu) return; const { node, anchor } = menu; menu = null; node.remove(); anchor.setAttribute('aria-expanded', 'false'); if (focusBack) anchor.focus(); }
function openMenu(anchor, items) {
  if (menu && menu.anchor === anchor) { closeMenu(); return; }
  closeMenu();
  const node = el('div', undefined, 'wk-menu'); node.setAttribute('role', 'menu');
  for (const it of items) {
    if (it === '-') { node.append(el('hr')); continue; }
    const b = button(it.label, { cls: it.danger ? 'danger' : '', ic: it.icon }); b.setAttribute('role', 'menuitem'); b.disabled = !!it.disabled; b.tabIndex = -1;
    b.addEventListener('click', () => { closeMenu(); it.run(anchor); }); node.append(b);
  }
  document.body.append(node);
  const r = anchor.getBoundingClientRect(), w = node.offsetWidth, h = node.offsetHeight;
  node.style.left = Math.max(4, Math.min(r.right - w, window.innerWidth - w - 4)) + 'px';
  node.style.top = (r.bottom + 4 + h > window.innerHeight ? Math.max(4, r.top - h - 4) : r.bottom + 4) + 'px';
  anchor.setAttribute('aria-expanded', 'true');
  menu = { node, anchor };
  const buttons = () => [...node.querySelectorAll('button:not(:disabled)')];
  buttons()[0]?.focus();
  node.addEventListener('keydown', e => {
    const list = buttons(), i = list.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); list[(i + 1) % list.length]?.focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); list[(i - 1 + list.length) % list.length]?.focus(); }
    else if (e.key === 'Home') { e.preventDefault(); list[0]?.focus(); }
    else if (e.key === 'End') { e.preventDefault(); list[list.length - 1]?.focus(); }
    else if (e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); e.stopPropagation(); closeMenu(true); }
  });
}
document.addEventListener('mousedown', e => { if (menu && !menu.node.contains(e.target) && !menu.anchor.contains(e.target)) closeMenu(); });
window.addEventListener('blur', () => closeMenu());
window.addEventListener('resize', () => closeMenu());

// ---------- 列表 ----------
function showHistory(id) { runsFilter = id; setTab('runs'); renderRuns(); }
function removeAutomation(a, anchor) { act('remove', { id: a.id }, anchor, null).then(r => { if (r) { notice('已删除'); if (editing === a.id) closeEditor(true); } }); }
function runNow(a, b) { act('runNow', { id: a.id }, b, '已排队立即运行；结果见「运行历史」。'); }
function renderList() {
  const box = $('list'); box.replaceChildren();
  const q = $('search').value.trim().toLowerCase();
  const list = data.automations.filter(a => !q || `${a.name}\n${a.prompt}\n${a.folder}`.toLowerCase().includes(q));
  const enabled = data.automations.filter(a => a.enabled).length;
  $('summary').textContent = data.automations.length ? `${enabled} 个已启用 · 共 ${data.automations.length} 个` : '';
  $('count-list').textContent = String(data.automations.length);
  if (!data.automations.length) {
    const e = el('div', undefined, 'wk-empty'); e.append(icon('history'), el('strong', '还没有自动化'), el('span', '让 OpenCode 按计划执行一段提示词，例如每天 09:00 汇总昨日提交。'), button('新建自动化', { cls: 'wk-btn primary', ic: 'add', onClick: () => openEditor(null) }));
    box.append(e); return;
  }
  if (!list.length) { box.append(el('div', `没有匹配「${q}」的自动化。`, 'wk-empty')); return; }
  const table = el('div', undefined, 'ap-table'); table.setAttribute('role', 'table'); table.setAttribute('aria-label', '自动化列表');
  const head = el('div', undefined, 'ap-row ap-head'); head.setAttribute('role', 'row');
  for (const h of ['启用', '名称', '计划', '下次运行', '最近结果', '']) { const c = el('span', h); c.setAttribute('role', 'columnheader'); head.append(c); }
  table.append(head);
  for (const a of list) {
    const row = el('div', undefined, 'ap-row' + (a.enabled ? '' : ' is-disabled') + (editorOpen && editing === a.id ? ' is-selected' : '')); row.setAttribute('role', 'row'); row.dataset.id = a.id;
    const toggle = el('button', undefined, 'wk-switch'); toggle.type = 'button'; toggle.setAttribute('role', 'switch'); toggle.setAttribute('aria-checked', String(a.enabled)); toggle.setAttribute('aria-label', `启用「${a.name}」`); toggle.title = a.enabled ? '已启用，点击停用' : '已停用，点击启用';
    toggle.addEventListener('click', () => act('toggle', { id: a.id, enabled: !a.enabled }, toggle, a.enabled ? '已停用' : '已启用'));
    const name = el('div', undefined, 'ap-name'); name.setAttribute('role', 'cell');
    const strong = el('strong'); strong.append(el('span', a.name)); strong.title = a.prompt || a.name; name.append(strong);
    const sub = el('div', undefined, 'wk-xs wk-muted'); const mode = el('span', MODE_SHORT[a.mode] || data.modes[a.mode] || a.mode, 'wk-chip'); mode.prepend(icon(a.mode === 'run_only' ? 'play' : 'checklist')); mode.title = data.modes[a.mode] || a.mode;
    sub.append(mode, el('span', a.folder, 'wk-ellipsis')); sub.lastChild.title = a.folder; name.append(sub);
    if (a.state?.pausedReason && !a.enabled) { const pr = el('div', undefined, 'ap-paused'); pr.append(icon('warning'), el('span', a.state.pausedReason)); name.append(pr); }
    const sched = el('div', undefined, 'ap-sched'); sched.setAttribute('role', 'cell');
    const st = el('span'); st.append(icon('calendar'), el('span', a.scheduleText)); sched.append(st);
    if (a.endAt) sched.append(el('span', `截止 ${fmt(a.endAt)}`, 'wk-xs wk-muted'));
    const next = el('div', undefined, 'ap-next'); next.setAttribute('role', 'cell');
    if (!a.enabled) next.append(el('span', '已停用', 'wk-muted'));
    else if (!a.next) next.append(el('span', '无（已过结束时间）', 'wk-muted'));
    else { const due = Date.parse(a.next) <= Date.now(), n1 = el('span'); n1.append(icon('clock'), el('span', due ? '已到期，等待运行' : rel(Date.parse(a.next)))); next.append(n1, el('span', a.nextText || fmt(a.next), 'wk-xs wk-muted')); }
    const last = el('div', undefined, 'ap-last'); last.setAttribute('role', 'cell');
    if (a.running) last.append(badge('running'));
    else if (a.lastRun) { const b = badge(a.lastRun.status); if (a.lastRun.reason) b.title = REASON[a.lastRun.reason] || a.lastRun.reason; last.append(b, timeEl(a.lastRun.endedAt || a.lastRun.startedAt || a.lastRun.plannedAt, 'wk-xs wk-muted')); }
    else last.append(el('span', '尚未运行', 'wk-xs wk-muted'));
    const ops = el('div', undefined, 'ap-actions'); ops.setAttribute('role', 'cell');
    const run = button('', { cls: 'wk-icon-btn', ic: a.running ? 'loading' : 'play', title: a.running ? '运行中…' : '立即运行' }); if (a.running) run.firstChild.classList.add('codicon-spin'); run.disabled = a.running; run.addEventListener('click', () => runNow(a, run));
    const more = button('', { cls: 'wk-icon-btn', ic: 'ellipsis', title: '更多操作' }); more.setAttribute('aria-haspopup', 'menu'); more.setAttribute('aria-expanded', 'false');
    more.addEventListener('click', () => openMenu(more, [
      { label: '编辑', icon: 'edit', run: () => openEditor(a) },
      { label: '立即运行', icon: 'play', disabled: a.running, run: () => runNow(a, run) },
      { label: '查看运行历史', icon: 'history', run: () => showHistory(a.id) },
      { label: a.enabled ? '停用' : '启用', icon: a.enabled ? 'debug-pause' : 'play-circle', run: () => act('toggle', { id: a.id, enabled: !a.enabled }, null, a.enabled ? '已停用' : '已启用') },
      '-',
      { label: '删除', icon: 'trash', danger: true, run: anchor => removeAutomation(a, anchor) }
    ]));
    ops.append(run, more);
    name.addEventListener('dblclick', () => openEditor(a));
    row.append(toggle, name, sched, next, last, ops); table.append(row);
  }
  box.append(table);
}

// ---------- 运行历史 ----------
function renderRuns() {
  const sel = $('runs-filter'), cur = runsFilter;
  if (cur && !data.automations.some(a => a.id === cur) && !data.runs.some(r => r.automationId === cur)) runsFilter = '';
  sel.replaceChildren(opt('', '全部自动化', !runsFilter), ...data.automations.map(a => opt(a.id, a.name, a.id === runsFilter)));
  $('runs-status').value = runsStatus;
  const running = data.runs.filter(r => r.status === 'running').length;
  $('count-running').textContent = String(running); $('count-running').classList.toggle('wk-hidden', !running); $('count-running').title = running + ' 个正在运行';
  const runs = data.runs.filter(r => (!runsFilter || r.automationId === runsFilter) && (!runsStatus || r.status === runsStatus)).slice(0, 100);
  $('runs-count').textContent = runs.length ? `${runs.length} 条记录` : '';
  const box = $('runs'); box.replaceChildren();
  if (!runs.length) { const e = el('div', undefined, 'wk-empty'); e.append(icon('history'), el('span', data.runs.length ? '没有符合筛选条件的运行记录。' : '还没有运行记录。')); box.append(e); return; }
  const table = el('div', undefined, 'ap-table'); table.setAttribute('role', 'table'); table.setAttribute('aria-label', '运行历史');
  const head = el('div', undefined, 'ap-run ap-head'); head.setAttribute('role', 'row');
  for (const h of ['状态', '自动化 / 时间', '原因 / 摘要', '工作项', '']) { const c = el('span', h); c.setAttribute('role', 'columnheader'); head.append(c); }
  table.append(head);
  const nameOf = id => data.automations.find(a => a.id === id)?.name || id;
  for (const r of runs) {
    const row = el('div', undefined, 'ap-run'); row.setAttribute('role', 'row');
    const st = el('div'); st.setAttribute('role', 'cell'); st.append(badge(r.status));
    const who = el('div'); who.setAttribute('role', 'cell');
    who.append(el('strong', nameOf(r.automationId), 'wk-ellipsis'));
    const when = el('span', undefined, 'wk-xs wk-muted'); when.append(document.createTextNode((TRIGGER[r.trigger] || r.trigger || '') + ' · 计划 '), timeEl(r.plannedAt));
    const dur = r.startedAt && r.endedAt ? duration(r.startedAt, r.endedAt) : ''; if (dur) when.append(document.createTextNode(' · 用时 ' + dur));
    who.append(when);
    const why = el('div', undefined, 'ap-col-detail'); why.setAttribute('role', 'cell');
    if (r.reason) why.append(el('span', REASON[r.reason] || r.reason, 'ap-why' + (r.status === 'failed' ? ' err' : '')));
    if (r.detail) why.append(el('span', r.detail, 'ap-text wk-muted'));
    if (r.summary) why.append(el('span', r.summary, 'ap-text'));
    if (!r.reason && !r.detail && !r.summary) why.append(el('span', r.status === 'running' ? '正在运行…' : '—', 'wk-muted'));
    const wi = el('div', undefined, 'ap-col-wi'); wi.setAttribute('role', 'cell'); wi.append(r.workItemNumber ? el('span', '#' + r.workItemNumber, 'wk-chip') : el('span', '—', 'wk-muted'));
    const ops = el('div', undefined, 'ap-ops ap-col-ops'); ops.setAttribute('role', 'cell');
    if (r.status === 'running') ops.append(button('停止', { ic: 'debug-stop', onClick: e => act('cancelRun', { runId: r.id }, e.currentTarget, '已请求停止（已发出的命令不一定已停止）') }));
    else if (r.status !== 'skipped') ops.append(button('过程', { ic: 'output', title: '查看这次运行的过程记录', onClick: e => showTranscript(r, e.currentTarget) }));
    row.append(st, who, why, wi, ops); table.append(row);
  }
  box.append(table);
}
async function showTranscript(r, anchor) {
  const v = await act('transcript', { runId: r.id }, anchor, null);
  closeEditor(true);
  const box = $('transcript'); box.replaceChildren();
  const name = data.automations.find(a => a.id === r.automationId)?.name || r.automationId;
  $('transcript-title').textContent = `运行过程 · ${name}`;
  const meta = el('dl', undefined, 'wk-facts');
  const fact = (k, val) => { const dd = el('dd'); if (val instanceof Node) dd.append(val); else dd.textContent = val; meta.append(el('dt', k), dd); };
  fact('状态', badge(r.status)); fact('计划', fmt(r.plannedAt)); if (r.startedAt) fact('开始', fmt(r.startedAt)); if (r.endedAt) fact('结束', fmt(r.endedAt));
  fact('模型', v?.model || '—');
  box.append(meta);
  if (!v) box.append(el('div', '没有保存过程记录。', 'wk-empty'));
  else for (const e of v.entries) {
    const n = el('div', undefined, 'ap-entry' + (e.isError ? ' err' : '')), h = el('div', undefined, 'ap-entry-head');
    if (e.role === 'tool') {
      h.append(icon('settings-gear'), el('strong', '工具 ' + e.tool + (e.isError ? '（失败）' : '')), el('span', fmt(e.at)));
      n.append(h, el('div', '输入', 'wk-xs wk-muted'), el('pre', e.input), el('div', '结果', 'wk-xs wk-muted'), el('pre', e.result));
    } else {
      h.append(icon(e.role === 'assistant' ? 'robot' : 'info'), el('strong', e.role === 'assistant' ? '模型' : '系统'), el('span', fmt(e.at)));
      n.append(h, el('pre', e.text));
    }
    box.append(n);
  }
  $('transcript-drawer').hidden = false; $('transcript-close').focus();
}
function closeTranscript() { $('transcript-drawer').hidden = true; }

// ---------- 调度状态 ----------
function renderScheduler() {
  const s = data.scheduler, box = $('sched'); box.replaceChildren();
  const line = (ic, k, v, cls) => { const dt = el('dt'); dt.append(icon(ic), el('span', k)); const dd = el('dd', undefined, cls); if (v instanceof Node) dd.append(v); else dd.textContent = v; box.append(dt, dd); };
  if (data.platform !== 'win32') line('info', '平台', '非 Windows：只在 OpenCode 打开时由应用内调度器运行。');
  const holder = el('span'); holder.append(badge(s.holder ? 'ok' : s.lock ? 'skipped' : 'failed')); holder.firstChild.lastChild.textContent = s.holder ? '本窗口负责调度' : s.lock ? '另一个窗口负责' : '未获得调度锁';
  if (!s.holder && s.lock) holder.append(el('span', `  PID ${s.lock.pid}，心跳 ${fmt(s.lock.heartbeatAt)}`, 'wk-muted'));
  line('pulse', '应用内调度', holder);
  line('calendar', 'Windows 计划任务', s.registered ? `「${s.registered.taskName}」下次触发 ${fmt(s.registered.at)}` : '未登记（没有已启用的自动化）');
  if (s.lastEnsureError) line('error', '登记错误', s.lastEnsureError, 'ap-why err');
  line('link-external', '安装路径指针', s.pointer ? `${s.pointer.exe}（${fmt(s.pointer.updatedAt)} 刷新）` : '未写入', 'wk-mono');
  line('folder', '启动器目录', s.launcherDir, 'wk-mono'); line('folder', '数据目录', s.dataDir, 'wk-mono');
}

// ---------- 编辑 ----------
function scheduleFromForm() {
  const kind = scheduleKind, tz = $('s-tz').value.trim() || data.timezone;
  if (kind === 'interval') return { kind: 'interval', everyMinutes: Number($('s-interval').value), timezone: tz };
  if (kind === 'cron') return { kind: 'cron', cron: $('s-cron').value.trim(), timezone: tz };
  const [h, m] = ($('s-time').value || '09:00').split(':').map(Number);
  if (kind === 'weekly') { const days = [...document.querySelectorAll('#s-days-wrap button[aria-pressed=true]')].map(i => i.dataset.day); return { kind: 'cron', cron: `${m} ${h} * * ${days.length ? days.join(',') : '1'}`, timezone: tz }; }
  return { kind: 'cron', cron: `${m} ${h} * * *`, timezone: tz };
}
function setKind(k) {
  scheduleKind = k;
  for (const b of $('s-kind').querySelectorAll('button')) { const on = b.dataset.kind === k; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; }
  $('s-time-wrap').classList.toggle('wk-hidden', !['daily', 'weekly'].includes(k));
  $('s-days-wrap').classList.toggle('wk-hidden', k !== 'weekly');
  $('s-interval-wrap').classList.toggle('wk-hidden', k !== 'interval');
  $('s-cron-wrap').classList.toggle('wk-hidden', k !== 'cron');
  schedulePreview();
}
function renderPreview(v) {
  const box = $('s-preview'); box.replaceChildren(); box.classList.toggle('err', !!v.error);
  const head = el('div', undefined, 'ap-preview-head');
  if (v.error) { head.append(icon('error'), el('span', '计划无效：' + v.error)); box.append(head); return; }
  head.append(icon('calendar'), el('span', v.text), el('span', ' · 接下来 5 次', 'wk-muted wk-xs')); box.append(head);
  if (!v.times.length) { box.append(el('div', '没有后续运行（可能已过结束时间）。', 'wk-muted wk-small')); return; }
  const ol = el('ol');
  v.times.forEach((t, i) => { const p = parseShanghai(t), li = el('li'); li.append(el('span', String(i + 1), 'n'), el('span', p ? `${p.label} 周${DAYS[p.weekday]} ${p.time}` : t), el('span', p ? rel(p.ms) : '', 'rel')); ol.append(li); });
  box.append(ol);
}
function schedulePreview() { clearTimeout(previewTimer); previewTimer = setTimeout(async () => { try { const v = await api('preview', { schedule: scheduleFromForm(), endAt: $('f-end').value ? new Date($('f-end').value).toISOString() : null }); renderPreview(v); } catch (e) { renderPreview({ error: e.message }); } }, 250); }
function loadSchedule(s) {
  const m = /^(\d+) (\d+) \* \* (\*|[0-7](?:,[0-7])*)$/.exec(s?.kind === 'cron' ? s.cron : '');
  $('s-tz').value = s?.timezone || data.timezone;
  for (const b of document.querySelectorAll('#s-days-wrap button')) b.setAttribute('aria-pressed', 'false');
  $('s-cron').value = ''; $('s-interval').value = 60;
  let kind = 'daily';
  if (!s) { $('s-time').value = '09:00'; }
  else if (s.kind === 'interval') { kind = 'interval'; $('s-interval').value = s.everyMinutes; }
  else if (m) { $('s-time').value = `${m[2].padStart(2, '0')}:${m[1].padStart(2, '0')}`; if (m[3] !== '*') { kind = 'weekly'; for (const d of m[3].split(',')) document.querySelector(`#s-days-wrap button[data-day="${Number(d) % 7}"]`)?.setAttribute('aria-pressed', 'true'); } }
  else { kind = 'cron'; $('s-cron').value = s.cron; }
  setKind(kind);
}
function toLocalInput(iso) { if (!iso) return ''; const d = new Date(iso); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}T${p2(d.getHours())}:${p2(d.getMinutes())}`; }
function syncMode() { $('f-project-wrap').classList.toggle('wk-hidden', $('f-mode').value !== 'create_work_item'); }
function setEnabled(on) { $('f-enabled').setAttribute('aria-checked', String(on)); }
function openEditor(a) {
  closeMenu(); closeTranscript();
  editing = a ? a.id : null; editorOpen = true; editorDirty = false;
  $('editor').hidden = false; $('editor-title').textContent = a ? `编辑「${a.name}」` : '新建自动化';
  $('editor-hint').textContent = a ? `revision ${a.revision ?? ''}` : '';
  $('f-name').value = a?.name || ''; $('f-prompt').value = a?.prompt || ''; $('f-folder').value = a?.folder || '';
  $('f-mode').replaceChildren(...Object.entries(data.modes).map(([k, v]) => opt(k, v, (a?.mode || 'create_work_item') === k)));
  $('f-policy').replaceChildren(...Object.entries(data.policies).map(([k, v]) => opt(k, v, (a?.missedPolicy || 'run_latest') === k)));
  $('f-project').replaceChildren(opt('', '「自动化」项目（自动创建）', !a?.projectId), ...data.projects.map(p => opt(p.id, p.name, p.id === a?.projectId)));
  const models = data.models || [];
  $('f-model').replaceChildren(opt('', models.length ? `默认（${models[0].name}）` : '默认（当前没有可用模型）', !a?.model), ...models.map(m => opt(m.vendor + '|' + m.id, `${m.name}（${m.vendor}/${m.id}）`, a?.model?.id === m.id && a?.model?.vendor === m.vendor)));
  if (a?.model && !models.some(m => m.id === a.model.id)) $('f-model').append(opt(a.model.vendor + '|' + a.model.id, `${a.model.name || a.model.id}（当前不可用）`, true));
  $('f-end').value = toLocalInput(a?.endAt); $('f-timeout').value = a?.timeoutMinutes || 20; setEnabled(a ? a.enabled : true);
  loadSchedule(a?.schedule); syncMode();
  $('editor-body').scrollTop = 0; renderList(); $('f-name').focus();
}
function closeEditor(silent = false) {
  if (!editorOpen) return;
  if (editorDirty && !silent) notice('已放弃未保存的修改。');
  editing = null; editorOpen = false; editorDirty = false; $('editor').hidden = true; renderList();
}
function render() {
  if (!data) return;
  renderList(); renderRuns(); renderScheduler();
  if (editorOpen && editing && !data.automations.some(a => a.id === editing)) closeEditor(true);
}

// 星期按钮
const days = $('s-days-wrap');
for (const d of [1, 2, 3, 4, 5, 6, 0]) { const b = el('button', DAYS[d]); b.type = 'button'; b.dataset.day = String(d); b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', '周' + DAYS[d]); b.addEventListener('click', () => { b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); editorDirty = true; schedulePreview(); }); days.append(b); }
for (const b of $('s-kind').querySelectorAll('button')) b.addEventListener('click', () => { editorDirty = true; setKind(b.dataset.kind); });
$('s-kind').addEventListener('keydown', e => {
  const order = ['daily', 'weekly', 'interval', 'cron'], i = order.indexOf(scheduleKind);
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); setKind(order[(i + 1) % 4]); $('s-kind').querySelector('[aria-checked=true]').focus(); editorDirty = true; }
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); setKind(order[(i + 3) % 4]); $('s-kind').querySelector('[aria-checked=true]').focus(); editorDirty = true; }
});
for (const id of ['s-time', 's-interval', 's-cron', 's-tz', 'f-end']) $(id).addEventListener('input', schedulePreview);
for (const id of ['f-name', 'f-prompt', 'f-folder', 'f-mode', 'f-project', 'f-model', 'f-end', 'f-timeout', 'f-policy', 's-time', 's-interval', 's-cron', 's-tz']) $(id).addEventListener('input', () => { editorDirty = true; });
$('f-mode').addEventListener('change', syncMode);
$('f-enabled').addEventListener('click', () => { setEnabled($('f-enabled').getAttribute('aria-checked') !== 'true'); editorDirty = true; });
$('new-automation').addEventListener('click', () => openEditor(null));
$('cancel').addEventListener('click', () => closeEditor());
$('editor-close').addEventListener('click', () => closeEditor());
$('transcript-close').addEventListener('click', closeTranscript);
$('f-pick').addEventListener('click', async () => { const p = await act('pickFolder', { title: '选择自动化的目标工作区' }, $('f-pick'), null); if (p) { $('f-folder').value = p; editorDirty = true; } });
$('save').addEventListener('click', async () => {
  const cur = editing ? data.automations.find(a => a.id === editing) : null;
  const mv = $('f-model').value; const [vendor, ...rest] = mv ? mv.split('|') : [];
  const model = mv ? { vendor, id: rest.join('|'), name: (data.models.find(m => m.vendor === vendor && m.id === rest.join('|'))?.name) || rest.join('|') } : null;
  const input = { id: editing || undefined, expected_revision: cur?.revision, name: $('f-name').value, prompt: $('f-prompt').value, folder: $('f-folder').value.trim(), mode: $('f-mode').value, projectId: $('f-project').value || null, model, schedule: scheduleFromForm(), endAt: $('f-end').value ? new Date($('f-end').value).toISOString() : null, missedPolicy: $('f-policy').value, timeoutMinutes: Number($('f-timeout').value), enabled: $('f-enabled').getAttribute('aria-checked') === 'true' };
  const saved = await act('save', input, $('save'), '已保存；后台计划任务已同步。');
  if (saved) closeEditor(true);
});
$('search').addEventListener('input', renderList);
$('runs-filter').addEventListener('change', e => { runsFilter = e.target.value; renderRuns(); });
$('runs-status').addEventListener('change', e => { runsStatus = e.target.value; renderRuns(); });
$('refresh').addEventListener('click', () => act('refresh', {}, $('refresh'), '已刷新'));
$('reregister').addEventListener('click', async () => { const r = await act('reregister', {}, $('reregister'), null); notice(r ? (r.action === 'registered' ? (r.registered ? '已重新登记计划任务。' : '登记失败：' + (r.detail || r.reason)) : r.action === 'removed' || r.action === 'none' ? '没有已启用的自动化，计划任务已删除 / 无需登记。' : '计划任务无需变化。') : '当前平台不使用 Windows 计划任务。'); });
document.addEventListener('keydown', e => {
  if (e.defaultPrevented) return;
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '');
  if (e.key === '/' && !typing) { e.preventDefault(); setTab('list'); $('search').focus(); return; }
  if (e.key === 'Escape') {
    if (menu) { closeMenu(true); return; }
    if (!$('transcript-drawer').hidden) { closeTranscript(); return; }
    if (editorOpen) { if (editorDirty && Date.now() - escArmed > 2000) { escArmed = Date.now(); notice('有未保存的修改，再按一次 Esc 放弃并关闭。'); return; } closeEditor(); }
  }
  if (e.key === 's' && (e.ctrlKey || e.metaKey) && editorOpen) { e.preventDefault(); $('save').click(); }
});
window.addEventListener('message', event => {
  const m = event.data; if (!m || typeof m !== 'object') return;
  if (m.type === 'state') { data = m.value; render(); }
  else if (m.type === 'error') notice(m.message, true);
  else if (m.type === 'result') { const r = pending.get(m.id); if (!r) return; pending.delete(m.id); if (m.error) r.reject(Object.assign(new Error(m.error), { code: m.code })); else r.resolve(m.value); }
});
setTab(tab);
vscode.postMessage({ type: 'ready' });
})();
