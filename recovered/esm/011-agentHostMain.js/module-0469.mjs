// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/github/common/pullRequestQueryService.ts
import { PullRequestRequestPlanner } from "./module-0468.mjs";
import { GitHubRequestError } from "./module-0462.mjs";


// src/vs/platform/github/common/pullRequestQueryService.ts
var maximumPaginationPages3 = 100;

var reviewThreadsQuery = `query AgentHostPullRequestReviewThreads($owner: String!, $repo: String!, $number: Int!, $after: String) {
	repository(owner: $owner, name: $repo) {
		pullRequest(number: $number) {
			headRefOid
			reviewThreads(first: 100, after: $after) {
				nodes {
					id isResolved isOutdated path diffSide line originalLine
					comments(first: 100) {
						nodes { id databaseId body url createdAt updatedAt path line originalLine state authorAssociation commit { oid } originalCommit { oid } author { login ... on User { databaseId } ... on Bot { databaseId } } }
						pageInfo { hasNextPage endCursor }
					}
				}
				pageInfo { hasNextPage endCursor }
			}
		}
	}
	rateLimit { limit remaining used resetAt }
}`;

var reviewThreadCommentsQuery = `query AgentHostPullRequestReviewThreadComments($threadId: ID!, $after: String) {
	node(id: $threadId) {
		... on PullRequestReviewThread {
			comments(first: 100, after: $after) {
				nodes { id databaseId body url createdAt updatedAt path line originalLine state authorAssociation commit { oid } originalCommit { oid } author { login ... on User { databaseId } ... on Bot { databaseId } } }
				pageInfo { hasNextPage endCursor }
			}
		}
	}
	rateLimit { limit remaining used resetAt }
}`;

var checksQuery = (includeRequiredness, includeWorkflowNames) => `query AgentHostPullRequestChecks($owner: String!, $repo: String!, $number: Int!, $after: String) {
	repository(owner: $owner, name: $repo) {
		pullRequest(number: $number) {
			headRefOid
			commits(last: 1) {
				nodes {
					commit {
						statusCheckRollup {
							contexts(first: 100, after: $after) {
								nodes {
									__typename
									... on CheckRun {
										databaseId name status conclusion detailsUrl
										${includeWorkflowNames ? "checkSuite { workflowRun { workflow { name } } }" : ""}
										${includeRequiredness ? "isRequired(pullRequestNumber: $number)" : ""}
									}
									... on StatusContext {
										id context state targetUrl
										${includeRequiredness ? "isRequired(pullRequestNumber: $number)" : ""}
									}
								}
								pageInfo { hasNextPage endCursor }
							}
						}
					}
				}
			}
		}
	}
	rateLimit { limit remaining used resetAt }
}`;

var expectedCheckSuitesQuery = `query AgentHostPullRequestExpectedCheckSuites($owner: String!, $repo: String!, $headSha: GitObjectID!, $after: String) {
	repository(owner: $owner, name: $repo) {
		object(oid: $headSha) {
			... on Commit {
				oid
				checkSuites(first: 100, after: $after) {
					nodes { id status conclusion app { name slug } checkRuns(first: 1) { totalCount } }
					pageInfo { hasNextPage endCursor }
				}
			}
		}
	}
	rateLimit { limit remaining used resetAt }
}`;

var mergeabilityQuery = (includeMergeQueue) => `query AgentHostPullRequestMergeability($owner: String!, $repo: String!, $number: Int!${includeMergeQueue ? ", $baseBranch: String!" : ""}) {
	repository(owner: $owner, name: $repo) {
		id nameWithOwner mergeCommitAllowed squashMergeAllowed rebaseMergeAllowed viewerPermission
		${includeMergeQueue ? "mergeQueue(branch: $baseBranch) { id }" : ""}
		pullRequest(number: $number) {
			id headRefOid baseRefOid mergeable mergeStateStatus reviewDecision
			viewerCanUpdateBranch viewerCanEnableAutoMerge
			autoMergeRequest { enabledAt }
			mergeQueueEntry { id }
		}
	}
	rateLimit { limit remaining used resetAt }
}`;

