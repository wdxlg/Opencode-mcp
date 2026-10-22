// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/electron-browser/tunnelHostService.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { joinPath } from "./module-0034.mjs";
import { TUNNEL_HOST_CHANNEL, TUNNEL_HOST_LOG_ID } from "./module-1734.mjs";
import { localize } from "./module-0001.mjs";
import { ProxyChannel } from "./module-1230.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISharedProcessService } from "./module-3826.mjs";
import { IAuthenticationService } from "./module-0952.mjs";
import { IProductService } from "./module-0875.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILoggerService } from "./module-0095.mjs";
import { IEnvironmentService } from "./module-0508.mjs";


// src/vs/workbench/contrib/chat/electron-browser/tunnelHostService.ts
var CONFIGURATION_KEY_MICROSOFT_AUTH = "remote.tunnels.access.enableMicrosoftAuth";

var SHOW_TUNNEL_HOST_OUTPUT_ID = "sessions.tunnelHost.showOutput";

var RENAME_TUNNEL_ID = "sessions.tunnelHost.renameTunnel";

var TunnelHostService = class extends Disposable {
  constructor(sharedProcessService, _authenticationService, _productService, _configurationService, loggerService, environmentService) {
    super();
    this._authenticationService = _authenticationService;
    this._productService = _productService;
    this._configurationService = _configurationService;
    this._onDidChangeStatus = this._register(new Emitter());
    this.onDidChangeStatus = this._onDidChangeStatus.event;
    this._isSharing = false;
    this._isConnecting = false;
    this._logger = this._register(loggerService.createLogger(
      joinPath(environmentService.logsHome, `${TUNNEL_HOST_LOG_ID}.log`),
      { id: TUNNEL_HOST_LOG_ID, name: localize(13637, null) }
    ));
    this._mainService = ProxyChannel.toService(
      sharedProcessService.getChannel(TUNNEL_HOST_CHANNEL)
    );
    this._register(this._mainService.onDidChangeStatus((status2) => {
      this._isSharing = status2.active;
      this._sharingInfo = status2.active ? status2.info : void 0;
      this._onDidChangeStatus.fire();
    }));
    this._mainService.getStatus().then((status2) => {
      this._isSharing = status2.active;
      this._sharingInfo = status2.active ? status2.info : void 0;
      if (status2.active) {
        this._onDidChangeStatus.fire();
      }
    });
  }
  get isSharing() {
    return this._isSharing;
  }
  get isConnecting() {
    return this._isConnecting;
  }
  get sharingInfo() {
    return this._sharingInfo;
  }
  async startSharing() {
    this._isConnecting = true;
    this._onDidChangeStatus.fire();
    try {
      const auth = await this._getToken(false);
      if (!auth) {
        this._logger.warn("No auth token available for tunnel hosting");
        throw new Error(localize(13636, null));
      }
      this._logger.info("Starting tunnel hosting...");
      const info = await this._mainService.startHosting(auth.token, auth.provider);
      this._isSharing = true;
      this._sharingInfo = info;
    } finally {
      this._isConnecting = false;
      this._onDidChangeStatus.fire();
    }
  }
  async stopSharing() {
    this._logger.info("Stopping tunnel hosting...");
    await this._mainService.stopHosting();
    this._isSharing = false;
    this._sharingInfo = void 0;
    this._onDidChangeStatus.fire();
  }
  _getEnabledProviders() {
    const microsoftEnabled = this._configurationService.getValue(CONFIGURATION_KEY_MICROSOFT_AUTH);
    return microsoftEnabled ? ["microsoft", "github"] : ["github"];
  }
  async _getToken(silent) {
    const enabledProviders = this._getEnabledProviders();
    if (this._lastAuthProvider && enabledProviders.includes(this._lastAuthProvider)) {
      const result = await this._getTokenForProvider(this._lastAuthProvider, silent);
      if (result) {
        return result;
      }
    }
    for (const provider of enabledProviders) {
      if (provider === this._lastAuthProvider) {
        continue;
      }
      const result = await this._getTokenForProvider(provider, true);
      if (result) {
        return result;
      }
    }
    if (!silent) {
      for (const provider of enabledProviders) {
        const result = await this._getTokenForProvider(provider, false);
        if (result) {
          return result;
        }
      }
    }
    return void 0;
  }
  _getScopesForProvider(provider) {
    const config = this._productService.tunnelApplicationConfig?.authenticationProviders;
    return config?.[provider]?.scopes ?? [];
  }
  async _getTokenForProvider(provider, silent) {
    const scopes = this._getScopesForProvider(provider);
    if (scopes.length === 0) {
      return void 0;
    }
    try {
      let sessions = await this._authenticationService.getSessions(provider, scopes, {}, true);
      if (sessions.length === 0) {
        const allSessions = await this._authenticationService.getSessions(provider, void 0, {}, true);
        const requestedSet = new Set(scopes);
        let bestSession;
        let bestExtra = Infinity;
        for (const session of allSessions) {
          const sessionScopes = new Set(session.scopes);
          let isSuperset = true;
          for (const scope of requestedSet) {
            if (!sessionScopes.has(scope)) {
              isSuperset = false;
              break;
            }
          }
          if (isSuperset) {
            const extra = sessionScopes.size - requestedSet.size;
            if (extra < bestExtra) {
              bestExtra = extra;
              bestSession = session;
            }
          }
        }
        if (bestSession) {
          sessions = [bestSession];
        }
      }
      if (sessions.length === 0 && !silent) {
        const session = await this._authenticationService.createSession(provider, scopes, { activateImmediate: true });
        sessions = [session];
      }
      if (sessions.length > 0) {
        const token = sessions[0].accessToken;
        if (token) {
          this._lastAuthProvider = provider;
          return { token, provider };
        }
      }
    } catch (err) {
      this._logger.debug(`Failed to get ${provider} token: ${err}`);
    }
    return void 0;
  }
};

TunnelHostService = __decorateClass([
  __decorateParam(0, ISharedProcessService),
  __decorateParam(1, IAuthenticationService),
  __decorateParam(2, IProductService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ILoggerService),
  __decorateParam(5, IEnvironmentService)
], TunnelHostService);
export { CONFIGURATION_KEY_MICROSOFT_AUTH, SHOW_TUNNEL_HOST_OUTPUT_ID, RENAME_TUNNEL_ID, TunnelHostService };
