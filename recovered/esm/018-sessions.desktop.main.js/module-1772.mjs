// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/services/sessions/browser/closedItemHistory.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { SessionsHasClosedItemContext } from "./module-1770.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsPartService } from "./module-1771.mjs";
import { IContextKeyService } from "./module-0089.mjs";


// src/vs/sessions/services/sessions/browser/closedItemHistory.ts
var ClosedItemHistory = class extends Disposable {
  constructor(_visibility, _openChat, _sessionsManagementService, _sessionsPartService, contextKeyService) {
    super();
    this._visibility = _visibility;
    this._openChat = _openChat;
    this._sessionsManagementService = _sessionsManagementService;
    this._sessionsPartService = _sessionsPartService;
    this._item = observableValue(this, void 0);
    this._suspendDepth = 0;
    const hasClosedItem = SessionsHasClosedItemContext.bindTo(contextKeyService);
    this._register(autorun((reader) => hasClosedItem.set(this._item.read(reader) !== void 0)));
    this._register(this._sessionsManagementService.onDidDeleteSession((session) => {
      if (this._item.get()?.session.sessionId === session.sessionId) {
        this._item.set(void 0, void 0);
      }
    }));
  }
  /** Remember a chat that was hidden from its session's tab strip. */
  recordClosedChat(session, chatResource) {
    this._record({ kind: "chat" /* Chat */, session, chatResource });
  }
  /**
   * Remember a session the user closed, together with the grid slot it holds
   * right now, so it can return to exactly that position. Must be called
   * before the session leaves the grid; a session that is not visible is
   * ignored.
   */
  recordClosedSession(session) {
    const slot = this._visibility.getSlot(session.sessionId);
    if (slot) {
      this._recordSession(session, slot.index, slot.sticky);
    }
  }
  /**
   * Remember a session that lost its grid slot to a newly opened one, so it
   * can take that slot back.
   */
  recordReplacedSlot(replaced, index2, sticky, replacedBySessionId) {
    this._recordSession(replaced, index2, sticky, { sessionId: replacedBySessionId });
  }
  /**
   * Reopen the remembered chat or session and focus it, consuming the entry.
   * No-op when nothing is remembered or the session is gone.
   */
  async reopenLast() {
    const item = this._item.get();
    if (!item) {
      return;
    }
    this._item.set(void 0, void 0);
    const session = this._sessionsManagementService.getSessions().find((s) => s.sessionId === item.session.sessionId);
    if (!session) {
      return;
    }
    const suspension = this._suspend();
    try {
      if (item.kind === "chat" /* Chat */) {
        await this._openChat(session, item.chatResource);
      } else {
        this._reopenSession(item, session);
      }
    } finally {
      suspension.dispose();
    }
    this._sessionsPartService.focusSession(this._visibility.activeSession.get());
  }
  _reopenSession(item, session) {
    if (item.replacedBy && this._visibility.getSlot(item.replacedBy.sessionId)) {
      this._sessionsManagementService.discardNewSession(this._visibility.getSession(item.replacedBy.sessionId));
      if (this._visibility.replaceSlot(item.replacedBy.sessionId, session, item.sticky)) {
        return;
      }
    }
    this._visibility.insertAtIndex(session, item.index, item.sticky);
  }
  _recordSession(session, index2, sticky, replacedBy) {
    if (session.status.get() !== 0 /* Untitled */) {
      this._record({ kind: "session" /* Session */, session, index: index2, sticky, replacedBy });
    }
  }
  _record(item) {
    if (this._suspendDepth === 0) {
      this._item.set(item, void 0);
    }
  }
  _suspend() {
    this._suspendDepth++;
    return toDisposable(() => this._suspendDepth--);
  }
};

ClosedItemHistory = __decorateClass([
  __decorateParam(2, ISessionsManagementService),
  __decorateParam(3, ISessionsPartService),
  __decorateParam(4, IContextKeyService)
], ClosedItemHistory);
export { ClosedItemHistory };
