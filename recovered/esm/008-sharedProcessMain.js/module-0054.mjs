// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/code/electron-utility/sharedProcess/sharedProcessMain.js
// Original module marker: src/vs/platform/configuration/common/configurationRegistry.ts
import { Registry } from "./module-0051.mjs";
import { Extensions } from "./module-0052.mjs";
import { Disposable } from "./module-0013.mjs";
import { Emitter } from "./module-0018.mjs";
import { localize } from "./module-0007.mjs";
import { isEmptyObject, isObject, isUndefined, isUndefinedOrNull } from "./module-0006.mjs";
import { getLanguageTagSettingPlainKey } from "./module-0049.mjs";
import { distinct } from "./module-0004.mjs";
import { product_default } from "./module-0053.mjs";


// src/vs/platform/configuration/common/configurationRegistry.ts
var Extensions2 = {
  Configuration: "base.contributions.configuration"
};

function isConfigurationDefaultSourceEquals(a, b) {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  if (typeof a === "string" || typeof b === "string") {
    return a === b;
  }
  return a.id === b.id;
}

var allSettings = { properties: {}, patternProperties: {} };

var applicationSettings = { properties: {}, patternProperties: {} };

var applicationMachineSettings = { properties: {}, patternProperties: {} };

var machineSettings = { properties: {}, patternProperties: {} };

var machineOverridableSettings = { properties: {}, patternProperties: {} };

var windowSettings = { properties: {}, patternProperties: {} };

var resourceSettings = { properties: {}, patternProperties: {} };

var resourceLanguageSettingsSchemaId = "vscode://schemas/settings/resourceLanguage";

var contributionRegistry = Registry.as(Extensions.JSONContribution);

