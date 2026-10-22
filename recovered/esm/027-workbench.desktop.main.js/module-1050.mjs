// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadClipboard.ts
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { MainContext } from "./module-0921.mjs";
import { IClipboardService } from "./module-0487.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/api/browser/mainThreadClipboard.ts
var MainThreadClipboard = class {
  constructor(_context, _clipboardService, _logService) {
    this._clipboardService = _clipboardService;
    this._logService = _logService;
  }
  dispose() {
  }
  $readText() {
    this._logService.trace("MainThreadClipboard#readText");
    const readText2 = this._clipboardService.readText();
    return readText2;
  }
  $writeText(value2) {
    this._logService.trace("MainThreadClipboard#writeText with text.length : ", value2.length);
    return this._clipboardService.writeText(value2);
  }
};

MainThreadClipboard = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadClipboard),
  __decorateParam(1, IClipboardService),
  __decorateParam(2, ILogService)
], MainThreadClipboard);
export { MainThreadClipboard };
