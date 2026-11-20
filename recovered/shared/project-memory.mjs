import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { withResourceLocks } from './concurrency-runtime.mjs';

/**
 * OpenCode 轻量档案袋记忆引擎 v2.0（严格对齐 CODEX v1.9.1 架构规范，独立隔离于 .opencode-project / scratch-memory）
 *
 * 核心原则：
 * 1. 严格双轨隔离：项目记忆仅使用 <workspaceRoot>/.opencode-project；临时/整机 MCP 记忆仅使用共享目录 scratch-memory。
 *    严禁读取、写入或混用 .codex-project。
 * 2. 开工上下文封顶：brief 输出严格 <= 230 行，支持 HANDOFF 损坏自动回退 archive/handoff-good.md，
 *    以及 HANDOFF 过期自动附带「断层补充」（<= 12 条新记录）。
 * 3. 机械安全归档：每次写入自动触发 autocap（WORKLOG>300 留 200，REQUIREMENTS>150 留 100 且绝不归档 [待办]/[进行中]，
 *    NOTES>200 自动移走 [已作废]），归档至 archive/*-自动归档-YYYYMM.md，零误删。
 * 4. 缓存倒排索引召回：ASCII 词元 + 中文二元切词（bigram）+ 18 组内置中英同义词 + synonyms.txt 自定义同义词 +
 *    search.idx.json 签名缓存 + IDF/覆盖率/文件权重/时间衰减排序，排除 [已作废] 条目。
 * 5. 会话增量追踪：同一会话首次下发完整 brief，无变更不重发，有新写入仅下发 delta。
 * 6. step02：PINNED.md 固定在场集（brief 首段、不依赖检索）；检索加入 BM25 行长归一；交接单对
 *    「已完成」无验证证据、并行槽位改动同一文件给出显式提示。
 * 7. step03：可选语义向量混合检索（OpenAI 兼容 /embeddings，零依赖，int8 向量缓存 search.vec.json，RRF 融合，
 *    未配置/失败/超时静默回退词法并标注 mode）；索引增加中文三元切词（降权）。
 * 8. step03：交接与任务卡归档自动提取决策/约束/需求状态候选，写为 [自动·待确认]，brief 单列「待确认」，kind=confirm 确认。
 * 9. step03：consolidate 全文件精确/近似去重、主题取代标记 [已被取代→…]、行内有效期后缀 〔有效期 起~止〕；
 *    brief 与检索默认跳过已取代/已过期条目。
 * 10. step03：scope=task|workspace|all 统一解析工作区视图（项目记忆 + 各执行者最新检查点/交接，只读按来源标注）；
 *    brief 分节预算重排，重要分节不再被元信息挤掉。
 */

export const MEMORY_ENGINE_VERSION = '2.2.0-codex191-collab-hybrid';

const inProcessMemoryQueues = new Map();

/**
 * 双层互斥记忆写锁：
 * 1) 进程内按规范化目录 FIFO Promise 串行排队（微秒级无端口竞争）
 * 2) 跨进程通过 concurrency-runtime 的内核独占回环监听锁协调（进程崩溃自动释放）
 */
export async function withMemoryLock(memoryDir, fn, signal) {
  const resolved = validateTargetPath(memoryDir);
  fs.mkdirSync(resolved, { recursive: true });
  const queueKey = process.platform === 'win32' ? resolved.toLowerCase() : resolved;
  const lockFile = path.join(resolved, '.memory.lock');
  const prior = inProcessMemoryQueues.get(queueKey) || Promise.resolve();
  let releaseQueue;
  const gate = new Promise(resolve => { releaseQueue = resolve; });
  const tail = prior.then(() => gate, () => gate);
  inProcessMemoryQueues.set(queueKey, tail);
  await prior.catch(() => {});
  try {
    return await withResourceLocks([lockFile], fn, signal);
  } finally {
    releaseQueue();
    if (inProcessMemoryQueues.get(queueKey) === tail) {
      inProcessMemoryQueues.delete(queueKey);
    }
  }
}

/**
 * 规范化多模型/多会话协作者标识（脱敏、文件名安全、稳定可读）。
 */
export function normalizeActor(owner = 'unknown', slotOverride = '') {
  const explicit = String(slotOverride || '').trim();
  if (explicit) {
    const cleanLabel = explicit.replace(/[\r\n\t]/g, ' ').trim().slice(0, 40);
    const ascii = cleanLabel.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 28);
    const suffix = crypto.createHash('sha256').update(cleanLabel).digest('hex').slice(0, 6);
    const slot = ascii && ascii.length >= 2 ? ascii : `slot-${suffix}`;
    return { slot, label: cleanLabel };
  }
  const raw = String(owner || 'unknown').trim();
  if (!raw || raw === 'unknown') return { slot: 'anon', label: 'anon' };
  const branchMatch = raw.match(/^native-chat:([^:]+):(branch|merge):([^:]+):(.+)$/);
  if (branchMatch) {
    const kind = branchMatch[2];
    const variantShort = branchMatch[4].replace(/[^a-zA-Z0-9._-]+/g, '-').slice(0, 18);
    const hash6 = crypto.createHash('sha256').update(raw).digest('hex').slice(0, 6);
    return { slot: `${kind}-${hash6}`, label: `${kind}:${variantShort}` };
  }
  if (raw.startsWith('native-chat:')) {
    const idPart = raw.slice('native-chat:'.length).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 8) || 'local';
    return { slot: `chat-${idPart}`, label: `chat-${idPart}` };
  }
  if (raw.startsWith('bridge:mcp:')) {
    const rest = raw.slice('bridge:mcp:'.length);
    const sessPart = rest.split(':')[0].replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 8) || 'mcp';
    if (rest.includes(':assistant-source:')) {
      const h = crypto.createHash('sha256').update(raw).digest('hex').slice(0, 6);
      return { slot: `mcp-${sessPart}-${h}`, label: `mcp-${sessPart}` };
    }
    return { slot: `mcp-${sessPart}`, label: `mcp-${sessPart}` };
  }
  const clean = raw.replace(/[^a-zA-Z0-9_.-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24);
  if (clean.length >= 2) return { slot: clean.toLowerCase(), label: clean };
  const h = crypto.createHash('sha256').update(raw).digest('hex').slice(0, 8);
  return { slot: `actor-${h}`, label: `actor-${h}` };
}

/**
 * 临时模式（scratch-memory）多模型会话桶 ID 推导：
 * - 不同 MCP 会话 / 不同侧边栏对话线程拥有各自独立的物理子目录，彻底杜绝并发串味；
 * - 同一侧边栏对话内的多模型分支共享该对话线程桶。
 */
export function deriveScratchSessionBucketId(owner = 'default') {
  const raw = String(owner || '').trim();
  if (!raw || raw === 'default' || raw === 'preview-stateless') return 'sess-preview';
  if (raw.startsWith('native-chat:')) {
    const threadBase = raw.split(':branch:')[0].split(':merge:')[0];
    const uuidPart = threadBase.slice('native-chat:'.length).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 12);
    const hash6 = crypto.createHash('sha256').update(threadBase).digest('hex').slice(0, 6);
    return `sess-chat-${uuidPart || hash6}`;
  }
  if (raw.startsWith('bridge:mcp:')) {
    const sessUuid = raw.slice('bridge:mcp:'.length).split(':')[0].replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 12);
    const hash6 = crypto.createHash('sha256').update(raw).digest('hex').slice(0, 6);
    return `sess-mcp-${sessUuid || 'ext'}-${hash6}`;
  }
  const safe = raw.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 16);
  const hash8 = crypto.createHash('sha256').update(raw).digest('hex').slice(0, 8);
  return `sess-${safe || 'ext'}-${hash8}`;
}

export function sanitizeScratchTopicId(topic) {
  const clean = String(topic || '').replace(/[\r\n\t]/g, ' ').trim().slice(0, 80);
  if (!clean) throw new Error('SCRATCH_TOPIC_EMPTY: 临时协作主题名不能为空。');
  const ascii = clean.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 28);
  const hash8 = crypto.createHash('sha256').update(clean).digest('hex').slice(0, 8);
  const bucketId = ascii && ascii.length >= 2 ? `topic-${ascii}-${hash8.slice(0, 4)}` : `topic-${hash8}`;
  return { bucketId, title: clean };
}

export function resolveScratchBucketDir(scratchRoot, { owner = 'default', scratchId = '', topic = '' } = {}) {
  const rootResolved = validateTargetPath(scratchRoot);
  fs.mkdirSync(rootResolved, { recursive: true });
  const explicitId = String(scratchId || '').trim();
  if (explicitId) {
    if (explicitId === 'legacy-root') {
      return { bucketId: 'legacy-root', kind: 'legacy', title: '历史根级临时记忆', dir: rootResolved, scratchRoot: rootResolved };
    }
    if (!/^[a-z0-9][a-z0-9_-]{1,63}$/i.test(explicitId)) {
      throw new Error(`SCRATCH_ID_INVALID: 非法的临时记忆桶 ID "${explicitId}"。`);
    }
    const subFolder = explicitId.startsWith('topic-') ? 'topics' : 'sessions';
    const dir = validateTargetPath(path.join(rootResolved, subFolder, explicitId));
    if (!dir.startsWith(rootResolved + path.sep)) throw new Error('SCRATCH_PATH_ESCAPE: 临时桶路径越界。');
    return { bucketId: explicitId, kind: subFolder === 'topics' ? 'topic' : 'session', title: explicitId, dir, scratchRoot: rootResolved };
  }
  const explicitTopic = String(topic || '').trim();
  if (explicitTopic) {
    const { bucketId, title } = sanitizeScratchTopicId(explicitTopic);
    const dir = validateTargetPath(path.join(rootResolved, 'topics', bucketId));
    return { bucketId, kind: 'topic', title, dir, scratchRoot: rootResolved };
  }
  const bucketId = deriveScratchSessionBucketId(owner);
  const dir = validateTargetPath(path.join(rootResolved, 'sessions', bucketId));
  return { bucketId, kind: 'session', title: `会话私有桶 (${bucketId})`, dir, scratchRoot: rootResolved };
}

export const LIMITS = {
  'AGENTS.md': 60,
  'INDEX.md': 40,
  'HANDOFF.md': 150,
  'NOTES.md': 200,
  'PINNED.md': 25
};

export const SYNONYM_GROUPS = [
  ['登录', 'login', 'auth', '鉴权', '认证', 'token'],
  ['数据库', 'db', 'database', 'sql', 'sqlite', 'mysql', 'postgres'],
  ['缓存', 'cache', 'redis'],
  ['前端', 'frontend', 'ui', '界面', '页面', '样式', 'css'],
  ['后端', 'backend', 'api', '接口', '服务端', 'server'],
  ['部署', 'deploy', '上线', '发布', 'docker', 'nginx'],
  ['测试', 'test', '单元测试', '集成测试', '自检', 'selftest'],
  ['报错', 'error', 'bug', '异常', '失败', '崩溃', '故障'],
  ['配置', 'config', 'env', '环境变量', '设置', 'settings'],
  ['权限', 'permission', 'role', '角色', '访问控制', 'guard'],
  ['支付', 'pay', 'payment', '订单', '账单'],
  ['记忆', 'memory', '交接', 'handoff', '归档', 'archive', 'recall'],
  ['中转', 'relay', 'mcp', '桥接', '隧道', 'bridge', 'tunnel'],
  ['面板', 'panel', '控制台', 'dashboard', 'workbench'],
  ['性能', 'perf', '慢', '卡顿', '优化', '耗时'],
  ['安全', 'security', '密钥', 'secret', '泄露'],
  ['文档', 'doc', 'readme', '说明'],
  ['备份', 'backup', '快照', '回滚', '恢复', 'checkpoint'],
  ['打包', 'build', 'package', 'packaging', '构建', '编译', 'bundle'],
  ['规则', 'rule', 'rules', '约束', '规范', 'policy', '要求'],
  ['提交', 'commit', 'git', 'push', '推送'],
  ['任务', 'task', 'todo', '待办', '进度', 'progress']
];

const FILE_WEIGHTS = {
  'HANDOFF.md': 1.5,
  'DECISIONS.md': 1.4,
  'NOTES.md': 1.3,
  'REQUIREMENTS.md': 1.1
};

const VALID_GATES = new Set(['off', 'warn', 'block']);
const ACTIVE_REQ_TAGS = ['[待办]', '[进行中]'];
// Structured "where exactly" facts a successor needs; free text alone loses them.
const HANDOFF_LOCATION_FIELDS = [
  ['workspace_root', '工作区'],
  ['git_branch', 'Git 分支'],
  ['git_commit', 'Git 提交'],
  ['artifacts', '产物'],
  ['uncommitted', '未提交/未同步状态'],
  ['verified', '验证状态'],
  ['constraints', '约束与授权']
];
// Generic lines produced by automatic archiving; they do not tell a successor what to do.
const GENERIC_NEXT_PATTERNS = [/^核查并衔接已完成任务/, /^基于最近进展继续推进或验收/, /^明确下一阶段任务目标/];
function isGenericNextLine(body) {
  return GENERIC_NEXT_PATTERNS.some(re => re.test(String(body || '').trim()));
}

// ---- step03 条目元数据：取代标记、有效期后缀、主题标签、自动待确认标签 ----
// 全部为行内格式：前缀标签形如 `- [已被取代→#id 时间] ...`，后缀形如 ` 〔主题:xxx〕 〔有效期 起~止〕`。
// 旧解析（`- [` 开头、首个 [YYYY-MM-DD HH:mm] 为时间、stripEntryPrefix）保持兼容。
const SUPERSEDED_TAG_RE = /^(?:- |## )\[已被取代→[^\]]*\]\s*/;
const OBSOLETE_PREFIXES = ['- [已作废]', '## [已作废]'];
const AUTO_PENDING_TAG = '[自动·待确认]';
const VALIDITY_SUFFIX_RE = /\s*〔有效期\s*(\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2})?)?\s*~\s*(\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2})?)?\s*〕\s*$/;
const SUBJECT_TAG_RE = /\s*〔主题[:：]([^〕]{1,60})〕/;
// Handoff values that carry no durable fact (placeholders and lifecycle-archive wording).
const AUTO_PLACEHOLDER_RE = /^(无|暂无.*|未记录.*|（.*）|\(.*\)|待填写.*|当前阶段推进中|持续推进当前工作区任务|接收并明确首个任务目标.*)$/;
const AUTO_BOILERPLATE_RE = /^(继续处理：|接续检查并推进：|推进待办：|最近任务(已完成|受阻待续|进行中检查点)：|自动归档|（自动采集|交接总结：|步骤进展（模型自报)/;

function normalizeValidityStamp(value) {
  const s = String(value ?? '').trim();
  if (!s) return '';
  const m = s.match(/^(\d{4}-\d{2}-\d{2})(?:[ T](\d{2}:\d{2}))?/);
  if (!m || !Number.isFinite(Date.parse(`${m[1]}T${m[2] || '00:00'}:00`))) {
    throw new Error(`MEMORY_VALIDITY_INVALID: 有效期需为 YYYY-MM-DD 或 YYYY-MM-DD HH:mm（收到 ${s.slice(0, 40)}）。`);
  }
  return m[2] ? `${m[1]} ${m[2]}` : m[1];
}

function validityMs(stamp, endOfDay) {
  if (!stamp) return 0;
  const [d, t] = String(stamp).replace('T', ' ').split(' ');
  const ms = Date.parse(`${d}T${t ? `${t}:00` : (endOfDay ? '23:59:59' : '00:00:00')}`);
  return Number.isFinite(ms) ? ms : 0;
}

/** 生成行内有效期后缀（两端都可省略；都省略时返回空串）。valid_until 只写日期时按当天结束计算。 */
export function formatValiditySuffix(validFrom, validUntil) {
  const from = normalizeValidityStamp(validFrom);
  const until = normalizeValidityStamp(validUntil);
  if (!from && !until) return '';
  if (from && until && validityMs(from, false) > validityMs(until, true)) {
    throw new Error('MEMORY_VALIDITY_RANGE: valid_from 晚于 valid_until。');
  }
  return ` 〔有效期 ${from}~${until}〕`;
}

function formatEntrySuffix(meta = {}) {
  const subject = singleLine(meta?.subject || '', 60).replace(/[〔〕]/g, '').trim();
  return `${subject ? ` 〔主题:${subject}〕` : ''}${formatValiditySuffix(meta?.validFrom, meta?.validUntil)}`;
}

/** 解析一行条目的元数据（作废/被取代/待确认/有效期/主题）。 */
export function parseEntryMeta(line) {
  const raw = String(line || '');
  const vm = raw.match(VALIDITY_SUFFIX_RE);
  const sm = raw.match(SUBJECT_TAG_RE);
  return {
    obsolete: OBSOLETE_PREFIXES.some(p => raw.startsWith(p)),
    superseded: SUPERSEDED_TAG_RE.test(raw),
    pending: raw.includes(AUTO_PENDING_TAG),
    validFromMs: vm ? validityMs(vm[1] || '', false) : 0,
    validUntilMs: vm ? validityMs(vm[2] || '', true) : 0,
    subject: sm ? sm[1].trim() : ''
  };
}

function isMetaInactive(meta, nowMs = Date.now()) {
  return Boolean(meta.obsolete || meta.superseded ||
    (meta.validUntilMs > 0 && meta.validUntilMs < nowMs) ||
    (meta.validFromMs > 0 && meta.validFromMs > nowMs));
}

/** 已作废、已被取代、已过期或尚未生效的条目默认不进入 brief 与检索结果。 */
export function isInactiveEntryLine(line, nowMs = Date.now()) {
  return isMetaInactive(parseEntryMeta(line), nowMs);
}

function stripEntryMeta(text) {
  return String(text || '').replace(VALIDITY_SUFFIX_RE, '').replace(SUBJECT_TAG_RE, '').replace(/\s+/g, ' ').trim();
}

function normalizeForDedupe(text) {
  return String(text || '').toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, '');
}

function tokenJaccardSets(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const t of small) if (large.has(t)) inter += 1;
  return inter / (a.size + b.size - inter);
}

// Token set for duplicate detection: digits count, so "记录 #1" and "记录 #2" are not merged.
function dedupeTokenSet(text) {
  return new Set([...tokenize(text), ...(String(text || '').match(/\d+/g) || []).map(d => `#${d}`)]);
}

function entryTimeText(line) {
  const m = String(line || '').match(/\[(\d{4}-\d{2}-\d{2}(?: \d{2}:\d{2})?)\]/);
  return m ? m[1] : '';
}

function entryIdOf(line) {
  const body = String(line || '').startsWith('## ') ? `- ${String(line).slice(3)}` : line;
  return '#' + crypto.createHash('sha256').update(normalizeForDedupe(stripEntryMeta(stripEntryPrefix(body)))).digest('hex').slice(0, 8);
}
const RELATIVE_DRIVE_RE = /^[A-Za-z]:(?![\\/])/;
const SECRET_PATTERNS = [
  { name: 'api_key', re: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { name: 'github_token', re: /\bgh[pousr]_[A-Za-z0-9]{20,}\b/ },
  { name: 'aws_key', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'jwt_token', re: /\beyJ[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\b/ },
  { name: 'private_tag', re: /<private>[\s\S]*?<\/private>/i },
  { name: 'ephemeral_tunnel', re: /\b[a-z0-9-]+\.(?:ngrok-free\.app|ngrok\.io|trycloudflare\.com)\b/i }
];

const DEFAULT_TEMPLATES = {
  'AGENTS.md': `# 项目铁律与记忆规范（.opencode-project）
- 记忆红线：每次开工只自动注入 \`AGENTS.md\` + \`INDEX.md\` + \`HANDOFF.md\` + 活跃随手记/需求（总计 <=230 行），严禁无故全量扫描历史日志。
- 按需深挖：遇到具体历史模块、决策或上下文缺失时，优先调用 \`bridge_memory_recall\` 或 \`bridge_memory_search\` 按关键词精确召回。
- 随手记更新：发现重要结论、新需求、架构变更或排障经验，及时用 \`bridge_memory_append\`（note/req/decide/log）写入；过时结论用 \`bridge_memory_forget\` 标记 \`[已作废]\`，不物理删改历史。
- 严格隔离：项目记忆仅存于当前工作区 \`.opencode-project/\`，临时/整机 MCP 记忆存于 \`scratch-memory\`；严禁读写 \`.codex-project\`。
- 换班交接：任务完成、受阻或对话过长前，调用 \`bridge_memory_handoff\` 更新 \`HANDOFF.md\` 的「下一步（接班必看）」，确保零断层续接。
- 固定在场：身份、硬约束、当前承诺用 \`bridge_memory_append\` kind=pin 钉入 PINNED.md（上限 25 条，每次开工随 brief 首段注入），过时用 kind=unpin 作废。
- 检索范围：\`bridge_memory_search\` / \`bridge_memory_recall\` 默认 scope=workspace（只读合并本工作区项目记忆与其他执行者最新检查点/交接，逐条标注来源），scope=task 只查本槽位，scope=all 再加全部临时桶；配置 OPENCODE_MEMORY_EMBED_URL/MODEL（密钥仅用环境变量 OPENCODE_MEMORY_EMBED_KEY）后自动启用语义混合检索（mode=hybrid），未配置或超时回退 lexical。
- 自动待确认：交接与任务卡归档会把决策、约束、需求状态变化提取为 \`[自动·待确认]\` 随手记；核实后用 \`bridge_memory_append\` kind=confirm（text=关键词）确认，错误的用 \`bridge_memory_forget\` 作废。
- 整理去重：\`bridge_memory_consolidate\` 合并重复/近似条目并标记被取代的旧结论（默认 dry-run 预览，apply=true 才写入并在 archive/ 留备份）；有时效的条目在 append 时附 valid_from/valid_until，过期后 brief 与检索默认跳过。
`,
  'INDEX.md': `# 记忆路由地图
- 需求台账（待办/进行中/已完成） -> 查阅 \`REQUIREMENTS.md\`
- 架构与设计决策（为什么这么改） -> 查阅 \`DECISIONS.md\`
- 随手记与长期约束（排障经验/雷区） -> 查阅 \`NOTES.md\`
- 流水工作日志（历次改动记录） -> 查阅 \`WORKLOG.md\`
- 当前换班交接单（接班必看） -> 查阅 \`HANDOFF.md\`
- 历史交接包与月度自动归档 -> 查阅 \`archive/\`
`,
  'HANDOFF.md': `# 当前交接单（HANDOFF）

## 当前阶段
- 初始阶段（记忆档案袋已就绪）

## 已完成
- （暂无记录）

## 未完成
- （暂无记录）

## 下一步（接班必看）
- 接收并明确首个任务目标，按需记录需求与关键决策

## 风险与卡点
- 无

## 最近改动文件
- 无
`,
  'REQUIREMENTS.md': `# 需求与待办台账（REQUIREMENTS）\n`,
  'DECISIONS.md': `# 架构与技术决策（DECISIONS）\n`,
  'NOTES.md': `# 随手记与经验备忘（NOTES）\n`,
  'WORKLOG.md': `# 工作进展流水账（WORKLOG）\n`,
  'synonyms.txt': `# 自定义同义词表（每行一组，逗号分隔，例如：订单,order,checkout）\n`
};

function nowIso() {
  return new Date().toISOString();
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function nowHuman(date = new Date()) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function compactStamp(date = new Date()) {
  return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}-${pad2(date.getHours())}${pad2(date.getMinutes())}`;
}

function monthStamp(date = new Date()) {
  return `${date.getFullYear()}${pad2(date.getMonth() + 1)}`;
}

function timeOnlyStamp(date = new Date()) {
  return `${pad2(date.getHours())}${pad2(date.getMinutes())}${pad2(date.getSeconds())}`;
}

function normalizeText(value, maxLen = 4000) {
  return String(value ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().slice(0, maxLen);
}

function singleLine(value, maxLen = 1000) {
  return normalizeText(value, maxLen).replace(/\n+/g, ' ； ');
}

function splitLines(text) {
  const clean = String(text ?? '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (!clean) return [];
  const arr = clean.split('\n');
  if (arr.length > 0 && arr[arr.length - 1] === '') arr.pop();
  return arr;
}

/**
 * 校验目标路径合法性：拦截类似 D:Project 缺少斜杠的盘符相对路径，并禁止指向 .codex-project。
 */
export function validateTargetPath(targetPath) {
  const raw = String(targetPath ?? '').trim();
  if (!raw) throw new Error('MEMORY_PATH_EMPTY: 记忆目录路径不能为空。');
  if (RELATIVE_DRIVE_RE.test(raw)) {
    throw new Error(`MEMORY_PATH_RELATIVE_DRIVE: 拒绝盘符相对路径 "${raw}"（必须在盘符冒号后加斜杠，如 D:/Project）。`);
  }
  const normalized = raw.replace(/\\/g, '/').toLowerCase();
  if (normalized.endsWith('/.codex-project') || normalized.includes('/.codex-project/')) {
    throw new Error('MEMORY_CODEX_ISOLATION: OpenCode 记忆系统严格使用 .opencode-project，禁止读写 .codex-project。');
  }
  return path.resolve(raw);
}

function writeAtomic(filePath, content) {
  const resolved = validateTargetPath(filePath);
  const dir = path.dirname(resolved);
  fs.mkdirSync(dir, { recursive: true });
  const tmp = path.join(dir, `.${path.basename(resolved)}.${process.pid}.${crypto.randomUUID().slice(0, 8)}.tmp`);
  try {
    fs.writeFileSync(tmp, content, 'utf8');
    try {
      fs.renameSync(tmp, resolved);
    } catch (err) {
      if (err && (err.code === 'EEXIST' || err.code === 'EPERM' || err.code === 'EACCES')) {
        try { fs.rmSync(resolved, { force: true }); } catch {}
        fs.renameSync(tmp, resolved);
      } else {
        throw err;
      }
    }
  } finally {
    if (fs.existsSync(tmp)) {
      try { fs.rmSync(tmp, { force: true }); } catch {}
    }
  }
}

function readUtf8Safe(filePath, fallback = '') {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');
  } catch {
    return fallback;
  }
}

function parseEntryTimestampMs(line) {
  const m = String(line || '').match(/\[(\d{4}-\d{2}-\d{2})(?:\s+(\d{2}:\d{2}))?\]/);
  if (!m) return 0;
  const iso = m[2] ? `${m[1]}T${m[2]}:00` : `${m[1]}T00:00:00`;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : 0;
}

/**
 * 解析记忆目录：
 * - workspaceRoot 为 'scratch' / 'global' / 空时，返回共享临时记忆目录 scratch-memory。
 * - 否则返回 <workspaceRoot>/.opencode-project（绝不访问 .codex-project）。
 */
export function getMemoryDir(workspaceRoot, scratchDirConfig = '') {
  if (!workspaceRoot || workspaceRoot === 'global' || workspaceRoot === 'scratch') {
    const customScratch = String(scratchDirConfig ?? '').trim();
    if (customScratch) {
      const checked = validateTargetPath(customScratch);
      if (path.isAbsolute(customScratch)) return checked;
    }
    const automationHome = process.env.OPENCODE_AUTOMATION_HOME?.trim();
    if (automationHome && path.isAbsolute(automationHome)) {
      return validateTargetPath(path.join(automationHome, 'scratch-memory'));
    }
    const userRoot = process.platform === 'win32'
      ? (process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local'))
      : (process.env.XDG_DATA_HOME || path.join(os.homedir(), '.local', 'share'));
    return validateTargetPath(path.join(userRoot, 'OpenCode', 'shared-automation', 'scratch-memory'));
  }
  const checkedWorkspace = validateTargetPath(workspaceRoot);
  return validateTargetPath(path.join(checkedWorkspace, '.opencode-project'));
}

/**
 * 确保记忆档案袋目录及标准文件存在（幂等，绝不覆盖已有内容）。
 */
export function ensureMemoryDir(memoryDir) {
  const resolved = validateTargetPath(memoryDir);
  fs.mkdirSync(resolved, { recursive: true });
  fs.mkdirSync(path.join(resolved, 'archive'), { recursive: true });

  for (const [name, tpl] of Object.entries(DEFAULT_TEMPLATES)) {
    const fp = path.join(resolved, name);
    if (!fs.existsSync(fp)) writeAtomic(fp, tpl);
  }
  const eventsPath = path.join(resolved, 'EVENTS.jsonl');
  if (!fs.existsSync(eventsPath)) writeAtomic(eventsPath, '');

  const policyPath = path.join(resolved, 'policy.json');
  if (!fs.existsSync(policyPath)) {
    writeAtomic(policyPath, JSON.stringify({ handoff_gate: 'warn', updatedAt: nowIso() }, null, 2) + '\n');
  }

  const statePath = path.join(resolved, 'STATE.json');
  if (!fs.existsSync(statePath)) {
    const initial = {
      schema: 2,
      engine: MEMORY_ENGINE_VERSION,
      revision: 1,
      updatedAt: nowIso(),
      lastHandoffAt: null,
      lastGoodHandoffRev: 0,
      writes: []
    };
    writeAtomic(statePath, JSON.stringify(initial, null, 2) + '\n');
  }
  return resolved;
}

export function readState(memoryDir) {
  const resolved = ensureMemoryDir(memoryDir);
  try {
    const parsed = JSON.parse(fs.readFileSync(path.join(resolved, 'STATE.json'), 'utf8'));
    if (!parsed || typeof parsed !== 'object') throw new Error('invalid');
    return {
      schema: Number.isInteger(parsed.schema) ? parsed.schema : 2,
      engine: parsed.engine || MEMORY_ENGINE_VERSION,
      revision: Number.isInteger(parsed.revision) && parsed.revision >= 1 ? parsed.revision : 1,
      updatedAt: parsed.updatedAt || nowIso(),
      lastHandoffAt: parsed.lastHandoffAt || null,
      lastGoodHandoffRev: Number.isInteger(parsed.lastGoodHandoffRev) ? parsed.lastGoodHandoffRev : 0,
      ...(parsed.lastHandoffKind === 'manual' || parsed.lastHandoffKind === 'auto' ? { lastHandoffKind: parsed.lastHandoffKind } : {}),
      ...(typeof parsed.lastHandoffSlot === 'string' && parsed.lastHandoffSlot ? { lastHandoffSlot: parsed.lastHandoffSlot.slice(0, 80) } : {}),
      writes: Array.isArray(parsed.writes) ? parsed.writes.slice(-50) : []
    };
  } catch {
    return {
      schema: 2,
      engine: MEMORY_ENGINE_VERSION,
      revision: 1,
      updatedAt: nowIso(),
      lastHandoffAt: null,
      lastGoodHandoffRev: 0,
      writes: []
    };
  }
}

function bumpState(memoryDir, kind, summary, owner = 'unknown', extra = {}) {
  const state = readState(memoryDir);
  state.schema = 2;
  state.engine = MEMORY_ENGINE_VERSION;
  state.revision = (state.revision || 1) + 1;
  state.updatedAt = nowIso();
  if (extra.lastHandoffAt) state.lastHandoffAt = extra.lastHandoffAt;
  if (Number.isInteger(extra.lastGoodHandoffRev)) state.lastGoodHandoffRev = extra.lastGoodHandoffRev;
  if (extra.lastHandoffKind === 'manual' || extra.lastHandoffKind === 'auto') state.lastHandoffKind = extra.lastHandoffKind;
  if (typeof extra.lastHandoffSlot === 'string' && extra.lastHandoffSlot) state.lastHandoffSlot = extra.lastHandoffSlot.slice(0, 80);
  state.writes = Array.isArray(state.writes) ? state.writes : [];
  const actor = normalizeActor(owner, extra.slot || '');
  const cleanSummary = singleLine(summary, 160);
  state.writes.push({
    rev: state.revision,
    at: state.updatedAt,
    kind,
    actor: actor.label,
    slot: actor.slot,
    owner: String(owner || 'unknown').slice(0, 120),
    summary: cleanSummary
  });
  if (state.writes.length > 50) state.writes = state.writes.slice(-50);
  writeAtomic(path.join(memoryDir, 'STATE.json'), JSON.stringify(state, null, 2) + '\n');

  const event = {
    rev: state.revision,
    ts: state.updatedAt,
    kind,
    actor: actor.label,
    slot: actor.slot,
    owner: String(owner || 'unknown').slice(0, 120),
    summary: singleLine(summary, 300)
  };
  fs.appendFileSync(path.join(memoryDir, 'EVENTS.jsonl'), JSON.stringify(event) + '\n', 'utf8');
  return state;
}

function readPolicyFile(dir) {
  try {
    const parsed = JSON.parse(fs.readFileSync(path.join(dir, 'policy.json'), 'utf8'));
    if (!VALID_GATES.has(parsed?.handoff_gate)) return null;
    // Directories are created with an implicit `warn`; only a gate someone set counts as explicit.
    // Legacy files carry no flag, so any non-default gate is treated as explicitly set.
    const explicit = parsed.explicit === true || (parsed.explicit === undefined && parsed.handoff_gate !== 'warn');
    return { handoff_gate: parsed.handoff_gate, updatedAt: parsed.updatedAt || null, explicit };
  } catch {
    return null;
  }
}

/**
 * Effective handoff gate: the nearest explicitly set policy, looking at this directory first and
 * then up to 6 parent directories (task -> actor -> session bucket -> memory root). This lets a gate
 * set on a session or project apply to the per-task memory directories the host binds underneath.
 */
export function normalizeWorkspaceKey(root) {
  let s = String(root || '').trim().replace(/\\/g, '/').replace(/\/+$/, '');
  if (!s) return '';
  const msys = s.match(/^\/([a-zA-Z])(\/.*)?$/);
  if (msys) s = `${msys[1]}:${msys[2] || '/'}`;
  if (/^[a-zA-Z]:/.test(s) || process.platform === 'win32') s = s.toLowerCase();
  return s;
}

function workspaceIndexFile(scratchRoot, key) {
  return path.join(scratchRoot, 'workspace-handoffs', `${crypto.createHash('sha256').update(key).digest('hex').slice(0, 24)}.json`);
}

/** Register a good manual handoff under each workspace path, so any later session can find it. */
export function recordWorkspaceHandoff(scratchRoot, roots, entry) {
  if (!scratchRoot || !entry?.memory_dir) return [];
  const keys = [...new Set((Array.isArray(roots) ? roots : [roots]).map(normalizeWorkspaceKey).filter(Boolean))];
  const written = [];
  for (const key of keys) {
    const file = workspaceIndexFile(scratchRoot, key);
    let list = [];
    try { list = JSON.parse(fs.readFileSync(file, 'utf8')).entries || []; } catch {}
    const memKey = path.resolve(entry.memory_dir);
    list = [{ ...entry, workspace_key: key }, ...list.filter(e => e && path.resolve(String(e.memory_dir || '')) !== memKey)].slice(0, 8);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    writeAtomic(file, JSON.stringify({ workspace_key: key, entries: list }, null, 2) + '\n');
    written.push(key);
  }
  return written;
}

export function readWorkspaceHandoffs(scratchRoot, roots, excludeDir = '') {
  if (!scratchRoot) return [];
  const keys = [...new Set((Array.isArray(roots) ? roots : [roots]).map(normalizeWorkspaceKey).filter(Boolean))];
  const ex = excludeDir ? path.resolve(excludeDir) : '';
  const seen = new Set();
  const out = [];
  for (const key of keys) {
    let list = [];
    try { list = JSON.parse(fs.readFileSync(workspaceIndexFile(scratchRoot, key), 'utf8')).entries || []; } catch {}
    for (const e of list) {
      const dir = path.resolve(String(e?.memory_dir || ''));
      if (!e || dir === ex || seen.has(dir) || !fs.existsSync(dir)) continue;
      seen.add(dir);
      out.push(e);
    }
  }
  return out.sort((a, b) => (b.updated_ms || 0) - (a.updated_ms || 0)).slice(0, 5);
}

function formatWorkspaceHandoffs(entries) {
  if (!entries.length) return '';
  const lines = entries.map(e => {
    const loc = e.location || {};
    const bits = [
      `- [${e.updated_at || '时间未知'}] @${e.label || e.slot || '未知'}${e.task_title ? ` · ${e.task_title}` : ''}`,
      `  - memory_dir：${e.memory_dir}（可传 memory_dir 读取完整记忆）`,
      e.stage?.length ? `  - 阶段：${e.stage.join('；')}` : null,
      e.todo?.length ? `  - 未完成：${e.todo.slice(0, 4).join('；')}` : null,
      e.next?.length ? `  - 下一步：${e.next.slice(0, 4).join('；')}` : null,
      loc.git_branch?.length || loc.git_commit?.length ? `  - Git：${[...(loc.git_branch || []), ...(loc.git_commit || [])].join(' @ ')}` : null,
      loc.uncommitted?.length ? `  - 未提交：${loc.uncommitted.join('；')}` : null
    ];
    return bits.filter(Boolean).join('\n');
  });
  return `===== 同一工作区其他会话的交接（按工作区路径匹配，最新在前；历史自述，开工前核验） =====\n${lines.join('\n')}`;
}

export function readPolicy(memoryDir) {
  const resolved = ensureMemoryDir(memoryDir);
  const own = readPolicyFile(resolved);
  if (own?.explicit) return { handoff_gate: own.handoff_gate, updatedAt: own.updatedAt, source: resolved, inherited: false };
  let dir = resolved;
  for (let i = 0; i < 6; i++) {
    const parent = path.dirname(dir);
    if (!parent || parent === dir) break;
    dir = parent;
    if (!fs.existsSync(path.join(dir, 'STATE.json'))) continue;
    const p = readPolicyFile(dir);
    if (p?.explicit) return { handoff_gate: p.handoff_gate, updatedAt: p.updatedAt, source: dir, inherited: true };
  }
  return { handoff_gate: own?.handoff_gate || 'warn', updatedAt: own?.updatedAt || null, source: resolved, inherited: false };
}

export function setPolicy(memoryDir, handoffGate, owner = 'unknown') {
  const resolved = ensureMemoryDir(memoryDir);
  const gate = String(handoffGate ?? '').trim();
  if (!VALID_GATES.has(gate)) {
    throw new Error(`MEMORY_POLICY_INVALID: handoff_gate 必须为 off | warn | block（收到: ${gate}）`);
  }
  const payload = { handoff_gate: gate, explicit: true, updatedAt: nowIso() };
  writeAtomic(path.join(resolved, 'policy.json'), JSON.stringify(payload, null, 2) + '\n');
  const state = bumpState(resolved, 'policy', `handoff_gate=${gate}`, owner);
  return { ok: true, policy: payload, applies_to: '本目录及其下未单独设置策略的任务/执行者子目录', revision: state.revision };
}

/**
 * 判断 HANDOFF.md 是否具备有效接班内容（>=6 行非空，且「下一步」下有实质条目）。
 */
export function isGoodHandoff(text) {
  const raw = String(text ?? '');
  const nonEmpty = splitLines(raw).map(l => l.trim()).filter(Boolean);
  if (nonEmpty.length < 6) return false;
  if (!raw.includes('下一步')) return false;
  const idx = raw.indexOf('下一步');
  const after = splitLines(raw.slice(idx)).slice(1);
  for (const line of after) {
    const t = line.trim();
    if (t.startsWith('#')) break;
    if (t.startsWith('- ')) {
      const body = t.slice(2).trim();
      if (body && body !== '无' && !body.includes('待填写') && !body.includes('暂无记录') && !isGenericNextLine(body)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * 机械安全封顶（对齐 CODEX v1.9.1 autocap）：
 * - WORKLOG.md > 300 条 -> 保留最新 200 条，旧条目追加至 archive/WORKLOG-自动归档-YYYYMM.md
 * - REQUIREMENTS.md > 150 条 -> 保留 100 条，仅归档已完成/非活跃条目，绝不归档 [待办] 与 [进行中]
 * - NOTES.md > 200 行 -> 将 [已作废] 条目移入 archive/NOTES-作废归档-YYYYMM.md
 */
export function autocap(memoryDir) {
  const resolved = ensureMemoryDir(memoryDir);
  const ym = monthStamp();
  const moved = { worklog: 0, requirements: 0, notes: 0 };

  // 1. WORKLOG.md
  const wlPath = path.join(resolved, 'WORKLOG.md');
  const wlLines = splitLines(readUtf8Safe(wlPath));
  const wlHeaders = wlLines.filter(l => !l.startsWith('- '));
  const wlItems = wlLines.filter(l => l.startsWith('- '));
  if (wlItems.length > 300) {
    const cut = wlItems.slice(0, wlItems.length - 200);
    const keep = wlItems.slice(wlItems.length - 200);
    const archFile = path.join(resolved, 'archive', `WORKLOG-自动归档-${ym}.md`);
    const prefix = fs.existsSync(archFile) ? '' : `# WORKLOG 自动归档 (${ym})\n`;
    fs.appendFileSync(archFile, prefix + cut.join('\n') + '\n', 'utf8');
    const hdr = wlHeaders.length ? wlHeaders.join('\n') : '# 工作进展流水账（WORKLOG）';
    writeAtomic(wlPath, hdr + '\n' + keep.join('\n') + '\n');
    moved.worklog = cut.length;
  }

  // 2. REQUIREMENTS.md（保护 [待办] 与 [进行中] 永不归档）
  const reqPath = path.join(resolved, 'REQUIREMENTS.md');
  const reqLines = splitLines(readUtf8Safe(reqPath));
  const reqHeaders = reqLines.filter(l => !l.startsWith('- '));
  const reqItems = reqLines.filter(l => l.startsWith('- '));
  if (reqItems.length > 150) {
    const needMove = reqItems.length - 100;
    const cut = [];
    const keep = [];
    for (const item of reqItems) {
      const isActive = ACTIVE_REQ_TAGS.some(tag => item.includes(tag));
      if (!isActive && cut.length < needMove) {
        cut.push(item);
      } else {
        keep.push(item);
      }
    }
    if (cut.length > 0) {
      const archFile = path.join(resolved, 'archive', `REQUIREMENTS-自动归档-${ym}.md`);
      const prefix = fs.existsSync(archFile) ? '' : `# REQUIREMENTS 自动归档 (${ym})\n`;
      fs.appendFileSync(archFile, prefix + cut.join('\n') + '\n', 'utf8');
      const hdr = reqHeaders.length ? reqHeaders.join('\n') : '# 需求与待办台账（REQUIREMENTS）';
      writeAtomic(reqPath, hdr + '\n' + keep.join('\n') + '\n');
      moved.requirements = cut.length;
    }
  }

  // 3. NOTES.md > 200 行时移走 [已作废]
  const notesPath = path.join(resolved, 'NOTES.md');
  const noteLines = splitLines(readUtf8Safe(notesPath));
  if (noteLines.length > LIMITS['NOTES.md']) {
    const isRetired = l => l.startsWith('- [已作废]') || l.startsWith('- [已被取代→');
    const obsolete = noteLines.filter(isRetired);
    if (obsolete.length > 0) {
      const active = noteLines.filter(l => !isRetired(l));
      const archFile = path.join(resolved, 'archive', `NOTES-作废归档-${ym}.md`);
      const prefix = fs.existsSync(archFile) ? '' : `# NOTES 作废归档 (${ym})\n`;
      fs.appendFileSync(archFile, prefix + obsolete.join('\n') + '\n', 'utf8');
      writeAtomic(notesPath, active.join('\n') + '\n');
      moved.notes = obsolete.length;
    }
  }

  return moved;
}

/**
 * 检测 HANDOFF 是否落后于最新写入（>=3 条新记录且 HANDOFF 距今超过 30 分钟），并提取断层记录。
 */
export function detectHandoffGap(memoryDir) {
  const resolved = ensureMemoryDir(memoryDir);
  const handoffPath = path.join(resolved, 'HANDOFF.md');
  let handoffMtimeMs = 0;
  try {
    handoffMtimeMs = fs.statSync(handoffPath).mtimeMs;
  } catch {
    return { stale: false, postEntries: [] };
  }
  const postEntries = [];
  for (const fn of ['WORKLOG.md', 'REQUIREMENTS.md', 'NOTES.md', 'DECISIONS.md']) {
    const lines = splitLines(readUtf8Safe(path.join(resolved, fn)));
    for (const line of lines) {
      if (!line.startsWith('- ') && !line.startsWith('## [')) continue;
      if (isInactiveEntryLine(line)) continue;
      const entryMs = parseEntryTimestampMs(line);
      if (entryMs > 0 && entryMs > handoffMtimeMs + 60_000) {
        postEntries.push({ ms: entryMs, file: fn, text: line.trim() });
      }
    }
  }
  postEntries.sort((a, b) => a.ms - b.ms);
  const ageMs = Date.now() - handoffMtimeMs;
  const stale = postEntries.length >= 3 && ageMs > 30 * 60 * 1000;
  return { stale, ageMinutes: Math.round(ageMs / 60000), postEntries };
}

// A fresh observation of the memory files, not verification of their claims.
// Do not use readState's compatibility fallback as evidence that a damaged file is valid.
export function observeMemory(memoryDir, knownGap) {
  const resolved = ensureMemoryDir(memoryDir), observedAt = nowIso();
  let revision = null, stateUpdatedAt = null, stateReadable = false, handoffModifiedAt = null;
  try {
    const state = JSON.parse(fs.readFileSync(path.join(resolved, 'STATE.json'), 'utf8'));
    if (Number.isSafeInteger(state?.revision) && state.revision >= 1) {
      revision = state.revision;
      stateUpdatedAt = typeof state.updatedAt === 'string' ? state.updatedAt : null;
      stateReadable = true;
    }
  } catch {}
  try { handoffModifiedAt = fs.statSync(path.join(resolved, 'HANDOFF.md')).mtime.toISOString(); } catch {}
  const gap = knownGap || detectHandoffGap(resolved);
  return {
    observed_at: observedAt, memory_revision: revision, state_updated_at: stateUpdatedAt,
    state_readable: stateReadable, handoff_modified_at: handoffModifiedAt,
    later_record_count: gap.postEntries.length, handoff_stale_warning: gap.stale === true,
    limitations: '只观察记忆文件与记录时间；未核验项目 Git、源文件、命令、模型或测试。记录时间与哈希也不保证完整或真实。'
  };
}

function formatCheckpointTime(value) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return nowHuman(new Date(value));
  return typeof value === 'string' ? value : '';
}

