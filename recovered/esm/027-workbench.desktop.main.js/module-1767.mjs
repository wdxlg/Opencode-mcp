// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateWorkerHost.ts



// src/vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateWorkerHost.ts
var TextMateWorkerHost = class _TextMateWorkerHost {
  static {
    this.CHANNEL_NAME = "textMateWorkerHost";
  }
  static getChannel(workerServer) {
    return workerServer.getChannel(_TextMateWorkerHost.CHANNEL_NAME);
  }
  static setChannel(workerClient, obj) {
    workerClient.setChannel(_TextMateWorkerHost.CHANNEL_NAME, obj);
  }
};
export { TextMateWorkerHost };
