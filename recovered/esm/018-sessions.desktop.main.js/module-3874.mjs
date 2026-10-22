// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/configuration/common/configurationModels.ts
import { Configuration2, ConfigurationModel, ConfigurationModelParser } from "./module-3872.mjs";
import { isBoolean } from "./module-0010.mjs";
import { toValuesTree } from "./module-0132.mjs";
import { equals4 } from "./module-0098.mjs";
import { distinct } from "./module-0007.mjs";


// src/vs/workbench/services/configuration/common/configurationModels.ts
var WorkspaceConfigurationModelParser = class extends ConfigurationModelParser {
  constructor(name, logService) {
    super(name, logService);
    this._folders = [];
    this._transient = false;
    this._settingsModelParser = new ConfigurationModelParser(name, logService);
    this._launchModel = ConfigurationModel.createEmptyModel(logService);
    this._tasksModel = ConfigurationModel.createEmptyModel(logService);
  }
  get folders() {
    return this._folders;
  }
  get transient() {
    return this._transient;
  }
  get settingsModel() {
    return this._settingsModelParser.configurationModel;
  }
  get launchModel() {
    return this._launchModel;
  }
  get tasksModel() {
    return this._tasksModel;
  }
  reparseWorkspaceSettings(configurationParseOptions) {
    this._settingsModelParser.reparse(configurationParseOptions);
  }
  getRestrictedWorkspaceSettings() {
    return this._settingsModelParser.restrictedConfigurations;
  }
  doParseRaw(raw, configurationParseOptions) {
    this._folders = raw["folders"] || [];
    this._transient = isBoolean(raw["transient"]) && raw["transient"];
    this._settingsModelParser.parseRaw(raw["settings"], configurationParseOptions);
    this._launchModel = this.createConfigurationModelFrom(raw, "launch");
    this._tasksModel = this.createConfigurationModelFrom(raw, "tasks");
    return super.doParseRaw(raw, configurationParseOptions);
  }
  createConfigurationModelFrom(raw, key3) {
    const data = raw[key3];
    if (data) {
      const contents = toValuesTree(data, (message) => console.error(`Conflict in settings file ${this._name}: ${message}`));
      const scopedContents = /* @__PURE__ */ Object.create(null);
      scopedContents[key3] = contents;
      const keys = Object.keys(data).map((k) => `${key3}.${k}`);
      return new ConfigurationModel(scopedContents, keys, [], void 0, this.logService);
    }
    return ConfigurationModel.createEmptyModel(this.logService);
  }
};

var StandaloneConfigurationModelParser = class extends ConfigurationModelParser {
  constructor(name, scope, logService) {
    super(name, logService);
    this.scope = scope;
  }
  doParseRaw(raw, configurationParseOptions) {
    const contents = toValuesTree(raw, (message) => console.error(`Conflict in settings file ${this._name}: ${message}`));
    const scopedContents = /* @__PURE__ */ Object.create(null);
    scopedContents[this.scope] = contents;
    const keys = Object.keys(raw).map((key3) => `${this.scope}.${key3}`);
    return { contents: scopedContents, keys, overrides: [] };
  }
};

var Configuration3 = class extends Configuration2 {
  constructor(defaults, policy, application, localUser, remoteUser, workspaceConfiguration, folders, memoryConfiguration, memoryConfigurationByResource, _workspace, logService) {
    super(defaults, policy, application, localUser, remoteUser, workspaceConfiguration, folders, memoryConfiguration, memoryConfigurationByResource, logService);
    this._workspace = _workspace;
  }
  getValue(key3, overrides = {}) {
    return super.getValue(key3, overrides, this._workspace);
  }
  inspect(key3, overrides = {}) {
    return super.inspect(key3, overrides, this._workspace);
  }
  keys() {
    return super.keys(this._workspace);
  }
  compareAndDeleteFolderConfiguration(folder) {
    if (this._workspace && this._workspace.folders.length > 0 && this._workspace.folders[0].uri.toString() === folder.toString()) {
      return { keys: [], overrides: [] };
    }
    return super.compareAndDeleteFolderConfiguration(folder);
  }
  compare(other) {
    const compare6 = (fromKeys, toKeys, overrideIdentifier) => {
      const keys2 = [];
      keys2.push(...toKeys.filter((key3) => fromKeys.indexOf(key3) === -1));
      keys2.push(...fromKeys.filter((key3) => toKeys.indexOf(key3) === -1));
      keys2.push(...fromKeys.filter((key3) => {
        if (toKeys.indexOf(key3) === -1) {
          return false;
        }
        if (!equals4(this.getValue(key3, { overrideIdentifier }), other.getValue(key3, { overrideIdentifier }))) {
          return true;
        }
        return this._workspace && this._workspace.folders.some((folder) => !equals4(this.getValue(key3, { resource: folder.uri, overrideIdentifier }), other.getValue(key3, { resource: folder.uri, overrideIdentifier })));
      }));
      return keys2;
    };
    const keys = compare6(this.allKeys(), other.allKeys());
    const overrides = [];
    const allOverrideIdentifiers = distinct([...this.allOverrideIdentifiers(), ...other.allOverrideIdentifiers()]);
    for (const overrideIdentifier of allOverrideIdentifiers) {
      const keys2 = compare6(this.getAllKeysForOverrideIdentifier(overrideIdentifier), other.getAllKeysForOverrideIdentifier(overrideIdentifier), overrideIdentifier);
      if (keys2.length) {
        overrides.push([overrideIdentifier, keys2]);
      }
    }
    return { keys, overrides };
  }
};
export { WorkspaceConfigurationModelParser, StandaloneConfigurationModelParser, Configuration3 };
