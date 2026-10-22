// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/newChatInput.ts
import { $, EventHelper, EventType, addDisposableListener, append, clearNode, getWindow, isHTMLElement, scheduleAtNextAnimationFrame, trackFocus } from "./module-0075.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { localize } from "./module-0001.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { AGENTS_VOICE_ENABLED } from "./module-1343.mjs";
import { IChatRequestVariableEntry, isExplicitFileOrImageVariableEntry, toFileVariableEntry, toPasteVariableEntry } from "./module-0980.mjs";
import { MenuEntryActionViewItem } from "./module-0516.mjs";
import { Disposable, DisposableStore, MutableDisposable, thenRegisterOrDispose, toDisposable } from "./module-0012.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { URI } from "./module-0032.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IChatStatusItemService } from "./module-1457.mjs";
import { IHoverService } from "./module-0520.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ChatInputNoticeHost } from "./module-1467.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { INewChatModelPickerService, NewChatModelPickerService } from "./module-3540.mjs";
import { observableValue } from "./module-0048.mjs";
import { ISessionModelSelection, SessionModelSelection } from "./module-3539.mjs";
import { derived } from "./module-0054.mjs";
import { hasSendableModelSelection } from "./module-3538.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { ISessionContext, SessionContext } from "./module-3499.mjs";
import { ChatHistoryNavigator } from "./module-1470.mjs";
import { autorun } from "./module-0052.mjs";
import { AGENT_SESSIONS_SCOPED_INPUT_HISTORY_SETTING } from "./module-3577.mjs";
import { NewChatContextAttachments } from "./module-3568.mjs";
import { MobileSessionTypePicker } from "./module-3570.mjs";
import { chatInputStackClass, chatInputStackSlotClass, refreshChatInputStack, setChatInputStackSlot } from "./module-2033.mjs";
import { ChatInputNotificationWidget } from "./module-2148.mjs";
import { registerChatInputOnboardingHosts } from "./module-2149.mjs";
import { NewSessionPromptOptionsWidget } from "./module-3581.mjs";
import { NEW_SESSION_PROMPT_TYPING_DURATION_MS } from "./module-3561.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { status } from "./module-0076.mjs";
import { ChatDragAndDrop } from "./module-2142.mjs";
import { inactiveSessionViewBackground, inactiveSessionViewForeground } from "./module-1496.mjs";
import { EDITOR_DRAG_AND_DROP_BACKGROUND } from "./module-0868.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { constObservable } from "./module-0061.mjs";
import { getChatPetStackPlatformTop } from "./module-2145.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { Menus } from "./module-3437.mjs";
import { installMobileChipLaneScroll } from "./module-3571.mjs";
import { MenuId, MenuItemAction } from "./module-0092.mjs";
import { ChatInputPickerResponsiveLayout } from "./module-2150.mjs";
import { getChatSessionType } from "./module-0962.mjs";
import { handleTerminalCommandPaste, isTerminalCommandInput } from "./module-2130.mjs";
import { registerAndCreateHistoryNavigationContext } from "./module-0603.mjs";
import { Schemas } from "./module-0033.mjs";
import { getSimpleEditorOptions } from "./module-1813.mjs";
import { EditorOptions } from "./module-0105.mjs";
import { EditorExtensionsRegistry } from "./module-0097.mjs";
import { ContextMenuController } from "./module-0664.mjs";
import { SuggestController } from "./module-0758.mjs";
import { SnippetController2 } from "./module-0714.mjs";
import { PlaceholderTextContribution } from "./module-0832.mjs";
import { CopyPasteController } from "./module-0555.mjs";
import { CodeEditorWidget } from "./module-0441.mjs";
import { PromptTemplatePlaceholderController } from "./module-3580.mjs";
import { SlashCommandHandler } from "./module-3572.mjs";
import { VariableCompletionHandler } from "./module-3573.mjs";
import { SessionReferenceCompletionHandler } from "./module-3575.mjs";
import { AgentHostInputCompletionHandler } from "./module-3576.mjs";
import { NewChatInputPasteTarget } from "./module-3578.mjs";
import { EDITOR_FONT_DEFAULTS } from "./module-0101.mjs";
import { renderIcon } from "./module-0467.mjs";
import { Codicon } from "./module-0085.mjs";
import { ModelPicker, ModelPickerActionViewItem } from "./module-3543.mjs";
import { INewChatVoiceTargetService, NEW_CHAT_VOICE_SENTINEL, NewChatVoiceController, isNewChatVoiceSessionActive } from "./module-2894.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { isDictationActiveForEditor, notifyDictationSubmitted, onDidChangeDictationEditor } from "./module-1348.mjs";
import { toAction } from "./module-0082.mjs";
import { ChatVoiceInputModeAction, VoiceInputModeActionViewItem } from "./module-2078.mjs";
import { DictationDownloadRing, getDictationDownloadHoverMarkdown, getDictationPreparingLabel } from "./module-2073.mjs";
import { getDictationHoverMarkdown } from "./module-2074.mjs";
import { setupDictationMicGlow } from "./module-2072.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { addMicButtonContextMenuListener, getDictationContextMenuActions } from "./module-2075.mjs";
import { runDictationShortcut } from "./module-2079.mjs";
import { parse2, stringify } from "./module-0265.mjs";
import { animatePromptTyping } from "./module-3579.mjs";
import { combineVoiceInput } from "./module-2735.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IModelService } from "./module-0080.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IChatPasteTargetService } from "./module-0982.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILogService } from "./module-0095.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { IChatSessionsService } from "./module-0961.mjs";
import { IChatSpeechToTextService } from "./module-1347.mjs";
import { IDictationOnboardingService } from "./module-2037.mjs";
import { IChatInputNoticeHubService } from "./module-1468.mjs";
import { IChatSubmitRequestHandlerService } from "./module-2367.mjs";
import { IVoiceSessionController } from "./module-2070.mjs";
import { IVoiceInputModeService } from "./module-2076.mjs";
import { IVoiceModeOnboardingService } from "./module-2038.mjs";
import { IChatPetWidgetService } from "./module-2368.mjs";
import { IChatInputNotificationService } from "./module-1460.mjs";
import { ILanguageModelsService } from "./module-0968.mjs";


// src/vs/sessions/contrib/chat/browser/newChatInput.ts
var OPEN_OTEL_SETTINGS_COMMAND = "github.copilot.chat.otel.openSettings";

var OTEL_STATUS_COMMAND = "github.copilot.chat.otel.statusActive";

var OTEL_STATUS_ENTRY_ID = "copilot.otelStatus";

var OTEL_DOCS_URL = "https://code.visualstudio.com/docs/agents/guides/monitoring-agents";

var STORAGE_KEY_DRAFT_STATE = "sessions.draftState";

var MIN_EDITOR_HEIGHT2 = 50;

var MAX_EDITOR_HEIGHT2 = 200;

var NEW_CHAT_INPUT_FONT_FAMILY = "system-ui, -apple-system, sans-serif";

function getLabeledPickerResponsiveItems(container2) {
  const elements = /* @__PURE__ */ new Map();
  const actionItemLabelCounts = /* @__PURE__ */ new Map();
  const visit2 = (element, pickerSlot, actionItem) => {
    const currentPickerSlot = element.classList.contains("sessions-chat-picker-slot") ? element : pickerSlot;
    const currentActionItem = element.classList.contains("action-item") ? element : actionItem;
    if (element.classList.contains("sessions-chat-dropdown-label")) {
      const pickerElement = currentPickerSlot ?? currentActionItem;
      if (pickerElement) {
        elements.set(pickerElement, currentActionItem);
        if (currentActionItem) {
          actionItemLabelCounts.set(currentActionItem, (actionItemLabelCounts.get(currentActionItem) ?? 0) + 1);
        }
      }
    }
    for (const child of element.children) {
      if (isHTMLElement(child)) {
        visit2(child, currentPickerSlot, currentActionItem);
      }
    }
  };
  visit2(container2, void 0, void 0);
  return Array.from(elements, ([element, actionItem]) => ({
    element,
    isCompact: () => element.classList.contains("compact-picker"),
    setCompact: (compact2) => {
      element.classList.toggle("compact-picker", compact2);
      if (actionItem && actionItem !== element && actionItemLabelCounts.get(actionItem) === 1) {
        actionItem.classList.toggle("compact-picker", compact2);
      }
    }
  }));
}

