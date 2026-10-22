// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/remote/common/remoteAuthorityResolver.ts
import { createDecorator } from "./module-0042.mjs";
import { ErrorNoTelemetry } from "./module-0003.mjs";


// src/vs/platform/remote/common/remoteAuthorityResolver.ts
var IRemoteAuthorityResolverService = createDecorator("remoteAuthorityResolverService");

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
  constructor(message, code = "Unknown" /* Unknown */, detail) {
    super(message);
    this._message = message;
    this._code = code;
    this._detail = detail;
    this.isHandled = code === "NotAvailable" /* NotAvailable */ && detail === true;
    Object.setPrototypeOf(this, _RemoteAuthorityResolverError.prototype);
  }
};
export { IRemoteAuthorityResolverService, RemoteAuthorityResolverError };
