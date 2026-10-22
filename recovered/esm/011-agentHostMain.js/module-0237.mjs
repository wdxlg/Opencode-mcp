// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/copilot/copilotToolDisplay.ts
import { localize } from "./module-0012.mjs";
import { URI } from "./module-0023.mjs";
import { MarkdownString, appendEscapedMarkdownInlineCode, escapeMarkdownLinkLabel } from "./module-0115.mjs";
import { basename2 } from "./module-0025.mjs";
import { parsePartialToolInput } from "./module-0226.mjs";
import { getServerToolDisplay } from "./module-0236.mjs";
import { getStreamingCreateMessage, getStreamingInsertMessage, getStreamingPatchMessage, getStreamingReplaceMessage, streamingToolTextLineCount } from "./module-0187.mjs";
import { hash } from "./module-0081.mjs";
import { hasKey, isObject } from "./module-0008.mjs";
import { stripRedundantCdPrefix } from "./module-0183.mjs";


// src/vs/platform/agentHost/node/copilot/copilotToolDisplay.ts
var EPHEMERAL_DISABLED_COPILOT_TOOLS = [
  "task" /* Task */
];

function formatViewRange(view_range) {
  if (!Array.isArray(view_range) || view_range.length !== 2) {
    return void 0;
  }
  const [startLine, endLine] = view_range;
  if (!Number.isInteger(startLine) || !Number.isInteger(endLine)) {
    return void 0;
  }
  if (startLine < 0) {
    return void 0;
  }
  if (endLine !== -1 && endLine < startLine) {
    return void 0;
  }
  return { startLine, endLine };
}

function getAgentId(parameters) {
  const agentId = parameters?.agent_id;
  return typeof agentId === "string" && agentId.length > 0 ? agentId : void 0;
}

var APPLY_PATCH_FILE_HEADERS = [
  /^\s*\*\*\*\s+Update File:\s*(.+?)\s*$/,
  /^\s*\*\*\*\s+Add File:\s*(.+?)\s*$/,
  /^\s*\*\*\*\s+Delete File:\s*(.+?)\s*$/,
  /^\s*\*\*\*\s+Move to:\s*(.+?)\s*$/
];

function getApplyPatchFiles(args) {
  const text = typeof args === "string" ? args : args?.input ?? args?.patch;
  if (typeof text !== "string" || text.length === 0) {
    return [];
  }
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const line of text.split("\n")) {
    for (const re of APPLY_PATCH_FILE_HEADERS) {
      const m = re.exec(line);
      if (m) {
        const path = m[1];
        if (path && !seen.has(path)) {
          seen.add(path);
          out.push(path);
        }
        break;
      }
    }
  }
  return out;
}

var EDIT_TOOL_NAMES = /* @__PURE__ */ new Set([
  "edit" /* Edit */,
  "str_replace" /* StrReplace */,
  "insert" /* Insert */,
  "create" /* Create */,
  "apply_patch" /* ApplyPatch */,
  "git_apply_patch" /* GitApplyPatch */
]);

var STR_REPLACE_EDITOR_EDIT_COMMANDS = /* @__PURE__ */ new Set([
  "edit" /* Edit */,
  "str_replace" /* StrReplace */,
  "insert" /* Insert */,
  "create" /* Create */
]);

function isEditTool(toolName, command) {
  if (EDIT_TOOL_NAMES.has(toolName)) {
    return true;
  }
  if (toolName === "str_replace_editor" /* StrReplaceEditor */) {
    return command !== void 0 && STR_REPLACE_EDITOR_EDIT_COMMANDS.has(command);
  }
  return false;
}

function getEditFilePaths(parameters) {
  if (typeof parameters === "string") {
    try {
      parameters = JSON.parse(parameters);
    } catch {
      return getApplyPatchFiles(parameters);
    }
    if (typeof parameters === "string") {
      return getApplyPatchFiles(parameters);
    }
  }
  if (!parameters || typeof parameters !== "object") {
    return [];
  }
  const patchArgs = parameters;
  if (typeof patchArgs.input === "string" || typeof patchArgs.patch === "string") {
    return getApplyPatchFiles(patchArgs);
  }
  const args = parameters;
  return typeof args.path === "string" ? [args.path] : [];
}

