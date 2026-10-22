// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/update/browser/update.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { ReleaseNotesManager } from "./module-3318.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IProductService } from "./module-0875.mjs";
import { URI } from "./module-0032.mjs";
import { localize } from "./module-0001.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { isWeb } from "./module-0014.mjs";
import { tryParseVersion } from "./module-3319.mjs";
import { severity_default } from "./module-0266.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { IBrowserWorkbenchEnvironmentService } from "./module-0916.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IHostService } from "./module-1118.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { UpdateGlobalActivityBadgeVisibleContext } from "./module-2752.mjs";
import { IActivityService, NumberBadge, ProgressBadge } from "./module-1448.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IUpdateService } from "./module-1181.mjs";
import { IsWebContext } from "./module-0635.mjs";
import { IUserDataSyncEnablementService, IUserDataSyncService, IUserDataSyncStoreManagementService } from "./module-1639.mjs";
import { IUserDataSyncWorkbenchService } from "./module-1687.mjs";
import { Event2 } from "./module-0017.mjs";
import { Promises, Throttler } from "./module-0036.mjs";
import { getInternalOrg } from "./module-0953.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";


// src/vs/workbench/contrib/update/browser/update.ts
var CONTEXT_UPDATE_STATE = new RawContextKey("updateState", "uninitialized" /* Uninitialized */);

var MAJOR_MINOR_UPDATE_AVAILABLE = new RawContextKey("majorMinorUpdateAvailable", false);

var releaseNotesManager = void 0;

function showReleaseNotesInEditor(instantiationService, version2, useCurrentFile) {
  if (!releaseNotesManager) {
    releaseNotesManager = instantiationService.createInstance(ReleaseNotesManager);
  }
  return releaseNotesManager.show(version2, useCurrentFile);
}

async function openLatestReleaseNotesInBrowser(accessor) {
  const openerService = accessor.get(IOpenerService);
  const productService = accessor.get(IProductService);
  if (productService.releaseNotesUrl) {
    const uri4 = URI.parse(productService.releaseNotesUrl);
    await openerService.open(uri4);
  } else {
    throw new Error(localize(21490, null, productService.nameLong));
  }
}

async function showReleaseNotes(accessor, version2) {
  const instantiationService = accessor.get(IInstantiationService);
  try {
    await showReleaseNotesInEditor(instantiationService, version2, false);
  } catch (err) {
    try {
      await instantiationService.invokeFunction(openLatestReleaseNotesInBrowser);
    } catch (err2) {
      throw new Error(`${err.message} and ${err2.message}`);
    }
  }
}

function appendUpdateMenuItems(menuId, group2) {
  MenuRegistry.appendMenuItem(menuId, {
    group: group2,
    command: {
      id: "update.check",
      title: localize(21469, null)
    },
    when: CONTEXT_UPDATE_STATE.isEqualTo("idle" /* Idle */)
  });
  MenuRegistry.appendMenuItem(menuId, {
    group: group2,
    command: {
      id: "update.checking",
      title: localize(21471, null),
      precondition: ContextKeyExpr.false()
    },
    when: CONTEXT_UPDATE_STATE.isEqualTo("checking for updates" /* CheckingForUpdates */)
  });
  MenuRegistry.appendMenuItem(menuId, {
    group: group2,
    command: {
      id: "update.downloadNow",
      title: localize(21472, null)
    },
    when: CONTEXT_UPDATE_STATE.isEqualTo("available for download" /* AvailableForDownload */)
  });
  MenuRegistry.appendMenuItem(menuId, {
    group: group2,
    command: {
      id: "update.downloading",
      title: localize(21474, null),
      precondition: ContextKeyExpr.false()
    },
    when: CONTEXT_UPDATE_STATE.isEqualTo("downloading" /* Downloading */)
  });
  MenuRegistry.appendMenuItem(menuId, {
    group: group2,
    command: {
      id: "update.install",
      title: localize(21476, null)
    },
    when: CONTEXT_UPDATE_STATE.isEqualTo("downloaded" /* Downloaded */)
  });
  MenuRegistry.appendMenuItem(menuId, {
    group: group2,
    command: {
      id: "update.updating",
      title: localize(21475, null),
      precondition: ContextKeyExpr.false()
    },
    when: CONTEXT_UPDATE_STATE.isEqualTo("updating" /* Updating */)
  });
  MenuRegistry.appendMenuItem(menuId, {
    group: group2,
    command: {
      id: "update.cancelling",
      title: localize(21468, null),
      precondition: ContextKeyExpr.false()
    },
    when: CONTEXT_UPDATE_STATE.isEqualTo("cancelling" /* Cancelling */)
  });
  MenuRegistry.appendMenuItem(menuId, {
    group: group2,
    order: 2,
    command: {
      id: "update.restart",
      title: localize(21484, null)
    },
    when: CONTEXT_UPDATE_STATE.isEqualTo("ready" /* Ready */)
  });
}

