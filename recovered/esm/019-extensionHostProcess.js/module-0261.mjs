// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostTunnelService.ts
import { DisposableTunnel } from "./module-0260.mjs";
import { createDecorator2 } from "./module-0048.mjs";
import { Disposable, toDisposable } from "./module-0011.mjs";
import { Emitter } from "./module-0017.mjs";
import { MainContext } from "./module-0054.mjs";
import { Disposable3 } from "./module-0244.mjs";
import { CancellationToken } from "./module-0018.mjs";
import { localize } from "./module-0013.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0069.mjs";
import { IExtHostInitDataService } from "./module-0066.mjs";
import { ILogService } from "./module-0062.mjs";


// src/vs/workbench/api/common/extHostTunnelService.ts
var ExtensionTunnel = class extends DisposableTunnel {
};

var TunnelDtoConverter;

((TunnelDtoConverter2) => {
  function fromApiTunnel(tunnel) {
    return {
      remoteAddress: tunnel.remoteAddress,
      localAddress: tunnel.localAddress,
      public: !!tunnel.public,
      privacy: tunnel.privacy ?? (tunnel.public ? "public" /* Public */ : "private" /* Private */),
      protocol: tunnel.protocol
    };
  }
  TunnelDtoConverter2.fromApiTunnel = fromApiTunnel;
  function fromServiceTunnel(tunnel) {
    return {
      remoteAddress: {
        host: tunnel.tunnelRemoteHost,
        port: tunnel.tunnelRemotePort
      },
      localAddress: tunnel.localAddress,
      public: tunnel.privacy !== "constantPrivate" /* ConstantPrivate */ && tunnel.privacy !== "constantPrivate" /* ConstantPrivate */,
      privacy: tunnel.privacy,
      protocol: tunnel.protocol
    };
  }
  TunnelDtoConverter2.fromServiceTunnel = fromServiceTunnel;
})(TunnelDtoConverter || (TunnelDtoConverter = {}));

var IExtHostTunnelService = createDecorator2("IExtHostTunnelService");

