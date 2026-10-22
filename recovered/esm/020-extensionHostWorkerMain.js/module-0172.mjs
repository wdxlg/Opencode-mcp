// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/contrib/chat/common/chatPerf.ts
import { chatSessionResourceToId } from "./module-0095.mjs";
import { mark } from "./module-0021.mjs";


// src/vs/workbench/contrib/chat/common/chatPerf.ts
var chatPerfPrefix = "code/chat/";

var chatMarksBySession = /* @__PURE__ */ new Map();

var ChatPerfMark = {
  /** User pressed Enter / request initiated */
  RequestStart: "request/start",
  /** Request added to model → UI shows the message */
  RequestUiUpdated: "request/uiUpdated",
  /** Begin collecting .instructions.md / skills / hooks */
  WillCollectInstructions: "request/willCollectInstructions",
  /** Done collecting instructions */
  DidCollectInstructions: "request/didCollectInstructions",
  /** First streamed response content received */
  FirstToken: "request/firstToken",
  /** Response fully complete */
  RequestComplete: "request/complete",
  /** Agent invoke begins (LLM round-trip start) */
  AgentWillInvoke: "agent/willInvoke",
  /** Agent invoke returns (LLM round-trip end) */
  AgentDidInvoke: "agent/didInvoke"
};

function markChat(sessionResource, name2) {
  const sessionId = chatSessionResourceToId(sessionResource);
  const fullName = `${chatPerfPrefix}${sessionId}/${name2}`;
  let names = chatMarksBySession.get(sessionId);
  if (!names) {
    names = /* @__PURE__ */ new Set();
    chatMarksBySession.set(sessionId, names);
  }
  names.add(fullName);
  mark(fullName);
}
export { markChat, chatPerfPrefix, chatMarksBySession, ChatPerfMark };
