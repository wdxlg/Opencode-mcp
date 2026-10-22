// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/policies/browser/accountPolicyGateContribution.ts
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { ChatAccountPolicyGateActiveContext, IAccountPolicyGateService } from "./module-0957.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { localize } from "./module-0001.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { DEFAULT_ACCOUNT_SIGN_IN_COMMAND } from "./module-1824.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IChatEntitlementService } from "./module-0953.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";
import { ILogService } from "./module-0095.mjs";
import { IDialogService } from "./module-0267.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IProductService } from "./module-0873.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/workbench/services/policies/browser/accountPolicyGateContribution.ts
var NOTIFICATION_DISMISSED_KEY = "accountPolicy.gateNotificationDismissed";

function isManagedSettingsBlockedDialogFreshness(freshness) {
  return freshness.failure !== "updateRequired" /* UpdateRequired */;
}

var AccountPolicyGateContribution = class extends Disposable {
  constructor(gateService, contextKeyService, chatEntitlementService, defaultAccountService, logService, notificationService, dialogService, commandService, openerService, productService, storageService, telemetryService) {
    super();
    this.gateService = gateService;
    this.chatEntitlementService = chatEntitlementService;
    this.defaultAccountService = defaultAccountService;
    this.logService = logService;
    this.notificationService = notificationService;
    this.dialogService = dialogService;
    this.commandService = commandService;
    this.openerService = openerService;
    this.productService = productService;
    this.storageService = storageService;
    this.telemetryService = telemetryService;
    this.notificationHandle = this._register(new MutableDisposable());
    this.managedSettingsPendingNotificationHandle = this._register(new MutableDisposable());
    this.initialised = false;
    this.contextKey = ChatAccountPolicyGateActiveContext.bindTo(contextKeyService);
    this.lastInfo = this.gateService.gateInfo;
    this.updateManagedSettingsCompatibilityState();
    this.apply(
      this.lastInfo,
      /*forceTelemetry*/
      true,
      /*showNotification*/
      false
    );
    this._register(this.gateService.onDidChangeGateInfo((info) => {
      this.initialised = true;
      this.apply(
        info,
        /*forceTelemetry*/
        false,
        /*showNotification*/
        true
      );
    }));
    this._register(this.defaultAccountService.onDidChangeManagedSettingsCompatibilityError(() => this.updateManagedSettingsCompatibilityState()));
    this._register(disposableTimeout(() => {
      if (!this.initialised) {
        this.initialised = true;
        this.apply(
          this.lastInfo,
          /*forceTelemetry*/
          false,
          /*showNotification*/
          true
        );
      }
    }, 5e3));
  }
  static {
    this.ID = "workbench.contrib.accountPolicyGate";
  }
  apply(info, forceTelemetry, showNotification) {
    const stateChanged = forceTelemetry || info.state !== this.lastInfo.state || info.reason !== this.lastInfo.reason;
    this.lastInfo = info;
    const isRestricted = this.isGateRestricted(info);
    this.updatePolicyGateState();
    this.logService.info(`[AccountPolicyGate] apply: state=${info.state}, reason=${info.reason}, isRestricted=${isRestricted}`);
    if (stateChanged) {
      this.telemetryService.publicLog2("accountPolicy.gateState", {
        gateActive: info.state !== "inactive" /* Inactive */,
        gateSatisfied: info.state === "satisfied" /* Satisfied */,
        reasonNotSatisfied: info.reason
      });
    }
    if (info.reason === "managedSettingsRefresh" /* ManagedSettingsRefresh */) {
      this.notificationHandle.clear();
      this.dismissedKey = void 0;
      this.updateManagedSettingsPendingNotification(info.managedSettingsFreshness);
      if (showNotification) {
        this.maybeShowManagedSettingsDialog();
      }
      return;
    }
    this.managedSettingsPendingNotificationHandle.clear();
    if (showNotification) {
      this.maybeShowManagedSettingsDialog();
    }
    if (info.state !== "restricted" /* Restricted */) {
      this.notificationHandle.clear();
      this.dismissedKey = void 0;
      this.storageService.remove(NOTIFICATION_DISMISSED_KEY, -1 /* APPLICATION */);
      return;
    }
    if (!showNotification) {
      return;
    }
    if (info.reason === "policyNotResolved" /* PolicyNotResolved */) {
      return;
    }
    const accountName = this.defaultAccountService.currentDefaultAccount?.accountName;
    const notificationKey = `${info.reason ?? ""}:${accountName ?? ""}`;
    if (this.dismissedKey !== void 0 && this.dismissedKey !== notificationKey) {
      this.notificationHandle.clear();
      this.dismissedKey = void 0;
    }
    this.maybeShowNotification(info, notificationKey);
  }
  maybeShowNotification(info, notificationKey) {
    if (this.notificationHandle.value) {
      return;
    }
    if (this.dismissedKey === notificationKey) {
      return;
    }
    const persistedDismissed = this.storageService.get(NOTIFICATION_DISMISSED_KEY, -1 /* APPLICATION */);
    if (persistedDismissed === notificationKey) {
      return;
    }
    const accountName = this.defaultAccountService.currentDefaultAccount?.accountName;
    const approvedOrgs = info.approvedOrganizations ?? [];
    const hasConcreteOrgs = approvedOrgs.length > 0 && !approvedOrgs.includes("*");
    const orgList = approvedOrgs.join(", ");
    let message;
    if (accountName && hasConcreteOrgs) {
      message = localize(
        23251,
        null,
        orgList,
        accountName
      );
    } else if (accountName) {
      message = localize(
        23252,
        null,
        accountName
      );
    } else if (hasConcreteOrgs) {
      message = localize(
        23255,
        null,
        orgList
      );
    } else {
      message = localize(
        23253,
        null
      );
    }
    const handleDisposables = new DisposableStore();
    const handle2 = this.notificationService.prompt(
      Severity2.Warning,
      message,
      [
        {
          label: localize(23254, null),
          run: () => this.commandService.executeCommand(DEFAULT_ACCOUNT_SIGN_IN_COMMAND)
        },
        {
          label: localize(23250, null),
          run: () => this.openerService.open(URI.parse("https://code.visualstudio.com/docs/enterprise/overview"))
        }
      ],
      { sticky: true }
    );
    handleDisposables.add(handle2.onDidClose(() => {
      this.dismissedKey = notificationKey;
      this.notificationHandle.clear();
    }));
    handleDisposables.add({ dispose: () => handle2.close() });
    this.notificationHandle.value = handleDisposables;
  }
  isGateRestricted(info) {
    return info.state === "restricted" /* Restricted */ && info.reason !== "policyNotResolved" /* PolicyNotResolved */;
  }
  updatePolicyGateState() {
    const blocked = this.isGateRestricted(this.lastInfo) || this.defaultAccountService.managedSettingsCompatibilityError !== null;
    this.contextKey.set(blocked);
    this.chatEntitlementService.setForceHidden(blocked);
  }
  updateManagedSettingsCompatibilityState() {
    this.updatePolicyGateState();
    this.maybeShowManagedSettingsDialog();
  }
  updateManagedSettingsPendingNotification(freshness) {
    if (freshness?.state !== "pending" /* Pending */) {
      this.managedSettingsPendingNotificationHandle.clear();
      return;
    }
    if (this.managedSettingsPendingNotificationHandle.value) {
      return;
    }
    const store = new DisposableStore();
    this.managedSettingsPendingNotificationHandle.value = store;
    store.add(disposableTimeout(() => {
      const handle2 = this.notificationService.prompt(
        Severity2.Info,
        localize(23267, null, this.productService.nameShort),
        [],
        { sticky: true }
      );
      store.add(toDisposable(() => handle2.close()));
    }, 5e3));
  }
  maybeShowManagedSettingsDialog() {
    const key3 = this.getManagedSettingsDialogKey();
    if (!key3) {
      const freshness = this.lastInfo.reason === "managedSettingsRefresh" /* ManagedSettingsRefresh */ ? this.lastInfo.managedSettingsFreshness : void 0;
      if (!this.managedSettingsDialogVisibleKey && freshness?.state !== "pending" /* Pending */) {
        this.managedSettingsDialogDismissedKey = void 0;
      }
      return;
    }
    if (this.managedSettingsDialogVisibleKey || this.managedSettingsDialogDismissedKey === key3) {
      return;
    }
    this.managedSettingsDialogVisibleKey = key3;
    void this.showManagedSettingsDialog().finally(() => {
      this.managedSettingsDialogVisibleKey = void 0;
      this.managedSettingsDialogDismissedKey = key3;
      this.maybeShowManagedSettingsDialog();
    });
  }
  getManagedSettingsDialogKey() {
    if (this.defaultAccountService.managedSettingsCompatibilityError) {
      return "updateRequired" /* UpdateRequired */;
    }
    const freshness = this.getBlockedManagedSettingsFreshness();
    return freshness?.failure === "updateRequired" /* UpdateRequired */ ? void 0 : freshness?.failure;
  }
  getBlockedManagedSettingsFreshness() {
    const freshness = this.lastInfo.reason === "managedSettingsRefresh" /* ManagedSettingsRefresh */ ? this.lastInfo.managedSettingsFreshness : void 0;
    return freshness?.state === "blocked" /* Blocked */ ? freshness : void 0;
  }
  showManagedSettingsDialog() {
    const compatibilityError = this.defaultAccountService.managedSettingsCompatibilityError;
    if (compatibilityError) {
      return this.showManagedSettingsCompatibilityDialog(compatibilityError);
    }
    const freshness = this.getBlockedManagedSettingsFreshness();
    return freshness && isManagedSettingsBlockedDialogFreshness(freshness) ? this.showManagedSettingsBlockedDialog(freshness) : Promise.resolve();
  }
  getManagedSettingsBlockedMessage(freshness) {
    switch (freshness.failure) {
      case "noToken" /* NoToken */:
        return localize(23261, null, this.productService.nameShort);
      case "noUrl" /* NoUrl */:
        return localize(23262, null, this.productService.nameShort);
      case "rateLimited" /* RateLimited */:
        return localize(23263, null);
      case "httpError" /* HttpError */:
        return localize(23257, null, this.productService.nameShort, freshness.httpStatus);
      case "malformed" /* Malformed */:
        return localize(23259, null, this.productService.nameShort);
      case "network" /* Network */:
        return localize(23260, null, this.productService.nameShort);
    }
  }
  showManagedSettingsBlockedDialog(freshness) {
    const buttons = [];
    if (freshness.failure === "noToken" /* NoToken */) {
      buttons.push({
        label: localize(23265, null),
        run: () => this.commandService.executeCommand(DEFAULT_ACCOUNT_SIGN_IN_COMMAND)
      });
    } else if (freshness.failure !== "noUrl" /* NoUrl */) {
      buttons.push({
        label: localize(23264, null),
        run: () => {
          void this.defaultAccountService.refresh({ forceRefresh: true, retryManagedSettings: true });
        }
      });
    }
    const title = freshness.failure === "malformed" /* Malformed */ ? localize(23258, null) : localize(23266, null);
    return this.dialogService.prompt({
      type: Severity2.Warning,
      title,
      message: this.getManagedSettingsBlockedMessage(freshness),
      custom: true,
      buttons,
      cancelButton: localize(23256, null)
    });
  }
  showManagedSettingsCompatibilityDialog(error) {
    const message = error.minimumClientVersion ? localize(
      23273,
      null,
      this.productService.nameShort,
      error.minimumClientVersion
    ) : localize(
      23272,
      null,
      this.productService.nameShort
    );
    return this.dialogService.prompt({
      type: Severity2.Warning,
      title: localize(23270, null),
      message,
      custom: true,
      buttons: [
        {
          label: localize(23271, null),
          run: () => this.commandService.executeCommand("update.checkForUpdate")
        },
        {
          label: localize(23269, null),
          run: () => this.openerService.open(URI.parse("https://code.visualstudio.com/docs/enterprise/overview"))
        }
      ],
      cancelButton: localize(23268, null)
    });
  }
};

AccountPolicyGateContribution = __decorateClass([
  __decorateParam(0, IAccountPolicyGateService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IChatEntitlementService),
  __decorateParam(3, IDefaultAccountService),
  __decorateParam(4, ILogService),
  __decorateParam(5, INotificationService),
  __decorateParam(6, IDialogService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, IOpenerService),
  __decorateParam(9, IProductService),
  __decorateParam(10, IStorageService),
  __decorateParam(11, ITelemetryService)
], AccountPolicyGateContribution);
export { isManagedSettingsBlockedDialogFreshness, NOTIFICATION_DISMISSED_KEY, AccountPolicyGateContribution };
