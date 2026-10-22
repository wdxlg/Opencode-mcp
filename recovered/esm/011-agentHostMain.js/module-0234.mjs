// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/sessionArtifactCollection.ts
import { URI } from "./module-0023.mjs";
import { SESSION_ARTIFACT_TYPES, getSessionArtifactValue, isGitHubArtifactLink } from "./module-0233.mjs";


// src/vs/platform/agentHost/common/sessionArtifactCollection.ts
var linkTypes = /* @__PURE__ */ new Set(["pullRequest" /* PullRequest */, "issue" /* Issue */, "website" /* Website */, "commit" /* Commit */]);

var uriTypes = /* @__PURE__ */ new Set(["file" /* File */, "resource" /* Resource */]);

var gitHubTypes = /* @__PURE__ */ new Set(["pullRequest" /* PullRequest */, "issue" /* Issue */]);

function requireString(value, field, toolName) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Invalid ${toolName} input: ${field} must be a non-empty string.`);
  }
  return value.trim();
}

function requireWebLink(value, field, toolName) {
  const link = requireString(value, field, toolName);
  let scheme;
  try {
    scheme = new URL(link).protocol;
  } catch {
    throw new Error(`Invalid ${toolName} input: ${field} must be an absolute http(s) URL.`);
  }
  if (scheme !== "http:" && scheme !== "https:") {
    throw new Error(`Invalid ${toolName} input: ${field} must be an http(s) URL, but was '${scheme}'.`);
  }
  return link;
}

function requireUri(value, field, toolName) {
  const uri = requireString(value, field, toolName);
  let scheme;
  try {
    scheme = URI.parse(
      uri,
      /*strict*/
      true
    ).scheme;
  } catch {
    scheme = void 0;
  }
  if (!scheme || scheme.length === 1) {
    throw new Error(`Invalid ${toolName} input: ${field} must be an absolute URI including its scheme, such as 'file:///path/to/file' \u2014 not a plain file system path.`);
  }
  return uri;
}

function parseSessionArtifactInput(rawArgs, toolName) {
  if (!rawArgs || typeof rawArgs !== "object" || Array.isArray(rawArgs)) {
    throw new Error(`Invalid ${toolName} input: expected an object.`);
  }
  const args = rawArgs;
  const type = args["type"];
  if (typeof type !== "string" || !SESSION_ARTIFACT_TYPES.includes(type)) {
    throw new Error(`Invalid ${toolName} input: type must be one of ${SESSION_ARTIFACT_TYPES.join(", ")}.`);
  }
  if (typeof args["isArtifact"] !== "boolean") {
    throw new Error(`Invalid ${toolName} input: isArtifact must be a boolean \u2014 true for something this session produced, false for a reference.`);
  }
  const artifactType = type;
  const input = {
    type: artifactType,
    label: requireString(args["label"], "label", toolName),
    isArtifact: args["isArtifact"]
  };
  if (linkTypes.has(artifactType)) {
    input.link = requireWebLink(args["link"], "link", toolName);
  }
  if (uriTypes.has(artifactType)) {
    input.uri = requireUri(args["uri"], "uri", toolName);
  }
  if (artifactType === "commit" /* Commit */) {
    input.commitHash = requireString(args["commitHash"], "commitHash", toolName);
  }
  return input;
}

var SessionArtifactCollection = class {
  constructor(_artifacts = []) {
    this._artifacts = _artifacts;
  }
  get artifacts() {
    return this._artifacts;
  }
  /**
   * Adds an artifact or reference unless one with the same value already
   * exists, in which case the existing entry is returned unchanged.
   */
  add(input, createId) {
    const artifact = this._create(input, createId);
    const value = getSessionArtifactValue(artifact);
    const existing = this._artifacts.find((candidate) => getSessionArtifactValue(candidate) === value);
    if (existing) {
      return { artifacts: this._artifacts, artifact: existing, added: false };
    }
    return { artifacts: [...this._artifacts, artifact], artifact, added: true };
  }
  remove(id2) {
    const removed = this._artifacts.find((artifact) => artifact.id === id2);
    return {
      artifacts: removed ? this._artifacts.filter((artifact) => artifact !== removed) : this._artifacts,
      removed
    };
  }
  _create(input, createId) {
    const artifact = { id: createId(), type: input.type, label: input.label, isArtifact: input.isArtifact };
    if (input.link !== void 0) {
      artifact.link = input.link;
    }
    if (input.uri !== void 0) {
      artifact.uri = input.uri;
    }
    if (input.commitHash !== void 0) {
      artifact.commitHash = input.commitHash;
    }
    if (input.link !== void 0 && gitHubTypes.has(input.type)) {
      artifact.isGitHub = isGitHubArtifactLink(input.link);
    }
    return artifact;
  }
};
export { requireString, requireWebLink, requireUri, parseSessionArtifactInput, linkTypes, uriTypes, gitHubTypes, SessionArtifactCollection };
