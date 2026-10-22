// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/common/configuration.ts
import { localize } from "./module-0015.mjs";
import { Emitter } from "./module-0019.mjs";
import { Registry } from "./module-0090.mjs";
import { Disposable } from "./module-0011.mjs";
import { equals3 } from "./module-0055.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0124.mjs";
import { IWorkspaceContextService } from "./module-0060.mjs";
import { DeferredPromise } from "./module-0034.mjs";
import { isWindows } from "./module-0016.mjs";
import { Extensions2 } from "./module-0135.mjs";
import { IRemoteAgentService } from "./module-0207.mjs";
import { IUserDataProfilesService } from "./module-0140.mjs";


// src/vs/workbench/common/configuration.ts
var applicationConfigurationNodeBase = Object.freeze({
  "id": "application",
  "order": 100,
  "title": localize(7279, null),
  "type": "object"
});

var workbenchConfigurationNodeBase = Object.freeze({
  "id": "workbench",
  "order": 7,
  "title": localize(7287, null),
  "type": "object"
});

var securityConfigurationNodeBase = Object.freeze({
  "id": "security",
  "scope": 1 /* APPLICATION */,
  "title": localize(7285, null),
  "type": "object",
  "order": 7
});

var problemsConfigurationNodeBase = Object.freeze({
  "id": "problems",
  "title": localize(7281, null),
  "type": "object",
  "order": 101
});

var windowConfigurationNodeBase = Object.freeze({
  "id": "window",
  "order": 8,
  "title": localize(7286, null),
  "type": "object"
});

var Extensions6 = {
  ConfigurationMigration: "base.contributions.configuration.migration"
};

var ConfigurationMigrationRegistry = class {
  constructor() {
    this.migrations = [];
    this._onDidRegisterConfigurationMigrations = new Emitter();
    this.onDidRegisterConfigurationMigration = this._onDidRegisterConfigurationMigrations.event;
  }
  registerConfigurationMigrations(configurationMigrations) {
    this.migrations.push(...configurationMigrations);
  }
};

var configurationMigrationRegistry = new ConfigurationMigrationRegistry();

Registry.add(Extensions6.ConfigurationMigration, configurationMigrationRegistry);

var ConfigurationMigrationWorkbenchContribution = class extends Disposable {
  constructor(configurationService, workspaceService) {
    super();
    this.configurationService = configurationService;
    this.workspaceService = workspaceService;
    this._register(this.workspaceService.onDidChangeWorkspaceFolders(async (e) => {
      for (const folder of e.added) {
        await this.migrateConfigurationsForFolder(folder, configurationMigrationRegistry.migrations);
      }
    }));
    this.migrateConfigurations(configurationMigrationRegistry.migrations);
    this._register(configurationMigrationRegistry.onDidRegisterConfigurationMigration((migration) => this.migrateConfigurations(migration)));
  }
  static {
    this.ID = "workbench.contrib.configurationMigration";
  }
  async migrateConfigurations(migrations) {
    await this.migrateConfigurationsForFolder(void 0, migrations);
    for (const folder of this.workspaceService.getWorkspace().folders) {
      await this.migrateConfigurationsForFolder(folder, migrations);
    }
  }
  async migrateConfigurationsForFolder(folder, migrations) {
    await Promise.all([migrations.map((migration) => this.migrateConfigurationsForFolderAndOverride(migration, folder?.uri))]);
  }
  async migrateConfigurationsForFolderAndOverride(migration, resource) {
    const inspectData = this.configurationService.inspect(migration.key, { resource });
    const targetPairs = this.workspaceService.getWorkbenchState() === 3 /* WORKSPACE */ ? [
      ["user", 2 /* USER */],
      ["userLocal", 3 /* USER_LOCAL */],
      ["userRemote", 4 /* USER_REMOTE */],
      ["workspace", 5 /* WORKSPACE */],
      ["workspaceFolder", 6 /* WORKSPACE_FOLDER */]
    ] : [
      ["user", 2 /* USER */],
      ["userLocal", 3 /* USER_LOCAL */],
      ["userRemote", 4 /* USER_REMOTE */],
      ["workspace", 5 /* WORKSPACE */]
    ];
    if (migration.includeApplication) {
      targetPairs.unshift(["application", 1 /* APPLICATION */]);
    }
    for (const [dataKey, target] of targetPairs) {
      const inspectValue = inspectData[dataKey];
      if (!inspectValue) {
        continue;
      }
      const migrationValues = [];
      if (inspectValue.value !== void 0) {
        const keyValuePairs = await this.runMigration(migration, dataKey, inspectValue.value, resource, void 0);
        for (const keyValuePair of keyValuePairs ?? []) {
          migrationValues.push([keyValuePair, []]);
        }
      }
      for (const { identifiers: identifiers2, value } of inspectValue.overrides ?? []) {
        if (value !== void 0) {
          const keyValuePairs = await this.runMigration(migration, dataKey, value, resource, identifiers2);
          for (const keyValuePair of keyValuePairs ?? []) {
            migrationValues.push([keyValuePair, identifiers2]);
          }
        }
      }
      if (migrationValues.length) {
        await Promise.allSettled(migrationValues.map(async ([[key, value], overrideIdentifiers]) => this.configurationService.updateValue(key, value.value, { resource, overrideIdentifiers }, target)));
      }
    }
  }
  async runMigration(migration, dataKey, value, resource, overrideIdentifiers) {
    const valueAccessor = (key) => {
      const inspectData = this.configurationService.inspect(key, { resource });
      const inspectValue = inspectData[dataKey];
      if (!inspectValue) {
        return void 0;
      }
      if (!overrideIdentifiers) {
        return inspectValue.value;
      }
      return inspectValue.overrides?.find(({ identifiers: identifiers2 }) => equals3(identifiers2, overrideIdentifiers))?.value;
    };
    const result = await migration.migrateFn(value, valueAccessor);
    return Array.isArray(result) ? result : [[migration.key, result]];
  }
};

