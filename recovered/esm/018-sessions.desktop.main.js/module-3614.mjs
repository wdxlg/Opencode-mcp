// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/newChatWidget.ts
import { Disposable, DisposableMap, DisposableStore, MutableDisposable, toDisposable } from "./module-0012.mjs";
import { SessionWorkspacePickerVisibleContext } from "./module-1770.mjs";
import { derivedObservableWithCache } from "./module-0059.mjs";
import { derived } from "./module-0054.mjs";
import { isWeb } from "./module-0014.mjs";
import { WebWorkspacePicker } from "./module-3567.mjs";
import { WorkspacePicker } from "./module-3564.mjs";
import { SESSION_WORKSPACE_GROUP_GITHUB } from "./module-1767.mjs";
import { isAllowSignedOutWhenUsableEnabled, shouldShowGitHubWorkspaceGroupSignIn } from "./module-1799.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { AGENTIC_SIGN_IN_COMMAND_ID } from "./module-1800.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { AGENT_FEEDBACK_NEW_SESSION_RESOURCE, IAgentFeedbackService } from "./module-3611.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { TOTAL_SESSIONS_KEY } from "./module-3613.mjs";
import { NewChatInputWidget } from "./module-3582.mjs";
import { constObservable } from "./module-0061.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { getAdditionalFolderContextId, getAdditionalRepositoryContextId } from "./module-3563.mjs";
import { basename2 } from "./module-0034.mjs";
import { autorun } from "./module-0052.mjs";
import { $, EventType, addDisposableListener, append, clearNode, getWindow } from "./module-0075.mjs";
import { chatInputStackClass, setChatInputStackSlot } from "./module-2033.mjs";
import { Action } from "./module-0082.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { Menus } from "./module-3437.mjs";
import { ChatInputTipPresenter } from "./module-2365.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { NoAgentHostEmptyState } from "./module-3583.mjs";
import { buildNewSessionPrompt } from "./module-3589.mjs";
import { Event2 } from "./module-0017.mjs";
import { SessionInputBannerWidget } from "./module-3612.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ILogService } from "./module-0095.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IAquariumService } from "./module-3556.mjs";
import { IAgentHostFilterService } from "./module-3520.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { IChatPetService } from "./module-2112.mjs";
import { IChatTipService } from "./module-2363.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IDefaultAccountService } from "./module-0741.mjs";
import { IStorageService } from "./module-0512.mjs";
import { INewSessionComposerService } from "./module-3561.mjs";


// src/vs/sessions/contrib/chat/browser/newChatWidget.ts
var MIN_SESSIONS_FOR_FIRST_RUN_NOTICES = 2;

