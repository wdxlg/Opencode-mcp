// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/configuration/common/configurations.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { ConfigurationModel } from "./module-3872.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { deepClone, equals4 } from "./module-0098.mjs";
import { ILogService, NullLogService } from "./module-0095.mjs";
import { isEmptyObject, isString } from "./module-0010.mjs";
import { getErrorMessage } from "./module-0004.mjs";
import { visit } from "./module-0885.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IPolicyService } from "./module-0957.mjs";


// src/vs/platform/configuration/common/configurations.ts
var DefaultConfiguration = class extends Disposable {
  constructor(logService) {
    super();
    this.logService = logService;
    this._onDidChangeConfiguration = this._register(new Emitter());
    this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
    this._configurationModel = ConfigurationModel.createEmptyModel(logService);
  }
  get configurationModel() {
    return this._configurationModel;
  }
  async initialize() {
    this.resetConfigurationModel();
    this._register(Registry.as(Extensions4.Configuration).onDidUpdateConfiguration(({ properties, defaultsOverrides }) => this.onDidUpdateConfiguration(Array.from(properties), defaultsOverrides)));
    return this.configurationModel;
  }
  reload() {
    this.resetConfigurationModel();
    return this.configurationModel;
  }
  onDidUpdateConfiguration(properties, defaultsOverrides) {
    this.updateConfigurationModel(properties, Registry.as(Extensions4.Configuration).getConfigurationProperties());
    this._onDidChangeConfiguration.fire({ defaults: this.configurationModel, properties });
  }
  getConfigurationDefaultOverrides() {
    return {};
  }
  resetConfigurationModel() {
    this._configurationModel = ConfigurationModel.createEmptyModel(this.logService);
    const properties = Registry.as(Extensions4.Configuration).getConfigurationProperties();
    this.updateConfigurationModel(Object.keys(properties), properties);
  }
  updateConfigurationModel(properties, configurationProperties) {
    const configurationDefaultsOverrides = this.getConfigurationDefaultOverrides();
    for (const key3 of properties) {
      const defaultOverrideValue = configurationDefaultsOverrides[key3];
      const propertySchema = configurationProperties[key3];
      if (defaultOverrideValue !== void 0) {
        this._configurationModel.setValue(key3, defaultOverrideValue);
      } else if (propertySchema) {
        this._configurationModel.setValue(key3, this.getDefaultValue(key3, propertySchema));
      } else {
        this._configurationModel.removeValue(key3);
      }
    }
  }
  getDefaultValue(_key, propertySchema) {
    return deepClone(propertySchema.default);
  }
};

var NullPolicyConfiguration = class {
  constructor() {
    this.onDidChangeConfiguration = Event2.None;
    this.configurationModel = ConfigurationModel.createEmptyModel(new NullLogService());
  }
  async initialize() {
    return this.configurationModel;
  }
};

