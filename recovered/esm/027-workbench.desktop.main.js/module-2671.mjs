// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/embeddedMcpServerDetail.ts
import { $, append, clearNode } from "./module-0075.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";
import { autorun } from "./module-0052.mjs";
import { isContributionDisabled } from "./module-1018.mjs";
import { IMcpService, IMcpWorkbenchService, McpConnectionState } from "./module-1206.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { userIcon, workspaceIcon } from "./module-2640.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/embeddedMcpServerDetail.ts
var $91 = $;

var EmbeddedMcpServerDetail = class extends Disposable {
  constructor(parent, mcpWorkbenchService, mcpService) {
    super();
    this.mcpWorkbenchService = mcpWorkbenchService;
    this.mcpService = mcpService;
    this.runtimeDisposables = this._register(new DisposableStore());
    this.lifecycleActionRunning = false;
    this.root = append(parent, $91(".ai-customization-embedded-detail.embedded-mcp-detail"));
    this.headerEl = append(this.root, $91(".embedded-detail-header"));
    this.leadingSlotEl = append(this.headerEl, $91(".embedded-detail-leading-slot"));
    const headerText = append(this.headerEl, $91(".embedded-detail-header-text"));
    this.nameEl = append(headerText, $91("h2.embedded-detail-name"));
    this.nameEl.setAttribute("role", "heading");
    this.scopeEl = append(headerText, $91(".embedded-detail-scope"));
    this.descriptionEl = append(this.root, $91(".embedded-detail-description"));
    this.statusEl = append(this.root, $91(".embedded-mcp-status"));
    this.statusIconEl = append(this.statusEl, $91(".embedded-mcp-status-icon"));
    const statusText = append(this.statusEl, $91(".embedded-mcp-status-text"));
    this.statusLabelEl = append(statusText, $91(".embedded-mcp-status-label"));
    this.statusMetaEl = append(statusText, $91(".embedded-mcp-status-meta"));
    this.actionsEl = append(this.root, $91(".embedded-mcp-actions"));
    this.lifecycleButton = this._register(new Button(this.actionsEl, {
      ...defaultButtonStyles,
      secondary: true,
      small: true,
      supportIcons: true
    }));
    this.outputButton = this._register(new Button(this.actionsEl, {
      ...defaultButtonStyles,
      secondary: true,
      small: true,
      supportIcons: true
    }));
    this.outputButton.label = `$(${Codicon.output.id}) ${localize(9673, null)}`;
    this._register(this.lifecycleButton.onDidClick(() => void this.runLifecycleAction()));
    this._register(this.outputButton.onDidClick(() => void this.currentRuntime?.showOutput()));
    const toolsEl = append(this.root, $91(".embedded-detail-tools.embedded-mcp-tools"));
    this.toolsHeadingEl = append(toolsEl, $91("h3.embedded-detail-tools-heading"));
    this.toolsMessageEl = append(toolsEl, $91(".embedded-detail-tools-message"));
    this.toolsListEl = append(toolsEl, $91(".embedded-detail-tools-list"));
    this.emptyEl = append(this.root, $91(".embedded-detail-empty"));
    this.emptyEl.textContent = localize(9655, null);
    this._register(this.mcpWorkbenchService.onChange((server) => {
      if (this.current && server && server.id === this.current.id) {
        this.current = server;
        this.renderItem();
      }
    }));
    this.renderItem();
  }
  get element() {
    return this.root;
  }
  get headerElement() {
    return this.headerEl;
  }
  /**
   * Header slot reserved for leading chrome (e.g. a back button).
   * Prefer this over reaching into the header element directly.
   */
  get leadingSlot() {
    return this.leadingSlotEl;
  }
  setInput(server) {
    this.current = server;
    this.renderItem();
  }
  clearInput() {
    this.current = void 0;
    this.renderItem();
  }
  renderItem() {
    const server = this.current;
    const hasItem = !!server;
    this.emptyEl.style.display = hasItem ? "none" : "";
    this.root.classList.toggle("is-empty", !hasItem);
    if (!server) {
      this.nameEl.textContent = "";
      this.scopeEl.textContent = "";
      this.descriptionEl.textContent = "";
      this.bindRuntime();
      return;
    }
    this.nameEl.textContent = server.label || server.name;
    const scope = server.local?.scope;
    const scopeInfo = describeMcpScope(scope);
    if (scopeInfo) {
      this.scopeEl.textContent = scopeInfo.label;
      this.scopeEl.style.display = "";
    } else {
      this.scopeEl.replaceChildren();
      this.scopeEl.style.display = "none";
    }
    const description = (server.description || "").trim();
    this.descriptionEl.textContent = description;
    this.descriptionEl.style.display = description ? "" : "none";
    this.bindRuntime();
  }
  bindRuntime() {
    this.runtimeDisposables.clear();
    this.currentRuntime = void 0;
    this.currentConnectionState = void 0;
    const selected = this.current;
    if (!selected) {
      this.renderRuntime(void 0);
      return;
    }
    this.runtimeDisposables.add(autorun((reader) => {
      const runtime = findMcpRuntimeServer(selected, this.mcpService.servers.read(reader));
      this.currentRuntime = runtime;
      if (!runtime) {
        this.currentConnectionState = void 0;
        this.renderRuntime(void 0);
        return;
      }
      const disabled = isContributionDisabled(runtime.enablement.read(reader));
      const connectionState = runtime.connectionState.read(reader);
      const cacheState = runtime.cacheState.read(reader);
      const tools = runtime.tools.read(reader).filter((tool) => (tool.visibility & 1 /* Model */) !== 0);
      this.currentConnectionState = connectionState;
      this.renderRuntime({ disabled, connectionState, cacheState, tools });
    }));
  }
  renderRuntime(snapshot) {
    const server = this.current;
    this.statusIconEl.className = "embedded-mcp-status-icon";
    this.statusEl.className = "embedded-mcp-status";
    clearNode(this.toolsListEl);
    if (!snapshot) {
      const installed = server?.installState === 1 /* Installed */;
      this.setStatus(
        installed ? localize(9669, null) : localize(9660, null),
        installed ? localize(9670, null) : localize(9661, null),
        "stopped",
        Codicon.circleOutline
      );
      this.actionsEl.style.display = "none";
      this.toolsHeadingEl.textContent = localize(9679, null, 0);
      this.toolsMessageEl.textContent = installed ? localize(9681, null) : localize(9680, null);
      this.toolsMessageEl.style.display = "";
      this.toolsListEl.style.display = "none";
      return;
    }
    const { disabled, connectionState, cacheState, tools } = snapshot;
    const presentation2 = getRuntimeStatusPresentation(disabled, connectionState);
    this.setStatus(presentation2.label, getRuntimeStatusMeta(disabled, connectionState, cacheState, tools.length), presentation2.className, presentation2.icon);
    this.actionsEl.style.display = "";
    this.lifecycleButton.element.style.display = disabled ? "none" : "";
    this.outputButton.element.style.display = "";
    this.lifecycleButton.enabled = !this.lifecycleActionRunning;
    this.outputButton.enabled = !this.lifecycleActionRunning;
    const shouldStop = McpConnectionState.isRunning(connectionState);
    this.lifecycleButton.label = shouldStop ? `$(${Codicon.debugStop.id}) ${localize(9677, null)}` : `$(${Codicon.debugStart.id}) ${connectionState.state === McpConnectionState.Kind.Error ? localize(9668, null) : localize(9675, null)}`;
    this.toolsHeadingEl.textContent = localize(9679, null, tools.length);
    if (tools.length > 0) {
      this.toolsMessageEl.style.display = "none";
      this.toolsListEl.style.display = "";
      for (const tool of tools) {
        this.renderTool(tool);
      }
    } else {
      this.toolsMessageEl.textContent = getNoToolsMessage(disabled, connectionState, cacheState);
      this.toolsMessageEl.style.display = "";
      this.toolsListEl.style.display = "none";
    }
  }
  setStatus(label3, meta, className2, icon2) {
    this.statusEl.classList.add(className2);
    this.statusIconEl.classList.add(...ThemeIcon.asClassNameArray(icon2));
    this.statusLabelEl.textContent = label3;
    this.statusMetaEl.textContent = meta;
  }
  renderTool(tool) {
    const item = append(this.toolsListEl, $91(".embedded-detail-tool"));
    const name = append(item, $91(".embedded-detail-tool-name"));
    name.textContent = tool.definition.title || tool.definition.annotations?.title || tool.definition.name;
    if (tool.referenceName !== tool.definition.name) {
      const referenceName = append(item, $91(".embedded-mcp-tool-reference"));
      referenceName.textContent = tool.referenceName;
    }
    const description = append(item, $91(".embedded-detail-tool-description"));
    description.textContent = tool.definition.description?.trim() || localize(9678, null);
  }
  async runLifecycleAction() {
    const runtime = this.currentRuntime;
    const connectionState = this.currentConnectionState;
    if (!runtime || !connectionState || this.lifecycleActionRunning) {
      return;
    }
    this.lifecycleActionRunning = true;
    this.lifecycleButton.enabled = false;
    this.outputButton.enabled = false;
    try {
      if (McpConnectionState.isRunning(connectionState)) {
        await runtime.stop();
      } else {
        await runtime.start();
      }
    } finally {
      this.lifecycleActionRunning = false;
      this.lifecycleButton.enabled = true;
      this.outputButton.enabled = true;
    }
  }
};

