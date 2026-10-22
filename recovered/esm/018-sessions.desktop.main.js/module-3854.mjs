// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/files/electron-browser/watcherClient.ts
import { AbstractUniversalWatcherClient } from "./module-3843.mjs";
import { ProxyChannel, getDelayedChannel } from "./module-1230.mjs";


// src/vs/workbench/services/files/electron-browser/watcherClient.ts
var UniversalWatcherClient = class extends AbstractUniversalWatcherClient {
  constructor(onFileChanges, onLogMessage, verboseLogging, utilityProcessWorkerWorkbenchService) {
    super(onFileChanges, onLogMessage, verboseLogging);
    this.utilityProcessWorkerWorkbenchService = utilityProcessWorkerWorkbenchService;
    this.init();
  }
  createWatcher(disposables) {
    const watcher = ProxyChannel.toService(getDelayedChannel((async () => {
      const { client, onDidTerminate } = disposables.add(await this.utilityProcessWorkerWorkbenchService.createWorker({
        moduleId: "vs/platform/files/node/watcher/watcherMain",
        type: "fileWatcher",
        name: "file-watcher"
      }));
      onDidTerminate.then(({ reason }) => {
        if (reason?.code === 0) {
          this.trace(`terminated by itself with code ${reason.code}, signal: ${reason.signal}`);
        } else {
          this.onError(`terminated by itself unexpectedly with code ${reason?.code}, signal: ${reason?.signal} (ETERM)`);
        }
      });
      return client.getChannel("watcher");
    })()));
    return watcher;
  }
};
export { UniversalWatcherClient };
