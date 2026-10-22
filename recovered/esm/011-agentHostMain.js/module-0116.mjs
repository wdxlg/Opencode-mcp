// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentMerge.ts
import { createSchema, schemaProperty } from "./module-0057.mjs";
import { localize } from "./module-0012.mjs";
import { appendEscapedMarkdownInlineCode } from "./module-0115.mjs";
import { structuralEquals } from "./module-0050.mjs";


// src/vs/platform/agentHost/common/agentMerge.ts
var AgentMergeConfigKey = {
  Enabled: "agentMerge.enabled",
  AddressReviews: "agentMerge.addressReviews",
  FixCI: "agentMerge.fixCI",
  ResolveConflicts: "agentMerge.resolveConflicts",
  MergePullRequest: "agentMerge.mergePullRequest",
  MergeMethod: "agentMerge.mergeMethod",
  ReplyAttribution: "agentMerge.replyAttribution"
};

var agentMergeMergePullRequestValues = ["always", "ifUnchanged", "never"];

var agentMergeRootConfigSchema = createSchema({
  [AgentMergeConfigKey.Enabled]: schemaProperty({
    type: "boolean",
    title: localize(2041, null),
    default: false
  }),
  [AgentMergeConfigKey.AddressReviews]: schemaProperty({
    type: "boolean",
    title: localize(2040, null),
    default: true
  }),
  [AgentMergeConfigKey.FixCI]: schemaProperty({
    type: "boolean",
    title: localize(2042, null),
    default: true
  }),
  [AgentMergeConfigKey.ResolveConflicts]: schemaProperty({
    type: "boolean",
    title: localize(2046, null),
    default: true
  }),
  [AgentMergeConfigKey.MergePullRequest]: schemaProperty({
    type: "string",
    title: localize(2044, null),
    enum: ["always", "ifUnchanged", "never"],
    default: "never"
  }),
  [AgentMergeConfigKey.MergeMethod]: schemaProperty({
    type: "string",
    title: localize(2043, null),
    enum: ["auto", "squash", "merge", "rebase"],
    default: "auto"
  }),
  [AgentMergeConfigKey.ReplyAttribution]: schemaProperty({
    type: "boolean",
    title: localize(2045, null),
    default: true
  })
});

var defaultAgentMergeConfiguration = {
  addressReviews: true,
  fixCI: true,
  resolveConflicts: true,
  mergePullRequest: "never",
  mergeMethod: "auto",
  replyAttribution: true
};

var maximumReviewThreads = 10;

var maximumCommentsPerThread = 5;

var maximumReviewSummaries = 5;

var maximumNewComments = 5;

var maximumFailedChecks = 20;

var maximumFeedbackBodyLength = 1e3;

var maximumFeedbackBudget = 2e4;

var maintainerAssociations = /* @__PURE__ */ new Set(["OWNER", "MEMBER", "COLLABORATOR"]);

var copilotPullRequestReviewerId = "175728472";

var copilotPullRequestReviewerLogins = /* @__PURE__ */ new Set(["copilot", "copilot-pull-request-reviewer[bot]"]);

var successfulCheckConclusions = /* @__PURE__ */ new Set(["SUCCESS", "NEUTRAL", "SKIPPED"]);

var mergeableStates = /* @__PURE__ */ new Set(["CLEAN", "HAS_HOOKS", "UNSTABLE"]);

function resolveAgentMergeConfiguration(defaults, overrides) {
  return {
    ...defaults,
    ...overrides
  };
}

function resolveMergeMethod(configured, allowed) {
  if (configured !== "auto") {
    const method = configured.toUpperCase();
    return allowed.includes(method) ? method : void 0;
  }
  return ["SQUASH", "MERGE", "REBASE"].find((method) => allowed.includes(method));
}

var agentMergeDisableReasons = {
  sessionArchived: () => ({
    log: "the session was archived",
    notice: localize(2056, null)
  }),
  branchChanged: (from, to) => ({
    log: `branch changed from ${from} to ${to}`,
    notice: localize(
      2047,
      null,
      appendEscapedMarkdownInlineCode(from),
      appendEscapedMarkdownInlineCode(to)
    )
  }),
  branchChangedWhileRefreshing: () => ({
    log: "the checked-out branch changed while pull request state was refreshing",
    notice: localize(2048, null)
  }),
  differentPullRequest: () => ({
    log: "the session became associated with a different pull request",
    notice: localize(2050, null)
  }),
  invalidPullRequestUrl: () => ({
    log: "the associated pull request URL is invalid",
    notice: localize(2052, null)
  }),
  differentGitHubHost: () => ({
    log: "the bound pull request belongs to a different GitHub host than the signed-in account",
    notice: localize(2049, null)
  }),
  indeterminate: (minutes, reason) => ({
    log: `the pull request state could not be evaluated for ${minutes} minutes: ${reason}`,
    notice: localize(2051, null, minutes)
  }),
  pullRequestClosed: () => ({
    log: "the pull request is closed or merged",
    notice: localize(2053, null)
  }),
  repairBudgetExhausted: () => ({
    log: "the same pull request blockers remained after repeated repair attempts",
    notice: localize(2055, null)
  }),
  pullRequestMerged: () => ({
    log: "the pull request was merged",
    notice: localize(2054, null)
  })
};

