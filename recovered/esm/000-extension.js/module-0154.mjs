// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/extensions/opencode/dist/extension.js
// Original module marker: extensions/opencode/src/external-mcp-registry.ts
import { init_define_OPENCODE_BUILD_INFO } from "./module-0000.mjs";
import { classifyExternalMcpError, externalMcpErrorLogLine } from "./module-0109.mjs";
import { validateExternalMcpId } from "./module-0060.mjs";
import { connectExternalMcp, externalMcpTimeoutMs } from "./module-0155.mjs";
import { MAX_EXTERNAL_MCP_SERVERS } from "./module-0059.mjs";


// extensions/opencode/src/external-mcp-registry.ts
init_define_OPENCODE_BUILD_INFO();

var import_node_crypto21 = require("node:crypto");


// extensions/opencode/src/external-mcp-registry.ts
var MAX_TOOLS = 100;

var MAX_TOOL_BYTES = 1e5;

var MAX_RESULT_BYTES = 1e6;
var MAX_IMAGE_RESULT_BYTES = 16 * 1024 * 1024;

function safeTool(value) {
  return value.toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 70);
}

function changedFingerprint(bindings) {
  return (0, import_node_crypto21.createHash)("sha256").update(JSON.stringify([...bindings].map(([name, value]) => [name, value.upstreamName, value.tool]))).digest("hex");
}

function timeoutSignal(parent, duration3) {
  const timeout = AbortSignal.timeout(duration3);
  return parent ? AbortSignal.any([parent, timeout]) : timeout;
}

