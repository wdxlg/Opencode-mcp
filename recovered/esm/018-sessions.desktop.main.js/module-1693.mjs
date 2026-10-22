// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/userDataSync/browser/userDataSyncWorkbenchService.ts
import { URI } from "./module-0032.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { CONTEXT_ACCOUNT_STATE, CONTEXT_ENABLE_ACTIVITY_VIEWS, CONTEXT_ENABLE_SYNC_CONFLICTS_VIEW, CONTEXT_HAS_CONFLICTS, CONTEXT_SYNC_ENABLEMENT, CONTEXT_SYNC_STATE, IUserDataSyncWorkbenchService, SHOW_SYNC_LOG_COMMAND_ID, SYNC_CONFLICTS_VIEW_ID, SYNC_TITLE, SYNC_VIEW_CONTAINER_ID, getSyncAreaLabel } from "./module-1687.mjs";
import { equals } from "./module-0007.mjs";
import { isWeb } from "./module-0014.mjs";
import { getCurrentAuthenticationSessionInfo } from "./module-1417.mjs";
import { isDiffEditorInput } from "./module-0926.mjs";
import { IUserDataAutoSyncService, IUserDataSyncEnablementService, IUserDataSyncService, IUserDataSyncStoreManagementService, USER_DATA_SYNC_LOG_ID, USER_DATA_SYNC_SCHEME, isAuthenticationProvider } from "./module-1639.mjs";
import { env } from "./module-0015.mjs";
import { localize } from "./module-0001.mjs";
import { CancellationError } from "./module-0004.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { UserDataSyncStoreClient } from "./module-1688.mjs";
import { UserDataSyncStoreTypeSynchronizer } from "./module-1691.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { raceCancellationError } from "./module-0036.mjs";
import { escapeRegExpCharacters } from "./module-0030.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IAuthenticationService } from "./module-0952.mjs";
import { IUserDataSyncAccountService } from "./module-1640.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILogService } from "./module-0095.mjs";
import { IProductService } from "./module-0875.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IBrowserWorkbenchEnvironmentService } from "./module-0916.mjs";
import { ISecretStorageService } from "./module-0949.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IDialogService, IFileDialogService } from "./module-0267.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IViewDescriptorService } from "./module-1094.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IUserDataInitializationService } from "./module-1627.mjs";
import { IFileService } from "./module-0269.mjs";
import { IUserDataSyncMachinesService } from "./module-1692.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/userDataSync/browser/userDataSyncWorkbenchService.ts
var UserDataSyncAccount = class {
  constructor(authenticationProviderId, session) {
    this.authenticationProviderId = authenticationProviderId;
    this.session = session;
  }
  get sessionId() {
    return this.session.id;
  }
  get accountName() {
    return this.session.account.label;
  }
  get accountId() {
    return this.session.account.id;
  }
  get token() {
    return this.session.idToken || this.session.accessToken;
  }
};

function isMergeEditorInput(editor) {
  const candidate = editor;
  return URI.isUri(candidate?.base) && URI.isUri(candidate?.input1?.uri) && URI.isUri(candidate?.input2?.uri) && URI.isUri(candidate?.result);
}

