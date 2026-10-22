// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/browser/sshHostKeyTrustService.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { computeHostKeyStoreKey } from "./module-4054.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/platform/agentHost/browser/sshHostKeyTrustService.ts
var SSH_HOST_KEY_TRUST_STORAGE_KEY = "sshRemoteAgentHost.trustedHostKeys";

function parseTrustedHostKey(value2) {
  if (typeof value2 !== "object" || value2 === null) {
    return void 0;
  }
  const { keyType, fingerprint, addedAt, alias } = value2;
  if (typeof keyType !== "string" || !keyType || typeof fingerprint !== "string" || !fingerprint || typeof addedAt !== "number" || !Number.isFinite(addedAt)) {
    return void 0;
  }
  return {
    keyType,
    fingerprint,
    addedAt,
    ...typeof alias === "string" && alias ? { alias } : void 0
  };
}

function parseTrustedHostKeys(raw) {
  const hosts = /* @__PURE__ */ new Map();
  if (!raw) {
    return hosts;
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return hosts;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return hosts;
  }
  for (const [storeKey, value2] of Object.entries(parsed)) {
    if (!storeKey || !Array.isArray(value2)) {
      continue;
    }
    const keys = [];
    for (const entry of value2) {
      const key3 = parseTrustedHostKey(entry);
      if (key3) {
        keys.push(key3);
      }
    }
    if (keys.length) {
      hosts.set(storeKey, keys);
    }
  }
  return hosts;
}

function parseStoreKey(storeKey) {
  const separator2 = storeKey.lastIndexOf(":");
  if (separator2 <= 0) {
    return void 0;
  }
  const host = storeKey.substring(0, separator2);
  const port = Number(storeKey.substring(separator2 + 1));
  if (!host || !Number.isInteger(port) || port <= 0 || port > 65535) {
    return void 0;
  }
  return { host, port };
}

var SSHHostKeyTrustService = class extends Disposable {
  constructor(_storageService) {
    super();
    this._storageService = _storageService;
    this._onDidChangeTrustedHosts = this._register(new Emitter());
    this.onDidChangeTrustedHosts = this._onDidChangeTrustedHosts.event;
  }
  getTrustedKeys(host, port) {
    return this._read().get(computeHostKeyStoreKey(host, port)) ?? [];
  }
  trustHostKey(host, port, key3) {
    const storeKey = computeHostKeyStoreKey(host, port);
    const hosts = this._read();
    const existing = hosts.get(storeKey) ?? [];
    const keys = existing.filter((k) => k.keyType !== key3.keyType);
    keys.push(key3);
    hosts.set(storeKey, keys);
    this._write(hosts);
    this._onDidChangeTrustedHosts.fire(storeKey);
  }
  forgetHost(host, port) {
    const storeKey = computeHostKeyStoreKey(host, port);
    const hosts = this._read();
    if (!hosts.delete(storeKey)) {
      return;
    }
    this._write(hosts);
    this._onDidChangeTrustedHosts.fire(storeKey);
  }
  listTrustedHosts() {
    const result = [];
    for (const [storeKey, keys] of this._read()) {
      const parsed = parseStoreKey(storeKey);
      if (parsed) {
        result.push({ host: parsed.host, port: parsed.port, keys });
      }
    }
    return result;
  }
  _read() {
    return parseTrustedHostKeys(this._storageService.get(SSH_HOST_KEY_TRUST_STORAGE_KEY, -1 /* APPLICATION */));
  }
  _write(hosts) {
    if (hosts.size === 0) {
      this._storageService.remove(SSH_HOST_KEY_TRUST_STORAGE_KEY, -1 /* APPLICATION */);
      return;
    }
    this._storageService.store(
      SSH_HOST_KEY_TRUST_STORAGE_KEY,
      JSON.stringify(Object.fromEntries(hosts)),
      -1 /* APPLICATION */,
      1 /* MACHINE */
    );
  }
};

SSHHostKeyTrustService = __decorateClass([
  __decorateParam(0, IStorageService)
], SSHHostKeyTrustService);
export { parseTrustedHostKey, parseTrustedHostKeys, parseStoreKey, SSH_HOST_KEY_TRUST_STORAGE_KEY, SSHHostKeyTrustService };
