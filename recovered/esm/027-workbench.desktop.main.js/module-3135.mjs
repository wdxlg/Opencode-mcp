// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/github/browser/githubLinkPresentation.contribution.ts
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IGitHubService } from "./module-1801.mjs";
import { ILinkPresentationService } from "./module-0708.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";
import { ILogService } from "./module-0095.mjs";
import { observableValue } from "./module-0048.mjs";
import { autorun } from "./module-0052.mjs";
import { GitHubRequestError } from "./module-1791.mjs";
import { localize } from "./module-0001.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";


// src/vs/workbench/contrib/github/browser/githubLinkPresentation.contribution.ts
var githubRepositoryProviderId = "workbench.github.repositoryLinkPresentation";

var githubIssueProviderId = "workbench.github.issueLinkPresentation";

var githubPullRequestProviderId = "workbench.github.pullRequestLinkPresentation";

var GitHubLinkPresentationContribution = class extends Disposable {
  constructor(gitHubService, _linkPresentationService, _defaultAccountService, logService) {
    super();
    this._linkPresentationService = _linkPresentationService;
    this._defaultAccountService = _defaultAccountService;
    this._registrations = this._register(new MutableDisposable());
    this._provider = this._register(new GitHubLinkPresentationProvider(gitHubService, logService));
    this._register(_defaultAccountService.onDidChangeDefaultAccount(() => this._registerProviders()));
    this._registerProviders();
  }
  static {
    this.ID = "workbench.contrib.githubLinkPresentations";
  }
  _registerProviders() {
    this._registrations.clear();
    const authority = URI.parse(this._defaultAccountService.resolveGitHubUrl("")).authority;
    if (!authority) {
      return;
    }
    const escapedAuthority = escapeRegExpCharacters2(authority);
    const ownerAndRepo = `[^/?#]+/[^/?#]+`;
    const suffix = "(?:[?#].*)?$";
    const registrations = new DisposableStore();
    registrations.add(this._linkPresentationService.registerLinkPresentationProvider({
      id: githubIssueProviderId,
      uriPattern: new RegExp(`^https://${escapedAuthority}/${ownerAndRepo}/issues/[1-9]\\d*${suffix}`),
      kind: "issue"
    }, this._provider));
    registrations.add(this._linkPresentationService.registerLinkPresentationProvider({
      id: githubPullRequestProviderId,
      uriPattern: new RegExp(`^https://${escapedAuthority}/${ownerAndRepo}/pull/[1-9]\\d*${suffix}`),
      kind: "pullRequest"
    }, this._provider));
    registrations.add(this._linkPresentationService.registerLinkPresentationProvider({
      id: githubRepositoryProviderId,
      uriPattern: new RegExp(`^https://${escapedAuthority}/${ownerAndRepo}/?${suffix}`),
      kind: "repository"
    }, this._provider));
    this._registrations.value = registrations;
  }
};

GitHubLinkPresentationContribution = __decorateClass([
  __decorateParam(0, IGitHubService),
  __decorateParam(1, ILinkPresentationService),
  __decorateParam(2, IDefaultAccountService),
  __decorateParam(3, ILogService)
], GitHubLinkPresentationContribution);

var GitHubLinkPresentationProvider = class extends Disposable {
  constructor(_gitHubService, _logService) {
    super();
    this._gitHubService = _gitHubService;
    this._logService = _logService;
    this._hydrator = this._register(new GitHubLinkPresentationHydrator(_gitHubService, _logService));
  }
  createLinkPresentationWatcher(resource) {
    const target = parseGitHubLinkTarget(resource);
    if (!target) {
      throw new Error(`Unsupported GitHub link presentation resource: ${resource.toString(true)}`);
    }
    return new GitHubLinkPresentationWatcher(target, this._gitHubService, this._hydrator, this._logService);
  }
};

var GitHubLinkPresentationHydrator = class extends Disposable {
  constructor(_gitHubService, _logService) {
    super();
    this._gitHubService = _gitHubService;
    this._logService = _logService;
    this._controller = new AbortController();
    this._pending = [];
    this._scheduled = false;
    this._register(toDisposable(() => this._controller.abort()));
  }
  hydrate(target, account) {
    if (target.kind === "pullRequest") {
      return Promise.resolve();
    }
    const resource = target.kind === "repository" ? { kind: "repository", ref: { ...account, owner: target.owner, repo: target.repo } } : { kind: "issue", ref: { ...account, owner: target.owner, repo: target.repo, number: target.number } };
    const promise = new Promise((resolve3, reject) => this._pending.push({ resource, resolve: resolve3, reject }));
    if (!this._scheduled) {
      this._scheduled = true;
      queueMicrotask(() => void this._flush());
    }
    return promise;
  }
  async _flush() {
    this._scheduled = false;
    const pending = this._pending;
    this._pending = [];
    if (pending.length === 0) {
      return;
    }
    const groups = /* @__PURE__ */ new Map();
    for (const item of pending) {
      const key3 = `${item.resource.ref.host.toLowerCase()}\0${item.resource.ref.accountId}`;
      const group2 = groups.get(key3);
      if (group2) {
        group2.push(item);
      } else {
        groups.set(key3, [item]);
      }
    }
    await Promise.all([...groups.values()].map(async (group2) => {
      const resources = [...new Map(group2.map((item) => [
        hydrationResourceKey(item.resource),
        item.resource
      ])).values()];
      try {
        await this._gitHubService.query.hydrateResources(resources, this._controller.signal);
        this._logService.trace(`[GitHubLinkPresentation] Hydrated ${resources.length} resource(s) in one request`);
        for (const item of group2) {
          item.resolve();
        }
      } catch (error) {
        for (const item of group2) {
          item.reject(error);
        }
      }
    }));
  }
  dispose() {
    for (const item of this._pending) {
      item.reject(new Error("GitHub link presentation hydrator was disposed"));
    }
    this._pending = [];
    super.dispose();
  }
};

