// Project Memory & Scratch Memory System for OpenCode.
// Based on D:\CODEX\Tools\project-memory.py architecture.
// Zero external native dependencies; UTF-8 atomic Markdown + JSON.
import fs from 'node:fs';
import path from 'node:path';

export const LIMITS = { 'AGENTS.md': 60, 'INDEX.md': 40, 'HANDOFF.md': 150, 'NOTES.md': 200 };

export const TEMPLATES = {
  'AGENTS.md': `# 项目铁律（每次开工必读，≤60 行）

- 项目：{name}
- 不删除任何用户文件；改动前先备份。
- 开工读取顺序：AGENTS.md → INDEX.md → HANDOFF.md → REQUIREMENTS.md 最近 20 条；其余文件按 INDEX 路由按需读。
- 写入后自动更新记忆状态与修订号。
`,
  'INDEX.md': `# 路由表（≤40 行）：想找什么 → 去哪看

- 现在做到哪、下一步 → HANDOFF.md
- 用户提过的要求 → REQUIREMENTS.md（最新在最后）
- 当初为什么这样设计、后来改了什么 → DECISIONS.md
- 每天干了什么 → WORKLOG.md（只看末尾）
- 用户强调记下的内容 → NOTES.md
- 旧版本/旧交接全文 → archive/
`,
  'HANDOFF.md': `# 交接单（≤150 行，只写现状）

## 当前状态

## 下一步

## 未决问题

## 关键路径
`,
  'REQUIREMENTS.md': `# 需求清单（只追加；格式：- 日期 [状态] 内容（记录人））\n\n`,
  'WORKLOG.md': `# 工作日志（只追加，开工不读，需要时看末尾）\n\n`,
  'DECISIONS.md': `# 底层逻辑决策（每条 3~5 行：当时怎么设计 / 后来改成什么 / 为什么）\n\n`,
  'NOTES.md': `# 随手记（用户说「记一下」才写；每条一行：日期 | 内容）\n\n`
};

export const SECRET_PATTERNS = [
  /https:\/\/[A-Za-z0-9.-]*ngrok[A-Za-z0-9.\/_?=&%-]*/g,
  /\b(sk|jina|ghp|gho|xox[abp])[-_][A-Za-z0-9_-]{16,}/g,
  /(token|api[_-]?key|secret|password)\s*[:=]\s*\S{8,}/gi,
  /<private>[\s\S]*?<\/private>/g
];

export function maskSecret(text) {
  if (typeof text !== 'string') return text;
  let out = text;
  for (const re of SECRET_PATTERNS) {
    out = out.replace(re, '[已打码]');
  }
  return out;
}

export function nowTs() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function atomicWrite(targetPath, text) {
  const p = path.resolve(targetPath);
  const dir = path.dirname(p);
  fs.mkdirSync(dir, { recursive: true });
  const tmp = path.join(dir, `.${path.basename(p)}.tmp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`);
  fs.writeFileSync(tmp, text, 'utf8');
  try {
    fs.renameSync(tmp, p);
  } catch (err) {
    if (fs.existsSync(p)) fs.unlinkSync(p);
    fs.renameSync(tmp, p);
  }
}

export function readFileSafe(targetPath) {
  try {
    return fs.readFileSync(targetPath, 'utf8').replace(/^\uFEFF/, '');
  } catch {
    return '';
  }
}

export function appendFileSafe(targetPath, line) {
  const p = path.resolve(targetPath);
  const old = readFileSafe(p);
  const sep = (!old || old.endsWith('\n')) ? '' : '\n';
  atomicWrite(p, old + sep + line.replace(/\r?\n$/, '') + '\n');
}

