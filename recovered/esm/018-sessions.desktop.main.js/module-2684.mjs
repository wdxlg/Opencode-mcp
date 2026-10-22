// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingEditorActions.ts
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME, IChatEditingService, parseChatMultiDiffUri } from "./module-1082.mjs";
import { ACTIVE_GROUP, IEditorService } from "./module-0935.mjs";
import { EditorResourceAccessor, TEXT_DIFF_EDITOR_ID } from "./module-0926.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { ctxCursorInChangeRange, ctxHasEditorModification, ctxHasRequestInProgress, ctxIsCurrentlyBeingModified, ctxIsGlobalEditingSession, ctxReviewModeEnabled } from "./module-2051.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { NOTEBOOK_CELL_LIST_FOCUSED, NOTEBOOK_EDITOR_FOCUSED } from "./module-1844.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ActiveEditorContext } from "./module-0950.mjs";
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from "./module-0104.mjs";
import { IEditorGroupsService } from "./module-0934.mjs";
import { IListService } from "./module-0636.mjs";
import { resolveCommandsContext } from "./module-1529.mjs";
import { MultiDiffEditorInput } from "./module-1149.mjs";
import { IChatEditingExplanationModelManager } from "./module-2683.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { IViewsService } from "./module-1246.mjs";
import { MultiDiffEditor } from "./module-2681.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { URI } from "./module-0032.mjs";
import { ChatEditingExplanationWidgetManager } from "./module-2682.mjs";
import { CancellationToken } from "./module-0025.mjs";


// src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingEditorActions.ts
var ChatEditingEditorAction = class extends Action2 {
  constructor(desc) {
    super({
      category: CHAT_CATEGORY,
      ...desc
    });
  }
  async run(accessor, ...args2) {
    const instaService = accessor.get(IInstantiationService);
    const chatEditingService = accessor.get(IChatEditingService);
    const editorService = accessor.get(IEditorService);
    const uri4 = EditorResourceAccessor.getOriginalUri(editorService.activeEditorPane?.input, { supportSideBySide: 1 /* PRIMARY */ });
    if (!uri4 || !editorService.activeEditorPane) {
      return;
    }
    const session = chatEditingService.editingSessionsObs.get().find((candidate) => candidate.getEntry(uri4));
    if (!session) {
      return;
    }
    const entry = session.getEntry(uri4);
    const ctrl = entry.getEditorIntegration(editorService.activeEditorPane);
    return instaService.invokeFunction(this.runChatEditingCommand.bind(this), session, entry, ctrl, ...args2);
  }
};

var NavigateAction = class extends ChatEditingEditorAction {
  constructor(next) {
    super({
      id: next ? "chatEditor.action.navigateNext" : "chatEditor.action.navigatePrevious",
      title: next ? localize2(10841, "Go to Next Chat Edit") : localize2(10842, "Go to Previous Chat Edit"),
      icon: next ? Codicon.arrowDown : Codicon.arrowUp,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ctxHasEditorModification),
      keybinding: {
        primary: next ? 512 /* Alt */ | 63 /* F5 */ : 512 /* Alt */ | 1024 /* Shift */ | 63 /* F5 */,
        weight: 200 /* WorkbenchContrib */,
        when: ContextKeyExpr.and(
          ctxHasEditorModification,
          ContextKeyExpr.or(EditorContextKeys.focus, NOTEBOOK_CELL_LIST_FOCUSED)
        )
      },
      f1: true,
      menu: {
        id: MenuId.ChatEditingEditorContent,
        group: "navigate",
        order: !next ? 2 : 3,
        when: ContextKeyExpr.and(ctxReviewModeEnabled, ctxHasEditorModification)
      }
    });
    this.next = next;
  }
  async runChatEditingCommand(accessor, session, entry, ctrl) {
    const instaService = accessor.get(IInstantiationService);
    const done = this.next ? ctrl.next(false) : ctrl.previous(false);
    if (done) {
      return;
    }
    const didOpenNext = await instaService.invokeFunction(openNextOrPreviousChange, session, entry, this.next);
    if (didOpenNext) {
      return;
    }
    this.next ? ctrl.next(true) : ctrl.previous(true);
  }
};

