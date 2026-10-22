// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostTheming.ts
import { ColorTheme } from "./module-0238.mjs";
import { Emitter } from "./module-0019.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0052.mjs";


// src/vs/workbench/api/common/extHostTheming.ts
var ExtHostTheming = class {
  constructor(_extHostRpc) {
    this._actual = new ColorTheme(2 /* Dark */);
    this._onDidChangeActiveColorTheme = new Emitter();
  }
  get activeColorTheme() {
    return this._actual;
  }
  $onColorThemeChange(type) {
    let kind;
    switch (type) {
      case "light":
        kind = 1 /* Light */;
        break;
      case "hcDark":
        kind = 3 /* HighContrast */;
        break;
      case "hcLight":
        kind = 4 /* HighContrastLight */;
        break;
      default:
        kind = 2 /* Dark */;
    }
    this._actual = new ColorTheme(kind);
    this._onDidChangeActiveColorTheme.fire(this._actual);
  }
  get onDidChangeActiveColorTheme() {
    return this._onDidChangeActiveColorTheme.event;
  }
};

ExtHostTheming = __decorateClass([
  __decorateParam(0, IExtHostRpcService)
], ExtHostTheming);
export { ExtHostTheming };
