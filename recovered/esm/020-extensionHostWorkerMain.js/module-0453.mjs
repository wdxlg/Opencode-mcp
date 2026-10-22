// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/worker/extHost.worker.services.ts
import { registerSingleton } from "./module-0047.mjs";
import { ILogService } from "./module-0045.mjs";
import { SyncDescriptor } from "./module-0046.mjs";
import { ExtHostLogService } from "./module-0327.mjs";
import { ExtHostAuthentication, IExtHostAuthentication } from "./module-0269.mjs";
import { IExtHostExtensionService } from "./module-0282.mjs";
import { ExtHostExtensionService } from "./module-0452.mjs";
import { ExtensionStoragePaths, IExtensionStoragePaths } from "./module-0253.mjs";
import { ExtHostTelemetry, IExtHostTelemetry } from "./module-0260.mjs";


// src/vs/workbench/api/worker/extHost.worker.services.ts
registerSingleton(ILogService, new SyncDescriptor(ExtHostLogService, [true], true));

registerSingleton(IExtHostAuthentication, ExtHostAuthentication, 0 /* Eager */);

registerSingleton(IExtHostExtensionService, ExtHostExtensionService, 0 /* Eager */);

registerSingleton(IExtensionStoragePaths, ExtensionStoragePaths, 0 /* Eager */);

registerSingleton(IExtHostTelemetry, new SyncDescriptor(ExtHostTelemetry, [true], true));
export {};