var PullRequestQueryService = class {
  constructor(_transport, _capabilities, _endpoint, _logService) {
    this._transport = _transport;
    this._capabilities = _capabilities;
    this._endpoint = _endpoint;
    this._logService = _logService;
    this._planner = new PullRequestRequestPlanner();
    /** Repositories whose host refused the workflow-name subselection, keyed by `owner/repo`. */
    this._workflowNamesUnavailable = /* @__PURE__ */ new Set();
  }
  async fetch(fragment, ref, core, options, credential, signal) {
    const capabilities = needsCapabilities(fragment) ? await this._capabilities.getCapabilities(credential, void 0, signal) : restCapabilities;
    const plan = this._planner.plan(fragment, options.priority, capabilities);
    switch (fragment) {
      case "core":
        return { fragment, value: await this._fetchCore(ref, credential, signal, plan.priority), complete: true };
      case "topLevelComments":
        return {
          fragment,
          value: (await this._fetchRestArray(ref, credential, `issues/${ref.number}/comments?per_page=100`, signal, plan.priority)).map((item) => toComment2(item, options.conversation?.includeBodies === true)),
          complete: true
        };
      case "submittedReviews":
        return {
          fragment,
          value: (await this._fetchRestArray(ref, credential, `pulls/${ref.number}/reviews?per_page=100`, signal, plan.priority)).map((item) => toReview(item, options.conversation?.includeBodies === true)),
          complete: true
        };
      case "inlineComments":
        return {
          fragment,
          value: (await this._fetchRestArray(ref, credential, `pulls/${ref.number}/comments?per_page=100`, signal, plan.priority)).map((item) => toInlineComment(item, options.conversation?.includeBodies === true)),
          complete: true
        };
      case "reviewThreads":
        if (!core) {
          throw new GitHubRequestError("Pull request core is required before review threads", "malformedResponse");
        }
        if (plan.strategy === "unavailable") {
          return { fragment, value: [], complete: false, headSha: core.headSha };
        }
        return {
          fragment,
          value: await this._fetchReviewThreads(ref, core, credential, signal, plan.priority, options.conversation?.includeBodies === true),
          complete: true,
          headSha: core.headSha
        };
      case "checks":
        if (!core) {
          throw new GitHubRequestError("Pull request core is required before checks", "malformedResponse");
        }
        if (plan.strategy === "restChecksFallback") {
          return {
            fragment,
            value: await this._fetchChecksFallback(ref, core, credential, signal, plan.priority),
            complete: false,
            headSha: core.headSha
          };
        }
        return {
          fragment,
          value: await this._fetchChecks(
            ref,
            core,
            credential,
            signal,
            plan.priority,
            capabilities.checkContextRequiredness,
            options.checks?.required === true,
            options.checks?.includeOptional === true
          ),
          complete: plan.completeWhenSuccessful,
          headSha: core.headSha
        };
      case "mergeability": {
        if (!core) {
          throw new GitHubRequestError("Pull request core is required before mergeability", "malformedResponse");
        }
        if (plan.strategy === "restMergeabilityFallback") {
          return {
            fragment,
            value: await this._fetchMergeabilityFallback(ref, core, credential, signal, plan.priority),
            complete: false,
            headSha: core.headSha
          };
        }
        const mergeability = await this._fetchMergeability(ref, core, credential, signal, plan.priority, capabilities.mergeQueue);
        return {
          fragment,
          value: mergeability,
          complete: mergeability.mergeable !== "UNKNOWN" && mergeability.queueRequirementKnown,
          headSha: mergeability.headSha
        };
      }
      case "participants":
        return {
          fragment,
          value: await this._fetchParticipants(ref, core, credential, signal, plan.priority),
          complete: true
        };
    }
  }
  async _fetchCore(ref, credential, signal, priority) {
    const response = await this._transport.rest(credential.account, credential.token, {
      method: "GET",
      url: this._restUrl(ref, `pulls/${ref.number}`),
      etag: true,
      priority
    }, signal);
    return toCore(response.data, ref);
  }
  async _fetchRestArray(ref, credential, route, signal, priority) {
    const result = [];
    let url2 = this._restUrl(ref, route);
    for (let page = 0; url2 && page < maximumPaginationPages3; page++) {
      const response = await this._transport.rest(credential.account, credential.token, {
        method: "GET",
        url: url2,
        etag: true,
        priority
      }, signal);
      if (!Array.isArray(response.data)) {
        throw new GitHubRequestError("GitHub paginated response was not an array", "malformedResponse");
      }
      result.push(...response.data);
      url2 = nextLink3(response.link);
    }
    if (url2) {
      throw new GitHubRequestError("GitHub pagination exceeded its page limit", "malformedResponse");
    }
    return result;
  }
  async _fetchReviewThreads(ref, core, credential, signal, priority, includeBodies) {
    const result = [];
    let after;
    for (let page = 0; page < maximumPaginationPages3; page++) {
      const response = await this._transport.graphql(
        credential.account,
        credential.token,
        this._endpoint.getGraphQlUri(),
        reviewThreadsQuery,
        { owner: ref.owner, repo: ref.repo, number: ref.number, after },
        signal,
        priority
      );
      throwGraphQLErrors3(response.errors);
      const pullRequest = objectAt3(response.data, "repository", "pullRequest");
      if (requiredString5(pullRequest, "headRefOid") !== core.headSha) {
        throw new GitHubRequestError("GitHub review threads response was for an old pull request head", "unknown");
      }
      const connection = objectProperty2(pullRequest, "reviewThreads");
      for (const node of arrayProperty3(connection, "nodes")) {
        const thread = await this._toReviewThread(node, credential, signal, priority, includeBodies);
        result.push(thread);
      }
      const pageInfo = pageInfoFrom(connection);
      if (!pageInfo.hasNextPage) {
        return result;
      }
      after = requiredCursor(pageInfo.endCursor);
    }
    throw new GitHubRequestError("GitHub review-thread pagination exceeded its page limit", "malformedResponse");
  }
  async _toReviewThread(value, credential, signal, priority, includeBodies) {
    const thread = asObject4(value, "GitHub review thread was malformed");
    const id2 = requiredString5(thread, "id");
    const diffSide = stringProperty3(thread, "diffSide");
    const connection = objectProperty2(thread, "comments");
    const comments = arrayProperty3(connection, "nodes").map((item) => toGraphQLInlineComment(item, includeBodies, diffSide));
    let pageInfo = pageInfoFrom(connection);
    let after = pageInfo.endCursor;
    for (let page = 1; pageInfo.hasNextPage && page < maximumPaginationPages3; page++) {
      const response = await this._transport.graphql(
        credential.account,
        credential.token,
        this._endpoint.getGraphQlUri(),
        reviewThreadCommentsQuery,
        { threadId: id2, after: requiredCursor(after) },
        signal,
        priority
      );
      throwGraphQLErrors3(response.errors);
      const nextConnection = objectAt3(response.data, "node", "comments");
      comments.push(...arrayProperty3(nextConnection, "nodes").map((item) => toGraphQLInlineComment(item, includeBodies, diffSide)));
      pageInfo = pageInfoFrom(nextConnection);
      after = pageInfo.endCursor;
    }
    if (pageInfo.hasNextPage) {
      throw new GitHubRequestError("GitHub review-thread comment pagination exceeded its page limit", "malformedResponse");
    }
    return {
      id: id2,
      isResolved: booleanProperty3(thread, "isResolved") ?? false,
      isOutdated: booleanProperty3(thread, "isOutdated"),
      path: stringProperty3(thread, "path"),
      diffSide,
      line: numberProperty3(thread, "line"),
      originalLine: numberProperty3(thread, "originalLine"),
      comments
    };
  }
  async _fetchChecks(ref, core, credential, signal, priority, includeRequiredness, loadExpectedSuites, includeOptional) {
    const rollup = await this._fetchCheckRollupWithWorkflowNames(ref, core, credential, signal, priority, includeRequiredness, includeOptional);
    const expected = loadExpectedSuites ? await this._fetchExpectedCheckSuitesWhenPermitted(ref, core.headSha, credential, signal, priority) : { suites: [], complete: false };
    return {
      headSha: rollup.headSha,
      checks: rollup.checks,
      requirednessComplete: includeRequiredness,
      expectedSuites: expected.suites,
      expectedSuitesComplete: expected.complete
    };
  }
  /**
   * Loads the check rollup, dropping the workflow-name subselection for a
   * repository whose host refuses it so the rest of the checks stay readable.
   */
  async _fetchCheckRollupWithWorkflowNames(ref, core, credential, signal, priority, includeRequiredness, includeOptional) {
    const repositoryKey = `${ref.owner}/${ref.repo}`.toLowerCase();
    const includeWorkflowNames = !this._workflowNamesUnavailable.has(repositoryKey);
    try {
      return await this._fetchCheckRollup(ref, core, credential, signal, priority, includeRequiredness, includeOptional, includeWorkflowNames);
    } catch (error) {
      if (!includeWorkflowNames || !(error instanceof GitHubRequestError) || error.kind !== "authorization") {
        throw error;
      }
      this._workflowNamesUnavailable.add(repositoryKey);
      this._logService?.warn(`[PullRequestQueryService] Retrying checks for ${ref.owner}/${ref.repo}#${ref.number} without workflow names because GitHub refused them: ${error.message}`);
      return await this._fetchCheckRollup(ref, core, credential, signal, priority, includeRequiredness, includeOptional, false);
    }
  }
  /** Loads the expected check suites, reporting them absent and incomplete when the host refuses them. */
  async _fetchExpectedCheckSuitesWhenPermitted(ref, headSha, credential, signal, priority) {
    try {
      return { suites: await this._fetchExpectedCheckSuites(ref, headSha, credential, signal, priority), complete: true };
    } catch (error) {
      if (!(error instanceof GitHubRequestError) || error.kind !== "authorization") {
        throw error;
      }
      this._logService?.warn(`[PullRequestQueryService] Reporting expected check suites for ${ref.owner}/${ref.repo}#${ref.number} as unavailable because GitHub refused them: ${error.message}`);
      return { suites: [], complete: false };
    }
  }
  async _fetchCheckRollup(ref, core, credential, signal, priority, includeRequiredness, includeOptional, includeWorkflowNames) {
    const checks = [];
    let after;
    for (let page = 0; page < maximumPaginationPages3; page++) {
      const response = await this._transport.graphql(
        credential.account,
        credential.token,
        this._endpoint.getGraphQlUri(),
        checksQuery(includeRequiredness, includeWorkflowNames),
        { owner: ref.owner, repo: ref.repo, number: ref.number, after },
        signal,
        priority
      );
      throwGraphQLErrors3(response.errors);
      const pullRequest = objectAt3(response.data, "repository", "pullRequest");
      const observedHead = requiredString5(pullRequest, "headRefOid");
      if (observedHead !== core.headSha) {
        throw new GitHubRequestError("GitHub checks response was for an old pull request head", "unknown");
      }
      const commits = objectProperty2(pullRequest, "commits");
      const commitNode = firstObject(arrayProperty3(commits, "nodes"), "GitHub checks response did not contain the current commit");
      const commit = objectProperty2(commitNode, "commit");
      const rollup = optionalObjectProperty3(commit, "statusCheckRollup");
      if (!rollup) {
        return { headSha: observedHead, checks: [] };
      }
      const contexts = objectProperty2(rollup, "contexts");
      checks.push(...arrayProperty3(contexts, "nodes").map(toCheck));
      const pageInfo = pageInfoFrom(contexts);
      if (!pageInfo.hasNextPage) {
        return { headSha: observedHead, checks: filterChecks(checks, includeRequiredness, includeOptional) };
      }
      after = requiredCursor(pageInfo.endCursor);
    }
    throw new GitHubRequestError("GitHub check pagination exceeded its page limit", "malformedResponse");
  }
  async _fetchExpectedCheckSuites(ref, headSha, credential, signal, priority) {
    const suites = [];
    let after;
    for (let page = 0; page < maximumPaginationPages3; page++) {
      const response = await this._transport.graphql(
        credential.account,
        credential.token,
        this._endpoint.getGraphQlUri(),
        expectedCheckSuitesQuery,
        { owner: ref.owner, repo: ref.repo, headSha, after },
        signal,
        priority
      );
      throwGraphQLErrors3(response.errors);
      const commit = objectAt3(response.data, "repository", "object");
      if (requiredString5(commit, "oid") !== headSha) {
        throw new GitHubRequestError("GitHub expected check suites were for an old pull request head", "unknown");
      }
      const connection = objectProperty2(commit, "checkSuites");
      suites.push(...arrayProperty3(connection, "nodes").map(toCheckSuite));
      const pageInfo = pageInfoFrom(connection);
      if (!pageInfo.hasNextPage) {
        return suites;
      }
      after = requiredCursor(pageInfo.endCursor);
    }
    throw new GitHubRequestError("GitHub expected check-suite pagination exceeded its page limit", "malformedResponse");
  }
  async _fetchChecksFallback(ref, core, credential, signal, priority) {
    const checks = [];
    let url2 = this._restUrl(ref, `commits/${encodeURIComponent(core.headSha)}/check-runs?per_page=100`);
    for (let page = 0; url2 && page < maximumPaginationPages3; page++) {
      const response = await this._transport.rest(credential.account, credential.token, {
        method: "GET",
        url: url2,
        etag: true,
        priority
      }, signal);
      const body = asObject4(response.data, "GitHub check-runs response was malformed");
      checks.push(...arrayProperty3(body, "check_runs").map(toRestCheckRun));
      url2 = nextLink3(response.link);
    }
    if (url2) {
      throw new GitHubRequestError("GitHub check-run pagination exceeded its page limit", "malformedResponse");
    }
    const statuses = await this._transport.rest(credential.account, credential.token, {
      method: "GET",
      url: this._restUrl(ref, `commits/${encodeURIComponent(core.headSha)}/status?per_page=100`),
      etag: true,
      priority
    }, signal);
    const statusBody = asObject4(statuses.data, "GitHub status response was malformed");
    checks.push(...arrayProperty3(statusBody, "statuses").map(toRestStatus));
    return {
      headSha: core.headSha,
      checks,
      requirednessComplete: false,
      expectedSuites: [],
      expectedSuitesComplete: false
    };
  }
  async _fetchMergeability(ref, core, credential, signal, priority, mergeQueueSupported) {
    const response = await this._transport.graphql(
      credential.account,
      credential.token,
      this._endpoint.getGraphQlUri(),
      mergeabilityQuery(mergeQueueSupported),
      mergeQueueSupported ? { owner: ref.owner, repo: ref.repo, number: ref.number, baseBranch: core.baseRef } : { owner: ref.owner, repo: ref.repo, number: ref.number },
      signal,
      priority
    );
    throwGraphQLErrors3(response.errors);
    const repository = objectProperty2(asObject4(response.data, "GitHub mergeability response was malformed"), "repository");
    const pullRequest = objectProperty2(repository, "pullRequest");
    const allowedMergeMethods = [];
    if (booleanProperty3(repository, "mergeCommitAllowed")) {
      allowedMergeMethods.push("MERGE");
    }
    if (booleanProperty3(repository, "squashMergeAllowed")) {
      allowedMergeMethods.push("SQUASH");
    }
    if (booleanProperty3(repository, "rebaseMergeAllowed")) {
      allowedMergeMethods.push("REBASE");
    }
    const mergeQueueEntry = optionalObjectProperty3(pullRequest, "mergeQueueEntry");
    const mergeQueue = optionalObjectProperty3(repository, "mergeQueue");
    return {
      headSha: requiredString5(pullRequest, "headRefOid"),
      baseSha: requiredString5(pullRequest, "baseRefOid"),
      mergeable: enumProperty2(pullRequest, "mergeable", ["MERGEABLE", "CONFLICTING", "UNKNOWN"], "UNKNOWN"),
      mergeStateStatus: stringProperty3(pullRequest, "mergeStateStatus"),
      reviewDecision: stringProperty3(pullRequest, "reviewDecision"),
      viewerCanUpdate: booleanProperty3(pullRequest, "viewerCanUpdateBranch") ?? false,
      viewerCanMerge: canViewerMerge(repository),
      viewerCanEnableAutoMerge: booleanProperty3(pullRequest, "viewerCanEnableAutoMerge") ?? false,
      allowedMergeMethods,
      autoMergeEnabled: optionalObjectProperty3(pullRequest, "autoMergeRequest") !== void 0,
      mergeQueueEntryId: mergeQueueEntry ? stringProperty3(mergeQueueEntry, "id") : void 0,
      mergeQueueRequired: mergeQueueSupported && mergeQueue !== void 0,
      queueRequirementKnown: true
    };
  }
  async _fetchMergeabilityFallback(ref, core, credential, signal, priority) {
    const response = await this._transport.rest(credential.account, credential.token, {
      method: "GET",
      url: this._restUrl(ref, `pulls/${ref.number}`),
      unconditional: true,
      priority
    }, signal);
    const body = asObject4(response.data, "GitHub mergeability fallback response was malformed");
    const mergeable = booleanProperty3(body, "mergeable");
    return {
      headSha: core.headSha,
      baseSha: core.baseSha,
      mergeable: mergeable === true ? "MERGEABLE" : mergeable === false ? "CONFLICTING" : "UNKNOWN",
      mergeStateStatus: stringProperty3(body, "mergeable_state"),
      viewerCanUpdate: false,
      viewerCanMerge: false,
      viewerCanEnableAutoMerge: false,
      allowedMergeMethods: [],
      autoMergeEnabled: optionalObjectProperty3(body, "auto_merge") !== void 0,
      mergeQueueRequired: false,
      queueRequirementKnown: false
    };
  }
  async _fetchParticipants(ref, core, credential, signal, priority) {
    const values = await this._fetchRestArray(ref, credential, `issues/${ref.number}/timeline?per_page=100`, signal, priority);
    const participants = /* @__PURE__ */ new Map();
    if (core?.author) {
      addParticipant(participants, core.author, "author");
    }
    for (const value of values) {
      const item = asObject4(value, "GitHub timeline event was malformed");
      const actor = toActor2(optionalObjectProperty3(item, "actor") ?? optionalObjectProperty3(item, "user"));
      if (actor) {
        addParticipant(participants, actor, "commenter");
      }
      const reviewer = toActor2(optionalObjectProperty3(item, "requested_reviewer"));
      if (reviewer) {
        addParticipant(participants, reviewer, "reviewer");
      }
    }
    return {
      participants: [...participants.values()].map(({ actor, roles }) => ({ ...actor, roles: [...roles].sort() })).sort((left, right) => left.login.localeCompare(right.login))
    };
  }
  _restUrl(ref, route) {
    return `${this._endpoint.getApiBaseUri()}/repos/${encodeURIComponent(ref.owner)}/${encodeURIComponent(ref.repo)}/${route}`;
  }
};

