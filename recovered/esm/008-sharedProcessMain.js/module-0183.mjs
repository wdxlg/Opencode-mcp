// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/userDataSync/common/tasksSync.ts
import { AbstractJsonSynchronizer } from "./module-0182.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUserDataSyncEnablementService, IUserDataSyncLocalStoreService, IUserDataSyncLogService, IUserDataSyncStoreService } from "./module-0157.mjs";
import { IConfigurationService } from "./module-0049.mjs";
import { IFileService } from "./module-0057.mjs";
import { IEnvironmentService } from "./module-0047.mjs";
import { IStorageService } from "./module-0096.mjs";
import { ITelemetryService } from "./module-0085.mjs";
import { IUriIdentityService } from "./module-0094.mjs";
import { AbstractInitializer } from "./module-0167.mjs";
import { VSBuffer } from "./module-0031.mjs";
import { IUserDataProfilesService } from "./module-0095.mjs";


// src/vs/platform/userDataSync/common/tasksSync.ts
function getTasksContentFromSyncContent(syncContent, logService) {
  try {
    const parsed = JSON.parse(syncContent);
    return parsed.tasks ?? null;
  } catch (e) {
    logService.error(e);
    return null;
  }
}

var TasksSynchroniser = class extends AbstractJsonSynchronizer {
  constructor(profile, collection, userDataSyncStoreService, userDataSyncLocalStoreService, logService, configurationService, userDataSyncEnablementService, fileService, environmentService, storageService, telemetryService, uriIdentityService) {
    super(profile.tasksResource, { syncResource: "tasks" /* Tasks */, profile }, collection, "tasks.json", fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
  }
  getContentFromSyncContent(syncContent) {
    return getTasksContentFromSyncContent(syncContent, this.logService);
  }
  toSyncContent(tasks) {
    return tasks ? { tasks } : {};
  }
};

TasksSynchroniser = __decorateClass([
  __decorateParam(2, IUserDataSyncStoreService),
  __decorateParam(3, IUserDataSyncLocalStoreService),
  __decorateParam(4, IUserDataSyncLogService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IUserDataSyncEnablementService),
  __decorateParam(7, IFileService),
  __decorateParam(8, IEnvironmentService),
  __decorateParam(9, IStorageService),
  __decorateParam(10, ITelemetryService),
  __decorateParam(11, IUriIdentityService)
], TasksSynchroniser);

var TasksInitializer = class extends AbstractInitializer {
  constructor(fileService, userDataProfilesService, environmentService, logService, storageService, uriIdentityService) {
    super("tasks" /* Tasks */, userDataProfilesService, environmentService, logService, fileService, storageService, uriIdentityService);
    this.tasksResource = this.userDataProfilesService.defaultProfile.tasksResource;
  }
  async doInitialize(remoteUserData) {
    const tasksContent = remoteUserData.syncData ? getTasksContentFromSyncContent(remoteUserData.syncData.content, this.logService) : null;
    if (!tasksContent) {
      this.logService.info("Skipping initializing tasks because remote tasks does not exist.");
      return;
    }
    const isEmpty2 = await this.isEmpty();
    if (!isEmpty2) {
      this.logService.info("Skipping initializing tasks because local tasks exist.");
      return;
    }
    await this.fileService.writeFile(this.tasksResource, VSBuffer.fromString(tasksContent));
    await this.updateLastSyncUserData(remoteUserData);
  }
  async isEmpty() {
    return this.fileService.exists(this.tasksResource);
  }
};

TasksInitializer = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, IUserDataProfilesService),
  __decorateParam(2, IEnvironmentService),
  __decorateParam(3, IUserDataSyncLogService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IUriIdentityService)
], TasksInitializer);
export { getTasksContentFromSyncContent, TasksSynchroniser, TasksInitializer };
