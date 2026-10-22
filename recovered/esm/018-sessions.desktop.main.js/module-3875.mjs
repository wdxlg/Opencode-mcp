// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/configuration/browser/configuration.ts
import { DefaultConfiguration } from "./module-3873.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4, OVERRIDE_PROPERTY_REGEX } from "./module-0140.mjs";
import { isEmptyObject, isObject } from "./module-0010.mjs";
import { Disposable, DisposableStore, MutableDisposable, combinedDisposable, dispose } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { ConfigurationModel, ConfigurationModelParser, UserSettings } from "./module-3872.mjs";
import { RunOnceScheduler } from "./module-0036.mjs";
import { FOLDER_SCOPES, FOLDER_SETTINGS_NAME, LAUNCH_CONFIGURATION_KEY, MCP_CONFIGURATION_KEY, TASKS_CONFIGURATION_KEY, WORKSPACE_SCOPES } from "./module-1198.mjs";
import { getErrorMessage } from "./module-0004.mjs";
import { StandaloneConfigurationModelParser, WorkspaceConfigurationModelParser } from "./module-3874.mjs";
import { equals4 } from "./module-0098.mjs";
import { whenProviderRegistered } from "./module-0269.mjs";
import { hash } from "./module-0039.mjs";
import { joinPath } from "./module-0034.mjs";


// src/vs/workbench/services/configuration/browser/configuration.ts
var DefaultConfiguration2 = class _DefaultConfiguration extends DefaultConfiguration {
  constructor(cacheScope, configurationCache, environmentService, logService) {
    super(logService);
    this.configurationCache = configurationCache;
    this.configurationRegistry = Registry.as(Extensions4.Configuration);
    this.cachedConfigurationDefaultsOverrides = {};
    this.cacheKey = { type: "defaults", key: `${cacheScope}-configurationDefaultsOverrides` };
    if (environmentService.options?.configurationDefaults) {
      this.configurationRegistry.registerDefaultConfigurations([{ overrides: environmentService.options.configurationDefaults }]);
    }
  }
  static {
    this.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY = "DefaultOverridesCacheExists";
  }
  getConfigurationDefaultOverrides() {
    return this.cachedConfigurationDefaultsOverrides;
  }
  async initialize() {
    await this.initializeCachedConfigurationDefaultsOverrides();
    return super.initialize();
  }
  reload() {
    this.cachedConfigurationDefaultsOverrides = {};
    this.updateCachedConfigurationDefaultsOverrides();
    return super.reload();
  }
  hasCachedConfigurationDefaultsOverrides() {
    return !isEmptyObject(this.cachedConfigurationDefaultsOverrides);
  }
  initializeCachedConfigurationDefaultsOverrides() {
    if (!this.initiaizeCachedConfigurationDefaultsOverridesPromise) {
      this.initiaizeCachedConfigurationDefaultsOverridesPromise = (async () => {
        try {
          if (localStorage.getItem(_DefaultConfiguration.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY)) {
            const content = await this.configurationCache.read(this.cacheKey);
            if (content) {
              this.cachedConfigurationDefaultsOverrides = JSON.parse(content);
            }
          }
        } catch (error) {
        }
        this.cachedConfigurationDefaultsOverrides = isObject(this.cachedConfigurationDefaultsOverrides) ? this.cachedConfigurationDefaultsOverrides : {};
      })();
    }
    return this.initiaizeCachedConfigurationDefaultsOverridesPromise;
  }
  onDidUpdateConfiguration(properties, defaultsOverrides) {
    super.onDidUpdateConfiguration(properties, defaultsOverrides);
    if (defaultsOverrides) {
      this.updateCachedConfigurationDefaultsOverrides();
    }
  }
  async updateCachedConfigurationDefaultsOverrides() {
    const cachedConfigurationDefaultsOverrides = {};
    const defaultConfigurations = this.configurationRegistry.getRegisteredDefaultConfigurations();
    for (const defaultConfiguration of defaultConfigurations) {
      if (defaultConfiguration.donotCache) {
        continue;
      }
      for (const [key3, value2] of Object.entries(defaultConfiguration.overrides)) {
        if (!OVERRIDE_PROPERTY_REGEX.test(key3) && value2 !== void 0) {
          const existingValue = cachedConfigurationDefaultsOverrides[key3];
          if (isObject(existingValue) && isObject(value2)) {
            cachedConfigurationDefaultsOverrides[key3] = { ...existingValue, ...value2 };
          } else {
            cachedConfigurationDefaultsOverrides[key3] = value2;
          }
        }
      }
    }
    try {
      if (Object.keys(cachedConfigurationDefaultsOverrides).length) {
        localStorage.setItem(_DefaultConfiguration.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY, "yes");
        await this.configurationCache.write(this.cacheKey, JSON.stringify(cachedConfigurationDefaultsOverrides));
      } else {
        localStorage.removeItem(_DefaultConfiguration.DEFAULT_OVERRIDES_CACHE_EXISTS_KEY);
        await this.configurationCache.remove(this.cacheKey);
      }
    } catch (error) {
    }
  }
};

