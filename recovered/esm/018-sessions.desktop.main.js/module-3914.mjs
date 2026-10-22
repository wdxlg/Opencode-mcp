// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/update/electron-browser/updateService.ts
import { registerMainProcessRemoteService } from "./module-3826.mjs";
import { IUpdateService } from "./module-1181.mjs";
import { UpdateChannelClient } from "./module-3913.mjs";


// src/vs/workbench/services/update/electron-browser/updateService.ts
registerMainProcessRemoteService(IUpdateService, "update", { channelClientCtor: UpdateChannelClient });
export {};