async function openNextOrPreviousChange(accessor, session, entry, next) {
  const editorService = accessor.get(IEditorService);
  const entries2 = session.entries.get();
  let idx = entries2.indexOf(entry);
  let newEntry;
  while (true) {
    idx = (idx + (next ? 1 : -1) + entries2.length) % entries2.length;
    newEntry = entries2[idx];
    if (newEntry.state.get() === 0 /* Modified */) {
      break;
    } else if (newEntry === entry) {
      return false;
    }
  }
  const pane = await editorService.openEditor({
    resource: newEntry.modifiedURI,
    options: {
      revealIfOpened: false,
      revealIfVisible: false
    }
  }, ACTIVE_GROUP);
  if (!pane) {
    return false;
  }
  if (session.entries.get().includes(newEntry)) {
    newEntry.getEditorIntegration(pane).reveal(next);
  }
  return true;
}

var KeepOrUndoAction = class extends ChatEditingEditorAction {
  constructor(id2, _keep) {
    super({
      id: id2,
      title: _keep ? localize2(10825, "Keep Chat Edits") : localize2(10835, "Undo Chat Edits"),
      shortTitle: _keep ? localize2(10826, "Keep") : localize2(10836, "Undo"),
      tooltip: _keep ? localize2(10827, "Keep Chat Edits in this File") : localize2(10837, "Undo Chat Edits in this File"),
      precondition: ContextKeyExpr.and(ctxHasEditorModification, ctxIsCurrentlyBeingModified.negate()),
      icon: _keep ? Codicon.check : Codicon.discard,
      f1: true,
      keybinding: {
        when: ContextKeyExpr.or(EditorContextKeys.focus, NOTEBOOK_EDITOR_FOCUSED),
        weight: 200 /* WorkbenchContrib */ + 10,
        // win over new-window-action
        primary: _keep ? 2048 /* CtrlCmd */ | 1024 /* Shift */ | 55 /* KeyY */ : 2048 /* CtrlCmd */ | 1024 /* Shift */ | 44 /* KeyN */
      },
      menu: {
        id: MenuId.ChatEditingEditorContent,
        group: "a_resolve",
        order: _keep ? 0 : 1,
        when: ContextKeyExpr.and(!_keep ? ctxReviewModeEnabled : void 0, ContextKeyExpr.or(ctxIsGlobalEditingSession, ctxHasRequestInProgress.negate()))
      }
    });
    this._keep = _keep;
  }
  async runChatEditingCommand(accessor, session, entry, _integration) {
    const instaService = accessor.get(IInstantiationService);
    const configService = accessor.get(IConfigurationService);
    if (this._keep) {
      session.accept(entry.modifiedURI);
    } else {
      session.reject(entry.modifiedURI);
    }
    if (configService.getValue("chat.editing.revealNextChangeOnResolve" /* RevealNextChangeOnResolve */)) {
      await instaService.invokeFunction(openNextOrPreviousChange, session, entry, true);
    }
  }
};

var AcceptAction2 = class _AcceptAction extends KeepOrUndoAction {
  static {
    this.ID = "chatEditor.action.accept";
  }
  constructor() {
    super(_AcceptAction.ID, true);
  }
};

var RejectAction = class _RejectAction extends KeepOrUndoAction {
  static {
    this.ID = "chatEditor.action.reject";
  }
  constructor() {
    super(_RejectAction.ID, false);
  }
};

var acceptHunkId = "chatEditor.action.acceptHunk";

var undoHunkId = "chatEditor.action.undoHunk";

var AcceptRejectHunkAction = class extends ChatEditingEditorAction {
  constructor(_accept) {
    super(
      {
        id: _accept ? acceptHunkId : undoHunkId,
        title: _accept ? localize2(10831, "Keep this Change") : localize2(10844, "Undo this Change"),
        shortTitle: _accept ? localize2(10832, "Keep") : localize2(10845, "Undo"),
        precondition: ContextKeyExpr.and(ctxHasEditorModification, ctxIsCurrentlyBeingModified.negate()),
        f1: true,
        keybinding: {
          when: ContextKeyExpr.and(ctxCursorInChangeRange, ContextKeyExpr.or(EditorContextKeys.focus, NOTEBOOK_CELL_LIST_FOCUSED)),
          weight: 200 /* WorkbenchContrib */ + 1,
          primary: _accept ? 2048 /* CtrlCmd */ | 55 /* KeyY */ : 2048 /* CtrlCmd */ | 44 /* KeyN */
        },
        menu: {
          id: MenuId.ChatEditingEditorHunk,
          order: 1
        }
      }
    );
    this._accept = _accept;
  }
  async runChatEditingCommand(accessor, session, entry, ctrl, ...args2) {
    const instaService = accessor.get(IInstantiationService);
    const configService = accessor.get(IConfigurationService);
    if (this._accept) {
      await ctrl.acceptNearestChange(args2[0]);
    } else {
      await ctrl.rejectNearestChange(args2[0]);
    }
    if (configService.getValue("chat.editing.revealNextChangeOnResolve" /* RevealNextChangeOnResolve */) && entry.changesCount.get() === 0) {
      await instaService.invokeFunction(openNextOrPreviousChange, session, entry, true);
    }
  }
};

