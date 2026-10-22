// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/electron-browser/extensionHostDebugService.ts
import { registerMainProcessRemoteService } from "./module-3729.mjs";
import { IExtensionHostDebugService } from "./module-2402.mjs";
import { ExtensionHostDebugBroadcastChannel, ExtensionHostDebugChannelClient } from "./module-3957.mjs";


// src/vs/workbench/contrib/debug/electron-browser/extensionHostDebugService.ts
registerMainProcessRemoteService(IExtensionHostDebugService, ExtensionHostDebugBroadcastChannel.ChannelName, { channelClientCtor: ExtensionHostDebugChannelClient });
export {};
