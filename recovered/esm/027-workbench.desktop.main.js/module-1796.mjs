// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/github/common/pullRequestMutationService.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { systemGitHubScheduler } from "./module-1787.mjs";
import { PullRequestScheduler } from "./module-1794.mjs";
import { generateUuid } from "./module-0190.mjs";
import { GitHubRequestError } from "./module-1791.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";


// src/vs/platform/github/common/pullRequestMutationService.ts
var operationMarkerPrefix = "<!-- vscode-agent-host-operation:";

var operationIdPattern = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

var maximumPaginationPages2 = 100;

var maximumWorkflowLogBytes = 2 * 1024 * 1024;

var workflowLogTimeout = 3e4;

var mergePreparationLifetime = 5 * 6e4;

var addReviewThreadReplyMutation = `mutation AgentHostAddPullRequestReviewThreadReply($threadId: ID!, $body: String!) {
	addPullRequestReviewThreadReply(input: { pullRequestReviewThreadId: $threadId, body: $body }) {
		comment { id databaseId body url createdAt updatedAt author { login ... on User { databaseId } } }
	}
}`;

var resolveReviewThreadMutation = `mutation AgentHostResolvePullRequestReviewThread($threadId: ID!) {
	resolveReviewThread(input: { threadId: $threadId }) {
		thread { id isResolved }
	}
}`;

var enqueuePullRequestMutation = `mutation AgentHostEnqueuePullRequest($pullRequestId: ID!, $expectedHeadOid: GitObjectID!) {
	enqueuePullRequest(input: { pullRequestId: $pullRequestId, expectedHeadOid: $expectedHeadOid }) {
		mergeQueueEntry { id }
	}
}`;

var enableAutoMergeMutation = `mutation AgentHostEnablePullRequestAutoMerge($pullRequestId: ID!, $mergeMethod: PullRequestMergeMethod!) {
	enablePullRequestAutoMerge(input: { pullRequestId: $pullRequestId, mergeMethod: $mergeMethod }) {
		pullRequest { id }
	}
}`;

var disableAutoMergeMutation = `mutation AgentHostDisablePullRequestAutoMerge($pullRequestId: ID!) {
	disablePullRequestAutoMerge(input: { pullRequestId: $pullRequestId }) {
		pullRequest { id }
	}
}`;

var markReadyForReviewMutation = `mutation AgentHostMarkPullRequestReadyForReview($pullRequestId: ID!) {
	markPullRequestReadyForReview(input: { pullRequestId: $pullRequestId }) {
		pullRequest { id isDraft }
	}
}`;

