// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentTelemetryCorrelation.ts
import { hash } from "./module-0081.mjs";
import { DEFAULT_CHAT_ID, parseChatUri } from "./module-0047.mjs";


// src/vs/platform/agentHost/common/agentTelemetryCorrelation.ts
function getTelemetryChatSessionId(chat) {
  return String(hash(parseChatUri(chat)?.chatId ?? DEFAULT_CHAT_ID));
}
export { getTelemetryChatSessionId };
