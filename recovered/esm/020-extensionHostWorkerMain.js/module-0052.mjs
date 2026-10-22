// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostRpcService.ts
import { createDecorator } from "./module-0038.mjs";


// src/vs/workbench/api/common/extHostRpcService.ts
var IExtHostRpcService = createDecorator("IExtHostRpcService");

var ExtHostRpcService = class {
  constructor(rpcProtocol) {
    this.getProxy = rpcProtocol.getProxy.bind(rpcProtocol);
    this.set = rpcProtocol.set.bind(rpcProtocol);
    this.dispose = rpcProtocol.dispose.bind(rpcProtocol);
    this.assertRegistered = rpcProtocol.assertRegistered.bind(rpcProtocol);
    this.drain = rpcProtocol.drain.bind(rpcProtocol);
  }
};
export { IExtHostRpcService, ExtHostRpcService };