var PullRequestMutationService = class extends Disposable {
  constructor(scheduler, _credentials, _transport, _resources, _endpoint, _logService) {
    super();
    this._credentials = _credentials;
    this._transport = _transport;
    this._resources = _resources;
    this._endpoint = _endpoint;
    this._logService = _logService;
    this._mutationTails = /* @__PURE__ */ new Map();
    this._preparations = /* @__PURE__ */ new Map();
    this._unconfirmedReruns = /* @__PURE__ */ new Map();
    this._clock = scheduler ?? systemGitHubScheduler;
    this._preparationScheduler = this._register(new PullRequestScheduler(this._clock));
    this._register(this._credentials.onDidInvalidate((event) => this._handleCredentialInvalidation(event)));
  }
  createPullRequest(ref, options3, signal) {
    return this._serializeRepository(ref, "createPullRequest", async () => {
      const created = await this._withCredential(ref, signal, async (credential, combinedSignal) => {
        const response = await this._transport.rest(credential.account, credential.token, {
          method: "POST",
          url: this._restUrl(ref, "pulls"),
          body: {
            title: options3.title,
            body: options3.body,
            head: options3.head,
            base: options3.base,
            draft: options3.draft
          },
          priority: "mutation"
        }, combinedSignal);
        const value2 = asObject2(response.data, "GitHub create pull request response was malformed");
        const number = requiredNumber2(value2, "number");
        return {
          ref: { ...ref, number },
          id: idProperty2(value2, "node_id"),
          url: requiredString2(value2, "html_url"),
          createdAt: stringProperty2(value2, "created_at")
        };
      });
      return created;
    });
  }
  enableAutoMerge(ref, options3, signal) {
    return this._serializeRepository(ref, "enableAutoMerge", async () => {
      await this._withCredential(ref, signal, async (credential, combinedSignal) => {
        const response = await this._transport.graphql(
          credential.account,
          credential.token,
          this._endpoint.getGraphQlUri(),
          enableAutoMergeMutation,
          { pullRequestId: options3.pullRequestId, mergeMethod: options3.method },
          combinedSignal,
          "mutation"
        );
        throwGraphQLErrors2(response.errors);
      });
    });
  }
  disableAutoMerge(ref, options3, signal) {
    return this._serialize(ref, "disableAutoMerge", async () => {
      await this._pullRequestNodeMutation(ref, options3, disableAutoMergeMutation, signal);
      this._resources.invalidatePullRequest(ref, ["mergeability"]);
    });
  }
  markReadyForReview(ref, options3, signal) {
    return this._serialize(ref, "markReadyForReview", async () => {
      await this._pullRequestNodeMutation(ref, options3, markReadyForReviewMutation, signal);
      this._resources.invalidatePullRequest(ref, ["core", "mergeability"]);
    });
  }
  addComment(ref, options3, signal) {
    return this._serialize(ref, "addComment", () => this._addComment(ref, options3, signal));
  }
  replyToThread(ref, options3, signal) {
    return this._serialize(ref, "replyToThread", () => this._replyToThread(ref, options3, signal));
  }
  resolveThread(ref, threadId, signal) {
    return this._serialize(ref, "resolveThread", async () => {
      await this._resolveThread(ref, threadId, signal);
      this._resources.invalidatePullRequest(ref, ["reviewThreads"]);
    });
  }
  replyAndResolveThread(ref, options3, signal) {
    return this._serialize(ref, "replyAndResolveThread", async () => {
      const reply = await this._replyToThread(ref, options3, signal);
      if (reply.outcome === "indeterminate" || !options3.resolve) {
        return { reply, resolved: false };
      }
      try {
        await this._resolveThread(ref, options3.threadId, signal);
        this._resources.invalidatePullRequest(ref, ["reviewThreads"]);
        return { reply, resolved: true };
      } catch (error) {
        return { reply, resolved: false, resolveError: toFragmentError2(error) };
      }
    });
  }
  listWorkflowRuns(ref, headSha, signal) {
    return this._withCredential(ref, signal, async (credential, combinedSignal) => {
      const values = await this._fetchRestArray(
        ref,
        credential,
        `actions/runs?head_sha=${encodeURIComponent(headSha)}&per_page=100`,
        combinedSignal,
        "workflow_runs"
      );
      return values.map(toWorkflowRun);
    });
  }
  listWorkflowJobs(ref, runId, signal) {
    return this._withCredential(ref, signal, async (credential, combinedSignal) => {
      const values = await this._fetchRestArray(
        ref,
        credential,
        `actions/runs/${encodeURIComponent(runId)}/jobs?per_page=100`,
        combinedSignal,
        "jobs"
      );
      return values.map((value2) => toWorkflowJob(value2, runId));
    });
  }
  listCheckAnnotations(ref, checkRunId, signal) {
    return this._withCredential(ref, signal, async (credential, combinedSignal) => {
      const values = await this._fetchRestArray(
        ref,
        credential,
        `check-runs/${encodeURIComponent(checkRunId)}/annotations?per_page=100`,
        combinedSignal
      );
      return values.map(toCheckAnnotation);
    });
  }
  downloadWorkflowJobLog(ref, jobId, signal) {
    return this._withCredential(ref, signal, async (credential, combinedSignal) => {
      const response = await this._transport.download(credential.account, credential.token, {
        url: this._restUrl(ref, `actions/jobs/${encodeURIComponent(jobId)}/logs`),
        maximumBytes: maximumWorkflowLogBytes,
        timeout: workflowLogTimeout,
        priority: "interactive"
      }, combinedSignal);
      return {
        text: redactWorkflowLog(response.text),
        truncated: response.truncated
      };
    });
  }
  rerunWorkflow(ref, options3, signal) {
    return this._serialize(ref, "rerunWorkflow", async () => {
      validateOperationId(options3.operationId);
      const rerunKey = `${pullRequestMutationKey(ref)}\0${options3.runId}`;
      const unconfirmed = this._unconfirmedReruns.get(rerunKey);
      if (unconfirmed) {
        const run = await this._getWorkflowRun(ref, options3.runId, signal);
        if (rerunConfirmed(run, unconfirmed.expectedRunAttempt)) {
          this._unconfirmedReruns.delete(rerunKey);
          this._resources.invalidatePullRequest(ref, ["checks"]);
          return { outcome: "reconciled", value: run };
        }
        if (!rerunProvenAbsent(run, unconfirmed.expectedRunAttempt)) {
          return { outcome: "indeterminate", value: run };
        }
        this._unconfirmedReruns.delete(rerunKey);
      }
      try {
        await this._withCredential(ref, signal, async (credential, combinedSignal) => {
          await this._transport.rest(credential.account, credential.token, {
            method: "POST",
            url: this._restUrl(
              ref,
              `actions/runs/${encodeURIComponent(options3.runId)}/${options3.failedJobsOnly ? "rerun-failed-jobs" : "rerun"}`
            ),
            priority: "mutation"
          }, combinedSignal);
        });
        this._resources.invalidatePullRequest(ref, ["checks"]);
        return { outcome: "succeeded" };
      } catch (error) {
        if (!isAmbiguousMutationError(error)) {
          throw error;
        }
        this._unconfirmedReruns.set(rerunKey, {
          operationId: options3.operationId,
          expectedRunAttempt: options3.expectedRunAttempt
        });
        const run = await this._tryGetWorkflowRun(ref, options3.runId, signal);
        if (run && rerunConfirmed(run, options3.expectedRunAttempt)) {
          this._unconfirmedReruns.delete(rerunKey);
          this._resources.invalidatePullRequest(ref, ["checks"]);
          return { outcome: "reconciled", value: run };
        }
        return { outcome: "indeterminate", value: run };
      }
    });
  }
  updateBranch(ref, options3, signal) {
    return this._serialize(ref, "updateBranch", async () => {
      if (!options3.expectedHeadSha) {
        throw new Error("A branch update requires the expected head SHA");
      }
      await this._withCredential(ref, signal, async (credential, combinedSignal) => {
        await this._transport.rest(credential.account, credential.token, {
          method: "PUT",
          url: this._restUrl(ref, `pulls/${ref.number}/update-branch`),
          body: { expected_head_sha: options3.expectedHeadSha },
          priority: "mutation"
        }, combinedSignal);
      });
      this._resources.invalidatePullRequest(ref, ["core", "checks", "mergeability"]);
    });
  }
  prepareMerge(ref, expectedHeadSha, signal) {
    return this._serialize(ref, "prepareMerge", async () => {
      if (!expectedHeadSha) {
        throw new Error("Merge preparation requires an expected head SHA");
      }
      const subscription = this._resources.subscribePullRequest(ref, {
        priority: "interactive",
        conversation: { topLevelComments: true, submittedReviews: true, reviewThreads: true },
        checks: { required: true, includeOptional: true },
        mergeability: true
      });
      const cancellation = cancellationTokenFromSignal(signal);
      try {
        await subscription.refresh("core", cancellation.tokenSource.token, { authoritative: true });
        await Promise.all([
          subscription.refresh("checks", cancellation.tokenSource.token, { authoritative: true }),
          subscription.refresh("submittedReviews", cancellation.tokenSource.token, { authoritative: true }),
          subscription.refresh("reviewThreads", cancellation.tokenSource.token, { authoritative: true }),
          subscription.refresh("mergeability", cancellation.tokenSource.token, { authoritative: true })
        ]);
        await subscription.refresh("topLevelComments", cancellation.tokenSource.token, { authoritative: true });
        if (signal.aborted) {
          throw signal.reason ?? new Error("Merge preparation was cancelled");
        }
        const snapshot = subscription.resource.snapshot.get();
        validateMergeGateSnapshot(snapshot, expectedHeadSha);
        const token = generateUuid();
        const value2 = {
          token,
          ref: snapshot.ref,
          expectedHeadSha,
          resourceGeneration: snapshot.generation,
          headGeneration: snapshot.headGeneration,
          snapshot
        };
        this._preparations.set(token, { value: value2, resource: subscription.resource, subscription });
        this._preparationScheduler.schedule(token, this._clock.now() + mergePreparationLifetime, () => {
          const expired = this._preparations.get(token);
          if (expired) {
            expired.subscription.dispose();
            this._preparations.delete(token);
          }
        });
        return value2;
      } catch (error) {
        subscription.dispose();
        if (signal.aborted) {
          throw signal.reason ?? error;
        }
        throw error;
      } finally {
        cancellation.dispose();
      }
    });
  }
  merge(preparation, options3, signal) {
    return this._serialize(preparation.ref, "merge", async () => {
      const state = this._takePreparation(preparation);
      try {
        validateAuthorization(options3.authorization);
        const snapshot = state.resource.snapshot.get();
        validatePreparationState(preparation, snapshot);
        validateMergeGateSnapshot(snapshot, preparation.expectedHeadSha);
        const mergeability = snapshot.mergeability.value;
        if (!mergeability.queueRequirementKnown || mergeability.mergeQueueRequired) {
          throw new GitHubRequestError("Direct merge is unavailable because merge-queue requirements do not permit it", "validation");
        }
        if (!mergeability.allowedMergeMethods.includes(options3.method)) {
          throw new GitHubRequestError(`Merge method ${options3.method} is not allowed`, "validation");
        }
        try {
          const result = await this._withCredential(preparation.ref, signal, async (credential, combinedSignal) => {
            const response = await this._transport.rest(credential.account, credential.token, {
              method: "PUT",
              url: this._restUrl(preparation.ref, `pulls/${preparation.ref.number}/merge`),
              body: {
                sha: preparation.expectedHeadSha,
                merge_method: options3.method.toLowerCase(),
                commit_title: options3.title,
                commit_message: options3.message
              },
              priority: "mutation"
            }, combinedSignal);
            return toMergeResult(response.data);
          });
          this._resources.invalidatePullRequest(preparation.ref, ["core", "checks", "mergeability"]);
          return { outcome: "succeeded", sha: result.sha, message: result.message };
        } catch (error) {
          if (!isAmbiguousMutationError(error)) {
            throw error;
          }
          this._resources.invalidatePullRequest(preparation.ref, ["core"]);
          await state.subscription.refresh("core", void 0, { authoritative: true });
          const reconciled = state.resource.snapshot.get().core.value;
          if (reconciled?.state === "merged") {
            return { outcome: "reconciled", message: "Pull request was merged" };
          }
          throw error;
        }
      } finally {
        state.subscription.dispose();
      }
    });
  }
  enqueue(preparation, authorization, signal) {
    return this._serialize(preparation.ref, "enqueue", async () => {
      const state = this._takePreparation(preparation);
      try {
        validateAuthorization(authorization);
        const snapshot = state.resource.snapshot.get();
        validatePreparationState(preparation, snapshot);
        validateMergeGateSnapshot(snapshot, preparation.expectedHeadSha);
        const mergeability = snapshot.mergeability.value;
        if (!mergeability.queueRequirementKnown || !mergeability.mergeQueueRequired) {
          throw new GitHubRequestError("Merge queue is not authoritatively required for this pull request", "validation");
        }
        if (mergeability.mergeQueueEntryId) {
          return { outcome: "alreadyQueued", mergeQueueEntryId: mergeability.mergeQueueEntryId };
        }
        const pullRequestId = snapshot.core.value?.id;
        if (!pullRequestId) {
          throw new GitHubRequestError("Pull request node ID is required for merge queue enrollment", "malformedResponse");
        }
        try {
          const entryId = await this._enqueuePullRequest(
            preparation.ref,
            pullRequestId,
            preparation.expectedHeadSha,
            signal
          );
          this._resources.invalidatePullRequest(preparation.ref, ["core", "mergeability"]);
          return { outcome: "succeeded", mergeQueueEntryId: entryId };
        } catch (error) {
          if (!isAmbiguousMutationError(error)) {
            throw error;
          }
          this._resources.invalidatePullRequest(preparation.ref, ["mergeability"]);
          await state.subscription.refresh("mergeability", void 0, { authoritative: true });
          const entryId = state.resource.snapshot.get().mergeability.value?.mergeQueueEntryId;
          if (entryId) {
            return { outcome: "reconciled", mergeQueueEntryId: entryId };
          }
          throw error;
        }
      } finally {
        state.subscription.dispose();
      }
    });
  }
  dispose() {
    this._clearPreparations();
    this._mutationTails.clear();
    this._unconfirmedReruns.clear();
    super.dispose();
  }
  async _addComment(ref, options3, signal) {
    const body = withOperationMarker(options3.body, options3.operationId);
    try {
      const value2 = await this._postComment(ref, body, signal);
      this._resources.invalidatePullRequest(ref, ["topLevelComments"]);
      return { outcome: "succeeded", value: value2 };
    } catch (error) {
      if (!isAmbiguousMutationError(error)) {
        throw error;
      }
      const reconciled = await this._reconcileComment(ref, "topLevelComments", options3.operationId, signal);
      if (reconciled.proven) {
        return reconciled.value ? { outcome: "reconciled", value: reconciled.value } : this._retryComment(ref, body, signal);
      }
      return { outcome: "indeterminate" };
    }
  }
  async _replyToThread(ref, options3, signal) {
    const body = withOperationMarker(options3.body, options3.operationId);
    try {
      const value2 = await this._postThreadReply(ref, options3.threadId, body, signal);
      this._resources.invalidatePullRequest(ref, ["reviewThreads", "inlineComments"]);
      return { outcome: "succeeded", value: value2 };
    } catch (error) {
      if (!isAmbiguousMutationError(error)) {
        throw error;
      }
      const reconciled = await this._reconcileComment(ref, "reviewThreads", options3.operationId, signal);
      if (reconciled.proven) {
        if (reconciled.value) {
          this._resources.invalidatePullRequest(ref, ["inlineComments"]);
          return { outcome: "reconciled", value: reconciled.value };
        }
        return this._retryThreadReply(ref, options3.threadId, body, signal);
      }
      return { outcome: "indeterminate" };
    }
  }
  async _retryComment(ref, body, signal) {
    try {
      const value2 = await this._postComment(ref, body, signal);
      this._resources.invalidatePullRequest(ref, ["topLevelComments"]);
      return { outcome: "succeeded", value: value2 };
    } catch (error) {
      if (isAmbiguousMutationError(error)) {
        return { outcome: "indeterminate" };
      }
      throw error;
    }
  }
  async _retryThreadReply(ref, threadId, body, signal) {
    try {
      const value2 = await this._postThreadReply(ref, threadId, body, signal);
      this._resources.invalidatePullRequest(ref, ["reviewThreads", "inlineComments"]);
      return { outcome: "succeeded", value: value2 };
    } catch (error) {
      if (isAmbiguousMutationError(error)) {
        return { outcome: "indeterminate" };
      }
      throw error;
    }
  }
  _postComment(ref, body, signal) {
    return this._withCredential(ref, signal, async (credential, combinedSignal) => {
      const response = await this._transport.rest(credential.account, credential.token, {
        method: "POST",
        url: this._restUrl(ref, `issues/${ref.number}/comments`),
        body: { body },
        priority: "mutation"
      }, combinedSignal);
      return toComment(response.data);
    });
  }
  _postThreadReply(ref, threadId, body, signal) {
    return this._withCredential(ref, signal, async (credential, combinedSignal) => {
      const response = await this._transport.graphql(
        credential.account,
        credential.token,
        this._endpoint.getGraphQlUri(),
        addReviewThreadReplyMutation,
        { threadId, body },
        combinedSignal,
        "mutation"
      );
      throwGraphQLErrors2(response.errors);
      return toGraphQLComment(objectAt2(response.data, "addPullRequestReviewThreadReply", "comment"));
    });
  }
  _resolveThread(ref, threadId, signal) {
    return this._withCredential(ref, signal, async (credential, combinedSignal) => {
      const response = await this._transport.graphql(
        credential.account,
        credential.token,
        this._endpoint.getGraphQlUri(),
        resolveReviewThreadMutation,
        { threadId },
        combinedSignal,
        "mutation"
      );
      throwGraphQLErrors2(response.errors);
      const thread = objectAt2(response.data, "resolveReviewThread", "thread");
      if (booleanProperty2(thread, "isResolved") !== true) {
        throw new GitHubRequestError("GitHub did not confirm review-thread resolution", "malformedResponse");
      }
    });
  }
  async _reconcileComment(ref, fragment, operationId, signal) {
    const subscription = this._resources.subscribePullRequest(ref, {
      priority: "interactive",
      conversation: fragment === "topLevelComments" ? { topLevelComments: true, includeBodies: true } : { reviewThreads: true, includeBodies: true }
    });
    try {
      try {
        await subscription.refresh(fragment, void 0, { authoritative: true });
      } catch {
        return { proven: false };
      }
      const marker = operationMarker(operationId);
      if (fragment === "topLevelComments") {
        const state2 = subscription.resource.snapshot.get().topLevelComments;
        if (state2.status !== "ready" || !state2.complete || !state2.value) {
          return { proven: false };
        }
        return { proven: true, value: state2.value.find((comment) => comment.body?.includes(marker)) };
      }
      const state = subscription.resource.snapshot.get().reviewThreads;
      if (state.status !== "ready" || !state.complete || !state.value) {
        return { proven: false };
      }
      for (const thread of state.value) {
        const comment = thread.comments.find((candidate) => candidate.body?.includes(marker));
        if (comment) {
          return { proven: true, value: comment };
        }
      }
      return { proven: true };
    } finally {
      subscription.dispose();
    }
  }
  async _getWorkflowRun(ref, runId, signal) {
    return this._withCredential(ref, signal, async (credential, combinedSignal) => {
      const response = await this._transport.rest(credential.account, credential.token, {
        method: "GET",
        url: this._restUrl(ref, `actions/runs/${encodeURIComponent(runId)}`),
        etag: false,
        unconditional: true,
        priority: "mutationReconciliation"
      }, combinedSignal);
      return toWorkflowRun(response.data);
    });
  }
  async _tryGetWorkflowRun(ref, runId, signal) {
    try {
      return await this._getWorkflowRun(ref, runId, signal);
    } catch {
      return void 0;
    }
  }
  async _enqueuePullRequest(ref, pullRequestId, expectedHeadOid, signal) {
    return this._withCredential(ref, signal, async (credential, combinedSignal) => {
      const response = await this._transport.graphql(
        credential.account,
        credential.token,
        this._endpoint.getGraphQlUri(),
        enqueuePullRequestMutation,
        { pullRequestId, expectedHeadOid },
        combinedSignal,
        "mutation"
      );
      throwGraphQLErrors2(response.errors);
      return requiredString2(objectAt2(response.data, "enqueuePullRequest", "mergeQueueEntry"), "id");
    });
  }
  async _fetchRestArray(ref, credential, route, signal, arrayPropertyName) {
    const values = [];
    let url = this._restUrl(ref, route);
    for (let page = 0; url && page < maximumPaginationPages2; page++) {
      const response = await this._transport.rest(credential.account, credential.token, {
        method: "GET",
        url,
        etag: true,
        priority: "interactive"
      }, signal);
      const pageValues = arrayPropertyName ? arrayProperty2(asObject2(response.data, "GitHub paginated response was malformed"), arrayPropertyName) : asArray3(response.data, "GitHub paginated response was not an array");
      values.push(...pageValues);
      url = nextLink2(response.link);
    }
    if (url) {
      throw new GitHubRequestError("GitHub pagination exceeded its page limit", "malformedResponse");
    }
    return values;
  }
  async _pullRequestNodeMutation(ref, options3, mutation, signal) {
    if (!options3.pullRequestId) {
      throw new GitHubRequestError("Pull request node ID is required for this mutation", "validation");
    }
    await this._withCredential(ref, signal, async (credential, combinedSignal) => {
      const response = await this._transport.graphql(
        credential.account,
        credential.token,
        this._endpoint.getGraphQlUri(),
        mutation,
        { pullRequestId: options3.pullRequestId },
        combinedSignal,
        "mutation"
      );
      throwGraphQLErrors2(response.errors);
    });
  }
  async _withCredential(ref, signal, task) {
    const credential = await this._credentials.getCredential(signal);
    if (!sameAccount3(ref, credential)) {
      throw new GitHubRequestError("Pull request account does not match the current GitHub credential", "authentication");
    }
    try {
      return await task(credential, AbortSignal.any([signal, credential.signal]));
    } catch (error) {
      this._credentials.handleRequestError(credential, error);
      throw error;
    }
  }
  _takePreparation(preparation) {
    const state = this._preparations.get(preparation.token);
    if (!state || state.value !== preparation) {
      throw new GitHubRequestError("Merge preparation is invalid or has already been consumed", "validation");
    }
    this._preparations.delete(preparation.token);
    this._preparationScheduler.cancel(preparation.token);
    return state;
  }
  _serialize(ref, operation, task) {
    const key3 = pullRequestMutationKey(ref);
    const previous = this._mutationTails.get(key3) ?? Promise.resolve();
    const run = () => this._runMutation(operation, `${ref.owner}/${ref.repo}#${ref.number}`, task);
    const result = previous.then(run, run);
    const tail2 = result.then(() => void 0, () => void 0);
    this._mutationTails.set(key3, tail2);
    void tail2.then(() => {
      if (this._mutationTails.get(key3) === tail2) {
        this._mutationTails.delete(key3);
      }
    });
    return result;
  }
  _serializeRepository(ref, operation, task) {
    const key3 = [
      ref.host.toLowerCase(),
      ref.accountId,
      ref.owner.toLowerCase(),
      ref.repo.toLowerCase()
    ].join("\0");
    const previous = this._mutationTails.get(key3) ?? Promise.resolve();
    const run = () => this._runMutation(operation, `${ref.owner}/${ref.repo}`, task);
    const result = previous.then(run, run);
    const tail2 = result.then(() => void 0, () => void 0);
    this._mutationTails.set(key3, tail2);
    void tail2.then(() => {
      if (this._mutationTails.get(key3) === tail2) {
        this._mutationTails.delete(key3);
      }
    });
    return result;
  }
  async _runMutation(operation, target, task) {
    const startedAt = this._clock.now();
    this._logService?.debug(`[PullRequestMutationService] ${operation} started for ${target}`);
    try {
      const result = await task();
      this._logService?.debug(`[PullRequestMutationService] ${operation} completed for ${target} in ${this._clock.now() - startedAt}ms`);
      return result;
    } catch (error) {
      this._logService?.debug(`[PullRequestMutationService] ${operation} failed for ${target} after ${this._clock.now() - startedAt}ms (${mutationErrorKind(error)})`);
      throw error;
    }
  }
  _handleCredentialInvalidation(event) {
    if (this._preparations.size > 0 || this._unconfirmedReruns.size > 0) {
      this._logService?.debug(`[PullRequestMutationService] Clearing mutation reconciliation state after credential invalidation (${event.reason})`);
    }
    for (const [token, preparation] of this._preparations) {
      if (!event.credential || sameAccount3(preparation.value.ref, event.credential)) {
        preparation.subscription.dispose();
        this._preparations.delete(token);
        this._preparationScheduler.cancel(token);
      }
    }
    this._unconfirmedReruns.clear();
  }
  _clearPreparations() {
    for (const preparation of this._preparations.values()) {
      preparation.subscription.dispose();
    }
    this._preparations.clear();
    this._preparationScheduler.clear();
  }
  _restUrl(ref, route) {
    return `${this._endpoint.getApiBaseUri()}/repos/${encodeURIComponent(ref.owner)}/${encodeURIComponent(ref.repo)}/${route}`;
  }
};