var ExtHostTunnelService = class extends Disposable {
  constructor(extHostRpc, initData, logService) {
    super();
    this.logService = logService;
    this._showCandidatePort = () => {
      return Promise.resolve(true);
    };
    this._extensionTunnels = /* @__PURE__ */ new Map();
    this._onDidChangeTunnels = this._register(new Emitter());
    this.onDidChangeTunnels = this._onDidChangeTunnels.event;
    this._providerHandleCounter = 0;
    this._portAttributesProviders = /* @__PURE__ */ new Map();
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadTunnelService);
  }
  async openTunnel(extension, forward) {
    this.logService.trace(`ForwardedPorts: (ExtHostTunnelService) ${extension.identifier.value} called openTunnel API for ${forward.remoteAddress.host}:${forward.remoteAddress.port}.`);
    const tunnel = await this._proxy.$openTunnel(forward, extension.displayName);
    if (tunnel) {
      const disposableTunnel = new ExtensionTunnel(tunnel.remoteAddress, tunnel.localAddress, () => {
        return this._proxy.$closeTunnel(tunnel.remoteAddress);
      });
      this._register(disposableTunnel);
      return disposableTunnel;
    }
    return void 0;
  }
  async getTunnels() {
    return this._proxy.$getTunnels();
  }
  nextPortAttributesProviderHandle() {
    return this._providerHandleCounter++;
  }
  registerPortsAttributesProvider(portSelector, provider) {
    if (portSelector.portRange === void 0 && portSelector.commandPattern === void 0) {
      this.logService.error("PortAttributesProvider must specify either a portRange or a commandPattern");
    }
    const providerHandle = this.nextPortAttributesProviderHandle();
    this._portAttributesProviders.set(providerHandle, { selector: portSelector, provider });
    this._proxy.$registerPortsAttributesProvider(portSelector, providerHandle);
    return new Disposable3(() => {
      this._portAttributesProviders.delete(providerHandle);
      this._proxy.$unregisterPortsAttributesProvider(providerHandle);
    });
  }
  async $providePortAttributes(handles, ports, pid, commandLine, cancellationToken) {
    const providedAttributes = [];
    for (const handle of handles) {
      const provider = this._portAttributesProviders.get(handle);
      if (!provider) {
        return [];
      }
      providedAttributes.push(...await Promise.all(ports.map(async (port) => {
        let providedAttributes2;
        try {
          providedAttributes2 = await provider.provider.providePortAttributes({ port, pid, commandLine }, cancellationToken);
        } catch (e) {
          providedAttributes2 = await provider.provider.providePortAttributes(port, pid, commandLine, cancellationToken);
        }
        return { providedAttributes: providedAttributes2, port };
      })));
    }
    const allAttributes = providedAttributes.filter((attribute) => !!attribute.providedAttributes);
    return allAttributes.length > 0 ? allAttributes.map((attributes) => {
      return {
        autoForwardAction: attributes.providedAttributes.autoForwardAction,
        port: attributes.port
      };
    }) : [];
  }
  async $registerCandidateFinder(_enable) {
  }
  registerTunnelProvider(provider, information) {
    if (this._forwardPortProvider) {
      throw new Error("A tunnel provider has already been registered. Only the first tunnel provider to be registered will be used.");
    }
    this._forwardPortProvider = async (tunnelOptions, tunnelCreationOptions) => {
      const result = await provider.provideTunnel(tunnelOptions, tunnelCreationOptions, CancellationToken.None);
      return result ?? void 0;
    };
    const tunnelFeatures = information.tunnelFeatures ? {
      elevation: !!information.tunnelFeatures?.elevation,
      privacyOptions: information.tunnelFeatures?.privacyOptions,
      protocol: information.tunnelFeatures.protocol === void 0 ? true : information.tunnelFeatures.protocol
    } : void 0;
    this._proxy.$setTunnelProvider(tunnelFeatures, true);
    return Promise.resolve(toDisposable(() => {
      this._forwardPortProvider = void 0;
      this._proxy.$setTunnelProvider(void 0, false);
    }));
  }
  hasTunnelProvider() {
    return this._proxy.$hasTunnelProvider();
  }
  /**
   * Applies the tunnel metadata and factory found in the remote authority
   * resolver to the tunnel system.
   *
   * `managedRemoteAuthority` should be be passed if the resolver returned on.
   * If this is the case, the tunnel cannot be connected to via a websocket from
   * the share process, so a synethic tunnel factory is used as a default.
   */
  async setTunnelFactory(provider, managedRemoteAuthority) {
    if (provider) {
      if (provider.candidatePortSource !== void 0) {
        this._proxy.$setCandidatePortSource(provider.candidatePortSource);
      }
      if (provider.showCandidatePort) {
        this._showCandidatePort = provider.showCandidatePort;
        this._proxy.$setCandidateFilter();
      }
      const tunnelFactory = provider.tunnelFactory ?? (managedRemoteAuthority ? this.makeManagedTunnelFactory(managedRemoteAuthority) : void 0);
      if (tunnelFactory) {
        this._forwardPortProvider = tunnelFactory;
        let privacyOptions = provider.tunnelFeatures?.privacyOptions ?? [];
        if (provider.tunnelFeatures?.public && privacyOptions.length === 0) {
          privacyOptions = [
            {
              id: "private",
              label: localize(5892, null),
              themeIcon: "lock"
            },
            {
              id: "public",
              label: localize(5893, null),
              themeIcon: "eye"
            }
          ];
        }
        const tunnelFeatures = provider.tunnelFeatures ? {
          elevation: !!provider.tunnelFeatures?.elevation,
          public: !!provider.tunnelFeatures?.public,
          privacyOptions,
          protocol: true
        } : void 0;
        this._proxy.$setTunnelProvider(tunnelFeatures, !!provider.tunnelFactory);
      }
    } else {
      this._forwardPortProvider = void 0;
    }
    return toDisposable(() => {
      this._forwardPortProvider = void 0;
    });
  }
  makeManagedTunnelFactory(_authority) {
    return void 0;
  }
  async $closeTunnel(remote, silent) {
    if (this._extensionTunnels.has(remote.host)) {
      const hostMap = this._extensionTunnels.get(remote.host);
      if (hostMap.has(remote.port)) {
        if (silent) {
          hostMap.get(remote.port).disposeListener.dispose();
        }
        await hostMap.get(remote.port).tunnel.dispose();
        hostMap.delete(remote.port);
      }
    }
  }
  async $onDidTunnelsChange() {
    this._onDidChangeTunnels.fire();
  }
  async $forwardPort(tunnelOptions, tunnelCreationOptions) {
    if (this._forwardPortProvider) {
      try {
        this.logService.trace("ForwardedPorts: (ExtHostTunnelService) Getting tunnel from provider.");
        const providedPort = this._forwardPortProvider(tunnelOptions, tunnelCreationOptions);
        this.logService.trace("ForwardedPorts: (ExtHostTunnelService) Got tunnel promise from provider.");
        if (providedPort !== void 0) {
          const tunnel = await providedPort;
          this.logService.trace("ForwardedPorts: (ExtHostTunnelService) Successfully awaited tunnel from provider.");
          if (tunnel === void 0) {
            this.logService.error("ForwardedPorts: (ExtHostTunnelService) Resolved tunnel is undefined");
            return void 0;
          }
          if (!this._extensionTunnels.has(tunnelOptions.remoteAddress.host)) {
            this._extensionTunnels.set(tunnelOptions.remoteAddress.host, /* @__PURE__ */ new Map());
          }
          const disposeListener = this._register(tunnel.onDidDispose(() => {
            this.logService.trace("ForwardedPorts: (ExtHostTunnelService) Extension fired tunnel's onDidDispose.");
            return this._proxy.$closeTunnel(tunnel.remoteAddress);
          }));
          this._extensionTunnels.get(tunnelOptions.remoteAddress.host).set(tunnelOptions.remoteAddress.port, { tunnel, disposeListener });
          return TunnelDtoConverter.fromApiTunnel(tunnel);
        } else {
          this.logService.trace("ForwardedPorts: (ExtHostTunnelService) Tunnel is undefined");
        }
      } catch (e) {
        this.logService.trace("ForwardedPorts: (ExtHostTunnelService) tunnel provider error");
        if (e instanceof Error) {
          return e.message;
        }
      }
    }
    return void 0;
  }
  async $applyCandidateFilter(candidates) {
    const filter2 = await Promise.all(candidates.map((candidate) => this._showCandidatePort(candidate.host, candidate.port, candidate.detail ?? "")));
    const result = candidates.filter((candidate, index) => filter2[index]);
    this.logService.trace(`ForwardedPorts: (ExtHostTunnelService) filtered from ${candidates.map((port) => port.port).join(", ")} to ${result.map((port) => port.port).join(", ")}`);
    return result;
  }
};

ExtHostTunnelService = __decorateClass([
  __decorateParam(0, IExtHostRpcService),
  __decorateParam(1, IExtHostInitDataService),
  __decorateParam(2, ILogService)
], ExtHostTunnelService);
export { ExtensionTunnel, TunnelDtoConverter, IExtHostTunnelService, ExtHostTunnelService };
