// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingActions.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { CHAT_CATEGORY } from "./module-1476.mjs";
import { isChatViewTitleActionContext } from "./module-2055.mjs";
import { IChatWidgetService } from "./module-0981.mjs";
import { CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME, IChatEditingService, applyingChatEditsFailedContextKey, chatEditingResourceContextKey, chatEditingWidgetFileStateContextKey, decidedChatEditingResourceContextKey, hasAppliedChatEditsContextKey, hasUndecidedChatEditingResourceContextKey } from "./module-1081.mjs";
import { URI } from "./module-0032.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { IEditorService } from "./module-0934.mjs";
import { ChatContextKeyExprs, ChatContextKeys } from "./module-0965.mjs";
import { IDialogService } from "./module-0267.mjs";
import { basename2 } from "./module-0034.mjs";
import { isImplicitVariableEntry, isPromptFileVariableEntry, isPromptTextVariableEntry, isStringVariableEntry, isWorkspaceVariableEntry } from "./module-0979.mjs";
import { isChatTreeItem, isRequestVM, isResponseVM } from "./module-0978.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IChatService } from "./module-0972.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { alert } from "./module-0076.mjs";
import { isCodeEditor } from "./module-0223.mjs";
import { isLocation } from "./module-0164.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { ILanguageFeaturesService } from "./module-0205.mjs";
import { Position } from "./module-0079.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { CommandsRegistry } from "./module-0087.mjs";


// src/vs/workbench/contrib/chat/browser/chatEditing/chatEditingActions.ts
var EditingSessionAction = class extends Action2 {
  constructor(opts) {
    super({
      category: CHAT_CATEGORY,
      ...opts
    });
  }
  run(accessor, ...args2) {
    const context2 = getEditingSessionContext(accessor, args2);
    if (!context2 || !context2.editingSession) {
      return;
    }
    return this.runEditingSessionAction(accessor, context2.editingSession, context2.chatWidget, ...args2);
  }
};

function getEditingSessionContext(accessor, args2) {
  const arg0 = args2.at(0);
  const context2 = isChatViewTitleActionContext(arg0) ? arg0 : void 0;
  const chatWidgetService = accessor.get(IChatWidgetService);
  const chatEditingService = accessor.get(IChatEditingService);
  let chatWidget = context2 ? chatWidgetService.getWidgetBySessionResource(context2.sessionResource) : void 0;
  if (!chatWidget) {
    chatWidget = chatWidgetService.lastFocusedWidget ?? chatWidgetService.getWidgetsByLocations("panel" /* Chat */).find((w) => w.supportsChangingModes);
  }
  if (!chatWidget?.viewModel) {
    return;
  }
  const editingSession = chatEditingService.getEditingSession(chatWidget.viewModel.model.sessionResource);
  return { editingSession, chatWidget };
}

var WorkingSetAction = class extends EditingSessionAction {
  runEditingSessionAction(accessor, editingSession, chatWidget, ...args2) {
    const uris = [];
    if (URI.isUri(args2[0])) {
      uris.push(args2[0]);
    } else if (chatWidget) {
      uris.push(...chatWidget.input.selectedElements);
    }
    if (!uris.length) {
      return;
    }
    return this.runWorkingSetAction(accessor, editingSession, chatWidget, ...uris);
  }
};

registerAction2(class OpenFileInDiffAction extends WorkingSetAction {
  constructor() {
    super({
      id: "chatEditing.openFileInDiff",
      title: localize2(10822, "Open Changes in Diff Editor"),
      icon: Codicon.diffSingle,
      menu: [{
        id: MenuId.ChatEditingWidgetModifiedFilesToolbar,
        when: ContextKeyExpr.equals(chatEditingWidgetFileStateContextKey.key, 0 /* Modified */),
        order: 2,
        group: "navigation"
      }]
    });
  }
  async runWorkingSetAction(accessor, currentEditingSession, _chatWidget, ...uris) {
    const editorService = accessor.get(IEditorService);
    for (const uri5 of uris) {
      const pane = await editorService.openEditor({ resource: uri5 });
      if (!pane) {
        return;
      }
      const editedFile = currentEditingSession.getEntry(uri5);
      editedFile?.getEditorIntegration(pane).toggleDiff(void 0, true);
    }
  }
});

