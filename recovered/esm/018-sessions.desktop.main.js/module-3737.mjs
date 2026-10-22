// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/changes/browser/changesView.ts
import { $, append, clearNode, reset, setVisibility } from "./module-0075.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { SessionAgentMergeEnabledContext, SessionIsActiveContext, SinglePaneLayoutEnabledContext } from "./module-1770.mjs";
import { ActiveEditorContext } from "./module-0950.mjs";
import { SessionChangesEditorInput } from "./module-3586.mjs";
import { ChatPetAchievementIds } from "./module-2111.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { derivedObservableWithCache } from "./module-0059.mjs";
import { observableValue } from "./module-0048.mjs";
import { observableFromEvent } from "./module-0057.mjs";
import { autorun } from "./module-0052.mjs";
import { MenuWorkbenchButtonBar, WorkbenchButtonBar } from "./module-1988.mjs";
import { Action2, IMenuService, MenuId, MenuItemAction, SubmenuItemAction, registerAction2 } from "./module-0092.mjs";
import { derived } from "./module-0054.mjs";
import { AGENT_HOST_SKILL_BUTTON_UPDATE_PR_ID, isAgentHostSkillButtonId } from "./module-3733.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IChangesViewService } from "./module-3645.mjs";
import { IContextMenuService } from "./module-0488.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IHoverService } from "./module-0520.mjs";
import { IChatPetService } from "./module-2112.mjs";
import { Menus } from "./module-3437.mjs";
import { stripIcons } from "./module-0461.mjs";
import { getActionBarActions } from "./module-0516.mjs";
import { ActionRunner, Separator, SubmenuAction, toAction } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { AGENT_HOST_AUTO_MERGE_OPERATION_IDS } from "./module-3734.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { ILogService } from "./module-0095.mjs";
import { isAgentHostProviderId } from "./module-1764.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { ActionViewItem, BaseActionViewItem } from "./module-0476.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { ViewAction, ViewPane } from "./module-1334.mjs";
import { ActiveSessionContextKeys, CHANGES_VIEW_CONTAINER_ID, CHANGES_VIEW_ID, ChangesContextKeys, SESSIONS_CHANGES_OPEN_SINGLE_FILE_DIFF_SETTING } from "./module-3620.mjs";
import { bindContextKey } from "./module-0444.mjs";
import { ChatContextKeys } from "./module-0966.mjs";
import { ServiceCollection } from "./module-0440.mjs";
import { createFileIconThemableTreeContainerScope } from "./module-2125.mjs";
import { ProgressBar } from "./module-1330.mjs";
import { defaultCountBadgeStyles, defaultProgressBarStyles } from "./module-0513.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { CIStatusWidget } from "./module-3731.mjs";
import { Sizing, SplitView } from "./module-0625.mjs";
import { PANEL_SECTION_BORDER } from "./module-0868.mjs";
import { Color } from "./module-0197.mjs";
import { ChangesTreeRenderer, buildTreeChildren, isChangesFileItem, isChangesFileResource, toIChangesFileItem } from "./module-3735.mjs";
import { logChangesViewFileSelect, logChangesViewVersionModeChange, logChangesViewViewModeChange } from "./module-1781.mjs";
import { ChecksViewModel } from "./module-3732.mjs";
import { basename2, isEqual2 } from "./module-0034.mjs";
import { GITHUB_REMOTE_FILE_SCHEME } from "./module-1767.mjs";
import { URI } from "./module-0032.mjs";
import { Schemas } from "./module-0033.mjs";
import { IWorkspaceContextService, WorkspaceFolder } from "./module-0509.mjs";
import { CountBadge } from "./module-0638.mjs";
import { EditorResourceAccessor } from "./module-0926.mjs";
import { ResourceLabels } from "./module-1322.mjs";
import { WorkbenchCompressibleObjectTree } from "./module-0636.mjs";
import { fillEditorsDragData } from "./module-1380.mjs";
import { MenuWorkbenchToolBar } from "./module-0519.mjs";
import { ACTIVE_GROUP, IEditorService, SIDE_GROUP } from "./module-0935.mjs";
import { getChangesEditorLabels } from "./module-3730.mjs";
import { isDiffEditor } from "./module-0223.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IViewDescriptorService } from "./module-1094.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ILabelService } from "./module-0641.mjs";
import { ISessionChangesService } from "./module-3646.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { IWorkspaceFolderLabelService } from "./module-2010.mjs";
import { ViewPaneContainer } from "./module-1381.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { ResourceTree } from "./module-1258.mjs";
import { compareFileNames, comparePaths } from "./module-1521.mjs";
import { Codicon } from "./module-0085.mjs";
import { CHAT_CATEGORY } from "./module-1475.mjs";
import { ActionWidgetDropdownActionViewItem } from "./module-2053.mjs";
import { renderLabelWithIcons } from "./module-0467.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { IViewsService } from "./module-1246.mjs";
import { REVEAL_CI_CHECKS_COMMAND_ID } from "./module-3616.mjs";
import { ChangesSummaryWidget } from "./module-3736.mjs";


// src/vs/sessions/contrib/changes/browser/changesView.ts
var $124 = $;

var RUN_SESSION_CODE_REVIEW_ACTION_ID = "sessions.codeReview.run";

var VERSIONS_PICKER_ACTION_ID = "chatEditing.versionsPicker";

var DIFF_STATS_ACTION_ID = "workbench.changesView.action.viewChanges";

var singlePaneChangesEditorHeader = ContextKeyExpr.and(
  SinglePaneLayoutEnabledContext,
  ActiveEditorContext.isEqualTo(SessionChangesEditorInput.EDITOR_ID)
);

var EMPTY_FILE_CHANGES_MIN_HEIGHT = 140;

var CHAT_PET_CREATE_PULL_REQUEST_ACTION_IDS = /* @__PURE__ */ new Set([
  "create-pr",
  "create-pr-auto-merge",
  "create-pr-auto-squash",
  "create-pr-auto-rebase",
  "github.copilot.chat.createPullRequestCopilotCLIAgentSession.createPR",
  "workbench.action.agentSessions.runSkill.createPR"
]);

var TREE_PANE_LIST_BOTTOM_PADDING = 12;

var TREE_PANE_MIN_VISIBLE_ROWS = 5;

function unlockChatPetCreatePullRequestAchievement(actionId, chatPetService) {
  return CHAT_PET_CREATE_PULL_REQUEST_ACTION_IDS.has(actionId) && chatPetService.unlockAchievement(ChatPetAchievementIds.CreatePullRequest);
}

var ChangesMenuWorkbenchButtonBarWidget = class extends Disposable {
  constructor(container2, hasGitOperationInProgressObs, menuService, changesViewService, contextKeyService, contextMenuService, keybindingService, telemetryService, hoverService, chatPetService) {
    super();
    this._onDidChangeActions = this._register(new Emitter());
    this.onDidChangeActions = this._onDidChangeActions.event;
    const outgoingChangesObs = derivedObservableWithCache(this, (reader, lastValue) => {
      const activeSessionState = changesViewService.activeSessionStateObs.read(reader);
      const hasGitOperationInProgress = hasGitOperationInProgressObs.read(reader);
      if (hasGitOperationInProgress) {
        return lastValue;
      }
      return activeSessionState?.outgoingChanges;
    });
    const runningLabelObs = observableValue(this, void 0);
    const sessionIsActiveObs = observableFromEvent(contextKeyService.onDidChangeContext, () => SessionIsActiveContext.getValue(contextKeyService) ?? false);
    this._register(autorun((reader) => {
      if (!hasGitOperationInProgressObs.read(reader)) {
        runningLabelObs.set(void 0, void 0);
      }
    }));
    this._register(autorun((reader) => {
      const hasGitOperationInProgress = hasGitOperationInProgressObs.read(reader);
      sessionIsActiveObs.read(reader);
      const sessionResource = changesViewService.activeSessionResourceObs.read(reader);
      const outgoingChanges = outgoingChangesObs.read(reader) ?? 0;
      const buttonBar = new MenuWorkbenchButtonBar(
        container2,
        MenuId.AgentsChangesToolbar,
        {
          telemetrySource: "changesView",
          renderSecondaryActions: false,
          menuOptions: sessionResource ? { arg: sessionResource } : { shouldForwardArgs: true },
          buttonConfigProvider: (action, index2) => {
            const configuration2 = this._getButtonConfiguration(action, outgoingChanges, hasGitOperationInProgress, runningLabelObs);
            return index2 === 0 ? { ...configuration2, showIcon: true, showLabel: true } : configuration2;
          }
        },
        menuService,
        contextKeyService,
        contextMenuService,
        keybindingService,
        telemetryService,
        hoverService
      );
      reader.store.add(buttonBar.onWillRun((e4) => {
        runningLabelObs.set(e4.action.label, void 0);
        unlockChatPetCreatePullRequestAchievement(e4.action.id, chatPetService);
      }));
      this._currentButtonBar = buttonBar;
      reader.store.add(buttonBar.onDidChange(() => this._onDidChangeActions.fire()));
      this._onDidChangeActions.fire();
      reader.store.add(buttonBar);
    }));
  }
  get hasActions() {
    return (this._currentButtonBar?.buttons.length ?? 0) > 0;
  }
  _getButtonConfiguration(action, outgoingChanges, hasGitOperationInProgress, runningLabelObs) {
    if (action.id === "github.copilot.sessions.commit" || action.id === "github.copilot.chat.createPullRequestCopilotCLIAgentSession.createPR") {
      if (!hasGitOperationInProgress) {
        return { showIcon: true, showLabel: true, isSecondary: false };
      }
      const customLabelObs = derived((reader) => runningLabelObs.read(reader) ?? action.label);
      return { showIcon: true, showLabel: true, isSecondary: false, showSpinner: true, customLabelObs };
    }
    if (action.id === "github.copilot.sessions.sync" || action.id === "github.copilot.sessions.commitAndSync") {
      const labelWithCount = outgoingChanges > 0 ? `${action.label} ${outgoingChanges}\u2191` : `${action.label}`;
      return { showIcon: true, showLabel: true, isSecondary: false, customLabel: labelWithCount, showSpinner: hasGitOperationInProgress };
    }
    if (action.id === AGENT_HOST_SKILL_BUTTON_UPDATE_PR_ID) {
      const customLabel = outgoingChanges > 0 ? `${action.label} ${outgoingChanges}\u2191` : action.label;
      return { customLabel, showIcon: true, showLabel: true, isSecondary: false };
    }
    if (action.id === RUN_SESSION_CODE_REVIEW_ACTION_ID || action.id === "chatEditing.viewAllSessionChanges" || action.id === "github.copilot.chat.openPullRequestCopilotCLIAgentSession.openPR") {
      return { showIcon: true, showLabel: false, isSecondary: true };
    }
    if (action.id === "agentFeedbackEditor.action.submitActiveSession") {
      return { showIcon: false, showLabel: true, isSecondary: false };
    }
    if (action.id === "github.copilot.chat.createPullRequestCopilotCLIAgentSession.createPR" || action.id === "github.copilot.chat.mergeCopilotCLIAgentSessionChanges.merge" || action.id === "github.copilot.chat.checkoutPullRequestReroute" || action.id === "pr.checkoutFromChat" || action.id === "github.copilot.sessions.initializeRepository" || action.id === "agentSession.restore" || action.id === "sessions.action.fixCIChecks" || isAgentHostSkillButtonId(action.id)) {
      return { showIcon: true, showLabel: true, isSecondary: false };
    }
    if (action instanceof MenuItemAction) {
      const icon2 = action.item.icon;
      if (icon2) {
        return { showIcon: true, showLabel: false };
      }
    }
    return void 0;
  }
};

