// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/remote/browser/remoteIndicator.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { Action2, IMenuService, MenuId, MenuItemAction, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { PlatformToString, isWeb, platform } from "./module-0014.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IsSessionsWindowContext, RemoteNameContext, VirtualWorkspaceContext } from "./module-0949.mjs";
import { IExtensionsWorkbenchService, LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID } from "./module-1022.mjs";
import { DomEmitter } from "./module-0262.mjs";
import { mainWindow } from "./module-0002.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { getVirtualWorkspaceLocation } from "./module-0936.mjs";
import { RunOnceScheduler, retry } from "./module-0036.mjs";
import { IRemoteAgentService, remoteConnectionLatencyMeasurer } from "./module-0937.mjs";
import { getRemoteName } from "./module-0687.mjs";
import { truncate } from "./module-0030.mjs";
import { Schemas } from "./module-0033.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { getCodiconAriaLabel } from "./module-0461.mjs";
import { EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT, IExtensionGalleryService, IExtensionManagementService } from "./module-0872.mjs";
import { severity_default } from "./module-0266.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { infoIcon } from "./module-1875.mjs";
import { ReloadWindowAction } from "./module-1520.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStatusbarService } from "./module-0893.mjs";
import { IBrowserWorkbenchEnvironmentService } from "./module-0915.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IRemoteAuthorityResolverService } from "./module-0894.mjs";
import { IHostService } from "./module-1117.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ILogService } from "./module-0095.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IProductService } from "./module-0873.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { workbenchConfigurationNodeBase } from "./module-1112.mjs";


