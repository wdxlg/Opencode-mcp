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
import { SESSION_SEARCH_TOOL } from './tool-guards.mjs';


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
  description: "Set the full durable OpenCode task list. The AI maintains and finishes its own card; a tool acknowledgement is not human approval and no user click is needed for normal completion. At conversation start use new_task=true for a new job; resume only the same unfinished job with acknowledged task_id/expected_revision. Completed/cancelled/cleared cards are sealed; an explicit resume or handoff (task_id + expected_revision, handoff=true for another dialogue's task) continues the same card from its current progress and may add steps; the previous dialogue is interrupted. The same overview_session_id may carry a model/provider title, never merge task IDs. Keep stable steps and at most one in_progress; before the final answer send the terminal snapshot and wait for acknowledgement (completed only when all steps are done; otherwise blocked/cancelled). patch preserves omitted IDs. An empty replace clears an existing job; an empty patch keeps its steps. Bridge update_plan is an alias; report_progress is transient. If neither writer works, continue without repeated task-card retries and disclose the OpenCode task card was not synchronized. Write user-visible text in Simplified Chinese; keep protocol names/enums in English.",
  inputSchema: {
    type: "object",
    required: ["todos"],
    properties: {
      task_id: { type: "string", minLength: 1, maxLength: 80, description: "Opaque Bridge task handle returned by a previous acknowledgement; supports explicit reconnect/resume." },
      expected_revision: { type: "integer", minimum: 1, description: "Last acknowledged task_revision. May be omitted for your own card: the server applies it to the latest revision when the card did not change since your last read (patch mode also merges when the changed steps are not the ones you send); otherwise it returns a conflict with the current revision. Still required for handoff=true." },
      new_task: { type: "boolean", description: "Start a distinct job/turn without clearing another task. Do not combine with task_id or expected_revision." },
      handoff: { type: "boolean", description: "Take over another dialogue's unfinished task: pass its task_id and expected_revision with handoff=true. The card keeps its steps and memory and moves to this dialogue; the previous dialogue is interrupted. Steps may be added (4/7 can become 5/9). Also required for a task restored after an OpenCode restart (interrupted, execution unverified) unless you are its original source link." },
      source_label: { type: "string", maxLength: 80, description: "Optional client self-reported display label. Unverified; never used for authorization or task ownership." },
      // collab-subagent: optional subagent mark (backward compatible; omit for a normal conversation).
      parent_task_id: { type: "string", minLength: 1, maxLength: 80, description: "Optional. Set only when this conversation is a subagent started by another AI: the parent's task_id. The OpenCode collaboration canvas then shows it under the parent instead of as its own AI or conversation. Does not change task ownership." },
      subagent: { type: "boolean", description: "Optional. true when this conversation is a subagent (use with or without parent_task_id). Display-only hint for the collaboration canvas." },
      task_title: { type: "string", minLength: 1, maxLength: 160, description: "当前任务主标题，与模型名称分开显示，完成后保留。" },
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
            status: { type: "string", enum: ["pending", "in_progress", "completed"], description: "Current todo state. Keep at most one todo in_progress. Common aliases (content→title, state→status, done→completed, in-progress→in_progress) are accepted and reported back in normalized." }
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
      expected_revision: { type: "integer", minimum: 1, description: "Last acknowledged task_revision. May be omitted for your own card: the server applies it to the latest revision when the card did not change since your last read (patch mode also merges when the changed steps are not the ones you send); otherwise it returns a conflict with the current revision. Still required for handoff=true." },
      new_task: { type: "boolean", description: "Start a distinct job/turn without clearing another task. Do not combine with task_id or expected_revision." },
      handoff: { type: "boolean", description: "Take over another dialogue's unfinished task: pass its task_id and expected_revision with handoff=true. The card keeps its steps and memory and moves to this dialogue; the previous dialogue is interrupted. Steps may be added (4/7 can become 5/9). Also required for a task restored after an OpenCode restart (interrupted, execution unverified) unless you are its original source link." },
      source_label: { type: "string", maxLength: 80, description: "Optional client self-reported display label. Unverified; never used for authorization or task ownership." },
      task_title: { type: "string", minLength: 1, maxLength: 160, description: "当前任务主标题，与模型名称分开显示，完成后保留。" },
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
var BRIDGE_ASK_USER_OPTION_SCHEMA = { type: "object", additionalProperties: false, required: ["id", "label"], properties: {
  id: { type: "string", minLength: 1, maxLength: 40 }, label: { type: "string", minLength: 1, maxLength: 180 }, description: { type: "string", maxLength: 400 },
  recommended: { type: "boolean", description: "标记推荐项。每题必须恰好有一个选项 recommended=true（或用 recommended_option_id 指定）；全自动模式下直接采用该项。" }
} };
var BRIDGE_ASK_USER_QUESTION_SCHEMA = { type: "object", additionalProperties: false, required: ["question", "options"], properties: {
  question: { type: "string", minLength: 1, maxLength: 1000 },
  options: { type: "array", minItems: 2, maxItems: 8, items: BRIDGE_ASK_USER_OPTION_SCHEMA },
  recommendation: { type: "string", maxLength: 600, description: "推荐方案与简要理由，仅供参考，不代表用户同意。" },
  recommended_option_id: { type: "string", minLength: 1, maxLength: 40, description: "推荐项的 option id，与选项上的 recommended=true 等价；每题必须恰好一个推荐项。" },
  allow_custom: { type: "boolean" }
} };
var BRIDGE_ASK_USER_TOOL = {
  name: "bridge_ask_user", title: "在任务板交互式提问",
  description: "整个任务（含全部中途提问及答复后的后续执行与最终收尾）必须在同一次回复内闭环完成，严禁输出纯文本问题、三项确认文字或阶段汇报后中途直接停止回复。中途凡遇需求歧义、方案选择、工作流确认或授权询问，先检查并优先调用宿主提供的原生交互提问工具（如 ask_user / vscode_askQuestions）在当前回复内挂起等待；只有当前会话未暴露原生提问工具或宿主明确报告不可用时，才使用本 Bridge 工具作为后备。原生调用暂时失败、等待中或 pending 不等于不可用；不要改用 Bridge 对同一问题重复提问。一次 ask 可通过 questions 提交 2-8 题，单题可用 question/options。提问后暂停所有开发，必须等待全部用户答复；Bridge 在同一 MCP 调用中每 3 秒检查答案，默认持续等待到 status=answered，断线恢复用 check + batch_id/question_id 查询（仅显式设置 wait_seconds 才启用上限，0 表示即时查询）。在同一回复内取得完整回答后必须立即无缝继续执行直至任务彻底收尾完成；AI 推荐不等于用户授权。每道题必须恰好给出一个推荐项（选项上 recommended=true 或 recommended_option_id），并在 recommendation 写明理由；用户把对话「权限」设为「全自动」时，提问不再等待，直接采用推荐项（没有推荐项时取第一个选项，没有选项时按「请按你推荐的方案继续」作答），对话里会留下记录。",
  inputSchema: { type: "object", additionalProperties: false, properties: {
    mode: { type: "string", enum: ["ask", "check"] }, task_id: { type: "string", minLength: 1, maxLength: 80 },
    batch_id: { type: "string", minLength: 1, maxLength: 80, description: "批量问答回执中的批次编号。check 模式查询整个批次的进度和全部回答。" },
    questions: { type: "array", minItems: 2, maxItems: 8, items: BRIDGE_ASK_USER_QUESTION_SCHEMA, description: "预先整理所有关键不确定因素；每题给出选项、建议及理由，由用户逐项决定。与顶层单题 question/options 不能混用。" },
    question_id: { type: "string", minLength: 1, maxLength: 80 }, question: { type: "string", minLength: 1, maxLength: 1000 },
    options: { type: "array", minItems: 2, maxItems: 8, items: BRIDGE_ASK_USER_OPTION_SCHEMA },
    recommendation: { type: "string", maxLength: 600 }, recommended_option_id: { type: "string", minLength: 1, maxLength: 40, description: "单题推荐项的 option id（也可在选项上标 recommended=true）；每题必须恰好一个推荐项。" },
    allow_custom: { type: "boolean" }, wait_seconds: { type: "integer", minimum: 0, maximum: 120, description: "可选的兼容等待上限；默认不设上限，Bridge 每 3 秒轮询并保持 MCP 调用直到全部回答；0 仅查询即时状态。客户端可能仍有自己的调用超时。" }
  } }, annotations: { title: "在任务板交互式提问", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false }
};
var BRIDGE_BATCH_CALL_ITEM_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["tool"],
  properties: {
    id: { type: "string", minLength: 1, maxLength: 80, description: "Optional caller-defined correlation ID echoed in the batch result." },
    tool: { type: "string", minLength: 1, maxLength: 120, description: "Bridge tool name to invoke (must not be bridge_batch or blocking bridge_ask_user)." },
    arguments: { type: "object", additionalProperties: true, description: "Arguments object passed to the target Bridge tool." }
  }
};
var BRIDGE_BATCH_TOOL = {
  name: "bridge_batch",
  title: "批量执行 Bridge 工具",
  description: "Execute 1-20 Bridge MCP tool calls in one request to maximize single-turn throughput and avoid host step-count truncation (such as Arena's 100-step limit). Each item runs through the full Bridge permission, rules-acknowledgement, and workspace-boundary checks. By default items run sequentially and stop on the first error (continue_on_error=false); set parallel_readonly=true to run consecutive read-only calls concurrently. Do not nest bridge_batch or include blocking bridge_ask_user(mode=ask).",
  inputSchema: {
    type: "object",
    additionalProperties: false,
    required: ["calls"],
    properties: {
      calls: {
        type: "array",
        minItems: 1,
        maxItems: 20,
        items: BRIDGE_BATCH_CALL_ITEM_SCHEMA,
        description: "Ordered list of Bridge tool calls to execute in this single MCP round-trip."
      },
      continue_on_error: { type: "boolean", description: "When true, continue executing remaining items even if an item returns isError=true. Defaults to false." },
      parallel_readonly: { type: "boolean", description: "When true, consecutive read-only file/search/rules/skill calls are executed in parallel while preserving result order. Defaults to false." },
      reset_step_counter: { type: "boolean", description: "Set true on the first call of a new conversation turn or the first call after ANY ask_user (both normal business ask_user and [AUTO_STEP_RESET] checkpoint) resumes so Bridge resets its per-session segment step counter to 0." },
      host_step: { type: "integer", minimum: 1, maximum: 200, description: "Optional 1-based host tool step count in the current stream segment so Bridge aligns 80+/90-99 step-budget warnings with non-MCP host tool calls." }
    }
  },
  annotations: {
    title: "批量执行 Bridge 工具",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false
  }
};
var BRIDGE_TOOL_DEFINITIONS = [
  ...AUTOMATION_TOOL_DEFINITIONS.filter((tool) => tool.name === "start"),
  BRIDGE_BATCH_TOOL,
  ...FILE_TOOL_DEFINITIONS,
  ...IDE_TOOL_DEFINITIONS.filter((tool) => !BRIDGE_EXCLUDED_TOOL_NAMES.has(tool.name)),
  SET_TODOS_TOOL,
  BRIDGE_ASK_USER_TOOL,
  UPDATE_PLAN_TOOL,
  REPORT_PROGRESS_TOOL,
  LIST_SKILLS_TOOL,
  CONFIGURE_MCP_TOOL,
  SESSION_SEARCH_TOOL,
  ...AUTOMATION_TOOL_DEFINITIONS.filter((tool) => tool.name !== "start")
];
var CHAT_BRIDGE_CONTROL_TOOL_NAMES = /* @__PURE__ */ new Set([
  "bridge_batch",
  "set_todos",
  "bridge_ask_user",
  "update_plan",
  "report_progress",
  "list_skills",
  "configure_mcp",
  "bridge_search_sessions",
  ...AUTOMATION_TOOL_DEFINITIONS.map(tool => tool.name)
]);
// OpenCode: 对话面板「权限」按钮——工具权限类别与决策（扩展 native-chat / runtime-client 共用）。
// 类别表与工作台 module-2765（界面）/ module-2812（工作台工具审批）中的副本保持一致。
// 优先级：单个工具（opencode.chat.toolPermissions；MCP 为 mcpPermissions.tools）> MCP 服务器 > 类别（opencode.chat.categoryPermissions）> 当前模式（opencode.chat.permissionMode）。
// 只用于 OpenCode 原生 Chat；Bridge 远程调用（MCP 调度器）不读取这些设置。
var OC_PERMISSION_DECISIONS = /* @__PURE__ */ new Set(["allow", "ask", "deny"]);
var OC_PERMISSION_RANK2 = { allow: 0, ask: 1, deny: 2 };
var OC_PERMISSION_CATEGORY_TOOL_NAMES = {
  terminal: ["run_command", "send_command_input", "cancel_command"],
  edit: ["apply_patch"],
  screen: ["see_now"],
  memoryWrite: ["bridge_memory_append", "bridge_memory_forget", "bridge_memory_draft", "bridge_memory_handoff", "bridge_memory_archive", "bridge_memory_promote", "bridge_memory_scratch", "bridge_memory_consolidate", "bridge_memory_policy"],
  collab: ["start", "bridge_get_effective_rules", "bridge_acknowledge_rules", "bridge_join_collaboration", "bridge_leave_collaboration", "bridge_get_collaboration", "bridge_create_task", "bridge_claim_task", "bridge_update_task", "bridge_get_execution", "bridge_send_message", "bridge_list_messages", "bridge_ack_message", "bridge_checkpoint_task", "bridge_resume_task", "bridge_wait_messages", "bridge_get_tool_gates"],
  mcpConfig: ["configure_mcp"]
};
// 不设权限的辅助工具：读取已运行命令的输出、等待、向用户提问；
// 以及三种模式下本来就都是允许、无副作用的内部工具（读取文件、搜索与列目录、诊断与 LSP、读取记忆与技能、任务卡与计划）——
// 这些类别已从「权限」›「更多」移除，始终允许，已保存的旧类别 / 单工具设置被忽略。
var OC_PERMISSION_FREE_TOOL_NAMES = ["read_files", "read_image", "find_files", "search_files", "list_directory", "get_diagnostics", "lsp", "bridge_memory_brief", "bridge_memory_recall", "bridge_memory_search", "bridge_memory_status", "bridge_memory_digest", "bridge_memory_selftest", "list_skills", "bridge_search_sessions", "set_todos", "update_plan", "report_progress"];
var OC_PERMISSION_ALWAYS_ALLOWED = /* @__PURE__ */ new Set(["get_command_output", "wait", "bridge_ask_user", ...OC_PERMISSION_FREE_TOOL_NAMES]);
// 各模式下「跟随模式」的默认决策；"own" = 按自定义工具定义文件自己的 confirm 设置
var OC_PERMISSION_MODE_DEFAULTS = {
  ask: { terminal: "ask", edit: "ask", screen: "allow", memoryWrite: "allow", collab: "allow", mcpConfig: "ask", custom: "own", mcp: "ask", worktreeEdit: "allow", other: "allow" },
  auto: { terminal: "allow", edit: "allow", screen: "allow", memoryWrite: "allow", collab: "allow", mcpConfig: "allow", custom: "own", mcp: "allow", worktreeEdit: "allow", other: "allow" },
  // 全自动：工具权限与「自动允许」相同（与工作台 module-2812 一致）；另外提问自动采用推荐项、交接自动发送
  fullAuto: { terminal: "allow", edit: "allow", screen: "allow", memoryWrite: "allow", collab: "allow", mcpConfig: "allow", custom: "own", mcp: "allow", worktreeEdit: "allow", other: "allow" },
  readonly: { terminal: "deny", edit: "deny", screen: "deny", memoryWrite: "deny", collab: "deny", mcpConfig: "deny", custom: "deny", mcp: "deny", worktreeEdit: "deny", other: "deny" }
};
var OC_PERMISSION_TOOL_CATEGORY = /* @__PURE__ */ new Map();
for (const [category, names] of Object.entries(OC_PERMISSION_CATEGORY_TOOL_NAMES)) for (const name of names) OC_PERMISSION_TOOL_CATEGORY.set(name, category);
function ocPermissionDecisionMap(value) {
  const out = {};
  if (value && typeof value === "object" && !Array.isArray(value)) for (const [key, decision] of Object.entries(value)) if (OC_PERMISSION_DECISIONS.has(decision)) out[key] = decision;
  return out;
}
/** 读取「权限」相关设置；get(key, fallback) 通常是 vscode.workspace.getConfiguration("opencode").get。 */
function readOcChatPermissionSettings(get) {
  const read = (key, fallback) => {
    try {
      return get(key, fallback);
    } catch {
      return fallback;
    }
  };
  const rawMode = read("chat.permissionMode", "ask");
  const mcp = read("chat.mcpPermissions", {});
  const mcpRules = mcp && typeof mcp === "object" && !Array.isArray(mcp) ? mcp : {};
  return {
    mode: rawMode === "auto" || rawMode === "fullAuto" || rawMode === "readonly" ? rawMode : "ask",
    categories: ocPermissionDecisionMap(read("chat.categoryPermissions", {})),
    tools: ocPermissionDecisionMap(read("chat.toolPermissions", {})),
    mcpServers: ocPermissionDecisionMap(mcpRules.servers),
    mcpTools: ocPermissionDecisionMap(mcpRules.tools)
  };
}
/** 工具名 → 类别（custom_* 为自定义工具；mcp_* 或 options.mcp 为 MCP 工具）。未归类返回 "other"。 */
function ocChatToolCategory(name, options = {}) {
  if (options.mcp || typeof name === "string" && name.startsWith("mcp_")) return "mcp";
  if (options.custom || typeof name === "string" && name.startsWith("custom_")) return "custom";
  return OC_PERMISSION_TOOL_CATEGORY.get(name) ?? "other";
}
/**
 * 决策：{ decision: allow|ask|deny|own, source: tool|server|category|mode|always, category }。
 * options: { mcp, mcpServer, custom, background, isolated }。
 * 后台分支终端命令（branchCommand）显式设置时优先，否则按终端命令解析；隔离工作树中的 apply_patch 只看 worktreeEdit 与模式。
 */
function resolveOcChatToolPermission(settings, name, options = {}) {
  const s = settings ?? readOcChatPermissionSettings(() => void 0);
  const defaults = OC_PERMISSION_MODE_DEFAULTS[s.mode] ?? OC_PERMISSION_MODE_DEFAULTS.ask;
  if (OC_PERMISSION_ALWAYS_ALLOWED.has(name)) return { decision: "allow", source: "always", category: "always" };
  if (options.isolated && name === "apply_patch") {
    const explicit = s.categories.worktreeEdit;
    return explicit ? { decision: explicit, source: "category", category: "worktreeEdit" } : { decision: defaults.worktreeEdit, source: "mode", category: "worktreeEdit" };
  }
  if (options.background && (name === "run_command" || name === "send_command_input") && s.categories.branchCommand) {
    return { decision: s.categories.branchCommand, source: "category", category: "branchCommand" };
  }
  const category = ocChatToolCategory(name, options);
  if (category === "mcp") {
    if (s.mcpTools[name]) return { decision: s.mcpTools[name], source: "tool", category };
    if (options.mcpServer && s.mcpServers[options.mcpServer]) return { decision: s.mcpServers[options.mcpServer], source: "server", category };
  } else if (s.tools[name]) return { decision: s.tools[name], source: "tool", category };
  if (category !== "other" && s.categories[category]) return { decision: s.categories[category], source: "category", category };
  return { decision: defaults[category] ?? defaults.other, source: "mode", category };
}
/** 全自动作答：返回 { optionId, label, custom }。优先 recommended=true / recommended_option_id；都没有时取第一个选项；没有选项时自由文本回答。 */
var OC_FULL_AUTO_FREE_TEXT = "\u8bf7\u6309\u4f60\u63a8\u8350\u7684\u65b9\u6848\u7ee7\u7eed";
function pickOcRecommendedAnswer(question) {
  const options = Array.isArray(question?.options) ? question.options.filter((option) => option && (option.id !== void 0 || option.label !== void 0)) : [];
  if (options.length === 0) return { optionId: void 0, label: void 0, custom: OC_FULL_AUTO_FREE_TEXT, fallback: "freeText" };
  const byId = question?.recommended_option_id !== void 0 ? options.find((option) => option.id === question.recommended_option_id) : void 0;
  const marked = byId ?? options.find((option) => option.recommended === true);
  const chosen = marked ?? options[0];
  return { optionId: chosen.id, label: String(chosen.label ?? chosen.id), custom: void 0, fallback: marked ? void 0 : "first" };
}
/** 多个决策取最严格（deny > ask > allow；own 视为 allow）。 */
function strictestOcPermission(decisions) {
  let best = "allow";
  for (const d of decisions) {
    const value = d === "own" ? "allow" : d;
    if ((OC_PERMISSION_RANK2[value] ?? 0) > OC_PERMISSION_RANK2[best]) best = value;
  }
  return best;
}
var OC_PERMISSION_CATEGORY_LABELS = { always: "\u65e0\u9700\u6743\u9650", terminal: "\u7ec8\u7aef\u547d\u4ee4", edit: "\u4fee\u6539\u6587\u4ef6", read: "\u8bfb\u53d6\u6587\u4ef6", search: "\u641c\u7d22\u4e0e\u5217\u76ee\u5f55", diagnostics: "\u8bca\u65ad\u4e0e LSP", screen: "\u5c4f\u5e55/\u6444\u50cf\u5934\u67e5\u770b", memoryRead: "\u8bfb\u53d6\u8bb0\u5fc6\u4e0e\u6280\u80fd", memoryWrite: "\u5199\u5165\u8bb0\u5fc6", tasks: "\u4efb\u52a1\u5361\u4e0e\u8ba1\u5212", collab: "Bridge \u534f\u4f5c\u4e0e\u89c4\u5219", mcpConfig: "\u914d\u7f6e MCP \u670d\u52a1\u5668", custom: "\u81ea\u5b9a\u4e49\u5de5\u5177", mcp: "MCP \u5de5\u5177", branchCommand: "\u591a\u6a21\u578b\u540e\u53f0\u5206\u652f\u00b7\u7ec8\u7aef\u547d\u4ee4", worktreeEdit: "\u9694\u79bb\u5de5\u4f5c\u6811\u6539\u52a8", other: "\u5176\u4ed6\u5de5\u5177" };
// OpenCode p28: 高风险工具调用识别（自动允许 / 全自动下仍须在对话内确认）：删除文件、写到工作区外、会删除东西的终端命令、向外发送数据的网络操作。
// 只做保守的文本判断：宁可多问一次，也不放过；用户把该工具单独设为「允许」（或终端白名单里有完全相同的命令）时不拦。
var OC_DG_DELETE_HEADS = /* @__PURE__ */ new Set(["rm", "rmdir", "del", "erase", "rd", "ri", "unlink", "shred", "rimraf", "trash", "remove-item", "clear-content", "format", "format-volume", "clear-disk", "initialize-disk", "wipefs", "diskpart"]);
var OC_DG_NET_HEADS = /* @__PURE__ */ new Set(["scp", "sftp", "ftp", "rsync", "nc", "ncat", "netcat", "telnet", "ssh", "send-mailmessage", "sendmail", "mail", "mailx"]);
var OC_DG_WRITE_HEADS = /* @__PURE__ */ new Set(["cp", "copy", "xcopy", "robocopy", "mv", "move", "ren", "rename", "copy-item", "cpi", "move-item", "mi", "tee", "out-file", "set-content", "sc", "add-content", "ac", "new-item", "ni", "touch", "mkdir", "md", "ln", "install", "dd"]);
var OC_DG_WRAPPERS = /* @__PURE__ */ new Set(["sudo", "doas", "xargs", "env", "nohup", "time", "command", "exec", "nice", "cmd", "cmd.exe", "powershell", "powershell.exe", "pwsh", "pwsh.exe", "bash", "sh", "zsh", "start", "call", "&", "."]);
var OC_DG_TOKEN_DELETE = /* @__PURE__ */ new Set(["delete", "remove", "rm", "rmdir", "unlink", "erase", "destroy", "purge", "wipe", "trash"]);
var OC_DG_TOKEN_SEND = /* @__PURE__ */ new Set(["send", "post", "upload", "publish", "email", "mail", "sms", "tweet", "webhook", "notify", "share", "push", "reply", "comment"]);
var OC_DG_TOKEN_REMOTE_WRITE = /* @__PURE__ */ new Set(["update", "add", "merge", "close", "assign", "invite", "submit", "transfer", "pay", "order", "book"]);
var OC_DG_TOKEN_WRITE = /* @__PURE__ */ new Set(["write", "overwrite", "create", "save", "put", "edit", "move", "rename", "copy", "append", "replace", "insert", "apply", "patch", "mkdir", "touch"]);
function ocDgNormPath(value) {
  let p = String(value ?? "").trim().replace(/^["']|["']$/g, "");
  if (/^file:\/\//i.test(p)) {
    try { p = decodeURIComponent(p.replace(/^file:\/\/\/?/i, "/")); } catch {}
    p = p.replace(/^\/([A-Za-z]:)/, "$1");
  }
  p = p.replace(/\\/g, "/").replace(/^\/([A-Za-z])(\/|$)/, "$1:/");
  return p;
}
function ocDgResolve(p, base) {
  const abs = /^[A-Za-z]:\//.test(p) || p.startsWith("/") || p.startsWith("//");
  const joined = abs || !base ? p : `${base.replace(/\/+$/, "")}/${p}`;
  const lead = /^[A-Za-z]:\//.test(joined) ? joined.slice(0, 3) : joined.startsWith("//") ? "//" : joined.startsWith("/") ? "/" : "";
  const out = [];
  for (const seg of joined.slice(lead.length).split("/")) {
    if (!seg || seg === ".") continue;
    if (seg === "..") { if (out.length && out[out.length - 1] !== "..") out.pop(); else out.push(".."); continue; }
    out.push(seg);
  }
  return { abs: !!lead, path: (lead + out.join("/")).toLowerCase() };
}
/** 路径是否落在所有工作区根目录之外（无法确定时按「在外」处理）。 */
function ocDgPathOutside(value, roots, cwd) {
  const raw = ocDgNormPath(value);
  if (!raw) return false;
  if (/^(\/dev\/(null|stdout|stderr|tty)|nul|\$null|con)$/i.test(raw)) return false;
  if (/^[~$%]/.test(raw)) return true;
  const rootList = (Array.isArray(roots) ? roots : [roots]).filter((r) => typeof r === "string" && r).map((r) => ocDgResolve(ocDgNormPath(r), "").path);
  const cwdNorm = typeof cwd === "string" && cwd ? ocDgNormPath(cwd) : "";
  const base = cwdNorm && (/^[A-Za-z]:\//.test(cwdNorm) || cwdNorm.startsWith("/")) ? cwdNorm : rootList[0] ?? "";
  const resolved = ocDgResolve(raw, base);
  if (!resolved.abs) return resolved.path === ".." || resolved.path.startsWith("../");
  if (!rootList.length) return true;
  return !rootList.some((root) => resolved.path === root || resolved.path.startsWith(root.endsWith("/") ? root : root + "/"));
}
function ocDgWords(segment) {
  return (segment.match(/"[^"]*"|'[^']*'|\S+/g) ?? []).map((w) => w.replace(/^["']|["']$/g, ""));
}
function ocDgHead(word) {
  return String(word ?? "").toLowerCase().replace(/\\/g, "/").split("/").pop().replace(/\.(exe|cmd|bat|ps1)$/, "");
}
/** 终端命令的风险说明；无风险返回 undefined。roots/cwd 用于判断写入目标是否在工作区外。 */
function ocDangerousCommandReason(command, roots, cwd, depth = 0) {
  const text2 = String(command ?? "");
  if (!text2.trim() || text2.length > 2e4) return text2.length > 2e4 ? "\u547d\u4ee4\u8fc7\u957f\uff0c\u65e0\u6cd5\u5224\u65ad\u98ce\u9669" : void 0;
  if (depth < 2) {
    for (const q of text2.matchAll(/(?:^|\s)(?:-c|-command|\/c|\/k)\s+(?:"([^"]*)"|'([^']*)')/gi)) {
      const inner = ocDangerousCommandReason(q[1] ?? q[2], roots, cwd, depth + 1);
      if (inner) return inner;
    }
  }
  if (/\b(shutil\.rmtree|os\.(remove|unlink|rmdir|removedirs)|fs\.(rm|rmSync|unlink|unlinkSync|rmdir|rmdirSync|promises\.rm)|Remove-Item|\]::Delete\s*\(|DeleteFile|rmtree)\b/i.test(text2)) return "\u547d\u4ee4\u4f1a\u5220\u9664\u6587\u4ef6";
  for (const m of text2.matchAll(/(^|[^0-9&>])>{1,2}\|?\s*("[^"]*"|'[^']*'|[^\s;&|<>()]+)/g)) {
    if (ocDgPathOutside(m[2], roots, cwd)) return `\u547d\u4ee4\u4f1a\u5199\u5165\u5de5\u4f5c\u533a\u5916\u7684\u6587\u4ef6\uff1a${m[2]}`;
  }
  for (const segment of text2.split(/[;&|\r\n(){}`]+|\$\(/)) {
    let words = ocDgWords(segment.trim());
    for (let guard = 0; words.length && guard < 6 && OC_DG_WRAPPERS.has(ocDgHead(words[0])); guard += 1) {
      words = words.slice(1);
      while (words.length && /^(-|\/[a-z]$)/i.test(words[0])) words = words.slice(1);
    }
    if (!words.length) continue;
    const head = ocDgHead(words[0]);
    const rest = words.slice(1);
    const lower = rest.map((w) => w.toLowerCase());
    if (OC_DG_DELETE_HEADS.has(head)) return `\u547d\u4ee4\u4f1a\u5220\u9664\u6587\u4ef6\u6216\u78c1\u76d8\u5185\u5bb9\uff08${head}\uff09`;
    if (/^mkfs(\.|$)/.test(head)) return `\u547d\u4ee4\u4f1a\u683c\u5f0f\u5316\u78c1\u76d8\uff08${head}\uff09`;
    if (head === "find" && lower.some((w, i) => w === "-delete" || (w === "-exec" || w === "-execdir" || w === "-ok") && OC_DG_DELETE_HEADS.has(ocDgHead(lower[i + 1])))) return "\u547d\u4ee4\u4f1a\u5220\u9664\u6587\u4ef6\uff08find -delete\uff09";
    if (head === "git") {
      const sub = lower.find((w) => !w.startsWith("-")) ?? "";
      if (sub === "rm") return "\u547d\u4ee4\u4f1a\u5220\u9664\u6587\u4ef6\uff08git rm\uff09";
      if (sub === "clean" && lower.some((w) => /^-[a-z]*f/.test(w) || w === "--force")) return "\u547d\u4ee4\u4f1a\u5220\u9664\u672a\u8ddf\u8e2a\u6587\u4ef6\uff08git clean\uff09";
      if (sub === "push") return "\u547d\u4ee4\u4f1a\u5411\u8fdc\u7a0b\u63a8\u9001\uff08git push\uff09";
    }
    if ((head === "npm" || head === "pnpm" || head === "yarn" || head === "cargo" || head === "docker" || head === "dotnet") && lower.some((w) => w === "publish" || w === "push" || w === "nuget")) {
      if (lower.some((w) => w === "publish" || w === "push")) return `\u547d\u4ee4\u4f1a\u53d1\u5e03 / \u63a8\u9001\u5230\u7f51\u7edc\uff08${head}\uff09`;
    }
    if (head === "twine" && lower.includes("upload")) return "\u547d\u4ee4\u4f1a\u4e0a\u4f20\u5230\u7f51\u7edc\uff08twine upload\uff09";
    if (head === "gh" && (lower[0] === "api" && lower.some((w) => /^(-f|-F|--field|--raw-field|--input|-X|--method)/.test(w)) || ["pr", "issue", "release", "gist", "repo"].includes(lower[0] ?? "") && ["create", "comment", "edit", "delete", "merge", "close", "upload"].includes(lower[1] ?? ""))) return "\u547d\u4ee4\u4f1a\u5411 GitHub \u53d1\u9001\u6570\u636e\uff08gh\uff09";
    if (OC_DG_NET_HEADS.has(head)) return `\u547d\u4ee4\u4f1a\u901a\u8fc7\u7f51\u7edc\u53d1\u9001\u6570\u636e\uff08${head}\uff09`;
    if (head === "curl" && rest.some((w, i) => /^(-d|--data.*|-F|--form.*|-T|--upload-file|--json)$/.test(w) || /^-[a-zA-Z]*[dFT]$/.test(w) && !w.startsWith("--") || /^(-X|--request)$/.test(w) && /^(post|put|patch|delete)$/i.test(rest[i + 1] ?? "") || /^-X(post|put|patch|delete)$/i.test(w))) return "\u547d\u4ee4\u4f1a\u901a\u8fc7\u7f51\u7edc\u53d1\u9001\u6570\u636e\uff08curl\uff09";
    if (head === "wget" && lower.some((w) => /^--(post-data|post-file|method|body-data|body-file)/.test(w))) return "\u547d\u4ee4\u4f1a\u901a\u8fc7\u7f51\u7edc\u53d1\u9001\u6570\u636e\uff08wget\uff09";
    if ((head === "invoke-webrequest" || head === "iwr" || head === "invoke-restmethod" || head === "irm") && lower.some((w, i) => /^-(body|infile|form)$/.test(w) || w === "-method" && /^(post|put|patch|delete)$/.test(lower[i + 1] ?? ""))) return `\u547d\u4ee4\u4f1a\u901a\u8fc7\u7f51\u7edc\u53d1\u9001\u6570\u636e\uff08${head}\uff09`;
    if (OC_DG_WRITE_HEADS.has(head)) {
      const args = rest.filter((w) => !/^-/.test(w) && !/^\/[a-z]+$/i.test(w));
      const targets = ["cp", "copy", "xcopy", "robocopy", "mv", "move", "copy-item", "cpi", "move-item", "mi", "ln", "install"].includes(head) ? args.slice(-1) : head === "dd" ? rest.filter((w) => /^of=/i.test(w)).map((w) => w.slice(3)) : args;
      const lowerRest = rest.map((w) => w.toLowerCase());
      for (const flag of ["-destination", "-path", "-filepath", "-literalpath"]) {
        const at = lowerRest.indexOf(flag);
        if (at >= 0 && rest[at + 1]) targets.push(rest[at + 1]);
      }
      const outside = targets.find((t) => ocDgPathOutside(t, roots, cwd));
      if (outside) return `\u547d\u4ee4\u4f1a\u5199\u5165\u5de5\u4f5c\u533a\u5916\u7684\u6587\u4ef6\uff1a${outside}`;
      if (head === "dd" && targets.length) return "\u547d\u4ee4\u4f1a\u76f4\u63a5\u8986\u5199\u6587\u4ef6\u6216\u8bbe\u5907\uff08dd\uff09";
    }
  }
  return void 0;
}
/** apply_patch 补丁的风险说明：删除文件、或写到工作区外。 */
function ocDangerousPatchReason(patch, roots, allowDeleteInside) {
  for (const line of String(patch ?? "").split(/\r?\n/)) {
    const directive = /^\*\*\* (Add File|Update File|Delete File|Move to): (.+)$/.exec(line);
    if (!directive) continue;
    if (directive[1] === "Delete File" && !allowDeleteInside) return `\u8865\u4e01\u4f1a\u5220\u9664\u6587\u4ef6\uff1a${directive[2].trim()}`;
    if (ocDgPathOutside(directive[2].trim(), roots)) return `\u8865\u4e01\u4f1a\u5199\u5165\u5de5\u4f5c\u533a\u5916\u7684\u6587\u4ef6\uff1a${directive[2].trim()}`;
  }
  return void 0;
}
function ocDgNameTokens(...names) {
  const tokens = /* @__PURE__ */ new Set();
  for (const name of names) for (const t of String(name ?? "").replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase().split(/[^a-z0-9]+/)) if (t) tokens.add(t);
  return tokens;
}
function ocDgPathArgs(value, depth = 0, out = []) {
  if (!value || typeof value !== "object" || depth > 3 || out.length > 40) return out;
  for (const [key, v] of Object.entries(value)) {
    if (typeof v === "string" && /path|file|dest|target|uri|dir|folder|output/i.test(key)) out.push(v);
    else if (Array.isArray(v)) for (const item of v) typeof item === "string" && /path|file|dest|target|uri|dir|folder|output/i.test(key) ? out.push(item) : ocDgPathArgs(item, depth + 1, out);
    else if (v && typeof v === "object") ocDgPathArgs(v, depth + 1, out);
  }
  return out;
}
function ocDgNestedStrings(value, depth = 0, out = []) {
  if (!value || typeof value !== "object" || depth > 4 || out.length > 60) return out;
  for (const [key, v] of Object.entries(value)) {
    if (typeof v === "string") out.push([key, v]);
    else if (v && typeof v === "object") ocDgNestedStrings(v, depth + 1, out);
  }
  return out;
}
/** 按工具名（MCP / 自定义 / 内置工具）判断：删除、对外发送、写到工作区外。 */
function ocDangerousNamedToolReason(names, parameters, roots, remote) {
  const tokens = ocDgNameTokens(...names);
  const label = names.filter(Boolean)[0] ?? "";
  for (const [key, value] of ocDgNestedStrings(parameters)) {
    const reason = /^(command|cmd|script|commandline|command_line)$/i.test(key) ? ocDangerousCommandReason(value, roots) : /^patch$/i.test(key) ? ocDangerousPatchReason(value, roots) : void 0;
    if (reason) return reason;
  }
  for (const t of tokens) if (OC_DG_TOKEN_DELETE.has(t)) return `\u5de5\u5177 ${label} \u4f1a\u5220\u9664\u5185\u5bb9`;
  for (const t of tokens) if (OC_DG_TOKEN_SEND.has(t)) return `\u5de5\u5177 ${label} \u4f1a\u5411\u5916\u53d1\u9001\u6570\u636e`;
  if ([...tokens].some((t) => OC_DG_TOKEN_WRITE.has(t) || remote && OC_DG_TOKEN_REMOTE_WRITE.has(t))) {
    const pathArgs = ocDgPathArgs(parameters);
    const outside = pathArgs.find((p) => ocDgPathOutside(p, roots));
    if (outside) return `\u5de5\u5177 ${label} \u4f1a\u5199\u5165\u5de5\u4f5c\u533a\u5916\u7684\u6587\u4ef6\uff1a${outside}`;
    // MCP / 自定义工具没有本地路径参数的写操作，视为向外部服务写入数据（如创建 issue、发消息）
    if (remote && !pathArgs.length) return `\u5de5\u5177 ${label} \u4f1a\u5411\u5916\u90e8\u670d\u52a1\u5199\u5165\u6570\u636e`;
  }
  return void 0;
}
// OpenCode p28: 扩展侧（原生 Chat 的 agent-host / runtime-client / 后台分支 / 自定义工具）的高风险判断入口；返回风险说明或 undefined
function ocDangerousToolCall(name, args, roots, options = {}) {
  const a = args && typeof args === "object" && !Array.isArray(args) ? args : {};
  try {
    if (name === "run_command") return ocDangerousCommandReason(a.command, roots, a.cwd);
    if (name === "send_command_input") return ocDangerousCommandReason(a.input, roots, a.cwd);
    if (name === "apply_patch") return ocDangerousPatchReason(a.patch, roots, Boolean(options.isolated));
    if (OC_PERMISSION_ALWAYS_ALLOWED.has(name)) return void 0;
    if (typeof name === "string" && (name.startsWith("mcp_") || name.startsWith("custom_"))) return ocDangerousNamedToolReason([name], a, roots, true);
    return void 0;
  } catch {
    return "\u65e0\u6cd5\u5224\u65ad\u98ce\u9669";
  }
}
function ocDangerousCustomToolReason(tool, args, roots) {
  try {
    const run = tool?.run && typeof tool.run === "object" ? tool.run : {};
    if (run.type === "http" && !/^(get|head|options)$/i.test(String(run.method ?? "POST"))) return `\u81ea\u5b9a\u4e49\u5de5\u5177\u4f1a\u5411 ${run.url ?? "\u7f51\u7edc"} \u53d1\u9001 ${run.method ?? "POST"} \u8bf7\u6c42`;
    if (typeof run.command === "string") {
      const reason = ocDangerousCommandReason(run.command, roots);
      if (reason) return reason;
    }
    return ocDangerousNamedToolReason([tool?.toolName, tool?.name], args, roots, false);
  } catch {
    return "\u65e0\u6cd5\u5224\u65ad\u98ce\u9669";
  }
}
export { ocDangerousToolCall, ocDangerousCustomToolReason, readOcChatPermissionSettings, resolveOcChatToolPermission, pickOcRecommendedAnswer, OC_FULL_AUTO_FREE_TEXT, ocChatToolCategory, strictestOcPermission, OC_PERMISSION_CATEGORY_TOOL_NAMES, OC_PERMISSION_CATEGORY_LABELS, OC_PERMISSION_ALWAYS_ALLOWED, bridgeHostInstructions, resolveBridgeToolConcurrency, MAX_REQUEST_BYTES, MAX_ACTIVITY, MAX_TODOS, SESSION_IDLE_TIMEOUT_MS, SESSION_PRUNE_INTERVAL_MS, MAX_SESSIONS, SESSION_KEEPALIVE_INTERVAL_MS, SESSION_RETRY_INTERVAL_MS, SESSION_EVENT_STORE_LIMIT, BRIDGE_HOST_PLATFORM_RULES, BRIDGE_HOST_QUOTING_RULES, BRIDGE_HOST_SCRIPTING_RULES, BRIDGE_HOST_TERMINAL_RULES, BRIDGE_HOST_INSTRUCTIONS, BRIDGE_MCP_TOOL_INSTRUCTIONS, BRIDGE_LOCAL_ONLY_NOTE, BRIDGE_SERVER_INSTRUCTIONS, DEFAULT_BRIDGE_TOOL_CONCURRENCY, MAX_BRIDGE_TOOL_CONCURRENCY, BRIDGE_TOOL_CONCURRENCY_SETTING, SET_TODOS_TOOL, UPDATE_PLAN_TOOL, REPORT_PROGRESS_TOOL, CONFIGURE_MCP_TOOL, BRIDGE_BATCH_TOOL, BRIDGE_TOOL_DEFINITIONS, CHAT_BRIDGE_CONTROL_TOOL_NAMES };
