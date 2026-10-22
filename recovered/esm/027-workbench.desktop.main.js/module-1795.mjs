// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/github/common/githubQueryServiceImpl.ts
import { observableValue } from "./module-0048.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { Disposable } from "./module-0012.mjs";
import { systemGitHubScheduler } from "./module-1787.mjs";
import { PullRequestScheduler } from "./module-1794.mjs";
import { GitHubRequestError } from "./module-1791.mjs";
import { raceCancellationError } from "./module-0036.mjs";
import { gitHubBackoffDelay } from "./module-1788.mjs";
import { hasKey } from "./module-0010.mjs";


// src/vs/platform/github/common/githubQueryServiceImpl.ts
var defaultPollingPolicy = {
  dormantGrace: 12e4,
  maximumDormantEntries: 50,
  visible: 6e4,
  background: 3e5,
  failureBackoff: { immediateRetries: 0, base: 6e4, maximum: 9e5, jitter: 5e3 },
  jitter: 5e3
};

var maximumPaginationPages = 100;

var maximumHydrationBatchSize = 25;

var repositoryHydrationFields = `
	id
	owner { id login }
	name
	nameWithOwner
	primaryLanguage { name }
	stargazerCount
	defaultBranchRef { name }
	isPrivate
	description
	url
	isArchived
	isFork
`;

var issueHydrationFields = `
	id
	number
	title
	body
	url
	state
	stateReason
	author { id login }
	assignees(first: 100) { nodes { id login } }
	labels(first: 100) { nodes { name } }
	createdAt
	updatedAt
	closedAt
`;

var maximumCommitPullRequests = 100;

var maximumIssueLinkageBatchSize = 20;

var listPullRequestsQuery = `query AgentHostListPullRequests($owner: String!, $repo: String!, $cursor: String) {
	repository(owner: $owner, name: $repo) {
		pullRequests(first: 100, after: $cursor, states: OPEN, orderBy: { field: UPDATED_AT, direction: DESC }) {
			nodes { number title author { login ... on User { databaseId } } headRefName isDraft updatedAt additions deletions }
			pageInfo { endCursor hasNextPage }
		}
	}
	rateLimit { limit remaining used resetAt }
}`;

var searchPullRequestsQuery = `query AgentHostSearchPullRequests($query: String!) {
	search(first: 100, query: $query, type: ISSUE) {
		nodes {
			... on PullRequest {
				number title author { login ... on User { databaseId } } headRefName isDraft updatedAt additions deletions
			}
		}
	}
	rateLimit { limit remaining used resetAt }
}`;

var recentIssuesQuery = `query AgentHostRecentAssignedIssues($query: String!) {
	search(query: $query, type: ISSUE, first: 5) {
		nodes { ... on Issue { number title url updatedAt } }
	}
	rateLimit { limit remaining used resetAt }
}`;

var recentPullRequestsQuery = `query AgentHostRecentAuthoredPullRequests($query: String!) {
	search(query: $query, type: ISSUE, first: 5) {
		nodes {
			... on PullRequest {
				number title url updatedAt
				commits(last: 1) {
					nodes { commit { committedDate statusCheckRollup { state } } }
				}
			}
		}
	}
	rateLimit { limit remaining used resetAt }
}`;

var reviewThreadSummaryQuery = `query AgentHostPullRequestReviewThreadSummary($owner: String!, $repo: String!, $number: Int!, $after: String) {
	repository(owner: $owner, name: $repo) {
		pullRequest(number: $number) {
			reviewThreads(first: 100, after: $after) {
				nodes { isResolved comments(last: 1) { nodes { createdAt } } }
				pageInfo { hasNextPage endCursor }
			}
		}
	}
	rateLimit { limit remaining used resetAt }
}`;

var EntityEntry = class {
  constructor(id2, kind, ref) {
    this.id = id2;
    this.kind = kind;
    this.subscriptions = /* @__PURE__ */ new Set();
    this.keys = /* @__PURE__ */ new Set();
    /** Consecutive refresh failures, so repeated trouble is retried further apart. */
    this.failureCount = 0;
    this.generation = 0;
    this.disposed = false;
    this.ref = ref;
    this.state = observableValue(this, { status: "missing", complete: false });
    this.resource = kind === "repository" ? new RepositoryResourceImpl(this) : new IssueResourceImpl(this);
  }
  setLoading(attemptedAt) {
    this.state.set({
      ...this.state.get(),
      status: "loading",
      complete: false,
      attemptedAt,
      error: void 0
    }, void 0);
  }
  setError(error) {
    this.state.set({
      ...this.state.get(),
      status: "error",
      complete: false,
      error
    }, void 0);
  }
};

var RepositoryResourceImpl = class {
  constructor(_entry) {
    this._entry = _entry;
  }
  get ref() {
    return this._entry.ref;
  }
  get state() {
    return this._entry.state;
  }
};

var IssueResourceImpl = class {
  constructor(_entry) {
    this._entry = _entry;
  }
  get ref() {
    return this._entry.ref;
  }
  get state() {
    return this._entry.state;
  }
};

var EntitySubscription = class {
  constructor(resource, entry, _service, options3) {
    this.resource = resource;
    this.entry = entry;
    this._service = _service;
    this._disposed = false;
    this.options = options3;
  }
  update(options3) {
    if (this._disposed || this.entry.disposed) {
      throw new Error("GitHub resource subscription has been disposed");
    }
    this.options = options3;
    this._service.updateEntitySubscription(this.entry);
  }
  refresh(token = CancellationToken.None) {
    if (this._disposed || this.entry.disposed) {
      return Promise.reject(new Error("GitHub resource subscription has been disposed"));
    }
    return this._service.refreshEntity(this.entry, token);
  }
  dispose() {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    this._service.removeEntitySubscription(this);
  }
};

