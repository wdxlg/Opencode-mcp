// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/remote/electron-browser/remoteAuthorityResolverService.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { RemoteAuthorities } from "./module-0033.mjs";
import { DeferredPromise } from "./module-0036.mjs";
import { ErrorNoTelemetry } from "./module-0004.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0875.mjs";


// src/vs/platform/remote/electron-browser/remoteAuthorityResolverService.ts
var RemoteAuthorityResolverService = class extends Disposable {
  constructor(productService, remoteResourceLoader) {
    super();
    this.remoteResourceLoader = remoteResourceLoader;
    this._onDidChangeConnectionData = this._register(new Emitter());
    this.onDidChangeConnectionData = this._onDidChangeConnectionData.event;
    this._resolveAuthorityRequests = /* @__PURE__ */ new Map();
    this._connectionTokens = /* @__PURE__ */ new Map();
    this._canonicalURIRequests = /* @__PURE__ */ new Map();
    this._canonicalURIProvider = null;
    RemoteAuthorities.setServerRootPath(productService, void 0);
  }
  resolveAuthority(authority) {
    if (!this._resolveAuthorityRequests.has(authority)) {
      this._resolveAuthorityRequests.set(authority, new DeferredPromise());
    }
    return this._resolveAuthorityRequests.get(authority).p;
  }
  async getCanonicalURI(uri4) {
    const key3 = uri4.toString();
    const existing = this._canonicalURIRequests.get(key3);
    if (existing) {
      return existing.result.p;
    }
    const result = new DeferredPromise();
    this._canonicalURIProvider?.(uri4).then((uri5) => result.complete(uri5), (err) => result.error(err));
    this._canonicalURIRequests.set(key3, { input: uri4, result });
    return result.p;
  }
  getConnectionData(authority) {
    if (!this._resolveAuthorityRequests.has(authority)) {
      return null;
    }
    const request2 = this._resolveAuthorityRequests.get(authority);
    if (!request2.isResolved) {
      return null;
    }
    const connectionToken = this._connectionTokens.get(authority);
    return {
      connectTo: request2.value.authority.connectTo,
      connectionToken
    };
  }
  _clearResolvedAuthority(authority) {
    if (this._resolveAuthorityRequests.has(authority)) {
      this._resolveAuthorityRequests.get(authority).cancel();
      this._resolveAuthorityRequests.delete(authority);
    }
  }
  _setResolvedAuthority(resolvedAuthority, options3) {
    if (this._resolveAuthorityRequests.has(resolvedAuthority.authority)) {
      const request2 = this._resolveAuthorityRequests.get(resolvedAuthority.authority);
      if (resolvedAuthority.connectTo.type === 0 /* WebSocket */) {
        RemoteAuthorities.set(resolvedAuthority.authority, resolvedAuthority.connectTo.host, resolvedAuthority.connectTo.port);
      } else {
        RemoteAuthorities.setDelegate(this.remoteResourceLoader.getResourceUriProvider());
      }
      if (resolvedAuthority.connectionToken) {
        RemoteAuthorities.setConnectionToken(resolvedAuthority.authority, resolvedAuthority.connectionToken);
      }
      request2.complete({ authority: resolvedAuthority, options: options3 });
      this._onDidChangeConnectionData.fire();
    }
  }
  _setResolvedAuthorityError(authority, err) {
    if (this._resolveAuthorityRequests.has(authority)) {
      const request2 = this._resolveAuthorityRequests.get(authority);
      request2.error(ErrorNoTelemetry.fromError(err));
    }
  }
  _setAuthorityConnectionToken(authority, connectionToken) {
    this._connectionTokens.set(authority, connectionToken);
    RemoteAuthorities.setConnectionToken(authority, connectionToken);
    this._onDidChangeConnectionData.fire();
  }
  _setCanonicalURIProvider(provider) {
    this._canonicalURIProvider = provider;
    this._canonicalURIRequests.forEach(({ result, input }) => {
      this._canonicalURIProvider(input).then((uri4) => result.complete(uri4), (err) => result.error(err));
    });
  }
};

RemoteAuthorityResolverService = __decorateClass([
  __decorateParam(0, IProductService)
], RemoteAuthorityResolverService);
export { RemoteAuthorityResolverService };
