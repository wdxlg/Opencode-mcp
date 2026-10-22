// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/debugIcons.ts
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/debug/browser/debugIcons.ts
var debugConsoleViewIcon = registerIcon("debug-console-view-icon", Codicon.debugConsole, localize(14499, null));

var runViewIcon = registerIcon("run-view-icon", Codicon.debugAlt, localize(14519, null));

var variablesViewIcon2 = registerIcon("variables-view-icon", Codicon.debugAlt, localize(14520, null));

var watchViewIcon = registerIcon("watch-view-icon", Codicon.debugAlt, localize(14526, null));

var callStackViewIcon = registerIcon("callstack-view-icon", Codicon.debugAlt, localize(14473, null));

var breakpointsViewIcon = registerIcon("breakpoints-view-icon", Codicon.debugAlt, localize(14472, null));

var loadedScriptsViewIcon = registerIcon("loaded-scripts-view-icon", Codicon.debugAlt, localize(14518, null));

var breakpoint = {
  regular: registerIcon("debug-breakpoint", Codicon.debugBreakpoint, localize(14475, null)),
  disabled: registerIcon("debug-breakpoint-disabled", Codicon.debugBreakpointDisabled, localize(14482, null)),
  unverified: registerIcon("debug-breakpoint-unverified", Codicon.debugBreakpointUnverified, localize(14492, null)),
  pending: registerIcon("debug-breakpoint-pending", Codicon.debugBreakpointPending, localize(14490, null))
};

var functionBreakpoint = {
  regular: registerIcon("debug-breakpoint-function", Codicon.debugBreakpointFunction, localize(14483, null)),
  disabled: registerIcon("debug-breakpoint-function-disabled", Codicon.debugBreakpointFunctionDisabled, localize(14484, null)),
  unverified: registerIcon("debug-breakpoint-function-unverified", Codicon.debugBreakpointFunctionUnverified, localize(14485, null))
};

var conditionalBreakpoint = {
  regular: registerIcon("debug-breakpoint-conditional", Codicon.debugBreakpointConditional, localize(14476, null)),
  disabled: registerIcon("debug-breakpoint-conditional-disabled", Codicon.debugBreakpointConditionalDisabled, localize(14477, null)),
  unverified: registerIcon("debug-breakpoint-conditional-unverified", Codicon.debugBreakpointConditionalUnverified, localize(14478, null))
};

var dataBreakpoint = {
  regular: registerIcon("debug-breakpoint-data", Codicon.debugBreakpointData, localize(14479, null)),
  disabled: registerIcon("debug-breakpoint-data-disabled", Codicon.debugBreakpointDataDisabled, localize(14480, null)),
  unverified: registerIcon("debug-breakpoint-data-unverified", Codicon.debugBreakpointDataUnverified, localize(14481, null))
};

var logBreakpoint = {
  regular: registerIcon("debug-breakpoint-log", Codicon.debugBreakpointLog, localize(14487, null)),
  disabled: registerIcon("debug-breakpoint-log-disabled", Codicon.debugBreakpointLogDisabled, localize(14488, null)),
  unverified: registerIcon("debug-breakpoint-log-unverified", Codicon.debugBreakpointLogUnverified, localize(14489, null))
};

var debugBreakpointHint = registerIcon("debug-hint", Codicon.debugHint, localize(14486, null));

var debugBreakpointUnsupported = registerIcon("debug-breakpoint-unsupported", Codicon.debugBreakpointUnsupported, localize(14491, null));

var allBreakpoints = [breakpoint, functionBreakpoint, conditionalBreakpoint, dataBreakpoint, logBreakpoint];

var debugStackframe = registerIcon("debug-stackframe", Codicon.debugStackframe, localize(14510, null));

var debugStackframeFocused = registerIcon("debug-stackframe-focused", Codicon.debugStackframeFocused, localize(14511, null));

var debugGripper = registerIcon("debug-gripper", Codicon.gripper, localize(14502, null));

var debugRestartFrame = registerIcon("debug-restart-frame", Codicon.debugRestartFrame, localize(14507, null));

var debugStop = registerIcon("debug-stop", Codicon.debugStop, localize(14517, null));