var GitHubQueryService = class extends Disposable {
  constructor(scheduler, _policy = defaultPollingPolicy, _credentials, _transport, _endpoint, _capabilities, _logService) {
    super();
    this._policy = _policy;
    this._credentials = _credentials;
    this._transport = _transport;
    this._endpoint = _endpoint;
    this._capabilities = _capabilities;
    this._logService = _logService;
    this._entriesByKey = /* @__PURE__ */ new Map();
    this._entries = /* @__PURE__ */ new Set();
    this._dormant = /* @__PURE__ */ new Map();
    this._unsupportedGraphQLQueries = /* @__PURE__ */ new Set();
    this._entryId = 0;
    this._clock = scheduler ?? systemGitHubScheduler;
    this._scheduler = this._register(new PullRequestScheduler(this._clock));
    this._register(this._credentials.onDidInvalidate((event) => this._handleCredentialInvalidation(event)));
  }
  subscribeRepository(ref, options3) {
    const normalized = normalizeRepositoryRef(ref);
    const entry = this._getOrCreateEntity("repository", normalized);
    const subscription = new EntitySubscription(entry.resource, entry, this, options3);
    entry.subscriptions.add(subscription);
    this._logService.trace(`[GitHubQueryService] Added repository subscription for ${formatEntityRef(entry.ref)} (entry ${entry.id}, subscriptions: ${entry.subscriptions.size})`);
    this._activateEntity(entry);
    return subscription;
  }
  async hydrateResources(refs, signal) {
    for (let index2 = 0; index2 < refs.length; index2 += maximumHydrationBatchSize) {
      await this._hydrateResourceBatch(refs.slice(index2, index2 + maximumHydrationBatchSize), signal);
    }
  }
  async _hydrateResourceBatch(refs, signal) {
    if (refs.length === 0) {
      return;
    }
    const resources = refs.map((item) => ({
      item,
      entry: item.kind === "repository" ? this._getOrCreateEntity("repository", normalizeRepositoryRef(item.ref)) : this._getOrCreateEntity("issue", normalizeIssueRef(item.ref))
    })).filter((resource) => {
      const status2 = resource.entry.state.get().status;
      return status2 !== "ready" && status2 !== "loading";
    }).map((resource) => ({ ...resource, generation: ++resource.entry.generation }));
    if (resources.length === 0) {
      return;
    }
    const firstRef = resources[0].item.ref;
    if (resources.some((resource) => !sameAccount2(resource.item.ref, { account: firstRef }))) {
      throw new GitHubRequestError("GitHub hydration batch spans multiple accounts", "validation");
    }
    const attemptedAt = new Date(this._clock.now()).toISOString();
    for (const { entry } of resources) {
      this._scheduler.cancel(this._entityTaskKey(entry));
      entry.setLoading(attemptedAt);
    }
    const definitions3 = [];
    const selections = [];
    const variables = {};
    for (let index2 = 0; index2 < resources.length; index2++) {
      const item = resources[index2].item;
      definitions3.push(`$owner${index2}: String!`, `$repo${index2}: String!`);
      variables[`owner${index2}`] = item.ref.owner;
      variables[`repo${index2}`] = item.ref.repo;
      if (item.kind === "repository") {
        selections.push(`r${index2}: repository(owner: $owner${index2}, name: $repo${index2}) { ${repositoryHydrationFields} }`);
      } else {
        definitions3.push(`$number${index2}: Int!`);
        variables[`number${index2}`] = item.ref.number;
        selections.push(`r${index2}: repository(owner: $owner${index2}, name: $repo${index2}) { issue(number: $number${index2}) { ${issueHydrationFields} } }`);
      }
    }
    const query = `query HydrateGitHubResources(${definitions3.join(", ")}) { ${selections.join("\n")} rateLimit { limit remaining used resetAt } }`;
    let data;
    try {
      data = asObject(await this._graphqlRaw(firstRef, query, variables, signal), "GitHub hydration response was malformed");
    } catch (error) {
      for (const { entry, generation } of resources) {
        if (entry.disposed || entry.generation !== generation) {
          continue;
        }
        entry.setError(toFragmentError(error));
        if (entry.subscriptions.size > 0) {
          this._scheduleEntity(entry, this._clock.now());
        } else {
          this._makeEntityDormant(entry);
        }
      }
      throw error;
    }
    const observedAt = new Date(this._clock.now()).toISOString();
    let hydratedCount = 0;
    for (let index2 = 0; index2 < resources.length; index2++) {
      const { item, entry, generation } = resources[index2];
      if (entry.disposed || entry.generation !== generation) {
        continue;
      }
      const repositoryValue = optionalObjectProperty(data, `r${index2}`);
      try {
        if (item.kind === "repository") {
          if (!repositoryValue) {
            this._handleMissingHydrationResult(entry);
            continue;
          }
          const value2 = toGraphQLRepository(repositoryValue);
          const repositoryEntry = this._getOrCreateEntity("repository", normalizeRepositoryRef(item.ref));
          repositoryEntry.state.set({ value: value2, status: "ready", complete: true, observedAt, attemptedAt: observedAt }, void 0);
          this._canonicalizeRepository(repositoryEntry, value2);
          if (repositoryEntry.subscriptions.size === 0) {
            this._makeEntityDormant(repositoryEntry);
          } else {
            this._scheduleEntity(repositoryEntry, this._clock.now() + this._pollDelay(repositoryEntry));
          }
          hydratedCount++;
        } else {
          const issueValue = repositoryValue ? optionalObjectProperty(repositoryValue, "issue") : void 0;
          if (!issueValue) {
            this._handleMissingHydrationResult(entry);
            continue;
          }
          const value2 = toGraphQLIssue(issueValue);
          const issueEntry = this._getOrCreateEntity("issue", normalizeIssueRef(item.ref));
          issueEntry.state.set({ value: value2, status: "ready", complete: true, observedAt, attemptedAt: observedAt }, void 0);
          if (issueEntry.subscriptions.size === 0) {
            this._makeEntityDormant(issueEntry);
          } else if (this._shouldPollEntity(issueEntry)) {
            this._scheduleEntity(issueEntry, this._clock.now() + this._pollDelay(issueEntry));
          }
          hydratedCount++;
        }
      } catch (error) {
        this._handleHydrationError(entry, error);
      }
    }
    this._logService.trace(`[GitHubQueryService] Hydrated ${hydratedCount} of ${resources.length} resource(s) in one GraphQL request`);
  }
  _handleHydrationError(entry, error) {
    entry.state.set({
      ...entry.state.get(),
      status: "error",
      complete: false,
      error: toFragmentError(error)
    }, void 0);
    if (entry.subscriptions.size > 0) {
      this._scheduleEntity(entry, this._clock.now());
    } else {
      this._makeEntityDormant(entry);
    }
  }
  _handleMissingHydrationResult(entry) {
    entry.state.set({
      ...entry.state.get(),
      status: "error",
      complete: false,
      error: { kind: "notFound", message: "GitHub resource was not found" }
    }, void 0);
    if (entry.subscriptions.size === 0) {
      this._makeEntityDormant(entry);
    }
  }
  subscribeIssue(ref, options3) {
    const normalized = normalizeIssueRef(ref);
    const entry = this._getOrCreateEntity("issue", normalized);
    const subscription = new EntitySubscription(entry.resource, entry, this, options3);
    entry.subscriptions.add(subscription);
    this._logService.trace(`[GitHubQueryService] Added issue subscription for ${formatEntityRef(entry.ref)} (entry ${entry.id}, subscriptions: ${entry.subscriptions.size})`);
    this._activateEntity(entry);
    return subscription;
  }
  async compare(ref, base, head, signal) {
    const normalized = normalizeRepositoryRef(ref);
    if (!base || !head) {
      throw new Error("GitHub comparison requires base and head refs");
    }
    return this._withCredential(normalized, signal, async (credential, combinedSignal) => {
      const commits = [];
      let files = [];
      let filesPresent = false;
      let first2;
      let totalCommits = 0;
      for (let page = 1; page <= maximumPaginationPages; page++) {
        const response = await this._transport.rest(credential.account, credential.token, {
          method: "GET",
          url: `${this._restUrl(normalized, `compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`)}?per_page=100&page=${page}`,
          etag: true,
          priority: "interactive"
        }, combinedSignal);
        const value2 = asObject(response.data, "GitHub comparison response was malformed");
        first2 ??= value2;
        totalCommits = numberProperty(value2, "total_commits") ?? totalCommits;
        commits.push(...arrayProperty(value2, "commits").map(toComparisonCommit));
        if (page === 1) {
          const fileValues = optionalArrayProperty(value2, "files");
          filesPresent = fileValues !== void 0;
          files = (fileValues ?? []).map(toChangedFile);
        }
        if (commits.length >= totalCommits || arrayProperty(value2, "commits").length < 100) {
          break;
        }
      }
      if (!first2) {
        throw new GitHubRequestError("GitHub comparison did not return a response", "malformedResponse");
      }
      const mergeBaseSha = requiredString(objectProperty(first2, "merge_base_commit"), "sha");
      const commitsComplete = commits.length >= totalCommits;
      return {
        baseSha: requiredString(objectProperty(first2, "base_commit"), "sha"),
        mergeBaseSha,
        headSha: commitsComplete ? commits.at(-1)?.sha ?? mergeBaseSha : void 0,
        status: enumProperty(first2, "status", ["ahead", "behind", "diverged", "identical"], "diverged"),
        aheadBy: numberProperty(first2, "ahead_by") ?? 0,
        behindBy: numberProperty(first2, "behind_by") ?? 0,
        totalCommits,
        commits,
        commitsComplete,
        files,
        filesComplete: filesPresent && files.length < 300
      };
    });
  }
  async listPullRequests(ref, cursor, signal) {
    return this._graphqlWithCredential(ref, listPullRequestsQuery, {
      owner: ref.owner,
      repo: ref.repo,
      cursor: cursor ?? null
    }, signal, (data) => {
      const repository = objectProperty(asObject(data, "GitHub pull request page was malformed"), "repository");
      const connection = objectProperty(repository, "pullRequests");
      const pageInfo = objectProperty(connection, "pageInfo");
      return {
        pullRequests: arrayProperty(connection, "nodes").map((value2) => toPullRequestSummary(value2, false, false)),
        cursor: nullableStringProperty(pageInfo, "endCursor"),
        hasNextPage: booleanProperty(pageInfo, "hasNextPage") ?? false
      };
    });
  }
  listPullRequestsWaitingForReview(ref, signal) {
    return this._searchPullRequests(ref, `repo:${ref.owner}/${ref.repo} is:pr is:open review-requested:@me sort:updated-desc`, true, false, signal);
  }
  listPullRequestsAssignedToViewer(ref, signal) {
    return this._searchPullRequests(ref, `repo:${ref.owner}/${ref.repo} is:pr is:open assignee:@me sort:updated-desc`, false, true, signal);
  }
  async getPullRequestContext(ref, signal) {
    const repositoryRef = normalizeRepositoryRef(ref);
    return this._withCredential(repositoryRef, signal, async (credential, combinedSignal) => {
      const root = `pulls/${ref.number}`;
      const [coreResponse, files, issueComments, reviewComments] = await Promise.all([
        this._transport.rest(credential.account, credential.token, {
          method: "GET",
          url: this._restUrl(repositoryRef, root),
          etag: true,
          priority: "interactive"
        }, combinedSignal),
        this._fetchRestPages(repositoryRef, credential, `${root}/files`, combinedSignal),
        this._fetchRestPages(repositoryRef, credential, `issues/${ref.number}/comments`, combinedSignal),
        this._fetchRestPages(repositoryRef, credential, `${root}/comments`, combinedSignal)
      ]);
      const pullRequest = asObject(coreResponse.data, "GitHub pull request context was malformed");
      const base = objectProperty(pullRequest, "base");
      const head = objectProperty(pullRequest, "head");
      const comments = [
        ...issueComments.map((value2) => toContextComment("issue", value2)),
        ...reviewComments.map((value2) => toContextComment("review", value2))
      ].sort((left, right) => left.createdAt.localeCompare(right.createdAt) || left.updatedAt.localeCompare(right.updatedAt));
      return {
        ref,
        url: requiredString(pullRequest, "html_url"),
        title: requiredString(pullRequest, "title"),
        description: nullableStringProperty(pullRequest, "body") ?? "",
        author: requiredString(objectProperty(pullRequest, "user"), "login"),
        draft: booleanProperty(pullRequest, "draft") ?? false,
        baseRef: requiredString(base, "ref"),
        branchName: requiredString(head, "ref"),
        headRef: requiredString(head, "ref"),
        updatedAt: requiredString(pullRequest, "updated_at"),
        patch: createPatch(files),
        filesComplete: files.length < 3e3,
        comments,
        commentsComplete: true
      };
    });
  }
  async findPullRequestByHeadBranch(ref, branch, headOwner, signal) {
    const normalized = normalizeRepositoryRef(ref);
    const owner = headOwner ?? normalized.owner;
    return this._withCredential(normalized, signal, async (credential, combinedSignal) => {
      const response = await this._transport.rest(credential.account, credential.token, {
        method: "GET",
        url: `${this._restUrl(normalized, "pulls")}?head=${encodeURIComponent(`${owner}:${branch}`)}&state=all&sort=updated&direction=desc&per_page=1`,
        etag: true,
        priority: "interactive"
      }, combinedSignal);
      const values = asArray2(response.data, "GitHub pull request lookup response was malformed");
      return values.length > 0 ? toPullRequestLookup(normalized, values[0]) : void 0;
    });
  }
  async findPullRequestByHeadSha(ref, sha, signal) {
    const normalized = normalizeRepositoryRef(ref);
    return this._withCredential(normalized, signal, async (credential, combinedSignal) => {
      let values;
      try {
        const response = await this._transport.rest(credential.account, credential.token, {
          method: "GET",
          url: `${this._restUrl(normalized, `commits/${encodeURIComponent(sha)}/pulls`)}?per_page=${maximumCommitPullRequests}`,
          etag: true,
          priority: "interactive"
        }, combinedSignal);
        values = asArray2(response.data, "GitHub commit pull request lookup response was malformed");
      } catch (error) {
        if (error instanceof GitHubRequestError && error.statusCode === 422 && error.responseBody?.includes("No commit found for SHA")) {
          return void 0;
        }
        throw error;
      }
      if (values.length >= maximumCommitPullRequests) {
        return void 0;
      }
      const atHead = values.filter((value2) => stringProperty(objectProperty(asObject(value2, "GitHub pull request was malformed"), "head"), "sha") === sha);
      const open2 = atHead.filter((value2) => stringProperty(asObject(value2, "GitHub pull request was malformed"), "state") === "open");
      const candidates = open2.length > 0 ? open2 : atHead;
      return candidates.length === 1 ? toPullRequestLookup(normalized, candidates[0]) : void 0;
    });
  }
  getRecentAssignedIssues(ref, signal) {
    return this._graphqlWithCredential(ref, recentIssuesQuery, {
      query: `repo:${ref.owner}/${ref.repo} is:issue is:open assignee:@me sort:updated-desc`
    }, signal, (data) => arrayProperty(objectProperty(asObject(data, "GitHub recent issues response was malformed"), "search"), "nodes").filter(isObject3).map(toRecentIssue));
  }
  getRecentAuthoredPullRequests(ref, signal) {
    return this._graphqlWithCredential(ref, recentPullRequestsQuery, {
      query: `repo:${ref.owner}/${ref.repo} is:pr is:open author:@me sort:updated-desc`
    }, signal, (data) => arrayProperty(objectProperty(asObject(data, "GitHub recent pull requests response was malformed"), "search"), "nodes").filter(isObject3).map(toRecentPullRequest));
  }
  async getPullRequestReviewThreadSummary(ref, signal) {
    const result = [];
    let after2;
    for (let page = 0; page < maximumPaginationPages; page++) {
      const response = await this._graphqlRaw(ref, reviewThreadSummaryQuery, {
        owner: ref.owner,
        repo: ref.repo,
        number: ref.number,
        after: after2
      }, signal);
      const connection = objectAt(response, "repository", "pullRequest", "reviewThreads");
      result.push(...arrayProperty(connection, "nodes").filter(isObject3).map(toReviewThreadSummary));
      const pageInfo = objectProperty(connection, "pageInfo");
      if (!booleanProperty(pageInfo, "hasNextPage")) {
        return result;
      }
      after2 = requiredString(pageInfo, "endCursor");
    }
    throw new GitHubRequestError("GitHub review-thread summary pagination exceeded its page limit", "malformedResponse");
  }
  async getIssuesWithLinkedPullRequests(ref, issueNumbers, signal) {
    const normalizedNumbers = [...new Set(issueNumbers.filter((number) => Number.isInteger(number) && number > 0))];
    const linked = [];
    for (let offset = 0; offset < normalizedNumbers.length; offset += maximumIssueLinkageBatchSize) {
      const batch = normalizedNumbers.slice(offset, offset + maximumIssueLinkageBatchSize);
      const variableDefinitions = batch.map((_, index2) => `$issue${index2}: Int!`).join(", ");
      const selections = batch.map((_, index2) => `issue${index2}: issue(number: $issue${index2}) {
				closedByPullRequestsReferences(first: 1, includeClosedPrs: true) { totalCount }
			}`).join("\n");
      const query = `query AgentHostIssueLinkage($owner: String!, $repo: String!, ${variableDefinitions}) {
				repository(owner: $owner, name: $repo) { ${selections} }
				rateLimit { limit remaining used resetAt }
			}`;
      const variables = { owner: ref.owner, repo: ref.repo };
      batch.forEach((number, index2) => variables[`issue${index2}`] = number);
      const data = await this._graphqlRaw(ref, query, variables, signal);
      const repository = objectProperty(asObject(data, "GitHub issue linkage response was malformed"), "repository");
      batch.forEach((number, index2) => {
        const issue = optionalObjectProperty(repository, `issue${index2}`);
        const references = issue ? optionalObjectProperty(issue, "closedByPullRequestsReferences") : void 0;
        if ((references ? numberProperty(references, "totalCount") ?? 0 : 0) > 0) {
          linked.push(number);
        }
      });
    }
    return linked;
  }
  updateEntitySubscription(entry) {
    if (this._shouldPollEntity(entry)) {
      this._scheduleEntity(entry, this._clock.now() + this._pollDelay(entry));
    }
  }
  async refreshEntity(entry, token) {
    if (entry.disposed || entry.subscriptions.size === 0) {
      return;
    }
    this._scheduler.cancel(this._entityTaskKey(entry));
    if (entry.operation) {
      await raceCancellationError(entry.operation.promise, token);
      return;
    }
    const controller = new AbortController();
    entry.generation++;
    const operation = {
      controller,
      promise: this._runEntityFetch(entry, controller).finally(() => {
        if (entry.operation === operation) {
          entry.operation = void 0;
        }
      })
    };
    entry.operation = operation;
    await raceCancellationError(operation.promise, token);
  }
  removeEntitySubscription(subscription) {
    const entry = subscription.entry;
    if (!entry.subscriptions.delete(subscription)) {
      return;
    }
    if (entry.subscriptions.size > 0) {
      this.updateEntitySubscription(entry);
      return;
    }
    this._makeEntityDormant(entry);
  }
  _makeEntityDormant(entry) {
    entry.dormantAt = this._clock.now();
    this._logService.trace(`[GitHubQueryService] ${entry.kind} ${formatEntityRef(entry.ref)} became dormant (entry ${entry.id})`);
    this._scheduler.cancel(this._entityTaskKey(entry));
    entry.operation?.controller.abort(new Error("GitHub resource became dormant"));
    entry.operation = void 0;
    this._dormant.set(entry.id, entry);
    this._scheduler.schedule(this._dormantTaskKey(entry), this._clock.now() + this._policy.dormantGrace, () => {
      if (entry.dormantAt !== void 0) {
        this._disposeEntity(entry);
      }
    });
    this._trimDormant();
  }
  clear() {
    for (const entry of [...this._entries]) {
      this._disposeEntity(entry);
    }
    this._scheduler.clear();
    this._unsupportedGraphQLQueries.clear();
  }
  dispose() {
    this.clear();
    super.dispose();
  }
  _getOrCreateEntity(kind, ref) {
    const key3 = entityKey(kind, ref);
    const existing = this._entriesByKey.get(key3);
    if (existing) {
      return existing;
    }
    const entry = new EntityEntry(this._entryId++, kind, ref);
    entry.keys.add(key3);
    this._entriesByKey.set(key3, entry);
    this._entries.add(entry);
    this._logService.debug(`[GitHubQueryService] Created ${kind} resource ${formatEntityRef(ref)} (entry ${entry.id})`);
    return entry;
  }
  _activateEntity(entry) {
    let resumed = false;
    if (entry.dormantAt !== void 0) {
      entry.dormantAt = void 0;
      this._dormant.delete(entry.id);
      this._scheduler.cancel(this._dormantTaskKey(entry));
      resumed = true;
    }
    const state = entry.state.get();
    if (state.status === "missing" || state.status === "stale" || state.status === "error" || resumed && entry.operation === void 0 && state.status !== "ready") {
      this._scheduleEntity(entry, this._clock.now());
    } else if (resumed && this._shouldPollEntity(entry)) {
      this._scheduleEntity(entry, this._clock.now() + this._pollDelay(entry));
    }
  }
  async _runEntityFetch(entry, controller) {
    const previous = entry.state.get();
    entry.state.set({
      ...previous,
      status: "loading",
      complete: false,
      attemptedAt: new Date(this._clock.now()).toISOString(),
      error: void 0
    }, void 0);
    let credential;
    const startedAt = this._clock.now();
    this._logService.trace(`[GitHubQueryService] Refreshing ${entry.kind} ${formatEntityRef(entry.ref)} (entry ${entry.id})`);
    try {
      credential = await this._credentials.getCredential(controller.signal);
      if (!sameAccount2(entry.ref, credential)) {
        throw new GitHubRequestError("GitHub resource account does not match the current credential", "authentication");
      }
      const response = await this._transport.rest(credential.account, credential.token, {
        method: "GET",
        url: entry.kind === "repository" ? this._restUrl(entry.ref, "") : this._restUrl(entry.ref, `issues/${entry.ref.number}`),
        etag: true,
        priority: toRequestPriority(this._effectivePriority(entry))
      }, AbortSignal.any([controller.signal, credential.signal]));
      if (entry.disposed || controller.signal.aborted || entry.subscriptions.size === 0) {
        return;
      }
      const value2 = entry.kind === "repository" ? toRepository(response.data) : toIssue(response.data);
      entry.state.set({
        value: value2,
        status: "ready",
        complete: true,
        observedAt: new Date(this._clock.now()).toISOString(),
        attemptedAt: new Date(this._clock.now()).toISOString()
      }, void 0);
      if (entry.kind === "repository") {
        this._canonicalizeRepository(entry, value2);
      }
      this._logService.trace(`[GitHubQueryService] Refreshed ${entry.kind} ${formatEntityRef(entry.ref)} in ${this._clock.now() - startedAt}ms (entry ${entry.id})`);
      entry.failureCount = 0;
      if (this._shouldPollEntity(entry)) {
        this._scheduleEntity(entry, this._clock.now() + this._pollDelay(entry) + this._clock.jitter(this._policy.jitter));
      }
    } catch (error) {
      if (credential && sameAccount2(entry.ref, credential)) {
        this._credentials.handleRequestError(credential, error);
      }
      if (!entry.disposed && !controller.signal.aborted && entry.subscriptions.size > 0) {
        if (credential?.signal.aborted) {
          this._scheduleEntity(entry, this._clock.now());
          throw error;
        }
        entry.state.set({
          ...previous,
          status: "error",
          complete: false,
          attemptedAt: new Date(this._clock.now()).toISOString(),
          error: toFragmentError(error)
        }, void 0);
        if (!(error instanceof GitHubRequestError) || error.kind !== "authentication") {
          this._scheduleAfterFailure(entry);
        }
      }
      this._logService.debug(`[GitHubQueryService] Refresh ${entry.kind} ${formatEntityRef(entry.ref)} ${controller.signal.aborted ? "cancelled" : "failed"} after ${this._clock.now() - startedAt}ms (${queryErrorKind(error)})`);
      throw error;
    }
  }
  async _searchPullRequests(ref, query, reviewRequested, assigned, signal) {
    return this._graphqlWithCredential(ref, searchPullRequestsQuery, { query }, signal, (data) => arrayProperty(objectProperty(asObject(data, "GitHub pull request search response was malformed"), "search"), "nodes").filter(isObject3).map((value2) => toPullRequestSummary(value2, reviewRequested, assigned)));
  }
  async _graphqlRaw(ref, query, variables, signal) {
    return this._withCredential(ref, signal, async (credential, combinedSignal) => {
      const capabilities = await this._capabilities.getCapabilities(credential, void 0, combinedSignal);
      if (!capabilities.graphql) {
        throw new GitHubRequestError("GitHub GraphQL is unavailable on this host", "schema");
      }
      const queryKey = `${credential.account.host.toLowerCase()}\0${query}`;
      if (this._unsupportedGraphQLQueries.has(queryKey)) {
        throw new GitHubRequestError("GitHub GraphQL query is unsupported on this host", "schema");
      }
      try {
        const response = await this._transport.graphql(
          credential.account,
          credential.token,
          this._endpoint.getGraphQlUri(),
          query,
          variables,
          combinedSignal,
          "interactive"
        );
        throwGraphQLErrors(response.errors);
        return response.data;
      } catch (error) {
        if (error instanceof GitHubRequestError && error.kind === "schema") {
          this._unsupportedGraphQLQueries.add(queryKey);
        }
        throw error;
      }
    });
  }
  async _graphqlWithCredential(ref, query, variables, signal, map) {
    return map(await this._graphqlRaw(ref, query, variables, signal));
  }
  async _fetchRestPages(ref, credential, route, signal) {
    const result = [];
    let url = `${this._restUrl(ref, route)}?per_page=100&page=1`;
    for (let page = 0; url && page < maximumPaginationPages; page++) {
      const response = await this._transport.rest(credential.account, credential.token, {
        method: "GET",
        url,
        etag: true,
        priority: "interactive"
      }, signal);
      const values = asArray2(response.data, "GitHub paginated response was not an array");
      result.push(...values);
      url = nextLink(response.link);
      if (!url && values.length === 100) {
        url = `${this._restUrl(ref, route)}?per_page=100&page=${page + 2}`;
      }
      if (values.length < 100) {
        url = void 0;
      }
    }
    if (url) {
      throw new GitHubRequestError("GitHub pagination exceeded its page limit", "malformedResponse");
    }
    return result;
  }
  async _withCredential(ref, signal, task) {
    const credential = await this._credentials.getCredential(signal);
    if (!sameAccount2(ref, credential)) {
      throw new GitHubRequestError("GitHub query account does not match the current credential", "authentication");
    }
    try {
      return await task(credential, AbortSignal.any([signal, credential.signal]));
    } catch (error) {
      this._credentials.handleRequestError(credential, error);
      throw error;
    }
  }
  _canonicalizeRepository(entry, repository) {
    const [owner, repo, extra] = repository.nameWithOwner.split("/");
    if (!owner || !repo || extra) {
      return;
    }
    entry.ref = { ...entry.ref, owner, repo };
    const alias = entityKey("repository", entry.ref);
    if (!this._entriesByKey.has(alias)) {
      this._entriesByKey.set(alias, entry);
      entry.keys.add(alias);
      this._logService.debug(`[GitHubQueryService] Canonicalized repository ${formatEntityRef(entry.ref)} (entry ${entry.id}, aliases: ${entry.keys.size})`);
    }
  }
  _handleCredentialInvalidation(event) {
    this._logService.debug(`[GitHubQueryService] Handling credential invalidation (${event.reason}) for ${this._entries.size} resource(s)`);
    for (const entry of [...this._entries]) {
      if (!event.credential || sameAccount2(entry.ref, event.credential)) {
        if (event.reason === "replacement" || event.reason === "authentication") {
          const current = entry.state.get();
          entry.state.set({
            ...current,
            status: current.value ? "stale" : "missing",
            complete: false,
            error: void 0
          }, void 0);
          if (entry.subscriptions.size > 0) {
            this._scheduleEntity(entry, this._clock.now());
          }
        } else {
          this._disposeEntity(entry);
        }
      }
    }
  }
  _disposeEntity(entry) {
    if (entry.disposed) {
      return;
    }
    entry.disposed = true;
    this._logService.trace(`[GitHubQueryService] Disposing ${entry.kind} ${formatEntityRef(entry.ref)} (entry ${entry.id})`);
    entry.operation?.controller.abort(new Error("GitHub resource was disposed"));
    this._scheduler.cancel(this._entityTaskKey(entry));
    this._scheduler.cancel(this._dormantTaskKey(entry));
    for (const key3 of entry.keys) {
      if (this._entriesByKey.get(key3) === entry) {
        this._entriesByKey.delete(key3);
      }
    }
    entry.subscriptions.clear();
    this._dormant.delete(entry.id);
    this._entries.delete(entry);
  }
  _trimDormant() {
    while (this._dormant.size > this._policy.maximumDormantEntries) {
      const oldest = [...this._dormant.values()].sort((left, right) => (left.dormantAt ?? 0) - (right.dormantAt ?? 0) || left.id - right.id)[0];
      this._disposeEntity(oldest);
    }
  }
  _scheduleEntity(entry, dueAt) {
    if (entry.disposed || entry.subscriptions.size === 0) {
      return;
    }
    this._scheduler.schedule(this._entityTaskKey(entry), dueAt, () => {
      void this.refreshEntity(entry, CancellationToken.None).catch((error) => {
        if (!entry.disposed && entry.subscriptions.size > 0) {
          this._logService.warn(`[GitHubQueryService] Failed to refresh ${entry.kind} ${entry.ref.owner}/${entry.ref.repo}`, error);
        }
      });
    });
  }
  _effectivePriority(entry) {
    let result = "background";
    for (const subscription of entry.subscriptions) {
      if (subscription.options.priority === "interactive") {
        return "interactive";
      }
      if (subscription.options.priority === "visible") {
        result = "visible";
      }
    }
    return result;
  }
  _pollDelay(entry) {
    return this._effectivePriority(entry) === "background" ? this._policy.background : this._policy.visible;
  }
  /**
   * Retries a failed refresh no sooner than its poll cadence and further apart
   * the longer the trouble lasts, so a GitHub outage is not met with the same
   * request rate from every subscriber for its whole duration.
   */
  _scheduleAfterFailure(entry) {
    entry.failureCount++;
    const delay = gitHubBackoffDelay(this._policy.failureBackoff, this._clock, entry.failureCount, this._pollDelay(entry));
    this._scheduleEntity(entry, this._clock.now() + delay);
  }
  _shouldPollEntity(entry) {
    if (entry.kind === "repository") {
      return true;
    }
    const state = entry.state.get();
    return state.status !== "ready" || state.value?.state === "open";
  }
  _entityTaskKey(entry) {
    return `entity\0${entry.id}`;
  }
  _dormantTaskKey(entry) {
    return `entity-dormant\0${entry.id}`;
  }
  _restUrl(ref, route) {
    const suffix = route ? `/${route}` : "";
    return `${this._endpoint.getApiBaseUri()}/repos/${encodeURIComponent(ref.owner)}/${encodeURIComponent(ref.repo)}${suffix}`;
  }
};