registerAction2(class AcceptAction extends WorkingSetAction {
  constructor() {
    super({
      id: "chatEditing.acceptFile",
      title: localize2(10790, "Keep"),
      icon: Codicon.check,
      menu: [{
        when: ContextKeyExpr.and(ContextKeyExpr.equals("resourceScheme", CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME), ContextKeyExpr.notIn(chatEditingResourceContextKey.key, decidedChatEditingResourceContextKey.key)),
        id: MenuId.MultiDiffEditorFileToolbar,
        order: 0,
        group: "navigation"
      }, {
        id: MenuId.ChatEditingWidgetModifiedFilesToolbar,
        when: ContextKeyExpr.equals(chatEditingWidgetFileStateContextKey.key, 0 /* Modified */),
        order: 0,
        group: "navigation"
      }]
    });
  }
  async runWorkingSetAction(accessor, currentEditingSession, chatWidget, ...uris) {
    await currentEditingSession.accept(...uris);
  }
});

registerAction2(class DiscardAction extends WorkingSetAction {
  constructor() {
    super({
      id: "chatEditing.discardFile",
      title: localize2(10819, "Undo"),
      icon: Codicon.discard,
      menu: [{
        when: ContextKeyExpr.and(ContextKeyExpr.equals("resourceScheme", CHAT_EDITING_MULTI_DIFF_SOURCE_RESOLVER_SCHEME), ContextKeyExpr.notIn(chatEditingResourceContextKey.key, decidedChatEditingResourceContextKey.key)),
        id: MenuId.MultiDiffEditorFileToolbar,
        order: 2,
        group: "navigation"
      }, {
        id: MenuId.ChatEditingWidgetModifiedFilesToolbar,
        when: ContextKeyExpr.equals(chatEditingWidgetFileStateContextKey.key, 0 /* Modified */),
        order: 1,
        group: "navigation"
      }]
    });
  }
  async runWorkingSetAction(accessor, currentEditingSession, chatWidget, ...uris) {
    await currentEditingSession.reject(...uris);
  }
});

var ChatEditingAcceptAllAction = class extends EditingSessionAction {
  constructor() {
    super({
      id: "chatEditing.acceptAllFiles",
      title: localize(10789, null),
      icon: Codicon.check,
      tooltip: localize(10791, null),
      precondition: hasUndecidedChatEditingResourceContextKey,
      keybinding: {
        primary: 2048 /* CtrlCmd */ | 3 /* Enter */,
        when: ContextKeyExpr.and(hasUndecidedChatEditingResourceContextKey, ChatContextKeys.inChatInput),
        weight: 200 /* WorkbenchContrib */
      },
      menu: [
        {
          id: MenuId.ChatEditingWidgetToolbar,
          group: "navigation",
          order: 0,
          when: ContextKeyExpr.and(applyingChatEditsFailedContextKey.negate(), ContextKeyExpr.and(hasUndecidedChatEditingResourceContextKey))
        }
      ]
    });
  }
  async runEditingSessionAction(accessor, editingSession, chatWidget, ...args2) {
    await editingSession.accept();
  }
};

registerAction2(ChatEditingAcceptAllAction);

