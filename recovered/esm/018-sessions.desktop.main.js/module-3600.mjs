// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/browser/fetchers/githubIssueFetcher.ts



// src/vs/sessions/contrib/github/browser/fetchers/githubIssueFetcher.ts
var GitHubIssueFetcher = class {
  constructor(_apiClient) {
    this._apiClient = _apiClient;
  }
  async getIssue(owner, repo, issueNumber, etag2) {
    const response = await this._apiClient.request(
      "GET",
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/issues/${issueNumber}`,
      "githubApi.getIssue",
      { etag: etag2 }
    );
    return {
      ...response,
      data: response.data ? mapIssue(response.data) : void 0
    };
  }
};

function mapIssue(data) {
  return {
    number: data.number,
    title: data.title,
    body: data.body ?? "",
    state: data.state === "closed" ? "closed" /* Closed */ : "open" /* Open */,
    stateReason: mapStateReason(data.state_reason),
    author: { login: data.user.login, avatarUrl: data.user.avatar_url },
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    closedAt: data.closed_at ?? void 0
  };
}

function mapStateReason(value2) {
  switch (value2) {
    case "completed":
      return "completed" /* Completed */;
    case "not_planned":
      return "not_planned" /* NotPlanned */;
    case "duplicate":
      return "duplicate" /* Duplicate */;
    case "reopened":
      return "reopened" /* Reopened */;
    default:
      return void 0;
  }
}
export { mapIssue, mapStateReason, GitHubIssueFetcher };
