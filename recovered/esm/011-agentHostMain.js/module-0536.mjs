// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/chatContributions/checkpointAndChangeset/checkpointAndChangesetContribution.ts
import { Disposable } from "./module-0010.mjs";
import { URI } from "./module-0023.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0084.mjs";
import { IAgentHostCheckpointService } from "./module-0131.mjs";
import { IAgentHostChangesetService } from "./module-0444.mjs";
import { IAgentConfigurationService } from "./module-0104.mjs";


// src/vs/platform/agentHost/node/chatContributions/checkpointAndChangeset/checkpointAndChangesetContribution.ts
var CheckpointAndChangesetContribution = class extends Disposable {
  constructor(_context, _logService, _checkpointService, _changesets, _agentConfigService) {
    super();
    this._context = _context;
    this._logService = _logService;
    this._checkpointService = _checkpointService;
    this._changesets = _changesets;
    this._agentConfigService = _agentConfigService;
    this.order = 100;
  }
  static {
    this.id = "checkpointAndChangeset";
  }
  onTurnEnd(turn) {
    if (turn.reason.kind !== "success" && turn.reason.kind !== "error") {
      return;
    }
    if (turn.reason.kind === "error" && turn.reason.resumable) {
      return;
    }
    if (turn.turnId === void 0) {
      this._changesets.onTurnComplete(turn.session, turn.turnId, turn.clientContext);
      return;
    }
    const workingDirectories = this._agentConfigService.getEffectiveWorkingDirectories(turn.session)?.map((w) => URI.parse(w));
    this._checkpointService.captureTurnCheckpoint(URI.parse(turn.session), URI.parse(turn.channel), turn.turnId, workingDirectories).then(() => {
      this._changesets.onTurnComplete(turn.session, turn.turnId, turn.clientContext);
    }, (err) => {
      if (turn.reason.kind === "success") {
        this._logService.warn(`[AgentSideEffects] Turn checkpoint capture failed for ${turn.session}/${turn.turnId}: ${err instanceof Error ? err.message : String(err)}`);
      }
      this._changesets.onTurnComplete(turn.session, turn.turnId, turn.clientContext);
    });
  }
};

CheckpointAndChangesetContribution = __decorateClass([
  __decorateParam(1, ILogService),
  __decorateParam(2, IAgentHostCheckpointService),
  __decorateParam(3, IAgentHostChangesetService),
  __decorateParam(4, IAgentConfigurationService)
], CheckpointAndChangesetContribution);
export { CheckpointAndChangesetContribution };
