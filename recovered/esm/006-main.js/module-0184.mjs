// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/files/node/watcher/watcherClient.ts
import { __esm } from "./module-0000.mjs";
import { FileAccess, init_network } from "./module-0031.mjs";
import { ProxyChannel, getNextTickChannel, init_ipc } from "./module-0054.mjs";
import { Client4, init_ipc_cp } from "./module-0183.mjs";
import { AbstractUniversalWatcherClient, init_watcher } from "./module-0178.mjs";


// src/vs/platform/files/node/watcher/watcherClient.ts
var UniversalWatcherClient;

var init_watcherClient = __esm({
  "src/vs/platform/files/node/watcher/watcherClient.ts"() {
    init_network();
    init_ipc();
    init_ipc_cp();
    init_watcher();
    UniversalWatcherClient = class extends AbstractUniversalWatcherClient {
      constructor(onFileChanges, onLogMessage, verboseLogging) {
        super(onFileChanges, onLogMessage, verboseLogging);
        this.init();
      }
      createWatcher(disposables) {
        const client = disposables.add(new Client4(
          FileAccess.asFileUri("bootstrap-fork").fsPath,
          {
            serverName: "File Watcher",
            args: ["--type=fileWatcher"],
            env: {
              VSCODE_ESM_ENTRYPOINT: "vs/platform/files/node/watcher/watcherMain",
              VSCODE_PIPE_LOGGING: "true",
              VSCODE_VERBOSE_LOGGING: "true"
              // transmit console logs from server to client
            }
          }
        ));
        disposables.add(client.onDidProcessExit(({ code: code2, signal }) => this.onError(`terminated by itself with code ${code2}, signal: ${signal} (ETERM)`)));
        return ProxyChannel.toService(getNextTickChannel(client.getChannel("watcher")));
      }
    };
  }
});
export { UniversalWatcherClient, init_watcherClient };