var SessionsChatInputHasDictationFocus = new RawContextKey("sessionsChatInputHasDictationFocus", false, localize(4462, null));

var TOGGLE_DICTATION_COMMAND_ID2 = "sessions.action.chat.toggleDictation";

var activeDictationComposer;

KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: TOGGLE_DICTATION_COMMAND_ID2,
  weight: 200 /* WorkbenchContrib */ + 1,
  when: ContextKeyExpr.and(
    SessionsChatInputHasDictationFocus,
    ContextKeyExpr.has(ChatContextKeys.speechToTextConfigured.key)
  ),
  primary: 2048 /* CtrlCmd */ | 39 /* KeyI */,
  handler: () => activeDictationComposer?.toggleDictation()
});

KeybindingsRegistry.registerKeybindingRule({
  id: "agentsVoice.startVoiceInChat",
  weight: 200 /* WorkbenchContrib */ + 1,
  when: ContextKeyExpr.and(
    SessionsChatInputHasDictationFocus,
    AGENTS_VOICE_ENABLED
  ),
  primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 10 /* Space */
});

function hasSendableNewChatContent(query, attachments, hasAdditionalSendContent = false) {
  return !!query.trim() || attachments.some(isExplicitFileOrImageVariableEntry) || hasAdditionalSendContent;
}

var NewChatInputStatusActionViewItem = class extends MenuEntryActionViewItem {
  constructor(action, options3, keybindingService, notificationService, contextKeyService, themeService, contextMenuService, accessibilityService, chatStatusItemService, hoverService, commandService) {
    super(action, options3, keybindingService, notificationService, contextKeyService, themeService, contextMenuService, accessibilityService);
    this.chatStatusItemService = chatStatusItemService;
    this.hoverService = hoverService;
    this.commandService = commandService;
    this.hoverContentDisposables = this._register(new MutableDisposable());
  }
  render(container2) {
    super.render(container2);
    if (this._commandAction.id !== OTEL_STATUS_COMMAND) {
      return;
    }
    this._register(this.chatStatusItemService.onDidChange((e4) => {
      if (e4.entry.id === OTEL_STATUS_ENTRY_ID) {
        this.updateTooltip();
      }
    }));
  }
  async onClick(event) {
    if (this._commandAction.id === OTEL_STATUS_COMMAND && this.element) {
      event.preventDefault();
      event.stopPropagation();
      this.hoverService.showManagedHover(this.element);
      return;
    }
    await super.onClick(event);
  }
  getHoverContents() {
    if (this._commandAction.id === OTEL_STATUS_COMMAND) {
      return { element: () => this._renderStatusHover() };
    }
    return super.getHoverContents();
  }
  getTooltip() {
    if (this._commandAction.id === OTEL_STATUS_COMMAND) {
      const tooltip = this._getStatusEntryTooltip();
      if (tooltip) {
        return tooltip;
      }
    }
    return super.getTooltip();
  }
  _getStatusEntryTooltip() {
    for (const entry of this.chatStatusItemService.getEntries()) {
      if (entry.id === OTEL_STATUS_ENTRY_ID) {
        return entry.tooltip;
      }
    }
    return void 0;
  }
  _renderStatusHover() {
    const store = new DisposableStore();
    this.hoverContentDisposables.value = store;
    const root = $(".new-chat-input-status-hover");
    root.appendChild($(".new-chat-input-status-hover-title", void 0, localize(4442, null)));
    root.appendChild($(".new-chat-input-status-hover-detail", void 0, this._getStatusEntryTooltip() ?? super.getTooltip()));
    const actions = root.appendChild($(".new-chat-input-status-hover-actions"));
    const learnMoreButton = store.add(new Button(actions, { ...defaultButtonStyles, secondary: true }));
    learnMoreButton.label = localize(4440, null);
    store.add(learnMoreButton.onDidClick(() => {
      void this.commandService.executeCommand("vscode.open", URI.parse(OTEL_DOCS_URL));
      this.hoverService.hideHover(true);
    }));
    const manageButton = store.add(new Button(actions, { ...defaultButtonStyles, secondary: true }));
    manageButton.label = localize(4441, null);
    store.add(manageButton.onDidClick(() => {
      void this.commandService.executeCommand(OPEN_OTEL_SETTINGS_COMMAND);
      this.hoverService.hideHover(true);
    }));
    return root;
  }
};

NewChatInputStatusActionViewItem = __decorateClass([
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IThemeService),
  __decorateParam(6, IContextMenuService),
  __decorateParam(7, IAccessibilityService),
  __decorateParam(8, IChatStatusItemService),
  __decorateParam(9, IHoverService),
  __decorateParam(10, ICommandService)
], NewChatInputStatusActionViewItem);

var RANDOM_PLACEHOLDERS = [
  localize(4451, null),
  localize(4460, null),
  localize(4448, null),
  localize(4457, null),
  localize(4452, null),
  localize(4450, null),
  localize(4456, null),
  localize(4458, null),
  localize(4453, null),
  localize(4447, null),
  localize(4454, null),
  localize(4455, null),
  localize(4461, null),
  localize(4459, null),
  localize(4449, null)
];

var lastPlaceholderIndex = -1;

function getRandomChatInputPlaceholder() {
  let index2 = Math.floor(Math.random() * RANDOM_PLACEHOLDERS.length);
  if (index2 === lastPlaceholderIndex) {
    index2 = (index2 + 1) % RANDOM_PLACEHOLDERS.length;
  }
  lastPlaceholderIndex = index2;
  return RANDOM_PLACEHOLDERS[index2];
}

