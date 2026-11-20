// OpenCode ai-plugins-step01: AI plugins (Claude Code plugin format) and Skill catalog.
// Used by native chat (skill tool, plugin commands) and by the "Skill" / "Plugins" windows (opencode.manageSkills / opencode.managePlugins).
// Plugin layout: <plugin>/.claude-plugin/plugin.json (or plugin.json); skills/<name>/SKILL.md, commands/*.md, agents/*.md, hooks/hooks.json, .mcp.json.
// Install location: ~/.opencode/plugins/<name>; state lives in ~/.opencode/ai-plugins.json (disabled plugins, disabled skills, install source).
import { __toESM } from "./module-0000.mjs";
import { globalSkillsDirectory } from "./module-0025.mjs";
var vscodeP = __toESM(require("vscode"));
var fsP = __toESM(require("node:fs"));
var pathP = __toESM(require("node:path"));
var osP = __toESM(require("node:os"));
var cryptoP = __toESM(require("node:crypto"));
var childP = __toESM(require("node:child_process"));

const fs = fsP.default, path = pathP.default, os = osP.default;
const PLUGIN_NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const SKILL_TOOL_NAME = "skill";
const MAX_SKILL_CHARS = 60000;
const MAX_LISTED_SKILLS = 80;

export function ocHome() { return path.join(os.homedir(), ".opencode"); }
export function pluginsDirectory() { return path.join(ocHome(), "plugins"); }
function stateFile() { return path.join(ocHome(), "ai-plugins.json"); }
function marketplaceCacheDir() { return path.join(pluginsDirectory(), ".marketplaces"); }

export function readAiPluginState() {
  let raw = {};
  try { raw = JSON.parse(fs.readFileSync(stateFile(), "utf8").replace(/^\uFEFF/, "")) ?? {}; } catch {}
  return {
    skillsEnabled: raw.skillsEnabled !== false,
    disabledSkills: Array.isArray(raw.disabledSkills) ? raw.disabledSkills.filter((x) => typeof x === "string") : [],
    disabledPlugins: Array.isArray(raw.disabledPlugins) ? raw.disabledPlugins.filter((x) => typeof x === "string") : [],
    sources: raw.sources && typeof raw.sources === "object" ? raw.sources : {},
    marketplaces: Array.isArray(raw.marketplaces) ? raw.marketplaces.filter((m) => m && typeof m.input === "string") : []
  };
}
function writeAiPluginState(state) {
  fs.mkdirSync(ocHome(), { recursive: true });
  const tmp = stateFile() + "." + process.pid + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2) + "\n", "utf8");
  fs.renameSync(tmp, stateFile());
}
function updateState(fn) { const s = readAiPluginState(); fn(s); writeAiPluginState(s); return s; }

// ---------- frontmatter ----------
export function parseSkillFrontmatter(raw) {
  const text = String(raw ?? "").replace(/^\uFEFF/, "");
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!match) return { meta: {}, body: text };
  const meta = {};
  const lines = match[1].split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const kv = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(lines[i]);
    if (!kv) continue;
    const key = kv[1].toLowerCase();
    let value = kv[2].trim();
    if (/^[>|][+-]?$/.test(value)) {
      const parts = [];
      while (i + 1 < lines.length && (/^\s+\S/.test(lines[i + 1]) || lines[i + 1].trim() === "")) parts.push(lines[++i].trim());
      value = value.startsWith(">") ? parts.join(" ").replace(/\s+/g, " ").trim() : parts.join("\n").trim();
    } else if (/^\[.*\]$/.test(value)) {
      value = value.slice(1, -1).split(",").map((x) => x.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    } else value = value.replace(/^["']|["']$/g, "");
    meta[key] = value;
  }
  return { meta, body: text.slice(match[0].length) };
}

// ---------- plugins ----------
function readJson(file) { try { return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "")); } catch { return void 0; } }
function manifestFile(dir) {
  for (const f of [path.join(dir, ".claude-plugin", "plugin.json"), path.join(dir, "plugin.json")]) if (fs.existsSync(f)) return f;
  return void 0;
}
function isDir(p) { try { return fs.statSync(p).isDirectory(); } catch { return false; } }
function listNames(dir, filter) { try { return fs.readdirSync(dir).filter((n) => filter(path.join(dir, n), n)).sort(); } catch { return []; } }
function looksLikePlugin(dir) {
  return Boolean(manifestFile(dir)) || ["skills", "commands", "agents"].some((d) => isDir(path.join(dir, d))) || fs.existsSync(path.join(dir, ".mcp.json"));
}
function pluginComponents(dir, manifest) {
  const skills = skillDirsIn(path.join(dir, "skills")).map((s) => s.name);
  const commands = listNames(path.join(dir, "commands"), (p, n) => /\.md$/i.test(n)).map((n) => n.replace(/\.md$/i, ""));
  const agents = listNames(path.join(dir, "agents"), (p, n) => /\.md$/i.test(n)).map((n) => n.replace(/\.md$/i, ""));
  const mcpJson = readJson(path.join(dir, ".mcp.json"));
  const mcpServers = Object.keys((mcpJson && (mcpJson.mcpServers ?? mcpJson.servers)) || (manifest && typeof manifest.mcpServers === "object" ? manifest.mcpServers : {}) || {});
  const hooks = fs.existsSync(path.join(dir, "hooks", "hooks.json")) || Boolean(manifest && manifest.hooks);
  return { skills, commands, agents, mcpServers, hooks };
}
export function listAiPlugins() {
  const root = pluginsDirectory();
  const state = readAiPluginState();
  const off = new Set(state.disabledPlugins);
  const rows = [];
  for (const name of listNames(root, (p, n) => !n.startsWith(".") && !n.includes(".installing-") && isDir(p))) {
    const dir = path.join(root, name);
    const mf = manifestFile(dir);
    const manifest = mf ? readJson(mf) ?? {} : {};
    const author = typeof manifest.author === "string" ? manifest.author : manifest.author?.name ?? "";
    rows.push({
      name,
      displayName: typeof manifest.name === "string" && manifest.name ? manifest.name : name,
      version: typeof manifest.version === "string" ? manifest.version : "",
      description: typeof manifest.description === "string" ? manifest.description : "",
      author,
      dir,
      enabled: !off.has(name),
      manifestError: mf && !readJson(mf) ? "plugin.json 不是有效的 JSON" : "",
      source: state.sources[name] ?? null,
      components: pluginComponents(dir, manifest)
    });
  }
  return rows;
}
export function enabledAiPluginDirs() {
  try { return listAiPlugins().filter((p) => p.enabled).map((p) => ({ name: p.name, dir: p.dir })); } catch { return []; }
}
export function setAiPluginEnabled(name, on) {
  updateState((s) => { const set = new Set(s.disabledPlugins); on ? set.delete(name) : set.add(name); s.disabledPlugins = [...set]; });
}
export function uninstallAiPlugin(name) {
  if (!PLUGIN_NAME_RE.test(String(name))) throw new Error("插件名不合法");
  const dir = path.join(pluginsDirectory(), name);
  if (!isDir(dir)) throw new Error("插件不存在：" + name);
  fs.rmSync(dir, { recursive: true, force: true });
  updateState((s) => { delete s.sources[name]; s.disabledPlugins = s.disabledPlugins.filter((x) => x !== name); });
}

