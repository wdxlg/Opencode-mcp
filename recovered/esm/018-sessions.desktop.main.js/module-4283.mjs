// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/remoteAgentHost/browser/cloudSandboxAgentHostService.ts
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { CloudSandboxEnabledSettingId, ICloudSandboxApiService, buildWpsUrl, cloudSandboxAddress, isCloudSandboxSealedToken } from "./module-3675.mjs";
import { IRemoteAgentHostService, RemoteAgentHostConnectionStatus, RemoteAgentHostsEnabledSettingId } from "./module-1736.mjs";
import { AgentHostAhpJsonlLoggingSettingId } from "./module-1108.mjs";
import { WebPubSubRelayTransport } from "./module-4280.mjs";
import { AhpJsonlLogger } from "./module-4048.mjs";
import { AgentHostProtocolClient } from "./module-4047.mjs";
import { editorWindowAgentHostClientInfo } from "./module-4051.mjs";
import { PROTOCOL_VERSION } from "./module-1780.mjs";
import { GITHUB_COPILOT_PROTECTED_RESOURCE } from "./module-1107.mjs";
import { CloudSandboxCredentialRefresher, MAX_WAKING_DELAY_MS } from "./module-4282.mjs";
import { CancellationError, isCancellationError } from "./module-0004.mjs";
import { timeout } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/sessions/contrib/providers/remoteAgentHost/browser/cloudSandboxAgentHostService.ts
var LOG_PREFIX19 = "[CloudSandboxAgentHost]";

var MAX_WAKING_RETRIES = 20;

var MAX_SEALED_TOKEN_RETRIES = 12;

var SEALED_TOKEN_RETRY_DELAY_MS = 5e3;

