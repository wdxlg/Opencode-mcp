// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/userDataSync/common/mcpSync.ts
import { AbstractJsonSynchronizer } from "./module-0182.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IUserDataSyncEnablementService, IUserDataSyncLocalStoreService, IUserDataSyncLogService, IUserDataSyncStoreService } from "./module-0157.mjs";
import { IConfigurationService } from "./module-0049.mjs";
import { IFileService } from "./module-0057.mjs";
import { IEnvironmentService } from "./module-0047.mjs";
import { IStorageService } from "./module-0096.mjs";
import { ITelemetryService } from "./module-0085.mjs";
import { IUriIdentityService } from "./module-0094.mjs";


// src/vs/platform/userDataSync/common/mcpSync.ts
function getMcpContentFromSyncContent(syncContent, logService) {
  try {
    const parsed = JSON.parse(syncContent);
    return parsed.mcp ?? null;
  } catch (e) {
    logService.error(e);
    return null;
  }
}

var McpSynchroniser = class extends AbstractJsonSynchronizer {
  constructor(profile, collection, userDataSyncStoreService, userDataSyncLocalStoreService, logService, configurationService, userDataSyncEnablementService, fileService, environmentService, storageService, telemetryService, uriIdentityService) {
    super(profile.mcpResource, { syncResource: "mcp" /* Mcp */, profile }, collection, "mcp.json", fileService, environmentService, storageService, userDataSyncStoreService, userDataSyncLocalStoreService, userDataSyncEnablementService, telemetryService, logService, configurationService, uriIdentityService);
  }
  getContentFromSyncContent(syncContent) {
    return getMcpContentFromSyncContent(syncContent, this.logService);
  }
  toSyncContent(mcp) {
    return mcp ? { mcp } : {};
  }
};

McpSynchroniser = __decorateClass([
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
], McpSynchroniser);
export { getMcpContentFromSyncContent, McpSynchroniser };
