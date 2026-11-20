// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widgetHosts/viewPane/chatViewPane.ts
import { ViewPane } from "./module-1335.mjs";
import { Separator, SubmenuAction, toAction } from "./module-0082.mjs";
import { isWindows } from "./module-0014.mjs";
import { isAgentSandboxEnabledValue } from "./module-1105.mjs";
import { normalizeOpenCodePermissionMode } from "./module-0964.mjs";
import { ILanguageModelToolsService } from "./module-0990.mjs";
import { DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { LRUCache } from "./module-0008.mjs";
import { CHAT_WIDGET_VIEW_STATE_CACHE_LIMIT, ChatViewId, IChatWidgetService, setModelPreservingInputTypedWhileLoading } from "./module-0981.mjs";
import { observableValue } from "./module-0048.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { Memento } from "./module-1041.mjs";
import { CHAT_PROVIDER_ID } from "./module-0970.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { localize } from "./module-0001.mjs";
import { getComparisonKey, isEqual2 } from "./module-0034.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { Event2 } from "./module-0017.mjs";
import { LocalChatSessionUri, getChatSessionType, getNewChatSessionResource, isUntitledChatSession } from "./module-0961.mjs";
import { $, EventHelper, EventType, addDisposableListener, append, getWindow, setVisibility } from "./module-0075.mjs";
import { MOUSE_BACK_FORWARD_NAVIGATION_SETTING } from "./module-1494.mjs";
import { notifyBridgeAutoStartFailure } from "./module-2761.mjs";
import { ChatViewWelcomeController } from "./module-2383.mjs";
import { combineVoiceInput } from "./module-2760.mjs";
import { VOICE_AGENT_PROGRESS_SETTING } from "./module-1342.mjs";
import { URI } from "./module-0032.mjs";
import { resolveVoiceModel } from "./module-2072.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { createVoiceGlowController } from "./module-2077.mjs";
import { isDark } from "./module-0247.mjs";
import { isGlowingVoiceState, readVoiceGlowIntensity, resolveVoiceGlowColors } from "./module-2064.mjs";
import { autorun } from "./module-0052.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { MenuId } from "./module-0092.mjs";
import { AgentSessionsFilter } from "./module-2754.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { ACTION_ID_NEW_CHAT } from "./module-1476.mjs";
import { AgentSessionsControl } from "./module-2759.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ChatWidget, layoutChatWidgetForInputHeight } from "./module-2394.mjs";
import { SIDE_BAR_FOREGROUND } from "./module-0912.mjs";
import { editorBackground } from "./module-0229.mjs";
import { OpenCodeBridgeSessionView } from "./module-2764.mjs";
import { ChatViewTitleControl } from "./module-2757.mjs";
import { ChatEntitlementContextKeys, IChatEntitlementService } from "./module-0953.mjs";
import { IActivityService, ProgressBadge } from "./module-1449.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { getDefaultNewChatSessionType, getDefaultNewChatSessionTypeAndReasonFromServices, getLocalFallbackSessionTypeSelectionReason } from "./module-0964.mjs";
import { IChatSessionsService, localChatSessionType } from "./module-0960.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { Sash } from "./module-0496.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { IWorkspacesService } from "./module-1379.mjs";
import { IChatService } from "./module-0972.mjs";
import { IChatAgentService } from "./module-0974.mjs";
import { ILogService } from "./module-0095.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IAgentSessionsService } from "./module-1464.mjs";
import { IHostService } from "./module-1117.mjs";
import { IMicCaptureService } from "./module-1346.mjs";
import { ITtsPlaybackService } from "./module-2069.mjs";
import { IVoiceSessionController } from "./module-2076.mjs";
import { IVoiceInputModeService } from "./module-2082.mjs";
import { IAgentTitleBarStatusService } from "./module-2576.mjs";
import { IVoicePlaybackService } from "./module-2073.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IAgentHostEnablementService } from "./module-0963.mjs";
import { IAccessibilityService } from "./module-0104.mjs";


// src/vs/workbench/contrib/chat/browser/widgetHosts/viewPane/chatViewPane.ts
// OpenCode: 每个对话的工作区（按 sessionResource 持久化在应用级存储），以及对话列表常驻显示
const OC_SESSION_WS_KEY = "opencode.chat.sessionWorkspaces";
const OC_RECENT_WS_KEY = "opencode.chat.recentWorkspaces";
const OC_SESSIONS_COLLAPSED_KEY = "opencode.chat.sessionsCollapsed";
const OC_PICK_WS_COMMAND = "opencode.chat.pickSessionWorkspace";
let ocActiveChatViewPane;
let ocWsMapCache;
function ocWsBasename(p) {
  if (!p) return "";
  const s = String(p).replace(/[\\/]+$/, "");
  const i = Math.max(s.lastIndexOf("/"), s.lastIndexOf("\\"));
  return i >= 0 ? s.slice(i + 1) || s : s;
}
function ocReadJson(storage, key, fallback) {
  try {
    const raw = storage.get(key, -1 /* APPLICATION */);
    const value = raw ? JSON.parse(raw) : fallback;
    return value && typeof value === "object" ? value : fallback;
  } catch {
    return fallback;
  }
}
function ocSessionKey(resource) {
  return resource ? typeof resource === "string" ? resource : resource.toString() : "";
}
function ocWsLabel(entry) {
  if (!entry) return "";
  if (entry.kind === "home") return "\u7528\u6237\u76ee\u5f55";
  return entry.name || ocWsBasename(entry.path);
}
function ocWsMap(storage) {
  if (!ocWsMapCache) ocWsMapCache = ocReadJson(storage, OC_SESSION_WS_KEY, {});
  return ocWsMapCache;
}
function ocGetSessionWorkspace(storage, resource) {
  const key = ocSessionKey(resource);
  return key ? ocWsMap(storage)[key] : void 0;
}
function ocRecentWorkspaces(storage) {
  const recent = ocReadJson(storage, OC_RECENT_WS_KEY, []);
  return Array.isArray(recent) ? recent.filter((r) => r && typeof r.path === "string" && r.path) : [];
}
function ocDefaultWorkspace(storage, contextService) {
  const folder = contextService?.getWorkspace?.().folders?.[0];
  if (folder?.uri?.scheme === "file") return { kind: "folder", path: folder.uri.fsPath, name: folder.name || ocWsBasename(folder.uri.fsPath) };
  return ocRecentWorkspaces(storage)[0];
}
function ocSetSessionWorkspace(storage, resource, entry) {
  const key = ocSessionKey(resource);
  if (!key) return;
  const map = { ...ocWsMap(storage) };
  if (entry) map[key] = { kind: entry.kind, path: entry.path || "", name: entry.name || "", updated: Date.now() };
  else delete map[key];
  const keys = Object.keys(map);
  if (keys.length > 2e3) keys.sort((a, b) => (map[a].updated || 0) - (map[b].updated || 0)).slice(0, keys.length - 2e3).forEach((k) => delete map[k]);
  ocWsMapCache = map;
  storage.store(OC_SESSION_WS_KEY, JSON.stringify(map), -1 /* APPLICATION */, 1 /* MACHINE */);
  if (entry?.kind === "folder" && entry.path) {
    const recent = [entry, ...ocRecentWorkspaces(storage).filter((r) => r.path.toLowerCase() !== entry.path.toLowerCase())].slice(0, 12).map((r) => ({ kind: "folder", path: r.path, name: r.name || ocWsBasename(r.path) }));
    storage.store(OC_RECENT_WS_KEY, JSON.stringify(recent), -1 /* APPLICATION */, 1 /* MACHINE */);
  }
}
function ocToResource(arg) {
  if (!arg) return ocActiveChatViewPane?.widget?.viewModel?.sessionResource;
  if (typeof arg === "string") return URI.parse(arg);
  return arg.sessionResource ?? arg;
}
async function ocPickSessionWorkspace(accessor, arg) {
  const storage = accessor.get(IStorageService);
  const quickInput = accessor.get(IQuickInputService);
  const fileDialog = accessor.get(IFileDialogService);
  const contextService = accessor.get(IWorkspaceContextService);
  let workspacesService;
  try { workspacesService = accessor.get(IWorkspacesService); } catch {}
  const resource = ocToResource(arg);
  if (!resource) return void 0;
  const stored = ocGetSessionWorkspace(storage, resource);
  const current = stored ?? ocDefaultWorkspace(storage, contextService);
  const items = [];
  const seen = new Set();
  const push = (entry, detail) => {
    if (!entry?.path) return;
    const k = entry.path.toLowerCase();
    if (seen.has(k)) return;
    seen.add(k);
    const isCurrent = current?.kind !== "home" && current?.path?.toLowerCase() === k;
    items.push({ label: `$(folder) ${entry.name || ocWsBasename(entry.path)}`, description: entry.path, detail: [isCurrent ? "\u2713 \u5f53\u524d" : "", detail || ""].filter(Boolean).join(" \u00b7 ") || void 0, entry });
  };
  for (const f of contextService.getWorkspace().folders) if (f.uri.scheme === "file") push({ kind: "folder", path: f.uri.fsPath, name: f.name }, "\u5f53\u524d\u6253\u5f00\u7684\u6587\u4ef6\u5939");
  for (const r of ocRecentWorkspaces(storage)) push(r);
  try {
    const recent = await workspacesService?.getRecentlyOpened();
    for (const w of recent?.workspaces ?? []) {
      if (items.length >= 20) break;
      const uri = w.folderUri;
      if (uri?.scheme === "file") push({ kind: "folder", path: uri.fsPath, name: ocWsBasename(uri.fsPath) });
    }
  } catch {}
  const picks = [
    { type: "separator", label: "\u6700\u8fd1\u4f7f\u7528" },
    ...items,
    { type: "separator" },
    { label: "$(folder-opened) \u9009\u62e9\u6587\u4ef6\u5939\u2026", ocAction: "browse" },
    { label: "$(home) \u65e0\u5de5\u4f5c\u533a / \u7528\u6237\u76ee\u5f55", ocAction: "home", description: current?.kind === "home" ? "\u2713 \u5f53\u524d" : void 0 }
  ];
  const choice = await quickInput.pick(picks, {
    placeHolder: current ? `\u5f53\u524d\u5bf9\u8bdd\u7684\u5de5\u4f5c\u533a\uff1a${ocWsLabel(current)}${current.path ? `\uff08${current.path}\uff09` : ""}${stored ? "" : "\uff08\u9ed8\u8ba4\uff09"}` : "\u4e3a\u5f53\u524d\u5bf9\u8bdd\u9009\u62e9\u5de5\u4f5c\u533a",
    matchOnDescription: true
  });
  if (!choice) return void 0;
  let entry;
  if (choice.ocAction === "browse") {
    const uris = await fileDialog.showOpenDialog({ canSelectFolders: true, canSelectFiles: false, canSelectMany: false, title: "\u9009\u62e9\u5bf9\u8bdd\u5de5\u4f5c\u533a", openLabel: "\u9009\u62e9" });
    const uri = uris?.[0];
    if (!uri) return void 0;
    entry = { kind: "folder", path: uri.fsPath, name: ocWsBasename(uri.fsPath) };
  } else if (choice.ocAction === "home") {
    entry = { kind: "home", path: "", name: "\u7528\u6237\u76ee\u5f55" };
  } else {
    entry = choice.entry;
  }
  if (!entry) return void 0;
  ocSetSessionWorkspace(storage, resource, entry);
  ocActiveChatViewPane?.ocRefreshWorkspaceUi?.();
  return { kind: entry.kind, path: entry.path || "", name: ocWsLabel(entry) };
}
CommandsRegistry.registerCommand(OC_PICK_WS_COMMAND, (accessor, arg) => ocPickSessionWorkspace(accessor, arg));
// 扩展在每次请求开始时调用：返回当前对话的工作区；未设置时写入默认值（打开的文件夹，否则最近使用）
CommandsRegistry.registerCommand("opencode.chat.sessionWorkspace", (accessor, arg) => {
  const storage = accessor.get(IStorageService);
  const contextService = accessor.get(IWorkspaceContextService);
  const resource = ocToResource(arg);
  if (!resource) return null;
  let entry = ocGetSessionWorkspace(storage, resource);
  if (!entry) {
    entry = ocDefaultWorkspace(storage, contextService);
    if (entry) {
      ocSetSessionWorkspace(storage, resource, entry);
      ocActiveChatViewPane?.ocRefreshWorkspaceUi?.();
    }
  }
  return entry ? { kind: entry.kind, path: entry.path || "", name: ocWsLabel(entry), sessionResource: ocSessionKey(resource) } : null;
});
// OpenCode: 「权限」按钮的模式与 MCP 决策（工作台工具审批与扩展按同一设置执行）
var OC_PERMISSION_MODE_SETTING = "opencode.chat.permissionMode";
var OC_MCP_PERMISSIONS_SETTING = "opencode.chat.mcpPermissions";
var OC_PERMISSION_MODES = [
  { id: "ask", label: "\u6bcf\u6b21\u8be2\u95ee", icon: "shield", detail: "\u7ec8\u7aef\u547d\u4ee4\u3001\u6587\u4ef6\u4fee\u6539\u548c MCP \u5de5\u5177\u8c03\u7528\u524d\u90fd\u9700\u8981\u786e\u8ba4" },
  { id: "auto", label: "\u81ea\u52a8\u5141\u8bb8", icon: "unlock", detail: "\u5de5\u5177\u8c03\u7528\u4e0d\u518d\u5f39\u51fa\u786e\u8ba4" },
  { id: "fullAuto", label: "\u5168\u81ea\u52a8", icon: "rocket", detail: "\u540c\u300c\u81ea\u52a8\u5141\u8bb8\u300d\uff0c\u5e76\u4e14 AI \u7684\u6240\u6709\u63d0\u95ee\u4e0d\u518d\u7b49\u5f85\uff0c\u76f4\u63a5\u91c7\u7528\u63a8\u8350\u9879\uff08\u5bf9\u8bdd\u91cc\u7559\u8bb0\u5f55\uff09\uff0c\u4ea4\u63a5\u81ea\u52a8\u53d1\u9001\uff1b\u5355\u72ec\u8bbe\u4e3a\u7981\u6b62 / \u8be2\u95ee\u7684\u7c7b\u522b\u548c\u5de5\u5177\u4ecd\u4f18\u5148" },
  { id: "readonly", label: "\u53ea\u8bfb", icon: "eye", detail: "\u53ea\u5141\u8bb8\u8bfb\u53d6\u7c7b\u5de5\u5177\uff0c\u7981\u6b62\u4fee\u6539\u6587\u4ef6\u548c\u8fd0\u884c\u547d\u4ee4" }
];
var OC_PERMISSION_DECISION_LABEL = { allow: "\u5141\u8bb8", ask: "\u8be2\u95ee", deny: "\u7981\u6b62" };
function ocNormalizePermission(value2) {
  return value2 === "allow" || value2 === "ask" || value2 === "deny" ? value2 : void 0;
}
// OpenCode: 「权限」›「更多」的类别（与扩展 module-0140 / 工作台 module-2812 中的类别表保持一致；tools 为真实工具名）
var OC_CATEGORY_PERMISSIONS_SETTING = "opencode.chat.categoryPermissions";
var OC_TOOL_PERMISSIONS_SETTING = "opencode.chat.toolPermissions";
var OC_PERMISSION_CATEGORIES = [
  { id: "terminal", label: "\u7ec8\u7aef\u547d\u4ee4", tools: ["run_command", "send_command_input", "cancel_command"], defaults: { ask: "ask", auto: "allow", fullAuto: "allow", readonly: "deny" } },
  { id: "edit", label: "\u4fee\u6539\u6587\u4ef6", tools: ["apply_patch"], defaults: { ask: "ask", auto: "allow", fullAuto: "allow", readonly: "deny" } },
  { id: "screen", label: "\u5c4f\u5e55/\u6444\u50cf\u5934\u67e5\u770b", tools: ["see_now"], defaults: { ask: "allow", auto: "allow", fullAuto: "allow", readonly: "deny" } },
  { id: "memoryWrite", label: "\u5199\u5165\u8bb0\u5fc6", tools: ["bridge_memory_append", "bridge_memory_forget", "bridge_memory_draft", "bridge_memory_handoff", "bridge_memory_archive", "bridge_memory_promote", "bridge_memory_scratch", "bridge_memory_consolidate", "bridge_memory_policy"], defaults: { ask: "allow", auto: "allow", fullAuto: "allow", readonly: "deny" } },
  { id: "collab", label: "Bridge \u534f\u4f5c\u4e0e\u89c4\u5219", tools: ["bridge_get_effective_rules", "bridge_acknowledge_rules", "bridge_join_collaboration", "bridge_leave_collaboration", "bridge_get_collaboration", "bridge_create_task", "bridge_claim_task", "bridge_update_task", "bridge_get_execution", "bridge_send_message", "bridge_list_messages", "bridge_ack_message", "bridge_checkpoint_task", "bridge_resume_task", "bridge_wait_messages", "bridge_get_tool_gates"], defaults: { ask: "allow", auto: "allow", fullAuto: "allow", readonly: "deny" } },
  { id: "mcpConfig", label: "\u914d\u7f6e MCP \u670d\u52a1\u5668", tools: ["configure_mcp"], defaults: { ask: "ask", auto: "allow", fullAuto: "allow", readonly: "deny" } },
  { id: "custom", label: "\u81ea\u5b9a\u4e49\u5de5\u5177", prefix: "custom_", defaults: { ask: "own", auto: "own", fullAuto: "own", readonly: "deny" } },
  { id: "mcp", label: "MCP \u5de5\u5177", mcp: true, defaults: { ask: "ask", auto: "allow", fullAuto: "allow", readonly: "deny" } },
  { id: "branchCommand", label: "\u591a\u6a21\u578b\u540e\u53f0\u5206\u652f\u00b7\u7ec8\u7aef\u547d\u4ee4", follow: "terminal" },
  { id: "worktreeEdit", label: "\u9694\u79bb\u5de5\u4f5c\u6811\u6539\u52a8", defaults: { ask: "allow", auto: "allow", fullAuto: "allow", readonly: "deny" } }
];
// 不需要权限的内部工具（读取、搜索、诊断、读取记忆与技能、任务卡与计划）：三种模式下都直接允许，不在「更多」里显示；旧的类别/单工具设置忽略
var OC_PERMISSION_FREE_CATEGORY_IDS = /* @__PURE__ */ new Set(["read", "search", "diagnostics", "memoryRead", "tasks"]);
var OC_PERMISSION_FREE_TOOLS = /* @__PURE__ */ new Set(["read_files", "read_image", "find_files", "search_files", "list_directory", "get_diagnostics", "lsp", "bridge_memory_brief", "bridge_memory_recall", "bridge_memory_search", "bridge_memory_status", "bridge_memory_digest", "bridge_memory_selftest", "list_skills", "bridge_search_sessions", "set_todos", "update_plan", "report_progress"]);
// OpenCode: 「权限」菜单里的「隔离沙箱」开关——写入底层终端沙盒设置（Windows 为 chat.agent.sandbox.enabledWindows，其它平台为 chat.agent.sandbox.enabled）。
// 扩展的托管终端（opencode_run_command 实际运行的 Bash）在 Windows 上按此设置以低完整性令牌启动：只能写入带低完整性标签的工作区目录，其余位置写入被系统拒绝。
var OC_SANDBOX_SETTING = isWindows ? "chat.agent.sandbox.enabledWindows" : "chat.agent.sandbox.enabled";
var OC_SANDBOX_LABEL = "\u9694\u79bb\u6c99\u7bb1";
var OC_SANDBOX_ON_CLASS = "oc-perm-sandbox-on";
// 自绘菜单（窗口使用自定义标题栏时）把开启状态的「隔离沙箱」项染成主题强调色；原生菜单（titleBarStyle=native）无法着色，只显示勾选
function ocDecorateSandboxMenuItem(doc, enabled) {
  const view = doc?.querySelector?.(".context-view.oc-permission-menu");
  if (!view) return;
  const roots = [view];
  for (const el of view.querySelectorAll("*")) if (el.shadowRoot) roots.push(el.shadowRoot);
  for (const root of roots) {
    for (const label of root.querySelectorAll(".action-label")) {
      if (label.textContent?.trim() !== OC_SANDBOX_LABEL) continue;
      const item = label.closest(".action-menu-item") ?? label;
      item.classList.toggle(OC_SANDBOX_ON_CLASS, enabled);
      const color = enabled ? "var(--vscode-textLink-foreground, var(--vscode-button-background, #3794ff))" : "";
      for (const el of [item, ...item.querySelectorAll(".action-label, .menu-item-check")]) el.style.color = color;
      item.style.fontWeight = enabled ? "600" : "";
    }
  }
}
// 「权限」菜单及其子菜单：超出视口时往上推 / 换方向，保证每一项都在可见区域内（超高时由 VS Code Menu 自带的 max-height = 视口高度 - 35 + 滚动条处理）
function ocFitMenuToViewport(el) {
  const win = el?.ownerDocument?.defaultView;
  if (!win) return;
  const margin = 4;
  const r = el.getBoundingClientRect();
  if (!r.width || !r.height) return;
  let dy = 0, dx = 0;
  if (r.bottom > win.innerHeight - margin) dy = win.innerHeight - margin - r.bottom;
  if (r.top + dy < margin) dy = margin - r.top;
  if (r.right > win.innerWidth - margin) dx = win.innerWidth - margin - r.right;
  if (r.left + dx < margin) dx = margin - r.left;
  if (dy) el.style.top = `${(parseFloat(el.style.top) || 0) + dy}px`;
  if (dx) el.style.left = `${(parseFloat(el.style.left) || 0) + dx}px`;
}
function ocWatchMenuViewport(doc, className) {
  const view = doc?.querySelector?.(`.context-view.${className}`);
  const Observer = doc?.defaultView?.MutationObserver;
  if (!view || !Observer) return void 0;
  const fit = (el) => doc.defaultView.requestAnimationFrame(() => ocFitMenuToViewport(el));
  const observer = new Observer((records) => {
    for (const record of records) for (const node of record.addedNodes) if (node?.classList?.contains("monaco-submenu")) fit(node);
  });
  observer.observe(view, { childList: true, subtree: true });
  return observer;
}
function ocEnsureStyles(doc) {
  if (!doc || doc.getElementById("oc-chat-sessions-style")) return;
  const style = doc.createElement("style");
  style.id = "oc-chat-sessions-style";
  style.textContent = `
.agent-sessions-title-container .oc-sessions-new-chat,
.agent-sessions-title-container .oc-sessions-permission,
.agent-sessions-title-container .oc-session-workspace-chip { display: inline-flex; align-items: center; gap: 3px; height: 20px; padding: 0 6px; margin-left: 6px; border-radius: 4px; font-size: 11px; line-height: 20px; cursor: pointer; color: var(--vscode-foreground, #cccccc); background: transparent; white-space: nowrap; min-width: 0; flex-shrink: 1; text-decoration: none; }
/* OpenCode titlebar-step01: 标题行窄时工作区标签先缩，按钮收进「…」 */
.agent-sessions-title-container { min-width: 0; overflow: hidden; }
.agent-sessions-title-container .agent-sessions-toolbar { min-width: 0; flex: 0 1 auto; overflow: hidden; }
.agent-sessions-title-container .oc-session-workspace-chip { min-width: 24px; flex: 0 1 auto; overflow: hidden; }
.agent-sessions-title-container .oc-sessions-new-chat, .agent-sessions-title-container .oc-sessions-permission { flex: none; }
.agent-sessions-title-container .oc-session-workspace-chip { max-width: 160px; }
.agent-sessions-title-container .oc-sessions-new-chat,
.agent-sessions-title-container .oc-sessions-permission { flex-shrink: 0; }
.agent-sessions-title-container .oc-sessions-permission.oc-perm-auto > .codicon:first-child { color: var(--vscode-editorWarning-foreground, #cca700); }
.agent-sessions-title-container .oc-sessions-permission.oc-perm-readonly > .codicon:first-child { color: var(--vscode-textLink-foreground, #3794ff); }
.agent-sessions-title-container .oc-sessions-permission.oc-perm-fullauto > .codicon:first-child { color: var(--vscode-editorError-foreground, #f14c4c); }
.agent-sessions-title-container .oc-sessions-permission .oc-perm-sandbox-badge.codicon { font-size: 11px; color: var(--vscode-textLink-foreground, #3794ff); }
.agent-sessions-title-container .oc-sessions-new-chat:hover,
.agent-sessions-title-container .oc-sessions-permission:hover,
.agent-sessions-title-container .oc-session-workspace-chip:hover { background: var(--vscode-toolbar-hoverBackground, rgba(90, 93, 94, 0.31)); }
.agent-sessions-title-container .oc-sessions-new-chat:focus-visible,
.agent-sessions-title-container .oc-sessions-permission:focus-visible,
.agent-sessions-title-container .oc-session-workspace-chip:focus-visible { outline: 1px solid var(--vscode-focusBorder, #007fd4); }
.agent-sessions-title-container .oc-session-workspace-chip .codicon,
.agent-sessions-title-container .oc-sessions-permission .codicon,
.agent-sessions-title-container .oc-sessions-new-chat .codicon { font-size: 12px; }
.agent-sessions-title-container .oc-ws-chip-label { overflow: hidden; text-overflow: ellipsis; }
.agent-sessions-title { cursor: pointer; user-select: none; display: inline-flex; align-items: center; gap: 2px; }
.oc-sessions-chevron.codicon { font-size: 12px; }
/* OpenCode: 新对话是纯图标按钮靠左，权限与工作区靠右 */
.agent-sessions-title-container .oc-sessions-new-chat { order: -1; justify-content: center; width: 22px; height: 22px; padding: 0; margin: 0 2px 0 0; border-radius: 5px; color: var(--vscode-icon-foreground, #c5c5c5); }
.agent-sessions-title-container .oc-sessions-new-chat .codicon { font-size: 16px; color: inherit; }
.agent-sessions-title-container .oc-sessions-permission { margin-left: auto; }
/* OpenCode: 不显示空对话欢迎页标题（「使用智能体构建」） */
.chat-welcome-view-title { display: none !important; }
/* OpenCode: 左侧 CHAT / BRIDGE 标题即切换按钮，前面带图标 */
.composite-bar .action-item a.action-label[data-oc-mode] { cursor: pointer; position: relative; padding-left: 20px !important; }
.composite-bar .action-item a.action-label[data-oc-mode]::before { content: "\\eac7" !important; position: absolute !important; left: 0 !important; top: 50% !important; transform: translateY(-50%) !important; width: 16px !important; height: 16px !important; margin: 0 !important; padding: 0 !important; border: none !important; background: none !important; font-family: codicon !important; font-size: 15px !important; line-height: 16px !important; font-weight: normal !important; text-transform: none !important; text-align: center; }
.composite-bar .action-item a.action-label[data-oc-mode="bridge"]::before { content: "\\eb34" !important; }
/* OpenCode bridge-switch-step01: Chat 停到侧栏/面板后，用标题文字切换 Chat / Bridge */
.title-label h2[data-oc-mode], .pane-header h3.title[data-oc-mode] { cursor: pointer; position: relative; padding-left: 20px !important; overflow: visible !important; }
.title-label h2[data-oc-mode]::before, .pane-header h3.title[data-oc-mode]::before { content: "\\eac7"; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; font-family: codicon; font-size: 15px; line-height: 16px; font-weight: normal; text-transform: none; text-align: center; }
.title-label h2[data-oc-mode="bridge"]::before, .pane-header h3.title[data-oc-mode="bridge"]::before { content: "\\eb34"; }
.title-label h2[data-oc-mode]:hover, .pane-header h3.title[data-oc-mode]:hover { color: var(--vscode-foreground); }
.oc-sessions-compact .agent-sessions-container { border-bottom: 1px solid var(--vscode-sideBarSectionHeader-border, rgba(128, 128, 128, 0.35)); }
/* OpenCode sessions-click-1717: 左右排列时单击进入对话全页，左上角「返回」回到列表页 */
.oc-session-back-bar { display: flex; align-items: center; height: 26px; min-height: 26px; padding: 0 8px; box-sizing: border-box; flex-shrink: 0; }
.oc-session-back-bar .oc-session-back { display: inline-flex; align-items: center; gap: 4px; height: 22px; padding: 0 6px; border-radius: 5px; cursor: pointer; user-select: none; color: var(--vscode-foreground); text-decoration: none; }
.oc-session-back-bar .oc-session-back:hover { background: var(--vscode-toolbar-hoverBackground, rgba(90, 93, 94, 0.31)); }
.oc-session-back-bar .oc-session-back:focus-visible { outline: 1px solid var(--vscode-focusBorder, #007fd4); }
.oc-session-back-bar .oc-session-back .codicon { font-size: 14px; }
`;
  (doc.head || doc.documentElement).appendChild(style);
}
var ChatViewPane = class extends ViewPane {
  constructor(options3, keybindingService2, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, storageService, chatService, chatAgentService, logService, notificationService, layoutService, chatSessionsService, telemetryService, lifecycleService, progressService, agentSessionsService, chatEntitlementService, commandService, activityService, hostService, micCaptureService, ttsPlaybackService, voiceSessionController, voiceInputModeService, chatWidgetService, _agentTitleBarStatusService, _voicePlaybackService, _workbenchEnvironmentService, workspaceContextService, agentHostEnablementService, accessibilityService) {
    super(options3, keybindingService2, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.storageService = storageService;
    this.chatService = chatService;
    this.chatAgentService = chatAgentService;
    this.logService = logService;
    this.notificationService = notificationService;
    this.layoutService = layoutService;
    this.chatSessionsService = chatSessionsService;
    this.telemetryService = telemetryService;
    this.progressService = progressService;
    this.agentSessionsService = agentSessionsService;
    this.chatEntitlementService = chatEntitlementService;
    this.commandService = commandService;
    this.activityService = activityService;
    this.hostService = hostService;
    this.micCaptureService = micCaptureService;
    this.ttsPlaybackService = ttsPlaybackService;
    this.voiceSessionController = voiceSessionController;
    this.voiceInputModeService = voiceInputModeService;
    this.chatWidgetService = chatWidgetService;
    this.workspaceContextService = workspaceContextService;
    this.agentHostEnablementService = agentHostEnablementService;
    this.accessibilityService = accessibilityService;
    this.lastDimensionsPerOrientation = /* @__PURE__ */ new Map();
    this.loadSessionCts = this._register(new MutableDisposable());
    this._applyModelCts = this._register(new MutableDisposable());
    /** While > 0 the sessions list is suppressed so a session transition's transiently-empty widget does not reveal it (see {@link beginSessionsListSuppression}). */
    this._sessionsListSuppressionCount = 0;
    this.modelRef = this._register(new MutableDisposable());
    this.widgetViewStates = new LRUCache(CHAT_WIDGET_VIEW_STATE_CACHE_LIMIT);
    this.activityBadge = this._register(new MutableDisposable());
    this._currentSessionResource = observableValue(this, void 0);
    this.bridgeMode = false;
    this.persistentBridgeStartupScheduled = false;
    this._voiceBarDisposables = this._register(new DisposableStore());
    this.sessionsViewerOrientation = 1 /* Stacked */;
    this.sessionsViewerOrientationConfiguration = "sideBySide";
    // OpenCode: 对话列表常驻 + 每个对话的工作区
    this.ocSessionsCollapsed = this.storageService.getBoolean(OC_SESSIONS_COLLAPSED_KEY, -1 /* APPLICATION */, false);
    ocActiveChatViewPane = this;
    globalThis.__ocSessionWorkspaceLabel = (resource) => { try { return ocWsLabel(ocGetSessionWorkspace(this.storageService, resource)); } catch { return ""; } };
    this.sessionsViewerSashDisposables = this._register(new MutableDisposable());
    //#region Layout
    this.layoutingBody = false;
    this.element.classList.add("chat-viewpane-container");
    this.bridgeModeContext = ChatContextKeys.openCodeBridgeMode.bindTo(contextKeyService);
    this._register(toDisposable(() => this.bridgeModeContext.reset()));
    this.memento = new Memento(`interactive-session-view-${CHAT_PROVIDER_ID}`, this.storageService);
    this.viewState = this.memento.getMemento(1 /* WORKSPACE */, 1 /* MACHINE */);
    if (lifecycleService.startupKind !== 3 /* ReloadedWindow */ && this.configurationService.getValue("chat.restoreLastPanelSession" /* RestoreLastPanelSession */) === false) {
      this.viewState.sessionId = void 0;
      this.viewState.sessionResource = void 0;
    }
    this.sessionsViewerVisible = false;
    this.sessionsViewerSidebarWidth = Math.max(ChatViewPane.SESSIONS_SIDEBAR_MIN_WIDTH, this.viewState.sessionsSidebarWidth ?? ChatViewPane.SESSIONS_SIDEBAR_DEFAULT_WIDTH);
    this.chatViewLocationContext = ChatContextKeys.panelLocation.bindTo(contextKeyService);
    this.sessionsViewerOrientationContext = ChatContextKeys.agentSessionsViewerOrientation.bindTo(contextKeyService);
    this.sessionsViewerPositionContext = ChatContextKeys.agentSessionsViewerPosition.bindTo(contextKeyService);
    this.sessionsViewerVisibilityContext = ChatContextKeys.agentSessionsViewerVisible.bindTo(contextKeyService);
    this.updateContextKeys();
    this._focusedSessionResource = observableFromEvent(
      this,
      this.chatWidgetService.onDidChangeFocusedSession,
      () => this.chatWidgetService.lastFocusedWidget?.viewModel?.sessionResource
    );
    this.registerListeners();
    this._register(CommandsRegistry.registerCommand("_opencode.bridge.showSession", () => this.showBridgeSession()));
    this._register(CommandsRegistry.registerCommand("_opencode.bridge.showChat", () => this.showChatSession()));
    this._register(toDisposable(() => {
      this.containerTitleModel?.setTitle(void 0);
      this.containerTitleModel = void 0;
    }));
  }
  getModeViewTitle() {
    return this.bridgeMode ? localize(12704, null) : localize(12705, null);
  }
  get singleViewPaneContainerTitle() {
    return this.getModeViewTitle();
  }
  renderHeader(container3) {
    super.renderHeader(container3);
    this.updateTitle(this.getModeViewTitle());
    this.ocInstallModeTab(container3.ownerDocument);
  }
  updateTitle(_title) {
    const title = this.getModeViewTitle();
    super.updateTitle(title);
    this.updateContainerTitle(title);
    this.ocScheduleTagModeTab();
  }
  // OpenCode: 左侧视图标题（CHAT / BRIDGE）带图标，点击即在聊天与 Bridge 之间切换
  ocInstallModeTab(doc) {
    if (!doc || this.ocModeTabDoc === doc) return;
    this.ocModeTabDoc = doc;
    ocEnsureStyles(doc);
    this._register(addDisposableListener(doc, EventType.CLICK, (e) => {
      const tab = e.target?.closest?.("a.action-label[data-oc-mode], .title-label h2[data-oc-mode], .pane-header h3.title[data-oc-mode]");
      if (!tab) return;
      EventHelper.stop(e, true);
      e.stopImmediatePropagation?.();
      const toBridge = tab.getAttribute("data-oc-mode") !== "bridge";
      void this.commandService.executeCommand(toBridge ? "opencode.bridge.openSession" : "_opencode.bridge.showChat");
    }, true));
    const Observer = doc.defaultView?.MutationObserver;
    if (Observer) {
      const observer = new Observer(() => this.ocScheduleTagModeTab());
      for (const part of doc.querySelectorAll(".part.auxiliarybar, .part.sidebar, .part.panel")) {
        observer.observe(part, { childList: true, subtree: true, characterData: true });
      }
      this._register(toDisposable(() => observer.disconnect()));
    }
    this.ocScheduleTagModeTab();
  }
  ocScheduleTagModeTab() {
    const doc = this.ocModeTabDoc;
    const win = doc?.defaultView;
    if (!win || this.ocModeTabFrame) return;
    this.ocModeTabFrame = win.requestAnimationFrame(() => {
      this.ocModeTabFrame = 0;
      this.ocTagModeTab();
    });
  }
  ocTagModeTab() {
    const doc = this.ocModeTabDoc;
    if (!doc) return;
    // OpenCode bridge-switch-step09: 不再把容器标签/标题改造成切换按钮（左右两边长得不一样）；统一用视图标题栏按钮
    for (const label of doc.querySelectorAll("[data-oc-mode]")) label.removeAttribute("data-oc-mode");
    return;
    const chatTitle = localize(12705, null);
    const bridgeTitle = localize(12704, null);
    for (const label of doc.querySelectorAll(".composite-bar .action-item a.action-label, .part > .composite.title .title-label h2, .pane-header h3.title")) {
      const text = (label.textContent || "").trim();
      const mode = text === bridgeTitle ? "bridge" : text === chatTitle ? "chat" : void 0;
      if (!mode) {
        if (label.hasAttribute("data-oc-mode")) label.removeAttribute("data-oc-mode");
        continue;
      }
      if (label.getAttribute("data-oc-mode") !== mode) label.setAttribute("data-oc-mode", mode);
    }
  }
  updateContainerTitle(title) {
    const viewContainer5 = this.viewDescriptorService.getViewContainerByViewId(this.id);
    const model = viewContainer5 ? this.viewDescriptorService.getViewContainerModel(viewContainer5) : void 0;
    if (this.containerTitleModel && this.containerTitleModel !== model) {
      this.containerTitleModel.setTitle(void 0);
    }
    this.containerTitleModel = model;
    if (!model) {
      return;
    }
    const ownsContainerTitle = model.visibleViewDescriptors.every((view) => view.id === this.id);
    model.setTitle(ownsContainerTitle ? title : void 0);
  }
  updateContextKeys() {
    const { position: position2, location: location2 } = this.getViewPositionAndLocation();
    this.chatViewLocationContext.set(location2 ?? 2 /* AuxiliaryBar */);
    this.sessionsViewerOrientationContext.set(this.sessionsViewerOrientation);
    this.sessionsViewerPositionContext.set(position2 === 1 /* RIGHT */ ? 2 /* Right */ : 1 /* Left */);
  }
  getViewPositionAndLocation() {
    const viewLocation = this.viewDescriptorService.getViewLocationById(this.id);
    const sideBarPosition = this.layoutService.getSideBarPosition();
    const panelPosition = this.layoutService.getPanelPosition();
    let sideSessionsOnRightPosition;
    switch (viewLocation) {
      case 0 /* Sidebar */:
        sideSessionsOnRightPosition = sideBarPosition === 1 /* RIGHT */;
        break;
      case 1 /* Panel */:
        sideSessionsOnRightPosition = panelPosition !== 0 /* LEFT */;
        break;
      default:
        sideSessionsOnRightPosition = sideBarPosition === 0 /* LEFT */;
        break;
    }
    return {
      position: sideSessionsOnRightPosition ? 1 /* RIGHT */ : 0 /* LEFT */,
      location: viewLocation ?? 2 /* AuxiliaryBar */
    };
  }
  getSessionHoverPosition() {
    const viewLocation = this.viewDescriptorService.getViewLocationById(this.id);
    const sideBarPosition = this.layoutService.getSideBarPosition();
    if (this.sessionsViewerOrientation === 2 /* SideBySide */) {
      return viewLocation === 0 /* Sidebar */ && sideBarPosition === 1 /* RIGHT */ ? 0 /* LEFT */ : 1 /* RIGHT */;
    }
    return {
      [0 /* LEFT */]: 1 /* RIGHT */,
      [1 /* RIGHT */]: 0 /* LEFT */,
      [3 /* TOP */]: 2 /* BELOW */,
      [2 /* BOTTOM */]: 3 /* ABOVE */
    }[viewLocation === 1 /* Panel */ ? this.layoutService.getPanelPosition() : sideBarPosition];
  }
  updateViewPaneClasses(fromEvent) {
    const activityBarLocationDefault = this.configurationService.getValue("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */) === "default";
    this.viewPaneContainer?.classList.toggle("activity-bar-location-default", activityBarLocationDefault);
    this.viewPaneContainer?.classList.toggle("activity-bar-location-other", !activityBarLocationDefault);
    const { position: position2, location: location2 } = this.getViewPositionAndLocation();
    this.viewPaneContainer?.classList.toggle("chat-view-location-auxiliarybar", location2 === 2 /* AuxiliaryBar */);
    this.viewPaneContainer?.classList.toggle("chat-view-location-sidebar", location2 === 0 /* Sidebar */);
    this.viewPaneContainer?.classList.toggle("chat-view-location-panel", location2 === 1 /* Panel */);
    this.viewPaneContainer?.classList.toggle("chat-view-position-left", position2 === 0 /* LEFT */);
    this.viewPaneContainer?.classList.toggle("chat-view-position-right", position2 === 1 /* RIGHT */);
    if (fromEvent) {
      this.relayout();
    }
  }
  registerListeners() {
    this._register(this.chatAgentService.onDidChangeAgents(() => this.onDidChangeAgents()));
    this._register(this.chatSessionsService.onDidCommitSession(async (e) => {
      if (!this.modelRef.value) {
        return;
      }
      if (!isEqual2(e.original, this.modelRef.value.object.sessionResource)) {
        return;
      }
      const modelRef = await this.chatService.acquireOrLoadSession(e.committed, "panel" /* Chat */, CancellationToken.None, "ChatViewPane#onDidCommitSession");
      await this.showModel(CancellationToken.None, modelRef);
    }));
    this._register(Event2.any(
      Event2.filter(this.configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration("workbench.sideBar.location")),
      this.layoutService.onDidChangePanelPosition,
      this.layoutService.onDidChangePartVisibility,
      Event2.filter(this.viewDescriptorService.onDidChangeContainerLocation, (e) => e.viewContainer === this.viewDescriptorService.getViewContainerByViewId(this.id))
    )(() => {
      this.updateContextKeys();
      this.updateViewPaneClasses(
        true
        /* layout here */
      );
    }));
    this._register(Event2.filter(this.configurationService.onDidChangeConfiguration, (e) => {
      return e.affectsConfiguration("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */);
    })(() => this.updateViewPaneClasses(true)));
  }
  onDidChangeAgents() {
    if (this.chatAgentService.getDefaultAgent("panel" /* Chat */)) {
      if (!this._widget?.viewModel && !this.restoringSession) {
        this.restoringSession = this.acquireTransferredOrPersistedSession(CancellationToken.None, "ChatViewPane#onDidChangeAgents").then(async (session) => {
          if (!this._widget) {
            return;
          }
          const wasVisible = this._widget.visible;
          try {
            this._widget.setVisible(false);
            await this.showModel(CancellationToken.None, session.modelRef, true, !session.modelRef, void 0, session.localFallbackSelectionReason);
          } finally {
            this._widget.setVisible(wasVisible);
          }
        });
        this.restoringSession.finally(() => this.restoringSession = void 0);
      }
    }
    this._onDidChangeViewWelcomeState.fire();
  }
  getTransferredOrPersistedSessionInfo() {
    if (this.chatService.transferredSessionResource) {
      return this.chatService.transferredSessionResource;
    }
    if (this.viewState.sessionResource) {
      return this.viewState.sessionResource;
    }
    return this.viewState.sessionId ? LocalChatSessionUri.forSession(this.viewState.sessionId) : void 0;
  }
  renderBody(parent) {
    super.renderBody(parent);
    this.telemetryService.publicLog2("chatViewPaneOpened");
    this.viewPaneContainer = parent;
    this.viewPaneContainer.classList.add("chat-viewpane");
    this.viewPaneContainer.classList.toggle("opencode-bridge-mode", this.bridgeMode);
    this.updateViewPaneClasses(false);
    const controlsWrapper = append(parent, $(".voice-agent-controls-wrapper"));
    this.controlsRow = append(controlsWrapper, $(".voice-agent-main-row"));
    this.createControls(this.controlsRow, controlsWrapper);
    const workbenchContainer = this.layoutService.getContainer(getWindow(parent));
    this._register(addDisposableListener(workbenchContainer, EventType.MOUSE_DOWN, (event) => this.handleMouseBackNavigation(event), true));
    this._voiceBarContainer = $(".voice-agent-bar-host");
    this._voiceBarContainer.style.display = "none";
    this._updateVoiceBar(this._voiceBarContainer);
    const inputContainerEl = this._widget.inputPart.inputContainerElement;
    if (inputContainerEl) {
      this._setupVoiceTranscriptOverlay(inputContainerEl);
    }
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("agents.voice.enabled")) {
        this._updateVoiceBar(this._voiceBarContainer);
      }
    }));
    this.setupContextMenu(parent);
    this.applyModel();
  }
  async handleMouseBackNavigation(event) {
    if (event.button !== 3 || this.sessionsViewerOrientation !== 1 /* Stacked */ || this.sessionsViewerVisible || this._sessionsListSuppressionCount > 0 || this.welcomeController?.isShowingWelcome.get()) {
      return;
    }
    const viewModel = this._widget.viewModel;
    if (!viewModel || this._widget.isEmpty() && !viewModel.model.title) {
      return;
    }
    if (!this.configurationService.getValue(MOUSE_BACK_FORWARD_NAVIGATION_SETTING) || !this.configurationService.getValue("chat.viewSessions.enabled" /* ChatViewSessionsEnabled */)) {
      return;
    }
    const activeElement = getWindow(this._widget.domNode).document.activeElement;
    if (!activeElement || !this._widget.domNode.contains(activeElement)) {
      return;
    }
    EventHelper.stop(event, true);
    event.stopImmediatePropagation();
    await this.clear();
    this.focusSessions();
  }
  showBridgeSession() {
    this.bridgeMode = true;
    this.bridgeModeContext.set(true);
    this.updateTitle(this.getModeViewTitle());
    this.viewPaneContainer?.classList.add("opencode-bridge-mode");
    this._widget?.setVisible(false);
    this.bridgeSessionView?.setVisible(this.isBodyVisible(), true);
    this.refreshSessionsControlVisibility();
    this.relayout();
  }
  showChatSession() {
    this.bridgeModeContext.set(false);
    if (!this.bridgeMode) {
      this.updateTitle(this.getModeViewTitle());
      return;
    }
    this.bridgeMode = false;
    this.updateTitle(this.getModeViewTitle());
    this.viewPaneContainer?.classList.remove("opencode-bridge-mode");
    this.bridgeSessionView?.setVisible(this.isBodyVisible(), false);
    this._widget?.setVisible(this.isBodyVisible() && !this.welcomeController?.isShowingWelcome.get());
    this.refreshSessionsControlVisibility();
    this.relayout();
    this._widget?.focusInput();
  }
  schedulePersistentBridgeStartup(container3) {
    if (this.persistentBridgeStartupScheduled || this.configurationService.getValue("opencode.bridge.persistentMode") !== true) {
      return;
    }
    this.persistentBridgeStartupScheduled = true;
    const targetWindow = getWindow(container3);
    let firstFrame = 0;
    let secondFrame = 0;
    let startupTimer;
    firstFrame = targetWindow.requestAnimationFrame(() => {
      secondFrame = targetWindow.requestAnimationFrame(() => {
        startupTimer = targetWindow.setTimeout(() => {
          if (this.configurationService.getValue("opencode.bridge.persistentMode") !== true) {
            this.showChatSession();
            return;
          }
          this.showBridgeSession();
          void this.commandService.executeCommand("opencode.bridge.start").catch((error) => notifyBridgeAutoStartFailure(error, this.commandService, this.notificationService));
        }, 300);
      });
    });
    this._register(toDisposable(() => {
      targetWindow.cancelAnimationFrame(firstFrame);
      targetWindow.cancelAnimationFrame(secondFrame);
      if (startupTimer !== void 0) {
        targetWindow.clearTimeout(startupTimer);
      }
    }));
  }
  createControls(parent, taskShelfParent) {
    const sessionsControl = this.createSessionsControl(parent);
    const welcomeController = this.welcomeController = this._register(this.instantiationService.createInstance(ChatViewWelcomeController, parent, this, "panel" /* Chat */));
    const chatWidget = this.createChatControl(parent, taskShelfParent);
    this.registerControlsListeners(sessionsControl, chatWidget, welcomeController);
    this._register(chatWidget.onDidChangeViewModel(() => this.ocRefreshWorkspaceUi()));
    this.ocRefreshWorkspaceUi();
    this.updateSessionsControlVisibility();
  }
  _updateVoiceBar(container3) {
    this._voiceBarDisposables.clear();
    container3.replaceChildren();
    container3.style.display = "none";
    if (this.configurationService.getValue("agents.voice.enabled")) {
      this._voiceBarDisposables.add(CommandsRegistry.registerCommand("_chat.voice.acceptInput", (accessor, text2) => {
        const chatWidgetService = accessor.get(IChatWidgetService);
        const focusedWidget = chatWidgetService.lastFocusedWidget;
        const widget = focusedWidget?.hasInputFocus() ? focusedWidget : this._widget;
        if (text2 && widget?.viewModel) {
          if (widget.viewModel.editing) {
            widget.input.setValue(text2, false);
          } else {
            return widget.acceptInput(combineVoiceInput(widget.getInput(), text2), {
              preserveFocus: true,
              isVoiceModeInput: this.configurationService.getValue(VOICE_AGENT_PROGRESS_SETTING) === true
            });
          }
        }
        return void 0;
      }));
      this._voiceBarDisposables.add(CommandsRegistry.registerCommand("_chat.voice.switchToSession", async (_accessor, resourceStr) => {
        if (!resourceStr) {
          return false;
        }
        try {
          const resource = URI.parse(resourceStr);
          this.viewState.sessionResource = resource;
          this.applyModel();
          await this.restoringSession;
          const restoredResource = this._widget?.viewModel?.sessionResource;
          return !!restoredResource && isEqual2(restoredResource, resource);
        } catch {
          return false;
        }
      }));
      this._voiceBarDisposables.add(CommandsRegistry.registerCommand("_chat.voice.getCurrentSession", (_accessor) => {
        return this._widget?.viewModel?.sessionResource?.toString();
      }));
      this._voiceBarDisposables.add(CommandsRegistry.registerCommand("_chat.voice.selectModel", (_accessor, requestedModel) => {
        const widget = this._getVoiceActionWidget();
        if (!widget) {
          return { ok: false, reason: "no_input" };
        }
        const resolved = resolveVoiceModel(widget.inputPart.availableLanguageModels, requestedModel);
        if (!resolved.ok || !resolved.identifier) {
          return resolved;
        }
        return widget.inputPart.switchModelByIdentifier(resolved.identifier, true, true) ? resolved : { ok: false, reason: "selection_failed", available_models: resolved.available_models };
      }));
    }
  }
  _getVoiceActionWidget() {
    const target = this._currentVoiceInputResource();
    return target ? this.chatWidgetService.getWidgetBySessionResource(target) : this._widget;
  }
  /**
   * The single chat input voice mode is currently bound to. An explicit target
   * session wins, otherwise the last-focused chat widget's session falls back to
   * this pane's own session. The glow / transcript render only on
   * the pane whose session matches this, so with several chat inputs open (e.g.
   * this pane plus a chat editor) exactly one lights up.
   */
  _currentVoiceInputResource(reader) {
    const target = reader ? this.voiceSessionController.targetSession.read(reader) : this.voiceSessionController.targetSession.get();
    if (target) {
      return target;
    }
    const focused = reader ? this._focusedSessionResource.read(reader) : this._focusedSessionResource.get();
    return focused ?? this._widget?.viewModel?.sessionResource;
  }
  _setupVoiceTranscriptOverlay(inputContainerEl) {
    inputContainerEl.style.position = "relative";
    const showTranscriptSetting = observableFromEvent(
      this,
      Event2.filter(this.configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration("agents.voice.showTranscript")),
      () => this.configurationService.getValue("agents.voice.showTranscript") !== false
    );
    const showLiveTranscriptSetting = observableFromEvent(
      this,
      Event2.filter(this.configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration("agents.voice.liveTranscript")),
      () => this.configurationService.getValue("agents.voice.liveTranscript") !== false
    );
    const inputValue = observableFromEvent(
      this,
      this._widget.inputEditor.onDidChangeModelContent,
      () => this._widget.getInput()
    );
    const transcriptOverlay = $(".voice-transcript-overlay");
    const transcriptScrollable = this._register(new DomScrollableElement(transcriptOverlay, {
      horizontal: 2 /* Hidden */,
      vertical: 1 /* Auto */
    }));
    const transcriptOverlayNode = transcriptScrollable.getDomNode();
    transcriptOverlayNode.classList.add("voice-transcript-overlay-scrollable");
    transcriptOverlayNode.style.display = "none";
    inputContainerEl.append(transcriptOverlayNode);
    let animFrameId;
    const glowDataArrayRef = { value: void 0 };
    const win = getWindow(inputContainerEl);
    const glowController = this._register(createVoiceGlowController(
      inputContainerEl,
      () => isDark(this.themeService.getColorTheme().type) ? "dark" : "light",
      () => resolveVoiceGlowColors(this.themeService.getColorTheme())
    ));
    this._register(this.themeService.onDidColorThemeChange(() => glowController.refreshTheme()));
    const getEffectiveVoice = () => {
      const sim = this.voiceInputModeService.simulatedVoiceState.get();
      if (sim === "idle" || sim === "listening" || sim === "speaking") {
        return { connected: true, voiceState: sim, simulating: true };
      }
      if (sim === "off" || sim === "connecting" || sim === "dictating") {
        return { connected: false, voiceState: "idle", simulating: true };
      }
      const voiceState = this.voiceSessionController.voiceState.get();
      return {
        connected: this.voiceSessionController.isConnected.get(),
        // While muted the mic isn't heard; treat muted-listening as idle (no
        // glow). Only check mute in the listening state so other states don't
        // depend on it.
        voiceState: voiceState === "listening" && this.voiceSessionController.isMuted.get() ? "idle" : voiceState,
        simulating: false
      };
    };
    const startGlowAnimation = () => {
      if (animFrameId !== void 0) {
        return;
      }
      const animate2 = () => {
        animFrameId = win.requestAnimationFrame(animate2);
        const { connected, voiceState, simulating } = getEffectiveVoice();
        const currentSession = this._currentSessionResource.get();
        const boundResource = this._currentVoiceInputResource();
        const isOwner = !!currentSession && !!boundResource && isEqual2(currentSession, boundResource);
        const glowActive = connected && isGlowingVoiceState(voiceState) && (simulating || isOwner);
        if (!glowActive) {
          glowController.clear();
          return;
        }
        const analyser = this.ttsPlaybackService.analyserNode ?? (voiceState === "listening" ? this.micCaptureService.analyserNode : null) ?? null;
        let intensity;
        if (!analyser && simulating) {
          const t2 = Date.now() / 1e3;
          intensity = Math.min(1, 0.28 + 0.34 * Math.abs(Math.sin(t2 * 6.1)) + 0.22 * Math.abs(Math.sin(t2 * 11.3 + 1)));
        } else {
          intensity = readVoiceGlowIntensity(analyser, glowDataArrayRef);
        }
        glowController.render(voiceState, intensity, this.accessibilityService.isMotionReduced());
      };
      animFrameId = win.requestAnimationFrame(animate2);
    };
    const stopGlowAnimation = () => {
      if (animFrameId !== void 0) {
        win.cancelAnimationFrame(animFrameId);
        animFrameId = void 0;
      }
      glowController.clear();
    };
    this._register(autorun((reader) => {
      const connected = this.voiceSessionController.isConnected.read(reader);
      const voiceState = this.voiceSessionController.voiceState.read(reader);
      const sim = this.voiceInputModeService.simulatedVoiceState.read(reader);
      const simGlow = sim === "listening" || sim === "speaking";
      const liveGlow = connected && isGlowingVoiceState(voiceState) && !(voiceState === "listening" && this.voiceSessionController.isMuted.read(reader));
      if (simGlow || liveGlow) {
        startGlowAnimation();
      } else {
        stopGlowAnimation();
      }
    }));
    this._register({ dispose: () => stopGlowAnimation() });
    let listeningSession;
    let ownerSession;
    this._register(autorun((reader) => {
      const simState = this.voiceInputModeService.simulatedVoiceState.read(reader);
      const simVersion = this.voiceInputModeService.simulatedVersion.read(reader);
      if (simState !== void 0) {
        if (simState === "idle" && simVersion) {
          transcriptOverlayNode.style.display = "";
          transcriptOverlayNode.classList.remove("has-transcript");
          transcriptOverlay.replaceChildren();
          const hint = $("span.partial");
          switch (simVersion) {
            case "handsFree":
              hint.textContent = localize(12715, null);
              break;
            case "keyboardHold": {
              const kbLabel = this.keybindingService.lookupKeybinding("workbench.action.chat.voiceInputMode.holdToTalk")?.getLabel();
              hint.textContent = kbLabel ? localize(12711, null, kbLabel) : localize(12716, null);
              break;
            }
            case "buttonHold":
              hint.textContent = localize(12713, null);
              break;
            case "clickToggle":
              hint.textContent = localize(12714, null);
              break;
          }
          transcriptOverlay.append(hint);
          transcriptScrollable.scanDomNode();
        } else {
          transcriptOverlayNode.style.display = "none";
          transcriptOverlayNode.classList.remove("has-transcript");
        }
        return;
      }
      const turns = this.voiceSessionController.transcriptTurns.read(reader);
      const connected = this.voiceSessionController.isConnected.read(reader);
      const voiceState = this.voiceSessionController.voiceState.read(reader);
      const targetSession = this.voiceSessionController.targetSession.read(reader);
      const currentSession = this._currentSessionResource.read(reader);
      const showTranscript = showTranscriptSetting.read(reader);
      const showLiveTranscript = showLiveTranscriptSetting.read(reader);
      const hasInput = inputValue.read(reader).length > 0;
      const visible = turns.filter((t2) => t2.text.length > 0 || t2.speaker === "user" && t2.isPartial);
      const showListeningPlaceholder = voiceState === "listening" && (!showTranscript || !showLiveTranscript);
      if (!connected) {
        listeningSession = void 0;
        ownerSession = void 0;
        transcriptOverlayNode.style.display = "none";
        transcriptOverlayNode.classList.remove("has-transcript");
        return;
      }
      if (voiceState === "listening") {
        if (!listeningSession) {
          listeningSession = targetSession ?? currentSession;
          ownerSession = listeningSession;
        } else if (!targetSession && currentSession && !isEqual2(currentSession, listeningSession)) {
          const dictationSession = listeningSession;
          const activelyDictating = turns.some((t2) => t2.speaker === "user" && t2.isPartial && t2.text.trim().length > 0);
          if (activelyDictating) {
            this.voiceSessionController.finishListeningAndSubmitTo(dictationSession);
            listeningSession = void 0;
          } else if (isUntitledChatSession(currentSession)) {
            listeningSession = currentSession;
            ownerSession = currentSession;
          } else {
            this.voiceSessionController.discardListening();
            listeningSession = void 0;
          }
        }
      } else {
        listeningSession = void 0;
      }
      const boundResource = this._currentVoiceInputResource(reader);
      if (boundResource && currentSession && !isEqual2(boundResource, currentSession)) {
        transcriptOverlayNode.style.display = "none";
        transcriptOverlayNode.classList.remove("has-transcript");
        return;
      }
      const effectiveOwner = targetSession ?? ownerSession;
      if (effectiveOwner && currentSession && !isEqual2(effectiveOwner, currentSession)) {
        transcriptOverlayNode.style.display = "none";
        transcriptOverlayNode.classList.remove("has-transcript");
        return;
      }
      if (visible.length === 0 || !showTranscript || showListeningPlaceholder) {
        if (hasInput) {
          transcriptOverlayNode.style.display = "none";
          transcriptOverlayNode.classList.remove("has-transcript");
          return;
        }
        const handsFree = this.configurationService.getValue("agents.voice.handsFree") === true;
        if (showListeningPlaceholder) {
          transcriptOverlayNode.style.display = "";
          transcriptOverlayNode.classList.remove("has-transcript");
          transcriptOverlay.replaceChildren();
          const listening = $("span.listening");
          listening.textContent = this.voiceSessionController.isMuted.read(reader) ? localize(12710, null) : localize(12709, null);
          transcriptOverlay.append(listening);
          transcriptScrollable.scanDomNode();
        } else if (!showTranscript && voiceState === "speaking") {
          transcriptOverlayNode.style.display = "";
          transcriptOverlayNode.classList.remove("has-transcript");
          transcriptOverlay.replaceChildren();
          const hint = $("span.partial");
          const kb = this.keybindingService.lookupKeybinding("workbench.action.chat.voiceInputMode.holdToTalk") ?? this.keybindingService.lookupKeybinding("agentsVoice.pushToTalk");
          const kbLabel = kb?.getLabel();
          hint.textContent = kbLabel ? localize(12706, null, kbLabel) : localize(12707, null);
          transcriptOverlay.append(hint);
          transcriptScrollable.scanDomNode();
        } else if (voiceState === "idle" && visible.length === 0 && showTranscript && !handsFree) {
          transcriptOverlayNode.style.display = "";
          transcriptOverlayNode.classList.remove("has-transcript");
          transcriptOverlay.replaceChildren();
          const hint = $("span.partial");
          const kb = this.keybindingService.lookupKeybinding("agentsVoice.pushToTalk");
          const kbLabel = kb?.getLabel();
          hint.textContent = kbLabel ? localize(12712, null, kbLabel) : localize(12708, null);
          transcriptOverlay.append(hint);
          transcriptScrollable.scanDomNode();
        } else {
          transcriptOverlayNode.style.display = "none";
          transcriptOverlayNode.classList.remove("has-transcript");
        }
        return;
      }
      transcriptOverlayNode.style.display = "";
      transcriptOverlayNode.classList.add("has-transcript");
      const lastTurn = visible[visible.length - 1];
      const contentElements = [];
      if (lastTurn.speaker === "user") {
        const span = $("span");
        if (lastTurn.isPartial) {
          const committedPart = lastTurn.committed || "";
          const unsurePart = lastTurn.text.slice(committedPart.length);
          if (committedPart) {
            const c = $("span.committed");
            c.textContent = committedPart;
            span.append(c);
          }
          const u = $("span.partial");
          u.textContent = unsurePart + "\u2589";
          span.append(u);
        } else {
          span.className = "committed";
          span.textContent = lastTurn.text;
        }
        contentElements.push(span);
      } else {
        const div = $("div.assistant-text");
        div.textContent = lastTurn.text;
        contentElements.push(div);
      }
      transcriptOverlay.replaceChildren(...contentElements);
      transcriptScrollable.scanDomNode();
      transcriptScrollable.setScrollPosition({ scrollTop: 0 });
    }));
  }
  static {
    //#endregion
    //#region Sessions Control
    this.SESSIONS_SIDEBAR_MIN_WIDTH = 200;
  }
  static {
    this.SESSIONS_SIDEBAR_SNAP_THRESHOLD = this.SESSIONS_SIDEBAR_MIN_WIDTH / 2;
  }
  static {
    // snap to hide when dragged below half of minimum width
    this.SESSIONS_SIDEBAR_DEFAULT_WIDTH = 300;
  }
  static {
    this.SESSIONS_SIDEBAR_BORDER_WIDTH = 1;
  }
  static {
    this.CHAT_WIDGET_DEFAULT_WIDTH = 300;
  }
  static {
    this.SESSIONS_SIDEBAR_VIEW_MIN_WIDTH = this.CHAT_WIDGET_DEFAULT_WIDTH + this.SESSIONS_SIDEBAR_DEFAULT_WIDTH;
  }
  get agentSessionsControl() {
    return this.sessionsControl;
  }
  ocSessionsToolbarWidth(row, toolbarEl) {
    const width2 = row.clientWidth;
    if (!width2) return Number.MAX_SAFE_INTEGER;
    let used = 0;
    for (const child of row.children) {
      if (child === toolbarEl) continue;
      const w = child.getBoundingClientRect().width;
      used += child.classList.contains("oc-session-workspace-chip") ? Math.min(w, 56) : w;
    }
    return Math.max(24, width2 - used - 16);
  }
  createSessionsControl(parent) {
    const sessionsContainer = this.sessionsContainer = parent.appendChild($(".agent-sessions-container"));
    const sessionsTitleContainer = this.sessionsTitleContainer = append(sessionsContainer, $(".agent-sessions-title-container"));
    const sessionsTitle = this.sessionsTitle = append(sessionsTitleContainer, $("span.agent-sessions-title"));
    ocEnsureStyles(sessionsContainer.ownerDocument);
    this.ocSessionsChevron = append(sessionsTitle, $("span.oc-sessions-chevron"));
    // OpenCode: 标题行不再显示「对话」文字；打开对话时保留折叠箭头用于收起/展开列表
    sessionsTitle.title = "\u6536\u8d77/\u5c55\u5f00\u5bf9\u8bdd\u5217\u8868";
    this._register(addDisposableListener(sessionsTitle, EventType.CLICK, () => {
      if (this.sessionsViewerOrientation === 1 /* Stacked */ && this.ocIsChatOpen()) {
        // OpenCode: 窄面板打开对话时，标题行就是「返回」：回到对话列表
        void this.clear().then(() => this.focusSessions());
        return;
      }
      this.sessionsControl?.scrollToTop();
      this.sessionsControl?.focus();
    }));
    const sessionsToolbarContainer = append(sessionsTitleContainer, $(".agent-sessions-toolbar"));
    const sessionsToolbar = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, sessionsToolbarContainer, MenuId.AgentSessionsToolbar, {
      menuOptions: { shouldForwardArgs: true },
      // OpenCode titlebar-step01: 宽度不够时收进「…」，不再出界
      responsiveBehavior: { enabled: true, observedElement: sessionsTitleContainer, getAvailableWidth: () => this.ocSessionsToolbarWidth(sessionsTitleContainer, sessionsToolbarContainer), actionMinWidth: 22 }
    }));
    // OpenCode: 标题行左侧的纯图标「新对话」按钮
    const ocNewChat = sessionsTitleContainer.insertBefore($("a.oc-sessions-new-chat"), sessionsToolbarContainer);
    ocNewChat.setAttribute("role", "button");
    ocNewChat.tabIndex = 0;
    append(ocNewChat, $("span.codicon.codicon-add"));
    ocNewChat.setAttribute("aria-label", "\u65b0\u5efa\u5bf9\u8bdd");
    ocNewChat.title = "\u65b0\u5efa\u5bf9\u8bdd";
    this._register(addDisposableListener(ocNewChat, EventType.CLICK, (e) => { EventHelper.stop(e, true); this.commandService.executeCommand(ACTION_ID_NEW_CHAT, this.getActionsContext()); }));
    // OpenCode: 标题行「权限」按钮——工具权限模式与 MCP 工具权限（设置 opencode.chat.permissionMode / opencode.chat.mcpPermissions）
    const ocPerm = this.ocPermissionButton = append(sessionsTitleContainer, $("a.oc-sessions-permission"));
    ocPerm.setAttribute("role", "button");
    ocPerm.setAttribute("aria-haspopup", "menu");
    ocPerm.tabIndex = 0;
    const ocOpenPerm = (e) => { EventHelper.stop(e, true); this.ocShowPermissionMenu(ocPerm); };
    this._register(addDisposableListener(ocPerm, EventType.CLICK, ocOpenPerm));
    this._register(addDisposableListener(ocPerm, EventType.KEY_DOWN, (e) => { if (e.key === "Enter" || e.key === " ") ocOpenPerm(e); }));
    this.ocRefreshPermissionUi();
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(OC_PERMISSION_MODE_SETTING) || e.affectsConfiguration(OC_MCP_PERMISSIONS_SETTING) || e.affectsConfiguration(OC_CATEGORY_PERMISSIONS_SETTING) || e.affectsConfiguration(OC_TOOL_PERMISSIONS_SETTING) || e.affectsConfiguration(OC_SANDBOX_SETTING)) this.ocRefreshPermissionUi();
    }));
    // OpenCode: 标题行右侧的当前对话工作区选择
    const ocChip = this.ocWorkspaceChip = append(sessionsTitleContainer, $("a.oc-session-workspace-chip"));
    ocChip.setAttribute("role", "button");
    ocChip.tabIndex = 0;
    // OpenCode: 工作区选择在按钮正下方弹出（不再使用顶部的 QuickPick 搜索框）
    ocChip.setAttribute("aria-haspopup", "menu");
    const ocPick = (e) => { EventHelper.stop(e, true); void this.ocShowWorkspaceMenu(ocChip); };
    this._register(addDisposableListener(ocChip, EventType.CLICK, ocPick));
    this._register(addDisposableListener(ocChip, EventType.KEY_DOWN, (e) => { if (e.key === "Enter" || e.key === " ") ocPick(e); }));
    const sessionsFilter = this._register(this.instantiationService.createInstance(AgentSessionsFilter, {
      filterMenuId: MenuId.AgentSessionsViewerFilterSubMenu,
      groupResults: () => this.sessionsViewerOrientation === 1 /* Stacked */ ? "capped" /* Capped */ : "date" /* Date */
    }));
    this._register(Event2.runAndSubscribe(sessionsFilter.onDidChange, () => {
      sessionsToolbarContainer.classList.toggle("filtered", !sessionsFilter.isDefault());
    }));
    const newSessionButtonContainer = this.sessionsNewButtonContainer = append(sessionsContainer, $(".agent-sessions-new-button-container"));
    const newSessionButton = this._register(new Button(newSessionButtonContainer, { ...defaultButtonStyles, secondary: true }));
    newSessionButton.label = localize(12701, null);
    const createNewChat = () => this.commandService.executeCommand(ACTION_ID_NEW_CHAT, this.getActionsContext());
    this._register(newSessionButton.onDidClick(createNewChat));
    this.sessionsControlContainer = append(sessionsContainer, $(".agent-sessions-control-container"));
    const sessionsControl = this.sessionsControl = this._register(this.instantiationService.createInstance(AgentSessionsControl, this.sessionsControlContainer, {
      source: "chatViewPane",
      filter: sessionsFilter,
      overrideStyles: this.getLocationBasedColors().listOverrideStyles,
      createNewChat,
      getHoverPosition: () => this.getSessionHoverPosition(),
      trackActiveEditorSession: () => {
        return !this._widget || this._widget.isEmpty();
      },
      overrideSessionOpenOptions: (openEvent) => {
        // OpenCode sessions-click-1717: 单击（非中键、非并排打开）= 进入该对话全页，列表隐藏，左上角「返回」
        const ocEnter = !openEvent.sideBySide && openEvent.browserEvent?.button !== 1 && !!openEvent.element?.resource;
        if (ocEnter) {
          this.ocFocusedSessionResource = openEvent.element.resource;
        }
        if ((this.sessionsViewerOrientation === 1 /* Stacked */ || ocEnter) && !openEvent.sideBySide) {
          return { ...openEvent, editorOptions: {
            ...openEvent.editorOptions,
            preserveFocus: false
            /* focus the chat widget when opening from stacked sessions viewer since this closes the stacked viewer */
          } };
        }
        return openEvent;
      }
    }));
    this._register(this.onDidChangeBodyVisibility((visible) => sessionsControl.setVisible(visible)));
    sessionsToolbar.context = sessionsControl;
    this._register(this.hostService.onDidChangeFocus((hasFocus) => {
      if (hasFocus) {
        sessionsControl.refresh();
      }
    }));
    this._register(Event2.runAndSubscribe(Event2.filter(this.configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration("chat.viewSessions.orientation" /* ChatViewSessionsOrientation */)), (e) => {
      const newSessionsViewerOrientationConfiguration = this.configurationService.getValue("chat.viewSessions.orientation" /* ChatViewSessionsOrientation */);
      this.doUpdateConfiguredSessionsViewerOrientation(newSessionsViewerOrientationConfiguration, { updateConfiguration: false, layout: !!e });
    }));
    return sessionsControl;
  }
  ocPermissionMode() {
    return normalizeOpenCodePermissionMode(this.configurationService.getValue(OC_PERMISSION_MODE_SETTING));
  }
  ocSandboxEnabled() {
    return isAgentSandboxEnabledValue(this.configurationService.getValue(OC_SANDBOX_SETTING));
  }
  async ocToggleSandbox() {
    if (!isWindows) return;
    await this.ocUpdatePermissionSetting(OC_SANDBOX_SETTING, this.ocSandboxEnabled() ? "off" : "on");
  }
  ocMcpPermissions() {
    const raw = this.configurationService.getValue(OC_MCP_PERMISSIONS_SETTING);
    const rules = raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    const clean = (map) => {
      const out = {};
      if (map && typeof map === "object" && !Array.isArray(map)) for (const [key, value2] of Object.entries(map)) if (ocNormalizePermission(value2)) out[key] = value2;
      return out;
    };
    return { servers: clean(rules.servers), tools: clean(rules.tools) };
  }
  ocRefreshPermissionUi() {
    const el = this.ocPermissionButton;
    if (!el) return;
    const mode = this.ocPermissionMode();
    const meta = OC_PERMISSION_MODES.find((m) => m.id === mode) ?? OC_PERMISSION_MODES[0];
    el.replaceChildren();
    append(el, $(`span.codicon.codicon-${meta.icon}`));
    append(el, $("span")).textContent = "\u6743\u9650";
    const sandboxOn = isWindows && this.ocSandboxEnabled();
    if (sandboxOn) append(el, $("span.codicon.codicon-shield.oc-perm-sandbox-badge"));
    append(el, $("span.codicon.codicon-chevron-down"));
    el.title = `\u5bf9\u8bdd\u5de5\u5177\u6743\u9650\uff1a${meta.label}\n${meta.detail}${Object.keys(this.ocCategoryPermissions()).length + Object.keys(this.ocToolPermissions()).length ? `\n\u5df2\u5355\u72ec\u8bbe\u7f6e ${Object.keys(this.ocCategoryPermissions()).length} \u4e2a\u7c7b\u522b\u3001${Object.keys(this.ocToolPermissions()).length} \u4e2a\u5de5\u5177` : ""}${sandboxOn ? "\n\u9694\u79bb\u6c99\u7bb1\uff1a\u5df2\u5f00\u542f\uff08AI \u8fd0\u884c\u7684\u7ec8\u7aef\u547d\u4ee4\u53ea\u80fd\u5199\u5165\u5de5\u4f5c\u533a\uff09" : ""}\n\u70b9\u51fb\u5207\u6362\u6a21\u5f0f\uff1b\u300c\u66f4\u591a\u300d\u91cc\u53ef\u6309\u7c7b\u522b\uff08\u7ec8\u7aef\u3001\u6539\u6587\u4ef6\u3001MCP \u7b49\uff09\u6216\u5355\u4e2a\u5de5\u5177\u8bbe\u4e3a\u5141\u8bb8 / \u8be2\u95ee / \u7981\u6b62`;
    el.setAttribute("aria-label", `\u6743\u9650\uff1a${meta.label}`);
    el.classList.toggle("oc-perm-auto", mode === "auto");
    el.classList.toggle("oc-perm-fullauto", mode === "fullAuto");
    el.classList.toggle("oc-perm-readonly", mode === "readonly");
  }
  async ocUpdatePermissionSetting(key, value2) {
    try {
      await this.configurationService.updateValue(key, value2);
    } catch (error2) {
      this.notificationService.error(`\u4fdd\u5b58\u6743\u9650\u8bbe\u7f6e\u5931\u8d25\uff1a${toErrorMessage(error2)}`);
    }
    this.ocRefreshPermissionUi();
  }
  ocSetMcpPermission(kind, key, decision) {
    const current = this.ocMcpPermissions();
    if (decision) current[kind][key] = decision;
    else delete current[kind][key];
    return this.ocUpdatePermissionSetting(OC_MCP_PERMISSIONS_SETTING, current);
  }
  ocMcpServers() {
    const servers = /* @__PURE__ */ new Map();
    let toolsService;
    try {
      toolsService = this.instantiationService.invokeFunction((accessor) => accessor.get(ILanguageModelToolsService));
    } catch {
    }
    try {
      for (const tool of toolsService ? toolsService.getAllToolsIncludingDisabled() : []) {
        if (tool?.source?.type !== "mcp") continue;
        const label = String(tool.source.serverLabel || tool.source.label || "").trim();
        if (!label) continue;
        if (!servers.has(label)) servers.set(label, []);
        servers.get(label).push(tool);
      }
    } catch {
    }
    for (const key of Object.keys(this.ocMcpPermissions().servers)) if (!servers.has(key)) servers.set(key, []);
    return [...servers].sort((a, b) => a[0].localeCompare(b[0]));
  }
  ocCategoryPermissions() {
    const raw = this.configurationService.getValue(OC_CATEGORY_PERMISSIONS_SETTING);
    const out = {};
    if (raw && typeof raw === "object" && !Array.isArray(raw)) for (const [key, value2] of Object.entries(raw)) if (!OC_PERMISSION_FREE_CATEGORY_IDS.has(key) && ocNormalizePermission(value2)) out[key] = value2;
    return out;
  }
  ocToolPermissions() {
    const raw = this.configurationService.getValue(OC_TOOL_PERMISSIONS_SETTING);
    const out = {};
    if (raw && typeof raw === "object" && !Array.isArray(raw)) for (const [key, value2] of Object.entries(raw)) if (!OC_PERMISSION_FREE_TOOLS.has(key) && ocNormalizePermission(value2)) out[key] = value2;
    return out;
  }
  ocSetMapPermission(setting, current, key, decision) {
    if (decision) current[key] = decision;
    else delete current[key];
    return this.ocUpdatePermissionSetting(setting, current);
  }
  // OpenCode: 对话工作区下拉菜单（参考 Cursor：最近项目、打开文件夹、在新窗口打开、在资源管理器中显示、复制路径、从最近移除）
  async ocShowWorkspaceMenu(anchor) {
    const resource = this._widget?.viewModel?.sessionResource ?? ocToResource();
    if (!resource) return;
    const { storage, contextService, workspacesService, fileDialog } = this.instantiationService.invokeFunction((accessor) => {
      let ws;
      try { ws = accessor.get(IWorkspacesService); } catch {}
      return { storage: accessor.get(IStorageService), contextService: accessor.get(IWorkspaceContextService), workspacesService: ws, fileDialog: accessor.get(IFileDialogService) };
    });
    const stored = ocGetSessionWorkspace(storage, resource);
    const current = stored ?? ocDefaultWorkspace(storage, contextService);
    const currentKey = current?.kind !== "home" ? current?.path?.toLowerCase() : void 0;
    const openFolders = new Set();
    const savedRecent = new Set(ocRecentWorkspaces(storage).map((r) => r.path.toLowerCase()));
    const entries = [];
    const seen = new Set();
    const push = (entry) => {
      if (!entry?.path) return;
      const k = entry.path.toLowerCase();
      if (seen.has(k)) return;
      seen.add(k);
      entries.push(entry);
    };
    for (const f of contextService.getWorkspace().folders) if (f.uri.scheme === "file") { openFolders.add(f.uri.fsPath.toLowerCase()); push({ kind: "folder", path: f.uri.fsPath, name: f.name }); }
    for (const r of ocRecentWorkspaces(storage)) push(r);
    try {
      const recent = await workspacesService?.getRecentlyOpened();
      for (const w of recent?.workspaces ?? []) {
        if (entries.length >= 12) break;
        const uri = w.folderUri;
        if (uri?.scheme === "file") push({ kind: "folder", path: uri.fsPath, name: ocWsBasename(uri.fsPath) });
      }
    } catch {}
    const apply = (entry) => {
      ocSetSessionWorkspace(storage, resource, entry);
      this.ocRefreshWorkspaceUi?.();
    };
    const info = (id, label) => toAction({ id, label, enabled: false, run: () => void 0 });
    const actions = [];
    actions.push(info("opencode.ws.current", current ? `当前：${ocWsLabel(current)}${current.path ? `（${current.path}）` : ""}${stored ? "" : "（默认）"}` : "当前对话未选择工作区"));
    if (entries.length) {
      actions.push(new Separator(), info("opencode.ws.recentHeader", "最近使用"));
      entries.slice(0, 12).forEach((entry, i) => {
        const k = entry.path.toLowerCase();
        const tags = [openFolders.has(k) ? "当前打开" : "", entry.path].filter(Boolean).join(" · ");
        actions.push(toAction({ id: `opencode.ws.pick.${i}`, label: `${entry.name || ocWsBasename(entry.path)}`, tooltip: tags, checked: k === currentKey, run: () => apply(entry) }));
      });
    }
    actions.push(new Separator());
    actions.push(toAction({ id: "opencode.ws.browse", label: "打开文件夹…", run: async () => {
      const uris = await fileDialog.showOpenDialog({ canSelectFolders: true, canSelectFiles: false, canSelectMany: false, title: "选择对话工作区", openLabel: "选择" });
      const uri = uris?.[0];
      if (uri) apply({ kind: "folder", path: uri.fsPath, name: ocWsBasename(uri.fsPath) });
    } }));
    actions.push(toAction({ id: "opencode.ws.home", label: "无工作区 / 用户目录", checked: current?.kind === "home", run: () => apply({ kind: "home", path: "", name: "用户目录" }) }));
    if (current?.path) {
      const uri = URI.file(current.path);
      const more = [
        toAction({ id: "opencode.ws.reveal", label: isWindows ? "在文件资源管理器中显示" : "在系统文件管理器中显示", run: () => this.commandService.executeCommand("revealFileInOS", uri) }),
        toAction({ id: "opencode.ws.copyPath", label: "复制路径", run: () => anchor.ownerDocument?.defaultView?.navigator?.clipboard?.writeText(current.path) }),
        toAction({ id: "opencode.ws.openWindow", label: "在新窗口中打开此文件夹", run: () => this.commandService.executeCommand("vscode.openFolder", uri, { forceNewWindow: true }) }),
        toAction({ id: "opencode.ws.openHere", label: "在当前窗口中打开此文件夹", enabled: !openFolders.has(current.path.toLowerCase()), run: () => this.commandService.executeCommand("vscode.openFolder", uri, { forceNewWindow: false }) })
      ];
      actions.push(new Separator(), new SubmenuAction("opencode.ws.more", "当前工作区", more));
    }
    const removable = entries.filter((e) => savedRecent.has(e.path.toLowerCase()) && e.path.toLowerCase() !== currentKey);
    if (removable.length) {
      actions.push(new SubmenuAction("opencode.ws.remove", "从最近使用中移除", removable.map((entry, i) => toAction({ id: `opencode.ws.remove.${i}`, label: entry.name || ocWsBasename(entry.path), tooltip: entry.path, run: () => {
        const left = ocRecentWorkspaces(storage).filter((r) => r.path.toLowerCase() !== entry.path.toLowerCase());
        storage.store(OC_RECENT_WS_KEY, JSON.stringify(left), -1 /* APPLICATION */, 1 /* MACHINE */);
      } }))));
    }
    let viewportWatcher;
    this.contextMenuService.showContextMenu({
      getAnchor: () => anchor,
      getActions: () => actions,
      getMenuClassName: () => "oc-permission-menu",
      onHide: () => {
        viewportWatcher?.disconnect();
        viewportWatcher = void 0;
        anchor.focus?.();
      }
    });
    try {
      viewportWatcher = ocWatchMenuViewport(anchor.ownerDocument, "oc-permission-menu");
    } catch {}
  }
  ocShowPermissionMenu(anchor) {
    const mode = this.ocPermissionMode();
    const modeMeta = OC_PERMISSION_MODES.find((m) => m.id === mode) ?? OC_PERMISSION_MODES[0];
    const perms = this.ocMcpPermissions();
    const categoryRules = this.ocCategoryPermissions();
    const toolRules = this.ocToolPermissions();
    const decisionItems = (idPrefix, current, inheritLabel, apply) => [
      ...["allow", "ask", "deny"].map((decision) => toAction({ id: `${idPrefix}.${decision}`, label: OC_PERMISSION_DECISION_LABEL[decision], checked: current === decision, run: () => apply(decision) })),
      toAction({ id: `${idPrefix}.inherit`, label: inheritLabel, checked: !current, run: () => apply(void 0) })
    ];
    const info = (id, label) => toAction({ id, label, enabled: false, run: () => void 0 });
    const defaultLabel = (decision) => decision === "own" ? "\u6309\u5de5\u5177\u5b9a\u4e49\u7684 confirm" : OC_PERMISSION_DECISION_LABEL[decision] ?? "";
    const categoryEffective = (category) => {
      const rule = categoryRules[category.id];
      if (rule) return OC_PERMISSION_DECISION_LABEL[rule];
      if (category.follow) return categoryEffective(OC_PERMISSION_CATEGORIES.find((c) => c.id === category.follow));
      return defaultLabel(category.defaults?.[mode]);
    };
    const actions = OC_PERMISSION_MODES.map((m) => toAction({ id: `opencode.permission.mode.${m.id}`, label: m.label, tooltip: m.detail, checked: m.id === mode, run: () => this.ocUpdatePermissionSetting(OC_PERMISSION_MODE_SETTING, m.id) }));
    // MCP：按服务器 / 按工具（mcpPermissions），工具 > 服务器 > MCP 类别 > 模式
    const mcpCategoryLabel = categoryEffective(OC_PERMISSION_CATEGORIES.find((c) => c.id === "mcp"));
    const servers = this.ocMcpServers();
    const serverItems = servers.length ? servers.map(([label, tools]) => {
      const serverRule = perms.servers[label];
      const children = decisionItems(`opencode.permission.mcp.server.${label}`, serverRule, `\u8ddf\u968f\u300cMCP \u5de5\u5177\u300d\uff08${mcpCategoryLabel}\uff09`, (decision) => this.ocSetMcpPermission("servers", label, decision));
      const toolItems = tools.slice().sort((a, b) => String(a.displayName || a.id).localeCompare(String(b.displayName || b.id))).map((tool) => {
        const toolRule = perms.tools[tool.id];
        const name = String(tool.displayName || tool.toolReferenceName || tool.id);
        return new SubmenuAction(`opencode.permission.mcp.tool.${tool.id}`, toolRule ? `${name}\uff08${OC_PERMISSION_DECISION_LABEL[toolRule]}\uff09` : name, decisionItems(`opencode.permission.mcp.tool.${tool.id}`, toolRule, "\u8ddf\u968f\u670d\u52a1\u5668", (decision) => this.ocSetMcpPermission("tools", tool.id, decision)));
      });
      if (toolItems.length) children.push(new Separator(), ...toolItems);
      return new SubmenuAction(`opencode.permission.mcp.server.${label}`, `${label}\uff08${serverRule ? OC_PERMISSION_DECISION_LABEL[serverRule] : "\u8ddf\u968f"}\uff09`, children);
    }) : [];
    const categoryItems = OC_PERMISSION_CATEGORIES.map((category) => {
      const rule = categoryRules[category.id];
      const setCategory = (decision) => this.ocSetMapPermission(OC_CATEGORY_PERMISSIONS_SETTING, this.ocCategoryPermissions(), category.id, decision);
      const followTarget = category.follow ? OC_PERMISSION_CATEGORIES.find((c) => c.id === category.follow) : void 0;
      const inheritLabel = followTarget ? `\u8ddf\u968f\u300c${followTarget.label}\u300d\uff08${categoryEffective(followTarget)}\uff09` : `\u8ddf\u968f\u6a21\u5f0f\uff08${modeMeta.label}\uff1a${defaultLabel(category.defaults?.[mode])}\uff09`;
      const children = [];
      const toolNames = category.tools ? category.tools.slice() : category.prefix ? Object.keys(toolRules).filter((name) => name.startsWith(category.prefix)).sort() : [];
      children.push(...decisionItems(`opencode.permission.cat.${category.id}`, rule, inheritLabel, setCategory));
      if (category.mcp) {
        if (serverItems.length) children.push(new Separator(), ...serverItems);
      }
      else if (toolNames.length) {
        children.push(new Separator(), ...toolNames.map((name) => {
          const toolRule = toolRules[name];
          return new SubmenuAction(`opencode.permission.tool.${name}`, toolRule ? `${name}\uff08${OC_PERMISSION_DECISION_LABEL[toolRule]}\uff09` : name, decisionItems(`opencode.permission.tool.${name}`, toolRule, `\u8ddf\u968f\u7c7b\u522b\uff08${categoryEffective(category)}\uff09`, (decision) => this.ocSetMapPermission(OC_TOOL_PERMISSIONS_SETTING, this.ocToolPermissions(), name, decision)));
        }));
      }
      return new SubmenuAction(`opencode.permission.cat.${category.id}`, `${category.label}\uff08${rule ? OC_PERMISSION_DECISION_LABEL[rule] : "\u8ddf\u968f"}\uff09`, children);
    });
    const hasOverrides = Object.keys(categoryRules).length || Object.keys(toolRules).length;
    if (hasOverrides) categoryItems.push(new Separator(), toAction({ id: "opencode.permission.more.reset", label: "\u5168\u90e8\u7c7b\u522b\u4e0e\u5355\u4e2a\u5de5\u5177\u6062\u590d\u8ddf\u968f\uff08\u4e0d\u542b MCP\uff09", run: async () => {
      await this.ocUpdatePermissionSetting(OC_CATEGORY_PERMISSIONS_SETTING, {});
      await this.ocUpdatePermissionSetting(OC_TOOL_PERMISSIONS_SETTING, {});
    } }));
    const sandboxOn = isWindows && this.ocSandboxEnabled();
    actions.push(new Separator(), toAction({
      id: "opencode.permission.sandbox",
      label: isWindows ? OC_SANDBOX_LABEL : `${OC_SANDBOX_LABEL}\uff08\u4ec5 Windows\uff09`,
      tooltip: isWindows ? (sandboxOn ? "\u5df2\u5f00\u542f\uff1aAI \u8fd0\u884c\u7684\u7ec8\u7aef\u547d\u4ee4\u4ee5\u4f4e\u5b8c\u6574\u6027\u8fd0\u884c\uff0c\u53ea\u80fd\u5199\u5165\u5de5\u4f5c\u533a\uff1b\u70b9\u51fb\u5173\u95ed" : "\u70b9\u51fb\u5f00\u542f\uff1aAI \u8fd0\u884c\u7684\u7ec8\u7aef\u547d\u4ee4\u53ea\u80fd\u5199\u5165\u5de5\u4f5c\u533a\uff08\u4e0d\u9650\u5236\u8bfb\u53d6\u4e0e\u7f51\u7edc\uff09") : "\u5f53\u524d\u5e73\u53f0\u6ca1\u6709\u53ef\u7528\u7684\u7ec8\u7aef\u6c99\u7bb1",
      checked: sandboxOn,
      enabled: isWindows,
      run: () => this.ocToggleSandbox()
    }), new Separator(), new SubmenuAction("opencode.permission.more", "\u66f4\u591a", categoryItems));
    let viewportWatcher;
    this.contextMenuService.showContextMenu({
      getAnchor: () => anchor,
      getActions: () => actions,
      getMenuClassName: () => "oc-permission-menu",
      onHide: () => {
        viewportWatcher?.disconnect();
        viewportWatcher = void 0;
        anchor.focus?.();
      }
    });
    try {
      viewportWatcher = ocWatchMenuViewport(anchor.ownerDocument, "oc-permission-menu");
    } catch {
    }
    try {
      ocDecorateSandboxMenuItem(anchor.ownerDocument, sandboxOn);
      anchor.ownerDocument?.defaultView?.requestAnimationFrame(() => ocDecorateSandboxMenuItem(anchor.ownerDocument, sandboxOn));
    } catch {
    }
  }
  ocIsChatOpen() {
    const w = this._widget;
    if (!w) return false;
    return !(w.isEmpty() && !!w.viewModel && !w.viewModel.model.title);
  }
  ocApplySessionsMode(chatOpen) {
    const c = this.viewPaneContainer;
    // OpenCode: 窄面板（上下排列）打开对话时不显示对话列表，只留左上角「返回」；空间够时（左右排列）不走这里
    if (c) {
      c.classList.toggle("oc-sessions-compact", chatOpen);
      c.classList.toggle("oc-sessions-collapsed", chatOpen);
    }
    if (this.ocSessionsChevron) {
      this.ocSessionsChevron.className = chatOpen ? "oc-sessions-chevron codicon codicon-arrow-left" : "oc-sessions-chevron";
      if (!this.ocBackLabel && this.sessionsTitle) {
        this.ocBackLabel = append(this.sessionsTitle, $("span.oc-sessions-back-label"));
        this.ocBackLabel.textContent = "\u5bf9\u8bdd\u5217\u8868";
        this.ocBackLabel.style.marginLeft = "4px";
      }
      if (this.ocBackLabel) this.ocBackLabel.style.display = chatOpen ? "" : "none";
    }
    if (this.sessionsTitle) this.sessionsTitle.title = chatOpen ? "\u8fd4\u56de\u5bf9\u8bdd\u5217\u8868" : "\u5bf9\u8bdd\u5217\u8868";
    if (this.sessionsTitle) this.sessionsTitle.style.cursor = chatOpen ? "pointer" : "";
    if (this.sessionsControlContainer) {
      this.sessionsControlContainer.style.display = chatOpen ? "none" : "";
    }
  }
  ocToggleSessionsCollapsed() {
    this.ocSessionsCollapsed = !this.ocSessionsCollapsed;
    this.storageService.store(OC_SESSIONS_COLLAPSED_KEY, this.ocSessionsCollapsed, -1 /* APPLICATION */, 1 /* MACHINE */);
    this.relayout();
  }
  ocRefreshWorkspaceUi() {
    const chip = this.ocWorkspaceChip;
    if (chip) {
      const res = this._widget?.viewModel?.sessionResource;
      const stored = res ? ocGetSessionWorkspace(this.storageService, res) : void 0;
      const entry = stored ?? ocDefaultWorkspace(this.storageService, this.workspaceContextService);
      const label = entry ? ocWsLabel(entry) : "\u7528\u6237\u76ee\u5f55";
      chip.replaceChildren();
      append(chip, $("span.codicon.codicon-folder"));
      append(chip, $("span.oc-ws-chip-label")).textContent = label + (stored ? "" : "\uff08\u9ed8\u8ba4\uff09");
      append(chip, $("span.codicon.codicon-chevron-down"));
      chip.title = `\u5f53\u524d\u5bf9\u8bdd\u7684\u5de5\u4f5c\u533a\uff1a${entry?.path || "\u7528\u6237\u76ee\u5f55"}\n\u70b9\u51fb\u5207\u6362\uff1a\u6700\u8fd1\u4f7f\u7528 / \u9009\u62e9\u6587\u4ef6\u5939\u2026 / \u65e0\u5de5\u4f5c\u533a`;
    }
    try { this.sessionsControl?.refresh(); } catch {}
  }
  getSessionsViewerOrientation() {
    return this.sessionsViewerOrientation;
  }
  updateConfiguredSessionsViewerOrientation(orientation) {
    return this.doUpdateConfiguredSessionsViewerOrientation(orientation, { updateConfiguration: true, layout: true });
  }
  doUpdateConfiguredSessionsViewerOrientation(orientation, options3) {
    const oldSessionsViewerOrientationConfiguration = this.sessionsViewerOrientationConfiguration;
    let validatedOrientation;
    if (orientation === "stacked" || orientation === "sideBySide") {
      validatedOrientation = orientation;
    } else {
      validatedOrientation = "sideBySide";
    }
    this.sessionsViewerOrientationConfiguration = validatedOrientation;
    if (oldSessionsViewerOrientationConfiguration === this.sessionsViewerOrientationConfiguration) {
      return;
    }
    if (options3.updateConfiguration) {
      this.configurationService.updateValue("chat.viewSessions.orientation" /* ChatViewSessionsOrientation */, validatedOrientation);
    }
    if (options3.layout) {
      this.relayout();
    }
  }
  updateSessionsControlVisibility() {
    if (!this.sessionsContainer || !this.viewPaneContainer) {
      return { changed: false, visible: false };
    }
    let newSessionsContainerVisible;
    if (this.bridgeMode) {
      newSessionsContainerVisible = false;
    } else if (!this.configurationService.getValue("chat.viewSessions.enabled" /* ChatViewSessionsEnabled */)) {
      newSessionsContainerVisible = false;
    } else {
      if (this.sessionsViewerOrientation === 1 /* Stacked */) {
        // OpenCode: 窄面板（上下排列）下对话列表常驻：空对话时作为主页铺满，打开对话时收为顶部可折叠区域
        newSessionsContainerVisible = this._sessionsListSuppressionCount === 0 && !this.welcomeController?.isShowingWelcome.get() && !this.ocIsChatOpen(); // OpenCode: 窄面板打开对话时整块隐藏，只用左上角 ← 返回
      } else {
        newSessionsContainerVisible = !this.welcomeController?.isShowingWelcome.get() && // welcome not showing
        !!this.lastDimensions && this.lastDimensions.width >= ChatViewPane.SESSIONS_SIDEBAR_VIEW_MIN_WIDTH && !this.ocSessionFocusActive(); // OpenCode sessions-click-1717: 单击进入对话后列表隐藏
      }
    }
    this.viewPaneContainer.classList.toggle("has-sessions-control", newSessionsContainerVisible);
    this.ocUpdateSessionBackBar();
    const sessionsContainerVisible = this.sessionsContainer.style.display !== "none";
    setVisibility(newSessionsContainerVisible, this.sessionsContainer);
    this.sessionsViewerVisible = newSessionsContainerVisible;
    this.sessionsViewerVisibilityContext.set(newSessionsContainerVisible);
    return {
      changed: sessionsContainerVisible !== newSessionsContainerVisible,
      visible: newSessionsContainerVisible
    };
  }
  refreshSessionsControlVisibility() {
    const { changed } = this.updateSessionsControlVisibility();
    if (changed) {
      this.relayout();
    }
  }
  /**
   * Suppresses the sessions list until the returned disposable is disposed.
   * Used to span a whole session transition (e.g. a "Continue in…" migration:
   * load → materializing send → rebind) so the transiently-empty widget never
   * falls back to the list.
   */
  beginSessionsListSuppression() {
    this._sessionsListSuppressionCount++;
    this.refreshSessionsControlVisibility();
    return toDisposable(() => {
      this._sessionsListSuppressionCount--;
      this.refreshSessionsControlVisibility();
    });
  }
  getFocusedSessions() {
    return this.sessionsControl?.getFocus() ?? [];
  }
  static {
    //#endregion
    //#region Chat Control
    this.MIN_CHAT_WIDGET_HEIGHT = 116;
  }
  get widget() {
    return this._widget;
  }
  createChatControl(parent, taskShelfParent) {
    const chatControlsContainer = append(parent, $(".chat-controls-container"));
    const locationBasedColors = this.getLocationBasedColors();
    const editorOverflowWidgetsDomNode = this.layoutService.getContainer(getWindow(chatControlsContainer)).appendChild($(".chat-editor-overflow.monaco-editor"));
    this._register(toDisposable(() => editorOverflowWidgetsDomNode.remove()));
    this.ocCreateSessionBackBar(chatControlsContainer);
    this.createChatTitleControl(chatControlsContainer);
    const scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this.scopedContextKeyService])));
    this._widget = this._register(scopedInstantiationService.createInstance(
      ChatWidget,
      "panel" /* Chat */,
      { viewId: this.id },
      {
        autoScroll: (mode) => mode !== "ask" /* Ask */,
        renderFollowups: true,
        supportsFileReferences: true,
        clear: () => this.clear(),
        enableFind: true,
        rendererOptions: {
          renderTextEditsAsSummary: (uri5) => {
            return true;
          },
          referencesExpandedWhenEmptyResponse: false,
          progressMessageAtBottomOfResponse: (mode) => mode !== "ask" /* Ask */
        },
        editorOverflowWidgetsDomNode,
        enableImplicitContext: true,
        enableWorkingSet: "explicit",
        supportsChangingModes: true,
        dndContainer: parent
      },
      {
        listForeground: SIDE_BAR_FOREGROUND,
        listBackground: locationBasedColors.background,
        listShadow: locationBasedColors.listOverrideStyles.treeStickyScrollShadow,
        overlayBackground: locationBasedColors.overlayBackground,
        inputEditorBackground: locationBasedColors.background,
        resultEditorBackground: editorBackground
      }
    ));
    this._widget.render(chatControlsContainer, parent);
    this.bridgeSessionView = this._register(this.instantiationService.createInstance(
      OpenCodeBridgeSessionView,
      chatControlsContainer,
      taskShelfParent,
      () => this.relayout()
    ));
    this.bridgeSessionView.setVisible(this.isBodyVisible(), this.bridgeMode);
    // Native Chat questions show only in the conversation that raised them (task shelf filter).
    this.bridgeSessionView.currentChatRequestIds = () => {
      const ids = /* @__PURE__ */ new Set();
      for (const item of this._widget?.viewModel?.getItems() ?? []) {
        if (typeof item?.id === "string") ids.add(item.id);
        if (typeof item?.requestId === "string") ids.add(item.requestId);
      }
      return ids;
    };
    this._register(this._widget.onDidChangeViewModel(() => void this.bridgeSessionView?.refresh(true)));
    const updateWidgetVisibility = (reader) => this._widget.setVisible(!this.bridgeMode && this.isBodyVisible() && !this.welcomeController?.isShowingWelcome.read(reader));
    this._register(this.onDidChangeBodyVisibility(() => {
      updateWidgetVisibility();
      this.bridgeSessionView?.setVisible(this.isBodyVisible(), this.bridgeMode);
    }));
    this._register(autorun((reader) => updateWidgetVisibility(reader)));
    this.schedulePersistentBridgeStartup(chatControlsContainer);
    return this._widget;
  }
  ocCreateSessionBackBar(parent) {
    // OpenCode sessions-click-1717: 对话全页模式下左上角的「返回」按钮（回到列表页 = 新的空对话 + 会话列表）
    const bar = this.ocBackBar = append(parent, $(".oc-session-back-bar"));
    bar.style.display = "none";
    const back = append(bar, $("a.oc-session-back"));
    back.setAttribute("role", "button");
    back.tabIndex = 0;
    back.title = "\u8fd4\u56de\u4f1a\u8bdd\u5217\u8868";
    back.setAttribute("aria-label", "\u8fd4\u56de\u4f1a\u8bdd\u5217\u8868");
    append(back, $("span.codicon.codicon-arrow-left"));
    append(back, $("span.oc-session-back-label")).textContent = "\u8fd4\u56de";
    const goBack = (e) => {
      EventHelper.stop(e, true);
      this.ocFocusedSessionResource = void 0;
      void this.clear().then(() => {
        this.refreshSessionsControlVisibility();
        this.focusSessions();
      });
    };
    this._register(addDisposableListener(back, EventType.CLICK, goBack));
    this._register(addDisposableListener(back, EventType.KEY_DOWN, (e) => { if (e.key === "Enter" || e.key === " ") goBack(e); }));
  }
  ocSessionFocusActive() {
    const r = this.ocFocusedSessionResource;
    if (!r || this.bridgeMode) return false;
    const cur = this._widget?.viewModel?.sessionResource;
    return !!cur && isEqual2(cur, r);
  }
  ocUpdateSessionBackBar() {
    const bar = this.ocBackBar;
    if (!bar) return;
    const show = this.sessionsViewerOrientation === 2 /* SideBySide */ && this.ocSessionFocusActive();
    bar.style.display = show ? "" : "none";
  }
  createChatTitleControl(parent) {
    this.titleControl = this._register(this.instantiationService.createInstance(
      ChatViewTitleControl,
      parent,
      {
        focusChat: () => this._widget.focusInput()
      },
      void 0
    ));
    this._register(this.titleControl.onDidChangeHeight(() => {
      this.relayout();
    }));
  }
  //#endregion
  registerControlsListeners(sessionsControl, chatWidget, welcomeController) {
    const hasByokModelsContextKeys = /* @__PURE__ */ new Set([ChatEntitlementContextKeys.hasByokModels.key]);
    this._register(Event2.any(
      chatWidget.onDidChangeEmptyState,
      Event2.fromObservable(welcomeController.isShowingWelcome),
      Event2.filter(this.configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration("chat.viewSessions.enabled" /* ChatViewSessionsEnabled */)),
      Event2.filter(this.contextKeyService.onDidChangeContext, (e) => e.affectsSome(hasByokModelsContextKeys))
    )(() => {
      if (this.sessionsViewerOrientation === 1 /* Stacked */) {
        sessionsControl.clearFocus();
      }
      const { changed: visibilityChanged } = this.updateSessionsControlVisibility();
      if (visibilityChanged || this.sessionsViewerOrientation === 1 /* Stacked */) {
        this.relayout();
      }
    }));
    this._register(chatWidget.onDidChangeViewModel(() => {
      const model = chatWidget.viewModel?.model;
      this.titleControl?.update(model);
      // OpenCode sessions-click-1717: 切到别的对话（新建等）时退出全页模式；进入/退出时刷新列表显隐
      {
        const ocCur = chatWidget.viewModel?.sessionResource;
        if (this.ocFocusedSessionResource && ocCur && !isEqual2(ocCur, this.ocFocusedSessionResource)) {
          this.ocFocusedSessionResource = void 0;
        }
        this.refreshSessionsControlVisibility();
      }
      this._currentSessionResource.set(chatWidget.viewModel?.sessionResource, void 0);
      if (this.sessionsViewerOrientation === 1 /* Stacked */) {
        return;
      }
      const sessionResource = chatWidget.viewModel?.sessionResource;
      if (sessionResource) {
        const revealed = sessionsControl.reveal(sessionResource);
        if (!revealed) {
          sessionsControl.clearFocus();
        }
      }
    }));
    this._register(this.agentSessionsService.model.onDidChangeSessions(() => {
      if (this.sessionsViewerOrientation === 1 /* Stacked */) {
        return;
      }
      if (sessionsControl.hasFocusOrSelection()) {
        return;
      }
      const sessionResource = chatWidget.viewModel?.sessionResource;
      if (sessionResource) {
        sessionsControl.reveal(sessionResource);
      }
    }));
    this._register(this.agentSessionsService.model.onDidChangeSessionArchivedState((e) => {
      if (e.isArchived()) {
        const currentSessionResource = chatWidget.viewModel?.sessionResource;
        if (currentSessionResource && isEqual2(currentSessionResource, e.resource)) {
          this.clear();
        }
      }
    }));
    this._register(autorun((reader) => {
      chatWidget.inputPart.height.read(reader);
      if (this.sessionsViewerVisible && this.sessionsViewerOrientation === 1 /* Stacked */) {
        this.relayoutForInputHeight();
      }
    }));
    const progressBadgeDisposables = this._register(new MutableDisposable());
    const updateProgressBadge = () => {
      progressBadgeDisposables.value = new DisposableStore();
      if (!this.configurationService.getValue("chat.viewProgressBadge.enabled" /* ChatViewProgressBadgeEnabled */)) {
        this.activityBadge.clear();
        return;
      }
      const model = chatWidget.viewModel?.model;
      if (model) {
        progressBadgeDisposables.value.add(autorun((reader) => {
          if (model.requestInProgress.read(reader)) {
            this.activityBadge.value = this.activityService.showViewActivity(this.id, {
              badge: new ProgressBadge(() => localize(12702, null))
            });
          } else {
            this.activityBadge.clear();
          }
        }));
      } else {
        this.activityBadge.clear();
      }
    };
    this._register(chatWidget.onDidChangeViewModel(() => updateProgressBadge()));
    this._register(Event2.filter(this.configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration("chat.viewProgressBadge.enabled" /* ChatViewProgressBadgeEnabled */))(() => updateProgressBadge()));
    updateProgressBadge();
  }
  setupContextMenu(parent) {
    this._register(addDisposableListener(parent, EventType.CONTEXT_MENU, (e) => {
      EventHelper.stop(e, true);
      this.contextMenuService.showContextMenu({
        menuId: MenuId.ChatWelcomeContext,
        contextKeyService: this.contextKeyService,
        getAnchor: () => new StandardMouseEvent(getWindow(parent), e)
      });
    }));
  }
  //#region Model Management
  applyModel() {
    this._applyModelCts.value?.cancel();
    const cts = this._applyModelCts.value = new CancellationTokenSource();
    this.restoringSession = this._applyModel(cts.token).catch((err) => {
      if (!isCancellationError(err)) {
        this.logService.error("ChatViewPane#applyModel failed", err);
      }
    });
    this.restoringSession.finally(() => this.restoringSession = void 0);
  }
  async _applyModel(token) {
    const session = await this.acquireTransferredOrPersistedSession(token, "ChatViewPane#applyModel");
    await this.showModel(token, session.modelRef, true, !session.modelRef, void 0, session.localFallbackSelectionReason);
  }
  /**
   * Force-start a new local chat session in the view, bypassing the
   * default-provider override applied by `showModel()`. Used by the
   * picker when the user explicitly selects "Local", and by New Local Chat.
   */
  async startNewLocalSession(sessionTypeSelectionReason = "explicitOverride") {
    this._applyModelCts.value?.cancel();
    const ref = this.chatService.startNewLocalSession("panel" /* Chat */, { debugOwner: "ChatViewPane#startNewLocalSession", sessionTypeSelectionReason });
    return this.showModel(CancellationToken.None, ref);
  }
  /**
   * When the remembered or computed default session type is a non-local
   * provider (for example when the agent host is enabled), return a new session
   * reference for it instead of the built-in local provider.
   */
  async acquireDefaultNewSession(token, localFallbackSelectionReason) {
    const workspace = this.workspaceContextService.getWorkspace();
    const defaultTypeAndReason = getDefaultNewChatSessionTypeAndReasonFromServices(this.configurationService, this.chatSessionsService, this.storageService, workspace, this.agentHostEnablementService.enabled.get(), void 0, this.agentHostEnablementService.managedSandboxEnforced.get());
    if (defaultTypeAndReason.sessionType === localChatSessionType) {
      return { modelRef: this.chatService.startNewLocalSession("panel" /* Chat */, { debugOwner: "ChatViewPane#acquireDefaultNewSession", sessionTypeSelectionReason: localFallbackSelectionReason ?? defaultTypeAndReason.selectionReason }) };
    }
    const resource = getNewChatSessionResource(defaultTypeAndReason.sessionType);
    try {
      const modelRef = await this.chatService.acquireOrLoadSession(resource, "panel" /* Chat */, token, "ChatViewPane#acquireDefaultNewSession", defaultTypeAndReason.selectionReason);
      return {
        modelRef,
        localFallbackSelectionReason: getLocalFallbackSessionTypeSelectionReason(defaultTypeAndReason.sessionType, !!modelRef, localFallbackSelectionReason)
      };
    } catch (error) {
      if (isCancellationError(error)) {
        throw error;
      }
      this.logService.warn(`[ChatViewPane] Failed to acquire default agent-host session, falling back to local`, error);
      return {
        modelRef: void 0,
        localFallbackSelectionReason: getLocalFallbackSessionTypeSelectionReason(defaultTypeAndReason.sessionType, false, localFallbackSelectionReason)
      };
    }
  }
  async acquireTransferredOrPersistedSession(token, debugOwner) {
    const sessionResource = this.getTransferredOrPersistedSessionInfo();
    if (!sessionResource) {
      return { modelRef: void 0 };
    }
    const modelRef = await this.chatService.acquireOrLoadSession(sessionResource, "panel" /* Chat */, token, debugOwner);
    if (!modelRef) {
      return {
        modelRef: void 0,
        localFallbackSelectionReason: getLocalFallbackSessionTypeSelectionReason(getChatSessionType(sessionResource), false)
      };
    }
    if (this.shouldSkipRestoredLocalSession(sessionResource, modelRef.object)) {
      modelRef.dispose();
      return { modelRef: void 0 };
    }
    return { modelRef };
  }
  shouldSkipRestoredLocalSession(sessionResource, model) {
    const workspace = this.workspaceContextService.getWorkspace();
    const defaultType = getDefaultNewChatSessionType(this.configurationService, this.chatSessionsService, this.storageService, workspace, this.agentHostEnablementService.enabled.get(), void 0, this.agentHostEnablementService.managedSandboxEnforced.get());
    return defaultType !== localChatSessionType && getChatSessionType(sessionResource) === localChatSessionType && !model.hasRequests;
  }
  async showModel(token, modelRef, startNewSession = true, ignoreTransferredSession = false, inputBeforeLoad, localFallbackSelectionReason) {
    const oldModelResource = this._widget.viewModel?.sessionResource;
    if (oldModelResource) {
      this.widgetViewStates.set(getComparisonKey(oldModelResource), this._widget.getViewState());
    }
    this.modelRef.value = void 0;
    const baselineInput = inputBeforeLoad ?? this._widget?.getInput() ?? "";
    let ref;
    if (startNewSession) {
      if (modelRef) {
        ref = modelRef;
      } else if (!ignoreTransferredSession && this.chatService.transferredSessionResource) {
        ref = await this.chatService.acquireOrLoadSession(this.chatService.transferredSessionResource, "panel" /* Chat */, token, "ChatViewPane#showModel");
      } else {
        const defaultSession = await this.acquireDefaultNewSession(token, localFallbackSelectionReason);
        ref = defaultSession.modelRef ?? this.chatService.startNewLocalSession("panel" /* Chat */, { debugOwner: "ChatViewPane#showModel", sessionTypeSelectionReason: defaultSession.localFallbackSelectionReason });
      }
      if (!ref) {
        throw new Error("Could not start chat session");
      }
    }
    if (token.isCancellationRequested) {
      ref?.dispose();
      return void 0;
    }
    this.modelRef.value = ref;
    const model = ref?.object;
    if (model) {
      await this.updateWidgetLockState(getChatSessionType(model.sessionResource));
      if (token.isCancellationRequested) {
        this.modelRef.value = void 0;
        return void 0;
      }
      this.viewState.sessionResource = model.sessionResource;
    }
    if (model) {
      setModelPreservingInputTypedWhileLoading(this._widget, baselineInput, () => this._widget.setModel(model));
      const widgetViewState = this.widgetViewStates.get(getComparisonKey(model.sessionResource));
      if (widgetViewState) {
        this._widget.restoreViewState(widgetViewState);
      }
    } else {
      this._widget.setModel(model);
    }
    this.titleControl?.update(model);
    this.updateActions();
    if (oldModelResource) {
      const capturedOldResource = oldModelResource;
      this._register(disposableTimeout(() => {
        const oldSession = this.agentSessionsService.model.getSession(capturedOldResource);
        if (oldSession && !oldSession.isMarkedUnread()) {
          oldSession.setRead(true);
        }
      }, 0));
    }
    return model;
  }
  async updateWidgetLockState(sessionType) {
    if (sessionType === localChatSessionType) {
      this._widget.unlockFromCodingAgent();
      return;
    }
    let canResolve = false;
    try {
      canResolve = await this.chatSessionsService.canResolveChatSession(sessionType);
    } catch (error) {
      this.logService.warn(`Failed to resolve chat session type '${sessionType}' for locking`, error);
    }
    if (!canResolve) {
      this._widget.unlockFromCodingAgent();
      return;
    }
    const contribution = this.chatSessionsService.getChatSessionContribution(sessionType);
    if (contribution) {
      this._widget.lockToCodingAgent(contribution.name, contribution.displayName, sessionType, contribution.agentHostProviderId);
    } else {
      this._widget.unlockFromCodingAgent();
    }
  }
  async clear() {
    this.loadSessionCts.value?.cancel();
    this.updateViewState();
    await this.showModel(CancellationToken.None);
    this.updateActions();
  }
  async loadSession(sessionResource, sessionTypeSelectionReason) {
    const t0 = Date.now();
    this.logService.trace(`[ChatViewPane] loadSession start uri=${sessionResource.toString()}`);
    const inputBeforeLoad = this._widget?.getInput() ?? "";
    this.loadSessionCts.value?.cancel();
    const cts = this.loadSessionCts.value = new CancellationTokenSource();
    const token = cts.token;
    if (this.restoringSession) {
      await this.restoringSession;
    }
    if (token.isCancellationRequested) {
      this.logService.trace(`[ChatViewPane] loadSession done total=${Date.now() - t0}ms uri=${sessionResource.toString()} cancelled=true phase=preAcquire`);
      return void 0;
    }
    return this.progressService.withProgress({ location: ChatViewId, delay: 200 }, async () => {
      let queue = Promise.resolve();
      let didAcquireSession = false;
      const clearWidget = disposableTimeout(() => {
        if (token.isCancellationRequested || this.loadSessionCts.value !== cts) {
          return;
        }
        queue = this.showModel(token, void 0, false).then(() => {
        });
      }, 100);
      const clearWidgetCancellationListener = token.onCancellationRequested(() => clearWidget.dispose());
      try {
        const newModelRef = await this.chatService.acquireOrLoadSession(sessionResource, "panel" /* Chat */, token, "ChatViewPane#loadSession", sessionTypeSelectionReason);
        didAcquireSession = !!newModelRef;
        clearWidget.dispose();
        await queue;
        if (token.isCancellationRequested) {
          newModelRef?.dispose();
          this.logService.trace(`[ChatViewPane] loadSession done total=${Date.now() - t0}ms uri=${sessionResource.toString()} cancelled=true phase=postAcquire`);
          return void 0;
        }
        const localFallbackSelectionReason = getLocalFallbackSessionTypeSelectionReason(getChatSessionType(sessionResource), !!newModelRef);
        const result = await this.showModel(token, newModelRef, true, false, inputBeforeLoad, localFallbackSelectionReason);
        this.logService.trace(`[ChatViewPane] loadSession done total=${Date.now() - t0}ms uri=${sessionResource.toString()}`);
        return result;
      } catch (err) {
        clearWidget.dispose();
        await queue;
        if (token.isCancellationRequested) {
          this.logService.trace(`[ChatViewPane] loadSession done total=${Date.now() - t0}ms uri=${sessionResource.toString()} cancelled=true phase=error`);
          return void 0;
        }
        this.logService.error(`Failed to load chat session '${sessionResource.toString()}'`, err);
        this.notificationService.error(localize(12700, null, toErrorMessage(err)));
        const localFallbackSelectionReason = getLocalFallbackSessionTypeSelectionReason(getChatSessionType(sessionResource), didAcquireSession);
        const result = await this.showModel(token, void 0, true, false, inputBeforeLoad, localFallbackSelectionReason);
        this.logService.trace(`[ChatViewPane] loadSession done total=${Date.now() - t0}ms uri=${sessionResource.toString()} error=true`);
        return result;
      } finally {
        clearWidgetCancellationListener.dispose();
      }
    });
  }
  //#endregion
  focus() {
    super.focus();
    this.focusInput();
  }
  focusInput() {
    if (this.bridgeMode) {
      return;
    }
    this._widget.focusInput();
  }
  focusSessions() {
    if (this.sessionsContainer?.style.display === "none") {
      return false;
    }
    this.sessionsControl?.focus();
    return true;
  }
  relayout() {
    if (!this.bridgeMode && !this._widget?.visible) {
      return;
    }
    if (this.lastDimensions) {
      this.layoutBody(this.lastDimensions.height, this.lastDimensions.width);
    }
  }
  relayoutForInputHeight() {
    if (this.layoutingBody || !this._widget?.visible || !this.lastDimensions) {
      return;
    }
    this.layoutChatAndSessions(this.lastDimensions.height, this.lastDimensions.width, false);
  }
  layoutBody(height, width2) {
    if (this.layoutingBody) {
      return;
    }
    this.layoutingBody = true;
    try {
      this.doLayoutBody(height, width2);
    } finally {
      this.layoutingBody = false;
    }
  }
  doLayoutBody(height, width2) {
    super.layoutBody(height, width2);
    this.lastDimensions = { height, width: width2 };
    this.layoutChatAndSessions(height, width2, true);
  }
  layoutChatAndSessions(height, width2, layoutInput) {
    const taskShelfHeight = this.bridgeSessionView?.taskShelfHeight ?? 0;
    if (this.bridgeMode) {
      this.sessionsViewerSashDisposables.clear();
      this.sessionsViewerSash = void 0;
      this.lastDimensionsPerOrientation.set(this.sessionsViewerOrientation, { height, width: width2 });
      return;
    }
    let remainingHeight = Math.max(ChatViewPane.MIN_CHAT_WIDGET_HEIGHT, height - taskShelfHeight);
    const remainingWidth = width2;
    const titleHeight = this.titleControl?.getHeight() ?? 0;
    remainingHeight -= titleHeight;
    const { heightReduction: ocSessionsHeightReduction, widthReduction } = this.layoutSessionsControl(remainingHeight, remainingWidth);
    const heightReduction = ocSessionsHeightReduction + (this.ocBackBar && this.ocBackBar.style.display !== "none" ? this.ocBackBar.offsetHeight || 26 : 0); // OpenCode sessions-click-1717
    const inputMaxHeight = this.sessionsViewerOrientation === 1 /* Stacked */ ? remainingHeight : void 0;
    if (layoutInput) {
      this._widget.setInputPartMaxHeightOverride(inputMaxHeight);
      this._widget.layout(remainingHeight - heightReduction, remainingWidth - widthReduction);
    } else {
      layoutChatWidgetForInputHeight(this._widget, inputMaxHeight, remainingHeight - heightReduction, remainingWidth - widthReduction);
    }
    this.lastDimensionsPerOrientation.set(this.sessionsViewerOrientation, { height, width: width2 });
  }
  layoutSessionsControl(height, width2) {
    let heightReduction = 0;
    let widthReduction = 0;
    if (!this.sessionsContainer || !this.sessionsControlContainer || !this.sessionsControl || !this.viewPaneContainer || !this.sessionsTitleContainer || !this.sessionsTitle) {
      return { heightReduction, widthReduction };
    }
    const oldSessionsViewerOrientation = this.sessionsViewerOrientation;
    let newSessionsViewerOrientation;
    switch (this.sessionsViewerOrientationConfiguration) {
      // Stacked
      case "stacked":
        newSessionsViewerOrientation = 1 /* Stacked */;
        break;
      // Update orientation based on available width
      default:
        newSessionsViewerOrientation = width2 >= ChatViewPane.SESSIONS_SIDEBAR_VIEW_MIN_WIDTH ? 2 /* SideBySide */ : 1 /* Stacked */;
    }
    this.sessionsViewerOrientation = newSessionsViewerOrientation;
    if (newSessionsViewerOrientation === 2 /* SideBySide */) {
      this.viewPaneContainer.classList.toggle("sessions-control-orientation-sidebyside", true);
      this.viewPaneContainer.classList.toggle("sessions-control-orientation-stacked", false);
      this.sessionsViewerOrientationContext.set(2 /* SideBySide */);
    } else {
      this.viewPaneContainer.classList.toggle("sessions-control-orientation-sidebyside", false);
      this.viewPaneContainer.classList.toggle("sessions-control-orientation-stacked", true);
      this.sessionsViewerOrientationContext.set(1 /* Stacked */);
    }
    if (oldSessionsViewerOrientation !== this.sessionsViewerOrientation) {
      const updatePromise = this.sessionsControl.update();
      if (this.sessionsViewerOrientation === 2 /* SideBySide */) {
        updatePromise.then((didUpdate) => {
          if (!didUpdate) {
            return;
          }
          const sessionResource = this._widget?.viewModel?.sessionResource;
          if (sessionResource) {
            this.sessionsControl?.reveal(sessionResource);
          }
        });
      }
    }
    const { visible: sessionsContainerVisible } = this.updateSessionsControlVisibility();
    if (!sessionsContainerVisible || this.sessionsViewerOrientation === 1 /* Stacked */) {
      this.sessionsViewerSashDisposables.clear();
      this.sessionsViewerSash = void 0;
    } else if (this.sessionsViewerOrientation === 2 /* SideBySide */) {
      if (!this.sessionsViewerSashDisposables.value && this.controlsRow) {
        this.createSessionsViewerSash(this.controlsRow, height, width2);
      }
    }
    if (!sessionsContainerVisible) {
      return { heightReduction: 0, widthReduction: 0 };
    }
    const sessionsTitleHeight = this.sessionsTitleContainer.offsetHeight;
    let availableSessionsHeight = height - sessionsTitleHeight;
    let reservedChatWidgetHeight = 0;
    if (this.sessionsViewerOrientation === 1 /* Stacked */) {
      const ocChatOpen = this.ocIsChatOpen();
      this.ocApplySessionsMode(ocChatOpen);
      if (ocChatOpen) {
        availableSessionsHeight = 0;
      } else {
        reservedChatWidgetHeight = Math.max(ChatViewPane.MIN_CHAT_WIDGET_HEIGHT, this._widget?.input?.height.get() ?? 0);
        availableSessionsHeight -= reservedChatWidgetHeight;
      }
    } else {
      availableSessionsHeight -= this.sessionsNewButtonContainer?.offsetHeight ?? 0;
    }
    availableSessionsHeight = Math.max(0, availableSessionsHeight);
    if (this.sessionsViewerOrientation === 2 /* SideBySide */) {
      const sessionsViewerSidebarWidth = this.computeEffectiveSideBySideSessionsSidebarWidth(width2);
      this.sessionsControlContainer.style.height = `${availableSessionsHeight}px`;
      this.sessionsControlContainer.style.width = `${sessionsViewerSidebarWidth}px`;
      this.sessionsControl.layout(availableSessionsHeight, sessionsViewerSidebarWidth);
      this.sessionsViewerSash?.layout();
      heightReduction = 0;
      widthReduction = sessionsViewerSidebarWidth + ChatViewPane.SESSIONS_SIDEBAR_BORDER_WIDTH;
    } else {
      this.sessionsControlContainer.style.height = `${availableSessionsHeight}px`;
      this.sessionsControlContainer.style.width = ``;
      this.sessionsControl.layout(availableSessionsHeight, width2);
      heightReduction = sessionsTitleHeight + availableSessionsHeight;
      widthReduction = 0;
    }
    return { heightReduction, widthReduction };
  }
  computeEffectiveSideBySideSessionsSidebarWidth(width2, sessionsViewerSidebarWidth = this.sessionsViewerSidebarWidth) {
    return Math.max(
      ChatViewPane.SESSIONS_SIDEBAR_MIN_WIDTH,
      // never smaller than min width for side by side sessions
      Math.min(
        sessionsViewerSidebarWidth,
        width2 - ChatViewPane.CHAT_WIDGET_DEFAULT_WIDTH
        // never so wide that chat widget is smaller than default width
      )
    );
  }
  getLastDimensions(orientation) {
    return this.lastDimensionsPerOrientation.get(orientation);
  }
  createSessionsViewerSash(container3, height, width2) {
    const disposables = this.sessionsViewerSashDisposables.value = new DisposableStore();
    const sash = this.sessionsViewerSash = disposables.add(new Sash(container3, {
      getVerticalSashLeft: () => {
        const sessionsViewerSidebarWidth = this.computeEffectiveSideBySideSessionsSidebarWidth(this.lastDimensions?.width ?? width2);
        const { position: position2 } = this.getViewPositionAndLocation();
        if (position2 === 1 /* RIGHT */) {
          return (this.lastDimensions?.width ?? width2) - sessionsViewerSidebarWidth;
        }
        return sessionsViewerSidebarWidth;
      }
    }, { orientation: 0 /* VERTICAL */ }));
    let sashStartWidth;
    disposables.add(sash.onDidStart(() => sashStartWidth = this.sessionsViewerSidebarWidth));
    disposables.add(sash.onDidEnd(() => sashStartWidth = void 0));
    disposables.add(sash.onDidChange((e) => {
      if (sashStartWidth === void 0 || !this.lastDimensions) {
        return;
      }
      const { position: position2 } = this.getViewPositionAndLocation();
      const delta2 = e.currentX - e.startX;
      const newWidth = position2 === 1 /* RIGHT */ ? sashStartWidth - delta2 : sashStartWidth + delta2;
      if (newWidth < ChatViewPane.SESSIONS_SIDEBAR_SNAP_THRESHOLD) {
        this.updateConfiguredSessionsViewerOrientation("stacked");
        return;
      }
      this.sessionsViewerSidebarWidth = this.computeEffectiveSideBySideSessionsSidebarWidth(this.lastDimensions.width, newWidth);
      this.viewState.sessionsSidebarWidth = this.sessionsViewerSidebarWidth;
      this.layoutBody(this.lastDimensions.height, this.lastDimensions.width);
    }));
    disposables.add(sash.onDidReset(() => {
      this.sessionsViewerSidebarWidth = ChatViewPane.SESSIONS_SIDEBAR_DEFAULT_WIDTH;
      this.viewState.sessionsSidebarWidth = this.sessionsViewerSidebarWidth;
      this.relayout();
    }));
  }
  //#endregion
  saveState() {
    if (this._widget?.viewModel) {
      this._widget.saveState();
      this.updateViewState();
      this.memento.saveMemento();
    }
    super.saveState();
  }
  updateViewState(viewState) {
    const newViewState = viewState ?? this._widget.getInputState();
    if (newViewState) {
      for (const [key3, value2] of Object.entries(newViewState)) {
        this.viewState[key3] = value2;
      }
    }
  }
  shouldShowWelcome() {
    const noPersistedSessions = !this.chatService.hasSessions();
    const hasCoreAgent = this.chatAgentService.getAgents().some((agent) => agent.isCore && agent.locations.includes("panel" /* Chat */));
    const hasDefaultAgent = this.chatAgentService.getDefaultAgent("panel" /* Chat */) !== void 0;
    const shouldShow = !hasCoreAgent && (!hasDefaultAgent || !this._widget?.viewModel && noPersistedSessions);
    this.logService.trace(`ChatViewPane#shouldShowWelcome() = ${shouldShow}: hasCoreAgent=${hasCoreAgent} hasDefaultAgent=${hasDefaultAgent} || noViewModel=${!this._widget?.viewModel} && noPersistedSessions=${noPersistedSessions}`);
    return !!shouldShow;
  }
  getMatchingWelcomeView() {
    return this.welcomeController?.getMatchingWelcomeView();
  }
  getActionsContext() {
    return this._widget?.viewModel ? {
      sessionResource: this._widget.viewModel.sessionResource,
      $mid: 19 /* ChatViewContext */
    } : void 0;
  }
};

