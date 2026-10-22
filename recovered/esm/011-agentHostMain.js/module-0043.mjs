// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/agentHostMain.ts
import { isUtilityProcess } from "./module-0040.mjs";
import { Server2 } from "./module-0041.mjs";
import { Server } from "./module-0033.mjs";
import { DisposableStore, MutableDisposable, toDisposable } from "./module-0010.mjs";
import { product_default } from "./module-0144.mjs";
import { NativeEnvironmentService } from "./module-0420.mjs";
import { OPTIONS, parseArgs } from "./module-0152.mjs";
import { LoggerService } from "./module-0426.mjs";
import { getLogLevel, isDevConsoleLogForwardingEnabled, registerDevConsoleLogForwarder } from "./module-0084.mjs";
import { LoggerChannel } from "./module-0427.mjs";
import { DefaultURITransformer } from "./module-0428.mjs";
import { localize } from "./module-0012.mjs";
import { OtlpEmitterLogger, OtlpLogEmitter } from "./module-0184.mjs";
import { LogService } from "./module-0424.mjs";
import { AgentHostLaunchKindEnvVar, readAgentHostLaunchKind } from "./module-0054.mjs";
import { ByokLmBridgeRegistry } from "./module-0178.mjs";
import { createAgentHostRuntime } from "./module-0583.mjs";
import { createCodexProviderConfiguration } from "./module-0397.mjs";
import { IAgentConfigurationService } from "./module-0104.mjs";
import { IFileService } from "./module-0128.mjs";
import { IAgentHostProxyResolver } from "./module-0140.mjs";
import { ITelemetryService } from "./module-0053.mjs";
import { IAgentSdkDownloader } from "./module-0312.mjs";
import { IAgentHostProviderService } from "./module-0202.mjs";
import { IAgentHostStateManager } from "./module-0103.mjs";
import { IAgentHostCompletions } from "./module-0118.mjs";
import { ErrorTelemetry } from "./module-0587.mjs";
import { CopilotAgent } from "./module-0119.mjs";
import { AgentHostClaudeAgentEnabledEnvVar, AgentHostCodexAgentEnabledEnvVar, isAgentEnabled } from "./module-0049.mjs";
import { ClaudeSdkPackage } from "./module-0321.mjs";
import { ClaudeAgent } from "./module-0368.mjs";
import { CodexAgent, CodexSdkPackage } from "./module-0369.mjs";
import { AgentHostCodexEnabledConfigKey, platformRootSchema } from "./module-0057.mjs";
import { AgentModelRefreshScheduler, MODEL_REFRESH_INTERVAL_MS } from "./module-0085.mjs";
import { ProxyChannel } from "./module-0032.mjs";
import { AgentHostClientFileSystemProvider } from "./module-0584.mjs";
import { AGENT_CLIENT_SCHEME } from "./module-0485.mjs";
import { MessagePortProtocolServer } from "./module-0414.mjs";
import { URI } from "./module-0023.mjs";
import { BANG_COMMAND_PREFIX } from "./module-0501.mjs";
import { ProtocolServerHandler } from "./module-0411.mjs";
import { AGENT_HOST_CLIENT_PROXY_CHANNEL, createAgentHostClientProxyConnection } from "./module-0586.mjs";
import { AGENT_HOST_CLIENT_BYOK_LM_CHANNEL, createAgentHostClientByokLmConnection } from "./module-0585.mjs";
import { cleanupLocalAgentHostEndpointMetadataSync, cleanupLocalAgentHostEndpointSocketSync, createLocalAgentHostEndpointMetadata, prepareLocalAgentHostEndpointMetadataDirectory, prepareLocalAgentHostEndpointSocketDirectory, publishLocalAgentHostEndpointMetadata } from "./module-0415.mjs";
import { Emitter } from "./module-0016.mjs";
import { DeferredPromise } from "./module-0027.mjs";
import { isWindows } from "./module-0013.mjs";
import { generateUuid } from "./module-0042.mjs";
import { join } from "./module-0018.mjs";
import { WebSocketProtocolServer } from "./module-0413.mjs";
import { AgentHostManagementService } from "./module-0419.mjs";


// src/vs/platform/agentHost/node/agentHostMain.ts
import * as os9 from "os";

import * as inspector from "inspector";


// src/vs/platform/agentHost/node/agentHostMain.ts
void startAgentHost().catch((err) => {
  console.error(err);
  process.exit(1);
});

