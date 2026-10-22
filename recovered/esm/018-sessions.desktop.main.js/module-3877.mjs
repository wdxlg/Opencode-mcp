// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/configuration/browser/configurationService.ts
import { Disposable } from "./module-0012.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4, OVERRIDE_PROPERTY_PATTERN, allSettings, applicationMachineSettings, applicationSettings, configurationDefaultsSchemaId, isConfigurationDefaultSourceEquals, machineOverridableSettings, machineSettings, resourceLanguageSettingsSchemaId, resourceSettings, windowSettings } from "./module-0140.mjs";
import { Delayer, Throttler } from "./module-0036.mjs";
import { Event2 } from "./module-0017.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { fixSettingLinks } from "./module-1591.mjs";
import { localize } from "./module-0001.mjs";
import { Extensions3 } from "./module-0138.mjs";
import { APPLY_ALL_PROFILES_SETTING, defaultSettingsSchemaId, folderSettingsSchemaId, machineSettingsSchemaId, profileSettingsSchemaId, userSettingsSchemaId, workspaceSettingsSchemaId } from "./module-1198.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { isUndefined } from "./module-0010.mjs";
import { equals4 } from "./module-0098.mjs";
import { IWorkbenchAssignmentService } from "./module-1222.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILogService } from "./module-0095.mjs";
import { Extensions10, WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { workbenchConfigurationNodeBase } from "./module-1113.mjs";


// src/vs/workbench/services/configuration/browser/configurationService.ts
var RegisterConfigurationSchemasContribution = class extends Disposable {
  constructor(workspaceContextService, environmentService, workspaceTrustManagementService, extensionService, lifecycleService) {
    super();
    this.workspaceContextService = workspaceContextService;
    this.environmentService = environmentService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    extensionService.whenInstalledExtensionsRegistered().then(() => {
      this.registerConfigurationSchemas();
      const configurationRegistry25 = Registry.as(Extensions4.Configuration);
      const delayer5 = this._register(new Delayer(50));
      this._register(Event2.any(configurationRegistry25.onDidUpdateConfiguration, configurationRegistry25.onDidSchemaChange, workspaceTrustManagementService.onDidChangeTrust)(() => delayer5.trigger(
        () => this.registerConfigurationSchemas(),
        lifecycleService.phase === 4 /* Eventually */ ? void 0 : 2500
        /* delay longer in early phases */
      )));
    });
  }
  registerConfigurationSchemas() {
    for (const key3 of Object.keys(allSettings.properties)) {
      const prop = allSettings.properties[key3];
      if (prop.markdownDeprecationMessage && prop.deprecationMessage === prop.markdownDeprecationMessage) {
        prop.deprecationMessage = renderAsPlaintext({ value: fixSettingLinks(prop.markdownDeprecationMessage) });
      }
    }
    const allSettingsSchema = {
      properties: allSettings.properties,
      patternProperties: allSettings.patternProperties,
      additionalProperties: true,
      allowTrailingCommas: true,
      allowComments: true
    };
    const userSettingsSchema = this.environmentService.remoteAuthority ? {
      properties: Object.assign(
        {},
        applicationSettings.properties,
        windowSettings.properties,
        resourceSettings.properties
      ),
      patternProperties: allSettings.patternProperties,
      additionalProperties: true,
      allowTrailingCommas: true,
      allowComments: true
    } : allSettingsSchema;
    const profileSettingsSchema = {
      properties: Object.assign(
        {},
        machineSettings.properties,
        machineOverridableSettings.properties,
        windowSettings.properties,
        resourceSettings.properties
      ),
      patternProperties: allSettings.patternProperties,
      additionalProperties: true,
      allowTrailingCommas: true,
      allowComments: true
    };
    const machineSettingsSchema = {
      properties: Object.assign(
        {},
        applicationMachineSettings.properties,
        machineSettings.properties,
        machineOverridableSettings.properties,
        windowSettings.properties,
        resourceSettings.properties
      ),
      patternProperties: allSettings.patternProperties,
      additionalProperties: true,
      allowTrailingCommas: true,
      allowComments: true
    };
    const workspaceSettingsSchema = {
      properties: Object.assign(
        {},
        this.checkAndFilterPropertiesRequiringTrust(machineOverridableSettings.properties),
        this.checkAndFilterPropertiesRequiringTrust(windowSettings.properties),
        this.checkAndFilterPropertiesRequiringTrust(resourceSettings.properties)
      ),
      patternProperties: allSettings.patternProperties,
      additionalProperties: true,
      allowTrailingCommas: true,
      allowComments: true
    };
    const defaultSettingsSchema = {
      properties: Object.keys(allSettings.properties).reduce((result, key3) => {
        result[key3] = Object.assign({ deprecationMessage: void 0 }, allSettings.properties[key3]);
        return result;
      }, {}),
      patternProperties: Object.keys(allSettings.patternProperties).reduce((result, key3) => {
        result[key3] = Object.assign({ deprecationMessage: void 0 }, allSettings.patternProperties[key3]);
        return result;
      }, {}),
      additionalProperties: true,
      allowTrailingCommas: true,
      allowComments: true
    };
    const folderSettingsSchema = 3 /* WORKSPACE */ === this.workspaceContextService.getWorkbenchState() ? {
      properties: Object.assign(
        {},
        this.checkAndFilterPropertiesRequiringTrust(machineOverridableSettings.properties),
        this.checkAndFilterPropertiesRequiringTrust(resourceSettings.properties)
      ),
      patternProperties: allSettings.patternProperties,
      additionalProperties: true,
      allowTrailingCommas: true,
      allowComments: true
    } : workspaceSettingsSchema;
    const configDefaultsSchema = {
      type: "object",
      description: localize(22770, null),
      properties: Object.assign(
        {},
        this.filterDefaultOverridableProperties(machineOverridableSettings.properties),
        this.filterDefaultOverridableProperties(windowSettings.properties),
        this.filterDefaultOverridableProperties(resourceSettings.properties)
      ),
      patternProperties: {
        [OVERRIDE_PROPERTY_PATTERN]: {
          type: "object",
          default: {},
          $ref: resourceLanguageSettingsSchemaId
        }
      },
      additionalProperties: false
    };
    this.registerSchemas({
      defaultSettingsSchema,
      userSettingsSchema,
      profileSettingsSchema,
      machineSettingsSchema,
      workspaceSettingsSchema,
      folderSettingsSchema,
      configDefaultsSchema
    });
  }
  registerSchemas(schemas2) {
    const jsonRegistry4 = Registry.as(Extensions3.JSONContribution);
    jsonRegistry4.registerSchema(defaultSettingsSchemaId, schemas2.defaultSettingsSchema);
    jsonRegistry4.registerSchema(userSettingsSchemaId, schemas2.userSettingsSchema);
    jsonRegistry4.registerSchema(profileSettingsSchemaId, schemas2.profileSettingsSchema);
    jsonRegistry4.registerSchema(machineSettingsSchemaId, schemas2.machineSettingsSchema);
    jsonRegistry4.registerSchema(workspaceSettingsSchemaId, schemas2.workspaceSettingsSchema);
    jsonRegistry4.registerSchema(folderSettingsSchemaId, schemas2.folderSettingsSchema);
    jsonRegistry4.registerSchema(configurationDefaultsSchemaId, schemas2.configDefaultsSchema);
  }
  checkAndFilterPropertiesRequiringTrust(properties) {
    if (this.workspaceTrustManagementService.isWorkspaceTrusted()) {
      return properties;
    }
    const result = {};
    Object.entries(properties).forEach(([key3, value2]) => {
      if (!value2.restricted) {
        result[key3] = value2;
      }
    });
    return result;
  }
  filterDefaultOverridableProperties(properties) {
    const result = {};
    Object.entries(properties).forEach(([key3, value2]) => {
      if (!value2.disallowConfigurationDefault) {
        result[key3] = value2;
      }
    });
    return result;
  }
};

RegisterConfigurationSchemasContribution = __decorateClass([
  __decorateParam(0, IWorkspaceContextService),
  __decorateParam(1, IWorkbenchEnvironmentService),
  __decorateParam(2, IWorkspaceTrustManagementService),
  __decorateParam(3, IExtensionService),
  __decorateParam(4, ILifecycleService)
], RegisterConfigurationSchemasContribution);

var ConfigurationDefaultOverridesContribution = class extends Disposable {
  constructor(workbenchAssignmentService, extensionService, configurationService, environmentService, logService) {
    super();
    this.workbenchAssignmentService = workbenchAssignmentService;
    this.extensionService = extensionService;
    this.configurationService = configurationService;
    this.environmentService = environmentService;
    this.logService = logService;
    this.processedExperimentalSettings = /* @__PURE__ */ new Set();
    this.autoExperimentalSettings = /* @__PURE__ */ new Set();
    this.configurationRegistry = Registry.as(Extensions4.Configuration);
    this.throttler = this._register(new Throttler());
    this.throttler.queue(() => this.updateDefaults());
    this._register(workbenchAssignmentService.onDidRefetchAssignments(() => this.throttler.queue(() => this.processExperimentalSettings(this.autoExperimentalSettings, true))));
    this._register(this.configurationRegistry.onDidUpdateConfiguration(({ properties }) => this.processExperimentalSettings(properties, false)));
  }
  static {
    this.ID = "workbench.contrib.configurationDefaultOverridesContribution";
  }
  async updateDefaults() {
    this.logService.trace("ConfigurationService#updateDefaults: begin");
    try {
      await this.processExperimentalSettings(Object.keys(this.configurationRegistry.getConfigurationProperties()), false);
    } finally {
      await this.extensionService.whenInstalledExtensionsRegistered();
      this.logService.trace("ConfigurationService#updateDefaults: resetting the defaults");
      this.configurationService.reloadConfiguration(7 /* DEFAULT */);
    }
  }
  async processExperimentalSettings(properties, autoRefetch) {
    const overrides = {};
    const allProperties = this.configurationRegistry.getConfigurationProperties();
    const defaultConfigurationsPreventingExperimentOverrides = this.configurationRegistry.getRegisteredDefaultConfigurations().filter((configuration2) => configuration2.preventExperimentOverride);
    for (const property of properties) {
      const schema10 = allProperties[property];
      if (!schema10?.experiment) {
        continue;
      }
      const defaultValueSource = schema10.defaultValueSource && !(schema10.defaultValueSource instanceof Map) ? schema10.defaultValueSource : void 0;
      if (defaultValueSource && defaultConfigurationsPreventingExperimentOverrides.some((configuration2) => isConfigurationDefaultSourceEquals(configuration2.source, defaultValueSource) && configuration2.overrides?.[property] !== void 0)) {
        continue;
      }
      if (!autoRefetch && this.processedExperimentalSettings.has(property)) {
        continue;
      }
      this.processedExperimentalSettings.add(property);
      if (schema10.experiment.mode === "auto") {
        this.autoExperimentalSettings.add(property);
      }
      try {
        const value2 = await this.workbenchAssignmentService.getTreatment(schema10.experiment.name ?? `config.${property}`);
        if (this.shouldOverride(value2, schema10)) {
          overrides[property] = value2;
        }
      } catch (error) {
      }
    }
    if (Object.keys(overrides).length) {
      this.configurationRegistry.registerDefaultConfigurations([{ overrides, source: "experiments" }]);
    }
  }
  shouldOverride(value2, schema10) {
    if (isUndefined(value2)) {
      return false;
    }
    if (this.environmentService.isSessionsWindow && schema10.agentsWindow?.default !== void 0) {
      return !equals4(value2, schema10.agentsWindow?.default);
    }
    return !equals4(value2, schema10.default);
  }
};

ConfigurationDefaultOverridesContribution = __decorateClass([
  __decorateParam(0, IWorkbenchAssignmentService),
  __decorateParam(1, IExtensionService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IWorkbenchEnvironmentService),
  __decorateParam(4, ILogService)
], ConfigurationDefaultOverridesContribution);

var workbenchContributionsRegistry8 = Registry.as(Extensions10.Workbench);

workbenchContributionsRegistry8.registerWorkbenchContribution(RegisterConfigurationSchemasContribution, 3 /* Restored */);

registerWorkbenchContribution2(ConfigurationDefaultOverridesContribution.ID, ConfigurationDefaultOverridesContribution, WorkbenchPhase.BlockRestore);

var configurationRegistry21 = Registry.as(Extensions4.Configuration);

configurationRegistry21.registerConfiguration({
  ...workbenchConfigurationNodeBase,
  properties: {
    [APPLY_ALL_PROFILES_SETTING]: {
      "type": "array",
      description: localize(22771, null),
      "default": [],
      "scope": 1 /* APPLICATION */,
      additionalProperties: true,
      uniqueItems: true
    }
  }
});
export { RegisterConfigurationSchemasContribution, ConfigurationDefaultOverridesContribution, workbenchContributionsRegistry8, configurationRegistry21 };