function normalizeRepositoryRef(ref) {
  const host = ref.host.trim().toLowerCase();
  const accountId = ref.accountId.trim();
  const owner = ref.owner.trim();
  const repo = ref.repo.trim();
  if (!host || !accountId || !owner || !repo) {
    throw new Error("GitHub repository reference is incomplete");
  }
  return { host, accountId, owner, repo };
}

function normalizeIssueRef(ref) {
  const repository = normalizeRepositoryRef(ref);
  if (!Number.isInteger(ref.number) || ref.number <= 0) {
    throw new Error("GitHub issue reference requires a positive number");
  }
  return { ...repository, number: ref.number };
}

function entityKey(kind, ref) {
  return [
    kind,
    ref.host.toLowerCase(),
    ref.accountId,
    ref.owner.toLowerCase(),
    ref.repo.toLowerCase(),
    hasKey(ref, { number: true }) ? ref.number : ""
  ].join("\0");
}

function sameAccount2(ref, credential) {
  return ref.host.toLowerCase() === credential.account.host.toLowerCase() && ref.accountId === credential.account.accountId;
}

function toRequestPriority(priority) {
  return priority;
}

function toRepository(value2) {
  const item = asObject(value2, "GitHub repository response was malformed");
  const owner = objectProperty(item, "owner");
  const language2 = nullableStringProperty(item, "language");
  const stars = numberProperty(item, "stargazers_count");
  return {
    id: idProperty(item, "node_id") ?? idProperty(item, "id"),
    owner: requiredActor(owner),
    name: requiredString(item, "name"),
    nameWithOwner: requiredString(item, "full_name"),
    ...language2 !== void 0 ? { language: language2 } : {},
    ...stars !== void 0 ? { stars } : {},
    defaultBranch: requiredString(item, "default_branch"),
    private: booleanProperty(item, "private") ?? false,
    description: nullableStringProperty(item, "description") ?? "",
    url: requiredString(item, "html_url"),
    archived: booleanProperty(item, "archived") ?? false,
    fork: booleanProperty(item, "fork") ?? false
  };
}

