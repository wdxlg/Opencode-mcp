// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/chat/browser/runScriptAction.ts
import { Action2, MenuId, MenuRegistry, SubmenuItemAction, registerAction2 } from "./module-0092.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { derivedOpts } from "./module-0054.mjs";
import { equals } from "./module-0007.mjs";
import { Menus } from "./module-3437.mjs";
import { SessionsCategories } from "./module-3532.mjs";
import { logSessionsInteraction } from "./module-1781.mjs";
import { autorun } from "./module-0052.mjs";
import { ContextKeyExpr, IContextKeyService } from "./module-0089.mjs";
import { SessionWorkspaceIsVirtualContext, SessionsWelcomeVisibleContext } from "./module-1770.mjs";
import { RunScriptCustomTaskWidget } from "./module-3535.mjs";
import { $, EventType, addDisposableGenericMouseDownListener, addDisposableListener, append } from "./module-0075.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ISessionsManagementService } from "./module-1766.mjs";
import { ISessionsService } from "./module-1783.mjs";
import { IKeybindingService } from "./module-0352.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { ISessionsTasksService } from "./module-3534.mjs";
import { IActionViewItemService } from "./module-0518.mjs";
import { IWorkbenchLayoutService } from "./module-1119.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IChatWidgetService } from "./module-0982.mjs";
import { ICommandService } from "./module-0087.mjs";
import { ActionViewItem, BaseActionViewItem } from "./module-0476.mjs";
import { Action } from "./module-0082.mjs";
import { StandardKeyboardEvent } from "./module-0022.mjs";
import { IActionWidgetService } from "./module-0553.mjs";
import { ActionWidgetDropdownActionViewItem } from "./module-2053.mjs";
import { IsAuxiliaryWindowContext } from "./module-0950.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";


// src/vs/sessions/contrib/chat/browser/runScriptAction.ts
var RunScriptDropdownMenuId = MenuId.for("AgentSessionsRunScriptDropdown");

var RUN_SCRIPT_ACTION_MODAL_VISIBLE_CLASS = "run-script-action-modal-visible";

var RUN_SCRIPT_ACTION_PRIMARY_ID = "workbench.action.agentSessions.runScriptPrimary";

var CONFIGURE_DEFAULT_RUN_ACTION_ID = "workbench.action.agentSessions.configureDefaultRunAction";

var GENERATE_RUN_ACTION_ID = "workbench.action.agentSessions.generateRunAction";

var closeQuickWidgetButton = {
  iconClass: ThemeIcon.asClassName(Codicon.close),
  tooltip: localize(4518, null),
  alwaysVisible: true
};

function getTaskDisplayLabel(task) {
  if (task.label && task.label.length > 0) {
    return task.label;
  }
  if (task.script && task.script.length > 0) {
    return task.script;
  }
  if (task.command && task.command.length > 0) {
    return task.command;
  }
  if (task.task && task.task.toString().length > 0) {
    return task.task.toString();
  }
  return "";
}

function getTaskCommandPreview(task) {
  if (task.command && task.command.length > 0) {
    return task.command;
  }
  if (task.script && task.script.length > 0) {
    return localize(4537, null, task.script);
  }
  if (task.task && task.task.toString().length > 0) {
    return task.task.toString();
  }
  return getTaskDisplayLabel(task);
}

function formatBrowserUrlDescription(url, maxLength) {
  if (!url) {
    return void 0;
  }
  const stripped = url.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  if (stripped.length <= maxLength) {
    return stripped;
  }
  return `${stripped.substring(0, maxLength - 3)}...`;
}

function getPrimaryTask(tasks2, pinnedTaskLabel) {
  if (tasks2.length === 0) {
    return void 0;
  }
  if (pinnedTaskLabel) {
    const pinnedTask = tasks2.find((task) => task.task.label === pinnedTaskLabel);
    if (pinnedTask) {
      return pinnedTask;
    }
  }
  return tasks2[0];
}

