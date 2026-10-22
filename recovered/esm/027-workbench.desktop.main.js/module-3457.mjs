// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/relauncher/browser/relauncher.contribution.ts
import { Disposable, dispose, toDisposable } from "./module-0012.mjs";
import { isLinux, isMacintosh, isNative } from "./module-0014.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHostService } from "./module-1117.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IUserDataSyncEnablementService, IUserDataSyncService } from "./module-1696.mjs";
import { IUserDataSyncWorkbenchService } from "./module-1744.mjs";
import { IProductService } from "./module-0873.mjs";
import { IDialogService } from "./module-0267.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions10 } from "./module-0870.mjs";


// src/vs/workbench/contrib/relauncher/browser/relauncher.contribution.ts
var SettingsChangeRelauncher = class extends Disposable {
  constructor(hostService, configurationService, userDataSyncService, userDataSyncEnablementService, userDataSyncWorkbenchService, productService, dialogService) {
    super();
    this.hostService = hostService;
    this.configurationService = configurationService;
    this.userDataSyncService = userDataSyncService;
    this.userDataSyncEnablementService = userDataSyncEnablementService;
    this.productService = productService;
    this.dialogService = dialogService;
    this.titleBarStyle = new ChangeObserver("string");
    this.menuStyle = new ChangeObserver("string");
    this.nativeTabs = new ChangeObserver("boolean");
    this.nativeFullScreen = new ChangeObserver("boolean");
    this.clickThroughInactive = new ChangeObserver("boolean");
    this.controlsStyle = new ChangeObserver("string");
    this.workspaceTrustEnabled = new ChangeObserver("boolean");
    this.experimentsEnabled = new ChangeObserver("boolean");
    this.enablePPEExtensionsGallery = new ChangeObserver("boolean");
    this.restrictUNCAccess = new ChangeObserver("boolean");
    this.accessibilityVerbosityDebug = new ChangeObserver("boolean");
    this.telemetryFeedbackEnabled = new ChangeObserver("boolean");
    this.extensionUnificationEnabled = new ChangeObserver("boolean");
    this.agentSessionsMigrateLegacyCopilotCli = new ChangeObserver("boolean");
    this.agentHostClaudeAgentEnabled = new ChangeObserver("boolean");
    this.editorCodexPreferAgentHost = new ChangeObserver("boolean");
    this.agentHostOTelEnabled = new ChangeObserver("boolean");
    this.agentHostOTelExporterType = new ChangeObserver("string");
    this.agentHostOTelOtlpEndpoint = new ChangeObserver("string");
    this.agentHostOTelCaptureContent = new ChangeObserver("boolean");
    this.agentHostOTelOutfile = new ChangeObserver("string");
    this.agentHostOTelDbSpanExporterEnabled = new ChangeObserver("boolean");
    this.update(false);
    this._register(this.configurationService.onDidChangeConfiguration((e) => this.onConfigurationChange(e)));
    this._register(userDataSyncWorkbenchService.onDidTurnOnSync((e) => this.update(true)));
  }
  static {
    this.SETTINGS = [
      "window.titleBarStyle" /* TITLE_BAR_STYLE */,
      "window.menuStyle" /* MenuStyle */,
      "window.nativeTabs",
      "window.nativeFullScreen",
      "window.clickThroughInactive",
      "window.controlsStyle",
      "editor.accessibilitySupport",
      "security.workspace.trust.enabled",
      "workbench.enableExperiments",
      "_extensionsGallery.enablePPE",
      "security.restrictUNCAccess",
      "accessibility.verbosity.debug",
      "telemetry.feedback.enabled",
      "chat.extensionUnification.enabled",
      "chat.agentSessions.migrateLegacyCopilotCli",
      "chat.agentHost.claudeAgent.enabled",
      "chat.editor.codex.preferAgentHost",
      "chat.agentHost.otel.enabled",
      "chat.agentHost.otel.exporterType",
      "chat.agentHost.otel.otlpEndpoint",
      "chat.agentHost.otel.captureContent",
      "chat.agentHost.otel.outfile",
      "chat.agentHost.otel.dbSpanExporter.enabled"
    ];
  }
  onConfigurationChange(e) {
    if (e && !SettingsChangeRelauncher.SETTINGS.some((key3) => e.affectsConfiguration(key3))) {
      return;
    }
    if (this.isTurningOnSyncInProgress()) {
      return;
    }
    this.update(
      e.source !== 7 /* DEFAULT */
      /* do not ask to relaunch if defaults changed */
    );
  }
  isTurningOnSyncInProgress() {
    return !this.userDataSyncEnablementService.isEnabled() && this.userDataSyncService.status === "syncing" /* Syncing */;
  }
  update(askToRelaunch) {
    let changed = false;
    function processChanged(didChange) {
      changed = changed || didChange;
    }
    const config = this.configurationService.getValue();
    if (isNative) {
      processChanged((config.window.titleBarStyle === "native" /* NATIVE */ || config.window.titleBarStyle === "custom" /* CUSTOM */) && this.titleBarStyle.handleChange(config.window?.titleBarStyle));
      processChanged(!isMacintosh && this.menuStyle.handleChange(config.window?.menuStyle));
      processChanged(isMacintosh && this.nativeTabs.handleChange(config.window?.nativeTabs));
      processChanged(isMacintosh && this.nativeFullScreen.handleChange(config.window?.nativeFullScreen));
      processChanged(isMacintosh && this.clickThroughInactive.handleChange(config.window?.clickThroughInactive));
      processChanged(!isMacintosh && this.controlsStyle.handleChange(config.window?.controlsStyle));
      if (isLinux && typeof config.editor?.accessibilitySupport === "string" && config.editor.accessibilitySupport !== this.accessibilitySupport) {
        this.accessibilitySupport = config.editor.accessibilitySupport;
        if (this.accessibilitySupport === "on") {
          changed = true;
        }
      }
      processChanged(this.workspaceTrustEnabled.handleChange(config?.security?.workspace?.trust?.enabled));
      processChanged(this.restrictUNCAccess.handleChange(config?.security?.restrictUNCAccess));
      processChanged(this.accessibilityVerbosityDebug.handleChange(config?.accessibility?.verbosity?.debug));
    }
    processChanged(this.experimentsEnabled.handleChange(config.workbench?.enableExperiments));
    processChanged(this.productService.quality !== "stable" && this.enablePPEExtensionsGallery.handleChange(config._extensionsGallery?.enablePPE));
    processChanged(this.telemetryFeedbackEnabled.handleChange(config.telemetry?.feedback?.enabled));
    processChanged(this.extensionUnificationEnabled.handleChange(config.chat?.extensionUnification?.enabled) && config.chat?.extensionUnification?.enabled === true);
    processChanged(this.agentHostClaudeAgentEnabled.handleChange(config.chat?.agentHost?.claudeAgent?.enabled));
    processChanged(this.editorCodexPreferAgentHost.handleChange(config.chat?.editor?.codex?.preferAgentHost));
    processChanged(this.agentSessionsMigrateLegacyCopilotCli.handleChange(config.chat?.agentSessions?.migrateLegacyCopilotCli));
    processChanged(this.agentHostOTelEnabled.handleChange(config.chat?.agentHost?.otel?.enabled));
    processChanged(this.agentHostOTelExporterType.handleChange(config.chat?.agentHost?.otel?.exporterType));
    processChanged(this.agentHostOTelOtlpEndpoint.handleChange(config.chat?.agentHost?.otel?.otlpEndpoint));
    processChanged(this.agentHostOTelCaptureContent.handleChange(config.chat?.agentHost?.otel?.captureContent));
    processChanged(this.agentHostOTelOutfile.handleChange(config.chat?.agentHost?.otel?.outfile));
    processChanged(this.agentHostOTelDbSpanExporterEnabled.handleChange(config.chat?.agentHost?.otel?.dbSpanExporter?.enabled));
    if (askToRelaunch && changed && this.hostService.hasFocus) {
      this.doConfirm(
        isNative ? localize(18455, null) : localize(18456, null),
        isNative ? localize(18453, null, this.productService.nameLong) : localize(18454, null, this.productService.nameLong),
        isNative ? localize(18457, null) : localize(18459, null),
        () => this.hostService.restart()
      );
    }
  }
  async doConfirm(message, detail2, primaryButton, confirmedFn) {
    const { confirmed } = await this.dialogService.confirm({ message, detail: detail2, primaryButton });
    if (confirmed) {
      confirmedFn();
    }
  }
};

