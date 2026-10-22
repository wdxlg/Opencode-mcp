// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/encryption/common/encryptionService.ts
import { createDecorator } from "./module-0077.mjs";


// src/vs/platform/encryption/common/encryptionService.ts
var IEncryptionService = createDecorator("encryptionService");

var IEncryptionMainService = createDecorator("encryptionMainService");

function isKwallet(backend) {
  return backend === "kwallet" /* kwallet */ || backend === "kwallet5" /* kwallet5 */ || backend === "kwallet6" /* kwallet6 */;
}

function isGnome(backend) {
  return backend === "gnome_any" /* gnomeAny */ || backend === "gnome_libsecret" /* gnomeLibsecret */ || backend === "gnome_keyring" /* gnomeKeyring */;
}
export { isKwallet, isGnome, IEncryptionService, IEncryptionMainService };
