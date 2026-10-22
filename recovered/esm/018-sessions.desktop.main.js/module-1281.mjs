// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadTheming.ts
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { IThemeService } from "./module-0287.mjs";


// src/vs/workbench/api/browser/mainThreadTheming.ts
var MainThreadTheming = class {
  constructor(extHostContext, themeService) {
    this._themeService = themeService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostTheming);
    this._themeChangeListener = this._themeService.onDidColorThemeChange((e4) => {
      this._proxy.$onColorThemeChange(this._themeService.getColorTheme().type);
    });
    this._proxy.$onColorThemeChange(this._themeService.getColorTheme().type);
  }
  dispose() {
    this._themeChangeListener.dispose();
  }
};

MainThreadTheming = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadTheming),
  __decorateParam(1, IThemeService)
], MainThreadTheming);
export { MainThreadTheming };
