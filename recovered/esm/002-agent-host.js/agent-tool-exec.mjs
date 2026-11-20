// split-0029-step05: 从 runOpenAICompatibleAgent 拆出的单个工具调用执行。每轮对话创建一个执行器（不可用工具计数跨步骤累计，
// 与拆分前同一变量的语义一致）；子 agent 与项目 hooks 仍由 module-0029 的 ocToolHookWrap 包在外面。
import { agentToolResultContent } from "./module-0065.mjs";

var MAX_UNAVAILABLE_TOOL_ATTEMPTS = 5;

// checkpoint-step01: 从 Codex 风格补丁里取出要改动的文件路径（Add / Update / Delete / Move to）
function patchTargetPaths(patch) {
  if (typeof patch !== "string") return [];
  const paths = [];
  for (const match of patch.matchAll(/^\*\*\* (?:Add File|Update File|Delete File|Move to): (.+)$/gm)) {
    const value = match[1].trim();
    if (value && !paths.includes(value)) paths.push(value);
  }
  return paths.slice(0, 50);
}

function toolFailureText(toolName, error2) {
  const detail = error2 instanceof Error ? error2.message : String(error2);
  return `${toolName} failed: ${detail || "Unknown tool error"}`;
}

function createToolCallExecutor({ input2, client, availableToolNames, externalToolNames, fileToolRequestOptions }) {
  let unavailableToolAttempts = 0;
  return async ({ call, toolName, args, unavailableReason }) => {
    const startedAt = Date.now();
    if (unavailableReason) {
      unavailableToolAttempts += 1;
      if (unavailableToolAttempts >= MAX_UNAVAILABLE_TOOL_ATTEMPTS) {
        const mcpHint = toolName.startsWith("mcp__") ? " This looks like an MCP tool whose server may be disconnected; restart the server from the MCP servers view and send a new message." : "";
        throw new Error(
          `${unavailableReason} (repeated ${unavailableToolAttempts} times; aborting to avoid an infinite tool loop).${mcpHint}`
        );
      }
      return {
        call,
        toolName,
        toolResult: { isError: true },
        toolText: `${toolName || "(unnamed)"} unavailable: ${unavailableReason}. Only the tools listed in this conversation may be called. Currently available tools: ${(input2.subagentToolPolicy ? [...availableToolNames].filter((name) => name !== "spawn_subagent" && (input2.subagentToolPolicy.full || name === "tool_search" || input2.subagentToolPolicy.executable?.includes(name))) : [...availableToolNames]).join(", ") || "(none)"}.`,
        toolImages: [],
        durationMs: Date.now() - startedAt
      };
    }
    try {
      if (externalToolNames.has(toolName)) {
        if (!input2.executeExternalTool) {
          throw new Error(`External tool executor is unavailable for ${toolName}.`);
        }
        // native-subagent: a spawn_subagent run tells the extension which session (and parent session) made the call.
        const toolResult2 = await input2.executeExternalTool(toolName, args, input2.subagentSession?.id ? { session: input2.subagentSession } : void 0);
        return {
          call,
          toolName,
          toolResult: { isError: toolResult2.isError ?? false },
          toolText: toolResult2.text,
          toolImages: [],
          durationMs: Date.now() - startedAt
        };
      }
      if (!client) throw new Error(`Workspace tool client is unavailable for ${toolName}.`);
      // OpenCode: 对话面板「权限」为每次询问时，先请求用户确认；未允许则不执行
      if (typeof input2.approveTool === "function" && Array.isArray(input2.approveTools) && input2.approveTools.includes(toolName)) {
        const verdict = await input2.approveTool(toolName, args);
        if (verdict?.allowed !== true) {
          return {
            call,
            toolName,
            toolResult: { isError: true },
            toolText: `PERMISSION_DENIED: the user did not approve this ${toolName} call (${String(verdict?.reason || "denied")}). Nothing was changed. Do not retry the same call as-is; explain what you intended to change or ask the user how to proceed.`,
            toolImages: [],
            durationMs: Date.now() - startedAt
          };
        }
      }
      // checkpoint-step01: apply_patch 写文件前通知扩展用 externalEdit 包住这次修改，
      // 对话里就能看到改动、逐个保留 / 撤销，并可「恢复到检查点」
      const ocEditTicket = toolName === "apply_patch" && typeof input2.beginEdit === "function" ? await input2.beginEdit(patchTargetPaths(args?.patch)).catch(() => void 0) : void 0;
      let toolResult;
      try {
        toolResult = await client.callTool(
          { name: toolName, arguments: args },
          fileToolRequestOptions
        );
      } finally {
        if (ocEditTicket) await input2.endEdit?.(ocEditTicket).catch(() => void 0);
      }
      const toolContent = agentToolResultContent(toolResult);
      return {
        call,
        toolName,
        toolResult,
        toolText: toolContent.text,
        toolImages: toolContent.images,
        durationMs: Date.now() - startedAt
      };
    } catch (error2) {
      input2.signal?.throwIfAborted();
      return {
        call,
        toolName,
        toolResult: { isError: true },
        toolText: toolFailureText(toolName, error2),
        toolImages: [],
        durationMs: Date.now() - startedAt
      };
    }
  };
}

export { MAX_UNAVAILABLE_TOOL_ATTEMPTS, patchTargetPaths, toolFailureText, createToolCallExecutor };
