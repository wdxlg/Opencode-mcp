// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/github/common/pullRequestResourceService.ts
import { GitHubRequestError } from "./module-1791.mjs";
import { observableValue } from "./module-0048.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { Disposable } from "./module-0012.mjs";
import { systemGitHubScheduler } from "./module-1787.mjs";
import { PullRequestScheduler } from "./module-1794.mjs";
import { pullRequestOptionsForFragment, unionPullRequestInterests } from "./module-1799.mjs";
import { raceCancellationError } from "./module-0036.mjs";
import { gitHubBackoffDelay } from "./module-1788.mjs";


// src/vs/platform/github/common/pullRequestResourceService.ts
function formatPullRequestRef(ref) {
  return `${ref.host}/${ref.owner}/${ref.repo}#${ref.number}`;
}

function resourceErrorKind(error) {
  if (error instanceof GitHubRequestError) {
    return `${error.kind}${error.statusCode === void 0 ? "" : `:${error.statusCode}`}`;
  }
  return error instanceof Error ? error.name : typeof error;
}

function dataInterestExpanded(left, right) {
  return !left.includeBodies && right.includeBodies === true || !left.requiredChecks && right.requiredChecks === true || !left.includeOptionalChecks && right.includeOptionalChecks === true;
}

var defaultPollingPolicy2 = {
  dormantGrace: 12e4,
  fragmentBodyGrace: 3e4,
  maximumDormantEntries: 50,
  coreVisible: 6e4,
  coreBackground: 3e5,
  conversationVisible: 6e4,
  conversationBackground: 3e5,
  checksPendingVisible: 15e3,
  checksPendingBackground: 6e4,
  checksBackstop: 3e5,
  mergeabilityVisible: 3e4,
  mergeabilityBackground: 12e4,
  participants: 3e5,
  failureBackoff: { immediateRetries: 0, base: 3e4, maximum: 3e5, jitter: 5e3 },
  jitter: 5e3
};

var fragments = [
  "core",
  "topLevelComments",
  "submittedReviews",
  "inlineComments",
  "reviewThreads",
  "checks",
  "mergeability",
  "participants"
];

var PullRequestResourceImpl = class {
  constructor(_entry) {
    this._entry = _entry;
  }
  get ref() {
    return this._entry.ref;
  }
  get snapshot() {
    return this._entry.snapshot;
  }
};

var PullRequestEntry = class {
  constructor(id2, ref) {
    this.id = id2;
    this.resource = new PullRequestResourceImpl(this);
    this.subscriptions = /* @__PURE__ */ new Set();
    this.fragmentGenerations = /* @__PURE__ */ new Map();
    this.operations = /* @__PURE__ */ new Map();
    this.failureCounts = /* @__PURE__ */ new Map();
    this.keys = /* @__PURE__ */ new Set();
    this.mirrors = /* @__PURE__ */ new Set();
    this.effective = /* @__PURE__ */ new Map();
    this.generation = 1;
    this.headGeneration = 0;
    this.disposed = false;
    this.ref = ref;
    this.snapshot = observableValue(this, initialSnapshot(ref));
    for (const fragment of fragments) {
      this.fragmentGenerations.set(fragment, 0);
    }
  }
};

var PullRequestSubscriptionImpl = class {
  constructor(resource, entry, _service, options3) {
    this.resource = resource;
    this._service = _service;
    this._disposed = false;
    this.entry = entry;
    this.options = options3;
  }
  update(options3) {
    if (this._disposed) {
      throw new Error("Pull request subscription has been disposed");
    }
    this._service.updateSubscription(this, options3);
  }
  refresh(fragment, token = CancellationToken.None, options3) {
    if (this._disposed) {
      return Promise.reject(new Error("Pull request subscription has been disposed"));
    }
    return this._service.refreshSubscription(this, fragment, token, options3);
  }
  dispose() {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    this._service.removeSubscription(this);
  }
};

