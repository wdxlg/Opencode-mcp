// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/update/electron-main/updateService.linux.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { CancellationToken, init_cancellation } from "./module-0022.mjs";
import { IConfigurationService, init_configuration } from "./module-0040.mjs";
import { IEnvironmentMainService, init_environmentMainService } from "./module-0094.mjs";
import { ILifecycleMainService, init_lifecycleMainService } from "./module-0102.mjs";
import { ILogService, init_log } from "./module-0075.mjs";
import { IMeteredConnectionService, init_meteredConnection } from "./module-0206.mjs";
import { INativeHostMainService, init_nativeHostMainService } from "./module-0156.mjs";
import { IProductService, init_productService } from "./module-0099.mjs";
import { IRequestService, asJson, init_request } from "./module-0155.mjs";
import { IApplicationStorageMainService, init_storageMainService } from "./module-0109.mjs";
import { ITelemetryService, init_telemetry } from "./module-0104.mjs";
import { State, init_update } from "./module-0201.mjs";
import { AbstractUpdateService, createUpdateURL, init_abstractUpdateService } from "./module-0224.mjs";


// src/vs/platform/update/electron-main/updateService.linux.ts
var LinuxUpdateService;

var init_updateService_linux = __esm({
  "src/vs/platform/update/electron-main/updateService.linux.ts"() {
    init_cancellation();
    init_configuration();
    init_environmentMainService();
    init_lifecycleMainService();
    init_log();
    init_meteredConnection();
    init_nativeHostMainService();
    init_productService();
    init_request();
    init_storageMainService();
    init_telemetry();
    init_update();
    init_abstractUpdateService();
    LinuxUpdateService = class extends AbstractUpdateService {
      constructor(lifecycleMainService, configurationService, environmentMainService, requestService, logService, nativeHostMainService, productService, telemetryService, applicationStorageMainService, meteredConnectionService) {
        super(lifecycleMainService, configurationService, environmentMainService, requestService, logService, productService, telemetryService, applicationStorageMainService, meteredConnectionService, false);
        this.nativeHostMainService = nativeHostMainService;
      }
      buildUpdateFeedUrl(quality, commit, options) {
        return createUpdateURL(this.productService.updateUrl, `linux-${process.arch}`, quality, commit, options);
      }
      doCheckForUpdates(explicit, _pendingCommit) {
        if (!this.quality) {
          return;
        }
        const internalOrg = this.getInternalOrg();
        const background = !explicit && !internalOrg;
        const url = this.buildUpdateFeedUrl(this.quality, this.productService.commit, { background, internalOrg });
        this.setState(State.CheckingForUpdates(explicit));
        this.requestService.request({ url, callSite: "updateService.linux.checkForUpdates" }, CancellationToken.None).then(asJson).then((update) => {
          if (this.state.type !== "checking for updates" /* CheckingForUpdates */) {
            return;
          }
          if (!update || !update.url || !update.version || !update.productVersion) {
            this.setState(State.Idle(1 /* Archive */, void 0, explicit || void 0));
          } else {
            this.setState(State.AvailableForDownload(update));
          }
        }).then(void 0, (err) => {
          if (this.state.type !== "checking for updates" /* CheckingForUpdates */) {
            return;
          }
          this.logService.error(err);
          const message = explicit ? err.message || err : void 0;
          this.setState(State.Idle(1 /* Archive */, message));
        });
      }
      async doDownloadUpdate(state) {
        if (this.productService.downloadUrl && this.productService.downloadUrl.length > 0) {
          this.nativeHostMainService.openExternal(void 0, this.productService.downloadUrl);
        } else if (state.update.url) {
          this.nativeHostMainService.openExternal(void 0, state.update.url);
        }
        this.setState(State.Idle(1 /* Archive */));
      }
    };
    LinuxUpdateService = __decorateClass([
      __decorateParam(0, ILifecycleMainService),
      __decorateParam(1, IConfigurationService),
      __decorateParam(2, IEnvironmentMainService),
      __decorateParam(3, IRequestService),
      __decorateParam(4, ILogService),
      __decorateParam(5, INativeHostMainService),
      __decorateParam(6, IProductService),
      __decorateParam(7, ITelemetryService),
      __decorateParam(8, IApplicationStorageMainService),
      __decorateParam(9, IMeteredConnectionService)
    ], LinuxUpdateService);
  }
});
export { LinuxUpdateService, init_updateService_linux };
