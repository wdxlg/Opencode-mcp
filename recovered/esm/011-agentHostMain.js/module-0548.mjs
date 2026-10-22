// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/chatContributions/turnAdmission/turnAdmissionContribution.ts
import { Disposable } from "./module-0010.mjs";
import { isChatReadOnly } from "./module-0047.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";
import { ILogService } from "./module-0084.mjs";


// src/vs/platform/agentHost/node/chatContributions/turnAdmission/turnAdmissionContribution.ts
var TurnAdmissionContribution = class extends Disposable {
  constructor(_context, _stateManager, _logService) {
    super();
    this._context = _context;
    this._stateManager = _stateManager;
    this._logService = _logService;
    this.order = 100;
  }
  static {
    this.id = "turnAdmission";
  }
  onIncomingRequest(request) {
    const chatState = this._stateManager.getChatState(request.chat);
    const sessionStatus = this._stateManager.getSessionSummary(request.session)?.status ?? 0;
    const sessionArchived = (sessionStatus & 64 /* IsArchived */) === 64 /* IsArchived */;
    if (isChatReadOnly(chatState?.interactivity, sessionArchived)) {
      const error = sessionArchived ? { errorType: "archived", message: "This session is archived and read-only. Restore the session to continue the conversation." } : { errorType: "readOnly", message: "This chat is read-only." };
      this._logService.warn(`[TurnAdmissionContribution] Rejecting turn on read-only chat=${request.chat} (archived=${sessionArchived}), turnId=${request.turnId}`);
      return { kind: "reject", error, stage: "validation" };
    }
    return void 0;
  }
};

TurnAdmissionContribution = __decorateClass([
  __decorateParam(1, IAgentHostStateManager),
  __decorateParam(2, ILogService)
], TurnAdmissionContribution);
export { TurnAdmissionContribution };
