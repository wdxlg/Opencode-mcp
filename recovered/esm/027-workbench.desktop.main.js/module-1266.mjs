// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/extensions/common/extensionStorageMigration.ts
import { IEnvironmentService } from "./module-0508.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { IExtensionStorageService } from "./module-1265.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IFileService } from "./module-0269.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ILogService } from "./module-0095.mjs";
import { getErrorMessage } from "./module-0004.mjs";


// src/vs/workbench/services/extensions/common/extensionStorageMigration.ts
async function migrateExtensionStorage(fromExtensionId, toExtensionId, global, instantionService) {
  return instantionService.invokeFunction(async (serviceAccessor) => {
    const environmentService = serviceAccessor.get(IEnvironmentService);
    const userDataProfilesService = serviceAccessor.get(IUserDataProfilesService);
    const extensionStorageService = serviceAccessor.get(IExtensionStorageService);
    const storageService = serviceAccessor.get(IStorageService);
    const uriIdentityService = serviceAccessor.get(IUriIdentityService);
    const fileService = serviceAccessor.get(IFileService);
    const workspaceContextService = serviceAccessor.get(IWorkspaceContextService);
    const logService = serviceAccessor.get(ILogService);
    const storageMigratedKey = `extensionStorage.migrate.${fromExtensionId}-${toExtensionId}`;
    const migrateLowerCaseStorageKey = fromExtensionId.toLowerCase() === toExtensionId.toLowerCase() ? `extension.storage.migrateFromLowerCaseKey.${fromExtensionId.toLowerCase()}` : void 0;
    if (fromExtensionId === toExtensionId) {
      return;
    }
    const getExtensionStorageLocation = (extensionId, global2) => {
      if (global2) {
        return uriIdentityService.extUri.joinPath(
          userDataProfilesService.defaultProfile.globalStorageHome,
          extensionId.toLowerCase()
          /* Extension id is lower cased for global storage */
        );
      }
      return uriIdentityService.extUri.joinPath(environmentService.workspaceStorageHome, workspaceContextService.getWorkspace().id, extensionId);
    };
    const storageScope = global ? 0 /* PROFILE */ : 1 /* WORKSPACE */;
    if (!storageService.getBoolean(storageMigratedKey, storageScope, false) && !(migrateLowerCaseStorageKey && storageService.getBoolean(migrateLowerCaseStorageKey, storageScope, false))) {
      logService.info(`Migrating ${global ? "global" : "workspace"} extension storage from ${fromExtensionId} to ${toExtensionId}...`);
      const value2 = extensionStorageService.getExtensionState(fromExtensionId, global);
      if (value2) {
        extensionStorageService.setExtensionState(toExtensionId, value2, global);
        extensionStorageService.setExtensionState(fromExtensionId, void 0, global);
      }
      const fromPath = getExtensionStorageLocation(fromExtensionId, global);
      const toPath = getExtensionStorageLocation(toExtensionId, global);
      if (!uriIdentityService.extUri.isEqual(fromPath, toPath)) {
        try {
          await fileService.move(fromPath, toPath, true);
        } catch (error) {
          if (error.code !== "EntryNotFound" /* FileNotFound */) {
            logService.info(`Error while migrating ${global ? "global" : "workspace"} file storage from '${fromExtensionId}' to '${toExtensionId}'`, getErrorMessage(error));
          }
        }
      }
      logService.info(`Migrated ${global ? "global" : "workspace"} extension storage from ${fromExtensionId} to ${toExtensionId}`);
      storageService.store(storageMigratedKey, true, storageScope, 1 /* MACHINE */);
    }
  });
}
export { migrateExtensionStorage };
