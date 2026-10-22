// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/sessionModelPickerState.ts



// src/vs/sessions/contrib/chat/browser/sessionModelPickerState.ts
var DEFAULT_MODEL_PICKER_OPTIONS = {
  useGroupedModelPicker: true,
  showFeatured: true,
  showUnavailableFeatured: false,
  showManageModelsAction: false,
  showAutoModel: true
};

function normalizeModelPickerOptions(options3) {
  return {
    ...DEFAULT_MODEL_PICKER_OPTIONS,
    ...options3,
    showAutoModel: options3?.showAutoModel ?? true
  };
}

function hasSelectableModel(models, options3) {
  return models.length > 0 || options3.showAutoModel;
}

function hasSendableModelSelection(state) {
  return state.hasSelectableModel && (!state.pendingSelection || state.options.showAutoModel);
}

var EMPTY_MODEL_SELECTION_STATE = {
  currentModel: void 0,
  pendingSelection: void 0,
  models: [],
  options: normalizeModelPickerOptions(void 0),
  hasSelectableModel: false
};

function createModelSelectionState(models, options3, currentModel, pendingSelection) {
  const displayedModel = currentModel && models.some((model) => model.identifier === currentModel.identifier) ? currentModel : void 0;
  return {
    models,
    options: options3,
    hasSelectableModel: hasSelectableModel(models, options3),
    // Nothing is shown while pending: the only correct answer is not available yet.
    currentModel: pendingSelection ? void 0 : displayedModel,
    pendingSelection
  };
}
export { normalizeModelPickerOptions, hasSelectableModel, hasSendableModelSelection, createModelSelectionState, DEFAULT_MODEL_PICKER_OPTIONS, EMPTY_MODEL_SELECTION_STATE };
