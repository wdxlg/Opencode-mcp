// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/runtime/mcp-server.js
// Original module marker: src/mcp-server.ts
import { __export, __opencodeImportMetaUrl, __toCommonJS, __toESM } from "./module-0000.mjs";
import { DEFAULT_MCP_CONCURRENCY, mcpConcurrencyLimiter, parallelLimit } from "./module-0102.mjs";
import { McpServer } from "./module-0086.mjs";
import { OPENCODE_BEHAVIOR_VERSION } from "./module-0101.mjs";
import { NEGOTIABLE_LATEST_PROTOCOL_VERSION, PROTOCOL_TRANSPORT_MODE, classifyProtocolEra } from "./module-0103.mjs";
import { FILE_TOOL_DEFINITIONS, invokeFileTool } from "./module-0100.mjs";
import { external_exports } from "./module-0004.mjs";
import { fromJsonSchema2 } from "./module-0087.mjs";
import { StdioServerTransport } from "./module-0088.mjs";
import { MEMORY_TOOL_DEFINITIONS, MEMORY_TOOL_NAMES, brief, briefWithScratchCatalog, executeMemoryTool, getMemoryDir, resolveScratchBucketDir } from "./project-memory.mjs";


// src/mcp-server.ts
var mcp_server_exports = {};

__export(mcp_server_exports, {
  BATCH_TOOLS_TOOL: () => BATCH_TOOLS_TOOL,
  createFileToolsServer: () => createFileToolsServer
});

module.exports = __toCommonJS(mcp_server_exports);

var import_node_path7 = __toESM(require("node:path"), 1);

var import_node_url = require("node:url");


// src/mcp-server.ts
function getWorkspaceRoots() {
  const json2 = process.env.MCP_WORKSPACE_ROOTS_JSON;
  if (json2 !== void 0) {
    const roots = JSON.parse(json2);
    if (!Array.isArray(roots) || roots.length === 0 || roots.length > 8 || roots.some((root) => typeof root !== "string" || !import_node_path7.default.isAbsolute(root))) {
      throw new Error("MCP_WORKSPACE_ROOTS_JSON must contain 1-8 absolute local folders.");
    }
    return roots;
  }
  const configured = process.env.MCP_WORKSPACE_ROOTS?.trim();
  if (!configured) return [process.cwd()];
  return configured.split(import_node_path7.default.delimiter).map((root) => root.trim()).filter(Boolean);
}

var BATCH_TOOLS_TOOL = {
  name: "batch_file_tools",
  title: "Batch File Tools",
  description: [
    "Execute multiple OpenCode file tools in parallel with concurrency control.",
    "Each entry is {name, arguments}. Supports read_files, find_files, search_files, apply_patch, etc.",
    "Results preserve input order and include per-tool success/error.",
    "Use this to read many files or run searches concurrently, reducing round-trips.",
    "Concurrency is limited to 16 by default (maximum 16).",
    "Account login and chat history are preserved across workspace switches via machine-wide workspace-hub (macOS) / globalStorage (Linux/Windows)."
  ].join(" "),
  inputSchema: {
    type: "object",
    properties: {
      calls: {
        type: "array",
        minItems: 1,
        maxItems: 20,
        description: "Array of tool calls to execute in parallel",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Tool name, e.g. read_files" },
            arguments: { type: "object", description: "Tool arguments" }
          },
          required: ["name", "arguments"],
          additionalProperties: false
        }
      },
      concurrency: {
        type: "integer",
        minimum: 1,
        maximum: DEFAULT_MCP_CONCURRENCY,
        description: "Max parallel executions (default 16, max 16)"
      }
    },
    required: ["calls"],
    additionalProperties: false
  },
  outputSchema: {
    type: "object",
    properties: {
      results: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            success: { type: "boolean" },
            result: { type: "object", additionalProperties: true },
            error: { type: "string" }
          },
          required: ["name", "success"],
          additionalProperties: true
        }
      },
      summary: { type: "string" },
      concurrency: { type: "integer" }
    },
    required: ["results", "summary"],
    additionalProperties: true
  },
  annotations: {
    title: "Batch File Tools",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: false
  }
};

