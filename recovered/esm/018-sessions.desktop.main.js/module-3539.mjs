// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/sessionModelSelection.ts
import { isInConversationModelChoice } from "./module-2042.mjs";
import { IntendedModelSlot } from "./module-1193.mjs";
import { createDecorator } from "./module-0077.mjs";
import { Disposable, MutableDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { EMPTY_MODEL_SELECTION_STATE, createModelSelectionState, normalizeModelPickerOptions } from "./module-3538.mjs";
import { LRUCache } from "./module-0008.mjs";
import { ChatModelSelectionDiagnostics } from "./module-2043.mjs";
import { ChatInputModelSelectionController } from "./module-2044.mjs";
import { autorun } from "./module-0052.mjs";
import { getSelectedModelStorageKey, getStoredSelectedModel, storeSelectedModel } from "./module-2040.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILogService } from "./module-0095.mjs";


// src/vs/sessions/contrib/chat/browser/sessionModelSelection.ts
var CONVERSATION_CACHE_SIZE = 50;

function isChatOwnModel(source) {
  return source !== "carriedOver" /* CarriedOver */;
}

function restoreReasonForSource(source) {
  return isChatOwnModel(source) ? "restoredChoice" /* RestoredChoice */ : "sessionRestore" /* SessionRestore */;
}

function sourceForReason(reason) {
  return isInConversationModelChoice(reason) ? "chosen" /* Chosen */ : "carriedOver" /* CarriedOver */;
}

function legacyModelPickerStorageKey(providerId, sessionType) {
  return `sessions.modelPicker.${providerId}.${sessionType}.selectedModelId`;
}

var ConversationModelSelection = class {
  constructor() {
    /** The model this conversation is meant to run on, whatever the pool can offer right now. */
    this.intent = new IntendedModelSlot();
    /** True once driven to a model the pool actually offers; a half-published pool does not count. */
    this.seeded = false;
  }
};

var ISessionModelSelection = createDecorator("sessionModelSelection");

var SessionModelSelection = class extends Disposable {
  constructor(_session, _sessionsProvidersService, _storageService, _configurationService, logService) {
    super();
    this._session = _session;
    this._sessionsProvidersService = _sessionsProvidersService;
    this._storageService = _storageService;
    this._configurationService = _configurationService;
    this._state = observableValue(this, EMPTY_MODEL_SELECTION_STATE);
    this.state = this._state;
    this._providerListener = this._register(new MutableDisposable());
    /**
     * What this input knows about each conversation it has bound. The controller only ever reaches
     * the bound conversation's record, so one chat's model selection cannot be applied to another.
     */
    this._conversations = new LRUCache(CONVERSATION_CACHE_SIZE);
    this._unboundConversation = new ConversationModelSelection();
    this._models = [];
    /** Read from the chat, not the session: session status aggregates across peer chats. */
    this._chatIsEmpty = false;
    /** The conversation's own model is unknown but presumed to exist: show a selection, never write it. */
    this._displayOnly = false;
    this._diagnostics = new ChatModelSelectionDiagnostics(logService, this._storageService, () => {
      const session = this._session.get();
      return {
        surface: "sessions",
        location: "panel" /* Chat */,
        modelTarget: this._modelTarget,
        sessionKey: session?.sessionId,
        conversationKey: session?.activeChat.get().resource.toString(),
        metadata: {
          providerId: session?.providerId,
          sessionType: session?.sessionType,
          sessionId: session?.sessionId
        }
      };
    });
    this._controller = this._register(new ChatInputModelSelectionController(this._createRuntime(), this._diagnostics));
    this._register(autorun((reader) => {
      const session = this._session.read(reader);
      session?.modelId.read(reader);
      session?.status.read(reader);
      const chat = session?.activeChat.read(reader);
      chat?.status.read(reader);
      chat?.modelSource.read(reader);
      this._refresh("sessionState", session);
    }));
    this._register(this._configurationService.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("chat.defaultModel" /* DefaultModel */)) {
        this._refresh("configuration");
      }
    }));
    this._register(this._sessionsProvidersService.onDidChangeProviders(() => this._refresh("providers")));
    this._register(this._storageService.onDidChangeValue(0 /* PROFILE */, void 0, this._store)((event) => {
      this._diagnostics.logStorageChange(event, this._state.get().currentModel?.identifier);
    }));
  }
  selectModel(modelIdentifier) {
    const session = this._session.get();
    const provider = session ? this._sessionsProvidersService.getProvider(session.providerId) : void 0;
    if (!session || !provider) {
      this._diagnostics.report("selection-rejected", {
        requestedModel: modelIdentifier,
        reason: !session ? "noSession" : "noProvider"
      }, "info");
      return false;
    }
    const snapshot = provider.getModelsSnapshot(session.sessionId);
    this._modelTarget = snapshot.modelTarget;
    this._models = snapshot.models;
    const model = snapshot.models.find((model2) => model2.identifier === modelIdentifier);
    if (!model) {
      this._diagnostics.report("selection-rejected", {
        requestedModel: modelIdentifier,
        reason: "modelUnavailable",
        availableModels: snapshot.models.map((model2) => model2.identifier).join(",")
      }, "info");
      return false;
    }
    const options3 = normalizeModelPickerOptions(provider.getModelPickerOptions(session.sessionId));
    const providerModelBefore = session.modelId.get();
    const storageKey = getSelectedModelStorageKey("panel" /* Chat */, snapshot.modelTarget);
    const conversation = this._conversation();
    try {
      this._controller.applySelection(model, () => {
        provider.setModel(session.sessionId, session.activeChat.get().resource, model.identifier, "chosen" /* Chosen */);
        storeSelectedModel(this._storageService, "panel" /* Chat */, snapshot.modelTarget, model.identifier);
      }, true, true);
    } catch (error) {
      this._diagnostics.report("provider-selection-failed", {
        requestedModel: modelIdentifier,
        providerModelBefore,
        providerModelAfter: session.modelId.get(),
        storedModelAfter: this._storageService.get(storageKey, 0 /* PROFILE */),
        error: String(error)
      }, "error");
      throw error;
    }
    conversation.seeded = true;
    this._publish(options3, void 0);
    this._diagnostics.report("provider-selection-applied", {
      requestedModel: modelIdentifier,
      providerModelBefore,
      providerModelAfter: session.modelId.get(),
      storedModelAfter: this._storageService.get(storageKey, 0 /* PROFILE */)
    }, "info");
    return true;
  }
  _createRuntime() {
    return {
      // The pool's target, not the session type: it is what the provider scopes models by.
      getCurrentSessionType: () => this._modelTarget,
      isEmpty: () => this._chatIsEmpty,
      getModels: () => [...this._models],
      getAllModels: () => [...this._models],
      getConfiguredModelValue: () => this._configurationService.getValue("chat.defaultModel" /* DefaultModel */),
      // A session runs whatever its provider published: no mode, nowhere else to show it.
      isModelSupportedHere: () => true,
      getDeclaredDefaultModel: (models) => models.find((model) => model.metadata.isDefaultForLocation["panel" /* Chat */]),
      getBoundConversationKey: () => this._boundConversationKey,
      getIntentHolder: () => this._conversation().intent,
      applyModel: (model) => this._pushModelToProvider(model)
      // The optional members are absent on purpose: the snapshot is already the session's pool,
      // `_refresh` owns refreshing, and sessions have no per-model configuration.
    };
  }
  /** Unreachable while another chat is bound, so one chat's selection cannot reach another. */
  _conversation() {
    const conversationKey = this._boundConversationKey;
    if (!conversationKey) {
      return this._unboundConversation;
    }
    let conversation = this._conversations.get(conversationKey);
    if (!conversation) {
      conversation = new ConversationModelSelection();
      this._conversations.set(conversationKey, conversation);
    }
    return conversation;
  }
  _refresh(trigger, session = this._session.get()) {
    const provider = session ? this._sessionsProvidersService.getProvider(session.providerId) : void 0;
    this._setProvider(provider);
    this._activeSession = session;
    this._activeProvider = provider;
    if (!session || !provider) {
      this._boundSessionKey = void 0;
      this._boundConversationKey = void 0;
      this._chatIsEmpty = false;
      this._displayOnly = false;
      this._models = [];
      this._modelTarget = void 0;
      this._state.set(EMPTY_MODEL_SELECTION_STATE, void 0);
      return;
    }
    const conversationKey = session.activeChat.get().resource.toString();
    const chat = session.activeChat.get();
    const chatModelId = session.modelId.get();
    const chatModelSource = chatModelId ? chat.modelSource.get() ?? "chosen" /* Chosen */ : void 0;
    const chatModelReason = chatModelSource === void 0 ? void 0 : restoreReasonForSource(chatModelSource);
    const baseSnapshot = provider.getModelsSnapshot(session.sessionId, chatModelId);
    const remembered = this._getRememberedModel(session, baseSnapshot.modelTarget);
    const rebound = session.sessionId !== this._boundSessionKey || conversationKey !== this._boundConversationKey;
    const desiredModelId = chatModelId ?? remembered;
    const snapshot = desiredModelId === chatModelId ? baseSnapshot : provider.getModelsSnapshot(session.sessionId, desiredModelId);
    this._models = snapshot.models;
    this._modelTarget = snapshot.modelTarget;
    const options3 = normalizeModelPickerOptions(provider.getModelPickerOptions(session.sessionId));
    const resolvedDesiredModel = snapshot.desiredModelResolution.kind === "available" ? snapshot.desiredModelResolution.model : void 0;
    this._boundSessionKey = session.sessionId;
    this._boundConversationKey = conversationKey;
    this._chatIsEmpty = chat.status.get() === 0 /* Untitled */;
    this._displayOnly = !chatModelId && !this._chatIsEmpty;
    if (rebound) {
      this._controller.beginConversationSwitch();
    }
    if (snapshot.desiredModelResolution.kind === "pending" && !this._displayOnly && !this._controller.configuredDefaultToSeed(chatModelReason)) {
      this._conversation().seeded = false;
      this._diagnostics.report("await-desired-model", {
        trigger,
        desiredModel: snapshot.desiredModelResolution.identifier,
        availableModels: snapshot.models.map((model) => model.identifier).join(",")
      }, "info");
      this._publish(options3, { reference: snapshot.desiredModelResolution.identifier });
      return;
    }
    try {
      this._drive(rebound, chatModelId, chatModelSource, remembered, resolvedDesiredModel, conversationKey);
    } catch (error) {
      this._conversation().seeded = false;
      this._publish(options3, void 0, this._models.find((model) => model.identifier === session.modelId.get()));
      return;
    }
    this._publish(options3, void 0);
  }
  /**
   * Hands the session's state to the controller through the same entry points Workbench chat
   * uses: seed a newly bound conversation, follow the conversation's own model when it changes
   * underneath us, and reconcile against the pool that was just published.
   */
  _drive(rebound, chatModelId, chatModelSource, rememberedModelId, resolvedDesiredModel, conversationKey) {
    const chatModel = chatModelId ? resolvedDesiredModel ?? this._models.find((model) => model.identifier === chatModelId) : void 0;
    const rememberedId = chatModelId ? rememberedModelId : resolvedDesiredModel?.identifier ?? rememberedModelId;
    const conversation = this._conversation();
    if (rebound || !conversation.seeded) {
      conversation.seeded = true;
      if (chatModel) {
        this._claimChatModel(chatModel, chatModelSource, conversationKey);
      } else {
        this._controller.initialize(rememberedId);
      }
      conversation.seeded = this._isShowingSelectableModel();
    } else if (chatModel && this._conversationSelectionChanged(chatModel, chatModelSource)) {
      this._claimChatModel(chatModel, chatModelSource, conversationKey);
    }
    this._controller.reconcileModelListChange(this._models);
    conversation.seeded ||= this._isShowingSelectableModel();
  }
  /** Whether the controller is on a model this session's pool actually offers. */
  _isShowingSelectableModel() {
    const current = this._controller.currentModel.get();
    return !!current && this._models.some((model) => model.identifier === current.identifier);
  }
  /**
   * Whether the chat's model, or whether it counts as the chat's own, differs from what we hold.
   * Our own echo matches on both, since the source came from the reason we still hold.
   */
  _conversationSelectionChanged(chatModel, source) {
    return chatModel.identifier !== this._controller.currentModel.get()?.identifier || isChatOwnModel(source) !== isInConversationModelChoice(this._controller.selectionReason);
  }
  /** Adopts the model the chat is on, telling the controller whether it counts as a choice. */
  _claimChatModel(chatModel, source, conversationKey) {
    this._controller.syncFromConversationState(
      chatModel,
      void 0,
      this._modelTarget,
      conversationKey,
      false,
      restoreReasonForSource(source)
    );
  }
  _pushModelToProvider(model) {
    const session = this._activeSession;
    const provider = this._activeProvider;
    if (!session || !provider) {
      return;
    }
    if (this._displayOnly) {
      this._diagnostics.report("provider-write-withheld", {
        model: model.identifier,
        reason: this._controller.selectionReason
      }, "info");
      return;
    }
    const providerModelBefore = session.modelId.get();
    if (providerModelBefore === model.identifier) {
      return;
    }
    const source = sourceForReason(this._controller.selectionReason);
    try {
      provider.setModel(session.sessionId, session.activeChat.get().resource, model.identifier, source);
    } catch (error) {
      this._diagnostics.report("provider-automatic-selection-failed", {
        model: model.identifier,
        reason: this._controller.selectionReason,
        providerModelBefore,
        providerModelAfter: session.modelId.get(),
        error: String(error)
      }, "error");
      throw error;
    }
    this._diagnostics.report("provider-automatic-selection-applied", {
      model: model.identifier,
      reason: this._controller.selectionReason,
      providerModelBefore,
      providerModelAfter: session.modelId.get()
    }, "info");
  }
  _publish(options3, pendingSelection, currentModel = this._controller.currentModel.get()) {
    this._state.set(createModelSelectionState(this._models, options3, currentModel, pendingSelection), void 0);
  }
  /** The remembered preference, migrating the legacy key forward the first time it is seen. */
  _getRememberedModel(session, modelTarget) {
    const storedSelection = getStoredSelectedModel(this._storageService, "panel" /* Chat */, modelTarget);
    if (storedSelection) {
      return storedSelection;
    }
    const legacyStorageKey = legacyModelPickerStorageKey(session.providerId, session.sessionType);
    const legacyIdentifier = this._storageService.get(legacyStorageKey, 0 /* PROFILE */);
    if (legacyIdentifier) {
      storeSelectedModel(this._storageService, "panel" /* Chat */, modelTarget, legacyIdentifier);
      this._diagnostics.report("legacy-selection-migrated", {
        legacyStorageKey,
        model: legacyIdentifier
      }, "info");
      return legacyIdentifier;
    }
    return void 0;
  }
  _setProvider(provider) {
    if (this._listenedProvider === provider) {
      return;
    }
    this._listenedProvider = provider;
    this._providerListener.value = provider?.onDidChangeModels(() => this._refresh("models"));
  }
};

SessionModelSelection = __decorateClass([
  __decorateParam(1, ISessionsProvidersService),
  __decorateParam(2, IStorageService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, ILogService)
], SessionModelSelection);
export { isChatOwnModel, restoreReasonForSource, sourceForReason, legacyModelPickerStorageKey, CONVERSATION_CACHE_SIZE, ConversationModelSelection, ISessionModelSelection, SessionModelSelection };
