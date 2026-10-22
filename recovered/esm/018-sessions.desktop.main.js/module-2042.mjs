// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/modelSelection.ts
import { isLanguageModelVendorAbsenceConclusive } from "./module-0968.mjs";
import { isAgentHostTarget } from "./module-0961.mjs";


// src/vs/workbench/contrib/chat/common/modelSelection.ts
function resolveModelIdentifier(models, identifier2, isAbsenceConclusive) {
  if (!identifier2) {
    return { kind: "notRequested" };
  }
  const model = models.find((model2) => model2.identifier === identifier2);
  if (model) {
    return { kind: "available", model };
  }
  return isAbsenceConclusive ? { kind: "unavailable", identifier: identifier2 } : { kind: "pending", identifier: identifier2 };
}

function resolveModelIdentifierFromCatalog(models, identifier2, vendorResolution) {
  if (!identifier2) {
    return { kind: "notRequested" };
  }
  const separator2 = identifier2.search(/[/:]/);
  const vendor = separator2 === -1 ? void 0 : identifier2.substring(0, separator2);
  const hasLive = vendor ? vendorResolution.hasLiveModels(vendor) : false;
  const isAbsenceConclusive = !vendor || isLanguageModelVendorAbsenceConclusive(
    vendor,
    hasLive,
    vendorResolution.hasResolved(vendor)
  ) && (hasLive || !isAgentHostTarget(vendor));
  return resolveModelIdentifier(models, identifier2, isAbsenceConclusive);
}

function getRegisteredLanguageModels(languageModelsService) {
  return languageModelsService.getLanguageModelIds().map((identifier2) => {
    const metadata = languageModelsService.lookupLanguageModel(identifier2);
    return metadata ? { identifier: identifier2, metadata } : void 0;
  }).filter((model) => model !== void 0);
}

function hasOwnLiveModels(models, vendor) {
  return models.some((model) => model.metadata.vendor === vendor && model.metadata.byokModelIdentifier === void 0);
}

function resolveModelIdentifierFromLanguageModels(models, identifier2, languageModelsService, allModels) {
  return resolveModelIdentifierFromCatalog(models, identifier2, {
    hasLiveModels: (vendor) => hasOwnLiveModels(allModels, vendor),
    hasResolved: (vendor) => languageModelsService.hasResolvedVendor(vendor)
  });
}

var AUTO_MODEL_ID = "auto";

function compareModelVersions(a, b) {
  const rawA = a ?? "";
  const rawB = b ?? "";
  const segmentsA = rawA.match(/\d+/g)?.map(Number) ?? [];
  const segmentsB = rawB.match(/\d+/g)?.map(Number) ?? [];
  const length = Math.max(segmentsA.length, segmentsB.length);
  for (let index2 = 0; index2 < length; index2++) {
    const numberA = segmentsA[index2] ?? 0;
    const numberB = segmentsB[index2] ?? 0;
    if (numberA !== numberB) {
      return numberA - numberB;
    }
  }
  return rawA.localeCompare(rawB);
}

function resolveConfiguredModel(configuredValue, models) {
  const value2 = configuredValue?.trim().toLowerCase();
  if (!value2) {
    return void 0;
  }
  if (value2 === AUTO_MODEL_ID) {
    return models.find((model) => model.metadata.id?.trim().toLowerCase() === AUTO_MODEL_ID);
  }
  const byId = models.find((model) => model.metadata.id?.trim().toLowerCase() === value2);
  if (byId) {
    return byId;
  }
  const family = models.filter((model) => model.metadata.family?.trim().toLowerCase() === value2);
  return family.length > 0 ? family.reduce((latest, candidate) => compareModelVersions(candidate.metadata.version, latest.metadata.version) > 0 ? candidate : latest) : void 0;
}

function isRestoredModelReason(reason) {
  return reason === "sessionRestore" /* SessionRestore */ || reason === "restoredChoice" /* RestoredChoice */;
}

function isInConversationModelChoice(reason) {
  return reason === "userSelection" /* UserSelection */ || reason === "programmaticSelection" /* ProgrammaticSelection */ || reason === "restoredChoice" /* RestoredChoice */;
}

function resolveInitialModelSelection(input) {
  if (input.configuredModel) {
    return { kind: "apply", model: input.configuredModel, reason: "configuredDefault" /* ConfiguredDefault */ };
  }
  if (input.desiredModelResolution.kind === "available") {
    return { kind: "apply", model: input.desiredModelResolution.model, reason: input.desiredReason };
  }
  if (input.desiredModelResolution.kind === "pending") {
    return { kind: "pending", selection: { reference: input.desiredModelResolution.identifier } };
  }
  return input.fallbackModel ? { kind: "apply", model: input.fallbackModel, reason: input.fallbackReason } : { kind: "none" };
}
export { resolveModelIdentifier, resolveModelIdentifierFromCatalog, getRegisteredLanguageModels, hasOwnLiveModels, resolveModelIdentifierFromLanguageModels, compareModelVersions, resolveConfiguredModel, isRestoredModelReason, isInConversationModelChoice, resolveInitialModelSelection, AUTO_MODEL_ID };
