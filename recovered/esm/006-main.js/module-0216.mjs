// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/sharedProcess/common/sharedProcess.ts
import { __esm } from "./module-0000.mjs";


// src/vs/platform/sharedProcess/common/sharedProcess.ts
var SharedProcessLifecycle, SharedProcessChannelConnection, SharedProcessRawConnection;

var init_sharedProcess = __esm({
  "src/vs/platform/sharedProcess/common/sharedProcess.ts"() {
    SharedProcessLifecycle = {
      exit: "vscode:electron-main->shared-process=exit",
      ipcReady: "vscode:shared-process->electron-main=ipc-ready",
      initDone: "vscode:shared-process->electron-main=init-done"
    };
    SharedProcessChannelConnection = {
      request: "vscode:createSharedProcessChannelConnection",
      response: "vscode:createSharedProcessChannelConnectionResult"
    };
    SharedProcessRawConnection = {
      request: "vscode:createSharedProcessRawConnection",
      response: "vscode:createSharedProcessRawConnectionResult"
    };
  }
});
export { SharedProcessLifecycle, SharedProcessChannelConnection, SharedProcessRawConnection, init_sharedProcess };
