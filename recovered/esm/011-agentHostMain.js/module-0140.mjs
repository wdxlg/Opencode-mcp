// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostProxyResolver.ts
import { createDecorator } from "./module-0044.mjs";
import { Disposable, MutableDisposable, toDisposable } from "./module-0010.mjs";
import { Emitter } from "./module-0016.mjs";
import { equals2 } from "./module-0035.mjs";
import { AgentHostProxyConfigKey, agentHostProxyConfigSchema } from "./module-0057.mjs";
import { systemCertificatesNodeDefault } from "./module-0146.mjs";
import { lookupKerberosAuthorization } from "./module-0147.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentConfigurationService } from "./module-0104.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/agentHostProxyResolver.ts
import { LogLevel as ProxyLogLevel, createFetchPatch, createProxyAuthorizationLookup, createProxyResolver, loadSystemCertificates } from "@vscode/proxy-agent";


// src/vs/platform/agentHost/node/agentHostProxyResolver.ts
var IAgentHostProxyResolver = createDecorator("agentHostProxyResolver");

var AgentHostProxyResolver = class extends Disposable {
  constructor(_configurationService, _logService) {
    super();
    this._configurationService = _configurationService;
    this._logService = _logService;
    this._onDidRegisterConnection = this._register(new Emitter());
    this.onDidRegisterConnection = this._onDidRegisterConnection.event;
    this._onDidChangeConfiguration = this._register(new Emitter());
    this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
    this._configurationListener = this._register(new MutableDisposable());
    this._connections = /* @__PURE__ */ new Map();
    this._configurationValues = {};
    this._configurationValues = this._readConfigurationValues();
    this._configurationListener.value = this._configurationService.onDidRootConfigChange(() => {
      const values = this._readConfigurationValues();
      if (!equals2(this._configurationValues, values)) {
        this._configurationValues = values;
        this._onDidChangeConfiguration.fire();
      }
    });
  }
  getConfigurationValue(key) {
    return this._configurationService.getRootValue(agentHostProxyConfigSchema, key);
  }
  _readConfigurationValues() {
    return Object.fromEntries(Object.values(AgentHostProxyConfigKey).map((key) => [key, this.getConfigurationValue(key)]));
  }
  register(clientId, connection) {
    const hadConnections = this._connections.size > 0;
    this._connections.set(clientId, connection);
    if (!hadConnections) {
      this._onDidRegisterConnection.fire();
    }
    return toDisposable(() => {
      if (this._connections.get(clientId) === connection) {
        this._connections.delete(clientId);
      }
    });
  }
  resolveProxy(url2) {
    return this._getProxyResolver().resolveProxyURL(url2);
  }
  fetch(input, init) {
    if (!this._fetch) {
      const proxyResolver = this._getProxyResolver();
      this._fetch = createFetchPatch(this._proxyAgentParams, globalThis.fetch, proxyResolver.resolveProxyURL);
    }
    return this._fetch(input, init);
  }
  _getProxyResolver() {
    if (!this._proxyResolver) {
      const params = {
        // The host proxy resolution runs in VS Code: reverse-call a connected
        // renderer, whose IRequestService.resolveProxy hits the Electron
        // session (system settings / PAC scripts).
        resolveProxy: (url2) => this._hostResolveProxy(url2),
        lookupProxyAuthorization: createProxyAuthorizationLookup({
          log: this._logService,
          lookupAuthorization: (authInfo) => this._hostLookupAuthorization(authInfo),
          lookupKerberosAuthorization: (url2) => this._hostLookupKerberosAuthorization(url2)
        }),
        getProxyURL: () => this.getConfigurationValue(AgentHostProxyConfigKey.Proxy),
        getProxySupport: () => "override",
        getNoProxyConfig: () => this.getConfigurationValue(AgentHostProxyConfigKey.NoProxy) || [],
        isAdditionalFetchSupportEnabled: () => true,
        isWebSocketPatchEnabled: () => true,
        addCertificatesV1: () => true,
        addCertificatesV2: () => false,
        loadSystemCertificatesFromNode: () => systemCertificatesNodeDefault,
        loadAdditionalCertificates: async () => loadSystemCertificates({
          loadSystemCertificatesFromNode: () => systemCertificatesNodeDefault,
          log: this._logService
        }),
        log: this._logService,
        getLogLevel: () => {
          switch (this._logService.getLevel()) {
            case 1 /* Trace */:
              return ProxyLogLevel.Trace;
            case 2 /* Debug */:
              return ProxyLogLevel.Debug;
            case 3 /* Info */:
              return ProxyLogLevel.Info;
            case 4 /* Warning */:
              return ProxyLogLevel.Warning;
            case 5 /* Error */:
              return ProxyLogLevel.Error;
            case 0 /* Off */:
              return ProxyLogLevel.Off;
            default:
              return ProxyLogLevel.Info;
          }
        },
        proxyResolveTelemetry: () => {
        },
        // Only the local agent host wires the reverse proxy channel
        // and we want to look up the client's proxy settings only
        // when the agent host is local (i.e., on the same machine as
        // the client).
        isUseHostProxyEnabled: () => this._connections.size > 0,
        getNetworkInterfaceCheckInterval: () => 300 * 1e3,
        env: process.env
      };
      this._proxyAgentParams = params;
      this._proxyResolver = createProxyResolver(params);
    }
    return this._proxyResolver;
  }
  async _hostResolveProxy(url2) {
    for (const connection of this._connections.values()) {
      try {
        return await connection.resolveProxy(url2);
      } catch {
      }
    }
    return void 0;
  }
  async _hostLookupAuthorization(authInfo) {
    for (const connection of this._connections.values()) {
      try {
        return await connection.lookupAuthorization(authInfo);
      } catch {
      }
    }
    return void 0;
  }
  async _hostLookupKerberosAuthorization(url2) {
    for (const connection of this._connections.values()) {
      try {
        return await connection.lookupKerberosAuthorization(url2);
      } catch {
      }
    }
    try {
      const spn = this.getConfigurationValue(AgentHostProxyConfigKey.ProxyKerberosServicePrincipal);
      return `Negotiate ${await this._lookupKerberosAuthorization(url2, spn)}`;
    } catch (error) {
      this._logService.debug("AgentHostProxyResolver#lookupKerberosAuthorization Kerberos authentication failed", error);
      return void 0;
    }
  }
  _lookupKerberosAuthorization(url2, spn) {
    return lookupKerberosAuthorization(url2, spn, this._logService, "AgentHostProxyResolver#lookupKerberosAuthorization");
  }
};

AgentHostProxyResolver = __decorateClass([
  __decorateParam(0, IAgentConfigurationService),
  __decorateParam(1, ILogService)
], AgentHostProxyResolver);
export { ProxyLogLevel, createFetchPatch, createProxyAuthorizationLookup, createProxyResolver, loadSystemCertificates, IAgentHostProxyResolver, AgentHostProxyResolver };
