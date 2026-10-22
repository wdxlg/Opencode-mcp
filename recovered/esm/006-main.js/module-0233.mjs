// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/url/common/urlService.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { first, init_async } from "./module-0034.mjs";
import { Disposable, init_lifecycle, toDisposable } from "./module-0018.mjs";
import { URI, init_uri } from "./module-0030.mjs";
import { IProductService, init_productService } from "./module-0099.mjs";


// src/vs/platform/url/common/urlService.ts
var AbstractURLService, NativeURLService;

var init_urlService = __esm({
  "src/vs/platform/url/common/urlService.ts"() {
    init_async();
    init_lifecycle();
    init_uri();
    init_productService();
    AbstractURLService = class extends Disposable {
      constructor() {
        super(...arguments);
        this.handlers = /* @__PURE__ */ new Set();
      }
      open(uri, options) {
        const handlers = [...this.handlers.values()];
        return first(handlers.map((h) => () => h.handleURL(uri, options)), void 0, false).then((val) => val || false);
      }
      registerHandler(handler) {
        this.handlers.add(handler);
        return toDisposable(() => this.handlers.delete(handler));
      }
    };
    NativeURLService = class extends AbstractURLService {
      constructor(productService) {
        super();
        this.productService = productService;
      }
      create(options) {
        let { authority, path: path4, query, fragment } = options ? options : { authority: void 0, path: void 0, query: void 0, fragment: void 0 };
        if (authority && path4 && path4.indexOf("/") !== 0) {
          path4 = `/${path4}`;
        }
        return URI.from({ scheme: this.productService.urlProtocol, authority, path: path4, query, fragment });
      }
    };
    NativeURLService = __decorateClass([
      __decorateParam(0, IProductService)
    ], NativeURLService);
  }
});
export { AbstractURLService, NativeURLService, init_urlService };
