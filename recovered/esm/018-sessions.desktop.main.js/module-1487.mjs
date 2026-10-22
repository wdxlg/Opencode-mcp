// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/browserView/common/browserViewUri.ts
import { Schemas } from "./module-0033.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/platform/browserView/common/browserViewUri.ts
var BrowserViewUri;

((BrowserViewUri2) => {
  BrowserViewUri2.scheme = Schemas.vscodeBrowser;
  function forId(id2) {
    return URI.from({ scheme: BrowserViewUri2.scheme, path: `/${id2}` });
  }
  BrowserViewUri2.forId = forId;
  function parse14(resource) {
    if (resource.scheme !== BrowserViewUri2.scheme) {
      return void 0;
    }
    const id2 = resource.path.startsWith("/") ? resource.path.substring(1) : resource.path;
    if (!id2) {
      return void 0;
    }
    return { id: id2 };
  }
  BrowserViewUri2.parse = parse14;
  function getId(resource) {
    return parse14(resource)?.id;
  }
  BrowserViewUri2.getId = getId;
})(BrowserViewUri || (BrowserViewUri = {}));
export { BrowserViewUri };
