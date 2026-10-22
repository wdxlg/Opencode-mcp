// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/sessions/browser/views/automationsView.ts
import { $, EventType, addDisposableListener, append, clearNode, getWindow, isAncestor, isMouseEvent, reset, trackFocus } from "./module-0075.mjs";
import { ContextKeyExpr, IContextKeyService, RawContextKey } from "./module-0089.mjs";
import { Disposable, DisposableMap, DisposableStore, MutableDisposable, combinedDisposable, toDisposable } from "./module-0012.mjs";
import { observableValue } from "./module-0048.mjs";
import { AutomationsCustomViewFocusContext, AutomationsHasItemsContext, SessionIsArchivedContext, SessionIsReadContext, SessionSupportsRenameContext } from "./module-1770.mjs";
import { autorun } from "./module-0052.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IAutomationService } from "./module-2218.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IUriIdentityService } from "./module-0510.mjs";
import { EventType2, Gesture } from "./module-0251.mjs";
import { Menus } from "./module-3437.mjs";
import { StandardMouseEvent } from "./module-0024.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Button, ButtonBar } from "./module-0546.mjs";
import { Codicon } from "./module-0085.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { getDefaultHoverDelegate } from "./module-0448.mjs";
import { CancellationToken } from "./module-0025.mjs";
import { status } from "./module-0076.mjs";
import { defaultButtonStyles } from "./module-0513.mjs";
import { CHAT_AUTOMATIONS_ENABLED_SETTING, ChatAutomationsEnabledContext } from "./module-2638.mjs";
import { IAutomationRunner } from "./module-2636.mjs";
import { IAutomationDialogService } from "./module-2637.mjs";
import { IHoverService } from "./module-0520.mjs";
import { ILogService } from "./module-0095.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { AgentSessionApprovalModel } from "./module-2733.mjs";
import { transaction } from "./module-0045.mjs";
import { SessionItemStatusContext, SessionsFlatList } from "./module-3523.mjs";
import { SessionStatusIcon } from "./module-3497.mjs";
import { ARCHIVE_SESSION_COMMAND_ID, MARK_SESSION_READ_COMMAND_ID, MARK_SESSION_UNREAD_COMMAND_ID, RENAME_SESSION_COMMAND_ID, UNARCHIVE_SESSION_COMMAND_ID } from "./module-1800.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { DAYS_OF_WEEK } from "./module-2639.mjs";
import { basename2 } from "./module-0034.mjs";
import { AbstractCustomView } from "./module-3722.mjs";
import { constObservable } from "./module-0061.mjs";
import { ChatSessionArchiveActionWordingSettingId, getChatSessionArchiveActionPresentation, getChatSessionArchiveActionWording } from "./module-2468.mjs";
import { AUTOMATIONS_CUSTOM_VIEW_ID } from "./module-3522.mjs";
import { SyncDescriptor } from "./module-0134.mjs";
import { Action2, MenuItemAction, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { ICustomViewService } from "./module-1776.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { BaseActionViewItem } from "./module-0476.mjs";


// src/vs/sessions/contrib/sessions/browser/views/automationsView.ts
var $121 = $;

var STOP_AUTOMATION_RUN_SESSION_COMMAND_ID = "sessions.automations.stopRunSession";

var AutomationCardCanDeleteContext = new RawContextKey("sessionsAutomationCardCanDelete", false);

var AutomationCardCanDisableContext = new RawContextKey("sessionsAutomationCardCanDisable", false);

var AutomationsCardsWidget = class extends Disposable {
  constructor(automationService, sessionsManagementService, instantiationService, contextKeyService, uriIdentityService) {
    super();
    this.automationService = automationService;
    this.sessionsManagementService = sessionsManagementService;
    this.uriIdentityService = uriIdentityService;
    this.isMarkingAllRead = observableValue(this, false);
    this.element = $121(".automations-cards-widget");
    this.element.tabIndex = -1;
    const focusContext = AutomationsCustomViewFocusContext.bindTo(contextKeyService);
    const focusTracker = this._register(trackFocus(this.element));
    this._register(focusTracker.onDidFocus(() => focusContext.set(true)));
    this._register(focusTracker.onDidBlur(() => focusContext.set(false)));
    this._register(toDisposable(() => focusContext.reset()));
    const scrollContent = append(this.element, $121(".automations-cards-scroll-content"));
    this.cardsSection = this._register(instantiationService.createInstance(AutomationCardsSection, scrollContent));
    this.historySection = this._register(instantiationService.createInstance(AutomationHistorySection, scrollContent, this.element, this.isMarkingAllRead));
    this._register(autorun((reader) => {
      const items = this.automationService.automations.read(reader);
      this.cardsSection.render(items);
    }));
    const sessionDeleted = observableSignalFromEvent(this, this.sessionsManagementService.onDidDeleteSession);
    const sessionsChanged = observableSignalFromEvent(this, this.sessionsManagementService.onDidChangeSessions);
    this._register(autorun((reader) => {
      if (this.isMarkingAllRead.read(reader)) {
        return;
      }
      sessionDeleted.read(reader);
      sessionsChanged.read(reader);
      this.automationService.automations.read(reader);
      const allRuns = this.automationService.runs.read(reader);
      const sessionsByResource = new Map(this.sessionsManagementService.getSessions().map((session) => [
        this.uriIdentityService.extUri.getComparisonKey(session.resource),
        session
      ]));
      const sessions = /* @__PURE__ */ new Map();
      for (const run of allRuns) {
        if (!run.sessionResource) {
          continue;
        }
        const session = sessionsByResource.get(this.uriIdentityService.extUri.getComparisonKey(run.sessionResource));
        if (session) {
          sessions.set(run.id, session);
        }
      }
      this.historySection.render(allRuns, sessions);
    }));
  }
  layout(width2, height) {
    this.element.style.width = `${width2}px`;
    this.historySection.layout();
  }
  focus() {
    this.element.focus();
  }
};

AutomationsCardsWidget = __decorateClass([
  __decorateParam(0, IAutomationService),
  __decorateParam(1, ISessionsManagementService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IUriIdentityService)
], AutomationsCardsWidget);

var AutomationCardsSection = class extends Disposable {
  constructor(parent, automationService, automationRunner, automationDialogService, hoverService, logService, dialogService, configurationService, contextKeyService, contextMenuService) {
    super();
    this.automationService = automationService;
    this.automationRunner = automationRunner;
    this.automationDialogService = automationDialogService;
    this.hoverService = hoverService;
    this.logService = logService;
    this.dialogService = dialogService;
    this.configurationService = configurationService;
    this.contextKeyService = contextKeyService;
    this.contextMenuService = contextMenuService;
    this.persistentCards = /* @__PURE__ */ new Map();
    this.latestAutomations = /* @__PURE__ */ new Map();
    this.emptyStateDisposables = this._register(new DisposableStore());
    this.container = append(parent, $121(".automations-cards-grid"));
    this.emptyContainer = append(parent, $121(".automations-cards-empty"));
    this.emptyContainer.style.display = "none";
    this.renderEmptyState();
    this._register(toDisposable(() => {
      for (const card of this.persistentCards.values()) {
        card.disposables.dispose();
        card.element.remove();
      }
      this.persistentCards.clear();
      this.latestAutomations.clear();
    }));
  }
  render(automations) {
    const activeAutomationIds = new Set(automations.map((automation) => automation.id));
    for (const [automationId2, card] of this.persistentCards) {
      if (activeAutomationIds.has(automationId2)) {
        continue;
      }
      card.disposables.dispose();
      card.element.remove();
      this.persistentCards.delete(automationId2);
      this.latestAutomations.delete(automationId2);
    }
    let index2 = 0;
    for (const automation of automations) {
      const prev = this.latestAutomations.get(automation.id);
      this.latestAutomations.set(automation.id, automation);
      let card = this.persistentCards.get(automation.id);
      if (!card) {
        card = this.renderCard(automation);
        this.persistentCards.set(automation.id, card);
      } else if (prev !== automation) {
        this.updateCard(card, automation, prev);
      }
      const currentElement = this.container.children.item(index2);
      if (currentElement !== card.element) {
        this.container.insertBefore(card.element, currentElement);
      }
      index2++;
    }
    if (automations.length === 0) {
      this.container.style.display = "none";
      this.emptyContainer.style.display = "";
      return;
    }
    this.container.style.display = "";
    this.emptyContainer.style.display = "none";
  }
  renderCard(automation) {
    const disposables = new DisposableStore();
    const wrapper = $121(".automations-card-wrapper");
    const card = append(wrapper, $121(".automations-card"));
    card.setAttribute("role", "group");
    const cardContextKeyService = disposables.add(this.contextKeyService.createScoped(card));
    const canDeleteContext = AutomationCardCanDeleteContext.bindTo(cardContextKeyService);
    const canDisableContext = AutomationCardCanDisableContext.bindTo(cardContextKeyService);
    disposables.add(Gesture.addTarget(card));
    disposables.add(addDisposableListener(card, EventType.CONTEXT_MENU, (event) => {
      const currentAutomation = this.latestAutomations.get(automation.id);
      if (!currentAutomation) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      this.contextMenuService.showContextMenu({
        menuId: Menus.AutomationCardContext,
        menuActionOptions: { shouldForwardArgs: true, arg: currentAutomation },
        getAnchor: () => isMouseEvent(event) ? new StandardMouseEvent(getWindow(card), event) : card,
        contextKeyService: cardContextKeyService
      });
    }));
    const main2 = append(card, $121("button.automations-card-main", {
      type: "button"
    }));
    const nameRow = append(main2, $121(".automations-card-name"));
    const nameTextEl = append(nameRow, $121("span.automations-card-name-text"));
    const disabledBadge = append(nameRow, $121("span.automations-card-disabled-badge"));
    disabledBadge.textContent = localize(5476, null);
    const metaEl = append(main2, $121(".automations-card-meta"));
    const scheduleEl = append(metaEl, $121("span.automations-card-meta-item.automations-card-schedule"));
    const folderEl = append(metaEl, $121("span.automations-card-meta-item.automations-card-folder"));
    const folderHover = disposables.add(new MutableDisposable());
    const promptEl = append(main2, $121(".automations-card-prompt"));
    const actions = append(card, $121(".automations-card-actions"));
    actions.setAttribute("role", "group");
    const buttonBar = disposables.add(new ButtonBar(actions));
    const runNowLabel = localize(5490, null);
    const runningLabel = localize(5489, null);
    const runBtn = this.createIconButton(buttonBar, Codicon.play, runNowLabel, this.automationService.canRunAutomation?.(automation.id) === false);
    runBtn.element.classList.add("automations-card-run-button");
    disposables.add(runBtn.onDidClick((e4) => {
      e4?.stopPropagation();
      const currentAutomation = this.latestAutomations.get(automation.id);
      if (!currentAutomation || this.automationService.canRunAutomation?.(automation.id) === false) {
        return;
      }
      runBtn.enabled = false;
      runBtn.setAriaLabel(runningLabel);
      runBtn.setTitle(runningLabel);
      disposableTimeout(() => {
        runBtn.enabled = this.automationService.canRunAutomation?.(automation.id) !== false;
        runBtn.setAriaLabel(runNowLabel);
        runBtn.setTitle(runNowLabel);
      }, 1e4, disposables);
      void this.runNow(currentAutomation);
    }));
    const deleteBtn = this.createIconButton(buttonBar, Codicon.trash, localize(5473, null), this.automationService.canDeleteAutomation?.(automation.id) === false);
    disposables.add(deleteBtn.onDidClick(() => {
      const currentAutomation = this.latestAutomations.get(automation.id);
      if (!currentAutomation || this.automationService.canDeleteAutomation?.(automation.id) === false) {
        return;
      }
      void this.confirmDelete(currentAutomation);
    }));
    for (const eventType of [EventType.CLICK, EventType2.Tap]) {
      disposables.add(addDisposableListener(card, eventType, (event) => {
        const target = event.initialTarget ?? event.target;
        if (target instanceof Node && isAncestor(target, actions)) {
          return;
        }
        const currentAutomation = this.latestAutomations.get(automation.id);
        if (!currentAutomation || this.automationService.canUpdateAutomation?.(automation.id) === false) {
          return;
        }
        void this.openEditDialog(currentAutomation);
      }));
    }
    const entry = {
      element: wrapper,
      card,
      main: main2,
      actions,
      runButton: runBtn,
      deleteButton: deleteBtn,
      canDeleteContext,
      canDisableContext,
      nameText: nameTextEl,
      scheduleEl,
      folderEl,
      folderHover,
      promptEl,
      disabledBadge,
      disposables
    };
    this.updateCard(entry, automation);
    return entry;
  }
  updateCard(card, automation, previous) {
    card.main.disabled = this.automationService.canUpdateAutomation?.(automation.id) === false;
    card.runButton.enabled = this.automationService.canRunAutomation?.(automation.id) !== false;
    card.deleteButton.enabled = this.automationService.canDeleteAutomation?.(automation.id) !== false;
    card.canDeleteContext.set(this.automationService.canDeleteAutomation?.(automation.id) !== false);
    card.canDisableContext.set(automation.enabled && this.automationService.canUpdateAutomation?.(automation.id) !== false);
    const schedule = formatSchedule3(automation);
    const scheduleChanged = !previous || formatSchedule3(previous) !== schedule;
    const nameChanged = !previous || previous.name !== automation.name;
    if (nameChanged || scheduleChanged) {
      card.card.setAttribute("aria-label", localize(5435, null, automation.name, schedule));
    }
    if (nameChanged) {
      card.main.setAttribute("aria-label", localize(5478, null, automation.name));
      card.actions.setAttribute("aria-label", localize(5433, null, automation.name));
      card.nameText.textContent = automation.name;
    }
    if (!previous || previous.enabled !== automation.enabled) {
      card.disabledBadge.style.display = automation.enabled ? "none" : "";
    }
    if (scheduleChanged) {
      card.scheduleEl.textContent = schedule;
    }
    const folderLabel = getAutomationTargetLabel(automation.target);
    if (!previous || getAutomationTargetLabel(previous.target) !== folderLabel) {
      card.folderEl.textContent = folderLabel;
      card.folderHover.value = this.hoverService.setupManagedHover(getDefaultHoverDelegate("element"), card.folderEl, folderLabel);
    }
    if (!previous || previous.prompt !== automation.prompt) {
      const maxLength = 120;
      card.promptEl.textContent = automation.prompt.length > maxLength ? automation.prompt.slice(0, maxLength) + "\u2026" : automation.prompt;
    }
  }
  createIconButton(buttonBar, icon2, tooltip, disabled) {
    const button = buttonBar.addButton({
      ariaLabel: tooltip,
      disabled,
      supportIcons: true,
      title: tooltip
    });
    button.label = `$(${icon2.id})`;
    button.element.classList.add("automations-card-action-button");
    return button;
  }
  async runNow(automation) {
    if (!await this.ensureEnabled()) {
      return;
    }
    try {
      const operation = this.automationRunner.runOnce(automation, "manual", 0, CancellationToken.None);
      const dispatch = await operation.whenDispatched;
      switch (dispatch.kind) {
        case "started":
          status(localize(5465, null, automation.name));
          break;
        case "alreadyRunning":
          status(localize(5434, null, automation.name));
          break;
        case "notStarted":
          status(localize(5451, null, automation.name));
          break;
      }
      await operation.whenCompleted;
    } catch (error) {
      this.logService.error("[AutomationsCards] Failed to run automation", error);
      await this.dialogService.error(
        localize(5452, null),
        getErrorMessage2(error)
      );
    }
  }
  renderEmptyState() {
    const title = append(this.emptyContainer, $121("h3.automations-cards-empty-title"));
    title.textContent = localize(5486, null);
    const desc = append(this.emptyContainer, $121("p.automations-cards-empty-description"));
    desc.textContent = localize(5485, null);
    const createButton = this.emptyStateDisposables.add(new Button(this.emptyContainer, {
      ...defaultButtonStyles,
      title: localize(5471, null)
    }));
    createButton.label = localize(5471, null);
    createButton.element.classList.add("automations-cards-create-button");
    this.emptyStateDisposables.add(createButton.onDidClick(() => this.openCreateDialog()));
  }
  async openCreateDialog() {
    if (!await this.ensureEnabled()) {
      return;
    }
    const result = await this.automationDialogService.showAutomationDialog({});
    if (!result || result.kind !== "create") {
      return;
    }
    if (!await this.ensureEnabled()) {
      return;
    }
    try {
      const created = await this.automationService.createAutomation(result.value, () => this.throwIfDisabled());
      status(localize(5439, null, created.name));
    } catch (err) {
      this.logService.error("[AutomationsCards] Failed to create automation", err);
      await this.dialogService.error(
        localize(5440, null),
        getErrorMessage2(err)
      );
    }
  }
  async openEditDialog(automation) {
    if (!await this.ensureEnabled()) {
      return;
    }
    try {
      const result = await this.automationDialogService.showAutomationDialog({ existing: automation });
      if (!result || result.kind !== "update") {
        return;
      }
      if (!await this.ensureEnabled()) {
        return;
      }
      const updateResult = await this.automationService.updateAutomationIfUnchanged(result.id, result.value, automation, () => this.throwIfDisabled());
      if (updateResult.kind === "conflict") {
        throw new Error(updateResult.current ? localize(5437, null) : localize(5442, null));
      }
      status(localize(5467, null, automation.name));
    } catch (err) {
      this.logService.error("[AutomationsCards] Failed to update automation", err);
      await this.dialogService.error(
        localize(5468, null),
        getErrorMessage2(err)
      );
    }
  }
  async confirmDelete(automation) {
    await confirmAndDeleteAutomation(automation, this.automationService, this.configurationService, this.dialogService, this.logService);
  }
  isEnabled() {
    return this.configurationService.getValue(CHAT_AUTOMATIONS_ENABLED_SETTING) === true;
  }
  async ensureEnabled() {
    if (this.isEnabled()) {
      return true;
    }
    await showAutomationsDisabled(this.dialogService);
    return false;
  }
  throwIfDisabled() {
    if (!this.isEnabled()) {
      throw new Error(localize(5462, null));
    }
  }
};

AutomationCardsSection = __decorateClass([
  __decorateParam(1, IAutomationService),
  __decorateParam(2, IAutomationRunner),
  __decorateParam(3, IAutomationDialogService),
  __decorateParam(4, IHoverService),
  __decorateParam(5, ILogService),
  __decorateParam(6, IDialogService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IContextKeyService),
  __decorateParam(9, IContextMenuService)
], AutomationCardsSection);

var AutomationHistorySection = class extends Disposable {
  constructor(parent, focusFallback, isMarkingAllRead, automationService, sessionsService, sessionsManagementService, logService, dialogService, instantiationService) {
    super();
    this.focusFallback = focusFallback;
    this.isMarkingAllRead = isMarkingAllRead;
    this.automationService = automationService;
    this.sessionsService = sessionsService;
    this.sessionsManagementService = sessionsManagementService;
    this.logService = logService;
    this.dialogService = dialogService;
    this.instantiationService = instantiationService;
    this.headerDisposables = this._register(new DisposableStore());
    this.persistentGroups = /* @__PURE__ */ new Map();
    this.runFocusTargets = /* @__PURE__ */ new Map();
    this.renderedFocusableRunIds = [];
    this.shouldRestoreFocus = false;
    this.currentRuns = observableValue(this, []);
    this.currentSessions = observableValue(this, /* @__PURE__ */ new Map());
    this.container = append(parent, $121(".automations-history"));
    this.groupsContainer = append(this.container, $121(".automations-history-groups"));
    this.approvalModel = this._register(this.instantiationService.createInstance(AgentSessionApprovalModel));
  }
  dispose() {
    this.disposeAllGroups();
    super.dispose();
  }
  render(runs, sessions) {
    const sessionRuns = runs.filter((run) => sessions.has(run.id));
    const visibleRuns = runs.filter(
      (run) => sessions.has(run.id) || isTemporaryAutomationRun(run) || !!run.sessionResource && !!this.sessionsManagementService.getSession(run.sessionResource)
    );
    transaction((tx) => {
      this.currentRuns.set(sessionRuns, tx);
      this.currentSessions.set(sessions, tx);
    });
    this.runFocusTargets.clear();
    this.renderedFocusableRunIds = [];
    if (visibleRuns.length === 0) {
      this.container.style.display = "none";
      this.disposeAllGroups();
      this.restoreFocusAfterRender();
      return;
    }
    this.container.style.display = "";
    this.ensureHeader();
    const groups = groupRunsByDate(visibleRuns);
    const activeKeys = new Set(groups.map((group2) => group2.key));
    for (const [key3, entry] of this.persistentGroups) {
      if (!activeKeys.has(key3)) {
        entry.disposables.dispose();
        entry.element.remove();
        this.persistentGroups.delete(key3);
      }
    }
    let index2 = 0;
    for (const group2 of groups) {
      const sessionItems = this.resolveSessionItems(group2.runs, sessions);
      const temporaryRuns = group2.runs.filter((run) => !sessions.has(run.id));
      let entry = this.persistentGroups.get(group2.key);
      if (entry) {
        if (entry.header.textContent !== group2.label) {
          entry.header.textContent = group2.label;
        }
        this.updateTemporaryRuns(entry, temporaryRuns);
        this.updateGroupSessions(entry, sessionItems);
      } else {
        entry = this.createGroup(group2.key, group2.label, temporaryRuns, sessionItems);
      }
      const currentElement = this.groupsContainer.children.item(index2);
      if (currentElement !== entry.element) {
        this.groupsContainer.insertBefore(entry.element, currentElement);
        if (entry.list) {
          this.layoutSessionList(entry.listContainer, entry.list);
        }
      }
      index2++;
      for (const item of sessionItems) {
        if (!entry.list) {
          continue;
        }
        this.renderedFocusableRunIds.push(item.run.id);
        this.runFocusTargets.set(item.run.id, { list: entry.list, session: item.session });
      }
    }
    this.restoreFocusAfterRender();
  }
  layout() {
    for (const entry of this.persistentGroups.values()) {
      if (entry.list) {
        this.layoutSessionList(entry.listContainer, entry.list);
      }
    }
  }
  ensureHeader() {
    if (this.headerRow) {
      return;
    }
    this.headerDisposables.clear();
    this.headerRow = $(".automations-history-header");
    this.container.insertBefore(this.headerRow, this.groupsContainer);
    const headerLabel = append(this.headerRow, $121("span"));
    headerLabel.textContent = localize(5479, null);
    this.markAllButton = this.headerDisposables.add(new Button(this.headerRow, {
      ...defaultButtonStyles,
      secondary: true,
      title: localize(5481, null)
    }));
    this.markAllButton.label = localize(5481, null);
    this.markAllButton.element.classList.add("automations-mark-all-read");
    this.headerDisposables.add(this.markAllButton.onDidClick(() => {
      void this.markAllRunsRead(this.currentRuns.get());
    }));
    this.headerDisposables.add(autorun((reader) => {
      const runs = this.currentRuns.read(reader);
      const sessions = this.currentSessions.read(reader);
      const isMarkingAllRead = this.isMarkingAllRead.read(reader);
      const hasUnread = runs.some((run) => isUnreadAutomationRun(run, sessions.get(run.id), reader));
      this.markAllButton.element.style.display = hasUnread ? "" : "none";
      this.markAllButton.enabled = hasUnread && !isMarkingAllRead;
    }));
  }
  resolveSessionItems(runs, sessions) {
    const items = [];
    for (const run of runs) {
      const session = sessions.get(run.id);
      if (session) {
        items.push({ run, session });
      }
    }
    return items;
  }
  createGroup(key3, label3, temporaryRuns, items) {
    const disposables = new DisposableStore();
    const element = $121(".automations-history-group");
    const header2 = append(element, $121(".automations-history-group-header"));
    header2.textContent = label3;
    const runsContainer = append(element, $121(".automations-history-group-runs"));
    const temporaryRowsContainer = append(runsContainer, $121(".automations-temporary-runs"));
    const listContainer = append(runsContainer, $121(".automations-run-session-list"));
    const runsBySession = /* @__PURE__ */ new Map();
    const entry = {
      element,
      header: header2,
      temporaryRowsContainer,
      temporaryRows: disposables.add(new DisposableMap()),
      listContainer,
      listDisposables: disposables.add(new MutableDisposable()),
      list: void 0,
      runsBySession,
      sessions: [],
      disposables
    };
    this.persistentGroups.set(key3, entry);
    this.updateTemporaryRuns(entry, temporaryRuns);
    this.updateGroupSessions(entry, items);
    return entry;
  }
  ensureGroupList(entry) {
    if (entry.list) {
      return entry.list;
    }
    const disposables = new DisposableStore();
    const list2 = disposables.add(this.instantiationService.createInstance(SessionsFlatList, entry.listContainer, {
      showSessionHover: false,
      alwaysConsumeMouseWheel: false,
      useCompactQuickChatRows: false,
      toolbarMenuId: Menus.AutomationsHistoryItem,
      contextMenuId: Menus.AutomationsHistoryItemContext,
      markSessionReadOnOpen: false,
      approvalModel: this.approvalModel,
      onSessionOpen: (resource) => void this.openRunSession(resource),
      onToolbarAction: (action, session) => this.handleSessionAction(action, session, entry.runsBySession),
      onContextMenuAction: (action, session) => this.handleSessionAction(action, session, entry.runsBySession)
    }));
    disposables.add(list2.onDidChangeContentHeight(() => this.layoutSessionList(entry.listContainer, list2)));
    entry.list = list2;
    entry.listDisposables.value = disposables;
    return list2;
  }
  updateTemporaryRuns(entry, runs) {
    const activeRunIds = new Set(runs.map((run) => run.id));
    for (const runId of entry.temporaryRows.keys()) {
      if (!activeRunIds.has(runId)) {
        entry.temporaryRows.deleteAndDispose(runId);
      }
    }
    let index2 = 0;
    for (const run of runs) {
      const title = this.getAutomationName(run);
      let row = entry.temporaryRows.get(run.id);
      if (!row) {
        row = this.createTemporaryRunRow(title);
        entry.temporaryRows.set(run.id, row);
      } else if (row.title.textContent !== title) {
        row.title.textContent = title;
        row.element.setAttribute("aria-label", localize(5457, null, title));
      }
      const currentElement = entry.temporaryRowsContainer.children.item(index2);
      if (currentElement !== row.element) {
        entry.temporaryRowsContainer.insertBefore(row.element, currentElement);
      }
      index2++;
    }
  }
  createTemporaryRunRow(title) {
    const disposables = new DisposableStore();
    const element = $121(".automations-temporary-run.session-item");
    element.setAttribute("role", "group");
    element.setAttribute("aria-label", localize(5457, null, title));
    const icon2 = append(element, $121(".session-icon"));
    const statusIcon = disposables.add(this.instantiationService.createInstance(SessionStatusIcon, icon2));
    statusIcon.setStatus(1 /* InProgress */, true, false);
    const main2 = append(element, $121(".session-main"));
    const titleRow = append(main2, $121(".session-title-row"));
    const titleElement = append(titleRow, $121("span.session-title"));
    titleElement.textContent = title;
    const detailsRow = append(main2, $121(".session-details-row"));
    append(detailsRow, $121("span.session-description")).textContent = localize(5456, null);
    return {
      element,
      title: titleElement,
      dispose: () => {
        disposables.dispose();
        element.remove();
      }
    };
  }
  updateGroupSessions(entry, items) {
    entry.runsBySession.clear();
    for (const item of items) {
      entry.runsBySession.set(item.session.resource.toString(), item.run);
    }
    const sessions = items.map((item) => item.session);
    if (entry.sessions.length === sessions.length && entry.sessions.every((session, index2) => session === sessions[index2])) {
      return;
    }
    entry.sessions = sessions;
    if (sessions.length === 0) {
      entry.list = void 0;
      entry.listDisposables.clear();
      clearNode(entry.listContainer);
      entry.listContainer.style.height = "";
      return;
    }
    const list2 = this.ensureGroupList(entry);
    list2.setSessions(sessions);
    this.layoutSessionList(entry.listContainer, list2);
  }
  disposeAllGroups() {
    for (const [key3, entry] of this.persistentGroups) {
      entry.disposables.dispose();
      entry.element.remove();
      this.persistentGroups.delete(key3);
    }
    if (this.headerRow) {
      this.headerRow.remove();
      this.headerRow = void 0;
      this.markAllButton = void 0;
      this.headerDisposables.clear();
    }
  }
  layoutSessionList(container2, list2) {
    const height = list2.getContentHeight();
    const width2 = container2.clientWidth;
    container2.style.height = `${height}px`;
    list2.layout(height, width2);
  }
  async handleSessionAction(action, session, runsBySession) {
    const run = runsBySession.get(session.resource.toString());
    if (!run) {
      return false;
    }
    switch (action.id) {
      case STOP_AUTOMATION_RUN_SESSION_COMMAND_ID:
        action.enabled = false;
        await this.stopRunSession(session, this.getAutomationName(run), action);
        return true;
      case ARCHIVE_SESSION_COMMAND_ID:
        await this.sessionsManagementService.archiveSession(session);
        return true;
      default:
        return false;
    }
  }
  getAutomationName(run) {
    return this.automationService.automations.get().find((automation) => automation.id === run.automationId)?.name ?? localize(5497, null);
  }
  async openRunSession(resource) {
    if (!this.sessionsManagementService.getSession(resource)) {
      return;
    }
    try {
      await this.sessionsService.openSession(resource, { preserveFocus: false, source: "automation" });
    } catch (error) {
      this.logService.error("[AutomationsCards] Failed to open automation run", error);
      await this.dialogService.error(
        localize(5453, null),
        getErrorMessage2(error)
      );
    }
  }
  async stopRunSession(session, automationName, action) {
    try {
      await this.sessionsManagementService.cancelCurrentRequest(session);
      status(localize(5455, null, automationName));
    } catch (error) {
      action.enabled = true;
      this.logService.error("[AutomationsCards] Failed to stop automation run session", error);
      await this.dialogService.error(
        localize(5454, null),
        getErrorMessage2(error)
      );
    }
  }
  restoreFocusAfterRender() {
    if (!this.shouldRestoreFocus) {
      return;
    }
    const target = this.pendingFocusRunId ? this.runFocusTargets.get(this.pendingFocusRunId) : void 0;
    this.clearPendingFocus();
    if (target) {
      target.list.focusSession(target.session);
    } else {
      this.focusFallback.focus();
    }
  }
  clearPendingFocus() {
    this.pendingFocusRunId = void 0;
    this.shouldRestoreFocus = false;
  }
  async markAllRunsRead(runs) {
    this.isMarkingAllRead.set(true, void 0);
    const sessions = /* @__PURE__ */ new Map();
    try {
      for (const run of runs) {
        if ((run.status === "completed" || run.status === "failed") && run.sessionResource) {
          const session = this.sessionsManagementService.getSession(run.sessionResource);
          if (session && !session.isRead.get()) {
            sessions.set(session.resource.toString(), session);
          }
        }
      }
      await this.sessionsManagementService.markAllRead([...sessions.values()]);
    } catch (error) {
      this.logService.error("[AutomationsCards] Failed to mark automation runs read", error);
      await this.dialogService.error(
        localize(5450, null),
        getErrorMessage2(error)
      );
    } finally {
      this.isMarkingAllRead.set(false, void 0);
    }
  }
};

AutomationHistorySection = __decorateClass([
  __decorateParam(3, IAutomationService),
  __decorateParam(4, ISessionsService),
  __decorateParam(5, ISessionsManagementService),
  __decorateParam(6, ILogService),
  __decorateParam(7, IDialogService),
  __decorateParam(8, IInstantiationService)
], AutomationHistorySection);

function isUnreadAutomationRun(run, session, reader) {
  return (run.status === "completed" || run.status === "failed") && !!session && !session.isRead.read(reader);
}

function isTemporaryAutomationRun(run) {
  return run.status === "pending" || run.status === "running";
}

function formatSchedule3(automation) {
  const { interval, scheduleHour, scheduleMinute } = automation.schedule;
  const time = formatHourMinute2(scheduleHour, scheduleMinute);
  switch (interval) {
    case "hourly":
      return localize(5492, null);
    case "daily":
      return localize(5491, null, time);
    case "weekly": {
      const day2 = DAYS_OF_WEEK[(automation.schedule.scheduleDay % 7 + 7) % 7];
      return localize(5494, null, day2, time);
    }
    case "manual":
      return localize(5493, null);
    default:
      return localize(5493, null);
  }
}

function formatHourMinute2(hour2, minute2) {
  const date = new Date(Date.UTC(2e3, 0, 1, Math.max(0, Math.min(23, hour2 | 0)), Math.max(0, Math.min(59, minute2 | 0))));
  return date.toLocaleTimeString(void 0, { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
}

function getAutomationTargetLabel(target) {
  return target.kind === "workspace" ? basename2(target.folderUri) : localize(5487, null);
}

function groupRunsByDate(runs) {
  const now = /* @__PURE__ */ new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeekStart = new Date(today);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const groups = /* @__PURE__ */ new Map();
  for (const run of runs) {
    const t2 = Date.parse(run.startedAt);
    if (Number.isNaN(t2)) {
      continue;
    }
    const date = new Date(t2);
    const { key: key3, label: label3, order } = getDateBucket(date, today, yesterday, lastWeekStart);
    let group2 = groups.get(key3);
    if (!group2) {
      group2 = { key: key3, label: label3, order, runs: [] };
      groups.set(key3, group2);
    }
    group2.runs.push(run);
  }
  return [...groups.values()].sort((a, b) => a.order - b.order);
}

function getDateBucket(date, today, yesterday, lastWeekStart) {
  if (date >= today) {
    return { key: "today", label: localize(5496, null), order: 0 };
  }
  if (date >= yesterday) {
    return { key: "yesterday", label: localize(5498, null), order: 1 };
  }
  if (date >= lastWeekStart) {
    return { key: "week", label: localize(5480, null), order: 2 };
  }
  const monthLabel = date.toLocaleDateString(void 0, { month: "long", year: "numeric" });
  const monthIndex = date.getFullYear() * 12 + date.getMonth();
  const order = 3e4 - monthIndex;
  return { key: `month-${date.getFullYear()}-${date.getMonth()}`, label: monthLabel, order };
}

function getErrorMessage2(error) {
  return error instanceof Error ? error.message : String(error);
}

async function showAutomationsDisabled(dialogService) {
  await dialogService.info(
    localize(5464, null),
    localize(5463, null, CHAT_AUTOMATIONS_ENABLED_SETTING)
  );
}

async function confirmAndDeleteAutomation(automation, automationService, configurationService, dialogService, logService) {
  if (automationService.canDeleteAutomation?.(automation.id) === false) {
    return;
  }
  const isEnabled = () => configurationService.getValue(CHAT_AUTOMATIONS_ENABLED_SETTING) === true;
  if (!isEnabled()) {
    await showAutomationsDisabled(dialogService);
    return;
  }
  const confirmed = await dialogService.confirm({
    message: localize(5469, null, automation.name),
    detail: localize(5470, null),
    primaryButton: localize(5472, null)
  });
  if (!confirmed.confirmed) {
    return;
  }
  if (!isEnabled()) {
    await showAutomationsDisabled(dialogService);
    return;
  }
  try {
    await automationService.deleteAutomation(automation.id, () => {
      if (!isEnabled()) {
        throw new Error(localize(5459, null));
      }
    });
    status(localize(5443, null, automation.name));
  } catch (error) {
    logService.error("[AutomationsCards] Failed to delete automation", error);
    await dialogService.error(
      localize(5444, null),
      getErrorMessage2(error)
    );
  }
}

var AutomationsCustomView = class extends AbstractCustomView {
  constructor(instantiationService) {
    super();
    this.instantiationService = instantiationService;
    this.title = constObservable(localize(5466, null));
    this.description = constObservable(
      localize(5458, null)
    );
  }
  render(container2) {
    container2.classList.add("automations-cards-content");
    this._widget = this._register(this.instantiationService.createInstance(AutomationsCardsWidget));
    container2.appendChild(this._widget.element);
  }
  layout(width2, height) {
    this._widget?.layout(width2, height);
  }
  focus() {
    this._widget?.focus();
  }
};

AutomationsCustomView = __decorateClass([
  __decorateParam(0, IInstantiationService)
], AutomationsCustomView);

var AutomationsCustomViewContribution = class extends Disposable {
  constructor(customViewService, actionViewItemService, contextKeyService, automationService, configurationService) {
    super();
    this.historyItemActions = this._register(new MutableDisposable());
    const registerHistoryItemActions = () => {
      this.historyItemActions.value = registerAutomationHistoryItemActions(getChatSessionArchiveActionWording(configurationService));
    };
    registerHistoryItemActions();
    this._register(configurationService.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(ChatSessionArchiveActionWordingSettingId)) {
        registerHistoryItemActions();
      }
    }));
    const hasItemsContext = AutomationsHasItemsContext.bindTo(contextKeyService);
    this._register(autorun((reader) => {
      hasItemsContext.set(automationService.automations.read(reader).length > 0);
    }));
    this._register(customViewService.registerCustomView({
      id: AUTOMATIONS_CUSTOM_VIEW_ID,
      ctor: new SyncDescriptor(AutomationsCustomView),
      actions: { style: "buttonBar", menuId: Menus.CustomViewAutomations }
    }, {
      restore: contextKeyService.getContextKeyValue(ChatAutomationsEnabledContext.key) === true
    }));
    const automationContextKeys = /* @__PURE__ */ new Set([ChatAutomationsEnabledContext.key]);
    this._register(contextKeyService.onDidChangeContext((event) => {
      if (event.affectsSome(automationContextKeys) && !contextKeyService.getContextKeyValue(ChatAutomationsEnabledContext.key) && customViewService.activeCustomView.get()?.id === AUTOMATIONS_CUSTOM_VIEW_ID) {
        customViewService.hideCustomView();
      }
    }));
    this._register(actionViewItemService.register(Menus.CustomViewAutomations, "sessionsView.newAutomation", (action, options3, instantiationService) => {
      if (!(action instanceof MenuItemAction)) {
        return void 0;
      }
      return instantiationService.createInstance(PrimaryButtonActionViewItem, void 0, action, options3);
    }));
  }
  static {
    this.ID = "sessions.contrib.automationsCustomView";
  }
};

