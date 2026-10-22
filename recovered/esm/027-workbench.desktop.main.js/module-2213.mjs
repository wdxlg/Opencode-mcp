// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatTitleActions.ts
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CHAT_CATEGORY } from "./module-1476.mjs";
import { Codicon } from "./module-0085.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { MENU_INLINE_CHAT_WIDGET_SECONDARY } from "./module-2001.mjs";
import { isResponseVM } from "./module-0978.mjs";
import { IChatService } from "./module-0972.mjs";
import { applyingChatEditsFailedContextKey, isChatEditingActionContext } from "./module-1081.mjs";
import { IChatAccessibilityService, IChatWidgetService } from "./module-0981.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IDialogService } from "./module-0267.mjs";
import { basename2 } from "./module-0034.mjs";
import { NOTEBOOK_IS_ACTIVE_EDITOR } from "./module-1868.mjs";
import { IEditorService } from "./module-0934.mjs";
import { NOTEBOOK_EDITOR_ID } from "./module-0909.mjs";
import { IBulkEditService } from "./module-0537.mjs";
import { ResourceNotebookCellEdit } from "./module-0942.mjs";
import { marked } from "./module-0464.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatTitleActions.ts
var MarkHelpfulActionId = "workbench.action.chat.markHelpful";

var MarkUnhelpfulActionId = "workbench.action.chat.markUnhelpful";

var enableFeedbackConfig = "config.telemetry.feedback.enabled";

