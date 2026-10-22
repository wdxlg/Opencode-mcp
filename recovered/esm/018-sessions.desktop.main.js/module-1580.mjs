// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/dialogs/dialog.ts
import { EventHelper } from "./module-0075.mjs";
import { defaultButtonStyles, defaultCheckboxStyles, defaultDialogStyles, defaultInputBoxStyles } from "./module-0513.mjs";


// src/vs/workbench/browser/parts/dialogs/dialog.ts
var defaultDialogAllowableCommands = /* @__PURE__ */ new Set([
  "workbench.action.quit",
  "workbench.action.reloadWindow",
  "copy",
  "cut",
  "editor.action.selectAll",
  "editor.action.clipboardCopyAction",
  "editor.action.clipboardCutAction",
  "editor.action.clipboardPasteAction"
]);

function createWorkbenchDialogOptions(options3, keybindingService, layoutService, hostService, allowableCommands = defaultDialogAllowableCommands, shouldPassThroughCommand) {
  return {
    keyEventProcessor: (event) => {
      const resolved = keybindingService.softDispatch(event, layoutService.activeContainer);
      if (resolved.kind === 2 /* KbFound */ && resolved.commandId) {
        if (!allowableCommands.has(resolved.commandId) && !shouldPassThroughCommand?.(resolved.commandId, event)) {
          EventHelper.stop(event, true);
        }
      }
    },
    buttonStyles: defaultButtonStyles,
    checkboxStyles: defaultCheckboxStyles,
    inputBoxStyles: defaultInputBoxStyles,
    dialogStyles: defaultDialogStyles,
    onVisibilityChange: (window2, visible) => hostService.setWindowDimmed(window2, visible),
    ...options3
  };
}
export { createWorkbenchDialogOptions, defaultDialogAllowableCommands };