AutomationsCustomViewContribution = __decorateClass([
  __decorateParam(0, ICustomViewService),
  __decorateParam(1, IActionViewItemService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IAutomationService),
  __decorateParam(4, IConfigurationService)
], AutomationsCustomViewContribution);

function registerAutomationHistoryItemActions(archiveWording) {
  const archivePresentation = getChatSessionArchiveActionPresentation(archiveWording);
  return combinedDisposable(
    MenuRegistry.appendMenuItem(Menus.AutomationsHistoryItem, {
      command: {
        id: STOP_AUTOMATION_RUN_SESSION_COMMAND_ID,
        title: localize(5495, null),
        icon: Codicon.stopCircle
      },
      group: "navigation",
      order: 1,
      when: ContextKeyExpr.or(
        SessionItemStatusContext.isEqualTo(1 /* InProgress */),
        SessionItemStatusContext.isEqualTo(2 /* NeedsInput */)
      )
    }),
    MenuRegistry.appendMenuItem(Menus.AutomationsHistoryItemContext, {
      command: {
        id: MARK_SESSION_READ_COMMAND_ID,
        title: localize(5482, null)
      },
      group: "0_read",
      order: 1,
      when: ContextKeyExpr.and(SessionIsReadContext.negate(), SessionIsArchivedContext.negate())
    }),
    MenuRegistry.appendMenuItem(Menus.AutomationsHistoryItemContext, {
      command: {
        id: MARK_SESSION_UNREAD_COMMAND_ID,
        title: localize(5483, null)
      },
      group: "0_read",
      order: 1,
      when: ContextKeyExpr.and(SessionIsReadContext, SessionIsArchivedContext.negate())
    }),
    MenuRegistry.appendMenuItem(Menus.AutomationsHistoryItemContext, {
      command: {
        id: RENAME_SESSION_COMMAND_ID,
        title: localize(5488, null)
      },
      group: "1_edit",
      order: 1,
      when: SessionSupportsRenameContext
    }),
    MenuRegistry.appendMenuItem(Menus.AutomationsHistoryItemContext, {
      command: {
        id: ARCHIVE_SESSION_COMMAND_ID,
        title: archivePresentation.archive.title
      },
      group: "1_edit",
      order: 2,
      when: SessionIsArchivedContext.negate()
    }),
    MenuRegistry.appendMenuItem(Menus.AutomationsHistoryItemContext, {
      command: {
        id: UNARCHIVE_SESSION_COMMAND_ID,
        title: archivePresentation.unarchive.title
      },
      group: "1_edit",
      order: 2,
      when: SessionIsArchivedContext
    })
  );
}

