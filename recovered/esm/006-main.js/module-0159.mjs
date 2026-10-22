// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/browserView/common/cdp/proxy.ts
import { __esm } from "./module-0000.mjs";
import { Disposable, DisposableMap, DisposableStore, init_lifecycle } from "./module-0018.mjs";
import { Emitter, init_event } from "./module-0021.mjs";
import { generateUuid, init_uuid } from "./module-0055.mjs";
import { CDPError, CDPErrorCode, CDPInvalidParamsError, CDPMethodNotFoundError, CDPServerError, init_types2 } from "./module-0158.mjs";


// src/vs/platform/browserView/common/cdp/proxy.ts
var ROOT_SESSION_ID, CDPBrowserProxy;

var init_proxy = __esm({
  "src/vs/platform/browserView/common/cdp/proxy.ts"() {
    init_lifecycle();
    init_event();
    init_uuid();
    init_types2();
    ROOT_SESSION_ID = "";
    CDPBrowserProxy = class extends Disposable {
      constructor(browserTarget) {
        super();
        this.browserTarget = browserTarget;
        this.sessionId = ROOT_SESSION_ID;
        /**
         * Browser-level sessions, keyed by session ID.
         *
         * `Target.setAutoAttach` and `Target.setDiscoverTargets` are per-session in
         * CDP, and a client observes events on the session it subscribed from, so
         * each session's subscriptions are tracked separately. The root session is
         * always present: it is the connection itself, which needs no attach.
         */
        this._browserSessions = /* @__PURE__ */ new Map([
          [ROOT_SESSION_ID, { lifecycleSessionId: void 0, discover: false, autoAttachments: void 0, sessionIds: /* @__PURE__ */ new Set() }]
        ]);
        /**
         * All sessions known to this proxy, keyed by sessionId.
         * Includes sessions from explicit attach, proxy auto-attach,
         * and client auto-attach children.
         */
        this._sessions = this._register(new DisposableMap());
        this._targets = this._register(new DisposableMap());
        /**
         * Listeners on targets and sessions, which the proxy observes but does not
         * own. Scoped to how long the proxy tracks each one.
         */
        this._targetListeners = this._register(new DisposableMap());
        this._sessionListeners = this._register(new DisposableMap());
        // CDP method handlers map
        this._handlers = /* @__PURE__ */ new Map([
          // Browser.* methods (https://chromedevtools.github.io/devtools-protocol/tot/Browser/)
          ["Browser.addPrivacySandboxCoordinatorKeyConfig", () => ({})],
          ["Browser.addPrivacySandboxEnrollmentOverride", () => ({})],
          ["Browser.close", () => ({})],
          ["Browser.getVersion", () => this.browserTarget.getVersion()],
          ["Browser.resetPermissions", () => ({})],
          ["Browser.getWindowForTarget", (p, s) => this.handleBrowserGetWindowForTarget(p, s)],
          ["Browser.setDownloadBehavior", () => ({})],
          ["Browser.setWindowBounds", () => ({})],
          // Target.* methods (https://chromedevtools.github.io/devtools-protocol/tot/Target/)
          ["Target.activateTarget", (p) => this.handleTargetActivateTarget(p)],
          ["Target.attachToTarget", (p, s) => this.handleTargetAttachToTarget(p, s)],
          ["Target.closeTarget", (p) => this.handleTargetCloseTarget(p)],
          ["Target.createBrowserContext", () => this.handleTargetCreateBrowserContext()],
          ["Target.createTarget", (p) => this.handleTargetCreateTarget(p)],
          ["Target.detachFromTarget", (p) => this.handleTargetDetachFromTarget(p)],
          ["Target.disposeBrowserContext", (p) => this.handleTargetDisposeBrowserContext(p)],
          ["Target.getBrowserContexts", () => this.handleTargetGetBrowserContexts()],
          ["Target.getTargets", () => this.handleTargetGetTargets()],
          ["Target.setAutoAttach", (p, s) => this.handleTargetSetAutoAttach(p, s)],
          ["Target.setDiscoverTargets", (p, s) => this.handleTargetSetDiscoverTargets(p, s)],
          ["Target.attachToBrowserTarget", (_p, s) => this.handleTargetAttachToBrowserTarget(s)],
          ["Target.getTargetInfo", (p, s) => this.handleTargetGetTargetInfo(p, s)]
        ]);
        // #region Public API
        // Events to external clients
        this._onEvent = this._register(new Emitter());
        this.onEvent = this._onEvent.event;
        this._onClose = this._register(new Emitter());
        this.onClose = this._onClose.event;
        this._onMessage = this._register(new Emitter());
        this.onMessage = this._onMessage.event;
      }
      get targetId() {
        return this.browserTarget.targetInfo.targetId;
      }
      registerTarget(target) {
        const targetInfo = target.targetInfo;
        if (this._targets.has(targetInfo.targetId)) {
          return;
        }
        this._targets.set(targetInfo.targetId, target);
        const listeners = new DisposableStore();
        this._targetListeners.set(targetInfo.targetId, listeners);
        listeners.add(target.onClose(() => {
          for (const [sessionId, state] of this._browserSessions) {
            state.autoAttachments?.delete(target);
            if (state.discover) {
              this.sendEvent("Target.targetDestroyed", { targetId: targetInfo.targetId }, sessionId);
            }
          }
          this._targets.deleteAndDispose(targetInfo.targetId);
          this._targetListeners.deleteAndDispose(targetInfo.targetId);
        }));
        listeners.add(target.onTargetInfoChanged((info) => {
          for (const [sessionId, state] of this._browserSessions) {
            if (state.discover) {
              this.sendEvent("Target.targetInfoChanged", { targetInfo: info }, sessionId);
            }
          }
        }));
        for (const [, session4] of target.sessions) {
          this.registerSession(session4, false);
        }
        listeners.add(target.onSessionCreated(({ session: session4, waitingForDebugger, requesterSessionId }) => {
          this.registerSession(session4, waitingForDebugger, requesterSessionId);
        }));
        for (const [sessionId, state] of this._browserSessions) {
          if (state.discover) {
            this.sendEvent("Target.targetCreated", { targetInfo: target.targetInfo }, sessionId);
          }
          if (state.autoAttachments) {
            void this.autoAttachTarget(target, sessionId).catch(() => {
            });
          }
        }
      }
      notifySessionCreated(session4, waitingForDebugger) {
        if (this._sessions.has(session4.sessionId)) {
          return;
        }
        if (!session4.parentSessionId) {
          return;
        }
        if (!this._sessions.has(session4.parentSessionId)) {
          return;
        }
        const target = this._targets.get(session4.targetId);
        if (!target) {
          return;
        }
        target.notifySessionCreated(session4, waitingForDebugger);
      }
      registerSession(session4, waitingForDebugger, requesterSessionId) {
        if (this._sessions.has(session4.sessionId)) {
          return;
        }
        const target = this._targets.get(session4.targetId);
        if (!target) {
          throw new CDPServerError(`Unable to resolve target for session ${session4.sessionId}`);
        }
        const lifecycleSessionId = requesterSessionId ?? session4.parentSessionId;
        const ownerSessionId = this.resolveBrowserSessionId(lifecycleSessionId);
        this._browserSessions.get(ownerSessionId).sessionIds.add(session4.sessionId);
        this._sessions.set(session4.sessionId, session4);
        const listeners = new DisposableStore();
        this._sessionListeners.set(session4.sessionId, listeners);
        listeners.add(session4.onEvent((event) => {
          if (event.method.startsWith("Target.")) {
            return;
          }
          this.sendEvent(event.method, event.params, event.sessionId || session4.sessionId);
        }));
        listeners.add(session4.onClose(() => {
          this._browserSessions.get(ownerSessionId)?.sessionIds.delete(session4.sessionId);
          this._sessions.deleteAndDispose(session4.sessionId);
          this.sendEvent("Target.detachedFromTarget", {
            sessionId: session4.sessionId,
            targetId: session4.targetId
          }, lifecycleSessionId);
          this._sessionListeners.deleteAndDispose(session4.sessionId);
        }));
        this.sendEvent("Target.attachedToTarget", {
          sessionId: session4.sessionId,
          targetInfo: target.targetInfo,
          waitingForDebugger
        }, lifecycleSessionId);
      }
      resolveBrowserSessionId(sessionId) {
        if (this._browserSessions.has(sessionId ?? ROOT_SESSION_ID)) {
          return sessionId ?? ROOT_SESSION_ID;
        }
        if (sessionId) {
          for (const [browserSessionId, state] of this._browserSessions) {
            if (state.sessionIds.has(sessionId)) {
              return browserSessionId;
            }
          }
        }
        return ROOT_SESSION_ID;
      }
      /**
       * Send an event to the client.
       *
       * `sessionId` is always explicit: events belong to whichever session the
       * client subscribed from, so there is no single "current" destination to
       * fall back on.
       */
      sendEvent(method, params, sessionId) {
        const externalSessionId = sessionId === ROOT_SESSION_ID ? void 0 : sessionId;
        this._onMessage.fire({ method, params, sessionId: externalSessionId });
        this._onEvent.fire({ method, params, sessionId: externalSessionId });
      }
      /**
       * Send a CDP command and await the result.
       * Browser-level handlers (Browser.*, Target.*) are checked first.
       * Other commands are routed to the page session identified by sessionId.
       */
      async sendCommand(method, params = {}, sessionId) {
        try {
          if (sessionId !== void 0 && !this._browserSessions.has(sessionId) && !this._sessions.has(sessionId)) {
            throw new CDPServerError(`Session not found: ${sessionId}`);
          }
          if (this._browserSessions.has(sessionId ?? ROOT_SESSION_ID) || method.startsWith("Browser.") || method.startsWith("Target.")) {
            const handler = this._handlers.get(method);
            if (!handler) {
              throw new CDPMethodNotFoundError(method);
            }
            return await handler(params, sessionId);
          }
          const connection = sessionId ? this._sessions.get(sessionId) : void 0;
          if (!connection) {
            throw new CDPServerError(`Session not found: ${sessionId}`);
          }
          const result = await connection.sendCommand(method, params);
          return result ?? {};
        } catch (error) {
          if (error instanceof CDPError) {
            throw error;
          }
          throw new CDPServerError(error instanceof Error ? error.message : "Unknown error");
        }
      }
      /**
       * Accept a CDP request from a message-based transport (WebSocket, IPC, etc.), route it,
       * and deliver the response or error via {@link onMessage}.
       */
      async sendMessage({ id: id2, method, params, sessionId }) {
        return this.sendCommand(method, params, sessionId).then((result) => {
          this._onMessage.fire({ id: id2, result, sessionId });
        }).catch((error) => {
          this._onMessage.fire({
            id: id2,
            error: {
              code: error instanceof CDPError ? error.code : CDPErrorCode.ServerError,
              message: error.message || "Unknown error"
            },
            sessionId
          });
        });
      }
      // #endregion
      // #region CDP Commands
      handleBrowserGetWindowForTarget({ targetId }, sessionId) {
        const resolvedTargetId = (sessionId && this._sessions.get(sessionId)?.targetId) ?? targetId;
        if (!resolvedTargetId) {
          throw new CDPServerError("Unable to resolve target");
        }
        const target = this._targets.get(resolvedTargetId);
        if (!target) {
          throw new CDPServerError("Unable to resolve target");
        }
        return this.browserTarget.getWindowForTarget(target);
      }
      handleTargetGetBrowserContexts() {
        return { browserContextIds: this.browserTarget.getBrowserContexts() };
      }
      async handleTargetCreateBrowserContext() {
        const browserContextId = await this.browserTarget.createBrowserContext();
        return { browserContextId };
      }
      async handleTargetDisposeBrowserContext({ browserContextId }) {
        await this.browserTarget.disposeBrowserContext(browserContextId);
        return {};
      }
      handleTargetAttachToBrowserTarget(sessionId) {
        if (sessionId !== void 0 && sessionId !== ROOT_SESSION_ID) {
          throw new CDPInvalidParamsError("This implementation only supports attachToBrowserTarget from the root session");
        }
        const browserSessionId = `browser-session-${generateUuid()}`;
        this._browserSessions.set(browserSessionId, { lifecycleSessionId: sessionId, discover: false, autoAttachments: void 0, sessionIds: /* @__PURE__ */ new Set() });
        this.sendEvent("Target.attachedToTarget", {
          sessionId: browserSessionId,
          targetInfo: this.browserTarget.targetInfo,
          waitingForDebugger: false
        }, sessionId);
        return { sessionId: browserSessionId };
      }
      handleTargetActivateTarget({ targetId }) {
        const target = this._targets.get(targetId);
        if (!target) {
          throw new CDPServerError("Unable to resolve target");
        }
        return this.browserTarget.activateTarget(target);
      }
      async handleTargetSetAutoAttach(params, sessionId) {
        const browserSession = this._browserSessions.get(sessionId ?? ROOT_SESSION_ID);
        if (!browserSession) {
          const connection = this._sessions.get(sessionId);
          if (!connection) {
            throw new CDPServerError(`Session not found: ${sessionId}`);
          }
          return connection.sendCommand("Target.setAutoAttach", params);
        }
        if (!params.flatten) {
          throw new CDPInvalidParamsError("This implementation only supports auto-attach with flatten=true");
        }
        if (params.autoAttach) {
          browserSession.autoAttachments ??= /* @__PURE__ */ new Map();
          await Promise.all([...this._targets.values()].map((target) => this.autoAttachTarget(target, sessionId ?? ROOT_SESSION_ID)));
        } else {
          const attachments = [...browserSession.autoAttachments?.values() ?? []];
          browserSession.autoAttachments = void 0;
          await Promise.all(attachments.map(async (attachment) => (await attachment).dispose()));
        }
        return {};
      }
      autoAttachTarget(target, browserSessionId) {
        const attachments = this._browserSessions.get(browserSessionId)?.autoAttachments;
        if (!attachments) {
          throw new CDPServerError(`Auto-attach is not enabled for session ${browserSessionId}`);
        }
        const existing = attachments.get(target);
        if (existing) {
          return existing;
        }
        const attachment = target.attach(browserSessionId).catch((error) => {
          if (attachments.get(target) === attachment) {
            attachments.delete(target);
          }
          throw error;
        });
        attachments.set(target, attachment);
        return attachment;
      }
      async handleTargetSetDiscoverTargets({ discover = false }, sessionId) {
        const browserSession = this._browserSessions.get(sessionId ?? ROOT_SESSION_ID);
        if (!browserSession) {
          throw new CDPServerError(`Session not found: ${sessionId}`);
        }
        if (discover !== browserSession.discover) {
          browserSession.discover = discover;
          if (discover) {
            for (const target of this._targets.values()) {
              this.sendEvent("Target.targetCreated", { targetInfo: target.targetInfo }, sessionId);
            }
          }
        }
        return {};
      }
      async handleTargetGetTargets() {
        return { targetInfos: Array.from(this._targets.values()).map((target) => target.targetInfo) };
      }
      async handleTargetGetTargetInfo({ targetId } = {}, sessionId) {
        targetId ??= sessionId ? this._sessions.get(sessionId)?.targetId : void 0;
        if (!targetId) {
          return { targetInfo: this.browserTarget.targetInfo };
        }
        const target = this._targets.get(targetId);
        if (!target) {
          throw new CDPServerError("Unable to resolve target");
        }
        return { targetInfo: target.targetInfo };
      }
      async handleTargetAttachToTarget({ targetId, flatten }, sessionId) {
        if (!flatten) {
          throw new CDPInvalidParamsError("This implementation only supports attachToTarget with flatten=true");
        }
        const target = this._targets.get(targetId);
        if (!target) {
          throw new CDPServerError("Unable to resolve target");
        }
        const connection = await target.attach(sessionId);
        return { sessionId: connection.sessionId };
      }
      async handleTargetDetachFromTarget({ sessionId }) {
        const browserSession = this._browserSessions.get(sessionId);
        if (browserSession && sessionId !== ROOT_SESSION_ID) {
          const attachments = [...browserSession.autoAttachments?.values() ?? []];
          await Promise.all(attachments.map(async (attachment) => (await attachment).dispose()));
          for (const ownedSessionId of [...browserSession.sessionIds]) {
            this._sessions.get(ownedSessionId)?.dispose();
          }
          this.sendEvent("Target.detachedFromTarget", {
            sessionId,
            targetId: this.targetId
          }, browserSession.lifecycleSessionId);
          this._browserSessions.delete(sessionId);
          return {};
        }
        const connection = this._sessions.get(sessionId);
        if (!connection) {
          throw new CDPServerError(`Session not found: ${sessionId}`);
        }
        connection.dispose();
        return {};
      }
      async handleTargetCreateTarget({ url, browserContextId }) {
        const target = await this.browserTarget.createTarget(url || "about:blank", browserContextId);
        this.registerTarget(target);
        await Promise.all([...this._browserSessions].filter(([, state]) => state.autoAttachments).map(([browserSessionId]) => this.autoAttachTarget(target, browserSessionId)));
        return { targetId: target.targetInfo.targetId };
      }
      async handleTargetCloseTarget({ targetId }) {
        try {
          const target = this._targets.get(targetId);
          if (!target) {
            throw new CDPServerError("Unable to resolve target");
          }
          await this.browserTarget.closeTarget(target);
          return { success: true };
        } catch {
          return { success: false };
        }
      }
      // #endregion
    };
  }
});
export { ROOT_SESSION_ID, CDPBrowserProxy, init_proxy };