function toGraphQLRepository(value2) {
  const owner = objectProperty(value2, "owner");
  const primaryLanguage = optionalObjectProperty(value2, "primaryLanguage");
  const defaultBranch = optionalObjectProperty(value2, "defaultBranchRef");
  const stars = numberProperty(value2, "stargazerCount");
  return {
    id: idProperty(value2, "id"),
    owner: requiredActor(owner),
    name: requiredString(value2, "name"),
    nameWithOwner: requiredString(value2, "nameWithOwner"),
    ...primaryLanguage ? { language: requiredString(primaryLanguage, "name") } : {},
    ...stars !== void 0 ? { stars } : {},
    defaultBranch: defaultBranch ? requiredString(defaultBranch, "name") : "",
    private: booleanProperty(value2, "isPrivate") ?? false,
    description: nullableStringProperty(value2, "description") ?? "",
    url: requiredString(value2, "url"),
    archived: booleanProperty(value2, "isArchived") ?? false,
    fork: booleanProperty(value2, "isFork") ?? false
  };
}

function toGraphQLIssue(value2) {
  const author = optionalObjectProperty(value2, "author");
  const assignees = objectProperty(value2, "assignees");
  const labels2 = objectProperty(value2, "labels");
  const stateReason = nullableStringProperty(value2, "stateReason")?.toLowerCase();
  return {
    id: idProperty(value2, "id"),
    number: requiredNumber(value2, "number"),
    title: requiredString(value2, "title"),
    body: nullableStringProperty(value2, "body") ?? "",
    url: requiredString(value2, "url"),
    state: requiredString(value2, "state") === "CLOSED" ? "closed" : "open",
    stateReason: stateReason === "completed" || stateReason === "not_planned" || stateReason === "duplicate" || stateReason === "reopened" ? stateReason : void 0,
    author: author ? requiredActor(author) : { login: "ghost" },
    assignees: arrayProperty(assignees, "nodes").filter(isObject3).map(requiredActor),
    labels: arrayProperty(labels2, "nodes").filter(isObject3).map((label3) => requiredString(label3, "name")),
    createdAt: requiredString(value2, "createdAt"),
    updatedAt: requiredString(value2, "updatedAt"),
    closedAt: nullableStringProperty(value2, "closedAt")
  };
}

