// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/remoteTunnel/electron-browser/remoteTunnel.contribution.ts
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { joinPath } from "./module-0034.mjs";
import { CONFIGURATION_KEY_HOST_NAME, CONFIGURATION_KEY_PREFIX, CONFIGURATION_KEY_PREVENT_SLEEP, INACTIVE_TUNNEL_MODE, IRemoteTunnelService, LOGGER_NAME, LOG_ID } from "./module-3889.mjs";
import { isNumber, isObject, isString } from "./module-0010.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { toAction } from "./module-0082.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IProductService } from "./module-0873.mjs";
import { IOutputService } from "./module-1245.mjs";
import { IPreferencesService } from "./module-1294.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IWorkspaceContextService, isUntitledWorkspace } from "./module-0509.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAuthenticationService } from "./module-0951.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { ILoggerService } from "./module-0095.mjs";
import { INativeEnvironmentService } from "./module-0508.mjs";
import { IProgressService } from "./module-0446.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0870.mjs";
import { Extensions4 } from "./module-0140.mjs";


// src/vs/workbench/contrib/remoteTunnel/electron-browser/remoteTunnel.contribution.ts
var REMOTE_TUNNEL_CATEGORY = localize2(18680, "Remote Tunnels");

var REMOTE_TUNNEL_CONNECTION_STATE_KEY = "remoteTunnelConnection";

var REMOTE_TUNNEL_CONNECTION_STATE = new RawContextKey(REMOTE_TUNNEL_CONNECTION_STATE_KEY, "disconnected");

var REMOTE_TUNNEL_HAS_LINK = new RawContextKey("remoteTunnelHasLink", false);

var REMOTE_TUNNEL_USED_STORAGE_KEY = "remoteTunnelServiceUsed";

var REMOTE_TUNNEL_PROMPTED_PREVIEW_STORAGE_KEY = "remoteTunnelServicePromptedPreview";

var REMOTE_TUNNEL_EXTENSION_RECOMMENDED_KEY = "remoteTunnelExtensionRecommended";

var REMOTE_TUNNEL_HAS_USED_BEFORE = "remoteTunnelHasUsed";

var REMOTE_TUNNEL_EXTENSION_TIMEOUT = 4 * 60 * 1e3;

var INVALID_TOKEN_RETRIES = 2;

var RemoteTunnelCommandLabels;

((RemoteTunnelCommandLabels2) => {
  RemoteTunnelCommandLabels2.turnOn = localize(18679, null);
  RemoteTunnelCommandLabels2.turnOff = localize(18678, null);
  RemoteTunnelCommandLabels2.showLog = localize(18677, null);
  RemoteTunnelCommandLabels2.configure = localize(18672, null);
  RemoteTunnelCommandLabels2.copyToClipboard = localize(18673, null);
  RemoteTunnelCommandLabels2.learnMore = localize(18674, null);
})(RemoteTunnelCommandLabels || (RemoteTunnelCommandLabels = {}));