function sanitizeName(n) {
  const v = String(n ?? "").trim().replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^[-.]+|-+$/g, "");
  if (!PLUGIN_NAME_RE.test(v)) throw new Error("无法从插件得到合法名字：" + n);
  return v;
}
function copyTree(src, dest) {
  fs.cpSync(src, dest, { recursive: true, filter: (p) => !/[\\/](\.git|node_modules)([\\/]|$)/.test(p.slice(src.length)) });
}
function isGitInput(input) { return /^(https?:\/\/|git@|ssh:\/\/)/i.test(input) || /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(\.git)?$/.test(input) && !fs.existsSync(input); }
function gitUrl(input) { return /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(\.git)?$/.test(input) && !/^(https?:|git@|ssh:)/i.test(input) ? `https://github.com/${input.replace(/\.git$/, "")}.git` : input; }
// Prefer the git bundled with OpenCode (runtime/git) so installs work without a system git.
function gitBinary() {
  try {
    const root = path.join(vscodeP.env.appRoot, "extensions", "opencode", "runtime", "git");
    for (const rel of ["cmd/git.exe", "mingw64/bin/git.exe", "bin/git.exe", "bin/git"]) { const f = path.join(root, rel); if (fs.existsSync(f)) return f; }
  } catch {}
  return "git";
}
function gitClone(url, dest, ref) {
  return new Promise((resolve, reject) => {
    const args = ["clone", "--depth", "1", ...(ref ? ["--branch", ref] : []), url, dest];
    childP.default.execFile(gitBinary(), args, { timeout: 180000, windowsHide: true }, (error, _out, err) => error ? reject(new Error("git clone 失败：" + (String(err || "").trim().split(/\r?\n/).slice(-3).join(" ") || error.message))) : resolve());
  });
}
// Resolve user input to a local directory: an existing path is used as-is; a git URL / owner/repo is cloned into the marketplace cache.
async function materialize(input, ref) {
  const raw = String(input ?? "").trim().replace(/^~(?=$|[\\/])/, os.homedir());
  if (!raw) throw new Error("请填写本地文件夹或 git 地址");
  if (!isGitInput(raw)) {
    const dir = path.resolve(raw);
    if (!isDir(dir)) throw new Error("文件夹不存在：" + dir);
    return { dir, local: true };
  }
  const url = gitUrl(raw);
  const key = cryptoP.default.createHash("sha256").update(url + "#" + (ref || "")).digest("hex").slice(0, 16);
  const dest = path.join(marketplaceCacheDir(), key);
  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(marketplaceCacheDir(), { recursive: true });
  await gitClone(url, dest, ref);
  return { dir: dest, local: false, url };
}
function readMarketplace(dir) {
  const f = [path.join(dir, ".claude-plugin", "marketplace.json"), path.join(dir, "marketplace.json")].find((x) => fs.existsSync(x));
  if (!f) return void 0;
  const m = readJson(f);
  if (!m || !Array.isArray(m.plugins)) throw new Error("marketplace.json 格式不对（缺少 plugins 数组）");
  const pluginRoot = typeof m.metadata?.pluginRoot === "string" ? m.metadata.pluginRoot : "";
  return {
    name: typeof m.name === "string" ? m.name : path.basename(dir),
    owner: typeof m.owner === "string" ? m.owner : m.owner?.name ?? "",
    plugins: m.plugins.filter((p) => p && typeof p.name === "string").map((p) => ({ name: p.name, description: typeof p.description === "string" ? p.description : "", version: typeof p.version === "string" ? p.version : "", source: p.source ?? "./" + p.name, pluginRoot, category: typeof p.category === "string" ? p.category : "" }))
  };
}
async function installFromDir(dir, nameHint, source) {
  if (!looksLikePlugin(dir)) throw new Error("这个位置不是插件：没有 .claude-plugin/plugin.json，也没有 skills/、commands/、agents/ 或 .mcp.json");
  const mf = manifestFile(dir);
  const manifest = mf ? readJson(mf) : {};
  if (mf && !manifest) throw new Error("plugin.json 不是有效的 JSON：" + mf);
  const name = sanitizeName(manifest?.name || nameHint || path.basename(dir));
  const dest = path.join(pluginsDirectory(), name);
  const staging = dest + ".installing-" + process.pid;
  fs.mkdirSync(pluginsDirectory(), { recursive: true });
  fs.rmSync(staging, { recursive: true, force: true });
  copyTree(dir, staging);
  fs.rmSync(dest, { recursive: true, force: true });
  fs.renameSync(staging, dest);
  updateState((s) => { s.sources[name] = { ...source, installedAt: new Date().toISOString() }; });
  return name;
}
// Add from a path / git URL. Returns { installed } for a single plugin or { marketplace } when the location is a marketplace.
export async function addAiPluginSource(input, ref) {
  const where = await materialize(input, ref);
  const market = readMarketplace(where.dir);
  if (market && !manifestFile(where.dir)) {
    updateState((s) => { s.marketplaces = [...s.marketplaces.filter((m) => m.input !== String(input).trim()), { input: String(input).trim(), ref: ref || "", name: market.name }]; });
    return { marketplace: { ...market, input: String(input).trim(), ref: ref || "" } };
  }
  const name = await installFromDir(where.dir, void 0, { type: where.local ? "path" : "git", input: String(input).trim(), ref: ref || "" });
  return { installed: name };
}
async function installMarketEntry(rootDir, market, entry, input, ref) {
  const src = entry.source;
  let dir, extra;
  if (typeof src === "string") {
    const rel = src.startsWith(".") || /^[\\/]/.test(src) ? src : path.join(entry.pluginRoot || ".", src);
    dir = path.resolve(rootDir, rel);
    if (!dir.startsWith(path.resolve(rootDir))) throw new Error("插件路径越出了市场目录：" + src);
  } else if (src && typeof src === "object") {
    const remote = src.source === "github" && src.repo ? src.repo : src.url;
    if (!remote) throw new Error("不支持的插件来源：" + JSON.stringify(src));
    extra = await materialize(remote, src.ref);
    dir = src.path ? path.resolve(extra.dir, src.path) : extra.dir;
  } else throw new Error("插件来源缺失");
  try {
    return await installFromDir(dir, entry.name, { type: "marketplace", input: String(input).trim(), ref: ref || "", plugin: entry.name, marketplace: market.name });
  } finally {
    if (extra && !extra.local) fs.rmSync(extra.dir, { recursive: true, force: true });
  }
}
export async function installMarketplacePlugin(input, ref, pluginName) {
  const where = await materialize(input, ref);
  const market = readMarketplace(where.dir);
  if (!market) throw new Error("这个位置没有 marketplace.json");
  const entry = market.plugins.find((p) => p.name === pluginName);
  if (!entry) throw new Error("插件市场里没有：" + pluginName);
  return installMarketEntry(where.dir, market, entry, input, ref);
}
export async function listMarketplace(input, ref) {
  const where = await materialize(input, ref);
  const market = readMarketplace(where.dir);
  if (!market) throw new Error("这个位置没有 marketplace.json");
  return { ...market, input: String(input).trim(), ref: ref || "" };
}
export function removeMarketplace(input) {
  updateState((s) => { s.marketplaces = s.marketplaces.filter((m) => m.input !== input); });
}
export async function updateAiPlugin(name) {
  const src = readAiPluginState().sources[name];
  if (!src) throw new Error("不知道这个插件的安装来源，请重新安装");
  if (src.type === "marketplace") return installMarketplacePlugin(src.input, src.ref, src.plugin);
  const where = await materialize(src.input, src.ref);
  return installFromDir(where.dir, name, { type: src.type, input: src.input, ref: src.ref || "" });
}

