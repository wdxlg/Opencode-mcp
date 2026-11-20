// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widget/input/chatInputPart.ts
import { $, AnimationFrameScheduler, DisposableResizeObserver, EventType, addDisposableListener, addStandardDisposableListener, append, clearNode, getTotalWidth, getWindow, h, hide, isHTMLElement, isKeyboardEvent, scheduleAtNextAnimationFrame, setVisibility, show } from "./module-0075.mjs";
import { ChatInputPickerResponsiveLayout, isChatInputPickerResponsiveState } from "./module-2177.mjs";
import { ChatEditingSessionSubmitAction, ChatSessionPrimaryPickerAction, ChatSubmitAction, OpenDelegationPickerAction, OpenModePickerAction, OpenModelPickerAction, OpenSessionTargetPickerAction, OpenWorkspacePickerAction } from "./module-2062.mjs";
import { observableMemento } from "./module-1017.mjs";
import { deserializeUntitledInputAttachments, deserializeUntitledInputState, serializeUntitledInputAttachments, serializeUntitledInputState } from "./module-2053.mjs";
import { mixin } from "./module-0098.mjs";
import { Disposable, DisposableMap, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { DeferredPromise, RunOnceScheduler } from "./module-0036.mjs";
import { ChatInputNoticeHost } from "./module-1468.mjs";
import { IntendedModelSlot, logChangesToStateModel } from "./module-1193.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { Lazy } from "./module-0028.mjs";
import { derived, derivedOpts } from "./module-0054.mjs";
import { filterModelsForSession, hasModelsTargetingSession, isModelHiddenInPicker, isModelSupportedForInlineChat, isModelSupportedForMode, isNewConversation, isSessionStarted, mergeModelsWithCache, shouldDropAgnosticDraftModel, shouldResetOnModelListChange, shouldRestorePerTypeModelOnSessionSwitch } from "./module-2036.mjs";
import { ChatModelSelectionDiagnostics } from "./module-2049.mjs";
import { ChatInputModelSelectionController } from "./module-2050.mjs";
import { ChatModelConfigurationStore } from "./module-2052.mjs";
import { ResourceLabels } from "./module-1323.mjs";
import { ChatMode, IChatModeService, getModeNameForTelemetry } from "./module-1470.mjs";
import { LocalChatSessionUri, getChatSessionType, isUntitledChatSession } from "./module-0961.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { autorun } from "./module-0052.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { ChatAttachmentModel } from "./module-2093.mjs";
import { ChatSelectedTools } from "./module-2178.mjs";
import { ChatDragAndDrop } from "./module-2169.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { ChatHistoryNavigator } from "./module-1471.mjs";
import { CollapsibleListPool } from "./module-2154.mjs";
import { MenuId, MenuItemAction } from "./module-0092.mjs";
import { ILogService, canLog } from "./module-0095.mjs";
import { IChatSessionsService, SessionType, isAgentHostTarget, isIChatSessionFileChange2, localChatSessionType } from "./module-0960.mjs";
import { ChatRequestVariableSet, getImageAttachmentLimit, isAgentHostCompletionVariableEntry, isBrowserViewVariableEntry, isElementVariableEntry, isExplicitFileOrImageVariableEntry, isImageVariableEntry, isNotebookOutputVariableEntry, isPasteVariableEntry, isPastedTextArtifact, isPromptFileVariableEntry, isPromptTextVariableEntry, isSCMHistoryItemChangeRangeVariableEntry, isSCMHistoryItemChangeVariableEntry, isSCMHistoryItemVariableEntry, isStringVariableEntry } from "./module-0979.mjs";
import { getChatPetPillPlatformTop, getChatPetStackPlatformTop } from "./module-2172.mjs";
import { isInConversationModelChoice, resolveConfiguredModel } from "./module-2048.mjs";
import { getStoredSelectedModel, storeSelectedModel } from "./module-2045.mjs";
import { ILanguageModelChatMetadata, ILanguageModelsService } from "./module-0967.mjs";
import { isDefined } from "./module-0010.mjs";
import { ChatPetAchievementIds, didExplicitlySwitchChatPetModel } from "./module-2138.mjs";
import { ModePickerActionItem, isModeConsideredBuiltIn } from "./module-2194.mjs";
import { ChatSessionPickerActionItem } from "./module-2099.mjs";
import { equals } from "./module-0007.mjs";
import { Iterable } from "./module-0011.mjs";
import { localize } from "./module-0001.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { resizeImage } from "./module-0944.mjs";
import { status } from "./module-0076.mjs";
import { isDictationActiveForEditor, notifyDictationSubmitted, onDidChangeDictationEditor } from "./module-1349.mjs";
import { isMacintosh } from "./module-0014.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { handleTerminalCommandPaste, isTerminalCommandInput, isTerminalCommandPaste } from "./module-2157.mjs";
import { Range2 } from "./module-0106.mjs";
import { EDITOR_FONT_DEFAULTS } from "./module-0101.mjs";
import { DEFAULT_FONT_FAMILY } from "./module-0312.mjs";
import { AgentSessionProviders, getAgentSessionProvider } from "./module-0982.mjs";
import { ChatInputNotificationWidget } from "./module-2175.mjs";
import { constObservable } from "./module-0061.mjs";
import { transaction } from "./module-0045.mjs";
import { chatInputStackClass, chatInputStackSlotClass, chatInputSurfaceStackClass, chatInputSurfaceStackSlotClass, setChatInputStackInputFocused, setChatInputStackSlot } from "./module-2038.mjs";
import { registerChatInputOnboardingHosts } from "./module-2176.mjs";
import { ChatContextUsageWidget } from "./module-2198.mjs";
import { ChatImplicitContexts } from "./module-2094.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { registerAndCreateHistoryNavigationContext } from "./module-0603.mjs";
import { getSimpleCodeEditorWidgetOptions, getSimpleEditorOptions, setupSimpleEditorSelectionStyling } from "./module-1837.mjs";
import { EditorOptions } from "./module-0105.mjs";
import { EditorExtensionsRegistry } from "./module-0097.mjs";
import { ContentHoverController } from "./module-0654.mjs";
import { GlyphHoverController } from "./module-0809.mjs";
import { DropIntoEditorController } from "./module-0671.mjs";
import { CopyPasteController } from "./module-0555.mjs";
import { LinkDetector } from "./module-0822.mjs";
import { InlineCompletionsController } from "./module-0796.mjs";
import { PlaceholderTextContribution } from "./module-0832.mjs";
import { CodeEditorWidget } from "./module-0441.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { SuggestController } from "./module-0758.mjs";
import { hasModifierKeys } from "./module-0022.mjs";
import { createInstantHoverDelegate } from "./module-0448.mjs";
import { ConfigureToolsAction } from "./module-2203.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { IChatPhoneInputPresenter, MobileChatInputCombinedPickerActionItem } from "./module-2135.mjs";
import { ModelPickerActionItem } from "./module-2193.mjs";
import { SessionTypePickerActionItem } from "./module-2183.mjs";
import { DelegationSessionPickerActionItem } from "./module-2184.mjs";
import { ChatVoiceInputModeAction, VoiceInputModeActionViewItem } from "./module-2084.mjs";
import { MenuEntryActionViewItem } from "./module-0516.mjs";
import { ChatSpeechToTextConnectingAction, ChatSpeechToTextPreparingAction, ToggleChatSpeechToTextAction } from "./module-2085.mjs";
import { DictationDownloadActionViewItem } from "./module-2087.mjs";
import { DictationActionViewItem } from "./module-2086.mjs";
import { VoiceModeActionViewItem } from "./module-2088.mjs";
import { Codicon } from "./module-0085.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { OpenAgentHostCodexApprovalsPickerAction, OpenAgentHostFolderPickerAction, OpenAgentHostModePickerAction, OpenAgentHostPermissionModePickerAction, getAgentHostPickerProperty } from "./module-2126.mjs";
import { AgentHostGenericConfigChips } from "./module-2127.mjs";
import { WorkspacePickerActionItem } from "./module-2196.mjs";
import { AgentHostChatInputPicker, AgentHostChatInputPickerActionViewItem } from "./module-2125.mjs";
import { AgentHostFolderPickerActionItem } from "./module-2133.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { isLocation } from "./module-0164.mjs";
import { ImplicitContextAttachmentWidget } from "./module-2095.mjs";
import { BrowserViewAttachmentWidget, DefaultChatAttachmentWidget, ElementChatAttachmentWidget, FileAttachmentWidget, ImageAttachmentWidget, NotebookCellOutputChatAttachmentWidget, PasteAttachmentWidget, PromptFileAttachmentWidget, PromptTextAttachmentWidget, SCMHistoryItemAttachmentWidget, SCMHistoryItemChangeAttachmentWidget, SCMHistoryItemChangeRangeAttachmentWidget, TerminalCommandAttachmentWidget, ToolSetOrToolItemAttachmentWidget } from "./module-2032.mjs";
import { ChatDynamicVariableModel } from "./module-0984.mjs";
import { ChatTodoListWidget } from "./module-2155.mjs";
import { ChatArtifactsWidget } from "./module-2156.mjs";
import { isResponseVM } from "./module-0978.mjs";
import { ChatQuestionCarouselPart } from "./module-2147.mjs";
import { ChatPlanReviewPart } from "./module-2145.mjs";
import { ChatToolConfirmationCarouselPart } from "./module-2148.mjs";
import { ResourceSet } from "./module-0008.mjs";
import { getAgentSessionPullRequestContextValue } from "./module-1463.mjs";
import { bindContextKey } from "./module-0444.mjs";
import { ButtonWithIcon } from "./module-0546.mjs";
import { MenuWorkbenchButtonBar } from "./module-2011.mjs";
import { ChatEditingShowChangesAction, ViewPreviousEditsAction } from "./module-2056.mjs";
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "./module-0934.mjs";
import { ChatFollowups } from "./module-2173.mjs";
import { IChatWidgetService, isIChatResourceViewContext, isIChatViewViewContext } from "./module-0981.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IModelService } from "./module-0080.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IFileService } from "./module-0269.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IChatAgentService } from "./module-0974.mjs";
import { ISharedWebContentExtractorService } from "./module-2044.mjs";
import { IChatEntitlementService } from "./module-0953.mjs";
import { ILanguageModelToolsService } from "./module-0990.mjs";
import { IChatContextService } from "./module-1454.mjs";
import { IAgentSessionsService } from "./module-1464.mjs";
import { IChatSpeechToTextService } from "./module-1348.mjs";
import { IDictationOnboardingService } from "./module-2042.mjs";
import { IChatInputNoticeHubService } from "./module-1469.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { ISCMService } from "./module-1080.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { IChatAttachmentWidgetRegistry } from "./module-2033.mjs";
import { IChatInputNotificationService } from "./module-1461.mjs";
import { IProductService } from "./module-0873.mjs";
import { IVoiceModeOnboardingService } from "./module-2043.mjs";
import { IVoiceSessionController } from "./module-2076.mjs";
import { IChatService } from "./module-0972.mjs";
import { IWorkbenchEnvironmentService } from "./module-0935.mjs";
import { IChatPetService } from "./module-2139.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { ActionViewItem, BaseActionViewItem } from "./module-0476.mjs";


// src/vs/workbench/contrib/chat/browser/widget/input/chatInputPart.ts
var $43 = $;

var INPUT_EDITOR_MAX_HEIGHT = 250;

var INPUT_EDITOR_LINE_HEIGHT = 20;

var INPUT_EDITOR_PADDING = { compact: { top: 2, bottom: 2 }, default: { top: 12, bottom: 12 } };

var CachedLanguageModelsKey = "chat.cachedLanguageModels.v2";


function getToolbarPickerResponsiveItems(toolbar, compactStates) {
  const items = [];
  const visibleActionIds = /* @__PURE__ */ new Set();
  for (let index2 = 0; index2 < toolbar.getItemsLength(); index2++) {
    const action = toolbar.getItemAction(index2);
    const state = action && compactStates.get(action.id);
    const viewItem = toolbar.getItemViewItem(index2);
    const viewItemState = isChatInputPickerResponsiveState(viewItem) ? viewItem : void 0;
    if (!action || !state && !viewItemState) {
      continue;
    }
    visibleActionIds.add(action.id);
    const element = toolbar.getItemElement(index2);
    items.push({
      element,
      // The selected model is the conversation's most useful identity. Keep
      // its name visible longer than the mode label as the sidebar narrows.
      compactPriority: action.id === OpenModePickerAction.ID ? 1 : action.id === OpenModelPickerAction.ID ? -1 : 0,
      isCompact: () => viewItemState?.isCompact() ?? state.get(),
      setCompact: (compact2) => {
        state?.set(compact2, void 0);
        viewItemState?.setCompact(compact2);
        element?.classList.toggle("compact-picker", compact2);
      }
    });
  }
  for (const [actionId, state] of compactStates) {
    if (!visibleActionIds.has(actionId)) {
      items.push({
        element: void 0,
        isCompact: () => state.get(),
        setCompact: (compact2) => state.set(compact2, void 0)
      });
    }
  }
  return items;
}

function isShowableActionViewItem(item) {
  return !!item && "show" in item && typeof item.show === "function";
}

function createOverflowAction(action, run) {
  return {
    id: action.id,
    label: action.label,
    tooltip: action.tooltip,
    class: action.class,
    enabled: action.enabled,
    checked: action.checked,
    run
  };
}

var LEGACY_SHARED_INPUT_STATE_TAGS = /* @__PURE__ */ new Set(["view", "editor", "quick"]);

function getInputStateStorageKey(widgetViewKindTag) {
  if (LEGACY_SHARED_INPUT_STATE_TAGS.has(widgetViewKindTag)) {
    return "chat.untitledInputState";
  }
  return `chat.untitledInputState.${widgetViewKindTag}`;
}

function createEmptyInputStateMemento(widgetViewKindTag) {
  return observableMemento({
    defaultValue: void 0,
    key: getInputStateStorageKey(widgetViewKindTag),
    toStorage: serializeUntitledInputState,
    fromStorage(value2) {
      const obj = deserializeUntitledInputState(value2);
      if (obj.selectedModel && !obj.selectedModel.metadata.isDefaultForLocation) {
        const oldIsDefault = obj.selectedModel.metadata.isDefault;
        const isDefaultForLocation = { ["panel" /* Chat */]: Boolean(oldIsDefault) };
        mixin(obj.selectedModel.metadata, { isDefaultForLocation });
        delete obj.selectedModel.metadata.isDefault;
      }
      return obj;
    }
  });
}

var emptyInputAttachments = observableMemento({
  defaultValue: [],
  key: "chat.untitledInputAttachments",
  toStorage: serializeUntitledInputAttachments,
  fromStorage: deserializeUntitledInputAttachments
});

