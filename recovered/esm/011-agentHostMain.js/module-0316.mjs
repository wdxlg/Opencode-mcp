// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentSdkSetupChannel.ts
import { Disposable } from "./module-0010.mjs";
import { AGENT_SDK_SETUP_DOWNLOAD_REQUEST_KEY, AGENT_SDK_SETUP_RELOAD_REQUEST_KEY, agentSdkSetupStatusKey, isAgentSdkSetupRequestFor } from "./module-0315.mjs";


// src/vs/platform/agentHost/node/agentSdkSetupChannel.ts
var AgentSdkSetupChannel = class extends Disposable {
  constructor(_agent, _configurationService, _downloader, _logService) {
    super();
    this._agent = _agent;
    this._configurationService = _configurationService;
    this._downloader = _downloader;
    this._logService = _logService;
    /** Consumed request nonce per request key, so a root-config change we caused isn't re-handled. */
    this._lastRequests = /* @__PURE__ */ new Map();
    /**
     * Latched while the *explicit* download runs. {@link IAgentSdkSetupChannelAgent.isSdkLocal}
     * stays false throughout, so without this the channel could only ever report
     * `notDownloaded` and the banner would keep offering a button for work already
     * underway. Deliberately not a query on the downloader, which would also latch
     * for background fetches — those are the ones the user never asked for and so
     * must stay invisible.
     */
    this._downloadInFlight = false;
    this._register(this._configurationService.onDidRootConfigChange(() => this._handleRequest()));
    queueMicrotask(() => {
      void this.publish();
    });
  }
  /** Publish the current status, paying for the is-local probe. */
  async publish() {
    this.publishWith(await this._agent.isSdkLocal());
  }
  /** The synchronous half, for callers that have just paid for the probe. */
  publishWith(sdkIsLocal) {
    const download = this._downloadInFlight ? "downloading" : sdkIsLocal ? "ready" : "notDownloaded";
    const info = { ...this._agent.setupInfo, download };
    this._configurationService.publishRootTransientValues?.({ [agentSdkSetupStatusKey(this._agent.id)]: info });
  }
  _handleRequest() {
    const values = this._configurationService.getRootConfigValues?.() ?? {};
    if (this._takeRequest(values, AGENT_SDK_SETUP_DOWNLOAD_REQUEST_KEY)) {
      void this._download();
    }
    if (this._takeRequest(values, AGENT_SDK_SETUP_RELOAD_REQUEST_KEY)) {
      this._logService.info(`[AgentSdkSetup] ${this._agent.id}: reloading the agent's configuration at the user's request`);
      void this._lookAgain();
    }
  }
  /** Claim one request addressed to this agent, clearing the key so a repeat press still lands. */
  _takeRequest(values, key) {
    const request = values[key];
    if (!isAgentSdkSetupRequestFor(request, this._agent.id) || request.request === this._lastRequests.get(key)) {
      return false;
    }
    this._lastRequests.set(key, request.request);
    this._configurationService.updateRootConfig({ [key]: void 0 });
    return true;
  }
  /**
   * The explicit download gesture. Acquiring progress interest is what makes the
   * fetch visible: the downloader only emits frames for a session that asked or an
   * explicitly-registered interest, and this download belongs to no session.
   */
  async _download() {
    if (this._downloadInFlight) {
      return;
    }
    const progressInterest = this._downloader.acquireDownloadProgressInterest(this._agent.sdkPackage);
    this._downloadInFlight = true;
    this.publishWith(false);
    try {
      this._logService.info(`[AgentSdkSetup] ${this._agent.id}: downloading the agent SDK at the user's request`);
      await this._agent.downloadSdk();
    } catch (error) {
      this._logService.error(error, `[AgentSdkSetup] ${this._agent.id}: agent SDK download failed`);
    } finally {
      this._downloadInFlight = false;
      progressInterest.dispose();
    }
    await this._lookAgain();
  }
  /**
   * Re-read the world: the tail of a download, and the whole of a reload. Both
   * gestures change exactly what these two calls see — one puts the SDK on disk,
   * the other follows a `claude login` the app could not observe.
   */
  async _lookAgain() {
    this._agent.restartChatDiscovery();
    await this._agent.refreshModels();
  }
};
export { AgentSdkSetupChannel };
