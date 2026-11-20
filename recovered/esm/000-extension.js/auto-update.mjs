// auto-update-step06: 检查更新（默认关闭，不联网）。
// 设置 opencode.update.source：
//   "owner/name"        → GitHub 公开仓库 releases/latest
//   本地或 UNC 文件夹路径 → 读其中的 latest.json {version, notes, url 或 path}
//   空（默认）           → 不检查、不联网
// 启动时最多每天检查一次；命令「OpenCode：检查更新」随时手动检查。发现新版本只弹通知，
// 「下载并安装」把安装包下载/复制到临时目录后由用户确认再启动或在资源管理器里显示，绝不静默安装。
import { __toESM } from "./module-0000.mjs";
var vscodeA = __toESM(require("vscode"));
var fsA = __toESM(require("node:fs"));
var pathA = __toESM(require("node:path"));
var osA = __toESM(require("node:os"));
var cpA = __toESM(require("node:child_process"));

export const UPDATE_STATE_FILE = pathA.join(osA.homedir(), ".opencode", "update", "state.json");
export const ROLLBACK_HINT = "如更新后有问题，可在源码仓库运行 npm run rollback（scripts/rollback-runtime.cjs）回到上一个版本。";
const VERSION_RE = /^v?(\d+(?:\.\d+){0,3})(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/;

export function parseVersion(v) {
  const m = VERSION_RE.exec(String(v ?? "").trim());
  if (!m) return null;
  return { nums: m[1].split(".").map(Number), pre: m[2] || "" };
}
// a<b → -1，a==b → 0，a>b → 1；无法解析的版本视为最小。
export function compareVersions(a, b) {
  const x = parseVersion(a), y = parseVersion(b);
  if (!x || !y) return !x && !y ? 0 : (!x ? -1 : 1);
  for (let i = 0; i < Math.max(x.nums.length, y.nums.length); i++) {
    const d = (x.nums[i] || 0) - (y.nums[i] || 0);
    if (d) return d < 0 ? -1 : 1;
  }
  if (x.pre === y.pre) return 0;
  if (!x.pre) return 1;
  if (!y.pre) return -1;
  const xp = x.pre.split("."), yp = y.pre.split(".");
  for (let i = 0; i < Math.max(xp.length, yp.length); i++) {
    if (xp[i] === void 0) return -1;
    if (yp[i] === void 0) return 1;
    const xn = /^\d+$/.test(xp[i]), yn = /^\d+$/.test(yp[i]);
    if (xn && yn) { const d = Number(xp[i]) - Number(yp[i]); if (d) return d < 0 ? -1 : 1; continue; }
    if (xn !== yn) return xn ? -1 : 1;
    if (xp[i] !== yp[i]) return xp[i] < yp[i] ? -1 : 1;
  }
  return 0;
}

export function classifySource(source) {
  const s = String(source ?? "").trim();
  if (!s) return { kind: "none" };
  if (/^https?:\/\/github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/i.test(s)) { const m = /github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/i.exec(s); return { kind: "github", repo: `${m[1]}/${m[2]}` }; }
  if (/^[A-Za-z0-9][\w.-]*\/[\w.-]+$/.test(s) && !/^\.\.?$/.test(s.split("/")[0])) return { kind: "github", repo: s };
  return { kind: "folder", dir: s };
}

// latest.json：{version, notes, url} 或 {version, notes, path}；path 可相对于该文件夹。
export function parseLatestJson(input, baseDir = "") {
  let data = input;
  if (typeof input === "string") { try { data = JSON.parse(input.replace(/^\uFEFF/, "")); } catch (e) { throw new Error(`latest.json 不是有效的 JSON：${e.message}`); } }
  if (!data || typeof data !== "object") throw new Error("latest.json 内容为空");
  const version = String(data.version ?? "").trim();
  if (!parseVersion(version)) throw new Error(`latest.json 的 version 无效：${version || "（空）"}`);
  const url = typeof data.url === "string" && /^https?:\/\//i.test(data.url.trim()) ? data.url.trim() : "";
  let file = typeof data.path === "string" && data.path.trim() ? data.path.trim() : "";
  if (file && baseDir && !pathA.isAbsolute(file) && !/^\\\\/.test(file)) file = pathA.join(baseDir, file);
  if (!url && !file) throw new Error("latest.json 需要 url 或 path 指向安装包");
  return { version: version.replace(/^v/, ""), notes: typeof data.notes === "string" ? data.notes : "", url, path: file };
}

export function parseGithubRelease(data) {
  if (!data || typeof data !== "object" || !data.tag_name) throw new Error("GitHub 返回的 release 缺少 tag_name");
  const version = String(data.tag_name).trim().replace(/^v/i, "");
  if (!parseVersion(version)) throw new Error(`release 版本号无法识别：${data.tag_name}`);
  const assets = Array.isArray(data.assets) ? data.assets.filter((a) => a && a.browser_download_url) : [];
  const rank = (n) => /\.(exe|msi)$/i.test(n) ? 0 : /\.(zip|7z)$/i.test(n) ? 1 : 2;
  assets.sort((a, b) => rank(String(a.name)) - rank(String(b.name)));
  return { version, notes: typeof data.body === "string" ? data.body : "", url: assets[0]?.browser_download_url || "", path: "", page: data.html_url || "" };
}

// 每天最多一次（按本地日期）。
export function shouldAutoCheck(lastCheckIso, now = new Date()) {
  if (!lastCheckIso) return true;
  const last = new Date(lastCheckIso);
  if (Number.isNaN(last.getTime())) return true;
  return last.toDateString() !== now.toDateString() && now.getTime() > last.getTime();
}

export async function fetchLatest(source, options = {}) {
  const src = classifySource(source);
  if (src.kind === "none") return null;
  if (src.kind === "github") {
    const fetchImpl = options.fetch || globalThis.fetch;
    const res = await fetchImpl(`https://api.github.com/repos/${src.repo}/releases/latest`, { headers: { "User-Agent": "OpenCode-Update-Check", Accept: "application/vnd.github+json" } });
    if (!res.ok) throw new Error(`GitHub releases 请求失败：HTTP ${res.status}`);
    return { ...parseGithubRelease(await res.json()), source: src };
  }
  const file = pathA.join(src.dir, "latest.json");
  const text = (options.readFile || ((p) => fsA.readFileSync(p, "utf8")))(file);
  return { ...parseLatestJson(text, src.dir), source: src };
}

function readState() { try { return JSON.parse(fsA.readFileSync(UPDATE_STATE_FILE, "utf8")); } catch { return {}; } }
function writeState(patch) { try { fsA.mkdirSync(pathA.dirname(UPDATE_STATE_FILE), { recursive: true }); fsA.writeFileSync(UPDATE_STATE_FILE, JSON.stringify({ ...readState(), ...patch }, null, 2)); } catch {} }

function runningVersion() {
  try {
    const ext = vscodeA.extensions?.getExtension?.("opencode.opencode") || (vscodeA.extensions?.all || []).find((e) => e?.packageJSON?.name === "opencode");
    return ext?.packageJSON?.version || "";
  } catch { return ""; }
}

let log = () => {};
let checking = null;
export async function checkForUpdates({ manual = false } = {}) {
  if (checking) return checking;
  checking = (async () => {
    const source = String(vscodeA.workspace.getConfiguration("opencode").get("update.source") || "").trim();
    if (!source) {
      if (manual) {
        const pick = await vscodeA.window.showInformationMessage("未设置更新来源（opencode.update.source）：可填 GitHub 仓库 owner/name，或包含 latest.json 的本地/共享文件夹。", "打开设置");
        if (pick === "打开设置") await vscodeA.commands.executeCommand("workbench.action.openSettings", "opencode.update.source");
      }
      return null;
    }
    const current = runningVersion();
    let latest;
    try { latest = await fetchLatest(source); }
    catch (error) {
      log(`[auto-update] 检查失败：${error?.message ?? error}`);
      if (manual) vscodeA.window.showWarningMessage(`检查更新失败：${error?.message ?? error}`);
      return null;
    } finally { writeState({ lastCheck: new Date().toISOString() }); }
    if (!latest || compareVersions(latest.version, current) <= 0) {
      if (manual) vscodeA.window.showInformationMessage(`OpenCode 已是最新版本（${current || "未知"}）。`);
      return latest;
    }
    void promptUpdate(latest, current);
    return latest;
  })();
  try { return await checking; } finally { checking = null; }
}

export function releaseNotesMarkdown(latest, current) {
  return [`# OpenCode ${latest.version}`, "", `当前版本：${current || "未知"}`, "", latest.notes ? latest.notes.trim() : "（发布方没有提供更新说明）", "", "---", "", ROLLBACK_HINT, "", latest.url ? `下载地址：${latest.url}` : latest.path ? `安装包：${latest.path}` : ""].join("\n");
}

async function promptUpdate(latest, current) {
  for (;;) {
    const pick = await vscodeA.window.showInformationMessage(`OpenCode 有新版本 ${latest.version}（当前 ${current || "未知"}）。`, "查看更新说明", "下载并安装", "稍后");
    if (pick === "查看更新说明") {
      const doc = await vscodeA.workspace.openTextDocument({ language: "markdown", content: releaseNotesMarkdown(latest, current) });
      await vscodeA.window.showTextDocument(doc, { preview: true });
      continue;
    }
    if (pick === "下载并安装") await downloadAndInstall(latest);
    return;
  }
}

async function downloadAndInstall(latest) {
  const dir = pathA.join(osA.tmpdir(), `opencode-update-${latest.version}`);
  fsA.mkdirSync(dir, { recursive: true });
  let file = "";
  try {
    await vscodeA.window.withProgress({ location: vscodeA.ProgressLocation.Notification, title: `正在获取 OpenCode ${latest.version}…` }, async () => {
      if (latest.url) {
        const name = decodeURIComponent(new URL(latest.url).pathname.split("/").pop() || "") || `opencode-${latest.version}.bin`;
        file = pathA.join(dir, name.replace(/[<>:"/\\|?*]/g, "_"));
        const res = await globalThis.fetch(latest.url, { headers: { "User-Agent": "OpenCode-Update-Check" }, redirect: "follow" });
        if (!res.ok) throw new Error(`下载失败：HTTP ${res.status}`);
        fsA.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      } else {
        file = pathA.join(dir, pathA.basename(latest.path));
        fsA.copyFileSync(latest.path, file);
      }
    });
  } catch (error) {
    vscodeA.window.showErrorMessage(`获取更新失败：${error?.message ?? error}`);
    return;
  }
  const runnable = /\.(exe|msi)$/i.test(file) && process.platform === "win32";
  const actions = runnable ? ["运行安装程序", "在文件夹中显示"] : ["在文件夹中显示"];
  const pick = await vscodeA.window.showInformationMessage(`安装包已保存到 ${file}。${runnable ? "运行前请先保存工作；" : "请解压/按说明手动安装；"}${ROLLBACK_HINT}`, { modal: true }, ...actions);
  if (pick === "运行安装程序") {
    const child = /\.msi$/i.test(file) ? cpA.spawn("msiexec", ["/i", file], { detached: true, stdio: "ignore" }) : cpA.spawn(file, [], { detached: true, stdio: "ignore", cwd: dir });
    child.on("error", (e) => vscodeA.window.showErrorMessage(`无法启动安装程序：${e.message}`));
    child.unref();
  } else if (pick === "在文件夹中显示") {
    await vscodeA.commands.executeCommand("revealFileInOS", vscodeA.Uri.file(file));
  }
}

let activated = false;
export function activateAutoUpdate(deps = {}) {
  if (activated) return; activated = true;
  log = (m) => { try { deps.log?.(m); } catch {} };
  vscodeA.commands.registerCommand("opencode.update.check", () => checkForUpdates({ manual: true }));
  const source = String(vscodeA.workspace.getConfiguration("opencode").get("update.source") || "").trim();
  if (!source || !shouldAutoCheck(readState().lastCheck)) return;
  const t = setTimeout(() => { void checkForUpdates({ manual: false }).catch(() => {}); }, 20000);
  t.unref?.();
}
