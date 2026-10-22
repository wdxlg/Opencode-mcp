// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingEditorContextKeys.ts
import { RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { DisposableMap, DisposableStore } from "./module-0012.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { Event2 } from "./module-0017.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IEditorGroupsService } from "./module-0933.mjs";
import { derived } from "./module-0054.mjs";
import { EditorResourceAccessor } from "./module-0925.mjs";
import { constObservable } from "./module-0061.mjs";
import { IInlineChatSessionService } from "./module-1899.mjs";
import { IChatEditingService } from "./module-1081.mjs";
import { IChatService } from "./module-0972.mjs";


// src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingEditorContextKeys.ts
var ctxIsGlobalEditingSession = new RawContextKey("chatEdits.isGlobalEditingSession", void 0, localize(10847, null));

var ctxHasEditorModification = new RawContextKey("chatEdits.hasEditorModifications", void 0, localize(10850, null));

var ctxIsCurrentlyBeingModified = new RawContextKey("chatEdits.isCurrentlyBeingModified", void 0, localize(10851, null));

var ctxReviewModeEnabled = new RawContextKey("chatEdits.isReviewModeEnabled", true, localize(10849, null));

var ctxHasRequestInProgress = new RawContextKey("chatEdits.isRequestInProgress", false, localize(10848, null));

var ctxRequestCount = new RawContextKey("chatEdits.requestCount", 0, localize(10852, null));

var ctxCursorInChangeRange = new RawContextKey("chatEdits.cursorInChangeRange", false, localize(10846, null));

var ChatEditingEditorContextKeys = class {
  constructor(instaService, editorGroupsService) {
    this._store = new DisposableStore();
    const editorGroupCtx = this._store.add(new DisposableMap());
    const editorGroups = observableFromEvent(
      this,
      Event2.any(editorGroupsService.onDidAddGroup, editorGroupsService.onDidRemoveGroup),
      () => editorGroupsService.groups
    );
    this._store.add(autorun((r2) => {
      const toDispose = new Set(editorGroupCtx.keys());
      for (const group2 of editorGroups.read(r2)) {
        toDispose.delete(group2);
        if (editorGroupCtx.has(group2)) {
          continue;
        }
        editorGroupCtx.set(group2, instaService.createInstance(ContextKeyGroup, group2));
      }
      for (const item of toDispose) {
        editorGroupCtx.deleteAndDispose(item);
      }
    }));
  }
  static {
    this.ID = "chat.edits.editorContextKeys";
  }
  dispose() {
    this._store.dispose();
  }
};

ChatEditingEditorContextKeys = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IEditorGroupsService)
], ChatEditingEditorContextKeys);

var ContextKeyGroup = class {
  constructor(group2, inlineChatSessionService, chatEditingService, chatService) {
    this._store = new DisposableStore();
    this._ctxIsGlobalEditingSession = ctxIsGlobalEditingSession.bindTo(group2.scopedContextKeyService);
    this._ctxHasEditorModification = ctxHasEditorModification.bindTo(group2.scopedContextKeyService);
    this._ctxIsCurrentlyBeingModified = ctxIsCurrentlyBeingModified.bindTo(group2.scopedContextKeyService);
    this._ctxHasRequestInProgress = ctxHasRequestInProgress.bindTo(group2.scopedContextKeyService);
    this._ctxReviewModeEnabled = ctxReviewModeEnabled.bindTo(group2.scopedContextKeyService);
    this._ctxRequestCount = ctxRequestCount.bindTo(group2.scopedContextKeyService);
    const editorObs = observableFromEvent(this, group2.onDidModelChange, () => group2.activeEditor);
    const tupleObs = derived((r2) => {
      const editor = editorObs.read(r2);
      const uri5 = EditorResourceAccessor.getOriginalUri(editor, { supportSideBySide: 1 /* PRIMARY */ });
      if (!uri5) {
        this._reset();
        return;
      }
      return new ObservableEditorSession(uri5, chatEditingService, inlineChatSessionService).value.read(r2);
    });
    this._store.add(autorun((r2) => {
      const tuple = tupleObs.read(r2);
      if (!tuple) {
        this._reset();
        return;
      }
      const { session, entry } = tuple;
      const chatModel = chatService.getSession(session.chatSessionResource);
      this._ctxHasEditorModification.set(entry?.state.read(r2) === 0 /* Modified */);
      this._ctxIsGlobalEditingSession.set(session.isGlobalEditingSession);
      this._ctxReviewModeEnabled.set(entry ? entry.reviewMode.read(r2) : false);
      this._ctxHasRequestInProgress.set(chatModel?.requestInProgress.read(r2) ?? false);
      this._ctxIsCurrentlyBeingModified.set(!!entry?.isCurrentlyBeingModifiedBy.read(r2));
      const requestCount = chatModel ? observableFromEvent(this, chatModel.onDidChange, () => chatModel.getRequests().length) : constObservable(0);
      this._ctxRequestCount.set(requestCount.read(r2));
    }));
  }
  _reset() {
    this._ctxIsGlobalEditingSession.reset();
    this._ctxHasEditorModification.reset();
    this._ctxHasRequestInProgress.reset();
    this._ctxReviewModeEnabled.reset();
    this._ctxRequestCount.reset();
  }
  dispose() {
    this._store.dispose();
    this._reset();
  }
};

ContextKeyGroup = __decorateClass([
  __decorateParam(1, IInlineChatSessionService),
  __decorateParam(2, IChatEditingService),
  __decorateParam(3, IChatService)
], ContextKeyGroup);

var ObservableEditorSession = class {
  constructor(uri5, chatEditingService, inlineChatService) {
    const inlineSessionObs = observableFromEvent(this, inlineChatService.onDidChangeSessions, () => inlineChatService.getSessionByTextModel(uri5));
    const sessionObs = chatEditingService.editingSessionsObs.map((value2, r2) => {
      for (const session of value2) {
        const entry = session.readEntry(uri5, r2);
        if (entry) {
          return { session, entry, isInlineChat: false };
        }
      }
      return void 0;
    });
    this.value = derived((r2) => {
      const inlineSession = inlineSessionObs.read(r2);
      if (inlineSession) {
        return { session: inlineSession.editingSession, entry: inlineSession.editingSession.readEntry(uri5, r2), isInlineChat: true };
      }
      return sessionObs.read(r2);
    });
  }
};

ObservableEditorSession = __decorateClass([
  __decorateParam(1, IChatEditingService),
  __decorateParam(2, IInlineChatSessionService)
], ObservableEditorSession);
export { ctxIsGlobalEditingSession, ctxHasEditorModification, ctxIsCurrentlyBeingModified, ctxReviewModeEnabled, ctxHasRequestInProgress, ctxRequestCount, ctxCursorInChangeRange, ChatEditingEditorContextKeys, ContextKeyGroup, ObservableEditorSession };