function toIssue(value2) {
  const item = asObject(value2, "GitHub issue response was malformed");
  if (Reflect.has(item, "pull_request")) {
    throw new GitHubRequestError("Requested GitHub issue is a pull request", "validation");
  }
  const author = optionalObjectProperty(item, "user");
  return {
    id: idProperty(item, "node_id") ?? idProperty(item, "id"),
    number: requiredNumber(item, "number"),
    title: requiredString(item, "title"),
    body: nullableStringProperty(item, "body") ?? "",
    url: requiredString(item, "html_url"),
    state: stringProperty(item, "state") === "closed" ? "closed" : "open",
    stateReason: enumProperty(item, "state_reason", ["completed", "not_planned", "duplicate", "reopened"], void 0),
    author: author ? requiredActor(author) : { login: "ghost" },
    assignees: arrayProperty(item, "assignees").filter(isObject3).map(requiredActor),
    labels: arrayProperty(item, "labels").flatMap((label3) => {
      if (typeof label3 === "string") {
        return [label3];
      }
      if (isObject3(label3)) {
        const name = stringProperty(label3, "name");
        return name ? [name] : [];
      }
      return [];
    }),
    createdAt: requiredString(item, "created_at"),
    updatedAt: requiredString(item, "updated_at"),
    closedAt: nullableStringProperty(item, "closed_at")
  };
}

