// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadConfiguration.ts
import { ExtHostContext, MainContext } from "./module-0922.mjs";
import { Extensions4, getScopes } from "./module-0140.mjs";
import { URI } from "./module-0032.mjs";
import { Registry } from "./module-0090.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0920.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IEnvironmentService } from "./module-0508.mjs";


// src/vs/workbench/api/browser/mainThreadConfiguration.ts
var MainThreadConfiguration = class {
  constructor(extHostContext, _workspaceContextService, configurationService, _environmentService) {
    this._workspaceContextService = _workspaceContextService;
    this.configurationService = configurationService;
    this._environmentService = _environmentService;
    const proxy = extHostContext.getProxy(ExtHostContext.ExtHostConfiguration);
    proxy.$initializeConfiguration(this._getConfigurationData());
    this._configurationListener = configurationService.onDidChangeConfiguration((e4) => {
      proxy.$acceptConfigurationChanged(this._getConfigurationData(), e4.change);
    });
  }
  _getConfigurationData() {
    const configurationData = { ...this.configurationService.getConfigurationData(), configurationScopes: [] };
    if (!this._environmentService.isBuilt || this._environmentService.isExtensionDevelopment) {
      configurationData.configurationScopes = getScopes();
    }
    return configurationData;
  }
  dispose() {
    this._configurationListener.dispose();
  }
  $updateConfigurationOption(target, key3, value2, overrides, scopeToLanguage) {
    overrides = { resource: overrides?.resource ? URI.revive(overrides.resource) : void 0, overrideIdentifier: overrides?.overrideIdentifier };
    return this.writeConfiguration(target, key3, value2, overrides, scopeToLanguage);
  }
  $removeConfigurationOption(target, key3, overrides, scopeToLanguage) {
    overrides = { resource: overrides?.resource ? URI.revive(overrides.resource) : void 0, overrideIdentifier: overrides?.overrideIdentifier };
    return this.writeConfiguration(target, key3, void 0, overrides, scopeToLanguage);
  }
  writeConfiguration(target, key3, value2, overrides, scopeToLanguage) {
    target = target !== null && target !== void 0 ? target : this.deriveConfigurationTarget(key3, overrides);
    const configurationValue = this.configurationService.inspect(key3, overrides);
    switch (target) {
      case 8 /* MEMORY */:
        return this._updateValue(key3, value2, target, configurationValue?.memory?.override, overrides, scopeToLanguage);
      case 6 /* WORKSPACE_FOLDER */:
        return this._updateValue(key3, value2, target, configurationValue?.workspaceFolder?.override, overrides, scopeToLanguage);
      case 5 /* WORKSPACE */:
        return this._updateValue(key3, value2, target, configurationValue?.workspace?.override, overrides, scopeToLanguage);
      case 4 /* USER_REMOTE */:
        return this._updateValue(key3, value2, target, configurationValue?.userRemote?.override, overrides, scopeToLanguage);
      default:
        return this._updateValue(key3, value2, target, configurationValue?.userLocal?.override, overrides, scopeToLanguage);
    }
  }
  _updateValue(key3, value2, configurationTarget, overriddenValue, overrides, scopeToLanguage) {
    overrides = scopeToLanguage === true ? overrides : scopeToLanguage === false ? { resource: overrides.resource } : overrides.overrideIdentifier && overriddenValue !== void 0 ? overrides : { resource: overrides.resource };
    return this.configurationService.updateValue(key3, value2, overrides, configurationTarget, { donotNotifyError: true });
  }
  deriveConfigurationTarget(key3, overrides) {
    if (overrides.resource && this._workspaceContextService.getWorkbenchState() === 3 /* WORKSPACE */) {
      const configurationProperties = Registry.as(Extensions4.Configuration).getConfigurationProperties();
      if (configurationProperties[key3] && (configurationProperties[key3].scope === 5 /* RESOURCE */ || configurationProperties[key3].scope === 6 /* LANGUAGE_OVERRIDABLE */)) {
        return 6 /* WORKSPACE_FOLDER */;
      }
    }
    return 5 /* WORKSPACE */;
  }
};

MainThreadConfiguration = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadConfiguration),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IEnvironmentService)
], MainThreadConfiguration);
export { MainThreadConfiguration };
