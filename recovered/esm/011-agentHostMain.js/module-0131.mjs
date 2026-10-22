// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentHostCheckpointService.ts
import { createDecorator } from "./module-0044.mjs";


// src/vs/platform/agentHost/common/agentHostCheckpointService.ts
var IAgentHostCheckpointService = createDecorator("agentHostCheckpointService");

function buildCheckpointRefName(sanitizedSessionId, turnNumber) {
  return `refs/agents/${sanitizedSessionId}/checkpoints/turn/${turnNumber}`;
}
export { buildCheckpointRefName, IAgentHostCheckpointService };
