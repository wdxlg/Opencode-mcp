// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/treeSitter/browser/treeSitterThemeService.ts
import { observableFromEvent } from "./module-0057.mjs";
import { derived } from "./module-0054.mjs";
import { findMetadata } from "./module-1675.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchThemeService } from "./module-0916.mjs";


// src/vs/workbench/services/treeSitter/browser/treeSitterThemeService.ts
var TreeSitterThemeService = class {
  constructor(_themeService) {
    this._themeService = _themeService;
    this._colorTheme = observableFromEvent(this._themeService.onDidColorThemeChange, () => this._themeService.getColorTheme());
    this.onChange = derived(this, (reader) => {
      this._colorTheme.read(reader);
      reader.reportChange(void 0);
    });
  }
  findMetadata(captureNames, languageId, bracket, reader) {
    return findMetadata(this._colorTheme.read(reader), captureNames, languageId, bracket);
  }
};

TreeSitterThemeService = __decorateClass([
  __decorateParam(0, IWorkbenchThemeService)
], TreeSitterThemeService);
export { TreeSitterThemeService };
