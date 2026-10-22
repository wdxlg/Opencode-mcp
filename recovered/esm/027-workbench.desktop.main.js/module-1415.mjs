// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadTunnelService.ts
import { Disposable } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { IRemoteExplorerService, PORT_AUTO_FORWARD_SETTING, PORT_AUTO_SOURCE_SETTING, PORT_AUTO_SOURCE_SETTING_HYBRID, PORT_AUTO_SOURCE_SETTING_OUTPUT } from "./module-1414.mjs";
import { TunnelDtoConverter } from "./module-1412.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { localize } from "./module-0001.mjs";
import { forwardedPortsFeaturesEnabled, makeAddress } from "./module-1413.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { ITunnelService } from "./module-1409.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILogService } from "./module-0095.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/workbench/api/browser/mainThreadTunnelService.ts
var MainThreadTunnelService = class extends Disposable {
  constructor(extHostContext, remoteExplorerService, tunnelService, notificationService, configurationService, logService, remoteAgentService, contextKeyService) {
    super();
    this.remoteExplorerService = remoteExplorerService;
    this.tunnelService = tunnelService;
    this.notificationService = notificationService;
    this.configurationService = configurationService;
    this.logService = logService;
    this.remoteAgentService = remoteAgentService;
    this.contextKeyService = contextKeyService;
    this.elevateionRetry = false;
    this.portsAttributesProviders = /* @__PURE__ */ new Map();
    this._alreadyRegistered = false;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostTunnelService);
    this._register(tunnelService.onTunnelOpened(() => this._proxy.$onDidTunnelsChange()));
    this._register(tunnelService.onTunnelClosed(() => this._proxy.$onDidTunnelsChange()));
  }
  processFindingEnabled() {
    return (!!this.configurationService.getValue(PORT_AUTO_FORWARD_SETTING) || this.tunnelService.hasTunnelProvider) && this.configurationService.getValue(PORT_AUTO_SOURCE_SETTING) !== PORT_AUTO_SOURCE_SETTING_OUTPUT;
  }
  async $setRemoteTunnelService(processId) {
    this.remoteExplorerService.namedProcesses.set(processId, "Code Extension Host");
    if (this.remoteExplorerService.portsFeaturesEnabled === 2 /* AdditionalFeatures */) {
      this._proxy.$registerCandidateFinder(this.processFindingEnabled());
    } else {
      this._register(this.remoteExplorerService.onEnabledPortsFeatures(() => this._proxy.$registerCandidateFinder(this.processFindingEnabled())));
    }
    this._register(this.configurationService.onDidChangeConfiguration(async (e) => {
      if (this.remoteExplorerService.portsFeaturesEnabled === 2 /* AdditionalFeatures */ && (e.affectsConfiguration(PORT_AUTO_FORWARD_SETTING) || e.affectsConfiguration(PORT_AUTO_SOURCE_SETTING))) {
        return this._proxy.$registerCandidateFinder(this.processFindingEnabled());
      }
    }));
    this._register(this.tunnelService.onAddedTunnelProvider(async () => {
      if (this.remoteExplorerService.portsFeaturesEnabled === 2 /* AdditionalFeatures */) {
        return this._proxy.$registerCandidateFinder(this.processFindingEnabled());
      }
    }));
  }
  async $registerPortsAttributesProvider(selector, providerHandle) {
    this.portsAttributesProviders.set(providerHandle, selector);
    if (!this._alreadyRegistered) {
      this.remoteExplorerService.tunnelModel.addAttributesProvider(this);
      this._alreadyRegistered = true;
    }
  }
  async $unregisterPortsAttributesProvider(providerHandle) {
    this.portsAttributesProviders.delete(providerHandle);
  }
  async providePortAttributes(ports, pid, commandLine, token) {
    if (this.portsAttributesProviders.size === 0) {
      return [];
    }
    const appropriateHandles = Array.from(this.portsAttributesProviders.entries()).filter((entry) => {
      const selector = entry[1];
      const portRange = typeof selector.portRange === "number" ? [selector.portRange, selector.portRange + 1] : selector.portRange;
      const portInRange = portRange ? ports.some((port) => portRange[0] <= port && port < portRange[1]) : true;
      const commandMatches = !selector.commandPattern || commandLine && commandLine.match(selector.commandPattern);
      return portInRange && commandMatches;
    }).map((entry) => entry[0]);
    if (appropriateHandles.length === 0) {
      return [];
    }
    return this._proxy.$providePortAttributes(appropriateHandles, ports, pid, commandLine, token);
  }
  async $openTunnel(tunnelOptions, source) {
    const tunnel = await this.remoteExplorerService.forward({
      remote: tunnelOptions.remoteAddress,
      local: tunnelOptions.localAddressPort,
      name: tunnelOptions.label,
      source: {
        source: 2 /* Extension */,
        description: source
      },
      elevateIfNeeded: false
    });
    if (!tunnel || typeof tunnel === "string") {
      return void 0;
    }
    if (!this.elevateionRetry && tunnelOptions.localAddressPort !== void 0 && tunnel.tunnelLocalPort !== void 0 && this.tunnelService.isPortPrivileged(tunnelOptions.localAddressPort) && tunnel.tunnelLocalPort !== tunnelOptions.localAddressPort && this.tunnelService.canElevate) {
      this.elevationPrompt(tunnelOptions, tunnel, source);
    }
    return TunnelDtoConverter.fromServiceTunnel(tunnel);
  }
  async elevationPrompt(tunnelOptions, tunnel, source) {
    return this.notificationService.prompt(
      Severity2.Info,
      localize(5736, null, source, tunnelOptions.remoteAddress.port, tunnelOptions.localAddressPort),
      [{
        label: localize(5737, null, tunnel.tunnelRemotePort),
        run: async () => {
          this.elevateionRetry = true;
          await this.remoteExplorerService.close({ host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort }, "Other" /* Other */);
          await this.remoteExplorerService.forward({
            remote: tunnelOptions.remoteAddress,
            local: tunnelOptions.localAddressPort,
            name: tunnelOptions.label,
            source: {
              source: 2 /* Extension */,
              description: source
            },
            elevateIfNeeded: true
          });
          this.elevateionRetry = false;
        }
      }]
    );
  }
  async $closeTunnel(remote) {
    return this.remoteExplorerService.close(remote, "Other" /* Other */);
  }
  async $getTunnels() {
    return (await this.tunnelService.tunnels).map((tunnel) => {
      return {
        remoteAddress: { port: tunnel.tunnelRemotePort, host: tunnel.tunnelRemoteHost },
        localAddress: tunnel.localAddress,
        privacy: tunnel.privacy,
        protocol: tunnel.protocol
      };
    });
  }
  async $onFoundNewCandidates(candidates) {
    this.remoteExplorerService.onFoundNewCandidates(candidates);
  }
  async $setTunnelProvider(features, isResolver) {
    const tunnelProvider = {
      forwardPort: (tunnelOptions, tunnelCreationOptions) => {
        const forward = this._proxy.$forwardPort(tunnelOptions, tunnelCreationOptions);
        return forward.then((tunnelOrError) => {
          if (!tunnelOrError) {
            return void 0;
          } else if (typeof tunnelOrError === "string") {
            return tunnelOrError;
          }
          const tunnel = tunnelOrError;
          this.logService.trace(`ForwardedPorts: (MainThreadTunnelService) New tunnel established by tunnel provider: ${tunnel?.remoteAddress.host}:${tunnel?.remoteAddress.port}`);
          return {
            tunnelRemotePort: tunnel.remoteAddress.port,
            tunnelRemoteHost: tunnel.remoteAddress.host,
            localAddress: typeof tunnel.localAddress === "string" ? tunnel.localAddress : makeAddress(tunnel.localAddress.host, tunnel.localAddress.port),
            tunnelLocalPort: typeof tunnel.localAddress !== "string" ? tunnel.localAddress.port : void 0,
            public: tunnel.public,
            privacy: tunnel.privacy,
            protocol: tunnel.protocol ?? "http" /* Http */,
            dispose: async (silent) => {
              this.logService.trace(`ForwardedPorts: (MainThreadTunnelService) Closing tunnel from tunnel provider: ${tunnel?.remoteAddress.host}:${tunnel?.remoteAddress.port}`);
              return this._proxy.$closeTunnel({ host: tunnel.remoteAddress.host, port: tunnel.remoteAddress.port }, silent);
            }
          };
        });
      }
    };
    if (features) {
      this.tunnelService.setTunnelFeatures(features);
    }
    this.tunnelService.setTunnelProvider(tunnelProvider);
    if (isResolver) {
      this.contextKeyService.createKey(forwardedPortsFeaturesEnabled.key, true);
    }
  }
  async $hasTunnelProvider() {
    return this.tunnelService.hasTunnelProvider;
  }
  async $setCandidateFilter() {
    this.remoteExplorerService.setCandidateFilter((candidates) => {
      return this._proxy.$applyCandidateFilter(candidates);
    });
  }
  async $setCandidatePortSource(source) {
    this.remoteAgentService.getEnvironment().then(() => {
      switch (source) {
        case 0 /* None */: {
          Registry.as(Extensions4.Configuration).registerDefaultConfigurations([{ overrides: { "remote.autoForwardPorts": false } }]);
          break;
        }
        case 2 /* Output */: {
          Registry.as(Extensions4.Configuration).registerDefaultConfigurations([{ overrides: { "remote.autoForwardPortsSource": PORT_AUTO_SOURCE_SETTING_OUTPUT } }]);
          break;
        }
        case 3 /* Hybrid */: {
          Registry.as(Extensions4.Configuration).registerDefaultConfigurations([{ overrides: { "remote.autoForwardPortsSource": PORT_AUTO_SOURCE_SETTING_HYBRID } }]);
          break;
        }
        default:
      }
    }).catch(() => {
    });
  }
};

MainThreadTunnelService = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadTunnelService),
  __decorateParam(1, IRemoteExplorerService),
  __decorateParam(2, ITunnelService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IRemoteAgentService),
  __decorateParam(7, IContextKeyService)
], MainThreadTunnelService);
export { MainThreadTunnelService };
