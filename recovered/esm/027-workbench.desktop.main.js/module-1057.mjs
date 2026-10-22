// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/common/debug.ts
import { RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { createDecorator } from "./module-0077.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/workbench/contrib/debug/common/debug.ts
var VIEWLET_ID3 = "workbench.view.debug";

var VARIABLES_VIEW_ID = "workbench.debug.variablesView";

var WATCH_VIEW_ID = "workbench.debug.watchExpressionsView";

var CALLSTACK_VIEW_ID = "workbench.debug.callStackView";

var LOADED_SCRIPTS_VIEW_ID = "workbench.debug.loadedScriptsView";

var BREAKPOINTS_VIEW_ID = "workbench.debug.breakPointsView";

var DISASSEMBLY_VIEW_ID = "workbench.debug.disassemblyView";

var DEBUG_PANEL_ID = "workbench.panel.repl";

var REPL_VIEW_ID = "workbench.panel.repl.view";

var CONTEXT_DEBUG_TYPE = new RawContextKey("debugType", void 0, { type: "string", description: localize(14756, null) });

var CONTEXT_DEBUG_CONFIGURATION_TYPE = new RawContextKey("debugConfigurationType", void 0, { type: "string", description: localize(14747, null) });

var CONTEXT_DEBUG_STATE = new RawContextKey("debugState", "inactive", { type: "string", description: localize(14755, null) });

var CONTEXT_DEBUG_UX_KEY = "debugUx";

var CONTEXT_DEBUG_UX = new RawContextKey(CONTEXT_DEBUG_UX_KEY, "default", { type: "string", description: localize(14757, null) });

var CONTEXT_HAS_DEBUGGED = new RawContextKey("hasDebugged", false, { type: "boolean", description: localize(14765, null) });

var CONTEXT_IN_DEBUG_MODE = new RawContextKey("inDebugMode", false, { type: "boolean", description: localize(14767, null) });

var CONTEXT_IN_DEBUG_REPL = new RawContextKey("inDebugRepl", false, { type: "boolean", description: localize(14768, null) });

var CONTEXT_BREAKPOINT_WIDGET_VISIBLE = new RawContextKey("breakpointWidgetVisible", false, { type: "boolean", description: localize(14737, null) });

var CONTEXT_IN_BREAKPOINT_WIDGET = new RawContextKey("inBreakpointWidget", false, { type: "boolean", description: localize(14766, null) });

var CONTEXT_BREAKPOINTS_FOCUSED = new RawContextKey("breakpointsFocused", true, { type: "boolean", description: localize(14735, null) });

var CONTEXT_WATCH_EXPRESSIONS_FOCUSED = new RawContextKey("watchExpressionsFocused", true, { type: "boolean", description: localize(14793, null) });

var CONTEXT_WATCH_EXPRESSIONS_EXIST = new RawContextKey("watchExpressionsExist", false, { type: "boolean", description: localize(14792, null) });

var CONTEXT_VARIABLES_FOCUSED = new RawContextKey("variablesFocused", true, { type: "boolean", description: localize(14789, null) });

var CONTEXT_EXPRESSION_SELECTED = new RawContextKey("expressionSelected", false, { type: "boolean", description: localize(14761, null) });

var CONTEXT_BREAKPOINT_INPUT_FOCUSED = new RawContextKey("breakpointInputFocused", false, { type: "boolean", description: localize(14731, null) });

var CONTEXT_CALLSTACK_ITEM_TYPE = new RawContextKey("callStackItemType", void 0, { type: "string", description: localize(14743, null) });

var CONTEXT_CALLSTACK_SESSION_IS_ATTACH = new RawContextKey("callStackSessionIsAttach", false, { type: "boolean", description: localize(14745, null) });

var CONTEXT_CALLSTACK_ITEM_STOPPED = new RawContextKey("callStackItemStopped", false, { type: "boolean", description: localize(14742, null) });

var CONTEXT_CALLSTACK_SESSION_HAS_ONE_THREAD = new RawContextKey("callStackSessionHasOneThread", false, { type: "boolean", description: localize(14744, null) });

var CONTEXT_CALLSTACK_FOCUSED = new RawContextKey("callStackFocused", true, { type: "boolean", description: localize(14741, null) });

var CONTEXT_WATCH_ITEM_TYPE = new RawContextKey("watchItemType", void 0, { type: "string", description: localize(14794, null) });

var CONTEXT_CAN_VIEW_MEMORY = new RawContextKey("canViewMemory", void 0, { type: "boolean", description: localize(14746, null) });

var CONTEXT_BREAKPOINT_ITEM_TYPE = new RawContextKey("breakpointItemType", void 0, { type: "string", description: localize(14733, null) });

var CONTEXT_BREAKPOINT_ITEM_IS_DATA_BYTES = new RawContextKey("breakpointItemBytes", void 0, { type: "boolean", description: localize(14732, null) });

var CONTEXT_BREAKPOINT_HAS_MODES = new RawContextKey("breakpointHasModes", false, { type: "boolean", description: localize(14730, null) });

var CONTEXT_BREAKPOINT_SUPPORTS_CONDITION = new RawContextKey("breakpointSupportsCondition", false, { type: "boolean", description: localize(14736, null) });

var CONTEXT_LOADED_SCRIPTS_SUPPORTED = new RawContextKey("loadedScriptsSupported", false, { type: "boolean", description: localize(14773, null) });

var CONTEXT_LOADED_SCRIPTS_ITEM_TYPE = new RawContextKey("loadedScriptsItemType", void 0, { type: "string", description: localize(14772, null) });

var CONTEXT_FOCUSED_SESSION_IS_ATTACH = new RawContextKey("focusedSessionIsAttach", false, { type: "boolean", description: localize(14762, null) });

var CONTEXT_FOCUSED_SESSION_IS_NO_DEBUG = new RawContextKey("focusedSessionIsNoDebug", false, { type: "boolean", description: localize(14763, null) });

var CONTEXT_STEP_BACK_SUPPORTED = new RawContextKey("stepBackSupported", false, { type: "boolean", description: localize(14778, null) });

var CONTEXT_RESTART_FRAME_SUPPORTED = new RawContextKey("restartFrameSupported", false, { type: "boolean", description: localize(14776, null) });

var CONTEXT_STACK_FRAME_SUPPORTS_RESTART = new RawContextKey("stackFrameSupportsRestart", false, { type: "boolean", description: localize(14777, null) });

var CONTEXT_JUMP_TO_CURSOR_SUPPORTED = new RawContextKey("jumpToCursorSupported", false, { type: "boolean", description: localize(14770, null) });

var CONTEXT_STEP_INTO_TARGETS_SUPPORTED = new RawContextKey("stepIntoTargetsSupported", false, { type: "boolean", description: localize(14779, null) });

var CONTEXT_BREAKPOINTS_EXIST = new RawContextKey("breakpointsExist", false, { type: "boolean", description: localize(14734, null) });

var CONTEXT_DEBUGGERS_AVAILABLE = new RawContextKey("debuggersAvailable", false, { type: "boolean", description: localize(14750, null) });

var CONTEXT_DEBUG_EXTENSION_AVAILABLE = new RawContextKey("debugExtensionAvailable", true, { type: "boolean", description: localize(14748, null) });

var CONTEXT_DEBUG_PROTOCOL_VARIABLE_MENU_CONTEXT = new RawContextKey("debugProtocolVariableMenuContext", void 0, { type: "string", description: localize(14751, null) });

var CONTEXT_SET_VARIABLE_SUPPORTED = new RawContextKey("debugSetVariableSupported", false, { type: "boolean", description: localize(14754, null) });

var CONTEXT_SET_DATA_BREAKPOINT_BYTES_SUPPORTED = new RawContextKey("debugSetDataBreakpointAddressSupported", false, { type: "boolean", description: localize(14752, null) });

var CONTEXT_SET_EXPRESSION_SUPPORTED = new RawContextKey("debugSetExpressionSupported", false, { type: "boolean", description: localize(14753, null) });

var CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED = new RawContextKey("breakWhenValueChangesSupported", false, { type: "boolean", description: localize(14738, null) });

var CONTEXT_BREAK_WHEN_VALUE_IS_ACCESSED_SUPPORTED = new RawContextKey("breakWhenValueIsAccessedSupported", false, { type: "boolean", description: localize(14739, null) });

var CONTEXT_BREAK_WHEN_VALUE_IS_READ_SUPPORTED = new RawContextKey("breakWhenValueIsReadSupported", false, { type: "boolean", description: localize(14740, null) });

var CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED = new RawContextKey("terminateDebuggeeSupported", false, { type: "boolean", description: localize(14781, null) });

var CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED = new RawContextKey("suspendDebuggeeSupported", false, { type: "boolean", description: localize(14780, null) });

var CONTEXT_TERMINATE_THREADS_SUPPORTED = new RawContextKey("terminateThreadsSupported", false, { type: "boolean", description: localize(14782, null) });

var CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT = new RawContextKey("variableEvaluateNamePresent", false, { type: "boolean", description: localize(14783, null) });

var CONTEXT_VARIABLE_IS_READONLY = new RawContextKey("variableIsReadonly", false, { type: "boolean", description: localize(14786, null) });

var CONTEXT_VARIABLE_VALUE = new RawContextKey("variableValue", false, { type: "string", description: localize(14791, null) });

var CONTEXT_VARIABLE_TYPE = new RawContextKey("variableType", false, { type: "string", description: localize(14790, null) });

var CONTEXT_VARIABLE_INTERFACES = new RawContextKey("variableInterfaces", false, { type: "array", description: localize(14785, null) });

var CONTEXT_VARIABLE_NAME = new RawContextKey("variableName", false, { type: "string", description: localize(14788, null) });

var CONTEXT_VARIABLE_LANGUAGE = new RawContextKey("variableLanguage", false, { type: "string", description: localize(14787, null) });

var CONTEXT_VARIABLE_EXTENSIONID = new RawContextKey("variableExtensionId", false, { type: "string", description: localize(14784, null) });

var CONTEXT_EXCEPTION_WIDGET_VISIBLE = new RawContextKey("exceptionWidgetVisible", false, { type: "boolean", description: localize(14760, null) });

var CONTEXT_MULTI_SESSION_REPL = new RawContextKey("multiSessionRepl", false, { type: "boolean", description: localize(14775, null) });

var CONTEXT_MULTI_SESSION_DEBUG = new RawContextKey("multiSessionDebug", false, { type: "boolean", description: localize(14774, null) });

var CONTEXT_DISASSEMBLE_REQUEST_SUPPORTED = new RawContextKey("disassembleRequestSupported", false, { type: "boolean", description: localize(14758, null) });

var CONTEXT_DISASSEMBLY_VIEW_FOCUS = new RawContextKey("disassemblyViewFocus", false, { type: "boolean", description: localize(14759, null) });

var CONTEXT_LANGUAGE_SUPPORTS_DISASSEMBLE_REQUEST = new RawContextKey("languageSupportsDisassembleRequest", false, { type: "boolean", description: localize(14771, null) });

var CONTEXT_FOCUSED_STACK_FRAME_HAS_INSTRUCTION_POINTER_REFERENCE = new RawContextKey("focusedStackFrameHasInstructionReference", false, { type: "boolean", description: localize(14764, null) });

var debuggerDisabledMessage = (debugType) => localize(14749, null, debugType);

var EDITOR_CONTRIBUTION_ID = "editor.contrib.debug";

var BREAKPOINT_EDITOR_CONTRIBUTION_ID = "editor.contrib.breakpoint";

var DEBUG_SCHEME = "debug";

var INTERNAL_CONSOLE_OPTIONS_SCHEMA = {
  enum: ["neverOpen", "openOnSessionStart", "openOnFirstSessionStart"],
  default: "openOnFirstSessionStart",
  description: localize(14769, null)
};

function getStateLabel(state) {
  switch (state) {
    case 1 /* Initializing */:
      return "initializing";
    case 2 /* Stopped */:
      return "stopped";
    case 3 /* Running */:
      return "running";
    default:
      return "inactive";
  }
}

var DEBUG_MEMORY_SCHEME = "vscode-debug-memory";

function isFrameDeemphasized(frame) {
  const hint = frame.presentationHint ?? frame.source.presentationHint;
  return hint === "deemphasize" || hint === "subtle";
}

function isDebugConfig(thing) {
  return "type" in thing && "request" in thing;
}

var IDebugService = createDecorator("debugService");

var IDebugVisualizationTreeItem;

((IDebugVisualizationTreeItem5) => {
  IDebugVisualizationTreeItem5.deserialize = (v2) => v2;
  IDebugVisualizationTreeItem5.serialize = (item) => item;
})(IDebugVisualizationTreeItem || (IDebugVisualizationTreeItem = {}));

var IDebugVisualization;

((IDebugVisualization3) => {
  IDebugVisualization3.deserialize = (v2) => ({
    id: v2.id,
    name: v2.name,
    iconPath: v2.iconPath && { light: URI.revive(v2.iconPath.light), dark: URI.revive(v2.iconPath.dark) },
    iconClass: v2.iconClass,
    visualization: v2.visualization
  });
  IDebugVisualization3.serialize = (visualizer) => visualizer;
})(IDebugVisualization || (IDebugVisualization = {}));
export { getStateLabel, isFrameDeemphasized, isDebugConfig, VIEWLET_ID3, VARIABLES_VIEW_ID, WATCH_VIEW_ID, CALLSTACK_VIEW_ID, LOADED_SCRIPTS_VIEW_ID, BREAKPOINTS_VIEW_ID, DISASSEMBLY_VIEW_ID, DEBUG_PANEL_ID, REPL_VIEW_ID, CONTEXT_DEBUG_TYPE, CONTEXT_DEBUG_CONFIGURATION_TYPE, CONTEXT_DEBUG_STATE, CONTEXT_DEBUG_UX_KEY, CONTEXT_DEBUG_UX, CONTEXT_HAS_DEBUGGED, CONTEXT_IN_DEBUG_MODE, CONTEXT_IN_DEBUG_REPL, CONTEXT_BREAKPOINT_WIDGET_VISIBLE, CONTEXT_IN_BREAKPOINT_WIDGET, CONTEXT_BREAKPOINTS_FOCUSED, CONTEXT_WATCH_EXPRESSIONS_FOCUSED, CONTEXT_WATCH_EXPRESSIONS_EXIST, CONTEXT_VARIABLES_FOCUSED, CONTEXT_EXPRESSION_SELECTED, CONTEXT_BREAKPOINT_INPUT_FOCUSED, CONTEXT_CALLSTACK_ITEM_TYPE, CONTEXT_CALLSTACK_SESSION_IS_ATTACH, CONTEXT_CALLSTACK_ITEM_STOPPED, CONTEXT_CALLSTACK_SESSION_HAS_ONE_THREAD, CONTEXT_CALLSTACK_FOCUSED, CONTEXT_WATCH_ITEM_TYPE, CONTEXT_CAN_VIEW_MEMORY, CONTEXT_BREAKPOINT_ITEM_TYPE, CONTEXT_BREAKPOINT_ITEM_IS_DATA_BYTES, CONTEXT_BREAKPOINT_HAS_MODES, CONTEXT_BREAKPOINT_SUPPORTS_CONDITION, CONTEXT_LOADED_SCRIPTS_SUPPORTED, CONTEXT_LOADED_SCRIPTS_ITEM_TYPE, CONTEXT_FOCUSED_SESSION_IS_ATTACH, CONTEXT_FOCUSED_SESSION_IS_NO_DEBUG, CONTEXT_STEP_BACK_SUPPORTED, CONTEXT_RESTART_FRAME_SUPPORTED, CONTEXT_STACK_FRAME_SUPPORTS_RESTART, CONTEXT_JUMP_TO_CURSOR_SUPPORTED, CONTEXT_STEP_INTO_TARGETS_SUPPORTED, CONTEXT_BREAKPOINTS_EXIST, CONTEXT_DEBUGGERS_AVAILABLE, CONTEXT_DEBUG_EXTENSION_AVAILABLE, CONTEXT_DEBUG_PROTOCOL_VARIABLE_MENU_CONTEXT, CONTEXT_SET_VARIABLE_SUPPORTED, CONTEXT_SET_DATA_BREAKPOINT_BYTES_SUPPORTED, CONTEXT_SET_EXPRESSION_SUPPORTED, CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED, CONTEXT_BREAK_WHEN_VALUE_IS_ACCESSED_SUPPORTED, CONTEXT_BREAK_WHEN_VALUE_IS_READ_SUPPORTED, CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED, CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED, CONTEXT_TERMINATE_THREADS_SUPPORTED, CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT, CONTEXT_VARIABLE_IS_READONLY, CONTEXT_VARIABLE_VALUE, CONTEXT_VARIABLE_TYPE, CONTEXT_VARIABLE_INTERFACES, CONTEXT_VARIABLE_NAME, CONTEXT_VARIABLE_LANGUAGE, CONTEXT_VARIABLE_EXTENSIONID, CONTEXT_EXCEPTION_WIDGET_VISIBLE, CONTEXT_MULTI_SESSION_REPL, CONTEXT_MULTI_SESSION_DEBUG, CONTEXT_DISASSEMBLE_REQUEST_SUPPORTED, CONTEXT_DISASSEMBLY_VIEW_FOCUS, CONTEXT_LANGUAGE_SUPPORTS_DISASSEMBLE_REQUEST, CONTEXT_FOCUSED_STACK_FRAME_HAS_INSTRUCTION_POINTER_REFERENCE, debuggerDisabledMessage, EDITOR_CONTRIBUTION_ID, BREAKPOINT_EDITOR_CONTRIBUTION_ID, DEBUG_SCHEME, INTERNAL_CONSOLE_OPTIONS_SCHEMA, DEBUG_MEMORY_SCHEME, IDebugService, IDebugVisualizationTreeItem, IDebugVisualization };
