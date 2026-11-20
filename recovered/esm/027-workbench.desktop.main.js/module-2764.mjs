// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widgetHosts/viewPane/openCodeBridgeSessionView.ts
import { Codicon } from "./module-0085.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { BridgeTaskViewState, isBridgeTaskDisplayExpired, isBridgeTaskDisplayInactive, partitionBridgeTaskDisplay } from "./module-2763.mjs";
import { BridgeStatusRefresher } from "./module-2762.mjs";
import { $, EventHelper, EventType, addDisposableListener, append, clearNode, getWindow, setVisibility } from "./module-0075.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { Action, Separator } from "./module-0082.mjs";
import { localizeBridge } from "./module-2646.mjs";
import { BRIDGE_STARTUP_FAILURE_CHROME, bridgeStartupFailureCopy } from "./module-2687.mjs";
import { openBridgePage } from "./module-2761.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { describeBridgeStartupFailure } from "./module-2690.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IContextMenuService } from "./module-0488.mjs";


// src/vs/workbench/contrib/chat/browser/widgetHosts/viewPane/openCodeBridgeSessionView.ts
var BRIDGE_GET_STATUS3 = "opencode.bridge.getStatus";
var BRIDGE_START2 = "opencode.bridge.start";
var BRIDGE_STOP2 = "opencode.bridge.stop";
var BRIDGE_CHECK_HEALTH = "opencode.bridge.checkHealth";
var BRIDGE_CLEAR_ACTIVITY_LOG = "opencode.bridge.clearActivityLog";
var BRIDGE_CLEAR_TASKS_CONFIRMED = "opencode.bridge.clearTasksConfirmed";
var BRIDGE_COPY_TASK_PROMPT = "opencode.bridge.copyTaskPrompt";
var BRIDGE_DELETE_TASK_DISPLAY = "opencode.bridge.deleteTaskDisplay";
var BRIDGE_INTERRUPT_STALE_TASKS_CONFIRMED = "opencode.bridge.interruptStaleTasksConfirmed";
var BRIDGE_OPEN_RESOURCE = "opencode.bridge.openResource";
var BRIDGE_OPEN_DIFF = "opencode.bridge.openDiff";
var BRIDGE_OPEN_TERMINAL = "opencode.bridge.openTerminal";
function formatDuration4(durationMs) {
  if (durationMs === void 0) {
    return "";
  }
  if (durationMs < 1e3) {
    return `${durationMs} ms`;
  }
  return `${(durationMs / 1e3).toFixed(durationMs < 1e4 ? 1 : 0)} s`;
}
function formatTime(value2) {
  if (!value2) {
    return "";
  }
  const date = new Date(value2);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
function activityIcon(activity) {
  if (activity.status === "error") {
    return Codicon.error;
  }
  if (activity.status === "running") {
    return ThemeIcon.modify(Codicon.loading, "spin");
  }
  switch (activity.presentation?.kind) {
    case "files":
      return Codicon.files;
    case "search":
      return Codicon.search;
    case "edit":
      return Codicon.edit;
    case "terminal":
      return Codicon.terminal;
    case "diagnostics":
      return Codicon.warning;
    case "lsp":
      return Codicon.symbolMethod;
    default:
      switch (activity.tool) {
        case "start": return Codicon.plug ?? Codicon.tools;
        case "bridge_batch": return Codicon.layers ?? Codicon.tools;
        case "set_todos": case "update_plan": return Codicon.checklist ?? Codicon.tools;
        case "bridge_ask_user": return Codicon.commentDiscussion ?? Codicon.tools;
        case "list_skills": case "bridge_get_effective_rules": return Codicon.book ?? Codicon.tools;
        default: return Codicon.tools;
      }
  }
}
// ---- Bridge 侧栏可读性：命令人话化、发起方标签、筛选 ----
const OC_TOOL_LABELS = { start: "接入 Bridge", bridge_batch: "批量调用", set_todos: "更新任务卡", update_plan: "更新计划", report_progress: "汇报进度", bridge_ask_user: "向你提问", list_skills: "读取 Skills", get_command_output: "读取命令输出", cancel_command: "取消命令", send_command_input: "向命令发送输入", read_files: "读取文件", find_files: "查找文件", search_files: "搜索文本", apply_patch: "修改文件", write_file: "写入文件", list_directory: "列出目录", get_diagnostics: "检查问题", bridge_get_effective_rules: "读取规则", configure_mcp: "配置 MCP" };
const OC_GIT_SUB = { log: "查看提交记录", status: "查看仓库状态", diff: "查看改动", show: "查看提交", add: "暂存文件", commit: "提交", push: "推送", pull: "拉取", fetch: "获取远端", checkout: "切换分支", switch: "切换分支", branch: "查看分支", clone: "克隆仓库", stash: "暂存工作区", reset: "重置", restore: "还原文件", rev_parse: "查询版本", ls_files: "列出受控文件", blame: "查看逐行作者", merge: "合并", rebase: "变基", tag: "标签", remote: "远端设置" };
function ocBase(p) { const s = String(p || "").replace(/^["']|["']$/g, "").replace(/[\\/]+$/, ""); const m = s.split(/[\\/]/); return m[m.length - 1] || s; }
function ocSplitCommand(cmd) {
  const segs = ocP44SplitHeredoc(cmd).head.split(/\s*(?:&&|\|\||;|\n)\s*/).map((s) => s.trim()).filter(Boolean);
  let folder;
  const rest = [];
  for (const seg of segs) {
    const cd = /^(?:cd|Set-Location|pushd)\s+(?:\/d\s+)?(.+)$/i.exec(seg);
    if (cd && !rest.length) { folder = ocBase(cd[1]); continue; }
    rest.push(seg);
  }
  return { folder, segs: rest };
}
function ocArgFile(words) { const f = words.slice(1).filter((w) => !w.startsWith("-") && !/^\d+$/.test(w)).pop(); return f ? ocBase(f) : ""; }
function ocDescribeSegment(seg) {
  const first = seg.split("|")[0].trim();
  const words = first.match(/"[^"]*"|'[^']*'|\S+/g) || [];
  let prog = ocBase(words[0] || "").replace(/\.(exe|cmd|bat|ps1)$/i, "").toLowerCase();
  if ((prog === "powershell" || prog === "pwsh") && words.length > 2) return "运行 PowerShell 命令";
  if (prog === "sudo" || prog === "env") { words.shift(); prog = ocBase(words[0] || "").toLowerCase(); }
  const two = (label) => { const f = ocArgFile(words); return f ? `${label} · ${f}` : label; };
  switch (prog) {
    case "git": { const sub = (words.find((w, i) => i > 0 && !w.startsWith("-")) || "").replace(/-/g, "_"); return "Git · " + (OC_GIT_SUB[sub] || sub || "命令"); }
    case "node": case "nodejs": case "tsx": case "deno": case "bun": { const f = ocArgFile(words); return words[1] === "--check" ? `语法检查 · ${f}` : f ? `运行脚本 · ${f}` : "运行 Node"; }
    case "python": case "python3": case "py": return two("运行 Python");
    case "npm": case "pnpm": case "yarn": case "npx": { const sub = words[1] || ""; if (/^(i|install|add|ci)$/.test(sub)) return "安装依赖"; if (sub === "run") return `运行 ${prog} 脚本 · ${words[2] || ""}`; return `${prog} ${sub}`.trim(); }
    case "cat": case "head": case "tail": case "less": case "more": case "type": case "get-content": case "gc": return two("查看文件");
    case "grep": case "rg": case "egrep": case "findstr": case "select-string": case "sls": { const pat = words.slice(1).find((w) => !w.startsWith("-")); return pat ? `搜索文本 · ${pat.replace(/^["']|["']$/g, "").slice(0, 40)}` : "搜索文本"; }
    case "find": case "where": case "which": return "查找文件";
    case "ls": case "dir": case "get-childitem": case "gci": case "tree": return two("列出目录");
    case "cp": case "copy": case "copy-item": case "xcopy": case "robocopy": return two("复制文件");
    case "mv": case "move": case "move-item": case "ren": case "rename": return two("移动 / 重命名");
    case "rm": case "del": case "rmdir": case "rd": case "remove-item": return two("删除");
    case "mkdir": case "md": case "new-item": return two("新建");
    case "echo": case "write-output": case "write-host": case "printf": return "输出文本";
    case "curl": case "wget": case "invoke-webrequest": case "iwr": case "invoke-restmethod": case "irm": return "网络请求";
    case "kill": case "taskkill": case "stop-process": case "pkill": return "结束进程";
    case "ps": case "tasklist": case "get-process": case "netstat": return "查看进程 / 端口";
    case "md5sum": case "sha256sum": case "sha1sum": case "get-filehash": case "certutil": return two("计算校验值");
    case "tar": case "zip": case "unzip": case "7z": case "gzip": case "expand-archive": case "compress-archive": return two("压缩 / 解压");
    case "sleep": case "start-sleep": case "timeout": return "等待";
    case "wc": return two("统计行数");
    case "sed": case "awk": return two("处理文本");
    case "for": case "while": case "foreach": case "foreach-object": return "批量执行";
    case "test": case "[": case "test-path": return "检查文件是否存在";
    case "start": case "start-process": return two("启动程序");
    default: return prog ? `运行命令 · ${prog}` : "运行命令";
  }
}
function ocHumanizeActivity(activity, presentation2) {
  const tool = activity.tool || "";
  if (presentation2.kind === "terminal" && tool === "run_command") {
    const raw = presentation2.command || presentation2.title || "";
    const { folder, segs } = ocSplitCommand(raw);
    const main = segs.length ? ocDescribeSegment(segs[0]) : folder ? "切换目录" : "运行命令";
    const title = segs.length > 1 && main !== "批量执行" ? `${main} 等 ${segs.length} 步` : main;
    const sub = presentation2.subtitle ? String(presentation2.subtitle).split(" \xB7 ").filter((p) => !/^OpenCode(\s*·.*)?$/i.test(p) && !/^\d+$/.test(p) && p !== "running") : [];
    const parts = [folder, ...sub.filter((p) => !/^[A-Za-z]:[\\/]|^\//.test(p)).map((p) => p.replace(/^exit (\d+)$/, (_, c) => c === "0" ? "" : `退出码 ${c}`).replace(/^failed$/, "失败"))].filter(Boolean);
    return { title, subtitle: [...new Set(parts)].join(" \xB7 ") || void 0, command: raw };
  }
  let title = presentation2.title || tool;
  if (title === tool && OC_TOOL_LABELS[tool]) title = OC_TOOL_LABELS[tool];
  title = String(title).replace(/^Read command output$/, "读取命令输出").replace(/^Command output \xB7 exit (\d+)$/, "读取命令输出 · 退出码 $1").replace(/^Read (\d+|workspace) files?$/, (_, n) => n === "workspace" ? "读取文件" : `读取 ${n} 个文件`).replace(/^Read (.+)$/, (_, f) => `读取 · ${ocBase(f)}`).replace(/^Found (\d+) files?$/, "找到 $1 个文件").replace(/^Searched \u201C(.*)\u201D$/, "搜索 · $1").replace(/^Searched workspace$/, "搜索工作区").replace(/^Read command output$/, "读取命令输出").replace(/^(.+) running$/, (_, t) => (OC_TOOL_LABELS[t] || t) + "…");
  return { title, subtitle: presentation2.subtitle, command: void 0 };
}
function ocActorOf(activity) {
  const a = activity.actor;
  if (a && typeof a.label === "string") return { kind: a.kind === "local" ? "local" : a.kind === "user" ? "user" : "remote", id: String(a.id || a.label), label: a.label, client: a.client };
  return { kind: "unknown", id: "unknown", label: "来源未记录" };
}
function ocActorHue(id) { let h = 0; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) % 360; return h; }
const OC_BRIDGE_FILTER_KEY = "opencode.bridge.activityFilter";
function ocLoadFilter() { try { const v = JSON.parse(globalThis.localStorage?.getItem(OC_BRIDGE_FILTER_KEY) || "{}"); return { actor: typeof v.actor === "string" ? v.actor : "all", failedOnly: v.failedOnly === true }; } catch { return { actor: "all", failedOnly: false }; } }
function ocSaveFilter(f) { try { globalThis.localStorage?.setItem(OC_BRIDGE_FILTER_KEY, JSON.stringify(f)); } catch { } }
const OC_BRIDGE_CSS = `
.opencode-bridge-session-view .oc-bridge-filter{position:sticky;top:0;z-index:2;display:flex;flex-wrap:wrap;gap:4px;padding:6px 2px 8px;background:var(--vscode-sideBar-background);border-bottom:1px solid var(--vscode-widget-border,transparent);margin-bottom:6px}
.opencode-bridge-session-view .oc-bridge-chip{display:inline-flex;align-items:center;gap:5px;height:22px;padding:0 8px;border-radius:11px;border:1px solid var(--vscode-widget-border,rgba(128,128,128,.35));background:transparent;color:var(--vscode-foreground);font-size:11px;cursor:pointer;transition:background-color .12s ease,border-color .12s ease,color .12s ease}
.opencode-bridge-session-view .oc-bridge-chip:hover{background:var(--vscode-toolbar-hoverBackground)}
.opencode-bridge-session-view .oc-bridge-chip.active{background:var(--vscode-button-background);border-color:var(--vscode-button-background);color:var(--vscode-button-foreground)}
.opencode-bridge-session-view .oc-bridge-chip .oc-count{opacity:.75;font-variant-numeric:tabular-nums}
.opencode-bridge-session-view .oc-bridge-chip.failed:not(.active){color:var(--vscode-errorForeground)}
.opencode-bridge-session-view .oc-actor-dot{width:7px;height:7px;border-radius:50%;flex:none;background:hsl(var(--oc-hue,210) 60% 58%)}
.opencode-bridge-session-view .oc-actor-tag{display:inline-flex;align-items:center;gap:4px;font-size:10px;line-height:16px;padding:0 6px;border-radius:8px;margin-right:6px;white-space:nowrap;color:hsl(var(--oc-hue,210) 55% 70%);background:hsla(var(--oc-hue,210),60%,55%,.14);vertical-align:1px}
.opencode-bridge-session-view .oc-actor-tag.kind-local{--oc-hue:205}
.opencode-bridge-session-view .oc-actor-tag.kind-unknown{--oc-hue:0;filter:grayscale(1);opacity:.75}
.opencode-bridge-session-view .opencode-bridge-tool-card{border-left:2px solid transparent;transition:background-color .12s ease,border-color .12s ease}
.opencode-bridge-session-view .opencode-bridge-tool-card.state-error{border-left-color:var(--vscode-errorForeground)}
.opencode-bridge-session-view .opencode-bridge-tool-card.state-running{border-left-color:var(--vscode-progressBar-background)}
.opencode-bridge-session-view .oc-repeat{font-size:10px;padding:0 5px;border-radius:7px;margin-left:6px;background:var(--vscode-badge-background);color:var(--vscode-badge-foreground)}
.opencode-bridge-session-view .oc-cmd{position:relative;margin:4px 0 6px;padding:6px 52px 6px 8px;border-radius:4px;background:var(--vscode-textCodeBlock-background);font-family:var(--vscode-editor-font-family);font-size:11px;white-space:pre-wrap;word-break:break-all;max-height:160px;overflow:auto}
.opencode-bridge-session-view .oc-cmd-copy{position:absolute;top:4px;right:4px;font-size:10px;padding:1px 6px;border-radius:3px;border:1px solid var(--vscode-widget-border,rgba(128,128,128,.35));background:var(--vscode-button-secondaryBackground);color:var(--vscode-button-secondaryForeground);cursor:pointer}
.opencode-bridge-session-view .oc-stats-line{font-size:11px;opacity:.85;font-variant-numeric:tabular-nums;padding:2px 0}
.opencode-bridge-session-view .oc-stats-line .oc-bad{color:var(--vscode-errorForeground)}
.opencode-bridge-session-view .oc-bridge-empty-filter{padding:16px 8px;opacity:.7;font-size:12px;text-align:center}
/* OpenCode chat-split: 对话列表页 / 独立对话页（黄=回复中，绿=已完成，红=出错） */
.opencode-bridge-session-view .oc-conv-list{display:flex;flex-direction:column;gap:6px;padding:4px 2px 8px}
.opencode-bridge-session-view .oc-conv-list-heading{display:flex;align-items:center;gap:6px;font-size:11px;opacity:.8;padding:2px 2px 4px;font-variant-numeric:tabular-nums}
.opencode-bridge-session-view .oc-conv-list-heading .oc-conv-sum{display:inline-flex;align-items:center;gap:3px}
.opencode-bridge-session-view .oc-conv-row{position:relative;display:flex;flex-direction:column;gap:3px;padding:7px 10px 7px 12px;border-radius:6px;border:1px solid var(--vscode-widget-border,rgba(128,128,128,.25));border-left:3px solid var(--oc-conv-color);background:color-mix(in srgb,var(--oc-conv-color) 10%,transparent);cursor:pointer;outline:none;transition:background-color .12s ease}
.opencode-bridge-session-view .oc-conv-row:hover{background:color-mix(in srgb,var(--oc-conv-color) 18%,transparent)}
.opencode-bridge-session-view .oc-conv-row:focus-visible{box-shadow:0 0 0 1px var(--vscode-focusBorder)}
.opencode-bridge-session-view .oc-conv-line{display:flex;align-items:center;gap:6px;min-width:0}
.opencode-bridge-session-view .oc-conv-dot{width:8px;height:8px;border-radius:50%;flex:none;background:var(--oc-conv-color)}
.opencode-bridge-session-view .oc-conv-running .oc-conv-dot{animation:oc-conv-pulse 1.2s ease-in-out infinite}
@keyframes oc-conv-pulse{0%,100%{opacity:1}50%{opacity:.35}}
.opencode-bridge-session-view .oc-conv-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600;font-size:12px}
.opencode-bridge-session-view .oc-conv-pill{flex:none;font-size:10px;line-height:16px;padding:0 6px;border-radius:8px;color:var(--oc-conv-color);background:color-mix(in srgb,var(--oc-conv-color) 18%,transparent);border:1px solid color-mix(in srgb,var(--oc-conv-color) 45%,transparent)}
.opencode-bridge-session-view .oc-conv-time{flex:none;font-size:10px;opacity:.65;font-variant-numeric:tabular-nums}
.opencode-bridge-session-view .oc-conv-meta{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;font-size:11px;opacity:.85;min-width:0}
.opencode-bridge-session-view .oc-conv-meta .oc-bad{color:var(--vscode-errorForeground)}
.opencode-bridge-session-view .oc-conv-step{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;opacity:.8}
.opencode-bridge-session-view .oc-conv-chevron{position:absolute;right:8px;top:50%;transform:translateY(-50%);opacity:.45}
.opencode-bridge-session-view .oc-conv-row{padding-right:26px}
.opencode-bridge-session-view .oc-conv-header{position:sticky;top:0;z-index:3;display:flex;align-items:center;gap:8px;padding:6px 6px 6px 2px;margin:0 0 6px;background:linear-gradient(color-mix(in srgb,var(--oc-conv-color) 12%,transparent),color-mix(in srgb,var(--oc-conv-color) 12%,transparent)),var(--vscode-sideBar-background);border-bottom:2px solid var(--oc-conv-color)}
.opencode-bridge-session-view .oc-conv-back{flex:none;display:inline-flex;align-items:center;gap:2px;height:22px;padding:0 8px 0 4px;border-radius:4px;border:1px solid var(--vscode-widget-border,rgba(128,128,128,.35));background:var(--vscode-button-secondaryBackground,transparent);color:var(--vscode-button-secondaryForeground,var(--vscode-foreground));font-size:11px;cursor:pointer}
.opencode-bridge-session-view .oc-conv-back:hover{background:var(--vscode-button-secondaryHoverBackground,var(--vscode-toolbar-hoverBackground))}
.opencode-bridge-session-view .oc-conv-header .oc-conv-title{font-size:12px}
.opencode-bridge-session-view .oc-conv-page .oc-bridge-filter{position:static}
.opencode-bridge-session-view .oc-conv-page-meta{font-size:11px;opacity:.85;padding:0 2px 6px}
`;
function ocEnsureBridgeStyle(doc) {
  if (!doc) return;
  if (!doc.getElementById("oc-bridge-readable-css")) {
    const style = doc.createElement("style");
    style.id = "oc-bridge-readable-css";
    style.textContent = OC_BRIDGE_CSS;
    doc.head.appendChild(style);
  }
  // OpenCode p39: VS Code 原生视图样式（任务架 / 活动 / 底部状态），排在后面以覆盖旧样式。
  if (!doc.getElementById("oc-p39-native-css")) {
    const style = doc.createElement("style");
    style.id = "oc-p39-native-css";
    style.textContent = OC_P39_CSS;
    doc.head.appendChild(style);
  }
  // OpenCode p44: 任务面板改进样式（状态色、分组、分段筛选、停止按钮红色、悬停稳定）。
  if (!doc.getElementById("oc-p44-css")) {
    const style = doc.createElement("style");
    style.id = "oc-p44-css";
    style.textContent = OC_P44_CSS;
    doc.head.appendChild(style);
  }
}
const OC_P39_CSS = `
/* OpenCode p39-p41: 任务架 / Bridge 活动 / 底部状态 —— VS Code 原生视图样式（仅主题变量，无圆角卡片/阴影/彩色胶囊） */
.opencode-bridge-task-shelf.oc-p39,.opencode-bridge-session-view.oc-p39{font-family:var(--vscode-font-family);font-size:var(--vscode-font-size,13px);color:var(--vscode-foreground)}
.oc-p39 [hidden]{display:none!important}
/* p43: 辅助栏视图标题被右侧图标挤成约 3px 的一条缝；页签已显示名称，隐藏重复标题 */
.monaco-workbench .part.auxiliarybar.pane-composite-part > .composite.title > .title-label{display:none!important}
.oc-p39 .oc-p39-twistie{flex:none;width:16px;height:22px;display:inline-flex!important;align-items:center;justify-content:center;font-size:16px;color:var(--vscode-icon-foreground,var(--vscode-foreground));transition:transform .1s ease}
.oc-p39 .oc-p39-icon{flex:none;width:16px;display:inline-flex!important;align-items:center;justify-content:center;font-size:16px}
.oc-p39 .oc-p39-badge{flex:none;display:inline-block;box-sizing:border-box;min-width:18px;height:18px;line-height:18px;padding:0 5px;border-radius:11px;font-size:11px;font-weight:400;text-align:center;text-transform:none;font-variant-numeric:tabular-nums;background:var(--vscode-badge-background);color:var(--vscode-badge-foreground)}
/* ---- p39 任务架：窗格标题 + 树行 ---- */
.opencode-bridge-task-shelf.oc-p39{border:0!important;border-radius:0!important;box-shadow:none!important;background:transparent!important;margin:0!important;padding:0!important;gap:0!important;overflow:hidden}
.opencode-bridge-task-shelf.oc-p39 .opencode-bridge-task-shelf-heading{display:flex!important;align-items:center;gap:2px;height:22px;min-height:22px;box-sizing:border-box;padding:0 8px 0 2px!important;margin:0!important;border:0!important;border-top:1px solid var(--vscode-sideBarSectionHeader-border,transparent)!important;border-radius:0!important;background:var(--vscode-sideBarSectionHeader-background,transparent)!important;color:var(--vscode-sideBarSectionHeader-foreground,var(--vscode-foreground));cursor:pointer!important;user-select:none;box-shadow:none!important}
.opencode-bridge-task-shelf.oc-p39 .opencode-bridge-task-shelf-heading:focus-within{outline:1px solid var(--vscode-focusBorder);outline-offset:-1px}
.opencode-bridge-task-shelf.oc-p39 .opencode-bridge-task-shelf-heading>strong{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;font-weight:700;line-height:22px;text-transform:uppercase;color:inherit}
.opencode-bridge-task-shelf.oc-p39 .opencode-bridge-task-shelf-toggle{order:-1;flex:none;width:20px!important;height:22px!important;min-width:0!important;padding:0!important;margin:0!important;border:0!important;border-radius:0!important;background:transparent!important;color:inherit!important;box-shadow:none!important;display:inline-flex;align-items:center;justify-content:center;font-size:16px!important;outline:0}
.opencode-bridge-task-shelf.oc-p39 .opencode-bridge-task-shelf-body{padding:0!important;margin:0!important;border:0!important;background:transparent!important}
.opencode-bridge-task-shelf.oc-p39 .opencode-bridge-session-todos-region{padding:0!important;margin:0!important;gap:0!important;border:0!important;background:transparent!important}
.oc-p39 details.opencode-bridge-task-group{margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}
.oc-p39 summary.opencode-task-group-heading{list-style:none;display:flex!important;align-items:center;gap:6px;height:22px;min-height:22px;line-height:22px;box-sizing:border-box;padding:0 8px 0 10px!important;margin:0!important;border:0!important;border-radius:0!important;background:transparent!important;color:var(--vscode-foreground)!important;font-size:inherit!important;font-weight:400!important;cursor:pointer;outline:0;user-select:none}
.oc-p39 summary.opencode-task-group-heading::-webkit-details-marker,.oc-p39 .opencode-bridge-task-card>summary::-webkit-details-marker{display:none}
.oc-p39 summary.opencode-task-group-heading::after,.oc-p39 summary.opencode-task-group-heading::before{display:none!important;content:none!important}
.oc-p39 summary.opencode-task-group-heading:hover,.oc-p39 .opencode-bridge-task-card>summary:hover{background:var(--vscode-list-hoverBackground)!important}
.oc-p39 summary.opencode-task-group-heading:focus-visible,.oc-p39 .opencode-bridge-task-card>summary:focus-visible{outline:1px solid var(--vscode-list-focusOutline,var(--vscode-focusBorder));outline-offset:-1px}
.oc-p39 details[open]>summary>.oc-p39-twistie{transform:rotate(90deg)}
.oc-p39 .opencode-task-group-dot{display:none!important}
.oc-p39 .opencode-task-group-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:inherit!important;font-weight:400!important}
.oc-p39 .opencode-task-group-count{display:none!important}
.oc-p39 [data-task-group="running"]>summary .oc-p39-icon{color:var(--vscode-charts-yellow)}
.oc-p39 [data-task-group="unfinished"]>summary .oc-p39-icon{color:var(--vscode-errorForeground)}
.oc-p39 [data-task-group="completed"]>summary .oc-p39-icon{color:var(--vscode-testing-iconPassed)}
/* OpenCode p42: 空分组隐藏折叠箭头，计数徽标变淡 */
.oc-p39 details.oc-p42-empty>summary>.oc-p39-twistie{visibility:hidden}
.oc-p39 details.oc-p42-empty>summary .oc-p39-badge{opacity:.6}
.oc-p39 .oc-p39-group-empty{height:22px;line-height:22px;padding-left:48px;color:var(--vscode-descriptionForeground);font-style:italic}
.oc-p39 details.opencode-bridge-task-card{margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}
.oc-p39 .opencode-bridge-task-card>summary{list-style:none;position:relative;display:flex!important;flex-wrap:nowrap!important;align-items:center;gap:6px;height:22px!important;min-height:22px!important;line-height:22px;box-sizing:border-box;padding:0 8px 0 26px!important;margin:0!important;border:0!important;border-radius:0!important;background:transparent!important;cursor:pointer;overflow:hidden;outline:0}
.oc-p39 .opencode-bridge-task-card>summary .opencode-bridge-todos-icon{display:none!important}
.oc-p39 .opencode-bridge-task-card>summary .opencode-bridge-task-summary-labels{display:flex!important;flex:0 1 auto;min-width:0;overflow:hidden;align-items:center;gap:0;margin:0!important;padding:0!important}
.oc-p39 .opencode-bridge-task-card>summary .opencode-bridge-task-title{display:block!important;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:400!important;font-size:inherit!important;color:var(--vscode-foreground)!important;line-height:22px!important;margin:0!important}
.oc-p39 .opencode-bridge-task-card>summary .opencode-bridge-task-state-pill{display:inline!important;margin:0 0 0 .5em!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;color:inherit!important;opacity:.7;font-size:.9em!important;font-weight:400!important}
.oc-p39 .opencode-bridge-task-card>summary .opencode-bridge-task-summary-detail{display:block!important;flex:1 1 0;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin:0 0 0 .5em!important;padding:0!important;color:inherit!important;font-size:.9em!important;line-height:22px!important;opacity:.7!important}
.oc-p39 .opencode-bridge-task-card>summary .opencode-bridge-task-pill{flex:none;display:inline!important;margin:0 0 0 auto!important;padding:0 0 0 6px!important;border:0!important;border-radius:0!important;background:transparent!important;color:inherit!important;opacity:.7;font-size:.9em!important;font-weight:400!important;font-variant-numeric:tabular-nums}
.oc-p39 .opencode-bridge-task-card>summary:hover .opencode-bridge-task-pill,.oc-p39 .opencode-bridge-task-card>summary:focus-within .opencode-bridge-task-pill{display:none!important}
.oc-p39 .oc-p39-inline-actions{display:none;flex:none;align-items:center;gap:2px;margin-left:auto}
.oc-p39 .opencode-bridge-task-card>summary:hover .oc-p39-inline-actions,.oc-p39 .opencode-bridge-task-card>summary:focus-within .oc-p39-inline-actions{display:flex}
.oc-p39 .oc-p39-action{flex:none;width:22px;height:22px;min-width:0;display:inline-flex!important;align-items:center;justify-content:center;padding:0!important;margin:0!important;border:0!important;border-radius:5px;background:transparent!important;color:var(--vscode-icon-foreground,var(--vscode-foreground))!important;cursor:pointer;font-size:16px;outline:0}
.oc-p39 .oc-p39-action:hover{background:var(--vscode-toolbar-hoverBackground)!important}
.oc-p39 .oc-p39-action:focus-visible{outline:1px solid var(--vscode-focusBorder);outline-offset:-1px}
.oc-p39 .opencode-bridge-task-card .opencode-bridge-todos-body{padding:0!important;margin:0!important;border:0!important;background:transparent!important;gap:0!important;display:block!important}
.oc-p39 .opencode-bridge-task-card .opencode-bridge-task-current{display:none!important;align-items:center;gap:6px;height:22px;min-height:22px;box-sizing:border-box;padding:0 8px 0 42px!important;margin:0!important;border:0!important;border-radius:0!important;background:transparent!important;overflow:hidden}
.oc-p39 .opencode-bridge-task-card .opencode-bridge-task-current-body{display:flex!important;flex-direction:row!important;align-items:baseline;gap:.5em;min-width:0;overflow:hidden;white-space:nowrap}
.oc-p39 .opencode-bridge-task-card .opencode-bridge-task-current-eyebrow{display:none!important}
.oc-p39 .opencode-bridge-task-card .opencode-bridge-task-current-title{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;font-weight:400!important;font-size:inherit!important;color:var(--vscode-foreground)!important}
.oc-p39 .opencode-bridge-task-card .opencode-bridge-task-current-meta{flex:1 1 0;min-width:0;overflow:hidden;text-overflow:ellipsis;color:var(--vscode-descriptionForeground)!important;font-size:.9em!important}
.oc-p39 .opencode-bridge-task-card .opencode-bridge-todo{display:flex!important;align-items:center;gap:6px;height:22px;min-height:22px;box-sizing:border-box;padding:0 8px 0 42px!important;margin:0!important;border:0!important;border-radius:0!important;background:transparent!important}
.oc-p39 .opencode-bridge-task-card .opencode-bridge-todo:hover{background:var(--vscode-list-hoverBackground)!important}
.oc-p39 .opencode-bridge-task-card .opencode-bridge-todo-step-index{display:none!important}
.oc-p39 .opencode-bridge-task-card .opencode-bridge-todo-icon,.oc-p39 .opencode-bridge-task-card .opencode-bridge-task-current-icon{flex:none;width:16px;font-size:16px;display:inline-flex!important;justify-content:center}
.oc-p39 .opencode-bridge-task-card .opencode-bridge-todo.completed .opencode-bridge-todo-icon{color:var(--vscode-testing-iconPassed)!important}
.oc-p39 .opencode-bridge-task-card .opencode-bridge-todo-labels{min-width:0;overflow:hidden}
.oc-p39 .opencode-bridge-task-card .opencode-bridge-todo-title{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:inherit!important}
.oc-p39 .opencode-bridge-task-card .opencode-bridge-todo.completed .opencode-bridge-todo-title{color:var(--vscode-descriptionForeground)!important;text-decoration:none!important}
/* ---- p40 活动区：筛选框 + 分区 + 22px 行 ---- */
.opencode-bridge-session-view.oc-p39 .oc-p40-filter{flex:none;display:flex;align-items:center;padding:4px 8px 4px 8px;border:0;background:transparent}
.oc-p39 .oc-p40-filter-box{flex:1;min-width:0;display:flex;align-items:center;height:24px;box-sizing:border-box;background:var(--vscode-input-background);color:var(--vscode-input-foreground);border:1px solid var(--vscode-input-border,transparent);border-radius:2px}
.oc-p39 .oc-p40-filter-box:focus-within{border-color:var(--vscode-focusBorder)}
.oc-p39 .oc-p40-filter-input{flex:1;min-width:0;height:22px;box-sizing:border-box;padding:0 6px;border:0;outline:0;background:transparent;color:inherit;font-family:inherit;font-size:var(--vscode-font-size,13px)}
.oc-p39 .oc-p40-filter-input::placeholder{color:var(--vscode-input-placeholderForeground)}
.oc-p39 .oc-p40-filter-select{flex:none;max-width:45%;height:20px;margin-right:2px;padding:0 2px 0 6px;border:0;border-left:1px solid var(--vscode-input-border,var(--vscode-widget-border,transparent));outline:0;background:transparent;color:var(--vscode-descriptionForeground);font-family:inherit;font-size:12px;cursor:pointer}
.oc-p39 .oc-p40-filter-select option{background:var(--vscode-dropdown-background);color:var(--vscode-dropdown-foreground)}
.oc-p39 .oc-p40-filter-icon{flex:none;width:22px;display:inline-flex!important;align-items:center;justify-content:center;font-size:16px;color:var(--vscode-descriptionForeground)}
.oc-p39 .oc-p40-filter-box.active .oc-p40-filter-icon{color:var(--vscode-inputOption-activeForeground,var(--vscode-foreground))}
.opencode-bridge-session-view.oc-p39 .opencode-bridge-session-timeline{padding:0!important;gap:0!important;display:block!important}
.oc-p39 .oc-p40-section-head{display:flex;align-items:center;gap:2px;height:22px;line-height:22px;box-sizing:border-box;padding:0 8px 0 2px;cursor:pointer;user-select:none;outline:0;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--vscode-foreground)}
.oc-p39 .oc-p40-section-head:hover{background:var(--vscode-list-hoverBackground)}
.oc-p39 .oc-p40-section-head:focus{outline:1px solid var(--vscode-list-focusOutline,var(--vscode-focusBorder));outline-offset:-1px}
.oc-p39 .oc-p40-section-head .oc-p40-section-label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.oc-p39 .oc-p40-section-failed>.oc-p40-section-head .oc-p40-section-label{color:var(--vscode-errorForeground)}
.oc-p39 .oc-p40-row{display:flex;align-items:center;gap:6px;height:22px;line-height:22px;box-sizing:border-box;padding:0 8px 0 10px;cursor:pointer;white-space:nowrap;overflow:hidden;outline:0;color:var(--vscode-foreground)}
.oc-p39 .oc-p40-row .oc-p39-twistie{margin-right:-4px}
.oc-p39 .oc-p40-row:hover{background:var(--vscode-list-hoverBackground)}
.oc-p39 .oc-p40-row[aria-expanded="true"]{background:var(--vscode-list-inactiveSelectionBackground);color:var(--vscode-list-inactiveSelectionForeground,var(--vscode-foreground))}
.oc-p39 .oc-p40-row:focus{outline:1px solid var(--vscode-list-focusOutline,var(--vscode-focusBorder));outline-offset:-1px}
.oc-p39 .oc-p40-row[aria-expanded="true"]:focus{background:var(--vscode-list-activeSelectionBackground);color:var(--vscode-list-activeSelectionForeground,var(--vscode-foreground))}
.oc-p39 .oc-p40-row.state-completed .oc-p39-icon{color:var(--vscode-testing-iconPassed)}
.oc-p39 .oc-p40-row.state-error .oc-p39-icon{color:var(--vscode-testing-iconFailed,var(--vscode-errorForeground))}
.oc-p39 .oc-p40-row.state-progress .oc-p39-icon{color:var(--vscode-descriptionForeground)}
.oc-p39 .oc-p40-label{flex:0 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis}
.oc-p39 .oc-p40-target{margin-left:.6em}
/* OpenCode p42: 说明列至少留 3.5em，避免被挤成「O..」；客户端下拉加左内边距 */
.oc-p39 .oc-p40-desc{flex:1 1 0;min-width:3.5em;overflow:hidden;text-overflow:ellipsis;margin-left:.2em;font-size:.9em;opacity:.7}
.oc-p39 .oc-p40-dur{flex:none;margin-left:auto;padding-left:6px;font-size:.9em;font-variant-numeric:tabular-nums;opacity:.7}
.oc-p39 .oc-p40-detail{margin:0 0 4px 0;padding:4px 8px 6px 46px;border:0;background:transparent;font-size:12px;color:var(--vscode-foreground);cursor:auto}
.oc-p39 .oc-p40-detail-meta{color:var(--vscode-descriptionForeground);line-height:18px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.oc-p39 .oc-p40-detail-label{margin-top:4px;line-height:18px;font-size:11px;font-weight:700;text-transform:uppercase;color:var(--vscode-descriptionForeground)}
.oc-p39 .oc-p40-pre{margin:0;padding:4px 6px;max-height:180px;overflow:auto;white-space:pre-wrap;word-break:break-all;font-family:var(--vscode-editor-font-family);font-size:var(--vscode-editor-font-size,12px);line-height:1.4;background:var(--vscode-textCodeBlock-background,transparent);color:var(--vscode-foreground);border:0;border-radius:0;user-select:text}
.oc-p39 .oc-p40-pre.error{color:var(--vscode-errorForeground)}
.oc-p39 .oc-p40-detail-actions{display:flex;gap:12px;margin-top:4px}
.oc-p39 .oc-p40-link{padding:0;border:0;background:transparent;color:var(--vscode-textLink-foreground);font:inherit;cursor:pointer}
.oc-p39 .oc-p40-link:hover{color:var(--vscode-textLink-activeForeground);text-decoration:underline}
.oc-p39 .oc-p40-detail .opencode-bridge-tool-items,.oc-p39 .oc-p40-detail .opencode-bridge-mini-diff{margin-top:4px}
.oc-p39 .oc-p40-conv-head{display:flex;white-space:nowrap;overflow:hidden;align-items:center;gap:4px;height:24px;padding:0 8px 0 4px;border-bottom:1px solid var(--vscode-sideBarSectionHeader-border,var(--vscode-widget-border,transparent))}
.oc-p39 .oc-p40-conv-head .oc-p40-label{font-weight:600}
.oc-p39 .oc-p40-empty{padding:8px 20px;line-height:18px;color:var(--vscode-descriptionForeground)}
/* ---- p41 底部紧凑状态 ---- */
.opencode-bridge-session-view.oc-p39 .opencode-bridge-session-footer{display:block!important;flex:none;margin:0!important;padding:3px 8px 5px 10px!important;border:0!important;border-top:1px solid var(--vscode-sideBarSectionHeader-border,var(--vscode-panel-border,transparent))!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;font-size:12px}
.oc-p39 .opencode-bridge-session-connection-row{display:block!important;margin:0!important;padding:0!important;gap:0!important;border:0!important;background:transparent!important}
.oc-p39 .opencode-bridge-session-connection-header{display:flex!important;align-items:center;gap:6px;height:22px;min-height:22px;margin:0!important;padding:0!important}
.oc-p39 .opencode-bridge-session-connection-info{display:flex!important;flex-direction:row!important;align-items:center;flex:1;min-width:0;gap:8px;margin:0!important}
.oc-p39 .opencode-bridge-session-connection-heading{display:flex!important;align-items:center;gap:6px;min-width:0;flex:0 1 auto;overflow:hidden}
.oc-p39 .opencode-bridge-session-connection-heading>strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:400!important;font-size:12px!important;color:var(--vscode-foreground)}
.oc-p39 .opencode-bridge-session-connection-description{display:none!important}
.oc-p39 .opencode-bridge-session-failure-link{flex:none;padding:0!important;border:0!important;background:transparent!important;color:var(--vscode-textLink-foreground)!important;font:inherit;font-size:12px;cursor:pointer;white-space:nowrap}
.oc-p39 .opencode-bridge-session-collapse-button{display:none!important}
.oc-p39 .opencode-bridge-session-dot{flex:none;width:8px!important;height:8px!important;border-radius:50%;margin:0!important;box-shadow:none!important;animation:none!important;background:var(--vscode-descriptionForeground)!important}
.oc-p39 .opencode-bridge-session-dot.state-connected{background:var(--vscode-testing-iconPassed)!important}
.oc-p39 .opencode-bridge-session-dot.state-running,.oc-p39 .opencode-bridge-session-dot.state-starting{background:var(--vscode-charts-yellow)!important}
.oc-p39 .opencode-bridge-session-dot.state-error,.oc-p39 .opencode-bridge-session-dot.oc-p41-failed{background:var(--vscode-errorForeground)!important}
.oc-p39 .oc-p41-actionbar{display:flex!important;flex:none;align-items:center;gap:2px;margin:0 0 0 auto!important;padding:0!important;border:0!important;background:transparent!important;flex-wrap:nowrap!important}
.oc-p39 .oc-p41-actionbar .monaco-button{flex:none!important;width:22px!important;min-width:0!important;height:22px!important;padding:0!important;margin:0!important;border:0!important;border-radius:5px!important;background:transparent!important;color:var(--vscode-icon-foreground,var(--vscode-foreground))!important;display:inline-flex!important;align-items:center;justify-content:center;box-shadow:none!important;outline-offset:-1px}
.oc-p39 .oc-p41-actionbar .monaco-button[hidden]{display:none!important}
.oc-p39 .oc-p41-actionbar .monaco-button:hover:not(.disabled){background:var(--vscode-toolbar-hoverBackground)!important}
.oc-p39 .oc-p41-actionbar .monaco-button.disabled{opacity:.4!important}
.oc-p39 .oc-p41-actionbar .monaco-button .codicon{font-size:16px!important;margin:0!important}
.oc-p39 .oc-p41-start-row{padding:6px 0 4px}
.oc-p39 .oc-p41-start-row .monaco-button{width:100%;max-width:300px;box-sizing:border-box;margin:0 auto}
.oc-p39 .opencode-bridge-session-footer-details{display:block!important;margin:0!important;padding:0!important;gap:0!important;border:0!important;background:transparent!important}
.oc-p39 .opencode-bridge-session-stats{display:block!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important;grid-template-columns:none!important}
.oc-p39 .oc-stats-line{padding:0 0 0 14px!important;line-height:18px;font-size:12px;opacity:1!important;color:var(--vscode-descriptionForeground);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.oc-p39 .oc-stats-line .oc-bad{color:var(--vscode-errorForeground)}
.oc-p39 .opencode-bridge-session-health{display:flex;align-items:center;gap:6px;line-height:18px;padding:0 0 0 0!important;margin:0!important;font-size:12px;color:var(--vscode-descriptionForeground);overflow:hidden;white-space:nowrap}
.oc-p39 .opencode-bridge-session-health .opencode-bridge-session-dot{width:8px!important;height:8px!important}
.oc-p39 .opencode-bridge-session-health-text{overflow:hidden;text-overflow:ellipsis}
.oc-p39 .opencode-bridge-session-meta,.oc-p39 .opencode-bridge-session-hint{display:none!important}
.opencode-bridge-session-view.oc-p39.oc-p41-stopped .opencode-bridge-session-stats{display:none!important}
`;
// ---- OpenCode p44: 任务面板改进（状态按实际结果、命令轮询合并、批量摘要、heredoc 标题、按任务分组） ----
// heredoc：`cmd <<'TAG'` 之后到 TAG 行为脚本正文，不应按换行拆成「步」。
function ocP44SplitHeredoc(cmd) {
  const lines = String(cmd || "").split(/\r?\n/);
  const head = [];
  const bodies = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    head.push(line);
    const re = /<<-?\s*(['"]?)([A-Za-z_][\w.-]*)\1/g;
    let m;
    const tags = [];
    while (m = re.exec(line)) tags.push(m[2]);
    for (const tag of tags) {
      const body = [];
      i++;
      while (i < lines.length && lines[i].trim() !== tag) body.push(lines[i++]);
      bodies.push({ tag, line, body });
    }
  }
  return { head: head.join("\n"), bodies };
}
// heredoc 摘要：优先写入的文件，其次首条注释 / def / function / class，最后首行正文。
function ocP44HeredocSummary(doc) {
  const files = new Set();
  const redirect = /(?:^|\s)>{1,2}\s*(["']?)([^\s"'<>|&;]+)\1/.exec(doc.line.replace(/<<-?\s*(['"]?)[\w.-]+\1/g, ""));
  if (redirect && !/^&?\d$/.test(redirect[2]) && redirect[2] !== "/dev/null") files.add(ocBase(redirect[2]));
  const text2 = doc.body.join("\n");
  const pats = [
    /\bopen\(\s*(?:r|rb|f)?["']([^"']+)["']\s*,\s*["'][wax]b?\+?["']/g,
    /\bPath\(\s*(?:r|f)?["']([^"']+)["']\s*\)\s*\.write_(?:text|bytes)/g,
    /\bwrite(?:File|FileSync)\(\s*["'`]([^"'`]+)["'`]/g,
    /\b(?:Set-Content|Out-File|Add-Content)\s+(?:-(?:Path|FilePath|LiteralPath)\s+)?["']?([^\s"']+)/gi,
    /\bfs\.(?:writeFileSync|appendFileSync)\(\s*["'`]([^"'`]+)["'`]/g
  ];
  for (const re of pats) { let m; while (m = re.exec(text2)) files.add(ocBase(m[1])); }
  if (files.size) { const list = [...files]; return { kind: "files", text: `写入 ${list.slice(0, 3).join(", ")}${list.length > 3 ? ` 等 ${list.length} 个` : ""}` }; }
  const body = doc.body.map((l) => l.trim()).filter(Boolean);
  const comment = body.find((l) => /^(#(?!!)|\/\/|--\s|REM\s)/i.test(l));
  if (comment) return { kind: "comment", text: comment.replace(/^(#+|\/\/+|--|REM)\s*/i, "").slice(0, 120) };
  const def = body.find((l) => /^(async\s+)?(def|class|function|const\s+\w+\s*=\s*(async\s*)?\()\b/.test(l));
  if (def) return { kind: "def", text: def.slice(0, 120) };
  const first = body.find((l) => !/^(import|from|use strict|['"]use strict)/.test(l)) || body[0] || "";
  return { kind: "line", text: first.slice(0, 120) };
}
// 终端类调用的实际结果：退出码 / 子状态（running / failed / cancelled）。
function ocP44TermTokens(p) {
  return String(p?.subtitle || "").split(" \xB7 ").map((s) => s.trim().toLowerCase()).filter(Boolean);
}
function ocP44TermState(p) {
  if (!p || p.kind !== "terminal") return void 0;
  const tokens = ocP44TermTokens(p);
  if (typeof p.exitCode === "number") return p.exitCode === 0 ? "completed" : "error";
  if (tokens.some((t) => /^exit (-?\d+)$/.test(t) && t !== "exit 0")) return "error";
  if (tokens.includes("exit 0")) return "completed";
  if (tokens.some((t) => t === "cancelled" || t === "canceled" || t === "killed" || t === "aborted")) return "cancelled";
  if (tokens.some((t) => t === "failed" || t === "error" || t === "timed_out" || t === "timeout")) return "error";
  if (tokens.includes("running")) return "running";
  if (tokens.includes("completed")) return "completed";
  return void 0;
}
// 单次调用的有效状态（图标 / 筛选 / 计数都用它）：MCP 调用成功但命令退出码非 0 也算失败。
function ocP44Status(a) {
  if (a.status === "progress") return "progress";
  if (a.status === "cancelled" || a.status === "canceled") return "cancelled";
  if (a.status === "error" || a.isError === true) return "error";
  if (a.status === "running") return "running";
  const p = a.presentation;
  if (a.tool === "run_command" || a.tool === "get_command_output") {
    const s = ocP44TermState(p);
    if (s) return s;
  }
  if (a.tool === "bridge_batch" && /失败\s*[1-9]/.test(String(a.message || ""))) return "error";
  if (/^(error|failed)\b/i.test(String(p?.subtitle || "")) || /failed$/i.test(String(p?.subtitle || ""))) return "error";
  return "completed";
}
// 动词类别（行内小图标）。
const OC_P44_CATEGORIES = [
  { re: /^读取/, key: "read", icon: "file", label: "读取" },
  { re: /^查看文件/, key: "read", icon: "file", label: "查看文件" },
  { re: /^(搜索|查找)/, key: "search", icon: "search", label: "搜索" },
  { re: /^列出/, key: "list", icon: "listTree", label: "列出" },
  { re: /^运行/, key: "run", icon: "terminal", label: "运行" },
  { re: /^(修改|写入|编辑)/, key: "edit", icon: "edit", label: "修改" },
  { re: /^Git/, key: "git", icon: "sourceControl", label: "Git" }
];
function ocP44Category(verb) {
  for (const c of OC_P44_CATEGORIES) if (c.re.test(verb)) return c;
  return void 0;
}
function ocP44CodiconClass(name) {
  const icon2 = Codicon[name] ?? Codicon.tools;
  return ThemeIcon.asClassNameArray(icon2);
}
const OC_P44_BATCH_KIND = { read_files: "读取", read_file: "读取", read_image: "读取", list_skills: "读取", bridge_get_effective_rules: "读取", search_files: "搜索", find_files: "搜索", lsp: "搜索", list_directory: "列出", run_command: "命令", get_command_output: "命令", send_command_input: "命令", cancel_command: "命令", apply_patch: "修改", write_file: "修改", get_diagnostics: "诊断", set_todos: "任务卡", update_plan: "任务卡", report_progress: "任务卡" };
function ocP44BatchSummary(count2, children) {
  const kinds = new Map();
  for (const c of children) { const k = OC_P44_BATCH_KIND[c.a.tool] || OC_TOOL_LABELS[c.a.tool] || c.a.tool; kinds.set(k, (kinds.get(k) || 0) + 1); }
  const n = count2 || children.length;
  const parts = [...kinds.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ×${v}`);
  return parts.length ? `批量 ${n} 项：${parts.join(" \xB7 ")}` : n ? `批量 ${n} 项` : "批量调用";
}
function ocP44BatchCount(a) {
  const p = a.presentation;
  try { const v = typeof p?.input === "string" ? JSON.parse(p.input) : p?.input; if (Number.isFinite(v?.count)) return v.count; } catch { }
  const m = /已完成\s*\d+\s*\/\s*(\d+)/.exec(String(a.message || p?.output || ""));
  return m ? Number(m[1]) : 0;
}
function ocP44DurClass(ms) {
  if (ms === void 0 || !Number.isFinite(ms)) return "";
  return ms < 1e3 ? "oc-p44-dur-fast" : ms >= 1e4 ? "oc-p44-dur-slow" : "";
}
function ocP44Relative(ms, now = Date.now()) {
  const d = Math.max(0, now - ms);
  if (d < 6e4) return "刚刚";
  if (d < 36e5) return `${Math.round(d / 6e4)} 分钟前`;
  if (d < 864e5) return `${Math.round(d / 36e5)} 小时前`;
  return `${Math.round(d / 864e5)} 天前`;
}
// 列表级统计（与行图标同一口径）：命令轮询并入父命令后再数运行中 / 失败。
function ocP44CountStates(activities) {
  const latestPoll = new Map();
  for (const a of activities) {
    if (a.tool !== "get_command_output" || !a.presentation?.commandId) continue;
    const st = ocP44TermState(a.presentation);
    if (st) latestPoll.set(a.presentation.commandId, st);
  }
  let running = 0, failed = 0, failedTool = 0;
  const cmdIds = new Set();
  for (const a of activities) if (a.tool === "run_command" && a.presentation?.commandId) cmdIds.add(a.presentation.commandId);
  for (const a of activities) {
    if (a.status === "progress") continue;
    if (a.tool === "get_command_output" && cmdIds.has(a.presentation?.commandId)) continue;
    let st = ocP44Status(a);
    if (a.tool === "run_command" && a.status !== "error" && latestPoll.has(a.presentation?.commandId)) st = latestPoll.get(a.presentation.commandId);
    if (st === "running") running += 1;
    else if (st === "error") { failed += 1; if (a.status === "error") failedTool += 1; }
  }
  return { running, failed, failedTool };
}
const OC_P44_TASK_SEG_KEY = "opencode.bridge.p44.taskSegment";
const OC_P44_GROUPS_KEY = "opencode.bridge.p44.groups";
function ocP44LoadJson(key, fallback) { try { const v = JSON.parse(globalThis.localStorage?.getItem(key) || "null"); return v ?? fallback; } catch { return fallback; } }
function ocP44SaveJson(key, value2) { try { globalThis.localStorage?.setItem(key, JSON.stringify(value2)); } catch { } }
const OC_P44_CSS = `
/* OpenCode p44: 任务面板改进 */
.oc-p39 .oc-p40-row{border-left:2px solid transparent}
.oc-p39 .oc-p40-row.state-completed .oc-p39-icon{color:var(--vscode-testing-iconPassed,var(--vscode-charts-green))}
.oc-p39 .oc-p40-row.state-error{border-left-color:color-mix(in srgb,var(--vscode-errorForeground) 55%,transparent);background:color-mix(in srgb,var(--vscode-errorForeground) 6%,transparent)}
.oc-p39 .oc-p40-row.state-error:hover{background:color-mix(in srgb,var(--vscode-errorForeground) 11%,var(--vscode-list-hoverBackground,transparent))}
.oc-p39 .oc-p40-row.state-error .oc-p39-icon{color:var(--vscode-testing-iconFailed,var(--vscode-errorForeground))}
.oc-p39 .oc-p40-row.state-cancelled .oc-p39-icon{color:var(--vscode-disabledForeground,var(--vscode-descriptionForeground))}
.oc-p39 .oc-p40-row.state-cancelled .oc-p40-label{opacity:.7}
.oc-p39 .oc-p40-row.state-running .oc-p39-icon{color:var(--vscode-charts-blue,var(--vscode-progressBar-background))}
.oc-p39 .oc-p40-row.oc-p44-child{padding-left:30px}
.oc-p39 .oc-p40-row.oc-p44-child+.oc-p40-detail{padding-left:66px}
.oc-p39 .oc-p44-verb-icon{flex:none;display:inline-flex!important;align-items:center;justify-content:center;width:14px;font-size:13px;margin-right:4px;opacity:.75;vertical-align:-2px}
.oc-p39 .oc-p40-label .oc-p44-verb-rest{opacity:.8;margin-right:.4em}
.oc-p39 .oc-p40-label.oc-p44-iconic .oc-p40-target{margin-left:0}
/* 窄侧栏：说明列（目录 / 另 N 条命令）先让位，保证动作与对象可读 */
.oc-p39 .oc-p40-row .oc-p40-label{min-width:4em;flex-shrink:1}
.oc-p39 .oc-p40-row .oc-p40-desc{min-width:0}
.oc-p39 .oc-p44-client{flex:none;display:inline-block;max-width:9em;overflow:hidden;text-overflow:ellipsis;font-size:10px;line-height:15px;padding:0 5px;border-radius:7px;color:hsl(var(--oc-hue,210) 55% 62%);background:hsla(var(--oc-hue,210),60%,55%,.15)}
.oc-p39 .oc-p44-tail{flex:none;font-size:.9em;opacity:.8;font-variant-numeric:tabular-nums}
.oc-p39 .oc-p44-tail.bad{color:var(--vscode-errorForeground);opacity:1}
.oc-p39 .oc-p44-tail.live{color:var(--vscode-charts-blue,var(--vscode-foreground))}
.oc-p39 .oc-p40-dur.oc-p44-dur-fast{opacity:.45}
.oc-p39 .oc-p40-dur.oc-p44-dur-slow{opacity:1;color:var(--vscode-charts-orange,#d18616)}
.oc-p39 .oc-p44-group-head{text-transform:none;font-weight:400;font-size:inherit;gap:6px}
.oc-p39 .oc-p44-group-head .oc-p40-section-label{flex:0 1 auto;font-weight:600}
.oc-p39 .oc-p44-group-head .oc-p44-group-meta{flex:1 1 0;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.9em;color:var(--vscode-descriptionForeground)}
.oc-p39 .oc-p44-group-head .oc-p44-group-meta .bad{color:var(--vscode-errorForeground)}
.oc-p39 .oc-p44-group-head.state-running .oc-p39-icon{color:var(--vscode-charts-blue,var(--vscode-progressBar-background))}
.oc-p39 .oc-p44-group-head.state-error .oc-p39-icon{color:var(--vscode-errorForeground)}
.oc-p39 .oc-p44-group-head.state-completed .oc-p39-icon{color:var(--vscode-testing-iconPassed)}
.oc-p39 .oc-p44-group-head.state-unlinked .oc-p39-icon{color:var(--vscode-descriptionForeground)}
.oc-p39 .oc-p44-time-sep{display:flex;align-items:center;gap:6px;height:18px;line-height:18px;padding:0 8px 0 30px;font-size:10px;color:var(--vscode-descriptionForeground);font-variant-numeric:tabular-nums;user-select:none}
.oc-p39 .oc-p44-time-sep::after{content:"";flex:1;height:1px;background:var(--vscode-tree-indentGuidesStroke,var(--vscode-widget-border,rgba(128,128,128,.25)));opacity:.6}
.oc-p39 .oc-p44-filter-banner{display:flex;align-items:center;gap:6px;height:22px;padding:0 8px 0 10px;font-size:12px;color:var(--vscode-errorForeground);background:color-mix(in srgb,var(--vscode-errorForeground) 8%,transparent)}
.oc-p39 .oc-p44-filter-banner button{margin-left:auto}
.oc-p39 .oc-p44-poll{display:flex;gap:8px;line-height:18px;font-size:11px;color:var(--vscode-descriptionForeground);font-variant-numeric:tabular-nums}
.oc-p39 .oc-p44-poll .bad{color:var(--vscode-errorForeground)}
/* 任务架：分组标题改为一行分段筛选 */
.oc-p39 .oc-p44-seg{display:flex;align-items:stretch;gap:0;margin:3px 8px 3px 10px;height:22px;border:1px solid var(--vscode-input-border,var(--vscode-widget-border,rgba(128,128,128,.35)));border-radius:4px;overflow:hidden}
.oc-p39 .oc-p44-seg button{flex:1 1 0;min-width:0;display:inline-flex;align-items:center;justify-content:center;gap:4px;padding:0 4px;border:0;border-left:1px solid var(--vscode-input-border,var(--vscode-widget-border,rgba(128,128,128,.35)));background:transparent;color:var(--vscode-foreground);font:inherit;font-size:12px;white-space:nowrap;overflow:hidden;cursor:pointer;outline-offset:-1px}
.oc-p39 .oc-p44-seg button:first-child{border-left:0}
.oc-p39 .oc-p44-seg button:hover{background:var(--vscode-toolbar-hoverBackground)}
.oc-p39 .oc-p44-seg button.active{background:var(--vscode-button-background);color:var(--vscode-button-foreground)}
.oc-p39 .oc-p44-seg button .codicon{font-size:13px}
.oc-p39 .oc-p44-seg button[data-seg="running"]:not(.active) .codicon{color:var(--vscode-charts-yellow)}
.oc-p39 .oc-p44-seg button[data-seg="unfinished"]:not(.active) .codicon{color:var(--vscode-errorForeground)}
.oc-p39 .oc-p44-seg button[data-seg="completed"]:not(.active) .codicon{color:var(--vscode-testing-iconPassed)}
.oc-p39 .oc-p44-seg .oc-p44-seg-n{font-variant-numeric:tabular-nums;opacity:.85}
.oc-p39 .oc-p44-seg .oc-p44-seg-calls{font-size:10px;opacity:.85}
.oc-p39.oc-p44-seg-mode summary.opencode-task-group-heading{display:none!important}
.oc-p39.oc-p44-seg-mode details.opencode-bridge-task-group.oc-p44-seg-hidden{display:none!important}
.oc-p39.oc-p44-seg-mode .opencode-bridge-task-card>summary{padding-left:10px!important}
/* 底部：统计行「失败 N」可点击筛选；停止按钮红色；悬停稳定 */
.oc-p39 .oc-stats-line .oc-p44-fail{cursor:pointer;border-radius:3px;padding:0 2px}
.oc-p39 .oc-stats-line .oc-p44-fail:hover{text-decoration:underline}
.oc-p39 .oc-stats-line .oc-p44-fail.active{background:color-mix(in srgb,var(--vscode-errorForeground) 18%,transparent);text-decoration:none}
.oc-p39 .oc-p41-actionbar .monaco-button.opencode-bridge-session-start-stop-button,.oc-p39 .oc-p41-actionbar .monaco-button.opencode-bridge-session-start-stop-button .codicon{color:var(--vscode-errorForeground,#f14c4c)!important}
.oc-p39 .oc-p41-actionbar .monaco-button.opencode-bridge-session-start-stop-button:hover:not(.disabled){background:color-mix(in srgb,var(--vscode-errorForeground,#f14c4c) 18%,transparent)!important}
.oc-p39 .oc-p41-actionbar .monaco-button,.oc-p39 .oc-p41-actionbar .monaco-button *{transition:none!important}
/* p44b: 任务架适配任意宿主（侧栏 / 面板 / 编辑区页面 / 浮窗）。宽度按任务区自身计算，不依赖侧栏容器 */
.opencode-bridge-task-shelf.oc-p39 .opencode-bridge-session-todos-region{container-type:inline-size;container-name:ocp44tasks}
.oc-p39 .oc-p44-seg{max-width:420px;box-sizing:border-box}
.oc-p39 .oc-p44-seg .oc-p44-seg-label{min-width:0;overflow:hidden;text-overflow:ellipsis}
@container ocp44tasks (max-width:340px){.oc-p39 .oc-p44-seg .oc-p44-seg-calls{display:none}}
@container ocp44tasks (max-width:230px){.oc-p39 .oc-p44-seg .oc-p44-seg-label,.oc-p39 .oc-p44-seg .oc-p44-seg-calls{display:none}}
@container ocp44tasks (min-width:480px){.oc-p39 .oc-p44-seg{height:26px}.oc-p39 .oc-p44-seg button{font-size:var(--vscode-font-size,13px);gap:6px;padding:0 10px}.oc-p39 .oc-p44-seg button .codicon{font-size:14px}}
.oc-p39 .oc-p44-shelf-empty{display:flex;align-items:center;gap:6px;height:22px;line-height:22px;padding:0 8px 0 12px;color:var(--vscode-descriptionForeground);overflow:hidden;white-space:nowrap}
.oc-p39 .oc-p44-shelf-empty>.codicon{flex:none;font-size:14px;opacity:.8}
.oc-p39 .oc-p44-shelf-empty .oc-p44-empty-title{flex:none}
.oc-p39 .oc-p44-shelf-empty .oc-p44-empty-hint,.oc-p39 .oc-p44-shelf-empty .oc-p44-empty-more{display:none}
.oc-p39 .oc-p44-shelf-empty .oc-p40-link{padding:0;border:0;background:transparent;color:var(--vscode-textLink-foreground);font:inherit;cursor:pointer}
.oc-p39 .oc-p44-shelf-empty .oc-p40-link:hover{text-decoration:underline}
/* 停靠出去（data-oc-docked）：只有任务区搬走，标题由页签/视图标题显示，这里补足内边距与空状态说明 */
.opencode-bridge-task-shelf.oc-p39[data-oc-docked="1"] .opencode-bridge-task-shelf-body{container-type:inline-size;container-name:ocp44dock;box-sizing:border-box}
.opencode-bridge-task-shelf.oc-p39[data-oc-docked="1"] .opencode-bridge-session-todos-region{padding:4px 0 8px!important;box-sizing:border-box}
.opencode-bridge-task-shelf.oc-p39[data-oc-docked="1"] .oc-p44-seg{margin:4px 12px 6px 12px}
.opencode-bridge-task-shelf.oc-p39[data-oc-docked="1"] .oc-p44-shelf-empty{display:block;height:auto;line-height:1.5;white-space:normal;padding:16px 12px 8px 12px;max-width:560px}
.opencode-bridge-task-shelf.oc-p39[data-oc-docked="1"] .oc-p44-shelf-empty>.codicon{display:block;width:auto;text-align:left;font-size:24px;margin:0 0 8px 0}
.opencode-bridge-task-shelf.oc-p39[data-oc-docked="1"] .oc-p44-shelf-empty .oc-p44-empty-title{display:block;color:var(--vscode-foreground);font-weight:600}
.opencode-bridge-task-shelf.oc-p39[data-oc-docked="1"] .oc-p44-shelf-empty .oc-p44-empty-hint,.opencode-bridge-task-shelf.oc-p39[data-oc-docked="1"] .oc-p44-shelf-empty .oc-p44-empty-more{display:block;margin-top:4px}
@container ocp44dock (min-width:560px){.opencode-bridge-task-shelf.oc-p39[data-oc-docked="1"] .opencode-bridge-session-todos-region{padding:8px 12px 16px!important;max-width:1040px}}
@container ocp44dock (min-width:900px){.opencode-bridge-task-shelf.oc-p39[data-oc-docked="1"] .opencode-bridge-session-todos-region{padding:12px 20px 20px!important}}
`;
// OpenCode p40: 活动行的人话标签：动词 + 主要对象（命令/路径），其余进描述与悬停提示。
function ocP40Describe(activity) {
  const p = activity.presentation ?? { kind: "generic", title: activity.tool };
  const human = ocHumanizeActivity(activity, p);
  let verb = "";
  let target = "";
  let extra = "";
  let extraTitle = "";
  let full = "";
  if (human.command !== void 0) {
    const { folder, segs } = ocSplitCommand(human.command);
    const seg = segs[0] || "";
    const d = seg ? ocDescribeSegment(seg) : folder ? "切换目录" : "运行命令";
    const words = seg.match(/"[^"]*"|'[^']*'|\S+/g) || [];
    if (/^git(\.exe)?$/i.test(ocBase(words[0] || ""))) {
      let k = 1;
      while (k < words.length && words[k].startsWith("-")) k += /^-(C|c)$/.test(words[k]) ? 2 : 1;
      const sub = (words[k] || "").replace(/-/g, "_");
      verb = "Git " + (OC_GIT_SUB[sub] || sub || "命令");
    } else {
      verb = d.split(" · ")[0];
    }
    target = seg.replace(/\s+/g, " ").slice(0, 200) || folder || "";
    // OpenCode p44: 原「+N 步」实为 &&、||、; 或换行串起的后续命令条数（不含开头 cd）；heredoc 正文不再计入。
    if (segs.length > 1) {
      extra = `另 ${segs.length - 1} 条命令`;
      extraTitle = `后续命令：\n${segs.slice(1, 8).map((x) => `· ${x.slice(0, 160)}`).join("\n")}${segs.length > 8 ? `\n… 共 ${segs.length - 1} 条` : ""}`;
    }
    const hd = ocP44SplitHeredoc(human.command);
    if (hd.bodies.length) {
      const doc = hd.bodies[0];
      const sm = ocP44HeredocSummary(doc);
      const prog = ocBase((doc.line.trim().match(/\S+/) || [""])[0]).toLowerCase();
      if ((prog === "cat" || prog === "tee") && sm.kind === "files") { verb = "写入文件"; target = sm.text.replace(/^写入 /, ""); }
      else if (sm.text) target = sm.text;
      const n = hd.bodies.reduce((sum, b) => sum + b.body.length, 0);
      extra = [extra, `脚本 ${n} 行`].filter(Boolean).join(" \xB7 ");
    }
    full = human.command;
  } else {
    const t = String(human.title || activity.tool || "");
    const i = t.indexOf(" · ");
    verb = i > 0 ? t.slice(0, i) : t;
    target = i > 0 ? t.slice(i + 3) : "";
    if (/^[A-Za-z]/.test(verb) && (OC_TOOL_LABELS[activity.tool] || p.kind === "edit")) {
      verb = OC_TOOL_LABELS[activity.tool] || "修改文件";
      target = "";
    }
    const items = p.items ?? (p.files ?? []).map((path) => ({ kind: "file", path }));
    if (!target && items.length) {
      target = ocBase(items[0].path || items[0].label || "");
      if (items.length > 1) extra = `等 ${items.length} 项`;
    }
    full = typeof p.input === "string" ? p.input : p.input !== void 0 ? JSON.stringify(p.input) : "";
  }
  const where = human.subtitle ? String(human.subtitle) : "";
  const paths = (p.items ?? []).map((item) => item.path || "").join("\n");
  const haystack = [verb, target, where, full, activity.tool, paths, typeof activity.message === "string" ? activity.message : ""].join("\n").toLowerCase();
  return { verb: verb || activity.tool || "调用", target, where, extra, extraTitle, full, haystack };
}
function ocP40Pretty(value2) {
  if (value2 === void 0 || value2 === null || value2 === "") return "";
  if (typeof value2 !== "string") { try { return JSON.stringify(value2, null, 2); } catch { return String(value2); } }
  const s = value2.trim();
  if (/^[\[{]/.test(s)) { try { return JSON.stringify(JSON.parse(s), null, 2); } catch { } }
  return value2;
}
function ocP40Head(text2, max = 20) {
  const lines = String(text2 ?? "").replace(/\s+$/, "").split(/\r?\n/);
  return lines.length > max ? `${lines.slice(0, max).join("\n")}\n… 另有 ${lines.length - max} 行` : lines.join("\n");
}
const OC_P40_SECTIONS_KEY = "opencode.bridge.p40.sections";
function ocP40LoadSections() { try { const v = JSON.parse(globalThis.localStorage?.getItem(OC_P40_SECTIONS_KEY) || "{}"); return { running: v.running === true, failed: v.failed === true, recent: v.recent === true }; } catch { return { running: false, failed: false, recent: false }; } }
// OpenCode p39: 仅开发/截图用的示例数据：localStorage "opencode.bridge.uiSeed" = "1" 或环境变量 OC_BRIDGE_UI_SEED=1 时才生效。
function ocP39SeedEnabled() {
  try {
    if (globalThis.localStorage?.getItem("opencode.bridge.uiSeed") === "1") return true;
    return globalThis.vscode?.process?.env?.OC_BRIDGE_UI_SEED === "1";
  } catch { return false; }
}
function ocP39Seed(status2) {
  if (!status2 || !ocP39SeedEnabled()) return status2;
  if (!globalThis.__ocP39SeedData) {
    const now = Date.now();
    const iso = (s) => new Date(now - s * 1e3).toISOString();
    const hark = { kind: "remote", id: "hark", label: "Hark", client: "hark-agent/1.0" };
    const claude = { kind: "remote", id: "claude-desktop", label: "Claude Desktop", client: "claude-ai/0.9" };
    const ws = "OpenCode-Source-Recovery-20261013";
    const term = (cmd, out, extra = {}) => ({ kind: "terminal", title: cmd, command: cmd, subtitle: `${ws}`, output: out, ...extra });
    let id2 = 9000;
    const A = (s, tool, status, durationMs, presentation2, actor, more = {}) => ({ id: ++id2, at: iso(s), tool, status, durationMs, presentation: presentation2, actor, ...more });
    const activities = [
      A(410, "read_files", "completed", 120, { kind: "files", title: "Read 3 files", subtitle: ws, items: [{ kind: "file", path: "recovered/esm/027-workbench.desktop.main.js/module-2764.mjs" }, { kind: "file", path: "scripts/update.cjs" }, { kind: "file", path: "scripts/test-ui-regress.cjs" }], output: "module-2764.mjs (2171 lines)\nupdate.cjs (412 lines)\ntest-ui-regress.cjs (380 lines)" }, hark, { taskId: "seed-task-1" }),
      A(380, "search_files", "completed", 4600, { kind: "search", title: "Searched “recordShadowCheckpoint”", subtitle: ws, items: [{ kind: "match", path: "recovered/esm/000-extension.js/module-0144.mjs", line: 812, label: "recordShadowCheckpoint(state)" }] }, hark, { taskId: "seed-task-1" }),
      A(350, "run_command", "completed", 7200, term(`cd /e/OpenCode-Source-Recovery-20261013 && wc -l hark_pack_1907.log && tail -n 5 hark_pack_1907.log`, "1907 hark_pack_1907.log\npack ok\nupload ok"), hark, { taskId: "seed-task-1" }),
      A(300, "run_command", "error", 1300, term(`cd /e/OpenCode-Source-Recovery-20261013 && node --check recovered/esm/027-workbench.desktop.main.js/module-2764.mjs`, "SyntaxError: Unexpected token '}'\n    at module-2764.mjs:1043:7"), hark, { taskId: "seed-task-1", message: "exit 1: SyntaxError: Unexpected token '}' (module-2764.mjs:1043:7)" }),
      A(260, "apply_patch", "completed", 380, { kind: "edit", title: "Edited module-2764.mjs", subtitle: ws, items: [{ kind: "file", path: "recovered/esm/027-workbench.desktop.main.js/module-2764.mjs", additions: 42, deletions: 7 }] }, hark, { taskId: "seed-task-1" }),
      A(240, "git", "completed", 900, term(`git -C /e/OpenCode-Source-Recovery-20261013 status --short`, " M recovered/esm/027-workbench.desktop.main.js/module-2764.mjs"), claude, { tool: "run_command" }),
      A(200, "get_diagnostics", "error", 2400, { kind: "diagnostics", title: "检查问题", subtitle: ws, items: [{ kind: "diagnostic", severity: "error", path: "src/vs/workbench/contrib/chat/browser/chatViewPane.ts", line: 211, label: "Cannot find name 'ocPane'" }] }, claude, { message: "1 error: Cannot find name 'ocPane'" }),
      A(150, "run_command", "completed", 23000, term(`cd /e/OpenCode-Source-Recovery-20261013 && node scripts/update.cjs`, "build ok\npublished runtime 2026-11-17-1925"), hark, { taskId: "seed-task-1" }),
      A(90, "run_command", "completed", 108000, term(`rm -f hark_pack_1920.exit hark_pack_1920.log && ls -la`, ""), hark, { taskId: "seed-task-2" }),
      A(60, "list_directory", "completed", 45, { kind: "files", title: "list_directory", subtitle: ws, items: [{ kind: "folder", path: "recovered/esm" }] }, claude),
      A(25, "run_command", "running", void 0, term(`cd /e/OpenCode-Source-Recovery-20261013 && node scripts/test-ui-regress.cjs`, ""), hark, { taskId: "seed-task-1" }),
      A(8, "search_files", "running", void 0, { kind: "search", title: "search_files running", subtitle: "000-extension.js" }, claude)
    ].map((a) => a.tool === "git" ? { ...a, tool: "run_command" } : a);
    const tasks = [
      { id: "seed-task-1", revision: 3, state: "running", title: "重做 Bridge 视图为 VS Code 原生样式", createdAt: now - 6e5, updatedAt: now - 2e4, todos: [{ id: "t1", title: "定位源码", status: "completed" }, { id: "t2", title: "修改任务架与活动列表", status: "completed" }, { id: "t3", title: "构建并截图验证", status: "in_progress" }, { id: "t4", title: "回归测试", status: "pending" }] },
      { id: "seed-task-3", revision: 1, state: "running", title: "整理 hark_pack 日志", createdAt: now - 5e5, updatedAt: now - 9e4, todos: [{ id: "u1", title: "统计行数", status: "in_progress" }, { id: "u2", title: "清理旧文件", status: "pending" }] },
      { id: "seed-task-2", revision: 2, state: "completed", title: "清理临时文件", createdAt: now - 9e5, updatedAt: now - 8e4, todos: [{ id: "c1", title: "删除 hark_pack_1920.*", status: "completed" }] }
    ];
    globalThis.__ocP39SeedData = { activities, tasks, stats: { toolCalls: 1174, completedToolCalls: 1167, failedToolCalls: 7, successRate: 99.4, averageDurationMs: 10e3, lastTool: "run_command", lastToolAt: iso(8) } };
  }
  const seed = globalThis.__ocP39SeedData;
  return { ...status2, state: "running", connected: true, activeRequests: 2, revision: 777777, taskId: "seed-task-1", activities: seed.activities, tasks: seed.tasks, todos: [], stats: seed.stats, startFailure: void 0, lastError: void 0 };
}
function ocTaskShelfUserHidden() {
  try { return globalThis.localStorage?.getItem("opencode.chat.taskShelfHidden") === "1"; } catch { return false; }
}
// OpenCode chat-split: 对话（= Bridge 任务，工具调用按 activity.taskId 归属）的状态与配色。
const OC_CONV_COLORS = { running: "var(--vscode-charts-yellow,#d7ba7d)", done: "var(--vscode-charts-green,#89d185)", error: "var(--vscode-errorForeground,#f48771)" };
const OC_CONV_ACTIVE_STATES = ["running", "waiting_plan", "awaiting_user", "awaiting_sync"];
// task-system-truth: awaiting_sync means "no card write and no attributable activity for 20+ minutes" -> 已停滞, never "in progress".
const OC_CONV_STATE_LABELS = { running: "\u56DE\u590D\u4E2D", waiting_plan: "\u7B49\u5F85\u8BA1\u5212", awaiting_user: "\u7B49\u4F60\u56DE\u7B54", awaiting_sync: "\u5DF2\u505C\u6EDE", completed: "\u5DF2\u5B8C\u6210", cleared: "\u5DF2\u7ED3\u675F", blocked: "\u53D7\u963B", interrupted: "\u5DF2\u4E2D\u65AD", failed: "\u5931\u8D25", error: "\u51FA\u9519", cancelled: "\u5DF2\u53D6\u6D88", canceled: "\u5DF2\u53D6\u6D88" };
function ocConvTone(task, acts) {
  const running = acts.some((a) => a.status === "running");
  if (task) {
    // 与「任务」分组 partitionBridgeTaskDisplay 一致：活动状态但 executionUnverified 归入未完成（红）。
    // task-card-multi-conv: 已停滞 (awaiting_sync) is not 进行中; it matches the 未完成 group of partitionBridgeTaskDisplay.
    if (task.state === "awaiting_sync") return { tone: "error", label: OC_CONV_STATE_LABELS.awaiting_sync };
    if (OC_CONV_ACTIVE_STATES.includes(task.state)) return task.executionUnverified ? { tone: "error", label: "\u6267\u884C\u672A\u9A8C\u8BC1" } : { tone: "running", label: OC_CONV_STATE_LABELS[task.state] };
    // task-card-multi-conv: the lifecycle the AI wrote wins over activity. A completed card stays 已完成 even while one of its
    // background calls is still running; the label only notes it.
    if (task.state === "completed" || task.state === "cleared") return { tone: "done", label: OC_CONV_STATE_LABELS[task.state] + (running ? "\uFF08\u4ECD\u6709\u8C03\u7528\u5728\u8FD0\u884C\uFF09" : "") };
    return { tone: "error", label: OC_CONV_STATE_LABELS[task.state] || "\u5F02\u5E38" };
  }
  if (running) return { tone: "running", label: OC_CONV_STATE_LABELS.running };
  const last = [...acts].reverse().find((a) => a.status === "completed" || a.status === "error");
  if (last?.status === "error") return { tone: "error", label: OC_CONV_STATE_LABELS.error };
  return { tone: "done", label: OC_CONV_STATE_LABELS.completed };
}
function ocConvTime(ms) {
  if (!ms || !Number.isFinite(ms)) return "";
  const d = new Date(ms);
  const now = new Date();
  return d.toDateString() === now.toDateString() ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : d.toLocaleDateString([], { month: "2-digit", day: "2-digit" }) + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
const OC_CONV_UNLINKED_ID = "__oc_unlinked__";
var OpenCodeBridgeSessionView = class extends Disposable {
  constructor(parent, taskShelfParent, onShelfLayout, commandService, contextMenuService) {
    super();
    this.onShelfLayout = onShelfLayout;
    this.commandService = commandService;
    this.contextMenuService = contextMenuService;
    this.taskShelfBridgeMode = true;
    this.taskShelfCollapsed = false;
    this.cardStates = /* @__PURE__ */ new Map();
    this.taskDisplayInfo = /* @__PURE__ */ new Map();
    this.questionDrafts = /* @__PURE__ */ new Map();
    this.questionView = /* @__PURE__ */ new Map();
    this.currentChatRequestIds = void 0;
    this.pinnedTaskIds = /* @__PURE__ */ new Set();
    this.hiddenTaskIds = /* @__PURE__ */ new Set();
    this.taskCleanupBusy = false;
    this.taskInfoExpanded = false;
    this.visible = false;
    this.taskViewState = new BridgeTaskViewState();
    this.lastTaskStates = "";
    this.multiTaskLayout = false;
    this.multiTaskTab = "tasks";
    this.tabScrollTop = { tasks: 0, activities: 0 };
    this.taskHistoryExpanded = false;
    this.taskGroupExpanded = { running: true, unfinished: true, completed: false };
    this.activityTabVisited = false;
    // One in-flight status read at a time, with a deadline, backoff and disposal: a stuck
    // request can no longer freeze every later refresh.
    this.statusRefresher = new BridgeStatusRefresher(
      () => this.commandService.executeCommand(BRIDGE_GET_STATUS3),
      (status2, force) => {
        status2 = ocP39Seed(status2); // OpenCode p39: 截图用示例数据（默认关闭）
        this.lastStatus = status2;
        this.render(status2, force);
      },
      (error) => this.renderRefreshError(error),
      () => this.visible && !this.busy
    );
    this.busy = false;
    this.checkingHealth = false;
    this.footerCollapsed = false;
    this.expandedToolActivities = /* @__PURE__ */ new Set();
    this.lastRevision = -1;
    this.followTimeline = true;
    this.suppressScrollTracking = false;
    this.userScrollActiveUntil = 0;
    this.taskShelfParent = taskShelfParent;
    taskShelfParent.classList.add("opencode-unified-tasks");
    this.taskShelf = append(taskShelfParent, $(".opencode-bridge-task-shelf"));
    taskShelfParent.insertBefore(this.taskShelf, taskShelfParent.firstChild);
    this.taskShelf.hidden = true;
    // OpenCode: 标题栏「任务」开关（opencode.chat.toggleTaskShelf）改变时同步显示状态。
    this._register(addDisposableListener(globalThis, "opencode-task-shelf-visibility", () => {
      this.setVisible(this.visible, this.taskShelfBridgeMode);
      this.onShelfLayout();
    }));
    void Promise.resolve(this.commandService.executeCommand("opencode.chat.syncTaskShelfContext")).catch(() => void 0);
    const shelfHeading = append(this.taskShelf, $(".opencode-bridge-task-shelf-heading"));
    this.taskShelfTitle = append(shelfHeading, $("strong", void 0, localizeBridge("opencodeBridgeSession.unifiedTasks", "\u4EFB\u52A1")));
    this.taskShelfToggle = append(shelfHeading, $("button.opencode-bridge-task-shelf-toggle"));
    this.taskShelfToggle.type = "button";
    this.taskShelfToggle.textContent = "\u2304";
    this.taskShelfToggle.setAttribute("aria-label", localizeBridge("opencodeBridgeSession.collapseTasks", "\u6536\u8D77\u4EFB\u52A1"));
    this.taskShelfToggle.setAttribute("aria-expanded", "true");
    this._register(addDisposableListener(this.taskShelfToggle, "click", () => {
      this.taskShelfCollapsed = !this.taskShelfCollapsed;
      this.taskShelf.classList.toggle("collapsed", this.taskShelfCollapsed);
      this.taskShelfToggle.setAttribute("aria-expanded", String(!this.taskShelfCollapsed));
      this.taskShelfToggle.setAttribute("aria-label", this.taskShelfCollapsed ? "\u5C55\u5F00\u4EFB\u52A1" : "\u6536\u8D77\u4EFB\u52A1");
      this.applyTaskShelfHeight();
      this.onShelfLayout();
    }));
    // OpenCode p39: 任务架标题改为 VS Code 窗格标题：折叠箭头 + 大写「任务」+ 计数徽标；点击整行折叠/展开。
    this.taskShelf.classList.add("oc-p39");
    this.taskShelfToggle.textContent = "";
    this.taskShelfToggle.classList.add(...ThemeIcon.asClassNameArray(Codicon.chevronDown));
    this.ocP39ShelfBadge = append(shelfHeading, $("span.oc-p39-badge"));
    this.ocP39ShelfBadge.hidden = true;
    this._register(addDisposableListener(this.taskShelfToggle, "click", () => {
      this.taskShelfToggle.classList.toggle("codicon-chevron-down", !this.taskShelfCollapsed);
      this.taskShelfToggle.classList.toggle("codicon-chevron-right", this.taskShelfCollapsed);
    }));
    this._register(addDisposableListener(shelfHeading, "click", (event) => {
      if (event.target?.closest?.("button")) return;
      this.taskShelfToggle.click();
    }));
    // OpenCode ae-dock-step07: 按住「任务」标题拖动，可停靠到侧栏/面板/页面/独立窗口
    shelfHeading.draggable = true;
    shelfHeading.style.cursor = "grab";
    this._register(addDisposableListener(shelfHeading, "dragstart", (e) => {
      if (e.target?.closest?.("button")) {
        e.preventDefault();
        return;
      }
      globalThis.__ocDomDockDrag = { id: "bridgeTasks", title: "\u4EFB\u52A1", element: this.taskShelf, home: this.taskShelfParent, onChange: () => this.onShelfLayout() };
      try {
        e.dataTransfer?.setData("text/plain", "\u4EFB\u52A1");
        if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
      } catch {
      }
    }));
    this._register(addDisposableListener(shelfHeading, "dragend", () => {
      setTimeout(() => {
        globalThis.__ocDomDockDrag = void 0;
      }, 0);
    }));
    this.taskShelfBody = append(this.taskShelf, $(".opencode-bridge-task-shelf-body"));
    // OpenCode: 用户要求去掉任务标题右上角「···」按钮；菜单节点保留但不挂到界面，供原有渲染逻辑写入。
    const taskMenu = $("details.opencode-bridge-task-menu");
    const menuSummary = append(taskMenu, $("summary", void 0, "\xB7\xB7\xB7"));
    menuSummary.setAttribute("aria-label", "\u4EFB\u52A1\u64CD\u4F5C");
    this.taskMenuBody = append(taskMenu, $(".opencode-bridge-task-menu-body"));
    this.taskShelfResizeHandle = append(this.taskShelf, $(".opencode-bridge-task-shelf-resize"));
    this.taskShelfResizeHandle.setAttribute("role", "separator");
    this.taskShelfResizeHandle.setAttribute("aria-orientation", "horizontal");
    this.taskShelfResizeHandle.setAttribute("aria-label", "\u62D6\u52A8\u8C03\u6574\u4EFB\u52A1\u533A\u9AD8\u5EA6\uFF1B\u65B9\u5411\u952E\u5FAE\u8C03\uFF0CHome \u6062\u590D\u9ED8\u8BA4");
    this.taskShelfResizeHandle.tabIndex = -1;
    this.taskShelfResizeHandle.hidden = true;
    this.installTaskShelfResize();
    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => this.onShelfLayout());
      observer.observe(this.taskShelf);
      observer.observe(this.taskShelfParent);
      this._register(toDisposable(() => observer.disconnect()));
    }
    this._register(addDisposableListener(this.taskShelf, "wheel", (event) => event.stopPropagation()));
    this.root = append(parent, $(".opencode-bridge-session-view"));
    ocEnsureBridgeStyle(parent.ownerDocument);
    this.ocFilter = ocLoadFilter();
    // OpenCode p40: 「仅失败」芯片已由「失败」分区取代；文字筛选不跨会话保留。
    this.root.classList.add("oc-p39");
    this.ocFilter.failedOnly = false;
    this.ocFilter.text = "";
    this.root.style.display = "none";
    this.multiTaskTabs = append(this.root, $(".opencode-bridge-session-tabs"));
    this.multiTaskTabs.setAttribute("role", "tablist");
    this.multiTaskTabs.setAttribute("aria-label", localizeBridge("opencodeBridgeSession.navigation", "Bridge views"));
    this.tasksTab = append(this.multiTaskTabs, $("button.opencode-bridge-session-tab"));
    this.tasksTab.type = "button";
    this.tasksTab.setAttribute("role", "tab");
    this.activityTab = append(this.multiTaskTabs, $("button.opencode-bridge-session-tab"));
    this.activityTab.type = "button";
    this.activityTab.setAttribute("role", "tab");
    this.activityTab.textContent = localizeBridge("opencodeBridgeSession.activityTab", "Activity");
    this.multiTaskTabs.hidden = true;
    this._register(addDisposableListener(this.tasksTab, "click", () => this.selectMultiTaskTab("tasks")));
    this._register(addDisposableListener(this.activityTab, "click", () => this.selectMultiTaskTab("activities")));
    this._register(addDisposableListener(this.multiTaskTabs, "keydown", (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home" && event.key !== "End") {
        return;
      }
      event.preventDefault();
      const tab = event.key === "Home" ? "tasks" : event.key === "End" ? "activities" : this.multiTaskTab === "tasks" ? "activities" : "tasks";
      this.selectMultiTaskTab(tab);
      (tab === "tasks" ? this.tasksTab : this.activityTab).focus();
    }));
    this.localTaskEditor = append(this.taskShelfBody, $("form.opencode-bridge-task-local-editor"));
    this.localTaskEditor.hidden = true;
    const nameLabel = append(this.localTaskEditor, $("label.opencode-bridge-task-local-field"));
    append(nameLabel, $("span", void 0, localizeBridge("opencodeBridgeSession.localName", "\u4EFB\u52A1\u663E\u793A\u540D\uFF08\u4EC5\u672C\u7A97\u53E3\uFF09")));
    this.localNameInput = append(nameLabel, $("input.opencode-bridge-task-local-name"));
    this.localNameInput.type = "text";
    this.localNameInput.maxLength = 80;
    const sourceLabel = append(this.localTaskEditor, $("label.opencode-bridge-task-local-field"));
    append(sourceLabel, $("span", void 0, localizeBridge("opencodeBridgeSession.localSource", "\u6211\u7ED9\u6B64\u4EFB\u52A1\u53D6\u7684\u4F1A\u8BDD\uFF0F\u6765\u6E90\u522B\u540D\uFF08\u672A\u9A8C\u8BC1\uFF0C\u4EC5\u672C\u7A97\u53E3\uFF09")));
    this.localSourceInput = append(sourceLabel, $("input.opencode-bridge-task-local-source"));
    this.localSourceInput.type = "text";
    this.localSourceInput.maxLength = 80;
    append(this.localTaskEditor, $(
      "span.opencode-bridge-task-local-warning",
      void 0,
      localizeBridge("opencodeBridgeSession.localOnly", "\u53EA\u7ED9\u5F53\u524D\u4EFB\u52A1\u5361\u8D34\u6807\u7B7E\uFF1B\u4E0D\u4F1A\u81EA\u52A8\u5173\u8054\u5176\u4ED6\u4EFB\u52A1\uFF0C\u4E0D\u8BC1\u660E\u5BA2\u6237\u7AEF\uFF0F\u804A\u5929\u4F1A\u8BDD\u8EAB\u4EFD\uFF0C\u4E5F\u4E0D\u6539\u53D8\u4EFB\u52A1\u6743\u9650\u3002\u5173\u95ED\u7A97\u53E3\u540E\u4E0D\u4FDD\u8BC1\u4FDD\u7559\u3002")
    ));
    const localActions = append(this.localTaskEditor, $(".opencode-bridge-task-local-editor-actions"));
    const saveLocal = append(localActions, $("button.opencode-bridge-task-local-save"));
    saveLocal.type = "submit";
    saveLocal.textContent = localizeBridge("opencodeBridgeSession.localSave", "\u4FDD\u5B58\u672C\u7A97\u53E3\u540D\u79F0\u4E0E\u522B\u540D");
    const cancelLocal = append(localActions, $("button.opencode-bridge-task-local-cancel"));
    cancelLocal.type = "button";
    cancelLocal.textContent = localizeBridge("opencodeBridgeSession.localCancel", "Cancel");
    this._register(addDisposableListener(cancelLocal, "click", () => this.closeLocalTaskEditor(true)));
    this._register(addDisposableListener(this.localTaskEditor, "submit", (event) => {
      event.preventDefault();
      this.saveLocalTaskInfo();
    }));
    this.todosRegion = append(this.taskShelfBody, $(".opencode-bridge-session-todos-region"));
    this.timelineScroll = append(this.root, $(".opencode-bridge-session-scroll"));
    this.timeline = append(this.timelineScroll, $(".opencode-bridge-session-timeline"));
    this._register(addDisposableListener(this.timelineScroll, "scroll", () => this.onTimelineScroll()));
    this._register(addDisposableListener(this.root, "wheel", (event) => {
      event.stopPropagation();
    }));
    const footer = append(this.root, $(".opencode-bridge-session-footer"));
    const connectionRow = append(footer, $(".opencode-bridge-session-connection-row"));
    const connectionHeader = append(connectionRow, $(".opencode-bridge-session-connection-header"));
    const connectionInfo = append(connectionHeader, $(".opencode-bridge-session-connection-info"));
    const connectionHeading = append(connectionInfo, $(".opencode-bridge-session-connection-heading"));
    this.connectionDot = append(connectionHeading, $("span.opencode-bridge-session-dot"));
    this.connectionTitle = append(connectionHeading, $("strong"));
    this.connectionDescription = append(connectionInfo, $("span.opencode-bridge-session-connection-description"));
    this.failureLink = append(connectionInfo, $("button.opencode-bridge-session-failure-link"));
    this.failureLink.type = "button";
    this.failureLink.hidden = true;
    this.failureLink.textContent = bridgeStartupFailureCopy(BRIDGE_STARTUP_FAILURE_CHROME.openBridgePage);
    this._register(addDisposableListener(this.failureLink, "click", () => void openBridgePage(this.commandService)));
    this.collapseButton = this._register(new Button(connectionHeader, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
    this.collapseButton.element.classList.add("opencode-bridge-session-collapse-button");
    this._register(this.collapseButton.onDidClick(() => this.toggleFooterCollapsed()));
    const connectionActions = append(connectionRow, $(".opencode-bridge-session-connection-actions"));
    this.startStopButton = this._register(new Button(connectionActions, { ...defaultButtonStyles, supportIcons: true }));
    this.startStopButton.element.classList.add("opencode-bridge-session-start-stop-button");
    this._register(this.startStopButton.onDidClick(() => void this.toggleBridge()));
    this.clearLogButton = this._register(new Button(connectionActions, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
    this.clearLogButton.element.classList.add("opencode-bridge-session-action-button", "opencode-bridge-session-clear-button");
    this._register(this.clearLogButton.onDidClick(() => void this.clearActivityLog()));
    this.healthButton = this._register(new Button(connectionActions, { ...defaultButtonStyles, secondary: true, supportIcons: true }));
    this.healthButton.element.classList.add("opencode-bridge-session-action-button", "opencode-bridge-session-health-button");
    this._register(this.healthButton.onDidClick(() => void this.checkHealth()));
    // OpenCode p41: 底部改为紧凑状态栏：停止 / 清除记录 / 健康检查移到状态行右侧（VS Code 操作栏图标 + 悬停提示）；
    //   Bridge 未运行时只显示一个主按钮「启动 Bridge」。
    connectionHeader.appendChild(connectionActions);
    connectionActions.classList.add("oc-p41-actionbar");
    connectionActions.setAttribute("role", "toolbar");
    this.ocStartRow = append(footer, $(".oc-p41-start-row"));
    this.ocStartRow.hidden = true;
    this.ocStartButton = this._register(new Button(this.ocStartRow, { ...defaultButtonStyles, supportIcons: true }));
    this.ocStartButton.element.classList.add("oc-p41-start-button");
    this._register(this.ocStartButton.onDidClick(() => void this.toggleBridge()));
    this.footerDetails = append(footer, $(".opencode-bridge-session-footer-details"));
    this.statsContainer = append(this.footerDetails, $(".opencode-bridge-session-stats"));
    this.healthRow = append(this.footerDetails, $(".opencode-bridge-session-health"));
    this.healthDot = append(this.healthRow, $("span.opencode-bridge-session-dot"));
    this.healthText = append(this.healthRow, $("span.opencode-bridge-session-health-text"));
    setVisibility(false, this.healthRow);
    this.footerMeta = append(this.footerDetails, $(".opencode-bridge-session-meta"));
    this.footerHint = append(this.footerDetails, $(".opencode-bridge-session-hint"));
    this.renderFooterCollapsedState();
    const timer = setInterval(() => void this.refresh(), 350);
    this._register(toDisposable(() => clearInterval(timer)));
    this._register(toDisposable(() => this.statusRefresher.dispose()));
  }
  static {
    this.NEAR_BOTTOM_SCROLL_THRESHOLD_PX = 72;
  }
  static {
    this.USER_SCROLL_RENDER_COOLDOWN_MS = 500;
  }
  get taskShelfHeight() {
    if (this.taskShelf.dataset.ocDocked === "1") return 0;
    return this.taskShelf.hidden ? 0 : this.taskShelf.offsetHeight;
  }
  taskShelfHeightBounds() {
    const available = this.taskShelfParent.clientHeight;
    if (!available) {
      return void 0;
    }
    const max = Math.max(52, Math.min(available * 0.75, available - (this.taskShelfBridgeMode ? 210 : 320)));
    return { min: Math.min(132, max), max };
  }
  applyTaskShelfHeight() {
    const bounds = this.taskShelfHeightBounds();
    this.taskShelfResizeHandle.setAttribute("aria-valuemin", String(Math.round(bounds?.min ?? 0)));
    this.taskShelfResizeHandle.setAttribute("aria-valuemax", String(Math.round(bounds?.max ?? 0)));
    this.taskShelf.classList.toggle("resized", !this.taskShelfCollapsed && this.requestedTaskShelfHeight !== void 0 && !!bounds);
    if (this.taskShelfCollapsed || this.requestedTaskShelfHeight === void 0 || !bounds) {
      this.taskShelf.style.height = "";
      this.taskShelf.style.maxHeight = "";
    } else {
      this.taskShelf.style.height = `${Math.round(Math.max(bounds.min, Math.min(bounds.max, this.requestedTaskShelfHeight)))}px`;
      this.taskShelf.style.maxHeight = "none";
    }
    this.taskShelfResizeHandle.setAttribute("aria-valuenow", String(Math.round(this.taskShelf.getBoundingClientRect().height)));
  }
  installTaskShelfResize() {
    const handle2 = this.taskShelfResizeHandle;
    let pointer;
    let startY = 0;
    let startHeight = 0;
    this._register(addDisposableListener(handle2, "pointerdown", (event) => {
      if (event.button !== 0 || this.taskShelf.hidden || this.taskShelfCollapsed) {
        return;
      }
      pointer = event.pointerId;
      startY = event.clientY;
      startHeight = this.taskShelf.getBoundingClientRect().height;
      handle2.setPointerCapture(pointer);
      event.preventDefault();
    }));
    this._register(addDisposableListener(handle2, "pointermove", (event) => {
      if (pointer !== event.pointerId) {
        return;
      }
      this.requestedTaskShelfHeight = startHeight + event.clientY - startY;
      this.applyTaskShelfHeight();
      this.onShelfLayout();
    }));
    const endDrag = (event) => {
      if (pointer !== event.pointerId) {
        return;
      }
      pointer = void 0;
      if (handle2.hasPointerCapture(event.pointerId)) {
        handle2.releasePointerCapture(event.pointerId);
      }
    };
    this._register(addDisposableListener(handle2, "pointerup", endDrag));
    this._register(addDisposableListener(handle2, "pointercancel", endDrag));
    this._register(addDisposableListener(handle2, "lostpointercapture", endDrag));
    this._register(addDisposableListener(handle2, "keydown", (event) => {
      if (event.key === "Home") {
        this.requestedTaskShelfHeight = void 0;
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        this.requestedTaskShelfHeight = this.taskShelf.getBoundingClientRect().height + (event.key === "ArrowDown" ? 24 : -24);
      } else {
        return;
      }
      event.preventDefault();
      this.applyTaskShelfHeight();
      this.onShelfLayout();
    }));
    this._register(addDisposableListener(handle2, "dblclick", () => {
      this.requestedTaskShelfHeight = void 0;
      this.applyTaskShelfHeight();
      this.onShelfLayout();
    }));
  }
  setVisible(visible, bridgeMode = true) {
    const reopening = visible && !this.visible;
    if (reopening) {
      this.followTimeline = true;
    }
    this.visible = visible;
    this.taskShelfBridgeMode = bridgeMode;
    setVisibility(visible && bridgeMode, this.root);
    // 标题栏开关决定显示与否；开着时没有任务也显示（空分组）。
    this.taskShelf.hidden = ocTaskShelfUserHidden() || !visible;
    this.applyTaskShelfHeight();
    if (visible) {
      void this.refresh(true);
    }
  }
  async toggleBridge() {
    if (this.busy) {
      return;
    }
    this.busy = true;
    this.renderControls();
    const starting = this.lastStatus?.state !== "running";
    try {
      const status2 = await this.commandService.executeCommand(starting ? BRIDGE_START2 : BRIDGE_STOP2);
      if (status2) {
        this.lastStatus = status2;
        this.render(status2, true);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.connectionDescription.textContent = starting ? describeBridgeStartupFailure(message).title : message;
    } finally {
      this.busy = false;
      this.renderControls();
      void this.refresh(true);
    }
  }
  toggleFooterCollapsed() {
    this.footerCollapsed = !this.footerCollapsed;
    this.renderFooterCollapsedState();
    if (this.lastStatus) {
      this.renderStatus(this.lastStatus);
    }
  }
  async checkHealth() {
    if (this.checkingHealth) {
      return;
    }
    this.checkingHealth = true;
    this.healthError = void 0;
    this.renderControls();
    this.renderHealth(this.lastStatus?.health);
    try {
      const status2 = await this.commandService.executeCommand(BRIDGE_CHECK_HEALTH);
      if (status2) {
        this.lastStatus = status2;
        this.render(status2, false);
      }
    } catch (error) {
      this.healthError = error instanceof Error ? error.message : String(error);
    } finally {
      this.checkingHealth = false;
      this.renderControls();
      this.renderHealth(this.lastStatus?.health);
    }
  }
  async clearActivityLog() {
    if (this.busy) {
      return;
    }
    this.busy = true;
    this.renderControls();
    try {
      const status2 = await this.commandService.executeCommand(BRIDGE_CLEAR_ACTIVITY_LOG);
      this.expandedToolActivities.clear();
      this.followTimeline = true;
      if (status2) {
        this.lastStatus = status2;
        this.render(status2, true);
      }
    } catch (error) {
      this.connectionDescription.textContent = error instanceof Error ? error.message : String(error);
    } finally {
      this.busy = false;
      this.renderControls();
    }
  }
  renderFooterCollapsedState() {
    this.root.classList.toggle("footer-collapsed", this.footerCollapsed);
    setVisibility(!this.footerCollapsed, this.footerDetails);
    this.collapseButton.label = `$(${this.footerCollapsed ? Codicon.chevronUp.id : Codicon.chevronDown.id})`;
    const title = this.footerCollapsed ? localizeBridge("opencodeBridgeSession.expandStatus", "Expand Bridge status") : localizeBridge("opencodeBridgeSession.collapseStatus", "Collapse Bridge status");
    this.ocP44SetTitle(this.collapseButton, title);
    this.collapseButton.element.setAttribute("aria-expanded", String(!this.footerCollapsed));
  }
  async refresh(force = false) {
    await this.statusRefresher.refresh(force);
  }
  renderRefreshError(error) {
    this.connectionTitle.textContent = localizeBridge("opencodeBridgeSession.unavailable", "Bridge unavailable");
    this.connectionDescription.textContent = error instanceof Error ? error.message : String(error);
    this.connectionDot.className = "opencode-bridge-session-dot state-error";
  }
  render(status2, force) {
    const tasks2 = (status2.tasks ?? []).filter((task) => !isBridgeTaskDisplayExpired(task));
    const availableIds = new Set(tasks2.map((task) => task.id));
    for (const id2 of this.cardStates.keys()) {
      if (!availableIds.has(id2)) {
        this.cardStates.delete(id2);
      }
    }
    for (const id2 of this.taskDisplayInfo.keys()) {
      if (!availableIds.has(id2)) {
        this.taskDisplayInfo.delete(id2);
      }
    }
    for (const id2 of this.pinnedTaskIds) {
      if (!availableIds.has(id2)) {
        this.pinnedTaskIds.delete(id2);
      }
    }
    for (const id2 of this.hiddenTaskIds) {
      if (!availableIds.has(id2)) {
        this.hiddenTaskIds.delete(id2);
      }
    }
    if (this.editingTaskId && !availableIds.has(this.editingTaskId)) {
      this.closeLocalTaskEditor(false);
    }
    const visibleTasks = tasks2.filter((task) => !this.hiddenTaskIds.has(task.id));
    this.multiTaskLayout = false;
    this.multiTaskTabs.hidden = true;
    this.taskShelf.hidden = ocTaskShelfUserHidden() || !this.visible;
    this.taskShelfTitle.textContent = localizeBridge("opencodeBridgeSession.unifiedTasks", "\u4EFB\u52A1");
    const selected = visibleTasks.find((task) => task.id === status2.taskId);
    const active = [...visibleTasks].filter((task) => !isBridgeTaskDisplayInactive(task.state)).sort((a, b) => b.updatedAt - a.updatedAt)[0];
    this.taskSnapshot = selected && (!isBridgeTaskDisplayInactive(selected.state) || !active || selected.updatedAt >= active.updatedAt) ? selected : active ?? selected ?? visibleTasks[0];
    if (this.editingTaskId && !visibleTasks.some((task) => task.id === this.editingTaskId)) {
      this.closeLocalTaskEditor(false);
    }
    const taskStates = tasks2.map((task) => `${task.id}:${task.revision}:${task.state}`).join("|");
    if (force || (status2.revision !== this.lastRevision || taskStates !== this.lastTaskStates) && Date.now() >= this.userScrollActiveUntil) {
      this.renderTimeline(status2.activities, this.taskSnapshot?.todos ?? (status2.tasks?.length ? [] : status2.todos), visibleTasks);
      this.lastRevision = status2.revision;
      this.lastTaskStates = taskStates;
    }
    this.renderStatus(status2);
    this.renderControls();
    this.ocP44Tick();
  }
  updateMultiTaskView(count2) {
    this.multiTaskTabs.hidden = !this.multiTaskLayout;
    this.tasksTab.textContent = localizeBridge("opencodeBridgeSession.tasksCount", "Tasks ({0})", count2);
    this.todosRegion.hidden = this.multiTaskLayout && this.multiTaskTab !== "tasks";
    this.timeline.hidden = this.multiTaskLayout && this.multiTaskTab !== "activities";
    this.tasksTab.setAttribute("aria-selected", String(this.multiTaskTab === "tasks"));
    this.activityTab.setAttribute("aria-selected", String(this.multiTaskTab === "activities"));
    this.tasksTab.tabIndex = this.multiTaskTab === "tasks" ? 0 : -1;
    this.activityTab.tabIndex = this.multiTaskTab === "activities" ? 0 : -1;
    this.localTaskEditor.hidden = !this.editingTaskId || this.multiTaskLayout && this.multiTaskTab !== "tasks";
  }
  openLocalTaskEditor(taskId) {
    const info = this.taskDisplayInfo.get(taskId);
    this.editingTaskId = taskId;
    this.localNameInput.value = info?.name ?? "";
    this.localSourceInput.value = info?.source ?? "";
    this.localTaskEditor.hidden = false;
    this.localNameInput.focus();
  }
  closeLocalTaskEditor(restoreFocus) {
    this.editingTaskId = void 0;
    this.localTaskEditor.hidden = true;
    if (restoreFocus) {
      this.focusLocalTaskAction(".opencode-bridge-task-local-edit");
    }
  }
  focusLocalTaskAction(selector) {
    const button = this.todosRegion.querySelector(selector);
    const summary = this.todosRegion.querySelector(".opencode-bridge-todos-summary");
    const target = button?.closest("details")?.open && !button.closest("[hidden]") ? button : summary;
    target?.focus({ preventScroll: true });
  }
  saveLocalTaskInfo() {
    const id2 = this.editingTaskId;
    if (!id2 || !this.lastStatus?.tasks?.some((task) => task.id === id2)) {
      this.closeLocalTaskEditor(false);
      return;
    }
    const name = this.localNameInput.value.trim().slice(0, 80);
    const source = this.localSourceInput.value.trim().slice(0, 80);
    if (name || source) {
      this.taskDisplayInfo.set(id2, { name: name || void 0, source: source || void 0 });
    } else {
      this.taskDisplayInfo.delete(id2);
    }
    this.closeLocalTaskEditor(false);
    this.render(this.lastStatus, true);
    this.focusLocalTaskAction(".opencode-bridge-task-local-edit");
  }
  hideLocalTask(taskId) {
    const task = this.lastStatus?.tasks?.find((candidate) => candidate.id === taskId);
    if (!task) {
      return;
    }
    this.hiddenTaskIds.add(taskId);
    if (this.editingTaskId === taskId) {
      this.closeLocalTaskEditor(false);
    }
    this.render(this.lastStatus, true);
    this.todosRegion.querySelector(".opencode-bridge-task-show-hidden")?.focus({ preventScroll: true });
  }
  restoreHiddenTasks() {
    if (!this.hiddenTaskIds.size || !this.lastStatus) {
      return;
    }
    this.hiddenTaskIds.clear();
    this.render(this.lastStatus, true);
    (this.todosRegion.querySelector(".opencode-bridge-task-index-heading") ?? this.todosRegion.querySelector(".opencode-bridge-todos-summary"))?.focus({ preventScroll: true });
  }
  renderHiddenTaskControl(tasks2) {
    if (!this.hiddenTaskIds.size) {
      return;
    }
    const control = append(this.taskMenuBody, $(".opencode-bridge-task-hidden-control"));
    if (!tasks2.length) {
      append(control, $("span", void 0, localizeBridge("opencodeBridgeSession.noVisibleTasks", "No visible tasks in this window.")));
    }
    const show3 = append(control, $("button.opencode-bridge-task-show-hidden"));
    show3.type = "button";
    show3.textContent = localizeBridge("opencodeBridgeSession.showHiddenTasks", "Show hidden tasks ({0})", this.hiddenTaskIds.size);
    show3.addEventListener("click", () => this.restoreHiddenTasks());
  }
  /** Deletion is not a preference: the extension shows its own modal and rechecks revisions. */
  async clearTaskRecords(requests, allowAttention = false) {
    if (this.taskCleanupBusy || !requests.length) {
      return;
    }
    this.taskCleanupBusy = true;
    this.taskCleanupError = void 0;
    try {
      const status2 = await this.commandService.executeCommand(BRIDGE_CLEAR_TASKS_CONFIRMED, { requests, allowAttention });
      if (status2) {
        this.lastStatus = status2;
        this.render(status2, true);
        (this.todosRegion.querySelector(".opencode-bridge-task-index-heading") ?? this.todosRegion.querySelector(".opencode-bridge-todos-summary") ?? (this.multiTaskTabs?.hidden ? this.startStopButton.element : this.tasksTab))?.focus({ preventScroll: true });
      }
    } catch (error) {
      this.taskCleanupError = error instanceof Error ? error.message : String(error);
      if (this.lastStatus) {
        this.render(this.lastStatus, true);
      }
    } finally {
      this.taskCleanupBusy = false;
      this.todosRegion.querySelectorAll(".opencode-bridge-task-clear-finished, .opencode-bridge-task-local-clear, .opencode-bridge-task-interrupt-action").forEach((button) => button.disabled = false);
      if (this.taskCleanupError) {
        (this.todosRegion.querySelector(allowAttention ? ".opencode-bridge-task-local-clear" : ".opencode-bridge-task-clear-finished") ?? this.todosRegion.querySelector(".opencode-bridge-todos-summary") ?? (this.multiTaskTabs?.hidden ? this.startStopButton.element : this.tasksTab))?.focus({ preventScroll: true });
      }
    }
  }
  async markStaleTaskInterrupted(request2) {
    if (this.taskCleanupBusy) {
      return;
    }
    this.taskCleanupBusy = true;
    this.todosRegion.querySelectorAll(".opencode-bridge-task-interrupt-action, .opencode-bridge-task-clear-finished, .opencode-bridge-task-local-clear").forEach((button) => button.disabled = true);
    this.taskCleanupError = void 0;
    let restoreInterruptFocus = true;
    try {
      const status2 = await this.commandService.executeCommand(BRIDGE_INTERRUPT_STALE_TASKS_CONFIRMED, { requests: [request2] });
      if (status2) {
        this.lastStatus = status2;
        this.render(status2, true);
        restoreInterruptFocus = status2.tasks?.some((task) => task.id === request2.id && task.state === "awaiting_sync") ?? false;
      }
    } catch (error) {
      this.taskCleanupError = error instanceof Error ? error.message : String(error);
      if (this.lastStatus) {
        this.render(this.lastStatus, true);
      }
    } finally {
      this.taskCleanupBusy = false;
      this.todosRegion.querySelectorAll(".opencode-bridge-task-interrupt-action, .opencode-bridge-task-clear-finished, .opencode-bridge-task-local-clear").forEach((button) => button.disabled = false);
      const card = [...this.todosRegion.querySelectorAll(".opencode-bridge-task-card")].find((candidate) => candidate.dataset.taskId === request2.id);
      const target = restoreInterruptFocus ? card?.querySelector(".opencode-bridge-task-interrupt-action") : card?.querySelector(".opencode-bridge-todos-summary");
      (target ?? this.todosRegion.querySelector(".opencode-bridge-todos-summary") ?? (this.multiTaskTabs?.hidden ? this.startStopButton.element : this.tasksTab))?.focus({ preventScroll: true });
    }
  }
  renderTaskManagementControls(tasks2) {
    const finished = tasks2.filter((task) => task.state === "completed");
    if (!finished.length && !this.taskCleanupError) {
      return;
    }
    const control = append(this.taskMenuBody, $(".opencode-bridge-task-management"));
    if (finished.length) {
      const clear = append(control, $("button.opencode-bridge-task-clear-finished"));
      clear.type = "button";
      clear.disabled = this.taskCleanupBusy;
      clear.textContent = localizeBridge("opencodeBridgeSession.clearFinishedTasks", "Clear completed tasks ({0})", finished.length);
      clear.addEventListener("click", () => void this.clearTaskRecords(finished.map((task) => ({ id: task.id, revision: task.revision }))));
      append(control, $(
        "span.opencode-bridge-task-retention-note",
        void 0,
        "任务与记忆持久保存，不按时间清除；删除仅移除任务显示。自己的下一个任务只移除同一记忆中自己的前一个已完成任务显示。"
      ));
    }
    if (this.taskCleanupError) {
      const error = append(control, $("span.opencode-bridge-task-cleanup-error", void 0, this.taskCleanupError));
      error.setAttribute("role", "alert");
    }
  }
  renderStaleTaskInterruptControl(card, task) {
    if (task.state !== "awaiting_sync") {
      return;
    }
    const control = append(card, $(".opencode-bridge-task-interrupt-control"));
    const button = append(control, $("button.opencode-bridge-task-interrupt-action"));
    button.type = "button";
    button.disabled = this.taskCleanupBusy;
    button.dataset.taskId = task.id;
    const hint = localizeBridge("opencodeBridgeSession.interruptStaleLocallyHint", "Only changes OpenCode local tracking; the local record remains available until explicitly hidden or removed. It does not stop, cancel, or control external AI/MCP execution.");
    button.title = hint;
    button.setAttribute("aria-label", hint);
    const icon2 = append(button, $("span.opencode-bridge-task-interrupt-icon.codicon.codicon-warning"));
    icon2.setAttribute("aria-hidden", "true");
    append(button, $(
      "span.opencode-bridge-task-interrupt-label",
      void 0,
      localizeBridge("opencodeBridgeSession.interruptStaleLocally", "Mark interrupted locally")
    ));
    button.addEventListener("click", () => void this.markStaleTaskInterrupted({ id: task.id, revision: task.revision }));
    if (this.taskCleanupError) {
      const error = append(control, $("span.opencode-bridge-task-interrupt-error", void 0, this.taskCleanupError));
      error.setAttribute("role", "alert");
    }
  }
  renderTaskLocalControls(card, task) {
    const controls = append(card, $(".opencode-bridge-task-local-controls"));
    const action = (button, icon2, label3, description) => {
      button.type = "button";
      button.title = description;
      button.setAttribute("aria-label", description);
      const glyph = append(button, $(`span.opencode-bridge-task-action-icon.codicon.codicon-${icon2}`));
      glyph.setAttribute("aria-hidden", "true");
      append(button, $("span.opencode-bridge-task-action-text", void 0, label3));
    };
    const edit3 = append(controls, $("button.opencode-bridge-task-local-edit"));
    action(
      edit3,
      "edit",
      localizeBridge("opencodeBridgeSession.localEditShort", "\u6539\u540D"),
      localizeBridge("opencodeBridgeSession.localEditHint", "\u7F16\u8F91\u4EFB\u52A1\u540D\u79F0\u548C\u672C\u673A\u5907\u6CE8")
    );
    edit3.addEventListener("click", () => this.openLocalTaskEditor(task.id));
    const pinned = this.pinnedTaskIds.has(task.id);
    const pin = append(controls, $("button.opencode-bridge-task-local-pin"));
    action(pin, pinned ? "pinned" : "pin", pinned ? localizeBridge("opencodeBridgeSession.localUnpinShort", "\u53D6\u6D88\u7F6E\u9876") : localizeBridge("opencodeBridgeSession.localPinShort", "\u7F6E\u9876"), pinned ? localizeBridge("opencodeBridgeSession.localUnpinHint", "\u53D6\u6D88\u5728\u672C\u7A97\u53E3\u7F6E\u9876\u4EFB\u52A1") : localizeBridge("opencodeBridgeSession.localPinHint", "\u5728\u672C\u7A97\u53E3\u7F6E\u9876\u4EFB\u52A1"));
    pin.setAttribute("aria-pressed", String(pinned));
    pin.addEventListener("click", () => {
      if (this.pinnedTaskIds.has(task.id)) {
        this.pinnedTaskIds.delete(task.id);
      } else {
        this.pinnedTaskIds.add(task.id);
      }
      if (this.lastStatus) {
        this.render(this.lastStatus, true);
        this.focusLocalTaskAction(".opencode-bridge-task-local-pin");
      }
    });
    {
      const hide4 = append(controls, $("button.opencode-bridge-task-local-hide"));
      action(
        hide4,
        "eye-closed",
        localizeBridge("opencodeBridgeSession.hideLocalTaskShort", "\u9690\u85CF"),
        localizeBridge("opencodeBridgeSession.hideAnyTaskHint", "\u5728\u672C\u7A97\u53E3\u9690\u85CF\u4EFB\u52A1\uFF08\u53EF\u6062\u590D\uFF09")
      );
      hide4.addEventListener("click", () => this.hideLocalTask(task.id));
    }
    if (task.state === "blocked" || task.state === "interrupted") {
      const danger = append(card, $(".opencode-bridge-task-local-danger"));
      const clear = append(danger, $("button.opencode-bridge-task-local-clear"));
      action(
        clear,
        "trash",
        localizeBridge("opencodeBridgeSession.clearAttentionShort", "\u6E05\u9664"),
        localizeBridge("opencodeBridgeSession.clearAttentionHint", "\u6C38\u4E45\u6E05\u9664\u672A\u5B8C\u6210\u4EFB\u52A1\uFF08\u9700\u786E\u8BA4\uFF09")
      );
      clear.disabled = this.taskCleanupBusy;
      clear.addEventListener("click", () => void this.clearTaskRecords([{ id: task.id, revision: task.revision }], true));
    }
    const info = append(card, $("details.opencode-bridge-task-diagnostics"));
    info.open = this.taskInfoExpanded;
    info.addEventListener("click", (event) => {
      if (event.target === info.querySelector("summary")) {
        this.taskInfoExpanded = !info.open;
      }
    });
    info.addEventListener("toggle", () => {
      if (info.isConnected) {
        this.taskInfoExpanded = info.open;
      }
    });
    append(info, $(
      "summary",
      void 0,
      task.originKind === "chat" ? "\u4EFB\u52A1\u4FE1\u606F\uFF08\u672C\u673A Chat\uFF09" : localizeBridge("opencodeBridgeSession.taskDiagnostics", "\u4EFB\u52A1\u4FE1\u606F\uFF08\u6765\u6E90\u672A\u9A8C\u8BC1\uFF09")
    ));
    const infoBody = append(info, $(".opencode-bridge-task-diagnostics-content"));
    const source = this.taskDisplayInfo.get(task.id)?.source;
    if (source) {
      append(infoBody, $(
        "span.opencode-bridge-task-local-source",
        void 0,
        localizeBridge("opencodeBridgeSession.localSourceValue", "\u6211\u6807\u6CE8\u7684\u4F1A\u8BDD\uFF0F\u6765\u6E90\uFF08\u672A\u9A8C\u8BC1\uFF09\uFF1A{0}", source)
      ));
    }
    append(infoBody, $(
      "span.opencode-bridge-task-source-confidence",
      void 0,
      task.originKind === "chat" ? "\u672C\u673A Chat \u4F1A\u8BDD\uFF1B\u6A21\u578B\u54C1\u724C\u672A\u7ECF\u9A8C\u8BC1" : task.source?.label ? localizeBridge("opencodeBridgeSession.selfReportedSource", "Client self-reported (unverified): {0}", task.source.label) : localizeBridge("opencodeBridgeSession.unknownSource", "Client source unknown (unverified)")
    ));
    if (task.attribution?.ownerBound) {
      append(infoBody, $(
        "span.opencode-bridge-task-attribution",
        void 0,
        task.originKind === "chat" ? "\u672C\u673A Chat \u4EFB\u52A1\u5F52\u5C5E\u5DF2\u6821\u9A8C\uFF1B\u6A21\u578B\u8EAB\u4EFD\u672A\u9A8C\u8BC1" : localizeBridge("opencodeBridgeSession.ownerBoundOnly", "Bridge \u4EFB\u52A1\u5F52\u5C5E\u5DF2\u6821\u9A8C\uFF1B\u5BA2\u6237\u7AEF\u8EAB\u4EFD\u672A\u9A8C\u8BC1\uFF1B\u804A\u5929\u4F1A\u8BDD\u672A\u77E5")
      ));
    }
    if (task.progress && !task.progress.todoId && task.state === "running") {
      append(infoBody, $(
        "span.opencode-bridge-task-level-progress",
        void 0,
        localizeBridge("opencodeBridgeSession.taskLevelReport", "\u4EFB\u52A1\u7EA7\u4E0A\u62A5\uFF08\u975E\u6B65\u9AA4\u8FDB\u5EA6\uFF09\uFF1A{0}", task.progress.message ?? task.progress.phase ?? "\u2014")
      ));
    }
    append(infoBody, $("span.opencode-bridge-task-created-at", void 0, task.createdAt !== void 0 && Number.isFinite(task.createdAt) && task.createdAt > 0 && Number.isFinite(new Date(task.createdAt).getTime()) ? localizeBridge("opencodeBridgeSession.createdAt", "Created: {0}", new Date(task.createdAt).toLocaleString()) : localizeBridge("opencodeBridgeSession.createdAtUnknown", "Created: unknown")));
    append(infoBody, $(
      "span.opencode-bridge-task-updated-at",
      void 0,
      Number.isFinite(task.updatedAt) && task.updatedAt > 0 && Number.isFinite(new Date(task.updatedAt).getTime()) ? localizeBridge("opencodeBridgeSession.lastUpdated", "\u6700\u8FD1\u66F4\u65B0\uFF1A{0}", new Date(task.updatedAt).toLocaleString()) : localizeBridge("opencodeBridgeSession.lastUpdatedUnknown", "\u6700\u8FD1\u66F4\u65B0\uFF1A\u672A\u77E5")
    ));
    append(infoBody, $(
      "span.opencode-bridge-task-short-code",
      void 0,
      localizeBridge("opencodeBridgeSession.taskShortCode", "\u4EFB\u52A1\u77ED\u7801\uFF1A{0}\uFF08\u4E0D\u53EF\u7528\u4E8E\u7EED\u5199\uFF09", task.id.slice(0, 8))
    ));
  }
  selectMultiTaskTab(tab) {
    if (!this.multiTaskLayout || tab === this.multiTaskTab) {
      return;
    }
    this.tabScrollTop[this.multiTaskTab] = this.timelineScroll.scrollTop;
    this.multiTaskTab = tab;
    this.updateMultiTaskView(this.lastStatus?.tasks?.filter((task) => !this.hiddenTaskIds.has(task.id)).length ?? 0);
    this.suppressScrollTracking = true;
    if (tab === "activities" && !this.activityTabVisited) {
      this.activityTabVisited = true;
      this.timelineScroll.scrollTop = this.timelineScroll.scrollHeight;
      this.followTimeline = true;
    } else {
      this.timelineScroll.scrollTop = this.tabScrollTop[tab];
      const distance = this.timelineScroll.scrollHeight - this.timelineScroll.scrollTop - this.timelineScroll.clientHeight;
      this.followTimeline = tab === "activities" && distance < OpenCodeBridgeSessionView.NEAR_BOTTOM_SCROLL_THRESHOLD_PX;
    }
    setTimeout(() => {
      this.suppressScrollTracking = false;
    }, 0);
  }
  renderTimeline(activities, todos, tasks2) {
    const viewport = this.captureTimelineViewport();
    const taskScrollTop = this.todosRegion.scrollTop;
    const focused = this.todosRegion.contains(this.todosRegion.ownerDocument.activeElement) ? this.todosRegion.ownerDocument.activeElement : void 0;
    const focusKey = focused?.closest(".opencode-bridge-task-card")?.dataset.taskShortCode;
    const focusSelector = [
      ".opencode-bridge-todos-summary",
      ".opencode-bridge-task-local-edit",
      ".opencode-bridge-task-local-pin",
      ".opencode-bridge-task-local-hide",
      ".opencode-bridge-task-show-hidden",
      ".opencode-bridge-task-clear-finished",
      ".opencode-bridge-task-interrupt-action"
    ].find((selector) => focused?.matches(selector));
    this.closeTaskContextMenu?.();
    {
      const active = this.timeline.ownerDocument.activeElement;
      this.ocFocusKey = active?.closest?.(".oc-conv-back") && this.timeline.contains(active) ? "back" : active?.closest?.(".oc-conv-row") && this.timeline.contains(active) ? active.closest(".oc-conv-row").dataset.convId : void 0;
    }
    clearNode(this.todosRegion);
    clearNode(this.timeline);
    clearNode(this.taskMenuBody);
    const originalTask = this.taskSnapshot;
    const { slots, unfinished, history } = partitionBridgeTaskDisplay(tasks2);
    for (const [key, label, color, tasks] of [
      ["running", "进行中", "var(--vscode-charts-yellow,#d7ba7d)", slots],
      ["unfinished", "未完成", "var(--vscode-errorForeground,#f48771)", unfinished],
      ["completed", "已完成", "var(--vscode-charts-green,#89d185)", history]
    ]) {
      const group = append(this.todosRegion, $("details.opencode-bridge-task-group"));
      group.dataset.taskGroup = key;
      group.open = this.taskGroupExpanded[key];
      const heading = append(group, $("summary.opencode-task-group-heading"));
      heading.style.setProperty("--opencode-task-group-color", color);
      append(heading, $("span.opencode-task-group-dot", { "aria-hidden": "true" }));
      append(heading, $("span.opencode-task-group-label", void 0, label));
      append(heading, $("span.opencode-task-group-count", void 0, String(tasks.length)));
      // OpenCode p39: 分组行 = 折叠箭头 + codicon（进行中 sync~spin / 未完成 circle-large-outline / 已完成 pass）+ 名称 + 计数徽标。
      const ocTw = $("span.oc-p39-twistie", { "aria-hidden": "true" });
      ocTw.classList.add(...ThemeIcon.asClassNameArray(Codicon.chevronRight));
      heading.insertBefore(ocTw, heading.firstChild);
      const ocIcon = $("span.oc-p39-icon", { "aria-hidden": "true" });
      ocIcon.classList.add(...ThemeIcon.asClassNameArray(key === "running" ? tasks.length ? ThemeIcon.modify(Codicon.sync, "spin") : Codicon.sync : key === "unfinished" ? Codicon.circleLargeOutline : Codicon.pass));
      ocTw.after(ocIcon);
      append(heading, $("span.oc-p39-badge", void 0, String(tasks.length)));
      group.classList.toggle("oc-p42-empty", !tasks.length); // OpenCode p42: 空分组不显示折叠箭头（展开后什么都没有，箭头是误导）
      group.addEventListener("toggle", () => { if (group.isConnected) this.taskGroupExpanded[key] = group.open; });
      for (const task of [...tasks].sort((a,b) => Number(this.pinnedTaskIds.has(b.id))-Number(this.pinnedTaskIds.has(a.id)))) {
        this.taskSnapshot = task;
        this.renderTodos(task.todos, activities);
        const card = this.todosRegion.lastElementChild;
        if (card && card !== group) {
          group.appendChild(card);
          this.installTaskContextMenu(card, task);
          this.ocP39DecorateTaskRow(card, task); // OpenCode p39
        }
      }
    }
    this.taskSnapshot = originalTask;
    this.ocLastTasks = tasks2;
    this.ocP44RenderTaskSegments({ slots, unfinished, history }, activities);
    // OpenCode p39: 任务架标题上的总数徽标。
    if (this.ocP39ShelfBadge) {
      this.ocP39ShelfBadge.textContent = String(tasks2.length);
      this.ocP39ShelfBadge.hidden = !tasks2.length;
    }
    this.renderHiddenTaskControl(tasks2);
    this.renderTaskManagementControls((this.lastStatus?.tasks ?? tasks2).filter((task) => !isBridgeTaskDisplayExpired(task)));
    this.todosRegion.scrollTop = taskScrollTop;
    if (focusSelector) {
      const card = focusKey ? [...this.todosRegion.querySelectorAll(".opencode-bridge-task-card")].find((element) => element.dataset.taskShortCode === focusKey) : this.todosRegion;
      const target = card?.querySelector(focusSelector);
      if (target && !target.closest("[hidden]")) {
        target.focus({ preventScroll: true });
      }
    }
    // OpenCode p40: 不再先显示对话列表；直接按「正在运行 / 失败 / 最近」分区列出调用（每次调用一行，VS Code 树视图样式，新的在上）。
    //   某个任务的调用：任务架中任务行的行内按钮或双击打开；Esc 或左上角箭头返回。
    const convs = this.ocBuildConversations(activities, tasks2);
    let conv = this.ocConvId ? convs.find((c) => c.id === this.ocConvId) : void 0;
    if (this.ocConvId && !conv) this.ocConvId = void 0;
    this.timeline.classList.toggle("oc-conv-page", !!conv);
    this.timeline.classList.toggle("oc-conv-list-page", !conv);
    this.ocInstallConvKeys();
    this.ocLastTimelineArgs = [conv ? this.ocAllActivities : activities, todos, tasks2];
    if (conv) {
      this.ocP40RenderConvHeader(conv);
      activities = conv.activities;
    }
    const ocMultiClient = this.ocP40SyncFilter(activities);
    if (!activities.length && conv) {
      append(this.timeline, $(".oc-p40-empty", void 0, "这个任务还没有工具调用记录。"));
      this.restoreTimelineViewport(viewport);
      this.ocRestoreConvFocus();
      return;
    }
    if (!activities.length) {
      const empty = append(this.timeline, $(".opencode-bridge-session-empty"));
      const icon2 = append(empty, $("span"));
      icon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.radioTower));
      append(empty, $("strong", void 0, tasks2.length || this.hiddenTaskIds.size ? localizeBridge("opencodeBridgeSession.noActivity", "No tool activity yet") : localizeBridge("opencodeBridgeSession.waiting", "Waiting for MCP client connection")));
      append(empty, $("span", void 0, tasks2.length || this.hiddenTaskIds.size ? localizeBridge("opencodeBridgeSession.noActivityDetail", "Tool activity will appear here when it is reported.") : localizeBridge("opencodeBridgeSession.waitingDetail", "Tool calls from the MCP client connected to Bridge appear here. By default, operations target the workspace folder(s) currently open in OpenCode on this Windows PC. Conversation input remains in the external client.")));
      this.restoreTimelineViewport(viewport);
      return;
    }
    this.ocP40RenderSections(activities, ocMultiClient);
    this.restoreTimelineViewport(viewport);
    this.ocRestoreConvFocus();
  }
  // OpenCode p44: 「进行中 / 未完成 / 已完成」改为一行分段筛选（取代三行分组标题）。
  //   未选中：显示进行中 + 未完成；点某段只看该段（同时筛选下方调用列表）；再点一次取消。
  //   「进行中」段另标正在运行的调用数（这些调用可能不属于进行中的任务，如未归属或已结束任务的后台命令）。
  ocP44RenderTaskSegments(parts, activities) {
    this.ocP44TaskSeg ??= ocP44LoadJson(OC_P44_TASK_SEG_KEY, "") || void 0;
    const sel = this.ocP44TaskSeg;
    const lists = { running: parts.slots, unfinished: parts.unfinished, completed: parts.history };
    this.ocP44SegTaskIds = sel ? new Set(lists[sel].map((t) => t.id)) : void 0;
    const runningCalls = ocP44CountStates(activities ?? []).running;
    this.taskShelf.classList.add("oc-p44-seg-mode");
    const bar = $(".oc-p44-seg", { role: "radiogroup", "aria-label": "按任务状态筛选" });
    this.todosRegion.insertBefore(bar, this.todosRegion.firstChild);
    const defs = [["running", "进行中", running0 => running0 ? ThemeIcon.modify(Codicon.sync, "spin") : Codicon.sync], ["unfinished", "未完成", () => Codicon.circleLargeOutline], ["completed", "已完成", () => Codicon.pass]];
    for (const [key, label, iconOf] of defs) {
      const n = lists[key].length;
      const btn = append(bar, $("button", { type: "button", role: "radio" }));
      btn.dataset.seg = key;
      btn.classList.toggle("active", sel === key);
      btn.setAttribute("aria-checked", String(sel === key));
      const ic = append(btn, $("span", { "aria-hidden": "true" }));
      ic.classList.add(...ThemeIcon.asClassNameArray(iconOf(n || key === "running" && runningCalls)));
      append(btn, $("span.oc-p44-seg-label", void 0, label));
      append(btn, $("span.oc-p44-seg-n", void 0, String(n)));
      let tip = `${label}：${n} 个任务`;
      if (key === "running" && runningCalls) {
        append(btn, $("span.oc-p44-seg-calls", void 0, `\xB7 ${runningCalls} 运行`));
        tip += `；${runningCalls} 个工具调用正在运行`;
      }
      btn.title = `${tip}\n${sel === key ? "再点一次取消筛选" : "点击只看此类任务及其调用"}`;
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.ocP44TaskSeg = this.ocP44TaskSeg === key ? void 0 : key;
        ocP44SaveJson(OC_P44_TASK_SEG_KEY, this.ocP44TaskSeg || "");
        if (this.ocLastTimelineArgs) this.renderTimeline(...this.ocLastTimelineArgs);
        this.todosRegion.querySelector(`.oc-p44-seg button[data-seg="${key}"]`)?.focus({ preventScroll: true });
        this.onShelfLayout();
      });
    }
    for (const group of this.todosRegion.querySelectorAll(":scope > details.opencode-bridge-task-group")) {
      const key = group.dataset.taskGroup;
      const visible = sel ? key === sel : key !== "completed";
      group.classList.toggle("oc-p44-seg-hidden", !visible);
      if (visible && !group.open) group.open = true;
      if (visible && !lists[key]?.length && sel && !group.querySelector(".oc-p39-group-empty")) append(group, $(".oc-p39-group-empty", void 0, "没有任务"));
    }
    this.ocP44RenderShelfEmpty(lists, sel, bar);
  }
  // OpenCode p44b: 任务区空状态。侧栏里一行；停靠到页面/面板/浮窗时多一句说明：
  //   停靠的只是任务区，工具调用列表、筛选、统计与停止按钮仍在 Chat 视图的 Bridge 模式里。
  ocP44RenderShelfEmpty(lists, sel, bar) {
    for (const old of this.todosRegion.querySelectorAll(":scope > .oc-p44-shelf-empty")) old.remove();
    if (sel) return; // 选中某段时由该段的「没有任务」提示
    const total = lists.running.length + lists.unfinished.length + lists.completed.length;
    if (lists.running.length + lists.unfinished.length) return;
    const empty = $(".oc-p44-shelf-empty", { role: "status" });
    bar.after(empty);
    const icon2 = append(empty, $("span", { "aria-hidden": "true" }));
    icon2.classList.add(...ThemeIcon.asClassNameArray(total ? Codicon.pass : Codicon.checklist));
    append(empty, $("span.oc-p44-empty-title", void 0, total ? "没有进行中或未完成的任务" : "暂无任务"));
    append(empty, $("span.oc-p44-empty-hint", void 0, total ? `已完成 ${lists.completed.length} 个任务，点上方「已完成」查看。` : "AI 通过 Bridge 建立任务卡（set_todos）后，会在这里显示进度。"));
    const more = append(empty, $("span.oc-p44-empty-more", void 0, "工具调用列表、筛选、统计和停止按钮在 Chat 视图的 Bridge 模式里。"));
    const link = append(more, $("button.oc-p40-link", { type: "button" }, "打开 Bridge"));
    link.style.marginLeft = ".5em";
    link.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      void Promise.resolve(this.commandService.executeCommand("opencode.bridge.openSession")).catch(() => void 0);
    });
  }
  // ---- OpenCode p40: VS Code 原生树视图样式的活动区 ----
  ocP40EnsureFilter() {
    if (this.ocP40Filter) return;
    const bar = $(".oc-p40-filter");
    this.root.insertBefore(bar, this.timelineScroll);
    const box = append(bar, $(".oc-p40-filter-box"));
    const input = append(box, $("input.oc-p40-filter-input"));
    input.type = "text";
    input.placeholder = "筛选"; // OpenCode p42: 窄侧栏里长占位符会被截成「客户端」半截；完整说明保留在 aria-label / title。
    input.title = "筛选工具调用（工具、路径、客户端）";
    input.setAttribute("aria-label", "筛选工具调用（工具、路径、客户端）");
    input.value = this.ocFilter.text || "";
    const select = append(box, $("select.oc-p40-filter-select"));
    select.title = "按客户端筛选";
    select.setAttribute("aria-label", "按客户端筛选");
    select.hidden = true;
    const icon2 = append(box, $("span.oc-p40-filter-icon", { "aria-hidden": "true" }));
    icon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.filter));
    const rerender = () => {
      box.classList.toggle("active", !!(this.ocFilter.text || this.ocFilter.actor !== "all"));
      ocSaveFilter(this.ocFilter);
      if (this.ocLastTimelineArgs) this.renderTimeline(...this.ocLastTimelineArgs);
    };
    let timer2;
    this._register(addDisposableListener(input, "input", () => {
      this.ocFilter.text = input.value;
      clearTimeout(timer2);
      timer2 = setTimeout(rerender, 120);
    }));
    this._register(addDisposableListener(input, "keydown", (event) => {
      if (event.key === "Escape" && input.value) {
        event.preventDefault();
        event.stopPropagation();
        input.value = "";
        this.ocFilter.text = "";
        rerender();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        this.timeline.querySelector(".oc-p40-section-head, .oc-p40-row")?.focus();
      }
    }));
    this._register(addDisposableListener(select, "change", () => {
      this.ocFilter.actor = select.value || "all";
      rerender();
    }));
    this._register(toDisposable(() => clearTimeout(timer2)));
    this.ocP40Filter = { bar, box, input, select };
    box.classList.toggle("active", !!(this.ocFilter.text || this.ocFilter.actor !== "all"));
  }
  ocP40SyncFilter(activities) {
    this.ocP40EnsureFilter();
    const actors = new Map();
    for (const a of activities) {
      if (a.status === "progress") continue;
      const x = ocActorOf(a);
      const entry = actors.get(x.id) ?? { ...x, count: 0 };
      entry.count += 1;
      actors.set(x.id, entry);
    }
    if (this.ocFilter.actor !== "all" && !actors.has(this.ocFilter.actor)) this.ocFilter.actor = "all";
    const { select, bar } = this.ocP40Filter;
    bar.hidden = !activities.length && !this.ocFilter.text;
    const multi = actors.size > 1;
    select.hidden = !multi;
    const sig = [...actors.values()].map((x) => `${x.id}:${x.count}`).join("|") + "#" + this.ocFilter.actor;
    if (multi && select.dataset.sig !== sig) {
      select.dataset.sig = sig;
      clearNode(select);
      const all = append(select, $("option", void 0, "所有客户端"));
      all.value = "all";
      for (const x of [...actors.values()].sort((a, b) => b.count - a.count)) {
        const option = append(select, $("option", void 0, `${x.label} (${x.count})`));
        option.value = x.id;
        if (x.client) option.title = `clientInfo: ${x.client}（客户端自报）`;
      }
      select.value = this.ocFilter.actor;
    }
    return multi;
  }
  ocP40RenderSections(activities, multiClient) {
    // OpenCode p44: 按任务卡分组（每组可折叠：标题 · 进度 · 总耗时 · 失败数），无任务的调用归「未归属」；
    //   命令轮询（get_command_output）并入其 run_command；bridge_batch 的子调用收进批量行；状态按实际结果。
    const f = this.ocFilter;
    const q = String(f.text || "").trim().toLowerCase();
    const all = this.ocAllActivities ?? activities;
    // 1) 命令轮询并入父命令（按 commandId；只找已存在的 run_command）。
    const cmdById = new Map();
    for (const a of all) {
      const cid = a.tool === "run_command" ? a.presentation?.commandId : void 0;
      if (cid) cmdById.set(cid, a);
    }
    const pollsOf = new Map();
    const merged = new Set();
    for (const a of all) {
      if (a.tool !== "get_command_output") continue;
      const parent = cmdById.get(a.presentation?.commandId);
      if (!parent || parent.id > a.id) continue;
      if (!pollsOf.has(parent.id)) pollsOf.set(parent.id, []);
      pollsOf.get(parent.id).push(a);
      merged.add(a.id);
    }
    // 2) 批量调用的子调用：批量行之后、批量结束前、同一客户端发起的调用（最多 count 项）。
    const childrenOf = new Map();
    const batchOf = new Map();
    for (let i = 0; i < all.length; i++) {
      const b = all[i];
      if (b.tool !== "bridge_batch") continue;
      const count2 = ocP44BatchCount(b);
      const start = Date.parse(b.at);
      const end = b.status === "running" ? Infinity : start + (Number(b.durationMs) || 0) + 50;
      const actorId = ocActorOf(b).id;
      const kids = [];
      for (let j = i + 1; j < all.length && (!count2 || kids.length < count2); j++) {
        const c = all[j];
        const t = Date.parse(c.at);
        if (Number.isFinite(t) && t > end) break;
        if (c.status === "progress" || c.tool === "bridge_batch" || ocActorOf(c).id !== actorId || batchOf.has(c.id)) continue;
        kids.push(c);
        batchOf.set(c.id, b.id);
      }
      childrenOf.set(b.id, kids);
    }
    const effOf = (a) => {
      let s = ocP44Status(a);
      const polls = pollsOf.get(a.id);
      if (polls?.length && a.status !== "error") {
        for (let k = polls.length - 1; k >= 0; k--) {
          const ps = ocP44TermState(polls[k].presentation);
          if (ps) { s = ps; break; }
        }
      }
      if (a.tool === "bridge_batch" && s !== "error" && (childrenOf.get(a.id) ?? []).some((c) => ocP44Status(c) === "error")) s = "error";
      return s;
    };
    const failedOnly = !!this.ocP44FailedOnly;
    const seg = this.ocP44TaskSeg;
    const segTaskIds = this.ocP44SegTaskIds;
    const items = [];
    const mk = (a) => {
      const actor = ocActorOf(a);
      const v = ocP40Describe(a);
      return { a, v, actor, eff: effOf(a), polls: pollsOf.get(a.id) ?? [], children: [] };
    };
    const childItems = new Map();
    for (const a of activities) {
      if (merged.has(a.id)) continue;
      if (a.status === "progress") {
        if (!q && f.actor === "all" && !failedOnly) items.push({ a, progress: true, eff: "progress" });
        continue;
      }
      const it = mk(a);
      if (batchOf.has(a.id)) {
        const pid = batchOf.get(a.id);
        if (!childItems.has(pid)) childItems.set(pid, []);
        childItems.get(pid).push(it);
        continue;
      }
      items.push(it);
    }
    const passes = (it) => {
      if (it.progress) return true;
      if (f.actor !== "all" && it.actor.id !== f.actor) return false;
      if (q && !it.v.haystack.includes(q) && !it.actor.label.toLowerCase().includes(q) && !String(it.actor.client || "").toLowerCase().includes(q)) return false;
      if (failedOnly && it.eff !== "error") return false;
      return true;
    };
    const shown = [];
    for (const it of items) {
      if (it.a.tool === "bridge_batch") {
        it.children = childItems.get(it.a.id) ?? [];
        it.batchCount = ocP44BatchCount(it.a) || it.children.length;
        const kidsPass = it.children.filter(passes);
        if (!passes(it) && !kidsPass.length) continue;
        it.taskId = it.a.taskId ?? it.children.find((c) => c.a.taskId)?.a.taskId;
      } else if (!passes(it)) continue;
      it.taskId ??= it.a.taskId;
      shown.push(it);
    }
    // 子调用在其批量行被筛掉时也要能单独出现（例如只看失败）。
    for (const [pid, kids] of childItems) {
      if (shown.some((it) => it.a.id === pid)) continue;
      for (const k of kids) if (passes(k)) { k.taskId = k.a.taskId; shown.push(k); }
    }
    shown.sort((x, y) => x.a.id - y.a.id);
    const actorsShown = new Set(shown.filter((it) => !it.progress).map((it) => it.actor.id));
    const showClient = f.actor === "all" && actorsShown.size > 1;
    if (failedOnly) {
      const banner = append(this.timeline, $(".oc-p44-filter-banner"));
      const ic = append(banner, $("span.oc-p39-icon", { "aria-hidden": "true" }));
      ic.classList.add(...ThemeIcon.asClassNameArray(Codicon.error));
      append(banner, $("span", void 0, "仅显示失败的调用"));
      const clear = append(banner, $("button.oc-p40-link", void 0, "清除"));
      clear.type = "button";
      clear.addEventListener("click", () => this.ocP44SetFailedOnly(false));
    }
    if (!shown.some((it) => !it.progress)) {
      append(this.timeline, $(".oc-p40-empty", void 0, q || f.actor !== "all" || failedOnly || seg ? "没有符合筛选条件的调用。" : "暂无工具调用。"));
      return;
    }
    const known = new Map((this.ocLastTasks ?? []).map((t) => [t.id, t]));
    const inConv = !!this.ocConvId;
    // 分组（对话页只有一个任务，不再加组标题）。
    const groups = new Map();
    for (const it of shown) {
      const gid = it.taskId && known.has(it.taskId) && !this.hiddenTaskIds.has(it.taskId) ? it.taskId : OC_CONV_UNLINKED_ID;
      if (!groups.has(gid)) groups.set(gid, { id: gid, task: known.get(gid), items: [] });
      groups.get(gid).items.push(it);
    }
    let list = [...groups.values()];
    if (seg && !inConv) {
      list = list.filter((g) => g.task ? segTaskIds?.has(g.id) || seg === "running" && g.items.some((it) => it.eff === "running") : seg === "running" && g.items.some((it) => it.eff === "running"));
      if (!list.length) {
        append(this.timeline, $(".oc-p40-empty", void 0, "所选分段没有工具调用。"));
        return;
      }
    }
    const lastId = (g) => g.items.reduce((m, it) => Math.max(m, it.a.id), 0);
    list.sort((x, y) => Number(y.items.some((it) => it.eff === "running")) - Number(x.items.some((it) => it.eff === "running")) || lastId(y) - lastId(x));
    this.ocP44GroupState ??= ocP44LoadJson(OC_P44_GROUPS_KEY, {});
    let budget = 300;
    list.forEach((g, index) => {
      if (budget <= 0) return;
      const rows = g.items.filter((it) => !it.progress).length;
      const calls = g.items.filter((it) => !it.progress);
      const failed = calls.filter((it) => it.eff === "error").length;
      const running = calls.some((it) => it.eff === "running");
      const totalMs = calls.reduce((s, it) => s + (Number(it.a.durationMs) || 0), 0);
      let sec = this.timeline;
      if (!inConv) {
        const stored = this.ocP44GroupState[g.id];
        const collapsed = stored === void 0 ? !(index < 3 || running || failedOnly) : stored === true;
        sec = append(this.timeline, $(".oc-p40-section.oc-p44-group", { role: "group" }));
        const head = append(sec, $(`.oc-p40-section-head.oc-p44-group-head.state-${g.task ? running ? "running" : failed ? "error" : "completed" : running ? "running" : "unlinked"}`, { role: "treeitem", tabindex: "0" }));
        head.dataset.section = `g:${g.id}`;
        head.setAttribute("aria-expanded", String(!collapsed));
        const tw = append(head, $("span.oc-p39-twistie", { "aria-hidden": "true" }));
        tw.classList.add(...ThemeIcon.asClassNameArray(collapsed ? Codicon.chevronRight : Codicon.chevronDown));
        const ic = append(head, $("span.oc-p39-icon", { "aria-hidden": "true" }));
        ic.classList.add(...ThemeIcon.asClassNameArray(running ? ThemeIcon.modify(Codicon.loading, "spin") : !g.task ? Codicon.inbox ?? Codicon.circleLargeOutline : failed ? Codicon.error : Codicon.checklist ?? Codicon.pass));
        const title = g.task ? this.taskDisplayTitle(g.task) : "未归属";
        append(head, $("span.oc-p40-section-label", void 0, title));
        const meta = append(head, $("span.oc-p44-group-meta"));
        const todos = g.task?.todos ?? [];
        const bits = [];
        if (todos.length) bits.push(`${todos.filter((t) => t.status === "completed").length}/${todos.length}`);
        bits.push(`${rows} 次`);
        if (totalMs) bits.push(formatDuration4(totalMs));
        meta.textContent = bits.join(" \xB7 ");
        if (failed) append(meta, $("span.bad", void 0, ` \xB7 失败 ${failed}`));
        head.title = [title, g.task ? `任务状态：${OC_CONV_STATE_LABELS[g.task.state] || g.task.state}` : "没有关联任务卡的调用", todos.length ? `步骤 ${todos.filter((t) => t.status === "completed").length}/${todos.length}` : "", `${rows} 次调用 · 合计 ${formatDuration4(totalMs) || "0 ms"}${failed ? ` · 失败 ${failed}` : ""}`, "新的在上"].filter(Boolean).join("\n");
        const toggle = () => {
          this.ocP44GroupState[g.id] = !collapsed;
          ocP44SaveJson(OC_P44_GROUPS_KEY, this.ocP44GroupState);
          this.ocP40FocusAfter = `head:g:${g.id}`;
          if (this.ocLastTimelineArgs) this.renderTimeline(...this.ocLastTimelineArgs);
        };
        head.addEventListener("click", toggle);
        head.addEventListener("dblclick", (event) => { if (g.task) { event.preventDefault(); this.ocOpenConversation(g.id); } });
        head.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " " || event.key === "ArrowLeft" && !collapsed || event.key === "ArrowRight" && collapsed) {
            event.preventDefault();
            toggle();
          } else {
            this.ocP40TreeKey(event, head);
          }
        });
        if (collapsed) return;
      }
      // 组内：新的在上；每 5 分钟一个时间分隔（HH:MM · n 分钟前）。
      const ordered = [...g.items].reverse();
      let prev;
      let lastBucket;
      const now = Date.now();
      for (const it of ordered) {
        if (budget <= 0) break;
        const t = Date.parse(it.a.at);
        if (Number.isFinite(t)) {
          const bucket = Math.floor(t / 3e5);
          if (bucket !== lastBucket) {
            lastBucket = bucket;
            const d = new Date(t);
            const sep = append(sec, $(".oc-p44-time-sep", { "aria-hidden": "true" }));
            sep.textContent = `${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} \xB7 ${ocP44Relative(t, now)}`;
            prev = void 0;
          }
        }
        if (prev && !it.progress && !prev.it.progress && it.eff === "completed" && prev.it.eff === "completed" && !it.children.length && !it.polls.length && it.actor.id === prev.it.actor.id && it.a.tool === prev.it.a.tool && it.v.verb === prev.it.v.verb && it.v.target === prev.it.v.target && !this.expandedToolActivities.has(it.a.id) && !this.expandedToolActivities.has(prev.it.a.id)) {
          prev.count += 1;
          if (prev.repeat) prev.repeat.textContent = ` \xD7${prev.count}`;
          continue;
        }
        const row = this.ocP40RenderRow(sec, it, showClient);
        budget -= 1;
        prev = { it, count: 1, repeat: row.querySelector(".oc-p40-repeat") };
      }
    });
    const want = this.ocP40FocusAfter;
    this.ocP40FocusAfter = void 0;
    if (want?.startsWith("head:")) [...this.timeline.querySelectorAll(".oc-p40-section-head")].find((h) => h.dataset.section === want.slice(5))?.focus({ preventScroll: true });
  }
  ocP44SetFailedOnly(on) {
    this.ocP44FailedOnly = !!on;
    if (this.lastStatus) this.renderStatus(this.lastStatus);
    if (this.ocLastTimelineArgs) this.renderTimeline(...this.ocLastTimelineArgs);
  }
  // OpenCode p44: 运行中的耗时每秒原地更新文字（不重建 DOM）。
  ocP44Tick() {
    const now = Date.now();
    if (this.ocP44LastTick && now - this.ocP44LastTick < 900) return;
    this.ocP44LastTick = now;
    for (const el of this.timeline.querySelectorAll("[data-oc-live-start]")) {
      const start = Number(el.dataset.ocLiveStart);
      if (!Number.isFinite(start)) continue;
      const text2 = `${el.dataset.ocLivePrefix || ""}${formatDuration4(Math.max(0, now - start))}`;
      if (el.textContent !== text2) el.textContent = text2;
    }
  }
  ocP40TreeKey(event, el) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Home" && event.key !== "End") return;
    const rows = [...this.timeline.querySelectorAll(".oc-p40-section-head, .oc-p40-row, .oc-conv-back")];
    const i = rows.indexOf(el);
    const next = event.key === "Home" ? rows[0] : event.key === "End" ? rows[rows.length - 1] : rows[i + (event.key === "ArrowDown" ? 1 : -1)];
    event.preventDefault();
    if (next) next.focus();
    else if (event.key === "ArrowUp") this.ocP40Filter?.input.focus();
  }
  ocP40RenderRow(parent, it, multiClient, child = false) {
    const { a } = it;
    if (it.progress) {
      const row = append(parent, $(".oc-p40-row.state-progress", { role: "treeitem", tabindex: "-1" }));
      append(row, $("span.oc-p39-twistie", { "aria-hidden": "true" }));
      const icon3 = append(row, $("span.oc-p39-icon", { "aria-hidden": "true" }));
      icon3.classList.add(...ThemeIcon.asClassNameArray(Codicon.info));
      const label4 = append(row, $("span.oc-p40-label"));
      append(label4, $("span.oc-p40-verb", void 0, a.phase || a.message || localizeBridge("opencodeBridgeSession.progress", "处理中…")));
      append(row, $("span.oc-p40-desc", void 0, [a.todoTitle, a.phase ? a.message : ""].filter(Boolean).join(" \xB7 ")));
      append(row, $("span.oc-p40-dur", void 0, a.percent !== void 0 ? `${a.percent}%` : formatTime(a.at)));
      row.title = [a.todoTitle && `任务 · ${a.todoTitle}`, a.phase, a.message, formatTime(a.at)].filter(Boolean).join("\n");
      row.addEventListener("keydown", (event) => this.ocP40TreeKey(event, row));
      return row;
    }
    const v = it.v;
    const actor = it.actor;
    const eff = it.eff ?? ocP44Status(a);
    const polls = it.polls ?? [];
    const kids = it.children ?? [];
    const expanded2 = this.expandedToolActivities.has(a.id);
    const row = append(parent, $(`.oc-p40-row.state-${eff}`, { role: "treeitem", tabindex: "0" }));
    if (child) row.classList.add("oc-p44-child");
    row.dataset.activityId = String(a.id);
    row.setAttribute("aria-expanded", String(expanded2));
    const tw = append(row, $("span.oc-p39-twistie", { "aria-hidden": "true" }));
    tw.classList.add(...ThemeIcon.asClassNameArray(Codicon.chevronRight));
    if (expanded2) tw.style.transform = "rotate(90deg)";
    const icon2 = append(row, $("span.oc-p39-icon", { "aria-hidden": "true" }));
    icon2.classList.add(...ThemeIcon.asClassNameArray(eff === "running" ? ThemeIcon.modify(Codicon.loading, "spin") : eff === "error" ? Codicon.error : eff === "cancelled" ? Codicon.circleSlash ?? Codicon.stopCircle ?? Codicon.close : Codicon.pass));
    const label3 = append(row, $("span.oc-p40-label"));
    // OpenCode p44: 常见动词（读取 / 搜索 / 运行 / 列出 / 修改 / Git）改为小图标，节省宽度；完整动词在悬停提示里。
    const isBatch = a.tool === "bridge_batch";
    const cat = isBatch ? { icon: "layers", label: "批量调用" } : v.target ? ocP44Category(v.verb) : void 0;
    if (cat) {
      label3.classList.add("oc-p44-iconic");
      const vi = append(label3, $("span.oc-p44-verb-icon", { "aria-hidden": "true", title: cat.label }));
      vi.classList.add(...ocP44CodiconClass(cat.icon));
      const rest = isBatch ? "" : v.verb.replace(cat.re ?? /^$/, "").replace(/^\s*·?\s*/, "").replace(/^(命令|文件|文本|目录|\d+ 个文件)$/, "");
      if (rest) append(label3, $("span.oc-p44-verb-rest", void 0, rest));
      append(label3, $("span.oc-p40-target", void 0, isBatch ? ocP44BatchSummary(it.batchCount, kids) : v.target));
    } else {
      append(label3, $("span.oc-p40-verb", void 0, v.verb));
      if (v.target) append(label3, $("span.oc-p40-target", void 0, v.target));
    }
    // 结果（失败 / 退出码 / running …）由行尾注显示，说明列不再重复。
    const whereText = a.tool === "get_command_output" ? "" : a.tool === "run_command" ? String(v.where || "").split(" \xB7 ").filter((x) => !/^(失败|退出码 -?\d+|running|completed|cancelled|canceled|killed|timed_out|timeout|failed)$/i.test(x.trim())).join(" \xB7 ") : v.where;
    const desc = append(row, $("span.oc-p40-desc", void 0, [whereText, v.extra].filter(Boolean).join(" \xB7 ")));
    append(desc, $("span.oc-p40-repeat"));
    // 客户端：仅在列表里混有多个客户端时显示为小彩色标签。
    if (multiClient) {
      const tag = append(row, $("span.oc-p44-client", void 0, actor.label));
      tag.style.setProperty("--oc-hue", String(actor.kind === "local" ? 205 : ocActorHue(actor.id)));
      tag.title = `客户端: ${actor.label}${actor.client ? ` (${actor.client})` : ""}`;
    }
    // 命令尾注：运行中 Ns / 已完成 · 退出码 N（并入了轮询记录时按最新一次轮询）。
    const started = Date.parse(a.at);
    let exitCode;
    for (const p2 of [a.presentation, ...polls.map((x) => x.presentation)]) if (typeof p2?.exitCode === "number") exitCode = p2.exitCode;
    if (a.tool === "run_command" && a.status !== "running") {
      const tail = append(row, $("span.oc-p44-tail"));
      if (eff === "running") {
        tail.classList.add("live");
        if (Number.isFinite(started)) { tail.dataset.ocLiveStart = String(started); tail.dataset.ocLivePrefix = "运行中 "; tail.textContent = `运行中 ${formatDuration4(Math.max(0, Date.now() - started))}`; } else tail.textContent = "运行中";
      } else if (eff === "cancelled") tail.textContent = "已取消";
      else if (exitCode !== void 0) { tail.textContent = exitCode === 0 ? "已完成 \xB7 退出码 0" : `失败 \xB7 退出码 ${exitCode}`; if (exitCode !== 0) tail.classList.add("bad"); }
      else if (eff === "error") { tail.textContent = "失败"; tail.classList.add("bad"); }
      else tail.remove();
      if (polls.length) tail.title = `已合并 ${polls.length} 次「读取命令输出」`;
    }
    const durEl = append(row, $("span.oc-p40-dur"));
    if (a.tool === "run_command" && a.status !== "running" && eff === "running") {
      durEl.remove(); // 后台命令仍在运行：尾注「运行中 Ns」已给出实时耗时，不再并列显示本次调用的耗时。
    } else if (a.status === "running") {
      if (Number.isFinite(started)) { durEl.dataset.ocLiveStart = String(started); durEl.textContent = formatDuration4(Math.max(0, Date.now() - started)); }
    } else {
      durEl.textContent = formatDuration4(a.durationMs);
      const cls = ocP44DurClass(a.durationMs);
      if (cls) durEl.classList.add(cls);
    }
    const statusText = eff === "running" ? "运行中" : eff === "error" ? "失败" : eff === "cancelled" ? "已取消" : "成功";
    row.title = [
      isBatch ? ocP44BatchSummary(it.batchCount, kids) : `${v.verb}${v.target ? ` ${v.target}` : ""}`,
      v.full && v.full !== v.target ? v.full.length > 1500 ? `${v.full.slice(0, 1500)}…` : v.full : "",
      v.extraTitle || "",
      `工具: ${a.tool}`,
      `客户端: ${actor.label}${actor.client ? ` (${actor.client})` : ""}`,
      v.where ? `位置: ${v.where}` : "",
      `开始: ${formatTime(a.at)}`,
      `状态: ${statusText}${exitCode !== void 0 ? ` · 退出码 ${exitCode}` : ""}${a.durationMs !== void 0 ? ` · ${formatDuration4(a.durationMs)}` : ""}`,
      polls.length ? `轮询输出: ${polls.length} 次（展开查看）` : "",
      eff === "error" && a.message ? `错误: ${String(a.message).slice(0, 400)}` : ""
    ].filter(Boolean).join("\n");
    const toggle = () => {
      const open = !this.expandedToolActivities.has(a.id);
      if (open) this.expandedToolActivities.add(a.id);
      else this.expandedToolActivities.delete(a.id);
      row.setAttribute("aria-expanded", String(open));
      tw.style.transform = open ? "rotate(90deg)" : "";
      if (open) this.ocP40RenderDetail(row, a, v, actor, it, multiClient);
      else if (row.nextElementSibling?.classList.contains("oc-p40-detail")) row.nextElementSibling.remove();
    };
    row.addEventListener("click", toggle);
    row.addEventListener("keydown", (event) => {
      const open = this.expandedToolActivities.has(a.id);
      if (event.key === "Enter" || event.key === " " || event.key === "ArrowRight" && !open || event.key === "ArrowLeft" && open) {
        event.preventDefault();
        toggle();
      } else {
        this.ocP40TreeKey(event, row);
      }
    });
    if (expanded2) this.ocP40RenderDetail(row, a, v, actor, it, multiClient);
    return row;
  }
  ocP40RenderDetail(row, a, v, actor, it, multiClient) {
    const p = a.presentation ?? { kind: "generic", title: a.tool };
    const d = $(".oc-p40-detail");
    row.after(d);
    d.addEventListener("click", (event) => event.stopPropagation());
    append(d, $(".oc-p40-detail-meta", void 0, [a.tool, `${actor.label}${actor.client ? ` (${actor.client})` : ""}`, `开始 ${formatTime(a.at)}`, a.durationMs !== void 0 ? `耗时 ${formatDuration4(a.durationMs)}` : ""].filter(Boolean).join(" \xB7 ")));
    const block = (label3, text2, cls = "") => {
      if (!text2) return;
      append(d, $(".oc-p40-detail-label", void 0, label3));
      const pre = append(d, $(`pre.oc-p40-pre${cls}`));
      pre.textContent = text2;
    };
    // OpenCode p44: 批量调用展开为子调用行。
    const kids = it?.children ?? [];
    if (a.tool === "bridge_batch" && kids.length) {
      append(d, $(".oc-p40-detail-label", void 0, `子调用（${kids.length}）`));
      const host = append(d, $(".oc-p44-children"));
      host.addEventListener("click", (event) => event.stopPropagation());
      for (const k of kids) this.ocP40RenderRow(host, k, multiClient, true);
    }
    const args = v.full ? (p.kind === "terminal" ? v.full : ocP40Pretty(v.full)) : ocP40Pretty(p.input);
    block(p.kind === "terminal" ? "命令" : "参数", args);
    if (p.kind === "edit") this.renderMiniDiff(d, p);
    else this.renderToolItems(d, p);
    if (p.kind === "edit" && !p.diffPreview?.length) this.renderToolItems(d, p);
    // OpenCode p44: 并入的「读取命令输出」轮询：逐次列出，输出取最新一次。
    const polls = it?.polls ?? [];
    if (polls.length) {
      append(d, $(".oc-p40-detail-label", void 0, `轮询输出（${polls.length} 次）`));
      for (const x of polls) {
        const line = append(d, $(".oc-p44-poll"));
        const ps = ocP44TermState(x.presentation);
        append(line, $("span", void 0, formatTime(x.at)));
        const stText = ps === "running" ? "运行中" : ps === "cancelled" ? "已取消" : typeof x.presentation?.exitCode === "number" ? `退出码 ${x.presentation.exitCode}` : ps === "error" ? "失败" : ps === "completed" ? "已完成" : x.status === "error" ? "读取失败" : "—";
        const st = append(line, $("span", void 0, stText));
        if (ps === "error" || x.status === "error") st.classList.add("bad");
        append(line, $("span", void 0, formatDuration4(x.durationMs)));
      }
    }
    const lastOut = [...polls].reverse().find((x) => x.presentation?.output)?.presentation?.output;
    block("输出", ocP40Head(lastOut || p.output));
    if (a.status === "error" && a.message && a.message !== p.output) block("错误", ocP40Head(a.message), ".error");
    const actions = append(d, $(".oc-p40-detail-actions"));
    if (args) {
      const copy = append(actions, $("button.oc-p40-link", void 0, p.kind === "terminal" ? "复制命令" : "复制参数"));
      copy.type = "button";
      copy.addEventListener("click", () => void globalThis.navigator?.clipboard?.writeText(args).then(() => { copy.textContent = "已复制"; setTimeout(() => { copy.textContent = p.kind === "terminal" ? "复制命令" : "复制参数"; }, 1200); }, () => void 0));
    }
    if (p.terminalId) {
      const open = append(actions, $("button.oc-p40-link", void 0, localizeBridge("opencodeBridgeSession.openTerminal", "打开终端")));
      open.type = "button";
      open.addEventListener("click", () => void this.commandService.executeCommand(BRIDGE_OPEN_TERMINAL, p.terminalId));
    }
    if (!actions.childElementCount) actions.remove();
  }
  ocP40RenderConvHeader(conv) {
    const head = append(this.timeline, $(".oc-p40-conv-head"));
    const back = append(head, $("button.oc-p39-action.oc-conv-back"));
    back.type = "button";
    back.title = "返回全部调用 (Esc)";
    back.setAttribute("aria-label", "返回全部调用");
    back.classList.add(...ThemeIcon.asClassNameArray(Codicon.arrowLeft));
    back.addEventListener("click", () => this.ocCloseConversation());
    back.addEventListener("keydown", (event) => this.ocP40TreeKey(event, back));
    const label3 = append(head, $("span.oc-p40-label", { title: conv.title }, conv.title));
    label3.style.flex = "0 1 auto";
    const tools = conv.activities.filter((x) => x.status !== "progress");
    const failed = tools.filter((x) => x.status === "error").length;
    append(head, $("span.oc-p40-desc", void 0, [conv.label, `${tools.length} 次调用`, failed ? `${failed} 次失败` : ""].filter(Boolean).join(" \xB7 ")));
  }
  // OpenCode p39: 任务行（任务架分组下的子行）：折叠箭头 + 行内操作「查看此任务的工具调用」；双击行同样打开。
  ocP39DecorateTaskRow(card, task) {
    const summary = card.querySelector(":scope > summary");
    if (!summary || summary.querySelector(":scope > .oc-p39-twistie")) return;
    const tw = $("span.oc-p39-twistie", { "aria-hidden": "true" });
    tw.classList.add(...ThemeIcon.asClassNameArray(Codicon.chevronRight));
    summary.insertBefore(tw, summary.firstChild);
    if (!this.taskShelfBridgeMode) return;
    const actions = append(summary, $("span.oc-p39-inline-actions"));
    const open = append(actions, $("button.oc-p39-action"));
    open.type = "button";
    open.title = "查看此任务的工具调用（也可双击）";
    open.setAttribute("aria-label", open.title);
    open.classList.add(...ThemeIcon.asClassNameArray(Codicon.listFlat ?? Codicon.history ?? Codicon.goToFile));
    open.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.ocOpenConversation(task.id);
    });
    summary.addEventListener("dblclick", (event) => {
      if (event.target?.closest?.("button")) return;
      event.preventDefault();
      this.ocOpenConversation(task.id);
    });
  }
  // ---- OpenCode chat-split: 对话列表 / 对话页 ----
  ocBuildConversations(activities, tasks2) {
    this.ocAllActivities = activities;
    const byTask = new Map();
    const known = new Map(tasks2.map((task) => [task.id, task]));
    const unlinked = [];
    for (const activity of activities) {
      const id2 = activity.taskId;
      if (id2 && this.hiddenTaskIds.has(id2)) continue;
      if (id2 && known.has(id2)) {
        if (!byTask.has(id2)) byTask.set(id2, []);
        byTask.get(id2).push(activity);
      } else {
        unlinked.push(activity);
      }
    }
    const lastAt = (acts) => acts.reduce((max, a) => { const t = Date.parse(a.at); return Number.isFinite(t) && t > max ? t : max; }, 0);
    const convs = tasks2.map((task) => {
      const acts = byTask.get(task.id) ?? [];
      const tone = ocConvTone(task, acts);
      return { id: task.id, task, activities: acts, title: this.taskDisplayTitle(task), ...tone, updatedAt: Math.max(Number(task.updatedAt) || 0, lastAt(acts)), pinned: this.pinnedTaskIds.has(task.id) };
    });
    if (unlinked.some((a) => a.status !== "progress")) {
      const tone = ocConvTone(void 0, unlinked);
      convs.push({ id: OC_CONV_UNLINKED_ID, task: void 0, activities: unlinked, title: "\u672A\u5173\u8054\u4EFB\u52A1\u7684\u8C03\u7528", ...tone, updatedAt: lastAt(unlinked), pinned: false });
    }
    return convs.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);
  }
  ocConvMeta(container, conv) {
    const tools = conv.activities.filter((a) => a.status !== "progress");
    const failed = tools.filter((a) => a.status === "error").length;
    const actors = [...new Map(tools.map((a) => { const x = ocActorOf(a); return [x.id, x]; })).values()];
    for (const actor of actors.slice(0, 3)) {
      const tag = append(container, $(`span.oc-actor-tag.kind-${actor.kind}`, void 0, actor.label));
      if (actor.kind === "remote") tag.style.setProperty("--oc-hue", String(ocActorHue(actor.id)));
    }
    append(container, $("span", void 0, `${tools.length} \u6B21\u8C03\u7528`));
    if (failed) append(container, $("span.oc-bad", void 0, `${failed} \u6B21\u5931\u8D25`));
    const todos = conv.task?.todos ?? [];
    if (todos.length) {
      const done = todos.filter((todo) => todo.status === "completed").length;
      append(container, $("span", void 0, `${done}/${todos.length} \u6B65`));
      const step = todos.find((todo) => todo.status === "in_progress")?.title?.trim();
      if (step && conv.tone === "running") append(container, $("span.oc-conv-step", { title: step }, step));
    }
  }
  ocRenderConversationList(convs) {
    const list = append(this.timeline, $(".oc-conv-list", { role: "list", "aria-label": "\u5BF9\u8BDD\u5217\u8868" }));
    const heading = append(list, $(".oc-conv-list-heading"));
    append(heading, $("strong", void 0, "\u5BF9\u8BDD"));
    for (const [tone, label] of [["running", "\u56DE\u590D\u4E2D"], ["done", "\u5DF2\u5B8C\u6210"], ["error", "\u51FA\u9519"]]) {
      const n = convs.filter((c) => c.tone === tone).length;
      if (!n) continue;
      const sum = append(heading, $("span.oc-conv-sum"));
      const dot = append(sum, $("span.oc-conv-dot"));
      dot.style.setProperty("--oc-conv-color", OC_CONV_COLORS[tone]);
      append(sum, $("span", void 0, `${label} ${n}`));
    }
    for (const conv of convs) {
      const row = append(list, $(`div.oc-conv-row.oc-conv-${conv.tone}`, { role: "listitem", tabindex: "0" }));
      row.dataset.convId = conv.id;
      row.style.setProperty("--oc-conv-color", OC_CONV_COLORS[conv.tone]);
      row.title = `${conv.title} \xB7 ${conv.label}`;
      const line = append(row, $(".oc-conv-line"));
      append(line, $("span.oc-conv-dot", { "aria-hidden": "true" }));
      append(line, $("span.oc-conv-title", void 0, conv.title));
      append(line, $("span.oc-conv-pill", void 0, conv.label));
      const time = ocConvTime(conv.updatedAt);
      if (time) append(line, $("span.oc-conv-time", void 0, time));
      this.ocConvMeta(append(row, $(".oc-conv-meta")), conv);
      const chevron = append(row, $("span.oc-conv-chevron", { "aria-hidden": "true" }));
      chevron.classList.add(...ThemeIcon.asClassNameArray(Codicon.chevronRight));
      row.addEventListener("click", () => this.ocOpenConversation(conv.id));
      row.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this.ocOpenConversation(conv.id);
        }
      });
    }
  }
  ocRenderConversationHeader(conv) {
    this.timeline.style.setProperty("--oc-conv-color", OC_CONV_COLORS[conv.tone]);
    const header = append(this.timeline, $(`.oc-conv-header.oc-conv-${conv.tone}`));
    header.style.setProperty("--oc-conv-color", OC_CONV_COLORS[conv.tone]);
    const back = append(header, $("button.oc-conv-back"));
    back.type = "button";
    back.title = "\u8FD4\u56DE\u5BF9\u8BDD\u5217\u8868 (Esc)";
    const backIcon = append(back, $("span", { "aria-hidden": "true" }));
    backIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.chevronLeft));
    append(back, $("span", void 0, "\u8FD4\u56DE"));
    back.addEventListener("click", () => this.ocCloseConversation());
    append(header, $("span.oc-conv-dot", { "aria-hidden": "true" }));
    append(header, $("span.oc-conv-title", { title: conv.title }, conv.title));
    append(header, $("span.oc-conv-pill", void 0, conv.label));
    this.ocConvMeta(append(this.timeline, $(".oc-conv-meta.oc-conv-page-meta")), conv);
  }
  ocOpenConversation(id2) {
    if (!this.ocLastTimelineArgs) return;
    this.ocListScroll = this.timelineScroll.scrollTop;
    this.ocConvId = id2;
    this.ocFocusAfterRender = "back";
    this.followTimeline = true;
    this.renderTimeline(...this.ocLastTimelineArgs);
    this.timelineScroll.scrollTop = 0; // OpenCode p40: 列表改为新的在上
  }
  ocCloseConversation() {
    const id2 = this.ocConvId;
    this.ocConvId = void 0;
    this.followTimeline = false;
    this.ocRestoreListScroll = this.ocListScroll ?? 0;
    this.ocFocusAfterRender = id2 ? "row:" + id2 : void 0;
    if (this.ocLastTimelineArgs) this.renderTimeline(...this.ocLastTimelineArgs);
  }
  ocRestoreConvFocus() {
    const doc = this.timeline.ownerDocument;
    const want = this.ocFocusAfterRender;
    this.ocFocusAfterRender = void 0;
    let target;
    if (want === "back") target = this.timeline.querySelector(".oc-conv-back");
    else if (want?.startsWith("row:")) target = [...this.timeline.querySelectorAll(".oc-conv-row")].find((row) => row.dataset.convId === want.slice(4));
    else if (this.ocFocusKey) target = this.ocFocusKey === "back" ? this.timeline.querySelector(".oc-conv-back") : [...this.timeline.querySelectorAll(".oc-conv-row")].find((row) => row.dataset.convId === this.ocFocusKey);
    this.ocFocusKey = void 0;
    if (target && doc) target.focus({ preventScroll: true });
  }
  ocInstallConvKeys() {
    if (this.ocConvKeysInstalled) return;
    this.ocConvKeysInstalled = true;
    this._register(addDisposableListener(this.timelineScroll, "keydown", (event) => {
      if (event.key === "Escape" && this.ocConvId && !event.target?.closest?.("input,textarea,select")) {
        event.preventDefault();
        event.stopPropagation();
        this.ocCloseConversation();
      }
    }));
  }
  captureTimelineViewport() {
    const focused = this.root.contains(this.root.ownerDocument.activeElement) ? this.root.ownerDocument.activeElement : void 0;
    const focusedRow = focused?.closest(".opencode-bridge-task-index-row");
    const focusedActivity = focused?.closest(".opencode-bridge-tool-card, .oc-p40-row"); // OpenCode p40
    let focusKind;
    let focusId;
    if (focusedRow) {
      focusKind = "row";
      focusId = focusedRow.dataset.taskId;
    } else if (focused?.closest(".opencode-bridge-task-index-heading")) {
      focusKind = "index";
    } else if (focused?.closest(".opencode-bridge-todos-summary")) {
      focusKind = "task";
    } else if (focusedActivity) {
      focusKind = "activity";
      focusId = focusedActivity.dataset.activityId;
    }
    const bounds = this.timelineScroll.getBoundingClientRect();
    const anchor = this.multiTaskLayout && this.multiTaskTab === "tasks" ? [...this.todosRegion.querySelectorAll(".opencode-bridge-task-index-row")].find((row) => row.getBoundingClientRect().bottom > bounds.top && row.getBoundingClientRect().top < bounds.bottom) : void 0;
    return {
      scrollTop: this.timelineScroll.scrollTop,
      focusKind,
      focusId,
      anchorId: anchor?.dataset.taskId,
      anchorOffset: anchor ? anchor.getBoundingClientRect().top - bounds.top : void 0
    };
  }
  restoreTimelineViewport(viewport) {
    this.timelineScroll.scrollTop = viewport.scrollTop;
    const taskRow = (id2) => id2 ? [...this.todosRegion.querySelectorAll(".opencode-bridge-task-index-row")].find((row) => row.dataset.taskId === id2) : void 0;
    const anchor = taskRow(viewport.anchorId);
    if (anchor && viewport.anchorOffset !== void 0) {
      this.timelineScroll.scrollTop += anchor.getBoundingClientRect().top - this.timelineScroll.getBoundingClientRect().top - viewport.anchorOffset;
    }
    let focus;
    if (viewport.focusKind === "row") {
      focus = taskRow(viewport.focusId);
    } else if (viewport.focusKind === "index") {
      focus = this.todosRegion.querySelector(".opencode-bridge-task-index-heading") ?? void 0;
    } else if (viewport.focusKind === "task") {
      focus = this.todosRegion.querySelector(".opencode-bridge-todos-summary") ?? void 0;
    } else if (viewport.focusKind === "activity") {
      const card = [...this.timeline.querySelectorAll(".opencode-bridge-tool-card, .oc-p40-row")].find((element) => element.dataset.activityId === viewport.focusId);
      focus = (card?.classList.contains("oc-p40-row") ? card : card?.querySelector(".opencode-bridge-tool-summary")) ?? void 0; // OpenCode p40
    }
    if (focus && !focus.closest("[hidden]")) {
      focus.focus({ preventScroll: true });
    } else if (viewport.focusKind && this.multiTaskLayout) {
      (this.multiTaskTab === "tasks" ? this.tasksTab : this.activityTab).focus({ preventScroll: true });
    }
    if (this.multiTaskLayout) {
      this.tabScrollTop[this.multiTaskTab] = this.timelineScroll.scrollTop;
    }
  }
  onTimelineScroll() {
    if (this.suppressScrollTracking) {
      return;
    }
    this.userScrollActiveUntil = Date.now() + OpenCodeBridgeSessionView.USER_SCROLL_RENDER_COOLDOWN_MS;
    const distanceFromBottom = this.timelineScroll.scrollHeight - this.timelineScroll.scrollTop - this.timelineScroll.clientHeight;
    if (this.multiTaskLayout) {
      this.tabScrollTop[this.multiTaskTab] = this.timelineScroll.scrollTop;
    }
    this.followTimeline = (!this.multiTaskLayout || this.multiTaskTab === "activities") && distanceFromBottom < OpenCodeBridgeSessionView.NEAR_BOTTOM_SCROLL_THRESHOLD_PX;
  }
  scrollTimelineToBottom() {
    queueMicrotask(() => {
      if (this.multiTaskLayout && this.multiTaskTab !== "activities") {
        return;
      }
      this.suppressScrollTracking = true;
      this.timelineScroll.scrollTop = this.timelineScroll.scrollHeight;
      setTimeout(() => {
        this.suppressScrollTracking = false;
        this.followTimeline = !this.multiTaskLayout || this.multiTaskTab === "activities";
      }, 0);
    });
  }
  getCardState(task) {
    let state = this.cardStates.get(task.id);
    if (!state) {
      state = new BridgeTaskViewState();
      this.cardStates.set(task.id, state);
    }
    state.update(task.id, task.todos.length > 0 && task.todos.every((todo) => todo.status === "completed"), isBridgeTaskDisplayInactive(task.state));
    return state;
  }
  taskDisplayTitle(task) {
    const customName = this.taskDisplayInfo.get(task.id)?.name?.trim();
    if (customName) return customName.slice(0, 80);
    const explicitTitle = task.title?.trim();
    if (explicitTitle && explicitTitle !== "当前任务" && explicitTitle !== "任务进度") return explicitTitle.slice(0, 80);
    const stepTitle = (task.todos?.find((todo) => todo.status === "in_progress")?.title ?? task.todos?.[0]?.title)?.trim();
    if (stepTitle) return stepTitle.slice(0, 80);
    return explicitTitle || "当前任务";
  }
  installTaskContextMenu(card, task) {
    this._register(addDisposableListener(card, EventType.CONTEXT_MENU, (event) => {
      EventHelper.stop(event, true);
      this.closeTaskContextMenu?.();
      const runTaskMenuCommand = async (command, args) => {
        this.taskCleanupError = void 0;
        try {
          const status2 = await this.commandService.executeCommand(command, args);
          if (status2 && Array.isArray(status2.tasks)) {
            this.lastStatus = status2;
            this.render(status2, true);
          }
        } catch (error) {
          this.taskCleanupError = error instanceof Error ? error.message : String(error);
          if (this.lastStatus) {
            this.render(this.lastStatus, true);
          }
        }
      };
      const actions = [
        new Action("opencode.bridge.copyTaskMcpPrompt", "复制mcp提示词", void 0, true, () => runTaskMenuCommand(BRIDGE_COPY_TASK_PROMPT, { taskId: task.id, includeMcp: true })),
        new Action("opencode.bridge.copyTaskHandoffPrompt", "复制接班提示词", void 0, true, () => runTaskMenuCommand(BRIDGE_COPY_TASK_PROMPT, { taskId: task.id, includeMcp: false })),
        new Action("opencode.bridge.copyTaskForkMcpPrompt", "复制记忆后接班（含mcp）", void 0, true, () => runTaskMenuCommand(BRIDGE_COPY_TASK_PROMPT, { taskId: task.id, includeMcp: true, copyMemory: true })),
        new Action("opencode.bridge.copyTaskForkPrompt", "复制记忆后接班", void 0, true, () => runTaskMenuCommand(BRIDGE_COPY_TASK_PROMPT, { taskId: task.id, includeMcp: false, copyMemory: true })),
        new Separator(),
        new Action("opencode.bridge.deleteTaskDisplay", "删除任务显示（保留记忆）", void 0, true, () => runTaskMenuCommand(BRIDGE_DELETE_TASK_DISPLAY, { taskId: task.id, revision: task.revision }))
      ];
      if (this.contextMenuService?.showContextMenu) {
        this.contextMenuService.showContextMenu({
          getAnchor: () => new StandardMouseEvent(getWindow(card), event),
          getActions: () => actions,
          onHide: (wasCancelled) => {
            if (wasCancelled) {
              card.querySelector("summary")?.focus({ preventScroll: true });
            }
          }
        });
        return;
      }
      const host = card.closest(".monaco-workbench") ?? this.taskShelf ?? card.ownerDocument.body;
      const menu = append(host, $("div.opencode-task-context-menu.monaco-menu-container"));
      this.taskContextMenu = menu;
      menu.setAttribute("role", "menu");
      menu.style.cssText = `position:fixed;z-index:10000;left:${Math.max(0,Math.min(event.clientX,innerWidth-220))}px;top:${Math.max(0,Math.min(event.clientY,innerHeight-160))}px;min-width:196px;padding:4px;background:var(--vscode-menu-background,#252526);color:var(--vscode-menu-foreground,#cccccc);border:1px solid var(--vscode-menu-border,var(--vscode-contrastBorder,#454545));box-shadow:0 2px 8px var(--vscode-widget-shadow,rgba(0,0,0,0.45));border-radius:5px;font-size:13px;line-height:1.4`;
      let outside;
      const close = () => { menu.remove(); if (outside) card.ownerDocument.removeEventListener("pointerdown", outside, true); if (this.taskContextMenu === menu) { this.taskContextMenu = void 0; this.closeTaskContextMenu = void 0; } };
      this.closeTaskContextMenu = close;
      for (const item of actions) {
        if (item instanceof Separator) {
          const sep = append(menu, $("div"));
          sep.setAttribute("role", "separator");
          sep.style.cssText = "height:1px;margin:4px 0;background:var(--vscode-menu-separatorBackground,#454545)";
          continue;
        }
        const button = append(menu, $("button", void 0, item.label));
        button.type = "button";
        button.setAttribute("role", "menuitem");
        button.style.cssText = "display:block;width:100%;padding:5px 12px;border:0;border-radius:4px;background:transparent;color:var(--vscode-menu-foreground,#cccccc);text-align:left;cursor:pointer;font:inherit";
        button.addEventListener("mouseenter", () => {
          button.style.background = "var(--vscode-menu-selectionBackground,#04395e)";
          button.style.color = "var(--vscode-menu-selectionForeground,#ffffff)";
        });
        button.addEventListener("mouseleave", () => {
          button.style.background = "transparent";
          button.style.color = "var(--vscode-menu-foreground,#cccccc)";
        });
        button.addEventListener("click", () => {
          close();
          void item.run();
        });
      }
      outside = e => { if (!menu.contains(e.target)) close(); };
      const key = e => { if (e.key === "Escape") { close(); card.querySelector("summary")?.focus(); } };
      card.ownerDocument.addEventListener("pointerdown", outside, true);
      menu.addEventListener("keydown", key);
      menu.addEventListener("keydown", e => {
        if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) return;
        e.preventDefault();
        const buttons = [...menu.querySelectorAll("button")];
        const current = buttons.indexOf(card.ownerDocument.activeElement);
        buttons[e.key === "Home" ? 0 : e.key === "End" ? buttons.length-1 : (current + (e.key === "ArrowDown" ? 1 : buttons.length-1)) % buttons.length]?.focus();
      });
      this._register(toDisposable(close));
      menu.querySelector("button")?.focus();
    }));
  }
  /** Compact accordion: one visible decision at a time, even for a preplanned batch. */
  /**
   * A native Chat task's questions belong to the conversation that raised them: they are answered only
   * there. Bridge (external MCP) tasks and older/automation tasks without request ids keep showing here.
   */
  isTaskQuestionHere(task) {
    if (task?.originKind !== "chat" || !Array.isArray(task.chatRequestIds) || !task.chatRequestIds.length) return true;
    if (this.taskShelfBridgeMode) return false;
    let current;
    try { current = this.currentChatRequestIds?.(); } catch { current = void 0; }
    return !!current && task.chatRequestIds.some((id) => current.has(id));
  }
  /** dsh-style question card: one question at a time, numbered options, custom answer, pager. */
  renderTaskQuestions(card, task) {
    if (!task?.questions?.length) return;
    const questions = task.questions;
    const pending = questions.filter((q) => q.status === "pending");
    const active = pending[0];
    const current = active?.batchId ? questions.filter((q) => q.batchId === active.batchId) : active ? [active] : [];
    const historical = questions.filter((q) => !current.includes(q) && q.status === "answered");
    const here = this.isTaskQuestionHere(task);
    const wrapper = append(card, $("section.opencode-bridge-task-questions.opencode-question"));
    if (pending.length && !here) {
      const away = append(wrapper, $("div.opencode-question-away"));
      append(away, $("span.codicon.codicon-comment-discussion", { "aria-hidden": "true" }));
      append(away, $("span", void 0, `\u6709 ${pending.length} \u4E2A\u95EE\u9898\u7B49\u4F60\u56DE\u7B54\uFF0C\u5728\u53D1\u8D77\u5B83\u7684\u5BF9\u8BDD\u91CC\u56DE\u7B54`));
      return;
    }
    if (!pending.length && questions.some((q) => q.requiresMcpAck === true && !q.deliveredAt)) {
      append(wrapper, $("div.opencode-question-note", void 0, "\u56DE\u7B54\u5DF2\u63D0\u4EA4\uFF0C\u7B49\u5F85\u9001\u56DE AI\uFF1B\u9001\u8FBE\u524D\u4EFB\u52A1\u6682\u505C\u3002"));
    }
    if (current.length) {
      const viewKey = task.id + ":" + (active?.batchId ?? active?.id ?? "");
      const firstPending = Math.max(0, current.findIndex((q) => q.status === "pending"));
      let index = this.questionView.get(viewKey);
      if (typeof index !== "number" || index < 0 || index >= current.length) index = firstPending;
      const q = current[index];
      const answeredCount = current.filter((item) => item.status === "answered").length;
      const box = append(wrapper, $("div.opencode-question-card"));
      const header = append(box, $("div.opencode-question-header"));
      const heading = append(header, $("div.opencode-question-heading"));
      append(heading, $("div.opencode-question-eyebrow", void 0, current.length > 1 ? `\u9700\u8981\u4F60\u786E\u8BA4 \xB7 \u5DF2\u56DE\u7B54 ${answeredCount}/${current.length}` : "\u9700\u8981\u4F60\u786E\u8BA4"));
      const title = append(heading, $("div.opencode-question-title", void 0, q.text));
      title.title = q.text;
      if (current.length > 1) {
        const pager = append(header, $("div.opencode-question-pager"));
        const go = (next) => { this.questionView.set(viewKey, next); if (this.lastStatus) this.render(this.lastStatus, true); };
        const prev = append(pager, $("button.opencode-question-icon", { type: "button", "aria-label": "\u4E0A\u4E00\u9898", title: "\u4E0A\u4E00\u9898" }));
        prev.classList.add(...ThemeIcon.asClassNameArray(Codicon.chevronLeft));
        prev.disabled = index === 0;
        prev.addEventListener("click", () => go(index - 1));
        append(pager, $("span.opencode-question-progress", void 0, `${index + 1} / ${current.length}`));
        const next = append(pager, $("button.opencode-question-icon", { type: "button", "aria-label": "\u4E0B\u4E00\u9898", title: "\u4E0B\u4E00\u9898" }));
        next.classList.add(...ThemeIcon.asClassNameArray(Codicon.chevronRight));
        next.disabled = index >= current.length - 1;
        next.addEventListener("click", () => go(index + 1));
      }
      if (q.recommendation) {
        append(box, $("div.opencode-question-detail", void 0, `\u5EFA\u8BAE\uFF1A${q.recommendation}`));
      }
      if (q.status === "answered") {
        append(box, $("div.opencode-question-answered", void 0, `\u5DF2\u56DE\u7B54\uFF1A${q.answer?.text ?? "\u5DF2\u56DE\u7B54"}`));
      } else {
        const draft = this.questionDrafts.get(q.id) ?? { selected: "", text: "" };
        const options = append(box, $("div.opencode-question-options", { role: "radiogroup", "aria-label": q.text }));
        const footer = $("div.opencode-question-footer");
        const feedback = append(footer, $("div.opencode-question-feedback", { role: "status" }));
        const submit = append(footer, $("button.opencode-question-submit", { type: "button" }, pending.length > 1 ? "\u63D0\u4EA4\uFF0C\u4E0B\u4E00\u9898" : "\u63D0\u4EA4"));
        let custom;
        const refreshState = () => {
          for (const element of options.querySelectorAll(".opencode-question-option")) {
            const on = element.dataset.optionId === draft.selected;
            element.classList.toggle("selected", on);
            element.setAttribute("aria-checked", String(on));
          }
          submit.disabled = !draft.selected && !draft.text.trim();
        };
        for (const [optionIndex, option] of q.options.entries()) {
          const row = append(options, $("button.opencode-question-option", { type: "button", role: "radio" }));
          row.dataset.optionId = option.id;
          append(row, $("span.opencode-question-number", void 0, String(optionIndex + 1)));
          const copy = append(row, $("span.opencode-question-copy"));
          const line = append(copy, $("span.opencode-question-line"));
          append(line, $("span.opencode-question-label", void 0, option.label));
          if (q.recommendedOptionId === option.id) append(line, $("span.opencode-question-badge", void 0, "\u63A8\u8350"));
          if (option.description) append(copy, $("span.opencode-question-description", void 0, option.description));
          row.addEventListener("click", () => {
            draft.selected = draft.selected === option.id ? "" : option.id;
            this.questionDrafts.set(q.id, draft);
            refreshState();
          });
        }
        if (q.allowCustom) {
          const customRow = append(options, $("label.opencode-question-custom"));
          append(customRow, $("span.opencode-question-number", void 0, String(q.options.length + 1)));
          custom = append(customRow, $("textarea.opencode-question-input"));
          custom.placeholder = "\u8F93\u5165\u4F60\u7684\u7B54\u6848\uFF08\u53EF\u9009\uFF0C\u53EF\u4E0E\u9009\u9879\u4E00\u8D77\u63D0\u4EA4\uFF09";
          custom.setAttribute("aria-label", "\u81EA\u5B9A\u4E49\u56DE\u7B54");
          custom.rows = 1;
          custom.maxLength = 2000;
          custom.value = draft.text;
          const fit = () => { custom.style.height = "auto"; custom.style.height = Math.min(custom.scrollHeight, 144) + "px"; };
          custom.addEventListener("input", () => { draft.text = custom.value; this.questionDrafts.set(q.id, draft); fit(); refreshState(); });
          setTimeout(fit, 0);
        }
        box.appendChild(footer);
        refreshState();
        submit.addEventListener("click", async () => {
          submit.disabled = true;
          feedback.classList.remove("error");
          feedback.textContent = "\u6B63\u5728\u63D0\u4EA4\u2026";
          try {
            const status = await this.commandService.executeCommand("opencode.bridge.answerTaskQuestion", {
              taskId: task.id, questionId: q.id, optionId: draft.selected || void 0, customText: custom?.value || ""
            });
            this.questionDrafts.delete(q.id);
            this.questionView.delete(viewKey);
            this.lastStatus = status;
            this.render(status, true);
          } catch (error) {
            feedback.classList.add("error");
            feedback.textContent = `\u63D0\u4EA4\u5931\u8D25\uFF1A${error.message ?? String(error)}`;
            refreshState();
          }
        });
      }
      append(box, $("div.opencode-question-hint", void 0, "\u53EA\u6709\u4F60\u7684\u9009\u62E9\u4F1A\u4EA4\u7ED9 AI\uFF0C\u63A8\u8350\u9879\u4E0D\u4F1A\u81EA\u52A8\u9009\u4E2D\u3002"));
    }
    if (historical.length && here) {
      const archive = append(wrapper, $("details.opencode-question-history"));
      append(archive, $("summary", void 0, `\u5386\u53F2\u95EE\u7B54 (${historical.length})`));
      for (const q of historical) {
        const row = append(archive, $("div.opencode-question-history-row"));
        append(row, $("div.opencode-question-history-q", void 0, q.text));
        append(row, $("div.opencode-question-history-a", void 0, q.answer?.text ?? "\u5DF2\u56DE\u7B54"));
      }
    }
  }
  renderOrigin(_summary, _task) { /* Source information remains in diagnostics, not a blue Bridge badge. */ }
  /** Task-level states render even before a plan exists, so an empty card never looks like "nothing happened". */
  renderTaskPlaceholder(task) {
    const card = append(this.todosRegion, $("details.opencode-bridge-todos.opencode-bridge-task-card.opencode-bridge-task-placeholder"));
    card.dataset.taskShortCode = task.id.slice(0, 8);
    card.dataset.taskId = task.id;
    const state = this.getCardState(task);
    card.open = state.expanded;
    const summary = append(card, $("summary.opencode-bridge-todos-summary"));
    this.bindDetailsToggle(card, summary, (expanded2) => state.expanded = expanded2);
    const icon2 = append(summary, $("span.opencode-bridge-todos-icon"));
    icon2.classList.add(...ThemeIcon.asClassNameArray(task.state === "awaiting_sync" || task.state === "interrupted" ? Codicon.warning : Codicon.checklist));
    const labels2 = append(summary, $(".opencode-bridge-task-summary-labels"));
    this.renderOrigin(labels2, task);
    const taskTitle = append(labels2, $("strong.opencode-bridge-task-title", void 0, this.taskDisplayTitle(task)));
    const detail = append(summary, $("span.opencode-bridge-task-summary-detail", void 0, localizeBridge("opencodeBridgeSession.noPlanYet", "\u5C1A\u672A\u4E0A\u62A5\u4EFB\u52A1\u8BA1\u5212")));
    detail.title = detail.textContent ?? "";
    append(summary, $("span.opencode-bridge-task-pill", void 0, localizeBridge("opencodeBridgeSession.noPlanBadge", "\u65E0\u8BA1\u5212")));
    append(taskTitle, $("span.opencode-bridge-task-state-pill", void 0, this.taskStateLabel(task.state)));
    this.renderTaskLocalControls(this.taskMenuBody, task);
    this.renderStaleTaskInterruptControl(card, task);
    if (task.state === "cleared") {
      const detail2 = card.querySelector(".opencode-bridge-task-summary-detail");
      if (detail2) {
        detail2.textContent = localizeBridge("opencodeBridgeSession.clearedTaskDetail", "Task plan was cleared");
        detail2.title = detail2.textContent ?? "";
      }
      const pill = card.querySelector(".opencode-bridge-task-pill");
      if (pill) {
        pill.textContent = this.taskStateLabel(task.state);
      }
    }
    this.todosRegion.classList.toggle("opencode-bridge-task-pending", task.state === "awaiting_sync" || task.state === "waiting_plan");
    this.renderTaskQuestions(card, task);
  }
  /** Lifecycle wording is deliberately explicit: interrupted or stale is never shown as complete. */
  taskStateLabel(state) {
    switch (state) {
      case "running":
        return localizeBridge("opencodeBridgeSession.stateRunning", "\u8FDB\u884C\u4E2D");
      case "completed":
        return localizeBridge("opencodeBridgeSession.stateCompleted", "\u5DF2\u5B8C\u6210");
      case "blocked":
        return localizeBridge("opencodeBridgeSession.stateBlocked", "\u5DF2\u963B\u585E");
      case "cancelled":
        return localizeBridge("opencodeBridgeSession.stateCancelled", "\u5DF2\u53D6\u6D88");
      case "awaiting_sync":
        return localizeBridge("opencodeBridgeSession.stateAwaitingSync", "\u5DF2\u505C\u6EDE");
      case "interrupted":
        return localizeBridge("opencodeBridgeSession.stateInterrupted", "\u5DF2\u4E2D\u65AD");
      case "waiting_plan":
        return localizeBridge("opencodeBridgeSession.stateWaitingPlan", "\u89C4\u5212\u4E2D");
      case "awaiting_user":
        return "等待用户确认";
      default:
        return localizeBridge("opencodeBridgeSession.stateCleared", "\u5DF2\u6E05\u9664");
    }
  }
  currentTaskPresentation(todos, currentTodo, state) {
    const remaining = todos.filter((todo) => todo.status !== "completed").length;
    if (currentTodo && state && state !== "running") {
      return { eyebrow: this.taskStateLabel(state), title: currentTodo.title, detail: this.taskStateLabel(state), remaining };
    }
    if (currentTodo) {
      return {
        eyebrow: localizeBridge("opencodeBridgeSession.currentStep", "\u5F53\u524D\u6B65\u9AA4"),
        title: currentTodo.title,
        detail: localizeBridge("opencodeBridgeSession.waitingForStepUpdate", "\u7B49\u5F85\u6B65\u9AA4\u66F4\u65B0"),
        remaining
      };
    }
    if (remaining) {
      const next = todos.find((todo) => todo.status === "pending");
      return {
        eyebrow: state === "blocked" ? localizeBridge("opencodeBridgeSession.blockedPendingStep", "\u5DF2\u963B\u585E \xB7 \u5F85\u5904\u7406\u6B65\u9AA4") : localizeBridge("opencodeBridgeSession.pendingStep", "\u5F85\u5904\u7406\u6B65\u9AA4"),
        title: next?.title ?? localizeBridge("opencodeBridgeSession.incompleteSteps", "\u4ECD\u6709\u672A\u5B8C\u6210\u6B65\u9AA4"),
        detail: state === "blocked" ? localizeBridge("opencodeBridgeSession.blockedRemaining", "\u5C1A\u6709 {0} \u6B65\u672A\u5B8C\u6210\uFF1B\u4EFB\u52A1\u5DF2\u963B\u585E", remaining) : localizeBridge("opencodeBridgeSession.remainingSteps", "\u5C1A\u6709 {0} \u6B65\u672A\u5B8C\u6210\uFF1B\u5F53\u524D\u6CA1\u6709\u8FDB\u884C\u4E2D\u7684\u6B65\u9AA4", remaining),
        remaining
      };
    }
    return {
      eyebrow: localizeBridge("opencodeBridgeSession.taskComplete", "\u4EFB\u52A1\u5B8C\u6210"),
      title: localizeBridge("opencodeBridgeSession.allStepsCompleted", "\u5168\u90E8\u6B65\u9AA4\u5DF2\u5B8C\u6210"),
      detail: localizeBridge("opencodeBridgeSession.allStepsCompletedDetail", "\u6240\u6709\u8BA1\u5212\u6B65\u9AA4\u5747\u5DF2\u5B8C\u6210"),
      remaining
    };
  }
  renderTodos(todos, activities) {
    const task = this.taskSnapshot;
    if (!todos.length) {
      if (task) {
        this.renderTaskPlaceholder(task);
      }
      return;
    }
    const latestProgressByTodo = /* @__PURE__ */ new Map();
    if (task && task.progress !== void 0) {
      const report = task.progress;
      if (report && report.todoId && report.taskRevision === task.revision && report.at > 0 && Date.now() - report.at < 5 * 6e4 && task.state === "running") {
        latestProgressByTodo.set(report.todoId, {
          id: -1,
          at: new Date(report.at).toISOString(),
          status: "progress",
          tool: "report_progress",
          taskId: task.id,
          todoId: report.todoId,
          message: report.message,
          phase: report.phase,
          percent: report.percent
        });
      }
    } else {
      for (const activity of activities) {
        if (activity.status === "progress" && activity.taskId === task?.id && activity.todoId && task?.state === "running" && Date.parse(activity.at) >= task.updatedAt && Date.now() - Date.parse(activity.at) < 5 * 6e4) {
          latestProgressByTodo.set(activity.todoId, activity);
        }
      }
    }
    const taskSummary = this.summarizeTaskProgress(todos, latestProgressByTodo);
    const presentation2 = this.currentTaskPresentation(todos, taskSummary.currentTodo, task?.state);
    const isFullyComplete = taskSummary.totalCount > 0 && taskSummary.completedCount === taskSummary.totalCount;
    if (task) {
      this.getCardState(task).update(task.id, isFullyComplete, isBridgeTaskDisplayInactive(task.state));
    }
    const state = task ? this.getCardState(task) : this.taskViewState;
    const card = append(this.todosRegion, $("details.opencode-bridge-todos.opencode-bridge-task-card"));
    if (task) {
      card.dataset.taskShortCode = task.id.slice(0, 8);
      card.dataset.taskId = task.id;
    }
    card.open = state.expanded;
    const summary = append(card, $("summary.opencode-bridge-todos-summary"));
    this.bindDetailsToggle(card, summary, (expanded2) => {
      state.expanded = expanded2;
    });
    const icon2 = append(summary, $("span.opencode-bridge-todos-icon"));
    icon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.checklist));
    const summaryLabels = append(summary, $(".opencode-bridge-task-summary-labels"));
    if (task) {
      this.renderOrigin(summaryLabels, task);
    }
    const taskTitle = append(summaryLabels, $(
      "strong.opencode-bridge-task-title",
      void 0,
      task ? this.taskDisplayTitle(task) : localizeBridge("opencodeBridgeSession.taskProgress", "\u4EFB\u52A1\u8FDB\u5EA6")
    ));
    const summaryDetail = taskSummary.currentTodo ? localizeBridge("opencodeBridgeSession.currentTaskSummary", "\u7B2C {0} / {1} \u6B65 \xB7 {2}", taskSummary.currentIndex + 1, taskSummary.totalCount, taskSummary.currentTodo.title) : presentation2.remaining ? localizeBridge("opencodeBridgeSession.pendingTaskSummary", "\u5DF2\u5B8C\u6210 {0} / {1} \u6B65 \xB7 \u5F85\u5904\u7406 {2} \u6B65", taskSummary.completedCount, taskSummary.totalCount, presentation2.remaining) : localizeBridge("opencodeBridgeSession.completedTaskSummary", "\u5DF2\u5B8C\u6210 {0} / {1} \u6B65", taskSummary.completedCount, taskSummary.totalCount) + (task?.title ? ` · ${task.title}` : "");
    // OpenCode p42: 紧凑行右侧已有「第 x/y 步」，说明列只显示当前步骤标题，避免「第 1 / 2 步」重复且被截成「第.」；完整内容仍在悬停提示里。
    const detail = append(summary, $("span.opencode-bridge-task-summary-detail", void 0, taskSummary.currentTodo && this.root?.classList.contains("oc-p39") ? taskSummary.currentTodo.title : summaryDetail));
    detail.title = summaryDetail;
    append(summary, $("span.opencode-bridge-task-pill", void 0, taskSummary.currentTodo ? localizeBridge("opencodeBridgeSession.stepBadge", "\u7B2C {0}/{1} \u6B65", taskSummary.currentIndex + 1, taskSummary.totalCount) : presentation2.remaining ? localizeBridge("opencodeBridgeSession.remainingStepsBadge", "\u5F85\u5904\u7406 {0} \u6B65", presentation2.remaining) : localizeBridge("opencodeBridgeSession.doneBadge", "\u5DF2\u5B8C\u6210 {0}/{1}", taskSummary.completedCount, taskSummary.totalCount)));
    if (task) {
      // OpenCode p42: 「进行中」分组里不再重复显示「进行中」状态字样（分组标题已说明）；其他状态（等你回答等）照常显示。
      if (task.state !== "running" || !this.root?.classList.contains("oc-p39")) append(taskTitle, $("span.opencode-bridge-task-state-pill", void 0, this.taskStateLabel(task.state)));
      this.renderTaskLocalControls(this.taskMenuBody, task);
      this.renderStaleTaskInterruptControl(card, task);
    }
    const body = append(card, $(".opencode-bridge-todos-body"));
    const current = append(body, $(".opencode-bridge-task-current"));
    const currentIcon = append(current, $("span.opencode-bridge-task-current-icon"));
    currentIcon.classList.add(...ThemeIcon.asClassNameArray(taskSummary.currentTodo && (!task || task.state === "running") ? ThemeIcon.modify(Codicon.loading, "spin") : presentation2.remaining ? Codicon.circleLargeOutline : Codicon.checkAll));
    const currentBody = append(current, $(".opencode-bridge-task-current-body"));
    append(currentBody, $("span.opencode-bridge-task-current-eyebrow", void 0, presentation2.eyebrow));
    append(currentBody, $(
      "strong.opencode-bridge-task-current-title",
      void 0,
      presentation2.title
    ));
    const currentMetaParts = [taskSummary.latestProgress?.phase, taskSummary.latestProgress?.message].filter(Boolean);
    append(currentBody, $(
      "span.opencode-bridge-task-current-meta",
      void 0,
      currentMetaParts.length ? currentMetaParts.join(" \xB7 ") : presentation2.detail
    ));
    for (const todo of todos) {
      const row = append(body, $(`div.opencode-bridge-todo.${todo.status.replace("_", "-")}`));
      append(row, $("span.opencode-bridge-todo-step-index", void 0, String(todos.indexOf(todo) + 1)));
      const statusIcon = append(row, $("span.opencode-bridge-todo-icon"));
      const todoIcon = todo.status === "completed" ? Codicon.check : todo.status === "in_progress" && (!task || task.state === "running") ? ThemeIcon.modify(Codicon.loading, "spin") : Codicon.circleLargeOutline;
      statusIcon.classList.add(...ThemeIcon.asClassNameArray(todoIcon));
      const labels2 = append(row, $(".opencode-bridge-todo-labels"));
      append(labels2, $("span.opencode-bridge-todo-title", void 0, todo.title));
    }
    this.renderTaskQuestions(card, task);
  }
  summarizeTaskProgress(todos, latestProgressByTodo) {
    const completedCount = todos.filter((todo) => todo.status === "completed").length;
    const currentIndex = Math.max(0, todos.findIndex((todo) => todo.status === "in_progress"));
    const currentTodo = todos.find((todo) => todo.status === "in_progress");
    return {
      currentTodo,
      currentIndex: currentTodo ? currentIndex : completedCount,
      completedCount,
      totalCount: todos.length,
      latestProgress: currentTodo ? latestProgressByTodo.get(currentTodo.id) : void 0
    };
  }
  renderOcFilterBar(activities) {
    const tools = activities.filter((a) => a.status !== "progress");
    const actors = new Map();
    for (const a of tools) {
      const actor = ocActorOf(a);
      const entry = actors.get(actor.id) ?? { ...actor, count: 0 };
      entry.count += 1;
      actors.set(actor.id, entry);
    }
    if (this.ocFilter.actor !== "all" && !actors.has(this.ocFilter.actor)) this.ocFilter.actor = "all";
    const failed = tools.filter((a) => a.status === "error").length;
    const bar = append(this.timeline, $(".oc-bridge-filter", { role: "toolbar", "aria-label": "\u6309\u53D1\u8D77\u65B9\u7B5B\u9009" }));
    const chip = (label, count, active, onClick, actor) => {
      const b = append(bar, $("button.oc-bridge-chip"));
      b.type = "button";
      if (active) b.classList.add("active");
      b.setAttribute("aria-pressed", String(active));
      if (actor) {
        const dot = append(b, $("span.oc-actor-dot"));
        dot.style.setProperty("--oc-hue", String(actor.kind === "local" ? 205 : ocActorHue(actor.id)));
        if (actor.kind === "unknown") dot.style.filter = "grayscale(1)";
        b.title = actor.kind === "local" ? "\u672C\u673A OpenCode \u81EA\u5DF1\u7684\u667A\u80FD\u4F53\u53D1\u8D77" : actor.kind === "unknown" ? "\u66F4\u65B0\u524D\u7684\u8BB0\u5F55\uFF0C\u6CA1\u6709\u53D1\u8D77\u65B9\u4FE1\u606F" : `\u5916\u90E8 MCP \u5BA2\u6237\u7AEF\u53D1\u8D77${actor.client ? `\uFF08clientInfo: ${actor.client}\uFF0C\u5BA2\u6237\u7AEF\u81EA\u62A5\uFF09` : ""}`;
      }
      append(b, $("span", void 0, label));
      append(b, $("span.oc-count", void 0, String(count)));
      b.addEventListener("click", () => { onClick(); ocSaveFilter(this.ocFilter); if (this.ocLastTimelineArgs) this.renderTimeline(...this.ocLastTimelineArgs); });
      return b;
    };
    chip("\u5168\u90E8", tools.length, this.ocFilter.actor === "all", () => { this.ocFilter.actor = "all"; });
    for (const actor of [...actors.values()].sort((a, b) => b.count - a.count)) {
      chip(actor.label, actor.count, this.ocFilter.actor === actor.id, () => { this.ocFilter.actor = this.ocFilter.actor === actor.id ? "all" : actor.id; }, actor);
    }
    if (failed || this.ocFilter.failedOnly) {
      const f = chip("\u4EC5\u5931\u8D25", failed, this.ocFilter.failedOnly, () => { this.ocFilter.failedOnly = !this.ocFilter.failedOnly; });
      f.classList.add("failed");
    }
  }
  renderProgress(activity) {
    const row = append(this.timeline, $(".opencode-bridge-progress-row"));
    const icon2 = append(row, $("span.opencode-bridge-progress-icon"));
    icon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.info));
    const body = append(row, $(".opencode-bridge-progress-body"));
    if (activity.todoTitle) {
      append(body, $("span.opencode-bridge-progress-task", void 0, localizeBridge("opencodeBridgeSession.progressTask", "\u4EFB\u52A1 \xB7 {0}", activity.todoTitle)));
    }
    if (activity.phase) {
      append(body, $("strong", void 0, activity.phase));
    }
    append(body, $("span", void 0, activity.message ?? localizeBridge("opencodeBridgeSession.progress", "\u5904\u7406\u4E2D\u2026")));
    if (activity.percent !== void 0) {
      append(row, $("span.opencode-bridge-progress-percent", void 0, `${activity.percent}%`));
    }
  }
  renderToolCard(activity) {
    const presentation2 = activity.presentation ?? { kind: "generic", title: activity.tool };
    const card = append(this.timeline, $("details.opencode-bridge-tool-card"));
    card.dataset.activityId = String(activity.id);
    card.open = this.expandedToolActivities.has(activity.id);
    card.classList.add(`state-${activity.status}`, `kind-${presentation2.kind}`);
    const summary = append(card, $("summary.opencode-bridge-tool-summary"));
    this.bindDetailsToggle(card, summary, (expanded2) => {
      if (expanded2) {
        this.expandedToolActivities.add(activity.id);
      } else {
        this.expandedToolActivities.delete(activity.id);
      }
    });
    const icon2 = append(summary, $("span.opencode-bridge-tool-icon"));
    icon2.classList.add(...ThemeIcon.asClassNameArray(activityIcon(activity)));
    const labels2 = append(summary, $(".opencode-bridge-tool-labels"));
    const human = ocHumanizeActivity(activity, presentation2);
    const titleEl = append(labels2, $("span.opencode-bridge-tool-title", void 0, human.title));
    append(titleEl, $("span.oc-repeat", { hidden: "" }));
    if (human.command) titleEl.title = human.command;
    const actor = ocActorOf(activity);
    const subRow = append(labels2, $("span.opencode-bridge-tool-subtitle"));
    const tag = append(subRow, $(`span.oc-actor-tag.kind-${actor.kind}`, void 0, actor.label));
    if (actor.kind === "remote") tag.style.setProperty("--oc-hue", String(ocActorHue(actor.id)));
    if (human.subtitle) append(subRow, $("span", void 0, human.subtitle));
    const meta = append(summary, $("span.opencode-bridge-tool-meta"));
    meta.textContent = activity.status === "running" ? localizeBridge("opencodeBridgeSession.running", "Running\u2026") : activity.status === "error" ? localizeBridge("opencodeBridgeSession.failed", "Failed") : formatDuration4(activity.durationMs) || localizeBridge("opencodeBridgeSession.completed", "Completed");
    if (presentation2.kind === "edit") {
      this.renderEditSummaryItems(summary, presentation2);
    }
    const body = append(card, $(".opencode-bridge-tool-body"));
    if (presentation2.kind !== "edit") {
      this.renderToolItems(body, presentation2);
    }
    if (presentation2.kind === "edit") {
      this.renderMiniDiff(body, presentation2);
    }
    if (human.command) {
      const cmd = append(body, $("div.oc-cmd", void 0, human.command));
      const copy = append(cmd, $("button.oc-cmd-copy", void 0, "\u590D\u5236"));
      copy.type = "button";
      copy.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); void globalThis.navigator?.clipboard?.writeText(human.command).then(() => { copy.textContent = "\u5DF2\u590D\u5236"; setTimeout(() => { copy.textContent = "\u590D\u5236"; }, 1200); }, () => void 0); });
    }
    if (presentation2.terminalId) {
      const actions = append(body, $(".opencode-bridge-tool-actions"));
      const openTerminal = append(actions, $("button.opencode-bridge-tool-action"));
      const terminalIcon = append(openTerminal, $("span"));
      terminalIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.terminal));
      append(openTerminal, $("span", void 0, localizeBridge("opencodeBridgeSession.openTerminal", "Open Terminal")));
      openTerminal.addEventListener("click", () => void this.commandService.executeCommand(BRIDGE_OPEN_TERMINAL, presentation2.terminalId));
    }
    const showRawInput = presentation2.kind === "generic" || activity.tool === "send_command_input";
    this.renderCodeSection(body, localizeBridge("opencodeBridgeSession.input", "Input"), showRawInput ? presentation2.input : void 0);
    this.renderCodeSection(body, localizeBridge("opencodeBridgeSession.output", "Output"), presentation2.output);
    if (activity.message && activity.status === "error" && activity.message !== presentation2.output) {
      const error = append(body, $(".opencode-bridge-tool-error"));
      error.textContent = activity.message;
    }
    return card;
  }
  bindDetailsToggle(card, summary, onDidToggle) {
    const syncExpandedState = () => {
      summary.setAttribute("aria-expanded", String(card.open));
      onDidToggle(card.open);
    };
    summary.addEventListener("click", (event) => {
      event.preventDefault();
      card.open = !card.open;
      syncExpandedState();
    });
    card.addEventListener("toggle", syncExpandedState);
    syncExpandedState();
  }
  renderEditSummaryItems(parent, presentation2) {
    const items = (presentation2.items ?? []).filter((item) => item.kind === "file");
    if (!items.length) {
      return;
    }
    const list2 = append(parent, $(".opencode-bridge-edit-summary-files"));
    for (const item of items.slice(0, 8)) {
      const row = append(list2, $("button.opencode-bridge-edit-summary-file"));
      row.type = "button";
      const icon2 = append(row, $("span.opencode-bridge-edit-summary-file-icon"));
      icon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.file));
      append(row, $("span.opencode-bridge-edit-summary-file-path", void 0, item.path));
      if (item.additions !== void 0 || item.deletions !== void 0) {
        const stats = append(row, $("span.opencode-bridge-edit-summary-file-stats"));
        append(stats, $("span.additions", void 0, `+${item.additions ?? 0}`));
        append(stats, $("span.deletions", void 0, `\u2212${item.deletions ?? 0}`));
      }
      row.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        void this.commandService.executeCommand(BRIDGE_OPEN_RESOURCE, { path: item.path });
      });
    }
    if (items.length > 8) {
      append(list2, $("span.opencode-bridge-edit-summary-more", void 0, localizeBridge("opencodeBridgeSession.moreEditedFiles", "{0} more files", items.length - 8)));
    }
  }
  renderMiniDiff(parent, presentation2) {
    if (!presentation2.diffPreview?.length || !presentation2.diff) {
      return;
    }
    const preview = append(parent, $(".opencode-bridge-mini-diff"));
    for (const file of presentation2.diffPreview) {
      const fileBlock = append(preview, $(".opencode-bridge-mini-diff-file"));
      const header2 = append(fileBlock, $(".opencode-bridge-mini-diff-header"));
      const fileButton = append(header2, $("button.opencode-bridge-mini-diff-file-button"));
      fileButton.type = "button";
      const fileIcon = append(fileButton, $("span"));
      fileIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.file));
      append(fileButton, $("span.opencode-bridge-mini-diff-path", void 0, file.path));
      fileButton.addEventListener("click", () => void this.commandService.executeCommand(BRIDGE_OPEN_RESOURCE, { path: file.path }));
      const openDiff = append(header2, $("button.opencode-bridge-mini-diff-open"));
      openDiff.type = "button";
      openDiff.setAttribute("title", localizeBridge("opencodeBridgeSession.openFullDiff", "Open full diff"));
      const diffIcon = append(openDiff, $("span"));
      diffIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.diff));
      openDiff.addEventListener("click", () => void this.commandService.executeCommand(BRIDGE_OPEN_DIFF, { diff: presentation2.diff, path: file.path }));
      for (let hunkIndex = 0; hunkIndex < file.hunks.length; hunkIndex += 1) {
        if (hunkIndex > 0) {
          append(fileBlock, $("div.opencode-bridge-mini-diff-gap", void 0, "\xB7\xB7\xB7"));
        }
        const hunk = file.hunks[hunkIndex];
        const code = append(fileBlock, $(".opencode-bridge-mini-diff-code"));
        for (const line of hunk.lines) {
          const row = append(code, $(`div.opencode-bridge-mini-diff-line.${line.kind}`));
          const lineNumber = line.kind === "delete" ? line.oldLine : line.newLine;
          append(row, $("span.opencode-bridge-mini-diff-line-number", void 0, lineNumber === void 0 ? "" : String(lineNumber)));
          append(row, $("span.opencode-bridge-mini-diff-marker", void 0, line.kind === "add" ? "+" : line.kind === "delete" ? "\u2212" : ""));
          const text2 = append(row, $("span.opencode-bridge-mini-diff-text", void 0, line.text || " "));
          text2.setAttribute("title", line.text);
        }
        if (hunk.truncated) {
          append(code, $("div.opencode-bridge-mini-diff-truncated", void 0, localizeBridge("opencodeBridgeSession.diffMoreLines", "More changed lines\u2026")));
        }
      }
      if (file.truncated) {
        append(fileBlock, $("div.opencode-bridge-mini-diff-truncated", void 0, localizeBridge("opencodeBridgeSession.diffMoreHunks", "More changes in this file\u2026")));
      }
    }
  }
  renderToolItems(parent, presentation2) {
    const items = presentation2.items ?? (presentation2.files ?? []).map((path) => ({ kind: "file", path }));
    if (!items.length) return;
    const container3 = append(parent, $(".opencode-bridge-tool-items"));
    for (const item of items.slice(0, 40)) {
      const row = append(container3, $("div.opencode-bridge-tool-item"));
      if (item.severity) row.classList.add(`severity-${item.severity}`);
      row.tabIndex = 0;
      row.setAttribute("role", "button");
      row.setAttribute("title", item.line ? `${item.path}:${item.line}:${item.column ?? 1}` : item.path);
      const icon2 = append(row, $("span.opencode-bridge-tool-item-icon"));
      const itemIcon = item.kind === "folder" ? Codicon.folder : item.kind === "match" ? Codicon.search : item.kind === "diagnostic" ? item.severity === "error" ? Codicon.error : item.severity === "warning" ? Codicon.warning : Codicon.info : item.kind === "symbol" ? Codicon.symbolMethod : Codicon.file;
      icon2.classList.add(...ThemeIcon.asClassNameArray(itemIcon));
      const labels2 = append(row, $(".opencode-bridge-tool-item-labels"));
      append(labels2, $("span.opencode-bridge-tool-item-primary", void 0, item.label || item.path));
      const location2 = item.line ? `${item.path}:${item.line}${item.column ? `:${item.column}` : ""}` : item.label ? item.path : void 0;
      const change = item.additions !== void 0 || item.deletions !== void 0 ? `+${item.additions ?? 0} -${item.deletions ?? 0}` : void 0;
      const secondary = [location2, item.description, change].filter(Boolean).join(" \xB7 ");
      if (secondary) append(labels2, $("span.opencode-bridge-tool-item-secondary", void 0, secondary));
      const openResource = () => void this.commandService.executeCommand(BRIDGE_OPEN_RESOURCE, { path: item.path, line: item.line, column: item.column, folder: item.kind === "folder" });
      row.addEventListener("click", openResource);
      row.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openResource();
        }
      });
      if (presentation2.kind === "edit" && presentation2.diff && item.kind === "file") {
        const diffButton = append(row, $("button.opencode-bridge-tool-item-action"));
        diffButton.type = "button";
        diffButton.setAttribute("title", localizeBridge("opencodeBridgeSession.openFileDiff", "Open file diff"));
        const diffIcon = append(diffButton, $("span"));
        diffIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.diff));
        diffButton.addEventListener("click", (event) => {
          event.stopPropagation();
          void this.commandService.executeCommand(BRIDGE_OPEN_DIFF, { diff: presentation2.diff, path: item.path });
        });
      }
    }
    if (items.length > 40) append(container3, $("span.opencode-bridge-tool-more", void 0, localizeBridge("opencodeBridgeSession.moreItems", "{0} more items", items.length - 40)));
  }
  renderCodeSection(parent, label3, value2) {
    if (!value2) {
      return;
    }
    const section = append(parent, $(".opencode-bridge-tool-section"));
    append(section, $("span.opencode-bridge-tool-section-label", void 0, label3));
    const pre = append(section, $("pre"));
    pre.textContent = value2;
  }
  /** Same wording as the Bridge page: the coded startFailure first, raw lastError only as a fallback (P7). */
  startupFailureOf(status2) {
    const failure2 = status2.startFailure ?? status2.lastError;
    return failure2 ? describeBridgeStartupFailure(failure2) : void 0;
  }
  renderStatus(status2) {
    const failure2 = status2.connected || status2.state === "running" ? void 0 : this.startupFailureOf(status2);
    this.failureLink.hidden = this.footerCollapsed || failure2?.severity !== "error";
    this.connectionDot.className = `opencode-bridge-session-dot state-${status2.connected ? "connected" : status2.state}`;
    // OpenCode p41: 状态行「● 已连接 · Streamable HTTP · n 个活动请求」；长说明移到悬停提示。
    {
      const live = status2.connected ? "已连接" : status2.state === "running" ? "等待客户端连接" : status2.state === "starting" ? "正在启动…" : failure2?.title ? failure2.title : "Bridge 未运行";
      const parts = [live];
      if (status2.connected || status2.state === "running") parts.push(localizeBridge("opencodeBridgeSession.transport", "Streamable HTTP"));
      if (status2.activeRequests > 0) parts.push(`${status2.activeRequests} 个活动请求`);
      this.connectionTitle.textContent = parts.join(" \xB7 ");
      this.connectionDot.classList.toggle("oc-p41-failed", !status2.connected && status2.state !== "running" && failure2?.severity === "error");
    }
    if (this.footerCollapsed) {
      const compact2 = [status2.connected ? localizeBridge("opencodeBridgeSession.connectedCompact", "Connected") : status2.state === "running" ? localizeBridge("opencodeBridgeSession.waitingCompact", "Waiting for MCP") : localizeBridge("opencodeBridgeSession.disconnectedCompact", "Not connected")];
      compact2.push(localizeBridge("opencodeBridgeSession.toolCallsCompact", "{0} tool calls", status2.stats.toolCalls));
      if (status2.stats.completedToolCalls > 0) {
        compact2.push(formatDuration4(status2.stats.averageDurationMs));
      }
      compact2.push(`${status2.stats.successRate.toFixed(status2.stats.successRate === 100 ? 0 : 1)}%`);
      this.connectionDescription.textContent = compact2.join(" \xB7 ");
    } else {
      this.connectionDescription.textContent = status2.connected ? localizeBridge("opencodeBridgeSession.connected", "Connected \xB7 OpenCode tools are available to the external Agent for the workspace currently open in OpenCode on this Windows PC") : status2.state === "running" ? localizeBridge("opencodeBridgeSession.waitingConnection", "Bridge is running and awaiting an external MCP client connection for the workspace currently open in OpenCode on this Windows PC") : failure2?.title ?? localizeBridge("opencodeBridgeSession.notRunning", "Bridge is not running");
    }
    // OpenCode p44: 统计行只在文字变化时更新（不再每 350 ms 清空重建，悬停/点击稳定）；「失败 N」可点击筛选失败调用。
    this.ocP44RenderStats(status2);
    this.renderHealth(status2.health);
    const pieces = [localizeBridge("opencodeBridgeSession.transport", "Streamable HTTP")];
    if (status2.activeRequests > 0) {
      pieces.push(localizeBridge("opencodeBridgeSession.activeRequests", "{0} active", status2.activeRequests));
    }
    if (status2.stats.lastTool) {
      pieces.push(localizeBridge("opencodeBridgeSession.lastTool", "Last tool: {0}", status2.stats.lastTool));
    }
    const lastTime = formatTime(status2.stats.lastToolAt);
    if (lastTime) {
      pieces.push(lastTime);
    }
    this.footerMeta.textContent = pieces.join(" \xB7 ");
    this.footerHint.textContent = status2.connected ? localizeBridge("opencodeBridgeSession.outputOnlyHint", "The Bridge view in the OpenCode sidebar displays output. By default, operations target the workspace folder(s) currently open in OpenCode on this Windows PC. Conversation interaction continues in the external client.") : localizeBridge("opencodeBridgeSession.connectHint", "Start Bridge here, then connect from the external client using the configured MCP URL. By default, tool operations target the workspace folder(s) currently open in OpenCode on this Windows PC.");
    this.footerMeta.title = this.footerHint.textContent;
    this.connectionTitle.title = this.footerHint.textContent;
    this.footerHint.hidden = true;
    // OpenCode p41: 状态行悬停显示完整说明。
    this.connectionTitle.title = [this.connectionDescription.textContent, this.footerHint.textContent].filter(Boolean).join("\n\n");
    this.connectionDot.title = this.connectionTitle.title;
  }
  ocP44RenderStats(status2) {
    if (!this.ocP44Stats) {
      clearNode(this.statsContainer);
      const line = append(this.statsContainer, $(".oc-stats-line"));
      const main = append(line, $("span"));
      const fail = append(line, $("span.oc-bad.oc-p44-fail", { role: "button", tabindex: "0" }));
      const last = append(line, $("span"));
      const onFail = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.ocP44SetFailedOnly(!this.ocP44FailedOnly);
      };
      fail.addEventListener("click", onFail);
      fail.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") onFail(event); });
      this.ocP44Stats = { line, main, fail, last };
      this.statsContainer.style.display = "block";
    }
    const { line, main, fail, last } = this.ocP44Stats;
    const st = status2.stats;
    const setText = (el, text2) => { if (el.textContent !== text2) el.textContent = text2; };
    setText(main, `${st.toolCalls} \u6B21\u8C03\u7528 \xB7 \u6210\u529F\u7387 ${st.successRate.toFixed(st.successRate === 100 ? 0 : 1)}% \xB7 \u5E73\u5747 ${formatDuration4(st.averageDurationMs) || "\u2014"}`);
    // 成功率按 Bridge 统计（工具报错）；列表里退出码非 0 的命令另计为「命令失败」，两者都可点击筛选。
    const counts = ocP44CountStates(status2.activities ?? []);
    const cmdFailed = Math.max(0, counts.failed - counts.failedTool);
    const failText = [st.failedToolCalls ? `\u5931\u8D25 ${st.failedToolCalls}` : "", cmdFailed ? `\u547D\u4EE4\u5931\u8D25 ${cmdFailed}` : ""].filter(Boolean).join(" \xB7 ");
    const showFail = !!failText || !!this.ocP44FailedOnly;
    fail.hidden = !showFail;
    setText(fail, showFail ? ` \xB7 ${failText || "\u5931\u8D25 0"}${this.ocP44FailedOnly ? " \u2715" : ""}` : "");
    fail.classList.toggle("active", !!this.ocP44FailedOnly);
    fail.setAttribute("aria-pressed", String(!!this.ocP44FailedOnly));
    const failTitle = this.ocP44FailedOnly ? "\u6B63\u5728\u53EA\u663E\u793A\u5931\u8D25\u7684\u8C03\u7528\uFF1B\u70B9\u51FB\u53D6\u6D88" : `\u70B9\u51FB\u53EA\u663E\u793A\u5931\u8D25\u7684\u8C03\u7528\uFF08\u5DE5\u5177\u62A5\u9519 ${st.failedToolCalls}\uFF1B\u5217\u8868\u4E2D\u9000\u51FA\u7801\u975E 0 \u7684\u547D\u4EE4 ${cmdFailed}\uFF09`;
    if (fail.title !== failTitle) fail.title = failTitle;
    // OpenCode p41: 最近工具与时间并入同一条暗色统计行。
    setText(last, st.lastTool ? ` \xB7 最近 ${st.lastTool}${formatTime(st.lastToolAt) ? ` ${formatTime(st.lastToolAt)}` : ""}` : "");
    const title = line.textContent;
    if (line.title !== title) line.title = title;
  }
  appendStat(label3, value2) {
    const stat = append(this.statsContainer, $(".opencode-bridge-session-stat"));
    append(stat, $("span", void 0, label3));
    append(stat, $("strong", void 0, value2 || "\u2014"));
  }
  renderHealth(health) {
    if (this.checkingHealth) {
      setVisibility(true, this.healthRow);
      this.healthDot.className = "opencode-bridge-session-dot state-starting";
      this.healthText.textContent = localizeBridge("opencodeBridgeSession.healthChecking", "Checking Bridge health\u2026");
      this.healthRow.title = "";
      return;
    }
    if (this.healthError) {
      setVisibility(true, this.healthRow);
      this.healthDot.className = "opencode-bridge-session-dot state-error";
      this.healthText.textContent = localizeBridge("opencodeBridgeSession.healthFailed", "Health check failed: {0}", this.healthError);
      this.healthRow.title = this.healthError;
      return;
    }
    if (!health) {
      setVisibility(false, this.healthRow);
      return;
    }
    setVisibility(true, this.healthRow);
    this.healthDot.className = `opencode-bridge-session-dot ${health.ok ? "state-connected" : "state-error"}`;
    const parts = [];
    if (health.ok) {
      parts.push(localizeBridge("opencodeBridgeSession.healthOk", "Healthy"));
      parts.push(formatDuration4((health.public ?? health.local).latencyMs ?? 0));
    } else {
      parts.push(localizeBridge("opencodeBridgeSession.healthUnhealthy", "Unhealthy"));
      if (health.state !== "running") {
        parts.push(localizeBridge("opencodeBridgeSession.healthNotRunning", "Bridge is {0}", health.state));
      }
      if (!health.local.ok) {
        parts.push(localizeBridge("opencodeBridgeSession.healthLocalFailed", "local: {0}", health.local.error ?? "failed"));
      }
      if (health.public && !health.public.ok) {
        parts.push(localizeBridge("opencodeBridgeSession.healthPublicFailed", "public: {0}", health.public.error ?? "failed"));
      }
      if (health.state === "running" && !health.tunnelProcessAlive) {
        parts.push(localizeBridge("opencodeBridgeSession.healthTunnelDown", "tunnel process not running"));
      }
    }
    const checkedAt = formatTime(health.at);
    if (checkedAt) {
      parts.push(checkedAt);
    }
    this.healthText.textContent = parts.join(" \xB7 ");
    const tooltip = [health.summary];
    if (health.local.url) {
      tooltip.push(localizeBridge("opencodeBridgeSession.healthTooltipLocal", "Local: {0} ({1})", health.local.url, formatDuration4(health.local.latencyMs ?? 0)));
    }
    if (health.public?.url) {
      tooltip.push(localizeBridge("opencodeBridgeSession.healthTooltipPublic", "Public: {0} ({1})", health.public.url, formatDuration4(health.public.latencyMs ?? 0)));
    }
    tooltip.push(localizeBridge("opencodeBridgeSession.healthTooltipSessions", "MCP sessions: {0} \xB7 active requests: {1}", health.sessions, health.activeRequests));
    if (health.lastSessionActivityAt) {
      tooltip.push(localizeBridge("opencodeBridgeSession.healthLastActivity", "Last MCP activity: {0}", formatTime(health.lastSessionActivityAt)));
    }
    this.healthRow.title = tooltip.join("\n");
  }
  renderControls() {
    // OpenCode p41: 操作按钮为图标（debug-stop / clear-all / pulse，悬停提示）；Bridge 未运行时只显示一个主按钮「启动 Bridge」。
    const running = this.lastStatus?.state === "running";
    const starting = this.lastStatus?.state === "starting";
    // OpenCode p44: 悬停闪烁修复——render() 每 350 ms 调一次这里；Button.setTitle → 托管悬停 update()
    //   会销毁并重建正在显示的悬停框（module-1756 show(): oldHoverWidget.dispose()），按钮因此一闪一闪。
    //   现在只有文字真的变了才调用 setTitle / 写属性。
    const setIcon = (button, icon2, title, enabled) => {
      if (button.enabled !== enabled) button.enabled = enabled;
      button.label = `$(${icon2})`;
      this.ocP44SetTitle(button, title);
    };
    setIcon(this.startStopButton, this.busy && running ? "loading~spin" : Codicon.debugStop.id, this.busy && running ? "正在停止…" : "停止 Bridge", !this.busy && running);
    this.startStopButton.element.hidden = !running;
    const hasLog = (this.lastStatus?.activities.length ?? 0) > 0 || (this.lastStatus?.stats.toolCalls ?? 0) > 0;
    setIcon(this.clearLogButton, Codicon.clearAll.id, "清除记录", !this.busy && hasLog);
    setIcon(this.healthButton, this.checkingHealth ? "loading~spin" : Codicon.pulse.id, this.checkingHealth ? "正在检查…" : "健康检查", !this.checkingHealth && !starting);
    if (this.ocStartRow) {
      this.ocStartRow.hidden = running || !this.lastStatus;
      if (this.ocStartButton.enabled !== (!this.busy && !starting)) this.ocStartButton.enabled = !this.busy && !starting;
      this.ocStartButton.label = this.busy || starting ? `$(loading~spin) 正在启动…` : "启动 Bridge";
      this.ocP44SetTitle(this.ocStartButton, "启动 Bridge", false);
    }
    this.root.classList.toggle("oc-p41-stopped", !!this.lastStatus && !running);
    this.renderFooterCollapsedState();
  }
  ocP44SetTitle(button, title, aria = true) {
    if (button.ocP44Title === title) return;
    button.ocP44Title = title;
    button.setTitle(title);
    if (aria) button.element.setAttribute("aria-label", title);
  }
};
OpenCodeBridgeSessionView = __decorateClass([
  __decorateParam(3, ICommandService),
  __decorateParam(4, IContextMenuService)
], OpenCodeBridgeSessionView);
export { formatDuration4, formatTime, activityIcon, BRIDGE_GET_STATUS3, BRIDGE_START2, BRIDGE_STOP2, BRIDGE_CHECK_HEALTH, BRIDGE_CLEAR_ACTIVITY_LOG, BRIDGE_CLEAR_TASKS_CONFIRMED, BRIDGE_OPEN_RESOURCE, BRIDGE_OPEN_DIFF, BRIDGE_OPEN_TERMINAL, OpenCodeBridgeSessionView };
