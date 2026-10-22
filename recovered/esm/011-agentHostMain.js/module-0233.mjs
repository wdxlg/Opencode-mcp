// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/sessionArtifacts.ts



// src/vs/platform/agentHost/common/sessionArtifacts.ts
var SESSION_ARTIFACT_TYPES = [
  "pullRequest" /* PullRequest */,
  "issue" /* Issue */,
  "commit" /* Commit */,
  "website" /* Website */,
  "file" /* File */,
  "resource" /* Resource */
];

var SESSION_META_ARTIFACTS_KEY = "agentHost/sessionArtifacts";

function isSessionArtifactType(value) {
  return typeof value === "string" && SESSION_ARTIFACT_TYPES.includes(value);
}

function parseSessionArtifact(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return void 0;
  }
  const raw = value;
  if (typeof raw["id"] !== "string" || typeof raw["label"] !== "string" || !isSessionArtifactType(raw["type"])) {
    return void 0;
  }
  const isArtifact = raw["isArtifact"];
  if (isArtifact !== void 0 && typeof isArtifact !== "boolean") {
    return void 0;
  }
  const artifact = {
    id: raw["id"],
    type: raw["type"],
    label: raw["label"],
    isArtifact: isArtifact ?? true
  };
  if (typeof raw["link"] === "string") {
    artifact.link = raw["link"];
  }
  if (typeof raw["uri"] === "string") {
    artifact.uri = raw["uri"];
  }
  if (typeof raw["commitHash"] === "string") {
    artifact.commitHash = raw["commitHash"];
  }
  if (typeof raw["isGitHub"] === "boolean") {
    artifact.isGitHub = raw["isGitHub"];
  }
  return artifact;
}

function readSessionArtifacts(meta) {
  const value = meta?.[SESSION_META_ARTIFACTS_KEY];
  if (!Array.isArray(value)) {
    return [];
  }
  const artifacts = [];
  for (const entry of value) {
    const artifact = parseSessionArtifact(entry);
    if (artifact) {
      artifacts.push(artifact);
    }
  }
  return artifacts;
}

function withSessionArtifacts(meta, artifacts) {
  const next = { ...meta };
  if (artifacts.length > 0) {
    next[SESSION_META_ARTIFACTS_KEY] = artifacts;
  } else {
    delete next[SESSION_META_ARTIFACTS_KEY];
  }
  return Object.keys(next).length > 0 ? next : void 0;
}

function stringifySessionArtifacts(artifacts) {
  return JSON.stringify(artifacts);
}

function parseSessionArtifacts(value) {
  if (!value) {
    return { artifacts: [], dropped: 0 };
  }
  let raw;
  try {
    raw = JSON.parse(value);
  } catch (error) {
    return { artifacts: [], error: error instanceof Error ? error : new Error(String(error)), dropped: 0 };
  }
  if (!Array.isArray(raw)) {
    return { artifacts: [], error: new Error("expected an array of artifacts"), dropped: 0 };
  }
  const artifacts = readSessionArtifacts({ [SESSION_META_ARTIFACTS_KEY]: raw });
  return { artifacts, dropped: raw.length - artifacts.length };
}

function getSessionArtifactValue(artifact) {
  const value = artifact.link ?? artifact.uri ?? artifact.commitHash ?? "";
  return value.trim().toLowerCase();
}

function isGitHubArtifactLink(link) {
  try {
    const { hostname: hostname2 } = new URL(link);
    return hostname2 === "github.com" || hostname2 === "www.github.com" || hostname2.endsWith(".github.com") || hostname2.startsWith("github.");
  } catch {
    return false;
  }
}
export { isSessionArtifactType, parseSessionArtifact, readSessionArtifacts, withSessionArtifacts, stringifySessionArtifacts, parseSessionArtifacts, getSessionArtifactValue, isGitHubArtifactLink, SESSION_ARTIFACT_TYPES, SESSION_META_ARTIFACTS_KEY };
