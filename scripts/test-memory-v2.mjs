// recovered.33 memory v2 checks (project-memory.mjs). Local-only and deterministic:
// pure temp dirs, temp HOME/profile, no app launch, no network, no real user data.
// Hybrid search is exercised only through the injected `embedder` option of searchMemoryHybrid;
// OPENCODE_MEMORY_EMBED_* are removed from this process so nothing can reach an embeddings server.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-memory-v2-'));
process.once('exit', () => fs.rmSync(temp, { recursive: true, force: true }));
for (const key of ['HOME', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA', 'XDG_CONFIG_HOME', 'XDG_DATA_HOME']) {
  const dir = path.join(temp, 'profile', key); fs.mkdirSync(dir, { recursive: true }); process.env[key] = dir;
}
process.env.OPENCODE_AUTOMATION_HOME = path.join(temp, 'automation');
for (const key of Object.keys(process.env)) if (key.startsWith('OPENCODE_MEMORY_EMBED')) delete process.env[key];

const memory = await import(pathToFileURL(path.join(root, 'recovered/shared/project-memory.mjs')).href);
const {
  ensureMemoryDir, appendNote, appendPin, appendRequirement, handoffMemory, brief, searchMemory, searchMemoryHybrid,
  resolveEmbedConfig, consolidateMemory, confirmAutoEntries, getMemoryDir, executeMemoryTool, readState
} = memory;

let seq = 0;
const scratchRoot = path.join(temp, 'scratch-memory');
const fresh = name => { const dir = path.join(temp, `${name}-${++seq}`); ensureMemoryDir(dir); return dir; };
const read = (dir, file) => { try { return fs.readFileSync(path.join(dir, file), 'utf8'); } catch { return ''; } };
const md5 = (dir, file) => crypto.createHash('md5').update(read(dir, file)).digest('hex');
const ctx = (owner, extra = {}) => ({ owner, scratchDirectory: scratchRoot, ...extra });
const tool = (name, args, context) => executeMemoryTool(name, args, context);
const PENDING = '[自动·待确认]';
const activePending = dir => read(dir, 'NOTES.md').split('\n').filter(l => l.startsWith('- ') && l.includes(PENDING) && !memory.isInactiveEntryLine(l));
function withEnv(vars, fn) {
  const saved = {}; for (const k of Object.keys(vars)) { saved[k] = process.env[k]; if (vars[k] === undefined) delete process.env[k]; else process.env[k] = vars[k]; }
  try { return fn(); } finally { for (const k of Object.keys(saved)) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; } }
}

test('isolation guard: every path this file writes stays under the temp root', () => {
  assert(scratchRoot.startsWith(temp));
  assert(getMemoryDir('scratch', '').startsWith(temp), 'default scratch dir must resolve inside temp OPENCODE_AUTOMATION_HOME');
});

// ---------------------------------------------------------------- hybrid search
test('hybrid search falls back to lexical when no embeddings service is configured', async () => {
  const dir = fresh('hy-lexical');
  appendNote(dir, 'LEX_CANARY 向量检索采用余弦相似度并与词法结果做倒数排名融合', 'tester');
  const cfg = resolveEmbedConfig(dir);
  assert.equal(cfg.enabled, false);
  assert.equal(cfg.reason, 'not_configured');
  const res = await searchMemoryHybrid(dir, '余弦相似度', 5);
  assert.equal(res.mode, 'lexical');
  assert.equal(res.embed_status, 'not_configured');
  assert(res.items.some(i => i.text.includes('LEX_CANARY')));
  assert(!fs.existsSync(path.join(dir, 'search.vec.json')), 'no vector cache without a provider');
  const viaTool = await tool('bridge_memory_recall', { memory_dir: dir, text: '余弦相似度', scope: 'task' }, ctx('bridge:mcp:lex'));
  assert.equal(viaTool.mode, 'lexical');
  assert(viaTool.count >= 1);
});

