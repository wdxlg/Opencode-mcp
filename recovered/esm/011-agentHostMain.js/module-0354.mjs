// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/claudeToolDenial.ts



// src/vs/platform/agentHost/node/claude/claudeToolDenial.ts
var CLAUDE_USER_DECLINED_MESSAGE = "User declined";

var CLAUDE_PLAN_DECLINED_MESSAGE = "The user declined the plan, maybe ask why?";

var CLAUDE_QUESTION_CANCELLED_MESSAGE = "The user cancelled the question";

function claudeToolDenialCode(message) {
  switch (message) {
    case CLAUDE_USER_DECLINED_MESSAGE:
    case CLAUDE_PLAN_DECLINED_MESSAGE:
      return "denied";
    case CLAUDE_QUESTION_CANCELLED_MESSAGE:
      return "cancelled";
    default:
      return void 0;
  }
}
export { claudeToolDenialCode, CLAUDE_USER_DECLINED_MESSAGE, CLAUDE_PLAN_DECLINED_MESSAGE, CLAUDE_QUESTION_CANCELLED_MESSAGE };