var CloudSandboxAgentHostService = class extends Disposable {
  constructor(_remoteAgentHostService, _apiService, _configurationService, _instantiationService, _environmentService, _logService) {
    super();
    this._remoteAgentHostService = _remoteAgentHostService;
    this._apiService = _apiService;
    this._configurationService = _configurationService;
    this._instantiationService = _instantiationService;
    this._environmentService = _environmentService;
    this._logService = _logService;
    /** Credential-refresh scheduler per connection address, disposed when the connection is gone. */
    this._managed = this._register(new DisposableMap());
    /** Current Web PubSub credentials per connection address, including the sealed GitHub token. */
    this._creds = /* @__PURE__ */ new Map();
    /** Overridable so tests can exercise the re-mint loop without waiting on real delays. */
    this.sealedTokenRetryDelayMs = SEALED_TOKEN_RETRY_DELAY_MS;
    this._register(this._remoteAgentHostService.onDidChangeConnections(() => {
      for (const address of [...this._managed.keys()]) {
        if (!this._remoteAgentHostService.connections.some((c) => c.address === address)) {
          this._managed.deleteAndDispose(address);
          this._creds.delete(address);
        }
      }
    }));
  }
  getSealedGitHubToken(environmentId) {
    return this._creds.get(cloudSandboxAddress(environmentId))?.token.encrypted_github_token;
  }
  async connect(options3, token) {
    if (!this._configurationService.getValue(CloudSandboxEnabledSettingId)) {
      throw new Error("Copilot cloud sandbox connections are not enabled.");
    }
    if (!this._configurationService.getValue(RemoteAgentHostsEnabledSettingId)) {
      throw new Error("Remote agent host connections are not enabled.");
    }
    const address = cloudSandboxAddress(options3.environmentId);
    const existing = this._remoteAgentHostService.getConnection(address);
    if (existing) {
      this._logService.trace(`${LOG_PREFIX19} Reusing existing connection for ${address}`);
      return address;
    }
    this._logService.info(`${LOG_PREFIX19} Connecting to sandbox environment ${options3.environmentId}`);
    const clientToken = await this._mintWithWaking(options3, token);
    return await this._establish(options3, address, clientToken, token);
  }
  /**
   * Open the relay with an already-minted token, drive the AHP handshake, and register the
   * connection.
   */
  async _establish(options3, address, clientToken, token) {
    const creds = { token: clientToken };
    const ahpLoggingEnabled = !!this._configurationService.getValue(AgentHostAhpJsonlLoggingSettingId);
    const transportFactory = () => new WebPubSubRelayTransport({
      url: buildWpsUrl(creds.token),
      toHostGroup: creds.token.groups.to_host,
      joinGroups: [creds.token.groups.broadcast, creds.token.groups.to_client],
      groupValidation: { expected: { cid: creds.token.client_id } },
      ahpLogger: ahpLoggingEnabled ? this._instantiationService.createInstance(AhpJsonlLogger, {
        logsHome: this._environmentService.logsHome,
        connectionId: clientToken.client_id,
        transport: "webpubsub"
      }) : void 0
    });
    const protocolClient = this._instantiationService.createInstance(
      AgentHostProtocolClient,
      address,
      transportFactory,
      { clientId: clientToken.client_id, clientInfo: editorWindowAgentHostClientInfo }
    );
    let status2 = RemoteAgentHostConnectionStatus.connected;
    let connectError;
    try {
      await protocolClient.connect();
      this._logService.info(`${LOG_PREFIX19} Protocol handshake completed with ${address}`);
    } catch (err) {
      const incompatible = RemoteAgentHostConnectionStatus.fromConnectError(err, [PROTOCOL_VERSION]);
      if (!RemoteAgentHostConnectionStatus.isIncompatible(incompatible)) {
        protocolClient.dispose();
        throw err;
      }
      this._logService.warn(`${LOG_PREFIX19} Incompatible with ${address}: ${incompatible.message}`);
      status2 = incompatible;
      connectError = err;
    }
    if (!connectError && clientToken.encrypted_github_token) {
      if (!isCloudSandboxSealedToken(clientToken.encrypted_github_token)) {
        this._logService.error(`${LOG_PREFIX19} Refusing to forward a non-sealed token to ${address}; Mission Control did not return a copilot-sealed envelope.`);
      } else {
        try {
          await protocolClient.authenticate({
            resource: GITHUB_COPILOT_PROTECTED_RESOURCE.resource,
            token: clientToken.encrypted_github_token
          });
        } catch (err) {
          this._logService.warn(`${LOG_PREFIX19} Sealed-token authenticate failed for ${address}`, err);
        }
      }
    } else if (!connectError) {
      this._logService.error(`${LOG_PREFIX19} Mission Control returned no sealed token for ${address}; this session will not be able to make authenticated requests.`);
    }
    try {
      await this._remoteAgentHostService.addManagedConnection({
        name: options3.name,
        connection: {
          type: "cloudSandbox" /* CloudSandbox */,
          address,
          environmentId: options3.environmentId,
          sessionId: options3.sessionId
        }
      }, protocolClient, void 0, status2);
    } catch (err) {
      protocolClient.dispose();
      this._logService.error(`${LOG_PREFIX19} addManagedConnection failed`, err);
      throw err;
    }
    const store = new DisposableStore();
    store.add(this._instantiationService.createInstance(
      CloudSandboxCredentialRefresher,
      address,
      { environmentId: options3.environmentId, sessionId: options3.sessionId },
      clientToken.client_id,
      creds
    ));
    this._managed.set(address, store);
    this._creds.set(address, creds);
    if (connectError) {
      throw connectError;
    }
    return address;
  }
  /** Mint client creds, retrying (bounded) while the environment is waking. */
  async _mintWithWaking(options3, token) {
    for (let attempt = 0; attempt < MAX_WAKING_RETRIES; attempt++) {
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      const result = await this._apiService.connect({ environmentId: options3.environmentId, sessionId: options3.sessionId }, token);
      if (result.kind === "token") {
        return await this._awaitSealedToken(options3, result.token, token);
      }
      const delayMs = Math.min(result.waking.retryAfterSeconds * 1e3, MAX_WAKING_DELAY_MS);
      this._logService.info(`${LOG_PREFIX19} Environment ${options3.environmentId} waking; retrying in ${delayMs}ms (attempt ${attempt + 1}/${MAX_WAKING_RETRIES})`);
      await timeout(delayMs, token);
    }
    throw new Error(`Timed out waiting for sandbox environment ${options3.environmentId} to wake.`);
  }
  /**
   * Re-mint credentials until they carry a sealed token, which a freshly provisioned environment
   * can omit for a short window after it comes up. Returns the last credentials either way, since
   * an environment may legitimately never seal one.
   */
  async _awaitSealedToken(options3, minted, token) {
    let clientToken = minted;
    for (let attempt = 0; attempt < MAX_SEALED_TOKEN_RETRIES && !isCloudSandboxSealedToken(clientToken.encrypted_github_token); attempt++) {
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      this._logService.info(`${LOG_PREFIX19} Environment ${options3.environmentId} has no sealed GitHub token yet; re-minting in ${this.sealedTokenRetryDelayMs}ms (attempt ${attempt + 1}/${MAX_SEALED_TOKEN_RETRIES})`);
      await timeout(this.sealedTokenRetryDelayMs, token);
      let result;
      try {
        result = await this._apiService.connect({ environmentId: options3.environmentId, sessionId: options3.sessionId }, token);
      } catch (err) {
        if (isCancellationError(err) || token.isCancellationRequested) {
          throw err;
        }
        this._logService.warn(`${LOG_PREFIX19} Re-mint for ${options3.environmentId} failed; continuing without a sealed token`, err);
        break;
      }
      if (result.kind !== "token") {
        break;
      }
      clientToken = result.token;
    }
    return clientToken;
  }
};

CloudSandboxAgentHostService = __decorateClass([
  __decorateParam(0, IRemoteAgentHostService),
  __decorateParam(1, ICloudSandboxApiService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IEnvironmentService),
  __decorateParam(5, ILogService)
], CloudSandboxAgentHostService);
export { LOG_PREFIX19, MAX_WAKING_RETRIES, MAX_SEALED_TOKEN_RETRIES, SEALED_TOKEN_RETRY_DELAY_MS, CloudSandboxAgentHostService };
