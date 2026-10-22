// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/chatRequestText.ts
import { getAgentMergeRequestLabel } from "./module-2207.mjs";


// src/vs/workbench/contrib/chat/browser/chatRequestText.ts
function getChatRequestText(item) {
  const agentMergeLabel = getAgentMergeRequestLabel(item);
  if (agentMergeLabel !== void 0) {
    return agentMergeLabel;
  }
  return item.messageText;
}
export { getChatRequestText };
