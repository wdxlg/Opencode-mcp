// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/chatContributions/githubReferences/githubReferencesContribution.ts
import { Disposable } from "./module-0010.mjs";
import { URI } from "./module-0023.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";
import { IAgentHostGitStateService } from "./module-0445.mjs";


// src/vs/platform/agentHost/node/chatContributions/githubReferences/githubReferencesContribution.ts
var GitHubReferencesContribution = class extends Disposable {
  constructor(_context, _stateManager, _gitStateService) {
    super();
    this._context = _context;
    this._stateManager = _stateManager;
    this._gitStateService = _gitStateService;
    this.order = 300;
  }
  static {
    this.id = "githubReferences";
  }
  onTurnEnd(turn) {
    if (turn.reason.kind === "success") {
      const workingDirectory = this._stateManager.getSessionState(turn.session)?.workingDirectories?.[0];
      void this._gitStateService.attachSessionGitHubPullRequest(turn.session, workingDirectory ? URI.parse(workingDirectory) : void 0);
    }
  }
};

GitHubReferencesContribution = __decorateClass([
  __decorateParam(1, IAgentHostStateManager),
  __decorateParam(2, IAgentHostGitStateService)
], GitHubReferencesContribution);
export { GitHubReferencesContribution };
