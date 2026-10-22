// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/inlineChat/browser/inlineChatSessionResolver.ts
import { createDecorator } from "./module-0077.mjs";
import { withChatSurfaceMeta } from "./module-2951.mjs";
import { IChatSessionsService, SessionType } from "./module-0960.mjs";
import { isCancellationError, onUnexpectedError } from "./module-0004.mjs";
import { getLocalFallbackSessionTypeSelectionReason } from "./module-0964.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChatService } from "./module-0972.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/inlineChat/browser/inlineChatSessionResolver.ts
var IInlineChatSessionResolver = createDecorator("inlineChatSessionResolver");

function getInlineChatSessionMeta(languageId, targetUri) {
  return withChatSurfaceMeta(void 0, { surface: "editorInline", languageId, targetUri: targetUri.toString() });
}

var InlineChatSessionResolver = class {
  constructor(_chatSessionsService, _chatService, _configurationService) {
    this._chatSessionsService = _chatSessionsService;
    this._chatService = _chatService;
    this._configurationService = _configurationService;
  }
  async resolve(token, languageId, targetUri) {
    if (token.isCancellationRequested) {
      return void 0;
    }
    const meta = getInlineChatSessionMeta(languageId, targetUri);
    let modelRef;
    const agentHostEnabled = this._configurationService.getValue("chat.inlineChat.agentHost.enabled" /* InlineChatAgentHostEnabled */) === true;
    const contribution = agentHostEnabled ? this._chatSessionsService.getChatSessionContribution(SessionType.AgentHostCopilot) : void 0;
    const didAttemptAgentHost = contribution?.locations?.includes("editor" /* EditorInline */) === true;
    if (didAttemptAgentHost) {
      try {
        const item = await this._chatSessionsService.createNewChatSessionItem(SessionType.AgentHostCopilot, {
          prompt: "",
          isEphemeral: true,
          _meta: meta
        }, token);
        modelRef = item && await this._chatService.acquireOrLoadSession(item.resource, "editor" /* EditorInline */, token, "InlineChatSessionResolver#resolve");
      } catch (error) {
        if (isCancellationError(error) || token.isCancellationRequested) {
          throw error;
        }
        onUnexpectedError(error);
      }
    }
    if (token.isCancellationRequested) {
      modelRef?.dispose();
      return void 0;
    }
    if (modelRef) {
      return { modelRef, lockToAgent: contribution };
    }
    modelRef = this._chatService.startNewLocalSession("editor" /* EditorInline */, {
      canUseTools: false,
      sessionTypeSelectionReason: didAttemptAgentHost ? getLocalFallbackSessionTypeSelectionReason(SessionType.AgentHostCopilot, false) : void 0
    });
    if (token.isCancellationRequested) {
      modelRef.dispose();
      return void 0;
    }
    return { modelRef, lockToAgent: void 0 };
  }
};

InlineChatSessionResolver = __decorateClass([
  __decorateParam(0, IChatSessionsService),
  __decorateParam(1, IChatService),
  __decorateParam(2, IConfigurationService)
], InlineChatSessionResolver);
export { getInlineChatSessionMeta, IInlineChatSessionResolver, InlineChatSessionResolver };
