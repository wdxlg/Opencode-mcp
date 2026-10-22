// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/browser/parts/editor/diffEditorCommands.ts
import { KeybindingsRegistry } from "./module-0091.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { KeyChord } from "./module-0019.mjs";
import { IDiffEditorCommandsService } from "./module-1535.mjs";
import { MenuId, MenuRegistry } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { ActiveCompareEditorCanSwapContext, ActiveCustomEditorDiffCanToggleLayoutContext, TextCompareEditorActiveContext, TextCompareEditorVisibleContext } from "./module-0949.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";


// src/vs/workbench/browser/parts/editor/diffEditorCommands.ts
var TOGGLE_DIFF_SIDE_BY_SIDE = "toggle.diff.renderSideBySide";

var GOTO_NEXT_CHANGE = "workbench.action.compareEditor.nextChange";

var GOTO_PREVIOUS_CHANGE = "workbench.action.compareEditor.previousChange";

var DIFF_FOCUS_PRIMARY_SIDE = "workbench.action.compareEditor.focusPrimarySide";

var DIFF_FOCUS_SECONDARY_SIDE = "workbench.action.compareEditor.focusSecondarySide";

var DIFF_FOCUS_OTHER_SIDE = "workbench.action.compareEditor.focusOtherSide";

var DIFF_OPEN_SIDE = "workbench.action.compareEditor.openSide";

var TOGGLE_DIFF_IGNORE_TRIM_WHITESPACE = "toggle.diff.ignoreTrimWhitespace";

var DIFF_SWAP_SIDES = "workbench.action.compareEditor.swapSides";

function registerDiffEditorCommands() {
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: DIFF_OPEN_SIDE,
    weight: 200 /* WorkbenchContrib */,
    when: EditorContextKeys.inDiffEditor,
    primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 1024 /* Shift */ | 45 /* KeyO */),
    handler: (accessor) => accessor.get(IDiffEditorCommandsService).openActiveDiffSide()
  });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
      id: DIFF_OPEN_SIDE,
      title: localize2(6336, "Open Active Diff Side")
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: GOTO_NEXT_CHANGE,
    weight: 200 /* WorkbenchContrib */,
    when: TextCompareEditorVisibleContext,
    primary: 512 /* Alt */ | 63 /* F5 */,
    handler: (accessor, ...args2) => accessor.get(IDiffEditorCommandsService).navigateInDiffEditor(args2, true)
  });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
      id: GOTO_NEXT_CHANGE,
      title: localize2(6335, "Go to Next Change")
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: GOTO_PREVIOUS_CHANGE,
    weight: 200 /* WorkbenchContrib */,
    when: TextCompareEditorVisibleContext,
    primary: 512 /* Alt */ | 1024 /* Shift */ | 63 /* F5 */,
    handler: (accessor, ...args2) => accessor.get(IDiffEditorCommandsService).navigateInDiffEditor(args2, false)
  });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
      id: GOTO_PREVIOUS_CHANGE,
      title: localize2(6337, "Go to Previous Change")
    }
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: TOGGLE_DIFF_SIDE_BY_SIDE,
    weight: 200 /* WorkbenchContrib */,
    when: void 0,
    primary: void 0,
    handler: (accessor, ...args2) => accessor.get(IDiffEditorCommandsService).toggleRenderSideBySide(args2)
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: DIFF_FOCUS_PRIMARY_SIDE,
    weight: 200 /* WorkbenchContrib */,
    when: void 0,
    primary: void 0,
    handler: (accessor, ...args2) => accessor.get(IDiffEditorCommandsService).focusInDiffEditor(args2, 1 /* Modified */)
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: DIFF_FOCUS_SECONDARY_SIDE,
    weight: 200 /* WorkbenchContrib */,
    when: void 0,
    primary: void 0,
    handler: (accessor, ...args2) => accessor.get(IDiffEditorCommandsService).focusInDiffEditor(args2, 0 /* Original */)
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: DIFF_FOCUS_OTHER_SIDE,
    weight: 200 /* WorkbenchContrib */,
    when: void 0,
    primary: void 0,
    handler: (accessor, ...args2) => accessor.get(IDiffEditorCommandsService).focusInDiffEditor(args2, 2 /* Toggle */)
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: TOGGLE_DIFF_IGNORE_TRIM_WHITESPACE,
    weight: 200 /* WorkbenchContrib */,
    when: void 0,
    primary: void 0,
    handler: (accessor, ...args2) => accessor.get(IDiffEditorCommandsService).toggleDiffIgnoreTrimWhitespace(args2)
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: DIFF_SWAP_SIDES,
    weight: 200 /* WorkbenchContrib */,
    when: void 0,
    primary: void 0,
    handler: (accessor, ...args2) => accessor.get(IDiffEditorCommandsService).swapDiffSides(args2)
  });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
      id: TOGGLE_DIFF_SIDE_BY_SIDE,
      title: localize2(6339, "Toggle Inline View"),
      category: localize(6334, null)
    },
    when: ContextKeyExpr.or(TextCompareEditorActiveContext, ActiveCustomEditorDiffCanToggleLayoutContext)
  });
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
      id: DIFF_SWAP_SIDES,
      title: localize2(6338, "Swap Left and Right Editor Side"),
      category: localize(6334, null)
    },
    when: ContextKeyExpr.and(TextCompareEditorActiveContext, ActiveCompareEditorCanSwapContext)
  });
}
export { registerDiffEditorCommands, TOGGLE_DIFF_SIDE_BY_SIDE, GOTO_NEXT_CHANGE, GOTO_PREVIOUS_CHANGE, DIFF_FOCUS_PRIMARY_SIDE, DIFF_FOCUS_SECONDARY_SIDE, DIFF_FOCUS_OTHER_SIDE, DIFF_OPEN_SIDE, TOGGLE_DIFF_IGNORE_TRIM_WHITESPACE, DIFF_SWAP_SIDES };
