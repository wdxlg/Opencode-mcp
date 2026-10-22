// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/hookCopilotCliCompat.ts
import { HOOKS_BY_TARGET } from "./module-1011.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/hookCopilotCliCompat.ts
var COPILOT_CLI_HOOK_TYPE_MAP = HOOKS_BY_TARGET["github-copilot" /* GitHubCopilot */];

var _hookTypeToCopilotCliName;

function getHookTypeToCopilotCliNameMap() {
  if (!_hookTypeToCopilotCliName) {
    _hookTypeToCopilotCliName = /* @__PURE__ */ new Map();
    for (const [copilotCliName, hookType] of Object.entries(COPILOT_CLI_HOOK_TYPE_MAP)) {
      _hookTypeToCopilotCliName.set(hookType, copilotCliName);
    }
  }
  return _hookTypeToCopilotCliName;
}

function resolveCopilotCliHookType(name) {
  return COPILOT_CLI_HOOK_TYPE_MAP[name];
}

function getCopilotCliHookTypeName(hookType) {
  return getHookTypeToCopilotCliNameMap().get(hookType);
}
export { getHookTypeToCopilotCliNameMap, resolveCopilotCliHookType, getCopilotCliHookTypeName, COPILOT_CLI_HOOK_TYPE_MAP, _hookTypeToCopilotCliName };
