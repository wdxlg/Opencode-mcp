// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/base/common/uriIpc.ts
import { __esm } from "./module-0000.mjs";
import { init_buffer } from "./module-0050.mjs";
import { init_marshallingIds } from "./module-0029.mjs";
import { init_uri } from "./module-0030.mjs";


// src/vs/base/common/uriIpc.ts
var DefaultURITransformer;

var init_uriIpc = __esm({
  "src/vs/base/common/uriIpc.ts"() {
    init_buffer();
    init_marshallingIds();
    init_uri();
    DefaultURITransformer = new class {
      transformIncoming(uri) {
        return uri;
      }
      transformOutgoing(uri) {
        return uri;
      }
      transformOutgoingURI(uri) {
        return uri;
      }
      transformOutgoingScheme(scheme) {
        return scheme;
      }
    }();
  }
});
export { DefaultURITransformer, init_uriIpc };
