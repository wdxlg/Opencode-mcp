// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/electron-browser/tunnelHost.contribution.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { ITunnelHostService } from "./module-4259.mjs";
import { CONFIGURATION_KEY_MICROSOFT_AUTH, RENAME_TUNNEL_ID, SHOW_TUNNEL_HOST_OUTPUT_ID, TunnelHostService } from "./module-4337.mjs";
import { Disposable } from "./module-0012.mjs";
import { ToggleRemoteConnectionsActionViewItem } from "./module-4338.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { Codicon } from "./module-0085.mjs";
import { ChatContextKeyExprs, ChatContextKeys } from "./module-0966.mjs";
import { IsSessionsWindowContext, RemoteNameContext } from "./module-0950.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { IOutputService } from "./module-1245.mjs";
import { TUNNEL_HOST_LOG_ID } from "./module-1734.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { CONFIGURATION_KEY_HOST_NAME, MAX_TUNNEL_NAME_LENGTH } from "./module-4003.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";


// src/vs/workbench/contrib/chat/electron-browser/tunnelHost.contribution.ts
var TUNNEL_HOST_SHARING_KEY = "tunnelHostSharing";

var TUNNEL_HOST_SHARING_CONTEXT = new RawContextKey(TUNNEL_HOST_SHARING_KEY, false);

var TOGGLE_SHARING_ID = "sessions.tunnelHost.toggleSharing";

var CATEGORY = localize2(13633, "Remote Connections");

var TUNNEL_NAME_REGEX = /^[\w-]+$/;

registerSingleton(ITunnelHostService, TunnelHostService, 1 /* Delayed */);

var TunnelHostContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.tunnelHost";
  }
  constructor(contextKeyService, tunnelHostService, actionViewItemService) {
    super();
    this._sharingContext = TUNNEL_HOST_SHARING_CONTEXT.bindTo(contextKeyService);
    this._sharingContext.set(tunnelHostService.isSharing);
    this._register(tunnelHostService.onDidChangeStatus(() => {
      this._sharingContext.set(tunnelHostService.isSharing);
    }));
    const viewItemFactory = (action, _options, instantiationService) => {
      return instantiationService.createInstance(ToggleRemoteConnectionsActionViewItem, action);
    };
    this._register(actionViewItemService.register(MenuId.ChatInputSecondary, TOGGLE_SHARING_ID, viewItemFactory, tunnelHostService.onDidChangeStatus));
  }
};

TunnelHostContribution = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, ITunnelHostService),
  __decorateParam(2, IActionViewItemService)
], TunnelHostContribution);

registerAction2(class ToggleRemoteConnectionsAction extends Action2 {
  constructor() {
    super({
      id: TOGGLE_SHARING_ID,
      title: localize2(13632, "Allow Remote Connections"),
      category: CATEGORY,
      icon: Codicon.radioTower,
      toggled: ContextKeyExpr.equals(TUNNEL_HOST_SHARING_KEY, true),
      menu: {
        id: MenuId.ChatInputSecondary,
        order: 10,
        group: "navigation",
        when: ContextKeyExpr.and(
          ChatContextKeys.enabled,
          IsSessionsWindowContext.toNegated(),
          RemoteNameContext.isEqualTo(""),
          ChatContextKeyExprs.isAgentHostSession
        )
      }
    });
  }
  async run(accessor) {
    const tunnelHostService = accessor.get(ITunnelHostService);
    const notificationService = accessor.get(INotificationService);
    try {
      if (tunnelHostService.isSharing) {
        await tunnelHostService.stopSharing();
      } else {
        await tunnelHostService.startSharing();
      }
    } catch (err) {
      notificationService.notify({
        severity: Severity2.Error,
        message: localize(13635, null, String(err))
      });
    }
  }
});

registerAction2(class ShowTunnelHostOutputAction extends Action2 {
  constructor() {
    super({
      id: SHOW_TUNNEL_HOST_OUTPUT_ID,
      title: localize2(13631, "Show Remote Connections Output"),
      category: CATEGORY
    });
  }
  async run(accessor) {
    const outputService = accessor.get(IOutputService);
    await outputService.showChannel(TUNNEL_HOST_LOG_ID);
  }
});

registerAction2(class RenameTunnelAction extends Action2 {
  constructor() {
    super({
      id: RENAME_TUNNEL_ID,
      title: localize2(13624, "Rename Tunnel"),
      category: CATEGORY
    });
  }
  async run(accessor) {
    const tunnelHostService = accessor.get(ITunnelHostService);
    const configurationService = accessor.get(IConfigurationService);
    const quickInputService = accessor.get(IQuickInputService);
    const notificationService = accessor.get(INotificationService);
    const currentName = tunnelHostService.sharingInfo?.tunnelName ?? configurationService.getValue(CONFIGURATION_KEY_HOST_NAME);
    const name = await quickInputService.input({
      title: localize(13630, null),
      prompt: localize(13629, null),
      value: currentName,
      placeHolder: localize(13628, null),
      validateInput: async (input) => {
        if (input.length === 0) {
          return void 0;
        }
        if (input.length > MAX_TUNNEL_NAME_LENGTH) {
          return localize(13627, null, MAX_TUNNEL_NAME_LENGTH);
        }
        if (!TUNNEL_NAME_REGEX.test(input) || input.startsWith("-")) {
          return localize(13626, null);
        }
        return void 0;
      }
    });
    if (name === void 0) {
      return;
    }
    await configurationService.updateValue(CONFIGURATION_KEY_HOST_NAME, name || void 0, 2 /* USER */);
    if (!tunnelHostService.isSharing) {
      return;
    }
    try {
      await tunnelHostService.stopSharing();
      await tunnelHostService.startSharing();
    } catch (err) {
      notificationService.error(localize(13625, null, String(err)));
    }
  }
});

registerWorkbenchContribution2(TunnelHostContribution.ID, TunnelHostContribution, WorkbenchPhase.AfterRestored);

Registry.as(Extensions4.Configuration).registerConfiguration({
  type: "object",
  properties: {
    [CONFIGURATION_KEY_MICROSOFT_AUTH]: {
      description: localize(13634, null),
      type: "boolean",
      scope: 1 /* APPLICATION */,
      default: false,
      tags: ["usesOnlineServices"]
    }
  }
});
export { TUNNEL_HOST_SHARING_KEY, TUNNEL_HOST_SHARING_CONTEXT, TOGGLE_SHARING_ID, CATEGORY, TUNNEL_NAME_REGEX, TunnelHostContribution };
