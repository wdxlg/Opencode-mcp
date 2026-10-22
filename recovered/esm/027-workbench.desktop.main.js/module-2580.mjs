// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/experiments/agentSessionProjectionActions.ts
import { Action2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CHAT_CATEGORY } from "./module-1476.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { inAgentSessionProjection } from "./module-2577.mjs";
import { IAgentSessionProjectionService } from "./module-2578.mjs";
import { IAgentSessionsService } from "./module-1464.mjs";
import { isMarshalledAgentSessionContext } from "./module-1463.mjs";
import { ToggleTitleBarConfigAction } from "./module-2579.mjs";
import { IsCompactTitleBarContext } from "./module-0949.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/experiments/agentSessionProjectionActions.ts
var EnterAgentSessionProjectionAction = class _EnterAgentSessionProjectionAction extends Action2 {
  static {
    this.ID = "agentSession.enterAgentSessionProjection";
  }
  constructor() {
    super({
      id: _EnterAgentSessionProjectionAction.ID,
      title: localize2(9187, "Enter Agent Session Projection"),
      category: CHAT_CATEGORY,
      f1: false,
      precondition: ContextKeyExpr.and(
        ChatContextKeys.enabled,
        ContextKeyExpr.has(`config.${"chat.agentSessionProjection.enabled" /* AgentSessionProjectionEnabled */}`),
        inAgentSessionProjection.negate()
      )
    });
  }
  async run(accessor, context2) {
    const projectionService = accessor.get(IAgentSessionProjectionService);
    const agentSessionsService = accessor.get(IAgentSessionsService);
    let session;
    if (context2) {
      if (isMarshalledAgentSessionContext(context2)) {
        session = agentSessionsService.getSession(context2.session.resource);
      } else {
        session = context2;
      }
    }
    if (session) {
      await projectionService.enterProjection(session);
    }
  }
};

var ExitAgentSessionProjectionAction = class _ExitAgentSessionProjectionAction extends Action2 {
  static {
    this.ID = "agentSession.exitAgentSessionProjection";
  }
  constructor() {
    super({
      id: _ExitAgentSessionProjectionAction.ID,
      title: localize2(9188, "Exit Agent Session Projection"),
      category: CHAT_CATEGORY,
      f1: true,
      precondition: ContextKeyExpr.and(
        ChatContextKeys.enabled,
        inAgentSessionProjection
      ),
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        primary: 9 /* Escape */,
        when: inAgentSessionProjection
      }
    });
  }
  async run(accessor) {
    const projectionService = accessor.get(IAgentSessionProjectionService);
    await projectionService.exitProjection();
  }
};

var ToggleUnifiedAgentsBarAction = class extends ToggleTitleBarConfigAction {
  constructor() {
    super(
      "chat.unifiedAgentsBar.enabled" /* UnifiedAgentsBar */,
      localize(9189, null),
      localize(9190, null),
      7,
      ContextKeyExpr.and(
        ChatContextKeys.enabled,
        IsCompactTitleBarContext.negate(),
        ChatContextKeys.supported,
        ContextKeyExpr.has("config.window.commandCenter")
      )
    );
  }
};
export { EnterAgentSessionProjectionAction, ExitAgentSessionProjectionAction, ToggleUnifiedAgentsBarAction };
