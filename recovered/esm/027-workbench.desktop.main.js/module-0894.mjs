// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/remote/common/remoteAuthorityResolver.ts
import { createDecorator } from "./module-0077.mjs";
import { ErrorNoTelemetry } from "./module-0004.mjs";


// src/vs/platform/remote/common/remoteAuthorityResolver.ts
var IRemoteAuthorityResolverService = createDecorator("remoteAuthorityResolverService");

var ManagedRemoteConnection = class {
  constructor(id2) {
    this.id = id2;
    this.type = 1 /* Managed */;
  }
  toString() {
    return `Managed(${this.id})`;
  }
};

var WebSocketRemoteConnection = class {
  constructor(host, port) {
    this.host = host;
    this.port = port;
    this.type = 0 /* WebSocket */;
  }
  toString() {
    return `WebSocket(${this.host}:${this.port})`;
  }
};

var RemoteAuthorityResolverError = class _RemoteAuthorityResolverError extends ErrorNoTelemetry {
  static isNotAvailable(err) {
    return err instanceof _RemoteAuthorityResolverError && err._code === "NotAvailable" /* NotAvailable */;
  }
  static isTemporarilyNotAvailable(err) {
    return err instanceof _RemoteAuthorityResolverError && err._code === "TemporarilyNotAvailable" /* TemporarilyNotAvailable */;
  }
  static isNoResolverFound(err) {
    return err instanceof _RemoteAuthorityResolverError && err._code === "NoResolverFound" /* NoResolverFound */;
  }
  static isInvalidAuthority(err) {
    return err instanceof _RemoteAuthorityResolverError && err._code === "InvalidAuthority" /* InvalidAuthority */;
  }
  static isHandled(err) {
    return err instanceof _RemoteAuthorityResolverError && err.isHandled;
  }
  constructor(message, code = "Unknown" /* Unknown */, detail2) {
    super(message);
    this._message = message;
    this._code = code;
    this._detail = detail2;
    this.isHandled = code === "NotAvailable" /* NotAvailable */ && detail2 === true;
    Object.setPrototypeOf(this, _RemoteAuthorityResolverError.prototype);
  }
};

function getRemoteAuthorityPrefix(remoteAuthority) {
  const plusIndex = remoteAuthority.indexOf("+");
  if (plusIndex === -1) {
    return remoteAuthority;
  }
  return remoteAuthority.substring(0, plusIndex);
}
export { getRemoteAuthorityPrefix, IRemoteAuthorityResolverService, ManagedRemoteConnection, WebSocketRemoteConnection, RemoteAuthorityResolverError };
