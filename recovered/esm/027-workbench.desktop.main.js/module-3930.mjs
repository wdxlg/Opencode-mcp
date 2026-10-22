// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/agentHostClientProxyChannel.ts
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IRequestService } from "./module-0946.mjs";


// src/vs/platform/agentHost/common/agentHostClientProxyChannel.ts
var AGENT_HOST_CLIENT_PROXY_CHANNEL = "agentHostClientProxy";

var AgentHostClientProxyChannel = class {
  constructor(_requestService) {
    this._requestService = _requestService;
  }
  listen(_ctx, event) {
    throw new Error(`No event '${event}' on AgentHostClientProxyChannel`);
  }
  async call(_ctx, command4, arg) {
    switch (command4) {
      case "resolveProxy": {
        const { url } = arg;
        const proxy = await this._requestService.resolveProxy(url);
        return proxy;
      }
      case "lookupAuthorization": {
        const { authInfo } = arg;
        const credentials = await this._requestService.lookupAuthorization(authInfo);
        return credentials;
      }
      case "lookupKerberosAuthorization": {
        const { url } = arg;
        const authorization = await this._requestService.lookupKerberosAuthorization(url);
        return authorization;
      }
    }
    throw new Error(`Unknown command '${command4}' on AgentHostClientProxyChannel`);
  }
};

AgentHostClientProxyChannel = __decorateClass([
  __decorateParam(0, IRequestService)
], AgentHostClientProxyChannel);
export { AGENT_HOST_CLIENT_PROXY_CHANNEL, AgentHostClientProxyChannel };
