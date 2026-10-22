// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/telemetry/browser/telemetry.contribution.ts
import { Disposable } from "./module-0012.mjs";
import { mainWindow } from "./module-0002.mjs";
import { language } from "./module-0014.mjs";
import { ErrorTelemetry } from "./module-1805.mjs";
import { TelemetryLogGroup, TelemetryTrustedValue, supportsTelemetry, telemetryLogId } from "./module-0887.mjs";
import { basename2, extname2, isEqual2, isEqualOrParent2 } from "./module-0034.mjs";
import { Schemas } from "./module-0033.mjs";
import { getMimeTypes } from "./module-1353.mjs";
import { hash } from "./module-0039.mjs";
import { Action2, registerAction2 } from "./module-0092.mjs";
import { localize2 } from "./module-0001.mjs";
import { Categories } from "./module-0847.mjs";
import { Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IWorkbenchThemeService } from "./module-0917.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IUserDataProfileService } from "./module-0998.mjs";
import { IPaneCompositePartService } from "./module-1093.mjs";
import { IProductService } from "./module-0875.mjs";
import { ILoggerService } from "./module-0095.mjs";
import { IOutputService } from "./module-1245.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { isBoolean, isNumber, isString } from "./module-0010.mjs";
import { ConfigurationTargetToString, IConfigurationService } from "./module-0132.mjs";
import { AutoRestartConfigurationKey, AutoUpdateConfigurationKey } from "./module-1023.mjs";
import { VerifyExtensionSignatureConfigKey } from "./module-0874.mjs";
import { TerminalContribSettingId } from "./module-1173.mjs";
import { IUserDataProfilesService } from "./module-0511.mjs";
import { Extensions10 } from "./module-0872.mjs";


