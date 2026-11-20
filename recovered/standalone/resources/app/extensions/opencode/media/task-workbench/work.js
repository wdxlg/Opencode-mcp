(() => {
'use strict';
// 「工作」看板 webview。只通过 postMessage 与扩展通信（协议不变：ready / action{id,action,input} ← state / result / error）；所有写入都带 expected_revision。
const vscode = acquireVsCodeApi(), $ = id => document.getElementById(id), pending = new Map();
let sequence = 0, revealSelected = false, data = null, selectedId = null, creating = false, createStatus = 'todo', drawer = null, editingProject = null, draftDirty = false, feedbackTimer = 0, escArmed = 0;
const saved = vscode.getState() || {};
let projectFilter = saved.projectFilter || '', assigneeFilter = saved.assigneeFilter || '', showClosed = !!saved.showClosed;
const STATUS_ORDER = ['backlog', 'todo', 'in_progress', 'in_review', 'blocked', 'done', 'cancelled'];
const STATUS_ICON = { backlog: 'circle-large-outline', todo: 'record', in_progress: 'play-circle', in_review: 'eye', blocked: 'warning', done: 'pass-filled', cancelled: 'circle-slash' };
const CREATE_STATUSES = ['backlog', 'todo', 'in_progress'];
const PRIORITY = { none: '无', low: '低', medium: '中', high: '高', urgent: '紧急' };
const PRIORITY_RANK = ['urgent', 'high', 'medium', 'low', 'none'];
const KIND = { user: '用户', session: '对话', agent: 'Bridge 代理', automation: '自动化' };
const KIND_ICON = { user: 'person', session: 'comment-discussion', agent: 'robot', automation: 'history' };

// ---------- 通用 ----------
function notice(text, error = false) {
  const box = $('feedback'); clearTimeout(feedbackTimer); box.replaceChildren(); box.classList.toggle('error', !!error);
  if (!text) return;
  box.append(icon(error ? 'error' : 'info'), el('span', text));
  if (!error) feedbackTimer = setTimeout(() => box.replaceChildren(), 4000);
}
function api(action, input = {}) { return new Promise((resolve, reject) => { const id = 'work_' + (++sequence); pending.set(id, { resolve, reject }); vscode.postMessage({ type: 'action', id, action, input }); }); }
async function act(action, input, button, ok = '已保存') { if (button) button.disabled = true; try { const v = await api(action, input); if (ok) notice(ok); return v; } catch (e) { notice(e.message, true); throw e; } finally { if (button) button.disabled = false; } }
function el(tag, text, className) { const n = document.createElement(tag); if (text !== undefined && text !== null) n.textContent = text; if (className) n.className = className; return n; }
function icon(name, extra = '') { const i = el('span', undefined, `codicon codicon-${name}${extra ? ' ' + extra : ''}`); i.setAttribute('aria-hidden', 'true'); return i; }
function opt(value, text, selected) { const o = el('option', text); o.value = value; if (selected) o.selected = true; return o; }
function button(label, { cls = 'wk-btn', ic, title, onClick } = {}) { const b = el('button', undefined, cls); b.type = 'button'; if (ic) b.append(icon(ic)); if (label) b.append(document.createTextNode(label)); if (title) { b.title = title; if (!label) { b.setAttribute('aria-label', title); b.dataset.label = title; } } if (onClick) b.addEventListener('click', onClick); return b; }
function iconButton(ic, title, onClick, cls = 'wk-icon-btn') { return button('', { cls, ic, title, onClick }); }
const fmt = iso => { if (!iso) return ''; const d = new Date(iso); return isNaN(d) ? iso : d.toLocaleString('zh-CN', { hour12: false }); };
function rel(iso) {
  if (!iso) return ''; const t = Date.parse(iso); if (isNaN(t)) return iso;
  const now = Date.now(), diff = now - t, min = 60000, hour = 60 * min, day = 24 * hour, d = new Date(t), p = n => String(n).padStart(2, '0');
  if (diff < 0) return fmt(iso);
  if (diff < min) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / min)} 分钟前`;
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  if (t >= today.getTime()) return `${Math.floor(diff / hour)} 小时前`;
  if (t >= today.getTime() - day) return `昨天 ${p(d.getHours())}:${p(d.getMinutes())}`;
  if (diff < 7 * day) return `${Math.ceil((today.getTime() - t) / day)} 天前`;
  return d.getFullYear() === today.getFullYear() ? `${d.getMonth() + 1}月${d.getDate()}日` : `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}