// ---------- skills ----------
function skillDirsIn(root) {
  const out = [];
  const visit = (dir, depth) => {
    for (const n of listNames(dir, (p, name) => !name.startsWith(".") && isDir(p))) {
      const d = path.join(dir, n);
      const file = ["SKILL.md", "skill.md", "Skill.md"].map((f) => path.join(d, f)).find((f) => fs.existsSync(f));
      if (file) out.push({ name: n, dir: d, file });
      else if (depth < 1) visit(d, depth + 1);
    }
  };
  visit(root, 0);
  return out;
}
export function skillSources(workspaceRoot) {
  const home = os.homedir();
  const sources = [];
  if (workspaceRoot) {
    const trusted = vscodeP.workspace.isTrusted !== false;
    for (const d of [".opencode/skills", ".claude/skills", ".agents/skills"]) sources.push({ scope: "workspace", label: "工作区 · " + d.split("/")[0], dir: path.join(workspaceRoot, d), trusted });
  }
  sources.push({ scope: "user", label: "用户 · ~/.opencode", dir: path.join(home, ".opencode", "skills") });
  try { const g = globalSkillsDirectory(); if (g) sources.push({ scope: "global", label: "Skill 中心（全局）", dir: g }); } catch {}
  sources.push({ scope: "user", label: "用户 · ~/.claude", dir: path.join(home, ".claude", "skills") });
  sources.push({ scope: "user", label: "用户 · ~/.agents", dir: path.join(home, ".agents", "skills") });
  for (const p of enabledAiPluginDirs()) sources.push({ scope: "plugin", label: "插件 · " + p.name, dir: path.join(p.dir, "skills"), plugin: p.name });
  return sources;
}
// All skills, first source wins on duplicate names (workspace > user > global > plugin). Disabled ones are marked, not dropped.
export function listAiSkills(workspaceRoot) {
  const state = readAiPluginState();
  const off = new Set(state.disabledSkills);
  const seen = new Map();
  const rows = [];
  const seenDirs = new Set();
  for (const src of skillSources(workspaceRoot)) {
    const resolved = path.resolve(src.dir).toLowerCase();
    if (seenDirs.has(resolved)) continue;
    seenDirs.add(resolved);
    if (src.trusted === false) continue;
    for (const s of skillDirsIn(src.dir)) {
      let meta = {}, error = "";
      try { meta = parseSkillFrontmatter(fs.readFileSync(s.file, "utf8")).meta; } catch (e) { error = String(e?.message ?? e); }
      const name = typeof meta.name === "string" && meta.name.trim() ? meta.name.trim() : s.name;
      const key = name.toLowerCase();
      const shadowedBy = seen.get(key);
      const row = { name, description: typeof meta.description === "string" ? meta.description : "", dir: s.dir, file: s.file, scope: src.scope, source: src.label, plugin: src.plugin ?? "", enabled: !off.has(name), shadowedBy: shadowedBy ? shadowedBy.source : "", error: error || (!meta.description ? "SKILL.md 缺少 description，AI 不知道什么时候用它" : "") };
      if (!shadowedBy) seen.set(key, row);
      rows.push(row);
    }
  }
  return { enabled: state.skillsEnabled, skills: rows, sources: skillSources(workspaceRoot).map((s) => ({ label: s.label, dir: s.dir, exists: isDir(s.dir) })) };
}
export function setAiSkillsEnabled(on) { updateState((s) => { s.skillsEnabled = Boolean(on); }); }
export function setAiSkillEnabled(names, on) {
  updateState((s) => { const set = new Set(s.disabledSkills); for (const n of names) on ? set.delete(n) : set.add(n); s.disabledSkills = [...set]; });
}
export function createAiSkill(scope, workspaceRoot, name, description) {
  const n = String(name ?? "").trim();
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(n)) throw new Error("Skill 名只能用字母、数字、- 和 _");
  const desc = String(description ?? "").replace(/\s+/g, " ").trim();
  if (!desc) throw new Error("请写一句「什么时候用」，AI 靠它决定要不要加载");
  const base = scope === "workspace" ? (workspaceRoot ? path.join(workspaceRoot, ".opencode", "skills") : "") : path.join(ocHome(), "skills");
  if (!base) throw new Error("没有打开工作区，只能建在用户目录");
  const dir = path.join(base, n);
  if (fs.existsSync(dir)) throw new Error("已经有同名 Skill：" + dir);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "SKILL.md");
  fs.writeFileSync(file, `---\nname: ${n}\ndescription: ${desc}\n---\n\n# ${n}\n\n在这里写具体步骤和注意事项。可以把脚本、模板放在同一个文件夹里，在正文里用相对路径引用。\n`, "utf8");
  return file;
}
export function importAiSkillFolder(src, scope, workspaceRoot) {
  const dir = path.resolve(String(src));
  const found = fs.existsSync(path.join(dir, "SKILL.md")) ? [{ name: path.basename(dir), dir }] : skillDirsIn(dir);
  if (!found.length) throw new Error("这个文件夹里没有 SKILL.md");
  const base = scope === "workspace" ? (workspaceRoot ? path.join(workspaceRoot, ".opencode", "skills") : "") : path.join(ocHome(), "skills");
  if (!base) throw new Error("没有打开工作区，只能导入到用户目录");
  const done = [];
  for (const s of found) {
    const dest = path.join(base, s.name);
    if (fs.existsSync(dest)) throw new Error("已经有同名 Skill：" + dest);
    copyTree(s.dir, dest);
    done.push(s.name);
  }
  return done;
}
export function deleteAiSkill(file) {
  const target = path.resolve(String(file));
  const dir = path.dirname(target);
  const allowed = [path.join(ocHome(), "skills")];
  for (const ws of vscodeP.workspace.workspaceFolders ?? []) allowed.push(path.join(ws.uri.fsPath, ".opencode", "skills"));
  if (!allowed.some((a) => path.dirname(dir).toLowerCase() === path.resolve(a).toLowerCase())) throw new Error("只能删除 ~/.opencode/skills 或工作区 .opencode/skills 里的 Skill；其他来源请到原位置管理");
  fs.rmSync(dir, { recursive: true, force: true });
}