ChangesMenuWorkbenchButtonBarWidget = __decorateClass([
  __decorateParam(2, IMenuService),
  __decorateParam(3, IChangesViewService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IContextMenuService),
  __decorateParam(6, IKeybindingService),
  __decorateParam(7, ITelemetryService),
  __decorateParam(8, IHoverService),
  __decorateParam(9, IChatPetService)
], ChangesMenuWorkbenchButtonBarWidget);

var CHANGES_OPERATIONS_DROPDOWN_PRIMARY_GROUP = "primary";

var ChangesWorkbenchButtonBarWidget = class extends Disposable {
  constructor(container2, menuService, changesViewService, contextKeyService, instantiationService, chatPetService, contextMenuService, logService) {
    super();
    this.logService = logService;
    const menu = this._register(menuService.createMenu(MenuId.AgentsChangesToolbar, contextKeyService, { emitEventsForSubmenuChanges: true }));
    const dropdownMenu = this._register(menuService.createMenu(Menus.ChangesOperationsDropdown, contextKeyService, { emitEventsForSubmenuChanges: true }));
    let primaryIsBusy = false;
    const buttonBar = this._buttonBar = this._register(instantiationService.createInstance(
      WorkbenchButtonBar,
      container2,
      {
        telemetrySource: "changesView",
        renderSecondaryActions: false,
        buttonConfigProvider: (action, index2) => {
          return index2 === 0 ? { showIcon: true, showLabel: true, customLabel: stripIcons(action.label), showSpinner: primaryIsBusy } : { showIcon: true, showLabel: false };
        }
      }
    ));
    this._register(buttonBar.onWillRun((e4) => unlockChatPetCreatePullRequestAchievement(e4.action.id, chatPetService)));
    this.onDidChangeActions = Event2.signal(buttonBar.onDidChange);
    const menuActionsObs = observableFromEvent(menu.onDidChange, () => {
      return getActionBarActions(menu.getActions({ shouldForwardArgs: true }));
    });
    const agentMergeEnabledObs = observableFromEvent(contextKeyService.onDidChangeContext, () => contextKeyService.getContextKeyValue(SessionAgentMergeEnabledContext.key) === true);
    const dropdownMenuActionsObs = observableFromEvent(dropdownMenu.onDidChange, () => {
      const groups = dropdownMenu.getActions({ shouldForwardArgs: true });
      const primaryGroup = groups.find(([group2]) => group2 === CHANGES_OPERATIONS_DROPDOWN_PRIMARY_GROUP)?.[1] ?? [];
      const rest = groups.filter(([group2]) => group2 !== CHANGES_OPERATIONS_DROPDOWN_PRIMARY_GROUP).map(([, actions]) => actions);
      const contributed = primaryGroup[0];
      const primary = contributed instanceof SubmenuItemAction ? toAction({
        id: contributed.item.submenu.id,
        label: contributed.label,
        // Wrapping the submenu in a plain action would drop the icon
        // its menu item declared, so it is carried over the way any
        // action carries one.
        class: ThemeIcon.isThemeIcon(contributed.item.icon) ? ThemeIcon.asClassName(contributed.item.icon) : void 0,
        run: () => contextMenuService.showContextMenu({
          getAnchor: () => buttonBar.buttons[0]?.element ?? container2,
          getActions: () => contributed.actions
        })
      }) : contributed;
      return { primary, contributed, isAgentMerge: contributed instanceof SubmenuItemAction && contributed.item.submenu === Menus.ChangesAgentMerge, groups: primaryGroup.length > 0 ? [primaryGroup, ...rest] : rest };
    });
    const operationActionGroupsObs = derived((reader) => {
      const changeset = changesViewService.activeSessionChangesetObs.read(reader);
      if (!changeset) {
        return { groups: [], hasRunning: false };
      }
      const operations = changesViewService.activeSessionChangesetOperationsObs.read(reader);
      const changesetOperations = operations.filter((op) => op.scopes.includes("changeset" /* Changeset */)).filter((op) => !AGENT_HOST_AUTO_MERGE_OPERATION_IDS.has(op.id));
      const toOperationAction = (op) => toAction({
        id: op.id,
        label: op.label,
        // The button renders the icon the action carries; a running
        // operation shows the animated spinner in its place.
        class: op.icon ? ThemeIcon.asClassName(op.icon) : void 0,
        tooltip: op.description ?? op.label,
        enabled: op.status !== "disabled" /* Disabled */ && op.status !== "running" /* Running */,
        run: () => {
          this.logService.info(`[ChangesWorkbenchButtonBarWidget] Invoking changeset operation from the title bar: operation=${op.id}`);
          return changeset.invokeOperation(op.id);
        }
      });
      const groups = /* @__PURE__ */ new Map();
      for (const op of changesetOperations) {
        if (op.status === "running" /* Running */) {
          continue;
        }
        const action = toOperationAction(op);
        const groupActions = groups.get(op.group);
        if (groupActions) {
          groupActions.push(action);
        } else {
          groups.set(op.group, [action]);
        }
      }
      const runningActions = changesetOperations.filter((op) => op.status === "running" /* Running */).map(toOperationAction);
      return {
        groups: [
          ...runningActions.length > 0 ? [runningActions] : [],
          ...groups.values()
        ],
        hasRunning: runningActions.length > 0
      };
    });
    this._register(autorun((reader) => {
      const isLoading = changesViewService.activeSessionLoadingObs.read(reader);
      if (isLoading) {
        return;
      }
      const operations = operationActionGroupsObs.read(reader);
      const menuActions = menuActionsObs.read(reader);
      const dropdownMenuActions = dropdownMenuActionsObs.read(reader);
      const primaryActions = [];
      const usesContributedPrimary = !operations.hasRunning && dropdownMenuActions.primary !== void 0;
      const primaryAction = usesContributedPrimary ? dropdownMenuActions.primary : operations.groups[0]?.[0];
      const groups = [...operations.groups, ...dropdownMenuActions.groups].map((group2) => group2.filter((action) => action !== dropdownMenuActions.contributed)).filter((group2) => group2.length > 0);
      const entryCount = groups.reduce((count2, group2) => count2 + group2.length, 0);
      if (primaryAction && (usesContributedPrimary ? entryCount > 0 : entryCount > 1)) {
        const dropdownActions = usesContributedPrimary ? [primaryAction] : [];
        for (const group2 of groups) {
          if (dropdownActions.length > 0) {
            dropdownActions.push(new Separator());
          }
          dropdownActions.push(...group2);
        }
        primaryActions.push(new SubmenuAction("changesView.operations.primary.dropdown", primaryAction.label, dropdownActions));
      } else if (primaryAction) {
        primaryActions.push(primaryAction);
      }
      primaryActions.push(...menuActions.primary);
      primaryIsBusy = usesContributedPrimary ? dropdownMenuActions.isAgentMerge && agentMergeEnabledObs.read(reader) : operations.hasRunning;
      buttonBar.update(primaryActions, menuActions.secondary);
      this._logButtonBar(primaryAction, usesContributedPrimary, operations.hasRunning, primaryIsBusy, groups, menuActions.primary);
    }));
  }
  get hasActions() {
    return this._buttonBar.buttons.length > 0;
  }
  /**
   * Logs what the titlebar button bar actually renders, whenever that
   * changes. The autorun below re-runs on every git, GitHub, menu and
   * context-key change, so only transitions are logged.
   */
  _logButtonBar(primaryAction, usesContributedPrimary, hasRunningOperation, showsSpinner, dropdownGroups, trailingActions) {
    const primaryLabel = primaryAction ? stripIcons(primaryAction.label) : void 0;
    const dropdownIds = dropdownGroups.flat().map((action) => action.id);
    const signature = JSON.stringify([primaryAction?.id, primaryLabel, usesContributedPrimary, hasRunningOperation, showsSpinner, dropdownIds, trailingActions.map((action) => action.id)]);
    if (this._lastLoggedButtonBar === signature) {
      return;
    }
    this._lastLoggedButtonBar = signature;
    if (!primaryAction) {
      this.logService.info(`[ChangesWorkbenchButtonBarWidget] Title bar button hidden: no primary action is available${trailingActions.length > 0 ? `, trailing=[${trailingActions.map((action) => action.id).join(", ")}]` : ""}`);
      return;
    }
    const source = hasRunningOperation ? "running-operation" : usesContributedPrimary ? "contributed-menu" : "advertised-operation";
    this.logService.info(`[ChangesWorkbenchButtonBarWidget] Title bar button: label="${primaryLabel}", id=${primaryAction.id}, source=${source}, spinner=${showsSpinner}, dropdown=[${dropdownIds.join(", ")}]`);
  }
};