var ChatEditingDiscardAllAction = class extends EditingSessionAction {
  constructor() {
    super({
      id: "chatEditing.discardAllFiles",
      title: localize(10818, null),
      icon: Codicon.discard,
      tooltip: localize(10820, null),
      precondition: hasUndecidedChatEditingResourceContextKey,
      menu: [
        {
          id: MenuId.ChatEditingWidgetToolbar,
          group: "navigation",
          order: 1,
          when: ContextKeyExpr.and(applyingChatEditsFailedContextKey.negate(), hasUndecidedChatEditingResourceContextKey)
        }
      ],
      keybinding: {
        when: ContextKeyExpr.and(hasUndecidedChatEditingResourceContextKey, ChatContextKeys.inChatInput, ChatContextKeys.inputHasText.negate()),
        weight: 200 /* WorkbenchContrib */,
        primary: 2048 /* CtrlCmd */ | 1 /* Backspace */
      }
    });
  }
  async runEditingSessionAction(accessor, editingSession, chatWidget, ...args2) {
    await discardAllEditsWithConfirmation(accessor, editingSession);
  }
};

registerAction2(ChatEditingDiscardAllAction);

var ToggleExplanationWidgetAction = class _ToggleExplanationWidgetAction extends EditingSessionAction {
  static {
    this.ID = "chatEditing.toggleExplanationWidget";
  }
  constructor() {
    super({
      id: _ToggleExplanationWidgetAction.ID,
      title: localize(10821, null),
      tooltip: localize(10823, null),
      precondition: hasUndecidedChatEditingResourceContextKey,
      menu: [
        {
          id: MenuId.ChatEditingWidgetToolbar,
          group: "navigation",
          order: 2,
          when: ContextKeyExpr.and(hasUndecidedChatEditingResourceContextKey, ContextKeyExpr.has(`config.${"chat.editing.explainChanges.enabled" /* ExplainChangesEnabled */}`))
        }
      ]
    });
  }
  async runEditingSessionAction(accessor, editingSession, chatWidget, ...args2) {
    if (editingSession.hasExplanations()) {
      editingSession.clearExplanations();
    } else {
      await editingSession.triggerExplanationGeneration();
    }
  }
};

registerAction2(ToggleExplanationWidgetAction);

async function discardAllEditsWithConfirmation(accessor, currentEditingSession) {
  const dialogService = accessor.get(IDialogService);
  const entries2 = currentEditingSession.entries.get().filter((e) => e.state.get() === 0 /* Modified */);
  if (entries2.length > 0) {
    const confirmation = await dialogService.confirm({
      title: localize(10796, null),
      message: entries2.length === 1 ? localize(10794, null, basename2(entries2[0].modifiedURI)) : localize(10793, null, entries2.length),
      primaryButton: localize(10795, null),
      type: "info"
    });
    if (!confirmation.confirmed) {
      return false;
    }
  }
  await currentEditingSession.reject();
  return true;
}

var ChatEditingShowChangesAction = class _ChatEditingShowChangesAction extends EditingSessionAction {
  static {
    this.ID = "chatEditing.viewChanges";
  }
  static {
    this.LABEL = localize(10816, null);
  }
  constructor() {
    super({
      id: _ChatEditingShowChangesAction.ID,
      title: { value: _ChatEditingShowChangesAction.LABEL, original: _ChatEditingShowChangesAction.LABEL },
      tooltip: _ChatEditingShowChangesAction.LABEL,
      f1: true,
      icon: Codicon.diffMultiple,
      precondition: hasUndecidedChatEditingResourceContextKey,
      menu: [
        {
          id: MenuId.ChatEditingWidgetToolbar,
          group: "navigation",
          order: 4,
          when: ContextKeyExpr.and(applyingChatEditsFailedContextKey.negate(), ContextKeyExpr.and(hasAppliedChatEditsContextKey, hasUndecidedChatEditingResourceContextKey))
        }
      ]
    });
  }
  async runEditingSessionAction(accessor, editingSession, chatWidget, ...args2) {
    await editingSession.show();
  }
};

registerAction2(ChatEditingShowChangesAction);

function filterToUserAttachedContext(attachedContext) {
  if (!attachedContext?.length) {
    return [];
  }
  return attachedContext.filter(
    (a) => !isImplicitVariableEntry(a) && !isWorkspaceVariableEntry(a) && !isStringVariableEntry(a) && !(isPromptFileVariableEntry(a) && a.automaticallyAdded) && !(isPromptTextVariableEntry(a) && a.automaticallyAdded)
  );
}

