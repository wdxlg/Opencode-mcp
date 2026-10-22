// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/electron-browser/extensionHostDebugService.ts
import { registerMainProcessRemoteService } from "./module-3826.mjs";
import { IExtensionHostDebugService } from "./module-2377.mjs";
import { ExtensionHostDebugBroadcastChannel, ExtensionHostDebugChannelClient } from "./module-4070.mjs";


// src/vs/workbench/contrib/debug/electron-browser/extensionHostDebugService.ts
registerMainProcessRemoteService(IExtensionHostDebugService, ExtensionHostDebugBroadcastChannel.ChannelName, { channelClientCtor: ExtensionHostDebugChannelClient });
export {};
