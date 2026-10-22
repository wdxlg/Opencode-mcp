// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/languageDetection/browser/languageDetectionWorker.protocol.ts



// src/vs/workbench/services/languageDetection/browser/languageDetectionWorker.protocol.ts
var LanguageDetectionWorkerHost = class _LanguageDetectionWorkerHost {
  static {
    this.CHANNEL_NAME = "languageDetectionWorkerHost";
  }
  static getChannel(workerServer) {
    return workerServer.getChannel(_LanguageDetectionWorkerHost.CHANNEL_NAME);
  }
  static setChannel(workerClient, obj) {
    workerClient.setChannel(_LanguageDetectionWorkerHost.CHANNEL_NAME, obj);
  }
};
export { LanguageDetectionWorkerHost };
