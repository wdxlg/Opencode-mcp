// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessions/browser/blockedSessionsCIFixModel.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { buildFixCIPrompt, getFailedChecks } from "./module-3616.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { ChatSendResult, IChatService } from "./module-0973.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IGitHubService } from "./module-3607.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/sessions/contrib/sessions/browser/blockedSessionsCIFixModel.ts
var BlockedSessionsCIFixModel = class extends Disposable {
  constructor(_gitHubService, _chatService, _logService) {
    super();
    this._gitHubService = _gitHubService;
    this._chatService = _chatService;
    this._logService = _logService;
    /** Cached CI-state observables, keyed by session, to keep references stable and GC-friendly. */
    this._states = /* @__PURE__ */ new WeakMap();
    /**
     * Session ids whose fix-CI submission is in flight. Doubles as the guard that
     * stops repeated clicks submitting duplicate prompts, and as the set the
     * blocked-sessions indicator hides while the background work runs.
     */
    this._hiddenSessions = observableValue(this, /* @__PURE__ */ new Set());
    this.hiddenSessions = this._hiddenSessions;
  }
  getCIFix(session) {
    let obs = this._states.get(session);
    if (!obs) {
      obs = derived(this, (reader) => {
        const gitHubInfo = session.workspace.read(reader)?.folders[0]?.gitRepository?.gitHubInfo.read(reader);
        if (!gitHubInfo?.pullRequest) {
          return void 0;
        }
        const prRef = reader.delayedStore.add(this._gitHubService.createPullRequestModelReference(gitHubInfo.owner, gitHubInfo.repo, gitHubInfo.pullRequest.number));
        const livePR = prRef.object.pullRequest.read(reader);
        if (!livePR) {
          return void 0;
        }
        const ciRef = reader.delayedStore.add(this._gitHubService.createPullRequestCIModelReference(gitHubInfo.owner, gitHubInfo.repo, gitHubInfo.pullRequest.number, livePR.headSha));
        const ciModel = ciRef.object;
        if (ciModel.fixRequested.read(reader)) {
          return void 0;
        }
        const checks = ciModel.checks.read(reader);
        const failed = getFailedChecks(checks).length;
        if (failed === 0) {
          return void 0;
        }
        const completed = checks.filter((check) => check.status === "completed" /* Completed */).length;
        const pending = checks.length - completed;
        return { failed, pending };
      });
      this._states.set(session, obs);
    }
    return obs;
  }
  fixCI(session) {
    if (this._hiddenSessions.get().has(session.sessionId)) {
      return;
    }
    this._setHidden(session.sessionId, true);
    this._fixCI(session).catch((err) => this._logService.error("[BlockedSessionsCIFixModel] Failed to fix CI checks", err)).finally(() => this._setHidden(session.sessionId, false));
  }
  async _fixCI(session) {
    const store = new DisposableStore();
    try {
      const ciModel = this._acquireCIModel(session, store);
      if (!ciModel) {
        return;
      }
      const prompt = await buildFixCIPrompt(ciModel);
      if (!prompt) {
        return;
      }
      const ref = await this._chatService.acquireOrLoadSession(session.resource, "panel" /* Chat */, CancellationToken.None, "BlockedSessionsCIFix");
      if (!ref) {
        this._logService.error("[BlockedSessionsCIFixModel] Cannot fix CI checks: failed to load session", session.resource.toString());
        return;
      }
      try {
        let result = await this._chatService.sendRequest(session.resource, prompt, { agentIdSilent: session.resource.scheme });
        if (ChatSendResult.isQueued(result)) {
          result = await result.deferred;
        }
        if (ChatSendResult.isSent(result)) {
          ciModel.markFixRequested();
        } else if (ChatSendResult.isRejected(result)) {
          this._logService.error("[BlockedSessionsCIFixModel] Fix CI request rejected", result.reason);
        }
      } finally {
        ref.dispose();
      }
    } finally {
      store.dispose();
    }
  }
  _acquireCIModel(session, store) {
    const gitHubInfo = session.workspace.get()?.folders[0]?.gitRepository?.gitHubInfo.get();
    if (!gitHubInfo?.pullRequest) {
      return void 0;
    }
    const prRef = store.add(this._gitHubService.createPullRequestModelReference(gitHubInfo.owner, gitHubInfo.repo, gitHubInfo.pullRequest.number));
    const livePR = prRef.object.pullRequest.get();
    if (!livePR) {
      return void 0;
    }
    const ciRef = store.add(this._gitHubService.createPullRequestCIModelReference(gitHubInfo.owner, gitHubInfo.repo, gitHubInfo.pullRequest.number, livePR.headSha));
    return ciRef.object;
  }
  _setHidden(sessionId, hidden) {
    const current = this._hiddenSessions.get();
    if (current.has(sessionId) === hidden) {
      return;
    }
    const next = new Set(current);
    if (hidden) {
      next.add(sessionId);
    } else {
      next.delete(sessionId);
    }
    this._hiddenSessions.set(next, void 0);
  }
};

BlockedSessionsCIFixModel = __decorateClass([
  __decorateParam(0, IGitHubService),
  __decorateParam(1, IChatService),
  __decorateParam(2, ILogService)
], BlockedSessionsCIFixModel);
export { BlockedSessionsCIFixModel };
