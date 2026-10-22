// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/sign/node/signService.ts
import { AbstractSignService } from "./module-0192.mjs";


// src/vs/platform/sign/node/signService.ts
var SignService = class extends AbstractSignService {
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
export { SignService };