function isMajorMinorUpdate(before, after2) {
  return before.major < after2.major || before.minor < after2.minor;
}

var ProductContribution = class {
  static {
    this.KEY = "releaseNotes/lastVersion";
  }
  constructor(storageService, instantiationService, notificationService, environmentService, openerService, configurationService, hostService, productService) {
    if (isWeb) {
      return;
    }
    hostService.hadLastFocus().then(async (hadLastFocus) => {
      if (!hadLastFocus) {
        return;
      }
      const lastVersion = tryParseVersion(storageService.get(ProductContribution.KEY, -1 /* APPLICATION */, ""));
      const currentVersion = tryParseVersion(productService.version);
      const shouldShowReleaseNotes = configurationService.getValue("update.showReleaseNotes");
      const shouldShowPostInstallInfo = configurationService.getValue("update.showPostInstallInfo");
      const releaseNotesUrl = productService.releaseNotesUrl;
      if (shouldShowReleaseNotes && !shouldShowPostInstallInfo && !environmentService.skipReleaseNotes && releaseNotesUrl && lastVersion && currentVersion && isMajorMinorUpdate(lastVersion, currentVersion)) {
        showReleaseNotesInEditor(instantiationService, productService.version, false).then(void 0, () => {
          notificationService.prompt(
            severity_default.Info,
            localize(21478, null, productService.nameLong, productService.version),
            [{
              label: localize(21482, null),
              run: () => {
                const uri4 = URI.parse(releaseNotesUrl);
                openerService.open(uri4);
              }
            }],
            { priority: 1 /* OPTIONAL */ }
          );
        });
      }
      storageService.store(ProductContribution.KEY, productService.version, -1 /* APPLICATION */, 1 /* MACHINE */);
    });
  }
};

ProductContribution = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, IBrowserWorkbenchEnvironmentService),
  __decorateParam(4, IOpenerService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IHostService),
  __decorateParam(7, IProductService)
], ProductContribution);