var PullRequestResourceService = class extends Disposable {
  constructor(scheduler = systemGitHubScheduler, _policy = defaultPollingPolicy2, _credentials, _queries, _logService) {
    super();
    this._policy = _policy;
    this._credentials = _credentials;
    this._queries = _queries;
    this._logService = _logService;
    this._entriesByKey = /* @__PURE__ */ new Map();
    this._entries = /* @__PURE__ */ new Set();
    this._dormant = /* @__PURE__ */ new Map();
    this._entryId = 0;
    this._scheduler = this._register(new PullRequestScheduler(scheduler));
    this._clock = scheduler;
    this._register(this._credentials.onDidInvalidate((event) => this._handleCredentialInvalidation(event)));
  }
  subscribePullRequest(ref, options3) {
    const normalized = normalizeRef(ref);
    const initialKey = pullRequestKey(normalized);
    let entry = this._entriesByKey.get(initialKey);
    if (!entry) {
      entry = new PullRequestEntry(this._entryId++, normalized);
      entry.keys.add(initialKey);
      this._entriesByKey.set(initialKey, entry);
      this._entries.add(entry);
      this._logService.debug(`[PullRequestResourceService] Created resource ${formatPullRequestRef(normalized)} (entry ${entry.id})`);
    } else if (entry.dormantAt !== void 0) {
      entry.dormantAt = void 0;
      this._dormant.delete(entry.id);
      this._scheduler.cancel(this._dormantTaskKey(entry));
      this._logService.trace(`[PullRequestResourceService] Resumed resource ${formatPullRequestRef(entry.ref)} (entry ${entry.id})`);
    }
    const subscription = new PullRequestSubscriptionImpl(entry.resource, entry, this, options3);
    entry.subscriptions.add(subscription);
    this._logService.trace(`[PullRequestResourceService] Added subscription for ${formatPullRequestRef(entry.ref)} (entry ${entry.id}, subscriptions: ${entry.subscriptions.size})`);
    this._updateEffectiveInterests(entry);
    return subscription;
  }
  invalidatePullRequest(ref, invalidatedFragments) {
    const entry = this._entriesByKey.get(pullRequestKey(normalizeRef(ref)));
    if (!entry) {
      return;
    }
    for (const fragment of invalidatedFragments) {
      this._cancelFragment(entry, fragment);
      const current = fragmentState(entry.snapshot.get(), fragment);
      this._setFragmentState(entry, fragment, {
        ...current,
        status: current.value ? "stale" : "missing",
        complete: false,
        error: void 0
      });
      if (entry.subscriptions.size > 0 && entry.effective.has(fragment)) {
        this._scheduleFragment(entry, fragment, this._clock.now());
      }
    }
  }
  updateSubscription(subscription, options3) {
    if (!subscription.entry.subscriptions.has(subscription)) {
      throw new Error("Pull request subscription is no longer active");
    }
    subscription.options = options3;
    this._updateEffectiveInterests(subscription.entry);
  }
  async refreshSubscription(subscription, fragment, token, options3) {
    if (!subscription.entry.subscriptions.has(subscription)) {
      throw new Error("Pull request subscription is no longer active");
    }
    if (fragment) {
      if (!subscription.entry.effective.has(fragment)) {
        throw new Error(`Pull request fragment ${fragment} is not part of the subscription interests`);
      }
      await this._refreshFragment(subscription.entry, fragment, token, options3?.authoritative === true);
      return;
    }
    await this._refreshFragment(subscription.entry, "core", token, options3?.authoritative === true);
    const entry = subscription.entry;
    await Promise.all([...entry.effective.keys()].filter((candidate) => candidate !== "core").map((candidate) => this._refreshFragment(entry, candidate, token, options3?.authoritative === true)));
  }
  removeSubscription(subscription) {
    const entry = subscription.entry;
    if (!entry.subscriptions.delete(subscription)) {
      return;
    }
    if (entry.subscriptions.size > 0) {
      this._updateEffectiveInterests(entry);
      return;
    }
    entry.effective = /* @__PURE__ */ new Map();
    entry.dormantAt = this._clock.now();
    this._logService.trace(`[PullRequestResourceService] Resource ${formatPullRequestRef(entry.ref)} became dormant (entry ${entry.id})`);
    this._cancelEntryWork(entry);
    this._dormant.set(entry.id, entry);
    this._scheduler.schedule(this._dormantTaskKey(entry), this._clock.now() + this._policy.dormantGrace, () => {
      if (entry.dormantAt !== void 0) {
        this._disposeEntry(entry);
      }
    });
    this._trimDormantEntries();
  }
  clear() {
    for (const entry of [...this._entries]) {
      this._disposeEntry(entry);
    }
    this._scheduler.clear();
    this._entriesByKey.clear();
    this._entries.clear();
    this._dormant.clear();
  }
  dispose() {
    this.clear();
    super.dispose();
  }
  _updateEffectiveInterests(entry) {
    const previous = entry.effective;
    const next = new Map(unionPullRequestInterests([...entry.subscriptions].map((subscription) => subscription.options)));
    entry.effective = next;
    for (const fragment of fragments) {
      const oldInterest = previous.get(fragment);
      const newInterest = next.get(fragment);
      if (!newInterest) {
        if (oldInterest) {
          this._cancelFragment(entry, fragment);
        }
        continue;
      }
      if (!oldInterest) {
        this._scheduleFragment(entry, fragment, this._clock.now());
        continue;
      }
      if (!sameInterest(oldInterest, newInterest)) {
        if (dataInterestExpanded(oldInterest, newInterest)) {
          this._cancelFragment(entry, fragment);
          this._scheduleFragment(entry, fragment, this._clock.now());
          continue;
        }
        if (oldInterest.includeBodies && !newInterest.includeBodies && isConversationFragment(fragment)) {
          this._scheduleBodyRelease(entry, fragment);
        } else {
          this._scheduler.cancel(this._bodyTaskKey(entry, fragment));
        }
        if (oldInterest.priority !== newInterest.priority) {
          this._scheduleNext(entry, fragment, newInterest);
        }
      }
    }
  }
  async _refreshFragment(entry, fragment, token, authoritative = false) {
    entry = this._resolveEntry(entry);
    if (entry.disposed || entry.subscriptions.size === 0 || !entry.effective.has(fragment)) {
      return;
    }
    this._scheduler.cancel(this._fragmentTaskKey(entry, fragment));
    const existing = entry.operations.get(fragment);
    if (existing) {
      const interest2 = entry.effective.get(fragment);
      if (!authoritative && (!interest2 || !dataInterestExpanded(existing.interest, interest2))) {
        await raceCancellationError(existing.promise, token);
        return;
      }
      this._cancelFragment(entry, fragment);
    }
    if (fragment !== "core" && entry.snapshot.get().core.status !== "ready") {
      await this._refreshFragment(entry, "core", token, authoritative);
      entry = this._resolveEntry(entry);
      if (entry.snapshot.get().core.status !== "ready") {
        return;
      }
    }
    const interest = entry.effective.get(fragment);
    if (!interest) {
      return;
    }
    const fragmentGeneration = (entry.fragmentGenerations.get(fragment) ?? 0) + 1;
    entry.fragmentGenerations.set(fragment, fragmentGeneration);
    const controller = new AbortController();
    const entryGeneration = entry.generation;
    const headAtStart = isHeadFragment(fragment) ? entry.snapshot.get().core.value?.headSha : void 0;
    this._setLoading(entry, fragment);
    const operation = {
      controller,
      generation: fragmentGeneration,
      interest,
      promise: this._runFragmentFetch(
        entry,
        fragment,
        interest,
        entryGeneration,
        fragmentGeneration,
        headAtStart,
        controller
      ).finally(() => {
        if (entry.operations.get(fragment) === operation) {
          entry.operations.delete(fragment);
        }
      })
    };
    entry.operations.set(fragment, operation);
    await raceCancellationError(operation.promise, token);
  }
  async _runFragmentFetch(entry, fragment, interest, entryGeneration, fragmentGeneration, headAtStart, controller) {
    let credential;
    const startedAt = this._clock.now();
    this._logService.trace(`[PullRequestResourceService] Refreshing ${fragment} for ${formatPullRequestRef(entry.ref)} (entry ${entry.id}, generation ${entryGeneration})`);
    try {
      credential = await this._credentials.getCredential(controller.signal);
      if (!sameAccount4(credential.account, entry.ref)) {
        throw new GitHubRequestError("Pull request resource account does not match the current GitHub credential", "authentication");
      }
      const result = await this._queries.fetch(
        fragment,
        entry.ref,
        entry.snapshot.get().core.value,
        pullRequestOptionsForFragment(fragment, interest),
        credential,
        AbortSignal.any([controller.signal, credential.signal])
      );
      if (!this._canCommit(entry, fragment, entryGeneration, fragmentGeneration, credential, headAtStart)) {
        if (!controller.signal.aborted && this._isFragmentActive(entry, fragment)) {
          this._scheduleFragment(entry, fragment, this._clock.now());
        }
        return;
      }
      const committedEntry = this._commitResult(entry, result);
      this._logService.trace(`[PullRequestResourceService] Refreshed ${fragment} for ${formatPullRequestRef(committedEntry.ref)} in ${this._clock.now() - startedAt}ms (entry ${committedEntry.id}, generation ${committedEntry.generation})`);
      committedEntry.failureCounts.delete(fragment);
      this._scheduleNext(committedEntry, fragment, committedEntry.effective.get(fragment) ?? interest);
    } catch (error) {
      if (credential && sameAccount4(credential.account, entry.ref)) {
        this._credentials.handleRequestError(credential, error);
      }
      const canCommit = this._canCommit(entry, fragment, entryGeneration, fragmentGeneration, credential, headAtStart);
      if (canCommit) {
        this._setError(entry, fragment, error);
      }
      this._logService.debug(`[PullRequestResourceService] Refresh ${fragment} for ${formatPullRequestRef(entry.ref)} ${controller.signal.aborted ? "cancelled" : "failed"} after ${this._clock.now() - startedAt}ms (${resourceErrorKind(error)})`);
      if (canCommit && !controller.signal.aborted && this._isFragmentActive(entry, fragment)) {
        this._scheduleAfterFailure(entry, fragment, interest, error);
      } else if (credential?.signal.aborted && !controller.signal.aborted && this._isFragmentActive(entry, fragment)) {
        this._scheduleFragment(entry, fragment, this._clock.now());
      }
      throw error;
    }
  }
  _canCommit(entry, fragment, entryGeneration, fragmentGeneration, credential, headAtStart) {
    if (entry.disposed || entry.generation !== entryGeneration || entry.fragmentGenerations.get(fragment) !== fragmentGeneration || credential?.signal.aborted) {
      return false;
    }
    return !isHeadFragment(fragment) || entry.snapshot.get().core.value?.headSha === headAtStart;
  }
  _commitResult(entry, result) {
    const observedAt = toTimestamp(this._clock.now());
    if (result.fragment === "core") {
      entry = this._canonicalizeEntry(entry, result.value);
      const previousHead = entry.snapshot.get().core.value?.headSha;
      if (previousHead !== result.value.headSha) {
        entry.headGeneration++;
      }
      if (previousHead && previousHead !== result.value.headSha) {
        this._invalidateHeadFragments(entry);
      }
      this._setFragmentState(entry, "core", {
        value: result.value,
        status: "ready",
        complete: true,
        observedAt,
        attemptedAt: observedAt
      });
      if (result.value.state !== "open") {
        for (const fragment of entry.effective.keys()) {
          this._scheduler.cancel(this._fragmentTaskKey(entry, fragment));
          if (fragment !== "core") {
            this._scheduleFragment(entry, fragment, this._clock.now());
          }
        }
      }
      return entry;
    }
    switch (result.fragment) {
      case "topLevelComments":
        this._setFragmentState(entry, result.fragment, readyState(result.value, result.complete, observedAt));
        break;
      case "submittedReviews":
        this._setFragmentState(entry, result.fragment, readyState(result.value, result.complete, observedAt));
        break;
      case "inlineComments":
        this._setFragmentState(entry, result.fragment, readyState(result.value, result.complete, observedAt));
        break;
      case "reviewThreads":
        this._setFragmentState(entry, result.fragment, readyState(result.value, result.complete, observedAt, result.headSha));
        break;
      case "checks":
        this._setFragmentState(entry, result.fragment, readyState(result.value, result.complete, observedAt, result.headSha));
        break;
      case "mergeability":
        this._setFragmentState(entry, result.fragment, readyState(result.value, result.complete, observedAt, result.headSha));
        break;
      case "participants":
        this._setFragmentState(entry, result.fragment, readyState(result.value, result.complete, observedAt));
        break;
    }
    return entry;
  }
  _invalidateHeadFragments(entry) {
    for (const fragment of ["reviewThreads", "checks", "mergeability"]) {
      this._cancelFragment(entry, fragment);
      const current = fragmentState(entry.snapshot.get(), fragment);
      this._setFragmentState(entry, fragment, {
        ...current,
        status: current.value ? "stale" : "missing",
        complete: false,
        headSha: void 0,
        error: void 0
      });
      if (entry.effective.has(fragment)) {
        this._scheduleFragment(entry, fragment, this._clock.now());
      }
    }
  }
  _setLoading(entry, fragment) {
    const current = fragmentState(entry.snapshot.get(), fragment);
    this._setFragmentState(entry, fragment, {
      ...current,
      status: "loading",
      complete: false,
      attemptedAt: toTimestamp(this._clock.now()),
      error: void 0
    });
  }
  _setError(entry, fragment, error) {
    const current = fragmentState(entry.snapshot.get(), fragment);
    this._setFragmentState(entry, fragment, {
      ...current,
      status: "error",
      complete: false,
      attemptedAt: toTimestamp(this._clock.now()),
      error: toFragmentError3(error)
    });
  }
  _setFragmentState(entry, fragment, state) {
    this._publishSnapshot(entry, {
      ...withFragmentState(entry.snapshot.get(), fragment, state),
      generation: entry.generation,
      headGeneration: entry.headGeneration
    });
  }
  _cancelFragment(entry, fragment) {
    this._scheduler.cancel(this._fragmentTaskKey(entry, fragment));
    this._scheduler.cancel(this._bodyTaskKey(entry, fragment));
    entry.fragmentGenerations.set(fragment, (entry.fragmentGenerations.get(fragment) ?? 0) + 1);
    entry.operations.get(fragment)?.controller.abort(new Error(`Pull request fragment ${fragment} is no longer active`));
    entry.operations.delete(fragment);
    const current = fragmentState(entry.snapshot.get(), fragment);
    if (current.status === "loading") {
      this._setFragmentState(entry, fragment, {
        ...current,
        status: current.value ? "stale" : "missing",
        complete: false
      });
    }
  }
  _cancelEntryWork(entry) {
    this._scheduler.cancelPrefix(`${entry.id}\0`);
    for (const fragment of fragments) {
      this._cancelFragment(entry, fragment);
    }
  }
  _scheduleFragment(entry, fragment, dueAt) {
    if (entry.disposed || entry.subscriptions.size === 0 || !entry.effective.has(fragment)) {
      return;
    }
    this._scheduler.schedule(this._fragmentTaskKey(entry, fragment), dueAt, () => {
      void this._refreshFragment(entry, fragment, CancellationToken.None).catch((error) => {
        if (!entry.disposed && entry.subscriptions.size > 0) {
          this._logService.warn(`[PullRequestResourceService] Failed to refresh ${fragment} for ${entry.ref.owner}/${entry.ref.repo}#${entry.ref.number}`, error);
        }
      });
    });
  }
  _scheduleNext(entry, fragment, interest) {
    const delay = this._pollDelay(entry, fragment, interest);
    if (delay === void 0) {
      return;
    }
    this._scheduleFragment(entry, fragment, this._clock.now() + delay + this._clock.jitter(this._policy.jitter));
  }
  _scheduleAfterFailure(entry, fragment, interest, error) {
    if (entry.snapshot.get().core.value?.state && entry.snapshot.get().core.value?.state !== "open") {
      return;
    }
    if (error instanceof GitHubRequestError && error.kind === "authentication") {
      return;
    }
    if (error instanceof GitHubRequestError && (error.kind === "notFound" || error.kind === "validation" || error.kind === "schema" || error.kind === "rateLimit")) {
      this._scheduleNext(entry, fragment, interest);
      return;
    }
    const failures = (entry.failureCounts.get(fragment) ?? 0) + 1;
    entry.failureCounts.set(fragment, failures);
    this._scheduleFragment(entry, fragment, this._clock.now() + gitHubBackoffDelay(this._policy.failureBackoff, this._clock, failures));
  }
  _pollDelay(entry, fragment, interest) {
    if (entry.snapshot.get().core.value?.state !== "open") {
      return void 0;
    }
    const visible = interest.priority !== "background";
    switch (fragment) {
      case "core":
        return visible ? this._policy.coreVisible : this._policy.coreBackground;
      case "topLevelComments":
      case "submittedReviews":
      case "inlineComments":
      case "reviewThreads":
        return visible ? this._policy.conversationVisible : this._policy.conversationBackground;
      case "checks": {
        const checks = entry.snapshot.get().checks;
        return checks.status !== "error" && checksPending(checks.value) ? visible ? this._policy.checksPendingVisible : this._policy.checksPendingBackground : this._policy.checksBackstop;
      }
      case "mergeability":
        return visible ? this._policy.mergeabilityVisible : this._policy.mergeabilityBackground;
      case "participants":
        return this._policy.participants;
    }
  }
  _scheduleBodyRelease(entry, fragment) {
    this._scheduler.schedule(this._bodyTaskKey(entry, fragment), this._clock.now() + this._policy.fragmentBodyGrace, () => {
      if (entry.effective.get(fragment)?.includeBodies !== true) {
        this._releaseBodies(entry, fragment);
      }
    });
  }
  _releaseBodies(entry, fragment) {
    const snapshot = entry.snapshot.get();
    switch (fragment) {
      case "topLevelComments":
        if (snapshot.topLevelComments.value) {
          this._setFragmentState(entry, fragment, { ...snapshot.topLevelComments, value: snapshot.topLevelComments.value.map(({ body, ...comment }) => comment) });
        }
        break;
      case "submittedReviews":
        if (snapshot.submittedReviews.value) {
          this._setFragmentState(entry, fragment, { ...snapshot.submittedReviews, value: snapshot.submittedReviews.value.map(({ body, ...review }) => review) });
        }
        break;
      case "inlineComments":
        if (snapshot.inlineComments.value) {
          this._setFragmentState(entry, fragment, { ...snapshot.inlineComments, value: snapshot.inlineComments.value.map(({ body, ...comment }) => comment) });
        }
        break;
      case "reviewThreads":
        if (snapshot.reviewThreads.value) {
          this._setFragmentState(entry, fragment, {
            ...snapshot.reviewThreads,
            value: snapshot.reviewThreads.value.map((thread) => ({
              ...thread,
              comments: thread.comments.map(({ body, ...comment }) => comment)
            }))
          });
        }
        break;
    }
  }
  _canonicalizeEntry(entry, core2) {
    const [owner, repo, extra] = core2.repositoryNameWithOwner.split("/");
    if (!owner || !repo || extra) {
      return entry;
    }
    const canonicalRef = { ...entry.ref, owner, repo };
    const aliases = [
      pullRequestKey(canonicalRef),
      core2.repositoryId ? stablePullRequestKey(canonicalRef, core2.repositoryId) : void 0
    ].filter((key3) => key3 !== void 0);
    let target = entry;
    let merged = false;
    for (const key3 of aliases) {
      const existing = this._entriesByKey.get(key3);
      if (!existing || existing === target) {
        continue;
      }
      if (target === entry) {
        target = existing;
        this._mergeEntry(entry, target);
      } else {
        this._mergeEntry(existing, target);
      }
      merged = true;
    }
    entry = target;
    const refChanged = entry.ref.owner !== owner || entry.ref.repo !== repo;
    let aliasAdded = false;
    entry.ref = canonicalRef;
    for (const key3 of aliases) {
      const existing = this._entriesByKey.get(key3);
      if (!existing || existing === entry) {
        aliasAdded ||= !entry.keys.has(key3);
        this._entriesByKey.set(key3, entry);
        entry.keys.add(key3);
      }
    }
    if (merged) {
      this._logService.debug(`[PullRequestResourceService] Converged canonical resource ${formatPullRequestRef(canonicalRef)} onto entry ${entry.id}`);
      this._updateEffectiveInterests(entry);
    }
    if (refChanged || aliasAdded || merged) {
      this._logService.debug(`[PullRequestResourceService] Canonicalized ${formatPullRequestRef(entry.ref)} (entry ${entry.id}, aliases: ${entry.keys.size})`);
      entry.generation++;
      for (const fragment of entry.effective.keys()) {
        if (fragment !== "core") {
          this._scheduleFragment(entry, fragment, this._clock.now());
        }
      }
    }
    const snapshot = entry.snapshot.get();
    this._publishSnapshot(entry, { ...snapshot, ref: entry.ref, generation: entry.generation, headGeneration: entry.headGeneration });
    return entry;
  }
  _mergeEntry(source, target) {
    const sourceSnapshot = source.snapshot.get();
    source.disposed = true;
    source.mergedInto = target;
    source.generation++;
    this._cancelEntryWork(source);
    for (const subscription of source.subscriptions) {
      subscription.entry = target;
      target.subscriptions.add(subscription);
    }
    source.subscriptions.clear();
    for (const key3 of source.keys) {
      this._entriesByKey.set(key3, target);
      target.keys.add(key3);
    }
    source.keys.clear();
    target.mirrors.add(source);
    for (const mirror of source.mirrors) {
      target.mirrors.add(mirror);
    }
    source.mirrors.clear();
    this._publishSnapshot(target, mergeSnapshotValues(target.snapshot.get(), sourceSnapshot));
    this._dormant.delete(source.id);
    this._entries.delete(source);
    if (target.dormantAt !== void 0 && target.subscriptions.size > 0) {
      target.dormantAt = void 0;
      this._dormant.delete(target.id);
      this._scheduler.cancel(this._dormantTaskKey(target));
    }
  }
  _resolveEntry(entry) {
    while (entry.mergedInto) {
      entry = entry.mergedInto;
    }
    return entry;
  }
  _publishSnapshot(entry, snapshot) {
    entry.snapshot.set(snapshot, void 0);
    for (const mirror of entry.mirrors) {
      mirror.ref = entry.ref;
      mirror.snapshot.set(snapshot, void 0);
    }
  }
  _handleCredentialInvalidation(event) {
    this._logService.debug(`[PullRequestResourceService] Handling credential invalidation (${event.reason}) for ${this._entries.size} resource(s)`);
    for (const entry of [...this._entries]) {
      if (!event.credential || sameAccount4(event.credential.account, entry.ref)) {
        if (event.reason === "replacement" || event.reason === "authentication") {
          for (const fragment of fragments) {
            const current = fragmentState(entry.snapshot.get(), fragment);
            this._setFragmentState(entry, fragment, {
              ...current,
              status: current.value ? "stale" : "missing",
              complete: false,
              error: void 0
            });
            if (entry.subscriptions.size > 0 && entry.effective.has(fragment)) {
              this._scheduleFragment(entry, fragment, this._clock.now());
            }
          }
        } else {
          this._disposeEntry(entry);
        }
      }
    }
  }
  _disposeEntry(entry) {
    if (entry.disposed) {
      return;
    }
    entry.disposed = true;
    this._logService.trace(`[PullRequestResourceService] Disposing resource ${formatPullRequestRef(entry.ref)} (entry ${entry.id})`);
    entry.generation++;
    this._cancelEntryWork(entry);
    for (const subscription of [...entry.subscriptions]) {
      entry.subscriptions.delete(subscription);
    }
    for (const key3 of entry.keys) {
      if (this._entriesByKey.get(key3) === entry) {
        this._entriesByKey.delete(key3);
      }
    }
    this._dormant.delete(entry.id);
    this._entries.delete(entry);
    entry.mirrors.clear();
  }
  _trimDormantEntries() {
    while (this._dormant.size > this._policy.maximumDormantEntries) {
      const oldest = [...this._dormant.values()].sort((left, right) => (left.dormantAt ?? 0) - (right.dormantAt ?? 0) || left.id - right.id)[0];
      this._disposeEntry(oldest);
    }
  }
  _fragmentTaskKey(entry, fragment) {
    return `${entry.id}\0fragment\0${fragment}`;
  }
  _bodyTaskKey(entry, fragment) {
    return `${entry.id}\0body\0${fragment}`;
  }
  _dormantTaskKey(entry) {
    return `${entry.id}\0dormant`;
  }
  _isFragmentActive(entry, fragment) {
    return !entry.disposed && entry.subscriptions.size > 0 && entry.effective.has(fragment);
  }
};

