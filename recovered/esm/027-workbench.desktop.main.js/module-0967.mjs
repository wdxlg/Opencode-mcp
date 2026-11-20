// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/languageModels.ts
import { ExtensionIdentifier } from "./module-0688.mjs";
import { localize } from "./module-0001.mjs";
import { createDecorator } from "./module-0077.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { ExtensionsRegistry } from "./module-0876.mjs";
import { SubmenuAction } from "./module-0082.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { SequencerByKey, timeout } from "./module-0036.mjs";
import { observableValue } from "./module-0048.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { Iterable } from "./module-0011.mjs";
import { format2, isFalsyOrWhitespace } from "./module-0030.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { CancellationError, getErrorMessage, isCancellationError } from "./module-0004.mjs";
import { severity_default } from "./module-0266.mjs";
import { equals4 } from "./module-0098.mjs";
import { isObject, isString } from "./module-0010.mjs";
import { hash } from "./module-0039.mjs";
import { generateUuid } from "./module-0190.mjs";
import { IRequestService, asJson } from "./module-0946.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { ILogService } from "./module-0095.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ILanguageModelsConfigurationService } from "./module-0966.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ISecretStorageService } from "./module-0948.mjs";
import { IProductService } from "./module-0873.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ICommandService } from "./module-0087.mjs";


// src/vs/workbench/contrib/chat/common/languageModels.ts
var COPILOT_VENDOR_ID = "copilot";

function isLanguageModelVendorAbsenceConclusive(vendor, hasLiveModels, hasResolved) {
  return hasLiveModels || hasResolved && vendor !== COPILOT_VENDOR_ID;
}

var BUILT_IN_BYOK_VENDOR_IDS = /* @__PURE__ */ new Set([
  "openai",
  "anthropic",
  "gemini",
  "ollama",
  "openrouter",
  "azure",
  "xai",
  "customoai",
  "customendpoint"
]);

var THIRD_PARTY_PROVIDER_TELEMETRY_NAME = "3p-extension";

var BUILT_IN_BYOK_EXTENSION_IDS = [
  "github.copilot-chat",
  "github.copilot"
];

function getByokProviderTelemetryName(vendor, extension) {
  if (!vendor || vendor === COPILOT_VENDOR_ID) {
    return void 0;
  }
  if (BUILT_IN_BYOK_VENDOR_IDS.has(vendor) && extension && BUILT_IN_BYOK_EXTENSION_IDS.some((id2) => ExtensionIdentifier.equals(extension, id2))) {
    return vendor;
  }
  return THIRD_PARTY_PROVIDER_TELEMETRY_NAME;
}

var ILanguageModelChatMetadata;

((ILanguageModelChatMetadata4) => {
  function suitableForAgentMode(metadata) {
    const supportsToolsAgent = typeof metadata.capabilities?.agentMode === "undefined" || metadata.capabilities.agentMode;
    return supportsToolsAgent && !!metadata.capabilities?.toolCalling;
  }
  ILanguageModelChatMetadata4.suitableForAgentMode = suitableForAgentMode;
  function asQualifiedName(metadata) {
    return `${metadata.name} (${metadata.vendor})`;
  }
  ILanguageModelChatMetadata4.asQualifiedName = asQualifiedName;
  function matchesQualifiedName(name, metadata) {
    if (metadata.vendor === COPILOT_VENDOR_ID && name === metadata.name) {
      return true;
    }
    return name === asQualifiedName(metadata);
  }
  ILanguageModelChatMetadata4.matchesQualifiedName = matchesQualifiedName;
  function hasPromoDiscount(metadata) {
    return !!metadata.promo && metadata.promo.discountPercent > 0;
  }
  ILanguageModelChatMetadata4.hasPromoDiscount = hasPromoDiscount;
  function hasPromoMessage(metadata) {
    return !!metadata.promo && metadata.promo.discountPercent >= 0 && !!metadata.promo.message;
  }
  ILanguageModelChatMetadata4.hasPromoMessage = hasPromoMessage;
  function hasPromoBanner(metadata) {
    return hasPromoMessage(metadata) && metadata.promo.showBanner !== false;
  }
  ILanguageModelChatMetadata4.hasPromoBanner = hasPromoBanner;
  function getPromoEndsAtLabel(endsAt) {
    if (!endsAt) {
      return void 0;
    }
    const endsAtDate = new Date(endsAt);
    if (isNaN(endsAtDate.getTime())) {
      return void 0;
    }
    const formattedDate = endsAtDate.toLocaleDateString(void 0, { year: "numeric", month: "long", day: "numeric" });
    return localize(12956, null, formattedDate);
  }
  ILanguageModelChatMetadata4.getPromoEndsAtLabel = getPromoEndsAtLabel;
  ILanguageModelChatMetadata4.autoModelSelectionDocsUrl = "https://docs.github.com/en/copilot/concepts/models/auto-model-selection";
  function getAutoModelDescription(discountPercent) {
    const base = localize(12950, null);
    const learnMore = localize(12952, null, ILanguageModelChatMetadata4.autoModelSelectionDocsUrl);
    if (typeof discountPercent === "number" && discountPercent > 0) {
      const discount = localize(12951, null, discountPercent);
      return `${base} ${discount} ${learnMore}`;
    }
    return `${base} ${learnMore}`;
  }
  ILanguageModelChatMetadata4.getAutoModelDescription = getAutoModelDescription;
  function getAgentHostByokManageModelsIdentifier2(metadata) {
    return metadata.byokModelIdentifier;
  }
  ILanguageModelChatMetadata4.getAgentHostByokManageModelsIdentifier = getAgentHostByokManageModelsIdentifier2;
})(ILanguageModelChatMetadata || (ILanguageModelChatMetadata = {}));

async function getTextResponseFromStream(response) {
  let responseText = "";
  const streaming = (async () => {
    if (!response?.stream) {
      return;
    }
    for await (const part of response.stream) {
      if (Array.isArray(part)) {
        for (const item of part) {
          if (item.type === "text") {
            responseText += item.value;
          }
        }
      } else if (part.type === "text") {
        responseText += part.value;
      }
    }
  })();
  try {
    await Promise.all([response.result, streaming]);
    return responseText;
  } catch (err) {
    if (responseText) {
      return responseText;
    }
    throw err;
  }
}

function isILanguageModelChatSelector(value2) {
  if (typeof value2 !== "object" || value2 === null) {
    return false;
  }
  const obj = value2;
  return (obj.name === void 0 || typeof obj.name === "string") && (obj.id === void 0 || typeof obj.id === "string") && (obj.vendor === void 0 || typeof obj.vendor === "string") && (obj.version === void 0 || typeof obj.version === "string") && (obj.family === void 0 || typeof obj.family === "string") && (obj.tokens === void 0 || typeof obj.tokens === "number") && (obj.extension === void 0 || typeof obj.extension === "object");
}

var ILanguageModelsService = createDecorator("ILanguageModelsService");

function getLanguageModelProviderDisplayName(languageModelsService, vendor) {
  if (vendor === "copilotcli") {
    return localize(12955, null);
  }
  const descriptor = languageModelsService.getVendors().find((candidate) => candidate.vendor === vendor);
  return descriptor?.displayName ?? vendor.charAt(0).toUpperCase() + vendor.slice(1);
}

function getLanguageModelDisplayNameWithProvider(model, languageModelsService) {
  const { metadata } = model;
  if (!metadata.isBYOK && !metadata.byokModelIdentifier) {
    return metadata.name;
  }
  const originalIdentifier = metadata.byokModelIdentifier ?? model.identifier;
  const originalMetadata = metadata.byokModelIdentifier ? languageModelsService.lookupLanguageModel(originalIdentifier) : metadata;
  const providerVendor = originalMetadata?.vendor ?? metadata.modelGroup?.id ?? metadata.vendor;
  const providerName = getLanguageModelProviderDisplayName(languageModelsService, providerVendor);
  const identifierSuffix = originalMetadata?.id;
  const modelName = identifierSuffix && metadata.name.endsWith(` (${identifierSuffix})`) ? metadata.name.slice(0, -identifierSuffix.length - 3) : metadata.name;
  const groupName = languageModelsService.getLanguageModelGroups(providerVendor).find((group2) => group2.modelIdentifiers.includes(originalIdentifier))?.group?.name;
  return groupName && groupName !== providerName ? localize(12954, null, providerName, groupName, modelName) : localize(12953, null, providerName, modelName);
}

var languageModelChatProviderType = {
  type: "object",
  required: ["vendor", "displayName"],
  properties: {
    vendor: {
      type: "string",
      description: localize(12977, null)
    },
    displayName: {
      type: "string",
      description: localize(12973, null)
    },
    configuration: {
      type: "object",
      description: localize(12969, null),
      anyOf: [
        {
          $ref: "http://json-schema.org/draft-07/schema#"
        },
        {
          properties: {
            properties: {
              type: "object",
              additionalProperties: {
                $ref: "http://json-schema.org/draft-07/schema#",
                properties: {
                  secret: {
                    type: "boolean",
                    description: localize(12970, null)
                  }
                }
              }
            },
            additionalProperties: {
              $ref: "http://json-schema.org/draft-07/schema#",
              properties: {
                secret: {
                  type: "boolean",
                  description: localize(12970, null)
                }
              }
            }
          }
        }
      ]
    },
    managementCommand: {
      type: "string",
      description: localize(12975, null),
      deprecated: true,
      deprecationMessage: localize(12976, null)
    },
    deprecation: {
      type: "object",
      description: localize(12971, null),
      properties: {
        link: {
          type: "string",
          description: localize(12972, null)
        }
      }
    },
    when: {
      type: "string",
      description: localize(12979, null)
    }
  }
};

