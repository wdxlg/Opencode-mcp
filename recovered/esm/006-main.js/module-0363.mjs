// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/configuration/common/configurationService.ts
import { __esm } from "./module-0000.mjs";
import { distinct, equals, init_arrays } from "./module-0013.mjs";
import { Queue, RunOnceScheduler, init_async } from "./module-0034.mjs";
import { VSBuffer, init_buffer } from "./module-0050.mjs";
import { Emitter, init_event } from "./module-0021.mjs";
import { init_json, parse4 } from "./module-0120.mjs";
import { applyEdits, init_jsonEdit, setProperty } from "./module-0126.mjs";
import { Disposable, init_lifecycle } from "./module-0018.mjs";
import { ResourceMap, init_map } from "./module-0014.mjs";
import { equals2, init_objects } from "./module-0121.mjs";
import { OS, init_platform } from "./module-0006.mjs";
import { extUriBiasedIgnorePathCase, init_resources } from "./module-0032.mjs";
import { init_configuration, isConfigurationOverrides, isConfigurationUpdateOverrides } from "./module-0040.mjs";
import { Configuration, ConfigurationChangeEvent, ConfigurationModel, UserSettings, init_configurationModels } from "./module-0361.mjs";
import { init_configurationRegistry, keyFromOverrideIdentifiers } from "./module-0045.mjs";
import { DefaultConfiguration, NullPolicyConfiguration, PolicyConfiguration, init_configurations } from "./module-0362.mjs";
import { init_files } from "./module-0072.mjs";
import { NullPolicyService, init_policy2 } from "./module-0210.mjs";


// src/vs/platform/configuration/common/configurationService.ts
var ConfigurationService, ConfigurationEditing;

var init_configurationService = __esm({
  "src/vs/platform/configuration/common/configurationService.ts"() {
    init_arrays();
    init_async();
    init_buffer();
    init_event();
    init_json();
    init_jsonEdit();
    init_lifecycle();
    init_map();
    init_objects();
    init_platform();
    init_resources();
    init_configuration();
    init_configurationModels();
    init_configurationRegistry();
    init_configurations();
    init_files();
    init_policy2();
    ConfigurationService = class extends Disposable {
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
        const path4 = overrides?.overrideIdentifiers?.length ? [keyFromOverrideIdentifiers(overrides.overrideIdentifiers), key] : [key];
        await this.configurationEditing.write(path4, value);
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
    ConfigurationEditing = class {
      constructor(settingsResource, fileService, configurationService) {
        this.settingsResource = settingsResource;
        this.fileService = fileService;
        this.configurationService = configurationService;
        this.queue = new Queue();
      }
      write(path4, value) {
        return this.queue.queue(() => this.doWriteConfiguration(path4, value));
      }
      async doWriteConfiguration(path4, value) {
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
        parse4(content, parseErrors, { allowTrailingComma: true, allowEmptyContent: true });
        if (parseErrors.length > 0) {
          throw new Error("Unable to write into the settings file. Please open the file to correct errors/warnings in the file and try again.");
        }
        const edits = this.getEdits(content, path4, value);
        content = applyEdits(content, edits);
        await this.fileService.writeFile(this.settingsResource, VSBuffer.fromString(content));
      }
      getEdits(content, path4, value) {
        const { tabSize, insertSpaces, eol } = this.formattingOptions;
        if (!path4.length) {
          const content2 = JSON.stringify(value, null, insertSpaces ? " ".repeat(tabSize) : "	");
          return [{
            content: content2,
            length: content2.length,
            offset: 0
          }];
        }
        return setProperty(content, path4, value, { tabSize, insertSpaces, eol });
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
  }
});
export { ConfigurationService, ConfigurationEditing, init_configurationService };
