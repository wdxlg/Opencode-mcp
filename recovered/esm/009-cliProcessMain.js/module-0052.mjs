// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/node/cliProcessMain.js
// Original module marker: src/vs/platform/configuration/common/configurationService.ts
import { Disposable } from "./module-0011.mjs";
import { Emitter } from "./module-0017.mjs";
import { DefaultConfiguration, NullPolicyConfiguration, PolicyConfiguration } from "./module-0051.mjs";
import { NullPolicyService } from "./module-0050.mjs";
import { Configuration, ConfigurationChangeEvent, ConfigurationModel, UserSettings } from "./module-0045.mjs";
import { extUriBiasedIgnorePathCase } from "./module-0026.mjs";
import { ResourceMap } from "./module-0007.mjs";
import { Queue, RunOnceScheduler } from "./module-0028.mjs";
import { isConfigurationOverrides, isConfigurationUpdateOverrides } from "./module-0031.mjs";
import { distinct, equals } from "./module-0006.mjs";
import { equals2 } from "./module-0037.mjs";
import { keyFromOverrideIdentifiers } from "./module-0042.mjs";
import { parse2 } from "./module-0034.mjs";
import { applyEdits, setProperty } from "./module-0036.mjs";
import { VSBuffer } from "./module-0033.mjs";
import { OS } from "./module-0014.mjs";


// src/vs/platform/configuration/common/configurationService.ts
var ConfigurationService = class extends Disposable {
  constructor(settingsResource, fileService, policyService, logService) {
    super();
    this.settingsResource = settingsResource;
    this.logService = logService;
    this._onDidChangeConfiguration = this._register(new Emitter());
    this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
    this.defaultConfiguration = this._register(new DefaultConfiguration(logService));
    this.policyConfiguration = policyService instanceof NullPolicyService ? new NullPolicyConfiguration() : this._register(new PolicyConfiguration(this.defaultConfiguration, policyService, logService));
    this.userConfiguration = this._register(new UserSettings(this.settingsResource, {}, extUriBiasedIgnorePathCase, fileService, logService));
    this.configuration = new Configuration(
      this.defaultConfiguration.configurationModel,
      this.policyConfiguration.configurationModel,
      ConfigurationModel.createEmptyModel(logService),
      ConfigurationModel.createEmptyModel(logService),
      ConfigurationModel.createEmptyModel(logService),
      ConfigurationModel.createEmptyModel(logService),
      new ResourceMap(),
      ConfigurationModel.createEmptyModel(logService),
      new ResourceMap(),
      logService
    );
    this.configurationEditing = new ConfigurationEditing(settingsResource, fileService, this);
    this.reloadConfigurationScheduler = this._register(new RunOnceScheduler(() => this.reloadConfiguration(), 50));
    this._register(this.defaultConfiguration.onDidChangeConfiguration(({ defaults, properties }) => this.onDidDefaultConfigurationChange(defaults, properties)));
    this._register(this.policyConfiguration.onDidChangeConfiguration((model) => this.onDidPolicyConfigurationChange(model)));
    this._register(this.userConfiguration.onDidChange(() => this.reloadConfigurationScheduler.schedule()));
  }
  async initialize() {
    const [defaultModel, policyModel, userModel] = await Promise.all([this.defaultConfiguration.initialize(), this.policyConfiguration.initialize(), this.userConfiguration.loadConfiguration()]);
    this.configuration = new Configuration(
      defaultModel,
      policyModel,
      ConfigurationModel.createEmptyModel(this.logService),
      userModel,
      ConfigurationModel.createEmptyModel(this.logService),
      ConfigurationModel.createEmptyModel(this.logService),
      new ResourceMap(),
      ConfigurationModel.createEmptyModel(this.logService),
      new ResourceMap(),
      this.logService
    );
  }
  getConfigurationData() {
    return this.configuration.toData();
  }
  getValue(arg1, arg2) {
    const section = typeof arg1 === "string" ? arg1 : void 0;
    const overrides = isConfigurationOverrides(arg1) ? arg1 : isConfigurationOverrides(arg2) ? arg2 : {};
    return this.configuration.getValue(section, overrides, void 0);
  }
  async updateValue(key, value, arg3, arg4, options) {
    const overrides = isConfigurationUpdateOverrides(arg3) ? arg3 : isConfigurationOverrides(arg3) ? { resource: arg3.resource, overrideIdentifiers: arg3.overrideIdentifier ? [arg3.overrideIdentifier] : void 0 } : void 0;
    const target = overrides ? arg4 : arg3;
    if (target !== void 0) {
      if (target !== 3 /* USER_LOCAL */ && target !== 2 /* USER */) {
        throw new Error(`Unable to write ${key} to target ${target}.`);
      }
    }
    if (overrides?.overrideIdentifiers) {
      overrides.overrideIdentifiers = distinct(overrides.overrideIdentifiers);
      overrides.overrideIdentifiers = overrides.overrideIdentifiers.length ? overrides.overrideIdentifiers : void 0;
    }
    const inspect = this.inspect(key, { resource: overrides?.resource, overrideIdentifier: overrides?.overrideIdentifiers ? overrides.overrideIdentifiers[0] : void 0 });
    if (inspect.policyValue !== void 0) {
      throw new Error(`Unable to write ${key} because it is configured in system policy.`);
    }
    if (equals2(value, inspect.defaultValue)) {
      value = void 0;
    }
    if (overrides?.overrideIdentifiers?.length && overrides.overrideIdentifiers.length > 1) {
      const overrideIdentifiers = overrides.overrideIdentifiers.sort();
      const existingOverrides = this.configuration.localUserConfiguration.overrides.find((override) => equals([...override.identifiers].sort(), overrideIdentifiers));
      if (existingOverrides) {
        overrides.overrideIdentifiers = existingOverrides.identifiers;
      }
    }
    const path = overrides?.overrideIdentifiers?.length ? [keyFromOverrideIdentifiers(overrides.overrideIdentifiers), key] : [key];
    await this.configurationEditing.write(path, value);
    await this.reloadConfiguration();
  }
  inspect(key, overrides = {}) {
    return this.configuration.inspect(key, overrides, void 0);
  }
  keys() {
    return this.configuration.keys(void 0);
  }
  async reloadConfiguration() {
    const configurationModel = await this.userConfiguration.loadConfiguration();
    this.onDidChangeUserConfiguration(configurationModel);
  }
  onDidChangeUserConfiguration(userConfigurationModel) {
    const previous = this.configuration.toData();
    const change = this.configuration.compareAndUpdateLocalUserConfiguration(userConfigurationModel);
    this.trigger(change, previous, 2 /* USER */);
  }
  onDidDefaultConfigurationChange(defaultConfigurationModel, properties) {
    const previous = this.configuration.toData();
    const change = this.configuration.compareAndUpdateDefaultConfiguration(defaultConfigurationModel, properties);
    this.trigger(change, previous, 7 /* DEFAULT */);
  }
  onDidPolicyConfigurationChange(policyConfiguration) {
    const previous = this.configuration.toData();
    const change = this.configuration.compareAndUpdatePolicyConfiguration(policyConfiguration);
    this.trigger(change, previous, 7 /* DEFAULT */);
  }
  trigger(configurationChange, previous, source) {
    const event = new ConfigurationChangeEvent(configurationChange, { data: previous }, this.configuration, void 0, this.logService);
    event.source = source;
    this._onDidChangeConfiguration.fire(event);
  }
};

