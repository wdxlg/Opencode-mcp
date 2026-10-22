// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/modelPicker/modelPickerWidget.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ModelPickerConfiguration } from "./module-2191.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { autorun } from "./module-0052.mjs";
import { getModelPickerUnavailableReason, isAutoModel, modelPickerRequiresSetup, shouldShowCacheBreakHint } from "./module-2097.mjs";
import { localize } from "./module-0001.mjs";
import { CHAT_SETUP_ACTION_ID } from "./module-1476.mjs";
import { $, EventHelper, EventType, addDisposableGenericMouseDownListener, addDisposableListener, append, getActiveElement, getWindow, isHTMLElement, reset } from "./module-0075.mjs";
import { getBaseLayerHoverDelegate } from "./module-0472.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { URI } from "./module-0032.mjs";
import { TelemetryTrustedValue } from "./module-0885.mjs";
import { buildModelToProviderGroupMap, getProviderGroupForModel } from "./module-2188.mjs";
import { buildModelPickerItems, createManageModelsAction, createOpenCodeModelSetupItems, getModelPickerAccessibilityProvider, getModelPickerControlModels, shouldShowManageModelsAction } from "./module-2190.mjs";
import { GitHubPaths, IDefaultAccountService } from "./module-0741.mjs";
import { readModelChannelOrder } from "./module-2185.mjs";
import { AgentHostAllowSignedOutWhenUsableSettingId } from "./module-1107.mjs";
import { withChatInputPickerMotion } from "./module-2096.mjs";
import { Codicon } from "./module-0085.mjs";
import { ModelPickerSection } from "./module-2189.mjs";
import { renderIcon } from "./module-0467.mjs";
import { getLanguageModelDisplayNameWithSubscriptionSource } from "./module-2187.mjs";
import { getCompactModelPickerIcon } from "./module-2134.mjs";
import { getCompactCodicon } from "./module-2040.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ILanguageModelsService } from "./module-0967.mjs";
import { IProductService } from "./module-0873.mjs";
import { IChatEntitlementService } from "./module-0953.mjs";
import { IUpdateService } from "./module-1181.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IWorkspaceTrustManagementService, IWorkspaceTrustRequestService } from "./module-0854.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/modelPicker/modelPickerWidget.ts
var CACHE_BREAK_HINT_DISMISSED_STORAGE_KEY = "chat.cacheBreakHintDismissed";

