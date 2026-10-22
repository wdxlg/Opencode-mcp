// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/configuration/common/configurationModels.ts
import { deepClone, deepFreeze, equals4 } from "./module-0098.mjs";
import { addToValueTree, getConfigurationValue, removeFromValueTree, toValuesTree } from "./module-0132.mjs";
import { distinct, equals } from "./module-0007.mjs";
import { isObject, isUndefinedOrNull } from "./module-0010.mjs";
import { Extensions4, OVERRIDE_PROPERTY_REGEX, overrideIdentifiersFromKey } from "./module-0140.mjs";
import { visit } from "./module-0885.mjs";
import { Registry } from "./module-0090.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { URI } from "./module-0032.mjs";


// src/vs/platform/configuration/common/configurationModels.ts
function freeze2(data) {
  return Object.isFrozen(data) ? data : deepFreeze(data);
}

var ConfigurationModel = class _ConfigurationModel {
  constructor(_contents, _keys, _overrides, _raw, logService) {
    this._contents = _contents;
    this._keys = _keys;
    this._overrides = _overrides;
    this._raw = _raw;
    this.logService = logService;
    this.overrideConfigurations = /* @__PURE__ */ new Map();
  }
  static createEmptyModel(logService) {
    return new _ConfigurationModel({}, [], [], void 0, logService);
  }
  get rawConfiguration() {
    if (!this._rawConfiguration) {
      if (this._raw) {
        const rawConfigurationModels = (Array.isArray(this._raw) ? this._raw : [this._raw]).map((raw) => {
          if (raw instanceof _ConfigurationModel) {
            return raw;
          }
          const parser2 = new ConfigurationModelParser("", this.logService);
          parser2.parseRaw(raw);
          return parser2.configurationModel;
        });
        this._rawConfiguration = rawConfigurationModels.reduce((previous, current) => current === previous ? current : previous.merge(current), rawConfigurationModels[0]);
      } else {
        this._rawConfiguration = this;
      }
    }
    return this._rawConfiguration;
  }
  get contents() {
    return this._contents;
  }
  get overrides() {
    return this._overrides;
  }
  get keys() {
    return this._keys;
  }
  get raw() {
    if (!this._raw) {
      return void 0;
    }
    if (Array.isArray(this._raw) && this._raw.every((raw) => raw instanceof _ConfigurationModel)) {
      return void 0;
    }
    return this._raw;
  }
  isEmpty() {
    return this._keys.length === 0 && Object.keys(this._contents).length === 0 && this._overrides.length === 0;
  }
  getValue(section) {
    return section ? getConfigurationValue(this.contents, section) : this.contents;
  }
  inspect(section, overrideIdentifier) {
    const that = this;
    return {
      get value() {
        return freeze2(that.rawConfiguration.getValue(section));
      },
      get override() {
        return overrideIdentifier ? freeze2(that.rawConfiguration.getOverrideValue(section, overrideIdentifier)) : void 0;
      },
      get merged() {
        return freeze2(overrideIdentifier ? that.rawConfiguration.override(overrideIdentifier).getValue(section) : that.rawConfiguration.getValue(section));
      },
      get overrides() {
        const overrides = [];
        for (const { contents, identifiers: identifiers2, keys } of that.rawConfiguration.overrides) {
          const value2 = new _ConfigurationModel(contents, keys, [], void 0, that.logService).getValue(section);
          if (value2 !== void 0) {
            overrides.push({ identifiers: identifiers2, value: value2 });
          }
        }
        return overrides.length ? freeze2(overrides) : void 0;
      }
    };
  }
  getOverrideValue(section, overrideIdentifier) {
    const overrideContents = this.getContentsForOverrideIdentifer(overrideIdentifier);
    return overrideContents ? section ? getConfigurationValue(overrideContents, section) : overrideContents : void 0;
  }
  getKeysForOverrideIdentifier(identifier2) {
    const keys = [];
    for (const override of this.overrides) {
      if (override.identifiers.includes(identifier2)) {
        keys.push(...override.keys);
      }
    }
    return distinct(keys);
  }
  getAllOverrideIdentifiers() {
    const result = [];
    for (const override of this.overrides) {
      result.push(...override.identifiers);
    }
    return distinct(result);
  }
  override(identifier2) {
    let overrideConfigurationModel = this.overrideConfigurations.get(identifier2);
    if (!overrideConfigurationModel) {
      overrideConfigurationModel = this.createOverrideConfigurationModel(identifier2);
      this.overrideConfigurations.set(identifier2, overrideConfigurationModel);
    }
    return overrideConfigurationModel;
  }
  merge(...others) {
    const contents = deepClone(this.contents);
    const overrides = deepClone(this.overrides);
    const keys = [...this.keys];
    const raws = this._raw ? Array.isArray(this._raw) ? [...this._raw] : [this._raw] : [this];
    for (const other of others) {
      raws.push(...other._raw ? Array.isArray(other._raw) ? other._raw : [other._raw] : [other]);
      if (other.isEmpty()) {
        continue;
      }
      this.mergeContents(contents, other.contents);
      for (const otherOverride of other.overrides) {
        const [override] = overrides.filter((o) => equals(o.identifiers, otherOverride.identifiers));
        if (override) {
          this.mergeContents(override.contents, otherOverride.contents);
          override.keys.push(...otherOverride.keys);
          override.keys = distinct(override.keys);
        } else {
          overrides.push(deepClone(otherOverride));
        }
      }
      for (const key3 of other.keys) {
        if (keys.indexOf(key3) === -1) {
          keys.push(key3);
        }
      }
    }
    return new _ConfigurationModel(contents, keys, overrides, !raws.length || raws.every((raw) => raw instanceof _ConfigurationModel) ? void 0 : raws, this.logService);
  }
  createOverrideConfigurationModel(identifier2) {
    const overrideContents = this.getContentsForOverrideIdentifer(identifier2);
    if (!overrideContents || typeof overrideContents !== "object" || !Object.keys(overrideContents).length) {
      return this;
    }
    const contents = {};
    for (const key3 of distinct([...Object.keys(this.contents), ...Object.keys(overrideContents)])) {
      let contentsForKey = this.contents[key3];
      const overrideContentsForKey = overrideContents[key3];
      if (overrideContentsForKey) {
        if (typeof contentsForKey === "object" && typeof overrideContentsForKey === "object") {
          contentsForKey = deepClone(contentsForKey);
          this.mergeContents(contentsForKey, overrideContentsForKey);
        } else {
          contentsForKey = overrideContentsForKey;
        }
      }
      contents[key3] = contentsForKey;
    }
    return new _ConfigurationModel(contents, this.keys, this.overrides, void 0, this.logService);
  }
  mergeContents(source, target) {
    for (const key3 of Object.keys(target)) {
      if (key3 in source) {
        if (isObject(source[key3]) && isObject(target[key3])) {
          this.mergeContents(source[key3], target[key3]);
          continue;
        }
      }
      source[key3] = deepClone(target[key3]);
    }
  }
  getContentsForOverrideIdentifer(identifier2) {
    let contentsForIdentifierOnly = null;
    let contents = null;
    const mergeContents = (contentsToMerge) => {
      if (contentsToMerge) {
        if (contents) {
          this.mergeContents(contents, contentsToMerge);
        } else {
          contents = deepClone(contentsToMerge);
        }
      }
    };
    for (const override of this.overrides) {
      if (override.identifiers.length === 1 && override.identifiers[0] === identifier2) {
        contentsForIdentifierOnly = override.contents;
      } else if (override.identifiers.includes(identifier2)) {
        mergeContents(override.contents);
      }
    }
    mergeContents(contentsForIdentifierOnly);
    return contents;
  }
  toJSON() {
    return {
      contents: this.contents,
      overrides: this.overrides,
      keys: this.keys
    };
  }
  // Update methods
  addValue(key3, value2) {
    this.updateValue(key3, value2, true);
  }
  setValue(key3, value2) {
    this.updateValue(key3, value2, false);
  }
  removeValue(key3) {
    const index2 = this.keys.indexOf(key3);
    if (index2 === -1) {
      return;
    }
    this.keys.splice(index2, 1);
    removeFromValueTree(this.contents, key3);
    if (OVERRIDE_PROPERTY_REGEX.test(key3)) {
      this.overrides.splice(this.overrides.findIndex((o) => equals(o.identifiers, overrideIdentifiersFromKey(key3))), 1);
    }
  }
  updateValue(key3, value2, add) {
    addToValueTree(this.contents, key3, value2, (e4) => this.logService.error(e4));
    add = add || this.keys.indexOf(key3) === -1;
    if (add) {
      this.keys.push(key3);
    }
    if (OVERRIDE_PROPERTY_REGEX.test(key3)) {
      const overrideContents = this.contents[key3];
      const identifiers2 = overrideIdentifiersFromKey(key3);
      const override = {
        identifiers: identifiers2,
        keys: Object.keys(overrideContents),
        contents: toValuesTree(overrideContents, (message) => this.logService.error(message))
      };
      const index2 = this.overrides.findIndex((o) => equals(o.identifiers, identifiers2));
      if (index2 !== -1) {
        this.overrides[index2] = override;
      } else {
        this.overrides.push(override);
      }
    }
  }
};

