// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/parts/sessionsParts.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { getClientArea } from "./module-0075.mjs";
import { mainWindow } from "./module-0002.mjs";
import { MobileSessionsPart } from "./module-3505.mjs";
import { SessionsPart } from "./module-3504.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { ISessionsPartService } from "./module-1771.mjs";


// src/vs/sessions/browser/parts/sessionsParts.ts
var SessionsParts = class extends Disposable {
  constructor(instantiationService) {
    super();
    this._onDidToggleMaximizeSession = this._register(new Emitter());
    this.onDidToggleMaximizeSession = this._onDidToggleMaximizeSession.event;
    const { width: width2 } = getClientArea(mainWindow.document.body);
    const isPhoneLayout2 = width2 < 640;
    this._mainPart = this._register(instantiationService.createInstance(isPhoneLayout2 ? MobileSessionsPart : SessionsPart));
  }
  get onDidFocusSession() {
    return this._mainPart.onDidFocusSession;
  }
  updateVisibleSessions(visible, active) {
    this._mainPart.updateVisibleSessions(visible, active);
  }
  toggleMaximizeSession(session) {
    if (!session) {
      this._mainPart.toggleMaximizeSession(void 0);
      return;
    }
    const maximized = this._mainPart.toggleMaximizeSession(session.sessionId);
    if (maximized !== void 0) {
      this._onDidToggleMaximizeSession.fire({ session, maximized });
    }
  }
  focusSession(session) {
    this._mainPart.focusSession(session?.sessionId);
  }
  getSessionView(sessionId) {
    return this._mainPart.getSessionView(sessionId);
  }
  getProgressIndicator() {
    return this._mainPart.getProgressIndicator();
  }
};

SessionsParts = __decorateClass([
  __decorateParam(0, IInstantiationService)
], SessionsParts);

registerSingleton(ISessionsPartService, SessionsParts, 0 /* Eager */);
export { SessionsParts };