function checkpointSortMs(value) {
  if (typeof value === 'number') return value;
  const parsed = Date.parse(String(value || '').replace(/ CST.*$/, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function readTaskCheckpointSummary(checkpointFile) {
  try {
    if (!fs.existsSync(checkpointFile)) return null;
    const raw = JSON.parse(fs.readFileSync(checkpointFile, 'utf8'));
    if (!raw || typeof raw !== 'object') return null;
    // persist() writes { format, savedAt, task: {...}, execution }; older files are flat.
    const cp = raw.task && typeof raw.task === 'object' ? { ...raw.task, taskId: raw.task.taskId || raw.task.id, updatedAt: raw.task.updatedAt || raw.savedAt } : raw;
    const todos = Array.isArray(cp.todos) ? cp.todos : [];
    const done = todos.filter(t => t?.status === 'completed').map(t => `${t.id}:${t.title}`);
    const inProg = todos.filter(t => t?.status === 'in_progress').map(t => `${t.id}:${t.title}`);
    const pending = todos.filter(t => t?.status !== 'completed' && t?.status !== 'in_progress').map(t => `${t.id}:${t.title}`);
    return {
      taskId: cp.taskId || '',
      title: cp.title || '未命名任务',
      state: cp.state || 'unknown',
      revision: cp.revision,
      updatedAt: formatCheckpointTime(cp.updatedAt || cp.createdAt || ''),
      model: cp.overview?.label || cp.assistantSource?.displayName || cp.owner || '',
      memoryDir: cp.memory?.memoryDir || path.dirname(checkpointFile),
      checkpointPath: checkpointFile,
      actorId: cp.memory?.actorId || path.basename(path.dirname(path.dirname(path.dirname(checkpointFile)))),
      sessionTag: typeof cp.overviewSessionTag === 'string' ? cp.overviewSessionTag : '',
      done,
      inProg,
      pending
    };
  } catch {
    return null;
  }
}

/** 记忆库窗口：列出记忆根下全部任务记忆（按检查点更新时间倒序）。 */
export function listTaskMemories(rootDir, limit = 400) {
  return collectRootTaskCheckpoints(rootDir, limit);
}

function collectRootTaskCheckpoints(resolvedDir, limit = 5) {
  try {
    const rootDir = resolveMemoryRootDir(resolvedDir);
    const actorsDir = path.join(rootDir, 'actors');
    if (!fs.existsSync(actorsDir)) return [];
    const items = [];
    for (const actorEntry of fs.readdirSync(actorsDir, { withFileTypes: true })) {
      if (!actorEntry.isDirectory()) continue;
      const tasksDir = path.join(actorsDir, actorEntry.name, 'tasks');
      if (!fs.existsSync(tasksDir)) continue;
      for (const taskEntry of fs.readdirSync(tasksDir, { withFileTypes: true })) {
        if (!taskEntry.isDirectory()) continue;
        const cpFile = path.join(tasksDir, taskEntry.name, 'task-checkpoint.json');
        const info = readTaskCheckpointSummary(cpFile);
        if (info) {
          try { info.sortKey = fs.statSync(cpFile).mtimeMs; } catch { info.sortKey = 0; }
          items.push(info);
        }
      }
    }
    items.sort((a, b) => checkpointSortMs(b.sortKey) - checkpointSortMs(a.sortKey));
    return items.slice(0, limit);
  } catch {
    return [];
  }
}

function readLatestManualSlot(resolvedDir) {
  const slotsDir = path.join(resolvedDir, 'slots');
  if (!fs.existsSync(slotsDir)) return null;
  let best = null;
  for (const entry of fs.readdirSync(slotsDir)) {
    if (!entry.endsWith('.json')) continue;
    try {
      const parsed = JSON.parse(fs.readFileSync(path.join(slotsDir, entry), 'utf8'));
      if (!parsed || typeof parsed !== 'object' || parsed.kind === 'auto') continue;
      // Legacy slots have no kind; treat lifecycle-archive wording as automatic.
      if (!parsed.kind && (parsed.stage || []).some(s => /^最近任务(已完成|受阻待续|进行中检查点)：/.test(String(s)))) continue;
      if (!best || (parsed.updated_ms || 0) > (best.updated_ms || 0)) best = parsed;
    } catch {}
  }
  return best;
}

/**
 * 读取开工精简记忆摘要（严格封顶 <= maxLines，默认 230 行）。
 * step03：按分节预算排序——现在看到的(1-2 行) → PINNED → HANDOFF 下一步/未完成 → 手写槽位/本任务检查点/
 * 工作区汇总视图/断层补充 → 活跃需求 → 待确认 → 随手记 → HANDOFF 其余 → 相邻任务 → 日志 → 默认模板折叠。
 * 每节先保底再按顺序扩容，重要分节不会因前面的元信息被截断。options.extraSections 可插入调用方分节。
 */
const AGENTS_TEMPLATE_V1 = "# 项目铁律与记忆规范（.opencode-project）\n- 记忆红线：每次开工只自动注入 `AGENTS.md` + `INDEX.md` + `HANDOFF.md` + 活跃随手记/需求（总计 <=230 行），严禁无故全量扫描历史日志。\n- 按需深挖：遇到具体历史模块、决策或上下文缺失时，优先调用 `bridge_memory_recall` 或 `bridge_memory_search` 按关键词精确召回。\n- 随手记更新：发现重要结论、新需求、架构变更或排障经验，及时用 `bridge_memory_append`（note/req/decide/log）写入；过时结论用 `bridge_memory_forget` 标记 `[已作废]`，不物理删改历史。\n- 严格隔离：项目记忆仅存于当前工作区 `.opencode-project/`，临时/整机 MCP 记忆存于 `scratch-memory`；严禁读写 `.codex-project`。\n- 换班交接：任务完成、受阻或对话过长前，调用 `bridge_memory_handoff` 更新 `HANDOFF.md` 的「下一步（接班必看）」，确保零断层续接。\n- 固定在场：身份、硬约束、当前承诺用 `bridge_memory_append` kind=pin 钉入 PINNED.md（上限 25 条，每次开工随 brief 首段注入），过时用 kind=unpin 作废。\n";
function isDefaultTemplateText(name, raw) {
  const norm = s => String(s || '').replace(/\r\n/g, '\n').trim();
  const r = norm(raw);
  if (name === 'AGENTS.md') return r === norm(AGENTS_TEMPLATE_V1) || r === norm(DEFAULT_TEMPLATES['AGENTS.md']);
  return r === norm(DEFAULT_TEMPLATES[name]);
}

function splitHandoffSections(raw) {
  let title = '';
  const pre = [];
  const sections = [];
  let cur = null;
  for (const line of splitLines(raw)) {
    if (line.startsWith('## ')) { cur = { heading: line.slice(3).trim(), lines: [] }; sections.push(cur); continue; }
    if (!line.trim()) continue;
    if (cur) cur.lines.push(line);
    else if (!title && line.startsWith('# ')) title = line.trim();
    else pre.push(line);
  }
  return { title, pre, sections };
}

function renderBriefSections(sections, cap) {
  let remaining = cap - 1; // one line reserved for the cap footer
  const overhead = idx => (idx > 0 ? 2 : 1); // heading + blank separator
  sections.forEach(s => { s.alloc = 0; s.included = false; });
  // Pass 1: guaranteed minimum per section, in priority (display) order.
  sections.forEach((s, idx) => {
    const want = Math.min(s.lines.length, s.min);
    if (want <= 0 || overhead(idx) + want > remaining) return;
    s.alloc = want; s.included = true; remaining -= overhead(idx) + want;
  });
  // Pass 2: grow each section up to its maximum, again in priority order.
  sections.forEach((s, idx) => {
    const target = Math.min(s.lines.length, s.max);
    if (!s.included) {
      const room = remaining - overhead(idx);
      if (room <= 0 || target <= 0) return;
      s.alloc = Math.min(target, room); s.included = true; remaining -= overhead(idx) + s.alloc;
    } else {
      const extra = Math.min(target - s.alloc, remaining);
      if (extra > 0) { s.alloc += extra; remaining -= extra; }
    }
  });
  const blocks = [];
  for (const s of sections) {
    if (!s.included) continue;
    const shownNote = s.alloc < s.lines.length ? `（显示 ${s.alloc}/${s.lines.length} 行，余下用 bridge_memory_recall 或读原文件）` : '';
    blocks.push([`===== ${s.title}${shownNote} =====`, ...s.lines.slice(0, s.alloc).map(l => String(l).replace(/\n+/g, ' ； '))].join('\n'));
  }
  let out = splitLines(blocks.join('\n\n'));
  const dropped = sections.filter(s => !s.included).map(s => s.title.split(/[（(]/)[0].trim());
  if (dropped.length) out.push(`...(brief 已严格封顶 ${cap} 行，未展开：${dropped.slice(0, 6).join('、')}；更多细节请用 bridge_memory_recall 检索)`);
  if (out.length > cap) out = [...out.slice(0, cap - 1), `...(brief 已严格封顶 ${cap} 行，更多细节请用 bridge_memory_recall 检索)`];
  return out.join('\n');
}

export function brief(memoryDir, maxLines = 230, options = {}) {
  const resolved = ensureMemoryDir(memoryDir);
  const cap = Math.max(20, Math.min(1000, Number(maxLines) || 230));
  const nowMs = Date.now();
  const sections = [];
  const add = (title, lines, min, max) => {
    const arr = (lines || []).filter(l => l !== null && l !== undefined && String(l).trim() !== '');
    if (arr.length) sections.push({ title, lines: arr, min, max });
  };
  const shortIso = v => (v ? String(v).slice(0, 16).replace('T', ' ') + 'Z' : '不可用');

  // 0. 现在看到的：压缩为 1-2 行。
  const gap = detectHandoffGap(resolved);
  const observation = observeMemory(resolved, gap);
  const obsLines = [
    `- ${shortIso(observation.observed_at)} 读取：STATE ${observation.state_readable ? `rev ${observation.memory_revision}` : '无法可靠读取（请检查原文件）'} · HANDOFF 文件时间 ${shortIso(observation.handoff_modified_at)} · 其后 ${observation.later_record_count} 条记录（只观察记忆文件，未核验 Git/源码/测试；未提示过期不等于最新）`
  ];
  if (gap.stale) {
    obsLines.push(`- ⚠ 交接单可能过期：HANDOFF.md 之后已有 ${gap.postEntries.length} 条新记录（距上次更新 ${gap.ageMinutes} 分钟），见「断层补充」并适时调用 bridge_memory_handoff。`);
  }
  add('现在看到的（本次读取的记忆状态）', obsLines, obsLines.length, obsLines.length);

  // 1. PINNED，其次是被改写过的项目铁律 AGENTS.md。
  add('固定在场（PINNED.md，显式钉住的身份/硬约束/当前承诺，不依赖检索）', activePinLines(resolved), LIMITS['PINNED.md'], LIMITS['PINNED.md']);
  // 1b. 项目长期记忆：任务/执行者私有目录看不到记忆根时，把根里的长期条目一并带上（跨任务、跨对话保留）。
  const longTermRoot = resolveMemoryRootDir(resolved);
  if (!samePath(longTermRoot, resolved) && hasMemoryState(longTermRoot)) {
    const lt = [];
    for (const l of activePinLines(longTermRoot).slice(-10)) lt.push(`[固定] ${singleLine(l.slice(2), 300)}`);
    const rootReqs = splitLines(readUtf8Safe(path.join(longTermRoot, 'REQUIREMENTS.md'))).filter(l => l.startsWith('- ') && !isInactiveEntryLine(l, nowMs));
    for (const l of rootReqs.filter(l => ACTIVE_REQ_TAGS.some(t => l.includes(t))).slice(-10)) lt.push(`[需求] ${singleLine(l.slice(2), 300)}`);
    for (const l of splitLines(readUtf8Safe(path.join(longTermRoot, 'DECISIONS.md'))).filter(l => l.startsWith('## ')).slice(-8)) lt.push(`[决策] ${singleLine(l.slice(3), 300)}`);
    for (const l of splitLines(readUtf8Safe(path.join(longTermRoot, 'NOTES.md'))).filter(l => l.startsWith('- ') && !isInactiveEntryLine(l, nowMs)).slice(-8)) lt.push(`[随手记] ${singleLine(l.slice(2), 300)}`);
    for (const l of splitLines(readUtf8Safe(path.join(longTermRoot, 'WORKLOG.md'))).filter(l => l.startsWith('- ')).slice(-6)) lt.push(`[日志] ${singleLine(l.slice(2), 400)}`);
    if (lt.length) add(`项目长期记忆（记忆根 ${longTermRoot}，跨任务/跨对话长期保留；note/pin/req/decide 会自动同步到这里，详情用 bridge_memory_recall 或传 memory_dir=记忆根）`, lt.map(l => `- ${l}`), 8, 48);
  }
  const agentsRaw = readUtf8Safe(path.join(resolved, 'AGENTS.md'));
  const agentsDefault = !agentsRaw.trim() || isDefaultTemplateText('AGENTS.md', agentsRaw);
  if (!agentsDefault) add('AGENTS.md（项目铁律）', splitLines(agentsRaw).filter(l => l.trim()), 8, LIMITS['AGENTS.md']);

  // 2. HANDOFF：定位/阶段/下一步/未完成优先。
  let hoRaw = readUtf8Safe(path.join(resolved, 'HANDOFF.md'));
  let headerNote = '';
  if (!isGoodHandoff(hoRaw)) {
    const fallback = readUtf8Safe(path.join(resolved, 'archive', 'handoff-good.md'));
    if (fallback && isGoodHandoff(fallback)) {
      hoRaw = fallback;
      headerNote = '（注意：当前 HANDOFF.md 未填写完整，已自动回退上次有效交接快照）';
    }
  }
  const ho = splitHandoffSections(hoRaw);
  const prioKeys = ['定位与状态', '当前阶段', '下一步', '未完成'];
  const prioIndex = s => prioKeys.findIndex(k => s.heading.includes(k));
  const aSecs = ho.sections.filter(s => prioIndex(s) >= 0).sort((x, y) => prioIndex(x) - prioIndex(y));
  const bSecs = ho.sections.filter(s => prioIndex(s) < 0);
  const renderSecs = secs => secs.flatMap(s => [`## ${s.heading}`, ...s.lines]);
  const aLines = ho.sections.length
    ? [...(ho.title ? [ho.title] : []), ...ho.pre, ...renderSecs(aSecs)]
    : splitLines(hoRaw).filter(l => l.trim()).slice(0, LIMITS['HANDOFF.md']);
  add(`上次说的（历史自述，待核验） — HANDOFF.md 下一步/未完成${headerNote ? ' ' + headerNote : ''}`, aLines, 20, 60);

  const manualSlot = readLatestManualSlot(resolved);
  const briefState = readState(resolved);
  const mainIsThatSlot = manualSlot && briefState.lastHandoffSlot === manualSlot.slot && briefState.lastHandoffKind === 'manual';
  if (manualSlot && !mainIsThatSlot) {
    const sec = (label, items) => items?.length ? `- ${label}：${items.join('；')}` : null;
    const loc = manualSlot.location || {};
    add('最近一次手写交接（完整槽位，历史自述待核验）', [
      `- 来源：@${manualSlot.label || manualSlot.slot}（${manualSlot.updated_at || '时间未知'}）`,
      sec('下一步', manualSlot.next), sec('未完成', manualSlot.todo),
      ...HANDOFF_LOCATION_FIELDS.map(([key, label]) => sec(label, loc[key])),
      manualSlot.summary ? `- 摘要：${manualSlot.summary}` : null,
      sec('阶段', manualSlot.stage), sec('已完成', manualSlot.done),
      sec('风险', (manualSlot.risk || []).filter(r => r !== '无')), sec('改动文件', manualSlot.files)
    ], 6, 20);
  }

  const directCp = readTaskCheckpointSummary(path.join(resolved, 'task-checkpoint.json'));
  if (directCp) {
    add('任务检查点快照 (task-checkpoint.json)', [
      `- 任务：${directCp.title} (task_id=${directCp.taskId}, 状态=${directCp.state}, 模型=${directCp.model || '未知'}, 更新时间=${directCp.updatedAt || '未知'})`,
      `- 进行中步骤 (${directCp.inProg.length})：${directCp.inProg.join('；') || '无'}`,
      `- 待完成步骤 (${directCp.pending.length})：${directCp.pending.join('；') || '无'}`,
      `- 已完成步骤 (${directCp.done.length})：${directCp.done.join('；') || '无'}`,
      `- 任务记忆目录：${directCp.memoryDir}`
    ], 3, 6);
  }

  for (const extra of Array.isArray(options?.extraSections) ? options.extraSections : []) {
    if (extra && Array.isArray(extra.lines)) add(String(extra.title || '附加信息'), extra.lines, Number(extra.min) || 6, Number(extra.max) || 60);
  }

  if (gap.stale && gap.postEntries.length > 0) {
    add('断层补充 (HANDOFF 之后的新记录，自动附带)', gap.postEntries.slice(-12).map(item => `[${item.file}] ${item.text}`), 6, 12);
  }

  // 3. 活跃需求（活跃条目在前，截断只会先砍掉已完成的旧条目）。
  const allReqItems = splitLines(readUtf8Safe(path.join(resolved, 'REQUIREMENTS.md'))).filter(l => l.startsWith('- '));
  const liveReqs = allReqItems.filter(l => !isInactiveEntryLine(l, nowMs));
  const activeReqs = liveReqs.filter(l => ACTIVE_REQ_TAGS.some(t => l.includes(t))).slice(-20);
  const recentDone = liveReqs.filter(l => !ACTIVE_REQ_TAGS.some(t => l.includes(t))).slice(-6);
  const reqLines = [...activeReqs, ...recentDone];
  add(`活跃与近期需求 (${reqLines.length}/${allReqItems.length} 条)`, reqLines, 10, 26);

  // 4. 待确认的自动提取条目；5. 普通随手记。
  const liveNotes = splitLines(readUtf8Safe(path.join(resolved, 'NOTES.md')))
    .filter(l => l.startsWith('- ') && !isInactiveEntryLine(l, nowMs));
  const pendingNotes = liveNotes.filter(l => l.includes(AUTO_PENDING_TAG));
  if (pendingNotes.length) {
    add(`待确认（交接时自动提取，共 ${pendingNotes.length} 条；核实后 bridge_memory_append kind=confirm text=关键词，错误的用 bridge_memory_forget）`, pendingNotes.slice(-8), 3, 8);
  }
  const plainNotes = liveNotes.filter(l => !l.includes(AUTO_PENDING_TAG));
  add(`随手记摘要 (活跃最新 ${Math.min(10, plainNotes.length)} 条)`, plainNotes.slice(-10), 5, 10);

  // 6. HANDOFF 其余部分。
  if (bSecs.length) add('HANDOFF.md 其余部分（已完成/风险/改动文件/并行槽位）', renderSecs(bSecs), 4, 40);

  // 7. 相邻任务检查点。
  const siblingCps = collectRootTaskCheckpoints(resolved, directCp ? 4 : 5)
    .filter(cp => !directCp || (cp.taskId && cp.taskId !== directCp.taskId)).slice(0, directCp ? 3 : 5);
  add(`${directCp ? '同一执行者的其他近期任务（上一棒可能在这里）' : '同记忆根下近期任务检查点'} (可传 memory_dir 无损读取对应任务记忆)`, siblingCps.map(cp => {
    const unfinished = [...cp.inProg, ...cp.pending];
    return `- [${cp.state}] ${cp.title} (task_id=${cp.taskId}, 模型=${cp.model || '未知'}, memory_dir=${cp.memoryDir}) | 待继续(${unfinished.length}): ${unfinished.slice(0, 3).join('；') || '无'} | 已完成(${cp.done.length})`;
  }), 2, 5);

  // 8. 最近工作日志（断层补充出现时已包含更新的记录）。
  if (!gap.stale) {
    const recentLogs = splitLines(readUtf8Safe(path.join(resolved, 'WORKLOG.md'))).filter(l => l.startsWith('- ')).slice(-5);
    add(`最近工作日志 (最新 ${recentLogs.length} 条)`, recentLogs.map(l => singleLine(l, 400)), 2, 5);
  }

  // 9. 路由地图与默认规范：改写过才展开，默认模板只留一行速记。
  const indexRaw = readUtf8Safe(path.join(resolved, 'INDEX.md'));
  if (indexRaw.trim() && !isDefaultTemplateText('INDEX.md', indexRaw)) add('INDEX.md', splitLines(indexRaw).filter(l => l.trim()), 0, LIMITS['INDEX.md']);
  if (agentsDefault) {
    add('AGENTS.md（默认记忆规范已折叠，需要时读取该文件）', [
      '- 速记：brief/recall/search（scope=task|workspace|all）· append（note/req/req_status/decide/log/pin/unpin/confirm，可选 valid_from/valid_until/subject）· forget · handoff · consolidate（默认 dry-run）；路由见 INDEX.md'
    ], 1, 1);
  }

  return renderBriefSections(sections, cap);
}

// ---- 分词、同义词与缓存倒排索引（对齐 CODEX v1.9.1） -------------------------

export function tokenize(text) {
  const s = String(text ?? '').toLowerCase();
  const tokens = [];
  const asciiMatches = s.match(/[a-z0-9_.\-]{2,}/g);
  if (asciiMatches) tokens.push(...asciiMatches);
  const cjkBlocks = s.match(/[\u4e00-\u9fff]+/g);
  if (cjkBlocks) {
    for (const block of cjkBlocks) {
      if (block.length === 1) {
        tokens.push(block);
      } else {
        for (let i = 0; i < block.length - 1; i += 1) {
          tokens.push(block.slice(i, i + 2));
        }
      }
    }
  }
  return tokens;
}

// step03: CJK trigrams for 3+ character blocks. They are indexed alongside the bigrams but carry a
// reduced query weight and never count toward coverage or BM25 document length, so existing
// confidence thresholds keep their meaning while exact 3-character phrases rank higher.
const TRIGRAM_WEIGHT = 0.45;
function cjkTrigrams(text) {
  const out = [];
  const blocks = String(text ?? '').toLowerCase().match(/[\u4e00-\u9fff]{3,}/g);
  if (blocks) {
    for (const block of blocks) {
      for (let i = 0; i <= block.length - 3; i += 1) out.push(block.slice(i, i + 3));
    }
  }
  return out;
}

/** 索引用分词：tokenize() 的 ASCII 词元与中文二元 + 三字以上中文块的三元切词。 */
export function tokenizeForIndex(text) {
  return [...tokenize(text), ...cjkTrigrams(text)];
}

function loadSynonymMap(memoryDir) {
  const groups = SYNONYM_GROUPS.map(g => [...g]);
  const customFile = path.join(memoryDir, 'synonyms.txt');
  const raw = readUtf8Safe(customFile);
  for (const line of splitLines(raw)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const words = trimmed.split(/[,，]/).map(w => w.trim().toLowerCase()).filter(Boolean);
    if (words.length >= 2) groups.push(words);
  }
  const map = new Map();
  for (const grp of groups) {
    const expanded = new Set();
    for (const word of grp) {
      const lw = word.toLowerCase();
      expanded.add(lw);
      for (const tk of tokenize(lw)) expanded.add(tk);
    }
    for (const tk of expanded) {
      let bucket = map.get(tk);
      if (!bucket) {
        bucket = new Set();
        map.set(tk, bucket);
      }
      for (const peer of expanded) bucket.add(peer);
    }
  }
  return map;
}

const NON_SEARCH_FILES = new Set(['AGENTS.md', 'INDEX.md']);

function collectIndexableFiles(memoryDir, includeStatic = false) {
  const results = [];
  const scanDir = (dir, relPrefix = '') => {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const rel = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'archive') scanDir(full, 'archive');
        continue;
      }
      if (!entry.isFile()) continue;
      if (!relPrefix && entry.name === 'task-checkpoint.json') {
        try {
          const st = fs.statSync(full);
          if (st.size <= 1024 * 1024) results.push({ rel, full, mtime: Math.trunc(st.mtimeMs), size: st.size });
        } catch {}
        continue;
      }
      if (!entry.name.endsWith('.md')) continue;
      if (!includeStatic && !relPrefix && NON_SEARCH_FILES.has(entry.name)) continue;
      if (entry.name.includes('.bak-') || entry.name.endsWith('.draft.md')) continue;
      try {
        const st = fs.statSync(full);
        if (st.size > 1024 * 1024) continue;
        results.push({ rel, full, mtime: Math.trunc(st.mtimeMs), size: st.size });
      } catch {}
    }
  };
  scanDir(memoryDir);
  // 先索引当前文件，再按时间倒序索引归档：字母序下 archive 排在 DECISIONS/HANDOFF/WORKLOG 之前，旧交接包会占满文档上限，导致当前记忆检索不到。
  const live = results.filter(f => !f.rel.startsWith('archive/'));
  const arch = results.filter(f => f.rel.startsWith('archive/')).sort((a, b) => b.mtime - a.mtime || b.rel.localeCompare(a.rel));
  return [...live, ...arch];
}

// schema 2 stores each line's distinct-token count so ranking can apply BM25 length normalisation;
// schema 3 (step03) adds CJK trigram postings and per-line flags [superseded, validUntilMs, validFromMs];
// older caches are rebuilt automatically on first load.
const INDEX_SCHEMA = 4;
const BM25_K1 = 1.2;
const BM25_B = 0.75;

export function buildIndex(memoryDir) {
  const resolved = ensureMemoryDir(memoryDir);
  const files = collectIndexableFiles(resolved);
  const rev = readState(resolved).revision;
  const sig = [rev, ...files.map(f => [f.rel, f.mtime, f.size])];
  const post = Object.create(null);
  const meta = [];
  const MAX_DOCS = 12000;
  let totalLen = 0;

  for (const file of files) {
    if (meta.length >= MAX_DOCS) break;
    const lines = splitLines(readUtf8Safe(file.full));
    const isDecisions = path.basename(file.rel).startsWith('DECISIONS');
    let blockMeta = null;
    for (let idx = 0; idx < lines.length; idx += 1) {
      if (meta.length >= MAX_DOCS) break;
      const trimmed = lines[idx].trim();
      if (!trimmed) continue;
      let em = parseEntryMeta(trimmed);
      if (isDecisions) {
        // A decision block's heading carries its supersede / validity markers for its bullets.
        if (trimmed.startsWith('## ')) blockMeta = em;
        else if (blockMeta && trimmed.startsWith('- ')) {
          em = { ...em, obsolete: em.obsolete || blockMeta.obsolete, superseded: em.superseded || blockMeta.superseded,
            validFromMs: em.validFromMs || blockMeta.validFromMs, validUntilMs: em.validUntilMs || blockMeta.validUntilMs };
        }
      }
      if (em.obsolete) continue;
      if (trimmed.startsWith('#') && trimmed.length < 24) continue;
      const baseTokens = [...new Set(tokenize(trimmed))];
      if (baseTokens.length === 0) continue;
      const uniqueTokens = [...new Set([...baseTokens, ...cjkTrigrams(trimmed)])];
      const docId = meta.length;
      meta.push([file.rel, idx + 1, trimmed.slice(0, 240), baseTokens.length, em.superseded ? 1 : 0, em.validUntilMs || 0, em.validFromMs || 0]);
      totalLen += baseTokens.length;
      for (const tk of uniqueTokens) {
        if (!post[tk]) post[tk] = [];
        post[tk].push(docId);
      }
    }
  }

  const indexData = {
    schema: INDEX_SCHEMA,
    engine: MEMORY_ENGINE_VERSION,
    sig,
    n: meta.length,
    avgLen: meta.length ? Number((totalLen / meta.length).toFixed(3)) : 1,
    post,
    meta
  };
  try {
    writeAtomic(path.join(resolved, 'search.idx.json'), JSON.stringify(indexData));
  } catch {}
  return indexData;
}

export function loadIndex(memoryDir) {
  const resolved = ensureMemoryDir(memoryDir);
  const idxPath = path.join(resolved, 'search.idx.json');
  const rev = readState(resolved).revision;
  const currentSig = [rev, ...collectIndexableFiles(resolved).map(f => [f.rel, f.mtime, f.size])];
  if (fs.existsSync(idxPath)) {
    try {
      const cached = JSON.parse(fs.readFileSync(idxPath, 'utf8'));
      if (cached && cached.schema === INDEX_SCHEMA && JSON.stringify(cached.sig) === JSON.stringify(currentSig)) {
        return cached;
      }
    } catch {}
  }
  return buildIndex(resolved);
}

/**
 * 倒排索引 + 同义词扩展 + 文件权重 + 时间衰减检索。
 */
export function searchMemory(memoryDir, query, limit = 15, options = {}) {
  const resolved = ensureMemoryDir(memoryDir);
  const rawQuery = normalizeText(query, 500);
  const includeInactive = options?.includeInactive === true;
  const qTokens = [...new Set(tokenize(rawQuery))];
  if (qTokens.length === 0) {
    return { query: rawQuery, count: 0, confidence: 'low', items: [], mode: 'lexical' };
  }

  const idx = loadIndex(resolved);
  const synMap = loadSynonymMap(resolved);
  const expandedWeights = new Map();
  for (const tk of qTokens) {
    expandedWeights.set(tk, 1.0);
    const peers = synMap.get(tk);
    if (peers) {
      for (const peer of peers) {
        if (!expandedWeights.has(peer)) expandedWeights.set(peer, 0.9);
      }
    }
  }
  // Exact 3-character CJK phrases add a reduced-weight bonus; they are not "direct" tokens and do
  // not affect coverage.
  for (const tri of new Set(cjkTrigrams(rawQuery))) {
    if (!expandedWeights.has(tri)) expandedWeights.set(tri, TRIGRAM_WEIGHT);
  }

  const totalDocs = Math.max(1, idx.n || 1);
  const rawScores = new Map();
  const directHits = new Map();

  for (const [tk, weight] of expandedWeights.entries()) {
    const docIds = idx.post[tk];
    if (!Array.isArray(docIds) || docIds.length === 0) continue;
    const idf = Math.log(1 + totalDocs / (1 + docIds.length)) * weight;
    const isDirect = qTokens.includes(tk);
    for (const docId of docIds) {
      rawScores.set(docId, (rawScores.get(docId) || 0) + idf);
      if (isDirect) directHits.set(docId, (directHits.get(docId) || 0) + 1);
    }
  }

  const ranked = [];
  const todayMs = Date.now();

  for (const [docId, baseScore] of rawScores.entries()) {
    const entry = idx.meta[docId];
    if (!entry) continue;
    const inactive = entry[4] === 1 || (entry[5] > 0 && entry[5] < todayMs) || (entry[6] > 0 && entry[6] > todayMs);
    if (inactive && !includeInactive) continue;
    const [relFile, lineNo, text] = entry;
    const directCount = directHits.get(docId) || 0;
    const coverage = directCount / qTokens.length;
    if (qTokens.length >= 2 && directCount > 0 && coverage < 0.6) {
      // Allow strong synonym match, otherwise penalize noisy single-char CJK overlap
      const hasAsciiHit = qTokens.some(t => /^[a-z0-9]/.test(t) && text.toLowerCase().includes(t));
      if (!hasAsciiHit && baseScore < 2.2) continue;
    }

    let factor = coverage > 0 ? (0.55 + 0.45 * coverage) : 0.72;
    if (text.toLowerCase().includes(rawQuery.toLowerCase())) factor *= 1.35;

    const baseName = path.basename(relFile);
    let fileWeight = FILE_WEIGHTS[baseName] || 1.0;
    if (relFile.startsWith('archive/')) fileWeight *= 0.7;
    if (relFile === 'EVENTS.jsonl') fileWeight *= 0.65;

    let recency = 1.0;
    const dm = text.match(/(\d{4}-\d{2}-\d{2})/);
    if (dm) {
      const parsedMs = Date.parse(`${dm[1]}T00:00:00`);
      if (Number.isFinite(parsedMs)) {
        const ageDays = Math.max(0, (todayMs - parsedMs) / 86_400_000);
        recency = 1.0 + Math.max(0, 0.3 - ageDays / 100);
      }
    }

    // BM25 length normalisation with binary term frequency: equals 1.0 for an average-length line,
    // so the existing confidence thresholds keep their meaning while long catch-all lines that
    // happen to contain many query tokens no longer outrank short precise entries.
    const avgLen = Math.max(1, Number(idx.avgLen) || 1);
    const docLen = Math.max(1, Number(entry[3]) || avgLen);
    const lengthNorm = (1 + BM25_K1) / (1 + BM25_K1 * (1 - BM25_B + BM25_B * docLen / avgLen));
    const finalScore = Number((baseScore * factor * fileWeight * recency * lengthNorm).toFixed(3));
    ranked.push({ score: finalScore, file: relFile, line: lineNo, text, ...(inactive ? { inactive: true } : {}) });
  }

  ranked.sort((a, b) => b.score - a.score || a.file.localeCompare(b.file) || a.line - b.line);

  // Deduplicate identical text lines across live files and archives
  const deduped = [];
  const seenText = new Set();
  const cap = Math.max(1, Math.min(50, Number(limit) || 15));
  for (const item of ranked) {
    const normKey = item.text.replace(/\s+/g, ' ').trim();
    if (seenText.has(normKey)) continue;
    seenText.add(normKey);
    deduped.push(item);
    if (deduped.length >= cap) break;
  }

  const topScore = deduped[0]?.score || 0;
  const confidence = topScore >= 3.0 ? 'high' : topScore >= 1.5 ? 'mid' : 'low';
  return { query: rawQuery, count: deduped.length, confidence, items: deduped, mode: 'lexical' };
}

/**
 * 轻量精准召回（<= limit 条，字符预算 <= budget）。
 */
export function recall(memoryDir, query, limit = 5, budget = 800, options = {}) {
  const capLimit = Math.max(1, Math.min(20, Number(limit) || 5));
  const capBudget = Math.max(100, Math.min(8000, Number(budget) || 800));
  const searched = searchMemory(memoryDir, query, Math.max(capLimit * 3, 15), options);
  return formatRecallResult(searched, capLimit, capBudget);
}

// ---- step03 可选语义向量混合检索（OpenAI 兼容 POST {baseUrl}/embeddings；零新依赖、不下载模型） ----
// 配置：环境变量 OPENCODE_MEMORY_EMBED_URL / OPENCODE_MEMORY_EMBED_MODEL（或记忆根 embed.json 的 baseUrl/model），
// 密钥只从环境变量 OPENCODE_MEMORY_EMBED_KEY 读取，embed.json 中的密钥字段一律忽略。
// 向量按条目文本哈希缓存于 search.vec.json（int8 量化、增量补齐）；与词法排名用倒数排名融合（RRF）。
// 未配置、调用失败或超时（默认 8 秒）时静默回退词法检索，结果 mode 标注 "lexical" / "hybrid"。
const EMBED_CONFIG_FILE = 'embed.json';
const VEC_CACHE_FILE = 'search.vec.json';
const VEC_CACHE_SCHEMA = 1;
const RRF_K = 60;

export function resolveEmbedConfig(memoryDir) {
  const env = process.env;
  const warnings = [];
  let fileCfg = null;
  let fileSource = '';
  try {
    let dir = path.resolve(String(memoryDir || '.'));
    for (let i = 0; i < 7; i += 1) {
      const fp = path.join(dir, EMBED_CONFIG_FILE);
      if (fs.existsSync(path.join(dir, 'STATE.json')) && fs.existsSync(fp)) {
        fileCfg = JSON.parse(fs.readFileSync(fp, 'utf8'));
        fileSource = fp;
        break;
      }
      const parent = path.dirname(dir);
      if (!parent || parent === dir) break;
      dir = parent;
    }
  } catch (err) {
    warnings.push(`embed.json 解析失败，已忽略：${singleLine(err?.message || err, 120)}`);
    fileCfg = null;
  }
  if (!fileCfg || typeof fileCfg !== 'object' || Array.isArray(fileCfg)) fileCfg = null;
  if (fileCfg) {
    for (const k of ['key', 'apiKey', 'api_key', 'authorization', 'token', 'secret']) {
      if (k in fileCfg) warnings.push(`embed.json 中的 ${k} 字段已忽略：密钥只从环境变量 OPENCODE_MEMORY_EMBED_KEY 读取，不写入记忆目录。`);
    }
  }
  if (String(env.OPENCODE_MEMORY_EMBED || '').trim() === '0' || fileCfg?.enabled === false) {
    return { enabled: false, reason: 'disabled', warnings };
  }
  const baseUrl = String(env.OPENCODE_MEMORY_EMBED_URL || fileCfg?.baseUrl || fileCfg?.base_url || fileCfg?.url || '').trim().replace(/\/+$/, '');
  const model = String(env.OPENCODE_MEMORY_EMBED_MODEL || fileCfg?.model || '').trim();
  if (!baseUrl || !model) return { enabled: false, reason: 'not_configured', warnings };
  if (!/^https?:\/\//i.test(baseUrl)) return { enabled: false, reason: 'invalid_url', warnings };
  const num = (v, d, lo, hi) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? Math.max(lo, Math.min(hi, Math.trunc(n))) : d;
  };
  const dimensions = num(fileCfg?.dimensions, 0, 1, 8192);
  return {
    enabled: true,
    baseUrl,
    model,
    endpoint: /\/embeddings$/i.test(baseUrl) ? baseUrl : `${baseUrl}/embeddings`,
    key: String(env.OPENCODE_MEMORY_EMBED_KEY || '').trim(),
    timeoutMs: num(env.OPENCODE_MEMORY_EMBED_TIMEOUT_MS || fileCfg?.timeout_ms, 8000, 1000, 30000),
    batchSize: num(fileCfg?.batch_size, 64, 1, 256),
    maxNewPerCall: num(fileCfg?.max_new_per_call, 256, 8, 4000),
    maxDocs: num(fileCfg?.max_docs, 3000, 50, 5000),
    ...(dimensions ? { dimensions } : {}),
    source: env.OPENCODE_MEMORY_EMBED_URL ? 'env' : (fileSource || 'env'),
    warnings
  };
}

function redactForEmbedding(text) {
  let s = String(text || '');
  for (const pat of SECRET_PATTERNS) {
    s = s.replace(new RegExp(pat.re.source, pat.re.flags.includes('g') ? pat.re.flags : `${pat.re.flags}g`), '[REDACTED]');
  }
  return s.slice(0, 2000);
}

function normalizeVector(arr) {
  const v = Float32Array.from(arr, x => Number(x) || 0);
  let n = 0;
  for (let i = 0; i < v.length; i += 1) n += v[i] * v[i];
  n = Math.sqrt(n) || 1;
  for (let i = 0; i < v.length; i += 1) v[i] /= n;
  return v;
}

function quantizeVector(v) {
  const q = new Int8Array(v.length);
  for (let i = 0; i < v.length; i += 1) q[i] = Math.max(-127, Math.min(127, Math.round(v[i] * 127)));
  return Buffer.from(q.buffer, q.byteOffset, q.byteLength).toString('base64');
}

function dequantizeVector(b64) {
  const buf = Buffer.from(String(b64 || ''), 'base64');
  return new Int8Array(buf.buffer, buf.byteOffset, buf.byteLength);
}

// qv is unit length; the stored int8 vector is renormalised here, so this is the cosine.
function cosineQuantized(qv, dv) {
  if (!qv || !dv || qv.length !== dv.length) return 0;
  let dot = 0;
  let n = 0;
  for (let i = 0; i < dv.length; i += 1) { dot += qv[i] * dv[i]; n += dv[i] * dv[i]; }
  return n ? dot / Math.sqrt(n) : 0;
}

function shortEmbedError(err) {
  const m = String(err?.message || err || 'error');
  return (/^EMBED_[A-Z0-9_]+/.exec(m)?.[0] || singleLine(m, 60)).replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]');
}