var ModelPickerWidget = class extends Disposable {
  constructor(_delegate2, _actionWidgetService, _commandService, _openerService, _telemetryService, _languageModelsService, _productService, _entitlementService, _updateService, _uriIdentityService, _defaultAccountService, _workspaceTrustManagementService, _workspaceTrustRequestService, _storageService, _configurationService, instantiationService) {
    super();
    this._delegate = _delegate2;
    this._actionWidgetService = _actionWidgetService;
    this._commandService = _commandService;
    this._openerService = _openerService;
    this._telemetryService = _telemetryService;
    this._languageModelsService = _languageModelsService;
    this._productService = _productService;
    this._entitlementService = _entitlementService;
    this._updateService = _updateService;
    this._uriIdentityService = _uriIdentityService;
    this._defaultAccountService = _defaultAccountService;
    this._workspaceTrustManagementService = _workspaceTrustManagementService;
    this._workspaceTrustRequestService = _workspaceTrustRequestService;
    this._storageService = _storageService;
    this._configurationService = _configurationService;
    this._onDidChangeSelection = this._register(new Emitter());
    this.onDidChangeSelection = this._onDidChangeSelection.event;
    this._workspaceTrustInitialized = false;
    this._activatingAfterTrust = false;
    this._activatingTimer = this._register(new MutableDisposable());
    this._configuration = instantiationService.createInstance(ModelPickerConfiguration, {
      getSelectedModel: () => this._selectedModel,
      getConfigurationAccess: () => this._delegate.modelConfiguration ?? this._languageModelsService,
      isDisabled: () => !!this._domNode?.classList.contains("disabled"),
      shouldShowCacheBreakHint: () => this.shouldShowCacheBreakHint(
        /* excludeAutoModel */
        false
      ),
      getCacheBreakLearnMoreLink: () => this.getCacheBreakLearnMoreLink(),
      dismissCacheBreakHint: () => this.dismissCacheBreakHint()
    });
    this._register(this._languageModelsService.onDidChangeLanguageModels(() => {
      if (this._activatingAfterTrust && this._delegate.getModels().length > 0) {
        this._clearActivating();
      }
      this._renderLabel();
    }));
    this._register(this._workspaceTrustManagementService.onDidChangeTrust((trusted) => {
      if (trusted && this._delegate.getPresentationOptions().showAutoModel && this._delegate.getModels().length === 0) {
        this._activatingAfterTrust = true;
        this._activatingTimer.value = disposableTimeout(() => {
          this._activatingAfterTrust = false;
          this._renderLabel();
        }, 15e3);
      } else {
        this._clearActivating();
      }
      this._renderLabel();
    }));
    this._workspaceTrustManagementService.workspaceTrustInitialized.then(() => {
      if (this._store.isDisposed) {
        return;
      }
      this._workspaceTrustInitialized = true;
      this._renderLabel();
    });
    this._register(this._entitlementService.onDidChangeUsageBasedBilling(() => {
      this._renderLabel();
    }));
    this._register(this._entitlementService.onDidChangeEntitlement(() => this._renderLabel()));
    this._register(this._entitlementService.onDidChangeSentiment(() => this._renderLabel()));
    this._register(this._entitlementService.onDidChangeAnonymous(() => this._renderLabel()));
    if (this._delegate.modelConfiguration?.onDidChange) {
      this._register(this._delegate.modelConfiguration.onDidChange(() => {
        this._renderLabel();
      }));
    }
  }
  get selectedModel() {
    return this._selectedModel;
  }
  get domNode() {
    return this._domNode;
  }
  get nameButton() {
    return this._nameButton;
  }
  setCompact(compact2) {
    this._compact = compact2;
    this._register(autorun((reader) => {
      const isCompact = compact2.read(reader);
      if (this._domNode) {
        this._domNode.classList.toggle("compact", isCompact);
      }
      this._renderLabel();
    }));
  }
  setSelectedModel(model) {
    this._selectedModel = model;
    this._renderLabel();
  }
  setEnabled(enabled) {
    if (this._domNode) {
      this._domNode.classList.toggle("disabled", !enabled);
      this._domNode.setAttribute("aria-disabled", String(!enabled));
    }
  }
  setBadge(badge) {
    this._badge = badge;
    this._updateBadge();
  }
  /**
   * Why the picker currently has no model to offer (untrusted vs. needs
   * sign-in/setup), or `undefined` when a model is available. See
   * {@link getModelPickerUnavailableReason}.
   */
  _unavailableReason() {
    return getModelPickerUnavailableReason({
      trustInitialized: this._workspaceTrustInitialized,
      trusted: this._workspaceTrustManagementService.isWorkspaceTrusted(),
      pickerModels: this._getPickerModels(),
      liveModelIds: this._languageModelsService.getLanguageModelIds(),
      requiresSetup: this._requiresSetup()
    });
  }
  _usesOpenCodeProviders() {
    const openCodeVendors = /* @__PURE__ */ new Set(["opencode", "opencode-codex"]);
    return this._productService.applicationName === "opencode" || this._languageModelsService.getVendors().some((vendor) => openCodeVendors.has(vendor.vendor));
  }
  _getPickerModels() {
    const models = this._delegate.getModels();
    const openCodeVendors = /* @__PURE__ */ new Set(["opencode", "opencode-codex"]);
    return this._usesOpenCodeProviders() ? models.filter((model) => openCodeVendors.has(model.metadata.vendor)) : models;
  }
  _requiresSetup() {
    if (this._usesOpenCodeProviders()) {
      return false;
    }
    return modelPickerRequiresSetup({
      entitlement: this._entitlementService.entitlement,
      anonymous: this._entitlementService.anonymous,
      hasByokModels: this._entitlementService.hasByokModels
    });
  }
  /**
   * Whether the picker has no usable model specifically because the workspace
   * is untrusted (Restricted Mode disables the chat model providers).
   */
  isRestrictedMode() {
    return this._unavailableReason() === "restricted" /* Restricted */;
  }
  /**
   * Whether the picker has no usable model because Chat still needs sign-in /
   * setup (and the workspace is trusted, so it is not Restricted Mode). BYOK
   * and anonymous access never report this state.
   */
  isSetupRequired() {
    return this._unavailableReason() === "setupRequired" /* SetupRequired */;
  }
  _clearActivating() {
    this._activatingAfterTrust = false;
    this._activatingTimer.clear();
  }
  /**
   * Prompts the user to trust the workspace. On grant, providers register their
   * models and `onDidChangeLanguageModels` refreshes the picker.
   */
  async _requestWorkspaceTrust() {
    await this._workspaceTrustRequestService.requestWorkspaceTrust({
      message: localize(12626, null)
    });
  }
  /**
   * Starts the Chat setup / sign-in flow (same command as the title-bar Sign In
   * affordance). On completion the entitlement and model registry change, which
   * refreshes the picker.
   */
  _requestSetup() {
    this._commandService.executeCommand(CHAT_SETUP_ACTION_ID);
  }
  render(container3) {
    this._domNode = append(container3, $("div.action-label.model-picker-split"));
    this._domNode.setAttribute("role", "group");
    this._domNode.tabIndex = -1;
    if (this._compact?.get()) {
      this._domNode.classList.toggle("compact", true);
    }
    this._nameButton = append(this._domNode, $("a.model-picker-section.model-picker-name"));
    this._nameButton.tabIndex = 0;
    this._nameButton.setAttribute("role", "button");
    this._nameButton.setAttribute("aria-haspopup", "true");
    this._nameButton.setAttribute("aria-expanded", "false");
    this._configButton = append(this._domNode, $("a.model-picker-section.model-picker-config"));
    this._configButton.tabIndex = 0;
    this._configButton.setAttribute("role", "button");
    this._configButton.setAttribute("aria-haspopup", "true");
    this._configButton.setAttribute("aria-expanded", "false");
    this._configButton.style.display = "none";
    this._badgeIcon = $("span.model-picker-badge");
    this._updateBadge();
    this._renderLabel();
    this._registerButtonAction(this._nameButton, () => this.show());
    this._registerButtonAction(this._configButton, () => this._configuration.show(this._configButton));
    this._register(getBaseLayerHoverDelegate().setupManagedHover(
      getDefaultHoverDelegate("mouse"),
      this._configButton,
      () => this._configButton?.ariaLabel || localize(12622, null)
    ));
  }
  /**
   * Registers mouse-down and Enter/Space key handlers on a button element.
   */
  _registerButtonAction(element, action) {
    this._register(addDisposableGenericMouseDownListener(element, (e) => {
      if (e.button !== 0) {
        return;
      }
      EventHelper.stop(e, true);
      action();
    }));
    this._register(addDisposableListener(element, EventType.KEY_DOWN, (e) => {
      const event = new StandardKeyboardEvent(e);
      if (event.equals(3 /* Enter */) || event.equals(10 /* Space */)) {
        EventHelper.stop(e, true);
        action();
      }
    }));
  }
  /** The "Learn more" header link for cache-break hints; `undefined` when the product has no URL. */
  getCacheBreakLearnMoreLink() {
    const url = this._productService.defaultChatAgent?.optimizeUsageDocumentationUrl;
    return url ? { label: localize(12615, null), uri: URI.parse(url) } : void 0;
  }
  isCacheBreakHintDismissed() {
    return this._storageService.getBoolean(CACHE_BREAK_HINT_DISMISSED_STORAGE_KEY, -1 /* APPLICATION */, false);
  }
  dismissCacheBreakHint() {
    this._storageService.store(CACHE_BREAK_HINT_DISMISSED_STORAGE_KEY, true, -1 /* APPLICATION */, 0 /* USER */);
  }
  /**
   * The picker's current availability, derived once so the label states and the "nothing to switch
   * to" hint suppression (#325185) cannot disagree.
   */
  _availability() {
    const reason = this._unavailableReason();
    const empty = this._getPickerModels().length === 0;
    const activating = reason === void 0 && empty && this._activatingAfterTrust;
    const genericNoModels = reason === void 0 && !activating && empty && (this._usesOpenCodeProviders() || !this._delegate.getPresentationOptions().showAutoModel);
    return { reason, activating, genericNoModels, noModels: reason !== void 0 || activating || genericNoModels };
  }
  /** Thin wrapper over {@link computeShouldShowCacheBreakHint} that supplies this picker's live state. */
  shouldShowCacheBreakHint(excludeAutoModel) {
    return shouldShowCacheBreakHint({
      dismissed: this.isCacheBreakHintDismissed(),
      cacheWarm: this._delegate.isCacheWarm?.() ?? false,
      noModelsAvailable: this._availability().noModels,
      excludeAutoModel,
      selectedModelIsAuto: !!this._selectedModel && isAutoModel(this._selectedModel)
    });
  }
  show(anchor) {
    const anchorElement = anchor ?? this._domNode;
    if (!anchorElement || this._domNode?.classList.contains("disabled")) {
      return;
    }
    if (this._nameButton?.getAttribute("aria-expanded") === "true") {
      this._actionWidgetService.hide(true);
      return;
    }
    const previousModel = this._selectedModel;
    const onSelect = (model) => {
      this._telemetryService.publicLog2("chat.modelChange", {
        fromModel: previousModel?.metadata.vendor === "copilot" ? new TelemetryTrustedValue(previousModel.identifier) : "unknown",
        toModel: model.metadata.vendor === "copilot" ? new TelemetryTrustedValue(model.identifier) : "unknown",
        chatSessionId: this._delegate.getChatSessionId?.()
      });
      this._selectedModel = model;
      this._renderLabel();
      this._onDidChangeSelection.fire(model);
    };
    const onConfigure = (model, group2) => {
      onSelect(model);
      this._actionWidgetService.hide();
      this._configuration.show(this._configButton, group2);
    };
    const hasOpenCodeProvider = this._usesOpenCodeProviders();
    const models = this._getPickerModels();
    const currentModel = hasOpenCodeProvider ? models.find((model) => model.identifier === this._selectedModel?.identifier) : void 0;
    const currentChannel = currentModel ? getProviderGroupForModel(currentModel, buildModelToProviderGroupMap(this._languageModelsService), this._languageModelsService).channelLabel : void 0;
    const delegatePresentation = this._delegate.getPresentationOptions();
    const presentation2 = hasOpenCodeProvider ? {
      ...delegatePresentation,
      useGroupedModelPicker: false,
      groupOpenCodeChannels: true,
      showManageModelsAction: false,
      showUnavailableFeatured: false,
      showFeatured: false,
      showAutoModel: false
    } : delegatePresentation;
    const manifest = this._languageModelsService.getModelsControlManifest();
    const controlModelsForTier = getModelPickerControlModels(manifest, this._entitlementService.entitlement, models);
    const canShowManageModelsAction = presentation2.showManageModelsAction && shouldShowManageModelsAction(this._entitlementService);
    const manageModelsAction = canShowManageModelsAction ? createManageModelsAction(this._commandService) : void 0;
    const logModelPickerInteraction = (interaction) => {
      this._telemetryService.publicLog2("chat.modelPickerInteraction", { interaction });
    };
    const manageSettingsUrl = this._defaultAccountService.resolveGitHubUrl(GitHubPaths.copilotSettings);
    const onTogglePin = (modelIdentifier, pinned) => {
      if (pinned) {
        this._languageModelsService.pinModel(modelIdentifier);
      } else {
        this._languageModelsService.unpinModel(modelIdentifier);
      }
      this._actionWidgetService.hide();
      this.show(anchorElement);
    };
    const showOpenCodeSetup = hasOpenCodeProvider && models.length === 0 && !this.isRestrictedMode();
    const items = showOpenCodeSetup ? createOpenCodeModelSetupItems(this._commandService) : buildModelPickerItems({
      models,
      selectedModelId: this._selectedModel?.identifier,
      recentModelIds: this._languageModelsService.getRecentlyUsedModelIds().filter((id2) => !this._languageModelsService.isModelHidden(id2)),
      pinnedModelIds: this._languageModelsService.getPinnedModelIds().filter((id2) => !this._languageModelsService.isModelHidden(id2)),
      channelOrder: readModelChannelOrder(this._storageService),
      controlModels: controlModelsForTier,
      currentVSCodeVersion: this._productService.version,
      updateStateType: this._updateService.state.type,
      manageSettingsUrl,
      manageModelsAction,
      chatEntitlementService: this._entitlementService,
      languageModelsService: this._languageModelsService,
      openerService: this._openerService,
      presentation: {
        ...presentation2,
        restrictedMode: this.isRestrictedMode(),
        setupRequired: this.isSetupRequired(),
        showManageModelsInSetupRequired: this._configurationService.getValue(AgentHostAllowSignedOutWhenUsableSettingId) === true,
        isUBB: !!this._entitlementService.quotas.usageBasedBilling
      },
      actions: {
        onSelect,
        onTogglePin,
        onConfigure,
        onRequestTrust: () => {
          void this._requestWorkspaceTrust();
        },
        onRequestSetup: () => {
          this._requestSetup();
        }
      }
    });
    const hoverDisposables = new DisposableStore();
    for (const item of items) {
      if (item.hover?.disposable) {
        hoverDisposables.add(item.hover.disposable);
      }
    }
    const unavailable = this.isRestrictedMode() || this.isSetupRequired();
    const showCacheBreakHint = this.shouldShowCacheBreakHint(
      /* excludeAutoModel */
      true
    );
    const listOptions = withChatInputPickerMotion({
      className: "chat-model-picker-dropdown",
      headerText: showCacheBreakHint ? localize(12621, null) : void 0,
      headerIcon: showCacheBreakHint ? Codicon.info : void 0,
      headerLink: showCacheBreakHint ? this.getCacheBreakLearnMoreLink() : void 0,
      headerDismiss: showCacheBreakHint ? () => this.dismissCacheBreakHint() : void 0,
      showFilter: !unavailable && !showOpenCodeSetup,
      secondaryHeading: currentChannel ? localize(12627, null, currentChannel) : void 0,
      filterPlaceholder: localize(12625, null),
      focusFilterOnOpen: true,
      collapsedByDefault: /* @__PURE__ */ new Set([ModelPickerSection.Other]),
      onDidToggleSection: (section, collapsed2) => {
        if (section === ModelPickerSection.Other) {
          logModelPickerInteraction(collapsed2 ? "otherModelsCollapsed" : "otherModelsExpanded");
        }
      },
      linkHandler: (uri5) => {
        if (uri5.scheme === "command" && uri5.path === "workbench.action.chat.upgradePlan") {
          logModelPickerInteraction("premiumModelUpgradePlanClicked");
        } else if (manageSettingsUrl && this._uriIdentityService.extUri.isEqual(uri5, URI.parse(manageSettingsUrl))) {
          logModelPickerInteraction("disabledModelContactAdminClicked");
        }
        void this._openerService.open(uri5, { allowCommands: true });
      },
      minWidth: 200,
      // A provider's verbose description is not a reason to stretch the menu
      // across the editor. Preserve room for the search field on small windows.
      maxWidth: Math.max(200, Math.min(560, getWindow(anchorElement).innerWidth - 32))
    });
    const previouslyFocusedElement = getActiveElement();
    const delegate = {
      onSelect: (action) => {
        this._actionWidgetService.hide();
        action.run();
      },
      onHide: () => {
        hoverDisposables.dispose();
        this._nameButton?.setAttribute("aria-expanded", "false");
        if (isHTMLElement(previouslyFocusedElement)) {
          previouslyFocusedElement.focus();
        }
      }
    };
    this._nameButton?.setAttribute("aria-expanded", "true");
    this._actionWidgetService.show(
      "ChatModelPicker",
      false,
      items,
      delegate,
      anchorElement,
      void 0,
      [],
      getModelPickerAccessibilityProvider(),
      listOptions
    );
  }
  _updateBadge() {
    if (this._badgeIcon) {
      if (this._badge) {
        const icon2 = this._badge === "info" ? Codicon.info : Codicon.warningCompact;
        reset(this._badgeIcon, renderIcon(icon2));
        this._badgeIcon.style.display = "";
        this._badgeIcon.classList.toggle("info", this._badge === "info");
        this._badgeIcon.classList.toggle("warning", this._badge === "warning");
      } else {
        this._badgeIcon.style.display = "none";
      }
    }
  }
  _renderLabel() {
    if (!this._domNode || !this._nameButton) {
      return;
    }
    const name = this._selectedModel ? getLanguageModelDisplayNameWithSubscriptionSource(this._selectedModel) : void 0;
    const { reason, activating, genericNoModels, noModels: noModelsAvailable } = this._availability();
    const restrictedMode = reason === "restricted" /* Restricted */;
    const setupRequired = reason === "setupRequired" /* SetupRequired */;
    const unavailable = reason !== void 0;
    const nameChildren = [];
    const modelIcon = this._selectedModel ? this._delegate.getPresentationOptions().showModelIcon ? getCompactModelPickerIcon(this._selectedModel) : this._selectedModel.metadata.statusIcon ? getCompactCodicon(this._selectedModel.metadata.statusIcon) : void 0 : void 0;
    const compact2 = this._compact?.get() ?? false;
    if (modelIcon && !noModelsAvailable) {
      nameChildren.push(renderIcon(modelIcon));
    }
    const modelLabel = unavailable ? localize(12623, null) : activating ? localize(12616, null) : genericNoModels ? this._usesOpenCodeProviders() ? localize(12628, null) : localize(12624, null) : name ?? localize(12620, null);
    const showModelLabel = !compact2 || !modelIcon || noModelsAvailable;
    if (showModelLabel) {
      nameChildren.push($("span.chat-input-picker-label", void 0, modelLabel));
    }
    if (this._badgeIcon) {
      nameChildren.push(this._badgeIcon);
    }
    reset(this._nameButton, ...nameChildren);
    this._domNode.classList.toggle("icon-only", !showModelLabel);
    if (this._configButton) {
      this._configuration.renderButton(this._configButton, compact2, noModelsAvailable);
    }
    const ariaLabel = restrictedMode ? localize(12618, null) : setupRequired ? localize(12619, null) : localize(12617, null, modelLabel);
    this._domNode.ariaLabel = ariaLabel;
    this._nameButton.ariaLabel = ariaLabel;
  }
};

ModelPickerWidget = __decorateClass([
  __decorateParam(1, IActionWidgetService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IOpenerService),
  __decorateParam(4, ITelemetryService),
  __decorateParam(5, ILanguageModelsService),
  __decorateParam(6, IProductService),
  __decorateParam(7, IChatEntitlementService),
  __decorateParam(8, IUpdateService),
  __decorateParam(9, IUriIdentityService),
  __decorateParam(10, IDefaultAccountService),
  __decorateParam(11, IWorkspaceTrustManagementService),
  __decorateParam(12, IWorkspaceTrustRequestService),
  __decorateParam(13, IStorageService),
  __decorateParam(14, IConfigurationService),
  __decorateParam(15, IInstantiationService)
], ModelPickerWidget);
export { CACHE_BREAK_HINT_DISMISSED_STORAGE_KEY, ModelPickerWidget };
