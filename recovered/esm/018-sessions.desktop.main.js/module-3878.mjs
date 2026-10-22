// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/services/configuration/browser/configurationService.ts
import { DefaultConfiguration2, FolderConfiguration, UserConfiguration, WorkspaceConfiguration } from "./module-3875.mjs";
import { deepClone, equals4 } from "./module-0098.mjs";
import { Disposable, DisposableMap } from "./module-0012.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4, keyFromOverrideIdentifiers } from "./module-0140.mjs";
import { NullPolicyService } from "./module-0957.mjs";
import { NullPolicyConfiguration, PolicyConfiguration } from "./module-3873.mjs";
import { Configuration3 } from "./module-3874.mjs";
import { ConfigurationChangeEvent, ConfigurationModel } from "./module-3872.mjs";
import { isConfigurationOverrides, isConfigurationUpdateOverrides } from "./module-0132.mjs";
import { ChatAIDisabledSettingId } from "./module-0951.mjs";
import { distinct, equals } from "./module-0007.mjs";
import { Promises, Queue } from "./module-0036.mjs";
import { APPLICATION_SCOPES, APPLY_ALL_PROFILES_SETTING, FOLDER_CONFIG_FOLDER_NAME, FOLDER_SETTINGS_PATH } from "./module-1198.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { parse5 } from "./module-0885.mjs";
import { applyEdits, setProperty } from "./module-1377.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { OS } from "./module-0014.mjs";


// src/vs/sessions/services/configuration/browser/configurationService.ts
var SessionsDefaultConfiguration = class extends DefaultConfiguration2 {
  getDefaultValue(_key, propertySchema) {
    if (propertySchema.agentsWindow && propertySchema.defaultValueSource !== "experiments") {
      return deepClone(propertySchema.agentsWindow.default);
    }
    return super.getDefaultValue(_key, propertySchema);
  }
};