var ConfigurationModelParser = class {
  constructor(_name, logService) {
    this._name = _name;
    this.logService = logService;
    this._raw = null;
    this._configurationModel = null;
    this._restrictedConfigurations = [];
    this._parseErrors = [];
  }
  get configurationModel() {
    return this._configurationModel || ConfigurationModel.createEmptyModel(this.logService);
  }
  get restrictedConfigurations() {
    return this._restrictedConfigurations;
  }
  get errors() {
    return this._parseErrors;
  }
  parse(content, options3) {
    if (!isUndefinedOrNull(content)) {
      const raw = this.doParseContent(content);
      this.parseRaw(raw, options3);
    }
  }
  reparse(options3) {
    if (this._raw) {
      this.parseRaw(this._raw, options3);
    }
  }
  parseRaw(raw, options3) {
    this._raw = raw;
    const { contents, keys, overrides, restricted, hasExcludedProperties } = this.doParseRaw(raw, options3);
    this._configurationModel = new ConfigurationModel(contents, keys, overrides, hasExcludedProperties ? [raw] : void 0, this.logService);
    this._restrictedConfigurations = restricted || [];
  }
  doParseContent(content) {
    let raw = {};
    let currentProperty = null;
    let currentParent = [];
    const previousParents = [];
    const parseErrors = [];
    function onValue(value2) {
      if (Array.isArray(currentParent)) {
        currentParent.push(value2);
      } else if (currentProperty !== null) {
        currentParent[currentProperty] = value2;
      }
    }
    const visitor = {
      onObjectBegin: () => {
        const object2 = {};
        onValue(object2);
        previousParents.push(currentParent);
        currentParent = object2;
        currentProperty = null;
      },
      onObjectProperty: (name) => {
        currentProperty = name;
      },
      onObjectEnd: () => {
        currentParent = previousParents.pop();
      },
      onArrayBegin: () => {
        const array3 = [];
        onValue(array3);
        previousParents.push(currentParent);
        currentParent = array3;
        currentProperty = null;
      },
      onArrayEnd: () => {
        currentParent = previousParents.pop();
      },
      onLiteralValue: onValue,
      onError: (error, offset, length) => {
        parseErrors.push({ error, offset, length });
      }
    };
    if (content) {
      try {
        visit(content, visitor);
        raw = currentParent[0] || {};
      } catch (e4) {
        this.logService.error(`Error while parsing settings file ${this._name}: ${e4}`);
        this._parseErrors = [e4];
      }
    }
    return raw;
  }
  doParseRaw(raw, options3) {
    const registry4 = Registry.as(Extensions4.Configuration);
    const configurationProperties = registry4.getConfigurationProperties();
    const excludedConfigurationProperties = registry4.getExcludedConfigurationProperties();
    const filtered = this.filter(raw, configurationProperties, excludedConfigurationProperties, true, options3);
    raw = filtered.raw;
    const contents = toValuesTree(raw, (message) => this.logService.error(`Conflict in settings file ${this._name}: ${message}`));
    const keys = Object.keys(raw);
    const overrides = this.toOverrides(raw, (message) => this.logService.error(`Conflict in settings file ${this._name}: ${message}`));
    return { contents, keys, overrides, restricted: filtered.restricted, hasExcludedProperties: filtered.hasExcludedProperties };
  }
  filter(properties, configurationProperties, excludedConfigurationProperties, filterOverriddenProperties, options3) {
    let hasExcludedProperties = false;
    if (!options3?.scopes && !options3?.skipRestricted && !options3?.skipUnregistered && !options3?.exclude?.length) {
      return { raw: properties, restricted: [], hasExcludedProperties };
    }
    const raw = {};
    const restricted = [];
    for (const key3 in properties) {
      if (OVERRIDE_PROPERTY_REGEX.test(key3) && filterOverriddenProperties) {
        const result = this.filter(properties[key3], configurationProperties, excludedConfigurationProperties, false, options3);
        raw[key3] = result.raw;
        hasExcludedProperties = hasExcludedProperties || result.hasExcludedProperties;
        restricted.push(...result.restricted);
      } else {
        const propertySchema = configurationProperties[key3];
        if (propertySchema?.restricted) {
          restricted.push(key3);
        }
        if (this.shouldInclude(key3, propertySchema, excludedConfigurationProperties, options3)) {
          raw[key3] = properties[key3];
        } else {
          hasExcludedProperties = true;
        }
      }
    }
    return { raw, restricted, hasExcludedProperties };
  }
  shouldInclude(key3, propertySchema, excludedConfigurationProperties, options3) {
    if (options3.exclude?.includes(key3)) {
      return false;
    }
    if (options3.include?.includes(key3)) {
      return true;
    }
    if (options3.skipRestricted && propertySchema?.restricted) {
      return false;
    }
    if (options3.skipUnregistered && !propertySchema) {
      return false;
    }
    const schema10 = propertySchema ?? excludedConfigurationProperties[key3];
    const scope = schema10 ? typeof schema10.scope !== "undefined" ? schema10.scope : 4 /* WINDOW */ : void 0;
    if (scope === void 0 || options3.scopes === void 0) {
      return true;
    }
    return options3.scopes.includes(scope);
  }
  toOverrides(raw, conflictReporter) {
    const overrides = [];
    for (const key3 of Object.keys(raw)) {
      if (OVERRIDE_PROPERTY_REGEX.test(key3)) {
        const overrideRaw = {};
        const rawKey = raw[key3];
        for (const keyInOverrideRaw in rawKey) {
          overrideRaw[keyInOverrideRaw] = rawKey[keyInOverrideRaw];
        }
        overrides.push({
          identifiers: overrideIdentifiersFromKey(key3),
          keys: Object.keys(overrideRaw),
          contents: toValuesTree(overrideRaw, conflictReporter)
        });
      }
    }
    return overrides;
  }
};

