// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/agentHost/common/agentHostResourceService.ts
import { AgentHostLocalFilePermissionsSettingId, AgentHostResourcePermissionError, IAgentHostResourceService, LOCAL_AGENT_HOST_RESOURCE_IDENTITY } from "./module-1729.mjs";
import { normalizeRemoteAgentHostAddress } from "./module-1001.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { extUri } from "./module-0034.mjs";
import { ROOT_STATE_URI } from "./module-1008.mjs";
import { URI } from "./module-0032.mjs";
import { VSBuffer, decodeBase64 } from "./module-0038.mjs";
import { derived } from "./module-0054.mjs";
import { generateUuid } from "./module-0190.mjs";
import { CancellationError } from "./module-0004.mjs";
import { ResourceSet } from "./module-0008.mjs";
import { DeferredPromise } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IFileService } from "./module-0269.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/agentHost/common/agentHostResourceService.ts
function getGrantMode(grant) {
  if (grant === "r" /* Read */ || grant === "rw" /* ReadWrite */) {
    return grant;
  }
  if (typeof grant === "object" && grant !== null && (grant.mode === "r" /* Read */ || grant.mode === "rw" /* ReadWrite */)) {
    return grant.mode;
  }
  return void 0;
}

function normalizeResourceIdentity(identity2) {
  return identity2 === LOCAL_AGENT_HOST_RESOURCE_IDENTITY ? identity2 : normalizeRemoteAgentHostAddress(identity2);
}

