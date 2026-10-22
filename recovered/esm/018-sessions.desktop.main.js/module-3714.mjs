// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/blockedSessions/browser/blockedSessions.ts
import { Disposable } from "./module-0012.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { derivedOpts } from "./module-0054.mjs";
import { equals } from "./module-0007.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { IGitHubService } from "./module-3607.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/sessions/contrib/blockedSessions/browser/blockedSessions.ts
var LOG_PREFIX11 = "[BlockedSessions]";

var BlockedSessions = class extends Disposable {
  constructor(_sessionsManagementService, _gitHubService, _logService) {
    super();
    this._sessionsManagementService = _sessionsManagementService;
    this._gitHubService = _gitHubService;
    this._logService = _logService;
    this._allSessions = observableFromEvent(
      this,
      this._sessionsManagementService.onDidChangeSessions,
      () => this._sessionsManagementService.getSessions()
    );
    this.blockedSessionsWithReasons = derivedOpts({
      owner: this,
      equalsFn: (a, b) => equals(a, b, (x, y) => x.session.sessionId === y.session.sessionId && x.reason === y.reason && x.occurrenceId === y.occurrenceId)
    }, (reader) => {
      const sessions = this._allSessions.read(reader);
      const blocked = [];
      for (const session of sessions) {
        const blockedSession = this._getBlockedSession(reader, session);
        if (blockedSession !== void 0) {
          blocked.push(blockedSession);
        }
      }
      blocked.sort((a, b) => b.session.updatedAt.read(reader).getTime() - a.session.updatedAt.read(reader).getTime());
      if (this._logService.getLevel() === 1 /* Trace */) {
        this._logService.trace(`${LOG_PREFIX11} computed blocked sessions (${blocked.length} of ${sessions.length}): ${describeBlockedSessions(blocked)}`);
      }
      return blocked;
    });
    this.blockedSessions = derivedOpts({
      owner: this,
      equalsFn: (a, b) => equals(a, b, (x, y) => x.sessionId === y.sessionId)
    }, (reader) => this.blockedSessionsWithReasons.read(reader).map((blocked) => blocked.session));
  }
  _getBlockedSession(reader, session) {
    if (session.isArchived.read(reader)) {
      return void 0;
    }
    const status2 = session.status.read(reader);
    if (status2 === 2 /* NeedsInput */) {
      return {
        session,
        reason: "needsInput" /* NeedsInput */,
        occurrenceId: "needsInput" /* NeedsInput */
      };
    }
    if (status2 === 1 /* InProgress */) {
      return void 0;
    }
    const gitHubInfo = session.workspace.read(reader)?.folders[0]?.gitRepository?.gitHubInfo.read(reader);
    if (!gitHubInfo?.pullRequest) {
      return void 0;
    }
    const prRef = reader.delayedStore.add(this._gitHubService.createPullRequestModelReference(gitHubInfo.owner, gitHubInfo.repo, gitHubInfo.pullRequest.number));
    const livePR = prRef.object.pullRequest.read(reader);
    if (!livePR) {
      return void 0;
    }
    if (livePR.isDraft || livePR.state !== "open" /* Open */) {
      return void 0;
    }
    const ciRef = reader.delayedStore.add(this._gitHubService.createPullRequestCIModelReference(gitHubInfo.owner, gitHubInfo.repo, livePR.number, livePR.headSha));
    if (ciRef.object.overallStatus.read(reader) === "failure" /* Failure */) {
      return {
        session,
        reason: "failingCI" /* FailingCI */,
        occurrenceId: `${"failingCI" /* FailingCI */}:${livePR.headSha}`
      };
    }
    return void 0;
  }
};

BlockedSessions = __decorateClass([
  __decorateParam(0, ISessionsManagementService),
  __decorateParam(1, IGitHubService),
  __decorateParam(2, ILogService)
], BlockedSessions);

function describeBlockedSessions(blocked) {
  return `[${blocked.map((entry) => `${entry.session.sessionId}=${entry.occurrenceId}`).join(", ")}]`;
}
export { describeBlockedSessions, LOG_PREFIX11, BlockedSessions };
