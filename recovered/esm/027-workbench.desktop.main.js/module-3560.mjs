// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/welcomeAgentSessions/browser/agentSessionsWelcome.ts
import { EditorPane } from "./module-1089.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { AgentSessionProviders } from "./module-0982.mjs";
import { $, addDisposableListener, append, clearNode, getWindow, scheduleAtNextAnimationFrame } from "./module-0075.mjs";
import { localize } from "./module-0001.mjs";
import { ChatContextKeys } from "./module-0965.mjs";
import { DomScrollableElement } from "./module-0259.mjs";
import { Codicon } from "./module-0085.mjs";
import { renderIcon } from "./module-0467.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { Emitter } from "./module-0017.mjs";
import { getResourceForNewChatSession } from "./module-1478.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { IWorkspacesService, isRecentFolder, isRecentWorkspace } from "./module-1379.mjs";
import { ChatWidget } from "./module-2394.mjs";
import { SIDE_BAR_FOREGROUND } from "./module-0912.mjs";
import { editorBackground } from "./module-0229.mjs";
import { basename2 } from "./module-0034.mjs";
import { getListStyles, getToggleStyles } from "./module-0513.mjs";
import { AgentSessionsFilter } from "./module-2754.mjs";
import { ACTION_ID_NEW_CHAT } from "./module-1476.mjs";
import { AgentSessionsListDelegate } from "./module-2755.mjs";
import { AgentSessionsControl } from "./module-2759.mjs";
import { canShowAgentsBanner, createAgentsBanner } from "./module-3556.mjs";
import { GettingStartedInput } from "./module-3494.mjs";
import { MarkdownString } from "./module-0462.mjs";
import { Toggle } from "./module-0549.mjs";
import { toErrorMessage } from "./module-0094.mjs";
import { ChatViewId, IChatWidgetService } from "./module-0981.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IAgentSessionsService } from "./module-1464.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IProductService } from "./module-0873.mjs";
import { IWalkthroughsService } from "./module-3495.mjs";
import { IChatService } from "./module-0972.mjs";
import { IChatEntitlementService } from "./module-0953.mjs";
import { IMarkdownRendererService } from "./module-0541.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IHostService } from "./module-1117.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { IViewDescriptorService } from "./module-1093.mjs";
import { ILogService } from "./module-0095.mjs";
import { AgentSessionsWelcomeInput } from "./module-3559.mjs";


// src/vs/workbench/contrib/welcomeAgentSessions/browser/agentSessionsWelcome.ts
var configurationKey3 = "workbench.startupEditor";

var MAX_SESSIONS = 6;

var MAX_REPO_PICKS = 10;

var MAX_WALKTHROUGHS = 10;

var WELCOME_CHAT_INPUT_LAYOUT_HEIGHT = 150;

var WELCOME_CHAT_INPUT_RESERVED_LIST_HEIGHT = 50;

var WELCOME_CHAT_INPUT_RESERVED_CHROME_HEIGHT = 72;

var WELCOME_COMPACT_HEIGHT = 800;

var WELCOME_CHAT_INPUT_MAX_HEIGHT_OVERRIDE = WELCOME_CHAT_INPUT_LAYOUT_HEIGHT + WELCOME_CHAT_INPUT_RESERVED_LIST_HEIGHT + WELCOME_CHAT_INPUT_RESERVED_CHROME_HEIGHT;

