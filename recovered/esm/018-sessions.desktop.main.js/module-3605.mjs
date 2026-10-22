// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/browser/fetchers/githubPullRequestContextFetcher.ts



// src/vs/sessions/contrib/github/browser/fetchers/githubPullRequestContextFetcher.ts
var GitHubPullRequestContextFetcher = class {
  constructor(_apiClient) {
    this._apiClient = _apiClient;
  }
  async getPullRequestContext(owner, repo, number) {
    const root = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
    const [pullRequestResponse, files, issueComments, reviewComments] = await Promise.all([
      this._apiClient.request("GET", `${root}/pulls/${number}`, "githubApi.getPullRequestContext"),
      this._getAll(`${root}/pulls/${number}/files`, "githubApi.getPullRequestContextFiles"),
      this._getAll(`${root}/issues/${number}/comments`, "githubApi.getPullRequestContextIssueComments"),
      this._getAll(`${root}/pulls/${number}/comments`, "githubApi.getPullRequestContextReviewComments")
    ]);
    const pullRequest = pullRequestResponse.data;
    if (!pullRequest) {
      throw new Error(`GitHub pull request not found: ${owner}/${repo}#${number}`);
    }
    return {
      owner,
      repo,
      number: pullRequest.number,
      url: pullRequest.html_url,
      title: pullRequest.title,
      description: pullRequest.body ?? "",
      author: pullRequest.user.login,
      isDraft: pullRequest.draft,
      baseRef: pullRequest.base.ref,
      branchName: pullRequest.head.ref,
      headRef: pullRequest.head.ref,
      updatedAt: pullRequest.updated_at,
      patch: createPatch(files),
      comments: [
        ...issueComments.map((comment) => mapComment("issue", comment)),
        ...reviewComments.map((comment) => mapComment("review", comment))
      ].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.updatedAt.localeCompare(b.updatedAt))
    };
  }
  async _getAll(path, callSite) {
    const result = [];
    for (let page = 1; ; page++) {
      const response = await this._apiClient.request("GET", `${path}?per_page=100&page=${page}`, callSite);
      const items = response.data ?? [];
      result.push(...items);
      if (items.length < 100) {
        return result;
      }
    }
  }
};

function createPatch(files) {
  return files.map((file) => [
    `diff --git a/${file.filename} b/${file.filename}`,
    file.patch ?? `[Patch unavailable: ${file.status}, +${file.additions} -${file.deletions}]`
  ].join("\n")).join("\n\n");
}

function mapComment(kind, comment) {
  const reviewComment = kind === "review" ? comment : void 0;
  return {
    kind,
    author: comment.user.login,
    body: comment.body,
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
    ...reviewComment ? {
      path: reviewComment.path,
      line: reviewComment.line ?? reviewComment.original_line ?? void 0
    } : {}
  };
}
export { createPatch, mapComment, GitHubPullRequestContextFetcher };
