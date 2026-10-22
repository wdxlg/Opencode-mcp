// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostBootstrap.ts
import { Disposable, DisposableStore } from "./module-0010.mjs";
import { FileService } from "./module-0431.mjs";
import { Schemas } from "./module-0024.mjs";
import { DiskFileSystemProvider } from "./module-0432.mjs";
import { registerPendingEditContentProvider } from "./module-0284.mjs";
import { SessionDataService } from "./module-0582.mjs";
import { URI } from "./module-0023.mjs";
import { StrictServiceCollection } from "./module-0580.mjs";
import { INativeEnvironmentService } from "./module-0129.mjs";
import { ILogService } from "./module-0084.mjs";
import { IFileService } from "./module-0128.mjs";
import { ISessionDataService } from "./module-0139.mjs";
import { IProductService } from "./module-0173.mjs";
import { AgentHostClientConnectionService, IAgentHostClientConnectionService } from "./module-0410.mjs";
import { joinPath } from "./module-0025.mjs";
import { createAgentServiceFoundation } from "./module-0554.mjs";
import { createAgentHostTelemetryService } from "./module-0266.mjs";
import { ITelemetryService } from "./module-0053.mjs";
import { IByokLmBridgeRegistry, NullByokLmBridgeRegistry } from "./module-0178.mjs";
import { registerAgentHostCoreServices, registerAgentHostHostServices } from "./module-0579.mjs";
import { InstantiationService } from "./module-0442.mjs";
import { IAgentHostOctoKitService } from "./module-0524.mjs";
import { ICopilotApiService } from "./module-0168.mjs";
import { AgentHostSessionTitleController, IAgentHostSessionTitleController } from "./module-0491.mjs";
import { AgentHostActiveAgentTitleGenerationConfigKey, platformRootSchema } from "./module-0057.mjs";
import { AgentHostLocalTurns, IAgentHostLocalTurns } from "./module-0498.mjs";
import { AgentHostLocalCommands, IAgentHostLocalCommands } from "./module-0499.mjs";
import { createAgentServiceComposition } from "./module-0513.mjs";
import { IAgentService } from "./module-0049.mjs";
import { activateAgentHostContributions } from "./module-0552.mjs";
import { IAgentSdkDownloader } from "./module-0312.mjs";


// src/vs/platform/agentHost/node/agentHostBootstrap.ts
var AgentHostRuntime = class extends Disposable {
  constructor(runtime, infrastructure) {
    super();
    this.instantiationService = runtime.instantiationService;
    this.agentService = runtime.agentService;
    this.agents = runtime.agents;
    this.onDidStartTurn = runtime.onDidStartTurn;
    this.sdkDownloadProgress = runtime.sdkDownloadProgress;
    this._register(runtime.agentService);
    this._register(runtime.instantiationService);
    this._register(infrastructure);
  }
};

