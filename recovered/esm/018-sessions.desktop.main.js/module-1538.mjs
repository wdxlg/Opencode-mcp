// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/remote/browser/remoteExplorer.ts
import { ITunnelService, isAllInterfaces, isLocalhost } from "./module-1408.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions13 } from "./module-1094.mjs";
import { IRemoteExplorerService, PORT_AUTO_FALLBACK_SETTING, PORT_AUTO_FORWARD_SETTING, PORT_AUTO_SOURCE_SETTING, PORT_AUTO_SOURCE_SETTING_HYBRID, PORT_AUTO_SOURCE_SETTING_OUTPUT, PORT_AUTO_SOURCE_SETTING_PROCESS, TUNNEL_VIEW_CONTAINER_ID, TUNNEL_VIEW_ID } from "./module-1413.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ForwardPortAction, OpenPortInBrowserAction, OpenPortInPreviewAction, TunnelPanel, TunnelPanelDescriptor, TunnelViewModel, openPreviewEnabledContext } from "./module-1536.mjs";
import { Event2 } from "./module-0017.mjs";
import { portsViewIcon } from "./module-1535.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { ViewPaneContainer } from "./module-1381.mjs";
import { AutoTunnelSource, forwardedPortsFeaturesEnabled, forwardedPortsViewEnabled, makeAddress, mapHasAddressLocalhostOrAllInterfaces } from "./module-1412.mjs";
import { IActivityService, NumberBadge } from "./module-1448.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IStatusbarService } from "./module-0895.mjs";
import { ILogService } from "./module-0095.mjs";
import { severity_default } from "./module-0266.mjs";
import { toAction } from "./module-0082.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { ITerminalService } from "./module-1150.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IExternalUriOpenerService } from "./module-1294.mjs";
import { IWorkbenchConfigurationService } from "./module-1198.mjs";
import { IDebugService } from "./module-1058.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { IHostService } from "./module-1118.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IPreferencesService } from "./module-1293.mjs";
import { isWeb } from "./module-0014.mjs";
import { UrlFinder } from "./module-1537.mjs";


// src/vs/workbench/contrib/remote/browser/remoteExplorer.ts
var VIEWLET_ID5 = "workbench.view.remote";

var TOGGLE_VIEW_ACTION_ID = "remoteExplorer.toggleForwardedPortsView";

function isCandidateRemappedTunnelLocalEndpoint(candidate, tunnels) {
  if (!isLocalhost(candidate.host) && !isAllInterfaces(candidate.host)) {
    return false;
  }
  for (const tunnel of tunnels) {
    if (tunnel.localPort === candidate.port && tunnel.remotePort !== candidate.port) {
      return true;
    }
  }
  return false;
}

