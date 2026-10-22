// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/platform/secrets/common/secrets.ts
import { createDecorator } from "./module-0038.mjs";
import { Disposable, DisposableStore } from "./module-0011.mjs";
import { Emitter, Event } from "./module-0019.mjs";
import { SequencerByKey } from "./module-0034.mjs";
import { Lazy } from "./module-0001.mjs";
import { isWindows } from "./module-0016.mjs";
import { IStorageService, InMemoryStorageService } from "./module-0141.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEncryptionService } from "./module-0161.mjs";
import { ILogService } from "./module-0045.mjs";


// src/vs/platform/secrets/common/secrets.ts
var SECRET_STORAGE_PREFIX = "secret://";

function secretStorageKey(key) {
  return `${SECRET_STORAGE_PREFIX}${key}`;
}

async function readEncryptedSecret(key, storageGet, decrypt, logService) {
  const fullKey = secretStorageKey(key);
  logService?.trace("[secrets] getting secret for key:", fullKey);
  const encrypted = storageGet(fullKey);
  if (!encrypted) {
    logService?.trace("[secrets] no secret found for key:", fullKey);
    return void 0;
  }
  logService?.trace("[secrets] decrypting secret for key:", fullKey);
  const result = await decrypt(encrypted);
  logService?.trace("[secrets] decrypted secret for key:", fullKey);
  return result;
}

async function writeEncryptedSecret(key, value, storageSet, encrypt, logService) {
  logService?.trace("[secrets] encrypting secret for key:", key);
  const encrypted = await encrypt(value);
  const fullKey = secretStorageKey(key);
  logService?.trace("[secrets] storing encrypted secret for key:", fullKey);
  storageSet(fullKey, encrypted);
  logService?.trace("[secrets] stored encrypted secret for key:", fullKey);
}

var CROSS_APP_SHARED_SECRET_KEYS = [
  '{"extensionId":"vscode.github-authentication","key":"github.auth"}'
];

var ISecretStorageService = createDecorator("secretStorageService");