function initialSnapshot(ref) {
  const missing = { status: "missing", complete: false };
  return {
    ref,
    generation: 1,
    headGeneration: 0,
    core: missing,
    topLevelComments: missing,
    submittedReviews: missing,
    inlineComments: missing,
    reviewThreads: missing,
    checks: missing,
    mergeability: missing,
    participants: missing
  };
}

function normalizeRef(ref) {
  const host = ref.host.trim().toLowerCase();
  const accountId = ref.accountId.trim();
  const owner = ref.owner.trim();
  const repo = ref.repo.trim();
  if (!host || !accountId || !owner || !repo || !Number.isInteger(ref.number) || ref.number <= 0) {
    throw new Error("Pull request reference must contain a host, account, owner, repository, and positive number");
  }
  return { host, accountId, owner, repo, number: ref.number };
}

function pullRequestKey(ref) {
  return [
    ref.host.toLowerCase(),
    ref.accountId,
    ref.owner.toLowerCase(),
    ref.repo.toLowerCase(),
    ref.number
  ].join("\0");
}

function stablePullRequestKey(ref, repositoryId) {
  return [ref.host.toLowerCase(), ref.accountId, "repository", repositoryId, ref.number].join("\0");
}

function sameAccount4(left, right) {
  return left.host.toLowerCase() === right.host.toLowerCase() && left.accountId === right.accountId;
}

