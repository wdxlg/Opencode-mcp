// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/encryption/common/encryptionService.ts
import { __esm } from "./module-0000.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";


// src/vs/platform/encryption/common/encryptionService.ts
var IEncryptionService, IEncryptionMainService;

var init_encryptionService = __esm({
  "src/vs/platform/encryption/common/encryptionService.ts"() {
    init_instantiation();
    IEncryptionService = createDecorator("encryptionService");
    IEncryptionMainService = createDecorator("encryptionMainService");
  }
});
export { IEncryptionService, IEncryptionMainService, init_encryptionService };
