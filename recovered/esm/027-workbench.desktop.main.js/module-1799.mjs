// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/github/common/pullRequestInterests.ts



// src/vs/platform/github/common/pullRequestInterests.ts
var priorityRank = {
  background: 0,
  visible: 1,
  interactive: 2
};

function unionPullRequestInterests(options3) {
  const result = /* @__PURE__ */ new Map();
  for (const value2 of options3) {
    merge2(result, "core", { priority: value2.priority });
    if (value2.conversation?.topLevelComments) {
      merge2(result, "topLevelComments", { priority: value2.priority, includeBodies: value2.conversation.includeBodies === true });
    }
    if (value2.conversation?.submittedReviews) {
      merge2(result, "submittedReviews", { priority: value2.priority, includeBodies: value2.conversation.includeBodies === true });
    }
    if (value2.conversation?.inlineComments) {
      merge2(result, "inlineComments", { priority: value2.priority, includeBodies: value2.conversation.includeBodies === true });
    }
    if (value2.conversation?.reviewThreads) {
      merge2(result, "reviewThreads", { priority: value2.priority, includeBodies: value2.conversation.includeBodies === true });
    }
    if (value2.checks) {
      merge2(result, "checks", {
        priority: value2.priority,
        requiredChecks: value2.checks.required === true,
        includeOptionalChecks: value2.checks.includeOptional === true
      });
    }
    if (value2.mergeability) {
      merge2(result, "mergeability", { priority: value2.priority });
    }
    if (value2.participants) {
      merge2(result, "participants", { priority: value2.priority });
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

function merge2(result, fragment, incoming) {
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
export { unionPullRequestInterests, pullRequestOptionsForFragment, merge2, priorityRank };
