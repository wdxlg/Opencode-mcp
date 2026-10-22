// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widgetHosts/viewPane/chatContextUsageWidget.ts
import { $, EventType, addDisposableListener } from "./module-0075.mjs";
import { equals } from "./module-0007.mjs";
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { observableValue } from "./module-0048.mjs";
import { observableValueOpts } from "./module-0050.mjs";
import { localize } from "./module-0001.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { ChatContextUsageDetails } from "./module-2197.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILanguageModelsService } from "./module-0967.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/chat/browser/widgetHosts/viewPane/chatContextUsageWidget.ts
var $42 = $;

function resolveContextWindowInputTokens(modelConfiguration, configurationSchema, maxInputTokens) {
  const configuredContextSize = typeof modelConfiguration?.contextSize === "number" ? modelConfiguration.contextSize : void 0;
  const schemaDefaultContextSize = configurationSchema?.properties?.contextSize?.default;
  return configuredContextSize ?? (typeof schemaDefaultContextSize === "number" ? schemaDefaultContextSize : void 0) ?? maxInputTokens;
}

function isSameContextUsageData(a, b) {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.usedTokens === b.usedTokens && a.completionTokens === b.completionTokens && a.totalContextWindow === b.totalContextWindow && a.percentage === b.percentage && a.outputBufferPercentage === b.outputBufferPercentage && a.sessionCost === b.sessionCost && equals(a.promptTokenDetails, b.promptTokenDetails, (x, y) => x.category === y.category && x.label === y.label && x.percentageOfPrompt === y.percentageOfPrompt);
}

var CircularProgressIndicator = class _CircularProgressIndicator {
  static {
    this.CENTER_X = 18;
  }
  static {
    this.CENTER_Y = 18;
  }
  static {
    this.RADIUS = 14;
  }
  constructor() {
    const r2 = _CircularProgressIndicator.RADIUS;
    this.circumference = 2 * Math.PI * r2;
    this.domNode = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.domNode.setAttribute("viewBox", "0 0 36 36");
    this.domNode.classList.add("circular-progress");
    const bgCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    bgCircle.setAttribute("cx", String(_CircularProgressIndicator.CENTER_X));
    bgCircle.setAttribute("cy", String(_CircularProgressIndicator.CENTER_Y));
    bgCircle.setAttribute("r", String(r2));
    bgCircle.classList.add("progress-bg");
    this.domNode.appendChild(bgCircle);
    this.progressCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    this.progressCircle.setAttribute("cx", String(_CircularProgressIndicator.CENTER_X));
    this.progressCircle.setAttribute("cy", String(_CircularProgressIndicator.CENTER_Y));
    this.progressCircle.setAttribute("r", String(r2));
    this.progressCircle.classList.add("progress-arc");
    this.progressCircle.setAttribute("stroke-dasharray", String(this.circumference));
    this.progressCircle.setAttribute("stroke-dashoffset", String(this.circumference));
    this.domNode.appendChild(this.progressCircle);
  }
  /**
   * Updates the ring to display the given percentage (0-100).
   * @param percentage The percentage of the ring to fill (clamped to 0-100)
   */
  setProgress(percentage) {
    const clamped = Math.max(0, Math.min(100, percentage));
    const offset = this.circumference - clamped / 100 * this.circumference;
    this.progressCircle.setAttribute("stroke-dashoffset", String(offset));
  }
};

