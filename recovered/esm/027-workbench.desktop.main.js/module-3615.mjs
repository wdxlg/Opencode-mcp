// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/userDataSync/browser/userDataSync.ts
import { localize, localize2 } from "./module-0001.mjs";
import { CONFIGURE_SYNC_COMMAND_ID, CONTEXT_ACCOUNT_STATE, CONTEXT_HAS_CONFLICTS, CONTEXT_SYNC_ENABLEMENT, CONTEXT_SYNC_STATE, DOWNLOAD_ACTIVITY_ACTION_DESCRIPTOR, IUserDataSyncWorkbenchService, SHOW_SYNC_LOG_COMMAND_ID, SYNC_TITLE, SYNC_VIEW_CONTAINER_ID, SYNC_VIEW_ICON, getSyncAreaLabel } from "./module-1744.mjs";
import { fromNow } from "./module-0120.mjs";
import { ContextKeyExpr, ContextKeyTrueExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { IUserDataAutoSyncService, IUserDataSyncEnablementService, IUserDataSyncService, IUserDataSyncStoreManagementService, USER_DATA_SYNC_LOG_ID, USER_DATA_SYNC_SCHEME, UserDataSyncError, registerConfiguration2 } from "./module-1696.mjs";
import { Event2 } from "./module-0017.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { toAction } from "./module-0082.mjs";
import { EditorResourceAccessor } from "./module-0925.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { IActivityService, NumberBadge, ProgressBadge } from "./module-1449.mjs";
import { getErrorMessage, isCancellationError } from "./module-0004.mjs";
import { isWeb } from "./module-0014.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { Codicon } from "./module-0085.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IPreferencesService } from "./module-1294.mjs";
import { Categories } from "./module-0847.mjs";
import { URI } from "./module-0032.mjs";
import { ctxIsMergeResultEditor, ctxMergeBaseUri } from "./module-1141.mjs";
import { ITextFileService } from "./module-1063.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions13 } from "./module-1093.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { ViewPaneContainer } from "./module-1382.mjs";
import { UserDataSyncDataViews } from "./module-3614.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IUserDataProfileService } from "./module-0997.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IOutputService } from "./module-1245.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IProductService } from "./module-0873.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IAuthenticationService } from "./module-0951.mjs";
import { IHostService } from "./module-1117.mjs";
import { IWorkbenchIssueService } from "./module-1876.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";


// src/vs/workbench/contrib/userDataSync/browser/userDataSync.ts
var turnOffSyncCommand = { id: "workbench.userDataSync.actions.turnOff", title: localize2(21750, "Turn Off") };

var configureSyncCommand = { id: CONFIGURE_SYNC_COMMAND_ID, title: localize2(21712, "Configure...") };

var showConflictsCommandId = "workbench.userDataSync.actions.showConflicts";

var syncNowCommand = {
  id: "workbench.userDataSync.actions.syncNow",
  title: localize2(21754, "Sync Now"),
  description(userDataSyncService) {
    if (userDataSyncService.status === "syncing" /* Syncing */) {
      return localize(21757, null);
    }
    if (userDataSyncService.lastSyncTime) {
      return localize(21756, null, fromNow(userDataSyncService.lastSyncTime, true));
    }
    return void 0;
  }
};

var showSyncSettingsCommand = { id: "workbench.userDataSync.actions.settings", title: localize2(21755, "Show Settings") };

var showSyncedDataCommand = { id: "workbench.userDataSync.actions.showSyncedData", title: localize2(21743, "Show Synced Data") };

var CONTEXT_TURNING_ON_STATE = new RawContextKey("userDataSyncTurningOn", false);