var PolicyConfiguration = class extends Disposable {
  constructor(defaultConfiguration, policyService, logService) {
    super();
    this.defaultConfiguration = defaultConfiguration;
    this.policyService = policyService;
    this.logService = logService;
    this._onDidChangeConfiguration = this._register(new Emitter());
    this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
    /** Last definition submitted per policy name; avoids redundant re-registration. */
    this._submittedPolicyDefinitions = /* @__PURE__ */ new Map();
    /** Maps each policy-controlled setting key to its policy name, so removed keys can be re-resolved. */
    this._policyNameByKey = /* @__PURE__ */ new Map();
    this._configurationModel = ConfigurationModel.createEmptyModel(this.logService);
    this.configurationRegistry = Registry.as(Extensions4.Configuration);
  }
  get configurationModel() {
    return this._configurationModel;
  }
  async initialize() {
    this.logService.trace("PolicyConfiguration#initialize");
    this.update(await this.updatePolicyDefinitions(this.defaultConfiguration.configurationModel.keys), false);
    this.update(await this.updatePolicyDefinitions(Object.keys(this.configurationRegistry.getExcludedConfigurationProperties())), false);
    this._register(this.policyService.onDidChange((policyNames) => this.onDidChangePolicies(policyNames)));
    this._register(this.defaultConfiguration.onDidChangeConfiguration(async ({ properties }) => this.update(await this.updatePolicyDefinitions(properties), true)));
    return this._configurationModel;
  }
  toPolicyDefinitionType(configType, policyName) {
    const configTypes = Array.isArray(configType) ? configType : [configType];
    const supportedTypes = configTypes.filter((type) => type === "string" || type === "number" || type === "array" || type === "object" || type === "boolean");
    if (supportedTypes.length === 0) {
      this.logService.warn(`PolicyConfiguration#updatePolicyDefinitions - policy '${policyName}' has unsupported type '${configType}'`);
      return void 0;
    }
    return supportedTypes.includes("number") ? "number" : supportedTypes.includes("boolean") ? "boolean" : "string";
  }
  async updatePolicyDefinitions(properties) {
    this.logService.trace("PolicyConfiguration#updatePolicyDefinitions", properties);
    const keys = [];
    const policyNames = /* @__PURE__ */ new Set();
    const configurationProperties = this.configurationRegistry.getConfigurationProperties();
    const excludedConfigurationProperties = this.configurationRegistry.getExcludedConfigurationProperties();
    for (const key3 of properties) {
      const config = configurationProperties[key3] ?? excludedConfigurationProperties[key3];
      if (!config) {
        keys.push(key3);
        const removedPolicyName = this._policyNameByKey.get(key3);
        if (removedPolicyName !== void 0) {
          this._policyNameByKey.delete(key3);
          policyNames.add(removedPolicyName);
        }
        continue;
      }
      const policyName = config.policy?.name ?? config.policyReference?.name;
      if (policyName) {
        keys.push(key3);
        policyNames.add(policyName);
        this._policyNameByKey.set(key3, policyName);
      }
    }
    const changedDefinitions = {};
    for (const policyName of policyNames) {
      const definition = this.resolvePolicyDefinition(policyName);
      if (definition && !this.isSamePolicyDefinition(this._submittedPolicyDefinitions.get(policyName), definition)) {
        this._submittedPolicyDefinitions.set(policyName, definition);
        changedDefinitions[policyName] = definition;
      }
    }
    if (!isEmptyObject(changedDefinitions)) {
      await this.policyService.updatePolicyDefinitions(changedDefinitions);
    }
    return keys;
  }
  isSamePolicyDefinition(a, b) {
    return !!a && a.type === b.type && a.value === b.value && a.managedSettings === b.managedSettings && a.restrictedValue === b.restrictedValue;
  }
  /** Resolve the authoritative definition: owner wins; references provide a bare type fallback. */
  resolvePolicyDefinition(policyName) {
    const configurationProperties = this.configurationRegistry.getConfigurationProperties();
    const excludedConfigurationProperties = this.configurationRegistry.getExcludedConfigurationProperties();
    const ownerKey = this.configurationRegistry.getPolicyConfigurations().get(policyName);
    if (ownerKey !== void 0) {
      const config = configurationProperties[ownerKey] ?? excludedConfigurationProperties[ownerKey];
      if (config?.policy) {
        const type = this.toPolicyDefinitionType(config.type, policyName);
        const { value: value2, managedSettings, restrictedValue } = config.policy;
        return type ? { type, value: value2, managedSettings, restrictedValue } : void 0;
      }
    }
    const referenceKeys = this.configurationRegistry.getPolicyReferenceConfigurations().get(policyName);
    for (const referenceKey of referenceKeys ?? []) {
      const config = configurationProperties[referenceKey] ?? excludedConfigurationProperties[referenceKey];
      if (config?.policyReference) {
        const type = this.toPolicyDefinitionType(config.type, policyName);
        return type ? { type } : void 0;
      }
    }
    return void 0;
  }
  onDidChangePolicies(policyNames) {
    this.logService.trace("PolicyConfiguration#onDidChangePolicies", policyNames);
    const policyConfigurations = this.configurationRegistry.getPolicyConfigurations();
    const policyReferenceConfigurations = this.configurationRegistry.getPolicyReferenceConfigurations();
    const keys = [];
    for (const policyName of policyNames) {
      const owner = policyConfigurations.get(policyName);
      if (owner) {
        keys.push(owner);
      }
      const references = policyReferenceConfigurations.get(policyName);
      if (references) {
        keys.push(...references);
      }
    }
    this.update(keys, true);
  }
  update(keys, trigger) {
    this.logService.trace("PolicyConfiguration#update", keys);
    const configurationProperties = this.configurationRegistry.getConfigurationProperties();
    const excludedConfigurationProperties = this.configurationRegistry.getExcludedConfigurationProperties();
    const changed = [];
    const wasEmpty = this._configurationModel.isEmpty();
    for (const key3 of keys) {
      const property = configurationProperties[key3] ?? excludedConfigurationProperties[key3];
      const policyName = property?.policy?.name ?? property?.policyReference?.name;
      if (policyName) {
        let policyValue = this.policyService.getPolicyValue(policyName);
        const acceptsStringType = Array.isArray(property.type) ? property.type.includes("string") : property.type === "string";
        if (isString(policyValue) && !acceptsStringType) {
          try {
            policyValue = this.parse(policyValue);
          } catch (e4) {
            this.logService.error(`Error parsing policy value ${policyName}:`, getErrorMessage(e4));
            continue;
          }
        }
        if (wasEmpty ? policyValue !== void 0 : !equals4(this._configurationModel.getValue(key3), policyValue)) {
          changed.push([key3, policyValue]);
        }
      } else {
        if (this._configurationModel.getValue(key3) !== void 0) {
          changed.push([key3, void 0]);
        }
      }
    }
    if (changed.length) {
      this.logService.trace("PolicyConfiguration#changed", changed);
      const old = this._configurationModel;
      this._configurationModel = ConfigurationModel.createEmptyModel(this.logService);
      for (const key3 of old.keys) {
        this._configurationModel.setValue(key3, old.getValue(key3));
      }
      for (const [key3, policyValue] of changed) {
        if (policyValue === void 0) {
          this._configurationModel.removeValue(key3);
        } else {
          this._configurationModel.setValue(key3, policyValue);
        }
      }
      if (trigger) {
        this._onDidChangeConfiguration.fire(this._configurationModel);
      }
    }
  }
  parse(content) {
    let raw = {};
    let currentProperty = null;
    let currentParent = [];
    const previousParents = [];
    const parseErrors = [];
    function onValue(value2) {
      if (Array.isArray(currentParent)) {
        currentParent.push(value2);
      } else if (currentProperty !== null) {
        if (currentParent[currentProperty] !== void 0) {
          throw new Error(`Duplicate property found: ${currentProperty}`);
        }
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
      visit(content, visitor);
      raw = currentParent[0] || raw;
    }
    if (parseErrors.length > 0) {
      throw new Error(parseErrors.map((e4) => getErrorMessage(e4.error)).join("\n"));
    }
    return raw;
  }
};

PolicyConfiguration = __decorateClass([
  __decorateParam(1, IPolicyService),
  __decorateParam(2, ILogService)
], PolicyConfiguration);
export { DefaultConfiguration, NullPolicyConfiguration, PolicyConfiguration };