var SHELL_TOOL_NAMES = /* @__PURE__ */ new Set([
  "bash" /* Bash */,
  "powershell" /* PowerShell */
]);

var WRITE_SHELL_TOOL_NAMES = /* @__PURE__ */ new Set([
  "write_bash" /* WriteBash */,
  "write_powershell" /* WritePowerShell */
]);

var READ_SHELL_TOOL_NAMES = /* @__PURE__ */ new Set([
  "read_bash" /* ReadBash */,
  "read_powershell" /* ReadPowerShell */
]);

var SUBAGENT_TOOL_NAMES = /* @__PURE__ */ new Set([
  "task"
]);

var SEARCH_TOOL_NAMES = /* @__PURE__ */ new Set([
  "grep" /* Grep */,
  "rg" /* Rg */,
  "glob" /* Glob */
]);

var HIDDEN_TOOL_NAMES = /* @__PURE__ */ new Set([
  "report_intent" /* ReportIntent */,
  "skill" /* Skill */
]);

function isHiddenTool(toolName) {
  return HIDDEN_TOOL_NAMES.has(toolName);
}

function isAgentCoordinationTool(toolName) {
  return toolName === "list_agents" /* ListAgents */ || toolName === "read_agent" /* ReadAgent */ || toolName === "write_agent" /* WriteAgent */;
}

function isTaskCompleteTool(toolName) {
  return toolName === "task_complete" /* TaskComplete */;
}

function getTaskCompleteSummary(parameters, toolOutput) {
  const summary = parameters?.summary;
  if (typeof summary === "string" && summary.trim().length > 0) {
    return summary;
  }
  return toolOutput && toolOutput.trim().length > 0 ? toolOutput : void 0;
}

function getTaskCompleteMarkdown(parameters, toolOutput) {
  const summary = getTaskCompleteSummary(parameters, toolOutput);
  if (!summary) {
    return void 0;
  }
  return "\n\n" + localize(2578, null, summary);
}

function isShellTool(toolName) {
  return SHELL_TOOL_NAMES.has(toolName);
}

function getShellIntention(toolName, parameters) {
  if (isShellTool(toolName) && typeof parameters?.description === "string" && parameters.description.length > 0) {
    return parameters.description;
  }
  return void 0;
}

function truncate2(text, maxLength) {
  return text.length > maxLength ? text.substring(0, maxLength - 3) + "..." : text;
}

var COPILOT_SDK_TOOL_OUTPUT_BASENAME_RE = /^(?:\d{10,}-copilot-tool-output-(?:[a-z0-9]{6}|\d+-[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})|copilot-tool-output-\d{10,}-[a-z0-9]+)\.txt$/i;

function isCopilotSdkToolOutputFile(filePath) {
  const lastSlash = Math.max(filePath.lastIndexOf("/"), filePath.lastIndexOf("\\"));
  const fileName = lastSlash >= 0 ? filePath.substring(lastSlash + 1) : filePath;
  return COPILOT_SDK_TOOL_OUTPUT_BASENAME_RE.test(fileName);
}

function formatPathAsMarkdownLink(path) {
  const uri = URI.file(path);
  return `[${escapeMarkdownLinkLabel(basename2(uri))}](${uri})`;
}

function formatUrlAsMarkdownLink(url2) {
  return new MarkdownString().appendLink(url2, truncate2(url2, 80)).value;
}

function md(value) {
  return { markdown: value };
}

var identityPathResolver2 = (path) => path;

function parseCopilotStreamingToolInput(raw) {
  return parsePartialToolInput(raw) ?? raw;
}

