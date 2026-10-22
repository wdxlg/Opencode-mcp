// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/files/node/watcher/nodejs/nodejsClient.ts
import { AbstractNonRecursiveWatcherClient } from "./module-0134.mjs";
import { NodeJSWatcher } from "./module-0143.mjs";


// src/vs/platform/files/node/watcher/nodejs/nodejsClient.ts
var NodeJSWatcherClient = class extends AbstractNonRecursiveWatcherClient {
  constructor(onFileChanges, onLogMessage, verboseLogging) {
    super(onFileChanges, onLogMessage, verboseLogging);
    this.init();
  }
  createWatcher(disposables) {
    return disposables.add(new NodeJSWatcher(
      void 0
      /* no recursive watching support here */
    ));
  }
};
export { NodeJSWatcherClient };
