// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/chatView.ts
import { getSessionStatusMessage, isActiveSessionStatus } from "./module-1767.mjs";
import { AbstractChatView } from "./module-3552.mjs";
import { observableValue } from "./module-0048.mjs";
import { NewChatInSessionWidget } from "./module-3615.mjs";
import { NewChatWidget } from "./module-3614.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { MutableDisposable, toDisposable } from "./module-0012.mjs";
import { $, EventHelper, EventType, addDisposableListener, getWindow, isHTMLElement, size } from "./module-0075.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ChatWidget, chatPersistentContentVisibleClass } from "./module-2369.mjs";
import { SESSION_CHAT_INPUT_TOOLBAR_HEIGHT, SessionChatInputToolbar } from "./module-3626.mjs";
import { isHighContrast } from "./module-0247.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { Menus } from "./module-3437.mjs";
import { ExternalSessionBanner } from "./module-3633.mjs";
import { autorun } from "./module-0052.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { ResponseSelectionSideChatController } from "./module-3630.mjs";
import { SessionInputBanners } from "./module-3617.mjs";
import { AGENT_SESSIONS_SCOPED_INPUT_HISTORY_SETTING } from "./module-3577.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { renderAsPlaintext } from "./module-0468.mjs";
import { activeSessionViewBackground, activeSessionViewForeground, agentsPanelBackground, inactiveSessionViewBackground, inactiveSessionViewForeground } from "./module-1496.mjs";
import { scrollbarShadow } from "./module-0228.mjs";
import { EDITOR_DRAG_AND_DROP_BACKGROUND } from "./module-0868.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { getChatSessionType } from "./module-0962.mjs";
import { setModelPreservingInputTypedWhileLoading } from "./module-0982.mjs";
import { IChatSessionsService, localChatSessionType } from "./module-0961.mjs";
import { setupVoiceInputDecorations } from "./module-2893.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IChatService } from "./module-0973.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILogService } from "./module-0095.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { IVoiceSessionController } from "./module-2070.mjs";
import { IMicCaptureService } from "./module-1345.mjs";
import { ITtsPlaybackService } from "./module-2063.mjs";
import { ISessionChatPillsDebugService } from "./module-3631.mjs";
import { INewChatVoiceTargetService } from "./module-2894.mjs";
import { ISessionsChatViewStateService } from "./module-3632.mjs";
import { ISessionOpenTelemetryService } from "./module-1782.mjs";
import { isChatTranscriptContextVariableEntry } from "./module-0980.mjs";


// src/vs/sessions/contrib/chat/browser/chatView.ts
function shouldShowSessionChatTip(sessionStatus) {
  return sessionStatus === void 0 || !isActiveSessionStatus(sessionStatus);
}

var NewChatView = class extends AbstractChatView {
  constructor(isNewChatInSession, options3, instantiationService) {
    super();
    this._isVisibleObs = observableValue(this, true);
    this.element.classList.add("chat-view-new");
    this.kind = isNewChatInSession ? "newChatInSession" : "newSession";
    const widgetOptions = { ...options3, petHostPreferred: this._isVisibleObs };
    this._widget = this._register(isNewChatInSession ? instantiationService.createInstance(NewChatInSessionWidget, widgetOptions) : instantiationService.createInstance(NewChatWidget, widgetOptions));
    this._widget.render(this.element);
  }
  static {
    this.TYPE = "sessions.newSession";
  }
  toJSON() {
    return { type: NewChatView.TYPE };
  }
  doLayout(width2, height, _top, _left) {
    this._widget.layout(height, width2);
  }
  focus() {
    this._widget.focusInput();
  }
  selectWorkspace(folderUri, providerId) {
    if (this._widget instanceof NewChatWidget) {
      this._widget.selectWorkspace(folderUri, providerId);
    }
  }
  prefillInput(text2) {
    if (this._widget instanceof NewChatWidget) {
      this._widget.prefillInput(text2);
    }
  }
  sendQuery(text2) {
    if (this._widget instanceof NewChatWidget) {
      this._widget.sendQuery(text2);
    }
  }
  submitInput() {
    return this._widget instanceof NewChatWidget ? this._widget.submitInput() : Promise.resolve(false);
  }
  attach(uris) {
    this._widget.attach(uris);
  }
  setVisible(visible) {
    this._isVisibleObs.set(visible, void 0);
    if (this._widget instanceof NewChatWidget) {
      this._widget.setHostVisible(visible);
    }
  }
};