var NewChatInputWidget = class extends Disposable {
  constructor(options3, instantiationService, modelService, textModelService, chatPasteTargetService, configurationService, contextKeyService, logService, hoverService, storageService, dialogService, keybindingService, layoutService, chatSessionsService, chatSpeechToTextService, dictationOnboardingService, chatInputNoticeHubService, chatSubmitRequestHandlerService, contextMenuService, commandService, voiceSessionController, voiceInputModeService, accessibilityService, voiceModeOnboardingService, newChatVoiceTargetService, themeService, chatPetWidgetService, chatInputNotificationService, languageModelsService) {
    super();
    this.options = options3;
    this.instantiationService = instantiationService;
    this.modelService = modelService;
    this.textModelService = textModelService;
    this.chatPasteTargetService = chatPasteTargetService;
    this.configurationService = configurationService;
    this.contextKeyService = contextKeyService;
    this.logService = logService;
    this.hoverService = hoverService;
    this.storageService = storageService;
    this.dialogService = dialogService;
    this.keybindingService = keybindingService;
    this.layoutService = layoutService;
    this.chatSessionsService = chatSessionsService;
    this.chatSpeechToTextService = chatSpeechToTextService;
    this.dictationOnboardingService = dictationOnboardingService;
    this.chatInputNoticeHubService = chatInputNoticeHubService;
    this.chatSubmitRequestHandlerService = chatSubmitRequestHandlerService;
    this.contextMenuService = contextMenuService;
    this.commandService = commandService;
    this.voiceSessionController = voiceSessionController;
    this.voiceInputModeService = voiceInputModeService;
    this.accessibilityService = accessibilityService;
    this.voiceModeOnboardingService = voiceModeOnboardingService;
    this.newChatVoiceTargetService = newChatVoiceTargetService;
    this.themeService = themeService;
    this.chatPetWidgetService = chatPetWidgetService;
    this.chatInputNotificationService = chatInputNotificationService;
    this.languageModelsService = languageModelsService;
    /** Arbitrates which notice occupies the area above this input. */
    this.noticeHost = this._register(new ChatInputNoticeHost(() => this.focus()));
    // IHistoryNavigationWidget
    this._onDidFocus = this._register(new Emitter());
    this.onDidFocus = this._onDidFocus.event;
    this._onDidBlur = this._register(new Emitter());
    this.onDidBlur = this._onDidBlur.event;
    this._promptTemplatePlaceholder = this._register(new MutableDisposable());
    this._promptOptionsWidget = this._register(new MutableDisposable());
    this._promptOptionsRefresh = this._register(new MutableDisposable());
    this._promptOptionsDismissed = false;
    this._sending = false;
    this._loadingDelayDisposable = this._register(new MutableDisposable());
    this._promptTypingAnimation = this._register(new MutableDisposable());
    this._newChatModelPickerService = new NewChatModelPickerService();
    this._compactModelPicker = observableValue(this, false);
    // Input state
    this._draftState = {
      inputText: "",
      attachments: []
    };
    this._modelSelection = this._register(this.instantiationService.createInstance(SessionModelSelection, this.options.session));
    this._canSendRequest = derived(this, (reader) => {
      if (this.options.canSubmitWithoutSession?.read(reader)) {
        return true;
      }
      const modelSelection = this._modelSelection.state.read(reader);
      return this.options.canSendRequest.read(reader) && hasSendableModelSelection(modelSelection);
    });
    this._scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection(
      [INewChatModelPickerService, this._newChatModelPickerService],
      [ISessionContext, new SessionContext(this.options.session)],
      [ISessionModelSelection, this._modelSelection]
    )));
    this._history = this._register(this.instantiationService.createInstance(ChatHistoryNavigator, "panel" /* Chat */));
    if (this.options.historyKey) {
      this._register(autorun((reader) => this._setHistoryKey(this.options.historyKey?.read(reader))));
      this._register(this.configurationService.onDidChangeConfiguration((e4) => {
        if (e4.affectsConfiguration(AGENT_SESSIONS_SCOPED_INPUT_HISTORY_SETTING)) {
          this._setHistoryKey(this.options.historyKey?.get());
        }
      }));
    }
    this._register(this.storageService.onWillSaveState(() => this.saveState()));
    this._contextAttachments = this._register(this.instantiationService.createInstance(NewChatContextAttachments));
    this.sessionTypePicker = this._register(this.instantiationService.createInstance(MobileSessionTypePicker, this.options.session, this.options.sessionTypePickerOptions));
    this._register(this._contextAttachments.onDidChangeContext(() => {
      this._updateAndSaveDraftState();
      this._updateSendButtonState();
      this.focus();
    }));
    this._register(autorun((reader) => {
      this._canSendRequest.read(reader);
      this.options.hasAdditionalSendContent?.read(reader);
      const isLoading = this.options.loading.read(reader);
      this._loadingSpinner?.classList.toggle("visible", isLoading);
      this._updateSendButtonState();
    }));
  }
  /** The canonical notice slot, directly above this input. */
  get gettingStartedTipContainerElement() {
    return this._gettingStartedTipContainer;
  }
  /** Notice slot for the composer's host, so its content docks inside this stack. */
  get hostNoticeContainerElement() {
    return this._hostNoticeContainer;
  }
  get element() {
    return this._editorContainer;
  }
  /** The underlying input editor. Exposed for component fixtures. */
  get inputEditor() {
    return this._editor;
  }
  /** The current model-selection state. Exposed so host widgets can react to model changes. */
  get selectedModelState() {
    return this._modelSelection.state;
  }
  get workspacePreselectionSource() {
    return this.options.getWorkspacePreselectionSource?.();
  }
  /** Opens the model picker dropdown. */
  openModelPicker() {
    this._newChatModelPickerService.openModelPicker();
  }
  /** Moves the provider-contributed session controls into the given container. */
  renderSessionControls(container2) {
    if (!this._sessionControlsContainer) {
      throw new Error("NewChatInputWidget must be rendered before its session controls.");
    }
    container2.appendChild(this._sessionControlsContainer);
  }
  _setHistoryKey(historyKey) {
    this._history.setHistoryKey(this.configurationService.getValue(AGENT_SESSIONS_SCOPED_INPUT_HISTORY_SETTING) !== false ? historyKey : void 0);
  }
  // --- Rendering ---
  render(parent, root) {
    const chatInputContainer = append(parent, $(`.new-chat-input-container.${chatInputStackClass}`));
    const editorOverflowWidgetsDomNode = this.layoutService.getContainer(getWindow(root)).appendChild($(".sessions-chat-editor-overflow.monaco-editor"));
    editorOverflowWidgetsDomNode.classList.add("hideSuggestTextIcons");
    this._register(toDisposable(() => editorOverflowWidgetsDomNode.remove()));
    this._register(this.chatInputNoticeHubService.registerHost(this.noticeHost, chatInputContainer));
    const composerFocusKey = ChatContextKeys.inChatComposer.bindTo(this._register(this.contextKeyService.createScoped(chatInputContainer)));
    const composerFocusTracker = this._register(trackFocus(chatInputContainer));
    this._register(composerFocusTracker.onDidFocus(() => composerFocusKey.set(true)));
    this._register(composerFocusTracker.onDidBlur(() => composerFocusKey.set(false)));
    const notificationContainer = append(chatInputContainer, $(`.chat-input-notification-container.${chatInputStackSlotClass}`));
    const notificationWidget = this._register(this.instantiationService.createInstance(
      ChatInputNotificationWidget,
      {
        modelTargetChatSessionType: this.sessionTypePicker.modelTargetChatSessionType,
        sessionResource: derived(this, (reader) => this.options.session.read(reader)?.activeChat.read(reader).resource),
        deferredNotificationsEnabled: this.options.deferredNotificationsEnabled,
        isTransientChat: derived(this, (reader) => this.options.session.read(reader)?.isQuickChat?.read(reader) ?? false),
        sessionStarted: derived(this, (reader) => {
          const session = this.options.session.read(reader);
          return session ? session.activeChat.read(reader).status.read(reader) !== 0 /* Untitled */ : false;
        }),
        modelSelection: {
          state: this._modelSelection.state,
          openPicker: () => this._newChatModelPickerService.openModelPicker(),
          selectModel: (modelIdentifier) => this._newChatModelPickerService.switchToModel(modelIdentifier),
          // The model picker here has no scoped store and configures models globally,
          // so a notification writes to the same place its "Thinking" rows do.
          applyModelConfiguration: (modelIdentifier, values) => this.languageModelsService.setModelConfiguration(modelIdentifier, values)
        },
        onDidChangeVisibility: (visible, focusTarget) => this.noticeHost.setOccupied(0 /* Notification */, visible, focusTarget),
        focusInput: () => this.focus()
      }
    ));
    notificationWidget.attachTo(notificationContainer);
    const voiceOnboardingContainer = append(chatInputContainer, $(`.voice-mode-onboarding-container.${chatInputStackSlotClass}`));
    const dictationOnboardingContainer = append(chatInputContainer, $(`.dictation-onboarding-container.${chatInputStackSlotClass}`));
    this._register(registerChatInputOnboardingHosts(
      this.noticeHost,
      { voice: voiceOnboardingContainer, dictation: dictationOnboardingContainer },
      chatInputContainer,
      () => this.focus(),
      this.voiceModeOnboardingService,
      this.dictationOnboardingService
    ));
    this._gettingStartedTipContainer = append(chatInputContainer, $(`.chat-getting-started-tip-container.${chatInputStackSlotClass}`));
    this._hostNoticeContainer = append(chatInputContainer, $(`.chat-input-host-notice-container.${chatInputStackSlotClass}`));
    this._promptOptionsWidget.value = this.instantiationService.createInstance(NewSessionPromptOptionsWidget, chatInputContainer, {
      selectOption: async (option2, expectedInput, animate2) => {
        this.focus();
        const inserted = animate2 ? await this.animatePrompt(option2.prompt, NEW_SESSION_PROMPT_TYPING_DURATION_MS, option2.placeholder, CancellationToken.None, expectedInput) : this._replacePrompt(option2.prompt, option2.placeholder, expectedInput);
        const generatedValue = option2.placeholder ? option2.prompt.replace(option2.placeholder, "") : option2.prompt;
        if (inserted && (this._editor.getValue() === option2.prompt || this._editor.getValue() === generatedValue)) {
          status(localize(4444, null, option2.title));
        }
        return inserted;
      },
      onDidSelectOption: (option2) => this._promptOptionsController?.onDidSelectOption(option2),
      onDidClose: () => this._dismissPromptOptions()
    });
    this._promptOptionsWidget.value.setState(this._promptOptionsState);
    const inputAreaWrapper = append(chatInputContainer, $(".new-chat-input-area-wrapper"));
    const inputArea = append(inputAreaWrapper, $(".new-chat-input-area"));
    const contextAttachments = this._contextAttachments;
    const attachRow = append(inputArea, $(".sessions-chat-attach-row"));
    const attachedContextContainer = append(attachRow, $(".sessions-chat-attached-context"));
    this._contextAttachments.renderAttachedContext(attachedContextContainer);
    this._register(this.instantiationService.createInstance(ChatDragAndDrop, () => void 0, {
      get attachments() {
        return contextAttachments.attachments;
      },
      addAttachments: (entries2) => contextAttachments.addAttachments(...entries2)
    }, {
      listForeground: inactiveSessionViewForeground,
      listBackground: inactiveSessionViewBackground,
      overlayBackground: EDITOR_DRAG_AND_DROP_BACKGROUND
    })).addOverlay(root, root);
    this._createEditor(inputArea, editorOverflowWidgetsDomNode);
    const inputHasContent = observableFromEvent(this, this._editor.onDidChangeModelContent, () => this._editor.getValue().length > 0);
    this._register(this.chatPetWidgetService.register(this, {
      parent: chatInputContainer,
      dragBounds: inputArea,
      movementBounds: root,
      model: constObservable(void 0),
      hasInput: inputHasContent,
      inputChanged: this._editor.onDidChangeModelContent,
      // Stand on the notice docked above the input, not on the input itself.
      getPlatformTop: () => getChatPetStackPlatformTop(chatInputContainer, inputArea),
      onDidChangePlatform: Event2.None
    }, this.options.petHostPreferred, this.onDidFocus));
    this._createInputToolbar(inputArea);
    const newChatBottomContainer = append(parent, $(".new-chat-bottom-container"));
    const newChatControlsContainer = append(newChatBottomContainer, $(".new-chat-controls-container"));
    const sessionControlsContainer = this._sessionControlsContainer = append(newChatControlsContainer, $(".new-chat-session-controls"));
    this._register(this._scopedInstantiationService.createInstance(MenuWorkbenchToolBar, sessionControlsContainer, Menus.NewSessionControl, {
      hiddenItemStrategy: -1 /* NoHide */
    }));
    this._register({ dispose: () => sessionControlsContainer.remove() });
    const repoConfigContainer = append(newChatBottomContainer, $(".new-chat-repo-config-container"));
    this._register(this._scopedInstantiationService.createInstance(MenuWorkbenchToolBar, repoConfigContainer, Menus.NewSessionRepositoryConfig, {
      hiddenItemStrategy: -1 /* NoHide */
    }));
    this._register(installMobileChipLaneScroll(newChatBottomContainer, this.layoutService));
    const statusContainer3 = append(repoConfigContainer, $(".new-chat-status-toolbar"));
    this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, statusContainer3, MenuId.ChatInputStatus, {
      hiddenItemStrategy: -1 /* NoHide */,
      toolbarOptions: { primaryGroup: () => true },
      actionViewItemProvider: (action, options3) => {
        if (action.id === OTEL_STATUS_COMMAND && action instanceof MenuItemAction) {
          return this.instantiationService.createInstance(NewChatInputStatusActionViewItem, action, options3);
        }
        return void 0;
      }
    }));
    this._secondaryPickerResponsiveLayout = this._register(new ChatInputPickerResponsiveLayout("NewChatInput.secondaryPicker", newChatBottomContainer, {
      getItems: () => getLabeledPickerResponsiveItems(newChatBottomContainer)
    }));
    this._secondaryPickerResponsiveLayout.layout();
    this._restoreState();
    setChatInputStackSlot(chatInputContainer, 2 /* Standalone */);
    refreshChatInputStack(parent);
    this._register(addDisposableListener(chatInputContainer, "animationend", () => {
      this._editor?.layout();
    }, { once: true }));
  }
  _updateInputLoadingState() {
    const loading = this._sending;
    if (loading) {
      if (!this._loadingDelayDisposable.value) {
        const timer = setTimeout(() => {
          this._loadingDelayDisposable.clear();
          if (this._sending) {
            this._loadingSpinner?.classList.add("visible");
          }
        }, 500);
        this._loadingDelayDisposable.value = toDisposable(() => clearTimeout(timer));
      }
    } else {
      this._loadingDelayDisposable.clear();
      this._loadingSpinner?.classList.remove("visible");
    }
  }
  // --- Editor ---
  _getAriaLabel() {
    const verbose = this.configurationService.getValue("accessibility.verbosity.sessionsChat" /* SessionsChat */);
    if (verbose) {
      const kbLabel = this.keybindingService.lookupKeybinding("editor.action.accessibilityHelp" /* OpenAccessibilityHelp */)?.getLabel();
      return kbLabel ? localize(4437, null, kbLabel) : localize(4438, null);
    }
    return localize(4436, null);
  }
  _getTerminalCommandPrefix() {
    const session = this.options.session.get();
    return session ? this.chatSessionsService.getCapabilitiesForSessionType(getChatSessionType(session.resource))?.terminalCommandPrefix : void 0;
  }
  _handleTerminalCommandPaste(e4) {
    handleTerminalCommandPaste(e4, this._editor, this._getTerminalCommandPrefix(), this.dialogService, this.storageService);
  }
  /**
   * Paste edits are applied through the bulk edit service, which resolves the
   * input model and force-destroys it when the last reference is released.
   * Holding one keeps the model alive for this editor's lifetime.
   */
  _holdInputModelReference(uri4, model) {
    const inputModelReference = thenRegisterOrDispose(this.textModelService.createModelReference(uri4), this._store);
    void inputModelReference.catch((error) => {
      model.dispose();
      if (!this._store.isDisposed) {
        this.logService.error("Failed to hold the chat input model reference", error);
      }
    });
  }
  _createEditor(container2, overflowWidgetsDomNode) {
    const editorContainer = this._editorContainer = append(container2, $(".sessions-chat-editor"));
    const minHeight = this.options.minEditorHeight ?? MIN_EDITOR_HEIGHT2;
    editorContainer.style.height = `${minHeight}px`;
    const inputScopedContextKeyService = this._register(this.contextKeyService.createScoped(container2));
    const { historyNavigationBackwardsEnablement, historyNavigationForwardsEnablement } = this._register(registerAndCreateHistoryNavigationContext(inputScopedContextKeyService, this));
    this._historyNavigationBackwardsEnablement = historyNavigationBackwardsEnablement;
    this._historyNavigationForwardsEnablement = historyNavigationForwardsEnablement;
    const scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, inputScopedContextKeyService])));
    const uri4 = URI.from({ scheme: Schemas.sessionsChatInput, path: `input-${Date.now()}` });
    const textModel = this.modelService.createModel("", null, uri4, true);
    this._holdInputModelReference(uri4, textModel);
    const editorOptions = {
      ...getSimpleEditorOptions(this.configurationService),
      readOnly: false,
      // Match the workbench chat input so the post-paste selector is offered.
      pasteAs: EditorOptions.pasteAs.defaultValue,
      ariaLabel: this._getAriaLabel(),
      placeholder: this.options.placeholder ?? getRandomChatInputPlaceholder(),
      fontFamily: NEW_CHAT_INPUT_FONT_FAMILY,
      fontSize: 13,
      lineHeight: 20,
      cursorWidth: 1,
      padding: { top: 8, bottom: 2 },
      wrappingStrategy: "advanced",
      stickyScroll: { enabled: false },
      renderWhitespace: "none",
      scrollbar: {
        horizontal: "hidden",
        alwaysConsumeMouseWheel: false,
        vertical: "auto",
        verticalScrollbarSize: 7
      },
      overflowWidgetsDomNode,
      suggest: {
        showIcons: true,
        showSnippets: false,
        showWords: true,
        showStatusBar: false,
        insertMode: "insert",
        fitWidthToDetails: true
      }
    };
    const widgetOptions = {
      isSimpleWidget: true,
      contributions: EditorExtensionsRegistry.getSomeEditorContributions([
        ContextMenuController.ID,
        SuggestController.ID,
        SnippetController2.ID,
        PlaceholderTextContribution.ID,
        CopyPasteController.ID
      ])
    };
    this._editor = this._register(scopedInstantiationService.createInstance(
      CodeEditorWidget,
      editorContainer,
      editorOptions,
      widgetOptions
    ));
    this._editor.setModel(textModel);
    this._promptTemplatePlaceholder.value = new PromptTemplatePlaceholderController(this._editor, () => this._promptTypingAnimation.value?.complete());
    this._register(autorun((reader) => {
      this.options.session.read(reader);
      this._updateEditorFontFamily();
    }));
    this._register(addDisposableListener(this._editorContainer, EventType.PASTE, (e4) => this._handleTerminalCommandPaste(e4), true));
    SuggestController.get(this._editor)?.forceRenderingAbove();
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("accessibility.verbosity.sessionsChat" /* SessionsChat */)) {
        this._editor.updateOptions({ ariaLabel: this._getAriaLabel() });
      }
    }));
    const dictationFocusKey = SessionsChatInputHasDictationFocus.bindTo(inputScopedContextKeyService);
    const inputHasFocusKey = ChatContextKeys.inputHasFocus.bindTo(inputScopedContextKeyService);
    this._register(this._editor.onDidFocusEditorWidget(() => {
      dictationFocusKey.set(true);
      inputHasFocusKey.set(true);
      activeDictationComposer = this;
      this._onDidFocus.fire();
    }));
    this._register(this._editor.onDidBlurEditorWidget(() => {
      dictationFocusKey.set(false);
      inputHasFocusKey.set(false);
      if (activeDictationComposer === this) {
        activeDictationComposer = void 0;
      }
      this._onDidBlur.fire();
    }));
    this._register(toDisposable(() => {
      if (activeDictationComposer === this) {
        activeDictationComposer = void 0;
      }
    }));
    this._register(this._editor.onKeyDown((e4) => {
      if (e4.browserEvent.defaultPrevented) {
        return;
      }
      if (e4.keyCode === 3 /* Enter */ && !e4.shiftKey && !e4.ctrlKey && !e4.altKey && this._promptTemplatePlaceholder.value?.replaceAtCursor()) {
        e4.preventDefault();
        e4.stopPropagation();
        return;
      }
      if (e4.keyCode === 3 /* Enter */ && !e4.shiftKey && !e4.ctrlKey && !e4.altKey) {
        if (this._editor.contextKeyService.getContextKeyValue("suggestWidgetVisible")) {
          return;
        }
        e4.preventDefault();
        e4.stopPropagation();
        this._send();
      }
      if (this.options.supportsBackground && e4.keyCode === 3 /* Enter */ && !e4.shiftKey && !e4.ctrlKey && e4.altKey) {
        e4.preventDefault();
        e4.stopPropagation();
        this._send(true);
      }
      if (e4.equals(2048 /* CtrlCmd */ | 90 /* Slash */)) {
        e4.preventDefault();
        e4.stopPropagation();
        this._contextAttachments.showPicker(this.options.getContextFolderUri());
      }
    }));
    const updateHistoryNavigationEnablement = () => {
      const model = this._editor.getModel();
      const position2 = this._editor.getPosition();
      if (!model || !position2) {
        return;
      }
      this._historyNavigationBackwardsEnablement.set(position2.lineNumber === 1 && position2.column === 1);
      this._historyNavigationForwardsEnablement.set(position2.lineNumber === model.getLineCount() && position2.column === model.getLineMaxColumn(position2.lineNumber));
    };
    this._register(this._editor.onDidChangeCursorPosition(() => updateHistoryNavigationEnablement()));
    updateHistoryNavigationEnablement();
    let previousHeight = -1;
    this._register(this._editor.onDidContentSizeChange((e4) => {
      if (!e4.contentHeightChanged) {
        return;
      }
      const contentHeight = this._editor.getContentHeight();
      const clampedHeight = Math.min(MAX_EDITOR_HEIGHT2, Math.max(this.options.minEditorHeight ?? MIN_EDITOR_HEIGHT2, contentHeight));
      if (clampedHeight === previousHeight) {
        return;
      }
      previousHeight = clampedHeight;
      this._editorContainer.style.height = `${clampedHeight}px`;
      this._editor.layout();
    }));
    this._register(this._scopedInstantiationService.createInstance(SlashCommandHandler, this._editor));
    this._register(this.instantiationService.createInstance(
      VariableCompletionHandler,
      this._editor,
      this._contextAttachments,
      () => this.options.getContextFolderUri()
    ));
    this._register(this.instantiationService.createInstance(
      SessionReferenceCompletionHandler,
      this._editor,
      this._contextAttachments
    ));
    this._agentHostInputCompletionHandler = this._register(this._scopedInstantiationService.createInstance(
      AgentHostInputCompletionHandler,
      this._editor,
      this._contextAttachments
    ));
    this._register(this.chatPasteTargetService.registerTarget(textModel.uri, new NewChatInputPasteTarget(
      this._editor,
      this._contextAttachments,
      this._agentHostInputCompletionHandler,
      () => this._getTerminalCommandPrefix(),
      () => this.options.session.get()?.resource,
      textModel.uri
    )));
    this._register(this._editor.onDidChangeModelContent(() => {
      this._updateDraftState();
      this._updateSendButtonState();
      this._updateEditorFontFamily();
      this._promptOptionsWidget.value?.setInputValue(this._editor.getValue());
    }));
  }
  /**
   * The input is monospace only while a terminal command is being composed:
   * the attached session advertises a prefix AND the current input begins with
   * it. Otherwise it uses the normal new-chat input font.
   */
  _updateEditorFontFamily() {
    const isCommand = isTerminalCommandInput(this._editor.getModel()?.getLineContent(1) || "", this._getTerminalCommandPrefix());
    this._editor.updateOptions({ fontFamily: isCommand ? EDITOR_FONT_DEFAULTS.fontFamily : NEW_CHAT_INPUT_FONT_FAMILY });
  }
  _createAttachButton(container2) {
    const attachButton = append(container2, $(".sessions-chat-attach-button"));
    const attachButtonLabel = localize(4435, null);
    attachButton.tabIndex = 0;
    attachButton.role = "button";
    attachButton.ariaLabel = attachButtonLabel;
    this._register(this.hoverService.setupDelayedHover(attachButton, {
      content: attachButtonLabel,
      position: { hoverPosition: 2 /* BELOW */ },
      appearance: { showPointer: true }
    }));
    append(attachButton, renderIcon(Codicon.addCompact));
    this._register(addDisposableListener(attachButton, EventType.CLICK, () => {
      this._contextAttachments.showPicker(this.options.getContextFolderUri());
    }));
  }
  _createInputToolbar(container2) {
    const toolbar = append(container2, $(".sessions-chat-toolbar"));
    let dictationActionVisible = false;
    let voiceActionCount = 0;
    const updateVoiceInputActionBorder = () => {
      toolbar.classList.toggle("sessions-chat-voice-input-actions-multiple", Number(dictationActionVisible) + voiceActionCount > 1);
    };
    this._createAttachButton(toolbar);
    const configContainer = append(toolbar, $(".sessions-chat-config-toolbar"));
    const configToolbar = this._register(this._scopedInstantiationService.createInstance(MenuWorkbenchToolBar, configContainer, Menus.NewSessionConfig, {
      hiddenItemStrategy: -1 /* NoHide */,
      actionViewItemProvider: (action) => {
        if (action.id === "sessions.modelPicker") {
          const picker = this._scopedInstantiationService.createInstance(ModelPicker, this._compactModelPicker);
          return new ModelPickerActionViewItem(picker);
        }
        return void 0;
      }
    }));
    try {
      this._createSpeechToTextButton(toolbar, (visible) => {
        dictationActionVisible = visible;
        updateVoiceInputActionBorder();
      });
    } catch (error) {
      this.logService.error("Failed to create new-session dictation control:", error);
    }
    const voiceContainer = append(toolbar, $(".sessions-chat-voice-toolbar"));
    try {
      this._register(this.instantiationService.createInstance(NewChatVoiceController, {
        toolbarContainer: voiceContainer,
        inputContainer: container2,
        composer: this,
        onDidChangeActions: (actionCount) => {
          voiceActionCount = actionCount;
          updateVoiceInputActionBorder();
        }
      }));
    } catch (error) {
      this.logService.error("Failed to create new-session voice controls:", error);
    }
    try {
      this._createVoiceInputModePill(toolbar, container2);
    } catch (error) {
      this.logService.error("Failed to create new-session voice input mode pill:", error);
    }
    this._loadingSpinner = append(toolbar, $(".sessions-chat-loading-spinner"));
    const loadingIcon = append(this._loadingSpinner, renderIcon(ThemeIcon.modify(Codicon.loading, "spin")));
    loadingIcon.setAttribute("aria-hidden", "true");
    this._register(this.hoverService.setupManagedHover(getDefaultHoverDelegate("mouse"), this._loadingSpinner, localize(4439, null)));
    this._loadingSpinner.classList.toggle("visible", this.options.loading.get());
    if (this.options.renderSendButton !== false) {
      const sendButtonContainer = append(toolbar, $(".sessions-chat-send-button"));
      const sendButton = this._sendButton = this._register(new Button(sendButtonContainer, {
        secondary: true,
        title: this.options.supportsBackground ? localize(4446, null) : localize(4445, null),
        ariaLabel: localize(4445, null)
      }));
      sendButton.icon = Codicon.arrowUpCompact;
      this._register(sendButton.onDidClick((e4) => this._send(!!this.options.supportsBackground && !!e4?.altKey)));
    }
    updateVoiceInputActionBorder();
    this._primaryPickerResponsiveLayout = this._register(new ChatInputPickerResponsiveLayout("NewChatInput.primaryPicker", configContainer, {
      getItems: () => {
        const items = [];
        for (let index2 = 0; index2 < configToolbar.getItemsLength(); index2++) {
          const element = configToolbar.getItemElement(index2);
          if (!element) {
            continue;
          }
          items.push({
            element,
            isCompact: () => element.classList.contains("compact-picker"),
            setCompact: (compact2) => {
              element.classList.toggle("compact-picker", compact2);
              if (configToolbar.getItemAction(index2)?.id === "sessions.modelPicker") {
                this._compactModelPicker.set(compact2, void 0);
              }
            }
          });
        }
        return items;
      },
      hasOverflow: () => configToolbar.hasOverflow(),
      relayout: () => configToolbar.relayout()
    }));
    this._primaryPickerResponsiveLayout.layout();
  }
  _createVoiceInputModePill(toolbar, inputContainer) {
    const pillContainer = append(toolbar, $(".sessions-chat-voice-input-mode"));
    const isVoiceInputActive = derived(this, (reader) => isEqual2(this.newChatVoiceTargetService.currentVoiceInputResource.read(reader), NEW_CHAT_VOICE_SENTINEL));
    const isDictationInputActive = observableFromEvent(
      this,
      Event2.any(this.chatSpeechToTextService.onDidChangeState, this.chatSpeechToTextService.onDidChangePreparingModel, onDidChangeDictationEditor),
      () => isDictationActiveForEditor(this._editor)
    );
    const isVoiceSessionActive = derived(this, (reader) => isNewChatVoiceSessionActive(
      this.voiceSessionController.isConnected.read(reader),
      this.voiceSessionController.isConnecting.read(reader),
      this.voiceSessionController.targetSession.read(reader),
      this.voiceSessionController.hasDraftTarget.read(reader)
    ));
    const action = toAction({
      id: ChatVoiceInputModeAction.ID,
      label: localize(4466, null),
      run: () => {
      }
    });
    const pill = this._register(this._scopedInstantiationService.createInstance(VoiceInputModeActionViewItem, action, {
      // Dictation must target this composer's editor, not the last focused
      // chat widget (this composer isn't an `IChatWidget`).
      toggleDictation: () => {
        void this.toggleDictation();
      },
      isActive: isVoiceInputActive,
      isDictationActive: isDictationInputActive,
      isVoiceActive: isVoiceSessionActive
    }));
    pill.render(pillContainer);
    this._register(autorun((reader) => {
      const dict = this.voiceInputModeService.dictationAvailable.read(reader);
      const voice = this.voiceInputModeService.voiceAvailable.read(reader);
      const handsFree = this.voiceInputModeService.handsFree.read(reader);
      const connected = isVoiceSessionActive.read(reader) && this.voiceSessionController.isConnected.read(reader);
      const pillActive = dict && voice || voice && !dict && !handsFree && connected;
      pillContainer.classList.toggle("hidden", !pillActive);
      inputContainer.classList.toggle("voice-input-mode-pill", pillActive);
    }));
  }
  _createSpeechToTextButton(container2, onDidChangeVisibility) {
    const sttService = this.chatSpeechToTextService;
    const isDictationInputActive = observableFromEvent(
      this,
      Event2.any(sttService.onDidChangeState, sttService.onDidChangePreparingModel, onDidChangeDictationEditor),
      () => isDictationActiveForEditor(this._editor)
    );
    const button = append(container2, $(".sessions-chat-stt-button"));
    button.tabIndex = 0;
    button.role = "button";
    const micLabel = localize(4464, null);
    const stopLabel = localize(4465, null);
    this._register(this.hoverService.setupDelayedHover(button, () => ({
      // While the model prepares, surface the download/connecting hover
      // (which invites the user to click to cancel) so this composer matches
      // the main chat toolbar affordance. Idle gets the richer description
      // naming the configured dictation model.
      content: isDictationInputActive.get() && sttService.isPreparingModel ? getDictationDownloadHoverMarkdown(sttService) : isDictationInputActive.get() ? stopLabel : getDictationHoverMarkdown(micLabel, this.configurationService),
      position: { hoverPosition: 2 /* BELOW */ },
      appearance: { showPointer: true }
    })));
    const downloadRing = this._register(new MutableDisposable());
    const renderState = () => {
      const active = isDictationActiveForEditor(this._editor);
      const preparing = active && sttService.isPreparingModel;
      const recording = active && sttService.state === "recording" /* Recording */;
      clearNode(button);
      downloadRing.clear();
      if (preparing) {
        if (sttService.isDownloadingModel) {
          append(button, renderIcon(Codicon.micDownloadCompact));
          downloadRing.value = new DictationDownloadRing(button, sttService);
        } else {
          append(button, renderIcon(ThemeIcon.modify(Codicon.loadingCompact, "spin")));
        }
      } else {
        append(button, renderIcon(recording ? Codicon.micFilled : Codicon.mic));
      }
      button.classList.toggle("recording", recording && !preparing);
      button.classList.toggle("preparing", preparing);
      button.ariaLabel = preparing ? localize(4463, null, getDictationPreparingLabel(sttService)) : active ? stopLabel : micLabel;
    };
    renderState();
    this._register(sttService.onDidChangeState(renderState));
    this._register(sttService.onDidChangePreparingModel(renderState));
    this._register(sttService.onDidChangeDownloadingModel(renderState));
    this._register(setupDictationMicGlow(button, sttService, this.accessibilityService, isDictationInputActive, this.themeService));
    const updateVisibility = () => {
      const voiceActive = isNewChatVoiceSessionActive(
        this.voiceSessionController.isConnected.get(),
        this.voiceSessionController.isConnecting.get(),
        this.voiceSessionController.targetSession.get(),
        this.voiceSessionController.hasDraftTarget.get()
      );
      const dict = this.voiceInputModeService.dictationAvailable.get();
      const voice = this.voiceInputModeService.voiceAvailable.get();
      const handsFree = this.voiceInputModeService.handsFree.get();
      const sessionActive = this.voiceSessionController.isConnected.get();
      const pillActive = dict && voice || voice && !dict && !handsFree && sessionActive;
      const buttonShown = this.configurationService.getValue("dictation.showButton" /* ShowButton */) !== false;
      const visible = sttService.isConfigured && !voiceActive && !pillActive && buttonShown;
      button.classList.toggle("hidden", !visible);
      onDidChangeVisibility(visible);
    };
    updateVisibility();
    this._register(autorun((reader) => {
      this.voiceSessionController.isConnected.read(reader);
      this.voiceSessionController.isConnecting.read(reader);
      this.voiceSessionController.targetSession.read(reader);
      this.voiceSessionController.hasDraftTarget.read(reader);
      this.voiceInputModeService.dictationAvailable.read(reader);
      this.voiceInputModeService.voiceAvailable.read(reader);
      this.voiceInputModeService.handsFree.read(reader);
      updateVisibility();
    }));
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("dictation.enabled") || e4.affectsConfiguration("dictation.model") || e4.affectsConfiguration("dictation.showButton" /* ShowButton */)) {
        updateVisibility();
      }
    }));
    const toggle = () => this.toggleDictation();
    this._register(Gesture.addTarget(button));
    [EventType.CLICK, EventType2.Tap].forEach((eventType) => {
      this._register(addDisposableListener(button, eventType, (e4) => {
        EventHelper.stop(e4);
        void toggle();
      }));
    });
    this._register(addDisposableListener(button, EventType.KEY_DOWN, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      if (event.equals(3 /* Enter */) || event.equals(10 /* Space */)) {
        EventHelper.stop(event, true);
        void toggle();
      }
    }));
    this._register(addMicButtonContextMenuListener(
      button,
      () => getDictationContextMenuActions(this.commandService, this.configurationService, this.keybindingService, TOGGLE_DICTATION_COMMAND_ID2),
      this.contextMenuService
    ));
  }
  /**
   * Toggle dictation into this composer's editor. Shared by the mic button and
   * the Cmd/Ctrl+I chord ({@link TOGGLE_DICTATION_COMMAND_ID}); the shared
   * Dictate action can't target this composer since it isn't an `IChatWidget`.
   */
  async toggleDictation() {
    if (!this._editor) {
      return;
    }
    await runDictationShortcut({
      speechService: this.chatSpeechToTextService,
      keybindingService: this.keybindingService,
      logService: this.logService,
      onboardingService: this.dictationOnboardingService
    }, TOGGLE_DICTATION_COMMAND_ID2, this._editor);
  }
  // --- Input History (IHistoryNavigationWidget) ---
  showPreviousValue() {
    if (this._history.isAtStart()) {
      return;
    }
    if (this._draftState?.inputText || this._draftState?.attachments.length) {
      this._history.overlay(this._toHistoryEntry(this._draftState));
    }
    this._navigateHistory(true);
  }
  showNextValue() {
    if (this._history.isAtEnd()) {
      return;
    }
    if (this._draftState?.inputText || this._draftState?.attachments.length) {
      this._history.overlay(this._toHistoryEntry(this._draftState));
    }
    this._navigateHistory(false);
  }
  _updateDraftState() {
    this._draftState = {
      inputText: this._editor?.getModel()?.getValue() ?? "",
      attachments: [...this._contextAttachments.attachments]
    };
  }
  _updateAndSaveDraftState() {
    if (this._sending) {
      return;
    }
    this._updateDraftState();
    this.saveState();
  }
  _toHistoryEntry(draft) {
    return {
      ...draft,
      mode: { id: "agent" /* Agent */, kind: "agent" /* Agent */ },
      selectedModel: void 0,
      selections: [],
      contrib: {}
    };
  }
  _navigateHistory(previous) {
    const entry = previous ? this._history.previous() : this._history.next();
    const inputText = entry?.inputText ?? "";
    if (entry) {
      this._editor?.getModel()?.setValue(inputText);
      this._contextAttachments.setAttachments(entry.attachments);
    }
    status(inputText);
    if (previous) {
      this._editor.setPosition({ lineNumber: 1, column: 1 });
    } else {
      const model = this._editor.getModel();
      if (model) {
        const lastLine = model.getLineCount();
        this._editor.setPosition({ lineNumber: lastLine, column: model.getLineMaxColumn(lastLine) });
      }
    }
  }
  // --- Send ---
  async submit(background = false) {
    return this._send(background);
  }
  async _send(background = false) {
    const rawQuery = this._editor.getModel()?.getValue() ?? "";
    const query = rawQuery.trim();
    const queryOffset = rawQuery.length - rawQuery.trimStart().length;
    const hasAdditionalSendContent = this.options.hasAdditionalSendContent?.get() ?? false;
    if (!hasSendableNewChatContent(query, this._contextAttachments.attachments, hasAdditionalSendContent) || this._sending) {
      return false;
    }
    if (!this._canSendRequest.get()) {
      return false;
    }
    notifyDictationSubmitted(this._editor);
    const session = this.options.session.get();
    if (!hasAdditionalSendContent && session && await this.chatSubmitRequestHandlerService.tryHandle({
      sessionResource: session.resource,
      providerId: session.providerId,
      sessionId: session.sessionId,
      input: query
    })) {
      this._editor.getModel()?.setValue("");
      return true;
    }
    const attachments = this._agentHostInputCompletionHandler?.getAttachmentsForSend(query, queryOffset) ?? [...this._contextAttachments.attachments];
    const attachedContext = attachments.length > 0 ? attachments : void 0;
    const request2 = query;
    const notificationContext = this._getNotificationContext();
    if (this._draftState) {
      this._history.append(this._toHistoryEntry(this._draftState));
    }
    this._clearDraftState();
    this._sending = true;
    this._editor.updateOptions({ readOnly: true });
    this._updateSendButtonState();
    this._updateInputLoadingState();
    let sent = false;
    try {
      sent = await this.options.sendRequest({ query: request2, attachments: attachedContext, background });
      if (!sent) {
        return false;
      }
      this.chatInputNotificationService.handleMessageSent(notificationContext);
      this._contextAttachments.clear();
      this._editor.getModel()?.setValue("");
    } catch (e4) {
      this.logService.error("Failed to send request:", e4);
      return false;
    } finally {
      this._sending = false;
      this._editor.updateOptions({ readOnly: false });
      this._updateDraftState();
      this._updateSendButtonState();
      this._updateInputLoadingState();
    }
    return sent;
  }
  _getNotificationContext() {
    const session = this.options.session.get();
    const activeChat = session?.activeChat.get();
    const modelSelection = this._modelSelection.state.get();
    return {
      sessionType: this.sessionTypePicker.modelTargetChatSessionType.get(),
      sessionResource: activeChat?.resource,
      deferredNotificationsEnabled: this.options.deferredNotificationsEnabled?.get() ?? true,
      isTransientChat: session?.isQuickChat?.get() ?? false,
      sessionStarted: activeChat ? activeChat.status.get() !== 0 /* Untitled */ : false,
      modelState: modelSelection
    };
  }
  _updateSendButtonState() {
    if (!this._sendButton) {
      return;
    }
    const hasAdditionalSendContent = this.options.hasAdditionalSendContent?.get() ?? false;
    this._sendButton.enabled = !this._sending && hasSendableNewChatContent(this._editor?.getModel()?.getValue() ?? "", this._contextAttachments.attachments, hasAdditionalSendContent) && this._canSendRequest.get();
  }
  _restoreState() {
    const draft = this._getDraftState();
    if (draft) {
      this._editor?.getModel()?.setValue(draft.inputText);
      if (draft.attachments?.length) {
        this._contextAttachments.setAttachments(draft.attachments.map(IChatRequestVariableEntry.fromExport));
      }
    }
    this._updateSendButtonState();
  }
  _getDraftState() {
    const raw = this.storageService.get(STORAGE_KEY_DRAFT_STATE, 1 /* WORKSPACE */);
    if (!raw) {
      return void 0;
    }
    try {
      return parse2(raw);
    } catch {
      return void 0;
    }
  }
  _clearDraftState() {
    this._draftState = { inputText: "", attachments: [] };
    this.storageService.store(STORAGE_KEY_DRAFT_STATE, stringify(this._draftState), 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  saveState() {
    if (this._draftState) {
      const state = {
        ...this._draftState,
        attachments: this._draftState.attachments.map(IChatRequestVariableEntry.toExport)
      };
      this.storageService.store(STORAGE_KEY_DRAFT_STATE, stringify(state), 1 /* WORKSPACE */, 1 /* MACHINE */);
    }
  }
  layout(_height, _width) {
    this._editor?.layout();
    this._primaryPickerResponsiveLayout?.layout();
    this._secondaryPickerResponsiveLayout?.layout();
  }
  focus() {
    this._editor?.focus();
  }
  async animatePrompt(text2, durationMs, placeholder, token, expectedValue = "") {
    const editor = this._editor;
    const model = editor?.getModel();
    if (!editor || !model || !text2 || model.getValue() !== expectedValue || token.isCancellationRequested) {
      return false;
    }
    this._promptTypingAnimation.clear();
    if (expectedValue) {
      model.setValue("");
    }
    this._promptTemplatePlaceholder.value?.setPlaceholder(placeholder);
    const targetWindow = getWindow(this._editorContainer);
    const effectiveDuration = this.accessibilityService.isMotionReduced() || this.accessibilityService.isScreenReaderOptimized() ? 0 : durationMs;
    const animation = animatePromptTyping({
      getValue: () => model.getValue(),
      setValue: (value2) => {
        model.setValue(value2);
        const lastLine = model.getLineCount();
        editor.setPosition({ lineNumber: lastLine, column: model.getLineMaxColumn(lastLine) });
      },
      onDidChange: (listener) => model.onDidChangeContent(() => listener())
    }, text2, effectiveDuration, {
      now: () => targetWindow.performance.now(),
      schedule: (callback) => scheduleAtNextAnimationFrame(targetWindow, callback)
    });
    this._promptTypingAnimation.value = animation;
    const cancellationListener = token.onCancellationRequested(() => {
      if (this._promptTypingAnimation.value === animation) {
        this._promptTypingAnimation.clear();
      } else {
        animation.dispose();
      }
    });
    try {
      return (await animation.result).didWrite;
    } finally {
      cancellationListener.dispose();
      if (this._promptTypingAnimation.value === animation) {
        this._promptTypingAnimation.clear();
      }
    }
  }
  _replacePrompt(text2, placeholder, expectedValue) {
    const model = this._editor.getModel();
    if (!model || model.getValue() !== expectedValue) {
      return false;
    }
    this._promptTypingAnimation.clear();
    this._promptTemplatePlaceholder.value?.setPlaceholder(placeholder);
    this._editor.pushUndoStop();
    const edited = this._editor.executeEdits("sessions.promptOption", [{ range: model.getFullModelRange(), text: text2 }]);
    if (!edited) {
      return false;
    }
    this._editor.pushUndoStop();
    const lastLine = model.getLineCount();
    this._editor.setPosition({ lineNumber: lastLine, column: model.getLineMaxColumn(lastLine) });
    return true;
  }
  showPromptOptions(state) {
    if (state && this._promptOptionsDismissed) {
      return false;
    }
    this._promptOptionsState = state;
    const widget = this._promptOptionsWidget.value;
    if (!widget) {
      return false;
    }
    widget.setState(state);
    widget.setInputValue(this._editor.getValue());
    return true;
  }
  setPromptOptionsController(controller) {
    this._cancelPromptOptionsRefresh(false);
    this._promptOptionsController = controller;
    this._promptOptionsDismissed = false;
  }
  preparePromptOptionsRefresh() {
    if (!this._promptOptionsController || this._promptOptionsDismissed) {
      return false;
    }
    this._cancelPromptOptionsRefresh();
    this.showPromptOptions({ kind: "loading" });
    return true;
  }
  clearPromptOptions() {
    this._cancelPromptOptionsRefresh();
    this.showPromptOptions(void 0);
  }
  _dismissPromptOptions() {
    if (this._promptOptionsDismissed) {
      return;
    }
    const controller = this._promptOptionsController;
    this._promptOptionsDismissed = true;
    this._cancelPromptOptionsRefresh(false);
    this.showPromptOptions(void 0);
    this.focus();
    status(localize(4443, null));
    controller?.onDidClose();
  }
  _cancelPromptOptionsRefresh(clearGeneratedInput = true) {
    const shouldClearInput = this._promptOptionsWidget.value?.shouldClearInputForRefresh() ?? false;
    this._promptTypingAnimation.clear();
    this._promptOptionsRefresh.value?.cancel();
    this._promptOptionsRefresh.clear();
    if (clearGeneratedInput && shouldClearInput) {
      this._promptTemplatePlaceholder.value?.setPlaceholder(void 0);
      this._editor.getModel()?.setValue("");
    }
  }
  async refreshPromptOptions(token = CancellationToken.None) {
    const controller = this._promptOptionsController;
    if (!controller || !this.preparePromptOptionsRefresh()) {
      return false;
    }
    const cts = new CancellationTokenSource(token);
    this._promptOptionsRefresh.value = cts;
    let state;
    try {
      state = await controller.resolve(cts.token);
    } catch (error) {
      if (this._promptOptionsRefresh.value === cts) {
        this._promptOptionsRefresh.clear();
        if (cts.token.isCancellationRequested) {
          this.showPromptOptions(void 0);
          return false;
        }
      }
      throw error;
    }
    if (this._promptOptionsRefresh.value !== cts) {
      return false;
    }
    if (cts.token.isCancellationRequested) {
      this._promptOptionsRefresh.clear();
      this.showPromptOptions(void 0);
      return false;
    }
    this._promptOptionsRefresh.clear();
    return this.showPromptOptions(state);
  }
  dispose() {
    this._cancelPromptOptionsRefresh();
    super.dispose();
  }
  /** See {@link INewChatVoiceComposer.routesWhileSessionActive}. */
  get routesWhileSessionActive() {
    return this.options.voiceRoutesWhileSessionActive === true;
  }
  prefillInput(text2) {
    const editor = this._editor;
    const model = editor?.getModel();
    if (editor && model) {
      model.setValue(text2);
      const lastLine = model.getLineCount();
      const maxColumn = model.getLineMaxColumn(lastLine);
      editor.setPosition({ lineNumber: lastLine, column: maxColumn });
      editor.focus();
    }
  }
  sendQuery(text2) {
    if (this._sending) {
      return;
    }
    const model = this._editor?.getModel();
    if (model) {
      const combined = combineVoiceInput(model.getValue(), text2);
      model.setValue(combined);
      this._send();
    }
  }
  attach(uris) {
    this._contextAttachments.addAttachments(...uris.map((uri4) => toFileVariableEntry(uri4)));
  }
  attachTextContext(name, content, icon2, id2 = `context:${content}`) {
    this._contextAttachments.addAttachments(toPasteVariableEntry(name, content, {
      id: id2,
      icon: icon2
    }));
  }
  addAttachments(...attachments) {
    this._contextAttachments.addAttachments(...attachments);
  }
  removeAttachment(id2) {
    this._contextAttachments.removeAttachment(id2);
  }
  get onDidChangeAttachments() {
    return this._contextAttachments.onDidChangeContext;
  }
  get attachments() {
    return this._contextAttachments.attachments;
  }
  getVoiceModels() {
    return this._modelSelection.state.get().models;
  }
  selectVoiceModel(identifier2) {
    return this._modelSelection.selectModel(identifier2);
  }
};

NewChatInputWidget = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IModelService),
  __decorateParam(3, ITextModelService),
  __decorateParam(4, IChatPasteTargetService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IContextKeyService),
  __decorateParam(7, ILogService),
  __decorateParam(8, IHoverService),
  __decorateParam(9, IStorageService),
  __decorateParam(10, IDialogService),
  __decorateParam(11, IKeybindingService),
  __decorateParam(12, IWorkbenchLayoutService),
  __decorateParam(13, IChatSessionsService),
  __decorateParam(14, IChatSpeechToTextService),
  __decorateParam(15, IDictationOnboardingService),
  __decorateParam(16, IChatInputNoticeHubService),
  __decorateParam(17, IChatSubmitRequestHandlerService),
  __decorateParam(18, IContextMenuService),
  __decorateParam(19, ICommandService),
  __decorateParam(20, IVoiceSessionController),
  __decorateParam(21, IVoiceInputModeService),
  __decorateParam(22, IAccessibilityService),
  __decorateParam(23, IVoiceModeOnboardingService),
  __decorateParam(24, INewChatVoiceTargetService),
  __decorateParam(25, IThemeService),
  __decorateParam(26, IChatPetWidgetService),
  __decorateParam(27, IChatInputNotificationService),
  __decorateParam(28, ILanguageModelsService)
], NewChatInputWidget);
export { getLabeledPickerResponsiveItems, hasSendableNewChatContent, getRandomChatInputPlaceholder, OPEN_OTEL_SETTINGS_COMMAND, OTEL_STATUS_COMMAND, OTEL_STATUS_ENTRY_ID, OTEL_DOCS_URL, STORAGE_KEY_DRAFT_STATE, MIN_EDITOR_HEIGHT2, MAX_EDITOR_HEIGHT2, NEW_CHAT_INPUT_FONT_FAMILY, SessionsChatInputHasDictationFocus, TOGGLE_DICTATION_COMMAND_ID2, activeDictationComposer, NewChatInputStatusActionViewItem, RANDOM_PLACEHOLDERS, lastPlaceholderIndex, NewChatInputWidget };