var debugDisconnect = registerIcon("debug-disconnect", Codicon.debugDisconnect, localize(14501, null));

var debugRestart = registerIcon("debug-restart", Codicon.debugRestart, localize(14506, null));

var debugStepOver = registerIcon("debug-step-over", Codicon.debugStepOver, localize(14516, null));

var debugStepInto = registerIcon("debug-step-into", Codicon.debugStepInto, localize(14514, null));

var debugStepOut = registerIcon("debug-step-out", Codicon.debugStepOut, localize(14515, null));

var debugStepBack = registerIcon("debug-step-back", Codicon.debugStepBack, localize(14513, null));

var debugPause = registerIcon("debug-pause", Codicon.debugPause, localize(14504, null));

var debugContinue = registerIcon("debug-continue", Codicon.debugContinue, localize(14500, null));

var debugReverseContinue = registerIcon("debug-reverse-continue", Codicon.debugReverseContinue, localize(14508, null));

var debugRun = registerIcon("debug-run", Codicon.run, localize(14509, null));

var debugStart = registerIcon("debug-start", Codicon.debugStart, localize(14512, null));

var debugConfigure = registerIcon("debug-configure", Codicon.gear, localize(14494, null));

var debugConsole = registerIcon("debug-console", Codicon.gear, localize(14495, null));

var debugRemoveConfig = registerIcon("debug-remove-config", Codicon.trash, localize(14505, null));

var debugCollapseAll = registerIcon("debug-collapse-all", Codicon.collapseAll, localize(14493, null));

var callstackViewSession = registerIcon("callstack-view-session", Codicon.bug, localize(14474, null));

var debugConsoleClearAll = registerIcon("debug-console-clear-all", Codicon.clearAll, localize(14496, null));

var watchExpressionsRemoveAll = registerIcon("watch-expressions-remove-all", Codicon.closeAll, localize(14525, null));

var watchExpressionRemove = registerIcon("watch-expression-remove", Codicon.removeClose, localize(14521, null));

var watchExpressionsAdd = registerIcon("watch-expressions-add", Codicon.add, localize(14522, null));

var watchExpressionsAddFuncBreakpoint = registerIcon("watch-expressions-add-function-breakpoint", Codicon.add, localize(14524, null));

var watchExpressionsAddDataBreakpoint = registerIcon("watch-expressions-add-data-breakpoint", Codicon.variableGroup, localize(14523, null));

var breakpointsRemoveAll = registerIcon("breakpoints-remove-all", Codicon.closeAll, localize(14471, null));

var breakpointsActivate = registerIcon("breakpoints-activate", Codicon.activateBreakpoints, localize(14470, null));

var debugConsoleEvaluationInput = registerIcon("debug-console-evaluation-input", Codicon.arrowSmallRight, localize(14497, null));

var debugConsoleEvaluationPrompt = registerIcon("debug-console-evaluation-prompt", Codicon.chevronRight, localize(14498, null));

var debugInspectMemory = registerIcon("debug-inspect-memory", Codicon.fileBinary, localize(14503, null));
export { debugConsoleViewIcon, runViewIcon, variablesViewIcon2, watchViewIcon, callStackViewIcon, breakpointsViewIcon, loadedScriptsViewIcon, breakpoint, functionBreakpoint, conditionalBreakpoint, dataBreakpoint, logBreakpoint, debugBreakpointHint, debugBreakpointUnsupported, allBreakpoints, debugStackframe, debugStackframeFocused, debugGripper, debugRestartFrame, debugStop, debugDisconnect, debugRestart, debugStepOver, debugStepInto, debugStepOut, debugStepBack, debugPause, debugContinue, debugReverseContinue, debugRun, debugStart, debugConfigure, debugConsole, debugRemoveConfig, debugCollapseAll, callstackViewSession, debugConsoleClearAll, watchExpressionsRemoveAll, watchExpressionRemove, watchExpressionsAdd, watchExpressionsAddFuncBreakpoint, watchExpressionsAddDataBreakpoint, breakpointsRemoveAll, breakpointsActivate, debugConsoleEvaluationInput, debugConsoleEvaluationPrompt, debugInspectMemory };