var AcceptHunkAction = class extends AcceptRejectHunkAction {
  static {
    this.ID = acceptHunkId;
  }
  constructor() {
    super(true);
  }
};

var RejectHunkAction = class extends AcceptRejectHunkAction {
  static {
    this.ID = undoHunkId;
  }
  constructor() {
    super(false);
  }
};

var ToggleDiffAction = class extends ChatEditingEditorAction {
  constructor() {
    super({
      id: "chatEditor.action.toggleDiff",
      title: localize2(10834, "Toggle Diff Editor for Chat Edits"),
      category: CHAT_CATEGORY,
      toggled: {
        condition: ContextKeyExpr.or(EditorContextKeys.inDiffEditor, ActiveEditorContext.isEqualTo(TEXT_DIFF_EDITOR_ID)),
        icon: Codicon.goToFile
      },
      precondition: ContextKeyExpr.and(ctxHasEditorModification),
      icon: Codicon.diffSingle,
      keybinding: {
        when: EditorContextKeys.focus,
        weight: 200 /* WorkbenchContrib */,
        primary: 512 /* Alt */ | 1024 /* Shift */ | 65 /* F7 */
      },
      menu: [{
        id: MenuId.ChatEditingEditorHunk,
        order: 10
      }, {
        id: MenuId.ChatEditingEditorContent,
        group: "a_resolve",
        order: 2,
        when: ContextKeyExpr.and(ctxReviewModeEnabled)
      }]
    });
  }
  runChatEditingCommand(_accessor, _session, _entry, integration, ...args2) {
    integration.toggleDiff(args2[0]);
  }
};

var ToggleAccessibleDiffViewAction = class extends ChatEditingEditorAction {
  constructor() {
    super({
      id: "chatEditor.action.showAccessibleDiffView",
      title: localize2(10833, "Show Accessible Diff View for Chat Edits"),
      f1: true,
      precondition: ContextKeyExpr.and(ctxHasEditorModification, ctxIsCurrentlyBeingModified.negate()),
      keybinding: {
        when: ContextKeyExpr.and(EditorContextKeys.focus, CONTEXT_ACCESSIBILITY_MODE_ENABLED),
        weight: 200 /* WorkbenchContrib */,
        primary: 65 /* F7 */
      }
    });
  }
  runChatEditingCommand(_accessor, _session, _entry, integration) {
    integration.enableAccessibleDiffView();
  }
};

var ReviewChangesAction = class extends ChatEditingEditorAction {
  constructor() {
    super({
      id: "chatEditor.action.reviewChanges",
      title: localize2(10843, "Review"),
      precondition: ContextKeyExpr.and(ctxHasEditorModification, ctxIsCurrentlyBeingModified.negate()),
      menu: [{
        id: MenuId.ChatEditingEditorContent,
        group: "a_resolve",
        order: 3,
        when: ContextKeyExpr.and(ctxReviewModeEnabled.negate(), ctxIsCurrentlyBeingModified.negate(), ContextKeyExpr.or(ctxIsGlobalEditingSession, ctxHasRequestInProgress.negate()))
      }]
    });
  }
  runChatEditingCommand(_accessor, _session, entry, _integration, ..._args) {
    entry.enableReviewModeUntilSettled();
  }
};