var ChatInputPart = class extends Disposable {
  constructor(location2, options3, styles, inline3, modelService, instantiationService, contextKeyService, configurationService, keybindingService, accessibilityService, languageModelsService, logService, fileService, editorService, themeService, textModelResolverService, storageService, dialogService, agentService, sharedWebExtracterService, entitlementService, chatModeService, toolService, chatSessionsService, chatContextService, agentSessionsService, speechToTextService, dictationOnboardingService, chatInputNoticeHubService, workspaceContextService, scmService, layoutService, viewDescriptorService, _chatAttachmentWidgetRegistry, chatInputNotificationService, chatPhoneInputPresenter, productService, voiceModeOnboardingService, chatWidgetService, voiceSessionController, chatService, environmentService, chatPetService, actionViewItemService) {
    super();
    this.location = location2;
    this.options = options3;
    this.inline = inline3;
    this.modelService = modelService;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.configurationService = configurationService;
    this.keybindingService = keybindingService;
    this.accessibilityService = accessibilityService;
    this.languageModelsService = languageModelsService;
    this.logService = logService;
    this.fileService = fileService;
    this.editorService = editorService;
    this.themeService = themeService;
    this.textModelResolverService = textModelResolverService;
    this.storageService = storageService;
    this.dialogService = dialogService;
    this.agentService = agentService;
    this.sharedWebExtracterService = sharedWebExtracterService;
    this.entitlementService = entitlementService;
    this.chatModeService = chatModeService;
    this.toolService = toolService;
    this.chatSessionsService = chatSessionsService;
    this.chatContextService = chatContextService;
    this.agentSessionsService = agentSessionsService;
    this.speechToTextService = speechToTextService;
    this.dictationOnboardingService = dictationOnboardingService;
    this.chatInputNoticeHubService = chatInputNoticeHubService;
    this.workspaceContextService = workspaceContextService;
    this.scmService = scmService;
    this.layoutService = layoutService;
    this.viewDescriptorService = viewDescriptorService;
    this._chatAttachmentWidgetRegistry = _chatAttachmentWidgetRegistry;
    this.chatInputNotificationService = chatInputNotificationService;
    this.chatPhoneInputPresenter = chatPhoneInputPresenter;
    this.productService = productService;
    this.voiceModeOnboardingService = voiceModeOnboardingService;
    this.chatWidgetService = chatWidgetService;
    this.voiceSessionController = voiceSessionController;
    this.chatService = chatService;
    this.environmentService = environmentService;
    this.chatPetService = chatPetService;
    this.actionViewItemService = actionViewItemService;
    this._workingSetCollapsed = observableValue("chatInputPart.workingSetCollapsed", true);
    this._chatInputTodoListWidget = this._register(new MutableDisposable());
    this._chatArtifactsWidget = this._register(new MutableDisposable());
    this._chatQuestionCarouselWidgets = this._register(new DisposableMap());
    this._questionCarouselResponseIds = /* @__PURE__ */ new Map();
    this._questionCarouselSessionResources = /* @__PURE__ */ new Map();
    this._chatPlanReviewWidgets = this._register(new DisposableMap());
    this._planReviewResponseIds = /* @__PURE__ */ new Map();
    this._planReviewSessionResources = /* @__PURE__ */ new Map();
    this._chatToolConfirmationCarousels = this._register(new DisposableMap());
    this._onDidChangeActiveConfirmationSubagent = this._register(new Emitter());
    this.onDidChangeActiveConfirmationSubagent = this._onDidChangeActiveConfirmationSubagent.event;
    this._chatEditingTodosDisposables = this._register(new DisposableStore());
    this._onDidLoadInputState = this._register(new Emitter());
    this.onDidLoadInputState = this._onDidLoadInputState.event;
    this._toolbarRelayoutScheduler = this._register(new RunOnceScheduler(() => {
      this.layoutForToolbarChange();
    }, 0));
    this._onDidFocus = this._register(new Emitter());
    this.onDidFocus = this._onDidFocus.event;
    this._onDidBlur = this._register(new Emitter());
    this.onDidBlur = this._onDidBlur.event;
    this._onDidChangeContext = this._register(new Emitter());
    this.onDidChangeContext = this._onDidChangeContext.event;
    this._onDidAcceptFollowup = this._register(new Emitter());
    this.onDidAcceptFollowup = this._onDidAcceptFollowup.event;
    this._onDidClickOverlay = this._register(new Emitter());
    this.onDidClickOverlay = this._onDidClickOverlay.event;
    this._indexOfLastAttachedContextDeletedWithKeyboard = -1;
    this._indexOfLastOpenedContext = -1;
    this._onDidChangeVisibility = this._register(new Emitter());
    this.inputEditorHeight = 0;
    this.ignoreInputEditorContentSizeChanges = false;
    this.followupsDisposables = this._register(new DisposableStore());
    this.overlayClickListener = this._register(new MutableDisposable());
    this.attachedContextDisposables = this._register(new MutableDisposable());
    this._chatPetHorizontalPlatformProviders = /* @__PURE__ */ new Set();
    this._onDidChangeChatPetHorizontalPlatforms = this._register(new Emitter());
    this.onDidChangeChatPetHorizontalPlatforms = this._onDidChangeChatPetHorizontalPlatforms.event;
    this._notificationWidget = this._register(new MutableDisposable());
    this._contextUsageDisposables = this._register(new MutableDisposable());
    /** Arbitrates which notice occupies the area above this input. */
    this.noticeHost = this._register(new ChatInputNoticeHost(() => this.focus()));
    this.height = observableValue(this, 0);
    this._forceVisibleScrollbarUntilAccept = false;
    /**
     * Speaks for the intended model while no conversation is bound — the inline request-edit input
     * part never binds one. Keeping it off the conversation is what makes that editor
     * self-contained: picking a model there to resubmit one request leaves the chat's own model
     * alone.
     */
    this._unboundIntent = new IntendedModelSlot();
    /**
     * Whether the session being switched to should restore the model remembered for its type.
     * Latched while the switch is in flight because the decision is made before the view model
     * arrives and acted on after. Held here rather than in the shared selection controller: it
     * describes this widget's handshake, not what a conversation runs on.
     */
    this._restorePerTypeModel = false;
    // Disposables for model observation
    this._modelSyncDisposables = this._register(new DisposableStore());
    this._currentChatModes = this._register(new MutableDisposable());
    // Flag to prevent circular updates between view and model
    this._isSyncingToOrFromInputModel = false;
    this.overflowPickerWidget = this._register(new MutableDisposable());
    this.chatSessionPickerWidgets = this._register(new DisposableMap());
    this._chatSessionOptionEmitters = this._register(new DisposableMap());
    /**
     * Map of option group ID to its context key.
     * Keys follow the pattern `chatSessionOption.<groupId>` and hold the currently selected option item ID.
     */
    this._optionContextKeys = /* @__PURE__ */ new Map();
    this._onDidChangeCurrentChatMode = this._register(new Emitter());
    this.onDidChangeCurrentChatMode = this._onDidChangeCurrentChatMode.event;
    this.inputUri = URI.parse(`${Schemas.vscodeChatInput}:input-${ChatInputPart._counter++}`);
    this._workingSetLinesAddedSpan = new Lazy(() => $(".working-set-lines-added"));
    this._workingSetLinesRemovedSpan = new Lazy(() => $(".working-set-lines-removed"));
    this._chatEditsActionsDisposables = this._register(new DisposableStore());
    this._chatEditsDisposables = this._register(new DisposableStore());
    this._renderingChatEdits = this._register(new MutableDisposable());
    this._attemptedWorkingSetEntriesCount = 0;
    this._chatSessionIsEmpty = false;
    this._pendingDelegationTargetObservable = observableValue(this, void 0);
    this._currentSessionTypeObservable = observableValue(this, void 0);
    this._currentSessionResourceObservable = observableValue(this, void 0);
    this._currentSessionModelObservable = observableValue(this, void 0);
    this._deferredNotificationsEnabled = observableValue(this, true);
    this._notificationAvailableLanguageModels = observableValue(this, []);
    this._notificationModelState = derived(this, (reader) => {
      const models = this._notificationAvailableLanguageModels.read(reader);
      const currentModel = this.selectedLanguageModel.read(reader);
      return {
        currentModel: models.find((model) => model.identifier === currentModel?.identifier),
        models
      };
    });
    /** Whether the session this input is bound to already has a request. */
    this._sessionStarted = derived(this, (reader) => {
      const model = this._currentSessionModelObservable.read(reader);
      return isSessionStarted(!!model, !!model?.lastRequestObs.read(reader));
    });
    this._notificationModelTargetChatSessionType = derived(
      this,
      (reader) => this._pendingDelegationTargetObservable.read(reader) ?? this._currentSessionTypeObservable.read(reader) ?? this.getCurrentSessionType()
    );
    this._modelSelectionDiagnostics = new ChatModelSelectionDiagnostics(this.logService, this.storageService, () => ({
      surface: "workbench",
      location: this.location,
      modelTarget: this.getSelectedModelTarget(),
      sessionKey: this.getCurrentSessionType(),
      conversationKey: this._inputModelSessionResource?.toString(),
      metadata: { widgetViewKind: this.options.widgetViewKindTag }
    }));
    this._modelSelectionRuntime = {
      getCurrentSessionType: () => this._currentSessionType ?? this.getCurrentSessionType(),
      isEmpty: () => !this._inputModel || this._chatSessionIsEmpty,
      getModels: (sessionType) => this.getModelsForSessionType(sessionType),
      getAllModels: () => this.getAllMergedModels(),
      // A session type with its own models must not be defaulted over while they are still
      // loading, or the pick lands on the general catalog instead.
      isAwaitingSessionModels: (sessionType) => this.chatSessionsService.requiresCustomModelsForSessionType(sessionType) && !hasModelsTargetingSession(this.getAllMergedModels(), sessionType),
      getConfiguredModelValue: () => this.getConfiguredModelValue(),
      // Workbench chat runs a mode, and can be shown inline, so both bear on what it can run.
      isModelSupportedHere: (model) => isModelSupportedForMode(model, this.currentModeKind) && isModelSupportedForInlineChat(model, this.location),
      getDeclaredDefaultModel: (models) => models.find((model) => model.metadata.isDefaultForLocation[this.location]),
      subscribeToModelChanges: (listener) => this.languageModelsService.onDidChangeLanguageModels(listener),
      getBoundConversationKey: () => this._inputModelSessionResource?.toString(),
      getIntentHolder: () => this._intentHolder,
      restoreModelConfiguration: (modelId, configuration2) => this.restoreModelConfiguration(modelId, configuration2),
      applyModel: () => {
        if (this.cachedWidth) {
          this.layout(this.cachedWidth);
        }
        this._syncInputStateToModel();
      }
    };
    this._modelSelectionController = this._register(new ChatInputModelSelectionController(this._modelSelectionRuntime, this._modelSelectionDiagnostics));
    this._currentLanguageModel = this._modelSelectionController.currentModel;
    this._register(this.storageService.onDidChangeValue(0 /* PROFILE */, void 0, this._store)((event) => {
      this._modelSelectionDiagnostics.logStorageChange(event, this._currentLanguageModel.get()?.identifier);
    }));
    this._modelConfigStore = this._register(new ChatModelConfigurationStore(
      () => this.getModelConfigurationStorageKey(),
      this.languageModelsService,
      this.storageService
    ));
    this._syncTextDebounced = this._register(new RunOnceScheduler(() => {
      logChangesToStateModel(this._inputModel, `[DEBOUNCE] _syncTextDebounced fired -> _syncInputStateToModel in ${this._currentSessionKey}`, void 0, this._inputModel?.state.get(), this.logService);
      this._syncInputStateToModel();
    }, 150));
    this._emptyInputState = this._register(createEmptyInputStateMemento(this.options.widgetViewKindTag)(1 /* WORKSPACE */, 0 /* USER */, this.storageService));
    this._emptyInputAttachments = this._register(emptyInputAttachments(1 /* WORKSPACE */, 0 /* USER */, this.storageService));
    this._contextResourceLabels = this._register(this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this._onDidChangeVisibility.event }));
    this._currentModeObservable = observableValue("currentMode", this.options.defaultMode ?? ChatMode.Agent);
    const localModes = this.chatModeService.createModes(LocalChatSessionUri.getNewSessionUri());
    this._currentChatModes.value = localModes;
    this._currentChatModesObservable = observableValue("currentChatModes", localModes);
    const languageModelListChanged = observableSignalFromEvent(this, Event2.any(
      this.languageModelsService.onDidChangeLanguageModels,
      this.languageModelsService.onDidChangeModelVisibility
    ));
    this._register(autorun((reader) => {
      languageModelListChanged.read(reader);
      const sessionType = this._notificationModelTargetChatSessionType.read(reader);
      this._currentModeObservable.read(reader);
      this._notificationAvailableLanguageModels.set(this.getModelsForSessionType(sessionType), void 0);
    }));
    this._register(this.editorService.onDidActiveEditorChange(() => {
      this._indexOfLastOpenedContext = -1;
      this.refreshChatSessionPickers();
    }));
    this._register(this.chatSessionsService.onDidChangeSessionOptions((e) => {
      const sessionResource = this._widget?.viewModel?.model.sessionResource;
      if (sessionResource && isEqual2(sessionResource, e.sessionResource)) {
        this.refreshChatSessionPickers();
      }
    }));
    this._register(this.chatSessionsService.onDidChangeOptionGroups((chatSessionType) => {
      const sessionResource = this._widget?.viewModel?.model.sessionResource;
      if (sessionResource) {
        const delegateSessionType = this.options.sessionTypePickerDelegate?.getActiveSessionProvider?.();
        if (getChatSessionType(sessionResource) === chatSessionType || delegateSessionType === chatSessionType) {
          this.refreshChatSessionPickers();
        }
      }
    }));
    if (this.options.sessionTypePickerDelegate?.onDidChangeActiveSessionProvider) {
      this._register(this.options.sessionTypePickerDelegate.onDidChangeActiveSessionProvider(async (newSessionType) => {
        this._currentSessionType = newSessionType;
        this.getVisibleOptionGroupsModeAndUpdateContextKeys(this.getCurrentSessionResource());
        this.agentSessionTypeKey.set(newSessionType);
        this.chatSessionSupportsDelegationKey.set(this.chatSessionsService.supportsDelegationForSessionType(newSessionType));
        this.updateWidgetLockStateFromSessionType(newSessionType);
        this.checkModeInSessionPool(newSessionType);
        this._modelSelectionController.revalidateForSessionType(() => this.initSelectedModel());
        this.refreshChatSessionPickers();
      }));
    }
    this._attachmentModel = this._register(this.instantiationService.createInstance(ChatAttachmentModel));
    const attachmentModel = this._attachmentModel;
    this._register(this._attachmentModel.onDidChange(() => {
      if (this._chatSessionIsEmpty) {
        this._emptyInputAttachments.set(this._attachmentModel.attachments, void 0);
      }
      this._syncInputStateToModel();
    }));
    this._register(this._modelConfigStore.onDidChange(() => this._syncInputStateToModel()));
    this.selectedToolsModel = this._register(this.instantiationService.createInstance(ChatSelectedTools, this.currentModeObs, this._currentLanguageModel));
    this.dnd = this._register(this.instantiationService.createInstance(ChatDragAndDrop, () => this._widget, {
      get attachments() {
        return attachmentModel.attachments;
      },
      addAttachments: (entries2) => attachmentModel.addContext(...entries2)
    }, styles));
    this.inputEditorMaxHeight = this.options.renderStyle === "compact" ? INPUT_EDITOR_MAX_HEIGHT / 3 : INPUT_EDITOR_MAX_HEIGHT;
    const padding = this.options.renderStyle === "compact" ? INPUT_EDITOR_PADDING.compact : INPUT_EDITOR_PADDING.default;
    this.singleLineInputEditorHeight = INPUT_EDITOR_LINE_HEIGHT + padding.top + padding.bottom;
    this.inputEditorMinHeight = this.options.inputEditorMinLines ? this.options.inputEditorMinLines * INPUT_EDITOR_LINE_HEIGHT + padding.top + padding.bottom : void 0;
    this.inputEditorHasText = ChatContextKeys.inputHasText.bindTo(contextKeyService);
    this.inputEditorHasSendableContent = ChatContextKeys.inputHasSendableContent.bindTo(contextKeyService);
    this.inputHasBranch = ChatContextKeys.inputHasBranch.bindTo(contextKeyService);
    this.chatCursorAtTop = ChatContextKeys.inputCursorAtTop.bindTo(contextKeyService);
    this._register(autorun((reader) => {
      const mode = this._currentModeObservable.read(reader);
      mode.name.read(reader);
      const model = this._currentSessionModelObservable.read(reader);
      model?.lastRequestObs.read(reader);
      model?.requestInProgress.read(reader);
      model?.hasActiveRequest.read(reader);
      this._updateInputContentContextKeys();
    }));
    this._register(this.configurationService.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration("opencode.multiModel.enabled")) {
        this._updateInputContentContextKeys();
      }
    }));
    this.inputEditorHasFocus = ChatContextKeys.inputHasFocus.bindTo(contextKeyService);
    this._hasQuestionCarouselContextKey = ChatContextKeys.Editing.hasQuestionCarousel.bindTo(contextKeyService);
    this.chatModeKindKey = ChatContextKeys.chatModeKind.bindTo(contextKeyService);
    this.chatModeNameKey = ChatContextKeys.chatModeName.bindTo(contextKeyService);
    this.chatModelIdKey = ChatContextKeys.chatModelId.bindTo(contextKeyService);
    this.withinEditSessionKey = ChatContextKeys.withinEditSessionDiff.bindTo(contextKeyService);
    this.filePartOfEditSessionKey = ChatContextKeys.filePartOfEditSession.bindTo(contextKeyService);
    this.chatSessionHasOptions = ChatContextKeys.chatSessionHasModels.bindTo(contextKeyService);
    this.chatSessionOptionsValid = ChatContextKeys.chatSessionOptionsValid.bindTo(contextKeyService);
    this.agentSessionTypeKey = ChatContextKeys.agentSessionType.bindTo(contextKeyService);
    this.chatSessionSupportsDelegationKey = ChatContextKeys.chatSessionSupportsDelegation.bindTo(contextKeyService);
    this.chatHasPendingDelegationTargetKey = ChatContextKeys.hasPendingDelegationTarget.bindTo(contextKeyService);
    if (this.options.sessionTypePickerDelegate?.getActiveSessionProvider) {
      const initialSessionType = this.options.sessionTypePickerDelegate.getActiveSessionProvider();
      if (initialSessionType) {
        this.agentSessionTypeKey.set(initialSessionType);
        this.chatSessionSupportsDelegationKey.set(this.chatSessionsService.supportsDelegationForSessionType(initialSessionType));
      }
    }
    this.chatSessionHasCustomAgentTarget = ChatContextKeys.chatSessionHasCustomAgentTarget.bindTo(contextKeyService);
    this.chatSessionHasTargetedModels = ChatContextKeys.chatSessionHasTargetedModels.bindTo(contextKeyService);
    this.history = this._register(this.instantiationService.createInstance(ChatHistoryNavigator, this.location));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      const newOptions = {};
      if (e.affectsConfiguration("chat.defaultModel" /* DefaultModel */)) {
        this._modelSelectionController.applyConfiguredDefault();
      }
      if (e.affectsConfiguration("accessibility.verbosity.panelChat" /* Chat */)) {
        newOptions.ariaLabel = this._getAriaLabel();
      }
      if (e.affectsConfiguration("editor.wordSegmenterLocales")) {
        newOptions.wordSegmenterLocales = this.configurationService.getValue("editor.wordSegmenterLocales");
      }
      if (e.affectsConfiguration("editor.autoClosingBrackets")) {
        newOptions.autoClosingBrackets = this.configurationService.getValue("editor.autoClosingBrackets");
      }
      if (e.affectsConfiguration("editor.autoClosingQuotes")) {
        newOptions.autoClosingQuotes = this.configurationService.getValue("editor.autoClosingQuotes");
      }
      if (e.affectsConfiguration("editor.autoSurround")) {
        newOptions.autoSurround = this.configurationService.getValue("editor.autoSurround");
      }
      this.inputEditor.updateOptions(newOptions);
    }));
    this._chatEditsListPool = this._register(this.instantiationService.createInstance(CollapsibleListPool, this._onDidChangeVisibility.event, MenuId.ChatEditingWidgetModifiedFilesToolbar, { verticalScrollMode: 3 /* Visible */ }));
    this._hasFileAttachmentContextKey = ChatContextKeys.hasFileAttachments.bindTo(contextKeyService);
    this.initSelectedModel();
    this._register(this._onDidChangeCurrentChatMode.event(() => {
      this._modelSelectionController.ensureCurrentModelSupported();
    }));
    const updateAfterModelListChange = (reconcileSelection) => {
      const modelIdentifier = this._currentLanguageModel.get()?.identifier;
      const models = this.getModels();
      if (canLog(this.logService.getLevel(), 2 /* Debug */)) {
        const mergedModels = this.getAllMergedModels();
        const filteredModels = filterModelsForSession(models, this.getCurrentSessionType(), this.currentModeKind, this.location);
        const messageparts = [
          `resetting current language model due to model list change from ${modelIdentifier}`,
          `this._widget?.viewModel?.model.sessionResource = ${this._widget?.viewModel?.model.sessionResource?.toString()}`,
          `this.currentModeKind = ${this.currentModeKind}`,
          `this.getCurrentSessionType = ${this.getCurrentSessionType()}`,
          `this._currentSessionType = ${this._currentSessionType}`,
          `shouldResetOnModelListChange(modelIdentifier, models) = ${shouldResetOnModelListChange(modelIdentifier, models)}`,
          `vendors: ${this.languageModelsService.getVendors().map((v2) => v2.vendor).join(", ")}`,
          `hiddenModelIds: ${this.languageModelsService.getHiddenModelIds().join(", ")}`,
          `model identifiers: ${models.map((m) => m.identifier).join(", ")}`,
          `model target Session Types: ${models.map((m) => m.metadata.targetChatSessionType || "").join(", ")}`,
          `model metadataid: ${models.map((m) => m.metadata.id).join(", ")}`,
          `merged.model identifiers: ${mergedModels.map((m) => m.identifier).join(", ")}`,
          `merged.model target Session Types: ${mergedModels.map((m) => m.metadata.targetChatSessionType || "").join(", ")}`,
          `merged.model metadataid: ${mergedModels.map((m) => m.metadata.id).join(", ")}`,
          `filtered.model identifiers: ${filteredModels.map((m) => m.identifier).join(", ")}`,
          `filtered.model target Session Types: ${filteredModels.map((m) => m.metadata.targetChatSessionType || "").join(", ")}`,
          `filtered.model metadataid: ${filteredModels.map((m) => m.metadata.id).join(", ")}`
        ];
        if (this.getCurrentSessionType() !== SessionType.CopilotCLI) {
          const delegateSessionType = this.options.sessionTypePickerDelegate?.getActiveSessionProvider?.();
          if (delegateSessionType) {
            messageparts.push(`delegateSessionType = ${delegateSessionType}`);
          }
          const sessionResource = this._widget?.viewModel?.model.sessionResource;
          messageparts.push(`current session resource = ${sessionResource}`);
        }
        logChangesToStateModel(this._inputModel, messageparts.join(", "), void 0, void 0, this.logService);
      }
      if (reconcileSelection) {
        this._modelSelectionController.reconcileModelListChange(models);
      }
      this._updateInputContentContextKeys();
    };
    this._register(this.languageModelsService.onDidChangeLanguageModels(() => updateAfterModelListChange(false)));
    this._register(this.languageModelsService.onDidChangeModelVisibility(() => updateAfterModelListChange(true)));
    this._register(this.onDidChangeCurrentChatMode(() => {
      this.accessibilityService.alert(this._currentModeObservable.get().label.get());
      if (this._inputEditor) {
        this._inputEditor.updateOptions({ ariaLabel: this._getAriaLabel() });
      }
      this.setImplicitContextEnablement();
    }));
    this._register(autorun((reader) => {
      const lm = this._currentLanguageModel.read(reader);
      this.chatModelIdKey.set(lm?.metadata.id.toLowerCase() ?? "");
      this.contextUsageWidget?.setSelectedModel(lm?.identifier);
      if (lm?.metadata.name) {
        this.accessibilityService.alert(lm.metadata.name);
      }
      this._inputEditor?.updateOptions({ ariaLabel: this._getAriaLabel() });
    }));
    this._register(autorun((reader) => {
      const modes = this._currentChatModesObservable.read(reader);
      reader.store.add(modes.onDidChange(() => {
        this.validateCurrentChatMode();
        this._restorePersistedCustomModeIfAvailable();
      }));
    }));
    this._register(autorun((r2) => {
      const mode = this._currentModeObservable.read(r2);
      this.chatModeKindKey.set(mode.kind);
      this.chatModeNameKey.set(mode.name.read(r2));
      if (this.options.suppressModePreferredModel) {
        return;
      }
      const models = mode.model?.read(r2);
      if (models) {
        this.switchModelByQualifiedName(models);
      }
    }));
    this.validateCurrentChatMode();
  }
  static {
    this._counter = 0;
  }
  get attachmentModel() {
    return this._attachmentModel;
  }
  getAttachedContext() {
    const contextArr = new ChatRequestVariableSet();
    contextArr.add(...this.attachmentModel.attachments, ...this.chatContextService.getWorkspaceContextItems());
    return contextArr;
  }
  getAttachedAndImplicitContext() {
    const contextArr = this.getAttachedContext();
    if (this.implicitContext) {
      const implicitChatVariables = this.implicitContext.enabledBaseEntries(this.configurationService.getValue("chat.implicitContext.suggestedContext"));
      contextArr.add(...implicitChatVariables);
    }
    return contextArr;
  }
  get implicitContext() {
    return this._implicitContext;
  }
  get inputContainerElement() {
    return this.inputContainer;
  }
  get inputRowHeight() {
    return this.inputAndSideToolbar.offsetHeight;
  }
  get persistentContentContainerElement() {
    return this.persistentContentContainer;
  }
  get gettingStartedTipContainerElement() {
    return this.chatGettingStartedTipContainer;
  }
  /** Registers raised platforms that occupy only part of the input width. */
  registerChatPetHorizontalPlatformProvider(provider) {
    this._chatPetHorizontalPlatformProviders.add(provider);
    const store = new DisposableStore();
    store.add(provider.onDidChange(() => this._onDidChangeChatPetHorizontalPlatforms.fire()));
    store.add(toDisposable(() => {
      this._chatPetHorizontalPlatformProviders.delete(provider);
      this._onDidChangeChatPetHorizontalPlatforms.fire();
    }));
    this._onDidChangeChatPetHorizontalPlatforms.fire();
    return store;
  }
  getChatPetPlatformTop(petCenterX) {
    if (petCenterX !== void 0) {
      const pillBounds = [];
      for (const provider of this._chatPetHorizontalPlatformProviders) {
        for (const element of provider.getElements()) {
          pillBounds.push(element.getBoundingClientRect());
        }
      }
      const pillTop = getChatPetPillPlatformTop(
        petCenterX,
        pillBounds
      );
      if (pillTop !== void 0) {
        return pillTop;
      }
    }
    return getChatPetStackPlatformTop(this.container, this.inputContainer, this.persistentContentContainer);
  }
  /** Whoever speaks for the intended model right now: the bound conversation, else this input part. */
  get _intentHolder() {
    return this._inputModel ?? this._unboundIntent;
  }
  /**
   * Whether a model arriving from the conversation's draft state is that conversation's own
   * choice.
   *
   * The draft state records which model, never who chose it — it is shared content, synced to
   * peers and the agent host. The conversation's intended model does record the authority, and it
   * is local to this client and outlives `clearState`, so a draft model matching an intent this
   * conversation established by choice is a restored choice rather than carried over. Anything else
   * stays provisional, which is what lets `chat.defaultModel` seed a new session that merely
   * inherited the previous one's model.
   */
  _restoreReasonFor(model) {
    const intended = this._intentHolder.intendedModel;
    return intended?.modelId === model.identifier && isInConversationModelChoice(intended.reason) ? "restoredChoice" /* RestoredChoice */ : "sessionRestore" /* SessionRestore */;
  }
  get inputEditor() {
    return this._inputEditor;
  }
  setHistoryKey(historyKey) {
    this.history.setHistoryKey(historyKey);
  }
  get currentLanguageModel() {
    return this._currentLanguageModel.get()?.identifier;
  }
  get selectedLanguageModel() {
    return this._currentLanguageModel;
  }
  /** Models the current input can select. */
  get availableLanguageModels() {
    return this.getModels();
  }
  get currentModeKind() {
    const mode = this._currentModeObservable.get();
    return mode.kind === "agent" /* Agent */ && !this.agentService.hasToolsAgent ? "edit" /* Edit */ : mode.kind;
  }
  get currentModeObs() {
    return this._currentModeObservable;
  }
  get currentChatModesObs() {
    return this._currentChatModesObservable;
  }
  get currentModeInfo() {
    const mode = this._currentModeObservable.get();
    const modeId = mode.isBuiltin ? this.currentModeKind : "custom";
    const modeInstructions = mode.modeInstructions?.get();
    return {
      kind: this.currentModeKind,
      isBuiltin: mode.isBuiltin,
      modeInstructions: modeInstructions ? {
        uri: mode.uri?.get(),
        name: mode.name.get(),
        content: modeInstructions.content,
        toolReferences: this.toolService.toToolReferences(modeInstructions.toolReferences),
        allowedSubagents: mode.agents?.get(),
        metadata: modeInstructions.metadata,
        isBuiltin: mode.isBuiltin
      } : void 0,
      telemetryModeId: modeId,
      telemetryModeName: getModeNameForTelemetry(mode),
      applyCodeBlockSuggestionId: void 0
    };
  }
  get selectedElements() {
    const edits = [];
    const editsList = this._chatEditList?.object;
    const selectedElements = editsList?.getSelectedElements() ?? [];
    for (const element of selectedElements) {
      if (element.kind === "reference" && URI.isUri(element.reference)) {
        edits.push(element.reference);
      }
    }
    return edits;
  }
  /**
   * The number of working set entries that the user actually wanted to attach.
   * This is less than or equal to {@link ChatInputPart.chatEditWorkingSetFiles}.
   */
  get attemptedWorkingSetEntriesCount() {
    return this._attemptedWorkingSetEntriesCount;
  }
  /**
   * Gets the pending delegation target if one is set.
   * This is used when the user changes the session target picker to a different provider
   * but hasn't submitted yet, so the delegation will happen on submit.
   */
  get pendingDelegationTarget() {
    return this._pendingDelegationTarget;
  }
  get _pendingDelegationTarget() {
    return this._pendingDelegationTargetObservable.get();
  }
  set _pendingDelegationTarget(value2) {
    this._pendingDelegationTargetObservable.set(value2, void 0);
  }
  get _currentSessionType() {
    return this._currentSessionTypeObservable.get();
  }
  set _currentSessionType(value2) {
    this._currentSessionTypeObservable.set(value2, void 0);
  }
  setImplicitContextEnablement() {
    if (this.implicitContext && this.configurationService.getValue("chat.implicitContext.suggestedContext")) {
      this.implicitContext.setEnabled(this._currentModeObservable.get().name.get().toLowerCase() === "ask");
    }
  }
  setIsWithinEditSession(inInsideDiff, isFilePartOfEditSession) {
    this.withinEditSessionKey.set(inInsideDiff);
    this.filePartOfEditSessionKey.set(isFilePartOfEditSession);
  }
  getSelectedModelTarget() {
    const sessionType = this._currentSessionType;
    return sessionType && this.sessionTypeHasOwnModelPool(sessionType) ? sessionType : void 0;
  }
  /**
   * True when the session type owns its own model pool (either declared via `requiresCustomModels`,
   * or some registered model already targets it). Keeps storage keys stable before targeted models are published.
   */
  sessionTypeHasOwnModelPool(sessionType) {
    return this.chatSessionsService.requiresCustomModelsForSessionType(sessionType) || hasModelsTargetingSession(this.getAllMergedModels(), sessionType);
  }
  initSelectedModel() {
    this._modelConfigStore.clear();
    const storedSelection = getStoredSelectedModel(this.storageService, this.location, this.getSelectedModelTarget());
    this._modelSelectionController.initialize(storedSelection);
  }
  setEditing(enabled, editingSentRequest) {
    this.currentlyEditingInputKey?.set(enabled);
    this.editingSentRequestKey?.set(editingSentRequest);
  }
  switchModel(modelMetadata) {
    const models = this.getModels();
    const model = models.find((m) => m.metadata.vendor === modelMetadata.vendor && m.metadata.id === modelMetadata.id && m.metadata.family === modelMetadata.family);
    if (model) {
      this.setCurrentLanguageModel(model, true);
    }
  }
  /**
   * Switch to a model by its identifier. Returns true if a matching model
   * was found and applied.
   *
   * The remembered profile preference is updated only when both
   * `isUserAction` and `storeSelection` are true.
   */
  switchModelByIdentifier(identifier2, storeSelection = false, isUserAction = false) {
    const models = this.getModels();
    const model = models.find((m) => m.identifier === identifier2);
    if (model) {
      if (isUserAction) {
        this.setCurrentLanguageModel(model, true, storeSelection);
      } else {
        this._applyProgrammaticLanguageModel(model);
      }
      return true;
    }
    return false;
  }
  switchModelByQualifiedName(qualifiedModelNames) {
    const models = this.getModels();
    for (const qualifiedModelName of qualifiedModelNames) {
      const model = models.find((m) => ILanguageModelChatMetadata.matchesQualifiedName(qualifiedModelName, m.metadata));
      if (model) {
        this._applyProgrammaticLanguageModel(model);
        return true;
      }
    }
    this.logService.warn(`[chat] Node of the models "${qualifiedModelNames.join(", ")}" not found. Use format "<name> (<vendor>)", e.g. "GPT-4o (copilot)".`);
    return false;
  }
  requestModelByIdentifier(identifier2) {
    return this._requestProgrammaticLanguageModel(() => this.getModels().find((model) => model.identifier === identifier2));
  }
  requestModelByQualifiedName(qualifiedModelNames) {
    return this._requestProgrammaticLanguageModel(() => {
      const models = this.getModels();
      return qualifiedModelNames.map((name) => models.find((model) => ILanguageModelChatMetadata.matchesQualifiedName(name, model.metadata))).find(isDefined);
    });
  }
  get hasPendingProgrammaticModelSelection() {
    return this._modelSelectionController.hasPendingProgrammaticSelection();
  }
  switchToNextModel() {
    const models = this.getModels();
    if (models.length > 0) {
      const currentIndex = models.findIndex((model) => model.identifier === this._currentLanguageModel.get()?.identifier);
      const nextIndex = (currentIndex + 1) % models.length;
      this.setCurrentLanguageModel(models[nextIndex], true);
    }
  }
  switchToNextPinnedModel() {
    const models = this.getModels();
    if (models.length === 0) {
      return;
    }
    const modelMap = new Map(models.map((model) => [model.identifier, model]));
    const pinnedModels = this.languageModelsService.getPinnedModelIds().map((modelId) => modelMap.get(modelId)).filter(isDefined);
    if (pinnedModels.length === 0) {
      return;
    }
    const currentIndex = pinnedModels.findIndex((model) => model.identifier === this._currentLanguageModel.get()?.identifier);
    const nextIndex = (currentIndex + 1) % pinnedModels.length;
    this.setCurrentLanguageModel(pinnedModels[nextIndex], true);
  }
  openModelPicker() {
    if (this.chatPhoneInputPresenter.enabled.get()) {
      this._showCombinedPhonePickerSheet();
      return;
    }
    this.modelWidget?.show();
  }
  openModePicker() {
    if (this.chatPhoneInputPresenter.enabled.get()) {
      this._showCombinedPhonePickerSheet();
      return;
    }
    this.modeWidget?.show();
  }
  _showCombinedPhonePickerSheet() {
    const target = this.inputActionsToolbar.getElement();
    this.chatPhoneInputPresenter.showCombinedModeAndModelSheet(target, {
      kind: "delegates",
      modeDelegate: this._createModePickerDelegate(),
      modelDelegate: this._createModelPickerDelegate()
    }).catch((err) => this.logService.error("[ChatInputPart] phone picker sheet failed", err));
  }
  _createModelPickerDelegate() {
    return {
      currentModel: this._currentLanguageModel,
      setModel: (model) => {
        const previousModelIdentifier = this._currentLanguageModel.get()?.identifier;
        this.setCurrentLanguageModel(model, true, !this.options.suppressModelPersistence);
        if (didExplicitlySwitchChatPetModel(previousModelIdentifier, model.identifier)) {
          this.chatPetService.unlockAchievement(ChatPetAchievementIds.ModelSwitch);
        }
        this.renderAttachedContext();
      },
      getModels: () => this.getModels(),
      isCacheWarm: () => (this._widget?.viewModel?.model.getRequests().length ?? 0) > 0,
      getPresentationOptions: () => this._getModelPickerPresentationOptions(),
      modelConfiguration: this._modelConfigStore
    };
  }
  _getModelPickerPresentationOptions() {
    const sessionType = this.getCurrentSessionType();
    const useRichPicker = !sessionType || sessionType === localChatSessionType || isAgentHostTarget(sessionType);
    return {
      useGroupedModelPicker: useRichPicker,
      showManageModelsAction: useRichPicker,
      showUnavailableFeatured: useRichPicker,
      showFeatured: useRichPicker,
      showAutoModel: this._showAutoModel(),
      showModelIcon: this.options.isSessionsWindow || !this._usesHarnessProviderIcon()
    };
  }
  _usesHarnessProviderIcon() {
    const sessionType = this.getCurrentSessionType();
    return sessionType === SessionType.Codex || sessionType === SessionType.AgentHostClaude || sessionType === SessionType.AgentHostCodex;
  }
  /**
   * Returns this editor's snapshot of the given model's configuration (e.g.
   * context size, thinking effort), scoped to this editor rather than the
   * profile-global value. Delegates to {@link ChatModelConfigurationStore}.
   * See issue #320393.
   */
  getModelConfiguration(modelId) {
    return this._modelConfigStore.getModelConfiguration(modelId);
  }
  /**
   * Restores a model's configuration captured in a session's persisted input
   * state. Called when the selected model is restored from session history so
   * the configuration follows the model through the same resolution hierarchy.
   * No-op for sessions that pre-date configuration capture (no value stored).
   */
  restoreModelConfiguration(modelId, modelConfiguration) {
    if (modelConfiguration) {
      this._modelConfigStore.restoreModelConfiguration(modelId, modelConfiguration);
    }
  }
  getModelConfigurationStorageKey() {
    const sessionType = this._currentSessionType;
    if (sessionType && this.sessionTypeHasOwnModelPool(sessionType)) {
      return `chat.modelConfiguration.${this.location}.${sessionType}`;
    }
    return `chat.modelConfiguration.${this.location}`;
  }
  _createModePickerDelegate() {
    const productService = this.productService;
    const currentChatModes = this.options.hideCustomChatModes ? derived((reader) => {
      const inner = this._currentChatModesObservable.read(reader);
      const filteredCustom = inner.custom.filter((m) => isModeConsideredBuiltIn(m, productService));
      const wrapped = {
        onDidChange: inner.onDidChange,
        builtin: inner.builtin,
        custom: filteredCustom,
        findModeById: (id2) => inner.builtin.find((m) => m.id === id2) ?? filteredCustom.find((m) => m.id === id2),
        findModeByName: (name) => inner.builtin.find((m) => m.name.read(void 0) === name) ?? filteredCustom.find((m) => m.name.read(void 0) === name),
        waitForPendingUpdates: () => inner.waitForPendingUpdates()
      };
      return wrapped;
    }) : this._currentChatModesObservable;
    return {
      currentMode: this._currentModeObservable,
      currentChatModes,
      sessionResource: () => this._widget?.viewModel?.sessionResource,
      // Direct setter for hosts that embed `ChatInputPart` without
      // registering an `IChatWidget` (e.g. the automations dialog).
      // The picker only calls this when `sessionResource()` is
      // `undefined`; real chat widgets keep the command path.
      setMode: (mode) => this.setChatMode2(mode, true),
      customAgentTarget: () => {
        const sessionResource = this._widget?.viewModel?.model.sessionResource;
        return (sessionResource && this.chatSessionsService.getCustomAgentTargetForSessionType(getChatSessionType(sessionResource))) ?? "undefined" /* Undefined */;
      }
    };
  }
  openSessionTargetPicker() {
    this.sessionTargetWidget?.show();
  }
  openDelegationPicker() {
    this.delegationWidget?.show();
  }
  openChatSessionPicker() {
    const firstWidget = this.chatSessionPickerWidgets?.values()?.next().value;
    firstWidget?.show();
  }
  /**
   * Create picker widgets for all option groups available for the current session type.
   */
  createChatSessionPickerWidgets(action, pickerOptions) {
    this._lastSessionPickerAction = action;
    this._lastSessionPickerOptions = pickerOptions;
    const sessionResource = this.getCurrentSessionResource();
    const visibleOptionGroups = this.getVisibleOptionGroupsModeAndUpdateContextKeys(sessionResource);
    if (!visibleOptionGroups.length) {
      return [];
    }
    const effectiveSessionType = this.getEffectiveSessionType(sessionResource);
    if (!effectiveSessionType) {
      return [];
    }
    this.chatSessionPickerWidgets.clearAndDisposeAll();
    const widgets2 = [];
    for (const optionGroup of visibleOptionGroups) {
      const initialItem = this.getCurrentOptionForGroup(optionGroup.id);
      const initialState = { group: optionGroup, item: initialItem };
      const itemDelegate = {
        getCurrentOption: () => this.getCurrentOptionForGroup(optionGroup.id),
        onDidChangeOption: this.getOrCreateOptionEmitter(optionGroup.id).event,
        setOption: (option2) => {
          this.updateOptionContextKey(optionGroup.id, option2.id);
          this.getOrCreateOptionEmitter(optionGroup.id).fire(option2);
          const sessionResource2 = this._widget?.viewModel?.model.sessionResource;
          if (sessionResource2) {
            this.chatSessionsService.setSessionOption(sessionResource2, optionGroup.id, option2);
          }
          this.refreshChatSessionPickers();
        },
        getOptionGroup: () => {
          const groups = this.chatSessionsService.getOptionGroupsForSessionType(effectiveSessionType);
          return groups?.find((g) => g.id === optionGroup.id);
        },
        getSessionResource: () => {
          return this._widget?.viewModel?.model.sessionResource;
        }
      };
      const widget = this.instantiationService.createInstance(ChatSessionPickerActionItem, action, initialState, itemDelegate, pickerOptions);
      this.chatSessionPickerWidgets.set(optionGroup.id, widget);
      widgets2.push(widget);
    }
    return widgets2;
  }
  /**
   * Set the input model reference for syncing input state
   *
   * Note: We have a cyclic ref between ChatInputPart and ChatWidget,
   * When we invoke setInputModel, the property _widget is not set. Hence we don't have the SessionResource.
   * As a result, in this method when syncFromModel is called, the model state is not applied to the UI.
   * Instead, the defaults are computed and the model is updated with default values. Thereby blowing away model information.
   * Setting Widget and then calling this doesn't work either because the widget also relies on ChatInputPart (hence cyclic ref).
   * Solution is to pass the SessionResource as an argument to this method.
  */
  setInputModel(model, chatSessionIsEmpty, forSessionResource) {
    logChangesToStateModel(this._inputModel, `setInputModel for ${forSessionResource.toString()} (chatSessionIsEmpty=${chatSessionIsEmpty}, outgoing._inputModel=${this._inputModel ? "present" : "undefined"})`, model.state.get(), this._inputModel?.state.get(), this.logService);
    if (this._inputModel) {
      logChangesToStateModel(this._inputModel, `[FLUSH-PRE] setInputModel pre-flush boundInputModelSession=${this._inputModelSessionResource?.toString()} widgetSession=${this._currentSessionKey} incoming=${forSessionResource.toString()}`, void 0, this._inputModel.state.get(), this.logService);
      this._syncInputStateToModel();
    }
    this._currentSessionType = getChatSessionType(forSessionResource);
    this._currentSessionModelObservable.set(void 0, void 0);
    this._inputModel = model;
    this._inputModelSessionResource = forSessionResource;
    this._modelSyncDisposables.clear();
    const chatModes = this.chatModeService.createModes(forSessionResource);
    this._currentChatModes.value = chatModes;
    this._currentChatModesObservable.set(chatModes, void 0);
    this.selectedToolsModel.resetSessionEnablementState();
    this._chatSessionIsEmpty = isNewConversation(forSessionResource, chatSessionIsEmpty);
    const ownsPool = !!this._currentSessionType && this.sessionTypeHasOwnModelPool(this._currentSessionType);
    const hadIncomingModel = !!model.state.get()?.selectedModel;
    this._modelSelectionController.beginConversationSwitch();
    this._restorePerTypeModel = shouldRestorePerTypeModelOnSessionSwitch(this._chatSessionIsEmpty, ownsPool, hadIncomingModel);
    if (this._chatSessionIsEmpty) {
      const persistedState = model.state.get() ? void 0 : this._getPersistedEmptyInputState();
      if (persistedState) {
        model.setState(persistedState);
        this._syncFromModel(persistedState, forSessionResource);
      }
      this._setEmptyModelState();
      this._modelSyncDisposables.add(this.configurationService.onDidChangeConfiguration((e) => {
        if (this._chatSessionIsEmpty && e.affectsConfiguration("chat.newSession.defaultMode" /* DefaultNewSessionMode */)) {
          this._setEmptyModelState();
        }
      }));
      this._modelSyncDisposables.add(this._currentChatModesObservable.get().onDidChange(() => {
        if (this._chatSessionIsEmpty) {
          this._setEmptyModelState();
        }
      }));
    }
    const widgetViewModelSession = this._widget?.viewModel?.model.sessionResource;
    const isStaleAtRegistration = !!widgetViewModelSession && !isEqual2(widgetViewModelSession, forSessionResource);
    logChangesToStateModel(this._inputModel, `[AUTORUN-REG] registering model->view autorun for ${forSessionResource.toString()}, widgetSession=${this._currentSessionKey}, widgetViewModelSession=${widgetViewModelSession?.toString()}, isStaleAtRegistration=${isStaleAtRegistration}, model.state.selectedModel=${model.state.get()?.selectedModel?.identifier}, _currentLanguageModel=${this._currentLanguageModel.get()?.identifier}`, void 0, void 0, this.logService);
    this._modelSyncDisposables.add(autorun((reader) => {
      let state = model.state.read(reader);
      let message = `syncing from model for ${forSessionResource.toString()} in ${this._currentSessionKey}`;
      if (!state && this._chatSessionIsEmpty) {
        state = this._getPersistedEmptyInputState();
        message = `syncing from empty input state for ${forSessionResource.toString()}`;
        if (state) {
          const resolved = this.resolveDraftModel(state.selectedModel, this._currentSessionType, false);
          if (resolved.changed) {
            state = { ...state, selectedModel: resolved.model, modelConfiguration: void 0 };
          }
        }
      }
      const widgetSessionResource = this._widget?.viewModel?.model.sessionResource;
      const isStaleSession = !!this._inputModelSessionResource && !isEqual2(this._inputModelSessionResource, forSessionResource);
      if (isStaleSession) {
        message = `[STALE-SESSION-AUTORUN] ${message} (widget now on ${widgetSessionResource?.toString()}, ${this._inputModelSessionResource?.toString()}, ${forSessionResource.toString()} is old)`;
      }
      const prevState = this._inputModel?.state.read(void 0);
      logChangesToStateModel(this._inputModel, message, state, prevState, this.logService);
      if (isStaleSession) {
        return;
      }
      this._syncFromModel(state, forSessionResource);
    }));
  }
  _getPersistedEmptyInputState() {
    let state = this._emptyInputState.read(void 0);
    if (!state) {
      return void 0;
    }
    const persistedAttachments = this._emptyInputAttachments.read(void 0);
    state = {
      ...state,
      attachments: persistedAttachments.length > 0 ? persistedAttachments : state.attachments
    };
    const resolved = this.resolveDraftModel(state.selectedModel, this._currentSessionType, true);
    if (resolved.changed) {
      state = { ...state, selectedModel: resolved.model, modelConfiguration: void 0 };
    }
    return state;
  }
  _setEmptyModelState() {
    logChangesToStateModel(this._inputModel, `setting empty model state for ${this._widget?.viewModel?.sessionResource.toString()} in ${this._currentSessionKey}`, void 0, void 0, this.logService);
    if (this.entitlementService.anonymous) {
      this.setChatMode("agent" /* Agent */, false);
      this._modelSelectionController.ensureCurrentModelSupported();
      return;
    }
    const rawDefaultMode = this.configurationService.getValue("chat.newSession.defaultMode" /* DefaultNewSessionMode */);
    if (typeof rawDefaultMode === "string") {
      const defaultMode = rawDefaultMode.trim();
      if (defaultMode) {
        const defaultModeLower = defaultMode.toLowerCase();
        const modes = this._currentChatModesObservable.get();
        const resolved = modes.findModeById(defaultMode) ?? modes.findModeByName(defaultMode) ?? modes.custom.find((m) => m.name.get().toLowerCase() === defaultModeLower);
        if (resolved) {
          this.logService.trace(`[ChatInputPart] Applying default mode from setting: ${defaultMode} -> ${resolved.id}`);
          this.setChatMode(resolved.id, false);
          this._modelSelectionController.ensureCurrentModelSupported();
        }
      }
    }
  }
  /**
   * Sync from model to view (when model state changes)
   */
  _syncFromModel(state, forSessionResource) {
    if (this._isSyncingToOrFromInputModel) {
      return;
    }
    try {
      this._isSyncingToOrFromInputModel = true;
      if (state) {
        const currentMode = this._currentModeObservable.get();
        if (currentMode.id !== state.mode.id) {
          this.setChatMode(state.mode.id, false);
        }
      }
      if (state?.selectedModel) {
        const sessionType = getChatSessionType(forSessionResource);
        this._modelSelectionController.syncFromConversationState(state.selectedModel, state.modelConfiguration, sessionType, forSessionResource.toString(), state.origin === "remote" /* Remote */, this._restoreReasonFor(state.selectedModel));
      } else if (state) {
        this._modelSelectionDiagnostics.report("conversation-state-without-model", {
          conversation: forSessionResource.toString(),
          currentModel: this._currentLanguageModel.get()?.identifier
        });
      }
      const currentAttachments = this._attachmentModel.attachments;
      if (!state) {
        this._attachmentModel.clear();
      } else if (!equals(currentAttachments, state.attachments)) {
        this._attachmentModel.clearAndSetContext(...state.attachments);
      }
      if (this._inputEditor) {
        this._inputEditor.setValue(state?.inputText || "");
        if (state?.selections.length) {
          this._inputEditor.setSelections(state.selections);
        }
      }
      if (state) {
        this._widget?.contribs.forEach((contrib) => {
          contrib.setInputState?.(state.contrib);
        });
      }
    } finally {
      this._isSyncingToOrFromInputModel = false;
      this._syncTextDebounced.cancel();
    }
  }
  /**
   * Sync current input state to the input model
   */
  _syncInputStateToModel() {
    if (this._isSyncingToOrFromInputModel) {
      return;
    }
    this._isSyncingToOrFromInputModel = true;
    const state = this.getCurrentInputState();
    if (this._chatSessionIsEmpty) {
      this._emptyInputState.set(state, void 0);
    }
    const prevState = this._inputModel?.state.get();
    logChangesToStateModel(this._inputModel, `_syncInputStateToModel boundInputModelSession=${this._inputModelSessionResource?.toString()} widgetSession=${this._currentSessionKey} mismatch=${this._inputModelSessionResource?.toString() !== this._currentSessionKey}`, state, prevState, this.logService);
    this._inputModel?.setState(state);
    this._isSyncingToOrFromInputModel = false;
    queueMicrotask(() => this.inputActionsToolbar?.relayout());
  }
  /**
   * Flush the current input state to the bound input model. Use this before
   * the host releases its model reference (e.g. on session switch) to ensure
   * an unsent draft is captured by `willDisposeModel` persistence.
   */
  flushInputStateToModel() {
    if (this._inputModel) {
      this._syncInputStateToModel();
    }
  }
  setCurrentLanguageModel(model, isUserAction = false, storeSelection = isUserAction) {
    const persistSelection = isUserAction && storeSelection;
    this._modelSelectionDiagnostics.report("set-model", {
      model: model.identifier,
      isUserAction,
      persistSelection,
      available: this.getModels().length
    }, "info");
    const apply2 = () => {
      if (this.cachedWidth) {
        this.layout(this.cachedWidth);
      }
      if (persistSelection) {
        storeSelectedModel(this.storageService, this.location, this.getSelectedModelTarget(), model.identifier);
      }
      this._syncInputStateToModel();
    };
    this._modelSelectionController.applySelection(model, apply2, isUserAction);
  }
  _applyProgrammaticLanguageModel(model) {
    this._modelSelectionController.applyProgrammaticSelection(model);
  }
  _requestProgrammaticLanguageModel(resolveModel) {
    const result = this._modelSelectionController.requestProgrammaticSelection(
      resolveModel,
      this._inputModelSessionResource?.toString()
    );
    this._updateInputContentContextKeys();
    void result.finally(() => this._updateInputContentContextKeys());
    return result;
  }
  /**
   * By ID- prefer this method
   */
  setChatMode(mode, storeSelection = true, isUserInitiated = false) {
    if (!this.options.supportsChangingModes) {
      return;
    }
    const modes = this._currentChatModesObservable.get();
    const mode2 = modes.findModeById(mode) ?? modes.findModeByName(mode) ?? modes.findModeById("agent" /* Agent */) ?? ChatMode.Ask;
    this.setChatMode2(mode2, storeSelection, isUserInitiated);
  }
  setChatMode2(mode, storeSelection = true, isUserInitiated = false) {
    if (!this.options.supportsChangingModes) {
      return;
    }
    this._currentModeObservable.set(mode, void 0);
    this._onDidChangeCurrentChatMode.fire({ isUserInitiated });
    if (storeSelection) {
      logChangesToStateModel(this._inputModel, `setChatMode2 -> _syncInputStateToModel (mode=${mode.id}, storeSelection=${storeSelection}, isUserInitiated=${isUserInitiated}, currentLanguageModel=${this._currentLanguageModel.get()?.identifier}) in ${this._currentSessionKey}`, void 0, void 0, this.logService);
      this._syncInputStateToModel();
    }
  }
  /**
   * Get all models merged from live and cache, without session/mode filtering.
   * This is the canonical source for the full model pool, including cached models
   * that bridge startup races when live models haven't loaded yet.
   */
  getAllMergedModels() {
    const cachedModels = this.storageService.getObject(CachedLanguageModelsKey, -1 /* APPLICATION */, []);
    const liveModels = this.languageModelsService.getLanguageModelIds().map((modelId) => ({ identifier: modelId, metadata: this.languageModelsService.lookupLanguageModel(modelId) }));
    const contributedVendors = new Set(this.languageModelsService.getVendors().map((v2) => v2.vendor));
    const resolvedVendors = /* @__PURE__ */ new Set();
    for (const v2 of contributedVendors) {
      if (this.languageModelsService.hasResolvedVendor(v2)) {
        resolvedVendors.add(v2);
      }
    }
    const models = mergeModelsWithCache(liveModels, cachedModels, contributedVendors, resolvedVendors);
    if (liveModels.length > 0 || resolvedVendors.size > 0) {
      this.storageService.store(CachedLanguageModelsKey, models, -1 /* APPLICATION */, 1 /* MACHINE */);
    }
    return models;
  }
  getModels() {
    return this.getModelsForSessionType(this.getCurrentSessionType());
  }
  /**
   * True when the current session type can fall back to the synthetic "Auto"
   * model. Defaults to `true` when no session type is set. See
   * {@link hasNoAvailableModel} for the "nothing to send with" state, which
   * additionally requires an empty model list.
   */
  _showAutoModel() {
    const sessionType = this.getCurrentSessionType();
    return !sessionType || this.chatSessionsService.supportsAutoModelForSessionType(sessionType);
  }
  /**
   * True when the current session type cannot fall back to the Auto model
   * and no models are available to it — e.g. the Claude agent host for a
   * Copilot Free / Student user. In this state there is no model to send a
   * request with, so sending is blocked.
   */
  hasNoAvailableModel() {
    return !this._showAutoModel() && this.getModels().length === 0;
  }
  getModelsForSessionType(sessionType) {
    const allModels = this.getAllMergedModels();
    if (sessionType && this.chatSessionsService.requiresCustomModelsForSessionType(sessionType) && !hasModelsTargetingSession(allModels, sessionType)) {
      return [];
    }
    allModels.sort((a, b) => a.metadata.name.localeCompare(b.metadata.name));
    const sessionFiltered = filterModelsForSession(allModels, sessionType, this.currentModeKind, this.location);
    return sessionFiltered.filter((m) => !isModelHiddenInPicker(m, (id2) => this.languageModelsService.isModelHidden(id2)));
  }
  /**
   * Get the chat session type for the current session, if any.
   *
   * Once a real session exists, the session resource is the authoritative
   * source for which models are valid. The picker delegate only describes the
   * welcome/new-session selection, which may not match the session that was
   * ultimately created (e.g. an agent-host pick that fell back to an
   * in-process `local` session). Preferring the delegate in that case lets an
   * agent-host model leak into a local session's pool, so we only consult the
   * delegate when there is no session yet (the welcome view has no view model).
   */
  getCurrentSessionType() {
    const sessionResource = this._widget?.viewModel?.model.sessionResource;
    if (sessionResource) {
      return getChatSessionType(sessionResource);
    }
    return this.options.sessionTypePickerDelegate?.getActiveSessionProvider?.();
  }
  /**
   * Reset the current mode when it is not valid for the current session type.
   */
  checkModeInSessionPool(sessionType) {
    if (!sessionType) {
      const sessionResource = this._widget?.viewModel?.model.sessionResource;
      if (!sessionResource) {
        return;
      }
      sessionType = getChatSessionType(sessionResource);
    }
    const customAgentTarget = this.chatSessionsService.getCustomAgentTargetForSessionType(sessionType);
    if (!customAgentTarget || customAgentTarget === "undefined" /* Undefined */) {
      return;
    }
    const currentMode = this._currentModeObservable.get();
    if (currentMode.id === ChatMode.Agent.id) {
      return;
    }
    if (currentMode.isBuiltin) {
      this.setChatMode("agent" /* Agent */, false);
      return;
    }
    const modeTarget = currentMode.target.get();
    if (modeTarget !== customAgentTarget && modeTarget !== "undefined" /* Undefined */) {
      this.setChatMode("agent" /* Agent */, false);
    }
  }
  setCurrentLanguageModelToDefault(forSessionType) {
    this._modelSelectionController.selectDefault(forSessionType ?? this.getCurrentSessionType());
  }
  /**
   * The raw configured default-model value from the
   * {@link ChatConfiguration.DefaultModel} setting (which may
   * be forced by enterprise policy). Returns `undefined` when nothing is
   * configured.
   */
  getConfiguredModelValue() {
    const model = this.configurationService.getValue("chat.defaultModel" /* DefaultModel */)?.trim();
    return model ? model : void 0;
  }
  /**
   * The model a draft should open on: the draft's own, unless it belongs to another session's
   * pool, and always superseded by a configured default.
   */
  resolveDraftModel(draftModel, sessionTypeForValidation, validatePool) {
    let model = draftModel;
    if (validatePool && shouldDropAgnosticDraftModel(model, this.getAllMergedModels(), sessionTypeForValidation)) {
      model = void 0;
    }
    const configuredValue = this.getConfiguredModelValue();
    if (configuredValue) {
      model = resolveConfiguredModel(configuredValue, this.getModelsForSessionType(this._currentSessionType ?? this.getCurrentSessionType()));
    }
    return { model, changed: model?.identifier !== draftModel?.identifier };
  }
  /**
   * Re-seeds from storage when the current model is absent from the destination session's pool,
   * restoring the preference remembered for that pool.
   */
  reinitializeIfOutsidePool(initialize2) {
    const currentModel = this._modelSelectionController.currentModel.get();
    const pool = this.getModelsForSessionType(this._currentSessionType ?? this.getCurrentSessionType());
    if (!currentModel || pool.some((model) => model.identifier === currentModel.identifier)) {
      return;
    }
    initialize2();
    this._modelSelectionController.ensureCurrentModelSupported();
  }
  /** Resets the language model to the location default, forgetting what was preferred before. */
  resetLanguageModelToDefault() {
    this._modelSelectionController.resetToDefault(this.getCurrentSessionType());
  }
  /**
   * Get the current input state for history
   */
  getCurrentInputState() {
    const mode = this._currentModeObservable.get();
    const selectedModel = this._currentLanguageModel.get();
    const state = {
      inputText: this._inputEditor?.getValue() ?? "",
      attachments: this._attachmentModel.attachments,
      mode: {
        id: mode.id,
        kind: mode.kind
      },
      selectedModel,
      modelConfiguration: selectedModel ? this._modelConfigStore.getModelConfiguration(selectedModel.identifier) : void 0,
      selectedModelReason: selectedModel ? this._modelSelectionController.selectionReason : void 0,
      selections: this._inputEditor?.getSelections() || [],
      contrib: {}
    };
    for (const contrib of this._widget?.contribs || Iterable.empty()) {
      contrib.getInputState?.(state.contrib);
    }
    return state;
  }
  _getAriaLabel() {
    const verbose = this.configurationService.getValue("accessibility.verbosity.panelChat" /* Chat */);
    let kbLabel;
    if (verbose) {
      kbLabel = this.keybindingService.lookupKeybinding("editor.action.accessibilityHelp" /* OpenAccessibilityHelp */)?.getLabel();
    }
    const mode = this._currentModeObservable.get();
    const modelName = this._currentLanguageModel.get()?.metadata.name;
    const modelInfo = modelName ? localize(12501, null, modelName) : "";
    let modeLabel = "";
    if (!mode.isBuiltin) {
      const mode2 = this.currentModeObs.get();
      modeLabel = localize(12499, null, mode2.label.get(), mode2.description.get());
    } else {
      switch (this.currentModeKind) {
        case "agent" /* Agent */:
          modeLabel = localize(12497, null);
          break;
        case "edit" /* Edit */:
          modeLabel = localize(12500, null);
          break;
        case "ask" /* Ask */:
        default:
          modeLabel = localize(12498, null);
          break;
      }
    }
    if (verbose) {
      return kbLabel ? localize(12490, null, modeLabel, modelInfo, kbLabel) : localize(12496, null, modeLabel, modelInfo);
    } else {
      return localize(12495, null, modeLabel, modelInfo);
    }
  }
  validateCurrentChatMode() {
    const currentMode = this._currentModeObservable.get();
    const validMode = this._currentChatModesObservable.get().findModeById(currentMode.id);
    const isAgentModeEnabled = this.configurationService.getValue("chat.agent.enabled" /* AgentEnabled */);
    if (!validMode) {
      this.setChatMode(isAgentModeEnabled ? "agent" /* Agent */ : "ask" /* Ask */);
      return;
    }
    if (currentMode.kind === "agent" /* Agent */ && !isAgentModeEnabled) {
      this.setChatMode("ask" /* Ask */);
      return;
    }
  }
  /**
   * Re-apply the session's own persisted custom agent once its mode becomes available.
   *
   * A restored agent-host session persists its selected custom agent in `mode`, but the agent
   * host's custom modes only register after the backend connects. Until then `setChatMode` falls
   * back to the builtin Agent, so when the custom modes arrive (`modes.onDidChange`) re-apply the
   * persisted custom agent. Builtin/default modes are handled by {@link validateCurrentChatMode}.
   */
  _restorePersistedCustomModeIfAvailable() {
    const persistedMode = this._inputModel?.state.get()?.mode;
    if (!persistedMode) {
      return;
    }
    const modes = this._currentChatModesObservable.get();
    const found = modes.findModeById(persistedMode.id) ?? modes.findModeByName(persistedMode.id);
    if (found && !found.isBuiltin && this._currentModeObservable.get().id !== found.id) {
      this.setChatMode(found.id, false);
    }
  }
  logInputHistory() {
    const historyStr = this.history.values.map((entry) => JSON.stringify(entry)).join("\n");
    this.logService.info(`[${this.location}] Chat input history:`, historyStr);
  }
  setVisible(visible) {
    this._onDidChangeVisibility.fire(visible);
  }
  /** If consumers are busy generating the chat input, returns the promise resolved when they finish */
  get generating() {
    return this._generating?.defer.p;
  }
  /** Disables the input submissions buttons until the disposable is disposed. */
  startGenerating() {
    this.logService.trace("ChatWidget#startGenerating");
    if (this._generating) {
      this._generating.rc++;
    } else {
      this._generating = { rc: 1, defer: new DeferredPromise() };
    }
    return toDisposable(() => {
      this.logService.trace("ChatWidget#doneGenerating");
      if (this._generating && !--this._generating.rc) {
        this._generating.defer.complete();
        this._generating = void 0;
      }
    });
  }
  get element() {
    return this.container;
  }
  async showPreviousValue() {
    if (this.history.isAtStart()) {
      return;
    }
    const state = this.getCurrentInputState();
    if (state.inputText || state.attachments.length) {
      this.history.overlay(state);
    }
    this.navigateHistory(true);
  }
  async showNextValue() {
    if (this.history.isAtEnd()) {
      return;
    }
    const state = this.getCurrentInputState();
    if (state.inputText || state.attachments.length) {
      this.history.overlay(state);
    }
    this.navigateHistory(false);
  }
  /**
   * Restores attachments to the input, re-fetching image binary data as needed.
   */
  async restoreAttachments(attachments) {
    let restored = [...attachments];
    if (restored.length > 0) {
      restored = (await Promise.all(restored.map(async (attachment) => {
        if (isImageVariableEntry(attachment) && !attachment.value && attachment.references?.length && URI.isUri(attachment.references[0].reference)) {
          const currReference = attachment.references[0].reference;
          try {
            const imageBinary = currReference.toString(true).startsWith("http") ? await this.sharedWebExtracterService.readImage(currReference, CancellationToken.None) : (await this.fileService.readFile(currReference)).value;
            if (!imageBinary) {
              return void 0;
            }
            const newAttachment = { ...attachment };
            newAttachment.value = isImageVariableEntry(attachment) && attachment.isPasted ? imageBinary.buffer : await resizeImage(imageBinary.buffer);
            return newAttachment;
          } catch (err) {
            this.logService.error("Failed to fetch and reference.", err);
            return void 0;
          }
        }
        return attachment;
      }))).filter(isDefined);
    }
    this._attachmentModel.clearAndSetContext(...restored);
  }
  async navigateHistory(previous) {
    const historyEntry = previous ? this.history.previous() : this.history.next();
    await this.restoreAttachments(historyEntry?.attachments ?? []);
    const inputText = historyEntry?.inputText ?? "";
    const contribData = historyEntry?.contrib ?? {};
    status(inputText);
    this.setValue(inputText, true);
    this._widget?.contribs.forEach((contrib) => {
      contrib.setInputState?.(contribData);
    });
    this._onDidLoadInputState.fire();
    const model = this._inputEditor.getModel();
    if (!model) {
      return;
    }
    if (previous) {
      this._inputEditor.setPosition({ lineNumber: 1, column: 1 });
    } else {
      this._inputEditor.setPosition(getLastPosition(model));
    }
  }
  setValue(value2, transient) {
    this.inputEditor.setValue(value2);
    const model = this.inputEditor.getModel();
    if (model) {
      this.inputEditor.setPosition(getLastPosition(model));
    }
  }
  focus() {
    this._inputEditor.focus();
  }
  hasFocus() {
    return this._inputEditor.hasWidgetFocus();
  }
  focusTodoList() {
    return this._chatInputTodoListWidget.value?.focus() ?? false;
  }
  isTodoListFocused() {
    return this._chatInputTodoListWidget.value?.hasFocus() ?? false;
  }
  hasVisibleTodos() {
    return this._chatInputTodoListWidget.value?.hasTodos() ?? false;
  }
  /**
   * Reset the input and update history.
   * @param userQuery If provided, this will be added to the history. Followups and programmatic queries should not be passed.
   */
  async acceptInput(isUserQuery, preserveFocus, preserveInput) {
    if (isUserQuery) {
      const userQuery = this.getCurrentInputState();
      this.history.append(this._getFilteredEntry(userQuery));
    }
    this.resetScrollbarVisibilityAfterAccept();
    this.chatInputNotificationService.handleMessageSent(this.getNotificationContext());
    if (this._chatSessionIsEmpty) {
      this._chatSessionIsEmpty = false;
      this._emptyInputState.set(void 0, void 0);
      this._emptyInputAttachments.set([], void 0);
    }
    if (preserveInput) {
      if (!preserveFocus) {
        this._inputEditor.focus();
      }
      return;
    }
    notifyDictationSubmitted(this._inputEditor);
    logChangesToStateModel(this._inputModel, `[ACCEPT] acceptInput -> attachmentModel.clear() in ${this._currentSessionKey}`, void 0, this._inputModel?.state.get(), this.logService);
    this.attachmentModel.clear();
    this._onDidLoadInputState.fire();
    if (this.accessibilityService.isScreenReaderOptimized() && isMacintosh) {
      this._acceptInputForVoiceover();
    } else if (preserveFocus) {
      this._inputEditor.setValue("");
    } else {
      this._inputEditor.focus();
      this._inputEditor.setValue("");
    }
  }
  validateAgentMode() {
    if (!this.agentService.hasToolsAgent && this._currentModeObservable.get().kind === "agent" /* Agent */) {
      this.setChatMode("edit" /* Edit */);
    }
  }
  // A function that filters out specifically the `value` property of the attachment.
  _getFilteredEntry(inputState) {
    const attachmentsWithoutImageValues = inputState.attachments.map((attachment) => {
      if (isImageVariableEntry(attachment) && attachment.references?.length && attachment.value) {
        const newAttachment = { ...attachment };
        newAttachment.value = void 0;
        return newAttachment;
      }
      return attachment;
    });
    return { ...inputState, attachments: attachmentsWithoutImageValues };
  }
  _acceptInputForVoiceover() {
    const domNode = this._inputEditor.getDomNode();
    if (!domNode) {
      return;
    }
    domNode.remove();
    this._inputEditor.setValue("");
    this._inputEditorElement.appendChild(domNode);
    this._inputEditor.focus();
  }
  _handleAttachedContextChange() {
    this._hasFileAttachmentContextKey.set(Boolean(this._attachmentModel.attachments.find((a) => a.kind === "file")));
    this._updateInputContentContextKeys();
    this.renderAttachedContext();
  }
  _updateInputContentContextKeys() {
    const inputHasText = !!this._inputEditor?.getModel()?.getValue().trim();
    this.inputEditorHasText.set(inputHasText);
    const hasSendableContent = inputHasText || this._attachmentModel.attachments.some(isExplicitFileOrImageVariableEntry);
    this.inputEditorHasSendableContent.set(hasSendableContent && !this.hasNoAvailableModel() && !this.hasPendingProgrammaticModelSelection);
    this.inputHasBranch.set(!inputHasText && !hasSendableContent && !this.hasNoAvailableModel() && !this.hasPendingProgrammaticModelSelection && this.isBranchEligible());
  }
  /**
   * OpenCode multi-model: whether an empty send should re-answer the previous
   * question as a new branch variant. Requires codeBranches, a Code snapshot, an existing turn,
   * no request in progress and the opencode.multiModel.enabled setting.
   */
  isBranchEligible() {
    if (!(this.configurationService.getValue("opencode.multiModel.enabled") ?? true)) {
      return false;
    }
    if (!(this.configurationService.getValue("opencode.multiModel.codeBranches") ?? true)) {
      return false;
    }
    const model = this._widget?.viewModel?.model;
    if (!model) {
      return false;
    }
    if (model.requestInProgress.get() || model.hasActiveRequest.get()) {
      return false;
    }
    const lastResponse = model.getRequests().at(-1)?.response;
    if (!lastResponse?.isComplete || lastResponse.isCanceled) {
      return false;
    }
    return !!lastResponse.result?.metadata?.["opencodeBranchBase"];
  }
  getOrCreateOptionEmitter(optionGroupId) {
    let emitter = this._chatSessionOptionEmitters.get(optionGroupId);
    if (!emitter) {
      emitter = new Emitter();
      this._chatSessionOptionEmitters.set(optionGroupId, emitter);
    }
    return emitter;
  }
  /**
   * Get or create a context key for an option group.
   * Context keys follow the pattern `chatSessionOption.<groupId>`.
   */
  getOrCreateOptionContextKey(optionGroupId) {
    if (!this._scopedContextKeyService) {
      return void 0;
    }
    let contextKey = this._optionContextKeys.get(optionGroupId);
    if (!contextKey) {
      const rawKey = new RawContextKey(`chatSessionOption.${optionGroupId}`, "");
      contextKey = rawKey.bindTo(this._scopedContextKeyService);
      this._optionContextKeys.set(optionGroupId, contextKey);
    }
    return contextKey;
  }
  /**
   * Update the context key for an option group with the current selection.
   * This enables `when` expressions on other option groups to react to changes.
   */
  updateOptionContextKey(optionGroupId, optionItemId) {
    const normalizedOptionId = optionItemId.trim();
    const contextKey = this.getOrCreateOptionContextKey(optionGroupId);
    if (contextKey) {
      contextKey.set(normalizedOptionId);
    }
  }
  /**
   * Evaluate whether an option group should be visible based on its `when` expression.
   * Returns true if the option group should be visible, false otherwise.
   */
  evaluateOptionGroupVisibility(optionGroup) {
    if (!optionGroup.when) {
      return true;
    }
    if (!this._scopedContextKeyService) {
      return true;
    }
    const expr = ContextKeyExpr.deserialize(optionGroup.when);
    if (!expr) {
      return true;
    }
    return this._scopedContextKeyService.contextMatchesRules(expr);
  }
  /**
   * Computes which option groups should be visible for the current session.
   *
   * A picker should show if and only if:
   * 1. We can determine a session type (from session context OR delegate)
   * 2. That session type has option groups registered
   * 3. At least one option group has items AND passes its `when` clause
   *
   * This method also updates the `chatSessionHasOptions` context key, which controls
   * whether the picker action is shown in the toolbar via its `when` clause.
   */
  getVisibleOptionGroupsModeAndUpdateContextKeys(sessionResource) {
    const sessionType = this.getEffectiveSessionType(sessionResource);
    const customAgentTarget = sessionType ? this.chatSessionsService.getCustomAgentTargetForSessionType(sessionType) : "undefined" /* Undefined */;
    this.chatSessionHasCustomAgentTarget.set(customAgentTarget !== "undefined" /* Undefined */);
    const requiresCustomModels = sessionType && this.chatSessionsService.requiresCustomModelsForSessionType(sessionType);
    this.chatSessionHasTargetedModels.set(!!requiresCustomModels);
    const visibleOptionGroups = this.getVisibleOptionGroups(sessionResource);
    if (!visibleOptionGroups.length) {
      this.chatSessionHasOptions.set(false);
      this.chatSessionOptionsValid.set(true);
      this._updateInputContentContextKeys();
      return [];
    }
    const allOptionsValid = sessionResource ? this.areAllOptionsValid(sessionResource, visibleOptionGroups) : true;
    this.chatSessionHasOptions.set(true);
    this.chatSessionOptionsValid.set(allOptionsValid);
    this._updateInputContentContextKeys();
    return visibleOptionGroups;
  }
  getCurrentSessionResource() {
    return this._widget?.viewModel?.model.sessionResource;
  }
  getTerminalCommandPrefix() {
    const sessionResource = this.getCurrentSessionResource();
    return sessionResource ? this.chatSessionsService.getCapabilitiesForSessionType(getChatSessionType(sessionResource))?.terminalCommandPrefix : void 0;
  }
  isTerminalCommandPaste(pastedText, range2) {
    const model = this._inputEditor.getModel();
    const prefix = this.getTerminalCommandPrefix();
    if (!model || !prefix) {
      return false;
    }
    return isTerminalCommandPaste({
      prefix,
      pastedText,
      currentValue: model.getValue(),
      selectionStartOffset: model.getOffsetAt(Range2.getStartPosition(range2)),
      selectionEndOffset: model.getOffsetAt(Range2.getEndPosition(range2))
    });
  }
  updateInputEditorFontFamily() {
    if (!this._inputEditor) {
      return;
    }
    const isCommand = isTerminalCommandInput(this._inputEditor.getModel()?.getLineContent(1) || "", this.getTerminalCommandPrefix());
    this._inputEditor.updateOptions({ fontFamily: isCommand ? EDITOR_FONT_DEFAULTS.fontFamily : DEFAULT_FONT_FAMILY });
  }
  handleTerminalCommandPaste(e) {
    handleTerminalCommandPaste(e, this._inputEditor, this.getTerminalCommandPrefix(), this.dialogService, this.storageService);
  }
  areAllOptionsValid(sessionResource, visibleOptionGroups) {
    for (const optionGroup of visibleOptionGroups) {
      const currentOption = this.chatSessionsService.getSessionOption(sessionResource, optionGroup.id);
      if (currentOption) {
        const currentOptionId = typeof currentOption === "string" ? currentOption : currentOption.id;
        if (!optionGroup.items.some((item) => item.id === currentOptionId) && typeof currentOption === "string") {
          return false;
        }
      }
    }
    return true;
  }
  getAllOptionsGroups(sessionResource) {
    const delegateSessionType = this.options.sessionTypePickerDelegate?.getActiveSessionProvider?.();
    const effectiveSessionType = delegateSessionType ?? (sessionResource ? getChatSessionType(sessionResource) : void 0);
    if (!effectiveSessionType) {
      return [];
    }
    const allOptionGroups = this.chatSessionsService.getOptionGroupsForSessionType(effectiveSessionType);
    return allOptionGroups ?? [];
  }
  getVisibleOptionGroups(sessionResource) {
    const allOptionGroups = this.getAllOptionsGroups(sessionResource);
    if (!allOptionGroups.length) {
      return [];
    }
    if (sessionResource) {
      for (const optionGroup of allOptionGroups) {
        const currentOption = this.chatSessionsService.getSessionOption(sessionResource, optionGroup.id);
        if (currentOption) {
          const optionId = typeof currentOption === "string" ? currentOption : currentOption.id;
          this.updateOptionContextKey(optionGroup.id, optionId);
        }
      }
    }
    const visibleGroups = /* @__PURE__ */ new Map();
    for (const optionGroup of allOptionGroups) {
      const hasItems = optionGroup.items.length > 0 || (optionGroup.commands || []).length > 0;
      const passesWhenClause = this.evaluateOptionGroupVisibility(optionGroup);
      const sessionHasOption = !sessionResource || this.chatSessionsService.getSessionOption(sessionResource, optionGroup.id) !== void 0;
      if (hasItems && passesWhenClause && sessionHasOption) {
        visibleGroups.set(optionGroup.id, optionGroup);
      }
    }
    return Array.from(visibleGroups.values());
  }
  /**
   * Refresh all registered option groups for the current chat session.
   * Fires events for each option group with their current selection.
   */
  refreshChatSessionPickers() {
    const sessionResource = this.getCurrentSessionResource();
    const allOptionsGroups = this.getAllOptionsGroups(sessionResource);
    const visibleOptionGroups = this.getVisibleOptionGroupsModeAndUpdateContextKeys(sessionResource);
    if (!allOptionsGroups.length || !visibleOptionGroups.length) {
      this.hideAllSessionPickerWidgets();
      return;
    }
    const currentWidgetGroupIds = new Set(this.chatSessionPickerWidgets.keys());
    const needsRecreation = currentWidgetGroupIds.size !== visibleOptionGroups.length || !visibleOptionGroups.every((group2) => currentWidgetGroupIds.has(group2.id));
    if (needsRecreation && this._lastSessionPickerAction && this.chatSessionPickerContainer) {
      const widgets2 = this.createChatSessionPickerWidgets(this._lastSessionPickerAction, this._lastSessionPickerOptions);
      clearNode(this.chatSessionPickerContainer);
      for (const widget of widgets2) {
        const container3 = $(".action-item.chat-sessionPicker-item");
        widget.render(container3);
        this.chatSessionPickerContainer.appendChild(container3);
      }
    }
    if (this.chatSessionPickerContainer) {
      this.chatSessionPickerContainer.style.display = "";
    }
    if (sessionResource) {
      for (const [optionGroupId] of this.chatSessionPickerWidgets) {
        const currentOption = this.chatSessionsService.getSessionOption(sessionResource, optionGroupId);
        if (currentOption) {
          const optionGroup = allOptionsGroups.find((g) => g.id === optionGroupId);
          if (optionGroup) {
            const currentOptionId = typeof currentOption === "string" ? currentOption : currentOption.id;
            const item = optionGroup.items.find((m) => m.id === currentOptionId);
            if (item && typeof currentOption === "string") {
              this.getOrCreateOptionEmitter(optionGroupId).fire(item);
            } else if (typeof currentOption !== "string") {
              this.getOrCreateOptionEmitter(optionGroupId).fire(currentOption);
            }
          }
        }
      }
    }
  }
  hideAllSessionPickerWidgets() {
    if (this.chatSessionPickerContainer) {
      this.chatSessionPickerContainer.style.display = "none";
    }
  }
  /**
   * Get the current option for a specific option group.
   * Returns undefined if the session doesn't have this option configured.
   */
  getCurrentOptionForGroup(optionGroupId) {
    const sessionResource = this._widget?.viewModel?.model.sessionResource;
    if (!sessionResource) {
      return;
    }
    if (this.chatSessionsService.getSessionOption(sessionResource, optionGroupId) === void 0) {
      return;
    }
    const effectiveSessionType = this.getEffectiveSessionType(sessionResource);
    const optionGroups = effectiveSessionType ? this.chatSessionsService.getOptionGroupsForSessionType(effectiveSessionType) : void 0;
    const optionGroup = optionGroups?.find((g) => g.id === optionGroupId);
    if (!optionGroup || optionGroup.items.length === 0) {
      return;
    }
    const currentOptionValue = this.chatSessionsService.getSessionOption(sessionResource, optionGroupId);
    if (!currentOptionValue) {
      const defaultItem = optionGroup.items.find((item) => item.default);
      return defaultItem;
    }
    if (typeof currentOptionValue === "string") {
      const normalizedOptionId = currentOptionValue.trim();
      return optionGroup.items.find((m) => m.id === normalizedOptionId);
    } else {
      return currentOptionValue;
    }
  }
  hasWorkspaceScmRepository() {
    const folders = this.workspaceContextService.getWorkspace().folders;
    if (folders.length === 0) {
      return false;
    }
    for (const repo of this.scmService.repositories) {
      if (repo.provider.rootUri && this.workspaceContextService.getWorkspaceFolder(repo.provider.rootUri)) {
        return true;
      }
    }
    return false;
  }
  getEffectiveSessionType(sessionResource) {
    return this.options.sessionTypePickerDelegate?.getActiveSessionProvider?.() ?? (sessionResource ? getChatSessionType(sessionResource) : void 0);
  }
  /**
   * Updates the agentSessionType context key based on delegate or actual session.
   */
  updateAgentSessionTypeContextKey() {
    const sessionResource = this._widget?.viewModel?.model.sessionResource;
    const delegate = this.options.sessionTypePickerDelegate;
    const delegateSessionType = delegate?.setActiveSessionProvider && delegate?.getActiveSessionProvider?.();
    const sessionType = delegateSessionType || (sessionResource ? getChatSessionType(sessionResource) : "");
    this.agentSessionTypeKey.set(sessionType);
    this.chatSessionSupportsDelegationKey.set(this.chatSessionsService.supportsDelegationForSessionType(sessionType));
  }
  /**
   * Updates the widget lock state based on a session type.
   * Local sessions unlock from coding agent mode, while remote/cloud sessions lock to coding agent mode.
   */
  updateWidgetLockStateFromSessionType(sessionType) {
    if (sessionType === localChatSessionType) {
      this._widget?.unlockFromCodingAgent();
      return;
    }
    const contribution = this.chatSessionsService.getChatSessionContribution(sessionType);
    if (contribution) {
      this._widget?.lockToCodingAgent(contribution.name, contribution.displayName, contribution.type, contribution.agentHostProviderId);
    } else {
      this._widget?.unlockFromCodingAgent();
    }
  }
  /**
   * Resolves the session type of the active chat session for the delegation picker.
   */
  getActiveSessionTypeForDelegation() {
    const sessionResource = this._widget?.viewModel?.sessionResource;
    return sessionResource ? getAgentSessionProvider(sessionResource) ?? getChatSessionType(sessionResource) : void 0;
  }
  /**
   * Selects (or clears) the pending delegation target. While a target is pending, the widget
   * locks to the target agent and the `hasPendingDelegationTarget` context key hides the
   * agent and model pickers. Re-selecting the active session clears the pending target and
   * restores the pickers.
   */
  continueInSession(provider) {
    this.setPendingDelegationTarget(provider);
    this.focus();
  }
  setPendingDelegationTarget(provider) {
    const isActive2 = this.getActiveSessionTypeForDelegation() === provider;
    this._pendingDelegationTarget = isActive2 ? void 0 : provider;
    this.chatHasPendingDelegationTargetKey.set(!!this._pendingDelegationTarget);
    this.updateWidgetLockStateFromSessionType(provider);
    this.updateAgentSessionTypeContextKey();
    this.refreshChatSessionPickers();
  }
  /**
   * Ensures the notification widget is instantiated and appended to the notification container.
   */
  ensureNotificationWidget() {
    if (!this._notificationWidget.value) {
      this._notificationWidget.value = this.instantiationService.createInstance(ChatInputNotificationWidget, {
        modelTargetChatSessionType: this._notificationModelTargetChatSessionType,
        sessionResource: this._currentSessionResourceObservable,
        deferredNotificationsEnabled: this._deferredNotificationsEnabled,
        isTransientChat: constObservable(this.options.isTransientChat ?? false),
        sessionStarted: this._sessionStarted,
        modelSelection: {
          state: this._notificationModelState,
          openPicker: () => this.openModelPicker(),
          selectModel: (modelIdentifier) => this.selectNotificationModel(modelIdentifier),
          applyModelConfiguration: (modelIdentifier, values) => this.applyNotificationModelConfiguration(modelIdentifier, values)
        },
        onDidChangeVisibility: (visible, focusTarget) => this.noticeHost.setOccupied(0 /* Notification */, visible, focusTarget),
        focusInput: () => this.focus()
      });
      this._notificationWidget.value.attachTo(this.chatInputNotificationContainer);
    }
  }
  getNotificationContext() {
    return {
      sessionType: this._notificationModelTargetChatSessionType.get(),
      sessionResource: this._currentSessionResourceObservable.get(),
      deferredNotificationsEnabled: this._deferredNotificationsEnabled.get(),
      isTransientChat: this.options.isTransientChat ?? false,
      sessionStarted: this._sessionStarted.get(),
      modelState: this._notificationModelState.get()
    };
  }
  selectNotificationModel(identifier2) {
    const model = this._notificationModelState.get().models.find((model2) => model2.identifier === identifier2);
    if (!model) {
      return false;
    }
    this.setCurrentLanguageModel(model, true, !this._pendingDelegationTarget);
    return true;
  }
  /**
   * The store is scoped to the active session, so while a delegation is pending the write
   * would land on the source session rather than the target the models belong to.
   */
  async applyNotificationModelConfiguration(modelIdentifier, values) {
    if (this._pendingDelegationTarget) {
      return;
    }
    await this._modelConfigStore.setModelConfiguration(modelIdentifier, values);
  }
  /**
   * Shows the context usage details popup and focuses it.
   * @returns Whether the details were successfully shown.
   */
  showContextUsageDetails() {
    return this.contextUsageWidget?.showDetails() ?? false;
  }
  /**
   * Updates the context usage widget based on the current model.
   */
  updateContextUsageWidget() {
    this._contextUsageDisposables.clear();
    const model = this._widget?.viewModel?.model;
    if (!model || !this.contextUsageWidget) {
      return;
    }
    const store = new DisposableStore();
    this._contextUsageDisposables.value = store;
    let lastRequest2 = model.lastRequest;
    const observePreviousResponse = (request2) => {
      if (request2?.response) {
        store.add(request2.response.onDidChange(() => this.contextUsageWidget?.updateSessionCost(model.sessionCost)));
      }
    };
    for (const request2 of model.getRequests().slice(0, -1)) {
      observePreviousResponse(request2);
    }
    store.add(model.onDidChange((e) => {
      if (e.kind === "addRequest") {
        observePreviousResponse(lastRequest2);
        lastRequest2 = e.request;
        this.contextUsageWidget?.update(model.lastRequest);
      } else if (e.kind === "completedRequest") {
        this.contextUsageWidget?.update(model.lastRequest);
      }
    }));
    store.add(this.languageModelsService.onDidChangeLanguageModels(() => {
      const lastRequest3 = model.lastRequest;
      if (lastRequest3?.modelId) {
        this.contextUsageWidget?.update(lastRequest3);
      }
    }));
    this.contextUsageWidget.update(model.lastRequest);
  }
  handleViewModelChange(e) {
    this.updateDeferredNotificationsEligibility(e);
    transaction((observableTransaction) => {
      try {
        this.updateInputEditorFontFamily();
        this.resetPendingDelegationForViewModelChange(observableTransaction);
        this.refreshViewModelScopedState();
        this.clearQuestionCarouselIfSessionChanged(e);
        this.clearPlanReviewIfSessionChanged(e);
        this._syncToolConfirmationCarouselForSession();
        this.reconcileSessionTypeForViewModelChange(e, observableTransaction);
      } finally {
        this._restorePerTypeModel = false;
      }
    });
    this._modelSelectionController.applyConfiguredDefault();
  }
  updateDeferredNotificationsEligibility(e) {
    if (this.environmentService.isSessionsWindow) {
      this._deferredNotificationsEnabled.set(true, void 0);
      return;
    }
    this._isFirstWorkbenchSession ??= !this.chatService.hasSessions();
    if (this._isFirstWorkbenchSession && e?.previousSessionResource && e.currentSessionResource && !isEqual2(e.previousSessionResource, e.currentSessionResource) && !isUntitledChatSession(e.previousSessionResource)) {
      this._isFirstWorkbenchSession = false;
    }
    this._deferredNotificationsEnabled.set(!this._isFirstWorkbenchSession, void 0);
  }
  resetPendingDelegationForViewModelChange(transaction2) {
    this._pendingDelegationTargetObservable.set(void 0, transaction2);
    this.chatHasPendingDelegationTargetKey.set(false);
  }
  refreshViewModelScopedState() {
    this.updateAgentSessionTypeContextKey();
    this.refreshChatSessionPickers();
    this.ensureNotificationWidget();
    this.updateContextUsageWidget();
  }
  clearQuestionCarouselIfSessionChanged(e) {
    let hasMatchingResource = false;
    if (e.currentSessionResource) {
      for (const r2 of this._questionCarouselSessionResources.values()) {
        if (isEqual2(r2, e.currentSessionResource)) {
          hasMatchingResource = true;
          break;
        }
      }
    }
    if (this._questionCarouselSessionResources.size > 0 && (!e.currentSessionResource || !hasMatchingResource)) {
      this.clearQuestionCarousel();
    }
  }
  clearPlanReviewIfSessionChanged(e) {
    let hasMatchingPlanReviewResource = false;
    if (e.currentSessionResource) {
      for (const r2 of this._planReviewSessionResources.values()) {
        if (isEqual2(r2, e.currentSessionResource)) {
          hasMatchingPlanReviewResource = true;
          break;
        }
      }
    }
    if (this._planReviewSessionResources.size > 0 && (!e.currentSessionResource || !hasMatchingPlanReviewResource)) {
      this.clearPlanReview();
    }
  }
  reconcileSessionTypeForViewModelChange(e, transaction2) {
    this._currentSessionResourceObservable.set(e.currentSessionResource, transaction2);
    this._currentSessionModelObservable.set(this._widget?.viewModel?.model, transaction2);
    const newSessionType = this.getCurrentSessionType();
    if (e.currentSessionResource && this._currentSessionType && newSessionType !== this._currentSessionType) {
      logChangesToStateModel(this._inputModel, `[CVVM].1 onDidChangeViewModel -> session change: ${this._currentSessionType} -> ${newSessionType} in ${this._currentSessionKey}, ${e.currentSessionResource.toString()}`, void 0, this._inputModel?.state.get(), this.logService);
      this._currentSessionTypeObservable.set(newSessionType, transaction2);
      this.initSelectedModel();
      this.checkModeInSessionPool();
      this._modelSelectionController.ensureCurrentModelSupported();
    } else if (e.currentSessionResource) {
      logChangesToStateModel(this._inputModel, `[CVVM].2 onDidChangeViewModel -> session change: ${this._currentSessionType} -> ${newSessionType} in ${this._currentSessionKey}, ${e.currentSessionResource.toString()}`, void 0, this._inputModel?.state.get(), this.logService);
      this._currentSessionTypeObservable.set(newSessionType, transaction2);
      this.restorePerTypeModelAfterViewModelAssignment();
      this.reinitializeIfOutsidePool(() => this.initSelectedModel());
    }
  }
  restorePerTypeModelAfterViewModelAssignment() {
    if (this._restorePerTypeModel) {
      this.initSelectedModel();
      if (!this._modelSelectionController.hasPendingProgrammaticSelection() && !this._modelSelectionController.isAwaitingRememberedModel()) {
        this._modelSelectionController.ensureCurrentModelSupported();
      }
    }
  }
  render(container3, initialValue, widget) {
    this._widget = widget;
    this.updateDeferredNotificationsEligibility();
    this._currentSessionResourceObservable.set(widget.viewModel?.sessionResource, void 0);
    this._currentSessionModelObservable.set(widget.viewModel?.model, void 0);
    this.getVisibleOptionGroupsModeAndUpdateContextKeys(this.getCurrentSessionResource());
    const delegate = this.options.sessionTypePickerDelegate;
    if (delegate?.setActiveSessionProvider && delegate?.getActiveSessionProvider) {
      const initialSessionType = delegate.getActiveSessionProvider();
      if (initialSessionType) {
        this.updateWidgetLockStateFromSessionType(initialSessionType);
      }
    }
    this._register(widget.onDidChangeViewModel((e) => this.handleViewModelChange(e)));
    let elements;
    if (this.options.renderStyle === "compact") {
      elements = h(`.interactive-input-part.${chatInputSurfaceStackClass}`, [
        h(".chat-input-persistent-content@persistentContentContainer"),
        h(`.interactive-input-and-edit-session.${chatInputSurfaceStackClass}`, [
          h(`.chat-plan-review-widget-container.${chatInputSurfaceStackSlotClass}@chatPlanReviewContainer`),
          h(`.chat-question-carousel-widget-container.${chatInputSurfaceStackSlotClass}@chatQuestionCarouselContainer`),
          h(`.chat-tool-confirmation-carousel-container.${chatInputSurfaceStackSlotClass}@chatToolConfirmationCarouselContainer`),
          h(`.${chatInputStackClass}`, [
            h(`.chat-input-notification-container.${chatInputStackSlotClass}@chatInputNotificationContainer`),
            h(`.voice-mode-onboarding-container.${chatInputStackSlotClass}@voiceModeOnboardingContainer`),
            h(`.dictation-onboarding-container.${chatInputStackSlotClass}@dictationOnboardingContainer`),
            h(".chat-todo-list-widget-container@chatInputTodoListWidgetContainer"),
            h(".chat-artifacts-widget-container@chatArtifactsWidgetContainer"),
            h(".chat-editing-session@chatEditingSessionWidgetContainer"),
            h(`.chat-getting-started-tip-container.${chatInputStackSlotClass}@chatGettingStartedTipContainer`),
            h(".interactive-input-and-side-toolbar@inputAndSideToolbar", [
              h(".chat-input-container@inputContainer", [
                h(".chat-editor-container@editorContainer"),
                h(".chat-input-toolbars@inputToolbars")
              ])
            ])
          ]),
          h(".chat-secondary-toolbar@secondaryToolbar", [
            h(".chat-responsive-picker-container@responsivePickerContainer"),
            h(".chat-context-usage-container@contextUsageWidgetContainer"),
            h(".chat-input-status-container@statusToolbarContainer")
          ]),
          h(`.chat-attachments-container.${chatInputSurfaceStackSlotClass}@attachmentsContainer`, [
            h(".chat-attached-context@attachedContextContainer")
          ]),
          h(`.interactive-input-followups.${chatInputSurfaceStackSlotClass}@followupsContainer`)
        ])
      ]);
    } else {
      elements = h(`.interactive-input-part.${chatInputSurfaceStackClass}`, [
        h(".chat-input-persistent-content@persistentContentContainer"),
        h(`.chat-plan-review-widget-container.${chatInputSurfaceStackSlotClass}@chatPlanReviewContainer`),
        h(`.chat-question-carousel-widget-container.${chatInputSurfaceStackSlotClass}@chatQuestionCarouselContainer`),
        h(`.chat-tool-confirmation-carousel-container.${chatInputSurfaceStackSlotClass}@chatToolConfirmationCarouselContainer`),
        h(`.interactive-input-followups.${chatInputSurfaceStackSlotClass}@followupsContainer`),
        h(`.${chatInputStackClass}`, [
          h(`.chat-input-notification-container.${chatInputStackSlotClass}@chatInputNotificationContainer`),
          h(`.voice-mode-onboarding-container.${chatInputStackSlotClass}@voiceModeOnboardingContainer`),
          h(`.dictation-onboarding-container.${chatInputStackSlotClass}@dictationOnboardingContainer`),
          h(".chat-todo-list-widget-container@chatInputTodoListWidgetContainer"),
          h(".chat-artifacts-widget-container@chatArtifactsWidgetContainer"),
          h(".chat-editing-session@chatEditingSessionWidgetContainer"),
          h(`.chat-getting-started-tip-container.${chatInputStackSlotClass}@chatGettingStartedTipContainer`),
          h(".interactive-input-and-side-toolbar@inputAndSideToolbar", [
            h(".chat-input-container@inputContainer", [
              h(".chat-attachments-container@attachmentsContainer", [
                h(".chat-attached-context@attachedContextContainer")
              ]),
              h(".chat-editor-container@editorContainer"),
              h(".chat-input-toolbars@inputToolbars")
            ])
          ])
        ]),
        h(".chat-secondary-toolbar@secondaryToolbar", [
          h(".chat-responsive-picker-container@responsivePickerContainer"),
          h(".chat-context-usage-container@contextUsageWidgetContainer"),
          h(".chat-input-status-container@statusToolbarContainer")
        ])
      ]);
    }
    this.container = elements.root;
    this.persistentContentContainer = elements.persistentContentContainer;
    this.chatInputOverlay = $(".chat-input-overlay");
    container3.append(this.container);
    this.container.append(this.chatInputOverlay);
    this.container.classList.toggle("compact", this.options.renderStyle === "compact");
    this._scopedContextKeyService = this._register(this.contextKeyService.createScoped(this.container));
    this.followupsContainer = elements.followupsContainer;
    const inputAndSideToolbar = elements.inputAndSideToolbar;
    this.inputAndSideToolbar = inputAndSideToolbar;
    const inputContainer = elements.inputContainer;
    this.inputContainer = inputContainer;
    const editorContainer = elements.editorContainer;
    this.attachmentsContainer = elements.attachmentsContainer;
    this.attachedContextContainer = elements.attachedContextContainer;
    const toolbarsContainer = elements.inputToolbars;
    this.secondaryToolbarContainer = elements.secondaryToolbar;
    const responsivePickerContainer = elements.responsivePickerContainer;
    if (this.options.renderStyle === "compact") {
      this.secondaryToolbarContainer.style.display = "none";
    }
    this.chatEditingSessionWidgetContainer = elements.chatEditingSessionWidgetContainer;
    this.chatInputTodoListWidgetContainer = elements.chatInputTodoListWidgetContainer;
    this.chatArtifactsWidgetContainer = elements.chatArtifactsWidgetContainer;
    this.chatGettingStartedTipContainer = elements.chatGettingStartedTipContainer;
    this.chatQuestionCarouselContainer = elements.chatQuestionCarouselContainer;
    this.chatPlanReviewContainer = elements.chatPlanReviewContainer;
    this.chatToolConfirmationCarouselContainer = elements.chatToolConfirmationCarouselContainer;
    hide(this.chatToolConfirmationCarouselContainer);
    this._register(this.chatInputNoticeHubService.registerHost(this.noticeHost, this.container));
    this.chatInputNotificationContainer = elements.chatInputNotificationContainer;
    this._register(registerChatInputOnboardingHosts(
      this.noticeHost,
      { voice: elements.voiceModeOnboardingContainer, dictation: elements.dictationOnboardingContainer },
      this.container,
      () => this.focus(),
      this.voiceModeOnboardingService,
      this.dictationOnboardingService
    ));
    this.contextUsageWidgetContainer = elements.contextUsageWidgetContainer;
    this.statusToolbarContainer = elements.statusToolbarContainer;
    if (this.options.renderStyle === "compact") {
      toolbarsContainer.prepend(this.contextUsageWidgetContainer);
    }
    this.contextUsageWidget = this._register(this.instantiationService.createInstance(ChatContextUsageWidget));
    this.contextUsageWidget.setChatWidget(widget);
    this.contextUsageWidget.setSelectedModel(this._currentLanguageModel.get()?.identifier);
    this.contextUsageWidget.setModelConfigurationResolver(
      (modelId) => this.getModelConfiguration(modelId),
      this._modelConfigStore.onDidChange
    );
    this.contextUsageWidgetContainer.appendChild(this.contextUsageWidget.domNode);
    if (this.options.enableImplicitContext && !this._implicitContext) {
      this._implicitContext = this._register(
        this.instantiationService.createInstance(ChatImplicitContexts)
      );
      this.setImplicitContextEnablement();
      this._register(this._implicitContext.onDidChangeValue(() => {
        this._indexOfLastAttachedContextDeletedWithKeyboard = -1;
        this._handleAttachedContextChange();
      }));
    } else if (!this.options.enableImplicitContext && this._implicitContext) {
      this._implicitContext?.dispose();
      this._implicitContext = void 0;
    }
    this.ensureNotificationWidget();
    this._register(this._attachmentModel.onDidChange((e) => {
      if (e.added.length > 0) {
        this._indexOfLastAttachedContextDeletedWithKeyboard = -1;
      }
      this._handleAttachedContextChange();
    }));
    this.renderChatEditingSessionState(null);
    this.dnd.addOverlay(this.options.dndContainer ?? container3, this.options.dndContainer ?? container3);
    const inputScopedContextKeyService = this._register(this.contextKeyService.createScoped(inputContainer));
    ChatContextKeys.inChatInput.bindTo(inputScopedContextKeyService).set(true);
    this.currentlyEditingInputKey = ChatContextKeys.currentlyEditingInput.bindTo(inputScopedContextKeyService);
    this.editingSentRequestKey = ChatContextKeys.editingRequestType.bindTo(this.contextKeyService);
    const scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, inputScopedContextKeyService])));
    const { historyNavigationBackwardsEnablement, historyNavigationForwardsEnablement } = this._register(registerAndCreateHistoryNavigationContext(inputScopedContextKeyService, this));
    this.historyNavigationBackwardsEnablement = historyNavigationBackwardsEnablement;
    this.historyNavigationForewardsEnablement = historyNavigationForwardsEnablement;
    const options3 = getSimpleEditorOptions(this.configurationService);
    options3.overflowWidgetsDomNode = this.options.editorOverflowWidgetsDomNode;
    options3.pasteAs = EditorOptions.pasteAs.defaultValue;
    options3.readOnly = false;
    options3.ariaLabel = this._getAriaLabel();
    options3.fontFamily = DEFAULT_FONT_FAMILY;
    options3.fontSize = 13;
    options3.lineHeight = INPUT_EDITOR_LINE_HEIGHT;
    options3.padding = this.options.renderStyle === "compact" ? INPUT_EDITOR_PADDING.compact : INPUT_EDITOR_PADDING.default;
    options3.cursorWidth = 1;
    options3.wrappingStrategy = "advanced";
    options3.bracketPairColorization = { enabled: false };
    options3.autoClosingBrackets = this.configurationService.getValue("editor.autoClosingBrackets");
    options3.autoClosingQuotes = this.configurationService.getValue("editor.autoClosingQuotes");
    options3.autoSurround = this.configurationService.getValue("editor.autoSurround");
    options3.quickSuggestions = false;
    options3.suggest = {
      showIcons: true,
      showSnippets: false,
      showWords: true,
      showStatusBar: false,
      insertMode: "insert",
      fitWidthToDetails: true
    };
    options3.scrollbar = this.options.renderStyle === "compact" ? { ...options3.scrollbar ?? {}, vertical: "hidden" } : {
      ...options3.scrollbar ?? {},
      vertical: "auto",
      verticalScrollbarSize: 7
    };
    options3.stickyScroll = { enabled: false };
    this._inputEditorElement = append(editorContainer, $43(chatInputEditorContainerSelector));
    const editorOptions2 = getSimpleCodeEditorWidgetOptions();
    editorOptions2.contributions?.push(...EditorExtensionsRegistry.getSomeEditorContributions([ContentHoverController.ID, GlyphHoverController.ID, DropIntoEditorController.ID, CopyPasteController.ID, LinkDetector.ID, InlineCompletionsController.ID, PlaceholderTextContribution.ID]));
    this._inputEditor = this._register(scopedInstantiationService.createInstance(CodeEditorWidget, this._inputEditorElement, options3, editorOptions2));
    this.updateInputEditorFontFamily();
    this._register(addDisposableListener(this._inputEditorElement, EventType.PASTE, (e) => this.handleTerminalCommandPaste(e), true));
    const dictationRecording = ChatContextKeys.speechToTextRecording.bindTo(this.contextKeyService);
    const dictationPreparing = ChatContextKeys.speechToTextPreparing.bindTo(this.contextKeyService);
    const isDictationInputActive = observableFromEvent(
      this,
      Event2.any(this.speechToTextService.onDidChangeState, this.speechToTextService.onDidChangePreparingModel, onDidChangeDictationEditor),
      () => isDictationActiveForEditor(this._inputEditor)
    );
    const updateDictationContextKeys = () => {
      const active = isDictationActiveForEditor(this._inputEditor);
      dictationRecording.set(active && this.speechToTextService.state === "recording" /* Recording */);
      dictationPreparing.set(active && this.speechToTextService.isPreparingModel);
    };
    this._register(Event2.any(this.speechToTextService.onDidChangeState, this.speechToTextService.onDidChangePreparingModel, onDidChangeDictationEditor)(updateDictationContextKeys));
    updateDictationContextKeys();
    SuggestController.get(this._inputEditor)?.forceRenderingAbove();
    options3.overflowWidgetsDomNode?.classList.add("hideSuggestTextIcons");
    this._inputEditorElement.classList.add("hideSuggestTextIcons");
    this._register(this._inputEditor.onKeyDown((e) => {
      if (e.keyCode === 3 /* Enter */ && !hasModifierKeys(e)) {
        for (const keybinding of this.keybindingService.lookupKeybindings(ChatSubmitAction.ID)) {
          const chords = keybinding.getDispatchChords();
          const isPlainEnter = chords.length === 1 && chords[0] === "[Enter]";
          if (isPlainEnter) {
            e.preventDefault();
            break;
          }
        }
      }
    }));
    this._register(this._inputEditor.onDidChangeModelContent(() => {
      const currentHeight = Math.min(this._inputEditor.getContentHeight(), this._effectiveInputEditorMaxHeight);
      if (currentHeight !== this.inputEditorHeight) {
        this.inputEditorHeight = currentHeight;
        if (this.cachedWidth) {
          this._layout(this.cachedWidth);
        }
      }
      this._updateInputContentContextKeys();
      this.updateInputEditorFontFamily();
      this._syncTextDebounced.schedule();
    }));
    this._register(this._inputEditor.onDidContentSizeChange((e) => {
      if (e.contentHeightChanged && !this.ignoreInputEditorContentSizeChanges) {
        this.inputEditorHeight = !this.inline ? e.contentHeight : this.inputEditorHeight;
        if (this.cachedWidth) {
          this._layout(this.cachedWidth);
        }
      }
    }));
    this._register(this._inputEditor.onDidFocusEditorText(() => {
      this.inputEditorHasFocus.set(true);
      this._onDidFocus.fire();
      inputContainer.classList.toggle("focused", true);
      setChatInputStackInputFocused(inputContainer, true);
    }));
    this._register(this._inputEditor.onDidBlurEditorText(() => {
      this.inputEditorHasFocus.set(false);
      inputContainer.classList.toggle("focused", false);
      setChatInputStackInputFocused(inputContainer, false);
      this._onDidBlur.fire();
    }));
    this._register(this._inputEditor.onDidBlurEditorWidget(() => {
      CopyPasteController.get(this._inputEditor)?.clearWidgets();
      DropIntoEditorController.get(this._inputEditor)?.clearWidgets();
    }));
    const hoverDelegate = this._register(createInstantHoverDelegate());
    const { location: location2 } = this.getWidgetLocationInfo(widget);
    const focusedWidget = observableFromEvent(this, this.chatWidgetService.onDidChangeFocusedSession, () => this.chatWidgetService.lastFocusedWidget);
    const isVoiceInputActive = derived(this, (reader) => focusedWidget.read(reader) === widget);
    const isVoiceSessionActive = derived(this, (reader) => {
      if (!isVoiceInputActive.read(reader)) {
        return false;
      }
      const target = this.voiceSessionController.targetSession.read(reader);
      const hasDraftTarget = this.voiceSessionController.hasDraftTarget.read(reader);
      const resource = widget.viewModel?.sessionResource;
      return !hasDraftTarget && (!target || !!resource && isEqual2(target, resource));
    });
    const inputPickerCompactStates = /* @__PURE__ */ new Map();
    const secondaryPickerCompactStates = /* @__PURE__ */ new Map();
    const inputOverflowPickerHandlers = /* @__PURE__ */ new Map();
    const secondaryOverflowPickerHandlers = /* @__PURE__ */ new Map();
    const getCompactState = (states, actionId) => {
      let state = states.get(actionId);
      if (!state) {
        state = observableValue(this, false);
        states.set(actionId, state);
      }
      return state;
    };
    const getInputPickerOptions = (actionId) => ({
      getOverflowAnchor: () => this.inputActionsToolbar.getElement(),
      actionContext: { widget },
      compact: getCompactState(inputPickerCompactStates, actionId)
    });
    const getSecondaryPickerOptions = (actionId) => ({
      getOverflowAnchor: () => this.secondaryToolbar.getElement(),
      actionContext: { widget },
      compact: getCompactState(secondaryPickerCompactStates, actionId)
    });
    const showOverflowPicker = (factory, anchor) => {
      const item = factory();
      if (!item) {
        return;
      }
      this.overflowPickerWidget.value = item;
      item.render($(".chat-overflow-picker-item"));
      item.show(anchor);
    };
    const showRegisteredOverflowPicker = (factory, action, anchor) => {
      const item = factory(action, { hoverDelegate }, this.instantiationService, getWindow(anchor).vscodeWindowId);
      if (!isShowableActionViewItem(item)) {
        item?.dispose();
        return false;
      }
      this.overflowPickerWidget.value = item;
      item.render($(".chat-overflow-picker-item"));
      item.show(anchor);
      return true;
    };
    const getOverflowAction = (action, menuId, handlers, getAnchor, fallbackAnchor, hostHandler) => {
      const handler = handlers.get(action.id);
      const registeredFactory = this.actionViewItemService.lookUp(menuId, action.id);
      if (!handler && !hostHandler && !registeredFactory) {
        return action;
      }
      return createOverflowAction(action, () => {
        const overflowAnchor = getAnchor();
        const anchor = overflowAnchor ?? fallbackAnchor;
        getWindow(anchor).setTimeout(() => {
          overflowAnchor?.focus();
          if (handler) {
            handler(anchor);
          } else if (hostHandler?.(action.id, anchor)) {
            return;
          } else if (registeredFactory && showRegisteredOverflowPicker(registeredFactory, action, anchor)) {
            return;
          } else {
            void action.run({ widget });
          }
        }, 0);
      });
    };
    const shorterChatInputActionIds = /* @__PURE__ */ new Set([
      OpenModePickerAction.ID,
      ConfigureToolsAction.ID
    ]);
    const getInputActionMinWidth = (action) => {
      if (shorterChatInputActionIds.has(action.id)) {
        return 22;
      }
      if (inputPickerCompactStates.get(action.id)?.get()) {
        return action.id === OpenModelPickerAction.ID ? 76 : 22;
      }
      return void 0;
    };
    this._register(addStandardDisposableListener(toolbarsContainer, EventType.CLICK, (e) => this.inputEditor.focus()));
    this._register(addStandardDisposableListener(this.attachmentsContainer, EventType.CLICK, (e) => this.inputEditor.focus()));
    this.inputActionsToolbar = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, this.options.renderInputToolbarBelowInput ? this.attachmentsContainer : toolbarsContainer, MenuId.ChatInput, {
      telemetrySource: this.options.menus.telemetrySource,
      menuOptions: { shouldForwardArgs: true },
      hiddenItemStrategy: -1 /* NoHide */,
      hoverDelegate,
      responsiveBehavior: {
        enabled: true,
        kind: "last",
        minItems: 1,
        actionMinWidth: 48,
        getActionMinWidth: getInputActionMinWidth,
        allowOverflow: () => this._inputPickerResponsiveLayout?.areAllItemsCompact() === true,
        getOverflowAction: (action, getAnchor) => getOverflowAction(action, MenuId.ChatInput, inputOverflowPickerHandlers, getAnchor, toolbarsContainer)
      },
      actionViewItemProvider: (action, options4) => {
        if (this.chatPhoneInputPresenter.enabled.get()) {
          if (action.id === OpenModelPickerAction.ID && action instanceof MenuItemAction) {
            if (!this._currentLanguageModel.get()) {
              this.setCurrentLanguageModelToDefault();
            }
            const modelDelegate = this._createModelPickerDelegate();
            const modeDelegate = this._createModePickerDelegate();
            return this.instantiationService.createInstance(MobileChatInputCombinedPickerActionItem, action, modeDelegate, modelDelegate);
          } else if (action.id === OpenModePickerAction.ID && action instanceof MenuItemAction) {
            return new HiddenActionViewItem(action);
          }
        }
        if (action.id === OpenModelPickerAction.ID && action instanceof MenuItemAction) {
          if (!this._currentLanguageModel.get()) {
            this._modelSelectionDiagnostics.report("no-model-at-toolbar-build", {}, "info");
            this.setCurrentLanguageModelToDefault();
          }
          const itemDelegate = this._createModelPickerDelegate();
          const createPicker = () => this.instantiationService.createInstance(ModelPickerActionItem, action, itemDelegate, getInputPickerOptions(action.id));
          inputOverflowPickerHandlers.set(action.id, (anchor) => showOverflowPicker(createPicker, anchor));
          return this.modelWidget = createPicker();
        } else if (action.id === OpenModePickerAction.ID && action instanceof MenuItemAction) {
          const delegate2 = this._createModePickerDelegate();
          const createPicker = () => this.instantiationService.createInstance(ModePickerActionItem, action, delegate2, getInputPickerOptions(action.id));
          inputOverflowPickerHandlers.set(action.id, (anchor) => showOverflowPicker(createPicker, anchor));
          return this.modeWidget = createPicker();
        } else if ((action.id === OpenSessionTargetPickerAction.ID || action.id === OpenDelegationPickerAction.ID) && action instanceof MenuItemAction) {
          const delegate2 = this.options.sessionTypePickerDelegate ?? {
            getActiveSessionProvider: () => {
              return this.getActiveSessionTypeForDelegation();
            },
            getPendingDelegationTarget: () => {
              return this._pendingDelegationTarget;
            },
            setPendingDelegationTarget: (provider) => {
              this.setPendingDelegationTarget(provider);
            },
            hasGitRepository: () => this.hasWorkspaceScmRepository()
          };
          const isWelcomeViewMode = !!this.options.sessionTypePickerDelegate?.setActiveSessionProvider;
          const Picker = action.id === OpenSessionTargetPickerAction.ID || isWelcomeViewMode ? SessionTypePickerActionItem : DelegationSessionPickerActionItem;
          const createPicker = () => this.instantiationService.createInstance(Picker, action, location2 === "editor" /* Editor */ ? "editor" : "sidebar", delegate2, getInputPickerOptions(action.id));
          inputOverflowPickerHandlers.set(action.id, (anchor) => showOverflowPicker(createPicker, anchor));
          const picker = createPicker();
          if (picker instanceof DelegationSessionPickerActionItem) {
            this.delegationWidget = picker;
          } else {
            this.sessionTargetWidget = picker;
          }
          return picker;
        } else if (action.id === ChatSessionPrimaryPickerAction.ID && action instanceof MenuItemAction) {
          const createPicker = () => {
            const widgets2 = this.createChatSessionPickerWidgets(action, getInputPickerOptions(action.id));
            return widgets2.length === 0 ? void 0 : this.instantiationService.createInstance(ChatSessionPickersContainerActionItem, action, widgets2);
          };
          inputOverflowPickerHandlers.set(action.id, (anchor) => showOverflowPicker(createPicker, anchor));
          return createPicker() ?? new HiddenActionViewItem(action);
        }
        return void 0;
      }
    }));
    this.inputActionsToolbar.getElement().classList.add("chat-input-toolbar");
    this.inputActionsToolbar.context = { widget };
    this._register(this.inputActionsToolbar.onDidChangeMenuItems(() => {
      const toolbarElement = this.inputActionsToolbar.getElement();
      const primaryPickerContainer = toolbarElement.querySelector(".chat-sessionPicker-container");
      if (primaryPickerContainer) {
        this.chatSessionPickerContainer = primaryPickerContainer;
      }
      if (this.cachedWidth && typeof this.cachedInputToolbarWidth === "number" && this.cachedInputToolbarWidth !== this.inputActionsToolbar.getItemsWidth()) {
        this._toolbarRelayoutScheduler.schedule();
      }
    }));
    let lastPhoneEnabled = this.chatPhoneInputPresenter.enabled.get();
    this._register(autorun((reader) => {
      const enabled = this.chatPhoneInputPresenter.enabled.read(reader);
      if (enabled !== lastPhoneEnabled) {
        lastPhoneEnabled = enabled;
        this.inputActionsToolbar.refresh();
      }
    }));
    this.executeToolbar = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, toolbarsContainer, this.options.menus.executeToolbar, {
      telemetrySource: this.options.menus.telemetrySource,
      menuOptions: {
        shouldForwardArgs: true
      },
      hoverDelegate,
      hiddenItemStrategy: -1 /* NoHide */,
      actionViewItemProvider: (action, options4) => {
        if (action.id === ChatVoiceInputModeAction.ID) {
          return this.instantiationService.createInstance(VoiceInputModeActionViewItem, action, {
            isActive: isVoiceInputActive,
            isDictationActive: isDictationInputActive,
            isVoiceActive: isVoiceSessionActive
          });
        }
        if ((action.id === ChatSubmitAction.ID || action.id === ChatEditingSessionSubmitAction.ID) && action instanceof MenuItemAction) {
          return this.instantiationService.createInstance(class extends MenuEntryActionViewItem {
            render(container4) {
              super.render(container4);
              container4.classList.add("chat-submit-button");
            }
          }, action, options4);
        }
        if ((action.id === ChatSpeechToTextPreparingAction.ID || action.id === ChatSpeechToTextConnectingAction.ID) && action instanceof MenuItemAction) {
          return this.instantiationService.createInstance(DictationDownloadActionViewItem, action, options4);
        }
        if (action.id === ToggleChatSpeechToTextAction.ID && action instanceof MenuItemAction) {
          return this.instantiationService.createInstance(DictationActionViewItem, action, options4, isDictationInputActive);
        }
        if ((action.id === "agentsVoice.startVoiceInChat" || action.id === "agentsVoice.pttStopInChat") && action instanceof MenuItemAction) {
          return this.instantiationService.createInstance(VoiceModeActionViewItem, action, options4);
        }
        return void 0;
      }
    }));
    this.executeToolbar.getElement().classList.add("chat-execute-toolbar");
    this.executeToolbar.context = { widget };
    const voiceInputActionIconClasses = new Set([
      Codicon.micCompact,
      Codicon.micFilled,
      Codicon.micDownloadCompact,
      Codicon.voiceModeCompact,
      Codicon.loadingCompact,
      Codicon.debugDisconnectCompact
    ].map((icon2) => ThemeIcon.asClassName(icon2)));
    const updateVoiceInputActionBorder = () => {
      let voiceInputActionCount = 0;
      for (let i2 = 0; ; i2++) {
        const action = this.executeToolbar.getItemAction(i2);
        if (!action) {
          break;
        }
        if (action.class && voiceInputActionIconClasses.has(action.class)) {
          voiceInputActionCount++;
        }
      }
      this.executeToolbar.getElement().classList.toggle("chat-voice-input-actions-multiple", voiceInputActionCount > 1);
    };
    updateVoiceInputActionBorder();
    this._register(this.executeToolbar.onDidChangeMenuItems(() => {
      updateVoiceInputActionBorder();
      if (this.cachedWidth && typeof this.cachedExecuteToolbarWidth === "number" && this.cachedExecuteToolbarWidth !== this.executeToolbar.getItemsWidth()) {
        this._toolbarRelayoutScheduler.schedule();
      }
    }));
    if (this.options.menus.inputSideToolbar) {
      const toolbarSide = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, inputAndSideToolbar, this.options.menus.inputSideToolbar, {
        telemetrySource: this.options.menus.telemetrySource,
        menuOptions: {
          shouldForwardArgs: true
        },
        hoverDelegate
      }));
      this.inputSideToolbarContainer = toolbarSide.getElement();
      toolbarSide.getElement().classList.add("chat-side-toolbar");
      toolbarSide.context = { widget };
    }
    const secondaryPickerMinWidths = /* @__PURE__ */ new Map([
      [OpenSessionTargetPickerAction.ID, 22],
      [OpenDelegationPickerAction.ID, 22],
      [OpenWorkspacePickerAction.ID, 22],
      [ChatSessionPrimaryPickerAction.ID, 22],
      [OpenAgentHostModePickerAction.ID, 22],
      ["sessions.agentHost.runningSessionModePicker", 22],
      ["sessions.agentHost.runningSessionConfigPicker", 22],
      ["sessions.agentHost.runningSessionPermissionModePicker", 22],
      ["sessions.agentHost.runningSessionCodexApprovalsPicker", 22],
      [OpenAgentHostPermissionModePickerAction.ID, 22],
      [OpenAgentHostCodexApprovalsPickerAction.ID, 22],
      [OpenAgentHostFolderPickerAction.ID, 22],
      ["sessions.tunnelHost.toggleSharing", 16]
    ]);
    const genericChipsContainer = $(".chat-secondary-generic-chips");
    const genericChipsLane = this._register(this.instantiationService.createInstance(
      AgentHostGenericConfigChips,
      widget
    ));
    genericChipsLane.render(genericChipsContainer);
    const getSecondaryToolbarAvailableWidth = () => {
      const laneWidth = responsivePickerContainer.getBoundingClientRect().width;
      if (genericChipsContainer.parentElement !== responsivePickerContainer || genericChipsContainer.getClientRects().length === 0) {
        return laneWidth;
      }
      const gap = Number.parseFloat(getWindow(responsivePickerContainer).getComputedStyle(responsivePickerContainer).columnGap) || 0;
      return Math.max(0, laneWidth - genericChipsContainer.getBoundingClientRect().width - gap);
    };
    this.secondaryToolbar = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, responsivePickerContainer, MenuId.ChatInputSecondary, {
      telemetrySource: this.options.menus.telemetrySource,
      menuOptions: { shouldForwardArgs: true },
      hiddenItemStrategy: -1 /* NoHide */,
      hoverDelegate,
      responsiveBehavior: {
        enabled: true,
        kind: "all",
        minItems: 1,
        actionMinWidth: 48,
        getActionMinWidth: (action) => secondaryPickerMinWidths.get(action.id) ?? (secondaryPickerCompactStates.get(action.id)?.get() ? 22 : void 0),
        observedElement: responsivePickerContainer,
        getAvailableWidth: getSecondaryToolbarAvailableWidth,
        allowOverflow: () => this._secondaryPickerResponsiveLayout?.areAllItemsCompact() === true,
        getOverflowAction: (action, getAnchor) => getOverflowAction(action, MenuId.ChatInputSecondary, secondaryOverflowPickerHandlers, getAnchor, responsivePickerContainer, this.options.secondaryToolbarOverflowActionHandler)
      },
      actionViewItemProvider: (action, options4) => {
        const agentHostPickerProperty = getAgentHostPickerProperty(action.id);
        const customSecondaryItem = this.options.secondaryToolbarActionViewItemProvider?.(action, options4);
        if (customSecondaryItem) {
          getCompactState(secondaryPickerCompactStates, action.id);
          return customSecondaryItem;
        }
        if ((action.id === OpenSessionTargetPickerAction.ID || action.id === OpenDelegationPickerAction.ID) && action instanceof MenuItemAction) {
          const delegate2 = this.options.sessionTypePickerDelegate ?? {
            getActiveSessionProvider: () => {
              return this.getActiveSessionTypeForDelegation();
            },
            getPendingDelegationTarget: () => {
              return this._pendingDelegationTarget;
            },
            setPendingDelegationTarget: (provider) => {
              this.setPendingDelegationTarget(provider);
            },
            hasGitRepository: () => this.hasWorkspaceScmRepository()
          };
          const isWelcomeViewMode = !!this.options.sessionTypePickerDelegate?.setActiveSessionProvider;
          const Picker = action.id === OpenSessionTargetPickerAction.ID || isWelcomeViewMode ? SessionTypePickerActionItem : DelegationSessionPickerActionItem;
          const createPicker = () => this.instantiationService.createInstance(Picker, action, location2 === "editor" /* Editor */ ? "editor" : "sidebar", delegate2, getSecondaryPickerOptions(action.id));
          secondaryOverflowPickerHandlers.set(action.id, (anchor) => showOverflowPicker(createPicker, anchor));
          const picker = createPicker();
          if (picker instanceof DelegationSessionPickerActionItem) {
            this.delegationWidget = picker;
          } else {
            this.sessionTargetWidget = picker;
          }
          return picker;
        } else if (action.id === OpenWorkspacePickerAction.ID && action instanceof MenuItemAction) {
          const workspacePickerDelegate = this.options.workspacePickerDelegate;
          if (this.workspaceContextService.getWorkbenchState() === 1 /* EMPTY */ && workspacePickerDelegate) {
            const createPicker = () => this.instantiationService.createInstance(WorkspacePickerActionItem, action, workspacePickerDelegate, getSecondaryPickerOptions(action.id));
            secondaryOverflowPickerHandlers.set(action.id, (anchor) => showOverflowPicker(createPicker, anchor));
            return createPicker();
          } else {
            return new HiddenActionViewItem(action);
          }
        } else if (agentHostPickerProperty && action instanceof MenuItemAction) {
          if (this.options.isSessionsWindow) {
            return new HiddenActionViewItem(action);
          }
          getCompactState(secondaryPickerCompactStates, action.id);
          const createPicker = () => this.instantiationService.createInstance(AgentHostChatInputPicker, widget, agentHostPickerProperty);
          secondaryOverflowPickerHandlers.set(action.id, (anchor) => {
            const picker = createPicker();
            this.overflowPickerWidget.value = picker;
            picker.show(anchor);
          });
          return new AgentHostChatInputPickerActionViewItem(action, createPicker());
        } else if (action.id === OpenAgentHostFolderPickerAction.ID && action instanceof MenuItemAction) {
          if (this.options.isSessionsWindow) {
            return new HiddenActionViewItem(action);
          }
          const createPicker = () => this.instantiationService.createInstance(AgentHostFolderPickerActionItem, action, widget, getSecondaryPickerOptions(action.id));
          secondaryOverflowPickerHandlers.set(action.id, (anchor) => showOverflowPicker(createPicker, anchor));
          return createPicker();
        } else if (action.id === ChatSessionPrimaryPickerAction.ID && action instanceof MenuItemAction) {
          const createPicker = () => {
            const widgets2 = this.createChatSessionPickerWidgets(action, getSecondaryPickerOptions(action.id));
            return widgets2.length === 0 ? void 0 : this.instantiationService.createInstance(ChatSessionPickersContainerActionItem, action, widgets2);
          };
          secondaryOverflowPickerHandlers.set(action.id, (anchor) => showOverflowPicker(createPicker, anchor));
          return createPicker() ?? new HiddenActionViewItem(action);
        }
        return void 0;
      }
    }));
    this.secondaryToolbar.getElement().classList.add("chat-secondary-input-toolbar");
    this.secondaryToolbar.context = { widget };
    append(responsivePickerContainer, genericChipsContainer);
    this._register(this.secondaryToolbar.onDidChangeMenuItems(() => {
      const toolbarElement = this.secondaryToolbar.getElement();
      const container4 = toolbarElement.querySelector(".chat-sessionPicker-container");
      if (isHTMLElement(container4)) {
        this.chatSessionPickerContainer = container4;
      }
    }));
    this.statusToolbar = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, this.statusToolbarContainer, MenuId.ChatInputStatus, {
      telemetrySource: this.options.menus.telemetrySource,
      menuOptions: { shouldForwardArgs: true },
      hiddenItemStrategy: -1 /* NoHide */,
      hoverDelegate
    }));
    this.statusToolbar.getElement().classList.add("chat-input-status-toolbar");
    this.statusToolbar.context = { widget };
    const inputToolbarElement = this.inputActionsToolbar.getElement();
    this._inputPickerResponsiveLayout = this._register(new ChatInputPickerResponsiveLayout("ChatInputPart.primaryPicker", inputToolbarElement, {
      getItems: () => getToolbarPickerResponsiveItems(this.inputActionsToolbar, inputPickerCompactStates),
      hasOverflow: () => this.inputActionsToolbar.hasOverflow(),
      relayout: () => this.inputActionsToolbar.relayout()
    }));
    this._secondaryPickerResponsiveLayout = this._register(new ChatInputPickerResponsiveLayout("ChatInputPart.secondaryPicker", responsivePickerContainer, {
      getItems: () => [
        ...getToolbarPickerResponsiveItems(this.secondaryToolbar, secondaryPickerCompactStates),
        ...genericChipsLane.getCompactableElements().map((element) => ({
          element,
          isCompact: () => element.classList.contains("compact-picker"),
          setCompact: (compact2) => element.classList.toggle("compact-picker", compact2)
        }))
      ],
      hasOverflow: () => this.secondaryToolbar.hasOverflow(),
      relayout: () => this.secondaryToolbar.relayout()
    }));
    this._inputPickerResponsiveLayout.layout();
    this._secondaryPickerResponsiveLayout.layout();
    let inputModel = this.modelService.getModel(this.inputUri);
    let createdInputModel;
    if (!inputModel) {
      inputModel = createdInputModel = this.modelService.createModel("", null, this.inputUri, false);
    }
    const inputModelReference = this.textModelResolverService.createModelReference(this.inputUri);
    if (createdInputModel) {
      const model = createdInputModel;
      this._register(toDisposable(() => {
        void inputModelReference.then(
          () => model.dispose(),
          () => model.dispose()
        );
      }));
    }
    inputModelReference.then((ref) => {
      if (this._store.isDisposed) {
        ref.dispose();
        return;
      }
      this._register(ref);
    }, (error) => {
      if (!this._store.isDisposed) {
        onUnexpectedError(error);
      }
    });
    this.inputModel = inputModel;
    this.inputModel.updateOptions({ bracketColorizationOptions: { enabled: false, independentColorPoolPerBracketType: false } });
    this._inputEditor.setModel(this.inputModel);
    if (initialValue) {
      this.inputModel.setValue(initialValue);
      const lineNumber = this.inputModel.getLineCount();
      this._inputEditor.setPosition({ lineNumber, column: this.inputModel.getLineMaxColumn(lineNumber) });
    }
    const onDidChangeCursorPosition = () => {
      const model = this._inputEditor.getModel();
      if (!model) {
        return;
      }
      const position2 = this._inputEditor.getPosition();
      if (!position2) {
        return;
      }
      const atTop = position2.lineNumber === 1 && position2.column === 1;
      this.chatCursorAtTop.set(atTop);
      this.historyNavigationBackwardsEnablement.set(atTop);
      this.historyNavigationForewardsEnablement.set(position2.equals(getLastPosition(model)));
      this._syncInputStateToModel();
    };
    this._register(this._inputEditor.onDidChangeCursorPosition((e) => onDidChangeCursorPosition()));
    onDidChangeCursorPosition();
    this._register(this.themeService.onDidFileIconThemeChange(() => {
      this.renderAttachedContext();
    }));
    this.renderAttachedContext();
    const updateCarouselMaxHeightScheduler = this._register(new AnimationFrameScheduler(this.container, () => this.updateToolConfirmationCarouselMaxHeight()));
    const inputResizeObserver = this._register(new DisposableResizeObserver("ChatInputPart.containerHeight", () => {
      updateCarouselMaxHeightScheduler.schedule();
      const newHeight = this.container.offsetHeight;
      this.height.set(newHeight, void 0);
    }));
    this._register(inputResizeObserver.observe(this.container));
    if (this.options.renderStyle === "compact") {
      const toolbarsResizeObserver = this._register(new DisposableResizeObserver("ChatInputPart.compactToolbars", () => {
        this.layoutForToolbarChange();
      }));
      this._register(toolbarsResizeObserver.observe(toolbarsContainer));
    }
  }
  toggleChatInputOverlay(editing) {
    this.chatInputOverlay.classList.toggle("disabled", editing);
    if (editing) {
      this.overlayClickListener.value = addStandardDisposableListener(this.chatInputOverlay, EventType.CLICK, (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._onDidClickOverlay.fire();
      });
    } else {
      this.overlayClickListener.clear();
    }
  }
  renderAttachedContext() {
    const container3 = this.attachedContextContainer;
    const store = new DisposableStore();
    this.attachedContextDisposables.value = store;
    clearNode(container3);
    store.add(addStandardDisposableListener(this.attachmentsContainer, EventType.KEY_DOWN, (e) => {
      this.handleAttachmentNavigation(e);
    }));
    const attachments = this.getRenderableAttachments().map((attachment, index2) => [index2, attachment]);
    const hasAttachments = Boolean(attachments.length);
    let hasImplicitContext = false;
    const isSuggestedEnabled = this.configurationService.getValue("chat.implicitContext.suggestedContext");
    const hasVisibleImplicitContext = isSuggestedEnabled ? this._implicitContext?.hasValue ?? false : this._implicitContext?.values.some((v2) => v2.enabled || v2.isSelection) ?? false;
    if (this._implicitContext && hasVisibleImplicitContext) {
      const isAttachmentAlreadyAttached = (targetUri, targetRange, targetHandle) => {
        return this._attachmentModel.attachments.some((a) => {
          const aUri = URI.isUri(a.value) ? a.value : isLocation(a.value) ? a.value.uri : void 0;
          const aRange = isLocation(a.value) ? a.value.range : void 0;
          if (targetHandle !== void 0 && isStringVariableEntry(a) && a.handle === targetHandle) {
            return true;
          }
          if (targetUri && aUri && isEqual2(targetUri, aUri)) {
            if (targetRange && aRange) {
              return Range2.equalsRange(targetRange, aRange);
            }
            return !targetRange && !aRange;
          }
          return false;
        });
      };
      const implicitContextWidget = this.instantiationService.createInstance(
        ImplicitContextAttachmentWidget,
        () => this._widget,
        isAttachmentAlreadyAttached,
        this._implicitContext,
        this._contextResourceLabels,
        this._attachmentModel,
        container3
      );
      store.add(implicitContextWidget);
      hasImplicitContext = implicitContextWidget.hasRenderedContexts;
    }
    setVisibility(Boolean(this.options.renderInputToolbarBelowInput || hasAttachments || hasImplicitContext), this.attachmentsContainer);
    setVisibility(hasAttachments || hasImplicitContext, this.attachedContextContainer);
    if (!attachments.length) {
      this._indexOfLastAttachedContextDeletedWithKeyboard = -1;
      this._indexOfLastOpenedContext = -1;
    }
    const maxImagesPerRequest = getImageAttachmentLimit(this._currentLanguageModel.get()?.metadata);
    const imageAttachments = attachments.filter(([, a]) => isImageVariableEntry(a));
    if (maxImagesPerRequest !== void 0 && imageAttachments.length > maxImagesPerRequest) {
      const excessCount = imageAttachments.length - maxImagesPerRequest;
      for (let i2 = 0; i2 < excessCount; i2++) {
        const attachment = imageAttachments[i2][1];
        if (attachment.omittedState === 0 /* NotOmitted */ || attachment.omittedState === 3 /* ImageLimitExceeded */) {
          attachment.omittedState = 3 /* ImageLimitExceeded */;
        }
      }
      for (let i2 = excessCount; i2 < imageAttachments.length; i2++) {
        if (imageAttachments[i2][1].omittedState === 3 /* ImageLimitExceeded */) {
          imageAttachments[i2][1].omittedState = 0 /* NotOmitted */;
        }
      }
    } else {
      for (const [, a] of imageAttachments) {
        if (a.omittedState === 3 /* ImageLimitExceeded */) {
          a.omittedState = 0 /* NotOmitted */;
        }
      }
    }
    for (const [index2, attachment] of attachments) {
      const resource = URI.isUri(attachment.value) ? attachment.value : isLocation(attachment.value) ? attachment.value.uri : void 0;
      const range2 = isLocation(attachment.value) ? attachment.value.range : void 0;
      const shouldFocusClearButton = index2 === Math.min(this._indexOfLastAttachedContextDeletedWithKeyboard, attachments.length - 1) && this._indexOfLastAttachedContextDeletedWithKeyboard > -1;
      let attachmentWidget;
      const options3 = { shouldFocusClearButton, supportsDeletion: true, isCurrentInput: true };
      const lm = this._currentLanguageModel.get();
      if (attachment.kind === "tool" || attachment.kind === "toolset") {
        attachmentWidget = this.instantiationService.createInstance(ToolSetOrToolItemAttachmentWidget, attachment, lm, options3, container3, this._contextResourceLabels);
      } else if (resource && isNotebookOutputVariableEntry(attachment)) {
        attachmentWidget = this.instantiationService.createInstance(NotebookCellOutputChatAttachmentWidget, resource, attachment, lm, options3, container3, this._contextResourceLabels);
      } else if (isPromptFileVariableEntry(attachment)) {
        attachmentWidget = this.instantiationService.createInstance(PromptFileAttachmentWidget, attachment, lm, options3, container3, this._contextResourceLabels);
      } else if (isPromptTextVariableEntry(attachment)) {
        attachmentWidget = this.instantiationService.createInstance(PromptTextAttachmentWidget, attachment, void 0, options3, container3, this._contextResourceLabels);
      } else if (resource && (attachment.kind === "file" || attachment.kind === "directory")) {
        attachmentWidget = this.instantiationService.createInstance(FileAttachmentWidget, resource, range2, attachment, void 0, lm, options3, container3, this._contextResourceLabels);
      } else if (attachment.kind === "terminalCommand") {
        attachmentWidget = this.instantiationService.createInstance(TerminalCommandAttachmentWidget, attachment, lm, options3, container3, this._contextResourceLabels);
      } else if (isImageVariableEntry(attachment)) {
        attachmentWidget = this.instantiationService.createInstance(ImageAttachmentWidget, resource, attachment, lm, options3, container3, this._contextResourceLabels);
      } else if (isElementVariableEntry(attachment)) {
        attachmentWidget = this.instantiationService.createInstance(ElementChatAttachmentWidget, attachment, lm, options3, container3, this._contextResourceLabels);
      } else if (isPasteVariableEntry(attachment)) {
        attachmentWidget = this.instantiationService.createInstance(PasteAttachmentWidget, attachment, lm, options3, container3, this._contextResourceLabels);
      } else if (isSCMHistoryItemVariableEntry(attachment)) {
        attachmentWidget = this.instantiationService.createInstance(SCMHistoryItemAttachmentWidget, attachment, lm, options3, container3, this._contextResourceLabels);
      } else if (isSCMHistoryItemChangeVariableEntry(attachment)) {
        attachmentWidget = this.instantiationService.createInstance(SCMHistoryItemChangeAttachmentWidget, attachment, lm, options3, container3, this._contextResourceLabels);
      } else if (isSCMHistoryItemChangeRangeVariableEntry(attachment)) {
        attachmentWidget = this.instantiationService.createInstance(SCMHistoryItemChangeRangeAttachmentWidget, attachment, lm, options3, container3, this._contextResourceLabels);
      } else if (isBrowserViewVariableEntry(attachment)) {
        attachmentWidget = this.instantiationService.createInstance(BrowserViewAttachmentWidget, attachment, lm, options3, container3, this._contextResourceLabels);
      } else {
        attachmentWidget = this._chatAttachmentWidgetRegistry.createWidget(attachment, options3, container3) ?? this.instantiationService.createInstance(DefaultChatAttachmentWidget, resource, range2, attachment, void 0, lm, options3, container3, this._contextResourceLabels);
      }
      if (shouldFocusClearButton) {
        attachmentWidget.element.focus();
      }
      if (index2 === Math.min(this._indexOfLastOpenedContext, attachments.length - 1)) {
        attachmentWidget.element.focus();
      }
      store.add(attachmentWidget);
      store.add(attachmentWidget.onDidDelete((e) => {
        this.handleAttachmentDeletion(e, index2, attachment);
      }));
      store.add(attachmentWidget.onDidOpen((e) => {
        this.handleAttachmentOpen(index2, attachment);
      }));
    }
    this._indexOfLastOpenedContext = -1;
  }
  /**
   * Removes the inline reference bound to a deleted attachment, including one
   * trailing space, so the input is not left with a token that resolves to
   * nothing. The dynamic variable model drops the reference once its text goes.
   */
  removeInlineReferenceText(attachment) {
    if (!attachment.range || !isPastedTextArtifact(attachment)) {
      return;
    }
    const model = this._inputEditor.getModel();
    const reference = this._widget?.getContrib(ChatDynamicVariableModel.ID)?.variables.find((variable) => variable.id === attachment.id);
    if (!model || !reference) {
      return;
    }
    const range2 = Range2.lift(reference.range);
    const endColumn = model.getValueInRange(new Range2(range2.endLineNumber, range2.endColumn, range2.endLineNumber, range2.endColumn + 1)) === " " ? range2.endColumn + 1 : range2.endColumn;
    this._inputEditor.executeEdits("chatRemoveAttachmentReference", [{
      range: new Range2(range2.startLineNumber, range2.startColumn, range2.endLineNumber, endColumn),
      text: ""
    }]);
  }
  handleAttachmentDeletion(e, index2, attachment) {
    if (isKeyboardEvent(e)) {
      this._indexOfLastAttachedContextDeletedWithKeyboard = index2;
    }
    this._attachmentModel.delete(attachment.id);
    this.removeInlineReferenceText(attachment);
    if (this.configurationService.getValue("chat.implicitContext.enableImplicitContext")) {
      for (const implicitContext of this._implicitContext?.values || []) {
        const implicitValue = URI.isUri(implicitContext?.value) && URI.isUri(attachment.value) && isEqual2(implicitContext.value, attachment.value);
        if (implicitContext?.isFile && implicitValue) {
          implicitContext.enabled = false;
        }
      }
    }
    if (this.getRenderableAttachments().length === 0) {
      this.focus();
    }
    this._onDidChangeContext.fire({ removed: [attachment] });
    this.renderAttachedContext();
  }
  /**
   * The attachments that are rendered as pills in the input. Agent-host
   * completion entries (skills/commands) live in the model so their `_meta`
   * reaches the outgoing message, but they are shown as inline decorations
   * rather than pills, so they are excluded here.
   */
  getRenderableAttachments() {
    return this.attachmentModel.attachments.filter((attachment) => !isAgentHostCompletionVariableEntry(attachment));
  }
  handleAttachmentOpen(index2, attachment) {
    this._indexOfLastOpenedContext = index2;
    this._indexOfLastAttachedContextDeletedWithKeyboard = -1;
    if (this.getRenderableAttachments().length === 0) {
      this.focus();
    }
  }
  handleAttachmentNavigation(e) {
    if (!e.equals(15 /* LeftArrow */) && !e.equals(17 /* RightArrow */)) {
      return;
    }
    const attachments = Array.from(this.attachedContextContainer.querySelectorAll(".chat-attached-context-attachment"));
    if (!attachments.length) {
      return;
    }
    const activeElement = getWindow(this.attachmentsContainer).document.activeElement;
    const currentIndex = attachments.findIndex((attachment) => attachment === activeElement);
    let newIndex = currentIndex;
    if (e.equals(15 /* LeftArrow */)) {
      newIndex = currentIndex > 0 ? currentIndex - 1 : attachments.length - 1;
    } else if (e.equals(17 /* RightArrow */)) {
      newIndex = currentIndex < attachments.length - 1 ? currentIndex + 1 : 0;
    }
    if (newIndex !== -1) {
      const nextElement = attachments[newIndex];
      nextElement.focus();
      e.preventDefault();
      e.stopPropagation();
    }
  }
  async renderChatTodoListWidget(chatSessionResource) {
    const isTodoWidgetEnabled = this.configurationService.getValue("chat.tools.todos.showWidget" /* TodosShowWidget */) !== false;
    if (!isTodoWidgetEnabled) {
      return;
    }
    if (!this._chatInputTodoListWidget.value) {
      const widget = this._chatEditingTodosDisposables.add(this.instantiationService.createInstance(ChatTodoListWidget));
      this._chatInputTodoListWidget.value = widget;
      clearNode(this.chatInputTodoListWidgetContainer);
      widget.attachTo(this.chatInputTodoListWidgetContainer);
    }
    this._chatInputTodoListWidget.value.render(chatSessionResource);
  }
  clearTodoListWidget(sessionResource, force) {
    this._chatInputTodoListWidget.value?.clear(sessionResource, force);
  }
  renderArtifactsWidget(chatSessionResource) {
    if (!this.configurationService.getValue("chat.artifacts.enabled" /* ArtifactsEnabled */)) {
      return;
    }
    if (!this._chatArtifactsWidget.value) {
      const widget = this._register(this.instantiationService.createInstance(ChatArtifactsWidget));
      this._chatArtifactsWidget.value = widget;
      clearNode(this.chatArtifactsWidgetContainer);
      widget.attachTo(this.chatArtifactsWidgetContainer);
    }
    this._chatArtifactsWidget.value.setSessionResource(chatSessionResource);
  }
  clearArtifactsWidget() {
    this._chatArtifactsWidget.value?.setSessionResource(void 0);
  }
  renderQuestionCarousel(carousel, context2, options3) {
    const carouselKey = carousel.resolveId ?? `${isResponseVM(context2.element) ? context2.element.requestId : ""}_${context2.contentIndex}`;
    const existing = this._chatQuestionCarouselWidgets.get(carouselKey);
    if (existing) {
      return existing;
    }
    if (isResponseVM(context2.element)) {
      this._questionCarouselResponseIds.set(carouselKey, context2.element.requestId);
      this._questionCarouselSessionResources.set(carouselKey, context2.element.sessionResource);
    }
    const part = this.instantiationService.createInstance(ChatQuestionCarouselPart, carousel, context2, options3);
    this._chatQuestionCarouselWidgets.set(carouselKey, part);
    this._hasQuestionCarouselContextKey?.set(true);
    append(this.chatQuestionCarouselContainer, part.domNode);
    return part;
  }
  clearQuestionCarousel(responseId, resolveId) {
    if (resolveId !== void 0) {
      const part = this._chatQuestionCarouselWidgets.get(resolveId);
      if (part) {
        part.domNode.remove();
        this._chatQuestionCarouselWidgets.deleteAndDispose(resolveId);
      }
      this._questionCarouselResponseIds.delete(resolveId);
      this._questionCarouselSessionResources.delete(resolveId);
    } else if (responseId !== void 0) {
      for (const [key3, rid] of this._questionCarouselResponseIds) {
        if (rid === responseId) {
          const part = this._chatQuestionCarouselWidgets.get(key3);
          if (part) {
            part.domNode.remove();
            this._chatQuestionCarouselWidgets.deleteAndDispose(key3);
          }
          this._questionCarouselResponseIds.delete(key3);
          this._questionCarouselSessionResources.delete(key3);
        }
      }
    } else {
      this._chatQuestionCarouselWidgets.clearAndDisposeAll();
      this._questionCarouselResponseIds.clear();
      this._questionCarouselSessionResources.clear();
      clearNode(this.chatQuestionCarouselContainer);
    }
    this._hasQuestionCarouselContextKey?.set(this._chatQuestionCarouselWidgets.size > 0);
  }
  get questionCarousel() {
    for (const part of this._chatQuestionCarouselWidgets.values()) {
      if (part.hasFocus()) {
        return part;
      }
    }
    return this._chatQuestionCarouselWidgets.size > 0 ? this._chatQuestionCarouselWidgets.values().next().value : void 0;
  }
  focusQuestionCarousel() {
    const carousel = this.questionCarousel;
    if (carousel) {
      carousel.focus();
      return true;
    }
    return false;
  }
  isQuestionCarouselFocused() {
    for (const part of this._chatQuestionCarouselWidgets.values()) {
      if (part.hasFocus()) {
        return true;
      }
    }
    return false;
  }
  navigateToPreviousQuestion() {
    const carousel = this.questionCarousel;
    return carousel?.navigateToPreviousQuestion() ?? false;
  }
  navigateToNextQuestion() {
    const carousel = this.questionCarousel;
    return carousel?.navigateToNextQuestion() ?? false;
  }
  focusQuestionCarouselTerminal() {
    const carousel = this.questionCarousel;
    return carousel?.focusTerminal() ?? false;
  }
  // --- Plan Review ---
  renderPlanReview(review, context2, options3) {
    const key3 = review.resolveId ?? `${isResponseVM(context2.element) ? context2.element.requestId : ""}_${context2.contentIndex}`;
    const existing = this._chatPlanReviewWidgets.get(key3);
    if (existing) {
      return existing;
    }
    if (isResponseVM(context2.element)) {
      this._planReviewResponseIds.set(key3, context2.element.requestId);
      this._planReviewSessionResources.set(key3, context2.element.sessionResource);
    }
    const part = this.instantiationService.createInstance(ChatPlanReviewPart, review, context2, options3);
    this._chatPlanReviewWidgets.set(key3, part);
    append(this.chatPlanReviewContainer, part.domNode);
    return part;
  }
  clearPlanReview(responseId, resolveId) {
    if (resolveId !== void 0) {
      const part = this._chatPlanReviewWidgets.get(resolveId);
      if (part) {
        part.domNode.remove();
        this._chatPlanReviewWidgets.deleteAndDispose(resolveId);
      }
      this._planReviewResponseIds.delete(resolveId);
      this._planReviewSessionResources.delete(resolveId);
    } else if (responseId !== void 0) {
      for (const [key3, rid] of this._planReviewResponseIds) {
        if (rid === responseId) {
          const part = this._chatPlanReviewWidgets.get(key3);
          if (part) {
            part.domNode.remove();
            this._chatPlanReviewWidgets.deleteAndDispose(key3);
          }
          this._planReviewResponseIds.delete(key3);
          this._planReviewSessionResources.delete(key3);
        }
      }
    } else {
      this._chatPlanReviewWidgets.clearAndDisposeAll();
      this._planReviewResponseIds.clear();
      this._planReviewSessionResources.clear();
      clearNode(this.chatPlanReviewContainer);
    }
  }
  get planReview() {
    return this._chatPlanReviewWidgets.size > 0 ? this._chatPlanReviewWidgets.values().next().value : void 0;
  }
  // --- Tool Confirmation Carousel ---
  get _currentSessionKey() {
    return this._widget?.viewModel?.model.sessionResource.toString();
  }
  get _currentToolConfirmationCarousel() {
    const key3 = this._currentSessionKey;
    return key3 ? this._chatToolConfirmationCarousels.get(key3) : void 0;
  }
  renderToolConfirmationCarousel(tool, factory, subAgentInvocationId, subagentTitle, revealSubagent, revealSubagentLabel, toolPart) {
    const existing = this._currentToolConfirmationCarousel;
    if (existing) {
      existing.addToolInvocation(tool, subAgentInvocationId, subagentTitle, revealSubagent, revealSubagentLabel, toolPart);
      this.updateToolConfirmationCarouselMaxHeight();
      return existing;
    }
    const key3 = this._currentSessionKey;
    if (!key3) {
      throw new Error("Cannot render tool confirmation carousel without an active session");
    }
    const part = new ChatToolConfirmationCarouselPart(factory, [], revealSubagent, revealSubagentLabel, subAgentInvocationId, subagentTitle);
    part.addToolInvocation(tool, subAgentInvocationId, subagentTitle, revealSubagent, revealSubagentLabel, toolPart);
    this._chatToolConfirmationCarousels.set(key3, part);
    const capturedKey = key3;
    this._register(part.onDidChangeActiveSubagent((id2) => {
      if (this._currentSessionKey === capturedKey) {
        this._onDidChangeActiveConfirmationSubagent.fire(id2);
      }
    }));
    if (this._currentSessionKey === capturedKey) {
      this._onDidChangeActiveConfirmationSubagent.fire(part.activeSubAgentInvocationId);
    }
    append(this.chatToolConfirmationCarouselContainer, part.domNode);
    show(this.chatToolConfirmationCarouselContainer);
    this.updateToolConfirmationCarouselMaxHeight();
    this._register(Event2.once(part.onDidEmpty)(() => {
      this._chatToolConfirmationCarousels.deleteAndDispose(capturedKey);
      if (this._currentSessionKey === capturedKey) {
        this._onDidChangeActiveConfirmationSubagent.fire(void 0);
        clearNode(this.chatToolConfirmationCarouselContainer);
        hide(this.chatToolConfirmationCarouselContainer);
      }
    }));
    return part;
  }
  addToolToConfirmationCarousel(tool, factory, subAgentInvocationId, subagentTitle, revealSubagent, revealSubagentLabel, toolPart) {
    const existing = this._currentToolConfirmationCarousel;
    if (existing) {
      existing.addToolInvocation(tool, subAgentInvocationId, subagentTitle, revealSubagent, revealSubagentLabel, toolPart);
      this.updateToolConfirmationCarouselMaxHeight();
    } else {
      this.renderToolConfirmationCarousel(tool, factory, subAgentInvocationId, subagentTitle, revealSubagent, revealSubagentLabel, toolPart);
    }
  }
  get activeConfirmationSubagentId() {
    return this._currentToolConfirmationCarousel?.activeSubAgentInvocationId;
  }
  /**
   * Navigates the carousel to the first pending tool from the given subagent.
   */
  activateCarouselForSubagent(subAgentInvocationId) {
    this._currentToolConfirmationCarousel?.activateFirstToolForSubagent(subAgentInvocationId);
  }
  hasToolInConfirmationCarousel(toolCallId) {
    return this._currentToolConfirmationCarousel?.hasToolInvocation(toolCallId) ?? false;
  }
  get hasActiveToolConfirmationCarousel() {
    const carousel = this._currentToolConfirmationCarousel;
    return !!carousel && carousel.pendingCount > 0;
  }
  clearToolConfirmationCarousel() {
    const key3 = this._currentSessionKey;
    if (key3) {
      this._chatToolConfirmationCarousels.deleteAndDispose(key3);
    }
    this._onDidChangeActiveConfirmationSubagent.fire(void 0);
    clearNode(this.chatToolConfirmationCarouselContainer);
    hide(this.chatToolConfirmationCarouselContainer);
  }
  /**
   * Swaps the visible tool confirmation carousel when switching sessions.
   */
  _syncToolConfirmationCarouselForSession() {
    clearNode(this.chatToolConfirmationCarouselContainer);
    const carousel = this._currentToolConfirmationCarousel;
    if (carousel && carousel.pendingCount > 0) {
      append(this.chatToolConfirmationCarouselContainer, carousel.domNode);
      show(this.chatToolConfirmationCarouselContainer);
      this.updateToolConfirmationCarouselMaxHeight();
    } else {
      hide(this.chatToolConfirmationCarouselContainer);
    }
    this._onDidChangeActiveConfirmationSubagent.fire(carousel?.activeSubAgentInvocationId);
  }
  setWorkingSetCollapsed(collapsed2) {
    this._workingSetCollapsed.set(collapsed2, void 0);
  }
  renderChatEditingSessionState(chatEditingSession) {
    this.setChatEditingSessionVisible(Boolean(chatEditingSession));
    if (chatEditingSession) {
      if (!isEqual2(chatEditingSession.chatSessionResource, this._lastEditingSessionResource)) {
        this._workingSetCollapsed.set(true, void 0);
      }
      this._lastEditingSessionResource = chatEditingSession.chatSessionResource;
    }
    const modifiedEntries = derivedOpts({ equalsFn: equals }, (r2) => {
      const sessionResource = chatEditingSession?.chatSessionResource ?? this._widget?.viewModel?.model.sessionResource;
      if (sessionResource && getChatSessionType(sessionResource) === AgentSessionProviders.Background) {
        return [];
      }
      return chatEditingSession?.entries.read(r2).filter((entry) => entry.state.read(r2) === 0 /* Modified */) || [];
    });
    const editSessionEntries = derived((reader) => {
      const seenEntries = new ResourceSet();
      const entries2 = [];
      for (const entry of modifiedEntries.read(reader)) {
        if (entry.state.read(reader) !== 0 /* Modified */) {
          continue;
        }
        if (!seenEntries.has(entry.modifiedURI)) {
          seenEntries.add(entry.modifiedURI);
          const linesAdded = entry.linesAdded?.read(reader);
          const linesRemoved = entry.linesRemoved?.read(reader);
          entries2.push({
            reference: entry.modifiedURI,
            state: 0 /* Modified */,
            kind: "reference",
            options: {
              status: void 0,
              diffMeta: { added: linesAdded ?? 0, removed: linesRemoved ?? 0 },
              isDeletion: !!entry.isDeletion,
              originalUri: entry.isDeletion ? entry.originalURI : void 0
            }
          });
        }
      }
      entries2.sort((a, b) => {
        if (a.kind === "reference" && b.kind === "reference") {
          if (a.state === b.state || a.state === void 0 || b.state === void 0) {
            return a.reference.toString().localeCompare(b.reference.toString());
          }
          return a.state - b.state;
        }
        return 0;
      });
      return entries2;
    });
    const sessionFileChanges = observableFromEvent(
      this,
      this.agentSessionsService.model.onDidChangeSessions,
      () => {
        const sessionResource = this._widget?.viewModel?.model?.sessionResource;
        if (!sessionResource) {
          return Iterable.empty();
        }
        const model = this.agentSessionsService.getSession(sessionResource);
        return model?.changes instanceof Array ? model.changes : Iterable.empty();
      }
    );
    const sessionFiles = derived(
      (reader) => sessionFileChanges.read(reader).map((entry) => ({
        reference: isIChatSessionFileChange2(entry) ? entry.modifiedUri ?? entry.uri : entry.modifiedUri,
        state: 1 /* Accepted */,
        kind: "reference",
        options: {
          diffMeta: { added: entry.insertions, removed: entry.deletions },
          isDeletion: entry.modifiedUri === void 0,
          originalUri: entry.originalUri,
          status: void 0
        }
      }))
    );
    const shouldRender = derived((reader) => editSessionEntries.read(reader).length > 0 || sessionFiles.read(reader).length > 0);
    this._renderingChatEdits.value = autorun((reader) => {
      if (this.options.renderWorkingSet && shouldRender.read(reader)) {
        this.renderChatEditingSessionWithEntries(
          reader.store,
          chatEditingSession,
          editSessionEntries,
          sessionFiles
        );
      } else {
        clearNode(this.chatEditingSessionWidgetContainer);
        this._chatEditsDisposables.clear();
        this._chatEditList = void 0;
        this.setChatEditingSessionVisible(false);
      }
    });
  }
  /** Show or hide the working set, and report the same to the stack. */
  setChatEditingSessionVisible(visible) {
    setVisibility(visible, this.chatEditingSessionWidgetContainer);
    setChatInputStackSlot(this.chatEditingSessionWidgetContainer, visible ? 1 /* Docked */ : 0 /* Empty */);
  }
  renderChatEditingSessionWithEntries(store, chatEditingSession, editSessionEntriesObs, sessionEntriesObs) {
    const innerContainer = this.chatEditingSessionWidgetContainer.querySelector(".chat-editing-session-container.show-file-icons") ?? append(this.chatEditingSessionWidgetContainer, $43(".chat-editing-session-container.show-file-icons"));
    const overviewRegion = innerContainer.querySelector(".chat-editing-session-overview") ?? append(innerContainer, $43(".chat-editing-session-overview"));
    const overviewTitle = overviewRegion.querySelector(".working-set-title") ?? append(overviewRegion, $43(".working-set-title"));
    this._chatEditsActionsDisposables.clear();
    const actionsContainer = overviewRegion.querySelector(".chat-editing-session-actions") ?? append(overviewRegion, $43(".chat-editing-session-actions"));
    const sessionResource = chatEditingSession?.chatSessionResource || this._widget?.viewModel?.model.sessionResource;
    const scopedContextKeyService = this._chatEditsActionsDisposables.add(this.contextKeyService.createScoped(actionsContainer));
    if (sessionResource) {
      scopedContextKeyService.createKey(ChatContextKeys.agentSessionType.key, getChatSessionType(sessionResource));
      const sessionPullRequest = observableFromEvent(
        this,
        this.agentSessionsService.model.onDidChangeSessions,
        () => {
          const session = this.agentSessionsService.getSession(sessionResource);
          return session ? getAgentSessionPullRequestContextValue(session) : "";
        }
      );
      this._chatEditsActionsDisposables.add(bindContextKey(ChatContextKeys.agentSessionPullRequest, scopedContextKeyService, (r2) => sessionPullRequest.read(r2)));
    }
    this._chatEditsActionsDisposables.add(bindContextKey(ChatContextKeys.hasAgentSessionChanges, scopedContextKeyService, (r2) => !!sessionEntriesObs.read(r2)?.length));
    const scopedInstantiationService = this._chatEditsActionsDisposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, scopedContextKeyService])));
    const workingSetContainer = innerContainer.querySelector(".chat-editing-session-list") ?? append(innerContainer, $43(".chat-editing-session-list"));
    const button = this._chatEditsActionsDisposables.add(new ButtonWithIcon(overviewTitle, {
      supportIcons: true,
      secondary: true,
      ariaLabel: localize(12494, null)
    }));
    const topLevelStats = derived((reader) => {
      const entries2 = editSessionEntriesObs.read(reader);
      const sessionEntries = sessionEntriesObs.read(reader);
      let added = 0, removed = 0;
      if (entries2.length > 0) {
        for (const entry of entries2) {
          if (entry.kind === "reference" && entry.options?.diffMeta) {
            added += entry.options.diffMeta.added;
            removed += entry.options.diffMeta.removed;
          }
        }
      } else {
        for (const entry of sessionEntries) {
          if (entry.kind === "reference" && entry.options?.diffMeta) {
            added += entry.options.diffMeta.added;
            removed += entry.options.diffMeta.removed;
          }
        }
      }
      const files = entries2.length > 0 ? entries2.length : sessionEntries.length;
      const topLevelIsSessionMenu2 = entries2.length === 0 && sessionEntries.length > 0;
      const shouldShowEditingSession = entries2.length > 0 || sessionEntries.length > 0;
      return { files, added, removed, shouldShowEditingSession, topLevelIsSessionMenu: topLevelIsSessionMenu2 };
    });
    const topLevelIsSessionMenu = topLevelStats.map((t2) => t2.topLevelIsSessionMenu);
    store.add(autorun((reader) => {
      const isSessionMenu = topLevelIsSessionMenu.read(reader);
      reader.store.add(scopedInstantiationService.createInstance(MenuWorkbenchButtonBar, actionsContainer, isSessionMenu ? MenuId.ChatEditingSessionChangesToolbar : MenuId.ChatEditingWidgetToolbar, {
        telemetrySource: this.options.menus.telemetrySource,
        small: true,
        menuOptions: sessionResource ? isSessionMenu ? {
          args: [sessionResource, this.agentSessionsService.getSession(sessionResource)?.metadata]
        } : {
          arg: {
            $mid: 19 /* ChatViewContext */,
            sessionResource
          }
        } : void 0,
        disableWhileRunning: isSessionMenu,
        buttonConfigProvider: (action) => {
          if (action.id === ChatEditingShowChangesAction.ID || action.id === ViewPreviousEditsAction.Id) {
            return { showIcon: true, showLabel: false, isSecondary: true };
          }
          if (action.id === "github.copilot.chat.cloudSessions.openPullRequestForTask") {
            return { showIcon: true, showLabel: false };
          }
          return void 0;
        }
      }));
    }));
    store.add(autorun((reader) => {
      const { files, added, removed, shouldShowEditingSession } = topLevelStats.read(reader);
      const buttonLabel = files === 1 ? localize(12493, null) : localize(12492, null, files);
      button.label = buttonLabel;
      button.element.setAttribute("aria-label", localize(12491, null, buttonLabel, added, removed));
      this._workingSetLinesAddedSpan.value.textContent = `+${added}`;
      this._workingSetLinesRemovedSpan.value.textContent = `-${removed}`;
      this.setChatEditingSessionVisible(shouldShowEditingSession);
    }));
    const countsContainer = $(".working-set-line-counts");
    button.element.appendChild(countsContainer);
    countsContainer.appendChild(this._workingSetLinesAddedSpan.value);
    countsContainer.appendChild(this._workingSetLinesRemovedSpan.value);
    const toggleWorkingSet = () => {
      this._workingSetCollapsed.set(!this._workingSetCollapsed.get(), void 0);
    };
    this._chatEditsActionsDisposables.add(button.onDidClick(toggleWorkingSet));
    this._chatEditsActionsDisposables.add(addDisposableListener(overviewRegion, "click", (e) => {
      if (e.defaultPrevented) {
        return;
      }
      const target = e.target;
      if (target.closest(".monaco-button")) {
        return;
      }
      toggleWorkingSet();
    }));
    this._chatEditsActionsDisposables.add(autorun((reader) => {
      const collapsed2 = this._workingSetCollapsed.read(reader);
      button.icon = collapsed2 ? Codicon.chevronRight : Codicon.chevronDown;
      workingSetContainer.classList.toggle("collapsed", collapsed2);
    }));
    if (!this._chatEditList) {
      this._chatEditList = this._chatEditsListPool.get();
      const list2 = this._chatEditList.object;
      this._chatEditsDisposables.add(this._chatEditList);
      this._chatEditsDisposables.add(list2.onDidFocus(() => {
        this._onDidFocus.fire();
      }));
      this._chatEditsDisposables.add(list2.onDidOpen(async (e) => {
        if (e.element?.kind === "reference" && URI.isUri(e.element.reference)) {
          const modifiedFileUri = e.element.reference;
          const originalUri = e.element.options?.originalUri;
          if (e.element.options?.isDeletion && originalUri) {
            await this.editorService.openEditor({
              resource: originalUri,
              // instead of modified, because modified will not exist
              options: e.editorOptions
            }, e.sideBySide ? SIDE_GROUP : ACTIVE_GROUP);
            return;
          }
          if (originalUri) {
            await this.editorService.openEditor({
              original: { resource: originalUri },
              modified: { resource: modifiedFileUri },
              options: e.editorOptions
            }, e.sideBySide ? SIDE_GROUP : ACTIVE_GROUP);
            return;
          }
          const entry = chatEditingSession?.getEntry(modifiedFileUri);
          const pane = await this.editorService.openEditor({
            resource: modifiedFileUri,
            options: e.editorOptions
          }, e.sideBySide ? SIDE_GROUP : ACTIVE_GROUP);
          if (pane) {
            entry?.getEditorIntegration(pane).reveal(true, e.editorOptions.preserveFocus);
          }
        }
      }));
      this._chatEditsDisposables.add(addDisposableListener(list2.getHTMLElement(), "click", (e) => {
        if (!this.hasFocus()) {
          this._onDidFocus.fire();
        }
      }, true));
      append(workingSetContainer, list2.getHTMLElement());
      append(innerContainer, workingSetContainer);
    }
    store.add(autorun((reader) => {
      const editEntries = editSessionEntriesObs.read(reader);
      const sessionFileEntries = sessionEntriesObs.read(reader);
      const allEntries = editEntries.concat(sessionFileEntries);
      const maxItemsShown = 6;
      const itemsShown = Math.min(allEntries.length, maxItemsShown);
      const height = itemsShown * 22;
      const list2 = this._chatEditList.object;
      list2.layout(height);
      list2.getHTMLElement().style.height = `${height}px`;
      list2.splice(0, list2.length, allEntries);
      workingSetContainer.classList.toggle("overflowing", allEntries.length > maxItemsShown);
    }));
  }
  async renderFollowups(items, response) {
    if (!this.options.renderFollowups) {
      return;
    }
    this.followupsDisposables.clear();
    clearNode(this.followupsContainer);
    if (items && items.length > 0) {
      this.followupsDisposables.add(this.instantiationService.createInstance(ChatFollowups, this.followupsContainer, items, this.location, void 0, (followup) => this._onDidAcceptFollowup.fire({ followup, response })));
    }
  }
  /**
   * Sets the maximum height budget for the input part. The editor height will be
   * clamped so it does not grow beyond what this budget allows after accounting
   * for non-editor chrome such as attachments, toolbars, and widgets.
   */
  setMaxHeight(maxHeight) {
    this._maxHeight = maxHeight;
    this.updateToolConfirmationCarouselMaxHeight();
  }
  updateToolConfirmationCarouselMaxHeight() {
    const carousel = this._currentToolConfirmationCarousel;
    if (!carousel) {
      return;
    }
    if (this._maxHeight === void 0) {
      carousel.setMaxHeight(void 0);
      return;
    }
    const carouselHeight = this.chatToolConfirmationCarouselContainer.offsetHeight;
    const otherInputHeight = Math.max(0, this.container.offsetHeight - carouselHeight);
    carousel.setMaxHeight(this._maxHeight - otherInputHeight);
  }
  /**
   * Layout the input part with the given width. Height is intrinsic - determined by content
   * and detected via ResizeObserver, which updates `inputPartHeight` for the parent to observe.
   */
  layout(width2) {
    this.cachedWidth = width2;
    this._updateWorkingProgressAnimationDuration(width2);
    const result = this._layout(width2);
    this._inputPickerResponsiveLayout?.layout();
    this._secondaryPickerResponsiveLayout?.layout();
    return result;
  }
  layoutForToolbarChange() {
    if (typeof this.cachedWidth === "number") {
      this._layout(this.cachedWidth, true, true);
    }
  }
  _updateWorkingProgressAnimationDuration(width2) {
    if (!this.inputContainer) {
      return;
    }
    const MIN_DURATION_S = 1.4;
    const MAX_DURATION_S = 2.5;
    const safeWidth = Math.max(50, width2);
    const raw = 0.55 + 0.075 * Math.sqrt(safeWidth);
    const duration = Math.min(MAX_DURATION_S, Math.max(MIN_DURATION_S, raw));
    if (this._lastAnimDurationS !== void 0 && Math.abs(this._lastAnimDurationS - duration) < 0.05) {
      return;
    }
    this._lastAnimDurationS = duration;
    this.inputContainer.style.setProperty("--chat-input-anim-duration", `${duration.toFixed(2)}s`);
    if (this.inputContainer.classList.contains("working")) {
      const inputContainer = this.inputContainer;
      inputContainer.classList.add("chat-input-anim-restart");
      scheduleAtNextAnimationFrame(getWindow(inputContainer), () => {
        inputContainer.classList.remove("chat-input-anim-restart");
      });
    }
  }
  get _effectiveInputEditorMaxHeight() {
    if (this._maxHeight === void 0) {
      return this.inputEditorMaxHeight;
    }
    const currentEditorHeight = this.previousInputEditorDimension?.height ?? 0;
    const nonEditorHeight = Math.max(0, this.height.get() - currentEditorHeight);
    const budgetForEditor = this._maxHeight - nonEditorHeight;
    const minEditorHeight = this.inputEditorMinHeight ?? this.singleLineInputEditorHeight;
    return Math.max(minEditorHeight, Math.min(this.inputEditorMaxHeight, Math.max(0, budgetForEditor)));
  }
  _layout(width2, allowRecurse = true, preserveInputEditorHeight = false) {
    const data = this.getLayoutData();
    const followupsWidth = width2 - data.inputPartHorizontalPadding;
    this.followupsContainer.style.width = `${followupsWidth}px`;
    const initialEditorScrollWidth = this._inputEditor.getScrollWidth();
    const newEditorWidth = width2 - data.inputPartHorizontalPadding - data.editorBorder - data.inputPartHorizontalPaddingInside - data.toolbarsWidth - data.sideToolbarWidth;
    const effectiveMaxHeight = this._effectiveInputEditorMaxHeight;
    const contentHeight = preserveInputEditorHeight && this.previousInputEditorDimension ? this.previousInputEditorDimension.height : this._inputEditor.getContentHeight();
    const clampedContentHeight = Math.min(contentHeight, effectiveMaxHeight);
    const inputEditorHeight = this.inputEditorMinHeight ? Math.min(Math.max(this.inputEditorMinHeight, clampedContentHeight), effectiveMaxHeight) : clampedContentHeight;
    const newDimension = { width: newEditorWidth, height: inputEditorHeight };
    if (!this.previousInputEditorDimension || (this.previousInputEditorDimension.width !== newDimension.width || this.previousInputEditorDimension.height !== newDimension.height)) {
      this.ignoreInputEditorContentSizeChanges = preserveInputEditorHeight;
      try {
        this._inputEditor.layout(newDimension);
      } finally {
        this.ignoreInputEditorContentSizeChanges = false;
      }
      this.previousInputEditorDimension = newDimension;
    }
    if (allowRecurse && initialEditorScrollWidth < 10) {
      return this._layout(width2, false, preserveInputEditorHeight);
    }
  }
  getLayoutData() {
    const inputSideToolbarWidth = this.inputSideToolbarContainer ? getTotalWidth(this.inputSideToolbarContainer) : 0;
    const getToolbarsWidthCompact = () => {
      const toolbarItemGap = 4;
      const executeToolbarWidth = this.cachedExecuteToolbarWidth = this.executeToolbar.getItemsWidth();
      const inputToolbarWidth = this.cachedInputToolbarWidth = this.inputActionsToolbar.getItemsWidth();
      const executeToolbarPadding = (this.executeToolbar.getItemsLength() - 1) * toolbarItemGap;
      const inputToolbarPadding = this.inputActionsToolbar.getItemsLength() ? (this.inputActionsToolbar.getItemsLength() - 1) * toolbarItemGap : 0;
      const contextUsageWidth = getTotalWidth(this.contextUsageWidgetContainer);
      const inputToolbarsPadding = 12;
      return executeToolbarWidth + executeToolbarPadding + contextUsageWidth + (this.options.renderInputToolbarBelowInput ? 0 : inputToolbarWidth + inputToolbarPadding + inputToolbarsPadding);
    };
    return {
      editorBorder: 2,
      // The sessions window pads `.interactive-input-part` by 32px on each side
      // (vs the default 12px margin) so the input box aligns with the chat
      // content cards. The editor width is computed here, so it must account
      // for the same 64px total horizontal gutter or the editor overflows its
      // container and renders wider than the message content above it.
      inputPartHorizontalPadding: this.options.inputPartHorizontalPadding ?? (this.options.renderStyle === "compact" ? 16 : this.options.isSessionsWindow ? 64 : 24),
      inputPartHorizontalPaddingInside: this.options.renderStyle === "compact" ? 12 : 10,
      toolbarsWidth: this.options.renderStyle === "compact" ? getToolbarsWidthCompact() : 0,
      sideToolbarWidth: inputSideToolbarWidth > 0 ? inputSideToolbarWidth + 4 : 0
    };
  }
  /**
   * Gets the location of the chat widget and whether that location is maximized.
   */
  getWidgetLocationInfo(widget) {
    if (isIChatResourceViewContext(widget.viewContext)) {
      return { location: "editor" /* Editor */, isMaximized: false };
    }
    if (isIChatViewViewContext(widget.viewContext)) {
      const viewLocation = this.viewDescriptorService.getViewLocationById(widget.viewContext.viewId);
      const sideBarPosition = this.layoutService.getSideBarPosition();
      switch (viewLocation) {
        case 1 /* Panel */:
          return {
            location: "panel" /* Panel */,
            isMaximized: this.layoutService.isPanelMaximized()
          };
        case 2 /* AuxiliaryBar */:
          return {
            location: sideBarPosition === 0 /* LEFT */ ? "sidebarRight" /* SidebarRight */ : "sidebarLeft" /* SidebarLeft */,
            isMaximized: this.layoutService.isAuxiliaryBarMaximized()
          };
        case 0 /* Sidebar */:
        default:
          return {
            location: sideBarPosition === 0 /* LEFT */ ? "sidebarLeft" /* SidebarLeft */ : "sidebarRight" /* SidebarRight */,
            isMaximized: false
          };
      }
    }
    return { location: "editor" /* Editor */, isMaximized: false };
  }
  getDefaultScrollbarOptions() {
    const scrollbar = this._inputEditor.getRawOptions().scrollbar ?? {};
    return this.options.renderStyle === "compact" ? { ...scrollbar, vertical: "hidden" } : { ...scrollbar, vertical: "auto", verticalScrollbarSize: 7 };
  }
  getVisibleScrollbarOptions() {
    const scrollbar = this._inputEditor.getRawOptions().scrollbar ?? {};
    return this.options.renderStyle === "compact" ? { ...scrollbar, vertical: "hidden" } : { ...scrollbar, vertical: "visible", verticalScrollbarSize: 7 };
  }
  updateInputEditorScrollbarOptions() {
    this._inputEditor.updateOptions({
      scrollbar: this._forceVisibleScrollbarUntilAccept ? this.getVisibleScrollbarOptions() : this.getDefaultScrollbarOptions()
    });
  }
  showScrollbarUntilAccept() {
    this._forceVisibleScrollbarUntilAccept = true;
    this.updateInputEditorScrollbarOptions();
  }
  resetScrollbarVisibilityAfterAccept() {
    if (!this._forceVisibleScrollbarUntilAccept) {
      return;
    }
    this._forceVisibleScrollbarUntilAccept = false;
    this.updateInputEditorScrollbarOptions();
  }
};