var UserSettings = class extends Disposable {
  constructor(userSettingsResource, parseOptions2, extUri2, fileService, logService) {
    super();
    this.userSettingsResource = userSettingsResource;
    this.parseOptions = parseOptions2;
    this.fileService = fileService;
    this.logService = logService;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this.parser = new ConfigurationModelParser(this.userSettingsResource.toString(), logService);
    this._register(this.fileService.watch(extUri2.dirname(this.userSettingsResource)));
    this._register(this.fileService.watch(this.userSettingsResource));
    this._register(Event2.any(
      Event2.filter(this.fileService.onDidFilesChange, (e4) => e4.contains(this.userSettingsResource)),
      Event2.filter(this.fileService.onDidRunOperation, (e4) => (e4.isOperation(0 /* CREATE */) || e4.isOperation(3 /* COPY */) || e4.isOperation(1 /* DELETE */) || e4.isOperation(4 /* WRITE */)) && extUri2.isEqual(e4.resource, userSettingsResource))
    )(() => this._onDidChange.fire()));
  }
  async loadConfiguration() {
    try {
      const content = await this.fileService.readFile(this.userSettingsResource);
      this.parser.parse(content.value.toString() || "{}", this.parseOptions);
      return this.parser.configurationModel;
    } catch (e4) {
      return ConfigurationModel.createEmptyModel(this.logService);
    }
  }
  reparse(parseOptions2) {
    if (parseOptions2) {
      this.parseOptions = parseOptions2;
    }
    this.parser.reparse(this.parseOptions);
    return this.parser.configurationModel;
  }
  getRestrictedSettings() {
    return this.parser.restrictedConfigurations;
  }
};

