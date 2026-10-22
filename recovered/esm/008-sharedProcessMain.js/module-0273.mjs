// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/request/electron-utility/requestService.ts
import { RequestService } from "./module-0274.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0049.mjs";
import { INativeEnvironmentService } from "./module-0047.mjs";
import { ILogService } from "./module-0044.mjs";


// src/vs/platform/request/electron-utility/requestService.ts
import { net as net4 } from "electron";


// src/vs/platform/request/electron-utility/requestService.ts
function getRawRequest(options) {
  return net4.request;
}

var RequestService2 = class extends RequestService {
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
export { getRawRequest, net4, RequestService2 };