var UserConfiguration = class extends Disposable {
  constructor(settingsResource, tasksResource, mcpResource, configurationParseOptions, fileService, uriIdentityService, logService) {
    super();
    this.settingsResource = settingsResource;
    this.tasksResource = tasksResource;
    this.mcpResource = mcpResource;
    this.configurationParseOptions = configurationParseOptions;
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    this._onDidChangeConfiguration = this._register(new Emitter());
    this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
    this.userConfiguration = this._register(new MutableDisposable());
    this.userConfigurationChangeDisposable = this._register(new MutableDisposable());
    this.userConfiguration.value = new UserSettings(settingsResource, this.configurationParseOptions, uriIdentityService.extUri, this.fileService, logService);
    this.userConfigurationChangeDisposable.value = this.userConfiguration.value.onDidChange(() => this.reloadConfigurationScheduler.schedule());
    this.reloadConfigurationScheduler = this._register(new RunOnceScheduler(() => this.userConfiguration.value.loadConfiguration().then((configurationModel) => this._onDidChangeConfiguration.fire(configurationModel)), 50));
  }
  get hasTasksLoaded() {
    return this.userConfiguration.value instanceof FileServiceBasedConfiguration;
  }
  async reset(settingsResource, tasksResource, mcpResource, configurationParseOptions) {
    this.settingsResource = settingsResource;
    this.tasksResource = tasksResource;
    this.mcpResource = mcpResource;
    this.configurationParseOptions = configurationParseOptions;
    return this.doReset();
  }
  async doReset(settingsConfiguration) {
    const folder = this.uriIdentityService.extUri.dirname(this.settingsResource);
    const standAloneConfigurationResources = [];
    if (this.tasksResource) {
      standAloneConfigurationResources.push([TASKS_CONFIGURATION_KEY, this.tasksResource]);
    }
    if (this.mcpResource) {
      standAloneConfigurationResources.push([MCP_CONFIGURATION_KEY, this.mcpResource]);
    }
    const fileServiceBasedConfiguration = new FileServiceBasedConfiguration(folder.toString(), this.settingsResource, standAloneConfigurationResources, this.configurationParseOptions, this.fileService, this.uriIdentityService, this.logService);
    const configurationModel = await fileServiceBasedConfiguration.loadConfiguration(settingsConfiguration);
    this.userConfiguration.value = fileServiceBasedConfiguration;
    if (this.userConfigurationChangeDisposable.value) {
      this.userConfigurationChangeDisposable.value = this.userConfiguration.value.onDidChange(() => this.reloadConfigurationScheduler.schedule());
    }
    return configurationModel;
  }
  async initialize() {
    return this.userConfiguration.value.loadConfiguration();
  }
  async reload(settingsConfiguration) {
    if (this.hasTasksLoaded) {
      return this.userConfiguration.value.loadConfiguration();
    }
    return this.doReset(settingsConfiguration);
  }
  reparse(parseOptions2) {
    this.configurationParseOptions = { ...this.configurationParseOptions, ...parseOptions2 };
    return this.userConfiguration.value.reparse(this.configurationParseOptions);
  }
  getRestrictedSettings() {
    return this.userConfiguration.value.getRestrictedSettings();
  }
};

