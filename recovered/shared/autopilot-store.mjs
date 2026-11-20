// 自动化（Automations）：定时让 OpenCode 执行一段提示词，可选地为每次运行建一个「工作」工作项。
// 设计借鉴 Multica autopilot（cron + create_issue / run_only 模式、运行历史、连续失败自动暂停），代码自行实现。
//
// 关闭 OpenCode 时也能跑，但不常驻：
//   - 没有守护进程。只在存在 ≥1 个已启用的自动化时，为当前用户登记一个 Windows 计划任务（一次性触发器，
//     触发时间 = 最近一次到期时间；每次运行/修改后重新登记；没有已启用的自动化时删除该任务）。
//   - 计划任务启动 %LOCALAPPDATA%\OpenCode\automation-launcher 下的小启动器（vbs → 隐藏的 PowerShell），它读取
//     pointer.json（安装路径，OpenCode 每次启动时刷新）：OpenCode 已在运行 → 退出，交给应用内调度器；
//     安装目录不存在 → 记录「skipped: install_moved」并退出；否则以 OPENCODE_AUTOMATION_RUN=1 启动 OpenCode，
//     由扩展执行到期运行后自行退出。启动器自身几秒内退出，不占用安装目录。
//   - 应用内调度器与启动器共用：调度锁（同一时刻只有一个 OpenCode 窗口调度）+ 每次运行的幂等键
//     （automationId@plannedAt，独占创建 claim 文件），保证一次计划运行不会执行两次。
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { sharedAutomationRoot, writeJsonAtomic, readJson, withFileLock } from './work-store.mjs';

export const DEFAULT_TIMEZONE = 'Asia/Shanghai';
export const MISSED_POLICIES = { run_latest: '补跑最近一次，更早的记为跳过', skip_missed: '错过的全部跳过' };
export const RUN_MODES = { create_work_item: '每次运行建一个工作项', run_only: '只运行，不建工作项' };
const MINUTE = 60000, HOUR = 60 * MINUTE, DAY = 24 * HOUR;
const LOCK_STALE_MS = 3 * MINUTE;

export class AutopilotError extends Error { constructor(code, message, details) { super(`${code}: ${message}`); this.reason = message; this.code = code; if (details) this.details = details; } }
const fail = (code, message, details) => { throw new AutopilotError(code, message, details); };
const nowIso = (ms = Date.now()) => new Date(ms).toISOString();
const newId = prefix => `${prefix}_${Date.now().toString(36)}${crypto.randomBytes(4).toString('hex')}`;
const text = (value, max) => { if (value === undefined || value === null) return ''; const s = String(value).replace(/\r\n/g, '\n').trim(); return s.length > max ? s.slice(0, max) : s; };

