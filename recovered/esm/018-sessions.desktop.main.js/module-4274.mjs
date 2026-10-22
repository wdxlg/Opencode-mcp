// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/remoteAgentHost/electron-browser/devContainerAgentHostConnector.contribution.ts
import { DevContainerAgentHostEnabledSettingId, IDevContainerAgentHostService } from "./module-4271.mjs";
import { localize } from "./module-0001.mjs";
import { RemoteAgentHostsEnabledSettingId, getEntryTypeConfig } from "./module-1736.mjs";
import { Schemas } from "./module-0033.mjs";
import { URI } from "./module-0032.mjs";
import { Disposable, combinedDisposable, toDisposable } from "./module-0012.mjs";
import { StringSHA1 } from "./module-0039.mjs";
import { basename2, getComparisonKey } from "./module-0034.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions15, IOutputService } from "./module-1245.mjs";
import { ProxyChannel } from "./module-1230.mjs";
import { DEV_CONTAINER_AGENT_HOST_CHANNEL } from "./module-4273.mjs";
import { generateUuid } from "./module-0190.mjs";
import { CancellationError } from "./module-0004.mjs";
import { NonReconnectableTransportError } from "./module-4045.mjs";
import { AgentHostAhpJsonlLoggingSettingId } from "./module-1108.mjs";
import { AhpJsonlLogger } from "./module-4048.mjs";
import { ReconnectingRelayTransport } from "./module-4238.mjs";
import { AgentHostProtocolClient } from "./module-4047.mjs";
import { agentsWindowAgentHostClientInfo } from "./module-4051.mjs";
import { AGENT_HOST_SCHEME, agentHostAuthority } from "./module-1001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISharedProcessService } from "./module-3826.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILogService } from "./module-0095.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IFileService } from "./module-0269.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";


// src/vs/sessions/contrib/providers/remoteAgentHost/electron-browser/devContainerAgentHostConnector.contribution.ts
function ensureDevContainerAgentHostsEnabled(configurationService) {
  if (!configurationService.getValue(DevContainerAgentHostEnabledSettingId)) {
    throw new Error(localize(5253, null));
  }
  if (!configurationService.getValue(RemoteAgentHostsEnabledSettingId)) {
    throw new Error(localize(5255, null));
  }
}

async function isDevContainerWorkspaceAvailable(workspaceUri, fileService, mainService, configurationService) {
  if (!configurationService.getValue(DevContainerAgentHostEnabledSettingId) || !configurationService.getValue(RemoteAgentHostsEnabledSettingId) || workspaceUri.scheme !== Schemas.file) {
    return false;
  }
  const hasConfiguration = await Promise.all([
    fileService.exists(URI.joinPath(workspaceUri, ".devcontainer", "devcontainer.json")),
    fileService.exists(URI.joinPath(workspaceUri, ".devcontainer.json"))
  ]);
  return hasConfiguration.some((exists) => exists) && await mainService.isDockerAvailable();
}

var DevContainerOutputWriter = class extends Disposable {
  constructor(mainService, connectionId, workspaceUri, _outputService) {
    super();
    this._outputService = _outputService;
    this._connectionIds = /* @__PURE__ */ new Set();
    this._connectionIds.add(connectionId);
    const sha = new StringSHA1();
    sha.update(getComparisonKey(workspaceUri));
    this._channelId = `devContainer.${sha.digest()}`;
    const registry4 = Registry.as(Extensions15.OutputChannels);
    if (!registry4.getChannel(this._channelId)) {
      registry4.registerChannel({
        id: this._channelId,
        label: localize(5256, null, basename2(workspaceUri)),
        log: false,
        languageId: "log"
      });
    }
    this._append(localize(5257, null, workspaceUri.fsPath));
    this._register(mainService.onDidOutput((output) => {
      if (this._connectionIds.has(output.connectionId)) {
        this._append(output.data);
      }
    }));
  }
  addConnection(connectionId) {
    this._connectionIds.add(connectionId);
  }
  removeConnection(connectionId) {
    this._connectionIds.delete(connectionId);
  }
  _append(value2) {
    this._outputService.getChannel(this._channelId)?.append(value2);
  }
};

