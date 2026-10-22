// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostUrls.ts
import { ExtensionIdentifierSet } from "./module-0059.mjs";
import { MainContext } from "./module-0054.mjs";
import { toDisposable } from "./module-0011.mjs";
import { URI } from "./module-0025.mjs";
import { onUnexpectedError } from "./module-0003.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtHostRpcService } from "./module-0069.mjs";
import { createDecorator2 } from "./module-0048.mjs";


// src/vs/workbench/api/common/extHostUrls.ts
var ExtHostUrls = class {
  constructor(extHostRpc) {
    this.handles = new ExtensionIdentifierSet();
    this.handlers = /* @__PURE__ */ new Map();
    this._proxy = extHostRpc.getProxy(MainContext.MainThreadUrls);
  }
  static {
    this.HandlePool = 0;
  }
  registerUriHandler(extension, handler) {
    const extensionId = extension.identifier;
    if (this.handles.has(extensionId)) {
      throw new Error(`Protocol handler already registered for extension ${extensionId}`);
    }
    const handle = ExtHostUrls.HandlePool++;
    this.handles.add(extensionId);
    this.handlers.set(handle, handler);
    this._proxy.$registerUriHandler(handle, extensionId, extension.displayName || extension.name);
    return toDisposable(() => {
      this.handles.delete(extensionId);
      this.handlers.delete(handle);
      this._proxy.$unregisterUriHandler(handle);
    });
  }
  $handleExternalUri(handle, uri2) {
    const handler = this.handlers.get(handle);
    if (!handler) {
      return Promise.resolve(void 0);
    }
    try {
      handler.handleUri(URI.revive(uri2));
    } catch (err) {
      onUnexpectedError(err);
    }
    return Promise.resolve(void 0);
  }
  async createAppUri(uri2) {
    return URI.revive(await this._proxy.$createAppUri(uri2));
  }
};

ExtHostUrls = __decorateClass([
  __decorateParam(0, IExtHostRpcService)
], ExtHostUrls);

var IExtHostUrlsService = createDecorator2("IExtHostUrlsService");
export { ExtHostUrls, IExtHostUrlsService };
