// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/debug.contribution.ts
import { localize, localize2 } from "./module-0001.mjs";
import { registerColors2 } from "./module-1892.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10, WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { DebugStatusContribution } from "./module-3168.mjs";
import { DebugProgressContribution } from "./module-3165.mjs";
import { isMacintosh, isWeb } from "./module-0014.mjs";
import { DebugTitleContribution } from "./module-3169.mjs";
import { DebugToolBar } from "./module-3160.mjs";
import { DebugContentProvider } from "./module-3157.mjs";
import { StatusBarColorProvider } from "./module-3176.mjs";
import { DisassemblyView, DisassemblyViewContribution } from "./module-3163.mjs";
import { DebugLifecycle } from "./module-3158.mjs";
import { DebugChatContextContribution } from "./module-3178.mjs";
import { Extensions18 } from "./module-1560.mjs";
import { StartDebugQuickAccessProvider } from "./module-3166.mjs";
import { ADD_CONFIGURATION_ID, ADD_TO_WATCH_ID, ADD_TO_WATCH_LABEL, BREAK_WHEN_VALUE_CHANGES_ID, BREAK_WHEN_VALUE_IS_ACCESSED_ID, BREAK_WHEN_VALUE_IS_READ_ID, CALLSTACK_BOTTOM_ID, CALLSTACK_BOTTOM_LABEL, CALLSTACK_DOWN_ID, CALLSTACK_DOWN_LABEL, CALLSTACK_TOP_ID, CALLSTACK_TOP_LABEL, CALLSTACK_UP_ID, CALLSTACK_UP_LABEL, CONTINUE_ID, CONTINUE_LABEL, COPY_ADDRESS_ID, COPY_ADDRESS_LABEL, COPY_EVALUATE_PATH_ID, COPY_EVALUATE_PATH_LABEL, COPY_STACK_TRACE_ID, COPY_VALUE_ID, COPY_VALUE_LABEL, DEBUG_COMMAND_CATEGORY, DEBUG_CONSOLE_QUICK_ACCESS_PREFIX, DEBUG_QUICK_ACCESS_PREFIX, DEBUG_RUN_COMMAND_ID, DEBUG_RUN_LABEL, DEBUG_START_COMMAND_ID, DEBUG_START_LABEL, DISCONNECT_AND_SUSPEND_ID, DISCONNECT_AND_SUSPEND_LABEL, DISCONNECT_ID, DISCONNECT_LABEL, EDIT_EXPRESSION_COMMAND_ID, JUMP_TO_CURSOR_ID, NEXT_DEBUG_CONSOLE_ID, NEXT_DEBUG_CONSOLE_LABEL, OPEN_LOADED_SCRIPTS_LABEL, PAUSE_ID, PAUSE_LABEL, PREV_DEBUG_CONSOLE_ID, PREV_DEBUG_CONSOLE_LABEL, REMOVE_EXPRESSION_COMMAND_ID, RESTART_FRAME_ID, RESTART_LABEL, RESTART_SESSION_ID, SELECT_AND_START_ID, SELECT_AND_START_LABEL, SELECT_DEBUG_CONSOLE_ID, SELECT_DEBUG_CONSOLE_LABEL, SELECT_DEBUG_SESSION_ID, SELECT_DEBUG_SESSION_LABEL, SET_EXPRESSION_COMMAND_ID, SHOW_LOADED_SCRIPTS_ID, STEP_INTO_ID, STEP_INTO_LABEL, STEP_INTO_TARGET_ID, STEP_INTO_TARGET_LABEL, STEP_OUT_ID, STEP_OUT_LABEL, STEP_OVER_ID, STEP_OVER_LABEL, STOP_ID, STOP_LABEL, TERMINATE_THREAD_ID, TOGGLE_BREAKPOINT_ID, TOGGLE_INLINE_BREAKPOINT_ID } from "./module-2406.mjs";
import { DebugConsoleQuickAccess } from "./module-3162.mjs";
import { registerEditorContribution } from "./module-0097.mjs";
import { CallStackEditorContribution } from "./module-2451.mjs";
import { BREAKPOINTS_VIEW_ID, BREAKPOINT_EDITOR_CONTRIBUTION_ID, CALLSTACK_VIEW_ID, CONTEXT_BREAKPOINTS_EXIST, CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED, CONTEXT_BREAK_WHEN_VALUE_IS_ACCESSED_SUPPORTED, CONTEXT_BREAK_WHEN_VALUE_IS_READ_SUPPORTED, CONTEXT_CALLSTACK_ITEM_TYPE, CONTEXT_CAN_VIEW_MEMORY, CONTEXT_DEBUGGERS_AVAILABLE, CONTEXT_DEBUG_STATE, CONTEXT_DEBUG_UX, CONTEXT_EXPRESSION_SELECTED, CONTEXT_FOCUSED_SESSION_IS_ATTACH, CONTEXT_FOCUSED_SESSION_IS_NO_DEBUG, CONTEXT_HAS_DEBUGGED, CONTEXT_IN_DEBUG_MODE, CONTEXT_JUMP_TO_CURSOR_SUPPORTED, CONTEXT_LOADED_SCRIPTS_SUPPORTED, CONTEXT_RESTART_FRAME_SUPPORTED, CONTEXT_SET_EXPRESSION_SUPPORTED, CONTEXT_SET_VARIABLE_SUPPORTED, CONTEXT_STACK_FRAME_SUPPORTS_RESTART, CONTEXT_STEP_INTO_TARGETS_SUPPORTED, CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED, CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED, CONTEXT_TERMINATE_THREADS_SUPPORTED, CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT, CONTEXT_VARIABLE_IS_READONLY, CONTEXT_VARIABLE_VALUE, CONTEXT_WATCH_ITEM_TYPE, DEBUG_PANEL_ID, DISASSEMBLY_VIEW_ID, EDITOR_CONTRIBUTION_ID, INTERNAL_CONSOLE_OPTIONS_SCHEMA, LOADED_SCRIPTS_VIEW_ID, REPL_VIEW_ID, VARIABLES_VIEW_ID, VIEWLET_ID3, WATCH_VIEW_ID, getStateLabel } from "./module-1057.mjs";
import { BreakpointEditorContribution } from "./module-2450.mjs";
import { DebugEditorContribution } from "./module-2412.mjs";
import { MenuId, MenuRegistry } from "./module-0092.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { RunToCursorAction, SelectionToReplAction, SelectionToWatchExpressionsAction } from "./module-3164.mjs";
import { SET_VARIABLE_ID, VIEW_MEMORY_ID, VariablesView } from "./module-2409.mjs";
import { breakpointsViewIcon, callStackViewIcon, debugConsoleViewIcon, debugInspectMemory, debugRun, loadedScriptsViewIcon, runViewIcon, variablesViewIcon2, watchExpressionRemove, watchViewIcon } from "./module-1891.mjs";
import { ADD_WATCH_ID, ADD_WATCH_LABEL, REMOVE_WATCH_EXPRESSIONS_COMMAND_ID, REMOVE_WATCH_EXPRESSIONS_LABEL, WatchExpressionsView } from "./module-3177.mjs";
import { COPY_NOTEBOOK_VARIABLE_VALUE_ID, COPY_NOTEBOOK_VARIABLE_VALUE_LABEL } from "./module-3155.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { FocusedViewContext, IsSessionsWindowContext } from "./module-0949.mjs";
import { FileAccess } from "./module-0033.mjs";
import { Extensions13 } from "./module-1093.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { ViewPaneContainer } from "./module-1382.mjs";
import { Repl } from "./module-3019.mjs";
import { DebugViewPaneContainer } from "./module-3171.mjs";
import { CallStackView } from "./module-3161.mjs";
import { BreakpointsView } from "./module-2404.mjs";
import { WelcomeView } from "./module-3170.mjs";
import { LoadedScriptsView } from "./module-3172.mjs";
import { EditorExtensions } from "./module-0925.mjs";
import { EditorPaneDescriptor } from "./module-1084.mjs";
import { DisassemblyViewInput } from "./module-1062.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { launchSchemaId } from "./module-1198.mjs";
import { AccessibleViewRegistry } from "./module-0693.mjs";
import { ReplAccessibleView } from "./module-3174.mjs";
import { ReplAccessibilityHelp } from "./module-3173.mjs";
import { RunAndDebugAccessibilityHelp } from "./module-3175.mjs";
import { ReplAccessibilityAnnouncer } from "./module-3159.mjs";
import { DebugWatchAccessibilityAnnouncer } from "./module-3156.mjs";