var GitHubLinkPresentationWatcher = class extends Disposable {
  constructor(_target, _gitHubService, _hydrator, _logService) {
    super();
    this._target = _target;
    this._gitHubService = _gitHubService;
    this._hydrator = _hydrator;
    this._logService = _logService;
    this._presentation = observableValue(this, void 0);
    this.presentation = this._presentation;
    this._activeSubscription = this._register(new MutableDisposable());
    this._generation = 0;
    this._register(_gitHubService.credentials.onDidInvalidate(() => this._initialize()));
    this._initialize();
  }
  _initialize() {
    const generation = ++this._generation;
    const target = this._target;
    const store = new DisposableStore();
    const controller = new AbortController();
    store.add(toDisposable(() => controller.abort()));
    this._activeSubscription.value = store;
    void this._initializeSubscription(target, generation, controller, store);
  }
  async _initializeSubscription(target, generation, controller, store) {
    try {
      const credential = await this._gitHubService.credentials.getCredential(controller.signal);
      if (controller.signal.aborted || generation !== this._generation) {
        return;
      }
      const account = credential.account;
      void this._hydrator.hydrate(target, account).catch((error) => {
        this._logService.trace(`[GitHubLinkPresentation] Bulk hydration failed for ${formatTarget(target)}; falling back to resource fetch`, error);
      });
      switch (target.kind) {
        case "repository": {
          const subscription = store.add(this._gitHubService.query.subscribeRepository({
            ...account,
            owner: target.owner,
            repo: target.repo
          }, { priority: "visible" }));
          store.add(autorun((reader) => this._presentation.set(
            repositoryPresentation(target, subscription.resource.state.read(reader)),
            void 0
          )));
          break;
        }
        case "issue": {
          const ref = { ...account, owner: target.owner, repo: target.repo, number: target.number };
          const subscription = store.add(this._gitHubService.query.subscribeIssue(ref, { priority: "visible" }));
          store.add(autorun((reader) => this._presentation.set(
            issuePresentation(target, subscription.resource.state.read(reader)),
            void 0
          )));
          break;
        }
        case "pullRequest": {
          const ref = { ...account, owner: target.owner, repo: target.repo, number: target.number };
          const subscription = store.add(this._gitHubService.pullRequests.subscribePullRequest(ref, {
            priority: "visible",
            core: true,
            checks: { includeOptional: true }
          }));
          store.add(autorun((reader) => this._presentation.set(
            pullRequestPresentation(target, subscription.resource.snapshot.read(reader)),
            void 0
          )));
          break;
        }
      }
    } catch (error) {
      if (controller.signal.aborted || generation !== this._generation) {
        return;
      }
      this._logService.trace(`[GitHubLinkPresentation] Failed to resolve ${formatTarget(this._target)}`, error);
      this._presentation.set(failurePresentation(this._target.kind, error instanceof GitHubRequestError ? error.kind : void 0), void 0);
    }
  }
};

function repositoryPresentation(target, state) {
  if (!state.value) {
    return state.status === "error" ? failurePresentation(target.kind, state.error?.kind) : void 0;
  }
  const details = [
    state.value.language,
    state.value.stars === void 0 ? void 0 : localize(16105, null, formatCount(state.value.stars))
  ].filter((value2) => !!value2);
  return {
    kind: "repository",
    detail: details.length ? details.join(" \xB7 ") : void 0,
    tooltip: `${target.owner}/${target.repo}`,
    ariaLabel: localize(16104, null, target.owner, target.repo),
    ...state.status !== "ready" ? { isLoading: true } : {}
  };
}

function issuePresentation(target, state) {
  if (!state.value) {
    return state.status === "error" ? failurePresentation(target.kind, state.error?.kind) : void 0;
  }
  const status2 = issueStatus(state.value);
  return {
    kind: "issue",
    title: state.value.title,
    reference: `#${target.number}`,
    status: status2,
    tooltip: `${target.owner}/${target.repo}#${target.number} \xB7 ${status2.label}`,
    ariaLabel: localize(16101, null, target.owner, target.repo, target.number, status2.label, state.value.title),
    ...state.status !== "ready" ? { isLoading: true } : {}
  };
}

