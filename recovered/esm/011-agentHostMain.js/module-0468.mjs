// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/github/common/pullRequestRequestPlanner.ts



// src/vs/platform/github/common/pullRequestRequestPlanner.ts
var PullRequestRequestPlanner = class {
  plan(fragment, priority, capabilities) {
    const requestPriority = toGitHubRequestPriority(priority);
    switch (fragment) {
      case "core":
      case "topLevelComments":
      case "submittedReviews":
      case "inlineComments":
        return { fragment, strategy: "rest", priority: requestPriority, completeWhenSuccessful: true };
      case "reviewThreads":
        return capabilities.graphql && capabilities.reviewThreads ? { fragment, strategy: "graphql", priority: requestPriority, completeWhenSuccessful: true } : { fragment, strategy: "unavailable", priority: requestPriority, completeWhenSuccessful: false };
      case "checks":
        return capabilities.graphql ? { fragment, strategy: "graphql", priority: requestPriority, completeWhenSuccessful: capabilities.checkContextRequiredness } : { fragment, strategy: "restChecksFallback", priority: requestPriority, completeWhenSuccessful: false };
      case "mergeability":
        return capabilities.graphql ? { fragment, strategy: "graphql", priority: requestPriority, completeWhenSuccessful: true } : { fragment, strategy: "restMergeabilityFallback", priority: requestPriority, completeWhenSuccessful: false };
      case "participants":
        return { fragment, strategy: "rest", priority: requestPriority, completeWhenSuccessful: true };
    }
  }
};

function toGitHubRequestPriority(priority) {
  switch (priority) {
    case "interactive":
      return "interactive";
    case "visible":
      return "visible";
    case "background":
      return "background";
  }
}
export { toGitHubRequestPriority, PullRequestRequestPlanner };
