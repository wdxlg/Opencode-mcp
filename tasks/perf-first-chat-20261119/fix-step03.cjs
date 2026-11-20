// tool-defer-step01 + prompt-cache-step03 (perf-first-chat-20261119)
// 1) Deferred tool loading: only core tools are sent with full schemas; the rest are listed by name in
//    tool_search, which loads them (and their schemas) on demand. A direct call to a deferred tool also loads it.
// 2) prompt_cache_key on Chat Completions (stable per endpoint+model+workspace) with a one-time fallback
//    when a provider rejects the field.
const fs = require("fs");
const path = require("path");
const root = process.argv[2] || process.cwd();
const host = path.join(root, "recovered/esm/002-agent-host.js");
const crlf = /* @__PURE__ */ new Map();
function readText(p) {
  const raw = fs.readFileSync(p, "utf8");
  crlf.set(p, raw.includes("\r\n"));
  return raw.replace(/\r\n/g, "\n");
}
function writeText(p, t) {
  fs.writeFileSync(p, crlf.get(p) ? t.replace(/\n/g, "\r\n") : t);
}
function edit(file, pairs) {
  const p = path.join(file);
  let t = readText(p);
  for (const [from, to, opts] of pairs) {
    const count = t.split(from).length - 1;
    const want = opts?.count ?? 1;
    if (count !== want) throw new Error(`${path.basename(p)}: expected ${want} match(es), got ${count}: ${from.slice(0, 80)}`);
    t = t.split(from).join(to);
  }
  writeText(p, t);
  console.log("patched", path.relative(root, p));
}

// ---------- agent-tool-catalog.mjs ----------
edit(path.join(host, "agent-tool-catalog.mjs"), [
  ["var MAX_API_TOOLS = 128;\n", `var MAX_API_TOOLS = 128;

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
    description: \`Load more tools. To keep each request small, only the core tools are sent with full definitions. The tools named below exist but their descriptions and parameter schemas are not loaded yet. Call tool_search with names (exact tool names) or query (keywords); the matching tools' descriptions and schemas are returned and they become callable from your next step. If you already know a listed tool's parameters you may call it directly. Not loaded yet: \${deferredTools.map((tool) => tool.name).join(", ")}\`,
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
`],
  ["  const availableToolNames = new Set(availableTools.map((tool) => tool.name));\n", `  const availableToolNames = new Set(availableTools.map((tool) => tool.name));
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
`],
  ["  const tools = availableTools.map((tool) => ({", "  const tools = advertisedTools.map((tool) => ({"],
  ["  const codexTools = availableTools.map((tool) => ({", "  const codexTools = advertisedTools.map((tool) => ({"],
  ["  const anthropicTools = availableTools.map((tool) => ({", "  const anthropicTools = advertisedTools.map((tool) => ({"],
  ["  return { externalToolNames, availableTools, availableToolNames, tools, codexTools, anthropicTools, editingInstructions, toolInstructions };\n", `  // tool-defer-step01: 加载时追加到末尾（不重排），已发送过的前缀保持不变，利于前缀缓存。
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
      const terms = query.split(/[^a-z0-9_\\u4e00-\\u9fff]+/).filter(Boolean);
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
      return \`No matching tools. \${pending.length ? \`Not loaded yet: \${pending.map((tool) => tool.name).join(", ")}\` : "All tools are already loaded."}\`;
    }
    loadDeferredTools(matched.map((tool) => tool.name));
    return [
      \`Loaded \${matched.length} tool(s); they are callable from your next step:\`,
      ...matched.map((tool) => \`- \${tool.name}: \${String(tool.description ?? "").replace(/\\s+/g, " ").trim()}\\n  parameters: \${JSON.stringify(tool.inputSchema ?? { type: "object", properties: {} })}\`)
    ].join("\\n");
  };
  return { externalToolNames, availableTools, availableToolNames, advertisedTools, deferredTools, loadDeferredTools, searchDeferredTools, tools, codexTools, anthropicTools, editingInstructions, toolInstructions };
`],
  ["export { MAX_API_TOOLS,", "export { DEFER_TOOLS_MIN, TOOL_SEARCH_TOOL_NAME, CORE_TOOL_NAMES, MAX_API_TOOLS,"]
]);