function getToolDisplayName(toolName) {
  const serverDisplay = getServerToolDisplay(toolName, void 0)?.displayName;
  if (serverDisplay !== void 0) {
    return serverDisplay;
  }
  switch (toolName) {
    case "str_replace_editor" /* StrReplaceEditor */:
    case "edit" /* Edit */:
    case "str_replace" /* StrReplace */:
    case "insert" /* Insert */:
      return localize(2585, null);
    case "create" /* Create */:
      return localize(2583, null);
    case "view" /* View */:
      return localize(2599, null);
    case "bash" /* Bash */:
    case "powershell" /* PowerShell */:
      return localize(2607, null);
    case "read_bash" /* ReadBash */:
    case "read_powershell" /* ReadPowerShell */:
      return localize(2601, null);
    case "write_bash" /* WriteBash */:
      return localize(2620, null);
    case "write_powershell" /* WritePowerShell */:
      return localize(2621, null);
    case "stop_bash" /* StopBash */:
    case "stop_powershell" /* StopPowerShell */:
    case "bash_shutdown" /* BashShutdown */:
    case "powershell_shutdown" /* PowerShellShutdown */:
      return localize(2611, null);
    case "list_bash" /* ListBash */:
    case "list_powershell" /* ListPowerShell */:
      return localize(2592, null);
    case "grep" /* Grep */:
    case "rg" /* Rg */:
    case "glob" /* Glob */:
      return localize(2605, null);
    case "search_code_subagent" /* SearchCodeSubagent */:
      return localize(2606, null);
    case "apply_patch" /* ApplyPatch */:
      return localize(2579, null);
    case "git_apply_patch" /* GitApplyPatch */:
      return localize(2597, null);
    case "codeql_checker" /* CodeqlChecker */:
      return localize(2581, null);
    case "code_review" /* CodeReview */:
      return localize(2582, null);
    case "reply_to_comment" /* ReplyToComment */:
      return localize(2602, null);
    case "think" /* Think */:
      return localize(2615, null);
    case "report_intent" /* ReportIntent */:
      return localize(2603, null);
    case "report_progress" /* ReportProgress */:
      return localize(2604, null);
    case "web_search" /* WebSearch */:
      return localize(2618, null);
    case "web_fetch" /* WebFetch */:
      return localize(2588, null);
    case "update_todo" /* UpdateTodo */:
      return localize(2617, null);
    case "show_file" /* ShowFile */:
      return localize(2608, null);
    case "fetch_copilot_cli_documentation" /* FetchCopilotCliDocumentation */:
      return localize(2587, null);
    case "propose_work" /* ProposeWork */:
      return localize(2598, null);
    case "task_complete" /* TaskComplete */:
      return localize(2614, null);
    case "ask_user" /* AskUser */:
      return localize(2580, null);
    case "skill" /* Skill */:
      return localize(2590, null);
    case "task" /* Task */:
      return localize(2613, null);
    case "list_agents" /* ListAgents */:
      return localize(2591, null);
    case "read_agent" /* ReadAgent */:
      return localize(2600, null);
    case "exit_plan_mode" /* ExitPlanMode */:
      return localize(2586, null);
    case "sql" /* Sql */:
      return localize(2610, null);
    case "lsp" /* Lsp */:
      return localize(2593, null);
    case "create_pull_request" /* CreatePullRequest */:
      return localize(2584, null);
    case "gh-advisory-database" /* GhAdvisoryDatabase */:
      return localize(2589, null);
    case "store_memory" /* StoreMemory */:
      return localize(2612, null);
    case "parallel_validation" /* ParallelValidation */:
      return localize(2596, null);
    case "write_agent" /* WriteAgent */:
      return localize(2619, null);
    case "mcp_reload" /* McpReload */:
      return localize(2594, null);
    case "mcp_validate" /* McpValidate */:
      return localize(2595, null);
    case "tool_search_tool_regex" /* ToolSearchToolRegex */:
      return localize(2616, null);
    default:
      return toolName;
  }
}

