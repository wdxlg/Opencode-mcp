// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/runAndDebugAccessibilityHelp.ts
import { ContextKeyExpr } from "./module-0089.mjs";
import { FocusedViewContext, SidebarFocusContext } from "./module-0949.mjs";
import { BREAKPOINTS_VIEW_ID, CALLSTACK_VIEW_ID, LOADED_SCRIPTS_VIEW_ID, VARIABLES_VIEW_ID, WATCH_VIEW_ID } from "./module-1057.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IViewsService } from "./module-1246.mjs";
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { AccessibilityHelpNLS } from "./module-0867.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";


// src/vs/workbench/contrib/debug/browser/runAndDebugAccessibilityHelp.ts
var RunAndDebugAccessibilityHelp = class {
  constructor() {
    this.priority = 120;
    this.name = "runAndDebugHelp";
    this.when = ContextKeyExpr.or(
      ContextKeyExpr.and(ContextKeyExpr.equals("activeViewlet", "workbench.view.debug"), SidebarFocusContext),
      ContextKeyExpr.equals(FocusedViewContext.key, VARIABLES_VIEW_ID),
      ContextKeyExpr.equals(FocusedViewContext.key, WATCH_VIEW_ID),
      ContextKeyExpr.equals(FocusedViewContext.key, CALLSTACK_VIEW_ID),
      ContextKeyExpr.equals(FocusedViewContext.key, LOADED_SCRIPTS_VIEW_ID),
      ContextKeyExpr.equals(FocusedViewContext.key, BREAKPOINTS_VIEW_ID)
    );
    this.type = "help" /* Help */;
  }
  getProvider(accessor) {
    return new RunAndDebugAccessibilityHelpProvider(accessor.get(ICommandService), accessor.get(IViewsService));
  }
};

var RunAndDebugAccessibilityHelpProvider = class extends Disposable {
  constructor(_commandService, _viewsService) {
    super();
    this._commandService = _commandService;
    this._viewsService = _viewsService;
    this.id = "runAndDebug" /* RunAndDebug */;
    this.verbositySettingKey = "accessibility.verbosity.debug" /* Debug */;
    this.options = { type: "help" /* Help */ };
    this._focusedView = this._viewsService.getFocusedViewName();
  }
  onClose() {
    switch (this._focusedView) {
      case "Watch":
        this._commandService.executeCommand("workbench.debug.action.focusWatchView");
        break;
      case "Variables":
        this._commandService.executeCommand("workbench.debug.action.focusVariablesView");
        break;
      case "Call Stack":
        this._commandService.executeCommand("workbench.debug.action.focusCallStackView");
        break;
      case "Breakpoints":
        this._commandService.executeCommand("workbench.debug.action.focusBreakpointsView");
        break;
      default:
        this._commandService.executeCommand("workbench.view.debug");
    }
  }
  provideContent() {
    return [
      localize(14691, null, "<keybinding:workbench.view.debug>"),
      localize(14692, null, "<keybinding:workbench.action.debug.start>"),
      localize(14689, null, "<keybinding:workbench.panel.repl.view.focus>"),
      AccessibilityHelpNLS.setBreakpoint,
      AccessibilityHelpNLS.addToWatch,
      localize(14699, null),
      localize(14690, null, "<keybinding:workbench.action.debug.restart>"),
      localize(14696, null, "<keybinding:workbench.action.debug.stop>"),
      localize(14684, null, "<keybinding:workbench.action.debug.continue>"),
      localize(14693, null, "<keybinding:workbench.action.debug.stepInto>"),
      localize(14695, null, "<keybinding:workbench.action.debug.stepOver>"),
      localize(14694, null, "<keybinding:workbench.action.debug.stepOut>"),
      localize(14697, null),
      localize(14685, null, "<keybinding:workbench.debug.action.focusBreakpointsView>"),
      localize(14686, null, "<keybinding:workbench.debug.action.focusCallStackView>"),
      localize(14687, null, "<keybinding:workbench.debug.action.focusVariablesView>"),
      localize(14688, null, "<keybinding:workbench.debug.action.focusWatchView>"),
      localize(14698, null, "accessibility.debugWatchVariableAnnouncements")
    ].join("\n");
  }
};

RunAndDebugAccessibilityHelpProvider = __decorateClass([
  __decorateParam(0, ICommandService),
  __decorateParam(1, IViewsService)
], RunAndDebugAccessibilityHelpProvider);
export { RunAndDebugAccessibilityHelp, RunAndDebugAccessibilityHelpProvider };
