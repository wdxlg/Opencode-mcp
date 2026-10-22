// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessionInputBanners/browser/sessionInputBanners.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { derived } from "./module-0054.mjs";
import { isAgentHostProvider } from "./module-1764.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { Event2 } from "./module-0017.mjs";
import { getGitHubPullRequestRefs } from "./module-1767.mjs";
import { buildFixCIPrompt, getFailedChecks, submitFixCIChecks } from "./module-3616.mjs";
import { $ } from "./module-0075.mjs";
import { SessionInputBannerWidget } from "./module-3612.mjs";
import { autorun } from "./module-0052.mjs";
import { URI } from "./module-0032.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { whenChatWidgetForSession } from "./module-3610.mjs";
import { OPEN_PULL_REQUEST_ACTION_ID } from "./module-3594.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { IGitHubService } from "./module-3607.mjs";
import { IAgentFeedbackService } from "./module-3611.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILogService } from "./module-0095.mjs";
import { IChatWidgetService } from "./module-0982.mjs";


// src/vs/sessions/contrib/sessionInputBanners/browser/sessionInputBanners.ts
var STORAGE_KEY_DISMISSED = "sessions.inputBanners.dismissedItems";

var LEGACY_STORAGE_KEY_CI_DISMISSED = "sessions.inputBanners.ci.dismissed";

var LEGACY_STORAGE_KEY_COMMENTS_DISMISSED = "sessions.inputBanners.comments.dismissed";

function pullRequestKey(pullRequest) {
  return `${pullRequest.owner.toLowerCase()}/${pullRequest.repo.toLowerCase()}#${pullRequest.number}`;
}

function pullRequestBannerId(sessionId, pullRequest) {
  return `${sessionId}:pullRequest:${pullRequestKey(pullRequest)}`;
}

function agentCommentsBannerId(sessionId) {
  return `${sessionId}:agentComments`;
}

function feedbackForPullRequest(feedback, pullRequest, firstPullRequest) {
  if (feedback.kind !== "prReview" /* PRReview */) {
    return false;
  }
  const source = feedback.sourcePullRequest ?? firstPullRequest;
  return !!source && pullRequestKey(source) === pullRequestKey(pullRequest);
}

