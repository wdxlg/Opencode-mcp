// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/tools/builtinTools/taskCompleteTool.ts
import { ToolDataSource } from "./module-0991.mjs";


// src/vs/workbench/contrib/chat/common/tools/builtinTools/taskCompleteTool.ts
var TaskCompleteToolId = "task_complete";

var TaskCompleteToolData = {
  id: TaskCompleteToolId,
  displayName: "Task Complete",
  modelDescription: "Signal that the user's task is fully done. You MUST call this tool when your work is complete \u2014 whether you made code changes, answered a question, or completed any other kind of task. Provide a brief summary of what was accomplished. Do not restate the summary in your message text \u2014 it is shown to the user directly.\n\nIMPORTANT: Before calling this tool, you MUST output a brief text message summarizing what was done. The task is not complete until both your summary message AND this tool call are present.\n\nWhen to call:\n- After answering the user's question or completing a conversational request\n- After you have completed ALL requested changes\n- After verifying results: tests pass, terminal commands succeeded, tool calls returned expected output\n\nWhen NOT to call:\n- If a terminal command failed or produced unexpected output\n- If an MCP or external tool call returned an error\n- If you encountered errors you have not resolved\n- If there are remaining steps to complete\n- If you have not verified your changes work",
  source: ToolDataSource.Internal,
  inputSchema: {
    type: "object",
    properties: {
      summary: {
        type: "string",
        description: "Brief summary of what was accomplished. Omit for trivial interactions."
      }
    }
  }
};

var TaskCompleteTool = class {
  async prepareToolInvocation(_context, _token) {
    return {
      presentation: "hidden" /* Hidden */
    };
  }
  async invoke(invocation, _countTokens, _progress, _token) {
    const params = invocation.parameters;
    const summary = params?.summary ?? "All done!";
    return {
      content: [{
        kind: "text",
        value: summary
      }]
    };
  }
};
export { TaskCompleteToolId, TaskCompleteToolData, TaskCompleteTool };
