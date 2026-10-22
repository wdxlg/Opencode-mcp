// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/common/utils.ts
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { GITHUB_REMOTE_FILE_SCHEME } from "./module-1767.mjs";


// src/vs/sessions/contrib/github/common/utils.ts
function toPRContentUri(fileName, params) {
  return URI.from({
    scheme: Schemas.copilotPr,
    path: `/${fileName}`,
    query: JSON.stringify({ ...params, fileName })
  });
}

function getPullRequestKey(owner, repo, prNumber) {
  return `${owner}/${repo}/${prNumber}`;
}

function parseGitHubPullRequestUrl(url) {
  const match2 = /^https:\/\/github\.com\/(?<owner>[^/]+)\/(?<repo>[^/]+)\/pull\/(?<number>\d+)\/?$/.exec(url);
  const groups = match2?.groups;
  return groups ? { owner: groups["owner"], repo: groups["repo"], number: Number(groups["number"]) } : void 0;
}

function getGitHubRepositoryFromUri(uri4) {
  if (uri4.scheme !== GITHUB_REMOTE_FILE_SCHEME) {
    return void 0;
  }
  const segments = uri4.path.split("/").filter(Boolean);
  if (segments.length < 2) {
    return void 0;
  }
  try {
    return {
      owner: decodeURIComponent(segments[0]),
      repo: decodeURIComponent(segments[1])
    };
  } catch {
    return void 0;
  }
}
export { toPRContentUri, getPullRequestKey, parseGitHubPullRequestUrl, getGitHubRepositoryFromUri };
