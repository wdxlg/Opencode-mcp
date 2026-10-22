// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/remoteAgentHost/browser/manageRemoteAgentHosts.ts
import { Action2, IMenuService, MenuItemAction, registerAction2 } from "./module-0092.mjs";
import { RemoteAgentHostCommandIds } from "./module-4260.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { SessionsCategories } from "./module-3532.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { IRemoteAgentHostService, RemoteAgentHostsEnabledSettingId } from "./module-1736.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { isAgentHostProvider } from "./module-1764.mjs";
import { TUNNEL_ADDRESS_PREFIX } from "./module-1734.mjs";
import { getStatusLabel, removeRemoteHost, showRemoteHostOptions } from "./module-3560.mjs";
import { Menus } from "./module-3437.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { autorun } from "./module-0052.mjs";


// src/vs/sessions/contrib/providers/remoteAgentHost/browser/manageRemoteAgentHosts.ts
registerAction2(class extends Action2 {
  constructor() {
    super({
      id: RemoteAgentHostCommandIds.manageRemoteAgentHosts,
      title: localize2(5097, "Manage Remote Agent Hosts..."),
      category: SessionsCategories.Sessions,
      f1: true,
      precondition: ContextKeyExpr.equals(`config.${RemoteAgentHostsEnabledSettingId}`, true)
    });
  }
  async run(accessor) {
    const quickInputService = accessor.get(IQuickInputService);
    const sessionsProvidersService = accessor.get(ISessionsProvidersService);
    const remoteAgentHostService = accessor.get(IRemoteAgentHostService);
    const configurationService = accessor.get(IConfigurationService);
    const menuService = accessor.get(IMenuService);
    const contextKeyService = accessor.get(IContextKeyService);
    const commandService = accessor.get(ICommandService);
    const instantiationService = accessor.get(IInstantiationService);
    const removeButton = {
      iconClass: ThemeIcon.asClassName(Codicon.close),
      tooltip: localize(5095, null)
    };
    const buildItems = () => {
      const remoteProviders = sessionsProvidersService.getProviders().filter(isAgentHostProvider).filter((p) => !!p.remoteAddress).filter((p) => !p.hostGroup);
      const remoteItems = remoteProviders.map((p) => {
        const isTunnel = p.remoteAddress?.startsWith(TUNNEL_ADDRESS_PREFIX);
        const status2 = p.connectionStatus?.get();
        const item = {
          kind: "remote",
          provider: p,
          label: `$(${isTunnel ? "cloud" : "remote"}) ${p.label}`,
          description: status2 !== void 0 ? getStatusLabel(status2) : void 0,
          detail: p.remoteAddress
        };
        item.buttons = [removeButton];
        return item;
      });
      const menuActionItems = [];
      const menuActions = menuService.getMenuActions(Menus.SessionWorkspaceManage, contextKeyService, { renderShortTitle: true });
      for (const [, actions] of menuActions) {
        for (const action of actions) {
          if (action instanceof MenuItemAction) {
            const icon2 = ThemeIcon.isThemeIcon(action.item.icon) ? action.item.icon : void 0;
            menuActionItems.push({
              kind: "menu-action",
              action,
              label: icon2 ? `$(${icon2.id}) ${action.label}` : action.label,
              description: action.tooltip || void 0
            });
          }
        }
      }
      const items = [];
      if (remoteItems.length > 0) {
        items.push({ type: "separator", label: localize(5094, null) });
        items.push(...remoteItems);
      }
      if (menuActionItems.length > 0) {
        items.push({ type: "separator", label: localize(5092, null) });
        items.push(...menuActionItems);
      }
      return items;
    };
    const showManagePicker = () => {
      const store = new DisposableStore();
      const picker = quickInputService.createQuickPick({ useSeparators: true });
      store.add(picker);
      picker.title = localize(5096, null);
      picker.placeholder = localize(5093, null);
      picker.matchOnDescription = true;
      picker.matchOnDetail = true;
      let lastFilter = "";
      const refresh = () => {
        lastFilter = picker.value;
        picker.items = buildItems();
        picker.value = lastFilter;
      };
      refresh();
      store.add(sessionsProvidersService.onDidChangeProviders(() => refresh()));
      const observerStore = store.add(new DisposableStore());
      const subscribeToProviders = () => {
        observerStore.clear();
        for (const p of sessionsProvidersService.getProviders()) {
          if (isAgentHostProvider(p) && p.connectionStatus) {
            observerStore.add(autorun((reader) => {
              p.connectionStatus.read(reader);
              refresh();
            }));
          }
        }
      };
      subscribeToProviders();
      store.add(sessionsProvidersService.onDidChangeProviders(() => subscribeToProviders()));
      store.add(picker.onDidTriggerItemButton(async (e4) => {
        if (e4.item.kind === "remote" && e4.button === removeButton) {
          await removeRemoteHost(e4.item.provider, remoteAgentHostService, configurationService);
        }
      }));
      store.add(picker.onDidAccept(() => {
        const selected = picker.selectedItems[0];
        picker.hide();
        if (!selected) {
          return;
        }
        if (selected.kind === "remote") {
          void instantiationService.invokeFunction((a) => showRemoteHostOptions(a, selected.provider, { showBackButton: true })).then((result) => {
            if (result === "back") {
              showManagePicker();
            }
          });
        } else if (selected.kind === "menu-action") {
          commandService.executeCommand(selected.action.id, () => showManagePicker());
        }
      }));
      store.add(picker.onDidHide(() => store.dispose()));
      picker.show();
    };
    showManagePicker();
  }
});
export {};
