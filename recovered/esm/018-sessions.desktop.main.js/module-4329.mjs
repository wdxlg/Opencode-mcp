// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/agentHost/browser/agentHostSessionBranchActions.ts
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { SessionItemContextMenuId, SessionItemHasBranchNameContext } from "./module-3523.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { SessionProviderIdContext } from "./module-1770.mjs";
import { ANY_AGENT_HOST_PROVIDER_RE } from "./module-1764.mjs";
import { IClipboardService } from "./module-0487.mjs";


// src/vs/sessions/contrib/providers/agentHost/browser/agentHostSessionBranchActions.ts
registerAction2(class CopySessionBranchNameAction extends Action2 {
  constructor() {
    super({
      id: "sessionsViewPane.agentHost.copySessionBranchName",
      title: localize2(4928, "Copy Session Branch Name"),
      menu: [{
        id: SessionItemContextMenuId,
        group: "2_open",
        order: 3,
        when: ContextKeyExpr.and(
          ContextKeyExpr.regex(SessionProviderIdContext.key, ANY_AGENT_HOST_PROVIDER_RE),
          SessionItemHasBranchNameContext
        )
      }]
    });
  }
  async run(accessor, context2) {
    const session = Array.isArray(context2) ? context2[0] : context2;
    const branchName = session?.workspace.get()?.folders[0]?.gitRepository?.branchName?.trim();
    if (!branchName) {
      return;
    }
    await accessor.get(IClipboardService).writeText(branchName);
  }
});
export {};