var UpdateContribution = class extends Disposable {
  constructor(storageService, instantiationService, dialogService, updateService, activityService, contextKeyService, productService, hostService) {
    super();
    this.instantiationService = instantiationService;
    this.dialogService = dialogService;
    this.updateService = updateService;
    this.activityService = activityService;
    this.contextKeyService = contextKeyService;
    this.productService = productService;
    this.hostService = hostService;
    this.badgeDisposable = this._register(new MutableDisposable());
    this.state = updateService.state;
    this.updateStateContextKey = CONTEXT_UPDATE_STATE.bindTo(contextKeyService);
    this.majorMinorUpdateAvailableContextKey = MAJOR_MINOR_UPDATE_AVAILABLE.bindTo(contextKeyService);
    this._register(updateService.onStateChange(this.onUpdateStateChange, this));
    const updateGlobalActivityBadgeContextKeys = new Set(UpdateGlobalActivityBadgeVisibleContext.keys());
    this._register(contextKeyService.onDidChangeContext((e4) => {
      if (e4.affectsSome(updateGlobalActivityBadgeContextKeys)) {
        this.updateBadge(this.updateService.state);
      }
    }));
    this.onUpdateStateChange(this.updateService.state);
    const currentVersion = this.productService.commit;
    const lastKnownVersion = storageService.get("update/lastKnownVersion", -1 /* APPLICATION */);
    if (currentVersion !== lastKnownVersion) {
      storageService.remove("update/lastKnownVersion", -1 /* APPLICATION */);
      storageService.remove("update/updateNotificationTime", -1 /* APPLICATION */);
    }
    this.registerGlobalActivityActions();
  }
  async onUpdateStateChange(state) {
    this.updateStateContextKey.set(state.type);
    switch (state.type) {
      case "idle" /* Idle */:
        if (state.notAvailable && !state.error && await this.hostService.hadLastFocus()) {
          this.dialogService.info(localize(21477, null));
        }
        break;
      case "ready" /* Ready */: {
        const productVersion = state.update.productVersion;
        if (productVersion) {
          const currentVersion = tryParseVersion(this.productService.version);
          const nextVersion = tryParseVersion(productVersion);
          this.majorMinorUpdateAvailableContextKey.set(Boolean(currentVersion && nextVersion && isMajorMinorUpdate(currentVersion, nextVersion)));
        }
        break;
      }
    }
    this.updateBadge(state);
    this.state = state;
  }
  updateBadge(state) {
    let badge;
    if (state.type === "available for download" /* AvailableForDownload */ || state.type === "downloaded" /* Downloaded */ || state.type === "ready" /* Ready */) {
      badge = new NumberBadge(1, () => localize(21491, null, this.productService.nameShort));
    } else if (state.type === "checking for updates" /* CheckingForUpdates */) {
      badge = new ProgressBadge(() => localize(21470, null, this.productService.nameShort));
    } else if (state.type === "downloading" /* Downloading */ || state.type === "overwriting" /* Overwriting */) {
      badge = new ProgressBadge(() => localize(21473, null, this.productService.nameShort));
    } else if (state.type === "updating" /* Updating */) {
      badge = new ProgressBadge(() => localize(21492, null, this.productService.nameShort));
    } else if (state.type === "cancelling" /* Cancelling */) {
      badge = new ProgressBadge(() => localize(21467, null, this.productService.nameShort));
    }
    this.badgeDisposable.clear();
    if (badge && this.contextKeyService.contextMatchesRules(UpdateGlobalActivityBadgeVisibleContext)) {
      this.badgeDisposable.value = this.activityService.showGlobalActivity({ badge });
    }
  }
  registerGlobalActivityActions() {
    CommandsRegistry.registerCommand("update.check", () => this.updateService.checkForUpdates(true));
    CommandsRegistry.registerCommand("update.checking", () => {
    });
    CommandsRegistry.registerCommand("update.downloadNow", () => this.updateService.downloadUpdate(true));
    CommandsRegistry.registerCommand("update.downloading", () => {
    });
    CommandsRegistry.registerCommand("update.install", () => this.updateService.applyUpdate());
    CommandsRegistry.registerCommand("update.updating", () => {
    });
    CommandsRegistry.registerCommand("update.cancelling", () => {
    });
    CommandsRegistry.registerCommand("update.restart", () => this.updateService.quitAndInstall());
    CommandsRegistry.registerCommand("_update.state", () => {
      return this.state;
    });
    appendUpdateMenuItems(MenuId.GlobalActivity, "7_update");
    if (this.productService.quality === "stable") {
      CommandsRegistry.registerCommand("update.showUpdateReleaseNotes", () => {
        if (this.updateService.state.type !== "ready" /* Ready */) {
          return;
        }
        const productVersion = this.updateService.state.update.productVersion;
        if (productVersion) {
          this.instantiationService.invokeFunction((accessor) => showReleaseNotes(accessor, productVersion));
        }
      });
      MenuRegistry.appendMenuItem(MenuId.GlobalActivity, {
        group: "7_update",
        order: 1,
        command: {
          id: "update.showUpdateReleaseNotes",
          title: localize(21487, null)
        },
        when: ContextKeyExpr.and(CONTEXT_UPDATE_STATE.isEqualTo("ready" /* Ready */), MAJOR_MINOR_UPDATE_AVAILABLE)
      });
    }
  }
};

UpdateContribution = __decorateClass([
  __decorateParam(0, IStorageService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IDialogService),
  __decorateParam(3, IUpdateService),
  __decorateParam(4, IActivityService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IProductService),
  __decorateParam(7, IHostService)
], UpdateContribution);