var ConfigurationRegistry = class extends Disposable {
  constructor() {
    super();
    this.registeredConfigurationDefaults = [];
    /**
     * Agent-host-mirrored setting keys per node that were hidden with
     * `included: false`. Registration deletes those keys from the node's
     * `properties`, so deregistration has no other way to find them.
     */
    this.excludedAgentHostSyncKeys = /* @__PURE__ */ new Map();
    this.overrideIdentifiers = /* @__PURE__ */ new Set();
    this._onDidSchemaChange = this._register(new Emitter());
    this.onDidSchemaChange = this._onDidSchemaChange.event;
    this._onDidUpdateConfiguration = this._register(new Emitter());
    this.onDidUpdateConfiguration = this._onDidUpdateConfiguration.event;
    this.configurationDefaultsOverrides = /* @__PURE__ */ new Map();
    this.defaultLanguageConfigurationOverridesNode = {
      id: "defaultOverrides",
      title: localize(2792, null),
      properties: {}
    };
    this.configurationContributors = [this.defaultLanguageConfigurationOverridesNode];
    this.resourceLanguageSettingsSchema = {
      properties: {},
      patternProperties: {},
      additionalProperties: true,
      allowTrailingCommas: true,
      allowComments: true
    };
    this.configurationProperties = {};
    this.policyConfigurations = /* @__PURE__ */ new Map();
    this.policyReferenceConfigurations = /* @__PURE__ */ new Map();
    this.agentHostSyncConfigurations = /* @__PURE__ */ new Map();
    this.excludedConfigurationProperties = {};
    contributionRegistry.registerSchema(resourceLanguageSettingsSchemaId, this.resourceLanguageSettingsSchema);
    this.registerOverridePropertyPatternKey();
  }
  registerConfiguration(configuration, validate = true) {
    this.registerConfigurations([configuration], validate);
    return configuration;
  }
  registerConfigurations(configurations, validate = true) {
    const properties = /* @__PURE__ */ new Set();
    this.doRegisterConfigurations(configurations, validate, properties);
    contributionRegistry.registerSchema(resourceLanguageSettingsSchemaId, this.resourceLanguageSettingsSchema);
    this._onDidSchemaChange.fire();
    this._onDidUpdateConfiguration.fire({ properties });
  }
  deregisterConfigurations(configurations) {
    const properties = /* @__PURE__ */ new Set();
    this.doDeregisterConfigurations(configurations, properties);
    contributionRegistry.registerSchema(resourceLanguageSettingsSchemaId, this.resourceLanguageSettingsSchema);
    this._onDidSchemaChange.fire();
    this._onDidUpdateConfiguration.fire({ properties });
  }
  updateConfigurations({ add, remove: remove2 }) {
    const properties = /* @__PURE__ */ new Set();
    this.doDeregisterConfigurations(remove2, properties);
    this.doRegisterConfigurations(add, false, properties);
    contributionRegistry.registerSchema(resourceLanguageSettingsSchemaId, this.resourceLanguageSettingsSchema);
    this._onDidSchemaChange.fire();
    this._onDidUpdateConfiguration.fire({ properties });
  }
  registerDefaultConfigurations(configurationDefaults) {
    const properties = /* @__PURE__ */ new Set();
    this.doRegisterDefaultConfigurations(configurationDefaults, properties);
    this._onDidSchemaChange.fire();
    this._onDidUpdateConfiguration.fire({ properties, defaultsOverrides: true });
  }
  doRegisterDefaultConfigurations(configurationDefaults, bucket) {
    this.registeredConfigurationDefaults.push(...configurationDefaults);
    const overrideIdentifiers = [];
    for (const { overrides, source } of configurationDefaults) {
      for (const key in overrides) {
        bucket.add(key);
        const configurationDefaultOverridesForKey = this.configurationDefaultsOverrides.get(key) ?? this.configurationDefaultsOverrides.set(key, { configurationDefaultOverrides: [] }).get(key);
        const value = overrides[key];
        configurationDefaultOverridesForKey.configurationDefaultOverrides.push({ value, source });
        if (OVERRIDE_PROPERTY_REGEX.test(key)) {
          const newDefaultOverride = this.mergeDefaultConfigurationsForOverrideIdentifier(key, value, source, configurationDefaultOverridesForKey.configurationDefaultOverrideValue);
          if (!newDefaultOverride) {
            continue;
          }
          configurationDefaultOverridesForKey.configurationDefaultOverrideValue = newDefaultOverride;
          this.updateDefaultOverrideProperty(key, newDefaultOverride, source);
          overrideIdentifiers.push(...overrideIdentifiersFromKey(key));
        } else {
          const newDefaultOverride = this.mergeDefaultConfigurationsForConfigurationProperty(key, value, source, configurationDefaultOverridesForKey.configurationDefaultOverrideValue);
          if (!newDefaultOverride) {
            continue;
          }
          configurationDefaultOverridesForKey.configurationDefaultOverrideValue = newDefaultOverride;
          const property = this.configurationProperties[key];
          if (property) {
            this.updatePropertyDefaultValue(key, property);
            this.updateSchema(key, property);
          }
        }
      }
    }
    this.doRegisterOverrideIdentifiers(overrideIdentifiers);
  }
  deregisterDefaultConfigurations(defaultConfigurations) {
    const properties = /* @__PURE__ */ new Set();
    this.doDeregisterDefaultConfigurations(defaultConfigurations, properties);
    this._onDidSchemaChange.fire();
    this._onDidUpdateConfiguration.fire({ properties, defaultsOverrides: true });
  }
  doDeregisterDefaultConfigurations(defaultConfigurations, bucket) {
    for (const defaultConfiguration of defaultConfigurations) {
      const index = this.registeredConfigurationDefaults.indexOf(defaultConfiguration);
      if (index !== -1) {
        this.registeredConfigurationDefaults.splice(index, 1);
      }
    }
    for (const { overrides, source } of defaultConfigurations) {
      for (const key in overrides) {
        const configurationDefaultOverridesForKey = this.configurationDefaultsOverrides.get(key);
        if (!configurationDefaultOverridesForKey) {
          continue;
        }
        const index = configurationDefaultOverridesForKey.configurationDefaultOverrides.findIndex((configurationDefaultOverride) => source ? isConfigurationDefaultSourceEquals(configurationDefaultOverride.source, source) : configurationDefaultOverride.value === overrides[key]);
        if (index === -1) {
          continue;
        }
        configurationDefaultOverridesForKey.configurationDefaultOverrides.splice(index, 1);
        if (configurationDefaultOverridesForKey.configurationDefaultOverrides.length === 0) {
          this.configurationDefaultsOverrides.delete(key);
        }
        if (OVERRIDE_PROPERTY_REGEX.test(key)) {
          let configurationDefaultOverrideValue;
          for (const configurationDefaultOverride of configurationDefaultOverridesForKey.configurationDefaultOverrides) {
            configurationDefaultOverrideValue = this.mergeDefaultConfigurationsForOverrideIdentifier(key, configurationDefaultOverride.value, configurationDefaultOverride.source, configurationDefaultOverrideValue);
          }
          if (configurationDefaultOverrideValue && !isEmptyObject(configurationDefaultOverrideValue.value)) {
            configurationDefaultOverridesForKey.configurationDefaultOverrideValue = configurationDefaultOverrideValue;
            this.updateDefaultOverrideProperty(key, configurationDefaultOverrideValue, source);
          } else {
            this.configurationDefaultsOverrides.delete(key);
            delete this.configurationProperties[key];
            delete this.defaultLanguageConfigurationOverridesNode.properties[key];
          }
        } else {
          let configurationDefaultOverrideValue;
          for (const configurationDefaultOverride of configurationDefaultOverridesForKey.configurationDefaultOverrides) {
            configurationDefaultOverrideValue = this.mergeDefaultConfigurationsForConfigurationProperty(key, configurationDefaultOverride.value, configurationDefaultOverride.source, configurationDefaultOverrideValue);
          }
          configurationDefaultOverridesForKey.configurationDefaultOverrideValue = configurationDefaultOverrideValue;
          const property = this.configurationProperties[key];
          if (property) {
            this.updatePropertyDefaultValue(key, property);
            this.updateSchema(key, property);
          }
        }
        bucket.add(key);
      }
    }
    this.updateOverridePropertyPatternKey();
  }
  updateDefaultOverrideProperty(key, newDefaultOverride, source) {
    const property = {
      section: {
        id: this.defaultLanguageConfigurationOverridesNode.id,
        title: this.defaultLanguageConfigurationOverridesNode.title,
        order: this.defaultLanguageConfigurationOverridesNode.order,
        extensionInfo: this.defaultLanguageConfigurationOverridesNode.extensionInfo
      },
      type: "object",
      default: newDefaultOverride.value,
      description: localize(2791, null, getLanguageTagSettingPlainKey(key)),
      $ref: resourceLanguageSettingsSchemaId,
      defaultDefaultValue: newDefaultOverride.value,
      source,
      defaultValueSource: source
    };
    this.configurationProperties[key] = property;
    this.defaultLanguageConfigurationOverridesNode.properties[key] = property;
  }
  mergeDefaultConfigurationsForOverrideIdentifier(overrideIdentifier, configurationValueObject, valueSource, existingDefaultOverride) {
    const defaultValue = existingDefaultOverride?.value || {};
    const source = existingDefaultOverride?.source ?? /* @__PURE__ */ new Map();
    if (!(source instanceof Map)) {
      console.error("objectConfigurationSources is not a Map");
      return void 0;
    }
    for (const propertyKey of Object.keys(configurationValueObject)) {
      const propertyDefaultValue = configurationValueObject[propertyKey];
      const isObjectSetting = isObject(propertyDefaultValue) && (isUndefined(defaultValue[propertyKey]) || isObject(defaultValue[propertyKey]));
      if (isObjectSetting) {
        defaultValue[propertyKey] = { ...defaultValue[propertyKey] ?? {}, ...propertyDefaultValue };
        if (valueSource) {
          for (const objectKey in propertyDefaultValue) {
            source.set(`${propertyKey}.${objectKey}`, valueSource);
          }
        }
      } else {
        defaultValue[propertyKey] = propertyDefaultValue;
        if (valueSource) {
          source.set(propertyKey, valueSource);
        } else {
          source.delete(propertyKey);
        }
      }
    }
    return { value: defaultValue, source };
  }
  mergeDefaultConfigurationsForConfigurationProperty(propertyKey, value, valuesSource, existingDefaultOverride) {
    const property = this.configurationProperties[propertyKey];
    const existingDefaultValue = existingDefaultOverride?.value ?? property?.defaultDefaultValue;
    let source = valuesSource;
    const isObjectSetting = isObject(value) && (property !== void 0 && property.type === "object" || property === void 0 && (isUndefined(existingDefaultValue) || isObject(existingDefaultValue)));
    if (isObjectSetting) {
      source = existingDefaultOverride?.source ?? /* @__PURE__ */ new Map();
      if (!(source instanceof Map)) {
        console.error("defaultValueSource is not a Map");
        return void 0;
      }
      for (const objectKey in value) {
        if (valuesSource) {
          source.set(`${propertyKey}.${objectKey}`, valuesSource);
        }
      }
      value = { ...isObject(existingDefaultValue) ? existingDefaultValue : {}, ...value };
    }
    return { value, source };
  }
  deltaConfiguration(delta) {
    let defaultsOverrides = false;
    const properties = /* @__PURE__ */ new Set();
    if (delta.removedDefaults) {
      this.doDeregisterDefaultConfigurations(delta.removedDefaults, properties);
      defaultsOverrides = true;
    }
    if (delta.addedDefaults) {
      this.doRegisterDefaultConfigurations(delta.addedDefaults, properties);
      defaultsOverrides = true;
    }
    if (delta.removedConfigurations) {
      this.doDeregisterConfigurations(delta.removedConfigurations, properties);
    }
    if (delta.addedConfigurations) {
      this.doRegisterConfigurations(delta.addedConfigurations, false, properties);
    }
    this._onDidSchemaChange.fire();
    this._onDidUpdateConfiguration.fire({ properties, defaultsOverrides });
  }
  notifyConfigurationSchemaUpdated(...configurations) {
    this._onDidSchemaChange.fire();
  }
  registerOverrideIdentifiers(overrideIdentifiers) {
    this.doRegisterOverrideIdentifiers(overrideIdentifiers);
    this._onDidSchemaChange.fire();
  }
  doRegisterOverrideIdentifiers(overrideIdentifiers) {
    for (const overrideIdentifier of overrideIdentifiers) {
      this.overrideIdentifiers.add(overrideIdentifier);
    }
    this.updateOverridePropertyPatternKey();
  }
  doRegisterConfigurations(configurations, validate, bucket) {
    configurations.forEach((configuration) => {
      this.validateAndRegisterProperties(configuration, validate, configuration.extensionInfo, configuration.restrictedProperties, void 0, bucket);
      this.configurationContributors.push(configuration);
      this.registerJSONConfiguration(configuration);
    });
  }
  doDeregisterConfigurations(configurations, bucket) {
    const deregisterConfiguration = (configuration) => {
      const excludedSyncKeys = this.excludedAgentHostSyncKeys.get(configuration);
      if (excludedSyncKeys) {
        for (const key of excludedSyncKeys) {
          bucket.add(key);
          this.agentHostSyncConfigurations.delete(key);
        }
        this.excludedAgentHostSyncKeys.delete(configuration);
      }
      if (configuration.properties) {
        for (const key in configuration.properties) {
          bucket.add(key);
          const property = this.configurationProperties[key];
          if (property?.policy?.name) {
            this.policyConfigurations.delete(property.policy.name);
          }
          this.agentHostSyncConfigurations.delete(key);
          if (property?.policyReference?.name) {
            const refs = this.policyReferenceConfigurations.get(property.policyReference.name);
            if (refs) {
              refs.delete(key);
              if (refs.size === 0) {
                this.policyReferenceConfigurations.delete(property.policyReference.name);
              }
            }
          }
          delete this.configurationProperties[key];
          this.removeFromSchema(key, configuration.properties[key]);
        }
      }
      configuration.allOf?.forEach((node) => deregisterConfiguration(node));
    };
    for (const configuration of configurations) {
      deregisterConfiguration(configuration);
      const index = this.configurationContributors.indexOf(configuration);
      if (index !== -1) {
        this.configurationContributors.splice(index, 1);
      }
    }
  }
  validateAndRegisterProperties(configuration, validate = true, extensionInfo, restrictedProperties, scope = 4 /* WINDOW */, bucket) {
    scope = isUndefinedOrNull(configuration.scope) ? scope : configuration.scope;
    const properties = configuration.properties;
    if (properties) {
      for (const key in properties) {
        const property = properties[key];
        property.section = {
          id: configuration.id,
          title: configuration.title,
          order: configuration.order,
          extensionInfo: configuration.extensionInfo
        };
        if (validate && validateProperty(key, property, extensionInfo?.id)) {
          delete properties[key];
          continue;
        }
        property.source = extensionInfo;
        property.defaultDefaultValue = properties[key].default;
        this.updatePropertyDefaultValue(key, property);
        if (OVERRIDE_PROPERTY_REGEX.test(key)) {
          property.scope = void 0;
        } else {
          property.scope = isUndefinedOrNull(property.scope) ? scope : property.scope;
          property.restricted = isUndefinedOrNull(property.restricted) ? !!restrictedProperties?.includes(key) : property.restricted;
        }
        if (property.experiment) {
          if (!property.tags?.some((tag) => tag.toLowerCase() === "onexp")) {
            property.tags = property.tags ?? [];
            property.tags.push("onExP");
          }
        } else if (property.tags?.some((tag) => tag.toLowerCase() === "onexp")) {
          console.error(`Invalid tag 'onExP' found for property '${key}'. Please use 'experiment' property instead.`);
          property.experiment = { mode: "startup" };
        }
        const excluded = properties[key].hasOwnProperty("included") && !properties[key].included;
        const policyName = properties[key].policy?.name;
        const policyReferenceName = properties[key].policyReference?.name;
        const agentHostSync = properties[key].agentHost;
        if (agentHostSync) {
          this.agentHostSyncConfigurations.set(key, agentHostSync);
        }
        if (excluded) {
          this.excludedConfigurationProperties[key] = properties[key];
          if (policyName) {
            this.policyConfigurations.set(policyName, key);
            bucket.add(key);
          }
          if (policyReferenceName) {
            this.addPolicyReferenceConfiguration(policyReferenceName, key);
            bucket.add(key);
          }
          if (agentHostSync) {
            bucket.add(key);
            let excludedSyncKeys = this.excludedAgentHostSyncKeys.get(configuration);
            if (!excludedSyncKeys) {
              excludedSyncKeys = /* @__PURE__ */ new Set();
              this.excludedAgentHostSyncKeys.set(configuration, excludedSyncKeys);
            }
            excludedSyncKeys.add(key);
          }
          delete properties[key];
        } else {
          bucket.add(key);
          if (policyName) {
            this.policyConfigurations.set(policyName, key);
          }
          if (policyReferenceName) {
            this.addPolicyReferenceConfiguration(policyReferenceName, key);
          }
          this.configurationProperties[key] = properties[key];
          if (!properties[key].deprecationMessage && properties[key].markdownDeprecationMessage) {
            properties[key].deprecationMessage = properties[key].markdownDeprecationMessage;
          }
        }
      }
    }
    const subNodes = configuration.allOf;
    if (subNodes) {
      for (const node of subNodes) {
        this.validateAndRegisterProperties(node, validate, extensionInfo, restrictedProperties, scope, bucket);
      }
    }
  }
  addPolicyReferenceConfiguration(policyName, key) {
    let keys = this.policyReferenceConfigurations.get(policyName);
    if (!keys) {
      keys = /* @__PURE__ */ new Set();
      this.policyReferenceConfigurations.set(policyName, keys);
    }
    keys.add(key);
  }
  // Only for tests
  getConfigurations() {
    return this.configurationContributors;
  }
  getConfigurationProperties() {
    return this.configurationProperties;
  }
  getPolicyConfigurations() {
    return this.policyConfigurations;
  }
  getPolicyReferenceConfigurations() {
    return this.policyReferenceConfigurations;
  }
  getAgentHostSyncConfigurations() {
    return this.agentHostSyncConfigurations;
  }
  getExcludedConfigurationProperties() {
    return this.excludedConfigurationProperties;
  }
  getRegisteredDefaultConfigurations() {
    return [...this.registeredConfigurationDefaults];
  }
  getConfigurationDefaultsOverrides() {
    const configurationDefaultsOverrides = /* @__PURE__ */ new Map();
    for (const [key, value] of this.configurationDefaultsOverrides) {
      if (value.configurationDefaultOverrideValue) {
        configurationDefaultsOverrides.set(key, value.configurationDefaultOverrideValue);
      }
    }
    return configurationDefaultsOverrides;
  }
  registerJSONConfiguration(configuration) {
    const register2 = (configuration2) => {
      const properties = configuration2.properties;
      if (properties) {
        for (const key in properties) {
          this.updateSchema(key, properties[key]);
        }
      }
      const subNodes = configuration2.allOf;
      subNodes?.forEach(register2);
    };
    register2(configuration);
  }
  updateSchema(key, property) {
    allSettings.properties[key] = property;
    switch (property.scope) {
      case 1 /* APPLICATION */:
        applicationSettings.properties[key] = property;
        break;
      case 2 /* MACHINE */:
        machineSettings.properties[key] = property;
        break;
      case 3 /* APPLICATION_MACHINE */:
        applicationMachineSettings.properties[key] = property;
        break;
      case 7 /* MACHINE_OVERRIDABLE */:
        machineOverridableSettings.properties[key] = property;
        break;
      case 4 /* WINDOW */:
        windowSettings.properties[key] = property;
        break;
      case 5 /* RESOURCE */:
        resourceSettings.properties[key] = property;
        break;
      case 6 /* LANGUAGE_OVERRIDABLE */:
        resourceSettings.properties[key] = property;
        this.resourceLanguageSettingsSchema.properties[key] = property;
        break;
    }
  }
  removeFromSchema(key, property) {
    delete allSettings.properties[key];
    switch (property.scope) {
      case 1 /* APPLICATION */:
        delete applicationSettings.properties[key];
        break;
      case 2 /* MACHINE */:
        delete machineSettings.properties[key];
        break;
      case 3 /* APPLICATION_MACHINE */:
        delete applicationMachineSettings.properties[key];
        break;
      case 7 /* MACHINE_OVERRIDABLE */:
        delete machineOverridableSettings.properties[key];
        break;
      case 4 /* WINDOW */:
        delete windowSettings.properties[key];
        break;
      case 5 /* RESOURCE */:
      case 6 /* LANGUAGE_OVERRIDABLE */:
        delete resourceSettings.properties[key];
        delete this.resourceLanguageSettingsSchema.properties[key];
        break;
    }
  }
  updateOverridePropertyPatternKey() {
    for (const overrideIdentifier of this.overrideIdentifiers.values()) {
      const overrideIdentifierProperty = `[${overrideIdentifier}]`;
      const resourceLanguagePropertiesSchema = {
        type: "object",
        description: localize(2793, null),
        errorMessage: localize(2794, null),
        $ref: resourceLanguageSettingsSchemaId
      };
      this.updatePropertyDefaultValue(overrideIdentifierProperty, resourceLanguagePropertiesSchema);
      allSettings.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
      applicationSettings.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
      applicationMachineSettings.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
      machineSettings.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
      machineOverridableSettings.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
      windowSettings.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
      resourceSettings.properties[overrideIdentifierProperty] = resourceLanguagePropertiesSchema;
    }
  }
  registerOverridePropertyPatternKey() {
    const resourceLanguagePropertiesSchema = {
      type: "object",
      description: localize(2793, null),
      errorMessage: localize(2794, null),
      $ref: resourceLanguageSettingsSchemaId
    };
    allSettings.patternProperties[OVERRIDE_PROPERTY_PATTERN] = resourceLanguagePropertiesSchema;
    applicationSettings.patternProperties[OVERRIDE_PROPERTY_PATTERN] = resourceLanguagePropertiesSchema;
    applicationMachineSettings.patternProperties[OVERRIDE_PROPERTY_PATTERN] = resourceLanguagePropertiesSchema;
    machineSettings.patternProperties[OVERRIDE_PROPERTY_PATTERN] = resourceLanguagePropertiesSchema;
    machineOverridableSettings.patternProperties[OVERRIDE_PROPERTY_PATTERN] = resourceLanguagePropertiesSchema;
    windowSettings.patternProperties[OVERRIDE_PROPERTY_PATTERN] = resourceLanguagePropertiesSchema;
    resourceSettings.patternProperties[OVERRIDE_PROPERTY_PATTERN] = resourceLanguagePropertiesSchema;
    this._onDidSchemaChange.fire();
  }
  updatePropertyDefaultValue(key, property) {
    const configurationdefaultOverride = this.configurationDefaultsOverrides.get(key)?.configurationDefaultOverrideValue;
    let defaultValue = void 0;
    let defaultSource = void 0;
    if (configurationdefaultOverride && (!property.disallowConfigurationDefault || !configurationdefaultOverride.source)) {
      defaultValue = configurationdefaultOverride.value;
      defaultSource = configurationdefaultOverride.source;
    }
    if (isUndefined(defaultValue)) {
      defaultValue = property.defaultDefaultValue;
      defaultSource = void 0;
    }
    if (isUndefined(defaultValue)) {
      defaultValue = getDefaultValue(property.type);
    }
    property.default = defaultValue;
    property.defaultValueSource = defaultSource;
  }
};