var PrimaryButtonActionViewItem = class extends BaseActionViewItem {
  constructor(context2, action, options3) {
    super(context2, action, options3);
  }
  render(container2) {
    this.element = container2;
    container2.classList.add("chat-pill-item");
    const button = this.button = this._register(new Button(container2, { secondary: false, ...defaultButtonStyles }));
    button.element.classList.add("monaco-text-button", "chat-pill-button");
    this._register(button.onDidClick(() => {
      if (this._action.enabled) {
        this.actionRunner.run(this._action, this._context);
      }
    }));
    this.updateLabel();
    this.updateEnabled();
  }
  // Focus must restore the tab stop that `blur` removed, otherwise arrow
  // navigation can leave the containing toolbar with no tabbable item.
  focus() {
    if (this.button) {
      this.button.element.tabIndex = 0;
      this.button.focus();
    }
  }
  blur() {
    if (this.button) {
      this.button.element.tabIndex = -1;
      this.button.element.blur();
    }
  }
  setFocusable(focusable) {
    if (this.button) {
      this.button.element.tabIndex = focusable ? 0 : -1;
    }
  }
  updateEnabled() {
    if (this.button) {
      this.button.enabled = this._action.enabled;
    }
  }
  updateLabel() {
    if (!this.button) {
      return;
    }
    reset(this.button.element, this._action.label);
  }
};