var RunScriptContribution = class extends Disposable {
  constructor(_sessionManagementService, _sessionsService, _keybindingService, _quickInputService, _sessionsConfigService, _actionViewItemService, _layoutService, _telemetryService, _chatWidgetService, _commandService) {
    super();
    this._sessionManagementService = _sessionManagementService;
    this._sessionsService = _sessionsService;
    this._quickInputService = _quickInputService;
    this._sessionsConfigService = _sessionsConfigService;
    this._actionViewItemService = _actionViewItemService;
    this._layoutService = _layoutService;
    this._telemetryService = _telemetryService;
    this._chatWidgetService = _chatWidgetService;
    this._commandService = _commandService;
    this._activeRunState = derivedOpts({
      owner: this,
      equalsFn: (a, b) => {
        if (a === b) {
          return true;
        }
        if (!a || !b) {
          return false;
        }
        return a.session === b.session && a.pinnedTaskLabel === b.pinnedTaskLabel && a.browserUrl === b.browserUrl && a.pinnedBrowser === b.pinnedBrowser && equals(a.tasks, b.tasks, (t1, t2) => t1.task.label === t2.task.label && t1.task.command === t2.task.command && t1.target === t2.target && t1.task.runOptions?.runOn === t2.task.runOptions?.runOn);
      }
    }, (reader) => {
      const activeSession = this._sessionsService.activeSession.read(reader);
      if (!activeSession) {
        return void 0;
      }
      const tasks2 = this._sessionsConfigService.getSessionTasks(activeSession).read(reader);
      const folder = activeSession.workspace.read(reader)?.folders[0];
      const pinnedTaskLabel = this._sessionsConfigService.getPinnedTaskLabel(folder?.root).read(reader);
      const browserUrl = this._sessionsConfigService.getBrowserUrl(folder?.root).read(reader);
      const pinnedBrowser = this._sessionsConfigService.getPinnedBrowser(folder?.root).read(reader);
      return { session: activeSession, tasks: tasks2, pinnedTaskLabel, browserUrl, pinnedBrowser };
    }).recomputeInitiallyAndOnChange(this._store);
    this._registerActionViewItemProvider();
    this._registerActions();
  }
  static {
    this.ID = "workbench.contrib.agentSessions.runScript";
  }
  _registerActionViewItemProvider() {
    const that = this;
    this._register(this._actionViewItemService.register(
      Menus.TitleBarCenterRight,
      RunScriptDropdownMenuId,
      (action, options3, instantiationService) => {
        if (!(action instanceof SubmenuItemAction)) {
          return void 0;
        }
        return instantiationService.createInstance(
          RunScriptActionViewItem,
          action,
          options3,
          that._activeRunState,
          (session) => that._showConfigureQuickPick(session),
          (session, existingTask, mode) => that._showCustomCommandInput(session, existingTask, mode),
          (session) => that._generateNewTask(session),
          (session) => that._configureBrowserUrl(session)
        );
      }
    ));
  }
  _registerActions() {
    const that = this;
    this._register(registerAction2(class extends Action2 {
      constructor() {
        super({
          id: RUN_SCRIPT_ACTION_PRIMARY_ID,
          title: { value: localize(4551, null), original: "Run Primary Task" },
          icon: Codicon.play,
          category: SessionsCategories.Sessions,
          f1: true
        });
      }
      async run() {
        const activeState = that._activeRunState.get();
        if (!activeState) {
          return;
        }
        logSessionsInteraction(that._telemetryService, "runPrimaryTask");
        const { tasks: tasks2, session, pinnedBrowser, browserUrl } = activeState;
        if (pinnedBrowser) {
          await that._commandService.executeCommand("simpleBrowser.show", browserUrl);
          return;
        }
        if (tasks2.length === 0) {
          const task = await that._showConfigureQuickPick(session);
          if (task) {
            await that._sessionsConfigService.runTask(task, session);
          }
          return;
        }
        const primaryTask = getPrimaryTask(tasks2, activeState.pinnedTaskLabel);
        if (!primaryTask) {
          return;
        }
        await that._sessionsConfigService.runTask(primaryTask.task, session);
      }
    }));
    this._register(autorun((reader) => {
      const activeState = this._activeRunState.read(reader);
      if (!activeState) {
        return;
      }
      const { session, tasks: tasks2 } = activeState;
      const folder = session.workspace.read(reader)?.folders[0];
      const configureScriptPrecondition = folder?.workingDirectory ? ContextKeyExpr.true() : ContextKeyExpr.false();
      reader.store.add(registerAction2(class extends Action2 {
        constructor() {
          super({
            id: CONFIGURE_DEFAULT_RUN_ACTION_ID,
            title: localize2(4524, "Add Task..."),
            category: SessionsCategories.Sessions,
            icon: Codicon.add,
            precondition: configureScriptPrecondition,
            menu: [{
              id: RunScriptDropdownMenuId,
              group: tasks2.length === 0 ? "navigation" : "1_configure",
              order: 0
            }]
          });
        }
        async run() {
          logSessionsInteraction(that._telemetryService, "addTask", "menu");
          const task = await that._showConfigureQuickPick(session);
          if (task) {
            await that._sessionsConfigService.runTask(task, session);
          }
        }
      }));
      reader.store.add(registerAction2(class extends Action2 {
        constructor() {
          super({
            id: GENERATE_RUN_ACTION_ID,
            title: localize2(4534, "Generate New Task..."),
            category: SessionsCategories.Sessions,
            precondition: SessionWorkspaceIsVirtualContext.toNegated(),
            menu: [{
              id: RunScriptDropdownMenuId,
              group: tasks2.length === 0 ? "navigation" : "1_configure",
              order: 1
            }]
          });
        }
        async run() {
          logSessionsInteraction(that._telemetryService, "generateNewTask", "menu");
          await that._generateNewTask(session);
        }
      }));
    }));
  }
  async _generateNewTask(session) {
    const query = "/generate-run-commands";
    const widget = this._chatWidgetService.getWidgetBySessionResource(session.mainChat.get().resource);
    if (widget) {
      await widget.acceptInput(query);
    } else {
      await this._sessionManagementService.sendNewChatRequest(session, { query });
    }
  }
  async _configureBrowserUrl(session) {
    const folder = session.workspace.get()?.folders[0];
    if (!folder?.root) {
      return;
    }
    const currentUrl = this._sessionsConfigService.getBrowserUrl(folder.root).get();
    const url = await this._quickInputService.input({
      title: localize(4523, null),
      prompt: localize(4522, null),
      placeHolder: "https://example.com",
      value: currentUrl ?? "",
      ignoreFocusLost: true
    });
    if (url === void 0) {
      return;
    }
    this._sessionsConfigService.setBrowserUrl(folder.root, url);
  }
  async _showConfigureQuickPick(session) {
    const nonSessionTasks = await this._sessionsConfigService.getNonSessionTasks(session);
    if (nonSessionTasks.length === 0) {
      return this._showCustomCommandInput(session);
    }
    const items = [];
    items.push({ type: "separator", label: localize(4528, null) });
    items.push({
      label: localize(4527, null),
      description: localize(4529, null)
    });
    if (nonSessionTasks.length > 0) {
      items.push({ type: "separator", label: localize(4532, null) });
      for (const { task, target } of nonSessionTasks) {
        items.push({
          label: getTaskDisplayLabel(task),
          description: task.command,
          task,
          source: target
        });
      }
    }
    const picked = await this._quickInputService.pick(items, {
      placeHolder: localize(4541, null)
    });
    if (!picked) {
      return void 0;
    }
    const pickedItem = picked;
    if (pickedItem.task) {
      return this._showCustomCommandInput(session, { task: pickedItem.task, target: pickedItem.source ?? "workspace" }, "add", true);
    } else {
      return this._showCustomCommandInput(session, void 0, "add", true);
    }
  }
  async _showCustomCommandInput(session, existingTask, mode = "add", allowBackNavigation = false) {
    const taskConfiguration2 = await this._showCustomCommandWidget(session, existingTask, mode, allowBackNavigation);
    if (!taskConfiguration2) {
      return void 0;
    }
    if (taskConfiguration2 === "back") {
      return this._showConfigureQuickPick(session);
    }
    if (existingTask) {
      if (mode === "configure") {
        const newLabel = taskConfiguration2.label?.trim() || existingTask.task.label || taskConfiguration2.command;
        let updatedTask = {
          ...existingTask.task,
          label: newLabel,
          inAgents: true
        };
        if (taskConfiguration2.command && existingTask.task.command !== void 0) {
          updatedTask = {
            ...updatedTask,
            command: taskConfiguration2.command
          };
        }
        if (taskConfiguration2.runOn) {
          updatedTask = {
            ...updatedTask,
            runOptions: {
              ...existingTask.task.runOptions ?? {},
              runOn: taskConfiguration2.runOn
            }
          };
        }
        await this._sessionsConfigService.updateTask(existingTask.task.label, updatedTask, session, existingTask.target, taskConfiguration2.target);
        return updatedTask;
      }
      await this._sessionsConfigService.addTaskToSessions(existingTask.task, session, existingTask.target, { runOn: taskConfiguration2.runOn ?? "default" });
      return {
        ...existingTask.task,
        inAgents: true,
        ...taskConfiguration2.runOn ? { runOptions: { runOn: taskConfiguration2.runOn } } : {}
      };
    }
    return this._sessionsConfigService.createAndAddTask(
      taskConfiguration2.label,
      taskConfiguration2.command,
      session,
      taskConfiguration2.target,
      taskConfiguration2.runOn ? { runOn: taskConfiguration2.runOn } : void 0
    );
  }
  _showCustomCommandWidget(session, existingTask, mode = "add", allowBackNavigation = false) {
    const folder = session.workspace.get()?.folders[0];
    const workspaceTargetDisabledReason = !(folder?.workingDirectory ?? folder?.root) ? localize(4559, null) : void 0;
    const isConfigureMode = mode === "configure";
    return new Promise((resolve3) => {
      const disposables = new DisposableStore();
      let settled = false;
      const quickWidget = disposables.add(this._quickInputService.createQuickWidget());
      quickWidget.title = isConfigureMode ? localize(4520, null) : existingTask ? localize(4516, null) : localize(4514, null);
      quickWidget.description = isConfigureMode ? localize(4519, null) : existingTask ? localize(4515, null) : localize(4513, null);
      quickWidget.ignoreFocusOut = true;
      quickWidget.buttons = allowBackNavigation ? [this._quickInputService.backButton, closeQuickWidgetButton] : [closeQuickWidgetButton];
      const widget = disposables.add(new RunScriptCustomTaskWidget({
        label: existingTask?.task.label,
        labelDisabledReason: existingTask && !isConfigureMode ? localize(4531, null) : void 0,
        command: existingTask ? getTaskCommandPreview(existingTask.task) : void 0,
        commandDisabledReason: existingTask && !isConfigureMode ? localize(4530, null) : void 0,
        target: existingTask?.target,
        targetDisabledReason: existingTask && !isConfigureMode ? localize(4533, null) : workspaceTargetDisabledReason,
        runOn: existingTask?.task.runOptions?.runOn === "worktreeCreated" ? "worktreeCreated" : void 0,
        mode: isConfigureMode ? "configure" : existingTask ? "add-existing" : "add"
      }));
      quickWidget.widget = widget.domNode;
      this._layoutService.mainContainer.classList.add(RUN_SCRIPT_ACTION_MODAL_VISIBLE_CLASS);
      const backdrop = append(this._layoutService.mainContainer, $(".run-script-action-modal-backdrop"));
      disposables.add(addDisposableGenericMouseDownListener(backdrop, (e4) => {
        e4.preventDefault();
        e4.stopPropagation();
        complete(void 0);
      }));
      disposables.add({ dispose: () => backdrop.remove() });
      disposables.add({ dispose: () => this._layoutService.mainContainer.classList.remove(RUN_SCRIPT_ACTION_MODAL_VISIBLE_CLASS) });
      const complete = (result) => {
        if (settled) {
          return;
        }
        settled = true;
        resolve3(result);
        quickWidget.hide();
      };
      disposables.add(widget.onDidSubmit((result) => complete(result)));
      disposables.add(widget.onDidCancel(() => complete(void 0)));
      disposables.add(quickWidget.onDidTriggerButton((button) => {
        if (allowBackNavigation && button === this._quickInputService.backButton) {
          settled = true;
          resolve3("back");
          quickWidget.hide();
          return;
        }
        if (button === closeQuickWidgetButton) {
          complete(void 0);
        }
      }));
      disposables.add(quickWidget.onDidHide(() => {
        if (!settled) {
          settled = true;
          resolve3(void 0);
        }
        disposables.dispose();
      }));
      quickWidget.show();
      widget.focus();
    });
  }
};

