// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/mcpContextKeys.ts
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable } from "./module-0012.mjs";
import { bindContextKey } from "./module-0444.mjs";
import { IMcpService, McpConnectionState } from "./module-1206.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";


// src/vs/workbench/contrib/mcp/common/mcpContextKeys.ts
var McpContextKeys;

((McpContextKeys2) => {
  McpContextKeys2.serverCount = new RawContextKey("mcp.serverCount", void 0, { type: "number", description: localize(17150, null) });
  McpContextKeys2.hasUnknownTools = new RawContextKey("mcp.hasUnknownTools", void 0, { type: "boolean", description: localize(17149, null) });
  McpContextKeys2.hasServersWithErrors = new RawContextKey("mcp.hasServersWithErrors", void 0, { type: "boolean", description: localize(17148, null) });
  McpContextKeys2.toolsCount = new RawContextKey("mcp.toolsCount", void 0, { type: "number", description: localize(17151, null) });
})(McpContextKeys || (McpContextKeys = {}));

var McpContextKeysController = class extends Disposable {
  static {
    this.ID = "workbench.contrib.mcp.contextKey";
  }
  constructor(mcpService, contextKeyService) {
    super();
    const ctxServerCount = McpContextKeys.serverCount.bindTo(contextKeyService);
    const ctxToolsCount = McpContextKeys.toolsCount.bindTo(contextKeyService);
    const ctxHasUnknownTools = McpContextKeys.hasUnknownTools.bindTo(contextKeyService);
    this._store.add(bindContextKey(McpContextKeys.hasServersWithErrors, contextKeyService, (r2) => mcpService.servers.read(r2).some((c) => c.connectionState.read(r2).state === McpConnectionState.Kind.Error)));
    this._store.add(autorun((r2) => {
      const servers = mcpService.servers.read(r2);
      const serverTools = servers.map((s) => s.tools.read(r2));
      ctxServerCount.set(servers.length);
      ctxToolsCount.set(serverTools.reduce((count2, tools) => count2 + tools.length, 0));
      ctxHasUnknownTools.set(mcpService.lazyCollectionState.read(r2).state !== 2 /* AllKnown */ || servers.some((s) => {
        const toolState = s.cacheState.read(r2);
        return toolState === 0 /* Unknown */ || toolState === 2 /* Outdated */ || toolState === 3 /* RefreshingFromUnknown */;
      }));
    }));
  }
};

McpContextKeysController = __decorateClass([
  __decorateParam(0, IMcpService),
  __decorateParam(1, IContextKeyService)
], McpContextKeysController);
export { McpContextKeys, McpContextKeysController };