function restoreRequestToMainInputIfEmpty(widget, item) {
  if (!widget || !isRequestVM(item)) {
    return void 0;
  }
  const input = widget.inputPart;
  if (input.inputEditor.getValue() || filterToUserAttachedContext(input.attachmentModel.attachments).length) {
    return void 0;
  }
  input.focus();
  input.setValue(item.messageText, false);
  return filterToUserAttachedContext(item.attachedContext);
}

async function restoreSnapshotWithConfirmationByRequestId(accessor, sessionResource, requestId) {
  const configurationService = accessor.get(IConfigurationService);
  const dialogService = accessor.get(IDialogService);
  const chatWidgetService = accessor.get(IChatWidgetService);
  const widget = chatWidgetService.getWidgetBySessionResource(sessionResource);
  const chatService = accessor.get(IChatService);
  const chatModel = chatService.getSession(sessionResource);
  if (!chatModel) {
    return false;
  }
  const session = chatModel.editingSession;
  if (!session) {
    return false;
  }
  const chatRequests = chatModel.getRequests();
  const itemIndex = chatRequests.findIndex((request2) => request2.id === requestId);
  if (itemIndex === -1) {
    return false;
  }
  const editsToUndo = chatRequests.length - itemIndex;
  const requestsToRemove = chatRequests.slice(itemIndex);
  const requestIdsToRemove = new Set(requestsToRemove.map((request2) => request2.id));
  const entriesModifiedInRequestsToRemove = session.entries.get().filter((entry) => requestIdsToRemove.has(entry.lastModifyingRequestId)) ?? [];
  const shouldPrompt = entriesModifiedInRequestsToRemove.length > 0 && configurationService.getValue("chat.editing.confirmEditRequestRemoval") === true;
  let message;
  if (editsToUndo === 1) {
    if (entriesModifiedInRequestsToRemove.length === 1) {
      message = localize(10805, null, basename2(entriesModifiedInRequestsToRemove[0].modifiedURI));
    } else {
      message = localize(10806, null, entriesModifiedInRequestsToRemove.length);
    }
  } else {
    if (entriesModifiedInRequestsToRemove.length === 1) {
      message = localize(10801, null, basename2(entriesModifiedInRequestsToRemove[0].modifiedURI));
    } else {
      message = localize(10802, null, entriesModifiedInRequestsToRemove.length);
    }
  }
  const confirmation = shouldPrompt ? await dialogService.confirm({
    title: editsToUndo === 1 ? localize(10807, null) : localize(10804, null, editsToUndo),
    message,
    primaryButton: localize(10803, null),
    checkbox: { label: localize(10800, null), checked: false },
    type: "info"
  }) : { confirmed: true };
  if (!confirmation.confirmed) {
    widget?.viewModel?.model.setCheckpoint(void 0);
    return false;
  }
  if (confirmation.checkboxChecked) {
    await configurationService.updateValue("chat.editing.confirmEditRequestRemoval", false);
  }
  await chatService.cancelCurrentRequestForSession(sessionResource, "restoreCheckpoint");
  const snapshotRequestId = chatRequests[itemIndex].id;
  await session.restoreSnapshot(snapshotRequestId, void 0);
  return true;
}

async function restoreSnapshotWithConfirmation(accessor, item) {
  const requestId = isRequestVM(item) ? item.id : isResponseVM(item) ? item.requestId : void 0;
  if (!requestId) {
    return false;
  }
  return restoreSnapshotWithConfirmationByRequestId(accessor, item.sessionResource, requestId);
}