function getInvocationMessage(toolName, displayName, parameters, resolvePath2 = identityPathResolver2) {
  const serverDisplay = getServerToolDisplay(toolName, parameters)?.invocationMessage;
  if (serverDisplay !== void 0) {
    return serverDisplay;
  }
  if (SHELL_TOOL_NAMES.has(toolName)) {
    const args = parameters;
    if (args?.command) {
      const firstLine = args.command.split("\n")[0];
      return md(localize(2560, null, appendEscapedMarkdownInlineCode(truncate2(firstLine, 80))));
    }
    return localize(2559, null, displayName);
  }
  if (WRITE_SHELL_TOOL_NAMES.has(toolName)) {
    const args = parameters;
    if (args?.command) {
      const firstLine = args.command.split("\n")[0];
      return md(localize(2577, null, appendEscapedMarkdownInlineCode(truncate2(firstLine, 80))));
    }
    return localize(2576, null);
  }
  if (READ_SHELL_TOOL_NAMES.has(toolName)) {
    return localize(2556, null);
  }
  switch (toolName) {
    case "view" /* View */: {
      const args = parameters;
      if (typeof args?.path === "string" && args.path) {
        if (isCopilotSdkToolOutputFile(args.path)) {
          return localize(2569, null);
        }
        const link = formatPathAsMarkdownLink(resolvePath2(args.path));
        const range = formatViewRange(args.view_range);
        if (range) {
          if (range.endLine === -1) {
            return md(localize(2566, null, link, range.startLine));
          }
          if (range.endLine !== range.startLine) {
            return md(localize(2568, null, link, range.startLine, range.endLine));
          }
          return md(localize(2567, null, link, range.startLine));
        }
        return md(localize(2565, null, link));
      }
      return localize(2564, null);
    }
    case "edit" /* Edit */:
    case "str_replace" /* StrReplace */: {
      const args = parameters;
      if (typeof args?.path === "string" && args.path) {
        return md(localize(2542, null, formatPathAsMarkdownLink(resolvePath2(args.path))));
      }
      return localize(2541, null);
    }
    case "insert" /* Insert */: {
      const args = parameters;
      if (typeof args?.path === "string" && args.path) {
        return md(localize(2549, null, formatPathAsMarkdownLink(resolvePath2(args.path))));
      }
      return localize(2548, null);
    }
    case "create" /* Create */: {
      const args = parameters;
      if (typeof args?.path === "string" && args.path) {
        return md(localize(2540, null, formatPathAsMarkdownLink(resolvePath2(args.path))));
      }
      return localize(2539, null);
    }
    case "str_replace_editor" /* StrReplaceEditor */: {
      const command = parameters?.command;
      switch (command) {
        case "view":
          return getInvocationMessage("view" /* View */, displayName, parameters, resolvePath2);
        case "create":
          return getInvocationMessage("create" /* Create */, displayName, parameters, resolvePath2);
        case "insert":
          return getInvocationMessage("insert" /* Insert */, displayName, parameters, resolvePath2);
        case "edit":
        case "str_replace":
        default:
          return getInvocationMessage("edit" /* Edit */, displayName, parameters, resolvePath2);
      }
    }
    case "grep" /* Grep */: {
      const args = parameters;
      if (args?.pattern) {
        return md(localize(2547, null, appendEscapedMarkdownInlineCode(truncate2(args.pattern, 80))));
      }
      return localize(2546, null);
    }
    case "rg" /* Rg */: {
      const args = parameters;
      if (args?.pattern) {
        return md(localize(2547, null, appendEscapedMarkdownInlineCode(truncate2(args.pattern, 80))));
      }
      return localize(2546, null);
    }
    case "glob" /* Glob */: {
      const args = parameters;
      if (args?.pattern) {
        return md(localize(2545, null, appendEscapedMarkdownInlineCode(truncate2(args.pattern, 80))));
      }
      return localize(2544, null);
    }
    case "apply_patch" /* ApplyPatch */:
    case "git_apply_patch" /* GitApplyPatch */: {
      const files = getEditFilePaths(parameters).map(resolvePath2);
      if (files.length === 1) {
        return md(localize(2552, null, formatPathAsMarkdownLink(files[0])));
      }
      if (files.length > 1) {
        return md(localize(2553, null, files.map(formatPathAsMarkdownLink).join(", ")));
      }
      return localize(2551, null);
    }
    case "sql" /* Sql */: {
      const args = parameters;
      return args?.description || localize(2562, null);
    }
    case "web_fetch" /* WebFetch */: {
      const args = parameters;
      if (args?.url) {
        return md(localize(2570, null, formatUrlAsMarkdownLink(args.url)));
      }
      return localize(2571, null);
    }
    case "web_search" /* WebSearch */: {
      const args = parameters;
      if (args?.query) {
        return md(localize(2573, null, appendEscapedMarkdownInlineCode(truncate2(args.query, 80))));
      }
      return localize(2572, null);
    }
    case "search_code_subagent" /* SearchCodeSubagent */: {
      const args = parameters;
      if (args?.query) {
        return md(localize(2558, null, appendEscapedMarkdownInlineCode(truncate2(args.query, 80))));
      }
      return localize(2557, null);
    }
    case "exit_plan_mode" /* ExitPlanMode */:
      return localize(2543, null);
    case "task" /* Task */:
      return localize(2563, null);
    case "list_agents" /* ListAgents */:
      return localize(2550, null);
    case "read_agent" /* ReadAgent */: {
      const agentId = getAgentId(parameters);
      if (agentId) {
        return md(localize(2554, null, appendEscapedMarkdownInlineCode(agentId)));
      }
      return localize(2555, null);
    }
    case "write_agent" /* WriteAgent */: {
      const agentId = getAgentId(parameters);
      if (agentId) {
        return md(localize(2574, null, appendEscapedMarkdownInlineCode(agentId)));
      }
      return localize(2575, null);
    }
    default:
      return displayName;
  }
}