registerAction2(class NewAutomationAction extends Action2 {
  constructor() {
    super({
      id: "sessionsView.newAutomation",
      title: localize2(5484, "New Automation"),
      precondition: ChatAutomationsEnabledContext,
      menu: [{ id: Menus.CustomViewAutomations, group: "navigation", order: 1, when: ContextKeyExpr.and(ChatAutomationsEnabledContext, AutomationsHasItemsContext) }]
    });
  }
  async run(accessor) {
    const automationDialogService = accessor.get(IAutomationDialogService);
    const automationService = accessor.get(IAutomationService);
    const configurationService = accessor.get(IConfigurationService);
    const dialogService = accessor.get(IDialogService);
    const logService = accessor.get(ILogService);
    const isEnabled = () => configurationService.getValue(CHAT_AUTOMATIONS_ENABLED_SETTING) === true;
    if (!isEnabled()) {
      await showAutomationsDisabled(dialogService);
      return;
    }
    const result = await automationDialogService.showAutomationDialog({});
    if (!result || result.kind !== "create") {
      return;
    }
    if (!isEnabled()) {
      await showAutomationsDisabled(dialogService);
      return;
    }
    try {
      await automationService.createAutomation(result.value, () => {
        if (!isEnabled()) {
          throw new Error(localize(5462, null));
        }
      });
    } catch (err) {
      logService.error("[Automations] Failed to create automation", err);
      await dialogService.error(
        localize(5440, null),
        getErrorMessage2(err)
      );
    }
  }
});

