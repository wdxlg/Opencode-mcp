// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/githubIssueReferences.ts



// src/vs/platform/agentHost/common/githubIssueReferences.ts
var ISSUE_URL_PATTERN = /^https?:\/\/(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+)\/issues\/(\d+)\b/i;

function parseGitHubIssueUrl(url) {
  const match2 = ISSUE_URL_PATTERN.exec(url);
  if (!match2) {
    return void 0;
  }
  const number = Number(match2[3]);
  return Number.isSafeInteger(number) && number > 0 ? { owner: match2[1], repo: match2[2], number } : void 0;
}
export { parseGitHubIssueUrl, ISSUE_URL_PATTERN };
