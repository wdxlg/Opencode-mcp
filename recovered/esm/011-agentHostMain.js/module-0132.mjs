// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentHostReviewService.ts
import { createDecorator } from "./module-0044.mjs";


// src/vs/platform/agentHost/common/agentHostReviewService.ts
var IAgentHostReviewService = createDecorator("agentHostReviewService");

function buildReviewedRefName(sanitizedSessionId) {
  return `refs/agents/${sanitizedSessionId}/reviewed`;
}
export { buildReviewedRefName, IAgentHostReviewService };
