// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/sign/node/signService.ts
import { __esm } from "./module-0000.mjs";
import { AbstractSignService, init_abstractSignService } from "./module-0379.mjs";


// src/vs/platform/sign/node/signService.ts
var SignService;

var init_signService = __esm({
  "src/vs/platform/sign/node/signService.ts"() {
    init_abstractSignService();
    SignService = class extends AbstractSignService {
      getValidator() {
        return this.vsda().then((vsda) => new vsda.validator());
      }
      signValue(arg) {
        return this.vsda().then((vsda) => new vsda.signer().sign(arg));
      }
      async vsda() {
        const mod = "vsda";
        const { default: vsda } = await import(mod);
        return vsda;
      }
    };
  }
});
export { SignService, init_signService };