function sameInterest(left, right) {
  return left.priority === right.priority && left.includeBodies === true === (right.includeBodies === true) && left.requiredChecks === true === (right.requiredChecks === true) && left.includeOptionalChecks === true === (right.includeOptionalChecks === true);
}

function isConversationFragment(fragment) {
  return fragment === "topLevelComments" || fragment === "submittedReviews" || fragment === "inlineComments" || fragment === "reviewThreads";
}

function isHeadFragment(fragment) {
  return fragment === "reviewThreads" || fragment === "checks" || fragment === "mergeability";
}

function checksPending(value2) {
  if (!value2) {
    return true;
  }
  return value2.checks.some((check) => {
    if (check.type === "checkRun") {
      return check.status !== "COMPLETED";
    }
    return check.status === "PENDING" || check.status === "EXPECTED";
  });
}

function fragmentState(snapshot, fragment) {
  switch (fragment) {
    case "core":
      return snapshot.core;
    case "topLevelComments":
      return snapshot.topLevelComments;
    case "submittedReviews":
      return snapshot.submittedReviews;
    case "inlineComments":
      return snapshot.inlineComments;
    case "reviewThreads":
      return snapshot.reviewThreads;
    case "checks":
      return snapshot.checks;
    case "mergeability":
      return snapshot.mergeability;
    case "participants":
      return snapshot.participants;
  }
}