// ---------- native chat: skill tool ----------
function clip(text, max) { const v = String(text ?? ""); return v.length > max ? v.slice(0, max) + "…" : v; }
function listSkillFiles(dir) {
  const out = [];
  const walk = (d, rel) => {
    for (const n of listNames(d, () => true)) {
      if (out.length >= 60 || n === ".git" || n === "node_modules") continue;
      const p = path.join(d, n), r = rel ? rel + "/" + n : n;
      if (isDir(p)) walk(p, r); else if (!/^skill\.md$/i.test(r)) out.push(r);
    }
  };
  walk(dir, "");
  return out;
}
// Returns { definition, execute } or undefined when skills are off or none are enabled.
export function prepareSkillTool(workspaceRoot, log) {
  const cat = listAiSkills(workspaceRoot);
  if (!cat.enabled) return void 0;
  const active = cat.skills.filter((s) => s.enabled && !s.shadowedBy);
  if (!active.length) return void 0;
  const listed = active.slice(0, MAX_LISTED_SKILLS).map((s) => `- ${s.name}: ${clip(s.description.replace(/\s+/g, " "), 240) || "(no description)"}`);
  if (active.length > MAX_LISTED_SKILLS) listed.push(`- …and ${active.length - MAX_LISTED_SKILLS} more (call with an exact name)`);
  const definition = {
    name: SKILL_TOOL_NAME,
    description: "Load a skill: packaged instructions (SKILL.md) plus bundled files for a specific kind of task. When the user's request matches a skill below, call this tool with the skill name BEFORE doing the work, then follow the returned instructions. Do not guess a skill's contents.\n\nAvailable skills:\n" + listed.join("\n"),
    inputSchema: { type: "object", properties: { name: { type: "string", description: "Exact skill name from the list" } }, required: ["name"], additionalProperties: false }
  };
  const execute = async (args) => {
    const want = String(args?.name ?? "").trim().toLowerCase();
    const skill = active.find((s) => s.name.toLowerCase() === want) ?? active.find((s) => path.basename(s.dir).toLowerCase() === want);
    if (!skill) return { text: `没有名为 ${args?.name ?? ""} 的 Skill（或已被关闭）。可用：${active.map((s) => s.name).join(", ")}`, isError: true };
    let body;
    try { body = parseSkillFrontmatter(fs.readFileSync(skill.file, "utf8")).body; } catch (e) { return { text: `读取 ${skill.file} 失败：${e?.message ?? e}`, isError: true }; }
    const files = listSkillFiles(skill.dir);
    log?.(`[skills] loaded ${skill.name} (${skill.source})`);
    return { text: `Skill "${skill.name}" (${skill.source})\nBase directory: ${skill.dir}\nRelative paths in this skill are relative to the base directory; use read_files / run_command with absolute paths.\n\n${clip(body.trim(), MAX_SKILL_CHARS)}${files.length ? "\n\nBundled files:\n" + files.map((f) => "- " + f).join("\n") : ""}`, isError: false };
  };
  return { definition, execute };
}

