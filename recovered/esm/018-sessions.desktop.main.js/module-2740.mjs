// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/chat/browser/widgetHosts/viewPane/chatViewPane.ts
import { ViewPane } from "./module-1334.mjs";
import { DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { LRUCache } from "./module-0008.mjs";
import { CHAT_WIDGET_VIEW_STATE_CACHE_LIMIT, ChatViewId, IChatWidgetService, setModelPreservingInputTypedWhileLoading } from "./module-0982.mjs";
import { observableValue } from "./module-0048.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { Memento } from "./module-1042.mjs";
import { CHAT_PROVIDER_ID } from "./module-0971.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { localize } from "./module-0001.mjs";
import { getComparisonKey, isEqual2 } from "./module-0034.mjs";
import { CancellationToken, CancellationTokenSource } from "./module-0025.mjs";
import { Event2 } from "./module-0017.mjs";
import { LocalChatSessionUri, getChatSessionType, getNewChatSessionResource, isUntitledChatSession } from "./module-0962.mjs";
import { $, EventHelper, EventType, addDisposableListener, append, getWindow, setVisibility } from "./module-0075.mjs";
import { MOUSE_BACK_FORWARD_NAVIGATION_SETTING } from "./module-1493.mjs";
import { notifyBridgeAutoStartFailure } from "./module-2736.mjs";
import { ChatViewWelcomeController } from "./module-2358.mjs";
import { combineVoiceInput } from "./module-2735.mjs";
import { VOICE_AGENT_PROGRESS_SETTING } from "./module-1341.mjs";
import { URI } from "./module-0032.mjs";
import { resolveVoiceModel } from "./module-2066.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { createVoiceGlowController } from "./module-2071.mjs";
import { isDark } from "./module-0247.mjs";
import { isGlowingVoiceState, readVoiceGlowIntensity, resolveVoiceGlowColors } from "./module-2058.mjs";
import { autorun } from "./module-0052.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { MenuId } from "./module-0092.mjs";
import { AgentSessionsFilter } from "./module-2729.mjs";
import { Button } from "./module-0546.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { ACTION_ID_NEW_CHAT } from "./module-1475.mjs";
import { AgentSessionsControl } from "./module-2734.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { ChatWidget, layoutChatWidgetForInputHeight } from "./module-2369.mjs";
import { SIDE_BAR_FOREGROUND } from "./module-0868.mjs";
import { editorBackground } from "./module-0229.mjs";
import { OpenCodeBridgeSessionView } from "./module-2739.mjs";
import { ChatViewTitleControl } from "./module-2732.mjs";
import { ChatEntitlementContextKeys, IChatEntitlementService } from "./module-0954.mjs";
import { IActivityService, ProgressBadge } from "./module-1448.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { getDefaultNewChatSessionType, getDefaultNewChatSessionTypeAndReasonFromServices, getLocalFallbackSessionTypeSelectionReason } from "./module-0965.mjs";
import { IChatSessionsService, localChatSessionType } from "./module-0961.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { Sash } from "./module-0496.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IViewDescriptorService } from "./module-1094.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IChatService } from "./module-0973.mjs";
import { IChatAgentService } from "./module-0975.mjs";
import { ILogService } from "./module-0095.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IAgentSessionsService } from "./module-1463.mjs";
import { IHostService } from "./module-1118.mjs";
import { IMicCaptureService } from "./module-1345.mjs";
import { ITtsPlaybackService } from "./module-2063.mjs";
import { IVoiceSessionController } from "./module-2070.mjs";
import { IVoiceInputModeService } from "./module-2076.mjs";
import { IAgentTitleBarStatusService } from "./module-2550.mjs";
import { IVoicePlaybackService } from "./module-2067.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IAgentHostEnablementService } from "./module-0964.mjs";
import { IAccessibilityService } from "./module-0104.mjs";


