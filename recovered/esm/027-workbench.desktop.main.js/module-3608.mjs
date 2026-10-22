// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/authentication/browser/actions/manageAccountPreferencesForMcpServerAction.ts
import { Action2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAuthenticationService } from "./module-0951.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IAuthenticationQueryService } from "./module-1753.mjs";
import { IMcpService } from "./module-1206.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/authentication/browser/actions/manageAccountPreferencesForMcpServerAction.ts
var ManageAccountPreferencesForMcpServerAction = class extends Action2 {
  constructor() {
    super({
      id: "_manageAccountPreferencesForMcpServer",
      title: localize2(7912, "Manage MCP Server Account Preferences"),
      category: localize2(7910, "Accounts"),
      f1: false
    });
  }
  run(accessor, mcpServerId, providerId) {
    return accessor.get(IInstantiationService).createInstance(ManageAccountPreferenceForMcpServerActionImpl).run(mcpServerId, providerId);
  }
};

var ManageAccountPreferenceForMcpServerActionImpl = class {
  constructor(_authenticationService, _quickInputService, _dialogService, _authenticationQueryService, _mcpService, _logService) {
    this._authenticationService = _authenticationService;
    this._quickInputService = _quickInputService;
    this._dialogService = _dialogService;
    this._authenticationQueryService = _authenticationQueryService;
    this._mcpService = _mcpService;
    this._logService = _logService;
  }
  async run(mcpServerId, providerId) {
    if (!mcpServerId) {
      return;
    }
    const mcpServer = this._mcpService.servers.get().find((s) => s.definition.id === mcpServerId);
    if (!mcpServer) {
      throw new Error(`No MCP server with id ${mcpServerId}`);
    }
    if (!providerId) {
      const mcpServerQuery = this._authenticationQueryService.mcpServer(mcpServerId);
      const providersWithAccess = await mcpServerQuery.getProvidersWithAccess();
      if (!providersWithAccess.length) {
        await this._dialogService.info(localize(7914, null));
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
            placeHolder: localize(7917, null),
            title: localize(7915, null)
          }
        );
        if (!result) {
          return;
        }
        providerId = result.id;
      }
    }
    const accounts = await this._authenticationService.getAccounts(providerId);
    const currentAccountNamePreference = this._authenticationQueryService.provider(providerId).mcpServer(mcpServerId).getPreferredAccount();
    const items = this._getItems(accounts, providerId, currentAccountNamePreference);
    const provider = this._authenticationService.getProvider(providerId);
    if (provider.supportsMultipleAccounts) {
      const lastUsedScopes = accounts.flatMap((account) => this._authenticationQueryService.provider(providerId).account(account.label).mcpServer(mcpServerId).getUsage()).sort((a, b) => b.lastUsed - a.lastUsed)[0]?.scopes;
      if (lastUsedScopes) {
        items.push({ type: "separator" });
        items.push({
          providerId,
          scopes: lastUsedScopes,
          label: localize(7919, null)
        });
      }
    }
    const disposables = new DisposableStore();
    const picker = this._createQuickPick(disposables, mcpServerId, mcpServer.definition.label, provider.label);
    if (items.length === 0) {
      disposables.add(this._handleNoAccounts(picker));
      return;
    }
    picker.items = items;
    picker.show();
  }
  _createQuickPick(disposableStore, mcpServerId, mcpServerLabel, providerLabel) {
    const picker = disposableStore.add(this._quickInputService.createQuickPick({ useSeparators: true }));
    disposableStore.add(picker.onDidHide(() => {
      disposableStore.dispose();
    }));
    picker.placeholder = localize(7916, null, mcpServerLabel, providerLabel);
    picker.title = localize(7918, null, mcpServerLabel);
    picker.sortByLabel = false;
    disposableStore.add(picker.onDidAccept(async () => {
      picker.hide();
      await this._accept(mcpServerId, picker.selectedItems);
    }));
    return picker;
  }
  _getItems(accounts, providerId, currentAccountNamePreference) {
    return accounts.map(
      (a) => currentAccountNamePreference === a.label ? {
        label: a.label,
        account: a,
        providerId,
        description: localize(7911, null),
        picked: true
      } : {
        label: a.label,
        account: a,
        providerId
      }
    );
  }
  _handleNoAccounts(picker) {
    picker.validationMessage = localize(7913, null);
    picker.buttons = [this._quickInputService.backButton];
    picker.show();
    return Event2.filter(picker.onDidTriggerButton, (e) => e === this._quickInputService.backButton)(() => this.run());
  }
  async _accept(mcpServerId, selectedItems) {
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
      const mcpQuery = this._authenticationQueryService.provider(providerId).mcpServer(mcpServerId);
      const currentAccountName = mcpQuery.getPreferredAccount();
      if (currentAccountName === account.label) {
        continue;
      }
      mcpQuery.setPreferredAccount(account);
    }
  }
};

ManageAccountPreferenceForMcpServerActionImpl = __decorateClass([
  __decorateParam(0, IAuthenticationService),
  __decorateParam(1, IQuickInputService),
  __decorateParam(2, IDialogService),
  __decorateParam(3, IAuthenticationQueryService),
  __decorateParam(4, IMcpService),
  __decorateParam(5, ILogService)
], ManageAccountPreferenceForMcpServerActionImpl);
export { ManageAccountPreferencesForMcpServerAction, ManageAccountPreferenceForMcpServerActionImpl };