ChangesWorkbenchButtonBarWidget = __decorateClass([
  __decorateParam(1, IMenuService),
  __decorateParam(2, IChangesViewService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IInstantiationService),
  __decorateParam(5, IChatPetService),
  __decorateParam(6, IContextMenuService),
  __decorateParam(7, ILogService)
], ChangesWorkbenchButtonBarWidget);

var ChangesActionsBar = class extends Disposable {
  constructor(container2, instantiationService, changesViewService, sessionsService, contextKeyService) {
    super();
    container2.classList.add("changes-actions-bar");
    const hasGitOperationInProgressGlobalObs = observableFromEvent(contextKeyService.onDidChangeContext, () => contextKeyService.getContextKeyValue("sessions.hasGitOperationInProgress") === true);
    const hasGitOperationInProgressObs = derived((reader) => {
      if (hasGitOperationInProgressGlobalObs.read(reader)) {
        return true;
      }
      return changesViewService.activeSessionStateObs.read(reader)?.hasGitOperationInProgress === true;
    });
    const isAgentHostSessionObs = derived((reader) => {
      const activeSession = sessionsService.activeSession.read(reader);
      return activeSession ? isAgentHostProviderId(activeSession.providerId) : false;
    });
    let currentWidget;
    const updateVisibility = () => {
      const visible = currentWidget?.hasActions ?? false;
      setVisibility(visible, container2);
    };
    this._register(autorun((reader) => {
      clearNode(container2);
      const widget = isAgentHostSessionObs.read(reader) ? instantiationService.createInstance(ChangesWorkbenchButtonBarWidget, container2) : instantiationService.createInstance(ChangesMenuWorkbenchButtonBarWidget, container2, hasGitOperationInProgressObs);
      reader.store.add(widget);
      currentWidget = widget;
      reader.store.add(widget.onDidChangeActions(() => updateVisibility()));
      updateVisibility();
    }));
    this._register(autorun((reader) => {
      sessionsService.activeSession.read(reader)?.status.read(reader);
      updateVisibility();
    }));
  }
};

ChangesActionsBar = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, IChangesViewService),
  __decorateParam(3, ISessionsService),
  __decorateParam(4, IContextKeyService)
], ChangesActionsBar);

var CHANGES_HEADER_ACTIONS_ID = "workbench.changesView.headerActions";

var ChangesActionsBarActionViewItem = class extends BaseActionViewItem {
  constructor(action, options3, instantiationService) {
    super(void 0, action, options3);
    this.instantiationService = instantiationService;
  }
  render(container2) {
    super.render(container2);
    this._register(this.instantiationService.createInstance(ChangesActionsBar, container2));
  }
};

ChangesActionsBarActionViewItem = __decorateClass([
  __decorateParam(2, IInstantiationService)
], ChangesActionsBarActionViewItem);

var ChangesActionViewItemsContribution = class extends Disposable {
  static {
    this.ID = "workbench.contrib.changesEditorHeader";
  }
  constructor(actionViewItemService) {
    super();
    const onDidRegister = this._register(new Emitter());
    this._register(actionViewItemService.register(Menus.SessionsEditorHeaderPrimary, VERSIONS_PICKER_ACTION_ID, (action, _options, instantiationService) => {
      if (!(action instanceof MenuItemAction)) {
        return void 0;
      }
      return instantiationService.createInstance(ChangesPickerActionItem, action);
    }, onDidRegister.event));
    this._register(actionViewItemService.register(Menus.SessionsEditorHeaderPrimary, DIFF_STATS_ACTION_ID, (action, options3, instantiationService) => {
      if (!(action instanceof MenuItemAction)) {
        return void 0;
      }
      return instantiationService.createInstance(SinglePaneChangesDiffStatsActionItem, action, options3);
    }, onDidRegister.event));
    this._register(actionViewItemService.register(Menus.TitleBarSessionMenu, CHANGES_HEADER_ACTIONS_ID, (action, options3, instantiationService) => {
      if (!(action instanceof MenuItemAction)) {
        return void 0;
      }
      return instantiationService.createInstance(ChangesActionsBarActionViewItem, action, options3);
    }, onDidRegister.event));
    onDidRegister.fire();
  }
};

ChangesActionViewItemsContribution = __decorateClass([
  __decorateParam(0, IActionViewItemService)
], ChangesActionViewItemsContribution);

registerWorkbenchContribution2(ChangesActionViewItemsContribution.ID, ChangesActionViewItemsContribution, WorkbenchPhase.BlockRestore);