var ForwardedPortsView = class extends Disposable {
  constructor(contextKeyService, environmentService, remoteExplorerService, tunnelService, activityService, statusbarService) {
    super();
    this.contextKeyService = contextKeyService;
    this.environmentService = environmentService;
    this.remoteExplorerService = remoteExplorerService;
    this.tunnelService = tunnelService;
    this.activityService = activityService;
    this.statusbarService = statusbarService;
    this.contextKeyListener = this._register(new MutableDisposable());
    this.activityBadge = this._register(new MutableDisposable());
    this.hasPortsInSession = false;
    this._register(Registry.as(Extensions13.ViewsRegistry).registerViewWelcomeContent(TUNNEL_VIEW_ID, {
      content: this.environmentService.remoteAuthority ? localize(18502, null, `command:${ForwardPortAction.INLINE_ID}`) : localize(18490, null, `command:${ForwardPortAction.INLINE_ID}`)
    }));
    this.enableBadgeAndStatusBar();
    this.enableForwardedPortsFeatures();
    if (!this.environmentService.remoteAuthority) {
      this._register(Event2.once(this.tunnelService.onTunnelOpened)(() => {
        this.hasPortsInSession = true;
      }));
    }
  }
  async getViewContainer() {
    return Registry.as(Extensions13.ViewContainersRegistry).registerViewContainer({
      id: TUNNEL_VIEW_CONTAINER_ID,
      title: localize2(18491, "Ports"),
      icon: portsViewIcon,
      ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [TUNNEL_VIEW_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]),
      storageId: TUNNEL_VIEW_CONTAINER_ID,
      hideIfEmpty: true,
      order: 5
    }, 1 /* Panel */);
  }
  async enableForwardedPortsFeatures() {
    this.contextKeyListener.clear();
    const featuresEnabled = !!forwardedPortsFeaturesEnabled.getValue(this.contextKeyService);
    const viewEnabled = !!forwardedPortsViewEnabled.getValue(this.contextKeyService);
    if (featuresEnabled || viewEnabled) {
      if (!viewEnabled) {
        this.contextKeyService.createKey(forwardedPortsViewEnabled.key, true);
      }
      const viewContainer = await this.getViewContainer();
      const tunnelPanelDescriptor = new TunnelPanelDescriptor(new TunnelViewModel(this.remoteExplorerService, this.tunnelService), this.environmentService);
      const viewsRegistry6 = Registry.as(Extensions13.ViewsRegistry);
      if (viewContainer) {
        this.remoteExplorerService.enablePortsFeatures(!featuresEnabled);
        viewsRegistry6.registerViews([tunnelPanelDescriptor], viewContainer);
      }
    } else {
      this.contextKeyListener.value = this.contextKeyService.onDidChangeContext((e4) => {
        if (e4.affectsSome(/* @__PURE__ */ new Set([...forwardedPortsFeaturesEnabled.keys(), ...forwardedPortsViewEnabled.keys()]))) {
          this.enableForwardedPortsFeatures();
        }
      });
    }
  }
  enableBadgeAndStatusBar() {
    const disposable = Registry.as(Extensions13.ViewsRegistry).onViewsRegistered((e4) => {
      if (e4.find((view) => view.views.find((viewDescriptor3) => viewDescriptor3.id === TUNNEL_VIEW_ID))) {
        this._register(Event2.debounce(this.remoteExplorerService.tunnelModel.onForwardPort, (_last, e5) => e5, 50)(() => {
          this.updateActivityBadge();
          this.updateStatusBar();
        }));
        this._register(Event2.debounce(this.remoteExplorerService.tunnelModel.onClosePort, (_last, e5) => e5, 50)(() => {
          this.updateActivityBadge();
          this.updateStatusBar();
        }));
        this.updateActivityBadge();
        this.updateStatusBar();
        disposable.dispose();
      }
    });
  }
  async updateActivityBadge() {
    if (this.remoteExplorerService.tunnelModel.forwarded.size > 0) {
      this.activityBadge.value = this.activityService.showViewActivity(TUNNEL_VIEW_ID, {
        badge: new NumberBadge(this.remoteExplorerService.tunnelModel.forwarded.size, (n2) => n2 === 1 ? localize(18488, null) : localize(18489, null, n2))
      });
    } else {
      this.activityBadge.clear();
    }
  }
  updateStatusBar() {
    if (!this.environmentService.remoteAuthority && !this.hasPortsInSession) {
      return;
    }
    if (!this.entryAccessor) {
      this._register(this.entryAccessor = this.statusbarService.addEntry(this.entry, "status.forwardedPorts", 0 /* LEFT */, 40));
    } else {
      this.entryAccessor.update(this.entry);
    }
  }
  get entry() {
    let tooltip;
    const count2 = this.remoteExplorerService.tunnelModel.forwarded.size + this.remoteExplorerService.tunnelModel.detected.size;
    const text2 = `${count2}`;
    if (count2 === 0) {
      tooltip = localize(18495, null);
    } else {
      const allTunnels = Array.from(this.remoteExplorerService.tunnelModel.forwarded.values());
      allTunnels.push(...Array.from(this.remoteExplorerService.tunnelModel.detected.values()));
      tooltip = localize(
        18496,
        null,
        allTunnels.map((forwarded) => forwarded.remotePort).join(", ")
      );
    }
    return {
      name: localize(18503, null),
      text: `$(radio-tower) ${text2}`,
      ariaLabel: tooltip,
      tooltip,
      command: TOGGLE_VIEW_ACTION_ID
    };
  }
};

ForwardedPortsView = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IWorkbenchEnvironmentService),
  __decorateParam(2, IRemoteExplorerService),
  __decorateParam(3, ITunnelService),
  __decorateParam(4, IActivityService),
  __decorateParam(5, IStatusbarService)
], ForwardedPortsView);

var PortRestore = class {
  constructor(remoteExplorerService, logService) {
    this.remoteExplorerService = remoteExplorerService;
    this.logService = logService;
    if (!this.remoteExplorerService.tunnelModel.environmentTunnelsSet) {
      Event2.once(this.remoteExplorerService.tunnelModel.onEnvironmentTunnelsSet)(async () => {
        await this.restore();
      });
    } else {
      this.restore();
    }
  }
  async restore() {
    this.logService.trace("ForwardedPorts: Doing first restore.");
    return this.remoteExplorerService.restore();
  }
};

PortRestore = __decorateClass([
  __decorateParam(0, IRemoteExplorerService),
  __decorateParam(1, ILogService)
], PortRestore);

