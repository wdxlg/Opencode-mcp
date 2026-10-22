// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/sessionWorkspacePicker.ts
import { Disposable, DisposableStore, MutableDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { localize } from "./module-0001.mjs";
import { SESSION_WORKSPACE_GROUP_GITHUB, SESSION_WORKSPACE_GROUP_LOCAL, SESSION_WORKSPACE_GROUP_REMOTE } from "./module-1767.mjs";
import { Codicon } from "./module-0085.mjs";
import { TabbedActionListWidget } from "./module-3557.mjs";
import { SessionWorkspacePickerGroupContext } from "./module-1770.mjs";
import { SessionWorkspaceFallback } from "./module-3562.mjs";
import { ADDITIONAL_FOLDER_CONTEXT_ID_PREFIX, ADDITIONAL_REPOSITORY_CONTEXT_ID_PREFIX, getAdditionalFolderContextId, getAdditionalRepositoryContextId } from "./module-3563.mjs";
import { URI } from "./module-0032.mjs";
import { $, EventHelper, EventType, addDisposableListener, append, clearNode } from "./module-0075.mjs";
import { markOnboardingTarget } from "./module-3542.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { IRemoteAgentHostService, RemoteAgentHostConnectionStatus, RemoteAgentHostsEnabledSettingId } from "./module-1736.mjs";
import { reportNewChatPickerClosed } from "./module-3541.mjs";
import { autorun } from "./module-0052.mjs";
import { isAgentHostProvider } from "./module-1764.mjs";
import { TUNNEL_ADDRESS_PREFIX } from "./module-1734.mjs";
import { toAction } from "./module-0082.mjs";
import { getStatusHover, getStatusLabel, removeRemoteHost, showRemoteHostOptions } from "./module-3560.mjs";
import { Menus } from "./module-3437.mjs";
import { IMenuService, MenuItemAction } from "./module-0092.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { renderIcon } from "./module-0467.mjs";
import { CountBadge } from "./module-0638.mjs";
import { defaultCountBadgeStyles } from "./module-0513.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { status } from "./module-0076.mjs";
import { ISessionsRecentWorkspacesService, isWorktreeWorkspaceUri } from "./module-3545.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { ISessionsProvidersService } from "./module-1765.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IFileDialogService } from "./module-0267.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IHoverService } from "./module-0520.mjs";


// src/vs/sessions/contrib/chat/browser/sessionWorkspacePicker.ts
var FILTER_THRESHOLD2 = 10;

var TABBED_PICKER_WIDTH = 360;

var RESTORE_CONNECT_GRACE_MS = 5e3;

