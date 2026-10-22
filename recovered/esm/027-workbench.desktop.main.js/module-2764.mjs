// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widgetHosts/viewPane/openCodeBridgeSessionView.ts
import { Codicon } from "./module-0085.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { BridgeTaskViewState, isBridgeTaskDisplayExpired, isBridgeTaskDisplayInactive, partitionBridgeTaskDisplay } from "./module-2763.mjs";
import { BridgeStatusRefresher } from "./module-2762.mjs";
import { $, addDisposableListener, append, clearNode, setVisibility } from "./module-0075.mjs";
import { localizeBridge } from "./module-2646.mjs";
import { BRIDGE_STARTUP_FAILURE_CHROME, bridgeStartupFailureCopy } from "./module-2687.mjs";
import { openBridgePage } from "./module-2761.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { describeBridgeStartupFailure } from "./module-2690.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ICommandService } from "./module-0087.mjs";


// src/vs/workbench/contrib/chat/browser/widgetHosts/viewPane/openCodeBridgeSessionView.ts
var BRIDGE_GET_STATUS3 = "opencode.bridge.getStatus";
var BRIDGE_START2 = "opencode.bridge.start";
var BRIDGE_STOP2 = "opencode.bridge.stop";
var BRIDGE_CHECK_HEALTH = "opencode.bridge.checkHealth";
var BRIDGE_CLEAR_ACTIVITY_LOG = "opencode.bridge.clearActivityLog";
var BRIDGE_CLEAR_TASKS_CONFIRMED = "opencode.bridge.clearTasksConfirmed";
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
      return Codicon.tools;
  }
}
var OpenCodeBridgeSessionView = class extends Disposable {
  constructor(parent, taskShelfParent, onShelfLayout, commandService) {
    super();
    this.onShelfLayout = onShelfLayout;
    this.commandService = commandService;
    this.taskShelfBridgeMode = true;
    this.taskShelfCollapsed = false;
    this.cardStates = /* @__PURE__ */ new Map();
    this.taskDisplayInfo = /* @__PURE__ */ new Map();
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
    this.lastArchivedTaskIds = /* @__PURE__ */ new Set();
    this.activityTabVisited = false;
    // One in-flight status read at a time, with a deadline, backoff and disposal: a stuck
    // request can no longer freeze every later refresh.
    this.statusRefresher = new BridgeStatusRefresher(
      () => this.commandService.executeCommand(BRIDGE_GET_STATUS3),
      (status2, force) => {
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
    this.taskShelfBody = append(this.taskShelf, $(".opencode-bridge-task-shelf-body"));
    const taskMenu = append(shelfHeading, $("details.opencode-bridge-task-menu"));
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
    this.taskShelf.hidden = !visible || !this.lastStatus?.tasks?.some((task) => !isBridgeTaskDisplayExpired(task));
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
    this.collapseButton.setTitle(title);
    this.collapseButton.element.setAttribute("aria-label", title);
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
    this.taskShelf.hidden = !this.visible || tasks2.length === 0;
    this.taskShelfTitle.textContent = localizeBridge("opencodeBridgeSession.unifiedTasks", "\u4EFB\u52A1");
    const selected = visibleTasks.find((task) => task.id === status2.taskId);
    const active = [...visibleTasks].filter((task) => task.state === "running" || task.state === "waiting_plan").sort((a, b) => b.updatedAt - a.updatedAt)[0];
    this.taskSnapshot = selected && (selected.state === "running" || selected.state === "waiting_plan" || !active || selected.updatedAt >= active.updatedAt) ? selected : active ?? selected ?? visibleTasks[0];
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
    const finished = tasks2.filter((task) => ["completed", "cancelled", "cleared"].includes(task.state));
    if (!finished.length && !this.taskCleanupError) {
      return;
    }
    const control = append(this.taskMenuBody, $(".opencode-bridge-task-management"));
    if (finished.length) {
      const clear = append(control, $("button.opencode-bridge-task-clear-finished"));
      clear.type = "button";
      clear.disabled = this.taskCleanupBusy;
      clear.textContent = localizeBridge("opencodeBridgeSession.clearFinishedTasks", "Permanently clear finished tasks ({0})", finished.length);
      clear.addEventListener("click", () => void this.clearTaskRecords(finished.map((task) => ({ id: task.id, revision: task.revision }))));
      append(control, $(
        "span.opencode-bridge-task-retention-note",
        void 0,
        localizeBridge("opencodeBridgeSession.terminalRetention", "Task displays move to history after 20 minutes without updates and disappear after one hour. New updates restore them; background execution is unaffected.")
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
    const hint = localizeBridge("opencodeBridgeSession.interruptStaleLocallyHint", "Only changes OpenCode local tracking and preserves history. It does not stop, cancel, or control external AI/MCP execution.");
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
    clearNode(this.todosRegion);
    clearNode(this.timeline);
    clearNode(this.taskMenuBody);
    const originalTask = this.taskSnapshot;
    const { slots, history } = partitionBridgeTaskDisplay(tasks2);
    for (const task of history) {
      this.cardStates?.get(task.id)?.update(task.id, task.todos.length > 0 && task.todos.every((todo) => todo.status === "completed"), true);
    }
    if (history.some((task) => !this.lastArchivedTaskIds.has(task.id))) {
      this.taskHistoryExpanded = false;
    }
    this.lastArchivedTaskIds = new Set(history.map((task) => task.id));
    for (const task of slots) {
      this.taskSnapshot = task;
      this.renderTodos(task.todos, activities);
    }
    if (history.length) {
      const archive = append(this.todosRegion, $("details.opencode-bridge-task-finished"));
      archive.open = this.taskHistoryExpanded;
      append(archive, $("summary", void 0, localizeBridge("opencodeBridgeSession.taskHistoryCount", "\u5386\u53F2\u4EFB\u52A1 ({0})", history.length)));
      archive.addEventListener("toggle", () => {
        if (!archive.isConnected || this.taskHistoryExpanded === archive.open) {
          return;
        }
        this.taskHistoryExpanded = archive.open;
        const restoreFocus = archive.contains(archive.ownerDocument.activeElement);
        this.renderTimeline(activities, todos, tasks2);
        if (restoreFocus) {
          this.todosRegion.querySelector(".opencode-bridge-task-finished > summary")?.focus({ preventScroll: true });
        }
      });
      for (const task of this.taskHistoryExpanded ? history : []) {
        this.taskSnapshot = task;
        this.renderTodos(task.todos, activities);
        const card = this.todosRegion.lastElementChild;
        if (card && card !== archive) {
          archive.appendChild(card);
        }
      }
    }
    this.taskSnapshot = originalTask;
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
    if (!activities.length) {
      const empty = append(this.timeline, $(".opencode-bridge-session-empty"));
      const icon2 = append(empty, $("span"));
      icon2.classList.add(...ThemeIcon.asClassNameArray(Codicon.radioTower));
      append(empty, $("strong", void 0, tasks2.length || this.hiddenTaskIds.size ? localizeBridge("opencodeBridgeSession.noActivity", "No tool activity yet") : localizeBridge("opencodeBridgeSession.waiting", "Waiting for MCP client connection")));
      append(empty, $("span", void 0, tasks2.length || this.hiddenTaskIds.size ? localizeBridge("opencodeBridgeSession.noActivityDetail", "Tool activity will appear here when it is reported.") : localizeBridge("opencodeBridgeSession.waitingDetail", "Tool calls from the MCP client connected to Bridge appear here. By default, operations target the workspace folder(s) currently open in OpenCode on this Windows PC. Conversation input remains in the external client.")));
      this.restoreTimelineViewport(viewport);
      return;
    }
    for (const activity of activities) {
      if (activity.status === "progress") {
        this.renderProgress(activity);
      } else {
        this.renderToolCard(activity);
      }
    }
    this.restoreTimelineViewport(viewport);
    if (this.followTimeline && (!this.multiTaskLayout || this.multiTaskTab === "activities")) {
      this.scrollTimelineToBottom();
    }
  }
  captureTimelineViewport() {
    const focused = this.root.contains(this.root.ownerDocument.activeElement) ? this.root.ownerDocument.activeElement : void 0;
    const focusedRow = focused?.closest(".opencode-bridge-task-index-row");
    const focusedActivity = focused?.closest(".opencode-bridge-tool-card");
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
      const card = [...this.timeline.querySelectorAll(".opencode-bridge-tool-card")].find((element) => element.dataset.activityId === viewport.focusId);
      focus = card?.querySelector(".opencode-bridge-tool-summary") ?? void 0;
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
    const name = this.taskDisplayInfo.get(task.id)?.name ?? (task.overview ? `${task.overview.label}${task.overviewSessionTag ? ` \xB7 \u5BF9\u8BDD ${task.overviewSessionTag}` : ""}` : void 0);
    if (name) {
      return name;
    }
    const tasks2 = this.lastStatus?.tasks ?? [];
    const kind = task.originKind === "chat" ? "chat" : "bridge";
    const related = tasks2.filter((entry) => (entry.originKind ?? "bridge") === kind).reverse();
    const number = Math.max(1, related.findIndex((entry) => entry.id === task.id) + 1);
    return kind === "chat" ? `\u5BF9\u8BDD ${number}` : related.length > 1 ? `\u4EFB\u52A1 ${number}` : "\u4EFB\u52A1\u8FDB\u5EA6";
  }
  renderOrigin(summary, task) {
    const kind = task.originKind === "chat" ? "chat" : "bridge";
    const label3 = append(summary, $("span.opencode-bridge-task-origin", void 0, kind === "chat" ? "Chat" : "Bridge"));
    label3.classList.add(kind);
    label3.title = kind === "chat" ? "\u672C\u673A\u539F\u751F Chat\uFF08\u4E0D\u662F\u6A21\u578B\u54C1\u724C\uFF09" : "MCP \u63A5\u5165\uFF08\u5BA2\u6237\u7AEF\u8EAB\u4EFD\u672A\u7ECF\u9A8C\u8BC1\uFF09";
  }
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
    append(labels2, $("span.opencode-bridge-task-summary-detail", void 0, localizeBridge("opencodeBridgeSession.noPlanYet", "\u5C1A\u672A\u4E0A\u62A5\u4EFB\u52A1\u8BA1\u5212")));
    append(summary, $("span.opencode-bridge-task-pill", void 0, localizeBridge("opencodeBridgeSession.noPlanBadge", "\u65E0\u8BA1\u5212")));
    append(taskTitle, $("span.opencode-bridge-task-state-pill", void 0, this.taskStateLabel(task.state)));
    this.renderTaskLocalControls(this.taskMenuBody, task);
    this.renderStaleTaskInterruptControl(card, task);
    if (task.state === "cleared") {
      const detail2 = card.querySelector(".opencode-bridge-task-summary-detail");
      if (detail2) {
        detail2.textContent = localizeBridge("opencodeBridgeSession.clearedTaskDetail", "Task plan was cleared");
      }
      const pill = card.querySelector(".opencode-bridge-task-pill");
      if (pill) {
        pill.textContent = this.taskStateLabel(task.state);
      }
    }
    this.todosRegion.classList.toggle("opencode-bridge-task-pending", task.state === "awaiting_sync" || task.state === "waiting_plan");
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
        return localizeBridge("opencodeBridgeSession.stateAwaitingSync", "\u7B49\u5F85\u540C\u6B65");
      case "interrupted":
        return localizeBridge("opencodeBridgeSession.stateInterrupted", "\u5DF2\u4E2D\u65AD");
      case "waiting_plan":
        return localizeBridge("opencodeBridgeSession.stateWaitingPlan", "\u89C4\u5212\u4E2D");
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
    const summaryDetail = taskSummary.currentTodo ? localizeBridge("opencodeBridgeSession.currentTaskSummary", "\u7B2C {0} / {1} \u6B65 \xB7 {2}", taskSummary.currentIndex + 1, taskSummary.totalCount, taskSummary.currentTodo.title) : presentation2.remaining ? localizeBridge("opencodeBridgeSession.pendingTaskSummary", "\u5DF2\u5B8C\u6210 {0} / {1} \u6B65 \xB7 \u5F85\u5904\u7406 {2} \u6B65", taskSummary.completedCount, taskSummary.totalCount, presentation2.remaining) : localizeBridge("opencodeBridgeSession.completedTaskSummary", "\u5DF2\u5B8C\u6210 {0} / {1} \u6B65", taskSummary.completedCount, taskSummary.totalCount);
    append(summaryLabels, $("span.opencode-bridge-task-summary-detail", void 0, summaryDetail));
    append(summary, $("span.opencode-bridge-task-pill", void 0, taskSummary.currentTodo ? localizeBridge("opencodeBridgeSession.stepBadge", "\u7B2C {0}/{1} \u6B65", taskSummary.currentIndex + 1, taskSummary.totalCount) : presentation2.remaining ? localizeBridge("opencodeBridgeSession.remainingStepsBadge", "\u5F85\u5904\u7406 {0} \u6B65", presentation2.remaining) : localizeBridge("opencodeBridgeSession.doneBadge", "\u5DF2\u5B8C\u6210 {0}/{1}", taskSummary.completedCount, taskSummary.totalCount)));
    if (task) {
      append(taskTitle, $("span.opencode-bridge-task-state-pill", void 0, this.taskStateLabel(task.state)));
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
    append(labels2, $("span.opencode-bridge-tool-title", void 0, presentation2.title));
    if (presentation2.subtitle) append(labels2, $("span.opencode-bridge-tool-subtitle", void 0, presentation2.subtitle));
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
    this.connectionTitle.textContent = localizeBridge("opencodeBridgeSession.mcpSession", "MCP session");
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
    clearNode(this.statsContainer);
    this.appendStat(localizeBridge("opencodeBridgeSession.toolCalls", "Tool calls"), String(status2.stats.toolCalls));
    this.appendStat(localizeBridge("opencodeBridgeSession.averageResponse", "Average response"), formatDuration4(status2.stats.averageDurationMs));
    this.appendStat(localizeBridge("opencodeBridgeSession.failures", "Failures"), String(status2.stats.failedToolCalls));
    this.appendStat(localizeBridge("opencodeBridgeSession.successRate", "Success rate"), `${status2.stats.successRate.toFixed(status2.stats.successRate === 100 ? 0 : 1)}%`);
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
    const running = this.lastStatus?.state === "running";
    const starting = this.lastStatus?.state === "starting";
    this.startStopButton.enabled = !this.busy && !starting;
    this.startStopButton.label = this.busy || starting ? `$(${Codicon.loading.id}) ${localizeBridge("opencodeBridgeSession.starting", "Starting\u2026")}` : running ? `$(${Codicon.debugStop.id}) ${localizeBridge("opencodeBridgeSession.stopBridge", "Stop Bridge")}` : `$(${Codicon.plug.id}) ${localizeBridge("opencodeBridgeSession.startBridge", "Start Bridge")}`;
    this.healthButton.enabled = !this.checkingHealth && !starting;
    this.healthButton.label = this.checkingHealth ? `$(${Codicon.loading.id}) ${localizeBridge("opencodeBridgeSession.checkingHealthShort", "Checking\u2026")}` : `$(${Codicon.pulse.id}) ${localizeBridge("opencodeBridgeSession.checkHealthShort", "Health")}`;
    const healthTitle = localizeBridge("opencodeBridgeSession.checkHealth", "Check MCP health");
    this.healthButton.setTitle(healthTitle);
    this.healthButton.element.setAttribute("aria-label", healthTitle);
    const hasLog = (this.lastStatus?.activities.length ?? 0) > 0 || (this.lastStatus?.stats.toolCalls ?? 0) > 0;
    this.clearLogButton.enabled = !this.busy && hasLog;
    this.clearLogButton.label = `$(${Codicon.clearAll.id}) ${localizeBridge("opencodeBridgeSession.clearLogShort", "Clear log")}`;
    const clearTitle = localizeBridge("opencodeBridgeSession.clearLog", "Clear tool call log");
    this.clearLogButton.setTitle(clearTitle);
    this.clearLogButton.element.setAttribute("aria-label", clearTitle);
    this.renderFooterCollapsedState();
  }
};
OpenCodeBridgeSessionView = __decorateClass([
  __decorateParam(3, ICommandService)
], OpenCodeBridgeSessionView);
export { formatDuration4, formatTime, activityIcon, BRIDGE_GET_STATUS3, BRIDGE_START2, BRIDGE_STOP2, BRIDGE_CHECK_HEALTH, BRIDGE_CLEAR_ACTIVITY_LOG, BRIDGE_CLEAR_TASKS_CONFIRMED, BRIDGE_OPEN_RESOURCE, BRIDGE_OPEN_DIFF, BRIDGE_OPEN_TERMINAL, OpenCodeBridgeSessionView };