var BaseSecretStorageService = class extends Disposable {
  constructor(_useInMemoryStorage, _storageService, _encryptionService, _logService) {
    super();
    this._useInMemoryStorage = _useInMemoryStorage;
    this._storageService = _storageService;
    this._encryptionService = _encryptionService;
    this._logService = _logService;
    this.onDidChangeSecretEmitter = this._register(new Emitter());
    this.onDidChangeSecret = this.onDidChangeSecretEmitter.event;
    this._sequencer = new SequencerByKey();
    this._type = "unknown";
    this._onDidChangeValueDisposable = this._register(new DisposableStore());
    this._lazyStorageService = new Lazy(() => this.initialize());
  }
  useSharedStorage(key) {
    return isWindows && CROSS_APP_SHARED_SECRET_KEYS.includes(key);
  }
  /**
   * @Note initialize must be called first so that this can be resolved properly
   * otherwise it will return 'unknown'.
   */
  get type() {
    return this._type;
  }
  get resolvedStorageService() {
    return this._lazyStorageService.value;
  }
  get(key) {
    return this._sequencer.queue(key, async () => {
      const storageService = await this.resolvedStorageService;
      try {
        return await readEncryptedSecret(
          key,
          (fullKey) => this.getValueFromStorage(key, fullKey, storageService),
          // If the storage service is in-memory, we don't need to decrypt
          this._type === "in-memory" ? (v) => Promise.resolve(v) : (v) => this._encryptionService.decrypt(v),
          this._logService
        );
      } catch (e) {
        this._logService.error(e);
        const fullKey = secretStorageKey(key);
        this._logService.trace("[secrets] deleting invalid secret for key:", fullKey);
        this.removeValueFromStorage(key, fullKey, storageService);
        this._logService.trace("[secrets] deleted invalid secret for key:", fullKey);
        return void 0;
      }
    });
  }
  set(key, value) {
    return this._sequencer.queue(key, async () => {
      const storageService = await this.resolvedStorageService;
      try {
        await writeEncryptedSecret(
          key,
          value,
          (fullKey, encrypted) => this.setValueInStorage(key, fullKey, encrypted, storageService),
          // If the storage service is in-memory, we don't need to encrypt
          this._type === "in-memory" ? (v) => Promise.resolve(v) : (v) => this._encryptionService.encrypt(v),
          this._logService
        );
      } catch (e) {
        this._logService.error(e);
        throw e;
      }
    });
  }
  delete(key) {
    return this._sequencer.queue(key, async () => {
      const storageService = await this.resolvedStorageService;
      const fullKey = secretStorageKey(key);
      this._logService.trace("[secrets] deleting secret for key:", fullKey);
      this.removeValueFromStorage(key, fullKey, storageService);
      this._logService.trace("[secrets] deleted secret for key:", fullKey);
    });
  }
  keys() {
    return this._sequencer.queue("__keys__", async () => {
      const storageService = await this.resolvedStorageService;
      this._logService.trace("[secrets] fetching keys of all secrets");
      const allKeys = storageService.keys(-1 /* APPLICATION */, 1 /* MACHINE */);
      this._logService.trace("[secrets] fetched keys of all secrets");
      return allKeys.filter((key) => key.startsWith(SECRET_STORAGE_PREFIX)).map((key) => key.slice(SECRET_STORAGE_PREFIX.length));
    });
  }
  getValueFromStorage(key, fullKey, storageService) {
    if (this.useSharedStorage(key)) {
      this._logService.trace(`[SecretStorageService] Fetching value for cross-app shared secret: ${fullKey}`);
      return storageService.get(fullKey, -2 /* APPLICATION_SHARED */);
    }
    return storageService.get(fullKey, -1 /* APPLICATION */);
  }
  removeValueFromStorage(key, fullKey, storageService) {
    const scope = this.useSharedStorage(key) ? -2 /* APPLICATION_SHARED */ : -1 /* APPLICATION */;
    storageService.remove(fullKey, scope);
  }
  setValueInStorage(key, fullKey, value, storageService) {
    if (this.useSharedStorage(key)) {
      this._logService.trace(`[SecretStorageService] Setting value for cross-app shared secret: ${fullKey}`);
      storageService.store(fullKey, value, -2 /* APPLICATION_SHARED */, 1 /* MACHINE */);
      return;
    }
    storageService.store(fullKey, value, -1 /* APPLICATION */, 1 /* MACHINE */);
  }
  async initialize() {
    let storageService;
    if (!this._useInMemoryStorage && await this._encryptionService.isEncryptionAvailable()) {
      this._logService.trace(`[SecretStorageService] Encryption is available, using persisted storage`);
      this._type = "persisted";
      storageService = this._storageService;
    } else {
      if (this._type === "in-memory") {
        return this._storageService;
      }
      this._logService.trace("[SecretStorageService] Encryption is not available, falling back to in-memory storage");
      this._type = "in-memory";
      storageService = this._register(new InMemoryStorageService());
    }
    this._onDidChangeValueDisposable.clear();
    this._onDidChangeValueDisposable.add(Event.any(
      storageService.onDidChangeValue(-1 /* APPLICATION */, void 0, this._onDidChangeValueDisposable),
      storageService.onDidChangeValue(-2 /* APPLICATION_SHARED */, void 0, this._onDidChangeValueDisposable)
    )((e) => {
      this.onDidChangeValue(e.key);
    }));
    return storageService;
  }
  reinitialize() {
    this._lazyStorageService = new Lazy(() => this.initialize());
  }
  onDidChangeValue(key) {
    if (!key.startsWith(SECRET_STORAGE_PREFIX)) {
      return;
    }
    const secretKey = key.slice(SECRET_STORAGE_PREFIX.length);
    this._logService.trace(`[SecretStorageService] Notifying change in value for secret: ${secretKey}`);
    this.onDidChangeSecretEmitter.fire(secretKey);
  }
};

BaseSecretStorageService = __decorateClass([
  __decorateParam(1, IStorageService),
  __decorateParam(2, IEncryptionService),
  __decorateParam(3, ILogService)
], BaseSecretStorageService);
export { secretStorageKey, readEncryptedSecret, writeEncryptedSecret, SECRET_STORAGE_PREFIX, CROSS_APP_SHARED_SECRET_KEYS, ISecretStorageService, BaseSecretStorageService };
