// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/processExplorer/electron-browser/processExplorerEditor.ts
import { ProcessExplorerEditor } from "./module-4120.mjs";
import { NativeProcessExplorerControl } from "./module-4121.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/processExplorer/electron-browser/processExplorerEditor.ts
var NativeProcessExplorerEditor = class extends ProcessExplorerEditor {
  constructor(group2, telemetryService, themeService, storageService, instantiationService) {
    super(group2, telemetryService, themeService, storageService, instantiationService);
  }
  createEditor(parent) {
    this.processExplorerControl = this._register(this.instantiationService.createInstance(NativeProcessExplorerControl, parent));
  }
};

NativeProcessExplorerEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IInstantiationService)
], NativeProcessExplorerEditor);
export { NativeProcessExplorerEditor };
