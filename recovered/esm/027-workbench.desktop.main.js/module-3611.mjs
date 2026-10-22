// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/authentication/browser/actions/manageAccountsAction.ts
import { Action2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { Lazy } from "./module-0028.mjs";
import { getCurrentAuthenticationSessionInfo } from "./module-1418.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IAuthenticationService } from "./module-0951.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ISecretStorageService } from "./module-0948.mjs";
import { IProductService } from "./module-0873.mjs";


// src/vs/workbench/contrib/authentication/browser/actions/manageAccountsAction.ts
var ManageAccountsAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.manageAccounts",
      title: localize2(7922, "Manage Accounts"),
      category: localize2(7920, "Accounts"),
      f1: true
    });
  }
  run(accessor) {
    const instantiationService = accessor.get(IInstantiationService);
    return instantiationService.createInstance(ManageAccountsActionImpl).run();
  }
};

var ManageAccountsActionImpl = class {
  constructor(quickInputService, authenticationService, commandService, secretStorageService, productService) {
    this.quickInputService = quickInputService;
    this.authenticationService = authenticationService;
    this.commandService = commandService;
    this.secretStorageService = secretStorageService;
    this.productService = productService;
  }
  async run() {
    const placeHolder = localize(7926, null);
    const accounts = await this.listAccounts();
    if (!accounts.length) {
      await this.quickInputService.pick([{ label: localize(7925, null) }], { placeHolder });
      return;
    }
    const account = await this.quickInputService.pick(accounts, { placeHolder, matchOnDescription: true });
    if (!account) {
      return;
    }
    await this.showAccountActions(account);
  }
  async listAccounts() {
    const activeSession = new Lazy(() => getCurrentAuthenticationSessionInfo(this.secretStorageService, this.productService));
    const accounts = [];
    for (const providerId of this.authenticationService.getProviderIds()) {
      const provider = this.authenticationService.getProvider(providerId);
      for (const { label: label3, id: id2 } of await this.authenticationService.getAccounts(providerId)) {
        accounts.push({
          label: label3,
          description: provider.label,
          providerId,
          canUseMcp: !!provider.authorizationServers?.length,
          canSignOut: async () => this.canSignOut(provider, id2, await activeSession.value)
        });
      }
    }
    return accounts;
  }
  async canSignOut(provider, accountId, session) {
    if (session && !session.canSignOut && session.providerId === provider.id) {
      const sessions = await this.authenticationService.getSessions(provider.id);
      return !sessions.some((o) => o.id === session.id && o.account.id === accountId);
    }
    return true;
  }
  async showAccountActions(account) {
    const { providerId, label: accountLabel, canUseMcp, canSignOut } = account;
    const store = new DisposableStore();
    const quickPick = store.add(this.quickInputService.createQuickPick());
    quickPick.title = localize(7921, null, accountLabel);
    quickPick.placeholder = localize(7927, null);
    quickPick.buttons = [this.quickInputService.backButton];
    const items = [{
      label: localize(7923, null),
      action: () => this.commandService.executeCommand("_manageTrustedExtensionsForAccount", { providerId, accountLabel })
    }];
    if (canUseMcp) {
      items.push({
        label: localize(7924, null),
        action: () => this.commandService.executeCommand("_manageTrustedMCPServersForAccount", { providerId, accountLabel })
      });
    }
    if (await canSignOut()) {
      items.push({
        label: localize(7928, null),
        action: () => this.commandService.executeCommand("_signOutOfAccount", { providerId, accountLabel })
      });
    }
    quickPick.items = items;
    store.add(quickPick.onDidAccept(() => {
      const selected = quickPick.selectedItems[0];
      if (selected) {
        quickPick.hide();
        selected.action();
      }
    }));
    store.add(quickPick.onDidTriggerButton((button) => {
      if (button === this.quickInputService.backButton) {
        void this.run();
      }
    }));
    store.add(quickPick.onDidHide(() => store.dispose()));
    quickPick.show();
  }
};

ManageAccountsActionImpl = __decorateClass([
  __decorateParam(0, IQuickInputService),
  __decorateParam(1, IAuthenticationService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, ISecretStorageService),
  __decorateParam(4, IProductService)
], ManageAccountsActionImpl);
export { ManageAccountsAction, ManageAccountsActionImpl };
