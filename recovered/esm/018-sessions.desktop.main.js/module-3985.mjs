// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/userDataSync/electron-browser/userDataSyncService.ts
import { registerSharedProcessRemoteService } from "./module-3826.mjs";
import { IUserDataSyncResourceProviderService, IUserDataSyncService, IUserDataSyncStoreManagementService } from "./module-1639.mjs";
import { UserDataSyncServiceChannelClient } from "./module-3983.mjs";
import { IUserDataSyncMachinesService } from "./module-1692.mjs";
import { IUserDataSyncAccountService } from "./module-1640.mjs";
import { UserDataSyncAccountServiceChannelClient, UserDataSyncStoreManagementServiceChannelClient } from "./module-3984.mjs";


// src/vs/workbench/services/userDataSync/electron-browser/userDataSyncService.ts
registerSharedProcessRemoteService(IUserDataSyncService, "userDataSync", { channelClientCtor: UserDataSyncServiceChannelClient });

registerSharedProcessRemoteService(IUserDataSyncResourceProviderService, "IUserDataSyncResourceProviderService");

registerSharedProcessRemoteService(IUserDataSyncMachinesService, "userDataSyncMachines");

registerSharedProcessRemoteService(IUserDataSyncAccountService, "userDataSyncAccount", { channelClientCtor: UserDataSyncAccountServiceChannelClient });

registerSharedProcessRemoteService(IUserDataSyncStoreManagementService, "userDataSyncStoreManagement", { channelClientCtor: UserDataSyncStoreManagementServiceChannelClient });
export {};