RunScriptContribution = __decorateClass([
  __decorateParam(0, ISessionsManagementService),
  __decorateParam(1, ISessionsService),
  __decorateParam(2, IKeybindingService),
  __decorateParam(3, IQuickInputService),
  __decorateParam(4, ISessionsTasksService),
  __decorateParam(5, IActionViewItemService),
  __decorateParam(6, IWorkbenchLayoutService),
  __decorateParam(7, ITelemetryService),
  __decorateParam(8, IChatWidgetService),
  __decorateParam(9, ICommandService)
], RunScriptContribution);

var RunScriptActionViewItem = class extends BaseActionViewItem {
  constructor(action, _options, _activeRunState, _showConfigureQuickPick, _showCustomCommandInput, _generateNewTask, _configureBrowserUrl, _commandService, _sessionsConfigService, _keybindingService, _actionWidgetService, contextKeyService, _telemetryService) {
    super(void 0, action);
    this._activeRunState = _activeRunState;
    this._showConfigureQuickPick = _showConfigureQuickPick;
    this._showCustomCommandInput = _showCustomCommandInput;
    this._generateNewTask = _generateNewTask;
    this._configureBrowserUrl = _configureBrowserUrl;
    this._commandService = _commandService;
    this._sessionsConfigService = _sessionsConfigService;
    this._keybindingService = _keybindingService;
    this._actionWidgetService = _actionWidgetService;
    this._telemetryService = _telemetryService;
    const state = this._activeRunState.get();
    const isPrimaryEnabled = !!state && (state.tasks.length > 0 || state.pinnedBrowser);
    this._primaryActionAction = this._register(new Action(
      "agentSessions.runScriptPrimary",
      this._getPrimaryActionTooltip(state),
      ThemeIcon.asClassName(Codicon.play),
      isPrimaryEnabled,
      () => this._commandService.executeCommand(RUN_SCRIPT_ACTION_PRIMARY_ID)
    ));
    this._primaryAction = this._register(new ActionViewItem(void 0, this._primaryActionAction, { icon: true, label: false }));
    this._register(autorun((reader) => {
      const runState = this._activeRunState.read(reader);
      this._primaryActionAction.enabled = !!runState && (runState.tasks.length > 0 || runState.pinnedBrowser);
      this._primaryActionAction.label = this._getPrimaryActionTooltip(runState);
    }));
    const dropdownAction = this._register(new Action("agentSessions.runScriptDropdown", localize(4550, null)));
    this._dropdown = this._register(new ChevronActionWidgetDropdown2(
      dropdownAction,
      {
        actionProvider: { getActions: () => this._getDropdownActions() },
        showItemKeybindings: true,
        listOptions: { className: "compact-icons" }
      },
      this._actionWidgetService,
      this._keybindingService,
      contextKeyService,
      this._telemetryService
    ));
  }
  render(container2) {
    super.render(container2);
    container2.classList.add("monaco-dropdown-with-default");
    const primaryContainer = $(".action-container");
    this._primaryAction.render(append(container2, primaryContainer));
    this._register(addDisposableListener(primaryContainer, EventType.KEY_DOWN, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      if (event.equals(17 /* RightArrow */)) {
        this._primaryAction.blur();
        this._dropdown.focus();
        event.stopPropagation();
      }
    }));
    const dropdownContainer = $(".dropdown-action-container");
    this._dropdown.render(append(container2, dropdownContainer));
    this._register(addDisposableListener(dropdownContainer, EventType.KEY_DOWN, (e4) => {
      const event = new StandardKeyboardEvent(e4);
      if (event.equals(15 /* LeftArrow */)) {
        this._dropdown.setFocusable(false);
        this._primaryAction.focus();
        event.stopPropagation();
      }
    }));
  }
  focus(fromRight) {
    if (fromRight) {
      this._dropdown.focus();
    } else {
      this._primaryAction.focus();
    }
  }
  blur() {
    this._primaryAction.blur();
    this._dropdown.blur();
  }
  setFocusable(focusable) {
    this._primaryAction.setFocusable(focusable);
    if (!focusable) {
      this._dropdown.setFocusable(false);
    }
  }
  _getPrimaryActionTooltip(state) {
    const keybindingLabel2 = this._keybindingService.lookupKeybinding(RUN_SCRIPT_ACTION_PRIMARY_ID)?.getLabel();
    const withKeybinding = (label3) => keybindingLabel2 ? localize(4549, null, label3, keybindingLabel2) : label3;
    if (state?.pinnedBrowser) {
      return withKeybinding(localize(4538, null));
    }
    if (!state || state.tasks.length === 0) {
      return localize(4552, null);
    }
    const primaryTask = getPrimaryTask(state.tasks, state.pinnedTaskLabel)?.task;
    if (!primaryTask) {
      return localize(4552, null);
    }
    return withKeybinding(getTaskDisplayLabel(primaryTask));
  }
  _getDropdownActions() {
    const state = this._activeRunState.get();
    if (!state) {
      return [];
    }
    const { tasks: tasks2, session, pinnedTaskLabel } = state;
    const folder = session.workspace.get()?.folders[0];
    const actions = [];
    const defaultCategory = { label: "", order: 0, showHeader: false };
    const worktreeCategory = { label: localize(4560, null), order: 1, showHeader: true };
    const tasksCategory = { label: localize(4554, null), order: 2, showHeader: true };
    for (let i2 = 0; i2 < tasks2.length; i2++) {
      const entry = tasks2[i2];
      const task = entry.task;
      const isWorktreeTask = task.runOptions?.runOn === "worktreeCreated";
      const isPinned = task.label === pinnedTaskLabel;
      const toolbarActions = [
        {
          id: `runScript.pin.${i2}`,
          label: isPinned ? localize(4557, null) : localize(4544, null),
          tooltip: isPinned ? localize(4558, null) : localize(4545, null),
          class: ThemeIcon.asClassName(isPinned ? Codicon.pinned : Codicon.pin),
          enabled: !!folder?.root,
          run: async () => {
            this._actionWidgetService.hide();
            this._sessionsConfigService.setPinnedTaskLabel(folder?.root, isPinned ? void 0 : task.label);
          }
        },
        {
          id: `runScript.configure.${i2}`,
          label: localize(4526, null),
          tooltip: localize(4526, null),
          class: ThemeIcon.asClassName(Codicon.gear),
          enabled: true,
          run: async () => {
            this._actionWidgetService.hide();
            await this._showCustomCommandInput(session, { task, target: entry.target }, "configure");
          }
        },
        {
          id: `runScript.remove.${i2}`,
          label: localize(4546, null),
          tooltip: localize(4546, null),
          class: ThemeIcon.asClassName(Codicon.close),
          enabled: true,
          run: async () => {
            this._actionWidgetService.hide();
            await this._sessionsConfigService.removeTask(task.label, session, entry.target);
          }
        }
      ];
      actions.push({
        id: `runScript.task.${i2}`,
        label: getTaskDisplayLabel(task),
        tooltip: "",
        hover: {
          content: localize(4548, null, getTaskDisplayLabel(task))
        },
        icon: Codicon.runCompact,
        enabled: true,
        class: void 0,
        category: isWorktreeTask ? worktreeCategory : defaultCategory,
        toolbarActions,
        run: async () => {
          await this._sessionsConfigService.runTask(task, session);
        }
      });
    }
    const canConfigure = !!(folder?.workingDirectory ?? folder?.root);
    actions.push({
      id: "runScript.addAction",
      label: localize(4525, null),
      tooltip: "",
      hover: {
        content: canConfigure ? localize(4511, null) : localize(4512, null)
      },
      icon: Codicon.addCompact,
      enabled: canConfigure,
      class: void 0,
      category: tasksCategory,
      run: async () => {
        logSessionsInteraction(this._telemetryService, "addTask", "actionWidget");
        const task = await this._showConfigureQuickPick(session);
        if (task) {
          await this._sessionsConfigService.runTask(task, session);
        }
      }
    });
    actions.push({
      id: "runScript.generateAction",
      label: localize(4535, null),
      tooltip: "",
      hover: {
        content: localize(4536, null)
      },
      icon: Codicon.sparkleCompact,
      enabled: true,
      class: void 0,
      category: tasksCategory,
      run: async () => {
        logSessionsInteraction(this._telemetryService, "generateNewTask", "actionWidget");
        await this._generateNewTask(session);
      }
    });
    const browserCategory = { label: localize(4517, null), order: 3, showHeader: true };
    const browserUrl = state.browserUrl;
    const browserUrlDescription = formatBrowserUrlDescription(browserUrl, 20);
    const canConfigureBrowser = !!folder?.root;
    const isBrowserPinned = state.pinnedBrowser;
    actions.push({
      id: "runScript.openBrowser",
      label: localize(4538, null),
      tooltip: "",
      description: browserUrlDescription,
      hover: {
        content: browserUrl ? localize(4539, null, browserUrl) : localize(4540, null)
      },
      icon: Codicon.windowCompact,
      enabled: true,
      class: void 0,
      category: browserCategory,
      toolbarActions: [
        {
          id: "runScript.pinBrowser",
          label: isBrowserPinned ? localize(4555, null) : localize(4542, null),
          tooltip: isBrowserPinned ? localize(4556, null) : localize(4543, null),
          class: ThemeIcon.asClassName(isBrowserPinned ? Codicon.pinned : Codicon.pin),
          enabled: !!folder?.root,
          run: async () => {
            this._actionWidgetService.hide();
            this._sessionsConfigService.setPinnedBrowser(folder?.root, !isBrowserPinned);
          }
        },
        {
          id: "runScript.configureBrowser",
          label: localize(4521, null),
          tooltip: localize(4521, null),
          class: ThemeIcon.asClassName(Codicon.gear),
          enabled: canConfigureBrowser,
          run: async () => {
            this._actionWidgetService.hide();
            await this._configureBrowserUrl(session);
          }
        }
      ],
      run: async () => {
        await this._commandService.executeCommand("simpleBrowser.show", browserUrl);
      }
    });
    return actions;
  }
};

