// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/services/search/worker/localFileSearchMain.js
// Original module marker: src/vs/workbench/services/search/common/localFileSearchWorkerTypes.ts



// src/vs/workbench/services/search/common/localFileSearchWorkerTypes.ts
var LocalFileSearchWorkerHost = class _LocalFileSearchWorkerHost {
  static {
    this.CHANNEL_NAME = "localFileSearchWorkerHost";
  }
  static getChannel(workerServer) {
    return workerServer.getChannel(_LocalFileSearchWorkerHost.CHANNEL_NAME);
  }
  static setChannel(workerClient, obj) {
    workerClient.setChannel(_LocalFileSearchWorkerHost.CHANNEL_NAME, obj);
  }
};
export { LocalFileSearchWorkerHost };