var SwitchProductQualityContribution = class extends Disposable {
  constructor(productService, environmentService) {
    super();
    this.productService = productService;
    this.environmentService = environmentService;
    this.registerGlobalActivityActions();
  }
  registerGlobalActivityActions() {
    const quality = this.productService.quality;
    const productQualityChangeHandler = this.environmentService.options?.productQualityChangeHandler;
    if (productQualityChangeHandler && (quality === "stable" || quality === "insider")) {
      const newQuality = quality === "stable" ? "insider" : "stable";
      const commandId = `update.switchQuality.${newQuality}`;
      const isSwitchingToInsiders = newQuality === "insider";
      this._register(registerAction2(class SwitchQuality extends Action2 {
        constructor() {
          super({
            id: commandId,
            title: isSwitchingToInsiders ? localize(21488, null) : localize(21489, null),
            precondition: IsWebContext,
            menu: {
              id: MenuId.GlobalActivity,
              when: IsWebContext,
              group: "7_update"
            }
          });
        }
        async run(accessor) {
          const dialogService = accessor.get(IDialogService);
          const userDataSyncEnablementService = accessor.get(IUserDataSyncEnablementService);
          const userDataSyncStoreManagementService = accessor.get(IUserDataSyncStoreManagementService);
          const storageService = accessor.get(IStorageService);
          const userDataSyncWorkbenchService = accessor.get(IUserDataSyncWorkbenchService);
          const userDataSyncService = accessor.get(IUserDataSyncService);
          const notificationService = accessor.get(INotificationService);
          try {
            const selectSettingsSyncServiceDialogShownKey = "switchQuality.selectSettingsSyncServiceDialogShown";
            const userDataSyncStore = userDataSyncStoreManagementService.userDataSyncStore;
            let userDataSyncStoreType;
            if (userDataSyncStore && isSwitchingToInsiders && userDataSyncEnablementService.isEnabled() && !storageService.getBoolean(selectSettingsSyncServiceDialogShownKey, -1 /* APPLICATION */, false)) {
              userDataSyncStoreType = await this.selectSettingsSyncService(dialogService);
              if (!userDataSyncStoreType) {
                return;
              }
              storageService.store(selectSettingsSyncServiceDialogShownKey, true, -1 /* APPLICATION */, 0 /* USER */);
              if (userDataSyncStoreType === "stable") {
                await userDataSyncStoreManagementService.switch(userDataSyncStoreType);
              }
            }
            const res = await dialogService.confirm({
              type: "info",
              message: localize(21481, null),
              detail: newQuality === "insider" ? localize(21479, null) : localize(21480, null),
              primaryButton: localize(21483, null)
            });
            if (res.confirmed) {
              const promises = [];
              if (userDataSyncService.status === "syncing" /* Syncing */) {
                promises.push(Event2.toPromise(Event2.filter(userDataSyncService.onDidChangeStatus, (status2) => status2 !== "syncing" /* Syncing */)));
              }
              if (isSwitchingToInsiders && userDataSyncStoreType) {
                promises.push(userDataSyncWorkbenchService.synchroniseUserDataSyncStoreType());
              }
              await Promises.settled(promises);
              productQualityChangeHandler(newQuality);
            } else {
              if (userDataSyncStoreType) {
                storageService.remove(selectSettingsSyncServiceDialogShownKey, -1 /* APPLICATION */);
              }
            }
          } catch (error) {
            notificationService.error(error);
          }
        }
        async selectSettingsSyncService(dialogService) {
          const { result } = await dialogService.prompt({
            type: Severity2.Info,
            message: localize(21486, null),
            detail: localize(21485, null),
            buttons: [
              {
                label: localize(21493, null),
                run: () => "insiders"
              },
              {
                label: localize(21494, null),
                run: () => "stable"
              }
            ],
            cancelButton: true
          });
          return result;
        }
      }));
    }
  }
};

SwitchProductQualityContribution = __decorateClass([
  __decorateParam(0, IProductService),
  __decorateParam(1, IBrowserWorkbenchEnvironmentService)
], SwitchProductQualityContribution);

var DefaultAccountUpdateContribution = class extends Disposable {
  constructor(updateService, defaultAccountService, storageService) {
    super();
    this.updateService = updateService;
    this.defaultAccountService = defaultAccountService;
    this.storageService = storageService;
    this.#internalOrg = void 0;
    this.throttler = this._register(new Throttler());
    if (isWeb) {
      return;
    }
    this.#internalOrg = this.storageService.get(DefaultAccountUpdateContribution.STORAGE_KEY, -1 /* APPLICATION */, void 0);
    this.throttler.queue(() => this.updateService.setInternalOrg(this.#internalOrg));
    this.refresh();
    this._register(this.defaultAccountService.onDidChangeDefaultAccount(() => this.refresh()));
  }
  static {
    this.STORAGE_KEY = "update/internalOrg";
  }
  #internalOrg;
  refresh() {
    this.throttler.queue(() => this.doRefresh());
  }
  async doRefresh() {
    try {
      const defaultAccount = await this.defaultAccountService.getDefaultAccount();
      const internalOrg = getInternalOrg(defaultAccount?.entitlementsData?.organization_login_list);
      if (internalOrg === this.#internalOrg) {
        return;
      }
      this.#internalOrg = internalOrg;
      await this.updateService.setInternalOrg(this.#internalOrg);
      if (this.#internalOrg) {
        this.storageService.store(DefaultAccountUpdateContribution.STORAGE_KEY, internalOrg, -1 /* APPLICATION */, 1 /* MACHINE */);
      } else {
        this.storageService.remove(DefaultAccountUpdateContribution.STORAGE_KEY, -1 /* APPLICATION */);
      }
    } catch (error) {
    }
  }
};

DefaultAccountUpdateContribution = __decorateClass([
  __decorateParam(0, IUpdateService),
  __decorateParam(1, IDefaultAccountService),
  __decorateParam(2, IStorageService)
], DefaultAccountUpdateContribution);
export { showReleaseNotesInEditor, openLatestReleaseNotesInBrowser, showReleaseNotes, appendUpdateMenuItems, isMajorMinorUpdate, CONTEXT_UPDATE_STATE, MAJOR_MINOR_UPDATE_AVAILABLE, releaseNotesManager, ProductContribution, UpdateContribution, SwitchProductQualityContribution, DefaultAccountUpdateContribution };