// ======================= cron in an IANA timezone =======================
const FIELD_RANGES = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 6]];
const SHORTHANDS = { '@hourly': '0 * * * *', '@daily': '0 0 * * *', '@midnight': '0 0 * * *', '@weekly': '0 0 * * 0', '@monthly': '0 0 1 * *', '@yearly': '0 0 1 1 *', '@annually': '0 0 1 1 *' };
function parseField(expr, [lo, hi], index) {
  const set = new Set();
  const top = index === 4 ? 7 : hi;
  for (const part of String(expr).split(',')) {
    const [range, stepText] = part.split('/');
    const step = stepText === undefined ? 1 : Number(stepText);
    let a, b;
    if (range === '*') [a, b] = [lo, hi];
    else { [a, b] = range.split('-').map(Number); if (b === undefined) b = stepText !== undefined ? top : a; }
    if (![a, b, step].every(Number.isInteger) || a < lo || b > top || a > b || step < 1) fail('CRON_INVALID', `cron 字段无效：${expr}`);
    for (let v = a; v <= b; v += step) set.add(index === 4 && v === 7 ? 0 : v);
  }
  return set;
}
/** Standard 5-field cron: minute hour day-of-month month day-of-week (0/7 = Sunday). */
export function parseCron(expr) {
  const raw = String(expr ?? '').trim().toLowerCase();
  const source = SHORTHANDS[raw] || raw;
  const parts = source.split(/\s+/);
  if (parts.length !== 5) fail('CRON_INVALID', 'cron 需要 5 个字段：分 时 日 月 周');
  const [minute, hour, dom, month, dow] = parts.map((p, i) => parseField(p, FIELD_RANGES[i], i));
  return { source, minute, hour, dom, month, dow, domAny: parts[2] === '*', dowAny: parts[4] === '*' };
}
const formatters = new Map();
function formatterFor(tz) {
  if (!formatters.has(tz)) formatters.set(tz, new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', weekday: 'short' }));
  return formatters.get(tz);
}
export function validTimezone(tz) { try { formatterFor(tz); return true; } catch { return false; } }
const WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
/** Wall-clock parts of an instant in tz. */
export function zonedParts(ms, tz = DEFAULT_TIMEZONE) {
  const out = {};
  for (const p of formatterFor(tz).formatToParts(new Date(ms))) out[p.type] = p.value;
  return { year: +out.year, month: +out.month, day: +out.day, hour: +out.hour % 24, minute: +out.minute, dow: WEEKDAYS[out.weekday] };
}
/** UTC instant of a wall-clock time in tz (handles DST by re-checking the offset). */
export function zonedToUtc({ year, month, day, hour = 0, minute = 0 }, tz = DEFAULT_TIMEZONE) {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  let ms = guess;
  for (let i = 0; i < 3; i++) {
    const p = zonedParts(ms, tz);
    const shown = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
    const delta = guess - shown; if (!delta) break; ms += delta;
  }
  return ms;
}
function cronDayMatches(c, p) {
  if (!c.month.has(p.month)) return false;
  const domOk = c.dom.has(p.day), dowOk = c.dow.has(p.dow);
  return c.domAny || c.dowAny ? domOk && dowOk : domOk || dowOk;
}
/** First instant strictly after `afterMs` matching cron in tz, or null within ~2 years. */
export function nextCronAfter(cron, tz, afterMs) {
  const c = typeof cron === 'string' ? parseCron(cron) : cron;
  let ms = Math.floor(afterMs / MINUTE) * MINUTE + MINUTE;
  const limit = afterMs + 2 * 366 * DAY;
  while (ms <= limit) {
    const p = zonedParts(ms, tz);
    if (!cronDayMatches(c, p)) { const nx = zonedToUtc({ year: p.year, month: p.month, day: p.day + 1, hour: 0, minute: 0 }, tz); ms = nx > ms ? nx : ms + MINUTE; continue; }
    if (!c.hour.has(p.hour)) { const nx = zonedToUtc({ year: p.year, month: p.month, day: p.day, hour: p.hour + 1, minute: 0 }, tz); ms = nx > ms ? nx : ms + MINUTE; continue; }
    if (!c.minute.has(p.minute)) { ms += MINUTE; continue; }
    return ms;
  }
  return null;
}

// ======================= schedules =======================
/**
 * schedule: { kind:'cron', cron, timezone } | { kind:'interval', everyMinutes, startAt?, timezone }
 * Returns the first planned instant strictly after afterMs, honoring automation.startAt / endAt.
 */
export function nextPlanned(automation, afterMs) {
  const s = automation.schedule || {};
  const tz = s.timezone || DEFAULT_TIMEZONE;
  const startMs = automation.startAt ? Date.parse(automation.startAt) : null;
  const endMs = automation.endAt ? Date.parse(automation.endAt) : null;
  let from = afterMs;
  if (startMs && from < startMs - 1) from = startMs - 1;
  let next = null;
  if (s.kind === 'interval') {
    const every = Math.round(Number(s.everyMinutes) * MINUTE);
    if (!(every >= MINUTE)) return null;
    const anchor = s.startAt ? Date.parse(s.startAt) : Date.parse(automation.createdAt || nowIso(0));
    next = from < anchor ? anchor : anchor + (Math.floor((from - anchor) / every) + 1) * every;
  } else next = nextCronAfter(s.cron, tz, from);
  if (next === null || (endMs && next > endMs)) return null;
  return next;
}
export function previewSchedule(automation, fromMs = Date.now(), count = 5) {
  const out = []; let cursor = fromMs;
  for (let i = 0; i < count; i++) { const n = nextPlanned(automation, cursor); if (n === null) break; out.push(nowIso(n)); cursor = n; }
  return out;
}
export function validateSchedule(schedule = {}) {
  const tz = text(schedule.timezone, 80) || DEFAULT_TIMEZONE;
  if (!validTimezone(tz)) fail('SCHEDULE_TIMEZONE_INVALID', `时区无效：${tz}`);
  if (schedule.kind === 'interval') {
    const every = Number(schedule.everyMinutes);
    if (!Number.isFinite(every) || every < 5 || every > 60 * 24 * 31) fail('SCHEDULE_INTERVAL_INVALID', '间隔需在 5 分钟到 31 天之间。');
    if (schedule.startAt && !Number.isFinite(Date.parse(schedule.startAt))) fail('SCHEDULE_INTERVAL_INVALID', '间隔起点时间无效。');
    return { kind: 'interval', everyMinutes: Math.round(every), timezone: tz, ...(schedule.startAt ? { startAt: new Date(Date.parse(schedule.startAt)).toISOString() } : {}) };
  }
  const cron = parseCron(schedule.cron);
  return { kind: 'cron', cron: cron.source, timezone: tz };
}
export function describeSchedule(schedule = {}) {
  if (schedule.kind === 'interval') { const m = schedule.everyMinutes; return m % 1440 === 0 ? `每 ${m / 1440} 天` : m % 60 === 0 ? `每 ${m / 60} 小时` : `每 ${m} 分钟`; }
  const parts = String(schedule.cron || '').split(/\s+/);
  const tz = schedule.timezone && schedule.timezone !== DEFAULT_TIMEZONE ? `（${schedule.timezone}）` : '';
  if (parts.length === 5 && /^\d+$/.test(parts[0]) && /^\d+$/.test(parts[1]) && parts[2] === '*' && parts[3] === '*') {
    const hm = `${parts[1].padStart(2, '0')}:${parts[0].padStart(2, '0')}`;
    if (parts[4] === '*') return `每天 ${hm}${tz}`;
    const names = ['日', '一', '二', '三', '四', '五', '六'];
    if (/^[0-7](,[0-7])*$/.test(parts[4])) return `每周${parts[4].split(',').map(d => names[+d % 7]).join('、')} ${hm}${tz}`;
    if (parts[4] === '1-5') return `工作日 ${hm}${tz}`;
  }
  return `cron「${schedule.cron}」${tz}`;
}

// ======================= store =======================
export class AutopilotStore {
  constructor({ directory = sharedAutomationRoot(), now = () => Date.now(), launcherDirectory } = {}) {
    this.root = directory;
    this.directory = path.join(directory, 'autopilot');
    this.file = path.join(this.directory, 'automations.v1.json');
    this.runsFile = path.join(this.directory, 'runs.jsonl');
    this.scheduleFile = path.join(this.directory, 'schedule.json');
    this.lockFile = path.join(this.directory, 'scheduler.lock.json');
    this.claimsDir = path.join(this.directory, 'claims');
    this.transcriptsDir = path.join(this.directory, 'transcripts');
    this.mutexDir = path.join(this.directory, '.automations.lock');
    this.launcherDirectory = launcherDirectory || defaultLauncherDirectory();
    this.now = now;
    this.listeners = new Set();
  }
  onDidChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit() { for (const fn of [...this.listeners]) { try { fn(); } catch {} } }
  read() {
    const exists = fs.existsSync(this.file);
    const raw = exists ? readJson(this.file, null) : null;
    if (exists && !raw) fail('AUTOMATION_DATA_UNREADABLE', `自动化数据无法解析：${this.file}。原文件不会被覆盖。`);
    return raw && Array.isArray(raw.automations) ? raw : { version: 1, revision: 0, automations: [] };
  }
  mutate(fn) {
    const out = withFileLock(this.mutexDir, () => { const state = structuredClone(this.read()); const r = fn(state); state.revision = (state.revision || 0) + 1; writeJsonAtomic(this.file, state); return r; });
    this.writeSchedule(); this.emit(); return out;
  }
  list() { return this.read().automations; }
  get(id) { const a = this.read().automations.find(x => x.id === id); if (!a) fail('AUTOMATION_UNKNOWN', `自动化 ${id} 不存在。`); return a; }
  normalize(input, existing) {
    const name = text(input.name, 120); if (!name) fail('AUTOMATION_NAME_REQUIRED', '名称不能为空。');
    const prompt = text(input.prompt, 32000); if (!prompt) fail('AUTOMATION_PROMPT_REQUIRED', '提示词不能为空。');
    const mode = input.mode || 'create_work_item'; if (!RUN_MODES[mode]) fail('AUTOMATION_MODE_INVALID', '模式必须是 create_work_item 或 run_only。');
    const folder = text(input.folder, 1000); if (!folder || !path.isAbsolute(folder)) fail('AUTOMATION_FOLDER_REQUIRED', '目标工作区文件夹必须是绝对路径。');
    const missedPolicy = input.missedPolicy || 'run_latest'; if (!MISSED_POLICIES[missedPolicy]) fail('AUTOMATION_POLICY_INVALID', '错过运行策略无效。');
    const endAt = input.endAt ? new Date(Date.parse(input.endAt)) : null; if (input.endAt && !Number.isFinite(endAt?.getTime())) fail('AUTOMATION_END_INVALID', '结束时间无效。');
    const timeoutMinutes = Math.min(180, Math.max(1, Math.round(Number(input.timeoutMinutes) || 20)));
    const model = input.model && typeof input.model === 'object' && input.model.id ? { vendor: text(input.model.vendor, 80) || 'opencode', id: text(input.model.id, 200), name: text(input.model.name, 200) } : null;
    return { name, prompt, mode, folder, missedPolicy, endAt: endAt ? endAt.toISOString() : null, timeoutMinutes, model, schedule: validateSchedule(input.schedule || existing?.schedule), projectId: text(input.projectId, 200) || null, enabled: input.enabled === undefined ? (existing ? existing.enabled : true) : input.enabled === true };
  }
  save(input = {}) {
    return this.mutate(state => {
      const at = nowIso(this.now());
      let a = input.id ? state.automations.find(x => x.id === input.id) : null;
      if (input.id && !a) fail('AUTOMATION_UNKNOWN', '自动化不存在。');
      if (a && Number.isSafeInteger(input.expected_revision) && input.expected_revision !== a.revision) fail('AUTOMATION_REVISION_CONFLICT', `自动化已被修改（revision=${a.revision}），请刷新后再改。`);
      const fields = this.normalize(input, a);
      if (!a) { a = { id: newId('auto'), ...fields, createdAt: at, updatedAt: at, revision: 1, state: { cursor: at, consecutiveFailures: 0, lastRunId: null, lastStatus: null, pausedReason: null } }; state.automations.push(a); }
      else {
        const scheduleChanged = JSON.stringify(a.schedule) !== JSON.stringify(fields.schedule);
        const reEnabled = !a.enabled && fields.enabled;
        Object.assign(a, fields, { updatedAt: at, revision: a.revision + 1 });
        // A new schedule or re-enabling starts counting from now: no flood of "missed" runs for the paused time.
        if (scheduleChanged || reEnabled) a.state.cursor = at;
        if (reEnabled) { a.state.consecutiveFailures = 0; a.state.pausedReason = null; }
      }
      return structuredClone(a);
    });
  }
  setEnabled(id, enabled) { const a = this.get(id); return this.save({ ...a, enabled: enabled === true, expected_revision: a.revision }); }
  remove(id) { return this.mutate(state => { if (!state.automations.some(x => x.id === id)) fail('AUTOMATION_UNKNOWN', '自动化不存在。'); state.automations = state.automations.filter(x => x.id !== id); return { deleted: true, id }; }); }
  patchState(id, patch) { return this.mutate(state => { const a = state.automations.find(x => x.id === id); if (!a) return null; a.state = { ...a.state, ...patch }; return structuredClone(a); }); }
  isActive(a, nowMs = this.now()) { return a.enabled && !(a.endAt && Date.parse(a.endAt) < nowMs); }
  activeAutomations(nowMs = this.now()) { return this.list().filter(a => this.isActive(a, nowMs)); }

  // ---------- planning ----------
  /** Planned instants in (cursor, now]; capped. */
  missedTimes(a, nowMs = this.now(), cap = 500) {
    const out = []; let cursor = Date.parse(a.state?.cursor || a.createdAt);
    for (let i = 0; i < cap; i++) { const n = nextPlanned(a, cursor); if (n === null || n > nowMs) break; out.push(n); cursor = n; }
    return out;
  }
  /**
   * What should happen now for each active automation: { automation, run: plannedAt|null, skip:[plannedAt...], cursor }.
   * Default policy run_latest: run the most recent missed slot once, mark older ones skipped.
   * skip_missed: run only if the latest slot is within the grace window, else skip all.
   * Slots that already have a terminal run record (e.g. recorded by the launcher) are not re-run.
   */
  plan(nowMs = this.now(), { graceMs = 10 * MINUTE } = {}) {
    const recorded = this.terminalKeys();
    const out = [];
    for (const a of this.activeAutomations(nowMs)) {
      const times = this.missedTimes(a, nowMs).filter(t => !recorded.has(runKey(a.id, t)));
      const all = this.missedTimes(a, nowMs);
      if (!all.length) continue;
      const cursor = all[all.length - 1];
      if (!times.length) { out.push({ automation: a, run: null, skip: [], cursor }); continue; }
      const latest = times[times.length - 1];
      const older = times.slice(0, -1);
      if (a.missedPolicy === 'skip_missed' && nowMs - latest > graceMs) out.push({ automation: a, run: null, skip: times, cursor });
      else out.push({ automation: a, run: latest, skip: older, cursor });
    }
    return out;
  }
  nextDue(nowMs = this.now()) {
    let best = null;
    for (const a of this.activeAutomations(nowMs)) {
      const missed = this.missedTimes(a, nowMs, 1);
      const n = missed.length ? missed[0] : nextPlanned(a, Math.max(nowMs, Date.parse(a.state?.cursor || a.createdAt)));
      if (n !== null && (best === null || n < best.at)) best = { at: n, automationId: a.id };
    }
    return best;
  }
  /** schedule.json is what the launcher reads: upcoming slots per active automation (including already-due ones). */
  writeSchedule(nowMs = this.now()) {
    const upcoming = [];
    for (const a of this.activeAutomations(nowMs)) {
      let cursor = Date.parse(a.state?.cursor || a.createdAt);
      for (let i = 0; i < 4; i++) { const n = nextPlanned(a, cursor); if (n === null) break; upcoming.push({ automationId: a.id, name: a.name, plannedAt: nowIso(n), key: runKey(a.id, n), folder: a.folder }); cursor = n; }
    }
    upcoming.sort((x, y) => x.plannedAt.localeCompare(y.plannedAt));
    const prev = readJson(this.scheduleFile, {});
    const value = { version: 1, generatedAt: nowIso(nowMs), upcoming, registered: prev.registered || null };
    try { writeJsonAtomic(this.scheduleFile, value); } catch {}
    return value;
  }
  readSchedule() { return readJson(this.scheduleFile, { upcoming: [], registered: null }); }
  markRegistered(registered) { const v = this.readSchedule(); v.registered = registered; writeJsonAtomic(this.scheduleFile, v); return v; }

  // ---------- runs (append-only JSONL; last record per run id wins) ----------
  appendRun(record) {
    fs.mkdirSync(this.directory, { recursive: true });
    const line = JSON.stringify({ ...record, recordedAt: nowIso(this.now()) }) + '\n';
    try { if (fs.statSync(this.runsFile).size > 4 * 1024 * 1024) this.compactRuns(); } catch {}
    fs.appendFileSync(this.runsFile, line);
    this.emit();
    return record;
  }
  rawRuns() {
    let content = ''; try { content = fs.readFileSync(this.runsFile, 'utf8'); } catch { return []; }
    const out = []; for (const line of content.split('\n')) { const t = line.replace(/^\uFEFF/, '').trim(); if (!t) continue; try { out.push(JSON.parse(t)); } catch {} }
    return out;
  }
  runs({ automationId, limit = 200 } = {}) {
    const byId = new Map();
    for (const r of this.rawRuns()) { if (!r?.id) continue; byId.set(r.id, { ...(byId.get(r.id) || {}), ...r }); }
    let list = [...byId.values()];
    if (automationId) list = list.filter(r => r.automationId === automationId);
    return list.sort((a, b) => String(b.plannedAt || '').localeCompare(String(a.plannedAt || '')) || String(b.recordedAt).localeCompare(String(a.recordedAt))).slice(0, limit);
  }
  terminalKeys() { const set = new Set(); for (const r of this.runs({ limit: 100000 })) if (r.key && ['ok', 'failed', 'skipped'].includes(r.status)) set.add(r.key); return set; }
  compactRuns(keep = 2000) {
    const list = this.runs({ limit: keep }).reverse();
    const tmp = this.runsFile + '.' + process.pid + '.tmp';
    fs.writeFileSync(tmp, list.map(r => JSON.stringify(r)).join('\n') + '\n'); fs.renameSync(tmp, this.runsFile);
  }
  /** Exclusive per-run claim: exactly one process can create the claim file for a key. */
  claim(key, owner) {
    fs.mkdirSync(this.claimsDir, { recursive: true });
    const file = path.join(this.claimsDir, crypto.createHash('sha256').update(key).digest('hex').slice(0, 40) + '.claim');
    try { const fd = fs.openSync(file, 'wx'); fs.writeSync(fd, JSON.stringify({ key, owner, pid: process.pid, at: nowIso(this.now()) })); fs.closeSync(fd); return true; }
    catch (error) { if (error.code === 'EEXIST') return false; throw error; }
  }
  pruneClaims(maxAgeMs = 45 * DAY) { try { for (const f of fs.readdirSync(this.claimsDir)) { const p = path.join(this.claimsDir, f); if (this.now() - fs.statSync(p).mtimeMs > maxAgeMs) fs.rmSync(p, { force: true }); } } catch {} }
  /** Runs left "running" by a closed/crashed OpenCode become failed: interrupted. */
  recoverInterrupted(isAliveRun = () => false) {
    for (const r of this.runs({ limit: 500 })) if (r.status === 'running' && !isAliveRun(r)) this.appendRun({ id: r.id, automationId: r.automationId, key: r.key, plannedAt: r.plannedAt, status: 'failed', reason: 'interrupted', detail: 'OpenCode 在运行结束前关闭或崩溃；未知副作用不会自动重放。', endedAt: nowIso(this.now()) });
  }
  saveTranscript(runId, value) { try { writeJsonAtomic(path.join(this.transcriptsDir, runId.replace(/[^a-zA-Z0-9_-]/g, '_') + '.json'), value); } catch {} }
  readTranscript(runId) { return readJson(path.join(this.transcriptsDir, String(runId).replace(/[^a-zA-Z0-9_-]/g, '_') + '.json'), null); }

  // ---------- in-app single-instance scheduler lock ----------
  readLock() { return readJson(this.lockFile, null); }
  lockFresh(lock, nowMs = this.now(), alive = pidAlive) { return !!lock && nowMs - Date.parse(lock.heartbeatAt) < LOCK_STALE_MS && alive(lock.pid); }
  acquireLock(instanceId, info = {}, alive = pidAlive) {
    return withFileLock(this.mutexDir + '-sched', () => {
      const cur = this.readLock();
      if (cur && cur.instanceId !== instanceId && this.lockFresh(cur, this.now(), alive)) return false;
      writeJsonAtomic(this.lockFile, { instanceId, pid: process.pid, heartbeatAt: nowIso(this.now()), acquiredAt: cur?.instanceId === instanceId ? cur.acquiredAt : nowIso(this.now()), ...info });
      return true;
    });
  }
  releaseLock(instanceId) { try { withFileLock(this.mutexDir + '-sched', () => { const cur = this.readLock(); if (cur?.instanceId === instanceId) fs.rmSync(this.lockFile, { force: true }); }); } catch {} }
}
export const runKey = (automationId, plannedMs) => `${automationId}@${nowIso(plannedMs)}`;
export function pidAlive(pid) { if (!Number.isInteger(pid) || pid <= 0) return false; try { process.kill(pid, 0); return true; } catch (e) { return e.code === 'EPERM'; } }

// ======================= Windows launcher + Task Scheduler =======================
export function defaultLauncherDirectory(env = process.env) {
  const base = process.platform === 'win32' ? (env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local')) : (env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share'));
  return path.join(base, 'OpenCode', 'automation-launcher');
}
export function defaultTaskName(env = process.env) {
  const user = String(env.USERNAME || os.userInfo().username || 'user').replace(/[\\/:*?"<>|]/g, '_');
  return `OpenCode Automations (${user})`;
}
const xmlEscape = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** Local wall time "YYYY-MM-DDTHH:mm:ss" for the machine (Task Scheduler's StartBoundary without offset = local time). */
export function localBoundary(ms) { const d = new Date(ms); const p = n => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`; }
export function taskXml({ taskName, launcherVbs, startMs, userId }) {
  return `<?xml version="1.0" encoding="UTF-16"?>
<Task version="1.2" xmlns="http://schemas.microsoft.com/windows/2004/02/mit/task">
  <RegistrationInfo><Author>OpenCode</Author><Description>OpenCode 自动化：到期时启动一次性启动器（数秒内退出），由它启动 OpenCode 执行到期的自动化后自动退出。没有已启用的自动化时此任务会被删除。</Description><URI>\\${xmlEscape(taskName)}</URI></RegistrationInfo>
  <Triggers><TimeTrigger><StartBoundary>${localBoundary(startMs)}</StartBoundary><Enabled>true</Enabled></TimeTrigger></Triggers>
  <Principals><Principal id="Author">${userId ? `<UserId>${xmlEscape(userId)}</UserId>` : ''}<LogonType>InteractiveToken</LogonType><RunLevel>LeastPrivilege</RunLevel></Principal></Principals>
  <Settings>
    <MultipleInstancesPolicy>IgnoreNew</MultipleInstancesPolicy>
    <DisallowStartIfOnBatteries>false</DisallowStartIfOnBatteries>
    <StopIfGoingOnBatteries>false</StopIfGoingOnBatteries>
    <AllowHardTerminate>true</AllowHardTerminate>
    <StartWhenAvailable>true</StartWhenAvailable>
    <RunOnlyIfNetworkAvailable>false</RunOnlyIfNetworkAvailable>
    <IdleSettings><StopOnIdleEnd>false</StopOnIdleEnd><RestartOnIdle>false</RestartOnIdle></IdleSettings>
    <AllowStartOnDemand>true</AllowStartOnDemand>
    <Enabled>true</Enabled>
    <Hidden>false</Hidden>
    <RunOnlyIfIdle>false</RunOnlyIfIdle>
    <WakeToRun>false</WakeToRun>
    <ExecutionTimeLimit>PT30M</ExecutionTimeLimit>
    <Priority>7</Priority>
  </Settings>
  <Actions Context="Author"><Exec><Command>wscript.exe</Command><Arguments>//B //Nologo "${xmlEscape(launcherVbs)}"</Arguments></Exec></Actions>
</Task>
`;
}

export const LAUNCHER_VERSION = 1;
export function launcherVbsSource() {
  return [
    "' OpenCode automation launcher (generated). Starts launcher.ps1 hidden and returns at once.",
    'Option Explicit',
    'Dim fso, sh, here',
    'Set fso = CreateObject("Scripting.FileSystemObject")',
    'Set sh = CreateObject("WScript.Shell")',
    'here = fso.GetParentFolderName(WScript.ScriptFullName)',
    'sh.Run "powershell.exe -NoProfile -NonInteractive -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & here & "\\launcher.ps1""", 0, False',
    ''
  ].join('\r\n');
}
/** PowerShell 5.1 launcher. ASCII only (written with BOM anyway). Exits within seconds in every branch. */
export function launcherPs1Source() {
  return String.raw`# OpenCode automation launcher v${LAUNCHER_VERSION} (generated by OpenCode; safe to delete together with the scheduled task).
# Never stays resident: defers to a running OpenCode, records install_moved, or starts OpenCode once and exits.
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$log = Join-Path $here 'launcher.log'
function Log([string]$m) { try { if ((Test-Path $log) -and ((Get-Item $log).Length -gt 262144)) { Move-Item $log "$log.1" -Force }; Add-Content -Path $log -Value ("{0} {1}" -f (Get-Date).ToString('o'), $m) -Encoding UTF8 } catch {} }
function ReadJson([string]$p) { if (-not (Test-Path -LiteralPath $p)) { return $null }; return (Get-Content -LiteralPath $p -Raw -Encoding UTF8 | ConvertFrom-Json) }
function Utc([string]$s) { return ([DateTime]::Parse($s, [Globalization.CultureInfo]::InvariantCulture, [Globalization.DateTimeStyles]::RoundtripKind)).ToUniversalTime() }
try {
  $ptr = ReadJson (Join-Path $here 'pointer.json')
  if ($null -eq $ptr) { Log 'no pointer.json; nothing to do'; exit 0 }
  $auto = Join-Path $ptr.dataDir 'autopilot'
  $now = (Get-Date).ToUniversalTime()
  $sched = ReadJson (Join-Path $auto 'schedule.json')
  $upcoming = @(); if ($sched -and $sched.upcoming) { $upcoming = @($sched.upcoming) }
  $due = @($upcoming | Where-Object { (Utc $_.plannedAt) -le $now.AddSeconds(90) })
  $future = @($upcoming | Where-Object { (Utc $_.plannedAt) -gt $now.AddSeconds(90) } | Sort-Object { Utc $_.plannedAt })
  function Rearm() {
    if ($future.Count -gt 0) {
      try { $at = (Utc $future[0].plannedAt).ToLocalTime(); Set-ScheduledTask -TaskName $ptr.taskName -Trigger (New-ScheduledTaskTrigger -Once -At $at) | Out-Null; Log ("re-armed for " + $at.ToString('o')) } catch { Log ("re-arm failed: " + $_.Exception.Message) }
    }
  }
  # 1) OpenCode already running (in-app scheduler holds a fresh lock, or the exe is running): defer.
  $lock = ReadJson (Join-Path $auto 'scheduler.lock.json')
  if ($lock) {
    $age = ($now - (Utc $lock.heartbeatAt)).TotalSeconds
    if ($age -lt 180 -and (Get-Process -Id ([int]$lock.pid) -ErrorAction SilentlyContinue)) { Log ("deferred: in-app scheduler pid=" + $lock.pid); exit 0 }
  }
  $running = @(Get-Process -Name ([IO.Path]::GetFileNameWithoutExtension($ptr.exe)) -ErrorAction SilentlyContinue | Where-Object { $_.Path -and ($_.Path -ieq $ptr.exe) })
  if ($running.Count -gt 0) { Log 'deferred: OpenCode is running (scheduler will pick up due runs)'; exit 0 }
  if ($due.Count -eq 0) { Log 'nothing due'; Rearm; exit 0 }
  # 2) Install folder moved/deleted: record skipped runs, re-arm, exit.
  if (-not (Test-Path -LiteralPath $ptr.exe)) {
    foreach ($d in $due) {
      $rec = [ordered]@{ id = ('run_launcher_' + [Guid]::NewGuid().ToString('N').Substring(0, 12)); automationId = $d.automationId; key = $d.key; plannedAt = $d.plannedAt; status = 'skipped'; reason = 'install_moved'; detail = ('OpenCode not found at ' + $ptr.exe + '; start OpenCode from its new folder once to refresh the pointer.'); source = 'launcher'; endedAt = $now.ToString('o'); recordedAt = $now.ToString('o') }
      Add-Content -LiteralPath (Join-Path $auto 'runs.jsonl') -Value ($rec | ConvertTo-Json -Compress) -Encoding UTF8
    }
    Log ("skipped " + $due.Count + " run(s): install moved (" + $ptr.exe + ")")
    Rearm; exit 0
  }
  # 3) Start OpenCode once for the due runs; the extension executes them and quits.
  $folder = $null; foreach ($d in $due) { if ($d.folder -and (Test-Path -LiteralPath $d.folder)) { $folder = $d.folder; break } }
  $env:OPENCODE_AUTOMATION_RUN = '1'
  $argList = @('--new-window'); if ($folder) { $argList += ('"' + $folder + '"') }
  Start-Process -FilePath $ptr.exe -ArgumentList $argList -WorkingDirectory (Split-Path -Parent $ptr.exe) | Out-Null
  Log ("launched OpenCode for " + $due.Count + " due run(s)" + $(if ($folder) { " folder=" + $folder } else { "" }))
  exit 0
} catch { Log ("error: " + $_.Exception.Message); exit 1 }
`;
}

function execFileP(file, args, opts = {}) {
  return new Promise(resolve => execFile(file, args, { windowsHide: true, timeout: 20000, encoding: 'utf8', ...opts }, (error, stdout, stderr) => resolve({ code: error ? (typeof error.code === 'number' ? error.code : 1) : 0, stdout: String(stdout || ''), stderr: String(stderr || ''), error })));
}

/**
 * Keeps the per-user Windows scheduled task in sync with the store. `exec` is injectable for tests.
 * ensure(): ≥1 active automation → (re)register one-shot trigger at the next due time; none → delete the task.
 */
export class WindowsTaskScheduler {
  constructor(store, { taskName = defaultTaskName(), exec = execFileP, platform = process.platform, env = process.env } = {}) {
    this.store = store; this.taskName = taskName; this.exec = exec; this.platform = platform; this.env = env;
  }
  get launcherDir() { return this.store.launcherDirectory; }
  pointerFile() { return path.join(this.launcherDir, 'pointer.json'); }
  /** Refreshed on every OpenCode start: where the install is now, where the data is. */
  writePointer({ exe, installDir }) {
    const value = { version: 1, exe, installDir, dataDir: this.store.root, taskName: this.taskName, updatedAt: nowIso(this.store.now()), pid: process.pid };
    writeJsonAtomic(this.pointerFile(), value);
    this.writeLauncher();
    return value;
  }
  readPointer() { return readJson(this.pointerFile(), null); }
  writeLauncher() {
    fs.mkdirSync(this.launcherDir, { recursive: true });
    const ps1 = path.join(this.launcherDir, 'launcher.ps1'), vbs = path.join(this.launcherDir, 'launcher.vbs');
    const ps = Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(launcherPs1Source(), 'utf8')]);
    if (!fs.existsSync(ps1) || !fs.readFileSync(ps1).equals(ps)) fs.writeFileSync(ps1, ps);
    const vb = Buffer.from(launcherVbsSource(), 'latin1');
    if (!fs.existsSync(vbs) || !fs.readFileSync(vbs).equals(vb)) fs.writeFileSync(vbs, vb);
    return { ps1, vbs };
  }
  async register(startMs) {
    if (this.platform !== 'win32') return { registered: false, reason: 'not_windows' };
    const { vbs } = this.writeLauncher();
    const userId = this.env.USERDOMAIN && this.env.USERNAME ? `${this.env.USERDOMAIN}\\${this.env.USERNAME}` : null;
    const xml = taskXml({ taskName: this.taskName, launcherVbs: vbs, startMs, userId });
    const file = path.join(os.tmpdir(), `opencode-autopilot-${process.pid}-${crypto.randomBytes(3).toString('hex')}.xml`);
    fs.writeFileSync(file, Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from(xml, 'utf16le')]));
    try {
      const r = await this.exec('schtasks.exe', ['/Create', '/TN', this.taskName, '/XML', file, '/F']);
      if (r.code !== 0) return { registered: false, reason: 'schtasks_failed', detail: (r.stderr || r.stdout).trim().slice(0, 500) };
      const value = { taskName: this.taskName, at: nowIso(startMs), registeredAt: nowIso(this.store.now()) };
      this.store.markRegistered(value);
      return { registered: true, ...value };
    } finally { try { fs.rmSync(file, { force: true }); } catch {} }
  }
  async unregister() {
    if (this.platform !== 'win32') return { removed: false, reason: 'not_windows' };
    const q = await this.exec('schtasks.exe', ['/Query', '/TN', this.taskName]);
    if (q.code !== 0) { this.store.markRegistered(null); return { removed: false, reason: 'not_registered' }; }
    const r = await this.exec('schtasks.exe', ['/Delete', '/TN', this.taskName, '/F']);
    if (r.code === 0) this.store.markRegistered(null);
    return { removed: r.code === 0, detail: (r.stderr || r.stdout).trim().slice(0, 300) };
  }
  async query() {
    if (this.platform !== 'win32') return { exists: false, reason: 'not_windows' };
    const r = await this.exec('schtasks.exe', ['/Query', '/TN', this.taskName, '/XML']);
    if (r.code !== 0) return { exists: false };
    const m = /<StartBoundary>([^<]+)<\/StartBoundary>/.exec(r.stdout);
    return { exists: true, startBoundary: m ? m[1] : null };
  }
  /** Reconcile the scheduled task with the store. Only re-registers when the trigger time actually changes. */
  async ensure({ force = false } = {}) {
    const nowMs = this.store.now();
    this.store.writeSchedule(nowMs);
    const next = this.store.nextDue(nowMs);
    const reg = this.store.readSchedule().registered;
    if (!next) { if (!reg && !force) return { action: 'none' }; return { action: 'removed', ...(await this.unregister()) }; }
    let startMs = next.at;
    if (startMs <= nowMs + MINUTE) {
      // Already due: the running OpenCode handles it now. Keep a pending future trigger, else arm a near one as a safety net.
      if (!force && reg?.taskName === this.taskName && Date.parse(reg.at) > nowMs) return { action: 'unchanged', at: reg.at };
      startMs = nowMs + 2 * MINUTE;
    }
    if (!force && reg?.at === nowIso(startMs) && reg.taskName === this.taskName) return { action: 'unchanged', at: reg.at };
    return { action: 'registered', ...(await this.register(startMs)) };
  }
}

// ---------------- Bridge MCP tools (optional, compact) ----------------
export const AUTOPILOT_TOOL_DEFINITIONS = [
  { name: 'automation_list', title: '列出自动化', description: '列出「自动化」定时任务：名称、计划、模式、下次运行时间、最近状态（只读）。', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, outputSchema: { type: 'object', additionalProperties: true }, annotations: { title: '列出自动化', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false } },
  { name: 'automation_run_now', title: '立即运行自动化', description: '在当前 OpenCode 窗口排队立即运行一个已配置的自动化（用户已配置的提示词与目标文件夹），结果写入运行历史。', inputSchema: { type: 'object', properties: { id: { type: 'string', description: 'automation_list 返回的 ID。' } }, required: ['id'], additionalProperties: false }, outputSchema: { type: 'object', additionalProperties: true }, annotations: { title: '立即运行自动化', readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false } }
];
export const AUTOPILOT_TOOL_NAMES = new Set(AUTOPILOT_TOOL_DEFINITIONS.map(t => t.name));
