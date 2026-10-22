// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/github/browser/issueHover.ts
import { safeIntl } from "./module-0120.mjs";
import { $, append } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/sessions/contrib/github/browser/issueHover.ts
var issueDateFormatter = safeIntl.DateTimeFormat(void 0, { month: "short", day: "numeric" });

function createIssueHoverElement(data) {
  const hoverElement = $(".sessions-issue-hover");
  const header2 = append(hoverElement, $(".sessions-issue-hover-header"));
  const repositoryLink = document.createElement("a");
  repositoryLink.className = "sessions-issue-hover-repository";
  append(header2, repositoryLink);
  repositoryLink.href = data.repositoryHref;
  repositoryLink.textContent = `${data.owner}/${data.repo}#${data.number}`;
  repositoryLink.title = repositoryLink.textContent;
  if (data.onDidClickRepository) {
    repositoryLink.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      data.onDidClickRepository?.();
    };
  }
  const date = formatIssueDate(data.issue?.createdAt);
  if (date) {
    append(header2, $("span.sessions-issue-hover-date", void 0, localize(4806, null, date)));
  }
  append(hoverElement, $(".sessions-issue-hover-title", void 0, data.issue?.title || localize(4807, null, data.number)));
  const body = data.issue?.body.trim() || localize(4805, null);
  const description = append(hoverElement, $(".sessions-issue-hover-description"));
  append(description, $(".sessions-issue-hover-description-content", void 0, body));
  return hoverElement;
}

function formatIssueDate(value2) {
  if (!value2) {
    return void 0;
  }
  const date = new Date(value2);
  if (Number.isNaN(date.getTime())) {
    return void 0;
  }
  return issueDateFormatter.value.format(date);
}
export { createIssueHoverElement, formatIssueDate, issueDateFormatter };