async function callEmbeddingProvider(cfg, inputs, timeoutMs) {
  if (typeof fetch !== 'function') throw new Error('EMBED_NO_FETCH');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), Math.max(200, Number(timeoutMs) || cfg.timeoutMs || 8000));
  try {
    const res = await fetch(cfg.endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json', ...(cfg.key ? { authorization: `Bearer ${cfg.key}` } : {}) },
      body: JSON.stringify({ model: cfg.model, input: inputs.map(redactForEmbedding), ...(cfg.dimensions ? { dimensions: cfg.dimensions } : {}) }),
      signal: ctrl.signal
    });
    if (!res.ok) throw new Error(`EMBED_HTTP_${res.status}`);
    const json = await res.json();
    const data = Array.isArray(json?.data) ? [...json.data].sort((a, b) => (a?.index ?? 0) - (b?.index ?? 0)) : null;
    if (!data || data.length !== inputs.length) throw new Error('EMBED_BAD_RESPONSE');
    return data.map(d => {
      if (!Array.isArray(d?.embedding) || d.embedding.length === 0) throw new Error('EMBED_BAD_VECTOR');
      return d.embedding;
    });
  } catch (err) {
    if (err?.name === 'AbortError') throw new Error('EMBED_TIMEOUT');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function embedCacheIdentity(cfg) {
  return crypto.createHash('sha256').update(`${cfg.endpoint}|${cfg.model}|${cfg.dimensions || ''}`).digest('hex').slice(0, 16);
}

function vecTextHash(text) {
  return crypto.createHash('sha256').update(String(text || '')).digest('hex').slice(0, 20);
}

function loadVecCache(resolved, ident) {
  try {
    const c = JSON.parse(fs.readFileSync(path.join(resolved, VEC_CACHE_FILE), 'utf8'));
    if (c?.schema === VEC_CACHE_SCHEMA && c.ident === ident && c.vectors && typeof c.vectors === 'object') {
      return { ident, dims: Number(c.dims) || 0, vectors: Object.assign(Object.create(null), c.vectors) };
    }
  } catch {}
  return { ident, dims: 0, vectors: Object.create(null) };
}

function saveVecCache(resolved, cache, keepHashes) {
  const vectors = {};
  for (const h of keepHashes) if (cache.vectors[h]) vectors[h] = cache.vectors[h];
  try {
    writeAtomic(path.join(resolved, VEC_CACHE_FILE), JSON.stringify({ schema: VEC_CACHE_SCHEMA, engine: MEMORY_ENGINE_VERSION, ident: cache.ident, dims: cache.dims, updatedAt: nowIso(), vectors }));
  } catch {}
}

/**
 * 异步混合检索：词法排名 + 可选语义向量排名，倒数排名融合。未配置/失败/超时自动回退词法（mode="lexical"）。
 * options：includeInactive；embedder(inputs, timeoutMs) 注入自定义向量函数（自检用）；hybridState 跨多个记忆源共享
 * { deadline, queryVecs, failed }，保证一次调用总耗时受同一个超时约束且查询只向量化一次。
 */
export async function searchMemoryHybrid(memoryDir, query, limit = 15, options = {}) {
  const resolved = ensureMemoryDir(memoryDir);
  const cap = Math.max(1, Math.min(50, Number(limit) || 15));
  const lexical = searchMemory(resolved, query, Math.max(cap * 3, 30), options);
  const lexicalOut = extra => ({ ...lexical, count: Math.min(cap, lexical.items.length), items: lexical.items.slice(0, cap), mode: 'lexical', ...extra });
  const injected = typeof options?.embedder === 'function';
  const cfg = injected
    ? { enabled: true, endpoint: 'injected', model: String(options.embedModel || 'injected'), timeoutMs: Number(options.timeoutMs) || 8000, batchSize: 64, maxNewPerCall: 4000, maxDocs: 5000, warnings: [] }
    : resolveEmbedConfig(resolved);
  const cfgWarnings = cfg.warnings?.length ? { embed_warnings: cfg.warnings } : {};
  if (!cfg.enabled) return lexicalOut({ embed_status: cfg.reason, ...cfgWarnings });
  const rawQuery = lexical.query;
  if (!rawQuery) return lexicalOut({ embed_status: 'empty_query' });
  const st = options.hybridState && typeof options.hybridState === 'object' ? options.hybridState : {};
  if (st.failed) return lexicalOut({ embed_status: `fallback:${st.failed}`, ...cfgWarnings });
  if (!st.deadline) st.deadline = Date.now() + cfg.timeoutMs;
  if (!(st.queryVecs instanceof Map)) st.queryVecs = new Map();
  const left = () => st.deadline - Date.now();
  const embed = injected
    ? async (inputs, ms) => (await options.embedder(inputs, ms)).map(normalizeVector)
    : async (inputs, ms) => (await callEmbeddingProvider(cfg, inputs, ms)).map(normalizeVector);
  try {
    const ident = embedCacheIdentity(cfg);
    const qKey = `${ident}|${rawQuery}`;
    let qv = st.queryVecs.get(qKey);
    if (!qv) {
      if (left() <= 50) throw new Error('EMBED_TIMEOUT');
      [qv] = await embed([rawQuery], left());
      st.queryVecs.set(qKey, qv);
    }
    const idx = loadIndex(resolved);
    const nowMs = Date.now();
    const live = [];
    const archived = [];
    for (let id = 0; id < idx.meta.length; id += 1) {
      const m = idx.meta[id];
      if (!m || String(m[2]).startsWith('#')) continue;
      if (!options.includeInactive && (m[4] === 1 || (m[5] && m[5] < nowMs) || (m[6] && m[6] > nowMs))) continue;
      (String(m[0]).startsWith('archive/') ? archived : live).push({ m, hash: vecTextHash(m[2]) });
    }
    const docs = [...live, ...archived].slice(0, cfg.maxDocs);
    const cache = loadVecCache(resolved, ident);
    const missing = [];
    const queued = new Set();
    for (const d of docs) {
      if (!cache.vectors[d.hash] && !queued.has(d.hash)) { queued.add(d.hash); missing.push(d); }
    }
    let embeddedNow = 0;
    let partialReason = '';
    const todo = missing.slice(0, cfg.maxNewPerCall);
    for (let i = 0; i < todo.length; i += cfg.batchSize) {
      if (left() < 300) { partialReason = 'deadline'; break; }
      const batch = todo.slice(i, i + cfg.batchSize);
      let vecs;
      try { vecs = await embed(batch.map(d => d.m[2]), left()); } catch (err) { partialReason = shortEmbedError(err); break; }
      vecs.forEach((v, k) => { cache.vectors[batch[k].hash] = quantizeVector(v); cache.dims = v.length; });
      embeddedNow += batch.length;
    }
    if (embeddedNow > 0) saveVecCache(resolved, cache, new Set(docs.map(d => d.hash)));

    const vecRanked = [];
    for (const d of docs) {
      const b64 = cache.vectors[d.hash];
      if (!b64) continue;
      const sim = cosineQuantized(qv, dequantizeVector(b64));
      if (sim > 0) vecRanked.push({ d, sim });
    }
    if (vecRanked.length === 0) {
      return lexicalOut({ embed_status: partialReason ? `fallback:${partialReason}` : 'no_vectors', ...cfgWarnings });
    }
    vecRanked.sort((a, b) => b.sim - a.sim);
    const vecTop = vecRanked.slice(0, Math.max(cap * 3, 30));
    const fused = new Map();
    const keyOf = (file, line) => `${file}\u0000${line}`;
    lexical.items.forEach((it, r) => fused.set(keyOf(it.file, it.line), { ...it, lex_rank: r + 1, rrf: 1 / (RRF_K + r + 1) }));
    vecTop.forEach((v, r) => {
      const k = keyOf(v.d.m[0], v.d.m[1]);
      const add = 1 / (RRF_K + r + 1);
      const prev = fused.get(k);
      if (prev) { prev.rrf += add; prev.vec_rank = r + 1; prev.vec_sim = Number(v.sim.toFixed(4)); }
      else fused.set(k, { score: 0, file: v.d.m[0], line: v.d.m[1], text: v.d.m[2], vec_rank: r + 1, vec_sim: Number(v.sim.toFixed(4)), rrf: add });
    });
    const minVecSim = Number.isFinite(Number(options.minVecSim)) ? Number(options.minVecSim) : 0.2;
    const ranked = [...fused.values()]
      .filter(it => it.lex_rank || (it.vec_sim || 0) >= minVecSim)
      .map(it => ({ ...it, rrf: Number(it.rrf.toFixed(5)), match: it.lex_rank && it.vec_rank ? 'both' : (it.lex_rank ? 'lexical' : 'vector') }))
      .sort((a, b) => b.rrf - a.rrf || (b.score || 0) - (a.score || 0));
    const items = [];
    const seen = new Set();
    for (const it of ranked) {
      const k = String(it.text).replace(/\s+/g, ' ').trim();
      if (seen.has(k)) continue;
      seen.add(k);
      items.push(it);
      if (items.length >= cap) break;
    }
    const topSim = items.reduce((mx, it) => Math.max(mx, it.vec_sim || 0), 0);
    let confidence = lexical.confidence;
    if (topSim >= 0.75) confidence = 'high';
    else if (topSim >= 0.55 && confidence === 'low') confidence = 'mid';
    return {
      query: rawQuery,
      count: items.length,
      confidence,
      items,
      mode: 'hybrid',
      embed_status: partialReason ? `partial:${partialReason}` : 'ok',
      vector_docs: vecRanked.length,
      total_docs: docs.length,
      embedded_now: embeddedNow,
      pending_vectors: Math.max(0, missing.length - embeddedNow),
      ...cfgWarnings
    };
  } catch (err) {
    st.failed = shortEmbedError(err);
    return lexicalOut({ embed_status: `fallback:${st.failed}`, ...cfgWarnings });
  }
}

function formatRecallResult(searched, capLimit, capBudget) {
  const extras = {};
  for (const k of ['mode', 'embed_status', 'embed_warnings', 'scope_sources']) if (searched[k] !== undefined) extras[k] = searched[k];
  if (!searched.items || searched.items.length === 0) {
    return { query: searched.query, count: 0, confidence: 'low', text: `（未召回与 "${searched.query}" 相关的历史记忆）`, items: [], ...extras };
  }
  const picked = [];
  const formatted = [];
  let usedChars = 0;
  for (const item of searched.items) {
    if (picked.length >= capLimit) break;
    const line = `[${item.source ? `${item.source}|` : ''}${item.file}:${item.line}] ${item.text}`;
    if (usedChars + line.length > capBudget && picked.length > 0) break;
    const clipped = usedChars + line.length > capBudget ? line.slice(0, Math.max(60, capBudget - usedChars)) + '...' : line;
    formatted.push(clipped);
    picked.push(item);
    usedChars += clipped.length + 1;
  }
  const modeTag = searched.mode ? ` · ${searched.mode}` : '';
  return {
    query: searched.query,
    count: picked.length,
    confidence: searched.confidence,
    text: `【记忆召回 · 置信度 ${searched.confidence}${modeTag} · 共 ${picked.length} 条】\n` + formatted.join('\n'),
    items: picked,
    ...extras
  };
}

/** recall 的异步版本：使用混合检索（未配置向量时与 recall 等价，并标注 mode）。 */
export async function recallAsync(memoryDir, query, limit = 5, budget = 800, options = {}) {
  const capLimit = Math.max(1, Math.min(20, Number(limit) || 5));
  const capBudget = Math.max(100, Math.min(8000, Number(budget) || 800));
  const searched = await searchMemoryHybrid(memoryDir, query, Math.max(capLimit * 3, 15), options);
  return formatRecallResult(searched, capLimit, capBudget);
}

/**
 * 多记忆源合并检索（只读）：sources=[{dir,label,weight}]，结果逐条标注 source/memory_dir。
 * 跨源排序使用可比的绝对信号：词法分 min(1,score/4) 与向量余弦，乘以来源权重。
 */
export async function searchMemorySources(sources, query, limit = 15, options = {}) {
  const cap = Math.max(1, Math.min(50, Number(limit) || 15));
  const st = options.hybridState && typeof options.hybridState === 'object' ? options.hybridState : {};
  const merged = [];
  const perSource = [];
  let rawQuery = normalizeText(query, 500);
  let embedStatus = '';
  for (const src of Array.isArray(sources) ? sources : []) {
    let res;
    try {
      res = options.lexicalOnly
        ? { ...searchMemory(src.dir, query, cap * 2, options), mode: 'lexical' }
        : await searchMemoryHybrid(src.dir, query, cap * 2, { ...options, hybridState: st });
    } catch (err) {
      perSource.push({ source: src.label, memory_dir: src.dir, error: singleLine(err?.message || err, 120) });
      continue;
    }
    rawQuery = res.query || rawQuery;
    if (!embedStatus && res.embed_status) embedStatus = res.embed_status;
    perSource.push({ source: src.label, memory_dir: src.dir, mode: res.mode, count: res.items.length });
    const weight = Number(src.weight) || 1;
    for (const it of res.items) {
      const lex = Math.min(1, (Number(it.score) || 0) / 4);
      const vec = Math.max(0, Number(it.vec_sim) || 0);
      const base = res.mode === 'hybrid' ? (0.55 * lex + 0.45 * vec) : lex;
      merged.push({ ...it, source: src.label, memory_dir: src.dir, cross_score: Number((weight * base).toFixed(4)) });
    }
  }
  merged.sort((a, b) => b.cross_score - a.cross_score || (b.rrf || 0) - (a.rrf || 0) || (b.score || 0) - (a.score || 0));
  const items = [];
  const seen = new Set();
  for (const it of merged) {
    const k = String(it.text).replace(/\s+/g, ' ').trim();
    if (seen.has(k)) continue;
    seen.add(k);
    items.push(it);
    if (items.length >= cap) break;
  }
  const top = items[0]?.cross_score || 0;
  const mode = perSource.some(p => p.mode === 'hybrid') ? 'hybrid' : 'lexical';
  return {
    query: rawQuery,
    count: items.length,
    confidence: top >= 0.74 ? 'high' : top >= 0.37 ? 'mid' : 'low',
    items,
    mode,
    ...(embedStatus ? { embed_status: st.failed ? `fallback:${st.failed}` : embedStatus } : {}),
    scope_sources: perSource
  };
}

// ---- step03 工作区统一解析视图：项目记忆 + 各执行者最新任务检查点/交接（只读，按来源标注） ----

function nativeRootPath(root) {
  let s = String(root || '').trim();
  if (!s) return '';
  const msys = s.match(/^\/([a-zA-Z])(\/.*)?$/);
  if (msys && process.platform === 'win32') s = `${msys[1]}:${msys[2] || '/'}`;
  return s;
}

function hasMemoryState(dir) {
  try { return Boolean(dir) && fs.existsSync(path.join(dir, 'STATE.json')); } catch { return false; }
}

function samePath(a, b) {
  const x = path.resolve(String(a || ''));
  const y = path.resolve(String(b || ''));
  return process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y;
}

/** 由执行者/任务私有目录推回其记忆根（actors/<a> 或 actors/<a>/tasks/<t> -> 根）；其他目录原样返回。 */
export function resolveMemoryRootDir(dir) {
  const resolvedDir = path.resolve(String(dir || '.'));
  const parent = path.dirname(resolvedDir);
  const grandParent = path.dirname(parent);
  if (path.basename(parent) === 'actors') return grandParent;
  if (path.basename(parent) === 'tasks' && path.basename(path.dirname(grandParent)) === 'actors') return path.dirname(path.dirname(grandParent));
  return resolvedDir;
}

function listActorTaskDirs(rootDir, limit = 12) {
  const out = [];
  const actorsDir = path.join(rootDir, 'actors');
  if (!fs.existsSync(actorsDir)) return out;
  const mtimeOf = d => {
    let m = 0;
    for (const f of ['STATE.json', 'task-checkpoint.json', 'HANDOFF.md']) {
      try { m = Math.max(m, fs.statSync(path.join(d, f)).mtimeMs); } catch {}
    }
    return m;
  };
  try {
    for (const a of fs.readdirSync(actorsDir, { withFileTypes: true })) {
      if (!a.isDirectory()) continue;
      const actorDir = path.join(actorsDir, a.name);
      if (hasMemoryState(actorDir)) out.push({ dir: actorDir, kind: 'actor', actor: a.name, ms: mtimeOf(actorDir) });
      const tasksDir = path.join(actorDir, 'tasks');
      if (!fs.existsSync(tasksDir)) continue;
      for (const t of fs.readdirSync(tasksDir, { withFileTypes: true })) {
        if (!t.isDirectory()) continue;
        const taskDir = path.join(tasksDir, t.name);
        if (hasMemoryState(taskDir) || fs.existsSync(path.join(taskDir, 'task-checkpoint.json'))) {
          out.push({ dir: taskDir, kind: 'task', actor: a.name, task: t.name, ms: mtimeOf(taskDir) });
        }
      }
    }
  } catch {}
  out.sort((x, y) => y.ms - x.ms);
  return out.slice(0, limit);
}

/**
 * 收集与工作区相关的只读记忆源（不含调用方自己的目录）：
 * - 每个工作区根的项目记忆 <root>/.opencode-project（以及调用方所在的项目记忆根）；
 * - 这些项目记忆根下各执行者/任务的私有目录（按最近修改，最多 maxActorDirs 个）；
 * - workspace-handoffs 索引登记到该工作区的其他会话（含临时记忆桶）；
 * - includeAllScratch=true 时再加全部非空临时桶（scope=all）。
 * 只纳入已有 STATE.json 的目录，绝不在别人的目录里新建文件。
 */
export function collectWorkspaceSources(ownDir, roots = [], { scratchRoot = '', includeAllScratch = false, maxActorDirs = 12 } = {}) {
  const sources = [];
  const seen = [];
  if (ownDir) seen.push(path.resolve(ownDir));
  const add = (dir, label, weight, kind) => {
    if (!dir) return;
    let r;
    try { r = validateTargetPath(dir); } catch { return; }
    if (seen.some(s => samePath(s, r)) || !hasMemoryState(r)) return;
    seen.push(r);
    sources.push({ dir: r, label, weight, kind });
  };
  const projectRoots = [];
  for (const root of (Array.isArray(roots) ? roots : [roots])) {
    const native = nativeRootPath(root);
    if (!native || !path.isAbsolute(native)) continue;
    let pdir;
    try { pdir = getMemoryDir(native); } catch { continue; }
    if (hasMemoryState(pdir) && !projectRoots.some(p => samePath(p, pdir))) projectRoots.push(pdir);
  }
  if (ownDir) {
    const mr = resolveMemoryRootDir(ownDir);
    if (path.basename(mr) === '.opencode-project' && hasMemoryState(mr) && !projectRoots.some(p => samePath(p, mr))) projectRoots.push(mr);
    // 临时桶（topics/<id> 或 sessions/<id>）内其他执行者的目录：共享主题由用户显式绑定，同桶只读可见。
    const bucketKind = path.basename(path.dirname(mr));
    if (!samePath(mr, path.resolve(ownDir)) && (bucketKind === 'topics' || bucketKind === 'sessions')) {
      for (const t of listActorTaskDirs(mr, maxActorDirs)) {
        add(t.dir, t.kind === 'task' ? `peer-task:${t.task.slice(0, 8)}` : `peer:${t.actor.slice(0, 8)}`, 0.85, t.kind);
      }
    }
  }
  for (const pdir of projectRoots) {
    add(pdir, 'project', 0.95, 'project');
    for (const t of listActorTaskDirs(pdir, maxActorDirs)) {
      let label = t.kind === 'task' ? `task:${t.task.slice(0, 8)}` : `actor:${t.actor.slice(0, 8)}`;
      if (t.kind === 'task') {
        const title = readTaskCheckpointSummary(path.join(t.dir, 'task-checkpoint.json'))?.title;
        if (title) label = `task:${singleLine(title, 24)}`;
      }
      add(t.dir, label, 0.85, t.kind);
    }
  }
  if (scratchRoot) {
    try {
      for (const e of readWorkspaceHandoffs(scratchRoot, roots, ownDir || '')) add(e.memory_dir, `handoff:@${e.label || e.slot || '?'}`, 0.85, 'handoff');
    } catch {}
    if (includeAllScratch) {
      try {
        for (const b of readScratchCatalog(scratchRoot).buckets.slice(0, 30)) {
          for (const d of scratchBucketDirs(b)) add(d, `scratch:${b.id}`, 0.7, 'scratch');
        }
      } catch {}
    }
  }
  return sources.slice(0, 40);
}

function isPlaceholderBullet(line) {
  const t = String(line || '').replace(/^-\s*/, '').trim();
  return !t || AUTO_PLACEHOLDER_RE.test(t) || isGenericNextLine(t) || t.includes('暂无记录');
}

/**
 * 工作区汇总视图（brief 分节用）：项目记忆根的固定集/交接/活跃需求，以及其他执行者/任务的最新手写交接与检查点。
 * 只读取，不写入；自己的目录、brief 已列出的相邻检查点与 handoff 索引条目（由调用方另行展示）不重复。
 */
export function buildWorkspaceView(ownDir, roots = [], { scratchRoot = '', maxActorDirs = 8 } = {}) {
  const lines = [];
  const own = ownDir ? path.resolve(ownDir) : '';
  const known = new Set();
  if (own) {
    for (const cp of collectRootTaskCheckpoints(own, 5)) if (cp.taskId) known.add(cp.taskId);
    const ownCp = readTaskCheckpointSummary(path.join(own, 'task-checkpoint.json'));
    if (ownCp?.taskId) known.add(ownCp.taskId);
  }
  const nowMs = Date.now();
  for (const src of collectWorkspaceSources(own, roots, { scratchRoot, maxActorDirs })) {
    if (src.kind === 'handoff' || src.kind === 'scratch') continue;
    if (src.kind === 'project') {
      const pins = activePinLines(src.dir).slice(-3).map(l => stripEntryPrefix(l));
      const hoText = readUtf8Safe(path.join(src.dir, 'HANDOFF.md'));
      const next = extractMarkdownSection(hoText, '下一步').filter(l => !isPlaceholderBullet(l)).slice(0, 3).map(l => l.replace(/^-\s*/, ''));
      const todo = extractMarkdownSection(hoText, '未完成').filter(l => !isPlaceholderBullet(l)).slice(0, 3).map(l => l.replace(/^-\s*/, ''));
      const reqs = splitLines(readUtf8Safe(path.join(src.dir, 'REQUIREMENTS.md')))
        .filter(l => l.startsWith('- ') && ACTIVE_REQ_TAGS.some(t => l.includes(t)) && !isInactiveEntryLine(l, nowMs));
      if (pins.length) lines.push(`- [project] 固定在场：${pins.join('；')}`);
      if (next.length) lines.push(`- [project] 交接下一步：${next.join('；')}`);
      if (todo.length) lines.push(`- [project] 未完成：${todo.join('；')}`);
      if (reqs.length) lines.push(`- [project] 活跃需求 ${reqs.length} 条：${reqs.slice(-3).map(l => singleLine(stripEntryPrefix(l), 80)).join('；')}`);
      continue;
    }
    const slot = readLatestManualSlot(src.dir);
    const cp = readTaskCheckpointSummary(path.join(src.dir, 'task-checkpoint.json'));
    if (!slot && (!cp || known.has(cp.taskId))) continue;
    const realNext = (slot?.next || []).filter(n => !isPlaceholderBullet(n)).slice(0, 3);
    const unfinished = (slot?.todo || []).filter(n => !isPlaceholderBullet(n)).slice(0, 3);
    const cpUnfinished = cp ? [...cp.inProg, ...cp.pending].slice(0, 3) : [];
    if (!realNext.length && !unfinished.length && !cpUnfinished.length && !(cp && !known.has(cp.taskId))) continue;
    lines.push(`- [${src.label}${slot?.label ? ` @${slot.label}` : ''} · ${slot?.updated_at || cp?.updatedAt || '时间未知'}]${cp ? ` 任务「${singleLine(cp.title, 40)}」(${cp.state})` : ''}`);
    if (realNext.length) lines.push(`  - 下一步：${realNext.join('；')}`);
    if (unfinished.length || cpUnfinished.length) lines.push(`  - 未完成：${(unfinished.length ? unfinished : cpUnfinished).join('；')}`);
    lines.push(`  - memory_dir：${src.dir}`);
  }
  return lines;
}

// ---- 写入、作废、需求流转 ----------------------------------------------------

// Write-time duplicate guard for append-only memory files. An entry whose body (ignoring the
// status/timestamp/actor prefixes) already appears among the most recent active entries is not
// appended again; recall-time dedupe alone let repeated writes grow the files without bound.
const DEDUPE_SCAN_LINES = 120;
function stripEntryPrefix(line) {
  return String(line || '')
    .replace(/^- /, '')
    .replace(/^\[[^\]]*\]\s*/, '')
    .replace(/^\[[^\]]*\]\s*/, '')
    .replace(/^\(@[^)]*\)\s*/, '')
    .trim();
}
function hasRecentDuplicateEntry(filePath, body, statusTag = '') {
  const lines = splitLines(readUtf8Safe(filePath)).slice(-DEDUPE_SCAN_LINES);
  return lines.some(line => {
    if (!line.startsWith('- [') || line.startsWith('- [已作废]') || line.startsWith('- [已被取代→')) return false;
    if (statusTag && !line.startsWith(`- [${statusTag}]`)) return false;
    return stripEntryPrefix(line) === body;
  });
}
function dedupedResult(resolved, kind, actor, extra = {}) {
  return { ok: true, kind, deduped: true, ...extra, actor: actor.label, revision: readState(resolved).revision };
}