var ChangesViewPane = class extends ViewPane {
  constructor(options3, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService, changesViewService, editorService, sessionsService, labelService, logService, telemetryService, sessionChangesService, workbenchLayoutService, workspaceFolderLabelService) {
    super({ ...options3, titleMenuId: MenuId.ChatEditingSessionTitleToolbar }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, hoverService);
    this.changesViewService = changesViewService;
    this.editorService = editorService;
    this.sessionsService = sessionsService;
    this.labelService = labelService;
    this.logService = logService;
    this.telemetryService = telemetryService;
    this.sessionChangesService = sessionChangesService;
    this.workbenchLayoutService = workbenchLayoutService;
    this.workspaceFolderLabelService = workspaceFolderLabelService;
    this.treePaneSizeChange = this._register(new Emitter());
    this.sectionPanesUserResized = false;
    this.renderDisposables = this._register(new DisposableStore());
    // Track current body dimensions for list layout
    this.currentBodyHeight = 0;
    this.currentBodyWidth = 0;
    this.isMergeBaseBranchProtectedContextKey = ActiveSessionContextKeys.IsMergeBaseBranchProtected.bindTo(this.scopedContextKeyService);
    this.isolationModeContextKey = ActiveSessionContextKeys.IsolationMode.bindTo(this.scopedContextKeyService);
    this.hasGitRepositoryContextKey = ActiveSessionContextKeys.HasGitRepository.bindTo(this.scopedContextKeyService);
    this.hasUpstreamContextKey = ActiveSessionContextKeys.HasUpstream.bindTo(this.scopedContextKeyService);
    this.hasIncomingChangesContextKey = ActiveSessionContextKeys.HasIncomingChanges.bindTo(this.scopedContextKeyService);
    this.hasOutgoingChangesContextKey = ActiveSessionContextKeys.HasOutgoingChanges.bindTo(this.scopedContextKeyService);
    this.hasUncommittedChangesContextKey = ActiveSessionContextKeys.HasUncommittedChanges.bindTo(this.scopedContextKeyService);
    this.hasBranchChangesContextKey = ActiveSessionContextKeys.HasBranchChanges.bindTo(this.scopedContextKeyService);
    this.hasGitHubRemoteContextKey = ActiveSessionContextKeys.HasGitHubRemote.bindTo(this.scopedContextKeyService);
    this.hasPullRequestContextKey = ActiveSessionContextKeys.HasPullRequest.bindTo(this.scopedContextKeyService);
    this.hasOpenPullRequestContextKey = ActiveSessionContextKeys.HasOpenPullRequest.bindTo(this.scopedContextKeyService);
    this.hasGitOperationInProgressContextKey = ActiveSessionContextKeys.HasGitOperationInProgress.bindTo(this.scopedContextKeyService);
    this._register(bindContextKey(ChangesContextKeys.VersionMode, this.scopedContextKeyService, (reader) => {
      return this.changesViewService.activeSessionChangesetObs.read(reader)?.id ?? "";
    }));
    this._register(bindContextKey(ChangesContextKeys.ViewMode, this.scopedContextKeyService, (reader) => {
      return this.changesViewService.viewModeObs.read(reader);
    }));
    this._register(bindContextKey(ChatContextKeys.agentSessionType, this.scopedContextKeyService, (reader) => {
      return this.changesViewService.activeSessionTypeObs.read(reader) ?? "";
    }));
    const hasGitOperationInProgressGlobalContextObs = observableFromEvent(this.contextKeyService.onDidChangeContext, () => {
      return this.contextKeyService.getContextKeyValue("sessions.hasGitOperationInProgress") === true;
    });
    const hasGitOperationInProgressStateObs = derived((reader) => {
      const activeSessionState = this.changesViewService.activeSessionStateObs.read(reader);
      return activeSessionState?.hasGitOperationInProgress === true;
    });
    this.hasGitOperationInProgressObs = derived((reader) => {
      const hasGitOperationInProgressGlobalContext = hasGitOperationInProgressGlobalContextObs.read(reader);
      const hasGitOperationInProgressState = hasGitOperationInProgressStateObs.read(reader);
      const contextKeyValue = hasGitOperationInProgressGlobalContext === true ? hasGitOperationInProgressGlobalContext : hasGitOperationInProgressState;
      this.hasGitOperationInProgressContextKey.set(contextKeyValue);
      return contextKeyValue;
    });
    const scopedServiceCollection = new ServiceCollection([IContextKeyService, this.scopedContextKeyService]);
    this.scopedInstantiationService = this.instantiationService.createChild(scopedServiceCollection);
    this._register(this.scopedInstantiationService);
  }
  renderBody(container2) {
    super.renderBody(container2);
    this.bodyContainer = append(container2, $124(".changes-view-body"));
    this.actionsContainer = append(this.bodyContainer, $124(".chat-editing-session-actions.outside-card"));
    this.splitViewContainer = append(this.bodyContainer, $124(".changes-splitview-container"));
    this.contentContainer = append(this.splitViewContainer, $124(".chat-editing-session-container.show-file-icons"));
    this._register(createFileIconThemableTreeContainerScope(this.contentContainer, this.themeService));
    const updateHasFileIcons = () => {
      this.contentContainer.classList.toggle("has-file-icons", this.themeService.getFileIconTheme().hasFileIcons);
    };
    updateHasFileIcons();
    this._register(this.themeService.onDidFileIconThemeChange(updateHasFileIcons));
    this.createFilesHeader(this.contentContainer);
    const progressContainer = append(this.contentContainer, $124(".changes-progress"));
    this.changesProgressBar = this._register(new ProgressBar(progressContainer, defaultProgressBarStyles));
    this.changesProgressBar.stop().hide();
    this.listContainer = append(this.contentContainer, $124(".changes-file-list"));
    this.welcomeContainer = append(this.contentContainer, $124(".changes-welcome"));
    this.welcomeContainer.style.display = "none";
    const welcomeMessage = append(this.welcomeContainer, $124(".changes-welcome-message"));
    welcomeMessage.textContent = localize(4267, null);
    this.ciStatusWidget = this._register(this.scopedInstantiationService.createInstance(CIStatusWidget, this.splitViewContainer));
    this.splitView = this._register(new SplitView(this.splitViewContainer, {
      orientation: 0 /* VERTICAL */,
      proportionalLayout: false
    }));
    const ciWidget = this.ciStatusWidget;
    const ciMinHeight = CIStatusWidget.HEADER_HEIGHT + CIStatusWidget.MIN_BODY_HEIGHT;
    const getCIContentHeight = () => Math.max(CIStatusWidget.HEADER_HEIGHT, ciWidget.desiredHeight);
    const getCIMinimumHeight = () => ciWidget.collapsed ? CIStatusWidget.HEADER_HEIGHT : Math.min(ciMinHeight, getCIContentHeight());
    const getCIPreferredHeight = () => Math.max(
      getCIMinimumHeight(),
      Math.min(getCIContentHeight(), CIStatusWidget.HEADER_HEIGHT + CIStatusWidget.PREFERRED_BODY_HEIGHT)
    );
    const getReservedSectionHeight = () => ciWidget.visible ? getCIMinimumHeight() : 0;
    this.rebalanceSectionPanes = () => {
      if (!this.splitView || this.sectionPanesUserResized || !ciWidget.visible || ciWidget.collapsed) {
        return;
      }
      this.splitView.resizeView(1, getCIMinimumHeight());
    };
    const thisView = this;
    const treePane = {
      element: this.contentContainer,
      get minimumSize() {
        return thisView.getTreePaneMinimumSize(getReservedSectionHeight());
      },
      get maximumSize() {
        return thisView.getTreePaneMaximumSize();
      },
      onDidChange: this.treePaneSizeChange.event,
      layout: (height) => {
        this.contentContainer.style.height = `${height}px`;
        this._layoutTreeInPane(height);
      }
    };
    const ciElement = this.ciStatusWidget.element;
    const ciPane = {
      element: ciElement,
      get minimumSize() {
        return getCIMinimumHeight();
      },
      get maximumSize() {
        return ciWidget.collapsed ? CIStatusWidget.HEADER_HEIGHT : getCIContentHeight();
      },
      priority: 1 /* Low */,
      onDidChange: Event2.map(this.ciStatusWidget.onDidChangeHeight, () => void 0),
      layout: (height) => {
        ciElement.style.height = `${height}px`;
        const bodyHeight = Math.max(0, height - CIStatusWidget.HEADER_HEIGHT);
        ciWidget.layout(bodyHeight);
      }
    };
    this.splitView.addView(treePane, Sizing.Distribute, 0, true);
    this.splitView.addView(ciPane, CIStatusWidget.HEADER_HEIGHT + CIStatusWidget.PREFERRED_BODY_HEIGHT, 1, true);
    const updateSplitViewStyles = () => {
      const borderColor = this.themeService.getColorTheme().getColor(PANEL_SECTION_BORDER);
      this.splitView.style({ separatorBorder: borderColor ?? Color.transparent });
    };
    updateSplitViewStyles();
    this._register(this.themeService.onDidColorThemeChange(updateSplitViewStyles));
    this._register(this.splitView.onDidSashChange(() => this.sectionPanesUserResized = true));
    this.splitView.setViewVisible(1, false);
    this._wireSectionPane(this.ciStatusWidget, 1, CIStatusWidget.HEADER_HEIGHT, getCIPreferredHeight);
    this._register(this.ciStatusWidget.onDidChangeHeight(() => this.fireTreePaneSizeChange()));
    this._register(autorun((reader) => {
      const state = this.changesViewService.activeSessionSectionCollapseStateObs.read(reader);
      ciWidget.setCollapsed(state.checks);
    }));
    this._register(ciWidget.onDidToggleCollapsed((collapsed2) => this.setActiveSectionCollapsed("checks", collapsed2)));
    this._register(this.onDidChangeBodyVisibility((visible) => {
      if (visible) {
        this.onVisible();
      } else {
        this.captureDetailsViewState();
        this.renderDisposables.clear();
      }
    }));
    if (this.isBodyVisible()) {
      this.onVisible();
    }
  }
  getActionsContext() {
    return this.changesViewService.activeSessionResourceObs.get();
  }
  onVisible() {
    this.renderDisposables.clear();
    this.renderDisposables.add(autorun((reader) => {
      this.changesViewService.activeSessionResourceObs.read(reader);
      this.updateActions();
    }));
    this.renderDisposables.add(autorun((reader) => {
      const isLoading = this.changesViewService.activeSessionChangesetLoadingObs.read(reader);
      if (isLoading) {
        this.changesProgressBar.infinite().show(200);
      } else {
        this.changesProgressBar.stop().hide();
      }
    }));
    const changesObs = derived((reader) => {
      const changes = this.changesViewService.activeSessionChangesObs.read(reader);
      return toIChangesFileItem(changes);
    });
    const topLevelStats = derivedObservableWithCache(this, (reader, lastValue) => {
      const isLoading = this.changesViewService.activeSessionChangesetLoadingObs.read(reader);
      if (isLoading) {
        return lastValue;
      }
      const entries2 = changesObs.read(reader);
      let added = 0, removed = 0;
      for (const entry of entries2) {
        added += entry.linesAdded;
        removed += entry.linesRemoved;
      }
      return { files: entries2.length, added, removed };
    });
    if (this.actionsContainer) {
      this._bindContextKeys(topLevelStats);
      this.createActionsButtonBar();
    }
    const activeSessionStatusObs = derived((reader) => {
      const activeSession = this.sessionsService.activeSession.read(reader);
      return activeSession?.status.read(reader);
    });
    this.renderDisposables.add(autorun((reader) => {
      if (this.changesViewService.activeSessionLoadingObs.read(reader)) {
        return;
      }
      const activeSessionStatus = activeSessionStatusObs.read(reader);
      const isUntitled = activeSessionStatus === 0 /* Untitled */;
      if (this.actionsContainer) {
        setVisibility(this.isActionsContainerVisible(isUntitled), this.actionsContainer);
      }
      const stats = topLevelStats.read(reader);
      const hasEntries = stats !== void 0 && stats.files > 0;
      if (this.filesHeaderNode) {
        const hasGitRepository = this.changesViewService.activeSessionHasGitRepositoryObs.read(reader);
        setVisibility(!isUntitled && (hasGitRepository || hasEntries), this.filesHeaderNode);
      }
      if (this.fileHeaderToolbarContainer) {
        setVisibility(hasEntries, this.fileHeaderToolbarContainer);
      }
      setVisibility(hasEntries, this.listContainer);
      setVisibility(!hasEntries, this.welcomeContainer);
      this.fireTreePaneSizeChange();
      this.layoutSplitView();
    }));
    if (!this.tree && this.listContainer) {
      this.tree = this.createChangesTree(this.listContainer, this.onDidChangeBodyVisibility, this._store);
    }
    if (this.tree) {
      const tree = this.tree;
      this.renderDisposables.add(tree.onDidChangeContentHeight(() => {
        this.fireTreePaneSizeChange();
        this.layoutSplitView();
      }));
      this.renderDisposables.add(tree.onDidOpen((e4) => {
        if (!e4.element || !isChangesFileItem(e4.element)) {
          return;
        }
        logChangesViewFileSelect(this.telemetryService, e4.element.changeType);
        if (this.shouldOpenModalDiff()) {
          const items = changesObs.get();
          this._openFileItem(e4.element, items, e4.sideBySide, !!e4.editorOptions?.preserveFocus, !!e4.editorOptions?.pinned, items.length > 1);
          return;
        }
        const altKey = !!e4.browserEvent?.altKey;
        const openSingleFileDiff = this.shouldOpenSingleFileDiffByDefault() !== altKey;
        if (openSingleFileDiff) {
          const sideBySide = e4.sideBySide && !altKey;
          void this._openSingleFileDiffEditor(e4.element, sideBySide, !!e4.editorOptions?.preserveFocus, !!e4.editorOptions?.pinned);
          return;
        }
        void this._openMultiFileDiffEditor(e4.element.uri);
      }));
    }
    if (this.ciStatusWidget) {
      const checksViewModel = this.scopedInstantiationService.createInstance(ChecksViewModel);
      this.renderDisposables.add(checksViewModel);
      this.renderDisposables.add(this.ciStatusWidget.setInput(checksViewModel));
    }
    this.renderDisposables.add(autorun((reader) => {
      const changes = changesObs.read(reader);
      const viewMode = this.changesViewService.viewModeObs.read(reader);
      const activeSessionLoading = this.changesViewService.activeSessionLoadingObs.read(reader);
      const sessionResource = this.changesViewService.activeSessionResourceObs.read(reader);
      this.changesViewService.activeSessionStateObs.read(reader);
      if (!this.tree || activeSessionLoading) {
        return;
      }
      const detailsViewStateTransfer = this.changesViewService.detailsViewStateTransferObs.read(reader);
      if (detailsViewStateTransfer !== this.detailsViewStateTransfer) {
        this.detailsViewStateTransfer = detailsViewStateTransfer;
        if (detailsViewStateTransfer && this.renderedTreeState) {
          const renderedSessionResource = this.renderedTreeState.sessionResource;
          if (isEqual2(renderedSessionResource, detailsViewStateTransfer.from)) {
            this.captureDetailsViewState(detailsViewStateTransfer.to);
            this.renderedTreeState = void 0;
            if (sessionResource && isEqual2(sessionResource, detailsViewStateTransfer.from)) {
              return;
            }
          } else if (!isEqual2(renderedSessionResource, detailsViewStateTransfer.to)) {
            this.captureDetailsViewState();
            if (sessionResource && isEqual2(sessionResource, renderedSessionResource)) {
              return;
            }
          }
        }
      } else {
        this.captureDetailsViewState();
      }
      const detailsViewState = sessionResource ? this.changesViewService.getDetailsViewState(sessionResource, viewMode) : void 0;
      this.listContainer?.classList.toggle("list-mode", viewMode === "list" /* List */);
      if (viewMode === "tree" /* Tree */) {
        const treeRootInfo = this.getTreeRootInfo(changes);
        const treeChildren = buildTreeChildren(changes, treeRootInfo);
        this.setDetailsTreeChildren(sessionResource, viewMode, detailsViewState, treeChildren);
      } else {
        const listChildren = changes.map((item) => ({
          element: item,
          collapsible: false
        }));
        this.setDetailsTreeChildren(sessionResource, viewMode, detailsViewState, listChildren);
      }
      this.fireTreePaneSizeChange();
      this.layoutSplitView();
    }));
  }
  saveState() {
    this.captureDetailsViewState();
    super.saveState();
  }
  captureDetailsViewState(sessionResource) {
    if (!this.tree || !this.renderedTreeState) {
      return;
    }
    const state = this.tree.getViewState().toJSON();
    this.changesViewService.setDetailsViewState(sessionResource ?? this.renderedTreeState.sessionResource, this.renderedTreeState.viewMode, {
      ...state,
      focus: Array.from(state.focus),
      selection: Array.from(state.selection)
    });
  }
  setDetailsTreeChildren(sessionResource, viewMode, state, children) {
    if (!this.tree) {
      return;
    }
    const elementsById = /* @__PURE__ */ new Map();
    const restoredChildren = this.applyDetailsViewState(children, state, elementsById);
    this.renderedTreeState = void 0;
    this.tree.setChildren(null, restoredChildren);
    this.tree.setFocus(state ? Array.from(state.focus, (id2) => elementsById.get(id2)).filter((element) => element !== void 0) : []);
    this.tree.setSelection(state ? Array.from(state.selection, (id2) => elementsById.get(id2)).filter((element) => element !== void 0) : []);
    this.tree.scrollTop = state?.scrollTop ?? 0;
    this.renderedTreeState = sessionResource ? { sessionResource, viewMode } : void 0;
  }
  applyDetailsViewState(children, state, elementsById) {
    return children.map((child) => {
      const id2 = child.element.uri.toString();
      elementsById.set(id2, child.element);
      const restoredChildren = child.children ? this.applyDetailsViewState(Array.from(child.children), state, elementsById) : void 0;
      const expanded2 = state?.expanded[id2];
      return {
        ...child,
        children: restoredChildren,
        collapsed: expanded2 === void 0 ? child.collapsed : expanded2 === 0
      };
    });
  }
  _bindContextKeys(topLevelStats) {
    this.renderDisposables.add(bindContextKey(ChatContextKeys.requestInProgress, this.scopedContextKeyService, (reader) => {
      const activeSessionStatus = this.sessionsService.activeSession.read(reader)?.status.read(reader);
      return activeSessionStatus !== 3 /* Completed */ && activeSessionStatus !== 4 /* Error */;
    }));
    this.renderDisposables.add(bindContextKey(ChatContextKeys.hasAgentSessionChanges, this.scopedContextKeyService, (reader) => {
      const stats = topLevelStats.read(reader);
      return stats !== void 0 && stats.files > 0;
    }));
    this.renderDisposables.add(autorun((reader) => {
      const state = this.changesViewService.activeSessionStateObs.read(reader);
      if (!state || state.hasGitOperationInProgress) {
        return;
      }
      this.logService.info(`[ChangesViewPane][_bindContextKeys] Context keys: ${JSON.stringify(state)}`);
      this.scopedContextKeyService.bufferChangeEvents(() => {
        this.isolationModeContextKey.set(state.isolationMode);
        this.hasGitRepositoryContextKey.set(state.hasGitRepository);
        this.isMergeBaseBranchProtectedContextKey.set(state.isMergeBaseBranchProtected === true);
        this.hasGitHubRemoteContextKey.set(state.hasGitHubRemote === true);
        this.hasPullRequestContextKey.set(state.hasPullRequest === true);
        this.hasOpenPullRequestContextKey.set(state.hasOpenPullRequest === true);
        this.hasUpstreamContextKey.set(state.upstreamBranchName !== void 0);
        this.hasIncomingChangesContextKey.set(state.incomingChanges !== void 0 && state.incomingChanges > 0);
        this.hasOutgoingChangesContextKey.set(state.outgoingChanges !== void 0 && state.outgoingChanges > 0);
        this.hasUncommittedChangesContextKey.set(state.uncommittedChanges !== void 0 && state.uncommittedChanges > 0);
        this.hasBranchChangesContextKey.set(state.hasBranchChanges === true);
        this.hasGitOperationInProgressContextKey.set(state.hasGitOperationInProgress === true);
      });
    }));
  }
  /** Layout the tree within its SplitView pane. */
  _layoutTreeInPane(paneHeight) {
    if (!this.tree) {
      return;
    }
    const filesHeaderHeight = this.filesHeaderNode?.offsetHeight ?? 0;
    const treeHeight = Math.max(0, paneHeight - filesHeaderHeight);
    this.tree.layout(treeHeight, this.currentBodyWidth);
    this.tree.getHTMLElement().style.height = `${treeHeight}px`;
  }
  getTreePaneMinimumSize(reservedSectionHeight) {
    if (this.listContainer?.style.display === "none") {
      return EMPTY_FILE_CHANGES_MIN_HEIGHT;
    }
    const desiredSize = Math.max(this.getTreePaneDesiredSize(), this.getTreePaneReservedRowsSize());
    const availableSize = this.getSplitViewAvailableHeight() - reservedSectionHeight;
    return Math.min(desiredSize, Math.max(EMPTY_FILE_CHANGES_MIN_HEIGHT, availableSize));
  }
  getTreePaneDesiredSize() {
    if (this.listContainer?.style.display === "none") {
      return EMPTY_FILE_CHANGES_MIN_HEIGHT;
    }
    const filesHeaderHeight = this.filesHeaderNode?.offsetHeight ?? 0;
    const treeContentHeight = this.tree?.contentHeight ?? 0;
    const bottomPadding = treeContentHeight > 0 ? TREE_PANE_LIST_BOTTOM_PADDING : 0;
    return filesHeaderHeight + treeContentHeight + bottomPadding;
  }
  /** Height needed to show {@link TREE_PANE_MIN_VISIBLE_ROWS} file rows, regardless of how many are listed. */
  getTreePaneReservedRowsSize() {
    const filesHeaderHeight = this.filesHeaderNode?.offsetHeight ?? 0;
    return filesHeaderHeight + TREE_PANE_MIN_VISIBLE_ROWS * ChangesTreeDelegate.ROW_HEIGHT + TREE_PANE_LIST_BOTTOM_PADDING;
  }
  getTreePaneMaximumSize() {
    if (this.listContainer?.style.display === "none") {
      return EMPTY_FILE_CHANGES_MIN_HEIGHT;
    }
    return Math.max(this.getTreePaneDesiredSize(), this.getTreePaneReservedRowsSize());
  }
  fireTreePaneSizeChange() {
    this.treePaneSizeChange.fire(void 0);
  }
  /** Compute the height available to the SplitView within the body. */
  getSplitViewAvailableHeight() {
    const bodyHeight = this.currentBodyHeight;
    if (bodyHeight <= 0) {
      return 0;
    }
    const bodyPadding = 16;
    const actionsHeight = this.actionsContainer?.offsetHeight ?? 0;
    const actionsMargin = actionsHeight > 0 ? 8 : 0;
    return Math.max(0, bodyHeight - bodyPadding - actionsHeight - actionsMargin);
  }
  /** Layout the SplitView to fill available body space. */
  layoutSplitView() {
    if (!this.splitView || !this.splitViewContainer) {
      return;
    }
    const availableHeight = this.getSplitViewAvailableHeight();
    if (availableHeight <= 0) {
      return;
    }
    this.splitViewContainer.style.height = `${availableHeight}px`;
    this.splitView.layout(availableHeight);
    this.rebalanceSectionPanes?.();
  }
  /**
   * Wires the collapsible CI checks section widget to its SplitView pane:
   * toggling its header collapses/restores the pane, and changes to its
   * content show/hide the pane and re-layout.
   */
  _wireSectionPane(widget, paneIndex, headerHeight, getPreferredHeight) {
    let savedPaneHeight = getPreferredHeight();
    this._register(widget.onDidToggleCollapsed((collapsed2) => {
      if (!this.splitView) {
        return;
      }
      if (collapsed2) {
        const currentSize = this.splitView.getViewSize(paneIndex);
        if (currentSize > headerHeight) {
          savedPaneHeight = currentSize;
        }
        this.splitView.resizeView(paneIndex, headerHeight);
      } else {
        this.splitView.resizeView(paneIndex, savedPaneHeight);
      }
      this.layoutSplitView();
    }));
    this._register(widget.onDidChangeHeight(() => {
      if (!this.splitView) {
        return;
      }
      const visible = widget.visible;
      const isCurrentlyVisible = this.splitView.isViewVisible(paneIndex);
      if (visible !== isCurrentlyVisible) {
        this.splitView.setViewVisible(paneIndex, visible);
        if (visible && !widget.collapsed && !this.sectionPanesUserResized) {
          savedPaneHeight = getPreferredHeight();
          this.splitView.resizeView(paneIndex, savedPaneHeight);
        }
      }
      this.layoutSplitView();
    }));
  }
  setActiveSectionCollapsed(section, collapsed2) {
    const sessionResource = this.changesViewService.activeSessionResourceObs.get();
    if (sessionResource) {
      this.changesViewService.setSectionCollapsed(sessionResource, section, collapsed2);
    }
  }
  getTreeSelection() {
    const selection = this.tree?.getSelection() ?? [];
    return selection.filter((item) => !!item && isChangesFileItem(item));
  }
  getTreeRootInfo(items) {
    if (items.length === 0) {
      return void 0;
    }
    const activeSession = this.sessionsService.activeSession.get();
    const folder = activeSession?.workspace.get()?.folders[0];
    if (!folder) {
      return void 0;
    }
    const workspaceFolderUri = folder.workingDirectory;
    if (workspaceFolderUri.scheme === GITHUB_REMOTE_FILE_SCHEME) {
      const segments = workspaceFolderUri.path.split("/").filter(Boolean);
      return {
        root: {
          type: "root",
          uri: workspaceFolderUri,
          name: `${segments.slice(0, 2).join("/")} (${decodeURIComponent(segments[2])})`
        },
        resourceTreeRootUri: URI.from({ scheme: Schemas.copilotPr, path: "/" })
      };
    }
    const folderLabel = this.workspaceFolderLabelService.getWorkspaceFolderLabel(
      new WorkspaceFolder({ uri: folder.workingDirectory, name: folder.name, index: 0 }),
      true
    ) ?? folder.name;
    return {
      root: {
        type: "root",
        uri: workspaceFolderUri,
        name: folderLabel
      },
      resourceTreeRootUri: workspaceFolderUri
    };
  }
  getSessionDiscardRef() {
    const changeset = this.changesViewService.activeSessionChangesetObs.get();
    return changeset?.originalCheckpointRef.get() ?? "";
  }
  layoutBody(height, width2) {
    super.layoutBody(height, width2);
    this.currentBodyHeight = height;
    this.currentBodyWidth = width2;
    this.layoutSplitView();
  }
  focus() {
    super.focus();
    if (this.tree && this.tree.getNode(null).visibleChildrenCount > 0) {
      this.tree.domFocus();
    }
  }
  renderSidebarList(container2, onDidLayout, contextKeyService, items, openFileItem) {
    const disposables = new DisposableStore();
    container2.classList.add("changes-file-list");
    const viewMode = this.changesViewService.viewModeObs.get();
    container2.classList.toggle("list-mode", viewMode === "list" /* List */);
    const headerNode = append(container2, $124(".changes-sidebar-header"));
    const headerLabel = append(headerNode, $124("span"));
    headerLabel.textContent = localize(4263, null);
    const countBadge = disposables.add(new CountBadge(headerNode, { count: items.length }, defaultCountBadgeStyles));
    countBadge.setCount(items.length);
    const tree = this.createChangesTree(container2, Event2.None, disposables, () => tree.getSelection().filter((item) => !!item && isChangesFileItem(item)), contextKeyService);
    if (viewMode === "tree" /* Tree */) {
      tree.setChildren(null, buildTreeChildren(items, this.getTreeRootInfo(items)));
    } else {
      tree.setChildren(null, items.map((item) => ({ element: item, collapsible: false })));
    }
    let updatingSelection = false;
    disposables.add(tree.onDidOpen((e4) => {
      if (e4.element && isChangesFileItem(e4.element) && !updatingSelection) {
        openFileItem(
          e4.element,
          items,
          e4.sideBySide,
          !!e4.editorOptions.preserveFocus,
          !!e4.editorOptions.pinned,
          false
          /* preserve existing sidebar */
        );
      }
    }));
    disposables.add(Event2.runAndSubscribe(this.editorService.onDidActiveEditorChange, () => {
      const activeEditor = this.editorService.activeEditor;
      if (!activeEditor) {
        return;
      }
      const primaryResource = EditorResourceAccessor.getCanonicalUri(activeEditor, { supportSideBySide: 1 /* PRIMARY */ });
      const secondaryResource = EditorResourceAccessor.getCanonicalUri(activeEditor, { supportSideBySide: 2 /* SECONDARY */ });
      const index2 = items.findIndex(
        (i2) => primaryResource !== void 0 && isEqual2(i2.uri, primaryResource) || secondaryResource !== void 0 && i2.originalUri !== void 0 && isEqual2(i2.originalUri, secondaryResource)
      );
      if (index2 >= 0) {
        updatingSelection = true;
        try {
          tree.setFocus([items[index2]]);
          tree.setSelection([items[index2]]);
          tree.reveal(items[index2]);
        } finally {
          updatingSelection = false;
        }
      }
    }));
    disposables.add(onDidLayout((e4) => {
      const headerHeight = headerNode.offsetHeight;
      tree.layout(Math.max(0, e4.height - headerHeight), e4.width);
    }));
    return disposables;
  }
  createChangesTree(container2, onDidChangeVisibility, disposables, getSelection, contextKeyService) {
    const treeInstantiationService = contextKeyService ? disposables.add(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, contextKeyService]))) : this.instantiationService;
    const resourceLabels = disposables.add(this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility }));
    const actionRunner = disposables.add(new ChangesViewActionRunner(
      () => this.changesViewService.activeSessionResourceObs.get(),
      () => this.getSessionDiscardRef(),
      getSelection ?? (() => this.getTreeSelection())
    ));
    return disposables.add(treeInstantiationService.createInstance(
      WorkbenchCompressibleObjectTree,
      "ChangesViewTree",
      container2,
      new ChangesTreeDelegate(),
      [this.instantiationService.createInstance(
        ChangesTreeRenderer,
        resourceLabels,
        actionRunner,
        () => {
          const activeSession = this.sessionsService.activeSession.get();
          const folder = activeSession?.workspace.get()?.folders[0];
          return folder?.root.scheme === GITHUB_REMOTE_FILE_SCHEME ? URI.from({ scheme: Schemas.copilotPr, path: "/" }) : folder?.workingDirectory;
        }
      )],
      {
        alwaysConsumeMouseWheel: false,
        accessibilityProvider: {
          getAriaLabel: (element) => isChangesFileItem(element) ? basename2(element.uri) : element.name,
          getWidgetAriaLabel: () => localize(4269, null)
        },
        dnd: {
          getDragURI: (element) => element.uri.toString(),
          getDragLabel: (elements) => {
            const uris = elements.map((e4) => e4.uri);
            if (uris.length === 1) {
              return this.labelService.getUriLabel(uris[0], { relative: true });
            }
            return `${uris.length}`;
          },
          dispose: () => {
          },
          onDragOver: () => false,
          drop: () => {
          },
          onDragStart: (data, originalEvent) => {
            try {
              const elements = data.getData();
              const uris = elements.filter(isChangesFileItem).map((e4) => e4.uri);
              this.instantiationService.invokeFunction((accessor) => fillEditorsDragData(accessor, uris, originalEvent));
            } catch {
            }
          }
        },
        identityProvider: {
          getId: (element) => element.uri.toString()
        },
        indent: this.changesViewService.viewModeObs.get() === "list" /* List */ ? 0 : 8,
        compressionEnabled: true,
        sorter: new ChangesTreeSorter(() => this.changesViewService.viewModeObs.get()),
        twistieAdditionalCssClass: (e4) => {
          return this.changesViewService.viewModeObs.get() === "list" /* List */ ? "force-no-twistie" : void 0;
        }
      }
    ));
  }
  async openChanges(resource) {
    const items = this.changesViewService.activeSessionChangesObs.get();
    if (items.length === 0) {
      return;
    }
    if (this.shouldOpenModalDiff()) {
      const changes = toIChangesFileItem(items);
      const changeToOpen = resource ? changes.find((c) => isEqual2(c.uri, resource)) : void 0;
      await this._openFileItem(changeToOpen ?? changes[0], changes, false, false, false, changes.length > 1);
      return;
    }
    await this._openMultiFileDiffEditor(resource);
  }
  /**
   * Renders the files header (Branch Changes dropdown + diff stats) into the panel.
   * Standard layout only; {@link SinglePaneChangesViewPane} overrides this to a no-op
   * because the header lives in the custom Changes editor instead.
   */
  createFilesHeader(contentContainer) {
    this.filesHeaderNode = append(contentContainer, $124(".changes-files-header"));
    const filesHeaderToolbarContainer = append(this.filesHeaderNode, $124(".changes-files-header-toolbar"));
    this._register(this.scopedInstantiationService.createInstance(MenuWorkbenchToolBar, filesHeaderToolbarContainer, MenuId.ChatEditingSessionChangesFileHeaderToolbar, {
      menuOptions: { shouldForwardArgs: true },
      actionViewItemProvider: (action) => {
        if (action.id === "chatEditing.versionsPicker" && action instanceof MenuItemAction) {
          return this.scopedInstantiationService.createInstance(ChangesPickerActionItem, action);
        }
        return void 0;
      }
    }));
    this.fileHeaderToolbarContainer = append(this.filesHeaderNode, $124(".changes-files-header-right-toolbar"));
    this._register(this.scopedInstantiationService.createInstance(MenuWorkbenchToolBar, this.fileHeaderToolbarContainer, MenuId.ChatEditingSessionChangesFileHeaderRightToolbar, {
      menuOptions: { shouldForwardArgs: true },
      actionViewItemProvider: (action, options3) => {
        if (action.id === ChangesDiffStatsAction.ID && action instanceof MenuItemAction) {
          return this.scopedInstantiationService.createInstance(ChangesDiffStatsActionItem, action, options3);
        }
        return void 0;
      }
    }));
  }
  /**
   * Renders the Create-PR actions button bar into the actions container. Standard
   * layout only; {@link SinglePaneChangesViewPane} overrides this to a no-op because
   * the actions render in the Changes editor header instead.
   */
  createActionsButtonBar() {
    if (!this.actionsContainer) {
      return;
    }
    const isAgentHostSessionObs = derived((reader) => {
      const activeSession = this.sessionsService.activeSession.read(reader);
      return activeSession ? isAgentHostProviderId(activeSession.providerId) : false;
    });
    this.renderDisposables.add(autorun((reader) => {
      clearNode(this.actionsContainer);
      const isAgentHostSession2 = isAgentHostSessionObs.read(reader);
      const widget = isAgentHostSession2 ? this.scopedInstantiationService.createInstance(ChangesWorkbenchButtonBarWidget, this.actionsContainer) : this.scopedInstantiationService.createInstance(ChangesMenuWorkbenchButtonBarWidget, this.actionsContainer, this.hasGitOperationInProgressObs);
      reader.store.add(widget);
    }));
  }
  /**
   * Whether the actions container should be shown for the given session state.
   * Standard layout shows it for non-untitled sessions; {@link SinglePaneChangesViewPane}
   * never shows it (the actions live in the Changes editor).
   */
  isActionsContainerVisible(isUntitled) {
    return !isUntitled;
  }
  /**
   * Whether clicking a file opens the modal single-file diff. {@link SinglePaneChangesViewPane}
   * never uses the modal editor.
   */
  shouldOpenModalDiff() {
    return this.configurationService.getValue("workbench.editor.useModal") === "all";
  }
  /**
   * Whether clicking a file opens a single-file diff by default (vs the
   * multi-file diff editor). Alt inverts this.
   */
  shouldOpenSingleFileDiffByDefault() {
    return this.configurationService.getValue(SESSIONS_CHANGES_OPEN_SINGLE_FILE_DIFF_SETTING);
  }
  /**
   * Reveal the CI checks section: expand it if collapsed and move keyboard
   * focus into it. No-op when there are no checks to show.
   */
  revealChecks() {
    if (!this.ciStatusWidget || !this.ciStatusWidget.visible) {
      return;
    }
    this.ciStatusWidget.expand();
    this.ciStatusWidget.focus();
  }
  async _openFileItem(item, items, sideBySide, preserveFocus, pinned, includeSidebar) {
    const { uri: modifiedFileUri, originalUri, isDeletion: isDeletion3 } = item;
    const currentIndex = items.indexOf(item);
    const sidebar = includeSidebar ? {
      render: (container2, onDidLayout, contextKeyService) => {
        return this.renderSidebarList(container2, onDidLayout, contextKeyService, items, this._openFileItem.bind(this));
      }
    } : void 0;
    const navigation = {
      total: items.length,
      current: currentIndex,
      navigate: (index2) => {
        const target = items[index2];
        if (target) {
          this._openFileItem(target, items, false, false, false, includeSidebar);
        }
      }
    };
    const group2 = sideBySide ? SIDE_GROUP : ACTIVE_GROUP;
    const labels = getChangesEditorLabels(item.uri, this.labelService);
    if (isDeletion3 && originalUri) {
      this.editorService.openEditor({
        resource: originalUri,
        ...labels,
        options: { preserveFocus, pinned, modal: { sidebar, navigation } }
      }, group2);
      return;
    }
    if (originalUri) {
      this.editorService.openEditor({
        original: { resource: originalUri },
        modified: { resource: modifiedFileUri },
        ...labels,
        options: { preserveFocus, pinned, modal: { sidebar, navigation } }
      }, group2);
      return;
    }
    this.editorService.openEditor({
      resource: modifiedFileUri,
      ...labels,
      options: { preserveFocus, pinned, modal: { sidebar, navigation } }
    }, group2);
  }
  async _openSingleFileDiffEditor(item, sideBySide, preserveFocus, pinned) {
    const { uri: uri4, originalUri, isDeletion: isDeletion3 } = item;
    const group2 = sideBySide ? SIDE_GROUP : ACTIVE_GROUP;
    const labels = getChangesEditorLabels(uri4, this.labelService);
    const modifiedUri = isDeletion3 ? void 0 : uri4;
    const pane = await this.editorService.openEditor({
      original: { resource: originalUri },
      modified: { resource: modifiedUri },
      ...labels,
      options: { preserveFocus, pinned }
    }, group2);
    const control = pane?.getControl();
    if (pane && isDiffEditor(control)) {
      const openedInput = pane.input;
      control.updateOptions({ hideUnchangedRegions: { enabled: false } });
      const listener = pane.group.onDidActiveEditorChange(() => {
        if (pane.group.activeEditor === openedInput) {
          return;
        }
        listener.dispose();
        control.updateOptions({ hideUnchangedRegions: { enabled: this.configurationService.getValue("diffEditor.hideUnchangedRegions.enabled") } });
      });
      this._register(listener);
    }
  }
  async _openMultiFileDiffEditor(reveal) {
    const sessionResource = this.changesViewService.activeSessionResourceObs.get();
    const changes = this.changesViewService.activeSessionChangesObs.get();
    if (!sessionResource || changes.length === 0) {
      return;
    }
    this.workbenchLayoutService.revealEditorPartExplicitly();
    let options3;
    if (reveal) {
      const target = changes.find((c) => isChangesFileResource(c, reveal));
      if (target) {
        options3 = {
          viewState: {
            revealData: {
              resource: {
                original: target.originalUri,
                modified: target.modifiedUri
              }
            }
          }
        };
      }
    }
    await this.sessionChangesService.openChangesEditor(sessionResource, options3);
  }
  dispose() {
    this.tree = void 0;
    super.dispose();
  }
};

