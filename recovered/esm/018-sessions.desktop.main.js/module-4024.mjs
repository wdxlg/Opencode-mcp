// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/extensions/common/remoteExtensionHost.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { parseExtensionDevOptions } from "./module-1056.mjs";
import { isWeb, language } from "./module-0014.mjs";
import { Schemas } from "./module-0033.mjs";
import { connectRemoteAgentExtensionHost } from "./module-3268.mjs";
import { createMessageOfType, isMessageOfType } from "./module-4013.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { resolveEnabledApiProposalsFallbackExperiment } from "./module-0889.mjs";
import { isLoggingOnly } from "./module-0887.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IRemoteSocketFactoryService } from "./module-1233.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ILogService, ILoggerService } from "./module-0095.mjs";
import { ILabelService } from "./module-0641.mjs";
import { IRemoteAuthorityResolverService } from "./module-0896.mjs";
import { IExtensionHostDebugService } from "./module-2377.mjs";
import { IProductService } from "./module-0875.mjs";
import { ISignService } from "./module-3838.mjs";
import { IDefaultLogLevelsService } from "./module-1728.mjs";
import { IWorkbenchAssignmentService } from "./module-1222.mjs";


// src/vs/workbench/services/extensions/common/remoteExtensionHost.ts
var RemoteExtensionHost = class extends Disposable {
  constructor(runningLocation, _initDataProvider, remoteSocketFactoryService, _contextService, _environmentService, _telemetryService, _logService, _loggerService, _labelService, remoteAuthorityResolverService, _extensionHostDebugService, _productService, _signService, _defaultLogLevelsService, _workbenchAssignmentService) {
    super();
    this.runningLocation = runningLocation;
    this._initDataProvider = _initDataProvider;
    this.remoteSocketFactoryService = remoteSocketFactoryService;
    this._contextService = _contextService;
    this._environmentService = _environmentService;
    this._telemetryService = _telemetryService;
    this._logService = _logService;
    this._loggerService = _loggerService;
    this._labelService = _labelService;
    this.remoteAuthorityResolverService = remoteAuthorityResolverService;
    this._extensionHostDebugService = _extensionHostDebugService;
    this._productService = _productService;
    this._signService = _signService;
    this._defaultLogLevelsService = _defaultLogLevelsService;
    this._workbenchAssignmentService = _workbenchAssignmentService;
    this.pid = null;
    this.startup = 1 /* EagerAutoStart */;
    this.extensions = null;
    this._onExit = this._register(new Emitter());
    this.onExit = this._onExit.event;
    this._hasDisconnected = false;
    this.remoteAuthority = this._initDataProvider.remoteAuthority;
    this._protocol = null;
    this._hasLostConnection = false;
    this._terminating = false;
    const devOpts = parseExtensionDevOptions(this._environmentService);
    this._isExtensionDevHost = devOpts.isExtensionDevHost;
  }
  start() {
    const options3 = {
      commit: this._productService.commit,
      quality: this._productService.quality,
      addressProvider: {
        getAddress: async () => {
          const { authority } = await this.remoteAuthorityResolverService.resolveAuthority(this._initDataProvider.remoteAuthority);
          return { connectTo: authority.connectTo, connectionToken: authority.connectionToken };
        }
      },
      remoteSocketFactoryService: this.remoteSocketFactoryService,
      signService: this._signService,
      logService: this._logService,
      ipcLogger: null
    };
    return this.remoteAuthorityResolverService.resolveAuthority(this._initDataProvider.remoteAuthority).then((resolverResult) => {
      const startParams = {
        language,
        debugId: this._environmentService.debugExtensionHost.debugId,
        break: this._environmentService.debugExtensionHost.break,
        port: this._environmentService.debugExtensionHost.port,
        env: { ...this._environmentService.debugExtensionHost.env, ...resolverResult.options?.extensionHostEnv }
      };
      const extDevLocs = this._environmentService.extensionDevelopmentLocationURI;
      let debugOk = true;
      if (extDevLocs && extDevLocs.length > 0) {
        if (extDevLocs[0].scheme === Schemas.file) {
          debugOk = false;
        }
      }
      if (!debugOk) {
        startParams.break = false;
      }
      return connectRemoteAgentExtensionHost(options3, startParams).then((result) => {
        this._register(result);
        const { protocol, debugPort, reconnectionToken } = result;
        const isExtensionDevelopmentDebug = typeof debugPort === "number";
        if (debugOk && this._environmentService.isExtensionDevelopment && this._environmentService.debugExtensionHost.debugId && debugPort) {
          this._extensionHostDebugService.attachSession(this._environmentService.debugExtensionHost.debugId, debugPort, this._initDataProvider.remoteAuthority);
        }
        protocol.onDidDispose(() => {
          this._onExtHostConnectionLost(reconnectionToken);
        });
        protocol.onSocketClose(() => {
          if (this._isExtensionDevHost) {
            this._onExtHostConnectionLost(reconnectionToken);
          }
        });
        return new Promise((resolve3, reject) => {
          const handle2 = setTimeout(() => {
            reject("The remote extension host took longer than 60s to send its ready message.");
          }, 60 * 1e3);
          const disposable = protocol.onMessage((msg) => {
            if (isMessageOfType(msg, 1 /* Ready */)) {
              this._createExtHostInitData(isExtensionDevelopmentDebug).then((data) => {
                protocol.send(VSBuffer.fromString(JSON.stringify(data)));
              });
              return;
            }
            if (isMessageOfType(msg, 0 /* Initialized */)) {
              clearTimeout(handle2);
              disposable.dispose();
              this._protocol = protocol;
              resolve3(protocol);
              return;
            }
            console.error(`received unexpected message during handshake phase from the extension host: `, msg);
          });
        });
      });
    });
  }
  _onExtHostConnectionLost(reconnectionToken) {
    if (this._hasLostConnection) {
      return;
    }
    this._hasLostConnection = true;
    if (this._isExtensionDevHost && this._environmentService.debugExtensionHost.debugId) {
      this._extensionHostDebugService.close(this._environmentService.debugExtensionHost.debugId);
    }
    if (this._terminating) {
      return;
    }
    this._onExit.fire([0, reconnectionToken]);
  }
  async _createExtHostInitData(isExtensionDevelopmentDebug) {
    const remoteInitData = await this._initDataProvider.getInitData();
    this.extensions = remoteInitData.extensions;
    const workspace = this._contextService.getWorkspace();
    const enabledApiProposalsFallback = await resolveEnabledApiProposalsFallbackExperiment(this._workbenchAssignmentService, this._productService.quality);
    return {
      commit: this._productService.commit,
      version: this._productService.version,
      quality: this._productService.quality,
      date: this._productService.date,
      parentPid: remoteInitData.pid,
      enabledApiProposalsFallback,
      environment: {
        isExtensionDevelopmentDebug,
        appRoot: remoteInitData.appRoot,
        appName: this._productService.nameLong,
        appHost: this._productService.embedderIdentifier || "desktop",
        appUriScheme: this._productService.urlProtocol,
        isExtensionTelemetryLoggingOnly: isLoggingOnly(this._productService, this._environmentService),
        appLanguage: language,
        extensionDevelopmentLocationURI: this._environmentService.extensionDevelopmentLocationURI,
        extensionTestsLocationURI: this._environmentService.extensionTestsLocationURI,
        globalStorageHome: remoteInitData.globalStorageHome,
        workspaceStorageHome: remoteInitData.workspaceStorageHome,
        extensionLogLevel: this._defaultLogLevelsService.defaultLogLevels.extensions,
        isSessionsWindow: this._environmentService.isSessionsWindow
      },
      workspace: this._contextService.getWorkbenchState() === 1 /* EMPTY */ ? null : {
        configuration: workspace.configuration,
        id: workspace.id,
        name: this._labelService.getWorkspaceLabel(workspace),
        transient: workspace.transient
      },
      remote: {
        isRemote: true,
        authority: this._initDataProvider.remoteAuthority,
        connectionData: remoteInitData.connectionData
      },
      consoleForward: {
        includeStack: false,
        logNative: Boolean(this._environmentService.debugExtensionHost.debugId)
      },
      extensions: this.extensions.toSnapshot(),
      telemetryInfo: {
        sessionId: this._telemetryService.sessionId,
        machineId: this._telemetryService.machineId,
        sqmId: this._telemetryService.sqmId,
        devDeviceId: this._telemetryService.devDeviceId ?? this._telemetryService.machineId,
        firstSessionDate: this._telemetryService.firstSessionDate,
        msftInternal: this._telemetryService.msftInternal
      },
      remoteExtensionTips: this._productService.remoteExtensionTips,
      virtualWorkspaceExtensionTips: this._productService.virtualWorkspaceExtensionTips,
      logLevel: this._logService.getLevel(),
      loggers: [...this._loggerService.getRegisteredLoggers()],
      logsLocation: remoteInitData.extensionHostLogsPath,
      autoStart: this.startup === 1 /* EagerAutoStart */,
      uiKind: isWeb ? 2 /* Web */ : 1 /* Desktop */
    };
  }
  getInspectPort() {
    return void 0;
  }
  enableInspectPort() {
    return Promise.resolve(false);
  }
  async disconnect() {
    if (this._protocol && !this._hasDisconnected) {
      this._protocol.send(createMessageOfType(2 /* Terminate */));
      this._protocol.sendDisconnect();
      this._hasDisconnected = true;
      await this._protocol.drain();
    }
  }
  dispose() {
    super.dispose();
    this._terminating = true;
    this.disconnect();
    if (this._protocol) {
      this._protocol.getSocket().end();
      this._protocol = null;
    }
  }
};

RemoteExtensionHost = __decorateClass([
  __decorateParam(2, IRemoteSocketFactoryService),
  __decorateParam(3, IWorkspaceContextService),
  __decorateParam(4, IWorkbenchEnvironmentService),
  __decorateParam(5, ITelemetryService),
  __decorateParam(6, ILogService),
  __decorateParam(7, ILoggerService),
  __decorateParam(8, ILabelService),
  __decorateParam(9, IRemoteAuthorityResolverService),
  __decorateParam(10, IExtensionHostDebugService),
  __decorateParam(11, IProductService),
  __decorateParam(12, ISignService),
  __decorateParam(13, IDefaultLogLevelsService),
  __decorateParam(14, IWorkbenchAssignmentService)
], RemoteExtensionHost);
export { RemoteExtensionHost };
