// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentHostSubscriptionService.ts
import { createDecorator } from "./module-0044.mjs";
import { parseChangesetUri } from "./module-0097.mjs";
import { parseAnnotationsUri } from "./module-0098.mjs";
import { parseDefaultChatUri, parseSubagentSessionUri } from "./module-0047.mjs";
import { URI } from "./module-0023.mjs";


// src/vs/platform/agentHost/common/agentHostSubscriptionService.ts
var IAgentHostSubscriptionService = createDecorator("agentHostSubscriptionService");

function resolveAgentHostSession(resource) {
  const resourceString = resource.toString();
  const changesetSession = parseChangesetUri(resourceString)?.sessionUri;
  const annotationsSession = parseAnnotationsUri(resourceString)?.sessionUri;
  const chatSession = parseDefaultChatUri(resourceString);
  let session = URI.parse(changesetSession ?? annotationsSession ?? chatSession ?? resourceString);
  let subagent;
  while (subagent = parseSubagentSessionUri(session)) {
    session = subagent.parentSession;
  }
  return session;
}
export { resolveAgentHostSession, IAgentHostSubscriptionService };
