// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/remote/browser/remoteConnectionHealth.ts
import { severity_default } from "./module-0266.mjs";
import { localize } from "./module-0001.mjs";
import { isWeb } from "./module-0014.mjs";
import { getRemoteName, getRemoteServerRootPath } from "./module-0687.mjs";
import { Codicon } from "./module-0085.mjs";
import { IRemoteAgentService, remoteConnectionLatencyMeasurer } from "./module-0938.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IBannerService } from "./module-1564.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IHostService } from "./module-1118.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IProductService } from "./module-0875.mjs";


// src/vs/workbench/contrib/remote/browser/remoteConnectionHealth.ts
var REMOTE_UNSUPPORTED_CONNECTION_CHOICE_KEY = "remote.unsupportedConnectionChoice";

var BANNER_REMOTE_UNSUPPORTED_CONNECTION_DISMISSED_KEY = "workbench.banner.remote.unsupportedConnection.dismissed";

var BANNER_REMOTE_ARM32_DEPRECATION_DISMISSED_KEY = "workbench.banner.remote.arm32Deprecation.dismissed";

var InitialRemoteConnectionHealthContribution = class {
  constructor(_remoteAgentService, _environmentService, _telemetryService, bannerService, dialogService, openerService, hostService, storageService, productService) {
    this._remoteAgentService = _remoteAgentService;
    this._environmentService = _environmentService;
    this._telemetryService = _telemetryService;
    this.bannerService = bannerService;
    this.dialogService = dialogService;
    this.openerService = openerService;
    this.hostService = hostService;
    this.storageService = storageService;
    this.productService = productService;
    if (this._environmentService.remoteAuthority) {
      this._checkInitialRemoteConnectionHealth();
    }
  }
  async _confirmConnection() {
    let ConnectionChoice;
    ((ConnectionChoice2) => {
      ConnectionChoice2[ConnectionChoice2["Allow"] = 1] = "Allow";
      ConnectionChoice2[ConnectionChoice2["LearnMore"] = 2] = "LearnMore";
      ConnectionChoice2[ConnectionChoice2["Cancel"] = 0] = "Cancel";
    })(ConnectionChoice || (ConnectionChoice = {}));
    const { result, checkboxChecked } = await this.dialogService.prompt({
      type: severity_default.Warning,
      message: localize(18486, null, this.productService.nameLong),
      buttons: [
        {
          label: localize(18479, null),
          run: () => 1 /* Allow */
        },
        {
          label: localize(18482, null),
          run: async () => {
            await this.openerService.open("https://aka.ms/vscode-remote/faq/old-linux");
            return 2 /* LearnMore */;
          }
        }
      ],
      cancelButton: {
        run: () => 0 /* Cancel */
      },
      checkbox: {
        label: localize(18483, null)
      }
    });
    if (result === 2 /* LearnMore */) {
      return await this._confirmConnection();
    }
    const allowed = result === 1 /* Allow */;
    if (allowed && checkboxChecked) {
      this.storageService.store(`${REMOTE_UNSUPPORTED_CONNECTION_CHOICE_KEY}.${this._environmentService.remoteAuthority}`, allowed, 0 /* PROFILE */, 1 /* MACHINE */);
    }
    return allowed;
  }
  async _checkInitialRemoteConnectionHealth() {
    try {
      const environment = await this._remoteAgentService.getRawEnvironment();
      const isArm32Server = environment?.os === 3 /* Linux */ && environment.arch === "arm";
      if (environment && environment.isUnsupportedGlibc) {
        let allowed = this.storageService.getBoolean(`${REMOTE_UNSUPPORTED_CONNECTION_CHOICE_KEY}.${this._environmentService.remoteAuthority}`, 0 /* PROFILE */);
        if (allowed === void 0) {
          allowed = await this._confirmConnection();
        }
        if (allowed) {
          this._showVersionedBanner(
            "unsupportedGlibcWarning.banner",
            BANNER_REMOTE_UNSUPPORTED_CONNECTION_DISMISSED_KEY,
            localize(18487, null, this.productService.nameLong),
            [
              {
                label: localize(18485, null),
                href: "https://aka.ms/vscode-remote/faq/old-linux"
              }
            ]
          );
        } else {
          this.hostService.openWindow({ forceReuseWindow: true, remoteAuthority: null });
          return;
        }
      }
      if (isArm32Server) {
        this._showVersionedBanner(
          "arm32ServerDeprecation.banner",
          BANNER_REMOTE_ARM32_DEPRECATION_DISMISSED_KEY,
          localize(18480, null, this.productService.nameLong),
          [
            {
              label: localize(18481, null),
              href: "https://aka.ms/vscode-remote-linux-arm-32-eol"
            }
          ]
        );
      }
      this._telemetryService.publicLog2("remoteConnectionSuccess", {
        web: isWeb,
        connectionTimeMs: await this._remoteAgentService.getConnection()?.getInitialConnectionTimeMs(),
        remoteName: getRemoteName(this._environmentService.remoteAuthority),
        tunnelName: getRemoteServerRootPath(this._environmentService.remoteAuthority)
      });
      await this._measureExtHostLatency();
    } catch (err) {
      this._telemetryService.publicLog2("remoteConnectionFailure", {
        web: isWeb,
        connectionTimeMs: await this._remoteAgentService.getConnection()?.getInitialConnectionTimeMs(),
        remoteName: getRemoteName(this._environmentService.remoteAuthority),
        message: err ? err.message : ""
      });
    }
  }
  _showVersionedBanner(id2, storageKey, message, actions) {
    const bannerDismissedVersion = this.storageService.get(storageKey, 0 /* PROFILE */) ?? "";
    const shouldShowBanner = bannerDismissedVersion.slice(0, bannerDismissedVersion.lastIndexOf(".")) !== this.productService.version.slice(0, this.productService.version.lastIndexOf("."));
    if (!shouldShowBanner) {
      return;
    }
    this.bannerService.show({
      id: id2,
      message,
      actions,
      icon: Codicon.warning,
      closeLabel: localize(18484, null, this.productService.version),
      onClose: () => {
        this.storageService.store(storageKey, this.productService.version, 0 /* PROFILE */, 1 /* MACHINE */);
      }
    });
  }
  async _measureExtHostLatency() {
    const measurement = await remoteConnectionLatencyMeasurer.measure(this._remoteAgentService);
    if (measurement === void 0) {
      return;
    }
    this._telemetryService.publicLog2("remoteConnectionLatency", {
      web: isWeb,
      remoteName: getRemoteName(this._environmentService.remoteAuthority),
      latencyMs: measurement.current
    });
  }
};

InitialRemoteConnectionHealthContribution = __decorateClass([
  __decorateParam(0, IRemoteAgentService),
  __decorateParam(1, IWorkbenchEnvironmentService),
  __decorateParam(2, ITelemetryService),
  __decorateParam(3, IBannerService),
  __decorateParam(4, IDialogService),
  __decorateParam(5, IOpenerService),
  __decorateParam(6, IHostService),
  __decorateParam(7, IStorageService),
  __decorateParam(8, IProductService)
], InitialRemoteConnectionHealthContribution);
export { REMOTE_UNSUPPORTED_CONNECTION_CHOICE_KEY, BANNER_REMOTE_UNSUPPORTED_CONNECTION_DISMISSED_KEY, BANNER_REMOTE_ARM32_DEPRECATION_DISMISSED_KEY, InitialRemoteConnectionHealthContribution };
