// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/meteredConnection/common/meteredConnection.ts
import { __esm } from "./module-0000.mjs";
import { Emitter, init_event } from "./module-0021.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";


// src/vs/platform/meteredConnection/common/meteredConnection.ts
var IMeteredConnectionService, METERED_CONNECTION_SETTING_KEY, AbstractMeteredConnectionService;

var init_meteredConnection = __esm({
  "src/vs/platform/meteredConnection/common/meteredConnection.ts"() {
    init_event();
    init_lifecycle();
    init_instantiation();
    IMeteredConnectionService = createDecorator("meteredConnectionService");
    METERED_CONNECTION_SETTING_KEY = "network.meteredConnection";
    AbstractMeteredConnectionService = class extends Disposable {
      constructor(configurationService, isBrowserConnectionMetered) {
        super();
        this._onDidChangeIsConnectionMetered = this._register(new Emitter());
        this.onDidChangeIsConnectionMetered = this._onDidChangeIsConnectionMetered.event;
        this._isBrowserConnectionMetered = isBrowserConnectionMetered;
        this._meteredConnectionSetting = configurationService.getValue(METERED_CONNECTION_SETTING_KEY);
        this._isConnectionMetered = this._meteredConnectionSetting === "on" || this._meteredConnectionSetting !== "off" && this._isBrowserConnectionMetered;
        this._register(configurationService.onDidChangeConfiguration((e) => {
          if (e.affectsConfiguration(METERED_CONNECTION_SETTING_KEY)) {
            const value = configurationService.getValue(METERED_CONNECTION_SETTING_KEY);
            if (value !== this._meteredConnectionSetting) {
              this._meteredConnectionSetting = value;
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
      setIsBrowserConnectionMetered(value) {
        if (value !== this._isBrowserConnectionMetered) {
          this._isBrowserConnectionMetered = value;
          this.onChangeBrowserConnection();
        }
      }
      onChangeBrowserConnection() {
        this.onUpdated();
      }
      onUpdated() {
        const value = this._meteredConnectionSetting === "on" || this._meteredConnectionSetting !== "off" && this._isBrowserConnectionMetered;
        if (value !== this._isConnectionMetered) {
          this._isConnectionMetered = value;
          this.onChangeIsConnectionMetered();
        }
      }
      onChangeIsConnectionMetered() {
        this._onDidChangeIsConnectionMetered.fire(this._isConnectionMetered);
      }
    };
  }
});
export { IMeteredConnectionService, METERED_CONNECTION_SETTING_KEY, AbstractMeteredConnectionService, init_meteredConnection };
