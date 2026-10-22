// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/browser/fetchers/githubRepositoryFetcher.ts



// src/vs/sessions/contrib/github/browser/fetchers/githubRepositoryFetcher.ts
var GitHubRepositoryFetcher = class {
  constructor(_apiClient) {
    this._apiClient = _apiClient;
  }
  async getRepository(owner, repo, etag2) {
    const response = await this._apiClient.request(
      "GET",
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
      "githubApi.getRepository",
      { etag: etag2 }
    );
    return {
      ...response,
      data: response.data ? {
        owner: response.data.owner.login,
        name: response.data.name,
        fullName: response.data.full_name,
        defaultBranch: response.data.default_branch,
        isPrivate: response.data.private,
        description: response.data.description ?? ""
      } : void 0
    };
  }
};
export { GitHubRepositoryFetcher };
