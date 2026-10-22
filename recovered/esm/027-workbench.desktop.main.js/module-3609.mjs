// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/authentication/browser/actions/manageTrustedMcpServersForAccountAction.ts
import { Action2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { fromNow } from "./module-0120.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMcpService } from "./module-1206.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IAuthenticationService } from "./module-0951.mjs";
import { IAuthenticationQueryService } from "./module-1753.mjs";
import { ICommandService } from "./module-0087.mjs";


// src/vs/workbench/contrib/authentication/browser/actions/manageTrustedMcpServersForAccountAction.ts
var ManageTrustedMcpServersForAccountAction = class extends Action2 {
  constructor() {
    super({
      id: "_manageTrustedMCPServersForAccount",
      title: localize2(7959, "Manage Trusted MCP Servers For Account"),
      category: localize2(7954, "Accounts"),
      f1: true,
      precondition: ContextKeyExpr.and(ChatContextKeys.Setup.hidden.negate(), ChatContextKeys.Setup.disabledInWorkspace.negate())
    });
  }
  run(accessor, options3) {
    const instantiationService = accessor.get(IInstantiationService);
    return instantiationService.createInstance(ManageTrustedMcpServersForAccountActionImpl).run(options3);
  }
};

var ManageTrustedMcpServersForAccountActionImpl = class {
  constructor(_mcpServerService, _dialogService, _quickInputService, _mcpServerAuthenticationService, _authenticationQueryService, _commandService) {
    this._mcpServerService = _mcpServerService;
    this._dialogService = _dialogService;
    this._quickInputService = _quickInputService;
    this._mcpServerAuthenticationService = _mcpServerAuthenticationService;
    this._authenticationQueryService = _authenticationQueryService;
    this._commandService = _commandService;
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
      placeHolder: localize(7962, null),
      matchOnDescription: true
    });
    return pick ? this._authenticationQueryService.provider(pick.providerId).account(pick.label) : void 0;
  }
  async _getAllAvailableAccounts() {
    const accounts = [];
    for (const providerId of this._mcpServerAuthenticationService.getProviderIds()) {
      const provider = this._mcpServerAuthenticationService.getProvider(providerId);
      const sessions = await this._mcpServerAuthenticationService.getSessions(providerId);
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
    const allowedMcpServers = accountQuery.mcpServers().getAllowedMcpServers();
    const serverIdToLabel = new Map(this._mcpServerService.servers.get().map((s) => [s.definition.id, s.definition.label]));
    const withLastUsed = (server) => {
      const usage = accountQuery.mcpServer(server.id).getUsage();
      return { ...server, lastUsed: usage.length > 0 ? Math.max(...usage.map((u) => u.lastUsed)) : server.lastUsed };
    };
    const agentHostServers = allowedMcpServers.filter((server) => !!server.agentHost).map(withLastUsed);
    const workbenchServers = allowedMcpServers.filter((server) => !server.agentHost && serverIdToLabel.has(server.id)).map((server) => withLastUsed({ ...server, name: serverIdToLabel.get(server.id) }));
    if (!agentHostServers.length && !workbenchServers.length) {
      this._dialogService.info(localize(7960, null));
      return [];
    }
    const trustedServers = workbenchServers.filter((s) => s.trusted);
    const otherServers = workbenchServers.filter((s) => !s.trusted);
    const sortByLastUsed = (a, b) => (b.lastUsed || 0) - (a.lastUsed || 0);
    const items = [
      ...otherServers.sort(sortByLastUsed).map(this._toQuickPickItem)
    ];
    const byAuthority = /* @__PURE__ */ new Map();
    for (const server of agentHostServers) {
      const group2 = byAuthority.get(server.agentHost.authority) ?? { label: server.agentHost.label, servers: [] };
      group2.servers.push(server);
      byAuthority.set(server.agentHost.authority, group2);
    }
    const sortedGroups = [...byAuthority.values()].sort((a, b) => a.label.localeCompare(b.label));
    for (const { label: label3, servers } of sortedGroups) {
      items.push({ type: "separator", label: localize(7955, null, label3) });
      items.push(...servers.sort(sortByLastUsed).map(this._toQuickPickItem));
    }
    items.push({ type: "separator", label: localize(7963, null) });
    items.push(...trustedServers.sort(sortByLastUsed).map(this._toQuickPickItem));
    return items;
  }
  _toQuickPickItem(mcpServer) {
    const lastUsed = mcpServer.lastUsed;
    const description = lastUsed ? localize(7952, null, fromNow(lastUsed, true)) : localize(7961, null);
    let tooltip;
    let disabled;
    if (mcpServer.trusted) {
      tooltip = localize(7964, null);
      disabled = true;
    }
    return {
      label: mcpServer.name,
      mcpServer,
      description,
      tooltip,
      disabled,
      buttons: [{
        tooltip: localize(7953, null),
        iconClass: ThemeIcon.asClassName(Codicon.settingsGear)
      }],
      picked: mcpServer.allowed === void 0 || mcpServer.allowed
    };
  }
  _createQuickPick(accountQuery) {
    const disposableStore = new DisposableStore();
    const quickPick = disposableStore.add(this._quickInputService.createQuickPick({ useSeparators: true }));
    quickPick.canSelectMany = true;
    quickPick.customButton = true;
    quickPick.customLabel = localize(7958, null);
    quickPick.customButtonSecondary = true;
    quickPick.title = localize(7957, null);
    quickPick.placeholder = localize(7956, null);
    disposableStore.add(quickPick.onDidAccept(() => {
      quickPick.hide();
      const allServers = quickPick.items.filter((item) => item.type !== "separator").map((i2) => i2.mcpServer);
      const selectedServers = new Set(quickPick.selectedItems.map((i2) => i2.mcpServer));
      for (const mcpServer of allServers) {
        const isAllowed = selectedServers.has(mcpServer);
        accountQuery.mcpServer(mcpServer.id).setAccessAllowed(isAllowed, mcpServer.name);
      }
    }));
    disposableStore.add(quickPick.onDidHide(() => disposableStore.dispose()));
    disposableStore.add(quickPick.onDidCustom(() => quickPick.hide()));
    disposableStore.add(quickPick.onDidTriggerItemButton(
      (e) => this._commandService.executeCommand("_manageAccountPreferencesForMcpServer", e.item.mcpServer.id, accountQuery.providerId)
    ));
    return quickPick;
  }
  //#endregion
};

ManageTrustedMcpServersForAccountActionImpl = __decorateClass([
  __decorateParam(0, IMcpService),
  __decorateParam(1, IDialogService),
  __decorateParam(2, IQuickInputService),
  __decorateParam(3, IAuthenticationService),
  __decorateParam(4, IAuthenticationQueryService),
  __decorateParam(5, ICommandService)
], ManageTrustedMcpServersForAccountActionImpl);
export { ManageTrustedMcpServersForAccountAction, ManageTrustedMcpServersForAccountActionImpl };