// src/vs/workbench/contrib/debug/browser/debug.contribution.ts
var debugCategory = localize(14290, null);

registerColors2();

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(DebugStatusContribution, 4 /* Eventually */);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(DebugProgressContribution, 4 /* Eventually */);

if (isWeb) {
  Registry.as(Extensions10.Workbench).registerWorkbenchContribution(DebugTitleContribution, 4 /* Eventually */);
}

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(DebugToolBar, 3 /* Restored */);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(DebugContentProvider, 4 /* Eventually */);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(StatusBarColorProvider, 4 /* Eventually */);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(DisassemblyViewContribution, 4 /* Eventually */);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(DebugLifecycle, 4 /* Eventually */);

registerWorkbenchContribution2(DebugChatContextContribution.ID, DebugChatContextContribution, WorkbenchPhase.AfterRestored);

Registry.as(Extensions18.Quickaccess).registerQuickAccessProvider({
  ctor: StartDebugQuickAccessProvider,
  prefix: DEBUG_QUICK_ACCESS_PREFIX,
  contextKey: "inLaunchConfigurationsPicker",
  placeholder: localize(14343, null),
  helpEntries: [{
    description: localize(14342, null),
    commandId: SELECT_AND_START_ID,
    commandCenterOrder: 50
  }]
});

Registry.as(Extensions18.Quickaccess).registerQuickAccessProvider({
  ctor: DebugConsoleQuickAccess,
  prefix: DEBUG_CONSOLE_QUICK_ACCESS_PREFIX,
  contextKey: "inDebugConsolePicker",
  placeholder: localize(14345, null),
  helpEntries: [{ description: localize(14344, null), commandId: SELECT_DEBUG_CONSOLE_ID }]
});

registerEditorContribution("editor.contrib.callStack", CallStackEditorContribution, 1 /* AfterFirstRender */);

registerEditorContribution(BREAKPOINT_EDITOR_CONTRIBUTION_ID, BreakpointEditorContribution, 1 /* AfterFirstRender */);

registerEditorContribution(EDITOR_CONTRIBUTION_ID, DebugEditorContribution, 2 /* BeforeFirstInteraction */);

var registerDebugCommandPaletteItem = (id2, title, when, precondition2) => {
  MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    when: ContextKeyExpr.and(CONTEXT_DEBUGGERS_AVAILABLE, when),
    group: debugCategory,
    command: {
      id: id2,
      title,
      category: DEBUG_COMMAND_CATEGORY,
      precondition: precondition2
    }
  });
};

registerDebugCommandPaletteItem(RESTART_SESSION_ID, RESTART_LABEL);

registerDebugCommandPaletteItem(TERMINATE_THREAD_ID, localize2(14346, "Terminate Thread"), CONTEXT_IN_DEBUG_MODE, CONTEXT_TERMINATE_THREADS_SUPPORTED);

registerDebugCommandPaletteItem(STEP_OVER_ID, STEP_OVER_LABEL, CONTEXT_IN_DEBUG_MODE, CONTEXT_DEBUG_STATE.isEqualTo("stopped"));

registerDebugCommandPaletteItem(STEP_INTO_ID, STEP_INTO_LABEL, CONTEXT_IN_DEBUG_MODE, CONTEXT_DEBUG_STATE.isEqualTo("stopped"));

registerDebugCommandPaletteItem(STEP_INTO_TARGET_ID, STEP_INTO_TARGET_LABEL, CONTEXT_IN_DEBUG_MODE, ContextKeyExpr.and(CONTEXT_STEP_INTO_TARGETS_SUPPORTED, CONTEXT_IN_DEBUG_MODE, CONTEXT_DEBUG_STATE.isEqualTo("stopped")));