function timeEl(iso, cls = 'wk-time') { const t = el('time', rel(iso), cls); if (iso) { t.dateTime = iso; t.title = fmt(iso); } return t; }
const statusName = id => data?.statuses.find(s => s.id === id)?.name || id;
const projectName = id => data?.projects.find(p => p.id === id)?.name || '无项目';
function persist() { vscode.setState({ projectFilter, assigneeFilter, showClosed }); }
const shortName = name => String(name || '').replace(/^(对话|Bridge 代理|自动化)\s*·\s*/, '').replace(/（用户）$/, '');
function avatar(who) { const kind = who?.kind || 'none'; const a = el('span', who ? (shortName(who.name).trim()[0] || '?') : '', 'wk-avatar ' + kind); a.setAttribute('aria-hidden', 'true'); return a; }
function assigneeChip(a) {
  const c = el('span', undefined, 'wk-chip' + (a ? '' : ' muted'));
  if (a) { c.append(avatar(a), el('span', shortName(a.name), 'wk-ellipsis')); c.title = `负责人：${a.name}（${KIND[a.kind] || a.kind}）`; }
  else { c.append(icon('person'), el('span', '未指派')); c.title = '未指派'; }
  return c;
}
function parseDiffStat(s) {
  const m = /(\d+) files? changed(?:, (\d+) insertions?\(\+\))?(?:, (\d+) deletions?\(-\))?/.exec(s || '');
  return m ? { files: +m[1], add: +(m[2] || 0), del: +(m[3] || 0) } : null;
}
function diffStatEl(s) {
  const d = parseDiffStat(s), box = el('div', undefined, 'wk-diffstat');
  if (!d) { box.append(el('span', s, 'wk-muted')); return box; }
  box.append(icon('diff'), el('span', `${d.files} 个文件`), el('span', `+${d.add}`, 'add'), el('span', `−${d.del}`, 'del'));
  const bar = el('span', undefined, 'wk-diffbar'), total = d.add + d.del, a = total ? Math.round(5 * d.add / total) : 0, r = total ? Math.min(5 - a, Math.round(5 * d.del / total)) : 0;
  for (let i = 0; i < 5; i++) bar.append(el('i', undefined, i < a ? 'a' : i < a + r ? 'd' : ''));
  bar.setAttribute('aria-hidden', 'true'); box.append(bar); box.title = s;
  return box;
}

// ---------- 筛选 ----------
function renderFilters() {
  $('project-filter').replaceChildren(opt('', '全部项目', !projectFilter), ...data.projects.map(p => opt(p.id, p.name, p.id === projectFilter)), opt('__none', '无项目', projectFilter === '__none'));
  const seen = new Map();
  for (const a of data.assignees) seen.set(a.kind + '|' + a.id, a);
  for (const i of data.items) if (i.assignee) { const k = i.assignee.kind + '|' + i.assignee.id; if (!seen.has(k)) seen.set(k, i.assignee); }
  const others = [...seen.entries()].filter(([k]) => k !== 'user|user');
  if (assigneeFilter && !['__me', '__none'].includes(assigneeFilter) && !seen.has(assigneeFilter)) assigneeFilter = '';
  $('assignee-filter').replaceChildren(opt('', '全部负责人', !assigneeFilter), opt('__me', '我', assigneeFilter === '__me'), opt('__none', '未指派', assigneeFilter === '__none'), ...others.map(([k, a]) => opt(k, shortName(a.name), k === assigneeFilter)));
  $('show-closed').setAttribute('aria-pressed', String(showClosed));
}
function visibleItems() {
  const q = $('search').value.trim().toLowerCase();
  return data.items.filter(i => (!projectFilter || (projectFilter === '__none' ? !i.projectId : i.projectId === projectFilter))
    && (showClosed || !['done', 'cancelled'].includes(i.status))
    && (!assigneeFilter || (assigneeFilter === '__none' ? !i.assignee : assigneeFilter === '__me' ? i.assignee?.kind === 'user' : i.assignee && (i.assignee.kind + '|' + i.assignee.id) === assigneeFilter))
    && (!q || (i.title + '\n' + i.description + '\n#' + i.number).toLowerCase().includes(q)));
}

