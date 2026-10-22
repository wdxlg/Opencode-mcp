// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/meta/agentFeedbackAnnotations.ts



// src/vs/platform/agentHost/common/meta/agentFeedbackAnnotations.ts
var FEEDBACK_ANNOTATION_META_KEY = "vscode.agentFeedback";

var VIEW_UNREVIEWED_COMMENTS_TOOL_NAME = "viewUnreviewedComments";

var ADD_COMMENT_TOOL_NAME = "addComment";

function isAgentFeedbackKindValue(value) {
  return value === "user" || value === "codeReview" || value === "prReview";
}

function isAgentFeedbackStateValue(value) {
  return value === "created" || value === "accepted" || value === "submitted" || value === "resolved";
}

function isFeedbackPullRequest(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const candidate = value;
  return typeof candidate.owner === "string" && typeof candidate.repo === "string" && typeof candidate.number === "number";
}

function isAgentFeedbackAuthorValue(value) {
  return value === "user" || value === "agent" || value === "prReviewer" || value === "unknown";
}

function authorForFeedbackKind(kind) {
  switch (kind) {
    case "user":
      return "user";
    case "codeReview":
      return "agent";
    case "prReview":
      return "prReviewer";
    default:
      return "unknown";
  }
}

function feedbackAnnotationEntryMeta(author) {
  return { [FEEDBACK_ANNOTATION_META_KEY]: { author } };
}

function readFeedbackAnnotationEntryAuthor(entry) {
  const meta = entry._meta;
  const slot = meta?.[FEEDBACK_ANNOTATION_META_KEY];
  if (!slot || typeof slot !== "object" || Array.isArray(slot)) {
    return void 0;
  }
  const author = slot["author"];
  return isAgentFeedbackAuthorValue(author) ? author : void 0;
}

function resolveFeedbackEntryAuthor(entry, index, kind) {
  return readFeedbackAnnotationEntryAuthor(entry) ?? (index === 0 ? authorForFeedbackKind(kind) : "user");
}

function readFeedbackAnnotationMeta(annotation) {
  const meta = annotation._meta;
  const slot = meta?.[FEEDBACK_ANNOTATION_META_KEY];
  if (!slot || typeof slot !== "object" || Array.isArray(slot)) {
    return void 0;
  }
  const raw = slot;
  if (!isAgentFeedbackKindValue(raw["kind"]) || !isAgentFeedbackStateValue(raw["state"]) || typeof raw["sessionResource"] !== "string") {
    return void 0;
  }
  const result = { kind: raw["kind"], state: raw["state"], sessionResource: raw["sessionResource"] };
  if (raw["suggestion"] !== void 0) {
    result.suggestion = raw["suggestion"];
  }
  if (typeof raw["codeSelection"] === "string") {
    result.codeSelection = raw["codeSelection"];
  }
  if (typeof raw["diffHunks"] === "string") {
    result.diffHunks = raw["diffHunks"];
  }
  if (typeof raw["sourcePRReviewCommentId"] === "string") {
    result.sourcePRReviewCommentId = raw["sourcePRReviewCommentId"];
  }
  if (isFeedbackPullRequest(raw["sourcePullRequest"])) {
    result.sourcePullRequest = raw["sourcePullRequest"];
  }
  if (typeof raw["pendingAgentReveal"] === "boolean") {
    result.pendingAgentReveal = raw["pendingAgentReveal"];
  }
  return result;
}
export { isAgentFeedbackKindValue, isAgentFeedbackStateValue, isFeedbackPullRequest, isAgentFeedbackAuthorValue, authorForFeedbackKind, feedbackAnnotationEntryMeta, readFeedbackAnnotationEntryAuthor, resolveFeedbackEntryAuthor, readFeedbackAnnotationMeta, FEEDBACK_ANNOTATION_META_KEY, VIEW_UNREVIEWED_COMMENTS_TOOL_NAME, ADD_COMMENT_TOOL_NAME };
