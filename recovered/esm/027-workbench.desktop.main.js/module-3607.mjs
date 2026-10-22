// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/authentication/browser/actions/manageAccountPreferencesForExtensionAction.ts
import { Action2, MenuId } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAuthenticationService } from "./module-0951.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IAuthenticationQueryService } from "./module-1753.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/authentication/browser/actions/manageAccountPreferencesForExtensionAction.ts
var ManageAccountPreferencesForExtensionAction = class extends Action2 {
  constructor() {
    super({
      id: "_manageAccountPreferencesForExtension",
      title: localize2(7901, "Manage Extension Account Preferences..."),
      category: localize2(7899, "Accounts"),
      f1: true,
      menu: [{
        id: MenuId.AccountsContext,
        order: 100
      }]
    });
  }
  run(accessor, extensionId, providerId) {
    return accessor.get(IInstantiationService).createInstance(ManageAccountPreferenceForExtensionActionImpl).run(extensionId, providerId);
  }
};

var ManageAccountPreferenceForExtensionActionImpl = class {
  constructor(_authenticationService, _quickInputService, _dialogService, _authenticationQueryService, _extensionService, _logService) {
    this._authenticationService = _authenticationService;
    this._quickInputService = _quickInputService;
    this._dialogService = _dialogService;
    this._authenticationQueryService = _authenticationQueryService;
    this._extensionService = _extensionService;
    this._logService = _logService;
  }
  async run(extensionId, providerId) {
    if (!extensionId) {
      const extensions = this._extensionService.extensions.filter((ext) => this._authenticationQueryService.extension(ext.identifier.value).getAllAccountPreferences().size > 0).sort((a, b) => (a.displayName ?? a.name).localeCompare(b.displayName ?? b.name));
      const result = await this._quickInputService.pick(extensions.map((ext) => ({
        label: ext.displayName ?? ext.name,
        id: ext.identifier.value
      })), {
        placeHolder: localize(7906, null),
        title: localize(7904, null)
      });
      extensionId = result?.id;
    }
    if (!extensionId) {
      return;
    }
    const extension = await this._extensionService.getExtension(extensionId);
    if (!extension) {
      throw new Error(`No extension with id ${extensionId}`);
    }
    if (!providerId) {
      const extensionQuery = this._authenticationQueryService.extension(extensionId);
      const providersWithAccess = await extensionQuery.getProvidersWithAccess();
      if (!providersWithAccess.length) {
        await this._dialogService.info(localize(7903, null));
        return;
      }
      providerId = providersWithAccess[0];
      if (providersWithAccess.length > 1) {
        const result = await this._quickInputService.pick(
          providersWithAccess.map((providerId2) => ({
            label: this._authenticationService.getProvider(providerId2).label,
            id: providerId2
          })),
          {
            placeHolder: localize(7907, null),
            title: localize(7904, null)
          }
        );
        if (!result) {
          return;
        }
        providerId = result.id;
      }
    }
    const accounts = await this._authenticationService.getAccounts(providerId);
    const currentAccountNamePreference = this._authenticationQueryService.provider(providerId).extension(extensionId).getPreferredAccount();
    const items = this._getItems(accounts, providerId, currentAccountNamePreference);
    const provider = this._authenticationService.getProvider(providerId);
    if (provider.supportsMultipleAccounts) {
      const lastUsedScopes = accounts.flatMap((account) => this._authenticationQueryService.provider(providerId).account(account.label).extension(extensionId).getUsage()).sort((a, b) => b.lastUsed - a.lastUsed)[0]?.scopes;
      if (lastUsedScopes) {
        items.push({ type: "separator" });
        items.push({
          providerId,
          scopes: lastUsedScopes,
          label: localize(7909, null)
        });
      }
    }
    const disposables = new DisposableStore();
    const picker = this._createQuickPick(disposables, extensionId, extension.displayName ?? extension.name, provider.label);
    if (items.length === 0) {
      disposables.add(this._handleNoAccounts(picker));
      return;
    }
    picker.items = items;
    picker.show();
  }
  _createQuickPick(disposableStore, extensionId, extensionLabel, providerLabel) {
    const picker = disposableStore.add(this._quickInputService.createQuickPick({ useSeparators: true }));
    disposableStore.add(picker.onDidHide(() => {
      disposableStore.dispose();
    }));
    picker.placeholder = localize(7905, null, extensionLabel, providerLabel);
    picker.title = localize(7908, null, extensionLabel);
    picker.sortByLabel = false;
    disposableStore.add(picker.onDidAccept(async () => {
      picker.hide();
      await this._accept(extensionId, picker.selectedItems);
    }));
    return picker;
  }
  _getItems(accounts, providerId, currentAccountNamePreference) {
    return accounts.map(
      (a) => currentAccountNamePreference === a.label ? {
        label: a.label,
        account: a,
        providerId,
        description: localize(7900, null),
        picked: true
      } : {
        label: a.label,
        account: a,
        providerId
      }
    );
  }
  _handleNoAccounts(picker) {
    picker.validationMessage = localize(7902, null);
    picker.buttons = [this._quickInputService.backButton];
    picker.show();
    return Event2.filter(picker.onDidTriggerButton, (e) => e === this._quickInputService.backButton)(() => this.run());
  }
  async _accept(extensionId, selectedItems) {
    for (const item of selectedItems) {
      let account;
      if (!item.account) {
        try {
          const session = await this._authenticationService.createSession(item.providerId, [...item.scopes]);
          account = session.account;
        } catch (e) {
          this._logService.error(e);
          continue;
        }
      } else {
        account = item.account;
      }
      const providerId = item.providerId;
      const extensionQuery = this._authenticationQueryService.provider(providerId).extension(extensionId);
      const currentAccountName = extensionQuery.getPreferredAccount();
      if (currentAccountName === account.label) {
        continue;
      }
      extensionQuery.setPreferredAccount(account);
    }
  }
};

ManageAccountPreferenceForExtensionActionImpl = __decorateClass([
  __decorateParam(0, IAuthenticationService),
  __decorateParam(1, IQuickInputService),
  __decorateParam(2, IDialogService),
  __decorateParam(3, IAuthenticationQueryService),
  __decorateParam(4, IExtensionService),
  __decorateParam(5, ILogService)
], ManageAccountPreferenceForExtensionActionImpl);
export { ManageAccountPreferencesForExtensionAction, ManageAccountPreferenceForExtensionActionImpl };
