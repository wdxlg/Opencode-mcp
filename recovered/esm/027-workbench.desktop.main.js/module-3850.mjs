// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/secrets/electron-browser/secretStorageService.ts
import { BaseSecretStorageService, ISecretStorageService } from "./module-0948.mjs";
import { createSingleCallFunction } from "./module-0005.mjs";
import { localize } from "./module-0001.mjs";
import { isLinux } from "./module-0014.mjs";
import { severity_default } from "./module-0266.mjs";
import { IEncryptionService, isGnome, isKwallet } from "./module-0947.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IJSONEditingService } from "./module-1643.mjs";
import { INativeEnvironmentService } from "./module-0508.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/secrets/electron-browser/secretStorageService.ts
var NativeSecretStorageService = class extends BaseSecretStorageService {
  constructor(_notificationService, _dialogService, _openerService, _jsonEditingService, _environmentService, storageService, encryptionService, logService) {
    super(
      !!_environmentService.useInMemorySecretStorage,
      storageService,
      encryptionService,
      logService
    );
    this._notificationService = _notificationService;
    this._dialogService = _dialogService;
    this._openerService = _openerService;
    this._jsonEditingService = _jsonEditingService;
    this._environmentService = _environmentService;
    this.notifyOfNoEncryptionOnce = createSingleCallFunction(() => this.notifyOfNoEncryption());
  }
  set(key3, value2) {
    this._sequencer.queue(key3, async () => {
      await this.resolvedStorageService;
      if (this.type !== "persisted" && !this._environmentService.useInMemorySecretStorage) {
        this._logService.trace("[NativeSecretStorageService] Notifying user that secrets are not being stored on disk.");
        await this.notifyOfNoEncryptionOnce();
      }
    });
    return super.set(key3, value2);
  }
  async notifyOfNoEncryption() {
    const buttons = [];
    const troubleshootingButton = {
      label: localize(23350, null),
      run: () => this._openerService.open("https://go.microsoft.com/fwlink/?linkid=2239490"),
      // doesn't close dialogs
      keepOpen: true
    };
    buttons.push(troubleshootingButton);
    let errorMessage = localize(23347, null);
    if (!isLinux) {
      this._notificationService.prompt(severity_default.Error, errorMessage, buttons);
      return;
    }
    const provider = await this._encryptionService.getKeyStorageProvider();
    if (provider === "basic_text" /* basicText */) {
      const detail2 = localize(23352, null);
      const usePlainTextButton = {
        label: localize(23351, null),
        run: async () => {
          await this._encryptionService.setUsePlainTextEncryption();
          await this._jsonEditingService.write(this._environmentService.argvResource, [{ path: ["password-store"], value: "basic" /* basic */ }], true);
          this.reinitialize();
        }
      };
      buttons.unshift(usePlainTextButton);
      await this._dialogService.prompt({
        type: "error",
        buttons,
        message: errorMessage,
        detail: detail2
      });
      return;
    }
    if (isGnome(provider)) {
      errorMessage = localize(23348, null);
    } else if (isKwallet(provider)) {
      errorMessage = localize(23349, null);
    }
    this._notificationService.prompt(severity_default.Error, errorMessage, buttons);
  }
};

NativeSecretStorageService = __decorateClass([
  __decorateParam(0, INotificationService),
  __decorateParam(1, IDialogService),
  __decorateParam(2, IOpenerService),
  __decorateParam(3, IJSONEditingService),
  __decorateParam(4, INativeEnvironmentService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IEncryptionService),
  __decorateParam(7, ILogService)
], NativeSecretStorageService);

registerSingleton(ISecretStorageService, NativeSecretStorageService, 1 /* Delayed */);
export { NativeSecretStorageService };