ChangesViewPane = __decorateClass([
  __decorateParam(1, IKeybindingService),
  __decorateParam(2, IContextMenuService),
  __decorateParam(3, IConfigurationService),
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IViewDescriptorService),
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IOpenerService),
  __decorateParam(8, IThemeService),
  __decorateParam(9, IHoverService),
  __decorateParam(10, IChangesViewService),
  __decorateParam(11, IEditorService),
  __decorateParam(12, ISessionsService),
  __decorateParam(13, ILabelService),
  __decorateParam(14, ILogService),
  __decorateParam(15, ITelemetryService),
  __decorateParam(16, ISessionChangesService),
  __decorateParam(17, IWorkbenchLayoutService),
  __decorateParam(18, IWorkspaceFolderLabelService)
], ChangesViewPane);

var SinglePaneChangesViewPane = class extends ChangesViewPane {
  createFilesHeader(_contentContainer) {
  }
  createActionsButtonBar() {
  }
  isActionsContainerVisible(_isUntitled) {
    return false;
  }
  shouldOpenModalDiff() {
    return false;
  }
};

var ChangesViewPaneContainer = class extends ViewPaneContainer {
  constructor(layoutService, telemetryService, instantiationService, contextMenuService, themeService, storageService, configurationService, extensionService, contextService, viewDescriptorService, logService) {
    super(CHANGES_VIEW_CONTAINER_ID, { mergeViewWithContainerWhenSingleView: true }, instantiationService, configurationService, layoutService, contextMenuService, telemetryService, extensionService, themeService, storageService, contextService, viewDescriptorService, logService);
  }
  create(parent) {
    super.create(parent);
    parent.classList.add("changes-viewlet");
  }
};

