// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/request/electron-utility/requestService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { RequestService, init_requestService } from "./module-0377.mjs";
import { IConfigurationService, init_configuration } from "./module-0040.mjs";
import { INativeEnvironmentService, init_environment } from "./module-0071.mjs";
import { ILogService, init_log } from "./module-0075.mjs";


// src/vs/platform/request/electron-utility/requestService.ts
import { net as net3 } from "electron";

function getRawRequest(options) {
  return net3.request;
}

var RequestService2;

var init_requestService2 = __esm({
  "src/vs/platform/request/electron-utility/requestService.ts"() {
    init_requestService();
    init_configuration();
    init_environment();
    init_log();
    RequestService2 = class extends RequestService {
      constructor(configurationService, environmentService, logService) {
        super("local", configurationService, environmentService, logService);
      }
      request(options, token) {
        return super.request({ ...options || {}, getRawRequest, isChromiumNetwork: true }, token);
      }
    };
    RequestService2 = __decorateClass([
      __decorateParam(0, IConfigurationService),
      __decorateParam(1, INativeEnvironmentService),
      __decorateParam(2, ILogService)
    ], RequestService2);
  }
});
export { getRawRequest, net3, RequestService2, init_requestService2 };
