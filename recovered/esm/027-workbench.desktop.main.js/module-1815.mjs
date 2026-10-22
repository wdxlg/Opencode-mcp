// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/services/textResourceConfigurationService.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { Position } from "./module-0079.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IModelService } from "./module-0080.mjs";
import { ILanguageService } from "./module-0133.mjs";


// src/vs/editor/common/services/textResourceConfigurationService.ts
var TextResourceConfigurationService = class extends Disposable {
  constructor(configurationService, modelService, languageService) {
    super();
    this.configurationService = configurationService;
    this.modelService = modelService;
    this.languageService = languageService;
    this._onDidChangeConfiguration = this._register(new Emitter());
    this.onDidChangeConfiguration = this._onDidChangeConfiguration.event;
    this._register(this.configurationService.onDidChangeConfiguration((e) => this._onDidChangeConfiguration.fire(this.toResourceConfigurationChangeEvent(e))));
  }
  getValue(resource, arg2, arg3) {
    if (typeof arg3 === "string") {
      return this._getValue(resource, Position.isIPosition(arg2) ? arg2 : null, arg3);
    }
    return this._getValue(resource, null, typeof arg2 === "string" ? arg2 : void 0);
  }
  updateValue(resource, key3, value2, configurationTarget) {
    const language2 = resource ? this.getLanguage(resource, null) : null;
    const configurationValue = this.configurationService.inspect(key3, { resource, overrideIdentifier: language2 });
    if (configurationTarget === void 0) {
      configurationTarget = this.deriveConfigurationTarget(configurationValue, language2);
    }
    const overrideIdentifier = language2 && configurationValue.overrideIdentifiers?.includes(language2) ? language2 : void 0;
    return this.configurationService.updateValue(key3, value2, { resource, overrideIdentifier }, configurationTarget);
  }
  deriveConfigurationTarget(configurationValue, language2) {
    if (language2) {
      if (configurationValue.memory?.override !== void 0) {
        return 8 /* MEMORY */;
      }
      if (configurationValue.workspaceFolder?.override !== void 0) {
        return 6 /* WORKSPACE_FOLDER */;
      }
      if (configurationValue.workspace?.override !== void 0) {
        return 5 /* WORKSPACE */;
      }
      if (configurationValue.userRemote?.override !== void 0) {
        return 4 /* USER_REMOTE */;
      }
      if (configurationValue.userLocal?.override !== void 0) {
        return 3 /* USER_LOCAL */;
      }
    }
    if (configurationValue.memory?.value !== void 0) {
      return 8 /* MEMORY */;
    }
    if (configurationValue.workspaceFolder?.value !== void 0) {
      return 6 /* WORKSPACE_FOLDER */;
    }
    if (configurationValue.workspace?.value !== void 0) {
      return 5 /* WORKSPACE */;
    }
    if (configurationValue.userRemote?.value !== void 0) {
      return 4 /* USER_REMOTE */;
    }
    return 3 /* USER_LOCAL */;
  }
  _getValue(resource, position2, section) {
    const language2 = resource ? this.getLanguage(resource, position2) : void 0;
    if (typeof section === "undefined") {
      return this.configurationService.getValue({ resource, overrideIdentifier: language2 });
    }
    return this.configurationService.getValue(section, { resource, overrideIdentifier: language2 });
  }
  inspect(resource, position2, section) {
    const language2 = resource ? this.getLanguage(resource, position2) : void 0;
    return this.configurationService.inspect(section, { resource, overrideIdentifier: language2 });
  }
  getLanguage(resource, position2) {
    const model = this.modelService.getModel(resource);
    if (model) {
      return position2 ? model.getLanguageIdAtPosition(position2.lineNumber, position2.column) : model.getLanguageId();
    }
    return this.languageService.guessLanguageIdByFilepathOrFirstLine(resource);
  }
  toResourceConfigurationChangeEvent(configurationChangeEvent) {
    return {
      affectedKeys: configurationChangeEvent.affectedKeys,
      affectsConfiguration: (resource, configuration2) => {
        const overrideIdentifier = resource ? this.getLanguage(resource, null) : void 0;
        if (configurationChangeEvent.affectsConfiguration(configuration2, { resource, overrideIdentifier })) {
          return true;
        }
        if (overrideIdentifier) {
          return configurationChangeEvent.affectedKeys.has(`[${overrideIdentifier}]`);
        }
        return false;
      }
    };
  }
};

TextResourceConfigurationService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IModelService),
  __decorateParam(2, ILanguageService)
], TextResourceConfigurationService);
export { TextResourceConfigurationService };
