// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/agentHost/common/agentHostFileSystemProvider.ts
import { URI } from "./module-0032.mjs";
import { Emitter } from "./module-0017.mjs";
import { fromAgentHostUri, isAgentHostContentRefUri, toAgentHostUri } from "./module-1001.mjs";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { ROOT_STATE_URI } from "./module-1008.mjs";
import { VSBuffer, decodeBase64 } from "./module-0038.mjs";
import { createFileSystemProviderError } from "./module-0269.mjs";
import { ProtocolError } from "./module-1732.mjs";
import { AhpErrorCodes } from "./module-1731.mjs";


// src/vs/platform/agentHost/common/agentHostFileSystemProvider.ts
async function createRemoteWatchHandle(primitives, params) {
  const { channel } = await primitives.createResourceWatch(params);
  const channelUri = URI.parse(channel);
  await primitives.subscribe(channelUri);
  const onDidChangeEmitter = new Emitter();
  const listener = primitives.onDidAction((envelope) => {
    if (envelope.channel !== channel || envelope.action.type !== "resourceWatch/changed" /* ResourceWatchChanged */) {
      return;
    }
    const items = envelope.action.changes?.items ?? [];
    if (items.length === 0) {
      return;
    }
    onDidChangeEmitter.fire(items.map((item) => ({
      resource: URI.parse(item.uri),
      type: item.type === "added" ? 1 /* ADDED */ : item.type === "deleted" ? 2 /* DELETED */ : 0 /* UPDATED */
    })));
  });
  let disposed = false;
  return {
    onDidChange: onDidChangeEmitter.event,
    dispose: () => {
      if (disposed) {
        return;
      }
      disposed = true;
      listener.dispose();
      onDidChangeEmitter.dispose();
      try {
        primitives.unsubscribe(channelUri);
      } catch {
      }
    }
  };
}

function agentHostUri(authority, path) {
  return toAgentHostUri(URI.file(path), authority);
}

