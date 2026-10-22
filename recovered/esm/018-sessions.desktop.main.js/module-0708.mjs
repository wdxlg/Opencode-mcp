// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/dataChannel/common/dataChannel.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/platform/dataChannel/common/dataChannel.ts
var IDataChannelService = createDecorator("dataChannelService");

var ILinkPresentationService = createDecorator("linkPresentationService");

function parseLinkPresentation(value2) {
  if (!isRecord(value2) || !isLinkPresentationKind(value2.kind)) {
    throw new Error("Invalid link presentation payload");
  }
  const status2 = parseLinkPresentationStatus(value2.status);
  const secondaryStatus = parseLinkPresentationStatus(value2.secondaryStatus);
  const changes = parseLinkPresentationChanges(value2.changes);
  return {
    kind: value2.kind,
    ...typeof value2.title === "string" ? { title: value2.title } : {},
    ...typeof value2.detail === "string" ? { detail: value2.detail } : {},
    ...typeof value2.reference === "string" ? { reference: value2.reference } : {},
    ...status2 ? { status: status2 } : {},
    ...secondaryStatus ? { secondaryStatus } : {},
    ...changes ? { changes } : {},
    ...typeof value2.tooltip === "string" ? { tooltip: value2.tooltip } : {},
    ...typeof value2.ariaLabel === "string" ? { ariaLabel: value2.ariaLabel } : {},
    ...value2.isLoading === true ? { isLoading: true } : {}
  };
}

function parseLinkPresentationStatus(value2) {
  if (value2 === void 0) {
    return void 0;
  }
  if (!isRecord(value2) || !isLinkPresentationStatusKind(value2.kind) || typeof value2.label !== "string") {
    throw new Error("Invalid link presentation status");
  }
  return { kind: value2.kind, label: value2.label };
}

function parseLinkPresentationChanges(value2) {
  if (value2 === void 0) {
    return void 0;
  }
  if (!isRecord(value2) || typeof value2.insertions !== "number" || typeof value2.deletions !== "number") {
    throw new Error("Invalid link presentation changes");
  }
  return { insertions: value2.insertions, deletions: value2.deletions };
}

function isLinkPresentationKind(value2) {
  return value2 === "resource" || value2 === "issue" || value2 === "pullRequest" || value2 === "commit" || value2 === "file" || value2 === "folder" || value2 === "session" || value2 === "chat" || value2 === "repository" || value2 === "branch";
}

function isLinkPresentationStatusKind(value2) {
  return value2 === "neutral" || value2 === "pending" || value2 === "success" || value2 === "warning" || value2 === "error" || value2 === "open" || value2 === "closed" || value2 === "merged" || value2 === "draft" || value2 === "notPlanned";
}

function isRecord(value2) {
  return typeof value2 === "object" && value2 !== null;
}
export { parseLinkPresentation, parseLinkPresentationStatus, parseLinkPresentationChanges, isLinkPresentationKind, isLinkPresentationStatusKind, isRecord, IDataChannelService, ILinkPresentationService };