// src/vs/workbench/contrib/telemetry/browser/telemetry.contribution.ts
var TelemetryContribution = class extends Disposable {
  constructor(telemetryService, contextService, lifecycleService, editorService, keybindingsService, themeService, environmentService, userDataProfileService, paneCompositeService, productService, loggerService, outputService, textFileService) {
    super();
    this.telemetryService = telemetryService;
    this.contextService = contextService;
    this.userDataProfileService = userDataProfileService;
    this.loggerService = loggerService;
    this.outputService = outputService;
    const { filesToOpenOrCreate, filesToDiff, filesToMerge } = environmentService;
    const activeViewlet = paneCompositeService.getActivePaneComposite(0 /* Sidebar */);
    telemetryService.publicLog2("workspaceLoad", {
      windowSize: { innerHeight: mainWindow.innerHeight, innerWidth: mainWindow.innerWidth, outerHeight: mainWindow.outerHeight, outerWidth: mainWindow.outerWidth },
      emptyWorkbench: contextService.getWorkbenchState() === 1 /* EMPTY */,
      "workbench.filesToOpenOrCreate": filesToOpenOrCreate && filesToOpenOrCreate.length || 0,
      "workbench.filesToDiff": filesToDiff && filesToDiff.length || 0,
      "workbench.filesToMerge": filesToMerge && filesToMerge.length || 0,
      customKeybindingsCount: keybindingsService.customKeybindingsCount(),
      theme: themeService.getColorTheme().id,
      language,
      pinnedViewlets: paneCompositeService.getPinnedPaneCompositeIds(0 /* Sidebar */),
      restoredViewlet: activeViewlet ? activeViewlet.getId() : void 0,
      restoredEditors: editorService.visibleEditors.length,
      startupKind: lifecycleService.startupKind
    });
    this._register(new ErrorTelemetry(telemetryService));
    this._register(textFileService.files.onDidResolve((e4) => this.onTextFileModelResolved(e4)));
    this._register(textFileService.files.onDidSave((e4) => this.onTextFileModelSaved(e4)));
    this._register(lifecycleService.onDidShutdown(() => this.dispose()));
    if (supportsTelemetry(productService, environmentService)) {
      this.handleTelemetryOutputVisibility();
    }
  }
  static {
    this.ALLOWLIST_JSON = ["package.json", "package-lock.json", "tsconfig.json", "jsconfig.json", "bower.json", ".eslintrc.json", "tslint.json", "composer.json"];
  }
  static {
    this.ALLOWLIST_WORKSPACE_JSON = ["settings.json", "extensions.json", "tasks.json", "launch.json"];
  }
  onTextFileModelResolved(e4) {
    const settingsType = this.getTypeIfSettings(e4.model.resource);
    if (!settingsType) {
      this.telemetryService.publicLog2("fileGet", this.getTelemetryData(e4.model.resource, e4.reason));
    }
  }
  onTextFileModelSaved(e4) {
    const settingsType = this.getTypeIfSettings(e4.model.resource);
    if (!settingsType) {
      this.telemetryService.publicLog2("filePUT", this.getTelemetryData(e4.model.resource, e4.reason));
    }
  }
  getTypeIfSettings(resource) {
    if (extname2(resource) !== ".json") {
      return "";
    }
    if (isEqual2(resource, this.userDataProfileService.currentProfile.settingsResource)) {
      return "global-settings";
    }
    if (isEqual2(resource, this.userDataProfileService.currentProfile.keybindingsResource)) {
      return "keybindings";
    }
    if (isEqualOrParent2(resource, this.userDataProfileService.currentProfile.snippetsHome)) {
      return "snippets";
    }
    const folders = this.contextService.getWorkspace().folders;
    for (const folder of folders) {
      if (isEqualOrParent2(resource, folder.toResource(".vscode"))) {
        const filename = basename2(resource);
        if (TelemetryContribution.ALLOWLIST_WORKSPACE_JSON.indexOf(filename) > -1) {
          return `.vscode/${filename}`;
        }
      }
    }
    return "";
  }
  getTelemetryData(resource, reason) {
    let ext = extname2(resource);
    const queryStringLocation = ext.indexOf("?");
    ext = queryStringLocation !== -1 ? ext.substr(0, queryStringLocation) : ext;
    const fileName = basename2(resource);
    const path = resource.scheme === Schemas.file ? resource.fsPath : resource.path;
    const telemetryData = {
      mimeType: new TelemetryTrustedValue(getMimeTypes(resource).join(", ")),
      ext,
      path: hash(path),
      reason,
      allowlistedjson: void 0
    };
    if (ext === ".json" && TelemetryContribution.ALLOWLIST_JSON.indexOf(fileName) > -1) {
      telemetryData["allowlistedjson"] = fileName;
    }
    return telemetryData;
  }
  async handleTelemetryOutputVisibility() {
    const that = this;
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: "workbench.action.showTelemetry",
          title: localize2(19905, "Show Telemetry"),
          category: Categories.Developer,
          f1: true
        });
      }
      async run() {
        for (const logger of that.loggerService.getRegisteredLoggers()) {
          if (logger.group?.id === TelemetryLogGroup.id) {
            that.loggerService.setLogLevel(logger.resource, 1 /* Trace */);
            that.loggerService.setVisibility(logger.resource, true);
          }
        }
        that.outputService.showChannel(TelemetryLogGroup.id);
      }
    }));
    if (![...this.loggerService.getRegisteredLoggers()].find((logger) => logger.id === telemetryLogId)) {
      await Event2.toPromise(Event2.filter(this.loggerService.onDidChangeLoggers, (e4) => [...e4.added].some((logger) => logger.id === telemetryLogId)));
    }
    let showTelemetry = false;
    for (const logger of this.loggerService.getRegisteredLoggers()) {
      if (logger.id === telemetryLogId) {
        showTelemetry = this.loggerService.getLogLevel() === 1 /* Trace */ || !logger.hidden;
        if (showTelemetry) {
          this.loggerService.setVisibility(logger.id, true);
        }
        break;
      }
    }
    if (showTelemetry) {
      const showExtensionTelemetry = (loggers) => {
        for (const logger of loggers) {
          if (logger.group?.id === TelemetryLogGroup.id) {
            that.loggerService.setLogLevel(logger.resource, 1 /* Trace */);
            this.loggerService.setVisibility(logger.id, true);
          }
        }
      };
      showExtensionTelemetry(this.loggerService.getRegisteredLoggers());
      this._register(this.loggerService.onDidChangeLoggers((e4) => showExtensionTelemetry(e4.added)));
    }
  }
};

TelemetryContribution = __decorateClass([
  __decorateParam(0, ITelemetryService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, ILifecycleService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IKeybindingService),
  __decorateParam(5, IWorkbenchThemeService),
  __decorateParam(6, IWorkbenchEnvironmentService),
  __decorateParam(7, IUserDataProfileService),
  __decorateParam(8, IPaneCompositePartService),
  __decorateParam(9, IProductService),
  __decorateParam(10, ILoggerService),
  __decorateParam(11, IOutputService),
  __decorateParam(12, ITextFileService)
], TelemetryContribution);