registerAction2(class RemoveAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.undoEdits",
      title: localize2(10814, "Undo Requests"),
      f1: false,
      category: CHAT_CATEGORY,
      icon: Codicon.discard,
      keybinding: {
        primary: 20 /* Delete */,
        mac: {
          primary: 2048 /* CtrlCmd */ | 1 /* Backspace */
        },
        when: ContextKeyExpr.and(ChatContextKeys.inChatSession, EditorContextKeys.textInputFocus.negate(), ChatContextKeys.inChatQuestionCarousel.negate(), ChatContextKeys.readOnly.negate()),
        weight: 200 /* WorkbenchContrib */
      },
      menu: [
        {
          id: MenuId.ChatMessageTitle,
          group: "navigation",
          order: 2,
          when: ContextKeyExpr.and(ContextKeyExpr.equals(`config.${"chat.editRequests" /* EditRequests */}`, "input").negate(), ContextKeyExpr.equals(`config.${"chat.checkpoints.enabled" /* CheckpointsEnabled */}`, false), ContextKeyExpr.or(ChatContextKeys.lockedToCodingAgent.negate(), ChatContextKeyExprs.isAgentHostSession), ChatContextKeys.readOnly.negate())
        }
      ]
    });
  }
  async run(accessor, ...args2) {
    let item = args2[0];
    const chatWidgetService = accessor.get(IChatWidgetService);
    const configurationService = accessor.get(IConfigurationService);
    const widget = isChatTreeItem(item) && chatWidgetService.getWidgetBySessionResource(item.sessionResource) || chatWidgetService.lastFocusedWidget;
    if (!isResponseVM(item) && !isRequestVM(item)) {
      item = widget?.getFocus();
    }
    if (!item) {
      return;
    }
    const confirmed = await restoreSnapshotWithConfirmation(accessor, item);
    if (confirmed && isRequestVM(item) && configurationService.getValue("chat.undoRequests.restoreInput")) {
      widget?.focusInput();
      widget?.input.setValue(item.messageText, false);
      const userAttachments = filterToUserAttachedContext(item.attachedContext);
      if (userAttachments.length) {
        await widget?.input.restoreAttachments(userAttachments);
      }
    }
  }
});

var RestoreCheckpointActionId = "workbench.action.chat.restoreCheckpoint";

registerAction2(class RestoreCheckpointAction extends Action2 {
  constructor() {
    super({
      id: RestoreCheckpointActionId,
      title: localize2(10808, "Restore Checkpoint"),
      tooltip: localize2(10810, "Restores workspace and chat to this point"),
      f1: false,
      category: CHAT_CATEGORY,
      keybinding: {
        primary: 20 /* Delete */,
        mac: {
          primary: 2048 /* CtrlCmd */ | 1 /* Backspace */
        },
        when: ContextKeyExpr.and(ChatContextKeys.inChatSession, EditorContextKeys.textInputFocus.negate(), ChatContextKeys.inChatQuestionCarousel.negate(), ChatContextKeys.readOnly.negate()),
        weight: 200 /* WorkbenchContrib */
      },
      menu: [
        {
          id: MenuId.ChatMessageCheckpoint,
          group: "navigation",
          order: 2,
          when: ContextKeyExpr.and(ChatContextKeys.isRequest, ContextKeyExpr.or(ChatContextKeys.lockedToCodingAgent.negate(), ChatContextKeyExprs.isAgentHostSession), ChatContextKeys.isFirstRequest.negate(), ChatContextKeys.readOnly.negate())
        }
      ]
    });
  }
  async run(accessor, ...args2) {
    let item = args2[0];
    const chatWidgetService = accessor.get(IChatWidgetService);
    const widget = isChatTreeItem(item) && chatWidgetService.getWidgetBySessionResource(item.sessionResource) || chatWidgetService.lastFocusedWidget;
    if (!isResponseVM(item) && !isRequestVM(item)) {
      item = widget?.getFocus();
    }
    if (!item) {
      return;
    }
    widget?.viewModel?.model.setCheckpoint(item.id);
    const confirmed = await restoreSnapshotWithConfirmation(accessor, item);
    if (!confirmed) {
      return;
    }
    const userAttachments = restoreRequestToMainInputIfEmpty(widget, item);
    if (userAttachments?.length) {
      await widget?.inputPart.restoreAttachments(userAttachments);
    }
  }
});

