// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/url/common/urlService.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { first } from "./module-0036.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IProductService } from "./module-0873.mjs";


// src/vs/platform/url/common/urlService.ts
var AbstractURLService = class extends Disposable {
  constructor() {
    super(...arguments);
    this.handlers = /* @__PURE__ */ new Set();
  }
  open(uri5, options3) {
    const handlers = [...this.handlers.values()];
    return first(handlers.map((h3) => () => h3.handleURL(uri5, options3)), void 0, false).then((val) => val || false);
  }
  registerHandler(handler) {
    this.handlers.add(handler);
    return toDisposable(() => this.handlers.delete(handler));
  }
};

var NativeURLService = class extends AbstractURLService {
  constructor(productService) {
    super();
    this.productService = productService;
  }
  create(options3) {
    let { authority, path, query, fragment } = options3 ? options3 : { authority: void 0, path: void 0, query: void 0, fragment: void 0 };
    if (authority && path && path.indexOf("/") !== 0) {
      path = `/${path}`;
    }
    return URI.from({ scheme: this.productService.urlProtocol, authority, path, query, fragment });
  }
};

NativeURLService = __decorateClass([
  __decorateParam(0, IProductService)
], NativeURLService);
export { AbstractURLService, NativeURLService };
