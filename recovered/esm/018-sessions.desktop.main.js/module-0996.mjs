// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/aiCustomizationWorkspaceService.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/common/aiCustomizationWorkspaceService.ts
var IAICustomizationWorkspaceService = createDecorator("aiCustomizationWorkspaceService");

var AICustomizationSources;

((AICustomizationSources2) => {
  AICustomizationSources2.local = "local";
  AICustomizationSources2.user = "user";
  AICustomizationSources2.extension = "extension";
  AICustomizationSources2.plugin = "plugin";
  AICustomizationSources2.builtin = "builtin";
  AICustomizationSources2.all = [AICustomizationSources2.local, AICustomizationSources2.user, AICustomizationSources2.extension, AICustomizationSources2.plugin, AICustomizationSources2.builtin];
})(AICustomizationSources || (AICustomizationSources = {}));

var BUILTIN_STORAGE = AICustomizationSources.builtin;

var AICustomizationManagementSection = {
  Agents: "agents",
  Skills: "skills",
  Instructions: "instructions",
  Prompts: "prompts",
  Hooks: "hooks",
  Automations: "automations",
  McpServers: "mcpServers",
  Bridge: "bridge",
  SkillCenter: "skillCenter",
  Plugins: "plugins",
  Models: "models",
  Codex: "codex",
  MultiModel: "multiModel",
  Tools: "tools",
  HarnessSettings: "harnessSettings"
};

var AICustomizationManagementCommands = {
  OpenEditor: "aiCustomization.openManagementEditor",
  OpenMarketplace: "aiCustomization.openMarketplace",
  CreateNewAgent: "aiCustomization.createNewAgent",
  CreateNewSkill: "aiCustomization.createNewSkill",
  CreateNewInstructions: "aiCustomization.createNewInstructions",
  CreateNewPrompt: "aiCustomization.createNewPrompt",
  GenerateDebugReport: "aiCustomization.generateDebugReport",
  DismissMigrationHint: "aiCustomization.dismissMigrationHint"
};

function getCustomizationMigrationHintDismissedStorageKey(sessionType) {
  return `chat.customizationMigrationHint.dismissed.${sessionType}`;
}
export { getCustomizationMigrationHintDismissedStorageKey, IAICustomizationWorkspaceService, AICustomizationSources, BUILTIN_STORAGE, AICustomizationManagementSection, AICustomizationManagementCommands };