var UserDataSyncWorkbenchContribution = class extends Disposable {
  constructor(userDataSyncEnablementService, userDataSyncService, userDataSyncWorkbenchService, contextKeyService, activityService, notificationService, editorService, userDataProfileService, dialogService, quickInputService, instantiationService, outputService, userDataAutoSyncService, textModelResolverService, preferencesService, telemetryService, productService, openerService, authenticationService, userDataSyncStoreManagementService, hostService, commandService, workbenchIssueService) {
    super();
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this.userDataSyncService = userDataSyncService;
    this.userDataSyncWorkbenchService = userDataSyncWorkbenchService;
    this.activityService = activityService;
    this.notificationService = notificationService;
    this.editorService = editorService;
    this.userDataProfileService = userDataProfileService;
    this.dialogService = dialogService;
    this.quickInputService = quickInputService;
    this.instantiationService = instantiationService;
    this.outputService = outputService;
    this.preferencesService = preferencesService;
    this.telemetryService = telemetryService;
    this.productService = productService;
    this.openerService = openerService;
    this.authenticationService = authenticationService;
    this.userDataSyncStoreManagementService = userDataSyncStoreManagementService;
    this.hostService = hostService;
    this.commandService = commandService;
    this.workbenchIssueService = workbenchIssueService;
    this.globalActivityBadgeDisposable = this._register(new MutableDisposable());
    this.accountBadgeDisposable = this._register(new MutableDisposable());
    this.conflictsDisposables = /* @__PURE__ */ new Map();
    this.invalidContentErrorDisposables = /* @__PURE__ */ new Map();
    this.conflictsActionDisposable = this._register(new MutableDisposable());
    this.turningOnSyncContext = CONTEXT_TURNING_ON_STATE.bindTo(contextKeyService);
    if (userDataSyncWorkbenchService.enabled) {
      registerConfiguration2();
      this.updateAccountBadge();
      this.updateGlobalActivityBadge();
      this.onDidChangeConflicts(this.userDataSyncService.conflicts);
      this._register(Event2.any(
        Event2.debounce(userDataSyncService.onDidChangeStatus, () => void 0, 500),
        this.userDataSyncEnablementService.onDidChangeEnablement,
        this.userDataSyncWorkbenchService.onDidChangeAccountStatus
      )(() => {
        this.updateAccountBadge();
        this.updateGlobalActivityBadge();
      }));
      this._register(userDataSyncService.onDidChangeConflicts(() => this.onDidChangeConflicts(this.userDataSyncService.conflicts)));
      this._register(userDataSyncEnablementService.onDidChangeEnablement(() => this.onDidChangeConflicts(this.userDataSyncService.conflicts)));
      this._register(userDataSyncService.onSyncErrors((errors) => this.onSynchronizerErrors(errors)));
      this._register(userDataAutoSyncService.onError((error) => this.onAutoSyncError(error)));
      this.registerActions();
      this.registerViews();
      textModelResolverService.registerTextModelContentProvider(USER_DATA_SYNC_SCHEME, instantiationService.createInstance(UserDataRemoteContentProvider));
      this._register(Event2.any(userDataSyncService.onDidChangeStatus, userDataSyncEnablementService.onDidChangeEnablement)(() => this.turningOnSync = !userDataSyncEnablementService.isEnabled() && userDataSyncService.status !== "idle" /* Idle */));
    }
  }
  get turningOnSync() {
    return !!this.turningOnSyncContext.get();
  }
  set turningOnSync(turningOn) {
    this.turningOnSyncContext.set(turningOn);
    this.updateGlobalActivityBadge();
  }
  toKey({ syncResource: resource, profile }) {
    return `${profile.id}:${resource}`;
  }
  onDidChangeConflicts(conflicts) {
    this.updateGlobalActivityBadge();
    this.registerShowConflictsAction();
    if (!this.userDataSyncEnablementService.isEnabled()) {
      return;
    }
    if (conflicts.length) {
      for (const [key3, disposable] of this.conflictsDisposables.entries()) {
        if (!conflicts.some((conflict) => this.toKey(conflict) === key3)) {
          disposable.dispose();
          this.conflictsDisposables.delete(key3);
        }
      }
      for (const conflict of this.userDataSyncService.conflicts) {
        const key3 = this.toKey(conflict);
        if (!this.conflictsDisposables.has(key3)) {
          const conflictsArea = getSyncAreaLabel(conflict.syncResource);
          const handle2 = this.notificationService.prompt(
            Severity2.Warning,
            localize(21715, null, conflictsArea.toLowerCase()),
            [
              {
                label: localize(21731, null),
                run: () => {
                  this.acceptLocal(conflict, conflict.conflicts[0]);
                }
              },
              {
                label: localize(21730, null),
                run: () => {
                  this.acceptRemote(conflict, conflict.conflicts[0]);
                }
              },
              {
                label: localize(21739, null),
                run: () => {
                  this.telemetryService.publicLog2("sync/showConflicts", { source: conflict.syncResource });
                  this.userDataSyncWorkbenchService.showConflicts(conflict.conflicts[0]);
                }
              }
            ],
            {
              sticky: true
            }
          );
          this.conflictsDisposables.set(key3, toDisposable(() => {
            handle2.close();
            this.conflictsDisposables.delete(key3);
          }));
        }
      }
    } else {
      this.conflictsDisposables.forEach((disposable) => disposable.dispose());
      this.conflictsDisposables.clear();
    }
  }
  async acceptRemote(syncResource, conflict) {
    try {
      await this.userDataSyncService.accept(syncResource, conflict.remoteResource, void 0, this.userDataSyncEnablementService.isEnabled());
    } catch (e) {
      this.notificationService.error(localize(21706, null, `command:${SHOW_SYNC_LOG_COMMAND_ID}`));
    }
  }
  async acceptLocal(syncResource, conflict) {
    try {
      await this.userDataSyncService.accept(syncResource, conflict.localResource, void 0, this.userDataSyncEnablementService.isEnabled());
    } catch (e) {
      this.notificationService.error(localize(21706, null, `command:${SHOW_SYNC_LOG_COMMAND_ID}`));
    }
  }
  onAutoSyncError(error) {
    switch (error.code) {
      case "SessionExpired" /* SessionExpired */:
        this.notificationService.notify({
          severity: Severity2.Info,
          message: localize(21738, null),
          actions: {
            primary: [toAction({
              id: "turn on sync",
              label: localize(21768, null),
              run: () => this.turnOn()
            })]
          }
        });
        break;
      case "TurnedOff" /* TurnedOff */:
        this.notificationService.notify({
          severity: Severity2.Info,
          message: localize(21769, null),
          actions: {
            primary: [toAction({
              id: "turn on sync",
              label: localize(21768, null),
              run: () => this.turnOn()
            })]
          }
        });
        break;
      case "TooLarge" /* TooLarge */:
        if (error.resource === "keybindings" /* Keybindings */ || error.resource === "settings" /* Settings */ || error.resource === "tasks" /* Tasks */) {
          this.disableSync(error.resource);
          const sourceArea = getSyncAreaLabel(error.resource);
          this.handleTooLargeError(error.resource, localize(21758, null, sourceArea.toLowerCase(), sourceArea.toLowerCase(), "100kb"), error);
        }
        break;
      case "LocalTooManyProfiles" /* LocalTooManyProfiles */:
        this.disableSync("profiles" /* Profiles */);
        this.notificationService.error(localize(21760, null));
        break;
      case "IncompatibleLocalContent" /* IncompatibleLocalContent */:
      case "Gone" /* Gone */:
      case "UpgradeRequired" /* UpgradeRequired */: {
        const message = localize(21720, null, this.productService.version, this.productService.commit);
        const operationId = error.operationId ? localize(21729, null, error.operationId) : void 0;
        this.notificationService.notify({
          severity: Severity2.Error,
          message: operationId ? `${message} ${operationId}` : message
        });
        break;
      }
      case "MethodNotFound" /* MethodNotFound */: {
        const message = localize(21726, null);
        const operationId = error.operationId ? localize(21729, null, error.operationId) : void 0;
        this.notificationService.notify({
          severity: Severity2.Error,
          message: operationId ? `${message} ${operationId}` : message,
          actions: {
            primary: [
              toAction({
                id: "Show Sync Logs",
                label: localize(21742, null),
                run: () => this.commandService.executeCommand(SHOW_SYNC_LOG_COMMAND_ID)
              }),
              toAction({
                id: "Report Issue",
                label: localize(21732, null),
                run: () => this.workbenchIssueService.openReporter()
              })
            ]
          }
        });
        break;
      }
      case "IncompatibleRemoteContent" /* IncompatibleRemoteContent */:
        this.notificationService.notify({
          severity: Severity2.Error,
          message: localize(21718, null),
          actions: {
            primary: [
              toAction({
                id: "reset",
                label: localize(21733, null),
                run: () => this.userDataSyncWorkbenchService.resetSyncedData()
              }),
              toAction({
                id: "show synced data",
                label: localize(21744, null),
                run: () => this.userDataSyncWorkbenchService.showSyncActivity()
              })
            ]
          }
        });
        return;
      case "ServiceChanged" /* ServiceChanged */:
        this.notificationService.notify({
          severity: Severity2.Info,
          message: this.userDataSyncStoreManagementService.userDataSyncStore?.type === "insiders" ? localize(21736, null) : localize(21737, null)
        });
        return;
      case "DefaultServiceChanged" /* DefaultServiceChanged */:
        if (this.userDataSyncEnablementService.isEnabled()) {
          this.notificationService.notify({
            severity: Severity2.Info,
            message: localize(21772, null)
          });
        } else {
          this.notificationService.notify({
            severity: Severity2.Info,
            message: localize(21735, null, this.productService.nameLong),
            actions: {
              primary: [toAction({
                id: "turn on sync",
                label: localize(21768, null),
                run: () => this.turnOn()
              })]
            }
          });
        }
        return;
    }
  }
  handleTooLargeError(resource, message, error) {
    const operationId = error.operationId ? localize(21729, null, error.operationId) : void 0;
    this.notificationService.notify({
      severity: Severity2.Error,
      message: operationId ? `${message} ${operationId}` : message,
      actions: {
        primary: [toAction({
          id: "open sync file",
          label: localize(21728, null, getSyncAreaLabel(resource)),
          run: () => resource === "settings" /* Settings */ ? this.preferencesService.openUserSettings({ jsonEditor: true }) : this.preferencesService.openGlobalKeybindingSettings(true)
        })]
      }
    });
  }
  onSynchronizerErrors(errors) {
    if (errors.length) {
      for (const { profile, syncResource: resource, error } of errors) {
        switch (error.code) {
          case "LocalInvalidContent" /* LocalInvalidContent */:
            this.handleInvalidContentError({ profile, syncResource: resource });
            break;
          default: {
            const key3 = `${profile.id}:${resource}`;
            const disposable = this.invalidContentErrorDisposables.get(key3);
            if (disposable) {
              disposable.dispose();
              this.invalidContentErrorDisposables.delete(key3);
            }
          }
        }
      }
    } else {
      this.invalidContentErrorDisposables.forEach((disposable) => disposable.dispose());
      this.invalidContentErrorDisposables.clear();
    }
  }
  handleInvalidContentError({ profile, syncResource: source }) {
    if (this.userDataProfileService.currentProfile.id !== profile.id) {
      return;
    }
    const key3 = `${profile.id}:${source}`;
    if (this.invalidContentErrorDisposables.has(key3)) {
      return;
    }
    if (source !== "settings" /* Settings */ && source !== "keybindings" /* Keybindings */ && source !== "tasks" /* Tasks */) {
      return;
    }
    if (!this.hostService.hasFocus) {
      return;
    }
    const resource = source === "settings" /* Settings */ ? this.userDataProfileService.currentProfile.settingsResource : source === "keybindings" /* Keybindings */ ? this.userDataProfileService.currentProfile.keybindingsResource : this.userDataProfileService.currentProfile.tasksResource;
    const editorUri = EditorResourceAccessor.getCanonicalUri(this.editorService.activeEditor, { supportSideBySide: 1 /* PRIMARY */ });
    if (isEqual2(resource, editorUri)) {
      return;
    }
    const errorArea = getSyncAreaLabel(source);
    const handle2 = this.notificationService.notify({
      severity: Severity2.Error,
      message: localize(21722, null, errorArea.toLowerCase()),
      actions: {
        primary: [toAction({
          id: "open sync file",
          label: localize(21728, null, errorArea),
          run: () => source === "settings" /* Settings */ ? this.preferencesService.openUserSettings({ jsonEditor: true }) : this.preferencesService.openGlobalKeybindingSettings(true)
        })]
      }
    });
    this.invalidContentErrorDisposables.set(key3, toDisposable(() => {
      handle2.close();
      this.invalidContentErrorDisposables.delete(key3);
    }));
  }
  getConflictsCount() {
    return this.userDataSyncService.conflicts.reduce((result, { conflicts }) => {
      return result + conflicts.length;
    }, 0);
  }
  async updateGlobalActivityBadge() {
    this.globalActivityBadgeDisposable.clear();
    let badge = void 0;
    if (this.userDataSyncService.conflicts.length && this.userDataSyncEnablementService.isEnabled()) {
      badge = new NumberBadge(this.getConflictsCount(), () => localize(21724, null, SYNC_TITLE.value));
    } else if (this.turningOnSync) {
      badge = new ProgressBadge(() => localize(21771, null));
    }
    if (badge) {
      this.globalActivityBadgeDisposable.value = this.activityService.showGlobalActivity({ badge });
    }
  }
  async updateAccountBadge() {
    this.accountBadgeDisposable.clear();
    let badge = void 0;
    if (this.userDataSyncService.status !== "uninitialized" /* Uninitialized */ && this.userDataSyncEnablementService.isEnabled() && this.userDataSyncWorkbenchService.accountStatus === "unavailable" /* Unavailable */) {
      badge = new NumberBadge(1, () => localize(21748, null));
    }
    if (badge) {
      this.accountBadgeDisposable.value = this.activityService.showAccountsActivity({ badge });
    }
  }
  async turnOn() {
    try {
      if (!this.userDataSyncWorkbenchService.authenticationProviders.length) {
        throw new Error(localize(21727, null));
      }
      const turnOn = await this.askToConfigure();
      if (!turnOn) {
        return;
      }
      if (this.userDataSyncStoreManagementService.userDataSyncStore?.canSwitch) {
        await this.selectSettingsSyncService(this.userDataSyncStoreManagementService.userDataSyncStore);
      }
      await this.userDataSyncWorkbenchService.turnOn();
    } catch (e) {
      if (isCancellationError(e)) {
        return;
      }
      if (e instanceof UserDataSyncError) {
        switch (e.code) {
          case "TooLarge" /* TooLarge */:
            if (e.resource === "keybindings" /* Keybindings */ || e.resource === "settings" /* Settings */ || e.resource === "tasks" /* Tasks */) {
              this.handleTooLargeError(e.resource, localize(21759, null, getSyncAreaLabel(e.resource).toLowerCase(), "100kb"), e);
              return;
            }
            break;
          case "IncompatibleLocalContent" /* IncompatibleLocalContent */:
          case "Gone" /* Gone */:
          case "UpgradeRequired" /* UpgradeRequired */: {
            const message = localize(21721, null, this.productService.version, this.productService.commit);
            const operationId = e.operationId ? localize(21729, null, e.operationId) : void 0;
            this.notificationService.notify({
              severity: Severity2.Error,
              message: operationId ? `${message} ${operationId}` : message
            });
            return;
          }
          case "IncompatibleRemoteContent" /* IncompatibleRemoteContent */:
            this.notificationService.notify({
              severity: Severity2.Error,
              message: localize(21719, null),
              actions: {
                primary: [
                  toAction({
                    id: "reset",
                    label: localize(21733, null),
                    run: () => this.userDataSyncWorkbenchService.resetSyncedData()
                  }),
                  toAction({
                    id: "show synced data",
                    label: localize(21744, null),
                    run: () => this.userDataSyncWorkbenchService.showSyncActivity()
                  })
                ]
              }
            });
            return;
          case "Unauthorized" /* Unauthorized */:
          case "Forbidden" /* Forbidden */:
            this.notificationService.error(localize(21707, null));
            return;
        }
        this.notificationService.error(localize(21767, null, `command:${SHOW_SYNC_LOG_COMMAND_ID}`));
      } else {
        this.notificationService.error(localize(21766, null, getErrorMessage(e)));
      }
    }
  }
  async askToConfigure() {
    return new Promise((c, e) => {
      const disposables = new DisposableStore();
      const quickPick = this.quickInputService.createQuickPick();
      disposables.add(quickPick);
      quickPick.title = SYNC_TITLE.value;
      quickPick.ok = false;
      quickPick.customButton = true;
      quickPick.customLabel = localize(21746, null);
      quickPick.description = localize(21711, null);
      quickPick.canSelectMany = true;
      quickPick.ignoreFocusOut = true;
      quickPick.hideInput = true;
      quickPick.hideCheckAll = true;
      const items = this.getConfigureSyncQuickPickItems();
      quickPick.items = items;
      quickPick.selectedItems = items.filter((item) => this.userDataSyncEnablementService.isResourceEnabled(item.id, true));
      let accepted = false;
      disposables.add(Event2.any(quickPick.onDidAccept, quickPick.onDidCustom)(() => {
        accepted = true;
        quickPick.hide();
      }));
      disposables.add(quickPick.onDidHide(() => {
        try {
          if (accepted) {
            this.updateConfiguration(items, quickPick.selectedItems);
          }
          c(accepted);
        } catch (error) {
          e(error);
        } finally {
          disposables.dispose();
        }
      }));
      quickPick.show();
    });
  }
  getConfigureSyncQuickPickItems() {
    const result = [{
      id: "settings" /* Settings */,
      label: getSyncAreaLabel("settings" /* Settings */)
    }, {
      id: "keybindings" /* Keybindings */,
      label: getSyncAreaLabel("keybindings" /* Keybindings */)
    }, {
      id: "snippets" /* Snippets */,
      label: getSyncAreaLabel("snippets" /* Snippets */)
    }, {
      id: "tasks" /* Tasks */,
      label: getSyncAreaLabel("tasks" /* Tasks */)
    }, {
      id: "mcp" /* Mcp */,
      label: getSyncAreaLabel("mcp" /* Mcp */)
    }, {
      id: "globalState" /* GlobalState */,
      label: getSyncAreaLabel("globalState" /* GlobalState */)
    }, {
      id: "extensions" /* Extensions */,
      label: getSyncAreaLabel("extensions" /* Extensions */)
    }, {
      id: "profiles" /* Profiles */,
      label: getSyncAreaLabel("profiles" /* Profiles */)
    }, {
      id: "prompts" /* Prompts */,
      label: getSyncAreaLabel("prompts" /* Prompts */)
    }];
    return result;
  }
  updateConfiguration(items, selectedItems) {
    for (const item of items) {
      const wasEnabled = this.userDataSyncEnablementService.isResourceEnabled(item.id);
      const isEnabled = !!selectedItems.filter((selected) => selected.id === item.id)[0];
      if (wasEnabled !== isEnabled) {
        this.userDataSyncEnablementService.setResourceEnablement(item.id, isEnabled);
      }
    }
  }
  async configureSyncOptions() {
    return new Promise((c, e) => {
      const disposables = new DisposableStore();
      const quickPick = this.quickInputService.createQuickPick();
      disposables.add(quickPick);
      quickPick.title = localize(21714, null, SYNC_TITLE.value);
      quickPick.placeholder = localize(21713, null);
      quickPick.canSelectMany = true;
      quickPick.ignoreFocusOut = true;
      quickPick.ok = true;
      const items = this.getConfigureSyncQuickPickItems();
      quickPick.items = items;
      quickPick.selectedItems = items.filter((item) => this.userDataSyncEnablementService.isResourceEnabled(item.id));
      disposables.add(quickPick.onDidAccept(async () => {
        if (quickPick.selectedItems.length) {
          this.updateConfiguration(items, quickPick.selectedItems);
          quickPick.hide();
        }
      }));
      disposables.add(quickPick.onDidHide(() => {
        disposables.dispose();
        c();
      }));
      quickPick.show();
    });
  }
  async turnOff() {
    const result = await this.dialogService.confirm({
      message: localize(21763, null),
      detail: localize(21764, null),
      primaryButton: localize(21761, null),
      checkbox: this.userDataSyncWorkbenchService.accountStatus === "available" /* Available */ ? {
        label: localize(21765, null)
      } : void 0
    });
    if (result.confirmed) {
      return this.userDataSyncWorkbenchService.turnoff(!!result.checkboxChecked);
    }
  }
  disableSync(source) {
    switch (source) {
      case "settings" /* Settings */:
        return this.userDataSyncEnablementService.setResourceEnablement("settings" /* Settings */, false);
      case "keybindings" /* Keybindings */:
        return this.userDataSyncEnablementService.setResourceEnablement("keybindings" /* Keybindings */, false);
      case "snippets" /* Snippets */:
        return this.userDataSyncEnablementService.setResourceEnablement("snippets" /* Snippets */, false);
      case "tasks" /* Tasks */:
        return this.userDataSyncEnablementService.setResourceEnablement("tasks" /* Tasks */, false);
      case "extensions" /* Extensions */:
        return this.userDataSyncEnablementService.setResourceEnablement("extensions" /* Extensions */, false);
      case "globalState" /* GlobalState */:
        return this.userDataSyncEnablementService.setResourceEnablement("globalState" /* GlobalState */, false);
      case "profiles" /* Profiles */:
        return this.userDataSyncEnablementService.setResourceEnablement("profiles" /* Profiles */, false);
    }
  }
  showSyncActivity() {
    return this.outputService.showChannel(USER_DATA_SYNC_LOG_ID);
  }
  async selectSettingsSyncService(userDataSyncStore) {
    return new Promise((c, e) => {
      const disposables = new DisposableStore();
      const quickPick = disposables.add(this.quickInputService.createQuickPick());
      quickPick.title = localize(21752, null, SYNC_TITLE.value);
      quickPick.description = localize(21751, null);
      quickPick.hideInput = true;
      quickPick.ignoreFocusOut = true;
      const getDescription = (url) => {
        const isDefault = isEqual2(url, userDataSyncStore.defaultUrl);
        if (isDefault) {
          return localize(21716, null);
        }
        return void 0;
      };
      quickPick.items = [
        {
          id: "insiders",
          label: localize(21725, null),
          description: getDescription(userDataSyncStore.insidersUrl)
        },
        {
          id: "stable",
          label: localize(21749, null),
          description: getDescription(userDataSyncStore.stableUrl)
        }
      ];
      disposables.add(quickPick.onDidAccept(async () => {
        try {
          await this.userDataSyncStoreManagementService.switch(quickPick.selectedItems[0].id);
          c();
        } catch (error) {
          e(error);
        } finally {
          quickPick.hide();
        }
      }));
      disposables.add(quickPick.onDidHide(() => disposables.dispose()));
      quickPick.show();
    });
  }
  registerActions() {
    if (this.userDataSyncEnablementService.canToggleEnablement()) {
      this.registerTurnOnSyncAction();
      this.registerTurnOffSyncAction();
    }
    this.registerTurningOnSyncAction();
    this.registerCancelTurnOnSyncAction();
    this.registerSignInAction();
    this.registerShowConflictsAction();
    this.registerEnableSyncViewsAction();
    this.registerManageSyncAction();
    this.registerSyncNowAction();
    this.registerConfigureSyncAction();
    this.registerShowSettingsAction();
    this.registerHelpAction();
    this.registerShowLogAction();
    this.registerResetSyncDataAction();
    this.registerAcceptMergesAction();
    if (isWeb) {
      this.registerDownloadSyncActivityAction();
    }
  }
  registerTurnOnSyncAction() {
    const that = this;
    const when = ContextKeyExpr.and(CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* Uninitialized */), CONTEXT_SYNC_ENABLEMENT.toNegated(), CONTEXT_TURNING_ON_STATE.negate());
    this._register(registerAction2(class TurningOnSyncAction extends Action2 {
      constructor() {
        super({
          id: "workbench.userDataSync.actions.turnOn",
          title: localize2(21723, "Backup and Sync Settings..."),
          category: SYNC_TITLE,
          f1: true,
          precondition: when,
          menu: [{
            group: "3_configuration",
            id: MenuId.GlobalActivity,
            when,
            order: 2
          }, {
            group: "3_configuration",
            id: MenuId.MenubarPreferencesMenu,
            when,
            order: 2
          }, {
            group: "1_settings",
            id: MenuId.AccountsContext,
            when,
            order: 2
          }]
        });
      }
      async run() {
        return that.turnOn();
      }
    }));
  }
  registerTurningOnSyncAction() {
    const when = ContextKeyExpr.and(CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* Uninitialized */), CONTEXT_SYNC_ENABLEMENT.toNegated(), CONTEXT_TURNING_ON_STATE);
    this._register(registerAction2(class TurningOnSyncAction extends Action2 {
      constructor() {
        super({
          id: "workbench.userData.actions.turningOn",
          title: localize(21770, null),
          precondition: ContextKeyExpr.false(),
          menu: [{
            group: "3_configuration",
            id: MenuId.GlobalActivity,
            when,
            order: 2
          }, {
            group: "1_settings",
            id: MenuId.AccountsContext,
            when
          }]
        });
      }
      async run() {
      }
    }));
  }
  registerCancelTurnOnSyncAction() {
    const that = this;
    this._register(registerAction2(class TurningOnSyncAction extends Action2 {
      constructor() {
        super({
          id: "workbench.userData.actions.cancelTurnOn",
          title: localize(21708, null),
          icon: Codicon.stopCircle,
          menu: {
            id: MenuId.ViewContainerTitle,
            when: ContextKeyExpr.and(CONTEXT_TURNING_ON_STATE, ContextKeyExpr.equals("viewContainer", SYNC_VIEW_CONTAINER_ID)),
            group: "navigation",
            order: 1
          }
        });
      }
      async run() {
        return that.userDataSyncWorkbenchService.turnoff(false);
      }
    }));
  }
  registerSignInAction() {
    const that = this;
    const id2 = "workbench.userData.actions.signin";
    const when = ContextKeyExpr.and(CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* Uninitialized */), CONTEXT_SYNC_ENABLEMENT, CONTEXT_ACCOUNT_STATE.isEqualTo("unavailable" /* Unavailable */));
    this._register(registerAction2(class StopSyncAction extends Action2 {
      constructor() {
        super({
          id: "workbench.userData.actions.signin",
          title: localize(21747, null),
          menu: {
            group: "3_configuration",
            id: MenuId.GlobalActivity,
            when,
            order: 2
          }
        });
      }
      async run() {
        try {
          await that.userDataSyncWorkbenchService.signIn();
        } catch (e) {
          that.notificationService.error(e);
        }
      }
    }));
    this._register(MenuRegistry.appendMenuItem(MenuId.AccountsContext, {
      group: "1_settings",
      command: {
        id: id2,
        title: localize(21745, null)
      },
      when
    }));
  }
  getShowConflictsTitle() {
    return localize2(21734, "Show Conflicts ({0})", this.getConflictsCount());
  }
  registerShowConflictsAction() {
    this.conflictsActionDisposable.value = void 0;
    const that = this;
    this.conflictsActionDisposable.value = registerAction2(class TurningOnSyncAction extends Action2 {
      constructor() {
        super({
          id: showConflictsCommandId,
          get title() {
            return that.getShowConflictsTitle();
          },
          category: SYNC_TITLE,
          f1: true,
          precondition: CONTEXT_HAS_CONFLICTS,
          menu: [{
            group: "3_configuration",
            id: MenuId.GlobalActivity,
            when: CONTEXT_HAS_CONFLICTS,
            order: 2
          }, {
            group: "3_configuration",
            id: MenuId.MenubarPreferencesMenu,
            when: CONTEXT_HAS_CONFLICTS,
            order: 2
          }]
        });
      }
      async run() {
        return that.userDataSyncWorkbenchService.showConflicts();
      }
    });
  }
  registerManageSyncAction() {
    const that = this;
    const when = ContextKeyExpr.and(CONTEXT_SYNC_ENABLEMENT, CONTEXT_ACCOUNT_STATE.notEqualsTo("unavailable" /* Unavailable */), CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* Uninitialized */));
    this._register(registerAction2(class SyncStatusAction extends Action2 {
      constructor() {
        super({
          id: "workbench.userDataSync.actions.manage",
          title: localize(21753, null),
          toggled: ContextKeyTrueExpr.INSTANCE,
          menu: [
            {
              id: MenuId.GlobalActivity,
              group: "3_configuration",
              when,
              order: 2
            },
            {
              id: MenuId.MenubarPreferencesMenu,
              group: "3_configuration",
              when,
              order: 2
            },
            {
              id: MenuId.AccountsContext,
              group: "1_settings",
              when
            }
          ]
        });
      }
      run(accessor) {
        return new Promise((c, e) => {
          const quickInputService = accessor.get(IQuickInputService);
          const commandService = accessor.get(ICommandService);
          const disposables = new DisposableStore();
          const quickPick = quickInputService.createQuickPick({ useSeparators: true });
          disposables.add(quickPick);
          const items = [];
          if (that.userDataSyncService.conflicts.length) {
            items.push({ id: showConflictsCommandId, label: `${SYNC_TITLE.value}: ${that.getShowConflictsTitle().original}` });
            items.push({ type: "separator" });
          }
          items.push({ id: configureSyncCommand.id, label: `${SYNC_TITLE.value}: ${configureSyncCommand.title.original}` });
          items.push({ id: showSyncSettingsCommand.id, label: `${SYNC_TITLE.value}: ${showSyncSettingsCommand.title.original}` });
          items.push({ id: showSyncedDataCommand.id, label: `${SYNC_TITLE.value}: ${showSyncedDataCommand.title.original}` });
          items.push({ type: "separator" });
          items.push({ id: syncNowCommand.id, label: `${SYNC_TITLE.value}: ${syncNowCommand.title.original}`, description: syncNowCommand.description(that.userDataSyncService) });
          if (that.userDataSyncEnablementService.canToggleEnablement()) {
            const account = that.userDataSyncWorkbenchService.current;
            items.push({ id: turnOffSyncCommand.id, label: `${SYNC_TITLE.value}: ${turnOffSyncCommand.title.original}`, description: account ? `${account.accountName} (${that.authenticationService.getProvider(account.authenticationProviderId).label})` : void 0 });
          }
          quickPick.items = items;
          disposables.add(quickPick.onDidAccept(() => {
            if (quickPick.selectedItems[0] && quickPick.selectedItems[0].id) {
              commandService.executeCommand(quickPick.selectedItems[0].id);
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
    }));
  }
  registerEnableSyncViewsAction() {
    const that = this;
    const when = ContextKeyExpr.and(CONTEXT_ACCOUNT_STATE.isEqualTo("available" /* Available */), CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* Uninitialized */));
    this._register(registerAction2(class SyncStatusAction extends Action2 {
      constructor() {
        super({
          id: showSyncedDataCommand.id,
          title: showSyncedDataCommand.title,
          category: SYNC_TITLE,
          precondition: when,
          menu: {
            id: MenuId.CommandPalette,
            when
          }
        });
      }
      run(accessor) {
        return that.userDataSyncWorkbenchService.showSyncActivity();
      }
    }));
  }
  registerSyncNowAction() {
    const that = this;
    this._register(registerAction2(class SyncNowAction extends Action2 {
      constructor() {
        super({
          id: syncNowCommand.id,
          title: syncNowCommand.title,
          category: SYNC_TITLE,
          menu: {
            id: MenuId.CommandPalette,
            when: ContextKeyExpr.and(CONTEXT_SYNC_ENABLEMENT, CONTEXT_ACCOUNT_STATE.isEqualTo("available" /* Available */), CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* Uninitialized */))
          }
        });
      }
      run(accessor) {
        return that.userDataSyncWorkbenchService.syncNow();
      }
    }));
  }
  registerTurnOffSyncAction() {
    const that = this;
    this._register(registerAction2(class StopSyncAction extends Action2 {
      constructor() {
        super({
          id: turnOffSyncCommand.id,
          title: turnOffSyncCommand.title,
          category: SYNC_TITLE,
          menu: {
            id: MenuId.CommandPalette,
            when: ContextKeyExpr.and(CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* Uninitialized */), CONTEXT_SYNC_ENABLEMENT)
          }
        });
      }
      async run() {
        try {
          await that.turnOff();
        } catch (e) {
          if (!isCancellationError(e)) {
            that.notificationService.error(localize(21762, null, `command:${SHOW_SYNC_LOG_COMMAND_ID}`));
          }
        }
      }
    }));
  }
  registerConfigureSyncAction() {
    const that = this;
    const when = ContextKeyExpr.and(CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* Uninitialized */), CONTEXT_SYNC_ENABLEMENT);
    this._register(registerAction2(class ConfigureSyncAction extends Action2 {
      constructor() {
        super({
          id: configureSyncCommand.id,
          title: configureSyncCommand.title,
          category: SYNC_TITLE,
          icon: Codicon.settingsGear,
          tooltip: localize(21710, null),
          menu: [{
            id: MenuId.CommandPalette,
            when
          }, {
            id: MenuId.ViewContainerTitle,
            when: ContextKeyExpr.and(CONTEXT_SYNC_ENABLEMENT, ContextKeyExpr.equals("viewContainer", SYNC_VIEW_CONTAINER_ID)),
            group: "navigation",
            order: 2
          }]
        });
      }
      run() {
        return that.configureSyncOptions();
      }
    }));
  }
  registerShowLogAction() {
    const that = this;
    this._register(registerAction2(class ShowSyncActivityAction extends Action2 {
      constructor() {
        super({
          id: SHOW_SYNC_LOG_COMMAND_ID,
          title: localize(21740, null, SYNC_TITLE.value),
          tooltip: localize(21741, null),
          icon: Codicon.output,
          menu: [{
            id: MenuId.CommandPalette,
            when: ContextKeyExpr.and(CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* Uninitialized */))
          }, {
            id: MenuId.ViewContainerTitle,
            when: ContextKeyExpr.equals("viewContainer", SYNC_VIEW_CONTAINER_ID),
            group: "navigation",
            order: 1
          }]
        });
      }
      run() {
        return that.showSyncActivity();
      }
    }));
  }
  registerShowSettingsAction() {
    this._register(registerAction2(class ShowSyncSettingsAction extends Action2 {
      constructor() {
        super({
          id: showSyncSettingsCommand.id,
          title: showSyncSettingsCommand.title,
          category: SYNC_TITLE,
          menu: {
            id: MenuId.CommandPalette,
            when: ContextKeyExpr.and(CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* Uninitialized */))
          }
        });
      }
      run(accessor) {
        accessor.get(IPreferencesService).openUserSettings({ jsonEditor: false, query: "@tag:sync" });
      }
    }));
  }
  registerHelpAction() {
    const that = this;
    this._register(registerAction2(class HelpAction extends Action2 {
      constructor() {
        super({
          id: "workbench.userDataSync.actions.help",
          title: SYNC_TITLE,
          category: Categories.Help,
          menu: [{
            id: MenuId.CommandPalette,
            when: ContextKeyExpr.and(CONTEXT_SYNC_STATE.notEqualsTo("uninitialized" /* Uninitialized */))
          }]
        });
      }
      run() {
        return that.openerService.open(URI.parse("https://aka.ms/vscode-settings-sync-help"));
      }
    }));
    MenuRegistry.appendMenuItem(MenuId.ViewContainerTitle, {
      command: {
        id: "workbench.userDataSync.actions.help",
        title: Categories.Help.value
      },
      when: ContextKeyExpr.equals("viewContainer", SYNC_VIEW_CONTAINER_ID),
      group: "1_help"
    });
  }
  registerAcceptMergesAction() {
    const that = this;
    this._register(registerAction2(class AcceptMergesAction extends Action2 {
      constructor() {
        super({
          id: "workbench.userDataSync.actions.acceptMerges",
          title: localize(21709, null),
          menu: [{
            id: MenuId.EditorContent,
            when: ContextKeyExpr.and(ctxIsMergeResultEditor, ContextKeyExpr.regex(ctxMergeBaseUri.key, new RegExp(`^${USER_DATA_SYNC_SCHEME}:`)))
          }]
        });
      }
      async run(accessor, previewResource) {
        const textFileService = accessor.get(ITextFileService);
        await textFileService.save(previewResource);
        const content2 = await textFileService.read(previewResource);
        await that.userDataSyncService.accept(this.getSyncResource(previewResource), previewResource, content2.value, true);
      }
      getSyncResource(previewResource) {
        const conflict = that.userDataSyncService.conflicts.find(({ conflicts }) => conflicts.some((conflict2) => isEqual2(conflict2.previewResource, previewResource)));
        if (conflict) {
          return conflict;
        }
        throw new Error(`Unknown resource: ${previewResource.toString()}`);
      }
    }));
  }
  registerDownloadSyncActivityAction() {
    this._register(registerAction2(class DownloadSyncActivityAction extends Action2 {
      constructor() {
        super(DOWNLOAD_ACTIVITY_ACTION_DESCRIPTOR);
      }
      async run(accessor) {
        const userDataSyncWorkbenchService = accessor.get(IUserDataSyncWorkbenchService);
        const notificationService = accessor.get(INotificationService);
        const folder = await userDataSyncWorkbenchService.downloadSyncActivity();
        if (folder) {
          notificationService.info(localize(21717, null));
        }
      }
    }));
  }
  registerViews() {
    const container3 = this.registerViewContainer();
    this.registerDataViews(container3);
  }
  registerViewContainer() {
    return Registry.as(Extensions13.ViewContainersRegistry).registerViewContainer(
      {
        id: SYNC_VIEW_CONTAINER_ID,
        title: SYNC_TITLE,
        ctorDescriptor: new SyncDescriptor(
          ViewPaneContainer,
          [SYNC_VIEW_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }]
        ),
        icon: SYNC_VIEW_ICON,
        hideIfEmpty: true
      },
      0 /* Sidebar */
    );
  }
  registerResetSyncDataAction() {
    const that = this;
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.actions.syncData.reset",
          title: localize(21773, null),
          menu: [{
            id: MenuId.ViewContainerTitle,
            when: ContextKeyExpr.equals("viewContainer", SYNC_VIEW_CONTAINER_ID),
            group: "0_configure"
          }]
        });
      }
      run() {
        return that.userDataSyncWorkbenchService.resetSyncedData();
      }
    }));
  }
  registerDataViews(container3) {
    this._register(this.instantiationService.createInstance(UserDataSyncDataViews, container3));
  }
};