var RemoteTunnelWorkbenchContribution = class extends Disposable {
  constructor(authenticationService, dialogService, extensionService, contextKeyService, productService, storageService, loggerService, quickInputService, environmentService, remoteTunnelService, commandService, workspaceContextService, progressService, notificationService) {
    super();
    this.authenticationService = authenticationService;
    this.dialogService = dialogService;
    this.extensionService = extensionService;
    this.contextKeyService = contextKeyService;
    this.storageService = storageService;
    this.quickInputService = quickInputService;
    this.environmentService = environmentService;
    this.remoteTunnelService = remoteTunnelService;
    this.commandService = commandService;
    this.workspaceContextService = workspaceContextService;
    this.progressService = progressService;
    this.notificationService = notificationService;
    this.expiredSessions = /* @__PURE__ */ new Set();
    this.logger = this._register(loggerService.createLogger(joinPath(environmentService.logsHome, `${LOG_ID}.log`), { id: LOG_ID, name: LOGGER_NAME }));
    this.connectionStateContext = REMOTE_TUNNEL_CONNECTION_STATE.bindTo(this.contextKeyService);
    this.hasLinkContext = REMOTE_TUNNEL_HAS_LINK.bindTo(this.contextKeyService);
    const serverConfiguration = productService.tunnelApplicationConfig;
    if (!serverConfiguration || !productService.tunnelApplicationName) {
      this.logger.error("Missing 'tunnelApplicationConfig' or 'tunnelApplicationName' in product.json. Remote tunneling is not available.");
      this.serverConfiguration = { authenticationProviders: {}, editorWebUrl: "", extension: { extensionId: "", friendlyName: "" } };
      return;
    }
    this.serverConfiguration = serverConfiguration;
    this._register(this.remoteTunnelService.onDidChangeTunnelStatus((s) => this.handleTunnelStatusUpdate(s)));
    this.registerCommands();
    this.initialize();
    this.recommendRemoteExtensionIfNeeded();
  }
  handleTunnelStatusUpdate(status2) {
    this.connectionInfo = void 0;
    this.hasLinkContext.set(false);
    if (status2.type === "disconnected") {
      if (status2.onTokenFailed) {
        this.expiredSessions.add(status2.onTokenFailed.sessionId);
      }
      this.connectionStateContext.set("disconnected");
    } else if (status2.type === "connecting") {
      this.connectionStateContext.set("connecting");
    } else if (status2.type === "connected") {
      this.connectionInfo = status2.info;
      this.hasLinkContext.set(!!status2.info.link);
      this.connectionStateContext.set("connected");
    }
  }
  async recommendRemoteExtensionIfNeeded() {
    await this.extensionService.whenInstalledExtensionsRegistered();
    const remoteExtension = this.serverConfiguration.extension;
    const shouldRecommend = async () => {
      if (this.storageService.getBoolean(REMOTE_TUNNEL_EXTENSION_RECOMMENDED_KEY, -1 /* APPLICATION */)) {
        return false;
      }
      if (await this.extensionService.getExtension(remoteExtension.extensionId)) {
        return false;
      }
      const usedOnHostMessage = this.storageService.get(REMOTE_TUNNEL_USED_STORAGE_KEY, -1 /* APPLICATION */);
      if (!usedOnHostMessage) {
        return false;
      }
      let usedTunnelName;
      try {
        const message = JSON.parse(usedOnHostMessage);
        if (!isObject(message)) {
          return false;
        }
        const { hostName, timeStamp } = message;
        if (!isString(hostName) || !isNumber(timeStamp) || (/* @__PURE__ */ new Date()).getTime() > timeStamp + REMOTE_TUNNEL_EXTENSION_TIMEOUT) {
          return false;
        }
        usedTunnelName = hostName;
      } catch (_) {
        return false;
      }
      const currentTunnelName = await this.remoteTunnelService.getTunnelName();
      if (!currentTunnelName || currentTunnelName === usedTunnelName) {
        return false;
      }
      return usedTunnelName;
    };
    const recommed = async () => {
      const usedOnHost = await shouldRecommend();
      if (!usedOnHost) {
        return false;
      }
      this.notificationService.notify({
        severity: Severity2.Info,
        priority: 1 /* OPTIONAL */,
        message: localize(
          18671,
          null,
          usedOnHost,
          remoteExtension.friendlyName
        ),
        actions: {
          primary: [
            toAction({
              id: "showExtension",
              label: localize(18658, null),
              run: () => {
                return this.commandService.executeCommand("workbench.extensions.action.showExtensionsWithIds", [remoteExtension.extensionId]);
              }
            }),
            toAction({
              id: "doNotShowAgain",
              label: localize(18657, null),
              run: () => {
                this.storageService.store(REMOTE_TUNNEL_EXTENSION_RECOMMENDED_KEY, true, -1 /* APPLICATION */, 0 /* USER */);
              }
            })
          ]
        }
      });
      return true;
    };
    if (await shouldRecommend()) {
      const disposables = this._register(new DisposableStore());
      disposables.add(this.storageService.onDidChangeValue(-1 /* APPLICATION */, REMOTE_TUNNEL_USED_STORAGE_KEY, disposables)(async () => {
        const success = await recommed();
        if (success) {
          disposables.dispose();
        }
      }));
    }
  }
  async initialize() {
    const [mode, status2] = await Promise.all([
      this.remoteTunnelService.getMode(),
      this.remoteTunnelService.getTunnelStatus()
    ]);
    this.handleTunnelStatusUpdate(status2);
    if (mode.active && mode.session.token) {
      return;
    }
    const doInitialStateDiscovery = async (progress) => {
      const listener = progress && this.remoteTunnelService.onDidChangeTunnelStatus((status4) => {
        switch (status4.type) {
          case "connecting":
            if (status4.progress) {
              progress.report({ message: status4.progress });
            }
            break;
        }
      });
      let newSession;
      if (mode.active) {
        const token = await this.getSessionToken(mode.session);
        if (token) {
          newSession = { ...mode.session, token };
        }
      }
      const status3 = await this.remoteTunnelService.initialize(mode.active && newSession ? { ...mode, session: newSession } : INACTIVE_TUNNEL_MODE);
      listener?.dispose();
      if (status3.type === "connected") {
        this.connectionInfo = status3.info;
        this.connectionStateContext.set("connected");
        return;
      }
    };
    const hasUsed = this.storageService.getBoolean(REMOTE_TUNNEL_HAS_USED_BEFORE, -1 /* APPLICATION */, false);
    if (hasUsed) {
      await this.progressService.withProgress(
        {
          location: 10 /* Window */,
          title: localize(18660, null, "workbench.remoteTunnel.actions.showLog" /* showLog */)
        },
        doInitialStateDiscovery
      );
    } else {
      doInitialStateDiscovery(void 0);
    }
  }
  getPreferredTokenFromSession(session) {
    return session.session.accessToken || session.session.idToken;
  }
  async startTunnel(asService) {
    if (this.connectionInfo) {
      return this.connectionInfo;
    }
    this.storageService.store(REMOTE_TUNNEL_HAS_USED_BEFORE, true, -1 /* APPLICATION */, 1 /* MACHINE */);
    let tokenProblems = false;
    for (let i2 = 0; i2 < INVALID_TOKEN_RETRIES; i2++) {
      tokenProblems = false;
      const authenticationSession = await this.getAuthenticationSession();
      if (authenticationSession === void 0) {
        this.logger.info("No authentication session available, not starting tunnel");
        return void 0;
      }
      const result = await this.progressService.withProgress(
        {
          location: 15 /* Notification */,
          title: localize(18689, null, "workbench.remoteTunnel.actions.showLog" /* showLog */)
        },
        (progress) => {
          return new Promise((s, e) => {
            let completed = false;
            const listener = this.remoteTunnelService.onDidChangeTunnelStatus((status2) => {
              switch (status2.type) {
                case "connecting":
                  if (status2.progress) {
                    progress.report({ message: status2.progress });
                  }
                  break;
                case "connected":
                  listener.dispose();
                  completed = true;
                  s(status2.info);
                  if (status2.serviceInstallFailed) {
                    this.notificationService.notify({
                      severity: Severity2.Warning,
                      message: localize(
                        18681,
                        null,
                        "workbench.remoteTunnel.actions.showLog" /* showLog */
                      )
                    });
                  }
                  break;
                case "disconnected":
                  listener.dispose();
                  completed = true;
                  tokenProblems = !!status2.onTokenFailed;
                  s(void 0);
                  break;
              }
            });
            const token = this.getPreferredTokenFromSession(authenticationSession);
            const account = { sessionId: authenticationSession.session.id, token, providerId: authenticationSession.providerId, accountLabel: authenticationSession.session.account.label };
            this.remoteTunnelService.startTunnel({ active: true, asService, session: account }).then((status2) => {
              if (!completed && (status2.type === "connected" || status2.type === "disconnected")) {
                listener.dispose();
                if (status2.type === "connected") {
                  s(status2.info);
                } else {
                  tokenProblems = !!status2.onTokenFailed;
                  s(void 0);
                }
              }
            });
          });
        }
      );
      if (result || !tokenProblems) {
        return result;
      }
    }
    return void 0;
  }
  async getAuthenticationSession() {
    const sessions = await this.getAllSessions();
    const disposables = new DisposableStore();
    const quickpick = disposables.add(this.quickInputService.createQuickPick({ useSeparators: true }));
    quickpick.ok = false;
    quickpick.placeholder = localize(18655, null);
    quickpick.ignoreFocusOut = true;
    quickpick.items = await this.createQuickpickItems(sessions);
    return new Promise((resolve3, reject) => {
      disposables.add(quickpick.onDidHide((e) => {
        resolve3(void 0);
        disposables.dispose();
      }));
      disposables.add(quickpick.onDidAccept(async (e) => {
        const selection = quickpick.selectedItems[0];
        if ("provider" in selection) {
          const session = await this.authenticationService.createSession(selection.provider.id, selection.provider.scopes);
          resolve3(this.createExistingSessionItem(session, selection.provider.id));
        } else if ("session" in selection) {
          resolve3(selection);
        } else {
          resolve3(void 0);
        }
        quickpick.hide();
      }));
      quickpick.show();
    });
  }
  createExistingSessionItem(session, providerId) {
    return {
      label: session.account.label,
      description: this.authenticationService.getProvider(providerId).label,
      session,
      providerId
    };
  }
  async createQuickpickItems(sessions) {
    const options3 = [];
    if (sessions.length) {
      options3.push({ type: "separator", label: localize(18688, null) });
      options3.push(...sessions);
      options3.push({ type: "separator", label: localize(18667, null) });
    }
    for (const authenticationProvider of await this.getAuthenticationProviders()) {
      const signedInForProvider = sessions.some((account) => account.providerId === authenticationProvider.id);
      const provider = this.authenticationService.getProvider(authenticationProvider.id);
      if (!signedInForProvider || provider.supportsMultipleAccounts) {
        options3.push({ label: localize(18687, null, provider.label), provider: authenticationProvider });
      }
    }
    return options3;
  }
  /**
   * Returns all authentication sessions available from {@link getAuthenticationProviders}.
   */
  async getAllSessions() {
    const authenticationProviders = await this.getAuthenticationProviders();
    const accounts = /* @__PURE__ */ new Map();
    const currentAccount = await this.remoteTunnelService.getMode();
    let currentSession;
    for (const provider of authenticationProviders) {
      const sessions = await this.authenticationService.getSessions(provider.id, provider.scopes);
      for (const session of sessions) {
        if (!this.expiredSessions.has(session.id)) {
          const item = this.createExistingSessionItem(session, provider.id);
          accounts.set(item.session.account.id, item);
          if (currentAccount.active && currentAccount.session.sessionId === session.id) {
            currentSession = item;
          }
        }
      }
    }
    if (currentSession !== void 0) {
      accounts.set(currentSession.session.account.id, currentSession);
    }
    return [...accounts.values()];
  }
  async getSessionToken(session) {
    if (session) {
      const sessionItem = (await this.getAllSessions()).find((s) => s.session.id === session.sessionId);
      if (sessionItem) {
        return this.getPreferredTokenFromSession(sessionItem);
      }
    }
    return void 0;
  }
  /**
   * Returns all authentication providers which can be used to authenticate
   * to the remote storage service, based on product.json configuration
   * and registered authentication providers.
   */
  async getAuthenticationProviders() {
    const authenticationProviders = this.serverConfiguration.authenticationProviders;
    const configuredAuthenticationProviders = Object.keys(authenticationProviders).reduce((result, id2) => {
      result.push({ id: id2, scopes: authenticationProviders[id2].scopes });
      return result;
    }, []);
    const availableAuthenticationProviders = this.authenticationService.declaredProviders;
    return configuredAuthenticationProviders.filter(({ id: id2 }) => availableAuthenticationProviders.some((provider) => provider.id === id2));
  }
  registerCommands() {
    const that = this;
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.remoteTunnel.actions.turnOn" /* turnOn */,
          title: RemoteTunnelCommandLabels.turnOn,
          category: REMOTE_TUNNEL_CATEGORY,
          precondition: ContextKeyExpr.equals(REMOTE_TUNNEL_CONNECTION_STATE_KEY, "disconnected"),
          menu: [
            {
              id: MenuId.CommandPalette
            },
            {
              id: MenuId.AccountsContext,
              group: "2_remoteTunnel",
              when: ContextKeyExpr.equals(REMOTE_TUNNEL_CONNECTION_STATE_KEY, "disconnected")
            }
          ]
        });
      }
      async run(accessor) {
        const notificationService = accessor.get(INotificationService);
        const clipboardService = accessor.get(IClipboardService);
        const commandService = accessor.get(ICommandService);
        const storageService = accessor.get(IStorageService);
        const dialogService = accessor.get(IDialogService);
        const quickInputService = accessor.get(IQuickInputService);
        const productService = accessor.get(IProductService);
        const didNotifyPreview = storageService.getBoolean(REMOTE_TUNNEL_PROMPTED_PREVIEW_STORAGE_KEY, -1 /* APPLICATION */, false);
        if (!didNotifyPreview) {
          const { confirmed } = await dialogService.confirm({
            message: localize(18695, null),
            primaryButton: localize(18659, null)
          });
          if (!confirmed) {
            return;
          }
          storageService.store(REMOTE_TUNNEL_PROMPTED_PREVIEW_STORAGE_KEY, true, -1 /* APPLICATION */, 0 /* USER */);
        }
        const disposables = new DisposableStore();
        const quickPick = quickInputService.createQuickPick();
        quickPick.placeholder = localize(18690, null);
        quickPick.items = [
          { service: false, label: localize(18693, null), description: localize(18694, null, productService.nameShort) },
          { service: true, label: localize(18691, null), description: localize(18692, null) }
        ];
        const asService = await new Promise((resolve3) => {
          disposables.add(quickPick.onDidAccept(() => resolve3(quickPick.selectedItems[0]?.service)));
          disposables.add(quickPick.onDidHide(() => resolve3(void 0)));
          quickPick.show();
        });
        quickPick.dispose();
        if (asService === void 0) {
          return;
        }
        const connectionInfo = await that.startTunnel(
          /* installAsService= */
          asService
        );
        if (connectionInfo) {
          const remoteExtension = that.serverConfiguration.extension;
          if (connectionInfo.link && connectionInfo.domain) {
            const linkToOpen = that.getLinkToOpen(connectionInfo.link);
            const linkToOpenForMarkdown = linkToOpen.toString(false).replace(/\)/g, "%29");
            notificationService.notify({
              severity: Severity2.Info,
              message: localize(
                18669,
                null,
                connectionInfo.tunnelName,
                connectionInfo.domain,
                linkToOpenForMarkdown,
                "workbench.remoteTunnel.actions.manage" /* manage */,
                "workbench.remoteTunnel.actions.configure" /* configure */,
                "workbench.remoteTunnel.actions.turnOff" /* turnOff */,
                remoteExtension.friendlyName,
                "https://code.visualstudio.com/docs/remote/tunnels"
              ),
              actions: {
                primary: [
                  toAction({ id: "copyToClipboard", label: localize(18656, null), run: () => clipboardService.writeText(linkToOpen.toString(true)) }),
                  toAction({
                    id: "showExtension",
                    label: localize(18658, null),
                    run: () => {
                      return commandService.executeCommand("workbench.extensions.action.showExtensionsWithIds", [remoteExtension.extensionId]);
                    }
                  })
                ]
              }
            });
          } else {
            notificationService.notify({
              severity: Severity2.Info,
              message: localize(18670, null, connectionInfo.tunnelName, "workbench.remoteTunnel.actions.configure" /* configure */, "workbench.remoteTunnel.actions.turnOff" /* turnOff */)
            });
          }
          const usedOnHostMessage = { hostName: connectionInfo.tunnelName, timeStamp: (/* @__PURE__ */ new Date()).getTime() };
          storageService.store(REMOTE_TUNNEL_USED_STORAGE_KEY, JSON.stringify(usedOnHostMessage), -1 /* APPLICATION */, 0 /* USER */);
        } else {
          notificationService.notify({
            severity: Severity2.Info,
            message: localize(
              18668,
              null
            )
          });
          await commandService.executeCommand("workbench.remoteTunnel.actions.showLog" /* showLog */);
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.remoteTunnel.actions.manage" /* manage */,
          title: localize(18676, null),
          category: REMOTE_TUNNEL_CATEGORY,
          menu: [{
            id: MenuId.AccountsContext,
            group: "2_remoteTunnel",
            when: ContextKeyExpr.equals(REMOTE_TUNNEL_CONNECTION_STATE_KEY, "connected")
          }]
        });
      }
      async run() {
        that.showManageOptions();
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.remoteTunnel.actions.connecting" /* connecting */,
          title: localize(18675, null),
          category: REMOTE_TUNNEL_CATEGORY,
          menu: [{
            id: MenuId.AccountsContext,
            group: "2_remoteTunnel",
            when: ContextKeyExpr.equals(REMOTE_TUNNEL_CONNECTION_STATE_KEY, "connecting")
          }]
        });
      }
      async run() {
        that.showManageOptions();
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.remoteTunnel.actions.turnOff" /* turnOff */,
          title: RemoteTunnelCommandLabels.turnOff,
          category: REMOTE_TUNNEL_CATEGORY,
          precondition: ContextKeyExpr.notEquals(REMOTE_TUNNEL_CONNECTION_STATE_KEY, "disconnected"),
          menu: [{
            id: MenuId.CommandPalette,
            when: ContextKeyExpr.notEquals(REMOTE_TUNNEL_CONNECTION_STATE_KEY, "")
          }]
        });
      }
      async run() {
        const message = that.connectionInfo?.isAttached ? localize(18683, null) : localize(18682, null);
        const { confirmed } = await that.dialogService.confirm({ message });
        if (confirmed) {
          that.remoteTunnelService.stopTunnel();
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.remoteTunnel.actions.showLog" /* showLog */,
          title: RemoteTunnelCommandLabels.showLog,
          category: REMOTE_TUNNEL_CATEGORY,
          menu: [{
            id: MenuId.CommandPalette,
            when: ContextKeyExpr.notEquals(REMOTE_TUNNEL_CONNECTION_STATE_KEY, "")
          }]
        });
      }
      async run(accessor) {
        const outputService = accessor.get(IOutputService);
        outputService.showChannel(LOG_ID);
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.remoteTunnel.actions.configure" /* configure */,
          title: RemoteTunnelCommandLabels.configure,
          category: REMOTE_TUNNEL_CATEGORY,
          menu: [{
            id: MenuId.CommandPalette,
            when: ContextKeyExpr.notEquals(REMOTE_TUNNEL_CONNECTION_STATE_KEY, "")
          }]
        });
      }
      async run(accessor) {
        const preferencesService = accessor.get(IPreferencesService);
        preferencesService.openSettings({ query: CONFIGURATION_KEY_PREFIX });
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.remoteTunnel.actions.copyToClipboard" /* copyToClipboard */,
          title: RemoteTunnelCommandLabels.copyToClipboard,
          category: REMOTE_TUNNEL_CATEGORY,
          precondition: ContextKeyExpr.and(
            ContextKeyExpr.equals(REMOTE_TUNNEL_CONNECTION_STATE_KEY, "connected"),
            REMOTE_TUNNEL_HAS_LINK.isEqualTo(true)
          ),
          menu: [{
            id: MenuId.CommandPalette,
            when: ContextKeyExpr.and(
              ContextKeyExpr.equals(REMOTE_TUNNEL_CONNECTION_STATE_KEY, "connected"),
              REMOTE_TUNNEL_HAS_LINK.isEqualTo(true)
            )
          }]
        });
      }
      async run(accessor) {
        const clipboardService = accessor.get(IClipboardService);
        if (that.connectionInfo?.link) {
          const linkToOpen = that.getLinkToOpen(that.connectionInfo.link);
          clipboardService.writeText(linkToOpen.toString(true));
        }
      }
    }));
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.remoteTunnel.actions.learnMore" /* learnMore */,
          title: RemoteTunnelCommandLabels.learnMore,
          category: REMOTE_TUNNEL_CATEGORY,
          menu: []
        });
      }
      async run(accessor) {
        const openerService = accessor.get(IOpenerService);
        await openerService.open("https://aka.ms/vscode-server-doc");
      }
    }));
  }
  getLinkToOpen(link2) {
    const workspace = this.workspaceContextService.getWorkspace();
    const folders = workspace.folders;
    let resource;
    if (folders.length === 1) {
      resource = folders[0].uri;
    } else if (workspace.configuration && !isUntitledWorkspace(workspace.configuration, this.environmentService)) {
      resource = workspace.configuration;
    }
    const tunnelLink = URI.parse(link2);
    if (resource?.scheme === Schemas.file) {
      return joinPath(tunnelLink, resource.path);
    }
    return joinPath(tunnelLink, this.environmentService.userHome.path);
  }
  async showManageOptions() {
    const account = await this.remoteTunnelService.getMode();
    return new Promise((c, e) => {
      const disposables = new DisposableStore();
      const quickPick = this.quickInputService.createQuickPick({ useSeparators: true });
      quickPick.placeholder = localize(18661, null);
      disposables.add(quickPick);
      const items = [];
      items.push({ id: "workbench.remoteTunnel.actions.learnMore" /* learnMore */, label: RemoteTunnelCommandLabels.learnMore });
      if (this.connectionInfo) {
        quickPick.title = this.connectionInfo.isAttached ? localize(18663, null, this.connectionInfo.tunnelName) : localize(18665, null, this.connectionInfo.tunnelName);
        if (this.connectionInfo.link && this.connectionInfo.domain) {
          items.push({ id: "workbench.remoteTunnel.actions.copyToClipboard" /* copyToClipboard */, label: RemoteTunnelCommandLabels.copyToClipboard, description: this.connectionInfo.domain });
        }
      } else {
        quickPick.title = localize(18664, null);
      }
      items.push({ id: "workbench.remoteTunnel.actions.showLog" /* showLog */, label: localize(18662, null) });
      items.push({ type: "separator" });
      items.push({ id: "workbench.remoteTunnel.actions.configure" /* configure */, label: localize(18666, null), description: this.connectionInfo?.tunnelName });
      items.push({ id: "workbench.remoteTunnel.actions.turnOff" /* turnOff */, label: RemoteTunnelCommandLabels.turnOff, description: account.active ? `${account.session.accountLabel} (${account.session.providerId})` : void 0 });
      quickPick.items = items;
      disposables.add(quickPick.onDidAccept(() => {
        if (quickPick.selectedItems[0] && quickPick.selectedItems[0].id) {
          this.commandService.executeCommand(quickPick.selectedItems[0].id);
        }
        quickPick.hide();
      }));
      disposables.add(quickPick.onDidHide(() => {
        disposables.dispose();
        c();
      }));
      quickPick.show();
    });
  }
};