var AcceptAllEditsAction = class _AcceptAllEditsAction extends ChatEditingEditorAction {
  static {
    this.ID = "chatEditor.action.acceptAllEdits";
  }
  constructor() {
    super({
      id: _AcceptAllEditsAction.ID,
      title: localize2(10829, "Keep All Chat Edits"),
      tooltip: localize2(10830, "Keep All Chat Edits in this Session"),
      precondition: ContextKeyExpr.and(ctxHasEditorModification, ctxIsCurrentlyBeingModified.negate()),
      icon: Codicon.checkAll,
      f1: true,
      keybinding: {
        when: ContextKeyExpr.or(EditorContextKeys.focus, NOTEBOOK_EDITOR_FOCUSED),
        weight: 200 /* WorkbenchContrib */ + 10,
        primary: 2048 /* CtrlCmd */ | 512 /* Alt */ | 55 /* KeyY */
      }
    });
  }
  async runChatEditingCommand(_accessor, session, _entry, _integration, ..._args) {
    await session.accept();
  }
};

var MultiDiffAcceptDiscardAction = class extends Action2 {
  constructor(accept) {
    super({
      id: accept ? "chatEditing.multidiff.acceptAllFiles" : "chatEditing.multidiff.discardAllFiles",
      title: accept ? localize(10828, null) : localize(10838, null),
      icon: accept ? Codicon.check : Codicon.discard,
      menu: {
        when: ContextKeyExpr.equals("resourceScheme", CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME),
        id: MenuId.EditorTitle,
        order: accept ? 0 : 1,
        group: "navigation"
      }
    });
    this.accept = accept;
  }
  async run(accessor, ...args2) {
    const chatEditingService = accessor.get(IChatEditingService);
    const editorService = accessor.get(IEditorService);
    const editorGroupsService = accessor.get(IEditorGroupsService);
    const listService = accessor.get(IListService);
    const resolvedContext = resolveCommandsContext(args2, editorService, editorGroupsService, listService);
    const groupContext = resolvedContext.groupedEditors[0];
    if (!groupContext) {
      return;
    }
    const editor = groupContext.editors[0];
    if (!(editor instanceof MultiDiffEditorInput) || !editor.resource) {
      return;
    }
    const { chatSessionResource } = parseChatMultiDiffUri(editor.resource);
    const session = chatEditingService.getEditingSession(chatSessionResource);
    if (session) {
      if (this.accept) {
        await session.accept();
      } else {
        await session.reject();
      }
      editorService.closeEditor({ editor, groupId: groupContext.group.id });
    }
  }
};

var explainMultiDiffSchemes = [CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME, "copilotcli-worktree-changes", "copilotcloud-pr-changes"];