registerDebugCommandPaletteItem(STEP_OUT_ID, STEP_OUT_LABEL, CONTEXT_IN_DEBUG_MODE, CONTEXT_DEBUG_STATE.isEqualTo("stopped"));

registerDebugCommandPaletteItem(PAUSE_ID, PAUSE_LABEL, CONTEXT_IN_DEBUG_MODE, ContextKeyExpr.and(CONTEXT_DEBUG_STATE.isEqualTo("running"), CONTEXT_FOCUSED_SESSION_IS_NO_DEBUG.toNegated()));

registerDebugCommandPaletteItem(DISCONNECT_ID, DISCONNECT_LABEL, CONTEXT_IN_DEBUG_MODE, ContextKeyExpr.or(CONTEXT_FOCUSED_SESSION_IS_ATTACH, CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED));

registerDebugCommandPaletteItem(DISCONNECT_AND_SUSPEND_ID, DISCONNECT_AND_SUSPEND_LABEL, CONTEXT_IN_DEBUG_MODE, ContextKeyExpr.or(CONTEXT_FOCUSED_SESSION_IS_ATTACH, ContextKeyExpr.and(CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED, CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED)));

registerDebugCommandPaletteItem(STOP_ID, STOP_LABEL, CONTEXT_IN_DEBUG_MODE, ContextKeyExpr.or(CONTEXT_FOCUSED_SESSION_IS_ATTACH.toNegated(), CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED));

registerDebugCommandPaletteItem(CONTINUE_ID, CONTINUE_LABEL, CONTEXT_IN_DEBUG_MODE, CONTEXT_DEBUG_STATE.isEqualTo("stopped"));

registerDebugCommandPaletteItem(JUMP_TO_CURSOR_ID, localize2(14305, "Jump to Cursor"), CONTEXT_JUMP_TO_CURSOR_SUPPORTED);

registerDebugCommandPaletteItem(JUMP_TO_CURSOR_ID, localize2(14334, "Set Next Statement"), CONTEXT_JUMP_TO_CURSOR_SUPPORTED);

registerDebugCommandPaletteItem(RunToCursorAction.ID, RunToCursorAction.LABEL, CONTEXT_DEBUGGERS_AVAILABLE);

registerDebugCommandPaletteItem(SelectionToReplAction.ID, SelectionToReplAction.LABEL, CONTEXT_IN_DEBUG_MODE);

registerDebugCommandPaletteItem(SelectionToWatchExpressionsAction.ID, SelectionToWatchExpressionsAction.LABEL);

registerDebugCommandPaletteItem(TOGGLE_INLINE_BREAKPOINT_ID, localize2(14300, "Inline Breakpoint"));

registerDebugCommandPaletteItem(DEBUG_START_COMMAND_ID, DEBUG_START_LABEL, ContextKeyExpr.and(CONTEXT_DEBUGGERS_AVAILABLE, CONTEXT_DEBUG_STATE.notEqualsTo(getStateLabel(1 /* Initializing */))));

registerDebugCommandPaletteItem(DEBUG_RUN_COMMAND_ID, DEBUG_RUN_LABEL, ContextKeyExpr.and(CONTEXT_DEBUGGERS_AVAILABLE, CONTEXT_DEBUG_STATE.notEqualsTo(getStateLabel(1 /* Initializing */))));

registerDebugCommandPaletteItem(SELECT_AND_START_ID, SELECT_AND_START_LABEL, ContextKeyExpr.and(CONTEXT_DEBUGGERS_AVAILABLE, CONTEXT_DEBUG_STATE.notEqualsTo(getStateLabel(1 /* Initializing */))));

registerDebugCommandPaletteItem(NEXT_DEBUG_CONSOLE_ID, NEXT_DEBUG_CONSOLE_LABEL);

registerDebugCommandPaletteItem(PREV_DEBUG_CONSOLE_ID, PREV_DEBUG_CONSOLE_LABEL);

registerDebugCommandPaletteItem(SHOW_LOADED_SCRIPTS_ID, OPEN_LOADED_SCRIPTS_LABEL, CONTEXT_IN_DEBUG_MODE, CONTEXT_LOADED_SCRIPTS_SUPPORTED);

registerDebugCommandPaletteItem(SELECT_DEBUG_CONSOLE_ID, SELECT_DEBUG_CONSOLE_LABEL);

registerDebugCommandPaletteItem(SELECT_DEBUG_SESSION_ID, SELECT_DEBUG_SESSION_LABEL);

registerDebugCommandPaletteItem(CALLSTACK_TOP_ID, CALLSTACK_TOP_LABEL, CONTEXT_IN_DEBUG_MODE, CONTEXT_DEBUG_STATE.isEqualTo("stopped"));

registerDebugCommandPaletteItem(CALLSTACK_BOTTOM_ID, CALLSTACK_BOTTOM_LABEL, CONTEXT_IN_DEBUG_MODE, CONTEXT_DEBUG_STATE.isEqualTo("stopped"));

registerDebugCommandPaletteItem(CALLSTACK_UP_ID, CALLSTACK_UP_LABEL, CONTEXT_IN_DEBUG_MODE, CONTEXT_DEBUG_STATE.isEqualTo("stopped"));

registerDebugCommandPaletteItem(CALLSTACK_DOWN_ID, CALLSTACK_DOWN_LABEL, CONTEXT_IN_DEBUG_MODE, CONTEXT_DEBUG_STATE.isEqualTo("stopped"));

var registerDebugViewMenuItem = (menuId, id2, title, order, when, precondition2, group2 = "navigation", icon2) => {
  MenuRegistry.appendMenuItem(menuId, {
    group: group2,
    when,
    order,
    icon: icon2,
    command: {
      id: id2,
      title,
      icon: icon2,
      precondition: precondition2
    }
  });
};

registerDebugViewMenuItem(MenuId.DebugCallStackContext, RESTART_SESSION_ID, RESTART_LABEL, 10, CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo("session"), void 0, "3_modification");

registerDebugViewMenuItem(MenuId.DebugCallStackContext, DISCONNECT_ID, DISCONNECT_LABEL, 20, CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo("session"), void 0, "3_modification");