var ConfigurationInspectValue = class {
  constructor(key3, overrides, _value, overrideIdentifiers, defaultConfiguration, policyConfiguration, applicationConfiguration, userConfiguration, localUserConfiguration, remoteUserConfiguration, workspaceConfiguration, folderConfigurationModel, memoryConfigurationModel) {
    this.key = key3;
    this.overrides = overrides;
    this._value = _value;
    this.overrideIdentifiers = overrideIdentifiers;
    this.defaultConfiguration = defaultConfiguration;
    this.policyConfiguration = policyConfiguration;
    this.applicationConfiguration = applicationConfiguration;
    this.userConfiguration = userConfiguration;
    this.localUserConfiguration = localUserConfiguration;
    this.remoteUserConfiguration = remoteUserConfiguration;
    this.workspaceConfiguration = workspaceConfiguration;
    this.folderConfigurationModel = folderConfigurationModel;
    this.memoryConfigurationModel = memoryConfigurationModel;
  }
  get value() {
    return freeze2(this._value);
  }
  toInspectValue(inspectValue2) {
    return inspectValue2?.value !== void 0 || inspectValue2?.override !== void 0 || inspectValue2?.overrides !== void 0 ? inspectValue2 : void 0;
  }
  get defaultInspectValue() {
    if (!this._defaultInspectValue) {
      this._defaultInspectValue = this.defaultConfiguration.inspect(this.key, this.overrides.overrideIdentifier);
    }
    return this._defaultInspectValue;
  }
  get defaultValue() {
    return this.defaultInspectValue.merged;
  }
  get default() {
    return this.toInspectValue(this.defaultInspectValue);
  }
  get policyInspectValue() {
    if (this._policyInspectValue === void 0) {
      this._policyInspectValue = this.policyConfiguration ? this.policyConfiguration.inspect(this.key) : null;
    }
    return this._policyInspectValue;
  }
  get policyValue() {
    return this.policyInspectValue?.merged;
  }
  get policy() {
    return this.policyInspectValue?.value !== void 0 ? { value: this.policyInspectValue.value } : void 0;
  }
  get applicationInspectValue() {
    if (this._applicationInspectValue === void 0) {
      this._applicationInspectValue = this.applicationConfiguration ? this.applicationConfiguration.inspect(this.key) : null;
    }
    return this._applicationInspectValue;
  }
  get applicationValue() {
    return this.applicationInspectValue?.merged;
  }
  get application() {
    return this.toInspectValue(this.applicationInspectValue);
  }
  get userInspectValue() {
    if (!this._userInspectValue) {
      this._userInspectValue = this.userConfiguration.inspect(this.key, this.overrides.overrideIdentifier);
    }
    return this._userInspectValue;
  }
  get userValue() {
    return this.userInspectValue.merged;
  }
  get user() {
    return this.toInspectValue(this.userInspectValue);
  }
  get userLocalInspectValue() {
    if (!this._userLocalInspectValue) {
      this._userLocalInspectValue = this.localUserConfiguration.inspect(this.key, this.overrides.overrideIdentifier);
    }
    return this._userLocalInspectValue;
  }
  get userLocalValue() {
    return this.userLocalInspectValue.merged;
  }
  get userLocal() {
    return this.toInspectValue(this.userLocalInspectValue);
  }
  get userRemoteInspectValue() {
    if (!this._userRemoteInspectValue) {
      this._userRemoteInspectValue = this.remoteUserConfiguration.inspect(this.key, this.overrides.overrideIdentifier);
    }
    return this._userRemoteInspectValue;
  }
  get userRemoteValue() {
    return this.userRemoteInspectValue.merged;
  }
  get userRemote() {
    return this.toInspectValue(this.userRemoteInspectValue);
  }
  get workspaceInspectValue() {
    if (this._workspaceInspectValue === void 0) {
      this._workspaceInspectValue = this.workspaceConfiguration ? this.workspaceConfiguration.inspect(this.key, this.overrides.overrideIdentifier) : null;
    }
    return this._workspaceInspectValue;
  }
  get workspaceValue() {
    return this.workspaceInspectValue?.merged;
  }
  get workspace() {
    return this.toInspectValue(this.workspaceInspectValue);
  }
  get workspaceFolderInspectValue() {
    if (this._workspaceFolderInspectValue === void 0) {
      this._workspaceFolderInspectValue = this.folderConfigurationModel ? this.folderConfigurationModel.inspect(this.key, this.overrides.overrideIdentifier) : null;
    }
    return this._workspaceFolderInspectValue;
  }
  get workspaceFolderValue() {
    return this.workspaceFolderInspectValue?.merged;
  }
  get workspaceFolder() {
    return this.toInspectValue(this.workspaceFolderInspectValue);
  }
  get memoryInspectValue() {
    if (this._memoryInspectValue === void 0) {
      this._memoryInspectValue = this.memoryConfigurationModel.inspect(this.key, this.overrides.overrideIdentifier);
    }
    return this._memoryInspectValue;
  }
  get memoryValue() {
    return this.memoryInspectValue.merged;
  }
  get memory() {
    return this.toInspectValue(this.memoryInspectValue);
  }
};

