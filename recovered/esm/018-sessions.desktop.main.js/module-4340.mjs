// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/tunnelHost/electron-browser/tunnelHost.contribution.ts
import { MenuRegistry } from "./module-0092.mjs";
import { Menus } from "./module-3437.mjs";
import { TOGGLE_SHARING_ID, TUNNEL_HOST_SHARING_KEY } from "./module-4339.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { IsAuxiliaryWindowContext, IsSessionsWindowContext } from "./module-0950.mjs";
import { Disposable } from "./module-0012.mjs";
import { ToggleRemoteConnectionsActionViewItem } from "./module-4338.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITunnelHostService } from "./module-4259.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/tunnelHost/electron-browser/tunnelHost.contribution.ts
MenuRegistry.appendMenuItem(Menus.TitleBarRightLayout, {
  command: {
    id: TOGGLE_SHARING_ID,
    title: localize(5624, null),
    icon: Codicon.radioTower,
    toggled: ContextKeyExpr.equals(TUNNEL_HOST_SHARING_KEY, true)
  },
  group: "navigation",
  order: 90,
  when: ContextKeyExpr.and(ChatContextKeys.enabled, IsSessionsWindowContext, IsAuxiliaryWindowContext.toNegated())
});

var SessionsTunnelHostTitlebarContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.sessionsTunnelHostTitlebar";
  }
  constructor(tunnelHostService, actionViewItemService) {
    super();
    const viewItemFactory = (action, _options, instantiationService) => {
      return instantiationService.createInstance(ToggleRemoteConnectionsActionViewItem, action);
    };
    this._register(actionViewItemService.register(Menus.TitleBarRightLayout, TOGGLE_SHARING_ID, viewItemFactory, tunnelHostService.onDidChangeStatus));
  }
};

SessionsTunnelHostTitlebarContribution = __decorateClass([
  __decorateParam(0, ITunnelHostService),
  __decorateParam(1, IActionViewItemService)
], SessionsTunnelHostTitlebarContribution);

registerWorkbenchContribution2(SessionsTunnelHostTitlebarContribution.ID, SessionsTunnelHostTitlebarContribution, WorkbenchPhase.BlockRestore);
export { SessionsTunnelHostTitlebarContribution };