// src/vs/workbench/contrib/chat/browser/widgetHosts/viewPane/chatViewPane.ts
var ChatViewPane = class extends ViewPane {
  constructor(options3, keybindingService2, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, storageService, chatService, chatAgentService, logService, notificationService, layoutService, chatSessionsService, telemetryService, lifecycleService, progressService, agentSessionsService, chatEntitlementService, commandService, activityService, hostService, micCaptureService, ttsPlaybackService, voiceSessionController, voiceInputModeService, chatWidgetService, _agentTitleBarStatusService, _voicePlaybackService, _workbenchEnvironmentService, workspaceContextService, agentHostEnablementService, accessibilityService) {
    super(options3, keybindingService2, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.storageService = storageService;
    this.chatService = chatService;
    this.chatAgentService = chatAgentService;
    this.logService = logService;
    this.notificationService = notificationService;
    this.layoutService = layoutService;
    this.chatSessionsService = chatSessionsService;
    this.telemetryService = telemetryService;
    this.progressService = progressService;
    this.agentSessionsService = agentSessionsService;
    this.chatEntitlementService = chatEntitlementService;
    this.commandService = commandService;
    this.activityService = activityService;
    this.hostService = hostService;
    this.micCaptureService = micCaptureService;
    this.ttsPlaybackService = ttsPlaybackService;
    this.voiceSessionController = voiceSessionController;
    this.voiceInputModeService = voiceInputModeService;
    this.chatWidgetService = chatWidgetService;
    this.workspaceContextService = workspaceContextService;
    this.agentHostEnablementService = agentHostEnablementService;
    this.accessibilityService = accessibilityService;
    this.lastDimensionsPerOrientation = /* @__PURE__ */ new Map();
    this.loadSessionCts = this._register(new MutableDisposable());
    this._applyModelCts = this._register(new MutableDisposable());
    /** While > 0 the sessions list is suppressed so a session transition's transiently-empty widget does not reveal it (see {@link beginSessionsListSuppression}). */
    this._sessionsListSuppressionCount = 0;
    this.modelRef = this._register(new MutableDisposable());
    this.widgetViewStates = new LRUCache(CHAT_WIDGET_VIEW_STATE_CACHE_LIMIT);
    this.activityBadge = this._register(new MutableDisposable());
    this._currentSessionResource = observableValue(this, void 0);
    this.bridgeMode = false;
    this.persistentBridgeStartupScheduled = false;
    this._voiceBarDisposables = this._register(new DisposableStore());
    this.sessionsViewerOrientation = 1 /* Stacked */;
    this.sessionsViewerOrientationConfiguration = "sideBySide";
    this.sessionsViewerSashDisposables = this._register(new MutableDisposable());
    //#region Layout
    this.layoutingBody = false;
    this.element.classList.add("chat-viewpane-container");
    this.bridgeModeContext = ChatContextKeys.openCodeBridgeMode.bindTo(contextKeyService);
    this._register(toDisposable(() => this.bridgeModeContext.reset()));
    this.memento = new Memento(`interactive-session-view-${CHAT_PROVIDER_ID}`, this.storageService);
    this.viewState = this.memento.getMemento(1 /* WORKSPACE */, 1 /* MACHINE */);
    if (lifecycleService.startupKind !== 3 /* ReloadedWindow */ && this.configurationService.getValue("chat.restoreLastPanelSession" /* RestoreLastPanelSession */) === false) {
      this.viewState.sessionId = void 0;
      this.viewState.sessionResource = void 0;
    }
    this.sessionsViewerVisible = false;
    this.sessionsViewerSidebarWidth = Math.max(ChatViewPane.SESSIONS_SIDEBAR_MIN_WIDTH, this.viewState.sessionsSidebarWidth ?? ChatViewPane.SESSIONS_SIDEBAR_DEFAULT_WIDTH);
    this.chatViewLocationContext = ChatContextKeys.panelLocation.bindTo(contextKeyService);
    this.sessionsViewerOrientationContext = ChatContextKeys.agentSessionsViewerOrientation.bindTo(contextKeyService);
    this.sessionsViewerPositionContext = ChatContextKeys.agentSessionsViewerPosition.bindTo(contextKeyService);
    this.sessionsViewerVisibilityContext = ChatContextKeys.agentSessionsViewerVisible.bindTo(contextKeyService);
    this.updateContextKeys();
    this._focusedSessionResource = observableFromEvent(
      this,
      this.chatWidgetService.onDidChangeFocusedSession,
      () => this.chatWidgetService.lastFocusedWidget?.viewModel?.sessionResource
    );
    this.registerListeners();
    this._register(CommandsRegistry.registerCommand("_opencode.bridge.showSession", () => this.showBridgeSession()));
    this._register(CommandsRegistry.registerCommand("_opencode.bridge.showChat", () => this.showChatSession()));
    this._register(toDisposable(() => {
      this.containerTitleModel?.setTitle(void 0);
      this.containerTitleModel = void 0;
    }));
  }
  getModeViewTitle() {
    return this.bridgeMode ? localize(12704, null) : localize(12705, null);
  }
  get singleViewPaneContainerTitle() {
    return this.getModeViewTitle();
  }
  renderHeader(container2) {
    super.renderHeader(container2);
    this.updateTitle(this.getModeViewTitle());
  }
  updateTitle(_title) {
    const title = this.getModeViewTitle();
    super.updateTitle(title);
    this.updateContainerTitle(title);
  }
  updateContainerTitle(title) {
    const viewContainer = this.viewDescriptorService.getViewContainerByViewId(this.id);
    const model = viewContainer ? this.viewDescriptorService.getViewContainerModel(viewContainer) : void 0;
    if (this.containerTitleModel && this.containerTitleModel !== model) {
      this.containerTitleModel.setTitle(void 0);
    }
    this.containerTitleModel = model;
    if (!model) {
      return;
    }
    const ownsContainerTitle = model.visibleViewDescriptors.every((view) => view.id === this.id);
    model.setTitle(ownsContainerTitle ? title : void 0);
  }
  updateContextKeys() {
    const { position: position2, location: location2 } = this.getViewPositionAndLocation();
    this.chatViewLocationContext.set(location2 ?? 2 /* AuxiliaryBar */);
    this.sessionsViewerOrientationContext.set(this.sessionsViewerOrientation);
    this.sessionsViewerPositionContext.set(position2 === 1 /* RIGHT */ ? 2 /* Right */ : 1 /* Left */);
  }
  getViewPositionAndLocation() {
    const viewLocation = this.viewDescriptorService.getViewLocationById(this.id);
    const sideBarPosition = this.layoutService.getSideBarPosition();
    const panelPosition = this.layoutService.getPanelPosition();
    let sideSessionsOnRightPosition;
    switch (viewLocation) {
      case 0 /* Sidebar */:
        sideSessionsOnRightPosition = sideBarPosition === 1 /* RIGHT */;
        break;
      case 1 /* Panel */:
        sideSessionsOnRightPosition = panelPosition !== 0 /* LEFT */;
        break;
      default:
        sideSessionsOnRightPosition = sideBarPosition === 0 /* LEFT */;
        break;
    }
    return {
      position: sideSessionsOnRightPosition ? 1 /* RIGHT */ : 0 /* LEFT */,
      location: viewLocation ?? 2 /* AuxiliaryBar */
    };
  }
  getSessionHoverPosition() {
    const viewLocation = this.viewDescriptorService.getViewLocationById(this.id);
    const sideBarPosition = this.layoutService.getSideBarPosition();
    if (this.sessionsViewerOrientation === 2 /* SideBySide */) {
      return viewLocation === 0 /* Sidebar */ && sideBarPosition === 1 /* RIGHT */ ? 0 /* LEFT */ : 1 /* RIGHT */;
    }
    return {
      [0 /* LEFT */]: 1 /* RIGHT */,
      [1 /* RIGHT */]: 0 /* LEFT */,
      [3 /* TOP */]: 2 /* BELOW */,
      [2 /* BOTTOM */]: 3 /* ABOVE */
    }[viewLocation === 1 /* Panel */ ? this.layoutService.getPanelPosition() : sideBarPosition];
  }
  updateViewPaneClasses(fromEvent) {
    const activityBarLocationDefault = this.configurationService.getValue("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */) === "default";
    this.viewPaneContainer?.classList.toggle("activity-bar-location-default", activityBarLocationDefault);
    this.viewPaneContainer?.classList.toggle("activity-bar-location-other", !activityBarLocationDefault);
    const { position: position2, location: location2 } = this.getViewPositionAndLocation();
    this.viewPaneContainer?.classList.toggle("chat-view-location-auxiliarybar", location2 === 2 /* AuxiliaryBar */);
    this.viewPaneContainer?.classList.toggle("chat-view-location-sidebar", location2 === 0 /* Sidebar */);
    this.viewPaneContainer?.classList.toggle("chat-view-location-panel", location2 === 1 /* Panel */);
    this.viewPaneContainer?.classList.toggle("chat-view-position-left", position2 === 0 /* LEFT */);
    this.viewPaneContainer?.classList.toggle("chat-view-position-right", position2 === 1 /* RIGHT */);
    if (fromEvent) {
      this.relayout();
    }
  }
  registerListeners() {
    this._register(this.chatAgentService.onDidChangeAgents(() => this.onDidChangeAgents()));
    this._register(this.chatSessionsService.onDidCommitSession(async (e4) => {
      if (!this.modelRef.value) {
        return;
      }
      if (!isEqual2(e4.original, this.modelRef.value.object.sessionResource)) {
        return;
      }
      const modelRef = await this.chatService.acquireOrLoadSession(e4.committed, "panel" /* Chat */, CancellationToken.None, "ChatViewPane#onDidCommitSession");
      await this.showModel(CancellationToken.None, modelRef);
    }));
    this._register(Event2.any(
      Event2.filter(this.configurationService.onDidChangeConfiguration, (e4) => e4.affectsConfiguration("workbench.sideBar.location")),
      this.layoutService.onDidChangePanelPosition,
      this.layoutService.onDidChangePartVisibility,
      Event2.filter(this.viewDescriptorService.onDidChangeContainerLocation, (e4) => e4.viewContainer === this.viewDescriptorService.getViewContainerByViewId(this.id))
    )(() => {
      this.updateContextKeys();
      this.updateViewPaneClasses(
        true
        /* layout here */
      );
    }));
    this._register(Event2.filter(this.configurationService.onDidChangeConfiguration, (e4) => {
      return e4.affectsConfiguration("workbench.activityBar.location" /* ACTIVITY_BAR_LOCATION */);
    })(() => this.updateViewPaneClasses(true)));
  }
  onDidChangeAgents() {
    if (this.chatAgentService.getDefaultAgent("panel" /* Chat */)) {
      if (!this._widget?.viewModel && !this.restoringSession) {
        this.restoringSession = this.acquireTransferredOrPersistedSession(CancellationToken.None, "ChatViewPane#onDidChangeAgents").then(async (session) => {
          if (!this._widget) {
            return;
          }
          const wasVisible = this._widget.visible;
          try {
            this._widget.setVisible(false);
            await this.showModel(CancellationToken.None, session.modelRef, true, !session.modelRef, void 0, session.localFallbackSelectionReason);
          } finally {
            this._widget.setVisible(wasVisible);
          }
        });
        this.restoringSession.finally(() => this.restoringSession = void 0);
      }
    }
    this._onDidChangeViewWelcomeState.fire();
  }
  getTransferredOrPersistedSessionInfo() {
    if (this.chatService.transferredSessionResource) {
      return this.chatService.transferredSessionResource;
    }
    if (this.viewState.sessionResource) {
      return this.viewState.sessionResource;
    }
    return this.viewState.sessionId ? LocalChatSessionUri.forSession(this.viewState.sessionId) : void 0;
  }
  renderBody(parent) {
    super.renderBody(parent);
    this.telemetryService.publicLog2("chatViewPaneOpened");
    this.viewPaneContainer = parent;
    this.viewPaneContainer.classList.add("chat-viewpane");
    this.viewPaneContainer.classList.toggle("opencode-bridge-mode", this.bridgeMode);
    this.updateViewPaneClasses(false);
    const controlsWrapper = append(parent, $(".voice-agent-controls-wrapper"));
    this.controlsRow = append(controlsWrapper, $(".voice-agent-main-row"));
    this.createControls(this.controlsRow, controlsWrapper);
    const workbenchContainer = this.layoutService.getContainer(getWindow(parent));
    this._register(addDisposableListener(workbenchContainer, EventType.MOUSE_DOWN, (event) => this.handleMouseBackNavigation(event), true));
    this._voiceBarContainer = $(".voice-agent-bar-host");
    this._voiceBarContainer.style.display = "none";
    this._updateVoiceBar(this._voiceBarContainer);
    const inputContainerEl = this._widget.inputPart.inputContainerElement;
    if (inputContainerEl) {
      this._setupVoiceTranscriptOverlay(inputContainerEl);
    }
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration("agents.voice.enabled")) {
        this._updateVoiceBar(this._voiceBarContainer);
      }
    }));
    this.setupContextMenu(parent);
    this.applyModel();
  }
  async handleMouseBackNavigation(event) {
    if (event.button !== 3 || this.sessionsViewerOrientation !== 1 /* Stacked */ || this.sessionsViewerVisible || this._sessionsListSuppressionCount > 0 || this.welcomeController?.isShowingWelcome.get()) {
      return;
    }
    const viewModel = this._widget.viewModel;
    if (!viewModel || this._widget.isEmpty() && !viewModel.model.title) {
      return;
    }
    if (!this.configurationService.getValue(MOUSE_BACK_FORWARD_NAVIGATION_SETTING) || !this.configurationService.getValue("chat.viewSessions.enabled" /* ChatViewSessionsEnabled */)) {
      return;
    }
    const activeElement = getWindow(this._widget.domNode).document.activeElement;
    if (!activeElement || !this._widget.domNode.contains(activeElement)) {
      return;
    }
    EventHelper.stop(event, true);
    event.stopImmediatePropagation();
    await this.clear();
    this.focusSessions();
  }
  showBridgeSession() {
    this.bridgeMode = true;
    this.bridgeModeContext.set(true);
    this.updateTitle(this.getModeViewTitle());
    this.viewPaneContainer?.classList.add("opencode-bridge-mode");
    this._widget?.setVisible(false);
    this.bridgeSessionView?.setVisible(this.isBodyVisible(), true);
    this.refreshSessionsControlVisibility();
    this.relayout();
  }
  showChatSession() {
    this.bridgeModeContext.set(false);
    if (!this.bridgeMode) {
      this.updateTitle(this.getModeViewTitle());
      return;
    }
    this.bridgeMode = false;
    this.updateTitle(this.getModeViewTitle());
    this.viewPaneContainer?.classList.remove("opencode-bridge-mode");
    this.bridgeSessionView?.setVisible(this.isBodyVisible(), false);
    this._widget?.setVisible(this.isBodyVisible() && !this.welcomeController?.isShowingWelcome.get());
    this.refreshSessionsControlVisibility();
    this.relayout();
    this._widget?.focusInput();
  }
  schedulePersistentBridgeStartup(container2) {
    if (this.persistentBridgeStartupScheduled || this.configurationService.getValue("opencode.bridge.persistentMode") !== true) {
      return;
    }
    this.persistentBridgeStartupScheduled = true;
    const targetWindow = getWindow(container2);
    let firstFrame = 0;
    let secondFrame = 0;
    let startupTimer;
    firstFrame = targetWindow.requestAnimationFrame(() => {
      secondFrame = targetWindow.requestAnimationFrame(() => {
        startupTimer = targetWindow.setTimeout(() => {
          if (this.configurationService.getValue("opencode.bridge.persistentMode") !== true) {
            this.showChatSession();
            return;
          }
          this.showBridgeSession();
          void this.commandService.executeCommand("opencode.bridge.start").catch((error) => notifyBridgeAutoStartFailure(error, this.commandService, this.notificationService));
        }, 300);
      });
    });
    this._register(toDisposable(() => {
      targetWindow.cancelAnimationFrame(firstFrame);
      targetWindow.cancelAnimationFrame(secondFrame);
      if (startupTimer !== void 0) {
        targetWindow.clearTimeout(startupTimer);
      }
    }));
  }
  createControls(parent, taskShelfParent) {
    const sessionsControl = this.createSessionsControl(parent);
    const welcomeController = this.welcomeController = this._register(this.instantiationService.createInstance(ChatViewWelcomeController, parent, this, "panel" /* Chat */));
    const chatWidget = this.createChatControl(parent, taskShelfParent);
    this.registerControlsListeners(sessionsControl, chatWidget, welcomeController);
    this.updateSessionsControlVisibility();
  }
  _updateVoiceBar(container2) {
    this._voiceBarDisposables.clear();
    container2.replaceChildren();
    container2.style.display = "none";
    if (this.configurationService.getValue("agents.voice.enabled")) {
      this._voiceBarDisposables.add(CommandsRegistry.registerCommand("_chat.voice.acceptInput", (accessor, text2) => {
        const chatWidgetService = accessor.get(IChatWidgetService);
        const focusedWidget = chatWidgetService.lastFocusedWidget;
        const widget = focusedWidget?.hasInputFocus() ? focusedWidget : this._widget;
        if (text2 && widget?.viewModel) {
          if (widget.viewModel.editing) {
            widget.input.setValue(text2, false);
          } else {
            return widget.acceptInput(combineVoiceInput(widget.getInput(), text2), {
              preserveFocus: true,
              isVoiceModeInput: this.configurationService.getValue(VOICE_AGENT_PROGRESS_SETTING) === true
            });
          }
        }
        return void 0;
      }));
      this._voiceBarDisposables.add(CommandsRegistry.registerCommand("_chat.voice.switchToSession", async (_accessor, resourceStr) => {
        if (!resourceStr) {
          return false;
        }
        try {
          const resource = URI.parse(resourceStr);
          this.viewState.sessionResource = resource;
          this.applyModel();
          await this.restoringSession;
          const restoredResource = this._widget?.viewModel?.sessionResource;
          return !!restoredResource && isEqual2(restoredResource, resource);
        } catch {
          return false;
        }
      }));
      this._voiceBarDisposables.add(CommandsRegistry.registerCommand("_chat.voice.getCurrentSession", (_accessor) => {
        return this._widget?.viewModel?.sessionResource?.toString();
      }));
      this._voiceBarDisposables.add(CommandsRegistry.registerCommand("_chat.voice.selectModel", (_accessor, requestedModel) => {
        const widget = this._getVoiceActionWidget();
        if (!widget) {
          return { ok: false, reason: "no_input" };
        }
        const resolved = resolveVoiceModel(widget.inputPart.availableLanguageModels, requestedModel);
        if (!resolved.ok || !resolved.identifier) {
          return resolved;
        }
        return widget.inputPart.switchModelByIdentifier(resolved.identifier, true, true) ? resolved : { ok: false, reason: "selection_failed", available_models: resolved.available_models };
      }));
    }
  }
  _getVoiceActionWidget() {
    const target = this._currentVoiceInputResource();
    return target ? this.chatWidgetService.getWidgetBySessionResource(target) : this._widget;
  }
  /**
   * The single chat input voice mode is currently bound to. An explicit target
   * session wins, otherwise the last-focused chat widget's session falls back to
   * this pane's own session. The glow / transcript render only on
   * the pane whose session matches this, so with several chat inputs open (e.g.
   * this pane plus a chat editor) exactly one lights up.
   */
  _currentVoiceInputResource(reader) {
    const target = reader ? this.voiceSessionController.targetSession.read(reader) : this.voiceSessionController.targetSession.get();
    if (target) {
      return target;
    }
    const focused = reader ? this._focusedSessionResource.read(reader) : this._focusedSessionResource.get();
    return focused ?? this._widget?.viewModel?.sessionResource;
  }
  _setupVoiceTranscriptOverlay(inputContainerEl) {
    inputContainerEl.style.position = "relative";
    const showTranscriptSetting = observableFromEvent(
      this,
      Event2.filter(this.configurationService.onDidChangeConfiguration, (e4) => e4.affectsConfiguration("agents.voice.showTranscript")),
      () => this.configurationService.getValue("agents.voice.showTranscript") !== false
    );
    const showLiveTranscriptSetting = observableFromEvent(
      this,
      Event2.filter(this.configurationService.onDidChangeConfiguration, (e4) => e4.affectsConfiguration("agents.voice.liveTranscript")),
      () => this.configurationService.getValue("agents.voice.liveTranscript") !== false
    );
    const inputValue = observableFromEvent(
      this,
      this._widget.inputEditor.onDidChangeModelContent,
      () => this._widget.getInput()
    );
    const transcriptOverlay = $(".voice-transcript-overlay");
    const transcriptScrollable = this._register(new DomScrollableElement(transcriptOverlay, {
      horizontal: 2 /* Hidden */,
      vertical: 1 /* Auto */
    }));
    const transcriptOverlayNode = transcriptScrollable.getDomNode();
    transcriptOverlayNode.classList.add("voice-transcript-overlay-scrollable");
    transcriptOverlayNode.style.display = "none";
    inputContainerEl.append(transcriptOverlayNode);
    let animFrameId;
    const glowDataArrayRef = { value: void 0 };
    const win = getWindow(inputContainerEl);
    const glowController = this._register(createVoiceGlowController(
      inputContainerEl,
      () => isDark(this.themeService.getColorTheme().type) ? "dark" : "light",
      () => resolveVoiceGlowColors(this.themeService.getColorTheme())
    ));
    this._register(this.themeService.onDidColorThemeChange(() => glowController.refreshTheme()));
    const getEffectiveVoice = () => {
      const sim = this.voiceInputModeService.simulatedVoiceState.get();
      if (sim === "idle" || sim === "listening" || sim === "speaking") {
        return { connected: true, voiceState: sim, simulating: true };
      }
      if (sim === "off" || sim === "connecting" || sim === "dictating") {
        return { connected: false, voiceState: "idle", simulating: true };
      }
      const voiceState = this.voiceSessionController.voiceState.get();
      return {
        connected: this.voiceSessionController.isConnected.get(),
        // While muted the mic isn't heard; treat muted-listening as idle (no
        // glow). Only check mute in the listening state so other states don't
        // depend on it.
        voiceState: voiceState === "listening" && this.voiceSessionController.isMuted.get() ? "idle" : voiceState,
        simulating: false
      };
    };
    const startGlowAnimation = () => {
      if (animFrameId !== void 0) {
        return;
      }
      const animate2 = () => {
        animFrameId = win.requestAnimationFrame(animate2);
        const { connected, voiceState, simulating } = getEffectiveVoice();
        const currentSession = this._currentSessionResource.get();
        const boundResource = this._currentVoiceInputResource();
        const isOwner = !!currentSession && !!boundResource && isEqual2(currentSession, boundResource);
        const glowActive = connected && isGlowingVoiceState(voiceState) && (simulating || isOwner);
        if (!glowActive) {
          glowController.clear();
          return;
        }
        const analyser = this.ttsPlaybackService.analyserNode ?? (voiceState === "listening" ? this.micCaptureService.analyserNode : null) ?? null;
        let intensity;
        if (!analyser && simulating) {
          const t2 = Date.now() / 1e3;
          intensity = Math.min(1, 0.28 + 0.34 * Math.abs(Math.sin(t2 * 6.1)) + 0.22 * Math.abs(Math.sin(t2 * 11.3 + 1)));
        } else {
          intensity = readVoiceGlowIntensity(analyser, glowDataArrayRef);
        }
        glowController.render(voiceState, intensity, this.accessibilityService.isMotionReduced());
      };
      animFrameId = win.requestAnimationFrame(animate2);
    };
    const stopGlowAnimation = () => {
      if (animFrameId !== void 0) {
        win.cancelAnimationFrame(animFrameId);
        animFrameId = void 0;
      }
      glowController.clear();
    };
    this._register(autorun((reader) => {
      const connected = this.voiceSessionController.isConnected.read(reader);
      const voiceState = this.voiceSessionController.voiceState.read(reader);
      const sim = this.voiceInputModeService.simulatedVoiceState.read(reader);
      const simGlow = sim === "listening" || sim === "speaking";
      const liveGlow = connected && isGlowingVoiceState(voiceState) && !(voiceState === "listening" && this.voiceSessionController.isMuted.read(reader));
      if (simGlow || liveGlow) {
        startGlowAnimation();
      } else {
        stopGlowAnimation();
      }
    }));
    this._register({ dispose: () => stopGlowAnimation() });
    let listeningSession;
    let ownerSession;
    this._register(autorun((reader) => {
      const simState = this.voiceInputModeService.simulatedVoiceState.read(reader);
      const simVersion = this.voiceInputModeService.simulatedVersion.read(reader);
      if (simState !== void 0) {
        if (simState === "idle" && simVersion) {
          transcriptOverlayNode.style.display = "";
          transcriptOverlayNode.classList.remove("has-transcript");
          transcriptOverlay.replaceChildren();
          const hint = $("span.partial");
          switch (simVersion) {
            case "handsFree":
              hint.textContent = localize(12715, null);
              break;
            case "keyboardHold": {
              const kbLabel = this.keybindingService.lookupKeybinding("workbench.action.chat.voiceInputMode.holdToTalk")?.getLabel();
              hint.textContent = kbLabel ? localize(12711, null, kbLabel) : localize(12716, null);
              break;
            }
            case "buttonHold":
              hint.textContent = localize(12713, null);
              break;
            case "clickToggle":
              hint.textContent = localize(12714, null);
              break;
          }
          transcriptOverlay.append(hint);
          transcriptScrollable.scanDomNode();
        } else {
          transcriptOverlayNode.style.display = "none";
          transcriptOverlayNode.classList.remove("has-transcript");
        }
        return;
      }
      const turns = this.voiceSessionController.transcriptTurns.read(reader);
      const connected = this.voiceSessionController.isConnected.read(reader);
      const voiceState = this.voiceSessionController.voiceState.read(reader);
      const targetSession = this.voiceSessionController.targetSession.read(reader);
      const currentSession = this._currentSessionResource.read(reader);
      const showTranscript = showTranscriptSetting.read(reader);
      const showLiveTranscript = showLiveTranscriptSetting.read(reader);
      const hasInput = inputValue.read(reader).length > 0;
      const visible = turns.filter((t2) => t2.text.length > 0 || t2.speaker === "user" && t2.isPartial);
      const showListeningPlaceholder = voiceState === "listening" && (!showTranscript || !showLiveTranscript);
      if (!connected) {
        listeningSession = void 0;
        ownerSession = void 0;
        transcriptOverlayNode.style.display = "none";
        transcriptOverlayNode.classList.remove("has-transcript");
        return;
      }
      if (voiceState === "listening") {
        if (!listeningSession) {
          listeningSession = targetSession ?? currentSession;
          ownerSession = listeningSession;
        } else if (!targetSession && currentSession && !isEqual2(currentSession, listeningSession)) {
          const dictationSession = listeningSession;
          const activelyDictating = turns.some((t2) => t2.speaker === "user" && t2.isPartial && t2.text.trim().length > 0);
          if (activelyDictating) {
            this.voiceSessionController.finishListeningAndSubmitTo(dictationSession);
            listeningSession = void 0;
          } else if (isUntitledChatSession(currentSession)) {
            listeningSession = currentSession;
            ownerSession = currentSession;
          } else {
            this.voiceSessionController.discardListening();
            listeningSession = void 0;
          }
        }
      } else {
        listeningSession = void 0;
      }
      const boundResource = this._currentVoiceInputResource(reader);
      if (boundResource && currentSession && !isEqual2(boundResource, currentSession)) {
        transcriptOverlayNode.style.display = "none";
        transcriptOverlayNode.classList.remove("has-transcript");
        return;
      }
      const effectiveOwner = targetSession ?? ownerSession;
      if (effectiveOwner && currentSession && !isEqual2(effectiveOwner, currentSession)) {
        transcriptOverlayNode.style.display = "none";
        transcriptOverlayNode.classList.remove("has-transcript");
        return;
      }
      if (visible.length === 0 || !showTranscript || showListeningPlaceholder) {
        if (hasInput) {
          transcriptOverlayNode.style.display = "none";
          transcriptOverlayNode.classList.remove("has-transcript");
          return;
        }
        const handsFree = this.configurationService.getValue("agents.voice.handsFree") === true;
        if (showListeningPlaceholder) {
          transcriptOverlayNode.style.display = "";
          transcriptOverlayNode.classList.remove("has-transcript");
          transcriptOverlay.replaceChildren();
          const listening = $("span.listening");
          listening.textContent = this.voiceSessionController.isMuted.read(reader) ? localize(12710, null) : localize(12709, null);
          transcriptOverlay.append(listening);
          transcriptScrollable.scanDomNode();
        } else if (!showTranscript && voiceState === "speaking") {
          transcriptOverlayNode.style.display = "";
          transcriptOverlayNode.classList.remove("has-transcript");
          transcriptOverlay.replaceChildren();
          const hint = $("span.partial");
          const kb = this.keybindingService.lookupKeybinding("workbench.action.chat.voiceInputMode.holdToTalk") ?? this.keybindingService.lookupKeybinding("agentsVoice.pushToTalk");
          const kbLabel = kb?.getLabel();
          hint.textContent = kbLabel ? localize(12706, null, kbLabel) : localize(12707, null);
          transcriptOverlay.append(hint);
          transcriptScrollable.scanDomNode();
        } else if (voiceState === "idle" && visible.length === 0 && showTranscript && !handsFree) {
          transcriptOverlayNode.style.display = "";
          transcriptOverlayNode.classList.remove("has-transcript");
          transcriptOverlay.replaceChildren();
          const hint = $("span.partial");
          const kb = this.keybindingService.lookupKeybinding("agentsVoice.pushToTalk");
          const kbLabel = kb?.getLabel();
          hint.textContent = kbLabel ? localize(12712, null, kbLabel) : localize(12708, null);
          transcriptOverlay.append(hint);
          transcriptScrollable.scanDomNode();
        } else {
          transcriptOverlayNode.style.display = "none";
          transcriptOverlayNode.classList.remove("has-transcript");
        }
        return;
      }
      transcriptOverlayNode.style.display = "";
      transcriptOverlayNode.classList.add("has-transcript");
      const lastTurn = visible[visible.length - 1];
      const contentElements = [];
      if (lastTurn.speaker === "user") {
        const span = $("span");
        if (lastTurn.isPartial) {
          const committedPart = lastTurn.committed || "";
          const unsurePart = lastTurn.text.slice(committedPart.length);
          if (committedPart) {
            const c = $("span.committed");
            c.textContent = committedPart;
            span.append(c);
          }
          const u = $("span.partial");
          u.textContent = unsurePart + "\u2589";
          span.append(u);
        } else {
          span.className = "committed";
          span.textContent = lastTurn.text;
        }
        contentElements.push(span);
      } else {
        const div = $("div.assistant-text");
        div.textContent = lastTurn.text;
        contentElements.push(div);
      }
      transcriptOverlay.replaceChildren(...contentElements);
      transcriptScrollable.scanDomNode();
      transcriptScrollable.setScrollPosition({ scrollTop: 0 });
    }));
  }
  static {
    //#endregion
    //#region Sessions Control
    this.SESSIONS_SIDEBAR_MIN_WIDTH = 200;
  }
  static {
    this.SESSIONS_SIDEBAR_SNAP_THRESHOLD = this.SESSIONS_SIDEBAR_MIN_WIDTH / 2;
  }
  static {
    // snap to hide when dragged below half of minimum width
    this.SESSIONS_SIDEBAR_DEFAULT_WIDTH = 300;
  }
  static {
    this.SESSIONS_SIDEBAR_BORDER_WIDTH = 1;
  }
  static {
    this.CHAT_WIDGET_DEFAULT_WIDTH = 300;
  }
  static {
    this.SESSIONS_SIDEBAR_VIEW_MIN_WIDTH = this.CHAT_WIDGET_DEFAULT_WIDTH + this.SESSIONS_SIDEBAR_DEFAULT_WIDTH;
  }
  get agentSessionsControl() {
    return this.sessionsControl;
  }
  createSessionsControl(parent) {
    const sessionsContainer = this.sessionsContainer = parent.appendChild($(".agent-sessions-container"));
    const sessionsTitleContainer = this.sessionsTitleContainer = append(sessionsContainer, $(".agent-sessions-title-container"));
    const sessionsTitle = this.sessionsTitle = append(sessionsTitleContainer, $("span.agent-sessions-title"));
    sessionsTitle.textContent = localize(12703, null);
    this._register(addDisposableListener(sessionsTitle, EventType.CLICK, () => {
      this.sessionsControl?.scrollToTop();
      this.sessionsControl?.focus();
    }));
    const sessionsToolbarContainer = append(sessionsTitleContainer, $(".agent-sessions-toolbar"));
    const sessionsToolbar = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, sessionsToolbarContainer, MenuId.AgentSessionsToolbar, {
      menuOptions: { shouldForwardArgs: true }
    }));
    const sessionsFilter = this._register(this.instantiationService.createInstance(AgentSessionsFilter, {
      filterMenuId: MenuId.AgentSessionsViewerFilterSubMenu,
      groupResults: () => this.sessionsViewerOrientation === 1 /* Stacked */ ? "capped" /* Capped */ : "date" /* Date */
    }));
    this._register(Event2.runAndSubscribe(sessionsFilter.onDidChange, () => {
      sessionsToolbarContainer.classList.toggle("filtered", !sessionsFilter.isDefault());
    }));
    const newSessionButtonContainer = this.sessionsNewButtonContainer = append(sessionsContainer, $(".agent-sessions-new-button-container"));
    const newSessionButton = this._register(new Button(newSessionButtonContainer, { ...defaultButtonStyles, secondary: true }));
    newSessionButton.label = localize(12701, null);
    const createNewChat = () => this.commandService.executeCommand(ACTION_ID_NEW_CHAT, this.getActionsContext());
    this._register(newSessionButton.onDidClick(createNewChat));
    this.sessionsControlContainer = append(sessionsContainer, $(".agent-sessions-control-container"));
    const sessionsControl = this.sessionsControl = this._register(this.instantiationService.createInstance(AgentSessionsControl, this.sessionsControlContainer, {
      source: "chatViewPane",
      filter: sessionsFilter,
      overrideStyles: this.getLocationBasedColors().listOverrideStyles,
      createNewChat,
      getHoverPosition: () => this.getSessionHoverPosition(),
      trackActiveEditorSession: () => {
        return !this._widget || this._widget.isEmpty();
      },
      overrideSessionOpenOptions: (openEvent) => {
        if (this.sessionsViewerOrientation === 1 /* Stacked */ && !openEvent.sideBySide) {
          return { ...openEvent, editorOptions: {
            ...openEvent.editorOptions,
            preserveFocus: false
            /* focus the chat widget when opening from stacked sessions viewer since this closes the stacked viewer */
          } };
        }
        return openEvent;
      }
    }));
    this._register(this.onDidChangeBodyVisibility((visible) => sessionsControl.setVisible(visible)));
    sessionsToolbar.context = sessionsControl;
    this._register(this.hostService.onDidChangeFocus((hasFocus) => {
      if (hasFocus) {
        sessionsControl.refresh();
      }
    }));
    this._register(Event2.runAndSubscribe(Event2.filter(this.configurationService.onDidChangeConfiguration, (e4) => e4.affectsConfiguration("chat.viewSessions.orientation" /* ChatViewSessionsOrientation */)), (e4) => {
      const newSessionsViewerOrientationConfiguration = this.configurationService.getValue("chat.viewSessions.orientation" /* ChatViewSessionsOrientation */);
      this.doUpdateConfiguredSessionsViewerOrientation(newSessionsViewerOrientationConfiguration, { updateConfiguration: false, layout: !!e4 });
    }));
    return sessionsControl;
  }
  getSessionsViewerOrientation() {
    return this.sessionsViewerOrientation;
  }
  updateConfiguredSessionsViewerOrientation(orientation) {
    return this.doUpdateConfiguredSessionsViewerOrientation(orientation, { updateConfiguration: true, layout: true });
  }
  doUpdateConfiguredSessionsViewerOrientation(orientation, options3) {
    const oldSessionsViewerOrientationConfiguration = this.sessionsViewerOrientationConfiguration;
    let validatedOrientation;
    if (orientation === "stacked" || orientation === "sideBySide") {
      validatedOrientation = orientation;
    } else {
      validatedOrientation = "sideBySide";
    }
    this.sessionsViewerOrientationConfiguration = validatedOrientation;
    if (oldSessionsViewerOrientationConfiguration === this.sessionsViewerOrientationConfiguration) {
      return;
    }
    if (options3.updateConfiguration) {
      this.configurationService.updateValue("chat.viewSessions.orientation" /* ChatViewSessionsOrientation */, validatedOrientation);
    }
    if (options3.layout) {
      this.relayout();
    }
  }
  updateSessionsControlVisibility() {
    if (!this.sessionsContainer || !this.viewPaneContainer) {
      return { changed: false, visible: false };
    }
    let newSessionsContainerVisible;
    if (this.bridgeMode) {
      newSessionsContainerVisible = false;
    } else if (!this.configurationService.getValue("chat.viewSessions.enabled" /* ChatViewSessionsEnabled */)) {
      newSessionsContainerVisible = false;
    } else {
      if (this.sessionsViewerOrientation === 1 /* Stacked */) {
        newSessionsContainerVisible = (!!this.chatEntitlementService.sentiment.completed || this.chatEntitlementService.hasByokModels) && // chat is setup (otherwise make room for terms and welcome)
        (!this._widget || this._widget.isEmpty() && !!this._widget.viewModel && !this._widget.viewModel.model.title) && // chat widget empty (but not when model is loading or has a title)
        this._sessionsListSuppressionCount === 0 && // not mid-transition (a slow session transiently shows an empty widget)
        !this.welcomeController?.isShowingWelcome.get();
      } else {
        newSessionsContainerVisible = !this.welcomeController?.isShowingWelcome.get() && // welcome not showing
        !!this.lastDimensions && this.lastDimensions.width >= ChatViewPane.SESSIONS_SIDEBAR_VIEW_MIN_WIDTH;
      }
    }
    this.viewPaneContainer.classList.toggle("has-sessions-control", newSessionsContainerVisible);
    const sessionsContainerVisible = this.sessionsContainer.style.display !== "none";
    setVisibility(newSessionsContainerVisible, this.sessionsContainer);
    this.sessionsViewerVisible = newSessionsContainerVisible;
    this.sessionsViewerVisibilityContext.set(newSessionsContainerVisible);
    return {
      changed: sessionsContainerVisible !== newSessionsContainerVisible,
      visible: newSessionsContainerVisible
    };
  }
  refreshSessionsControlVisibility() {
    const { changed } = this.updateSessionsControlVisibility();
    if (changed) {
      this.relayout();
    }
  }
  /**
   * Suppresses the sessions list until the returned disposable is disposed.
   * Used to span a whole session transition (e.g. a "Continue in…" migration:
   * load → materializing send → rebind) so the transiently-empty widget never
   * falls back to the list.
   */
  beginSessionsListSuppression() {
    this._sessionsListSuppressionCount++;
    this.refreshSessionsControlVisibility();
    return toDisposable(() => {
      this._sessionsListSuppressionCount--;
      this.refreshSessionsControlVisibility();
    });
  }
  getFocusedSessions() {
    return this.sessionsControl?.getFocus() ?? [];
  }
  static {
    //#endregion
    //#region Chat Control
    this.MIN_CHAT_WIDGET_HEIGHT = 116;
  }
  get widget() {
    return this._widget;
  }
  createChatControl(parent, taskShelfParent) {
    const chatControlsContainer = append(parent, $(".chat-controls-container"));
    const locationBasedColors = this.getLocationBasedColors();
    const editorOverflowWidgetsDomNode = this.layoutService.getContainer(getWindow(chatControlsContainer)).appendChild($(".chat-editor-overflow.monaco-editor"));
    this._register(toDisposable(() => editorOverflowWidgetsDomNode.remove()));
    this.createChatTitleControl(chatControlsContainer);
    const scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this.scopedContextKeyService])));
    this._widget = this._register(scopedInstantiationService.createInstance(
      ChatWidget,
      "panel" /* Chat */,
      { viewId: this.id },
      {
        autoScroll: (mode) => mode !== "ask" /* Ask */,
        renderFollowups: true,
        supportsFileReferences: true,
        clear: () => this.clear(),
        enableFind: true,
        rendererOptions: {
          renderTextEditsAsSummary: (uri4) => {
            return true;
          },
          referencesExpandedWhenEmptyResponse: false,
          progressMessageAtBottomOfResponse: (mode) => mode !== "ask" /* Ask */
        },
        editorOverflowWidgetsDomNode,
        enableImplicitContext: true,
        enableWorkingSet: "explicit",
        supportsChangingModes: true,
        dndContainer: parent
      },
      {
        listForeground: SIDE_BAR_FOREGROUND,
        listBackground: locationBasedColors.background,
        listShadow: locationBasedColors.listOverrideStyles.treeStickyScrollShadow,
        overlayBackground: locationBasedColors.overlayBackground,
        inputEditorBackground: locationBasedColors.background,
        resultEditorBackground: editorBackground
      }
    ));
    this._widget.render(chatControlsContainer, parent);
    this.bridgeSessionView = this._register(this.instantiationService.createInstance(
      OpenCodeBridgeSessionView,
      chatControlsContainer,
      taskShelfParent,
      () => this.relayout()
    ));
    this.bridgeSessionView.setVisible(this.isBodyVisible(), this.bridgeMode);
    const updateWidgetVisibility = (reader) => this._widget.setVisible(!this.bridgeMode && this.isBodyVisible() && !this.welcomeController?.isShowingWelcome.read(reader));
    this._register(this.onDidChangeBodyVisibility(() => {
      updateWidgetVisibility();
      this.bridgeSessionView?.setVisible(this.isBodyVisible(), this.bridgeMode);
    }));
    this._register(autorun((reader) => updateWidgetVisibility(reader)));
    this.schedulePersistentBridgeStartup(chatControlsContainer);
    return this._widget;
  }
  createChatTitleControl(parent) {
    this.titleControl = this._register(this.instantiationService.createInstance(
      ChatViewTitleControl,
      parent,
      {
        focusChat: () => this._widget.focusInput()
      },
      void 0
    ));
    this._register(this.titleControl.onDidChangeHeight(() => {
      this.relayout();
    }));
  }
  //#endregion
  registerControlsListeners(sessionsControl, chatWidget, welcomeController) {
    const hasByokModelsContextKeys = /* @__PURE__ */ new Set([ChatEntitlementContextKeys.hasByokModels.key]);
    this._register(Event2.any(
      chatWidget.onDidChangeEmptyState,
      Event2.fromObservable(welcomeController.isShowingWelcome),
      Event2.filter(this.configurationService.onDidChangeConfiguration, (e4) => e4.affectsConfiguration("chat.viewSessions.enabled" /* ChatViewSessionsEnabled */)),
      Event2.filter(this.contextKeyService.onDidChangeContext, (e4) => e4.affectsSome(hasByokModelsContextKeys))
    )(() => {
      if (this.sessionsViewerOrientation === 1 /* Stacked */) {
        sessionsControl.clearFocus();
      }
      const { changed: visibilityChanged } = this.updateSessionsControlVisibility();
      if (visibilityChanged) {
        this.relayout();
      }
    }));
    this._register(chatWidget.onDidChangeViewModel(() => {
      const model = chatWidget.viewModel?.model;
      this.titleControl?.update(model);
      this._currentSessionResource.set(chatWidget.viewModel?.sessionResource, void 0);
      if (this.sessionsViewerOrientation === 1 /* Stacked */) {
        return;
      }
      const sessionResource = chatWidget.viewModel?.sessionResource;
      if (sessionResource) {
        const revealed = sessionsControl.reveal(sessionResource);
        if (!revealed) {
          sessionsControl.clearFocus();
        }
      }
    }));
    this._register(this.agentSessionsService.model.onDidChangeSessions(() => {
      if (this.sessionsViewerOrientation === 1 /* Stacked */) {
        return;
      }
      if (sessionsControl.hasFocusOrSelection()) {
        return;
      }
      const sessionResource = chatWidget.viewModel?.sessionResource;
      if (sessionResource) {
        sessionsControl.reveal(sessionResource);
      }
    }));
    this._register(this.agentSessionsService.model.onDidChangeSessionArchivedState((e4) => {
      if (e4.isArchived()) {
        const currentSessionResource = chatWidget.viewModel?.sessionResource;
        if (currentSessionResource && isEqual2(currentSessionResource, e4.resource)) {
          this.clear();
        }
      }
    }));
    this._register(autorun((reader) => {
      chatWidget.inputPart.height.read(reader);
      if (this.sessionsViewerVisible && this.sessionsViewerOrientation === 1 /* Stacked */) {
        this.relayoutForInputHeight();
      }
    }));
    const progressBadgeDisposables = this._register(new MutableDisposable());
    const updateProgressBadge = () => {
      progressBadgeDisposables.value = new DisposableStore();
      if (!this.configurationService.getValue("chat.viewProgressBadge.enabled" /* ChatViewProgressBadgeEnabled */)) {
        this.activityBadge.clear();
        return;
      }
      const model = chatWidget.viewModel?.model;
      if (model) {
        progressBadgeDisposables.value.add(autorun((reader) => {
          if (model.requestInProgress.read(reader)) {
            this.activityBadge.value = this.activityService.showViewActivity(this.id, {
              badge: new ProgressBadge(() => localize(12702, null))
            });
          } else {
            this.activityBadge.clear();
          }
        }));
      } else {
        this.activityBadge.clear();
      }
    };
    this._register(chatWidget.onDidChangeViewModel(() => updateProgressBadge()));
    this._register(Event2.filter(this.configurationService.onDidChangeConfiguration, (e4) => e4.affectsConfiguration("chat.viewProgressBadge.enabled" /* ChatViewProgressBadgeEnabled */))(() => updateProgressBadge()));
    updateProgressBadge();
  }
  setupContextMenu(parent) {
    this._register(addDisposableListener(parent, EventType.CONTEXT_MENU, (e4) => {
      EventHelper.stop(e4, true);
      this.contextMenuService.showContextMenu({
        menuId: MenuId.ChatWelcomeContext,
        contextKeyService: this.contextKeyService,
        getAnchor: () => new StandardMouseEvent(getWindow(parent), e4)
      });
    }));
  }
  //#region Model Management
  applyModel() {
    this._applyModelCts.value?.cancel();
    const cts = this._applyModelCts.value = new CancellationTokenSource();
    this.restoringSession = this._applyModel(cts.token).catch((err) => {
      if (!isCancellationError(err)) {
        this.logService.error("ChatViewPane#applyModel failed", err);
      }
    });
    this.restoringSession.finally(() => this.restoringSession = void 0);
  }
  async _applyModel(token) {
    const session = await this.acquireTransferredOrPersistedSession(token, "ChatViewPane#applyModel");
    await this.showModel(token, session.modelRef, true, !session.modelRef, void 0, session.localFallbackSelectionReason);
  }
  /**
   * Force-start a new local chat session in the view, bypassing the
   * default-provider override applied by `showModel()`. Used by the
   * picker when the user explicitly selects "Local", and by New Local Chat.
   */
  async startNewLocalSession(sessionTypeSelectionReason = "explicitOverride") {
    this._applyModelCts.value?.cancel();
    const ref = this.chatService.startNewLocalSession("panel" /* Chat */, { debugOwner: "ChatViewPane#startNewLocalSession", sessionTypeSelectionReason });
    return this.showModel(CancellationToken.None, ref);
  }
  /**
   * When the remembered or computed default session type is a non-local
   * provider (for example when the agent host is enabled), return a new session
   * reference for it instead of the built-in local provider.
   */
  async acquireDefaultNewSession(token, localFallbackSelectionReason) {
    const workspace = this.workspaceContextService.getWorkspace();
    const defaultTypeAndReason = getDefaultNewChatSessionTypeAndReasonFromServices(this.configurationService, this.chatSessionsService, this.storageService, workspace, this.agentHostEnablementService.enabled.get(), void 0, this.agentHostEnablementService.managedSandboxEnforced.get());
    if (defaultTypeAndReason.sessionType === localChatSessionType) {
      return { modelRef: this.chatService.startNewLocalSession("panel" /* Chat */, { debugOwner: "ChatViewPane#acquireDefaultNewSession", sessionTypeSelectionReason: localFallbackSelectionReason ?? defaultTypeAndReason.selectionReason }) };
    }
    const resource = getNewChatSessionResource(defaultTypeAndReason.sessionType);
    try {
      const modelRef = await this.chatService.acquireOrLoadSession(resource, "panel" /* Chat */, token, "ChatViewPane#acquireDefaultNewSession", defaultTypeAndReason.selectionReason);
      return {
        modelRef,
        localFallbackSelectionReason: getLocalFallbackSessionTypeSelectionReason(defaultTypeAndReason.sessionType, !!modelRef, localFallbackSelectionReason)
      };
    } catch (error) {
      if (isCancellationError(error)) {
        throw error;
      }
      this.logService.warn(`[ChatViewPane] Failed to acquire default agent-host session, falling back to local`, error);
      return {
        modelRef: void 0,
        localFallbackSelectionReason: getLocalFallbackSessionTypeSelectionReason(defaultTypeAndReason.sessionType, false, localFallbackSelectionReason)
      };
    }
  }
  async acquireTransferredOrPersistedSession(token, debugOwner) {
    const sessionResource = this.getTransferredOrPersistedSessionInfo();
    if (!sessionResource) {
      return { modelRef: void 0 };
    }
    const modelRef = await this.chatService.acquireOrLoadSession(sessionResource, "panel" /* Chat */, token, debugOwner);
    if (!modelRef) {
      return {
        modelRef: void 0,
        localFallbackSelectionReason: getLocalFallbackSessionTypeSelectionReason(getChatSessionType(sessionResource), false)
      };
    }
    if (this.shouldSkipRestoredLocalSession(sessionResource, modelRef.object)) {
      modelRef.dispose();
      return { modelRef: void 0 };
    }
    return { modelRef };
  }
  shouldSkipRestoredLocalSession(sessionResource, model) {
    const workspace = this.workspaceContextService.getWorkspace();
    const defaultType = getDefaultNewChatSessionType(this.configurationService, this.chatSessionsService, this.storageService, workspace, this.agentHostEnablementService.enabled.get(), void 0, this.agentHostEnablementService.managedSandboxEnforced.get());
    return defaultType !== localChatSessionType && getChatSessionType(sessionResource) === localChatSessionType && !model.hasRequests;
  }
  async showModel(token, modelRef, startNewSession = true, ignoreTransferredSession = false, inputBeforeLoad, localFallbackSelectionReason) {
    const oldModelResource = this._widget.viewModel?.sessionResource;
    if (oldModelResource) {
      this.widgetViewStates.set(getComparisonKey(oldModelResource), this._widget.getViewState());
    }
    this.modelRef.value = void 0;
    const baselineInput = inputBeforeLoad ?? this._widget?.getInput() ?? "";
    let ref;
    if (startNewSession) {
      if (modelRef) {
        ref = modelRef;
      } else if (!ignoreTransferredSession && this.chatService.transferredSessionResource) {
        ref = await this.chatService.acquireOrLoadSession(this.chatService.transferredSessionResource, "panel" /* Chat */, token, "ChatViewPane#showModel");
      } else {
        const defaultSession = await this.acquireDefaultNewSession(token, localFallbackSelectionReason);
        ref = defaultSession.modelRef ?? this.chatService.startNewLocalSession("panel" /* Chat */, { debugOwner: "ChatViewPane#showModel", sessionTypeSelectionReason: defaultSession.localFallbackSelectionReason });
      }
      if (!ref) {
        throw new Error("Could not start chat session");
      }
    }
    if (token.isCancellationRequested) {
      ref?.dispose();
      return void 0;
    }
    this.modelRef.value = ref;
    const model = ref?.object;
    if (model) {
      await this.updateWidgetLockState(getChatSessionType(model.sessionResource));
      if (token.isCancellationRequested) {
        this.modelRef.value = void 0;
        return void 0;
      }
      this.viewState.sessionResource = model.sessionResource;
    }
    if (model) {
      setModelPreservingInputTypedWhileLoading(this._widget, baselineInput, () => this._widget.setModel(model));
      const widgetViewState = this.widgetViewStates.get(getComparisonKey(model.sessionResource));
      if (widgetViewState) {
        this._widget.restoreViewState(widgetViewState);
      }
    } else {
      this._widget.setModel(model);
    }
    this.titleControl?.update(model);
    this.updateActions();
    if (oldModelResource) {
      const capturedOldResource = oldModelResource;
      this._register(disposableTimeout(() => {
        const oldSession = this.agentSessionsService.model.getSession(capturedOldResource);
        if (oldSession && !oldSession.isMarkedUnread()) {
          oldSession.setRead(true);
        }
      }, 0));
    }
    return model;
  }
  async updateWidgetLockState(sessionType) {
    if (sessionType === localChatSessionType) {
      this._widget.unlockFromCodingAgent();
      return;
    }
    let canResolve = false;
    try {
      canResolve = await this.chatSessionsService.canResolveChatSession(sessionType);
    } catch (error) {
      this.logService.warn(`Failed to resolve chat session type '${sessionType}' for locking`, error);
    }
    if (!canResolve) {
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
  async clear() {
    this.loadSessionCts.value?.cancel();
    this.updateViewState();
    await this.showModel(CancellationToken.None);
    this.updateActions();
  }
  async loadSession(sessionResource, sessionTypeSelectionReason) {
    const t0 = Date.now();
    this.logService.trace(`[ChatViewPane] loadSession start uri=${sessionResource.toString()}`);
    const inputBeforeLoad = this._widget?.getInput() ?? "";
    this.loadSessionCts.value?.cancel();
    const cts = this.loadSessionCts.value = new CancellationTokenSource();
    const token = cts.token;
    if (this.restoringSession) {
      await this.restoringSession;
    }
    if (token.isCancellationRequested) {
      this.logService.trace(`[ChatViewPane] loadSession done total=${Date.now() - t0}ms uri=${sessionResource.toString()} cancelled=true phase=preAcquire`);
      return void 0;
    }
    return this.progressService.withProgress({ location: ChatViewId, delay: 200 }, async () => {
      let queue = Promise.resolve();
      let didAcquireSession = false;
      const clearWidget = disposableTimeout(() => {
        if (token.isCancellationRequested || this.loadSessionCts.value !== cts) {
          return;
        }
        queue = this.showModel(token, void 0, false).then(() => {
        });
      }, 100);
      const clearWidgetCancellationListener = token.onCancellationRequested(() => clearWidget.dispose());
      try {
        const newModelRef = await this.chatService.acquireOrLoadSession(sessionResource, "panel" /* Chat */, token, "ChatViewPane#loadSession", sessionTypeSelectionReason);
        didAcquireSession = !!newModelRef;
        clearWidget.dispose();
        await queue;
        if (token.isCancellationRequested) {
          newModelRef?.dispose();
          this.logService.trace(`[ChatViewPane] loadSession done total=${Date.now() - t0}ms uri=${sessionResource.toString()} cancelled=true phase=postAcquire`);
          return void 0;
        }
        const localFallbackSelectionReason = getLocalFallbackSessionTypeSelectionReason(getChatSessionType(sessionResource), !!newModelRef);
        const result = await this.showModel(token, newModelRef, true, false, inputBeforeLoad, localFallbackSelectionReason);
        this.logService.trace(`[ChatViewPane] loadSession done total=${Date.now() - t0}ms uri=${sessionResource.toString()}`);
        return result;
      } catch (err) {
        clearWidget.dispose();
        await queue;
        if (token.isCancellationRequested) {
          this.logService.trace(`[ChatViewPane] loadSession done total=${Date.now() - t0}ms uri=${sessionResource.toString()} cancelled=true phase=error`);
          return void 0;
        }
        this.logService.error(`Failed to load chat session '${sessionResource.toString()}'`, err);
        this.notificationService.error(localize(12700, null, toErrorMessage(err)));
        const localFallbackSelectionReason = getLocalFallbackSessionTypeSelectionReason(getChatSessionType(sessionResource), didAcquireSession);
        const result = await this.showModel(token, void 0, true, false, inputBeforeLoad, localFallbackSelectionReason);
        this.logService.trace(`[ChatViewPane] loadSession done total=${Date.now() - t0}ms uri=${sessionResource.toString()} error=true`);
        return result;
      } finally {
        clearWidgetCancellationListener.dispose();
      }
    });
  }
  //#endregion
  focus() {
    super.focus();
    this.focusInput();
  }
  focusInput() {
    if (this.bridgeMode) {
      return;
    }
    this._widget.focusInput();
  }
  focusSessions() {
    if (this.sessionsContainer?.style.display === "none") {
      return false;
    }
    this.sessionsControl?.focus();
    return true;
  }
  relayout() {
    if (!this.bridgeMode && !this._widget?.visible) {
      return;
    }
    if (this.lastDimensions) {
      this.layoutBody(this.lastDimensions.height, this.lastDimensions.width);
    }
  }
  relayoutForInputHeight() {
    if (this.layoutingBody || !this._widget?.visible || !this.lastDimensions) {
      return;
    }
    this.layoutChatAndSessions(this.lastDimensions.height, this.lastDimensions.width, false);
  }
  layoutBody(height, width2) {
    if (this.layoutingBody) {
      return;
    }
    this.layoutingBody = true;
    try {
      this.doLayoutBody(height, width2);
    } finally {
      this.layoutingBody = false;
    }
  }
  doLayoutBody(height, width2) {
    super.layoutBody(height, width2);
    this.lastDimensions = { height, width: width2 };
    this.layoutChatAndSessions(height, width2, true);
  }
  layoutChatAndSessions(height, width2, layoutInput) {
    const taskShelfHeight = this.bridgeSessionView?.taskShelfHeight ?? 0;
    if (this.bridgeMode) {
      this.sessionsViewerSashDisposables.clear();
      this.sessionsViewerSash = void 0;
      this.lastDimensionsPerOrientation.set(this.sessionsViewerOrientation, { height, width: width2 });
      return;
    }
    let remainingHeight = Math.max(ChatViewPane.MIN_CHAT_WIDGET_HEIGHT, height - taskShelfHeight);
    const remainingWidth = width2;
    const titleHeight = this.titleControl?.getHeight() ?? 0;
    remainingHeight -= titleHeight;
    const { heightReduction, widthReduction } = this.layoutSessionsControl(remainingHeight, remainingWidth);
    const inputMaxHeight = this.sessionsViewerOrientation === 1 /* Stacked */ ? remainingHeight : void 0;
    if (layoutInput) {
      this._widget.setInputPartMaxHeightOverride(inputMaxHeight);
      this._widget.layout(remainingHeight - heightReduction, remainingWidth - widthReduction);
    } else {
      layoutChatWidgetForInputHeight(this._widget, inputMaxHeight, remainingHeight - heightReduction, remainingWidth - widthReduction);
    }
    this.lastDimensionsPerOrientation.set(this.sessionsViewerOrientation, { height, width: width2 });
  }
  layoutSessionsControl(height, width2) {
    let heightReduction = 0;
    let widthReduction = 0;
    if (!this.sessionsContainer || !this.sessionsControlContainer || !this.sessionsControl || !this.viewPaneContainer || !this.sessionsTitleContainer || !this.sessionsTitle) {
      return { heightReduction, widthReduction };
    }
    const oldSessionsViewerOrientation = this.sessionsViewerOrientation;
    let newSessionsViewerOrientation;
    switch (this.sessionsViewerOrientationConfiguration) {
      // Stacked
      case "stacked":
        newSessionsViewerOrientation = 1 /* Stacked */;
        break;
      // Update orientation based on available width
      default:
        newSessionsViewerOrientation = width2 >= ChatViewPane.SESSIONS_SIDEBAR_VIEW_MIN_WIDTH ? 2 /* SideBySide */ : 1 /* Stacked */;
    }
    this.sessionsViewerOrientation = newSessionsViewerOrientation;
    if (newSessionsViewerOrientation === 2 /* SideBySide */) {
      this.viewPaneContainer.classList.toggle("sessions-control-orientation-sidebyside", true);
      this.viewPaneContainer.classList.toggle("sessions-control-orientation-stacked", false);
      this.sessionsViewerOrientationContext.set(2 /* SideBySide */);
    } else {
      this.viewPaneContainer.classList.toggle("sessions-control-orientation-sidebyside", false);
      this.viewPaneContainer.classList.toggle("sessions-control-orientation-stacked", true);
      this.sessionsViewerOrientationContext.set(1 /* Stacked */);
    }
    if (oldSessionsViewerOrientation !== this.sessionsViewerOrientation) {
      const updatePromise = this.sessionsControl.update();
      if (this.sessionsViewerOrientation === 2 /* SideBySide */) {
        updatePromise.then((didUpdate) => {
          if (!didUpdate) {
            return;
          }
          const sessionResource = this._widget?.viewModel?.sessionResource;
          if (sessionResource) {
            this.sessionsControl?.reveal(sessionResource);
          }
        });
      }
    }
    const { visible: sessionsContainerVisible } = this.updateSessionsControlVisibility();
    if (!sessionsContainerVisible || this.sessionsViewerOrientation === 1 /* Stacked */) {
      this.sessionsViewerSashDisposables.clear();
      this.sessionsViewerSash = void 0;
    } else if (this.sessionsViewerOrientation === 2 /* SideBySide */) {
      if (!this.sessionsViewerSashDisposables.value && this.controlsRow) {
        this.createSessionsViewerSash(this.controlsRow, height, width2);
      }
    }
    if (!sessionsContainerVisible) {
      return { heightReduction: 0, widthReduction: 0 };
    }
    const sessionsTitleHeight = this.sessionsTitleContainer.offsetHeight;
    let availableSessionsHeight = height - sessionsTitleHeight;
    let reservedChatWidgetHeight = 0;
    if (this.sessionsViewerOrientation === 1 /* Stacked */) {
      reservedChatWidgetHeight = Math.max(ChatViewPane.MIN_CHAT_WIDGET_HEIGHT, this._widget?.input?.height.get() ?? 0);
      availableSessionsHeight -= reservedChatWidgetHeight;
    } else {
      availableSessionsHeight -= this.sessionsNewButtonContainer?.offsetHeight ?? 0;
    }
    availableSessionsHeight = Math.max(0, availableSessionsHeight);
    if (this.sessionsViewerOrientation === 2 /* SideBySide */) {
      const sessionsViewerSidebarWidth = this.computeEffectiveSideBySideSessionsSidebarWidth(width2);
      this.sessionsControlContainer.style.height = `${availableSessionsHeight}px`;
      this.sessionsControlContainer.style.width = `${sessionsViewerSidebarWidth}px`;
      this.sessionsControl.layout(availableSessionsHeight, sessionsViewerSidebarWidth);
      this.sessionsViewerSash?.layout();
      heightReduction = 0;
      widthReduction = sessionsViewerSidebarWidth + ChatViewPane.SESSIONS_SIDEBAR_BORDER_WIDTH;
    } else {
      this.sessionsControlContainer.style.height = `${availableSessionsHeight}px`;
      this.sessionsControlContainer.style.width = ``;
      this.sessionsControl.layout(availableSessionsHeight, width2);
      heightReduction = sessionsTitleHeight + availableSessionsHeight;
      widthReduction = 0;
    }
    return { heightReduction, widthReduction };
  }
  computeEffectiveSideBySideSessionsSidebarWidth(width2, sessionsViewerSidebarWidth = this.sessionsViewerSidebarWidth) {
    return Math.max(
      ChatViewPane.SESSIONS_SIDEBAR_MIN_WIDTH,
      // never smaller than min width for side by side sessions
      Math.min(
        sessionsViewerSidebarWidth,
        width2 - ChatViewPane.CHAT_WIDGET_DEFAULT_WIDTH
        // never so wide that chat widget is smaller than default width
      )
    );
  }
  getLastDimensions(orientation) {
    return this.lastDimensionsPerOrientation.get(orientation);
  }
  createSessionsViewerSash(container2, height, width2) {
    const disposables = this.sessionsViewerSashDisposables.value = new DisposableStore();
    const sash = this.sessionsViewerSash = disposables.add(new Sash(container2, {
      getVerticalSashLeft: () => {
        const sessionsViewerSidebarWidth = this.computeEffectiveSideBySideSessionsSidebarWidth(this.lastDimensions?.width ?? width2);
        const { position: position2 } = this.getViewPositionAndLocation();
        if (position2 === 1 /* RIGHT */) {
          return (this.lastDimensions?.width ?? width2) - sessionsViewerSidebarWidth;
        }
        return sessionsViewerSidebarWidth;
      }
    }, { orientation: 0 /* VERTICAL */ }));
    let sashStartWidth;
    disposables.add(sash.onDidStart(() => sashStartWidth = this.sessionsViewerSidebarWidth));
    disposables.add(sash.onDidEnd(() => sashStartWidth = void 0));
    disposables.add(sash.onDidChange((e4) => {
      if (sashStartWidth === void 0 || !this.lastDimensions) {
        return;
      }
      const { position: position2 } = this.getViewPositionAndLocation();
      const delta2 = e4.currentX - e4.startX;
      const newWidth = position2 === 1 /* RIGHT */ ? sashStartWidth - delta2 : sashStartWidth + delta2;
      if (newWidth < ChatViewPane.SESSIONS_SIDEBAR_SNAP_THRESHOLD) {
        this.updateConfiguredSessionsViewerOrientation("stacked");
        return;
      }
      this.sessionsViewerSidebarWidth = this.computeEffectiveSideBySideSessionsSidebarWidth(this.lastDimensions.width, newWidth);
      this.viewState.sessionsSidebarWidth = this.sessionsViewerSidebarWidth;
      this.layoutBody(this.lastDimensions.height, this.lastDimensions.width);
    }));
    disposables.add(sash.onDidReset(() => {
      this.sessionsViewerSidebarWidth = ChatViewPane.SESSIONS_SIDEBAR_DEFAULT_WIDTH;
      this.viewState.sessionsSidebarWidth = this.sessionsViewerSidebarWidth;
      this.relayout();
    }));
  }
  //#endregion
  saveState() {
    if (this._widget?.viewModel) {
      this._widget.saveState();
      this.updateViewState();
      this.memento.saveMemento();
    }
    super.saveState();
  }
  updateViewState(viewState) {
    const newViewState = viewState ?? this._widget.getInputState();
    if (newViewState) {
      for (const [key3, value2] of Object.entries(newViewState)) {
        this.viewState[key3] = value2;
      }
    }
  }
  shouldShowWelcome() {
    const noPersistedSessions = !this.chatService.hasSessions();
    const hasCoreAgent = this.chatAgentService.getAgents().some((agent) => agent.isCore && agent.locations.includes("panel" /* Chat */));
    const hasDefaultAgent = this.chatAgentService.getDefaultAgent("panel" /* Chat */) !== void 0;
    const shouldShow = !hasCoreAgent && (!hasDefaultAgent || !this._widget?.viewModel && noPersistedSessions);
    this.logService.trace(`ChatViewPane#shouldShowWelcome() = ${shouldShow}: hasCoreAgent=${hasCoreAgent} hasDefaultAgent=${hasDefaultAgent} || noViewModel=${!this._widget?.viewModel} && noPersistedSessions=${noPersistedSessions}`);
    return !!shouldShow;
  }
  getMatchingWelcomeView() {
    return this.welcomeController?.getMatchingWelcomeView();
  }
  getActionsContext() {
    return this._widget?.viewModel ? {
      sessionResource: this._widget.viewModel.sessionResource,
      $mid: 19 /* ChatViewContext */
    } : void 0;
  }
};

ChatViewPane = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IHoverService),
  __decorateParam(10, IStorageService),
  __decorateParam(11, IChatService),
  __decorateParam(12, IChatAgentService),
  __decorateParam(13, ILogService),
  __decorateParam(14, INotificationService),
  __decorateParam(15, IWorkbenchLayoutService),
  __decorateParam(16, IChatSessionsService),
  __decorateParam(17, ITelemetryService),
  __decorateParam(18, ILifecycleService),
  __decorateParam(19, IProgressService),
  __decorateParam(20, IAgentSessionsService),
  __decorateParam(21, IChatEntitlementService),
  __decorateParam(22, ICommandService),
  __decorateParam(23, IActivityService),
  __decorateParam(24, IHostService),
  __decorateParam(25, IMicCaptureService),
  __decorateParam(26, ITtsPlaybackService),
  __decorateParam(27, IVoiceSessionController),
  __decorateParam(28, IVoiceInputModeService),
  __decorateParam(29, IChatWidgetService),
  __decorateParam(30, IAgentTitleBarStatusService),
  __decorateParam(31, IVoicePlaybackService),
  __decorateParam(32, IWorkbenchEnvironmentService),
  __decorateParam(33, IWorkspaceContextService),
  __decorateParam(34, IAgentHostEnablementService),
  __decorateParam(35, IAccessibilityService)
], ChatViewPane);
export { ChatViewPane };
