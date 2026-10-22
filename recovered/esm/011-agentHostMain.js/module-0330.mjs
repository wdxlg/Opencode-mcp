// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/claude/claudeToolDisplay.ts
import { getServerToolDisplay } from "./module-0236.mjs";
import { localize } from "./module-0012.mjs";
import { toToolCallMeta } from "./module-0046.mjs";
import { URI } from "./module-0023.mjs";
import { appendEscapedMarkdownInlineCode, escapeMarkdownLinkLabel } from "./module-0115.mjs";
import { basename2 } from "./module-0025.mjs";
import { truncate } from "./module-0021.mjs";
import { getStreamingCreateMessage, getStreamingEditMessage, getStreamingReplaceMessage, streamingToolTextLineCount } from "./module-0187.mjs";


// src/vs/platform/agentHost/node/claude/claudeToolDisplay.ts
var TOOL_ROWS = {
  // shell tools — no `language` is carried: the workbench picks
  // `'shellscript'` from the tool name (it only special-cases
  // `'powershell'`), and the SDK's `Bash` tool is the generic shell
  // entry point (bash on POSIX, Git Bash on Windows), so claiming a
  // specific dialect here would be misleading and unused.
  Bash: { permissionKind: "shell", toolKind: "terminal" },
  BashOutput: { permissionKind: "shell", toolKind: "terminal" },
  KillBash: { permissionKind: "shell", toolKind: "terminal" },
  // read tools
  Read: { permissionKind: "read", pathField: "file_path", toolKind: "read" },
  Glob: { permissionKind: "read", pathField: "path", toolKind: "search" },
  Grep: { permissionKind: "read", pathField: "path", toolKind: "search" },
  LS: { permissionKind: "read", pathField: "path" },
  NotebookRead: { permissionKind: "read", pathField: "notebook_path", toolKind: "read" },
  // write tools
  Write: { permissionKind: "write", pathField: "file_path", isFileEdit: true },
  Edit: { permissionKind: "write", pathField: "file_path", isFileEdit: true },
  MultiEdit: { permissionKind: "write", pathField: "file_path", isFileEdit: true },
  NotebookEdit: { permissionKind: "write", pathField: "notebook_path", isFileEdit: true },
  TodoWrite: { permissionKind: "write" },
  // network tools
  WebFetch: { permissionKind: "url", pathField: "url" },
  // host-routed / custom
  Task: { permissionKind: "custom-tool", toolKind: "subagent" },
  Agent: { permissionKind: "custom-tool", toolKind: "subagent" },
  ExitPlanMode: { permissionKind: "custom-tool", interactive: true },
  AskUserQuestion: { permissionKind: "custom-tool", interactive: true },
  // skill + task-list family — host-routed custom tools that render in the
  // generic tool renderer (no `toolKind`) but carry rich invocation /
  // past-tense messages so their collapsed row is self-explanatory.
  Skill: { permissionKind: "skill" },
  TaskCreate: { permissionKind: "custom-tool" },
  TaskUpdate: { permissionKind: "custom-tool" },
  TaskList: { permissionKind: "custom-tool" },
  TaskGet: { permissionKind: "custom-tool" }
};

var MCP_TOOL_PREFIX = "mcp__";

function getClaudePermissionKind(toolName) {
  const row = TOOL_ROWS[toolName];
  if (row) {
    return row.permissionKind;
  }
  if (toolName.startsWith(MCP_TOOL_PREFIX)) {
    return "mcp";
  }
  return "custom-tool";
}

function getClaudeToolDisplayName(toolName) {
  const serverDisplay = getServerToolDisplay(toolName, void 0)?.displayName;
  if (serverDisplay !== void 0) {
    return serverDisplay;
  }
  switch (toolName) {
    case "Bash":
      return localize(2318, null);
    case "BashOutput":
      return localize(2319, null);
    case "KillBash":
      return localize(2324, null);
    case "Read":
      return localize(2330, null);
    case "Glob":
      return localize(2322, null);
    case "Grep":
      return localize(2323, null);
    case "LS":
      return localize(2325, null);
    case "NotebookRead":
      return localize(2329, null);
    case "Write":
      return localize(2339, null);
    case "Edit":
      return localize(2320, null);
    case "MultiEdit":
      return localize(2327, null);
    case "NotebookEdit":
      return localize(2328, null);
    case "TodoWrite":
      return localize(2337, null);
    case "WebFetch":
      return localize(2338, null);
    case "Task":
    case "Agent":
      return localize(2332, null);
    case "ExitPlanMode":
      return localize(2321, null);
    case "AskUserQuestion":
      return localize(2317, null);
    case "Skill":
      return localize(2331, null);
    case "TaskCreate":
      return localize(2333, null);
    case "TaskUpdate":
      return localize(2336, null);
    case "TaskList":
      return localize(2335, null);
    case "TaskGet":
      return localize(2334, null);
  }
  if (toolName.startsWith(MCP_TOOL_PREFIX)) {
    return localize(2326, null, toolName.slice(MCP_TOOL_PREFIX.length));
  }
  return toolName;
}

