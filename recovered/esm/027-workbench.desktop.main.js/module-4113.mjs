// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/electron-browser/actions/voiceChatActions.ts
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { HasSpeechProvider, ISpeechService, SpeechToTextInProgress, TextToSpeechInProgress } from "./module-1254.mjs";
import { CTX_INLINE_CHAT_FOCUSED, MENU_INLINE_CHAT_WIDGET_SECONDARY } from "./module-2001.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { IChatWidgetService, IQuickChatService } from "./module-0981.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { IEditorService } from "./module-0934.mjs";
import { getCodeEditor } from "./module-0223.mjs";
import { InlineChatController } from "./module-2397.mjs";
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { isNumber } from "./module-0010.mjs";
import { SpeechTimeoutDefault, accessibilityConfigurationNodeBase } from "./module-1370.mjs";
import { RunOnceScheduler, disposableTimeout, raceCancellation } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IVoiceChatService, VoiceChatInProgress } from "./module-2520.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { Action2, MenuId } from "./module-0092.mjs";
import { CHAT_CATEGORY } from "./module-1476.mjs";
import { EditorContextKeys } from "./module-0154.mjs";
import { NOTEBOOK_EDITOR_FOCUSED } from "./module-1868.mjs";
import { SearchContext } from "./module-1262.mjs";
import { CONTEXT_SETTINGS_EDITOR } from "./module-1831.mjs";
import { ActiveEditorContext } from "./module-0949.mjs";
import { Codicon } from "./module-0085.mjs";
import { SegmentedVoiceInputModePillInactive } from "./module-2083.mjs";
import { spinningLoading, syncing } from "./module-0479.mjs";
import { Event2 } from "./module-0017.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { ChatResponseViewModel, isResponseVM } from "./module-0978.mjs";
import { KEYWORD_ACTIVIATION_SETTING_ID } from "./module-0972.mjs";
import { Registry } from "./module-0090.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { IHostService } from "./module-1117.mjs";
import { IChatAgentService } from "./module-0974.mjs";
import { IStatusbarService } from "./module-0893.mjs";
import { registerThemingParticipant } from "./module-0287.mjs";
import { isHighContrast } from "./module-0247.mjs";
import { editorInfoForeground } from "./module-0229.mjs";
import { contrastBorder, focusBorder } from "./module-0227.mjs";


// src/vs/workbench/contrib/chat/electron-browser/actions/voiceChatActions.ts
var VoiceChatSessionContexts = ["view", "inline", "quick", "editor"];

var CanVoiceChat = ContextKeyExpr.and(ChatContextKeys.enabled, HasSpeechProvider);

var FocusInChatInput = ContextKeyExpr.or(CTX_INLINE_CHAT_FOCUSED, ChatContextKeys.inChatInput);

var ScopedVoiceChatGettingReady = new RawContextKey("scopedVoiceChatGettingReady", false, { type: "boolean", description: localize(13547, null) });

var ScopedVoiceChatInProgress = new RawContextKey("scopedVoiceChatInProgress", void 0, { type: "string", description: localize(13548, null) });

var AnyScopedVoiceChatInProgress = ContextKeyExpr.or(...VoiceChatSessionContexts.map((context2) => ScopedVoiceChatInProgress.isEqualTo(context2)));

var VoiceChatSessionControllerFactory = class _VoiceChatSessionControllerFactory {
  static async create(accessor, context2) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const quickChatService = accessor.get(IQuickChatService);
    const layoutService = accessor.get(IWorkbenchLayoutService);
    const editorService = accessor.get(IEditorService);
    switch (context2) {
      case "focused": {
        const controller = _VoiceChatSessionControllerFactory.doCreateForFocusedChat(chatWidgetService, layoutService);
        return controller ?? _VoiceChatSessionControllerFactory.create(accessor, "view");
      }
      case "view": {
        const chatWidget = await chatWidgetService.revealWidget();
        if (chatWidget) {
          return _VoiceChatSessionControllerFactory.doCreateForChatWidget("view", chatWidget);
        }
        break;
      }
      case "inline": {
        const activeCodeEditor = getCodeEditor(editorService.activeTextEditorControl);
        if (activeCodeEditor) {
          const inlineChat = InlineChatController.get(activeCodeEditor);
          if (inlineChat) {
            if (!inlineChat.isActive) {
              inlineChat.run();
            }
            return _VoiceChatSessionControllerFactory.doCreateForChatWidget("inline", inlineChat.widget.chatWidget);
          }
        }
        break;
      }
      case "quick": {
        quickChatService.open();
        return _VoiceChatSessionControllerFactory.create(accessor, "focused");
      }
    }
    return void 0;
  }
  static doCreateForFocusedChat(chatWidgetService, layoutService) {
    const chatWidget = chatWidgetService.lastFocusedWidget;
    if (chatWidget?.hasInputFocus()) {
      let context2;
      if (layoutService.hasFocus("workbench.parts.editor" /* EDITOR_PART */)) {
        context2 = chatWidget.location === "panel" /* Chat */ ? "editor" : "inline";
      } else if (["workbench.parts.sidebar" /* SIDEBAR_PART */, "workbench.parts.panel" /* PANEL_PART */, "workbench.parts.auxiliarybar" /* AUXILIARYBAR_PART */, "workbench.parts.titlebar" /* TITLEBAR_PART */, "workbench.parts.statusbar" /* STATUSBAR_PART */, "workbench.parts.banner" /* BANNER_PART */, "workbench.parts.activitybar" /* ACTIVITYBAR_PART */].some((part) => layoutService.hasFocus(part))) {
        context2 = "view";
      } else {
        context2 = "quick";
      }
      return _VoiceChatSessionControllerFactory.doCreateForChatWidget(context2, chatWidget);
    }
    return void 0;
  }
  static createChatContextKeyController(contextKeyService, context2) {
    const contextVoiceChatGettingReady = ScopedVoiceChatGettingReady.bindTo(contextKeyService);
    const contextVoiceChatInProgress = ScopedVoiceChatInProgress.bindTo(contextKeyService);
    return (state) => {
      switch (state) {
        case 2 /* GettingReady */:
          contextVoiceChatGettingReady.set(true);
          contextVoiceChatInProgress.reset();
          break;
        case 3 /* Started */:
          contextVoiceChatGettingReady.reset();
          contextVoiceChatInProgress.set(context2);
          break;
        case 1 /* Stopped */:
          contextVoiceChatGettingReady.reset();
          contextVoiceChatInProgress.reset();
          break;
      }
    };
  }
  static doCreateForChatWidget(context2, chatWidget) {
    return {
      context: context2,
      scopedContextKeyService: chatWidget.scopedContextKeyService,
      onDidAcceptInput: chatWidget.onDidAcceptInput,
      onDidHideInput: chatWidget.onDidHide,
      focusInput: () => chatWidget.focusInput(),
      acceptInput: () => chatWidget.acceptInput(void 0, { isVoiceInput: true }),
      updateInput: (text2) => chatWidget.setInput(text2),
      getInput: () => chatWidget.getInput(),
      setInputPlaceholder: (text2) => chatWidget.setInputPlaceholder(text2),
      clearInputPlaceholder: () => chatWidget.resetInputPlaceholder(),
      updateState: _VoiceChatSessionControllerFactory.createChatContextKeyController(chatWidget.scopedContextKeyService, context2)
    };
  }
};