async function deadline(work, duration3) {
  let timer;
  try {
    return await Promise.race([work, new Promise((_, reject) => {
      timer = setTimeout(() => reject(Object.assign(new Error("upstream deadline exceeded"), { name: "TimeoutError" })), duration3);
    })]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function safeError(error2) {
  return classifyExternalMcpError(error2).message;
}

function failure(id, error2) {
  const { status, message: message2 } = classifyExternalMcpError(error2);
  return { id, state: "error", toolCount: 0, error: message2, status };
}

var ExternalMcpRegistry = class {
  constructor(deps) {
    this.deps = deps;
  }
  deps;
  states = /* @__PURE__ */ new Map();
  /** Servers that reached `ready` and are still configured: a new connection for them is a reconnect. */
  wasReady = /* @__PURE__ */ new Set();
  bindings = /* @__PURE__ */ new Map();
  fingerprint = "";
  cachedUntil = 0;
  sourceRevision = "";
  generation = 0;
  disposed = false;
  snapshot() {
    return [...this.states.values()].map((state) => ({ ...state.health }));
  }
  /** Synchronous invalidation: no stale exposed name can be called after disable/trust revocation. */
  invalidate() {
    this.generation++;
    this.cachedUntil = 0;
    this.bindings.clear();
    this.deps.onChanged();
  }
  async discard(id) {
    const state = this.states.get(id);
    if (!state) return;
    this.states.delete(id);
    state.controller.abort();
    if (state.pending && !state.connection) void state.pending.then((connection) => connection.close()).catch(() => void 0);
    if (state.connection) await deadline(state.connection.close(), 1500).catch(() => void 0);
  }
  async stopAll() {
    this.invalidate();
    await Promise.allSettled([...this.states.keys()].map((id) => this.discard(id)));
  }
  async dispose() {
    this.disposed = true;
    await this.stopAll();
  }
  async ensure(config2, firstConnectTimeoutMs) {
    validateExternalMcpId(config2.id);
    const key = (0, import_node_crypto21.createHash)("sha256").update(JSON.stringify(config2)).digest("hex");
    let state = this.states.get(config2.id);
    if (state && state.key !== key) {
      await this.discard(config2.id);
      state = void 0;
    }
    if (!state) {
      state = { key, config: config2, controller: new AbortController(), health: { id: config2.id, state: "connecting", toolCount: 0, ...this.wasReady.has(config2.id) ? { reconnecting: true } : {} }, updated: 0, active: 0 };
      this.states.set(config2.id, state);
    }
    if (!state.pending && !state.connection) {
      const owned = state;
      const connecting = (this.deps.connect ?? connectExternalMcp)(
        config2,
        () => {
          if (this.states.get(config2.id) === owned) this.invalidate();
        },
        () => {
          if (this.states.get(config2.id) === owned) {
            this.invalidate();
            void this.discard(config2.id);
          }
        },
        this.deps.bundledBinDir,
        firstConnectTimeoutMs
      );
      state.pending = connecting;
      try {
        const attempts = config2.transport === "http" && config2.httpTransport === "auto" ? 2 : 1;
        const connection = await deadline(connecting, (firstConnectTimeoutMs ?? externalMcpTimeoutMs(config2, "connect")) * attempts + 500);
        if (this.states.get(config2.id) !== state || state.controller.signal.aborted) {
          void connection.close().catch(() => void 0);
          throw new Error("upstream disabled during connect");
        }
        state.connection = connection;
        state.health = { id: config2.id, state: "ready", toolCount: state.health.toolCount };
        this.wasReady.add(config2.id);
      } catch (error2) {
        state.health = failure(config2.id, error2);
        void connecting.then((conn) => conn.close()).catch(() => void 0);
        throw error2;
      } finally {
        state.pending = void 0;
      }
    } else if (state.pending) {
      state.connection = await state.pending;
    }
    return state;
  }
  /** Bounded per-upstream discovery (three seconds unless configured), with independent peers in parallel. */
  async listTools(reserved = /* @__PURE__ */ new Set(), firstConnectTimeouts) {
    if (this.disposed || !this.deps.trusted()) {
      await this.stopAll();
      return [];
    }
    let revision;
    try {
      revision = this.deps.revision?.();
    } catch {
      await this.stopAll();
      return [];
    }
    if (Date.now() < this.cachedUntil && revision === this.sourceRevision) return [...this.bindings.values()].map((item) => item.tool).filter((tool) => !reserved.has(tool.name));
    const generation = ++this.generation;
    let configs;
    try {
      configs = (await this.deps.load()).slice(0, MAX_EXTERNAL_MCP_SERVERS);
    } catch {
      await this.stopAll();
      return [];
    }
    if (this.disposed || !this.deps.trusted() || generation !== this.generation) return [];
    const enabled = new Set(configs.map((config2) => config2.id));
    for (const id of [...this.wasReady]) if (!enabled.has(id)) this.wasReady.delete(id);
    await Promise.allSettled([...this.states.keys()].filter((id) => !enabled.has(id)).map((id) => this.discard(id)));
    const outcomes = await Promise.allSettled(configs.map(async (config2) => {
      const state = await this.ensure(config2, firstConnectTimeouts?.get(config2.id));
      if (!state.connection) return [];
      const listMs = externalMcpTimeoutMs(config2, "list");
      const tools = await deadline(state.connection.list(timeoutSignal(state.controller.signal, listMs)), listMs + 200);
      if (tools.length > MAX_TOOLS) throw new Error("too many tools");
      const local = /* @__PURE__ */ new Map();
      const conflicts = /* @__PURE__ */ new Set();
      for (const tool of tools) {
        if (!tool || typeof tool.name !== "string" || !tool.name || !tool.inputSchema || typeof tool.inputSchema !== "object" || JSON.stringify(tool).length > MAX_TOOL_BYTES) continue;
        const clean = safeTool(tool.name);
        if (!clean || !/^[a-z0-9_]+$/.test(clean)) continue;
        const name = `ext__${config2.id}__${clean}`;
        const definition = {
          name,
          title: `${config2.label} / ${String(tool.title || tool.name).slice(0, 100)}`,
          description: String(tool.description || "").slice(0, 4e3),
          inputSchema: tool.inputSchema,
          ...tool.outputSchema ? { outputSchema: tool.outputSchema } : {},
          annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: true, idempotentHint: false },
          serverId: config2.id,
          upstreamName: tool.name
        };
        if (local.has(name)) {
          conflicts.add(name);
          local.delete(name);
        } else if (!conflicts.has(name)) local.set(name, { serverId: config2.id, upstreamName: tool.name, tool: definition });
      }
      if (conflicts.size) this.deps.log(`[external-mcp] ${config2.id}: ${conflicts.size} unsafe tool-name collisions suppressed`);
      state.updated = Date.now();
      state.health = { id: config2.id, state: "ready", toolCount: local.size };
      return [...local];
    }));
    if (generation !== this.generation || this.disposed || !this.deps.trusted()) return [];
    try {
      if (revision !== this.deps.revision?.()) {
        await this.stopAll();
        return [];
      }
    } catch {
      await this.stopAll();
      return [];
    }
    const next = /* @__PURE__ */ new Map();
    for (let index = 0; index < outcomes.length; index++) {
      const result = outcomes[index];
      if (result.status === "fulfilled") {
        for (const [name, binding] of result.value) if (!reserved.has(name) && !next.has(name)) next.set(name, binding);
      } else {
        const id = configs[index].id;
        const state = this.states.get(id);
        if (state) {
          state.health = failure(id, result.reason);
        }
        this.deps.log(externalMcpErrorLogLine(id, "list", result.reason));
      }
    }
    const fingerprint = changedFingerprint(next);
    this.bindings = next;
    this.sourceRevision = revision ?? "";
    this.cachedUntil = Date.now() + 3e4;
    if (fingerprint !== this.fingerprint) {
      this.fingerprint = fingerprint;
      this.deps.onChanged();
    }
    return [...next.values()].map((binding) => binding.tool);
  }
  hasBinding(name) {
    return this.bindings.has(name);
  }
  async call(name, args, signal, ownerId) {
    if (this.disposed || !this.deps.trusted()) return void 0;
    const binding = this.bindings.get(name);
    if (!binding) return void 0;
    try {
      if (this.deps.revision && this.deps.revision() !== this.sourceRevision) {
        await this.stopAll();
        return void 0;
      }
    } catch {
      await this.stopAll();
      return void 0;
    }
    const state = this.states.get(binding.serverId);
    if (!state?.connection || state.controller.signal.aborted || state.active >= 2) {
      return { isError: true, content: [{ type: "text", text: "\u4E0A\u6E38\u8FDE\u63A5\u5DF2\u65AD\u5F00\u6216\u5E76\u53D1\u5DF2\u6EE1\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002" }] };
    }
    state.active++;
    try {
      const callMs = externalMcpTimeoutMs(state.config, "call");
      if(binding.tool.inputSchema?.properties?._bridge_owner)args={...args,_bridge_owner:(0,import_node_crypto21.createHash)('sha256').update(String(ownerId||'native-default')).digest('hex')};
      const result = await deadline(state.connection.call(binding.upstreamName, args, timeoutSignal(signal ? AbortSignal.any([signal, state.controller.signal]) : state.controller.signal, callMs)), callMs + 200);
      let revisionUnchanged = false;
      try {
        revisionUnchanged = !this.deps.revision || this.deps.revision() === this.sourceRevision;
      } catch {
      }
      if (this.disposed || !this.deps.trusted() || state.controller.signal.aborted || this.bindings.get(name) !== binding || !revisionUnchanged) {
        await this.stopAll();
        return { isError: true, content: [{ type: "text", text: "\u4E0A\u6E38\u6743\u9650\u5DF2\u64A4\u9500\uFF0C\u672C\u6B21\u7ED3\u679C\u672A\u8F6C\u53D1\u3002" }] };
      }
      const hasImage = Array.isArray(result?.content) && result.content.some(item => item?.type === 'image' && typeof item.data === 'string' && /^image\/(?:png|jpeg|webp|gif)$/i.test(item.mimeType || ''));
      const resultLimit = hasImage ? MAX_IMAGE_RESULT_BYTES : MAX_RESULT_BYTES;
      if (Buffer.byteLength(JSON.stringify(result),'utf8') > resultLimit) return { isError: true, content: [{ type: "text", text: hasImage ? '上游图像结果超过 16 MiB；未截断或转发。请按当前 tools/list 参数缩小截图范围或显示器数量。' : '上游文本结果超过 1 MB；未截断或转发。' }] };
      return result;
    } catch (error2) {
      if (!signal?.aborted) {
        this.invalidate();
        void this.discard(binding.serverId);
      }
      return { isError: true, content: [{ type: "text", text: safeError(error2) }] };
    } finally {
      state.active--;
    }
  }
};
export { safeTool, changedFingerprint, timeoutSignal, deadline, safeError, failure, import_node_crypto21, MAX_TOOLS, MAX_TOOL_BYTES, MAX_RESULT_BYTES, ExternalMcpRegistry };
