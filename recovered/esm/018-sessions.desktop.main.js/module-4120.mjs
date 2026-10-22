// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/processExplorer/browser/processExplorerEditor.ts
import { EditorPane } from "./module-1090.mjs";
import { BrowserProcessExplorerControl } from "./module-4119.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/processExplorer/browser/processExplorerEditor.ts
var ProcessExplorerEditor = class extends EditorPane {
  constructor(group2, telemetryService, themeService, storageService, instantiationService) {
    super(ProcessExplorerEditor.ID, group2, telemetryService, themeService, storageService);
    this.instantiationService = instantiationService;
    this.processExplorerControl = void 0;
  }
  static {
    this.ID = "workbench.editor.processExplorer";
  }
  createEditor(parent) {
    this.processExplorerControl = this._register(this.instantiationService.createInstance(BrowserProcessExplorerControl, parent));
  }
  focus() {
    this.processExplorerControl?.focus();
  }
  layout(dimension) {
    this.processExplorerControl?.layout(dimension);
  }
};

ProcessExplorerEditor = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IInstantiationService)
], ProcessExplorerEditor);
export { ProcessExplorerEditor };