ChangesViewPaneContainer = __decorateClass([
  __decorateParam(0, IWorkbenchLayoutService),
  __decorateParam(1, ITelemetryService),
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, IContextMenuService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, IConfigurationService),
  __decorateParam(7, IExtensionService),
  __decorateParam(8, IWorkspaceContextService),
  __decorateParam(9, IViewDescriptorService),
  __decorateParam(10, ILogService)
], ChangesViewPaneContainer);

var ChangesViewActionRunner = class extends ActionRunner {
  constructor(getSessionResource, getSessionDiscardRef, getSelectedFileItems) {
    super();
    this.getSessionResource = getSessionResource;
    this.getSessionDiscardRef = getSessionDiscardRef;
    this.getSelectedFileItems = getSelectedFileItems;
  }
  async runAction(action, context2) {
    if (!(action instanceof MenuItemAction)) {
      return super.runAction(action, context2);
    }
    const sessionResource = this.getSessionResource();
    const discardRef = this.getSessionDiscardRef();
    const selection = this.getSelectedFileItems();
    const contextIsSelected = selection.some((s) => s === context2);
    const actualContext = contextIsSelected ? selection : [context2];
    const args2 = actualContext.map((e4) => {
      if (ResourceTree.isResourceNode(e4)) {
        return ResourceTree.collect(e4);
      }
      return isChangesFileItem(e4) ? [e4] : [];
    }).flat();
    await action.run(sessionResource, discardRef, ...args2.map((item) => item.uri));
  }
};