async function startAgentHost() {
  let server;
  if (isUtilityProcess(process)) {
    server = new Server2();
  } else {
    server = new Server("agentHost" /* AgentHost */);
  }
  const disposables = new DisposableStore();
  const protocolIngressDisposables = disposables.add(new DisposableStore());
  const protocolHandlers = [];
  const errorTelemetry = disposables.add(new MutableDisposable());
  const productService = { _serviceBrand: void 0, ...product_default };
  const environmentService = new NativeEnvironmentService(parseArgs(process.argv, OPTIONS), productService);
  const loggerService = new LoggerService(getLogLevel(environmentService), environmentService.logsHome);
  server.registerChannel("agentHostLogger" /* Logger */, new LoggerChannel(loggerService, () => DefaultURITransformer));
  const logger = loggerService.createLogger("agenthost", { name: localize(2224, null) });
  const otlpLogEmitter = disposables.add(new OtlpLogEmitter());
  const otlpLogger = disposables.add(new OtlpEmitterLogger(otlpLogEmitter));
  const logService = new LogService(logger, [otlpLogger]);
  if (!environmentService.isBuilt && isDevConsoleLogForwardingEnabled) {
    disposables.add(registerDevConsoleLogForwarder(logService));
  }
  logService.info("Agent Host process started successfully");
  let runtime;
  let agentService;
  let instantiationService;
  let fileService;
  let stateManager;
  let completionTriggerCharacters;
  let sdkDownloadProgress;
  let byokLmBridgeRegistry;
  let proxyResolver;
  const hostLaunchKind = readAgentHostLaunchKind(process.env[AgentHostLaunchKindEnvVar]);
  try {
    byokLmBridgeRegistry = new ByokLmBridgeRegistry();
    runtime = await createAgentHostRuntime({
      environmentService,
      productService,
      logService,
      loggerService,
      transientProxyConfiguration: true,
      hostLaunchKind,
      providerConfigurations: [createCodexProviderConfiguration(environmentService.userHome)],
      byok: { kind: "renderer", bridgeRegistry: byokLmBridgeRegistry }
    });
    disposables.add(runtime);
    agentService = runtime.agentService;
    instantiationService = runtime.instantiationService;
    const runtimeServices = instantiationService.invokeFunction((accessor) => ({
      configurationService: accessor.get(IAgentConfigurationService),
      fileService: accessor.get(IFileService),
      proxyResolver: accessor.get(IAgentHostProxyResolver),
      telemetryService: accessor.get(ITelemetryService),
      agentSdkDownloader: accessor.get(IAgentSdkDownloader),
      providerService: accessor.get(IAgentHostProviderService),
      stateManager: accessor.get(IAgentHostStateManager),
      completions: accessor.get(IAgentHostCompletions)
    }));
    const agentConfigurationService = runtimeServices.configurationService;
    fileService = runtimeServices.fileService;
    proxyResolver = runtimeServices.proxyResolver;
    stateManager = runtimeServices.stateManager;
    completionTriggerCharacters = runtimeServices.completions.triggerCharacters;
    errorTelemetry.value = new ErrorTelemetry(runtimeServices.telemetryService);
    const agentSdkDownloader = runtimeServices.agentSdkDownloader;
    const providerService = runtimeServices.providerService;
    sdkDownloadProgress = runtime.sdkDownloadProgress;
    if (productService.opencodeBundledCopilot !== false) {
      providerService.registerProvider(instantiationService.createInstance(CopilotAgent));
    }
    if (isAgentEnabled(process.env[AgentHostClaudeAgentEnabledEnvVar], true) && (!environmentService.isBuilt || agentSdkDownloader.isAvailable(ClaudeSdkPackage))) {
      providerService.registerProvider(instantiationService.createInstance(ClaudeAgent));
    }
    if (!environmentService.isBuilt || agentSdkDownloader.isAvailable(CodexSdkPackage)) {
      let codexRegistered = false;
      const registerCodexIfEnabled = () => {
        if (codexRegistered) {
          return;
        }
        const enabledByEnv = isAgentEnabled(process.env[AgentHostCodexAgentEnabledEnvVar], false);
        const enabledByRootConfig = agentConfigurationService.getRootValue(platformRootSchema, AgentHostCodexEnabledConfigKey) === true;
        if (enabledByEnv || enabledByRootConfig) {
          codexRegistered = true;
          providerService.registerProvider(instantiationService.createInstance(CodexAgent));
        }
      };
      registerCodexIfEnabled();
      disposables.add(agentConfigurationService.onDidRootConfigChange(registerCodexIfEnabled));
    }
  } catch (err) {
    logService.error("Failed to create AgentService", err);
    disposables.dispose();
    throw err;
  }
  disposables.add(instantiationService.createInstance(AgentModelRefreshScheduler, runtime.agents, runtime.onDidStartTurn, MODEL_REFRESH_INTERVAL_MS));
  if (sdkDownloadProgress) {
    disposables.add(sdkDownloadProgress((p) => agentService.emitDownloadProgress(
      p.packageId,
      p.displayName,
      p.receivedBytes,
      p.totalBytes,
      p.phase === "completed" || p.phase === "failed",
      p.explicitlyRequested
    )));
  }
  if (!(server instanceof Server2)) {
    const agentChannel = ProxyChannel.fromService(agentService, disposables);
    server.registerChannel("agentHost" /* AgentHost */, agentChannel);
  }
  const clientFileSystemProvider = disposables.add(new AgentHostClientFileSystemProvider());
  disposables.add(fileService.registerProvider(AGENT_CLIENT_SCHEME, clientFileSystemProvider));
  if (server instanceof Server2) {
    const localDataPlaneDisposables = protocolIngressDisposables.add(new DisposableStore());
    const messagePortProtocolServer = localDataPlaneDisposables.add(new MessagePortProtocolServer());
    const localProtocolHandlerConfig = {
      hostLaunchKind,
      defaultDirectory: URI.file(os9.homedir()).toString(),
      completionTriggerCharacters,
      terminalCommandPrefix: BANG_COMMAND_PREFIX,
      otlpLogEmitter,
      allowExtensionMethods: false
    };
    try {
      const messagePortProtocolHandler = localDataPlaneDisposables.add(instantiationService.createInstance(
        ProtocolServerHandler,
        agentService,
        stateManager,
        messagePortProtocolServer,
        localProtocolHandlerConfig,
        clientFileSystemProvider
      ));
      protocolHandlers.push(messagePortProtocolHandler);
      const authorityRegistrations = /* @__PURE__ */ new Map();
      const registerConnection = (connection) => {
        if (authorityRegistrations.has(connection)) {
          return;
        }
        const clientId = connection.ctx;
        if (typeof clientId !== "string" || !clientId) {
          return;
        }
        // AgentHostStarter's main-process client uses this reserved identity for
        // management only. It never registers renderer proxy/BYOK channels.
        // Registering it here subscribes to a channel that cannot appear.
        if (clientId === "agentHost") {
          return;
        }
        const connectionStore = new DisposableStore();
        const getChannel = (channelName) => server.getChannel(channelName, (c) => c.ctx === clientId);
        const proxyConnection = createAgentHostClientProxyConnection(getChannel(AGENT_HOST_CLIENT_PROXY_CHANNEL));
        connectionStore.add(proxyResolver.register(clientId, proxyConnection));
        if (byokLmBridgeRegistry) {
          const byokLmConnection = createAgentHostClientByokLmConnection(getChannel(AGENT_HOST_CLIENT_BYOK_LM_CHANNEL));
          connectionStore.add(byokLmBridgeRegistry.register(clientId, byokLmConnection));
        }
        authorityRegistrations.set(connection, connectionStore);
      };
      localDataPlaneDisposables.add(server.onDidAddConnection(registerConnection));
      localDataPlaneDisposables.add(server.onDidRemoveConnection((connection) => {
        if (typeof connection.ctx === "string") {
          messagePortProtocolServer.closeClient(connection.ctx);
        }
        const reg = authorityRegistrations.get(connection);
        if (reg) {
          reg.dispose();
          authorityRegistrations.delete(connection);
        }
      }));
      localDataPlaneDisposables.add(toDisposable(() => {
        for (const registration of authorityRegistrations.values()) {
          registration.dispose();
        }
        authorityRegistrations.clear();
      }));
      for (const connection of server.connections) {
        registerConnection(connection);
      }
      server.registerChannel("agentHostProtocol" /* Protocol */, messagePortProtocolServer);
      const localEndpoint = await startLocalAgentHostEndpoint(
        environmentService.userDataPath,
        logService,
        instantiationService,
        environmentService.logsHome
      );
      if (localEndpoint) {
        const endpointMetadata = localEndpoint.metadata;
        localDataPlaneDisposables.add(localEndpoint.server);
        const localEndpointProtocolHandler = localDataPlaneDisposables.add(instantiationService.createInstance(
          ProtocolServerHandler,
          agentService,
          stateManager,
          localEndpoint.server,
          localProtocolHandlerConfig,
          clientFileSystemProvider
        ));
        protocolHandlers.push(localEndpointProtocolHandler);
        try {
          await publishLocalAgentHostEndpointMetadata(environmentService.userDataPath, endpointMetadata, logService);
          localDataPlaneDisposables.add(toDisposable(() => {
            cleanupLocalAgentHostEndpoint(environmentService.userDataPath, endpointMetadata, logService);
          }));
        } catch (error) {
          logService.error("[AgentHost] Failed to publish local protocol endpoint; continuing with MessagePort only", error);
          localEndpoint.server.dispose();
          cleanupLocalAgentHostEndpoint(environmentService.userDataPath, endpointMetadata, logService);
        }
      }
    } catch (error) {
      localDataPlaneDisposables.dispose();
      throw error;
    }
  }
  const connectionCountEmitter = disposables.add(new Emitter());
  let dynamicSocketInfo;
  const configuredWebSocketServer = new DeferredPromise();
  const connectionTrackerService = {
    onDidChangeConnectionCount: connectionCountEmitter.event,
    waitForConfiguredWebSocketServer: () => configuredWebSocketServer.p,
    async startWebSocketServer() {
      if (protocolIngressDisposables.isDisposed) {
        throw new Error("Agent Host is shutting down.");
      }
      if (dynamicSocketInfo) {
        return dynamicSocketInfo;
      }
      const socketPath = isWindows ? `\\\\.\\pipe\\vscode-agent-host-${generateUuid().replace(/-/g, "")}` : join(os9.tmpdir(), `vscode-agent-host-${generateUuid().replace(/-/g, "")}.sock`);
      const wsServer = await WebSocketProtocolServer.create(
        { socketPath },
        logService,
        { instantiationService, logsHome: environmentService.logsHome }
      );
      if (protocolIngressDisposables.isDisposed) {
        wsServer.dispose();
        throw new Error("Agent Host is shutting down.");
      }
      protocolIngressDisposables.add(wsServer);
      const protocolHandler = protocolIngressDisposables.add(instantiationService.createInstance(
        ProtocolServerHandler,
        agentService,
        stateManager,
        wsServer,
        {
          hostLaunchKind,
          defaultDirectory: URI.file(os9.homedir()).toString(),
          completionTriggerCharacters,
          terminalCommandPrefix: BANG_COMMAND_PREFIX,
          otlpLogEmitter
        },
        clientFileSystemProvider
      ));
      protocolHandlers.push(protocolHandler);
      protocolIngressDisposables.add(protocolHandler.onDidChangeConnectionCount((count) => connectionCountEmitter.fire(count)));
      logService.info(`[AgentHost] Dynamic WebSocket server listening on ${socketPath}`);
      dynamicSocketInfo = { socketPath };
      return dynamicSocketInfo;
    },
    async getInspectInfo(tryEnable) {
      let url2 = inspector.url();
      if (!url2 && tryEnable) {
        try {
          inspector.open(0, "127.0.0.1", false);
        } catch (err) {
          logService.error("[AgentHost] Failed to open inspector", err);
          return void 0;
        }
        url2 = inspector.url();
      }
      if (!url2) {
        return void 0;
      }
      try {
        const parsedUrl = new URL(url2);
        if (parsedUrl.protocol !== "ws:") {
          logService.warn(`[AgentHost] Unexpected inspector URL: ${url2}`);
          return void 0;
        }
        const port = Number(parsedUrl.port);
        const auth = parsedUrl.pathname.replace(/^\/+/, "");
        if (!Number.isInteger(port) || !auth) {
          logService.warn(`[AgentHost] Unexpected inspector URL: ${url2}`);
          return void 0;
        }
        const host = parsedUrl.hostname === "0.0.0.0" ? "127.0.0.1" : parsedUrl.hostname === "::" ? "::1" : parsedUrl.hostname;
        const devtoolsHost = host.includes(":") ? `[${host}]` : host;
        return {
          host,
          port,
          devtoolsUrl: `devtools://devtools/bundled/js_app.html?v8only=true&ws=${devtoolsHost}:${parsedUrl.port}/${auth}`
        };
      } catch {
        logService.warn(`[AgentHost] Unexpected inspector URL: ${url2}`);
        return void 0;
      }
    }
  };
  server.registerChannel("agentHostManagement" /* Management */, ProxyChannel.fromService(instantiationService.createInstance(
    AgentHostManagementService,
    agentService,
    connectionTrackerService,
    async () => {
      protocolIngressDisposables.dispose();
      await Promise.all(protocolHandlers.map((handler) => handler.whenIdle()));
    }
  ), disposables));
  if (!(server instanceof Server2)) {
    server.registerChannel("agentHostConnectionTracker" /* ConnectionTracker */, ProxyChannel.fromService(connectionTrackerService, disposables));
  }
  const configuredWebSocketServerStart = startWebSocketServer(
    agentService,
    stateManager,
    completionTriggerCharacters,
    clientFileSystemProvider,
    instantiationService,
    environmentService.logsHome,
    logService,
    otlpLogEmitter,
    protocolIngressDisposables,
    hostLaunchKind,
    (count) => connectionCountEmitter.fire(count),
    (handler) => protocolHandlers.push(handler)
  );
  configuredWebSocketServer.settleWith(configuredWebSocketServerStart);
  void configuredWebSocketServerStart.catch((err) => {
    logService.error("Failed to start WebSocket server", err);
  }).finally(() => {
    agentService.markStartupComplete();
  });
  process.once("exit", () => {
    disposables.dispose();
    logService.dispose();
  });
}

