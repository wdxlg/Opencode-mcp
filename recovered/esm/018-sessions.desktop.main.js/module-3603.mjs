// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/browser/fetchers/githubRecentUserWorkFetcher.ts



// src/vs/sessions/contrib/github/browser/fetchers/githubRecentUserWorkFetcher.ts
var RECENT_ISSUES_QUERY = `
	query RecentAssignedIssues($query: String!) {
		search(query: $query, type: ISSUE, first: 5) {
			nodes {
				... on Issue {
					__typename
					number
					title
					url
					updatedAt
				}
			}
		}
	}
`;

var RECENT_PULL_REQUESTS_QUERY = `
	query RecentAuthoredPullRequests($query: String!) {
		search(query: $query, type: ISSUE, first: 5) {
			nodes {
				... on PullRequest {
					__typename
					number
					title
					url
					updatedAt
					mergeable
					commits(last: 1) {
						nodes {
							commit {
								committedDate
								statusCheckRollup {
									state
								}
							}
						}
					}
				}
			}
		}
	}
`;

var PULL_REQUEST_REVIEW_THREADS_QUERY = `
	query PullRequestReviewThreads($owner: String!, $repo: String!, $pullRequestNumber: Int!) {
		repository(owner: $owner, name: $repo) {
			pullRequest(number: $pullRequestNumber) {
				reviewThreads(first: 100) {
					nodes {
						isResolved
						comments(last: 1) {
							nodes {
								createdAt
							}
						}
					}
				}
			}
		}
	}
`;

var GitHubRecentUserWorkFetcher = class {
  constructor(_apiClient) {
    this._apiClient = _apiClient;
  }
  async getRecentAssignedIssues(owner, repo, token) {
    const data = await this._apiClient.graphql(
      RECENT_ISSUES_QUERY,
      "githubApi.getRecentAssignedIssues",
      { query: `repo:${owner}/${repo} is:issue is:open assignee:@me sort:updated-desc` },
      { token, createAuthenticationSession: false }
    );
    return (data.search.nodes ?? []).filter(isDefined2).map((issue) => ({ number: issue.number, title: issue.title, url: issue.url, updatedAt: issue.updatedAt }));
  }
  async getRecentAuthoredPullRequests(owner, repo, token) {
    const data = await this._apiClient.graphql(
      RECENT_PULL_REQUESTS_QUERY,
      "githubApi.getRecentAuthoredPullRequests",
      { query: `repo:${owner}/${repo} is:pr is:open author:@me sort:updated-desc` },
      { token, createAuthenticationSession: false }
    );
    return (data.search.nodes ?? []).filter(isDefined2).map((pullRequest) => {
      const latestCommit = pullRequest.commits.nodes?.find(isDefined2)?.commit;
      return {
        number: pullRequest.number,
        title: pullRequest.title,
        url: pullRequest.url,
        updatedAt: pullRequest.updatedAt,
        hasMergeConflicts: pullRequest.mergeable === "CONFLICTING",
        statusCheckRollupState: latestCommit?.statusCheckRollup?.state,
        latestCommitAt: latestCommit?.committedDate
      };
    });
  }
  async getPullRequestReviewThreads(owner, repo, pullRequestNumber, token) {
    const data = await this._apiClient.graphql(
      PULL_REQUEST_REVIEW_THREADS_QUERY,
      "githubApi.getPullRequestReviewThreads",
      { owner, repo, pullRequestNumber },
      { token, createAuthenticationSession: false }
    );
    return (data.repository?.pullRequest?.reviewThreads.nodes ?? []).filter(isDefined2).map((thread) => ({
      isResolved: thread.isResolved,
      latestCommentAt: thread.comments.nodes?.find(isDefined2)?.createdAt
    }));
  }
  async getIssuesWithLinkedPullRequests(owner, repo, issueNumbers, token) {
    if (issueNumbers.length === 0) {
      return /* @__PURE__ */ new Set();
    }
    const issueVariables = issueNumbers.map((_, index2) => `$issue${index2}: Int!`).join(", ");
    const issueSelections = issueNumbers.map((_, index2) => `
			issue${index2}: issue(number: $issue${index2}) {
				closedByPullRequestsReferences(first: 1, includeClosedPrs: true) {
					totalCount
				}
			}
		`).join("");
    const query = `
			query IssueLinkage($owner: String!, $repo: String!, ${issueVariables}) {
				repository(owner: $owner, name: $repo) {
					${issueSelections}
				}
			}
		`;
    const variables = { owner, repo };
    issueNumbers.forEach((issueNumber, index2) => variables[`issue${index2}`] = issueNumber);
    const data = await this._apiClient.graphql(
      query,
      "githubApi.getIssuesWithLinkedPullRequests",
      variables,
      { token, createAuthenticationSession: false }
    );
    const linkedIssueNumbers = /* @__PURE__ */ new Set();
    issueNumbers.forEach((issueNumber, index2) => {
      if ((data.repository?.[`issue${index2}`]?.closedByPullRequestsReferences?.totalCount ?? 0) > 0) {
        linkedIssueNumbers.add(issueNumber);
      }
    });
    return linkedIssueNumbers;
  }
};

function isDefined2(value2) {
  return value2 !== null && value2 !== void 0;
}
export { isDefined2, RECENT_ISSUES_QUERY, RECENT_PULL_REQUESTS_QUERY, PULL_REQUEST_REVIEW_THREADS_QUERY, GitHubRecentUserWorkFetcher };
