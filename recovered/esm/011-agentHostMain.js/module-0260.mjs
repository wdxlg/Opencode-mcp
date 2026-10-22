// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/fileEditAttribution.ts
import { createDecorator } from "./module-0044.mjs";
import { stringHash } from "./module-0081.mjs";
import { URI } from "./module-0023.mjs";


// src/vs/platform/agentHost/common/fileEditAttribution.ts
var FILE_EDIT_ATTRIBUTION_PROPERTY = "_vscodeEditAttribution";

var MAX_EDIT_ATTRIBUTION_FILE_SIZE = 5 * 1024 * 1024;

var EDIT_ATTRIBUTION_RESOURCE_SCHEME = "agent-edit-attribution";

var IAgentEditAttributionService = createDecorator("agentEditAttributionService");

function createFileEditContentDigest(content) {
  return `${content.length}:${stringHash(content, 0)}:${stringHash(content, 5381)}`;
}

function parseEditAttributionResource(resource) {
  if (resource.scheme !== EDIT_ATTRIBUTION_RESOURCE_SCHEME) {
    return void 0;
  }
  const kind = resource.path.substring(1);
  const payload = new URLSearchParams(resource.query).get("payload");
  if (!payload) {
    return void 0;
  }
  try {
    const value = JSON.parse(payload);
    if (kind === "prepare" && typeof value.resource === "string" && isEditTelemetryTrigger(value.trigger) && typeof value.statsUuid === "string" && typeof value.isDirty === "boolean" && typeof value.flushToken === "string" && typeof value.languageId === "string") {
      return {
        kind,
        params: {
          resource: URI.parse(value.resource),
          trigger: value.trigger,
          statsUuid: value.statsUuid,
          isDirty: value.isDirty,
          flushToken: value.flushToken,
          languageId: value.languageId
        }
      };
    }
    if (kind === "commit" && typeof value.flushToken === "string" && typeof value.totalModifiedCount === "number") {
      return {
        kind,
        params: {
          flushToken: value.flushToken,
          totalModifiedCount: value.totalModifiedCount
        }
      };
    }
    if (kind === "cancel" && typeof value.flushToken === "string") {
      return {
        kind,
        params: {
          flushToken: value.flushToken
        }
      };
    }
  } catch {
    return void 0;
  }
  return void 0;
}

function isEditTelemetryTrigger(value) {
  return value === "10hours" || value === "hashChange" || value === "branchChange" || value === "closed" || value === "time";
}
export { createFileEditContentDigest, parseEditAttributionResource, isEditTelemetryTrigger, FILE_EDIT_ATTRIBUTION_PROPERTY, MAX_EDIT_ATTRIBUTION_FILE_SIZE, EDIT_ATTRIBUTION_RESOURCE_SCHEME, IAgentEditAttributionService };