ConfigurationMigrationWorkbenchContribution = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IWorkspaceContextService)
], ConfigurationMigrationWorkbenchContribution);

var DynamicWorkbenchSecurityConfiguration = class extends Disposable {
  constructor(remoteAgentService) {
    super();
    this.remoteAgentService = remoteAgentService;
    this._ready = new DeferredPromise();
    this.ready = this._ready.p;
    this.create();
  }
  static {
    this.ID = "workbench.contrib.dynamicWorkbenchSecurityConfiguration";
  }
  async create() {
    try {
      await this.doCreate();
    } finally {
      this._ready.complete();
    }
  }
  async doCreate() {
    if (!isWindows) {
      const remoteEnvironment = await this.remoteAgentService.getEnvironment();
      if (remoteEnvironment?.os !== 1 /* Windows */) {
        return;
      }
    }
    const registry = Registry.as(Extensions2.Configuration);
    registry.registerConfiguration({
      ...securityConfigurationNodeBase,
      "properties": {
        "security.allowedUNCHosts": {
          "type": "array",
          "items": {
            "type": "string",
            "pattern": "^[^\\\\]+$",
            "patternErrorMessage": localize(7283, null)
          },
          "default": [],
          "markdownDescription": localize(7282, null),
          "scope": 3 /* APPLICATION_MACHINE */
        },
        "security.restrictUNCAccess": {
          "type": "boolean",
          "default": true,
          "markdownDescription": localize(7284, null),
          "scope": 3 /* APPLICATION_MACHINE */
        }
      }
    });
  }
};

DynamicWorkbenchSecurityConfiguration = __decorateClass([
  __decorateParam(0, IRemoteAgentService)
], DynamicWorkbenchSecurityConfiguration);

var CONFIG_NEW_WINDOW_PROFILE = "window.newWindowProfile";

var DynamicWindowConfiguration = class extends Disposable {
  constructor(userDataProfilesService, configurationService) {
    super();
    this.userDataProfilesService = userDataProfilesService;
    this.configurationService = configurationService;
    this.registerNewWindowProfileConfiguration();
    this._register(this.userDataProfilesService.onDidChangeProfiles((e) => this.registerNewWindowProfileConfiguration()));
    this.setNewWindowProfile();
    this.checkAndResetNewWindowProfileConfig();
    this._register(configurationService.onDidChangeConfiguration((e) => {
      if (e.source !== 7 /* DEFAULT */ && e.affectsConfiguration(CONFIG_NEW_WINDOW_PROFILE)) {
        this.setNewWindowProfile();
      }
    }));
    this._register(this.userDataProfilesService.onDidChangeProfiles(() => this.checkAndResetNewWindowProfileConfig()));
  }
  static {
    this.ID = "workbench.contrib.dynamicWindowConfiguration";
  }
  registerNewWindowProfileConfiguration() {
    const registry = Registry.as(Extensions2.Configuration);
    const configurationNode = {
      ...windowConfigurationNodeBase,
      "properties": {
        [CONFIG_NEW_WINDOW_PROFILE]: {
          "type": ["string", "null"],
          "default": null,
          "enum": [...this.userDataProfilesService.profiles.map((profile) => profile.name), null],
          "enumItemLabels": [...this.userDataProfilesService.profiles.map(() => ""), localize(7278, null)],
          "description": localize(7280, null),
          "scope": 1 /* APPLICATION */
        }
      }
    };
    if (this.configurationNode) {
      registry.updateConfigurations({ add: [configurationNode], remove: [this.configurationNode] });
    } else {
      registry.registerConfiguration(configurationNode);
    }
    this.configurationNode = configurationNode;
  }
  setNewWindowProfile() {
    const newWindowProfileName = this.configurationService.getValue(CONFIG_NEW_WINDOW_PROFILE);
    this.newWindowProfile = newWindowProfileName ? this.userDataProfilesService.profiles.find((profile) => profile.name === newWindowProfileName) : void 0;
  }
  checkAndResetNewWindowProfileConfig() {
    const newWindowProfileName = this.configurationService.getValue(CONFIG_NEW_WINDOW_PROFILE);
    if (!newWindowProfileName) {
      return;
    }
    const profile = this.newWindowProfile ? this.userDataProfilesService.profiles.find((profile2) => profile2.id === this.newWindowProfile.id) : void 0;
    if (newWindowProfileName === profile?.name) {
      return;
    }
    this.configurationService.updateValue(CONFIG_NEW_WINDOW_PROFILE, profile?.name);
  }
};

DynamicWindowConfiguration = __decorateClass([
  __decorateParam(0, IUserDataProfilesService),
  __decorateParam(1, IConfigurationService)
], DynamicWindowConfiguration);
export { applicationConfigurationNodeBase, workbenchConfigurationNodeBase, securityConfigurationNodeBase, problemsConfigurationNodeBase, windowConfigurationNodeBase, Extensions6, ConfigurationMigrationRegistry, configurationMigrationRegistry, ConfigurationMigrationWorkbenchContribution, DynamicWorkbenchSecurityConfiguration, CONFIG_NEW_WINDOW_PROFILE, DynamicWindowConfiguration };
