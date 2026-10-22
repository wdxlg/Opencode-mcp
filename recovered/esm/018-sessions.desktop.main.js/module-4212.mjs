// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/electron-browser/mcpDevModeDebuggingNode.ts
import { McpDevModeDebugging } from "./module-2304.mjs";
import { timeout } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IDebugService } from "./module-1058.mjs";
import { ICommandService } from "./module-0087.mjs";
import { INativeHostService } from "./module-2566.mjs";


// src/vs/workbench/contrib/mcp/electron-browser/mcpDevModeDebuggingNode.ts
var McpDevModeDebuggingNode = class extends McpDevModeDebugging {
  constructor(debugService, commandService, _nativeHostService) {
    super(debugService, commandService);
    this._nativeHostService = _nativeHostService;
  }
  async ensureListeningOnPort(port) {
    const deadline = Date.now() + 3e4;
    while (await this._nativeHostService.isPortFree(port) && Date.now() < deadline) {
      await timeout(50);
    }
  }
  getDebugPort() {
    return this._nativeHostService.findFreePort(
      5e3,
      10,
      5e3,
      2048
      /* skip 2048 ports between attempts */
    );
  }
};

McpDevModeDebuggingNode = __decorateClass([
  __decorateParam(0, IDebugService),
  __decorateParam(1, ICommandService),
  __decorateParam(2, INativeHostService)
], McpDevModeDebuggingNode);
export { McpDevModeDebuggingNode };
