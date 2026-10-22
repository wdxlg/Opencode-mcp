// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostFileSystemInfo.ts
import { Schemas } from "./module-0026.mjs";
import { ExtUri } from "./module-0027.mjs";
import { createDecorator2 } from "./module-0048.mjs";


// src/vs/workbench/api/common/extHostFileSystemInfo.ts
var ExtHostFileSystemInfo = class {
  constructor() {
    this._systemSchemes = new Set(Object.keys(Schemas));
    this._providerInfo = /* @__PURE__ */ new Map();
    this.extUri = new ExtUri((uri2) => {
      const capabilities = this._providerInfo.get(uri2.scheme);
      if (capabilities === void 0) {
        return false;
      }
      if (capabilities & 1024 /* PathCaseSensitive */) {
        return false;
      }
      return true;
    });
  }
  $acceptProviderInfos(uri2, capabilities) {
    if (capabilities === null) {
      this._providerInfo.delete(uri2.scheme);
    } else {
      this._providerInfo.set(uri2.scheme, capabilities);
    }
  }
  isFreeScheme(scheme) {
    return !this._providerInfo.has(scheme) && !this._systemSchemes.has(scheme);
  }
  getCapabilities(scheme) {
    return this._providerInfo.get(scheme);
  }
};

var IExtHostFileSystemInfo = createDecorator2("IExtHostFileSystemInfo");
export { ExtHostFileSystemInfo, IExtHostFileSystemInfo };
