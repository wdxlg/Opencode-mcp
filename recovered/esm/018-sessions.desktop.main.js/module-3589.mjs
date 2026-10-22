// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackAttachmentEntry.ts
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { basename2, isEqualOrParent2, relativePath } from "./module-0034.mjs";
import { authorForFeedbackKind } from "./module-2214.mjs";
import { Schemas } from "./module-0033.mjs";


// src/vs/sessions/contrib/agentFeedback/browser/agentFeedbackAttachmentEntry.ts
var ATTACHMENT_ID_PREFIX = "agentFeedback:";

function createAgentFeedbackVariableEntry(sessionResource, feedbackItems, annotationsResource) {
  return {
    kind: "agentFeedback",
    id: ATTACHMENT_ID_PREFIX + sessionResource.toString(),
    name: feedbackItems.length === 1 ? localize(4038, null) : localize(4037, null, feedbackItems.length),
    icon: Codicon.comment,
    sessionResource,
    annotationsResource,
    feedbackItems: feedbackItems.map((f) => ({
      id: f.id,
      text: f.text,
      resourceUri: f.resourceUri,
      range: f.range,
      codeSelection: f.codeSelection,
      diffHunks: f.diffHunks,
      sourcePRReviewCommentId: f.sourcePRReviewCommentId,
      sourcePullRequest: f.sourcePullRequest,
      replies: f.replies?.map((reply) => reply.text)
    })),
    value: buildAgentFeedbackValue(feedbackItems)
  };
}

function buildAgentFeedbackValue(feedbackItems) {
  const parts = ["The following comments were made on the code changes:"];
  for (const item of feedbackItems) {
    const fileName = basename2(item.resourceUri);
    const lineRef = item.range.startLineNumber === item.range.endLineNumber ? `${item.range.startLineNumber}` : `${item.range.startLineNumber}-${item.range.endLineNumber}`;
    let part = `[${fileName}:${lineRef}]`;
    if (item.sourcePRReviewCommentId) {
      const pullRequest = item.sourcePullRequest ? ` on ${item.sourcePullRequest.owner}/${item.sourcePullRequest.repo}#${item.sourcePullRequest.number}` : "";
      part += `
(PR review comment${pullRequest}, thread ID: ${item.sourcePRReviewCommentId} \u2014 resolve this thread when addressed)`;
    }
    if (item.codeSelection) {
      part += `
Selection:
\`\`\`
${item.codeSelection}
\`\`\``;
    }
    if (item.diffHunks) {
      part += `
Diff Hunks:
\`\`\`diff
${item.diffHunks}
\`\`\``;
    }
    part += `
Comment (${authorForFeedbackKind(item.kind)}): ${item.text}`;
    if (item.replies?.length) {
      for (const reply of item.replies) {
        part += `
Reply (${reply.author}): ${reply.text}`;
      }
    }
    parts.push(part);
  }
  return parts.join("\n\n");
}

function buildNewSessionPrompt(prompt, feedbackItems, workspaceRoots) {
  const parts = [];
  const trimmedPrompt = prompt.trim();
  if (trimmedPrompt) {
    parts.push(trimmedPrompt);
  }
  const useCommentBullets = !!trimmedPrompt || feedbackItems.length !== 1;
  for (const item of feedbackItems) {
    const location2 = formatFeedbackLocation(item, workspaceRoots);
    parts.push(formatPromptLine(`${item.text} (${location2})`, useCommentBullets ? "- " : "", useCommentBullets ? "  " : ""));
    for (const reply of item.replies ?? []) {
      parts.push(formatPromptLine(`reply: ${reply.text}`, "  - ", "    "));
    }
  }
  return parts.join("\n");
}

function formatFeedbackLocation(item, workspaceRoots) {
  const containingRoot = workspaceRoots.find((root) => isEqualOrParent2(item.resourceUri, root));
  const workspaceRelativePath = containingRoot && relativePath(containingRoot, item.resourceUri);
  const resourcePath = workspaceRelativePath || (item.resourceUri.scheme === Schemas.file ? item.resourceUri.fsPath.replaceAll("\\", "/") : item.resourceUri.path);
  return `${resourcePath}:${item.range.startLineNumber}:${item.range.startColumn}-${item.range.endLineNumber}:${item.range.endColumn}`;
}

function formatPromptLine(text2, prefix, continuationPrefix) {
  return prefix + text2.replace(/\r?\n/g, `
${continuationPrefix}`);
}
export { createAgentFeedbackVariableEntry, buildAgentFeedbackValue, buildNewSessionPrompt, formatFeedbackLocation, formatPromptLine, ATTACHMENT_ID_PREFIX };