function agentMergeEnabledNotice(branchName) {
  return localize(2058, null, appendEscapedMarkdownInlineCode(branchName));
}

function agentMergeDisabledNotice() {
  return localize(2057, null);
}

function agentMergeMergePullRequestDemotedNotice() {
  return localize(2059, null);
}

function readAgentMergeSessionState(values) {
  const value = values?.["agentMerge" /* AgentMerge */];
  if (!isRecord(value) || typeof value.enabled !== "boolean") {
    return void 0;
  }
  const controller = isRecord(values?.["agentMerge.controller" /* AgentMergeController */]) ? values["agentMerge.controller" /* AgentMergeController */] : {};
  const overrides = readOverrides(value.overrides);
  const target = readTarget(controller.target);
  const injectedConfiguration = readInjectedConfiguration(controller.injectedConfiguration);
  return {
    enabled: value.enabled,
    ...overrides ? { overrides } : {},
    ...target ? { target } : {},
    ...injectedConfiguration ? { injectedConfiguration } : {},
    ...typeof controller.lastPromptFingerprint === "string" ? { lastPromptFingerprint: controller.lastPromptFingerprint } : {},
    ...typeof controller.lastPromptAt === "string" ? { lastPromptAt: controller.lastPromptAt } : {},
    ...typeof controller.repeatedPromptCount === "number" && Number.isInteger(controller.repeatedPromptCount) && controller.repeatedPromptCount >= 0 ? { repeatedPromptCount: controller.repeatedPromptCount } : {},
    ...typeof controller.totalPromptCount === "number" && Number.isInteger(controller.totalPromptCount) && controller.totalPromptCount >= 0 ? { totalPromptCount: controller.totalPromptCount } : {},
    ...typeof controller.repairBaseCommit === "string" ? { repairBaseCommit: controller.repairBaseCommit } : {}
  };
}

function getNonMergeSessionConfigValues(values) {
  if (!values) {
    return {};
  }
  const agentMerge = readAgentMergeSessionState(values);
  const injected = agentMerge?.injectedConfiguration;
  if (!agentMerge?.enabled || !injected) {
    return values;
  }
  const restored = { ...values };
  for (const [key, appliedValue] of Object.entries(injected.applied)) {
    if (!structuralEquals(restored[key], appliedValue)) {
      continue;
    }
    if (Object.hasOwn(injected.previous, key)) {
      const previousValue = injected.previous[key];
      if (previousValue === void 0) {
        delete restored[key];
      } else {
        restored[key] = previousValue;
      }
    } else {
      delete restored[key];
    }
  }
  return restored;
}

function isAgentMergeFeedbackAuthor(actor) {
  if (!actor) {
    return false;
  }
  return maintainerAssociations.has(actor.association?.toUpperCase() ?? "") || actor.id === copilotPullRequestReviewerId || copilotPullRequestReviewerLogins.has(actor.login.toLowerCase());
}

function readOverrides(value) {
  if (!isRecord(value)) {
    return void 0;
  }
  const result = {};
  for (const action of ["addressReviews", "fixCI", "resolveConflicts"]) {
    if (typeof value[action] === "boolean") {
      result[action] = value[action];
    }
  }
  const mergePullRequest = value.mergePullRequest;
  if (typeof mergePullRequest === "boolean") {
    result.mergePullRequest = mergePullRequest ? "always" : "never";
  } else if (isAgentMergeMergePullRequest(mergePullRequest)) {
    result.mergePullRequest = mergePullRequest;
  }
  return Object.keys(result).length > 0 ? result : void 0;
}

var AGENT_MERGE_UNKNOWN_COMMIT = "unknown";

function shouldStopMergingAfterAgentChanges(configuration, agentMerge, currentCommit) {
  if (configuration.mergePullRequest !== "ifUnchanged" || agentMerge.repairBaseCommit === void 0) {
    return false;
  }
  return agentMerge.repairBaseCommit !== currentCommit;
}

function isAgentMergeMergePullRequest(value) {
  return typeof value === "string" && agentMergeMergePullRequestValues.includes(value);
}