var UserDataSyncWorkbenchService = class extends Disposable {
  constructor(userDataSyncService, uriIdentityService, authenticationService, userDataSyncAccountService, quickInputService, storageService, userDataSyncEnablementService, userDataAutoSyncService, logService, productService, extensionService, environmentService, secretStorageService, notificationService, progressService, dialogService, contextKeyService, viewsService, viewDescriptorService, userDataSyncStoreManagementService, lifecycleService, instantiationService, editorService, userDataInitializationService, fileService, fileDialogService, userDataSyncMachinesService) {
    super();
    this.userDataSyncService = userDataSyncService;
    this.uriIdentityService = uriIdentityService;
    this.authenticationService = authenticationService;
    this.userDataSyncAccountService = userDataSyncAccountService;
    this.quickInputService = quickInputService;
    this.storageService = storageService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this.userDataAutoSyncService = userDataAutoSyncService;
    this.logService = logService;
    this.productService = productService;
    this.extensionService = extensionService;
    this.environmentService = environmentService;
    this.secretStorageService = secretStorageService;
    this.notificationService = notificationService;
    this.progressService = progressService;
    this.dialogService = dialogService;
    this.viewsService = viewsService;
    this.viewDescriptorService = viewDescriptorService;
    this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
    this.lifecycleService = lifecycleService;
    this.instantiationService = instantiationService;
    this.editorService = editorService;
    this.userDataInitializationService = userDataInitializationService;
    this.fileService = fileService;
    this.fileDialogService = fileDialogService;
    this.userDataSyncMachinesService = userDataSyncMachinesService;
    this._authenticationProviders = [];
    this._accountStatus = "uninitialized" /* Uninitialized */;
    this._onDidChangeAccountStatus = this._register(new Emitter());
    this.onDidChangeAccountStatus = this._onDidChangeAccountStatus.event;
    this._onDidTurnOnSync = this._register(new Emitter());
    this.onDidTurnOnSync = this._onDidTurnOnSync.event;
    this.turnOnSyncCancellationToken = void 0;
    this._cachedCurrentAuthenticationProviderId = null;
    this._cachedCurrentSessionId = null;
    this.syncEnablementContext = CONTEXT_SYNC_ENABLEMENT.bindTo(contextKeyService);
    this.syncStatusContext = CONTEXT_SYNC_STATE.bindTo(contextKeyService);
    this.accountStatusContext = CONTEXT_ACCOUNT_STATE.bindTo(contextKeyService);
    this.activityViewsEnablementContext = CONTEXT_ENABLE_ACTIVITY_VIEWS.bindTo(contextKeyService);
    this.hasConflicts = CONTEXT_HAS_CONFLICTS.bindTo(contextKeyService);
    this.enableConflictsViewContext = CONTEXT_ENABLE_SYNC_CONFLICTS_VIEW.bindTo(contextKeyService);
    if (this.userDataSyncStoreManagementService.userDataSyncStore) {
      this.syncStatusContext.set(this.userDataSyncService.status);
      this._register(userDataSyncService.onDidChangeStatus((status2) => this.syncStatusContext.set(status2)));
      this.syncEnablementContext.set(userDataSyncEnablementService.isEnabled());
      this._register(userDataSyncEnablementService.onDidChangeEnablement((enabled) => this.syncEnablementContext.set(enabled)));
      this.waitAndInitialize();
    }
  }
  static {
    this.DONOT_USE_WORKBENCH_SESSION_STORAGE_KEY = "userDataSyncAccount.donotUseWorkbenchSession";
  }
  static {
    this.CACHED_AUTHENTICATION_PROVIDER_KEY = "userDataSyncAccountProvider";
  }
  static {
    this.CACHED_SESSION_STORAGE_KEY = "userDataSyncAccountPreference";
  }
  get enabled() {
    return !!this.userDataSyncStoreManagementService.userDataSyncStore;
  }
  get authenticationProviders() {
    return this._authenticationProviders;
  }
  get accountStatus() {
    return this._accountStatus;
  }
  get current() {
    return this._current;
  }
  updateAuthenticationProviders() {
    const oldValue = this._authenticationProviders;
    this._authenticationProviders = (this.userDataSyncStoreManagementService.userDataSyncStore?.authenticationProviders || []).filter(({ id: id2 }) => this.authenticationService.declaredProviders.some((provider) => provider.id === id2));
    this.logService.trace("Settings Sync: Authentication providers updated", this._authenticationProviders.map(({ id: id2 }) => id2));
    return equals(oldValue, this._authenticationProviders, (a, b) => a.id === b.id);
  }
  isSupportedAuthenticationProviderId(authenticationProviderId) {
    return this.authenticationProviders.some(({ id: id2 }) => id2 === authenticationProviderId);
  }
  async waitAndInitialize() {
    try {
      await Promise.all([this.extensionService.whenInstalledExtensionsRegistered(), this.userDataInitializationService.whenInitializationFinished()]);
      await this.initialize();
    } catch (error) {
      if (!this.environmentService.extensionTestsLocationURI) {
        this.logService.error(error);
      }
    }
  }
  async initialize() {
    if (isWeb) {
      const authenticationSession = await getCurrentAuthenticationSessionInfo(this.secretStorageService, this.productService);
      if (this.currentSessionId === void 0 && authenticationSession?.id) {
        if (this.environmentService.options?.settingsSyncOptions?.authenticationProvider && this.environmentService.options.settingsSyncOptions.enabled) {
          this.currentSessionId = authenticationSession.id;
        } else if (this.useWorkbenchSessionId) {
          this.currentSessionId = authenticationSession.id;
        }
        this.useWorkbenchSessionId = false;
      }
    }
    const initPromise = this.update("initialize");
    this._register(this.authenticationService.onDidChangeDeclaredProviders(() => {
      if (this.updateAuthenticationProviders()) {
        initPromise.finally(() => this.update("declared authentication providers changed"));
      }
    }));
    await initPromise;
    this._register(Event2.filter(
      Event2.any(
        this.authenticationService.onDidRegisterAuthenticationProvider,
        this.authenticationService.onDidUnregisterAuthenticationProvider
      ),
      (info) => this.isSupportedAuthenticationProviderId(info.id)
    )(() => this.update("authentication provider change")));
    this._register(Event2.filter(this.userDataSyncAccountService.onTokenFailed, (isSuccessive) => !isSuccessive)(() => this.update("token failure")));
    this._register(Event2.filter(this.authenticationService.onDidChangeSessions, (e4) => this.isSupportedAuthenticationProviderId(e4.providerId))(({ event }) => this.onDidChangeSessions(event)));
    this._register(this.storageService.onDidChangeValue(-1 /* APPLICATION */, UserDataSyncWorkbenchService.CACHED_SESSION_STORAGE_KEY, this._store)(() => this.onDidChangeStorage()));
    this._register(Event2.filter(this.userDataSyncAccountService.onTokenFailed, (bailout) => bailout)(() => this.onDidAuthFailure()));
    this.hasConflicts.set(this.userDataSyncService.conflicts.length > 0);
    this._register(this.userDataSyncService.onDidChangeConflicts((conflicts) => {
      this.hasConflicts.set(conflicts.length > 0);
      if (!conflicts.length) {
        this.enableConflictsViewContext.reset();
      }
      this.editorService.editors.filter((input) => {
        const remoteResource = isDiffEditorInput(input) ? input.original.resource : isMergeEditorInput(input) ? input.input1.uri : void 0;
        if (remoteResource?.scheme !== USER_DATA_SYNC_SCHEME) {
          return false;
        }
        return !this.userDataSyncService.conflicts.some(({ conflicts: conflicts2 }) => conflicts2.some(({ previewResource }) => this.uriIdentityService.extUri.isEqual(previewResource, input.resource)));
      }).forEach((input) => input.dispose());
    }));
  }
  async update(reason) {
    this.logService.trace(`Settings Sync: Updating due to ${reason}`);
    this.updateAuthenticationProviders();
    await this.updateCurrentAccount();
    if (this._current) {
      this.currentAuthenticationProviderId = this._current.authenticationProviderId;
    }
    await this.updateToken(this._current);
    this.updateAccountStatus(this._current ? "available" /* Available */ : "unavailable" /* Unavailable */);
  }
  async updateCurrentAccount() {
    this.logService.trace("Settings Sync: Updating the current account");
    const currentSessionId = this.currentSessionId;
    const currentAuthenticationProviderId = this.currentAuthenticationProviderId;
    if (currentSessionId) {
      const authenticationProviders = currentAuthenticationProviderId ? this.authenticationProviders.filter(({ id: id2 }) => id2 === currentAuthenticationProviderId) : this.authenticationProviders;
      for (const { id: id2, scopes } of authenticationProviders) {
        const sessions = await this.authenticationService.getSessions(id2, scopes) || [];
        for (const session of sessions) {
          if (session.id === currentSessionId) {
            this._current = new UserDataSyncAccount(id2, session);
            this.logService.trace("Settings Sync: Updated the current account", this._current.accountName);
            return;
          }
        }
      }
    }
    this._current = void 0;
  }
  async updateToken(current) {
    let value2 = void 0;
    if (current) {
      try {
        const token = current.token;
        value2 = { token, authenticationProviderId: current.authenticationProviderId };
      } catch (e4) {
        this.logService.error(e4);
      }
    }
    await this.userDataSyncAccountService.updateAccount(value2);
  }
  updateAccountStatus(accountStatus) {
    this.logService.trace(`Settings Sync: Updating the account status to ${accountStatus}`);
    if (this._accountStatus !== accountStatus) {
      const previous = this._accountStatus;
      const logMsg = `Settings Sync: Account status changed from ${previous} to ${accountStatus}`;
      if (env.VSCODE_DEV) {
        this.logService.trace(logMsg);
      } else {
        this.logService.info(logMsg);
      }
      this._accountStatus = accountStatus;
      this.accountStatusContext.set(accountStatus);
      this._onDidChangeAccountStatus.fire(accountStatus);
    }
  }
  async turnOn() {
    if (!this.authenticationProviders.length) {
      throw new Error(localize(23682, null));
    }
    if (this.userDataSyncEnablementService.isEnabled()) {
      return;
    }
    if (this.userDataSyncService.status !== "idle" /* Idle */) {
      throw new Error("Cannot turn on sync while syncing");
    }
    const picked = await this.pick();
    if (!picked) {
      throw new CancellationError();
    }
    if (this.accountStatus !== "available" /* Available */) {
      throw new Error(localize(23681, null));
    }
    const turnOnSyncCancellationToken = this.turnOnSyncCancellationToken = new CancellationTokenSource();
    const disposable = isWeb ? Disposable.None : this.lifecycleService.onBeforeShutdown((e4) => e4.veto((async () => {
      const { confirmed } = await this.dialogService.confirm({
        type: "warning",
        message: localize(23698, null),
        title: localize(23694, null),
        primaryButton: localize(23702, null),
        cancelButton: localize(23680, null)
      });
      if (confirmed) {
        turnOnSyncCancellationToken.cancel();
      }
      return !confirmed;
    })(), "veto.settingsSync"));
    try {
      await this.doTurnOnSync(turnOnSyncCancellationToken.token);
    } finally {
      disposable.dispose();
      this.turnOnSyncCancellationToken = void 0;
    }
    await this.userDataAutoSyncService.turnOn();
    if (this.userDataSyncStoreManagementService.userDataSyncStore?.canSwitch) {
      await this.synchroniseUserDataSyncStoreType();
    }
    this.currentAuthenticationProviderId = this.current?.authenticationProviderId;
    if (this.environmentService.options?.settingsSyncOptions?.enablementHandler && this.currentAuthenticationProviderId) {
      this.environmentService.options.settingsSyncOptions.enablementHandler(true, this.currentAuthenticationProviderId);
    }
    this.notificationService.info(localize(23699, null, SYNC_TITLE.value));
    this._onDidTurnOnSync.fire();
  }
  async turnoff(everywhere) {
    if (this.userDataSyncEnablementService.isEnabled()) {
      await this.userDataAutoSyncService.turnOff(everywhere);
      if (this.environmentService.options?.settingsSyncOptions?.enablementHandler && this.currentAuthenticationProviderId) {
        this.environmentService.options.settingsSyncOptions.enablementHandler(false, this.currentAuthenticationProviderId);
      }
    }
    if (this.turnOnSyncCancellationToken) {
      this.turnOnSyncCancellationToken.cancel();
    }
  }
  async synchroniseUserDataSyncStoreType() {
    if (!this.userDataSyncAccountService.account) {
      throw new Error("Cannot update because you are signed out from settings sync. Please sign in and try again.");
    }
    if (!isWeb || !this.userDataSyncStoreManagementService.userDataSyncStore) {
      return;
    }
    const userDataSyncStoreUrl = this.userDataSyncStoreManagementService.userDataSyncStore.type === "insiders" ? this.userDataSyncStoreManagementService.userDataSyncStore.stableUrl : this.userDataSyncStoreManagementService.userDataSyncStore.insidersUrl;
    const userDataSyncStoreClient = this.instantiationService.createInstance(UserDataSyncStoreClient, userDataSyncStoreUrl);
    userDataSyncStoreClient.setAuthToken(this.userDataSyncAccountService.account.token, this.userDataSyncAccountService.account.authenticationProviderId);
    await this.instantiationService.createInstance(UserDataSyncStoreTypeSynchronizer, userDataSyncStoreClient).sync(this.userDataSyncStoreManagementService.userDataSyncStore.type);
  }
  syncNow() {
    return this.userDataAutoSyncService.triggerSync(["Sync Now"], { immediately: true, disableCache: true });
  }
  async doTurnOnSync(token) {
    const disposables = new DisposableStore();
    const manualSyncTask = await this.userDataSyncService.createManualSyncTask();
    try {
      await this.progressService.withProgress({
        location: 10 /* Window */,
        title: SYNC_TITLE.value,
        command: SHOW_SYNC_LOG_COMMAND_ID,
        delay: 500
      }, async (progress) => {
        progress.report({ message: localize(23701, null) });
        disposables.add(this.userDataSyncService.onDidChangeStatus((status2) => {
          if (status2 === "hasConflicts" /* HasConflicts */) {
            progress.report({ message: localize(23693, null) });
          } else {
            progress.report({ message: localize(23700, null) });
          }
        }));
        await manualSyncTask.merge();
        if (this.userDataSyncService.status === "hasConflicts" /* HasConflicts */) {
          await this.handleConflictsWhileTurningOn(token);
        }
        await manualSyncTask.apply();
      });
    } catch (error) {
      await manualSyncTask.stop();
      throw error;
    } finally {
      disposables.dispose();
    }
  }
  async handleConflictsWhileTurningOn(token) {
    const conflicts = this.userDataSyncService.conflicts;
    const andSeparator = localize(23674, null);
    let conflictsText = "";
    for (let i2 = 0; i2 < conflicts.length; i2++) {
      if (i2 === conflicts.length - 1 && i2 !== 0) {
        conflictsText += andSeparator;
      } else if (i2 !== 0) {
        conflictsText += ", ";
      }
      conflictsText += getSyncAreaLabel(conflicts[i2].syncResource);
    }
    const singleConflictResource = conflicts.length === 1 ? getSyncAreaLabel(conflicts[0].syncResource) : void 0;
    await this.dialogService.prompt({
      type: Severity2.Warning,
      message: localize(23676, null, conflictsText),
      detail: localize(23692, null),
      buttons: [
        {
          label: localize(23695, null),
          run: async () => {
            const waitUntilConflictsAreResolvedPromise = raceCancellationError(Event2.toPromise(Event2.filter(this.userDataSyncService.onDidChangeConflicts, (conficts) => conficts.length === 0)), token);
            await this.showConflicts(this.userDataSyncService.conflicts[0]?.conflicts[0]);
            await waitUntilConflictsAreResolvedPromise;
          }
        },
        {
          label: singleConflictResource ? localize(23686, null, singleConflictResource) : localize(23685, null),
          run: async () => this.replace(true)
        },
        {
          label: singleConflictResource ? localize(23688, null, singleConflictResource) : localize(23687, null),
          run: () => this.replace(false)
        }
      ],
      cancelButton: {
        run: () => {
          throw new CancellationError();
        }
      }
    });
  }
  async replace(local) {
    for (const conflict of this.userDataSyncService.conflicts) {
      for (const preview of conflict.conflicts) {
        await this.accept({ syncResource: conflict.syncResource, profile: conflict.profile }, local ? preview.remoteResource : preview.localResource, void 0, { force: true });
      }
    }
  }
  async accept(resource, conflictResource, content, apply2) {
    return this.userDataSyncService.accept(resource, conflictResource, content, apply2);
  }
  async showConflicts(conflictToOpen) {
    if (!this.userDataSyncService.conflicts.length) {
      return;
    }
    this.enableConflictsViewContext.set(true);
    const view = await this.viewsService.openView(SYNC_CONFLICTS_VIEW_ID);
    if (view && conflictToOpen) {
      await view.open(conflictToOpen);
    }
  }
  async resetSyncedData() {
    const { confirmed } = await this.dialogService.confirm({
      type: "info",
      message: localize(23689, null),
      title: localize(23690, null),
      primaryButton: localize(23691, null)
    });
    if (confirmed) {
      await this.userDataSyncService.resetRemote();
    }
  }
  async getAllLogResources() {
    const logsFolders = [];
    const stat = await this.fileService.resolve(this.uriIdentityService.extUri.dirname(this.environmentService.logsHome));
    if (stat.children) {
      logsFolders.push(...stat.children.filter((stat2) => stat2.isDirectory && /^\d{8}T\d{6}$/.test(stat2.name)).sort().reverse().map((d) => d.resource));
    }
    const result = [];
    for (const logFolder of logsFolders) {
      const folderStat = await this.fileService.resolve(logFolder);
      const childStat = folderStat.children?.find((stat2) => this.uriIdentityService.extUri.basename(stat2.resource).startsWith(`${USER_DATA_SYNC_LOG_ID}.`));
      if (childStat) {
        result.push(childStat.resource);
      }
    }
    return result;
  }
  async showSyncActivity() {
    this.activityViewsEnablementContext.set(true);
    await this.waitForActiveSyncViews();
    await this.viewsService.openViewContainer(SYNC_VIEW_CONTAINER_ID);
  }
  async downloadSyncActivity() {
    const result = await this.fileDialogService.showOpenDialog({
      title: localize(23678, null),
      canSelectFiles: false,
      canSelectFolders: true,
      canSelectMany: false,
      openLabel: localize(23677, null)
    });
    if (!result?.[0]) {
      return;
    }
    return this.progressService.withProgress({ location: 10 /* Window */ }, async () => {
      const machines = await this.userDataSyncMachinesService.getMachines();
      const currentMachine = machines.find((m) => m.isCurrent);
      const name = (currentMachine ? currentMachine.name + " - " : "") + "Settings Sync Activity";
      const stat = await this.fileService.resolve(result[0]);
      const nameRegEx = new RegExp(`${escapeRegExpCharacters(name)}\\s(\\d+)`);
      const indexes = [];
      for (const child of stat.children ?? []) {
        if (child.name === name) {
          indexes.push(0);
        } else {
          const matches2 = nameRegEx.exec(child.name);
          if (matches2) {
            indexes.push(parseInt(matches2[1]));
          }
        }
      }
      indexes.sort((a, b) => a - b);
      const folder = this.uriIdentityService.extUri.joinPath(result[0], indexes[0] !== 0 ? name : `${name} ${indexes[indexes.length - 1] + 1}`);
      await Promise.all([
        this.userDataSyncService.saveRemoteActivityData(this.uriIdentityService.extUri.joinPath(folder, "remoteActivity.json")),
        (async () => {
          const logResources = await this.getAllLogResources();
          await Promise.all(logResources.map(async (logResource) => this.fileService.copy(logResource, this.uriIdentityService.extUri.joinPath(folder, "logs", `${this.uriIdentityService.extUri.basename(this.uriIdentityService.extUri.dirname(logResource))}.log`))));
        })(),
        this.fileService.copy(this.environmentService.userDataSyncHome, this.uriIdentityService.extUri.joinPath(folder, "localActivity"))
      ]);
      return folder;
    });
  }
  async waitForActiveSyncViews() {
    const viewContainer = this.viewDescriptorService.getViewContainerById(SYNC_VIEW_CONTAINER_ID);
    if (viewContainer) {
      const model = this.viewDescriptorService.getViewContainerModel(viewContainer);
      if (!model.activeViewDescriptors.length) {
        await Event2.toPromise(Event2.filter(model.onDidChangeActiveViewDescriptors, (e4) => model.activeViewDescriptors.length > 0));
      }
    }
  }
  async signIn() {
    const currentAuthenticationProviderId = this.currentAuthenticationProviderId;
    const authenticationProvider = currentAuthenticationProviderId ? this.authenticationProviders.find((p) => p.id === currentAuthenticationProviderId) : void 0;
    if (authenticationProvider) {
      await this.doSignIn(authenticationProvider);
    } else {
      if (!this.authenticationProviders.length) {
        throw new Error(localize(23683, null));
      }
      await this.pick();
    }
  }
  async pick() {
    const result = await this.doPick();
    if (!result) {
      return false;
    }
    await this.doSignIn(result);
    return true;
  }
  async doPick() {
    if (this.authenticationProviders.length === 0) {
      return void 0;
    }
    const authenticationProviders = [...this.authenticationProviders].sort(({ id: id2 }) => id2 === this.currentAuthenticationProviderId ? -1 : 1);
    const allAccounts = /* @__PURE__ */ new Map();
    if (authenticationProviders.length === 1) {
      const accounts = await this.getAccounts(authenticationProviders[0].id, authenticationProviders[0].scopes);
      if (accounts.length) {
        allAccounts.set(authenticationProviders[0].id, accounts);
      } else {
        return authenticationProviders[0];
      }
    }
    let result;
    const disposables = new DisposableStore();
    const quickPick = disposables.add(this.quickInputService.createQuickPick({ useSeparators: true }));
    const promise = new Promise((c) => {
      disposables.add(quickPick.onDidHide(() => {
        disposables.dispose();
        c(result);
      }));
    });
    quickPick.title = SYNC_TITLE.value;
    quickPick.ok = false;
    quickPick.ignoreFocusOut = true;
    quickPick.placeholder = localize(23675, null);
    quickPick.show();
    if (authenticationProviders.length > 1) {
      quickPick.busy = true;
      for (const { id: id2, scopes } of authenticationProviders) {
        const accounts = await this.getAccounts(id2, scopes);
        if (accounts.length) {
          allAccounts.set(id2, accounts);
        }
      }
      quickPick.busy = false;
    }
    quickPick.items = this.createQuickpickItems(authenticationProviders, allAccounts);
    disposables.add(quickPick.onDidAccept(() => {
      result = quickPick.selectedItems[0]?.account ? quickPick.selectedItems[0]?.account : quickPick.selectedItems[0]?.authenticationProvider;
      quickPick.hide();
    }));
    return promise;
  }
  async getAccounts(authenticationProviderId, scopes) {
    const accounts = /* @__PURE__ */ new Map();
    let currentAccount = null;
    const sessions = await this.authenticationService.getSessions(authenticationProviderId, scopes) || [];
    for (const session of sessions) {
      const account = new UserDataSyncAccount(authenticationProviderId, session);
      accounts.set(account.accountId, account);
      if (account.sessionId === this.currentSessionId) {
        currentAccount = account;
      }
    }
    if (currentAccount) {
      accounts.set(currentAccount.accountId, currentAccount);
    }
    return currentAccount ? [...accounts.values()] : [...accounts.values()].sort(({ sessionId }) => sessionId === this.currentSessionId ? -1 : 1);
  }
  createQuickpickItems(authenticationProviders, allAccounts) {
    const quickPickItems = [];
    if (allAccounts.size) {
      quickPickItems.push({ type: "separator", label: localize(23697, null) });
      for (const authenticationProvider of authenticationProviders) {
        const accounts = (allAccounts.get(authenticationProvider.id) || []).sort(({ sessionId }) => sessionId === this.currentSessionId ? -1 : 1);
        const providerName = this.authenticationService.getProvider(authenticationProvider.id).label;
        for (const account of accounts) {
          quickPickItems.push({
            label: `${account.accountName} (${providerName})`,
            description: account.sessionId === this.current?.sessionId ? localize(23679, null) : void 0,
            account,
            authenticationProvider
          });
        }
      }
      quickPickItems.push({ type: "separator", label: localize(23684, null) });
    }
    for (const authenticationProvider of authenticationProviders) {
      const provider = this.authenticationService.getProvider(authenticationProvider.id);
      if (!allAccounts.has(authenticationProvider.id) || provider.supportsMultipleAccounts) {
        const providerName = provider.label;
        quickPickItems.push({ label: localize(23696, null, providerName), authenticationProvider });
      }
    }
    return quickPickItems;
  }
  async doSignIn(accountOrAuthProvider) {
    let sessionId;
    if (isAuthenticationProvider(accountOrAuthProvider)) {
      if (this.environmentService.options?.settingsSyncOptions?.authenticationProvider?.id === accountOrAuthProvider.id) {
        sessionId = await this.environmentService.options?.settingsSyncOptions?.authenticationProvider?.signIn();
      } else {
        sessionId = (await this.authenticationService.createSession(accountOrAuthProvider.id, accountOrAuthProvider.scopes)).id;
      }
      this.currentAuthenticationProviderId = accountOrAuthProvider.id;
    } else {
      if (this.environmentService.options?.settingsSyncOptions?.authenticationProvider?.id === accountOrAuthProvider.authenticationProviderId) {
        sessionId = await this.environmentService.options?.settingsSyncOptions?.authenticationProvider?.signIn();
      } else {
        sessionId = accountOrAuthProvider.sessionId;
      }
      this.currentAuthenticationProviderId = accountOrAuthProvider.authenticationProviderId;
    }
    this.currentSessionId = sessionId;
    await this.update("sign in");
  }
  async onDidAuthFailure() {
    this.currentSessionId = void 0;
    await this.update("auth failure");
  }
  onDidChangeSessions(e4) {
    if (this.currentSessionId && e4.removed?.find((session) => session.id === this.currentSessionId)) {
      this.currentSessionId = void 0;
    }
    this.update("change in sessions");
  }
  onDidChangeStorage() {
    if (this.currentSessionId !== this.getStoredCachedSessionId()) {
      this._cachedCurrentSessionId = null;
      this.update("change in storage");
    }
  }
  get currentAuthenticationProviderId() {
    if (this._cachedCurrentAuthenticationProviderId === null) {
      this._cachedCurrentAuthenticationProviderId = this.storageService.get(UserDataSyncWorkbenchService.CACHED_AUTHENTICATION_PROVIDER_KEY, -1 /* APPLICATION */);
    }
    return this._cachedCurrentAuthenticationProviderId;
  }
  set currentAuthenticationProviderId(currentAuthenticationProviderId) {
    if (this._cachedCurrentAuthenticationProviderId !== currentAuthenticationProviderId) {
      this._cachedCurrentAuthenticationProviderId = currentAuthenticationProviderId;
      if (currentAuthenticationProviderId === void 0) {
        this.storageService.remove(UserDataSyncWorkbenchService.CACHED_AUTHENTICATION_PROVIDER_KEY, -1 /* APPLICATION */);
      } else {
        this.storageService.store(UserDataSyncWorkbenchService.CACHED_AUTHENTICATION_PROVIDER_KEY, currentAuthenticationProviderId, -1 /* APPLICATION */, 1 /* MACHINE */);
      }
    }
  }
  get currentSessionId() {
    if (this._cachedCurrentSessionId === null) {
      this._cachedCurrentSessionId = this.getStoredCachedSessionId();
    }
    return this._cachedCurrentSessionId;
  }
  set currentSessionId(cachedSessionId) {
    if (this._cachedCurrentSessionId !== cachedSessionId) {
      this._cachedCurrentSessionId = cachedSessionId;
      if (cachedSessionId === void 0) {
        this.logService.info("Settings Sync: Reset current session");
        this.storageService.remove(UserDataSyncWorkbenchService.CACHED_SESSION_STORAGE_KEY, -1 /* APPLICATION */);
      } else {
        this.logService.info("Settings Sync: Updated current session", cachedSessionId);
        this.storageService.store(UserDataSyncWorkbenchService.CACHED_SESSION_STORAGE_KEY, cachedSessionId, -1 /* APPLICATION */, 1 /* MACHINE */);
      }
    }
  }
  getStoredCachedSessionId() {
    return this.storageService.get(UserDataSyncWorkbenchService.CACHED_SESSION_STORAGE_KEY, -1 /* APPLICATION */);
  }
  get useWorkbenchSessionId() {
    return !this.storageService.getBoolean(UserDataSyncWorkbenchService.DONOT_USE_WORKBENCH_SESSION_STORAGE_KEY, -1 /* APPLICATION */, false);
  }
  set useWorkbenchSessionId(useWorkbenchSession) {
    this.storageService.store(UserDataSyncWorkbenchService.DONOT_USE_WORKBENCH_SESSION_STORAGE_KEY, !useWorkbenchSession, -1 /* APPLICATION */, 1 /* MACHINE */);
  }
};

