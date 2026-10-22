// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/codeReview/browser/codeReviewService.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { derivedOpts } from "./module-0054.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { arrayEquals } from "./module-0042.mjs";
import { getGitHubPullRequestRefs } from "./module-1767.mjs";
import { autorun } from "./module-0052.mjs";
import { URI } from "./module-0032.mjs";
import { Range2 } from "./module-0106.mjs";
import { observableValue } from "./module-0048.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";
import { IGitHubService } from "./module-3607.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsService } from "./module-1783.mjs";


// src/vs/sessions/contrib/codeReview/browser/codeReviewService.ts
var ICodeReviewService = createDecorator("codeReviewService");

var CodeReviewService = class extends Disposable {
  constructor(_logService, _gitHubService, _sessionsManagementService, _sessionsService) {
    super();
    this._logService = _logService;
    this._gitHubService = _gitHubService;
    this._sessionsManagementService = _sessionsManagementService;
    this._sessionsService = _sessionsService;
    this._prReviewBySession = /* @__PURE__ */ new Map();
    /**
     * PR review comment IDs that have been locally handled — converted to agent
     * feedback or dismissed from the `viewUnreviewedComments` confirmation — and
     * are therefore hidden from the PR review state (per session).
     */
    this._convertedPRCommentsBySession = /* @__PURE__ */ new Map();
    this._registerSessionListeners();
    const activeReviewContext = derivedOpts({
      owner: this,
      equalsFn: (a, b) => a === b || !!a && !!b && isEqual2(a.sessionResource, b.sessionResource) && isEqual2(a.workingDirectory, b.workingDirectory) && arrayEquals(a.pullRequests, b.pullRequests, (x, y) => x.owner === y.owner && x.repo === y.repo && x.number === y.number)
    }, (reader) => {
      const activeSession = this._sessionsService.activeSession.read(reader);
      if (!activeSession) {
        return void 0;
      }
      const workspace = activeSession.workspace.read(reader);
      const gitHubInfo = workspace?.folders[0]?.gitRepository?.gitHubInfo.read(reader);
      return {
        sessionResource: activeSession.resource,
        workingDirectory: workspace?.folders[0]?.workingDirectory,
        pullRequests: getGitHubPullRequestRefs(gitHubInfo)
      };
    });
    this._register(autorun((reader) => {
      const context2 = activeReviewContext.read(reader);
      for (const pullRequest of context2?.pullRequests ?? []) {
        const reviewThreadsRef = reader.store.add(this._gitHubService.createPullRequestReviewThreadsModelReference(pullRequest.owner, pullRequest.repo, pullRequest.number));
        void reviewThreadsRef.object.refresh();
        reader.store.add(reviewThreadsRef.object.startPolling());
      }
    }));
    this._register(autorun((reader) => {
      const context2 = activeReviewContext.read(reader);
      if (!context2 || context2.pullRequests.length === 0) {
        return;
      }
      const data = this._getOrCreatePRReviewData(context2.sessionResource);
      if (data.state.read(void 0).kind === "none" /* None */) {
        data.state.set({ kind: "loading" /* Loading */ }, void 0);
      }
      const converted = this._convertedPRCommentsBySession.get(context2.sessionResource.toString());
      const comments = [];
      const incompletePullRequests = [];
      let initialRefreshCompleted = true;
      for (const pullRequest of context2.pullRequests) {
        const reviewThreadsRef = reader.store.add(this._gitHubService.createPullRequestReviewThreadsModelReference(pullRequest.owner, pullRequest.repo, pullRequest.number));
        const reviewThreadsModel = reviewThreadsRef.object;
        initialRefreshCompleted = reviewThreadsModel.initialRefreshCompleted.read(reader) && initialRefreshCompleted;
        if (!reviewThreadsModel.hasLoaded.read(reader)) {
          incompletePullRequests.push(pullRequest);
        }
        const threads = reviewThreadsModel.reviewThreads.read(reader);
        for (const thread of threads) {
          if (thread.isResolved) {
            continue;
          }
          const threadId = String(thread.id);
          if (converted?.has(threadId)) {
            continue;
          }
          const baseUri = context2.workingDirectory;
          if (!baseUri) {
            continue;
          }
          const fileUri = URI.joinPath(baseUri, thread.path);
          const line = thread.line ?? 1;
          const firstComment = thread.comments[0];
          comments.push({
            id: String(thread.id),
            pullRequest,
            uri: fileUri,
            range: new Range2(line, 1, line, 1),
            body: firstComment?.body ?? "",
            author: firstComment?.author.login ?? ""
          });
        }
      }
      if (!initialRefreshCompleted) {
        data.state.set({ kind: "loading" /* Loading */ }, void 0);
        return;
      }
      data.state.set({ kind: "loaded" /* Loaded */, comments, incompletePullRequests }, void 0);
    }));
  }
  _registerSessionListeners() {
    this._register(this._sessionsManagementService.onDidChangeSessions((e4) => {
      for (const session of [...e4.removed, ...e4.changed.filter((s) => s.isArchived.get())]) {
        this._disposePRReview(session.resource);
      }
    }));
  }
  getPRReviewState(sessionResource) {
    return this._getOrCreatePRReviewData(sessionResource).state;
  }
  async resolvePRReviewThread(sessionResource, threadId, pullRequest) {
    const session = this._sessionsManagementService.getSession(sessionResource);
    const gitHubInfo = session?.workspace.get()?.folders[0]?.gitRepository?.gitHubInfo.get();
    const state = this._prReviewBySession.get(sessionResource.toString())?.state.get();
    const source = pullRequest ?? (state?.kind === "loaded" /* Loaded */ ? state.comments.find((comment) => comment.id === threadId)?.pullRequest : void 0) ?? getGitHubPullRequestRefs(gitHubInfo)[0];
    if (source) {
      const modelRef = this._gitHubService.createPullRequestReviewThreadsModelReference(source.owner, source.repo, source.number);
      try {
        await modelRef.object.resolveThread(threadId);
      } catch (err) {
        this._logService.warn("[CodeReviewService] Failed to resolve PR thread on GitHub:", err);
      } finally {
        modelRef.dispose();
      }
    }
    const data = this._prReviewBySession.get(sessionResource.toString());
    if (data) {
      const currentState = data.state.get();
      if (currentState.kind === "loaded" /* Loaded */) {
        const filtered = currentState.comments.filter((c) => c.id !== threadId);
        data.state.set({ ...currentState, comments: filtered }, void 0);
      }
    }
  }
  markPRReviewCommentConverted(sessionResource, commentId) {
    this._suppressPRReviewComment(sessionResource, commentId);
  }
  dismissPRReviewComment(sessionResource, commentId) {
    this._suppressPRReviewComment(sessionResource, commentId);
  }
  /**
   * Hide a PR review comment from the session's review state and remember it
   * so the projection autorun keeps filtering it. Shared by
   * {@link markPRReviewCommentConverted} and {@link dismissPRReviewComment}.
   */
  _suppressPRReviewComment(sessionResource, commentId) {
    const key3 = sessionResource.toString();
    let converted = this._convertedPRCommentsBySession.get(key3);
    if (!converted) {
      converted = /* @__PURE__ */ new Set();
      this._convertedPRCommentsBySession.set(key3, converted);
    }
    converted.add(commentId);
    const data = this._prReviewBySession.get(key3);
    if (data) {
      const currentState = data.state.get();
      if (currentState.kind === "loaded" /* Loaded */) {
        const filtered = currentState.comments.filter((c) => c.id !== commentId);
        data.state.set({ ...currentState, comments: filtered }, void 0);
      }
    }
  }
  _getOrCreatePRReviewData(sessionResource) {
    const key3 = sessionResource.toString();
    let data = this._prReviewBySession.get(key3);
    if (!data) {
      data = {
        state: observableValue(`prReview.state.${key3}`, { kind: "none" /* None */ })
      };
      this._prReviewBySession.set(key3, data);
    }
    return data;
  }
  _disposePRReview(sessionResource) {
    const key3 = sessionResource.toString();
    this._convertedPRCommentsBySession.delete(key3);
    this._prReviewBySession.delete(key3);
  }
  dispose() {
    this._prReviewBySession.clear();
    super.dispose();
  }
};

CodeReviewService = __decorateClass([
  __decorateParam(0, ILogService),
  __decorateParam(1, IGitHubService),
  __decorateParam(2, ISessionsManagementService),
  __decorateParam(3, ISessionsService)
], CodeReviewService);
export { ICodeReviewService, CodeReviewService };