function getStreamingInvocationMessage(toolName, displayName, parameters, resolvePath2 = identityPathResolver2) {
  const objectParameters = parameters !== null && typeof parameters === "object" && !Array.isArray(parameters) ? parameters : void 0;
  switch (toolName) {
    case "edit" /* Edit */:
    case "str_replace" /* StrReplace */: {
      const args = objectParameters;
      return getStreamingReplaceMessage(args?.path, streamingToolTextLineCount(args?.old_str), streamingToolTextLineCount(args?.new_str), resolvePath2);
    }
    case "create" /* Create */: {
      const args = objectParameters;
      return getStreamingCreateMessage(args?.path, streamingToolTextLineCount(args?.file_text), resolvePath2);
    }
    case "insert" /* Insert */: {
      const args = objectParameters;
      return getStreamingInsertMessage(args?.path, streamingToolTextLineCount(args?.new_str), resolvePath2);
    }
    case "str_replace_editor" /* StrReplaceEditor */: {
      const args = objectParameters;
      const command = args?.command;
      switch (command) {
        case "view":
          return getInvocationMessage("view" /* View */, displayName, objectParameters, resolvePath2);
        case "create":
          return getStreamingCreateMessage(args?.path, streamingToolTextLineCount(args?.file_text), resolvePath2);
        case "insert":
          return getStreamingInsertMessage(args?.path, streamingToolTextLineCount(args?.new_str), resolvePath2);
        case "edit":
        case "str_replace":
        default:
          return getStreamingReplaceMessage(args?.path, streamingToolTextLineCount(args?.old_str), streamingToolTextLineCount(args?.new_str), resolvePath2);
      }
    }
    case "apply_patch" /* ApplyPatch */:
    case "git_apply_patch" /* GitApplyPatch */: {
      const args = objectParameters;
      const patch = typeof parameters === "string" ? parameters : args?.input ?? args?.patch;
      return getStreamingPatchMessage(getEditFilePaths(parameters), streamingToolTextLineCount(patch), resolvePath2);
    }
    default:
      return getInvocationMessage(toolName, displayName, objectParameters, resolvePath2);
  }
}

function getPastTenseMessage(toolName, displayName, parameters, success, resultText, resolvePath2 = identityPathResolver2) {
  if (!success) {
    return localize(2530, null, displayName);
  }
  const serverDisplay = getServerToolDisplay(toolName, parameters, { text: resultText, success })?.pastTenseMessage;
  if (serverDisplay !== void 0) {
    return serverDisplay;
  }
  if (SHELL_TOOL_NAMES.has(toolName)) {
    const args = parameters;
    if (args?.command) {
      const firstLine = args.command.split("\n")[0];
      return md(localize(2533, null, appendEscapedMarkdownInlineCode(truncate2(firstLine, 80))));
    }
    return localize(2532, null, displayName);
  }
  if (READ_SHELL_TOOL_NAMES.has(toolName)) {
    return localize(2531, null);
  }
  switch (toolName) {
    case "web_fetch" /* WebFetch */: {
      const args = parameters;
      if (args?.url) {
        return md(localize(2535, null, formatUrlAsMarkdownLink(args.url)));
      }
      return localize(2536, null);
    }
    case "web_search" /* WebSearch */: {
      const args = parameters;
      if (args?.query) {
        return md(localize(2538, null, appendEscapedMarkdownInlineCode(truncate2(args.query, 80))));
      }
      return localize(2537, null);
    }
    case "task" /* Task */:
      return localize(2534, null);
    default:
      return getInvocationMessage(toolName, displayName, parameters, resolvePath2);
  }
}

function getSkillSyntheticToolCallId(eventId, data) {
  if (eventId) {
    return `synth-skill-${eventId}`;
  }
  return `synth-skill-${hash(data.path).toString(16)}`;
}