var ExplainMultiDiffAction = class extends Action2 {
  constructor() {
    super({
      id: "chatEditing.multidiff.explain",
      title: localize(10839, null),
      menu: {
        when: ContextKeyExpr.and(ContextKeyExpr.or(...explainMultiDiffSchemes.map((scheme) => ContextKeyExpr.equals("resourceScheme", scheme))), ContextKeyExpr.has(`config.${"chat.editing.explainChanges.enabled" /* ExplainChangesEnabled */}`)),
        id: MenuId.MultiDiffEditorContent,
        order: 10
      }
    });
    this._widgetsByInput = /* @__PURE__ */ new WeakMap();
  }
  async run(accessor, ...args2) {
    const editorService = accessor.get(IEditorService);
    const explanationModelManager = accessor.get(IChatEditingExplanationModelManager);
    const chatWidgetService = accessor.get(IChatWidgetService);
    const viewsService = accessor.get(IViewsService);
    const chatEditingService = accessor.get(IChatEditingService);
    const activePane = editorService.activeEditorPane;
    if (!activePane) {
      return;
    }
    if (!(activePane instanceof MultiDiffEditor) || !activePane.viewModel) {
      return;
    }
    const input = activePane.input;
    if (!input) {
      return;
    }
    this._widgetsByInput.get(input)?.dispose();
    const widgetsStore = new DisposableStore();
    this._widgetsByInput.set(input, widgetsStore);
    Event2.once(input.onWillDispose)(() => {
      widgetsStore.dispose();
      this._widgetsByInput.delete(input);
    });
    const viewModel = activePane.viewModel;
    const items = viewModel.items.get();
    let chatSessionResource;
    if (input instanceof MultiDiffEditorInput && input.resource?.scheme === CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME) {
      chatSessionResource = parseChatMultiDiffUri(input.resource).chatSessionResource;
    }
    if (!chatSessionResource) {
      const fileUris = items.map((item) => {
        const docDiffItem = item.documentDiffItem;
        const goToFileUri = docDiffItem?.multiDiffEditorItem?.goToFileUri;
        if (goToFileUri) {
          return goToFileUri;
        }
        const modifiedUri = docDiffItem?.multiDiffEditorItem?.modifiedUri ?? item.modifiedUri;
        if (modifiedUri?.path) {
          return URI.file(modifiedUri.path);
        }
        return void 0;
      }).filter((uri4) => !!uri4);
      for (const session of chatEditingService.editingSessionsObs.get()) {
        if (fileUris.some((uri4) => session.getEntry(uri4))) {
          chatSessionResource = session.chatSessionResource;
          break;
        }
      }
    }
    const diffsByFile = /* @__PURE__ */ new Map();
    for (const item of items) {
      const modifiedUri = item.modifiedUri;
      if (!modifiedUri) {
        continue;
      }
      const editorInfo = activePane.tryGetCodeEditor(modifiedUri);
      if (!editorInfo) {
        continue;
      }
      const diffEditorVM = item.diffEditorViewModel;
      await diffEditorVM.waitForDiff();
      const diff4 = diffEditorVM.diff.get();
      if (!diff4 || diff4.identical) {
        continue;
      }
      const fileKey = modifiedUri.toString();
      const existing = diffsByFile.get(fileKey);
      if (existing) {
        existing.changes.push(...diff4.mappings.map((m) => m.lineRangeMapping));
      } else {
        diffsByFile.set(fileKey, {
          editor: editorInfo.editor,
          changes: diff4.mappings.map((m) => m.lineRangeMapping),
          originalModel: diffEditorVM.model.original,
          modifiedModel: diffEditorVM.model.modified
        });
      }
    }
    const allDiffInfos = [];
    for (const fileData of diffsByFile.values()) {
      const diffInfo = {
        changes: fileData.changes,
        identical: false,
        originalModel: fileData.originalModel,
        modifiedModel: fileData.modifiedModel
      };
      allDiffInfos.push(diffInfo);
      const manager = new ChatEditingExplanationWidgetManager(
        fileData.editor,
        chatWidgetService,
        viewsService,
        explanationModelManager,
        diffInfo.modifiedModel.uri
      );
      widgetsStore.add(manager);
    }
    if (allDiffInfos.length > 0) {
      widgetsStore.add(explanationModelManager.generateExplanations(allDiffInfos, chatSessionResource, CancellationToken.None));
    }
  }
};

function registerChatEditorActions() {
  registerAction2(class NextAction extends NavigateAction {
    constructor() {
      super(true);
    }
  });
  registerAction2(class PrevAction extends NavigateAction {
    constructor() {
      super(false);
    }
  });
  registerAction2(ReviewChangesAction);
  registerAction2(AcceptAction2);
  registerAction2(RejectAction);
  registerAction2(AcceptAllEditsAction);
  registerAction2(AcceptHunkAction);
  registerAction2(RejectHunkAction);
  registerAction2(ToggleDiffAction);
  registerAction2(ToggleAccessibleDiffViewAction);
  registerAction2(class extends MultiDiffAcceptDiscardAction {
    constructor() {
      super(true);
    }
  });
  registerAction2(class extends MultiDiffAcceptDiscardAction {
    constructor() {
      super(false);
    }
  });
  registerAction2(ExplainMultiDiffAction);
  MenuRegistry.appendMenuItem(MenuId.ChatEditingEditorContent, {
    command: {
      id: navigationBearingFakeActionId,
      title: localize(10840, null),
      precondition: ContextKeyExpr.false()
    },
    group: "navigate",
    order: -1,
    when: ContextKeyExpr.and(ctxReviewModeEnabled, ctxHasEditorModification)
  });
}

var navigationBearingFakeActionId = "chatEditor.navigation.bearings";
export { openNextOrPreviousChange, registerChatEditorActions, ChatEditingEditorAction, NavigateAction, KeepOrUndoAction, AcceptAction2, RejectAction, acceptHunkId, undoHunkId, AcceptRejectHunkAction, AcceptHunkAction, RejectHunkAction, ToggleDiffAction, ToggleAccessibleDiffViewAction, ReviewChangesAction, AcceptAllEditsAction, MultiDiffAcceptDiscardAction, explainMultiDiffSchemes, ExplainMultiDiffAction, navigationBearingFakeActionId };
