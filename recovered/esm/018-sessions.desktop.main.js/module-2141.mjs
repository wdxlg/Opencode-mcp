// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/chatReferenceDrop.ts
import { URI } from "./module-0032.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { createChatReferenceVariableEntry } from "./module-0980.mjs";


// src/vs/workbench/contrib/chat/browser/widget/chatReferenceDrop.ts
function tryParseUri(value2) {
  try {
    return URI.parse(value2);
  } catch {
    return void 0;
  }
}

function isSelfChatReferenceDrop(droppedClientResource, ownClientResource) {
  const dropped = tryParseUri(droppedClientResource);
  const own = tryParseUri(ownClientResource);
  if (!dropped || !own) {
    return true;
  }
  return isEqual2(dropped, own);
}

function isCrossAgentHostChatReferenceDrop(droppedClientResource, ownClientResource) {
  const dropped = tryParseUri(droppedClientResource);
  const own = tryParseUri(ownClientResource);
  if (!dropped || !own) {
    return true;
  }
  return dropped.scheme !== own.scheme || dropped.authority !== own.authority;
}

function resolveChatReferenceDropEntry(data, ownClientResource) {
  if (ownClientResource === void 0) {
    return void 0;
  }
  if (isSelfChatReferenceDrop(data.clientResource, ownClientResource) || isCrossAgentHostChatReferenceDrop(data.clientResource, ownClientResource)) {
    return void 0;
  }
  const chatResource = tryParseUri(data.chatResource);
  if (!chatResource) {
    return void 0;
  }
  return createChatReferenceVariableEntry(chatResource, void 0, data.title);
}
export { tryParseUri, isSelfChatReferenceDrop, isCrossAgentHostChatReferenceDrop, resolveChatReferenceDropEntry };
