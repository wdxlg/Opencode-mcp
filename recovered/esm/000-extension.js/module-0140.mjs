// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/bridge-constants.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { BRIDGE_BASH_TERMINAL_CONTRACT, BRIDGE_COMMAND_OWNER_RULE, BRIDGE_MCP_WORKFLOW_INSTRUCTIONS, BRIDGE_PIPELINE_STATUS_RULE, CODE_STRUCTURE_GUIDANCE } from "./module-0043.mjs";
import { BRIDGE_CONVERSATION_OVERVIEW_PROMPT } from "./module-0141.mjs";
import { FILE_TOOL_DEFINITIONS } from "./module-0030.mjs";
import { BRIDGE_EXCLUDED_TOOL_NAMES, IDE_TOOL_DEFINITIONS } from "./module-0042.mjs";
import { LIST_SKILLS_TOOL } from "./module-0142.mjs";
import { AUTOMATION_TOOL_DEFINITIONS } from './automation-store.mjs';


// extensions/opencode/src/bridge-constants.ts
init_define_OPENCODE_BUILD_INFO();
// extensions/opencode/src/bridge-constants.ts
var MAX_REQUEST_BYTES = 8 * 1024 * 1024;
var MAX_ACTIVITY = 60;
var MAX_TODOS = 24;
var SESSION_IDLE_TIMEOUT_MS = Number.POSITIVE_INFINITY;
var SESSION_PRUNE_INTERVAL_MS = 6e4;
var MAX_SESSIONS = 64;
var SESSION_KEEPALIVE_INTERVAL_MS = 15e3;
var SESSION_RETRY_INTERVAL_MS = 2e3;
var SESSION_EVENT_STORE_LIMIT = 512;
var BRIDGE_HOST_PLATFORM_RULES = [
  `Operating system: Windows (\${arch}).`,
  `OpenCode run_command uses persistent bundled PortableGit Bash with /c/... drive paths.`
];
var BRIDGE_HOST_QUOTING_RULES = [
  BRIDGE_BASH_TERMINAL_CONTRACT,
  `Quote "$path"; use -- before arbitrary paths. For Windows paths with spaces/Unicode, use /c/... in Bash, not drive backslashes.`,
  `Use Bash $name, not PowerShell $env:NAME or CMD %NAME%.`,
  `File tools/cwd use workspace-relative or absolute Windows paths (D:/dir/file) in open folders; do not pass Bash /d/... form.`,
  `Unmatched globs stay literal. Use find_files (rg may be absent; grep works); guard with compgen -G/existence checks; quote literal * ? [ ].`
];
var BRIDGE_HOST_SCRIPTING_RULES = [
  `PortableGit Bash (MSYS2): 0-based arrays; check BASH_VERSION before optional features.`,
  BRIDGE_PIPELINE_STATUS_RULE,
  `Use && for dependent steps; ; can hide earlier failures.`
];
var BRIDGE_HOST_TERMINAL_RULES = [
  `An explicit cwd may select or create a different terminal slot; do not rely on state persisting across slots.`,
  `An idle terminal closes after two hours. The next command starts a fresh Bash session without previous variables, functions or cwd.`,
  `Prefer Windows tools; avoid POSIX-only assumptions.`,
  `Bundled PortableGit bash.exe --noprofile --norc; no rc files; inherits Extension Host PATH.`,
  `CRLF may exist; apply_patch preserves BOM/line endings, unlike sed -i.`,
  `Use Windows/bash unless the user requests another OS.`
];
function bridgeHostInstructions(arch) {
  const rules = [
    ...BRIDGE_HOST_PLATFORM_RULES,
    ...BRIDGE_HOST_QUOTING_RULES,
    ...BRIDGE_HOST_SCRIPTING_RULES,
    ...BRIDGE_HOST_TERMINAL_RULES
  ];
  return [
    `Host environment:`,
    `- Operating system: Windows (${arch}).`,
    ...rules.slice(1).map((rule) => `- ${rule}`)
  ].join("\n");
}
var BRIDGE_HOST_INSTRUCTIONS = bridgeHostInstructions(process.arch);
var BRIDGE_MCP_TOOL_INSTRUCTIONS = BRIDGE_MCP_WORKFLOW_INSTRUCTIONS;
var BRIDGE_LOCAL_ONLY_NOTE = `Tools run on the local Windows host of this Bridge session. The folders currently open in OpenCode are the default target, not a hard ban. For task-relevant paths on the same Windows host, use absolute paths with file tools according to the locally selected Project files or Entire device mode; use run_command for read-only discovery when the target is uncertain. Do not assume a web/cloud workspace or another machine unless the user explicitly asks.`;
var BRIDGE_SERVER_INSTRUCTIONS = `You are connected to OpenCode. Tool activity and task state are visible to the local user.

${BRIDGE_MCP_TOOL_INSTRUCTIONS}

${BRIDGE_LOCAL_ONLY_NOTE}

${BRIDGE_HOST_INSTRUCTIONS}

${BRIDGE_CONVERSATION_OVERVIEW_PROMPT}

Deliverables: do not assume the workspace is a repository or contains a docs/ folder. Follow requested locations and project conventions. Save reports/plans only when requested or required; otherwise return it in the conversation. If a required output location is unclear, ask before creating a new documentation folder. A readiness request changes no files: first set the task card, then await work.`;
var DEFAULT_BRIDGE_TOOL_CONCURRENCY = 16;
var MAX_BRIDGE_TOOL_CONCURRENCY = 64;
var BRIDGE_TOOL_CONCURRENCY_SETTING = "bridge.toolConcurrency";
function resolveBridgeToolConcurrency(configured) {
  const value = Number(configured);
  if (!Number.isFinite(value)) return DEFAULT_BRIDGE_TOOL_CONCURRENCY;
  return Math.min(MAX_BRIDGE_TOOL_CONCURRENCY, Math.max(1, Math.trunc(value)));
}
var SET_TODOS_TOOL = {
  name: "set_todos",
  title: "\u8BBE\u7F6E\u4EFB\u52A1\u5361",
  description: "Set the full durable OpenCode task list. The AI maintains and finishes its own card; a tool acknowledgement is not human approval and no user click is needed for normal completion. At conversation start use new_task=true for a new job; resume only the same unfinished job with acknowledged task_id/expected_revision. Completed/cancelled/cleared cards are sealed; blocked/interrupted cards may update existing step IDs only. The same overview_session_id may carry a model/provider title, never merge task IDs. Keep stable steps and at most one in_progress; before the final answer send the terminal snapshot and wait for acknowledgement (completed only when all steps are done; otherwise blocked/cancelled). patch preserves omitted IDs. An empty replace clears an existing job; an empty patch keeps its steps. Bridge update_plan is an alias; report_progress is transient. If neither writer works, continue without repeated task-card retries and disclose the OpenCode task card was not synchronized. Write user-visible text in Simplified Chinese; keep protocol names/enums in English.",
  inputSchema: {
    type: "object",
    required: ["todos"],
    properties: {
      task_id: { type: "string", minLength: 1, maxLength: 80, description: "Opaque Bridge task handle returned by a previous acknowledgement; supports explicit reconnect/resume." },
      expected_revision: { type: "integer", minimum: 1, description: "Last acknowledged task_revision. Required with task_id or patch to reject stale writes." },
      new_task: { type: "boolean", description: "Start a distinct job/turn without clearing another task. Do not combine with task_id or expected_revision." },
      source_label: { type: "string", maxLength: 80, description: "Optional client self-reported display label. Unverified; never used for authorization or task ownership." },
      lifecycle: { type: "string", enum: ["running", "completed", "blocked", "cancelled"], description: "Explicit task state. Before final reply send completed only if every step is complete; otherwise send blocked/cancelled truthfully." },
      mode: { type: "string", enum: ["replace", "patch"], description: "replace (default) replaces the full plan. patch merges stable IDs, requires expected_revision, and preserves omitted steps." },
      overview_session_id: { type: "string", pattern: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$", description: "Random UUID v4 generated per conversation and repeated on its task updates. Unverified grouping hint; never infer from client, MCP connection or task owner. Omit if unavailable." },
      overview_model: { type: "string", maxLength: 80, description: "Actual model answering this conversation, if known. Self-reported and unverified; preferred over overview_provider. Never derive from the user task or client name." },
      overview_provider: { type: "string", maxLength: 80, description: "AI service provider company, only when model name is unknown. Self-reported and unverified. The local user may manually rename the overview." },
      todos: {
        type: "array",
        maxItems: MAX_TODOS,
        description: "For replace, the complete ordered snapshot; for patch, only changed steps. An empty patch preserves existing steps; an empty replace clears an existing job.",
        items: {
          type: "object",
          required: ["id", "title", "status"],
          properties: {
            id: { type: "string", minLength: 1, maxLength: 80, description: "Stable id reused across later set_todos updates." },
            title: { type: "string", minLength: 1, maxLength: 400, description: "\u6B65\u9AA4\u6807\u9898\u5FC5\u987B\u4F7F\u7528\u7B80\u4F53\u4E2D\u6587\uFF0C\u53EF\u4FDD\u7559\u5FC5\u8981\u7684\u6280\u672F\u6807\u8BC6\uFF1B\u4E0D\u8981\u5199\u6210\u5355\u6B21\u5DE5\u5177\u8C03\u7528\u3002" },
            status: { type: "string", enum: ["pending", "in_progress", "completed"], description: "Current todo state. Keep at most one todo in_progress." }
          },
          additionalProperties: false
        }
      }
    },
    additionalProperties: false
  },
  outputSchema: {
    type: "object",
    required: ["todos"],
    properties: {
      todos: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string" },
            status: { type: "string", enum: ["pending", "in_progress", "completed"] }
          },
          required: ["id", "title", "status"]
        }
      }
    },
    additionalProperties: true
  },
  annotations: {
    title: "\u8BBE\u7F6E\u4EFB\u52A1\u5361",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false
  }
};
var UPDATE_PLAN_TOOL = {
  name: "update_plan",
  title: "\u66F4\u65B0\u4EFB\u52A1\u8BA1\u5212",
  description: "Bridge update_plan adapts a Codex-style plan to the set_todos card; the AI updates and closes this card itself without asking the user to click completion; a client-local plan does not update OpenCode. New work: new_task=true; resume only the same unfinished job with task_id/expected_revision. Finished cards are sealed; blocked/interrupted cards cannot add step IDs. Send full plan on changes. Before the final answer, send the terminal snapshot and wait for acknowledgement; every item must be completed to finish, otherwise blocked/cancelled. If neither writer works, continue without repeated task-card retries and disclose the OpenCode task card was not synchronized. Write user-visible steps in Simplified Chinese; keep protocol enums in English.",
  inputSchema: {
    type: "object",
    required: ["plan"],
    properties: {
      task_id: { type: "string", minLength: 1, maxLength: 80, description: "Opaque Bridge task handle returned by a previous acknowledgement; supports explicit reconnect/resume." },
      expected_revision: { type: "integer", minimum: 1, description: "Last acknowledged task_revision. Required with task_id or patch to reject stale writes." },
      new_task: { type: "boolean", description: "Start a distinct job/turn without clearing another task. Do not combine with task_id or expected_revision." },
      source_label: { type: "string", maxLength: 80, description: "Optional client self-reported display label. Unverified; never used for authorization or task ownership." },
      overview_session_id: { type: "string", pattern: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$", description: "Random UUID v4 generated per conversation and repeated on its task updates. Unverified grouping hint; never infer from client, MCP connection or task owner. Omit if unavailable." },
      overview_model: { type: "string", maxLength: 80, description: "Actual model answering this conversation if known; unverified self-report, preferred over provider, never the user task." },
      overview_provider: { type: "string", maxLength: 80, description: "Provider company only when the model is unknown; unverified self-report. Local edits take priority." },
      lifecycle: { type: "string", enum: ["running", "completed", "blocked", "cancelled"], description: "Explicit task state. Before final reply send completed only if every step is complete; otherwise send blocked/cancelled truthfully." },
      explanation: {
        type: "string",
        maxLength: 2e3,
        description: "Optional concise reason for the plan update; task-card state is derived from plan."
      },
      plan: {
        type: "array",
        maxItems: MAX_TODOS,
        description: "Complete ordered plan snapshot for the current job.",
        items: {
          type: "object",
          required: ["step", "status"],
          properties: {
            step: { type: "string", minLength: 1, maxLength: 400, description: "\u4EFB\u52A1\u5361\u6B65\u9AA4\u6807\u9898\u5FC5\u987B\u4F7F\u7528\u7B80\u4F53\u4E2D\u6587\uFF0C\u53EF\u4FDD\u7559\u5FC5\u8981\u7684\u6280\u672F\u6807\u8BC6\u3002" },
            status: { type: "string", enum: ["pending", "in_progress", "completed"], description: "Current step status. Keep at most one item in_progress." }
          },
          additionalProperties: false
        }
      }
    },
    additionalProperties: false
  },
  outputSchema: {
    type: "object",
    required: ["plan"],
    properties: {
      plan: {
        type: "array",
        items: {
          type: "object",
          properties: {
            step: { type: "string" },
            status: { type: "string", enum: ["pending", "in_progress", "completed"] }
          },
          required: ["step", "status"]
        }
      }
    },
    additionalProperties: true
  },
  annotations: {
    title: "\u66F4\u65B0\u4EFB\u52A1\u8BA1\u5212",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false
  }
};
var REPORT_PROGRESS_TOOL = {
  name: "report_progress",
  title: "\u62A5\u544A\u4EFB\u52A1\u8FDB\u5EA6",
  description: "Report concise transient progress from the remote MCP agent to the OpenCode Bridge UI. For multi-step work, use set_todos (or its Bridge update_plan alias) for the durable task card; report_progress is a transient update only and changes neither todo status nor lifecycle. todo_id is optional: when omitted, OpenCode automatically associates progress with the sole in_progress todo. Write message and phase in Simplified Chinese; keep protocol field names and enum values unchanged. This tool does not modify workspace files.",
  inputSchema: {
    type: "object",
    required: ["message"],
    properties: {
      task_id: { type: "string", minLength: 1, maxLength: 80, description: "Optional task handle to scope progress to a specific job; never completes the task." },
      message: { type: "string", minLength: 1, maxLength: 2e3, description: "\u9762\u5411\u7528\u6237\u7684\u8FDB\u5EA6\u8BF4\u660E\uFF0C\u5FC5\u987B\u4F7F\u7528\u7B80\u4F53\u4E2D\u6587\u3002" },
      phase: { type: "string", maxLength: 160, description: "\u53EF\u9009\u7684\u7B80\u4F53\u4E2D\u6587\u9636\u6BB5\u540D\u79F0\uFF0C\u4F8B\u5982\u300C\u6392\u67E5\u300D\u300C\u4FEE\u6539\u300D\u300C\u9A8C\u8BC1\u300D\u300C\u5B8C\u6210\u300D\u3002" },
      percent: { type: "integer", minimum: 0, maximum: 100, description: "Optional completion estimate from 0 to 100 for the current activity/todo." },
      todo_id: { type: "string", minLength: 1, maxLength: 80, description: "Optional todo id from set_todos. Omit when there is exactly one in_progress todo; OpenCode will link it automatically." }
    },
    additionalProperties: false
  },
  outputSchema: {
    type: "object",
    required: ["message"],
    properties: {
      message: { type: "string" },
      phase: { type: "string" },
      percent: { type: "integer" }
    },
    additionalProperties: true
  },
  annotations: {
    title: "\u62A5\u544A\u4EFB\u52A1\u8FDB\u5EA6",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false
  }
};
var CONFIGURE_MCP_TOOL = {
  name: "configure_mcp",
  title: "Configure MCP",
  description: 'Configure other MCP servers for this OpenCode user without leaving the conversation. When the user only names a server or describes a need without giving a URL or launch command, do not rely on memorized endpoints: first look up the current connection details online, preferring the official MCP registry at https://registry.modelcontextprotocol.io/v0.1/servers (search by name, take the isLatest entry, prefer its remotes url, otherwise its packages npx or uvx command), then call action=add with that config. If a required API key is missing, ask the user for it and say where to get it, and never invent keys or endpoints. action=add takes a standard mcpServers JSON object, a single https:// URL, or a one-line stdio launch command; put any API key inline (an Authorization or x-api-key header for HTTP/SSE, the url query, or a stdio env var) and it is stored in the OS credential store and enabled in one step, with no extra prompt or confirmation. action=list shows configured servers with transport, enabled state and live tool counts and never returns secret values. action=remove deletes a server by id and clears its credentials. action=test reloads and reports each server connection state and tool count. action=where answers "where is the config file": the server list is stored as external-mcp.json inside the global Skill directory reported by list_skills (legacy ~/.opencode/external-mcp.json is migrated automatically on first use), and every action echoes that absolute path, so never search the disk for it. HTTP(S) is required for non-loopback URLs and reserved headers/env are rejected, matching the MCP settings page. For stdio servers add first makes the host able to run them: it resolves the real executable behind wrappers such as cmd /c npx, installs a missing Node.js through winget/Homebrew/apt (uv and uvx ship with OpenCode), then writes the config and connects once, reporting each server state and tool count; if that first connection fails the config is kept and the reason is returned for the user to resolve. Prefer add when the user gives a URL/key or names a known MCP server package.',
  inputSchema: {
    type: "object",
    required: ["action"],
    properties: {
      install_runtime: { type: "boolean", description: "add only: install a missing stdio runtime (Node.js via winget/Homebrew/apt) before writing the config. Default true; set false to fail fast instead." },
      verify: { type: "boolean", description: "add only: after writing, connect once and report tool counts. Default true." },
      verify_timeout_ms: { type: "number", description: "add only: how long to wait for the first connection, default 180000, max 600000 (a first npx download can be slow)." },
      action: { type: "string", enum: ["add", "list", "remove", "test", "where"], description: "add configures and enables a server; list shows configured servers without secrets; remove deletes one by id; test reloads and reports connection health; where reports the absolute config file path and its credential store without touching anything." },
      config: { type: ["string", "object"], description: "For add. A standard mcpServers JSON object (or stringified JSON), a single https:// URL, or a one-line stdio launch command. Include the API key inline (Authorization/x-api-key header, url query, or stdio env). Supports one or more servers." },
      secrets: { type: "object", additionalProperties: true, description: "Optional, for add. Values that override same-named header/env credentials in config; usually unnecessary because keys are inline in config." },
      target: { type: "string", enum: ["both", "bridge"], default: "both", description: "For add. both publishes to the editor and Bridge; bridge publishes to the Bridge surface only. Defaults to both." },
      id: { type: "string", description: "For remove and test. The server id shown by list." }
    },
    additionalProperties: false
  },
  outputSchema: {
    type: "object",
    additionalProperties: true
  },
  annotations: {
    title: "Configure MCP",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: true
  }
};
var BRIDGE_TOOL_DEFINITIONS = [
  ...FILE_TOOL_DEFINITIONS,
  ...IDE_TOOL_DEFINITIONS.filter((tool) => !BRIDGE_EXCLUDED_TOOL_NAMES.has(tool.name)),
  SET_TODOS_TOOL,
  UPDATE_PLAN_TOOL,
  REPORT_PROGRESS_TOOL,
  LIST_SKILLS_TOOL,
  CONFIGURE_MCP_TOOL,
  ...AUTOMATION_TOOL_DEFINITIONS
];
var CHAT_BRIDGE_CONTROL_TOOL_NAMES = /* @__PURE__ */ new Set([
  "set_todos",
  "update_plan",
  "report_progress",
  "list_skills",
  "configure_mcp",
  ...AUTOMATION_TOOL_DEFINITIONS.map(tool => tool.name)
]);
export { bridgeHostInstructions, resolveBridgeToolConcurrency, MAX_REQUEST_BYTES, MAX_ACTIVITY, MAX_TODOS, SESSION_IDLE_TIMEOUT_MS, SESSION_PRUNE_INTERVAL_MS, MAX_SESSIONS, SESSION_KEEPALIVE_INTERVAL_MS, SESSION_RETRY_INTERVAL_MS, SESSION_EVENT_STORE_LIMIT, BRIDGE_HOST_PLATFORM_RULES, BRIDGE_HOST_QUOTING_RULES, BRIDGE_HOST_SCRIPTING_RULES, BRIDGE_HOST_TERMINAL_RULES, BRIDGE_HOST_INSTRUCTIONS, BRIDGE_MCP_TOOL_INSTRUCTIONS, BRIDGE_LOCAL_ONLY_NOTE, BRIDGE_SERVER_INSTRUCTIONS, DEFAULT_BRIDGE_TOOL_CONCURRENCY, MAX_BRIDGE_TOOL_CONCURRENCY, BRIDGE_TOOL_CONCURRENCY_SETTING, SET_TODOS_TOOL, UPDATE_PLAN_TOOL, REPORT_PROGRESS_TOOL, CONFIGURE_MCP_TOOL, BRIDGE_TOOL_DEFINITIONS, CHAT_BRIDGE_CONTROL_TOOL_NAMES };
