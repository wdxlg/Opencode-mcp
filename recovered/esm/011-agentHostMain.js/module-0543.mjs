// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/chatContributions/sessionFlags/sessionFlagsContribution.ts
import { Disposable } from "./module-0010.mjs";
import { persistSessionMetadata } from "./module-0482.mjs";
import { AH_META_IS_ARCHIVED_DB_KEY, AH_META_IS_READ_DB_KEY } from "./module-0047.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";
import { ISessionDataService } from "./module-0139.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";


// src/vs/platform/agentHost/node/chatContributions/sessionFlags/sessionFlagsContribution.ts
var SessionFlagsContribution = class extends Disposable {
  constructor(_context, _logService, _sessionDataService, _stateManager) {
    super();
    this._context = _context;
    this._logService = _logService;
    this._sessionDataService = _sessionDataService;
    this._stateManager = _stateManager;
    this.order = 700;
  }
  static {
    this.id = "sessionFlags";
  }
  onDidDispatchAction(dispatched) {
    if (dispatched.action.type === "session/configChanged" /* SessionConfigChanged */) {
      const values = this._stateManager.getSessionState(dispatched.channel)?.config?.values;
      if (values) {
        persistSessionMetadata(this._sessionDataService, this._logService, dispatched.channel, "configValues", JSON.stringify(values));
      }
    }
    if (!dispatched.rejectionReason) {
      if (dispatched.action.type === "session/isReadChanged" /* SessionIsReadChanged */) {
        persistSessionMetadata(this._sessionDataService, this._logService, dispatched.channel, AH_META_IS_READ_DB_KEY, dispatched.action.isRead ? "true" : "");
      } else if (dispatched.action.type === "session/isArchivedChanged" /* SessionIsArchivedChanged */) {
        persistSessionMetadata(this._sessionDataService, this._logService, dispatched.channel, AH_META_IS_ARCHIVED_DB_KEY, dispatched.action.isArchived ? "true" : "");
      }
    }
  }
};

SessionFlagsContribution = __decorateClass([
  __decorateParam(1, ILogService),
  __decorateParam(2, ISessionDataService),
  __decorateParam(3, IAgentHostStateManager)
], SessionFlagsContribution);
export { SessionFlagsContribution };