ChatViewPane = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IHoverService),
  __decorateParam(10, IStorageService),
  __decorateParam(11, IChatService),
  __decorateParam(12, IChatAgentService),
  __decorateParam(13, ILogService),
  __decorateParam(14, INotificationService),
  __decorateParam(15, IWorkbenchLayoutService),
  __decorateParam(16, IChatSessionsService),
  __decorateParam(17, ITelemetryService),
  __decorateParam(18, ILifecycleService),
  __decorateParam(19, IProgressService),
  __decorateParam(20, IAgentSessionsService),
  __decorateParam(21, IChatEntitlementService),
  __decorateParam(22, ICommandService),
  __decorateParam(23, IActivityService),
  __decorateParam(24, IHostService),
  __decorateParam(25, IMicCaptureService),
  __decorateParam(26, ITtsPlaybackService),
  __decorateParam(27, IVoiceSessionController),
  __decorateParam(28, IVoiceInputModeService),
  __decorateParam(29, IChatWidgetService),
  __decorateParam(30, IAgentTitleBarStatusService),
  __decorateParam(31, IVoicePlaybackService),
  __decorateParam(32, IWorkbenchEnvironmentService),
  __decorateParam(33, IWorkspaceContextService),
  __decorateParam(34, IAgentHostEnablementService),
  __decorateParam(35, IAccessibilityService)
], ChatViewPane);
export { ChatViewPane };