function withFragmentState(snapshot, fragment, state) {
  switch (fragment) {
    case "core":
      return { ...snapshot, core: state };
    case "topLevelComments":
      return { ...snapshot, topLevelComments: state };
    case "submittedReviews":
      return { ...snapshot, submittedReviews: state };
    case "inlineComments":
      return { ...snapshot, inlineComments: state };
    case "reviewThreads":
      return { ...snapshot, reviewThreads: state };
    case "checks":
      return { ...snapshot, checks: state };
    case "mergeability":
      return { ...snapshot, mergeability: state };
    case "participants":
      return { ...snapshot, participants: state };
  }
}

function toFragmentError3(error) {
  if (error instanceof GitHubRequestError) {
    return { message: error.message, kind: error.kind, statusCode: error.statusCode };
  }
  return { message: error instanceof Error ? error.message : String(error), kind: "unknown" };
}

function toTimestamp(value2) {
  return new Date(value2).toISOString();
}

function readyState(value2, complete, observedAt, headSha) {
  return {
    value: value2,
    status: "ready",
    complete,
    observedAt,
    attemptedAt: observedAt,
    headSha
  };
}

function mergeSnapshotValues(target, source) {
  return {
    ...target,
    topLevelComments: retainFragmentValue(target.topLevelComments, source.topLevelComments),
    submittedReviews: retainFragmentValue(target.submittedReviews, source.submittedReviews),
    inlineComments: retainFragmentValue(target.inlineComments, source.inlineComments),
    reviewThreads: retainFragmentValue(target.reviewThreads, source.reviewThreads),
    checks: retainFragmentValue(target.checks, source.checks),
    mergeability: retainFragmentValue(target.mergeability, source.mergeability),
    participants: retainFragmentValue(target.participants, source.participants)
  };
}

function retainFragmentValue(target, source) {
  if (target.value !== void 0 || source.value === void 0) {
    return target;
  }
  return {
    ...source,
    status: "stale",
    complete: false,
    error: void 0
  };
}
export { formatPullRequestRef, resourceErrorKind, dataInterestExpanded, initialSnapshot, normalizeRef, pullRequestKey, stablePullRequestKey, sameAccount4, sameInterest, isConversationFragment, isHeadFragment, checksPending, fragmentState, withFragmentState, toFragmentError3, toTimestamp, readyState, mergeSnapshotValues, retainFragmentValue, defaultPollingPolicy2, fragments, PullRequestResourceImpl, PullRequestEntry, PullRequestSubscriptionImpl, PullRequestResourceService };
