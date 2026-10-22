// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/terminal/browser/terminalStatusList.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { mainWindow } from "./module-0002.mjs";
import { isString } from "./module-0010.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { spinningLoading } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { severity_default } from "./module-0266.mjs";
import { listErrorForeground, listWarningForeground } from "./module-0232.mjs";


// src/vs/workbench/contrib/terminal/browser/terminalStatusList.ts
var TerminalStatusList = class extends Disposable {
  constructor(_configurationService) {
    super();
    this._configurationService = _configurationService;
    this._statuses = /* @__PURE__ */ new Map();
    this._statusTimeouts = /* @__PURE__ */ new Map();
    this._onDidAddStatus = this._register(new Emitter());
    this._onDidRemoveStatus = this._register(new Emitter());
    this._onDidChangePrimaryStatus = this._register(new Emitter());
  }
  get onDidAddStatus() {
    return this._onDidAddStatus.event;
  }
  get onDidRemoveStatus() {
    return this._onDidRemoveStatus.event;
  }
  get onDidChangePrimaryStatus() {
    return this._onDidChangePrimaryStatus.event;
  }
  get primary() {
    let result;
    for (const s of this._statuses.values()) {
      if (!result || s.severity >= result.severity) {
        if (s.icon || !result?.icon) {
          result = s;
        }
      }
    }
    return result;
  }
  get statuses() {
    return Array.from(this._statuses.values());
  }
  add(status2, duration) {
    status2 = this._applyAnimationSetting(status2);
    const outTimeout = this._statusTimeouts.get(status2.id);
    if (outTimeout) {
      mainWindow.clearTimeout(outTimeout);
      this._statusTimeouts.delete(status2.id);
    }
    if (duration && duration > 0) {
      const timeout2 = mainWindow.setTimeout(() => this.remove(status2), duration);
      this._statusTimeouts.set(status2.id, timeout2);
    }
    const existingStatus = this._statuses.get(status2.id);
    if (existingStatus && existingStatus !== status2) {
      this._onDidRemoveStatus.fire(existingStatus);
      this._statuses.delete(existingStatus.id);
    }
    if (!this._statuses.has(status2.id)) {
      const oldPrimary = this.primary;
      this._statuses.set(status2.id, status2);
      this._onDidAddStatus.fire(status2);
      const newPrimary = this.primary;
      if (oldPrimary !== newPrimary) {
        this._onDidChangePrimaryStatus.fire(newPrimary);
      }
    }
  }
  remove(statusOrId) {
    const status2 = isString(statusOrId) ? this._statuses.get(statusOrId) : statusOrId;
    if (status2 && this._statuses.get(status2.id)) {
      const wasPrimary = this.primary?.id === status2.id;
      this._statuses.delete(status2.id);
      this._onDidRemoveStatus.fire(status2);
      if (wasPrimary) {
        this._onDidChangePrimaryStatus.fire(this.primary);
      }
    }
  }
  toggle(status2, value2) {
    if (value2) {
      this.add(status2);
    } else {
      this.remove(status2);
    }
  }
  _applyAnimationSetting(status2) {
    if (!status2.icon || ThemeIcon.getModifier(status2.icon) !== "spin" || this._configurationService.getValue("terminal.integrated.tabs.enableAnimation" /* TabsEnableAnimation */)) {
      return status2;
    }
    let icon2;
    if (status2.icon.id === spinningLoading.id) {
      icon2 = Codicon.play;
    } else {
      icon2 = ThemeIcon.modify(status2.icon, void 0);
    }
    return {
      ...status2,
      icon: icon2
    };
  }
};

TerminalStatusList = __decorateClass([
  __decorateParam(0, IConfigurationService)
], TerminalStatusList);

function getColorForSeverity(severity) {
  switch (severity) {
    case severity_default.Error:
      return listErrorForeground;
    case severity_default.Warning:
      return listWarningForeground;
    default:
      return "";
  }
}
export { getColorForSeverity, TerminalStatusList };