var Configuration2 = class _Configuration {
  constructor(_defaultConfiguration, _policyConfiguration, _applicationConfiguration, _localUserConfiguration, _remoteUserConfiguration, _workspaceConfiguration, _folderConfigurations, _memoryConfiguration, _memoryConfigurationByResource, logService) {
    this._defaultConfiguration = _defaultConfiguration;
    this._policyConfiguration = _policyConfiguration;
    this._applicationConfiguration = _applicationConfiguration;
    this._localUserConfiguration = _localUserConfiguration;
    this._remoteUserConfiguration = _remoteUserConfiguration;
    this._workspaceConfiguration = _workspaceConfiguration;
    this._folderConfigurations = _folderConfigurations;
    this._memoryConfiguration = _memoryConfiguration;
    this._memoryConfigurationByResource = _memoryConfigurationByResource;
    this.logService = logService;
    this._workspaceConsolidatedConfiguration = null;
    this._foldersConsolidatedConfigurations = new ResourceMap();
    this._userConfiguration = null;
  }
  getValue(section, overrides, workspace) {
    const consolidateConfigurationModel = this.getConsolidatedConfigurationModel(section, overrides, workspace);
    return consolidateConfigurationModel.getValue(section);
  }
  updateValue(key3, value2, overrides = {}) {
    let memoryConfiguration;
    if (overrides.resource) {
      memoryConfiguration = this._memoryConfigurationByResource.get(overrides.resource);
      if (!memoryConfiguration) {
        memoryConfiguration = ConfigurationModel.createEmptyModel(this.logService);
        this._memoryConfigurationByResource.set(overrides.resource, memoryConfiguration);
      }
    } else {
      memoryConfiguration = this._memoryConfiguration;
    }
    if (value2 === void 0) {
      memoryConfiguration.removeValue(key3);
    } else {
      memoryConfiguration.setValue(key3, value2);
    }
    if (!overrides.resource) {
      this._workspaceConsolidatedConfiguration = null;
    }
  }
  inspect(key3, overrides, workspace) {
    const consolidateConfigurationModel = this.getConsolidatedConfigurationModel(key3, overrides, workspace);
    const folderConfigurationModel = this.getFolderConfigurationModelForResource(overrides.resource, workspace);
    const memoryConfigurationModel = overrides.resource ? this._memoryConfigurationByResource.get(overrides.resource) || this._memoryConfiguration : this._memoryConfiguration;
    const overrideIdentifiers = /* @__PURE__ */ new Set();
    for (const override of consolidateConfigurationModel.overrides) {
      for (const overrideIdentifier of override.identifiers) {
        if (consolidateConfigurationModel.getOverrideValue(key3, overrideIdentifier) !== void 0) {
          overrideIdentifiers.add(overrideIdentifier);
        }
      }
    }
    return new ConfigurationInspectValue(
      key3,
      overrides,
      consolidateConfigurationModel.getValue(key3),
      overrideIdentifiers.size ? [...overrideIdentifiers] : void 0,
      this._defaultConfiguration,
      this._policyConfiguration.isEmpty() ? void 0 : this._policyConfiguration,
      this.applicationConfiguration.isEmpty() ? void 0 : this.applicationConfiguration,
      this.userConfiguration,
      this.localUserConfiguration,
      this.remoteUserConfiguration,
      workspace ? this._workspaceConfiguration : void 0,
      folderConfigurationModel ? folderConfigurationModel : void 0,
      memoryConfigurationModel
    );
  }
  keys(workspace) {
    const folderConfigurationModel = this.getFolderConfigurationModelForResource(void 0, workspace);
    return {
      default: this._defaultConfiguration.keys.slice(0),
      policy: this._policyConfiguration.keys.slice(0),
      user: this.userConfiguration.keys.slice(0),
      workspace: this._workspaceConfiguration.keys.slice(0),
      workspaceFolder: folderConfigurationModel ? folderConfigurationModel.keys.slice(0) : []
    };
  }
  updateDefaultConfiguration(defaultConfiguration) {
    this._defaultConfiguration = defaultConfiguration;
    this._workspaceConsolidatedConfiguration = null;
    this._foldersConsolidatedConfigurations.clear();
  }
  updatePolicyConfiguration(policyConfiguration) {
    this._policyConfiguration = policyConfiguration;
  }
  updateApplicationConfiguration(applicationConfiguration) {
    this._applicationConfiguration = applicationConfiguration;
    this._workspaceConsolidatedConfiguration = null;
    this._foldersConsolidatedConfigurations.clear();
  }
  updateLocalUserConfiguration(localUserConfiguration) {
    this._localUserConfiguration = localUserConfiguration;
    this._userConfiguration = null;
    this._workspaceConsolidatedConfiguration = null;
    this._foldersConsolidatedConfigurations.clear();
  }
  updateRemoteUserConfiguration(remoteUserConfiguration) {
    this._remoteUserConfiguration = remoteUserConfiguration;
    this._userConfiguration = null;
    this._workspaceConsolidatedConfiguration = null;
    this._foldersConsolidatedConfigurations.clear();
  }
  updateWorkspaceConfiguration(workspaceConfiguration) {
    this._workspaceConfiguration = workspaceConfiguration;
    this._workspaceConsolidatedConfiguration = null;
    this._foldersConsolidatedConfigurations.clear();
  }
  updateFolderConfiguration(resource, configuration2) {
    this._folderConfigurations.set(resource, configuration2);
    this._foldersConsolidatedConfigurations.delete(resource);
  }
  deleteFolderConfiguration(resource) {
    this.folderConfigurations.delete(resource);
    this._foldersConsolidatedConfigurations.delete(resource);
  }
  compareAndUpdateDefaultConfiguration(defaults, keys) {
    const overrides = [];
    if (!keys) {
      const { added, updated, removed } = compare4(this._defaultConfiguration, defaults);
      keys = [...added, ...updated, ...removed];
    }
    for (const key3 of keys) {
      for (const overrideIdentifier of overrideIdentifiersFromKey(key3)) {
        const fromKeys = this._defaultConfiguration.getKeysForOverrideIdentifier(overrideIdentifier);
        const toKeys = defaults.getKeysForOverrideIdentifier(overrideIdentifier);
        const keys2 = [
          ...toKeys.filter((key4) => fromKeys.indexOf(key4) === -1),
          ...fromKeys.filter((key4) => toKeys.indexOf(key4) === -1),
          ...fromKeys.filter((key4) => !equals4(this._defaultConfiguration.override(overrideIdentifier).getValue(key4), defaults.override(overrideIdentifier).getValue(key4)))
        ];
        overrides.push([overrideIdentifier, keys2]);
      }
    }
    this.updateDefaultConfiguration(defaults);
    return { keys, overrides };
  }
  compareAndUpdatePolicyConfiguration(policyConfiguration) {
    const { added, updated, removed } = compare4(this._policyConfiguration, policyConfiguration);
    const keys = [...added, ...updated, ...removed];
    if (keys.length) {
      this.updatePolicyConfiguration(policyConfiguration);
    }
    return { keys, overrides: [] };
  }
  compareAndUpdateApplicationConfiguration(application) {
    const { added, updated, removed, overrides } = compare4(this.applicationConfiguration, application);
    const keys = [...added, ...updated, ...removed];
    if (keys.length) {
      this.updateApplicationConfiguration(application);
    }
    return { keys, overrides };
  }
  compareAndUpdateLocalUserConfiguration(user) {
    const { added, updated, removed, overrides } = compare4(this.localUserConfiguration, user);
    const keys = [...added, ...updated, ...removed];
    if (keys.length) {
      this.updateLocalUserConfiguration(user);
    }
    return { keys, overrides };
  }
  compareAndUpdateRemoteUserConfiguration(user) {
    const { added, updated, removed, overrides } = compare4(this.remoteUserConfiguration, user);
    const keys = [...added, ...updated, ...removed];
    if (keys.length) {
      this.updateRemoteUserConfiguration(user);
    }
    return { keys, overrides };
  }
  compareAndUpdateWorkspaceConfiguration(workspaceConfiguration) {
    const { added, updated, removed, overrides } = compare4(this.workspaceConfiguration, workspaceConfiguration);
    const keys = [...added, ...updated, ...removed];
    if (keys.length) {
      this.updateWorkspaceConfiguration(workspaceConfiguration);
    }
    return { keys, overrides };
  }
  compareAndUpdateFolderConfiguration(resource, folderConfiguration) {
    const currentFolderConfiguration = this.folderConfigurations.get(resource);
    const { added, updated, removed, overrides } = compare4(currentFolderConfiguration, folderConfiguration);
    const keys = [...added, ...updated, ...removed];
    if (keys.length || !currentFolderConfiguration) {
      this.updateFolderConfiguration(resource, folderConfiguration);
    }
    return { keys, overrides };
  }
  compareAndDeleteFolderConfiguration(folder) {
    const folderConfig = this.folderConfigurations.get(folder);
    if (!folderConfig) {
      throw new Error("Unknown folder");
    }
    this.deleteFolderConfiguration(folder);
    const { added, updated, removed, overrides } = compare4(folderConfig, void 0);
    return { keys: [...added, ...updated, ...removed], overrides };
  }
  get defaults() {
    return this._defaultConfiguration;
  }
  get applicationConfiguration() {
    return this._applicationConfiguration;
  }
  get userConfiguration() {
    if (!this._userConfiguration) {
      if (this._remoteUserConfiguration.isEmpty()) {
        this._userConfiguration = this._localUserConfiguration;
      } else {
        const merged = this._localUserConfiguration.merge(this._remoteUserConfiguration);
        this._userConfiguration = new ConfigurationModel(merged.contents, merged.keys, merged.overrides, void 0, this.logService);
      }
    }
    return this._userConfiguration;
  }
  get localUserConfiguration() {
    return this._localUserConfiguration;
  }
  get remoteUserConfiguration() {
    return this._remoteUserConfiguration;
  }
  get workspaceConfiguration() {
    return this._workspaceConfiguration;
  }
  get folderConfigurations() {
    return this._folderConfigurations;
  }
  getConsolidatedConfigurationModel(section, overrides, workspace) {
    let configurationModel = this.getConsolidatedConfigurationModelForResource(overrides, workspace);
    if (overrides.overrideIdentifier) {
      configurationModel = configurationModel.override(overrides.overrideIdentifier);
    }
    if (!this._policyConfiguration.isEmpty() && this._policyConfiguration.getValue(section) !== void 0) {
      configurationModel = configurationModel.merge();
      for (const key3 of this._policyConfiguration.keys) {
        configurationModel.setValue(key3, this._policyConfiguration.getValue(key3));
      }
    }
    return configurationModel;
  }
  getConsolidatedConfigurationModelForResource({ resource }, workspace) {
    let consolidateConfiguration = this.getWorkspaceConsolidatedConfiguration();
    if (workspace && resource) {
      const root = workspace.getFolder(resource);
      if (root) {
        consolidateConfiguration = this.getFolderConsolidatedConfiguration(root.uri) || consolidateConfiguration;
      }
      const memoryConfigurationForResource = this._memoryConfigurationByResource.get(resource);
      if (memoryConfigurationForResource) {
        consolidateConfiguration = consolidateConfiguration.merge(memoryConfigurationForResource);
      }
    }
    return consolidateConfiguration;
  }
  getWorkspaceConsolidatedConfiguration() {
    if (!this._workspaceConsolidatedConfiguration) {
      this._workspaceConsolidatedConfiguration = this._defaultConfiguration.merge(this.applicationConfiguration, this.userConfiguration, this._workspaceConfiguration, this._memoryConfiguration);
    }
    return this._workspaceConsolidatedConfiguration;
  }
  getFolderConsolidatedConfiguration(folder) {
    let folderConsolidatedConfiguration = this._foldersConsolidatedConfigurations.get(folder);
    if (!folderConsolidatedConfiguration) {
      const workspaceConsolidateConfiguration = this.getWorkspaceConsolidatedConfiguration();
      const folderConfiguration = this._folderConfigurations.get(folder);
      if (folderConfiguration) {
        folderConsolidatedConfiguration = workspaceConsolidateConfiguration.merge(folderConfiguration);
        this._foldersConsolidatedConfigurations.set(folder, folderConsolidatedConfiguration);
      } else {
        folderConsolidatedConfiguration = workspaceConsolidateConfiguration;
      }
    }
    return folderConsolidatedConfiguration;
  }
  getFolderConfigurationModelForResource(resource, workspace) {
    if (workspace && resource) {
      const root = workspace.getFolder(resource);
      if (root) {
        return this._folderConfigurations.get(root.uri);
      }
    }
    return void 0;
  }
  toData() {
    return {
      defaults: {
        contents: this._defaultConfiguration.contents,
        overrides: this._defaultConfiguration.overrides,
        keys: this._defaultConfiguration.keys
      },
      policy: {
        contents: this._policyConfiguration.contents,
        overrides: this._policyConfiguration.overrides,
        keys: this._policyConfiguration.keys
      },
      application: {
        contents: this.applicationConfiguration.contents,
        overrides: this.applicationConfiguration.overrides,
        keys: this.applicationConfiguration.keys,
        raw: Array.isArray(this.applicationConfiguration.raw) ? void 0 : this.applicationConfiguration.raw
      },
      userLocal: {
        contents: this.localUserConfiguration.contents,
        overrides: this.localUserConfiguration.overrides,
        keys: this.localUserConfiguration.keys,
        raw: Array.isArray(this.localUserConfiguration.raw) ? void 0 : this.localUserConfiguration.raw
      },
      userRemote: {
        contents: this.remoteUserConfiguration.contents,
        overrides: this.remoteUserConfiguration.overrides,
        keys: this.remoteUserConfiguration.keys,
        raw: Array.isArray(this.remoteUserConfiguration.raw) ? void 0 : this.remoteUserConfiguration.raw
      },
      workspace: {
        contents: this._workspaceConfiguration.contents,
        overrides: this._workspaceConfiguration.overrides,
        keys: this._workspaceConfiguration.keys
      },
      folders: [...this._folderConfigurations.keys()].reduce((result, folder) => {
        const { contents, overrides, keys } = this._folderConfigurations.get(folder);
        result.push([folder, { contents, overrides, keys }]);
        return result;
      }, [])
    };
  }
  allKeys() {
    const keys = /* @__PURE__ */ new Set();
    this._defaultConfiguration.keys.forEach((key3) => keys.add(key3));
    this.userConfiguration.keys.forEach((key3) => keys.add(key3));
    this._workspaceConfiguration.keys.forEach((key3) => keys.add(key3));
    this._folderConfigurations.forEach((folderConfiguration) => folderConfiguration.keys.forEach((key3) => keys.add(key3)));
    return [...keys.values()];
  }
  allOverrideIdentifiers() {
    const keys = /* @__PURE__ */ new Set();
    this._defaultConfiguration.getAllOverrideIdentifiers().forEach((key3) => keys.add(key3));
    this.userConfiguration.getAllOverrideIdentifiers().forEach((key3) => keys.add(key3));
    this._workspaceConfiguration.getAllOverrideIdentifiers().forEach((key3) => keys.add(key3));
    this._folderConfigurations.forEach((folderConfiguration) => folderConfiguration.getAllOverrideIdentifiers().forEach((key3) => keys.add(key3)));
    return [...keys.values()];
  }
  getAllKeysForOverrideIdentifier(overrideIdentifier) {
    const keys = /* @__PURE__ */ new Set();
    this._defaultConfiguration.getKeysForOverrideIdentifier(overrideIdentifier).forEach((key3) => keys.add(key3));
    this.userConfiguration.getKeysForOverrideIdentifier(overrideIdentifier).forEach((key3) => keys.add(key3));
    this._workspaceConfiguration.getKeysForOverrideIdentifier(overrideIdentifier).forEach((key3) => keys.add(key3));
    this._folderConfigurations.forEach((folderConfiguration) => folderConfiguration.getKeysForOverrideIdentifier(overrideIdentifier).forEach((key3) => keys.add(key3)));
    return [...keys.values()];
  }
  static parse(data, logService) {
    const defaultConfiguration = this.parseConfigurationModel(data.defaults, logService);
    const policyConfiguration = this.parseConfigurationModel(data.policy, logService);
    const applicationConfiguration = this.parseConfigurationModel(data.application, logService);
    const userLocalConfiguration = this.parseConfigurationModel(data.userLocal, logService);
    const userRemoteConfiguration = this.parseConfigurationModel(data.userRemote, logService);
    const workspaceConfiguration = this.parseConfigurationModel(data.workspace, logService);
    const folders = data.folders.reduce((result, value2) => {
      result.set(URI.revive(value2[0]), this.parseConfigurationModel(value2[1], logService));
      return result;
    }, new ResourceMap());
    return new _Configuration(
      defaultConfiguration,
      policyConfiguration,
      applicationConfiguration,
      userLocalConfiguration,
      userRemoteConfiguration,
      workspaceConfiguration,
      folders,
      ConfigurationModel.createEmptyModel(logService),
      new ResourceMap(),
      logService
    );
  }
  static parseConfigurationModel(model, logService) {
    return new ConfigurationModel(model.contents, model.keys, model.overrides, model.raw, logService);
  }
};