registerDebugViewMenuItem(MenuId.DebugCallStackContext, DISCONNECT_AND_SUSPEND_ID, DISCONNECT_AND_SUSPEND_LABEL, 21, ContextKeyExpr.and(CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo("session"), CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED, CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED), void 0, "3_modification");

registerDebugViewMenuItem(MenuId.DebugCallStackContext, STOP_ID, STOP_LABEL, 30, CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo("session"), void 0, "3_modification");

registerDebugViewMenuItem(MenuId.DebugCallStackContext, PAUSE_ID, PAUSE_LABEL, 10, ContextKeyExpr.and(CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo("thread"), ContextKeyExpr.and(CONTEXT_DEBUG_STATE.isEqualTo("running"), CONTEXT_FOCUSED_SESSION_IS_NO_DEBUG.toNegated())));

registerDebugViewMenuItem(MenuId.DebugCallStackContext, CONTINUE_ID, CONTINUE_LABEL, 10, ContextKeyExpr.and(CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo("thread"), CONTEXT_DEBUG_STATE.isEqualTo("stopped")));

registerDebugViewMenuItem(MenuId.DebugCallStackContext, STEP_OVER_ID, STEP_OVER_LABEL, 20, CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo("thread"), CONTEXT_DEBUG_STATE.isEqualTo("stopped"));

registerDebugViewMenuItem(MenuId.DebugCallStackContext, STEP_INTO_ID, STEP_INTO_LABEL, 30, CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo("thread"), CONTEXT_DEBUG_STATE.isEqualTo("stopped"));

registerDebugViewMenuItem(MenuId.DebugCallStackContext, STEP_OUT_ID, STEP_OUT_LABEL, 40, CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo("thread"), CONTEXT_DEBUG_STATE.isEqualTo("stopped"));

registerDebugViewMenuItem(MenuId.DebugCallStackContext, TERMINATE_THREAD_ID, localize(14347, null), 10, CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo("thread"), CONTEXT_TERMINATE_THREADS_SUPPORTED, "termination");

registerDebugViewMenuItem(MenuId.DebugCallStackContext, RESTART_FRAME_ID, localize(14330, null), 10, ContextKeyExpr.and(CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo("stackFrame"), CONTEXT_RESTART_FRAME_SUPPORTED), CONTEXT_STACK_FRAME_SUPPORTS_RESTART);

registerDebugViewMenuItem(MenuId.DebugCallStackContext, COPY_STACK_TRACE_ID, localize(14254, null), 20, CONTEXT_CALLSTACK_ITEM_TYPE.isEqualTo("stackFrame"), void 0, "3_modification");

registerDebugViewMenuItem(MenuId.DebugVariablesContext, VIEW_MEMORY_ID, localize(14350, null), 15, CONTEXT_CAN_VIEW_MEMORY, CONTEXT_IN_DEBUG_MODE, "inline", debugInspectMemory);

registerDebugViewMenuItem(MenuId.DebugVariablesContext, SET_VARIABLE_ID, localize(14335, null), 10, ContextKeyExpr.or(CONTEXT_SET_VARIABLE_SUPPORTED, ContextKeyExpr.and(CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT, CONTEXT_SET_EXPRESSION_SUPPORTED)), CONTEXT_VARIABLE_IS_READONLY.toNegated(), "3_modification");

registerDebugViewMenuItem(MenuId.DebugVariablesContext, COPY_VALUE_ID, COPY_VALUE_LABEL, 10, void 0, void 0, "5_cutcopypaste");

registerDebugViewMenuItem(MenuId.DebugVariablesContext, COPY_EVALUATE_PATH_ID, COPY_EVALUATE_PATH_LABEL, 20, CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT, void 0, "5_cutcopypaste");

registerDebugViewMenuItem(MenuId.DebugVariablesContext, ADD_TO_WATCH_ID, ADD_TO_WATCH_LABEL, 100, CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT, void 0, "z_commands");

registerDebugViewMenuItem(MenuId.DebugVariablesContext, BREAK_WHEN_VALUE_IS_READ_ID, localize(14250, null), 200, CONTEXT_BREAK_WHEN_VALUE_IS_READ_SUPPORTED, void 0, "z_commands");

registerDebugViewMenuItem(MenuId.DebugVariablesContext, BREAK_WHEN_VALUE_CHANGES_ID, localize(14248, null), 210, CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED, void 0, "z_commands");

registerDebugViewMenuItem(MenuId.DebugVariablesContext, BREAK_WHEN_VALUE_IS_ACCESSED_ID, localize(14249, null), 220, CONTEXT_BREAK_WHEN_VALUE_IS_ACCESSED_SUPPORTED, void 0, "z_commands");

registerDebugViewMenuItem(MenuId.DebugHoverContext, VIEW_MEMORY_ID, localize(14350, null), 15, CONTEXT_CAN_VIEW_MEMORY, CONTEXT_IN_DEBUG_MODE, "inline", debugInspectMemory);

registerDebugViewMenuItem(MenuId.DebugHoverContext, COPY_VALUE_ID, COPY_VALUE_LABEL, 10, void 0, void 0, "5_cutcopypaste");

registerDebugViewMenuItem(MenuId.DebugHoverContext, COPY_EVALUATE_PATH_ID, COPY_EVALUATE_PATH_LABEL, 20, CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT, void 0, "5_cutcopypaste");

registerDebugViewMenuItem(MenuId.DebugHoverContext, ADD_TO_WATCH_ID, ADD_TO_WATCH_LABEL, 100, CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT, void 0, "z_commands");

registerDebugViewMenuItem(MenuId.DebugHoverContext, BREAK_WHEN_VALUE_IS_READ_ID, localize(14250, null), 200, CONTEXT_BREAK_WHEN_VALUE_IS_READ_SUPPORTED, void 0, "z_commands");

registerDebugViewMenuItem(MenuId.DebugHoverContext, BREAK_WHEN_VALUE_CHANGES_ID, localize(14248, null), 210, CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED, void 0, "z_commands");