// ---------- online search & install (ai-plugins-step03) ----------
// Skills: skills.sh public API (search; install by cloning the source repo, falling back to its download API).
// Plugins: api.claude-plugins.dev registry (search; install from the listed git repo / marketplace).
async function fetchJson(url, timeoutMs = 20000) {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), headers: { accept: "application/json", "user-agent": "OpenCode" } });
  if (!res.ok) throw new Error(`${new URL(url).host} 返回 ${res.status}`);
  return res.json();
}
// OpenCode market-step02: 各来源统一支持排序 recent / rating / downloads / relevance / trending（不支持的退回相关性）
export const MARKET_SORTS = { skill: ["downloads", "trending", "relevance"], plugin: ["recent", "rating", "downloads", "relevance", "trending"], mcp: ["recent", "relevance"], ext: ["recent", "rating", "downloads", "relevance", "trending"], theme: ["recent", "rating", "downloads", "relevance", "trending"] };
function ocSafeIcon(u) { return typeof u === "string" && /^https:\/\/[^\s"'<>]+$/.test(u) ? u : ""; }
function ocTime(v) { const t = Date.parse(String(v ?? "")); return Number.isFinite(t) ? t : 0; }
async function fetchText(url, timeoutMs = 20000) {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), headers: { accept: "text/html", "user-agent": "Mozilla/5.0 (OpenCode)" } });
  if (!res.ok) throw new Error(`${new URL(url).host} 返回 ${res.status}`);
  return res.text();
}
const SKILL_BOARDS = { downloads: "https://skills.sh/", trending: "https://skills.sh/trending" };
async function skillsBoard(sort) {
  const html = (await fetchText(SKILL_BOARDS[sort])).replace(/\\"/g, '"');
  const re = /\{"source":"([^"]+)","skillId":"([^"]+)","name":"([^"]+)","installs":(\d+)/g;
  const seen = new Set(), out = [];
  let m;
  while ((m = re.exec(html))) {
    const id = `${m[1]}/${m[2]}`;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({ id, name: m[3], skillId: m[2], source: m[1], installs: Number(m[4]) || 0, period: sort === "trending" ? "24h" : "", url: `https://skills.sh/${id}` });
  }
  if (!out.length) throw new Error("skills.sh 页面格式变了，暂时读不到榜单");
  return out;
}
export async function searchOnlineSkills(query, limit = 30, sort) {
  const q = String(query ?? "").trim();
  sort = MARKET_SORTS.skill.includes(sort) ? sort : (q ? "relevance" : "downloads");
  if (sort !== "relevance" || !q) {
    const board = await skillsBoard(sort === "relevance" ? "downloads" : sort);
    const lq = q.toLowerCase();
    const hit = lq ? board.filter((s) => s.name.toLowerCase().includes(lq) || s.source.toLowerCase().includes(lq)) : board;
    if (hit.length || !q) return hit.slice(0, limit);
  }
  if (q.length < 2) throw new Error("至少输入 2 个字");
  const data = await fetchJson(`https://skills.sh/api/search?q=${encodeURIComponent(q)}&limit=${Math.min(50, Math.max(1, limit))}`);
  const items = (Array.isArray(data?.skills) ? data.skills : []).filter((s) => s && typeof s.id === "string").map((s) => ({ id: s.id, name: String(s.name ?? s.skillId ?? ""), skillId: String(s.skillId ?? s.name ?? ""), source: String(s.source ?? ""), installs: Number(s.installs) || 0, url: `https://skills.sh/${s.id}` }));
  if (sort === "downloads") items.sort((a, b) => b.installs - a.installs);
  return items;
}

