// split-0029-step04: 从 runOpenAICompatibleAgent 拆出的工具目录：列出工作区 / 外部工具，按 allowedTools 过滤、裁到 API 上限、
// 按需加入 spawn_subagent、按名字排序，生成 Chat Completions / Codex Responses / Anthropic 三种工具定义和工具相关的系统提示。
// module-0029 原样 re-export 这里的常量，对外接口不变。

var MAX_API_TOOLS = 128;

// tool-defer-step01: 工具多时只发核心工具的完整定义，其余只在 tool_search 的说明里列名字，
// 模型用 tool_search（或直接按名字调用）时才把定义加进后续请求。参照 dsh/Claude 的 defer_loading + tool_search，
// 但在客户端完成，不依赖供应商支持。input2.deferTools === false 关闭；工具数不超过 DEFER_TOOLS_MIN 时不延迟。
var DEFER_TOOLS_MIN = 24;
var TOOL_SEARCH_TOOL_NAME = "tool_search";
var CORE_TOOL_NAMES = /* @__PURE__ */ new Set([
  "list_directory", "find_files", "search_files", "read_files", "read_image", "apply_patch",
  "run_command", "get_command_output", "send_command_input", "cancel_command", "list_commands", "wait",
  "get_diagnostics", "lsp", "spawn_subagent", "set_todos", "web_fetch", "web_search"
]);
function toolSearchDefinition(deferredTools) {
  return {
    name: TOOL_SEARCH_TOOL_NAME,
    description: `Load more tools. To keep each request small, only the core tools are sent with full definitions. The tools named below exist but their descriptions and parameter schemas are not loaded yet. Call tool_search with names (exact tool names) or query (keywords); the matching tools' descriptions and schemas are returned and they become callable from your next step. If you already know a listed tool's parameters you may call it directly. Not loaded yet: ${deferredTools.map((tool) => tool.name).join(", ")}`,
    inputSchema: {
      type: "object",
      properties: {
        names: { type: "array", items: { type: "string" }, description: "Exact names of tools to load." },
        query: { type: "string", description: "Keywords to match against tool names and descriptions." },
        limit: { type: "integer", minimum: 1, maximum: 10, description: "Maximum tools to load for a query (default 5)." }
      }
    }
  };
}

var SUBAGENT_TOOL_NAME = "spawn_subagent";
var SUBAGENT_READ_TOOLS = ["list_directory", "find_files", "search_files", "read_files", "read_image", "lsp", "get_diagnostics"];
var SUBAGENT_INSTRUCTIONS = "You are a sub-agent started by another agent to do one self-contained task. You cannot talk to the user. Work autonomously with the tools you have, then reply with a concise, factual report of what you found or did, citing file paths and line numbers. Do not restate the task.";
var SUBAGENT_TOOL = {
  name: SUBAGENT_TOOL_NAME,
  description: "Delegate a self-contained sub-task to a sub-agent that starts with a fresh, empty context and returns only its final report. Several spawn_subagent calls in the same step run in parallel. Use it for broad codebase exploration or independent investigations so your own context stays small. mode=read (default): the sub-agent can only list, find, search and read files; mode=full: it gets the same tools as you and may edit files. Give it everything it needs in task/context; it cannot see this conversation.",
  inputSchema: {
    type: "object",
    properties: {
      task: { type: "string", description: "What the sub-agent should do and what its report must contain." },
      context: { type: "string", description: "Optional background the sub-agent needs (paths, constraints, findings so far)." },
      mode: { type: "string", enum: ["read", "full"] }
    },
    required: ["task"]
  }
};