var VoiceChatSessions = class {
  constructor(voiceChatService, configurationService, instantiationService, accessibilityService) {
    this.voiceChatService = voiceChatService;
    this.configurationService = configurationService;
    this.instantiationService = instantiationService;
    this.accessibilityService = accessibilityService;
    this.currentVoiceChatSession = void 0;
    this.voiceChatSessionIds = 0;
  }
  static {
    this.instance = void 0;
  }
  static getInstance(instantiationService) {
    if (!VoiceChatSessions.instance) {
      VoiceChatSessions.instance = instantiationService.createInstance(VoiceChatSessions);
    }
    return VoiceChatSessions.instance;
  }
  async start(controller, context2) {
    this.stop();
    ChatSynthesizerSessions.getInstance(this.instantiationService).stop();
    let disableTimeout = false;
    const sessionId = ++this.voiceChatSessionIds;
    const session = this.currentVoiceChatSession = {
      id: sessionId,
      controller,
      hasRecognizedInput: false,
      disposables: new DisposableStore(),
      setTimeoutDisabled: (disabled) => {
        disableTimeout = disabled;
      },
      accept: () => this.accept(sessionId),
      stop: () => this.stop(sessionId, controller.context)
    };
    const cts = new CancellationTokenSource();
    session.disposables.add(toDisposable(() => cts.dispose(true)));
    session.disposables.add(controller.onDidAcceptInput(() => this.stop(sessionId, controller.context)));
    session.disposables.add(controller.onDidHideInput(() => this.stop(sessionId, controller.context)));
    controller.focusInput();
    controller.updateState(2 /* GettingReady */);
    const voiceChatSession = await this.voiceChatService.createVoiceChatSession(cts.token, { usesAgents: controller.context !== "inline", model: context2?.widget?.viewModel?.model });
    let inputValue = controller.getInput();
    let voiceChatTimeout = this.configurationService.getValue("accessibility.voice.speechTimeout" /* SpeechTimeout */);
    if (!isNumber(voiceChatTimeout) || voiceChatTimeout < 0) {
      voiceChatTimeout = SpeechTimeoutDefault;
    }
    const acceptTranscriptionScheduler = session.disposables.add(new RunOnceScheduler(() => this.accept(sessionId), voiceChatTimeout));
    session.disposables.add(voiceChatSession.onDidChange(({ status: status2, text: text2, waitingForInput }) => {
      if (cts.token.isCancellationRequested) {
        return;
      }
      switch (status2) {
        case 1 /* Started */:
          this.onDidSpeechToTextSessionStart(controller, session.disposables);
          break;
        case 2 /* Recognizing */:
          if (text2) {
            session.hasRecognizedInput = true;
            session.controller.updateInput(inputValue ? [inputValue, text2].join(" ") : text2);
            if (voiceChatTimeout > 0 && context2?.voice?.disableTimeout !== true && !disableTimeout) {
              acceptTranscriptionScheduler.cancel();
            }
          }
          break;
        case 3 /* Recognized */:
          if (text2) {
            session.hasRecognizedInput = true;
            inputValue = inputValue ? [inputValue, text2].join(" ") : text2;
            session.controller.updateInput(inputValue);
            if (voiceChatTimeout > 0 && context2?.voice?.disableTimeout !== true && !waitingForInput && !disableTimeout) {
              acceptTranscriptionScheduler.schedule();
            }
          }
          break;
        case 4 /* Stopped */:
          this.stop(session.id, controller.context);
          break;
      }
    }));
    return session;
  }
  onDidSpeechToTextSessionStart(controller, disposables) {
    controller.updateState(3 /* Started */);
    let dotCount = 0;
    const updatePlaceholder = () => {
      dotCount = (dotCount + 1) % 4;
      controller.setInputPlaceholder(`${localize(13545, null)}${".".repeat(dotCount)}`);
      placeholderScheduler.schedule();
    };
    const placeholderScheduler = disposables.add(new RunOnceScheduler(updatePlaceholder, 500));
    updatePlaceholder();
  }
  stop(voiceChatSessionId = this.voiceChatSessionIds, context2) {
    if (!this.currentVoiceChatSession || this.voiceChatSessionIds !== voiceChatSessionId || context2 && this.currentVoiceChatSession.controller.context !== context2) {
      return;
    }
    this.currentVoiceChatSession.controller.clearInputPlaceholder();
    this.currentVoiceChatSession.controller.updateState(1 /* Stopped */);
    this.currentVoiceChatSession.disposables.dispose();
    this.currentVoiceChatSession = void 0;
  }
  async accept(voiceChatSessionId = this.voiceChatSessionIds) {
    if (!this.currentVoiceChatSession || this.voiceChatSessionIds !== voiceChatSessionId) {
      return;
    }
    if (!this.currentVoiceChatSession.hasRecognizedInput) {
      this.stop(voiceChatSessionId, this.currentVoiceChatSession.controller.context);
      return;
    }
    const controller = this.currentVoiceChatSession.controller;
    const response = await controller.acceptInput();
    if (!response) {
      return;
    }
    const autoSynthesize = this.configurationService.getValue("accessibility.voice.autoSynthesize" /* AutoSynthesize */);
    if (autoSynthesize === "on" || autoSynthesize !== "off" && !this.accessibilityService.isScreenReaderOptimized()) {
      let context2;
      if (controller.context === "inline") {
        context2 = "focused";
      } else {
        context2 = controller;
      }
      ChatSynthesizerSessions.getInstance(this.instantiationService).start(this.instantiationService.invokeFunction((accessor) => ChatSynthesizerSessionController.create(accessor, context2, response)));
    }
  }
};

