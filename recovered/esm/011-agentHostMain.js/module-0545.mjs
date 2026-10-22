// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/chatContributions/sessionTitle/sessionTitleContribution.ts
import { Disposable } from "./module-0010.mjs";
import { isAhpChatChannel, isDefaultChatUri } from "./module-0047.mjs";
import { AGENT_HOST_TITLE_SOURCE_USER, SESSION_CUSTOM_TITLE_KEY, SESSION_CUSTOM_TITLE_SOURCE_KEY, customChatTitleMetadataKey, customChatTitleSourceMetadataKey, persistSessionMetadata } from "./module-0482.mjs";
import { URI } from "./module-0023.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";
import { ISessionDataService } from "./module-0139.mjs";
import { IAgentHostSessionTitleController } from "./module-0491.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/chatContributions/sessionTitle/sessionTitleContribution.ts
var SessionTitleContribution = class extends Disposable {
  constructor(_context, _stateManager, _sessionDataService, _titleController, _logService) {
    super();
    this._context = _context;
    this._stateManager = _stateManager;
    this._sessionDataService = _sessionDataService;
    this._titleController = _titleController;
    this._logService = _logService;
    this.order = 400;
  }
  static {
    this.id = "sessionTitle";
  }
  onTurnEnd(turn) {
    if (turn.reason.kind !== "success") {
      return;
    }
    const chat = isAhpChatChannel(turn.channel) && !isDefaultChatUri(turn.channel) ? turn.channel : void 0;
    this._titleController.refineTitleFromFirstTurn(turn.session, chat);
  }
  async onOutgoingTurn(turn) {
    const instruction = await this._titleController.prepareInstructionForAgent(turn.session, turn.chat);
    return instruction ? { instructions: [instruction] } : void 0;
  }
  onDidApplyClientAction(observed) {
    if (observed.action.type !== "session/titleChanged" /* SessionTitleChanged */) {
      return;
    }
    if (isAhpChatChannel(observed.channel)) {
      this._stateManager.updateChatTitle(observed.session, observed.channel, observed.action.title);
      this._persistSessionMetadata(observed.session, customChatTitleMetadataKey(observed.channel), observed.action.title);
      this._persistSessionMetadata(observed.session, customChatTitleSourceMetadataKey(observed.channel), AGENT_HOST_TITLE_SOURCE_USER);
      this._titleController.markTitleRenamed(observed.session, observed.channel);
      if (isDefaultChatUri(observed.channel)) {
        this._stateManager.dispatchServerAction(observed.session, observed.action);
        this._persistSessionMetadata(observed.session, SESSION_CUSTOM_TITLE_KEY, observed.action.title);
        this._persistSessionMetadata(observed.session, SESSION_CUSTOM_TITLE_SOURCE_KEY, AGENT_HOST_TITLE_SOURCE_USER);
        this._titleController.markTitleRenamed(observed.session);
      }
      return;
    }
    this._persistSessionMetadata(observed.channel, SESSION_CUSTOM_TITLE_KEY, observed.action.title);
    this._persistSessionMetadata(observed.channel, SESSION_CUSTOM_TITLE_SOURCE_KEY, AGENT_HOST_TITLE_SOURCE_USER);
    this._titleController.markTitleRenamed(observed.channel);
  }
  /**
   * Restores the user-set custom chat title recorded by {@link onDidApplyClientAction}. This runs at
   * catalog-registration time so a restored peer chat shows its title before its turns load.
   */
  async onHydrateChat(context, restored) {
    if (restored.title !== void 0) {
      return restored;
    }
    const ref = await this._sessionDataService.tryOpenDatabase(URI.parse(context.session));
    if (!ref) {
      return restored;
    }
    try {
      const title = await ref.object.getMetadata(customChatTitleMetadataKey(context.chat)) ?? void 0;
      return title !== void 0 ? { ...restored, title } : restored;
    } catch (err) {
      this._logService.warn(`[SessionTitleContribution] Failed to restore custom chat title for ${context.chat}`, err);
      return restored;
    } finally {
      ref.dispose();
    }
  }
  _persistSessionMetadata(session, key, value) {
    persistSessionMetadata(this._sessionDataService, this._logService, session, key, value);
  }
};

SessionTitleContribution = __decorateClass([
  __decorateParam(1, IAgentHostStateManager),
  __decorateParam(2, ISessionDataService),
  __decorateParam(3, IAgentHostSessionTitleController),
  __decorateParam(4, ILogService)
], SessionTitleContribution);
export { SessionTitleContribution };
