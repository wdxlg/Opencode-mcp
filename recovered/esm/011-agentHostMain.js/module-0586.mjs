// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/common/agentHostClientProxyChannel.ts
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IRequestService } from "./module-0146.mjs";


// src/vs/platform/agentHost/common/agentHostClientProxyChannel.ts
var AGENT_HOST_CLIENT_PROXY_CHANNEL = "agentHostClientProxy";

function createAgentHostClientProxyConnection(channel) {
  return {
    resolveProxy: (url2) => channel.call("resolveProxy", { url: url2 }),
    lookupAuthorization: (authInfo) => channel.call("lookupAuthorization", { authInfo }),
    lookupKerberosAuthorization: (url2) => channel.call("lookupKerberosAuthorization", { url: url2 })
  };
}

var AgentHostClientProxyChannel = class {
  constructor(_requestService) {
    this._requestService = _requestService;
  }
  listen(_ctx, event) {
    throw new Error(`No event '${event}' on AgentHostClientProxyChannel`);
  }
  async call(_ctx, command, arg) {
    switch (command) {
      case "resolveProxy": {
        const { url: url2 } = arg;
        const proxy = await this._requestService.resolveProxy(url2);
        return proxy;
      }
      case "lookupAuthorization": {
        const { authInfo } = arg;
        const credentials = await this._requestService.lookupAuthorization(authInfo);
        return credentials;
      }
      case "lookupKerberosAuthorization": {
        const { url: url2 } = arg;
        const authorization = await this._requestService.lookupKerberosAuthorization(url2);
        return authorization;
      }
    }
    throw new Error(`Unknown command '${command}' on AgentHostClientProxyChannel`);
  }
};

AgentHostClientProxyChannel = __decorateClass([
  __decorateParam(0, IRequestService)
], AgentHostClientProxyChannel);
export { createAgentHostClientProxyConnection, AGENT_HOST_CLIENT_PROXY_CHANNEL, AgentHostClientProxyChannel };