function findSkillDirByName(root, want) {
  const w = String(want).toLowerCase();
  let hit;
  const visit = (dir, depth) => {
    if (hit || depth > 5) return;
    for (const n of listNames(dir, (p, name) => name !== ".git" && name !== "node_modules" && isDir(p))) {
      const d = path.join(dir, n);
      const file = ["SKILL.md", "skill.md"].map((f) => path.join(d, f)).find((f) => fs.existsSync(f));
      if (file) {
        let name = n;
        try { const m = parseSkillFrontmatter(fs.readFileSync(file, "utf8")).meta; if (typeof m.name === "string" && m.name) name = m.name; } catch {}
        if (n.toLowerCase() === w || name.toLowerCase() === w) { hit = d; return; }
      }
      visit(d, depth + 1);
      if (hit) return;
    }
  };
  if (fs.existsSync(path.join(root, "SKILL.md")) && path.basename(root).toLowerCase() === w) return root;
  visit(root, 0);
  return hit;
}
function skillBase(scope, workspaceRoot) {
  const base = scope === "workspace" ? (workspaceRoot ? path.join(workspaceRoot, ".opencode", "skills") : "") : path.join(ocHome(), "skills");
  if (!base) throw new Error("没有打开工作区，只能装到用户目录");
  return base;
}
export async function installOnlineSkill(item, scope, workspaceRoot) {
  const id = String(item?.id ?? "");
  const parts = id.split("/");
  if (parts.length < 3 || parts.some((p) => !p || p === "." || p === "..")) throw new Error("Skill 标识不合法：" + id);
  const skillId = parts[parts.length - 1];
  const source = item?.source || parts.slice(0, -1).join("/");
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/.test(skillId)) throw new Error("Skill 名不合法：" + skillId);
  const dest = path.join(skillBase(scope, workspaceRoot), skillId);
  const staging = dest + ".installing-" + process.pid;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.rmSync(staging, { recursive: true, force: true });
  let how = "";
  try {
    const where = await materialize(source);
    try {
      const dir = findSkillDirByName(where.dir, skillId);
      if (!dir) throw new Error("仓库里没找到 " + skillId);
      copyTree(dir, staging);
      how = "git";
    } finally {
      fs.rmSync(where.dir, { recursive: true, force: true });
    }
  } catch (gitError) {
    const data = await fetchJson(`https://skills.sh/api/download/${parts.map(encodeURIComponent).join("/")}`, 60000).catch((e) => { throw new Error(`下载失败：${gitError.message}；${e.message}`); });
    const files = Array.isArray(data?.files) ? data.files : [];
    if (!files.some((f) => /^skill\.md$/i.test(String(f?.path)))) throw new Error("下载的内容里没有 SKILL.md");
    for (const f of files) {
      const rel = String(f?.path ?? "").replace(/\\/g, "/");
      if (!rel || rel.startsWith("/") || /^[A-Za-z]:/.test(rel) || rel.split("/").includes("..")) continue;
      const out = path.join(staging, rel);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, String(f.contents ?? ""), "utf8");
    }
    how = "download";
  }
  fs.rmSync(dest, { recursive: true, force: true });
  fs.renameSync(staging, dest);
  return { name: skillId, dir: dest, how };
}
export async function searchOnlinePlugins(query, limit = 30, sort) {
  const q = String(query ?? "").trim();
  sort = MARKET_SORTS.plugin.includes(sort) ? sort : (q ? "relevance" : "downloads");
  const data = await fetchJson(`https://api.claude-plugins.dev/api/search?q=${encodeURIComponent(q)}&limit=${sort === "relevance" ? Math.min(50, Math.max(1, limit)) : 100}&offset=0`);
  const items = (Array.isArray(data?.plugins) ? data.plugins : []).filter((p) => p && typeof p.name === "string" && typeof p.gitUrl === "string").map((p) => ({
    name: p.name, namespace: String(p.namespace ?? ""), gitUrl: p.gitUrl, description: String(p.description ?? ""), version: String(p.version ?? ""), author: String(p.author ?? ""),
    stars: Number(p.stars) || 0, downloads: Number(p.downloads) || 0, skills: Array.isArray(p.skills) ? p.skills : [], category: String(p.category ?? ""),
    updated: String(p.updatedAt ?? p.createdAt ?? ""), created: String(p.createdAt ?? "")
  }));
  const now = Date.now();
  const heat = (p) => p.downloads / Math.max(7, (now - (ocTime(p.created) || now - 365 * 864e5)) / 864e5);
  if (sort === "downloads") items.sort((a, b) => b.downloads - a.downloads);
  else if (sort === "rating") items.sort((a, b) => b.stars - a.stars);
  else if (sort === "recent") items.sort((a, b) => ocTime(b.updated) - ocTime(a.updated));
  else if (sort === "trending") items.sort((a, b) => heat(b) - heat(a));
  return items.slice(0, limit);
}