var AutomaticPortForwarding = class extends Disposable {
  constructor(terminalService, notificationService, openerService, externalOpenerService, remoteExplorerService, environmentService, contextKeyService, configurationService, debugService, remoteAgentService, tunnelService, hostService, logService, storageService, preferencesService) {
    super();
    this.terminalService = terminalService;
    this.notificationService = notificationService;
    this.openerService = openerService;
    this.externalOpenerService = externalOpenerService;
    this.remoteExplorerService = remoteExplorerService;
    this.contextKeyService = contextKeyService;
    this.configurationService = configurationService;
    this.debugService = debugService;
    this.tunnelService = tunnelService;
    this.hostService = hostService;
    this.logService = logService;
    this.storageService = storageService;
    this.preferencesService = preferencesService;
    if (!environmentService.remoteAuthority) {
      return;
    }
    configurationService.whenRemoteConfigurationLoaded().then(() => remoteAgentService.getEnvironment()).then((environment) => {
      this.setup(environment);
      this._register(configurationService.onDidChangeConfiguration((e4) => {
        if (e4.affectsConfiguration(PORT_AUTO_SOURCE_SETTING)) {
          this.setup(environment);
        } else if (e4.affectsConfiguration(PORT_AUTO_FALLBACK_SETTING) && !this.portListener) {
          this.listenForPorts();
        }
      }));
    });
    if (!this.storageService.getBoolean("processPortForwardingFallback", 1 /* WORKSPACE */, true)) {
      this.configurationService.updateValue(PORT_AUTO_FALLBACK_SETTING, 0, 5 /* WORKSPACE */);
    }
  }
  getPortAutoFallbackNumber() {
    const fallbackAt = this.configurationService.inspect(PORT_AUTO_FALLBACK_SETTING);
    if (fallbackAt.value !== void 0 && (fallbackAt.value === 0 || fallbackAt.value !== fallbackAt.defaultValue)) {
      return fallbackAt.value;
    }
    const inspectSource = this.configurationService.inspect(PORT_AUTO_SOURCE_SETTING);
    if (inspectSource.applicationValue === PORT_AUTO_SOURCE_SETTING_PROCESS || inspectSource.userValue === PORT_AUTO_SOURCE_SETTING_PROCESS || inspectSource.userLocalValue === PORT_AUTO_SOURCE_SETTING_PROCESS || inspectSource.userRemoteValue === PORT_AUTO_SOURCE_SETTING_PROCESS || inspectSource.workspaceFolderValue === PORT_AUTO_SOURCE_SETTING_PROCESS || inspectSource.workspaceValue === PORT_AUTO_SOURCE_SETTING_PROCESS) {
      return 0;
    }
    return fallbackAt.value ?? 20;
  }
  listenForPorts() {
    let fallbackAt = this.getPortAutoFallbackNumber();
    if (fallbackAt === 0) {
      this.portListener?.dispose();
      return;
    }
    if (this.procForwarder && !this.portListener && this.configurationService.getValue(PORT_AUTO_SOURCE_SETTING) === PORT_AUTO_SOURCE_SETTING_PROCESS) {
      this.portListener = this._register(this.remoteExplorerService.tunnelModel.onForwardPort(async () => {
        fallbackAt = this.getPortAutoFallbackNumber();
        if (fallbackAt === 0) {
          this.portListener?.dispose();
          return;
        }
        if (Array.from(this.remoteExplorerService.tunnelModel.forwarded.values()).filter((tunnel) => tunnel.source.source === 1 /* Auto */).length > fallbackAt) {
          await this.configurationService.updateValue(PORT_AUTO_SOURCE_SETTING, PORT_AUTO_SOURCE_SETTING_HYBRID);
          this.notificationService.notify({
            message: localize(18492, null),
            severity: severity_default.Warning,
            actions: {
              primary: [
                toAction({
                  id: "switchBack",
                  label: localize(18494, null),
                  run: async () => {
                    await this.configurationService.updateValue(PORT_AUTO_SOURCE_SETTING, PORT_AUTO_SOURCE_SETTING_PROCESS);
                    await this.configurationService.updateValue(PORT_AUTO_FALLBACK_SETTING, 0, 5 /* WORKSPACE */);
                    this.portListener?.dispose();
                    this.portListener = void 0;
                  }
                }),
                toAction({
                  id: "showPortSourceSetting",
                  label: localize(18493, null),
                  run: async () => {
                    await this.preferencesService.openSettings({
                      query: "remote.autoForwardPortsSource"
                    });
                  }
                })
              ]
            }
          });
        }
      }));
    } else {
      this.portListener?.dispose();
      this.portListener = void 0;
    }
  }
  setup(environment) {
    const alreadyForwarded2 = this.procForwarder?.forwarded;
    const isSwitch = this.outputForwarder || this.procForwarder;
    this.procForwarder?.dispose();
    this.procForwarder = void 0;
    this.outputForwarder?.dispose();
    this.outputForwarder = void 0;
    if (environment?.os !== 3 /* Linux */) {
      if (this.configurationService.inspect(PORT_AUTO_SOURCE_SETTING).default?.value !== PORT_AUTO_SOURCE_SETTING_OUTPUT) {
        Registry.as(Extensions4.Configuration).registerDefaultConfigurations([{ overrides: { "remote.autoForwardPortsSource": PORT_AUTO_SOURCE_SETTING_OUTPUT } }]);
      }
      this.outputForwarder = this._register(new OutputAutomaticPortForwarding(
        this.terminalService,
        this.notificationService,
        this.openerService,
        this.externalOpenerService,
        this.remoteExplorerService,
        this.configurationService,
        this.debugService,
        this.tunnelService,
        this.hostService,
        this.logService,
        this.contextKeyService,
        () => false
      ));
    } else {
      const useProc = () => this.configurationService.getValue(PORT_AUTO_SOURCE_SETTING) === PORT_AUTO_SOURCE_SETTING_PROCESS;
      if (useProc()) {
        this.procForwarder = this._register(new ProcAutomaticPortForwarding(
          false,
          alreadyForwarded2,
          !isSwitch,
          this.configurationService,
          this.remoteExplorerService,
          this.notificationService,
          this.openerService,
          this.externalOpenerService,
          this.tunnelService,
          this.hostService,
          this.logService,
          this.contextKeyService
        ));
      } else if (this.configurationService.getValue(PORT_AUTO_SOURCE_SETTING) === PORT_AUTO_SOURCE_SETTING_HYBRID) {
        this.procForwarder = this._register(new ProcAutomaticPortForwarding(
          true,
          alreadyForwarded2,
          !isSwitch,
          this.configurationService,
          this.remoteExplorerService,
          this.notificationService,
          this.openerService,
          this.externalOpenerService,
          this.tunnelService,
          this.hostService,
          this.logService,
          this.contextKeyService
        ));
      }
      this.outputForwarder = this._register(new OutputAutomaticPortForwarding(
        this.terminalService,
        this.notificationService,
        this.openerService,
        this.externalOpenerService,
        this.remoteExplorerService,
        this.configurationService,
        this.debugService,
        this.tunnelService,
        this.hostService,
        this.logService,
        this.contextKeyService,
        useProc
      ));
    }
    this.listenForPorts();
  }
};