var ConfigurationTelemetryContribution = class extends Disposable {
  constructor(configurationService, userDataProfilesService, telemetryService) {
    super();
    this.configurationService = configurationService;
    this.userDataProfilesService = userDataProfilesService;
    this.telemetryService = telemetryService;
    this.configurationRegistry = Registry.as(Extensions4.Configuration);
    const { user, workspace } = configurationService.keys();
    for (const setting of user) {
      this.reportTelemetry(setting, 3 /* USER_LOCAL */);
    }
    for (const setting of workspace) {
      this.reportTelemetry(setting, 5 /* WORKSPACE */);
    }
  }
  /**
   * Report value of a setting only if it is an enum, boolean, or number or an array of those.
   */
  getValueToReport(key3, target) {
    const inpsectData = this.configurationService.inspect(key3);
    const value2 = target === 3 /* USER_LOCAL */ ? inpsectData.user?.value : inpsectData.workspace?.value;
    if (isNumber(value2) || isBoolean(value2)) {
      return value2.toString();
    }
    const schema10 = this.configurationRegistry.getConfigurationProperties()[key3];
    if (isString(value2)) {
      if (schema10?.enum?.includes(value2)) {
        return value2;
      }
      return void 0;
    }
    if (Array.isArray(value2)) {
      if (value2.every((v2) => isNumber(v2) || isBoolean(v2) || isString(v2) && schema10?.enum?.includes(v2))) {
        return JSON.stringify(value2);
      }
    }
    return void 0;
  }
  reportTelemetry(key3, target) {
    const source = ConfigurationTargetToString(target);
    switch (key3) {
      case "workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */:
        this.telemetryService.publicLog2("workbench.activityBar.location", { settingValue: this.getValueToReport(key3, target), source });
        return;
      case "workbench.experimental.modernUI" /* MODERN_UI */:
        this.telemetryService.publicLog2("workbench.experimental.modernUI", { settingValue: this.getValueToReport(key3, target), source });
        return;
      case "window.density.layout" /* MODERN_UI_DENSITY */:
        this.telemetryService.publicLog2("window.density.layout", { settingValue: this.getValueToReport(key3, target), source });
        return;
      case AutoUpdateConfigurationKey:
        this.telemetryService.publicLog2("extensions.autoUpdate", { settingValue: this.getValueToReport(key3, target), source });
        return;
      case "editor.stickyScroll.enabled":
        this.telemetryService.publicLog2("editor.stickyScroll.enabled", { settingValue: this.getValueToReport(key3, target), source });
        return;
      case "typescript.experimental.expandableHover":
        this.telemetryService.publicLog2("typescript.experimental.expandableHover", { settingValue: this.getValueToReport(key3, target), source });
        return;
      case "window.titleBarStyle":
        this.telemetryService.publicLog2("window.titleBarStyle", { settingValue: this.getValueToReport(key3, target), source });
        return;
      case "workbench.secondarySideBar.defaultVisibility":
        this.telemetryService.publicLog2("workbench.secondarySideBar.defaultVisibility", { settingValue: this.getValueToReport(key3, target), source });
        return;
      case VerifyExtensionSignatureConfigKey:
        this.telemetryService.publicLog2("extensions.verifySignature", { settingValue: this.getValueToReport(key3, target), source });
        return;
      case "window.newWindowProfile": {
        const valueToReport = this.getValueToReport(key3, target);
        const settingValue = valueToReport === null ? "null" : valueToReport === this.userDataProfilesService.defaultProfile.name ? "default" : "custom";
        this.telemetryService.publicLog2("window.newWindowProfile", { settingValue, source });
        return;
      }
      case AutoRestartConfigurationKey:
        this.telemetryService.publicLog2("extensions.autoRestart", { settingValue: this.getValueToReport(key3, target), source });
        return;
      case TerminalContribSettingId.OutputLocation:
        this.telemetryService.publicLog2("terminal.integrated.chatAgentTools.outputLocation", { settingValue: this.getValueToReport(key3, target), source });
        return;
      case TerminalContribSettingId.SuggestEnabled:
        this.telemetryService.publicLog2("terminal.integrated.suggest.enabled", { settingValue: this.getValueToReport(key3, target), source });
        return;
      case TerminalContribSettingId.AgentSandboxEnabled:
        this.telemetryService.publicLog2("chat.agent.sandbox", { settingValue: this.getValueToReport(key3, target), source });
        return;
    }
  }
};

ConfigurationTelemetryContribution = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IUserDataProfilesService),
  __decorateParam(2, ITelemetryService)
], ConfigurationTelemetryContribution);

var workbenchContributionRegistry = Registry.as(Extensions10.Workbench);

workbenchContributionRegistry.registerWorkbenchContribution(TelemetryContribution, 3 /* Restored */);

workbenchContributionRegistry.registerWorkbenchContribution(ConfigurationTelemetryContribution, 4 /* Eventually */);
export { TelemetryContribution, ConfigurationTelemetryContribution, workbenchContributionRegistry };