var ChatContextUsageWidget = class extends Disposable {
  constructor(hoverService, instantiationService, languageModelsService, contextKeyService, storageService, configurationService) {
    super();
    this.hoverService = hoverService;
    this.instantiationService = instantiationService;
    this.languageModelsService = languageModelsService;
    this.contextKeyService = contextKeyService;
    this.storageService = storageService;
    this.configurationService = configurationService;
    this._onDidChangeVisibility = this._register(new Emitter());
    this.onDidChangeVisibility = this._onDidChangeVisibility.event;
    this._isVisible = observableValue(this, false);
    this._lastRequestDisposable = this._register(new MutableDisposable());
    this._modelConfigurationListener = this._register(new MutableDisposable());
    this._hoverDisposable = this._register(new MutableDisposable());
    this._contextUsageDetails = this._register(new MutableDisposable());
    this._currentData = observableValueOpts({ owner: this, equalsFn: isSameContextUsageData }, void 0);
    this._hoverOptions = {
      id: ChatContextUsageWidget._HOVER_ID,
      appearance: { showPointer: true, compact: true },
      persistence: { hideOnHover: false },
      trapFocus: true
    };
    this.domNode = $42(".chat-context-usage-widget");
    this.domNode.style.display = "none";
    this.domNode.setAttribute("tabindex", "0");
    this.domNode.setAttribute("role", "button");
    this.domNode.setAttribute("aria-label", localize(12698, null));
    const iconContainer = this.domNode.appendChild($42(".icon-container"));
    this.progressIndicator = new CircularProgressIndicator();
    iconContainer.appendChild(this.progressIndicator.domNode);
    this.percentageLabel = this.domNode.appendChild($42(".percentage-label"));
    this._contextUsageOpenedKey = ChatContextKeys.contextUsageHasBeenOpened.bindTo(this.contextKeyService);
    if (this.storageService.getBoolean(ChatContextUsageWidget._OPENED_STORAGE_KEY, 1 /* WORKSPACE */, false)) {
      this._contextUsageOpenedKey.set(true);
    }
    this._enabled = this.configurationService.getValue("chat.contextUsage.enabled" /* ChatContextUsageEnabled */) !== false;
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("chat.contextUsage.enabled" /* ChatContextUsageEnabled */)) {
        this._enabled = this.configurationService.getValue("chat.contextUsage.enabled" /* ChatContextUsageEnabled */) !== false;
        if (!this._enabled) {
          this.hide();
        } else if (this._currentData.get()) {
          this.show();
        }
      }
    }));
    this.setupHover();
  }
  get isVisible() {
    return this._isVisible;
  }
  static {
    this._OPENED_STORAGE_KEY = "chat.contextUsage.hasBeenOpened";
  }
  static {
    this._HOVER_ID = "chat.contextUsage";
  }
  setChatWidget(widget) {
    this._chatWidget = widget;
    this._contextUsageDetails.value?.setChatWidget(widget);
  }
  /**
   * Shows the sticky context usage details hover and records that the user
   * has opened it. Returns `true` if the details were shown.
   */
  showDetails() {
    const details = this._createDetails();
    if (!details) {
      return false;
    }
    this.hoverService.showInstantHover(
      { ...this._hoverOptions, content: details.domNode, target: this.domNode, persistence: { hideOnHover: false, sticky: true } },
      true
    );
    this._markOpened();
    return true;
  }
  _createDetails() {
    if (!this._isVisible.get() || !this._currentData.get()) {
      return void 0;
    }
    if (!this._contextUsageDetails.value) {
      this._contextUsageDetails.value = this.instantiationService.createInstance(ChatContextUsageDetails, this._chatWidget, this._currentData);
    }
    return this._contextUsageDetails.value;
  }
  _markOpened() {
    this._contextUsageOpenedKey.set(true);
    this.storageService.store(ChatContextUsageWidget._OPENED_STORAGE_KEY, true, 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  setupHover() {
    this._hoverDisposable.clear();
    const store = new DisposableStore();
    this._hoverDisposable.value = store;
    store.add(this.hoverService.setupDelayedHover(this.domNode, () => ({
      ...this._hoverOptions,
      content: this._createDetails()?.domNode ?? ""
    })));
    store.add(addDisposableListener(this.domNode, EventType.CLICK, (e) => {
      e.stopPropagation();
      this.showDetails();
    }));
    store.add(addDisposableListener(this.domNode, EventType.KEY_DOWN, (e) => {
      const evt = new StandardKeyboardEvent(e);
      if (evt.equals(10 /* Space */) || evt.equals(3 /* Enter */)) {
        e.preventDefault();
        this.showDetails();
      }
    }));
  }
  /**
   * Updates the widget with the latest request/response data.
   * The model is retrieved from the request's modelId.
   * @param lastRequest The last request in the session
   */
  update(lastRequest2) {
    this._lastRequestDisposable.clear();
    this._currentResponse = void 0;
    this._currentModelId = void 0;
    if (!lastRequest2) {
      this._currentData.set(void 0, void 0);
      this.hide();
      return;
    }
    if (!lastRequest2.response || !lastRequest2.modelId) {
      if (!this._currentData.get()) {
        this.hide();
      }
      return;
    }
    const response = lastRequest2.response;
    const modelId = lastRequest2.modelId;
    this._currentResponse = response;
    this._currentModelId = modelId;
    this.updateFromResponse(response, modelId);
    this._lastRequestDisposable.value = response.onDidChange(() => {
      this.updateFromResponse(response, modelId);
    });
  }
  updateSessionCost(sessionCost) {
    const data = this._currentData.get();
    if (data && data.sessionCost !== sessionCost) {
      this.render({ ...data, sessionCost });
    }
  }
  /**
   * Provides a per-editor resolver for the selected model's configuration
   * (notably the user-selected context size). The widget re-renders whenever
   * the supplied event fires for the currently displayed model. Without this,
   * the widget falls back to the profile-global value, which can drift from
   * the editor's actual selection (see issue #320393).
   */
  setModelConfigurationResolver(resolver, onDidChange) {
    this._modelConfigurationResolver = resolver;
    this._modelConfigurationListener.value = onDidChange((modelId) => {
      const affectsDisplayedModel = this._currentModelId === modelId || this._selectedModelId === modelId;
      if (this._currentResponse && this._currentModelId && affectsDisplayedModel) {
        this.updateFromResponse(this._currentResponse, this._currentModelId);
      }
    });
  }
  /**
   * Sets the model the user currently has selected in the picker. The
   * context-window denominator then reflects this model immediately, even
   * before a request is sent with it. The usage numerator still comes from the
   * last completed response.
   */
  setSelectedModel(modelId) {
    if (this._selectedModelId === modelId) {
      return;
    }
    this._selectedModelId = modelId;
    if (this._currentResponse && this._currentModelId) {
      this.updateFromResponse(this._currentResponse, this._currentModelId);
    }
  }
  /**
   * Resolves a model's context-window dimensions, or `undefined` when it has no usable window. A meta-model such as
   * "auto" advertises a zero-sized window, so it resolves to `undefined` and the caller falls back to the model that
   * actually served the request (see issue #321781).
   */
  resolveContextWindow(modelId) {
    if (!modelId) {
      return void 0;
    }
    const modelMetadata = this.languageModelsService.lookupLanguageModel(modelId);
    if (!modelMetadata) {
      return void 0;
    }
    const modelConfiguration = this._modelConfigurationResolver?.(modelId) ?? this.languageModelsService.getModelConfiguration(modelId);
    const maxInputTokens = resolveContextWindowInputTokens(modelConfiguration, modelMetadata.configurationSchema, modelMetadata.maxInputTokens);
    const maxOutputTokens = modelMetadata.maxOutputTokens;
    const totalContextWindow = (maxInputTokens ?? 0) + (maxOutputTokens ?? 0);
    if (totalContextWindow <= 0) {
      return void 0;
    }
    return { maxOutputTokens, totalContextWindow };
  }
  updateFromResponse(response, modelId) {
    const usage = response.usage;
    const effectiveModelId = usage?.actualModelId ?? modelId;
    const contextWindow = this.resolveContextWindow(this._selectedModelId) ?? this.resolveContextWindow(effectiveModelId);
    if (!usage || !contextWindow) {
      if (!this._currentData.get()) {
        this.hide();
      }
      return;
    }
    const { maxOutputTokens, totalContextWindow } = contextWindow;
    const promptTokens = usage.promptTokens;
    const completionTokens = usage.completionTokens;
    const promptTokenDetails = usage.promptTokenDetails;
    const usedTokens = promptTokens + completionTokens;
    const percentage = usedTokens / totalContextWindow * 100;
    const outputBufferPercentage = maxOutputTokens !== void 0 ? Math.max(0, maxOutputTokens - completionTokens) / totalContextWindow * 100 : void 0;
    this.render({
      usedTokens,
      completionTokens,
      totalContextWindow,
      percentage,
      outputBufferPercentage,
      promptTokenDetails,
      sessionCost: response.session.sessionCost
    });
    this.show();
  }
  render(data) {
    this._currentData.set(data, void 0);
    this.progressIndicator.setProgress(data.percentage);
    const roundedPercentage = Math.min(100, Math.round(data.percentage));
    this.percentageLabel.textContent = `${roundedPercentage}%`;
    this.domNode.setAttribute("aria-label", localize(12699, null, roundedPercentage));
    this.domNode.classList.remove("warning", "error");
    if (data.percentage >= 90) {
      this.domNode.classList.add("error");
    } else if (data.percentage >= 75) {
      this.domNode.classList.add("warning");
    }
  }
  show() {
    if (!this._enabled) {
      return;
    }
    if (this.domNode.style.display === "none") {
      this.domNode.style.display = "";
      this._isVisible.set(true, void 0);
      this._onDidChangeVisibility.fire();
    }
  }
  hide() {
    if (this.domNode.style.display !== "none") {
      this.domNode.style.display = "none";
      this._isVisible.set(false, void 0);
      this._onDidChangeVisibility.fire();
    }
  }
};

ChatContextUsageWidget = __decorateClass([
  __decorateParam(0, IHoverService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ILanguageModelsService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, IConfigurationService)
], ChatContextUsageWidget);
export { resolveContextWindowInputTokens, isSameContextUsageData, $42, CircularProgressIndicator, ChatContextUsageWidget };