export function getMemoryDir(projectRoot, customScratchDir = '') {
  if (!projectRoot || projectRoot === 'scratch' || projectRoot === 'device' || projectRoot === 'global') {
    if (customScratchDir && customScratchDir.trim()) {
      return path.resolve(customScratchDir.trim());
    }
    const base = process.env.OPENCODE_SHARED_LOCALAPPDATA || process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || 'C:\\Users\\Default', 'AppData', 'Local');
    return path.join(base, 'OpenCode', 'shared-automation', 'scratch-memory');
  }
  return path.join(path.resolve(projectRoot), '.opencode-project');
}

export function initMemory(dir, projectName = '', isScratch = false) {
  const m = path.resolve(dir);
  fs.mkdirSync(m, { recursive: true });
  fs.mkdirSync(path.join(m, 'archive'), { recursive: true });
  const made = [];
  const name = projectName || path.basename(m === getMemoryDir('scratch') ? '临时全局记忆' : path.dirname(m));

  for (const [f, tmpl] of Object.entries(TEMPLATES)) {
    const target = path.join(m, f);
    if (!fs.existsSync(target)) {
      atomicWrite(target, tmpl.replace('{name}', name));
      made.push(f);
    }
  }

  const statePath = path.join(m, 'STATE.json');
  if (!fs.existsSync(statePath)) {
    atomicWrite(statePath, JSON.stringify({
      schema: 2,
      project: name,
      scratch: Boolean(isScratch),
      status: 'open',
      revision: 1,
      createdAt: nowTs(),
      updatedAt: nowTs(),
      writes: []
    }, null, 2));
    made.push('STATE.json');
  }
  return { ok: true, memoryDir: m, made };
}

export function readState(dir) {
  const statePath = path.join(dir, 'STATE.json');
  try {
    return JSON.parse(readFileSafe(statePath) || '{}');
  } catch {
    return { schema: 2, revision: 1, writes: [] };
  }
}

export function bumpRevision(dir, by = 'system', file = '', noteText = '') {
  const state = readState(dir);
  state.revision = (state.revision || 1) + 1;
  state.updatedAt = nowTs();
  const writes = state.writes || [];
  writes.unshift({
    ts: nowTs(),
    by: String(by || 'unknown').slice(0, 40),
    file: String(file || '').slice(0, 60),
    text: maskSecret(String(noteText || '').slice(0, 100))
  });
  state.writes = writes.slice(0, 50);
  atomicWrite(path.join(dir, 'STATE.json'), JSON.stringify(state, null, 2));
  return state.revision;
}

export function isGoodHandoff(text) {
  if (!text) return false;
  const lines = text.split('\n').filter(l => l.trim());
  return lines.length >= 6 && /下一步[\s\S]*?\n-\s+\S/.test(text);
}

export function recordHandoffGood(dir, by = 'agent') {
  const handoffText = readFileSafe(path.join(dir, 'HANDOFF.md'));
  if (isGoodHandoff(handoffText)) {
    const archiveDir = path.join(dir, 'archive');
    fs.mkdirSync(archiveDir, { recursive: true });
    atomicWrite(path.join(archiveDir, 'handoff-good.md'), `<!-- 正常交接快照 ${nowTs()} by ${by} -->\n` + handoffText);
  }
}

export function countLines(filePath) {
  const t = readFileSafe(filePath);
  return t ? t.split('\n').length : 0;
}

