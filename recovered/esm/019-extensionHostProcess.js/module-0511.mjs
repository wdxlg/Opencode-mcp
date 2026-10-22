// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/node/extHostLoggerService.ts
import { ExtHostLoggerService } from "./module-0321.mjs";
import { Schemas } from "./module-0026.mjs";
import { SpdLogLogger } from "./module-0510.mjs";
import { generateUuid } from "./module-0040.mjs";


// src/vs/workbench/api/node/extHostLoggerService.ts
var ExtHostLoggerService2 = class extends ExtHostLoggerService {
  doCreateLogger(resource, logLevel, options2) {
    if (resource.scheme === Schemas.file) {
      return new SpdLogLogger(options2?.name || generateUuid(), resource.fsPath, !options2?.donotRotate, !!options2?.donotUseFormatters, logLevel);
    }
    return super.doCreateLogger(resource, logLevel, options2);
  }
  registerLogger(resource) {
    super.registerLogger(resource);
    this._proxy.$registerLogger(resource);
  }
  deregisterLogger(resource) {
    super.deregisterLogger(resource);
    this._proxy.$deregisterLogger(resource);
  }
};
export { ExtHostLoggerService2 };