var StartOverActionId = "workbench.action.chat.startOver";

registerAction2(class StartOverAction extends Action2 {
  constructor() {
    super({
      id: StartOverActionId,
      title: localize2(10812, "Start Over"),
      tooltip: localize2(10813, "Clears the chat and undoes all changes"),
      f1: false,
      category: CHAT_CATEGORY,
      menu: [
        {
          id: MenuId.ChatMessageCheckpoint,
          group: "navigation",
          order: 2,
          when: ContextKeyExpr.and(ChatContextKeys.isRequest, ContextKeyExpr.or(ChatContextKeys.lockedToCodingAgent.negate(), ChatContextKeyExprs.isAgentHostSession), ChatContextKeys.isFirstRequest, ChatContextKeys.readOnly.negate())
        }
      ]
    });
  }
  async run(accessor, ...args2) {
    let item = args2[0];
    const chatWidgetService = accessor.get(IChatWidgetService);
    const widget = isChatTreeItem(item) && chatWidgetService.getWidgetBySessionResource(item.sessionResource) || chatWidgetService.lastFocusedWidget;
    if (!isResponseVM(item) && !isRequestVM(item)) {
      item = widget?.getFocus();
    }
    if (!item) {
      return;
    }
    widget?.viewModel?.model.setCheckpoint(item.id);
    const confirmed = await restoreSnapshotWithConfirmation(accessor, item);
    if (!confirmed) {
      return;
    }
    const userAttachments = restoreRequestToMainInputIfEmpty(widget, item);
    if (userAttachments?.length) {
      await widget?.inputPart.restoreAttachments(userAttachments);
    }
  }
});

registerAction2(class RestoreLastCheckpoint extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.restoreLastCheckpoint",
      title: localize2(10811, "Restore to Last Checkpoint"),
      f1: true,
      category: CHAT_CATEGORY,
      icon: Codicon.discard,
      precondition: ContextKeyExpr.and(
        ChatContextKeys.inChatSession,
        ContextKeyExpr.equals(`config.${"chat.checkpoints.enabled" /* CheckpointsEnabled */}`, true),
        ContextKeyExpr.or(ChatContextKeys.lockedToCodingAgent.negate(), ChatContextKeyExprs.isAgentHostSession),
        ChatContextKeys.readOnly.negate()
      )
    });
  }
  async run(accessor, ...args2) {
    let item = args2[0];
    const chatWidgetService = accessor.get(IChatWidgetService);
    const chatService = accessor.get(IChatService);
    const widget = isChatTreeItem(item) && chatWidgetService.getWidgetBySessionResource(item.sessionResource) || chatWidgetService.lastFocusedWidget;
    if (!isResponseVM(item) && !isRequestVM(item)) {
      item = widget?.getFocus();
    }
    const sessionResource = widget?.viewModel?.sessionResource ?? (isChatTreeItem(item) ? item.sessionResource : void 0);
    if (!sessionResource) {
      return;
    }
    const chatModel = chatService.getSession(sessionResource);
    if (!chatModel?.editingSession) {
      return;
    }
    const checkpointRequest = chatModel.checkpoint;
    if (!checkpointRequest) {
      alert(localize(10809, null));
      return;
    }
    widget?.viewModel?.model.setCheckpoint(checkpointRequest.id);
    widget?.focusInput();
    widget?.input.setValue(checkpointRequest.message.text, false);
    await restoreSnapshotWithConfirmationByRequestId(accessor, sessionResource, checkpointRequest.id);
  }
});

