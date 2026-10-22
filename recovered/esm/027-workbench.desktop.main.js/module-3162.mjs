// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/debugConsoleQuickAccess.ts
import { PickerQuickAccessProvider } from "./module-1528.mjs";
import { DEBUG_CONSOLE_QUICK_ACCESS_PREFIX, SELECT_AND_START_ID } from "./module-2406.mjs";
import { localize } from "./module-0001.mjs";
import { matchesFuzzy } from "./module-0453.mjs";
import { IDebugService, REPL_VIEW_ID } from "./module-1057.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IViewsService } from "./module-1246.mjs";
import { ICommandService } from "./module-0087.mjs";


// src/vs/workbench/contrib/debug/browser/debugConsoleQuickAccess.ts
var DebugConsoleQuickAccess = class extends PickerQuickAccessProvider {
  constructor(_debugService, _viewsService, _commandService) {
    super(DEBUG_CONSOLE_QUICK_ACCESS_PREFIX, { canAcceptInBackground: true });
    this._debugService = _debugService;
    this._viewsService = _viewsService;
    this._commandService = _commandService;
  }
  _getPicks(filter2, disposables, token) {
    const debugConsolePicks = [];
    this._debugService.getModel().getSessions(true).filter((s) => s.hasSeparateRepl()).forEach((session, index2) => {
      const pick = this._createPick(session, index2, filter2);
      if (pick) {
        debugConsolePicks.push(pick);
      }
    });
    if (debugConsolePicks.length > 0) {
      debugConsolePicks.push({ type: "separator" });
    }
    const createTerminalLabel = localize(14439, null);
    debugConsolePicks.push({
      label: `$(plus) ${createTerminalLabel}`,
      ariaLabel: createTerminalLabel,
      accept: () => this._commandService.executeCommand(SELECT_AND_START_ID)
    });
    return debugConsolePicks;
  }
  _createPick(session, sessionIndex, filter2) {
    const label3 = session.name;
    const highlights = matchesFuzzy(filter2, label3, true);
    if (highlights) {
      return {
        label: label3,
        highlights: { label: highlights },
        accept: (keyMod, event) => {
          this._debugService.focusStackFrame(void 0, void 0, session, { explicit: true });
          if (!this._viewsService.isViewVisible(REPL_VIEW_ID)) {
            this._viewsService.openView(REPL_VIEW_ID, true);
          }
        }
      };
    }
    return void 0;
  }
};

DebugConsoleQuickAccess = __decorateClass([
  __decorateParam(0, IDebugService),
  __decorateParam(1, IViewsService),
  __decorateParam(2, ICommandService)
], DebugConsoleQuickAccess);
export { DebugConsoleQuickAccess };