var restCapabilities = {
  graphql: false,
  mergeQueue: false,
  internalMergeStatus: false,
  reviewThreads: false,
  checkContextRequiredness: false
};

function needsCapabilities(fragment) {
  return fragment === "reviewThreads" || fragment === "checks" || fragment === "mergeability";
}

var mergePermissions = /* @__PURE__ */ new Set(["ADMIN", "MAINTAIN", "WRITE"]);

function canViewerMerge(repository) {
  const permission = normalizedEnumProperty2(repository, "viewerPermission");
  return permission !== void 0 && mergePermissions.has(permission);
}

function toCore(value, ref) {
  const item = asObject4(value, "GitHub pull request response was malformed");
  const base = objectProperty2(item, "base");
  const head = objectProperty2(item, "head");
  const repository = objectProperty2(base, "repo");
  const repositoryNameWithOwner = requiredString5(repository, "full_name");
  const merged = booleanProperty3(item, "merged") === true || stringProperty3(item, "state") === "merged";
  return {
    id: idProperty3(item, "node_id"),
    repositoryId: idProperty3(repository, "node_id") ?? idProperty3(repository, "id"),
    repositoryNameWithOwner,
    number: numberProperty3(item, "number") ?? ref.number,
    title: requiredString5(item, "title"),
    body: nullableStringProperty3(item, "body"),
    url: requiredString5(item, "html_url"),
    state: merged ? "merged" : stringProperty3(item, "state") === "open" ? "open" : "closed",
    draft: booleanProperty3(item, "draft") ?? false,
    headSha: requiredString5(head, "sha"),
    headRef: requiredString5(head, "ref"),
    headRepositoryNameWithOwner: optionalObjectProperty3(head, "repo") ? stringProperty3(objectProperty2(head, "repo"), "full_name") : void 0,
    maintainerCanModify: booleanProperty3(item, "maintainer_can_modify") ?? false,
    baseSha: requiredString5(base, "sha"),
    baseRef: requiredString5(base, "ref"),
    author: toActor2(optionalObjectProperty3(item, "user"), stringProperty3(item, "author_association")),
    createdAt: stringProperty3(item, "created_at"),
    updatedAt: stringProperty3(item, "updated_at"),
    closedAt: nullableStringProperty3(item, "closed_at"),
    mergedAt: nullableStringProperty3(item, "merged_at")
  };
}

