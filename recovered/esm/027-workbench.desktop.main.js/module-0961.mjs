// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/model/chatUri.ts
import { Schemas } from "./module-0033.mjs";
import { VSBuffer, decodeBase64, encodeBase64 } from "./module-0038.mjs";
import { URI } from "./module-0032.mjs";
import { localChatSessionType } from "./module-0960.mjs";
import { extUri } from "./module-0034.mjs";
import { generateUuid } from "./module-0190.mjs";


// src/vs/workbench/contrib/chat/common/model/chatUri.ts
var LocalChatSessionUri;

((LocalChatSessionUri2) => {
  LocalChatSessionUri2.scheme = Schemas.vscodeLocalChatSession;
  function forSession(sessionId) {
    const encodedId = encodeBase64(VSBuffer.wrap(new TextEncoder().encode(sessionId)), false, true);
    return URI.from({ scheme: LocalChatSessionUri2.scheme, authority: localChatSessionType, path: "/" + encodedId });
  }
  LocalChatSessionUri2.forSession = forSession;
  function getNewSessionUri() {
    const handle2 = Math.floor(Math.random() * 1e9);
    return forSession(`chat-${handle2}`);
  }
  LocalChatSessionUri2.getNewSessionUri = getNewSessionUri;
  function parseLocalSessionId(resource) {
    const parsed = parse14(resource);
    return parsed?.chatSessionType === localChatSessionType ? parsed.sessionId : void 0;
  }
  LocalChatSessionUri2.parseLocalSessionId = parseLocalSessionId;
  function isLocalSession(resource) {
    return !!parseLocalSessionId(resource);
  }
  LocalChatSessionUri2.isLocalSession = isLocalSession;
  function parse14(resource) {
    if (resource.scheme !== LocalChatSessionUri2.scheme) {
      return void 0;
    }
    if (!resource.authority) {
      return void 0;
    }
    const parts = resource.path.split("/");
    if (parts.length !== 2) {
      return void 0;
    }
    const chatSessionType = resource.authority;
    const decodedSessionId = decodeBase64(parts[1]);
    return { chatSessionType, sessionId: new TextDecoder().decode(decodedSessionId.buffer) };
  }
})(LocalChatSessionUri || (LocalChatSessionUri = {}));

function chatSessionResourceToId(resource) {
  const localId = LocalChatSessionUri.parseLocalSessionId(resource);
  if (localId) {
    return localId;
  }
  return resource.toString();
}

function getChatSessionStorageResource(storageRoot, sessionId, suffix = "") {
  const resource = extUri.joinPath(storageRoot, `${sessionId}${suffix}`);
  if (!extUri.isEqual(extUri.dirname(resource), storageRoot)) {
    throw new Error(`Invalid chat session ID: ${sessionId}`);
  }
  return resource;
}

function getChatSessionType(resource) {
  if (resource.scheme === Schemas.vscodeChatEditor) {
    return localChatSessionType;
  }
  if (resource.scheme === LocalChatSessionUri.scheme) {
    return resource.authority || localChatSessionType;
  }
  return resource.scheme;
}

function isUntitledChatSession(resource) {
  return resource.path.startsWith("/untitled-");
}

function getNewChatSessionResource(sessionType) {
  return sessionType === localChatSessionType ? LocalChatSessionUri.getNewSessionUri() : URI.from({ scheme: sessionType, path: `/untitled-${generateUuid()}` });
}
export { chatSessionResourceToId, getChatSessionStorageResource, getChatSessionType, isUntitledChatSession, getNewChatSessionResource, LocalChatSessionUri };