var ConfigurationChangeEvent = class {
  constructor(change, previous, currentConfiguraiton, currentWorkspace, logService) {
    this.change = change;
    this.previous = previous;
    this.currentConfiguraiton = currentConfiguraiton;
    this.currentWorkspace = currentWorkspace;
    this.logService = logService;
    this._marker = "\n";
    this._markerCode1 = this._marker.charCodeAt(0);
    this._markerCode2 = ".".charCodeAt(0);
    this.affectedKeys = /* @__PURE__ */ new Set();
    this._previousConfiguration = void 0;
    for (const key3 of change.keys) {
      this.affectedKeys.add(key3);
    }
    for (const [, keys] of change.overrides) {
      for (const key3 of keys) {
        this.affectedKeys.add(key3);
      }
    }
    this._affectsConfigStr = this._marker;
    for (const key3 of this.affectedKeys) {
      this._affectsConfigStr += key3 + this._marker;
    }
  }
  get previousConfiguration() {
    if (!this._previousConfiguration && this.previous) {
      this._previousConfiguration = Configuration2.parse(this.previous.data, this.logService);
    }
    return this._previousConfiguration;
  }
  affectsConfiguration(section, overrides) {
    const needle = this._marker + section;
    const idx = this._affectsConfigStr.indexOf(needle);
    if (idx < 0) {
      return false;
    }
    const pos = idx + needle.length;
    if (pos >= this._affectsConfigStr.length) {
      return false;
    }
    const code = this._affectsConfigStr.charCodeAt(pos);
    if (code !== this._markerCode1 && code !== this._markerCode2) {
      return false;
    }
    if (overrides) {
      const value1 = this.previousConfiguration ? this.previousConfiguration.getValue(section, overrides, this.previous?.workspace) : void 0;
      const value2 = this.currentConfiguraiton.getValue(section, overrides, this.currentWorkspace);
      return !equals4(value1, value2);
    }
    return true;
  }
};