ChatInputPart = __decorateClass([
  __decorateParam(4, IModelService),
  __decorateParam(5, IInstantiationService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IKeybindingService),
  __decorateParam(9, IAccessibilityService),
  __decorateParam(10, ILanguageModelsService),
  __decorateParam(11, ILogService),
  __decorateParam(12, IFileService),
  __decorateParam(13, IEditorService),
  __decorateParam(14, IThemeService),
  __decorateParam(15, ITextModelService),
  __decorateParam(16, IStorageService),
  __decorateParam(17, IDialogService),
  __decorateParam(18, IChatAgentService),
  __decorateParam(19, ISharedWebContentExtractorService),
  __decorateParam(20, IChatEntitlementService),
  __decorateParam(21, IChatModeService),
  __decorateParam(22, ILanguageModelToolsService),
  __decorateParam(23, IChatSessionsService),
  __decorateParam(24, IChatContextService),
  __decorateParam(25, IAgentSessionsService),
  __decorateParam(26, IChatSpeechToTextService),
  __decorateParam(27, IDictationOnboardingService),
  __decorateParam(28, IChatInputNoticeHubService),
  __decorateParam(29, IWorkspaceContextService),
  __decorateParam(30, ISCMService),
  __decorateParam(31, IWorkbenchLayoutService),
  __decorateParam(32, IViewDescriptorService),
  __decorateParam(33, IChatAttachmentWidgetRegistry),
  __decorateParam(34, IChatInputNotificationService),
  __decorateParam(35, IChatPhoneInputPresenter),
  __decorateParam(36, IProductService),
  __decorateParam(37, IVoiceModeOnboardingService),
  __decorateParam(38, IChatWidgetService),
  __decorateParam(39, IVoiceSessionController),
  __decorateParam(40, IChatService),
  __decorateParam(41, IWorkbenchEnvironmentService),
  __decorateParam(42, IChatPetService),
  __decorateParam(43, IActionViewItemService)
], ChatInputPart);

