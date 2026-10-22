// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/meta/agentFeedbackAttachments.ts
import { isString } from "./module-0010.mjs";


// src/vs/platform/agentHost/common/meta/agentFeedbackAttachments.ts
var AgentFeedbackAttachmentDisplayKind = "agentFeedback";

var AgentFeedbackAttachmentMetadataKey = "agentFeedback";

function isAgentFeedbackAttachment(attachment) {
  return attachment.type === "simple" /* Simple */ && attachment.displayKind === AgentFeedbackAttachmentDisplayKind;
}

function isAgentFeedbackAnnotationsAttachment(attachment) {
  return attachment.type === "annotations" /* Annotations */ && attachment.displayKind === AgentFeedbackAttachmentDisplayKind;
}

function getAgentFeedbackAttachmentMetadata(attachment) {
  if (!isAgentFeedbackAttachment(attachment) && !isAgentFeedbackAnnotationsAttachment(attachment)) {
    return void 0;
  }
  const metadata = attachment._meta?.[AgentFeedbackAttachmentMetadataKey];
  if (!isRecord4(metadata) || !isString(metadata.sessionResource) || !Array.isArray(metadata.feedbackItems)) {
    return void 0;
  }
  const feedbackItems = [];
  for (const item of metadata.feedbackItems) {
    const parsedItem = parseAgentFeedbackAttachmentItem(item);
    if (parsedItem) {
      feedbackItems.push(parsedItem);
    }
  }
  return {
    sessionResource: metadata.sessionResource,
    feedbackItems
  };
}

function parseAgentFeedbackAttachmentItem(item) {
  if (!isRecord4(item) || !isString(item.id) || !isString(item.text) || !isString(item.resourceUri)) {
    return void 0;
  }
  const range2 = parseTextRange(item.range);
  if (!range2) {
    return void 0;
  }
  const replies = parseReplies(item.replies);
  return {
    id: item.id,
    text: item.text,
    resourceUri: item.resourceUri,
    range: range2,
    replies
  };
}

function parseReplies(value2) {
  if (!Array.isArray(value2)) {
    return void 0;
  }
  const replies = value2.filter(isString);
  return replies.length > 0 ? replies : void 0;
}

function parseTextRange(range2) {
  if (!isRecord4(range2) || !isRecord4(range2.start) || !isRecord4(range2.end)) {
    return void 0;
  }
  const start = parseTextPosition(range2.start);
  const end = parseTextPosition(range2.end);
  if (!start || !end) {
    return void 0;
  }
  return { start, end };
}

function parseTextPosition(position2) {
  if (typeof position2.line !== "number" || typeof position2.character !== "number") {
    return void 0;
  }
  return { line: position2.line, character: position2.character };
}

function isRecord4(value2) {
  return typeof value2 === "object" && value2 !== null;
}
export { isAgentFeedbackAttachment, isAgentFeedbackAnnotationsAttachment, getAgentFeedbackAttachmentMetadata, parseAgentFeedbackAttachmentItem, parseReplies, parseTextRange, parseTextPosition, isRecord4, AgentFeedbackAttachmentDisplayKind, AgentFeedbackAttachmentMetadataKey };
