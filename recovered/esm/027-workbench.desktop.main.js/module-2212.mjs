// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/actions/chatForkActions.ts
import { Action2, MenuId } from "./module-0092.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CHAT_CATEGORY } from "./module-1476.mjs";
import { Codicon } from "./module-0085.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { ChatContextKeyExprs, ChatContextKeys } from "./module-0965.mjs";
import { ChatViewPaneTarget, IChatWidgetService } from "./module-0981.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IChatService } from "./module-0972.mjs";
import { IChatSessionsService } from "./module-0960.mjs";
import { URI } from "./module-0032.mjs";
import { getChatSessionType } from "./module-0961.mjs";
import { revive } from "./module-0265.mjs";
import { generateUuid } from "./module-0190.mjs";
import { isChatTreeItem, isRequestVM, isResponseVM } from "./module-0978.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";


// src/vs/workbench/contrib/chat/browser/actions/chatForkActions.ts
var ForkConversationActionId = "workbench.action.chat.forkConversation";

var ForkConversationAction = class extends Action2 {
  constructor() {
    super({
      id: ForkConversationActionId,
      title: localize2(8684, "Fork Conversation"),
      tooltip: localize2(8685, "Fork conversation from this point"),
      f1: false,
      category: CHAT_CATEGORY,
      icon: Codicon.repoForked,
      precondition: ContextKeyExpr.and(ChatContextKeys.enabled, ChatContextKeys.readOnly.negate()),
      menu: [
        {
          id: MenuId.ChatMessageCheckpoint,
          group: "navigation",
          order: 3,
          when: ContextKeyExpr.and(
            ChatContextKeys.isRequest,
            ChatContextKeys.isFirstRequest.negate(),
            ContextKeyExpr.or(
              ContextKeyExpr.or(ChatContextKeys.lockedToCodingAgent.negate(), ChatContextKeyExprs.isAgentHostSession),
              ChatContextKeys.chatSessionSupportsFork
            ),
            ChatContextKeys.readOnly.negate()
          )
        }
      ]
    });
    this.pendingFork = /* @__PURE__ */ new Map();
  }
  async run(accessor, ...args2) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const instantiationService = accessor.get(IInstantiationService);
    const chatService = accessor.get(IChatService);
    const chatSessionsService = accessor.get(IChatSessionsService);
    const forkedTitlePrefix = localize(8687, null);
    if (URI.isUri(args2[0])) {
      const sourceSessionResource = args2[0];
      const contentProviderSchemes2 = chatSessionsService.getContentProviderSchemes();
      if (contentProviderSchemes2.includes(getChatSessionType(sourceSessionResource))) {
        if (await this._tryForkAsChat(instantiationService, sourceSessionResource, void 0)) {
          return;
        }
        return await this.forkContributedChatSession(sourceSessionResource, void 0, false, chatSessionsService, instantiationService);
      }
      const chatModel2 = chatService.getSession(sourceSessionResource);
      if (!chatModel2) {
        return;
      }
      const serializedData2 = chatModel2.toJSON();
      if (serializedData2.requests.length === 0) {
        return;
      }
      const cleanData2 = revive(JSON.parse(JSON.stringify(serializedData2)));
      cleanData2.sessionId = generateUuid();
      const forkTimestamp = Date.now();
      cleanData2.creationDate = forkTimestamp;
      cleanData2.customTitle = chatModel2.title.startsWith(forkedTitlePrefix) ? chatModel2.title : localize(8686, null, chatModel2.title);
      for (const [index2, req] of cleanData2.requests.entries()) {
        req.shouldBeRemovedOnSend = void 0;
        req.isHidden = void 0;
        req.requestId = generateUuid();
        req.responseId = req.responseId ? generateUuid() : void 0;
        req.timestamp = forkTimestamp + index2;
        if (req.response) {
          req.modelState = { value: 1 /* Complete */, completedAt: forkTimestamp + index2 };
        }
      }
      const modelRef2 = chatService.loadSessionFromData(cleanData2, "ChatForkActions#forkCleanSession", "currentSession");
      const newSessionResource = modelRef2.object.sessionResource;
      setTimeout(async () => {
        try {
          await this._openForkedSession(instantiationService, chatModel2.sessionResource, newSessionResource);
        } finally {
          modelRef2.dispose();
        }
      }, 0);
      return;
    }
    const arg = args2[0];
    let item = isChatTreeItem(arg) ? arg : isChatTreeItem(arg?.element) ? arg.element : isChatTreeItem(arg?.context) ? arg.context : isChatTreeItem(arg?.item) ? arg.item : void 0;
    const widget = item && chatWidgetService.getWidgetBySessionResource(item.sessionResource) || chatWidgetService.lastFocusedWidget;
    if (!isResponseVM(item) && !isRequestVM(item)) {
      item = widget?.getFocus();
    }
    if (!item) {
      return;
    }
    const sessionResource = widget?.viewModel?.sessionResource ?? (isChatTreeItem(item) ? item.sessionResource : void 0);
    if (!sessionResource) {
      return;
    }
    const targetRequestId = isRequestVM(item) ? item.id : isResponseVM(item) ? item.requestId : void 0;
    if (!targetRequestId) {
      return;
    }
    const contentProviderSchemes = chatSessionsService.getContentProviderSchemes();
    if (contentProviderSchemes.includes(getChatSessionType(sessionResource))) {
      const contributedSession = await chatSessionsService.getOrCreateChatSession(sessionResource, CancellationToken.None);
      let request2 = contributedSession.history.find((entry) => entry.type === "request" && entry.id === targetRequestId);
      if (!request2) {
        const chatModel2 = chatService.getSession(sessionResource);
        const serializedData2 = chatModel2?.toJSON();
        for (const [, entry] of serializedData2?.requests.entries() ?? []) {
          if (entry.requestId === targetRequestId) {
            request2 = {
              id: entry.requestId,
              type: "request",
              prompt: typeof entry.message === "string" ? entry.message : entry.message.text,
              participant: entry.agent?.id ?? "",
              variableData: entry.variableData,
              modelId: entry.modelId
            };
            break;
          }
        }
      }
      if (await this._tryForkAsChat(instantiationService, sessionResource, request2)) {
        return;
      }
      return await this.forkContributedChatSession(sessionResource, request2, true, chatSessionsService, instantiationService);
    }
    const chatModel = chatService.getSession(sessionResource);
    if (!chatModel) {
      return;
    }
    const serializedData = chatModel.toJSON();
    const isRequestItem = isRequestVM(item);
    let targetIndex = -1;
    if (widget?.viewModel) {
      let requestIndex = -1;
      for (const entry of widget.viewModel.getItems()) {
        if (isRequestVM(entry)) {
          requestIndex += 1;
        }
        if (entry.id === item?.id) {
          targetIndex = isRequestVM(entry) ? Math.max(0, requestIndex - 1) : requestIndex;
          break;
        }
      }
    }
    if (targetIndex < 0) {
      const requestIndex = chatModel.getRequests().findIndex((r2) => r2.id === targetRequestId);
      targetIndex = isRequestItem ? Math.max(0, requestIndex - 1) : requestIndex;
    }
    if (targetIndex < 0) {
      return;
    }
    const forkedData = revive(JSON.parse(JSON.stringify({
      ...serializedData,
      requests: serializedData.requests.slice(0, targetIndex + 1)
    })));
    forkedData.sessionId = generateUuid();
    const forkedTimestamp = Date.now();
    forkedData.creationDate = forkedTimestamp;
    forkedData.customTitle = chatModel.title.startsWith(forkedTitlePrefix) ? chatModel.title : localize(8686, null, chatModel.title);
    for (const [index2, req] of forkedData.requests.entries()) {
      req.shouldBeRemovedOnSend = void 0;
      req.isHidden = void 0;
      req.requestId = generateUuid();
      req.responseId = req.responseId ? generateUuid() : void 0;
      req.timestamp = forkedTimestamp + index2;
      if (req.response) {
        req.modelState = { value: 1 /* Complete */, completedAt: forkedTimestamp + index2 };
      }
    }
    const modelRef = chatService.loadSessionFromData(forkedData, "ChatForkActions#forkSession", "currentSession");
    if (!modelRef) {
      return;
    }
    try {
      const newSessionResource = modelRef.object.sessionResource;
      await this._openForkedSession(instantiationService, chatModel.sessionResource, newSessionResource);
    } finally {
      modelRef.dispose();
    }
  }
  async _openForkedSession(instantiationService, parentSessionResource, forkedSessionResource) {
    await instantiationService.invokeFunction(async (accessor) => {
      const chatWidgetService = accessor.get(IChatWidgetService);
      await chatWidgetService.openSession(forkedSessionResource, ChatViewPaneTarget, { sessionTypeSelectionReason: "currentSession" });
    });
  }
  /**
   * Hook for surfaces (the Agents window) that prefer to fork a multi-chat
   * session into a new peer chat in the same session rather than a brand-new
   * session. Returns `true` when it fully handled the fork; the default
   * implementation does nothing and returns `false`, so the standard
   * session-creating fork path runs.
   */
  async _tryForkAsChat(_instantiationService, _sourceSessionResource, _request) {
    return false;
  }
  async forkContributedChatSession(sourceSessionResource, request2, openForkedSessionImmediately, chatSessionsService, instantiationService) {
    const pendingKey = `${sourceSessionResource.toString()}@${request2?.id ?? "full"}`;
    const pending = this.pendingFork.get(pendingKey);
    if (pending) {
      return pending;
    }
    const forkPromise = (async () => {
      const cts = new CancellationTokenSource();
      try {
        const forkedItem = await chatSessionsService.forkChatSession(sourceSessionResource, request2, cts.token);
        const open2 = () => this._openForkedSession(instantiationService, sourceSessionResource, forkedItem.resource);
        if (openForkedSessionImmediately) {
          await open2();
        } else {
          setTimeout(open2, 0);
        }
      } finally {
        cts.dispose();
      }
    })();
    this.pendingFork.set(pendingKey, forkPromise);
    try {
      await forkPromise;
    } finally {
      this.pendingFork.delete(pendingKey);
    }
  }
};
export { ForkConversationActionId, ForkConversationAction };
