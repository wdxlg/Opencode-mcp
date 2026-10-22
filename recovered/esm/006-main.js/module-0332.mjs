// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/agentHost/common/agentMerge.ts
import { __esm } from "./module-0000.mjs";
import { init_nls, localize } from "./module-0005.mjs";
import { init_htmlContent } from "./module-0331.mjs";
import { init_equals } from "./module-0321.mjs";
import { createSchema, init_agentHostSchema, schemaProperty } from "./module-0327.mjs";
import { init_sessionConfigKeys } from "./module-0323.mjs";


// src/vs/platform/agentHost/common/agentMerge.ts
var AgentMergeConfigKey, AgentMergeSettingId, AGENT_MERGE_SETTING_TAG, agentMergeRootConfigSchema, conversationFragments, headFragments, agentMergeGateFragments;

var init_agentMerge = __esm({
  "src/vs/platform/agentHost/common/agentMerge.ts"() {
    init_nls();
    init_htmlContent();
    init_equals();
    init_agentHostSchema();
    init_sessionConfigKeys();
    AgentMergeConfigKey = {
      Enabled: "agentMerge.enabled",
      AddressReviews: "agentMerge.addressReviews",
      FixCI: "agentMerge.fixCI",
      ResolveConflicts: "agentMerge.resolveConflicts",
      MergePullRequest: "agentMerge.mergePullRequest",
      MergeMethod: "agentMerge.mergeMethod",
      ReplyAttribution: "agentMerge.replyAttribution"
    };
    AgentMergeSettingId = {
      Enabled: "chat.agentMerge.enabled",
      AddressReviews: "chat.agentMerge.addressReviews",
      FixCI: "chat.agentMerge.fixCI",
      ResolveConflicts: "chat.agentMerge.resolveConflicts",
      MergePullRequest: "chat.agentMerge.mergePullRequest",
      MergeMethod: "chat.agentMerge.mergeMethod",
      ReplyAttribution: "chat.agentMerge.replyAttribution"
    };
    AGENT_MERGE_SETTING_TAG = "agentMerge";
    agentMergeRootConfigSchema = createSchema({
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
    conversationFragments = ["topLevelComments", "submittedReviews", "reviewThreads"];
    headFragments = ["checks", "mergeability"];
    agentMergeGateFragments = ["core", ...conversationFragments, ...headFragments];
  }
});
export { AgentMergeConfigKey, AgentMergeSettingId, AGENT_MERGE_SETTING_TAG, agentMergeRootConfigSchema, conversationFragments, headFragments, agentMergeGateFragments, init_agentMerge };
