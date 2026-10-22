// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeBridgeOpenFolder.ts
import { isMacintosh } from "./module-0014.mjs";


// src/vs/workbench/contrib/chat/browser/aiCustomization/openCodeBridgeOpenFolder.ts
var OPEN_FOLDER_COMMAND_ID = "workbench.action.files.openFolder";

function openFolderShortcutHint() {
  return isMacintosh ? void 0 : "Ctrl+K Ctrl+O";
}

function openFolderTooltip(menuPath) {
  const hint = openFolderShortcutHint();
  return hint ? `${menuPath} \xB7 ${hint}` : menuPath;
}

var NEW_WINDOW_COMMAND_ID = "workbench.action.newWindow";

function newWindowShortcutHint() {
  return isMacintosh ? "\u21E7\u2318N" : "Ctrl+Shift+N";
}

function newWindowTooltip(menuPath) {
  return `${menuPath} \xB7 ${newWindowShortcutHint()}`;
}
export { openFolderShortcutHint, openFolderTooltip, newWindowShortcutHint, newWindowTooltip, OPEN_FOLDER_COMMAND_ID, NEW_WINDOW_COMMAND_ID };
