// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/common/debugger.ts
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { isObject } from "./module-0010.mjs";
import { isDebuggerMainContribution } from "./module-1059.mjs";
import { localize } from "./module-0001.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { cleanRemoteAuthority } from "./module-0885.mjs";
import { IDebugService, debuggerDisabledMessage } from "./module-1057.mjs";
import { applyDeprecatedVariableMessage } from "./module-3184.mjs";
import { filter } from "./module-0098.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITextResourcePropertiesService } from "./module-0204.mjs";
import { IConfigurationResolverService } from "./module-1405.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IProductService } from "./module-0873.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/debug/common/debugger.ts
var Debugger = class {
  constructor(adapterManager, dbgContribution, extensionDescription, configurationService, resourcePropertiesService, configurationResolverService, environmentService, debugService, contextKeyService, productService, logService) {
    this.adapterManager = adapterManager;
    this.configurationService = configurationService;
    this.resourcePropertiesService = resourcePropertiesService;
    this.configurationResolverService = configurationResolverService;
    this.environmentService = environmentService;
    this.debugService = debugService;
    this.contextKeyService = contextKeyService;
    this.productService = productService;
    this.logService = logService;
    this.mergedExtensionDescriptions = [];
    this.debuggerContribution = { type: dbgContribution.type };
    this.merge(dbgContribution, extensionDescription);
    this.debuggerWhen = typeof this.debuggerContribution.when === "string" ? ContextKeyExpr.deserialize(this.debuggerContribution.when) : void 0;
    this.debuggerHiddenWhen = typeof this.debuggerContribution.hiddenWhen === "string" ? ContextKeyExpr.deserialize(this.debuggerContribution.hiddenWhen) : void 0;
  }
  merge(otherDebuggerContribution, extensionDescription) {
    function mixin2(destination, source, overwrite, level = 0) {
      if (!isObject(destination)) {
        return source;
      }
      if (isObject(source)) {
        Object.keys(source).forEach((key3) => {
          if (key3 !== "__proto__") {
            if (isObject(destination[key3]) && isObject(source[key3])) {
              mixin2(destination[key3], source[key3], overwrite, level + 1);
            } else {
              if (key3 in destination) {
                if (overwrite) {
                  if (level === 0 && key3 === "type") {
                  } else {
                    destination[key3] = source[key3];
                  }
                }
              } else {
                destination[key3] = source[key3];
              }
            }
          }
        });
      }
      return destination;
    }
    if (this.mergedExtensionDescriptions.indexOf(extensionDescription) < 0) {
      this.mergedExtensionDescriptions.push(extensionDescription);
      mixin2(this.debuggerContribution, otherDebuggerContribution, extensionDescription.isBuiltin);
      if (isDebuggerMainContribution(otherDebuggerContribution)) {
        this.mainExtensionDescription = extensionDescription;
      }
    }
  }
  async startDebugging(configuration2, parentSessionId) {
    const parentSession = this.debugService.getModel().getSession(parentSessionId);
    return await this.debugService.startDebugging(void 0, configuration2, { parentSession }, void 0);
  }
  async createDebugAdapter(session) {
    await this.adapterManager.activateDebuggers("onDebugAdapterProtocolTracker", this.type);
    const da = this.adapterManager.createDebugAdapter(session);
    if (da) {
      return Promise.resolve(da);
    }
    throw new Error(localize(14798, null, this.type));
  }
  async substituteVariables(folder, config) {
    const substitutedConfig = await this.adapterManager.substituteVariables(this.type, folder, config);
    return await this.configurationResolverService.resolveWithInteractionReplace(folder, substitutedConfig, "launch", this.variables, substitutedConfig.__configurationTarget);
  }
  runInTerminal(args2, sessionId) {
    return this.adapterManager.runInTerminal(this.type, args2, sessionId);
  }
  get label() {
    return this.debuggerContribution.label || this.debuggerContribution.type;
  }
  get type() {
    return this.debuggerContribution.type;
  }
  get variables() {
    return this.debuggerContribution.variables;
  }
  get configurationSnippets() {
    return this.debuggerContribution.configurationSnippets;
  }
  get languages() {
    return this.debuggerContribution.languages;
  }
  get when() {
    return this.debuggerWhen;
  }
  get hiddenWhen() {
    return this.debuggerHiddenWhen;
  }
  get enabled() {
    return !this.debuggerWhen || this.contextKeyService.contextMatchesRules(this.debuggerWhen);
  }
  get isHiddenFromDropdown() {
    if (!this.debuggerHiddenWhen) {
      return false;
    }
    return this.contextKeyService.contextMatchesRules(this.debuggerHiddenWhen);
  }
  get strings() {
    return this.debuggerContribution.strings ?? this.debuggerContribution.uiMessages;
  }
  interestedInLanguage(languageId) {
    return !!(this.languages && this.languages.indexOf(languageId) >= 0);
  }
  hasInitialConfiguration() {
    return !!this.debuggerContribution.initialConfigurations;
  }
  hasDynamicConfigurationProviders() {
    return this.debugService.getConfigurationManager().hasDebugConfigurationProvider(this.type, 2 /* Dynamic */);
  }
  hasConfigurationProvider() {
    return this.debugService.getConfigurationManager().hasDebugConfigurationProvider(this.type);
  }
  getInitialConfigurationContent(initialConfigs) {
    let initialConfigurations = this.debuggerContribution.initialConfigurations || [];
    if (initialConfigs) {
      initialConfigurations = initialConfigurations.concat(initialConfigs);
    }
    const eol = this.resourcePropertiesService.getEOL(URI.from({ scheme: Schemas.untitled, path: "1" })) === "\r\n" ? "\r\n" : "\n";
    const configs = JSON.stringify(initialConfigurations, null, "	").split("\n").map((line) => "	" + line).join(eol).trim();
    const comment1 = localize(14805, null);
    const comment2 = localize(14806, null);
    const comment3 = localize(14807, null, "https://go.microsoft.com/fwlink/?linkid=830387");
    let content2 = [
      "{",
      `	// ${comment1}`,
      `	// ${comment2}`,
      `	// ${comment3}`,
      `	"version": "0.2.0",`,
      `	"configurations": ${configs}`,
      "}"
    ].join(eol);
    const editorConfig = this.configurationService.getValue();
    if (editorConfig.editor && editorConfig.editor.insertSpaces) {
      content2 = content2.replace(new RegExp("	", "g"), " ".repeat(editorConfig.editor.tabSize));
    }
    return Promise.resolve(content2);
  }
  getMainExtensionDescriptor() {
    return this.mainExtensionDescription || this.mergedExtensionDescriptions[0];
  }
  getCustomTelemetryEndpoint() {
    const aiKey = this.debuggerContribution.aiKey;
    if (!aiKey) {
      return void 0;
    }
    const sendErrorTelemtry = cleanRemoteAuthority(this.environmentService.remoteAuthority, this.productService) !== "other";
    return {
      id: `${this.getMainExtensionDescriptor().publisher}.${this.type}`,
      aiKey,
      sendErrorTelemetry: sendErrorTelemtry
    };
  }
  getSchemaAttributes(definitions3) {
    if (!this.debuggerContribution.configurationAttributes) {
      return null;
    }
    return Object.entries(this.debuggerContribution.configurationAttributes).map(([request2, attributes]) => {
      const definitionId = `${this.type}:${request2}`;
      const platformSpecificDefinitionId = `${this.type}:${request2}:platform`;
      const defaultRequired = ["name", "type", "request"];
      attributes.required = attributes.required && attributes.required.length ? defaultRequired.concat(attributes.required) : defaultRequired;
      attributes.additionalProperties = false;
      attributes.type = "object";
      if (!attributes.properties) {
        attributes.properties = {};
      }
      const properties = attributes.properties;
      properties["type"] = {
        enum: [this.type],
        enumDescriptions: [this.label],
        description: localize(14802, null),
        pattern: "^(?!node2)",
        deprecationMessage: this.debuggerContribution.deprecated || (this.enabled ? void 0 : debuggerDisabledMessage(this.type)),
        doNotSuggest: !!this.debuggerContribution.deprecated,
        errorMessage: localize(14803, null),
        patternErrorMessage: localize(14808, null)
      };
      properties["request"] = {
        enum: [request2],
        description: localize(14801, null)
      };
      for (const prop in definitions3["common"].properties) {
        properties[prop] = {
          $ref: `#/definitions/common/properties/${prop}`
        };
      }
      const malformedPropertyNames = [];
      Object.keys(properties).forEach((name) => {
        const property = properties[name];
        if (isObject(property)) {
          applyDeprecatedVariableMessage(property);
        } else {
          malformedPropertyNames.push(name);
        }
      });
      if (malformedPropertyNames.length) {
        this.logService.warn(`Ignoring malformed debug configuration schema properties for type '${this.type}': ${malformedPropertyNames.join(", ")}`);
      }
      definitions3[definitionId] = { ...attributes };
      definitions3[platformSpecificDefinitionId] = {
        type: "object",
        additionalProperties: false,
        properties: filter(properties, (key3) => key3 !== "type" && key3 !== "request" && key3 !== "name")
      };
      const attributesCopy = { ...attributes };
      attributesCopy.properties = {
        ...properties,
        ...{
          windows: {
            $ref: `#/definitions/${platformSpecificDefinitionId}`,
            description: localize(14804, null)
          },
          osx: {
            $ref: `#/definitions/${platformSpecificDefinitionId}`,
            description: localize(14800, null)
          },
          linux: {
            $ref: `#/definitions/${platformSpecificDefinitionId}`,
            description: localize(14799, null)
          }
        }
      };
      return attributesCopy;
    });
  }
};

Debugger = __decorateClass([
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ITextResourcePropertiesService),
  __decorateParam(5, IConfigurationResolverService),
  __decorateParam(6, IWorkbenchEnvironmentService),
  __decorateParam(7, IDebugService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IProductService),
  __decorateParam(10, ILogService)
], Debugger);
export { Debugger };