function getLastPosition(model) {
  return { lineNumber: model.getLineCount(), column: model.getLineLength(model.getLineCount()) + 1 };
}

var chatInputEditorContainerSelector = ".interactive-input-editor";

setupSimpleEditorSelectionStyling(chatInputEditorContainerSelector);

var ChatSessionPickersContainerActionItem = class extends ActionViewItem {
  constructor(action, widgets2, options3) {
    super(null, action, options3 ?? {});
    this.widgets = widgets2;
  }
  render(container3) {
    container3.classList.add("chat-sessionPicker-container");
    for (const widget of this.widgets) {
      const itemContainer = $(".action-item.chat-sessionPicker-item");
      widget.render(itemContainer);
      container3.appendChild(itemContainer);
    }
  }
  show() {
    this.widgets[0]?.show();
  }
  dispose() {
    for (const widget of this.widgets) {
      widget.dispose();
    }
    super.dispose();
  }
};

var HiddenActionViewItem = class extends BaseActionViewItem {
  constructor(action) {
    super(void 0, action);
  }
  render(container3) {
    super.render(container3);
    container3.style.display = "none";
  }
};
export { getToolbarPickerResponsiveItems, isShowableActionViewItem, createOverflowAction, getInputStateStorageKey, createEmptyInputStateMemento, getLastPosition, $43, INPUT_EDITOR_MAX_HEIGHT, INPUT_EDITOR_LINE_HEIGHT, INPUT_EDITOR_PADDING, CachedLanguageModelsKey, LEGACY_SHARED_INPUT_STATE_TAGS, emptyInputAttachments, ChatInputPart, chatInputEditorContainerSelector, ChatSessionPickersContainerActionItem, HiddenActionViewItem };