async function buildAgentToolCatalog(input2, client, fileToolRequestOptions) {
  const listed = client ? await client.listTools(fileToolRequestOptions) : { tools: [] };
  const workspaceTools = [];
  const workspaceToolNames = /* @__PURE__ */ new Set();
  for (const tool of listed.tools) {
    if (!tool.name || workspaceToolNames.has(tool.name)) continue;
    workspaceToolNames.add(tool.name);
    workspaceTools.push({
      name: tool.name,
      description: `${tool.description ?? ""} For this native Chat turn, file operations are confined to: ${(input2.workspaceRoots ?? [input2.workspaceRoot]).join(", ")}. Relative paths use the first folder.`,
      inputSchema: tool.inputSchema
    });
  }
  const externalTools = [];
  const externalToolNames = /* @__PURE__ */ new Set();
  for (const tool of input2.externalTools ?? []) {
    if (!tool.name || workspaceToolNames.has(tool.name) || externalToolNames.has(tool.name)) continue;
    externalToolNames.add(tool.name);
    externalTools.push(tool);
  }
  const allTools = [...workspaceTools, ...externalTools];
  const allowedToolNames = input2.allowedTools === void 0 ? void 0 : new Set(input2.allowedTools);
  const availableTools = allowedToolNames ? allTools.filter((tool) => allowedToolNames.has(tool.name)) : allTools;
  // OpenCode: 工具太多时裁剪到 API 上限（内置工具优先，其次 MCP 工具按原顺序），并在运行日志写明裁掉了哪些
  if (availableTools.length > MAX_API_TOOLS) {
    const dropped = availableTools.splice(MAX_API_TOOLS);
    console.error(`[agent-host] tools trimmed to ${MAX_API_TOOLS}; dropped ${dropped.length}: ${dropped.map((tool) => tool.name).join(",")}`);
  }
  if ((!input2.subagentDepth || input2.subagentToolPolicy) && input2.subagents !== false && availableTools.some((tool) => tool.name === "read_files") && !availableTools.some((tool) => tool.name === SUBAGENT_TOOL_NAME)) availableTools.push(SUBAGENT_TOOL);
  // prompt-cache-step02: 工具按名字排序，MCP 列表顺序变化不再让请求前缀（工具定义）失效
  availableTools.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  const availableToolNames = new Set(availableTools.map((tool) => tool.name));
  // tool-defer-step01: availableTools / availableToolNames 仍是全集（可执行、检查点校验）；只有发给模型的定义是 advertisedTools。
  const deferMin = Number.isInteger(input2.deferToolsMin) && input2.deferToolsMin >= 0 ? input2.deferToolsMin : DEFER_TOOLS_MIN;
  const deferEnabled = input2.deferTools !== false && availableTools.length > deferMin;
  const isCoreTool = (tool) => tool.alwaysLoad === true || CORE_TOOL_NAMES.has(tool.name);
  const advertisedTools = deferEnabled ? availableTools.filter(isCoreTool) : [...availableTools];
  const deferredTools = deferEnabled ? availableTools.filter((tool) => !isCoreTool(tool)) : [];
  if (deferredTools.length) {
    advertisedTools.push(toolSearchDefinition(deferredTools));
    advertisedTools.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
    availableToolNames.add(TOOL_SEARCH_TOOL_NAME);
  }
  const tools = advertisedTools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description ?? "",
      parameters: tool.inputSchema
    }
  }));
  const codexTools = advertisedTools.map((tool) => ({
    type: "function",
    name: tool.name,
    description: tool.description ?? "",
    parameters: tool.inputSchema
  }));
  const anthropicTools = advertisedTools.map((tool) => ({
    name: tool.name,
    description: tool.description ?? "",
    input_schema: tool.inputSchema
  }));
  const editingInstructions = availableTools.length === 0 ? [
    "No workspace, file, diagnostic, or terminal tools are available for this request. Answer directly from general knowledge, the conversation, and content the user already provided.",
    "Do not ask to inspect the workspace, do not invent workspace facts, and do not claim that any file, command, diagnostic, or runtime state was checked."
  ] : availableToolNames.has("apply_patch") ? [
    "Use apply_patch as the primary file editing tool. Read the relevant existing content before editing, and whenever read_files returned a version, pass it through apply_patch.expected_versions.",
    "Prefer one apply_patch call containing all related edits across files. Use exact, sufficient unchanged context in each hunk; if a patch reports stale or ambiguous context, re-read and regenerate it rather than guessing.",
    "Focused in-scope creates and ordinary updates may proceed. Small obviously disposable deletions such as test artifacts or scratch text records may proceed when they are genuinely low-risk. Other delete, move, or whole-file replacement operations require the exact target paths to be listed and explicit confirmation for that operation. An ordinary update also requires confirmation when it makes a threshold-crossing destructive rewrite; those thresholds are additional triggers, not the only ones. General edit/write permission is not blanket deletion permission. Do not split patches to evade that review or replace an expressible patch with shell editing.",
    "After a patch, use read_files to verify the changed ranges when verification is useful. Do not use shell commands to edit files when apply_patch can express the change."
  ] : [
    // OpenCode: 这里只陈述“本轮没有 apply_patch”，不再自称“只读聊天模式”——模式只由 modeInstructions 决定，
    // 否则 Code 模式 + 缺少 apply_patch 时系统提示会同时出现 Code 模式与只读模式两种说法。
    "No file editing tool (apply_patch) is available in this request, so do not modify files or claim that you modified them."
  ];
  // OpenCode: 工具说明只保留所提到的工具本轮确实发送了的条目，避免描述模型看不到参数定义的工具
  const describedToolNames = ["list_directory", "find_files", "search_files", "read_files", "get_diagnostics", "lsp"];
  const toolInstructions = (availableTools.length > 0 ? [
    "The user-selected mode determines which tools are available. Never infer a different mode or claim to have capabilities that are not present in the request.",
    "Within the selected mode, answer directly when the request does not require workspace evidence or an action. Use tools only when they materially improve correctness or complete the requested workspace task.",
    "Use list_directory when you know a directory and need a shallow view of what it contains. Use find_files instead for recursive filename/path-pattern discovery.",
    "Use find_files when you know a filename, extension, or path shape but do not know the exact path. It searches paths only, never file contents. If the exact path is already known, skip find_files.",
    "Batch independent path patterns together in one find_files call. Narrow broad discovery with path/exclude before increasing result limits.",
    "After find_files identifies likely files, prefer search_files on those specific files instead of widening the search back to their parent directory unless cross-file search is actually needed.",
    "Choose navigation by what you are locating: use find_files for file/path shapes, search_files for raw text/content, and lsp for code symbols and semantic relationships. After any of them locates the relevant implementation, use read_files for the actual source details.",
    "Use lsp workspace_symbols/document_symbols when navigating named code symbols, definition/references/implementation for semantic relationships, and hover for type/signature/JSDoc information. Prefer lsp over grep when the question is about which symbol a use site actually resolves to.",
    "LSP results depend on language providers and their currently active/open projects. Inspect lsp provider_state/project_anchor/project_anchor_source/warmup_performed/semantic_result_inconclusive metadata before interpreting an empty result. provider_state=ready means this call returned semantic data; provider_state=unknown means the public VS Code API could not distinguish no provider from no semantic result. project_anchor_source=explicit means the anchor came from the requested path; project_anchor_source=warmup_candidate means OpenCode selected a heuristic file only to activate a likely language project and it must not be treated as a semantic hit. An empty workspace_symbols result is inconclusive and must never be treated as proof that a symbol does not exist. Retry with a useful path anchor when known, or fall back to search_files for exact symbol text.",
    "Never use find_files to prove that a code symbol does or does not exist: find_files searches path names only, not declarations or file contents.",
    "Use search_files when you need to locate code by file contents, strings, configuration, error text, or regex patterns, then use read_files to inspect the relevant ranges; do not pretend you searched or read files without calling tools.",
    "search_files is literal by default. Use is_regex=true only when regex semantics are actually needed, and narrow broad searches with path/include/exclude.",
    "If a tool returns an error or timeout, do not repeat the identical call unchanged. Narrow its scope, adjust the input, choose a more targeted tool, or explain the blocker.",
    "find_files, search_files, and lsp locate different kinds of targets; none substitutes for read_files when implementation details are needed.",
    "When several independent files or ranges are known, request them together in one read_files call.",
    "For large files, prefer targeted line ranges and follow next_start_line only when needed.",
    "Use get_diagnostics for structured editor/language-service errors and warnings, especially after edits or builds."
  ] : []).filter((line) => describedToolNames.every((name) => availableToolNames.has(name) || !new RegExp(`\\b${name}\\b`).test(line)));
  // tool-defer-step01: 加载时追加到末尾（不重排），已发送过的前缀保持不变，利于前缀缓存。
  const deferredByName = new Map(deferredTools.map((tool) => [tool.name, tool]));
  const loadedDeferred = /* @__PURE__ */ new Set();
  const loadDeferredTools = (names) => {
    const added = [];
    for (const name of names) {
      const tool = deferredByName.get(name);
      if (!tool || loadedDeferred.has(name)) continue;
      loadedDeferred.add(name);
      advertisedTools.push(tool);
      tools.push({ type: "function", function: { name: tool.name, description: tool.description ?? "", parameters: tool.inputSchema } });
      codexTools.push({ type: "function", name: tool.name, description: tool.description ?? "", parameters: tool.inputSchema });
      anthropicTools.push({ name: tool.name, description: tool.description ?? "", input_schema: tool.inputSchema });
      added.push(tool);
    }
    return added;
  };
  const searchDeferredTools = (args) => {
    const pending = deferredTools.filter((tool) => !loadedDeferred.has(tool.name));
    const names = Array.isArray(args?.names) ? args.names.filter((name) => typeof name === "string" && name.trim()).map((name) => name.trim()) : [];
    const query = typeof args?.query === "string" ? args.query.trim().toLowerCase() : "";
    const limit = Number.isInteger(args?.limit) ? Math.min(10, Math.max(1, args.limit)) : 5;
    let matched = [];
    if (names.length) {
      const wanted = new Set(names.map((name) => name.toLowerCase()));
      matched = deferredTools.filter((tool) => wanted.has(tool.name.toLowerCase()));
    }
    if (query) {
      const terms = query.split(/[^a-z0-9_\u4e00-\u9fff]+/).filter(Boolean);
      const scored = pending.filter((tool) => !matched.includes(tool)).map((tool) => {
        const name = tool.name.toLowerCase();
        const text = String(tool.description ?? "").toLowerCase();
        let score = 0;
        for (const term of terms) score += (name.includes(term) ? 3 : 0) + (text.includes(term) ? 1 : 0);
        return { tool, score };
      }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, limit);
      matched.push(...scored.map((item) => item.tool));
    }
    if (!matched.length) {
      return `No matching tools. ${pending.length ? `Not loaded yet: ${pending.map((tool) => tool.name).join(", ")}` : "All tools are already loaded."}`;
    }
    loadDeferredTools(matched.map((tool) => tool.name));
    return [
      `Loaded ${matched.length} tool(s); they are callable from your next step:`,
      ...matched.map((tool) => `- ${tool.name}: ${String(tool.description ?? "").replace(/\s+/g, " ").trim()}\n  parameters: ${JSON.stringify(tool.inputSchema ?? { type: "object", properties: {} })}`)
    ].join("\n");
  };
  return { externalToolNames, availableTools, availableToolNames, advertisedTools, deferredTools, loadDeferredTools, searchDeferredTools, tools, codexTools, anthropicTools, editingInstructions, toolInstructions };
}

export { DEFER_TOOLS_MIN, TOOL_SEARCH_TOOL_NAME, CORE_TOOL_NAMES, MAX_API_TOOLS, SUBAGENT_TOOL_NAME, SUBAGENT_READ_TOOLS, SUBAGENT_INSTRUCTIONS, SUBAGENT_TOOL, buildAgentToolCatalog };
