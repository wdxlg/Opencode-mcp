// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/debugStatus.ts
import { localize } from "./module-0001.mjs";
import { dispose } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStatusbarService } from "./module-0893.mjs";
import { IDebugService } from "./module-1057.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/debug/browser/debugStatus.ts
var DebugStatusContribution = class {
  constructor(statusBarService, debugService, configurationService) {
    this.statusBarService = statusBarService;
    this.debugService = debugService;
    this.toDispose = [];
    const addStatusBarEntry = () => {
      this.entryAccessor = this.statusBarService.addEntry(
        this.entry,
        "status.debug",
        0 /* LEFT */,
        30
        /* Low Priority */
      );
    };
    const setShowInStatusBar = () => {
      this.showInStatusBar = configurationService.getValue("debug").showInStatusBar;
      if (this.showInStatusBar === "always" && !this.entryAccessor) {
        addStatusBarEntry();
      }
    };
    setShowInStatusBar();
    this.toDispose.push(this.debugService.onDidChangeState((state) => {
      if (state !== 0 /* Inactive */ && this.showInStatusBar === "onFirstSessionStart" && !this.entryAccessor) {
        addStatusBarEntry();
      }
    }));
    this.toDispose.push(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("debug.showInStatusBar")) {
        setShowInStatusBar();
        if (this.entryAccessor && this.showInStatusBar === "never") {
          this.entryAccessor.dispose();
          this.entryAccessor = void 0;
        }
      }
    }));
    this.toDispose.push(this.debugService.getConfigurationManager().onDidSelectConfiguration((e) => {
      this.entryAccessor?.update(this.entry);
    }));
  }
  get entry() {
    let text2 = "";
    const manager = this.debugService.getConfigurationManager();
    const name = manager.selectedConfiguration.name || "";
    const nameAndLaunchPresent = name && manager.selectedConfiguration.launch;
    if (nameAndLaunchPresent) {
      text2 = manager.getLaunches().length > 1 ? `${name} (${manager.selectedConfiguration.launch.name})` : name;
    }
    return {
      name: localize(14569, null),
      text: "$(debug-alt-small) " + text2,
      ariaLabel: localize(14567, null, text2),
      tooltip: localize(14568, null),
      command: "workbench.action.debug.selectandstart"
    };
  }
  dispose() {
    this.entryAccessor?.dispose();
    dispose(this.toDispose);
  }
};

DebugStatusContribution = __decorateClass([
  __decorateParam(0, IStatusbarService),
  __decorateParam(1, IDebugService),
  __decorateParam(2, IConfigurationService)
], DebugStatusContribution);
export { DebugStatusContribution };
