// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
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

function clean2(env2) {
  delete env2[IPCExtHostConnection.ENV_KEY];
  delete env2[SocketExtHostConnection.ENV_KEY];
  delete env2[MessagePortExtHostConnection.ENV_KEY];
}

function writeExtHostConnection(connection, env2) {
  clean2(env2);
  connection.serialize(env2);
}
export { clean2, writeExtHostConnection, IPCExtHostConnection, SocketExtHostConnection, MessagePortExtHostConnection };