test('embed config: env wins, keys only from env, embed.json key fields ignored, disable switches honoured (no request is made)', () => {
  const dir = fresh('hy-config');
  fs.writeFileSync(path.join(dir, 'embed.json'), JSON.stringify({ baseUrl: 'http://127.0.0.1:9/v1/', model: 'file-model', apiKey: 'MUST_NOT_BE_USED' }));
  const fromFile = resolveEmbedConfig(dir);
  assert.equal(fromFile.enabled, true);
  assert.equal(fromFile.endpoint, 'http://127.0.0.1:9/v1/embeddings');
  assert.equal(fromFile.model, 'file-model');
  assert.equal(fromFile.key, '', 'a key in embed.json is never used');
  assert(fromFile.warnings.some(w => w.includes('apiKey')));
  const fromEnv = withEnv({ OPENCODE_MEMORY_EMBED_URL: 'http://127.0.0.1:9/custom/embeddings', OPENCODE_MEMORY_EMBED_MODEL: 'env-model', OPENCODE_MEMORY_EMBED_KEY: 'env-key' }, () => resolveEmbedConfig(dir));
  assert.equal(fromEnv.endpoint, 'http://127.0.0.1:9/custom/embeddings');
  assert.equal(fromEnv.model, 'env-model');
  assert.equal(fromEnv.key, 'env-key');
  assert.equal(fromEnv.source, 'env');
  assert.equal(withEnv({ OPENCODE_MEMORY_EMBED: '0' }, () => resolveEmbedConfig(dir)).reason, 'disabled');
  assert.equal(withEnv({ OPENCODE_MEMORY_EMBED_URL: 'ftp://x', OPENCODE_MEMORY_EMBED_MODEL: 'm' }, () => resolveEmbedConfig(dir)).reason, 'invalid_url');
  fs.writeFileSync(path.join(dir, 'embed.json'), JSON.stringify({ enabled: false, baseUrl: 'http://127.0.0.1:9', model: 'm' }));
  assert.equal(resolveEmbedConfig(dir).reason, 'disabled');
});

// Deterministic concept embedder: paraphrases share concept dimensions, but no lexical token.
const CONCEPTS = [['nightly', 'evening', 'night', 'overnight'], ['pushes', 'uploads', 'push', 'upload', 'ships'], ['artifacts', 'binaries', 'builds'], ['button', 'color', 'grey'], ['invoice', 'tax', 'rounding']];
const fakeEmbed = async inputs => inputs.map(text => {
  const v = new Array(CONCEPTS.length + 1).fill(0); v[CONCEPTS.length] = 0.05;
  for (const w of String(text).toLowerCase().match(/[a-z]+/g) || []) CONCEPTS.forEach((group, i) => { if (group.includes(w)) v[i] += 1; });
  return v;
});

test('injected embedder: RRF surfaces a paraphrase that lexical search misses; cache is incremental and text-free', async () => {
  const dir = fresh('hy-rrf');
  appendNote(dir, 'PARA_TARGET nightly pipeline pushes artifacts to the mirror host', 'tester');
  appendNote(dir, 'UI_NOTE button color changed to grey', 'tester');
  appendNote(dir, 'TAX_NOTE invoice tax rounding rule', 'tester');
  const query = 'evening uploads binaries';
  const lexical = searchMemory(dir, query, 10);
  assert.equal(lexical.count, 0, 'precondition: the paraphrase query shares no lexical token with any entry');
  const hy = await searchMemoryHybrid(dir, query, 5, { embedder: fakeEmbed });
  assert.equal(hy.mode, 'hybrid');
  assert.equal(hy.embed_status, 'ok');
  assert(hy.items.length >= 1);
  assert(hy.items[0].text.includes('PARA_TARGET'), JSON.stringify(hy.items.slice(0, 3)));
  assert.equal(hy.items[0].match, 'vector');
  assert.equal(typeof hy.items[0].rrf, 'number');
  assert(!hy.items.some(i => i.text.includes('UI_NOTE') || i.text.includes('TAX_NOTE')), 'unrelated entries stay below minVecSim');
  const cacheFile = path.join(dir, 'search.vec.json');
  assert(fs.existsSync(cacheFile));
  assert(!fs.readFileSync(cacheFile, 'utf8').includes('PARA_TARGET'), 'vector cache stores hashes and vectors, never entry text');
  const both = await searchMemoryHybrid(dir, 'mirror evening', 5, { embedder: fakeEmbed });
  assert(both.items[0].text.includes('PARA_TARGET'));
  assert.equal(both.items[0].match, 'both');
  assert.equal(both.embedded_now, 0, 'second query reuses cached document vectors');
});