var NewChatWidget = class extends Disposable {
  constructor(options3, instantiationService, contextKeyService, contextMenuService, configurationService, logService, sessionsManagementService, sessionsService, aquariumService, agentHostFilterService, uriIdentityService, agentFeedbackService, chatPetService, chatTipService, openerService, defaultAccountService, storageService, newSessionComposerService) {
    super();
    this.options = options3;
    this.instantiationService = instantiationService;
    this.contextKeyService = contextKeyService;
    this.contextMenuService = contextMenuService;
    this.configurationService = configurationService;
    this.logService = logService;
    this.sessionsManagementService = sessionsManagementService;
    this.sessionsService = sessionsService;
    this.aquariumService = aquariumService;
    this.agentHostFilterService = agentHostFilterService;
    this.uriIdentityService = uriIdentityService;
    this.agentFeedbackService = agentFeedbackService;
    this.chatPetService = chatPetService;
    this.chatTipService = chatTipService;
    this.openerService = openerService;
    this.defaultAccountService = defaultAccountService;
    this.storageService = storageService;
    this._chatTipPresenter = this._register(new MutableDisposable());
    this._isChatTipSessionInitialized = false;
    /** Recreates the draft once a better/late-registering provider can serve the folder (see {@link _createNewSession}). */
    this._pendingPreferredUpgrade = new MutableDisposable();
    this._newSessionCreation = new MutableDisposable();
    /** In-flight background sends awaiting confirmation before their comments are cleared. */
    this._pendingBackgroundSends = this._register(new DisposableMap());
    this._workspacePickerVisibleKey = SessionWorkspacePickerVisibleContext.bindTo(contextKeyService);
    this._register(toDisposable(() => this._workspacePickerVisibleKey.reset()));
    this._register(this._pendingPreferredUpgrade);
    this._register(this._newSessionCreation);
    this._session = derivedObservableWithCache(this, (reader, prev) => {
      const activeSession = this.sessionsService.activeSession.read(reader);
      if (activeSession && activeSession.isCreated.read(reader)) {
        return prev;
      }
      return activeSession;
    });
    this._isQuickChatComposer = derived(this, (reader) => {
      const session = this._session.read(reader);
      return session?.isQuickChat?.read(reader) ?? false;
    });
    const PickerCtor = isWeb ? WebWorkspacePicker : WorkspacePicker;
    this._workspacePicker = this._register(this.instantiationService.createInstance(PickerCtor, {
      canRestoreWorkspace: () => !this._isQuickChatComposer.get(),
      getWorkspaceGroupAction: (group2) => {
        if (group2 === SESSION_WORKSPACE_GROUP_GITHUB && shouldShowGitHubWorkspaceGroupSignIn(
          this.defaultAccountService.currentDefaultAccount !== null,
          isAllowSignedOutWhenUsableEnabled(this.configurationService)
        )) {
          return {
            label: localize(4488, null),
            icon: Codicon.signIn,
            commandId: AGENTIC_SIGN_IN_COMMAND_ID,
            hideWorkspaceItems: true
          };
        }
        return void 0;
      }
    }));
    const feedbackChanged = observableSignalFromEvent(this, this.agentFeedbackService.onDidChangeFeedback);
    this._feedbackItems = derived(this, (reader) => {
      feedbackChanged.read(reader);
      return this.agentFeedbackService.getFeedback(AGENT_FEEDBACK_NEW_SESSION_RESOURCE).filter((item) => item.state === "accepted" /* Accepted */);
    });
    const canSendRequest = derived((reader) => {
      const session = this._session.read(reader);
      if (!session) {
        return false;
      }
      if (session.loading.read(reader)) {
        return false;
      }
      return true;
    });
    const loading = derived((reader) => {
      const session = this._session.read(reader);
      return session?.loading.read(reader) ?? false;
    });
    const hasFeedback = derived(this, (reader) => this._feedbackItems.read(reader).length > 0);
    const canSubmitWithoutSession = derived(this, (reader) => !this._session.read(reader));
    const deferredNotificationsEnabled = observableFromEvent(
      this,
      this.storageService.onDidChangeValue(-1 /* APPLICATION */, TOTAL_SESSIONS_KEY, this._store),
      () => this._hasEnoughSessionsForFirstRunNotices()
    );
    const newChatInput = this.instantiationService.createInstance(NewChatInputWidget, {
      session: this._session,
      getContextFolderUri: () => this._getContextFolderUri(),
      getWorkspacePreselectionSource: () => this._isQuickChatComposer.get() ? "none" /* None */ : this._workspacePicker.preselectionSource,
      sendRequest: async ({ query, attachments, background }) => this._send(query, attachments, background),
      canSendRequest,
      canSubmitWithoutSession,
      hasAdditionalSendContent: hasFeedback,
      loading,
      historyKey: constObservable(void 0),
      // no persisted history for the new-session view
      placeholder: localize(4480, null),
      supportsBackground: true,
      deferredNotificationsEnabled,
      petHostPreferred: this.options.petHostPreferred
    });
    this._register(toDisposable(() => newChatInput.saveState()));
    this._newChatInput = this._register(newChatInput);
    if (this.options.initialAttachments?.length) {
      this._newChatInput.addAttachments(...this.options.initialAttachments);
    }
    this._register(newSessionComposerService.registerComposer(this._newChatInput));
    const chatModeKindKey = ChatContextKeys.chatModeKind.bindTo(contextKeyService);
    chatModeKindKey.set("agent" /* Agent */);
    this._register(toDisposable(() => chatModeKindKey.reset()));
    this._register(this.openerService.registerOpener({
      open: async (resource) => {
        if (!this._chatTipPresenter.value?.current) {
          return false;
        }
        const link2 = typeof resource === "string" ? resource : resource.toString();
        if (link2 === "command:workbench.action.chat.openModelPicker") {
          this._newChatInput.openModelPicker();
          return true;
        }
        if (link2 === "command:workbench.action.chat.openPlan") {
          return true;
        }
        return false;
      }
    }));
    this._register(this._workspacePicker.onDidSelectWorkspace(async (folderUri) => {
      await this._onWorkspaceSelected(folderUri);
      this._newChatInput.focus();
    }));
    this._register(this._workspacePicker.onDidSelectContext((context2) => {
      const contextUri = context2.uri.toString();
      this._newChatInput.attachTextContext(
        context2.label,
        `GitHub context: ${contextUri}`,
        context2.icon,
        `github-context:${contextUri}`
      );
      this._newChatInput.focus();
    }));
    this._register(this._workspacePicker.onDidSelectFolderContext((folderUri) => {
      this._newChatInput.addAttachments({
        kind: "directory",
        id: getAdditionalFolderContextId(folderUri),
        name: basename2(folderUri),
        value: folderUri
      });
      this._newChatInput.focus();
    }));
    this._register(this._workspacePicker.onDidSelectRepositoryContext(({ workspace }) => {
      const folderUri = workspace.folders[0].root;
      this._newChatInput.addAttachments({
        kind: "generic",
        id: getAdditionalRepositoryContextId(workspace.uri),
        name: workspace.label,
        value: folderUri,
        icon: workspace.icon
      });
      this._newChatInput.focus();
    }));
    this._register(this._workspacePicker.onDidRemoveAttachedContext((id2) => this._newChatInput.removeAttachment(id2)));
    const syncAttachedContext = () => this._workspacePicker.syncAttachedContext(this._newChatInput.attachments);
    syncAttachedContext();
    this._register(this._newChatInput.onDidChangeAttachments(() => {
      syncAttachedContext();
    }));
    this._register(this._newChatInput.sessionTypePicker.onDidSelectSessionType(async (pick) => {
      if (this._isQuickChatComposer.get()) {
        this.sessionsService.openQuickChat(pick ? { providerId: pick.providerId, sessionTypeId: pick.sessionTypeId } : void 0);
        this._newChatInput.focus();
        return;
      }
      await this._onWorkspaceSelected(this._workspacePicker.selectedFolderUri);
      this._newChatInput.focus();
    }));
    this._register(this.configurationService.onDidChangeConfiguration((e4) => {
      if (!e4.affectsConfiguration("chat.tips.enabled")) {
        return;
      }
      if (this.configurationService.getValue("chat.tips.enabled")) {
        this._renderChatTip();
      } else {
        this._clearChatTip();
      }
    }));
    this._register(this.storageService.onDidChangeValue(-1 /* APPLICATION */, TOTAL_SESSIONS_KEY, this._store)(() => this._renderChatTip()));
    const foregroundSessionCountContextKeys = /* @__PURE__ */ new Set([ChatContextKeys.foregroundSessionCount.key]);
    this._register(this.contextKeyService.onDidChangeContext((e4) => {
      if (e4.affectsSome(foregroundSessionCountContextKeys)) {
        this._renderChatTip();
      }
    }));
    let previousModelId;
    this._register(autorun((reader) => {
      const modelId = this._newChatInput.selectedModelState.read(reader).currentModel?.identifier;
      if (previousModelId !== void 0 && previousModelId !== modelId) {
        this._renderChatTip();
      }
      previousModelId = modelId;
    }));
    let previousFolderUri = this._session.get()?.workspace.get()?.folders[0]?.root;
    this._register(autorun((reader) => {
      const session = this._session.read(reader);
      const folderUri = session?.workspace.read(reader)?.folders[0]?.root;
      this._handlePromptOptionsWorkspaceChange(previousFolderUri, folderUri);
      previousFolderUri = folderUri;
      if (folderUri && !this.uriIdentityService.extUri.isEqual(folderUri, this._workspacePicker.selectedFolderUri)) {
        this._workspacePicker.setSelectedWorkspace(folderUri, { fireEvent: false });
      }
    }));
  }
  _handlePromptOptionsWorkspaceChange(previousFolderUri, folderUri) {
    const workspaceChanged = previousFolderUri ? !folderUri || !this.uriIdentityService.extUri.isEqual(previousFolderUri, folderUri) : !!folderUri;
    if (!workspaceChanged) {
      return;
    }
    if (folderUri) {
      void this._refreshPromptOptions();
    } else {
      this._newChatInput.clearPromptOptions();
    }
  }
  // --- Rendering ---
  render(parent) {
    const element = append(parent, $(".sessions-chat-widget"));
    const chatWidgetContainer = append(element, $(".new-chat-widget-container"));
    const chatWidgetContent = append(chatWidgetContainer, $(`.new-chat-widget-content.${chatInputStackClass}`));
    this._aquariumToggle = this._register(this.aquariumService.mountToggle(element));
    const aquariumAction = this._register(new Action(
      "sessions.aquarium.showAction",
      localize(4476, null),
      void 0,
      true,
      () => this.aquariumService.toggleActionVisibility()
    ));
    const petAction = this._register(new Action(
      "sessions.chatPet.toggle",
      localize(4487, null),
      void 0,
      true,
      () => this.chatPetService.toggle()
    ));
    this._register(addDisposableListener(element, EventType.CONTEXT_MENU, (e4) => {
      const target = e4.target;
      if (target && chatWidgetContent.contains(target)) {
        return;
      }
      e4.preventDefault();
      e4.stopPropagation();
      aquariumAction.checked = this.aquariumService.actionVisible.get();
      petAction.checked = this.chatPetService.enabled.get();
      const anchor = new StandardMouseEvent(getWindow(element), e4);
      this.contextMenuService.showContextMenu({
        menuId: Menus.SessionChatBackgroundContext,
        contextKeyService: this.contextKeyService,
        getAnchor: () => anchor,
        getActions: () => [aquariumAction, petAction],
        getCheckedActionsRepresentation: () => "checkbox"
      });
    }));
    const workspacePickerContainer = append(chatWidgetContent, $(".new-session-workspace-picker-container"));
    this._register(isWeb ? this._renderEmptyStateGate(workspacePickerContainer, chatWidgetContent) : this._renderWorkspacePicker(workspacePickerContainer));
    if (!isWeb) {
      this._quickChatHeaderPickerHost = append(chatWidgetContent, $(".new-session-quick-chat-header.sessions-workspace-category-picker"));
    }
    this._renderFeedbackBanner(chatWidgetContent);
    this._newChatInput.render(chatWidgetContent, parent);
    const chatTipContainer = this._newChatInput.gettingStartedTipContainerElement;
    this._chatTipPresenter.value = chatTipContainer && this.instantiationService.createInstance(
      ChatInputTipPresenter,
      {
        container: chatTipContainer,
        // Reset tip rotation the first time this composer becomes the only
        // foreground surface, so a returning user gets a fresh tip.
        onBeforeUpdate: () => {
          if (this.contextKeyService.getContextKeyValue(ChatContextKeys.foregroundSessionCount.key) !== 0) {
            this._isChatTipSessionInitialized = false;
          } else if (!this._isChatTipSessionInitialized) {
            this._isChatTipSessionInitialized = true;
            this.chatTipService.resetSession();
          }
        },
        // No tip in the no-agent-host empty state: there is no usable composer.
        // Tips also stay away until the user has actually started a couple of
        // sessions, so a first-run composer is not busy.
        isEligible: () => !chatWidgetContent.classList.contains("no-agent-host") && this._hasEnoughSessionsForFirstRunNotices() && this.contextKeyService.getContextKeyValue(ChatContextKeys.foregroundSessionCount.key) === 0,
        focusInput: () => this.focusInput()
      },
      this._newChatInput.noticeHost
    );
    this._register(autorun((reader) => {
      const isQuickChat2 = this._isQuickChatComposer.read(reader);
      chatWidgetContent.classList.toggle("quick-chat", isQuickChat2);
      if (!isWeb) {
        this._workspacePickerVisibleKey.set(!isQuickChat2);
      }
    }));
    if (!isWeb) {
      this._register(autorun((reader) => {
        const isQuickChat2 = this._isQuickChatComposer.read(reader);
        const target = isQuickChat2 ? this._quickChatHeaderPickerHost : this._workspacePickerRow;
        if (!target) {
          return;
        }
        this._newChatInput.sessionTypePicker.render(target, {
          className: "sessions-chat-session-type-picker sessions-workspace-category-picker-slot"
        });
        if (!isQuickChat2 && target.lastElementChild) {
          target.insertBefore(target.lastElementChild, target.firstElementChild);
        }
      }));
    }
    this._seedWorkspaceDraft();
    if (!isWeb) {
      let wasQuickChat = this._isQuickChatComposer.get();
      this._register(autorun((reader) => {
        const isQuickChat2 = this._isQuickChatComposer.read(reader);
        if (wasQuickChat && !isQuickChat2 && !this._session.read(reader)) {
          if (!this._workspacePicker.refreshAutomaticSelection()) {
            this._seedWorkspaceDraft();
          }
        }
        wasQuickChat = isQuickChat2;
      }));
    }
    chatWidgetContainer.classList.add("revealed");
  }
  _renderChatTip() {
    this._chatTipPresenter.value?.update();
  }
  _clearChatTip() {
    this._chatTipPresenter.value?.clear();
  }
  _hasEnoughSessionsForFirstRunNotices() {
    return this.storageService.getNumber(TOTAL_SESSIONS_KEY, -1 /* APPLICATION */, 0) >= MIN_SESSIONS_FOR_FIRST_RUN_NOTICES;
  }
  /**
   * Seed the new-session draft from the workspace picker's restored folder,
   * unless an active session already exists (then just sync the picker to it).
   */
  _seedWorkspaceDraft() {
    const restoredFolderUri = this._workspacePicker.selectedFolderUri;
    if (!this._syncWorkspacePickerFromActiveSession() && restoredFolderUri) {
      void this._createNewSession(restoredFolderUri);
    }
  }
  /**
   * If a new-session draft was restored by {@link openNewSession}, sync
   * the workspace picker to match the session's workspace. The picker may
   * have restored a workspace from a different provider (e.g. remote vs
   * local), so overwrite it with the session's actual workspace without
   * firing the event (which would trigger {@link _onWorkspaceSelected} and
   * create a new session).
   *
   * @returns `true` if an active session was found and the picker was synced.
   */
  _syncWorkspacePickerFromActiveSession() {
    const activeSession = this._session.get();
    if (!activeSession) {
      return false;
    }
    const sessionWorkspace = activeSession.workspace.get();
    const folderUri = sessionWorkspace?.folders[0]?.root;
    if (folderUri) {
      this._workspacePicker.setSelectedWorkspace(folderUri, { fireEvent: false });
      this._replaceDraftOnUnservableHarness(folderUri, activeSession);
    }
    return true;
  }
  /**
   * Replaces a restored draft whose harness the folder can no longer serve.
   * A draft outlives navigation, so it can name a session type that has since
   * stopped being advertised. Keeping it would leave the composer showing, and
   * sending to, an agent the harness picker doesn't list. An empty type list
   * means the folder's providers haven't reported yet (a late-connecting agent
   * host), so the draft is left alone.
   */
  _replaceDraftOnUnservableHarness(folderUri, draft) {
    if (draft.isCreated.get()) {
      return;
    }
    const pick = { providerId: draft.providerId, sessionTypeId: draft.sessionType };
    if (this.sessionsManagementService.getSessionTypesForFolder(folderUri).length === 0 || this._isPreferredServable(folderUri, pick)) {
      return;
    }
    void this._createNewSession(folderUri);
  }
  _isPreferredServable(folderUri, pick) {
    return this.sessionsManagementService.getSessionTypesForFolder(folderUri).some((t2) => (pick.providerId === void 0 || t2.providerId === pick.providerId) && t2.sessionType.id === pick.sessionTypeId);
  }
  async _createNewSession(folderUri) {
    this._pendingPreferredUpgrade.clear();
    const creationCts = new CancellationTokenSource();
    const creationLifecycle = toDisposable(() => creationCts.dispose(true));
    this._newSessionCreation.value = creationLifecycle;
    const userPick = this._newChatInput.sessionTypePicker.getUserPickedSessionType();
    const pendingChange = new DisposableStore();
    let changedWhilePending = false;
    pendingChange.add(this.sessionsManagementService.onDidChangeSessionTypes(() => changedWhilePending = true));
    let result;
    try {
      result = await this._createSessionNow(folderUri, userPick, creationCts.token);
    } finally {
      pendingChange.dispose();
    }
    const isCurrentCreation = this._newSessionCreation.value === creationLifecycle;
    if (isCurrentCreation) {
      this._newSessionCreation.clear();
    } else {
      return result;
    }
    if (result.trustDeclined) {
      this._pendingPreferredUpgrade.clear();
      return result;
    }
    if (!result.session || !userPick || !this._isPreferredServable(folderUri, userPick)) {
      this._scheduleRecreateOnProviderChange(folderUri, userPick, result.session, changedWhilePending);
    }
    return result;
  }
  async _createSessionNow(folderUri, userPick, token) {
    const preferredPick = userPick && this._isPreferredServable(folderUri, userPick) ? userPick : this._newChatInput.sessionTypePicker.getPreferredSessionType(folderUri);
    const fallbackProviderId = this._workspacePicker.selectedResolved?.providerId;
    try {
      return await this.sessionsService.openNewSession({
        folderUri,
        ...preferredPick ? { providerId: preferredPick.providerId, sessionTypeId: preferredPick.sessionTypeId } : fallbackProviderId ? { providerId: fallbackProviderId } : void 0
      }, token);
    } catch (e4) {
      this.logService.error("Failed to create new session:", e4);
      return { session: void 0, trustDeclined: false };
    }
  }
  _scheduleRecreateOnProviderChange(folderUri, userPick, created, replayMissedChange) {
    const store = new DisposableStore();
    store.add(this.sessionsManagementService.onDidChangeSessionTypes(() => this._recreateOnProviderChange(folderUri, userPick, created)));
    this._pendingPreferredUpgrade.value = store;
    if (replayMissedChange) {
      this._recreateOnProviderChange(folderUri, userPick, created);
    }
  }
  _recreateOnProviderChange(folderUri, userPick, created) {
    if (created) {
      const active = this._session.get();
      if (active?.sessionId !== created.sessionId || active.isCreated.get()) {
        return;
      }
      if (userPick) {
        if (!this._isPreferredServable(folderUri, userPick)) {
          return;
        }
        if (userPick.sessionTypeId === active.sessionType && (userPick.providerId === void 0 || userPick.providerId === active.providerId)) {
          this._pendingPreferredUpgrade.clear();
          return;
        }
      } else {
        const preferred = this._newChatInput.sessionTypePicker.getPreferredSessionType(folderUri);
        if (!preferred || preferred.providerId === active.providerId && preferred.sessionTypeId === active.sessionType) {
          return;
        }
      }
    }
    void this._createNewSession(folderUri);
  }
  /**
   * Returns the workspace URI for the context picker based on the current workspace selection.
   */
  _getContextFolderUri() {
    return this._workspacePicker.selectedFolderUri;
  }
  _renderWorkspacePicker(container2) {
    this._workspacePickerVisibleKey.set(true);
    const workspaceTrigger = {
      label: localize(4484, null),
      ariaLabel: localize(4485, null),
      tooltip: localize(4486, null),
      icon: Codicon.project,
      reflectsWorkspace: true,
      attachesContext: false
    };
    const gitHubContextTrigger = {
      label: localize(4481, null),
      ariaLabel: localize(4482, null),
      tooltip: localize(4483, null),
      hideIconWhenAttached: true,
      group: SESSION_WORKSPACE_GROUP_GITHUB,
      attachesContext: true,
      hideWhenNoGitHubRepository: true
    };
    const row = this._workspacePicker.renderCategoryTriggers(container2, [
      workspaceTrigger,
      gitHubContextTrigger
    ]);
    this._newChatInput.sessionTypePicker.render(row, {
      className: "sessions-chat-session-type-picker sessions-workspace-category-picker-slot"
    });
    if (row.lastElementChild) {
      row.insertBefore(row.lastElementChild, row.firstElementChild);
    }
    this._workspacePickerRow = row;
    return toDisposable(() => {
      if (this._workspacePickerRow === row) {
        this._workspacePickerRow = void 0;
      }
    });
  }
  _renderEmptyState(container2) {
    this._workspacePickerVisibleKey.set(false);
    const emptyState = this.instantiationService.createInstance(NoAgentHostEmptyState);
    emptyState.render(container2);
    this._activeEmptyState = emptyState;
    return {
      dispose: () => {
        if (this._activeEmptyState === emptyState) {
          this._activeEmptyState = void 0;
        }
        emptyState.dispose();
      }
    };
  }
  /**
   * Web-only: hosts the workspace picker, but swaps it out for the
   * no-agent-host empty state once we are *sure* there are no hosts —
   * i.e. after a discovery cycle has completed. Rendering the empty
   * state before discovery has run would briefly flash it at users who
   * actually have hosts that just haven't been discovered yet (e.g.
   * cached tunnels resolved on startup). Until then we keep the regular
   * workspace picker, which has its own loading affordance.
   */
  _renderEmptyStateGate(container2, chatWidgetContent) {
    const store = new DisposableStore();
    const pickerSlot = append(container2, $(".session-workspace-picker-slot"));
    const stateDisposables = store.add(new MutableDisposable());
    const showPicker = () => {
      chatWidgetContent.classList.remove("no-agent-host");
      clearNode(pickerSlot);
      stateDisposables.value = this._renderWorkspacePicker(pickerSlot);
      this._renderChatTip();
    };
    const showEmptyState = () => {
      chatWidgetContent.classList.add("no-agent-host");
      clearNode(pickerSlot);
      stateDisposables.value = this._renderEmptyState(pickerSlot);
      this._clearChatTip();
    };
    const filter2 = this.agentHostFilterService;
    let hasCompletedDiscovery = filter2.hosts.length > 0;
    if (!hasCompletedDiscovery && !filter2.isDiscovering) {
      filter2.rediscover();
    }
    const update = () => {
      if (hasCompletedDiscovery && !filter2.isDiscovering && filter2.hosts.length === 0) {
        showEmptyState();
      } else {
        showPicker();
      }
    };
    update();
    store.add(filter2.onDidChange(() => {
      if (filter2.hosts.length > 0) {
        hasCompletedDiscovery = true;
      }
      update();
    }));
    store.add(filter2.onDidChangeDiscovering(() => {
      if (!filter2.isDiscovering) {
        hasCompletedDiscovery = true;
      }
      update();
    }));
    return store;
  }
  // --- Send ---
  async _send(query, attachedContext, background) {
    const session = this._session.get();
    if (!session) {
      this._workspacePicker.showPicker();
      return false;
    }
    const feedbackItems = [...this._feedbackItems.get()];
    const workspaceRoots = session.workspace.get()?.folders.map((folder) => folder.root) ?? (this._workspacePicker.selectedFolderUri ? [this._workspacePicker.selectedFolderUri] : []);
    const request2 = buildNewSessionPrompt(query, feedbackItems, workspaceRoots);
    const requestContext = /* @__PURE__ */ new Map();
    for (const context2 of attachedContext ?? []) {
      if (!requestContext.has(context2.id)) {
        requestContext.set(context2.id, context2);
      }
    }
    const wasQuickChat = this._isQuickChatComposer.get();
    const reseedFolderUri = background && !wasQuickChat ? this._workspacePicker.selectedFolderUri : void 0;
    const sendOptions = { query: request2, attachedContext: requestContext.size > 0 ? [...requestContext.values()] : void 0, background };
    const clearFeedback = () => {
      for (const item of feedbackItems) {
        this.agentFeedbackService.removeFeedback(AGENT_FEEDBACK_NEW_SESSION_RESOURCE, item.id);
      }
    };
    if (background) {
      this._pendingBackgroundSends.set(sendOptions, Event2.once(
        Event2.filter(this.sessionsManagementService.onDidSendRequest, (event) => event.options === sendOptions)
      )(() => {
        clearFeedback();
        this._pendingBackgroundSends.deleteAndDispose(sendOptions);
      }));
    }
    try {
      await this.sessionsManagementService.sendNewChatRequest(session, sendOptions);
    } catch (e4) {
      this._pendingBackgroundSends.deleteAndDispose(sendOptions);
      this.logService.error("Failed to send request:", e4);
      return false;
    }
    if (!background) {
      clearFeedback();
    }
    this._workspacePicker.clearAttachedContext();
    if (background) {
      if (wasQuickChat) {
        this.sessionsService.openQuickChat();
      } else if (reseedFolderUri) {
        await this._createNewSession(reseedFolderUri);
      }
    }
    return true;
  }
  _renderFeedbackBanner(container2) {
    const host = append(container2, $(".session-input-banners.new-session-feedback-banners"));
    const content = this._register(new MutableDisposable());
    this._register(autorun((reader) => {
      const feedbackItems = this._feedbackItems.read(reader);
      content.clear();
      clearNode(host);
      if (!feedbackItems.length) {
        setChatInputStackSlot(host, 0 /* Empty */);
        return;
      }
      const count2 = feedbackItems.length;
      const text2 = count2 === 1 ? localize(4478, null) : localize(4477, null, count2);
      const store = new DisposableStore();
      content.value = store;
      const banner = store.add(this.instantiationService.createInstance(SessionInputBannerWidget, {
        icon: Codicon.commentDiscussion,
        accent: false,
        text: text2,
        ariaLabel: text2,
        actions: [{
          label: localize(4479, null),
          run: () => this.agentFeedbackService.revealFeedback(AGENT_FEEDBACK_NEW_SESSION_RESOURCE, feedbackItems[0].id)
        }]
      }));
      host.appendChild(banner.domNode);
      setChatInputStackSlot(host, 1 /* Docked */);
    }));
  }
  saveState() {
    this._newChatInput.saveState();
  }
  layout(_height, _width) {
    this._newChatInput.layout(_height, _width);
  }
  focusInput() {
    if (this._activeEmptyState) {
      this._activeEmptyState.focus();
      return;
    }
    this._newChatInput.focus();
  }
  /**
   * Handles a workspace selection from the workspace picker and creates a
   * new session for it. Workspace trust (when required) is requested by
   * {@link ISessionsService.openNewSession} itself — a single gate shared
   * by every path that creates a concrete session for a folder.
   */
  async _onWorkspaceSelected(folderUri) {
    this._pendingPreferredUpgrade.clear();
    const currentFolderUri = this._session.get()?.workspace.get()?.folders[0]?.root;
    const refreshingPromptOptions = !!currentFolderUri && (!folderUri || !this.uriIdentityService.extUri.isEqual(currentFolderUri, folderUri)) && this._newChatInput.preparePromptOptionsRefresh();
    if (!folderUri) {
      this.sessionsService.unsetNewSession();
      return;
    }
    if (this._store.isDisposed) {
      return;
    }
    const result = await this._createNewSession(folderUri);
    if (refreshingPromptOptions && !result.session) {
      this._newChatInput.showPromptOptions(void 0);
    }
    if (result.trustDeclined) {
      this._workspacePicker.removeFromRecents(folderUri);
    }
  }
  async _refreshPromptOptions() {
    try {
      await this._newChatInput.refreshPromptOptions();
    } catch (error) {
      this.logService.error("Failed to refresh new-session prompt options:", error);
      this._newChatInput.showPromptOptions(void 0);
    }
  }
  prefillInput(text2) {
    this._newChatInput.prefillInput(text2);
  }
  setHostVisible(visible) {
    this._aquariumToggle?.setHostVisible(visible);
  }
  sendQuery(text2) {
    this._newChatInput.sendQuery(text2);
  }
  submitInput() {
    if (!this._session.get()) {
      this._workspacePicker.showPicker();
      return Promise.resolve(false);
    }
    return this._newChatInput.submit();
  }
  attach(uris) {
    this._newChatInput.attach(uris);
  }
  selectWorkspace(folderUri, providerId) {
    this._workspacePicker.setSelectedWorkspace(folderUri, { providerId });
  }
};

NewChatWidget = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IConfigurationService),
  __decorateParam(5, ILogService),
  __decorateParam(6, ISessionsManagementService),
  __decorateParam(7, ISessionsService),
  __decorateParam(8, IAquariumService),
  __decorateParam(9, IAgentHostFilterService),
  __decorateParam(10, IUriIdentityService),
  __decorateParam(11, IAgentFeedbackService),
  __decorateParam(12, IChatPetService),
  __decorateParam(13, IChatTipService),
  __decorateParam(14, IOpenerService),
  __decorateParam(15, IDefaultAccountService),
  __decorateParam(16, IStorageService),
  __decorateParam(17, INewSessionComposerService)
], NewChatWidget);
export { MIN_SESSIONS_FOR_FIRST_RUN_NOTICES, NewChatWidget };