function toComment2(value, includeBody) {
  const item = asObject4(value, "GitHub issue comment was malformed");
  return {
    id: requiredId2(item, "id"),
    nodeId: idProperty3(item, "node_id"),
    author: toActor2(optionalObjectProperty3(item, "user"), stringProperty3(item, "author_association")),
    body: includeBody ? nullableStringProperty3(item, "body") : void 0,
    url: stringProperty3(item, "html_url"),
    createdAt: stringProperty3(item, "created_at"),
    updatedAt: stringProperty3(item, "updated_at")
  };
}

function toReview(value, includeBody) {
  const item = asObject4(value, "GitHub pull request review was malformed");
  return {
    id: requiredId2(item, "id"),
    nodeId: idProperty3(item, "node_id"),
    author: toActor2(optionalObjectProperty3(item, "user"), stringProperty3(item, "author_association")),
    state: stringProperty3(item, "state") ?? "UNKNOWN",
    body: includeBody ? nullableStringProperty3(item, "body") : void 0,
    commitId: stringProperty3(item, "commit_id"),
    submittedAt: stringProperty3(item, "submitted_at")
  };
}

function toInlineComment(value, includeBody) {
  const item = asObject4(value, "GitHub pull request inline comment was malformed");
  return {
    ...toComment2(value, includeBody),
    reviewId: idProperty3(item, "pull_request_review_id"),
    replyToId: idProperty3(item, "in_reply_to_id"),
    path: stringProperty3(item, "path"),
    line: numberProperty3(item, "line"),
    originalLine: numberProperty3(item, "original_line"),
    side: stringProperty3(item, "side"),
    commitId: stringProperty3(item, "commit_id"),
    originalCommitId: stringProperty3(item, "original_commit_id")
  };
}

