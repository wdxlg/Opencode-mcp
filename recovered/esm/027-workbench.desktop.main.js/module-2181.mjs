// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/agentHost/browser/agentSdkSetupService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { AGENT_SDK_SETUP_DOWNLOAD_REQUEST_KEY, AGENT_SDK_SETUP_RELOAD_REQUEST_KEY, readAgentSdkSetupInfos, readConsentedSdkAgents, resolveConsentedSdkDownloads, writeConsentedSdkAgents } from "./module-2180.mjs";
import { ROOT_STATE_URI } from "./module-1007.mjs";
import { generateUuid } from "./module-0190.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostService } from "./module-1107.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ILogService } from "./module-0095.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ICodexAccountService } from "./module-1617.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/agentHost/browser/agentSdkSetupService.ts
var AGENT_SDK_DOWNLOAD_CONSENT_KEY = "agentHost.agentSdkDownloadConsent";

var CHAT_SETUP_COMMAND_ID = "workbench.action.chat.triggerSetup";

var IAgentSdkSetupService = createDecorator("agentSdkSetupService");

var AgentSdkSetupService = class extends Disposable {
  constructor(_agentHostService, _storageService, _telemetryService, _logService, _openerService, _commandService, _codexAccountService) {
    super();
    this._agentHostService = _agentHostService;
    this._storageService = _storageService;
    this._telemetryService = _telemetryService;
    this._logService = _logService;
    this._openerService = _openerService;
    this._commandService = _commandService;
    this._codexAccountService = _codexAccountService;
    this._onDidChangeSetups = this._register(new Emitter());
    this.onDidChangeSetups = this._onDidChangeSetups.event;
    this._setups = [];
    /**
     * Agents whose SDK we have already re-requested under standing consent, so a
     * download that fails (and so reports `notDownloaded` again) is retried on the
     * next window rather than immediately, forever.
     */
    this._consentedRequests = /* @__PURE__ */ new Set();
    /**
     * Agents we have asked to fetch and the host has not answered yet. Cleared on
     * that answer rather than on success, so a failed download — which republishes
     * `notDownloaded` after the `downloading` we cleared on — re-offers the button.
     */
    this._pendingRequests = /* @__PURE__ */ new Set();
    const rootStateListeners = this._register(new DisposableStore());
    const bindRootState = () => {
      rootStateListeners.clear();
      rootStateListeners.add(this._agentHostService.rootState.onDidChange((state2) => this._updateSetups(readAgentSdkSetupInfos(state2))));
      this._pendingRequests.clear();
      const state = this._agentHostService.rootState.value;
      this._updateSetups(readAgentSdkSetupInfos(state instanceof Error ? void 0 : state));
    };
    bindRootState();
    this._register(this._agentHostService.onAgentHostStart(bindRootState));
  }
  get setups() {
    return this._setups;
  }
  requestDownload(agent) {
    const consented = new Set(this._readConsentedAgents());
    consented.add(agent);
    this._storageService.store(AGENT_SDK_DOWNLOAD_CONSENT_KEY, writeConsentedSdkAgents(consented), -1 /* APPLICATION */, 0 /* USER */);
    this._consentedRequests.add(agent);
    this._reportStep(agent, "downloadClicked");
    this._dispatchDownloadRequest(agent);
  }
  openSetupDocs(agent) {
    const url = this._getSetup(agent)?.setupDocsUrl;
    if (!url) {
      return;
    }
    this._reportStep(agent, "docsClicked");
    void this._openerService.open(url, { openExternal: true });
  }
  requestReload(agent) {
    this._reportStep(agent, "reloadClicked");
    this._dispatchRequest(AGENT_SDK_SETUP_RELOAD_REQUEST_KEY, agent);
  }
  signInToGitHub(agent) {
    this._reportStep(agent, "gitHubSignInClicked");
    void this._commandService.executeCommand(CHAT_SETUP_COMMAND_ID);
  }
  signIn(agent) {
    if (agent !== this._codexAccountService.agent) {
      return;
    }
    this._reportStep(agent, "signInClicked");
    this._codexAccountService.signIn();
  }
  reportSetupState(agent, state) {
    this._reportStep(agent, state);
  }
  isDownloadPending(agent) {
    return this._pendingRequests.has(agent);
  }
  _reportStep(agent, step) {
    this._telemetryService.publicLog2("agentHost.agentSdkSetup", { agent, step });
    this._logService.trace(`[AgentSdkSetup] ${agent}: ${step}`);
  }
  _getSetup(agent) {
    return this._setups.find((setup2) => setup2.agent === agent);
  }
  _dispatchDownloadRequest(agent) {
    this._pendingRequests.add(agent);
    this._dispatchRequest(AGENT_SDK_SETUP_DOWNLOAD_REQUEST_KEY, agent);
    this._onDidChangeSetups.fire(this._setups);
  }
  _dispatchRequest(key3, agent) {
    this._agentHostService.dispatch(ROOT_STATE_URI, {
      type: "root/configChanged" /* RootConfigChanged */,
      config: { [key3]: { agent, request: generateUuid() } }
    });
  }
  _updateSetups(setups) {
    this._setups = setups;
    for (const setup2 of setups) {
      if (setup2.download !== "notDownloaded") {
        this._pendingRequests.delete(setup2.agent);
      }
    }
    this._applyConsent();
    this._onDidChangeSetups.fire(setups);
  }
  _readConsentedAgents() {
    return readConsentedSdkAgents(this._storageService.get(AGENT_SDK_DOWNLOAD_CONSENT_KEY, -1 /* APPLICATION */));
  }
  /**
   * Honour standing consent without asking again. Runs on every status change
   * because a host that starts (or a remote that connects) publishes
   * `notDownloaded` only once it is up — there is no earlier moment to catch.
   */
  _applyConsent() {
    for (const agent of resolveConsentedSdkDownloads(this._readConsentedAgents(), this._setups, this._consentedRequests)) {
      this._consentedRequests.add(agent);
      this._reportStep(agent, "consentedDownload");
      this._dispatchDownloadRequest(agent);
    }
  }
};

AgentSdkSetupService = __decorateClass([
  __decorateParam(0, IAgentHostService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IOpenerService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, ICodexAccountService)
], AgentSdkSetupService);

registerSingleton(IAgentSdkSetupService, AgentSdkSetupService, 1 /* Delayed */);
export { AGENT_SDK_DOWNLOAD_CONSENT_KEY, CHAT_SETUP_COMMAND_ID, IAgentSdkSetupService, AgentSdkSetupService };
