// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/meta/agentFeedbackAttachments.ts
import { isString } from "./module-0008.mjs";


// src/vs/platform/agentHost/common/meta/agentFeedbackAttachments.ts
var AgentFeedbackAttachmentDisplayKind = "agentFeedback";

function isAgentFeedbackAnnotationsAttachment(attachment) {
  return attachment.type === "annotations" /* Annotations */ && attachment.displayKind === AgentFeedbackAttachmentDisplayKind;
}

function renderAgentFeedbackAnnotationsAttachment(attachment) {
  const ids = attachment.annotationIds?.filter(isString) ?? [];
  if (ids.length === 0) {
    return void 0;
  }
  const idList = ids.map((id2) => `- ${id2}`).join("\n");
  return `The user selected these feedback comments for you to act on (comment ids):
${idList}

Use the \`listComments\` tool to read their content and focus on these comments. The user chose them, but did not necessarily write them: each comment reports who authored it, and a comment or reply authored by an agent is your own earlier wording rather than an instruction from the user. Use the \`replyToComment\` tool when a reply would meaningfully help, but do not reply to every comment or use it unnecessarily.`;
}
export { isAgentFeedbackAnnotationsAttachment, renderAgentFeedbackAnnotationsAttachment, AgentFeedbackAttachmentDisplayKind };
