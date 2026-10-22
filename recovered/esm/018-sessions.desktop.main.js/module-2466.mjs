// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/agentMerge.ts
import { createSchema, schemaProperty } from "./module-1741.mjs";
import { localize } from "./module-0001.mjs";


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

var AgentMergeSettingId = {
  Enabled: "chat.agentMerge.enabled",
  AddressReviews: "chat.agentMerge.addressReviews",
  FixCI: "chat.agentMerge.fixCI",
  ResolveConflicts: "chat.agentMerge.resolveConflicts",
  MergePullRequest: "chat.agentMerge.mergePullRequest",
  MergeMethod: "chat.agentMerge.mergeMethod",
  ReplyAttribution: "chat.agentMerge.replyAttribution"
};

var AGENT_MERGE_SETTING_TAG = "agentMerge";

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

function resolveAgentMergeConfiguration(defaults, overrides) {
  return {
    ...defaults,
    ...overrides
  };
}

function readAgentMergeSessionState(values) {
  const value2 = values?.["agentMerge" /* AgentMerge */];
  if (!isRecord6(value2) || typeof value2.enabled !== "boolean") {
    return void 0;
  }
  const controller = isRecord6(values?.["agentMerge.controller" /* AgentMergeController */]) ? values["agentMerge.controller" /* AgentMergeController */] : {};
  const overrides = readOverrides(value2.overrides);
  const target = readTarget(controller.target);
  const injectedConfiguration = readInjectedConfiguration(controller.injectedConfiguration);
  return {
    enabled: value2.enabled,
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

function readOverrides(value2) {
  if (!isRecord6(value2)) {
    return void 0;
  }
  const result = {};
  for (const action of ["addressReviews", "fixCI", "resolveConflicts"]) {
    if (typeof value2[action] === "boolean") {
      result[action] = value2[action];
    }
  }
  const mergePullRequest = value2.mergePullRequest;
  if (typeof mergePullRequest === "boolean") {
    result.mergePullRequest = mergePullRequest ? "always" : "never";
  } else if (isAgentMergeMergePullRequest(mergePullRequest)) {
    result.mergePullRequest = mergePullRequest;
  }
  return Object.keys(result).length > 0 ? result : void 0;
}

function isAgentMergeMergePullRequest(value2) {
  return typeof value2 === "string" && agentMergeMergePullRequestValues.includes(value2);
}

function readTarget(value2) {
  if (!isRecord6(value2) || typeof value2.branchName !== "string" || typeof value2.enabledAt !== "string" || typeof value2.commentWatermark !== "string" || value2.pullRequestUrl !== void 0 && typeof value2.pullRequestUrl !== "string") {
    return void 0;
  }
  return {
    branchName: value2.branchName,
    enabledAt: value2.enabledAt,
    commentWatermark: value2.commentWatermark,
    ...typeof value2.pullRequestUrl === "string" ? { pullRequestUrl: value2.pullRequestUrl } : {}
  };
}

function readInjectedConfiguration(value2) {
  if (!isRecord6(value2) || !isRecord6(value2.previous) || !isRecord6(value2.applied)) {
    return void 0;
  }
  return { previous: value2.previous, applied: value2.applied };
}

function isRecord6(value2) {
  return typeof value2 === "object" && value2 !== null && !Array.isArray(value2);
}

var conversationFragments = ["topLevelComments", "submittedReviews", "reviewThreads"];

var headFragments = ["checks", "mergeability"];

var agentMergeGateFragments = ["core", ...conversationFragments, ...headFragments];
export { resolveAgentMergeConfiguration, readAgentMergeSessionState, readOverrides, isAgentMergeMergePullRequest, readTarget, readInjectedConfiguration, isRecord6, AgentMergeConfigKey, AgentMergeSettingId, AGENT_MERGE_SETTING_TAG, agentMergeMergePullRequestValues, agentMergeRootConfigSchema, defaultAgentMergeConfiguration, conversationFragments, headFragments, agentMergeGateFragments };