var OVERRIDE_IDENTIFIER_PATTERN = `\\[([^\\]]+)\\]`;

var OVERRIDE_IDENTIFIER_REGEX = new RegExp(OVERRIDE_IDENTIFIER_PATTERN, "g");

var OVERRIDE_PROPERTY_PATTERN = `^(${OVERRIDE_IDENTIFIER_PATTERN})+$`;

var OVERRIDE_PROPERTY_REGEX = new RegExp(OVERRIDE_PROPERTY_PATTERN);

function overrideIdentifiersFromKey(key) {
  const identifiers = [];
  if (OVERRIDE_PROPERTY_REGEX.test(key)) {
    let matches = OVERRIDE_IDENTIFIER_REGEX.exec(key);
    while (matches?.length) {
      const identifier = matches[1].trim();
      if (identifier) {
        identifiers.push(identifier);
      }
      matches = OVERRIDE_IDENTIFIER_REGEX.exec(key);
    }
  }
  return distinct(identifiers);
}

function keyFromOverrideIdentifiers(overrideIdentifiers) {
  return overrideIdentifiers.reduce((result, overrideIdentifier) => `${result}[${overrideIdentifier}]`, "");
}

function getDefaultValue(type2) {
  const t = Array.isArray(type2) ? type2[0] : type2;
  switch (t) {
    case "boolean":
      return false;
    case "integer":
    case "number":
      return 0;
    case "string":
      return "";
    case "array":
      return [];
    case "object":
      return {};
    default:
      return null;
  }
}