registerDebugViewMenuItem(MenuId.DebugHoverContext, BREAK_WHEN_VALUE_IS_ACCESSED_ID, localize(14249, null), 220, CONTEXT_BREAK_WHEN_VALUE_IS_ACCESSED_SUPPORTED, void 0, "z_commands");

registerDebugViewMenuItem(MenuId.DebugWatchContext, ADD_WATCH_ID, ADD_WATCH_LABEL, 10, void 0, void 0, "3_modification");

registerDebugViewMenuItem(MenuId.DebugWatchContext, EDIT_EXPRESSION_COMMAND_ID, localize(14298, null), 20, CONTEXT_WATCH_ITEM_TYPE.isEqualTo("expression"), void 0, "3_modification");

registerDebugViewMenuItem(MenuId.DebugWatchContext, SET_EXPRESSION_COMMAND_ID, localize(14335, null), 30, ContextKeyExpr.or(ContextKeyExpr.and(CONTEXT_WATCH_ITEM_TYPE.isEqualTo("expression"), CONTEXT_SET_EXPRESSION_SUPPORTED), ContextKeyExpr.and(CONTEXT_WATCH_ITEM_TYPE.isEqualTo("variable"), CONTEXT_SET_VARIABLE_SUPPORTED)), CONTEXT_VARIABLE_IS_READONLY.toNegated(), "3_modification");

registerDebugViewMenuItem(MenuId.DebugWatchContext, COPY_VALUE_ID, localize(14255, null), 40, ContextKeyExpr.or(CONTEXT_WATCH_ITEM_TYPE.isEqualTo("expression"), CONTEXT_WATCH_ITEM_TYPE.isEqualTo("variable")), CONTEXT_IN_DEBUG_MODE, "3_modification");

registerDebugViewMenuItem(MenuId.DebugWatchContext, COPY_EVALUATE_PATH_ID, COPY_EVALUATE_PATH_LABEL, 50, CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT, CONTEXT_IN_DEBUG_MODE, "3_modification");

registerDebugViewMenuItem(MenuId.DebugWatchContext, VIEW_MEMORY_ID, localize(14350, null), 10, CONTEXT_CAN_VIEW_MEMORY, void 0, "inline", debugInspectMemory);

registerDebugViewMenuItem(MenuId.DebugWatchContext, REMOVE_EXPRESSION_COMMAND_ID, localize(14329, null), 20, CONTEXT_WATCH_ITEM_TYPE.isEqualTo("expression"), void 0, "inline", watchExpressionRemove);

registerDebugViewMenuItem(MenuId.DebugWatchContext, REMOVE_WATCH_EXPRESSIONS_COMMAND_ID, REMOVE_WATCH_EXPRESSIONS_LABEL, 20, void 0, void 0, "z_commands");

registerDebugViewMenuItem(MenuId.DebugWatchContext, BREAK_WHEN_VALUE_IS_READ_ID, localize(14250, null), 200, CONTEXT_BREAK_WHEN_VALUE_IS_READ_SUPPORTED, void 0, "z_commands");

registerDebugViewMenuItem(MenuId.DebugWatchContext, BREAK_WHEN_VALUE_CHANGES_ID, localize(14248, null), 210, CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED, void 0, "z_commands");

registerDebugViewMenuItem(MenuId.DebugWatchContext, BREAK_WHEN_VALUE_IS_ACCESSED_ID, localize(14249, null), 220, CONTEXT_BREAK_WHEN_VALUE_IS_ACCESSED_SUPPORTED, void 0, "z_commands");

registerDebugViewMenuItem(MenuId.NotebookVariablesContext, COPY_NOTEBOOK_VARIABLE_VALUE_ID, COPY_NOTEBOOK_VARIABLE_VALUE_LABEL, 20, CONTEXT_VARIABLE_VALUE);

KeybindingsRegistry.registerKeybindingRule({
  id: COPY_VALUE_ID,
  weight: 200 /* WorkbenchContrib */,
  when: ContextKeyExpr.and(
    CONTEXT_EXPRESSION_SELECTED.negate(),
    ContextKeyExpr.or(
      FocusedViewContext.isEqualTo(WATCH_VIEW_ID),
      FocusedViewContext.isEqualTo(VARIABLES_VIEW_ID)
    )
  ),
  primary: 2048 /* CtrlCmd */ | 33 /* KeyC */
});

if (isMacintosh) {
  const registerTouchBarEntry = (id2, title, order, when, iconUri) => {
    MenuRegistry.appendMenuItem(MenuId.TouchBarContext, {
      command: {
        id: id2,
        title,
        icon: { dark: iconUri }
      },
      when: ContextKeyExpr.and(CONTEXT_DEBUGGERS_AVAILABLE, when),
      group: "9_debug",
      order
    });
  };
  registerTouchBarEntry(DEBUG_RUN_COMMAND_ID, DEBUG_RUN_LABEL, 0, CONTEXT_IN_DEBUG_MODE.toNegated(), FileAccess.asFileUri("vs/workbench/contrib/debug/browser/media/continue-tb.png"));
  registerTouchBarEntry(DEBUG_START_COMMAND_ID, DEBUG_START_LABEL, 1, CONTEXT_IN_DEBUG_MODE.toNegated(), FileAccess.asFileUri("vs/workbench/contrib/debug/browser/media/run-with-debugging-tb.png"));
  registerTouchBarEntry(CONTINUE_ID, CONTINUE_LABEL, 0, CONTEXT_DEBUG_STATE.isEqualTo("stopped"), FileAccess.asFileUri("vs/workbench/contrib/debug/browser/media/continue-tb.png"));
  registerTouchBarEntry(PAUSE_ID, PAUSE_LABEL, 1, ContextKeyExpr.and(CONTEXT_IN_DEBUG_MODE, ContextKeyExpr.and(CONTEXT_DEBUG_STATE.isEqualTo("running"), CONTEXT_FOCUSED_SESSION_IS_NO_DEBUG.toNegated())), FileAccess.asFileUri("vs/workbench/contrib/debug/browser/media/pause-tb.png"));
  registerTouchBarEntry(STEP_OVER_ID, STEP_OVER_LABEL, 2, CONTEXT_IN_DEBUG_MODE, FileAccess.asFileUri("vs/workbench/contrib/debug/browser/media/stepover-tb.png"));
  registerTouchBarEntry(STEP_INTO_ID, STEP_INTO_LABEL, 3, CONTEXT_IN_DEBUG_MODE, FileAccess.asFileUri("vs/workbench/contrib/debug/browser/media/stepinto-tb.png"));
  registerTouchBarEntry(STEP_OUT_ID, STEP_OUT_LABEL, 4, CONTEXT_IN_DEBUG_MODE, FileAccess.asFileUri("vs/workbench/contrib/debug/browser/media/stepout-tb.png"));
  registerTouchBarEntry(RESTART_SESSION_ID, RESTART_LABEL, 5, CONTEXT_IN_DEBUG_MODE, FileAccess.asFileUri("vs/workbench/contrib/debug/browser/media/restart-tb.png"));
  registerTouchBarEntry(STOP_ID, STOP_LABEL, 6, CONTEXT_IN_DEBUG_MODE, FileAccess.asFileUri("vs/workbench/contrib/debug/browser/media/stop-tb.png"));
}