function mutationErrorKind(error) {
  if (error instanceof GitHubRequestError) {
    return `${error.kind}${error.statusCode === void 0 ? "" : `:${error.statusCode}`}`;
  }
  return error instanceof Error ? error.name : typeof error;
}

function withOperationMarker(body, operationId) {
  validateOperationId(operationId);
  return `${body}

${operationMarker(operationId)}`;
}

function operationMarker(operationId) {
  return `${operationMarkerPrefix}${operationId} -->`;
}

function validateOperationId(operationId) {
  if (!operationIdPattern.test(operationId)) {
    throw new Error("GitHub mutation operation ID must be a stable identifier of at most 128 characters");
  }
}

function validateAuthorization(authorization) {
  if (authorization.confirmed !== true || !authorization.authorizationId) {
    throw new GitHubRequestError("Persisted merge authorization has not been confirmed", "authorization");
  }
}

function validatePreparationState(preparation, snapshot) {
  if (snapshot.generation !== preparation.resourceGeneration || snapshot.headGeneration !== preparation.headGeneration || snapshot.core.value?.headSha !== preparation.expectedHeadSha) {
    throw new GitHubRequestError("Merge preparation was invalidated by newer pull request state", "validation");
  }
}

function validateMergeGateSnapshot(snapshot, expectedHeadSha) {
  const core2 = snapshot.core;
  if (core2.status !== "ready" || !core2.complete || !core2.value) {
    throw new GitHubRequestError("Pull request core state is incomplete", "validation");
  }
  if (core2.value.state !== "open" || core2.value.draft) {
    throw new GitHubRequestError("Pull request must be open and non-draft", "validation");
  }
  if (core2.value.headSha !== expectedHeadSha) {
    throw new GitHubRequestError("Pull request head changed during merge preparation", "validation");
  }
  requireCompleteHeadFragment(snapshot, "checks", expectedHeadSha);
  requireCompleteFragment(snapshot, "submittedReviews");
  requireCompleteFragment(snapshot, "reviewThreads");
  requireCompleteHeadFragment(snapshot, "mergeability", expectedHeadSha);
}