// src/vs/workbench/contrib/remote/browser/remoteIndicator.ts
var RemoteStatusIndicator = class extends Disposable {
  constructor(statusbarService, environmentService, labelService, contextKeyService, menuService, quickInputService, commandService, extensionService, remoteAgentService, remoteAuthorityResolverService, hostService, workspaceContextService, logService, extensionGalleryService, telemetryService, productService, extensionManagementService, extensionsWorkbenchService, dialogService, lifecycleService, openerService, configurationService) {
    super();
    this.statusbarService = statusbarService;
    this.environmentService = environmentService;
    this.labelService = labelService;
    this.contextKeyService = contextKeyService;
    this.menuService = menuService;
    this.quickInputService = quickInputService;
    this.commandService = commandService;
    this.extensionService = extensionService;
    this.remoteAgentService = remoteAgentService;
    this.remoteAuthorityResolverService = remoteAuthorityResolverService;
    this.hostService = hostService;
    this.workspaceContextService = workspaceContextService;
    this.logService = logService;
    this.extensionGalleryService = extensionGalleryService;
    this.telemetryService = telemetryService;
    this.productService = productService;
    this.extensionManagementService = extensionManagementService;
    this.extensionsWorkbenchService = extensionsWorkbenchService;
    this.dialogService = dialogService;
    this.lifecycleService = lifecycleService;
    this.openerService = openerService;
    this.configurationService = configurationService;
    this.virtualWorkspaceLocation = void 0;
    this.connectionState = void 0;
    this.connectionToken = void 0;
    this.networkState = void 0;
    this.measureNetworkConnectionLatencyScheduler = void 0;
    this.loggedInvalidGroupNames = /* @__PURE__ */ Object.create(null);
    this._remoteExtensionMetadata = void 0;
    this.remoteMetadataInitialized = false;
    this._onDidChangeEntries = this._register(new Emitter());
    this.onDidChangeEntries = this._onDidChangeEntries.event;
    this.unrestrictedRemoteIndicatorMenu = this._register(this.menuService.createMenu(MenuId.StatusBarWindowIndicatorMenu, this.contextKeyService));
    this.remoteIndicatorMenu = this._register(this.menuService.createMenu(MenuId.StatusBarRemoteIndicatorMenu, this.contextKeyService));
    this.connectionStateContextKey = new RawContextKey("remoteConnectionState", "").bindTo(this.contextKeyService);
    if (this.remoteAuthority) {
      this.connectionState = "initializing";
      this.connectionStateContextKey.set(this.connectionState);
    } else {
      this.updateVirtualWorkspaceLocation();
    }
    this.registerActions();
    this.registerListeners();
    this.updateWhenInstalledExtensionsRegistered();
    this.updateRemoteStatusIndicator();
  }
  static {
    this.ID = "workbench.contrib.remoteStatusIndicator";
  }
  static {
    this.REMOTE_ACTIONS_COMMAND_ID = "workbench.action.remote.showMenu";
  }
  static {
    this.CLOSE_REMOTE_COMMAND_ID = "workbench.action.remote.close";
  }
  static {
    this.SHOW_CLOSE_REMOTE_COMMAND_ID = !isWeb;
  }
  static {
    // web does not have a "Close Remote" command
    this.INSTALL_REMOTE_EXTENSIONS_ID = "workbench.action.remote.extensions";
  }
  static {
    this.DEFAULT_REMOTE_STATUS_LABEL = "$(remote)";
  }
  static {
    this.REMOTE_STATUS_LABEL_MAX_LENGTH = 40;
  }
  static {
    this.REMOTE_CONNECTION_LATENCY_SCHEDULER_DELAY = 60 * 1e3;
  }
  static {
    this.REMOTE_CONNECTION_LATENCY_SCHEDULER_FIRST_RUN_DELAY = 10 * 1e3;
  }
  get remoteExtensionMetadata() {
    if (!this._remoteExtensionMetadata) {
      const remoteExtensionTips = { ...this.productService.remoteExtensionTips, ...this.productService.virtualWorkspaceExtensionTips };
      this._remoteExtensionMetadata = Object.values(remoteExtensionTips).filter((value2) => value2.startEntry !== void 0).map((value2) => {
        return {
          id: value2.extensionId,
          installed: false,
          friendlyName: value2.friendlyName,
          isPlatformCompatible: false,
          dependencies: [],
          helpLink: value2.startEntry?.helpLink ?? "",
          startConnectLabel: value2.startEntry?.startConnectLabel ?? "",
          startCommand: value2.startEntry?.startCommand ?? "",
          priority: value2.startEntry?.priority ?? 10,
          supportedPlatforms: value2.supportedPlatforms
        };
      });
      this.remoteExtensionMetadata.sort((ext1, ext2) => ext1.priority - ext2.priority);
    }
    return this._remoteExtensionMetadata;
  }
  get remoteAuthority() {
    return this.environmentService.remoteAuthority;
  }
  registerActions() {
    const category11 = localize2(18532, "Remote");
    const that = this;
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: RemoteStatusIndicator.REMOTE_ACTIONS_COMMAND_ID,
          category: category11,
          title: localize2(18536, "Show Remote Menu"),
          f1: true,
          keybinding: {
            weight: 200 /* WorkbenchContrib */,
            primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 45 /* KeyO */
          }
        });
        this.run = () => that.showRemoteMenu();
      }
    }));
    if (RemoteStatusIndicator.SHOW_CLOSE_REMOTE_COMMAND_ID) {
      this._register(registerAction2(class extends Action2 {
        constructor() {
          super({
            id: RemoteStatusIndicator.CLOSE_REMOTE_COMMAND_ID,
            category: category11,
            title: localize2(18533, "Close Remote Connection"),
            f1: true,
            precondition: ContextKeyExpr.and(ContextKeyExpr.or(RemoteNameContext, VirtualWorkspaceContext), IsSessionsWindowContext.negate())
          });
          this.run = () => that.hostService.openWindow({ forceReuseWindow: true, remoteAuthority: null });
        }
      }));
      if (this.remoteAuthority) {
        MenuRegistry.appendMenuItem(MenuId.MenubarFileMenu, {
          group: "6_close",
          command: {
            id: RemoteStatusIndicator.CLOSE_REMOTE_COMMAND_ID,
            title: localize(18527, null)
          },
          when: IsSessionsWindowContext.negate(),
          order: 3.5
        });
      }
    }
    if (this.extensionGalleryService.isEnabled()) {
      this._register(registerAction2(class extends Action2 {
        constructor() {
          super({
            id: RemoteStatusIndicator.INSTALL_REMOTE_EXTENSIONS_ID,
            category: category11,
            title: localize2(18534, "Install Remote Development Extensions"),
            f1: true
          });
          this.run = (accessor, input) => {
            const extensionsWorkbenchService = accessor.get(IExtensionsWorkbenchService);
            return extensionsWorkbenchService.openSearch(`@recommended:remotes`);
          };
        }
      }));
    }
  }
  registerListeners() {
    const updateRemoteActions = () => {
      this.remoteMenuActionsGroups = void 0;
      this.updateRemoteStatusIndicator();
    };
    this._register(this.unrestrictedRemoteIndicatorMenu.onDidChange(updateRemoteActions));
    this._register(this.remoteIndicatorMenu.onDidChange(updateRemoteActions));
    this._register(this.labelService.onDidChangeFormatters(() => this.updateRemoteStatusIndicator()));
    const remoteIndicator = this.environmentService.options?.windowIndicator;
    if (remoteIndicator && remoteIndicator.onDidChange) {
      this._register(remoteIndicator.onDidChange(() => this.updateRemoteStatusIndicator()));
    }
    if (this.remoteAuthority) {
      const connection = this.remoteAgentService.getConnection();
      if (connection) {
        this._register(connection.onDidStateChange((e) => {
          switch (e.type) {
            case 0 /* ConnectionLost */:
            case 2 /* ReconnectionRunning */:
            case 1 /* ReconnectionWait */:
              this.setConnectionState("reconnecting");
              break;
            case 3 /* ReconnectionPermanentFailure */:
              this.setConnectionState("disconnected");
              break;
            case 4 /* ConnectionGain */:
              this.setConnectionState("connected");
              break;
          }
        }));
      }
    } else {
      this._register(this.workspaceContextService.onDidChangeWorkbenchState(() => {
        this.updateVirtualWorkspaceLocation();
        this.updateRemoteStatusIndicator();
      }));
    }
    if (isWeb) {
      this._register(Event2.any(
        this._register(new DomEmitter(mainWindow, "online")).event,
        this._register(new DomEmitter(mainWindow, "offline")).event
      )(() => this.setNetworkState(navigator.onLine ? "online" : "offline")));
    }
    this._register(this.extensionService.onDidChangeExtensions(async (result) => {
      for (const ext of result.added) {
        const index2 = this.remoteExtensionMetadata.findIndex((value2) => ExtensionIdentifier.equals(value2.id, ext.identifier));
        if (index2 > -1) {
          this.remoteExtensionMetadata[index2].installed = true;
        }
      }
    }));
    this._register(this.extensionManagementService.onDidUninstallExtension(async (result) => {
      const index2 = this.remoteExtensionMetadata.findIndex((value2) => ExtensionIdentifier.equals(value2.id, result.identifier.id));
      if (index2 > -1) {
        this.remoteExtensionMetadata[index2].installed = false;
      }
    }));
  }
  async initializeRemoteMetadata() {
    if (this.remoteMetadataInitialized) {
      return;
    }
    const currentPlatform = PlatformToString(platform);
    for (let i2 = 0; i2 < this.remoteExtensionMetadata.length; i2++) {
      const extensionId = this.remoteExtensionMetadata[i2].id;
      const supportedPlatforms = this.remoteExtensionMetadata[i2].supportedPlatforms;
      const isInstalled = (await this.extensionManagementService.getInstalled()).find((value2) => ExtensionIdentifier.equals(value2.identifier.id, extensionId)) ? true : false;
      this.remoteExtensionMetadata[i2].installed = isInstalled;
      if (isInstalled) {
        this.remoteExtensionMetadata[i2].isPlatformCompatible = true;
      } else if (supportedPlatforms && !supportedPlatforms.includes(currentPlatform)) {
        this.remoteExtensionMetadata[i2].isPlatformCompatible = false;
      } else {
        this.remoteExtensionMetadata[i2].isPlatformCompatible = true;
      }
    }
    this.remoteMetadataInitialized = true;
    this._onDidChangeEntries.fire();
    this.updateRemoteStatusIndicator();
  }
  updateVirtualWorkspaceLocation() {
    this.virtualWorkspaceLocation = getVirtualWorkspaceLocation(this.workspaceContextService.getWorkspace());
  }
  async updateWhenInstalledExtensionsRegistered() {
    await this.extensionService.whenInstalledExtensionsRegistered();
    const remoteAuthority = this.remoteAuthority;
    if (remoteAuthority) {
      (async () => {
        try {
          const { authority } = await this.remoteAuthorityResolverService.resolveAuthority(remoteAuthority);
          this.connectionToken = authority.connectionToken;
          this.setConnectionState("connected");
        } catch (error) {
          this.setConnectionState("disconnected");
        }
      })();
    }
    this.updateRemoteStatusIndicator();
    this.initializeRemoteMetadata();
  }
  setConnectionState(newState) {
    if (this.connectionState !== newState) {
      this.connectionState = newState;
      if (this.connectionState === "reconnecting") {
        this.connectionStateContextKey.set("disconnected");
      } else {
        this.connectionStateContextKey.set(this.connectionState);
      }
      this.updateRemoteStatusIndicator();
      if (newState === "connected") {
        this.scheduleMeasureNetworkConnectionLatency();
      }
    }
  }
  scheduleMeasureNetworkConnectionLatency() {
    if (!this.remoteAuthority || // only when having a remote connection
    this.measureNetworkConnectionLatencyScheduler) {
      return;
    }
    this.measureNetworkConnectionLatencyScheduler = this._register(new RunOnceScheduler(() => this.measureNetworkConnectionLatency(), RemoteStatusIndicator.REMOTE_CONNECTION_LATENCY_SCHEDULER_DELAY));
    this.measureNetworkConnectionLatencyScheduler.schedule(RemoteStatusIndicator.REMOTE_CONNECTION_LATENCY_SCHEDULER_FIRST_RUN_DELAY);
  }
  async measureNetworkConnectionLatency() {
    if (this.hostService.hasFocus && this.networkState !== "offline") {
      const measurement = await remoteConnectionLatencyMeasurer.measure(this.remoteAgentService);
      if (measurement) {
        if (measurement.high) {
          this.setNetworkState("high-latency");
        } else if (this.networkState === "high-latency") {
          this.setNetworkState("online");
        }
      }
    }
    this.measureNetworkConnectionLatencyScheduler?.schedule();
  }
  setNetworkState(newState) {
    if (this.networkState !== newState) {
      const oldState = this.networkState;
      this.networkState = newState;
      if (newState === "high-latency") {
        this.logService.warn(`Remote network connection appears to have high latency (${remoteConnectionLatencyMeasurer.latency?.current?.toFixed(2)}ms last, ${remoteConnectionLatencyMeasurer.latency?.average?.toFixed(2)}ms average)`);
      }
      if (this.connectionToken) {
        if (newState === "online" && oldState === "high-latency") {
          this.logNetworkConnectionHealthTelemetry(this.connectionToken, "good");
        } else if (newState === "high-latency" && oldState === "online") {
          this.logNetworkConnectionHealthTelemetry(this.connectionToken, "poor");
        }
      }
      this.updateRemoteStatusIndicator();
    }
  }
  logNetworkConnectionHealthTelemetry(connectionToken, connectionHealth) {
    this.telemetryService.publicLog2("remoteConnectionHealth", {
      remoteName: getRemoteName(this.remoteAuthority),
      reconnectionToken: connectionToken,
      connectionHealth
    });
  }
  validatedGroup(group2) {
    if (!group2.match(/^(remote|virtualfs)_(\d\d)_(([a-z][a-z0-9+.-]*)_(.*))$/)) {
      if (!this.loggedInvalidGroupNames[group2]) {
        this.loggedInvalidGroupNames[group2] = true;
        this.logService.warn(`Invalid group name used in "statusBar/remoteIndicator" menu contribution: ${group2}. Entries ignored. Expected format: 'remote_$ORDER_$REMOTENAME_$GROUPING or 'virtualfs_$ORDER_$FILESCHEME_$GROUPING.`);
      }
      return false;
    }
    return true;
  }
  getRemoteMenuActions(doNotUseCache) {
    if (!this.remoteMenuActionsGroups || doNotUseCache) {
      this.remoteMenuActionsGroups = this.remoteIndicatorMenu.getActions().filter((a) => this.validatedGroup(a[0])).concat(this.unrestrictedRemoteIndicatorMenu.getActions());
    }
    return this.remoteMenuActionsGroups;
  }
  updateRemoteStatusIndicator() {
    const remoteIndicator = this.environmentService.options?.windowIndicator;
    if (remoteIndicator) {
      let remoteIndicatorLabel = remoteIndicator.label.trim();
      if (!remoteIndicatorLabel.startsWith("$(")) {
        remoteIndicatorLabel = `$(remote) ${remoteIndicatorLabel}`;
      }
      this.renderRemoteStatusIndicator(truncate(remoteIndicatorLabel, RemoteStatusIndicator.REMOTE_STATUS_LABEL_MAX_LENGTH), remoteIndicator.tooltip, remoteIndicator.command);
      return;
    }
    if (this.remoteAuthority) {
      const hostLabel = this.labelService.getHostLabel(Schemas.vscodeRemote, this.remoteAuthority) || this.remoteAuthority;
      switch (this.connectionState) {
        case "initializing":
          this.renderRemoteStatusIndicator(
            localize(18524, null),
            localize(18524, null),
            void 0,
            true
            /* progress */
          );
          break;
        case "reconnecting":
          this.renderRemoteStatusIndicator(
            `${localize(18525, null, truncate(hostLabel, RemoteStatusIndicator.REMOTE_STATUS_LABEL_MAX_LENGTH))}`,
            void 0,
            void 0,
            true
            /* progress */
          );
          break;
        case "disconnected":
          this.renderRemoteStatusIndicator(`$(alert) ${localize(18523, null, truncate(hostLabel, RemoteStatusIndicator.REMOTE_STATUS_LABEL_MAX_LENGTH))}`);
          break;
        default: {
          const tooltip = new MarkdownString("", { isTrusted: true, supportThemeIcons: true });
          const hostNameTooltip = this.labelService.getHostTooltip(Schemas.vscodeRemote, this.remoteAuthority);
          if (hostNameTooltip) {
            tooltip.appendMarkdown(hostNameTooltip);
          } else {
            tooltip.appendText(localize(18526, null, hostLabel));
          }
          this.renderRemoteStatusIndicator(`$(remote) ${truncate(hostLabel, RemoteStatusIndicator.REMOTE_STATUS_LABEL_MAX_LENGTH)}`, tooltip);
        }
      }
      return;
    }
    if (this.virtualWorkspaceLocation) {
      const workspaceLabel = this.labelService.getHostLabel(this.virtualWorkspaceLocation.scheme, this.virtualWorkspaceLocation.authority);
      if (workspaceLabel) {
        const tooltip = new MarkdownString("", { isTrusted: true, supportThemeIcons: true });
        const hostNameTooltip = this.labelService.getHostTooltip(this.virtualWorkspaceLocation.scheme, this.virtualWorkspaceLocation.authority);
        if (hostNameTooltip) {
          tooltip.appendMarkdown(hostNameTooltip);
        } else {
          tooltip.appendText(localize(18544, null, workspaceLabel));
        }
        if (!isWeb || this.remoteAuthority) {
          tooltip.appendMarkdown("\n\n");
          tooltip.appendMarkdown(localize(
            18545,
            null,
            `command:${LIST_WORKSPACE_UNSUPPORTED_EXTENSIONS_COMMAND_ID}`
          ));
        }
        this.renderRemoteStatusIndicator(`$(remote) ${truncate(workspaceLabel, RemoteStatusIndicator.REMOTE_STATUS_LABEL_MAX_LENGTH)}`, tooltip);
        return;
      }
    }
    this.renderRemoteStatusIndicator(RemoteStatusIndicator.DEFAULT_REMOTE_STATUS_LABEL, localize(18530, null));
    return;
  }
  renderRemoteStatusIndicator(initialText, initialTooltip, command4, showProgress) {
    const { text: text2, tooltip, ariaLabel } = this.withNetworkStatus(initialText, initialTooltip, showProgress);
    const properties = {
      name: localize(18541, null),
      kind: this.networkState === "offline" ? "offline" : text2 !== RemoteStatusIndicator.DEFAULT_REMOTE_STATUS_LABEL ? "remote" : void 0,
      // only emphasize when applicable
      ariaLabel,
      text: text2,
      showProgress,
      tooltip,
      command: command4 ?? RemoteStatusIndicator.REMOTE_ACTIONS_COMMAND_ID
    };
    // OpenCode: hide remote indicator (status.host) in the status bar
    if (true) {
      if (this.remoteStatusEntry) { this.remoteStatusEntry.dispose(); this.remoteStatusEntry = undefined; }
      return;
    }
    if (this.remoteStatusEntry) {
      this.remoteStatusEntry.update(properties);
    } else {
      this.remoteStatusEntry = this.statusbarService.addEntry(
        properties,
        "status.host",
        0 /* LEFT */,
        Number.POSITIVE_INFINITY
        /* first entry */
      );
    }
  }
  withNetworkStatus(initialText, initialTooltip, showProgress) {
    let text2 = initialText;
    let tooltip = initialTooltip;
    let ariaLabel = getCodiconAriaLabel(text2);
    function textWithAlert() {
      if (!showProgress && initialText.startsWith(RemoteStatusIndicator.DEFAULT_REMOTE_STATUS_LABEL)) {
        return initialText.replace(RemoteStatusIndicator.DEFAULT_REMOTE_STATUS_LABEL, "$(alert)");
      }
      return initialText;
    }
    switch (this.networkState) {
      case "offline": {
        const offlineMessage = localize(18529, null);
        text2 = textWithAlert();
        tooltip = this.appendTooltipLine(tooltip, offlineMessage);
        ariaLabel = `${ariaLabel}, ${offlineMessage}`;
        break;
      }
      case "high-latency":
        text2 = textWithAlert();
        tooltip = this.appendTooltipLine(tooltip, localize(18528, null, remoteConnectionLatencyMeasurer.latency?.current?.toFixed(2), remoteConnectionLatencyMeasurer.latency?.average?.toFixed(2)));
        break;
    }
    return { text: text2, tooltip, ariaLabel };
  }
  appendTooltipLine(tooltip, line) {
    let markdownTooltip;
    if (typeof tooltip === "string") {
      markdownTooltip = new MarkdownString(tooltip, { isTrusted: true, supportThemeIcons: true });
    } else {
      markdownTooltip = tooltip ?? new MarkdownString("", { isTrusted: true, supportThemeIcons: true });
    }
    if (markdownTooltip.value.length > 0) {
      markdownTooltip.appendMarkdown("\n\n");
    }
    markdownTooltip.appendMarkdown(line);
    return markdownTooltip;
  }
  async installExtension(extensionId, remoteLabel) {
    try {
      await this.extensionsWorkbenchService.install(extensionId, {
        isMachineScoped: false,
        donotIncludePackAndDependencies: false,
        context: { [EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT]: true }
      });
    } catch (error) {
      if (!this.lifecycleService.willShutdown) {
        const { confirmed } = await this.dialogService.confirm({
          type: severity_default.Error,
          message: localize(18543, null, remoteLabel),
          detail: error && !isCancellationError(error) ? toErrorMessage(error) : void 0,
          primaryButton: localize(18542, null)
        });
        if (confirmed) {
          return this.installExtension(extensionId, remoteLabel);
        }
      }
      throw error;
    }
  }
  async runRemoteStartCommand(extensionId, startCommand) {
    await retry(async () => {
      const ext = await this.extensionService.getExtension(extensionId);
      if (!ext) {
        throw Error("Failed to find installed remote extension");
      }
      return ext;
    }, 300, 10);
    this.commandService.executeCommand(startCommand);
    this.telemetryService.publicLog2("workbenchActionExecuted", {
      id: "remoteInstallAndRun",
      detail: extensionId,
      from: "remote indicator"
    });
  }
  showRemoteMenu() {
    const getCategoryLabel2 = (action) => {
      if (action.item.category) {
        return typeof action.item.category === "string" ? action.item.category : action.item.category.value;
      }
      return void 0;
    };
    const matchCurrentRemote = () => {
      if (this.remoteAuthority) {
        return new RegExp(`^remote_\\d\\d_${getRemoteName(this.remoteAuthority)}_`);
      } else if (this.virtualWorkspaceLocation) {
        return new RegExp(`^virtualfs_\\d\\d_${this.virtualWorkspaceLocation.scheme}_`);
      }
      return void 0;
    };
    const computeItems = () => {
      let actionGroups = this.getRemoteMenuActions(true);
      const items = [];
      const currentRemoteMatcher = matchCurrentRemote();
      if (currentRemoteMatcher) {
        actionGroups = actionGroups.sort((g1, g2) => {
          const isCurrentRemote1 = currentRemoteMatcher.test(g1[0]);
          const isCurrentRemote2 = currentRemoteMatcher.test(g2[0]);
          if (isCurrentRemote1 !== isCurrentRemote2) {
            return isCurrentRemote1 ? -1 : 1;
          }
          if (g1[0] !== "" && g2[0] === "") {
            return -1;
          } else if (g1[0] === "" && g2[0] !== "") {
            return 1;
          }
          return g1[0].localeCompare(g2[0]);
        });
      }
      let lastCategoryName = void 0;
      for (const actionGroup of actionGroups) {
        let hasGroupCategory = false;
        for (const action of actionGroup[1]) {
          if (action instanceof MenuItemAction) {
            if (!hasGroupCategory) {
              const category11 = getCategoryLabel2(action);
              if (category11 !== lastCategoryName) {
                items.push({ type: "separator", label: category11 });
                lastCategoryName = category11;
              }
              hasGroupCategory = true;
            }
            const label3 = typeof action.item.title === "string" ? action.item.title : action.item.title.value;
            items.push({
              type: "item",
              id: action.item.id,
              label: label3
            });
          }
        }
      }
      const showExtensionRecommendations = this.configurationService.getValue("workbench.remoteIndicator.showExtensionRecommendations");
      if (showExtensionRecommendations && this.extensionGalleryService.isEnabled() && this.remoteMetadataInitialized) {
        const notInstalledItems = [];
        for (const metadata of this.remoteExtensionMetadata) {
          if (!metadata.installed && metadata.isPlatformCompatible) {
            const label3 = metadata.startConnectLabel;
            const buttons = [{
              iconClass: ThemeIcon.asClassName(infoIcon),
              tooltip: localize(18537, null)
            }];
            notInstalledItems.push({ type: "item", id: metadata.id, label: label3, buttons });
          }
        }
        items.push({
          type: "separator",
          label: localize(18538, null)
        });
        items.push(...notInstalledItems);
      }
      items.push({
        type: "separator"
      });
      const entriesBeforeConfig = items.length;
      if (RemoteStatusIndicator.SHOW_CLOSE_REMOTE_COMMAND_ID) {
        if (this.remoteAuthority) {
          items.push({
            type: "item",
            id: RemoteStatusIndicator.CLOSE_REMOTE_COMMAND_ID,
            label: localize(18521, null)
          });
          if (this.connectionState === "disconnected") {
            items.push({
              type: "item",
              id: ReloadWindowAction.ID,
              label: localize(18531, null)
            });
          }
        } else if (this.virtualWorkspaceLocation) {
          items.push({
            type: "item",
            id: RemoteStatusIndicator.CLOSE_REMOTE_COMMAND_ID,
            label: localize(18522, null)
          });
        }
      }
      if (items.length === entriesBeforeConfig) {
        items.pop();
      }
      return items;
    };
    const disposables = new DisposableStore();
    const quickPick = disposables.add(this.quickInputService.createQuickPick({ useSeparators: true }));
    quickPick.placeholder = localize(18540, null);
    quickPick.items = computeItems();
    quickPick.sortByLabel = false;
    quickPick.canSelectMany = false;
    disposables.add(Event2.once(quickPick.onDidAccept)((async (_) => {
      const selectedItems = quickPick.selectedItems;
      if (selectedItems.length === 1) {
        const commandId = selectedItems[0].id;
        const remoteExtension = this.remoteExtensionMetadata.find((value2) => ExtensionIdentifier.equals(value2.id, commandId));
        if (remoteExtension) {
          quickPick.items = [];
          quickPick.busy = true;
          quickPick.placeholder = localize(18539, null);
          try {
            await this.installExtension(remoteExtension.id, selectedItems[0].label);
          } catch (error) {
            return;
          } finally {
            quickPick.hide();
          }
          await this.runRemoteStartCommand(remoteExtension.id, remoteExtension.startCommand);
        } else {
          this.telemetryService.publicLog2("workbenchActionExecuted", {
            id: commandId,
            from: "remote indicator"
          });
          this.commandService.executeCommand(commandId);
          quickPick.hide();
        }
      }
    })));
    disposables.add(Event2.once(quickPick.onDidTriggerItemButton)(async (e) => {
      const remoteExtension = this.remoteExtensionMetadata.find((value2) => ExtensionIdentifier.equals(value2.id, e.item.id));
      if (remoteExtension) {
        await this.openerService.open(URI.parse(remoteExtension.helpLink));
      }
    }));
    disposables.add(this.unrestrictedRemoteIndicatorMenu.onDidChange(() => quickPick.items = computeItems()));
    disposables.add(this.remoteIndicatorMenu.onDidChange(() => quickPick.items = computeItems()));
    disposables.add(quickPick.onDidHide(() => disposables.dispose()));
    if (!this.remoteMetadataInitialized) {
      quickPick.busy = true;
      disposables.add(this.onDidChangeEntries(() => {
        quickPick.busy = false;
        quickPick.items = computeItems();
      }));
    }
    quickPick.show();
  }
};

