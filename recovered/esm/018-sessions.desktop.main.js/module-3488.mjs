// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/browser/dnd.ts
import { stringHash } from "./module-0039.mjs";
import { DraggedChatReferenceIdentifier, LocalSelectionTransfer, fillInChatReferenceDragData } from "./module-0273.mjs";


// src/vs/sessions/browser/dnd.ts
var SessionsDataTransfers = {
  /** Mime type used to identify a session being dragged within the application. */
  SESSION: "application/vnd.code.session",
  /** Mime type used to identify a chat being dragged into or between groups within a session. */
  CHAT: "application/vnd.code.session.chat"
};

var DraggedSessionIdentifier = class {
  constructor(sessionId, resource) {
    this.sessionId = sessionId;
    this.resource = resource;
  }
};

function fillSessionChatDragData(e4, sessionId, resource) {
  const data = { sessionId, resource: resource.toString() };
  e4.dataTransfer?.setData(SessionsDataTransfers.CHAT, JSON.stringify(data));
  e4.dataTransfer?.setData(getSessionChatDragType(sessionId), "");
}

function isSessionChatDrag(e4, sessionId) {
  if (!e4.dataTransfer?.types.includes(SessionsDataTransfers.CHAT)) {
    return false;
  }
  return sessionId === void 0 || e4.dataTransfer.types.includes(getSessionChatDragType(sessionId));
}

function getSessionChatDragType(sessionId) {
  return `${SessionsDataTransfers.CHAT}.${(stringHash(sessionId, 0) >>> 0).toString(16)}`;
}

function getSessionChatDragData(e4) {
  const raw = e4.dataTransfer?.getData(SessionsDataTransfers.CHAT);
  if (!raw) {
    return void 0;
  }
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.sessionId === "string" && typeof parsed.resource === "string") {
      return parsed;
    }
  } catch {
  }
  return void 0;
}

var chatReferenceTransfer = LocalSelectionTransfer.getInstance();

function fillChatReferenceDragData(e4, chatResource, clientResource, title) {
  const collapsedTitle = title.replace(/\s+/g, " ").trim();
  const chatResourceString = chatResource.toString();
  const clientResourceString = clientResource.toString();
  fillInChatReferenceDragData({ chatResource: chatResourceString, clientResource: clientResourceString, title: collapsedTitle }, e4);
  chatReferenceTransfer.setData([new DraggedChatReferenceIdentifier(chatResourceString, clientResourceString, collapsedTitle)], DraggedChatReferenceIdentifier.prototype);
}

function clearChatReferenceDragData() {
  chatReferenceTransfer.clearData(DraggedChatReferenceIdentifier.prototype);
}
export { fillSessionChatDragData, isSessionChatDrag, getSessionChatDragType, getSessionChatDragData, fillChatReferenceDragData, clearChatReferenceDragData, SessionsDataTransfers, DraggedSessionIdentifier, chatReferenceTransfer };