registerAction2(class EditAction extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.editRequests",
      title: localize2(10797, "Edit Request"),
      f1: false,
      category: CHAT_CATEGORY,
      icon: Codicon.edit,
      keybinding: {
        primary: 3 /* Enter */,
        when: ContextKeyExpr.and(ChatContextKeys.inChatSession, EditorContextKeys.textInputFocus.negate(), ChatContextKeys.readOnly.negate()),
        weight: 200 /* WorkbenchContrib */
      },
      menu: [
        {
          id: MenuId.ChatMessageTitle,
          group: "navigation",
          order: 2,
          when: ContextKeyExpr.and(ContextKeyExpr.or(ContextKeyExpr.equals(`config.${"chat.editRequests" /* EditRequests */}`, "hover"), ContextKeyExpr.equals(`config.${"chat.editRequests" /* EditRequests */}`, "input")), ChatContextKeys.readOnly.negate())
        }
      ]
    });
  }
  async run(accessor, ...args2) {
    let item = args2[0];
    const chatWidgetService = accessor.get(IChatWidgetService);
    const widget = isChatTreeItem(item) && chatWidgetService.getWidgetBySessionResource(item.sessionResource) || chatWidgetService.lastFocusedWidget;
    if (!isResponseVM(item) && !isRequestVM(item)) {
      item = widget?.getFocus();
    }
    if (!item) {
      return;
    }
    if (isRequestVM(item)) {
      widget?.startEditing(item.id);
    }
  }
});

registerAction2(class OpenWorkingSetHistoryAction extends Action2 {
  static {
    this.id = "chat.openFileUpdatedBySnapshot";
  }
  constructor() {
    super({
      id: OpenWorkingSetHistoryAction.id,
      title: localize(10798, null),
      menu: [{
        id: MenuId.ChatEditingCodeBlockContext,
        group: "navigation",
        order: 0
      }]
    });
  }
  async run(accessor, ...args2) {
    const context2 = args2[0];
    if (!context2?.sessionResource) {
      return;
    }
    const editorService = accessor.get(IEditorService);
    await editorService.openEditor({ resource: context2.uri });
  }
});

registerAction2(class OpenWorkingSetHistoryAction2 extends Action2 {
  static {
    this.id = "chat.openFileSnapshot";
  }
  constructor() {
    super({
      id: OpenWorkingSetHistoryAction2.id,
      title: localize(10799, null),
      menu: [{
        id: MenuId.ChatEditingCodeBlockContext,
        group: "navigation",
        order: 1
      }]
    });
  }
  async run(accessor, ...args2) {
    const context2 = args2[0];
    if (!context2?.sessionResource) {
      return;
    }
    const chatService = accessor.get(IChatService);
    const chatEditingService = accessor.get(IChatEditingService);
    const editorService = accessor.get(IEditorService);
    const chatModel = chatService.getSession(context2.sessionResource);
    if (!chatModel) {
      return;
    }
    const snapshot = chatEditingService.getEditingSession(chatModel.sessionResource)?.getSnapshotUri(context2.requestId, context2.uri, context2.stopId);
    if (snapshot) {
      const editor = await editorService.openEditor({ resource: snapshot, label: localize(10815, null, basename2(context2.uri)), options: { activation: 1 /* ACTIVATE */ } });
      if (isCodeEditor(editor)) {
        editor.updateOptions({ readOnly: true });
      }
    }
  }
});