function registerChatTitleActions() {
  registerAction2(class MarkHelpfulAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.markHelpful",
        title: localize2(8787, "Helpful"),
        f1: false,
        category: CHAT_CATEGORY,
        icon: Codicon.thumbsup,
        toggled: ChatContextKeys.responseVote.isEqualTo("up"),
        menu: [{
          id: MenuId.ChatMessageFooter,
          group: "navigation",
          order: 2,
          when: ContextKeyExpr.and(ChatContextKeys.extensionParticipantRegistered, ChatContextKeys.isResponse, ChatContextKeys.responseHasError.negate(), ContextKeyExpr.has(enableFeedbackConfig), ChatContextKeys.lockedToCodingAgent.negate(), ChatContextKeys.responseHasFeedbackSurvey.negate())
        }, {
          id: MENU_INLINE_CHAT_WIDGET_SECONDARY,
          group: "navigation",
          order: 1,
          when: ContextKeyExpr.and(ChatContextKeys.extensionParticipantRegistered, ChatContextKeys.isResponse, ChatContextKeys.responseHasError.negate(), ContextKeyExpr.has(enableFeedbackConfig), ChatContextKeys.lockedToCodingAgent.negate())
        }]
      });
    }
    run(accessor, ...args2) {
      const item = args2[0];
      if (!isResponseVM(item)) {
        return;
      }
      const chatService = accessor.get(IChatService);
      chatService.notifyUserAction({
        agentId: item.agent?.id,
        command: item.slashCommand?.name,
        sessionResource: item.session.sessionResource,
        requestId: item.requestId,
        result: item.result,
        action: {
          kind: "vote",
          direction: 1 /* Up */
        }
      });
      item.setVote(1 /* Up */);
    }
  });
  registerAction2(class MarkUnhelpfulAction extends Action2 {
    constructor() {
      super({
        id: MarkUnhelpfulActionId,
        title: localize2(8790, "Unhelpful"),
        f1: false,
        category: CHAT_CATEGORY,
        icon: Codicon.thumbsdown,
        toggled: ChatContextKeys.responseVote.isEqualTo("down"),
        menu: [{
          id: MenuId.ChatMessageFooter,
          group: "navigation",
          order: 3,
          when: ContextKeyExpr.and(ChatContextKeys.extensionParticipantRegistered, ChatContextKeys.isResponse, ContextKeyExpr.has(enableFeedbackConfig), ChatContextKeys.lockedToCodingAgent.negate(), ChatContextKeys.responseHasFeedbackSurvey.negate())
        }, {
          id: MENU_INLINE_CHAT_WIDGET_SECONDARY,
          group: "navigation",
          order: 2,
          when: ContextKeyExpr.and(ChatContextKeys.extensionParticipantRegistered, ChatContextKeys.isResponse, ChatContextKeys.responseHasError.negate(), ContextKeyExpr.has(enableFeedbackConfig), ChatContextKeys.lockedToCodingAgent.negate())
        }]
      });
    }
    run(accessor, ...args2) {
      const item = args2[0];
      if (!isResponseVM(item)) {
        return;
      }
      item.setVote(0 /* Down */);
      const chatService = accessor.get(IChatService);
      chatService.notifyUserAction({
        agentId: item.agent?.id,
        command: item.slashCommand?.name,
        sessionResource: item.session.sessionResource,
        requestId: item.requestId,
        result: item.result,
        action: {
          kind: "vote",
          direction: 0 /* Down */
        }
      });
    }
  });
  registerAction2(class ReportIssueForBugAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.reportIssueForBug",
        title: localize2(8789, "Report Issue"),
        f1: false,
        category: CHAT_CATEGORY,
        icon: Codicon.report,
        menu: [{
          id: MenuId.ChatMessageFooter,
          group: "navigation",
          order: 4,
          when: ContextKeyExpr.and(ChatContextKeys.responseSupportsIssueReporting, ChatContextKeys.isResponse, ContextKeyExpr.has(enableFeedbackConfig))
        }, {
          id: MENU_INLINE_CHAT_WIDGET_SECONDARY,
          group: "navigation",
          order: 3,
          when: ContextKeyExpr.and(ChatContextKeys.responseSupportsIssueReporting, ChatContextKeys.isResponse, ContextKeyExpr.has(enableFeedbackConfig))
        }]
      });
    }
    run(accessor, ...args2) {
      const item = args2[0];
      if (!isResponseVM(item)) {
        return;
      }
      const chatService = accessor.get(IChatService);
      chatService.notifyUserAction({
        agentId: item.agent?.id,
        command: item.slashCommand?.name,
        sessionResource: item.session.sessionResource,
        requestId: item.requestId,
        result: item.result,
        action: {
          kind: "bug"
        }
      });
    }
  });
  registerAction2(class RetryChatAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.retry",
        title: localize2(8784, "Retry"),
        f1: false,
        category: CHAT_CATEGORY,
        icon: Codicon.refresh,
        menu: [
          {
            id: MenuId.ChatMessageFooter,
            group: "navigation",
            when: ContextKeyExpr.and(
              ChatContextKeys.isResponse,
              ContextKeyExpr.in(ChatContextKeys.itemId.key, ChatContextKeys.lastItemId.key),
              ChatContextKeys.lockedToCodingAgent.negate()
            )
          },
          {
            id: MenuId.ChatEditingWidgetToolbar,
            group: "navigation",
            when: ContextKeyExpr.and(applyingChatEditsFailedContextKey, ChatContextKeys.lockedToCodingAgent.negate()),
            order: 0
          }
        ]
      });
    }
    async run(accessor, ...args2) {
      const chatWidgetService = accessor.get(IChatWidgetService);
      const chatAccessibilityService = accessor.get(IChatAccessibilityService);
      const chatService = accessor.get(IChatService);
      const configurationService = accessor.get(IConfigurationService);
      const dialogService = accessor.get(IDialogService);
      let item = args2[0];
      if (isChatEditingActionContext(item)) {
        item = chatWidgetService.getWidgetBySessionResource(item.sessionResource)?.viewModel?.getItems().at(-1);
      }
      if (!isResponseVM(item)) {
        return;
      }
      const chatModel = chatService.getSession(item.sessionResource);
      const chatRequests = chatModel?.getRequests();
      if (!chatRequests) {
        return;
      }
      const itemIndex = chatRequests?.findIndex((request3) => request3.id === item.requestId);
      const widget = chatWidgetService.getWidgetBySessionResource(item.sessionResource);
      const mode = widget?.input.currentModeKind;
      if (chatModel && (mode === "edit" /* Edit */ || mode === "agent" /* Agent */)) {
        const currentEditingSession = widget?.viewModel?.model.editingSession;
        if (!currentEditingSession) {
          return;
        }
        const entriesModifiedInLastRequest = currentEditingSession.entries.get().filter((entry) => entry.lastModifyingRequestId === item.requestId);
        const shouldPrompt = entriesModifiedInLastRequest.length > 0 && configurationService.getValue("chat.editing.confirmEditRequestRetry") === true;
        const confirmation = shouldPrompt ? await dialogService.confirm({
          title: localize(8786, null),
          message: entriesModifiedInLastRequest.length === 1 ? localize(8782, null, basename2(entriesModifiedInLastRequest[0].modifiedURI)) : localize(8785, null, entriesModifiedInLastRequest.length),
          primaryButton: localize(8783, null),
          checkbox: { label: localize(8781, null), checked: false },
          type: "info"
        }) : { confirmed: true };
        if (!confirmation.confirmed) {
          return;
        }
        if (confirmation.checkboxChecked) {
          await configurationService.updateValue("chat.editing.confirmEditRequestRetry", false);
        }
        const snapshotRequest = chatRequests[itemIndex];
        if (snapshotRequest) {
          await currentEditingSession.restoreSnapshot(snapshotRequest.id, void 0);
        }
      }
      const request2 = chatModel?.getRequests().find((candidate) => candidate.id === item.requestId);
      chatAccessibilityService.acceptRequest(item.sessionResource);
      chatService.resendRequest(request2, {
        ...widget?.getSelectedModelRequestOptions(),
        attempt: (request2?.attempt ?? -1) + 1,
        ...widget?.getModeRequestOptions()
      });
    }
  });
  registerAction2(class InsertToNotebookAction extends Action2 {
    constructor() {
      super({
        id: "workbench.action.chat.insertIntoNotebook",
        title: localize2(8788, "Insert into Notebook"),
        f1: false,
        category: CHAT_CATEGORY,
        icon: Codicon.insert,
        menu: {
          id: MenuId.ChatMessageFooter,
          group: "navigation",
          isHiddenByDefault: true,
          when: ContextKeyExpr.and(NOTEBOOK_IS_ACTIVE_EDITOR, ChatContextKeys.isResponse, ChatContextKeys.responseIsFiltered.negate(), ChatContextKeys.lockedToCodingAgent.negate())
        }
      });
    }
    async run(accessor, ...args2) {
      const item = args2[0];
      if (!isResponseVM(item)) {
        return;
      }
      const editorService = accessor.get(IEditorService);
      if (editorService.activeEditorPane?.getId() === NOTEBOOK_EDITOR_ID) {
        const notebookEditor = editorService.activeEditorPane.getControl();
        if (!notebookEditor.hasModel()) {
          return;
        }
        if (notebookEditor.isReadOnly) {
          return;
        }
        const value2 = item.response.toString();
        const splitContents = splitMarkdownAndCodeBlocks(value2);
        const focusRange = notebookEditor.getFocus();
        const index2 = Math.max(focusRange.end, 0);
        const bulkEditService = accessor.get(IBulkEditService);
        await bulkEditService.apply(
          [
            new ResourceNotebookCellEdit(
              notebookEditor.textModel.uri,
              {
                editType: 1 /* Replace */,
                index: index2,
                count: 0,
                cells: splitContents.map((content2) => {
                  const kind = content2.type === "markdown" ? 1 /* Markup */ : 2 /* Code */;
                  const language2 = content2.type === "markdown" ? "markdown" : content2.language;
                  const mime = content2.type === "markdown" ? "text/markdown" : `text/x-${content2.language}`;
                  return {
                    cellKind: kind,
                    language: language2,
                    mime,
                    source: content2.content,
                    outputs: [],
                    metadata: {}
                  };
                })
              }
            )
          ],
          { quotableLabel: "Insert into Notebook" }
        );
      }
    }
  });
}

function splitMarkdownAndCodeBlocks(markdown) {
  const lexer2 = new marked.Lexer();
  const tokens = lexer2.lex(markdown);
  const splitContent = [];
  let markdownPart = "";
  tokens.forEach((token) => {
    if (token.type === "code") {
      if (markdownPart.trim()) {
        splitContent.push({ type: "markdown", content: markdownPart });
        markdownPart = "";
      }
      splitContent.push({
        type: "code",
        language: token.lang || "",
        content: token.text
      });
    } else {
      markdownPart += token.raw;
    }
  });
  if (markdownPart.trim()) {
    splitContent.push({ type: "markdown", content: markdownPart });
  }
  return splitContent;
}
export { registerChatTitleActions, splitMarkdownAndCodeBlocks, MarkHelpfulActionId, MarkUnhelpfulActionId, enableFeedbackConfig };
