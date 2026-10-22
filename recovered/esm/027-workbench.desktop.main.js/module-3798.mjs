// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/url/electron-browser/urlService.ts
import { NativeURLService } from "./module-3797.mjs";
import { ProxyChannel } from "./module-1230.mjs";
import { URLHandlerChannel } from "./module-3796.mjs";
import { matchesScheme } from "./module-0033.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IMainProcessService } from "./module-3728.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { IProductService } from "./module-0873.mjs";
import { ILogService } from "./module-0095.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { IURLService } from "./module-1286.mjs";


// src/vs/workbench/services/url/electron-browser/urlService.ts
var RelayURLService = class extends NativeURLService {
  constructor(mainProcessService, openerService, nativeHostService, productService, logService) {
    super(productService);
    this.nativeHostService = nativeHostService;
    this.logService = logService;
    this.urlService = ProxyChannel.toService(mainProcessService.getChannel("url"));
    mainProcessService.registerChannel("urlHandler", new URLHandlerChannel(this));
    openerService.registerOpener(this);
  }
  create(options3) {
    const uri5 = super.create(options3);
    let query = uri5.query;
    if (!query) {
      query = `windowId=${encodeURIComponent(this.nativeHostService.windowId)}`;
    } else {
      query += `&windowId=${encodeURIComponent(this.nativeHostService.windowId)}`;
    }
    return uri5.with({ query });
  }
  async open(resource, options3) {
    if (!matchesScheme(resource, this.productService.urlProtocol)) {
      return false;
    }
    if (typeof resource === "string") {
      resource = URI.parse(resource);
    }
    return await this.urlService.open(resource, options3);
  }
  async handleURL(uri5, options3) {
    const result = await super.open(uri5, options3);
    if (result) {
      this.logService.trace("URLService#handleURL(): handled", uri5.toString(true));
      await this.nativeHostService.focusWindow({ mode: 2 /* Force */, targetWindowId: this.nativeHostService.windowId });
    } else {
      this.logService.trace("URLService#handleURL(): not handled", uri5.toString(true));
    }
    return result;
  }
};

RelayURLService = __decorateClass([
  __decorateParam(0, IMainProcessService),
  __decorateParam(1, IOpenerService),
  __decorateParam(2, INativeHostService),
  __decorateParam(3, IProductService),
  __decorateParam(4, ILogService)
], RelayURLService);

registerSingleton(IURLService, RelayURLService, 0 /* Eager */);
export { RelayURLService };