var DevContainerAgentHostConnector = class {
  constructor(sharedProcessService, _instantiationService, _logService, _configurationService, _environmentService, _outputService, _fileService) {
    this._instantiationService = _instantiationService;
    this._logService = _logService;
    this._configurationService = _configurationService;
    this._environmentService = _environmentService;
    this._outputService = _outputService;
    this._fileService = _fileService;
    this._mainService = ProxyChannel.toService(
      sharedProcessService.getChannel(DEV_CONTAINER_AGENT_HOST_CHANNEL)
    );
  }
  async isAvailable(workspaceUri) {
    return isDevContainerWorkspaceAvailable(workspaceUri, this._fileService, this._mainService, this._configurationService);
  }
  async connect(workspaceUri, token) {
    ensureDevContainerAgentHostsEnabled(this._configurationService);
    if (workspaceUri.scheme !== Schemas.file) {
      throw new Error(localize(5254, null));
    }
    const connectionId = generateUuid();
    const workspaceFolder = workspaceUri.fsPath;
    const name = `${basename2(workspaceUri)} Dev Container`;
    const outputWriter = new DevContainerOutputWriter(this._mainService, connectionId, workspaceUri, this._outputService);
    const cancellationListener = token.onCancellationRequested(() => {
      void this._mainService.disconnect(connectionId).catch((error) => {
        this._logService.warn("[DevContainerAgentHostConnector] Failed to cancel connection", error);
      });
    });
    let protocolClient;
    try {
      const result = await this._mainService.connect({
        connectionId,
        workspaceFolder,
        name
      });
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      let seed = true;
      const establish = async () => {
        if (seed) {
          seed = false;
          return { connectionId };
        }
        try {
          ensureDevContainerAgentHostsEnabled(this._configurationService);
        } catch (error) {
          throw new NonReconnectableTransportError(error instanceof Error ? error.message : String(error));
        }
        if (!await this._fileService.exists(workspaceUri)) {
          throw new NonReconnectableTransportError("Dev Container workspace folder no longer exists.");
        }
        const reconnectConnectionId = generateUuid();
        outputWriter.addConnection(reconnectConnectionId);
        try {
          await this._mainService.connect({
            connectionId: reconnectConnectionId,
            workspaceFolder,
            name
          });
          return {
            connectionId: reconnectConnectionId,
            close: async () => {
              outputWriter.removeConnection(reconnectConnectionId);
              await this._mainService.disconnect(reconnectConnectionId);
            }
          };
        } catch (error) {
          outputWriter.removeConnection(reconnectConnectionId);
          if (error instanceof CancellationError) {
            throw new NonReconnectableTransportError("Dev Container Agent Host connection was cancelled.");
          }
          throw error;
        }
      };
      const transportFactory = () => {
        const createLogger = () => this._configurationService.getValue(AgentHostAhpJsonlLoggingSettingId) ? this._instantiationService.createInstance(AhpJsonlLogger, {
          logsHome: this._environmentService.logsHome,
          connectionId,
          transport: "devcontainer"
        }) : void 0;
        return new ReconnectingRelayTransport(
          establish,
          this._mainService,
          createLogger,
          this._logService,
          "[DevContainerRelayTransport]",
          "dev_container" /* DevContainer */
        );
      };
      protocolClient = this._instantiationService.createInstance(
        AgentHostProtocolClient,
        result.address,
        transportFactory,
        {
          clientInfo: agentsWindowAgentHostClientInfo,
          reconnectPolicy: getEntryTypeConfig("devContainer" /* DevContainer */).reconnect
        }
      );
      await protocolClient.connect();
      if (token.isCancellationRequested) {
        throw new CancellationError();
      }
      return {
        address: result.address,
        name: result.name,
        connection: protocolClient,
        transportDisposable: combinedDisposable(
          outputWriter,
          toDisposable(() => {
            void this._mainService.disconnect(connectionId).catch((error) => {
              this._logService.warn("[DevContainerAgentHostConnector] Failed to disconnect transport", error);
            });
          })
        ),
        workspaceUri: workspaceUri.with({
          scheme: AGENT_HOST_SCHEME,
          authority: agentHostAuthority(result.address),
          path: result.remoteWorkspaceFolder
        }),
        defaultDirectory: result.remoteWorkspaceFolder
      };
    } catch (error) {
      outputWriter.dispose();
      protocolClient?.dispose();
      await this._mainService.disconnect(connectionId);
      throw error;
    } finally {
      cancellationListener.dispose();
    }
  }
};

DevContainerAgentHostConnector = __decorateClass([
  __decorateParam(0, ISharedProcessService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ILogService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IEnvironmentService),
  __decorateParam(5, IOutputService),
  __decorateParam(6, IFileService)
], DevContainerAgentHostConnector);

var DevContainerAgentHostConnectorContribution = class extends Disposable {
  static {
    this.ID = "sessions.contrib.devContainerAgentHostConnector";
  }
  constructor(service, instantiationService) {
    super();
    this._register(service.registerConnector(instantiationService.createInstance(DevContainerAgentHostConnector)));
  }
};

DevContainerAgentHostConnectorContribution = __decorateClass([
  __decorateParam(0, IDevContainerAgentHostService),
  __decorateParam(1, IInstantiationService)
], DevContainerAgentHostConnectorContribution);

Registry.as(Extensions4.Configuration).registerConfiguration({
  properties: {
    [DevContainerAgentHostEnabledSettingId]: {
      type: "boolean",
      description: localize(5252, null),
      default: false,
      scope: 1 /* APPLICATION */,
      included: false
    }
  }
});

registerWorkbenchContribution2(
  DevContainerAgentHostConnectorContribution.ID,
  DevContainerAgentHostConnectorContribution,
  WorkbenchPhase.AfterRestored
);
export { ensureDevContainerAgentHostsEnabled, isDevContainerWorkspaceAvailable, DevContainerOutputWriter, DevContainerAgentHostConnector, DevContainerAgentHostConnectorContribution };