function requireCompleteFragment(snapshot, fragment) {
  const state = snapshot[fragment];
  if (state.status !== "ready" || !state.complete || !state.value) {
    throw new GitHubRequestError(`Pull request ${fragment} state is incomplete`, "validation");
  }
}

function requireCompleteHeadFragment(snapshot, fragment, expectedHeadSha) {
  const state = snapshot[fragment];
  if (state.status !== "ready" || !state.complete || !state.value || state.headSha !== expectedHeadSha) {
    throw new GitHubRequestError(`Pull request ${fragment} state is incomplete or stale`, "validation");
  }
}

function rerunConfirmed(run, expectedRunAttempt) {
  return run.runAttempt > expectedRunAttempt || run.runAttempt === expectedRunAttempt + 1 && (run.status === "QUEUED" || run.status === "IN_PROGRESS");
}

function rerunProvenAbsent(run, expectedRunAttempt) {
  return run.runAttempt === expectedRunAttempt && run.status === "COMPLETED";
}

function isAmbiguousMutationError(error) {
  return error instanceof GitHubRequestError && (error.kind === "network" || error.kind === "server");
}

function sameAccount3(ref, credential) {
  return ref.host.toLowerCase() === credential.account.host.toLowerCase() && ref.accountId === credential.account.accountId;
}

