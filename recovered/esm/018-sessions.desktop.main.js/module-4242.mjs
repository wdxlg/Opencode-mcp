// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/wslRemoteAgentHost.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/platform/agentHost/common/wslRemoteAgentHost.ts
var WSL_REMOTE_AGENT_HOST_CHANNEL = "wslRemoteAgentHost";

var WSL_INSTALL_DOCS_URL = "https://aka.ms/vscode-remote/wsl/install-wsl";

var WSL_ADDRESS_PREFIX = "wsl:";

var IWSLRemoteAgentHostService = createDecorator("wslRemoteAgentHostService");

var IWSLRemoteAgentHostMainService = createDecorator("wslRemoteAgentHostMainService");
export { WSL_REMOTE_AGENT_HOST_CHANNEL, WSL_INSTALL_DOCS_URL, WSL_ADDRESS_PREFIX, IWSLRemoteAgentHostService, IWSLRemoteAgentHostMainService };
