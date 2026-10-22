// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/common/debugAccessibilityAnnouncer.ts
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { Expression } from "./module-1064.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IDebugService } from "./module-1057.mjs";
import { ILogService } from "./module-0095.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/debug/common/debugAccessibilityAnnouncer.ts
var DebugWatchAccessibilityAnnouncer = class extends Disposable {
  constructor(_debugService, _logService, _accessibilityService, _configurationService) {
    super();
    this._debugService = _debugService;
    this._logService = _logService;
    this._accessibilityService = _accessibilityService;
    this._configurationService = _configurationService;
    this._listener = this._register(new MutableDisposable());
    this._setListener();
    this._register(_configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("accessibility.debugWatchVariableAnnouncements")) {
        this._setListener();
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.debugWatchAccessibilityAnnouncer";
  }
  _setListener() {
    const value2 = this._configurationService.getValue("accessibility.debugWatchVariableAnnouncements");
    if (value2 && !this._listener.value) {
      this._listener.value = this._debugService.getModel().onDidChangeWatchExpressionValue((e) => {
        if (!e || e.value === Expression.DEFAULT_VALUE) {
          return;
        }
        this._accessibilityService.alert(`${e.name} = ${e.value}`);
        this._logService.trace(`debugAccessibilityAnnouncerValueChanged ${e.name} ${e.value}`);
      });
    } else {
      this._listener.clear();
    }
  }
};

DebugWatchAccessibilityAnnouncer = __decorateClass([
  __decorateParam(0, IDebugService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IAccessibilityService),
  __decorateParam(3, IConfigurationService)
], DebugWatchAccessibilityAnnouncer);
export { DebugWatchAccessibilityAnnouncer };
