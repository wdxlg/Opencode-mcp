// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugEditor.ts
import { $, append, clearNode, hide, show } from "./module-0075.mjs";
import { EditorPane } from "./module-1089.mjs";
import { DisposableMap, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { ChatDebugFilterState, registerFilterMenuItems } from "./module-2597.mjs";
import { ChatDebugHomeView } from "./module-2600.mjs";
import { ChatDebugOverviewView } from "./module-2601.mjs";
import { ChatDebugLogsView } from "./module-2611.mjs";
import { ChatDebugFlowChartView } from "./module-2614.mjs";
import { ChatDebugCacheExplorerView } from "./module-2617.mjs";
import { ChatDebugWireLogView } from "./module-2618.mjs";
import { AGENT_DEBUG_LOG_FILE_LOGGING_ENABLED_SETTING, AgentHostAgentDebugLogEnabledSettingId } from "./module-0985.mjs";
import { AgentHostAhpJsonlLoggingSettingId } from "./module-1107.mjs";
import { isChatDebugLoggingEnabledForSession, isWireLogLoggingEnabled, renderChatDebugLoggingDisabledMessage, renderWireLogLoggingDisabledMessage } from "./module-2599.mjs";
import { isAgentHostSession } from "./module-2598.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IChatDebugService } from "./module-1456.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { IChatService } from "./module-0972.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IPreferencesService } from "./module-1294.mjs";


// src/vs/workbench/contrib/chat/browser/chatDebug/chatDebugEditor.ts
var $82 = $;

var ChatDebugEditor = class extends EditorPane {
  constructor(group2, telemetryService, themeService, storageService, instantiationService, chatDebugService, chatWidgetService, chatService, contextKeyService, configurationService, preferencesService) {
    super(ChatDebugEditor.ID, group2, telemetryService, themeService, storageService);
    this.instantiationService = instantiationService;
    this.chatDebugService = chatDebugService;
    this.chatWidgetService = chatWidgetService;
    this.chatService = chatService;
    this.contextKeyService = contextKeyService;
    this.configurationService = configurationService;
    this.preferencesService = preferencesService;
    this.viewState = "home" /* Home */;
    this.disabledOverlayDisposables = this._register(new DisposableStore());
    this.sessionModelListener = this._register(new MutableDisposable());
    this.modelChangeListeners = this._register(new DisposableMap());
  }
  static {
    this.ID = "workbench.editor.chatDebug";
  }
  get scopedContextKeyService() {
    return this._scopedContextKeyService;
  }
  /**
   * Stops the streaming pipeline and clears cached events for the
   * active session. Called when navigating away from a session or
   * when the editor becomes hidden.
   */
  endActiveSession() {
    const sessionResource = this.chatDebugService.activeSessionResource;
    if (sessionResource) {
      this.chatDebugService.endSession(sessionResource);
    }
    this.chatDebugService.activeSessionResource = void 0;
  }
  createEditor(parent) {
    this.container = append(parent, $82(".chat-debug-editor"));
    this.filterState = this._register(new ChatDebugFilterState());
    const scopedContextKeyService = this._register(this.contextKeyService.createScoped(this.container));
    this._scopedContextKeyService = scopedContextKeyService;
    this._register(registerFilterMenuItems(this.filterState, scopedContextKeyService));
    this.homeView = this._register(this.instantiationService.createInstance(ChatDebugHomeView, this.container));
    this._register(this.homeView.onNavigateToSession((sessionResource) => {
      this.navigateToSession(sessionResource);
    }));
    this.overviewView = this._register(this.instantiationService.createInstance(ChatDebugOverviewView, this.container));
    this._register(this.overviewView.onNavigate((nav) => {
      switch (nav) {
        case "home" /* Home */:
          this.endActiveSession();
          this.showView("home" /* Home */);
          break;
        case "logs" /* Logs */:
          this.showView("logs" /* Logs */);
          break;
        case "flowchart" /* FlowChart */:
          this.showView("flowchart" /* FlowChart */);
          break;
        case "cache" /* CacheExplorer */:
          this.showView("cache" /* CacheExplorer */);
          break;
        case "wirelog" /* WireLog */:
          this.showView("wirelog" /* WireLog */);
          break;
      }
    }));
    this.logsView = this._register(this.instantiationService.createInstance(ChatDebugLogsView, this.container, this.filterState));
    this._register(this.logsView.onNavigate((nav) => {
      switch (nav) {
        case "home" /* Home */:
          this.endActiveSession();
          this.showView("home" /* Home */);
          break;
        case "overview" /* Overview */:
          this.showView("overview" /* Overview */);
          break;
      }
    }));
    this.flowChartView = this._register(this.instantiationService.createInstance(ChatDebugFlowChartView, this.container, this.filterState));
    this._register(this.flowChartView.onNavigate((nav) => {
      switch (nav) {
        case "home" /* Home */:
          this.endActiveSession();
          this.showView("home" /* Home */);
          break;
        case "overview" /* Overview */:
          this.showView("overview" /* Overview */);
          break;
      }
    }));
    this.cacheExplorerView = this._register(this.instantiationService.createInstance(ChatDebugCacheExplorerView, this.container));
    this._register(this.cacheExplorerView.onNavigate((nav) => {
      switch (nav) {
        case "home" /* Home */:
          this.endActiveSession();
          this.showView("home" /* Home */);
          break;
        case "overview" /* Overview */:
          this.showView("overview" /* Overview */);
          break;
      }
    }));
    this.wireLogView = this._register(this.instantiationService.createInstance(ChatDebugWireLogView, this.container));
    this._register(this.wireLogView.onNavigate((nav) => {
      switch (nav) {
        case "home" /* Home */:
          this.endActiveSession();
          this.showView("home" /* Home */);
          break;
        case "overview" /* Overview */:
          this.showView("overview" /* Overview */);
          break;
      }
    }));
    this._register(this.chatDebugService.onDidAddEvent((event) => {
      if (this.viewState === "home" /* Home */) {
        this.homeView?.render();
      } else if (this.chatDebugService.activeSessionResource && event.sessionResource.toString() === this.chatDebugService.activeSessionResource.toString()) {
        if (this.viewState === "overview" /* Overview */) {
          this.overviewView?.refresh();
        } else if (this.viewState === "flowchart" /* FlowChart */) {
          this.flowChartView?.refresh();
        } else if (this.viewState === "cache" /* CacheExplorer */) {
          this.cacheExplorerView?.refresh();
        } else if (this.viewState === "wirelog" /* WireLog */) {
          this.wireLogView?.refresh();
        }
      }
    }));
    this._register(this.chatWidgetService.onDidChangeFocusedSession(() => {
      if (this.viewState === "home" /* Home */) {
        this.homeView?.render();
      }
    }));
    this._register(this.chatService.onDidCreateModel((model) => {
      const key3 = model.sessionResource.toString();
      this.modelChangeListeners.set(key3, model.onDidChange((e) => {
        if (e.kind === "setCustomTitle") {
          if (this.viewState === "home" /* Home */) {
            this.homeView?.render();
          } else if (this.viewState === "overview" /* Overview */ || this.viewState === "logs" /* Logs */ || this.viewState === "flowchart" /* FlowChart */ || this.viewState === "cache" /* CacheExplorer */ || this.viewState === "wirelog" /* WireLog */) {
            this.overviewView?.updateBreadcrumb();
            this.logsView?.updateBreadcrumb();
            this.flowChartView?.updateBreadcrumb();
            this.cacheExplorerView?.updateBreadcrumb();
            this.wireLogView?.updateBreadcrumb();
          }
        }
      }));
    }));
    this._register(this.chatService.onDidDisposeSession(() => {
      if (this.viewState === "home" /* Home */) {
        this.homeView?.render();
      }
    }));
    this.disabledOverlay = append(this.container, $82(".chat-debug-disabled-overlay"));
    hide(this.disabledOverlay);
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(AgentHostAgentDebugLogEnabledSettingId) || e.affectsConfiguration(AGENT_DEBUG_LOG_FILE_LOGGING_ENABLED_SETTING) || e.affectsConfiguration(AgentHostAhpJsonlLoggingSettingId)) {
        this.displayView(this.viewState);
      }
    }));
    this.showView("home" /* Home */);
  }
  // =====================================================================
  // View switching
  // =====================================================================
  showView(state) {
    this.viewState = state;
    this.telemetryService.publicLog2("chatDebugViewSwitched", {
      viewState: state
    });
    this.displayView(state);
  }
  displayView(state) {
    const session = this.chatDebugService.activeSessionResource;
    const dataViewDisabled = (state === "logs" /* Logs */ || state === "flowchart" /* FlowChart */ || state === "cache" /* CacheExplorer */) && !isChatDebugLoggingEnabledForSession(this.configurationService, session);
    const wireLogDisabled = state === "wirelog" /* WireLog */ && isAgentHostSession(session) && !isWireLogLoggingEnabled(this.configurationService);
    if (state === "home" /* Home */) {
      this.homeView?.show();
    } else {
      this.homeView?.hide();
    }
    if (state === "overview" /* Overview */) {
      this.overviewView?.show();
    } else {
      this.overviewView?.hide();
    }
    if (state === "logs" /* Logs */ && !dataViewDisabled) {
      this.logsView?.show();
      this.doLayout();
      this.logsView?.focus();
    } else {
      this.logsView?.hide();
    }
    if (state === "flowchart" /* FlowChart */ && !dataViewDisabled) {
      this.flowChartView?.show();
    } else {
      this.flowChartView?.hide();
    }
    if (state === "cache" /* CacheExplorer */ && !dataViewDisabled) {
      this.cacheExplorerView?.show();
    } else {
      this.cacheExplorerView?.hide();
    }
    if (state === "wirelog" /* WireLog */ && !wireLogDisabled) {
      this.wireLogView?.show();
      this.doLayout();
    } else {
      this.wireLogView?.hide();
    }
    this.updateDisabledOverlay(wireLogDisabled ? "wirelog" : dataViewDisabled ? "data" : void 0);
  }
  updateDisabledOverlay(kind) {
    if (!this.disabledOverlay) {
      return;
    }
    this.disabledOverlayDisposables.clear();
    clearNode(this.disabledOverlay);
    if (kind === "wirelog") {
      renderWireLogLoggingDisabledMessage(this.disabledOverlay, this.preferencesService, this.disabledOverlayDisposables);
      show(this.disabledOverlay);
    } else if (kind === "data") {
      renderChatDebugLoggingDisabledMessage(this.disabledOverlay, this.chatDebugService.activeSessionResource, this.preferencesService, this.disabledOverlayDisposables);
      show(this.disabledOverlay);
    } else {
      hide(this.disabledOverlay);
    }
  }
  navigateToSession(sessionResource, view) {
    const previousSessionResource = this.chatDebugService.activeSessionResource;
    if (previousSessionResource && previousSessionResource.toString() !== sessionResource.toString()) {
      this.chatDebugService.endSession(previousSessionResource);
    }
    this.chatDebugService.activeSessionResource = sessionResource;
    if (!this.chatDebugService.hasInvokedProviders(sessionResource)) {
      this.chatDebugService.invokeProviders(sessionResource);
    }
    this.trackSessionModelChanges(sessionResource);
    this.overviewView?.setSession(sessionResource);
    this.logsView?.setSession(sessionResource);
    this.flowChartView?.setSession(sessionResource);
    this.cacheExplorerView?.setSession(sessionResource);
    this.wireLogView?.setSession(sessionResource);
    const targetState = view === "logs" ? "logs" /* Logs */ : view === "flowchart" ? "flowchart" /* FlowChart */ : view === "cache" ? "cache" /* CacheExplorer */ : view === "wirelog" ? "wirelog" /* WireLog */ : "overview" /* Overview */;
    this.showView(targetState);
  }
  trackSessionModelChanges(sessionResource) {
    const model = this.chatService.getSession(sessionResource);
    if (!model) {
      this.sessionModelListener.clear();
      return;
    }
    this.sessionModelListener.value = model.onDidChange((e) => {
      if (e.kind === "addRequest" || e.kind === "completedRequest") {
        if (this.viewState === "overview" /* Overview */) {
          this.overviewView?.refresh();
        }
      }
    });
  }
  // =====================================================================
  // EditorPane overrides
  // =====================================================================
  focus() {
    if (this.viewState === "logs" /* Logs */) {
      this.logsView?.focus();
    } else {
      this.container?.focus();
    }
  }
  clearInput() {
    this.endActiveSession();
    super.clearInput();
  }
  async setInput(input, options3, context2, token) {
    await super.setInput(input, options3, context2, token);
    if (options3) {
      this._applyNavigationOptions(options3);
    }
  }
  setOptions(options3) {
    super.setOptions(options3);
    if (options3) {
      this._applyNavigationOptions(options3);
    }
  }
  /**
   * The panel is enabled when either local file logging or agent-host (Copilot
   * CLI) debug logging is on. Each provider self-gates on its own setting, so
   * this only decides whether to fall back to the home view.
   */
  _isDebugEnabled() {
    return this.configurationService.getValue(AGENT_DEBUG_LOG_FILE_LOGGING_ENABLED_SETTING) || this.configurationService.getValue(AgentHostAgentDebugLogEnabledSettingId);
  }
  setEditorVisible(visible) {
    super.setEditorVisible(visible);
    if (visible) {
      this.telemetryService.publicLog2("chatDebugPanelOpened");
      if (!this._isDebugEnabled()) {
        this.endActiveSession();
        this.showView("home" /* Home */);
        return;
      }
      this.showView(this.viewState);
    }
  }
  _applyNavigationOptions(options3) {
    if (!this._isDebugEnabled()) {
      this.endActiveSession();
      this.showView("home" /* Home */);
      return;
    }
    const { sessionResource, viewHint, filter: filter2 } = options3;
    if (viewHint === "logs" && sessionResource) {
      this.navigateToSession(sessionResource, "logs");
    } else if (viewHint === "flowchart" && sessionResource) {
      this.navigateToSession(sessionResource, "flowchart");
    } else if (viewHint === "cache" && sessionResource) {
      this.navigateToSession(sessionResource, "cache");
    } else if (viewHint === "overview" && sessionResource) {
      this.navigateToSession(sessionResource, "overview");
    } else if (viewHint === "wirelog" && sessionResource) {
      this.navigateToSession(sessionResource, "wirelog");
    } else if (viewHint === "home") {
      this.endActiveSession();
      this.showView("home" /* Home */);
    } else if (sessionResource) {
      this.navigateToSession(sessionResource, "overview");
    } else if (this.viewState === "home" /* Home */) {
      this.showView("home" /* Home */);
    }
    if (filter2 !== void 0 && this.filterState) {
      this.filterState.setTextFilter(filter2);
      this.logsView?.setFilterText(filter2);
    }
  }
  layout(dimension) {
    this.currentDimension = dimension;
    if (this.container) {
      this.container.style.width = `${dimension.width}px`;
      this.container.style.height = `${dimension.height}px`;
    }
    this.doLayout();
  }
  doLayout() {
    if (!this.currentDimension) {
      return;
    }
    if (this.viewState === "logs" /* Logs */) {
      this.logsView?.layout(this.currentDimension);
    } else if (this.viewState === "wirelog" /* WireLog */) {
      this.wireLogView?.layout();
    }
  }
};

ChatDebugEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IChatDebugService),
  __decorateParam(6, IChatWidgetService),
  __decorateParam(7, IChatService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IConfigurationService),
  __decorateParam(10, IPreferencesService)
], ChatDebugEditor);
export { $82, ChatDebugEditor };