function getClaudeToolPath(toolName, input) {
  const row = TOOL_ROWS[toolName];
  if (!row?.pathField || typeof input !== "object" || input === null) {
    return void 0;
  }
  const value = input[row.pathField];
  return typeof value === "string" ? value : void 0;
}

function isClaudeFileEditTool(toolName) {
  return TOOL_ROWS[toolName]?.isFileEdit === true;
}

var INTERACTIVE_CLAUDE_TOOLS = new Set(
  Object.entries(TOOL_ROWS).filter(([, row]) => row.interactive).map(([name]) => name)
);

function getClaudeConfirmationTitle(toolName) {
  switch (getClaudePermissionKind(toolName)) {
    case "shell":
      return localize(2313, null);
    case "write":
      return localize(2316, null);
    case "read":
      return localize(2312, null);
    case "url":
      return localize(2315, null);
    case "skill":
      return localize(2314, null);
    case "mcp": {
      const serverName = toolName.startsWith(MCP_TOOL_PREFIX) ? toolName.slice(MCP_TOOL_PREFIX.length).split("__")[0] : void 0;
      return serverName ? localize(2311, null, serverName) : localize(2310, null);
    }
    case "custom-tool":
    default:
      return localize(2310, null);
  }
}

function buildClaudeToolMeta(toolName) {
  const meta = buildClaudeToolCallMeta(toolName);
  return meta ? toToolCallMeta(meta) : void 0;
}

function buildClaudeToolCallMeta(toolName) {
  const row = TOOL_ROWS[toolName];
  if (!row?.toolKind) {
    return void 0;
  }
  return { toolKind: row.toolKind };
}

function md2(value) {
  return { markdown: value };
}

function formatPathAsMarkdownLink2(path) {
  const uri = URI.file(path);
  return `[${escapeMarkdownLinkLabel(basename2(uri))}](${uri})`;
}

function readStringField2(input, field) {
  if (input === null || typeof input !== "object") {
    return void 0;
  }
  const value = input[field];
  return typeof value === "string" && value.length > 0 ? value : void 0;
}

function firstShellLine(input) {
  const command = readStringField2(input, "command");
  return command ? command.split("\n")[0] : void 0;
}

function readTaskUpdateStatus(input) {
  const status = readStringField2(input, "status");
  return status === "in_progress" || status === "completed" || status === "deleted" ? status : void 0;
}

function getClaudeInvocationMessage(toolName, displayName, input) {
  const serverDisplay = getServerToolDisplay(toolName, input)?.invocationMessage;
  if (serverDisplay !== void 0) {
    return serverDisplay;
  }
  switch (toolName) {
    case "Bash": {
      const firstLine = firstShellLine(input);
      if (firstLine) {
        return md2(localize(2350, null, appendEscapedMarkdownInlineCode(truncate(firstLine, 80))));
      }
      return localize(2349, null);
    }
    case "BashOutput":
      return localize(2351, null);
    case "KillBash":
      return localize(2358, null);
    case "Read":
    case "NotebookRead": {
      const path = getClaudeToolPath(toolName, input);
      if (path) {
        return md2(localize(2362, null, formatPathAsMarkdownLink2(path)));
      }
      return localize(2361, null);
    }
    case "LS": {
      const path = getClaudeToolPath(toolName, input);
      if (path) {
        return md2(localize(2360, null, formatPathAsMarkdownLink2(path)));
      }
      return localize(2359, null);
    }
    case "Write":
    case "Edit":
    case "MultiEdit":
    case "NotebookEdit": {
      const path = getClaudeToolPath(toolName, input);
      if (path) {
        return md2(localize(2353, null, formatPathAsMarkdownLink2(path)));
      }
      return localize(2352, null);
    }
    case "TodoWrite":
      return localize(2373, null);
    case "Grep": {
      const pattern = readStringField2(input, "pattern");
      if (pattern) {
        return md2(localize(2357, null, appendEscapedMarkdownInlineCode(truncate(pattern, 80))));
      }
      return localize(2356, null);
    }
    case "Glob": {
      const pattern = readStringField2(input, "pattern");
      if (pattern) {
        return md2(localize(2355, null, appendEscapedMarkdownInlineCode(truncate(pattern, 80))));
      }
      return localize(2354, null);
    }
    case "WebFetch": {
      const url2 = readStringField2(input, "url");
      if (url2) {
        return md2(localize(2374, null, `[${escapeMarkdownLinkLabel(truncate(url2, 80))}](${url2})`));
      }
      return localize(2375, null);
    }
    case "Task":
    case "Agent": {
      const description = readStringField2(input, "description");
      if (description) {
        return description;
      }
      return displayName;
    }
    case "Skill": {
      const skill = readStringField2(input, "skill");
      if (skill) {
        return md2(localize(2364, null, appendEscapedMarkdownInlineCode(truncate(skill, 80))));
      }
      return localize(2363, null);
    }
    case "TaskCreate": {
      const subject = readStringField2(input, "subject");
      if (subject) {
        return localize(2367, null, truncate(subject, 80));
      }
      return localize(2366, null);
    }
    case "TaskUpdate":
      switch (readTaskUpdateStatus(input)) {
        case "in_progress":
          return localize(2371, null);
        case "completed":
          return localize(2365, null);
        case "deleted":
          return localize(2368, null);
        default:
          return localize(2372, null);
      }
    case "TaskList":
      return localize(2370, null);
    case "TaskGet":
      return localize(2369, null);
    default:
      return displayName;
  }
}

