// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostModeSynchronizer.ts
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";
import { isUntitledChatSession } from "./module-0962.mjs";
import { fromAgentHostUri } from "./module-1001.mjs";
import { ChatMode } from "./module-1469.mjs";
import { URI } from "./module-0032.mjs";
import { agentHostAgentPickerStorageKey } from "./module-1743.mjs";
import { AgentSession } from "./module-1107.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IAgentHostUntitledProvisionalSessionService } from "./module-1760.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostModeSynchronizer.ts
var AGENT_HOST_SESSION_SCHEME_PREFIX = "agent-host-";

var AgentHostModeSynchronizer = class extends Disposable {
  constructor(_chatWidgetService, _provisionalSessionService, _storageService, environmentService) {
    super();
    this._chatWidgetService = _chatWidgetService;
    this._provisionalSessionService = _provisionalSessionService;
    this._storageService = _storageService;
    this._widgetListeners = this._register(new DisposableMap());
    this._updatingWidgets = /* @__PURE__ */ new Set();
    if (environmentService.isSessionsWindow) {
      return;
    }
    for (const widget of this._chatWidgetService.getAllWidgets()) {
      this._attachWidget(widget);
    }
    this._register(this._chatWidgetService.onDidAddWidget((widget) => this._attachWidget(widget)));
    this._register(this._chatWidgetService.onDidRemoveWidget((widget) => this._widgetListeners.deleteAndDispose(widget)));
    this._register(this._chatWidgetService.onDidChangeFocusedSession(() => {
      const widget = this._chatWidgetService.lastFocusedWidget;
      if (widget) {
        this._syncWidgetFromBackend(widget);
      }
    }));
    this._register(this._provisionalSessionService.onDidChange((sessionResource) => {
      const widget = this._chatWidgetService.getWidgetBySessionResource(sessionResource);
      if (widget) {
        this._syncWidgetFromBackend(widget);
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.agentHostModeSynchronizer";
  }
  _attachWidget(widget) {
    if (this._widgetListeners.has(widget)) {
      return;
    }
    const store = new DisposableStore();
    store.add(widget.input.onDidChangeCurrentChatMode((e4) => this._onWidgetModeChanged(widget, e4)));
    store.add(widget.onDidChangeViewModel(() => this._syncWidgetFromBackend(widget)));
    store.add(autorun((reader) => {
      const modes = widget.input.currentChatModesObs.read(reader);
      reader.store.add(modes.onDidChange(() => this._syncWidgetFromBackend(widget)));
    }));
    this._widgetListeners.set(widget, store);
    this._syncWidgetFromBackend(widget);
  }
  _onWidgetModeChanged(widget, e4) {
    if (!e4.isUserInitiated) {
      return;
    }
    if (this._updatingWidgets.has(widget)) {
      return;
    }
    const sessionResource = widget.viewModel?.sessionResource;
    const backendSession = sessionResource ? this._resolveBackendSession(sessionResource) : void 0;
    if (!sessionResource || !backendSession) {
      return;
    }
    const mode = widget.input.currentModeObs.get();
    const agentUri = this._agentUriFromMode(mode);
    if (this._readSelectedAgent(sessionResource) === agentUri) {
      return;
    }
    this._storeSelectedAgent(sessionResource, agentUri);
  }
  _syncWidgetFromBackend(widget) {
    const sessionResource = widget.viewModel?.sessionResource;
    const backendSession = sessionResource ? this._resolveBackendSession(sessionResource) : void 0;
    if (!sessionResource || !backendSession) {
      return;
    }
    if (!isUntitledChatSession(sessionResource)) {
      return;
    }
    const agentUri = this._readSelectedAgent(sessionResource);
    if (agentUri === void 0) {
      return;
    }
    void this._applyMode(widget, sessionResource, agentUri);
  }
  async _applyMode(widget, sessionResource, agentUri) {
    const modes = widget.input.currentChatModesObs.get();
    await modes.waitForPendingUpdates();
    if (widget.viewModel?.sessionResource.toString() !== sessionResource.toString()) {
      return;
    }
    const mode = this._findMode(modes, agentUri);
    if (!mode || widget.input.currentModeObs.get().id === mode.id) {
      return;
    }
    this._updatingWidgets.add(widget);
    try {
      widget.input.setChatMode(mode.id, false);
    } finally {
      this._updatingWidgets.delete(widget);
    }
  }
  _findMode(modes, modeId) {
    return modes.findModeById(modeId) ?? modes.custom.find((mode) => {
      const uri4 = mode.uri?.get();
      return uri4 && fromAgentHostUri(uri4).toString() === modeId;
    });
  }
  _agentUriFromMode(mode) {
    if (mode.kind !== "agent" /* Agent */ || mode.id === ChatMode.Agent.id || mode.isBuiltin) {
      return void 0;
    }
    const uri4 = mode.uri?.get();
    return uri4 ? fromAgentHostUri(uri4).toString() : URI.parse(mode.id).toString();
  }
  _storeSelectedAgent(sessionResource, agentUri) {
    const key3 = agentHostAgentPickerStorageKey(sessionResource.scheme);
    if (agentUri) {
      this._storageService.store(key3, agentUri, 0 /* PROFILE */, 1 /* MACHINE */);
    } else {
      this._storageService.remove(key3, 0 /* PROFILE */);
    }
  }
  _readSelectedAgent(sessionResource) {
    const key3 = agentHostAgentPickerStorageKey(sessionResource.scheme);
    return this._storageService.get(key3, 0 /* PROFILE */);
  }
  _resolveBackendSession(sessionResource) {
    const provisionalSession = this._provisionalSessionService.get(sessionResource);
    if (provisionalSession) {
      return provisionalSession;
    }
    if (!sessionResource.scheme.startsWith(AGENT_HOST_SESSION_SCHEME_PREFIX)) {
      return void 0;
    }
    const provider = sessionResource.scheme.substring(AGENT_HOST_SESSION_SCHEME_PREFIX.length);
    return provider ? AgentSession.uri(provider, sessionResource.path.substring(1)) : void 0;
  }
};

AgentHostModeSynchronizer = __decorateClass([
  __decorateParam(0, IChatWidgetService),
  __decorateParam(1, IAgentHostUntitledProvisionalSessionService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, IWorkbenchEnvironmentService)
], AgentHostModeSynchronizer);

registerWorkbenchContribution2(AgentHostModeSynchronizer.ID, AgentHostModeSynchronizer, WorkbenchPhase.Eventually);
export { AGENT_HOST_SESSION_SCHEME_PREFIX, AgentHostModeSynchronizer };