VoiceChatSessions = __decorateClass([
  __decorateParam(0, IVoiceChatService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IAccessibilityService)
], VoiceChatSessions);

var VOICE_KEY_HOLD_THRESHOLD = 500;

async function startVoiceChatWithHoldMode(id2, accessor, target, context2) {
  const instantiationService = accessor.get(IInstantiationService);
  const keybindingService = accessor.get(IKeybindingService);
  const holdMode = keybindingService.enableKeybindingHoldMode(id2);
  const controller = await VoiceChatSessionControllerFactory.create(accessor, target);
  if (!controller) {
    return;
  }
  const session = await VoiceChatSessions.getInstance(instantiationService).start(controller, context2);
  let acceptVoice = false;
  const handle2 = disposableTimeout(() => {
    acceptVoice = true;
    session?.setTimeoutDisabled(true);
  }, VOICE_KEY_HOLD_THRESHOLD);
  await holdMode;
  handle2.dispose();
  if (acceptVoice) {
    session.accept();
  }
}

var VoiceChatWithHoldModeAction = class extends Action2 {
  constructor(desc, target) {
    super(desc);
    this.target = target;
  }
  run(accessor, context2) {
    return startVoiceChatWithHoldMode(this.desc.id, accessor, this.target, context2);
  }
};

var VoiceChatInChatViewAction = class _VoiceChatInChatViewAction extends VoiceChatWithHoldModeAction {
  static {
    this.ID = "workbench.action.chat.voiceChatInChatView";
  }
  constructor() {
    super({
      id: _VoiceChatInChatViewAction.ID,
      title: localize2(13563, "Voice Chat in Chat View"),
      category: CHAT_CATEGORY,
      precondition: CanVoiceChat,
      f1: true
    }, "view");
  }
};

var HoldToVoiceChatInChatViewAction = class _HoldToVoiceChatInChatViewAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.holdToVoiceChatInChatView";
  }
  constructor() {
    super({
      id: _HoldToVoiceChatInChatViewAction.ID,
      title: localize2(13555, "Hold to Voice Chat in Chat View"),
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: ContextKeyExpr.and(
          CanVoiceChat,
          ChatContextKeys.requestInProgress.negate(),
          // disable when a chat request is in progress
          FocusInChatInput?.negate(),
          // when already in chat input, disable this action and prefer to start voice chat directly
          EditorContextKeys.focus.negate(),
          // do not steal the inline-chat keybinding
          NOTEBOOK_EDITOR_FOCUSED.negate(),
          // do not steal the notebook keybinding
          SearchContext.SearchViewFocusedKey.negate(),
          // do not steal the search keybinding
          CONTEXT_SETTINGS_EDITOR.negate()
          // do not steal the settings editor keybinding
        ),
        primary: 2048 /* CtrlCmd */ | 39 /* KeyI */
      }
    });
  }
  async run(accessor, context2) {
    const instantiationService = accessor.get(IInstantiationService);
    const keybindingService = accessor.get(IKeybindingService);
    const widgetService = accessor.get(IChatWidgetService);
    const holdMode = keybindingService.enableKeybindingHoldMode(_HoldToVoiceChatInChatViewAction.ID);
    let session;
    const handle2 = disposableTimeout(async () => {
      const controller = await VoiceChatSessionControllerFactory.create(accessor, "view");
      if (controller) {
        session = await VoiceChatSessions.getInstance(instantiationService).start(controller, context2);
        session.setTimeoutDisabled(true);
      }
    }, VOICE_KEY_HOLD_THRESHOLD);
    (await widgetService.revealWidget())?.focusInput();
    await holdMode;
    handle2.dispose();
    if (session) {
      session.accept();
    }
  }
};

