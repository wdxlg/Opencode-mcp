// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/tasks/electron-browser/taskService.ts
import { AbstractTaskService } from "./module-3265.mjs";
import { satisfies } from "./module-1045.mjs";
import { TerminalTaskSystem } from "./module-3263.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IMarkerService } from "./module-0560.mjs";
import { IOutputService } from "./module-1245.mjs";
import { IPaneCompositePartService } from "./module-1093.mjs";
import { IViewsService } from "./module-1246.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IFileService } from "./module-0269.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { IModelService } from "./module-0080.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IConfigurationResolverService } from "./module-1404.mjs";
import { ITerminalGroupService, ITerminalService } from "./module-1150.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IDialogService } from "./module-0267.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { ITerminalProfileResolverService } from "./module-1174.mjs";
import { IPathService } from "./module-0939.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IPreferencesService } from "./module-1293.mjs";
import { IViewDescriptorService } from "./module-1094.mjs";
import { IWorkspaceTrustManagementService, IWorkspaceTrustRequestService } from "./module-0854.mjs";
import { ILogService } from "./module-0095.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { IAccessibilitySignalService } from "./module-0445.mjs";
import { IChatService } from "./module-0973.mjs";
import { IChatAgentService } from "./module-0975.mjs";
import { IHostService } from "./module-1118.mjs";
import { registerSingleton } from "./module-0135.mjs";
import { ITaskService } from "./module-1403.mjs";


// src/vs/workbench/contrib/tasks/electron-browser/taskService.ts
var TaskService = class extends AbstractTaskService {
  constructor(configurationService, markerService, outputService, paneCompositeService, viewsService, commandService, editorService, fileService, contextService, telemetryService, textFileService, lifecycleService, modelService, extensionService, quickInputService, configurationResolverService, terminalService, terminalGroupService, storageService, progressService, openerService, dialogService, notificationService, contextKeyService, environmentService, terminalProfileResolverService, pathService, textModelResolverService, preferencesService, viewDescriptorService, workspaceTrustRequestService, workspaceTrustManagementService, logService, themeService, instantiationService, remoteAgentService, accessibilitySignalService, _chatService, _chatAgentService, _hostService) {
    super(
      configurationService,
      markerService,
      outputService,
      paneCompositeService,
      viewsService,
      commandService,
      editorService,
      fileService,
      contextService,
      telemetryService,
      textFileService,
      modelService,
      extensionService,
      quickInputService,
      configurationResolverService,
      terminalService,
      terminalGroupService,
      storageService,
      progressService,
      openerService,
      dialogService,
      notificationService,
      contextKeyService,
      environmentService,
      terminalProfileResolverService,
      pathService,
      textModelResolverService,
      preferencesService,
      viewDescriptorService,
      workspaceTrustRequestService,
      workspaceTrustManagementService,
      logService,
      themeService,
      lifecycleService,
      remoteAgentService,
      instantiationService,
      _chatService,
      _chatAgentService,
      _hostService
    );
    this._register(lifecycleService.onBeforeShutdown((event) => event.veto(this.beforeShutdown(), "veto.tasks")));
  }
  _getTaskSystem() {
    if (this._taskSystem) {
      return this._taskSystem;
    }
    const taskSystem = this._createTerminalTaskSystem();
    this._taskSystem = taskSystem;
    this._taskSystemListeners = [
      this._taskSystem.onDidStateChange((event) => {
        this._taskRunningState.set(this._taskSystem.isActiveSync());
        this._onDidStateChange.fire(event);
      })
    ];
    return this._taskSystem;
  }
  _computeLegacyConfiguration(workspaceFolder) {
    const { config, hasParseErrors } = this._getConfiguration(workspaceFolder);
    if (hasParseErrors) {
      return Promise.resolve({ workspaceFolder, hasErrors: true, config: void 0 });
    }
    if (config) {
      return Promise.resolve({ workspaceFolder, config, hasErrors: false });
    } else {
      return Promise.resolve({ workspaceFolder, hasErrors: true, config: void 0 });
    }
  }
  _versionAndEngineCompatible(filter2) {
    const range2 = filter2 && filter2.version ? filter2.version : void 0;
    const engine = this.executionEngine;
    return range2 === void 0 || (satisfies("0.1.0", range2) && engine === 1 /* Process */ || satisfies("2.0.0", range2) && engine === 2 /* Terminal */);
  }
  beforeShutdown() {
    if (!this._taskSystem) {
      return false;
    }
    if (!this._taskSystem.isActiveSync()) {
      return false;
    }
    if (this._taskSystem instanceof TerminalTaskSystem) {
      return false;
    }
    let terminatePromise;
    if (this._taskSystem.canAutoTerminate()) {
      terminatePromise = Promise.resolve({ confirmed: true });
    } else {
      terminatePromise = this._dialogService.confirm({
        message: localize(19903, null),
        primaryButton: localize(19904, null)
      });
    }
    return terminatePromise.then((res) => {
      if (res.confirmed) {
        return this._taskSystem.terminateAll().then((responses) => {
          let success = true;
          let code = void 0;
          for (const response of responses) {
            success = success && response.success;
            if (code === void 0 && response.code !== void 0) {
              code = response.code;
            }
          }
          if (success) {
            this._taskSystem = void 0;
            this._disposeTaskSystemListeners();
            return false;
          } else if (code && code === 3 /* ProcessNotFound */) {
            return this._dialogService.confirm({
              message: localize(19902, null),
              primaryButton: localize(19901, null),
              type: "info"
            }).then((res2) => !res2.confirmed);
          }
          return true;
        }, (err) => {
          return true;
        });
      }
      return true;
    });
  }
};

TaskService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IMarkerService),
  __decorateParam(2, IOutputService),
  __decorateParam(3, IPaneCompositePartService),
  __decorateParam(4, IViewsService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, IEditorService),
  __decorateParam(7, IFileService),
  __decorateParam(8, IWorkspaceContextService),
  __decorateParam(9, ITelemetryService),
  __decorateParam(10, ITextFileService),
  __decorateParam(11, ILifecycleService),
  __decorateParam(12, IModelService),
  __decorateParam(13, IExtensionService),
  __decorateParam(14, IQuickInputService),
  __decorateParam(15, IConfigurationResolverService),
  __decorateParam(16, ITerminalService),
  __decorateParam(17, ITerminalGroupService),
  __decorateParam(18, IStorageService),
  __decorateParam(19, IProgressService),
  __decorateParam(20, IOpenerService),
  __decorateParam(21, IDialogService),
  __decorateParam(22, INotificationService),
  __decorateParam(23, IContextKeyService),
  __decorateParam(24, IWorkbenchEnvironmentService),
  __decorateParam(25, ITerminalProfileResolverService),
  __decorateParam(26, IPathService),
  __decorateParam(27, ITextModelService),
  __decorateParam(28, IPreferencesService),
  __decorateParam(29, IViewDescriptorService),
  __decorateParam(30, IWorkspaceTrustRequestService),
  __decorateParam(31, IWorkspaceTrustManagementService),
  __decorateParam(32, ILogService),
  __decorateParam(33, IThemeService),
  __decorateParam(34, IInstantiationService),
  __decorateParam(35, IRemoteAgentService),
  __decorateParam(36, IAccessibilitySignalService),
  __decorateParam(37, IChatService),
  __decorateParam(38, IChatAgentService),
  __decorateParam(39, IHostService)
], TaskService);

registerSingleton(ITaskService, TaskService, 1 /* Delayed */);
export { TaskService };
