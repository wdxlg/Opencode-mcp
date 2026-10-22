// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/chatContributions/chatDraft/chatDraftContribution.ts
import { Disposable } from "./module-0010.mjs";
import { isAhpChatChannel, parseChatUri } from "./module-0047.mjs";
import { URI } from "./module-0023.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";
import { ISessionDataService } from "./module-0139.mjs";


// src/vs/platform/agentHost/node/chatContributions/chatDraft/chatDraftContribution.ts
var ChatDraftContribution = class extends Disposable {
  constructor(_context, _logService, _sessionDataService) {
    super();
    this._context = _context;
    this._logService = _logService;
    this._sessionDataService = _sessionDataService;
    this.order = 600;
  }
  static {
    this.id = "chatDraft";
  }
  onDidApplyClientAction(observed) {
    if (observed.action.type !== "chat/draftChanged" /* ChatDraftChanged */ || !isAhpChatChannel(observed.channel) || !parseChatUri(observed.channel)) {
      return;
    }
    const { draft } = observed.action;
    void (async () => {
      try {
        const ref = this._sessionDataService.openDatabase(URI.parse(observed.session));
        try {
          await ref.object.setChatDraft(URI.parse(observed.channel), draft);
        } finally {
          ref.dispose();
        }
      } catch (err) {
        this._logService.warn(`[ChatDraftContribution] Failed to persist chat draft for ${observed.channel}`, err);
      }
    })();
  }
  async onHydrateChat(context, restored) {
    if (restored.draft !== void 0) {
      return restored;
    }
    try {
      const ref = await this._sessionDataService.tryOpenDatabase(URI.parse(context.session));
      if (!ref) {
        return restored;
      }
      try {
        const draft = await ref.object.getChatDraft(URI.parse(context.chat));
        return draft !== void 0 ? { ...restored, draft } : restored;
      } finally {
        ref.dispose();
      }
    } catch (err) {
      this._logService.warn(`[ChatDraftContribution] Failed to restore chat draft for ${context.chat}`, err);
      return restored;
    }
  }
};

ChatDraftContribution = __decorateClass([
  __decorateParam(1, ILogService),
  __decorateParam(2, ISessionDataService)
], ChatDraftContribution);
export { ChatDraftContribution };
