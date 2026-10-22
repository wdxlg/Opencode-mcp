// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/request/electron-browser/requestService.ts
import { AbstractRequestService, IRequestService } from "./module-0947.mjs";
import { localize } from "./module-0001.mjs";
import { windowLogGroup } from "./module-1501.mjs";
import { LogService } from "./module-3851.mjs";
import { request } from "./module-3928.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeHostService } from "./module-2566.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILoggerService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/request/electron-browser/requestService.ts
var NativeRequestService = class extends AbstractRequestService {
  constructor(nativeHostService, configurationService, loggerService) {
    const logger = loggerService.createLogger(`network`, { name: localize(23345, null), group: windowLogGroup });
    const logService = new LogService(logger);
    super(logService);
    this.nativeHostService = nativeHostService;
    this.configurationService = configurationService;
    this._register(logger);
    this._register(logService);
  }
  async request(options3, token) {
    if (!options3.proxyAuthorization) {
      options3.proxyAuthorization = this.configurationService.inspect("http.proxyAuthorization").userLocalValue;
    }
    return this.logAndRequest(options3, () => request(options3, token, () => navigator.onLine));
  }
  async resolveProxy(url) {
    return this.nativeHostService.resolveProxy(url);
  }
  async lookupAuthorization(authInfo) {
    return this.nativeHostService.lookupAuthorization(authInfo);
  }
  async lookupKerberosAuthorization(url) {
    return this.nativeHostService.lookupKerberosAuthorization(url);
  }
  async loadCertificates() {
    return this.nativeHostService.loadCertificates();
  }
};

NativeRequestService = __decorateClass([
  __decorateParam(0, INativeHostService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ILoggerService)
], NativeRequestService);

registerSingleton(IRequestService, NativeRequestService, 1 /* Delayed */);
export { NativeRequestService };