function pullRequestPresentation(target, snapshot) {
  const core2 = snapshot.core;
  if (!core2.value) {
    return core2.status === "error" ? failurePresentation(target.kind, core2.error?.kind) : void 0;
  }
  const status2 = pullRequestStatus(core2.value);
  const checksStatus = status2.kind === "open" || status2.kind === "draft" ? pullRequestChecksStatus(snapshot.checks.value?.checks) : void 0;
  return {
    kind: "pullRequest",
    title: core2.value.title,
    reference: `#${target.number}`,
    status: status2,
    secondaryStatus: checksStatus,
    tooltip: [target.owner + "/" + target.repo + "#" + target.number, status2.label, checksStatus?.label].filter(Boolean).join(" \xB7 "),
    ariaLabel: checksStatus ? localize(16103, null, target.owner, target.repo, target.number, status2.label, checksStatus.label, core2.value.title) : localize(16102, null, target.owner, target.repo, target.number, status2.label, core2.value.title),
    ...core2.status !== "ready" ? { isLoading: true } : {}
  };
}

function issueStatus(issue) {
  if (issue.state === "open") {
    return { kind: "open", label: localize(16110, null) };
  }
  return issue.stateReason === "not_planned" ? { kind: "notPlanned", label: localize(16109, null) } : { kind: "closed", label: localize(16106, null) };
}

function pullRequestStatus(pullRequest) {
  if (pullRequest.state === "merged") {
    return { kind: "merged", label: localize(16108, null) };
  }
  if (pullRequest.draft) {
    return { kind: "draft", label: localize(16107, null) };
  }
  return pullRequest.state === "closed" ? { kind: "closed", label: localize(16106, null) } : { kind: "open", label: localize(16110, null) };
}

function pullRequestChecksStatus(checks) {
  if (!checks?.length) {
    return void 0;
  }
  if (checks.some((check) => check.type === "checkRun" ? check.status !== "COMPLETED" : check.status === "PENDING" || check.status === "EXPECTED")) {
    return { kind: "pending", label: localize(16093, null) };
  }
  if (checks.some((check) => check.type === "checkRun" ? check.conclusion === "FAILURE" || check.conclusion === "TIMED_OUT" || check.conclusion === "CANCELLED" || check.conclusion === "ACTION_REQUIRED" || check.conclusion === "STARTUP_FAILURE" : check.status === "FAILURE" || check.status === "ERROR")) {
    return { kind: "error", label: localize(16091, null) };
  }
  return { kind: "success", label: localize(16092, null) };
}

function failurePresentation(kind, errorKind) {
  const label3 = errorKind === "rateLimit" ? localize(16098, null) : errorKind === "authentication" ? localize(16096, null) : errorKind === "authorization" ? localize(16094, null) : errorKind === "notFound" ? localize(16097, null) : localize(16100, null);
  return {
    kind,
    status: { kind: "error", label: label3 },
    tooltip: localize(16099, null, label3),
    ariaLabel: localize(16095, null, kind, label3)
  };
}

function parseGitHubLinkTarget(resource) {
  if (resource.scheme !== "https") {
    return void 0;
  }
  const segments = resource.path.split("/").filter(Boolean);
  if (segments.length === 2) {
    return { kind: "repository", owner: segments[0], repo: segments[1] };
  }
  if (segments.length !== 4) {
    return void 0;
  }
  const number = Number(segments[3]);
  if (!Number.isSafeInteger(number) || number <= 0) {
    return void 0;
  }
  if (segments[2] === "issues") {
    return { kind: "issue", owner: segments[0], repo: segments[1], number };
  }
  if (segments[2] === "pull") {
    return { kind: "pullRequest", owner: segments[0], repo: segments[1], number };
  }
  return void 0;
}

function formatTarget(target) {
  return target.kind === "repository" ? `${target.owner}/${target.repo}` : `${target.owner}/${target.repo}#${target.number}`;
}

function hydrationResourceKey(resource) {
  const suffix = resource.kind === "issue" ? `#${resource.ref.number}` : "";
  return `${resource.kind}:${resource.ref.owner.toLowerCase()}/${resource.ref.repo.toLowerCase()}${suffix}`;
}

function formatCount(value2) {
  return value2 >= 1e3 ? `${(value2 / 1e3).toFixed(value2 >= 1e4 ? 0 : 1)}k` : String(value2);
}

function escapeRegExpCharacters2(value2) {
  return value2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

registerWorkbenchContribution2(GitHubLinkPresentationContribution.ID, GitHubLinkPresentationContribution, WorkbenchPhase.AfterRestored);
export { repositoryPresentation, issuePresentation, pullRequestPresentation, issueStatus, pullRequestStatus, pullRequestChecksStatus, failurePresentation, parseGitHubLinkTarget, formatTarget, hydrationResourceKey, formatCount, escapeRegExpCharacters2, githubRepositoryProviderId, githubIssueProviderId, githubPullRequestProviderId, GitHubLinkPresentationContribution, GitHubLinkPresentationProvider, GitHubLinkPresentationHydrator, GitHubLinkPresentationWatcher };
