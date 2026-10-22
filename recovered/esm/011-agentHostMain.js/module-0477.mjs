// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/gitDiffContent.ts
import { URI } from "./module-0023.mjs";


// src/vs/platform/agentHost/node/gitDiffContent.ts
var GIT_BLOB_SCHEME = "git-blob";

function buildGitBlobUri(sessionUri, sha, repoRelativePath, absolutePath) {
  return URI.from({
    scheme: GIT_BLOB_SCHEME,
    path: absolutePath,
    query: JSON.stringify({ sessionUri, sha, repoRelativePath })
  }).toString();
}

function parseGitBlobUri(raw) {
  let parsed;
  try {
    parsed = URI.parse(raw);
  } catch {
    return void 0;
  }
  if (parsed.scheme !== GIT_BLOB_SCHEME || !parsed.query) {
    return void 0;
  }
  try {
    const query = JSON.parse(parsed.query);
    if (typeof query.sessionUri === "string" && typeof query.sha === "string" && typeof query.repoRelativePath === "string") {
      return {
        sessionUri: query.sessionUri,
        sha: query.sha,
        repoRelativePath: query.repoRelativePath,
        absolutePath: parsed.path
      };
    }
  } catch {
    return void 0;
  }
  return void 0;
}
export { buildGitBlobUri, parseGitBlobUri, GIT_BLOB_SCHEME };
