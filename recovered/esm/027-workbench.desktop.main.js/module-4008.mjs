// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/processExplorer/electron-browser/processExplorerControl.ts
import { ProcessExplorerControl } from "./module-4006.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IProductService } from "./module-0873.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IProcessService } from "./module-3941.mjs";
import { IClipboardService } from "./module-0487.mjs";


// src/vs/workbench/contrib/processExplorer/electron-browser/processExplorerControl.ts
var NativeProcessExplorerControl = class extends ProcessExplorerControl {
  constructor(container3, instantiationService, productService, contextMenuService, nativeHostService, commandService, processService, clipboardService) {
    super(instantiationService, productService, contextMenuService, commandService, clipboardService);
    this.nativeHostService = nativeHostService;
    this.processService = processService;
    this.create(container3);
  }
  killProcess(pid, signal) {
    return this.nativeHostService.killProcess(pid, signal);
  }
  resolveProcesses() {
    return this.processService.resolveProcesses();
  }
};

NativeProcessExplorerControl = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IProductService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, INativeHostService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, IProcessService),
  __decorateParam(7, IClipboardService)
], NativeProcessExplorerControl);
export { NativeProcessExplorerControl };