var InlineVoiceChatAction = class _InlineVoiceChatAction extends VoiceChatWithHoldModeAction {
  static {
    this.ID = "workbench.action.chat.inlineVoiceChat";
  }
  constructor() {
    super({
      id: _InlineVoiceChatAction.ID,
      title: localize2(13556, "Inline Voice Chat"),
      category: CHAT_CATEGORY,
      precondition: ContextKeyExpr.and(
        CanVoiceChat,
        ActiveEditorContext
      ),
      f1: true
    }, "inline");
  }
};

var QuickVoiceChatAction = class _QuickVoiceChatAction extends VoiceChatWithHoldModeAction {
  static {
    this.ID = "workbench.action.chat.quickVoiceChat";
  }
  constructor() {
    super({
      id: _QuickVoiceChatAction.ID,
      title: localize2(13557, "Quick Voice Chat"),
      category: CHAT_CATEGORY,
      precondition: CanVoiceChat,
      f1: true
    }, "quick");
  }
};

var primaryVoiceActionMenu = (when, chatLocationOnlyWhen) => {
  return [
    {
      id: MenuId.ChatExecute,
      when: ContextKeyExpr.and(ChatContextKeys.location.isEqualTo("panel" /* Chat */), when, chatLocationOnlyWhen),
      group: "navigation",
      order: 3
    },
    {
      id: MenuId.ChatExecute,
      when: ContextKeyExpr.and(ChatContextKeys.location.isEqualTo("panel" /* Chat */).negate(), when),
      group: "navigation",
      order: 2
    }
  ];
};

var StartVoiceChatAction = class _StartVoiceChatAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.startVoiceChat";
  }
  constructor() {
    super({
      id: _StartVoiceChatAction.ID,
      title: localize2(13559, "Start Voice Chat"),
      category: CHAT_CATEGORY,
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: ContextKeyExpr.and(
          FocusInChatInput,
          // scope this action to chat input fields only
          EditorContextKeys.focus.negate(),
          // do not steal the editor inline-chat keybinding
          NOTEBOOK_EDITOR_FOCUSED.negate(),
          // do not steal the notebook inline-chat keybinding
          ChatContextKeys.speechToTextConfigured.negate()
          // built-in on-device dictation wins: yield the keybinding when it's available so it does not collide with the built-in dictation keybinding
        ),
        primary: 2048 /* CtrlCmd */ | 39 /* KeyI */
      },
      icon: Codicon.mic,
      precondition: ContextKeyExpr.and(
        CanVoiceChat,
        ScopedVoiceChatGettingReady.negate(),
        // disable when voice chat is getting ready
        SpeechToTextInProgress.negate()
        // disable when speech to text is in progress
      ),
      menu: primaryVoiceActionMenu(ContextKeyExpr.and(
        HasSpeechProvider,
        ChatContextKeys.speechToTextConfigured.negate(),
        // built-in on-device dictation wins: hide the extension mic when it's available so only one mic shows
        ScopedChatSynthesisInProgress.negate(),
        // hide when text to speech is in progress
        AnyScopedVoiceChatInProgress?.negate()
        // hide when voice chat is in progress
      ), SegmentedVoiceInputModePillInactive)
      // only hide in the main Chat location, where the segmented toggle provides a replacement; keep the mic in inline/quick chat
    });
  }
  async run(accessor, context2) {
    const widget = context2?.widget;
    if (widget) {
      widget.focusInput();
    }
    return startVoiceChatWithHoldMode(this.desc.id, accessor, "focused", context2);
  }
};

var StopListeningAction = class _StopListeningAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.stopListening";
  }
  constructor() {
    super({
      id: _StopListeningAction.ID,
      title: localize2(13560, "Stop Listening"),
      category: CHAT_CATEGORY,
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */ + 100,
        primary: 9 /* Escape */,
        when: AnyScopedVoiceChatInProgress
      },
      icon: spinningLoading,
      precondition: VoiceChatInProgress,
      // need global context here because of `f1: true`
      menu: primaryVoiceActionMenu(AnyScopedVoiceChatInProgress, SegmentedVoiceInputModePillInactive)
    });
  }
  async run(accessor) {
    VoiceChatSessions.getInstance(accessor.get(IInstantiationService)).stop();
  }
};

var StopListeningAndSubmitAction = class _StopListeningAndSubmitAction extends Action2 {
  static {
    this.ID = "workbench.action.chat.stopListeningAndSubmit";
  }
  constructor() {
    super({
      id: _StopListeningAndSubmitAction.ID,
      title: localize2(13561, "Stop Listening and Submit"),
      category: CHAT_CATEGORY,
      f1: true,
      keybinding: {
        weight: 200 /* WorkbenchContrib */,
        when: ContextKeyExpr.and(
          FocusInChatInput,
          AnyScopedVoiceChatInProgress
        ),
        primary: 2048 /* CtrlCmd */ | 39 /* KeyI */
      },
      precondition: VoiceChatInProgress
      // need global context here because of `f1: true`
    });
  }
  run(accessor) {
    VoiceChatSessions.getInstance(accessor.get(IInstantiationService)).accept();
  }
};

var ScopedChatSynthesisInProgress = new RawContextKey("scopedChatSynthesisInProgress", false, { type: "boolean", description: localize(13546, null) });

