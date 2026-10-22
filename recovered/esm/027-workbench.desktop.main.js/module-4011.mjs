// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/remote/electron-browser/remote.contribution.ts
import { ipcRenderer } from "./module-3724.mjs";
import { Schemas } from "./module-0033.mjs";
import { IRemoteAgentService, remoteConnectionLatencyMeasurer } from "./module-0937.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILabelService } from "./module-0641.mjs";
import { Disposable } from "./module-0012.mjs";
import { IRemoteAuthorityResolverService } from "./module-0894.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { ITelemetryService, TELEMETRY_CRASH_REPORTER_SETTING_ID, TELEMETRY_OLD_SETTING_ID, TELEMETRY_SETTING_ID } from "./module-0093.mjs";
import { getTelemetryLevel } from "./module-0885.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3727.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10, WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { isMacintosh, isWindows } from "./module-0014.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { OpenLocalFileCommand, OpenLocalFileFolderCommand, OpenLocalFolderCommand, RemoteFileDialogContext, SaveLocalFileCommand } from "./module-3788.mjs";
import { KeyChord } from "./module-0019.mjs";
import { Action2, MenuId, registerAction2 } from "./module-0092.mjs";
import { IRemoteExplorerService, PORT_AUTO_SOURCE_SETTING, PORT_AUTO_SOURCE_SETTING_OUTPUT } from "./module-1414.mjs";
import { RemoteNameContext } from "./module-0949.mjs";


// src/vs/workbench/contrib/remote/electron-browser/remote.contribution.ts
var RemoteAgentDiagnosticListener = class {
  constructor(remoteAgentService, labelService) {
    ipcRenderer.on("vscode:getDiagnosticInfo", (event, ...args2) => {
      const request2 = args2[0];
      const connection = remoteAgentService.getConnection();
      if (connection) {
        const hostName = labelService.getHostLabel(Schemas.vscodeRemote, connection.remoteAuthority);
        remoteAgentService.getDiagnosticInfo(request2.args).then((info) => {
          if (info) {
            info.hostName = hostName;
            if (remoteConnectionLatencyMeasurer.latency?.high) {
              info.latency = {
                average: remoteConnectionLatencyMeasurer.latency.average,
                current: remoteConnectionLatencyMeasurer.latency.current
              };
            }
          }
          ipcRenderer.send(request2.replyChannel, info);
        }).catch((e) => {
          const errorMessage = e && e.message ? `Connection to '${hostName}' could not be established  ${e.message}` : `Connection to '${hostName}' could not be established `;
          ipcRenderer.send(request2.replyChannel, { hostName, errorMessage });
        });
      } else {
        ipcRenderer.send(request2.replyChannel);
      }
    });
  }
};

RemoteAgentDiagnosticListener = __decorateClass([
  __decorateParam(0, IRemoteAgentService),
  __decorateParam(1, ILabelService)
], RemoteAgentDiagnosticListener);

var RemoteExtensionHostEnvironmentUpdater = class extends Disposable {
  constructor(remoteAgentService, remoteResolverService, extensionService) {
    super();
    const connection = remoteAgentService.getConnection();
    if (connection) {
      this._register(connection.onDidStateChange(async (e) => {
        if (e.type === 4 /* ConnectionGain */) {
          const resolveResult = await remoteResolverService.resolveAuthority(connection.remoteAuthority);
          if (resolveResult.options && resolveResult.options.extensionHostEnv) {
            await extensionService.setRemoteEnvironment(resolveResult.options.extensionHostEnv);
          }
        }
      }));
    }
  }
};

RemoteExtensionHostEnvironmentUpdater = __decorateClass([
  __decorateParam(0, IRemoteAgentService),
  __decorateParam(1, IRemoteAuthorityResolverService),
  __decorateParam(2, IExtensionService)
], RemoteExtensionHostEnvironmentUpdater);

