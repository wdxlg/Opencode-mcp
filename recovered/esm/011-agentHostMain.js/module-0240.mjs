// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/copilot/prompts/toolInstructions.ts
import { BrowserChatToolReferenceName, browserChatToolReferenceNames } from "./module-0239.mjs";
import { CLIENT_TOOL_SEARCH_REFERENCE_NAME } from "./module-0190.mjs";
import { coalesce } from "./module-0005.mjs";


// src/vs/platform/agentHost/node/copilot/prompts/toolInstructions.ts
var agenticBrowserToolNames = browserChatToolReferenceNames.filter((name) => name !== BrowserChatToolReferenceName.OpenBrowserPage);

var COPILOT_AGENT_HOST_LARGE_OUTPUT_TOOL_INSTRUCTION = "When a tool reports that its output was saved to a temporary file because it was too large, ONLY use the `view` tool with a narrow `view_range` to inspect that file. NEVER read it with shell commands such as `cat`, `head`, `tail`, or `sed`, because their output may be offloaded again.";

var largeOutputToolInstructions = () => COPILOT_AGENT_HOST_LARGE_OUTPUT_TOOL_INSTRUCTION;

var COPILOT_AGENT_HOST_SUBAGENT_TOOL_INSTRUCTIONS = [
  "When launching subagents with the task tool, leave the `model`, `reasoning_effort`, and `context_tier` parameters unset \u2014 each agent type already runs on a model suited to it, and overriding the model changes the session's cost and behavior profile.",
  "Only set the task tool's `model` parameter when the user explicitly names the model the subagent should run on."
].join("\n");

var subagentToolInstructions = ({ getSetting }) => getSetting("subagentModelGuidance" /* SubagentModelGuidance */) === true ? COPILOT_AGENT_HOST_SUBAGENT_TOOL_INSTRUCTIONS : void 0;

var browserToolInstructions = ({ hasTool }) => {
  if (!hasTool(BrowserChatToolReferenceName.OpenBrowserPage)) {
    return void 0;
  }
  const companion = agenticBrowserToolNames.find(hasTool);
  if (!companion) {
    return void 0;
  }
  return `Use the browser tools (${BrowserChatToolReferenceName.OpenBrowserPage}, ${companion}, etc.) when beneficial for front-end tasks, such as when visualizing or validating UI changes.`;
};

var TOOL_INSTRUCTION_LINES = [largeOutputToolInstructions, subagentToolInstructions, browserToolInstructions];

var toolSearchToolInstructions = ({ hasTool }) => hasTool(CLIENT_TOOL_SEARCH_REFERENCE_NAME) ? `Most tools are deferred and hidden until you search for them. Before calling a tool that has not already been loaded, ALWAYS use tool search first with a short description of the capability you need, then call the specific tool it returns; tools it returns are immediately available and must not be searched for again.` : void 0;

function toolSearchInstructionLines(toolSearchActive) {
  return toolSearchActive ? [...TOOL_INSTRUCTION_LINES, toolSearchToolInstructions] : TOOL_INSTRUCTION_LINES;
}

function universalToolInstructions(context, lines = TOOL_INSTRUCTION_LINES) {
  const rendered = coalesce(lines.map((line) => line(context)));
  return rendered.length > 0 ? rendered.join("\n") : void 0;
}

function composeToolInstructions(existing, content) {
  if (!existing) {
    return { action: "append", content: `
${content}` };
  }
  if (existing.action === "remove" || typeof existing.action === "function") {
    return existing;
  }
  const base = existing.content ?? "";
  const merged = base ? `${base}
${content}` : content;
  switch (existing.action) {
    case "append":
      return { action: "append", content: `
${merged}` };
    case "prepend":
      return { action: "prepend", content: `${merged}
` };
    default:
      return { action: existing.action, content: merged };
  }
}

function resolveToolInstructionsOverride(context, existing, lines = TOOL_INSTRUCTION_LINES) {
  const content = universalToolInstructions(context, lines);
  return content === void 0 ? void 0 : composeToolInstructions(existing, content);
}
export { toolSearchInstructionLines, universalToolInstructions, composeToolInstructions, resolveToolInstructionsOverride, agenticBrowserToolNames, COPILOT_AGENT_HOST_LARGE_OUTPUT_TOOL_INSTRUCTION, largeOutputToolInstructions, COPILOT_AGENT_HOST_SUBAGENT_TOOL_INSTRUCTIONS, subagentToolInstructions, browserToolInstructions, TOOL_INSTRUCTION_LINES, toolSearchToolInstructions };
