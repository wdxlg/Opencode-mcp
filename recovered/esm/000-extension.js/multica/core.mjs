// OpenCode × Multica-inspired operations layer — shared core.
// Design borrowed from multica-ai/multica (ideas only; no Multica code is copied). Self-implemented for OpenCode.
// State lives outside the repository: OPENCODE_MULTICA_HOME, else %LOCALAPPDATA%/OpenCode/shared-automation/multica,
// else ~/.opencode-multica. Every feature reads one JSON config (multica.config.json in that directory).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

export const MULTICA_VERSION = 1;

/** Defaults: passive observers on, everything that changes behaviour off. */
export const DEFAULT_CONFIG = Object.freeze({
  opsTool: true,
  taskSync: { enabled: true },
  runRecords: { enabled: true, maxBytes: 5 * 1024 * 1024, maxFiles: 5, maxField: 2000 },
  steer: { enabled: true },
  review: { enabled: false, allowToolApprove: false, worktreeRoot: null },
  squad: { enabled: false, leader: null, members: [], strategy: "tags" },
  retry: { enabled: false, defaultTimeoutMs: 0, tools: {} },
  inbox: { enabled: true, maxEntries: 500 },
  usage: { enabled: true },
  skillsLock: { enabled: true, skillRoots: [] },
  permissions: { enabled: false, defaultRole: null, roles: {}, owners: {} },
  channels: { enabled: false, webhook: { enabled: false, host: "127.0.0.1", port: 0, token: null } }
});

export function multicaHome(env = process.env) {
  if (env.OPENCODE_MULTICA_HOME) return path.resolve(env.OPENCODE_MULTICA_HOME);
  if (env.LOCALAPPDATA) return path.join(env.LOCALAPPDATA, "OpenCode", "shared-automation", "multica");
  return path.join(os.homedir(), ".opencode-multica");
}

export function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); return dir; }
export function statePath(...parts) { return path.join(multicaHome(), ...parts); }

function isPlainObject(v) { return v !== null && typeof v === "object" && !Array.isArray(v); }
export function deepMerge(base, over) {
  if (!isPlainObject(base) || !isPlainObject(over)) return over === undefined ? base : over;
  const out = { ...base };
  for (const [k, v] of Object.entries(over)) out[k] = isPlainObject(v) && isPlainObject(base[k]) ? deepMerge(base[k], v) : v;
  return out;
}

let configCache = { file: null, mtimeMs: -1, value: null };
/** Config = defaults deep-merged with <home>/multica.config.json (re-read when its mtime changes). Bad JSON → defaults. */
export function loadConfig() {
  const file = statePath("multica.config.json");
  let mtimeMs = 0;
  try { mtimeMs = fs.statSync(file).mtimeMs; } catch { mtimeMs = 0; }
  if (configCache.file === file && configCache.mtimeMs === mtimeMs && configCache.value) return configCache.value;
  let user = {};
  if (mtimeMs) { try { user = JSON.parse(fs.readFileSync(file, "utf8")); } catch { user = {}; } }
  const value = deepMerge(DEFAULT_CONFIG, isPlainObject(user) ? user : {});
  configCache = { file, mtimeMs, value };
  return value;
}
export function saveConfigPatch(patch) {
  const file = statePath("multica.config.json");
  let cur = {};
  try { cur = JSON.parse(fs.readFileSync(file, "utf8")); } catch { cur = {}; }
  writeJsonAtomic(file, deepMerge(cur, patch));
  configCache.mtimeMs = -1;
  return loadConfig();
}

