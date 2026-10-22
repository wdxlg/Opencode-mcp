// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/kernelDetection/notebookKernelDetection.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotebookKernelService } from "./module-1387.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { INotebookLoggingService } from "./module-1394.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0872.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/kernelDetection/notebookKernelDetection.ts
var NotebookKernelDetection = class extends Disposable {
  constructor(_notebookKernelService, _extensionService, _notebookLoggingService) {
    super();
    this._notebookKernelService = _notebookKernelService;
    this._extensionService = _extensionService;
    this._notebookLoggingService = _notebookLoggingService;
    this._detectionMap = /* @__PURE__ */ new Map();
    this._localDisposableStore = this._register(new DisposableStore());
    this._registerListeners();
  }
  _registerListeners() {
    this._localDisposableStore.clear();
    this._localDisposableStore.add(this._extensionService.onWillActivateByEvent((e4) => {
      if (e4.event.startsWith("onNotebook:")) {
        if (this._extensionService.activationEventIsDone(e4.event)) {
          return;
        }
        const notebookType = e4.event.substring("onNotebook:".length);
        if (notebookType === "*") {
          return;
        }
        let shouldStartDetection = false;
        const extensionStatus = this._extensionService.getExtensionsStatus();
        this._extensionService.extensions.forEach((extension) => {
          if (extensionStatus[extension.identifier.value].activationTimes) {
            return;
          }
          if (extension.activationEvents?.includes(e4.event)) {
            shouldStartDetection = true;
          }
        });
        if (shouldStartDetection && !this._detectionMap.has(notebookType)) {
          this._notebookLoggingService.debug("KernelDetection", `start extension activation for ${notebookType}`);
          const task = this._notebookKernelService.registerNotebookKernelDetectionTask({
            notebookType
          });
          this._detectionMap.set(notebookType, task);
        }
      }
    }));
    let timer = null;
    this._localDisposableStore.add(this._extensionService.onDidChangeExtensionsStatus(() => {
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        const taskToDelete = [];
        for (const [notebookType, task] of this._detectionMap) {
          if (this._extensionService.activationEventIsDone(`onNotebook:${notebookType}`)) {
            this._notebookLoggingService.debug("KernelDetection", `finish extension activation for ${notebookType}`);
            taskToDelete.push(notebookType);
            task.dispose();
          }
        }
        taskToDelete.forEach((notebookType) => {
          this._detectionMap.delete(notebookType);
        });
      });
    }));
    this._localDisposableStore.add({
      dispose: () => {
        if (timer) {
          clearTimeout(timer);
        }
      }
    });
  }
};

NotebookKernelDetection = __decorateClass([
  __decorateParam(0, INotebookKernelService),
  __decorateParam(1, IExtensionService),
  __decorateParam(2, INotebookLoggingService)
], NotebookKernelDetection);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(NotebookKernelDetection, 3 /* Restored */);
export { NotebookKernelDetection };
