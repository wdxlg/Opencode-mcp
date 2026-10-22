// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/promptSyntax/hookCompatibility.ts
import { basename, dirname } from "./module-0026.mjs";
import { resolveCopilotCliHookType } from "./module-1014.mjs";
import { extractHookCommandsFromItem, toHookType } from "./module-1012.mjs";
import { parseClaudeHooks } from "./module-1013.mjs";


// src/vs/workbench/contrib/chat/common/promptSyntax/hookCompatibility.ts
function getHookSourceFormat(fileUri) {
  const filename = basename(fileUri.path).toLowerCase();
  const dir = dirname(fileUri.path);
  if ((filename === "settings.json" || filename === "settings.local.json") && dir.endsWith(".claude")) {
    return "claude" /* Claude */;
  }
  return "copilot" /* Copilot */;
}

function parseCopilotHooks(json, workspaceRootUri, userHome) {
  const result = /* @__PURE__ */ new Map();
  if (!json || typeof json !== "object") {
    return result;
  }
  const root = json;
  const hooks = root.hooks;
  if (!hooks || typeof hooks !== "object") {
    return result;
  }
  const hooksObj = hooks;
  for (const originalId of Object.keys(hooksObj)) {
    const hookType = resolveCopilotCliHookType(originalId) ?? toHookType(originalId);
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
      result.set(hookType, { hooks: commands, originalId });
    }
  }
  return result;
}

function parseHooksFromFile(fileUri, json, workspaceRootUri, userHome) {
  const format5 = getHookSourceFormat(fileUri);
  let hooks;
  let disabledAllHooks = false;
  switch (format5) {
    case "claude" /* Claude */: {
      const result = parseClaudeHooks(json, workspaceRootUri, userHome);
      hooks = result.hooks;
      disabledAllHooks = result.disabledAllHooks;
      break;
    }
    case "copilot" /* Copilot */:
    default:
      hooks = parseCopilotHooks(json, workspaceRootUri, userHome);
      break;
  }
  return { format: format5, hooks, disabledAllHooks };
}

function parseHooksIgnoringDisableAll(fileUri, json, workspaceRootUri, userHome) {
  const format5 = getHookSourceFormat(fileUri);
  let hooks;
  switch (format5) {
    case "claude" /* Claude */: {
      if (json && typeof json === "object") {
        const { disableAllHooks: _, ...rest } = json;
        const result = parseClaudeHooks(rest, workspaceRootUri, userHome);
        hooks = result.hooks;
      } else {
        hooks = /* @__PURE__ */ new Map();
      }
      break;
    }
    case "copilot" /* Copilot */:
    default:
      hooks = parseCopilotHooks(json, workspaceRootUri, userHome);
      break;
  }
  return { format: format5, hooks, disabledAllHooks: true };
}

function buildNewHookEntry(format5) {
  const commandEntry = { type: "command", command: "" };
  if (format5 === "claude" /* Claude */) {
    return { matcher: "", hooks: [commandEntry] };
  }
  return commandEntry;
}
export { getHookSourceFormat, parseCopilotHooks, parseHooksFromFile, parseHooksIgnoringDisableAll, buildNewHookEntry };
