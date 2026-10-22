// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/codeEditor/electron-browser/displayChangeRemeasureFonts.ts
import { Disposable } from "./module-0012.mjs";
import { ThrottledDelayer } from "./module-0036.mjs";
import { FontMeasurements } from "./module-0217.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0870.mjs";


// src/vs/workbench/contrib/codeEditor/electron-browser/displayChangeRemeasureFonts.ts
var DisplayChangeRemeasureFonts = class extends Disposable {
  constructor(nativeHostService) {
    super();
    this._delayer = this._register(new ThrottledDelayer(2e3));
    this._register(nativeHostService.onDidChangeDisplay(() => {
      this._delayer.trigger(() => {
        FontMeasurements.clearAllFontInfos();
        return Promise.resolve();
      });
    }));
  }
};

DisplayChangeRemeasureFonts = __decorateClass([
  __decorateParam(0, INativeHostService)
], DisplayChangeRemeasureFonts);

Registry.as(Extensions10.Workbench).registerWorkbenchContribution(DisplayChangeRemeasureFonts, 4 /* Eventually */);
export { DisplayChangeRemeasureFonts };
