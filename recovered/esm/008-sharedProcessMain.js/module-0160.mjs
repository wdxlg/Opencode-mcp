// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/userDataSync/common/userDataSyncLocalStoreService.ts
import { Disposable } from "./module-0013.mjs";
import { ALL_SYNC_RESOURCES, IUserDataSyncLogService } from "./module-0157.mjs";
import { IFileService, toFileOperationResult } from "./module-0057.mjs";
import { joinPath } from "./module-0027.mjs";
import { toLocalISOString } from "./module-0159.mjs";
import { VSBuffer } from "./module-0031.mjs";
import { Promises } from "./module-0029.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IEnvironmentService } from "./module-0047.mjs";
import { IConfigurationService } from "./module-0049.mjs";
import { IUserDataProfilesService } from "./module-0095.mjs";


// src/vs/platform/userDataSync/common/userDataSyncLocalStoreService.ts
var UserDataSyncLocalStoreService = class extends Disposable {
  constructor(environmentService, fileService, configurationService, logService, userDataProfilesService) {
    super();
    this.environmentService = environmentService;
    this.fileService = fileService;
    this.configurationService = configurationService;
    this.logService = logService;
    this.userDataProfilesService = userDataProfilesService;
    this.cleanUp();
  }
  async cleanUp() {
    for (const profile of this.userDataProfilesService.profiles) {
      for (const resource of ALL_SYNC_RESOURCES) {
        try {
          await this.cleanUpBackup(this.getResourceBackupHome(resource, profile.isDefault ? void 0 : profile.id));
        } catch (error) {
          this.logService.error(error);
        }
      }
    }
    let stat;
    try {
      stat = await this.fileService.resolve(this.environmentService.userDataSyncHome);
    } catch (error) {
      if (toFileOperationResult(error) !== 1 /* FILE_NOT_FOUND */) {
        this.logService.error(error);
      }
      return;
    }
    if (stat.children) {
      for (const child of stat.children) {
        if (child.isDirectory && !ALL_SYNC_RESOURCES.includes(child.name) && !this.userDataProfilesService.profiles.some((profile) => profile.id === child.name)) {
          try {
            this.logService.info("Deleting non existing profile from backup", child.resource.path);
            await this.fileService.del(child.resource, { recursive: true });
          } catch (error) {
            this.logService.error(error);
          }
        }
      }
    }
  }
  async getAllResourceRefs(resource, collection, root) {
    const folder = this.getResourceBackupHome(resource, collection, root);
    try {
      const stat = await this.fileService.resolve(folder);
      if (stat.children) {
        const all = stat.children.filter((stat2) => stat2.isFile && !stat2.name.startsWith("lastSync")).sort().reverse();
        return all.map((stat2) => ({
          ref: stat2.name,
          created: this.getCreationTime(stat2)
        }));
      }
    } catch (error) {
      if (toFileOperationResult(error) !== 1 /* FILE_NOT_FOUND */) {
        throw error;
      }
    }
    return [];
  }
  async resolveResourceContent(resourceKey, ref, collection, root) {
    const folder = this.getResourceBackupHome(resourceKey, collection, root);
    const file = joinPath(folder, ref);
    try {
      const content = await this.fileService.readFile(file);
      return content.value.toString();
    } catch (error) {
      this.logService.error(error);
      return null;
    }
  }
  async writeResource(resourceKey, content, cTime, collection, root) {
    const folder = this.getResourceBackupHome(resourceKey, collection, root);
    const resource = joinPath(folder, `${toLocalISOString(cTime).replace(/-|:|\.\d+Z$/g, "")}.json`);
    try {
      await this.fileService.writeFile(resource, VSBuffer.fromString(content));
    } catch (e) {
      this.logService.error(e);
    }
  }
  getResourceBackupHome(resource, collection, root = this.environmentService.userDataSyncHome) {
    return joinPath(root, ...collection ? [collection, resource] : [resource]);
  }
  async cleanUpBackup(folder) {
    try {
      try {
        if (!await this.fileService.exists(folder)) {
          return;
        }
      } catch (e) {
        return;
      }
      const stat = await this.fileService.resolve(folder);
      if (stat.children) {
        const all = stat.children.filter((stat2) => stat2.isFile && /^\d{8}T\d{6}(\.json)?$/.test(stat2.name)).sort();
        const backUpMaxAge = 1e3 * 60 * 60 * 24 * (this.configurationService.getValue("sync.localBackupDuration") || 30);
        let toDelete = all.filter((stat2) => Date.now() - this.getCreationTime(stat2) > backUpMaxAge);
        const remaining = all.length - toDelete.length;
        if (remaining < 10) {
          toDelete = toDelete.slice(10 - remaining);
        }
        await Promises.settled(toDelete.map(async (stat2) => {
          this.logService.info("Deleting from backup", stat2.resource.path);
          await this.fileService.del(stat2.resource);
        }));
      }
    } catch (e) {
      this.logService.error(e);
    }
  }
  getCreationTime(stat) {
    return new Date(
      parseInt(stat.name.substring(0, 4)),
      parseInt(stat.name.substring(4, 6)) - 1,
      parseInt(stat.name.substring(6, 8)),
      parseInt(stat.name.substring(9, 11)),
      parseInt(stat.name.substring(11, 13)),
      parseInt(stat.name.substring(13, 15))
    ).getTime();
  }
};

UserDataSyncLocalStoreService = __decorateClass([
  __decorateParam(0, IEnvironmentService),
  __decorateParam(1, IFileService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IUserDataSyncLogService),
  __decorateParam(4, IUserDataProfilesService)
], UserDataSyncLocalStoreService);
export { UserDataSyncLocalStoreService };