function toGraphQLInlineComment(value, includeBody, diffSide) {
  const item = asObject4(value, "GitHub review-thread comment was malformed");
  const commit = optionalObjectProperty3(item, "commit");
  const originalCommit = optionalObjectProperty3(item, "originalCommit");
  return {
    id: requiredId2(item, "databaseId", "id"),
    nodeId: idProperty3(item, "id"),
    author: toActor2(optionalObjectProperty3(item, "author"), stringProperty3(item, "authorAssociation")),
    body: includeBody ? nullableStringProperty3(item, "body") : void 0,
    url: stringProperty3(item, "url"),
    createdAt: stringProperty3(item, "createdAt"),
    updatedAt: stringProperty3(item, "updatedAt"),
    path: stringProperty3(item, "path"),
    line: numberProperty3(item, "line"),
    originalLine: numberProperty3(item, "originalLine"),
    side: diffSide,
    commitId: commit ? stringProperty3(commit, "oid") : void 0,
    originalCommitId: originalCommit ? stringProperty3(originalCommit, "oid") : void 0
  };
}

function toCheck(value) {
  const item = asObject4(value, "GitHub check context was malformed");
  const type = requiredString5(item, "__typename");
  if (type === "CheckRun") {
    const suite = optionalObjectProperty3(item, "checkSuite");
    const workflowRun = suite ? optionalObjectProperty3(suite, "workflowRun") : void 0;
    const workflow = workflowRun ? optionalObjectProperty3(workflowRun, "workflow") : void 0;
    return {
      id: requiredId2(item, "databaseId"),
      type: "checkRun",
      name: requiredString5(item, "name"),
      status: normalizedEnumProperty2(item, "status"),
      conclusion: normalizedEnumProperty2(item, "conclusion"),
      required: booleanProperty3(item, "isRequired"),
      detailsUrl: stringProperty3(item, "detailsUrl"),
      workflowName: workflow ? stringProperty3(workflow, "name") : void 0
    };
  }
  return {
    id: requiredId2(item, "id"),
    type: "statusContext",
    name: requiredString5(item, "context"),
    status: normalizedEnumProperty2(item, "state"),
    required: booleanProperty3(item, "isRequired"),
    detailsUrl: stringProperty3(item, "targetUrl")
  };
}

