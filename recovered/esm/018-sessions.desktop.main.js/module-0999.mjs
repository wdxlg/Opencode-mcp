// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/config/config.ts
import { getPromptFileDefaultLocations } from "./module-0997.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/config/config.ts
var PromptsConfig;

((PromptsConfig2) => {
  PromptsConfig2.PROMPT_LOCATIONS_KEY = "chat.promptFilesLocations";
  PromptsConfig2.INSTRUCTIONS_LOCATION_KEY = "chat.instructionsFilesLocations";
  PromptsConfig2.MODE_LOCATION_KEY = "chat.modeFilesLocations";
  PromptsConfig2.AGENTS_LOCATION_KEY = "chat.agentFilesLocations";
  PromptsConfig2.SKILLS_LOCATION_KEY = "chat.agentSkillsLocations";
  PromptsConfig2.HOOKS_LOCATION_KEY = "chat.hookFilesLocations";
  PromptsConfig2.PROMPT_FILES_SUGGEST_KEY = "chat.promptFilesRecommendations";
  PromptsConfig2.USE_COPILOT_INSTRUCTION_FILES = "github.copilot.chat.codeGeneration.useInstructionFiles";
  PromptsConfig2.USE_AGENT_MD = "chat.useAgentsMdFile";
  PromptsConfig2.USE_NESTED_AGENT_MD = "chat.useNestedAgentsMdFiles";
  PromptsConfig2.USE_CLAUDE_MD = "chat.useClaudeMdFile";
  PromptsConfig2.USE_AGENT_SKILLS = "chat.useAgentSkills";
  PromptsConfig2.USE_CHAT_HOOKS = "chat.useHooks";
  PromptsConfig2.USE_CLAUDE_HOOKS = "chat.useClaudeHooks";
  PromptsConfig2.USE_SKILL_ADHERENCE_PROMPT = "chat.experimental.useSkillAdherencePrompt";
  PromptsConfig2.INCLUDE_APPLYING_INSTRUCTIONS = "chat.includeApplyingInstructions";
  PromptsConfig2.INCLUDE_REFERENCED_INSTRUCTIONS = "chat.includeReferencedInstructions";
  PromptsConfig2.USE_CUSTOMIZATIONS_IN_PARENT_REPOS = "chat.useCustomizationsInParentRepositories";
  function getLocationsValue(configService, type) {
    const key3 = getPromptFileLocationsConfigKey(type);
    const configValue = configService.getValue(key3);
    if (configValue === void 0 || configValue === null || Array.isArray(configValue)) {
      return void 0;
    }
    if (typeof configValue === "object") {
      const paths = {};
      for (const [path, value2] of Object.entries(configValue)) {
        const cleanPath = path.trim();
        const booleanValue = asBoolean(value2);
        if (booleanValue !== void 0 && cleanPath) {
          paths[cleanPath] = booleanValue;
        }
      }
      return paths;
    }
    return void 0;
  }
  PromptsConfig2.getLocationsValue = getLocationsValue;
  function promptSourceFolders(configService, type) {
    const value2 = getLocationsValue(configService, type);
    const defaultSourceFolders = getPromptFileDefaultLocations(type);
    if (value2 && typeof value2 === "object") {
      const paths = [];
      const defaultFolderPathsSet = new Set(defaultSourceFolders.map((f) => f.path));
      for (const defaultFolder of defaultSourceFolders) {
        if (value2[defaultFolder.path] !== false) {
          paths.push(defaultFolder);
        }
      }
      for (const [path, enabledValue] of Object.entries(value2)) {
        if (enabledValue === false || defaultFolderPathsSet.has(path)) {
          continue;
        }
        const storage = isTildePath(path) ? "user" /* user */ : "local" /* local */;
        paths.push({ path, source: storage === "local" /* local */ ? "config-workspace" /* ConfigWorkspace */ : "config-personal" /* ConfigPersonal */, storage });
      }
      return paths;
    }
    return [];
  }
  PromptsConfig2.promptSourceFolders = promptSourceFolders;
  function getPromptFilesRecommendationsValue(configService, resource) {
    const configValue = configService.getValue(PromptsConfig2.PROMPT_FILES_SUGGEST_KEY, { resource });
    if (!configValue || typeof configValue !== "object" || Array.isArray(configValue)) {
      return void 0;
    }
    const suggestions = {};
    for (const [promptName, value2] of Object.entries(configValue)) {
      const cleanPromptName = promptName.trim();
      if (!cleanPromptName) {
        continue;
      }
      if (typeof value2 === "boolean") {
        suggestions[cleanPromptName] = value2;
        continue;
      }
      if (typeof value2 === "string") {
        const cleanValue = value2.trim();
        if (cleanValue) {
          suggestions[cleanPromptName] = cleanValue;
        }
        continue;
      }
      const booleanValue = asBoolean(value2);
      if (booleanValue !== void 0) {
        suggestions[cleanPromptName] = booleanValue;
      }
    }
    return Object.keys(suggestions).length > 0 ? suggestions : void 0;
  }
  PromptsConfig2.getPromptFilesRecommendationsValue = getPromptFilesRecommendationsValue;
})(PromptsConfig || (PromptsConfig = {}));

function getPromptFileLocationsConfigKey(type) {
  switch (type) {
    case "instructions" /* instructions */:
      return PromptsConfig.INSTRUCTIONS_LOCATION_KEY;
    case "prompt" /* prompt */:
      return PromptsConfig.PROMPT_LOCATIONS_KEY;
    case "agent" /* agent */:
      return PromptsConfig.AGENTS_LOCATION_KEY;
    case "skill" /* skill */:
      return PromptsConfig.SKILLS_LOCATION_KEY;
    case "hook" /* hook */:
      return PromptsConfig.HOOKS_LOCATION_KEY;
    default:
      throw new Error("Unknown prompt type");
  }
}

function asBoolean(value2) {
  if (typeof value2 === "boolean") {
    return value2;
  }
  if (typeof value2 === "string") {
    const cleanValue = value2.trim().toLowerCase();
    if (cleanValue === "true") {
      return true;
    }
    if (cleanValue === "false") {
      return false;
    }
    return void 0;
  }
  return void 0;
}

function isTildePath(path) {
  return path.startsWith("~/");
}
export { getPromptFileLocationsConfigKey, asBoolean, isTildePath, PromptsConfig };
