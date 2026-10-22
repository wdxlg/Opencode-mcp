// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/filesConfiguration/common/filesConfigurationService.ts
import { IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { createDecorator } from "./module-0077.mjs";
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { LRUCache, ResourceMap } from "./module-0008.mjs";
import { GlobalIdleValue } from "./module-0036.mjs";
import { AutoSaveConfiguration, FILES_READONLY_EXCLUDE_CONFIG, FILES_READONLY_INCLUDE_CONFIG, HotExitConfiguration, IFileService, hasReadonlyCapability } from "./module-0269.mjs";
import { isWeb } from "./module-0014.mjs";
import { localize } from "./module-0001.mjs";
import { ResourceGlobMatcher } from "./module-0930.mjs";
import { equals4 } from "./module-0098.mjs";
import { EditorInput } from "./module-0929.mjs";
import { EditorResourceAccessor } from "./module-0926.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IEnvironmentService } from "./module-0508.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IMarkerService } from "./module-0560.mjs";
import { ITextResourceConfigurationService } from "./module-0204.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/filesConfiguration/common/filesConfigurationService.ts
var AutoSaveAfterShortDelayContext = new RawContextKey("autoSaveAfterShortDelayContext", false, true);

var IFilesConfigurationService = createDecorator("filesConfigurationService");

