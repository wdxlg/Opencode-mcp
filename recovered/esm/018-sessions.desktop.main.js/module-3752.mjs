// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/browser/pullRequestPicker.ts
import { GITHUB_REMOTE_FILE_SCHEME } from "./module-1767.mjs";
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { withSessionGitHubState } from "./module-1008.mjs";
import { Codicon } from "./module-0085.mjs";
import { fromNow } from "./module-0120.mjs";
import { ThemeIcon } from "./module-0086.mjs";


// src/vs/sessions/contrib/github/browser/pullRequestPicker.ts
async function resolvePullRequestSessionRepository(sectionSessions) {
  let folderUri;
  for (const session of sectionSessions) {
    const workspace = session.workspace.get();
    for (const folder of workspace?.folders ?? []) {
      if (folder.root.scheme !== GITHUB_REMOTE_FILE_SCHEME) {
        folderUri ??= folder.root;
        const gitHubInfo = folder.gitRepository?.gitHubInfo.get();
        if (gitHubInfo) {
          return { folderUri: folder.root, owner: gitHubInfo.owner, repo: gitHubInfo.repo };
        }
      }
    }
  }
  if (!folderUri) {
    return void 0;
  }
  const identity2 = getFirstGitHubRepository(sectionSessions);
  return identity2 ? { folderUri, owner: identity2.owner, repo: identity2.repo } : void 0;
}

function getExistingPullRequests(sessions, owner, repo, repositorySessions = []) {
  const numbers = /* @__PURE__ */ new Set();
  const headRefs = /* @__PURE__ */ new Set();
  const repositorySessionSet = new Set(repositorySessions);
  const normalizedOwner = owner.toLowerCase();
  const normalizedRepo = repo.toLowerCase();
  for (const session of sessions) {
    const workspace = session.workspace.get();
    for (const folder of workspace?.folders ?? []) {
      if (folder.root.scheme === GITHUB_REMOTE_FILE_SCHEME) {
        continue;
      }
      const gitHubInfo = folder.gitRepository?.gitHubInfo.get();
      const matchesRepository = gitHubInfo ? gitHubInfo.owner.toLowerCase() === normalizedOwner && gitHubInfo.repo.toLowerCase() === normalizedRepo : repositorySessionSet.has(session);
      if (!matchesRepository) {
        continue;
      }
      if (gitHubInfo?.pullRequest) {
        numbers.add(gitHubInfo.pullRequest.number);
      }
      const upstreamBranch = folder.gitRepository?.upstreamBranchName;
      if (upstreamBranch) {
        const headRef = upstreamBranch.replace(/^[^/]+\//, "");
        headRefs.add(headRef);
        const pullRequestNumber = getPullRequestNumberFromCheckoutRef(headRef);
        if (pullRequestNumber !== void 0) {
          numbers.add(pullRequestNumber);
        }
      }
    }
  }
  return { numbers, headRefs };
}

function getPullRequestNumberFromCheckoutRef(ref) {
  const match2 = /^(?:refs\/pull\/|pull\/)(?<number>\d+)\/head$/.exec(ref);
  return match2?.groups ? Number(match2.groups.number) : void 0;
}

function getFirstGitHubRepository(sessions) {
  for (const session of sessions) {
    const workspace = session.workspace.get();
    for (const folder of workspace?.folders ?? []) {
      const gitHubInfo = folder.gitRepository?.gitHubInfo.get();
      if (gitHubInfo) {
        return { owner: gitHubInfo.owner, repo: gitHubInfo.repo };
      }
    }
  }
  return void 0;
}

function hasExistingPullRequest(pullRequest, existingPullRequests) {
  return existingPullRequests.numbers.has(pullRequest.number) || existingPullRequests.headRefs.has(pullRequest.headRef);
}

function isPullRequestAvailable(pullRequest, existingPullRequests) {
  return !pullRequest.isCrossRepository && !hasExistingPullRequest(pullRequest, existingPullRequests);
}

function createPullRequestQuickPickItems(pullRequests, existingPullRequests) {
  const available = pullRequests.filter((pullRequest) => isPullRequestAvailable(pullRequest, existingPullRequests));
  const waitingForReview = available.filter((pullRequest) => pullRequest.reviewRequestedFromViewer);
  const assigned = available.filter((pullRequest) => !pullRequest.reviewRequestedFromViewer && pullRequest.assignedToViewer);
  const other = available.filter((pullRequest) => !pullRequest.reviewRequestedFromViewer && !pullRequest.assignedToViewer);
  const items = [];
  appendGroup(items, localize(4837, null), waitingForReview);
  appendGroup(items, localize(4835, null), assigned);
  appendGroup(items, localize(4836, null), other);
  return items;
}

function pullRequestMatchesQuery(pullRequest, query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return true;
  }
  return `#${pullRequest.number} ${pullRequest.title} ${pullRequest.author.login}`.toLowerCase().includes(normalizedQuery);
}