var ConfigurationService = class extends Disposable {
  constructor(userDataProfileService, workspaceService, uriIdentityService, fileService, policyService, logService, configurationCache, environmentService) {
    super();
    this.workspaceService = workspaceService;
    this.uriIdentityService = uriIdentityService;
    this.fileService = fileService;
    this.logService = logService;
    this.cachedFolderConfigs = this._register(new DisposableMap(new ResourceMap()));
    this.agentsWindowReadOnlyKeys = /* @__PURE__ */ new Set();
    this._onDidChangeConfiguration = this._register(new Emitter());
    this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
    this.onDidChangeRestrictedSettings = Event2.None;
    this.restrictedSettings = { default: [] };
    this.configurationRegistry = Registry.as(Extensions4.Configuration);
    this.settingsResource = userDataProfileService.currentProfile.settingsResource;
    this.defaultConfiguration = this._register(new SessionsDefaultConfiguration(userDataProfileService.currentProfile.id, configurationCache, environmentService, logService));
    this.policyConfiguration = policyService instanceof NullPolicyService ? new NullPolicyConfiguration() : this._register(new PolicyConfiguration(this.defaultConfiguration, policyService, logService));
    this.initAgentsWindowReadOnlyKeys();
    this.userConfiguration = this._register(new UserConfiguration(userDataProfileService.currentProfile.settingsResource, userDataProfileService.currentProfile.tasksResource, userDataProfileService.currentProfile.mcpResource, { exclude: [...this.agentsWindowReadOnlyKeys] }, fileService, uriIdentityService, logService));
    this.workspaceConfiguration = this._register(new WorkspaceConfiguration({ needsCaching: () => false, read: async () => "", write: async () => {
    }, remove: async () => {
    } }, fileService, uriIdentityService, logService));
    this.configurationEditing = new ConfigurationEditing2(fileService, this);
    this._configuration = new Configuration3(
      ConfigurationModel.createEmptyModel(logService),
      ConfigurationModel.createEmptyModel(logService),
      ConfigurationModel.createEmptyModel(logService),
      ConfigurationModel.createEmptyModel(logService),
      ConfigurationModel.createEmptyModel(logService),
      ConfigurationModel.createEmptyModel(logService),
      new ResourceMap(),
      ConfigurationModel.createEmptyModel(logService),
      new ResourceMap(),
      this.workspaceService.getWorkspace(),
      this.logService
    );
    this._register(this.defaultConfiguration.onDidChangeConfiguration(({ defaults, properties }) => this.onDefaultConfigurationChanged(defaults, properties)));
    this._register(this.policyConfiguration.onDidChangeConfiguration((configurationModel) => this.onPolicyConfigurationChanged(configurationModel)));
    this._register(this.userConfiguration.onDidChangeConfiguration((userConfiguration) => this.onUserConfigurationChanged(userConfiguration)));
    this._register(this.workspaceConfiguration.onDidUpdateConfiguration(() => this.onWorkspaceConfigurationChanged()));
    this._register(this.workspaceService.onWillChangeWorkspaceFolders((e4) => e4.join(this.loadFolderConfigurations(e4.changes.added))));
    this._register(this.workspaceService.onDidChangeWorkspaceFolders((e4) => this.onWorkspaceFoldersChanged(e4)));
  }
  async initialize() {
    const workspace = this.workspaceService.getWorkspace();
    const workspaceIdentifier = { id: workspace.id, configPath: workspace.configuration };
    const [defaultModel, policyModel, userModel] = await Promise.all([
      this.defaultConfiguration.initialize(),
      this.policyConfiguration.initialize(),
      this.userConfiguration.initialize(),
      this.workspaceConfiguration.initialize(workspaceIdentifier, true)
    ]);
    this.workspaceConfiguration.reparseWorkspaceSettings({ exclude: [...this.agentsWindowReadOnlyKeys] });
    this._configuration = new Configuration3(
      defaultModel,
      policyModel,
      ConfigurationModel.createEmptyModel(this.logService),
      userModel,
      ConfigurationModel.createEmptyModel(this.logService),
      this.workspaceConfiguration.getConfiguration(),
      new ResourceMap(),
      ConfigurationModel.createEmptyModel(this.logService),
      new ResourceMap(),
      workspace,
      this.logService
    );
    await this.loadFolderConfigurations(workspace.folders);
  }
  // #region IWorkbenchConfigurationService
  getConfigurationData() {
    return this._configuration.toData();
  }
  getValue(arg1, arg2) {
    const section = typeof arg1 === "string" ? arg1 : void 0;
    const overrides = isConfigurationOverrides(arg1) ? arg1 : isConfigurationOverrides(arg2) ? arg2 : void 0;
    return this._configuration.getValue(section, overrides);
  }
  async updateValue(key3, value2, arg3, arg4, _options) {
    const overrides = isConfigurationUpdateOverrides(arg3) ? arg3 : isConfigurationOverrides(arg3) ? { resource: arg3.resource, overrideIdentifiers: arg3.overrideIdentifier ? [arg3.overrideIdentifier] : void 0 } : void 0;
    let target = overrides ? arg4 : arg3;
    if (key3 === ChatAIDisabledSettingId) {
      target = 5 /* WORKSPACE */;
    }
    const targets = target ? [target] : [];
    if (overrides?.overrideIdentifiers) {
      overrides.overrideIdentifiers = distinct(overrides.overrideIdentifiers);
      overrides.overrideIdentifiers = overrides.overrideIdentifiers.length ? overrides.overrideIdentifiers : void 0;
    }
    const inspect = this.inspect(key3, { resource: overrides?.resource, overrideIdentifier: overrides?.overrideIdentifiers ? overrides.overrideIdentifiers[0] : void 0 });
    if (inspect.policyValue !== void 0) {
      throw new Error(`Unable to write ${key3} because it is configured in system policy.`);
    }
    if (this.agentsWindowReadOnlyKeys.has(key3)) {
      throw new Error(`Unable to write ${key3} because it is read-only in the Agents window.`);
    }
    if (!targets.length) {
      targets.push(...this.deriveConfigurationTargets(key3, value2, inspect));
      if (equals4(value2, inspect.defaultValue) && targets.length === 1 && targets[0] === 2 /* USER */) {
        value2 = void 0;
      }
    }
    if (overrides?.overrideIdentifiers?.length && overrides.overrideIdentifiers.length > 1) {
      const overrideIdentifiers = overrides.overrideIdentifiers.sort();
      const existingOverrides = this._configuration.localUserConfiguration.overrides.find((override) => equals([...override.identifiers].sort(), overrideIdentifiers));
      if (existingOverrides) {
        overrides.overrideIdentifiers = existingOverrides.identifiers;
      }
    }
    await Promises.settled(targets.map((t2) => this.writeConfigurationValue(key3, value2, t2, overrides)));
  }
  async writeConfigurationValue(key3, value2, target, overrides) {
    let path = overrides?.overrideIdentifiers?.length ? [keyFromOverrideIdentifiers(overrides.overrideIdentifiers), key3] : [key3];
    const settingsResource = this.getSettingsResource(target, overrides?.resource ?? void 0);
    if (this.isWorkspaceConfigurationResource(settingsResource)) {
      path = ["settings", ...path];
    }
    await this.configurationEditing.write(settingsResource, path, value2);
    await this.reloadConfiguration();
  }
  deriveConfigurationTargets(_key, value2, inspect) {
    if (equals4(value2, inspect.value)) {
      return [];
    }
    const definedTargets = [];
    if (inspect.workspaceFolderValue !== void 0) {
      definedTargets.push(6 /* WORKSPACE_FOLDER */);
    }
    if (inspect.workspaceValue !== void 0) {
      definedTargets.push(5 /* WORKSPACE */);
    }
    if (inspect.userValue !== void 0) {
      definedTargets.push(2 /* USER */);
    }
    if (value2 === void 0) {
      return definedTargets;
    }
    return [definedTargets[0] || 2 /* USER */];
  }
  isWorkspaceConfigurationResource(resource) {
    const workspace = this.workspaceService.getWorkspace();
    return !!(workspace.configuration && this.uriIdentityService.extUri.isEqual(workspace.configuration, resource));
  }
  getSettingsResource(target, resource) {
    if (target === 6 /* WORKSPACE_FOLDER */) {
      if (resource) {
        const folder = this.workspaceService.getWorkspaceFolder(resource);
        if (folder) {
          return this.uriIdentityService.extUri.joinPath(folder.uri, FOLDER_SETTINGS_PATH);
        }
      }
    }
    if (target === 5 /* WORKSPACE */) {
      const workspace = this.workspaceService.getWorkspace();
      if (workspace.configuration) {
        return workspace.configuration;
      }
    }
    return this.settingsResource;
  }
  inspect(key3, overrides) {
    return this._configuration.inspect(key3, overrides);
  }
  keys() {
    return this._configuration.keys();
  }
  async reloadConfiguration(_target) {
    this.reloadDefaultConfiguration();
    if (_target === 7 /* DEFAULT */) {
      return;
    }
    const userModel = await this.userConfiguration.initialize();
    const previousData = this._configuration.toData();
    const change = this._configuration.compareAndUpdateLocalUserConfiguration(userModel);
    const workspaceChange = await this.loadWorkspaceConfiguration();
    change.keys.push(...workspaceChange.keys);
    change.overrides.push(...workspaceChange.overrides);
    for (const folder of this.workspaceService.getWorkspace().folders) {
      const folderConfiguration = this.cachedFolderConfigs.get(folder.uri);
      if (folderConfiguration) {
        const folderModel = await folderConfiguration.loadConfiguration();
        const folderChange = this._configuration.compareAndUpdateFolderConfiguration(folder.uri, folderModel);
        change.keys.push(...folderChange.keys);
        change.overrides.push(...folderChange.overrides);
      }
    }
    this.triggerConfigurationChange(change, previousData, 2 /* USER */);
  }
  reloadDefaultConfiguration() {
    this.onDefaultConfigurationChanged(this.defaultConfiguration.reload());
  }
  hasCachedConfigurationDefaultsOverrides() {
    return this.defaultConfiguration.hasCachedConfigurationDefaultsOverrides();
  }
  async whenRemoteConfigurationLoaded() {
  }
  isSettingAppliedForAllProfiles(key3) {
    const scope = this.configurationRegistry.getConfigurationProperties()[key3]?.scope;
    if (scope && APPLICATION_SCOPES.includes(scope)) {
      return true;
    }
    const allProfilesSettings = this.getValue(APPLY_ALL_PROFILES_SETTING) ?? [];
    return Array.isArray(allProfilesSettings) && allProfilesSettings.includes(key3);
  }
  // #endregion
  initAgentsWindowReadOnlyKeys() {
    const properties = this.configurationRegistry.getConfigurationProperties();
    for (const key3 in properties) {
      if (properties[key3].agentsWindow?.readOnly) {
        this.agentsWindowReadOnlyKeys.add(key3);
      }
    }
  }
  updateAgentsWindowReadOnlyKeys(changedProperties) {
    const properties = this.configurationRegistry.getConfigurationProperties();
    for (const key3 of changedProperties) {
      if (properties[key3]?.agentsWindow?.readOnly) {
        this.agentsWindowReadOnlyKeys.add(key3);
      } else {
        this.agentsWindowReadOnlyKeys.delete(key3);
      }
    }
  }
  // #region Configuration change handlers
  onDefaultConfigurationChanged(defaults, properties) {
    if (properties) {
      this.updateAgentsWindowReadOnlyKeys(properties);
    }
    const previousData = this._configuration.toData();
    const change = this._configuration.compareAndUpdateDefaultConfiguration(defaults, properties);
    this._configuration.updateLocalUserConfiguration(this.userConfiguration.reparse({ exclude: [...this.agentsWindowReadOnlyKeys] }));
    this._configuration.updateWorkspaceConfiguration(this.workspaceConfiguration.reparseWorkspaceSettings({ exclude: [...this.agentsWindowReadOnlyKeys] }));
    for (const folder of this.workspaceService.getWorkspace().folders) {
      const folderConfiguration = this.cachedFolderConfigs.get(folder.uri);
      if (folderConfiguration) {
        this._configuration.updateFolderConfiguration(folder.uri, folderConfiguration.reparse());
      }
    }
    this.triggerConfigurationChange(change, previousData, 7 /* DEFAULT */);
  }
  onPolicyConfigurationChanged(policyConfiguration) {
    const previousData = this._configuration.toData();
    const change = this._configuration.compareAndUpdatePolicyConfiguration(policyConfiguration);
    this.triggerConfigurationChange(change, previousData, 7 /* DEFAULT */);
  }
  onUserConfigurationChanged(userConfiguration) {
    const previousData = this._configuration.toData();
    const change = this._configuration.compareAndUpdateLocalUserConfiguration(userConfiguration);
    this.triggerConfigurationChange(change, previousData, 2 /* USER */);
  }
  async onWorkspaceConfigurationChanged() {
    const previousData = this._configuration.toData();
    const change = await this.loadWorkspaceConfiguration();
    this.triggerConfigurationChange(change, previousData, 5 /* WORKSPACE */);
  }
  async loadWorkspaceConfiguration() {
    await this.workspaceConfiguration.reload();
    this.workspaceConfiguration.reparseWorkspaceSettings({ exclude: [...this.agentsWindowReadOnlyKeys] });
    return this._configuration.compareAndUpdateWorkspaceConfiguration(this.workspaceConfiguration.getConfiguration());
  }
  onWorkspaceFoldersChanged(e4) {
    const previousData = this._configuration.toData();
    const keys = [];
    const overrides = [];
    for (const folder of e4.removed) {
      const change = this._configuration.compareAndDeleteFolderConfiguration(folder.uri);
      keys.push(...change.keys);
      overrides.push(...change.overrides);
      this.cachedFolderConfigs.deleteAndDispose(folder.uri);
    }
    if (keys.length || overrides.length) {
      this.triggerConfigurationChange({ keys, overrides }, previousData, 6 /* WORKSPACE_FOLDER */);
    }
  }
  onWorkspaceFolderConfigurationChanged(folder) {
    const folderConfiguration = this.cachedFolderConfigs.get(folder.uri);
    if (folderConfiguration) {
      folderConfiguration.loadConfiguration().then((configurationModel) => {
        const previousData = this._configuration.toData();
        const change = this._configuration.compareAndUpdateFolderConfiguration(folder.uri, configurationModel);
        this.triggerConfigurationChange(change, previousData, 6 /* WORKSPACE_FOLDER */);
      }, onUnexpectedError);
    }
  }
  async loadFolderConfigurations(folders) {
    for (const folder of folders) {
      let folderConfiguration = this.cachedFolderConfigs.get(folder.uri);
      if (!folderConfiguration) {
        folderConfiguration = new FolderConfiguration(false, folder, FOLDER_CONFIG_FOLDER_NAME, 3 /* WORKSPACE */, true, this.fileService, this.uriIdentityService, this.logService, { needsCaching: () => false, read: async () => "", write: async () => {
        }, remove: async () => {
        } });
        folderConfiguration.addRelated(folderConfiguration.onDidChange(() => this.onWorkspaceFolderConfigurationChanged(folder)));
        this.cachedFolderConfigs.set(folder.uri, folderConfiguration);
      }
      const configurationModel = await folderConfiguration.loadConfiguration();
      this._configuration.updateFolderConfiguration(folder.uri, configurationModel);
    }
  }
  triggerConfigurationChange(change, previousData, target) {
    if (change.keys.length) {
      const workspace = this.workspaceService.getWorkspace();
      const event = new ConfigurationChangeEvent(change, { data: previousData, workspace }, this._configuration, workspace, this.logService);
      event.source = target;
      this._onDidChangeConfiguration.fire(event);
    }
  }
  // #endregion
};

