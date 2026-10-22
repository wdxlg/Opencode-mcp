// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentHostChatContributionsService.ts
import { createDecorator } from "./module-0044.mjs";


// src/vs/platform/agentHost/common/agentHostChatContributionsService.ts
var IAgentHostChatContributions = createDecorator("agentHostChatContributions");

function createChatMementoKey(debugName, create) {
  return { scope: "chat", debugName, create };
}
export { createChatMementoKey, IAgentHostChatContributions };
