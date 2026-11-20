// codebase-index-step01: 像 Cursor 的代码库检索一样，给 AI 一个「按意思找代码」的入口，而不是只能逐个 grep。
// 做法：首次检索时把工作区（git 仓库按 git ls-files，遵守 .gitignore）切成带重叠的代码块，
// 标识符按驼峰 / 下划线拆词、中文按双字切分，用 BM25 排序；定义行（function/class/def 等）与文件名命中加权。
// 索引只在内存里；之后每次检索只重新切分 mtime 变化过的文件，所以 AI 刚改过的代码也能立刻搜到。
// 不调用任何模型、不联网；这是关键词 + 结构检索，不是向量语义检索。
import fs from "node:fs";
import path from "node:path";
import { execFile } from "node:child_process";

export const CODEBASE_SEARCH_TOOL = {
  name: "codebase_search",
  title: "代码库检索",
  description: "在当前工作区的代码库索引里按描述找代码（类似 Cursor 的 codebase search）：query 用自然语言或标识符都行，例如“任务卡在哪里渲染”“handleToolCall”“shadow checkpoint restore”。"
    + "返回最相关的代码块：文件路径、行号范围、得分和片段；需要完整内容时再用 read_files 读取。"
    + "索引遵守 .gitignore，自动跳过 node_modules / 构建产物 / 二进制和超大文件，并随文件修改自动增量更新。"
    + "比逐个 grep 更适合“不知道在哪个文件”的问题；已知确切字符串时 grep 更精确。",
  inputSchema: {
    type: "object",
    required: ["query"],
    properties: {
      query: { type: "string", minLength: 1, maxLength: 500, description: "要找的东西：自然语言描述、标识符或关键词。" },
      limit: { type: "integer", minimum: 1, maximum: 30, default: 10, description: "最多返回多少个代码块。" },
      path: { type: "string", maxLength: 300, description: "只在这个相对目录或文件路径前缀下检索，例如 src/ 或 extensions/opencode。" },
      ext: { type: "array", items: { type: "string", maxLength: 12 }, maxItems: 20, description: "只看这些扩展名，例如 [\"ts\", \"mjs\"]。" }
    },
    additionalProperties: false
  },
  annotations: { title: "代码库检索", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
};

const CHUNK_LINES = 60;
const CHUNK_OVERLAP = 15;
const MAX_FILE_BYTES = 400 * 1024;
const MAX_FILES = 25000;
const SKIP_DIRS = /(?:^|\/)(?:node_modules|\.git|\.hg|\.svn|dist|out|build|\.next|\.nuxt|coverage|target|bin|obj|vendor|__pycache__|\.venv|venv|\.opencode|\.update-backup|\.update-stage)(?:\/|$)/i;
const TEXT_EXT = /\.(?:[cm]?[jt]sx?|json|md|mdx|txt|py|rb|go|rs|java|kt|kts|swift|c|cc|cpp|cxx|h|hh|hpp|cs|fs|php|lua|sh|bash|zsh|ps1|psm1|bat|cmd|sql|graphql|gql|proto|ya?ml|toml|ini|cfg|conf|xml|html?|vue|svelte|astro|css|scss|sass|less|dart|scala|clj|ex|exs|erl|hs|ml|r|jl|zig|nim|gradle|cmake|make|mk|dockerfile|tf|hcl|gd|glsl|hlsl|shader|wgsl)$/i;
const NAME_FILES = /(?:^|\/)(?:Makefile|Dockerfile|CMakeLists\.txt|README[^/]*|AGENTS\.md|package\.json)$/i;
const DEF_LINE = /^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?(?:function\*?|class|interface|type|enum|struct|trait|impl|def|fn|func|module|namespace|const|let|var|public|private|protected|static)\b/;
const STOP = new Set(["the", "a", "an", "of", "to", "in", "is", "and", "or", "for", "on", "with", "where", "what", "how", "which", "this", "that", "be", "it", "as", "by", "from", "at", "are", "do", "does", "code", "file", "function", "在", "的", "了", "是", "哪", "里", "哪里", "怎么", "什么", "代码"]);

/** Tokens for indexing and queries: identifier parts (camelCase / snake_case split), whole identifiers, CJK bigrams. */
export function tokenize(text) {
  const out = [];
  const src = String(text);
  for (const m of src.matchAll(/[A-Za-z_$][A-Za-z0-9_$]*|[0-9]+/g)) {
    const word = m[0];
    const lower = word.toLowerCase();
    if (lower.length > 1 && lower.length < 60) out.push(lower);
    const parts = word.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2").split(/[\s_$]+/);
    if (parts.length > 1) for (const p of parts) { const q = p.toLowerCase(); if (q.length > 1 && q !== lower) out.push(q); }
  }
  for (const m of src.matchAll(/[\u3400-\u9fff]+/g)) {
    const s = m[0];
    if (s.length === 1) out.push(s);
    for (let i = 0; i + 1 < s.length; i++) out.push(s.slice(i, i + 2));
  }
  return out;
}

function runGit(cwd, args) {
  return new Promise((resolve) => {
    execFile("git", args, { cwd, maxBuffer: 64 * 1024 * 1024, timeout: 30e3, windowsHide: true }, (error, stdout) => resolve(error ? null : String(stdout)));
  });
}

async function listFiles(root) {
  const viaGit = await runGit(root, ["ls-files", "-z", "--cached", "--others", "--exclude-standard"]);
  let rels;
  if (viaGit !== null) rels = viaGit.split("\0").filter(Boolean);
  else {
    rels = [];
    const walk = (dir, rel) => {
      if (rels.length > MAX_FILES * 2) return;
      let ents = [];
      try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
      for (const e of ents) {
        const r = rel ? `${rel}/${e.name}` : e.name;
        if (e.isDirectory()) { if (!SKIP_DIRS.test(r + "/")) walk(path.join(dir, e.name), r); }
        else if (e.isFile()) rels.push(r);
      }
    };
    walk(root, "");
  }
  return rels.map((r) => r.replace(/\\/g, "/")).filter((r) => !SKIP_DIRS.test(r) && (TEXT_EXT.test(r) || NAME_FILES.test(r)) && !/\.min\.(?:js|css)$|\.map$|(?:^|\/)(?:package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$/i.test(r));
}

export class CodebaseIndex {
  constructor(options = {}) {
    this.log = options.log || (() => {});
    this.roots = new Map(); // root -> { files: Map(rel -> {mtime,size,chunks:[{start,end,tf:Map,len,defs:Set}]}), df: Map, n, totalLen, listedAt, truncated }
    this.building = new Map();
  }
  async ensure(root) {
    const pending = this.building.get(root);
    if (pending) return pending;
    const job = this.refresh(root).finally(() => this.building.delete(root));
    this.building.set(root, job);
    return job;
  }
  async refresh(root) {
    let idx = this.roots.get(root);
    if (!idx) { idx = { files: new Map(), df: new Map(), n: 0, totalLen: 0, listedAt: 0, rels: [], truncated: false }; this.roots.set(root, idx); }
    const now = Date.now();
    if (now - idx.listedAt > 30e3) {
      let rels = await listFiles(root);
      idx.truncated = rels.length > MAX_FILES;
      if (idx.truncated) rels = rels.slice(0, MAX_FILES);
      idx.rels = rels;
      idx.listedAt = now;
      const keep = new Set(rels);
      for (const rel of [...idx.files.keys()]) if (!keep.has(rel)) this.removeFile(idx, rel);
    }
    let changed = 0;
    for (const rel of idx.rels) {
      const abs = path.join(root, rel);
      let st;
      try { st = fs.statSync(abs); } catch { if (idx.files.has(rel)) this.removeFile(idx, rel); continue; }
      if (!st.isFile() || st.size > MAX_FILE_BYTES) { if (idx.files.has(rel)) this.removeFile(idx, rel); continue; }
      const prev = idx.files.get(rel);
      if (prev && prev.mtime === st.mtimeMs && prev.size === st.size) continue;
      if (prev) this.removeFile(idx, rel);
      let text;
      try { const buf = fs.readFileSync(abs); if (buf.subarray(0, 8000).includes(0)) continue; text = buf.toString("utf8"); } catch { continue; }
      this.addFile(idx, rel, text, st);
      changed++;
      if (changed % 500 === 0) await new Promise((r) => setImmediate(r));
    }
    return idx;
  }
  addFile(idx, rel, text, st) {
    const lines = text.split(/\r?\n/);
    const chunks = [];
    const nameTokens = tokenize(rel);
    for (let start = 0; start < Math.max(1, lines.length); start += CHUNK_LINES - CHUNK_OVERLAP) {
      const end = Math.min(lines.length, start + CHUNK_LINES);
      const body = lines.slice(start, end);
      const tf = new Map();
      let len = 0;
      for (const t of tokenize(body.join("\n"))) { tf.set(t, (tf.get(t) || 0) + 1); len++; }
      const defs = new Set();
      for (const line of body) if (DEF_LINE.test(line)) for (const t of tokenize(line)) defs.add(t);
      for (const t of nameTokens) defs.add("\u0001" + t);
      chunks.push({ start: start + 1, end, tf, len, defs });
      for (const t of tf.keys()) idx.df.set(t, (idx.df.get(t) || 0) + 1);
      idx.n++;
      idx.totalLen += len;
      if (end >= lines.length) break;
    }
    idx.files.set(rel, { mtime: st.mtimeMs, size: st.size, chunks });
  }
  removeFile(idx, rel) {
    const f = idx.files.get(rel);
    if (!f) return;
    for (const c of f.chunks) {
      for (const t of c.tf.keys()) { const v = (idx.df.get(t) || 1) - 1; if (v > 0) idx.df.set(t, v); else idx.df.delete(t); }
      idx.n--;
      idx.totalLen -= c.len;
    }
    idx.files.delete(rel);
  }
  async search(root, input = {}) {
    const started = Date.now();
    const idx = await this.ensure(root);
    const terms = [...new Set(tokenize(input.query || "").filter((t) => !STOP.has(t)))];
    if (!terms.length) return { results: [], terms, files: idx.files.size, ms: Date.now() - started, truncated: idx.truncated };
    const prefix = typeof input.path === "string" && input.path.trim() ? input.path.trim().replace(/\\/g, "/").replace(/^\.\//, "").toLowerCase() : "";
    const exts = Array.isArray(input.ext) && input.ext.length ? new Set(input.ext.map((e) => "." + String(e).replace(/^\./, "").toLowerCase())) : null;
    const k1 = 1.2, b = 0.75;
    const avg = idx.n ? idx.totalLen / idx.n : 1;
    const idf = new Map(terms.map((t) => { const df = idx.df.get(t) || 0; return [t, Math.log(1 + (idx.n - df + 0.5) / (df + 0.5))]; }));
    const scored = [];
    for (const [rel, f] of idx.files) {
      const lowerRel = rel.toLowerCase();
      if (prefix && !lowerRel.startsWith(prefix)) continue;
      if (exts && !exts.has(path.extname(lowerRel))) continue;
      for (const c of f.chunks) {
        let score = 0, hit = 0;
        for (const t of terms) {
          const tf = c.tf.get(t) || 0;
          const nameHit = c.defs.has("\u0001" + t);
          if (!tf && !nameHit) continue;
          hit++;
          if (tf) score += idf.get(t) * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * c.len / avg));
          if (c.defs.has(t)) score += idf.get(t) * 0.8;
          if (nameHit) score += idf.get(t) * 0.6;
        }
        if (!hit) continue;
        score *= 0.5 + 0.5 * (hit / terms.length);
        scored.push({ rel, start: c.start, end: c.end, score });
      }
    }
    scored.sort((a, b2) => b2.score - a.score);
    const limit = Math.min(30, Math.max(1, Number(input.limit) || 10));
    const picked = [];
    const perFile = new Map();
    for (const s of scored) {
      if (picked.length >= limit) break;
      const n = perFile.get(s.rel) || 0;
      if (n >= 3) continue;
      if (picked.some((p) => p.rel === s.rel && s.start <= p.end && s.end >= p.start)) continue;
      perFile.set(s.rel, n + 1);
      picked.push(s);
    }
    const results = picked.map((s) => ({ ...s, score: Math.round(s.score * 100) / 100, snippet: this.snippet(root, s, terms) }));
    return { results, terms, files: idx.files.size, chunks: idx.n, ms: Date.now() - started, truncated: idx.truncated };
  }
  snippet(root, s, terms) {
    try {
      const lines = fs.readFileSync(path.join(root, s.rel), "utf8").split(/\r?\n/).slice(s.start - 1, s.end);
      let best = 0, bestScore = -1;
      for (let i = 0; i < lines.length; i++) {
        const low = lines[i].toLowerCase();
        let sc = 0;
        for (const t of terms) if (low.includes(t)) sc += DEF_LINE.test(lines[i]) ? 2 : 1;
        if (sc > bestScore) { bestScore = sc; best = i; }
      }
      const from = Math.max(0, best - 4), to = Math.min(lines.length, best + 8);
      return { from: s.start + from, to: s.start + to - 1, text: lines.slice(from, to).map((l, i) => `${s.start + from + i}: ${l.length > 220 ? l.slice(0, 220) + "…" : l}`).join("\n") };
    } catch {
      return { from: s.start, to: s.end, text: "" };
    }
  }
}

export function formatCodebaseSearch(out, root) {
  if (!out.results.length) return `代码库检索：没有找到与「${out.terms.join(" ")}」相关的代码（已索引 ${out.files} 个文件）。换个说法、用标识符，或改用 grep。`;
  const head = `代码库检索：${out.results.length} 个结果（已索引 ${out.files} 个文件 / ${out.chunks} 个代码块，用时 ${out.ms}ms${out.truncated ? "；文件过多，只索引了前 25000 个" : ""}）。需要完整内容时用 read_files 读取对应行号。`;
  const body = out.results.map((r, i) => `${i + 1}. ${r.rel}:${r.start}-${r.end}（得分 ${r.score}）\n${r.snippet.text}`).join("\n\n");
  return `${head}\n根目录：${root}\n\n${body}`;
}
