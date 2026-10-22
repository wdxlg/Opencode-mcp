// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/extensions/common/extensionDevOptions.ts
import { Schemas } from "./module-0033.mjs";


// src/vs/workbench/services/extensions/common/extensionDevOptions.ts
function parseExtensionDevOptions(environmentService) {
  const isExtensionDevHost = environmentService.isExtensionDevelopment;
  let debugOk = true;
  const extDevLocs = environmentService.extensionDevelopmentLocationURI;
  if (extDevLocs) {
    for (const x of extDevLocs) {
      if (x.scheme !== Schemas.file) {
        debugOk = false;
      }
    }
  }
  const isExtensionDevDebug = debugOk && typeof environmentService.debugExtensionHost.port === "number";
  const isExtensionDevDebugBrk = debugOk && !!environmentService.debugExtensionHost.break;
  const isExtensionDevTestFromCli = isExtensionDevHost && !!environmentService.extensionTestsLocationURI && !environmentService.debugExtensionHost.debugId;
  return {
    isExtensionDevHost,
    isExtensionDevDebug,
    isExtensionDevDebugBrk,
    isExtensionDevTestFromCli
  };
}
export { parseExtensionDevOptions };
