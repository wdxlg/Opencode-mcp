// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/services/extensions/common/extensionHostEnv.ts



// src/vs/workbench/services/extensions/common/extensionHostEnv.ts
var IPCExtHostConnection = class _IPCExtHostConnection {
  constructor(pipeName) {
    this.pipeName = pipeName;
    this.type = 1 /* IPC */;
  }
  static {
    this.ENV_KEY = "VSCODE_EXTHOST_IPC_HOOK";
  }
  serialize(env2) {
    env2[_IPCExtHostConnection.ENV_KEY] = this.pipeName;
  }
};

var SocketExtHostConnection = class _SocketExtHostConnection {
  constructor() {
    this.type = 2 /* Socket */;
  }
  static {
    this.ENV_KEY = "VSCODE_EXTHOST_WILL_SEND_SOCKET";
  }
  serialize(env2) {
    env2[_SocketExtHostConnection.ENV_KEY] = "1";
  }
};

var MessagePortExtHostConnection = class _MessagePortExtHostConnection {
  constructor() {
    this.type = 3 /* MessagePort */;
  }
  static {
    this.ENV_KEY = "VSCODE_WILL_SEND_MESSAGE_PORT";
  }
  serialize(env2) {
    env2[_MessagePortExtHostConnection.ENV_KEY] = "1";
  }
};

function clean(env2) {
  delete env2[IPCExtHostConnection.ENV_KEY];
  delete env2[SocketExtHostConnection.ENV_KEY];
  delete env2[MessagePortExtHostConnection.ENV_KEY];
}

function readExtHostConnection(env2) {
  if (env2[IPCExtHostConnection.ENV_KEY]) {
    return cleanAndReturn(env2, new IPCExtHostConnection(env2[IPCExtHostConnection.ENV_KEY]));
  }
  if (env2[SocketExtHostConnection.ENV_KEY]) {
    return cleanAndReturn(env2, new SocketExtHostConnection());
  }
  if (env2[MessagePortExtHostConnection.ENV_KEY]) {
    return cleanAndReturn(env2, new MessagePortExtHostConnection());
  }
  throw new Error(`No connection information defined in environment!`);
}

function cleanAndReturn(env2, result) {
  clean(env2);
  return result;
}
export { clean, readExtHostConnection, cleanAndReturn, IPCExtHostConnection, SocketExtHostConnection, MessagePortExtHostConnection };
