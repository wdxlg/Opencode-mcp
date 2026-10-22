// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/statusbarColorProvider.ts
import { asCssVariable, asCssVariableName, registerColor, transparent } from "./module-0226.mjs";
import { localize } from "./module-0001.mjs";
import { COMMAND_CENTER_BACKGROUND, STATUS_BAR_BORDER, STATUS_BAR_FOREGROUND } from "./module-0912.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { createStyleSheet } from "./module-0224.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IDebugService } from "./module-1057.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IStatusbarService } from "./module-0893.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/debug/browser/statusbarColorProvider.ts
var STATUS_BAR_DEBUGGING_BACKGROUND = registerColor("statusBar.debuggingBackground", {
  dark: "#CC6633",
  light: "#CC6633",
  hcDark: "#BA592C",
  hcLight: "#B5200D"
}, localize(14701, null));

var STATUS_BAR_DEBUGGING_FOREGROUND = registerColor("statusBar.debuggingForeground", {
  dark: STATUS_BAR_FOREGROUND,
  light: STATUS_BAR_FOREGROUND,
  hcDark: STATUS_BAR_FOREGROUND,
  hcLight: "#FFFFFF"
}, localize(14703, null));

var STATUS_BAR_DEBUGGING_BORDER = registerColor("statusBar.debuggingBorder", STATUS_BAR_BORDER, localize(14702, null));

var COMMAND_CENTER_DEBUGGING_BACKGROUND = registerColor(
  "commandCenter.debuggingBackground",
  transparent(STATUS_BAR_DEBUGGING_BACKGROUND, 0.258),
  localize(14700, null),
  true
);

var StatusBarColorProvider = class {
  constructor(debugService, contextService, statusbarService, configurationService) {
    this.debugService = debugService;
    this.contextService = contextService;
    this.statusbarService = statusbarService;
    this.configurationService = configurationService;
    this.disposables = new DisposableStore();
    this.styleSheet = createStyleSheet();
    this.debugService.onDidChangeState(this.update, this, this.disposables);
    this.contextService.onDidChangeWorkbenchState(this.update, this, this.disposables);
    this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("debug.enableStatusBarColor") || e.affectsConfiguration("debug.toolBarLocation")) {
        this.update();
      }
    }, void 0, this.disposables);
    this.update();
  }
  set enabled(enabled) {
    if (enabled === !!this.disposable) {
      return;
    }
    if (enabled) {
      this.disposable = this.statusbarService.overrideStyle({
        priority: 10,
        foreground: STATUS_BAR_DEBUGGING_FOREGROUND,
        background: STATUS_BAR_DEBUGGING_BACKGROUND,
        border: STATUS_BAR_DEBUGGING_BORDER
      });
    } else {
      this.disposable.dispose();
      this.disposable = void 0;
    }
  }
  update() {
    const debugConfig = this.configurationService.getValue("debug");
    const isInDebugMode = isStatusbarInDebugMode(this.debugService.state, this.debugService.getModel().getSessions());
    if (!debugConfig.enableStatusBarColor) {
      this.enabled = false;
    } else {
      this.enabled = isInDebugMode;
    }
    const isInCommandCenter = debugConfig.toolBarLocation === "commandCenter";
    this.styleSheet.textContent = isInCommandCenter && isInDebugMode ? `
			.monaco-workbench {
				${asCssVariableName(COMMAND_CENTER_BACKGROUND)}: ${asCssVariable(COMMAND_CENTER_DEBUGGING_BACKGROUND)};
			}
		` : "";
  }
  dispose() {
    this.disposable?.dispose();
    this.disposables.dispose();
  }
};

StatusBarColorProvider = __decorateClass([
  __decorateParam(0, IDebugService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, IStatusbarService),
  __decorateParam(3, IConfigurationService)
], StatusBarColorProvider);

function isStatusbarInDebugMode(state, sessions) {
  if (state === 0 /* Inactive */ || state === 1 /* Initializing */ || sessions.every((s) => s.suppressDebugStatusbar || s.configuration?.noDebug)) {
    return false;
  }
  return true;
}
export { isStatusbarInDebugMode, STATUS_BAR_DEBUGGING_BACKGROUND, STATUS_BAR_DEBUGGING_FOREGROUND, STATUS_BAR_DEBUGGING_BORDER, COMMAND_CENTER_DEBUGGING_BACKGROUND, StatusBarColorProvider };