EmbeddedMcpServerDetail = __decorateClass([
  __decorateParam(1, IMcpWorkbenchService),
  __decorateParam(2, IMcpService)
], EmbeddedMcpServerDetail);

function findMcpRuntimeServer(server, candidates) {
  const workbenchKeys = [server.id, server.name, server.label].map((value2) => value2.trim().toLowerCase()).filter(Boolean);
  for (const key3 of workbenchKeys) {
    const matches2 = candidates.filter((candidate) => candidate.definition.id.trim().toLowerCase() === key3 || candidate.definition.label.trim().toLowerCase() === key3);
    if (matches2.length === 1) {
      return matches2[0];
    }
  }
  return void 0;
}

function getRuntimeStatusPresentation(disabled, state) {
  if (disabled) {
    return { label: localize(9656, null), className: "disabled", icon: Codicon.circleSlash };
  }
  switch (state.state) {
    case McpConnectionState.Kind.Running:
      return { label: localize(9652, null), className: "running", icon: Codicon.check };
    case McpConnectionState.Kind.Starting:
      return { label: localize(9653, null), className: "starting", icon: ThemeIcon.modify(Codicon.loading, "spin") };
    case McpConnectionState.Kind.Error:
      return { label: localize(9654, null), className: "error", icon: Codicon.error };
    case McpConnectionState.Kind.Stopped:
    default:
      return { label: localize(9676, null), className: "stopped", icon: Codicon.circleOutline };
  }
}

