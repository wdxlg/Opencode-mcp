// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/meteredConnection/common/meteredConnection.ts
import { createDecorator } from "./module-0077.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/platform/meteredConnection/common/meteredConnection.ts
var IMeteredConnectionService = createDecorator("meteredConnectionService");

var METERED_CONNECTION_SETTING_KEY = "network.meteredConnection";

function getIsBrowserConnectionMetered() {
  const connection = navigator.connection;
  if (!connection) {
    return false;
  }
  if (connection.saveData || connection.metered) {
    return true;
  }
  const effectiveType = connection.effectiveType;
  return effectiveType === "2g" || effectiveType === "slow-2g";
}

var AbstractMeteredConnectionService = class extends Disposable {
  constructor(configurationService, isBrowserConnectionMetered) {
    super();
    this._onDidChangeIsConnectionMetered = this._register(new Emitter());
    this.onDidChangeIsConnectionMetered = this._onDidChangeIsConnectionMetered.event;
    this._isBrowserConnectionMetered = isBrowserConnectionMetered;
    this._meteredConnectionSetting = configurationService.getValue(METERED_CONNECTION_SETTING_KEY);
    this._isConnectionMetered = this._meteredConnectionSetting === "on" || this._meteredConnectionSetting !== "off" && this._isBrowserConnectionMetered;
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(METERED_CONNECTION_SETTING_KEY)) {
        const value2 = configurationService.getValue(METERED_CONNECTION_SETTING_KEY);
        if (value2 !== this._meteredConnectionSetting) {
          this._meteredConnectionSetting = value2;
          this.onUpdated();
        }
      }
    }));
  }
  get isConnectionMetered() {
    return this._isConnectionMetered;
  }
  get isBrowserConnectionMetered() {
    return this._isBrowserConnectionMetered;
  }
  setIsBrowserConnectionMetered(value2) {
    if (value2 !== this._isBrowserConnectionMetered) {
      this._isBrowserConnectionMetered = value2;
      this.onChangeBrowserConnection();
    }
  }
  onChangeBrowserConnection() {
    this.onUpdated();
  }
  onUpdated() {
    const value2 = this._meteredConnectionSetting === "on" || this._meteredConnectionSetting !== "off" && this._isBrowserConnectionMetered;
    if (value2 !== this._isConnectionMetered) {
      this._isConnectionMetered = value2;
      this.onChangeIsConnectionMetered();
    }
  }
  onChangeIsConnectionMetered() {
    this._onDidChangeIsConnectionMetered.fire(this._isConnectionMetered);
  }
};
export { getIsBrowserConnectionMetered, IMeteredConnectionService, METERED_CONNECTION_SETTING_KEY, AbstractMeteredConnectionService };