// ---------- agent-request.mjs ----------
edit(path.join(host, "agent-request.mjs"), [
  ["function buildChatRequestBody(r, includeUsage = false) {", "function buildChatRequestBody(r, includeUsage = false, includeCacheKey = false) {"],
  ["    stream: true,\n    ...includeUsage ? { stream_options: { include_usage: true } } : {}",
   "    ...includeCacheKey && r.promptCacheKey ? { prompt_cache_key: r.promptCacheKey } : {},\n    stream: true,\n    ...includeUsage ? { stream_options: { include_usage: true } } : {}", { count: 2 }]
]);

// ---------- module-0029.mjs ----------
const m29 = path.join(host, "module-0029.mjs");
{
  let t = readText(m29);
  const start = t.indexOf("      const requestChat = async (chatEndpoint) => {");
  const end = t.indexOf("      const requestChatOrPrompt = async (chatEndpoint) => {");
  if (start < 0 || end < 0 || end < start || t.indexOf("      const requestChat = async (chatEndpoint) => {", start + 1) >= 0) throw new Error("module-0029: requestChat anchors");
  t = t.slice(0, start) + `      const requestChat = async (chatEndpoint) => {
        const usageRouteKey = \`\${chatEndpoint}\\n\${input2.model}\`;
        // prompt-cache-step03: 带 prompt_cache_key（同端点+模型+工作区稳定），供应商拒收时去掉重试并按路由记住。
        const send = async (includeUsage) => {
          const withKey = Boolean(promptCacheKey) && !promptCacheKeyUnsupportedRoutes.has(usageRouteKey);
          try {
            return await requestChatCompletion(chatEndpoint, headers, JSON.stringify(chatBody(includeUsage, withKey)), input2, fetchImpl, onContentDelta, onReasoningDelta);
          } catch (error2) {
            if (!withKey || streamedOutput || input2.signal?.aborted || error2 instanceof ModelStreamTimeoutError || !isPromptCacheKeyRejected(error2)) throw error2;
            if (promptCacheKeyUnsupportedRoutes.size >= 64) promptCacheKeyUnsupportedRoutes.delete(promptCacheKeyUnsupportedRoutes.values().next().value);
            promptCacheKeyUnsupportedRoutes.add(usageRouteKey);
            console.error(\`[prompt-cache] \${input2.model} rejected prompt_cache_key; retrying without it and remembering this route\`);
            return await requestChatCompletion(chatEndpoint, headers, JSON.stringify(chatBody(includeUsage, false)), input2, fetchImpl, onContentDelta, onReasoningDelta);
          }
        };
        if (!streamUsageUnsupportedRoutes.has(usageRouteKey)) {
          try {
            return await send(true);
          } catch (error2) {
            if (streamedOutput || input2.signal?.aborted || error2 instanceof ModelStreamTimeoutError || !isStreamUsageOptionRejected(error2)) throw error2;
            if (streamUsageUnsupportedRoutes.size >= 64) streamUsageUnsupportedRoutes.delete(streamUsageUnsupportedRoutes.values().next().value);
            streamUsageUnsupportedRoutes.add(usageRouteKey);
          }
        }
        return await send(false);
      };
` + t.slice(end);
  writeText(m29, t);
}
edit(m29, [
  ["import { MAX_API_TOOLS, SUBAGENT_TOOL_NAME,", "import { TOOL_SEARCH_TOOL_NAME, MAX_API_TOOLS, SUBAGENT_TOOL_NAME,"],
  ["const streamUsageUnsupportedRoutes = /* @__PURE__ */ new Set();\n", `const streamUsageUnsupportedRoutes = /* @__PURE__ */ new Set();
// prompt-cache-step03: 拒收 prompt_cache_key 的「地址+模型」
const promptCacheKeyUnsupportedRoutes = /* @__PURE__ */ new Set();
function isPromptCacheKeyRejected(error2) {
  const message = error2 instanceof Error ? error2.message : String(error2 ?? "");
  if (/prompt_cache_key/i.test(message)) return true;
  if (/stream_options|include_usage/i.test(message)) return false;
  const status = typeof error2 === "object" && error2 !== null && "status" in error2 ? Number(error2.status) : NaN;
  return (status === 400 || status === 422) && /unrecogni[sz]ed|unknown (field|param|parameter|argument|key)|extra (fields|inputs)|additional propert|not permitted/i.test(message);
}
`],
  ["    const { externalToolNames, availableTools, availableToolNames, tools, codexTools, anthropicTools, editingInstructions, toolInstructions } = await buildAgentToolCatalog(",
   "    const { externalToolNames, availableTools, availableToolNames, advertisedTools, loadDeferredTools, searchDeferredTools, tools, codexTools, anthropicTools, editingInstructions, toolInstructions } = await buildAgentToolCatalog("],
  ["const toolDefinitionTokens = estimatedTokens(availableTools.map(", "const toolDefinitionTokens = estimatedTokens(advertisedTools.map("],
  ["      firstStep = 1;\n    }\n", `      firstStep = 1;
    }
    // tool-defer-step01: 恢复的检查点里已调用过的延迟工具，先加载定义
    for (const message of messages) for (const call of Array.isArray(message?.tool_calls) ? message.tool_calls : []) if (typeof call?.function?.name === "string") loadDeferredTools([call.function.name]);
    // prompt-cache-step03: 同一端点+模型+工作区共用的缓存路由键（OpenAI 兼容 Chat Completions）
    const promptCacheKey = anthropic || deepSeek || input2.promptCacheKey === false ? void 0 : typeof input2.promptCacheKey === "string" && input2.promptCacheKey.trim() ? input2.promptCacheKey.trim().slice(0, 64) : \`oc-\${(0, import_node_crypto.createHash)("sha256").update(JSON.stringify([input2.baseUrl ?? "", input2.model ?? "", input2.workspaceRoot ?? ""])).digest("hex").slice(0, 32)}\`;
`],
  ["promptToolMode, availableTools, deepSeek,", "promptToolMode, availableTools: advertisedTools, deepSeek,"],
  ["      const chatBody = (includeUsage = false) => buildChatRequestBody(requestParams(), includeUsage);",
   "      const chatBody = (includeUsage = false, includeCacheKey = false) => buildChatRequestBody({ ...requestParams(), promptCacheKey }, includeUsage, includeCacheKey);"],
  ["        let args;\n        try {\n          args = typeof rawArgs", "        // tool-defer-step01: 直接调用了未加载的延迟工具时，把它的定义加进后续请求\n        if (toolName !== TOOL_SEARCH_TOOL_NAME) loadDeferredTools([toolName]);\n        let args;\n        try {\n          args = typeof rawArgs"],
  ["ocToolHookWrap(input2, dependencies, emitTrace, executeToolCall)",
   "ocToolHookWrap(input2, dependencies, emitTrace, async (prepared) => !prepared.unavailableReason && prepared.toolName === TOOL_SEARCH_TOOL_NAME ? { call: prepared.call, toolName: prepared.toolName, toolResult: { isError: false }, toolText: searchDeferredTools(prepared.args), toolImages: [], durationMs: 0 } : executeToolCall(prepared))"]
]);

