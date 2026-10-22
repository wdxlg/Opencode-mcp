// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/hookClaudeCompat.ts
import { HOOKS_BY_TARGET } from "./module-1011.mjs";
import { extractHookCommandsFromItem, toHookType } from "./module-1012.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/hookClaudeCompat.ts
var _hookTypeToClaudeName;

function getHookTypeToClaudeNameMap() {
  if (!_hookTypeToClaudeName) {
    _hookTypeToClaudeName = /* @__PURE__ */ new Map();
    for (const [claudeName, hookType] of Object.entries(HOOKS_BY_TARGET["claude" /* Claude */])) {
      _hookTypeToClaudeName.set(hookType, claudeName);
    }
  }
  return _hookTypeToClaudeName;
}

function resolveClaudeHookType(name) {
  return HOOKS_BY_TARGET["claude" /* Claude */][name];
}

function getClaudeHookTypeName(hookType) {
  return getHookTypeToClaudeNameMap().get(hookType);
}

function parseClaudeHooks(json, workspaceRootUri, userHome) {
  const result = /* @__PURE__ */ new Map();
  if (!json || typeof json !== "object") {
    return { hooks: result, disabledAllHooks: false };
  }
  const root = json;
  if (root.disableAllHooks === true) {
    return { hooks: result, disabledAllHooks: true };
  }
  const hooks = root.hooks;
  if (!hooks || typeof hooks !== "object") {
    return { hooks: result, disabledAllHooks: false };
  }
  const hooksObj = hooks;
  for (const originalId of Object.keys(hooksObj)) {
    const hookType = resolveClaudeHookType(originalId) ?? toHookType(originalId);
    if (!hookType) {
      continue;
    }
    const hookArray = hooksObj[originalId];
    if (!Array.isArray(hookArray)) {
      continue;
    }
    const commands = [];
    for (const item of hookArray) {
      const extracted = extractHookCommandsFromItem(item, workspaceRootUri, userHome);
      commands.push(...extracted);
    }
    if (commands.length > 0) {
      const existing = result.get(hookType);
      if (existing) {
        existing.hooks.push(...commands);
      } else {
        result.set(hookType, { hooks: commands, originalId });
      }
    }
  }
  return { hooks: result, disabledAllHooks: false };
}
export { getHookTypeToClaudeNameMap, resolveClaudeHookType, getClaudeHookTypeName, parseClaudeHooks, _hookTypeToClaudeName };
