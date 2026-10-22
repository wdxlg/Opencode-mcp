// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentHostChangesetOperationService.ts
import { createDecorator } from "./module-0044.mjs";


// src/vs/platform/agentHost/common/agentHostChangesetOperationService.ts
var IAgentHostChangesetOperationService = createDecorator("agentHostChangesetOperationService");

var AGENT_HOST_MERGE_CHANGESET_OPERATION_ID = "merge";

var AgentHostPullRequestOperationId = {
  MarkReady: "pr-mark-ready",
  Merge: "pr-merge",
  EnableAutoMerge: "pr-enable-auto-merge",
  DisableAutoMerge: "pr-disable-auto-merge"
};

var AGENT_HOST_PULL_REQUEST_OPERATION_IDS = new Set(Object.values(AgentHostPullRequestOperationId));

var AGENT_HOST_AUTO_MERGE_OPERATION_IDS = /* @__PURE__ */ new Set([
  AgentHostPullRequestOperationId.EnableAutoMerge,
  AgentHostPullRequestOperationId.DisableAutoMerge
]);
export { IAgentHostChangesetOperationService, AGENT_HOST_MERGE_CHANGESET_OPERATION_ID, AgentHostPullRequestOperationId, AGENT_HOST_PULL_REQUEST_OPERATION_IDS, AGENT_HOST_AUTO_MERGE_OPERATION_IDS };