var AgentSessionsWelcomePage = class extends EditorPane {
  constructor(group2, telemetryService, themeService, storageService, instantiationService, contextKeyService, layoutService, commandService, editorService, agentSessionsService, configurationService, productService, walkthroughsService, chatService, chatEntitlementService, markdownRendererService, workspaceContextService, workspacesService, hostService, workspaceTrustManagementService, viewDescriptorService, chatWidgetService, logService) {
    super(AgentSessionsWelcomePage.ID, group2, telemetryService, themeService, storageService);
    this.storageService = storageService;
    this.instantiationService = instantiationService;
    this.layoutService = layoutService;
    this.commandService = commandService;
    this.editorService = editorService;
    this.agentSessionsService = agentSessionsService;
    this.configurationService = configurationService;
    this.productService = productService;
    this.walkthroughsService = walkthroughsService;
    this.chatService = chatService;
    this.chatEntitlementService = chatEntitlementService;
    this.markdownRendererService = markdownRendererService;
    this.workspaceContextService = workspaceContextService;
    this.workspacesService = workspacesService;
    this.hostService = hostService;
    this.workspaceTrustManagementService = workspaceTrustManagementService;
    this.viewDescriptorService = viewDescriptorService;
    this.chatWidgetService = chatWidgetService;
    this.logService = logService;
    this.sessionsControlDisposables = this._register(new DisposableStore());
    this.contentDisposables = this._register(new DisposableStore());
    this.walkthroughs = [];
    this._selectedSessionProvider = AgentSessionProviders.Local;
    this._recentTrustedWorkspaces = [];
    this._isEmptyWorkspace = false;
    this._workspaceKind = "empty";
    // Telemetry tracking
    this._openedAt = 0;
    this.container = $(".agentSessionsWelcome", {
      role: "document",
      tabindex: 0,
      "aria-label": localize(21867, null)
    });
    this.contextService = this._register(contextKeyService.createScoped(this.container));
    ChatContextKeys.inAgentSessionsWelcome.bindTo(this.contextService).set(true);
    this._register(this.chatEntitlementService.onDidChangeSentiment(() => {
      const input = this.input || this._storedInput;
      if (this.chatEntitlementService.sentiment.hidden && input) {
        this._closedBy = "chatHidden";
        this.group.closeEditor(input);
      }
    }));
  }
  static {
    this.ID = "agentSessionsWelcomePage";
  }
  static {
    this.COMMAND_ID = "workbench.action.openAgentSessionsWelcome";
  }
  createEditor(parent) {
    parent.appendChild(this.container);
    this.contentContainer = $(".agentSessionsWelcome-content");
    this.scrollableElement = this._register(new DomScrollableElement(this.contentContainer, {
      className: "agentSessionsWelcome-scrollable",
      vertical: 1 /* Auto */
    }));
    this.container.appendChild(this.scrollableElement.getDomNode());
  }
  async setInput(input, options3, context2, token) {
    this._storedInput = input;
    this._openedAt = Date.now();
    await super.setInput(input, options3, context2, token);
    this._workspaceKind = input.workspaceKind ?? "empty";
    await this.buildContent();
  }
  clearInput() {
    if (this._openedAt > 0) {
      const visibleDurationMs = Date.now() - this._openedAt;
      this.telemetryService.publicLog2(
        "agentSessionsWelcome.closed",
        {
          visibleDurationMs,
          closedBy: this._closedBy ?? "disposed"
        }
      );
      this._openedAt = 0;
      this._closedBy = void 0;
    }
    super.clearInput();
  }
  async buildContent() {
    this.contentDisposables.clear();
    this.sessionsControlDisposables.clear();
    this.sessionsControl = void 0;
    clearNode(this.contentContainer);
    this._isEmptyWorkspace = this.workspaceContextService.getWorkbenchState() === 1 /* EMPTY */;
    if (this._isEmptyWorkspace) {
      const recentlyOpened = await this.getRecentlyOpenedWorkspaces(true);
      this._recentTrustedWorkspaces = recentlyOpened.slice(0, MAX_REPO_PICKS);
    }
    this.walkthroughs = this.walkthroughsService.getWalkthroughs();
    const header2 = append(this.contentContainer, $(".agentSessionsWelcome-header"));
    append(header2, $("h1.product-name", {}, this.productService.nameLong));
    const startEntries2 = append(header2, $(".agentSessionsWelcome-startEntries"));
    await this.buildStartEntries(startEntries2);
    const chatSection = append(this.contentContainer, $(".agentSessionsWelcome-chatSection"));
    this.buildChatWidget(chatSection);
    const sessionsSection = append(this.contentContainer, $(".agentSessionsWelcome-sessionsSection"));
    this.buildSessionsOrPrompts(sessionsSection);
    const footer = append(this.contentContainer, $(".agentSessionsWelcome-footer"));
    this.buildFooter(footer);
    let originalSessions = this.agentSessionsService.model.sessions.length > 0;
    this.contentDisposables.add(this.agentSessionsService.model.onDidChangeSessions(() => {
      const hasSessions = this.agentSessionsService.model.sessions.length > 0;
      if (hasSessions !== originalSessions) {
        originalSessions = hasSessions;
        clearNode(sessionsSection);
        this.buildSessionsOrPrompts(sessionsSection);
      }
      this.layoutSessionsControl();
    }));
    this.scrollableElement?.scanDomNode();
  }
  async buildStartEntries(container3) {
    const workspaces = await this.getRecentlyOpenedWorkspaces(false);
    const openEntry2 = workspaces.length > 0 ? { icon: Codicon.folderOpened, label: localize(21874, null), command: "workbench.action.openRecent" } : { icon: Codicon.folderOpened, label: localize(21873, null), command: "workbench.action.files.openFolder" };
    const entries2 = [
      openEntry2,
      { icon: Codicon.newFile, label: localize(21871, null), command: "welcome.showNewFileEntries" },
      { icon: Codicon.repoClone, label: localize(21869, null), command: "git.clone" }
    ];
    for (const entry of entries2) {
      const button = append(container3, $("button.agentSessionsWelcome-startEntry"));
      button.appendChild(renderIcon(entry.icon));
      button.appendChild(document.createTextNode(entry.label));
      button.onclick = () => {
        this.telemetryService.publicLog2(
          "agentSessionsWelcome.ActionExecuted",
          { welcomeKind: "agentSessionsWelcomePage", action: "executeCommand", actionId: entry.command }
        );
        this.commandService.executeCommand(entry.command);
      };
    }
  }
  buildChatWidget(container3) {
    const chatWidgetContainer = append(container3, $(".agentSessionsWelcome-chatWidget"));
    const editorOverflowWidgetsDomNode = this.layoutService.getContainer(getWindow(chatWidgetContainer)).appendChild($(".chat-editor-overflow.monaco-editor"));
    this.contentDisposables.add(toDisposable(() => editorOverflowWidgetsDomNode.remove()));
    const scopedContextKeyService = this.contentDisposables.add(this.contextService.createScoped(chatWidgetContainer));
    const scopedInstantiationService = this.contentDisposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, scopedContextKeyService])));
    const onDidChangeActiveSessionProvider = this.contentDisposables.add(new Emitter());
    const recreateSessionForProvider = async (provider) => {
      if (this.chatWidget && this.chatModelRef) {
        this.chatWidget.setModel(void 0);
        this.chatModelRef.dispose();
        const newResource = getResourceForNewChatSession({
          type: provider,
          position: "sidebar" /* Sidebar */,
          displayName: ""
        });
        const ref = await this.chatService.acquireOrLoadSession(newResource, "panel" /* Chat */, CancellationToken.None);
        this.chatModelRef = ref ?? this.chatService.startNewLocalSession("panel" /* Chat */);
        this.contentDisposables.add(this.chatModelRef);
        if (this.chatModelRef.object) {
          this.chatWidget.setModel(this.chatModelRef.object);
        }
      }
    };
    const sessionTypePickerDelegate = {
      getActiveSessionProvider: () => this._selectedSessionProvider,
      setActiveSessionProvider: (provider) => {
        this._selectedSessionProvider = provider;
        onDidChangeActiveSessionProvider.fire(provider);
        try {
          recreateSessionForProvider(provider);
        } catch {
        }
      },
      onDidChangeActiveSessionProvider: onDidChangeActiveSessionProvider.event
    };
    const onDidChangeSelectedWorkspace = this.contentDisposables.add(new Emitter());
    const onDidChangeWorkspaces = this.contentDisposables.add(new Emitter());
    const workspacePickerDelegate = this._isEmptyWorkspace ? {
      getWorkspaces: () => this._recentTrustedWorkspaces.map((w) => ({
        uri: this.getWorkspaceUri(w),
        label: this.getWorkspaceLabel(w),
        isFolder: isRecentFolder(w)
      })),
      getSelectedWorkspace: () => this._selectedWorkspace,
      setSelectedWorkspace: (workspace) => {
        this._selectedWorkspace = workspace;
        onDidChangeSelectedWorkspace.fire(workspace);
      },
      onDidChangeSelectedWorkspace: onDidChangeSelectedWorkspace.event,
      onDidChangeWorkspaces: onDidChangeWorkspaces.event,
      openFolderCommand: "workbench.action.files.openFolder"
    } : void 0;
    this.chatWidget = this.contentDisposables.add(scopedInstantiationService.createInstance(
      ChatWidget,
      "panel" /* Chat */,
      // TODO: @osortega should we have a completely different ID and check that context instead in chatInputPart?
      {},
      // Empty resource view context
      {
        autoScroll: (mode) => mode !== "ask" /* Ask */,
        renderFollowups: false,
        supportsFileReferences: true,
        renderInputOnTop: true,
        rendererOptions: {
          renderTextEditsAsSummary: () => true,
          referencesExpandedWhenEmptyResponse: false,
          progressMessageAtBottomOfResponse: (mode) => mode !== "ask" /* Ask */
        },
        editorOverflowWidgetsDomNode,
        enableImplicitContext: true,
        enableWorkingSet: "explicit",
        supportsChangingModes: true,
        sessionTypePickerDelegate,
        workspacePickerDelegate,
        submitHandler: this._isEmptyWorkspace ? (query, mode) => this.handleWorkspaceSubmission(query, mode) : void 0
      },
      {
        listForeground: SIDE_BAR_FOREGROUND,
        listBackground: editorBackground,
        overlayBackground: editorBackground,
        inputEditorBackground: editorBackground,
        resultEditorBackground: editorBackground
      }
    ));
    this.chatWidget.render(chatWidgetContainer);
    this.chatWidget.setVisible(true);
    this.contentDisposables.add(scheduleAtNextAnimationFrame(getWindow(chatWidgetContainer), () => {
      this.layoutChatWidget();
    }));
    this.chatModelRef = this.chatService.startNewLocalSession("panel" /* Chat */);
    this.contentDisposables.add(this.chatModelRef);
    if (this.chatModelRef.object) {
      this.chatWidget.setModel(this.chatModelRef.object);
    }
    this.contentDisposables.add(addDisposableListener(chatWidgetContainer, "mousedown", () => {
      this.chatWidget?.focusInput();
    }));
    this.contentDisposables.add(this.chatService.onDidSubmitRequest(({ chatSessionResource }) => {
      if (this.chatModelRef?.object?.sessionResource.toString() === chatSessionResource.toString()) {
        const mode = this.chatWidget?.input.currentModeObs.get().name.get() || "unknown";
        this.telemetryService.publicLog2(
          "agentSessionsWelcome.chatSubmitted",
          {
            mode,
            provider: this._selectedSessionProvider,
            workspaceKind: this._workspaceKind,
            selectedRecentWorkspace: this._selectedWorkspace !== void 0
          }
        );
        this._closedBy = "chatSubmission";
        this.openSessionInChat(chatSessionResource);
      }
    }));
    this.applyPrefillData();
  }
  getWorkspaceLabel(workspace) {
    if (isRecentFolder(workspace)) {
      return workspace.label || basename2(workspace.folderUri);
    } else if (isRecentWorkspace(workspace)) {
      return workspace.label || basename2(workspace.workspace.configPath);
    }
    return "";
  }
  getWorkspaceUri(workspace) {
    if (isRecentFolder(workspace)) {
      return workspace.folderUri;
    } else if (isRecentWorkspace(workspace)) {
      return workspace.workspace.configPath;
    }
    throw new Error("Invalid workspace type");
  }
  async handleWorkspaceSubmission(query, mode) {
    if (!this._selectedWorkspace) {
      return false;
    }
    if (!query.trim()) {
      return false;
    }
    const prefillData = {
      query,
      mode,
      timestamp: Date.now()
    };
    this.storageService.store(
      "chat.welcomeViewPrefill",
      JSON.stringify(prefillData),
      -1 /* APPLICATION */,
      1 /* MACHINE */
    );
    const workspace = this._recentTrustedWorkspaces.find((w) => this.getWorkspaceUri(w).toString() === this._selectedWorkspace?.uri.toString());
    if (workspace) {
      try {
        if (isRecentFolder(workspace)) {
          await this.hostService.openWindow([{ folderUri: workspace.folderUri }]);
        } else if (isRecentWorkspace(workspace)) {
          await this.hostService.openWindow([{ workspaceUri: workspace.workspace.configPath }]);
        }
        return true;
      } catch (e) {
      }
    }
    this.storageService.remove("chat.welcomeViewPrefill", -1 /* APPLICATION */);
    return false;
  }
  /**
   * Reads and applies prefill data from storage (used when transferring chat input from another workspace).
   * This is called after the chat widget is created to populate it with any pending prefill data.
   */
  applyPrefillData() {
    const prefillData = this.storageService.get("chat.welcomeViewPrefill", -1 /* APPLICATION */);
    if (prefillData) {
      this.storageService.remove("chat.welcomeViewPrefill", -1 /* APPLICATION */);
      try {
        const { query, mode, timestamp } = JSON.parse(prefillData);
        if (timestamp && Date.now() - timestamp > 60 * 1e3) {
          return;
        }
        if (query && this.chatWidget) {
          this.chatWidget.setInput(query);
        }
        if (mode !== void 0 && this.chatWidget) {
          this.chatWidget.input.setChatMode(mode, false);
        }
        this.chatWidget?.focusInput();
      } catch {
      }
    }
  }
  buildSessionsOrPrompts(container3) {
    this.sessionsControlDisposables.clear();
    this.sessionsControl = void 0;
    const sessions = this.agentSessionsService.model.sessions.filter((s) => !s.isArchived());
    if (sessions.length > 0) {
      this.buildSessionsGrid(container3, sessions);
    } else {
      this.buildWalkthroughs(container3);
    }
  }
  buildSessionsGrid(container3, _sessions) {
    this.sessionsControlContainer = append(container3, $(".agentSessionsWelcome-sessionsGrid"));
    const options3 = {
      overrideStyles: getListStyles({
        listBackground: editorBackground
      }),
      filter: this.sessionsControlDisposables.add(this.instantiationService.createInstance(AgentSessionsFilter, {
        limitResults: () => MAX_SESSIONS,
        overrideExclude: (session) => session.isArchived() ? true : void 0
      })),
      createNewChat: () => this.commandService.executeCommand(ACTION_ID_NEW_CHAT, this.chatWidget?.viewModel ? {
        $mid: 19 /* ChatViewContext */,
        sessionResource: this.chatWidget.viewModel.sessionResource
      } : void 0),
      getHoverPosition: () => 2 /* BELOW */,
      trackActiveEditorSession: () => false,
      source: "welcomeView",
      itemHeight: AgentSessionsListDelegate.ITEM_HEIGHT,
      sectionHeight: AgentSessionsListDelegate.SECTION_HEIGHT,
      notifySessionOpened: () => {
        const isProjectionEnabled = this.configurationService.getValue("chat.agentSessionProjection.enabled" /* AgentSessionProjectionEnabled */);
        if (!isProjectionEnabled) {
          this._closedBy = "sessionClicked";
          this.revealMaximizedChat();
        }
      }
    };
    this.sessionsControl = this.sessionsControlDisposables.add(this.instantiationService.createInstance(
      AgentSessionsControl,
      this.sessionsControlContainer,
      options3
    ));
    this.sessionsControlDisposables.add(this.agentSessionsService.model.onDidResolve(() => {
      this.layoutSessionsControl();
    }));
    if (this.agentSessionsService.model.resolved) {
      this.layoutSessionsControl();
    }
    this.sessionsControlDisposables.add(scheduleAtNextAnimationFrame(getWindow(this.sessionsControlContainer), () => {
      this.layoutSessionsControl();
    }));
    if (canShowAgentsBanner(this.chatEntitlementService)) {
      const agentsBanner = createAgentsBanner(
        {
          cssClass: "agentSessionsWelcome-agentsBanner",
          source: "agentSessionsWelcome",
          label: localize(21879, null),
          onButtonClick: () => {
            this._closedBy = "viewAllSessions";
          }
        },
        this.commandService,
        this.telemetryService
      );
      this.sessionsControlDisposables.add(agentsBanner.disposables);
      append(container3, agentsBanner.element);
    }
  }
  buildWalkthroughs(container3) {
    const activeWalkthroughs = this.walkthroughs.filter(
      (w) => !w.when || this.contextService.contextMatchesRules(w.when)
    ).slice(0, MAX_WALKTHROUGHS);
    if (activeWalkthroughs.length === 0) {
      return;
    }
    let currentIndex = 0;
    const card = append(container3, $(".agentSessionsWelcome-walkthroughCard"));
    const iconContainer = append(card, $(".agentSessionsWelcome-walkthroughCard-icon"));
    const content2 = append(card, $(".agentSessionsWelcome-walkthroughCard-content"));
    const title = append(content2, $(".agentSessionsWelcome-walkthroughCard-title"));
    const desc = append(content2, $(".agentSessionsWelcome-walkthroughCard-description"));
    const navContainer = append(card, $(".agentSessionsWelcome-walkthroughCard-nav"));
    const prevButton = append(navContainer, $("button.nav-button"));
    prevButton.appendChild(renderIcon(Codicon.chevronLeft));
    prevButton.title = localize(21875, null);
    const nextButton = append(navContainer, $("button.nav-button"));
    nextButton.appendChild(renderIcon(Codicon.chevronRight));
    nextButton.title = localize(21872, null);
    const updateContent = () => {
      const walkthrough = activeWalkthroughs[currentIndex];
      clearNode(iconContainer);
      if (walkthrough.icon.type === "icon") {
        iconContainer.appendChild(renderIcon(walkthrough.icon.icon));
      }
      title.textContent = walkthrough.title;
      desc.textContent = walkthrough.description || "";
      prevButton.disabled = currentIndex === 0;
      nextButton.disabled = currentIndex === activeWalkthroughs.length - 1;
    };
    updateContent();
    card.onclick = () => {
      const walkthrough = activeWalkthroughs[currentIndex];
      this.telemetryService.publicLog2(
        "agentSessionsWelcome.ActionExecuted",
        { welcomeKind: "agentSessionsWelcomePage", action: "openWalkthrough", actionId: walkthrough.id }
      );
      const options3 = {
        selectedCategory: walkthrough.id,
        returnToCommand: AgentSessionsWelcomePage.COMMAND_ID
      };
      this.editorService.openEditor({
        resource: GettingStartedInput.RESOURCE,
        options: options3
      });
    };
    prevButton.onclick = (e) => {
      e.stopPropagation();
      if (currentIndex > 0) {
        currentIndex--;
        updateContent();
      }
    };
    nextButton.onclick = (e) => {
      e.stopPropagation();
      if (currentIndex < activeWalkthroughs.length - 1) {
        currentIndex++;
        updateContent();
      }
    };
  }
  static {
    this.PRIVACY_NOTICE_DISMISSED_KEY = "agentSessionsWelcome.privacyNoticeDismissed";
  }
  buildPrivacyNotice(container3) {
    if (!this.chatEntitlementService.anonymous) {
      return;
    }
    if (this.storageService.getBoolean(AgentSessionsWelcomePage.PRIVACY_NOTICE_DISMISSED_KEY, -1 /* APPLICATION */, false)) {
      return;
    }
    const providers2 = this.productService.defaultChatAgent?.provider;
    if (!providers2 || !providers2.default || !this.productService.defaultChatAgent?.termsStatementUrl || !this.productService.defaultChatAgent?.privacyStatementUrl) {
      return;
    }
    const tosCard = append(container3, $(".agentSessionsWelcome-walkthroughCard.agentSessionsWelcome-tosCard"));
    const dismissNotice = () => {
      this.storageService.store(AgentSessionsWelcomePage.PRIVACY_NOTICE_DISMISSED_KEY, true, -1 /* APPLICATION */, 0 /* USER */);
      tosCard.remove();
    };
    this.contentDisposables.add(this.chatService.onDidSubmitRequest(() => dismissNotice()));
    const iconContainer = append(tosCard, $(".agentSessionsWelcome-walkthroughCard-icon"));
    iconContainer.appendChild(renderIcon(Codicon.chatSparkle));
    const content2 = append(tosCard, $(".agentSessionsWelcome-walkthroughCard-content"));
    const title = append(content2, $(".agentSessionsWelcome-walkthroughCard-title"));
    title.textContent = localize(21878, null);
    const desc = append(content2, $(".agentSessionsWelcome-walkthroughCard-description"));
    const descriptionMarkdown = new MarkdownString(
      localize(
        21877,
        null,
        providers2.default.name,
        this.productService.defaultChatAgent.termsStatementUrl,
        this.productService.defaultChatAgent.privacyStatementUrl
      ),
      { isTrusted: true }
    );
    const renderedMarkdown = this.markdownRendererService.render(descriptionMarkdown);
    desc.appendChild(renderedMarkdown.element);
    const dismissButton = append(tosCard, $("button.agentSessionsWelcome-tosCard-dismiss"));
    dismissButton.appendChild(renderIcon(Codicon.close));
    dismissButton.title = localize(21870, null);
    dismissButton.onclick = (e) => {
      e.stopPropagation();
      dismissNotice();
    };
  }
  buildFooter(container3) {
    this.buildPrivacyNotice(container3);
    const showOnStartupContainer = append(container3, $(".agentSessionsWelcome-showOnStartup"));
    const showOnStartupCheckbox = this.contentDisposables.add(new Toggle({
      icon: Codicon.check,
      actionClassName: "agentSessionsWelcome-checkbox",
      isChecked: this.configurationService.getValue(configurationKey3) === "agentSessionsWelcomePage",
      title: localize(21868, null),
      ...getToggleStyles({
        inputActiveOptionBackground: "var(--vscode-descriptionForeground)",
        inputActiveOptionForeground: "var(--vscode-editor-background)",
        inputActiveOptionBorder: "var(--vscode-descriptionForeground)"
      })
    }));
    showOnStartupCheckbox.domNode.id = "showOnStartup";
    const showOnStartupLabel = $("label.caption", { for: "showOnStartup" }, localize(21876, null));
    const onShowOnStartupChanged = () => {
      if (showOnStartupCheckbox.checked) {
        this.configurationService.updateValue(configurationKey3, "agentSessionsWelcomePage");
      } else {
        this.configurationService.updateValue(configurationKey3, "none");
      }
    };
    this.contentDisposables.add(showOnStartupCheckbox.onChange(() => onShowOnStartupChanged()));
    this.contentDisposables.add(addDisposableListener(showOnStartupLabel, "click", () => {
      showOnStartupCheckbox.checked = !showOnStartupCheckbox.checked;
      onShowOnStartupChanged();
    }));
    showOnStartupContainer.appendChild(showOnStartupCheckbox.domNode);
    showOnStartupContainer.appendChild(showOnStartupLabel);
  }
  layout(dimension) {
    this.lastDimension = dimension;
    this.container.style.height = `${dimension.height}px`;
    this.container.style.width = `${dimension.width}px`;
    this.container.classList.toggle("height-constrained", dimension.height <= WELCOME_COMPACT_HEIGHT);
    this.layoutChatWidget();
    this.layoutSessionsControl();
    this.scrollableElement?.scanDomNode();
  }
  layoutChatWidget() {
    if (!this.chatWidget || !this.lastDimension) {
      return;
    }
    const chatWidth = Math.min(800, this.lastDimension.width - 80);
    this.chatWidget.setInputPartMaxHeightOverride(WELCOME_CHAT_INPUT_MAX_HEIGHT_OVERRIDE);
    this.chatWidget.layout(WELCOME_CHAT_INPUT_LAYOUT_HEIGHT, chatWidth);
  }
  layoutSessionsControl() {
    if (!this.sessionsControl || !this.sessionsControlContainer || !this.lastDimension) {
      return;
    }
    const sessionsWidth = Math.min(800, this.lastDimension.width - 80);
    const visibleSessions = Math.min(
      this.agentSessionsService.model.sessions.filter((s) => !s.isArchived()).length,
      MAX_SESSIONS
    );
    const sessionsHeight = visibleSessions * AgentSessionsListDelegate.ITEM_HEIGHT;
    this.sessionsControl.layout(sessionsHeight, sessionsWidth);
    const marginOffset = Math.floor(visibleSessions / 2) * AgentSessionsListDelegate.ITEM_HEIGHT;
    this.sessionsControl.element.style.marginBottom = `-${marginOffset}px`;
  }
  focus() {
    super.focus();
    this.chatWidget?.focusInput();
  }
  async revealMaximizedChat() {
    try {
      await this.closeEditorAndMaximizeAuxiliaryBar();
    } catch (error) {
      this.logService.error("Failed to open maximized chat: {0}", toErrorMessage(error));
    }
  }
  async openSessionInChat(sessionResource) {
    try {
      await this.closeEditorAndMaximizeAuxiliaryBar(sessionResource);
    } catch (error) {
      this.logService.error("Failed to open agent session: {0}", toErrorMessage(error));
    }
  }
  async closeEditorAndMaximizeAuxiliaryBar(sessionResource) {
    const editorToClose = this.input || this._storedInput;
    if (editorToClose && this.group.contains(editorToClose)) {
      await new Promise((resolve3) => {
        const disposable = this.group.onDidActiveEditorChange((e) => {
          disposable.dispose();
          resolve3();
        });
        this.group.closeEditor(editorToClose);
      });
    }
    if (sessionResource) {
      await this.chatWidgetService.openSession(sessionResource);
    } else {
      await this.commandService.executeCommand("workbench.action.chat.open");
    }
    const chatViewLocation = this.viewDescriptorService.getViewLocationById(ChatViewId);
    if (chatViewLocation === 2 /* AuxiliaryBar */) {
      this.layoutService.setAuxiliaryBarMaximized(true);
    }
  }
  async getRecentlyOpenedWorkspaces(onlyTrusted = false) {
    const workspaces = await this.workspacesService.getRecentlyOpened();
    const trustInfoPromises = workspaces.workspaces.map(async (ws) => {
      const uri5 = isRecentWorkspace(ws) ? ws.workspace.configPath : ws.folderUri;
      const trustInfo = await this.workspaceTrustManagementService.getUriTrustInfo(uri5);
      return { workspace: ws, trusted: trustInfo.trusted };
    });
    const trustInfoResults = await Promise.all(trustInfoPromises);
    const filteredWorkspaces = trustInfoResults.filter((result) => onlyTrusted ? result.trusted : true).map((result) => result.workspace);
    return filteredWorkspaces;
  }
};