// ---- 长期记忆同步：写进任务/执行者私有目录的 note/pin/req/decide 同时追加到项目记忆根 ----
// 私有目录（actors/<a>/tasks/<t>）随任务而生，换任务、换对话后就不在视野里；记忆根才是长期档案。
function mirrorToProjectRoot(resolved, fileName, entry, kind, summary, owner, slot) {
  try {
    const root = resolveMemoryRootDir(resolved);
    if (!root || samePath(root, resolved) || !fs.existsSync(root)) return null;
    ensureMemoryDir(root);
    const fp = path.join(root, fileName);
    if (fileName === 'PINNED.md' && !fs.existsSync(fp)) writeAtomic(fp, PINNED_HEADER);
    if (readUtf8Safe(fp).slice(-20000).includes(entry.trim())) return root;
    fs.appendFileSync(fp, entry, 'utf8');
    bumpState(root, kind, summary, owner, { slot, mirroredFrom: resolved });
    return root;
  } catch { return null; }
}

export function appendNote(memoryDir, text, owner = 'unknown', slot = '', meta = {}) {
  const resolved = ensureMemoryDir(memoryDir);
  const clean = singleLine(text, 2000);
  if (!clean) throw new Error('MEMORY_EMPTY_TEXT: 随手记内容不能为空。');
  const actor = normalizeActor(owner, slot);
  const body = clean + formatEntrySuffix(meta);
  if (hasRecentDuplicateEntry(path.join(resolved, 'NOTES.md'), body)) return dedupedResult(resolved, 'note', actor);
  const line = `- [${nowHuman()}] (@${actor.label}) ${body}\n`;
  fs.appendFileSync(path.join(resolved, 'NOTES.md'), line, 'utf8');
  const mirroredTo = mirrorToProjectRoot(resolved, 'NOTES.md', line, 'note', clean, owner, actor.slot);
  const capped = autocap(resolved);
  const state = bumpState(resolved, 'note', clean, owner, { slot: actor.slot });
  return { ok: true, kind: 'note', actor: actor.label, revision: state.revision, autocap: capped, ...(mirroredTo ? { long_term_root: mirroredTo } : {}) };
}

// ---- 固定在场集（PINNED.md）：身份、硬约束、当前承诺这类不应交给检索的条目 ----
const PINNED_HEADER = '# 固定在场（PINNED）\n> 每次开工随 brief 首段注入，不依赖检索。只放身份、硬约束、当前承诺；上限 25 条，过时用 kind=unpin 作废。\n';
function activePinLines(resolved) {
  const nowMs = Date.now();
  return splitLines(readUtf8Safe(path.join(resolved, 'PINNED.md')))
    .filter(l => l.startsWith('- ') && !isInactiveEntryLine(l, nowMs));
}
export function appendPin(memoryDir, text, owner = 'unknown', slot = '', meta = {}) {
  const resolved = ensureMemoryDir(memoryDir);
  if (!singleLine(text, 400)) throw new Error('MEMORY_EMPTY_TEXT: 固定条目内容不能为空。');
  const clean = singleLine(text, 400) + formatEntrySuffix(meta);
  if (!clean.trim()) throw new Error('MEMORY_EMPTY_TEXT: 固定条目内容不能为空。');
  const actor = normalizeActor(owner, slot);
  const pinPath = path.join(resolved, 'PINNED.md');
  if (hasRecentDuplicateEntry(pinPath, clean)) return dedupedResult(resolved, 'pin', actor);
  const active = activePinLines(resolved);
  if (active.length >= LIMITS['PINNED.md']) {
    throw new Error(`MEMORY_PIN_FULL: PINNED.md 已有 ${active.length} 条（上限 ${LIMITS['PINNED.md']}）。固定集必须保持精简，请先用 kind=unpin 作废过时条目，或改用 kind=note。`);
  }
  if (!fs.existsSync(pinPath)) writeAtomic(pinPath, PINNED_HEADER);
  const pinLine = `- [${nowHuman()}] (@${actor.label}) ${clean}\n`;
  fs.appendFileSync(pinPath, pinLine, 'utf8');
  const mirroredTo = activePinLines(resolveMemoryRootDir(resolved)).length < LIMITS['PINNED.md'] ? mirrorToProjectRoot(resolved, 'PINNED.md', pinLine, 'pin', clean, owner, actor.slot) : null;
  const state = bumpState(resolved, 'pin', clean, owner, { slot: actor.slot });
  return { ok: true, kind: 'pin', actor: actor.label, revision: state.revision, pinned_count: active.length + 1, ...(mirroredTo ? { long_term_root: mirroredTo } : {}) };
}
export function unpin(memoryDir, keyword, owner = 'unknown') {
  const resolved = ensureMemoryDir(memoryDir);
  const kw = singleLine(keyword, 200);
  if (!kw) throw new Error('MEMORY_EMPTY_TEXT: 作废固定条目需要关键词。');
  const pinPath = path.join(resolved, 'PINNED.md');
  const lines = splitLines(readUtf8Safe(pinPath));
  let changed = 0;
  const next = lines.map(l => {
    if (l.startsWith('- ') && !l.startsWith('- [已作废]') && l.includes(kw)) { changed += 1; return `- [已作废] ${l.slice(2)}`; }
    return l;
  });
  if (changed === 0) return { ok: true, kind: 'unpin', changed: 0, revision: readState(resolved).revision };
  writeAtomic(pinPath, next.join('\n').replace(/\n*$/, '\n'));
  const state = bumpState(resolved, 'unpin', kw, owner);
  return { ok: true, kind: 'unpin', changed, revision: state.revision };
}

export function appendRequirement(memoryDir, text, status = '待办', owner = 'unknown', slot = '', meta = {}) {
  const resolved = ensureMemoryDir(memoryDir);
  if (!singleLine(text, 2000)) throw new Error('MEMORY_EMPTY_TEXT: 需求内容不能为空。');
  const clean = singleLine(text, 2000) + formatEntrySuffix(meta);
  const actor = normalizeActor(owner, slot);
  const normalizedStatus = ['待办', '进行中', '已完成', '已取消'].includes(String(status).trim())
    ? String(status).trim()
    : singleLine(status || '待办', 24);
  if (hasRecentDuplicateEntry(path.join(resolved, 'REQUIREMENTS.md'), clean, normalizedStatus)) {
    return dedupedResult(resolved, 'req', actor, { status: normalizedStatus });
  }
  const line = `- [${normalizedStatus}] [${nowHuman()}] (@${actor.label}) ${clean}\n`;
  fs.appendFileSync(path.join(resolved, 'REQUIREMENTS.md'), line, 'utf8');
  const mirroredTo = mirrorToProjectRoot(resolved, 'REQUIREMENTS.md', line, 'req', `[${normalizedStatus}] ${clean}`, owner, actor.slot);
  const capped = autocap(resolved);
  const state = bumpState(resolved, 'req', `[${normalizedStatus}] ${clean}`, owner, { slot: actor.slot });
  return { ok: true, kind: 'req', status: normalizedStatus, actor: actor.label, revision: state.revision, autocap: capped, ...(mirroredTo ? { long_term_root: mirroredTo } : {}) };
}

export function updateRequirementStatus(memoryDir, keyword, nextStatus = '已完成', owner = 'unknown', slot = '') {
  const resolved = ensureMemoryDir(memoryDir);
  const needle = singleLine(keyword, 400);
  if (!needle) throw new Error('MEMORY_EMPTY_KEYWORD: 需求匹配关键词不能为空。');
  const actor = normalizeActor(owner, slot);
  const reqPath = path.join(resolved, 'REQUIREMENTS.md');
  const lines = splitLines(readUtf8Safe(reqPath));
  let updatedCount = 0;
  const nextLines = lines.map(line => {
    if (!line.startsWith('- [') || !line.toLowerCase().includes(needle.toLowerCase())) return line;
    updatedCount += 1;
    return line.replace(/^- \[[^\]]+\]/, `- [${singleLine(nextStatus, 24)}]`);
  });
  if (updatedCount > 0) {
    writeAtomic(reqPath, nextLines.join('\n') + '\n');
    // 同步把记忆根里同一条需求的状态也改掉，长期档案不留过期的「待办」。
    try {
      const root = resolveMemoryRootDir(resolved);
      if (root && !samePath(root, resolved) && hasMemoryState(root)) {
        const rootReqPath = path.join(root, 'REQUIREMENTS.md');
        let rootChanged = 0;
        const rootNext = splitLines(readUtf8Safe(rootReqPath)).map(line => {
          if (!line.startsWith('- [') || !line.toLowerCase().includes(needle.toLowerCase())) return line;
          rootChanged += 1;
          return line.replace(/^- \[[^\]]+\]/, `- [${singleLine(nextStatus, 24)}]`);
        });
        if (rootChanged) { writeAtomic(rootReqPath, rootNext.join('\n') + '\n'); bumpState(root, 'req-status', `${needle} -> [${nextStatus}] (${rootChanged})`, owner, { slot: actor.slot, mirroredFrom: resolved }); }
      }
    } catch {}
    const capped = autocap(resolved);
    const state = bumpState(resolved, 'req-status', `${needle} -> [${nextStatus}] (${updatedCount})`, owner, { slot: actor.slot });
    return { ok: true, updated: updatedCount, status: nextStatus, actor: actor.label, revision: state.revision, autocap: capped };
  }
  return { ok: true, updated: 0, status: nextStatus, actor: actor.label, revision: readState(resolved).revision };
}

export function appendDecision(memoryDir, title, detail, owner = 'unknown', slot = '', meta = {}) {
  const resolved = ensureMemoryDir(memoryDir);
  const cleanTitle = singleLine(title || '架构决策', 200) + formatEntrySuffix(meta);
  const cleanDetail = normalizeText(detail, 3000);
  if (!cleanDetail) throw new Error('MEMORY_EMPTY_TEXT: 决策正文不能为空。');
  const actor = normalizeActor(owner, slot);
  const detailBullets = splitLines(cleanDetail).map(l => l.startsWith('- ') ? l : `- ${l}`).join('\n');
  if (readUtf8Safe(path.join(resolved, 'DECISIONS.md')).slice(-20000).includes(`) ${cleanTitle}\n${detailBullets}\n`)) {
    return dedupedResult(resolved, 'decide', actor);
  }
  const block = `\n## [${nowHuman()}] (@${actor.label}) ${cleanTitle}\n${detailBullets}\n`;
  fs.appendFileSync(path.join(resolved, 'DECISIONS.md'), block, 'utf8');
  const mirroredTo = mirrorToProjectRoot(resolved, 'DECISIONS.md', block, 'decide', `${cleanTitle}: ${cleanDetail}`, owner, actor.slot);
  const capped = autocap(resolved);
  const state = bumpState(resolved, 'decide', `${cleanTitle}: ${cleanDetail}`, owner, { slot: actor.slot });
  return { ok: true, kind: 'decide', actor: actor.label, revision: state.revision, autocap: capped, ...(mirroredTo ? { long_term_root: mirroredTo } : {}) };
}

export function appendLog(memoryDir, text, owner = 'unknown', slot = '') {
  const resolved = ensureMemoryDir(memoryDir);
  const clean = singleLine(text, 2000);
  if (!clean) throw new Error('MEMORY_EMPTY_TEXT: 工作日志内容不能为空。');
  const actor = normalizeActor(owner, slot);
  if (hasRecentDuplicateEntry(path.join(resolved, 'WORKLOG.md'), clean)) return dedupedResult(resolved, 'log', actor);
  const line = `- [${nowHuman()}] (@${actor.label}) ${clean}\n`;
  fs.appendFileSync(path.join(resolved, 'WORKLOG.md'), line, 'utf8');
  const capped = autocap(resolved);
  const state = bumpState(resolved, 'log', clean, owner, { slot: actor.slot });
  return { ok: true, kind: 'log', actor: actor.label, revision: state.revision, autocap: capped };
}

export function forget(memoryDir, keyword, owner = 'unknown') {
  const resolved = ensureMemoryDir(memoryDir);
  const kw = singleLine(keyword, 400);
  if (!kw) return { ok: false, count: 0, error: 'keyword required' };
  const notesPath = path.join(resolved, 'NOTES.md');
  const raw = readUtf8Safe(notesPath);
  const lines = splitLines(raw);
  let count = 0;
  const kwLower = kw.toLowerCase();
  const nextLines = lines.map(line => {
    if (line.startsWith('- ') && !line.startsWith('- [已作废]') && line.toLowerCase().includes(kwLower)) {
      count += 1;
      return `- [已作废] ${line.slice(2)}`;
    }
    return line;
  });
  let backupFile = null;
  if (count > 0) {
    backupFile = path.join(resolved, `NOTES.md.bak-${timeOnlyStamp()}`);
    writeAtomic(backupFile, raw);
    writeAtomic(notesPath, nextLines.join('\n') + '\n');
    autocap(resolved);
    const state = bumpState(resolved, 'forget', `作废关键词 "${kw}" (${count} 条)`, owner);
    return { ok: true, count, backup: backupFile, revision: state.revision };
  }
  return { ok: true, count: 0, revision: readState(resolved).revision };
}


// ---- step03 交接时自动提取候选事实（[自动·待确认]）与确认 ----
const DECISION_CUE_RE = /(决定|决策|采用|改用|改为|选用|选型|统一(为|用|改)|不再|弃用|废弃|迁移到|切换到|以后都|约定)/;
const CONSTRAINT_CUE_RE = /(禁止|不得|不要|严禁|必须|务必|一律|只能|仅限|不允许)/;
const AUTO_CANDIDATE_CAP = 6;

function collectActiveEntryBodies(resolved) {
  const all = [];
  const status = [];
  const nowMs = Date.now();
  for (const fn of ['NOTES.md', 'PINNED.md', 'REQUIREMENTS.md']) {
    for (const l of splitLines(readUtf8Safe(path.join(resolved, fn)))) {
      if (!l.startsWith('- ') || isInactiveEntryLine(l, nowMs)) continue;
      const body = stripEntryMeta(stripEntryPrefix(l));
      if (fn === 'NOTES.md' && body.startsWith('需求状态：')) status.push(body.slice('需求状态：'.length));
      else all.push(body.replace(/^(决策|约束)：/, ''));
    }
  }
  let blockInactive = false;
  for (const l of splitLines(readUtf8Safe(path.join(resolved, 'DECISIONS.md')))) {
    if (l.startsWith('## ')) {
      blockInactive = isInactiveEntryLine(l, nowMs);
      if (!blockInactive) all.push(stripEntryMeta(stripEntryPrefix(`- ${l.slice(3)}`)));
    } else if (l.startsWith('- ') && !blockInactive) {
      all.push(stripEntryMeta(l.slice(2)));
    }
  }
  return { all, status };
}

function isNearDuplicateBody(body, bodies, threshold = 0.85) {
  const norm = normalizeForDedupe(body);
  if (!norm) return true;
  const toks = dedupeTokenSet(body);
  return bodies.some(b => {
    const nb = normalizeForDedupe(b);
    if (!nb) return false;
    if (nb === norm || (norm.length >= 8 && nb.includes(norm))) return true;
    return tokenJaccardSets(toks, dedupeTokenSet(b)) >= threshold;
  });
}

/**
 * 从交接字段推导候选持久条目（决策 / 约束 / 需求状态变化），与现有条目去重，过滤套话与占位。
 * 手写交接读取 constraints、summary、stage、done；自动归档（auto=true）只做「已完成步骤 → 活跃需求」状态匹配。
 */
export function extractHandoffCandidates(memoryDir, options = {}) {
  const resolved = ensureMemoryDir(memoryDir);
  const isAuto = options?.auto === true;
  const items = v => (v === undefined || v === null || v === '')
    ? []
    : (Array.isArray(v) ? v : splitLines(String(v))).map(x => singleLine(x, 300).replace(/^-\s*/, '').trim()).filter(Boolean);
  const meaningful = t => t.length >= 6 && !AUTO_PLACEHOLDER_RE.test(t) && !AUTO_BOILERPLATE_RE.test(t) &&
    !isGenericNextLine(t) && !SECRET_PATTERNS.some(p => p.re.test(t));
  const raw = [];
  if (!isAuto) {
    for (const c of items(options.constraints)) if (meaningful(c)) raw.push({ category: '约束', body: c });
    for (const t of [...items(options.summary), ...items(options.stage), ...items(options.done)]) {
      if (!meaningful(t)) continue;
      if (CONSTRAINT_CUE_RE.test(t)) raw.push({ category: '约束', body: t });
      else if (DECISION_CUE_RE.test(t)) raw.push({ category: '决策', body: t });
    }
  }
  const nowMs = Date.now();
  const activeReqs = splitLines(readUtf8Safe(path.join(resolved, 'REQUIREMENTS.md')))
    .filter(l => l.startsWith('- ') && ACTIVE_REQ_TAGS.some(t => l.includes(t)) && !isInactiveEntryLine(l, nowMs))
    .map(l => stripEntryMeta(stripEntryPrefix(l)))
    .filter(Boolean);
  const doneItems = items(options.done).filter(t => t.length >= 4 && !AUTO_PLACEHOLDER_RE.test(t) && !AUTO_BOILERPLATE_RE.test(t));
  for (const req of activeReqs) {
    const reqNorm = normalizeForDedupe(req);
    const reqToks = dedupeTokenSet(req);
    const hit = doneItems.find(d => {
      const dn = normalizeForDedupe(d);
      if (dn.length >= 6 && reqNorm.length >= 6 && (reqNorm.includes(dn) || dn.includes(reqNorm))) return true;
      return tokenJaccardSets(reqToks, dedupeTokenSet(d)) >= 0.6;
    });
    if (hit) raw.push({ category: '需求状态', body: `${singleLine(req, 160)} → 已完成`, evidence: hit });
  }
  const existing = collectActiveEntryBodies(resolved);
  const kept = [];
  for (const c of raw) {
    if (c.category === '需求状态') {
      if (isNearDuplicateBody(c.body, [...existing.status, ...kept.filter(k => k.category === '需求状态').map(k => k.body)])) continue;
    } else if (isNearDuplicateBody(c.body, [...existing.all, ...kept.filter(k => k.category !== '需求状态').map(k => k.body)])) {
      continue;
    }
    kept.push(c);
    if (kept.length >= AUTO_CANDIDATE_CAP) break;
  }
  return kept;
}

function writeAutoCandidates(resolved, candidates, actor) {
  if (!candidates.length) return 0;
  const stamp = nowHuman();
  const lines = candidates.map(c => `- ${AUTO_PENDING_TAG} [${stamp}] (@${actor.label}) ${c.category}：${c.body}${c.evidence ? `（依据：交接「已完成」${singleLine(c.evidence, 80)}）` : ''}`);
  fs.appendFileSync(path.join(resolved, 'NOTES.md'), lines.join('\n') + '\n', 'utf8');
  return lines.length;
}

/**
 * 确认 [自动·待确认] 条目（keyword 匹配，"*" 表示全部）：
 * - 约束：去掉待确认标签，保留为正式随手记；
 * - 决策：写入 DECISIONS.md，随手记行标为 [已作废]（已转入决策台账）；
 * - 需求状态：按关键词更新 REQUIREMENTS.md 状态，随手记行标为 [已作废]（已应用）。
 */
export function confirmAutoEntries(memoryDir, keyword, owner = 'unknown', slot = '') {
  const resolved = ensureMemoryDir(memoryDir);
  const kw = singleLine(keyword, 400).toLowerCase();
  if (!kw) throw new Error('MEMORY_EMPTY_KEYWORD: 确认自动条目需要关键词（传 "*" 确认全部待确认条目）。');
  const actor = normalizeActor(owner, slot);
  const notesPath = path.join(resolved, 'NOTES.md');
  const lines = splitLines(readUtf8Safe(notesPath));
  const stamp = nowHuman();
  const actions = [];
  const nextLines = lines.map(line => {
    if (!line.startsWith('- ') || !line.includes(AUTO_PENDING_TAG) || isInactiveEntryLine(line)) return line;
    if (kw !== '*' && !line.toLowerCase().includes(kw)) return line;
    const cleaned = line.replace(`${AUTO_PENDING_TAG} `, '').replace(AUTO_PENDING_TAG, '');
    const body = stripEntryMeta(stripEntryPrefix(cleaned));
    let m;
    if ((m = body.match(/^决策：(.+)$/))) {
      actions.push({ type: 'decide', text: m[1] });
      return `- [已作废] ${cleaned.slice(2)}（已确认 @${actor.label} ${stamp}，已写入 DECISIONS.md）`;
    }
    if ((m = body.match(/^需求状态：(.+?) → ([^（\s]+)/))) {
      actions.push({ type: 'req_status', keyword: m[1], status: m[2] });
      return `- [已作废] ${cleaned.slice(2)}（已确认 @${actor.label} ${stamp}，已更新 REQUIREMENTS.md）`;
    }
    actions.push({ type: 'note', text: body });
    return `${cleaned}（已确认 @${actor.label} ${stamp}）`;
  });
  if (!actions.length) return { ok: true, kind: 'confirm', confirmed: 0, actor: actor.label, revision: readState(resolved).revision };
  writeAtomic(notesPath, nextLines.join('\n') + '\n');
  const applied = [];
  for (const a of actions) {
    if (a.type === 'decide') {
      const r = appendDecision(resolved, singleLine(a.text, 60), a.text, owner, slot);
      applied.push({ type: 'decide', text: singleLine(a.text, 120), deduped: r.deduped === true });
    } else if (a.type === 'req_status') {
      const r = updateRequirementStatus(resolved, a.keyword, a.status, owner, slot);
      applied.push({ type: 'req_status', keyword: singleLine(a.keyword, 120), status: a.status, updated: r.updated });
    } else {
      applied.push({ type: 'note', text: singleLine(a.text, 120) });
    }
  }
  const state = bumpState(resolved, 'confirm', `确认自动条目 ${actions.length} 条`, owner, { slot: actor.slot });
  return { ok: true, kind: 'confirm', confirmed: actions.length, applied, actor: actor.label, revision: state.revision };
}

// ---- step03 记忆整合（consolidate）：全文件精确/近似去重 + 主题取代标记 + 过期统计 ----
const CONSOLIDATE_LINE_FILES = ['NOTES.md', 'REQUIREMENTS.md', 'PINNED.md', 'WORKLOG.md'];
const SUBJECT_STOP_WORDS = new Set(['注意', '提示', '备注', '结论', '排查', '经验', '问题', '原因', '发现', '约束', '决策', '需求状态',
  '交接总结', '步骤进展', '自动归档', 'todo', 'note', 'notes', '注', '说明', '记录', '补充', '更新', '修复', '进展', '风险', '待办', '下一步', 'tip', 'warning', 'warn', 'info']);
const DEFAULT_DECISION_TITLES = new Set(['架构决策', '决策', '技术决策', '设计决策']);

function noteSubjectKey(rawLine, body) {
  const tagged = String(rawLine || '').match(SUBJECT_TAG_RE);
  if (tagged) return normalizeForDedupe(tagged[1]);
  const m = String(body || '').match(/^([^：:，,。；;\s][^：:，,。；;]{1,23})[：:]/);
  if (!m) return '';
  const k = m[1].trim();
  if (SUBJECT_STOP_WORDS.has(k.toLowerCase()) || /^\d/.test(k) || /^https?$/i.test(k) || tokenize(k).length === 0) return '';
  return normalizeForDedupe(k);
}

/**
 * 记忆整合：默认 dry-run 只返回预览；apply=true 才写入（调用方须持有 withMemoryLock）。
 * - 精确重复（规范化文本相同）与近似重复（词元 Jaccard >= jaccard，默认 0.85）覆盖整个文件，保留最新一条；
 *   WORKLOG 只做精确去重；待确认的自动条目与正式条目重复时优先删除自动条目。
 * - 取代：NOTES 中主题键（〔主题:xxx〕或「主题：」前缀）相同、DECISIONS 中标题/主题相同的旧条目标记 [已被取代→#新ID 时间]。
 * - 过期条目（valid_until 已过）只统计，brief 与检索默认跳过。
 * apply 时原文件备份到 archive/consolidate-backup-<时间>/，被移除的行另存 archive/合并移除-<时间>.md。
 */