function toChangedFile(value2) {
  const item = asObject(value2, "GitHub changed file was malformed");
  return {
    filename: requiredString(item, "filename"),
    previousFilename: stringProperty(item, "previous_filename"),
    status: enumProperty(item, "status", ["added", "removed", "modified", "renamed", "copied", "changed", "unchanged"], "changed"),
    additions: numberProperty(item, "additions") ?? 0,
    deletions: numberProperty(item, "deletions") ?? 0,
    changes: numberProperty(item, "changes") ?? 0,
    patch: stringProperty(item, "patch"),
    blobUrl: stringProperty(item, "blob_url")
  };
}

function toComparisonCommit(value2) {
  const item = asObject(value2, "GitHub comparison commit was malformed");
  const commit = objectProperty(item, "commit");
  const author = optionalObjectProperty(item, "author");
  return {
    sha: requiredString(item, "sha"),
    message: requiredString(commit, "message"),
    author: author ? requiredActor(author) : void 0,
    committedAt: optionalObjectProperty(commit, "committer") ? stringProperty(objectProperty(commit, "committer"), "date") : void 0,
    url: stringProperty(item, "html_url")
  };
}

function toPullRequestSummary(value2, reviewRequested, assigned) {
  const item = asObject(value2, "GitHub pull request summary was malformed");
  const number = requiredNumber(item, "number");
  const author = optionalObjectProperty(item, "author");
  return {
    number,
    title: requiredString(item, "title"),
    author: author ? requiredActor(author) : { login: "ghost" },
    headRef: requiredString(item, "headRefName"),
    checkoutRef: `refs/pull/${number}/head`,
    draft: booleanProperty(item, "isDraft") ?? false,
    updatedAt: requiredString(item, "updatedAt"),
    additions: numberProperty(item, "additions") ?? 0,
    deletions: numberProperty(item, "deletions") ?? 0,
    reviewRequestedFromViewer: reviewRequested,
    assignedToViewer: assigned
  };
}