function pullRequestMutationKey(ref) {
  return [
    ref.host.toLowerCase(),
    ref.accountId,
    ref.owner.toLowerCase(),
    ref.repo.toLowerCase(),
    ref.number
  ].join("\0");
}

function toComment(value2) {
  const item = asObject2(value2, "GitHub comment response was malformed");
  return {
    id: requiredId(item, "id"),
    nodeId: idProperty2(item, "node_id"),
    body: nullableStringProperty2(item, "body"),
    url: stringProperty2(item, "html_url"),
    createdAt: stringProperty2(item, "created_at"),
    updatedAt: stringProperty2(item, "updated_at"),
    author: toActor(optionalObjectProperty2(item, "user"))
  };
}

function toGraphQLComment(value2) {
  const item = asObject2(value2, "GitHub reply response was malformed");
  return {
    id: requiredId(item, "databaseId", "id"),
    nodeId: idProperty2(item, "id"),
    body: nullableStringProperty2(item, "body"),
    url: stringProperty2(item, "url"),
    createdAt: stringProperty2(item, "createdAt"),
    updatedAt: stringProperty2(item, "updatedAt"),
    author: toActor(optionalObjectProperty2(item, "author"))
  };
}

function toWorkflowRun(value2) {
  const item = asObject2(value2, "GitHub workflow run was malformed");
  return {
    id: requiredId(item, "id"),
    name: requiredString2(item, "name"),
    event: stringProperty2(item, "event"),
    status: normalizedEnumProperty(item, "status"),
    conclusion: normalizedEnumProperty(item, "conclusion"),
    headSha: requiredString2(item, "head_sha"),
    runAttempt: numberProperty2(item, "run_attempt") ?? 1,
    url: stringProperty2(item, "html_url"),
    createdAt: stringProperty2(item, "created_at"),
    updatedAt: stringProperty2(item, "updated_at")
  };
}

