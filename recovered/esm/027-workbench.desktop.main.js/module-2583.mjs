// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/experiments/unifiedQuickAccessActions.ts
import { DEFAULT_UNIFIED_QUICK_ACCESS_TABS, UnifiedQuickAccess } from "./module-2582.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/experiments/unifiedQuickAccessActions.ts
var unifiedQuickAccessInstance;

function getUnifiedQuickAccess(instantiationService) {
  if (!unifiedQuickAccessInstance) {
    unifiedQuickAccessInstance = instantiationService.createInstance(UnifiedQuickAccess, DEFAULT_UNIFIED_QUICK_ACCESS_TABS);
  }
  return unifiedQuickAccessInstance;
}

var UNIFIED_QUICK_ACCESS_ACTION_ID = "workbench.action.unifiedQuickAccess";

var ShowUnifiedQuickAccessAction = class _ShowUnifiedQuickAccessAction extends Action2 {
  static {
    this.ID = UNIFIED_QUICK_ACCESS_ACTION_ID;
  }
  constructor() {
    super({
      id: _ShowUnifiedQuickAccessAction.ID,
      title: localize2(9244, "Show Agent Quick Access"),
      f1: true,
      precondition: ContextKeyExpr.and(
        ChatContextKeys.enabled,
        ContextKeyExpr.has(`config.${"chat.unifiedAgentsBar.enabled" /* UnifiedAgentsBar */}`)
      )
    });
  }
  run(accessor, initialTabId) {
    const instantiationService = accessor.get(IInstantiationService);
    const unifiedQuickAccess = getUnifiedQuickAccess(instantiationService);
    unifiedQuickAccess.show(initialTabId);
  }
};

var ShowAgentSessionsQuickAccessAction = class _ShowAgentSessionsQuickAccessAction extends Action2 {
  static {
    this.ID = "workbench.action.showAgentSessionsQuickAccess";
  }
  constructor() {
    super({
      id: _ShowAgentSessionsQuickAccessAction.ID,
      title: localize2(9245, "Show Agent Sessions"),
      f1: true,
      precondition: ContextKeyExpr.and(
        ChatContextKeys.enabled,
        ContextKeyExpr.has(`config.${"chat.unifiedAgentsBar.enabled" /* UnifiedAgentsBar */}`)
      )
    });
  }
  run(accessor) {
    const instantiationService = accessor.get(IInstantiationService);
    const unifiedQuickAccess = getUnifiedQuickAccess(instantiationService);
    unifiedQuickAccess.show("agentSessions");
  }
};

var ShowCommandsQuickAccessAction = class _ShowCommandsQuickAccessAction extends Action2 {
  static {
    this.ID = "workbench.action.showCommandsQuickAccess";
  }
  constructor() {
    super({
      id: _ShowCommandsQuickAccessAction.ID,
      title: localize2(9246, "Show Commands (Unified)"),
      f1: true,
      precondition: ContextKeyExpr.and(
        ChatContextKeys.enabled,
        ContextKeyExpr.has(`config.${"chat.unifiedAgentsBar.enabled" /* UnifiedAgentsBar */}`)
      )
    });
  }
  run(accessor) {
    const instantiationService = accessor.get(IInstantiationService);
    const unifiedQuickAccess = getUnifiedQuickAccess(instantiationService);
    unifiedQuickAccess.show("commands");
  }
};

var ShowFilesQuickAccessAction = class _ShowFilesQuickAccessAction extends Action2 {
  static {
    this.ID = "workbench.action.showFilesQuickAccess";
  }
  constructor() {
    super({
      id: _ShowFilesQuickAccessAction.ID,
      title: localize2(9247, "Show Files (Unified)"),
      f1: true,
      precondition: ContextKeyExpr.and(
        ChatContextKeys.enabled,
        ContextKeyExpr.has(`config.${"chat.unifiedAgentsBar.enabled" /* UnifiedAgentsBar */}`)
      )
    });
  }
  run(accessor) {
    const instantiationService = accessor.get(IInstantiationService);
    const unifiedQuickAccess = getUnifiedQuickAccess(instantiationService);
    unifiedQuickAccess.show("files");
  }
};

registerAction2(ShowUnifiedQuickAccessAction);

registerAction2(ShowAgentSessionsQuickAccessAction);

registerAction2(ShowCommandsQuickAccessAction);

registerAction2(ShowFilesQuickAccessAction);
export { getUnifiedQuickAccess, unifiedQuickAccessInstance, UNIFIED_QUICK_ACCESS_ACTION_ID, ShowUnifiedQuickAccessAction, ShowAgentSessionsQuickAccessAction, ShowCommandsQuickAccessAction, ShowFilesQuickAccessAction };