var ConfigurationEditing2 = class {
  constructor(fileService, configurationService) {
    this.fileService = fileService;
    this.configurationService = configurationService;
    this.queue = new Queue();
  }
  write(settingsResource, path, value2) {
    return this.queue.queue(() => this.doWriteConfiguration(settingsResource, path, value2));
  }
  async doWriteConfiguration(settingsResource, path, value2) {
    let content;
    try {
      const fileContent = await this.fileService.readFile(settingsResource);
      content = fileContent.value.toString();
    } catch (error) {
      if (error.fileOperationResult === 1 /* FILE_NOT_FOUND */) {
        content = "{}";
      } else {
        throw error;
      }
    }
    const parseErrors = [];
    parse5(content, parseErrors, { allowTrailingComma: true, allowEmptyContent: true });
    if (parseErrors.length > 0) {
      throw new Error("Unable to write into the settings file. Please open the file to correct errors/warnings in the file and try again.");
    }
    const edits = this.getEdits(content, path, value2);
    content = applyEdits(content, edits);
    await this.fileService.writeFile(settingsResource, VSBuffer.fromString(content));
  }
  getEdits(content, path, value2) {
    const { tabSize, insertSpaces, eol } = this.formattingOptions;
    if (!path.length) {
      const newContent = JSON.stringify(value2, null, insertSpaces ? " ".repeat(tabSize) : "	");
      return [{
        content: newContent,
        length: content.length,
        offset: 0
      }];
    }
    return setProperty(content, path, value2, { tabSize, insertSpaces, eol });
  }
  get formattingOptions() {
    if (!this._formattingOptions) {
      let eol = OS === 3 /* Linux */ || OS === 2 /* Macintosh */ ? "\n" : "\r\n";
      const configuredEol = this.configurationService.getValue("files.eol", { overrideIdentifier: "jsonc" });
      if (configuredEol && typeof configuredEol === "string" && configuredEol !== "auto") {
        eol = configuredEol;
      }
      this._formattingOptions = {
        eol,
        insertSpaces: !!this.configurationService.getValue("editor.insertSpaces", { overrideIdentifier: "jsonc" }),
        tabSize: this.configurationService.getValue("editor.tabSize", { overrideIdentifier: "jsonc" })
      };
    }
    return this._formattingOptions;
  }
};
export { SessionsDefaultConfiguration, ConfigurationService, ConfigurationEditing2 };