var ChangesTreeDelegate = class _ChangesTreeDelegate {
  static {
    this.ROW_HEIGHT = 22;
  }
  getHeight(_element) {
    return _ChangesTreeDelegate.ROW_HEIGHT;
  }
  getTemplateId(_element) {
    return ChangesTreeRenderer.TEMPLATE_ID;
  }
};

var ChangesTreeSorter = class {
  constructor(viewMode) {
    this.viewMode = viewMode;
  }
  compare(a, b) {
    if (this.viewMode() === "list" /* List */) {
      const aPath = a.uri.fsPath;
      const bPath = b.uri.fsPath;
      return comparePaths(aPath, bPath);
    }
    const aIsDirectory = ResourceTree.isResourceNode(a);
    const bIsDirectory = ResourceTree.isResourceNode(b);
    if (aIsDirectory !== bIsDirectory) {
      return aIsDirectory ? -1 : 1;
    }
    const aName = ResourceTree.isResourceNode(a) ? a.name : basename2(a.uri);
    const bName = ResourceTree.isResourceNode(b) ? b.name : basename2(b.uri);
    return compareFileNames(aName, bName);
  }
};

var SetChangesListViewModeAction = class extends ViewAction {
  constructor() {
    super({
      id: "workbench.changesView.action.setListViewMode",
      title: localize(4272, null),
      viewId: CHANGES_VIEW_ID,
      f1: false,
      icon: Codicon.listFlat,
      toggled: ChangesContextKeys.ViewMode.isEqualTo("list" /* List */),
      menu: {
        id: MenuId.ChatEditingSessionTitleToolbar,
        group: "1_viewmode",
        order: 1
      }
    });
  }
  async runInView(accessor, _view) {
    logChangesViewViewModeChange(accessor.get(ITelemetryService), "list" /* List */);
    accessor.get(IChangesViewService).setViewMode("list" /* List */);
  }
};

