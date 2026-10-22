// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostGenericConfigChips.ts
import { Disposable, DisposableMap, MutableDisposable } from "./module-0012.mjs";
import { toAgentHostBackendSessionUri } from "./module-2074.mjs";
import { isUntitledChatSession } from "./module-0961.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { URI } from "./module-0032.mjs";
import { AgentHostChatInputPicker, isClaimedByDedicatedPicker } from "./module-2125.mjs";
import { $, append } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAgentHostService } from "./module-1107.mjs";
import { IAgentHostUntitledProvisionalSessionService } from "./module-2124.mjs";
import { IAgentHostSessionWorkingDirectoryResolver } from "./module-2107.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IAgentHostNewSessionFolderService } from "./module-2108.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostGenericConfigChips.ts
var AgentHostGenericConfigChips = class extends Disposable {
  constructor(_widget, _instantiationService, _agentHostService, _provisional, _workingDirectoryResolver, _workspaceContextService, _newSessionFolderService) {
    super();
    this._widget = _widget;
    this._instantiationService = _instantiationService;
    this._agentHostService = _agentHostService;
    this._provisional = _provisional;
    this._workingDirectoryResolver = _workingDirectoryResolver;
    this._workspaceContextService = _workspaceContextService;
    this._newSessionFolderService = _newSessionFolderService;
    this._chips = this._register(new DisposableMap());
    this._chipElements = /* @__PURE__ */ new Map();
    /**
     * Subscription to the active session's backend state. Maintained for the
     * lifetime of any one (sessionResource, backendSession) pair; replaced
     * via {@link _reattach} when the active session changes.
     */
    this._subRef = this._register(new MutableDisposable());
    this._initialResolveCts = this._register(new MutableDisposable());
    this._register(this._widget.onDidChangeViewModel(() => this._reattach()));
    this._register(this._provisional.onDidChange((sessionResource) => {
      const current = this._widget.viewModel?.sessionResource;
      if (current && current.toString() === sessionResource.toString()) {
        this._reattach();
      }
    }));
    this._reattach();
  }
  render(container3) {
    this._container = container3;
    this._sync();
  }
  getCompactableElements() {
    return Array.from(this._chipElements.values()).filter((element) => element.classList.contains("agent-host-chat-input-picker-has-icon"));
  }
  _reattach() {
    const sessionResource = this._widget.viewModel?.sessionResource;
    const provisionalBackend = sessionResource ? this._provisional.get(sessionResource) : void 0;
    const backendSession = provisionalBackend ?? (sessionResource ? toAgentHostBackendSessionUri(sessionResource) : void 0);
    if (!sessionResource || !backendSession) {
      this._subRef.clear();
      this._initialResolved = void 0;
      this._cancelInitialResolve();
      this._sync();
      return;
    }
    if (isUntitledChatSession(sessionResource) && !provisionalBackend) {
      this._subRef.clear();
      if (!this._initialResolved || this._initialResolved.sessionResource.toString() !== sessionResource.toString()) {
        this._initialResolved = void 0;
        void this._refreshInitialResolved(sessionResource, backendSession);
      }
      this._sync();
      return;
    }
    this._initialResolved = void 0;
    this._cancelInitialResolve();
    const ref = this._agentHostService.getSubscription(1 /* Session */, backendSession, "AgentHostGenericConfigChips");
    const sub = ref.object;
    const listener = sub.onDidChange(() => this._sync());
    this._subRef.value = {
      sub,
      backendSession,
      dispose: () => {
        listener.dispose();
        ref.dispose();
      }
    };
    this._sync();
  }
  _cancelInitialResolve() {
    this._initialResolveCts.value?.cancel();
    this._initialResolveCts.clear();
  }
  async _refreshInitialResolved(sessionResource, backendSession) {
    this._initialResolveCts.value?.cancel();
    const cts = new CancellationTokenSource();
    this._initialResolveCts.value = cts;
    try {
      const result = await this._agentHostService.resolveSessionConfig({
        provider: backendSession.scheme,
        workingDirectory: this._readWorkingDirectory()
      });
      if (cts.token.isCancellationRequested || this._widget.viewModel?.sessionResource?.toString() !== sessionResource.toString()) {
        return;
      }
      this._initialResolved = { sessionResource, result };
      this._sync();
    } catch {
    }
  }
  _readWorkingDirectory() {
    const state = this._subRef.value?.sub.value;
    if (state && !(state instanceof Error)) {
      const cwd2 = state.workingDirectories?.[0];
      return typeof cwd2 === "string" ? URI.parse(cwd2) : cwd2;
    }
    const sessionResource = this._widget.viewModel?.sessionResource;
    return (sessionResource && this._newSessionFolderService.getFolder(sessionResource)) ?? (sessionResource && this._workingDirectoryResolver.resolve(sessionResource)) ?? this._newSessionFolderService.getDefaultFolder() ?? this._workspaceContextService.getWorkspace().folders[0]?.uri;
  }
  _readSchemaProperties() {
    const sessionResource = this._widget.viewModel?.sessionResource;
    if (this._subRef.value) {
      const state = this._subRef.value.sub.value;
      if (!state || state instanceof Error || !state.config) {
        return void 0;
      }
      const overlay = sessionResource ? this._provisional.getResolvedConfig(sessionResource) : void 0;
      return Object.entries((overlay?.schema ?? state.config.schema).properties);
    }
    if (this._initialResolved && sessionResource && this._initialResolved.sessionResource.toString() === sessionResource.toString()) {
      return Object.entries(this._initialResolved.result.schema.properties);
    }
    return void 0;
  }
  _sync() {
    if (!this._container) {
      return;
    }
    const entries2 = this._readSchemaProperties();
    const desired = /* @__PURE__ */ new Set();
    if (entries2) {
      for (const [property, schema10] of entries2) {
        if (isClaimedByDedicatedPicker(property, schema10)) {
          continue;
        }
        desired.add(property);
      }
    }
    for (const property of [...this._chips.keys()]) {
      if (!desired.has(property)) {
        this._chips.deleteAndDispose(property);
        this._chipElements.delete(property);
      }
    }
    for (const property of desired) {
      if (this._chips.has(property)) {
        continue;
      }
      const chip = this._instantiationService.createInstance(AgentHostChatInputPicker, this._widget, property);
      const slot = append(this._container, $(".agent-host-generic-chip-slot.chat-input-picker-item"));
      chip.render(slot);
      this._chipElements.set(property, slot);
      this._chips.set(property, {
        dispose: () => {
          chip.dispose();
          slot.remove();
          this._chipElements.delete(property);
        }
      });
    }
  }
};

AgentHostGenericConfigChips = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IAgentHostService),
  __decorateParam(3, IAgentHostUntitledProvisionalSessionService),
  __decorateParam(4, IAgentHostSessionWorkingDirectoryResolver),
  __decorateParam(5, IWorkspaceContextService),
  __decorateParam(6, IAgentHostNewSessionFolderService)
], AgentHostGenericConfigChips);
export { AgentHostGenericConfigChips };
