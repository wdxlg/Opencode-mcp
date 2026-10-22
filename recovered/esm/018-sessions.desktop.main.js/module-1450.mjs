// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/authentication/browser/authenticationMcpService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable, DisposableStore, MutableDisposable, dispose } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { scopesMatch } from "./module-1416.mjs";
import { IActivityService, NumberBadge } from "./module-1448.mjs";
import { localize } from "./module-0001.mjs";
import { Severity2 } from "./module-0336.mjs";
import { MenuId, MenuRegistry } from "./module-0092.mjs";
import { CommandsRegistry } from "./module-0087.mjs";
import { IAuthenticationService } from "./module-0952.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IProductService } from "./module-0875.mjs";
import { IAuthenticationMcpUsageService } from "./module-1449.mjs";
import { IAuthenticationMcpAccessService } from "./module-1447.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/authentication/browser/authenticationMcpService.ts
var SCOPESLIST_SEPARATOR = " ";

var IAuthenticationMcpService = createDecorator("IAuthenticationMcpService");

var AuthenticationMcpService = class extends Disposable {
  constructor(activityService, storageService, dialogService, quickInputService, _productService, _authenticationService, _authenticationUsageService, _authenticationAccessService) {
    super();
    this.activityService = activityService;
    this.storageService = storageService;
    this.dialogService = dialogService;
    this.quickInputService = quickInputService;
    this._productService = _productService;
    this._authenticationService = _authenticationService;
    this._authenticationUsageService = _authenticationUsageService;
    this._authenticationAccessService = _authenticationAccessService;
    this._signInRequestItems = /* @__PURE__ */ new Map();
    this._sessionAccessRequestItems = /* @__PURE__ */ new Map();
    this._accountBadgeDisposable = this._register(new MutableDisposable());
    this._onDidAccountPreferenceChange = this._register(new Emitter());
    this.onDidChangeAccountPreference = this._onDidAccountPreferenceChange.event;
    this._inheritAuthAccountPreferenceParentToChildren = this._productService.inheritAuthAccountPreference || {};
    this._inheritAuthAccountPreferenceChildToParent = Object.entries(this._inheritAuthAccountPreferenceParentToChildren).reduce((acc, [parent, children]) => {
      children.forEach((child) => {
        acc[child] = parent;
      });
      return acc;
    }, {});
    this.registerListeners();
  }
  registerListeners() {
    this._register(this._authenticationService.onDidChangeSessions(async (e4) => {
      if (e4.event.added?.length) {
        await this.updateNewSessionRequests(e4.providerId, e4.event.added);
      }
      if (e4.event.removed?.length) {
        await this.updateAccessRequests(e4.providerId, e4.event.removed);
      }
      this.updateBadgeCount();
    }));
    this._register(this._authenticationService.onDidUnregisterAuthenticationProvider((e4) => {
      const accessRequests = this._sessionAccessRequestItems.get(e4.id) || {};
      Object.keys(accessRequests).forEach((mcpServerId) => {
        this.removeAccessRequest(e4.id, mcpServerId);
      });
    }));
  }
  async updateNewSessionRequests(providerId, addedSessions) {
    const existingRequestsForProvider = this._signInRequestItems.get(providerId);
    if (!existingRequestsForProvider) {
      return;
    }
    Object.keys(existingRequestsForProvider).forEach((requestedScopes) => {
      const requestedScopesArray = requestedScopes.split(SCOPESLIST_SEPARATOR);
      if (addedSessions.some((session) => scopesMatch(session.scopes, requestedScopesArray))) {
        const sessionRequest = existingRequestsForProvider[requestedScopes];
        sessionRequest?.disposables.forEach((item) => item.dispose());
        delete existingRequestsForProvider[requestedScopes];
        if (Object.keys(existingRequestsForProvider).length === 0) {
          this._signInRequestItems.delete(providerId);
        } else {
          this._signInRequestItems.set(providerId, existingRequestsForProvider);
        }
      }
    });
  }
  async updateAccessRequests(providerId, removedSessions) {
    const providerRequests = this._sessionAccessRequestItems.get(providerId);
    if (providerRequests) {
      Object.keys(providerRequests).forEach((mcpServerId) => {
        removedSessions.forEach((removed) => {
          const indexOfSession = providerRequests[mcpServerId].possibleSessions.findIndex((session) => session.id === removed.id);
          if (indexOfSession) {
            providerRequests[mcpServerId].possibleSessions.splice(indexOfSession, 1);
          }
        });
        if (!providerRequests[mcpServerId].possibleSessions.length) {
          this.removeAccessRequest(providerId, mcpServerId);
        }
      });
    }
  }
  updateBadgeCount() {
    this._accountBadgeDisposable.clear();
    let numberOfRequests = 0;
    this._signInRequestItems.forEach((providerRequests) => {
      Object.keys(providerRequests).forEach((request2) => {
        numberOfRequests += providerRequests[request2].requestingMcpServerIds.length;
      });
    });
    this._sessionAccessRequestItems.forEach((accessRequest) => {
      numberOfRequests += Object.keys(accessRequest).length;
    });
    if (numberOfRequests > 0) {
      const badge = new NumberBadge(numberOfRequests, () => localize(22737, null));
      this._accountBadgeDisposable.value = this.activityService.showAccountsActivity({ badge });
    }
  }
  removeAccessRequest(providerId, mcpServerId) {
    const providerRequests = this._sessionAccessRequestItems.get(providerId) || {};
    if (providerRequests[mcpServerId]) {
      dispose(providerRequests[mcpServerId].disposables);
      delete providerRequests[mcpServerId];
      this.updateBadgeCount();
    }
  }
  //#region Account/Session Preference
  updateAccountPreference(mcpServerId, providerId, account) {
    const parentMcpServerId = this._inheritAuthAccountPreferenceChildToParent[mcpServerId] ?? mcpServerId;
    const key3 = this._getKey(parentMcpServerId, providerId);
    this.storageService.store(key3, account.label, 1 /* WORKSPACE */, 1 /* MACHINE */);
    this.storageService.store(key3, account.label, -1 /* APPLICATION */, 1 /* MACHINE */);
    const childrenMcpServers = this._inheritAuthAccountPreferenceParentToChildren[parentMcpServerId];
    const mcpServerIds = childrenMcpServers ? [parentMcpServerId, ...childrenMcpServers] : [parentMcpServerId];
    this._onDidAccountPreferenceChange.fire({ mcpServerIds, providerId });
  }
  getAccountPreference(mcpServerId, providerId) {
    const key3 = this._getKey(this._inheritAuthAccountPreferenceChildToParent[mcpServerId] ?? mcpServerId, providerId);
    return this.storageService.get(key3, 1 /* WORKSPACE */) ?? this.storageService.get(key3, -1 /* APPLICATION */);
  }
  removeAccountPreference(mcpServerId, providerId) {
    const key3 = this._getKey(this._inheritAuthAccountPreferenceChildToParent[mcpServerId] ?? mcpServerId, providerId);
    this.storageService.remove(key3, 1 /* WORKSPACE */);
    this.storageService.remove(key3, -1 /* APPLICATION */);
  }
  _getKey(mcpServerId, providerId) {
    return `${mcpServerId}-${providerId}`;
  }
  // TODO@TylerLeonhardt: Remove all of this after a couple iterations
  updateSessionPreference(providerId, mcpServerId, session) {
    const key3 = `${mcpServerId}-${providerId}-${session.scopes.join(SCOPESLIST_SEPARATOR)}`;
    this.storageService.store(key3, session.id, 1 /* WORKSPACE */, 1 /* MACHINE */);
    this.storageService.store(key3, session.id, -1 /* APPLICATION */, 1 /* MACHINE */);
  }
  getSessionPreference(providerId, mcpServerId, scopes) {
    const key3 = `${mcpServerId}-${providerId}-${scopes.join(SCOPESLIST_SEPARATOR)}`;
    return this.storageService.get(key3, 1 /* WORKSPACE */) ?? this.storageService.get(key3, -1 /* APPLICATION */);
  }
  removeSessionPreference(providerId, mcpServerId, scopes) {
    const key3 = `${mcpServerId}-${providerId}-${scopes.join(SCOPESLIST_SEPARATOR)}`;
    this.storageService.remove(key3, 1 /* WORKSPACE */);
    this.storageService.remove(key3, -1 /* APPLICATION */);
  }
  _updateAccountAndSessionPreferences(providerId, mcpServerId, session) {
    this.updateAccountPreference(mcpServerId, providerId, session.account);
    this.updateSessionPreference(providerId, mcpServerId, session);
  }
  //#endregion
  async showGetSessionPrompt(provider, accountName, mcpServerId, mcpServerName) {
    let SessionPromptChoice;
    ((SessionPromptChoice2) => {
      SessionPromptChoice2[SessionPromptChoice2["Allow"] = 0] = "Allow";
      SessionPromptChoice2[SessionPromptChoice2["Deny"] = 1] = "Deny";
      SessionPromptChoice2[SessionPromptChoice2["Cancel"] = 2] = "Cancel";
    })(SessionPromptChoice || (SessionPromptChoice = {}));
    const { result } = await this.dialogService.prompt({
      type: Severity2.Info,
      message: localize(22733, null, mcpServerName, provider.label, accountName),
      buttons: [
        {
          label: localize(22732, null),
          run: () => 0 /* Allow */
        },
        {
          label: localize(22734, null),
          run: () => 1 /* Deny */
        }
      ],
      cancelButton: {
        run: () => 2 /* Cancel */
      }
    });
    if (result !== 2 /* Cancel */) {
      this._authenticationAccessService.updateAllowedMcpServers(provider.id, accountName, [{ id: mcpServerId, name: mcpServerName, allowed: result === 0 /* Allow */ }]);
      this.removeAccessRequest(provider.id, mcpServerId);
    }
    return result === 0 /* Allow */;
  }
  /**
   * This function should be used only when there are sessions to disambiguate.
   */
  async selectSession(providerId, mcpServerId, mcpServerName, scopes, availableSessions) {
    const allAccounts = await this._authenticationService.getAccounts(providerId);
    if (!allAccounts.length) {
      throw new Error("No accounts available");
    }
    const disposables = new DisposableStore();
    const quickPick = disposables.add(this.quickInputService.createQuickPick());
    quickPick.ignoreFocusOut = true;
    const accountsWithSessions = /* @__PURE__ */ new Set();
    const items = availableSessions.filter((session) => !accountsWithSessions.has(session.account.label) && accountsWithSessions.add(session.account.label)).map((session) => {
      return {
        label: session.account.label,
        session
      };
    });
    allAccounts.forEach((account) => {
      if (!accountsWithSessions.has(account.label)) {
        items.push({ label: account.label, account });
      }
    });
    items.push({ label: localize(22739, null) });
    quickPick.items = items;
    quickPick.title = localize(
      22736,
      null,
      mcpServerName,
      this._authenticationService.getProvider(providerId).label
    );
    quickPick.placeholder = localize(22735, null, mcpServerName);
    return await new Promise((resolve3, reject) => {
      disposables.add(quickPick.onDidAccept(async (_) => {
        quickPick.dispose();
        let session = quickPick.selectedItems[0].session;
        if (!session) {
          const account = quickPick.selectedItems[0].account;
          try {
            session = await this._authenticationService.createSession(providerId, scopes, { account });
          } catch (e4) {
            reject(e4);
            return;
          }
        }
        const accountName = session.account.label;
        this._authenticationAccessService.updateAllowedMcpServers(providerId, accountName, [{ id: mcpServerId, name: mcpServerName, allowed: true }]);
        this._updateAccountAndSessionPreferences(providerId, mcpServerId, session);
        this.removeAccessRequest(providerId, mcpServerId);
        resolve3(session);
      }));
      disposables.add(quickPick.onDidHide((_) => {
        if (!quickPick.selectedItems[0]) {
          reject("User did not consent to account access");
        }
        disposables.dispose();
      }));
      quickPick.show();
    });
  }
  async completeSessionAccessRequest(provider, mcpServerId, mcpServerName, scopes) {
    const providerRequests = this._sessionAccessRequestItems.get(provider.id) || {};
    const existingRequest = providerRequests[mcpServerId];
    if (!existingRequest) {
      return;
    }
    if (!provider) {
      return;
    }
    const possibleSessions = existingRequest.possibleSessions;
    let session;
    if (provider.supportsMultipleAccounts) {
      try {
        session = await this.selectSession(provider.id, mcpServerId, mcpServerName, scopes, possibleSessions);
      } catch (_) {
      }
    } else {
      const approved = await this.showGetSessionPrompt(provider, possibleSessions[0].account.label, mcpServerId, mcpServerName);
      if (approved) {
        session = possibleSessions[0];
      }
    }
    if (session) {
      this._authenticationUsageService.addAccountUsage(provider.id, session.account.label, session.scopes, mcpServerId, mcpServerName);
    }
  }
  requestSessionAccess(providerId, mcpServerId, mcpServerName, scopes, possibleSessions) {
    const providerRequests = this._sessionAccessRequestItems.get(providerId) || {};
    const hasExistingRequest = providerRequests[mcpServerId];
    if (hasExistingRequest) {
      return;
    }
    const provider = this._authenticationService.getProvider(providerId);
    const menuItem = MenuRegistry.appendMenuItem(MenuId.AccountsContext, {
      group: "3_accessRequests",
      command: {
        id: `${providerId}${mcpServerId}Access`,
        title: localize(
          22731,
          null,
          provider.label,
          mcpServerName
        )
      }
    });
    const accessCommand = CommandsRegistry.registerCommand({
      id: `${providerId}${mcpServerId}Access`,
      handler: async (accessor) => {
        this.completeSessionAccessRequest(provider, mcpServerId, mcpServerName, scopes);
      }
    });
    providerRequests[mcpServerId] = { possibleSessions, disposables: [menuItem, accessCommand] };
    this._sessionAccessRequestItems.set(providerId, providerRequests);
    this.updateBadgeCount();
  }
  async requestNewSession(providerId, scopes, mcpServerId, mcpServerName) {
    if (!this._authenticationService.isAuthenticationProviderRegistered(providerId)) {
      await new Promise((resolve3, _) => {
        const dispose2 = this._authenticationService.onDidRegisterAuthenticationProvider((e4) => {
          if (e4.id === providerId) {
            dispose2.dispose();
            resolve3();
          }
        });
      });
    }
    let provider;
    try {
      provider = this._authenticationService.getProvider(providerId);
    } catch (_e) {
      return;
    }
    const providerRequests = this._signInRequestItems.get(providerId);
    const scopesList = scopes.join(SCOPESLIST_SEPARATOR);
    const mcpServerHasExistingRequest = providerRequests && providerRequests[scopesList] && providerRequests[scopesList].requestingMcpServerIds.includes(mcpServerId);
    if (mcpServerHasExistingRequest) {
      return;
    }
    const commandId = `${providerId}:${mcpServerId}:signIn${Object.keys(providerRequests || []).length}`;
    const menuItem = MenuRegistry.appendMenuItem(MenuId.AccountsContext, {
      group: "2_signInRequests",
      command: {
        id: commandId,
        title: localize(
          22738,
          null,
          provider.label,
          mcpServerName
        )
      }
    });
    const signInCommand = CommandsRegistry.registerCommand({
      id: commandId,
      handler: async (accessor) => {
        const authenticationService = accessor.get(IAuthenticationService);
        const session = await authenticationService.createSession(providerId, scopes);
        this._authenticationAccessService.updateAllowedMcpServers(providerId, session.account.label, [{ id: mcpServerId, name: mcpServerName, allowed: true }]);
        this._updateAccountAndSessionPreferences(providerId, mcpServerId, session);
      }
    });
    if (providerRequests) {
      const existingRequest = providerRequests[scopesList] || { disposables: [], requestingMcpServerIds: [] };
      providerRequests[scopesList] = {
        disposables: [...existingRequest.disposables, menuItem, signInCommand],
        requestingMcpServerIds: [...existingRequest.requestingMcpServerIds, mcpServerId]
      };
      this._signInRequestItems.set(providerId, providerRequests);
    } else {
      this._signInRequestItems.set(providerId, {
        [scopesList]: {
          disposables: [menuItem, signInCommand],
          requestingMcpServerIds: [mcpServerId]
        }
      });
    }
    this.updateBadgeCount();
  }
};

AuthenticationMcpService = __decorateClass([
  __decorateParam(0, IActivityService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IDialogService),
  __decorateParam(3, IQuickInputService),
  __decorateParam(4, IProductService),
  __decorateParam(5, IAuthenticationService),
  __decorateParam(6, IAuthenticationMcpUsageService),
  __decorateParam(7, IAuthenticationMcpAccessService)
], AuthenticationMcpService);

registerSingleton(IAuthenticationMcpService, AuthenticationMcpService, 1 /* Delayed */);
export { SCOPESLIST_SEPARATOR, IAuthenticationMcpService, AuthenticationMcpService };
