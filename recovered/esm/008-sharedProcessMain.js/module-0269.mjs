// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/sharedProcess/common/sharedProcess.ts



// src/vs/platform/sharedProcess/common/sharedProcess.ts
var SharedProcessLifecycle = {
  exit: "vscode:electron-main->shared-process=exit",
  ipcReady: "vscode:shared-process->electron-main=ipc-ready",
  initDone: "vscode:shared-process->electron-main=init-done"
};

var SharedProcessRawConnection = {
  request: "vscode:createSharedProcessRawConnection",
  response: "vscode:createSharedProcessRawConnectionResult"
};
export { SharedProcessLifecycle, SharedProcessRawConnection };
