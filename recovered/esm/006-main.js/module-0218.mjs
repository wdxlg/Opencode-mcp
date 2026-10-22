// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/sign/common/sign.ts
import { __esm } from "./module-0000.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";


// src/vs/platform/sign/common/sign.ts
var SIGN_SERVICE_ID, ISignService;

var init_sign = __esm({
  "src/vs/platform/sign/common/sign.ts"() {
    init_instantiation();
    SIGN_SERVICE_ID = "signService";
    ISignService = createDecorator(SIGN_SERVICE_ID);
  }
});
export { SIGN_SERVICE_ID, ISignService, init_sign };
