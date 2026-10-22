// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/integrity/electron-browser/integrityService.ts
import { FileAccess } from "./module-0033.mjs";
import { localize } from "./module-0001.mjs";
import { severity_default } from "./module-0266.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IProductService } from "./module-0873.mjs";
import { IChecksumService } from "./module-3876.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IIntegrityService } from "./module-3726.mjs";


// src/vs/workbench/services/integrity/electron-browser/integrityService.ts
var IntegrityStorage = class _IntegrityStorage {
  constructor(storageService) {
    this.storageService = storageService;
    this.value = this._read();
  }
  static {
    this.KEY = "integrityService";
  }
  _read() {
    const jsonValue = this.storageService.get(_IntegrityStorage.KEY, -1 /* APPLICATION */);
    if (!jsonValue) {
      return null;
    }
    try {
      return JSON.parse(jsonValue);
    } catch (err) {
      return null;
    }
  }
  get() {
    return this.value;
  }
  set(data) {
    this.value = data;
    this.storageService.store(_IntegrityStorage.KEY, JSON.stringify(this.value), -1 /* APPLICATION */, 1 /* MACHINE */);
  }
};

var IntegrityService = class {
  constructor(notificationService, storageService, lifecycleService, openerService, productService, checksumService, logService) {
    this.notificationService = notificationService;
    this.lifecycleService = lifecycleService;
    this.openerService = openerService;
    this.productService = productService;
    this.checksumService = checksumService;
    this.logService = logService;
    this.storage = new IntegrityStorage(storageService);
    this.isPurePromise = this._isPure();
    this._compute();
  }
  isPure() {
    return this.isPurePromise;
  }
  async _compute() {
    const { isPure } = await this.isPure();
    if (isPure) {
      return;
    }
    this.logService.warn(`

----------------------------------------------
***	Installation has been modified on disk ***
----------------------------------------------

`);
    const storedData = this.storage.get();
    if (storedData?.dontShowPrompt && storedData.commit === this.productService.commit) {
      return;
    }
    this._showNotification();
  }
  async _isPure() {
    const expectedChecksums = this.productService.checksums || {};
    await this.lifecycleService.when(4 /* Eventually */);
    const allResults = await Promise.all(Object.keys(expectedChecksums).map((filename) => this._resolve(filename, expectedChecksums[filename])));
    let isPure = true;
    for (let i2 = 0, len = allResults.length; i2 < len; i2++) {
      if (!allResults[i2].isPure) {
        isPure = false;
        break;
      }
    }
    return {
      isPure,
      proof: allResults
    };
  }
  async _resolve(filename, expected) {
    const fileUri = FileAccess.asFileUri(filename);
    try {
      const checksum = await this.checksumService.checksum(fileUri);
      return IntegrityService._createChecksumPair(fileUri, checksum, expected);
    } catch (error) {
      return IntegrityService._createChecksumPair(fileUri, "", expected);
    }
  }
  static _createChecksumPair(uri5, actual, expected) {
    return {
      uri: uri5,
      actual,
      expected,
      isPure: actual === expected
    };
  }
  _showNotification() {
    const checksumFailMoreInfoUrl = this.productService.checksumFailMoreInfoUrl;
    const message = localize(23175, null, this.productService.nameShort);
    if (checksumFailMoreInfoUrl) {
      this.notificationService.prompt(
        severity_default.Warning,
        message,
        [
          {
            label: localize(23174, null),
            run: () => this.openerService.open(URI.parse(checksumFailMoreInfoUrl))
          },
          {
            label: localize(23173, null),
            isSecondary: true,
            run: () => this.storage.set({ dontShowPrompt: true, commit: this.productService.commit })
          }
        ],
        {
          sticky: true,
          priority: 3 /* URGENT */
        }
      );
    } else {
      this.notificationService.notify({
        severity: severity_default.Warning,
        message,
        sticky: true,
        priority: 3 /* URGENT */
      });
    }
  }
};

IntegrityService = __decorateClass([
  __decorateParam(0, INotificationService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, ILifecycleService),
  __decorateParam(3, IOpenerService),
  __decorateParam(4, IProductService),
  __decorateParam(5, IChecksumService),
  __decorateParam(6, ILogService)
], IntegrityService);

registerSingleton(IIntegrityService, IntegrityService, 1 /* Delayed */);
export { IntegrityStorage, IntegrityService };