var AHPFileSystemProvider = class _AHPFileSystemProvider extends Disposable {
  constructor(_connectionGraceMs = _AHPFileSystemProvider._DEFAULT_CONNECTION_GRACE_MS) {
    super();
    this._connectionGraceMs = _connectionGraceMs;
    this.capabilities = 1024 /* PathCaseSensitive */ | 2 /* FileReadWrite */ | 8 /* FileFolderCopy */ | 262144 /* FileRealpath */;
    this._onDidChangeCapabilities = this._register(new Emitter());
    this.onDidChangeCapabilities = this._onDidChangeCapabilities.event;
    this._onDidChangeFile = this._register(new Emitter());
    this.onDidChangeFile = this._onDidChangeFile.event;
    this._onDidWatchError = this._register(new Emitter());
    this.onDidWatchError = this._onDidWatchError.event;
    /**
     * Per-authority registration slot. We keep the slot alive for a brief
     * grace period after the last registration is disposed, so an
     * operation issued during a reconnection window can wait for the
     * replacement registration instead of failing immediately.
     */
    this._authorities = /* @__PURE__ */ new Map();
    /**
     * Fires the authority whose active connection has changed: added,
     * replaced, fallen back to an older registration, entered the grace
     * window (no active connection), or evicted. Long-lived consumers
     * (e.g. {@link watch}) subscribe here so they continue to receive
     * notifications across full entry eviction + later re-creation —
     * something a per-entry emitter cannot offer.
     */
    this._onDidChangeConnection = this._register(new Emitter());
  }
  static {
    /**
     * Grace period during which {@link _getConnection} will await a new
     * registration after the previous one is disposed. Covers the window
     * where a transport is briefly torn down and re-registered (e.g. an
     * agent-host client reconnect that races a plugin sync). 5s matches
     * the typical reconnect timeout. Consumers should still implement
     * logical retries for longer reconnection latencies, but this is a
     * low level, best-effort mechanism.
     *
     * Tests can override this via the constructor parameter.
     */
    this._DEFAULT_CONNECTION_GRACE_MS = 5e3;
  }
  /**
   * Register a mapping from a URI authority to a connection.
   * Returns a disposable that unregisters the mapping. Multiple
   * concurrent registrations for the same authority are supported;
   * the most recent registration wins, and disposing it falls back to
   * the previous one (if any). After the *last* registration is
   * disposed the entry is held open for {@link _connectionGraceMs} so
   * that a reconnect can replace it without orphaning in-flight
   * operations.
   */
  registerAuthority(authority, connection) {
    let entry = this._authorities.get(authority);
    if (!entry) {
      entry = {
        connections: [connection],
        expiry: new MutableDisposable()
      };
      this._authorities.set(authority, entry);
    } else {
      entry.expiry.clear();
      entry.connections.push(connection);
    }
    const adopted = entry;
    this._onDidChangeConnection.fire(authority);
    return toDisposable(() => {
      const idx = adopted.connections.indexOf(connection);
      if (idx === -1) {
        return;
      }
      const wasActive = idx === adopted.connections.length - 1;
      adopted.connections.splice(idx, 1);
      if (adopted.connections.length === 0) {
        adopted.expiry.value = disposableTimeout(
          () => this._expireAuthority(authority, adopted),
          this._connectionGraceMs,
          this._store
        );
      }
      if (wasActive) {
        this._onDidChangeConnection.fire(authority);
      }
    });
  }
  _expireAuthority(authority, entry) {
    if (this._authorities.get(authority) !== entry || entry.connections.length > 0) {
      return;
    }
    this._authorities.delete(authority);
    entry.expiry.dispose();
    this._onDidChangeConnection.fire(authority);
  }
  dispose() {
    for (const entry of this._authorities.values()) {
      entry.expiry.dispose();
      entry.connections.length = 0;
    }
    this._authorities.clear();
    super.dispose();
  }
  watch(resource, opts) {
    const store = new DisposableStore();
    const handleHolder = store.add(new MutableDisposable());
    const authority = resource.authority;
    const params = {
      channel: ROOT_STATE_URI,
      uri: this._decodeUri(resource).toString(),
      recursive: opts.recursive,
      ...opts.excludes.length > 0 ? { excludes: { items: [...opts.excludes] } } : {},
      ...opts.includes && opts.includes.length > 0 ? { includes: { items: opts.includes.map((p) => typeof p === "string" ? p : p.pattern) } } : {}
    };
    let attached;
    let attaching = false;
    let pendingReattach = false;
    const reattach = async () => {
      if (store.isDisposed) {
        return;
      }
      if (attaching) {
        pendingReattach = true;
        return;
      }
      const entry = this._authorities.get(authority);
      const next = entry?.connections.at(-1);
      if (next === attached) {
        return;
      }
      handleHolder.clear();
      attached = void 0;
      const watchResource = next?.watchResource;
      if (!next || !watchResource) {
        return;
      }
      attaching = true;
      const target = next;
      try {
        const handle2 = await watchResource.call(target, params);
        if (store.isDisposed) {
          handle2.dispose();
          return;
        }
        const current = this._authorities.get(authority);
        if (!current || current.connections.at(-1) !== target) {
          handle2.dispose();
          return;
        }
        const sub = handle2.onDidChange((changes) => this._onDidChangeFile.fire(changes.map((c) => ({
          resource: this._encodeUri(c.resource, resource.authority),
          type: c.type
        }))));
        handleHolder.value = toDisposable(() => {
          sub.dispose();
          handle2.dispose();
        });
        attached = target;
      } catch (err) {
        this._onDidWatchError.fire(err instanceof Error ? err.message : String(err));
      } finally {
        attaching = false;
        if (pendingReattach) {
          pendingReattach = false;
          void reattach();
        }
      }
    };
    store.add(this._onDidChangeConnection.event((a) => {
      if (a === authority) {
        void reattach();
      }
    }));
    void reattach();
    return store;
  }
  /**
   * Whether `resource` addresses a protocol `ContentRef` rather than an entry
   * in the host's filesystem. See {@link toAgentHostContentUri}.
   *
   * The scheme check covers content refs minted before the marker existed,
   * such as ones persisted in restored editor state. It can go once those
   * have aged out — and the marker itself can go if `resourceResolve` grows
   * a way for a host to report a resource as readable but not resolvable.
   */
  _isContentRef(resource, decoded) {
    return isAgentHostContentRefUri(resource) || decoded.scheme === "session-db" || decoded.scheme === "git-blob";
  }
  async stat(resource) {
    const path = resource.path;
    const decoded = this._decodeUri(resource);
    if (this._isContentRef(resource, decoded)) {
      return { type: 1 /* File */, mtime: 0, ctime: 0, size: 0, permissions: 1 /* Readonly */ };
    }
    if (path === "/" || path === "") {
      return { type: 2 /* Directory */, mtime: 0, ctime: 0, size: 0, permissions: 1 /* Readonly */ };
    }
    if (decoded.path === "/" || decoded.path === "") {
      return { type: 2 /* Directory */, mtime: 0, ctime: 0, size: 0, permissions: 1 /* Readonly */ };
    }
    const connection = await this._getConnection(resource.authority);
    try {
      const resolved = await this._resolve(connection, decoded);
      return {
        type: resolved.type === "directory" ? 2 /* Directory */ : resolved.type === "symlink" ? 64 /* SymbolicLink */ : 1 /* File */,
        mtime: resolved.mtime ? Date.parse(resolved.mtime) : 0,
        ctime: resolved.ctime ? Date.parse(resolved.ctime) : 0,
        size: resolved.size ?? 0
      };
    } catch (err) {
      throw this._mapError(err, "EntryNotFound" /* FileNotFound */);
    }
  }
  async realpath(resource) {
    const path = resource.path;
    if (path === "/" || path === "") {
      return path;
    }
    const decoded = this._decodeUri(resource);
    if (this._isContentRef(resource, decoded) || decoded.path === "/" || decoded.path === "") {
      return path;
    }
    const connection = await this._getConnection(resource.authority);
    try {
      const resolved = await this._resolve(connection, decoded);
      return this._encodeUri(URI.parse(resolved.uri), resource.authority).path;
    } catch (err) {
      throw this._mapError(err, "EntryNotFound" /* FileNotFound */);
    }
  }
  async readdir(resource) {
    const entries2 = await this._listDirectory(resource.authority, resource);
    return entries2.map((e4) => [e4.name, e4.type === "directory" ? 2 /* Directory */ : 1 /* File */]);
  }
  async readFile(resource) {
    const connection = await this._getConnection(resource.authority);
    try {
      const originalUri = this._decodeUri(resource);
      const result = await connection.resourceRead(originalUri, "base64" /* Base64 */);
      if (result.encoding === "base64" /* Base64 */) {
        return decodeBase64(result.data).buffer;
      }
      return VSBuffer.fromString(result.data).buffer;
    } catch (err) {
      throw this._mapError(err, "EntryNotFound" /* FileNotFound */);
    }
  }
  async writeFile(resource, content, _opts) {
    const connection = await this._getConnection(resource.authority);
    try {
      const originalUri = this._decodeUri(resource);
      await connection.resourceWrite({
        channel: ROOT_STATE_URI,
        uri: originalUri.toString(),
        data: VSBuffer.wrap(content).toString(),
        encoding: "utf-8" /* Utf8 */
      });
    } catch (err) {
      throw this._mapError(err, "NoPermissions" /* NoPermissions */);
    }
  }
  async mkdir(resource) {
    const connection = await this._getConnection(resource.authority);
    try {
      const originalUri = this._decodeUri(resource);
      await connection.resourceMkdir({ channel: ROOT_STATE_URI, uri: originalUri.toString() });
    } catch (err) {
      throw this._mapError(err, "NoPermissions" /* NoPermissions */);
    }
  }
  async delete(resource, opts) {
    const connection = await this._getConnection(resource.authority);
    try {
      const originalUri = this._decodeUri(resource);
      await connection.resourceDelete({ channel: ROOT_STATE_URI, uri: originalUri.toString(), recursive: opts.recursive });
    } catch (err) {
      throw this._mapError(err, "NoPermissions" /* NoPermissions */);
    }
  }
  async rename(from, to, opts) {
    const connection = await this._getConnection(from.authority);
    try {
      const originalFrom = this._decodeUri(from);
      const originalTo = this._decodeUri(to);
      await connection.resourceMove({ channel: ROOT_STATE_URI, source: originalFrom.toString(), destination: originalTo.toString(), failIfExists: !opts.overwrite });
    } catch (err) {
      throw this._mapError(err, "NoPermissions" /* NoPermissions */);
    }
  }
  async copy(from, to, opts) {
    const connection = await this._getConnection(from.authority);
    try {
      const originalFrom = this._decodeUri(from);
      const originalTo = this._decodeUri(to);
      await connection.resourceCopy({ channel: ROOT_STATE_URI, source: originalFrom.toString(), destination: originalTo.toString(), failIfExists: !opts.overwrite });
    } catch (err) {
      throw this._mapError(err, "NoPermissions" /* NoPermissions */);
    }
  }
  /**
   * Negotiate access to {@link resource} with the receiver, asking for the
   * granted modes in {@link opts}. Used after a `NoPermissions` failure to
   * prompt the receiver to grant access; the caller can then retry.
   *
   * Resolves on success. Rejects if the receiver denies, the connection
   * is missing, or the connection doesn't implement `resourceRequest`.
   */
  async requestResourceAccess(resource, opts) {
    const connection = await this._getConnection(resource.authority);
    if (!connection.resourceRequest) {
      throw createFileSystemProviderError(
        `Connection for ${resource.authority} does not support resourceRequest`,
        "Unavailable" /* Unavailable */
      );
    }
    const originalUri = this._decodeUri(resource);
    try {
      await connection.resourceRequest({
        channel: ROOT_STATE_URI,
        uri: originalUri.toString(),
        read: opts.read,
        write: opts.write
      });
    } catch (err) {
      throw this._mapError(err, "NoPermissions" /* NoPermissions */);
    }
  }
  // ---- Internals ----------------------------------------------------------
  _getConnection(authority) {
    const entry = this._authorities.get(authority);
    if (!entry) {
      return Promise.reject(createFileSystemProviderError(
        `No connection for authority: ${authority}`,
        "Unavailable" /* Unavailable */
      ));
    }
    const active = entry.connections.at(-1);
    if (active) {
      return Promise.resolve(active);
    }
    return new Promise((resolve3, reject) => {
      const settle = () => {
        const current = this._authorities.get(authority);
        if (!current) {
          sub.dispose();
          reject(createFileSystemProviderError(
            `No connection for authority: ${authority}`,
            "Unavailable" /* Unavailable */
          ));
          return;
        }
        const c = current.connections.at(-1);
        if (c) {
          sub.dispose();
          resolve3(c);
        }
      };
      const sub = this._onDidChangeConnection.event((a) => {
        if (a === authority) {
          settle();
        }
      });
      settle();
    });
  }
  /**
   * Translate a thrown error from a {@link IRemoteFilesystemConnection}
   * into a {@link FileSystemProviderError}. Preserves `PermissionDenied`
   * (-32009) as `NoPermissions` so callers can distinguish a
   * permission failure from `NotFound` and decide whether to negotiate
   * via {@link requestResourceAccess}.
   */
  _mapError(err, defaultCode) {
    if (err instanceof ProtocolError && err.code === AhpErrorCodes.PermissionDenied) {
      return createFileSystemProviderError(err.message, "NoPermissions" /* NoPermissions */);
    }
    return createFileSystemProviderError(
      err instanceof Error ? err.message : String(err),
      defaultCode
    );
  }
  /**
   * Resolve a decoded resource over {@link connection}. Shared by
   * {@link stat} and {@link realpath}.
   */
  _resolve(connection, decoded) {
    return connection.resourceResolve({ channel: ROOT_STATE_URI, uri: decoded.toString() });
  }
  async _listDirectory(authority, resource) {
    const connection = await this._getConnection(authority);
    try {
      const originalUri = this._decodeUri(resource);
      const result = await connection.resourceList(originalUri);
      return result.entries;
    } catch (err) {
      throw this._mapError(err, "Unavailable" /* Unavailable */);
    }
  }
};

var AgentHostFileSystemProvider = class extends AHPFileSystemProvider {
  _decodeUri(resource) {
    return fromAgentHostUri(resource);
  }
  _encodeUri(resource, authority) {
    return toAgentHostUri(resource, authority);
  }
};
export { createRemoteWatchHandle, agentHostUri, AHPFileSystemProvider, AgentHostFileSystemProvider };
