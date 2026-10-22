// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/services/editorWorkerHost.ts



// src/vs/editor/common/services/editorWorkerHost.ts
var EditorWorkerHost = class _EditorWorkerHost {
  static {
    this.CHANNEL_NAME = "editorWorkerHost";
  }
  static getChannel(workerServer) {
    return workerServer.getChannel(_EditorWorkerHost.CHANNEL_NAME);
  }
  static setChannel(workerClient, obj) {
    workerClient.setChannel(_EditorWorkerHost.CHANNEL_NAME, obj);
  }
};
export { EditorWorkerHost };