function toRestCheckRun(value) {
  const item = asObject4(value, "GitHub REST check run was malformed");
  return {
    id: requiredId2(item, "id"),
    type: "checkRun",
    name: requiredString5(item, "name"),
    status: normalizedEnumProperty2(item, "status"),
    conclusion: normalizedEnumProperty2(item, "conclusion"),
    detailsUrl: stringProperty3(item, "details_url")
  };
}

function toRestStatus(value) {
  const item = asObject4(value, "GitHub REST status context was malformed");
  return {
    id: requiredId2(item, "id"),
    type: "statusContext",
    name: requiredString5(item, "context"),
    status: normalizedEnumProperty2(item, "state"),
    detailsUrl: stringProperty3(item, "target_url")
  };
}

function toCheckSuite(value) {
  const item = asObject4(value, "GitHub check suite was malformed");
  const app = optionalObjectProperty3(item, "app");
  const checkRuns = objectProperty2(item, "checkRuns");
  return {
    id: requiredId2(item, "id"),
    name: app ? stringProperty3(app, "name") ?? stringProperty3(app, "slug") ?? "unknown" : "unknown",
    status: normalizedEnumProperty2(item, "status"),
    conclusion: normalizedEnumProperty2(item, "conclusion"),
    checkRunsReported: (numberProperty3(checkRuns, "totalCount") ?? 0) > 0
  };
}