function createFileToolsServer(dependencies = {}) {
  const resolveWorkspaceRoots = () => dependencies.getWorkspaceRoots ?? getWorkspaceRoots;
  const fileServerOwner = process.env.MCP_SESSION_ID ? `mcp-file:${process.env.MCP_SESSION_ID}` : `mcp-file:${process.pid}-${Math.random().toString(36).slice(2, 8)}`;
  let boundScratch = null;
  let bootMemoryInstructions;
  try {
    const roots = resolveWorkspaceRoots()();
    const scratchConfig = process.env.OPENCODE_SCRATCH_MEMORY_DIR || "";
    const scope = process.env.MCP_MEMORY_SCOPE === "scratch" ? "scratch" : (roots[0] || "scratch");
    if (scope === "scratch") {
      const scratchRoot = getMemoryDir("scratch", scratchConfig);
      const bucket = resolveScratchBucketDir(scratchRoot, { owner: fileServerOwner });
      bootMemoryInstructions = `===== OpenCode 临时记忆 scratch-memory [隔离桶: ${bucket.bucketId}] =====\n${briefWithScratchCatalog(bucket.dir, scratchRoot, bucket.bucketId, 230)}`;
    } else {
      const memDir = getMemoryDir(scope, scratchConfig);
      bootMemoryInstructions = `===== OpenCode 轻量档案袋记忆 (.opencode-project) =====\n${brief(memDir, 230)}`;
    }
  } catch {}
  const server = new McpServer(
    {
      name: "opencode-file-tools",
      version: OPENCODE_BEHAVIOR_VERSION,
      title: `OpenCode File Tools (MCP ${NEGOTIABLE_LATEST_PROTOCOL_VERSION}, ${PROTOCOL_TRANSPORT_MODE})`
    },
    {
      capabilities: { tools: {} },
      ...bootMemoryInstructions ? { instructions: bootMemoryInstructions } : {},
      cacheHints: {
        "tools/list": { ttlMs: 6e4, cacheScope: "public" },
        "server/discover": { ttlMs: 3e5, cacheScope: "public" }
      }
    }
  );
  const resolveInvokeTool = () => {
    const baseInvoke = dependencies.invokeTool ?? invokeFileTool;
    return async (toolName, toolArgs, toolCtx) => {
      if (MEMORY_TOOL_NAMES.has(toolName)) {
        const roots = Array.isArray(toolCtx?.workspaceRoots) ? toolCtx.workspaceRoots : resolveWorkspaceRoots()();
        const scratchDir = process.env.OPENCODE_SCRATCH_MEMORY_DIR || "";
        const defaultScope = process.env.MCP_MEMORY_SCOPE === "scratch" ? "scratch" : (roots[0] || "scratch");
        const payload = await executeMemoryTool(toolName, toolArgs || {}, {
          owner: fileServerOwner,
          scratchOwner: fileServerOwner,
          workspaceRoots: roots,
          scratchDirectory: scratchDir,
          defaultWorkspaceId: defaultScope === "scratch" ? "scratch" : "project",
          getBoundScratchId: () => boundScratch?.bucketId || "",
          setBoundScratch: (_o, val) => { boundScratch = val; },
          resolveMemoryDir: (wsId, extra = {}) => {
            if (wsId === "scratch" || wsId === "global" || defaultScope === "scratch" || extra.scratchId || extra.topic) {
              const scratchRoot = getMemoryDir("scratch", scratchDir);
              return resolveScratchBucketDir(scratchRoot, {
                owner: fileServerOwner,
                scratchId: extra.scratchId || (extra.topic ? "" : (boundScratch?.bucketId || "")),
                topic: extra.topic || ""
              }).dir;
            }
            return getMemoryDir(defaultScope, scratchDir);
          }
        });
        return { text: JSON.stringify(payload, null, 2), structuredContent: payload };
      }
      return baseInvoke(toolName, toolArgs, toolCtx);
    };
  };
  const resolveSignal = (ctx) => ctx?.mcpReq?.signal ?? ctx?.signal;
  const resolveProtocolEra = (ctx) => classifyProtocolEra(
    ctx?.mcpReq?.protocolVersion ?? ctx?.protocolVersion ?? ctx?.session?.protocolVersion ?? ctx?.transport?.protocolVersion
  );
  const isAbort = (error51) => error51?.name === "AbortError" || error51?.message === "Aborted";
  const toMessage = (error51, fallback) => error51 instanceof Error ? error51.message : fallback;
  const createSingleToolHandler = (targetName, label = targetName) => async (args, ctx) => {
    const requestSignal = resolveSignal(ctx);
    try {
      const result = await mcpConcurrencyLimiter.run(
        () => resolveInvokeTool()(targetName, args, {
          workspaceRoots: resolveWorkspaceRoots(),
          signal: requestSignal
        }),
        requestSignal
      );
      return {
        isError: result.isError || void 0,
        content: result.content ?? [{ type: "text", text: result.text }],
        structuredContent: result.structuredContent
      };
    } catch (error51) {
      const text = isAbort(error51) ? "Tool execution aborted (concurrency limiter)" : toMessage(error51, `${label} failed`);
      return { isError: true, content: [{ type: "text", text }] };
    }
  };
  const registerToolWithSchema = (registeredName, definition, handler) => {
    server.registerTool(
      registeredName,
      {
        title: definition.title ?? registeredName,
        description: definition.description,
        // The four casts below are the SDK boundary, not laziness: registerTool
        // is generic over a Zod shape it infers from `inputSchema`, while these
        // tools carry hand-written JSON Schema validated inside the registry.
        // Passing a passthrough object keeps the SDK from re-validating, and the
        // handler is typed against our own ToolContext rather than the inferred
        // generic. Narrowing these would mean re-deriving Zod types for all 14
        // tools with no runtime gain.
        inputSchema: external_exports.object({}).passthrough(),
        outputSchema: fromJsonSchema2(definition.outputSchema),
        annotations: definition.annotations
      },
      handler
    );
  };
  const allTools = [...FILE_TOOL_DEFINITIONS, ...MEMORY_TOOL_DEFINITIONS, BATCH_TOOLS_TOOL];
  for (const tool of allTools) {
    if (tool.name === BATCH_TOOLS_TOOL.name) {
      registerToolWithSchema(tool.name, tool, async (args, ctx) => {
        const batchSignal = resolveSignal(ctx);
        const calls = args?.calls;
        const requested = Number(args?.concurrency ?? DEFAULT_MCP_CONCURRENCY);
        const concurrency = Number.isFinite(requested) ? Math.min(DEFAULT_MCP_CONCURRENCY, Math.max(1, Math.trunc(requested))) : DEFAULT_MCP_CONCURRENCY;
        if (!Array.isArray(calls) || calls.length === 0) {
          return {
            isError: true,
            content: [{ type: "text", text: "calls must be a non-empty array" }]
          };
        }
        try {
          const results = await parallelLimit(
            calls,
            async (call) => {
              try {
                const result = await resolveInvokeTool()(call.name, call.arguments, {
                  workspaceRoots: resolveWorkspaceRoots(),
                  signal: batchSignal
                });
                return { name: call.name, success: !result.isError, result };
              } catch (error51) {
                return {
                  name: call.name,
                  success: false,
                  error: toMessage(error51, String(error51))
                };
              }
            },
            { concurrency, signal: batchSignal }
          );
          const succeeded = results.filter((r) => r.success).length;
          const summary = `Batch: ${succeeded}/${results.length} succeeded (concurrency=${concurrency}, active=${mcpConcurrencyLimiter.active}, protocol=${resolveProtocolEra(ctx)})`;
          const images = [];
          const metadataResults = results.map((entry, index) => {
            if (!entry.result?.content?.some((block) => block.type === "image")) return entry;
            if (entry.success) {
              images.push({ type: "text", text: `Image from batch call ${index + 1} (${entry.name}):` });
              images.push(...entry.result.content.filter((block) => block.type === "image"));
            }
            return {
              ...entry,
              result: {
                ...entry.result,
                content: entry.result.content.filter((block) => block.type === "text")
              }
            };
          });
          const textResults = metadataResults.map((entry) => {
            if (entry.name !== "read_image" || !entry.result) return entry;
            const { base64: _base642, data_uri: _dataUri, ...metadata } = entry.result.structuredContent;
            return { ...entry, result: { ...entry.result, structuredContent: metadata } };
          });
          return {
            content: [{ type: "text", text: `${summary}
${JSON.stringify(textResults, null, 2)}` }, ...images],
            structuredContent: { results: metadataResults, summary, concurrency }
          };
        } catch (error51) {
          return {
            isError: true,
            content: [{ type: "text", text: toMessage(error51, "batch failed") }]
          };
        }
      });
    } else {
      registerToolWithSchema(tool.name, tool, createSingleToolHandler(tool.name));
    }
  }
  const readFilesTool = allTools.find((t) => t.name === "read_files");
  if (readFilesTool) {
    registerToolWithSchema(
      "read_file",
      { ...readFilesTool, title: readFilesTool.title ?? "Read Files" },
      createSingleToolHandler("read_files", "read_file")
    );
  }
  return server;
}

async function main() {
  const server = createFileToolsServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

if (process.argv[1] && import_node_path7.default.resolve(process.argv[1]) === (0, import_node_url.fileURLToPath)(__opencodeImportMetaUrl)) {
  void main().catch((error51) => {
    console.error(error51);
    process.exitCode = 1;
  });
}

// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BATCH_TOOLS_TOOL,
  createFileToolsServer
});
export { getWorkspaceRoots, createFileToolsServer, main, mcp_server_exports, import_node_path7, import_node_url, BATCH_TOOLS_TOOL };
