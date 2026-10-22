// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/platform/files/node/watcher/nodejs/nodejsClient.ts
import { AbstractNonRecursiveWatcherClient } from "./module-0392.mjs";
import { NodeJSWatcher } from "./module-0497.mjs";


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
