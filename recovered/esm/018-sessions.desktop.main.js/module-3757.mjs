// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/browser/github.contribution.ts
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { autorun } from "./module-0052.mjs";
import { structuralEquals } from "./module-0042.mjs";
import { getGitHubPullRequestRefs } from "./module-1767.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { GitHubService, IGitHubService } from "./module-3607.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ILogService } from "./module-0095.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IPullRequestIconCache, PullRequestIconCache } from "./module-3657.mjs";


// src/vs/sessions/contrib/github/browser/github.contribution.ts
var TRACE_PREFIX6 = "[PR-ICON-TRACE]";

var SessionPollingTracker = class extends Disposable {
  constructor(session, poller) {
    super();
    this.session = session;
    this._register(poller);
  }
};

var GitHubPullRequestPollingContribution = class extends Disposable {
  constructor(_gitHubService, _sessionsManagementService, _sessionsService, _logService) {
    super();
    this._gitHubService = _gitHubService;
    this._sessionsManagementService = _sessionsManagementService;
    this._sessionsService = _sessionsService;
    this._logService = _logService;
    /** Per-session pollers, keyed by `session.sessionId`. */
    this._sessionTrackers = this._register(new DisposableMap());
    const activeSessionResourceObs = derivedOpts({ equalsFn: isEqual2 }, (reader) => {
      const activeSession = this._sessionsService.activeSession.read(reader);
      if (!activeSession || !activeSession.resource || activeSession.isArchived.read(reader)) {
        return void 0;
      }
      return activeSession.resource;
    });
    this._register(autorun((reader) => {
      const activeSessionResource = activeSessionResourceObs.read(reader);
      if (!activeSessionResource) {
        return;
      }
      const model = this._gitHubService.activeSessionPullRequestObs.read(reader);
      model?.refresh();
    }));
    this._register(autorun((reader) => {
      const activeSessionResource = activeSessionResourceObs.read(reader);
      if (!activeSessionResource) {
        return;
      }
      const model = this._gitHubService.activeSessionPullRequestCIObs.read(reader);
      if (!model) {
        return;
      }
      model.refresh();
      reader.store.add(model.startPolling());
    }));
    this._register(autorun((reader) => {
      const activeSessionResource = activeSessionResourceObs.read(reader);
      if (!activeSessionResource) {
        return;
      }
      const model = this._gitHubService.activeSessionPullRequestReviewThreadsObs.read(reader);
      if (!model) {
        return;
      }
      model.refresh();
      reader.store.add(model.startPolling());
    }));
    this._sessionsManagementService.onDidChangeSessions(this._onDidChangeSessions, this, this._store);
    this._onDidChangeSessions({ added: this._sessionsManagementService.getSessions(), removed: [], changed: [] });
  }
  static {
    this.ID = "sessions.contrib.githubPullRequestPolling";
  }
  _onDidChangeSessions(e4) {
    for (const session of e4.added) {
      this._trackSession(session);
    }
    for (const session of e4.changed) {
      this._trackSession(session);
    }
    for (const session of e4.removed) {
      const tracker2 = this._sessionTrackers.get(session.sessionId);
      if (tracker2 && this._hasSamePollingSource(tracker2.session, session)) {
        this._logService.trace(`${TRACE_PREFIX6} [PollingContribution] Session ${session.sessionId} removed; disposing its poller (PR model no longer kept warm)`);
        this._sessionTrackers.deleteAndDispose(session.sessionId);
      }
    }
    this._logService.trace(`${TRACE_PREFIX6} [PollingContribution] onDidChangeSessions (added ${e4.added.length}, changed ${e4.changed.length}, removed ${e4.removed.length}); now tracking ${this._sessionTrackers.size} session poller(s)`);
  }
  _trackSession(session) {
    const existing = this._sessionTrackers.get(session.sessionId);
    if (existing && this._hasSamePollingSource(existing.session, session)) {
      return;
    }
    if (existing) {
      this._logService.trace(`${TRACE_PREFIX6} [PollingContribution] Session ${session.sessionId} polling source changed; replacing its poller`);
    }
    this._logService.trace(`${TRACE_PREFIX6} [PollingContribution] Session ${session.sessionId} now tracked; poller will keep its PR model warm once a PR number resolves`);
    this._sessionTrackers.set(session.sessionId, new SessionPollingTracker(session, this._createSessionPoller(session)));
  }
  _hasSamePollingSource(first2, second) {
    return isEqual2(first2.resource, second.resource) && first2.workspace === second.workspace && first2.isArchived === second.isArchived;
  }
  /**
   * Reactively poll the pull request for a single session.
   *
   * Unlike a one-shot snapshot, the returned autorun re-runs when the session's
   * pull-request identity changes — so polling starts once a provider resolves
   * the PR number asynchronously (e.g. the agent host), and stops when the
   * session is archived or the PR goes away. A merged pull request can never
   * change again, so it stops polling unless it is the active session.
   */
  _createSessionPoller(session) {
    const pullRequestIdentityObs = derivedOpts(
      { owner: this, equalsFn: structuralEquals },
      (reader) => {
        if (session.isArchived.read(reader)) {
          return { kind: "archived" };
        }
        const workspace = session.workspace.read(reader);
        if (!workspace) {
          return { kind: "no-workspace" };
        }
        const gitRepository = workspace.folders[0]?.gitRepository;
        if (!gitRepository) {
          return { kind: "no-git-repository" };
        }
        const gitHubInfo = gitRepository.gitHubInfo.read(reader);
        const pullRequests = getGitHubPullRequestRefs(gitHubInfo);
        if (pullRequests.length === 0) {
          return { kind: "no-pull-request" };
        }
        return {
          kind: "ok",
          pullRequests: pullRequests.map(({ owner, repo, number: prNumber }) => ({ owner, repo, prNumber }))
        };
      }
    );
    return autorun((reader) => {
      const identity2 = pullRequestIdentityObs.read(reader);
      if (identity2.kind !== "ok") {
        this._logService.trace(`${TRACE_PREFIX6} [PollingContribution] Session ${session.sessionId} has no PR identity yet (reason: ${identity2.kind}); NOT keeping a PR model warm. Will re-run reactively if this input changes.`);
        return;
      }
      this._logService.trace(`${TRACE_PREFIX6} [PollingContribution] Session ${session.sessionId} resolved ${identity2.pullRequests.length} PR identities; acquiring models and refreshing`);
      for (const pullRequest of identity2.pullRequests) {
        this._pollPullRequest(session, pullRequest, reader);
      }
    });
  }
  _pollPullRequest(session, identity2, reader) {
    const { owner, repo, prNumber } = identity2;
    this._logService.trace(`${TRACE_PREFIX6} [PollingContribution] Session ${session.sessionId} polling ${owner}/${repo}#${prNumber}`);
    const modelRef = reader.store.add(this._gitHubService.createPullRequestModelReference(owner, repo, prNumber));
    const model = modelRef.object;
    model.refresh();
    const shouldPollObs = derived(this, (pollReader) => {
      const prDetails = model.pullRequest.read(pollReader);
      const isMerged = prDetails?.state === "merged" /* Merged */;
      return !isMerged || this._isActiveSession(session, pollReader);
    });
    reader.store.add(autorun((pollReader) => {
      if (!shouldPollObs.read(pollReader)) {
        this._logService.trace(`${TRACE_PREFIX6} [PollingContribution] Session ${session.sessionId} PR ${owner}/${repo}#${prNumber} is merged and not active; not polling`);
        return;
      }
      this._logService.trace(`${TRACE_PREFIX6} [PollingContribution] Session ${session.sessionId} starting PR polling for ${owner}/${repo}#${prNumber}`);
      pollReader.store.add(model.startPolling());
    }));
    reader.store.add(autorun((statusReader) => {
      const prDetails = model.pullRequest.read(statusReader);
      if (!prDetails || prDetails.isDraft || prDetails.state !== "open" /* Open */) {
        return;
      }
      this._logService.trace(`${TRACE_PREFIX6} [PollingContribution] Session ${session.sessionId} starting CI + review-thread polling for ${owner}/${repo}#${prNumber}@${prDetails.headSha}`);
      const ciModelRef = statusReader.store.add(this._gitHubService.createPullRequestCIModelReference(owner, repo, prNumber, prDetails.headSha));
      ciModelRef.object.refresh();
      statusReader.store.add(ciModelRef.object.startPolling());
      const reviewThreadsModelRef = statusReader.store.add(this._gitHubService.createPullRequestReviewThreadsModelReference(owner, repo, prNumber));
      reviewThreadsModelRef.object.refresh();
      statusReader.store.add(reviewThreadsModelRef.object.startPolling());
    }));
  }
  _isActiveSession(session, reader) {
    const activeSession = this._sessionsService.activeSession.read(reader);
    if (!activeSession || activeSession.isArchived.read(reader)) {
      return false;
    }
    return isEqual2(activeSession.resource, session.resource);
  }
};

GitHubPullRequestPollingContribution = __decorateClass([
  __decorateParam(0, IGitHubService),
  __decorateParam(1, ISessionsManagementService),
  __decorateParam(2, ISessionsService),
  __decorateParam(3, ILogService)
], GitHubPullRequestPollingContribution);

registerWorkbenchContribution2(GitHubPullRequestPollingContribution.ID, GitHubPullRequestPollingContribution, WorkbenchPhase.AfterRestored);

registerSingleton(IGitHubService, GitHubService, 1 /* Delayed */);

registerSingleton(IPullRequestIconCache, PullRequestIconCache, 1 /* Delayed */);
export { TRACE_PREFIX6, SessionPollingTracker, GitHubPullRequestPollingContribution };