function mergePullRequestSummaries(existing, incoming) {
  const result = [...existing];
  const indices = new Map(result.map((pullRequest, index2) => [pullRequest.number, index2]));
  for (const pullRequest of incoming) {
    const index2 = indices.get(pullRequest.number);
    if (index2 === void 0) {
      indices.set(pullRequest.number, result.length);
      result.push(pullRequest);
    } else {
      const current = result[index2];
      result[index2] = {
        ...current,
        ...pullRequest,
        reviewRequestedFromViewer: current.reviewRequestedFromViewer || pullRequest.reviewRequestedFromViewer,
        assignedToViewer: current.assignedToViewer || pullRequest.assignedToViewer
      };
    }
  }
  return result;
}

function createPullRequestBootstrapPrompt(pullRequest) {
  return `Initialize this session for pull request #${pullRequest.number}. The attached JSON is a complete pull request snapshot. For future questions about this pull request, use the attached snapshot as the primary source and do not fetch pull request data or run tools unless the user explicitly asks for refreshed information or the requested information is absent from the snapshot. Do not inspect or modify files, use tools, or take any other action until the user sends a visible follow-up request. Reply only with "Ready".`;
}

function createPullRequestSessionMetadata(owner, repo, pullRequest) {
  const pullRequestUrl = URI.from({ scheme: "https", authority: "github.com", path: `/${owner}/${repo}/pull/${pullRequest.number}` }).toString();
  return withSessionGitHubState(void 0, {
    owner,
    repo,
    pullRequestUrls: [pullRequestUrl],
    pullRequestBranchName: pullRequest.headRef
  });
}

function createPullRequestContextAttachment(context2) {
  const label3 = `#${context2.number} ${context2.title}`;
  return {
    kind: "transcriptContext",
    id: `github-pull-request:${context2.owner}/${context2.repo}#${context2.number}`,
    name: label3,
    fullName: label3,
    value: JSON.stringify({
      usageInstructions: "Use this snapshot as the primary source for questions about the pull request. Do not fetch pull request data or run tools unless the user explicitly asks for refreshed information or the requested information is absent from this snapshot.",
      ...context2
    }, void 0, 2),
    modelDescription: "Pull request details, patch, and comments as JSON.",
    icon: Codicon.gitPullRequest,
    uri: URI.parse(context2.url),
    tooltip: localize(4833, null, context2.number, context2.author)
  };
}

function appendGroup(items, label3, pullRequests) {
  if (pullRequests.length === 0) {
    return;
  }
  items.push({ type: "separator", label: label3 });
  items.push(...pullRequests.map(toQuickPickItem));
}

function toQuickPickItem(pullRequest) {
  const updated = fromNow(new Date(pullRequest.updatedAt), true, true);
  const detail2 = localize(4834, null, pullRequest.author.login, updated, pullRequest.additions, pullRequest.deletions);
  const icon2 = pullRequest.isDraft ? Codicon.gitPullRequestDraft : Codicon.gitPullRequest;
  const iconColorClass = pullRequest.isDraft ? "sessions-pull-request-draft" : "sessions-pull-request-open";
  return {
    label: `#${pullRequest.number} ${pullRequest.title}`,
    detail: detail2,
    ariaLabel: localize(4832, null, pullRequest.number, pullRequest.title, pullRequest.author.login, updated, pullRequest.additions, pullRequest.deletions),
    iconClass: `${ThemeIcon.asClassName(icon2)} ${iconColorClass}`,
    pullRequest
  };
}
export { resolvePullRequestSessionRepository, getExistingPullRequests, getPullRequestNumberFromCheckoutRef, getFirstGitHubRepository, hasExistingPullRequest, isPullRequestAvailable, createPullRequestQuickPickItems, pullRequestMatchesQuery, mergePullRequestSummaries, createPullRequestBootstrapPrompt, createPullRequestSessionMetadata, createPullRequestContextAttachment, appendGroup, toQuickPickItem };
