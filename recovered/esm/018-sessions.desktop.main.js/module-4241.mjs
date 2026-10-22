// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/electron-browser/sshRemoteAgentHostService.ts
import { registerSingleton } from "./module-0135.mjs";
import { ISSHRelayClientFactory, SSHRelayClientFactory, SSHRemoteAgentHostService } from "./module-4240.mjs";
import { ISSHRemoteAgentHostService } from "./module-1779.mjs";


// src/vs/platform/agentHost/electron-browser/sshRemoteAgentHostService.ts
registerSingleton(ISSHRelayClientFactory, SSHRelayClientFactory, 1 /* Delayed */);

registerSingleton(ISSHRemoteAgentHostService, SSHRemoteAgentHostService, 1 /* Delayed */);
export {};
