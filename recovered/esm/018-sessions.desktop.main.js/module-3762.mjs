// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/browserView/browser/sessionBrowserView.ts
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { BrowserEditorInput } from "./module-1489.mjs";
import { Emitter } from "./module-0017.mjs";
import { runOnChange } from "./module-0064.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IBrowserViewWorkbenchService } from "./module-1243.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";


// src/vs/sessions/contrib/browserView/browser/sessionBrowserView.ts
var SessionBrowserViewController = class extends Disposable {
  constructor(_sessionManagementService, _sessionsService, _browserViewService, _editorService, _editorGroupsService) {
    super();
    this._sessionManagementService = _sessionManagementService;
    this._sessionsService = _sessionsService;
    this._browserViewService = _browserViewService;
    this._editorService = _editorService;
    this._editorGroupsService = _editorGroupsService;
    /**
     * Tracks browser view inputs with their owning session. The
     * DisposableMap cleans up lifecycle listeners on deletion/disposal.
     */
    this._trackedInputs = this._register(new DisposableMap());
    this._register(this._editorService.onWillOpenEditor((e4) => {
      if (e4.editor instanceof BrowserEditorInput) {
        this._attachLifecycle(e4.editor);
      }
    }));
    this._register(this._editorGroupsService.onDidAddGroup((group2) => {
      for (const editor of group2.editors) {
        if (editor instanceof BrowserEditorInput) {
          this._attachLifecycle(editor);
        }
      }
    }));
    const onDidChangeActiveSession = this._register(new Emitter());
    this._register(runOnChange(this._sessionsService.activeSession, () => onDidChangeActiveSession.fire()));
    this._register(this._browserViewService.registerContextualFilter({
      include: (input, context2) => {
        const tracked = this._trackedInputs.get(input.id);
        const ownerId2 = input.model?.owner.type === "agent" ? input.model.owner.sessionId : tracked?.session.resource.toString();
        if (!ownerId2) {
          return true;
        }
        const owningSession = this._resolveOwningSession(ownerId2) ?? tracked?.session;
        if (!owningSession) {
          return true;
        }
        const activeSession = context2.activeSessionId ? this._resolveOwningSession(context2.activeSessionId) : this._sessionsService.activeSession.read(void 0);
        return activeSession?.sessionId === owningSession.sessionId;
      },
      onDidChange: onDidChangeActiveSession.event
    }));
    this._register(this._browserViewService.registerOpenHandler({
      shouldOpenEditor: (_input, owner) => {
        if (owner.type !== "agent") {
          return true;
        }
        const owningSession = this._resolveOwningSession(owner.sessionId);
        if (!owningSession) {
          return true;
        }
        const activeSession = this._sessionsService.activeSession.read(void 0);
        return owningSession.sessionId === activeSession?.sessionId;
      }
    }));
    this._register(this._sessionManagementService.onDidChangeSessions((e4) => {
      if (e4.removed.length === 0 || this._trackedInputs.size === 0) {
        return;
      }
      const removedSessionIds = new Set(e4.removed.map((s) => s.resource.toString()));
      const known = this._browserViewService.getKnownBrowserViews();
      for (const [id2, { session }] of this._trackedInputs) {
        if (removedSessionIds.has(session.resource.toString())) {
          const existingInput = known.get(id2);
          if (existingInput instanceof BrowserEditorInput) {
            existingInput.dispose(true);
          }
        }
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.sessionBrowserViewController";
  }
  /**
   * Resolves a browser view owner id (the *chat* resource string the
   * browser tools stamp onto `IBrowserViewOwner.sessionId`) to the
   * `ISession` that owns it. A session's browsers can be opened from any
   * of its chats (main, peer, or subagent), so this looks up the owning
   * session across all chats rather than comparing against the session's
   * own resource directly.
   */
  _resolveOwningSession(ownerId2) {
    let resource;
    try {
      resource = URI.parse(ownerId2);
    } catch {
      return void 0;
    }
    return this._sessionManagementService.getSessionForChatResource(resource)?.session ?? this._sessionManagementService.getSession(resource);
  }
  _attachLifecycle(input) {
    if (this._trackedInputs.has(input.id)) {
      return;
    }
    const session = this._sessionsService.activeSession.read(void 0);
    if (!session) {
      return;
    }
    const store = new DisposableStore();
    this._trackedInputs.set(input.id, { session, dispose: () => store.dispose() });
    store.add(runOnChange(session.isArchived, (isArchived) => {
      if (isArchived) {
        input.dispose(true);
      }
    }));
    store.add(input.onBeforeDispose((e4) => {
      const activeSession = this._sessionsService.activeSession.read(void 0);
      if (session.sessionId !== activeSession?.sessionId) {
        e4.veto();
      }
    }));
    store.add(input.onWillDispose(() => {
      store.dispose();
      this._trackedInputs.deleteAndDispose(input.id);
    }));
  }
};

SessionBrowserViewController = __decorateClass([
  __decorateParam(0, ISessionsManagementService),
  __decorateParam(1, ISessionsService),
  __decorateParam(2, IBrowserViewWorkbenchService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IEditorGroupsService)
], SessionBrowserViewController);
export { SessionBrowserViewController };
