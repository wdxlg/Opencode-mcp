// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/chatInputModelSelectionController.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { NullChatModelSelectionDiagnostics } from "./module-2049.mjs";
import { observableValue } from "./module-0048.mjs";
import { isInConversationModelChoice, isRestoredModelReason, resolveConfiguredModel, resolveInitialModelSelection, resolveModelIdentifier } from "./module-2048.mjs";
import { findBestMatchingModel, resolveModelFromSyncState, shouldResetModelToDefault, shouldResetOnModelListChange } from "./module-2036.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/chatInputModelSelectionController.ts
var ChatInputModelSelectionController = class extends Disposable {
  constructor(_runtime, _diagnostics = NullChatModelSelectionDiagnostics) {
    super();
    this._runtime = _runtime;
    this._diagnostics = _diagnostics;
    this._currentModel = observableValue(this, void 0);
    this.currentModel = this._currentModel;
    const subscribe = this._runtime.subscribeToModelChanges;
    if (subscribe) {
      this._register(subscribe(() => this.reconcileModelListChange(this._pool())));
    }
    this._register(toDisposable(() => this._clearPendingProgrammaticSelection()));
  }
  get selectionReason() {
    return this._selectionReason;
  }
  /** Drops what spoke for the outgoing conversation, so it is not read as the incoming one's. */
  beginConversationSwitch() {
    this._selectionReason = void 0;
    this._clearPendingProgrammaticSelection();
  }
  /**
   * True while the remembered model is not selectable, i.e. whatever is currently selected is a
   * stand-in that {@link _restoreRememberedModel} will replace once the catalog offers the real
   * one. Callers use this to avoid acting on a selection that is about to change.
   */
  isAwaitingRememberedModel() {
    const modelId = this._intendedModel?.modelId;
    return !!modelId && !this._pool().some((model) => model.identifier === modelId);
  }
  hasPendingProgrammaticSelection() {
    return !!this._pendingProgrammaticSelection;
  }
  /** A user action claims the conversation and rolls back if `apply` throws; anything else does not. */
  applySelection(model, apply2, isUserAction, rollbackOnError = false) {
    if (!isUserAction) {
      this._display(model);
      apply2();
      return;
    }
    this._clearPendingProgrammaticSelection();
    const previousModel = this._currentModel.get();
    const previousReason = this._selectionReason;
    const previousRememberedSelection = this._intendedModel;
    this._currentModel.set(model, void 0);
    this._selectionReason = "userSelection" /* UserSelection */;
    this._remember({ modelId: model.identifier, model, reason: "userSelection" /* UserSelection */ });
    this._diagnostics.report("explicit-selection", { model: model.identifier }, "info");
    try {
      apply2();
      this._diagnostics.report("explicit-selection-applied", { model: model.identifier }, "info");
    } catch (error) {
      if (rollbackOnError) {
        this._currentModel.set(previousModel, void 0);
        this._selectionReason = previousReason;
        this._remember(previousRememberedSelection);
      }
      this._diagnostics.report("explicit-selection-failed", { model: model.identifier, error: String(error) }, "error");
      throw error;
    }
  }
  applyProgrammaticSelection(model) {
    this._clearPendingProgrammaticSelection();
    this._remember({ modelId: model.identifier, model, reason: "programmaticSelection" /* ProgrammaticSelection */ });
    this._applyModel(model, "programmaticSelection" /* ProgrammaticSelection */);
  }
  requestProgrammaticSelection(resolveModel, conversationKey) {
    this._clearPendingProgrammaticSelection();
    this._selectionReason = "programmaticSelection" /* ProgrammaticSelection */;
    return new Promise((resolve3) => {
      let complete = resolve3;
      this._pendingProgrammaticSelection = {
        resolveModel,
        conversationKey,
        complete: (applied) => {
          complete(applied);
          complete = () => {
          };
        }
      };
      this._reconcilePendingProgrammaticSelection();
    });
  }
  initialize(rememberedModelId) {
    this._clearPendingProgrammaticSelection();
    if (!this._intendedModel) {
      this._remember(rememberedModelId ? { modelId: rememberedModelId, reason: "remembered" /* Remembered */ } : void 0);
    }
    const resolveSelection = () => {
      const configuredModelValue = this._runtime.getConfiguredModelValue();
      const models = this._pool();
      const configuredModel = this._runtime.isEmpty() ? resolveConfiguredModel(configuredModelValue, models) : void 0;
      const resolution = resolveModelIdentifier(models, rememberedModelId, false);
      return resolveInitialModelSelection({
        configuredModel,
        desiredModelResolution: resolution,
        desiredReason: "remembered" /* Remembered */,
        fallbackModel: this._defaultModel(models),
        fallbackReason: "firstAvailable" /* FirstAvailable */
      });
    };
    const selection = resolveSelection();
    this._reportInitialization(this._runtime.getConfiguredModelValue(), rememberedModelId, selection);
    if (selection.kind === "apply") {
      this._applyModel(selection.model, selection.reason);
      this.ensureCurrentModelSupported();
    } else if (selection.kind === "pending") {
      const fallbackModel = this._defaultModel(this._pool());
      if (fallbackModel) {
        this._applyModel(fallbackModel, "firstAvailable" /* FirstAvailable */);
      }
    }
  }
  /** Takes the default and forgets the preference it overrides, which would otherwise come back. */
  resetToDefault(sessionType = this._runtime.getCurrentSessionType()) {
    this._clearPendingProgrammaticSelection();
    this._remember(void 0);
    this.selectDefault(sessionType);
  }
  ensureCurrentModelSupported() {
    const currentModel = this._currentModel.get();
    const sessionType = this._runtime.getCurrentSessionType();
    const models = this._pool(sessionType);
    const willReset = shouldResetModelToDefault(currentModel, models, this._runtime.isModelSupportedHere, this._runtime.getAllModels(), sessionType);
    this._diagnostics.report("compatibility-check", {
      currentModel: currentModel?.identifier,
      sessionType,
      willReset
    }, willReset ? "info" : "debug");
    if (willReset) {
      this.selectDefault(sessionType);
    }
  }
  selectDefault(sessionType = this._runtime.getCurrentSessionType()) {
    if (sessionType && this._runtime.isAwaitingSessionModels?.(sessionType)) {
      return;
    }
    const models = this._pool(sessionType);
    const configuredModel = resolveConfiguredModel(this._runtime.getConfiguredModelValue(), models);
    const defaultModel = configuredModel ?? this._defaultModel(models);
    this._diagnostics.report("select-default", {
      configuredModel: configuredModel?.identifier,
      defaultModel: defaultModel?.identifier,
      currentModel: this._currentModel.get()?.identifier
    }, defaultModel ? "info" : "debug");
    if (!defaultModel) {
      return;
    }
    const reason = this.hasPendingProgrammaticSelection() ? this._selectionReason : configuredModel ? "configuredDefault" /* ConfiguredDefault */ : "firstAvailable" /* FirstAvailable */;
    this._applyModel(defaultModel, reason);
  }
  /**
   * What `chat.defaultModel` would seed this conversation with, or nothing if it would not.
   *
   * @param conversationModelReason How the conversation's own model stands, for a caller deciding
   * whether to wait for one this controller has not been given yet. Omit to use what it applied.
   */
  configuredDefaultToSeed(conversationModelReason) {
    const claimedByConversation = conversationModelReason !== void 0 ? isInConversationModelChoice(conversationModelReason) : isInConversationModelChoice(this._selectionReason) || isInConversationModelChoice(this._intendedModel?.reason) || !!this._pendingProgrammaticSelection;
    if (!this._runtime.isEmpty() || claimedByConversation) {
      return void 0;
    }
    return resolveConfiguredModel(this._runtime.getConfiguredModelValue(), this._pool());
  }
  applyConfiguredDefault() {
    const configuredModel = this.configuredDefaultToSeed();
    if (!configuredModel) {
      return false;
    }
    if (configuredModel.identifier === this._currentModel.get()?.identifier) {
      if (this._selectionReason !== "configuredDefault" /* ConfiguredDefault */) {
        this._selectionReason = "configuredDefault" /* ConfiguredDefault */;
        return true;
      }
      return false;
    }
    this._applyModel(configuredModel, "configuredDefault" /* ConfiguredDefault */);
    this.ensureCurrentModelSupported();
    return true;
  }
  reconcileModelListChange(models) {
    if (this.applyConfiguredDefault() || this._reconcilePendingProgrammaticSelection() || this._restoreRememberedModel()) {
      return;
    }
    const currentModel = this._currentModel.get();
    const declaredDefault = this._runtime.getDeclaredDefaultModel(models);
    if (this._runtime.isEmpty() && this._selectionReason === "firstAvailable" /* FirstAvailable */ && declaredDefault && currentModel?.identifier !== declaredDefault.identifier) {
      this._applyModel(declaredDefault, "firstAvailable" /* FirstAvailable */);
      return;
    }
    if (!shouldResetOnModelListChange(currentModel?.identifier, [...models])) {
      return;
    }
    const match2 = findBestMatchingModel(currentModel, models);
    if (match2) {
      this._applyModel(match2, this._selectionReason);
    } else {
      this.selectDefault();
    }
  }
  /**
   * Reclaims the conversation's intended model whenever the catalog offers it, however late.
   * Catalogs publish in waves, so anything shown meanwhile is a stand-in. Read from the bound
   * conversation, so another conversation's choice is unreachable here.
   */
  _restoreRememberedModel() {
    const remembered = this._intendedModel;
    if (!remembered || this._currentModel.get()?.identifier === remembered.modelId) {
      return false;
    }
    if (this._selectionReason === "configuredDefault" /* ConfiguredDefault */ && !isInConversationModelChoice(remembered.reason)) {
      return false;
    }
    const pool = this._pool();
    const exact = pool.find((model2) => model2.identifier === remembered.modelId);
    const model = exact ?? (isRestoredModelReason(remembered.reason) ? findBestMatchingModel(remembered.model, pool) : void 0);
    if (!model || !exact && this._currentModel.get()?.identifier === model.identifier) {
      return false;
    }
    this._diagnostics.report("restore-remembered-model", { model: model.identifier, remembered: remembered.modelId, reason: remembered.reason }, "info");
    if (exact && remembered.configuration) {
      this._runtime.restoreModelConfiguration?.(remembered.modelId, remembered.configuration);
    }
    this._applyModel(model, remembered.reason);
    return true;
  }
  /** Adopts the model the conversation carries. `restoredAs` says whether it is a choice. */
  syncFromConversationState(desiredModel, modelConfiguration, sessionType, conversationKey, isRemoteEdit = false, restoredAs = "sessionRestore" /* SessionRestore */) {
    const boundConversationKey = this._runtime.getBoundConversationKey();
    if (boundConversationKey !== void 0 && boundConversationKey !== conversationKey) {
      this._diagnostics.report("conversation-restore-stale-ignored", {
        desiredModel: desiredModel.identifier,
        conversation: conversationKey,
        boundConversation: boundConversationKey
      }, "info");
      return;
    }
    const keepsAwaitedModel = this._keepsAwaitedModel(desiredModel, restoredAs, isRemoteEdit);
    if (keepsAwaitedModel) {
      this._diagnostics.report("conversation-restore-keeps-awaited-model", {
        desiredModel: desiredModel.identifier,
        awaitingModel: this._intendedModel?.modelId
      }, "info");
    }
    if (keepsAwaitedModel) {
      this._diagnostics.report("conversation-restore-keeps-awaited-model", {
        desiredModel: desiredModel.identifier,
        awaitingModel: this._intendedModel?.modelId
      }, "info");
    }
    const allModels = this._runtime.getAllModels();
    const currentModel = this._currentModel.get();
    const syncResult = resolveModelFromSyncState(desiredModel, currentModel, allModels, sessionType, this._runtime.isModelSupportedHere);
    this._diagnostics.report("conversation-restore", {
      desiredModel: desiredModel.identifier,
      currentModel: currentModel?.identifier,
      sessionType,
      action: syncResult.action
    }, syncResult.action === "keep" ? "debug" : "info");
    if (syncResult.action === "apply" || syncResult.action === "keep") {
      this._applySessionRestore(desiredModel, syncResult.action === "apply", modelConfiguration, restoredAs, keepsAwaitedModel);
      return;
    }
    if (!keepsAwaitedModel) {
      this._rememberOnBoundConversation(desiredModel, modelConfiguration, conversationKey, restoredAs);
    }
    this._clearPendingProgrammaticSelection();
    const pool = this._pool(sessionType);
    const match2 = findBestMatchingModel(desiredModel, pool) ?? findBestMatchingModel(currentModel, pool);
    if (match2) {
      this._applyModel(match2, restoredAs);
    } else {
      this.selectDefault(sessionType);
    }
  }
  /**
   * Whether an arriving carried-over model must leave alone the model the conversation is waiting
   * for. True while the conversation awaits a model the pool cannot offer, the arrival is not
   * that model, and one of:
   *
   * - the awaited model is one the conversation answered for, so a model merely carried onto it
   *   cannot speak for it — this is what a surface that records where a model came from can say;
   * - the arrival is the stand-in currently on screen, i.e. this controller put it there and the
   *   conversation is only echoing it back — what a surface whose draft state cannot say where a
   *   model came from has to fall back on.
   *
   * Anything else is a real statement about the conversation and supersedes the wait. A remote
   * edit is a peer answering for the conversation, so it always does.
   */
  _keepsAwaitedModel(desiredModel, restoredAs, isRemoteEdit) {
    const awaited = this._intendedModel;
    if (isRemoteEdit || restoredAs !== "sessionRestore" /* SessionRestore */ || !awaited || awaited.modelId === desiredModel.identifier || !this.isAwaitingRememberedModel()) {
      return false;
    }
    return isInConversationModelChoice(awaited.reason) || desiredModel.identifier === this._currentModel.get()?.identifier;
  }
  /** Replaces the bound conversation's intended model. */
  _remember(selection) {
    this._runtime.getIntentHolder().setIntendedModel(selection);
  }
  /** The intended model of the conversation this input is currently bound to. */
  get _intendedModel() {
    return this._runtime.getIntentHolder().intendedModel;
  }
  /** The model to fall back to: the surface's declared default, else the first on offer. */
  _defaultModel(models) {
    return this._runtime.getDeclaredDefaultModel(models) ?? models[0];
  }
  /** The models selectable for the bound session right now. */
  _pool(sessionType = this._runtime.getCurrentSessionType()) {
    return this._runtime.getModels(sessionType);
  }
  /** Records the model to reclaim, with how it stands — forgetting that lets the default claim it. */
  _rememberOnBoundConversation(model, configuration2, conversationKey, restoredAs) {
    if (this._runtime.getBoundConversationKey() !== conversationKey) {
      return;
    }
    this._remember({ modelId: model.identifier, model, reason: restoredAs, configuration: configuration2 });
  }
  revalidateForSessionType(initialize2) {
    const previousModel = this._currentModel.get();
    this._selectionReason = void 0;
    initialize2();
    const restoredModel = this._currentModel.get();
    const sessionType = this._runtime.getCurrentSessionType();
    const models = this._pool(sessionType);
    if (restoredModel && models.some((model) => model.identifier === restoredModel.identifier)) {
      return;
    }
    const match2 = findBestMatchingModel(previousModel, models);
    if (match2) {
      this._applyModel(match2, "sessionRestore" /* SessionRestore */);
    } else if (models.length === 0) {
      this._currentModel.set(void 0, void 0);
    } else {
      this.selectDefault(sessionType);
    }
  }
  _applySessionRestore(model, applyModel, configuration2, restoredAs, keepsAwaitedModel = false) {
    this._clearPendingProgrammaticSelection();
    this._selectionReason = restoredAs;
    if (!keepsAwaitedModel) {
      this._remember({ modelId: model.identifier, model, reason: restoredAs, configuration: configuration2 });
    }
    if (configuration2) {
      this._runtime.restoreModelConfiguration?.(model.identifier, configuration2);
    }
    if (applyModel) {
      this._applyModel(model, restoredAs);
    }
  }
  _reconcilePendingProgrammaticSelection() {
    const intent = this._pendingProgrammaticSelection;
    if (!intent) {
      return false;
    }
    if (this._runtime.getBoundConversationKey() !== intent.conversationKey) {
      this._clearPendingProgrammaticSelection();
      return true;
    }
    const model = intent.resolveModel();
    if (!model) {
      return false;
    }
    this._pendingProgrammaticSelection = void 0;
    intent.complete(true);
    this.applyProgrammaticSelection(model);
    return true;
  }
  _clearPendingProgrammaticSelection() {
    const intent = this._pendingProgrammaticSelection;
    this._pendingProgrammaticSelection = void 0;
    if (intent) {
      intent.complete(false);
      if (this._selectionReason === "programmaticSelection" /* ProgrammaticSelection */) {
        this._selectionReason = void 0;
      }
    }
  }
  /** Shows `model` without touching the authority already in force. */
  _display(model) {
    this._currentModel.set(model, void 0);
  }
  /**
   * Shows the model and hands it to the surface. The reason is recorded first because a surface
   * that persists reads it during `applyModel`. Pass {@link selectionReason} to carry it over.
   */
  _applyModel(model, reason) {
    this._selectionReason = reason;
    this._display(model);
    this._runtime.applyModel(model);
  }
  _reportInitialization(configuredModel, rememberedModel, selection) {
    this._diagnostics.report("initialize", {
      configuredModel,
      rememberedModel,
      availableModels: this._pool().map((model) => model.identifier).join(","),
      selection: selection.kind,
      resultModel: selection.kind === "apply" ? selection.model.identifier : void 0,
      resultReason: selection.kind === "apply" ? selection.reason : void 0,
      pendingReference: selection.kind === "pending" ? selection.selection.reference : void 0
    }, selection.kind === "none" ? "debug" : "info");
  }
};
export { ChatInputModelSelectionController };