function toPullRequestLookup(ref, value2) {
  const item = asObject(value2, "GitHub pull request lookup response was malformed");
  return {
    ref: { ...ref, number: requiredNumber(item, "number") },
    id: idProperty(item, "node_id"),
    url: requiredString(item, "html_url"),
    createdAt: stringProperty(item, "created_at")
  };
}

function toContextComment(kind, value2) {
  const item = asObject(value2, "GitHub pull request context comment was malformed");
  return {
    kind,
    author: requiredString(objectProperty(item, "user"), "login"),
    body: requiredString(item, "body"),
    createdAt: requiredString(item, "created_at"),
    updatedAt: requiredString(item, "updated_at"),
    path: kind === "review" ? stringProperty(item, "path") : void 0,
    line: kind === "review" ? numberProperty(item, "line") ?? numberProperty(item, "original_line") : void 0
  };
}

function createPatch(values) {
  return values.map((value2) => {
    const file = asObject(value2, "GitHub pull request file was malformed");
    return [
      `diff --git a/${requiredString(file, "filename")} b/${requiredString(file, "filename")}`,
      stringProperty(file, "patch") ?? `[Patch unavailable: ${stringProperty(file, "status") ?? "changed"}, +${numberProperty(file, "additions") ?? 0} -${numberProperty(file, "deletions") ?? 0}]`
    ].join("\n");
  }).join("\n\n");
}

function toRecentIssue(value2) {
  return {
    number: requiredNumber(value2, "number"),
    title: requiredString(value2, "title"),
    url: requiredString(value2, "url"),
    updatedAt: requiredString(value2, "updatedAt")
  };
}

function toRecentPullRequest(value2) {
  const commits = objectProperty(value2, "commits");
  const node = arrayProperty(commits, "nodes").find(isObject3);
  const commit = node ? optionalObjectProperty(node, "commit") : void 0;
  const rollup = commit ? optionalObjectProperty(commit, "statusCheckRollup") : void 0;
  return {
    number: requiredNumber(value2, "number"),
    title: requiredString(value2, "title"),
    url: requiredString(value2, "url"),
    updatedAt: requiredString(value2, "updatedAt"),
    statusCheckRollupState: rollup ? stringProperty(rollup, "state") : void 0,
    latestCommitAt: commit ? stringProperty(commit, "committedDate") : void 0
  };
}