AutomaticPortForwarding = __decorateClass([
  __decorateParam(0, ITerminalService),
  __decorateParam(1, INotificationService),
  __decorateParam(2, IOpenerService),
  __decorateParam(3, IExternalUriOpenerService),
  __decorateParam(4, IRemoteExplorerService),
  __decorateParam(5, IWorkbenchEnvironmentService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IWorkbenchConfigurationService),
  __decorateParam(8, IDebugService),
  __decorateParam(9, IRemoteAgentService),
  __decorateParam(10, ITunnelService),
  __decorateParam(11, IHostService),
  __decorateParam(12, ILogService),
  __decorateParam(13, IStorageService),
  __decorateParam(14, IPreferencesService)
], AutomaticPortForwarding);

var OnAutoForwardedAction = class _OnAutoForwardedAction extends Disposable {
  constructor(notificationService, remoteExplorerService, openerService, externalOpenerService, tunnelService, hostService, logService, contextKeyService) {
    super();
    this.notificationService = notificationService;
    this.remoteExplorerService = remoteExplorerService;
    this.openerService = openerService;
    this.externalOpenerService = externalOpenerService;
    this.tunnelService = tunnelService;
    this.hostService = hostService;
    this.logService = logService;
    this.contextKeyService = contextKeyService;
    this.notificationDisposable = this._register(new MutableDisposable());
    this.alreadyOpenedOnce = /* @__PURE__ */ new Set();
    this.lastNotifyTime = /* @__PURE__ */ new Date();
    this.lastNotifyTime.setFullYear(this.lastNotifyTime.getFullYear() - 1);
  }
  static {
    this.NOTIFY_COOL_DOWN = 5e3;
  }
  async doAction(tunnels) {
    this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Starting action for ${tunnels[0]?.tunnelRemotePort}`);
    this.doActionTunnels = tunnels;
    const tunnel = await this.portNumberHeuristicDelay();
    this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Heuristic chose ${tunnel?.tunnelRemotePort}`);
    if (tunnel) {
      const allAttributes = await this.remoteExplorerService.tunnelModel.getAttributes([{ port: tunnel.tunnelRemotePort, host: tunnel.tunnelRemoteHost }]);
      const attributes = allAttributes?.get(tunnel.tunnelRemotePort)?.onAutoForward;
      this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) onAutoForward action is ${attributes}`);
      switch (attributes) {
        case "openBrowserOnce" /* OpenBrowserOnce */: {
          if (this.alreadyOpenedOnce.has(tunnel.localAddress)) {
            break;
          }
          this.alreadyOpenedOnce.add(tunnel.localAddress);
        }
        case "openBrowser" /* OpenBrowser */: {
          const address = makeAddress(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
          await OpenPortInBrowserAction.run(this.remoteExplorerService.tunnelModel, this.openerService, address);
          break;
        }
        case "openPreview" /* OpenPreview */: {
          const address = makeAddress(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
          await OpenPortInPreviewAction.run(this.remoteExplorerService.tunnelModel, this.openerService, this.externalOpenerService, address);
          break;
        }
        case "silent" /* Silent */:
          break;
        default: {
          const elapsed = (/* @__PURE__ */ new Date()).getTime() - this.lastNotifyTime.getTime();
          this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) time elapsed since last notification ${elapsed} ms`);
          if (elapsed > _OnAutoForwardedAction.NOTIFY_COOL_DOWN) {
            await this.showNotification(tunnel);
          }
        }
      }
    }
  }
  hide(removedPorts) {
    if (this.doActionTunnels) {
      this.doActionTunnels = this.doActionTunnels.filter((value2) => !removedPorts.includes(value2.tunnelRemotePort));
    }
    if (this.lastShownPort && removedPorts.indexOf(this.lastShownPort) >= 0) {
      this.lastNotification?.close();
    }
  }
  async portNumberHeuristicDelay() {
    this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Starting heuristic delay`);
    if (!this.doActionTunnels || this.doActionTunnels.length === 0) {
      return;
    }
    this.doActionTunnels = this.doActionTunnels.sort((a, b) => a.tunnelRemotePort - b.tunnelRemotePort);
    const firstTunnel = this.doActionTunnels.shift();
    if (firstTunnel.tunnelRemotePort % 1e3 === 0) {
      this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Heuristic chose tunnel because % 1000: ${firstTunnel.tunnelRemotePort}`);
      this.newerTunnel = firstTunnel;
      return firstTunnel;
    } else if (firstTunnel.tunnelRemotePort < 1e4 && firstTunnel.tunnelRemotePort !== 9229) {
      this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Heuristic chose tunnel because < 10000: ${firstTunnel.tunnelRemotePort}`);
      this.newerTunnel = firstTunnel;
      return firstTunnel;
    }
    this.logService.trace(`ForwardedPorts: (OnAutoForwardedAction) Waiting for "better" tunnel than ${firstTunnel.tunnelRemotePort}`);
    this.newerTunnel = void 0;
    return new Promise((resolve3) => {
      setTimeout(() => {
        if (this.newerTunnel) {
          resolve3(void 0);
        } else if (this.doActionTunnels?.includes(firstTunnel)) {
          resolve3(firstTunnel);
        } else {
          resolve3(void 0);
        }
      }, 3e3);
    });
  }
  async basicMessage(tunnel) {
    const properties = await this.remoteExplorerService.tunnelModel.getAttributes([{ host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort }], false);
    const label3 = properties?.get(tunnel.tunnelRemotePort)?.label;
    return localize(
      18497,
      null,
      label3 ? ` (${label3})` : "",
      tunnel.tunnelRemotePort
    );
  }
  linkMessage() {
    return localize(
      18501,
      null,
      `command:${TunnelPanel.ID}.focus`
    );
  }
  async showNotification(tunnel) {
    if (!await this.hostService.hadLastFocus()) {
      return;
    }
    this.lastNotification?.close();
    let message = await this.basicMessage(tunnel);
    const choices = [this.openBrowserChoice(tunnel)];
    if (!isWeb || openPreviewEnabledContext.getValue(this.contextKeyService)) {
      choices.push(this.openPreviewChoice(tunnel));
    }
    if (tunnel.tunnelLocalPort !== tunnel.tunnelRemotePort && this.tunnelService.canElevate && this.tunnelService.isPortPrivileged(tunnel.tunnelRemotePort)) {
      message += localize(18499, null, tunnel.tunnelRemotePort);
      choices.unshift(this.elevateChoice(tunnel));
    }
    if (tunnel.privacy === "private" /* Private */ && isWeb && this.tunnelService.canChangePrivacy) {
      choices.push(this.makePublicChoice(tunnel));
    }
    message += this.linkMessage();
    this.lastNotification = this.notificationService.prompt(severity_default.Info, message, choices, { neverShowAgain: { id: "remote.tunnelsView.autoForwardNeverShow", isSecondary: true } });
    this.lastShownPort = tunnel.tunnelRemotePort;
    this.lastNotifyTime = /* @__PURE__ */ new Date();
    this.notificationDisposable.value = this.lastNotification.onDidClose(() => {
      this.lastNotification = void 0;
      this.lastShownPort = void 0;
    });
  }
  makePublicChoice(tunnel) {
    return {
      label: localize(18500, null),
      run: async () => {
        const oldTunnelDetails = mapHasAddressLocalhostOrAllInterfaces(this.remoteExplorerService.tunnelModel.forwarded, tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
        await this.remoteExplorerService.close({ host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort }, "Other" /* Other */);
        return this.remoteExplorerService.forward({
          remote: { host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort },
          local: tunnel.tunnelLocalPort,
          name: oldTunnelDetails?.name,
          elevateIfNeeded: true,
          privacy: "public" /* Public */,
          source: oldTunnelDetails?.source
        });
      }
    };
  }
  openBrowserChoice(tunnel) {
    const address = makeAddress(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
    return {
      label: OpenPortInBrowserAction.LABEL,
      run: () => OpenPortInBrowserAction.run(this.remoteExplorerService.tunnelModel, this.openerService, address)
    };
  }
  openPreviewChoice(tunnel) {
    const address = makeAddress(tunnel.tunnelRemoteHost, tunnel.tunnelRemotePort);
    return {
      label: OpenPortInPreviewAction.LABEL,
      run: () => OpenPortInPreviewAction.run(this.remoteExplorerService.tunnelModel, this.openerService, this.externalOpenerService, address)
    };
  }
  elevateChoice(tunnel) {
    return {
      // Privileged ports are not on Windows, so it's ok to stick to just "sudo".
      label: localize(18498, null, tunnel.tunnelRemotePort),
      run: async () => {
        await this.remoteExplorerService.close({ host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort }, "Other" /* Other */);
        const newTunnel = await this.remoteExplorerService.forward({
          remote: { host: tunnel.tunnelRemoteHost, port: tunnel.tunnelRemotePort },
          local: tunnel.tunnelRemotePort,
          elevateIfNeeded: true,
          source: AutoTunnelSource
        });
        if (!newTunnel || typeof newTunnel === "string") {
          return;
        }
        this.lastNotification?.close();
        this.lastShownPort = newTunnel.tunnelRemotePort;
        this.lastNotification = this.notificationService.prompt(
          severity_default.Info,
          await this.basicMessage(newTunnel) + this.linkMessage(),
          [this.openBrowserChoice(newTunnel), this.openPreviewChoice(tunnel)],
          { neverShowAgain: { id: "remote.tunnelsView.autoForwardNeverShow", isSecondary: true } }
        );
        this.notificationDisposable.value = this.lastNotification.onDidClose(() => {
          this.lastNotification = void 0;
          this.lastShownPort = void 0;
        });
      }
    };
  }
};

var OutputAutomaticPortForwarding = class extends Disposable {
  constructor(terminalService, notificationService, openerService, externalOpenerService, remoteExplorerService, configurationService, debugService, tunnelService, hostService, logService, contextKeyService, privilegedOnly) {
    super();
    this.terminalService = terminalService;
    this.notificationService = notificationService;
    this.openerService = openerService;
    this.externalOpenerService = externalOpenerService;
    this.remoteExplorerService = remoteExplorerService;
    this.configurationService = configurationService;
    this.debugService = debugService;
    this.tunnelService = tunnelService;
    this.hostService = hostService;
    this.logService = logService;
    this.contextKeyService = contextKeyService;
    this.privilegedOnly = privilegedOnly;
    this.notifier = new OnAutoForwardedAction(notificationService, remoteExplorerService, openerService, externalOpenerService, tunnelService, hostService, logService, contextKeyService);
    this._register(configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(PORT_AUTO_FORWARD_SETTING)) {
        this.tryStartStopUrlFinder();
      }
    }));
    this.portsFeatures = this._register(this.remoteExplorerService.onEnabledPortsFeatures(() => {
      this.tryStartStopUrlFinder();
    }));
    this.tryStartStopUrlFinder();
    if (configurationService.getValue(PORT_AUTO_SOURCE_SETTING) === PORT_AUTO_SOURCE_SETTING_HYBRID) {
      this._register(this.tunnelService.onTunnelClosed((tunnel) => this.notifier.hide([tunnel.port])));
    }
  }
  tryStartStopUrlFinder() {
    if (this.configurationService.getValue(PORT_AUTO_FORWARD_SETTING)) {
      this.startUrlFinder();
    } else {
      this.stopUrlFinder();
    }
  }
  startUrlFinder() {
    if (!this.urlFinder && this.remoteExplorerService.portsFeaturesEnabled !== 2 /* AdditionalFeatures */) {
      return;
    }
    this.portsFeatures?.dispose();
    this.urlFinder = this._register(new UrlFinder(this.terminalService, this.debugService));
    this._register(this.urlFinder.onDidMatchLocalUrl(async (localUrl) => {
      if (mapHasAddressLocalhostOrAllInterfaces(this.remoteExplorerService.tunnelModel.detected, localUrl.host, localUrl.port)) {
        return;
      }
      const attributes = (await this.remoteExplorerService.tunnelModel.getAttributes([localUrl]))?.get(localUrl.port);
      if (attributes?.onAutoForward === "ignore" /* Ignore */) {
        return;
      }
      if (this.privilegedOnly() && !this.tunnelService.isPortPrivileged(localUrl.port)) {
        return;
      }
      const forwarded = await this.remoteExplorerService.forward({ remote: localUrl, source: AutoTunnelSource }, attributes ?? null);
      if (forwarded && typeof forwarded !== "string") {
        this.notifier.doAction([forwarded]);
      }
    }));
  }
  stopUrlFinder() {
    if (this.urlFinder) {
      this.urlFinder.dispose();
      this.urlFinder = void 0;
    }
  }
};

var ProcAutomaticPortForwarding = class extends Disposable {
  constructor(unforwardOnly, alreadyAutoForwarded, needsInitialCandidates, configurationService, remoteExplorerService, notificationService, openerService, externalOpenerService, tunnelService, hostService, logService, contextKeyService) {
    super();
    this.unforwardOnly = unforwardOnly;
    this.alreadyAutoForwarded = alreadyAutoForwarded;
    this.needsInitialCandidates = needsInitialCandidates;
    this.configurationService = configurationService;
    this.remoteExplorerService = remoteExplorerService;
    this.notificationService = notificationService;
    this.openerService = openerService;
    this.externalOpenerService = externalOpenerService;
    this.tunnelService = tunnelService;
    this.hostService = hostService;
    this.logService = logService;
    this.contextKeyService = contextKeyService;
    this.autoForwarded = /* @__PURE__ */ new Set();
    this.notifiedOnly = /* @__PURE__ */ new Set();
    this.initialCandidates = /* @__PURE__ */ new Set();
    this.notifier = new OnAutoForwardedAction(notificationService, remoteExplorerService, openerService, externalOpenerService, tunnelService, hostService, logService, contextKeyService);
    alreadyAutoForwarded?.forEach((port) => this.autoForwarded.add(port));
    this.initialize();
  }
  get forwarded() {
    return this.autoForwarded;
  }
  async initialize() {
    if (!this.remoteExplorerService.tunnelModel.environmentTunnelsSet) {
      await new Promise((resolve3) => this.remoteExplorerService.tunnelModel.onEnvironmentTunnelsSet(() => resolve3()));
    }
    this._register(this.configurationService.onDidChangeConfiguration(async (e4) => {
      if (e4.affectsConfiguration(PORT_AUTO_FORWARD_SETTING)) {
        await this.startStopCandidateListener();
      }
    }));
    this.portsFeatures = this._register(this.remoteExplorerService.onEnabledPortsFeatures(async () => {
      await this.startStopCandidateListener();
    }));
    this.startStopCandidateListener();
  }
  async startStopCandidateListener() {
    if (this.configurationService.getValue(PORT_AUTO_FORWARD_SETTING)) {
      await this.startCandidateListener();
    } else {
      this.stopCandidateListener();
    }
  }
  stopCandidateListener() {
    if (this.candidateListener) {
      this.candidateListener.dispose();
      this.candidateListener = void 0;
    }
  }
  async startCandidateListener() {
    if (this.candidateListener || this.remoteExplorerService.portsFeaturesEnabled !== 2 /* AdditionalFeatures */) {
      return;
    }
    this.portsFeatures?.dispose();
    await this.setInitialCandidates();
    if (this.configurationService.getValue(PORT_AUTO_FORWARD_SETTING)) {
      this.candidateListener = this._register(this.remoteExplorerService.tunnelModel.onCandidatesChanged(this.handleCandidateUpdate, this));
    }
  }
  async setInitialCandidates() {
    if (!this.needsInitialCandidates) {
      this.logService.debug(`ForwardedPorts: (ProcForwarding) Not setting initial candidates`);
      return;
    }
    let startingCandidates = this.remoteExplorerService.tunnelModel.candidatesOrUndefined;
    if (!startingCandidates) {
      await new Promise((resolve3) => this.remoteExplorerService.tunnelModel.onCandidatesChanged(() => resolve3()));
      startingCandidates = this.remoteExplorerService.tunnelModel.candidates;
    }
    for (const value2 of startingCandidates) {
      this.initialCandidates.add(makeAddress(value2.host, value2.port));
    }
    this.logService.debug(`ForwardedPorts: (ProcForwarding) Initial candidates set to ${startingCandidates.map((candidate) => candidate.port).join(", ")}`);
  }
  async forwardCandidates() {
    let attributes;
    const allTunnels = [];
    this.logService.trace(`ForwardedPorts: (ProcForwarding) Attempting to forward ${this.remoteExplorerService.tunnelModel.candidates.length} candidates`);
    for (const value2 of this.remoteExplorerService.tunnelModel.candidates) {
      if (!value2.detail) {
        this.logService.trace(`ForwardedPorts: (ProcForwarding) Port ${value2.port} missing detail`);
        continue;
      }
      if (isCandidateRemappedTunnelLocalEndpoint(value2, this.remoteExplorerService.tunnelModel.forwarded.values())) {
        this.logService.trace(`ForwardedPorts: (ProcForwarding) Port ${value2.port} is the local port of a forwarded tunnel`);
        continue;
      }
      if (!attributes) {
        attributes = await this.remoteExplorerService.tunnelModel.getAttributes(this.remoteExplorerService.tunnelModel.candidates);
      }
      const portAttributes = attributes?.get(value2.port);
      const address = makeAddress(value2.host, value2.port);
      if (this.initialCandidates.has(address) && portAttributes?.onAutoForward === void 0) {
        continue;
      }
      if (this.notifiedOnly.has(address) || this.autoForwarded.has(address)) {
        continue;
      }
      const alreadyForwarded2 = mapHasAddressLocalhostOrAllInterfaces(this.remoteExplorerService.tunnelModel.forwarded, value2.host, value2.port);
      if (mapHasAddressLocalhostOrAllInterfaces(this.remoteExplorerService.tunnelModel.detected, value2.host, value2.port)) {
        continue;
      }
      if (portAttributes?.onAutoForward === "ignore" /* Ignore */) {
        this.logService.trace(`ForwardedPorts: (ProcForwarding) Port ${value2.port} is ignored`);
        continue;
      }
      const forwarded = await this.remoteExplorerService.forward({ remote: value2, source: AutoTunnelSource }, portAttributes ?? null);
      if (!alreadyForwarded2 && forwarded) {
        this.logService.trace(`ForwardedPorts: (ProcForwarding) Port ${value2.port} has been forwarded`);
        this.autoForwarded.add(address);
      } else if (forwarded) {
        this.logService.trace(`ForwardedPorts: (ProcForwarding) Port ${value2.port} has been notified`);
        this.notifiedOnly.add(address);
      }
      if (forwarded && typeof forwarded !== "string") {
        allTunnels.push(forwarded);
      }
    }
    this.logService.trace(`ForwardedPorts: (ProcForwarding) Forwarded ${allTunnels.length} candidates`);
    if (allTunnels.length === 0) {
      return void 0;
    }
    return allTunnels;
  }
  async handleCandidateUpdate(removed) {
    const removedPorts = [];
    let autoForwarded;
    if (this.unforwardOnly) {
      autoForwarded = /* @__PURE__ */ new Map();
      for (const entry of this.remoteExplorerService.tunnelModel.forwarded.entries()) {
        if (entry[1].source.source === 1 /* Auto */) {
          autoForwarded.set(entry[0], entry[1]);
        }
      }
    } else {
      autoForwarded = new Map(this.autoForwarded.entries());
    }
    for (const removedPort of removed) {
      const key3 = removedPort[0];
      let value2 = removedPort[1];
      const forwardedValue = mapHasAddressLocalhostOrAllInterfaces(autoForwarded, value2.host, value2.port);
      if (forwardedValue) {
        if (typeof forwardedValue === "string") {
          this.autoForwarded.delete(key3);
        } else {
          value2 = { host: forwardedValue.remoteHost, port: forwardedValue.remotePort };
        }
        await this.remoteExplorerService.close(value2, "AutoForwardEnd" /* AutoForwardEnd */);
        removedPorts.push(value2.port);
      } else if (this.notifiedOnly.delete(key3)) {
        removedPorts.push(value2.port);
      } else {
        this.initialCandidates.delete(key3);
      }
    }
    if (this.unforwardOnly) {
      return;
    }
    if (removedPorts.length > 0) {
      await this.notifier.hide(removedPorts);
    }
    const tunnels = await this.forwardCandidates();
    if (tunnels) {
      await this.notifier.doAction(tunnels);
    }
  }
};
export { isCandidateRemappedTunnelLocalEndpoint, VIEWLET_ID5, TOGGLE_VIEW_ACTION_ID, ForwardedPortsView, PortRestore, AutomaticPortForwarding, OnAutoForwardedAction, OutputAutomaticPortForwarding, ProcAutomaticPortForwarding };