function synthesizeSkillToolCall(data, eventId) {
  const toolCallId = getSkillSyntheticToolCallId(eventId, data);
  const displayName = localize(2609, null);
  const escapedName = escapeMarkdownLinkLabel(data.name);
  const skillLink = `[${escapedName}](${URI.file(data.path)})`;
  const invocationMessage = md(localize(2561, null, skillLink));
  return {
    toolCallId,
    toolName: "skill" /* Skill */,
    displayName,
    invocationMessage,
    pastTenseMessage: invocationMessage
  };
}

function getToolInputString(toolName, parameters, rawArguments) {
  if (!parameters && !rawArguments) {
    return void 0;
  }
  if (SHELL_TOOL_NAMES.has(toolName) || WRITE_SHELL_TOOL_NAMES.has(toolName)) {
    const args = parameters;
    const command = args?.command ?? args?.args;
    if (typeof command === "string") {
      return command;
    }
    if (typeof command === "object" && command !== null && hasKey(command, { command: true })) {
      return command.command;
    }
    return rawArguments;
  }
  switch (toolName) {
    case "grep" /* Grep */: {
      const args = parameters;
      return args?.pattern ?? rawArguments;
    }
    case "rg" /* Rg */: {
      const args = parameters;
      return args?.pattern ?? rawArguments;
    }
    case "web_fetch" /* WebFetch */: {
      const args = parameters;
      return args?.url ?? rawArguments;
    }
    default:
      if (parameters) {
        try {
          return JSON.stringify(parameters, null, 2);
        } catch {
          return rawArguments;
        }
      }
      return rawArguments;
  }
}

function getToolKind(toolName, parameters) {
  if (SHELL_TOOL_NAMES.has(toolName)) {
    return "terminal";
  }
  if (SUBAGENT_TOOL_NAMES.has(toolName)) {
    return "subagent";
  }
  if (SEARCH_TOOL_NAMES.has(toolName)) {
    return "search";
  }
  if (toolName === "view" /* View */ || toolName === "str_replace_editor" /* StrReplaceEditor */ && parameters?.["command"] === "view") {
    return "read";
  }
  return void 0;
}

function getSubagentMetadata(parameters) {
  if (!parameters) {
    return {};
  }
  const agentName = typeof parameters.agent_type === "string" && parameters.agent_type.length > 0 ? parameters.agent_type : void 0;
  const description = typeof parameters.description === "string" && parameters.description.length > 0 ? parameters.description : void 0;
  return { agentName, description };
}

function getShellLanguage(toolName) {
  switch (toolName) {
    case "powershell" /* PowerShell */:
    case "write_powershell" /* WritePowerShell */:
    case "read_powershell" /* ReadPowerShell */:
      return "powershell";
    default:
      return "shellscript";
  }
}

function tryStringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return void 0;
  }
}

function str(value) {
  return typeof value === "string" ? value : void 0;
}

