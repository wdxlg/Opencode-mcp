// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/agentMerge.ts
import { createSchema, schemaProperty } from "./module-2102.mjs";
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

var conversationFragments = ["topLevelComments", "submittedReviews", "reviewThreads"];

var headFragments = ["checks", "mergeability"];

var agentMergeGateFragments = ["core", ...conversationFragments, ...headFragments];
export { AgentMergeConfigKey, AgentMergeSettingId, AGENT_MERGE_SETTING_TAG, agentMergeRootConfigSchema, conversationFragments, headFragments, agentMergeGateFragments };
