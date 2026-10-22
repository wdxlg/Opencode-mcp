// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHost.common.services.ts
import { registerSingleton } from "./module-0047.mjs";
import { ExtHostLocalizationService, IExtHostLocalizationService } from "./module-0280.mjs";
import { ILoggerService } from "./module-0045.mjs";
import { ExtHostLoggerService } from "./module-0314.mjs";
import { ExtHostApiDeprecationService, IExtHostApiDeprecationService } from "./module-0283.mjs";
import { ExtHostCommands, IExtHostCommands } from "./module-0261.mjs";
import { ExtHostProgress, IExtHostProgress } from "./module-0267.mjs";
import { ExtHostLanguageModels, IExtHostLanguageModels } from "./module-0270.mjs";
import { ExtHostConfiguration, IExtHostConfiguration } from "./module-0247.mjs";
import { ExtHostConsumerFileSystem, IExtHostConsumerFileSystem } from "./module-0252.mjs";
import { ExtHostTesting, IExtHostTesting } from "./module-0302.mjs";
import { IExtHostDebugService, WorkerExtHostDebugService } from "./module-0307.mjs";
import { ExtHostDecorations, IExtHostDecorations } from "./module-0288.mjs";
import { ExtHostDocumentsAndEditors, IExtHostDocumentsAndEditors } from "./module-0294.mjs";
import { ExtHostManagedSockets, IExtHostManagedSockets } from "./module-0281.mjs";
import { ExtHostBrowserTunnelProxy, IExtHostBrowserTunnelProxy } from "./module-0315.mjs";
import { ExtHostFileSystemInfo, IExtHostFileSystemInfo } from "./module-0061.mjs";
import { ExtHostOutputService, IExtHostOutputService } from "./module-0287.mjs";
import { ExtHostSearch, IExtHostSearch } from "./module-0312.mjs";
import { ExtHostStorage, IExtHostStorage } from "./module-0250.mjs";
import { IExtHostTask, WorkerExtHostTask } from "./module-0297.mjs";
import { IExtHostTerminalService, WorkerExtHostTerminalService } from "./module-0262.mjs";
import { ExtHostTerminalShellIntegration, IExtHostTerminalShellIntegration } from "./module-0316.mjs";
import { ExtHostTunnelService, IExtHostTunnelService } from "./module-0255.mjs";
import { ExtHostWindow, IExtHostWindow } from "./module-0264.mjs";
import { ExtHostPower, IExtHostPower } from "./module-0313.mjs";
import { ExtHostUrls, IExtHostUrlsService } from "./module-0265.mjs";
import { ExtHostWorkspace, IExtHostWorkspace } from "./module-0245.mjs";
import { ExtHostSecretState, IExtHostSecretState } from "./module-0278.mjs";
import { ExtHostEditorTabs, IExtHostEditorTabs } from "./module-0300.mjs";
import { ExtHostVariableResolverProviderService, IExtHostVariableResolverProvider } from "./module-0306.mjs";
import { ExtHostMcpService, IExtHostMpcService } from "./module-0320.mjs";
import { ExtHostDataChannels, IExtHostDataChannels } from "./module-0322.mjs";
import { ExtHostMeteredConnection, IExtHostMeteredConnection } from "./module-0323.mjs";
import { ExtHostGitExtensionService, IExtHostGitExtensionService } from "./module-0324.mjs";


// src/vs/workbench/api/common/extHost.common.services.ts
registerSingleton(IExtHostLocalizationService, ExtHostLocalizationService, 1 /* Delayed */);

registerSingleton(ILoggerService, ExtHostLoggerService, 1 /* Delayed */);

registerSingleton(IExtHostApiDeprecationService, ExtHostApiDeprecationService, 1 /* Delayed */);

registerSingleton(IExtHostCommands, ExtHostCommands, 0 /* Eager */);

registerSingleton(IExtHostProgress, ExtHostProgress, 0 /* Eager */);

registerSingleton(IExtHostLanguageModels, ExtHostLanguageModels, 0 /* Eager */);

registerSingleton(IExtHostConfiguration, ExtHostConfiguration, 0 /* Eager */);

registerSingleton(IExtHostConsumerFileSystem, ExtHostConsumerFileSystem, 0 /* Eager */);

registerSingleton(IExtHostTesting, ExtHostTesting, 0 /* Eager */);

registerSingleton(IExtHostDebugService, WorkerExtHostDebugService, 0 /* Eager */);

registerSingleton(IExtHostDecorations, ExtHostDecorations, 0 /* Eager */);

registerSingleton(IExtHostDocumentsAndEditors, ExtHostDocumentsAndEditors, 0 /* Eager */);

registerSingleton(IExtHostManagedSockets, ExtHostManagedSockets, 0 /* Eager */);

registerSingleton(IExtHostBrowserTunnelProxy, ExtHostBrowserTunnelProxy, 0 /* Eager */);

registerSingleton(IExtHostFileSystemInfo, ExtHostFileSystemInfo, 0 /* Eager */);

registerSingleton(IExtHostOutputService, ExtHostOutputService, 1 /* Delayed */);

registerSingleton(IExtHostSearch, ExtHostSearch, 0 /* Eager */);

registerSingleton(IExtHostStorage, ExtHostStorage, 0 /* Eager */);

registerSingleton(IExtHostTask, WorkerExtHostTask, 0 /* Eager */);

registerSingleton(IExtHostTerminalService, WorkerExtHostTerminalService, 0 /* Eager */);

registerSingleton(IExtHostTerminalShellIntegration, ExtHostTerminalShellIntegration, 0 /* Eager */);

registerSingleton(IExtHostTunnelService, ExtHostTunnelService, 0 /* Eager */);

registerSingleton(IExtHostWindow, ExtHostWindow, 0 /* Eager */);

registerSingleton(IExtHostPower, ExtHostPower, 0 /* Eager */);

registerSingleton(IExtHostUrlsService, ExtHostUrls, 0 /* Eager */);

registerSingleton(IExtHostWorkspace, ExtHostWorkspace, 0 /* Eager */);

registerSingleton(IExtHostSecretState, ExtHostSecretState, 0 /* Eager */);

registerSingleton(IExtHostEditorTabs, ExtHostEditorTabs, 0 /* Eager */);

registerSingleton(IExtHostVariableResolverProvider, ExtHostVariableResolverProviderService, 0 /* Eager */);

registerSingleton(IExtHostMpcService, ExtHostMcpService, 0 /* Eager */);

registerSingleton(IExtHostDataChannels, ExtHostDataChannels, 0 /* Eager */);

registerSingleton(IExtHostMeteredConnection, ExtHostMeteredConnection, 0 /* Eager */);

registerSingleton(IExtHostGitExtensionService, ExtHostGitExtensionService, 1 /* Delayed */);
export {};