function getRuntimeStatusMeta(disabled, state, cacheState, toolCount) {
  if (disabled) {
    return localize(9657, null);
  }
  if (state.state === McpConnectionState.Kind.Error) {
    return state.message;
  }
  if (cacheState === 5 /* Live */) {
    return localize(9658, null, toolCount);
  }
  if (cacheState === 1 /* Cached */) {
    return localize(9651, null, toolCount);
  }
  if (cacheState === 2 /* Outdated */) {
    return localize(9666, null, toolCount);
  }
  if (cacheState === 3 /* RefreshingFromUnknown */ || cacheState === 4 /* RefreshingFromCached */) {
    return localize(9667, null);
  }
  return state.state === McpConnectionState.Kind.Starting ? localize(9674, null) : localize(9682, null);
}

function getNoToolsMessage(disabled, state, cacheState) {
  if (disabled) {
    return localize(9662, null);
  }
  if (state.state === McpConnectionState.Kind.Error) {
    return localize(9663, null);
  }
  if (state.state === McpConnectionState.Kind.Starting || cacheState === 3 /* RefreshingFromUnknown */ || cacheState === 4 /* RefreshingFromCached */) {
    return localize(9664, null);
  }
  if (state.state === McpConnectionState.Kind.Stopped && cacheState === 0 /* Unknown */) {
    return localize(9665, null);
  }
  return localize(9659, null);
}

function describeMcpScope(scope) {
  switch (scope) {
    case "workspace" /* Workspace */:
      return { label: localize(9672, null), icon: workspaceIcon };
    case "user" /* User */:
    case "remoteUser" /* RemoteUser */:
      return { label: localize(9671, null), icon: userIcon };
    default:
      return void 0;
  }
}
export { findMcpRuntimeServer, getRuntimeStatusPresentation, getRuntimeStatusMeta, getNoToolsMessage, describeMcpScope, $91, EmbeddedMcpServerDetail };
