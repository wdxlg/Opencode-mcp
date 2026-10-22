// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/chatInputModelUtils.ts
import { ILanguageModelChatMetadata, isLanguageModelVendorAbsenceConclusive } from "./module-0967.mjs";
import { getChatSessionType, isUntitledChatSession } from "./module-0961.mjs";
import { localChatSessionType } from "./module-0960.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/chatInputModelUtils.ts
function filterModelsForSession(models, sessionType, currentModeKind, location2) {
  if (sessionType && sessionType !== "local" && hasModelsTargetingSession(models, sessionType)) {
    return models.filter(
      (entry) => entry.metadata?.targetChatSessionType === sessionType && entry.metadata?.isUserSelectable !== false
    );
  }
  return models.filter(
    (entry) => !entry.metadata?.targetChatSessionType && entry.metadata?.isUserSelectable !== false && isModelSupportedForMode(entry, currentModeKind) && isModelSupportedForInlineChat(entry, location2)
  );
}

function isModelSupportedForMode(model, currentModeKind) {
  if (currentModeKind === "agent" /* Agent */) {
    return ILanguageModelChatMetadata.suitableForAgentMode(model.metadata);
  }
  return true;
}

function isModelSupportedForInlineChat(model, location2) {
  if (location2 !== "editor" /* EditorInline */) {
    return true;
  }
  return !!model.metadata.capabilities?.toolCalling;
}

function hasModelsTargetingSession(allModels, sessionType) {
  if (!sessionType) {
    return false;
  }
  return allModels.some((m) => m.metadata.targetChatSessionType === sessionType);
}

function isModelValidForSession(model, allModels, sessionType) {
  if (hasModelsTargetingSession(allModels, sessionType)) {
    return model.metadata.targetChatSessionType === sessionType;
  }
  return !model.metadata.targetChatSessionType;
}

var getAgentHostByokManageModelsIdentifier = ILanguageModelChatMetadata.getAgentHostByokManageModelsIdentifier;

function isModelHiddenInPicker(model, isModelHidden) {
  if (isModelHidden(model.identifier)) {
    return true;
  }
  const manageModelsIdentifier = getAgentHostByokManageModelsIdentifier(model.metadata);
  return manageModelsIdentifier !== void 0 && isModelHidden(manageModelsIdentifier);
}

function shouldDropAgnosticDraftModel(draftModel, allModels, sessionType) {
  return !!draftModel && !isModelValidForSession(draftModel, allModels, sessionType);
}

function isNewConversation(sessionResource, hasNoRequests) {
  return hasNoRequests && (getChatSessionType(sessionResource) === localChatSessionType || isUntitledChatSession(sessionResource));
}

function isSessionStarted(hasBoundModel, hasRequests) {
  return !hasBoundModel || hasRequests;
}

function shouldRestorePerTypeModelOnSessionSwitch(isEmpty, sessionOwnsPool, hadIncomingModel) {
  return isEmpty && sessionOwnsPool && !hadIncomingModel;
}

function findBestMatchingModel(previous, pool) {
  if (!previous || pool.length === 0) {
    return void 0;
  }
  const id2 = previous.metadata.id?.trim().toLowerCase();
  const family = previous.metadata.family?.trim().toLowerCase();
  const name = previous.metadata.name?.trim().toLowerCase();
  return (id2 ? pool.find((m) => m.metadata.id?.trim().toLowerCase() === id2) : void 0) ?? (family ? pool.find((m) => m.metadata.family?.trim().toLowerCase() === family) : void 0) ?? (name ? pool.find((m) => m.metadata.name?.trim().toLowerCase() === name) : void 0);
}

function shouldResetModelToDefault(currentModel, availableModels, isModelSupportedHere, allModels, sessionType) {
  if (!currentModel) {
    return false;
  }
  if (!availableModels.some((m) => m.identifier === currentModel.identifier)) {
    return true;
  }
  if (!isModelSupportedHere(currentModel)) {
    return true;
  }
  if (!isModelValidForSession(currentModel, allModels, sessionType)) {
    return true;
  }
  return false;
}

function resolveModelFromSyncState(stateModel, currentModel, allModels, sessionType, isModelSupportedHere) {
  if (!isModelValidForSession(stateModel, allModels, sessionType)) {
    return { action: "default" };
  }
  if (currentModel && currentModel.identifier === stateModel.identifier) {
    return { action: "keep" };
  }
  if (isModelSupportedHere && !isModelSupportedHere(stateModel)) {
    return { action: "default" };
  }
  return { action: "apply" };
}

function mergeModelsWithCache(liveModels, cachedModels, contributedVendors, resolvedVendors) {
  if (contributedVendors.size === 0 && liveModels.length === 0) {
    return cachedModels;
  }
  const liveVendors = new Set(liveModels.map((m) => m.metadata.vendor));
  const usableCached = cachedModels.filter((m) => {
    const vendor = m.metadata.vendor;
    if (!contributedVendors.has(vendor) || liveVendors.has(vendor)) {
      return false;
    }
    if (isLanguageModelVendorAbsenceConclusive(vendor, liveVendors.has(vendor), resolvedVendors?.has(vendor) ?? false)) {
      return false;
    }
    return true;
  });
  return [...liveModels, ...usableCached];
}

function shouldResetOnModelListChange(currentModelId, availableModels) {
  if (!currentModelId) {
    return true;
  }
  return !availableModels.some((m) => m.identifier === currentModelId);
}

function resolveEditedRequestSelection(edited, composer) {
  return edited ?? composer;
}
export { filterModelsForSession, isModelSupportedForMode, isModelSupportedForInlineChat, hasModelsTargetingSession, isModelValidForSession, isModelHiddenInPicker, shouldDropAgnosticDraftModel, isNewConversation, isSessionStarted, shouldRestorePerTypeModelOnSessionSwitch, findBestMatchingModel, shouldResetModelToDefault, resolveModelFromSyncState, mergeModelsWithCache, shouldResetOnModelListChange, resolveEditedRequestSelection, getAgentHostByokManageModelsIdentifier };