function toWorkflowJob(value2, runId) {
  const item = asObject2(value2, "GitHub workflow job was malformed");
  return {
    id: requiredId(item, "id"),
    runId,
    name: requiredString2(item, "name"),
    status: normalizedEnumProperty(item, "status"),
    conclusion: normalizedEnumProperty(item, "conclusion"),
    checkRunId: idProperty2(item, "check_run_id"),
    url: stringProperty2(item, "html_url"),
    startedAt: stringProperty2(item, "started_at"),
    completedAt: stringProperty2(item, "completed_at")
  };
}

function toCheckAnnotation(value2) {
  const item = asObject2(value2, "GitHub check annotation was malformed");
  return {
    path: requiredString2(item, "path"),
    startLine: numberProperty2(item, "start_line") ?? 0,
    endLine: numberProperty2(item, "end_line") ?? numberProperty2(item, "start_line") ?? 0,
    level: requiredString2(item, "annotation_level"),
    message: requiredString2(item, "message"),
    title: nullableStringProperty2(item, "title"),
    rawDetails: nullableStringProperty2(item, "raw_details")
  };
}

function toMergeResult(value2) {
  const item = asObject2(value2, "GitHub merge response was malformed");
  if (booleanProperty2(item, "merged") !== true) {
    throw new GitHubRequestError(stringProperty2(item, "message") ?? "GitHub rejected the merge", "validation");
  }
  return {
    sha: stringProperty2(item, "sha"),
    message: stringProperty2(item, "message")
  };
}

