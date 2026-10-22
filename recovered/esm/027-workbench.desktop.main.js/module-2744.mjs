// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentPluginCommands.ts
import { IPluginInstallService } from "./module-2570.mjs";
import { INotificationService } from "./module-0336.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { getErrorMessage } from "./module-0004.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { ForceUpdateAgentPluginsCommandId, InstalledAgentPluginsViewId, UpdateAgentPluginsCommandId, UpdatingAgentPluginsContext } from "./module-0981.mjs";
import { Codicon } from "./module-0085.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";


// src/vs/workbench/contrib/chat/browser/agentPluginCommands.ts
var updatingPluginsContextKey;

var updatePluginsPromise;

function updatePlugins(accessor, force) {
  if (updatePluginsPromise) {
    return updatePluginsPromise;
  }
  const pluginInstallService = accessor.get(IPluginInstallService);
  const notificationService = accessor.get(INotificationService);
  updatingPluginsContextKey?.set(true);
  updatePluginsPromise = (async () => {
    try {
      const result = await pluginInstallService.updateAllPlugins({ force }, CancellationToken.None);
      if (result.updatedNames.length === 0 && result.failedNames.length === 0) {
        notificationService.info(localize(8895, null));
      }
    } catch (error) {
      notificationService.error(localize(8894, null, getErrorMessage(error)));
      throw error;
    } finally {
      updatePluginsPromise = void 0;
      updatingPluginsContextKey?.set(false);
    }
  })();
  return updatePluginsPromise;
}

var CheckForPluginUpdatesCommand = class extends Action2 {
  constructor() {
    super({
      id: UpdateAgentPluginsCommandId,
      title: localize2(8892, "Update Plugins"),
      category: localize2(8896, "Chat"),
      icon: Codicon.refresh,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, UpdatingAgentPluginsContext.negate()),
      f1: true,
      menu: [{
        id: MenuId.ViewTitle,
        when: ContextKeyExpr.and(
          ContextKeyExpr.equals("view", InstalledAgentPluginsViewId),
          ChatContextKeys.Setup.hidden.negate(),
          ChatContextKeys.Setup.disabledInWorkspace.negate()
        ),
        group: "navigation",
        order: 1,
        alt: {
          id: ForceUpdateAgentPluginsCommandId,
          title: localize2(8893, "Update Plugins (Force)"),
          icon: Codicon.refresh
        }
      }]
    });
  }
  async run(accessor) {
    await updatePlugins(accessor, false);
  }
};

var ForceUpdatePluginsCommand = class extends Action2 {
  constructor() {
    super({
      id: ForceUpdateAgentPluginsCommandId,
      title: localize2(8893, "Update Plugins (Force)"),
      category: localize2(8896, "Chat"),
      icon: Codicon.refresh,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, UpdatingAgentPluginsContext.negate()),
      f1: true
    });
  }
  async run(accessor) {
    await updatePlugins(accessor, true);
  }
};

var AgentPluginCommandsContribution = class {
  static {
    this.ID = "workbench.chat.agentPluginCommands";
  }
  constructor(contextKeyService) {
    updatingPluginsContextKey = UpdatingAgentPluginsContext.bindTo(contextKeyService);
    registerAction2(CheckForPluginUpdatesCommand);
    registerAction2(ForceUpdatePluginsCommand);
  }
};

AgentPluginCommandsContribution = __decorateClass([
  __decorateParam(0, IContextKeyService)
], AgentPluginCommandsContribution);
export { updatePlugins, updatingPluginsContextKey, updatePluginsPromise, CheckForPluginUpdatesCommand, ForceUpdatePluginsCommand, AgentPluginCommandsContribution };
