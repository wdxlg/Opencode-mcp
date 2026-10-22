// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/extensions/common/extensionsUtil.ts
import { ExtensionIdentifierMap } from "./module-0688.mjs";
import { localize } from "./module-0001.mjs";
import { gte } from "./module-1045.mjs";


// src/vs/workbench/services/extensions/common/extensionsUtil.ts
function dedupExtensions(system, user, workspace, development, logService) {
  const result = new ExtensionIdentifierMap();
  system.forEach((systemExtension) => {
    const extension = result.get(systemExtension.identifier);
    if (extension) {
      logService.warn(localize(23125, null, extension.extensionLocation.fsPath, systemExtension.extensionLocation.fsPath));
    }
    result.set(systemExtension.identifier, systemExtension);
  });
  user.forEach((userExtension) => {
    const extension = result.get(userExtension.identifier);
    if (extension) {
      if (extension.isBuiltin) {
        if (gte(extension.version, userExtension.version)) {
          logService.warn(`Skipping extension ${userExtension.extensionLocation.path} in favour of the builtin extension ${extension.extensionLocation.path}.`);
          return;
        }
        userExtension.isBuiltin = true;
      } else {
        logService.warn(localize(23125, null, extension.extensionLocation.fsPath, userExtension.extensionLocation.fsPath));
      }
    } else if (userExtension.isBuiltin) {
      logService.warn(`Skipping obsolete builtin extension ${userExtension.extensionLocation.path}`);
      return;
    }
    result.set(userExtension.identifier, userExtension);
  });
  workspace.forEach((workspaceExtension) => {
    const extension = result.get(workspaceExtension.identifier);
    if (extension) {
      logService.warn(localize(23126, null, extension.extensionLocation.fsPath, workspaceExtension.extensionLocation.fsPath));
    }
    result.set(workspaceExtension.identifier, workspaceExtension);
  });
  development.forEach((developedExtension) => {
    logService.info(localize(23124, null, developedExtension.extensionLocation.fsPath));
    const extension = result.get(developedExtension.identifier);
    if (extension) {
      if (extension.isBuiltin) {
        developedExtension.isBuiltin = true;
      }
    }
    result.set(developedExtension.identifier, developedExtension);
  });
  return Array.from(result.values());
}
export { dedupExtensions };