export function writeJsonAtomic(file, value) {
  ensureDir(path.dirname(file));
  const tmp = `${file}.${process.pid}.${crypto.randomBytes(4).toString("hex")}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2) + "\n");
  fs.renameSync(tmp, file);
}
const corruptBackedUp = new Set();
// migration-step01: 文件存在但解析失败（写到一半、编码损坏、更新版本的格式）时先把原文留底为 *.corrupt-<时间>.bak，
// 再返回默认值；否则调用方随后写回默认值会把用户原数据整份覆盖。同一份损坏内容只留底一次。
export function readJson(file, fallback) {
  let text;
  try { text = fs.readFileSync(file, "utf8"); } catch { return fallback; }
  try { return JSON.parse(text.replace(/^\uFEFF/, "")); } catch {
    const key = file + ":" + text.length + ":" + text.slice(0, 64);
    if (text.trim() && !corruptBackedUp.has(key)) {
      corruptBackedUp.add(key);
      try { fs.writeFileSync(file + ".corrupt-" + Date.now() + ".bak", text, { flag: "wx" }); } catch {}
    }
    return fallback;
  }
}

/** Append one JSON line; rotate file → file.1 … file.N when it would exceed maxBytes. */
export function appendJsonl(file, entry, { maxBytes = 5 * 1024 * 1024, maxFiles = 5 } = {}) {
  ensureDir(path.dirname(file));
  const line = JSON.stringify(entry) + "\n";
  let size = 0;
  try { size = fs.statSync(file).size; } catch { size = 0; }
  if (size > 0 && size + Buffer.byteLength(line) > maxBytes) rotate(file, maxFiles);
  fs.appendFileSync(file, line);
}
export function rotate(file, maxFiles) {
  for (let i = maxFiles - 1; i >= 1; i--) {
    const from = i === 1 ? file : `${file}.${i - 1}`;
    if (fs.existsSync(from)) { try { fs.renameSync(from, `${file}.${i}`); } catch {} }
  }
  if (maxFiles <= 1) { try { fs.rmSync(file, { force: true }); } catch {} }
}
/** Read entries of a rotated JSONL family, oldest first. */
export function readJsonlFamily(file, maxFiles = 5) {
  const out = [];
  for (let i = maxFiles - 1; i >= 0; i--) {
    const f = i === 0 ? file : `${file}.${i}`;
    let text;
    try { text = fs.readFileSync(f, "utf8"); } catch { continue; }
    for (const l of text.split("\n")) { if (!l.trim()) continue; try { out.push(JSON.parse(l)); } catch {} }
  }
  return out;
}

const SECRET_KEY = /(pass(word)?|secret|token|cookie|authorization|api[_-]?key|private[_-]?key|credential|session[_-]?key)/i;
const SECRET_VALUE = [
  /\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]{8,}/g,
  /\b(sk|pk|rk|ghp|gho|ghu|ghs|github_pat|xox[abpr])[-_][A-Za-z0-9_-]{12,}/g,
  /([?&](?:token|key|secret|sig|signature|access_token|auth)=)[^&\s"']+/gi,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{6,}/g
];
export function redactString(s, maxField = 2000) {
  let t = String(s);
  for (const re of SECRET_VALUE) t = t.replace(re, (m, a) => (typeof a === "string" && /[?&]/.test(a) ? `${a}***` : "***REDACTED***"));
  if (t.length > maxField) t = `${t.slice(0, maxField)}…[+${t.length - maxField} chars]`;
  return t;
}
/** Deep redaction for logs: secret-looking keys are masked, strings scrubbed and truncated, depth bounded. */
export function redact(value, maxField = 2000, depth = 0) {
  if (value == null || typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "string") return redactString(value, maxField);
  if (depth > 6) return "[depth]";
  if (Array.isArray(value)) return value.slice(0, 200).map((v) => redact(v, maxField, depth + 1));
  if (typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = SECRET_KEY.test(k) ? "***" : redact(v, maxField, depth + 1);
    return out;
  }
  return String(value);
}

export function resultText(result) {
  const c = result?.content;
  if (!Array.isArray(c)) return "";
  return c.filter((x) => x?.type === "text").map((x) => x.text ?? "").join("\n");
}
export function nowIso(now = Date.now()) { return new Date(now).toISOString(); }
export function newId(prefix) { return `${prefix}_${Date.now().toString(36)}${crypto.randomBytes(3).toString("hex")}`; }
export function sha256(data) { return crypto.createHash("sha256").update(data).digest("hex"); }
export function safeName(s) { return String(s ?? "").replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 120) || "_"; }
