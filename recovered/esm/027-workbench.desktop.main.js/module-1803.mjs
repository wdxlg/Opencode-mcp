// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/agentHostResourceService.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/platform/agentHost/common/agentHostResourceService.ts
var LOCAL_AGENT_HOST_RESOURCE_IDENTITY = /* @__PURE__ */ Symbol("localAgentHostResourceIdentity");

var AgentHostLocalFilePermissionsSettingId = "chat.agentHost.localFilePermissions";

var AgentHostResourcePermissionError = class extends Error {
  constructor(request2) {
    super(request2 ? `Access to ${request2.uri} is not granted.` : "Access to the requested resource is not granted.");
    this.request = request2;
    this.name = "AgentHostResourcePermissionError";
  }
};

var IAgentHostResourceService = createDecorator("agentHostResourceService");
export { LOCAL_AGENT_HOST_RESOURCE_IDENTITY, AgentHostLocalFilePermissionsSettingId, AgentHostResourcePermissionError, IAgentHostResourceService };
