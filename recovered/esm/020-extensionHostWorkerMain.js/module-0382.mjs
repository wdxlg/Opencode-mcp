// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/service/promptsService.ts
import { createDecorator } from "./module-0038.mjs";
import { ExtensionIdentifier } from "./module-0040.mjs";
import { isEqual } from "./module-0032.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/service/promptsService.ts
function newInstructionsCollectionEvent() {
  return { applyingInstructionsCount: 0, referencedInstructionsCount: 0, agentInstructionsCount: 0, listedInstructionsCount: 0, totalInstructionsCount: 0, claudeRulesCount: 0, claudeMdCount: 0, claudeAgentsCount: 0 };
}

function newInstructionsCollectionDebugInfo() {
  return { debugDetails: [], durationInMillis: 0 };
}

function matchesSessionType(sessionTypes, currentSessionType) {
  return sessionTypes === void 0 || currentSessionType === void 0 || sessionTypes.includes(currentSessionType);
}

var IPromptsService = createDecorator("IPromptsService");

var IAgentSource;

((IAgentSource3) => {
  function fromPromptPath(promptPath) {
    if (promptPath.storage === "extension" /* extension */) {
      return { storage: "extension" /* extension */, extensionId: promptPath.extension.identifier };
    } else if (promptPath.storage === "plugin" /* plugin */) {
      return { storage: "plugin" /* plugin */, pluginUri: promptPath.pluginUri };
    } else {
      return { storage: promptPath.storage };
    }
  }
  IAgentSource3.fromPromptPath = fromPromptPath;
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
      return isEqual(a.pluginUri, b.pluginUri);
    }
    return true;
  }
  IAgentSource3.isEquals = isEquals;
})(IAgentSource || (IAgentSource = {}));
export { newInstructionsCollectionEvent, newInstructionsCollectionDebugInfo, matchesSessionType, IPromptsService, IAgentSource };
