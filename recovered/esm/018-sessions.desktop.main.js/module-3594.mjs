// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/common/types.ts
import { Codicon } from "./module-0085.mjs";
import { themeColorFromId } from "./module-0086.mjs";


// src/vs/sessions/contrib/github/common/types.ts
var OPEN_PULL_REQUEST_ACTION_ID = "workbench.agentSessions.action.openPullRequest";

var OPEN_ISSUE_ACTION_ID = "workbench.agentSessions.action.openIssue";

function computePullRequestIcon(state, status2) {
  switch (state) {
    case "merged" /* Merged */:
      return { ...Codicon.gitPullRequestDone, color: themeColorFromId("charts.purple") };
    case "closed" /* Closed */:
      return { ...Codicon.gitPullRequestClosed, color: themeColorFromId("charts.red") };
    case "draft":
      return { ...Codicon.gitPullRequestDraft, color: themeColorFromId("descriptionForeground") };
    case "open" /* Open */:
      if (status2?.hasMergeConflicts || status2?.hasFailingChecks) {
        return { ...Codicon.gitPullRequestError, color: themeColorFromId("charts.orange") };
      }
      if (status2?.hasUnresolvedComments) {
        return { ...Codicon.gitPullRequestComment, color: themeColorFromId("charts.green") };
      }
      return { ...Codicon.gitPullRequest, color: themeColorFromId("charts.green") };
  }
}

function getPullRequestStatusFromIcon(icon2) {
  switch (icon2?.id) {
    case Codicon.gitPullRequestDone.id:
      return "merged";
    case Codicon.gitPullRequestClosed.id:
      return "closed";
    case Codicon.gitPullRequestDraft.id:
      return "draft";
    case Codicon.gitPullRequest.id:
    case Codicon.gitPullRequestError.id:
    case Codicon.gitPullRequestComment.id:
      return "open";
    default:
      return void 0;
  }
}

function computeIssueIcon(state, stateReason) {
  if (state === "open" /* Open */) {
    return { ...Codicon.issueOpened, color: themeColorFromId("charts.green") };
  }
  if (stateReason === "not_planned" /* NotPlanned */ || stateReason === "duplicate" /* Duplicate */) {
    return { ...Codicon.issueClosed, color: themeColorFromId("descriptionForeground") };
  }
  return { ...Codicon.issueClosed, color: themeColorFromId("charts.purple") };
}

function computeAggregateIssueIcon(issues) {
  if (issues.length === 0 || issues.some((issue) => !issue || issue.state === "open" /* Open */)) {
    return computeIssueIcon("open" /* Open */, void 0);
  }
  const allDiscarded = issues.every((issue) => issue.stateReason === "not_planned" /* NotPlanned */ || issue.stateReason === "duplicate" /* Duplicate */);
  return computeIssueIcon("closed" /* Closed */, allDiscarded ? "not_planned" /* NotPlanned */ : "completed" /* Completed */);
}
export { computePullRequestIcon, getPullRequestStatusFromIcon, computeIssueIcon, computeAggregateIssueIcon, OPEN_PULL_REQUEST_ACTION_ID, OPEN_ISSUE_ACTION_ID };
