// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/accessibilitySignals/browser/accessibilitySignalDebuggerContribution.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { autorunWithStore } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IDebugService } from "./module-1058.mjs";


// src/vs/workbench/contrib/accessibilitySignals/browser/accessibilitySignalDebuggerContribution.ts
var AccessibilitySignalLineDebuggerContribution = class extends Disposable {
  constructor(debugService, accessibilitySignalService) {
    super();
    this.accessibilitySignalService = accessibilitySignalService;
    const isEnabled = observableFromEvent(
      this,
      accessibilitySignalService.onSoundEnabledChanged(AccessibilitySignal.onDebugBreak),
      () => accessibilitySignalService.isSoundEnabled(AccessibilitySignal.onDebugBreak)
    );
    this._register(autorunWithStore((reader, store) => {
      if (!isEnabled.read(reader)) {
        return;
      }
      const sessionDisposables = /* @__PURE__ */ new Map();
      store.add(toDisposable(() => {
        sessionDisposables.forEach((d) => d.dispose());
        sessionDisposables.clear();
      }));
      store.add(
        debugService.onDidNewSession(
          (session) => sessionDisposables.set(session, this.handleSession(session))
        )
      );
      store.add(debugService.onDidEndSession(({ session }) => {
        sessionDisposables.get(session)?.dispose();
        sessionDisposables.delete(session);
      }));
      debugService.getModel().getSessions().forEach(
        (session) => sessionDisposables.set(session, this.handleSession(session))
      );
    }));
  }
  handleSession(session) {
    return session.onDidChangeState((e4) => {
      const stoppedDetails = session.getStoppedDetails();
      const BREAKPOINT_STOP_REASON = "breakpoint";
      if (stoppedDetails && stoppedDetails.reason === BREAKPOINT_STOP_REASON) {
        this.accessibilitySignalService.playSignal(AccessibilitySignal.onDebugBreak);
      }
    });
  }
};

AccessibilitySignalLineDebuggerContribution = __decorateClass([
  __decorateParam(0, IDebugService),
  __decorateParam(1, IAccessibilitySignalService)
], AccessibilitySignalLineDebuggerContribution);
export { AccessibilitySignalLineDebuggerContribution };
