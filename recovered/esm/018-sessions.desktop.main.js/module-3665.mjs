// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/meta/agentChangesetFileMeta.ts



// src/vs/platform/agentHost/common/meta/agentChangesetFileMeta.ts
function readChangesetFileMeta(source) {
  const meta = source._meta;
  if (!meta) {
    return void 0;
  }
  const result = {};
  if (typeof meta["reviewed"] === "boolean") {
    result.reviewed = meta["reviewed"];
  }
  return result;
}
export { readChangesetFileMeta };
