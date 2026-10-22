// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/electron-browser/terminalNativeContribution.ts
import { Disposable } from "./module-0012.mjs";
import { ipcRenderer } from "./module-3724.mjs";
import { registerRemoteContributions } from "./module-4012.mjs";
import { URI } from "./module-0032.mjs";
import { disposableWindowInterval, getActiveWindow } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { ITerminalService } from "./module-1149.mjs";
import { IRemoteAgentService } from "./module-0937.mjs";
import { INativeHostService } from "./module-2591.mjs";


// src/vs/workbench/contrib/terminal/electron-browser/terminalNativeContribution.ts
var TerminalNativeContribution = class extends Disposable {
  constructor(_fileService, _terminalService, remoteAgentService, nativeHostService) {
    super();
    this._fileService = _fileService;
    this._terminalService = _terminalService;
    ipcRenderer.on("vscode:openFiles", (_, ...args2) => {
      this._onOpenFileRequest(args2[0]);
    });
    this._register(nativeHostService.onDidResumeOS(() => this._onOsResume()));
    this._terminalService.setNativeDelegate({
      getWindowCount: () => nativeHostService.getWindowCount()
    });
    const connection = remoteAgentService.getConnection();
    if (connection && connection.remoteAuthority) {
      registerRemoteContributions();
    }
  }
  _onOsResume() {
    for (const instance2 of this._terminalService.instances) {
      instance2.xterm?.forceRedraw();
    }
  }
  async _onOpenFileRequest(request2) {
    if (request2.termProgram === "vscode" && request2.filesToWait) {
      const waitMarkerFileUri = URI.revive(request2.filesToWait.waitMarkerFileUri);
      await this._whenFileDeleted(waitMarkerFileUri);
      this._terminalService.activeInstance?.focus();
    }
  }
  _whenFileDeleted(path) {
    return new Promise((resolve3) => {
      let running = false;
      const interval = disposableWindowInterval(getActiveWindow(), async () => {
        if (!running) {
          running = true;
          const exists = await this._fileService.exists(path);
          running = false;
          if (!exists) {
            interval.dispose();
            resolve3(void 0);
          }
        }
      }, 1e3);
    });
  }
};

TerminalNativeContribution = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, ITerminalService),
  __decorateParam(2, IRemoteAgentService),
  __decorateParam(3, INativeHostService)
], TerminalNativeContribution);
export { TerminalNativeContribution };