MenuRegistry.appendMenuItem(MenuId.EditorTitle, { submenu: MenuId.EditorTitleRun, isSplitButton: { togglePrimaryAction: true }, title: localize2(14331, "Run or Debug..."), icon: debugRun, group: "navigation", order: -1 });

MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
  submenu: MenuId.MenubarDebugMenu,
  title: {
    ...localize2(14333, "Run"),
    mnemonicTitle: localize(14323, null)
  },
  order: 6,
  when: IsSessionsWindowContext.negate()
});

MenuRegistry.appendMenuItem(MenuId.MenubarDebugMenu, {
  group: "1_debug",
  command: {
    id: DEBUG_START_COMMAND_ID,
    title: localize(14315, null)
  },
  order: 1,
  when: CONTEXT_DEBUGGERS_AVAILABLE
});

MenuRegistry.appendMenuItem(MenuId.MenubarDebugMenu, {
  group: "1_debug",
  command: {
    id: DEBUG_RUN_COMMAND_ID,
    title: localize(14314, null)
  },
  order: 2,
  when: CONTEXT_DEBUGGERS_AVAILABLE
});

MenuRegistry.appendMenuItem(MenuId.MenubarDebugMenu, {
  group: "1_debug",
  command: {
    id: STOP_ID,
    title: localize(14319, null),
    precondition: CONTEXT_IN_DEBUG_MODE
  },
  order: 3,
  when: CONTEXT_DEBUGGERS_AVAILABLE
});

MenuRegistry.appendMenuItem(MenuId.MenubarDebugMenu, {
  group: "1_debug",
  command: {
    id: RESTART_SESSION_ID,
    title: localize(14313, null),
    precondition: CONTEXT_IN_DEBUG_MODE
  },
  order: 4,
  when: CONTEXT_DEBUGGERS_AVAILABLE
});

MenuRegistry.appendMenuItem(MenuId.MenubarDebugMenu, {
  group: "2_configuration",
  command: {
    id: ADD_CONFIGURATION_ID,
    title: localize(14308, null)
  },
  order: 2,
  when: CONTEXT_DEBUGGERS_AVAILABLE
});

MenuRegistry.appendMenuItem(MenuId.MenubarDebugMenu, {
  group: "3_step",
  command: {
    id: STEP_OVER_ID,
    title: localize(14318, null),
    precondition: CONTEXT_DEBUG_STATE.isEqualTo("stopped")
  },
  order: 1,
  when: CONTEXT_DEBUGGERS_AVAILABLE
});

MenuRegistry.appendMenuItem(MenuId.MenubarDebugMenu, {
  group: "3_step",
  command: {
    id: STEP_INTO_ID,
    title: localize(14316, null),
    precondition: CONTEXT_DEBUG_STATE.isEqualTo("stopped")
  },
  order: 2,
  when: CONTEXT_DEBUGGERS_AVAILABLE
});

MenuRegistry.appendMenuItem(MenuId.MenubarDebugMenu, {
  group: "3_step",
  command: {
    id: STEP_OUT_ID,
    title: localize(14317, null),
    precondition: CONTEXT_DEBUG_STATE.isEqualTo("stopped")
  },
  order: 3,
  when: CONTEXT_DEBUGGERS_AVAILABLE
});

MenuRegistry.appendMenuItem(MenuId.MenubarDebugMenu, {
  group: "3_step",
  command: {
    id: CONTINUE_ID,
    title: localize(14309, null),
    precondition: CONTEXT_DEBUG_STATE.isEqualTo("stopped")
  },
  order: 4,
  when: CONTEXT_DEBUGGERS_AVAILABLE
});

MenuRegistry.appendMenuItem(MenuId.MenubarNewBreakpointMenu, {
  group: "1_breakpoints",
  command: {
    id: TOGGLE_INLINE_BREAKPOINT_ID,
    title: localize(14310, null)
  },
  order: 2,
  when: CONTEXT_DEBUGGERS_AVAILABLE
});

MenuRegistry.appendMenuItem(MenuId.MenubarDebugMenu, {
  group: "4_new_breakpoint",
  title: localize(14312, null),
  submenu: MenuId.MenubarNewBreakpointMenu,
  order: 2,
  when: CONTEXT_DEBUGGERS_AVAILABLE
});

MenuRegistry.appendMenuItem(MenuId.DebugDisassemblyContext, {
  group: "1_edit",
  command: {
    id: COPY_ADDRESS_ID,
    title: COPY_ADDRESS_LABEL
  },
  order: 2,
  when: CONTEXT_DEBUGGERS_AVAILABLE
});

MenuRegistry.appendMenuItem(MenuId.DebugDisassemblyContext, {
  group: "3_breakpoints",
  command: {
    id: TOGGLE_BREAKPOINT_ID,
    title: localize(14320, null)
  },
  order: 2,
  when: CONTEXT_DEBUGGERS_AVAILABLE
});