export async function installOnlinePlugin(item) {
  const gitUrl = String(item?.gitUrl ?? "");
  if (!/^https:\/\/[^\s]+$/i.test(gitUrl)) throw new Error("插件地址不合法：" + gitUrl);
  const where = await materialize(gitUrl);
  try {
    const market = readMarketplace(where.dir);
    const entry = market?.plugins.find((p) => p.name === item.name);
    if (entry) return await installMarketEntry(where.dir, market, entry, gitUrl, "");
    if (looksLikePlugin(where.dir) && (!market || manifestFile(where.dir))) return await installFromDir(where.dir, item.name, { type: "git", input: gitUrl, ref: "" });
    throw new Error(`在 ${gitUrl} 里没找到插件 ${item.name}`);
  } finally {
    fs.rmSync(where.dir, { recursive: true, force: true });
  }
}

// OpenCode market-step01: the "Market" window (opencode.openMarket) — MCP servers from the official MCP registry
// (written into the user's mcp.json) and editor extensions / themes from Open VSX (installed through the workbench).
function stripJsonc(text) {
  let out = "", i = 0, str = false;
  while (i < text.length) {
    const c = text[i], n = text[i + 1];
    if (str) { out += c; if (c === "\\") { out += n ?? ""; i += 2; continue; } if (c === '"') str = false; i++; continue; }
    if (c === '"') { str = true; out += c; i++; continue; }
    if (c === "/" && n === "/") { while (i < text.length && text[i] !== "\n") i++; continue; }
    if (c === "/" && n === "*") { i += 2; while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i++; i += 2; continue; }
    out += c; i++;
  }
  return out.replace(/,(\s*[}\]])/g, "$1");
}
export function readMcpJson(file) {
  if (!fs.existsSync(file)) return { servers: {}, inputs: [] };
  const raw = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
  if (!raw.trim()) return { servers: {}, inputs: [] };
  let data;
  try { data = JSON.parse(stripJsonc(raw)); } catch (e) { throw new Error("mcp.json 格式有误，先手动修好：" + (e?.message ?? e)); }
  if (!data || typeof data !== "object") data = {};
  if (!data.servers || typeof data.servers !== "object") data.servers = {};
  if (!Array.isArray(data.inputs)) data.inputs = [];
  return data;
}
export function installedMcpNames(file) {
  try { return Object.keys(readMcpJson(file).servers); } catch { return []; }
}
function mcpKind(server) {
  const pkg = (t) => (server.packages ?? []).find((p) => p?.registryType === t && p.identifier && (!p.transport || p.transport.type === "stdio"));
  for (const t of ["npm", "pypi"]) { const pk = pkg(t); if (pk) return { kind: t, pkg: pk }; }
  const rm = (server.remotes ?? []).find((r) => /^https:\/\//i.test(r?.url ?? ""));
  if (rm) return { kind: "remote", remote: rm };
  const oci = pkg("oci");
  if (oci) return { kind: "oci", pkg: oci };
  return { kind: "" };
}
const FEATURED_MCP = ["io.github.upstash/context7", "io.github.microsoft/playwright-mcp", "io.github.ChromeDevTools/chrome-devtools-mcp", "io.github.github/github-mcp-server", "com.notion/mcp", "com.figma.mcp/mcp", "com.stripe/mcp"];
function mcpRow(row, featured) {
  const s = row?.server ?? row;
  if (!s || typeof s.name !== "string") return void 0;
  const meta = row?._meta?.["io.modelcontextprotocol.registry/official"];
  if (meta && meta.status && meta.status !== "active") return void 0;
  const k = mcpKind(s);
  if (!k.kind) return void 0;
  const env = k.pkg ? (k.pkg.environmentVariables ?? []) : (k.remote.headers ?? []);
  return {
    name: s.name, title: String(s.title && !/^(mcp|server)$/i.test(s.title) ? s.title : mcpShortName(s.name)), description: String(s.description ?? ""), version: String(s.version ?? ""),
    key: mcpKey(s.name), url: String(s.websiteUrl ?? s.repository?.url ?? ""), kind: k.kind, needsKey: env.some((e) => e?.isRequired || e?.isSecret), featured: !!featured, icon: ocSafeIcon(s.icons?.[0]?.src), updated: String(meta?.updatedAt ?? meta?.publishedAt ?? ""), server: s
  };
}
export async function searchMcpServers(query, limit = 30, sort) {
  const q = String(query ?? "").trim();
  sort = MARKET_SORTS.mcp.includes(sort) ? sort : "relevance";
  if (!q && sort === "relevance") {
    const rows = await Promise.all(FEATURED_MCP.map((n) => fetchJson(`https://registry.modelcontextprotocol.io/v0/servers/${encodeURIComponent(n)}/versions/latest`).catch(() => void 0)));
    return rows.map((r) => r && mcpRow(r, true)).filter(Boolean);
  }
  const since = new Date(Date.now() - 30 * 864e5).toISOString();
  const data = await fetchJson(`https://registry.modelcontextprotocol.io/v0/servers?limit=100&version=latest${q ? "&search=" + encodeURIComponent(q) : "&updated_since=" + encodeURIComponent(since)}`);
  const seen = new Set(), out = [];
  for (const row of Array.isArray(data?.servers) ? data.servers : []) {
    const it = mcpRow(row, FEATURED_MCP.includes(row?.server?.name));
    if (!it || seen.has(it.name)) continue;
    seen.add(it.name); out.push(it);
  }
  if (sort === "recent") out.sort((x, y) => ocTime(y.updated) - ocTime(x.updated));
  else out.sort((x, y) => Number(y.featured) - Number(x.featured));
  return out.slice(0, limit);
}

function mcpShortName(name) {
  const [ns, last = ""] = String(name).split("/");
  if (!/^(mcp|server|mcp-server|mcp-servers)$/i.test(last)) return last;
  const owner = ns.split(".").filter((x) => !/^(com|io|ai|org|net|dev|app|co|github|mcp)$/i.test(x)).pop();
  return owner || last;
}
export function mcpKey(name) {
  return mcpShortName(name).replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "mcp-server";
}
export function installMcpServer(item, mcpFile) {
  const server = item?.server;
  if (!server || typeof server.name !== "string") throw new Error("MCP 服务信息不完整");
  const k = mcpKind(server);
  if (!k.kind) throw new Error("这个 MCP 服务没有可自动安装的方式");
  const data = readMcpJson(mcpFile);
  const key = mcpKey(server.name);
  const inputs = [];
  const input = (id, description, secret, def) => {
    const fullId = `${key}-${id}`.replace(/[^A-Za-z0-9._-]+/g, "-");
    if (!inputs.some((x) => x.id === fullId)) inputs.push({ id: fullId, type: "promptString", description: description || id, ...(secret ? { password: true } : {}), ...(def ? { default: def } : {}) });
    return "${input:" + fullId + "}";
  };
  let entry;
  if (k.kind === "remote") {
    const headers = {};
    for (const h of k.remote.headers ?? []) {
      if (!h?.name) continue;
      const v = String(h.value ?? "");
      if (/\{[^}]+\}/.test(v)) headers[h.name] = v.replace(/\{([^}]+)\}/g, (_, n) => input(n, h.description, h.isSecret !== false));
      else if (v) headers[h.name] = v;
      else if (h.isRequired || h.isSecret) headers[h.name] = input(h.name, h.description, true);
    }
    entry = { type: k.remote.type === "sse" ? "sse" : "http", url: k.remote.url, ...(Object.keys(headers).length ? { headers } : {}) };
  } else {
    const pk = k.pkg, ver = pk.version && pk.version !== "latest" ? pk.version : "";
    const args = [];
    const pushArgs = (list) => {
      for (const a of list ?? []) {
        let v = a?.value ?? a?.default ?? "";
        if (!v && a?.isRequired) v = input(a.name ?? a.valueHint ?? "arg", a.description, !!a.isSecret);
        if (!v && !a?.isRequired) continue;
        if (a?.type === "named") { if (a.name) args.push(a.name); if (v) args.push(String(v)); }
        else args.push(String(v));
      }
    };
    let command;
    if (pk.registryType === "npm") { command = "npx"; pushArgs(pk.runtimeArguments); if (!args.includes("-y") && !args.includes("--yes")) args.unshift("-y"); args.push(pk.identifier + (ver ? "@" + ver : "")); }
    else if (pk.registryType === "pypi") { command = "uvx"; pushArgs(pk.runtimeArguments); args.push(pk.identifier + (ver ? "==" + ver : "")); }
    else { command = "docker"; args.push("run", "-i", "--rm"); }
    const env = {};
    for (const e of pk.environmentVariables ?? []) {
      if (!e?.name) continue;
      if (e.value) env[e.name] = String(e.value);
      else if (e.isRequired || e.isSecret) env[e.name] = input(e.name, e.description, !!e.isSecret, e.default && !e.isSecret ? String(e.default) : "");
    }
    if (pk.registryType === "oci") { for (const n of Object.keys(env)) args.push("-e", n); pushArgs(pk.runtimeArguments); args.push(pk.identifier + (ver && !String(pk.identifier).includes(":") ? ":" + ver : "")); }
    pushArgs(pk.packageArguments);
    entry = { type: "stdio", command, args, ...(Object.keys(env).length ? { env } : {}) };
  }
  data.servers[key] = entry;
  data.inputs = [...data.inputs.filter((x) => !inputs.some((y) => y.id === x?.id)), ...inputs];
  fs.mkdirSync(path.dirname(mcpFile), { recursive: true });
  if (fs.existsSync(mcpFile)) fs.copyFileSync(mcpFile, mcpFile + ".bak");
  fs.writeFileSync(mcpFile, JSON.stringify(data, null, "\t") + "\n", "utf8");
  return { key, needsInput: inputs.length > 0, command: entry.command ?? "" };
}
export async function searchOpenVsx(query, category, limit = 30, sort) {
  const q = String(query ?? "").trim();
  sort = MARKET_SORTS.ext.includes(sort) ? sort : (q ? "relevance" : "downloads");
  const by = { recent: "timestamp", rating: "rating", downloads: "downloadCount", relevance: "relevance", trending: "timestamp" }[sort];
  const size = sort === "trending" ? 100 : Math.min(50, Math.max(1, limit));
  const url = `https://open-vsx.org/api/-/search?size=${size}&sortBy=${by}&sortOrder=desc${q ? "&query=" + encodeURIComponent(q) : ""}${category ? "&category=" + encodeURIComponent(category) : ""}`;
  const data = await fetchJson(url);
  const items = (Array.isArray(data?.extensions) ? data.extensions : []).filter((e) => e && e.namespace && e.name && !e.deprecated).map((e) => ({
    id: `${e.namespace}.${e.name}`, name: String(e.displayName || e.name), publisher: String(e.namespace), description: String(e.description ?? ""), version: String(e.version ?? ""),
    downloads: Number(e.downloadCount) || 0, rating: Number(e.averageRating) || 0, verified: !!e.verified, icon: ocSafeIcon(e.files?.icon), url: `https://open-vsx.org/extension/${e.namespace}/${e.name}`
  }));
  // 近期热门：最近更新的 100 个里按下载量排
  if (sort === "trending") items.sort((a, b) => b.downloads - a.downloads);
  return items.slice(0, limit);
}


