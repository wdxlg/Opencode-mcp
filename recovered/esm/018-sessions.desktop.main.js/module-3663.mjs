// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
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

function isSessionArtifactType(value2) {
  return typeof value2 === "string" && SESSION_ARTIFACT_TYPES.includes(value2);
}

function parseSessionArtifact(value2) {
  if (!value2 || typeof value2 !== "object" || Array.isArray(value2)) {
    return void 0;
  }
  const raw = value2;
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
  const value2 = meta?.[SESSION_META_ARTIFACTS_KEY];
  if (!Array.isArray(value2)) {
    return [];
  }
  const artifacts = [];
  for (const entry of value2) {
    const artifact = parseSessionArtifact(entry);
    if (artifact) {
      artifacts.push(artifact);
    }
  }
  return artifacts;
}
export { isSessionArtifactType, parseSessionArtifact, readSessionArtifacts, SESSION_ARTIFACT_TYPES, SESSION_META_ARTIFACTS_KEY };
