// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/remoteAgentHost/browser/remoteAgentHostTerminal.contribution.ts
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { IRemoteAgentHostService, RemoteAgentHostConnectionStatus } from "./module-1736.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAgentHostTerminalService } from "./module-3090.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/providers/remoteAgentHost/browser/remoteAgentHostTerminal.contribution.ts
var RemoteAgentHostTerminalContribution = class extends Disposable {
  constructor(_remoteAgentHostService, _agentHostTerminalService) {
    super();
    this._remoteAgentHostService = _remoteAgentHostService;
    this._agentHostTerminalService = _agentHostTerminalService;
    this._remoteEntries = this._register(new DisposableMap());
    this._register(this._remoteAgentHostService.onDidChangeConnections(() => this._reconcileRemote()));
    this._reconcileRemote();
  }
  _reconcileRemote() {
    const connectedAddresses = /* @__PURE__ */ new Set();
    for (const info of this._remoteAgentHostService.connections) {
      if (!RemoteAgentHostConnectionStatus.isConnected(info.status)) {
        continue;
      }
      const connection = this._remoteAgentHostService.getConnection(info.address);
      if (!connection) {
        continue;
      }
      connectedAddresses.add(info.address);
      if (!this._remoteEntries.has(info.address)) {
        this._remoteEntries.set(info.address, this._agentHostTerminalService.registerEntry({
          name: info.name || info.address,
          address: info.address,
          getConnection: () => connection
        }));
      }
    }
    for (const address of this._remoteEntries.keys()) {
      if (!connectedAddresses.has(address)) {
        this._remoteEntries.deleteAndDispose(address);
      }
    }
  }
};

RemoteAgentHostTerminalContribution = __decorateClass([
  __decorateParam(0, IRemoteAgentHostService),
  __decorateParam(1, IAgentHostTerminalService)
], RemoteAgentHostTerminalContribution);

registerWorkbenchContribution2("workbench.contrib.remoteAgentHostTerminal", RemoteAgentHostTerminalContribution, WorkbenchPhase.AfterRestored);
export { RemoteAgentHostTerminalContribution };