var ChatSynthesizerSessionController = class _ChatSynthesizerSessionController {
  static create(accessor, context2, response) {
    if (context2 === "focused") {
      return _ChatSynthesizerSessionController.doCreateForFocusedChat(accessor, response);
    } else {
      return {
        onDidHideChat: context2.onDidHideInput,
        contextKeyService: context2.scopedContextKeyService,
        response
      };
    }
  }
  static doCreateForFocusedChat(accessor, response) {
    const chatWidgetService = accessor.get(IChatWidgetService);
    const contextKeyService = accessor.get(IContextKeyService);
    let chatWidget = chatWidgetService.getWidgetBySessionResource(response.session.sessionResource);
    if (chatWidget?.location === "editor" /* EditorInline */) {
      chatWidget = chatWidgetService.lastFocusedWidget;
    }
    return {
      onDidHideChat: chatWidget?.onDidHide ?? Event2.None,
      contextKeyService: chatWidget?.scopedContextKeyService ?? contextKeyService,
      response
    };
  }
};

var ChatSynthesizerSessions = class {
  constructor(speechService, configurationService, instantiationService) {
    this.speechService = speechService;
    this.configurationService = configurationService;
    this.instantiationService = instantiationService;
    this.activeSession = void 0;
  }
  static {
    this.instance = void 0;
  }
  static getInstance(instantiationService) {
    if (!ChatSynthesizerSessions.instance) {
      ChatSynthesizerSessions.instance = instantiationService.createInstance(ChatSynthesizerSessions);
    }
    return ChatSynthesizerSessions.instance;
  }
  async start(controller) {
    this.stop();
    VoiceChatSessions.getInstance(this.instantiationService).stop();
    const activeSession = this.activeSession = new CancellationTokenSource();
    const disposables = new DisposableStore();
    disposables.add(activeSession.token.onCancellationRequested(() => disposables.dispose()));
    const session = await this.speechService.createTextToSpeechSession(activeSession.token, "chat");
    if (activeSession.token.isCancellationRequested) {
      return;
    }
    disposables.add(controller.onDidHideChat(() => this.stop()));
    const scopedChatToSpeechInProgress = ScopedChatSynthesisInProgress.bindTo(controller.contextKeyService);
    disposables.add(toDisposable(() => scopedChatToSpeechInProgress.reset()));
    disposables.add(session.onDidChange((e) => {
      switch (e.status) {
        case 1 /* Started */:
          scopedChatToSpeechInProgress.set(true);
          break;
        case 2 /* Stopped */:
          scopedChatToSpeechInProgress.reset();
          break;
      }
    }));
    for await (const chunk of this.nextChatResponseChunk(controller.response, activeSession.token)) {
      if (activeSession.token.isCancellationRequested) {
        return;
      }
      await raceCancellation(session.synthesize(chunk), activeSession.token);
    }
  }
  async *nextChatResponseChunk(response, token) {
    const context2 = {
      ignoreCodeBlocks: this.configurationService.getValue("accessibility.voice.ignoreCodeBlocks" /* IgnoreCodeBlocks */),
      insideCodeBlock: false
    };
    let totalOffset = 0;
    let complete = false;
    do {
      const responseLength = response.response.toString().length;
      const { chunk, offset } = this.parseNextChatResponseChunk(response, totalOffset, context2);
      totalOffset = offset;
      complete = response.isComplete;
      if (chunk) {
        yield chunk;
      }
      if (token.isCancellationRequested) {
        return;
      }
      if (!complete && responseLength === response.response.toString().length) {
        await raceCancellation(Event2.toPromise(response.onDidChange), token);
      }
    } while (!token.isCancellationRequested && !complete);
  }
  parseNextChatResponseChunk(response, offset, context2) {
    let chunk = void 0;
    const text2 = response.response.toString();
    if (response.isComplete) {
      chunk = text2.substring(offset);
      offset = text2.length + 1;
    } else {
      const res = parseNextChatResponseChunk(text2, offset);
      chunk = res.chunk;
      offset = res.offset;
    }
    if (chunk && context2.ignoreCodeBlocks) {
      chunk = this.filterCodeBlocks(chunk, context2);
    }
    return {
      chunk: chunk ? renderAsPlaintext({ value: chunk }) : chunk,
      // convert markdown to plain text
      offset
    };
  }
  filterCodeBlocks(chunk, context2) {
    return chunk.split("\n").filter((line) => {
      if (line.trimStart().startsWith("```")) {
        context2.insideCodeBlock = !context2.insideCodeBlock;
        return false;
      }
      return !context2.insideCodeBlock;
    }).join("\n");
  }
  stop() {
    this.activeSession?.dispose(true);
    this.activeSession = void 0;
  }
};

ChatSynthesizerSessions = __decorateClass([
  __decorateParam(0, ISpeechService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IInstantiationService)
], ChatSynthesizerSessions);

var sentenceDelimiter = [".", "!", "?", ":"];

var lineDelimiter3 = "\n";

var wordDelimiter = " ";

function parseNextChatResponseChunk(text2, offset) {
  let chunk = void 0;
  for (let i2 = text2.length - 1; i2 >= offset; i2--) {
    const cur = text2[i2];
    const next = text2[i2 + 1];
    if (sentenceDelimiter.includes(cur) && next === wordDelimiter || // end of sentence
    lineDelimiter3 === cur) {
      chunk = text2.substring(offset, i2 + 1).trim();
      offset = i2 + 1;
      break;
    }
  }
  return { chunk, offset };
}

