// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/common/debugLifecycle.ts
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IDebugService } from "./module-1057.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IDialogService } from "./module-0267.mjs";


// src/vs/workbench/contrib/debug/common/debugLifecycle.ts
var DebugLifecycle = class {
  constructor(lifecycleService, debugService, configurationService, dialogService) {
    this.debugService = debugService;
    this.configurationService = configurationService;
    this.dialogService = dialogService;
    this.disposable = lifecycleService.onBeforeShutdown(async (e) => e.veto(this.shouldVetoShutdown(e.reason), "veto.debug"));
  }
  shouldVetoShutdown(_reason) {
    const rootSessions = this.debugService.getModel().getSessions().filter((s) => s.parentSession === void 0);
    if (rootSessions.length === 0) {
      return false;
    }
    const shouldConfirmOnExit = this.configurationService.getValue("debug").confirmOnExit;
    if (shouldConfirmOnExit === "never") {
      return false;
    }
    return this.showWindowCloseConfirmation(rootSessions.length);
  }
  dispose() {
    return this.disposable.dispose();
  }
  async showWindowCloseConfirmation(numSessions) {
    let message;
    if (numSessions === 1) {
      message = localize(14810, null);
    } else {
      message = localize(14809, null);
    }
    const res = await this.dialogService.confirm({
      message,
      type: "warning",
      primaryButton: localize(14811, null)
    });
    return !res.confirmed;
  }
};

DebugLifecycle = __decorateClass([
  __decorateParam(0, ILifecycleService),
  __decorateParam(1, IDebugService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IDialogService)
], DebugLifecycle);
export { DebugLifecycle };
