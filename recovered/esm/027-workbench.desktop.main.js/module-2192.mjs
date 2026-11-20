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
    if (this._ocPicker) {
      this._ocPicker.dispose();
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
    if (hasOpenCodeProvider && !this.isRestrictedMode()) {
      this._showOpenCodePicker(anchorElement, models, onSelect); // OpenCode: 按供应商分类的模型选择（参考 DSH）
      return;
    }
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
  /**
   * OpenCode: 模型选择下拉（参考 DSH）。顶部固定显示「最靠近上方的分类」（分类标题已完整显示时显示更上一个），
   * 中间按供应商分类列出模型，底部固定「配置供应商」。选择即切换模型。
   */
  _showOpenCodePicker(anchorElement, models, onSelect, initialQuery = "") {
    const doc = anchorElement.ownerDocument;
    const win = getWindow(anchorElement);
    // OpenCode: 主题色变量只定义在 .monaco-workbench 上，下拉必须挂在工作台容器内，否则变量全部未定义（透明背景、黑字）
    const host = anchorElement.closest?.(".monaco-workbench") ?? doc.querySelector(".monaco-workbench") ?? doc.body;
    doc.getElementById("oc-model-picker-style")?.remove();
    doc.getElementById("oc-model-picker-style-v2")?.remove();
    doc.getElementById("oc-model-picker-style-v3")?.remove();
    if (!doc.getElementById("oc-model-picker-style-v4")) {
      const style = doc.createElement("style");
      style.id = "oc-model-picker-style-v4";
      style.textContent = [
        ".oc-mp{position:fixed;z-index:2600;box-sizing:border-box;display:flex;flex-direction:column;min-width:260px;max-width:420px;background-color:var(--vscode-menu-background,var(--vscode-quickInput-background,var(--vscode-editorWidget-background,#252526)));color:var(--vscode-menu-foreground,var(--vscode-quickInput-foreground,var(--vscode-foreground,#cccccc)));border:1px solid var(--vscode-menu-border,var(--vscode-widget-border,var(--vscode-contrastBorder,rgba(128,128,128,.35))));border-radius:8px;box-shadow:0 6px 20px var(--vscode-widget-shadow,rgba(0,0,0,.45));font-family:var(--vscode-font-family,inherit);font-size:13px;line-height:normal;overflow:hidden;outline:none;opacity:1}",
        ".oc-mp *{box-sizing:border-box}",
        ".oc-mp-top,.oc-mp-h{display:flex;align-items:center;gap:6px;height:26px;padding:0 10px;font-size:11px;font-weight:600;letter-spacing:.02em;color:var(--vscode-descriptionForeground,#9d9d9d);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
        ".oc-mp-top{flex:none;background-color:inherit;border-bottom:1px solid var(--vscode-menu-separatorBackground,var(--vscode-widget-border,rgba(128,128,128,.25)));cursor:pointer}",
        ".oc-mp-top.empty{cursor:default}",
        ".oc-mp-top .oc-mp-count,.oc-mp-h .oc-mp-count{margin-left:auto;font-weight:400;opacity:.8}",
        ".oc-mp-list{position:relative;flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;padding:2px 0 4px;background-color:inherit}",
        ".oc-mp-h{margin-top:4px}",
        ".oc-mp-row{display:flex;align-items:center;gap:6px;height:26px;padding:0 10px 0 10px;margin:0 4px;border-radius:4px;cursor:pointer;white-space:nowrap;color:inherit}",
        ".oc-mp-row .codicon{flex:none;width:16px;font-size:14px;color:inherit}",
        ".oc-mp-row .oc-mp-name{overflow:hidden;text-overflow:ellipsis}",
        ".oc-mp-row:hover{background-color:var(--vscode-list-hoverBackground,rgba(128,128,128,.18));color:var(--vscode-list-hoverForeground,inherit)}",
        ".oc-mp-row.selected{background-color:var(--vscode-list-inactiveSelectionBackground,rgba(128,128,128,.22));color:var(--vscode-list-inactiveSelectionForeground,inherit)}",
        ".oc-mp-row.selected .oc-mp-name{font-weight:600}",
        ".oc-mp-row.focused{background-color:var(--vscode-menu-selectionBackground,var(--vscode-list-activeSelectionBackground,#04395e));color:var(--vscode-menu-selectionForeground,var(--vscode-list-activeSelectionForeground,#ffffff))}",
        ".oc-mp-empty{padding:12px 14px;white-space:normal;color:var(--vscode-descriptionForeground,#9d9d9d)}",
        ".oc-mp-foot{flex:none;display:flex;align-items:center;gap:6px;height:32px;padding:0 12px;background-color:inherit;border-top:1px solid var(--vscode-menu-separatorBackground,var(--vscode-widget-border,rgba(128,128,128,.25)));cursor:pointer;color:inherit}",
        ".oc-mp-foot:hover,.oc-mp-foot:focus-visible{background-color:var(--vscode-list-hoverBackground,rgba(128,128,128,.18));outline:none}",
        ".oc-mp:focus-visible{outline:1px solid var(--vscode-focusBorder,#007fd4);outline-offset:-1px}",
        ".oc-mp-search{flex:none;padding:6px 6px 4px;background-color:inherit}",
        ".oc-mp-search input{display:block;width:100%;height:26px;margin:0;padding:0 8px;border-radius:4px;border:1px solid var(--vscode-input-border,rgba(128,128,128,.35));background-color:var(--vscode-input-background,#3c3c3c);color:var(--vscode-input-foreground,#cccccc);font-family:inherit;font-size:13px;outline:none}",
        ".oc-mp-search input:focus{border-color:var(--vscode-focusBorder,#007fd4)}",
        ".oc-mp-search input::placeholder{color:var(--vscode-input-placeholderForeground,rgba(204,204,204,.5))}",
        ".oc-mp .oc-mp-hide{display:none!important}",
        // OpenCode: 列表滚动条与编辑器一致（细条、无上下箭头、透明轨道），不用系统默认白色滚动条
        ".oc-mp-list{scrollbar-width:auto;scrollbar-color:auto}",
        ".oc-mp-list::-webkit-scrollbar{width:10px;height:10px}",
        ".oc-mp-list::-webkit-scrollbar-track,.oc-mp-list::-webkit-scrollbar-corner{background:transparent}",
        ".oc-mp-list::-webkit-scrollbar-button{display:none;width:0;height:0}",
        ".oc-mp-list::-webkit-scrollbar-thumb{background-color:var(--vscode-scrollbarSlider-background,rgba(121,121,121,.4));border:none;border-radius:0;min-height:20px}",
        ".oc-mp-list::-webkit-scrollbar-thumb:hover{background-color:var(--vscode-scrollbarSlider-hoverBackground,rgba(100,100,100,.7))}",
        ".oc-mp-list::-webkit-scrollbar-thumb:active{background-color:var(--vscode-scrollbarSlider-activeBackground,rgba(191,191,191,.4))}"
      ].join("\n");
      (doc.head || doc.documentElement).appendChild(style);
    }
    const groupMap = buildModelToProviderGroupMap(this._languageModelsService);
    const vendorNames = new Map(this._languageModelsService.getVendors().map((v) => [v.vendor, v.displayName]));
    const groups = new Map();
    for (const model of models) {
      const entry = groupMap.get(model.identifier);
      const vendorName = vendorNames.get(model.metadata.vendor);
      const label3 = entry?.groupName && entry.groupName !== vendorName ? entry.groupName : model.metadata.detail || entry?.groupName || vendorName || "\u5176\u4ED6";
      if (!groups.has(label3)) groups.set(label3, []);
      groups.get(label3).push(model);
    }
    const root = doc.createElement("div");
    root.className = "oc-mp";
    root.tabIndex = -1;
    root.setAttribute("role", "listbox");
    // OpenCode: 顶部搜索框，按模型名称/ID 过滤所有供应商的模型（实时刷新时保留输入）
    const searchBox = doc.createElement("div");
    searchBox.className = "oc-mp-search";
    const search = doc.createElement("input");
    search.type = "text";
    search.placeholder = "\u641C\u7D22\u6A21\u578B";
    search.spellcheck = false;
    search.setAttribute("autocomplete", "off");
    search.setAttribute("aria-label", "\u641C\u7D22\u6A21\u578B");
    search.value = initialQuery || "";
    searchBox.appendChild(search);
    const top = doc.createElement("div");
    top.className = "oc-mp-top";
    const list = doc.createElement("div");
    list.className = "oc-mp-list";
    const foot = doc.createElement("div");
    foot.className = "oc-mp-foot";
    foot.append(renderIcon(Codicon.settingsGear), doc.createTextNode("\u914D\u7F6E\u4F9B\u5E94\u5546"));
    root.append(searchBox, top, list, foot);
    const headers = [];
    const rows = [];
    let visibleRows = rows;
    let selectedRow;
    for (const [label3, groupModels] of groups) {
      const h = doc.createElement("div");
      h.className = "oc-mp-h";
      const t = doc.createElement("span");
      t.textContent = label3;
      const c = doc.createElement("span");
      c.className = "oc-mp-count";
      c.textContent = String(groupModels.length);
      h.append(t, c);
      list.appendChild(h);
      const header = { el: h, label: label3, count: groupModels.length, countEl: c, rows: [], hidden: false };
      headers.push(header);
      for (const model of groupModels) {
        const row = doc.createElement("div");
        const selected = model.identifier === this._selectedModel?.identifier;
        row.className = "oc-mp-row" + (selected ? " selected" : "");
        row.setAttribute("role", "option");
        row.setAttribute("aria-selected", String(selected));
        row.title = model.metadata.tooltip || model.metadata.name;
        const name = doc.createElement("span");
        name.className = "oc-mp-name";
        name.textContent = model.metadata.name;
        row.append(renderIcon(selected ? Codicon.check : Codicon.blank), name);
        row.addEventListener("mousedown", (e) => { e.preventDefault(); e.stopPropagation(); });
        row.addEventListener("click", () => { close(); onSelect(model); });
        row.addEventListener("mousemove", () => focusRow(visibleRows.indexOf(row), false));
        list.appendChild(row);
        rows.push(row);
        header.rows.push(row);
        row._ocSearch = [model.metadata.name, model.metadata.id, model.identifier].filter(Boolean).join("\n").toLowerCase();
        if (selected) selectedRow = row;
      }
    }
    if (!rows.length) {
      const empty = doc.createElement("div");
      empty.className = "oc-mp-empty";
      // OpenCode: 供应商扩展尚未返回模型时显示加载中，并主动触发一次解析（列表到达后下拉会自动刷新）
      const loading = !this._languageModelsService.hasResolvedVendor?.("opencode");
      empty.textContent = loading ? "\u6B63\u5728\u52A0\u8F7D\u6A21\u578B\u2026" : "\u8FD8\u6CA1\u6709\u53EF\u7528\u6A21\u578B\uFF0C\u8BF7\u5148\u5728\u300C\u914D\u7F6E\u4F9B\u5E94\u5546\u300D\u4E2D\u6DFB\u52A0\u6216\u5BFC\u5165";
      list.appendChild(empty);
      if (loading) void this._languageModelsService.selectLanguageModels({ vendor: "opencode" }).catch(() => void 0);
    }
    let topTarget;
    const updateTop = () => {
      const scrollTop = list.scrollTop;
      let current;
      for (const h of headers) {
        if (h.hidden) continue;
        if (h.el.offsetTop < scrollTop) current = h;
        else break;
      }
      topTarget = current;
      top.textContent = "";
      const t = doc.createElement("span");
      const c = doc.createElement("span");
      c.className = "oc-mp-count";
      if (current) {
        t.textContent = current.label;
        c.textContent = String(current.count);
      } else {
        t.textContent = "\u6A21\u578B";
        c.textContent = String(visibleRows.length);
      }
      top.classList.toggle("empty", !current);
      top.append(t, c);
    };
    let focusIndex = -1;
    const focusRow = (index, reveal) => {
      if (!visibleRows.length) { focusIndex = -1; rows.forEach((r) => r.classList.remove("focused")); return; }
      focusIndex = Math.max(0, Math.min(visibleRows.length - 1, index));
      rows.forEach((r) => r.classList.toggle("focused", r === visibleRows[focusIndex]));
      if (reveal) visibleRows[focusIndex].scrollIntoView({ block: "nearest" });
    };
    // OpenCode: 搜索过滤——不匹配的模型隐藏，没有匹配模型的分类整组隐藏，分类计数显示匹配数
    let noMatch;
    const applyFilter = () => {
      const q = search.value.trim().toLowerCase();
      visibleRows = [];
      for (const h of headers) {
        let n = 0;
        for (const r of h.rows) {
          const show = !q || r._ocSearch.includes(q);
          r.classList.toggle("oc-mp-hide", !show);
          if (show) { n++; visibleRows.push(r); }
        }
        h.hidden = n === 0;
        h.el.classList.toggle("oc-mp-hide", h.hidden);
        h.count = n;
        h.countEl.textContent = q ? n + " / " + h.rows.length : String(h.rows.length);
      }
      if (rows.length && !visibleRows.length) {
        if (!noMatch) { noMatch = doc.createElement("div"); noMatch.className = "oc-mp-empty"; list.appendChild(noMatch); }
        noMatch.textContent = "\u6CA1\u6709\u5339\u914D\u300C" + search.value.trim() + "\u300D\u7684\u6A21\u578B";
        noMatch.classList.remove("oc-mp-hide");
      } else noMatch?.classList.add("oc-mp-hide");
    };
    const disposables = new DisposableStore();
    const close = () => {
      if (this._ocPicker !== handle) return;
      this._ocPicker = void 0;
      disposables.dispose();
      root.remove();
      this._nameButton?.setAttribute("aria-expanded", "false");
    };
    const handle = { dispose: close };
    this._ocPicker = handle;
    top.addEventListener("mousedown", (e) => { e.preventDefault(); e.stopPropagation(); });
    top.addEventListener("click", () => {
      if (topTarget) list.scrollTop = topTarget.el.offsetTop;
    });
    foot.addEventListener("mousedown", (e) => { e.preventDefault(); e.stopPropagation(); });
    foot.addEventListener("click", () => {
      close();
      void this._commandService.executeCommand("opencode.manageProviders");
    });
    list.addEventListener("scroll", updateTop);
    root.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { e.preventDefault(); close(); anchorElement.focus?.(); }
      else if (e.key === "ArrowDown") { e.preventDefault(); focusRow(focusIndex + 1, true); }
      else if (e.key === "ArrowUp") { e.preventDefault(); focusRow(focusIndex - 1, true); }
      else if (e.key === "Enter" && focusIndex >= 0 && visibleRows[focusIndex]) { e.preventDefault(); visibleRows[focusIndex].click(); }
    });
    search.addEventListener("input", () => {
      applyFilter();
      if (search.value.trim()) { list.scrollTop = 0; focusRow(0, false); }
      else {
        const sel = selectedRow && visibleRows.indexOf(selectedRow);
        focusRow(sel >= 0 ? sel : 0, true);
      }
      updateTop();
    });
    disposables.add(addDisposableListener(doc, "mousedown", (e) => {
      if (!root.contains(e.target) && !this._domNode?.contains(e.target)) close();
    }, true));
    // OpenCode oc-mp-esc-global: 焦点不在弹窗里（例如还没有模型、搜索框没拿到焦点）时 Esc 也能关闭
    disposables.add(addDisposableListener(doc, "keydown", (e) => {
      if (e.key !== "Escape" || root.contains(doc.activeElement)) return;
      e.preventDefault(); e.stopPropagation(); close();
    }, true));
    disposables.add(addDisposableListener(win, "resize", () => close()));
    disposables.add(addDisposableListener(win, "blur", () => close()));
    // OpenCode: 打开期间模型列表变化（扩展晚于界面完成加载）时原位刷新
    disposables.add(this._languageModelsService.onDidChangeLanguageModels(() => {
      if (this._ocPicker !== handle) return;
      const query = search.value;
      close();
      this._showOpenCodePicker(anchorElement, this._getPickerModels(), onSelect, query);
    }));
    host.appendChild(root);
    const rect = anchorElement.getBoundingClientRect();
    const spaceAbove = rect.top - 8;
    const spaceBelow = win.innerHeight - rect.bottom - 8;
    // OpenCode: 默认在按钮上方展开（输入框在底部），上方空间不足且下方更大时才向下
    const above = spaceAbove >= 200 || spaceAbove >= spaceBelow;
    root.style.maxHeight = Math.max(120, Math.min(440, above ? spaceAbove : spaceBelow)) + "px";
    const width = Math.min(420, Math.max(240, root.offsetWidth));
    root.style.left = Math.max(8, Math.min(rect.left, win.innerWidth - width - 8)) + "px";
    if (above) root.style.bottom = win.innerHeight - rect.top + 4 + "px";
    else root.style.top = rect.bottom + 4 + "px";
    applyFilter();
    if (search.value.trim()) {
      list.scrollTop = 0;
      focusRow(0, false);
    } else if (selectedRow) {
      list.scrollTop = Math.max(0, selectedRow.offsetTop - (list.clientHeight - selectedRow.offsetHeight) / 2);
      focusRow(visibleRows.indexOf(selectedRow), false);
    }
    updateTop();
    this._nameButton?.setAttribute("aria-expanded", "true");
    // OpenCode: 打开即聚焦搜索框，方向键/回车/Esc 由 root 的 keydown 统一处理
    search.focus();
    search.setSelectionRange(search.value.length, search.value.length);
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
    const openCodeLabel = this._usesOpenCodeProviders(); // OpenCode: 始终显示当前所选模型名称
    const showModelLabel = !compact2 || !modelIcon || noModelsAvailable || openCodeLabel;
    if (showModelLabel) {
      const labelEl = $("span.chat-input-picker-label", void 0, modelLabel);
      if (openCodeLabel) {
        labelEl.style.maxWidth = "200px";
        labelEl.style.overflow = "hidden";
        labelEl.style.textOverflow = "ellipsis";
        labelEl.style.whiteSpace = "nowrap";
        labelEl.title = this._selectedModel ? `${modelLabel}${this._selectedModel.metadata.detail ? " \xB7 " + this._selectedModel.metadata.detail : ""}` : modelLabel;
      }
      nameChildren.push(labelEl);
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