var configurationRegistry = new ConfigurationRegistry();

Registry.add(Extensions2.Configuration, configurationRegistry);

function validateProperty(property, schema, extensionId) {
  if (!property.trim()) {
    return localize(2789, null);
  }
  if (OVERRIDE_PROPERTY_REGEX.test(property)) {
    return localize(2790, null, property);
  }
  if (configurationRegistry.getConfigurationProperties()[property] !== void 0 && (!extensionId || !EXTENSION_UNIFICATION_EXTENSION_IDS.has(extensionId.toLowerCase()))) {
    return localize(2788, null, property);
  }
  if (schema.policy && schema.policyReference) {
    return localize(2786, null, property);
  }
  if (schema.policy?.name && configurationRegistry.getPolicyConfigurations().get(schema.policy?.name) !== void 0) {
    return localize(2787, null, property, schema.policy?.name, configurationRegistry.getPolicyConfigurations().get(schema.policy?.name));
  }
  if (schema.agentHost) {
    for (const [owner, sync] of configurationRegistry.getAgentHostSyncConfigurations()) {
      if (sync.key === schema.agentHost.key && owner !== property) {
        return localize(2785, null, property, schema.agentHost.key, owner);
      }
    }
  }
  return null;
}

function getAllConfigurationProperties(configurationNode) {
  const result = {};
  for (const configuration of configurationNode) {
    const properties = configuration.properties;
    if (isObject(properties)) {
      for (const key in properties) {
        result[key] = properties[key];
      }
    }
    if (configuration.allOf) {
      Object.assign(result, getAllConfigurationProperties(configuration.allOf));
    }
  }
  return result;
}

