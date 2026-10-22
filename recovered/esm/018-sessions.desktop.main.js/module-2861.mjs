// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/mcpSamplingLog.ts
import { observableMemento } from "./module-1018.mjs";
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/mcp/common/mcpSamplingLog.ts
var samplingMemento = observableMemento({
  defaultValue: /* @__PURE__ */ new Map(),
  key: "mcp.sampling.logs",
  toStorage: (v2) => JSON.stringify(Array.from(v2.entries())),
  fromStorage: (v2) => new Map(JSON.parse(v2))
});

var McpSamplingLog = class extends Disposable {
  constructor(_storageService) {
    super();
    this._storageService = _storageService;
    this._logs = {};
  }
  has(server) {
    const storage = this._getLogStorageForServer(server);
    return storage.get().has(server.definition.id);
  }
  get(server) {
    const storage = this._getLogStorageForServer(server);
    return storage.get().get(server.definition.id);
  }
  getAsText(server) {
    const storage = this._getLogStorageForServer(server);
    const record = storage.get().get(server.definition.id);
    if (!record) {
      return "";
    }
    const parts = [];
    const total = record.bins.reduce((sum2, value2) => sum2 + value2, 0);
    parts.push(localize(17171, null, total));
    parts.push(this._formatRecentRequests(record));
    return parts.join("\n");
  }
  _formatRecentRequests(data) {
    if (!data.lastReqs.length) {
      return "\nNo recent requests.";
    }
    const result = [];
    for (let i2 = 0; i2 < data.lastReqs.length; i2++) {
      const { request: request2, response, at, model } = data.lastReqs[i2];
      result.push(`
[${i2 + 1}] ${new Date(at).toISOString()} ${model}`);
      result.push("  Request:");
      for (const msg of request2) {
        const role = msg.role.padEnd(9);
        let content = "";
        if ("text" in msg.content && msg.content.type === "text") {
          content = msg.content.text;
        } else if ("data" in msg.content) {
          content = `[${msg.content.type} data: ${msg.content.mimeType}]`;
        }
        result.push(`    ${role}: ${content}`);
      }
      result.push("  Response:");
      result.push(`    ${response}`);
    }
    return result.join("\n");
  }
  async add(server, request2, response, model) {
    const now = Date.now();
    const utcOrdinal = Math.floor(now / 864e5 /* MsPerDay */);
    const storage = this._getLogStorageForServer(server);
    const next = new Map(storage.get());
    let record = next.get(server.definition.id);
    if (!record) {
      record = {
        head: utcOrdinal,
        bins: Array.from({ length: 7 /* SamplingRetentionDays */ }, () => 0),
        lastReqs: []
      };
    } else {
      for (let i2 = 0; i2 < utcOrdinal - record.head && i2 < 7 /* SamplingRetentionDays */; i2++) {
        record.bins.pop();
        record.bins.unshift(0);
      }
      record.head = utcOrdinal;
    }
    record.bins[0]++;
    record.lastReqs.unshift({ request: request2, response, at: now, model });
    while (record.lastReqs.length > 30 /* SamplingLastNMessage */) {
      record.lastReqs.pop();
    }
    next.set(server.definition.id, record);
    storage.set(next, void 0);
  }
  _getLogStorageForServer(server) {
    const scope = server.readDefinitions().get().collection?.scope ?? 1 /* WORKSPACE */;
    return this._logs[scope] ??= this._register(samplingMemento(scope, 1 /* MACHINE */, this._storageService));
  }
};

McpSamplingLog = __decorateClass([
  __decorateParam(0, IStorageService)
], McpSamplingLog);
export { samplingMemento, McpSamplingLog };