// ---------- 看板 ----------
function card(item) {
  const c = el('button', undefined, 'wk-card'); c.type = 'button'; c.dataset.id = item.id;
  if (item.id === selectedId && drawer === 'item') c.setAttribute('aria-current', 'true');
  c.setAttribute('aria-label', `#${item.number} ${item.title}，${statusName(item.status)}，优先级${PRIORITY[item.priority]}`);
  const top = el('div', undefined, 'wk-card-top');
  const dot = el('span', undefined, 'wk-dot ' + item.priority); dot.title = '优先级：' + PRIORITY[item.priority]; top.append(dot);
  top.append(el('span', '#' + item.number, 'wk-num'));
  if (item.priority === 'urgent' || item.priority === 'high') top.append(el('span', PRIORITY[item.priority]));
  top.append(timeEl(item.updatedAt));
  c.append(top, el('div', item.title, 'wk-card-title'));
  const meta = el('div', undefined, 'wk-card-meta');
  meta.append(assigneeChip(item.assignee));
  if (!projectFilter && item.projectId) { const p = el('span', undefined, 'wk-chip'); p.append(icon('folder'), el('span', projectName(item.projectId), 'wk-ellipsis')); p.title = '项目：' + projectName(item.projectId); meta.append(p); }
  if (item.taskId) { const t = el('span', undefined, 'wk-chip muted'); t.append(icon('tasklist')); t.title = '关联任务卡：' + item.taskId; t.setAttribute('aria-label', '有关联任务卡'); meta.append(t); }
  if (item.comments?.length) { const n = el('span', undefined, 'wk-chip muted'); n.append(icon('comment'), el('span', String(item.comments.length))); n.title = item.comments.length + ' 条评论'; meta.append(n); }
  c.append(meta);
  if (item.status === 'blocked' && item.blockedReason) { const b = el('div', undefined, 'wk-blocked'); b.append(icon('warning'), el('span', item.blockedReason)); c.append(b); }
  c.addEventListener('click', () => openItem(item.id));
  return c;
}
function renderBoard() {
  const items = visibleItems(), board = $('board'), scroll = board.scrollLeft, colScroll = new Map([...board.querySelectorAll('.wk-col')].map(c => [c.dataset.status, c.querySelector('.wk-col-body')?.scrollTop || 0]));
  board.replaceChildren();
  const open = data.items.filter(i => !['done', 'cancelled'].includes(i.status)).length;
  $('summary').textContent = `${open} 项进行中的工作${items.length !== data.items.length ? ` · 显示 ${items.length} 项` : ''}`;
  for (const status of STATUS_ORDER) {
    if (!showClosed && ['done', 'cancelled'].includes(status)) continue;
    const list = items.filter(i => i.status === status).sort((a, b) => PRIORITY_RANK.indexOf(a.priority) - PRIORITY_RANK.indexOf(b.priority) || b.updatedAt.localeCompare(a.updatedAt));
    const col = el('section', undefined, 'wk-col s-' + status); col.dataset.status = status; col.setAttribute('aria-label', `${statusName(status)}，${list.length} 项`);
    const head = el('header', undefined, 'wk-col-head'), h = el('h2');
    h.append(icon(STATUS_ICON[status] || 'circle-large-outline'), el('span', statusName(status), 'wk-ellipsis'), el('span', String(list.length), 'wk-count'));
    head.append(h);
    if (CREATE_STATUSES.includes(status)) head.append(iconButton('add', `在「${statusName(status)}」中新建`, () => startCreate(status), 'wk-icon-btn sm'));
    const body = el('div', undefined, 'wk-col-body'); body.setAttribute('role', 'list');
    for (const item of list) { const li = el('div'); li.setAttribute('role', 'listitem'); li.append(card(item)); body.append(li); }
    if (!list.length) body.append(el('div', status === 'in_review' ? '代理交付后出现在这里' : status === 'blocked' ? '没有受阻的工作' : '暂无工作项', 'wk-col-empty'));
    col.append(head, body); board.append(col);
    body.scrollTop = colScroll.get(status) || 0;
  }
  if (!data.items.length) {
    board.replaceChildren();
    const e = el('div', undefined, 'wk-empty wk-flex1');
    e.append(icon('checklist'), el('strong', '还没有工作项'), el('span', '新建一个工作项，或让对话里的代理用 work_create 创建。'), button('新建工作项', { cls: 'wk-btn primary', ic: 'add', onClick: () => startCreate('todo') }));
    board.append(e);
  }
  board.scrollLeft = scroll;
}