function redactWorkflowLog(value2) {
  const masks = [...value2.matchAll(/::add-mask::(?<secret>[^\r\n]+)/g)].map((match2) => match2.groups?.secret).filter((secret) => Boolean(secret));
  let redacted = value2.replace(/::add-mask::[^\r\n]+/g, "::add-mask::***");
  for (const secret of masks) {
    redacted = redacted.split(secret).join("***");
  }
  return redacted.replace(/\b(?:github_pat_|gh[pousr]_)[A-Za-z0-9_]{16,}\b/g, "***").replace(/(?<prefix>\b(?:authorization|token|secret|password)\s*[:=]\s*)(?<value>[^\s,;]+)/gi, "$<prefix>***");
}

function throwGraphQLErrors2(errors) {
  if (errors.length === 0) {
    return;
  }
  const types = errors.map((error) => error.type?.toUpperCase());
  const kind = types.includes("RATE_LIMITED") ? "rateLimit" : types.some((type) => type === "FORBIDDEN" || type === "UNAUTHORIZED") ? "authorization" : types.some((type) => type?.includes("NOT_FOUND")) ? "notFound" : types.some((type) => type?.includes("VALIDATION") || type?.includes("UNPROCESSABLE")) ? "validation" : types.every((type) => type === void 0) ? "schema" : "unknown";
  throw new GitHubRequestError(
    `GitHub GraphQL mutation failed: ${errors.map((error) => error.message ?? error.type ?? "unknown error").join("; ")}`,
    kind,
    200,
    void 0,
    errors
  );
}

