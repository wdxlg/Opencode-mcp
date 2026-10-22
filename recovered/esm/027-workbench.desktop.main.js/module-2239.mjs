// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/meta/agentFeedbackAnnotations.ts



// src/vs/platform/agentHost/common/meta/agentFeedbackAnnotations.ts
var VIEW_UNREVIEWED_COMMENTS_TOOL_NAME = "viewUnreviewedComments";

var ADD_COMMENT_TOOL_NAME = "addComment";

function isViewUnreviewedCommentsTool(toolName) {
  return toolName === VIEW_UNREVIEWED_COMMENTS_TOOL_NAME || toolName.endsWith(`__${VIEW_UNREVIEWED_COMMENTS_TOOL_NAME}`);
}

function isAddCommentTool(toolName) {
  return toolName === ADD_COMMENT_TOOL_NAME || toolName.endsWith(`__${ADD_COMMENT_TOOL_NAME}`);
}
export { isViewUnreviewedCommentsTool, isAddCommentTool, VIEW_UNREVIEWED_COMMENTS_TOOL_NAME, ADD_COMMENT_TOOL_NAME };