var ConfigurationEditing = class {
  constructor(settingsResource, fileService, configurationService) {
    this.settingsResource = settingsResource;
    this.fileService = fileService;
    this.configurationService = configurationService;
    this.queue = new Queue();
  }
  write(path, value) {
    return this.queue.queue(() => this.doWriteConfiguration(path, value));
  }
  async doWriteConfiguration(path, value) {
    let content;
    try {
      const fileContent = await this.fileService.readFile(this.settingsResource);
      content = fileContent.value.toString();
    } catch (error) {
      if (error.fileOperationResult === 1 /* FILE_NOT_FOUND */) {
        content = "{}";
      } else {
        throw error;
      }
    }
    const parseErrors = [];
    parse2(content, parseErrors, { allowTrailingComma: true, allowEmptyContent: true });
    if (parseErrors.length > 0) {
      throw new Error("Unable to write into the settings file. Please open the file to correct errors/warnings in the file and try again.");
    }
    const edits = this.getEdits(content, path, value);
    content = applyEdits(content, edits);
    await this.fileService.writeFile(this.settingsResource, VSBuffer.fromString(content));
  }
  getEdits(content, path, value) {
    const { tabSize, insertSpaces, eol } = this.formattingOptions;
    if (!path.length) {
      const content2 = JSON.stringify(value, null, insertSpaces ? " ".repeat(tabSize) : "	");
      return [{
        content: content2,
        length: content2.length,
        offset: 0
      }];
    }
    return setProperty(content, path, value, { tabSize, insertSpaces, eol });
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
export { ConfigurationService, ConfigurationEditing };