function getPermissionDisplay(request, workingDirectory, isNewFile) {
  const path = request.kind === "read" ? str(request.path) : request.kind === "write" ? str(request.fileName) : void 0;
  const fullCommandText = request.kind === "shell" ? str(request.fullCommandText) : void 0;
  const intention = request.kind === "shell" || request.kind === "write" || request.kind === "read" || request.kind === "url" ? str(request.intention) : void 0;
  const serverName = request.kind === "mcp" ? str(request.serverName) : void 0;
  const toolName = request.kind === "mcp" || request.kind === "custom-tool" || request.kind === "hook" ? str(request.toolName) : void 0;
  const requestSandboxBypass = request.kind === "shell" || request.kind === "write" || request.kind === "read" || request.kind === "url" ? request.requestSandboxBypass : void 0;
  const shellConfirmationTitle = requestSandboxBypass ? localize(2525, null) : localize(2526, null);
  switch (request.kind) {
    case "shell": {
      const shellParams = fullCommandText ? { command: fullCommandText } : void 0;
      stripRedundantCdPrefix("bash" /* Bash */, shellParams, workingDirectory);
      const cleanedCommand = typeof shellParams?.command === "string" ? shellParams.command : fullCommandText;
      return {
        confirmationTitle: shellConfirmationTitle,
        invocationMessage: intention ?? getInvocationMessage("bash" /* Bash */, getToolDisplayName("bash" /* Bash */), cleanedCommand ? { command: cleanedCommand } : void 0),
        toolInput: cleanedCommand,
        permissionKind: "shell",
        permissionPath: path
      };
    }
    case "custom-tool": {
      const args = isObject(request.args) ? request.args : void 0;
      const sdkToolName = str(request.toolName);
      if (args && sdkToolName && isShellTool(sdkToolName) && typeof args.command === "string") {
        stripRedundantCdPrefix(sdkToolName, args, workingDirectory);
        const command = args.command;
        return {
          confirmationTitle: shellConfirmationTitle,
          invocationMessage: getInvocationMessage(sdkToolName, getToolDisplayName(sdkToolName), { command }),
          toolInput: command,
          permissionKind: "shell",
          permissionPath: path
        };
      }
      return {
        confirmationTitle: localize(2521, null),
        invocationMessage: md(localize(2520, null, appendEscapedMarkdownInlineCode(toolName ?? request.kind))),
        toolInput: args ? tryStringify(args) : tryStringify(request),
        permissionKind: request.kind,
        permissionPath: path
      };
    }
    case "write": {
      const toolName2 = isNewFile ? "create" /* Create */ : "edit" /* Edit */;
      return {
        confirmationTitle: isNewFile ? localize(2519, null) : localize(2529, null),
        invocationMessage: getInvocationMessage(toolName2, getToolDisplayName(toolName2), path ? { path } : void 0),
        toolInput: tryStringify(path ? { path } : request) ?? void 0,
        permissionKind: "write",
        permissionPath: path
      };
    }
    case "mcp": {
      const title = toolName ?? localize(2522, null);
      return {
        confirmationTitle: serverName ? localize(2523, null, serverName) : localize(2521, null),
        invocationMessage: serverName ? `${serverName}: ${title}` : title,
        toolInput: tryStringify({ serverName, toolName }) ?? void 0,
        permissionKind: "mcp",
        permissionPath: path
      };
    }
    case "read":
      return {
        confirmationTitle: localize(2524, null),
        invocationMessage: getInvocationMessage("view" /* View */, getToolDisplayName("view" /* View */), path ? { path } : void 0),
        permissionKind: "read",
        permissionPath: path
      };
    case "url": {
      const url2 = str(request.url);
      const normalizedUrl = url2 ? URL.canParse(url2) ? new URL(url2).href : url2 : void 0;
      return {
        confirmationTitle: localize(2528, null),
        invocationMessage: md(localize(2527, null)),
        toolInput: normalizedUrl ? JSON.stringify({ url: normalizedUrl }) : void 0,
        permissionKind: "url"
      };
    }
    default:
      return {
        confirmationTitle: localize(2521, null),
        invocationMessage: md(localize(2520, null, appendEscapedMarkdownInlineCode(toolName ?? request.kind))),
        toolInput: tryStringify(request) ?? void 0,
        permissionKind: request.kind,
        permissionPath: path
      };
  }
}
export { formatViewRange, getAgentId, getApplyPatchFiles, isEditTool, getEditFilePaths, isHiddenTool, isAgentCoordinationTool, isTaskCompleteTool, getTaskCompleteSummary, getTaskCompleteMarkdown, isShellTool, getShellIntention, truncate2, isCopilotSdkToolOutputFile, formatPathAsMarkdownLink, formatUrlAsMarkdownLink, md, parseCopilotStreamingToolInput, getToolDisplayName, getInvocationMessage, getStreamingInvocationMessage, getPastTenseMessage, getSkillSyntheticToolCallId, synthesizeSkillToolCall, getToolInputString, getToolKind, getSubagentMetadata, getShellLanguage, tryStringify, str, getPermissionDisplay, EPHEMERAL_DISABLED_COPILOT_TOOLS, APPLY_PATCH_FILE_HEADERS, EDIT_TOOL_NAMES, STR_REPLACE_EDITOR_EDIT_COMMANDS, SHELL_TOOL_NAMES, WRITE_SHELL_TOOL_NAMES, READ_SHELL_TOOL_NAMES, SUBAGENT_TOOL_NAMES, SEARCH_TOOL_NAMES, HIDDEN_TOOL_NAMES, COPILOT_SDK_TOOL_OUTPUT_BASENAME_RE, identityPathResolver2 };