function toReviewThreadSummary(value2) {
  const comments = objectProperty(value2, "comments");
  const latest = arrayProperty(comments, "nodes").find(isObject3);
  return {
    isResolved: booleanProperty(value2, "isResolved") ?? false,
    latestCommentAt: latest ? stringProperty(latest, "createdAt") : void 0
  };
}

function throwGraphQLErrors(errors) {
  if (errors.length === 0) {
    return;
  }
  const types = errors.map((error) => error.type?.toUpperCase());
  const codes = errors.map((error) => error.extensions?.code?.toUpperCase());
  const kind = types.includes("RATE_LIMITED") ? "rateLimit" : types.some((type) => type === "FORBIDDEN" || type === "UNAUTHORIZED") ? "authorization" : types.some((type) => type?.includes("NOT_FOUND")) ? "notFound" : types.some((type) => type?.includes("VALIDATION")) ? "schema" : codes.some((code) => code === "UNDEFINEDFIELD" || code === "ARGUMENTNOTACCEPTED" || code === "VARIABLEMISMATCH") ? "schema" : "server";
  throw new GitHubRequestError(
    `GitHub GraphQL query failed: ${errors.map((error) => error.message ?? error.type ?? "unknown error").join("; ")}`,
    kind,
    200,
    void 0,
    errors
  );
}

function nextLink(link2) {
  if (!link2) {
    return void 0;
  }
  for (const part of link2.split(",")) {
    const match2 = /^\s*<(?<url>[^>]+)>\s*;\s*rel="(?<rel>[^"]+)"/.exec(part);
    if (match2?.groups?.rel.split(/\s+/).includes("next")) {
      return match2.groups.url;
    }
  }
  return void 0;
}

function objectAt(value2, ...path) {
  let current = asObject(value2, "GitHub response was malformed");
  for (const part of path) {
    current = objectProperty(current, part);
  }
  return current;
}

function asObject(value2, message) {
  if (!isObject3(value2)) {
    throw new GitHubRequestError(message, "malformedResponse");
  }
  return value2;
}

function isObject3(value2) {
  return Boolean(value2) && typeof value2 === "object" && !Array.isArray(value2);
}

function asArray2(value2, message) {
  if (!Array.isArray(value2)) {
    throw new GitHubRequestError(message, "malformedResponse");
  }
  return value2;
}

function objectProperty(value2, key3) {
  return asObject(Reflect.get(value2, key3), `GitHub response property ${key3} was malformed`);
}

function optionalObjectProperty(value2, key3) {
  const property = Reflect.get(value2, key3);
  return property === null || property === void 0 ? void 0 : asObject(property, `GitHub response property ${key3} was malformed`);
}

function arrayProperty(value2, key3) {
  return asArray2(Reflect.get(value2, key3), `GitHub response property ${key3} was not an array`);
}

function optionalArrayProperty(value2, key3) {
  const property = Reflect.get(value2, key3);
  return property === null || property === void 0 ? void 0 : asArray2(property, `GitHub response property ${key3} was not an array`);
}

function requiredString(value2, key3) {
  const property = stringProperty(value2, key3);
  if (property === void 0) {
    throw new GitHubRequestError(`GitHub response property ${key3} was not a string`, "malformedResponse");
  }
  return property;
}

function stringProperty(value2, key3) {
  const property = Reflect.get(value2, key3);
  return typeof property === "string" ? property : void 0;
}

function nullableStringProperty(value2, key3) {
  const property = Reflect.get(value2, key3);
  return property === null ? void 0 : typeof property === "string" ? property : void 0;
}

function numberProperty(value2, key3) {
  const property = Reflect.get(value2, key3);
  return typeof property === "number" && Number.isFinite(property) ? property : void 0;
}

function requiredNumber(value2, key3) {
  const property = numberProperty(value2, key3);
  if (property === void 0) {
    throw new GitHubRequestError(`GitHub response property ${key3} was not a number`, "malformedResponse");
  }
  return property;
}

function booleanProperty(value2, key3) {
  const property = Reflect.get(value2, key3);
  return typeof property === "boolean" ? property : void 0;
}

function idProperty(value2, key3) {
  const property = Reflect.get(value2, key3);
  return typeof property === "string" || typeof property === "number" ? String(property) : void 0;
}

function enumProperty(value2, key3, allowed, fallback2) {
  const property = stringProperty(value2, key3);
  return property && allowed.includes(property) ? property : fallback2;
}

function requiredActor(value2) {
  const login = requiredString(value2, "login");
  const id2 = idProperty(value2, "databaseId") ?? idProperty(value2, "id");
  return id2 ? { id: id2, login } : { login };
}

function toFragmentError(error) {
  if (error instanceof GitHubRequestError) {
    return { message: error.message, kind: error.kind, statusCode: error.statusCode };
  }
  return { message: error instanceof Error ? error.message : String(error), kind: "unknown" };
}

function formatEntityRef(ref) {
  return `${ref.host}/${ref.owner}/${ref.repo}${hasKey(ref, { number: true }) ? `#${ref.number}` : ""}`;
}

function queryErrorKind(error) {
  if (error instanceof GitHubRequestError) {
    return `${error.kind}${error.statusCode === void 0 ? "" : `:${error.statusCode}`}`;
  }
  return error instanceof Error ? error.name : typeof error;
}
export { normalizeRepositoryRef, normalizeIssueRef, entityKey, sameAccount2, toRequestPriority, toRepository, toGraphQLRepository, toGraphQLIssue, toIssue, toChangedFile, toComparisonCommit, toPullRequestSummary, toPullRequestLookup, toContextComment, createPatch, toRecentIssue, toRecentPullRequest, toReviewThreadSummary, throwGraphQLErrors, nextLink, objectAt, asObject, isObject3, asArray2, objectProperty, optionalObjectProperty, arrayProperty, optionalArrayProperty, requiredString, stringProperty, nullableStringProperty, numberProperty, requiredNumber, booleanProperty, idProperty, enumProperty, requiredActor, toFragmentError, formatEntityRef, queryErrorKind, defaultPollingPolicy, maximumPaginationPages, maximumHydrationBatchSize, repositoryHydrationFields, issueHydrationFields, maximumCommitPullRequests, maximumIssueLinkageBatchSize, listPullRequestsQuery, searchPullRequestsQuery, recentIssuesQuery, recentPullRequestsQuery, reviewThreadSummaryQuery, EntityEntry, RepositoryResourceImpl, IssueResourceImpl, EntitySubscription, GitHubQueryService };