function compare4(from, to) {
  const { added, removed, updated } = compareConfigurationContents(to?.rawConfiguration, from?.rawConfiguration);
  const overrides = [];
  const fromOverrideIdentifiers = from?.getAllOverrideIdentifiers() || [];
  const toOverrideIdentifiers = to?.getAllOverrideIdentifiers() || [];
  if (to) {
    const addedOverrideIdentifiers = toOverrideIdentifiers.filter((key3) => !fromOverrideIdentifiers.includes(key3));
    for (const identifier2 of addedOverrideIdentifiers) {
      overrides.push([identifier2, to.getKeysForOverrideIdentifier(identifier2)]);
    }
  }
  if (from) {
    const removedOverrideIdentifiers = fromOverrideIdentifiers.filter((key3) => !toOverrideIdentifiers.includes(key3));
    for (const identifier2 of removedOverrideIdentifiers) {
      overrides.push([identifier2, from.getKeysForOverrideIdentifier(identifier2)]);
    }
  }
  if (to && from) {
    for (const identifier2 of fromOverrideIdentifiers) {
      if (toOverrideIdentifiers.includes(identifier2)) {
        const result = compareConfigurationContents({ contents: from.getOverrideValue(void 0, identifier2) || {}, keys: from.getKeysForOverrideIdentifier(identifier2) }, { contents: to.getOverrideValue(void 0, identifier2) || {}, keys: to.getKeysForOverrideIdentifier(identifier2) });
        overrides.push([identifier2, [...result.added, ...result.removed, ...result.updated]]);
      }
    }
  }
  return { added, removed, updated, overrides };
}

function compareConfigurationContents(to, from) {
  const added = to ? from ? to.keys.filter((key3) => from.keys.indexOf(key3) === -1) : [...to.keys] : [];
  const removed = from ? to ? from.keys.filter((key3) => to.keys.indexOf(key3) === -1) : [...from.keys] : [];
  const updated = [];
  if (to && from) {
    for (const key3 of from.keys) {
      if (to.keys.indexOf(key3) !== -1) {
        const value1 = getConfigurationValue(from.contents, key3);
        const value2 = getConfigurationValue(to.contents, key3);
        if (!equals4(value1, value2)) {
          updated.push(key3);
        }
      }
    }
  }
  return { added, removed, updated };
}
export { freeze2, compare4, compareConfigurationContents, ConfigurationModel, ConfigurationModelParser, UserSettings, ConfigurationInspectValue, Configuration2, ConfigurationChangeEvent };