var FileServiceBasedConfiguration = class extends Disposable {
  constructor(name, settingsResource, standAloneConfigurationResources, configurationParseOptions, fileService, uriIdentityService, logService) {
    super();
    this.settingsResource = settingsResource;
    this.standAloneConfigurationResources = standAloneConfigurationResources;
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this.allResources = [this.settingsResource, ...this.standAloneConfigurationResources.map(([, resource]) => resource)];
    this._register(combinedDisposable(...this.allResources.map((resource) => combinedDisposable(
      this.fileService.watch(uriIdentityService.extUri.dirname(resource)),
      // Also listen to the resource incase the resource is a symlink - https://github.com/microsoft/vscode/issues/118134
      this.fileService.watch(resource)
    ))));
    this._folderSettingsModelParser = new ConfigurationModelParser(name, logService);
    this._folderSettingsParseOptions = configurationParseOptions;
    this._standAloneConfigurations = [];
    this._cache = ConfigurationModel.createEmptyModel(this.logService);
    this._register(Event2.debounce(
      Event2.any(
        Event2.filter(this.fileService.onDidFilesChange, (e4) => this.handleFileChangesEvent(e4)),
        Event2.filter(this.fileService.onDidRunOperation, (e4) => this.handleFileOperationEvent(e4))
      ),
      () => void 0,
      100
    )(() => this._onDidChange.fire()));
  }
  async resolveContents(donotResolveSettings) {
    const resolveContents = async (resources) => {
      return Promise.all(resources.map(async (resource) => {
        try {
          const content = await this.fileService.readFile(resource, { atomic: true });
          return content.value.toString();
        } catch (error) {
          this.logService.trace(`Error while resolving configuration file '${resource.toString()}': ${getErrorMessage(error)}`);
          if (error.fileOperationResult !== 1 /* FILE_NOT_FOUND */ && error.fileOperationResult !== 9 /* FILE_NOT_DIRECTORY */) {
            this.logService.error(error);
          }
        }
        return "{}";
      }));
    };
    const [[settingsContent], standAloneConfigurationContents] = await Promise.all([
      donotResolveSettings ? Promise.resolve([void 0]) : resolveContents([this.settingsResource]),
      resolveContents(this.standAloneConfigurationResources.map(([, resource]) => resource))
    ]);
    return [settingsContent, standAloneConfigurationContents.map((content, index2) => [this.standAloneConfigurationResources[index2][0], content])];
  }
  async loadConfiguration(settingsConfiguration) {
    const [settingsContent, standAloneConfigurationContents] = await this.resolveContents(!!settingsConfiguration);
    this._standAloneConfigurations = [];
    this._folderSettingsModelParser.parse("", this._folderSettingsParseOptions);
    if (settingsContent !== void 0) {
      this._folderSettingsModelParser.parse(settingsContent, this._folderSettingsParseOptions);
    }
    for (let index2 = 0; index2 < standAloneConfigurationContents.length; index2++) {
      const contents = standAloneConfigurationContents[index2][1];
      if (contents !== void 0) {
        const standAloneConfigurationModelParser = new StandaloneConfigurationModelParser(this.standAloneConfigurationResources[index2][1].toString(), this.standAloneConfigurationResources[index2][0], this.logService);
        standAloneConfigurationModelParser.parse(contents);
        this._standAloneConfigurations.push(standAloneConfigurationModelParser.configurationModel);
      }
    }
    this.consolidate(settingsConfiguration);
    return this._cache;
  }
  getRestrictedSettings() {
    return this._folderSettingsModelParser.restrictedConfigurations;
  }
  reparse(configurationParseOptions) {
    const oldContents = this._folderSettingsModelParser.configurationModel.contents;
    this._folderSettingsParseOptions = configurationParseOptions;
    this._folderSettingsModelParser.reparse(this._folderSettingsParseOptions);
    if (!equals4(oldContents, this._folderSettingsModelParser.configurationModel.contents)) {
      this.consolidate();
    }
    return this._cache;
  }
  consolidate(settingsConfiguration) {
    this._cache = (settingsConfiguration ?? this._folderSettingsModelParser.configurationModel).merge(...this._standAloneConfigurations);
  }
  handleFileChangesEvent(event) {
    if (this.allResources.some((resource) => event.contains(resource))) {
      return true;
    }
    if (this.allResources.some((resource) => event.contains(this.uriIdentityService.extUri.dirname(resource), 2 /* DELETED */))) {
      return true;
    }
    return false;
  }
  handleFileOperationEvent(event) {
    if ((event.isOperation(0 /* CREATE */) || event.isOperation(3 /* COPY */) || event.isOperation(1 /* DELETE */) || event.isOperation(4 /* WRITE */)) && this.allResources.some((resource) => this.uriIdentityService.extUri.isEqual(event.resource, resource))) {
      return true;
    }
    if (event.isOperation(1 /* DELETE */) && this.allResources.some((resource) => this.uriIdentityService.extUri.isEqual(event.resource, this.uriIdentityService.extUri.dirname(resource)))) {
      return true;
    }
    return false;
  }
};

