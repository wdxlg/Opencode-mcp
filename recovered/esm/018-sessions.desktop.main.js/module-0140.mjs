// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/configuration/common/configurationRegistry.ts
import { Registry } from "./module-0090.mjs";
import { Extensions3 } from "./module-0138.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { localize } from "./module-0001.mjs";
import { isEmptyObject, isObject, isUndefined, isUndefinedOrNull } from "./module-0010.mjs";
import { getLanguageTagSettingPlainKey } from "./module-0132.mjs";
import { distinct } from "./module-0007.mjs";
import { product_default } from "./module-0139.mjs";


// src/vs/platform/configuration/common/configurationRegistry.ts
var Extensions4 = {
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

var configurationDefaultsSchemaId = "vscode://schemas/settings/configurationDefaults";

var contributionRegistry = Registry.as(Extensions3.JSONContribution);

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
  registerConfiguration(configuration2, validate = true) {
    this.registerConfigurations([configuration2], validate);
    return configuration2;
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
      for (const key3 in overrides) {
        bucket.add(key3);
        const configurationDefaultOverridesForKey = this.configurationDefaultsOverrides.get(key3) ?? this.configurationDefaultsOverrides.set(key3, { configurationDefaultOverrides: [] }).get(key3);
        const value2 = overrides[key3];
        configurationDefaultOverridesForKey.configurationDefaultOverrides.push({ value: value2, source });
        if (OVERRIDE_PROPERTY_REGEX.test(key3)) {
          const newDefaultOverride = this.mergeDefaultConfigurationsForOverrideIdentifier(key3, value2, source, configurationDefaultOverridesForKey.configurationDefaultOverrideValue);
          if (!newDefaultOverride) {
            continue;
          }
          configurationDefaultOverridesForKey.configurationDefaultOverrideValue = newDefaultOverride;
          this.updateDefaultOverrideProperty(key3, newDefaultOverride, source);
          overrideIdentifiers.push(...overrideIdentifiersFromKey(key3));
        } else {
          const newDefaultOverride = this.mergeDefaultConfigurationsForConfigurationProperty(key3, value2, source, configurationDefaultOverridesForKey.configurationDefaultOverrideValue);
          if (!newDefaultOverride) {
            continue;
          }
          configurationDefaultOverridesForKey.configurationDefaultOverrideValue = newDefaultOverride;
          const property = this.configurationProperties[key3];
          if (property) {
            this.updatePropertyDefaultValue(key3, property);
            this.updateSchema(key3, property);
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
      const index2 = this.registeredConfigurationDefaults.indexOf(defaultConfiguration);
      if (index2 !== -1) {
        this.registeredConfigurationDefaults.splice(index2, 1);
      }
    }
    for (const { overrides, source } of defaultConfigurations) {
      for (const key3 in overrides) {
        const configurationDefaultOverridesForKey = this.configurationDefaultsOverrides.get(key3);
        if (!configurationDefaultOverridesForKey) {
          continue;
        }
        const index2 = configurationDefaultOverridesForKey.configurationDefaultOverrides.findIndex((configurationDefaultOverride) => source ? isConfigurationDefaultSourceEquals(configurationDefaultOverride.source, source) : configurationDefaultOverride.value === overrides[key3]);
        if (index2 === -1) {
          continue;
        }
        configurationDefaultOverridesForKey.configurationDefaultOverrides.splice(index2, 1);
        if (configurationDefaultOverridesForKey.configurationDefaultOverrides.length === 0) {
          this.configurationDefaultsOverrides.delete(key3);
        }
        if (OVERRIDE_PROPERTY_REGEX.test(key3)) {
          let configurationDefaultOverrideValue;
          for (const configurationDefaultOverride of configurationDefaultOverridesForKey.configurationDefaultOverrides) {
            configurationDefaultOverrideValue = this.mergeDefaultConfigurationsForOverrideIdentifier(key3, configurationDefaultOverride.value, configurationDefaultOverride.source, configurationDefaultOverrideValue);
          }
          if (configurationDefaultOverrideValue && !isEmptyObject(configurationDefaultOverrideValue.value)) {
            configurationDefaultOverridesForKey.configurationDefaultOverrideValue = configurationDefaultOverrideValue;
            this.updateDefaultOverrideProperty(key3, configurationDefaultOverrideValue, source);
          } else {
            this.configurationDefaultsOverrides.delete(key3);
            delete this.configurationProperties[key3];
            delete this.defaultLanguageConfigurationOverridesNode.properties[key3];
          }
        } else {
          let configurationDefaultOverrideValue;
          for (const configurationDefaultOverride of configurationDefaultOverridesForKey.configurationDefaultOverrides) {
            configurationDefaultOverrideValue = this.mergeDefaultConfigurationsForConfigurationProperty(key3, configurationDefaultOverride.value, configurationDefaultOverride.source, configurationDefaultOverrideValue);
          }
          configurationDefaultOverridesForKey.configurationDefaultOverrideValue = configurationDefaultOverrideValue;
          const property = this.configurationProperties[key3];
          if (property) {
            this.updatePropertyDefaultValue(key3, property);
            this.updateSchema(key3, property);
          }
        }
        bucket.add(key3);
      }
    }
    this.updateOverridePropertyPatternKey();
  }
  updateDefaultOverrideProperty(key3, newDefaultOverride, source) {
    const property = {
      section: {
        id: this.defaultLanguageConfigurationOverridesNode.id,
        title: this.defaultLanguageConfigurationOverridesNode.title,
        order: this.defaultLanguageConfigurationOverridesNode.order,
        extensionInfo: this.defaultLanguageConfigurationOverridesNode.extensionInfo
      },
      type: "object",
      default: newDefaultOverride.value,
      description: localize(2791, null, getLanguageTagSettingPlainKey(key3)),
      $ref: resourceLanguageSettingsSchemaId,
      defaultDefaultValue: newDefaultOverride.value,
      source,
      defaultValueSource: source
    };
    this.configurationProperties[key3] = property;
    this.defaultLanguageConfigurationOverridesNode.properties[key3] = property;
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
  mergeDefaultConfigurationsForConfigurationProperty(propertyKey, value2, valuesSource, existingDefaultOverride) {
    const property = this.configurationProperties[propertyKey];
    const existingDefaultValue = existingDefaultOverride?.value ?? property?.defaultDefaultValue;
    let source = valuesSource;
    const isObjectSetting = isObject(value2) && (property !== void 0 && property.type === "object" || property === void 0 && (isUndefined(existingDefaultValue) || isObject(existingDefaultValue)));
    if (isObjectSetting) {
      source = existingDefaultOverride?.source ?? /* @__PURE__ */ new Map();
      if (!(source instanceof Map)) {
        console.error("defaultValueSource is not a Map");
        return void 0;
      }
      for (const objectKey in value2) {
        if (valuesSource) {
          source.set(`${propertyKey}.${objectKey}`, valuesSource);
        }
      }
      value2 = { ...isObject(existingDefaultValue) ? existingDefaultValue : {}, ...value2 };
    }
    return { value: value2, source };
  }
  deltaConfiguration(delta2) {
    let defaultsOverrides = false;
    const properties = /* @__PURE__ */ new Set();
    if (delta2.removedDefaults) {
      this.doDeregisterDefaultConfigurations(delta2.removedDefaults, properties);
      defaultsOverrides = true;
    }
    if (delta2.addedDefaults) {
      this.doRegisterDefaultConfigurations(delta2.addedDefaults, properties);
      defaultsOverrides = true;
    }
    if (delta2.removedConfigurations) {
      this.doDeregisterConfigurations(delta2.removedConfigurations, properties);
    }
    if (delta2.addedConfigurations) {
      this.doRegisterConfigurations(delta2.addedConfigurations, false, properties);
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
    configurations.forEach((configuration2) => {
      this.validateAndRegisterProperties(configuration2, validate, configuration2.extensionInfo, configuration2.restrictedProperties, void 0, bucket);
      this.configurationContributors.push(configuration2);
      this.registerJSONConfiguration(configuration2);
    });
  }
  doDeregisterConfigurations(configurations, bucket) {
    const deregisterConfiguration = (configuration2) => {
      const excludedSyncKeys = this.excludedAgentHostSyncKeys.get(configuration2);
      if (excludedSyncKeys) {
        for (const key3 of excludedSyncKeys) {
          bucket.add(key3);
          this.agentHostSyncConfigurations.delete(key3);
        }
        this.excludedAgentHostSyncKeys.delete(configuration2);
      }
      if (configuration2.properties) {
        for (const key3 in configuration2.properties) {
          bucket.add(key3);
          const property = this.configurationProperties[key3];
          if (property?.policy?.name) {
            this.policyConfigurations.delete(property.policy.name);
          }
          this.agentHostSyncConfigurations.delete(key3);
          if (property?.policyReference?.name) {
            const refs = this.policyReferenceConfigurations.get(property.policyReference.name);
            if (refs) {
              refs.delete(key3);
              if (refs.size === 0) {
                this.policyReferenceConfigurations.delete(property.policyReference.name);
              }
            }
          }
          delete this.configurationProperties[key3];
          this.removeFromSchema(key3, configuration2.properties[key3]);
        }
      }
      configuration2.allOf?.forEach((node) => deregisterConfiguration(node));
    };
    for (const configuration2 of configurations) {
      deregisterConfiguration(configuration2);
      const index2 = this.configurationContributors.indexOf(configuration2);
      if (index2 !== -1) {
        this.configurationContributors.splice(index2, 1);
      }
    }
  }
  validateAndRegisterProperties(configuration2, validate = true, extensionInfo, restrictedProperties, scope = 4 /* WINDOW */, bucket) {
    scope = isUndefinedOrNull(configuration2.scope) ? scope : configuration2.scope;
    const properties = configuration2.properties;
    if (properties) {
      for (const key3 in properties) {
        const property = properties[key3];
        property.section = {
          id: configuration2.id,
          title: configuration2.title,
          order: configuration2.order,
          extensionInfo: configuration2.extensionInfo
        };
        if (validate && validateProperty(key3, property, extensionInfo?.id)) {
          delete properties[key3];
          continue;
        }
        property.source = extensionInfo;
        property.defaultDefaultValue = properties[key3].default;
        this.updatePropertyDefaultValue(key3, property);
        if (OVERRIDE_PROPERTY_REGEX.test(key3)) {
          property.scope = void 0;
        } else {
          property.scope = isUndefinedOrNull(property.scope) ? scope : property.scope;
          property.restricted = isUndefinedOrNull(property.restricted) ? !!restrictedProperties?.includes(key3) : property.restricted;
        }
        if (property.experiment) {
          if (!property.tags?.some((tag2) => tag2.toLowerCase() === "onexp")) {
            property.tags = property.tags ?? [];
            property.tags.push("onExP");
          }
        } else if (property.tags?.some((tag2) => tag2.toLowerCase() === "onexp")) {
          console.error(`Invalid tag 'onExP' found for property '${key3}'. Please use 'experiment' property instead.`);
          property.experiment = { mode: "startup" };
        }
        const excluded = properties[key3].hasOwnProperty("included") && !properties[key3].included;
        const policyName = properties[key3].policy?.name;
        const policyReferenceName = properties[key3].policyReference?.name;
        const agentHostSync = properties[key3].agentHost;
        if (agentHostSync) {
          this.agentHostSyncConfigurations.set(key3, agentHostSync);
        }
        if (excluded) {
          this.excludedConfigurationProperties[key3] = properties[key3];
          if (policyName) {
            this.policyConfigurations.set(policyName, key3);
            bucket.add(key3);
          }
          if (policyReferenceName) {
            this.addPolicyReferenceConfiguration(policyReferenceName, key3);
            bucket.add(key3);
          }
          if (agentHostSync) {
            bucket.add(key3);
            let excludedSyncKeys = this.excludedAgentHostSyncKeys.get(configuration2);
            if (!excludedSyncKeys) {
              excludedSyncKeys = /* @__PURE__ */ new Set();
              this.excludedAgentHostSyncKeys.set(configuration2, excludedSyncKeys);
            }
            excludedSyncKeys.add(key3);
          }
          delete properties[key3];
        } else {
          bucket.add(key3);
          if (policyName) {
            this.policyConfigurations.set(policyName, key3);
          }
          if (policyReferenceName) {
            this.addPolicyReferenceConfiguration(policyReferenceName, key3);
          }
          this.configurationProperties[key3] = properties[key3];
          if (!properties[key3].deprecationMessage && properties[key3].markdownDeprecationMessage) {
            properties[key3].deprecationMessage = properties[key3].markdownDeprecationMessage;
          }
        }
      }
    }
    const subNodes = configuration2.allOf;
    if (subNodes) {
      for (const node of subNodes) {
        this.validateAndRegisterProperties(node, validate, extensionInfo, restrictedProperties, scope, bucket);
      }
    }
  }
  addPolicyReferenceConfiguration(policyName, key3) {
    let keys = this.policyReferenceConfigurations.get(policyName);
    if (!keys) {
      keys = /* @__PURE__ */ new Set();
      this.policyReferenceConfigurations.set(policyName, keys);
    }
    keys.add(key3);
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
    for (const [key3, value2] of this.configurationDefaultsOverrides) {
      if (value2.configurationDefaultOverrideValue) {
        configurationDefaultsOverrides.set(key3, value2.configurationDefaultOverrideValue);
      }
    }
    return configurationDefaultsOverrides;
  }
  registerJSONConfiguration(configuration2) {
    const register3 = (configuration3) => {
      const properties = configuration3.properties;
      if (properties) {
        for (const key3 in properties) {
          this.updateSchema(key3, properties[key3]);
        }
      }
      const subNodes = configuration3.allOf;
      subNodes?.forEach(register3);
    };
    register3(configuration2);
  }
  updateSchema(key3, property) {
    allSettings.properties[key3] = property;
    switch (property.scope) {
      case 1 /* APPLICATION */:
        applicationSettings.properties[key3] = property;
        break;
      case 2 /* MACHINE */:
        machineSettings.properties[key3] = property;
        break;
      case 3 /* APPLICATION_MACHINE */:
        applicationMachineSettings.properties[key3] = property;
        break;
      case 7 /* MACHINE_OVERRIDABLE */:
        machineOverridableSettings.properties[key3] = property;
        break;
      case 4 /* WINDOW */:
        windowSettings.properties[key3] = property;
        break;
      case 5 /* RESOURCE */:
        resourceSettings.properties[key3] = property;
        break;
      case 6 /* LANGUAGE_OVERRIDABLE */:
        resourceSettings.properties[key3] = property;
        this.resourceLanguageSettingsSchema.properties[key3] = property;
        break;
    }
  }
  removeFromSchema(key3, property) {
    delete allSettings.properties[key3];
    switch (property.scope) {
      case 1 /* APPLICATION */:
        delete applicationSettings.properties[key3];
        break;
      case 2 /* MACHINE */:
        delete machineSettings.properties[key3];
        break;
      case 3 /* APPLICATION_MACHINE */:
        delete applicationMachineSettings.properties[key3];
        break;
      case 7 /* MACHINE_OVERRIDABLE */:
        delete machineOverridableSettings.properties[key3];
        break;
      case 4 /* WINDOW */:
        delete windowSettings.properties[key3];
        break;
      case 5 /* RESOURCE */:
      case 6 /* LANGUAGE_OVERRIDABLE */:
        delete resourceSettings.properties[key3];
        delete this.resourceLanguageSettingsSchema.properties[key3];
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
  updatePropertyDefaultValue(key3, property) {
    const configurationdefaultOverride = this.configurationDefaultsOverrides.get(key3)?.configurationDefaultOverrideValue;
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

function overrideIdentifiersFromKey(key3) {
  const identifiers2 = [];
  if (OVERRIDE_PROPERTY_REGEX.test(key3)) {
    let matches2 = OVERRIDE_IDENTIFIER_REGEX.exec(key3);
    while (matches2?.length) {
      const identifier2 = matches2[1].trim();
      if (identifier2) {
        identifiers2.push(identifier2);
      }
      matches2 = OVERRIDE_IDENTIFIER_REGEX.exec(key3);
    }
  }
  return distinct(identifiers2);
}

function keyFromOverrideIdentifiers(overrideIdentifiers) {
  return overrideIdentifiers.reduce((result, overrideIdentifier) => `${result}[${overrideIdentifier}]`, "");
}

function getDefaultValue(type) {
  const t2 = Array.isArray(type) ? type[0] : type;
  switch (t2) {
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

Registry.add(Extensions4.Configuration, configurationRegistry);

function validateProperty(property, schema10, extensionId) {
  if (!property.trim()) {
    return localize(2789, null);
  }
  if (OVERRIDE_PROPERTY_REGEX.test(property)) {
    return localize(2790, null, property);
  }
  if (configurationRegistry.getConfigurationProperties()[property] !== void 0 && (!extensionId || !EXTENSION_UNIFICATION_EXTENSION_IDS.has(extensionId.toLowerCase()))) {
    return localize(2788, null, property);
  }
  if (schema10.policy && schema10.policyReference) {
    return localize(2786, null, property);
  }
  if (schema10.policy?.name && configurationRegistry.getPolicyConfigurations().get(schema10.policy?.name) !== void 0) {
    return localize(2787, null, property, schema10.policy?.name, configurationRegistry.getPolicyConfigurations().get(schema10.policy?.name));
  }
  if (schema10.agentHost) {
    for (const [owner, sync] of configurationRegistry.getAgentHostSyncConfigurations()) {
      if (sync.key === schema10.agentHost.key && owner !== property) {
        return localize(2785, null, property, schema10.agentHost.key, owner);
      }
    }
  }
  return null;
}

function getScopes() {
  const scopes = [];
  const configurationProperties = configurationRegistry.getConfigurationProperties();
  for (const key3 of Object.keys(configurationProperties)) {
    scopes.push([key3, configurationProperties[key3].scope]);
  }
  scopes.push(["launch", 5 /* RESOURCE */]);
  scopes.push(["task", 5 /* RESOURCE */]);
  return scopes;
}

function getAllConfigurationProperties(configurationNode) {
  const result = {};
  for (const configuration2 of configurationNode) {
    const properties = configuration2.properties;
    if (isObject(properties)) {
      for (const key3 in properties) {
        result[key3] = properties[key3];
      }
    }
    if (configuration2.allOf) {
      Object.assign(result, getAllConfigurationProperties(configuration2.allOf));
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
export { isConfigurationDefaultSourceEquals, overrideIdentifiersFromKey, keyFromOverrideIdentifiers, getDefaultValue, validateProperty, getScopes, getAllConfigurationProperties, parseScope, Extensions4, allSettings, applicationSettings, applicationMachineSettings, machineSettings, machineOverridableSettings, windowSettings, resourceSettings, resourceLanguageSettingsSchemaId, configurationDefaultsSchemaId, contributionRegistry, ConfigurationRegistry, OVERRIDE_IDENTIFIER_PATTERN, OVERRIDE_IDENTIFIER_REGEX, OVERRIDE_PROPERTY_PATTERN, OVERRIDE_PROPERTY_REGEX, configurationRegistry, EXTENSION_UNIFICATION_EXTENSION_IDS };
