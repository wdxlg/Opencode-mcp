// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/modelPicker/modelPickerPresentation.ts
import { isAutoLanguageModel } from "./module-0967.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/modelPicker/modelPickerPresentation.ts
function isAutoModel(model) {
  return isAutoLanguageModel(model);
}

function isMultiplierPricing(model) {
  return model.metadata.multiplierNumeric !== void 0;
}

function getPriceCategoryLabel(priceCategory) {
  if (typeof priceCategory !== "string" || priceCategory.length === 0) {
    return void 0;
  }
  switch (priceCategory) {
    case "low":
      return localize(12611, null);
    case "medium":
      return localize(12612, null);
    case "high":
      return localize(12610, null);
    case "very_high":
      return localize(12614, null);
    default:
      return localize(12613, null, priceCategory.charAt(0).toUpperCase() + priceCategory.slice(1));
  }
}

function modelPickerRequiresSetup(context2) {
  return context2.entitlement === 3 /* Available */ || context2.entitlement === 1 /* Unknown */ && !context2.anonymous && !context2.hasByokModels;
}

function getModelPickerUnavailableReason(context2) {
  if (!context2.trustInitialized) {
    return void 0;
  }
  if (!context2.trusted) {
    return "restricted" /* Restricted */;
  }
  const live = context2.liveModelIds instanceof Set ? context2.liveModelIds : new Set(context2.liveModelIds);
  if (context2.pickerModels.some((model) => live.has(model.identifier))) {
    return void 0;
  }
  return context2.requiresSetup ? "setupRequired" /* SetupRequired */ : void 0;
}

function shouldShowCacheBreakHint(context2) {
  if (context2.dismissed || !context2.cacheWarm || context2.noModelsAvailable) {
    return false;
  }
  return !(context2.excludeAutoModel && context2.selectedModelIsAuto);
}
export { isAutoModel, isMultiplierPricing, getPriceCategoryLabel, modelPickerRequiresSetup, getModelPickerUnavailableReason, shouldShowCacheBreakHint };
