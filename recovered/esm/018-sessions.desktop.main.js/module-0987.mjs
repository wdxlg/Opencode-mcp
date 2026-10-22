// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/service/promptsService.ts
import { createDecorator } from "./module-0077.mjs";
import { ExtensionIdentifier } from "./module-0688.mjs";
import { isEqual2 } from "./module-0034.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/service/promptsService.ts
function newInstructionsCollectionEvent() {
  return { applyingInstructionsCount: 0, referencedInstructionsCount: 0, agentInstructionsCount: 0, listedInstructionsCount: 0, totalInstructionsCount: 0, claudeRulesCount: 0, claudeMdCount: 0, claudeAgentsCount: 0 };
}

function newInstructionsCollectionDebugInfo() {
  return { debugDetails: [], durationInMillis: 0 };
}

var CUSTOM_AGENT_PROVIDER_ACTIVATION_EVENT = "onCustomAgentProvider";

var INSTRUCTIONS_PROVIDER_ACTIVATION_EVENT = "onInstructionsProvider";

var PROMPT_FILE_PROVIDER_ACTIVATION_EVENT = "onPromptFileProvider";

var SKILL_PROVIDER_ACTIVATION_EVENT = "onSkillProvider";

function matchesSessionType(sessionTypes, currentSessionType) {
  return sessionTypes === void 0 || currentSessionType === void 0 || sessionTypes.includes(currentSessionType);
}

var IPromptsService = createDecorator("IPromptsService");

function isUserToggleableCustomization(type, storage) {
  return type === "skill" /* skill */ && storage === "builtin" /* builtIn */;
}

var IAgentSource;

((IAgentSource5) => {
  function fromPromptPath(promptPath) {
    if (promptPath.storage === "extension" /* extension */) {
      return { storage: "extension" /* extension */, extensionId: promptPath.extension.identifier };
    } else if (promptPath.storage === "plugin" /* plugin */) {
      return { storage: "plugin" /* plugin */, pluginUri: promptPath.pluginUri };
    } else {
      return { storage: promptPath.storage };
    }
  }
  IAgentSource5.fromPromptPath = fromPromptPath;
  function isEquals(a, b) {
    if (a === b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    if (a.storage !== b.storage) {
      return false;
    }
    if (a.storage === "extension" /* extension */ && b.storage === "extension" /* extension */) {
      return ExtensionIdentifier.equals(a.extensionId, b.extensionId);
    } else if (a.storage === "plugin" /* plugin */ && b.storage === "plugin" /* plugin */) {
      return isEqual2(a.pluginUri, b.pluginUri);
    }
    return true;
  }
  IAgentSource5.isEquals = isEquals;
})(IAgentSource || (IAgentSource = {}));

function isCustomAgentVisibility(obj) {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }
  const v2 = obj;
  return typeof v2.userInvocable === "boolean" && typeof v2.agentInvocable === "boolean";
}
export { newInstructionsCollectionEvent, newInstructionsCollectionDebugInfo, matchesSessionType, isUserToggleableCustomization, isCustomAgentVisibility, CUSTOM_AGENT_PROVIDER_ACTIVATION_EVENT, INSTRUCTIONS_PROVIDER_ACTIVATION_EVENT, PROMPT_FILE_PROVIDER_ACTIVATION_EVENT, SKILL_PROVIDER_ACTIVATION_EVENT, IPromptsService, IAgentSource };
