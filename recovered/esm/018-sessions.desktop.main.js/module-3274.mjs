// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/remote/browser/tunnelFactory.ts
import { Disposable } from "./module-0012.mjs";
import { forwardedPortsFeaturesEnabled } from "./module-1412.mjs";
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITunnelService } from "./module-1408.mjs";
import { IBrowserWorkbenchEnvironmentService } from "./module-0916.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IRemoteExplorerService } from "./module-1413.mjs";
import { ILogService } from "./module-0095.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/workbench/contrib/remote/browser/tunnelFactory.ts
var TunnelFactoryContribution = class extends Disposable {
  constructor(tunnelService, environmentService, openerService, remoteExplorerService, logService, contextKeyService) {
    super();
    this.openerService = openerService;
    const tunnelFactory = environmentService.options?.tunnelProvider?.tunnelFactory;
    if (tunnelFactory) {
      contextKeyService.createKey(forwardedPortsFeaturesEnabled.key, true);
      let privacyOptions = environmentService.options?.tunnelProvider?.features?.privacyOptions ?? [];
      if (environmentService.options?.tunnelProvider?.features?.public && privacyOptions.length === 0) {
        privacyOptions = [
          {
            id: "private",
            label: localize(18546, null),
            themeIcon: "lock"
          },
          {
            id: "public",
            label: localize(18547, null),
            themeIcon: "eye"
          }
        ];
      }
      this._register(tunnelService.setTunnelProvider({
        forwardPort: async (tunnelOptions, tunnelCreationOptions) => {
          let tunnelPromise;
          try {
            tunnelPromise = tunnelFactory(tunnelOptions, tunnelCreationOptions);
          } catch (e4) {
            logService.trace("tunnelFactory: tunnel provider error");
          }
          if (!tunnelPromise) {
            return void 0;
          }
          let tunnel;
          try {
            tunnel = await tunnelPromise;
          } catch (e4) {
            logService.trace("tunnelFactory: tunnel provider promise error");
            if (e4 instanceof Error) {
              return e4.message;
            }
            return void 0;
          }
          const localAddress = tunnel.localAddress.startsWith("http") ? tunnel.localAddress : `http://${tunnel.localAddress}`;
          const remoteTunnel = {
            tunnelRemotePort: tunnel.remoteAddress.port,
            tunnelRemoteHost: tunnel.remoteAddress.host,
            // The tunnel factory may give us an inaccessible local address.
            // To make sure this doesn't happen, resolve the uri immediately.
            localAddress: await this.resolveExternalUri(localAddress),
            privacy: tunnel.privacy ?? (tunnel.public ? "public" /* Public */ : "private" /* Private */),
            protocol: tunnel.protocol ?? "http" /* Http */,
            dispose: async () => {
              await tunnel.dispose();
            }
          };
          return remoteTunnel;
        }
      }));
      const tunnelInformation = environmentService.options?.tunnelProvider?.features ? {
        features: {
          elevation: !!environmentService.options?.tunnelProvider?.features?.elevation,
          public: !!environmentService.options?.tunnelProvider?.features?.public,
          privacyOptions,
          protocol: environmentService.options?.tunnelProvider?.features?.protocol === void 0 ? true : !!environmentService.options?.tunnelProvider?.features?.protocol
        }
      } : void 0;
      remoteExplorerService.setTunnelInformation(tunnelInformation);
    }
  }
  static {
    this.ID = "workbench.contrib.tunnelFactory";
  }
  async resolveExternalUri(uri4) {
    try {
      return (await this.openerService.resolveExternalUri(URI.parse(uri4))).resolved.toString();
    } catch {
      return uri4;
    }
  }
};

TunnelFactoryContribution = __decorateClass([
  __decorateParam(0, ITunnelService),
  __decorateParam(1, IBrowserWorkbenchEnvironmentService),
  __decorateParam(2, IOpenerService),
  __decorateParam(3, IRemoteExplorerService),
  __decorateParam(4, ILogService),
  __decorateParam(5, IContextKeyService)
], TunnelFactoryContribution);
export { TunnelFactoryContribution };