function getClaudeStreamingInvocationMessage(toolName, input) {
  switch (toolName) {
    case "Write":
      return getStreamingCreateMessage(input?.["file_path"], streamingToolTextLineCount(input?.["content"]));
    case "Edit":
      return getStreamingReplaceMessage(
        input?.["file_path"],
        streamingToolTextLineCount(input?.["old_string"]),
        streamingToolTextLineCount(input?.["new_string"])
      );
    case "MultiEdit": {
      const edits = Array.isArray(input?.["edits"]) ? input["edits"] : [];
      let oldLineCount;
      let newLineCount;
      for (const edit of edits) {
        if (!edit || typeof edit !== "object" || Array.isArray(edit)) {
          continue;
        }
        const oldLines = streamingToolTextLineCount(edit["old_string"]);
        const newLines = streamingToolTextLineCount(edit["new_string"]);
        if (oldLines !== void 0) {
          oldLineCount = (oldLineCount ?? 0) + oldLines;
        }
        if (newLines !== void 0) {
          newLineCount = (newLineCount ?? 0) + newLines;
        }
      }
      return getStreamingReplaceMessage(input?.["file_path"], oldLineCount, newLineCount);
    }
    case "NotebookEdit":
      return getStreamingEditMessage(input?.["notebook_path"], streamingToolTextLineCount(input?.["new_source"]));
    default:
      return void 0;
  }
}

function getClaudePastTenseMessage(toolName, displayName, input, success, resultText) {
  if (!success) {
    return localize(2343, null, displayName);
  }
  const serverDisplay = getServerToolDisplay(toolName, input, { text: resultText, success })?.pastTenseMessage;
  if (serverDisplay !== void 0) {
    return serverDisplay;
  }
  switch (toolName) {
    case "Bash": {
      const firstLine = firstShellLine(input);
      if (firstLine) {
        return md2(localize(2341, null, appendEscapedMarkdownInlineCode(truncate(firstLine, 80))));
      }
      return localize(2340, null);
    }
    case "BashOutput":
      return localize(2342, null);
    case "WebFetch": {
      const url2 = readStringField2(input, "url");
      if (url2) {
        return md2(localize(2347, null, `[${escapeMarkdownLinkLabel(truncate(url2, 80))}](${url2})`));
      }
      return localize(2348, null);
    }
    case "Task":
    case "Agent":
      return localize(2346, null);
    case "Skill": {
      const skill = readStringField2(input, "skill");
      if (skill) {
        return md2(localize(2345, null, appendEscapedMarkdownInlineCode(truncate(skill, 80))));
      }
      return localize(2344, null);
    }
    default:
      return getClaudeInvocationMessage(toolName, displayName, input);
  }
}

function getClaudeToolInputString(toolName, input) {
  if (input === void 0) {
    return void 0;
  }
  if (toolName === "Bash" || toolName === "BashOutput" || toolName === "KillBash") {
    const command = readStringField2(input, "command");
    if (command) {
      return command;
    }
  }
  if (toolName === "Grep" || toolName === "Glob") {
    const pattern = readStringField2(input, "pattern");
    if (pattern) {
      return pattern;
    }
  }
  try {
    return JSON.stringify(input, null, 2);
  } catch {
    return void 0;
  }
}
export { getClaudePermissionKind, getClaudeToolDisplayName, getClaudeToolPath, isClaudeFileEditTool, getClaudeConfirmationTitle, buildClaudeToolMeta, buildClaudeToolCallMeta, md2, formatPathAsMarkdownLink2, readStringField2, firstShellLine, readTaskUpdateStatus, getClaudeInvocationMessage, getClaudeStreamingInvocationMessage, getClaudePastTenseMessage, getClaudeToolInputString, TOOL_ROWS, MCP_TOOL_PREFIX, INTERACTIVE_CLAUDE_TOOLS };