var ReadChatResponseAloud = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.chat.readChatResponseAloud",
      title: localize2(13558, "Read Aloud"),
      icon: Codicon.unmute,
      precondition: CanVoiceChat,
      menu: [{
        id: MenuId.ChatMessageFooter,
        when: ContextKeyExpr.and(
          CanVoiceChat,
          ChatContextKeys.isResponse,
          // only for responses
          ScopedChatSynthesisInProgress.negate(),
          // but not when already in progress
          ChatContextKeys.responseIsFiltered.negate()
          // and not when response is filtered
        ),
        group: "navigation",
        order: -10
        // first
      }, {
        id: MENU_INLINE_CHAT_WIDGET_SECONDARY,
        when: ContextKeyExpr.and(
          CanVoiceChat,
          ChatContextKeys.isResponse,
          // only for responses
          ScopedChatSynthesisInProgress.negate(),
          // but not when already in progress
          ChatContextKeys.responseIsFiltered.negate()
          // and not when response is filtered
        ),
        group: "navigation",
        order: -10
        // first
      }]
    });
  }
  run(accessor, ...args2) {
    const instantiationService = accessor.get(IInstantiationService);
    const chatWidgetService = accessor.get(IChatWidgetService);
    let response = void 0;
    if (args2.length > 0) {
      const responseArg = args2[0];
      if (isResponseVM(responseArg)) {
        response = responseArg;
      }
    } else {
      const chatWidget = chatWidgetService.lastFocusedWidget;
      if (chatWidget) {
        const focus = chatWidget.getFocus();
        if (focus instanceof ChatResponseViewModel) {
          response = focus;
        } else {
          const chatViewModel = chatWidget.viewModel;
          if (chatViewModel) {
            const items = chatViewModel.getItems();
            for (let i2 = items.length - 1; i2 >= 0; i2--) {
              const item = items[i2];
              if (isResponseVM(item)) {
                response = item;
                break;
              }
            }
          }
        }
      }
    }
    if (!response) {
      return;
    }
    const controller = ChatSynthesizerSessionController.create(accessor, "focused", response.model);
    ChatSynthesizerSessions.getInstance(instantiationService).start(controller);
  }
};

var StopReadAloud = class _StopReadAloud extends Action2 {
  static {
    this.ID = "workbench.action.speech.stopReadAloud";
  }
  constructor() {
    super({
      id: _StopReadAloud.ID,
      icon: syncing,
      title: localize2(13564, "Stop Reading Aloud"),
      f1: true,
      category: CHAT_CATEGORY,
      precondition: TextToSpeechInProgress,
      // need global context here because of `f1: true`
      keybinding: {
        weight: 200 /* WorkbenchContrib */ + 100,
        primary: 9 /* Escape */,
        when: ScopedChatSynthesisInProgress
      },
      menu: primaryVoiceActionMenu(ScopedChatSynthesisInProgress)
    });
  }
  async run(accessor) {
    ChatSynthesizerSessions.getInstance(accessor.get(IInstantiationService)).stop();
  }
};

var StopReadChatItemAloud = class _StopReadChatItemAloud extends Action2 {
  static {
    this.ID = "workbench.action.chat.stopReadChatItemAloud";
  }
  constructor() {
    super({
      id: _StopReadChatItemAloud.ID,
      icon: Codicon.mute,
      title: localize2(13562, "Stop Reading Aloud"),
      precondition: ScopedChatSynthesisInProgress,
      keybinding: {
        weight: 200 /* WorkbenchContrib */ + 100,
        primary: 9 /* Escape */
      },
      menu: [
        {
          id: MenuId.ChatMessageFooter,
          when: ContextKeyExpr.and(
            ScopedChatSynthesisInProgress,
            // only when in progress
            ChatContextKeys.isResponse,
            // only for responses
            ChatContextKeys.responseIsFiltered.negate()
            // but not when response is filtered
          ),
          group: "navigation",
          order: -10
          // first
        },
        {
          id: MENU_INLINE_CHAT_WIDGET_SECONDARY,
          when: ContextKeyExpr.and(
            ScopedChatSynthesisInProgress,
            // only when in progress
            ChatContextKeys.isResponse,
            // only for responses
            ChatContextKeys.responseIsFiltered.negate()
            // but not when response is filtered
          ),
          group: "navigation",
          order: -10
          // first
        }
      ]
    });
  }
  async run(accessor, ...args2) {
    ChatSynthesizerSessions.getInstance(accessor.get(IInstantiationService)).stop();
  }
};

function supportsKeywordActivation(configurationService, speechService, chatAgentService) {
  if (!speechService.hasSpeechProvider || !chatAgentService.getDefaultAgent("panel" /* Chat */)) {
    return false;
  }
  const value2 = configurationService.getValue(KEYWORD_ACTIVIATION_SETTING_ID);
  return typeof value2 === "string" && value2 !== KeywordActivationContribution.SETTINGS_VALUE.OFF;
}