export function getStaleHandoffNotice(dir) {
  const handoffPath = path.join(dir, 'HANDOFF.md');
  if (!fs.existsSync(handoffPath)) return '';
  let handoffMtime = 0;
  try {
    handoffMtime = fs.statSync(handoffPath).mtimeMs;
  } catch {
    return '';
  }
  const events = [];
  for (const f of ['WORKLOG.md', 'REQUIREMENTS.md', 'NOTES.md', 'DECISIONS.md']) {
    const lines = readFileSafe(path.join(dir, f)).split('\n');
    for (const l of lines) {
      const m = l.match(/^(?:-\s+|##\s+)(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/);
      if (m) {
        const t = Date.parse(m[1].replace(' ', 'T') + ':00');
        if (t > handoffMtime) events.push(l);
      }
    }
  }
  if (events.length >= 3) {
    const ageMinutes = Math.round((Date.now() - handoffMtime) / 60000);
    return `交接单更新后又新增了 ${events.length} 条记录（距上次更新已 ${ageMinutes} 分钟）；未并入内容已自动归纳在「断层补充」中。`;
  }
  return '';
}

export function extractGapEntries(dir) {
  const handoffPath = path.join(dir, 'HANDOFF.md');
  let handoffMtime = 0;
  if (fs.existsSync(handoffPath)) {
    try { handoffMtime = fs.statSync(handoffPath).mtimeMs; } catch {}
  }
  const recent = [];
  for (const f of ['WORKLOG.md', 'REQUIREMENTS.md', 'NOTES.md', 'DECISIONS.md']) {
    const lines = readFileSafe(path.join(dir, f)).split('\n');
    for (const l of lines) {
      if (!l.trim()) continue;
      const m = l.match(/^(?:-\s+|##\s+)(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2})/);
      if (m) {
        const t = Date.parse(m[1].replace(' ', 'T') + ':00');
        if (t > handoffMtime) recent.push(`[${f.replace('.md', '')}] ` + l.trim());
      }
    }
  }
  return recent.slice(-12);
}

export function brief(dir, maxLines = 230) {
  initMemory(dir);
  const m = path.resolve(dir);
  const out = [];

  let handoffText = readFileSafe(path.join(m, 'HANDOFF.md'));
  const goodPath = path.join(m, 'archive', 'handoff-good.md');
  if (!isGoodHandoff(handoffText) && fs.existsSync(goodPath)) {
    const goodText = readFileSafe(goodPath);
    if (isGoodHandoff(goodText)) {
      out.push('⚠ [恢复提示] 当前交接单不完整，已自动调取「上次正常交接快照」继续，不阻碍接班。');
      handoffText = goodText.replace(/^<!--[\s\S]*?-->\n*/, '');
    }
  }

  const staleNotice = getStaleHandoffNotice(m);
  if (staleNotice) out.push('⚠ ' + staleNotice);

  for (const f of ['AGENTS.md', 'INDEX.md']) {
    const c = readFileSafe(path.join(m, f)).trim();
    if (c) out.push(`===== ${f} =====\n` + c);
  }

  if (handoffText.trim()) {
    out.push('===== HANDOFF.md =====\n' + handoffText.trim());
  }

  if (staleNotice) {
    const gaps = extractGapEntries(m);
    if (gaps.length) {
      out.push('===== 断层补充（上次交接之后新增，自动整理）=====\n' + gaps.join('\n'));
    }
  }

  const noteLines = readFileSafe(path.join(m, 'NOTES.md')).split('\n')
    .filter(l => l.startsWith('- ') && !l.includes('[已作废]'))
    .slice(-10);
  if (noteLines.length) {
    out.push('===== NOTES.md（随手记，最近 10 条）=====\n' + noteLines.join('\n'));
  }

  let reqLines = readFileSafe(path.join(m, 'REQUIREMENTS.md')).split('\n')
    .filter(l => l.startsWith('- '))
    .slice(-20);

  let skipped = 0;
  while (out.join('\n\n').split('\n').length + reqLines.length > maxLines && reqLines.length > 5) {
    reqLines = reqLines.slice(1);
    skipped++;
  }
  if (reqLines.length) {
    out.push(`===== REQUIREMENTS.md（最近 ${reqLines.length} 条${skipped ? `，已省略更早 ${skipped} 条` : ''}）=====\n` + reqLines.join('\n'));
  }

  return maskSecret(out.join('\n\n'));
}

export class ConversationMemoryTracker {
  constructor() {
    this.sessions = new Map();
  }

  resolveInjection(conversationId, scopeId, memoryDir) {
    initMemory(memoryDir);
    const state = readState(memoryDir);
    const curRev = state.revision || 1;
    const key = String(conversationId || 'default-session');
    const prev = this.sessions.get(key);

    if (!prev) {
      this.sessions.set(key, { scopeId, revision: curRev, at: Date.now() });
      return {
        action: 'full',
        text: brief(memoryDir),
        revision: curRev,
        note: '新会话接入：已注入开工必读 (≤230行)'
      };
    }

    if (prev.scopeId !== scopeId) {
      this.sessions.set(key, { scopeId, revision: curRev, at: Date.now() });
      return {
        action: 'full',
        text: brief(memoryDir),
        revision: curRev,
        note: `作用域切换 (${prev.scopeId} → ${scopeId})：已载入对应开工必读`
      };
    }

    if (prev.revision === curRev) {
      return {
        action: 'skip',
        text: `[记忆系统：当前对话已具备最新记忆 (rev.${curRev})，跳过重复全量读取]`,
        revision: curRev,
        note: '同对话重连无更新：跳过重复读取'
      };
    }

    const recentWrites = (state.writes || []).slice(0, Math.min(10, curRev - prev.revision));
    const deltaItems = recentWrites.map(w => `- [${w.file || '动态'}] ${w.ts} (${w.by}): ${w.text}`);
    this.sessions.set(key, { scopeId, revision: curRev, at: Date.now() });

    return {
      action: 'delta',
      text: `===== 会话增量记忆同步（自上次在当前对话同步以来更新 ${recentWrites.length} 项，rev.${prev.revision} → rev.${curRev}）=====\n` +
            (deltaItems.join('\n') || '- 状态与交接已更新，未产生额外日志。'),
      revision: curRev,
      note: `增量补丁同步成功 (${recentWrites.length} 项变更)`
    };
  }
}

export const globalMemoryTracker = new ConversationMemoryTracker();

export function appendNote(dir, text, by = 'user') {
  initMemory(dir);
  const m = path.resolve(dir);
  const safeText = maskSecret(text);
  appendFileSafe(path.join(m, 'NOTES.md'), `- ${nowTs()} | ${safeText} （${by}）`);
  const rev = bumpRevision(m, by, 'NOTES.md', '随手记：' + safeText);
  return { ok: true, file: 'NOTES.md', revision: rev };
}

export function appendRequirement(dir, text, status = '待办', by = 'user') {
  initMemory(dir);
  const m = path.resolve(dir);
  const safeText = maskSecret(text);
  appendFileSafe(path.join(m, 'REQUIREMENTS.md'), `- ${nowTs()} [${status}] ${safeText} （${by}）`);
  const rev = bumpRevision(m, by, 'REQUIREMENTS.md', `需求[${status}]：` + safeText);
  return { ok: true, file: 'REQUIREMENTS.md', revision: rev };
}

export function appendDecision(dir, title, text, by = 'agent') {
  initMemory(dir);
  const m = path.resolve(dir);
  const safeText = maskSecret(text);
  const entry = `\n## ${nowTs()} ${title}（${by}）\n${safeText}\n`;
  appendFileSafe(path.join(m, 'DECISIONS.md'), entry);
  const rev = bumpRevision(m, by, 'DECISIONS.md', '决策：' + title);
  return { ok: true, file: 'DECISIONS.md', revision: rev };
}

export function appendLog(dir, text, by = 'agent') {
  initMemory(dir);
  const m = path.resolve(dir);
  const safeText = maskSecret(text);
  appendFileSafe(path.join(m, 'WORKLOG.md'), `- ${nowTs()} [${by}] ${safeText}`);
  const rev = bumpRevision(m, by, 'WORKLOG.md', safeText);
  return { ok: true, file: 'WORKLOG.md', revision: rev };
}

export function forget(dir, keyword, by = 'user') {
  initMemory(dir);
  const m = path.resolve(dir);
  const notesPath = path.join(m, 'NOTES.md');
  const src = readFileSafe(notesPath);
  if (!src || !keyword) return { ok: false, error: '没有 NOTES.md 或未提供作废关键词' };
  atomicWrite(path.join(m, `NOTES.md.bak-${Date.now()}`), src);
  const lines = src.split('\n');
  let marked = 0;
  const out = lines.map(l => {
    if (l.startsWith('- ') && l.toLowerCase().includes(keyword.toLowerCase()) && !l.includes('[已作废]')) {
      marked++;
      return l.replace(/^- /, '- [已作废] ');
    }
    return l;
  });
  atomicWrite(notesPath, out.join('\n'));
  const rev = bumpRevision(m, by, 'NOTES.md', `标记作废 ${marked} 条：${keyword}`);
  return { ok: true, marked, revision: rev };
}

export function recall(dir, query, k = 5, budget = 800) {
  initMemory(dir);
  const m = path.resolve(dir);
  const q = String(query || '').toLowerCase().trim();
  if (!q) return { ok: true, hits: 0, text: '', confidence: 'low' };

  const terms = q.split(/\s+/).filter(Boolean);
  const candidates = [];
  const W = { 'HANDOFF.md': 1.5, 'DECISIONS.md': 1.4, 'NOTES.md': 1.3, 'REQUIREMENTS.md': 1.1, 'WORKLOG.md': 0.8 };

  for (const f of ['HANDOFF.md', 'DECISIONS.md', 'NOTES.md', 'REQUIREMENTS.md', 'WORKLOG.md']) {
    const lines = readFileSafe(path.join(m, f)).split('\n');
    lines.forEach((l, idx) => {
      if (!l.trim() || l.includes('[已作废]')) return;
      const low = l.toLowerCase();
      let matches = 0;
      for (const t of terms) {
        if (low.includes(t)) matches++;
      }
      if (matches > 0) {
        const score = matches * (W[f] || 1.0);
        candidates.push({ file: f, line: idx + 1, text: l.trim(), score });
      }
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  const selected = [];
  let used = 0;
  for (const item of candidates.slice(0, k)) {
    const formatted = `[${item.file}:${item.line}] ${item.text.slice(0, 160)}`;
    if (used + formatted.length > budget) break;
    selected.push(formatted);
    used += formatted.length;
  }

  const topScore = candidates[0]?.score || 0;
  const confidence = topScore >= 1.5 ? 'high' : (topScore >= 1.0 ? 'mid' : 'low');
  return {
    ok: true,
    hits: selected.length,
    confidence,
    text: maskSecret(selected.join('\n')),
    hint: confidence === 'low' ? '命中置信度较低，建议细化关键词或查阅完整交接单。' : ''
  };
}

export function checkMemory(dir) {
  const m = path.resolve(dir);
  const items = [];
  const add = (ok, text) => items.push({ ok, text });

  if (!fs.existsSync(m)) {
    add(false, '记忆目录尚未创建');
    return { ok: false, score: 0, items };
  }

  let missing = [];
  for (const f of Object.keys(TEMPLATES)) {
    if (!fs.existsSync(path.join(m, f))) missing.push(f);
  }
  add(missing.length === 0, missing.length === 0 ? '档案袋必要文件齐全' : '缺少：' + missing.join('、'));

  for (const [f, limit] of Object.entries(LIMITS)) {
    const count = countLines(path.join(m, f));
    add(count <= limit, `${f} 共 ${count} 行（上限建议 ${limit} 行）`);
  }

  const state = readState(m);
  add(state.schema >= 2, `STATE.json 正常 (修订号 rev.${state.revision || 1})`);
  const stale = getStaleHandoffNotice(m);
  add(!stale, stale || '交接单时效正常');

  const bad = items.filter(x => !x.ok);
  const score = Math.max(0, 100 - bad.length * 10);
  return { ok: score >= 80, score, items };
}