function filterChecks(checks, requirednessAvailable, includeOptional) {
  return includeOptional || !requirednessAvailable ? checks : checks.filter((check) => check.required !== false);
}

function toActor2(value, association) {
  if (!value) {
    return void 0;
  }
  const login = stringProperty3(value, "login");
  if (!login) {
    return void 0;
  }
  const id2 = idProperty3(value, "databaseId") ?? idProperty3(value, "id");
  return {
    ...id2 ? { id: id2 } : {},
    login,
    ...association ? { association } : {}
  };
}

function addParticipant(participants, actor, role) {
  const key = actor.id ?? actor.login.toLowerCase();
  let participant = participants.get(key);
  if (!participant) {
    participant = { actor: { ...actor, roles: [] }, roles: /* @__PURE__ */ new Set() };
    participants.set(key, participant);
  }
  participant.roles.add(role);
}

function throwGraphQLErrors3(errors) {
  if (errors.length === 0) {
    return;
  }
  const kinds = errors.map((error) => error.type?.toUpperCase());
  const kind = kinds.includes("RATE_LIMITED") ? "rateLimit" : kinds.some((type) => type === "FORBIDDEN" || type === "UNAUTHORIZED") ? "authorization" : kinds.some((type) => type?.includes("NOT_FOUND")) ? "notFound" : kinds.some((type) => type?.includes("VALIDATION")) ? "schema" : "server";
  throw new GitHubRequestError(
    `GitHub GraphQL request failed: ${errors.map((error) => error.message ?? error.type ?? "unknown error").join("; ")}`,
    kind,
    200,
    void 0,
    errors
  );
}