async function startLocalAgentHostEndpoint(userDataPath, logService, instantiationService, logsHome) {
  let metadata;
  let server;
  try {
    const endpointMetadata = createLocalAgentHostEndpointMetadata(userDataPath);
    metadata = endpointMetadata;
    await prepareLocalAgentHostEndpointMetadataDirectory(userDataPath);
    if (!isWindows) {
      await prepareLocalAgentHostEndpointSocketDirectory(userDataPath);
    }
    server = await WebSocketProtocolServer.create(
      {
        socketPath: endpointMetadata.endpoint.path,
        connectionTokenValidate: (token) => token === endpointMetadata.connectionToken
      },
      logService,
      { instantiationService, logsHome }
    );
    await server.whenListening;
    return { metadata: endpointMetadata, server };
  } catch (error) {
    try {
      server?.dispose();
    } catch (disposeError) {
      logService.error("[AgentHost] Failed to dispose local protocol endpoint", disposeError);
    }
    if (metadata) {
      cleanupLocalAgentHostEndpoint(userDataPath, metadata, logService);
    }
    logService.error("[AgentHost] Failed to start local protocol endpoint; continuing with MessagePort only", error);
    return void 0;
  }
}

function cleanupLocalAgentHostEndpoint(userDataPath, metadata, logService) {
  try {
    cleanupLocalAgentHostEndpointMetadataSync(userDataPath, metadata, logService);
  } catch (error) {
    logService.error("[AgentHost] Failed to clean up local protocol metadata", error);
  }
  try {
    cleanupLocalAgentHostEndpointSocketSync(metadata.endpoint.path);
  } catch (error) {
    logService.error("[AgentHost] Failed to clean up local protocol socket", error);
  }
}

