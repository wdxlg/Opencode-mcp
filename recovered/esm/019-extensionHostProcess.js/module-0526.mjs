// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/node/extHost.node.services.ts
import { registerSingleton } from "./module-0064.mjs";
import { IExtHostExtensionService } from "./module-0288.mjs";
import { ExtHostExtensionService } from "./module-0500.mjs";
import { ILogService, ILoggerService } from "./module-0062.mjs";
import { ExtHostLoggerService2 } from "./module-0511.mjs";
import { SyncDescriptor } from "./module-0063.mjs";
import { ExtHostLogService } from "./module-0514.mjs";
import { ISignService } from "./module-0503.mjs";
import { SignService } from "./module-0340.mjs";
import { IExtensionStoragePaths } from "./module-0259.mjs";
import { ExtensionStoragePaths2 } from "./module-0509.mjs";
import { ExtHostTelemetry, IExtHostTelemetry } from "./module-0267.mjs";
import { IExtHostAuthentication } from "./module-0275.mjs";
import { NodeExtHostAuthentication } from "./module-0520.mjs";
import { IExtHostDebugService } from "./module-0314.mjs";
import { ExtHostDebugService } from "./module-0343.mjs";
import { IExtHostSearch } from "./module-0319.mjs";
import { NativeExtHostSearch } from "./module-0355.mjs";
import { IExtHostTask } from "./module-0304.mjs";
import { ExtHostTask } from "./module-0336.mjs";
import { IExtHostTerminalService } from "./module-0269.mjs";
import { ExtHostTerminalService } from "./module-0333.mjs";
import { IExtHostTunnelService } from "./module-0261.mjs";
import { NodeExtHostTunnelService } from "./module-0501.mjs";
import { IExtHostVariableResolverProvider } from "./module-0313.mjs";
import { NodeExtHostVariableResolverProviderService } from "./module-0512.mjs";
import { IExtHostMpcService } from "./module-0327.mjs";
import { NodeExtHostMpcService } from "./module-0515.mjs";
import { IExtHostBrowserTunnelProxy } from "./module-0322.mjs";
import { NodeExtHostBrowserTunnelProxy } from "./module-0525.mjs";


// src/vs/workbench/api/node/extHost.node.services.ts
registerSingleton(IExtHostExtensionService, ExtHostExtensionService, 0 /* Eager */);

registerSingleton(ILoggerService, ExtHostLoggerService2, 1 /* Delayed */);

registerSingleton(ILogService, new SyncDescriptor(ExtHostLogService, [false], true));

registerSingleton(ISignService, SignService, 1 /* Delayed */);

registerSingleton(IExtensionStoragePaths, ExtensionStoragePaths2, 0 /* Eager */);

registerSingleton(IExtHostTelemetry, new SyncDescriptor(ExtHostTelemetry, [false], true));

registerSingleton(IExtHostAuthentication, NodeExtHostAuthentication, 0 /* Eager */);

registerSingleton(IExtHostDebugService, ExtHostDebugService, 0 /* Eager */);

registerSingleton(IExtHostSearch, NativeExtHostSearch, 0 /* Eager */);

registerSingleton(IExtHostTask, ExtHostTask, 0 /* Eager */);

registerSingleton(IExtHostTerminalService, ExtHostTerminalService, 0 /* Eager */);

registerSingleton(IExtHostTunnelService, NodeExtHostTunnelService, 0 /* Eager */);

registerSingleton(IExtHostVariableResolverProvider, NodeExtHostVariableResolverProviderService, 0 /* Eager */);

registerSingleton(IExtHostMpcService, NodeExtHostMpcService, 0 /* Eager */);

registerSingleton(IExtHostBrowserTunnelProxy, NodeExtHostBrowserTunnelProxy, 0 /* Eager */);
export {};
