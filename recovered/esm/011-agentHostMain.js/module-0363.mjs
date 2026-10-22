// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/claudeElicitationBridge.ts
import { buildElicitationRequest, cancelledElicitationResult, elicitationResultFromAnswers } from "./module-0362.mjs";


// src/vs/platform/agentHost/node/claude/claudeElicitationBridge.ts
async function handleElicitation(deps, sessionId, request, options) {
  const session = deps.getSession(sessionId);
  if (!session) {
    return cancelledElicitationResult();
  }
  const requestId = options.requestId;
  if (options.signal.aborted) {
    return cancelledElicitationResult();
  }
  const chatRequest = buildElicitationRequest(requestId, request);
  if (!chatRequest.url && !chatRequest.questions?.length) {
    return cancelledElicitationResult();
  }
  const abortHandler = () => {
    session.respondToUserInputRequest(requestId, "cancel" /* Cancel */);
  };
  options.signal.addEventListener("abort", abortHandler);
  try {
    const { response, answers } = await session.requestUserInput(chatRequest);
    return elicitationResultFromAnswers(request, response, answers);
  } finally {
    options.signal.removeEventListener("abort", abortHandler);
  }
}
export { handleElicitation };