NewChatView = __decorateClass([
  __decorateParam(2, IInstantiationService)
], NewChatView);

var ChatView = class extends AbstractChatView {
  constructor(instantiationService, contextKeyService, contextMenuService, chatService, chatSessionsService, configurationService, logService, keybindingService, themeService, accessibilityService, voiceSessionController, micCaptureService, ttsPlaybackService, chatPillsDebugService, newChatVoiceTargetService, viewStateService, sessionOpenTelemetryService) {
    super();
    this.contextMenuService = contextMenuService;
    this.chatService = chatService;
    this.chatSessionsService = chatSessionsService;
    this.configurationService = configurationService;
    this.logService = logService;
    this.keybindingService = keybindingService;
    this.themeService = themeService;
    this.accessibilityService = accessibilityService;
    this.voiceSessionController = voiceSessionController;
    this.micCaptureService = micCaptureService;
    this.ttsPlaybackService = ttsPlaybackService;
    this.chatPillsDebugService = chatPillsDebugService;
    this.newChatVoiceTargetService = newChatVoiceTargetService;
    this.viewStateService = viewStateService;
    this.sessionOpenTelemetryService = sessionOpenTelemetryService;
    this.kind = "chat";
    /** Reference to the loaded chat model; disposing releases the model. */
    this._modelRef = this._register(new MutableDisposable());
    /** Cancels any in-flight model load when a new session is set or the view disposes. */
    this._loadCts = this._register(new MutableDisposable());
    /** Tracks the current chat's interactivity and hides the input for read-only chats. */
    this._interactiveDisposable = this._register(new MutableDisposable());
    this._currentChatResourceObs = observableValue(this, void 0);
    this._currentSessionObs = observableValue(this, void 0);
    /** Whether this view currently represents the active session. */
    this._isActive = true;
    /** Observable mirror of {@link _isActive} so the voice overlay can react. */
    this._isActiveObs = observableValue(this, true);
    this._register(toDisposable(() => this._reportModelUnbound()));
    this.element.classList.add("chat-view-chat");
    this._widgetContainer = $(".chat-view-widget");
    this.element.appendChild(this._widgetContainer);
    const scopedContextKeyService = this._register(contextKeyService.createScoped(this.element));
    const scopedInstantiationService = this._register(instantiationService.createChild(
      new ServiceCollection([IContextKeyService, scopedContextKeyService])
    ));
    this._voiceInitiatedHereKey = scopedContextKeyService.createKey("agentsVoiceInitiatedHere", false);
    this._widget = this._register(scopedInstantiationService.createInstance(
      ChatWidget,
      "panel" /* Chat */,
      void 0,
      {
        autoScroll: (mode) => mode !== "ask" /* Ask */,
        renderFollowups: true,
        supportsFileReferences: true,
        rendererOptions: {
          referencesExpandedWhenEmptyResponse: false,
          progressMessageAtBottomOfResponse: (mode) => mode !== "ask" /* Ask */
        },
        enableImplicitContext: true,
        enableWorkingSet: "implicit",
        supportsChangingModes: true,
        inputEditorMinLines: 2,
        isSessionsWindow: true,
        enableFind: true,
        persistentContentHeight: SESSION_CHAT_INPUT_TOOLBAR_HEIGHT,
        renderGettingStartedTip: () => shouldShowSessionChatTip(this._currentSessionObs.get()?.status.get())
      },
      this._buildStyles(this._isActive)
    ));
    this._widget.render(this._widgetContainer, void 0, this._isActiveObs);
    const transcript = this._widget.transcriptDomNode;
    this._register(addDisposableListener(transcript, EventType.CONTEXT_MENU, (event) => {
      if (isHighContrast(this.themeService.getColorTheme().type)) {
        return;
      }
      const target = isHTMLElement(event.target) ? event.target : void 0;
      if (!target || target.closest(".monaco-list-row, .scrollbar")) {
        return;
      }
      EventHelper.stop(event, true);
      const anchor = new StandardMouseEvent(getWindow(transcript), event);
      this.contextMenuService.showContextMenu({
        menuId: Menus.SessionChatBackgroundContext,
        contextKeyService: scopedContextKeyService,
        getAnchor: () => anchor
      });
    }));
    this._externalSessionBanner = this._register(scopedInstantiationService.createInstance(
      ExternalSessionBanner,
      this.element,
      {
        onDidChangeLayout: () => this._layoutChatWidget(),
        onDidDismissWithFocus: () => this._widget.focusInput()
      }
    ));
    this.element.insertBefore(this._externalSessionBanner.domNode, this._widgetContainer);
    this._register(autorun((reader) => {
      const sessionStatus = this._currentSessionObs.read(reader)?.status.read(reader);
      if (!shouldShowSessionChatTip(sessionStatus)) {
        this._widget.updateGettingStartedTip();
      }
    }));
    const chatModel = observableFromEvent(this, this._widget.onDidChangeViewModel, () => this._widget.viewModel?.model);
    this._setupTranscriptPreparationProgress(chatModel);
    this._setupInitialTranscriptContext(chatModel);
    this._selectionSideChatController = this._register(scopedInstantiationService.createInstance(ResponseSelectionSideChatController, this._widget));
    this._banners = this._register(instantiationService.createInstance(SessionInputBanners));
    this._banners.setActive(this._isActive);
    this._chatPills = this._register(instantiationService.createInstance(SessionChatInputToolbar));
    const updateChatPillsVisibility = (visible) => {
      this._widget.inputPart.persistentContentContainerElement.classList.toggle(chatPersistentContentVisibleClass, visible);
    };
    this._register(this._chatPills.onDidChangeVisibility(updateChatPillsVisibility));
    updateChatPillsVisibility(this._chatPills.visible);
    this._register(this._widget.inputPart.registerChatPetHorizontalPlatformProvider({
      onDidChange: this._chatPills.onDidChangeChatPetPlatform,
      getElements: () => this._chatPills.getChatPetPlatformElements()
    }));
    this._register(chatPillsDebugService.register(this._chatPills, this._banners, this._isActiveObs));
    this._ensureBannersMounted();
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(AGENT_SESSIONS_SCOPED_INPUT_HISTORY_SETTING)) {
        this._applyHistoryKey();
      }
    }));
    this._setupVoiceOverlay();
    this._register(autorun((reader) => {
      const active = this._isActiveObs.read(reader);
      const voiceActive = this.voiceSessionController.isConnected.read(reader) || this.voiceSessionController.isConnecting.read(reader);
      const target = this.voiceSessionController.targetSession.read(reader);
      const hasDraftTarget = this.voiceSessionController.hasDraftTarget.read(reader);
      const current = this._currentChatResourceObs.read(reader);
      const ownsVoice = !hasDraftTarget && (!target || !!current && isEqual2(target, current));
      this._voiceInitiatedHereKey.set(active && voiceActive && ownsVoice);
    }));
  }
  static {
    this.TYPE = "sessions.session";
  }
  _setupTranscriptPreparationProgress(chatModel) {
    this._register(autorun((reader) => {
      const resource = this._currentChatResourceObs.read(reader);
      const session = this._currentSessionObs.read(reader);
      const statusMessage = session ? getSessionStatusMessage(session.status.read(reader), session.description.read(reader)) : void 0;
      const activity = typeof statusMessage === "string" ? statusMessage : statusMessage ? renderAsPlaintext(statusMessage) : void 0;
      const model = chatModel.read(reader);
      let showProgress;
      if (!resource) {
        showProgress = false;
      } else if (!model) {
        showProgress = true;
      } else {
        const requests = model.getRequests();
        const lastRequest2 = model.lastRequestObs.read(reader);
        const visibleRequestCount = requests.filter((request2) => !request2.isHiddenFromTranscript).length;
        const hiddenRequestIncomplete = lastRequest2?.isHiddenFromTranscript ? lastRequest2.response?.isIncomplete.read(reader) : void 0;
        showProgress = shouldShowTranscriptPreparationProgress(requests.length, visibleRequestCount, hiddenRequestIncomplete);
      }
      const progress = getTranscriptProgress(showProgress, activity);
      this._widget.setTranscriptProgress(progress, progress);
    }));
  }
  _setupInitialTranscriptContext(chatModel) {
    let currentEntryId;
    this._register(autorun((reader) => {
      const model = chatModel.read(reader);
      model?.lastRequestObs.read(reader);
      const requests = model?.getRequests() ?? [];
      const hasVisibleRequest = requests.some((request2) => !request2.isHiddenFromTranscript);
      const entry = hasVisibleRequest ? void 0 : findTranscriptContextEntry(requests.filter((request2) => request2.isHiddenFromTranscript));
      if (entry?.id === currentEntryId) {
        return;
      }
      currentEntryId = entry?.id;
      this._widget.setTranscriptContext(entry);
    }));
  }
  dispose() {
    this._saveCurrentViewState();
    this._loadCts.value?.cancel();
    super.dispose();
  }
  _buildStyles(active) {
    return {
      listForeground: active ? activeSessionViewForeground : inactiveSessionViewForeground,
      listBackground: active ? activeSessionViewBackground : inactiveSessionViewBackground,
      listShadow: scrollbarShadow,
      overlayBackground: EDITOR_DRAG_AND_DROP_BACKGROUND,
      inputEditorBackground: inactiveSessionViewBackground,
      resultEditorBackground: agentsPanelBackground
    };
  }
  /** The underlying chat widget. */
  get widget() {
    return this._widget;
  }
  setChat(chat, historyKey, session) {
    this.chatPillsDebugService.clear(this._chatPills);
    const previousSession = this._currentSessionObs.get();
    this._currentSessionObs.set(session, void 0);
    this._externalSessionBanner.setSession(session);
    const resource = chat.resource;
    const previousChatResource = this._currentChatResource;
    const chatChanged = !isEqual2(previousChatResource, resource);
    if (chatChanged) {
      this._saveCurrentViewState();
    }
    this._historyKey = historyKey;
    this._applyHistoryKey();
    this._chatPills.setChat(chat);
    this._selectionSideChatController.setChat(chat);
    this._banners.setDebugData(void 0);
    this._interactiveDisposable.value = autorun((reader) => {
      this._widget.setReadOnly(chat.interactivity.read(reader) !== "full" /* Full */);
    });
    if (!chatChanged) {
      if (previousSession && !isEqual2(previousSession.resource, session?.resource) && previousChatResource) {
        this.sessionOpenTelemetryService.modelUnbound(previousSession.resource, previousChatResource);
      }
      if (session && isEqual2(this._modelRef.value?.object.sessionResource, resource)) {
        this.sessionOpenTelemetryService.modelBound(session.resource, resource);
      }
      return;
    }
    this._currentChatResource = resource;
    this._currentChatResourceObs.set(resource, void 0);
    this.logService.trace(`[ChatView] setChat start uri=${resource.toString()} session=${session?.resource.toString()}`);
    this._loadCts.value?.cancel();
    if (previousChatResource) {
      this._clearCurrentChat(previousSession, previousChatResource);
    }
    const cts = new CancellationTokenSource();
    this._loadCts.value = cts;
    const token = cts.token;
    this._widget.setLoading(true);
    const inputBeforeLoad = this._widget.getInput();
    const loadPromise = this.chatService.acquireOrLoadSession(resource, "panel" /* Chat */, token, "ChatView").then((ref) => {
      const isCurrentChat = isEqual2(this._currentChatResource, resource);
      if (token.isCancellationRequested || !ref || !isCurrentChat) {
        ref?.dispose();
        if (!token.isCancellationRequested && !ref && isCurrentChat && session) {
          this.sessionOpenTelemetryService.modelBindFailed(session.resource, resource);
        }
        if (isCurrentChat) {
          this._widget.setLoading(false);
        }
        this.logService.trace(`[ChatView] setChat abandoned uri=${resource.toString()}`);
        return;
      }
      this.logService.trace(`[ChatView] setChat model loaded uri=${resource.toString()}`);
      this._modelRef.value = ref;
      this._updateWidgetLockState(getChatSessionType(ref.object.sessionResource));
      setModelPreservingInputTypedWhileLoading(this._widget, inputBeforeLoad, () => this._widget.setModel(ref.object));
      const widgetViewState = this.viewStateService.get(resource);
      if (widgetViewState) {
        this._widget.restoreViewState(widgetViewState);
      }
      this._widget.setLoading(false);
      if (session) {
        this.sessionOpenTelemetryService.modelBound(session.resource, resource);
      }
      this.element.dataset.boundChatResource = resource.toString();
      this.logService.trace(`[ChatView] setChat done uri=${resource.toString()}`);
    }, (err) => {
      if (!token.isCancellationRequested) {
        this.logService.error(`[ChatView] Failed to load chat model for chat uri=${resource.toString()}`, err);
      } else {
        this.logService.trace(`[ChatView] setChat cancelled uri=${resource.toString()}`);
      }
      if (isEqual2(this._currentChatResource, resource)) {
        this._currentChatResource = void 0;
        this._currentChatResourceObs.set(void 0, void 0);
        this._widget.setLoading(false);
      }
      if (!token.isCancellationRequested && session) {
        this.sessionOpenTelemetryService.modelBindFailed(session.resource, resource);
      }
    });
    this.showProgressWhile(loadPromise, 800);
    this._layoutChatWidget();
  }
  _saveCurrentViewState() {
    const resource = this._widget.viewModel?.sessionResource;
    if (resource) {
      this.viewStateService.set(resource, this._widget.getViewState());
    }
  }
  _clearCurrentChat(previousSession, previousChatResource) {
    if (previousSession) {
      this.sessionOpenTelemetryService.modelUnbound(previousSession.resource, previousChatResource);
    }
    this._widget.clear().catch((err) => this.logService.error("[ChatView] Failed to clear chat widget", err));
    this._widget.setModel(void 0);
    this._modelRef.clear();
    delete this.element.dataset.boundChatResource;
  }
  _reportModelUnbound() {
    const session = this._currentSessionObs.get();
    if (session && this._currentChatResource) {
      this.sessionOpenTelemetryService.modelUnbound(session.resource, this._currentChatResource);
    }
  }
  _applyHistoryKey() {
    const scopedHistory = this.configurationService.getValue(AGENT_SESSIONS_SCOPED_INPUT_HISTORY_SETTING) !== false;
    this._widget.inputPart.setHistoryKey(scopedHistory ? this._historyKey : void 0);
  }
  _updateWidgetLockState(sessionType) {
    if (sessionType === localChatSessionType) {
      this._widget.unlockFromCodingAgent();
      return;
    }
    const contribution = this.chatSessionsService.getChatSessionContribution(sessionType);
    if (contribution) {
      this._widget.lockToCodingAgent(contribution.name, contribution.displayName, sessionType, contribution.agentHostProviderId);
    } else {
      this._widget.unlockFromCodingAgent();
    }
  }
  toJSON() {
    return { type: ChatView.TYPE };
  }
  doLayout(width2, height, _top, _left) {
    this._lastLayout = { width: width2, height };
    this._ensureBannersMounted();
    this._layoutChatWidget();
  }
  _layoutChatWidget() {
    if (!this._lastLayout) {
      return;
    }
    const { width: width2, height } = this._lastLayout;
    const widgetTop = this._widgetContainer.offsetTop;
    const widgetHeight = Math.max(0, height - widgetTop);
    const progressContainer = Array.from(this.element.children).find((element) => element.classList.contains("monaco-progress-container"));
    if (isHTMLElement(progressContainer)) {
      progressContainer.style.top = `${widgetTop}px`;
    }
    size(this._widgetContainer, width2, widgetHeight);
    this._widget.layout(widgetHeight, width2);
  }
  /**
   * Mounts the status pills and session banners above the chat input.
   */
  _ensureBannersMounted() {
    const inputPartElement = this._widget.inputPart.element;
    const persistentContentContainer = this._widget.inputPart.persistentContentContainerElement;
    const pillsNode = this._chatPills.element;
    const bannersNode = this._banners.domNode;
    if (persistentContentContainer.firstChild !== pillsNode) {
      persistentContentContainer.insertBefore(pillsNode, persistentContentContainer.firstChild);
    }
    if (persistentContentContainer.nextSibling !== bannersNode) {
      inputPartElement.insertBefore(bannersNode, persistentContentContainer.nextSibling);
    }
  }
  //#region Voice overlay
  /**
   * Sets up this view's transcript overlay and input glow, mirroring `ChatViewPane`.
   * Shows only while voice is connected and targeting this active session.
   */
  _setupVoiceOverlay() {
    const inputContainerEl = this._widget.inputPart.inputContainerElement;
    if (!inputContainerEl) {
      return;
    }
    this._register(setupVoiceInputDecorations({
      voiceSessionController: this.voiceSessionController,
      ttsPlaybackService: this.ttsPlaybackService,
      micCaptureService: this.micCaptureService,
      configurationService: this.configurationService,
      keybindingService: this.keybindingService,
      themeService: this.themeService,
      accessibilityService: this.accessibilityService
    }, {
      inputContainer: inputContainerEl,
      isActive: this._isActiveObs,
      getCurrentResource: () => this._currentChatResource,
      currentVoiceInputResource: this.newChatVoiceTargetService.currentVoiceInputResource
    }));
  }
  //#endregion
  focus() {
    this._widget.focusInput();
  }
  attach(uris) {
    for (const uri4 of uris) {
      this._widget.attachmentModel.addFile(uri4).catch((err) => this.logService.error("[ChatView] Failed to attach file as context", err));
    }
  }
  setActive(active) {
    if (this._isActive === active) {
      return;
    }
    this._isActive = active;
    this._isActiveObs.set(active, void 0);
    this._banners.setActive(active);
    this._widget.setStyles(this._buildStyles(active));
  }
  setVisible(visible) {
    if (this._isVisible === visible) {
      return;
    }
    this._isVisible = visible;
    this._widget.setVisible(visible);
  }
};

