// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/browser/pullRequestIconStatus.ts
import { computePullRequestIcon } from "./module-3594.mjs";


// src/vs/sessions/contrib/github/browser/pullRequestIconStatus.ts
function computePullRequestIconStatus(reader, gitHubService, owner, repo, livePR) {
  if (livePR.isDraft || livePR.state !== "open" /* Open */) {
    return {};
  }
  const ciRef = reader.store.add(gitHubService.createPullRequestCIModelReference(owner, repo, livePR.number, livePR.headSha));
  const hasFailingChecks = ciRef.object.overallStatus.read(reader) === "failure" /* Failure */;
  const reviewThreadsRef = reader.store.add(gitHubService.createPullRequestReviewThreadsModelReference(owner, repo, livePR.number));
  const hasUnresolvedComments = reviewThreadsRef.object.reviewThreads.read(reader).some((thread) => !thread.isResolved);
  return { hasFailingChecks, hasUnresolvedComments };
}

function computeLivePullRequestIcon(reader, gitHubService, owner, repo, livePR) {
  const status2 = computePullRequestIconStatus(reader, gitHubService, owner, repo, livePR);
  return computePullRequestIcon(livePR.isDraft ? "draft" : livePR.state, status2);
}

function computePullRequestRefPresentation(reader, gitHubService, iconCache, pullRequest, fallbackIcon) {
  const prLink = pullRequest.uri.toString();
  const prModelRef = reader.store.add(gitHubService.createPullRequestModelReference(pullRequest.owner, pullRequest.repo, pullRequest.number));
  const livePullRequest = prModelRef.object.pullRequest.read(reader);
  if (!livePullRequest) {
    return {
      icon: iconCache.get(prLink) ?? pullRequest.icon ?? fallbackIcon,
      title: pullRequest.title
    };
  }
  const icon2 = computeLivePullRequestIcon(reader, gitHubService, pullRequest.owner, pullRequest.repo, livePullRequest);
  iconCache.set(prLink, icon2);
  return { icon: icon2, title: livePullRequest.title };
}
export { computePullRequestIconStatus, computeLivePullRequestIcon, computePullRequestRefPresentation };
