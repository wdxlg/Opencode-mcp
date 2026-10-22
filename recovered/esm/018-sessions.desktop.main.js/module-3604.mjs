// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/browser/fetchers/githubPullRequestsFetcher.ts



// src/vs/sessions/contrib/github/browser/fetchers/githubPullRequestsFetcher.ts
var LIST_PULL_REQUESTS_QUERY = [
  "query ListPullRequests($owner: String!, $repo: String!, $cursor: String) {",
  "  repository(owner: $owner, name: $repo) {",
  "    pullRequests(first: 100, after: $cursor, states: OPEN, orderBy: { field: UPDATED_AT, direction: DESC }) {",
  "      nodes {",
  "        number",
  "        title",
  "        author { login avatarUrl }",
  "        headRefName",
  "        isCrossRepository",
  "        isDraft",
  "        updatedAt",
  "        additions",
  "        deletions",
  "      }",
  "      pageInfo { endCursor hasNextPage }",
  "    }",
  "  }",
  "}"
].join("\n");

var LIST_PULL_REQUEST_NUMBERS_QUERY = [
  "query ListPullRequestsByViewerGroup($query: String!) {",
  "  search(first: 100, query: $query, type: ISSUE) {",
  "    nodes {",
  "      ... on PullRequest {",
  "        number",
  "        title",
  "        author { login avatarUrl }",
  "        headRefName",
  "        isCrossRepository",
  "        isDraft",
  "        updatedAt",
  "        additions",
  "        deletions",
  "      }",
  "    }",
  "  }",
  "}"
].join("\n");

var GitHubPullRequestsFetcher = class {
  constructor(_apiClient) {
    this._apiClient = _apiClient;
  }
  async getPullRequests(owner, repo, cursor) {
    const data = await this._apiClient.graphql(
      LIST_PULL_REQUESTS_QUERY,
      "githubApi.listPullRequests",
      { owner, repo, cursor: cursor ?? null }
    );
    if (!data.repository) {
      throw new Error(`GitHub repository not found: ${owner}/${repo}`);
    }
    const connection = data.repository.pullRequests;
    return {
      pullRequests: connection.nodes.map((pullRequest) => mapPullRequest2(pullRequest, false, false)),
      cursor: connection.pageInfo.endCursor ?? void 0,
      hasNextPage: connection.pageInfo.hasNextPage
    };
  }
  getPullRequestsWaitingForReview(owner, repo) {
    const repositoryQuery = `repo:${owner}/${repo} is:pr is:open`;
    return this._getPullRequestsByQuery(`${repositoryQuery} review-requested:@me sort:updated-desc`, "githubApi.listPullRequestsWaitingForReview", true, false);
  }
  getPullRequestsAssignedToViewer(owner, repo) {
    const repositoryQuery = `repo:${owner}/${repo} is:pr is:open`;
    return this._getPullRequestsByQuery(`${repositoryQuery} assignee:@me sort:updated-desc`, "githubApi.listPullRequestsAssignedToViewer", false, true);
  }
  async _getPullRequestsByQuery(query, callSite, reviewRequestedFromViewer, assignedToViewer) {
    const data = await this._apiClient.graphql(
      LIST_PULL_REQUEST_NUMBERS_QUERY,
      callSite,
      { query }
    );
    return data.search.nodes.flatMap((node) => node ? [mapPullRequest2(node, reviewRequestedFromViewer, assignedToViewer)] : []);
  }
};

function mapPullRequest2(pullRequest, reviewRequestedFromViewer, assignedToViewer) {
  return {
    number: pullRequest.number,
    title: pullRequest.title,
    author: pullRequest.author ?? { login: "ghost", avatarUrl: "" },
    headRef: pullRequest.headRefName,
    checkoutRef: `refs/pull/${pullRequest.number}/head`,
    isCrossRepository: pullRequest.isCrossRepository,
    isDraft: pullRequest.isDraft,
    updatedAt: pullRequest.updatedAt,
    additions: pullRequest.additions,
    deletions: pullRequest.deletions,
    reviewRequestedFromViewer,
    assignedToViewer
  };
}
export { mapPullRequest2, LIST_PULL_REQUESTS_QUERY, LIST_PULL_REQUEST_NUMBERS_QUERY, GitHubPullRequestsFetcher };