async function startWebSocketServer(agentService, stateManager, completionTriggerCharacters, clientFileSystemProvider, instantiationService, logsHome, logService, otlpLogEmitter, disposables, hostLaunchKind, onConnectionCountChanged, onProtocolHandlerCreated) {
  const port = process.env["VSCODE_AGENT_HOST_PORT"];
  const socketPath = process.env["VSCODE_AGENT_HOST_SOCKET_PATH"];
  if (!port && !socketPath) {
    return;
  }
  const connectionToken = process.env["VSCODE_AGENT_HOST_CONNECTION_TOKEN"];
  const host = process.env["VSCODE_AGENT_HOST_HOST"] || "localhost";
  const wsServer = await WebSocketProtocolServer.create(
    socketPath ? {
      socketPath,
      connectionTokenValidate: connectionToken ? (token) => token === connectionToken : void 0
    } : {
      port: parseInt(port, 10),
      host,
      connectionTokenValidate: connectionToken ? (token) => token === connectionToken : void 0
    },
    logService,
    { instantiationService, logsHome }
  );
  if (disposables.isDisposed) {
    wsServer.dispose();
    return;
  }
  disposables.add(wsServer);
  const protocolHandler = disposables.add(instantiationService.createInstance(
    ProtocolServerHandler,
    agentService,
    stateManager,
    wsServer,
    {
      hostLaunchKind,
      defaultDirectory: URI.file(os9.homedir()).toString(),
      completionTriggerCharacters,
      terminalCommandPrefix: BANG_COMMAND_PREFIX,
      otlpLogEmitter
    },
    clientFileSystemProvider
  ));
  onProtocolHandlerCreated(protocolHandler);
  disposables.add(protocolHandler.onDidChangeConnectionCount(onConnectionCountChanged));
  await wsServer.whenListening;
  const listenTarget = socketPath ?? `${host}:${wsServer.boundPort ?? port}`;
  logService.info(`[AgentHost] WebSocket server listening on ${listenTarget}`);
  console.log(`Agent host server listening on ${listenTarget}`);
}
export { startAgentHost, startLocalAgentHostEndpoint, cleanupLocalAgentHostEndpoint, startWebSocketServer, os9, inspector };
