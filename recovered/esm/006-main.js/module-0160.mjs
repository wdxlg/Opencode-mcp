// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/browserView/electron-main/browserViewCDPTarget.ts
import { __esm } from "./module-0000.mjs";
import { Emitter, init_event } from "./module-0021.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";


// src/vs/platform/browserView/electron-main/browserViewCDPTarget.ts
var BrowserViewCDPTarget;

var init_browserViewCDPTarget = __esm({
  "src/vs/platform/browserView/electron-main/browserViewCDPTarget.ts"() {
    init_event();
    init_lifecycle();
    BrowserViewCDPTarget = class extends Disposable {
      constructor(view, _targetInfo) {
        super();
        this.view = view;
        this._targetInfo = _targetInfo;
        this._sessions = /* @__PURE__ */ new Map();
        this._onSessionCreated = this._register(new Emitter());
        this.onSessionCreated = this._onSessionCreated.event;
        this._onClose = this._register(new Emitter());
        this.onClose = this._onClose.event;
        this._onTargetInfoChanged = this._register(new Emitter());
        this.onTargetInfoChanged = this._onTargetInfoChanged.event;
        this._isDisposed = false;
        this._register(this.view.debugger.onTargetInfoChanged((info) => {
          if (info.targetId !== this._targetInfo.targetId) {
            return;
          }
          if (info.title !== this._targetInfo.title || info.url !== this._targetInfo.url) {
            this._targetInfo.title = info.title;
            this._targetInfo.url = info.url;
            this._onTargetInfoChanged.fire(this.targetInfo);
          }
        }));
        this._register(this.view.debugger.onTargetDestroyed((targetId) => {
          if (targetId === this._targetInfo.targetId) {
            this.dispose();
          }
        }));
      }
      get sessions() {
        return this._sessions;
      }
      get targetInfo() {
        return {
          ...this._targetInfo,
          attached: this._sessions.size > 0,
          browserContextId: this.view.session.id,
          vscodeBrowserViewId: this.view.id
        };
      }
      async attach(requesterSessionId) {
        const session4 = await this.view.debugger.attachToTarget(this.targetInfo.targetId);
        this.notifySessionCreated(session4, false, requesterSessionId);
        return session4;
      }
      notifySessionCreated(session4, waitingForDebugger, requesterSessionId) {
        if (this._sessions.has(session4.sessionId)) {
          return;
        }
        if (this.sessions.size === 0) {
          this._onTargetInfoChanged.fire(this.targetInfo);
        }
        this._sessions.set(session4.sessionId, session4);
        session4.onClose(() => {
          this._sessions.delete(session4.sessionId);
          if (this.sessions.size === 0) {
            this._onTargetInfoChanged.fire(this.targetInfo);
          }
        });
        this._onSessionCreated.fire({ session: session4, waitingForDebugger, requesterSessionId });
      }
      dispose() {
        if (this._isDisposed) {
          return;
        }
        this._isDisposed = true;
        for (const [, session4] of this._sessions) {
          session4.dispose();
        }
        this._sessions.clear();
        this._onClose.fire();
        super.dispose();
      }
    };
  }
});
export { BrowserViewCDPTarget, init_browserViewCDPTarget };
