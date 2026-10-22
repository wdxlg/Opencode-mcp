// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/encryption/electron-main/encryptionMainService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { init_platform, isMacintosh, isWindows2 } from "./module-0006.mjs";
import { init_encryptionService } from "./module-0090.mjs";
import { ILogService, init_log } from "./module-0075.mjs";


// src/vs/platform/encryption/electron-main/encryptionMainService.ts
import { safeStorage as safeStorageElectron, app as app4 } from "electron";

var safeStorage, EncryptionMainService;

var init_encryptionMainService = __esm({
  "src/vs/platform/encryption/electron-main/encryptionMainService.ts"() {
    init_platform();
    init_encryptionService();
    init_log();
    safeStorage = safeStorageElectron;
    EncryptionMainService = class {
      constructor(logService) {
        this.logService = logService;
        if (app4.commandLine.getSwitchValue("password-store") === "basic" /* basic */) {
          this.logService.trace("[EncryptionMainService] setting usePlainTextEncryption to true...");
          safeStorage.setUsePlainTextEncryption?.(true);
          this.logService.trace("[EncryptionMainService] set usePlainTextEncryption to true");
        }
      }
      async encrypt(value) {
        this.logService.trace("[EncryptionMainService] Encrypting value...");
        try {
          const result = JSON.stringify(safeStorage.encryptString(value));
          this.logService.trace("[EncryptionMainService] Encrypted value.");
          return result;
        } catch (e) {
          this.logService.error(e);
          throw e;
        }
      }
      async decrypt(value) {
        let parsedValue;
        try {
          parsedValue = JSON.parse(value);
          if (!parsedValue.data) {
            throw new Error(`[EncryptionMainService] Invalid encrypted value: ${value}`);
          }
          const bufferToDecrypt = Buffer.from(parsedValue.data);
          this.logService.trace("[EncryptionMainService] Decrypting value...");
          const result = safeStorage.decryptString(bufferToDecrypt);
          this.logService.trace("[EncryptionMainService] Decrypted value.");
          return result;
        } catch (e) {
          this.logService.error(e);
          throw e;
        }
      }
      isEncryptionAvailable() {
        this.logService.trace("[EncryptionMainService] Checking if encryption is available...");
        const result = safeStorage.isEncryptionAvailable();
        this.logService.trace("[EncryptionMainService] Encryption is available: ", result);
        return Promise.resolve(result);
      }
      getKeyStorageProvider() {
        if (isWindows2) {
          return Promise.resolve("dpapi" /* dplib */);
        }
        if (isMacintosh) {
          return Promise.resolve("keychain_access" /* keychainAccess */);
        }
        if (safeStorage.getSelectedStorageBackend) {
          try {
            this.logService.trace("[EncryptionMainService] Getting selected storage backend...");
            const result = safeStorage.getSelectedStorageBackend();
            this.logService.trace("[EncryptionMainService] Selected storage backend: ", result);
            return Promise.resolve(result);
          } catch (e) {
            this.logService.error(e);
          }
        }
        return Promise.resolve("unknown" /* unknown */);
      }
      async setUsePlainTextEncryption() {
        if (isWindows2) {
          throw new Error("Setting plain text encryption is not supported on Windows.");
        }
        if (isMacintosh) {
          throw new Error("Setting plain text encryption is not supported on macOS.");
        }
        if (!safeStorage.setUsePlainTextEncryption) {
          throw new Error("Setting plain text encryption is not supported.");
        }
        this.logService.trace("[EncryptionMainService] Setting usePlainTextEncryption to true...");
        safeStorage.setUsePlainTextEncryption(true);
        this.logService.trace("[EncryptionMainService] Set usePlainTextEncryption to true");
      }
    };
    EncryptionMainService = __decorateClass([
      __decorateParam(0, ILogService)
    ], EncryptionMainService);
  }
});
export { safeStorageElectron, app4, safeStorage, EncryptionMainService, init_encryptionMainService };