var SetChangesTreeViewModeAction = class extends ViewAction {
  constructor() {
    super({
      id: "workbench.changesView.action.setTreeViewMode",
      title: localize(4273, null),
      viewId: CHANGES_VIEW_ID,
      f1: false,
      icon: Codicon.listTree,
      toggled: ChangesContextKeys.ViewMode.isEqualTo("tree" /* Tree */),
      menu: {
        id: MenuId.ChatEditingSessionTitleToolbar,
        group: "1_viewmode",
        order: 2
      }
    });
  }
  async runInView(accessor, _view) {
    logChangesViewViewModeChange(accessor.get(ITelemetryService), "tree" /* Tree */);
    accessor.get(IChangesViewService).setViewMode("tree" /* Tree */);
  }
};

registerAction2(SetChangesListViewModeAction);

registerAction2(SetChangesTreeViewModeAction);

var VersionsPickerAction = class _VersionsPickerAction extends Action2 {
  static {
    this.ID = "chatEditing.versionsPicker";
  }
  constructor() {
    super({
      id: _VersionsPickerAction.ID,
      title: localize2(4270, "Versions"),
      category: CHAT_CATEGORY,
      icon: Codicon.listFilter,
      f1: false,
      menu: [{
        id: MenuId.ChatEditingSessionChangesFileHeaderToolbar,
        group: "navigation",
        order: 9,
        when: ActiveSessionContextKeys.HasGitRepository
      }, {
        id: Menus.SessionsEditorHeaderPrimary,
        group: "navigation",
        order: 1,
        when: ContextKeyExpr.and(singlePaneChangesEditorHeader, ActiveSessionContextKeys.HasGitRepository)
      }]
    });
  }
  async run() {
  }
};

registerAction2(VersionsPickerAction);

var ChangesPickerActionItem = class extends ActionWidgetDropdownActionViewItem {
  constructor(action, actionWidgetService, keybindingService, contextKeyService, changesViewService, telemetryService) {
    const actionProvider = {
      getActions: () => {
        const changesets = changesViewService.activeSessionChangesetsObs.get() ?? [];
        const selectedChangeset = changesViewService.activeSessionChangesetObs.get();
        return changesets.map((changeset) => ({
          ...action,
          id: `agents.changes.changeset.${changeset.id}`,
          label: changeset.label,
          detail: changeset.description,
          checked: selectedChangeset?.id === changeset.id,
          category: {
            label: changeset.category ?? "",
            showHeader: false,
            order: 0
          },
          enabled: changeset.isEnabled.get(),
          run: async () => {
            changesViewService.setChangesetId(changeset.id);
            logChangesViewVersionModeChange(this.telemetryService, changeset.id);
          }
        }));
      }
    };
    super(action, { actionProvider, listOptions: { detailItemHeight: 44 } }, actionWidgetService, keybindingService, contextKeyService, telemetryService);
    this.changesViewService = changesViewService;
    this.telemetryService = telemetryService;
    this._register(autorun((reader) => {
      changesViewService.activeSessionChangesetObs.read(reader);
      if (this.element) {
        this.renderLabel(this.element);
      }
    }));
  }
  render(container2) {
    super.render(container2);
    container2.classList.add("changes-picker-action-rich");
  }
  renderLabel(element) {
    const changeset = this.changesViewService.activeSessionChangesetObs.get();
    if (!changeset) {
      return null;
    }
    reset(element, $("span", void 0, changeset.label), ...renderLabelWithIcons("$(chevron-down)"));
    this.updateAriaLabel();
    return null;
  }
};

ChangesPickerActionItem = __decorateClass([
  __decorateParam(1, IActionWidgetService),
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IContextKeyService),
  __decorateParam(4, IChangesViewService),
  __decorateParam(5, ITelemetryService)
], ChangesPickerActionItem);

var ChangesDiffStatsAction = class _ChangesDiffStatsAction extends Action2 {
  static {
    this.ID = "workbench.changesView.action.viewChanges";
  }
  constructor() {
    super({
      id: _ChangesDiffStatsAction.ID,
      title: localize2(4268, "View All Changes"),
      f1: false,
      menu: [{
        id: MenuId.ChatEditingSessionChangesFileHeaderRightToolbar,
        group: "navigation",
        order: 1,
        when: ChatContextKeys.hasAgentSessionChanges
      }, {
        id: Menus.SessionsEditorHeaderPrimary,
        group: "navigation",
        order: 2,
        when: ContextKeyExpr.and(singlePaneChangesEditorHeader, ChatContextKeys.hasAgentSessionChanges)
      }]
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = viewsService.getViewWithId(CHANGES_VIEW_ID);
    await view?.openChanges();
  }
};

registerAction2(ChangesDiffStatsAction);

var RevealCIChecksAction = class _RevealCIChecksAction extends Action2 {
  static {
    this.ID = REVEAL_CI_CHECKS_COMMAND_ID;
  }
  constructor() {
    super({
      id: _RevealCIChecksAction.ID,
      title: localize2(4271, "Reveal Checks"),
      category: CHAT_CATEGORY,
      f1: false
    });
  }
  async run(accessor) {
    const viewsService = accessor.get(IViewsService);
    const view = await viewsService.openView(CHANGES_VIEW_ID, true);
    view?.revealChecks();
  }
};

registerAction2(RevealCIChecksAction);

var ChangesDiffStatsActionItem = class extends ActionViewItem {
  constructor(action, options3, instantiationService) {
    super(null, action, { ...options3, icon: false, label: false });
    this._widget = this._register(instantiationService.createInstance(ChangesSummaryWidget));
    this._register(autorun((reader) => {
      const changesSummary = this._widget.summary.read(reader);
      if (changesSummary === void 0) {
        return;
      }
      this.updateTooltip();
    }));
  }
  render(container2) {
    super.render(container2);
    container2.classList.add("changes-diff-stats-action");
    if (!this.label) {
      return;
    }
    this.renderLabelContents(this.label);
  }
  /**
   * Renders the diff-stats content into the action label. The base shows the
   * animated +/- summary; {@link SinglePaneChangesDiffStatsActionItem} overrides
   * this to a richer "N files +X -Y" label for the single-pane editor header.
   */
  renderLabelContents(label3) {
    this._widget.render(label3);
  }
  getTooltip() {
    const changesSummary = this._widget.summary.get();
    if (changesSummary === void 0) {
      return void 0;
    }
    const { files, additions, deletions } = changesSummary;
    return localize(4266, null, files, additions, deletions);
  }
};

ChangesDiffStatsActionItem = __decorateClass([
  __decorateParam(2, IInstantiationService)
], ChangesDiffStatsActionItem);

var SinglePaneChangesDiffStatsActionItem = class extends ChangesDiffStatsActionItem {
  render(container2) {
    super.render(container2);
    container2.classList.add("changes-diff-stats-action-rich");
  }
  renderLabelContents(label3) {
    this._register(autorun((reader) => {
      const summary = this._widget.summary.read(reader);
      if (summary === void 0) {
        return;
      }
      const { files, additions, deletions } = summary;
      const filesLabel = files === 1 ? localize(4264, null) : localize(4265, null, files);
      reset(
        label3,
        $("span.changes-diff-stats-files", void 0, filesLabel),
        $("span.working-set-lines-added", void 0, `+${additions}`),
        $("span.working-set-lines-removed", void 0, `-${deletions}`)
      );
    }));
  }
};
export { unlockChatPetCreatePullRequestAchievement, $124, RUN_SESSION_CODE_REVIEW_ACTION_ID, VERSIONS_PICKER_ACTION_ID, DIFF_STATS_ACTION_ID, singlePaneChangesEditorHeader, EMPTY_FILE_CHANGES_MIN_HEIGHT, CHAT_PET_CREATE_PULL_REQUEST_ACTION_IDS, TREE_PANE_LIST_BOTTOM_PADDING, TREE_PANE_MIN_VISIBLE_ROWS, ChangesMenuWorkbenchButtonBarWidget, CHANGES_OPERATIONS_DROPDOWN_PRIMARY_GROUP, ChangesWorkbenchButtonBarWidget, ChangesActionsBar, CHANGES_HEADER_ACTIONS_ID, ChangesActionsBarActionViewItem, ChangesActionViewItemsContribution, ChangesViewPane, SinglePaneChangesViewPane, ChangesViewPaneContainer, ChangesViewActionRunner, ChangesTreeDelegate, ChangesTreeSorter, SetChangesListViewModeAction, SetChangesTreeViewModeAction, VersionsPickerAction, ChangesPickerActionItem, ChangesDiffStatsAction, RevealCIChecksAction, ChangesDiffStatsActionItem, SinglePaneChangesDiffStatsActionItem };