AgentSessionsWelcomePage = __decorateClass([
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IThemeService),
  __decorateParam(3, IStorageService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IContextKeyService),
  __decorateParam(6, IWorkbenchLayoutService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, IEditorService),
  __decorateParam(9, IAgentSessionsService),
  __decorateParam(10, IConfigurationService),
  __decorateParam(11, IProductService),
  __decorateParam(12, IWalkthroughsService),
  __decorateParam(13, IChatService),
  __decorateParam(14, IChatEntitlementService),
  __decorateParam(15, IMarkdownRendererService),
  __decorateParam(16, IWorkspaceContextService),
  __decorateParam(17, IWorkspacesService),
  __decorateParam(18, IHostService),
  __decorateParam(19, IWorkspaceTrustManagementService),
  __decorateParam(20, IViewDescriptorService),
  __decorateParam(21, IChatWidgetService),
  __decorateParam(22, ILogService)
], AgentSessionsWelcomePage);

var AgentSessionsWelcomeInputSerializer = class {
  canSerialize(editorInput) {
    return true;
  }
  serialize(editorInput) {
    return JSON.stringify({});
  }
  deserialize(instantiationService, serializedEditorInput) {
    return new AgentSessionsWelcomeInput({});
  }
};
export { configurationKey3, MAX_SESSIONS, MAX_REPO_PICKS, MAX_WALKTHROUGHS, WELCOME_CHAT_INPUT_LAYOUT_HEIGHT, WELCOME_CHAT_INPUT_RESERVED_LIST_HEIGHT, WELCOME_CHAT_INPUT_RESERVED_CHROME_HEIGHT, WELCOME_COMPACT_HEIGHT, WELCOME_CHAT_INPUT_MAX_HEIGHT_OVERRIDE, AgentSessionsWelcomePage, AgentSessionsWelcomeInputSerializer };