function cancellationTokenFromSignal(signal) {
  const tokenSource = new CancellationTokenSource();
  if (signal.aborted) {
    tokenSource.cancel();
    return { tokenSource, dispose: () => tokenSource.dispose() };
  }
  const onAbort = () => tokenSource.cancel();
  const listener = toDisposable(() => signal.removeEventListener("abort", onAbort));
  signal.addEventListener("abort", onAbort, { once: true });
  return {
    tokenSource,
    dispose: () => {
      listener.dispose();
      tokenSource.dispose();
    }
  };
}

function toFragmentError2(error) {
  if (error instanceof GitHubRequestError) {
    return { message: error.message, kind: error.kind, statusCode: error.statusCode };
  }
  return { message: error instanceof Error ? error.message : String(error), kind: "unknown" };
}

function nextLink2(link2) {
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

function objectAt2(value2, ...path) {
  let current = asObject2(value2, "GitHub response was malformed");
  for (const part of path) {
    current = asObject2(Reflect.get(current, part), `GitHub response property ${part} was malformed`);
  }
  return current;
}

function asObject2(value2, message) {
  if (!value2 || typeof value2 !== "object" || Array.isArray(value2)) {
    throw new GitHubRequestError(message, "malformedResponse");
  }
  return value2;
}

function asArray3(value2, message) {
  if (!Array.isArray(value2)) {
    throw new GitHubRequestError(message, "malformedResponse");
  }
  return value2;
}

function arrayProperty2(value2, key3) {
  return asArray3(Reflect.get(value2, key3), `GitHub response property ${key3} was not an array`);
}

function optionalObjectProperty2(value2, key3) {
  const property = Reflect.get(value2, key3);
  return property === null || property === void 0 ? void 0 : asObject2(property, `GitHub response property ${key3} was malformed`);
}

function requiredString2(value2, key3) {
  const property = stringProperty2(value2, key3);
  if (property === void 0) {
    throw new GitHubRequestError(`GitHub response property ${key3} was not a string`, "malformedResponse");
  }
  return property;
}

function stringProperty2(value2, key3) {
  const property = Reflect.get(value2, key3);
  return typeof property === "string" ? property : void 0;
}

function nullableStringProperty2(value2, key3) {
  const property = Reflect.get(value2, key3);
  return property === null ? void 0 : typeof property === "string" ? property : void 0;
}

function normalizedEnumProperty(value2, key3) {
  return nullableStringProperty2(value2, key3)?.toUpperCase();
}

function numberProperty2(value2, key3) {
  const property = Reflect.get(value2, key3);
  return typeof property === "number" && Number.isFinite(property) ? property : void 0;
}

function booleanProperty2(value2, key3) {
  const property = Reflect.get(value2, key3);
  return typeof property === "boolean" ? property : void 0;
}

function idProperty2(value2, key3) {
  const property = Reflect.get(value2, key3);
  return typeof property === "string" || typeof property === "number" ? String(property) : void 0;
}

function requiredId(value2, ...keys) {
  for (const key3 of keys) {
    const id2 = idProperty2(value2, key3);
    if (id2) {
      return id2;
    }
  }
  throw new GitHubRequestError(`GitHub response did not contain ${keys.join(" or ")}`, "malformedResponse");
}

function requiredNumber2(value2, key3) {
  const property = numberProperty2(value2, key3);
  if (property === void 0) {
    throw new GitHubRequestError(`GitHub response property ${key3} was not a number`, "malformedResponse");
  }
  return property;
}

function toActor(value2) {
  if (!value2) {
    return void 0;
  }
  const login = stringProperty2(value2, "login");
  if (!login) {
    return void 0;
  }
  const id2 = idProperty2(value2, "databaseId") ?? idProperty2(value2, "id");
  return id2 ? { id: id2, login } : { login };
}
export { mutationErrorKind, withOperationMarker, operationMarker, validateOperationId, validateAuthorization, validatePreparationState, validateMergeGateSnapshot, requireCompleteFragment, requireCompleteHeadFragment, rerunConfirmed, rerunProvenAbsent, isAmbiguousMutationError, sameAccount3, pullRequestMutationKey, toComment, toGraphQLComment, toWorkflowRun, toWorkflowJob, toCheckAnnotation, toMergeResult, redactWorkflowLog, throwGraphQLErrors2, cancellationTokenFromSignal, toFragmentError2, nextLink2, objectAt2, asObject2, asArray3, arrayProperty2, optionalObjectProperty2, requiredString2, stringProperty2, nullableStringProperty2, normalizedEnumProperty, numberProperty2, booleanProperty2, idProperty2, requiredId, requiredNumber2, toActor, operationMarkerPrefix, operationIdPattern, maximumPaginationPages2, maximumWorkflowLogBytes, workflowLogTimeout, mergePreparationLifetime, addReviewThreadReplyMutation, resolveReviewThreadMutation, enqueuePullRequestMutation, enableAutoMergeMutation, disableAutoMergeMutation, markReadyForReviewMutation, PullRequestMutationService };
