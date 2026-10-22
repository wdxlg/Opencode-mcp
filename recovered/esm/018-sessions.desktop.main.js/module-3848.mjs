// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/parts/ipc/common/ipc.electron.ts



// src/vs/base/parts/ipc/common/ipc.electron.ts
var Protocol3 = class {
  constructor(sender, onMessage) {
    this.sender = sender;
    this.onMessage = onMessage;
  }
  send(message) {
    try {
      this.sender.send("vscode:message", message.buffer);
    } catch (e4) {
    }
  }
  disconnect() {
    this.sender.send("vscode:disconnect", null);
  }
};
export { Protocol3 };