var WorkspacePicker = class extends Disposable {
  constructor(options3, actionWidgetService, uriIdentityService, sessionsProvidersService, recentWorkspacesService, remoteAgentHostService, configurationService, commandService, menuService, contextKeyService, instantiationService, fileDialogService, telemetryService, notificationService, hoverService) {
    super();
    this.options = options3;
    this.actionWidgetService = actionWidgetService;
    this.uriIdentityService = uriIdentityService;
    this.sessionsProvidersService = sessionsProvidersService;
    this.recentWorkspacesService = recentWorkspacesService;
    this.remoteAgentHostService = remoteAgentHostService;
    this.configurationService = configurationService;
    this.commandService = commandService;
    this.menuService = menuService;
    this.contextKeyService = contextKeyService;
    this.instantiationService = instantiationService;
    this.fileDialogService = fileDialogService;
    this.telemetryService = telemetryService;
    this.notificationService = notificationService;
    this.hoverService = hoverService;
    this._onDidSelectWorkspace = this._register(new Emitter());
    this.onDidSelectWorkspace = this._onDidSelectWorkspace.event;
    this._onDidChangeSelection = this._register(new Emitter());
    this.onDidChangeSelection = this._onDidChangeSelection.event;
    this._onDidSelectContext = this._register(new Emitter());
    this.onDidSelectContext = this._onDidSelectContext.event;
    this._onDidSelectFolderContext = this._register(new Emitter());
    this.onDidSelectFolderContext = this._onDidSelectFolderContext.event;
    this._onDidSelectRepositoryContext = this._register(new Emitter());
    this.onDidSelectRepositoryContext = this._onDidSelectRepositoryContext.event;
    this._onDidRemoveAttachedContext = this._register(new Emitter());
    this.onDidRemoveAttachedContext = this._onDidRemoveAttachedContext.event;
    this._preselectionSource = "none" /* None */;
    this._selectionGeneration = 0;
    this._sessionRestoreGeneration = 0;
    /**
     * Set to `true` once the user has explicitly picked or cleared a workspace.
     * Until then, late-arriving provider registrations are allowed to upgrade
     * the current (auto-restored) selection to the user's stored "checked"
     * entry. After the user has acted, providers coming and going never move
     * the selection out from under them.
     */
    this._userHasPicked = false;
    /**
     * Watches the connection status of a restored remote workspace. Cleared when
     * the user explicitly picks, when the connection succeeds, or when it fails
     * and we fall back.
     */
    this._connectionStatusWatch = this._register(new MutableDisposable());
    this._gitHubInfoWatch = this._register(new MutableDisposable());
    this._localBrowseAction = {
      label: localize(4719, null),
      group: SESSION_WORKSPACE_GROUP_LOCAL,
      icon: Codicon.folderOpened,
      providerId: "",
      run: async () => (await this._browseForLocalFolder())?.workspace
    };
    /** All live trigger elements. Label updates fan out to every entry. */
    this._triggerElements = /* @__PURE__ */ new Set();
    this._triggerOptions = /* @__PURE__ */ new Map();
    this._triggerContents = /* @__PURE__ */ new Map();
    this._contextSelections = /* @__PURE__ */ new Map();
    this._renderDisposables = this._register(new DisposableStore());
    this._additionalRepositorySelections = /* @__PURE__ */ new Map();
    this._additionalFolderSelections = /* @__PURE__ */ new Map();
    this._attachedContext = [];
    /**
     * Whether the user explicitly clicked a tab while the picker was open.
     * Reset on each fresh open so the picker re-defaults to the selected
     * workspace's group between opens.
     */
    this._userPickedTab = false;
    this._tabbedWidget = this._register(this.instantiationService.createInstance(TabbedActionListWidget));
    this._pickerGroupContext = SessionWorkspacePickerGroupContext.bindTo(this.contextKeyService);
    this._register(this._tabbedWidget.onDidChangeTab((tab) => this._selectWorkspaceGroup(tab)));
    this._register(this._tabbedWidget.onDidHide(() => {
      this._pickerGroupContext.reset();
    }));
    this._sessionWorkspaceFallback = this.options.restoreFromSessions === false ? void 0 : this._register(this.instantiationService.createInstance(SessionWorkspaceFallback, {
      canUseProvider: (providerId) => this._canRestoreProviderWorkspace(providerId),
      isProviderUnavailable: (providerId) => this._isProviderUnavailable(providerId),
      resolveWorkspace: (folderUri, preferredProviderId) => this._resolveFolder(folderUri, preferredProviderId)
    }));
    if (this._sessionWorkspaceFallback) {
      this._register(this._sessionWorkspaceFallback.onDidChange(() => this._restoreAutomaticSelection()));
    }
    const restored = this._restoreSelectedWorkspace();
    this._applySelection(restored?.resolved, restored?.source);
    if (this._selectedResolved) {
      this._watchForConnectionFailure(this._selectedResolved);
    } else {
      this._scheduleSessionWorkspaceRestore();
    }
    this._register(this.sessionsProvidersService.onDidChangeProviders(() => {
      this._sessionWorkspaceFallback?.refreshProviders();
      if (this._selectedFolderUri) {
        const reresolved = this._resolveFolder(this._selectedFolderUri);
        if (!reresolved) {
          this._selectedFolderUri = void 0;
          this._selectedResolved = void 0;
          this._preselectionSource = "none" /* None */;
          this._connectionStatusWatch.clear();
          this._gitHubInfoWatch.clear();
          this._updateTriggerLabel();
          this._onDidChangeSelection.fire();
          this._onDidSelectWorkspace.fire(void 0);
        } else {
          this._selectedResolved = reresolved;
          this._watchSelectedGitHubInfo();
        }
      }
      this._restoreAutomaticSelection();
      this._syncAttachedContext();
      const activeTrigger = this._activeTriggerElement;
      if (activeTrigger && (this.actionWidgetService.isVisible || this._tabbedWidget.isVisible)) {
        this.showPicker(true, activeTrigger, this._directPickerGroup, this._directPickerAttachesContext);
      }
    }));
    this._register(this.recentWorkspacesService.onDidChangeRecentWorkspaces(() => {
      this._restoreAutomaticSelection();
    }));
    this._register(this.onDidSelectWorkspace((selection) => {
      if (selection && !this.actionWidgetService.isVisible && !this._tabbedWidget.isVisible) {
        this._userPickedTab = false;
      }
    }));
  }
  get selectedFolderUri() {
    return this._selectedFolderUri;
  }
  /**
   * Returns the currently selected folder resolved to a workspace via the
   * first provider that can resolve it. Used internally for rendering
   * (label, icon, group). The provider association is not part of the
   * picker's public contract — callers should use {@link selectedFolderUri}
   * and let the management service rediscover the provider.
   */
  get selectedResolved() {
    return this._selectedResolved;
  }
  get additionalFolderUris() {
    return Array.from(this._additionalFolderSelections.values(), (selection) => selection.workspace.folders[0].root);
  }
  get attachedContextWorkspaces() {
    return Array.from(this._additionalRepositorySelections.values(), (selection) => selection.workspace);
  }
  clearAttachedContext() {
    if (this._additionalFolderSelections.size === 0 && this._additionalRepositorySelections.size === 0) {
      return;
    }
    this._additionalFolderSelections.clear();
    this._additionalRepositorySelections.clear();
    this._updateTriggerLabel();
    this._onDidChangeSelection.fire();
  }
  syncAttachedContext(attachments) {
    this._attachedContext = attachments;
    if (!this._syncAttachedContext()) {
      this._updateTriggerLabel();
    }
  }
  _syncAttachedContext() {
    const attachmentIds = new Set(this._attachedContext.map((attachment) => attachment.id));
    let changed = false;
    for (const [key3, contexts] of this._contextSelections) {
      const retained = contexts.filter((context2) => attachmentIds.has(`github-context:${context2.uri.toString()}`));
      if (retained.length === contexts.length) {
        continue;
      }
      changed = true;
      if (retained.length > 0) {
        this._contextSelections.set(key3, retained);
      } else {
        this._contextSelections.delete(key3);
      }
    }
    for (const [key3, selection] of this._additionalFolderSelections) {
      if (!attachmentIds.has(getAdditionalFolderContextId(selection.workspace.folders[0].root))) {
        this._additionalFolderSelections.delete(key3);
        changed = true;
      }
    }
    for (const [key3, selection] of this._additionalRepositorySelections) {
      if (!attachmentIds.has(selection.attachmentId)) {
        this._additionalRepositorySelections.delete(key3);
        changed = true;
      }
    }
    for (const attachment of this._attachedContext) {
      if (attachment.id.startsWith(ADDITIONAL_FOLDER_CONTEXT_ID_PREFIX) && URI.isUri(attachment.value)) {
        const resolved = this._resolveFolder(attachment.value);
        if (resolved?.workspace.group === SESSION_WORKSPACE_GROUP_LOCAL) {
          const key3 = this.uriIdentityService.extUri.getComparisonKey(attachment.value);
          if (!this._additionalFolderSelections.has(key3)) {
            this._additionalFolderSelections.set(key3, resolved);
            changed = true;
          }
        }
      } else if (attachment.id.startsWith(ADDITIONAL_REPOSITORY_CONTEXT_ID_PREFIX) && URI.isUri(attachment.value)) {
        const resolved = this._resolveFolder(attachment.value);
        const repositoryId = resolved && this._getRepositoryIdForResolvedWorkspace(resolved);
        if (resolved?.workspace.group === SESSION_WORKSPACE_GROUP_GITHUB && repositoryId && !this._additionalRepositorySelections.has(repositoryId)) {
          this._additionalRepositorySelections.set(repositoryId, { ...resolved, attachmentId: attachment.id });
          changed = true;
        }
      }
    }
    if (changed) {
      this._updateTriggerLabel();
      this._onDidChangeSelection.fire();
    }
    return changed;
  }
  get preselectionSource() {
    return this._preselectionSource;
  }
  _selectWorkspaceGroup(group2) {
    this._activeTab = group2;
    this._userPickedTab = true;
    this._pickerGroupContext.set(group2);
  }
  /**
   * Renders the project picker trigger button into the given container.
   * Returns the container element.
   *
   * Calling it again replaces the trigger created by the previous
   * {@link render} call.
   */
  render(container2) {
    this._renderDisposables.clear();
    const slot = append(container2, $(".sessions-chat-picker-slot.sessions-chat-workspace-picker"));
    this._renderDisposables.add({ dispose: () => slot.remove() });
    this._renderDisposables.add(this._addTrigger(slot));
    return slot;
  }
  renderCategoryTriggers(container2, triggers, label3) {
    this._renderDisposables.clear();
    const row = append(container2, $(".sessions-workspace-category-picker"));
    this._renderDisposables.add({ dispose: () => row.remove() });
    if (label3) {
      const rowLabel = append(row, $("span.sessions-workspace-category-picker-label"));
      rowLabel.textContent = label3;
    }
    for (const options3 of triggers) {
      const slot = append(row, $(".sessions-chat-picker-slot.sessions-workspace-category-picker-slot"));
      slot.classList.toggle("sessions-workspace-picker-trigger", options3.reflectsWorkspace === true);
      this._renderDisposables.add(this._addTrigger(slot, options3));
    }
    return row;
  }
  /**
   * Shared trigger-creation core for {@link render}. Wires up the click /
   * keyboard / touch handlers and the per-trigger lifecycle.
   */
  _addTrigger(slot, options3) {
    const triggerDisposables = new DisposableStore();
    const trigger = append(slot, $("a.action-label"));
    trigger.tabIndex = 0;
    trigger.role = "button";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    this._triggerElements.add(trigger);
    this._triggerContents.set(trigger, {});
    if (options3) {
      this._triggerOptions.set(trigger, options3);
    }
    this._triggerElement = trigger;
    this._renderTriggerLabel(trigger);
    if (options3?.tooltip) {
      triggerDisposables.add(this.hoverService.setupDelayedHover(trigger, { content: options3.tooltip }));
    }
    triggerDisposables.add(markOnboardingTarget(trigger, "sessions.newSession.workspacePicker", {
      open: () => this.showPicker(false, trigger, options3?.group, options3?.attachesContext)
    }));
    triggerDisposables.add(Gesture.addTarget(trigger));
    [EventType.CLICK, EventType2.Tap].forEach((eventType) => {
      triggerDisposables.add(addDisposableListener(trigger, eventType, (e4) => {
        EventHelper.stop(e4, true);
        this.showPicker(false, trigger, options3?.group, options3?.attachesContext);
      }));
    });
    triggerDisposables.add(addDisposableListener(trigger, EventType.KEY_DOWN, (e4) => {
      if (e4.key === "Enter" || e4.key === " ") {
        EventHelper.stop(e4, true);
        this.showPicker(false, trigger, options3?.group, options3?.attachesContext);
      }
    }));
    triggerDisposables.add({
      dispose: () => {
        this._triggerContents.get(trigger)?.badge?.dispose();
        this._triggerElements.delete(trigger);
        this._triggerOptions.delete(trigger);
        this._triggerContents.delete(trigger);
        if (this._triggerElement === trigger) {
          this._triggerElement = this._triggerElements.values().next().value;
        }
      }
    });
    return triggerDisposables;
  }
  /**
   * Shows the workspace picker dropdown anchored to a trigger element.
   *
   * @param force When true, re-show even if the picker is already visible.
   *              Used internally when swapping items in place after a tab
   *              change.
   * @param anchor The specific trigger element to anchor the popup to. When
   *               omitted, defaults to the most-recently rendered trigger.
   *               Pass through when more than one trigger is live and the
   *               popup should align with the one the user actually clicked.
   */
  showPicker(force = false, anchor, preferredGroup, attachesContext) {
    const triggerElement = anchor ?? this._triggerElement;
    if (!triggerElement) {
      return;
    }
    const alreadyVisible = this.actionWidgetService.isVisible || this._tabbedWidget.isVisible;
    if (alreadyVisible) {
      if (this._activeTriggerElement === triggerElement) {
        if (!force) {
          this._hidePicker();
          return;
        }
      }
      this._hidePicker();
    }
    this._activeTriggerElement = triggerElement;
    this._setDirectPickerFilter(preferredGroup, attachesContext);
    if (preferredGroup === SESSION_WORKSPACE_GROUP_GITHUB && attachesContext === false && !this._getCurrentRepositoryId()) {
      const items = this._buildItems();
      const directBrowseItem = items.length === 1 && items[0].kind === "action" /* Action */ ? items[0].item : void 0;
      if (directBrowseItem?.browseActionIndex !== void 0 && !items[0].disabled) {
        this._activeTriggerElement = void 0;
        triggerElement.setAttribute("aria-expanded", "false");
        void this._dispatchPickerItem(directBrowseItem).finally(() => {
          this._directPickerGroup = void 0;
          this._directPickerAttachesContext = void 0;
          triggerElement.focus();
        });
        return;
      }
    }
    const tabs = this._showTabs() ? this._getAvailableTabs() : [];
    if (preferredGroup === void 0 && tabs.length > 0) {
      const selectedGroup = this._selectedResolved?.workspace.group;
      if (!this._userPickedTab && selectedGroup && tabs.some((t2) => t2.id === selectedGroup)) {
        this._activeTab = selectedGroup;
      }
      if (!this._activeTab || !tabs.some((t2) => t2.id === this._activeTab)) {
        this._activeTab = tabs[0].id;
      }
    }
    if (preferredGroup !== void 0) {
      this._showFlatPicker(triggerElement);
    } else if (tabs.length > 1) {
      this._showTabbedPicker(tabs, triggerElement);
    } else {
      this._activeTab = void 0;
      this._showFlatPicker(triggerElement);
    }
  }
  _setDirectPickerFilter(group2, attachesContext) {
    this._directPickerGroup = group2;
    this._directPickerAttachesContext = attachesContext;
    if (group2 !== void 0) {
      this._selectWorkspaceGroup(group2);
    }
  }
  /**
   * Subclasses may opt out of the categorical tab bar (e.g. when scoped to
   * a single host).
   */
  _showTabs() {
    return true;
  }
  _getAvailableTabs() {
    const byLabel = /* @__PURE__ */ new Map();
    const remoteAgentHostsEnabled = this.configurationService.getValue(RemoteAgentHostsEnabledSettingId);
    if (remoteAgentHostsEnabled) {
      byLabel.set(SESSION_WORKSPACE_GROUP_REMOTE, {
        id: SESSION_WORKSPACE_GROUP_REMOTE,
        icon: Codicon.beaker,
        tooltip: `${SESSION_WORKSPACE_GROUP_REMOTE} (${localize(4723, null)})`
      });
    }
    for (const provider of this.sessionsProvidersService.getProviders()) {
      if (provider.supportsLocalWorkspaces && !byLabel.has(SESSION_WORKSPACE_GROUP_LOCAL)) {
        byLabel.set(SESSION_WORKSPACE_GROUP_LOCAL, { id: SESSION_WORKSPACE_GROUP_LOCAL });
      }
      for (const action of provider.browseActions) {
        if (action.group === SESSION_WORKSPACE_GROUP_REMOTE && !remoteAgentHostsEnabled) {
          continue;
        }
        if (action.group && !byLabel.has(action.group)) {
          byLabel.set(action.group, { id: action.group });
        }
      }
    }
    return Array.from(byLabel.values()).sort((a, b) => a.id === SESSION_WORKSPACE_GROUP_LOCAL ? -1 : b.id === SESSION_WORKSPACE_GROUP_LOCAL ? 1 : a.id.localeCompare(b.id));
  }
  /**
   * Builds the shared `IActionListDelegate` used by both the flat and
   * tabbed presentations.
   */
  _buildDelegate(triggerElement, hide4) {
    return {
      onSelect: (item) => {
        void this._dispatchPickerItem(item);
        hide4();
      },
      onHide: () => {
        triggerElement.setAttribute("aria-expanded", "false");
        if (this._activeTriggerElement === triggerElement) {
          this._activeTriggerElement = void 0;
          this._directPickerGroup = void 0;
          this._directPickerAttachesContext = void 0;
        }
        triggerElement.focus();
      }
    };
  }
  _buildListOptions(items, pickerWidth) {
    const showFilter = items.filter((i2) => i2.kind === "action" /* Action */).length > FILTER_THRESHOLD2;
    return showFilter ? { showFilter: true, filterPlaceholder: localize(4724, null), reserveSubmenuSpace: false, inlineDescription: true, showGroupTitleOnFirstItem: true, minWidth: pickerWidth, maxWidth: pickerWidth, hideDefaultKeybindingTooltip: true } : { reserveSubmenuSpace: false, inlineDescription: true, showGroupTitleOnFirstItem: true, minWidth: pickerWidth, maxWidth: pickerWidth, hideDefaultKeybindingTooltip: true };
  }
  /**
   * Flat (no-tabs) presentation. Delegates rendering to the shared
   * `IActionWidgetService` so we benefit from its keybindings, focus
   * tracking and submenu chrome.
   */
  _showFlatPicker(triggerElement) {
    this._tabbedWidget.hide();
    const items = this._buildItems();
    const delegate = this._buildDelegate(triggerElement, () => this._hidePicker());
    triggerElement.setAttribute("aria-expanded", "true");
    this.actionWidgetService.show(
      "workspacePicker",
      false,
      items,
      delegate,
      triggerElement,
      void 0,
      [],
      {
        getAriaLabel: (item) => item.label ?? "",
        getWidgetAriaLabel: () => localize(4715, null)
      },
      this._buildListOptions(items, void 0)
    );
  }
  /**
   * Tabbed presentation. Delegates rendering and lifecycle to the
   * platform `TabbedActionListWidget`; this picker only owns the data
   * and selection logic.
   */
  _showTabbedPicker(tabs, triggerElement) {
    if (this.actionWidgetService.isVisible) {
      this.actionWidgetService.hide();
    }
    const delegate = this._buildDelegate(triggerElement, () => this._hidePicker());
    const accessibilityProvider = {
      getAriaLabel: (item) => item.label ?? "",
      getWidgetAriaLabel: () => localize(4715, null)
    };
    triggerElement.setAttribute("aria-expanded", "true");
    this._pickerGroupContext.set(this._activeTab ?? tabs[0].id);
    this._tabbedWidget.show({
      user: "workspacePicker",
      anchor: triggerElement,
      tabs,
      initialTab: this._activeTab ?? tabs[0].id,
      createActionList: (tab) => {
        this._activeTab = tab;
        const items = this._buildItems();
        return { items, listOptions: { inlineDescription: true, showGroupTitleOnFirstItem: true, hideDefaultKeybindingTooltip: true } };
      },
      delegate,
      accessibilityProvider,
      width: TABBED_PICKER_WIDTH,
      tabBarClassName: "sessions-workspace-picker-tabbar"
    });
  }
  /**
   * Dispatch logic for a picker item once the user picks it. Shared
   * between the desktop action-widget delegate and any mobile sheet
   * subclass that opts to render a different UI but reuse the
   * selection semantics. Treats unavailable workspaces as a no-op.
   */
  async _dispatchPickerItem(item) {
    const generation = ++this._selectionGeneration;
    this._reportPickerClosed(item);
    if (item.run) {
      item.run();
      return true;
    } else if (item.commandId) {
      void this.commandService.executeCommand(item.commandId);
      return true;
    } else if (item.folderUri && item.providerId && this._isProviderUnavailable(item.providerId)) {
      return false;
    }
    if (item.browseActionIndex !== void 0) {
      const selection = await this._executeBrowseAction(item.browseActionIndex);
      const folderUri = selection?.workspace.folders[0]?.root;
      if (!folderUri || generation !== this._selectionGeneration) {
        return false;
      }
      if (!await this._canSelectWorkspace(folderUri, selection.providerId)) {
        return false;
      }
      if (generation !== this._selectionGeneration) {
        return false;
      }
      const action = selection.action;
      if (action?.attachesContext) {
        if (action.group) {
          const key3 = `${action.group}:context`;
          const contexts = this._contextSelections.get(key3) ?? [];
          if (!contexts.some((context2) => context2.uri.toString() === selection.workspace.uri.toString())) {
            this._contextSelections.set(key3, [...contexts, selection.workspace]);
          }
          this._updateTriggerLabel();
        }
        this._onDidSelectContext.fire(selection.workspace);
        if (this._selectedFolderUri) {
          return true;
        }
      }
      if (item.attachAsContext) {
        if (action?.group === SESSION_WORKSPACE_GROUP_GITHUB && action.attachesContext !== true && this._attachAdditionalRepository(selection.workspace, selection.providerId)) {
          return true;
        }
        if (action === this._localBrowseAction) {
          this._attachAdditionalFolder(folderUri, selection.providerId);
          return true;
        }
      }
      const relatedWorkspace = this._findRelatedLocalWorkspace(selection.workspace);
      this._selectFolder(
        relatedWorkspace?.workspace.folders[0]?.root ?? folderUri,
        true,
        relatedWorkspace?.providerId ?? selection.providerId
      );
      return true;
    } else if (item.folderUri) {
      if (item.providerId && !await this._connectProviderOnDemand(item.providerId)) {
        return false;
      }
      if (generation !== this._selectionGeneration) {
        return false;
      }
      if (!await this._canSelectWorkspace(item.folderUri, item.providerId)) {
        return false;
      }
      if (generation !== this._selectionGeneration) {
        return false;
      }
      this._selectFolder(item.folderUri, true, item.providerId);
      return true;
    }
    return false;
  }
  _attachAdditionalFolder(folderUri, providerId) {
    if (!this._selectedFolderUri || this.uriIdentityService.extUri.isEqual(this._selectedFolderUri, folderUri)) {
      return false;
    }
    const resolved = this._resolveFolder(folderUri, providerId);
    if (resolved?.workspace.group !== SESSION_WORKSPACE_GROUP_LOCAL) {
      return false;
    }
    const key3 = this.uriIdentityService.extUri.getComparisonKey(folderUri);
    if (!this._additionalFolderSelections.has(key3)) {
      this._additionalFolderSelections.set(key3, resolved);
      this.recentWorkspacesService.addRecentWorkspace(folderUri, providerId, false);
      this._updateTriggerLabel();
      this._onDidSelectFolderContext.fire(folderUri);
    }
    return true;
  }
  _attachAdditionalRepository(workspace, providerId) {
    if (!this._selectedFolderUri || workspace.group !== SESSION_WORKSPACE_GROUP_GITHUB) {
      return false;
    }
    const repositoryId = this._getRepositoryId(workspace);
    if (!repositoryId) {
      return false;
    }
    if (!this._additionalRepositorySelections.has(repositoryId)) {
      const selection = { workspace, providerId };
      this._additionalRepositorySelections.set(repositoryId, {
        ...selection,
        attachmentId: getAdditionalRepositoryContextId(workspace.uri)
      });
      this.recentWorkspacesService.addRecentWorkspace(workspace.folders[0].root, providerId, false);
      this._updateTriggerLabel();
      this._onDidSelectRepositoryContext.fire(selection);
      this._onDidChangeSelection.fire();
    }
    return true;
  }
  _findRelatedLocalWorkspace(workspace) {
    const repositoryId = this._getRepositoryId(workspace);
    if (!repositoryId) {
      return void 0;
    }
    const matchesRepository = (candidate) => candidate.workspace.group === SESSION_WORKSPACE_GROUP_LOCAL && this._getRepositoryIdForResolvedWorkspace(candidate) === repositoryId;
    if (this._selectedResolved && matchesRepository(this._selectedResolved)) {
      return this._selectedResolved;
    }
    return this._getRecentWorkspaces().find(matchesRepository);
  }
  _getRepositoryId(workspace) {
    const info = workspace.folders.map((folder) => folder.gitRepository?.gitHubInfo.get()).find((candidate) => candidate !== void 0);
    if (info) {
      return `${info.owner}/${info.repo}`.toLowerCase();
    }
    if (workspace.group !== SESSION_WORKSPACE_GROUP_GITHUB) {
      return void 0;
    }
    const pathSegments = workspace.folders[0]?.root.path.split("/").filter(Boolean);
    return pathSegments?.[0] && pathSegments[1] ? `${pathSegments[0]}/${pathSegments[1]}`.toLowerCase() : void 0;
  }
  _getCurrentRepositoryId() {
    const workspace = this._getSelectedRepositoryWorkspace();
    return workspace && this._getRepositoryId(workspace);
  }
  /**
   * Emits `newChatPickerClosed` telemetry on user selection. The
   * "before" value is read from storage (the currently-checked recent
   * workspace) if available, otherwise from the in-memory selection.
   * The "after" value comes from the item the user picked — undefined
   * when the item is a browse action or command rather than a workspace.
   */
  _reportPickerClosed(item) {
    const beforeFromStorage = this._restoreCheckedWorkspace();
    const before = beforeFromStorage ?? this._selectedResolved;
    const afterUri = item.folderUri;
    const afterResolved = afterUri ? this._resolveFolder(afterUri) : void 0;
    reportNewChatPickerClosed(this.telemetryService, {
      id: "NewChatWorkspacePicker",
      name: "NewChatWorkspacePicker",
      optionIdBefore: before?.workspace?.uri.toString(),
      optionIdAfter: afterResolved?.workspace?.uri.toString(),
      optionLabelBefore: before?.workspace?.label,
      optionLabelAfter: afterResolved?.workspace?.label,
      isPII: true
    });
  }
  /**
   * Programmatically set the selected workspace by folder URI.
   * @param folderUri The folder URI to select.
   * @param options.fireEvent Whether to fire the onDidSelectWorkspace event. Defaults to true.
   * @param options.providerId Optional providerId hint that wins over any historical
   *        recent entry's provider. Use when the caller knows which provider should
   *        own the resulting session (e.g. "New Session" invoked from a workspace
   *        section in the sessions list, where the existing sessions for the
   *        workspace were created by a specific provider).
   * @param options.persist Whether to persist the selection as a recent workspace. Defaults to true.
   */
  setSelectedWorkspace(folderUri, options3) {
    this._selectFolder(
      folderUri,
      options3?.fireEvent ?? true,
      options3?.providerId,
      options3?.persist ?? true,
      "providedWorkspace" /* ProvidedWorkspace */
    );
  }
  /**
   * Hides whichever popup variant is currently visible — the shared
   * action-widget-service flat picker or our own context-view-driven
   * tabbed picker.
   */
  _hidePicker() {
    this._tabbedWidget.hide();
    if (this.actionWidgetService.isVisible) {
      this.actionWidgetService.hide();
    }
    this._activeTriggerElement?.setAttribute("aria-expanded", "false");
    this._activeTriggerElement = void 0;
    this._directPickerGroup = void 0;
    this._directPickerAttachesContext = void 0;
  }
  /**
   * Clears the selected project.
   */
  clearSelection() {
    this._selectionGeneration++;
    this._hidePicker();
    this._userHasPicked = true;
    this._connectionStatusWatch.clear();
    this._selectedFolderUri = void 0;
    this._selectedResolved = void 0;
    this._preselectionSource = "none" /* None */;
    if (this._shouldPersistSelection()) {
      this.recentWorkspacesService.clearCheckedWorkspace();
    }
    this._updateTriggerLabel();
    this._onDidChangeSelection.fire();
    this._onDidSelectWorkspace.fire(void 0);
  }
  /**
   * Clears the selection if it matches the given URI.
   */
  removeFromRecents(uri4) {
    if (this._selectedFolderUri && this.uriIdentityService.extUri.isEqual(this._selectedFolderUri, uri4)) {
      this.clearSelection();
    }
  }
  _selectFolder(folderUri, fireEvent = true, providerIdHint, persist = true, source = "user" /* User */) {
    this._selectionGeneration++;
    this._userHasPicked = true;
    this._connectionStatusWatch.clear();
    const storedProviderId = this.recentWorkspacesService.getRecentWorkspaces().find((r2) => this.uriIdentityService.extUri.isEqual(r2.workspace.folders[0]?.root, folderUri))?.providerId;
    const resolved = this._resolveFolder(folderUri, providerIdHint ?? storedProviderId);
    const additionalFolderKey = this.uriIdentityService.extUri.getComparisonKey(folderUri);
    const additionalFolder = this._additionalFolderSelections.get(additionalFolderKey);
    const removedAdditionalFolder = this._additionalFolderSelections.delete(additionalFolderKey);
    const repositoryId = resolved && this._getRepositoryIdForResolvedWorkspace(resolved);
    const additionalRepository = repositoryId ? this._additionalRepositorySelections.get(repositoryId) : void 0;
    const removedAdditionalRepository = repositoryId ? this._additionalRepositorySelections.delete(repositoryId) : false;
    if (removedAdditionalFolder && additionalFolder) {
      this._onDidRemoveAttachedContext.fire(getAdditionalFolderContextId(additionalFolder.workspace.folders[0].root));
    }
    if (removedAdditionalRepository && additionalRepository) {
      this._onDidRemoveAttachedContext.fire(additionalRepository.attachmentId);
    }
    this._selectedFolderUri = folderUri;
    this._selectedResolved = resolved;
    this._watchSelectedGitHubInfo();
    this._preselectionSource = source;
    if (persist && this._shouldPersistSelection()) {
      this.recentWorkspacesService.addRecentWorkspace(folderUri, resolved?.providerId, true);
    }
    this._updateTriggerLabel();
    this._onDidChangeSelection.fire();
    if (fireEvent) {
      this._onDidSelectWorkspace.fire(folderUri);
    }
  }
  _shouldPersistSelection() {
    return true;
  }
  /**
   * Apply a restored selection without firing events or persisting. Used
   * during construction and after provider list changes.
   */
  _applySelection(resolved, source = "none" /* None */) {
    this._selectedResolved = resolved;
    this._selectedFolderUri = resolved?.workspace.folders[0]?.root;
    this._watchSelectedGitHubInfo();
    this._preselectionSource = resolved ? source : "none" /* None */;
  }
  _watchSelectedGitHubInfo() {
    const store = new DisposableStore();
    this._gitHubInfoWatch.value = store;
    const observed = /* @__PURE__ */ new Set();
    for (const workspace of this._getSelectedRepositoryWorkspaceCandidates()) {
      for (const folder of workspace.folders) {
        folder.gitRepository?.resolveGitHubInfo?.();
        const gitHubInfo = folder.gitRepository?.gitHubInfo;
        if (gitHubInfo && !observed.has(gitHubInfo)) {
          observed.add(gitHubInfo);
          store.add(autorun((reader) => {
            gitHubInfo.read(reader);
            this._updateTriggerLabel();
          }));
        }
      }
    }
  }
  _getSelectedRepositoryWorkspace() {
    return this._getSelectedRepositoryWorkspaceCandidates().find((workspace) => this._getRepositoryId(workspace) !== void 0);
  }
  _getSelectedRepositoryWorkspaceCandidates() {
    if (!this._selectedResolved || !this._selectedFolderUri) {
      return [];
    }
    return this._getRepositoryWorkspaceCandidates(this._selectedResolved);
  }
  _getRepositoryIdForResolvedWorkspace(selection) {
    for (const workspace of this._getRepositoryWorkspaceCandidates(selection)) {
      const repositoryId = this._getRepositoryId(workspace);
      if (repositoryId) {
        return repositoryId;
      }
    }
    return void 0;
  }
  _getRepositoryWorkspaceCandidates(selection) {
    const folderUri = selection.workspace.folders[0]?.root;
    if (!folderUri) {
      return [selection.workspace];
    }
    const candidates = [selection.workspace];
    for (const provider of this.sessionsProvidersService.getProviders()) {
      if (provider.id === selection.providerId) {
        continue;
      }
      const workspace = provider.resolveWorkspace(folderUri);
      if (workspace?.group === SESSION_WORKSPACE_GROUP_LOCAL) {
        candidates.push(workspace);
      }
    }
    return candidates;
  }
  /**
   * Iterate providers and return the first resolution of the folder URI.
   * When `preferredProviderId` is given, that provider is tried first so a
   * user's historical pick survives provider iteration order changes.
   */
  _resolveFolder(folderUri, preferredProviderId) {
    if (preferredProviderId) {
      const preferred = this.sessionsProvidersService.getProvider(preferredProviderId);
      const workspace = preferred?.resolveWorkspace(folderUri);
      if (workspace) {
        return { providerId: preferredProviderId, workspace };
      }
    }
    for (const provider of this.sessionsProvidersService.getProviders()) {
      const workspace = provider.resolveWorkspace(folderUri);
      if (workspace) {
        return { providerId: provider.id, workspace };
      }
    }
    return void 0;
  }
  /**
   * Executes a browse action from a provider, identified by index.
   */
  async _executeBrowseAction(actionIndex) {
    const allActions = this._getAllBrowseActions();
    const action = allActions[actionIndex];
    if (!action) {
      return void 0;
    }
    await Promise.resolve();
    try {
      if (action === this._localBrowseAction) {
        const selection = await this._browseForLocalFolder();
        return selection ? { ...selection, action } : void 0;
      }
      const workspace = await action.run(this._getSelectedRepositoryWorkspace() ?? this._selectedResolved?.workspace);
      return workspace ? { workspace, providerId: action.providerId, action } : void 0;
    } catch {
    }
    return void 0;
  }
  async _canSelectWorkspace(folderUri, providerId) {
    return !this.options.canSelectWorkspace || await this.options.canSelectWorkspace(folderUri, providerId);
  }
  /**
   * Collects browse actions from all registered providers, scoped to the
   * currently active tab when tabs are shown.
   */
  _getAllBrowseActions() {
    const all = this.sessionsProvidersService.getProviders().flatMap((p) => p.browseActions);
    const hasLocalSupport = this.sessionsProvidersService.getProviders().some((p) => p.supportsLocalWorkspaces);
    if (hasLocalSupport) {
      all.unshift(this._localBrowseAction);
    }
    if (!this._isTabFiltered()) {
      return all;
    }
    return all.filter(
      (a) => a.group === this._activeTab && (this._directPickerAttachesContext === void 0 || Boolean(a.attachesContext) === this._directPickerAttachesContext)
    );
  }
  /**
   * Opens a folder picker dialog and returns the chosen URI. The folder's
   * provider is rediscovered later by the management service when the
   * session is created — no provider quick-pick is needed here.
   */
  async _browseForLocalFolder() {
    const localProviders = this.sessionsProvidersService.getProviders().filter((p) => p.supportsLocalWorkspaces);
    if (localProviders.length === 0) {
      return void 0;
    }
    const result = await this.fileDialogService.showOpenDialog({
      canSelectFolders: true,
      canSelectFiles: false,
      canSelectMany: false
    });
    if (!result?.length) {
      return void 0;
    }
    for (const provider of localProviders) {
      const workspace = provider.resolveWorkspace(result[0]);
      if (workspace) {
        return { workspace, providerId: provider.id };
      }
    }
    return void 0;
  }
  /** True when the picker is currently scoped to a single tab. */
  _isTabFiltered() {
    return this._directPickerGroup !== void 0 || this._showTabs() && !!this._activeTab && this._getAvailableTabs().length > 1;
  }
  _getActivePickerGroup() {
    return this._directPickerGroup ?? (this._directPickerAttachesContext !== void 0 ? this._activeTab : void 0);
  }
  /**
   * Builds the picker items list from recent workspaces.
   *
   * Items are shown in a flat recency-sorted list (most recently used first)
   * without source grouping. Own recents come first, followed by VS Code
   * recent folders.
   */
  _buildItems() {
    const items = [];
    const allProviders = this.sessionsProvidersService.getProviders();
    const providerIds = new Set(allProviders.map((p) => p.id));
    const availableTabs = this._getAvailableTabs();
    const activeGroup = this._activeTab ?? (availableTabs.length === 1 ? availableTabs[0].id : void 0);
    const workspaceGroupAction = this.options.getWorkspaceGroupAction?.(activeGroup);
    const tabFilter = this._isTabFiltered() ? (w) => w.workspace.group === this._activeTab : void 0;
    const recentWorkspaces = workspaceGroupAction?.hideWorkspaceItems ? [] : this._directPickerAttachesContext === true ? [] : this._getRecentWorkspaces().filter((w) => providerIds.has(w.providerId)).filter((w) => !tabFilter || tabFilter(w));
    for (const { workspace, providerId } of recentWorkspaces) {
      const folderUri = workspace.folders[0]?.root;
      if (!folderUri) {
        continue;
      }
      const repositoryId = this._getRepositoryIdForResolvedWorkspace({ workspace, providerId });
      const selected = this._isSelectedFolder(folderUri) || repositoryId !== void 0 && repositoryId === this._getCurrentRepositoryId();
      const attached = this._additionalFolderSelections.has(this.uriIdentityService.extUri.getComparisonKey(folderUri)) || repositoryId !== void 0 && this._additionalRepositorySelections.has(repositoryId);
      items.push({
        kind: "action" /* Action */,
        label: workspace.label,
        description: workspace.description,
        group: { title: "", icon: workspace.icon },
        disabled: this._isProviderUnavailable(providerId),
        item: { folderUri, providerId, checked: selected || attached || void 0 },
        onRemove: () => this._removeRecentWorkspace(folderUri)
      });
    }
    const allBrowseActions = workspaceGroupAction?.hideWorkspaceItems ? [] : this._getAllBrowseActions();
    const remoteProviders = allProviders.filter(isAgentHostProvider).filter((p) => p.connectionStatus !== void 0);
    const includeRemoteProviders = this._activeTab === SESSION_WORKSPACE_GROUP_REMOTE;
    if (items.length > 0 && (workspaceGroupAction || allBrowseActions.length > 0)) {
      items.push({ kind: "separator" /* Separator */, label: "" });
    }
    if (workspaceGroupAction) {
      items.push({
        kind: "action" /* Action */,
        label: workspaceGroupAction.label,
        description: workspaceGroupAction.description,
        group: { title: "", icon: workspaceGroupAction.icon },
        item: { commandId: workspaceGroupAction.commandId }
      });
    }
    allBrowseActions.forEach((action, index2) => {
      const provider = allProviders.find((p) => p.id === action.providerId);
      const agentHostProvider = provider && isAgentHostProvider(provider) ? provider : void 0;
      const connectionStatus = agentHostProvider?.connectionStatus?.get();
      const isIncompatible = RemoteAgentHostConnectionStatus.isIncompatible(connectionStatus);
      const isUnavailable = isIncompatible || !!connectionStatus && !RemoteAgentHostConnectionStatus.isConnected(connectionStatus) && !agentHostProvider?.canConnectOnDemand;
      const isRepositoryAction = action.group === SESSION_WORKSPACE_GROUP_GITHUB && action.attachesContext !== true;
      items.push({
        kind: "action" /* Action */,
        label: action.label,
        description: action.description,
        group: { title: "", icon: action.icon },
        disabled: isUnavailable,
        item: { browseActionIndex: index2 }
      });
      const canAttachFolder = action === this._localBrowseAction && this._selectedFolderUri && this._getActivePickerGroup() === SESSION_WORKSPACE_GROUP_LOCAL;
      const canAttachRepository = isRepositoryAction && this._selectedFolderUri && this._getActivePickerGroup() === SESSION_WORKSPACE_GROUP_GITHUB;
      if (canAttachFolder || canAttachRepository) {
        items.push({
          kind: "action" /* Action */,
          label: canAttachFolder ? localize(4717, null) : localize(4718, null),
          description: action.description,
          group: { title: "", icon: action.icon },
          disabled: isUnavailable,
          item: { browseActionIndex: index2, attachAsContext: true }
        });
      }
    });
    const manageActions = [];
    if (includeRemoteProviders) {
      for (const provider of remoteProviders) {
        const status2 = provider.connectionStatus.get();
        const isTunnel = provider.remoteAddress?.startsWith(TUNNEL_ADDRESS_PREFIX);
        const action = toAction({
          id: `workspacePicker.remote.${provider.id}`,
          label: provider.label,
          tooltip: getStatusLabel(status2),
          enabled: true,
          run: () => {
            this._hidePicker();
            this._showRemoteHostOptionsDelayed(provider);
          }
        });
        const extended = action;
        extended.icon = RemoteAgentHostConnectionStatus.isIncompatible(status2) ? Codicon.warning : isTunnel ? Codicon.cloud : Codicon.remote;
        extended.hoverContent = getStatusHover(status2, provider.remoteAddress);
        if (provider.remoteAddress) {
          extended.onRemove = async () => {
            await removeRemoteHost(provider, this.remoteAgentHostService, this.configurationService);
          };
        }
        manageActions.push(action);
      }
    }
    const menuActions = this.menuService.getMenuActions(Menus.SessionWorkspaceManage, this.contextKeyService, { renderShortTitle: true });
    for (const [, actions] of menuActions) {
      for (const menuAction of actions) {
        if (menuAction instanceof MenuItemAction) {
          const icon2 = ThemeIcon.isThemeIcon(menuAction.item.icon) ? menuAction.item.icon : void 0;
          manageActions.push(Object.assign(menuAction, { icon: icon2 }));
        }
      }
    }
    if (manageActions.length > 0) {
      if (items.length > 0 && items[items.length - 1].kind !== "separator" /* Separator */) {
        items.push({ kind: "separator" /* Separator */, label: "" });
      }
      for (const action of manageActions) {
        const extended = action;
        items.push({
          kind: "action" /* Action */,
          label: action.label,
          description: extended.onRemove ? action.tooltip || void 0 : void 0,
          group: { title: "", icon: extended.icon ?? Codicon.settingsGear },
          item: { run: () => action.run(), commandId: action.id },
          onRemove: extended.onRemove
        });
      }
    }
    if (items.length === 0 && this._getActivePickerGroup() === SESSION_WORKSPACE_GROUP_GITHUB) {
      items.push({
        kind: "action" /* Action */,
        label: localize(4725, null),
        group: { title: "", icon: Codicon.loading },
        disabled: true,
        item: {}
      });
    }
    return items;
  }
  _showRemoteHostOptionsDelayed(provider) {
    const timeout2 = setTimeout(() => {
      this.instantiationService.invokeFunction((accessor) => showRemoteHostOptions(accessor, provider));
    }, 1);
    this._renderDisposables.add({ dispose: () => clearTimeout(timeout2) });
  }
  _updateTriggerLabel() {
    for (const trigger of this._triggerElements) {
      this._renderTriggerLabel(trigger);
    }
  }
  _renderTriggerLabel(trigger) {
    const options3 = this._triggerOptions.get(trigger);
    const contents = this._triggerContents.get(trigger);
    if (!contents) {
      return;
    }
    if (options3) {
      const workspace2 = this._selectedResolved?.workspace;
      const reflectsWorkspace = options3.reflectsWorkspace === true;
      const isSelectedCategory = options3.attachesContext !== true && options3.group !== void 0 && options3.group === workspace2?.group;
      const contextCount = options3.group && options3.attachesContext ? Math.max(
        this._contextSelections.get(`${options3.group}:context`)?.length ?? 0,
        options3.group === SESSION_WORKSPACE_GROUP_GITHUB ? this._attachedContext.filter((attachment) => attachment.id.startsWith("github-context:")).length : 0
      ) : 0;
      const additionalWorkspaceCount = options3.attachesContext !== true && (reflectsWorkspace || isSelectedCategory) ? this._additionalFolderSelections.size + this._additionalRepositorySelections.size : 0;
      const badgeCount = Math.max(contextCount, additionalWorkspaceCount);
      const repositoryWorkspace = this._getSelectedRepositoryWorkspace();
      const relatedGitHubInfo = options3.group === SESSION_WORKSPACE_GROUP_GITHUB && options3.attachesContext === false ? repositoryWorkspace?.folders.map((folder) => folder.gitRepository?.gitHubInfo.get()).find((info) => info !== void 0) : void 0;
      const hideForSelectedWorkspace = workspace2 !== void 0 && options3.hideWhenWorkspaceSelected === true && options3.group !== workspace2.group;
      const hideForMissingWorkspace = workspace2 === void 0 && options3.hideWhenNoWorkspaceSelected === true;
      const hideForMissingGitHubRepository = options3.hideWhenNoGitHubRepository === true && this._getCurrentRepositoryId() === void 0;
      trigger.parentElement?.toggleAttribute("hidden", hideForSelectedWorkspace || hideForMissingWorkspace || hideForMissingGitHubRepository);
      trigger.classList.toggle("selected", reflectsWorkspace && workspace2 !== void 0 || isSelectedCategory || badgeCount > 0 || relatedGitHubInfo !== void 0);
      const icon3 = (reflectsWorkspace ? workspace2?.icon : void 0) ?? (relatedGitHubInfo ? Codicon.repo : isSelectedCategory && workspace2 ? workspace2.icon : options3.icon);
      if (!icon3 || options3.hideIconWhenAttached === true && badgeCount > 0) {
        contents.icon?.remove();
        contents.icon = void 0;
      } else {
        if (!contents.icon) {
          contents.icon = renderIcon(icon3);
          trigger.prepend(contents.icon);
        }
        contents.icon.className = ThemeIcon.asClassName(icon3);
      }
      const label4 = (reflectsWorkspace ? workspace2?.label : void 0) ?? (relatedGitHubInfo ? `${relatedGitHubInfo.owner}/${relatedGitHubInfo.repo}` : isSelectedCategory && workspace2 ? workspace2.label : options3.label);
      trigger.setAttribute("aria-label", badgeCount > 0 ? localize(4716, null, options3.ariaLabel, badgeCount) : label4 && label4 !== options3.label ? localize(4720, null, options3.label ?? options3.ariaLabel, label4) : options3.ariaLabel);
      if (label4) {
        contents.label ??= append(trigger, $("span.sessions-chat-dropdown-label"));
        contents.label.textContent = label4;
      } else {
        contents.label?.remove();
        contents.label = void 0;
      }
      if (badgeCount > 0) {
        contents.badge ??= new CountBadge(trigger, { count: badgeCount }, defaultCountBadgeStyles);
        contents.badge.setCount(badgeCount);
      } else {
        contents.badge?.dispose();
        contents.badge = void 0;
      }
      if (!contents.chevron) {
        contents.chevron = renderIcon(Codicon.chevronDownCompact);
        contents.chevron.classList.add("sessions-chat-dropdown-chevron");
        contents.chevron.setAttribute("aria-hidden", "true");
      }
      trigger.append(contents.chevron);
      return;
    }
    clearNode(trigger);
    const workspace = this._selectedResolved?.workspace;
    const label3 = workspace ? workspace.label : localize(4714, null);
    const icon2 = workspace ? workspace.icon : Codicon.project;
    trigger.setAttribute("aria-label", workspace ? localize(4727, null, label3) : localize(4726, null));
    contents.icon = append(trigger, renderIcon(icon2));
    contents.label = append(trigger, $("span.sessions-chat-dropdown-label"));
    contents.label.textContent = label3;
    append(trigger, renderIcon(Codicon.chevronDownCompact)).classList.add("sessions-chat-dropdown-chevron");
  }
  /**
   * Returns whether the given provider is a remote that is currently unavailable
   * (incompatible, or disconnected/still connecting without on-demand connect).
   * Returns false for providers without connection status (e.g. local providers).
   */
  _isProviderUnavailable(providerId) {
    const provider = this.sessionsProvidersService.getProvider(providerId);
    if (!provider || !isAgentHostProvider(provider) || !provider.connectionStatus) {
      return false;
    }
    const connectionStatus = provider.connectionStatus.get();
    return RemoteAgentHostConnectionStatus.isIncompatible(connectionStatus) || !RemoteAgentHostConnectionStatus.isConnected(connectionStatus) && !provider.canConnectOnDemand;
  }
  async _connectProviderOnDemand(providerId) {
    const provider = this.sessionsProvidersService.getProvider(providerId);
    if (!provider || !isAgentHostProvider(provider) || !provider.connectionStatus) {
      return true;
    }
    const connectionStatus = provider.connectionStatus.get();
    if (RemoteAgentHostConnectionStatus.isConnected(connectionStatus)) {
      return true;
    }
    if (RemoteAgentHostConnectionStatus.isIncompatible(connectionStatus) || !provider.canConnectOnDemand || !provider.connect) {
      return false;
    }
    const initialMessage = localize(4721, null, provider.label);
    const handle2 = this.notificationService.notify({
      severity: Severity2.Info,
      message: initialMessage,
      progress: { infinite: true }
    });
    status(initialMessage);
    const progressListener = provider.onDidReportConnectProgress?.((progress) => {
      if (!provider.remoteAddress || progress.connectionKey === provider.remoteAddress) {
        handle2.updateMessage(progress.message);
        status(progress.message);
      }
    });
    let connected = false;
    try {
      await provider.connect();
      connected = RemoteAgentHostConnectionStatus.isConnected(provider.connectionStatus.get());
    } catch {
    } finally {
      progressListener?.dispose();
      handle2.close();
    }
    if (connected) {
      return true;
    }
    const message = localize(4722, null, provider.label);
    this.notificationService.error(message);
    status(message);
    return false;
  }
  _isSelectedFolder(folderUri) {
    if (!this._selectedFolderUri || !folderUri) {
      return false;
    }
    return this.uriIdentityService.extUri.isEqual(this._selectedFolderUri, folderUri);
  }
  _restoreSelectedWorkspace() {
    const checked = this._restoreCheckedWorkspace();
    if (checked && this._canRestoreProviderWorkspace(checked.providerId)) {
      return {
        resolved: checked,
        source: "checkedWorkspace" /* CheckedWorkspace */
      };
    }
    try {
      for (const recent of this.recentWorkspacesService.getRecentWorkspaces()) {
        const folderUri = recent.workspace.folders[0]?.root;
        if (!folderUri || !this._canRestoreProviderWorkspace(recent.providerId) || isWorktreeWorkspaceUri(folderUri) || this._isProviderUnavailable(recent.providerId)) {
          continue;
        }
        return {
          resolved: recent,
          source: "recentWorkspace" /* RecentWorkspace */
        };
      }
      return void 0;
    } catch {
      return void 0;
    }
  }
  _resetAutomaticSelection() {
    this._selectionGeneration++;
    this._sessionRestoreGeneration++;
    this._userHasPicked = false;
    this._connectionStatusWatch.clear();
    this._applySelection(void 0);
    this._updateTriggerLabel();
    this._onDidChangeSelection.fire();
    this._onDidSelectWorkspace.fire(void 0);
    this._sessionWorkspaceFallback?.refreshProviders();
    this._restoreAutomaticSelection();
  }
  /** Re-runs automatic selection and reports whether it changed synchronously. */
  refreshAutomaticSelection() {
    return this._restoreAutomaticSelection();
  }
  _restoreAutomaticSelection() {
    if (this._userHasPicked || !this._canRestoreWorkspace()) {
      return false;
    }
    const restored = this._restoreSelectedWorkspace();
    if (!restored) {
      if (!this._selectedFolderUri || this._preselectionSource === "existingSessions" /* ExistingSessions */) {
        this._scheduleSessionWorkspaceRestore();
      }
      return false;
    }
    this._sessionRestoreGeneration++;
    if (this._isSelectedFolder(restored.resolved.workspace.folders[0]?.root)) {
      this._selectedResolved = restored.resolved;
      this._preselectionSource = restored.source;
      return false;
    }
    this._applySelection(restored.resolved, restored.source);
    this._updateTriggerLabel();
    this._onDidChangeSelection.fire();
    this._onDidSelectWorkspace.fire(this._selectedFolderUri);
    this._watchForConnectionFailure(restored.resolved);
    return true;
  }
  _scheduleSessionWorkspaceRestore() {
    if (!this._sessionWorkspaceFallback || this._userHasPicked || !this._canRestoreWorkspace()) {
      return;
    }
    const restoreGeneration = ++this._sessionRestoreGeneration;
    const selectionGeneration = this._selectionGeneration;
    void this._sessionWorkspaceFallback.findWorkspace().then((restored) => {
      if (restoreGeneration !== this._sessionRestoreGeneration || selectionGeneration !== this._selectionGeneration || this._userHasPicked || !this._canRestoreWorkspace()) {
        return;
      }
      if (this._restoreSelectedWorkspace()) {
        this._restoreAutomaticSelection();
        return;
      }
      if (!restored) {
        if (this._preselectionSource === "existingSessions" /* ExistingSessions */) {
          this._applySelection(void 0);
          this._updateTriggerLabel();
          this._onDidChangeSelection.fire();
          this._onDidSelectWorkspace.fire(void 0);
        }
        return;
      }
      const folderUri = restored.workspace.folders[0]?.root;
      if (this._isSelectedFolder(folderUri)) {
        this._selectedResolved = restored;
        this._preselectionSource = "existingSessions" /* ExistingSessions */;
        return;
      }
      this._applySelection(restored, "existingSessions" /* ExistingSessions */);
      this._updateTriggerLabel();
      this._onDidChangeSelection.fire();
      this._onDidSelectWorkspace.fire(this._selectedFolderUri);
      this._watchForConnectionFailure(restored);
    }).catch(onUnexpectedError);
  }
  _canRestoreProviderWorkspace(providerId) {
    return !this.options.sessionWorkspaceProviderFilter || this.options.sessionWorkspaceProviderFilter(providerId);
  }
  _canRestoreWorkspace() {
    return this.options.canRestoreWorkspace?.() ?? true;
  }
  /**
   * Restore only the checked (previously selected) workspace if any
   * provider can resolve its URI. The provider's connection status is
   * intentionally NOT checked — we honor the user's explicit pick even
   * if the remote is still connecting or currently disconnected. The
   * trigger label reflects the connection state separately
   * (spinner / grayed).
   */
  _restoreCheckedWorkspace() {
    try {
      return this.recentWorkspacesService.getRecentWorkspaces(false).find((recent) => {
        const folderUri = recent.workspace.folders[0]?.root;
        return recent.checked && !!folderUri && !isWorktreeWorkspaceUri(folderUri);
      });
    } catch {
      return void 0;
    }
  }
  /**
   * When restoring a workspace whose provider isn't currently Connected,
   * watch the connection status. Fires `onDidSelectWorkspace(undefined)`
   * (which the view pane converts to `unsetNewSession()`) if:
   *   - the status transitions to Disconnected after we start watching, or
   *   - the status is still not Connected after a short grace period.
   *
   * The grace period covers a race: provider state can transition synchronously
   * inside provider registration before our autorun's first read, so we may
   * never observe an explicit Disconnected transition. The timer ensures we
   * eventually fall back instead of leaving the picker showing an unreachable
   * remote with no session.
   *
   * Has no effect once the user makes an explicit pick (`_userHasPicked`).
   */
  _watchForConnectionFailure(resolved) {
    const provider = this.sessionsProvidersService.getProvider(resolved.providerId);
    if (!provider || !isAgentHostProvider(provider) || !provider.connectionStatus) {
      return;
    }
    const connStatus = provider.connectionStatus;
    if (RemoteAgentHostConnectionStatus.isConnected(connStatus.get())) {
      return;
    }
    const folderUri = resolved.workspace.folders[0]?.root;
    if (!folderUri) {
      return;
    }
    const store = new DisposableStore();
    this._connectionStatusWatch.value = store;
    const fallback2 = () => {
      this._connectionStatusWatch.clear();
      if (!this._userHasPicked && this._isSelectedFolder(folderUri)) {
        this._selectedFolderUri = void 0;
        this._selectedResolved = void 0;
        this._preselectionSource = "none" /* None */;
        this._updateTriggerLabel();
        this._onDidChangeSelection.fire();
        this._onDidSelectWorkspace.fire(void 0);
      }
    };
    let isFirstRun = true;
    store.add(autorun((reader) => {
      const status2 = connStatus.read(reader);
      const isBusy = RemoteAgentHostConnectionStatus.isConnecting(status2) || RemoteAgentHostConnectionStatus.isReconnecting(status2);
      if (RemoteAgentHostConnectionStatus.isConnected(status2)) {
        this._connectionStatusWatch.clear();
      } else if (!isBusy && !isFirstRun) {
        fallback2();
      }
      isFirstRun = false;
    }));
    disposableTimeout(() => {
      if (!RemoteAgentHostConnectionStatus.isConnected(connStatus.get())) {
        fallback2();
      }
    }, RESTORE_CONNECT_GRACE_MS, store);
  }
  // -- Recent workspaces (sessions' own history) --
  _getRecentWorkspaces() {
    return this.recentWorkspacesService.getRecentWorkspaces();
  }
  _removeRecentWorkspace(folderUri) {
    this.recentWorkspacesService.removeRecentWorkspace(folderUri);
    if (this._isSelectedFolder(folderUri)) {
      this._hidePicker();
      this._selectedFolderUri = void 0;
      this._selectedResolved = void 0;
      this._preselectionSource = "none" /* None */;
      this._updateTriggerLabel();
      this._onDidSelectWorkspace.fire(void 0);
    }
  }
};

WorkspacePicker = __decorateClass([
  __decorateParam(1, IActionWidgetService),
  __decorateParam(2, IUriIdentityService),
  __decorateParam(3, ISessionsProvidersService),
  __decorateParam(4, ISessionsRecentWorkspacesService),
  __decorateParam(5, IRemoteAgentHostService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, ICommandService),
  __decorateParam(8, IMenuService),
  __decorateParam(9, IContextKeyService),
  __decorateParam(10, IInstantiationService),
  __decorateParam(11, IFileDialogService),
  __decorateParam(12, ITelemetryService),
  __decorateParam(13, INotificationService),
  __decorateParam(14, IHoverService)
], WorkspacePicker);
export { FILTER_THRESHOLD2, TABBED_PICKER_WIDTH, RESTORE_CONNECT_GRACE_MS, WorkspacePicker };
