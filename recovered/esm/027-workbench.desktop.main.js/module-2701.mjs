// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/aiCustomizationWorkspaceService.ts
import { AICustomizationManagementSection, IAICustomizationWorkspaceService } from "./module-0995.mjs";
import { constObservable } from "./module-0061.mjs";
import { observableFromEventOpts } from "./module-0057.mjs";
import { derived } from "./module-0054.mjs";
import { GENERATE_AGENT_COMMAND_ID, GENERATE_HOOK_COMMAND_ID, GENERATE_ON_DEMAND_INSTRUCTIONS_COMMAND_ID, GENERATE_PROMPT_COMMAND_ID, GENERATE_SKILL_COMMAND_ID } from "./module-1476.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IPromptsService } from "./module-0986.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/aiCustomizationWorkspaceService.ts
var AICustomizationWorkspaceService = class {
  constructor(workspaceContextService, commandService, promptsService) {
    this.workspaceContextService = workspaceContextService;
    this.commandService = commandService;
    this.promptsService = promptsService;
    this.managementSections = [
      AICustomizationManagementSection.Bridge,
      AICustomizationManagementSection.SkillCenter,
      AICustomizationManagementSection.Agents,
      AICustomizationManagementSection.Skills,
      AICustomizationManagementSection.Instructions,
      AICustomizationManagementSection.Prompts,
      AICustomizationManagementSection.Hooks,
      AICustomizationManagementSection.McpServers,
      AICustomizationManagementSection.Plugins,
      AICustomizationManagementSection.Models,
      AICustomizationManagementSection.Codex,
      AICustomizationManagementSection.MultiModel,
      AICustomizationManagementSection.Tools,
      AICustomizationManagementSection.HarnessSettings
    ];
    this.isSessionsWindow = false;
    this.welcomePageFeatures = {
      showGettingStartedBanner: true
    };
    this.hasOverrideProjectRoot = constObservable(false);
    const workspaceFolders = observableFromEventOpts(
      { owner: this },
      this.workspaceContextService.onDidChangeWorkspaceFolders,
      () => this.workspaceContextService.getWorkspace().folders
    );
    this.activeProjectRoot = derived((reader) => {
      const folders = workspaceFolders.read(reader);
      return folders[0]?.uri;
    });
  }
  getActiveProjectRoot() {
    const folders = this.workspaceContextService.getWorkspace().folders;
    return folders[0]?.uri;
  }
  setOverrideProjectRoot(_root) {
  }
  clearOverrideProjectRoot() {
  }
  async commitFiles(_projectRoot, _fileUris) {
  }
  async deleteFiles(_projectRoot, _fileUris) {
  }
  async generateCustomization(type) {
    const commandIds = {
      ["agent" /* agent */]: GENERATE_AGENT_COMMAND_ID,
      ["skill" /* skill */]: GENERATE_SKILL_COMMAND_ID,
      ["instructions" /* instructions */]: GENERATE_ON_DEMAND_INSTRUCTIONS_COMMAND_ID,
      ["prompt" /* prompt */]: GENERATE_PROMPT_COMMAND_ID,
      ["hook" /* hook */]: GENERATE_HOOK_COMMAND_ID
    };
    const commandId = commandIds[type];
    if (commandId) {
      await this.commandService.executeCommand(commandId);
    }
  }
  async getFilteredPromptSlashCommands(token) {
    return this.promptsService.getPromptSlashCommands(token);
  }
  static {
    this._emptyIntegrations = /* @__PURE__ */ new Map();
  }
  getSkillUIIntegrations() {
    return AICustomizationWorkspaceService._emptyIntegrations;
  }
};

AICustomizationWorkspaceService = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, ICommandService),
  __decorateParam(2, IPromptsService)
], AICustomizationWorkspaceService);

registerSingleton(IAICustomizationWorkspaceService, AICustomizationWorkspaceService, 1 /* Delayed */);
export { AICustomizationWorkspaceService };
