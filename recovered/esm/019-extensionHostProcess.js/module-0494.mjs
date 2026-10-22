// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/platform/files/node/watcher/watcherClient.ts
import { AbstractUniversalWatcherClient } from "./module-0392.mjs";
import { Client2 } from "./module-0492.mjs";
import { FileAccess } from "./module-0026.mjs";
import { ProxyChannel, getNextTickChannel } from "./module-0037.mjs";


// src/vs/platform/files/node/watcher/watcherClient.ts
var UniversalWatcherClient = class extends AbstractUniversalWatcherClient {
  constructor(onFileChanges, onLogMessage, verboseLogging) {
    super(onFileChanges, onLogMessage, verboseLogging);
    this.init();
  }
  createWatcher(disposables) {
    const client = disposables.add(new Client2(
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
    disposables.add(client.onDidProcessExit(({ code, signal }) => this.onError(`terminated by itself with code ${code}, signal: ${signal} (ETERM)`)));
    return ProxyChannel.toService(getNextTickChannel(client.getChannel("watcher")));
  }
};
export { UniversalWatcherClient };