var WorkspaceConfiguration = class extends Disposable {
  constructor(configurationCache, fileService, uriIdentityService, logService) {
    super();
    this.configurationCache = configurationCache;
    this.fileService = fileService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    this._workspaceConfigurationDisposables = this._register(new DisposableStore());
    this._workspaceIdentifier = null;
    this._isWorkspaceTrusted = false;
    this._onDidUpdateConfiguration = this._register(new Emitter());
    this.onDidUpdateConfiguration = this._onDidUpdateConfiguration.event;
    this._initialized = false;
    this.fileService = fileService;
    this._workspaceConfiguration = this._cachedConfiguration = new CachedWorkspaceConfiguration(configurationCache, logService);
  }
  get initialized() {
    return this._initialized;
  }
  async initialize(workspaceIdentifier, workspaceTrusted) {
    this._workspaceIdentifier = workspaceIdentifier;
    this._isWorkspaceTrusted = workspaceTrusted;
    if (!this._initialized) {
      if (this.configurationCache.needsCaching(this._workspaceIdentifier.configPath)) {
        this._workspaceConfiguration = this._cachedConfiguration;
        this.waitAndInitialize(this._workspaceIdentifier);
      } else {
        this.doInitialize(new FileServiceBasedWorkspaceConfiguration(this.fileService, this.uriIdentityService, this.logService));
      }
    }
    await this.reload();
  }
  async reload() {
    if (this._workspaceIdentifier) {
      await this._workspaceConfiguration.load(this._workspaceIdentifier, { scopes: WORKSPACE_SCOPES, skipRestricted: this.isUntrusted() });
    }
  }
  getFolders() {
    return this._workspaceConfiguration.getFolders();
  }
  setFolders(folders, jsonEditingService) {
    if (this._workspaceIdentifier) {
      return jsonEditingService.write(this._workspaceIdentifier.configPath, [{ path: ["folders"], value: folders }], true).then(() => this.reload());
    }
    return Promise.resolve();
  }
  isTransient() {
    return this._workspaceConfiguration.isTransient();
  }
  getConfiguration() {
    return this._workspaceConfiguration.getWorkspaceSettings();
  }
  updateWorkspaceTrust(trusted) {
    this._isWorkspaceTrusted = trusted;
    return this.reparseWorkspaceSettings();
  }
  reparseWorkspaceSettings(configurationParseOptions) {
    this._workspaceConfiguration.reparseWorkspaceSettings({ scopes: WORKSPACE_SCOPES, skipRestricted: this.isUntrusted(), ...configurationParseOptions });
    return this.getConfiguration();
  }
  getRestrictedSettings() {
    return this._workspaceConfiguration.getRestrictedSettings();
  }
  async waitAndInitialize(workspaceIdentifier) {
    await whenProviderRegistered(workspaceIdentifier.configPath, this.fileService);
    if (!(this._workspaceConfiguration instanceof FileServiceBasedWorkspaceConfiguration)) {
      const fileServiceBasedWorkspaceConfiguration = this._register(new FileServiceBasedWorkspaceConfiguration(this.fileService, this.uriIdentityService, this.logService));
      await fileServiceBasedWorkspaceConfiguration.load(workspaceIdentifier, { scopes: WORKSPACE_SCOPES, skipRestricted: this.isUntrusted() });
      this.doInitialize(fileServiceBasedWorkspaceConfiguration);
      this.onDidWorkspaceConfigurationChange(false, true);
    }
  }
  doInitialize(fileServiceBasedWorkspaceConfiguration) {
    this._workspaceConfigurationDisposables.clear();
    this._workspaceConfiguration = this._workspaceConfigurationDisposables.add(fileServiceBasedWorkspaceConfiguration);
    this._workspaceConfigurationDisposables.add(this._workspaceConfiguration.onDidChange((e4) => this.onDidWorkspaceConfigurationChange(true, false)));
    this._initialized = true;
  }
  isUntrusted() {
    return !this._isWorkspaceTrusted;
  }
  async onDidWorkspaceConfigurationChange(reload, fromCache) {
    if (reload) {
      await this.reload();
    }
    this.updateCache();
    this._onDidUpdateConfiguration.fire(fromCache);
  }
  async updateCache() {
    if (this._workspaceIdentifier && this.configurationCache.needsCaching(this._workspaceIdentifier.configPath) && this._workspaceConfiguration instanceof FileServiceBasedWorkspaceConfiguration) {
      const content = await this._workspaceConfiguration.resolveContent(this._workspaceIdentifier);
      await this._cachedConfiguration.updateWorkspace(this._workspaceIdentifier, content);
    }
  }
};