test('a failing embedder degrades to lexical with a fallback status', async () => {
  const dir = fresh('hy-fail');
  appendNote(dir, 'FAIL_CANARY 余弦相似度', 'tester');
  const res = await searchMemoryHybrid(dir, '余弦相似度', 5, { embedder: async () => { throw new Error('EMBED_TIMEOUT'); } });
  assert.equal(res.mode, 'lexical');
  assert.match(res.embed_status, /^fallback:/);
  assert(res.items.some(i => i.text.includes('FAIL_CANARY')));
});

// ---------------------------------------------------------------- consolidate
function seedDuplicates(dir) {
  appendNote(dir, 'DUP_CANARY 重复条目内容一二三四五', 'tester');
  fs.appendFileSync(path.join(dir, 'NOTES.md'), '- [2026-01-01 10:00] (@x) DUP_CANARY 重复条目内容一二三四五\n', 'utf8');
  appendNote(dir, 'NEARDUP 记忆整合需要合并近似重复条目并且保留最新的版本记录', 'tester');
  appendNote(dir, 'NEARDUP 记忆整合需要合并近似重复条目并且保留最新版本记录', 'tester');
  appendNote(dir, '数据库选型：使用 SQLite 单文件', 'tester');
  appendNote(dir, '数据库选型：改用 Postgres 集群', 'tester');
}

