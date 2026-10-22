// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/platform/remote/common/remoteAuthorityResolver.ts
import { createDecorator } from "./module-0038.mjs";


// src/vs/platform/remote/common/remoteAuthorityResolver.ts
var IRemoteAuthorityResolverService = createDecorator("remoteAuthorityResolverService");

var ManagedRemoteConnection = class {
  constructor(id2) {
    this.id = id2;
    this.type = 1 /* Managed */;
  }
  toString() {
    return `Managed(${this.id})`;
  }
};

var WebSocketRemoteConnection = class {
  constructor(host, port) {
    this.host = host;
    this.port = port;
    this.type = 0 /* WebSocket */;
  }
  toString() {
    return `WebSocket(${this.host}:${this.port})`;
  }
};

function getRemoteAuthorityPrefix(remoteAuthority) {
  const plusIndex = remoteAuthority.indexOf("+");
  if (plusIndex === -1) {
    return remoteAuthority;
  }
  return remoteAuthority.substring(0, plusIndex);
}
export { getRemoteAuthorityPrefix, IRemoteAuthorityResolverService, ManagedRemoteConnection, WebSocketRemoteConnection };