var SessionInputBanners = class extends Disposable {
  constructor(sessionsService, sessionsProvidersService, gitHubService, feedbackService, commandService, storageService, instantiationService, logService, chatWidgetService) {
    super();
    this.sessionsService = sessionsService;
    this.sessionsProvidersService = sessionsProvidersService;
    this.gitHubService = gitHubService;
    this.feedbackService = feedbackService;
    this.commandService = commandService;
    this.storageService = storageService;
    this.logService = logService;
    this.chatWidgetService = chatWidgetService;
    this._active = observableValue(this, false);
    this._debugData = observableValue(this, void 0);
    this._dismissed = observableValue(this, /* @__PURE__ */ new Set());
    this._legacyCIDismissed = observableValue(this, /* @__PURE__ */ new Set());
    this._legacyCommentsDismissed = observableValue(this, /* @__PURE__ */ new Set());
    this._session = derived(this, (reader) => {
      if (!this._active.read(reader)) {
        return void 0;
      }
      const session = this.sessionsService.activeSession.read(reader);
      if (!session || session.status.read(reader) !== 3 /* Completed */) {
        return void 0;
      }
      return session;
    });
    this._agentMergeEnabled = derived(this, (reader) => {
      const session = this._session.read(reader);
      const provider = session && this.sessionsProvidersService.getProvider(session.providerId);
      if (!session || !provider || !isAgentHostProvider(provider)) {
        return false;
      }
      observableSignalFromEvent(reader.store, Event2.filter(provider.onDidChangeSessionConfig, (sessionId) => sessionId === session.sessionId)).read(reader);
      return provider.getAgentMergeSessionState(session.sessionId)?.enabled === true;
    });
    this._states = derived(this, (reader) => {
      const debugData = this._debugData.read(reader);
      if (debugData) {
        return this._debugStates(debugData);
      }
      const session = this._session.read(reader);
      if (!session) {
        return [];
      }
      this._feedbackChanged.read(reader);
      const createdFeedback = this.feedbackService.getFeedback(session.resource).filter((item) => item.state === "created" /* Created */);
      const gitHubInfo = session.workspace.read(reader)?.folders[0]?.gitRepository?.gitHubInfo.read(reader);
      const pullRequests = getGitHubPullRequestRefs(gitHubInfo);
      const onlyPullRequest = pullRequests.length === 1 ? pullRequests[0] : void 0;
      const dismissed = this._dismissed.read(reader);
      const legacyCIDismissed = this._legacyCIDismissed.read(reader).has(session.sessionId);
      const legacyCommentsDismissed = this._legacyCommentsDismissed.read(reader).has(session.sessionId);
      const states = [];
      if (!this._agentMergeEnabled.read(reader)) {
        for (const pullRequest of pullRequests) {
          const id2 = pullRequestBannerId(session.sessionId, pullRequest);
          if (dismissed.has(id2)) {
            continue;
          }
          const comments = legacyCommentsDismissed ? [] : createdFeedback.filter((item) => feedbackForPullRequest(item, pullRequest, onlyPullRequest));
          const prModelRef = reader.store.add(this.gitHubService.createPullRequestModelReference(pullRequest.owner, pullRequest.repo, pullRequest.number));
          const livePullRequest = prModelRef.object.pullRequest.read(reader);
          let failed = 0;
          let completed = 0;
          let pending = 0;
          if (!legacyCIDismissed && livePullRequest && !livePullRequest.isDraft && livePullRequest.state === "open" /* Open */) {
            const ciModelRef = reader.store.add(this.gitHubService.createPullRequestCIModelReference(pullRequest.owner, pullRequest.repo, pullRequest.number, livePullRequest.headSha));
            const ciModel = ciModelRef.object;
            if (!ciModel.fixRequested.read(reader)) {
              const checks = ciModel.checks.read(reader);
              failed = getFailedChecks(checks).length;
              completed = checks.filter((check) => check.status === "completed" /* Completed */).length;
              pending = checks.length - completed;
            }
          }
          if (failed === 0 && comments.length === 0) {
            continue;
          }
          states.push({
            id: id2,
            kind: "pullRequest",
            sessionId: session.sessionId,
            sessionResource: session.resource,
            pullRequest,
            title: livePullRequest?.title ?? pullRequest.title,
            failed,
            completed,
            pending,
            commentIds: comments.map((comment) => comment.id),
            firstCommentId: comments[0]?.id,
            multiplePullRequests: pullRequests.length > 1
          });
        }
      }
      const agentComments = legacyCommentsDismissed ? [] : createdFeedback.filter((item) => item.kind === "codeReview" /* AgentReview */);
      const agentCommentsId = agentCommentsBannerId(session.sessionId);
      if (agentComments.length > 0 && !dismissed.has(agentCommentsId)) {
        states.push({
          id: agentCommentsId,
          kind: "agentComments",
          sessionId: session.sessionId,
          sessionResource: session.resource,
          commentIds: agentComments.map((comment) => comment.id),
          firstCommentId: agentComments[0].id
        });
      }
      return states;
    });
    this.domNode = $(".session-input-banners.empty");
    this._widget = this._register(instantiationService.createInstance(SessionInputBannerWidget, []));
    this.domNode.appendChild(this._widget.domNode);
    this._feedbackChanged = observableSignalFromEvent(this, this.feedbackService.onDidChangeFeedback);
    this._loadDismissedState();
    this._registerStorageListener(STORAGE_KEY_DISMISSED, this._dismissed);
    this._registerStorageListener(LEGACY_STORAGE_KEY_CI_DISMISSED, this._legacyCIDismissed);
    this._registerStorageListener(LEGACY_STORAGE_KEY_COMMENTS_DISMISSED, this._legacyCommentsDismissed);
    this._register(autorun((reader) => {
      const states = this._states.read(reader);
      const banners = states.map((state, index2) => this._toBanner(state, index2, states.length));
      this.domNode.classList.toggle("empty", banners.length === 0);
      this._widget.setBanners(banners);
    }));
    this._register(autorun((reader) => {
      const session = this._session.read(reader);
      if (!session || this._agentMergeEnabled.read(reader)) {
        return;
      }
      const gitHubInfo = session.workspace.read(reader)?.folders[0]?.gitRepository?.gitHubInfo.read(reader);
      for (const pullRequest of getGitHubPullRequestRefs(gitHubInfo)) {
        const prModelRef = reader.store.add(this.gitHubService.createPullRequestModelReference(pullRequest.owner, pullRequest.repo, pullRequest.number));
        const prModel = prModelRef.object;
        void prModel.refresh();
        reader.store.add(prModel.startPolling());
        const livePullRequest = prModel.pullRequest.read(reader);
        if (!livePullRequest || livePullRequest.isDraft || livePullRequest.state !== "open" /* Open */) {
          continue;
        }
        const ciModelRef = reader.store.add(this.gitHubService.createPullRequestCIModelReference(pullRequest.owner, pullRequest.repo, pullRequest.number, livePullRequest.headSha));
        void ciModelRef.object.refresh();
        reader.store.add(ciModelRef.object.startPolling());
      }
    }));
  }
  setActive(active) {
    this._active.set(active, void 0);
  }
  setDebugData(data) {
    this._debugData.set(data, void 0);
  }
  _debugStates(data) {
    const states = [];
    if (data.ciFailed > 0 || data.prFeedback > 0) {
      states.push({
        id: "debug:pullRequest",
        kind: "pullRequest",
        sessionId: "debug",
        sessionResource: URI.from({ scheme: "session-chat-pills-debug", path: "/pull-request" }),
        pullRequest: {
          owner: "microsoft",
          repo: "vscode",
          number: 123,
          uri: URI.parse("https://github.com/microsoft/vscode/pull/123")
        },
        title: localize(5283, null),
        failed: data.ciFailed,
        completed: data.ciFailed,
        pending: data.ciPending,
        commentIds: Array.from({ length: data.prFeedback }, (_, index2) => `debug-pr-${index2}`),
        firstCommentId: data.prFeedback > 0 ? "debug-pr-0" : void 0,
        multiplePullRequests: false,
        debug: true
      });
    }
    if (data.agentFeedback > 0) {
      states.push({
        id: "debug:agentComments",
        kind: "agentComments",
        sessionId: "debug",
        sessionResource: URI.from({ scheme: "session-chat-pills-debug", path: "/agent-comments" }),
        commentIds: Array.from({ length: data.agentFeedback }, (_, index2) => `debug-agent-${index2}`),
        firstCommentId: "debug-agent-0",
        debug: true
      });
    }
    return states;
  }
  _toBanner(state, index2, total) {
    const compact2 = total > 1;
    const text2 = state.kind === "pullRequest" ? this._pullRequestText(state, compact2) : this._commentsText("agent", state.commentIds.length);
    const reference = state.kind === "pullRequest" ? {
      label: `#${state.pullRequest.number}`,
      hover: state.title ? localize(5293, null, state.pullRequest.number, state.title) : localize(5292, null, state.pullRequest.number)
    } : compact2 ? {
      label: localize(5273, null),
      hover: localize(5274, null)
    } : void 0;
    const showReference = state.kind === "pullRequest" ? state.multiplePullRequests : compact2;
    const position2 = compact2 ? localize(5290, null, index2 + 1, total) : void 0;
    const referenceLabel = showReference ? reference?.label : void 0;
    const ariaLabel = position2 && referenceLabel ? localize(5276, null, position2, referenceLabel, text2) : position2 ? localize(5275, null, position2, text2) : referenceLabel ? localize(5277, null, referenceLabel, text2) : text2;
    return {
      id: state.id,
      icon: state.kind === "pullRequest" && state.failed > 0 ? Codicon.warning : Codicon.commentDiscussion,
      accent: state.kind === "pullRequest" && state.failed > 0,
      text: text2,
      ariaLabel,
      reference: showReference ? reference : void 0,
      dismissTooltip: localize(5282, null),
      actions: state.kind === "pullRequest" ? this._pullRequestActions(state) : this._agentCommentActions(state),
      focusAfterDismiss: () => this.chatWidgetService.getWidgetBySessionResource(state.sessionResource)?.focusInput(),
      dismiss: () => {
        if (!state.debug) {
          this._dismiss(state.id);
        }
      }
    };
  }
  _pullRequestText(state, compact2) {
    const checks = state.failed > 0 ? this._checksText(state, compact2) : void 0;
    const comments = state.commentIds.length > 0 ? this._commentsText("pr", state.commentIds.length) : void 0;
    return checks && comments ? localize(5281, null, checks, comments) : checks ?? comments ?? "";
  }
  _checksText(state, compact2) {
    if (compact2) {
      return state.failed === 1 ? localize(5288, null) : localize(5280, null, state.failed);
    }
    const failedText = state.completed === 1 ? localize(5287, null) : localize(5278, null, state.failed, state.completed);
    return state.pending > 0 ? localize(5279, null, failedText, state.pending) : failedText;
  }
  _commentsText(kind, count2) {
    if (kind === "pr") {
      return count2 === 1 ? localize(5289, null) : localize(5291, null, count2);
    }
    return count2 === 1 ? localize(5286, null) : localize(5272, null, count2);
  }
  _pullRequestActions(state) {
    const hasCI = state.failed > 0;
    const hasComments = state.commentIds.length > 0;
    const fixCI = {
      id: "fixCI",
      label: localize(5284, null),
      primary: true,
      waitUntilReady: () => state.debug ? Promise.resolve(true) : this._waitForChatModel(state.sessionResource),
      run: () => state.debug ? void 0 : this._fixChecks(state)
    };
    const addressComments = {
      id: "addressComments",
      label: localize(5271, null),
      primary: true,
      waitUntilReady: () => state.debug ? Promise.resolve(true) : this._waitForChatModel(state.sessionResource),
      run: () => state.debug ? void 0 : this._addressComments(state, this._queryFor(state, "/act-on-feedback"))
    };
    const primary = hasCI && hasComments ? {
      id: "fixCIAndAddressComments",
      label: localize(5285, null),
      primary: true,
      dropdownActions: [fixCI, addressComments],
      waitUntilReady: () => state.debug ? Promise.resolve(true) : this._waitForChatModel(state.sessionResource),
      run: () => state.debug ? void 0 : this._fixCIAndAddressComments(state)
    } : hasCI ? fixCI : addressComments;
    const revealCI = {
      id: "revealCI",
      label: localize(5295, null),
      run: () => {
        if (!state.debug) {
          void this._revealPullRequest(state.pullRequest);
        }
      }
    };
    const revealComments = {
      id: "revealComments",
      label: localize(5296, null),
      run: () => {
        if (!state.debug && state.firstCommentId) {
          this._revealComment(state.sessionResource, state.firstCommentId);
        }
      }
    };
    return hasCI && hasComments ? [primary] : [primary, hasCI ? revealCI : revealComments];
  }
  _agentCommentActions(state) {
    return [{
      id: "addressComments",
      label: localize(5271, null),
      primary: true,
      waitUntilReady: () => state.debug ? Promise.resolve(true) : this._waitForChatModel(state.sessionResource),
      run: () => state.debug ? void 0 : this._addressComments(state, "/act-on-feedback")
    }, {
      id: "revealComments",
      label: localize(5294, null),
      run: () => {
        if (!state.debug && state.firstCommentId) {
          this._revealComment(state.sessionResource, state.firstCommentId);
        }
      }
    }];
  }
  _queryFor(state, query) {
    return state.multiplePullRequests ? `${query} for #${state.pullRequest.number}` : query;
  }
  async _fixChecks(state) {
    const widget = this.chatWidgetService.getWidgetBySessionResource(state.sessionResource);
    if (!widget) {
      this.logService.error("[SessionInputBanners] Cannot fix CI checks: chat model is unavailable", state.sessionResource.toString(), state.pullRequest.number);
      return;
    }
    await this._withCurrentCIModel(state, (ciModel) => submitFixCIChecks(ciModel, widget, this._queryFor(state, "/fix-ci")));
  }
  async _fixCIAndAddressComments(state) {
    await this._withCurrentCIModel(state, async (ciModel) => {
      this._acceptComments(state);
      const prompt = await buildFixCIPrompt(ciModel, this._queryFor(state, "/fix-ci and /act-on-feedback"));
      if (!prompt) {
        this.logService.warn("[SessionInputBanners] CI failures disappeared before the combined request was submitted", state.pullRequest.number);
        await this._submitComments(state, this._queryFor(state, "/act-on-feedback"));
        return;
      }
      const submitted = await this.feedbackService.submitFeedback(state.sessionResource, {
        query: prompt,
        feedbackIds: state.commentIds,
        onRequestAccepted: () => ciModel.markFixRequested()
      });
      if (!submitted) {
        this.logService.error("[SessionInputBanners] Failed to submit combined CI and comments request", state.sessionResource.toString(), state.pullRequest.number);
      }
    });
  }
  async _withCurrentCIModel(state, task) {
    const store = new DisposableStore();
    try {
      const pullRequestRef = store.add(this.gitHubService.createPullRequestModelReference(state.pullRequest.owner, state.pullRequest.repo, state.pullRequest.number));
      const pullRequest = pullRequestRef.object.pullRequest.get();
      if (!pullRequest) {
        this.logService.error("[SessionInputBanners] Cannot act on CI: pull request model is unavailable", state.sessionResource.toString(), state.pullRequest.number);
        return;
      }
      const ciModelRef = store.add(this.gitHubService.createPullRequestCIModelReference(state.pullRequest.owner, state.pullRequest.repo, state.pullRequest.number, pullRequest.headSha));
      await task(ciModelRef.object);
    } finally {
      store.dispose();
    }
  }
  async _addressComments(state, query) {
    this._acceptComments(state);
    await this._submitComments(state, query);
  }
  _acceptComments(state) {
    for (const commentId of state.commentIds) {
      this.feedbackService.acceptFeedback(state.sessionResource, commentId);
    }
  }
  async _submitComments(state, query) {
    const submitted = await this.feedbackService.submitFeedback(state.sessionResource, {
      query,
      feedbackIds: state.commentIds
    });
    if (!submitted) {
      this.logService.error("[SessionInputBanners] Failed to submit comments", state.sessionResource.toString());
    }
  }
  async _waitForChatModel(sessionResource) {
    const widget = await whenChatWidgetForSession(this.chatWidgetService, sessionResource);
    if (widget) {
      return true;
    }
    this.logService.error("[SessionInputBanners] Chat model did not load for session", sessionResource.toString());
    return false;
  }
  async _revealPullRequest(pullRequest) {
    try {
      await this.commandService.executeCommand(OPEN_PULL_REQUEST_ACTION_ID, { pullRequest });
    } catch (err) {
      this.logService.error("[SessionInputBanners] Failed to reveal pull request", pullRequest.number, err);
    }
  }
  _revealComment(sessionResource, commentId) {
    this.feedbackService.revealFeedback(sessionResource, commentId).catch((err) => this.logService.error("[SessionInputBanners] Failed to reveal comment", err));
  }
  _dismiss(id2) {
    const next = new Set(this._dismissed.get());
    next.add(id2);
    this.storageService.store(STORAGE_KEY_DISMISSED, JSON.stringify([...next]), 0 /* PROFILE */, 0 /* USER */);
    this._dismissed.set(next, void 0);
  }
  _loadDismissedState() {
    this._dismissed.set(this._readDismissed(STORAGE_KEY_DISMISSED), void 0);
    this._legacyCIDismissed.set(this._readDismissed(LEGACY_STORAGE_KEY_CI_DISMISSED), void 0);
    this._legacyCommentsDismissed.set(this._readDismissed(LEGACY_STORAGE_KEY_COMMENTS_DISMISSED), void 0);
  }
  _registerStorageListener(storageKey, target) {
    this._register(this.storageService.onDidChangeValue(0 /* PROFILE */, storageKey, this._store)(() => {
      target.set(this._readDismissed(storageKey), void 0);
    }));
  }
  _readDismissed(storageKey) {
    const raw = this.storageService.get(storageKey, 0 /* PROFILE */);
    if (!raw) {
      return /* @__PURE__ */ new Set();
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? new Set(parsed.filter((id2) => typeof id2 === "string")) : /* @__PURE__ */ new Set();
    } catch {
      return /* @__PURE__ */ new Set();
    }
  }
};

SessionInputBanners = __decorateClass([
  __decorateParam(0, ISessionsService),
  __decorateParam(1, ISessionsProvidersService),
  __decorateParam(2, IGitHubService),
  __decorateParam(3, IAgentFeedbackService),
  __decorateParam(4, ICommandService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, ILogService),
  __decorateParam(8, IChatWidgetService)
], SessionInputBanners);
export { pullRequestKey, pullRequestBannerId, agentCommentsBannerId, feedbackForPullRequest, STORAGE_KEY_DISMISSED, LEGACY_STORAGE_KEY_CI_DISMISSED, LEGACY_STORAGE_KEY_COMMENTS_DISMISSED, SessionInputBanners };
