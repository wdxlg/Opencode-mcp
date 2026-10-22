// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/authentication/browser/actions/manageTrustedExtensionsForAccountAction.ts
import { Action2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { fromNow } from "./module-0120.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IAuthenticationService } from "./module-0952.mjs";
import { IAuthenticationQueryService } from "./module-1696.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IExtensionsWorkbenchService } from "./module-1023.mjs";


// src/vs/workbench/contrib/authentication/browser/actions/manageTrustedExtensionsForAccountAction.ts
var ManageTrustedExtensionsForAccountAction = class extends Action2 {
  constructor() {
    super({
      id: "_manageTrustedExtensionsForAccount",
      title: localize2(7945, "Manage Trusted Extensions For Account"),
      category: localize2(7941, "Accounts"),
      f1: true
    });
  }
  run(accessor, options3) {
    const instantiationService = accessor.get(IInstantiationService);
    return instantiationService.createInstance(ManageTrustedExtensionsForAccountActionImpl).run(options3);
  }
};

var ManageTrustedExtensionsForAccountActionImpl = class {
  constructor(_extensionService, _dialogService, _quickInputService, _authenticationService, _authenticationQueryService, _commandService, _extensionsWorkbenchService) {
    this._extensionService = _extensionService;
    this._dialogService = _dialogService;
    this._quickInputService = _quickInputService;
    this._authenticationService = _authenticationService;
    this._authenticationQueryService = _authenticationQueryService;
    this._commandService = _commandService;
    this._extensionsWorkbenchService = _extensionsWorkbenchService;
    this._viewDetailsButton = {
      tooltip: localize(7951, null),
      iconClass: ThemeIcon.asClassName(Codicon.info)
    };
    this._managePreferencesButton = {
      tooltip: localize(7940, null),
      iconClass: ThemeIcon.asClassName(Codicon.settingsGear)
    };
  }
  async run(options3) {
    const accountQuery = await this._resolveAccountQuery(options3?.providerId, options3?.accountLabel);
    if (!accountQuery) {
      return;
    }
    const items = await this._getItems(accountQuery);
    if (!items.length) {
      return;
    }
    const picker = this._createQuickPick(accountQuery);
    picker.items = items;
    picker.selectedItems = items.filter((i2) => i2.type !== "separator" && !!i2.picked);
    picker.show();
  }
  //#region Account Query Resolution
  async _resolveAccountQuery(providerId, accountLabel) {
    if (providerId && accountLabel) {
      return this._authenticationQueryService.provider(providerId).account(accountLabel);
    }
    const accounts = await this._getAllAvailableAccounts();
    const pick = await this._quickInputService.pick(accounts, {
      placeHolder: localize(7948, null),
      matchOnDescription: true
    });
    return pick ? this._authenticationQueryService.provider(pick.providerId).account(pick.label) : void 0;
  }
  async _getAllAvailableAccounts() {
    const accounts = [];
    for (const providerId of this._authenticationService.getProviderIds()) {
      const provider = this._authenticationService.getProvider(providerId);
      const sessions = await this._authenticationService.getSessions(providerId);
      const uniqueLabels = /* @__PURE__ */ new Set();
      for (const session of sessions) {
        if (!uniqueLabels.has(session.account.label)) {
          uniqueLabels.add(session.account.label);
          accounts.push({
            providerId,
            label: session.account.label,
            description: provider.label
          });
        }
      }
    }
    return accounts;
  }
  //#endregion
  //#region Item Retrieval and Quick Pick Creation
  async _getItems(accountQuery) {
    const allowedExtensions = accountQuery.extensions().getAllowedExtensions();
    const extensionIdToDisplayName = /* @__PURE__ */ new Map();
    const resolvedExtensions = await Promise.all(allowedExtensions.map((ext) => this._extensionService.getExtension(ext.id)));
    resolvedExtensions.forEach((resolved, i2) => {
      if (resolved) {
        extensionIdToDisplayName.set(allowedExtensions[i2].id, resolved.displayName || resolved.name);
      }
    });
    const filteredExtensions = allowedExtensions.filter((ext) => extensionIdToDisplayName.has(ext.id)).map((ext) => {
      const usage = accountQuery.extension(ext.id).getUsage();
      return {
        ...ext,
        // Use the extension display name from the extension service
        name: extensionIdToDisplayName.get(ext.id),
        lastUsed: usage.length > 0 ? Math.max(...usage.map((u) => u.lastUsed)) : ext.lastUsed
      };
    });
    if (!filteredExtensions.length) {
      this._dialogService.info(localize(7946, null));
      return [];
    }
    const trustedExtensions = filteredExtensions.filter((e4) => e4.trusted);
    const otherExtensions = filteredExtensions.filter((e4) => !e4.trusted);
    const sortByLastUsed = (a, b) => (b.lastUsed || 0) - (a.lastUsed || 0);
    const _toQuickPickItem = this._toQuickPickItem.bind(this);
    return [
      ...otherExtensions.sort(sortByLastUsed).map(_toQuickPickItem),
      { type: "separator", label: localize(7949, null) },
      ...trustedExtensions.sort(sortByLastUsed).map(_toQuickPickItem)
    ];
  }
  _toQuickPickItem(extension) {
    const lastUsed = extension.lastUsed;
    const description = lastUsed ? localize(7939, null, fromNow(lastUsed, true)) : localize(7947, null);
    let tooltip;
    let disabled;
    if (extension.trusted) {
      tooltip = localize(7950, null);
      disabled = true;
    }
    return {
      label: extension.name,
      extension,
      description,
      tooltip,
      disabled,
      buttons: [this._viewDetailsButton, this._managePreferencesButton],
      picked: extension.allowed === void 0 || extension.allowed
    };
  }
  _createQuickPick(accountQuery) {
    const disposableStore = new DisposableStore();
    const quickPick = disposableStore.add(this._quickInputService.createQuickPick({ useSeparators: true }));
    quickPick.canSelectMany = true;
    quickPick.customButton = true;
    quickPick.customLabel = localize(7944, null);
    quickPick.customButtonSecondary = true;
    quickPick.title = localize(7943, null);
    quickPick.placeholder = localize(7942, null);
    disposableStore.add(quickPick.onDidAccept(() => {
      const updatedAllowedList = quickPick.items.filter((item) => item.type !== "separator").map((i2) => i2.extension);
      const allowedExtensionsSet = new Set(quickPick.selectedItems.map((i2) => i2.extension));
      for (const extension of updatedAllowedList) {
        const allowed = allowedExtensionsSet.has(extension);
        accountQuery.extension(extension.id).setAccessAllowed(allowed, extension.name);
      }
      quickPick.hide();
    }));
    disposableStore.add(quickPick.onDidHide(() => disposableStore.dispose()));
    disposableStore.add(quickPick.onDidCustom(() => quickPick.hide()));
    disposableStore.add(quickPick.onDidTriggerItemButton((e4) => {
      if (e4.button === this._managePreferencesButton) {
        this._commandService.executeCommand("_manageAccountPreferencesForExtension", e4.item.extension.id, accountQuery.providerId);
      } else if (e4.button === this._viewDetailsButton) {
        this._extensionsWorkbenchService.open(e4.item.extension.id);
      }
    }));
    return quickPick;
  }
  //#endregion
};

ManageTrustedExtensionsForAccountActionImpl = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, IDialogService),
  __decorateParam(2, IQuickInputService),
  __decorateParam(3, IAuthenticationService),
  __decorateParam(4, IAuthenticationQueryService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, IExtensionsWorkbenchService)
], ManageTrustedExtensionsForAccountActionImpl);
export { ManageTrustedExtensionsForAccountAction, ManageTrustedExtensionsForAccountActionImpl };