function resolveProviderDeprecationLink(link2, urlProtocol) {
  const uri5 = URI.parse(link2);
  return uri5.scheme === Schemas.vscode && urlProtocol ? uri5.with({ scheme: urlProtocol }) : uri5;
}

var languageModelChatProviderExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
  extensionPoint: "languageModelChatProviders",
  jsonSchema: {
    description: localize(12968, null),
    oneOf: [
      languageModelChatProviderType,
      {
        type: "array",
        items: languageModelChatProviderType
      }
    ]
  },
  activationEventsGenerator: function* (contribs) {
    for (const contrib of contribs) {
      yield `onLanguageModelChatProvider:${contrib.vendor}`;
    }
  }
});

var CHAT_MODEL_RECENTLY_USED_STORAGE_KEY = "chatModelRecentlyUsed";

var CHAT_MODEL_PINNED_STORAGE_KEY = "chatModelPinned";

var CHAT_MODEL_VISIBILITY_STORAGE_KEY = "chatModelVisibility";

var AUTO_MODEL_IDENTIFIER = "copilot/auto";

var AUTO_RAW_MODEL_ID = "auto";

function isAutoLanguageModel(model) {
  return model?.metadata.id === AUTO_RAW_MODEL_ID || model?.identifier === AUTO_MODEL_IDENTIFIER;
}

function canHideModel(identifier2, metadata) {
  if (identifier2 === AUTO_MODEL_IDENTIFIER) {
    return false;
  }
  if (!metadata) {
    return true;
  }
  if (metadata.vendor === COPILOT_VENDOR_ID && metadata.id === AUTO_RAW_MODEL_ID) {
    return false;
  }
  return ILanguageModelChatMetadata.getAgentHostByokManageModelsIdentifier(metadata) === void 0;
}

var CHAT_PARTICIPANT_NAME_REGISTRY_STORAGE_KEY = "chat.participantNameRegistry";

var CHAT_MODELS_CONTROL_STORAGE_KEY = "chat.modelsControl";

function createModelConfigurationActions(schema10, currentConfig, setValue) {
  if (!schema10?.properties) {
    return [];
  }
  const actions = [];
  for (const [key3, propSchema] of Object.entries(schema10.properties)) {
    if (!propSchema.enum || !Array.isArray(propSchema.enum) || propSchema.enum.length < 1) {
      continue;
    }
    const currentValue = currentConfig[key3] ?? propSchema.default;
    const label3 = (typeof propSchema.title === "string" ? propSchema.title : void 0) ?? key3.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (s) => s.toUpperCase());
    const defaultValue = propSchema.default;
    const enumItemLabels = propSchema.enumItemLabels;
    const enumDescriptions = propSchema.enumDescriptions;
    const enumActions = propSchema.enum.map((value2, index2) => {
      const itemLabel = enumItemLabels?.[index2] ?? String(value2);
      const displayLabel = value2 === defaultValue ? localize(12963, null, itemLabel) : itemLabel;
      const tooltip = enumDescriptions?.[index2] ?? "";
      return {
        id: `configureModel.${key3}.${value2}`,
        label: displayLabel,
        class: void 0,
        enabled: true,
        tooltip,
        checked: currentValue === value2,
        run: () => setValue(key3, value2)
      };
    });
    actions.push(new SubmenuAction(`configureModel.${key3}`, label3, enumActions));
  }
  return actions;
}

