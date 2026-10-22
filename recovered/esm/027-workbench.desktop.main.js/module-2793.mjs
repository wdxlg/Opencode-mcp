// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/defaultModelContribution.ts
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable } from "./module-0012.mjs";
import { ILanguageModelChatMetadata, ILanguageModelsService } from "./module-0967.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/workbench/contrib/chat/browser/defaultModelContribution.ts
var configurationRegistry11 = Registry.as(Extensions4.Configuration);

function createDefaultModelArrays(defaultEntryLabel2, defaultEntryDescription2) {
  return {
    modelIds: [""],
    modelLabels: [defaultEntryLabel2 ?? localize(11324, null)],
    modelDescriptions: [defaultEntryDescription2 ?? localize(11325, null)]
  };
}

var DefaultModelContribution = class extends Disposable {
  constructor(_arrays, _options, _languageModelsService, _logService) {
    super();
    this._arrays = _arrays;
    this._options = _options;
    this._languageModelsService = _languageModelsService;
    this._logService = _logService;
    this._register(_languageModelsService.onDidChangeLanguageModels(() => this._updateModelValues()));
    this._updateModelValues();
  }
  _updateModelValues() {
    const { modelIds, modelLabels, modelDescriptions } = this._arrays;
    const { configKey, configSectionId, logPrefix, filter: filter2, storageFormat, defaultEntryLabel: defaultEntryLabel2, defaultEntryDescription: defaultEntryDescription2 } = this._options;
    try {
      modelIds.length = 0;
      modelLabels.length = 0;
      modelDescriptions.length = 0;
      modelIds.push("");
      modelLabels.push(defaultEntryLabel2 ?? localize(11324, null));
      modelDescriptions.push(defaultEntryDescription2 ?? localize(11325, null));
      const models = [];
      const allModelIds = this._languageModelsService.getLanguageModelIds();
      for (const modelId of allModelIds) {
        try {
          const metadata = this._languageModelsService.lookupLanguageModel(modelId);
          if (metadata) {
            models.push({ identifier: modelId, metadata });
          } else {
            this._logService.warn(`${logPrefix} No metadata found for model ID: ${modelId}`);
          }
        } catch (e) {
          this._logService.error(`${logPrefix} Error looking up model ${modelId}:`, e);
        }
      }
      const vendors = this._languageModelsService.getVendors();
      const visibleVendors = new Set(vendors.map((vendor) => vendor.vendor));
      const supportedModels = models.filter((model) => {
        if (!visibleVendors.has(model.metadata.vendor)) {
          return false;
        }
        if (model.metadata?.isUserSelectable === false) {
          return false;
        }
        if (model.metadata?.targetChatSessionType !== void 0) {
          return false;
        }
        if (filter2 && !filter2(model.metadata)) {
          return false;
        }
        return true;
      });
      supportedModels.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));
      const vendorDisplayNames = /* @__PURE__ */ new Map();
      for (const vendor of vendors) {
        vendorDisplayNames.set(vendor.vendor, vendor.displayName);
      }
      const ambiguousVendorIds = /* @__PURE__ */ new Set();
      if (storageFormat === "vendorAndId") {
        const counts = /* @__PURE__ */ new Map();
        for (const model of models) {
          const key3 = `${model.metadata.vendor}/${model.metadata.id}`;
          counts.set(key3, (counts.get(key3) ?? 0) + 1);
        }
        for (const [key3, count2] of counts) {
          if (count2 > 1) {
            ambiguousVendorIds.add(key3);
          }
        }
      }
      for (const model of supportedModels) {
        try {
          const storedId = storageFormat === "vendorAndId" ? `${model.metadata.vendor}/${model.metadata.id}` : ILanguageModelChatMetadata.asQualifiedName(model.metadata);
          if (ambiguousVendorIds.has(storedId)) {
            this._logService.trace(`${logPrefix} Skipping model '${model.metadata.name}' (${storedId}): key collides with another registered model.`);
            continue;
          }
          const vendorDisplayName = vendorDisplayNames.get(model.metadata.vendor);
          if (!vendorDisplayName) {
            this._logService.trace(`${logPrefix} No vendor descriptor for '${model.metadata.vendor}' (model '${model.metadata.id}'); falling back to vendor id in label.`);
          }
          modelIds.push(storedId);
          modelLabels.push(localize(11326, null, model.metadata.name, vendorDisplayName ?? model.metadata.vendor));
          modelDescriptions.push(model.metadata.tooltip ?? model.metadata.detail ?? "");
        } catch (e) {
          this._logService.error(`${logPrefix} Error adding model ${model.metadata.name}:`, e);
        }
      }
      if (configSectionId) {
        configurationRegistry11.notifyConfigurationSchemaUpdated({
          id: configSectionId,
          properties: {
            [configKey]: {}
          }
        });
      }
    } catch (e) {
      this._logService.error(`${logPrefix} Error updating model values:`, e);
    }
  }
};

DefaultModelContribution = __decorateClass([
  __decorateParam(2, ILanguageModelsService),
  __decorateParam(3, ILogService)
], DefaultModelContribution);
export { createDefaultModelArrays, configurationRegistry11, DefaultModelContribution };