// ---------- 抽屉 ----------
function confirmDiscard() { if (draftDirty) notice('已放弃未保存的修改。'); draftDirty = false; }
function openItem(id) { if (id !== selectedId || drawer !== 'item') confirmDiscard(); selectedId = id; creating = false; drawer = 'item'; revealSelected = true; render(true); }
function startCreate(status = 'todo') { confirmDiscard(); creating = true; createStatus = status; selectedId = null; drawer = 'item'; render(true); $('d-title')?.focus(); }
function closeDrawer() { confirmDiscard(); const id = selectedId; drawer = null; creating = false; render(true); if (id) document.querySelector(`.wk-card[data-id="${CSS.escape(id)}"]`)?.focus(); }
function drawerHead(titleNodes, actions = []) {
  const head = el('header', undefined, 'wk-drawer-head'), g = el('div', undefined, 'wk-grow'); g.append(...titleNodes);
  head.append(g, ...actions, iconButton('close', '关闭（Esc）', closeDrawer)); return head;
}
function field(label, control, hint) { const w = el('div', undefined, 'wk-field'), l = el('label', label); if (control.id) l.htmlFor = control.id; w.append(l, control); if (hint) w.append(el('div', hint, 'wk-field-hint')); return w; }
function prop(grid, label, control) { const l = el('label', label); if (control.id) l.htmlFor = control.id; grid.append(l, control); return [l, control]; }
function assigneeSelect(current) {
  const s = el('select', undefined, 'wk-select'); s.id = 'd-assignee';
  s.append(opt('', '未指派', !current));
  let found = false;
  for (const a of data.assignees) { const v = a.kind + '|' + a.id; const sel = !!current && current.kind === a.kind && current.id === a.id; if (sel) found = true; s.append(opt(v, `${a.name}`, sel)); }
  if (current && !found) s.append(opt(current.kind + '|' + current.id, `${current.name}（${KIND[current.kind] || current.kind}）`, true));
  return s;
}
function readAssignee(select) { if (!select.value) return null; const [kind, ...rest] = select.value.split('|'); const id = rest.join('|'); const hit = data.assignees.find(a => a.kind === kind && a.id === id) || (data.items.find(i => i.id === selectedId)?.assignee); return { kind, id, name: hit?.name || id }; }
function section(title, ...children) { const s = el('section', undefined, 'wk-section'); const h = el('h3', undefined, 'wk-section-title'); if (Array.isArray(title)) h.append(...title); else h.textContent = title; s.append(h, ...children); return s; }