function parseScope(scope) {
  switch (scope) {
    case "application":
      return 1 /* APPLICATION */;
    case "machine":
      return 2 /* MACHINE */;
    case "resource":
      return 5 /* RESOURCE */;
    case "machine-overridable":
      return 7 /* MACHINE_OVERRIDABLE */;
    case "language-overridable":
      return 6 /* LANGUAGE_OVERRIDABLE */;
    default:
      return 4 /* WINDOW */;
  }
}

var EXTENSION_UNIFICATION_EXTENSION_IDS = new Set(product_default.defaultChatAgent ? [product_default.defaultChatAgent.extensionId, product_default.defaultChatAgent.chatExtensionId].map((id2) => id2.toLowerCase()) : []);
export { isConfigurationDefaultSourceEquals, overrideIdentifiersFromKey, keyFromOverrideIdentifiers, getDefaultValue, validateProperty, getAllConfigurationProperties, parseScope, Extensions2, allSettings, applicationSettings, applicationMachineSettings, machineSettings, machineOverridableSettings, windowSettings, resourceSettings, resourceLanguageSettingsSchemaId, contributionRegistry, ConfigurationRegistry, OVERRIDE_IDENTIFIER_PATTERN, OVERRIDE_IDENTIFIER_REGEX, OVERRIDE_PROPERTY_PATTERN, OVERRIDE_PROPERTY_REGEX, configurationRegistry, EXTENSION_UNIFICATION_EXTENSION_IDS };
