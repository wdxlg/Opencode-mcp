// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/common/chatSelectedModel.ts
import { ChatContextKeys } from "./module-0965.mjs";


// src/vs/workbench/contrib/chat/common/chatSelectedModel.ts
var SELECTED_MODEL_STORAGE_KEY_PREFIX = "chat.currentLanguageModel.";

var SELECTED_MODEL_STORAGE_SCOPE = 0 /* PROFILE */;

var SELECTED_MODEL_STORAGE_TARGET = 0 /* USER */;

function getSelectedModelStorageKey(location2, modelTarget) {
  if (modelTarget) {
    return `${SELECTED_MODEL_STORAGE_KEY_PREFIX}${location2}.${modelTarget}`;
  }
  return `${SELECTED_MODEL_STORAGE_KEY_PREFIX}${location2}`;
}

function storeSelectedModel(storageService, location2, modelTarget, identifier2) {
  storageService.store(getSelectedModelStorageKey(location2, modelTarget), identifier2, SELECTED_MODEL_STORAGE_SCOPE, SELECTED_MODEL_STORAGE_TARGET);
}

function getStoredSelectedModel(storageService, location2, modelTarget) {
  const key3 = getSelectedModelStorageKey(location2, modelTarget);
  const isDefaultKey = `${key3}.isDefault`;
  const identifier2 = storageService.get(key3, SELECTED_MODEL_STORAGE_SCOPE);
  if (identifier2) {
    const wasAutomaticDefault2 = storageService.getBoolean(isDefaultKey, SELECTED_MODEL_STORAGE_SCOPE);
    storageService.remove(isDefaultKey, SELECTED_MODEL_STORAGE_SCOPE);
    if (wasAutomaticDefault2) {
      storageService.remove(key3, SELECTED_MODEL_STORAGE_SCOPE);
      return void 0;
    }
    return identifier2;
  }
  const legacyIdentifier = storageService.get(key3, -1 /* APPLICATION */);
  if (!legacyIdentifier) {
    return void 0;
  }
  const wasAutomaticDefault = storageService.getBoolean(isDefaultKey, -1 /* APPLICATION */, true);
  storageService.remove(key3, -1 /* APPLICATION */);
  storageService.remove(isDefaultKey, -1 /* APPLICATION */);
  if (wasAutomaticDefault) {
    return void 0;
  }
  storeSelectedModel(storageService, location2, modelTarget, legacyIdentifier);
  return legacyIdentifier;
}

function getSelectedModelIdentifier(contextKeyService, storageService) {
  const contextKeyModelId = contextKeyService.getContextKeyValue(ChatContextKeys.chatModelId.key);
  if (contextKeyModelId) {
    return contextKeyModelId;
  }
  return getPersistedSelectedModelIdentifier(contextKeyService, storageService);
}

function getPersistedSelectedModelIdentifier(contextKeyService, storageService) {
  const location2 = contextKeyService.getContextKeyValue(ChatContextKeys.location.key) ?? "panel";
  const sessionType = contextKeyService.getContextKeyValue(ChatContextKeys.chatSessionType.key) ?? "";
  const candidateKeys = sessionType ? [sessionType, void 0] : [void 0];
  for (const modelTarget of candidateKeys) {
    const persisted = getStoredSelectedModel(storageService, location2, modelTarget);
    if (persisted) {
      return persisted;
    }
  }
  return void 0;
}

function isByokModel(metadata) {
  return metadata.isBYOK === true || metadata.byokModelIdentifier !== void 0;
}
export { getSelectedModelStorageKey, storeSelectedModel, getStoredSelectedModel, getSelectedModelIdentifier, getPersistedSelectedModelIdentifier, isByokModel, SELECTED_MODEL_STORAGE_KEY_PREFIX, SELECTED_MODEL_STORAGE_SCOPE, SELECTED_MODEL_STORAGE_TARGET };
