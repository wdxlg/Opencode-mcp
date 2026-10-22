// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadUrls.ts
import { ExtensionIdentifier } from "./module-0688.mjs";
import { Disposable } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { ITrustedDomainService } from "./module-1288.mjs";
import { IURLService } from "./module-1285.mjs";
import { IExtensionUrlHandler } from "./module-1286.mjs";


// src/vs/workbench/api/browser/mainThreadUrls.ts
var ExtensionUrlHandler2 = class {
  constructor(proxy, handle2, extensionId, extensionDisplayName) {
    this.proxy = proxy;
    this.handle = handle2;
    this.extensionId = extensionId;
    this.extensionDisplayName = extensionDisplayName;
  }
  async handleURL(uri4, options3) {
    if (!ExtensionIdentifier.equals(this.extensionId, uri4.authority)) {
      return false;
    }
    await this.proxy.$handleExternalUri(this.handle, uri4);
    return true;
  }
};

var MainThreadUrls = class extends Disposable {
  constructor(context2, trustedDomainService, urlService, extensionUrlHandler) {
    super();
    this.urlService = urlService;
    this.extensionUrlHandler = extensionUrlHandler;
    this.handlers = /* @__PURE__ */ new Map();
    this.proxy = context2.getProxy(ExtHostContext.ExtHostUrls);
  }
  async $registerUriHandler(handle2, extensionId, extensionDisplayName) {
    const handler = new ExtensionUrlHandler2(this.proxy, handle2, extensionId, extensionDisplayName);
    const disposable = this.urlService.registerHandler(handler);
    this.handlers.set(handle2, { extensionId, disposable });
    this.extensionUrlHandler.registerExtensionHandler(extensionId, handler);
    return void 0;
  }
  async $unregisterUriHandler(handle2) {
    const tuple = this.handlers.get(handle2);
    if (!tuple) {
      return void 0;
    }
    const { extensionId, disposable } = tuple;
    this.extensionUrlHandler.unregisterExtensionHandler(extensionId);
    this.handlers.delete(handle2);
    disposable.dispose();
    return void 0;
  }
  async $createAppUri(uri4) {
    return this.urlService.create(uri4);
  }
  dispose() {
    super.dispose();
    this.handlers.forEach(({ disposable }) => disposable.dispose());
    this.handlers.clear();
  }
};

MainThreadUrls = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadUrls),
  __decorateParam(1, ITrustedDomainService),
  __decorateParam(2, IURLService),
  __decorateParam(3, IExtensionUrlHandler)
], MainThreadUrls);
export { ExtensionUrlHandler2, MainThreadUrls };