var AgentHostResourceService = class extends Disposable {
  constructor(_configurationService, _fileService, _textModelService, _logService) {
    super();
    this._configurationService = _configurationService;
    this._fileService = _fileService;
    this._textModelService = _textModelService;
    this._logService = _logService;
    this._inMemoryGrants = /* @__PURE__ */ new Map();
    this._pending = observableValue("agentHostResources.pending", []);
    this.allPending = this._pending;
  }
  // ---- Gated FS operations ------------------------------------------------
  async list(identity2, uri4) {
    const normalized = normalizeResourceIdentity(identity2);
    const canonical = await this._canonicalize(uri4);
    if (!await this._isCovered(normalized, canonical, "read" /* Read */)) {
      const entries2 = await this._getGrantedChildren(normalized, extUri.normalizePath(uri4));
      if (entries2) {
        return { entries: entries2 };
      }
      throw new AgentHostResourcePermissionError({ channel: ROOT_STATE_URI, uri: uri4.toString(), read: true });
    }
    const stat = await this._fileService.resolve(uri4);
    if (!stat.isDirectory) {
      throw new Error(`Resource is not a directory: ${uri4.toString()}`);
    }
    return {
      entries: (stat.children ?? []).map((c) => ({
        name: c.name,
        type: c.isDirectory ? "directory" : "file"
      }))
    };
  }
  async read(identity2, uri4) {
    await this._gate(identity2, uri4, "read" /* Read */, { channel: ROOT_STATE_URI, uri: uri4.toString(), read: true });
    try {
      const content = await this._fileService.readFile(uri4);
      return { bytes: content.value };
    } catch (err) {
      const virtual = await this._readVirtual(uri4);
      if (virtual) {
        return { bytes: virtual };
      }
      throw err;
    }
  }
  async write(identity2, params) {
    const uri4 = URI.parse(params.uri);
    await this._gate(identity2, uri4, "write" /* Write */, { channel: ROOT_STATE_URI, uri: uri4.toString(), write: true });
    const buf = params.encoding === "base64" /* Base64 */ ? decodeBase64(params.data) : VSBuffer.fromString(params.data);
    try {
      if (params.createOnly) {
        await this._fileService.createFile(uri4, buf, { overwrite: false });
      } else {
        await this._fileService.writeFile(uri4, buf);
      }
    } catch (err) {
      if (await this._writeVirtual(uri4, buf)) {
        return;
      }
      throw err;
    }
  }
  async del(identity2, params) {
    const uri4 = URI.parse(params.uri);
    await this._gate(identity2, uri4, "write" /* Write */, { channel: ROOT_STATE_URI, uri: uri4.toString(), write: true });
    await this._fileService.del(uri4, { recursive: !!params.recursive });
  }
  async move(identity2, params) {
    const source = URI.parse(params.source);
    const destination = URI.parse(params.destination);
    await this._gate(identity2, source, "write" /* Write */, { channel: ROOT_STATE_URI, uri: source.toString(), write: true });
    await this._gate(identity2, destination, "write" /* Write */, { channel: ROOT_STATE_URI, uri: destination.toString(), write: true });
    await this._fileService.move(source, destination, !params.failIfExists);
  }
  async copy(identity2, params) {
    const source = URI.parse(params.source);
    const destination = URI.parse(params.destination);
    await this._gate(identity2, source, "read" /* Read */, { channel: ROOT_STATE_URI, uri: source.toString(), read: true });
    await this._gate(identity2, destination, "write" /* Write */, { channel: ROOT_STATE_URI, uri: destination.toString(), write: true });
    await this._fileService.copy(source, destination, !params.failIfExists);
  }
  async resolve(identity2, params) {
    const uri4 = URI.parse(params.uri);
    await this._gate(identity2, uri4, "read" /* Read */, { channel: ROOT_STATE_URI, uri: uri4.toString(), read: true });
    let stat;
    try {
      stat = await this._fileService.stat(uri4);
    } catch (err) {
      const virtual = await this._statVirtual(uri4);
      if (virtual) {
        return virtual;
      }
      throw err;
    }
    let type;
    if (stat.isSymbolicLink && params.followSymlinks === false) {
      type = "symlink" /* Symlink */;
    } else if (stat.isDirectory) {
      type = "directory" /* Directory */;
    } else {
      type = "file" /* File */;
    }
    return {
      uri: uri4.toString(),
      type,
      ...stat.size !== void 0 ? { size: stat.size } : {},
      ...stat.mtime !== void 0 ? { mtime: new Date(stat.mtime).toISOString() } : {},
      ...stat.ctime !== void 0 ? { ctime: new Date(stat.ctime).toISOString() } : {},
      ...stat.etag ? { etag: stat.etag } : {}
    };
  }
  async mkdir(identity2, params) {
    const uri4 = URI.parse(params.uri);
    await this._gate(identity2, uri4, "write" /* Write */, { channel: ROOT_STATE_URI, uri: uri4.toString(), write: true });
    const existing = await this._fileService.stat(uri4).catch(() => void 0);
    if (existing && !existing.isDirectory) {
      throw new Error(`Path exists and is not a directory: ${uri4.toString()}`);
    }
    await this._fileService.createFolder(uri4);
  }
  // ---- Permission requests / observables ---------------------------------
  async check(identity2, uri4, mode) {
    const normalized = normalizeResourceIdentity(identity2);
    const canonical = await this._canonicalize(uri4);
    return this._isCovered(normalized, canonical, mode);
  }
  async request(identity2, params) {
    const normalized = normalizeResourceIdentity(identity2);
    const lexical = extUri.normalizePath(URI.parse(params.uri));
    const canonical = await this._canonicalize(lexical);
    if (normalized === LOCAL_AGENT_HOST_RESOURCE_IDENTITY) {
      return;
    }
    const wantsWrite = params.write === true;
    const wantsRead = params.read === true || !wantsWrite;
    if (wantsRead && !await this._isCovered(normalized, canonical, "read" /* Read */)) {
      await this._enqueue(normalized, canonical, lexical, "read" /* Read */);
    }
    if (wantsWrite && !await this._isCovered(normalized, canonical, "write" /* Write */)) {
      await this._enqueue(normalized, canonical, lexical, "write" /* Write */);
    }
  }
  pendingFor(address) {
    const normalized = normalizeRemoteAgentHostAddress(address);
    return derived((reader) => this._pending.read(reader).filter((r2) => r2.address === normalized));
  }
  findPending(id2) {
    return this._pending.get().find((r2) => r2.id === id2);
  }
  grantImplicitRead(identity2, uri4) {
    const handle2 = generateUuid();
    const lexical = extUri.normalizePath(uri4);
    const realpath = this._fileService.realpath(lexical).then(
      (real) => real ?? lexical,
      () => lexical
    );
    this._inMemoryGrants.set(handle2, {
      identity: normalizeResourceIdentity(identity2),
      uri: lexical,
      realpath,
      mode: "r" /* Read */
    });
    return toDisposable(() => this._inMemoryGrants.delete(handle2));
  }
  connectionClosed(identity2) {
    const normalized = normalizeResourceIdentity(identity2);
    for (const [handle2, grant] of this._inMemoryGrants) {
      if (grant.identity === normalized) {
        this._inMemoryGrants.delete(handle2);
      }
    }
    if (normalized === LOCAL_AGENT_HOST_RESOURCE_IDENTITY) {
      return;
    }
    const cancel = new CancellationError();
    const remaining = [];
    for (const request2 of this._pending.get()) {
      if (request2.address === normalized) {
        request2.deferred.error(cancel);
      } else {
        remaining.push(request2);
      }
    }
    if (remaining.length !== this._pending.get().length) {
      this._pending.set(remaining, void 0);
    }
  }
  // ---- internals ---------------------------------------------------------
  async _gate(identity2, uri4, mode, deniedRequest) {
    if (!await this.check(identity2, uri4, mode)) {
      throw new AgentHostResourcePermissionError(deniedRequest);
    }
  }
  async _readVirtual(uri4) {
    try {
      const ref = await this._textModelService.createModelReference(uri4);
      try {
        return VSBuffer.fromString(ref.object.textEditorModel.getValue());
      } finally {
        ref.dispose();
      }
    } catch {
      return void 0;
    }
  }
  /**
   * Write {@link bytes} as text into the resolved text model for {@link uri},
   * if one can be resolved and is writable. Returns `true` when the model was
   * updated, `false` otherwise (no provider, readonly, decode failure).
   */
  async _writeVirtual(uri4, bytes) {
    try {
      const ref = await this._textModelService.createModelReference(uri4);
      try {
        if (ref.object.isReadonly()) {
          return false;
        }
        ref.object.textEditorModel.setValue(bytes.toString());
        return true;
      } finally {
        ref.dispose();
      }
    } catch {
      return false;
    }
  }
  /**
   * Resolve {@link uri} via {@link ITextModelService} and synthesize a
   * {@link ResourceResolveResult} so virtual resources stat as `File` with
   * a size matching their text content. Returns `undefined` if no model
   * can be resolved.
   */
  async _statVirtual(uri4) {
    try {
      const ref = await this._textModelService.createModelReference(uri4);
      try {
        const size3 = VSBuffer.fromString(ref.object.textEditorModel.getValue()).byteLength;
        return {
          uri: uri4.toString(),
          type: "file" /* File */,
          size: size3
        };
      } finally {
        ref.dispose();
      }
    } catch {
      return void 0;
    }
  }
  /**
   * Resolve {@link uri} against the local filesystem, collapsing `..`
   * segments and following symlinks so the policy check sees the same
   * path the OS will actually open. For URIs that don't exist (e.g. a
   * `resourceWrite` for a new file), realpath the deepest existing
   * ancestor and re-append the missing suffix.
   */
  async _canonicalize(uri4) {
    const normalized = extUri.normalizePath(uri4);
    const suffix = [];
    let current = normalized;
    while (true) {
      const real = await this._fileService.realpath(current).catch(() => void 0);
      if (real) {
        return suffix.length ? extUri.joinPath(real, ...suffix) : real;
      }
      const parent = extUri.dirname(current);
      if (extUri.isEqual(parent, current)) {
        return normalized;
      }
      suffix.unshift(extUri.basename(current));
      current = parent;
    }
  }
  async _isCovered(identity2, canonicalUri, mode) {
    if (identity2 === LOCAL_AGENT_HOST_RESOURCE_IDENTITY) {
      return true;
    }
    const requireWrite = mode === "write" /* Write */;
    for (const grant of this._readPersistedGrants(identity2)) {
      if (requireWrite && grant.mode !== "rw" /* ReadWrite */) {
        continue;
      }
      if (extUri.isEqualOrParent(canonicalUri, grant.uri)) {
        return true;
      }
    }
    const candidates = [];
    for (const grant of this._inMemoryGrants.values()) {
      if (grant.identity !== identity2) {
        continue;
      }
      if (requireWrite && grant.mode !== "rw" /* ReadWrite */) {
        continue;
      }
      candidates.push(grant.realpath);
    }
    const realpaths = await Promise.all(candidates);
    return realpaths.some((uri4) => extUri.isEqualOrParent(canonicalUri, uri4));
  }
  async _getGrantedChildren(identity2, directory) {
    if (identity2 === LOCAL_AGENT_HOST_RESOURCE_IDENTITY) {
      return void 0;
    }
    const grantUris = [...this._readPersistedGrants(identity2)].filter((grant) => grant.mode === "r" /* Read */ || grant.mode === "rw" /* ReadWrite */).map((grant) => grant.lexicalUri);
    for (const grant of this._inMemoryGrants.values()) {
      if (grant.identity === identity2) {
        grantUris.push(grant.uri);
      }
    }
    const grantedChildren = new ResourceSet((uri4) => extUri.getComparisonKey(uri4));
    for (const grantUri of grantUris) {
      if (extUri.isEqual(directory, grantUri) || !extUri.isEqualOrParent(grantUri, directory)) {
        continue;
      }
      const relativePath2 = extUri.relativePath(directory, grantUri);
      const segments = relativePath2?.split("/").filter(Boolean);
      if (!segments?.length) {
        continue;
      }
      const name = segments[0];
      const childUri = extUri.joinPath(directory, name);
      grantedChildren.add(childUri);
    }
    if (grantedChildren.size === 0) {
      return void 0;
    }
    const stat = await this._fileService.resolve(directory);
    if (!stat.isDirectory) {
      throw new Error(`Resource is not a directory: ${directory.toString()}`);
    }
    return (stat.children ?? []).filter((child) => grantedChildren.has(extUri.joinPath(directory, child.name))).map((child) => ({
      name: child.name,
      type: child.isDirectory ? "directory" : "file"
    }));
  }
  _enqueue(address, canonicalUri, lexicalUri, mode) {
    const existing = this._pending.get().find((r2) => r2.address === address && r2.mode === mode && extUri.isEqual(r2.uri, canonicalUri));
    if (existing) {
      return existing.deferred.p;
    }
    const deferred = new DeferredPromise();
    const request2 = {
      id: generateUuid(),
      address,
      uri: canonicalUri,
      lexicalUri,
      mode,
      deferred,
      allow: () => this._resolve(request2, "memory"),
      allowAlways: () => this._resolve(request2, "persist"),
      deny: () => {
        this._dropPending(request2);
        deferred.error(new CancellationError());
      }
    };
    this._pending.set([...this._pending.get(), request2], void 0);
    return deferred.p;
  }
  _resolve(request2, scope) {
    const accessMode = request2.mode === "write" /* Write */ ? "rw" /* ReadWrite */ : "r" /* Read */;
    this._inMemoryGrants.set(generateUuid(), {
      identity: request2.address,
      uri: request2.lexicalUri,
      realpath: Promise.resolve(request2.uri),
      mode: accessMode
    });
    if (scope === "persist") {
      void this._persistGrant(request2.address, request2.uri, request2.lexicalUri, request2.mode).catch((err) => {
        this._logService.warn("[AgentHostResourceService] Failed to persist grant", err);
      });
    }
    this._dropPending(request2);
    request2.deferred.complete();
  }
  _dropPending(request2) {
    const next = this._pending.get().filter((r2) => r2 !== request2);
    if (next.length !== this._pending.get().length) {
      this._pending.set(next, void 0);
    }
  }
  *_readPersistedGrants(address) {
    const forAddress = this._configurationService.getValue(AgentHostLocalFilePermissionsSettingId)?.[address];
    if (!forAddress) {
      return;
    }
    for (const [uriStr, grant] of Object.entries(forAddress)) {
      const mode = getGrantMode(grant);
      if (!mode) {
        continue;
      }
      try {
        const uri4 = URI.parse(uriStr);
        let lexicalUri = uri4;
        if (typeof grant === "object" && typeof grant.lexicalUri === "string") {
          try {
            lexicalUri = URI.parse(grant.lexicalUri);
          } catch {
          }
        }
        yield { uri: uri4, lexicalUri, mode };
      } catch {
      }
    }
  }
  async _persistGrant(address, uri4, lexicalUri, mode) {
    const requested = mode === "write" /* Write */ ? "rw" /* ReadWrite */ : "r" /* Read */;
    for (const grant of this._readPersistedGrants(address)) {
      const covers = grant.mode === "rw" /* ReadWrite */ || requested === "r" /* Read */;
      if (covers && extUri.isEqualOrParent(uri4, grant.uri)) {
        return;
      }
    }
    const { target, value: value2 } = this._inspectScopedSetting();
    const forAddress = { ...value2[address] ?? {} };
    const uriKey = uri4.toString();
    const existing = forAddress[uriKey];
    if (getGrantMode(existing) === "rw" /* ReadWrite */) {
      return;
    }
    if (typeof existing === "object") {
      forAddress[uriKey] = { mode: requested, lexicalUri: existing.lexicalUri };
    } else if (!extUri.isEqual(uri4, lexicalUri)) {
      forAddress[uriKey] = { mode: requested, lexicalUri: lexicalUri.toString() };
    } else {
      forAddress[uriKey] = requested;
    }
    await this._configurationService.updateValue(
      AgentHostLocalFilePermissionsSettingId,
      { ...value2, [address]: forAddress },
      target
    );
  }
  _inspectScopedSetting() {
    const inspected = this._configurationService.inspect(AgentHostLocalFilePermissionsSettingId);
    if (inspected.applicationValue !== void 0) {
      return { target: 1 /* APPLICATION */, value: inspected.applicationValue };
    }
    if (inspected.userLocalValue !== void 0) {
      return { target: 3 /* USER_LOCAL */, value: inspected.userLocalValue };
    }
    if (inspected.userRemoteValue !== void 0) {
      return { target: 4 /* USER_REMOTE */, value: inspected.userRemoteValue };
    }
    if (inspected.userValue !== void 0) {
      return { target: 2 /* USER */, value: inspected.userValue };
    }
    return { target: 1 /* APPLICATION */, value: {} };
  }
};

AgentHostResourceService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IFileService),
  __decorateParam(2, ITextModelService),
  __decorateParam(3, ILogService)
], AgentHostResourceService);

registerSingleton(IAgentHostResourceService, AgentHostResourceService, 1 /* Delayed */);
export { getGrantMode, normalizeResourceIdentity, AgentHostResourceService };
