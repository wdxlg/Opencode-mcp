// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/externalSessionsFilterMenu.ts
import { localize2 } from "./module-0001.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { Action2, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/externalSessionsFilterMenu.ts
var externalSessionOptions = [
  { mode: "none" /* None */, title: localize2(9252, "None") },
  { mode: "recent" /* Recent */, title: localize2(9253, "Recent") },
  { mode: "last24Hours" /* Last24Hours */, title: localize2(9249, "Last 24 Hours") },
  { mode: "last7Days" /* Last7Days */, title: localize2(9251, "Last 7 Days") },
  { mode: "last30Days" /* Last30Days */, title: localize2(9250, "Last 30 Days") }
];

function registerExternalSessionsFilterMenu(parentMenuId, submenuId, group2) {
  const disposables = new DisposableStore();
  disposables.add(MenuRegistry.appendMenuItem(parentMenuId, {
    submenu: submenuId,
    title: localize2(9248, "External"),
    group: group2,
    order: 0
  }));
  for (let index2 = 0; index2 < externalSessionOptions.length; index2++) {
    const option2 = externalSessionOptions[index2];
    disposables.add(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: `agentSessions.filter.external.${option2.mode}.${submenuId.id.toLowerCase()}`,
          title: option2.title,
          toggled: ContextKeyExpr.equals(`config.${"chat.agentSessions.showExternal" /* ShowExternalAgentSessions */}`, option2.mode),
          menu: {
            id: submenuId,
            group: "1_modes",
            order: index2
          }
        });
      }
      async run(accessor) {
        await accessor.get(IConfigurationService).updateValue(
          "chat.agentSessions.showExternal" /* ShowExternalAgentSessions */,
          option2.mode,
          2 /* USER */
        );
      }
    }));
  }
  return disposables;
}
export { registerExternalSessionsFilterMenu, externalSessionOptions };
