// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessions/browser/sessionActionFeedback.ts
import { Disposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";


// src/vs/sessions/contrib/sessions/browser/sessionActionFeedback.ts
var SessionActionFeedback = class _SessionActionFeedback extends Disposable {
  constructor() {
    super(...arguments);
    this._approvedCount = observableValue("approvedCount", 0);
    /** Number of sessions approved within the current window; `0` when idle. */
    this.approvedCount = this._approvedCount;
    this._resetScheduler = this._register(new RunOnceScheduler(
      () => this._approvedCount.set(0, void 0),
      _SessionActionFeedback.WINDOW_MS
    ));
  }
  static {
    /** How long the "Approved N sessions" message stays visible, in milliseconds. */
    this.WINDOW_MS = 3e3;
  }
  /** Report that a session's pending action was approved. Restarts the window. */
  notifyApproved() {
    this._approvedCount.set(this._approvedCount.get() + 1, void 0);
    this._resetScheduler.schedule();
  }
};
export { SessionActionFeedback };