// ---------- module-0014.mjs (agent-host input parser) ----------
edit(path.join(host, "module-0014.mjs"), [
  ["    compactOnly: row.compactOnly === true,\n", "    compactOnly: row.compactOnly === true,\n    // tool-defer-step01\n    deferTools: typeof row.deferTools === \"boolean\" ? row.deferTools : void 0,\n"]
]);

// ---------- module-0177.mjs (extension: pass the setting) ----------
edit(path.join(root, "recovered/esm/000-extension.js/module-0177.mjs"), [
  ["        allowedTools,\n        // OpenCode: 「权限」", "        allowedTools,\n        // tool-defer-step01: 工具按需加载（设置 opencode.tools.deferLoading）\n        deferTools: vscode19.workspace.getConfiguration(\"opencode.tools\").get(\"deferLoading\", true) !== false,\n        // OpenCode: 「权限」"]
]);

// ---------- package.json setting ----------
{
  const p = path.join(root, "assets/resources/app/extensions/opencode/package.json");
  let t = readText(p);
  const anchor = "        \"opencode.context.maxImages\": {";
  if (t.split(anchor).length !== 2) throw new Error("package.json anchor");
  if (!t.includes("\"opencode.tools.deferLoading\"")) {
    t = t.replace(anchor, `        "opencode.tools.deferLoading": {
          "type": "boolean",
          "default": true,
          "description": "工具较多时（超过 24 个）只发送核心工具的完整定义，其余工具由模型通过 tool_search 按需加载，以减少每轮请求的 token 并加快首句回复。关闭后每轮都发送全部工具定义。"
        },
${anchor}`);
    JSON.parse(t);
    writeText(p, t);
    console.log("patched package.json");
  }
}
console.log("STEP03_OK");