RemoteStatusIndicator = __decorateClass([
  __decorateParam(0, IStatusbarService),
  __decorateParam(1, IBrowserWorkbenchEnvironmentService),
  __decorateParam(2, ILabelService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IMenuService),
  __decorateParam(5, IQuickInputService),
  __decorateParam(6, ICommandService),
  __decorateParam(7, IExtensionService),
  __decorateParam(8, IRemoteAgentService),
  __decorateParam(9, IRemoteAuthorityResolverService),
  __decorateParam(10, IHostService),
  __decorateParam(11, IWorkspaceContextService),
  __decorateParam(12, ILogService),
  __decorateParam(13, IExtensionGalleryService),
  __decorateParam(14, ITelemetryService),
  __decorateParam(15, IProductService),
  __decorateParam(16, IExtensionManagementService),
  __decorateParam(17, IExtensionsWorkbenchService),
  __decorateParam(18, IDialogService),
  __decorateParam(19, ILifecycleService),
  __decorateParam(20, IOpenerService),
  __decorateParam(21, IConfigurationService)
], RemoteStatusIndicator);

Registry.as(Extensions4.Configuration).registerConfiguration({
  ...workbenchConfigurationNodeBase,
  properties: {
    "workbench.remoteIndicator.showExtensionRecommendations": {
      type: "boolean",
      markdownDescription: localize(18535, null),
      default: true
    }
  }
});
export { RemoteStatusIndicator };
