// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/remote/common/remoteAuthorityResolver.ts
import { __esm } from "./module-0000.mjs";
import { ErrorNoTelemetry, init_errors } from "./module-0010.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";


// src/vs/platform/remote/common/remoteAuthorityResolver.ts
var IRemoteAuthorityResolverService, RemoteAuthorityResolverError;

var init_remoteAuthorityResolver = __esm({
  "src/vs/platform/remote/common/remoteAuthorityResolver.ts"() {
    init_errors();
    init_instantiation();
    IRemoteAuthorityResolverService = createDecorator("remoteAuthorityResolverService");
    RemoteAuthorityResolverError = class _RemoteAuthorityResolverError extends ErrorNoTelemetry {
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
      constructor(message, code2 = "Unknown" /* Unknown */, detail) {
        super(message);
        this._message = message;
        this._code = code2;
        this._detail = detail;
        this.isHandled = code2 === "NotAvailable" /* NotAvailable */ && detail === true;
        Object.setPrototypeOf(this, _RemoteAuthorityResolverError.prototype);
      }
    };
  }
});
export { IRemoteAuthorityResolverService, RemoteAuthorityResolverError, init_remoteAuthorityResolver };