registerAction2(class ResolveSymbolsContextAction extends EditingSessionAction {
  constructor() {
    super({
      id: "workbench.action.edits.addFilesFromReferences",
      title: localize2(10792, "Add Files From References"),
      f1: false,
      category: CHAT_CATEGORY,
      menu: {
        id: MenuId.ChatInputSymbolAttachmentContext,
        group: "navigation",
        order: 1,
        when: ContextKeyExpr.and(ChatContextKeys.chatModeKind.isEqualTo("ask" /* Ask */), EditorContextKeys.hasReferenceProvider)
      }
    });
  }
  async runEditingSessionAction(accessor, editingSession, chatWidget, ...args2) {
    if (args2.length === 0 || !isLocation(args2[0])) {
      return;
    }
    const textModelService = accessor.get(ITextModelService);
    const languageFeaturesService = accessor.get(ILanguageFeaturesService);
    const symbol = args2[0];
    const modelReference = await textModelService.createModelReference(symbol.uri);
    try {
      const textModel = modelReference.object.textEditorModel;
      if (!textModel) {
        return;
      }
      const position2 = new Position(symbol.range.startLineNumber, symbol.range.startColumn);
      const [references, definitions3, implementations] = await Promise.all([
        this.getReferences(position2, textModel, languageFeaturesService),
        this.getDefinitions(position2, textModel, languageFeaturesService),
        this.getImplementations(position2, textModel, languageFeaturesService)
      ]);
      const attachments = [];
      for (const reference of [...definitions3, ...implementations, ...references]) {
        attachments.push(chatWidget.attachmentModel.asFileVariableEntry(reference.uri));
      }
      chatWidget.attachmentModel.addContext(...attachments);
    } finally {
      modelReference.dispose();
    }
  }
  async getReferences(position2, textModel, languageFeaturesService) {
    const referenceProviders = languageFeaturesService.referenceProvider.all(textModel);
    const references = await Promise.all(referenceProviders.map(async (referenceProvider) => {
      return await referenceProvider.provideReferences(textModel, position2, { includeDeclaration: true }, CancellationToken.None) ?? [];
    }));
    return references.flat();
  }
  async getDefinitions(position2, textModel, languageFeaturesService) {
    const definitionProviders = languageFeaturesService.definitionProvider.all(textModel);
    const definitions3 = await Promise.all(definitionProviders.map(async (definitionProvider) => {
      return await definitionProvider.provideDefinition(textModel, position2, CancellationToken.None) ?? [];
    }));
    return definitions3.flat();
  }
  async getImplementations(position2, textModel, languageFeaturesService) {
    const implementationProviders = languageFeaturesService.implementationProvider.all(textModel);
    const implementations = await Promise.all(implementationProviders.map(async (implementationProvider) => {
      return await implementationProvider.provideImplementation(textModel, position2, CancellationToken.None) ?? [];
    }));
    return implementations.flat();
  }
});

var ViewPreviousEditsAction = class _ViewPreviousEditsAction extends EditingSessionAction {
  static {
    this.Id = "chatEditing.viewPreviousEdits";
  }
  static {
    this.Label = localize(10817, null);
  }
  constructor() {
    super({
      id: _ViewPreviousEditsAction.Id,
      title: { value: _ViewPreviousEditsAction.Label, original: _ViewPreviousEditsAction.Label },
      tooltip: _ViewPreviousEditsAction.Label,
      f1: true,
      icon: Codicon.diffMultiple,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, hasUndecidedChatEditingResourceContextKey.negate()),
      menu: [
        {
          id: MenuId.ChatEditingWidgetToolbar,
          group: "navigation",
          order: 4,
          when: ContextKeyExpr.and(applyingChatEditsFailedContextKey.negate(), ContextKeyExpr.and(hasAppliedChatEditsContextKey, hasUndecidedChatEditingResourceContextKey.negate()))
        }
      ]
    });
  }
  async runEditingSessionAction(accessor, editingSession, chatWidget, ...args2) {
    await editingSession.show(true);
  }
};

registerAction2(ViewPreviousEditsAction);

CommandsRegistry.registerCommand("_chat.editSessions.accept", async (accessor, resources) => {
  if (resources.length === 0) {
    return;
  }
  const uris = resources.map((resource) => URI.revive(resource));
  const chatEditingService = accessor.get(IChatEditingService);
  for (const editingSession of chatEditingService.editingSessionsObs.get()) {
    await editingSession.accept(...uris);
  }
});
export { getEditingSessionContext, discardAllEditsWithConfirmation, filterToUserAttachedContext, restoreRequestToMainInputIfEmpty, restoreSnapshotWithConfirmationByRequestId, restoreSnapshotWithConfirmation, EditingSessionAction, WorkingSetAction, ChatEditingAcceptAllAction, ChatEditingDiscardAllAction, ToggleExplanationWidgetAction, ChatEditingShowChangesAction, RestoreCheckpointActionId, StartOverActionId, ViewPreviousEditsAction };
