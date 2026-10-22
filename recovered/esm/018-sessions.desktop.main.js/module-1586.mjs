// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/keybinding/browser/unboundCommands.ts
import { CommandsRegistry } from "./module-0087.mjs";
import { isNonEmptyArray } from "./module-0007.mjs";
import { MenuId, MenuRegistry, isIMenuItem } from "./module-0092.mjs";
import { EditorExtensionsRegistry } from "./module-0097.mjs";


// src/vs/workbench/services/keybinding/browser/unboundCommands.ts
function getAllUnboundCommands(boundCommands) {
  const unboundCommands = [];
  const seenMap = /* @__PURE__ */ new Map();
  const addCommand = (id2, includeCommandWithArgs) => {
    if (seenMap.has(id2)) {
      return;
    }
    seenMap.set(id2, true);
    if (id2[0] === "_" || id2.indexOf("vscode.") === 0) {
      return;
    }
    if (boundCommands.get(id2) === true) {
      return;
    }
    if (!includeCommandWithArgs) {
      const command4 = CommandsRegistry.getCommand(id2);
      if (command4 && typeof command4.metadata === "object" && isNonEmptyArray(command4.metadata.args)) {
        return;
      }
    }
    unboundCommands.push(id2);
  };
  for (const menuItem of MenuRegistry.getMenuItems(MenuId.CommandPalette)) {
    if (isIMenuItem(menuItem)) {
      addCommand(menuItem.command.id, true);
    }
  }
  for (const editorAction of EditorExtensionsRegistry.getEditorActions()) {
    addCommand(editorAction.id, true);
  }
  for (const id2 of CommandsRegistry.getCommands().keys()) {
    addCommand(id2, false);
  }
  return unboundCommands;
}
export { getAllUnboundCommands };
