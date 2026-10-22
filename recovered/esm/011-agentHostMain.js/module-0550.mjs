// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/chatContributions/worktreeAnnouncement/worktreeAnnouncementContribution.ts
import { Disposable } from "./module-0010.mjs";
import { isDefaultChatUri } from "./module-0047.mjs";
import { URI } from "./module-0023.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostWorktreeIsolation } from "./module-0165.mjs";


// src/vs/platform/agentHost/node/chatContributions/worktreeAnnouncement/worktreeAnnouncementContribution.ts
var WorktreeAnnouncementContribution = class extends Disposable {
  constructor(_context, _worktreeIsolation) {
    super();
    this._context = _context;
    this._worktreeIsolation = _worktreeIsolation;
    this.order = 200;
  }
  static {
    this.id = "worktreeAnnouncement";
  }
  async onHydrateTurns(context, turns) {
    if (!isDefaultChatUri(context.chat)) {
      return turns;
    }
    return this._worktreeIsolation.applyRestoreAnnouncement(URI.parse(context.session), turns);
  }
};

WorktreeAnnouncementContribution = __decorateClass([
  __decorateParam(1, IAgentHostWorktreeIsolation)
], WorktreeAnnouncementContribution);
export { WorktreeAnnouncementContribution };
