// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/common/replAccessibilityAnnouncer.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IDebugService } from "./module-1057.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/debug/common/replAccessibilityAnnouncer.ts
var ReplAccessibilityAnnouncer = class extends Disposable {
  static {
    this.ID = "debug.replAccessibilityAnnouncer";
  }
  constructor(debugService, accessibilityService, logService) {
    super();
    const viewModel = debugService.getViewModel();
    const mutableDispoable = this._register(new MutableDisposable());
    this._register(viewModel.onDidFocusSession((session) => {
      mutableDispoable.clear();
      if (!session) {
        return;
      }
      mutableDispoable.value = session.onDidChangeReplElements((element) => {
        if (!element || !("originalExpression" in element)) {
          return;
        }
        const value2 = element.toString();
        accessibilityService.status(value2);
        logService.trace("ReplAccessibilityAnnouncer#onDidChangeReplElements", element.originalExpression + ": " + value2);
      });
    }));
  }
};

ReplAccessibilityAnnouncer = __decorateClass([
  __decorateParam(0, IDebugService),
  __decorateParam(1, IAccessibilityService),
  __decorateParam(2, ILogService)
], ReplAccessibilityAnnouncer);
export { ReplAccessibilityAnnouncer };
