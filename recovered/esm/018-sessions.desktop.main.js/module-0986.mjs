// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/promptTypes.ts
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/promptTypes.ts
var PROMPT_DOCUMENTATION_URL = "https://aka.ms/vscode-ghcp-prompt-snippets";

var INSTRUCTIONS_DOCUMENTATION_URL = "https://aka.ms/vscode-ghcp-custom-instructions";

var AGENT_DOCUMENTATION_URL = "https://aka.ms/vscode-ghcp-custom-chat-modes";

var SKILL_DOCUMENTATION_URL = "https://aka.ms/vscode-agent-skills";

var HOOK_DOCUMENTATION_URL = "https://aka.ms/vscode-chat-hooks";

var PROMPT_LANGUAGE_ID = "prompt";

var INSTRUCTIONS_LANGUAGE_ID = "instructions";

var AGENT_LANGUAGE_ID = "chatagent";

var SKILL_LANGUAGE_ID = "skill";

var ALL_PROMPTS_LANGUAGE_SELECTOR = [PROMPT_LANGUAGE_ID, INSTRUCTIONS_LANGUAGE_ID, AGENT_LANGUAGE_ID, SKILL_LANGUAGE_ID];

var AGENT_DEBUG_LOG_FILE_LOGGING_ENABLED_SETTING = "github.copilot.chat.agentDebugLog.fileLogging.enabled";

var AgentHostAgentDebugLogEnabledSettingId = "chat.agentHost.agentDebugLog.enabled";

var AgentHostAgentDebugLogMaxEventsSettingId = "chat.agentHost.agentDebugLog.maxEventsInMemory";

var TROUBLESHOOT_COMMAND_NAME = "troubleshoot";

var COPILOT_SKILL_URI_SCHEME = "copilot-skill";

var TROUBLESHOOT_SKILL_PATH = "troubleshoot/SKILL.md";

function getLanguageIdForPromptsType(type) {
  switch (type) {
    case "prompt" /* prompt */:
      return PROMPT_LANGUAGE_ID;
    case "instructions" /* instructions */:
      return INSTRUCTIONS_LANGUAGE_ID;
    case "agent" /* agent */:
      return AGENT_LANGUAGE_ID;
    case "skill" /* skill */:
      return SKILL_LANGUAGE_ID;
    case "hook" /* hook */:
      return "jsonc";
    default:
      throw new Error(`Unknown prompt type: ${type}`);
  }
}

function getPromptsTypeForLanguageId(languageId) {
  switch (languageId) {
    case PROMPT_LANGUAGE_ID:
      return "prompt" /* prompt */;
    case INSTRUCTIONS_LANGUAGE_ID:
      return "instructions" /* instructions */;
    case AGENT_LANGUAGE_ID:
      return "agent" /* agent */;
    case SKILL_LANGUAGE_ID:
      return "skill" /* skill */;
    // Note: hook uses 'jsonc' language ID which is shared, so we don't map it here
    default:
      return void 0;
  }
}

var PromptsType = /* @__PURE__ */ ((PromptsType3) => {
  PromptsType3["instructions"] = "instructions";
  PromptsType3["prompt"] = "prompt";
  PromptsType3["agent"] = "agent";
  PromptsType3["skill"] = "skill";
  PromptsType3["hook"] = "hook";
  return PromptsType3;
})(PromptsType || {});

function isValidPromptType(type) {
  return Object.values(PromptsType).includes(type);
}

function getSourceDescription(source) {
  switch (source) {
    case "agents-workspace" /* AgentsWorkspace */:
      return localize(13377, null);
    case "agents-personal" /* AgentsPersonal */:
      return localize(13376, null);
    case "github-workspace" /* GitHubWorkspace */:
      return localize(13384, null);
    case "copilot-personal" /* CopilotPersonal */:
      return localize(13383, null);
    case "claude-workspace" /* ClaudeWorkspace */:
      return localize(13379, null);
    case "claude-workspace-local" /* ClaudeWorkspaceLocal */:
      return localize(13380, null);
    case "claude-personal" /* ClaudePersonal */:
      return localize(13378, null);
    case "user-data" /* UserData */:
      return localize(13385, null);
    case "config-workspace" /* ConfigWorkspace */:
      return localize(13382, null);
    case "config-personal" /* ConfigPersonal */:
      return localize(13381, null);
    default:
      return void 0;
  }
}
export { getLanguageIdForPromptsType, getPromptsTypeForLanguageId, isValidPromptType, getSourceDescription, PROMPT_DOCUMENTATION_URL, INSTRUCTIONS_DOCUMENTATION_URL, AGENT_DOCUMENTATION_URL, SKILL_DOCUMENTATION_URL, HOOK_DOCUMENTATION_URL, PROMPT_LANGUAGE_ID, INSTRUCTIONS_LANGUAGE_ID, AGENT_LANGUAGE_ID, SKILL_LANGUAGE_ID, ALL_PROMPTS_LANGUAGE_SELECTOR, AGENT_DEBUG_LOG_FILE_LOGGING_ENABLED_SETTING, AgentHostAgentDebugLogEnabledSettingId, AgentHostAgentDebugLogMaxEventsSettingId, TROUBLESHOOT_COMMAND_NAME, COPILOT_SKILL_URI_SCHEME, TROUBLESHOOT_SKILL_PATH, PromptsType };