var LanguageModelsService = class {
  constructor(_extensionService, _logService, _storageService, _contextKeyService, _languageModelsConfigurationService, _quickInputService, _secretStorageService, _productService, _requestService, _notificationService, _openerService, _telemetryService, _commandService) {
    this._extensionService = _extensionService;
    this._logService = _logService;
    this._storageService = _storageService;
    this._contextKeyService = _contextKeyService;
    this._languageModelsConfigurationService = _languageModelsConfigurationService;
    this._quickInputService = _quickInputService;
    this._secretStorageService = _secretStorageService;
    this._productService = _productService;
    this._requestService = _requestService;
    this._notificationService = _notificationService;
    this._openerService = _openerService;
    this._telemetryService = _telemetryService;
    this._commandService = _commandService;
    this._store = new DisposableStore();
    this._providers = /* @__PURE__ */ new Map();
    this._vendors = /* @__PURE__ */ new Map();
    /** Vendors for which a deprecation notice has already been shown this session. */
    this._deprecationNoticeShownVendors = /* @__PURE__ */ new Set();
    this._onDidChangeLanguageModelVendors = this._store.add(new Emitter());
    this.onDidChangeLanguageModelVendors = this._onDidChangeLanguageModelVendors.event;
    this._modelsGroups = /* @__PURE__ */ new Map();
    this._modelCache = /* @__PURE__ */ new Map();
    this._resolveLMSequencer = new SequencerByKey();
    this._modelConfigurations = /* @__PURE__ */ new Map();
    this._onLanguageModelChange = this._store.add(new Emitter());
    this.onDidChangeLanguageModels = this._onLanguageModelChange.event;
    this._recentlyUsedModelIds = [];
    this._pinnedModelIds = [];
    this._hiddenModelIds = /* @__PURE__ */ new Set();
    this._onDidChangeModelsControlManifest = this._store.add(new Emitter());
    this.onDidChangeModelsControlManifest = this._onDidChangeModelsControlManifest.event;
    this._onDidChangePinnedModels = this._store.add(new Emitter());
    this.onDidChangePinnedModels = this._onDidChangePinnedModels.event;
    this._onDidChangeModelVisibility = this._store.add(new Emitter());
    this.onDidChangeModelVisibility = this._onDidChangeModelVisibility.event;
    this._modelsControlManifest = { free: {}, paid: {} };
    this._chatControlDisposed = false;
    this._restrictedChatParticipants = observableValue(this, /* @__PURE__ */ Object.create(null));
    this.restrictedChatParticipants = this._restrictedChatParticipants;
    this._hasUserSelectableModels = ChatContextKeys.languageModelsAreUserSelectable.bindTo(_contextKeyService);
    this._hasNonCopilotUserSelectableModels = ChatContextKeys.nonCopilotLanguageModelsAreUserSelectable.bindTo(_contextKeyService);
    this._recentlyUsedModelIds = this._readRecentlyUsedModels();
    this._pinnedModelIds = this._readPinnedModels();
    this._readVisibility();
    this._initChatControlData();
    this._store.add(this.onDidChangeLanguageModels(() => {
      let hasUserSelectable = false;
      let hasNonCopilotUserSelectable = false;
      for (const model of this._modelCache.values()) {
        if (model.isUserSelectable === false) {
          continue;
        }
        hasUserSelectable = true;
        if (model.vendor !== COPILOT_VENDOR_ID) {
          hasNonCopilotUserSelectable = true;
          break;
        }
      }
      this._hasUserSelectableModels.set(hasUserSelectable);
      this._hasNonCopilotUserSelectableModels.set(hasNonCopilotUserSelectable);
      this._refreshModelsControlManifest();
    }));
    this._store.add(this._languageModelsConfigurationService.onDidChangeLanguageModelGroups((changedGroups) => this._onDidChangeLanguageModelGroups(changedGroups)));
    this._store.add(languageModelChatProviderExtensionPoint.setHandler((extensions, { added, removed }) => {
      const addedVendors = [];
      const removedVendors = [];
      for (const extension of added) {
        for (const item of Iterable.wrap(extension.value)) {
          if (this._vendors.has(item.vendor)) {
            extension.collector.error(localize(12978, null, item.vendor));
            continue;
          }
          if (isFalsyOrWhitespace(item.vendor)) {
            extension.collector.error(localize(12974, null));
            continue;
          }
          if (item.vendor.trim() !== item.vendor) {
            extension.collector.error(localize(12980, null));
            continue;
          }
          addedVendors.push(item);
        }
      }
      for (const extension of removed) {
        for (const item of Iterable.wrap(extension.value)) {
          removedVendors.push(item);
        }
      }
      this.deltaLanguageModelChatProviderDescriptors(addedVendors, removedVendors);
    }));
  }
  static {
    this.SECRET_KEY_PREFIX = "chat.lm.secret.";
  }
  static {
    this.SECRET_INPUT = "${input:{0}}";
  }
  deltaLanguageModelChatProviderDescriptors(added, removed) {
    const addedVendorIds = [];
    const removedVendorIds = [];
    for (const item of added) {
      if (this._vendors.has(item.vendor)) {
        this._logService.error(`The vendor '${item.vendor}' is already registered and cannot be registered twice`);
        continue;
      }
      if (isFalsyOrWhitespace(item.vendor)) {
        this._logService.error("The vendor field cannot be empty.");
        continue;
      }
      if (item.vendor.trim() !== item.vendor) {
        this._logService.error("The vendor field cannot start or end with whitespace.");
        continue;
      }
      const vendor = {
        vendor: item.vendor,
        displayName: item.displayName,
        configuration: item.configuration,
        managementCommand: item.managementCommand,
        deprecation: item.deprecation,
        when: item.when,
        isDefault: item.vendor === COPILOT_VENDOR_ID
      };
      this._vendors.set(item.vendor, vendor);
      addedVendorIds.push(item.vendor);
    }
    for (const item of removed) {
      this._vendors.delete(item.vendor);
      this._providers.delete(item.vendor);
      this._clearModelCache(item.vendor);
      this._modelsGroups.delete(item.vendor);
      removedVendorIds.push(item.vendor);
    }
    for (const [vendor, _] of this._providers) {
      if (!this._vendors.has(vendor)) {
        this._providers.delete(vendor);
      }
    }
    if (addedVendorIds.length > 0 || removedVendorIds.length > 0) {
      this._onDidChangeLanguageModelVendors.fire([...addedVendorIds, ...removedVendorIds]);
      if (removedVendorIds.length > 0) {
        for (const vendor of removedVendorIds) {
          this._onLanguageModelChange.fire(vendor);
        }
      }
    }
  }
  async _onDidChangeLanguageModelGroups(changedGroups) {
    const changedVendors = new Set(changedGroups.map((g) => g.vendor));
    await Promise.all(Array.from(changedVendors).map((vendor) => this._resolveAllLanguageModels(vendor, true)));
  }
  getVendors() {
    return Array.from(this._vendors.values()).filter((vendor) => {
      if (!vendor.when) {
        return true;
      }
      const whenClause = ContextKeyExpr.deserialize(vendor.when);
      return whenClause ? this._contextKeyService.contextMatchesRules(whenClause) : false;
    });
  }
  getLanguageModelIds() {
    return Array.from(this._modelCache.keys());
  }
  lookupLanguageModel(modelIdentifier) {
    return this._modelCache.get(modelIdentifier);
  }
  lookupLanguageModelByQualifiedName(referenceName) {
    for (const [identifier2, model] of this._modelCache.entries()) {
      if (ILanguageModelChatMetadata.matchesQualifiedName(referenceName, model)) {
        return { metadata: model, identifier: identifier2 };
      }
    }
    return void 0;
  }
  async _resolveAllLanguageModels(vendorId, silent) {
    const vendor = this._vendors.get(vendorId);
    if (!vendor) {
      return;
    }
    let provider = this._providers.get(vendorId);
    if (!provider) {
      await this._extensionService.activateByEvent(`onLanguageModelChatProvider:${vendorId}`);
      provider = this._providers.get(vendorId);
    }
    if (!provider) {
      this._logService.warn(`[LM] No provider registered for vendor ${vendorId}`);
      return;
    }
    return this._resolveLMSequencer.queue(vendorId, async () => {
      const allModels = [];
      const languageModelsGroups = [];
      try {
        const models = await provider.provideLanguageModelChatInfo({ silent }, CancellationToken.None);
        if (models.length) {
          allModels.push(...models);
          const modelIdentifiers = [];
          for (const m of models) {
            if (vendor.isDefault) {
              if (m.metadata.isUserSelectable !== false) {
                modelIdentifiers.push(m.identifier);
              } else {
                this._logService.trace(`[LM] Skipping model ${m.identifier} from model picker as it is not user selectable.`);
              }
            } else {
              modelIdentifiers.push(m.identifier);
            }
          }
          languageModelsGroups.push({ modelIdentifiers });
        }
      } catch (error) {
        languageModelsGroups.push({
          modelIdentifiers: [],
          status: {
            message: getErrorMessage(error),
            severity: severity_default.Error
          }
        });
      }
      const groups = this._languageModelsConfigurationService.getLanguageModelsProviderGroups();
      const perModelConfigurations = /* @__PURE__ */ new Map();
      for (const group2 of groups) {
        if (group2.vendor !== vendorId) {
          continue;
        }
        if (!vendor.configuration && allModels.length > 0) {
          if (group2.settings) {
            for (const model of allModels) {
              const modelConfig = group2.settings[model.metadata.id];
              if (modelConfig) {
                perModelConfigurations.set(model.identifier, { ...modelConfig });
              }
            }
          }
          languageModelsGroups.push({ group: group2, modelIdentifiers: [] });
          continue;
        }
        const configuration2 = await this._resolveConfiguration(group2, vendor.configuration);
        // OpenCode: 只保存了模型设置、缺少必填连接配置（如 baseUrl）的分组不再重复拉取同一批模型（否则模型列表翻倍）；其设置作用到默认模型上
        const ocRequired = Array.isArray(vendor.configuration?.required) ? vendor.configuration.required : [];
        if (allModels.length > 0 && ocRequired.length > 0 && ocRequired.some((key) => configuration2?.[key] === void 0 || configuration2?.[key] === null || String(configuration2?.[key]).trim() === "")) {
          if (group2.settings) {
            for (const model of allModels) {
              const modelConfig = group2.settings[model.metadata.id];
              if (modelConfig) {
                perModelConfigurations.set(model.identifier, { ...modelConfig });
              }
            }
          }
          languageModelsGroups.push({ group: group2, modelIdentifiers: [] });
          continue;
        }
        try {
          const models = await provider.provideLanguageModelChatInfo({ group: group2.name, silent, configuration: configuration2 }, CancellationToken.None);
          if (models.length) {
            for (let i2 = 0; i2 < models.length; i2++) {
              if (!models[i2].metadata.detail) {
                models[i2] = { ...models[i2], metadata: { ...models[i2].metadata, detail: group2.name } };
              }
            }
            allModels.push(...models);
            languageModelsGroups.push({ group: group2, modelIdentifiers: models.map((m) => m.identifier) });
          }
          if (group2.settings) {
            for (const model of models) {
              const modelConfig = group2.settings[model.metadata.id];
              if (modelConfig) {
                perModelConfigurations.set(model.identifier, { ...modelConfig });
              }
            }
          }
        } catch (error) {
          languageModelsGroups.push({
            group: group2,
            modelIdentifiers: [],
            status: {
              message: getErrorMessage(error),
              severity: severity_default.Error
            }
          });
        }
      }
      const wasResolved = this._modelsGroups.has(vendorId);
      const oldGroups = this._modelsGroups.get(vendorId) ?? [];
      this._modelsGroups.set(vendorId, languageModelsGroups);
      const oldModels = this._clearModelCache(vendorId);
      let hasChanges = !wasResolved;
      for (const model of allModels) {
        if (this._modelCache.has(model.identifier)) {
          this._logService.warn(`[LM] Model ${model.identifier} is already registered. Skipping.`);
          continue;
        }
        this._modelCache.set(model.identifier, model.metadata);
        hasChanges = hasChanges || !equals4(oldModels.get(model.identifier), model.metadata);
        oldModels.delete(model.identifier);
      }
      this._logService.trace(`[LM] Resolved language models for vendor ${vendorId}`, allModels);
      hasChanges = hasChanges || oldModels.size > 0;
      if (!hasChanges) {
        hasChanges = this._hasGroupStructureChanged(oldGroups, languageModelsGroups);
      }
      this._clearModelConfigurations(vendorId);
      for (const [identifier2, config] of perModelConfigurations) {
        if (this._modelCache.has(identifier2)) {
          this._modelConfigurations.set(identifier2, config);
        }
      }
      if (hasChanges) {
        this._onLanguageModelChange.fire(vendorId);
      } else {
        this._logService.trace(`[LM] No changes in language models for vendor ${vendorId}`);
      }
    });
  }
  _hasGroupStructureChanged(oldGroups, newGroups) {
    if (oldGroups.length !== newGroups.length) {
      return true;
    }
    for (let i2 = 0; i2 < oldGroups.length; i2++) {
      const oldGroup = oldGroups[i2];
      const newGroup = newGroups[i2];
      if (oldGroup.group?.name !== newGroup.group?.name || oldGroup.group?.vendor !== newGroup.group?.vendor || oldGroup.status?.message !== newGroup.status?.message || oldGroup.status?.severity !== newGroup.status?.severity || oldGroup.modelIdentifiers.length !== newGroup.modelIdentifiers.length) {
        return true;
      }
    }
    return false;
  }
  getLanguageModelGroups(vendor) {
    return this._modelsGroups.get(vendor) ?? [];
  }
  hasResolvedVendor(vendor) {
    return this._modelsGroups.has(vendor);
  }
  async selectLanguageModels(selector) {
    if (selector.vendor) {
      await this._resolveAllLanguageModels(selector.vendor, true);
    } else {
      const allVendors = Array.from(this._vendors.keys());
      await Promise.all(allVendors.map((vendor) => this._resolveAllLanguageModels(vendor, true)));
    }
    const result = [];
    for (const [internalModelIdentifier, model] of this._modelCache) {
      if ((selector.vendor === void 0 || model.vendor === selector.vendor) && (selector.family === void 0 || model.family === selector.family) && (selector.version === void 0 || model.version === selector.version) && (selector.id === void 0 || model.id === selector.id)) {
        result.push(internalModelIdentifier);
      }
    }
    this._logService.trace("[LM] selected language models", selector, result);
    return result;
  }
  registerLanguageModelProvider(vendor, provider) {
    this._logService.trace("[LM] registering language model provider", vendor, provider);
    if (!this._vendors.has(vendor)) {
      throw new Error(`Chat model provider uses UNKNOWN vendor ${vendor}.`);
    }
    if (this._providers.has(vendor)) {
      throw new Error(`Chat model provider for vendor ${vendor} is already registered.`);
    }
    this._providers.set(vendor, provider);
    const modelChangeListener = provider.onDidChange(() => {
      this._resolveAllLanguageModels(vendor, true);
    });
    return toDisposable(() => {
      this._logService.trace("[LM] UNregistered language model provider", vendor);
      this._clearModelCache(vendor);
      this._modelsGroups.delete(vendor);
      this._providers.delete(vendor);
      modelChangeListener.dispose();
    });
  }
  async sendChatRequest(modelId, from, messages, options3, token) {
    const metadata = this._modelCache.get(modelId);
    const provider = this._providers.get(metadata?.vendor || "");
    if (!provider) {
      throw new Error(`Chat provider for model ${modelId} is not registered.`);
    }
    if (metadata) {
      this._logProviderUsageTelemetry(metadata);
      this._maybeShowProviderDeprecationNotice(metadata);
    }
    const configuration2 = this.getModelConfiguration(modelId);
    const mergedOptions = configuration2 ? { ...options3, configuration: { ...configuration2, ...options3.configuration } } : options3;
    return provider.sendChatRequest(modelId, messages, from, mergedOptions, token);
  }
  /**
   * When a chat request is made against a deprecated provider (one that contributes a
   * `deprecation.link`), prompt the user once per session to install the replacement
   * extension. The notification can be dismissed, and offers a "Don't Show Again" choice that
   * is persisted across sessions via the notification service's `neverShowAgain` support.
   */
  _maybeShowProviderDeprecationNotice(metadata) {
    const vendor = this._vendors.get(metadata.vendor);
    const link2 = vendor?.deprecation?.link;
    if (!link2) {
      return;
    }
    if (this._deprecationNoticeShownVendors.has(metadata.vendor)) {
      return;
    }
    this._deprecationNoticeShownVendors.add(metadata.vendor);
    const providerName = (vendor.displayName || metadata.vendor).replace(/\s*\(deprecated\)\s*$/i, "");
    this._notificationService.prompt(
      severity_default.Info,
      localize(12958, null, providerName),
      [{
        label: localize(12957, null),
        run: () => {
          this._openerService.open(resolveProviderDeprecationLink(link2, this._productService.urlProtocol));
        }
      }],
      {
        neverShowAgain: { id: `chat.providerDeprecation.${metadata.vendor}`, scope: 2 /* APPLICATION */ }
      }
    );
  }
  /**
   * Reports which in-built BYOK provider (or third-party extension) backs a model request. First-party
   * Copilot models are intentionally not reported here (see {@link getByokProviderTelemetryName}).
   */
  _logProviderUsageTelemetry(metadata) {
    const provider = getByokProviderTelemetryName(metadata?.vendor, metadata?.extension);
    if (!provider) {
      return;
    }
    this._telemetryService.publicLog2("chat.languageModelRequest", {
      provider,
      isBYOK: !!metadata?.isBYOK
    });
  }
  _resolveModelConfigurationWithDefaults(modelId, metadata) {
    const userConfig = this._modelConfigurations.get(modelId);
    const schema10 = metadata?.configurationSchema;
    if (!schema10?.properties && !userConfig) {
      return void 0;
    }
    const defaults = {};
    if (schema10?.properties) {
      for (const [key3, propSchema] of Object.entries(schema10.properties)) {
        if (propSchema.default !== void 0) {
          defaults[key3] = propSchema.default;
        }
      }
    }
    if (!userConfig && Object.keys(defaults).length === 0) {
      return void 0;
    }
    return { ...defaults, ...userConfig };
  }
  computeTokenLength(modelId, message, token) {
    const model = this._modelCache.get(modelId);
    if (!model) {
      throw new Error(`Chat model ${modelId} could not be found.`);
    }
    const provider = this._providers.get(model.vendor);
    if (!provider) {
      throw new Error(`Chat provider for model ${modelId} is not registered.`);
    }
    return provider.provideTokenCount(modelId, message, token);
  }
  getModelConfiguration(modelId) {
    const metadata = this._modelCache.get(modelId);
    return this._resolveModelConfigurationWithDefaults(modelId, metadata);
  }
  async setModelConfiguration(modelId, values) {
    const metadata = this._modelCache.get(modelId);
    if (!metadata) {
      return;
    }
    const allGroups = this._languageModelsConfigurationService.getLanguageModelsProviderGroups();
    let group2;
    group2 = allGroups.find((g) => g.vendor === metadata.vendor && g.settings?.[metadata.id] !== void 0);
    if (!group2) {
      const vendorGroups = this._modelsGroups.get(metadata.vendor);
      const containingGroup = vendorGroups?.find((vg) => vg.modelIdentifiers.includes(modelId) && vg.group)?.group;
      if (containingGroup) {
        group2 = allGroups.find((g) => g.vendor === containingGroup.vendor && g.name === containingGroup.name) ?? containingGroup;
      }
    }
    if (!group2) {
      group2 = allGroups.find((g) => g.vendor === metadata.vendor);
    }
    const existingConfig = this._modelConfigurations.get(modelId) ?? {};
    const updatedConfig = { ...existingConfig, ...values };
    const schema10 = metadata.configurationSchema;
    if (schema10?.properties) {
      for (const [key3, value2] of Object.entries(updatedConfig)) {
        const propSchema = schema10.properties[key3];
        if (propSchema?.default !== void 0 && propSchema.default === value2) {
          delete updatedConfig[key3];
        }
      }
    }
    if (group2) {
      const existingSettings = group2.settings ?? {};
      let updatedSettings;
      if (Object.keys(updatedConfig).length === 0) {
        updatedSettings = { ...existingSettings };
        delete updatedSettings[metadata.id];
      } else {
        updatedSettings = { ...existingSettings, [metadata.id]: updatedConfig };
      }
      const updatedGroup = {
        ...group2,
        settings: Object.keys(updatedSettings).length > 0 ? updatedSettings : void 0
      };
      if (!updatedGroup.settings && Object.keys(updatedGroup).filter((k) => k !== "name" && k !== "vendor" && k !== "range" && k !== "modelsRange" && k !== "settings").length === 0) {
        await this._languageModelsConfigurationService.removeLanguageModelsProviderGroup(group2);
      } else {
        await this._languageModelsConfigurationService.updateLanguageModelsProviderGroup(group2, updatedGroup);
      }
    } else if (Object.keys(updatedConfig).length > 0) {
      const vendor = this._vendors.get(metadata.vendor);
      if (!vendor) {
        return;
      }
      const newGroup = {
        name: vendor.displayName,
        vendor: metadata.vendor,
        settings: { [metadata.id]: updatedConfig }
      };
      await this._languageModelsConfigurationService.addLanguageModelsProviderGroup(newGroup);
    }
    if (Object.keys(updatedConfig).length > 0) {
      this._modelConfigurations.set(modelId, updatedConfig);
    } else {
      this._modelConfigurations.delete(modelId);
    }
    this._onLanguageModelChange.fire(metadata.vendor);
  }
  getModelConfigurationActions(modelId) {
    const metadata = this._modelCache.get(modelId);
    const currentConfig = this._modelConfigurations.get(modelId) ?? {};
    return createModelConfigurationActions(
      metadata?.configurationSchema,
      currentConfig,
      (key3, value2) => this.setModelConfiguration(modelId, { [key3]: value2 })
    );
  }
  async configureLanguageModelsProviderGroup(vendorId, providerGroupName) {
    const vendor = this.getVendors().find(({ vendor: vendor2 }) => vendor2 === vendorId);
    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found.`);
    }
    if (vendor.managementCommand) {
      await this._resolveAllLanguageModels(vendor.vendor, false);
      return;
    }
    const languageModelProviderGroups = this._languageModelsConfigurationService.getLanguageModelsProviderGroups();
    const existing = providerGroupName ? languageModelProviderGroups.find((g) => g.vendor === vendorId && g.name === providerGroupName) : languageModelProviderGroups.find((g) => g.vendor === vendorId && vendorId === "opencode");
    const name = existing?.name ?? (providerGroupName ?? (vendorId === "opencode" ? vendor.displayName : await this.promptForName(languageModelProviderGroups, vendor, existing)));
    if (!name) {
      return;
    }
    const existingConfiguration = existing ? await this._resolveConfiguration(existing, vendor.configuration) : void 0;
    try {
      const configuration2 = vendor.configuration ? await this.promptForConfiguration(name, vendor.configuration, existingConfiguration) : void 0;
      if (vendor.configuration && !configuration2) {
        return;
      }
      const languageModelProviderGroup = await this._resolveLanguageModelProviderGroup(name, vendorId, configuration2, vendor.configuration);
      const saved = existing ? await this._languageModelsConfigurationService.updateLanguageModelsProviderGroup(existing, languageModelProviderGroup) : await this._languageModelsConfigurationService.addLanguageModelsProviderGroup(languageModelProviderGroup);
      if (vendor.configuration && this.requireConfiguring(vendor.configuration)) {
        const snippet = this.getSnippetForFirstUnconfiguredProperty(configuration2 ?? {}, vendor.configuration);
        await this._languageModelsConfigurationService.configureLanguageModels({ group: saved, snippet });
      }
    } catch (error) {
      if (isCancellationError(error)) {
        return;
      }
      throw error;
    }
  }
  async getLanguageModelsProviderConfiguration(vendorId, providerGroupName) {
    const vendor = this.getVendors().find((candidate) => candidate.vendor === vendorId);
    const schema10 = vendor?.configuration;
    if (!vendor || !schema10) {
      return void 0;
    }
    const group2 = this._languageModelsConfigurationService.getLanguageModelsProviderGroups().find((candidate) => candidate.vendor === vendorId && (!providerGroupName || candidate.name === providerGroupName));
    if (!group2) {
      return void 0;
    }
    const resolved = await this._resolveConfiguration(group2, schema10);
    const values = { ...resolved };
    const configuredSecretKeys = [];
    for (const [key3, propertySchema] of Object.entries(schema10.properties ?? {})) {
      if (!propertySchema.secret) {
        continue;
      }
      if (isString(resolved[key3]) && resolved[key3].trim()) {
        configuredSecretKeys.push(key3);
      }
      delete values[key3];
    }
    return { values, configuredSecretKeys };
  }
  async testLanguageModelsProviderConnection(vendorId, baseUrl, apiKey, providerGroupName, protocol) {
    if (vendorId !== "opencode") {
      return { ok: false, error: "Unsupported API provider." };
    }
    let testKey = apiKey.trim();
    if (!testKey && providerGroupName) {
      const vendor = this.getVendors().find((candidate) => candidate.vendor === vendorId);
      const group2 = this._languageModelsConfigurationService.getLanguageModelsProviderGroups().find((candidate) => candidate.vendor === vendorId && candidate.name === providerGroupName);
      if (!vendor?.configuration || !group2) {
        return { ok: false, error: "API provider configuration not found." };
      }
      const saved = await this._resolveConfiguration(group2, vendor.configuration);
      const savedKey = typeof saved.apiKey === "string" ? saved.apiKey.trim() : "";
      if (savedKey) {
        let sameOrigin = false;
        try {
          const original = new URL(typeof saved.baseUrl === "string" ? saved.baseUrl : "");
          const next = new URL(baseUrl);
          sameOrigin = ["http:", "https:"].includes(original.protocol) && original.origin === next.origin && !original.username && !original.password && !next.username && !next.password;
        } catch {
        }
        if (!sameOrigin) {
          return { ok: false, error: "saved_key_endpoint_changed" };
        }
        testKey = savedKey;
      }
    }
    if (!this._commandService) {
      return { ok: false, error: "API connection test is unavailable." };
    }
    return await this._commandService.executeCommand("opencode.testApiEndpoint", { baseUrl, apiKey: testKey, protocol }) ?? { ok: false, error: "API connection test did not return a result." };
  }
  async setLanguageModelsProviderConfiguration(vendorId, values, providerGroupName) {
    const vendor = this.getVendors().find((candidate) => candidate.vendor === vendorId);
    const schema10 = vendor?.configuration;
    if (!vendor || !schema10) {
      throw new Error(`Vendor ${vendorId} is not configurable.`);
    }
    const groups = this._languageModelsConfigurationService.getLanguageModelsProviderGroups();
    const existing = providerGroupName ? groups.find((candidate) => candidate.vendor === vendorId && candidate.name === providerGroupName) : groups.find((candidate) => candidate.vendor === vendorId);
    const existingConfiguration = existing ? await this._resolveConfiguration(existing, schema10) : {};
    const suppliedValues = { ...values };
    for (const [key3, propertySchema] of Object.entries(schema10.properties ?? {})) {
      if (propertySchema.secret && suppliedValues[key3] === "") {
        delete suppliedValues[key3];
      }
    }
    const configuration2 = { ...existingConfiguration, ...suppliedValues };
    for (const [key3, value2] of Object.entries(configuration2)) {
      if (isString(value2)) {
        configuration2[key3] = value2.trim();
      }
    }
    for (const requiredKey of schema10.required ?? []) {
      if (!configuration2[requiredKey]) {
        throw new Error(localize(12964, null, schema10.properties?.[requiredKey]?.title ?? requiredKey));
      }
    }
    const name = existing?.name ?? providerGroupName ?? vendor.displayName;
    const resolvedGroup = {
      ...await this._resolveLanguageModelProviderGroup(name, vendorId, configuration2, schema10),
      settings: existing?.settings
    };
    if (existing) {
      await this._languageModelsConfigurationService.updateLanguageModelsProviderGroup(existing, resolvedGroup);
      await this._deleteSecretsInConfiguration(existing, schema10);
    } else {
      await this._languageModelsConfigurationService.addLanguageModelsProviderGroup(resolvedGroup);
    }
  }
  async renameLanguageModelsProviderGroup(vendorId, providerGroupName) {
    const vendor = this.getVendors().find(({ vendor: vendor2 }) => vendor2 === vendorId);
    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found.`);
    }
    const languageModelProviderGroups = this._languageModelsConfigurationService.getLanguageModelsProviderGroups();
    const existing = languageModelProviderGroups.find((group2) => group2.vendor === vendorId && group2.name === providerGroupName);
    if (!existing) {
      throw new Error(`Language model provider group ${providerGroupName} for vendor ${vendorId} not found.`);
    }
    const name = await this.promptForName(languageModelProviderGroups, vendor, existing);
    if (!name || name === existing.name) {
      return;
    }
    await this._languageModelsConfigurationService.updateLanguageModelsProviderGroup(existing, { ...existing, name });
  }
  async updateLanguageModelsProviderGroupApiKey(vendorId, providerGroupName) {
    const vendor = this.getVendors().find(({ vendor: vendor2 }) => vendor2 === vendorId);
    const schema10 = vendor?.configuration;
    const apiKeySchema = schema10?.properties?.apiKey;
    if (!vendor || !schema10 || !apiKeySchema) {
      return;
    }
    const existing = this._languageModelsConfigurationService.getLanguageModelsProviderGroups().find((group2) => group2.vendor === vendorId && group2.name === providerGroupName);
    if (!existing) {
      throw new Error(`Language model provider group ${providerGroupName} for vendor ${vendorId} not found.`);
    }
    try {
      const existingConfiguration = await this._resolveConfiguration(existing, schema10);
      const apiKey = await this.promptForValue(existing.name, "apiKey", apiKeySchema, !!schema10.required?.includes("apiKey"), existingConfiguration);
      if (apiKey === void 0 || apiKey === existingConfiguration.apiKey) {
        return;
      }
      const configuration2 = { ...existingConfiguration, apiKey };
      const updated = {
        ...await this._resolveLanguageModelProviderGroup(existing.name, vendorId, configuration2, schema10),
        settings: existing.settings
      };
      await this._languageModelsConfigurationService.updateLanguageModelsProviderGroup(existing, updated);
      await this._deleteSecretsInConfiguration(existing, schema10);
    } catch (error) {
      if (isCancellationError(error)) {
        return;
      }
      throw error;
    }
  }
  async addLanguageModelsProviderGroupModel(vendorId, providerGroupName) {
    const vendor = this.getVendors().find(({ vendor: vendor2 }) => vendor2 === vendorId);
    const schema10 = vendor?.configuration;
    const modelsSchema = schema10?.properties?.models;
    if (!vendor || !modelsSchema) {
      return;
    }
    const group2 = this._languageModelsConfigurationService.getLanguageModelsProviderGroups().find((group3) => group3.vendor === vendorId && group3.name === providerGroupName);
    if (!group2) {
      throw new Error(`Language model provider group ${providerGroupName} for vendor ${vendorId} not found.`);
    }
    const hasModels = Array.isArray(group2.models);
    const snippet = hasModels ? this.getSnippetForArrayItem(modelsSchema) : this.getSnippetForProperty("models", modelsSchema);
    if (!snippet) {
      return;
    }
    await this._languageModelsConfigurationService.configureLanguageModels({
      group: group2,
      snippet,
      snippetTarget: hasModels ? "models" : "group"
    });
  }
  async openLanguageModelsProviderGroupSettings(vendorId, providerGroupName) {
    const group2 = this._languageModelsConfigurationService.getLanguageModelsProviderGroups().find((group3) => group3.vendor === vendorId && group3.name === providerGroupName);
    if (!group2) {
      throw new Error(`Language model provider group ${providerGroupName} for vendor ${vendorId} not found.`);
    }
    await this._languageModelsConfigurationService.configureLanguageModels({ group: group2 });
  }
  async configureModel(modelId) {
    const metadata = this._modelCache.get(modelId);
    if (!metadata || !metadata.configurationSchema) {
      return;
    }
    const vendorGroups = this._modelsGroups.get(metadata.vendor);
    let group2;
    if (vendorGroups) {
      for (const vg of vendorGroups) {
        if (vg.modelIdentifiers.includes(modelId) && vg.group) {
          group2 = vg.group;
          break;
        }
      }
    }
    if (!group2) {
      const vendor = this.getVendors().find((v2) => v2.vendor === metadata.vendor);
      if (!vendor) {
        return;
      }
      const groupName = vendor.displayName;
      const newGroup = { name: groupName, vendor: metadata.vendor, settings: { [metadata.id]: {} } };
      group2 = await this._languageModelsConfigurationService.addLanguageModelsProviderGroup(newGroup);
      await this._resolveAllLanguageModels(metadata.vendor, true);
    }
    const snippet = this._getModelConfigurationSnippet(metadata.id, metadata.configurationSchema);
    await this._languageModelsConfigurationService.configureLanguageModels({ group: group2, snippet });
  }
  _getModelConfigurationSnippet(modelId, schema10) {
    const properties = [];
    if (schema10.properties) {
      for (const [key3, propSchema] of Object.entries(schema10.properties)) {
        if (propSchema.defaultSnippets?.[0]) {
          const snippet = propSchema.defaultSnippets[0];
          let bodyText = snippet.bodyText ?? JSON.stringify(snippet.body, null, "			");
          bodyText = bodyText.replace(/"(\^[^"]*)"/g, (_, value2) => value2.substring(1));
          properties.push(`			"${key3}": ${bodyText}`);
        } else if (propSchema.default !== void 0) {
          properties.push(`			"${key3}": ${JSON.stringify(propSchema.default)}`);
        } else {
          properties.push(`			"${key3}": \${${key3}}`);
        }
      }
    }
    const modelContent = properties.length > 0 ? `{
${properties.join(",\n")}
		}` : "{\n			$0\n		}";
    return `"settings": {
		"${modelId}": ${modelContent}
	}`;
  }
  async addLanguageModelsProviderGroup(name, vendorId, configuration2) {
    const vendor = this.getVendors().find(({ vendor: vendor2 }) => vendor2 === vendorId);
    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found.`);
    }
    const languageModelProviderGroup = await this._resolveLanguageModelProviderGroup(name, vendorId, configuration2, vendor.configuration);
    await this._languageModelsConfigurationService.addLanguageModelsProviderGroup(languageModelProviderGroup);
  }
  async removeLanguageModelsProviderGroup(vendorId, providerGroupName) {
    const vendor = this.getVendors().find(({ vendor: vendor2 }) => vendor2 === vendorId);
    if (!vendor) {
      throw new Error(`Vendor ${vendorId} not found.`);
    }
    const languageModelProviderGroups = this._languageModelsConfigurationService.getLanguageModelsProviderGroups();
    const existing = languageModelProviderGroups.find((g) => g.vendor === vendorId && g.name === providerGroupName);
    if (!existing) {
      throw new Error(`Language model provider group ${providerGroupName} for vendor ${vendorId} not found.`);
    }
    await this._deleteSecretsInConfiguration(existing, vendor.configuration);
    await this._languageModelsConfigurationService.removeLanguageModelsProviderGroup(existing);
  }
  requireConfiguring(schema10) {
    if (schema10.additionalProperties) {
      return true;
    }
    if (!schema10.properties) {
      return false;
    }
    for (const property of Object.keys(schema10.properties)) {
      if (!this.canPromptForProperty(schema10.properties[property])) {
        return true;
      }
    }
    return false;
  }
  getSnippetForFirstUnconfiguredProperty(configuration2, schema10) {
    if (!schema10.properties) {
      return void 0;
    }
    for (const property of Object.keys(schema10.properties)) {
      if (configuration2[property] === void 0) {
        const propertySchema = schema10.properties[property];
        const snippet = this.getSnippetForProperty(property, propertySchema);
        if (snippet) {
          return snippet;
        }
      }
    }
    return void 0;
  }
  getSnippetForProperty(property, propertySchema) {
    const bodyText = this.getDefaultSnippetBodyText(propertySchema);
    return bodyText ? `"${property}": ${bodyText}` : void 0;
  }
  getSnippetForArrayItem(propertySchema) {
    return this.getDefaultSnippetBodyText(propertySchema, true);
  }
  getDefaultSnippetBodyText(propertySchema, arrayItem = false) {
    const snippet = propertySchema.defaultSnippets?.[0];
    if (!snippet) {
      return void 0;
    }
    const bodyText = arrayItem ? Array.isArray(snippet.body) && snippet.body.length > 0 ? JSON.stringify(snippet.body[0], null, "	") : void 0 : snippet.bodyText ?? JSON.stringify(snippet.body, null, "	");
    if (!bodyText) {
      return void 0;
    }
    return bodyText.replace(/"(\^[^"]*)"/g, (_, value2) => value2.substring(1));
  }
  async promptForName(languageModelProviderGroups, vendor, existing) {
    let providerGroupName = existing?.name;
    if (!providerGroupName) {
      providerGroupName = vendor.displayName;
      let count2 = 1;
      while (languageModelProviderGroups.some((g) => g.vendor === vendor.vendor && g.name === providerGroupName)) {
        count2++;
        providerGroupName = `${vendor.displayName} ${count2}`;
      }
    }
    let result;
    const disposables = new DisposableStore();
    try {
      await new Promise((resolve3) => {
        const inputBox = disposables.add(this._quickInputService.createInputBox());
        inputBox.title = localize(12959, null);
        inputBox.placeholder = localize(12962, null);
        inputBox.value = providerGroupName;
        inputBox.ignoreFocusOut = true;
        disposables.add(inputBox.onDidChangeValue((value2) => {
          if (!value2) {
            inputBox.validationMessage = localize(12960, null);
            inputBox.severity = severity_default.Error;
            return;
          }
          if (languageModelProviderGroups.some((group2) => group2 !== existing && group2.vendor === vendor.vendor && group2.name === value2)) {
            inputBox.validationMessage = localize(12965, null);
            inputBox.severity = severity_default.Error;
            return;
          }
          inputBox.validationMessage = void 0;
          inputBox.severity = severity_default.Ignore;
        }));
        disposables.add(inputBox.onDidAccept(async () => {
          result = inputBox.value;
          inputBox.hide();
        }));
        disposables.add(inputBox.onDidHide(() => resolve3()));
        inputBox.show();
      });
    } finally {
      disposables.dispose();
    }
    return result;
  }
  async promptForConfiguration(groupName, configuration2, existing) {
    if (!configuration2.properties) {
      return;
    }
    const result = existing ? { ...existing } : {};
    for (const property of Object.keys(configuration2.properties)) {
      const propertySchema = configuration2.properties[property];
      const required = !!configuration2.required?.includes(property);
      const isSecret = typeof propertySchema !== "boolean" && !!propertySchema.secret;
      const shouldPrompt = required || existing !== void 0 && existing[property] !== void 0 || existing === void 0 && isSecret;
      if (!shouldPrompt) {
        continue;
      }
      const value2 = await this.promptForValue(groupName, property, propertySchema, required, existing);
      if (value2 !== void 0) {
        result[property] = value2;
      }
    }
    return result;
  }
  async promptForValue(groupName, property, propertySchema, required, existing) {
    if (!propertySchema) {
      return void 0;
    }
    if (!this.canPromptForProperty(propertySchema)) {
      return void 0;
    }
    if (propertySchema.type === "array" && propertySchema.items && !Array.isArray(propertySchema.items) && propertySchema.items.enum) {
      const selectedItems = await this.promptForArray(groupName, property, propertySchema);
      if (selectedItems === void 0) {
        return void 0;
      }
      return selectedItems;
    }
    if (propertySchema.type === "string" && Array.isArray(propertySchema.enum) && propertySchema.enum.length > 0) {
      return this.promptForEnum(groupName, property, propertySchema, existing);
    }
    const value2 = await this.promptForInput(groupName, property, propertySchema, required, existing);
    if (value2 === void 0) {
      return void 0;
    }
    return value2;
  }
  canPromptForProperty(propertySchema) {
    if (!propertySchema || typeof propertySchema === "boolean") {
      return false;
    }
    if (propertySchema.type === "array" && propertySchema.items && !Array.isArray(propertySchema.items) && propertySchema.items.enum) {
      return true;
    }
    if (propertySchema.type === "string" || propertySchema.type === "number" || propertySchema.type === "integer" || propertySchema.type === "boolean") {
      return true;
    }
    return false;
  }
  getDescriptionPlaintext(propertySchema) {
    if (propertySchema.description) {
      return propertySchema.description;
    }
    const md = propertySchema.markdownDescription;
    if (!md) {
      return void 0;
    }
    return md.replace(/`([^`]+)`/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
  }
  async promptForArray(groupName, property, propertySchema) {
    if (!propertySchema.items || Array.isArray(propertySchema.items) || !propertySchema.items.enum) {
      return void 0;
    }
    const items = propertySchema.items.enum;
    const disposables = new DisposableStore();
    try {
      return await new Promise((resolve3) => {
        const quickPick = disposables.add(this._quickInputService.createQuickPick());
        quickPick.title = `${groupName}: ${propertySchema.title ?? property}`;
        quickPick.items = items.map((item) => ({ label: item }));
        quickPick.placeholder = this.getDescriptionPlaintext(propertySchema) ?? localize(12966, null, property);
        quickPick.canSelectMany = true;
        quickPick.ignoreFocusOut = true;
        disposables.add(quickPick.onDidAccept(() => {
          resolve3(quickPick.selectedItems.map((item) => item.label));
          quickPick.hide();
        }));
        disposables.add(quickPick.onDidHide(() => {
          resolve3(void 0);
        }));
        quickPick.show();
      });
    } finally {
      disposables.dispose();
    }
  }
  async promptForEnum(groupName, property, propertySchema, existing) {
    const values = propertySchema.enum;
    if (!Array.isArray(values) || values.length === 0) {
      return void 0;
    }
    const enumDescriptions = propertySchema.enumDescriptions;
    const enumItemLabels = Array.isArray(propertySchema.enumItemLabels) ? propertySchema.enumItemLabels : void 0;
    const initial = existing?.[property] !== void 0 ? String(existing[property]) : propertySchema.default !== void 0 ? String(propertySchema.default) : void 0;
    const items = values.map((value2, index2) => ({
      label: enumItemLabels?.[index2] ?? String(value2),
      description: enumDescriptions?.[index2],
      id: String(value2)
    }));
    const disposables = new DisposableStore();
    try {
      return await new Promise((resolve3) => {
        const quickPick = disposables.add(this._quickInputService.createQuickPick());
        quickPick.title = `${groupName}: ${propertySchema.title ?? property}`;
        quickPick.items = items;
        quickPick.placeholder = this.getDescriptionPlaintext(propertySchema) ?? localize(12966, null, property);
        quickPick.ignoreFocusOut = true;
        if (initial !== void 0) {
          const match2 = items.find((item) => item.id === initial);
          if (match2) {
            quickPick.activeItems = [match2];
          }
        }
        disposables.add(quickPick.onDidAccept(() => {
          const selected = quickPick.selectedItems[0];
          resolve3(selected?.id);
          quickPick.hide();
        }));
        disposables.add(quickPick.onDidHide(() => {
          resolve3(void 0);
        }));
        quickPick.show();
      });
    } finally {
      disposables.dispose();
    }
  }
  async promptForInput(groupName, property, propertySchema, required, existing) {
    const disposables = new DisposableStore();
    try {
      const validate = (value3) => {
        if (!value3 && required) {
          return localize(12967, null);
        }
        return void 0;
      };
      const value2 = await new Promise((resolve3, reject) => {
        const inputBox = disposables.add(this._quickInputService.createInputBox());
        inputBox.title = `${groupName}: ${propertySchema.title ?? property}`;
        inputBox.placeholder = localize(12961, null, property);
        inputBox.password = !!propertySchema.secret;
        inputBox.ignoreFocusOut = true;
        if (existing?.[property]) {
          inputBox.value = String(existing?.[property]);
        } else if (propertySchema.default) {
          inputBox.value = String(propertySchema.default);
        }
        const promptText = this.getDescriptionPlaintext(propertySchema);
        if (promptText) {
          inputBox.prompt = promptText;
        }
        disposables.add(inputBox.onDidChangeValue((value3) => {
          const message = validate(value3);
          if (message) {
            inputBox.validationMessage = message;
            inputBox.severity = severity_default.Error;
          } else {
            inputBox.validationMessage = void 0;
            inputBox.severity = severity_default.Ignore;
          }
        }));
        disposables.add(inputBox.onDidAccept(() => {
          const message = validate(inputBox.value);
          if (message) {
            inputBox.validationMessage = message;
            inputBox.severity = severity_default.Error;
            return;
          }
          resolve3(inputBox.value);
          inputBox.hide();
        }));
        disposables.add(inputBox.onDidHide((e) => {
          if (e.reason === 2 /* Gesture */) {
            reject(new CancellationError());
          } else {
            resolve3(void 0);
          }
        }));
        inputBox.show();
      });
      if (!value2) {
        return void 0;
      }
      if (propertySchema.type === "number" || propertySchema.type === "integer") {
        return Number(value2);
      } else if (propertySchema.type === "boolean") {
        return value2 === "true";
      } else {
        return value2;
      }
    } finally {
      disposables.dispose();
    }
  }
  encodeSecretKey(property) {
    return format2(LanguageModelsService.SECRET_INPUT, property);
  }
  decodeSecretKey(secretInput) {
    if (!isString(secretInput)) {
      return void 0;
    }
    return secretInput.substring(secretInput.indexOf(":") + 1, secretInput.length - 1);
  }
  _clearModelCache(vendor) {
    const removed = /* @__PURE__ */ new Map();
    for (const [id2, model] of this._modelCache.entries()) {
      if (model.vendor === vendor) {
        removed.set(id2, model);
        this._modelCache.delete(id2);
      }
    }
    return removed;
  }
  _clearModelConfigurations(vendor) {
    for (const [id2] of this._modelConfigurations) {
      if (this._modelCache.get(id2)?.vendor === vendor || id2.startsWith(`${vendor}/`)) {
        this._modelConfigurations.delete(id2);
      }
    }
  }
  async _resolveConfiguration(group2, schema10) {
    if (!schema10) {
      return {};
    }
    const result = {};
    for (const key3 in group2) {
      if (key3 === "vendor" || key3 === "name" || key3 === "range" || key3 === "modelsRange" || key3 === "settings") {
        continue;
      }
      let value2 = group2[key3];
      if (schema10.properties?.[key3]?.secret) {
        const secretKey = this.decodeSecretKey(value2);
        value2 = secretKey ? await this._secretStorageService.get(secretKey) : void 0;
      }
      result[key3] = value2;
    }
    return result;
  }
  async _resolveLanguageModelProviderGroup(name, vendor, configuration2, schema10) {
    if (!schema10) {
      return { name, vendor };
    }
    const result = {};
    for (const key3 in configuration2) {
      let value2 = configuration2[key3];
      if (schema10.properties?.[key3]?.secret && isString(value2)) {
        const secretKey = `${LanguageModelsService.SECRET_KEY_PREFIX}${hash(generateUuid()).toString(16)}`;
        await this._secretStorageService.set(secretKey, key3 === "apiKey" ? value2.trim() : value2);
        value2 = this.encodeSecretKey(secretKey);
      }
      result[key3] = value2;
    }
    return { name, vendor, ...result };
  }
  async _deleteSecretsInConfiguration(group2, schema10) {
    if (!schema10) {
      return;
    }
    const { vendor, name, range: range2, modelsRange, ...configuration2 } = group2;
    for (const key3 in configuration2) {
      const value2 = group2[key3];
      if (schema10.properties?.[key3]?.secret) {
        const secretKey = this.decodeSecretKey(value2);
        if (secretKey) {
          await this._secretStorageService.delete(secretKey);
        }
      }
    }
  }
  async migrateLanguageModelsProviderGroup(languageModelsProviderGroup) {
    const { vendor, name, ...configuration2 } = languageModelsProviderGroup;
    if (!this._vendors.get(vendor)) {
      throw new Error(`Vendor ${vendor} not found.`);
    }
    await this._extensionService.activateByEvent(`onLanguageModelChatProvider:${vendor}`);
    const provider = this._providers.get(vendor);
    if (!provider) {
      throw new Error(`Chat model provider for vendor ${vendor} is not registered.`);
    }
    await provider.provideLanguageModelChatInfo({ group: name, silent: false, configuration: configuration2 }, CancellationToken.None);
    await this.addLanguageModelsProviderGroup(name, vendor, configuration2);
  }
  //#region Recently used models
  _readRecentlyUsedModels() {
    return this._storageService.getObject(CHAT_MODEL_RECENTLY_USED_STORAGE_KEY, 0 /* PROFILE */, []);
  }
  _saveRecentlyUsedModels() {
    this._storageService.store(CHAT_MODEL_RECENTLY_USED_STORAGE_KEY, this._recentlyUsedModelIds, 0 /* PROFILE */, 0 /* USER */);
  }
  getRecentlyUsedModelIds() {
    return this._recentlyUsedModelIds.filter((id2) => this._modelCache.has(id2) && id2 !== AUTO_MODEL_IDENTIFIER).slice(0, 4);
  }
  addToRecentlyUsedList(modelIdentifier) {
    if (modelIdentifier === AUTO_MODEL_IDENTIFIER) {
      return;
    }
    const index2 = this._recentlyUsedModelIds.indexOf(modelIdentifier);
    if (index2 !== -1) {
      this._recentlyUsedModelIds.splice(index2, 1);
    }
    this._recentlyUsedModelIds.unshift(modelIdentifier);
    if (this._recentlyUsedModelIds.length > 20) {
      this._recentlyUsedModelIds.length = 20;
    }
    this._saveRecentlyUsedModels();
  }
  clearRecentlyUsedList() {
    this._recentlyUsedModelIds = [];
    this._saveRecentlyUsedModels();
  }
  //#endregion
  //#region Pinned models
  _readPinnedModels() {
    return this._storageService.getObject(CHAT_MODEL_PINNED_STORAGE_KEY, 0 /* PROFILE */, []);
  }
  _savePinnedModels() {
    this._storageService.store(CHAT_MODEL_PINNED_STORAGE_KEY, this._pinnedModelIds, 0 /* PROFILE */, 0 /* USER */);
  }
  getPinnedModelIds() {
    return this._pinnedModelIds.filter((id2) => id2 !== AUTO_MODEL_IDENTIFIER && this._modelCache.has(id2));
  }
  pinModel(modelIdentifier) {
    if (modelIdentifier === AUTO_MODEL_IDENTIFIER || this._pinnedModelIds.includes(modelIdentifier)) {
      return;
    }
    this._pinnedModelIds.push(modelIdentifier);
    this._savePinnedModels();
    this._onDidChangePinnedModels.fire();
  }
  unpinModel(modelIdentifier) {
    const index2 = this._pinnedModelIds.indexOf(modelIdentifier);
    if (index2 === -1) {
      return;
    }
    this._pinnedModelIds.splice(index2, 1);
    this._savePinnedModels();
    this._onDidChangePinnedModels.fire();
  }
  isModelPinned(modelIdentifier) {
    return modelIdentifier !== AUTO_MODEL_IDENTIFIER && this._pinnedModelIds.includes(modelIdentifier);
  }
  //#endregion
  //#region Model visibility
  _getGroupNameForVendor(vendor) {
    return this._vendors.get(vendor)?.displayName ?? vendor;
  }
  _getModelIdsInGroup(vendor, groupName) {
    const vendorGroups = this._modelsGroups.get(vendor);
    if (!vendorGroups) {
      return [];
    }
    const result = [];
    const fallbackName = this._getGroupNameForVendor(vendor);
    for (const g of vendorGroups) {
      const name = g.group?.name ?? fallbackName;
      if (name === groupName) {
        for (const id2 of g.modelIdentifiers) {
          if (!canHideModel(id2, this._modelCache.get(id2))) {
            continue;
          }
          result.push(id2);
        }
      }
    }
    return result;
  }
  _readVisibility() {
    const raw = this._storageService.getObject(CHAT_MODEL_VISIBILITY_STORAGE_KEY, 0 /* PROFILE */, {});
    this._hiddenModelIds = new Set(Array.isArray(raw?.hiddenModels) ? raw.hiddenModels : []);
  }
  _saveVisibility() {
    this._storageService.store(
      CHAT_MODEL_VISIBILITY_STORAGE_KEY,
      { hiddenModels: Array.from(this._hiddenModelIds) },
      0 /* PROFILE */,
      0 /* USER */
    );
  }
  isGroupHidden(vendor, groupName) {
    const modelIds = this._getModelIdsInGroup(vendor, groupName);
    return modelIds.length > 0 && modelIds.every((id2) => this._hiddenModelIds.has(id2));
  }
  isModelHidden(modelIdentifier) {
    if (!this._hiddenModelIds.has(modelIdentifier)) {
      return false;
    }
    return canHideModel(modelIdentifier, this._modelCache.get(modelIdentifier));
  }
  setGroupHidden(vendor, groupName, hidden) {
    this.setModelsHidden(this._getModelIdsInGroup(vendor, groupName), hidden);
  }
  setModelHidden(modelIdentifier, hidden) {
    this.setModelsHidden([modelIdentifier], hidden);
  }
  setModelsHidden(modelIdentifiers, hidden) {
    let changed = false;
    for (const id2 of modelIdentifiers) {
      if (hidden) {
        if (!canHideModel(id2, this._modelCache.get(id2))) {
          continue;
        }
        if (!this._hiddenModelIds.has(id2)) {
          this._hiddenModelIds.add(id2);
          changed = true;
        }
      } else if (this._hiddenModelIds.delete(id2)) {
        changed = true;
      }
    }
    if (changed) {
      this._saveVisibility();
      this._onDidChangeModelVisibility.fire();
    }
  }
  getHiddenModelIds() {
    return Array.from(this._hiddenModelIds);
  }
  //#endregion
  //#region Models control manifest
  getModelsControlManifest() {
    return this._modelsControlManifest;
  }
  _setModelsControlManifest(response) {
    this._modelsControlRawResponse = response;
    this._refreshModelsControlManifest();
  }
  _refreshModelsControlManifest() {
    const response = this._modelsControlRawResponse;
    const free = {};
    const paid = {};
    if (response?.free) {
      const freeEntries = Array.isArray(response.free) ? response.free : Object.values(response.free);
      for (const entry of freeEntries) {
        if (!entry || !isObject(entry)) {
          continue;
        }
        free[entry.id] = { label: entry.label, featured: entry.featured, exists: this._modelCache.has(`copilot/${entry.id}`) };
      }
    }
    if (response?.paid) {
      const paidEntries = Array.isArray(response.paid) ? response.paid : Object.values(response.paid);
      for (const entry of paidEntries) {
        if (!entry || !isObject(entry)) {
          continue;
        }
        paid[entry.id] = { label: entry.label, featured: entry.featured, minVSCodeVersion: entry.minVSCodeVersion, exists: this._modelCache.has(`copilot/${entry.id}`) };
      }
    }
    this._modelsControlManifest = { free, paid };
    this._onDidChangeModelsControlManifest.fire(this._modelsControlManifest);
  }
  //#region Chat control data
  _initChatControlData() {
    this._chatControlUrl = this._productService.chatParticipantRegistry;
    if (!this._chatControlUrl) {
      return;
    }
    const raw = this._storageService.get(CHAT_PARTICIPANT_NAME_REGISTRY_STORAGE_KEY, -1 /* APPLICATION */);
    try {
      this._restrictedChatParticipants.set(JSON.parse(raw ?? "{}"), void 0);
    } catch (err) {
      this._storageService.remove(CHAT_PARTICIPANT_NAME_REGISTRY_STORAGE_KEY, -1 /* APPLICATION */);
    }
    const rawModels = this._storageService.get(CHAT_MODELS_CONTROL_STORAGE_KEY, -1 /* APPLICATION */);
    try {
      const models = JSON.parse(rawModels ?? "{}");
      if (isObject(models)) {
        this._setModelsControlManifest(models);
      }
    } catch (err) {
      this._storageService.remove(CHAT_MODELS_CONTROL_STORAGE_KEY, -1 /* APPLICATION */);
    }
    this._refreshChatControlData();
  }
  _refreshChatControlData() {
    if (this._chatControlDisposed) {
      return;
    }
    this._fetchChatControlData().catch((err) => this._logService.warn("Failed to fetch chat control data", err)).then(() => timeout(5 * 60 * 1e3)).then(() => this._refreshChatControlData());
  }
  async _fetchChatControlData() {
    this._logService.trace("[LM] Fetching chat control data from", this._chatControlUrl);
    let context2;
    try {
      context2 = await this._requestService.request({ type: "GET", url: this._chatControlUrl, callSite: "languageModels.fetchChatControlData" }, CancellationToken.None);
    } catch (err) {
      this._logService.warn("[LM] Failed to request chat control data", getErrorMessage(err));
      return;
    }
    if (context2.res.statusCode !== 200) {
      this._logService.warn(`[LM] Chat control data request failed with status ${context2.res.statusCode}`);
      return;
    }
    let result;
    try {
      result = await asJson(context2);
    } catch (err) {
      this._logService.warn("[LM] Failed to parse chat control response", getErrorMessage(err));
      return;
    }
    this._logService.trace("[LM] Received chat control response", result ? Object.keys(result) : "null");
    if (!result || result.version !== 1) {
      this._logService.warn("[LM] Unexpected chat control response version", result?.version);
      return;
    }
    const registry4 = result.restrictedChatParticipants;
    this._restrictedChatParticipants.set(registry4, void 0);
    this._storageService.store(CHAT_PARTICIPANT_NAME_REGISTRY_STORAGE_KEY, JSON.stringify(registry4), -1 /* APPLICATION */, 1 /* MACHINE */);
    if (result.models) {
      this._logService.trace("[LM] Updating models control manifest", { freeCount: Object.keys(result.models.free ?? {}).length, paidCount: Object.keys(result.models.paid ?? {}).length });
      this._setModelsControlManifest(result.models);
      this._storageService.store(CHAT_MODELS_CONTROL_STORAGE_KEY, JSON.stringify(result.models), -1 /* APPLICATION */, 1 /* MACHINE */);
    }
  }
  //#endregion
  dispose() {
    this._chatControlDisposed = true;
    this._store.dispose();
    this._providers.clear();
  }
};

LanguageModelsService = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, ILanguageModelsConfigurationService),
  __decorateParam(5, IQuickInputService),
  __decorateParam(6, ISecretStorageService),
  __decorateParam(7, IProductService),
  __decorateParam(8, IRequestService),
  __decorateParam(9, INotificationService),
  __decorateParam(10, IOpenerService),
  __decorateParam(11, ITelemetryService),
  __decorateParam(12, ICommandService)
], LanguageModelsService);
export { isLanguageModelVendorAbsenceConclusive, getByokProviderTelemetryName, getTextResponseFromStream, isILanguageModelChatSelector, getLanguageModelProviderDisplayName, getLanguageModelDisplayNameWithProvider, resolveProviderDeprecationLink, isAutoLanguageModel, canHideModel, createModelConfigurationActions, COPILOT_VENDOR_ID, BUILT_IN_BYOK_VENDOR_IDS, THIRD_PARTY_PROVIDER_TELEMETRY_NAME, BUILT_IN_BYOK_EXTENSION_IDS, ILanguageModelChatMetadata, ILanguageModelsService, languageModelChatProviderType, languageModelChatProviderExtensionPoint, CHAT_MODEL_RECENTLY_USED_STORAGE_KEY, CHAT_MODEL_PINNED_STORAGE_KEY, CHAT_MODEL_VISIBILITY_STORAGE_KEY, AUTO_MODEL_IDENTIFIER, AUTO_RAW_MODEL_ID, CHAT_PARTICIPANT_NAME_REGISTRY_STORAGE_KEY, CHAT_MODELS_CONTROL_STORAGE_KEY, LanguageModelsService };
