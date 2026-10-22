// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mcp/common/mcpRegistryInputStorage.ts
import { Disposable } from "./module-0012.mjs";
import { Sequencer } from "./module-0036.mjs";
import { Lazy } from "./module-0028.mjs";
import { isEmptyObject } from "./module-0010.mjs";
import { VSBuffer, decodeBase64, encodeBase64 } from "./module-0038.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ISecretStorageService } from "./module-0948.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/mcp/common/mcpRegistryInputStorage.ts
var MCP_ENCRYPTION_KEY_NAME = "mcpEncryptionKey";

var MCP_ENCRYPTION_KEY_ALGORITHM = "AES-GCM";

var MCP_ENCRYPTION_KEY_LEN = 256;

var MCP_ENCRYPTION_IV_LENGTH = 12;

var MCP_DATA_STORED_VERSION = 1;

var MCP_DATA_STORED_KEY = "mcpInputs";

var McpRegistryInputStorage = class extends Disposable {
  constructor(_scope, _target, _storageService, _secretStorageService, _logService) {
    super();
    this._scope = _scope;
    this._storageService = _storageService;
    this._secretStorageService = _secretStorageService;
    this._logService = _logService;
    this._secretsSealerSequencer = new Sequencer();
    this._getEncryptionKey = new Lazy(() => {
      return McpRegistryInputStorage.secretSequencer.queue(async () => {
        const existing = await this._secretStorageService.get(MCP_ENCRYPTION_KEY_NAME);
        if (existing) {
          try {
            const parsed = JSON.parse(existing);
            return await crypto.subtle.importKey("jwk", parsed, MCP_ENCRYPTION_KEY_ALGORITHM, false, ["encrypt", "decrypt"]);
          } catch {
          }
        }
        const key3 = await crypto.subtle.generateKey(
          { name: MCP_ENCRYPTION_KEY_ALGORITHM, length: MCP_ENCRYPTION_KEY_LEN },
          true,
          ["encrypt", "decrypt"]
        );
        const exported = await crypto.subtle.exportKey("jwk", key3);
        await this._secretStorageService.set(MCP_ENCRYPTION_KEY_NAME, JSON.stringify(exported));
        return key3;
      });
    });
    this._didChange = false;
    this._record = new Lazy(() => {
      const stored = this._storageService.getObject(MCP_DATA_STORED_KEY, this._scope);
      return stored?.version === MCP_DATA_STORED_VERSION ? { ...stored } : { version: MCP_DATA_STORED_VERSION, values: {} };
    });
    this._register(_storageService.onWillSaveState(() => {
      if (this._didChange) {
        this._storageService.store(MCP_DATA_STORED_KEY, {
          version: MCP_DATA_STORED_VERSION,
          values: this._record.value.values,
          secrets: this._record.value.secrets
        }, this._scope, _target);
        this._didChange = false;
      }
    }));
  }
  static {
    this.secretSequencer = new Sequencer();
  }
  /** Deletes all collection data from storage. */
  clearAll() {
    this._record.value.values = {};
    this._record.value.secrets = void 0;
    this._record.value.unsealedSecrets = void 0;
    this._didChange = true;
  }
  /** Delete a single collection data from the storage. */
  async clear(inputKey) {
    const secrets = await this._unsealSecrets();
    delete this._record.value.values[inputKey];
    this._didChange = true;
    if (secrets.hasOwnProperty(inputKey)) {
      delete secrets[inputKey];
      await this._sealSecrets();
    }
  }
  /** Gets a mapping of saved input data. */
  async getMap() {
    const secrets = await this._unsealSecrets();
    return { ...this._record.value.values, ...secrets };
  }
  /** Updates the input data mapping. */
  async setPlainText(values) {
    Object.assign(this._record.value.values, values);
    this._didChange = true;
  }
  /** Updates the input secrets mapping. */
  async setSecrets(values) {
    const unsealed = await this._unsealSecrets();
    Object.assign(unsealed, values);
    await this._sealSecrets();
  }
  async _sealSecrets() {
    const key3 = await this._getEncryptionKey.value;
    return this._secretsSealerSequencer.queue(async () => {
      if (!this._record.value.unsealedSecrets || isEmptyObject(this._record.value.unsealedSecrets)) {
        this._record.value.secrets = void 0;
        return;
      }
      const toSeal = JSON.stringify(this._record.value.unsealedSecrets);
      const iv = crypto.getRandomValues(new Uint8Array(MCP_ENCRYPTION_IV_LENGTH));
      const encrypted = await crypto.subtle.encrypt(
        { name: MCP_ENCRYPTION_KEY_ALGORITHM, iv: iv.buffer },
        key3,
        new TextEncoder().encode(toSeal).buffer
      );
      const enc = encodeBase64(VSBuffer.wrap(new Uint8Array(encrypted)));
      this._record.value.secrets = { iv: encodeBase64(VSBuffer.wrap(iv)), value: enc };
      this._didChange = true;
    });
  }
  async _unsealSecrets() {
    if (!this._record.value.secrets) {
      return this._record.value.unsealedSecrets ??= {};
    }
    if (this._record.value.unsealedSecrets) {
      return this._record.value.unsealedSecrets;
    }
    try {
      const key3 = await this._getEncryptionKey.value;
      const iv = decodeBase64(this._record.value.secrets.iv);
      const encrypted = decodeBase64(this._record.value.secrets.value);
      const decrypted = await crypto.subtle.decrypt(
        { name: MCP_ENCRYPTION_KEY_ALGORITHM, iv: iv.buffer },
        key3,
        encrypted.buffer
      );
      const unsealedSecrets = JSON.parse(new TextDecoder().decode(decrypted));
      this._record.value.unsealedSecrets = unsealedSecrets;
      return unsealedSecrets;
    } catch (e) {
      this._logService.warn("Error unsealing MCP secrets", e);
      this._record.value.secrets = void 0;
    }
    return {};
  }
};

McpRegistryInputStorage = __decorateClass([
  __decorateParam(2, IStorageService),
  __decorateParam(3, ISecretStorageService),
  __decorateParam(4, ILogService)
], McpRegistryInputStorage);
export { MCP_ENCRYPTION_KEY_NAME, MCP_ENCRYPTION_KEY_ALGORITHM, MCP_ENCRYPTION_KEY_LEN, MCP_ENCRYPTION_IV_LENGTH, MCP_DATA_STORED_VERSION, MCP_DATA_STORED_KEY, McpRegistryInputStorage };