var RemoteTelemetryEnablementUpdater = class extends Disposable {
  constructor(remoteAgentService, configurationService, telemetryService) {
    super();
    this.remoteAgentService = remoteAgentService;
    this.configurationService = configurationService;
    this.telemetryService = telemetryService;
    this.updateRemoteTelemetryEnablement();
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(TELEMETRY_SETTING_ID) || e.affectsConfiguration(TELEMETRY_OLD_SETTING_ID) || e.affectsConfiguration(TELEMETRY_CRASH_REPORTER_SETTING_ID)) {
        this.updateRemoteTelemetryEnablement();
      }
    }));
  }
  static {
    this.ID = "workbench.contrib.remoteTelemetryEnablementUpdater";
  }
  updateRemoteTelemetryEnablement() {
    return this.remoteAgentService.updateTelemetryLevel(Math.min(getTelemetryLevel(this.configurationService), this.telemetryService.telemetryLevel));
  }
};

RemoteTelemetryEnablementUpdater = __decorateClass([
  __decorateParam(0, IRemoteAgentService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ITelemetryService)
], RemoteTelemetryEnablementUpdater);

var RemoteEmptyWorkbenchPresentation = class extends Disposable {
  static {
    this.ID = "workbench.contrib.remoteEmptyWorkbenchPresentation";
  }
  constructor(environmentService, remoteAuthorityResolverService, configurationService, commandService, contextService) {
    super();
    function shouldShowExplorer() {
      const startupEditor = configurationService.getValue("workbench.startupEditor");
      return startupEditor !== "welcomePage" && startupEditor !== "welcomePageInEmptyWorkbench";
    }
    function shouldShowTerminal() {
      return shouldShowExplorer();
    }
    const { remoteAuthority, filesToDiff, filesToMerge, filesToOpenOrCreate, filesToWait } = environmentService;
    if (remoteAuthority && contextService.getWorkbenchState() === 1 /* EMPTY */ && !filesToDiff?.length && !filesToMerge?.length && !filesToOpenOrCreate?.length && !filesToWait) {
      remoteAuthorityResolverService.resolveAuthority(remoteAuthority).then(() => {
        if (shouldShowExplorer()) {
          commandService.executeCommand("workbench.view.explorer");
        }
        if (shouldShowTerminal()) {
          commandService.executeCommand("workbench.action.terminal.toggleTerminal");
        }
      });
    }
  }
};

RemoteEmptyWorkbenchPresentation = __decorateClass([
  __decorateParam(0, INativeWorkbenchEnvironmentService),
  __decorateParam(1, IRemoteAuthorityResolverService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, IWorkspaceContextService)
], RemoteEmptyWorkbenchPresentation);

var WSLContextKeyInitializer = class extends Disposable {
  static {
    this.ID = "workbench.contrib.wslContextKeyInitializer";
  }
  constructor(contextKeyService, nativeHostService, storageService, lifecycleService) {
    super();
    const contextKeyId = "wslFeatureInstalled";
    const storageKey = "remote.wslFeatureInstalled";
    const defaultValue = storageService.getBoolean(storageKey, -1 /* APPLICATION */, void 0);
    const hasWSLFeatureContext = new RawContextKey(contextKeyId, !!defaultValue, localize(18647, null));
    const contextKey = hasWSLFeatureContext.bindTo(contextKeyService);
    if (defaultValue === void 0) {
      lifecycleService.when(4 /* Eventually */).then(async () => {
        nativeHostService.hasWSLFeatureInstalled().then((res) => {
          if (res) {
            contextKey.set(true);
            storageService.store(storageKey, true, -1 /* APPLICATION */, 1 /* MACHINE */);
          }
        });
      });
    }
  }
};

WSLContextKeyInitializer = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, INativeHostService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, ILifecycleService)
], WSLContextKeyInitializer);

var workbenchContributionsRegistry9 = Registry.as(Extensions10.Workbench);