var FileServiceBasedWorkspaceConfiguration = class extends Disposable {
  constructor(fileService, uriIdentityService, logService) {
    super();
    this.fileService = fileService;
    this.logService = logService;
    this._workspaceIdentifier = null;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this.workspaceConfigurationModelParser = new WorkspaceConfigurationModelParser("", logService);
    this.workspaceSettings = ConfigurationModel.createEmptyModel(logService);
    this._register(Event2.any(
      Event2.filter(this.fileService.onDidFilesChange, (e4) => !!this._workspaceIdentifier && e4.contains(this._workspaceIdentifier.configPath)),
      Event2.filter(this.fileService.onDidRunOperation, (e4) => !!this._workspaceIdentifier && (e4.isOperation(0 /* CREATE */) || e4.isOperation(3 /* COPY */) || e4.isOperation(1 /* DELETE */) || e4.isOperation(4 /* WRITE */)) && uriIdentityService.extUri.isEqual(e4.resource, this._workspaceIdentifier.configPath))
    )(() => this.reloadConfigurationScheduler.schedule()));
    this.reloadConfigurationScheduler = this._register(new RunOnceScheduler(() => this._onDidChange.fire(), 50));
    this.workspaceConfigWatcher = this._register(this.watchWorkspaceConfigurationFile());
  }
  get workspaceIdentifier() {
    return this._workspaceIdentifier;
  }
  async resolveContent(workspaceIdentifier) {
    const content = await this.fileService.readFile(workspaceIdentifier.configPath, { atomic: true });
    return content.value.toString();
  }
  async load(workspaceIdentifier, configurationParseOptions) {
    if (!this._workspaceIdentifier || this._workspaceIdentifier.id !== workspaceIdentifier.id) {
      this._workspaceIdentifier = workspaceIdentifier;
      this.workspaceConfigurationModelParser = new WorkspaceConfigurationModelParser(this._workspaceIdentifier.id, this.logService);
      dispose(this.workspaceConfigWatcher);
      this.workspaceConfigWatcher = this._register(this.watchWorkspaceConfigurationFile());
    }
    let contents = "";
    try {
      contents = await this.resolveContent(this._workspaceIdentifier);
    } catch (error) {
      const exists = await this.fileService.exists(this._workspaceIdentifier.configPath);
      if (exists) {
        this.logService.error(error);
      }
    }
    this.workspaceConfigurationModelParser.parse(contents, configurationParseOptions);
    this.consolidate();
  }
  getConfigurationModel() {
    return this.workspaceConfigurationModelParser.configurationModel;
  }
  getFolders() {
    return this.workspaceConfigurationModelParser.folders;
  }
  isTransient() {
    return this.workspaceConfigurationModelParser.transient;
  }
  getWorkspaceSettings() {
    return this.workspaceSettings;
  }
  reparseWorkspaceSettings(configurationParseOptions) {
    this.workspaceConfigurationModelParser.reparseWorkspaceSettings(configurationParseOptions);
    this.consolidate();
    return this.getWorkspaceSettings();
  }
  getRestrictedSettings() {
    return this.workspaceConfigurationModelParser.getRestrictedWorkspaceSettings();
  }
  consolidate() {
    this.workspaceSettings = this.workspaceConfigurationModelParser.settingsModel.merge(this.workspaceConfigurationModelParser.launchModel, this.workspaceConfigurationModelParser.tasksModel);
  }
  watchWorkspaceConfigurationFile() {
    return this._workspaceIdentifier ? this.fileService.watch(this._workspaceIdentifier.configPath) : Disposable.None;
  }
};

