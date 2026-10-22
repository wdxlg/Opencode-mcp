// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/browser/fetchers/githubChangesFetcher.ts



// src/vs/sessions/contrib/github/browser/fetchers/githubChangesFetcher.ts
var GitHubChangesFetcher = class {
  constructor(_apiClient) {
    this._apiClient = _apiClient;
  }
  async getChangedFiles(owner, repo, base, head) {
    const response = await this._apiClient.request(
      "GET",
      `/repos/${e3(owner)}/${e3(repo)}/compare/${e3(base)}...${e3(head)}`,
      "githubApi.getChangedFiles"
    );
    return response.data?.files.map((file) => ({
      filename: file.filename,
      previous_filename: file.previous_filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions
    })) ?? [];
  }
};

var e3 = encodeURIComponent;
export { GitHubChangesFetcher, e3 };