UserDataSyncWorkbenchService = __decorateClass([
  __decorateParam(0, IUserDataSyncService),
  __decorateParam(1, IUriIdentityService),
  __decorateParam(2, IAuthenticationService),
  __decorateParam(3, IUserDataSyncAccountService),
  __decorateParam(4, IQuickInputService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IUserDataSyncEnablementService),
  __decorateParam(7, IUserDataAutoSyncService),
  __decorateParam(8, ILogService),
  __decorateParam(9, IProductService),
  __decorateParam(10, IExtensionService),
  __decorateParam(11, IBrowserWorkbenchEnvironmentService),
  __decorateParam(12, ISecretStorageService),
  __decorateParam(13, INotificationService),
  __decorateParam(14, IProgressService),
  __decorateParam(15, IDialogService),
  __decorateParam(16, IContextKeyService),
  __decorateParam(17, IViewsService),
  __decorateParam(18, IViewDescriptorService),
  __decorateParam(19, IUserDataSyncStoreManagementService),
  __decorateParam(20, ILifecycleService),
  __decorateParam(21, IInstantiationService),
  __decorateParam(22, IEditorService),
  __decorateParam(23, IUserDataInitializationService),
  __decorateParam(24, IFileService),
  __decorateParam(25, IFileDialogService),
  __decorateParam(26, IUserDataSyncMachinesService)
], UserDataSyncWorkbenchService);

registerSingleton(
  IUserDataSyncWorkbenchService,
  UserDataSyncWorkbenchService,
  0 /* Eager */
  /* Eager because it initializes settings sync accounts */
);
export { isMergeEditorInput, UserDataSyncAccount, UserDataSyncWorkbenchService };