RunScriptActionViewItem = __decorateClass([
  __decorateParam(7, ICommandService),
  __decorateParam(8, ISessionsTasksService),
  __decorateParam(9, IKeybindingService),
  __decorateParam(10, IActionWidgetService),
  __decorateParam(11, IContextKeyService),
  __decorateParam(12, ITelemetryService)
], RunScriptActionViewItem);

var ChevronActionWidgetDropdown2 = class extends ActionWidgetDropdownActionViewItem {
  renderLabel(element) {
    element.classList.add("codicon", "codicon-chevron-down");
    return null;
  }
};

MenuRegistry.appendMenuItem(Menus.TitleBarCenterRight, {
  submenu: RunScriptDropdownMenuId,
  isSplitButton: true,
  title: localize2(4547, "Run"),
  icon: Codicon.play,
  group: "navigation",
  order: 6,
  when: ContextKeyExpr.and(IsAuxiliaryWindowContext.toNegated(), SessionsWelcomeVisibleContext.toNegated(), SessionWorkspaceIsVirtualContext.toNegated())
});

var RunScriptNotAvailableAction = class extends Action2 {
  constructor() {
    super({
      id: "workbench.action.agentSessions.runScript.notAvailable",
      title: localize2(4547, "Run"),
      tooltip: localize(4553, null),
      icon: Codicon.play,
      precondition: ContextKeyExpr.false(),
      menu: [{
        id: Menus.TitleBarCenterRight,
        group: "navigation",
        order: 6,
        when: ContextKeyExpr.and(IsAuxiliaryWindowContext.toNegated(), SessionsWelcomeVisibleContext.toNegated(), SessionWorkspaceIsVirtualContext)
      }]
    });
  }
  run() {
  }
};

registerAction2(RunScriptNotAvailableAction);

KeybindingsRegistry.registerKeybindingRule({
  id: RUN_SCRIPT_ACTION_PRIMARY_ID,
  primary: 63 /* F5 */,
  weight: 200 /* WorkbenchContrib */ + 100,
  when: IsAuxiliaryWindowContext.toNegated()
});
export { getTaskDisplayLabel, getTaskCommandPreview, formatBrowserUrlDescription, getPrimaryTask, RunScriptDropdownMenuId, RUN_SCRIPT_ACTION_MODAL_VISIBLE_CLASS, RUN_SCRIPT_ACTION_PRIMARY_ID, CONFIGURE_DEFAULT_RUN_ACTION_ID, GENERATE_RUN_ACTION_ID, closeQuickWidgetButton, RunScriptContribution, RunScriptActionViewItem, ChevronActionWidgetDropdown2, RunScriptNotAvailableAction };
