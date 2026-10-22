// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/accessibilitySignals/browser/saveAccessibilitySignal.ts
import { Disposable } from "./module-0012.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkingCopyService } from "./module-1073.mjs";


// src/vs/workbench/contrib/accessibilitySignals/browser/saveAccessibilitySignal.ts
var SaveAccessibilitySignalContribution = class extends Disposable {
  constructor(_accessibilitySignalService, _workingCopyService) {
    super();
    this._accessibilitySignalService = _accessibilitySignalService;
    this._workingCopyService = _workingCopyService;
    this._register(this._workingCopyService.onDidSave((e4) => this._accessibilitySignalService.playSignal(AccessibilitySignal.save, { userGesture: e4.reason === 1 /* EXPLICIT */ })));
  }
  static {
    this.ID = "workbench.contrib.saveAccessibilitySignal";
  }
};

SaveAccessibilitySignalContribution = __decorateClass([
  __decorateParam(0, IAccessibilitySignalService),
  __decorateParam(1, IWorkingCopyService)
], SaveAccessibilitySignalContribution);
export { SaveAccessibilitySignalContribution };