MenuRegistry.appendMenuItem(MenuId.MenubarDebugMenu, {
  group: "z_install",
  command: {
    id: "debug.installAdditionalDebuggers",
    title: localize(14311, null)
  },
  order: 1
});

var VIEW_CONTAINER3 = Registry.as(Extensions13.ViewContainersRegistry).registerViewContainer({
  id: DEBUG_PANEL_ID,
  title: localize2(14292, "Debug Console"),
  icon: debugConsoleViewIcon,
  ctorDescriptor: new SyncDescriptor(ViewPaneContainer, [DEBUG_PANEL_ID, { mergeViewWithContainerWhenSingleView: true }]),
  storageId: DEBUG_PANEL_ID,
  hideIfEmpty: true,
  order: 2
}, 1 /* Panel */, { doNotRegisterOpenCommand: true });

Registry.as(Extensions13.ViewsRegistry).registerViews([{
  id: REPL_VIEW_ID,
  name: localize2(14292, "Debug Console"),
  containerIcon: debugConsoleViewIcon,
  canToggleVisibility: true,
  canMoveView: true,
  when: CONTEXT_DEBUGGERS_AVAILABLE,
  ctorDescriptor: new SyncDescriptor(Repl),
  openCommandActionDescriptor: {
    id: "workbench.debug.action.toggleRepl",
    mnemonicTitle: localize(14321, null),
    keybindings: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 55 /* KeyY */ },
    order: 2
  }
}], VIEW_CONTAINER3);

var viewContainer4 = Registry.as(Extensions13.ViewContainersRegistry).registerViewContainer({
  id: VIEWLET_ID3,
  title: localize2(14332, "Run and Debug"),
  openCommandActionDescriptor: {
    id: VIEWLET_ID3,
    mnemonicTitle: localize(14322, null),
    keybindings: { primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 34 /* KeyD */ },
    order: 3
  },
  ctorDescriptor: new SyncDescriptor(DebugViewPaneContainer),
  icon: runViewIcon,
  alwaysUseContainerInfo: true,
  order: 3
}, 0 /* Sidebar */);

var viewsRegistry7 = Registry.as(Extensions13.ViewsRegistry);

viewsRegistry7.registerViews([{ id: VARIABLES_VIEW_ID, name: localize2(14349, "Variables"), containerIcon: variablesViewIcon2, ctorDescriptor: new SyncDescriptor(VariablesView), order: 10, weight: 40, canToggleVisibility: true, canMoveView: true, focusCommand: { id: "workbench.debug.action.focusVariablesView" }, when: CONTEXT_DEBUG_UX.isEqualTo("default") }], viewContainer4);

viewsRegistry7.registerViews([{ id: WATCH_VIEW_ID, name: localize2(14351, "Watch"), containerIcon: watchViewIcon, ctorDescriptor: new SyncDescriptor(WatchExpressionsView), order: 20, weight: 10, canToggleVisibility: true, canMoveView: true, focusCommand: { id: "workbench.debug.action.focusWatchView" }, when: CONTEXT_DEBUG_UX.isEqualTo("default") }], viewContainer4);

viewsRegistry7.registerViews([{ id: CALLSTACK_VIEW_ID, name: localize2(14251, "Call Stack"), containerIcon: callStackViewIcon, ctorDescriptor: new SyncDescriptor(CallStackView), order: 30, weight: 30, canToggleVisibility: true, canMoveView: true, focusCommand: { id: "workbench.debug.action.focusCallStackView" }, when: CONTEXT_DEBUG_UX.isEqualTo("default") }], viewContainer4);

viewsRegistry7.registerViews([{ id: BREAKPOINTS_VIEW_ID, name: localize2(14247, "Breakpoints"), containerIcon: breakpointsViewIcon, ctorDescriptor: new SyncDescriptor(BreakpointsView), order: 40, weight: 20, canToggleVisibility: true, canMoveView: true, focusCommand: { id: "workbench.debug.action.focusBreakpointsView" }, when: ContextKeyExpr.or(CONTEXT_BREAKPOINTS_EXIST, CONTEXT_DEBUG_UX.isEqualTo("default"), CONTEXT_HAS_DEBUGGED) }], viewContainer4);

viewsRegistry7.registerViews([{ id: WelcomeView.ID, name: WelcomeView.LABEL, containerIcon: runViewIcon, ctorDescriptor: new SyncDescriptor(WelcomeView), order: 1, weight: 40, canToggleVisibility: true, when: CONTEXT_DEBUG_UX.isEqualTo("simple") }], viewContainer4);

viewsRegistry7.registerViews([{ id: LOADED_SCRIPTS_VIEW_ID, name: localize2(14307, "Loaded Scripts"), containerIcon: loadedScriptsViewIcon, ctorDescriptor: new SyncDescriptor(LoadedScriptsView), order: 35, weight: 5, canToggleVisibility: true, canMoveView: true, collapsed: true, when: ContextKeyExpr.and(CONTEXT_LOADED_SCRIPTS_SUPPORTED, CONTEXT_DEBUG_UX.isEqualTo("default")) }], viewContainer4);

Registry.as(EditorExtensions.EditorPane).registerEditorPane(
  EditorPaneDescriptor.create(DisassemblyView, DISASSEMBLY_VIEW_ID, localize(14297, null)),
  [new SyncDescriptor(DisassemblyViewInput)]
);

var configurationRegistry17 = Registry.as(Extensions4.Configuration);