registerAction2(class DuplicateAutomationAction extends Action2 {
  constructor() {
    super({
      id: "sessions.automations.duplicate",
      title: localize2(5477, "Duplicate"),
      precondition: ChatAutomationsEnabledContext,
      menu: [{ id: Menus.AutomationCardContext, group: "navigation", order: 1, when: ChatAutomationsEnabledContext }]
    });
  }
  async run(accessor, automation) {
    const automationDialogService = accessor.get(IAutomationDialogService);
    const automationService = accessor.get(IAutomationService);
    const configurationService = accessor.get(IConfigurationService);
    const dialogService = accessor.get(IDialogService);
    const logService = accessor.get(ILogService);
    const isEnabled = () => configurationService.getValue(CHAT_AUTOMATIONS_ENABLED_SETTING) === true;
    if (!isEnabled()) {
      await showAutomationsDisabled(dialogService);
      return;
    }
    try {
      const name = getDuplicateAutomationName(automation.name, automationService.automations.get());
      const result = await automationDialogService.showAutomationDialog({
        initialValues: {
          name,
          prompt: automation.prompt,
          schedule: automation.schedule,
          target: automation.target,
          modelId: automation.modelId,
          mode: automation.mode,
          permissionLevel: automation.permissionLevel,
          enabled: automation.enabled
        }
      });
      if (!result || result.kind !== "create") {
        return;
      }
      if (!isEnabled()) {
        await showAutomationsDisabled(dialogService);
        return;
      }
      const duplicate = await automationService.createAutomation(result.value, () => {
        if (!isEnabled()) {
          throw new Error(localize(5461, null));
        }
      });
      status(localize(5447, null, duplicate.name));
    } catch (error) {
      logService.error("[Automations] Failed to duplicate automation", error);
      await dialogService.error(
        localize(5448, null),
        getErrorMessage2(error)
      );
    }
  }
});

