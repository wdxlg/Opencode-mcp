// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/browser/pullRequestHover.ts
import { safeIntl } from "./module-0120.mjs";
import { $, append } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/sessions/contrib/github/browser/pullRequestHover.ts
var pullRequestDateFormatter = safeIntl.DateTimeFormat(void 0, { month: "short", day: "numeric" });

function createPullRequestHoverElement(data) {
  const hoverElement = $(".sessions-pr-hover");
  const header2 = append(hoverElement, $(".sessions-pr-hover-header"));
  const repositoryLink = document.createElement("a");
  repositoryLink.className = "sessions-pr-hover-repository";
  append(header2, repositoryLink);
  repositoryLink.href = data.repositoryHref;
  repositoryLink.textContent = `${data.owner}/${data.repo}`;
  repositoryLink.title = repositoryLink.textContent;
  if (data.onDidClickRepository) {
    repositoryLink.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      data.onDidClickRepository?.();
    };
  }
  const date = formatPullRequestDate(data.pullRequest?.createdAt);
  if (date) {
    append(header2, $("span.sessions-pr-hover-date", void 0, localize(4830, null, date)));
  }
  append(hoverElement, $(".sessions-pr-hover-title", void 0, data.pullRequest?.title || localize(4831, null, data.number)));
  const body = data.pullRequest?.body.trim() || localize(4828, null);
  const description = append(hoverElement, $(".sessions-pr-hover-description"));
  append(description, $(".sessions-pr-hover-description-content", void 0, body));
  const branchRow = append(hoverElement, $(".sessions-pr-hover-branches"));
  appendBranchPill(branchRow, data.pullRequest?.baseRef || localize(4827, null));
  append(branchRow, $("span.sessions-pr-hover-branch-arrow", void 0, "\u2190"));
  appendBranchPill(branchRow, data.pullRequest?.headRef || localize(4829, null));
  return hoverElement;
}

function appendBranchPill(container2, label3) {
  const branch = append(container2, $("span.sessions-pr-hover-branch", void 0, label3));
  branch.title = label3;
}

function formatPullRequestDate(value2) {
  if (!value2) {
    return void 0;
  }
  const date = new Date(value2);
  if (Number.isNaN(date.getTime())) {
    return void 0;
  }
  return pullRequestDateFormatter.value.format(date);
}
export { createPullRequestHoverElement, appendBranchPill, formatPullRequestDate, pullRequestDateFormatter };