configurationRegistry17.registerConfiguration({
  id: "debug",
  order: 20,
  title: localize(14291, null),
  type: "object",
  properties: {
    "debug.showVariableTypes": {
      type: "boolean",
      description: localize(14341, null),
      default: false
    },
    "debug.allowBreakpointsEverywhere": {
      type: "boolean",
      description: localize(14245, null),
      default: false
    },
    "debug.gutterMiddleClickAction": {
      type: "string",
      enum: ["logpoint", "conditionalBreakpoint", "triggeredBreakpoint", "none"],
      description: localize(14299, null),
      enumDescriptions: [
        localize(14278, null),
        localize(14277, null),
        localize(14280, null),
        localize(14279, null)
      ],
      default: "logpoint"
    },
    "debug.openExplorerOnEnd": {
      type: "boolean",
      description: localize(14327, null),
      default: false
    },
    "debug.closeReadonlyTabsOnEnd": {
      type: "boolean",
      description: localize(14253, null),
      default: false
    },
    "debug.inlineValues": {
      type: "string",
      "enum": ["on", "off", "auto"],
      description: localize(14301, null),
      "enumDescriptions": [
        localize(14304, null),
        localize(14303, null),
        localize(14302, null)
      ],
      default: "auto"
    },
    "debug.toolBarLocation": {
      enum: ["floating", "docked", "commandCenter", "hidden"],
      markdownDescription: localize(14348, null, "`#window.commandCenter#`"),
      default: "floating",
      markdownEnumDescriptions: [
        localize(14295, null),
        localize(14294, null),
        localize(14293, null),
        localize(14296, null)
      ]
    },
    "debug.showInStatusBar": {
      enum: ["never", "always", "onFirstSessionStart"],
      enumDescriptions: [localize(14324, null), localize(14246, null), localize(14325, null)],
      description: localize(14339, null),
      default: "onFirstSessionStart"
    },
    "debug.internalConsoleOptions": INTERNAL_CONSOLE_OPTIONS_SCHEMA,
    "debug.console.closeOnEnd": {
      type: "boolean",
      description: localize(14265, null),
      default: false
    },
    "debug.terminal.clearBeforeReusing": {
      type: "boolean",
      description: localize(14288, null),
      default: false
    },
    "debug.openDebug": {
      enum: ["neverOpen", "openOnSessionStart", "openOnFirstSessionStart", "openOnDebugBreak"],
      default: "openOnDebugBreak",
      description: localize(14326, null)
    },
    "debug.showSubSessionsInToolBar": {
      type: "boolean",
      description: localize(14340, null),
      default: false
    },
    "debug.console.fontSize": {
      type: "number",
      description: localize(14268, null),
      default: isMacintosh ? 12 : 14
    },
    "debug.console.fontFamily": {
      type: "string",
      description: localize(14267, null),
      default: "default"
    },
    "debug.console.lineHeight": {
      type: "number",
      description: localize(14270, null),
      default: 0
    },
    "debug.console.wordWrap": {
      type: "boolean",
      description: localize(14272, null),
      default: true
    },
    "debug.console.historySuggestions": {
      type: "boolean",
      description: localize(14269, null),
      default: true
    },
    "debug.console.collapseIdenticalLines": {
      type: "boolean",
      description: localize(14266, null),
      default: true
    },
    "debug.console.acceptSuggestionOnEnter": {
      enum: ["off", "on"],
      description: localize(14264, null),
      default: "off"
    },
    "debug.console.maximumLines": {
      type: "number",
      description: localize(14271, null),
      default: 1e4
    },
    "launch": {
      type: "object",
      description: localize(14306, null),
      default: { configurations: [], compounds: [] },
      $ref: launchSchemaId,
      disallowConfigurationDefault: true
    },
    "debug.focusWindowOnBreak": {
      type: "boolean",
      description: localize(14276, null),
      default: true
    },
    "debug.focusEditorOnBreak": {
      type: "boolean",
      description: localize(14275, null),
      default: true
    },
    "debug.onTaskErrors": {
      enum: ["debugAnyway", "showErrors", "prompt", "abort"],
      enumDescriptions: [localize(14289, null), localize(14337, null), localize(14328, null), localize(14252, null)],
      description: localize(14283, null),
      default: "prompt"
    },
    "debug.showBreakpointsInOverviewRuler": {
      type: "boolean",
      description: localize(14336, null),
      default: false
    },
    "debug.breakpointsView.presentation": {
      type: "string",
      description: localize(14260, null),
      enum: ["tree", "list"],
      default: "list"
    },
    "debug.showInlineBreakpointCandidates": {
      type: "boolean",
      description: localize(14338, null),
      default: true
    },
    "debug.saveBeforeStart": {
      description: localize(14284, null),
      enum: ["allEditorsInActiveGroup", "nonUntitledEditorsInActiveGroup", "none"],
      enumDescriptions: [
        localize(14285, null),
        localize(14287, null),
        localize(14286, null)
      ],
      default: "allEditorsInActiveGroup",
      scope: 6 /* LANGUAGE_OVERRIDABLE */
    },
    "debug.confirmOnExit": {
      description: localize(14261, null),
      type: "string",
      enum: ["never", "always"],
      enumDescriptions: [
        localize(14263, null),
        localize(14262, null)
      ],
      default: "never"
    },
    "debug.disassemblyView.showSourceCode": {
      type: "boolean",
      default: true,
      description: localize(14273, null)
    },
    "debug.autoExpandLazyVariables": {
      type: "string",
      enum: ["auto", "on", "off"],
      default: "auto",
      enumDescriptions: [
        localize(14257, null),
        localize(14259, null),
        localize(14258, null)
      ],
      description: localize(14256, null)
    },
    "debug.enableStatusBarColor": {
      type: "boolean",
      description: localize(14274, null),
      default: true
    },
    "debug.hideLauncherWhileDebugging": {
      type: "boolean",
      markdownDescription: localize(14281, null, "`#debug.toolBarLocation#`"),
      default: false
    },
    "debug.hideSlowPreLaunchWarning": {
      type: "boolean",
      markdownDescription: localize(14282, null),
      default: false
    }
  }
});

AccessibleViewRegistry.register(new ReplAccessibleView());

AccessibleViewRegistry.register(new ReplAccessibilityHelp());

AccessibleViewRegistry.register(new RunAndDebugAccessibilityHelp());

registerWorkbenchContribution2(ReplAccessibilityAnnouncer.ID, ReplAccessibilityAnnouncer, WorkbenchPhase.AfterRestored);

registerWorkbenchContribution2(DebugWatchAccessibilityAnnouncer.ID, DebugWatchAccessibilityAnnouncer, WorkbenchPhase.AfterRestored);
export { debugCategory, registerDebugCommandPaletteItem, registerDebugViewMenuItem, VIEW_CONTAINER3, viewContainer4, viewsRegistry7, configurationRegistry17 };