async function createAgentHostRuntime(options) {
  const { environmentService, productService, logService, loggerService } = options;
  const infrastructure = new DisposableStore();
  let instantiationService;
  let agentService;
  try {
    const fileService = infrastructure.add(new FileService(logService));
    infrastructure.add(fileService.registerProvider(Schemas.file, infrastructure.add(new DiskFileSystemProvider(logService))));
    infrastructure.add(registerPendingEditContentProvider(fileService));
    const sessionDataService = new SessionDataService(URI.file(environmentService.userDataPath), fileService, logService);
    const services = new StrictServiceCollection(
      [INativeEnvironmentService, environmentService],
      [ILogService, logService],
      [IFileService, fileService],
      [ISessionDataService, sessionDataService],
      [IProductService, productService]
    );
    services.set(IAgentHostClientConnectionService, infrastructure.add(new AgentHostClientConnectionService()));
    const agentServiceOptions = {
      rootConfigResource: joinPath(environmentService.appSettingsHome, "globalStorage", "agent-host-config.json"),
      providerConfigurations: options.providerConfigurations,
      hostLaunchKind: options.hostLaunchKind,
      storageResource: joinPath(environmentService.appSettingsHome, "globalStorage", "agent-host-storage.json"),
      debugLogsEnvironment: {
        logsHome: environmentService.logsHome,
        tmpDir: environmentService.tmpDir
      }
    };
    const foundation = createAgentServiceFoundation({
      services,
      owned: infrastructure,
      logService,
      productService,
      rootConfigResource: agentServiceOptions.rootConfigResource,
      providerConfigurations: agentServiceOptions.providerConfigurations,
      transientProxyConfiguration: options.transientProxyConfiguration
    });
    const { fetchFn } = foundation;
    const telemetryService = await createAgentHostTelemetryService({
      environmentService,
      productService,
      fileService,
      loggerService,
      logService,
      disposables: infrastructure,
      disableTelemetry: options.disableTelemetry,
      fetchFn,
      requestService: foundation.requestService
    });
    services.set(ITelemetryService, telemetryService);
    const byokBridgeRegistry = options.byok.kind === "renderer" ? options.byok.bridgeRegistry : new NullByokLmBridgeRegistry();
    services.set(IByokLmBridgeRegistry, byokBridgeRegistry);
    registerAgentHostCoreServices(services, {
      storageResource: agentServiceOptions.storageResource,
      fetchFn,
      gitHubServiceOptions: foundation.gitHubServiceOptions
    });
    registerAgentHostHostServices(services, {
      userDataPath: URI.file(environmentService.userDataPath),
      fetchFn,
      byok: options.byok
    });
    instantiationService = new InstantiationService(
      services,
      /*strict*/
      true
    );
    const octoKitService = instantiationService.invokeFunction((accessor) => accessor.get(IAgentHostOctoKitService));
    const copilotApiService = instantiationService.invokeFunction((accessor) => accessor.get(ICopilotApiService));
    services.set(IAgentHostSessionTitleController, infrastructure.add(instantiationService.createInstance(AgentHostSessionTitleController, foundation.stateManager, {
      sessionDataService,
      getGitHubCopilotToken: () => {
        const resource = foundation.gitHubEndpointService.getCopilotResource();
        return foundation.authenticationService.getAuthToken({ resource: resource.resource, scopes: resource.scopes_supported });
      },
      getGitHubToken: () => {
        const resource = foundation.gitHubEndpointService.getRepoResource();
        return foundation.authenticationService.getAuthToken({ resource: resource.resource, scopes: resource.scopes_supported });
      },
      getGitHubHost: () => foundation.gitHubEndpointService.getEnterpriseHost() ?? "github.com",
      octoKitService,
      copilotApiService,
      isActiveAgentTitleGenerationEnabled: () => foundation.configurationService.getRootValue(platformRootSchema, AgentHostActiveAgentTitleGenerationConfigKey) === true
    })));
    const localTurns = new AgentHostLocalTurns(sessionDataService, logService);
    services.set(IAgentHostLocalTurns, localTurns);
    services.set(IAgentHostLocalCommands, infrastructure.add(instantiationService.createInstance(AgentHostLocalCommands)));
    const agentServiceComposition = instantiationService.invokeFunction((accessor) => createAgentServiceComposition(
      agentServiceOptions,
      accessor,
      instantiationService,
      logService,
      sessionDataService,
      foundation,
      localTurns
    ));
    agentService = agentServiceComposition.agentService;
    services.set(IAgentService, agentService);
    agentService.primeMigrateLegacyGate();
    agentServiceComposition.setContributions(instantiationService.invokeFunction((accessor) => activateAgentHostContributions(accessor, instantiationService)));
    const agentSdkDownloader = instantiationService.invokeFunction((accessor) => accessor.get(IAgentSdkDownloader));
    return new AgentHostRuntime({
      instantiationService,
      agentService,
      agents: agentServiceComposition.agents,
      onDidStartTurn: agentServiceComposition.onDidStartTurn,
      sdkDownloadProgress: agentSdkDownloader.onDidDownloadProgress
    }, infrastructure);
  } catch (error) {
    agentService?.dispose();
    instantiationService?.dispose();
    infrastructure.dispose();
    throw error;
  }
}
export { createAgentHostRuntime, AgentHostRuntime };
