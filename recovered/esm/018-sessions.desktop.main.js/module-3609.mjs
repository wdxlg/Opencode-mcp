// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/agentFeedback/browser/sessionEditorComments.ts
import { Range2 } from "./module-0106.mjs";


// src/vs/sessions/contrib/agentFeedback/browser/sessionEditorComments.ts
function getPRReviewComments(prReviewState) {
  return prReviewState?.kind === "loaded" /* Loaded */ ? prReviewState.comments : [];
}

function getSessionEditorComments(sessionResource, agentFeedbackItems, prReviewState, visibleResolvedFeedbackIds) {
  const comments = [];
  const supersededPRCommentIds = /* @__PURE__ */ new Set();
  for (const item of agentFeedbackItems) {
    if (item.kind === "prReview" /* PRReview */ && item.sourcePRReviewCommentId && item.state !== "created" /* Created */) {
      supersededPRCommentIds.add(item.sourcePRReviewCommentId);
    }
  }
  for (const item of agentFeedbackItems) {
    if (item.state === "resolved" /* Resolved */ && !visibleResolvedFeedbackIds?.has(item.id)) {
      continue;
    }
    if (item.kind === "prReview" /* PRReview */ && item.state === "created" /* Created */ && item.sourcePRReviewCommentId) {
      continue;
    }
    comments.push({
      id: toSessionEditorCommentId("agentFeedback" /* AgentFeedback */, item.id),
      sourceId: item.id,
      source: "agentFeedback" /* AgentFeedback */,
      kind: item.kind,
      sessionResource,
      resourceUri: item.resourceUri,
      range: item.range,
      text: item.text,
      suggestion: item.suggestion,
      sourcePullRequest: item.sourcePullRequest,
      canConvertToAgentFeedback: false,
      replies: item.replies,
      state: item.state
    });
  }
  for (const item of getPRReviewComments(prReviewState)) {
    if (supersededPRCommentIds.has(item.id)) {
      continue;
    }
    comments.push({
      id: toSessionEditorCommentId("prReview" /* PRReview */, item.id),
      sourceId: item.id,
      source: "prReview" /* PRReview */,
      kind: "prReview" /* PRReview */,
      sessionResource,
      resourceUri: item.uri,
      range: item.range,
      text: item.body,
      sourcePullRequest: {
        owner: item.pullRequest.owner,
        repo: item.pullRequest.repo,
        number: item.pullRequest.number
      },
      canConvertToAgentFeedback: true
    });
  }
  comments.sort(compareSessionEditorComments);
  return comments;
}

function compareSessionEditorComments(a, b) {
  return a.resourceUri.toString().localeCompare(b.resourceUri.toString()) || Range2.compareRangesUsingStarts(Range2.lift(a.range), Range2.lift(b.range)) || a.source.localeCompare(b.source) || a.sourceId.localeCompare(b.sourceId);
}

function estimateExpandedCommentLines(comment) {
  const charsPerLine = 50;
  const textLines = Math.ceil(Math.max(1, comment.text.length) / charsPerLine);
  let suggestionLines = 0;
  if (comment.suggestion?.edits.length) {
    for (const edit3 of comment.suggestion.edits) {
      suggestionLines += 2 + Math.max(1, edit3.newText.split("\n").length);
    }
  }
  let replyLines = 0;
  if (comment.replies?.length) {
    for (const reply of comment.replies) {
      replyLines += Math.ceil(Math.max(1, reply.text.length) / charsPerLine);
    }
  }
  return textLines + 1 + suggestionLines + replyLines;
}

function groupNearbySessionEditorComments(items, lineThreshold = 5) {
  if (items.length === 0) {
    return [];
  }
  const sorted = [...items].sort(compareSessionEditorComments);
  const groups = [];
  let currentGroup = [sorted[0]];
  let currentGroupExpandedLines = estimateExpandedCommentLines(sorted[0]);
  for (let i2 = 1; i2 < sorted.length; i2++) {
    const firstItem = currentGroup[0];
    const currentItem = sorted[i2];
    const sameResource = currentItem.resourceUri.toString() === firstItem.resourceUri.toString();
    const verticalSpan = currentItem.range.startLineNumber - firstItem.range.startLineNumber;
    const effectiveThreshold = lineThreshold + currentGroupExpandedLines;
    if (sameResource && verticalSpan <= effectiveThreshold) {
      currentGroup.push(currentItem);
      currentGroupExpandedLines += estimateExpandedCommentLines(currentItem);
    } else {
      groups.push(currentGroup);
      currentGroup = [currentItem];
      currentGroupExpandedLines = estimateExpandedCommentLines(currentItem);
    }
  }
  groups.push(currentGroup);
  return groups;
}

function toSessionEditorCommentId(source, sourceId) {
  return `${source}:${sourceId}`;
}

function fromSessionEditorCommentId(id2) {
  const separatorIndex = id2.indexOf(":");
  if (separatorIndex === -1) {
    return void 0;
  }
  const source = id2.slice(0, separatorIndex);
  if (source !== "agentFeedback" /* AgentFeedback */ && source !== "prReview" /* PRReview */) {
    return void 0;
  }
  return { source, sourceId: id2.slice(separatorIndex + 1) };
}

function getAcceptedAgentFeedbackCommentCount(comments) {
  let count2 = 0;
  for (const comment of comments) {
    if (comment.source === "agentFeedback" /* AgentFeedback */ && comment.state === "accepted" /* Accepted */) {
      count2++;
    }
  }
  return count2;
}
export { getPRReviewComments, getSessionEditorComments, compareSessionEditorComments, estimateExpandedCommentLines, groupNearbySessionEditorComments, toSessionEditorCommentId, fromSessionEditorCommentId, getAcceptedAgentFeedbackCommentCount };
