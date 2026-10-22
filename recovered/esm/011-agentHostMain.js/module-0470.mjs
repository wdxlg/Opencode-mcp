// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/github/common/pullRequestInterests.ts



// src/vs/platform/github/common/pullRequestInterests.ts
var priorityRank = {
  background: 0,
  visible: 1,
  interactive: 2
};

function unionPullRequestInterests(options) {
  const result = /* @__PURE__ */ new Map();
  for (const value of options) {
    merge(result, "core", { priority: value.priority });
    if (value.conversation?.topLevelComments) {
      merge(result, "topLevelComments", { priority: value.priority, includeBodies: value.conversation.includeBodies === true });
    }
    if (value.conversation?.submittedReviews) {
      merge(result, "submittedReviews", { priority: value.priority, includeBodies: value.conversation.includeBodies === true });
    }
    if (value.conversation?.inlineComments) {
      merge(result, "inlineComments", { priority: value.priority, includeBodies: value.conversation.includeBodies === true });
    }
    if (value.conversation?.reviewThreads) {
      merge(result, "reviewThreads", { priority: value.priority, includeBodies: value.conversation.includeBodies === true });
    }
    if (value.checks) {
      merge(result, "checks", {
        priority: value.priority,
        requiredChecks: value.checks.required === true,
        includeOptionalChecks: value.checks.includeOptional === true
      });
    }
    if (value.mergeability) {
      merge(result, "mergeability", { priority: value.priority });
    }
    if (value.participants) {
      merge(result, "participants", { priority: value.priority });
    }
  }
  return result;
}

function pullRequestOptionsForFragment(fragment, interest) {
  switch (fragment) {
    case "topLevelComments":
      return { priority: interest.priority, conversation: { topLevelComments: true, includeBodies: interest.includeBodies } };
    case "submittedReviews":
      return { priority: interest.priority, conversation: { submittedReviews: true, includeBodies: interest.includeBodies } };
    case "inlineComments":
      return { priority: interest.priority, conversation: { inlineComments: true, includeBodies: interest.includeBodies } };
    case "reviewThreads":
      return { priority: interest.priority, conversation: { reviewThreads: true, includeBodies: interest.includeBodies } };
    case "checks":
      return {
        priority: interest.priority,
        checks: { required: interest.requiredChecks, includeOptional: interest.includeOptionalChecks }
      };
    case "mergeability":
      return { priority: interest.priority, mergeability: true };
    case "participants":
      return { priority: interest.priority, participants: true };
    case "core":
      return { priority: interest.priority, core: true };
  }
}

function merge(result, fragment, incoming) {
  const current = result.get(fragment);
  if (!current) {
    result.set(fragment, incoming);
    return;
  }
  result.set(fragment, {
    priority: priorityRank[incoming.priority] > priorityRank[current.priority] ? incoming.priority : current.priority,
    includeBodies: current.includeBodies === true || incoming.includeBodies === true,
    requiredChecks: current.requiredChecks === true || incoming.requiredChecks === true,
    includeOptionalChecks: current.includeOptionalChecks === true || incoming.includeOptionalChecks === true
  });
}
export { unionPullRequestInterests, pullRequestOptionsForFragment, merge, priorityRank };
