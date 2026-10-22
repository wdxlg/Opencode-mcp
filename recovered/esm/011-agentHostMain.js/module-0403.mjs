// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentHostExtensionProtocol.ts
import { vEnum, vObj, vOptionalProp, vString } from "./module-0332.mjs";


// src/vs/platform/agentHost/common/agentHostExtensionProtocol.ts
var CollectAgentHostDebugLogsExtensionMethod = "vscode/collectAgentHostDebugLogs";

var GetAgentHostSessionStateFileExtensionMethod = "vscode/getAgentHostSessionStateFile";

var ReadAgentHostDebugLogsChunkExtensionMethod = "vscode/readAgentHostDebugLogsChunk";

var AgentHostChatStateFileCapabilityMetaKey = "vscode.getAgentHostSessionStateFile.chat";

function getAgentHostExtensionInitializeResultMeta() {
  return { [AgentHostChatStateFileCapabilityMetaKey]: true };
}

var collectAgentHostDebugLogsParamsValidator = vObj({
  session: vOptionalProp(vString()),
  chat: vOptionalProp(vString()),
  kind: vEnum("archive", "directory")
});
export { getAgentHostExtensionInitializeResultMeta, CollectAgentHostDebugLogsExtensionMethod, GetAgentHostSessionStateFileExtensionMethod, ReadAgentHostDebugLogsChunkExtensionMethod, AgentHostChatStateFileCapabilityMetaKey, collectAgentHostDebugLogsParamsValidator };