export function consolidateMemory(memoryDir, options = {}, owner = 'unknown') {
  const resolved = ensureMemoryDir(memoryDir);
  const apply = options?.apply === true;
  const threshold = Math.max(0.6, Math.min(1, Number(options?.jaccard) || 0.85));
  const fileFilter = Array.isArray(options?.files) && options.files.length ? new Set(options.files.map(f => path.basename(String(f)))) : null;
  const nowMs = Date.now();
  const report = { exact_duplicates: [], near_duplicates: [], superseded: [], expired: [] };
  const changes = new Map();
  const ref = (i, line) => ({ line: i + 1, text: singleLine(line, 160) });
  const pickKeep = arr => [...arr].reverse().find(e => !e.meta.pending) || arr[arr.length - 1];

  for (const fn of CONSOLIDATE_LINE_FILES) {
    if (fileFilter && !fileFilter.has(fn)) continue;
    const fp = path.join(resolved, fn);
    if (!fs.existsSync(fp)) continue;
    const lines = splitLines(readUtf8Safe(fp));
    const entries = [];
    lines.forEach((line, i) => {
      if (!line.startsWith('- ')) return;
      const meta = parseEntryMeta(line);
      if (meta.obsolete || meta.superseded) return;
      const body = stripEntryMeta(stripEntryPrefix(line));
      if (!body) return;
      if (meta.validUntilMs && meta.validUntilMs < nowMs) report.expired.push({ file: fn, ...ref(i, line) });
      entries.push({ i, line, body, meta, norm: normalizeForDedupe(body), toks: dedupeTokenSet(body) });
    });
    const remove = new Set();
    const marks = new Map();
    const byNorm = new Map();
    for (const e of entries) {
      if (!e.norm) continue;
      if (!byNorm.has(e.norm)) byNorm.set(e.norm, []);
      byNorm.get(e.norm).push(e);
    }
    for (const arr of byNorm.values()) {
      if (arr.length < 2) continue;
      const keep = pickKeep(arr);
      const drop = arr.filter(e => e !== keep);
      drop.forEach(d => remove.add(d.i));
      report.exact_duplicates.push({ file: fn, keep: ref(keep.i, keep.line), remove: drop.map(d => ref(d.i, d.line)) });
    }
    if (fn !== 'WORKLOG.md') {
      const pool = entries.filter(e => !remove.has(e.i) && e.toks.size >= 4).slice(-1500);
      for (let a = 0; a < pool.length; a += 1) {
        const ea = pool[a];
        if (remove.has(ea.i)) continue;
        for (let b = a + 1; b < pool.length; b += 1) {
          const eb = pool[b];
          if (remove.has(eb.i)) continue;
          if (Math.min(ea.toks.size, eb.toks.size) / Math.max(ea.toks.size, eb.toks.size) < threshold) continue;
          const j = tokenJaccardSets(ea.toks, eb.toks);
          if (j < threshold) continue;
          const [keep, drop] = ea.meta.pending && !eb.meta.pending ? [eb, ea] : (!ea.meta.pending && eb.meta.pending ? [ea, eb] : [eb, ea]);
          remove.add(drop.i);
          report.near_duplicates.push({ file: fn, jaccard: Number(j.toFixed(3)), keep: ref(keep.i, keep.line), remove: [ref(drop.i, drop.line)] });
          if (drop === ea) break;
        }
      }
    }
    if (fn === 'NOTES.md') {
      const bySubject = new Map();
      for (const e of entries) {
        if (remove.has(e.i) || e.meta.pending) continue;
        const key = noteSubjectKey(e.line, e.body);
        if (!key) continue;
        if (!bySubject.has(key)) bySubject.set(key, []);
        bySubject.get(key).push(e);
      }
      for (const [key, arr] of bySubject) {
        if (arr.length < 2) continue;
        const newest = arr[arr.length - 1];
        const tag = `${entryIdOf(newest.line)} ${entryTimeText(newest.line)}`.trim();
        for (const old of arr.slice(0, -1)) {
          marks.set(old.i, `- [已被取代→${tag}] ${old.line.slice(2)}`);
          report.superseded.push({ file: fn, subject: key, old: ref(old.i, old.line), new: ref(newest.i, newest.line) });
        }
      }
    }
    if (remove.size || marks.size) {
      const kept = [];
      lines.forEach((l, i) => { if (!remove.has(i)) kept.push(marks.get(i) || l); });
      changes.set(fn, { original: lines.join('\n') + '\n', content: kept.join('\n') + '\n', removed: [...remove].sort((x, y) => x - y).map(i => lines[i]) });
    }
  }

  if (!fileFilter || fileFilter.has('DECISIONS.md')) {
    const fp = path.join(resolved, 'DECISIONS.md');
    const raw = readUtf8Safe(fp);
    const parts = raw.split(/\n(?=## \[)/);
    const blocks = [];
    parts.forEach((p, idx) => {
      const heading = splitLines(p)[0] || '';
      if (!heading.startsWith('## [')) return;
      const meta = parseEntryMeta(heading);
      if (meta.obsolete || meta.superseded) return;
      if (meta.validUntilMs && meta.validUntilMs < nowMs) report.expired.push({ file: 'DECISIONS.md', line: 0, text: singleLine(heading, 160) });
      const title = stripEntryMeta(stripEntryPrefix(`- ${heading.slice(3)}`));
      const body = splitLines(p).slice(1).join(' ');
      blocks.push({ idx, heading, title, meta, norm: normalizeForDedupe(`${title} ${body}`), toks: dedupeTokenSet(`${title} ${body}`) });
    });
    const removeIdx = new Set();
    const markIdx = new Map();
    const bref = b => ({ line: 0, text: singleLine(b.heading, 160) });
    const byNorm = new Map();
    for (const b of blocks) { if (!byNorm.has(b.norm)) byNorm.set(b.norm, []); byNorm.get(b.norm).push(b); }
    for (const arr of byNorm.values()) {
      if (arr.length < 2) continue;
      const keep = arr[arr.length - 1];
      arr.slice(0, -1).forEach(d => removeIdx.add(d.idx));
      report.exact_duplicates.push({ file: 'DECISIONS.md', keep: bref(keep), remove: arr.slice(0, -1).map(bref) });
    }
    const pool = blocks.filter(b => !removeIdx.has(b.idx) && b.toks.size >= 6);
    for (let a = 0; a < pool.length; a += 1) {
      if (removeIdx.has(pool[a].idx)) continue;
      for (let b = a + 1; b < pool.length; b += 1) {
        if (removeIdx.has(pool[b].idx)) continue;
        const j = tokenJaccardSets(pool[a].toks, pool[b].toks);
        if (j >= threshold) {
          removeIdx.add(pool[a].idx);
          report.near_duplicates.push({ file: 'DECISIONS.md', jaccard: Number(j.toFixed(3)), keep: bref(pool[b]), remove: [bref(pool[a])] });
          break;
        }
      }
    }
    const bySubject = new Map();
    for (const b of blocks) {
      if (removeIdx.has(b.idx)) continue;
      const key = b.meta.subject ? normalizeForDedupe(b.meta.subject) : (DEFAULT_DECISION_TITLES.has(b.title) ? '' : normalizeForDedupe(b.title));
      if (!key) continue;
      if (!bySubject.has(key)) bySubject.set(key, []);
      bySubject.get(key).push(b);
    }
    for (const [key, arr] of bySubject) {
      if (arr.length < 2) continue;
      const newest = arr[arr.length - 1];
      const tag = `${entryIdOf(newest.heading)} ${entryTimeText(newest.heading)}`.trim();
      for (const old of arr.slice(0, -1)) {
        markIdx.set(old.idx, `## [已被取代→${tag}] ${old.heading.slice(3)}`);
        report.superseded.push({ file: 'DECISIONS.md', subject: key, old: bref(old), new: bref(newest) });
      }
    }
    if (removeIdx.size || markIdx.size) {
      const kept = [];
      const removed = [];
      parts.forEach((p, idx) => {
        if (removeIdx.has(idx)) { removed.push(p.trim()); return; }
        if (markIdx.has(idx)) { const ls = splitLines(p); ls[0] = markIdx.get(idx); kept.push(ls.join('\n')); return; }
        kept.push(p);
      });
      changes.set('DECISIONS.md', { original: raw, content: kept.join('\n').replace(/\n*$/, '\n'), removed });
    }
  }

  const summary = {
    exact: report.exact_duplicates.reduce((n, g) => n + g.remove.length, 0),
    near: report.near_duplicates.length,
    superseded: report.superseded.length,
    expired: report.expired.length
  };
  const preview = Object.fromEntries(Object.entries(report).map(([k, v]) => [k, v.slice(0, 30)]));
  const base = { ok: true, threshold, summary, ...preview, files_affected: [...changes.keys()] };
  if (!apply || changes.size === 0) {
    return {
      ...base,
      dry_run: !apply,
      applied: false,
      note: apply ? '没有可合并或需标记取代的条目。' : '这是预览（dry-run），未修改任何文件；确认后传 apply=true 执行（执行时会重新计算，并先把原文件备份到 archive/）。',
      revision: readState(resolved).revision
    };
  }
  const stamp = `${compactStamp()}-${timeOnlyStamp().slice(-2)}`;
  const backupDir = path.join(resolved, 'archive', `consolidate-backup-${stamp}`);
  fs.mkdirSync(backupDir, { recursive: true });
  for (const [fn, ch] of changes) writeAtomic(path.join(backupDir, fn), ch.original);
  const removedLog = [];
  for (const [fn, ch] of changes) if (ch.removed.length) removedLog.push(`## ${fn}`, ...ch.removed);
  let removedFile = null;
  if (removedLog.length) {
    removedFile = path.join(resolved, 'archive', `合并移除-${stamp}.md`);
    writeAtomic(removedFile, `# consolidate 合并移除的重复条目 (${nowHuman()})\n${removedLog.join('\n')}\n`);
  }
  for (const [fn, ch] of changes) writeAtomic(path.join(resolved, fn), ch.content);
  const state = bumpState(resolved, 'consolidate', `合并重复 ${summary.exact + summary.near} 条，标记取代 ${summary.superseded} 条`, owner);
  try { buildIndex(resolved); } catch {}
  return { ...base, dry_run: false, applied: true, backup_dir: backupDir, ...(removedFile ? { removed_file: removedFile } : {}), revision: state.revision };
}

// ---- 交接草稿、正式交接单与交接包归档（对齐 CODEX v1.9.1） -------------------

function extractMarkdownSection(markdown, headingKeyword) {
  const lines = splitLines(markdown);
  const collected = [];
  let active = false;
  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (active) break;
      if (line.includes(headingKeyword)) active = true;
      continue;
    }
    if (active && line.trim()) collected.push(line.trim());
  }
  return collected;
}

function formatBulletList(items, fallback = '- 无') {
  if (Array.isArray(items)) {
    const cleaned = items.map(v => singleLine(v, 500)).filter(Boolean).map(v => v.startsWith('- ') ? v : `- ${v}`);
    return cleaned.length > 0 ? cleaned.join('\n') : fallback;
  }
  if (typeof items === 'string' && items.trim()) {
    const cleaned = splitLines(items)
      .map(v => v.trim())
      .filter(Boolean)
      .map(v => v.startsWith('- ') ? v : `- ${v}`);
    return cleaned.length > 0 ? cleaned.join('\n') : fallback;
  }
  return fallback;
}

/**
 * 自动从当前 WORKLOG / REQUIREMENTS / HANDOFF 提取交接草稿 HANDOFF.draft.md。
 */
export function draftHandoff(memoryDir, owner = 'unknown') {
  const resolved = ensureMemoryDir(memoryDir);
  const prevHandoff = readUtf8Safe(path.join(resolved, 'HANDOFF.md'));
  const prevStage = extractMarkdownSection(prevHandoff, '当前阶段');
  const prevRisk = extractMarkdownSection(prevHandoff, '风险与卡点');
  const prevFiles = extractMarkdownSection(prevHandoff, '最近改动文件');

  const recentLogs = splitLines(readUtf8Safe(path.join(resolved, 'WORKLOG.md')))
    .filter(l => l.startsWith('- '))
    .slice(-8);
  const reqItems = splitLines(readUtf8Safe(path.join(resolved, 'REQUIREMENTS.md')))
    .filter(l => l.startsWith('- '));
  const activeTodos = reqItems.filter(l => ACTIVE_REQ_TAGS.some(t => l.includes(t)));
  const doneReqs = reqItems.filter(l => l.includes('[已完成]')).slice(-5);

  const doneItems = recentLogs.length > 0 ? recentLogs : (doneReqs.length > 0 ? doneReqs : ['- （暂无近期完成记录）']);
  const todoItems = activeTodos.length > 0 ? activeTodos.slice(-10) : ['- （暂无未完成待办）'];
  const nextItems = activeTodos.length > 0
    ? activeTodos.slice(0, 5).map(l => `- 推进待办：${l.replace(/^- /, '')}`)
    : (recentLogs.length > 0 ? [`- 基于最近进展继续推进或验收（最近记录：${recentLogs[recentLogs.length - 1].replace(/^- /, '')}）`] : ['- 明确下一阶段任务目标并更新需求台账']);

  const draftContent = [
    `# 当前交接单草稿（自动生成于 ${nowHuman()}）`,
    '',
    '## 当前阶段',
    formatBulletList(prevStage.length ? prevStage : ['- 持续推进当前工作区任务']),
    '',
    '## 已完成',
    formatBulletList(doneItems),
    '',
    '## 未完成',
    formatBulletList(todoItems),
    '',
    '## 下一步（接班必看）',
    formatBulletList(nextItems),
    '',
    '## 风险与卡点',
    formatBulletList(prevRisk.length ? prevRisk : ['- 无']),
    '',
    '## 最近改动文件',
    formatBulletList(prevFiles.length ? prevFiles : ['- 无']),
    ''
  ].join('\n');

  const draftPath = path.join(resolved, 'HANDOFF.draft.md');
  writeAtomic(draftPath, draftContent);
  return {
    ok: true,
    draft_path: draftPath,
    content: draftContent,
    owner
  };
}

export function recordHandoffGood(memoryDir, owner = 'unknown') {
  const resolved = ensureMemoryDir(memoryDir);
  const handoffPath = path.join(resolved, 'HANDOFF.md');
  const content = readUtf8Safe(handoffPath);
  if (isGoodHandoff(content)) {
    const goodPath = path.join(resolved, 'archive', 'handoff-good.md');
    writeAtomic(goodPath, content);
    const current = readState(resolved);
    const state = bumpState(resolved, 'handoff-good', '记录有效交接快照', owner, {
      lastHandoffAt: nowIso(),
      lastGoodHandoffRev: current.revision + 1
    });
    return { ok: true, good: true, revision: state.revision };
  }
  return { ok: false, good: false, reason: 'HANDOFF.md 尚未包含有效的「下一步」接班条目。' };
}

/**
 * 正式更新交接单 HANDOFF.md 并生成归档交接包 archive/交接包-YYYYMMDD-HHMM.md。
 * 支持结构化字段（stage/done/todo/next/risk/files）或快捷 summary，遵守 policy.json 门禁（off|warn|block）。
 */
function readSiblingHandoffSlots(memoryDir, excludeSlot = '') {
  const slotsDir = path.join(memoryDir, 'slots');
  if (!fs.existsSync(slotsDir)) return [];
  const cutoffMs = Date.now() - 24 * 60 * 60 * 1000;
  const results = [];
  for (const entry of fs.readdirSync(slotsDir)) {
    if (!entry.endsWith('.json')) continue;
    try {
      const parsed = JSON.parse(fs.readFileSync(path.join(slotsDir, entry), 'utf8'));
      if (!parsed || typeof parsed !== 'object' || !parsed.slot) continue;
      if (excludeSlot && parsed.slot === excludeSlot) continue;
      const hasActiveTodo = Array.isArray(parsed.todo) && parsed.todo.some(t => t && !/^[-\s]*(无|暂无|（当前任务卡步骤已全部完成）)\s*$/.test(String(t)));
      if ((parsed.updated_ms || 0) < cutoffMs && !hasActiveTodo) continue;
      results.push(parsed);
    } catch {}
  }
  results.sort((a, b) => (b.updated_ms || 0) - (a.updated_ms || 0));
  return results;
}