var KeywordActivationContribution = class extends Disposable {
  constructor(speechService, configurationService, commandService, instantiationService, editorService, hostService, chatAgentService) {
    super();
    this.speechService = speechService;
    this.configurationService = configurationService;
    this.commandService = commandService;
    this.editorService = editorService;
    this.hostService = hostService;
    this.chatAgentService = chatAgentService;
    this.activeSession = void 0;
    this._register(instantiationService.createInstance(KeywordActivationStatusEntry));
    this.registerListeners();
  }
  static {
    this.ID = "workbench.contrib.keywordActivation";
  }
  static {
    this.SETTINGS_VALUE = {
      OFF: "off",
      INLINE_CHAT: "inlineChat",
      QUICK_CHAT: "quickChat",
      VIEW_CHAT: "chatInView",
      CHAT_IN_CONTEXT: "chatInContext"
    };
  }
  registerListeners() {
    this._register(Event2.runAndSubscribe(this.speechService.onDidChangeHasSpeechProvider, () => {
      this.updateConfiguration();
      this.handleKeywordActivation();
    }));
    const onDidAddDefaultAgent = this._register(this.chatAgentService.onDidChangeAgents(() => {
      if (this.chatAgentService.getDefaultAgent("panel" /* Chat */)) {
        this.updateConfiguration();
        this.handleKeywordActivation();
        onDidAddDefaultAgent.dispose();
      }
    }));
    this._register(this.speechService.onDidStartSpeechToTextSession(() => this.handleKeywordActivation()));
    this._register(this.speechService.onDidEndSpeechToTextSession(() => this.handleKeywordActivation()));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(KEYWORD_ACTIVIATION_SETTING_ID)) {
        this.handleKeywordActivation();
      }
    }));
  }
  updateConfiguration() {
    if (!this.speechService.hasSpeechProvider || !this.chatAgentService.getDefaultAgent("panel" /* Chat */)) {
      return;
    }
    const registry4 = Registry.as(Extensions4.Configuration);
    registry4.registerConfiguration({
      ...accessibilityConfigurationNodeBase,
      properties: {
        [KEYWORD_ACTIVIATION_SETTING_ID]: {
          "type": "string",
          "enum": [
            KeywordActivationContribution.SETTINGS_VALUE.OFF,
            KeywordActivationContribution.SETTINGS_VALUE.VIEW_CHAT,
            KeywordActivationContribution.SETTINGS_VALUE.QUICK_CHAT,
            KeywordActivationContribution.SETTINGS_VALUE.INLINE_CHAT,
            KeywordActivationContribution.SETTINGS_VALUE.CHAT_IN_CONTEXT
          ],
          "enumDescriptions": [
            localize(13553, null),
            localize(13551, null),
            localize(13554, null),
            localize(13552, null),
            localize(13550, null)
          ],
          "description": localize(13549, null),
          "default": "off",
          "tags": ["accessibility"]
        }
      }
    });
  }
  handleKeywordActivation() {
    const enabled = supportsKeywordActivation(this.configurationService, this.speechService, this.chatAgentService) && !this.speechService.hasActiveSpeechToTextSession;
    if (enabled && this.activeSession || !enabled && !this.activeSession) {
      return;
    }
    if (enabled) {
      this.enableKeywordActivation();
    } else {
      this.disableKeywordActivation();
    }
  }
  async enableKeywordActivation() {
    const session = this.activeSession = new CancellationTokenSource();
    const result = await this.speechService.recognizeKeyword(session.token);
    if (session.token.isCancellationRequested || session !== this.activeSession) {
      return;
    }
    this.activeSession = void 0;
    if (result === 1 /* Recognized */) {
      if (this.hostService.hasFocus) {
        this.commandService.executeCommand(this.getKeywordCommand());
      }
      this.handleKeywordActivation();
    }
  }
  getKeywordCommand() {
    const setting = this.configurationService.getValue(KEYWORD_ACTIVIATION_SETTING_ID);
    switch (setting) {
      case KeywordActivationContribution.SETTINGS_VALUE.INLINE_CHAT:
        return InlineVoiceChatAction.ID;
      case KeywordActivationContribution.SETTINGS_VALUE.QUICK_CHAT:
        return QuickVoiceChatAction.ID;
      case KeywordActivationContribution.SETTINGS_VALUE.CHAT_IN_CONTEXT: {
        const activeCodeEditor = getCodeEditor(this.editorService.activeTextEditorControl);
        if (activeCodeEditor?.hasWidgetFocus()) {
          return InlineVoiceChatAction.ID;
        }
      }
      default:
        return VoiceChatInChatViewAction.ID;
    }
  }
  disableKeywordActivation() {
    this.activeSession?.dispose(true);
    this.activeSession = void 0;
  }
  dispose() {
    this.activeSession?.dispose();
    super.dispose();
  }
};

KeywordActivationContribution = __decorateClass([
  __decorateParam(0, ISpeechService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IEditorService),
  __decorateParam(5, IHostService),
  __decorateParam(6, IChatAgentService)
], KeywordActivationContribution);