registerAction2(class DeleteAutomationAction extends Action2 {
  constructor() {
    super({
      id: "sessions.automations.delete",
      title: localize2(5474, "Delete"),
      precondition: ContextKeyExpr.and(ChatAutomationsEnabledContext, AutomationCardCanDeleteContext),
      menu: [{ id: Menus.AutomationCardContext, group: "navigation", order: 3, when: ChatAutomationsEnabledContext }]
    });
  }
  async run(accessor, automation) {
    await confirmAndDeleteAutomation(
      automation,
      accessor.get(IAutomationService),
      accessor.get(IConfigurationService),
      accessor.get(IDialogService),
      accessor.get(ILogService)
    );
  }
});

registerAction2(class DisableAutomationAction extends Action2 {
  constructor() {
    super({
      id: "sessions.automations.disable",
      title: localize2(5475, "Disable"),
      precondition: ContextKeyExpr.and(ChatAutomationsEnabledContext, AutomationCardCanDisableContext),
      menu: [{ id: Menus.AutomationCardContext, group: "navigation", order: 2, when: ChatAutomationsEnabledContext }]
    });
  }
  async run(accessor, automation) {
    const automationService = accessor.get(IAutomationService);
    if (!automation.enabled || automationService.canUpdateAutomation?.(automation.id) === false) {
      return;
    }
    const configurationService = accessor.get(IConfigurationService);
    const dialogService = accessor.get(IDialogService);
    const logService = accessor.get(ILogService);
    const isEnabled = () => configurationService.getValue(CHAT_AUTOMATIONS_ENABLED_SETTING) === true;
    if (!isEnabled()) {
      await showAutomationsDisabled(dialogService);
      return;
    }
    try {
      const result = await automationService.updateAutomationIfUnchanged(automation.id, { enabled: false }, automation, () => {
        if (!isEnabled()) {
          throw new Error(localize(5460, null));
        }
      });
      if (result.kind === "conflict") {
        throw new Error(result.current ? localize(5436, null) : localize(5441, null));
      }
      status(localize(5445, null, automation.name));
    } catch (error) {
      logService.error("[Automations] Failed to disable automation", error);
      await dialogService.error(
        localize(5446, null),
        getErrorMessage2(error)
      );
    }
  }
});

function getDuplicateAutomationName(name, automations) {
  const existingNames = new Set(automations.map((automation) => automation.name));
  const copyName = localize(5438, null, name);
  if (!existingNames.has(copyName)) {
    return copyName;
  }
  for (let index2 = 2; ; index2++) {
    const indexedCopyName = localize(5449, null, name, index2);
    if (!existingNames.has(indexedCopyName)) {
      return indexedCopyName;
    }
  }
}
export { isUnreadAutomationRun, isTemporaryAutomationRun, formatSchedule3, formatHourMinute2, getAutomationTargetLabel, groupRunsByDate, getDateBucket, getErrorMessage2, showAutomationsDisabled, confirmAndDeleteAutomation, registerAutomationHistoryItemActions, getDuplicateAutomationName, $121, STOP_AUTOMATION_RUN_SESSION_COMMAND_ID, AutomationCardCanDeleteContext, AutomationCardCanDisableContext, AutomationsCardsWidget, AutomationCardsSection, AutomationHistorySection, AutomationsCustomView, AutomationsCustomViewContribution, PrimaryButtonActionViewItem };