export function handoffMemory(memoryDir, options = {}, owner = 'unknown') {
  const resolved = ensureMemoryDir(memoryDir);
  const policy = readPolicy(resolved);
  const baseActor = normalizeActor(owner, options?.slot || '');
  // Lifecycle archives write to a separate `<slot>-auto` file so they never overwrite the
  // manual slot record of the same actor.
  const actor = options?.auto === true
    ? { slot: `${baseActor.slot}-auto`, label: `${baseActor.label}·auto` }
    : baseActor;
  const handoffMode = options?.handoff_mode === 'consolidate' ? 'consolidate' : 'slot_merge';
  const prevHandoff = readUtf8Safe(path.join(resolved, 'HANDOFF.md'));

  const isAuto = options?.auto === true;
  const prevState = readState(resolved);
  const locationFromOptions = {};
  for (const [key] of HANDOFF_LOCATION_FIELDS) {
    const v = options?.[key];
    if (v === undefined || v === null) continue;
    const items = (Array.isArray(v) ? v : [v]).map(x => singleLine(x, 600)).filter(Boolean).slice(0, 10);
    if (items.length) locationFromOptions[key] = items;
  }
  const hasStructured = ['stage', 'done', 'todo', 'next', 'risk', 'files', 'summary', ...HANDOFF_LOCATION_FIELDS.map(f => f[0])]
    .some(k => options && options[k] !== undefined && options[k] !== null && String(options[k]).trim() !== '');

  let nextHandoffContent = prevHandoff;
  let activeSiblingCount = 0;
  const collabWarnings = [];

  if (hasStructured) {
    const draft = draftHandoff(resolved, owner);
    const prevStage = extractMarkdownSection(prevHandoff, '当前阶段');
    const prevDone = extractMarkdownSection(draft.content, '已完成');
    const prevTodo = extractMarkdownSection(draft.content, '未完成');
    const prevNext = extractMarkdownSection(draft.content, '下一步');
    const prevRisk = extractMarkdownSection(prevHandoff, '风险与卡点');
    const prevFiles = extractMarkdownSection(prevHandoff, '最近改动文件');

    const summaryText = options.summary ? singleLine(options.summary, 1200) : '';
    if (summaryText && options.logSummary !== false) {
      fs.appendFileSync(path.join(resolved, 'WORKLOG.md'), `- [${nowHuman()}] (@${actor.label}) 交接总结：${summaryText}\n`, 'utf8');
      autocap(resolved);
    }

    const stageSection = options.stage || (summaryText ? summaryText : (prevStage.length ? prevStage : '当前阶段推进中'));
    const doneSection = options.done || (summaryText ? [`[${nowHuman()}] ${summaryText}`, ...prevDone.slice(-5)] : prevDone);
    const todoSection = options.todo || prevTodo;
    const nextSection = options.next || (summaryText ? [`接续检查并推进：${summaryText}`, ...prevNext.slice(0, 3)] : prevNext);
    // An automatic lifecycle archive collects neither risks nor per-task file changes, so it
    // must not claim "无" (none). Placeholders carried from an earlier archive are replaced too.
    const isPlaceholderSection = arr => arr.length > 0 && arr.every(l => /^-?\s*(无|未记录(（.*）)?)\s*$/.test(l));
    const keepPrev = arr => arr.length > 0 && !(isAuto && isPlaceholderSection(arr));
    const riskSection = options.risk || (keepPrev(prevRisk) ? prevRisk
      : (isAuto ? '未记录（自动归档不采集风险，不代表没有风险；接班前向原模型或用户核实）' : '无'));
    const filesSection = options.files || (keepPrev(prevFiles) ? prevFiles
      : (isAuto ? '未记录（自动归档无法区分本任务改动；以定位字段中的 Git 状态为准）' : '无'));

    const toItemArray = val => splitLines(formatBulletList(val)).map(l => l.replace(/^-\s*/, '').trim()).filter(Boolean);
    const slotsDir = path.join(resolved, 'slots');
    fs.mkdirSync(slotsDir, { recursive: true });

    if (handoffMode === 'consolidate') {
      const archivedSlotsDir = path.join(slotsDir, 'archived');
      fs.mkdirSync(archivedSlotsDir, { recursive: true });
      for (const entry of fs.readdirSync(slotsDir)) {
        if (!entry.endsWith('.json')) continue;
        try {
          fs.renameSync(path.join(slotsDir, entry), path.join(archivedSlotsDir, `${compactStamp()}-${entry}`));
        } catch {}
      }
    }

    // Carry location facts forward from this actor's previous slot when not restated.
    let previousSlot = null;
    try { previousSlot = JSON.parse(fs.readFileSync(path.join(slotsDir, `${actor.slot}.json`), 'utf8')); } catch {}
    const location = { ...(previousSlot?.location || {}), ...locationFromOptions };
    const slotRecord = {
      slot: actor.slot,
      label: actor.label,
      kind: isAuto ? 'auto' : 'manual',
      owner: String(owner || 'unknown').slice(0, 120),
      updated_at: nowHuman(),
      updated_ms: Date.now(),
      stage: toItemArray(stageSection).slice(0, 3),
      done: toItemArray(doneSection).slice(0, 10),
      todo: toItemArray(todoSection).slice(0, 10),
      next: toItemArray(nextSection).slice(0, 8),
      risk: toItemArray(riskSection).slice(0, 5),
      files: toItemArray(filesSection).slice(0, 10),
      ...(summaryText ? { summary: summaryText } : {}),
      ...(Object.keys(location).length ? { location } : {})
    };
    writeAtomic(path.join(slotsDir, `${actor.slot}.json`), JSON.stringify(slotRecord, null, 2) + '\n');

    const siblings = handoffMode === 'consolidate' ? [] : readSiblingHandoffSlots(resolved, actor.slot)
      .filter(sib => sib.slot !== baseActor.slot && sib.slot !== `${baseActor.slot}-auto` && sib.kind !== 'auto')
      .slice(0, 5);
    activeSiblingCount = siblings.length;
    const siblingCapScale = siblings.length > 0 ? 12 : 22;

    // Parallel slots that list the same changed file: advisory only (the lists are each model's own
    // account), but a successor must know two sessions touched it before trusting either handoff.
    const normFile = f => String(f || '').trim().replace(/\\/g, '/').replace(/^\.\//, '').toLowerCase();
    const isRealFile = f => f && !/^(无|未记录|（|\()/.test(f);
    const myFiles = new Set(slotRecord.files.filter(isRealFile).map(normFile));
    const overlapLines = [];
    for (const sib of siblings) {
      const shared = (sib.files || []).filter(isRealFile).filter(f => myFiles.has(normFile(f)));
      if (shared.length) overlapLines.push(`并行冲突提示：与 @${sib.label || sib.slot} 都改动了 ${shared.slice(0, 5).join('、')}${shared.length > 5 ? ' 等' : ''}（双方自述，接班前以 git diff 核对）`);
    }
    if (overlapLines.length) collabWarnings.push(...overlapLines);

    // "Done" without evidence is a self-report; say so in the handoff instead of letting it read as verified.
    const hasVerified = Array.isArray(location.verified) && location.verified.some(v => !/^(无|未验证|未测试)$/.test(String(v).trim()));
    const doneUnverified = !hasVerified && toItemArray(doneSection).length > 0;
    if (doneUnverified && !isAuto) collabWarnings.push('「已完成」未附验证证据（verified 字段为空），交接单已标注为自述；如已测试/构建，请在 verified 中写明命令与结果。');

    const built = [
      `# 当前交接单（更新于 ${nowHuman()} · 主提交 @${actor.label}）`,
      '',
      '## 当前阶段',
      formatBulletList(stageSection),
      '',
      '## 已完成',
      ...(doneUnverified ? ['- （以下为自述，未附验证证据）'] : []),
      formatBulletList(doneSection).split('\n').slice(0, siblingCapScale).join('\n'),
      '',
      '## 未完成',
      formatBulletList(todoSection).split('\n').slice(0, siblingCapScale).join('\n'),
      '',
      '## 下一步（接班必看）',
      formatBulletList(nextSection).split('\n').slice(0, 15).join('\n'),
      '',
      '## 风险与卡点',
      ...overlapLines.map(l => `- ${l}`),
      formatBulletList(riskSection).split('\n').slice(0, 10).join('\n'),
      '',
      '## 最近改动文件',
      formatBulletList(filesSection).split('\n').slice(0, 15).join('\n')
    ];
    const locationLines = HANDOFF_LOCATION_FIELDS.filter(([key]) => location[key]?.length)
      .map(([key, label]) => `- ${label}：${location[key].join('；')}`);
    if (locationLines.length) built.splice(2, 0, '## 定位与状态（接班先核对）', ...locationLines, '');

    if (siblings.length > 0) {
      built.push('', `## 并行模型协作槽位（另 ${siblings.length} 个活跃模型，自动保留防覆盖）`);
      for (const sib of siblings) {
        const sibStage = (sib.stage && sib.stage[0]) || '推进中';
        const sibDone = (sib.done || []).slice(0, 2).join('；') || '无';
        const sibTodo = (sib.todo || []).slice(0, 2).join('；') || '无';
        const sibNext = (sib.next || []).slice(0, 2).join('；') || '无';
        built.push(`- **[@${sib.label || sib.slot}]** (${sib.updated_at || ''}) 阶段：${sibStage}`);
        built.push(`  - 已完成：${sibDone}`);
        built.push(`  - 待办 / 下一步：${sibTodo} -> ${sibNext}`);
      }
    }
    built.push('');

    let lines = splitLines(built.join('\n'));
    if (lines.length > LIMITS['HANDOFF.md']) {
      lines = lines.slice(0, LIMITS['HANDOFF.md'] - 1);
      lines.push('- ...（完整并行槽位与历史已存入 slots/ 与 archive/ 交接包）');
    }
    nextHandoffContent = lines.join('\n') + '\n';
  }

  const good = isGoodHandoff(nextHandoffContent);
  const warnings = [...collabWarnings];
  if (!good) {
    warnings.push('HANDOFF.md 缺少具体的「下一步（接班必看）」条目（自动生成的套话不算）或有效内容不足 6 行。');
  }
  if (!isAuto && hasStructured && !Object.keys(locationFromOptions).length && !/## 定位与状态/.test(nextHandoffContent)) {
    warnings.push('未提供 workspace_root / git_branch / git_commit / artifacts / verified 等定位字段，接班者只能从自由文本推断位置。');
  }
  if (policy.handoff_gate === 'block' && !good && !options.force) {
    throw new Error('HANDOFF_GATE_BLOCKED: 当前记忆策略 handoff_gate=block 要求交接单必须包含明确的「下一步」接班条目（若确需强制写入可传 force=true）。');
  }

  // An automatic lifecycle archive only fills its own slot once a model wrote a manual
  // handoff here; it never replaces that handoff as the main HANDOFF.md.
  const keepManualMain = isAuto && prevState.lastHandoffKind === 'manual' && isGoodHandoff(prevHandoff);
  if (keepManualMain) nextHandoffContent = prevHandoff;
  if (hasStructured && !keepManualMain) {
    writeAtomic(path.join(resolved, 'HANDOFF.md'), nextHandoffContent);
  }

  // step03: derive durable candidates (decisions / constraints / requirement status) from this
  // handoff and park them as [自动·待确认] notes; the model confirms or forgets them later.
  let autoCandidates = [];
  if (options?.extract_facts !== false) {
    try {
      autoCandidates = extractHandoffCandidates(resolved, options);
      if (writeAutoCandidates(resolved, autoCandidates, actor) > 0) autocap(resolved);
    } catch {
      autoCandidates = [];
    }
  }

  const stamp = `${compactStamp()}-${timeOnlyStamp().slice(-2)}-${actor.slot}`;
  const packagePath = path.join(resolved, 'archive', `交接包-${stamp}.md`);
  const activeNotes = splitLines(readUtf8Safe(path.join(resolved, 'NOTES.md')))
    .filter(l => l.startsWith('- ') && !isInactiveEntryLine(l))
    .slice(-20);
  const recentReqs = splitLines(readUtf8Safe(path.join(resolved, 'REQUIREMENTS.md')))
    .filter(l => l.startsWith('- '))
    .slice(-25);
  const recentWorklogs = splitLines(readUtf8Safe(path.join(resolved, 'WORKLOG.md')))
    .filter(l => l.startsWith('- '))
    .slice(-30);

  const pkgBody = [
    `# 归档交接包 (${nowHuman()})`,
    `- 提交者: ${owner} (@${actor.label})`,
    `- 模式: ${handoffMode}`,
    '',
    '## 一、HANDOFF 交接单',
    nextHandoffContent.trim(),
    '',
    '## 二、活跃随手记摘要',
    activeNotes.length ? activeNotes.join('\n') : '- 无',
    '',
    '## 三、近期需求台账',
    recentReqs.length ? recentReqs.join('\n') : '- 无',
    '',
    '## 四、近期工作日志',
    recentWorklogs.length ? recentWorklogs.join('\n') : '- 无',
    ''
  ].join('\n');
  writeAtomic(packagePath, pkgBody);

  const curState = readState(resolved);
  if (good && !keepManualMain) {
    writeAtomic(path.join(resolved, 'archive', 'handoff-good.md'), nextHandoffContent);
  }
  const state = bumpState(
    resolved,
    'handoff',
    (options.summary ? `交接归档：${options.summary}` : `更新 HANDOFF.md (${handoffMode})`) + (autoCandidates.length ? `；自动待确认 ${autoCandidates.length} 条` : ''),
    owner,
    {
      slot: actor.slot,
      lastHandoffAt: nowIso(),
      lastHandoffKind: keepManualMain ? 'manual' : (isAuto ? 'auto' : 'manual'),
      ...(keepManualMain ? {} : { lastHandoffSlot: actor.slot }),
      ...(good && !keepManualMain ? { lastGoodHandoffRev: curState.revision + 1 } : {})
    }
  );

  const draftPath = path.join(resolved, 'HANDOFF.draft.md');
  if (good && fs.existsSync(draftPath)) {
    try { fs.rmSync(draftPath, { force: true }); } catch {}
  }

  return {
    ok: true,
    memory_dir: resolved,
    actor: actor.label,
    slot: actor.slot,
    handoff_mode: handoffMode,
    active_sibling_slots: activeSiblingCount,
    handoff_good: good,
    main_handoff_kept: keepManualMain,
    package_path: packagePath,
    policy_gate: policy.handoff_gate,
    warnings: policy.handoff_gate === 'off' ? [] : warnings,
    auto_candidates: autoCandidates.length,
    ...(autoCandidates.length ? { auto_candidate_items: autoCandidates.map(c => `${c.category}：${singleLine(c.body, 120)}`), auto_candidate_hint: '已写为 [自动·待确认] 随手记；核实后 bridge_memory_append kind=confirm text=关键词，错误的用 bridge_memory_forget。' } : {}),
    revision: state.revision
  };
}

// ---- 定期归档、周报摘要、体积测算、健康检查与临时记忆转正 -------------------

/**
 * 按天数安全归档旧工作日志、超 30 天已完成需求、超 30 天事件流，并为超长 HANDOFF 留存快照。
 */
export function archiveMemory(memoryDir, days = 14, owner = 'system') {
  const resolved = ensureMemoryDir(memoryDir);
  const keepDays = Math.max(1, Math.min(3650, Number(days) || 14));
  const nowMs = Date.now();
  const ym = monthStamp();
  const stats = { worklogArchived: 0, requirementsArchived: 0, eventsArchived: 0, handoffSnapshotted: false };

  // 1. WORKLOG older than keepDays
  const wlPath = path.join(resolved, 'WORKLOG.md');
  const wlLines = splitLines(readUtf8Safe(wlPath));
  const wlKeep = [];
  const wlMove = [];
  for (const line of wlLines) {
    if (!line.startsWith('- ')) {
      wlKeep.push(line);
      continue;
    }
    const ts = parseEntryTimestampMs(line);
    if (ts > 0 && (nowMs - ts) > keepDays * 86_400_000) {
      wlMove.push(line);
    } else {
      wlKeep.push(line);
    }
  }
  if (wlMove.length > 0) {
    const archPath = path.join(resolved, 'archive', `WORKLOG-归档-${ym}.md`);
    const prefix = fs.existsSync(archPath) ? '' : `# WORKLOG 归档 (${ym})\n`;
    fs.appendFileSync(archPath, prefix + wlMove.join('\n') + '\n', 'utf8');
    writeAtomic(wlPath, wlKeep.join('\n') + '\n');
    stats.worklogArchived = wlMove.length;
  }

  // 2. REQUIREMENTS: only [已完成] / [已取消] older than max(keepDays, 30) days
  const reqCutoffDays = Math.max(keepDays, 30);
  const reqPath = path.join(resolved, 'REQUIREMENTS.md');
  const reqLines = splitLines(readUtf8Safe(reqPath));
  const reqKeep = [];
  const reqMove = [];
  for (const line of reqLines) {
    if (!line.startsWith('- ')) {
      reqKeep.push(line);
      continue;
    }
    const isActive = ACTIVE_REQ_TAGS.some(tag => line.includes(tag));
    const ts = parseEntryTimestampMs(line);
    if (!isActive && ts > 0 && (nowMs - ts) > reqCutoffDays * 86_400_000) {
      reqMove.push(line);
    } else {
      reqKeep.push(line);
    }
  }
  if (reqMove.length > 0) {
    const archPath = path.join(resolved, 'archive', `REQUIREMENTS-归档-${ym}.md`);
    const prefix = fs.existsSync(archPath) ? '' : `# REQUIREMENTS 归档 (${ym})\n`;
    fs.appendFileSync(archPath, prefix + reqMove.join('\n') + '\n', 'utf8');
    writeAtomic(reqPath, reqKeep.join('\n') + '\n');
    stats.requirementsArchived = reqMove.length;
  }

  // 3. EVENTS.jsonl deduplication & >30d archival
  const eventsPath = path.join(resolved, 'EVENTS.jsonl');
  const evLines = splitLines(readUtf8Safe(eventsPath));
  const seenEvents = new Set();
  const evKeep = [];
  const evMove = [];
  for (const line of evLines) {
    if (!line.trim() || seenEvents.has(line)) continue;
    seenEvents.add(line);
    let ts = 0;
    try {
      const obj = JSON.parse(line);
      ts = Date.parse(obj.ts || '');
    } catch {}
    if (Number.isFinite(ts) && ts > 0 && (nowMs - ts) > 30 * 86_400_000) {
      evMove.push(line);
    } else {
      evKeep.push(line);
    }
  }
  if (evMove.length > 0 || seenEvents.size !== evLines.filter(Boolean).length) {
    if (evMove.length > 0) {
      const archEv = path.join(resolved, 'archive', `EVENTS-归档-${ym}.jsonl`);
      fs.appendFileSync(archEv, evMove.join('\n') + '\n', 'utf8');
      stats.eventsArchived = evMove.length;
    }
    writeAtomic(eventsPath, evKeep.length ? evKeep.join('\n') + '\n' : '');
  }

  // 4. Snapshot oversized HANDOFF.md without destructive deletion
  const handoffContent = readUtf8Safe(path.join(resolved, 'HANDOFF.md'));
  if (splitLines(handoffContent).length > LIMITS['HANDOFF.md']) {
    const snapPath = path.join(resolved, 'archive', `HANDOFF-超长快照-${compactStamp()}.md`);
    writeAtomic(snapPath, handoffContent);
    stats.handoffSnapshotted = true;
  }

  const capped = autocap(resolved);
  const state = bumpState(resolved, 'archive', `定期归档 (${keepDays}d)`, owner);
  buildIndex(resolved);
  return { ok: true, days: keepDays, ...stats, autocap: capped, revision: state.revision };
}

export function digestMemory(memoryDir, days = 7) {
  const resolved = ensureMemoryDir(memoryDir);
  const windowDays = Math.max(1, Math.min(365, Number(days) || 7));
  const cutoffMs = Date.now() - windowDays * 86_400_000;

  const recentFilter = line => {
    const ts = parseEntryTimestampMs(line);
    return ts === 0 || ts >= cutoffMs;
  };

  const worklogs = splitLines(readUtf8Safe(path.join(resolved, 'WORKLOG.md'))).filter(l => l.startsWith('- ') && recentFilter(l));
  const allReqs = splitLines(readUtf8Safe(path.join(resolved, 'REQUIREMENTS.md'))).filter(l => l.startsWith('- '));
  const activeTodos = allReqs.filter(l => ACTIVE_REQ_TAGS.some(t => l.includes(t)));
  const recentDoneReqs = allReqs.filter(l => l.includes('[已完成]') && recentFilter(l));
  const decisions = splitLines(readUtf8Safe(path.join(resolved, 'DECISIONS.md'))).filter(l => l.startsWith('## [') && recentFilter(l));
  const activeNotes = splitLines(readUtf8Safe(path.join(resolved, 'NOTES.md'))).filter(l => l.startsWith('- ') && !isInactiveEntryLine(l));

  const summaryLines = [
    `# 记忆周期摘要（近 ${windowDays} 天）`,
    `- 新增工作日志：${worklogs.length} 条`,
    `- 近期完成需求：${recentDoneReqs.length} 条 | 当前活跃待办/进行中：${activeTodos.length} 条`,
    `- 新增架构决策：${decisions.length} 项 | 活跃随手记：${activeNotes.length} 条`,
    ...(activeTodos.length ? ['', '## 当前待办/进行中', ...activeTodos.slice(-10)] : []),
    ...(worklogs.length ? ['', '## 最近工作进展', ...worklogs.slice(-8)] : []),
    ...(decisions.length ? ['', '## 近期决策标题', ...decisions.slice(-5).map(d => `- ${d.replace(/^##\s*/, '')}`)] : [])
  ];

  return {
    days: windowDays,
    counts: {
      worklogs: worklogs.length,
      completedRequirements: recentDoneReqs.length,
      activeRequirements: activeTodos.length,
      decisions: decisions.length,
      activeNotes: activeNotes.length
    },
    text: summaryLines.join('\n')
  };
}

function estimateTokensFromText(text) {
  let est = 0;
  for (const ch of String(text || '')) {
    est += (ch.codePointAt(0) || 0) <= 127 ? 0.25 : 0.7;
  }
  return Math.ceil(est);
}

export function weightMemory(memoryDir) {
  const resolved = ensureMemoryDir(memoryDir);
  const files = collectIndexableFiles(resolved, true);
  const breakdown = [];
  let totalBytes = 0;
  let totalLines = 0;
  let archiveBytes = 0;

  for (const f of files) {
    const content = readUtf8Safe(f.full);
    const lines = splitLines(content).length;
    const tokens = estimateTokensFromText(content);
    totalBytes += f.size;
    totalLines += lines;
    if (f.rel.startsWith('archive/')) archiveBytes += f.size;
    breakdown.push({ file: f.rel, bytes: f.size, lines, estimated_tokens: tokens });
  }
  const evPath = path.join(resolved, 'EVENTS.jsonl');
  if (fs.existsSync(evPath)) {
    const st = fs.statSync(evPath);
    const content = readUtf8Safe(evPath);
    totalBytes += st.size;
    totalLines += splitLines(content).length;
    breakdown.push({ file: 'EVENTS.jsonl', bytes: st.size, lines: splitLines(content).length, estimated_tokens: estimateTokensFromText(content) });
  }
  const bootText = brief(resolved, 230);
  return {
    total_bytes: totalBytes,
    archive_bytes: archiveBytes,
    total_lines: totalLines,
    boot_lines: splitLines(bootText).length,
    boot_estimated_tokens: estimateTokensFromText(bootText),
    files: breakdown
  };
}

/**
 * 11 项全面健康检查与 0-100 评分（对齐 CODEX v1.9.1 check & score）。
 */
export function checkMemory(memoryDir) {
  const resolved = ensureMemoryDir(memoryDir);
  const issues = [];
  const lineStats = {};

  // 1. 必需核心文件与行数上限
  const requiredFiles = ['AGENTS.md', 'INDEX.md', 'HANDOFF.md', 'REQUIREMENTS.md', 'DECISIONS.md', 'NOTES.md', 'WORKLOG.md', 'STATE.json', 'EVENTS.jsonl', 'policy.json'];
  for (const fn of requiredFiles) {
    const fp = path.join(resolved, fn);
    if (!fs.existsSync(fp)) {
      issues.push({ code: 'missing_file', severity: 'error', message: `缺少核心记忆文件: ${fn}` });
      continue;
    }
    const content = readUtf8Safe(fp);
    const count = splitLines(content).length;
    lineStats[fn] = count;
    if (LIMITS[fn] && count > LIMITS[fn]) {
      issues.push({ code: 'line_limit_exceeded', severity: 'warn', message: `${fn} 超出精简上限 (${count}/${LIMITS[fn]} 行)` });
    }
  }

  // 2. 启动 brief 总行数预算 <= 230
  const bootLines = splitLines(brief(resolved, 230)).length;
  lineStats['__brief__'] = bootLines;
  if (bootLines > 230) {
    issues.push({ code: 'boot_budget_exceeded', severity: 'error', message: `brief 启动摘要超出 230 行红线 (${bootLines} 行)` });
  }

  // 3. STATE.json 与 policy.json 校验
  try {
    const st = JSON.parse(fs.readFileSync(path.join(resolved, 'STATE.json'), 'utf8'));
    if (!Number.isInteger(st?.revision)) issues.push({ code: 'invalid_state', severity: 'error', message: 'STATE.json 缺少整数 revision' });
  } catch {
    issues.push({ code: 'invalid_state_json', severity: 'error', message: 'STATE.json 不是合法 JSON' });
  }

  // 4. EVENTS.jsonl 合法性与重复行检测
  const evLines = splitLines(readUtf8Safe(path.join(resolved, 'EVENTS.jsonl')));
  const evSet = new Set();
  let dupEvents = 0;
  let badEvents = 0;
  for (const line of evLines) {
    if (!line.trim()) continue;
    if (evSet.has(line)) dupEvents += 1;
    evSet.add(line);
    try { JSON.parse(line); } catch { badEvents += 1; }
  }
  if (badEvents > 0) issues.push({ code: 'corrupt_events', severity: 'error', message: `EVENTS.jsonl 含 ${badEvents} 行损坏 JSON` });
  if (dupEvents > 0) issues.push({ code: 'duplicate_events', severity: 'info', message: `EVENTS.jsonl 含 ${dupEvents} 行重复事件（可调用 archive 清理）` });

  // 5. 密钥/临时隧道泄露扫描
  for (const fn of ['AGENTS.md', 'INDEX.md', 'HANDOFF.md', 'REQUIREMENTS.md', 'DECISIONS.md', 'NOTES.md', 'WORKLOG.md']) {
    const content = readUtf8Safe(path.join(resolved, fn));
    for (const pat of SECRET_PATTERNS) {
      if (pat.re.test(content)) {
        issues.push({ code: 'secret_or_tunnel_leak', severity: 'error', message: `${fn} 疑似包含敏感凭据或临时隧道地址 (${pat.name})` });
      }
    }
  }

  // 6. 残留 .tmp 临时文件检查
  try {
    const tmpFiles = fs.readdirSync(resolved).filter(n => n.endsWith('.tmp'));
    if (tmpFiles.length > 0) {
      issues.push({ code: 'leftover_tmp', severity: 'warn', message: `存在残留临时文件: ${tmpFiles.join(', ')}` });
    }
  } catch {}

  // 7. INDEX.md 路由引用有效性检查
  const indexContent = readUtf8Safe(path.join(resolved, 'INDEX.md'));
  for (const match of indexContent.matchAll(/`([A-Za-z0-9_.\-/]+(?:\.md|\/))`/g)) {
    const ref = match[1];
    const refTarget = path.join(resolved, ref);
    if (!fs.existsSync(refTarget)) {
      issues.push({ code: 'broken_index_route', severity: 'warn', message: `INDEX.md 引用的路径不存在: ${ref}` });
    }
  }

  // 8. HANDOFF.md 有效性与过期断层检查
  const handoffText = readUtf8Safe(path.join(resolved, 'HANDOFF.md'));
  const hasRealWork = (lineStats['WORKLOG.md'] || 0) > 1 || (lineStats['REQUIREMENTS.md'] || 0) > 1;
  if (hasRealWork && !isGoodHandoff(handoffText)) {
    issues.push({ code: 'handoff_incomplete', severity: 'warn', message: 'HANDOFF.md 尚未填写具体「下一步（接班必看）」条目' });
  }
  const gap = detectHandoffGap(resolved);
  if (gap.stale) {
    issues.push({ code: 'stale_handoff', severity: 'warn', message: `HANDOFF.md 落后于最新进展（之后已有 ${gap.postEntries.length} 条新记录）` });
  }

  // 9. 父目录盘符相对路径污染检查与 .codex-project 混用告警
  const parentDir = path.dirname(resolved);
  const grandParent = path.dirname(parentDir);
  try {
    for (const sibling of fs.readdirSync(grandParent)) {
      if (/^[A-Za-z]:/.test(sibling)) {
        issues.push({ code: 'stray_drive_typo', severity: 'warn', message: `上层目录发现疑似盘符漏斜杠产生的异常文件/目录: ${sibling}` });
      }
    }
  } catch {}

  const penalizable = issues.filter(i => i.severity !== 'info');
  const score = Math.max(0, 100 - penalizable.length * 8);
  return {
    ok: penalizable.length === 0,
    score,
    issues: issues.map(i => i.message),
    issue_details: issues,
    lines: lineStats,
    policy: readPolicy(resolved)
  };
}

export function scoreMemory(memoryDir) {
  const res = checkMemory(memoryDir);
  return { score: res.score, ok: res.ok, issues: res.issues };
}

/**
 * 将临时记忆（scratch-memory）中的有效需求、随手记、决策、日志幂等转正至指定项目 .opencode-project。
 */
export function promoteMemory(scratchDir, projectDir, options = {}, owner = 'system') {
  const src = ensureMemoryDir(scratchDir);
  const dst = ensureMemoryDir(projectDir);
  if (path.resolve(src) === path.resolve(dst)) {
    throw new Error('MEMORY_PROMOTE_SAME_DIR: 临时记忆目录与目标项目记忆目录相同，无需转正。');
  }
  const filterKw = options.keyword ? singleLine(options.keyword, 200).toLowerCase() : '';
  const matchKw = text => !filterKw || text.toLowerCase().includes(filterKw);

  const promoted = { requirements: 0, notes: 0, decisions: 0, worklogs: 0 };

  const mergeLineFile = (fileName, linePredicate, counterKey) => {
    const srcLines = splitLines(readUtf8Safe(path.join(src, fileName))).filter(l => linePredicate(l) && matchKw(l));
    if (srcLines.length === 0) return;
    const dstPath = path.join(dst, fileName);
    const dstExisting = new Set(splitLines(readUtf8Safe(dstPath)).map(l => l.trim()));
    const toAppend = srcLines.filter(l => !dstExisting.has(l.trim()));
    if (toAppend.length > 0) {
      fs.appendFileSync(dstPath, toAppend.join('\n') + '\n', 'utf8');
      promoted[counterKey] += toAppend.length;
    }
  };

  if (options.includeRequirements !== false) {
    mergeLineFile('REQUIREMENTS.md', l => l.startsWith('- ') && ACTIVE_REQ_TAGS.some(t => l.includes(t)), 'requirements');
  }
  if (options.includeNotes !== false) {
    mergeLineFile('NOTES.md', l => l.startsWith('- ') && !isInactiveEntryLine(l), 'notes');
  }
  if (options.includeWorklogs === true) {
    mergeLineFile('WORKLOG.md', l => l.startsWith('- '), 'worklogs');
  }
  if (options.includeDecisions !== false) {
    const srcDec = readUtf8Safe(path.join(src, 'DECISIONS.md'));
    const dstDecPath = path.join(dst, 'DECISIONS.md');
    const dstDec = readUtf8Safe(dstDecPath);
    const blocks = srcDec.split(/\n(?=## \[)/).filter(b => b.trim().startsWith('## [') && matchKw(b));
    for (const block of blocks) {
      const heading = splitLines(block)[0]?.trim();
      if (heading && !dstDec.includes(heading)) {
        fs.appendFileSync(dstDecPath, '\n' + block.trim() + '\n', 'utf8');
        promoted.decisions += 1;
      }
    }
  }

  autocap(dst);
  const totalMoved = promoted.requirements + promoted.notes + promoted.decisions + promoted.worklogs;
  const dstState = totalMoved > 0
    ? bumpState(dst, 'promote-in', `从临时记忆转正 ${totalMoved} 条记录`, owner)
    : readState(dst);
  if (totalMoved > 0) {
    appendLog(src, `已将 ${totalMoved} 条临时记忆转正至项目记忆 (${dst})`, owner);
    buildIndex(dst);
  }
  return {
    ok: true,
    source_dir: src,
    target_dir: dst,
    promoted,
    total: totalMoved,
    target_revision: dstState.revision
  };
}

export function exportProjectBundle(memoryDir) {
  const resolved = ensureMemoryDir(memoryDir);
  const files = collectIndexableFiles(resolved, true);
  const bundleFiles = {};
  for (const f of files) {
    bundleFiles[f.rel] = readUtf8Safe(f.full);
  }
  bundleFiles['EVENTS.jsonl'] = readUtf8Safe(path.join(resolved, 'EVENTS.jsonl'));
  bundleFiles['STATE.json'] = readUtf8Safe(path.join(resolved, 'STATE.json'));
  bundleFiles['policy.json'] = readUtf8Safe(path.join(resolved, 'policy.json'));
  bundleFiles['synonyms.txt'] = readUtf8Safe(path.join(resolved, 'synonyms.txt'));
  return {
    format: 'opencode-project-memory-bundle-v1',
    engine: MEMORY_ENGINE_VERSION,
    exportedAt: nowIso(),
    files: bundleFiles
  };
}

export function importProjectBundle(memoryDir, bundle, owner = 'system') {
  if (!bundle || bundle.format !== 'opencode-project-memory-bundle-v1' || typeof bundle.files !== 'object') {
    throw new Error('MEMORY_BUNDLE_INVALID: 非法的记忆导出包格式。');
  }
  const resolved = ensureMemoryDir(memoryDir);
  let written = 0;
  for (const [rel, content] of Object.entries(bundle.files)) {
    if (typeof content !== 'string' || rel.includes('..') || path.isAbsolute(rel)) continue;
    const target = path.resolve(resolved, rel);
    if (!target.startsWith(resolved + path.sep)) continue;
    writeAtomic(target, content);
    written += 1;
  }
  const state = bumpState(resolved, 'import-bundle', `导入记忆包 (${written} 个文件)`, owner);
  buildIndex(resolved);
  return { ok: true, files_written: written, revision: state.revision };
}

// ---- 临时模式（scratch-memory）多会话物理隔离与按需目录检索 -------------------

// 新版临时桶把内容写在 actors/<执行者>/(tasks/<任务>/) 下，桶根只有初始 STATE；目录、跨桶检索需合并这些子目录。
export function inspectScratchBucket(bucketDir, meta = {}) {
  const own = inspectScratchDirSelf(bucketDir, meta);
  let subInfos = [];
  try {
    subInfos = listActorTaskDirs(bucketDir, 50).map(t => inspectScratchDirSelf(t.dir, meta)).filter(Boolean);
  } catch {}
  if (!subInfos.length) return own;
  const all = own ? [own, ...subInfos] : subInfos;
  const latest = all.reduce((a, b) => (b.updated_ms > a.updated_ms ? b : a));
  return {
    ...latest,
    id: meta.bucketId || path.basename(bucketDir),
    kind: meta.kind || (path.basename(bucketDir).startsWith('topic-') ? 'topic' : 'session'),
    title: singleLine(meta.title || path.basename(bucketDir), 80),
    entry_count: all.reduce((n, x) => n + x.entry_count, 0),
    revision: Math.max(...all.map(x => x.revision || 0)),
    actor_count: subInfos.length,
    dir: bucketDir,
    dirs: all.map(x => x.dir)
  };
}

// 记忆写入都会推进 STATE.json；以其 mtime 为戳缓存单目录统计，避免每次目录同步重读上千个桶的记忆文件。
const scratchSelfCache = new Map();
function inspectScratchDirSelf(bucketDir, meta = {}) {
  let stamp = 0;
  try { stamp = fs.statSync(path.join(bucketDir, 'STATE.json')).mtimeMs; } catch { return null; }
  const key = `${bucketDir}|${meta.bucketId || ''}|${meta.kind || ''}|${meta.title || ''}`;
  const hit = scratchSelfCache.get(key);
  if (hit && hit.stamp === stamp) return hit.info;
  const info = inspectScratchDirUncached(bucketDir, meta);
  if (scratchSelfCache.size > 8000) scratchSelfCache.clear();
  scratchSelfCache.set(key, { stamp, info });
  return info;
}

function inspectScratchDirUncached(bucketDir, meta = {}) {
  if (!fs.existsSync(bucketDir) || !fs.existsSync(path.join(bucketDir, 'STATE.json'))) {
    return null;
  }
  const state = readState(bucketDir);
  const countBullets = file => splitLines(readUtf8Safe(path.join(bucketDir, file)))
    .filter(l => l.startsWith('- ') && !l.startsWith('- [已作废]') && !l.includes('（暂无')).length;
  const noteCount = countBullets('NOTES.md');
  const reqCount = countBullets('REQUIREMENTS.md');
  const logCount = countBullets('WORKLOG.md');
  const decCount = splitLines(readUtf8Safe(path.join(bucketDir, 'DECISIONS.md'))).filter(l => l.startsWith('## [')).length;
  const entryCount = noteCount + reqCount + logCount + decCount;
  if (state.revision <= 1 && entryCount === 0) return null;

  const handoffRaw = readUtf8Safe(path.join(bucketDir, 'HANDOFF.md'));
  const stageLines = extractMarkdownSection(handoffRaw, '当前阶段')
    .map(l => l.replace(/^-\s*/, '').trim())
    .filter(l => l && !l.includes('初始化记忆档案袋'));
  const latestWrite = (state.writes || []).at(-1);
  let summary = singleLine(latestWrite?.summary || stageLines[0] || meta.title || '存在历史记录', 120);
  for (const pat of SECRET_PATTERNS) {
    summary = summary.replace(pat.re, '[REDACTED]');
  }
  const updatedMs = Date.parse(state.updatedAt || '') || fs.statSync(path.join(bucketDir, 'STATE.json')).mtimeMs || Date.now();

  return {
    id: meta.bucketId || path.basename(bucketDir),
    kind: meta.kind || (path.basename(bucketDir).startsWith('topic-') ? 'topic' : 'session'),
    title: singleLine(meta.title || path.basename(bucketDir), 80),
    stage: singleLine(stageLines[0] || '推进中', 100),
    summary,
    entry_count: entryCount,
    revision: state.revision,
    updated_at: state.updatedAt || nowIso(),
    updated_ms: updatedMs,
    dir: bucketDir
  };
}

// A bucket counts as empty when no STATE.json in its tree has advanced past the initial revision
// and it holds no task checkpoint, slot record or jsonl log. Anything unreadable counts as content.
function scanScratchBucketContent(bucketDir) {
  let hasContent = false;
  let latestMs = 0;
  let visited = 0;
  const stack = [bucketDir];
  while (stack.length && !hasContent) {
    if (++visited > 2000) { hasContent = true; break; }
    const cur = stack.pop();
    let entries;
    try { entries = fs.readdirSync(cur, { withFileTypes: true }); } catch { hasContent = true; break; }
    for (const entry of entries) {
      const full = path.join(cur, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'slots') { try { if (fs.readdirSync(full).length) hasContent = true; } catch { hasContent = true; } }
        stack.push(full);
        continue;
      }
      try { latestMs = Math.max(latestMs, fs.statSync(full).mtimeMs); } catch {}
      if (entry.name === 'STATE.json') {
        try { if ((JSON.parse(fs.readFileSync(full, 'utf8')).revision || 0) > 1) hasContent = true; } catch { hasContent = true; }
      } else if (entry.name === 'task-checkpoint.json' || entry.name.endsWith('.jsonl')) {
        hasContent = true;
      }
    }
  }
  return { hasContent, latestMs };
}

/**
 * Move idle, empty per-session scratch buckets to `archive/pruned-empty-<stamp>/`. Nothing is
 * deleted; buckets with any content, recent activity, the shared preview bucket and the
 * caller's active bucket are kept. dryRun only reports.
 */
/** 删除一个临时桶（sessions/ 或 topics/ 下按 ID 匹配）：默认 dry_run 只报告；dry_run=false 移入 archive/deleted-<时间>/ 可找回；purge=true 永久删除。不能删当前会话正在用的桶。 */
export function deleteScratchBucket(scratchRoot, { bucketId, activeBucketId = '', dryRun = true, purge = false } = {}) {
  const rootResolved = validateTargetPath(scratchRoot);
  const id = String(bucketId || '').trim();
  if (!id || id === '.' || id === '..' || /[\\/]/.test(id)) throw new Error('SCRATCH_DELETE_ID_REQUIRED: delete 需传入要删除的临时桶 ID（scratch_id，可用 list 查看）。');
  if (id === 'sess-preview') throw new Error('SCRATCH_DELETE_PROTECTED: sess-preview 是共享预览桶，不能删除。');
  if (id === activeBucketId) throw new Error('SCRATCH_DELETE_ACTIVE: 不能删除当前会话正在使用的临时桶；先 unbind 或 bind 到其他桶。');
  let found = '';
  for (const sub of ['sessions', 'topics']) { const dir = path.join(rootResolved, sub, id); if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) { found = dir; break; } }
  if (!found) throw new Error('SCRATCH_DELETE_NOT_FOUND: 找不到临时桶 ' + id + '。');
  const result = { ok: true, dry_run: dryRun, scratch_id: id, path: found, purge };
  if (dryRun) return { ...result, message: '仅预览，未删除；传 dry_run=false 执行（默认移入 archive/ 可找回，purge=true 永久删除）。' };
  if (purge) fs.rmSync(found, { recursive: true, force: true });
  else { const destRoot = path.join(rootResolved, 'archive', `deleted-${compactStamp()}`); fs.mkdirSync(destRoot, { recursive: true }); fs.renameSync(found, path.join(destRoot, id)); result.archive_dir = destRoot; }
  return result;
}

export function pruneEmptyScratchBuckets(scratchRoot, { minIdleMs = 24 * 3600 * 1000, keepBucketIds = [], dryRun = true } = {}) {
  const rootResolved = validateTargetPath(scratchRoot);
  const sessionsDir = path.join(rootResolved, 'sessions');
  const result = { ok: true, dry_run: dryRun, scanned: 0, empty_idle: [], kept_nonempty: 0, kept_recent: 0 };
  if (!fs.existsSync(sessionsDir)) return result;
  const keep = new Set(['sess-preview', ...keepBucketIds.filter(Boolean)]);
  const destRoot = path.join(rootResolved, 'archive', `pruned-empty-${compactStamp()}`);
  const now = Date.now();
  for (const entry of fs.readdirSync(sessionsDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || keep.has(entry.name)) continue;
    result.scanned += 1;
    const dir = path.join(sessionsDir, entry.name);
    const scan = scanScratchBucketContent(dir);
    if (scan.hasContent) { result.kept_nonempty += 1; continue; }
    if (now - (scan.latestMs || now) < minIdleMs) { result.kept_recent += 1; continue; }
    if (!dryRun) {
      fs.mkdirSync(destRoot, { recursive: true });
      fs.renameSync(dir, path.join(destRoot, entry.name));
    }
    result.empty_idle.push(entry.name);
  }
  if (!dryRun && result.empty_idle.length) result.archive_dir = destRoot;
  return result;
}

function scratchCatalogItemDir(rootResolved, item) {
  if (!item?.id) return '';
  if (item.kind === 'legacy') return rootResolved;
  return path.join(rootResolved, item.kind === 'topic' ? 'topics' : 'sessions', item.id);
}

function loadScratchCatalogFile(rootResolved) {
  try {
    const cat = JSON.parse(fs.readFileSync(path.join(rootResolved, 'CATALOG.json'), 'utf8'));
    if (cat?.schema !== 1 || !Array.isArray(cat.buckets)) return null;
    return cat.buckets.filter(item => item?.id).map(item => ({ ...item, dir: scratchCatalogItemDir(rootResolved, item) }));
  } catch {
    return null;
  }
}

// perf-first-chat step01: 只读目录。CATALOG.json 由每次写入增量维护；缺失或损坏时才全量重扫。
export function readScratchCatalog(scratchRoot) {
  const rootResolved = validateTargetPath(scratchRoot);
  const buckets = loadScratchCatalogFile(rootResolved);
  if (buckets) return { scratch_root: rootResolved, buckets };
  return syncScratchCatalog(scratchRoot);
}

function scratchBucketDirs(item) {
  if (Array.isArray(item?.dirs) && item.dirs.length) return item.dirs;
  if (!item?.dir) return [];
  try {
    return [item.dir, ...listActorTaskDirs(item.dir, 50).map(t => t.dir)];
  } catch {
    return [item.dir];
  }
}

export function syncScratchCatalog(scratchRoot, updatedInfo = null) {
  const rootResolved = validateTargetPath(scratchRoot);
  // perf-first-chat step01: 写入某个桶后只重算这个桶，合并进现有目录。
  if (updatedInfo?.bucketId) {
    const existing = loadScratchCatalogFile(rootResolved);
    if (existing) return updateScratchCatalogBucket(rootResolved, existing, updatedInfo);
  }
  fs.mkdirSync(rootResolved, { recursive: true });
  const catalogPath = path.join(rootResolved, 'CATALOG.json');
  const existingTitleMap = new Map();
  try {
    const oldCat = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    for (const item of oldCat?.buckets || []) {
      if (item?.id && item?.title) existingTitleMap.set(item.id, item.title);
    }
  } catch {}
  if (updatedInfo?.bucketId && updatedInfo?.title) {
    existingTitleMap.set(updatedInfo.bucketId, updatedInfo.title);
  }

  const buckets = [];
  for (const [subName, kind] of [['topics', 'topic'], ['sessions', 'session']]) {
    const subDir = path.join(rootResolved, subName);
    if (!fs.existsSync(subDir)) continue;
    for (const entry of fs.readdirSync(subDir)) {
      const full = path.join(subDir, entry);
      try {
        if (!fs.statSync(full).isDirectory()) continue;
        const info = inspectScratchBucket(full, {
          bucketId: entry,
          kind,
          title: existingTitleMap.get(entry) || entry
        });
        if (info) buckets.push(info);
      } catch {}
    }
  }
  const legacyInfo = inspectScratchBucket(rootResolved, {
    bucketId: 'legacy-root',
    kind: 'legacy',
    title: '历史根级临时记忆'
  });
  if (legacyInfo) buckets.push(legacyInfo);

  buckets.sort((a, b) => (b.updated_ms - a.updated_ms) || (b.revision - a.revision));
  const trimmed = buckets.slice(0, 100).map(({ dir, dirs, ...publicItem }) => publicItem);
  const payload = {
    schema: 1,
    engine: MEMORY_ENGINE_VERSION,
    updatedAt: nowIso(),
    buckets: trimmed
  };
  writeAtomic(catalogPath, JSON.stringify(payload, null, 2) + '\n');
  return { scratch_root: rootResolved, buckets };
}

function updateScratchCatalogBucket(rootResolved, existing, updatedInfo) {
  const id = String(updatedInfo.bucketId);
  const old = existing.find(item => item.id === id);
  const kind = old?.kind || (fs.existsSync(path.join(rootResolved, 'topics', id)) ? 'topic' : 'session');
  const dir = kind === 'legacy' ? rootResolved : path.join(rootResolved, kind === 'topic' ? 'topics' : 'sessions', id);
  let info = null;
  try {
    if (fs.existsSync(dir)) info = inspectScratchBucket(dir, { bucketId: id, kind, title: updatedInfo.title || old?.title || id });
  } catch {}
  const buckets = existing.filter(item => item.id !== id);
  if (info) buckets.push(info);
  buckets.sort((a, b) => (b.updated_ms - a.updated_ms) || (b.revision - a.revision));
  const trimmed = buckets.slice(0, 100).map(({ dir: _dir, dirs: _dirs, ...publicItem }) => publicItem);
  writeAtomic(path.join(rootResolved, 'CATALOG.json'), JSON.stringify({ schema: 1, engine: MEMORY_ENGINE_VERSION, updatedAt: nowIso(), buckets: trimmed }, null, 2) + '\n');
  return { scratch_root: rootResolved, buckets: buckets.slice(0, 100) };
}

export function listScratchBuckets(scratchRoot, { excludeBucketId = '', limit = 20 } = {}) {
  const { scratch_root, buckets } = readScratchCatalog(scratchRoot);
  const filtered = excludeBucketId ? buckets.filter(b => b.id !== excludeBucketId) : buckets;
  return {
    scratch_root,
    total_non_empty: filtered.length,
    buckets: filtered.slice(0, Math.max(1, Math.min(100, Number(limit) || 20))).map(({ dir, dirs, ...rest }) => rest)
  };
}

export function searchAcrossScratch(scratchRoot, query, { limit = 8, budget = 1000, mode = 'recall', excludeBucketId = '' } = {}) {
  const { buckets } = readScratchCatalog(scratchRoot);
  const targets = (excludeBucketId ? buckets.filter(b => b.id !== excludeBucketId) : buckets).slice(0, 30).map(b => ({ ...b, dirs: scratchBucketDirs(b) }));
  const merged = [];
  for (const b of targets) {
    const hits = [];
    for (const d of (b.dirs?.length ? b.dirs : [b.dir])) {
      try { const r = searchMemory(d, query, Math.min(10, limit)); hits.push(...(r.items || r.results || [])); } catch {}
    }
    const recencyBonus = Math.max(0, 0.35 - ((Date.now() - (b.updated_ms || 0)) / (7 * 24 * 3600 * 1000)) * 0.35);
    for (const hit of hits) {
      merged.push({
        ...hit,
        scratch_id: b.id,
        scratch_kind: b.kind,
        scratch_title: b.title,
        file: `[scratch:${b.id}]/${hit.file}`,
        score: Number((hit.score + recencyBonus).toFixed(4))
      });
    }
  }
  merged.sort((a, b) => b.score - a.score);
  const topHits = merged.slice(0, Math.max(1, Math.min(50, Number(limit) || 8)));
  if (mode === 'search') {
    return {
      query: singleLine(query, 200),
      cross_scratch: true,
      searched_buckets: targets.length,
      count: topHits.length,
      results: topHits
    };
  }
  const maxChars = Math.max(120, Math.min(8000, Number(budget) || 1000));
  const lines = [];
  const items = [];
  let used = 0;
  for (const h of topHits) {
    const snippet = singleLine(h.text, 220);
    const formatted = `- [${h.file}:${h.line}] (score=${h.score.toFixed(2)}) ${snippet}`;
    if (lines.length > 0 && used + formatted.length + 1 > maxChars) break;
    lines.push(formatted);
    items.push({ scratch_id: h.scratch_id, file: h.file, line: h.line, score: h.score, text: snippet });
    used += formatted.length + 1;
  }
  const topScore = items[0]?.score || 0;
  const confidence = items.length === 0 ? 'none' : topScore >= 4.0 ? 'high' : topScore >= 2.0 ? 'medium' : 'low';
  return {
    query: singleLine(query, 200),
    cross_scratch: true,
    searched_buckets: targets.length,
    confidence,
    count: items.length,
    items,
    text: lines.length > 0 ? lines.join('\n') : '（跨全部临时记忆桶未检索到匹配条目）'
  };
}

export function briefWithScratchCatalog(bucketDir, scratchRoot, currentBucketId, maxLines = 230, options = {}) {
  const cap = Math.max(25, Math.min(1000, Number(maxLines) || 230));
  if (!scratchRoot) return brief(bucketDir, cap, options);
  let otherBuckets = [];
  try {
    otherBuckets = listScratchBuckets(scratchRoot, { excludeBucketId: currentBucketId, limit: 5 }).buckets;
  } catch {}
  const footerLines = [
    '',
    '=== 临时模式多会话隔离与按需取用目录 ===',
    `- 当前活跃临时桶: ${currentBucketId}（与其他临时对话物理隔离，默认不混入无关上下文）`
  ];
  if (otherBuckets.length === 0) {
    footerLines.push('- 其他历史/并行临时桶: 暂无非空记录（如需多模型共享同一临时任务，可传 topic="主题名" 或调 bridge_memory_scratch(action="bind", topic="...")）');
  } else {
    footerLines.push('- 其他可按需取用的临时桶（仅展示桶 ID 与元数据，绝不自动混入正文；当用户要求延续/参考其他临时对话时，调用 bridge_memory_recall(cross_scratch=true, text=...) 或 bridge_memory_brief(scratch_id=...)）：');
    for (const item of otherBuckets) {
      const labelDesc = item.kind === 'topic' ? `共享主题「${singleLine(item.title, 32)}」` : '独立临时会话';
      footerLines.push(`  * [${item.id}] (${labelDesc}, 条目=${item.entry_count}, rev=${item.revision}, 更新=${String(item.updated_at).slice(0, 16).replace('T', ' ')})`);
    }
  }
  let briefOptions = options;
  if (!Array.isArray(options?.extraSections)) {
    // 未由调用方提供汇总视图（接入注入、bind）时，补上同桶其他执行者的最新交接，避免共享主题看不到同伴进度。
    let peerLines = [];
    try { peerLines = buildWorkspaceView(bucketDir, [], {}); } catch { peerLines = []; }
    if (peerLines.length) {
      briefOptions = { ...options, extraSections: [{ title: '同桶其他执行者的交接（只读合并；历史自述，开工前核验）', lines: peerLines, min: Math.min(8, peerLines.length), max: 30 }] };
    }
  }
  const mainBudget = Math.max(20, cap - footerLines.length);
  const mainBrief = splitLines(brief(bucketDir, mainBudget, briefOptions)).slice(0, mainBudget);
  return [...mainBrief, ...footerLines].slice(0, cap).join('\n');
}

// ---- 会话增量记忆追踪器（多模型增量感知 + 临时桶目录索引） --------------------

export class SessionMemoryTracker {
  constructor(maxSessions = 512) {
    this.sessions = new Map();
    this.maxSessions = maxSessions;
  }

  _scopeKey(workspaceId, memoryDir) {
    return `${workspaceId || 'default'}::${path.resolve(memoryDir)}`;
  }

  _evictIfNeeded() {
    while (this.sessions.size > this.maxSessions) {
      const firstKey = this.sessions.keys().next().value;
      if (!firstKey) break;
      this.sessions.delete(firstKey);
    }
  }

  resolveInjection(callerId, workspaceId, memoryDir, options = {}) {
    const resolved = ensureMemoryDir(memoryDir);
    const state = readState(resolved);
    const maxLines = options.maxLines || 230;
    const renderFull = () => options.scratchRoot
      ? briefWithScratchCatalog(resolved, options.scratchRoot, options.scratchBucketId || path.basename(resolved), maxLines)
      : brief(resolved, maxLines);

    const peek = options.peek === true || !callerId || callerId === 'preview-stateless';
    if (peek) {
      return {
        action: 'full_brief',
        revision: state.revision,
        memory_dir: resolved,
        scratch_bucket_id: options.scratchBucketId || null,
        text: renderFull(),
        note: `记忆预览 (rev=${state.revision})`
      };
    }

    let callerMap = this.sessions.get(callerId);
    if (!callerMap) {
      callerMap = new Map();
      this.sessions.set(callerId, callerMap);
      this._evictIfNeeded();
    } else {
      this.sessions.delete(callerId);
      this.sessions.set(callerId, callerMap);
    }

    const scopeKey = this._scopeKey(workspaceId, resolved);
    const prev = callerMap.get(scopeKey);
    // OpenCode context-fixes step02: stableBrief（原生对话用）——每轮都返回同一份缓存的完整简报，保证 system 前缀稳定；
    // 简报之后的新增条目单独放在 delta（调用方放进本轮用户消息）；累计增量超过 25 条或无法逐条列出时才重渲简报。
    if (options.stableBrief === true) return this._resolveStable(callerMap, scopeKey, prev, state, resolved, renderFull, callerId, options);
    if (!prev || options.forceBrief === true) {
      const fullText = renderFull();
      callerMap.set(scopeKey, { lastRevision: state.revision, updatedAt: Date.now() });
      return {
        action: 'full_brief',
        revision: state.revision,
        memory_dir: resolved,
        scratch_bucket_id: options.scratchBucketId || null,
        text: fullText,
        note: `首次接入会话记忆（自动封顶 <=230 行，rev=${state.revision}${options.scratchBucketId ? `，隔离桶=${options.scratchBucketId}` : ''}）`
      };
    }

    if (prev.lastRevision >= state.revision) {
      prev.updatedAt = Date.now();
      return {
        action: 'none',
        revision: state.revision,
        memory_dir: resolved,
        scratch_bucket_id: options.scratchBucketId || null,
        text: `（记忆已是最新 rev=${state.revision}${options.scratchBucketId ? ` · 桶 ${options.scratchBucketId}` : ''}，无需重复下发；如需检索历史或跨临时桶取用请调 bridge_memory_recall）`,
        note: `无新增记忆变更 (rev=${state.revision})`
      };
    }

    const myActor = normalizeActor(callerId);
    const deltaWrites = (state.writes || []).filter(w => w.rev > prev.lastRevision);
    prev.lastRevision = state.revision;
    prev.updatedAt = Date.now();

    if (deltaWrites.length === 0 || deltaWrites.length > 25) {
      return {
        action: 'full_brief',
        revision: state.revision,
        memory_dir: resolved,
        scratch_bucket_id: options.scratchBucketId || null,
        text: renderFull(),
        note: `跨多版本同步完整记忆 (rev=${state.revision})`
      };
    }

    const peerWrites = deltaWrites.filter(w => w.slot && w.slot !== myActor.slot);
    const deltaLines = deltaWrites.map(w => {
      const who = w.actor ? `@${w.actor}` : 'peer';
      const peerFlag = w.slot && w.slot !== myActor.slot ? ' [协作模型新增]' : '';
      return `- [rev ${w.rev} · ${w.kind} · ${who}]${peerFlag} ${w.summary}`;
    });
    return {
      action: 'delta',
      revision: state.revision,
      peer_updates: peerWrites.length,
      memory_dir: resolved,
      scratch_bucket_id: options.scratchBucketId || null,
      text: `【增量记忆同步 · 新增 ${deltaWrites.length} 项（其中其他协作模型 ${peerWrites.length} 项）至 rev=${state.revision}】\n${deltaLines.join('\n')}`,
      note: `增量记忆更新 (+${deltaWrites.length} 条，协作新增=${peerWrites.length}，rev=${state.revision})`
    };
  }

  _resolveStable(callerMap, scopeKey, prev, state, resolved, renderFull, callerId, options) {
    const bucketNote = options.scratchBucketId ? `，隔离桶=${options.scratchBucketId}` : '';
    const fresh = () => {
      const text = renderFull();
      const entry = { lastRevision: state.revision, briefRevision: state.revision, briefText: text, updatedAt: Date.now() };
      callerMap.set(scopeKey, entry);
      return {
        action: 'full_brief',
        revision: state.revision,
        brief_revision: state.revision,
        memory_dir: resolved,
        scratch_bucket_id: options.scratchBucketId || null,
        text,
        delta: '',
        note: `会话记忆简报（每轮相同，自动封顶 <=230 行，简报 rev=${state.revision}${bucketNote}）`
      };
    };
    if (!prev || typeof prev.briefText !== 'string' || options.forceBrief === true) return fresh();
    const baseRevision = Number.isInteger(prev.briefRevision) ? prev.briefRevision : prev.lastRevision;
    if (state.revision < baseRevision) return fresh();
    const deltaWrites = state.revision > baseRevision ? (state.writes || []).filter(w => w.rev > baseRevision) : [];
    if (state.revision > baseRevision && (deltaWrites.length === 0 || deltaWrites.length > 25 || deltaWrites.length < state.revision - baseRevision)) return fresh();
    prev.lastRevision = state.revision;
    prev.updatedAt = Date.now();
    const myActor = normalizeActor(callerId);
    const peerWrites = deltaWrites.filter(w => w.slot && w.slot !== myActor.slot);
    const delta = deltaWrites.length ? `【记忆增量 · 简报 rev=${baseRevision} 之后新增 ${deltaWrites.length} 项（其中其他协作模型 ${peerWrites.length} 项）至 rev=${state.revision}】\n${deltaWrites.map(w => {
      const who = w.actor ? `@${w.actor}` : 'peer';
      const peerFlag = w.slot && w.slot !== myActor.slot ? ' [协作模型新增]' : '';
      return `- [rev ${w.rev} · ${w.kind} · ${who}]${peerFlag} ${w.summary}`;
    }).join('\n')}` : '';
    return {
      action: deltaWrites.length ? 'cached_brief_delta' : 'cached_brief',
      revision: state.revision,
      brief_revision: baseRevision,
      peer_updates: peerWrites.length,
      memory_dir: resolved,
      scratch_bucket_id: options.scratchBucketId || null,
      text: prev.briefText,
      delta,
      note: `会话记忆简报（每轮相同，自动封顶 <=230 行，简报 rev=${baseRevision}${bucketNote}）`
    };
  }

  clearSession(callerId) {
    if (callerId) this.sessions.delete(callerId);
  }
}

export const globalMemoryTracker = new SessionMemoryTracker();

// ---- 共享 MCP 记忆工具定义与统一异步加锁执行器 -------------------------------

const strProp = description => ({ type: 'string', minLength: 1, description });
const wsProp = {
  workspace_id: strProp('可选作用域 ID：传 "scratch"/"global" 指向临时记忆，传已登记工作区 ID 指向对应项目 .opencode-project；省略时按当前会话模式自动路由。'),
  scratch_id: strProp('可选临时记忆桶 ID（如 sess-... 或 topic-...）：用于在临时模式下按需定向读取或操作指定桶。'),
  topic: strProp('可选共享临时主题名：多个临时模型传入相同 topic 可在独立主题桶内协同读写，不污染其他私人临时会话。'),
  memory_dir: strProp('可选记忆目录路径（或检查点文件路径）：支持直接传入项目记忆目录、临时记忆桶目录或具体任务的私有记忆目录路径，只要知道记忆位置就能直接无损读取或继续。'),
  task_id: strProp('可选任务 ID：定向读取指定任务的私有记忆目录与检查点快照。')
};
const casProp = {
  expected_revision: { type: 'integer', minimum: 1, description: '可选乐观并发版本号（STATE.revision）：若其他模型已先行修改导致版本不匹配，将拒绝覆盖并返回 conflict_delta。' },
  slot: strProp('可选多模型协作槽位标识（如 "frontend"、"backend"、"reviewer"）：用于标记条目来源并维护并行不覆盖的交接槽位。')
};
const scopeProp = {
  scope: { type: 'string', enum: ['task', 'workspace', 'all'], description: '检索/简报范围：task=只读本槽位；workspace=再只读合并本工作区项目记忆、其他执行者最新检查点/交接与工作区交接索引（能解析到工作区根时默认）；all=再加全部非空临时桶。结果逐条标注 source。' }
};
const objSchema = (properties, required) => ({
  type: 'object',
  properties,
  ...(required ? { required } : {}),
  additionalProperties: false
});
const makeMemTool = (name, title, description, inputSchema, readOnly = false) => ({
  name,
  title,
  description,
  inputSchema,
  outputSchema: { type: 'object', additionalProperties: true },
  annotations: {
    title,
    readOnlyHint: readOnly,
    destructiveHint: false,
    idempotentHint: readOnly,
    openWorldHint: false
  }
});

export const READ_ONLY_MEMORY_TOOL_NAMES = new Set([
  'bridge_memory_brief',
  'bridge_memory_recall',
  'bridge_memory_search',
  'bridge_memory_status',
  'bridge_memory_digest',
  'bridge_memory_selftest'
]);

export const MEMORY_TOOL_DEFINITIONS = [
  makeMemTool(
    'bridge_memory_brief',
    '读取开工记忆',
    '读取当前项目（.opencode-project）或指定临时记忆桶的开工必读简报（严格封顶 <=230 行，分节预算：PINNED → 交接下一步/未完成 → 工作区汇总视图 → 活跃需求 → 待确认 → 随手记 → 检查点 → 日志；支持损坏回退、断层补充及临时桶按需定向读取）。',
    objSchema({ ...wsProp, ...scopeProp, max_lines: { type: 'integer', minimum: 20, maximum: 1000, description: '返回最大行数（默认 230）。' }, workspace_root: { type: 'string', description: '可选：当前工作区路径。用于找回其他会话在同一工作区留下的交接，并生成工作区汇总视图（默认取宿主当前工作区）。' } }),
    true
  ),
  makeMemTool(
    'bridge_memory_recall',
    '轻量召回记忆',
    '按问题或关键词精准召回最相关的记忆片段（默认 <=5 条、<=800 字）。默认 scope=workspace 只读合并同工作区记忆；配置向量服务后自动混合检索（结果 mode=hybrid，否则 lexical）。支持 cross_scratch=true 在全部临时会话/主题桶中跨桶按需取用。',
    objSchema({
      ...wsProp,
      ...scopeProp,
      workspace_root: strProp('可选：当前工作区路径（用于 scope=workspace 解析；默认取宿主当前工作区）。'),
      include_inactive: { type: 'boolean', description: '设为 true 时包含已被取代/已过期的条目（默认跳过）。' },
      text: strProp('检索问题或关键词。'),
      cross_scratch: { type: 'boolean', description: '设为 true 时跨全部历史与并行临时记忆桶检索并标注来源桶 ID。' },
      limit: { type: 'integer', minimum: 1, maximum: 20, description: '返回条数上限（默认 5）。' },
      budget: { type: 'integer', minimum: 100, maximum: 8000, description: '字符预算上限（默认 800）。' }
    }, ['text']),
    true
  ),
  makeMemTool(
    'bridge_memory_search',
    '全文检索记忆索引',
    '使用缓存倒排索引（中文二元+三元切词、BM25 行长归一）与中英同义词表搜索记忆文档及归档历史；配置向量服务后与语义向量做倒数排名融合（mode=hybrid）。默认 scope=workspace；支持 cross_scratch=true 跨全部临时记忆桶检索。',
    objSchema({
      ...wsProp,
      ...scopeProp,
      workspace_root: strProp('可选：当前工作区路径（用于 scope=workspace 解析；默认取宿主当前工作区）。'),
      include_inactive: { type: 'boolean', description: '设为 true 时包含已被取代/已过期的条目（默认跳过）。' },
      query: strProp('搜索词或短语。'),
      cross_scratch: { type: 'boolean', description: '设为 true 时跨全部历史与并行临时记忆桶搜索。' },
      limit: { type: 'integer', minimum: 1, maximum: 50, description: '返回条数上限（默认 15）。' }
    }, ['query']),
    true
  ),
  makeMemTool(
    'bridge_memory_append',
    '追加或流转记忆',
    '多模型互斥加锁追加记录（note/req/req_status/decide/log/pin/unpin/confirm），自动附带模型/会话来源标签并支持 expected_revision 乐观并发防覆盖检查；可选 valid_from/valid_until 有效期与 subject 主题（供 consolidate 判定取代）。',
    objSchema({
      ...wsProp,
      ...casProp,
      kind: { type: 'string', enum: ['note', 'req', 'req_status', 'decide', 'log', 'pin', 'unpin', 'confirm'], description: '记录类别。pin=钉入固定在场集（每次开工必带，上限 25 条，只放身份/硬约束/当前承诺）；unpin=按关键词作废固定条目；confirm=按关键词确认 [自动·待确认] 条目（text="*" 确认全部；决策写入 DECISIONS、需求状态同步到 REQUIREMENTS）。' },
      valid_from: strProp('可选生效时间 YYYY-MM-DD 或 YYYY-MM-DD HH:mm（note/req/decide/pin）；未到时间前 brief 与检索默认跳过。'),
      valid_until: strProp('可选失效时间 YYYY-MM-DD 或 YYYY-MM-DD HH:mm（只写日期按当天结束）；过期后 brief 与检索默认跳过。'),
      subject: strProp('可选主题键（note/decide）：同主题的新条目在 bridge_memory_consolidate 时会把旧条目标记为已被取代。'),
      text: strProp('正文内容（当 kind=req_status 时为要匹配的需求关键词）。'),
      title: strProp('决策标题（kind=decide 时使用）。'),
      conclusion: strProp('决策结论（kind=decide 且未传 text 时兼容使用）。'),
      reason: strProp('决策理由（kind=decide 时可选补充）。'),
      status: strProp('需求状态（待办/进行中/已完成/已取消）。')
    }, ['kind'])
  ),
  makeMemTool(
    'bridge_memory_forget',
    '作废过时随手记',
    '互斥加锁将 NOTES.md 中包含指定关键词的随手记标记为 [已作废]（自动留存 .bak 备份，后续检索自动跳过）。',
    objSchema({ ...wsProp, ...casProp, keyword: strProp('要作废的随手记关键词或短语。') }, ['keyword'])
  ),
  makeMemTool(
    'bridge_memory_draft',
    '生成交接单草稿',
    '根据近期 WORKLOG 与活跃 REQUIREMENTS 自动生成 HANDOFF.draft.md 交接草稿。',
    objSchema({ ...wsProp, ...casProp })
  ),
  makeMemTool(
    'bridge_memory_handoff',
    '更新多模型交接单并归档',
    '互斥加锁更新交接单：默认 handoff_mode="slot_merge" 按模型槽位独立落盘并自动合成并行模型进度，防止多模型互相覆盖；传 handoff_mode="consolidate" 可由主控/合并模型统合归并所有并行槽位。请同时填写 workspace_root/git_branch/git_commit/artifacts/uncommitted/verified/constraints 定位字段，next 写出具体文件或命令；任务卡自动归档不会覆盖手写交接。交接时会自动把决策/约束/需求完成迹象提取为 [自动·待确认] 条目（extract_facts=false 可关闭）。',
    objSchema({
      ...wsProp,
      ...casProp,
      handoff_mode: { type: 'string', enum: ['slot_merge', 'consolidate'], description: 'slot_merge（默认，保留其他活跃模型的并行交接槽位防覆盖）| consolidate（统合归并全部并行槽位）。' },
      summary: strProp('交接摘要。'),
      stage: strProp('当前阶段说明。'),
      done: { type: ['string', 'array'], items: { type: 'string' }, description: '已完成事项。' },
      todo: { type: ['string', 'array'], items: { type: 'string' }, description: '未完成事项。' },
      next: { type: ['string', 'array'], items: { type: 'string' }, description: '下一步（接班必看）具体行动项。' },
      risk: { type: ['string', 'array'], items: { type: 'string' }, description: '风险与卡点。' },
      files: { type: ['string', 'array'], items: { type: 'string' }, description: '最近改动文件列表。' },
      workspace_root: strProp('工作区根目录绝对路径（接班定位必填项之一）。'),
      git_branch: strProp('当前工作所在 Git 分支。'),
      git_commit: strProp('最近一次相关提交（短哈希即可）。'),
      artifacts: { type: ['string', 'array'], items: { type: 'string' }, description: '构建产物/输出文件路径。' },
      uncommitted: { type: ['string', 'array'], items: { type: 'string' }, description: '未提交、未同步或未替换到运行目录的状态。' },
      verified: { type: ['string', 'array'], items: { type: 'string' }, description: '验证状态：已编译/已运行/未验证等，如实填写。' },
      constraints: { type: ['string', 'array'], items: { type: 'string' }, description: '用户约束与授权边界。' },
      force: { type: 'boolean', description: '当 handoff_gate=block 时是否强制放行。' },
      extract_facts: { type: 'boolean', description: '是否从本次交接字段自动提取决策/约束/需求状态变化为 [自动·待确认] 条目（默认 true；去重并过滤套话）。' }
    })
  ),
  makeMemTool(
    'bridge_memory_status',
    '查看记忆健康状态与临时桶目录',
    '返回记忆健康分、文件体积、当前 revision 及可选的临时记忆桶目录列表（list_scratch=true）。',
    objSchema({
      ...wsProp,
      list_scratch: { type: 'boolean', description: '是否同时列出全部非空临时记忆桶目录摘要。' }
    }),
    true
  ),
  makeMemTool(
    'bridge_memory_digest',
    '查看近期记忆周期摘要',
    '汇总最近 N 天（默认 7 天）的工作日志、已完成需求、当前活跃待办及新增架构决策。',
    objSchema({ ...wsProp, days: { type: 'integer', minimum: 1, maximum: 365, description: '统计天数（默认 7）。' } }),
    true
  ),
  makeMemTool(
    'bridge_memory_archive',
    '执行安全定期归档',
    '互斥加锁将超期工作日志、已完成需求安全归档至 archive/，绝不归档 [待办]/[进行中] 需求。',
    objSchema({ ...wsProp, ...casProp, days: { type: 'integer', minimum: 1, maximum: 3650, description: '保留近期工作日志天数（默认 14）。' } })
  ),
  makeMemTool(
    'bridge_memory_promote',
    '临时记忆转正至项目记忆',
    '互斥加锁将指定临时记忆桶（或当前会话临时桶）中的有效需求、随手记与架构决策幂等转正合并至目标工作区的 .opencode-project。',
    objSchema({
      ...casProp,
      scratch_id: strProp('可选来源临时记忆桶 ID（省略时使用当前会话活跃临时桶）。'),
      topic: strProp('可选来源临时主题名。'),
      target_workspace_id: strProp('目标项目工作区 ID（省略时转正至当前打开的工作区项目）。'),
      target_root: strProp('可选目标项目绝对路径。'),
      keyword: strProp('可选过滤关键词。'),
      include_worklogs: { type: 'boolean', description: '是否同时迁移工作日志（默认 false）。' }
    })
  ),
  makeMemTool(
    'bridge_memory_scratch',
    '管理临时模式隔离桶与按需绑定',
    '管理临时模式下的多模型会话隔离桶与共享主题桶：list 列出可取用临时桶，bind 将当前会话切换到指定 topic（多模型共享）或已有 scratch_id（接力前文），unbind 恢复当前会话私有隔离桶，merge_from 从指定临时桶按需导入记忆条目，prune_empty 把闲置超过 24 小时的空会话桶移入 archive/（默认 dry_run 只报告，不删除）。',
    objSchema({
      action: { type: 'string', enum: ['list', 'bind', 'unbind', 'merge_from', 'prune_empty', 'delete'], description: '操作类型。delete 删除指定 scratch_id 的临时桶（默认 dry_run 预览）。' },
      purge: { type: 'boolean', description: 'delete 时是否永久删除（默认 false：移入 archive/deleted-<时间>/，可找回）。' },
      dry_run: { type: 'boolean', description: 'prune_empty / delete 时是否只报告（默认 true）；传 false 才执行。' },
      scratch_id: strProp('目标或来源临时桶 ID（bind 或 merge_from 时使用）。'),
      topic: strProp('共享临时主题名称（bind 到多模型协作主题桶时使用）。'),
      keyword: strProp('merge_from 时的可选过滤关键词。'),
      include_worklogs: { type: 'boolean', description: 'merge_from 时是否包含工作日志。' }
    }, ['action'])
  ),
  makeMemTool(
    'bridge_memory_consolidate',
    '整合去重记忆（默认预览）',
    '整理当前记忆目录：全文件精确/近似重复（词元 Jaccard >= jaccard，默认 0.85）合并保留最新条目；同主题（〔主题:xxx〕、「主题：」前缀或决策标题）的旧随手记/决策标记为 [已被取代→新条目]；统计已过期条目。默认 dry-run 只返回预览；apply=true 才在写锁内原子写入，并把原文件备份到 archive/consolidate-backup-*/。',
    objSchema({
      ...wsProp,
      ...casProp,
      apply: { type: 'boolean', description: '设为 true 才实际写入（默认 false = 只预览）。' },
      jaccard: { type: 'number', minimum: 0.6, maximum: 1, description: '近似重复阈值（默认 0.85）。' },
      files: { type: 'array', items: { type: 'string', enum: ['NOTES.md', 'REQUIREMENTS.md', 'PINNED.md', 'WORKLOG.md', 'DECISIONS.md'] }, description: '可选：只处理这些文件（默认全部）。WORKLOG 只做精确去重。' }
    })
  ),
  makeMemTool(
    'bridge_memory_policy',
    '读取或配置交接门禁策略',
    '查看或设置当前记忆目录 policy.json 的 handoff_gate（off | warn | block）。',
    objSchema({
      ...wsProp,
      ...casProp,
      handoff_gate: { type: 'string', enum: ['off', 'warn', 'block'], description: '省略时仅读取当前策略；传入时更新策略。' }
    })
  ),
  makeMemTool(
    'bridge_memory_selftest',
    '运行记忆引擎与多模型并发自检',
    '在系统临时目录运行 40+ 项隔离自检断言（含 12 模型并发写锁争用、CAS 冲突检测、分槽位交接防覆盖、临时模式多会话隔离与跨桶按需取用、4000 条增长封顶，以及 step03 混合检索回退/注入向量 RRF、有效期与取代、自动待确认提取与确认、consolidate 预览/应用、工作区范围合并、brief 分节顺序），不修改任何真实项目文件，不访问网络。',
    objSchema({}),
    true
  )
];

export const MEMORY_TOOL_NAMES = new Set(MEMORY_TOOL_DEFINITIONS.map(t => t.name));

function checkOptimisticRevision(memoryDir, expectedRevision) {
  if (expectedRevision === undefined || expectedRevision === null) return null;
  const state = readState(memoryDir);
  const exp = Number(expectedRevision);
  if (state.revision === exp) return null;
  const conflictDelta = (state.writes || []).filter(w => w.rev > exp);
  return {
    ok: false,
    error_code: 'MEMORY_REVISION_CONFLICT',
    message: `记忆已被其他协作模型更新（期望 rev=${exp}，当前 rev=${state.revision}）。请先核对 conflict_delta 中的队友变更后再合并或重试。`,
    expected_revision: exp,
    current_revision: state.revision,
    conflict_delta: conflictDelta
  };
}

/**
 * 统一异步加锁记忆工具执行器（同时支持 AutomationService 与独立 003-mcp-server）。
 */
export async function executeMemoryTool(name, args = {}, context = {}) {
  const owner = context.owner || 'mcp-client';
  const scratchRoot = context.resolveScratchRoot
    ? context.resolveScratchRoot()
    : getMemoryDir('scratch', context.scratchDirectory || '');
  const workspaceRootsFor = (a, memDir, extra = []) => {
    const list = [];
    const push = v => { for (const x of (Array.isArray(v) ? v : [v])) if (typeof x === 'string' && x.trim()) list.push(x.trim()); };
    push(a?.workspace_root);
    push(extra);
    try { push(context.currentWorkspaceRoot?.() || ''); } catch {}
    if (Array.isArray(context.workspaceRoots)) push(context.workspaceRoots);
    try { push(readLatestManualSlot(memDir)?.location?.workspace_root || []); } catch {}
    return [...new Set(list)];
  };

  const resolveTarget = (wsId, extra = {}) => {
    const scratchId = extra.scratch_id ?? args.scratch_id ?? '';
    const topic = extra.topic ?? args.topic ?? '';
    const memoryDirArg = extra.memory_dir ?? args.memory_dir ?? '';
    const taskIdArg = extra.task_id ?? args.task_id ?? '';
    if (typeof memoryDirArg === 'string' && memoryDirArg.trim()) {
      let explicitDir = path.resolve(memoryDirArg.trim());
      if (/\.(json|jsonl|md)$/i.test(path.basename(explicitDir))) {
        explicitDir = path.dirname(explicitDir);
      }
      const isScr = explicitDir === path.resolve(scratchRoot) || explicitDir.startsWith(path.resolve(scratchRoot) + path.sep);
      return { isScratch: isScr, scratchRoot, bucketId: isScr ? path.basename(explicitDir) : null, bucketTitle: null, memoryDir: explicitDir, scopeId: isScr ? 'scratch' : (wsId || context.defaultWorkspaceId || 'direct') };
    }
    const forceScratch = Boolean(scratchId || topic || wsId === 'scratch' || wsId === 'global');
    // A host-provided target also owns scratch actor/task isolation. Never bypass it.
    if (context.resolveTargetInfo) {
      return context.resolveTargetInfo(wsId, { scratchId, topic, memoryDir: memoryDirArg, taskId: taskIdArg, owner });
    }
    if (forceScratch) {
      const b = resolveScratchBucketDir(scratchRoot, {
        owner: context.scratchOwner || owner,
        scratchId: scratchId || (!topic && context.getBoundScratchId ? context.getBoundScratchId(owner) : ''),
        topic
      });
      return { isScratch: true, scratchRoot, bucketId: b.bucketId, bucketTitle: b.title, memoryDir: b.dir, scopeId: 'scratch' };
    }
    if (context.resolveMemoryDir) {
      const dir = context.resolveMemoryDir(wsId);
      const isScr = path.resolve(dir).startsWith(path.resolve(scratchRoot));
      return {
        isScratch: isScr,
        scratchRoot,
        bucketId: isScr ? path.basename(dir) : null,
        bucketTitle: null,
        memoryDir: dir,
        scopeId: wsId || context.defaultWorkspaceId || 'auto'
      };
    }
    const roots = Array.isArray(context.workspaceRoots) ? context.workspaceRoots : [];
    if (!roots[0]) {
      const b = resolveScratchBucketDir(scratchRoot, { owner: context.scratchOwner || owner });
      return { isScratch: true, scratchRoot, bucketId: b.bucketId, bucketTitle: b.title, memoryDir: b.dir, scopeId: 'scratch' };
    }
    return { isScratch: false, scratchRoot, bucketId: null, bucketTitle: null, memoryDir: getMemoryDir(roots[0], context.scratchDirectory || ''), scopeId: wsId || 'workspace' };
  };

  // Callers without a usable identity all resolve to the shared `sess-preview` bucket. Writing
  // there mixes unrelated conversations, so writes are refused unless a bucket was chosen explicitly.
  const assertWritableTarget = target => {
    const explicit = [args.memory_dir, args.scratch_id, args.topic].some(v => typeof v === 'string' && v.trim());
    if (!explicit && target?.isScratch && target.bucketId === 'sess-preview') {
      throw new Error('SCRATCH_IDENTITY_REQUIRED: 当前连接没有可用的会话身份，会落入多个对话共用的 sess-preview 桶，已拒绝写入。请传入 topic（共享主题）或 scratch_id（指定桶）后重试。');
    }
    return target;
  };

  // step03: scope resolution. Reads may merge other workspace sources (read-only, labelled);
  // writes always stay in the caller's own resolved slot.
  const resolveScope = (raw, roots) => (['task', 'workspace', 'all'].includes(raw) ? raw : (roots.length ? 'workspace' : 'task'));
  const scopeSources = (target, scope, roots) => {
    const own = { dir: target.memoryDir, label: 'task', weight: 1, kind: 'task' };
    if (scope === 'task') return [own];
    let extra = [];
    try { extra = collectWorkspaceSources(target.memoryDir, roots, { scratchRoot, includeAllScratch: scope === 'all' }); } catch {}
    return [own, ...extra];
  };

  const refreshCatalogIfNeeded = async target => {
    if (!target?.isScratch || !target.scratchRoot) return;
    await withMemoryLock(target.scratchRoot, async () => {
      syncScratchCatalog(target.scratchRoot, { bucketId: target.bucketId, title: target.bucketTitle || target.bucketId });
    });
  };

  if (name === 'bridge_memory_scratch') {
    const action = args.action || 'list';
    if (action === 'list') {
      const activeTarget = resolveTarget('scratch');
      const listed = listScratchBuckets(scratchRoot, { limit: 30 });
      return {
        ok: true,
        action: 'list',
        active_scratch_id: activeTarget.bucketId,
        active_memory_dir: activeTarget.memoryDir,
        ...listed
      };
    }
    if (action === 'unbind') {
      context.setBoundScratch?.(owner, null);
      const resetTarget = resolveTarget("scratch");
      return {
        ok: true,
        action: 'unbind',
        active_scratch_id: resetTarget.bucketId,
        active_memory_dir: resetTarget.memoryDir,
        message: `已恢复当前会话私有隔离临时桶 ${resetTarget.bucketId}`
      };
    }
    if (action === 'bind') {
      if (!args.scratch_id && !args.topic) {
        throw new Error('SCRATCH_BIND_TARGET_REQUIRED: bind 操作需传入 topic（共享主题名）或 scratch_id（已有临时桶 ID）。');
      }
      const bound = resolveScratchBucketDir(scratchRoot, {
        owner: context.scratchOwner || owner,
        scratchId: args.scratch_id || '',
        topic: args.topic || ''
      });
      ensureMemoryDir(bound.dir);
      context.setBoundScratch?.(owner, { bucketId: bound.bucketId, title: bound.title, dir: bound.dir });
      await withMemoryLock(scratchRoot, async () => {
        syncScratchCatalog(scratchRoot, { bucketId: bound.bucketId, title: bound.title });
      });
      const privateTarget = resolveTarget("scratch", { scratch_id: bound.bucketId });
      const text = briefWithScratchCatalog(privateTarget.memoryDir, scratchRoot, bound.bucketId, 230);
      return {
        ok: true,
        action: 'bind',
        active_scratch_id: bound.bucketId,
        kind: bound.kind,
        title: bound.title,
        active_memory_dir: privateTarget.memoryDir,
        brief: text
      };
    }
    if (action === 'delete') {
      const activeTarget = resolveTarget('scratch');
      const res = await withMemoryLock(scratchRoot, async () => {
        const out = deleteScratchBucket(scratchRoot, { bucketId: args.scratch_id, activeBucketId: activeTarget.bucketId, dryRun: args.dry_run !== false, purge: args.purge === true });
        if (!out.dry_run) syncScratchCatalog(scratchRoot);
        return out;
      });
      return { action: 'delete', active_scratch_id: activeTarget.bucketId, ...res };
    }
    if (action === 'prune_empty') {
      const activeTarget = resolveTarget('scratch');
      const res = await withMemoryLock(scratchRoot, async () => {
        const out = pruneEmptyScratchBuckets(scratchRoot, { keepBucketIds: [activeTarget.bucketId], dryRun: args.dry_run !== false });
        if (!out.dry_run && out.empty_idle.length) syncScratchCatalog(scratchRoot);
        return out;
      });
      return { action: 'prune_empty', active_scratch_id: activeTarget.bucketId, ...res };
    }
    if (action === 'merge_from') {
      if (!args.scratch_id && !args.topic) {
        throw new Error('SCRATCH_SOURCE_REQUIRED: merge_from 需传入来源 scratch_id 或 topic。');
      }
      const srcBucket = resolveScratchBucketDir(scratchRoot, {
        owner: context.scratchOwner || owner,
        scratchId: args.scratch_id || '',
        topic: args.topic || ''
      });
      const dstTarget = resolveTarget(args.workspace_id);
      if (path.resolve(srcBucket.dir) === path.resolve(dstTarget.memoryDir)) {
        return { ok: true, action: 'merge_from', total: 0, message: '来源桶与当前目标相同，无需导入。' };
      }
      const res = await withMemoryLock(dstTarget.memoryDir, async () => {
        return promoteMemory(srcBucket.dir, dstTarget.memoryDir, {
          keyword: args.keyword,
          includeWorklogs: args.include_worklogs === true
        }, owner);
      });
      await refreshCatalogIfNeeded(dstTarget);
      return { action: 'merge_from', source_scratch_id: srcBucket.bucketId, target_memory_dir: dstTarget.memoryDir, ...res };
    }
  }

  if (name === 'bridge_memory_brief') {
    const target = resolveTarget(args.workspace_id);
    const cap = Math.max(20, Math.min(1000, Number(args.max_lines) || 230));
    const briefRoots = workspaceRootsFor(args, target.memoryDir);
    const scope = resolveScope(args.scope, briefRoots);
    let wsHandoffs = [];
    const extraSections = [];
    if (scope !== 'task') {
      try { wsHandoffs = readWorkspaceHandoffs(scratchRoot, briefRoots, target.memoryDir); } catch { wsHandoffs = []; }
      let viewLines = [];
      try { viewLines = buildWorkspaceView(target.memoryDir, briefRoots, { scratchRoot }); } catch { viewLines = []; }
      const wsLines = wsHandoffs.length
        ? ['- 同一工作区其他会话的交接（按工作区路径匹配，最新在前）：', ...splitLines(formatWorkspaceHandoffs(wsHandoffs)).slice(1)]
        : [];
      const merged = [...wsLines, ...viewLines];
      if (merged.length) {
        extraSections.push({
          title: '工作区汇总视图（只读合并，按来源标注；写入仍在本槽位；历史自述，开工前核验）',
          lines: merged,
          min: Math.min(12, merged.length),
          max: Math.max(12, Math.min(70, Math.floor(cap * 0.3)))
        });
      }
    }
    const text = target.isScratch
      ? briefWithScratchCatalog(target.memoryDir, target.scratchRoot, target.bucketId, cap, { extraSections })
      : brief(target.memoryDir, cap, { extraSections });
    return {
      workspace_id: target.scopeId,
      ...(target.bucketId ? { scratch_id: target.bucketId } : {}),
      memory_dir: target.memoryDir,
      scope,
      lines: splitLines(text).length,
      ...(briefRoots.length ? { workspace_roots: briefRoots, workspace_handoffs: wsHandoffs.length } : {}),
      brief: text,
      observed: observeMemory(target.memoryDir),
      provenance: { previous: 'HANDOFF.md 是历史自述，可能回退上次有效快照；不是已验证事实。', current: 'observed 是本次对记忆文件的有限观察，不代替对项目、命令或测试的核验。' }
    };
  }

  if (name === 'bridge_memory_recall') {
    if (args.cross_scratch === true) {
      return searchAcrossScratch(scratchRoot, args.text, {
        limit: args.limit || 5,
        budget: args.budget || 800,
        mode: 'recall'
      });
    }
    const target = resolveTarget(args.workspace_id);
    const roots = workspaceRootsFor(args, target.memoryDir);
    const scope = resolveScope(args.scope, roots);
    const sources = scopeSources(target, scope, roots);
    const opts = { includeInactive: args.include_inactive === true };
    const capLimit = Math.max(1, Math.min(20, Number(args.limit) || 5));
    const capBudget = Math.max(100, Math.min(8000, Number(args.budget) || 800));
    const res = sources.length > 1
      ? formatRecallResult(await searchMemorySources(sources, args.text, Math.max(capLimit * 3, 15), opts), capLimit, capBudget)
      : await recallAsync(target.memoryDir, args.text, capLimit, capBudget, opts);
    return {
      memory_dir: target.memoryDir,
      ...(target.bucketId ? { scratch_id: target.bucketId } : {}),
      scope,
      ...(sources.length > 1 ? { scope_source_count: sources.length } : {}),
      ...res
    };
  }

  if (name === 'bridge_memory_search') {
    if (args.cross_scratch === true) {
      return searchAcrossScratch(scratchRoot, args.query, {
        limit: args.limit || 15,
        mode: 'search'
      });
    }
    const target = resolveTarget(args.workspace_id);
    const roots = workspaceRootsFor(args, target.memoryDir);
    const scope = resolveScope(args.scope, roots);
    const sources = scopeSources(target, scope, roots);
    const opts = { includeInactive: args.include_inactive === true };
    const res = sources.length > 1
      ? await searchMemorySources(sources, args.query, args.limit || 15, opts)
      : await searchMemoryHybrid(target.memoryDir, args.query, args.limit || 15, opts);
    return {
      memory_dir: target.memoryDir,
      ...(target.bucketId ? { scratch_id: target.bucketId } : {}),
      scope,
      ...(sources.length > 1 ? { scope_source_count: sources.length } : {}),
      ...res
    };
  }

  if (name === 'bridge_memory_append') {
    const target = assertWritableTarget(resolveTarget(args.workspace_id));
    const out = await withMemoryLock(target.memoryDir, async () => {
      const conflict = checkOptimisticRevision(target.memoryDir, args.expected_revision);
      if (conflict) return conflict;
      const bodyText = args.text || [args.conclusion, args.reason ? `理由：${args.reason}` : ''].filter(Boolean).join('；');
      const entryMeta = { validFrom: args.valid_from, validUntil: args.valid_until, subject: args.subject };
      if (args.kind === 'note') return appendNote(target.memoryDir, bodyText, owner, args.slot || '', entryMeta);
      if (args.kind === 'pin') return appendPin(target.memoryDir, bodyText, owner, args.slot || '', entryMeta);
      if (args.kind === 'unpin') return unpin(target.memoryDir, bodyText, owner);
      if (args.kind === 'confirm') return confirmAutoEntries(target.memoryDir, bodyText, owner, args.slot || '');
      if (args.kind === 'req') return appendRequirement(target.memoryDir, bodyText, args.status || '待办', owner, args.slot || '', entryMeta);
      if (args.kind === 'req_status') return updateRequirementStatus(target.memoryDir, bodyText, args.status || '已完成', owner, args.slot || '');
      if (args.kind === 'decide') return appendDecision(target.memoryDir, args.title || '架构决策', bodyText, owner, args.slot || '', entryMeta);
      return appendLog(target.memoryDir, bodyText, owner, args.slot || '');
    });
    if (out.ok) await refreshCatalogIfNeeded(target);
    return { memory_dir: target.memoryDir, ...(target.bucketId ? { scratch_id: target.bucketId } : {}), ...out };
  }

  if (name === 'bridge_memory_forget') {
    const target = assertWritableTarget(resolveTarget(args.workspace_id));
    const out = await withMemoryLock(target.memoryDir, async () => {
      const conflict = checkOptimisticRevision(target.memoryDir, args.expected_revision);
      if (conflict) return conflict;
      return forget(target.memoryDir, args.keyword, owner);
    });
    if (out.ok) await refreshCatalogIfNeeded(target);
    return { memory_dir: target.memoryDir, ...(target.bucketId ? { scratch_id: target.bucketId } : {}), ...out };
  }

  if (name === 'bridge_memory_draft') {
    const target = assertWritableTarget(resolveTarget(args.workspace_id));
    const out = await withMemoryLock(target.memoryDir, async () => {
      const conflict = checkOptimisticRevision(target.memoryDir, args.expected_revision);
      if (conflict) return conflict;
      return draftHandoff(target.memoryDir, owner);
    });
    return { memory_dir: target.memoryDir, ...(target.bucketId ? { scratch_id: target.bucketId } : {}), ...out };
  }

  if (name === 'bridge_memory_handoff') {
    const target = assertWritableTarget(resolveTarget(args.workspace_id));
    const out = await withMemoryLock(target.memoryDir, async () => {
      const conflict = checkOptimisticRevision(target.memoryDir, args.expected_revision);
      if (conflict) return conflict;
      return handoffMemory(target.memoryDir, args, owner);
    });
    if (out.ok) await refreshCatalogIfNeeded(target);
    let indexed = [];
    if (out.ok && out.handoff_good && args.auto !== true) {
      try {
        const slot = JSON.parse(fs.readFileSync(path.join(out.memory_dir, 'slots', `${out.slot}.json`), 'utf8'));
        const roots = workspaceRootsFor(args, out.memory_dir, slot.location?.workspace_root || []);
        let taskTitle = '';
        try { taskTitle = readTaskCheckpointSummary(path.join(out.memory_dir, 'task-checkpoint.json'))?.title || ''; } catch {}
        indexed = recordWorkspaceHandoff(scratchRoot, roots, {
          memory_dir: out.memory_dir, slot: slot.slot, label: slot.label, owner: slot.owner,
          updated_at: slot.updated_at, updated_ms: slot.updated_ms, task_title: taskTitle,
          stage: slot.stage, todo: slot.todo, next: slot.next, location: slot.location || {}
        });
      } catch {}
    }
    return { ...(target.bucketId ? { scratch_id: target.bucketId } : {}), ...out, ...(indexed.length ? { workspace_indexed: indexed } : {}) };
  }

  if (name === 'bridge_memory_status') {
    const target = resolveTarget(args.workspace_id);
    return {
      workspace_id: target.scopeId,
      ...(target.bucketId ? { scratch_id: target.bucketId } : {}),
      memory_dir: target.memoryDir,
      state: readState(target.memoryDir),
      weight: weightMemory(target.memoryDir),
      ...checkMemory(target.memoryDir),
      ...(args.list_scratch || target.isScratch ? { scratch_catalog: listScratchBuckets(scratchRoot, { limit: 20 }) } : {})
    };
  }

  if (name === 'bridge_memory_digest') {
    const target = resolveTarget(args.workspace_id);
    return {
      memory_dir: target.memoryDir,
      ...(target.bucketId ? { scratch_id: target.bucketId } : {}),
      ...digestMemory(target.memoryDir, args.days || 7)
    };
  }

  if (name === 'bridge_memory_archive') {
    const target = assertWritableTarget(resolveTarget(args.workspace_id));
    const out = await withMemoryLock(target.memoryDir, async () => {
      const conflict = checkOptimisticRevision(target.memoryDir, args.expected_revision);
      if (conflict) return conflict;
      return archiveMemory(target.memoryDir, args.days || 14, owner);
    });
    if (out.ok) await refreshCatalogIfNeeded(target);
    return { memory_dir: target.memoryDir, ...(target.bucketId ? { scratch_id: target.bucketId } : {}), ...out };
  }

  if (name === 'bridge_memory_promote') {
    const srcTarget = resolveTarget('scratch', { scratch_id: args.scratch_id, topic: args.topic });
    const projectDir = args.target_root
      ? getMemoryDir(args.target_root, context.scratchDirectory || '')
      : context.resolveProjectDir
        ? context.resolveProjectDir(args.target_workspace_id)
        : resolveTarget(args.target_workspace_id).memoryDir;
    const out = await withMemoryLock(projectDir, async () => {
      const conflict = checkOptimisticRevision(projectDir, args.expected_revision);
      if (conflict) return conflict;
      return promoteMemory(srcTarget.memoryDir, projectDir, {
        keyword: args.keyword,
        includeWorklogs: args.include_worklogs === true
      }, owner);
    });
    return { source_scratch_id: srcTarget.bucketId, ...out };
  }

  if (name === 'bridge_memory_consolidate') {
    const target = resolveTarget(args.workspace_id);
    const copts = { apply: args.apply === true, jaccard: args.jaccard, files: args.files };
    if (!copts.apply) {
      return { memory_dir: target.memoryDir, ...(target.bucketId ? { scratch_id: target.bucketId } : {}), ...consolidateMemory(target.memoryDir, copts, owner) };
    }
    assertWritableTarget(target);
    const out = await withMemoryLock(target.memoryDir, async () => {
      const conflict = checkOptimisticRevision(target.memoryDir, args.expected_revision);
      if (conflict) return conflict;
      return consolidateMemory(target.memoryDir, copts, owner);
    });
    if (out.ok) await refreshCatalogIfNeeded(target);
    return { memory_dir: target.memoryDir, ...(target.bucketId ? { scratch_id: target.bucketId } : {}), ...out };
  }

  if (name === 'bridge_memory_policy') {
    const target = resolveTarget(args.workspace_id);
    if (args.handoff_gate) {
      assertWritableTarget(target);
      const out = await withMemoryLock(target.memoryDir, async () => {
        const conflict = checkOptimisticRevision(target.memoryDir, args.expected_revision);
        if (conflict) return conflict;
        return setPolicy(target.memoryDir, args.handoff_gate, owner);
      });
      return { memory_dir: target.memoryDir, ...out };
    }
    return { memory_dir: target.memoryDir, policy: readPolicy(target.memoryDir) };
  }

  if (name === 'bridge_memory_selftest') {
    return await selftest();
  }

  throw new Error(`UNKNOWN_MEMORY_TOOL: ${name}`);
}

// ---- 隔离临时目录完整自检（32 项基线断言 + step03 混合检索/有效期取代/自动待确认/consolidate/工作区范围/brief 分节顺序；不访问网络） ----

export async function selftest(customTmpRoot) {
  const base = customTmpRoot || fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-mem-selftest-'));
  const assertions = [];
  const check = (name, cond, detail = '') => {
    assertions.push({ name, passed: Boolean(cond), ...(detail ? { detail } : {}) });
    if (!cond) throw new Error(`SELFTEST_FAILED [${name}]${detail ? ': ' + detail : ''}`);
  };

  try {
    const projRoot = path.join(base, 'proj-alpha');
    const scratchRoot = path.join(base, 'scratch-box');
    fs.mkdirSync(projRoot, { recursive: true });

    // 1-4. 严格目录隔离校验
    const projMem = getMemoryDir(projRoot, scratchRoot);
    const scratchMem = getMemoryDir('scratch', scratchRoot);
    check('dir_strict_opencode_project', path.basename(projMem) === '.opencode-project', projMem);
    check('dir_scratch_isolation', path.resolve(scratchMem) === path.resolve(scratchRoot), scratchMem);
    let driveTypoRejected = false;
    try { validateTargetPath('D:RelativeTypoDir'); } catch { driveTypoRejected = true; }
    check('reject_relative_drive_typo', driveTypoRejected);
    let codexRejected = false;
    try { validateTargetPath(path.join(projRoot, '.codex-project')); } catch { codexRejected = true; }
    check('reject_codex_project_path', codexRejected);

    // 5. 初始化健康分 100
    ensureMemoryDir(projMem);
    const initCheck = checkMemory(projMem);
    check('init_clean_score_100', initCheck.score === 100 && initCheck.ok, `score=${initCheck.score}`);

    // 6-7. 中文二元分词 + 18 组中英同义词召回
    appendDecision(projMem, '认证方案选型', '采用 JWT 双令牌机制处理用户鉴权与会话续期', 'bridge:mcp:model-1', 'arch');
    appendNote(projMem, '排查发现 Redis 缓存在高并发下会出现连接池慢查询', 'bridge:mcp:model-2', 'perf');
    appendNote(projMem, '旧版临时调试口令说明（即将废弃）', 'tester');
    appendRequirement(projMem, '实现跨会话增量记忆同步与断层恢复', '待办', 'tester');

    const synRecall1 = recall(projMem, 'login token 为什么这样设计', 5, 800);
    check('synonym_recall_login_to_auth', synRecall1.count >= 1 && synRecall1.text.includes('JWT'), synRecall1.text);
    const synRecall2 = recall(projMem, 'cache 性能卡顿', 5, 800);
    check('synonym_recall_cache_perf', synRecall2.count >= 1 && synRecall2.text.includes('Redis'), synRecall2.text);

    // 8-9. forget 作废标记 + 备份留存 + 召回自动排除
    const fg = forget(projMem, '旧版临时调试口令', 'tester');
    check('forget_marks_and_backs_up', fg.count === 1 && fg.backup && fs.existsSync(fg.backup));
    const afterForget = recall(projMem, '旧版临时调试口令', 5, 800);
    check('forget_excluded_from_recall', !afterForget.items.some(i => i.text.includes('旧版临时调试口令')));

    // 10-12. policy=block 门禁拦截与正式 handoff 交接包 + 损坏自动回退
    setPolicy(projMem, 'block', 'tester');
    writeAtomic(path.join(projMem, 'HANDOFF.md'), '# 损坏交接单\n');
    let blocked = false;
    try { handoffMemory(projMem, {}, 'tester'); } catch { blocked = true; }
    check('policy_block_gate_enforced', blocked);

    const ho = handoffMemory(projMem, {
      stage: '核心引擎开发完成',
      done: ['完成倒排索引与同义词召回', '完成机械安全归档'],
      todo: ['集成至扩展宿主与独立 MCP 服务端'],
      next: ['运行完整构建与验包脚本'],
      risk: ['注意便携版文件锁'],
      files: ['recovered/shared/project-memory.mjs']
    }, 'tester');
    check('handoff_creates_package_and_good_snapshot', ho.handoff_good && fs.existsSync(ho.package_path));

    writeAtomic(path.join(projMem, 'HANDOFF.md'), '# 空交接单\n');
    const fallbackBrief = brief(projMem, 230);
    check('brief_fallback_to_handoff_good', fallbackBrief.includes('自动回退上次有效交接快照') && fallbackBrief.includes('运行完整构建与验包脚本'));
    handoffMemory(projMem, { summary: '恢复正式交接单', next: ['执行下一步集成测试'] }, 'tester');

    // 13. 断层补充检测
    const oldTime = new Date(Date.now() - 45 * 60 * 1000);
    fs.utimesSync(path.join(projMem, 'HANDOFF.md'), oldTime, oldTime);
    for (let i = 1; i <= 4; i += 1) appendLog(projMem, `交接后新增进展记录 #${i}`, 'tester');
    const gapBrief = brief(projMem, 230);
    check('stale_handoff_gap_supplement', gapBrief.includes('断层补充') && gapBrief.includes('交接后新增进展记录 #4'));

    // 14-15. 会话增量追踪器（独立 callerId 互不串台 + 识别其他协作模型 peer_updates）
    const tracker = new SessionMemoryTracker();
    const s1First = tracker.resolveInjection('bridge:mcp:sessA', 'ws_alpha', projMem);
    const s1Second = tracker.resolveInjection('bridge:mcp:sessA', 'ws_alpha', projMem);
    const s2First = tracker.resolveInjection('bridge:mcp:sessB', 'ws_alpha', projMem);
    check('tracker_per_session_isolation', s1First.action === 'full_brief' && s1Second.action === 'none' && s2First.action === 'full_brief');
    appendNote(projMem, '队友模型 B 新增的接口幂等约束', 'bridge:mcp:sessB');
    const s1Delta = tracker.resolveInjection('bridge:mcp:sessA', 'ws_alpha', projMem);
    check('tracker_delta_peer_aware', s1Delta.action === 'delta' && s1Delta.peer_updates >= 1 && s1Delta.text.includes('协作模型新增'));

    // 16. 临时记忆 -> 项目记忆幂等转正
    const scratchBucket0 = resolveScratchBucketDir(scratchRoot, { owner: 'bridge:mcp:init' });
    appendRequirement(scratchBucket0.dir, '临时会话沉淀的新需求：支持离线记忆包导出', '待办', 'bridge:mcp:init');
    appendNote(scratchBucket0.dir, '临时会话发现的路径规范注意点', 'bridge:mcp:init');
    const prom1 = promoteMemory(scratchBucket0.dir, projMem, {}, 'tester');
    const prom2 = promoteMemory(scratchBucket0.dir, projMem, {}, 'tester');
    check('promote_idempotent_scratch_to_project', prom1.total === 2 && prom2.total === 0);

    // 17-19. 4,000 条大规模增长压力测试
    const bulkProj = getMemoryDir(path.join(base, 'proj-bulk'), scratchRoot);
    ensureMemoryDir(bulkProj);
    appendRequirement(bulkProj, '关键未完成核心待办 MUST_KEEP_ACTIVE_TODO_01', '待办', 'stress');
    appendRequirement(bulkProj, '关键进行中核心任务 MUST_KEEP_IN_PROGRESS_02', '进行中', 'stress');
    const bulkWl = [];
    for (let i = 1; i <= 3800; i += 1) bulkWl.push(`- [2026-10-20 10:00] 历史流水批量压测日志条目 #${i}`);
    fs.appendFileSync(path.join(bulkProj, 'WORKLOG.md'), bulkWl.join('\n') + '\n', 'utf8');
    const bulkReqs = [];
    for (let i = 1; i <= 260; i += 1) bulkReqs.push(`- [已完成] [2026-09-01 09:00] 已完成历史需求条目 #${i}`);
    fs.appendFileSync(path.join(bulkProj, 'REQUIREMENTS.md'), bulkReqs.join('\n') + '\n', 'utf8');
    const bulkCapped = autocap(bulkProj);
    const keptReqs = readUtf8Safe(path.join(bulkProj, 'REQUIREMENTS.md'));
    const keptWlCount = splitLines(readUtf8Safe(path.join(bulkProj, 'WORKLOG.md'))).filter(l => l.startsWith('- ')).length;
    const bulkBriefLines = splitLines(brief(bulkProj, 230)).length;
    check('stress_4000_worklog_capped_at_200', bulkCapped.worklog === 3600 && keptWlCount === 200, `kept=${keptWlCount}`);
    check('stress_active_todos_never_archived', keptReqs.includes('MUST_KEEP_ACTIVE_TODO_01') && keptReqs.includes('MUST_KEEP_IN_PROGRESS_02'));
    check('stress_brief_strictly_le_230_lines', bulkBriefLines <= 230, `briefLines=${bulkBriefLines}`);

    // 20. 多模型并发修改互斥锁压测（12 个模型同时并发写同一项目目录，0 丢行、revision 精确递增）
    const collabRoot = path.join(base, 'proj-collab');
    fs.mkdirSync(collabRoot, { recursive: true });
    const collabMem = getMemoryDir(collabRoot, scratchRoot);
    ensureMemoryDir(collabMem);
    const revBefore = readState(collabMem).revision;
    await Promise.all(
      Array.from({ length: 12 }, (_, idx) =>
        executeMemoryTool(
          'bridge_memory_append',
          { kind: 'note', text: `CONCURRENT_MODEL_WRITE_${idx + 1}`, slot: `model-${idx + 1}` },
          { owner: `bridge:mcp:concurrent-${idx + 1}`, workspaceRoots: [collabRoot], scratchDirectory: scratchRoot }
        )
      )
    );
    const revAfter = readState(collabMem).revision;
    const collabNotes = readUtf8Safe(path.join(collabMem, 'NOTES.md'));
    const all12Present = Array.from({ length: 12 }, (_, idx) => collabNotes.includes(`CONCURRENT_MODEL_WRITE_${idx + 1}`)).every(Boolean);
    check('concurrent_12_models_zero_lost_writes', revAfter === revBefore + 12 && all12Present, `rev=${revBefore}->${revAfter}`);

    // 21. 乐观并发版本检查（expected_revision 冲突拦截并返回队友增量）
    const conflictRes = await executeMemoryTool(
      'bridge_memory_append',
      { kind: 'note', text: 'SHOULD_NOT_WRITE', expected_revision: revBefore + 2 },
      { owner: 'bridge:mcp:stale-model', workspaceRoots: [collabRoot], scratchDirectory: scratchRoot }
    );
    check(
      'optimistic_cas_conflict_detection',
      conflictRes.ok === false &&
        conflictRes.error_code === 'MEMORY_REVISION_CONFLICT' &&
        conflictRes.conflict_delta.length === 10 &&
        !readUtf8Safe(path.join(collabMem, 'NOTES.md')).includes('SHOULD_NOT_WRITE')
    );

    // 22-23. 多模型并行交接槽位防覆盖 + consolidate 主控归并
    await executeMemoryTool(
      'bridge_memory_handoff',
      {
        slot: 'frontend-claude',
        stage: '前端表格重构已完成',
        done: ['虚拟滚动组件'],
        todo: ['对接后端分页游标'],
        next: ['联调前端游标参数']
      },
      { owner: 'bridge:mcp:fe-agent', workspaceRoots: [collabRoot], scratchDirectory: scratchRoot }
    );
    const backendHo = await executeMemoryTool(
      'bridge_memory_handoff',
      {
        slot: 'backend-gpt',
        stage: '后端游标接口已上线',
        done: ['新增 cursor 查询字段'],
        todo: ['补充压测指标'],
        next: ['验证分页延迟']
      },
      { owner: 'bridge:mcp:be-agent', workspaceRoots: [collabRoot], scratchDirectory: scratchRoot }
    );
    const mergedHandoffMd = readUtf8Safe(path.join(collabMem, 'HANDOFF.md'));
    check(
      'multi_model_parallel_handoff_no_clobber',
      backendHo.active_sibling_slots === 1 &&
        mergedHandoffMd.includes('后端游标接口已上线') &&
        mergedHandoffMd.includes('[@frontend-claude]') &&
        mergedHandoffMd.includes('对接后端分页游标')
    );
    await executeMemoryTool(
      'bridge_memory_handoff',
      {
        slot: 'lead-merger',
        handoff_mode: 'consolidate',
        stage: '前后端分页联调全部合并完成',
        done: ['前端虚拟滚动 + 后端游标接口联调通过'],
        todo: ['无'],
        next: ['进入回归验收']
      },
      { owner: 'bridge:mcp:lead-agent', workspaceRoots: [collabRoot], scratchDirectory: scratchRoot }
    );
    const consolidatedMd = readUtf8Safe(path.join(collabMem, 'HANDOFF.md'));
    check('multi_model_handoff_consolidate', !consolidatedMd.includes('并行模型协作槽位') && consolidatedMd.includes('前后端分页联调全部合并完成'));

    // 24-26. 临时模式多模型会话严格物理隔离 + 目录索引 + 跨桶按需取用 + 共享主题桶协同
    const isoScratch = path.join(base, 'scratch-multi');
    const alphaCtx = { owner: 'bridge:mcp:alpha-session-1111', scratchDirectory: isoScratch };
    const betaCtx = { owner: 'bridge:mcp:beta-session-2222', scratchDirectory: isoScratch };

    await executeMemoryTool('bridge_memory_append', { workspace_id: 'scratch', kind: 'note', text: 'ALPHA_PRIVATE_SECRET_9921 爬虫反爬令牌策略' }, alphaCtx);
    await executeMemoryTool('bridge_memory_append', { workspace_id: 'scratch', kind: 'note', text: 'BETA_PRIVATE_TASK_8842 显卡功耗对比记录' }, betaCtx);

    const betaBrief = await executeMemoryTool('bridge_memory_brief', { workspace_id: 'scratch' }, betaCtx);
    const betaLocalRecall = await executeMemoryTool('bridge_memory_recall', { workspace_id: 'scratch', text: 'ALPHA_PRIVATE_SECRET_9921' }, betaCtx);
    check(
      'scratch_multi_session_strict_isolation',
      !betaBrief.brief.includes('ALPHA_PRIVATE_SECRET_9921') &&
        betaBrief.brief.includes(alphaCtx.owner.slice('bridge:mcp:'.length, 'bridge:mcp:'.length + 12)) &&
        betaLocalRecall.count === 0 &&
        betaBrief.lines <= 230
    );

    const crossRecall = await executeMemoryTool('bridge_memory_recall', { workspace_id: 'scratch', cross_scratch: true, text: '爬虫反爬令牌策略' }, betaCtx);
    check(
      'scratch_on_demand_cross_recall_and_catalog',
      crossRecall.count >= 1 &&
        crossRecall.text.includes('ALPHA_PRIVATE_SECRET_9921') &&
        crossRecall.items[0].scratch_id.includes('alpha')
    );

    await executeMemoryTool('bridge_memory_append', { workspace_id: 'scratch', topic: 'joint-spike', kind: 'decide', title: '联合方案', text: 'SHARED_TOPIC_CONSENSUS_771' }, alphaCtx);
    const betaTopicBrief = await executeMemoryTool('bridge_memory_brief', { workspace_id: 'scratch', topic: 'joint-spike' }, betaCtx);
    const betaTopicRecall = await executeMemoryTool('bridge_memory_recall', { workspace_id: 'scratch', topic: 'joint-spike', text: 'SHARED_TOPIC_CONSENSUS_771' }, betaCtx);
    check(
      'scratch_shared_topic_multi_model_collab',
      betaTopicRecall.count >= 1 && betaTopicRecall.text.includes('SHARED_TOPIC_CONSENSUS_771') && betaTopicBrief.scratch_id.startsWith('topic-')
    );

    // recovered.32: auto slot separation, policy inheritance, cross-session workspace handoff index
    {
      const taskDir = path.join(base, 'sess-x', 'actors', 'a1', 'tasks', 't1');
      ensureMemoryDir(taskDir);
      handoffMemory(taskDir, { stage: 'S', done: ['d'], next: ['在 a.txt 末尾追加一行 OK 并提交'], workspace_root: 'E:\\ws\\Demo' }, 'bridge:mcp:sess-x');
      handoffMemory(taskDir, { stage: '最近任务已完成：x', done: ['x'], next: ['核查并衔接已完成任务「x」的后续需求'], auto: true, force: true }, 'bridge:mcp:sess-x');
      const manual = readLatestManualSlot(taskDir);
      check('auto_archive_keeps_manual_slot_file', manual && manual.kind === 'manual' && manual.next.some(n => n.includes('a.txt')));

      setPolicy(path.join(base, 'sess-x'), 'block', 'tester');
      const eff = readPolicy(taskDir);
      let inheritedBlock = false;
      try { handoffMemory(path.join(base, 'sess-x', 'actors', 'a1', 'tasks', 't2'), { stage: '门禁测试' }, 'bridge:mcp:sess-x'); } catch (e) { inheritedBlock = /HANDOFF_GATE_BLOCKED/.test(e.message); }
      check('policy_inherited_by_task_dirs', eff.handoff_gate === 'block' && eff.inherited === true && inheritedBlock, JSON.stringify(eff));

      const wsScratch = path.join(base, 'ws-scratch');
      const ctxA = { owner: 'bridge:mcp:session-aaaa', scratchDirectory: wsScratch };
      const ctxB = { owner: 'bridge:mcp:session-bbbb', scratchDirectory: wsScratch };
      await executeMemoryTool('bridge_memory_handoff', { workspace_id: 'scratch', stage: '演示', done: ['建 a.txt'], next: ['WS_INDEX_NEXT_STEP_515 在 a.txt 追加 OK'], workspace_root: 'E:\\AI\\Demo-WS\\' }, ctxA);
      const bBrief = await executeMemoryTool('bridge_memory_brief', { workspace_id: 'scratch', workspace_root: '/e/ai/demo-ws' }, ctxB);
      check('cross_session_workspace_handoff_visible', bBrief.brief.includes('WS_INDEX_NEXT_STEP_515') && bBrief.workspace_handoffs >= 1, bBrief.brief.slice(0, 300));
    }

    // step02: pinned set, BM25 index schema, verification / overlap annotations
    {
      const pinDir = path.join(base, 'step02-pin');
      ensureMemoryDir(pinDir);
      appendPin(pinDir, 'PIN_HARD_CONSTRAINT_404 不配远端、不 push', 'tester');
      const pinBrief = brief(pinDir);
      unpin(pinDir, 'PIN_HARD_CONSTRAINT_404', 'tester');
      check('pinned_set_in_brief_and_unpin', pinBrief.includes('PIN_HARD_CONSTRAINT_404') && pinBrief.indexOf('PIN_HARD_CONSTRAINT_404') < pinBrief.indexOf('===== AGENTS.md') && !brief(pinDir).includes('PIN_HARD_CONSTRAINT_404'));

      appendNote(pinDir, 'BM25_SHORT_TARGET 缓存签名', 'tester');
      const idx = buildIndex(pinDir);
      check('bm25_index_schema_with_lengths', idx.schema === INDEX_SCHEMA && idx.avgLen > 0 && idx.meta.every(m => Number.isInteger(m[3])));

      const ovDir = path.join(base, 'step02-overlap');
      ensureMemoryDir(ovDir);
      handoffMemory(ovDir, { stage: 'A', done: ['改 a'], next: ['继续 a.mjs 的边界处理'], files: ['src/a.mjs'] }, 'bridge:mcp:model-a');
      const ov = handoffMemory(ovDir, { stage: 'B', done: ['改 a'], next: ['继续 a.mjs 的并发处理'], files: ['src\\a.mjs'] }, 'bridge:mcp:model-b');
      const ovText = readUtf8Safe(path.join(ovDir, 'HANDOFF.md'));
      check('handoff_flags_overlap_and_unverified', ov.warnings.some(w => w.includes('并行冲突提示')) && ovText.includes('并行冲突提示') && ovText.includes('未附验证证据'), ovText.slice(0, 400));
    }

    // step03: trigram, hybrid fallback / injected-embedder RRF, vector cache, validity + supersede,
    // consolidate dry-run/apply, auto candidates + confirm, workspace scope, brief section order.
    {
      const hy = path.join(base, 'step03-hybrid');
      ensureMemoryDir(hy);
      check('cjk_trigram_tokens', tokenizeForIndex('记忆整合器').includes('记忆整') && !tokenize('记忆整合器').includes('记忆整'));
      appendNote(hy, 'HYBRID_CANARY_A 向量检索采用余弦相似度并与词法结果做倒数排名融合', 'tester');
      appendNote(hy, 'HYBRID_CANARY_B 前端按钮颜色改为深灰', 'tester');
      writeAtomic(path.join(hy, 'embed.json'), JSON.stringify({ enabled: false, apiKey: 'should-be-ignored' }));
      const cfgOff = resolveEmbedConfig(hy);
      const lex = await searchMemoryHybrid(hy, '余弦相似度', 5);
      check('hybrid_falls_back_to_lexical_when_disabled', cfgOff.enabled === false && cfgOff.warnings.some(w => w.includes('apiKey')) &&
        lex.mode === 'lexical' && lex.items.some(i => i.text.includes('HYBRID_CANARY_A')), JSON.stringify(lex).slice(0, 300));
      const fakeEmbedder = async inputs => inputs.map(t => {
        const v = new Array(16).fill(0);
        for (const ch of String(t)) v[(ch.codePointAt(0) || 0) % 16] += 1;
        return v;
      });
      const hyRes = await searchMemoryHybrid(hy, '倒数排名融合', 5, { embedder: fakeEmbedder });
      check('hybrid_rrf_with_injected_embedder', hyRes.mode === 'hybrid' && hyRes.items.length >= 1 && hyRes.items.every(i => typeof i.rrf === 'number') &&
        fs.existsSync(path.join(hy, VEC_CACHE_FILE)), JSON.stringify(hyRes).slice(0, 300));
      const hyRes2 = await searchMemoryHybrid(hy, '倒数排名融合', 5, { embedder: fakeEmbedder });
      check('hybrid_vector_cache_incremental', hyRes2.mode === 'hybrid' && hyRes2.embedded_now === 0);
      const failing = await searchMemoryHybrid(hy, '余弦相似度', 5, { embedder: async () => { throw new Error('EMBED_TIMEOUT'); } });
      check('hybrid_failure_falls_back_with_status', failing.mode === 'lexical' && /fallback/.test(failing.embed_status || '') && failing.count >= 1);

      const vd = path.join(base, 'step03-validity');
      ensureMemoryDir(vd);
      appendNote(vd, 'EXPIRED_NOTE_CANARY 临时开放调试端口', 'tester', '', { validUntil: '2020-01-01' });
      appendNote(vd, 'LIVE_RANGE_CANARY 长期有效约定', 'tester', '', { validFrom: '2020-01-01', validUntil: '2999-12-31' });
      const vBrief = brief(vd);
      check('expired_entries_skipped_by_default', !vBrief.includes('EXPIRED_NOTE_CANARY') && vBrief.includes('LIVE_RANGE_CANARY') &&
        searchMemory(vd, 'EXPIRED_NOTE_CANARY').count === 0 && searchMemory(vd, 'EXPIRED_NOTE_CANARY', 5, { includeInactive: true }).count === 1);
      appendNote(vd, '数据库选型：使用 SQLite 单文件', 'tester');
      appendNote(vd, '数据库选型：改用 Postgres 集群', 'tester');
      appendNote(vd, 'DUP_CANARY 重复条目内容一二三四五', 'tester');
      fs.appendFileSync(path.join(vd, 'NOTES.md'), '- [2026-01-01 10:00] (@x) DUP_CANARY 重复条目内容一二三四五\n', 'utf8');
      appendNote(vd, 'NEARDUP 记忆整合需要合并近似重复条目并且保留最新的版本记录', 'tester');
      appendNote(vd, 'NEARDUP 记忆整合需要合并近似重复条目并且保留最新版本记录', 'tester');
      const dry = consolidateMemory(vd, {}, 'tester');
      check('consolidate_dry_run_previews_only', dry.dry_run === true && dry.applied === false && dry.summary.exact >= 1 && dry.summary.near >= 1 &&
        dry.summary.superseded >= 1 && readUtf8Safe(path.join(vd, 'NOTES.md')).split('DUP_CANARY').length === 3, JSON.stringify(dry.summary));
      const applied = consolidateMemory(vd, { apply: true }, 'tester');
      const notesAfter = readUtf8Safe(path.join(vd, 'NOTES.md'));
      check('consolidate_apply_merges_supersedes_and_backs_up', applied.applied === true && fs.existsSync(path.join(applied.backup_dir, 'NOTES.md')) &&
        notesAfter.split('DUP_CANARY').length === 2 && notesAfter.split('NEARDUP').length === 2 && /\[已被取代→#[0-9a-f]{8}/.test(notesAfter) &&
        !brief(vd).includes('使用 SQLite 单文件') && !searchMemory(vd, 'SQLite 单文件').items.some(i => i.text.includes('使用 SQLite 单文件')));

      const ad = path.join(base, 'step03-auto');
      ensureMemoryDir(ad);
      appendRequirement(ad, '实现记忆整合工具 consolidate', '待办', 'tester');
      const hoFields = {
        stage: '记忆优化',
        done: ['实现记忆整合工具 consolidate'],
        next: ['补充 consolidate 的 dry-run 预览说明'],
        constraints: ['禁止自动 git commit，由协调者决定'],
        summary: '决定采用倒数排名融合合并词法与向量结果'
      };
      const hoAuto = handoffMemory(ad, hoFields, 'bridge:mcp:auto-test');
      const notesC = readUtf8Safe(path.join(ad, 'NOTES.md'));
      check('handoff_extracts_pending_candidates', hoAuto.auto_candidates >= 3 && notesC.includes(AUTO_PENDING_TAG) && notesC.includes('需求状态：') &&
        brief(ad).includes('待确认'), JSON.stringify(hoAuto.auto_candidate_items || []));
      const hoAgain = handoffMemory(ad, hoFields, 'bridge:mcp:auto-test');
      check('auto_candidates_deduped', hoAgain.auto_candidates === 0);
      const conf = confirmAutoEntries(ad, '需求状态', 'tester');
      check('confirm_applies_requirement_status', conf.confirmed >= 1 && readUtf8Safe(path.join(ad, 'REQUIREMENTS.md')).includes('[已完成]'));
      const gd = path.join(base, 'step03-generic');
      ensureMemoryDir(gd);
      const generic = handoffMemory(gd, { stage: '最近任务已完成：x', done: ['x'], next: ['核查并衔接已完成任务「x」的后续需求'], auto: true, force: true }, 'bridge:mcp:auto-test');
      check('auto_candidates_skip_boilerplate', generic.auto_candidates === 0);

      const wsRoot = path.join(base, 'ws-scope');
      fs.mkdirSync(wsRoot, { recursive: true });
      const projDir = getMemoryDir(wsRoot);
      ensureMemoryDir(projDir);
      const taskA = path.join(projDir, 'actors', 'aaaa', 'tasks', 'ta');
      ensureMemoryDir(taskA);
      appendNote(taskA, 'WS_SCOPE_CANARY_313 上一棒的结论', 'bridge:mcp:a');
      handoffMemory(taskA, { stage: 'A', done: ['x'], next: ['WS_VIEW_NEXT_626 继续处理 b.mjs'], workspace_root: wsRoot }, 'bridge:mcp:a');
      const taskB = path.join(projDir, 'actors', 'bbbb', 'tasks', 'tb');
      ensureMemoryDir(taskB);
      const ctxWs = { owner: 'bridge:mcp:b', currentWorkspaceRoot: () => wsRoot, scratchDirectory: path.join(base, 'ws-scope-scratch') };
      const wsRecall = await executeMemoryTool('bridge_memory_recall', { memory_dir: taskB, text: 'WS_SCOPE_CANARY_313' }, ctxWs);
      const taskRecall = await executeMemoryTool('bridge_memory_recall', { memory_dir: taskB, text: 'WS_SCOPE_CANARY_313', scope: 'task' }, ctxWs);
      const wsBrief = await executeMemoryTool('bridge_memory_brief', { memory_dir: taskB }, ctxWs);
      check('workspace_scope_merges_sibling_actors_readonly', wsRecall.scope === 'workspace' && wsRecall.count >= 1 && Boolean(wsRecall.items[0]?.source) &&
        taskRecall.count === 0 && wsBrief.brief.includes('WS_VIEW_NEXT_626') && !readUtf8Safe(path.join(taskB, 'NOTES.md')).includes('WS_SCOPE_CANARY_313'),
        JSON.stringify({ scope: wsRecall.scope, count: wsRecall.count, task: taskRecall.count }));

      const od = path.join(base, 'step03-order');
      ensureMemoryDir(od);
      appendPin(od, 'ORDER_PIN_1 固定约束', 'tester');
      appendNote(od, 'ORDER_NOTE_1 普通随手记', 'tester');
      appendRequirement(od, 'ORDER_REQ_1 活跃需求', '待办', 'tester');
      handoffMemory(od, { stage: 'S', done: ['d'], next: ['ORDER_NEXT_1 在 c.mjs 继续'], extract_facts: false }, 'tester');
      const ob = brief(od);
      const pos = k => ob.indexOf(k);
      check('brief_section_order_pinned_handoff_reqs_notes', pos('ORDER_PIN_1') >= 0 && pos('ORDER_PIN_1') < pos('ORDER_NEXT_1') &&
        pos('ORDER_NEXT_1') < pos('ORDER_REQ_1') && pos('ORDER_REQ_1') < pos('ORDER_NOTE_1') &&
        splitLines(ob).filter(l => l.includes('现在看到的')).length === 1 && splitLines(ob).length <= 230, ob.slice(0, 400));
    }

    return { ok: true, engine: MEMORY_ENGINE_VERSION, count: assertions.length, assertions };
  } finally {
    if (!customTmpRoot) {
      try { fs.rmSync(base, { recursive: true, force: true }); } catch {}
    }
  }
}