SettingsChangeRelauncher = __decorateClass([
  __decorateParam(0, IHostService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IUserDataSyncService),
  __decorateParam(3, IUserDataSyncEnablementService),
  __decorateParam(4, IUserDataSyncWorkbenchService),
  __decorateParam(5, IProductService),
  __decorateParam(6, IDialogService)
], SettingsChangeRelauncher);

var ChangeObserver = class _ChangeObserver {
  constructor(typeName) {
    this.typeName = typeName;
    this.lastValue = void 0;
  }
  static create(typeName) {
    return new _ChangeObserver(typeName);
  }
  /**
   * Returns if there was a change compared to the last value
   */
  handleChange(value2) {
    if (typeof value2 === this.typeName && value2 !== this.lastValue) {
      this.lastValue = value2;
      return true;
    }
    return false;
  }
};

var WorkspaceChangeExtHostRelauncher = class extends Disposable {
  constructor(contextService, extensionService, hostService, environmentService) {
    super();
    this.contextService = contextService;
    this.extensionHostRestarter = this._register(new RunOnceScheduler(async () => {
      if (!!environmentService.extensionTestsLocationURI) {
        return;
      }
      if (environmentService.isSessionsWindow) {
        return;
      }
      if (environmentService.remoteAuthority) {
        hostService.reload();
      } else if (isNative) {
        const stopped = await extensionService.stopExtensionHosts(localize(18458, null));
        if (stopped) {
          extensionService.startExtensionHosts();
        }
      }
    }, 10));
    this.contextService.getCompleteWorkspace().then((workspace) => {
      this.firstFolderResource = workspace.folders.length > 0 ? workspace.folders[0].uri : void 0;
      this.handleWorkbenchState();
      this._register(this.contextService.onDidChangeWorkbenchState(() => setTimeout(() => this.handleWorkbenchState())));
    });
    this._register(toDisposable(() => {
      this.onDidChangeWorkspaceFoldersUnbind?.dispose();
    }));
  }
  handleWorkbenchState() {
    if (this.contextService.getWorkbenchState() === 3 /* WORKSPACE */) {
      const workspace = this.contextService.getWorkspace();
      this.firstFolderResource = workspace.folders.length > 0 ? workspace.folders[0].uri : void 0;
      if (!this.onDidChangeWorkspaceFoldersUnbind) {
        this.onDidChangeWorkspaceFoldersUnbind = this.contextService.onDidChangeWorkspaceFolders(() => this.onDidChangeWorkspaceFolders());
      }
    } else {
      dispose(this.onDidChangeWorkspaceFoldersUnbind);
      this.onDidChangeWorkspaceFoldersUnbind = void 0;
    }
  }
  onDidChangeWorkspaceFolders() {
    const workspace = this.contextService.getWorkspace();
    const newFirstFolderResource = workspace.folders.length > 0 ? workspace.folders[0].uri : void 0;
    if (!isEqual2(this.firstFolderResource, newFirstFolderResource)) {
      this.firstFolderResource = newFirstFolderResource;
      this.extensionHostRestarter.schedule();
    }
  }
};

WorkspaceChangeExtHostRelauncher = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, IExtensionService),
  __decorateParam(2, IHostService),
  __decorateParam(3, IWorkbenchEnvironmentService)
], WorkspaceChangeExtHostRelauncher);

var workbenchRegistry3 = Registry.as(Extensions10.Workbench);

workbenchRegistry3.registerWorkbenchContribution(SettingsChangeRelauncher, 3 /* Restored */);

workbenchRegistry3.registerWorkbenchContribution(WorkspaceChangeExtHostRelauncher, 3 /* Restored */);
export { SettingsChangeRelauncher, ChangeObserver, WorkspaceChangeExtHostRelauncher, workbenchRegistry3 };
