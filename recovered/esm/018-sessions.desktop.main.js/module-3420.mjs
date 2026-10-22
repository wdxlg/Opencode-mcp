// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/fileEditAttribution.ts
import { createDecorator } from "./module-0077.mjs";
import { stringHash } from "./module-0039.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/platform/agentHost/common/fileEditAttribution.ts
var FILE_EDIT_ATTRIBUTION_PROPERTY = "_vscodeEditAttribution";

var MAX_EDIT_ATTRIBUTION_FILE_SIZE = 5 * 1024 * 1024;

var EDIT_ATTRIBUTION_RESOURCE_SCHEME = "agent-edit-attribution";

var IAgentEditAttributionService = createDecorator("agentEditAttributionService");

function getFileEditAttributionMarker(content) {
  const marker = content[FILE_EDIT_ATTRIBUTION_PROPERTY];
  if (marker?.version !== 1 || typeof marker.editId !== "string" || !Number.isSafeInteger(marker.sequence) || marker.sequence < 0) {
    return void 0;
  }
  if (marker.status === "skipped") {
    return marker.reason === "fileTooLarge" && (marker.untrackedEditCount === void 0 || Number.isSafeInteger(marker.untrackedEditCount) && marker.untrackedEditCount > 0) && Number.isSafeInteger(marker.insertedCount) && marker.insertedCount >= 0 ? marker : void 0;
  }
  if (marker.status !== void 0 && marker.status !== "tracked") {
    return void 0;
  }
  if (typeof marker.beforeDigest !== "string" || typeof marker.afterDigest !== "string" || marker.source !== void 0 && !isFileEditAttributionSource(marker.source)) {
    return void 0;
  }
  return marker;
}

function isFileEditAttributionSource(source) {
  if (typeof source !== "object" || source === null || Array.isArray(source)) {
    return false;
  }
  const candidate = source;
  return (candidate.modelId === void 0 || typeof candidate.modelId === "string") && typeof candidate.conversationId === "string" && typeof candidate.requestId === "string" && typeof candidate.harness === "string";
}

function createFileEditContentDigest(content) {
  return `${content.length}:${stringHash(content, 0)}:${stringHash(content, 5381)}`;
}

function buildPrepareEditAttributionResource(params) {
  return buildEditAttributionResource("prepare", {
    resource: params.resource.toString(),
    trigger: params.trigger,
    statsUuid: params.statsUuid,
    isDirty: params.isDirty,
    flushToken: params.flushToken,
    languageId: params.languageId
  });
}

function buildCommitEditAttributionResource(params) {
  return buildEditAttributionResource("commit", params);
}

function buildCancelEditAttributionResource(params) {
  return buildEditAttributionResource("cancel", params);
}

function buildEditAttributionResource(kind, value2) {
  const params = new URLSearchParams();
  params.set("payload", JSON.stringify(value2));
  return URI.from({
    scheme: EDIT_ATTRIBUTION_RESOURCE_SCHEME,
    path: `/${kind}`,
    query: params.toString()
  });
}
export { getFileEditAttributionMarker, isFileEditAttributionSource, createFileEditContentDigest, buildPrepareEditAttributionResource, buildCommitEditAttributionResource, buildCancelEditAttributionResource, buildEditAttributionResource, FILE_EDIT_ATTRIBUTION_PROPERTY, MAX_EDIT_ATTRIBUTION_FILE_SIZE, EDIT_ATTRIBUTION_RESOURCE_SCHEME, IAgentEditAttributionService };
