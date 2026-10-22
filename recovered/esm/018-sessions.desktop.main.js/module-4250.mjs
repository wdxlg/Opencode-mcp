// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostLanguageModelProvider.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { readAgentModelPricingMeta } from "./module-4249.mjs";
import { AUTO_RAW_MODEL_ID, ILanguageModelChatMetadata } from "./module-0968.mjs";
import { localize } from "./module-0001.mjs";
import { readAgentModelByokIdentifier } from "./module-1761.mjs";
import { nullExtensionDescription } from "./module-0889.mjs";
import { readAgentModelGroupId, readAgentModelSourceId } from "./module-2161.mjs";


// src/vs/workbench/contrib/chat/browser/agentSessions/agentHost/agentHostLanguageModelProvider.ts
function agentHostProviderSupportsAutoModel(provider) {
  return provider === "copilotcli";
}

var AgentHostLanguageModelProvider = class _AgentHostLanguageModelProvider extends Disposable {
  constructor(_sessionType, _vendor) {
    super();
    this._sessionType = _sessionType;
    this._vendor = _vendor;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._models = [];
  }
  /**
   * Called by {@link AgentHostContribution} when models change in root state.
   */
  updateModels(models) {
    this._models = models;
    this._onDidChange.fire();
  }
  async provideLanguageModelChatInfo(_options, _token) {
    return this._models.filter((m) => m.policyState !== "disabled").map((m) => {
      const pricing = readAgentModelPricingMeta(m);
      const multiplierNumeric = pricing.multiplierNumeric;
      const isAuto = m.id === AUTO_RAW_MODEL_ID;
      const discountPercent = pricing.discountPercent;
      const hasDiscount = typeof discountPercent === "number" && discountPercent > 0 && discountPercent <= 100;
      const detail2 = isAuto && hasDiscount ? localize(8971, null, discountPercent) : void 0;
      const tooltip = isAuto ? ILanguageModelChatMetadata.getAutoModelDescription(hasDiscount ? discountPercent : void 0) : void 0;
      const modelGroup = this._modelGroupFor(m);
      const byokModelIdentifier = readAgentModelByokIdentifier(m);
      return {
        identifier: `${this._vendor}:${m.id}`,
        metadata: {
          extension: nullExtensionDescription.identifier,
          name: m.name,
          id: m.id,
          vendor: this._vendor,
          version: "1.0",
          family: m.id,
          ...tooltip !== void 0 && { tooltip },
          ...detail2 !== void 0 && { detail: detail2 },
          maxInputTokens: m.maxPromptTokens ?? 0,
          maxOutputTokens: m.maxOutputTokens ?? 0,
          isDefaultForLocation: {},
          isUserSelectable: true,
          pricing: multiplierNumeric !== void 0 ? `${multiplierNumeric}x` : void 0,
          multiplierNumeric,
          inputCost: pricing.inputCost,
          cacheCost: pricing.cacheCost,
          cacheWriteCost: pricing.cacheWriteCost,
          outputCost: pricing.outputCost,
          longContextInputCost: pricing.longContextInputCost,
          longContextCacheCost: pricing.longContextCacheCost,
          longContextCacheWriteCost: pricing.longContextCacheWriteCost,
          longContextOutputCost: pricing.longContextOutputCost,
          priceCategory: pricing.priceCategory,
          category: pricing.category,
          promo: pricing.promo,
          targetChatSessionType: this._sessionType,
          // Group agent-host models in the picker by their upstream provider
          // (Copilot CLI, OpenAI, a 3p BYOK provider, …). All of a host's
          // models share one vendor, so without this they'd render as a single
          // undifferentiated bucket. Presentation-only; routing stays by vendor.
          ...modelGroup ? { modelGroup } : {},
          ...byokModelIdentifier !== void 0 && { byokModelIdentifier },
          capabilities: {
            vision: m.supportsVision ?? false,
            toolCalling: true,
            agentMode: true
          },
          configurationSchema: this._toLanguageModelConfigurationSchema(m.configSchema)
        }
      };
    });
  }
  _toLanguageModelConfigurationSchema(schema10) {
    if (!schema10) {
      return void 0;
    }
    return {
      type: schema10.type,
      required: schema10.required,
      properties: Object.fromEntries(Object.entries(schema10.properties).map(([key3, property]) => [key3, {
        type: property.type,
        title: property.title,
        description: property.description,
        default: property.default,
        enum: property.enum,
        enumItemLabels: property.enumLabels,
        enumDescriptions: property.enumDescriptions,
        readOnly: property.readOnly,
        group: _AgentHostLanguageModelProvider._groupForConfigKey(key3)
      }]))
    };
  }
  static _groupForConfigKey(key3) {
    switch (key3) {
      case "thinkingLevel":
        return "navigation";
      case "contextSize":
        return "tokens";
      default:
        return void 0;
    }
  }
  /**
   * Derives the picker group id for a model — the vendor its models are bucketed
   * under. A producer may pin the group id explicitly in `_meta` (e.g. Claude
   * stamps its transport vendor — `copilot`/`anthropic` — there while keeping
   * `provider` as the `claude` routing owner); that wins. Otherwise BYOK models
   * are surfaced by the agent host under the `vendor/[group/]id` selection id (see
   * `resolveByokSessionConfig`), so their upstream vendor is the id prefix; native
   * harness models have no prefix and group under their `provider` (the harness,
   * e.g. `copilotcli`). The picker resolves the display name from the vendor
   * registry — no name mapping lives here.
   */
  _modelGroupFor(model) {
    const explicitGroupId = readAgentModelGroupId(model);
    const slash = model.id.indexOf("/");
    const groupVendorId = explicitGroupId ?? (slash > 0 ? model.id.slice(0, slash) : model.provider);
    if (!groupVendorId) {
      return void 0;
    }
    const sourceId = readAgentModelSourceId(model);
    return { id: groupVendorId, ...sourceId !== void 0 && { sourceId } };
  }
  async sendChatRequest() {
    throw new Error("Agent-host models do not support direct chat requests");
  }
  async provideTokenCount() {
    return 0;
  }
};
export { agentHostProviderSupportsAutoModel, AgentHostLanguageModelProvider };
