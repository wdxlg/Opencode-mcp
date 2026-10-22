// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/files/node/watcher/nodejs/nodejsClient.ts
import { __esm } from "./module-0000.mjs";
import { AbstractNonRecursiveWatcherClient, init_watcher } from "./module-0178.mjs";
import { NodeJSWatcher, init_nodejsWatcher } from "./module-0187.mjs";


// src/vs/platform/files/node/watcher/nodejs/nodejsClient.ts
var NodeJSWatcherClient;

var init_nodejsClient = __esm({
  "src/vs/platform/files/node/watcher/nodejs/nodejsClient.ts"() {
    init_watcher();
    init_nodejsWatcher();
    NodeJSWatcherClient = class extends AbstractNonRecursiveWatcherClient {
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
  }
});
export { NodeJSWatcherClient, init_nodejsClient };