function readTarget(value) {
  if (!isRecord(value) || typeof value.branchName !== "string" || typeof value.enabledAt !== "string" || typeof value.commentWatermark !== "string" || value.pullRequestUrl !== void 0 && typeof value.pullRequestUrl !== "string") {
    return void 0;
  }
  return {
    branchName: value.branchName,
    enabledAt: value.enabledAt,
    commentWatermark: value.commentWatermark,
    ...typeof value.pullRequestUrl === "string" ? { pullRequestUrl: value.pullRequestUrl } : {}
  };
}

function readInjectedConfiguration(value) {
  if (!isRecord(value) || !isRecord(value.previous) || !isRecord(value.applied)) {
    return void 0;
  }
  return { previous: value.previous, applied: value.applied };
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

var FeedbackBudget = class {
  constructor(budget) {
    this._remaining = budget;
  }
  take(author, body) {
    const text = (body ?? "").slice(0, Math.max(0, Math.min(maximumFeedbackBodyLength, this._remaining)));
    this._remaining -= text.length;
    return {
      ...author ? { author } : {},
      body: text
    };
  }
};

function evaluateAgentMerge(snapshot, configuration, commentWatermark) {
  const core = snapshot.core;
  if (core.status !== "ready" || !core.complete || !core.value) {
    return { kind: "indeterminate", reason: "Pull request core state is incomplete", cause: "core:incomplete" };
  }
  if (core.value.state !== "open") {
    return { kind: "terminal" };
  }
  const incomplete = firstIncompleteFragment(snapshot, core.value.headSha);
  if (incomplete) {
    return { kind: "indeterminate", ...describeIncompleteFragment(snapshot, incomplete) };
  }
  const checks = classifyAgentMergeRequiredChecks(snapshot.checks.value);
  if (checks.kind === "indeterminate") {
    return { kind: "indeterminate", reason: checks.reason, cause: `checks:${checks.reason}` };
  }
  const reviewThreads = snapshot.reviewThreads.value.filter((thread) => !thread.isResolved && thread.comments.some((comment) => isAgentMergeFeedbackAuthor(comment.author)));
  const latestReviews = latestReviewsByAuthor(snapshot.submittedReviews.value);
  const changesRequested = latestReviews.filter((review) => review.state.toUpperCase() === "CHANGES_REQUESTED" && isAgentMergeFeedbackAuthor(review.author));
  const watermark = Date.parse(commentWatermark);
  const newComments = snapshot.topLevelComments.value.filter(
    (comment) => isAgentMergeFeedbackAuthor(comment.author) && comment.createdAt !== void 0 && Date.parse(comment.createdAt) > watermark
  );
  const mergeability = snapshot.mergeability.value;
  const behind = mergeability.mergeStateStatus?.toUpperCase() === "BEHIND";
  const conflicting = mergeability.mergeable === "CONFLICTING";
  const actions = [];
  if (configuration.addressReviews && (reviewThreads.length > 0 || changesRequested.length > 0 || newComments.length > 0)) {
    actions.push("addressReviews");
  }
  if (configuration.fixCI && checks.failed.length > 0) {
    actions.push("fixCI");
  }
  if (configuration.resolveConflicts && (behind || conflicting)) {
    actions.push("resolveConflicts");
  }
  const budget = new FeedbackBudget(maximumFeedbackBudget);
  const context = {
    pullRequestUrl: core.value.url,
    title: core.value.title,
    headSha: core.value.headSha,
    baseRef: core.value.baseRef,
    headRef: core.value.headRef,
    reviewThreads: reviewThreads.slice(0, maximumReviewThreads).map((thread) => ({
      id: thread.id,
      ...thread.path ? { path: thread.path } : {},
      ...thread.line !== void 0 ? { line: thread.line } : {},
      comments: thread.comments.filter((comment) => isAgentMergeFeedbackAuthor(comment.author)).slice(-maximumCommentsPerThread).map((comment) => budget.take(comment.author?.login, comment.body))
    })),
    reviewSummaries: changesRequested.slice(-maximumReviewSummaries).map((review) => budget.take(review.author?.login, review.body)),
    newComments: newComments.slice(-maximumNewComments).map((comment) => budget.take(comment.author?.login, comment.body)),
    failedChecks: checks.failed.slice(0, maximumFailedChecks).map((check) => check.name),
    behind,
    conflicting,
    commentWatermark: newComments.reduce((latest, comment) => comment.createdAt && comment.createdAt > latest ? comment.createdAt : latest, commentWatermark)
  };
  const fingerprint = JSON.stringify({ actions, context });
  if (actions.length > 0) {
    return { kind: "prompt", actions, fingerprint, context };
  }
  const reviewsReady = !configuration.addressReviews || reviewThreads.length === 0 && changesRequested.length === 0 && newComments.length === 0;
  const mergeReady = !core.value.draft && reviewsReady && checks.failed.length === 0 && !checks.pending && !behind && !conflicting && mergeability.mergeable === "MERGEABLE" && mergeability.viewerCanMerge && mergeableStates.has(mergeability.mergeStateStatus?.toUpperCase() ?? "CLEAN");
  if (configuration.mergePullRequest !== "never" && mergeReady) {
    return { kind: "merge", fingerprint };
  }
  return { kind: "noWork", waitingOnChecks: checks.pending, fingerprint };
}

function isCompleteFragment(snapshot, fragment) {
  const state = snapshot[fragment];
  return state.status === "ready" && state.complete && state.value !== void 0;
}

function isCompleteHeadFragment(snapshot, fragment, headSha) {
  const state = snapshot[fragment];
  return state.status === "ready" && state.complete && state.value !== void 0 && state.headSha === headSha;
}

var conversationFragments = ["topLevelComments", "submittedReviews", "reviewThreads"];

var headFragments = ["checks", "mergeability"];

var agentMergeGateFragments = ["core", ...conversationFragments, ...headFragments];

function firstIncompleteFragment(snapshot, headSha) {
  for (const fragment of conversationFragments) {
    if (!isCompleteFragment(snapshot, fragment)) {
      return fragment;
    }
  }
  for (const fragment of headFragments) {
    if (!isCompleteHeadFragment(snapshot, fragment, headSha)) {
      return fragment;
    }
  }
  return void 0;
}

function describeIncompleteFragment(snapshot, fragment) {
  const state = snapshot[fragment];
  if (state.error) {
    return {
      reason: `Pull request ${fragment} could not be loaded (${state.error.kind}): ${state.error.message}`,
      cause: `${fragment}:${state.error.kind}`
    };
  }
  return {
    reason: `Pull request ${fragment} state is incomplete or stale (status=${state.status}, complete=${state.complete})`,
    cause: `${fragment}:incomplete`
  };
}

function latestReviewsByAuthor(reviews) {
  const latest = /* @__PURE__ */ new Map();
  for (const review of reviews ?? []) {
    if (review.state.toUpperCase() === "COMMENTED" || review.state.toUpperCase() === "PENDING") {
      continue;
    }
    const key = review.author?.id ?? review.author?.login.toLowerCase() ?? review.id;
    const current = latest.get(key);
    if (!current || (review.submittedAt ?? "") >= (current.submittedAt ?? "")) {
      latest.set(key, review);
    }
  }
  return [...latest.values()];
}

function classifyAgentMergeRequiredChecks(checks) {
  if (!checks.requirednessComplete) {
    return { kind: "indeterminate", reason: "Required check classification is incomplete" };
  }
  const required = checks.checks.filter((check) => check.required === true);
  if (checks.checks.some((check) => check.required === void 0)) {
    return { kind: "indeterminate", reason: "A check has unknown requiredness" };
  }
  const failed = [];
  let pending = false;
  for (const check of required) {
    const status = check.status?.toUpperCase();
    if (check.type === "statusContext") {
      if (status === "PENDING" || !status) {
        pending = true;
      } else if (status !== "SUCCESS") {
        failed.push(check);
      }
      continue;
    }
    if (status !== "COMPLETED") {
      pending = true;
    } else if (!successfulCheckConclusions.has(check.conclusion?.toUpperCase() ?? "")) {
      failed.push(check);
    }
  }
  return { kind: "ready", failed, pending };
}
export { resolveAgentMergeConfiguration, resolveMergeMethod, agentMergeEnabledNotice, agentMergeDisabledNotice, agentMergeMergePullRequestDemotedNotice, readAgentMergeSessionState, getNonMergeSessionConfigValues, isAgentMergeFeedbackAuthor, readOverrides, shouldStopMergingAfterAgentChanges, isAgentMergeMergePullRequest, readTarget, readInjectedConfiguration, isRecord, evaluateAgentMerge, isCompleteFragment, isCompleteHeadFragment, firstIncompleteFragment, describeIncompleteFragment, latestReviewsByAuthor, classifyAgentMergeRequiredChecks, AgentMergeConfigKey, agentMergeMergePullRequestValues, agentMergeRootConfigSchema, defaultAgentMergeConfiguration, maximumReviewThreads, maximumCommentsPerThread, maximumReviewSummaries, maximumNewComments, maximumFailedChecks, maximumFeedbackBodyLength, maximumFeedbackBudget, maintainerAssociations, copilotPullRequestReviewerId, copilotPullRequestReviewerLogins, successfulCheckConclusions, mergeableStates, agentMergeDisableReasons, AGENT_MERGE_UNKNOWN_COMMIT, FeedbackBudget, conversationFragments, headFragments, agentMergeGateFragments };
