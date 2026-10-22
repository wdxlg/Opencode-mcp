// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/otel/agentHostOTelService.ts
import { createDecorator } from "./module-0044.mjs";


// src/vs/platform/agentHost/common/otel/agentHostOTelService.ts
var AgentHostOTelServiceNamespace = "vscode.agent-host";

var AgentHostOTelServiceName = "vscode-agent-host";

var AgentHostSessionSpanName = "vscode.agent_host.session";

var AgentHostSessionTitleSpanName = "vscode.agent_host.session.title_changed";

var AgentHostSessionTitleAttribute = "vscode.agent_host.session.title";

var AgentHostSessionUriAttribute = "vscode.agent_host.session.uri";

var IAgentHostOTelService = createDecorator("agentHostOTelService");
export { AgentHostOTelServiceNamespace, AgentHostOTelServiceName, AgentHostSessionSpanName, AgentHostSessionTitleSpanName, AgentHostSessionTitleAttribute, AgentHostSessionUriAttribute, IAgentHostOTelService };