var FilesConfigurationService = class extends Disposable {
  constructor(contextKeyService, configurationService, contextService, environmentService, uriIdentityService, fileService, markerService, textResourceConfigurationService) {
    super();
    this.configurationService = configurationService;
    this.contextService = contextService;
    this.environmentService = environmentService;
    this.uriIdentityService = uriIdentityService;
    this.fileService = fileService;
    this.markerService = markerService;
    this.textResourceConfigurationService = textResourceConfigurationService;
    this._onDidChangeAutoSaveConfiguration = this._register(new Emitter());
    this.onDidChangeAutoSaveConfiguration = this._onDidChangeAutoSaveConfiguration.event;
    this._onDidChangeAutoSaveDisabled = this._register(new Emitter());
    this.onDidChangeAutoSaveDisabled = this._onDidChangeAutoSaveDisabled.event;
    this._onDidChangeFilesAssociation = this._register(new Emitter());
    this.onDidChangeFilesAssociation = this._onDidChangeFilesAssociation.event;
    this._onDidChangeReadonly = this._register(new Emitter({
      leakWarningThreshold: 500,
      leakWarningName: "FilesConfigurationService._onDidChangeReadonly"
      /* increased for users with hundreds of inputs opened */
    }));
    this.onDidChangeReadonly = this._onDidChangeReadonly.event;
    this.autoSaveConfigurationCache = new LRUCache(1e3);
    this.autoSaveAfterShortDelayOverrides = new ResourceMap();
    this.autoSaveDisabledOverrides = new ResourceMap();
    this.readonlyIncludeMatcher = this._register(new GlobalIdleValue(() => this.createReadonlyMatcher(FILES_READONLY_INCLUDE_CONFIG)));
    this.readonlyExcludeMatcher = this._register(new GlobalIdleValue(() => this.createReadonlyMatcher(FILES_READONLY_EXCLUDE_CONFIG)));
    this.sessionReadonlyOverrides = new ResourceMap((resource) => this.uriIdentityService.extUri.getComparisonKey(resource));
    this.autoSaveAfterShortDelayContext = AutoSaveAfterShortDelayContext.bindTo(contextKeyService);
    const configuration2 = configurationService.getValue();
    this.currentGlobalAutoSaveConfiguration = this.computeAutoSaveConfiguration(void 0, configuration2.files);
    this.currentFilesAssociationConfiguration = configuration2?.files?.associations;
    this.currentHotExitConfiguration = configuration2?.files?.hotExit || HotExitConfiguration.ON_EXIT;
    this.onFilesConfigurationChange(configuration2, false);
    this.registerListeners();
  }
  static {
    this.DEFAULT_AUTO_SAVE_MODE = isWeb ? AutoSaveConfiguration.AFTER_DELAY : AutoSaveConfiguration.OFF;
  }
  static {
    this.DEFAULT_AUTO_SAVE_DELAY = 1e3;
  }
  static {
    this.READONLY_MESSAGES = {
      providerReadonly: { value: localize(23162, null), isTrusted: true },
      sessionReadonly: { value: localize(23163, null, "workbench.action.files.setActiveEditorWriteableInSession"), isTrusted: true },
      configuredReadonly: { value: localize(23159, null, `workbench.action.openSettings?${encodeURIComponent('["files.readonly"]')}`, "workbench.action.files.toggleActiveEditorReadonlyInSession"), isTrusted: true },
      fileLocked: { value: localize(23160, null, "workbench.action.files.setActiveEditorWriteableInSession"), isTrusted: true },
      fileReadonly: { value: localize(23161, null), isTrusted: true }
    };
  }
  createReadonlyMatcher(config) {
    const matcher = this._register(new ResourceGlobMatcher(
      (resource) => this.configurationService.getValue(config, { resource }),
      (event) => event.affectsConfiguration(config),
      this.contextService,
      this.configurationService
    ));
    this._register(matcher.onExpressionChange(() => this._onDidChangeReadonly.fire()));
    return matcher;
  }
  isReadonly(resource, stat) {
    const provider = this.fileService.getProvider(resource.scheme);
    if (provider && hasReadonlyCapability(provider)) {
      return provider.readOnlyMessage ?? FilesConfigurationService.READONLY_MESSAGES.providerReadonly;
    }
    const sessionReadonlyOverride = this.sessionReadonlyOverrides.get(resource);
    if (typeof sessionReadonlyOverride === "boolean") {
      return sessionReadonlyOverride === true ? FilesConfigurationService.READONLY_MESSAGES.sessionReadonly : false;
    }
    if (sessionReadonlyOverride !== void 0) {
      return sessionReadonlyOverride;
    }
    if (this.uriIdentityService.extUri.isEqualOrParent(resource, this.environmentService.userRoamingDataHome) || this.uriIdentityService.extUri.isEqual(resource, this.contextService.getWorkspace().configuration ?? void 0)) {
      return false;
    }
    if (this.readonlyIncludeMatcher.value.matches(resource)) {
      return !this.readonlyExcludeMatcher.value.matches(resource) ? FilesConfigurationService.READONLY_MESSAGES.configuredReadonly : false;
    }
    if (this.configuredReadonlyFromPermissions && stat?.locked) {
      return FilesConfigurationService.READONLY_MESSAGES.fileLocked;
    }
    if (stat?.readonly) {
      return FilesConfigurationService.READONLY_MESSAGES.fileReadonly;
    }
    return false;
  }
  async updateReadonly(resource, readonly) {
    if (Array.isArray(resource)) {
      for (const r2 of resource) {
        this.applyReadonly(r2, readonly);
      }
      if (resource.length > 0) {
        this._onDidChangeReadonly.fire();
      }
      return;
    }
    if (readonly === "toggle") {
      let stat = void 0;
      try {
        stat = await this.fileService.resolve(resource, { resolveMetadata: true });
      } catch (error) {
      }
      readonly = !this.isReadonly(resource, stat);
    }
    this.applyReadonly(resource, readonly);
    this._onDidChangeReadonly.fire();
  }
  applyReadonly(resource, readonly) {
    if (readonly === "reset") {
      this.sessionReadonlyOverrides.delete(resource);
    } else {
      this.sessionReadonlyOverrides.set(resource, readonly);
    }
  }
  registerListeners() {
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("files")) {
        this.onFilesConfigurationChange(this.configurationService.getValue(), true);
      }
    }));
  }
  onFilesConfigurationChange(configuration2, fromEvent) {
    this.currentGlobalAutoSaveConfiguration = this.computeAutoSaveConfiguration(void 0, configuration2.files);
    this.autoSaveConfigurationCache.clear();
    this.autoSaveAfterShortDelayContext.set(this.getAutoSaveMode(void 0).mode === 1 /* AFTER_SHORT_DELAY */);
    if (fromEvent) {
      this._onDidChangeAutoSaveConfiguration.fire();
    }
    const filesAssociation = configuration2?.files?.associations;
    if (!equals4(this.currentFilesAssociationConfiguration, filesAssociation)) {
      this.currentFilesAssociationConfiguration = filesAssociation;
      if (fromEvent) {
        this._onDidChangeFilesAssociation.fire();
      }
    }
    const hotExitMode = configuration2?.files?.hotExit;
    if (hotExitMode === HotExitConfiguration.OFF || hotExitMode === HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE) {
      this.currentHotExitConfiguration = hotExitMode;
    } else {
      this.currentHotExitConfiguration = HotExitConfiguration.ON_EXIT;
    }
    const readonlyFromPermissions = Boolean(configuration2?.files?.readonlyFromPermissions);
    if (readonlyFromPermissions !== Boolean(this.configuredReadonlyFromPermissions)) {
      this.configuredReadonlyFromPermissions = readonlyFromPermissions;
      if (fromEvent) {
        this._onDidChangeReadonly.fire();
      }
    }
  }
  getAutoSaveConfiguration(resourceOrEditor) {
    const resource = this.toResource(resourceOrEditor);
    if (resource) {
      let resourceAutoSaveConfiguration = this.autoSaveConfigurationCache.get(resource);
      if (!resourceAutoSaveConfiguration) {
        resourceAutoSaveConfiguration = this.computeAutoSaveConfiguration(resource, this.textResourceConfigurationService.getValue(resource, "files"));
        this.autoSaveConfigurationCache.set(resource, resourceAutoSaveConfiguration);
      }
      return resourceAutoSaveConfiguration;
    }
    return this.currentGlobalAutoSaveConfiguration;
  }
  computeAutoSaveConfiguration(resource, filesConfiguration) {
    let autoSave;
    let autoSaveDelay;
    let autoSaveWorkspaceFilesOnly;
    let autoSaveWhenNoErrors;
    let isOutOfWorkspace;
    let isShortAutoSaveDelay;
    switch (filesConfiguration?.autoSave ?? FilesConfigurationService.DEFAULT_AUTO_SAVE_MODE) {
      case AutoSaveConfiguration.AFTER_DELAY: {
        autoSave = "afterDelay";
        autoSaveDelay = typeof filesConfiguration?.autoSaveDelay === "number" && filesConfiguration.autoSaveDelay >= 0 ? filesConfiguration.autoSaveDelay : FilesConfigurationService.DEFAULT_AUTO_SAVE_DELAY;
        isShortAutoSaveDelay = autoSaveDelay <= FilesConfigurationService.DEFAULT_AUTO_SAVE_DELAY;
        break;
      }
      case AutoSaveConfiguration.ON_FOCUS_CHANGE:
        autoSave = "onFocusChange";
        break;
      case AutoSaveConfiguration.ON_WINDOW_CHANGE:
        autoSave = "onWindowChange";
        break;
    }
    if (filesConfiguration?.autoSaveWorkspaceFilesOnly === true) {
      autoSaveWorkspaceFilesOnly = true;
      if (resource && !this.contextService.isInsideWorkspace(resource)) {
        isOutOfWorkspace = true;
        isShortAutoSaveDelay = void 0;
      }
    }
    if (filesConfiguration?.autoSaveWhenNoErrors === true) {
      autoSaveWhenNoErrors = true;
      isShortAutoSaveDelay = void 0;
    }
    return {
      autoSave,
      autoSaveDelay,
      autoSaveWorkspaceFilesOnly,
      autoSaveWhenNoErrors,
      isOutOfWorkspace,
      isShortAutoSaveDelay
    };
  }
  toResource(resourceOrEditor) {
    if (resourceOrEditor instanceof EditorInput) {
      return EditorResourceAccessor.getOriginalUri(resourceOrEditor, { supportSideBySide: 1 /* PRIMARY */ });
    }
    return resourceOrEditor;
  }
  hasShortAutoSaveDelay(resourceOrEditor) {
    const resource = this.toResource(resourceOrEditor);
    if (resource && this.autoSaveAfterShortDelayOverrides.has(resource)) {
      return true;
    }
    if (this.getAutoSaveConfiguration(resource).isShortAutoSaveDelay) {
      return !resource || !this.autoSaveDisabledOverrides.has(resource);
    }
    return false;
  }
  getAutoSaveMode(resourceOrEditor, saveReason) {
    const resource = this.toResource(resourceOrEditor);
    if (resource && this.autoSaveAfterShortDelayOverrides.has(resource)) {
      return { mode: 1 /* AFTER_SHORT_DELAY */ };
    }
    if (resource && this.autoSaveDisabledOverrides.has(resource)) {
      return { mode: 0 /* OFF */, reason: 4 /* DISABLED */ };
    }
    const autoSaveConfiguration = this.getAutoSaveConfiguration(resource);
    if (typeof autoSaveConfiguration.autoSave === "undefined") {
      return { mode: 0 /* OFF */, reason: 1 /* SETTINGS */ };
    }
    if (typeof saveReason === "number") {
      if (autoSaveConfiguration.autoSave === "afterDelay" && saveReason !== 2 /* AUTO */ || autoSaveConfiguration.autoSave === "onFocusChange" && saveReason !== 3 /* FOCUS_CHANGE */ && saveReason !== 4 /* WINDOW_CHANGE */ || autoSaveConfiguration.autoSave === "onWindowChange" && saveReason !== 4 /* WINDOW_CHANGE */) {
        return { mode: 0 /* OFF */, reason: 1 /* SETTINGS */ };
      }
    }
    if (resource) {
      if (autoSaveConfiguration.autoSaveWorkspaceFilesOnly && autoSaveConfiguration.isOutOfWorkspace) {
        return { mode: 0 /* OFF */, reason: 2 /* OUT_OF_WORKSPACE */ };
      }
      if (autoSaveConfiguration.autoSaveWhenNoErrors && this.markerService.read({ resource, take: 1, severities: 8 /* Error */ }).length > 0) {
        return { mode: 0 /* OFF */, reason: 3 /* ERRORS */ };
      }
    }
    switch (autoSaveConfiguration.autoSave) {
      case "afterDelay":
        if (typeof autoSaveConfiguration.autoSaveDelay === "number" && autoSaveConfiguration.autoSaveDelay <= FilesConfigurationService.DEFAULT_AUTO_SAVE_DELAY) {
          return { mode: autoSaveConfiguration.autoSaveWhenNoErrors ? 2 /* AFTER_LONG_DELAY */ : 1 /* AFTER_SHORT_DELAY */ };
        }
        return { mode: 2 /* AFTER_LONG_DELAY */ };
      case "onFocusChange":
        return { mode: 3 /* ON_FOCUS_CHANGE */ };
      case "onWindowChange":
        return { mode: 4 /* ON_WINDOW_CHANGE */ };
    }
  }
  async toggleAutoSave() {
    const currentSetting = this.configurationService.getValue("files.autoSave");
    let newAutoSaveValue;
    if ([AutoSaveConfiguration.AFTER_DELAY, AutoSaveConfiguration.ON_FOCUS_CHANGE, AutoSaveConfiguration.ON_WINDOW_CHANGE].some((setting) => setting === currentSetting)) {
      newAutoSaveValue = AutoSaveConfiguration.OFF;
    } else {
      newAutoSaveValue = AutoSaveConfiguration.AFTER_DELAY;
    }
    return this.configurationService.updateValue("files.autoSave", newAutoSaveValue);
  }
  enableAutoSaveAfterShortDelay(resourceOrEditor) {
    const resource = this.toResource(resourceOrEditor);
    if (!resource) {
      return Disposable.None;
    }
    const counter = this.autoSaveAfterShortDelayOverrides.get(resource) ?? 0;
    this.autoSaveAfterShortDelayOverrides.set(resource, counter + 1);
    return toDisposable(() => {
      const counter2 = this.autoSaveAfterShortDelayOverrides.get(resource) ?? 0;
      if (counter2 <= 1) {
        this.autoSaveAfterShortDelayOverrides.delete(resource);
      } else {
        this.autoSaveAfterShortDelayOverrides.set(resource, counter2 - 1);
      }
    });
  }
  disableAutoSave(resourceOrEditor) {
    const resource = this.toResource(resourceOrEditor);
    if (!resource) {
      return Disposable.None;
    }
    const counter = this.autoSaveDisabledOverrides.get(resource) ?? 0;
    this.autoSaveDisabledOverrides.set(resource, counter + 1);
    if (counter === 0) {
      this._onDidChangeAutoSaveDisabled.fire(resource);
    }
    return toDisposable(() => {
      const counter2 = this.autoSaveDisabledOverrides.get(resource) ?? 0;
      if (counter2 <= 1) {
        this.autoSaveDisabledOverrides.delete(resource);
        this._onDidChangeAutoSaveDisabled.fire(resource);
      } else {
        this.autoSaveDisabledOverrides.set(resource, counter2 - 1);
      }
    });
  }
  get isHotExitEnabled() {
    if (this.contextService.getWorkspace().transient) {
      return false;
    }
    return this.currentHotExitConfiguration !== HotExitConfiguration.OFF;
  }
  get hotExitConfiguration() {
    return this.currentHotExitConfiguration;
  }
  preventSaveConflicts(resource, language2) {
    return this.configurationService.getValue("files.saveConflictResolution", { resource, overrideIdentifier: language2 }) !== "overwriteFileOnDisk";
  }
};

FilesConfigurationService = __decorateClass([
  __decorateParam(0, IContextKeyService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IEnvironmentService),
  __decorateParam(4, IUriIdentityService),
  __decorateParam(5, IFileService),
  __decorateParam(6, IMarkerService),
  __decorateParam(7, ITextResourceConfigurationService)
], FilesConfigurationService);

registerSingleton(IFilesConfigurationService, FilesConfigurationService, 0 /* Eager */);
export { AutoSaveAfterShortDelayContext, IFilesConfigurationService, FilesConfigurationService };