RemoteTunnelWorkbenchContribution = __decorateClass([
  __decorateParam(0, IAuthenticationService),
  __decorateParam(1, IDialogService),
  __decorateParam(2, IExtensionService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IProductService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, ILoggerService),
  __decorateParam(7, IQuickInputService),
  __decorateParam(8, INativeEnvironmentService),
  __decorateParam(9, IRemoteTunnelService),
  __decorateParam(10, ICommandService),
  __decorateParam(11, IWorkspaceContextService),
  __decorateParam(12, IProgressService),
  __decorateParam(13, INotificationService)
], RemoteTunnelWorkbenchContribution);

var workbenchRegistry13 = Registry.as(Extensions10.Workbench);

workbenchRegistry13.registerWorkbenchContribution(RemoteTunnelWorkbenchContribution, 3 /* Restored */);

Registry.as(Extensions4.Configuration).registerConfiguration({
  type: "object",
  properties: {
    [CONFIGURATION_KEY_HOST_NAME]: {
      description: localize(18684, null),
      type: "string",
      scope: 1 /* APPLICATION */,
      ignoreSync: true,
      pattern: "^(\\w[\\w-]*)?$",
      patternErrorMessage: localize(18685, null),
      maxLength: 20,
      default: ""
    },
    [CONFIGURATION_KEY_PREVENT_SLEEP]: {
      description: localize(18686, null),
      type: "boolean",
      scope: 1 /* APPLICATION */,
      default: false
    }
  }
});
export { REMOTE_TUNNEL_CATEGORY, REMOTE_TUNNEL_CONNECTION_STATE_KEY, REMOTE_TUNNEL_CONNECTION_STATE, REMOTE_TUNNEL_HAS_LINK, REMOTE_TUNNEL_USED_STORAGE_KEY, REMOTE_TUNNEL_PROMPTED_PREVIEW_STORAGE_KEY, REMOTE_TUNNEL_EXTENSION_RECOMMENDED_KEY, REMOTE_TUNNEL_HAS_USED_BEFORE, REMOTE_TUNNEL_EXTENSION_TIMEOUT, INVALID_TOKEN_RETRIES, RemoteTunnelCommandLabels, RemoteTunnelWorkbenchContribution, workbenchRegistry13 };
