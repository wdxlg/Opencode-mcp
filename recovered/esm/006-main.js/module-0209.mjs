// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/meteredConnection/electron-main/meteredConnectionMainService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { DeferredPromise, init_async } from "./module-0034.mjs";
import { IConfigurationService, init_configuration } from "./module-0040.mjs";
import { AbstractMeteredConnectionService, init_meteredConnection } from "./module-0206.mjs";


// src/vs/platform/meteredConnection/electron-main/meteredConnectionMainService.ts
var MeteredConnectionMainService;

var init_meteredConnectionMainService = __esm({
  "src/vs/platform/meteredConnection/electron-main/meteredConnectionMainService.ts"() {
    init_async();
    init_configuration();
    init_meteredConnection();
    MeteredConnectionMainService = class extends AbstractMeteredConnectionService {
      constructor(configurationService) {
        super(configurationService, false);
        this.connectionStateInitialized = new DeferredPromise();
        this.whenConnectionStateInitialized = this.connectionStateInitialized.p;
      }
      setTelemetryService(telemetryService) {
        this.telemetryService = telemetryService;
      }
      setIsBrowserConnectionMetered(value) {
        super.setIsBrowserConnectionMetered(value);
        this.connectionStateInitialized.complete();
      }
      onChangeBrowserConnection() {
        const fireAfter = this.isBrowserConnectionMetered;
        if (!fireAfter) {
          super.onChangeBrowserConnection();
        }
        this.telemetryService?.publicLog2("meteredConnectionStateChange", {
          connectionState: this.isBrowserConnectionMetered
        });
        if (fireAfter) {
          super.onChangeBrowserConnection();
        }
      }
    };
    MeteredConnectionMainService = __decorateClass([
      __decorateParam(0, IConfigurationService)
    ], MeteredConnectionMainService);
  }
});
export { MeteredConnectionMainService, init_meteredConnectionMainService };