UserDataSyncWorkbenchContribution = __decorateClass([
  __decorateParam(0, IUserDataSyncEnablementService),
  __decorateParam(1, IUserDataSyncService),
  __decorateParam(2, IUserDataSyncWorkbenchService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IActivityService),
  __decorateParam(5, INotificationService),
  __decorateParam(6, IEditorService),
  __decorateParam(7, IUserDataProfileService),
  __decorateParam(8, IDialogService),
  __decorateParam(9, IQuickInputService),
  __decorateParam(10, IInstantiationService),
  __decorateParam(11, IOutputService),
  __decorateParam(12, IUserDataAutoSyncService),
  __decorateParam(13, ITextModelService),
  __decorateParam(14, IPreferencesService),
  __decorateParam(15, ITelemetryService),
  __decorateParam(16, IProductService),
  __decorateParam(17, IOpenerService),
  __decorateParam(18, IAuthenticationService),
  __decorateParam(19, IUserDataSyncStoreManagementService),
  __decorateParam(20, IHostService),
  __decorateParam(21, ICommandService),
  __decorateParam(22, IWorkbenchIssueService)
], UserDataSyncWorkbenchContribution);

var UserDataRemoteContentProvider = class {
  constructor(userDataSyncService, modelService, languageService) {
    this.userDataSyncService = userDataSyncService;
    this.modelService = modelService;
    this.languageService = languageService;
  }
  provideTextContent(uri5) {
    if (uri5.scheme === USER_DATA_SYNC_SCHEME) {
      return this.userDataSyncService.resolveContent(uri5).then((content2) => this.modelService.createModel(content2 || "", this.languageService.createById("jsonc"), uri5));
    }
    return null;
  }
};

UserDataRemoteContentProvider = __decorateClass([
  __decorateParam(0, IUserDataSyncService),
  __decorateParam(1, IModelService),
  __decorateParam(2, ILanguageService)
], UserDataRemoteContentProvider);
export { turnOffSyncCommand, configureSyncCommand, showConflictsCommandId, syncNowCommand, showSyncSettingsCommand, showSyncedDataCommand, CONTEXT_TURNING_ON_STATE, UserDataSyncWorkbenchContribution, UserDataRemoteContentProvider };
