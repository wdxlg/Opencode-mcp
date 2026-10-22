// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/extensions/electron-browser/cachedExtensionScanner.ts
import { language } from "./module-0014.mjs";
import { getErrorMessage } from "./module-0004.mjs";
import { severity_default } from "./module-0266.mjs";
import { localize } from "./module-0001.mjs";
import { IExtensionsScannerService, toExtensionDescription2 } from "./module-3838.mjs";
import { toExtensionDescription } from "./module-0887.mjs";
import { dedupExtensions } from "./module-3911.mjs";
import { timeout } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IHostService } from "./module-1117.mjs";
import { IUserDataProfileService } from "./module-0997.mjs";
import { IWorkbenchExtensionManagementService } from "./module-1046.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/services/extensions/electron-browser/cachedExtensionScanner.ts
var CachedExtensionScanner = class {
  constructor(_notificationService, _hostService, _extensionsScannerService, _userDataProfileService, _extensionManagementService, _environmentService, _logService) {
    this._notificationService = _notificationService;
    this._hostService = _hostService;
    this._extensionsScannerService = _extensionsScannerService;
    this._userDataProfileService = _userDataProfileService;
    this._extensionManagementService = _extensionManagementService;
    this._environmentService = _environmentService;
    this._logService = _logService;
    this.scannedExtensions = new Promise((resolve3, reject) => {
      this._scannedExtensionsResolve = resolve3;
      this._scannedExtensionsReject = reject;
    });
  }
  async startScanningExtensions() {
    try {
      const extensions = await this._scanInstalledExtensions();
      this._scannedExtensionsResolve(extensions);
    } catch (err) {
      this._scannedExtensionsReject(err);
    }
  }
  async _scanInstalledExtensions() {
    try {
      const language2 = language;
      const result = await Promise.allSettled([
        this._extensionsScannerService.scanSystemExtensions({ language: language2, checkControlFile: true }),
        this._extensionsScannerService.scanUserExtensions({ language: language2, profileLocation: this._userDataProfileService.currentProfile.extensionsResource, useCache: true }),
        this._environmentService.remoteAuthority ? [] : this._extensionManagementService.getInstalledWorkspaceExtensions(false)
      ]);
      let hasErrors = false;
      let scannedSystemExtensions = [];
      if (result[0].status === "fulfilled") {
        scannedSystemExtensions = result[0].value;
      } else {
        hasErrors = true;
        this._logService.error(`Error scanning system extensions:`, getErrorMessage(result[0].reason));
      }
      let scannedUserExtensions = [];
      if (result[1].status === "fulfilled") {
        scannedUserExtensions = result[1].value;
      } else {
        hasErrors = true;
        this._logService.error(`Error scanning user extensions:`, getErrorMessage(result[1].reason));
      }
      let workspaceExtensions = [];
      if (result[2].status === "fulfilled") {
        workspaceExtensions = result[2].value;
      } else {
        hasErrors = true;
        this._logService.error(`Error scanning workspace extensions:`, getErrorMessage(result[2].reason));
      }
      const scannedDevelopedExtensions = [];
      try {
        const allScannedDevelopedExtensions = await this._extensionsScannerService.scanExtensionsUnderDevelopment([...scannedSystemExtensions, ...scannedUserExtensions], { language: language2, includeInvalid: true });
        const invalidExtensions = [];
        for (const extensionUnderDevelopment of allScannedDevelopedExtensions) {
          if (extensionUnderDevelopment.isValid) {
            scannedDevelopedExtensions.push(extensionUnderDevelopment);
          } else {
            invalidExtensions.push(extensionUnderDevelopment);
          }
        }
        if (invalidExtensions.length > 0) {
          this._notificationService.prompt(
            severity_default.Warning,
            invalidExtensions.length === 1 ? localize(23129, null, invalidExtensions[0].location.fsPath, invalidExtensions[0].validations[0][1]) : localize(23128, null, invalidExtensions.map((ext) => `'${ext.location.fsPath}'`).join(", "), invalidExtensions.map((ext) => `${ext.validations[0][1]}`).join(", ")),
            []
          );
        }
      } catch (error) {
        this._logService.error(error);
      }
      const system = scannedSystemExtensions.map((e) => toExtensionDescription2(e, false));
      const user = scannedUserExtensions.map((e) => toExtensionDescription2(e, false));
      const workspace = workspaceExtensions.map((e) => toExtensionDescription(e, false));
      const development = scannedDevelopedExtensions.map((e) => toExtensionDescription2(e, true));
      const r2 = dedupExtensions(system, user, workspace, development, this._logService);
      if (!hasErrors) {
        const disposable = this._extensionsScannerService.onDidChangeCache(() => {
          disposable.dispose();
          this._notificationService.prompt(
            severity_default.Error,
            localize(23127, null),
            [{
              label: localize(23130, null),
              run: () => this._hostService.reload()
            }]
          );
        });
        timeout(5e3).then(() => disposable.dispose());
      }
      return r2;
    } catch (err) {
      this._logService.error(`Error scanning installed extensions:`);
      this._logService.error(err);
      return [];
    }
  }
};

CachedExtensionScanner = __decorateClass([
  __decorateParam(0, INotificationService),
  __decorateParam(1, IHostService),
  __decorateParam(2, IExtensionsScannerService),
  __decorateParam(3, IUserDataProfileService),
  __decorateParam(4, IWorkbenchExtensionManagementService),
  __decorateParam(5, IWorkbenchEnvironmentService),
  __decorateParam(6, ILogService)
], CachedExtensionScanner);
export { CachedExtensionScanner };