function renderItemDrawer(box) {
  const item = creating ? null : data.items.find(i => i.id === selectedId);
  if (!creating && !item) { drawer = null; box.hidden = true; return; }
  const markDirty = () => { draftDirty = true; const d = $('d-dirty'); if (d) d.textContent = '有未保存的修改'; };
  // head
  const titleNodes = [];
  if (creating) titleNodes.push(el('h2', '新建工作项'));
  else { const chip = el('span', undefined, 'wk-status-chip s-' + item.status); chip.append(icon(STATUS_ICON[item.status]), el('span', statusName(item.status))); titleNodes.push(el('span', '#' + item.number, 'wk-muted'), chip); }
  const headActions = [];
  if (!creating) headActions.push(iconButton('trash', '删除工作项', async e => { const r = await act('deleteItem', { id: item.id }, e.currentTarget, null); if (r) { selectedId = null; drawer = null; draftDirty = false; notice('已删除'); render(true); } }));
  box.append(drawerHead(titleNodes, headActions));
  // body
  const body = el('div', undefined, 'wk-drawer-body'); body.id = 'd-body';
  const title = el('input', undefined, 'wk-title-input'); title.id = 'd-title'; title.maxLength = 300; title.value = item?.title || ''; title.placeholder = '工作项标题'; title.setAttribute('aria-label', '标题');
  const props = el('div', undefined, 'wk-props');
  const status = el('select', undefined, 'wk-select'); status.id = 'd-status';
  for (const s of data.statuses) if (!creating || CREATE_STATUSES.includes(s.id)) status.append(opt(s.id, s.name, (item?.status || createStatus) === s.id));
  const blocked = el('input', undefined, 'wk-input'); blocked.id = 'd-blocked'; blocked.placeholder = '选择「受阻」时必填'; blocked.value = item?.blockedReason || '';
  const priority = el('select', undefined, 'wk-select'); priority.id = 'd-priority'; for (const p of data.priorities) priority.append(opt(p, PRIORITY[p], (item?.priority || 'none') === p));
  const assignee = assigneeSelect(item?.assignee);
  const project = el('select', undefined, 'wk-select'); project.id = 'd-project'; project.append(opt('', '无项目', !(item?.projectId || (creating && projectFilter && projectFilter !== '__none'))), ...data.projects.map(p => opt(p.id, p.name, item ? p.id === item.projectId : p.id === projectFilter)));
  prop(props, '状态', status);
  const blockedRow = prop(props, '受阻原因', blocked);
  prop(props, '优先级', priority); prop(props, '负责人', assignee); prop(props, '项目', project);
  const syncBlocked = () => { for (const n of blockedRow) n.classList.toggle('wk-hidden', status.value !== 'blocked'); }; syncBlocked();
  status.addEventListener('change', syncBlocked);
  const desc = el('textarea', undefined, 'wk-textarea'); desc.id = 'd-desc'; desc.value = item?.description || ''; desc.placeholder = '目标、背景、验收标准'; desc.rows = 6;
  for (const c of [title, desc, project, status, priority, assignee, blocked]) { c.addEventListener('input', markDirty); c.addEventListener('change', markDirty); }
  body.append(title, props, field('描述', desc));
  if (!creating) {
    if (item.delivery) {
      const d = el('div', undefined, 'wk-delivery');
      const who = el('div', undefined, 'wk-row wk-small'); who.append(icon('git-pull-request'), el('strong', item.delivery.by), el('span', '交付于', 'wk-muted'), timeEl(item.delivery.at, 'wk-muted'));
      d.append(who);
      if (item.delivery.summary) d.append(el('div', item.delivery.summary, 'wk-delivery-text'));
      if (item.delivery.diffStat) d.append(diffStatEl(item.delivery.diffStat));
      body.append(section('交付摘要', d));
    }
    const facts = el('dl', undefined, 'wk-facts');
    const fact = (k, v) => { const dd = el('dd'); if (v instanceof Node) dd.append(v); else dd.textContent = v; facts.append(el('dt', k), dd); };
    const created = el('span'); created.append(timeEl(item.createdAt, ''), document.createTextNode(item.createdBy?.name ? ` · ${item.createdBy.name}` : '')); fact('创建', created);
    fact('更新', timeEl(item.updatedAt, ''));
    if (item.taskId) fact('任务卡', el('code', item.taskId));
    if (item.folder) fact('文件夹', el('span', item.folder, 'wk-mono'));
    if (item.git?.baseline) { const g = el('div'); g.append(el('code', item.git.baseline.slice(0, 12))); if (item.git.diffStat && !item.delivery?.diffStat) g.append(diffStatEl(item.git.diffStat)); fact('Git 基线', g); }
    fact('版本', 'revision ' + item.revision);
    const det = el('details', undefined, 'wk-collapse'); const sum = el('summary', undefined, 'wk-section-title'); sum.append(icon('chevron-right'), el('span', '详细信息')); det.append(sum, facts);
    const detSection = el('section', undefined, 'wk-section'); detSection.append(det); body.append(detSection);
    // comments
    const list = el('div', undefined, 'wk-comments');
    for (const c of item.comments) {
      const n = el('article', undefined, 'wk-comment' + (c.kind === 'delivery' ? ' delivery' : ''));
      const head = el('div', undefined, 'wk-comment-head'); head.append(el('strong', c.author)); if (c.kind === 'delivery') head.append(el('span', '交付摘要', 'wk-badge running')); head.append(timeEl(c.at, 'wk-muted'));
      n.append(avatar({ kind: c.authorKind || 'none', name: c.author }), head, el('div', c.body, 'wk-comment-body')); list.append(n);
    }
    if (!item.comments.length) list.append(el('div', '还没有评论。代理的进展与交付也会出现在这里。', 'wk-muted wk-small'));
    const composer = el('div', undefined, 'wk-composer');
    const comment = el('textarea', undefined, 'wk-textarea'); comment.placeholder = '写评论（不会改变状态）。Ctrl+Enter 发表'; comment.id = 'd-comment'; comment.setAttribute('aria-label', '评论');
    const send = button('发表评论', { ic: 'comment' });
    const post = async () => { if (!comment.value.trim()) return; await act('updateItem', { id: item.id, patch: { expected_revision: item.revision, comment: comment.value } }, send, '已发表'); comment.value = ''; };
    send.addEventListener('click', post);
    comment.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); post(); } });
    const row = el('div', undefined, 'wk-row'); row.append(send); composer.append(comment, row);
    body.append(section([icon('comment-discussion'), el('span', `评论 · ${item.comments.length}`)], list, composer));
    // activity
    const ul = el('ol', undefined, 'wk-timeline');
    for (const a of item.activity.slice().reverse()) { const li = el('li'); li.append(el('b', a.actor), document.createTextNode(` ${a.action}${a.detail ? '：' + a.detail : ''} · `), timeEl(a.at, '')); ul.append(li); }
    if (!item.activity.length) ul.append(el('li', '暂无活动'));
    body.append(section([icon('history'), el('span', `活动 · ${item.activity.length}`)], ul));
  }
  box.append(body);
  // foot
  const foot = el('footer', undefined, 'wk-drawer-foot');
  const save = button(creating ? '创建' : '保存修改', { cls: 'wk-btn primary', ic: creating ? 'add' : 'check' });
  save.addEventListener('click', async () => {
    const input = { title: title.value, description: desc.value, projectId: project.value || null, status: status.value, priority: priority.value, assignee: readAssignee(assignee), blockedReason: blocked.value };
    if (creating) { const created = await act('createItem', input, save, '已创建'); selectedId = created.id; creating = false; draftDirty = false; return; }
    const patch = { expected_revision: item.revision };
    if (input.title !== item.title) patch.title = input.title;
    if (input.description !== item.description) patch.description = input.description;
    if ((input.projectId || null) !== (item.projectId || null)) patch.projectId = input.projectId;
    if (input.priority !== item.priority) patch.priority = input.priority;
    if (JSON.stringify(input.assignee) !== JSON.stringify(item.assignee)) patch.assignee = input.assignee;
    if (input.status !== item.status) { patch.status = input.status; if (input.status === 'blocked') patch.blockedReason = input.blockedReason; }
    else if (item.status === 'blocked' && input.blockedReason !== item.blockedReason) patch.blockedReason = input.blockedReason;
    try { await act('updateItem', { id: item.id, patch }, save); draftDirty = false; } catch (e) { if (/revision|已被修改/.test(e.message)) { notice('这个工作项刚被其他人（或代理）修改过，已刷新为最新内容；请重新编辑。', true); draftDirty = false; } }
  });
  foot.append(save);
  if (creating) foot.append(button('取消', { onClick: closeDrawer }));
  else if (!['done', 'cancelled'].includes(item.status)) { const done = button('标记完成', { ic: 'pass', title: '只有你能把工作项标记为已完成' }); done.addEventListener('click', async () => { await act('markDone', { id: item.id, expected_revision: item.revision }, done, '已标记完成'); draftDirty = false; }); foot.append(done); }
  const dirty = el('span', draftDirty ? '有未保存的修改' : creating ? '' : '', 'wk-dirty'); dirty.id = 'd-dirty'; foot.append(dirty);
  box.append(foot);
}
function renderProjectsDrawer(box) {
  box.append(drawerHead([el('h2', '项目')]));
  const body = el('div', undefined, 'wk-drawer-body');
  const list = el('div', undefined, 'wk-list'); list.id = 'project-list';
  for (const p of data.projects) {
    const b = el('button', undefined, 'wk-list-item'); b.type = 'button'; if (editingProject === p.id) b.setAttribute('aria-current', 'true');
    const g = el('span', undefined, 'wk-grow'); g.append(el('span', p.name, 'wk-ellipsis'), el('span', p.folder || '未设置文件夹', 'wk-xs wk-muted wk-ellipsis'));
    const count = data.items.filter(i => i.projectId === p.id && !['done', 'cancelled'].includes(i.status)).length;
    b.append(icon('folder'), g, el('span', String(count), 'wk-count')); b.title = `${p.name}${p.folder ? '\n' + p.folder : ''}\n${count} 项未结束的工作`;
    b.addEventListener('click', () => { editingProject = p.id; render(true); $('project-name')?.focus(); });
    list.append(b);
  }
  if (!data.projects.length) list.replaceChildren(el('div', '还没有项目。', 'wk-empty'));
  const cur = data.projects.find(p => p.id === editingProject);
  const name = el('input', undefined, 'wk-input'); name.id = 'project-name'; name.placeholder = '项目名称'; name.value = cur?.name || '';
  const folder = el('input', undefined, 'wk-input wk-grow'); folder.id = 'project-folder'; folder.placeholder = '绝对路径（可选）'; folder.value = cur?.folder || '';
  const pick = button('选择…', { ic: 'folder-opened' }); pick.id = 'pick-project-folder';
  pick.addEventListener('click', async () => { const p = await act('pickFolder', { title: '选择项目文件夹' }, pick, null); if (p) folder.value = p; });
  const folderRow = el('div', undefined, 'wk-row'); folderRow.append(folder, pick);
  const fl = el('div', undefined, 'wk-field'); const fll = el('label', '项目文件夹'); fll.htmlFor = 'project-folder'; fl.append(fll, folderRow, el('div', '用于记录 Git 基线：工作项进入「进行中」时记下 HEAD，交付「待验收」时附上 git diff --shortstat。', 'wk-field-hint'));
  const actions = el('div', undefined, 'wk-row');
  const saveP = button(cur ? '保存项目' : '创建项目', { cls: 'wk-btn primary', ic: 'check' }); saveP.id = 'save-project';
  saveP.addEventListener('click', async () => { const r = await act('saveProject', { id: editingProject || undefined, name: name.value, folder: folder.value }, saveP); if (r?.id) editingProject = r.id; });
  const clear = button('新建', { ic: 'add' }); clear.id = 'clear-project'; clear.title = '清空表单，新建项目';
  clear.addEventListener('click', () => { editingProject = null; render(true); $('project-name')?.focus(); });
  const del = button('删除项目', { cls: 'wk-btn danger', ic: 'trash' }); del.id = 'delete-project'; del.disabled = !editingProject;
  del.addEventListener('click', async () => { if (!editingProject) return; const r = await act('deleteProject', { id: editingProject }, del, null); if (r) { notice('已删除项目'); editingProject = null; } });
  actions.append(saveP, clear, el('span', undefined, 'wk-spacer'), del);
  const form = section(cur ? `编辑「${cur.name}」` : '新建项目', field('名称', name), fl, actions);
  const storage = el('code', data.file, 'wk-wrap-any'); storage.id = 'storage-file';
  body.append(section([icon('folder'), el('span', `全部项目 · ${data.projects.length}`)], list), form,
    section([icon('server-process'), el('span', '数据位置')], storage, el('div', '与规则、记忆相同的共享存储目录，跨版本保留，不在安装目录里。', 'wk-field-hint')));
  box.append(body);
}
function renderDrawer(force) {
  const box = $('detail');
  if (!drawer) { box.hidden = true; box.replaceChildren(); return; }
  if (draftDirty && !force && drawer === 'item') return;
  const prevScroll = $('d-body')?.scrollTop || box.querySelector('.wk-drawer-body')?.scrollTop || 0;
  const keep = {}; for (const id of ['d-comment', 'project-name', 'project-folder']) { const n = $(id); if (n && n.value && !force) keep[id] = n.value; }
  const focusId = document.activeElement?.id;
  box.hidden = false; box.replaceChildren();
  box.setAttribute('aria-label', drawer === 'projects' ? '项目' : creating ? '新建工作项' : '工作项详情');
  if (drawer === 'projects') renderProjectsDrawer(box); else renderItemDrawer(box);
  for (const [id, v] of Object.entries(keep)) { const n = $(id); if (n) n.value = v; }
  const b = box.querySelector('.wk-drawer-body'); if (b && !force) b.scrollTop = prevScroll;
  if (focusId && !force) $(focusId)?.focus();
}
function render(force = false) {
  if (!data) return;
  if (projectFilter && projectFilter !== '__none' && !data.projects.some(p => p.id === projectFilter)) projectFilter = '';
  if (editingProject && !data.projects.some(p => p.id === editingProject)) editingProject = null;
  renderFilters(); renderBoard(); renderDrawer(force);
  if (revealSelected) { revealSelected = false; $('board').querySelector('.wk-card[aria-current=true]')?.closest('.wk-col')?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
}

// ---------- 事件 ----------
$('project-filter').addEventListener('change', e => { projectFilter = e.target.value; persist(); renderBoard(); });
$('assignee-filter').addEventListener('change', e => { assigneeFilter = e.target.value; persist(); renderBoard(); });
$('search').addEventListener('input', renderBoard);
$('show-closed').addEventListener('click', () => { showClosed = !showClosed; persist(); renderFilters(); renderBoard(); });
$('refresh').addEventListener('click', () => act('refresh', {}, $('refresh'), '已刷新'));
$('new-item').addEventListener('click', () => startCreate('todo'));
$('new-project').addEventListener('click', () => { if (drawer === 'projects') { closeDrawer(); return; } confirmDiscard(); drawer = 'projects'; creating = false; render(true); $('project-name')?.focus(); });
document.addEventListener('keydown', e => {
  const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '');
  if (e.key === '/' && !typing) { e.preventDefault(); $('search').focus(); return; }
  if (e.key === 'Escape') {
    if (document.activeElement === $('search') && $('search').value) { $('search').value = ''; renderBoard(); return; }
    if (!drawer) return;
    if (draftDirty && Date.now() - escArmed > 2000) { escArmed = Date.now(); notice('有未保存的修改，再按一次 Esc 放弃并关闭。'); return; }
    closeDrawer();
  }
});
window.addEventListener('message', event => {
  const m = event.data; if (!m || typeof m !== 'object') return;
  if (m.type === 'state') { data = m.value; render(); }
  else if (m.type === 'error') notice(m.message, true);
  else if (m.type === 'result') { const r = pending.get(m.id); if (!r) return; pending.delete(m.id); if (m.error) r.reject(Object.assign(new Error(m.error), { code: m.code })); else r.resolve(m.value); }
});
vscode.postMessage({ type: 'ready' });
})();
