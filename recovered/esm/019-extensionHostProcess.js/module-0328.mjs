// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/platform/dataChannel/common/dataChannel.ts
import { createDecorator2 } from "./module-0048.mjs";


// src/vs/platform/dataChannel/common/dataChannel.ts
var IDataChannelService = createDecorator2("dataChannelService");

var ILinkPresentationService = createDecorator2("linkPresentationService");

function parseLinkPresentation(value) {
  if (!isRecord(value) || !isLinkPresentationKind(value.kind)) {
    throw new Error("Invalid link presentation payload");
  }
  const status = parseLinkPresentationStatus(value.status);
  const secondaryStatus = parseLinkPresentationStatus(value.secondaryStatus);
  const changes = parseLinkPresentationChanges(value.changes);
  return {
    kind: value.kind,
    ...typeof value.title === "string" ? { title: value.title } : {},
    ...typeof value.detail === "string" ? { detail: value.detail } : {},
    ...typeof value.reference === "string" ? { reference: value.reference } : {},
    ...status ? { status } : {},
    ...secondaryStatus ? { secondaryStatus } : {},
    ...changes ? { changes } : {},
    ...typeof value.tooltip === "string" ? { tooltip: value.tooltip } : {},
    ...typeof value.ariaLabel === "string" ? { ariaLabel: value.ariaLabel } : {},
    ...value.isLoading === true ? { isLoading: true } : {}
  };
}

function parseLinkPresentationStatus(value) {
  if (value === void 0) {
    return void 0;
  }
  if (!isRecord(value) || !isLinkPresentationStatusKind(value.kind) || typeof value.label !== "string") {
    throw new Error("Invalid link presentation status");
  }
  return { kind: value.kind, label: value.label };
}

function parseLinkPresentationChanges(value) {
  if (value === void 0) {
    return void 0;
  }
  if (!isRecord(value) || typeof value.insertions !== "number" || typeof value.deletions !== "number") {
    throw new Error("Invalid link presentation changes");
  }
  return { insertions: value.insertions, deletions: value.deletions };
}

function isLinkPresentationKind(value) {
  return value === "resource" || value === "issue" || value === "pullRequest" || value === "commit" || value === "file" || value === "folder" || value === "session" || value === "chat" || value === "repository" || value === "branch";
}

function isLinkPresentationStatusKind(value) {
  return value === "neutral" || value === "pending" || value === "success" || value === "warning" || value === "error" || value === "open" || value === "closed" || value === "merged" || value === "draft" || value === "notPlanned";
}

function isRecord(value) {
  return typeof value === "object" && value !== null;
}
export { parseLinkPresentation, parseLinkPresentationStatus, parseLinkPresentationChanges, isLinkPresentationKind, isLinkPresentationStatusKind, isRecord, IDataChannelService, ILinkPresentationService };