test('consolidate dry-run previews without touching files; apply rewrites with backup and removed-lines log', async () => {
  const dir = fresh('consolidate');
  seedDuplicates(dir);
  const before = read(dir, 'NOTES.md'), beforeMd5 = md5(dir, 'NOTES.md'), rev0 = readState(dir).revision;
  const c = ctx('bridge:mcp:consolidate');
  const dry = await tool('bridge_memory_consolidate', { memory_dir: dir }, c);
  assert.equal(dry.dry_run, true);
  assert.equal(dry.applied, false);
  assert(dry.summary.exact >= 1 && dry.summary.near >= 1 && dry.summary.superseded >= 1, JSON.stringify(dry.summary));
  assert.equal(md5(dir, 'NOTES.md'), beforeMd5, 'dry-run must not modify NOTES.md');
  assert.equal(readState(dir).revision, rev0, 'dry-run must not bump the revision');
  assert(!fs.readdirSync(path.join(dir, 'archive')).some(n => n.startsWith('consolidate-backup-')));
  const stale = await tool('bridge_memory_consolidate', { memory_dir: dir, apply: true, expected_revision: rev0 - 1 }, c);
  assert.equal(stale.ok, false);
  assert.equal(stale.error_code, 'MEMORY_REVISION_CONFLICT');
  assert.equal(md5(dir, 'NOTES.md'), beforeMd5);
  const applied = await tool('bridge_memory_consolidate', { memory_dir: dir, apply: true, expected_revision: rev0 }, c);
  assert.equal(applied.applied, true);
  assert.equal(fs.readFileSync(path.join(applied.backup_dir, 'NOTES.md'), 'utf8'), before, 'backup holds the exact pre-apply bytes');
  assert(applied.removed_file && fs.existsSync(applied.removed_file));
  const after = read(dir, 'NOTES.md');
  assert.equal(after.split('DUP_CANARY').length, 2, 'exact duplicate merged to one line');
  assert.equal(after.split('NEARDUP').length, 2, 'near duplicate merged to one line');
  assert.match(after, /\[已被取代→#[0-9a-f]{8}/);
  assert(readState(dir).revision > rev0);
});

test('superseded and out-of-validity entries are skipped by brief and search, but kept on disk and reachable with include_inactive', async () => {
  const dir = fresh('validity');
  appendNote(dir, '数据库选型：使用 SQLite 单文件', 'tester');
  appendNote(dir, '数据库选型：改用 Postgres 集群', 'tester');
  appendNote(dir, 'SUBJ_OLD 缓存 TTL 设为 60 秒', 'tester', '', { subject: '缓存策略' });
  appendNote(dir, 'SUBJ_NEW 缓存 TTL 改为 300 秒', 'tester', '', { subject: '缓存策略' });
  consolidateMemory(dir, { apply: true }, 'tester');
  const c = ctx('bridge:mcp:validity');
  await tool('bridge_memory_append', { memory_dir: dir, kind: 'note', text: 'EXPIRED_CANARY 临时调试端口', valid_until: '2020-01-01' }, c);
  await tool('bridge_memory_append', { memory_dir: dir, kind: 'note', text: 'FUTURE_CANARY 下季度才生效', valid_from: '2999-01-01' }, c);
  await tool('bridge_memory_append', { memory_dir: dir, kind: 'note', text: 'LIVE_CANARY 长期有效', valid_from: '2020-01-01', valid_until: '2999-12-31' }, c);
  const b = brief(dir);
  assert(!b.includes('使用 SQLite 单文件') && b.includes('改用 Postgres 集群'));
  assert(!b.includes('SUBJ_OLD') && b.includes('SUBJ_NEW'));
  assert(!b.includes('EXPIRED_CANARY') && !b.includes('FUTURE_CANARY') && b.includes('LIVE_CANARY'));
  assert(!searchMemory(dir, 'SQLite').items.some(i => i.text.includes('使用 SQLite 单文件')));
  assert(searchMemory(dir, 'SQLite', 15, { includeInactive: true }).items.some(i => i.text.includes('使用 SQLite 单文件')));
  for (const canary of ['EXPIRED_CANARY', 'FUTURE_CANARY']) {
    assert.equal((await tool('bridge_memory_recall', { memory_dir: dir, text: canary, scope: 'task' }, c)).count, 0, canary);
    assert((await tool('bridge_memory_recall', { memory_dir: dir, text: canary, scope: 'task', include_inactive: true }, c)).count >= 1, canary);
  }
  assert(read(dir, 'NOTES.md').includes('EXPIRED_CANARY'), 'inactive entries are filtered, never deleted');
  await assert.rejects(tool('bridge_memory_append', { memory_dir: dir, kind: 'note', text: 'x', valid_until: 'tomorrow' }, c), /MEMORY_VALIDITY_INVALID/);
  await assert.rejects(tool('bridge_memory_append', { memory_dir: dir, kind: 'note', text: 'x', valid_from: '2030-01-02', valid_until: '2030-01-01' }, c), /MEMORY_VALIDITY_RANGE/);
});

// ---------------------------------------------------------------- auto-extract + confirm
const HANDOFF_FIELDS = {
  stage: '记忆优化',
  done: ['实现记忆整合工具 consolidate'],
  todo: ['补齐 README'],
  next: ['补充 consolidate 的 dry-run 预览说明'],
  constraints: ['禁止自动 git commit，由协调者决定'],
  summary: '决定采用倒数排名融合合并词法与向量结果'
};

test('handoff auto-extracts [自动·待确认] candidates without applying them; confirm moves them to their ledgers', async () => {
  const dir = fresh('auto');
  appendRequirement(dir, '实现记忆整合工具 consolidate', '待办', 'tester');
  const c = ctx('bridge:mcp:auto');
  const ho = await tool('bridge_memory_handoff', { memory_dir: dir, ...HANDOFF_FIELDS }, c);
  assert(ho.auto_candidates >= 3, JSON.stringify(ho.auto_candidate_items || ho));
  const pending = activePending(dir);
  assert(pending.some(l => l.includes('约束：')) && pending.some(l => l.includes('决策：')) && pending.some(l => l.includes('需求状态：')), pending.join('\n'));
  assert(read(dir, 'REQUIREMENTS.md').includes('[待办]') && !read(dir, 'REQUIREMENTS.md').includes('[已完成]'), 'candidates are not applied before confirmation');
  assert(!read(dir, 'DECISIONS.md').includes('倒数排名融合'));
  const b = brief(dir), at = s => b.indexOf(s);
  assert(at('===== 待确认（') > at('===== 活跃与近期需求') && at('===== 待确认（') < (at('===== 随手记摘要') >= 0 ? at('===== 随手记摘要') : at('===== HANDOFF.md 其余部分')), 'pending section sits between requirements and notes: '+b.split('\n').filter(l=>l.startsWith('=====')).join(' | '));
  const again = await tool('bridge_memory_handoff', { memory_dir: dir, ...HANDOFF_FIELDS }, c);
  assert.equal(again.auto_candidates, 0, 'repeated handoff does not duplicate candidates');
  const none = await tool('bridge_memory_append', { memory_dir: dir, kind: 'confirm', text: 'NO_SUCH_KEYWORD_777' }, c);
  assert.equal(none.confirmed, 0);
  await assert.rejects(tool('bridge_memory_append', { memory_dir: dir, kind: 'confirm', text: '' }, c), /MEMORY_EMPTY_KEYWORD/);
  const conf = await tool('bridge_memory_append', { memory_dir: dir, kind: 'confirm', text: '*' }, c);
  assert(conf.confirmed >= 3, JSON.stringify(conf));
  assert(read(dir, 'REQUIREMENTS.md').includes('[已完成]'));
  assert(read(dir, 'DECISIONS.md').includes('倒数排名融合'));
  assert.equal(activePending(dir).length, 0);
  assert(read(dir, 'NOTES.md').split('\n').some(l => l.includes('禁止自动 git commit') && !l.includes(PENDING) && !memory.isInactiveEntryLine(l)), 'confirmed constraint stays as an ordinary active note');
});

test('extract_facts=false and boilerplate-only handoffs create no candidates', async () => {
  const off = fresh('auto-off');
  appendRequirement(off, '实现记忆整合工具 consolidate', '待办', 'tester');
  assert.equal((await tool('bridge_memory_handoff', { memory_dir: off, ...HANDOFF_FIELDS, extract_facts: false }, ctx('bridge:mcp:off'))).auto_candidates, 0);
  assert.equal(activePending(off).length, 0);
  const generic = fresh('auto-generic');
  const out = handoffMemory(generic, { stage: '最近任务已完成：x', done: ['x'], next: ['核查并衔接已完成任务「x」的后续需求'], auto: true, force: true }, 'bridge:mcp:auto-test');
  assert.equal(out.auto_candidates, 0);
  assert.equal(confirmAutoEntries(generic, '*', 'tester').confirmed, 0);
});

// ---------------------------------------------------------------- workspace scope
test('workspace scope: brief shows another actor\'s handoff next-steps but not its private notes; writes stay in own slot', async () => {
  const wsRoot = path.join(temp, `ws-scope-${++seq}`); fs.mkdirSync(wsRoot, { recursive: true });
  const projDir = getMemoryDir(wsRoot); ensureMemoryDir(projDir);
  const taskA = path.join(projDir, 'actors', 'aaaa', 'tasks', 'ta'); ensureMemoryDir(taskA);
  const taskB = path.join(projDir, 'actors', 'bbbb', 'tasks', 'tb'); ensureMemoryDir(taskB);
  const ctxA = ctx('bridge:mcp:a', { currentWorkspaceRoot: () => wsRoot });
  const ctxB = ctx('bridge:mcp:b', { currentWorkspaceRoot: () => wsRoot });
  await tool('bridge_memory_append', { memory_dir: taskA, kind: 'note', text: 'A_PRIVATE_NOTE_313 上一棒的私有结论' }, ctxA);
  const ho = await tool('bridge_memory_handoff', { memory_dir: taskA, stage: 'A 阶段', done: ['完成 a.mjs'], todo: ['b.mjs 未改'], next: ['WS_NEXT_626 继续处理 b.mjs'], workspace_root: wsRoot, verified: ['未验证'], extract_facts: false }, ctxA);
  assert.equal(ho.ok, true);
  const aNotes = md5(taskA, 'NOTES.md'), aHandoff = md5(taskA, 'HANDOFF.md');

  const ws = await tool('bridge_memory_brief', { memory_dir: taskB }, ctxB);
  assert.equal(ws.scope, 'workspace', 'default scope is workspace when a workspace root is known');
  assert.equal(path.resolve(ws.memory_dir), path.resolve(taskB));
  assert(ws.brief.includes('WS_NEXT_626'), ws.brief.slice(0, 1200));
  // 长期记忆同步（project-memory mirrorToProjectRoot）：私有目录里的 note 会同步到记忆根，作为「项目长期记忆」出现在同一工作区的简报里；
  // 除此之外不能以私有笔记的形式泄露。
  if (ws.brief.includes('A_PRIVATE_NOTE_313')) {
    const lt = ws.brief.indexOf('项目长期记忆');
    assert(lt >= 0 && ws.brief.indexOf('A_PRIVATE_NOTE_313') > lt, 'another actor\'s note only appears via the long-term memory section');
  }
  const viaRoot = await tool('bridge_memory_brief', { memory_dir: taskB, workspace_root: wsRoot }, ctx('bridge:mcp:b2'));
  assert(viaRoot.brief.includes('WS_NEXT_626'), 'explicit workspace_root works without a host workspace');
  const taskScope = await tool('bridge_memory_brief', { memory_dir: taskB, scope: 'task' }, ctxB);
  assert.equal(taskScope.scope, 'task');
  assert(!taskScope.brief.includes('WS_NEXT_626'), 'scope:"task" restores the old per-task behaviour');

  const recallTask = await tool('bridge_memory_recall', { memory_dir: taskB, text: 'A_PRIVATE_NOTE_313', scope: 'task' }, ctxB);
  assert.equal(recallTask.count, 0);
  // Designed behaviour (memory REPORT/selftest): workspace-scope recall/search may read sibling entries
  // read-only, labelled with their source. Pinned here so a change is noticed.
  const recallWs = await tool('bridge_memory_recall', { memory_dir: taskB, text: 'A_PRIVATE_NOTE_313' }, ctxB);
  assert.equal(recallWs.scope, 'workspace');
  assert(recallWs.count >= 1 && recallWs.items.every(i => i.source));

  assert(!read(taskB, 'NOTES.md').includes('A_PRIVATE_NOTE_313') && !read(taskB, 'HANDOFF.md').includes('WS_NEXT_626'), 'reads never copy into the caller slot');
  assert.equal(md5(taskA, 'NOTES.md'), aNotes);
  assert.equal(md5(taskA, 'HANDOFF.md'), aHandoff);
});

// ---------------------------------------------------------------- brief layout
test('brief section order: PINNED → handoff next/unfinished → requirements → notes', () => {
  const dir = fresh('order');
  appendPin(dir, 'ORDER_PIN_1 固定约束', 'tester');
  appendNote(dir, 'ORDER_NOTE_1 普通随手记', 'tester');
  appendRequirement(dir, 'ORDER_REQ_1 活跃需求', '待办', 'tester');
  handoffMemory(dir, { stage: 'S', done: ['d'], todo: ['ORDER_TODO_1 未完成项'], next: ['ORDER_NEXT_1 在 c.mjs 继续'], extract_facts: false }, 'tester');
  const b = brief(dir), at = s => b.indexOf(s);
  for (const k of ['ORDER_PIN_1', 'ORDER_NEXT_1', 'ORDER_TODO_1', 'ORDER_REQ_1', 'ORDER_NOTE_1']) assert(at(k) >= 0, k);
  assert(at('ORDER_PIN_1') < at('ORDER_NEXT_1'));
  assert(at('ORDER_NEXT_1') < at('ORDER_REQ_1'));
  assert(at('ORDER_REQ_1') < at('ORDER_NOTE_1'));
  assert.equal(b.split('\n').filter(l => l.includes('现在看到的')).length, 1, 'observation header is compressed to one section');
  assert(b.split('\n').length <= 230);
});

test('PINNED and handoff next-steps survive the smallest cap (20 lines) even with many notes and requirements', () => {
  const dir = fresh('tiny-cap');
  appendPin(dir, 'CAP_PIN_1 只读运行目录 E:/OpenCode', 'tester');
  appendPin(dir, 'CAP_PIN_2 不要 git push', 'tester');
  for (let i = 0; i < 40; i++) appendNote(dir, `CAP_FILLER_NOTE_${i} 填充随手记 ${i}`, 'tester');
  for (let i = 0; i < 15; i++) appendRequirement(dir, `CAP_FILLER_REQ_${i} 填充需求 ${i}`, '待办', 'tester');
  handoffMemory(dir, { stage: 'S', done: ['d'], todo: ['CAP_TODO_1'], next: ['CAP_NEXT_1 在 d.mjs 继续'], extract_facts: false }, 'tester');
  for (const cap of [20, 30]) {
    const b = brief(dir, cap), lines = b.split('\n');
    assert(lines.length <= cap, `cap ${cap}: ${lines.length} lines`);
    assert(b.includes('CAP_PIN_1') && b.includes('CAP_PIN_2'), `cap ${cap}: pins kept\n${b}`);
    assert(b.includes('CAP_NEXT_1'), `cap ${cap}: next step kept\n${b}`);
  }
  const clamped = brief(dir, 5).split('\n');
  assert(clamped.length <= 20, 'max_lines below 20 is clamped to 20');
});

test.after(() => { fs.rmSync(temp, { recursive: true, force: true }); });