var CachedWorkspaceConfiguration = class {
  constructor(configurationCache, logService) {
    this.configurationCache = configurationCache;
    this.logService = logService;
    this.onDidChange = Event2.None;
    this.workspaceConfigurationModelParser = new WorkspaceConfigurationModelParser("", logService);
    this.workspaceSettings = ConfigurationModel.createEmptyModel(logService);
  }
  async load(workspaceIdentifier, configurationParseOptions) {
    try {
      const key3 = this.getKey(workspaceIdentifier);
      const contents = await this.configurationCache.read(key3);
      const parsed = JSON.parse(contents);
      if (parsed.content) {
        this.workspaceConfigurationModelParser = new WorkspaceConfigurationModelParser(key3.key, this.logService);
        this.workspaceConfigurationModelParser.parse(parsed.content, configurationParseOptions);
        this.consolidate();
      }
    } catch (e4) {
    }
  }
  get workspaceIdentifier() {
    return null;
  }
  getConfigurationModel() {
    return this.workspaceConfigurationModelParser.configurationModel;
  }
  getFolders() {
    return this.workspaceConfigurationModelParser.folders;
  }
  isTransient() {
    return this.workspaceConfigurationModelParser.transient;
  }
  getWorkspaceSettings() {
    return this.workspaceSettings;
  }
  reparseWorkspaceSettings(configurationParseOptions) {
    this.workspaceConfigurationModelParser.reparseWorkspaceSettings(configurationParseOptions);
    this.consolidate();
    return this.getWorkspaceSettings();
  }
  getRestrictedSettings() {
    return this.workspaceConfigurationModelParser.getRestrictedWorkspaceSettings();
  }
  consolidate() {
    this.workspaceSettings = this.workspaceConfigurationModelParser.settingsModel.merge(this.workspaceConfigurationModelParser.launchModel, this.workspaceConfigurationModelParser.tasksModel);
  }
  async updateWorkspace(workspaceIdentifier, content) {
    try {
      const key3 = this.getKey(workspaceIdentifier);
      if (content) {
        await this.configurationCache.write(key3, JSON.stringify({ content }));
      } else {
        await this.configurationCache.remove(key3);
      }
    } catch (error) {
    }
  }
  getKey(workspaceIdentifier) {
    return {
      type: "workspaces",
      key: workspaceIdentifier.id
    };
  }
};

var CachedFolderConfiguration = class {
  constructor(folder, configFolderRelativePath, configurationParseOptions, configurationCache, logService) {
    this.configurationCache = configurationCache;
    this.logService = logService;
    this.onDidChange = Event2.None;
    this.key = { type: "folder", key: hash(joinPath(folder, configFolderRelativePath).toString()).toString(16) };
    this._folderSettingsModelParser = new ConfigurationModelParser("CachedFolderConfiguration", logService);
    this._folderSettingsParseOptions = configurationParseOptions;
    this._standAloneConfigurations = [];
    this.configurationModel = ConfigurationModel.createEmptyModel(logService);
  }
  async loadConfiguration() {
    try {
      const contents = await this.configurationCache.read(this.key);
      const { content: configurationContents } = JSON.parse(contents.toString());
      if (configurationContents) {
        for (const key3 of Object.keys(configurationContents)) {
          if (key3 === FOLDER_SETTINGS_NAME) {
            this._folderSettingsModelParser.parse(configurationContents[key3], this._folderSettingsParseOptions);
          } else {
            const standAloneConfigurationModelParser = new StandaloneConfigurationModelParser(key3, key3, this.logService);
            standAloneConfigurationModelParser.parse(configurationContents[key3]);
            this._standAloneConfigurations.push(standAloneConfigurationModelParser.configurationModel);
          }
        }
      }
      this.consolidate();
    } catch (e4) {
    }
    return this.configurationModel;
  }
  async updateConfiguration(settingsContent, standAloneConfigurationContents) {
    const content = {};
    if (settingsContent) {
      content[FOLDER_SETTINGS_NAME] = settingsContent;
    }
    standAloneConfigurationContents.forEach(([key3, contents]) => {
      if (contents) {
        content[key3] = contents;
      }
    });
    if (Object.keys(content).length) {
      await this.configurationCache.write(this.key, JSON.stringify({ content }));
    } else {
      await this.configurationCache.remove(this.key);
    }
  }
  getRestrictedSettings() {
    return this._folderSettingsModelParser.restrictedConfigurations;
  }
  reparse(configurationParseOptions) {
    this._folderSettingsParseOptions = configurationParseOptions;
    this._folderSettingsModelParser.reparse(this._folderSettingsParseOptions);
    this.consolidate();
    return this.configurationModel;
  }
  consolidate() {
    this.configurationModel = this._folderSettingsModelParser.configurationModel.merge(...this._standAloneConfigurations);
  }
  getUnsupportedKeys() {
    return [];
  }
};