var KeywordActivationStatusEntry = class extends Disposable {
  constructor(speechService, statusbarService, commandService, configurationService, chatAgentService) {
    super();
    this.speechService = speechService;
    this.statusbarService = statusbarService;
    this.commandService = commandService;
    this.configurationService = configurationService;
    this.chatAgentService = chatAgentService;
    this.entry = this._register(new MutableDisposable());
    this._register(CommandsRegistry.registerCommand(KeywordActivationStatusEntry.STATUS_COMMAND, () => this.commandService.executeCommand("workbench.action.openSettings", KEYWORD_ACTIVIATION_SETTING_ID)));
    this.registerListeners();
    this.updateStatusEntry();
  }
  static {
    this.STATUS_NAME = localize(13544, null);
  }
  static {
    this.STATUS_COMMAND = "keywordActivation.status.command";
  }
  static {
    this.STATUS_ACTIVE = localize(13542, null);
  }
  static {
    this.STATUS_INACTIVE = localize(13543, null);
  }
  registerListeners() {
    this._register(this.speechService.onDidStartKeywordRecognition(() => this.updateStatusEntry()));
    this._register(this.speechService.onDidEndKeywordRecognition(() => this.updateStatusEntry()));
    this._register(this.configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(KEYWORD_ACTIVIATION_SETTING_ID)) {
        this.updateStatusEntry();
      }
    }));
  }
  updateStatusEntry() {
    const visible = supportsKeywordActivation(this.configurationService, this.speechService, this.chatAgentService);
    if (visible) {
      if (!this.entry.value) {
        this.createStatusEntry();
      }
      this.updateStatusLabel();
    } else {
      this.entry.clear();
    }
  }
  createStatusEntry() {
    this.entry.value = this.statusbarService.addEntry(this.getStatusEntryProperties(), "status.voiceKeywordActivation", 1 /* RIGHT */, 103);
  }
  getStatusEntryProperties() {
    return {
      name: KeywordActivationStatusEntry.STATUS_NAME,
      text: this.speechService.hasActiveKeywordRecognition ? "$(mic-filled)" : "$(mic)",
      tooltip: this.speechService.hasActiveKeywordRecognition ? KeywordActivationStatusEntry.STATUS_ACTIVE : KeywordActivationStatusEntry.STATUS_INACTIVE,
      ariaLabel: this.speechService.hasActiveKeywordRecognition ? KeywordActivationStatusEntry.STATUS_ACTIVE : KeywordActivationStatusEntry.STATUS_INACTIVE,
      command: KeywordActivationStatusEntry.STATUS_COMMAND,
      kind: "prominent",
      showInAllWindows: true
    };
  }
  updateStatusLabel() {
    this.entry.value?.update(this.getStatusEntryProperties());
  }
};

KeywordActivationStatusEntry = __decorateClass([
  __decorateParam(0, ISpeechService),
  __decorateParam(1, IStatusbarService),
  __decorateParam(2, ICommandService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IChatAgentService)
], KeywordActivationStatusEntry);

registerThemingParticipant((theme, collector) => {
  let activeRecordingColor;
  let activeRecordingDimmedColor;
  if (!isHighContrast(theme.type)) {
    activeRecordingColor = theme.getColor(editorInfoForeground) ?? theme.getColor(focusBorder);
    activeRecordingDimmedColor = activeRecordingColor?.transparent(0.38);
  } else {
    activeRecordingColor = theme.getColor(contrastBorder);
    activeRecordingDimmedColor = theme.getColor(contrastBorder);
  }
  collector.addRule(`
		.monaco-workbench.monaco-enable-motion .interactive-input-part .monaco-action-bar .action-label.codicon-sync.codicon-modifier-spin:not(.disabled),
		.monaco-workbench.monaco-enable-motion .interactive-input-part .monaco-action-bar .action-label.codicon-loading.codicon-modifier-spin:not(.disabled) {
			color: ${activeRecordingColor};
			outline: 1px solid ${activeRecordingColor};
			outline-offset: -1px;
			animation: pulseAnimation 1s infinite;
			border-radius: 50%;
		}

		.monaco-workbench.monaco-enable-motion .interactive-input-part .monaco-action-bar .action-label.codicon-sync.codicon-modifier-spin:not(.disabled)::before,
		.monaco-workbench.monaco-enable-motion .interactive-input-part .monaco-action-bar .action-label.codicon-loading.codicon-modifier-spin:not(.disabled)::before {
			position: absolute;
			outline: 1px solid ${activeRecordingColor};
			outline-offset: 2px;
			border-radius: 50%;
			width: 16px;
			height: 16px;
		}

		.monaco-workbench.monaco-enable-motion .interactive-input-part .monaco-action-bar .action-label.codicon-sync.codicon-modifier-spin:not(.disabled)::after,
		.monaco-workbench.monaco-enable-motion .interactive-input-part .monaco-action-bar .action-label.codicon-loading.codicon-modifier-spin:not(.disabled)::after {
			outline: 2px solid ${activeRecordingColor};
			outline-offset: -1px;
			animation: pulseAnimation 1500ms cubic-bezier(0.75, 0, 0.25, 1) infinite;
		}

		@keyframes pulseAnimation {
			0% {
				outline-width: 2px;
			}
			62% {
				outline-width: 5px;
				outline-color: ${activeRecordingDimmedColor};
			}
			100% {
				outline-width: 2px;
			}
		}
	`);
});
export { startVoiceChatWithHoldMode, parseNextChatResponseChunk, supportsKeywordActivation, VoiceChatSessionContexts, CanVoiceChat, FocusInChatInput, ScopedVoiceChatGettingReady, ScopedVoiceChatInProgress, AnyScopedVoiceChatInProgress, VoiceChatSessionControllerFactory, VoiceChatSessions, VOICE_KEY_HOLD_THRESHOLD, VoiceChatWithHoldModeAction, VoiceChatInChatViewAction, HoldToVoiceChatInChatViewAction, InlineVoiceChatAction, QuickVoiceChatAction, primaryVoiceActionMenu, StartVoiceChatAction, StopListeningAction, StopListeningAndSubmitAction, ScopedChatSynthesisInProgress, ChatSynthesizerSessionController, ChatSynthesizerSessions, sentenceDelimiter, lineDelimiter3, wordDelimiter, ReadChatResponseAloud, StopReadAloud, StopReadChatItemAloud, KeywordActivationContribution, KeywordActivationStatusEntry };