workbenchContributionsRegistry9.registerWorkbenchContribution(RemoteAgentDiagnosticListener, 4 /* Eventually */);

workbenchContributionsRegistry9.registerWorkbenchContribution(RemoteExtensionHostEnvironmentUpdater, 4 /* Eventually */);

registerWorkbenchContribution2(RemoteTelemetryEnablementUpdater.ID, RemoteTelemetryEnablementUpdater, WorkbenchPhase.BlockRestore);

registerWorkbenchContribution2(RemoteEmptyWorkbenchPresentation.ID, RemoteEmptyWorkbenchPresentation, WorkbenchPhase.BlockRestore);

if (isWindows) {
  registerWorkbenchContribution2(WSLContextKeyInitializer.ID, WSLContextKeyInitializer, WorkbenchPhase.BlockRestore);
}

Registry.as(Extensions4.Configuration).registerConfiguration({
  id: "remote",
  title: localize(18643, null),
  type: "object",
  properties: {
    "remote.downloadExtensionsLocally": {
      type: "boolean",
      markdownDescription: localize(18646, null),
      default: false
    }
  }
});

if (isMacintosh) {
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: OpenLocalFileFolderCommand.ID,
    weight: 200 /* WorkbenchContrib */,
    primary: 2048 /* CtrlCmd */ | 45 /* KeyO */,
    when: RemoteFileDialogContext,
    metadata: { description: OpenLocalFileFolderCommand.LABEL, args: [] },
    handler: OpenLocalFileFolderCommand.handler()
  });
} else {
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: OpenLocalFileCommand.ID,
    weight: 200 /* WorkbenchContrib */,
    primary: 2048 /* CtrlCmd */ | 45 /* KeyO */,
    when: RemoteFileDialogContext,
    metadata: { description: OpenLocalFileCommand.LABEL, args: [] },
    handler: OpenLocalFileCommand.handler()
  });
  KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: OpenLocalFolderCommand.ID,
    weight: 200 /* WorkbenchContrib */,
    primary: KeyChord(2048 /* CtrlCmd */ | 41 /* KeyK */, 2048 /* CtrlCmd */ | 45 /* KeyO */),
    when: RemoteFileDialogContext,
    metadata: { description: OpenLocalFolderCommand.LABEL, args: [] },
    handler: OpenLocalFolderCommand.handler()
  });
}

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: SaveLocalFileCommand.ID,
  weight: 200 /* WorkbenchContrib */,
  primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 49 /* KeyS */,
  when: RemoteFileDialogContext,
  metadata: { description: SaveLocalFileCommand.LABEL, args: [] },
  handler: SaveLocalFileCommand.handler()
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: "workbench.remote.action.closeUnusedPorts",
      title: localize(18644, null),
      category: localize(18645, null),
      menu: [{
        id: MenuId.CommandPalette
      }],
      precondition: ContextKeyExpr.and(ContextKeyExpr.notEquals(`config.${PORT_AUTO_SOURCE_SETTING}`, PORT_AUTO_SOURCE_SETTING_OUTPUT), RemoteNameContext)
    });
  }
  async run(accessor) {
    const remoteExplorerService = accessor.get(IRemoteExplorerService);
    const ports = [];
    const forwarded = remoteExplorerService.tunnelModel.forwarded;
    for (const [_, tunnel] of forwarded) {
      if (tunnel.hasRunningProcess === false) {
        ports.push(tunnel);
      }
    }
    if (ports.length) {
      for (const port of ports) {
        await remoteExplorerService.close({
          host: port.remoteHost,
          port: port.remotePort
        }, "User" /* User */);
      }
    }
  }
});
export { RemoteAgentDiagnosticListener, RemoteExtensionHostEnvironmentUpdater, RemoteTelemetryEnablementUpdater, RemoteEmptyWorkbenchPresentation, WSLContextKeyInitializer, workbenchContributionsRegistry9 };