var FolderConfiguration = class extends Disposable {
  constructor(useCache, workspaceFolder, configFolderRelativePath, workbenchState, workspaceTrusted, fileService, uriIdentityService, logService, configurationCache) {
    super();
    this.workspaceFolder = workspaceFolder;
    this.workbenchState = workbenchState;
    this.workspaceTrusted = workspaceTrusted;
    this.configurationCache = configurationCache;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this.scopes = 3 /* WORKSPACE */ === this.workbenchState ? FOLDER_SCOPES : WORKSPACE_SCOPES;
    this.configurationFolder = uriIdentityService.extUri.joinPath(workspaceFolder.uri, configFolderRelativePath);
    this.cachedFolderConfiguration = new CachedFolderConfiguration(workspaceFolder.uri, configFolderRelativePath, { scopes: this.scopes, skipRestricted: this.isUntrusted() }, configurationCache, logService);
    if (useCache && this.configurationCache.needsCaching(workspaceFolder.uri)) {
      this.folderConfiguration = this.cachedFolderConfiguration;
      whenProviderRegistered(workspaceFolder.uri, fileService).then(() => {
        this.folderConfiguration = this._register(this.createFileServiceBasedConfiguration(fileService, uriIdentityService, logService));
        this._register(this.folderConfiguration.onDidChange((e4) => this.onDidFolderConfigurationChange()));
        this.onDidFolderConfigurationChange();
      });
    } else {
      this.folderConfiguration = this._register(this.createFileServiceBasedConfiguration(fileService, uriIdentityService, logService));
      this._register(this.folderConfiguration.onDidChange((e4) => this.onDidFolderConfigurationChange()));
    }
  }
  loadConfiguration() {
    return this.folderConfiguration.loadConfiguration();
  }
  updateWorkspaceTrust(trusted) {
    this.workspaceTrusted = trusted;
    return this.reparse();
  }
  reparse() {
    const configurationModel = this.folderConfiguration.reparse({ scopes: this.scopes, skipRestricted: this.isUntrusted() });
    this.updateCache();
    return configurationModel;
  }
  getRestrictedSettings() {
    return this.folderConfiguration.getRestrictedSettings();
  }
  isUntrusted() {
    return !this.workspaceTrusted;
  }
  onDidFolderConfigurationChange() {
    this.updateCache();
    this._onDidChange.fire();
  }
  createFileServiceBasedConfiguration(fileService, uriIdentityService, logService) {
    const settingsResource = uriIdentityService.extUri.joinPath(this.configurationFolder, `${FOLDER_SETTINGS_NAME}.json`);
    const standAloneConfigurationResources = [TASKS_CONFIGURATION_KEY, LAUNCH_CONFIGURATION_KEY, MCP_CONFIGURATION_KEY].map((name) => [name, uriIdentityService.extUri.joinPath(this.configurationFolder, `${name}.json`)]);
    return new FileServiceBasedConfiguration(this.configurationFolder.toString(), settingsResource, standAloneConfigurationResources, { scopes: this.scopes, skipRestricted: this.isUntrusted() }, fileService, uriIdentityService, logService);
  }
  async updateCache() {
    if (this.configurationCache.needsCaching(this.configurationFolder) && this.folderConfiguration instanceof FileServiceBasedConfiguration) {
      const [settingsContent, standAloneConfigurationContents] = await this.folderConfiguration.resolveContents();
      this.cachedFolderConfiguration.updateConfiguration(settingsContent, standAloneConfigurationContents);
    }
  }
  addRelated(disposable) {
    this._register(disposable);
  }
};
export { DefaultConfiguration2, UserConfiguration, FileServiceBasedConfiguration, WorkspaceConfiguration, FileServiceBasedWorkspaceConfiguration, CachedWorkspaceConfiguration, CachedFolderConfiguration, FolderConfiguration };
