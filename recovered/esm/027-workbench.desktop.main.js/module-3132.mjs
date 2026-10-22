// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/sash/browser/sash.ts
import { Disposable } from "./module-0012.mjs";
import { createStyleSheet } from "./module-0224.mjs";
import { Event2 } from "./module-0017.mjs";
import { clamp } from "./module-0040.mjs";
import { setGlobalHoverDelay, setGlobalSashSize } from "./module-0496.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/sash/browser/sash.ts
var SashSettingsController = class extends Disposable {
  constructor(configurationService) {
    super();
    this.configurationService = configurationService;
    this.styleSheet = createStyleSheet();
    const onDidChangeSize = Event2.filter(configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration("workbench.sash.size"));
    onDidChangeSize(this.onDidChangeSize, this, this._store);
    this.onDidChangeSize();
    const onDidChangeHoverDelay2 = Event2.filter(configurationService.onDidChangeConfiguration, (e) => e.affectsConfiguration("workbench.sash.hoverDelay"));
    onDidChangeHoverDelay2(this.onDidChangeHoverDelay, this, this._store);
    this.onDidChangeHoverDelay();
  }
  static {
    this.ID = "workbench.contrib.sash";
  }
  onDidChangeSize() {
    const configuredSize = this.configurationService.getValue("workbench.sash.size");
    const size3 = clamp(configuredSize, 4, 20);
    const hoverSize = clamp(configuredSize, 1, 8);
    this.styleSheet.textContent = `
			.monaco-workbench {
				--vscode-sash-size: ${size3}px;
				--vscode-sash-hover-size: ${hoverSize}px;
			}
		`;
    setGlobalSashSize(size3);
  }
  onDidChangeHoverDelay() {
    setGlobalHoverDelay(this.configurationService.getValue("workbench.sash.hoverDelay"));
  }
};

SashSettingsController = __decorateClass([
  __decorateParam(0, IConfigurationService)
], SashSettingsController);
export { SashSettingsController };