ChatView = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IContextKeyService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IChatService),
  __decorateParam(4, IChatSessionsService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IKeybindingService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IAccessibilityService),
  __decorateParam(10, IVoiceSessionController),
  __decorateParam(11, IMicCaptureService),
  __decorateParam(12, ITtsPlaybackService),
  __decorateParam(13, ISessionChatPillsDebugService),
  __decorateParam(14, INewChatVoiceTargetService),
  __decorateParam(15, ISessionsChatViewStateService),
  __decorateParam(16, ISessionOpenTelemetryService)
], ChatView);

function shouldShowTranscriptPreparationProgress(requestCount, visibleRequestCount, hiddenRequestIncomplete) {
  return requestCount === 0 || visibleRequestCount === 0 && hiddenRequestIncomplete !== false;
}

function getTranscriptProgress(showProgress, activity) {
  if (!showProgress) {
    return void 0;
  }
  return activity?.trim() || void 0;
}

function findTranscriptContextEntry(requests) {
  for (const request2 of requests) {
    const entry = [...request2.variableData.variables, ...request2.attachedContext ?? []].find(isChatTranscriptContextVariableEntry);
    if (entry) {
      return entry;
    }
  }
  return void 0;
}

var ChatViewFactory = class {
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
  }
  createNewChatView(isNewChatInSession, options3) {
    return this.instantiationService.createInstance(NewChatView, isNewChatInSession, options3);
  }
  createChatView() {
    return this.instantiationService.createInstance(ChatView);
  }
};

ChatViewFactory = __decorateClass([
  __decorateParam(0, IInstantiationService)
], ChatViewFactory);
export { shouldShowSessionChatTip, shouldShowTranscriptPreparationProgress, getTranscriptProgress, findTranscriptContextEntry, NewChatView, ChatView, ChatViewFactory };
