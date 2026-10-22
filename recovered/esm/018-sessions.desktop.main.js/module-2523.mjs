// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/promptSyntax/hookUtils.ts
import { findNodeAtLocation, parse5, parseTree } from "./module-0885.mjs";
import { parseHooksFromFile, parseHooksIgnoringDisableAll } from "./module-1015.mjs";
import { HOOK_METADATA, HookType } from "./module-1011.mjs";
import { formatHookCommandLabel } from "./module-1012.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/browser/promptSyntax/hookUtils.ts
function offsetToPosition(content, offset) {
  let line = 1;
  let column = 1;
  for (let i2 = 0; i2 < offset && i2 < content.length; i2++) {
    if (content[i2] === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
  }
  return { line, column };
}

function findNthCommandNode(tree, hookType, targetIndex, fieldName) {
  const hookTypeArray = findNodeAtLocation(tree, ["hooks", hookType]);
  if (!hookTypeArray || hookTypeArray.type !== "array" || !hookTypeArray.children) {
    return void 0;
  }
  let currentIndex = 0;
  for (let i2 = 0; i2 < hookTypeArray.children.length; i2++) {
    const item = hookTypeArray.children[i2];
    if (item.type !== "object") {
      continue;
    }
    const nestedHooksNode = findNodeAtLocation(tree, ["hooks", hookType, i2, "hooks"]);
    if (nestedHooksNode && nestedHooksNode.type === "array" && nestedHooksNode.children) {
      for (let j = 0; j < nestedHooksNode.children.length; j++) {
        if (currentIndex === targetIndex) {
          return findNodeAtLocation(tree, ["hooks", hookType, i2, "hooks", j, fieldName]);
        }
        currentIndex++;
      }
    } else {
      if (currentIndex === targetIndex) {
        return findNodeAtLocation(tree, ["hooks", hookType, i2, fieldName]);
      }
      currentIndex++;
    }
  }
  return void 0;
}

function findHookCommandSelection(content, hookType, index2, fieldName) {
  const tree = parseTree(content);
  if (!tree) {
    return void 0;
  }
  const node = findNthCommandNode(tree, hookType, index2, fieldName);
  if (!node || node.type !== "string") {
    return void 0;
  }
  const valueStart = node.offset + 1;
  const valueEnd = node.offset + node.length - 1;
  const start = offsetToPosition(content, valueStart);
  const end = offsetToPosition(content, valueEnd);
  return {
    startLineNumber: start.line,
    startColumn: start.column,
    endLineNumber: end.line,
    endColumn: end.column
  };
}

function findHookCommandInYaml(content, commandText) {
  const commandFieldKeys = ["command", "windows", "linux", "osx", "bash", "powershell"];
  const lines = content.split("\n");
  for (let i2 = 0; i2 < lines.length; i2++) {
    const line = lines[i2];
    const trimmed = line.trimStart();
    const matchedKey = commandFieldKeys.find(
      (key3) => trimmed.startsWith(`${key3}:`) || trimmed.startsWith(`- ${key3}:`)
    );
    if (!matchedKey) {
      continue;
    }
    const colonIdx = line.indexOf(":");
    const idx = line.indexOf(commandText, colonIdx + 1);
    if (idx !== -1) {
      const afterIdx = idx + commandText.length;
      const charAfter = afterIdx < line.length ? line.charCodeAt(afterIdx) : -1;
      if (charAfter === -1 || charAfter === 34 || charAfter === 39 || charAfter === 32 || charAfter === 9) {
        return {
          startLineNumber: i2 + 1,
          startColumn: idx + 1,
          endLineNumber: i2 + 1,
          endColumn: idx + 1 + commandText.length
        };
      }
    }
  }
  return void 0;
}

async function parseAllHookFiles(promptsService, fileService, labelService, workspaceRootUri, userHome, os, token, options3) {
  const hookFiles = options3?.preferredStorage ? await promptsService.listPromptFilesForStorage("hook" /* hook */, options3.preferredStorage, token) : await promptsService.listPromptFiles("hook" /* hook */, token);
  const parsedHooks = [];
  for (const hookFile of hookFiles) {
    try {
      const content = await fileService.readFile(hookFile.uri);
      const json = parse5(content.value.toString());
      const { hooks } = parseHooksFromFile(hookFile.uri, json, workspaceRootUri, userHome);
      for (const [hookType, { hooks: commands, originalId }] of hooks) {
        const hookTypeMeta = HOOK_METADATA[hookType];
        if (!hookTypeMeta) {
          continue;
        }
        for (let i2 = 0; i2 < commands.length; i2++) {
          const command4 = commands[i2];
          const commandLabel = formatHookCommandLabel(command4, os) || localize(11460, null);
          parsedHooks.push({
            hookType,
            hookTypeLabel: hookTypeMeta.label,
            command: command4,
            commandLabel,
            fileUri: hookFile.uri,
            filePath: labelService.getUriLabel(hookFile.uri, { relative: true }),
            index: i2,
            originalHookTypeId: originalId
          });
        }
      }
    } catch (error) {
      console.error("Failed to read or parse hook file", hookFile.uri.toString(), error);
    }
  }
  if (options3?.additionalDisabledFileUris) {
    for (const uri4 of options3.additionalDisabledFileUris) {
      try {
        const content = await fileService.readFile(uri4);
        const json = parse5(content.value.toString());
        const { hooks } = parseHooksIgnoringDisableAll(uri4, json, workspaceRootUri, userHome);
        for (const [hookType, { hooks: commands, originalId }] of hooks) {
          const hookTypeMeta = HOOK_METADATA[hookType];
          if (!hookTypeMeta) {
            continue;
          }
          for (let i2 = 0; i2 < commands.length; i2++) {
            const command4 = commands[i2];
            const commandLabel = formatHookCommandLabel(command4, os) || localize(11460, null);
            parsedHooks.push({
              hookType,
              hookTypeLabel: hookTypeMeta.label,
              command: command4,
              commandLabel,
              fileUri: uri4,
              filePath: labelService.getUriLabel(uri4, { relative: true }),
              index: i2,
              originalHookTypeId: originalId,
              disabled: true
            });
          }
        }
      } catch (error) {
        console.error("Failed to read or parse disabled hook file", uri4.toString(), error);
      }
    }
  }
  if (options3?.includeAgentHooks) {
    const agents = await promptsService.getCustomAgents(token);
    for (const agent of agents) {
      if (!agent.hooks || !agent.enabled || options3.preferredStorage && agent.source.storage !== options3.preferredStorage) {
        continue;
      }
      for (const hookTypeValue of Object.values(HookType)) {
        const commands = agent.hooks[hookTypeValue];
        if (!commands || commands.length === 0) {
          continue;
        }
        const hookTypeMeta = HOOK_METADATA[hookTypeValue];
        if (!hookTypeMeta) {
          continue;
        }
        for (let i2 = 0; i2 < commands.length; i2++) {
          const command4 = commands[i2];
          const commandLabel = formatHookCommandLabel(command4, os) || localize(11460, null);
          parsedHooks.push({
            hookType: hookTypeValue,
            hookTypeLabel: hookTypeMeta.label,
            command: command4,
            commandLabel,
            fileUri: agent.uri,
            filePath: labelService.getUriLabel(agent.uri, { relative: true }),
            index: i2,
            originalHookTypeId: hookTypeValue,
            agentName: agent.name
          });
        }
      }
    }
  }
  return parsedHooks;
}
export { offsetToPosition, findNthCommandNode, findHookCommandSelection, findHookCommandInYaml, parseAllHookFiles };
