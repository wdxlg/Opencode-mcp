// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptSyntax/chatModeActions.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { ICommandService } from "./module-0087.mjs";
import { AICustomizationManagementCommands2 } from "./module-1472.mjs";
import { AICustomizationManagementSection } from "./module-0995.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CHAT_CATEGORY } from "./module-1476.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/chat/browser/promptSyntax/chatModeActions.ts
var ConfigAgentActionImpl = class extends Action2 {
  async run(accessor) {
    // OpenCode: 「配置自定义智能体」改为打开模型提供商管理
    await accessor.get(ICommandService).executeCommand("opencode.manageProviders");
  }
};

var CONFIGURE_AGENTS_ACTION_ID = "workbench.action.chat.configure.customagents";

function createConfigureAgentsActionConfig(disabled) {
  const agentModeDisabledByPolicy = ChatContextKeys.Modes.agentModeDisabledByPolicy;
  const base = {
    id: disabled ? CONFIGURE_AGENTS_ACTION_ID + ".disabled" : CONFIGURE_AGENTS_ACTION_ID,
    title: localize2(11431, "Configure Custom Agents..."),
    category: CHAT_CATEGORY,
    f1: !disabled,
    precondition: disabled ? ContextKeyExpr.false() : ContextKeyExpr.and(ChatContextKeys.enabled, agentModeDisabledByPolicy.negate()),
    menu: {
      id: MenuId.ChatModePicker,
      when: ContextKeyExpr.and(ChatContextKeys.enabled, disabled ? agentModeDisabledByPolicy : agentModeDisabledByPolicy.negate())
    }
  };
  return disabled ? { ...base, icon: Codicon.lock, tooltip: localize(11432, null) } : base;
}

var ConfigureAgentsAction = class extends ConfigAgentActionImpl {
  constructor() {
    super(createConfigureAgentsActionConfig(false));
  }
};

var ConfigureAgentsActionDisabled = class extends ConfigAgentActionImpl {
  constructor() {
    super(createConfigureAgentsActionConfig(true));
  }
};

function registerAgentActions() {
  registerAction2(ConfigureAgentsAction);
  registerAction2(ConfigureAgentsActionDisabled);
}
export { createConfigureAgentsActionConfig, registerAgentActions, ConfigAgentActionImpl, CONFIGURE_AGENTS_ACTION_ID, ConfigureAgentsAction, ConfigureAgentsActionDisabled };