function nextLink3(link) {
  if (!link) {
    return void 0;
  }
  for (const part of link.split(",")) {
    const match2 = /^\s*<(?<url>[^>]+)>\s*;\s*rel="(?<rel>[^"]+)"/.exec(part);
    if (match2?.groups?.rel.split(/\s+/).includes("next")) {
      return match2.groups.url;
    }
  }
  return void 0;
}

function pageInfoFrom(connection) {
  const pageInfo = objectProperty2(connection, "pageInfo");
  return {
    hasNextPage: booleanProperty3(pageInfo, "hasNextPage") ?? false,
    endCursor: nullableStringProperty3(pageInfo, "endCursor")
  };
}

function requiredCursor(cursor) {
  if (!cursor) {
    throw new GitHubRequestError("GitHub pagination did not provide an end cursor", "malformedResponse");
  }
  return cursor;
}

function objectAt3(value, ...path) {
  let current = asObject4(value, "GitHub response was malformed");
  for (const part of path) {
    current = objectProperty2(current, part);
  }
  return current;
}

function firstObject(values, message) {
  if (values.length === 0) {
    throw new GitHubRequestError(message, "malformedResponse");
  }
  return asObject4(values[0], message);
}

function asObject4(value, message) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new GitHubRequestError(message, "malformedResponse");
  }
  return value;
}

function objectProperty2(value, key) {
  return asObject4(Reflect.get(value, key), `GitHub response property ${key} was malformed`);
}

function optionalObjectProperty3(value, key) {
  const property = Reflect.get(value, key);
  return property === null || property === void 0 ? void 0 : asObject4(property, `GitHub response property ${key} was malformed`);
}

function arrayProperty3(value, key) {
  const property = Reflect.get(value, key);
  if (!Array.isArray(property)) {
    throw new GitHubRequestError(`GitHub response property ${key} was not an array`, "malformedResponse");
  }
  return property;
}

function requiredString5(value, key) {
  const property = stringProperty3(value, key);
  if (property === void 0) {
    throw new GitHubRequestError(`GitHub response property ${key} was not a string`, "malformedResponse");
  }
  return property;
}

function stringProperty3(value, key) {
  const property = Reflect.get(value, key);
  return typeof property === "string" ? property : void 0;
}

function nullableStringProperty3(value, key) {
  const property = Reflect.get(value, key);
  return property === null ? void 0 : typeof property === "string" ? property : void 0;
}

function normalizedEnumProperty2(value, key) {
  return nullableStringProperty3(value, key)?.toUpperCase();
}

function numberProperty3(value, key) {
  const property = Reflect.get(value, key);
  return typeof property === "number" && Number.isFinite(property) ? property : void 0;
}

function booleanProperty3(value, key) {
  const property = Reflect.get(value, key);
  return typeof property === "boolean" ? property : void 0;
}

function idProperty3(value, key) {
  const property = Reflect.get(value, key);
  return typeof property === "string" || typeof property === "number" ? String(property) : void 0;
}

function requiredId2(value, ...keys) {
  for (const key of keys) {
    const id2 = idProperty3(value, key);
    if (id2) {
      return id2;
    }
  }
  throw new GitHubRequestError(`GitHub response did not contain ${keys.join(" or ")}`, "malformedResponse");
}

function enumProperty2(value, key, allowed, fallback) {
  const property = stringProperty3(value, key);
  return property && allowed.includes(property) ? property : fallback;
}
export { needsCapabilities, canViewerMerge, toCore, toComment2, toReview, toInlineComment, toGraphQLInlineComment, toCheck, toRestCheckRun, toRestStatus, toCheckSuite, filterChecks, toActor2, addParticipant, throwGraphQLErrors3, nextLink3, pageInfoFrom, requiredCursor, objectAt3, firstObject, asObject4, objectProperty2, optionalObjectProperty3, arrayProperty3, requiredString5, stringProperty3, nullableStringProperty3, normalizedEnumProperty2, numberProperty3, booleanProperty3, idProperty3, requiredId2, enumProperty2, maximumPaginationPages3, reviewThreadsQuery, reviewThreadCommentsQuery, checksQuery, expectedCheckSuitesQuery, mergeabilityQuery, PullRequestQueryService, restCapabilities, mergePermissions };
