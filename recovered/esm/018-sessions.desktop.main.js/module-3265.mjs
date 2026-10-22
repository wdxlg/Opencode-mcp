// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/tasks/browser/abstractTaskService.ts
import { localize, localize2 } from "./module-0001.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";
import { ValidationStatus } from "./module-3249.mjs";
import { isBoolean, isString, isStringArray } from "./module-0010.mjs";
import { QUICKOPEN_DETAIL_CONFIG, QUICKOPEN_SKIP_CONFIG, TaskQuickPick, configureTaskIcon, isWorkspaceFolder2 } from "./module-3264.mjs";
import { Disposable, MutableDisposable, dispose, toDisposable } from "./module-0012.mjs";
import { TerminalTaskSystem } from "./module-3263.mjs";
import { TaskError, Triggers, VerifiedTask } from "./module-3256.mjs";
import { ConfiguringTask, ContributedTask, CustomTask, ExecutionEngine, InMemoryTask, KeyedTaskIdentifier, RerunAllRunningTasksCommandId, RuntimeType, TASK_RUNNING_STATE, TaskDefinition, TaskGroup2, TaskSorter, TaskSourceKind, USER_TASKS_GROUP_KEY } from "./module-1402.mjs";
import { CustomExecutionSupportedContext, ProcessExecutionSupportedContext, ServerlessWebContext, ShellExecutionSupportedContext, TaskCommandsRegistered, TaskExecutionSupportedContext, TasksAvailableContext } from "./module-1403.mjs";
import { isWeb, platform } from "./module-0014.mjs";
import { VirtualWorkspaceContext } from "./module-0950.mjs";
import { getActiveElement, getWindow } from "./module-0075.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { CommandsRegistry, ICommandService } from "./module-0087.mjs";
import { Markers } from "./module-3023.mjs";
import { TaskDefinitionRegistry } from "./module-1401.mjs";
import { raceTimeout } from "./module-0036.mjs";
import { CHAT_OPEN_ACTION_ID } from "./module-1475.mjs";
import { severity_default } from "./module-0266.mjs";
import { basename2, dirname2, joinPath, relativePath } from "./module-0034.mjs";
import { ExecutionEngine2, GroupKind, JsonSchemaVersion2, createCustomTask, parse13 } from "./module-3258.mjs";
import { LRUCache } from "./module-0008.mjs";
import { URI } from "./module-0032.mjs";
import { ProblemMatcherRegistry } from "./module-3250.mjs";
import { toFormattedString } from "./module-1376.mjs";
import { generateUuid } from "./module-0190.mjs";
import { Schemas } from "./module-0033.mjs";
import { isCancellationError } from "./module-0004.mjs";
import { IWorkspaceContextService, WorkspaceFolder } from "./module-0509.mjs";
import { deepClone } from "./module-0098.mjs";
import { Action } from "./module-0082.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { EditorResourceAccessor } from "./module-0926.mjs";
import { match } from "./module-0857.mjs";
import { getTemplates } from "./module-3257.mjs";
import { parse5 } from "./module-0885.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IMarkerService } from "./module-0560.mjs";
import { IOutputService } from "./module-1245.mjs";
import { IPaneCompositePartService } from "./module-1093.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IEditorService } from "./module-0935.mjs";
import { IFileService } from "./module-0269.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ITextFileService } from "./module-1064.mjs";
import { IModelService } from "./module-0080.mjs";
import { IExtensionService } from "./module-0889.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IConfigurationResolverService } from "./module-1404.mjs";
import { ITerminalGroupService, ITerminalService } from "./module-1150.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IProgressService } from "./module-0446.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { IDialogService } from "./module-0267.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IContextKeyService } from "./module-0089.mjs";
import { IWorkbenchEnvironmentService } from "./module-0936.mjs";
import { ITerminalProfileResolverService } from "./module-1174.mjs";
import { IPathService } from "./module-0939.mjs";
import { ITextModelService } from "./module-0081.mjs";
import { IPreferencesService } from "./module-1293.mjs";
import { IViewDescriptorService } from "./module-1094.mjs";
import { IWorkspaceTrustManagementService, IWorkspaceTrustRequestService } from "./module-0854.mjs";
import { ILogService } from "./module-0095.mjs";
import { IThemeService } from "./module-0287.mjs";
import { ILifecycleService } from "./module-0870.mjs";
import { IRemoteAgentService } from "./module-0938.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { IChatService } from "./module-0973.mjs";
import { IChatAgentService } from "./module-0975.mjs";
import { IHostService } from "./module-1118.mjs";


// src/vs/workbench/contrib/tasks/browser/abstractTaskService.ts
var QUICKOPEN_HISTORY_LIMIT_CONFIG = "task.quickOpen.history";

var PROBLEM_MATCHER_NEVER_CONFIG = "task.problemMatchers.neverPrompt";

var USE_SLOW_PICKER = "task.quickOpen.showAll";

var TaskTerminalType2 = "Task";

var ConfigureTaskAction;

((ConfigureTaskAction2) => {
  ConfigureTaskAction2.ID = "workbench.action.tasks.configureTaskRunner";
  ConfigureTaskAction2.TEXT = localize2(19466, "Configure Task");
})(ConfigureTaskAction || (ConfigureTaskAction = {}));

var ProblemReporter = class {
  constructor(_outputChannel) {
    this._outputChannel = _outputChannel;
    this._onDidError = new Emitter();
    this.onDidError = this._onDidError.event;
    this._validationStatus = new ValidationStatus();
  }
  info(message) {
    this._validationStatus.state = 1 /* Info */;
    this._outputChannel.append(message + "\n");
  }
  warn(message) {
    this._validationStatus.state = 2 /* Warning */;
    this._outputChannel.append(message + "\n");
  }
  error(message) {
    this._validationStatus.state = 3 /* Error */;
    this._outputChannel.append(message + "\n");
    this._onDidError.fire(message);
  }
  fatal(message) {
    this._validationStatus.state = 4 /* Fatal */;
    this._outputChannel.append(message + "\n");
    this._onDidError.fire(message);
  }
  get status() {
    return this._validationStatus;
  }
};

var TaskMap = class _TaskMap {
  constructor() {
    this._store = /* @__PURE__ */ new Map();
  }
  forEach(callback) {
    this._store.forEach(callback);
  }
  static getKey(workspaceFolder) {
    let key3;
    if (isString(workspaceFolder)) {
      key3 = workspaceFolder;
    } else {
      const uri4 = isWorkspaceFolder2(workspaceFolder) ? workspaceFolder.uri : workspaceFolder.configuration;
      key3 = uri4 ? uri4.toString() : "";
    }
    return key3;
  }
  get(workspaceFolder) {
    const key3 = _TaskMap.getKey(workspaceFolder);
    let result = this._store.get(key3);
    if (!result) {
      result = [];
      this._store.set(key3, result);
    }
    return result;
  }
  add(workspaceFolder, ...task) {
    const key3 = _TaskMap.getKey(workspaceFolder);
    let values = this._store.get(key3);
    if (!values) {
      values = [];
      this._store.set(key3, values);
    }
    values.push(...task);
  }
  all() {
    const result = [];
    this._store.forEach((values) => result.push(...values));
    return result;
  }
};

var AbstractTaskService = class extends Disposable {
  constructor(_configurationService, _markerService, _outputService, _paneCompositeService, _viewsService, _commandService, _editorService, _fileService, _contextService, _telemetryService, _textFileService, _modelService, _extensionService, _quickInputService, _configurationResolverService, _terminalService, _terminalGroupService, _storageService, _progressService, _openerService, _dialogService, _notificationService, _contextKeyService, _environmentService, _terminalProfileResolverService, _pathService, _textModelResolverService, _preferencesService, _viewDescriptorService, _workspaceTrustRequestService, _workspaceTrustManagementService, _logService, _themeService, _lifecycleService, remoteAgentService, _instantiationService, _chatService, _chatAgentService, _hostService) {
    super();
    this._configurationService = _configurationService;
    this._markerService = _markerService;
    this._outputService = _outputService;
    this._paneCompositeService = _paneCompositeService;
    this._viewsService = _viewsService;
    this._commandService = _commandService;
    this._editorService = _editorService;
    this._fileService = _fileService;
    this._contextService = _contextService;
    this._telemetryService = _telemetryService;
    this._textFileService = _textFileService;
    this._modelService = _modelService;
    this._extensionService = _extensionService;
    this._quickInputService = _quickInputService;
    this._configurationResolverService = _configurationResolverService;
    this._terminalService = _terminalService;
    this._terminalGroupService = _terminalGroupService;
    this._storageService = _storageService;
    this._progressService = _progressService;
    this._openerService = _openerService;
    this._dialogService = _dialogService;
    this._notificationService = _notificationService;
    this._contextKeyService = _contextKeyService;
    this._environmentService = _environmentService;
    this._terminalProfileResolverService = _terminalProfileResolverService;
    this._pathService = _pathService;
    this._textModelResolverService = _textModelResolverService;
    this._preferencesService = _preferencesService;
    this._viewDescriptorService = _viewDescriptorService;
    this._workspaceTrustRequestService = _workspaceTrustRequestService;
    this._workspaceTrustManagementService = _workspaceTrustManagementService;
    this._logService = _logService;
    this._themeService = _themeService;
    this._lifecycleService = _lifecycleService;
    this._instantiationService = _instantiationService;
    this._chatService = _chatService;
    this._chatAgentService = _chatAgentService;
    this._hostService = _hostService;
    this._tasksReconnected = false;
    this._taskSystemListeners = [];
    this._onDidRegisterSupportedExecutions = this._register(new Emitter());
    this._onDidRegisterAllSupportedExecutions = this._register(new Emitter());
    this._onDidChangeTaskSystemInfo = this._register(new Emitter());
    this._willRestart = false;
    this.onDidChangeTaskSystemInfo = this._onDidChangeTaskSystemInfo.event;
    this._onDidReconnectToTasks = this._register(new Emitter());
    this.onDidReconnectToTasks = this._onDidReconnectToTasks.event;
    this._onDidChangeTaskConfig = this._register(new Emitter());
    this.onDidChangeTaskConfig = this._onDidChangeTaskConfig.event;
    this._onDidChangeTaskProviders = this._register(new Emitter());
    this.onDidChangeTaskProviders = this._onDidChangeTaskProviders.event;
    this._taskRunStartTimes = /* @__PURE__ */ new Map();
    this._taskRunSources = /* @__PURE__ */ new Map();
    this._activatedTaskProviders = /* @__PURE__ */ new Set();
    this.toast = this._register(new MutableDisposable());
    this._whenTaskSystemReady = Event2.toPromise(this.onDidChangeTaskSystemInfo);
    this._workspaceTasksPromise = void 0;
    this._taskSystem = void 0;
    this._taskSystemListeners = void 0;
    this._outputChannel = this._outputService.getChannel(AbstractTaskService.OutputChannelId);
    this._providers = /* @__PURE__ */ new Map();
    this._providerTypes = /* @__PURE__ */ new Map();
    this._taskSystemInfos = /* @__PURE__ */ new Map();
    this._register(this._contextService.onDidChangeWorkspaceFolders(() => {
      const taskServiceInitialized = !!this._taskSystem || !!this._workspaceTasksPromise;
      const folderSetup = this._computeWorkspaceFolderSetup();
      if (this.executionEngine !== folderSetup[2]) {
        this._disposeTaskSystemListeners();
        this._taskSystem = void 0;
      }
      this._updateSetup(folderSetup);
      if (!taskServiceInitialized) {
        return;
      }
      return this._updateWorkspaceTasks(2 /* FolderOpen */);
    }));
    this._register(this._configurationService.onDidChangeConfiguration(async (e4) => {
      if (!e4.affectsConfiguration("tasks") || !this._taskSystem && !this._workspaceTasksPromise) {
        return;
      }
      if (!this._taskSystem || this._taskSystem instanceof TerminalTaskSystem) {
        this._outputChannel.clear();
      }
      if (e4.affectsConfiguration("task.reconnection" /* Reconnection */)) {
        if (!this._configurationService.getValue("task.reconnection" /* Reconnection */)) {
          this._persistentTasks?.clear();
          this._storageService.remove(AbstractTaskService.PersistentTasks_Key, 1 /* WORKSPACE */);
        }
      }
      this._setTaskLRUCacheLimit();
      const mapStringToFolderTasks = await this._updateWorkspaceTasks(3 /* ConfigurationChange */);
      this._onDidChangeTaskConfig.fire();
      for (const [folderUri, folderResult] of mapStringToFolderTasks) {
        if (!folderResult.set?.tasks?.length) {
          continue;
        }
        for (const task of folderResult.set.tasks) {
          const realUniqueId = task._id;
          const lastTask = this._taskSystem?.lastTask?.task._id;
          if (lastTask && lastTask === realUniqueId && folderUri !== "setting") {
            const verifiedLastTask = new VerifiedTask(task, this._taskSystem.lastTask.resolver, Triggers.command);
            this._taskSystem.lastTask = verifiedLastTask;
          }
        }
      }
    }));
    this._taskRunningState = TASK_RUNNING_STATE.bindTo(_contextKeyService);
    this._tasksAvailableState = TasksAvailableContext.bindTo(_contextKeyService);
    this._onDidStateChange = this._register(new Emitter());
    this._registerCommands().then(() => TaskCommandsRegistered.bindTo(this._contextKeyService).set(true));
    ServerlessWebContext.bindTo(this._contextKeyService).set(isWeb && !remoteAgentService.getConnection()?.remoteAuthority);
    this._configurationResolverService.contributeVariable("defaultBuildTask", async () => {
      let tasks2 = await this._getTasksForGroup(TaskGroup2.Build, true);
      if (tasks2.length > 0) {
        const defaults2 = this._getDefaultTasks(tasks2);
        if (defaults2.length === 1) {
          return defaults2[0]._label;
        }
      }
      tasks2 = await this._getTasksForGroup(TaskGroup2.Build);
      const defaults = this._getDefaultTasks(tasks2);
      if (defaults.length === 1) {
        return defaults[0]._label;
      } else if (defaults.length) {
        tasks2 = defaults;
      }
      let entry;
      if (tasks2 && tasks2.length > 0) {
        entry = await this._showQuickPick(tasks2, localize(19530, null));
      }
      const task = entry ? entry.task : void 0;
      if (!task) {
        return void 0;
      }
      return task._label;
    });
    this._register(this._lifecycleService.onBeforeShutdown((e4) => {
      this._willRestart = e4.reason !== 3 /* RELOAD */;
    }));
    this._register(this.onDidStateChange(async (e4) => {
      this._log(localize(19486, null, e4.kind), true);
      switch (e4.kind) {
        case "start" /* Start */:
          this._taskRunStartTimes.set(e4.taskId, Date.now());
          break;
        case "processEnded" /* ProcessEnded */: {
          const processEndedEvent = e4;
          const startTime = this._taskRunStartTimes.get(e4.taskId);
          if (!startTime) {
            break;
          }
          const durationMs = processEndedEvent.durationMs ?? Date.now() - startTime;
          if (durationMs !== void 0) {
            this._handleLongRunningTaskCompletion(processEndedEvent, durationMs);
          }
          this._taskRunStartTimes.delete(e4.taskId);
          this._taskRunSources.delete(e4.taskId);
          break;
        }
        case "inactive" /* Inactive */: {
          const processEndedEvent = e4;
          const startTime = this._taskRunStartTimes.get(e4.taskId);
          if (!startTime) {
            break;
          }
          const durationMs = processEndedEvent.durationMs ?? Date.now() - startTime;
          if (durationMs !== void 0) {
            this._handleLongRunningTaskCompletion(processEndedEvent, durationMs);
          }
          this._taskRunStartTimes.delete(e4.taskId);
          this._taskRunSources.delete(e4.taskId);
          break;
        }
        case "terminated" /* Terminated */:
          this._taskRunStartTimes.delete(e4.taskId);
          this._taskRunSources.delete(e4.taskId);
          break;
      }
      if (e4.kind === "changed" /* Changed */) {
      } else if ((this._willRestart || e4.kind === "terminated" /* Terminated */ && e4.exitReason === 3 /* User */) && e4.taskId) {
        const key3 = e4.__task.getKey();
        if (key3) {
          this.removePersistentTask(key3);
        }
      } else if (e4.kind === "start" /* Start */ && e4.__task && e4.__task.getWorkspaceFolder()) {
        this._setPersistentTask(e4.__task);
      }
    }));
    this._waitForAllSupportedExecutions = new Promise((resolve3) => {
      Event2.once(this._onDidRegisterAllSupportedExecutions.event)(() => resolve3());
    });
    this._terminalService.whenConnected.then(() => {
      const reconnectedInstances = this._terminalService.instances.filter((e4) => e4.reconnectionProperties?.ownerId === TaskTerminalType2);
      if (reconnectedInstances.length) {
        this._attemptTaskReconnection();
      } else {
        this._tasksReconnected = true;
        this._onDidReconnectToTasks.fire();
      }
    });
    this._upgrade();
  }
  static {
    // private static autoDetectTelemetryName: string = 'taskServer.autoDetect';
    this.RecentlyUsedTasks_Key = "workbench.tasks.recentlyUsedTasks";
  }
  static {
    this.RecentlyUsedTasks_KeyV2 = "workbench.tasks.recentlyUsedTasks2";
  }
  static {
    this.PersistentTasks_Key = "workbench.tasks.persistentTasks";
  }
  static {
    this.IgnoreTask010DonotShowAgain_key = "workbench.tasks.ignoreTask010Shown";
  }
  static {
    this.OutputChannelId = "tasks";
  }
  static {
    this.OutputChannelLabel = localize(19488, null);
  }
  static {
    this._nextHandle = 0;
  }
  get isReconnected() {
    return this._tasksReconnected;
  }
  registerSupportedExecutions(custom, shell, process3) {
    if (custom !== void 0) {
      const customContext = CustomExecutionSupportedContext.bindTo(this._contextKeyService);
      customContext.set(custom);
    }
    const isVirtual = !!VirtualWorkspaceContext.getValue(this._contextKeyService);
    if (shell !== void 0) {
      const shellContext = ShellExecutionSupportedContext.bindTo(this._contextKeyService);
      shellContext.set(shell && !isVirtual);
    }
    if (process3 !== void 0) {
      const processContext = ProcessExecutionSupportedContext.bindTo(this._contextKeyService);
      processContext.set(process3 && !isVirtual);
    }
    this._workspaceTasksPromise = void 0;
    this._onDidRegisterSupportedExecutions.fire();
    if (ServerlessWebContext.getValue(this._contextKeyService) || custom && shell && process3) {
      this._onDidRegisterAllSupportedExecutions.fire();
    }
  }
  _attemptTaskReconnection() {
    if (this._lifecycleService.startupKind !== 3 /* ReloadedWindow */) {
      this._log(localize(19544, null), true);
      this._tasksReconnected = true;
      this._storageService.remove(AbstractTaskService.PersistentTasks_Key, 1 /* WORKSPACE */);
    }
    if (!this._configurationService.getValue("task.reconnection" /* Reconnection */) || this._tasksReconnected) {
      this._log(localize(19522, null, this._configurationService.getValue("task.reconnection" /* Reconnection */), this._tasksReconnected), true);
      this._tasksReconnected = true;
      return;
    }
    this._log(localize(19539, null), true);
    this.getWorkspaceTasks(4 /* Reconnect */).then(async () => {
      this._tasksReconnected = await this._reconnectTasks();
      this._log(localize(19538, null), true);
      this._onDidReconnectToTasks.fire();
    });
  }
  async _handleLongRunningTaskCompletion(event, durationMs) {
    const notificationThreshold = this._configurationService.getValue("task.notifyWindowOnTaskCompletion" /* NotifyWindowOnTaskCompletion */);
    if (notificationThreshold === -1 || notificationThreshold > 0 && durationMs < notificationThreshold) {
      return;
    }
    const taskRunSource = this._taskRunSources.get(event.taskId);
    if (taskRunSource === 5 /* ChatAgent */) {
      return;
    }
    const terminalForTask = this._terminalService.instances.find((i2) => i2.instanceId === event.terminalId);
    if (!terminalForTask) {
      return;
    }
    const taskLabel = terminalForTask.title;
    const targetWindow = getWindow(terminalForTask.domElement);
    if (targetWindow.document.hasFocus()) {
      return;
    }
    const durationText = this._formatTaskDuration(durationMs);
    const message = taskLabel ? localize(19482, null, taskLabel, durationText) : localize(19481, null, durationText);
    this._hostService.focus(targetWindow, { mode: 1 /* Notify */ });
    const cts = new CancellationTokenSource();
    this.toast.value = toDisposable(() => cts.dispose(true));
    const { clicked } = await this._hostService.showToast({ title: message }, cts.token);
    this.toast.clear();
    if (clicked) {
      this._hostService.focus(targetWindow, { mode: 2 /* Force */ });
    }
  }
  _formatTaskDuration(durationMs) {
    const totalSeconds = Math.max(1, Math.round(durationMs / 1e3));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes > 0) {
      return seconds > 0 ? localize(19484, null, minutes, seconds) : localize(19483, null, minutes);
    }
    return localize(19485, null, seconds);
  }
  async _reconnectTasks() {
    const tasks2 = await this.getSavedTasks("persistent");
    if (!tasks2.length) {
      this._log(localize(19520, null), true);
      return true;
    }
    const taskLabels = tasks2.map((task) => task._label).join(", ");
    this._log(localize(19540, null, taskLabels), true);
    for (const task of tasks2) {
      if (ConfiguringTask.is(task)) {
        const resolved = await this.tryResolveTask(task);
        if (resolved) {
          this.run(resolved, void 0, 4 /* Reconnect */);
        }
      } else {
        this.run(task, void 0, 4 /* Reconnect */);
      }
    }
    return true;
  }
  get onDidStateChange() {
    return this._onDidStateChange.event;
  }
  get supportsMultipleTaskExecutions() {
    return this.inTerminal();
  }
  async _registerCommands() {
    CommandsRegistry.registerCommand({
      id: "workbench.action.tasks.runTask",
      handler: async (accessor, arg) => {
        if (await this._trust()) {
          await this._runTaskCommand(arg);
        }
      },
      metadata: {
        description: "Run Task",
        args: [{
          name: "args",
          isOptional: true,
          description: localize(19472, null),
          schema: {
            anyOf: [
              {
                type: "string",
                description: localize(19473, null)
              },
              {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    description: localize(19475, null)
                  },
                  task: {
                    type: "string",
                    description: localize(19474, null)
                  }
                }
              }
            ]
          }
        }]
      }
    });
    CommandsRegistry.registerCommand("workbench.action.tasks.reRunTask", async (accessor) => {
      if (await this._trust()) {
        this._reRunTaskCommand();
      }
    });
    CommandsRegistry.registerCommand("workbench.action.tasks.restartTask", async (accessor, arg) => {
      if (await this._trust()) {
        this._runRestartTaskCommand(arg);
      }
    });
    CommandsRegistry.registerCommand(RerunAllRunningTasksCommandId, async (accessor) => {
      if (await this._trust()) {
        this._runRerunAllRunningTasksCommand();
      }
    });
    CommandsRegistry.registerCommand("workbench.action.tasks.terminate", async (accessor, arg) => {
      if (await this._trust()) {
        this._runTerminateCommand(arg);
      }
    });
    CommandsRegistry.registerCommand("workbench.action.tasks.showLog", () => {
      this._showOutput(void 0, true);
    });
    CommandsRegistry.registerCommand("workbench.action.tasks.build", async () => {
      if (await this._trust()) {
        this._runBuildCommand();
      }
    });
    CommandsRegistry.registerCommand("workbench.action.tasks.test", async () => {
      if (await this._trust()) {
        this._runTestCommand();
      }
    });
    CommandsRegistry.registerCommand("workbench.action.tasks.configureTaskRunner", async () => {
      if (await this._trust()) {
        this._runConfigureTasks();
      }
    });
    CommandsRegistry.registerCommand("workbench.action.tasks.configureDefaultBuildTask", async () => {
      if (await this._trust()) {
        this._runConfigureDefaultBuildTask();
      }
    });
    CommandsRegistry.registerCommand("workbench.action.tasks.configureDefaultTestTask", async () => {
      if (await this._trust()) {
        this._runConfigureDefaultTestTask();
      }
    });
    CommandsRegistry.registerCommand("workbench.action.tasks.showTasks", async () => {
      if (await this._trust()) {
        return this.runShowTasks();
      }
    });
    CommandsRegistry.registerCommand("workbench.action.tasks.toggleProblems", () => this._commandService.executeCommand(Markers.TOGGLE_MARKERS_VIEW_ACTION_ID));
    CommandsRegistry.registerCommand("workbench.action.tasks.openUserTasks", async () => {
      const resource = this._getResourceForKind(TaskSourceKind.User);
      if (resource) {
        this._openTaskFile(resource, TaskSourceKind.User);
      }
    });
    CommandsRegistry.registerCommand("workbench.action.tasks.openWorkspaceFileTasks", async () => {
      const resource = this._getResourceForKind(TaskSourceKind.WorkspaceFile);
      if (resource) {
        this._openTaskFile(resource, TaskSourceKind.WorkspaceFile);
      }
    });
  }
  get workspaceFolders() {
    if (!this._workspaceFolders) {
      this._updateSetup();
    }
    return this._workspaceFolders;
  }
  get ignoredWorkspaceFolders() {
    if (!this._ignoredWorkspaceFolders) {
      this._updateSetup();
    }
    return this._ignoredWorkspaceFolders;
  }
  get executionEngine() {
    if (this._executionEngine === void 0) {
      this._updateSetup();
    }
    return this._executionEngine;
  }
  get schemaVersion() {
    if (this._schemaVersion === void 0) {
      this._updateSetup();
    }
    return this._schemaVersion;
  }
  get showIgnoreMessage() {
    if (this._showIgnoreMessage === void 0) {
      this._showIgnoreMessage = !this._storageService.getBoolean(AbstractTaskService.IgnoreTask010DonotShowAgain_key, 1 /* WORKSPACE */, false);
    }
    return this._showIgnoreMessage;
  }
  _getActivationEvents(type) {
    const result = [];
    result.push("onCommand:workbench.action.tasks.runTask");
    if (type) {
      result.push(`onTaskType:${type}`);
    } else {
      for (const definition of TaskDefinitionRegistry.all()) {
        result.push(`onTaskType:${definition.taskType}`);
      }
    }
    return result;
  }
  async _activateTaskProviders(type) {
    await this._extensionService.whenInstalledExtensionsRegistered();
    const hasLoggedActivation = this._activatedTaskProviders.has(type ?? "all");
    if (!hasLoggedActivation) {
      this._log("Activating task providers " + (type ?? "all"));
    }
    const result = await raceTimeout(
      Promise.all(this._getActivationEvents(type).map((activationEvent) => this._extensionService.activateByEvent(activationEvent))),
      5e3,
      () => this._logService.warn("Timed out activating extensions for task providers")
    );
    if (result) {
      this._activatedTaskProviders.add(type ?? "all");
    }
  }
  _updateSetup(setup2) {
    if (!setup2) {
      setup2 = this._computeWorkspaceFolderSetup();
    }
    this._workspaceFolders = setup2[0];
    if (this._ignoredWorkspaceFolders) {
      if (this._ignoredWorkspaceFolders.length !== setup2[1].length) {
        this._showIgnoreMessage = void 0;
      } else {
        const set = /* @__PURE__ */ new Set();
        this._ignoredWorkspaceFolders.forEach((folder) => set.add(folder.uri.toString()));
        for (const folder of setup2[1]) {
          if (!set.has(folder.uri.toString())) {
            this._showIgnoreMessage = void 0;
            break;
          }
        }
      }
    }
    this._ignoredWorkspaceFolders = setup2[1];
    this._executionEngine = setup2[2];
    this._schemaVersion = setup2[3];
    this._workspace = setup2[4];
  }
  _showOutput(runSource = 1 /* User */, userRequested, errorMessage) {
    if (!VirtualWorkspaceContext.getValue(this._contextKeyService) && (runSource === 1 /* User */ || runSource === 3 /* ConfigurationChange */)) {
      if (userRequested) {
        this._outputService.showChannel(this._outputChannel.id, true);
      } else {
        const chatEnabled = this._chatService.isEnabled("panel" /* Chat */);
        const actions = [];
        if (chatEnabled && errorMessage) {
          const beforeJSONregex = /^(.*?)\s*\{[\s\S]*$/;
          const matches2 = errorMessage.match(beforeJSONregex);
          if (matches2 && matches2.length > 1) {
            const message = matches2[1];
            const customMessage = message === errorMessage ? `\`${message}\`` : `\`${message}\`
\`\`\`json${errorMessage}\`\`\``;
            const defaultAgent = this._chatAgentService.getDefaultAgent("panel" /* Chat */);
            if (defaultAgent) {
              actions.push({
                label: localize(19570, null),
                run: async () => {
                  this._commandService.executeCommand(CHAT_OPEN_ACTION_ID, {
                    mode: "agent" /* Agent */,
                    query: `Fix this task configuration error: ${customMessage}`
                  });
                }
              });
            }
          }
        }
        actions.push({
          label: localize(19480, null),
          run: () => {
            this._outputService.showChannel(this._outputChannel.id, true);
          }
        });
        if (chatEnabled && actions.length > 1) {
          this._notificationService.prompt(severity_default.Warning, localize(19552, null), actions);
        } else {
          this._notificationService.prompt(severity_default.Warning, localize(19551, null), actions);
        }
      }
    }
  }
  _disposeTaskSystemListeners() {
    if (this._taskSystemListeners) {
      dispose(this._taskSystemListeners);
      this._taskSystemListeners = void 0;
    }
  }
  registerTaskProvider(provider, type) {
    if (!provider) {
      return {
        dispose: () => {
        }
      };
    }
    const handle2 = AbstractTaskService._nextHandle++;
    this._providers.set(handle2, provider);
    this._providerTypes.set(handle2, type);
    this._onDidChangeTaskProviders.fire();
    return {
      dispose: () => {
        this._providers.delete(handle2);
        this._providerTypes.delete(handle2);
        this._onDidChangeTaskProviders.fire();
      }
    };
  }
  get hasTaskSystemInfo() {
    const infosCount = Array.from(this._taskSystemInfos.values()).flat().length;
    if (this._environmentService.remoteAuthority) {
      return infosCount > 1;
    }
    return infosCount > 0;
  }
  registerTaskSystem(key3, info) {
    if (info.platform === 0 /* Web */) {
      key3 = this.workspaceFolders.length ? this.workspaceFolders[0].uri.scheme : key3;
    }
    if (!this._taskSystemInfos.has(key3)) {
      this._taskSystemInfos.set(key3, [info]);
    } else {
      const infos = this._taskSystemInfos.get(key3);
      if (info.platform === 0 /* Web */) {
        infos.push(info);
      } else {
        infos.unshift(info);
      }
    }
    if (this.hasTaskSystemInfo) {
      this._onDidChangeTaskSystemInfo.fire();
    }
  }
  _getTaskSystemInfo(key3) {
    const infos = this._taskSystemInfos.get(key3);
    return infos && infos.length ? infos[0] : void 0;
  }
  extensionCallbackTaskComplete(task, result) {
    if (!this._taskSystem) {
      return Promise.resolve();
    }
    return this._taskSystem.customExecutionComplete(task, result);
  }
  /**
   * Get a subset of workspace tasks that match a certain predicate.
   */
  async _findWorkspaceTasks(predicate) {
    const result = [];
    const tasks2 = await this.getWorkspaceTasks();
    for (const [, workspaceTasks] of tasks2) {
      if (workspaceTasks.configurations) {
        for (const taskName of Object.keys(workspaceTasks.configurations.byIdentifier)) {
          const task = workspaceTasks.configurations.byIdentifier[taskName];
          if (predicate(task, workspaceTasks.workspaceFolder)) {
            result.push(task);
          }
        }
      }
      if (workspaceTasks.set) {
        for (const task of workspaceTasks.set.tasks) {
          if (predicate(task, workspaceTasks.workspaceFolder)) {
            result.push(task);
          }
        }
      }
    }
    return result;
  }
  async _findWorkspaceTasksInGroup(group2, isDefault) {
    return this._findWorkspaceTasks((task) => {
      const taskGroup = task.configurationProperties.group;
      if (taskGroup && typeof taskGroup !== "string") {
        return taskGroup._id === group2._id && (!isDefault || !!taskGroup.isDefault);
      }
      return false;
    });
  }
  async getTask(folder, identifier2, compareId = false, type = void 0) {
    if (!await this._trust()) {
      return;
    }
    const name = isString(folder) ? folder : isWorkspaceFolder2(folder) ? folder.name : folder.configuration ? basename2(folder.configuration) : void 0;
    if (this.ignoredWorkspaceFolders.some((ignored) => ignored.name === name)) {
      return Promise.reject(new Error(localize(19489, null, name)));
    }
    const key3 = !isString(identifier2) ? TaskDefinition.createTaskIdentifier(identifier2, console) : identifier2;
    if (key3 === void 0) {
      return Promise.resolve(void 0);
    }
    const requestedFolder = TaskMap.getKey(folder);
    const matchedTasks = await this._findWorkspaceTasks((task, workspaceFolder) => {
      const taskFolder = TaskMap.getKey(workspaceFolder);
      if (taskFolder !== requestedFolder && taskFolder !== USER_TASKS_GROUP_KEY) {
        return false;
      }
      return task.matches(key3, compareId);
    });
    matchedTasks.sort((task) => task._source.kind === TaskSourceKind.Extension ? 1 : -1);
    if (matchedTasks.length > 0) {
      const task = matchedTasks[0];
      if (ConfiguringTask.is(task)) {
        return this.tryResolveTask(task);
      } else {
        return task;
      }
    }
    const map = await this._getGroupedTasks({ type });
    let values = map.get(folder);
    values = values.concat(map.get(USER_TASKS_GROUP_KEY));
    if (!values) {
      return void 0;
    }
    values = values.filter((task) => task.matches(key3, compareId)).sort((task) => task._source.kind === TaskSourceKind.Extension ? 1 : -1);
    return values.length > 0 ? values[0] : void 0;
  }
  async tryResolveTask(configuringTask) {
    if (!await this._trust()) {
      return;
    }
    await this._activateTaskProviders(configuringTask.type);
    let matchingProvider;
    let matchingProviderUnavailable = false;
    for (const [handle2, provider] of this._providers) {
      const providerType = this._providerTypes.get(handle2);
      if (configuringTask.type === providerType) {
        if (providerType && !this._isTaskProviderEnabled(providerType)) {
          matchingProviderUnavailable = true;
          continue;
        }
        matchingProvider = provider;
        break;
      }
    }
    if (!matchingProvider) {
      if (matchingProviderUnavailable) {
        this._log(localize(
          19537,
          null,
          configuringTask.configures.type
        ));
      }
      return;
    }
    try {
      const resolvedTask = await matchingProvider.resolveTask(configuringTask);
      if (resolvedTask && resolvedTask._id === configuringTask._id) {
        return createCustomTask(resolvedTask, configuringTask);
      }
    } catch (error) {
    }
    const tasks2 = await this.tasks({ type: configuringTask.type });
    for (const task of tasks2) {
      if (task._id === configuringTask._id) {
        return createCustomTask(task, configuringTask);
      }
    }
    return;
  }
  async tasks(filter2) {
    if (!await this._trust()) {
      return [];
    }
    if (!this._versionAndEngineCompatible(filter2)) {
      return Promise.resolve([]);
    }
    return this._getGroupedTasks(filter2).then((map) => this.applyFilterToTaskMap(filter2, map));
  }
  async getKnownTasks(filter2) {
    if (!this._versionAndEngineCompatible(filter2)) {
      return Promise.resolve([]);
    }
    return this._getGroupedTasks(filter2, true, true).then((map) => this.applyFilterToTaskMap(filter2, map));
  }
  taskTypes() {
    const types = [];
    if (this._isProvideTasksEnabled()) {
      for (const definition of TaskDefinitionRegistry.all()) {
        if (this._isTaskProviderEnabled(definition.taskType)) {
          types.push(definition.taskType);
        }
      }
    }
    return types;
  }
  createSorter() {
    return new TaskSorter(this._contextService.getWorkspace() ? this._contextService.getWorkspace().folders : []);
  }
  _isActive() {
    if (!this._taskSystem) {
      return Promise.resolve(false);
    }
    return this._taskSystem.isActive();
  }
  async getActiveTasks() {
    if (!this._taskSystem) {
      return [];
    }
    return this._taskSystem.getActiveTasks();
  }
  async getBusyTasks() {
    if (!this._taskSystem) {
      return [];
    }
    return this._taskSystem.getBusyTasks();
  }
  getRecentlyUsedTasksV1() {
    if (this._recentlyUsedTasksV1) {
      return this._recentlyUsedTasksV1;
    }
    const quickOpenHistoryLimit = this._configurationService.getValue(QUICKOPEN_HISTORY_LIMIT_CONFIG);
    this._recentlyUsedTasksV1 = new LRUCache(quickOpenHistoryLimit);
    const storageValue = this._storageService.get(AbstractTaskService.RecentlyUsedTasks_Key, 1 /* WORKSPACE */);
    if (storageValue) {
      try {
        const values = JSON.parse(storageValue);
        if (Array.isArray(values)) {
          for (const value2 of values) {
            this._recentlyUsedTasksV1.set(value2, value2);
          }
        }
      } catch (error) {
      }
    }
    return this._recentlyUsedTasksV1;
  }
  applyFilterToTaskMap(filter2, map) {
    if (!filter2 || !filter2.type) {
      return map.all();
    }
    const result = [];
    map.forEach((tasks2) => {
      for (const task of tasks2) {
        if (ContributedTask.is(task) && (task.defines.type === filter2.type || task._source.label === filter2.type)) {
          result.push(task);
        } else if (CustomTask.is(task)) {
          if (task.type === filter2.type) {
            result.push(task);
          } else {
            const customizes = task.customizes();
            if (customizes && customizes.type === filter2.type) {
              result.push(task);
            }
          }
        }
      }
    });
    return result;
  }
  _getTasksFromStorage(type) {
    return type === "persistent" ? this._getPersistentTasks() : this._getRecentTasks();
  }
  _getRecentTasks() {
    if (this._recentlyUsedTasks) {
      return this._recentlyUsedTasks;
    }
    const quickOpenHistoryLimit = this._configurationService.getValue(QUICKOPEN_HISTORY_LIMIT_CONFIG);
    this._recentlyUsedTasks = new LRUCache(quickOpenHistoryLimit);
    const storageValue = this._storageService.get(AbstractTaskService.RecentlyUsedTasks_KeyV2, 1 /* WORKSPACE */);
    if (storageValue) {
      try {
        const values = JSON.parse(storageValue);
        if (Array.isArray(values)) {
          for (const value2 of values) {
            this._recentlyUsedTasks.set(value2[0], value2[1]);
          }
        }
      } catch (error) {
      }
    }
    return this._recentlyUsedTasks;
  }
  _getPersistentTasks() {
    if (this._persistentTasks) {
      this._log(localize(19506, null, this._persistentTasks.size), true);
      return this._persistentTasks;
    }
    this._persistentTasks = new LRUCache(10);
    const storageValue = this._storageService.get(AbstractTaskService.PersistentTasks_Key, 1 /* WORKSPACE */);
    if (storageValue) {
      try {
        const values = JSON.parse(storageValue);
        if (Array.isArray(values)) {
          for (const value2 of values) {
            this._persistentTasks.set(value2[0], value2[1]);
          }
        }
      } catch (error) {
      }
    }
    return this._persistentTasks;
  }
  _getFolderFromTaskKey(key3) {
    const keyValue = JSON.parse(key3);
    return {
      folder: keyValue.folder,
      isWorkspaceFile: keyValue.id?.endsWith(TaskSourceKind.WorkspaceFile)
    };
  }
  async getSavedTasks(type) {
    const folderMap = /* @__PURE__ */ Object.create(null);
    this.workspaceFolders.forEach((folder) => {
      folderMap[folder.uri.toString()] = folder;
    });
    const folderToTasksMap = /* @__PURE__ */ new Map();
    const workspaceToTaskMap = /* @__PURE__ */ new Map();
    const storedTasks = this._getTasksFromStorage(type);
    const tasks2 = [];
    this._log(localize(19501, null), true);
    function addTaskToMap(map, folder, task) {
      if (folder && !map.has(folder)) {
        map.set(folder, []);
      }
      if (folder && (folderMap[folder] || folder === USER_TASKS_GROUP_KEY) && task) {
        map.get(folder).push(task);
      }
    }
    for (const entry of storedTasks.entries()) {
      try {
        const key3 = entry[0];
        const task = JSON.parse(entry[1]);
        const folderInfo = this._getFolderFromTaskKey(key3);
        this._log(localize(19503, null, key3, task, folderInfo.folder), true);
        addTaskToMap(folderInfo.isWorkspaceFile ? workspaceToTaskMap : folderToTasksMap, folderInfo.folder, task);
      } catch (error) {
        this._log(localize(19502, null, error), true);
      }
    }
    const readTasksMap = /* @__PURE__ */ new Map();
    async function readTasks(that, map, isWorkspaceFile) {
      for (const key3 of map.keys()) {
        const custom = [];
        const customized = /* @__PURE__ */ Object.create(null);
        const taskConfigSource = folderMap[key3] ? isWorkspaceFile ? 1 /* WorkspaceFile */ : 0 /* TasksJson */ : 2 /* User */;
        await that._computeTasksForSingleConfig(folderMap[key3] ?? await that._getAFolder(), {
          version: "2.0.0",
          tasks: map.get(key3)
        }, 0 /* System */, custom, customized, taskConfigSource, true);
        custom.forEach((task) => {
          const taskKey = task.getKey();
          if (taskKey) {
            readTasksMap.set(taskKey, task);
          }
        });
        for (const configuration2 of Object.keys(customized)) {
          const taskKey = customized[configuration2].getKey();
          if (taskKey) {
            readTasksMap.set(taskKey, customized[configuration2]);
          }
        }
      }
    }
    await readTasks(this, folderToTasksMap, false);
    await readTasks(this, workspaceToTaskMap, true);
    for (const key3 of storedTasks.keys()) {
      if (readTasksMap.has(key3)) {
        tasks2.push(readTasksMap.get(key3));
        this._log(localize(19504, null, key3), true);
      } else {
        this._log(localize(19505, null, key3), true);
      }
    }
    return tasks2;
  }
  removeRecentlyUsedTask(taskRecentlyUsedKey) {
    if (this._getTasksFromStorage("historical").delete(taskRecentlyUsedKey)) {
      this._saveRecentlyUsedTasks();
    }
  }
  removePersistentTask(key3) {
    this._log(localize(19541, null, key3), true);
    if (this._getTasksFromStorage("persistent").delete(key3)) {
      this._savePersistentTasks();
    }
  }
  _setTaskLRUCacheLimit() {
    const quickOpenHistoryLimit = this._configurationService.getValue(QUICKOPEN_HISTORY_LIMIT_CONFIG);
    if (this._recentlyUsedTasks) {
      this._recentlyUsedTasks.limit = quickOpenHistoryLimit;
    }
  }
  async _setRecentlyUsedTask(task) {
    let key3 = task.getKey();
    if (!InMemoryTask.is(task) && key3) {
      const customizations = this._createCustomizableTask(task);
      if (ContributedTask.is(task) && customizations) {
        const custom = [];
        const customized = /* @__PURE__ */ Object.create(null);
        await this._computeTasksForSingleConfig(task._source.workspaceFolder ?? this.workspaceFolders[0], {
          version: "2.0.0",
          tasks: [customizations]
        }, 0 /* System */, custom, customized, 0 /* TasksJson */, true);
        for (const configuration2 of Object.keys(customized)) {
          key3 = customized[configuration2].getKey();
        }
      }
      this._getTasksFromStorage("historical").set(key3, JSON.stringify(customizations));
      this._saveRecentlyUsedTasks();
    }
  }
  _saveRecentlyUsedTasks() {
    if (!this._recentlyUsedTasks) {
      return;
    }
    const quickOpenHistoryLimit = this._configurationService.getValue(QUICKOPEN_HISTORY_LIMIT_CONFIG);
    if (quickOpenHistoryLimit === 0) {
      return;
    }
    let keys = [...this._recentlyUsedTasks.keys()];
    if (keys.length > quickOpenHistoryLimit) {
      keys = keys.slice(0, quickOpenHistoryLimit);
    }
    const keyValues = [];
    for (const key3 of keys) {
      keyValues.push([key3, this._recentlyUsedTasks.get(key3, 0 /* None */)]);
    }
    this._storageService.store(AbstractTaskService.RecentlyUsedTasks_KeyV2, JSON.stringify(keyValues), 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  async _setPersistentTask(task) {
    if (!this._configurationService.getValue("task.reconnection" /* Reconnection */)) {
      return;
    }
    let key3 = task.getKey();
    if (!InMemoryTask.is(task) && key3) {
      const customizations = this._createCustomizableTask(task);
      if (ContributedTask.is(task) && customizations) {
        const custom = [];
        const customized = /* @__PURE__ */ Object.create(null);
        await this._computeTasksForSingleConfig(task._source.workspaceFolder ?? this.workspaceFolders[0], {
          version: "2.0.0",
          tasks: [customizations]
        }, 0 /* System */, custom, customized, 0 /* TasksJson */, true);
        for (const configuration2 of Object.keys(customized)) {
          key3 = customized[configuration2].getKey();
        }
      }
      if (!task.configurationProperties.isBackground) {
        return;
      }
      this._log(localize(19543, null, key3), true);
      this._getTasksFromStorage("persistent").set(key3, JSON.stringify(customizations));
      this._savePersistentTasks();
    }
  }
  _savePersistentTasks() {
    this._persistentTasks = this._getTasksFromStorage("persistent");
    const keys = [...this._persistentTasks.keys()];
    const keyValues = [];
    for (const key3 of keys) {
      keyValues.push([key3, this._persistentTasks.get(key3, 0 /* None */)]);
    }
    this._log(localize(19478, null, keys.join(", ")), true);
    this._storageService.store(AbstractTaskService.PersistentTasks_Key, JSON.stringify(keyValues), 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  _openDocumentation() {
    this._openerService.open(URI.parse("https://code.visualstudio.com/docs/editor/tasks#_defining-a-problem-matcher"));
  }
  async _findSingleWorkspaceTaskOfGroup(group2) {
    const tasksOfGroup = await this._findWorkspaceTasksInGroup(group2, true);
    if (tasksOfGroup.length === 1 && typeof tasksOfGroup[0].configurationProperties.group !== "string" && tasksOfGroup[0].configurationProperties.group?.isDefault) {
      let resolvedTask;
      if (ConfiguringTask.is(tasksOfGroup[0])) {
        resolvedTask = await this.tryResolveTask(tasksOfGroup[0]);
      } else {
        resolvedTask = tasksOfGroup[0];
      }
      if (resolvedTask) {
        return this.run(resolvedTask, void 0, 1 /* User */);
      }
    }
    return void 0;
  }
  async _build() {
    const tryBuildShortcut = await this._findSingleWorkspaceTaskOfGroup(TaskGroup2.Build);
    if (tryBuildShortcut) {
      return tryBuildShortcut;
    }
    return this._getGroupedTasksAndExecute();
  }
  async _runTest() {
    const tryTestShortcut = await this._findSingleWorkspaceTaskOfGroup(TaskGroup2.Test);
    if (tryTestShortcut) {
      return tryTestShortcut;
    }
    return this._getGroupedTasksAndExecute(true);
  }
  async _getGroupedTasksAndExecute(test) {
    const tasks2 = await this._getGroupedTasks();
    const runnable = this._createRunnableTask(tasks2, test ? TaskGroup2.Test : TaskGroup2.Build);
    if (!runnable || !runnable.task) {
      if (test) {
        if (this.schemaVersion === 1 /* V0_1_0 */) {
          throw new TaskError(severity_default.Info, localize(19523, null), 3 /* NoTestTask */);
        } else {
          throw new TaskError(severity_default.Info, localize(19524, null), 3 /* NoTestTask */);
        }
      } else {
        if (this.schemaVersion === 1 /* V0_1_0 */) {
          throw new TaskError(severity_default.Info, localize(19511, null), 2 /* NoBuildTask */);
        } else {
          throw new TaskError(severity_default.Info, localize(19512, null), 2 /* NoBuildTask */);
        }
      }
    }
    let executeTaskResult;
    try {
      executeTaskResult = await this._executeTask(runnable.task, runnable.resolver, 1 /* User */);
    } catch (error) {
      this._handleError(error);
      return Promise.reject(error);
    }
    return executeTaskResult;
  }
  async run(task, options3, runSource = 0 /* System */) {
    if (!await this._trust()) {
      return;
    }
    if (!task) {
      throw new TaskError(severity_default.Info, localize(19490, null), 5 /* TaskNotFound */);
    }
    const resolver = this._createResolver();
    let executeTaskResult;
    try {
      if (options3 && options3.attachProblemMatcher && this._shouldAttachProblemMatcher(task) && !InMemoryTask.is(task)) {
        const taskToExecute = await this._attachProblemMatcher(task);
        if (taskToExecute) {
          executeTaskResult = await this._executeTask(taskToExecute, resolver, runSource);
        }
      } else {
        executeTaskResult = await this._executeTask(task, resolver, runSource);
      }
      return executeTaskResult;
    } catch (error) {
      this._handleError(error);
      return Promise.reject(error);
    }
  }
  _isProvideTasksEnabled() {
    const settingValue = this._configurationService.getValue("task.autoDetect" /* AutoDetect */);
    return settingValue === "on";
  }
  _isProblemMatcherPromptEnabled(type) {
    const settingValue = this._configurationService.getValue(PROBLEM_MATCHER_NEVER_CONFIG);
    if (isBoolean(settingValue)) {
      return !settingValue;
    }
    if (type === void 0) {
      return true;
    }
    const settingValueMap = settingValue;
    return !settingValueMap[type];
  }
  _getTypeForTask(task) {
    let type;
    if (CustomTask.is(task)) {
      const configProperties = task._source.config.element;
      type = configProperties.type ?? "";
    } else {
      type = task.getDefinition().type;
    }
    return type;
  }
  _shouldAttachProblemMatcher(task) {
    const enabled = this._isProblemMatcherPromptEnabled(this._getTypeForTask(task));
    if (enabled === false) {
      return false;
    }
    if (!this._canCustomize(task)) {
      return false;
    }
    if (task.configurationProperties.group !== void 0 && task.configurationProperties.group !== TaskGroup2.Build) {
      return false;
    }
    if (task.configurationProperties.problemMatchers !== void 0 && task.configurationProperties.problemMatchers.length > 0) {
      return false;
    }
    if (ContributedTask.is(task)) {
      return !task.hasDefinedMatchers && !!task.configurationProperties.problemMatchers && task.configurationProperties.problemMatchers.length === 0;
    }
    if (CustomTask.is(task)) {
      const configProperties = task._source.config.element;
      return configProperties.problemMatcher === void 0 && !task.hasDefinedMatchers;
    }
    return false;
  }
  async _updateNeverProblemMatcherSetting(type) {
    const current = this._configurationService.getValue(PROBLEM_MATCHER_NEVER_CONFIG);
    if (current === true) {
      return;
    }
    let newValue;
    if (current !== false) {
      newValue = current;
    } else {
      newValue = /* @__PURE__ */ Object.create(null);
    }
    newValue[type] = true;
    return this._configurationService.updateValue(PROBLEM_MATCHER_NEVER_CONFIG, newValue);
  }
  async _attachProblemMatcher(task) {
    let entries2 = [];
    for (const key3 of ProblemMatcherRegistry.keys()) {
      const matcher = ProblemMatcherRegistry.get(key3);
      if (matcher.deprecated) {
        continue;
      }
      if (matcher.name === matcher.label) {
        entries2.push({ label: matcher.name, matcher });
      } else {
        entries2.push({
          label: matcher.label,
          description: `$${matcher.name}`,
          matcher
        });
      }
    }
    if (entries2.length === 0) {
      return;
    }
    entries2 = entries2.sort((a, b) => {
      if (a.label && b.label) {
        return a.label.localeCompare(b.label);
      } else {
        return 0;
      }
    });
    entries2.unshift({ type: "separator", label: localize(19491, null) });
    let taskType2;
    if (CustomTask.is(task)) {
      const configProperties = task._source.config.element;
      taskType2 = configProperties.type ?? "";
    } else {
      taskType2 = task.getDefinition().type;
    }
    entries2.unshift(
      { label: localize(19492, null), matcher: void 0 },
      { label: localize(19494, null), matcher: void 0, never: true },
      { label: localize(19495, null, taskType2), matcher: void 0, setting: taskType2 },
      { label: localize(19493, null), matcher: void 0, learnMore: true }
    );
    const problemMatcher = await this._quickInputService.pick(entries2, { placeHolder: localize(19479, null) });
    if (!problemMatcher) {
      return task;
    }
    if (problemMatcher.learnMore) {
      this._openDocumentation();
      return void 0;
    }
    if (problemMatcher.never) {
      this.customize(task, { problemMatcher: [] }, true);
      return task;
    }
    if (problemMatcher.matcher) {
      const newTask = task.clone();
      const matcherReference = `$${problemMatcher.matcher.name}`;
      const properties = { problemMatcher: [matcherReference] };
      newTask.configurationProperties.problemMatchers = [matcherReference];
      const matcher = ProblemMatcherRegistry.get(problemMatcher.matcher.name);
      if (matcher && matcher.watching !== void 0) {
        properties.isBackground = true;
        newTask.configurationProperties.isBackground = true;
      }
      this.customize(task, properties, true);
      return newTask;
    }
    if (problemMatcher.setting) {
      await this._updateNeverProblemMatcherSetting(problemMatcher.setting);
    }
    return task;
  }
  async _getTasksForGroup(group2, waitToActivate) {
    const groups = await this._getGroupedTasks(void 0, waitToActivate);
    const result = [];
    groups.forEach((tasks2) => {
      for (const task of tasks2) {
        const configTaskGroup = TaskGroup2.from(task.configurationProperties.group);
        if (configTaskGroup?._id === group2._id) {
          result.push(task);
        }
      }
    });
    return result;
  }
  needsFolderQualification() {
    return this._contextService.getWorkbenchState() === 3 /* WORKSPACE */;
  }
  _canCustomize(task) {
    if (this.schemaVersion !== 2 /* V2_0_0 */) {
      return false;
    }
    if (CustomTask.is(task)) {
      return true;
    }
    if (ContributedTask.is(task)) {
      return !!task.getWorkspaceFolder();
    }
    return false;
  }
  async _formatTaskForJson(resource, task) {
    let reference;
    let stringValue2 = "";
    try {
      reference = await this._textModelResolverService.createModelReference(resource);
      const model = reference.object.textEditorModel;
      const { tabSize, insertSpaces } = model.getOptions();
      const eol = model.getEOL();
      let stringified = toFormattedString(task, { eol, tabSize, insertSpaces });
      const regex = new RegExp(eol + (insertSpaces ? " ".repeat(tabSize) : "\\t"), "g");
      stringified = stringified.replace(regex, eol + (insertSpaces ? " ".repeat(tabSize * 3) : "			"));
      const twoTabs = insertSpaces ? " ".repeat(tabSize * 2) : "		";
      stringValue2 = twoTabs + stringified.slice(0, stringified.length - 1) + twoTabs + stringified.slice(stringified.length - 1);
    } finally {
      reference?.dispose();
    }
    return stringValue2;
  }
  async _openEditorAtTask(resource, task, configIndex = -1) {
    if (resource === void 0) {
      return Promise.resolve(false);
    }
    const fileContent = await this._fileService.readFile(resource);
    const content = fileContent.value;
    if (!content || !task) {
      return false;
    }
    const contentValue = content.toString();
    let stringValue2;
    if (configIndex !== -1) {
      const json = this._configurationService.getValue("tasks", { resource });
      if (json.tasks && json.tasks.length > configIndex) {
        stringValue2 = await this._formatTaskForJson(resource, json.tasks[configIndex]);
      }
    }
    if (!stringValue2) {
      if (typeof task === "string") {
        stringValue2 = task;
      } else {
        stringValue2 = await this._formatTaskForJson(resource, task);
      }
    }
    const index2 = contentValue.indexOf(stringValue2);
    let startLineNumber = 1;
    for (let i2 = 0; i2 < index2; i2++) {
      if (contentValue.charAt(i2) === "\n") {
        startLineNumber++;
      }
    }
    let endLineNumber = startLineNumber;
    for (let i2 = 0; i2 < stringValue2.length; i2++) {
      if (stringValue2.charAt(i2) === "\n") {
        endLineNumber++;
      }
    }
    const selection = startLineNumber > 1 ? { startLineNumber, startColumn: startLineNumber === endLineNumber ? 4 : 3, endLineNumber, endColumn: startLineNumber === endLineNumber ? void 0 : 4 } : void 0;
    await this._editorService.openEditor({
      resource,
      options: {
        pinned: false,
        forceReload: true,
        // because content might have changed
        selection,
        selectionRevealType: 1 /* CenterIfOutsideViewport */
      }
    });
    return !!selection;
  }
  _createCustomizableTask(task) {
    let toCustomize;
    const taskConfig = CustomTask.is(task) || ConfiguringTask.is(task) ? task._source.config : void 0;
    if (taskConfig && taskConfig.element) {
      toCustomize = { ...taskConfig.element };
    } else if (ContributedTask.is(task)) {
      toCustomize = {};
      const identifier2 = Object.assign(/* @__PURE__ */ Object.create(null), task.defines);
      delete identifier2["_key"];
      Object.keys(identifier2).forEach((key3) => toCustomize[key3] = identifier2[key3]);
      if (task.configurationProperties.problemMatchers && task.configurationProperties.problemMatchers.length > 0 && isStringArray(task.configurationProperties.problemMatchers)) {
        toCustomize.problemMatcher = task.configurationProperties.problemMatchers;
      }
      if (task.configurationProperties.group) {
        toCustomize.group = GroupKind.to(task.configurationProperties.group);
      }
    }
    if (!toCustomize) {
      return void 0;
    }
    if (toCustomize.problemMatcher === void 0 && task.configurationProperties.problemMatchers === void 0 || task.configurationProperties.problemMatchers && task.configurationProperties.problemMatchers.length === 0) {
      toCustomize.problemMatcher = [];
    }
    if (task._source.label !== "Workspace") {
      toCustomize.label = task.configurationProperties.identifier;
    } else {
      toCustomize.label = task._label;
    }
    toCustomize.detail = task.configurationProperties.detail;
    return toCustomize;
  }
  async customize(task, properties, openConfig) {
    if (!await this._trust()) {
      return;
    }
    const workspaceFolder = task.getWorkspaceFolder();
    if (!workspaceFolder) {
      return Promise.resolve(void 0);
    }
    const configuration2 = this._getConfiguration(workspaceFolder, task._source.kind);
    if (configuration2.hasParseErrors) {
      this._notificationService.warn(localize(19467, null));
      return Promise.resolve(void 0);
    }
    const fileConfig = configuration2.config;
    const toCustomize = this._createCustomizableTask(task);
    if (!toCustomize) {
      return Promise.resolve(void 0);
    }
    const index2 = CustomTask.is(task) ? task._source.config.index : void 0;
    if (properties) {
      for (const property of Object.getOwnPropertyNames(properties)) {
        const value2 = properties[property];
        if (value2 !== void 0 && value2 !== null) {
          toCustomize[property] = value2;
        }
      }
    }
    if (!fileConfig) {
      const value2 = {
        version: "2.0.0",
        tasks: [toCustomize]
      };
      let content = [
        "{",
        localize(19553, null)
      ].join("\n") + JSON.stringify(value2, null, "	").substr(1);
      const editorConfig = this._configurationService.getValue();
      if (editorConfig.editor.insertSpaces) {
        content = content.replace(/(\n)(\t+)/g, (_, s1, s2) => s1 + " ".repeat(s2.length * editorConfig.editor.tabSize));
      }
      await this._textFileService.create([{ resource: workspaceFolder.toResource(".vscode/tasks.json"), value: content }]);
    } else {
      if (index2 === -1 && properties) {
        if (properties.problemMatcher !== void 0) {
          fileConfig.problemMatcher = properties.problemMatcher;
          await this._writeConfiguration(workspaceFolder, "tasks.problemMatchers", fileConfig.problemMatcher, task._source.kind);
        } else if (properties.group !== void 0) {
          fileConfig.group = properties.group;
          await this._writeConfiguration(workspaceFolder, "tasks.group", fileConfig.group, task._source.kind);
        }
      } else {
        if (!Array.isArray(fileConfig.tasks)) {
          fileConfig.tasks = [];
        }
        if (index2 === void 0) {
          fileConfig.tasks.push(toCustomize);
        } else {
          fileConfig.tasks[index2] = toCustomize;
        }
        await this._writeConfiguration(workspaceFolder, "tasks.tasks", fileConfig.tasks, task._source.kind);
      }
    }
    if (openConfig) {
      this._openEditorAtTask(this._getResourceForTask(task), toCustomize);
    }
  }
  _writeConfiguration(workspaceFolder, key3, value2, source) {
    let target = void 0;
    switch (source) {
      case TaskSourceKind.User:
        target = 2 /* USER */;
        break;
      case TaskSourceKind.WorkspaceFile:
        target = 5 /* WORKSPACE */;
        break;
      default:
        if (this._contextService.getWorkbenchState() === 2 /* FOLDER */) {
          target = 5 /* WORKSPACE */;
        } else if (this._contextService.getWorkbenchState() === 3 /* WORKSPACE */) {
          target = 6 /* WORKSPACE_FOLDER */;
        }
    }
    if (target) {
      return this._configurationService.updateValue(key3, value2, { resource: workspaceFolder.uri }, target);
    } else {
      return void 0;
    }
  }
  _getResourceForKind(kind) {
    this._updateSetup();
    switch (kind) {
      case TaskSourceKind.User: {
        return joinPath(dirname2(this._preferencesService.userSettingsResource), "tasks.json");
      }
      case TaskSourceKind.WorkspaceFile: {
        if (this._workspace && this._workspace.configuration) {
          return this._workspace.configuration;
        }
      }
      default: {
        return void 0;
      }
    }
  }
  _getResourceForTask(task) {
    if (CustomTask.is(task)) {
      let uri4 = this._getResourceForKind(task._source.kind);
      if (!uri4) {
        const taskFolder = task.getWorkspaceFolder();
        if (taskFolder) {
          uri4 = taskFolder.toResource(task._source.config.file);
        } else {
          uri4 = this.workspaceFolders[0].uri;
        }
      }
      return uri4;
    } else {
      return task.getWorkspaceFolder().toResource(".vscode/tasks.json");
    }
  }
  async openConfig(task) {
    let resource;
    if (task) {
      resource = this._getResourceForTask(task);
    } else {
      resource = this._workspaceFolders && this._workspaceFolders.length > 0 ? this._workspaceFolders[0].toResource(".vscode/tasks.json") : void 0;
    }
    return this._openEditorAtTask(resource, task ? task._label : void 0, task ? task._source.config.index : -1);
  }
  _createRunnableTask(tasks2, group2) {
    const resolverData = /* @__PURE__ */ new Map();
    const workspaceTasks = [];
    const extensionTasks = [];
    tasks2.forEach((tasks3, folder) => {
      let data = resolverData.get(folder);
      if (!data) {
        data = {
          id: /* @__PURE__ */ new Map(),
          label: /* @__PURE__ */ new Map(),
          identifier: /* @__PURE__ */ new Map()
        };
        resolverData.set(folder, data);
      }
      for (const task of tasks3) {
        data.id.set(task._id, task);
        data.label.set(task._label, task);
        if (task.configurationProperties.identifier) {
          data.identifier.set(task.configurationProperties.identifier, task);
        }
        if (group2 && task.configurationProperties.group === group2) {
          if (task._source.kind === TaskSourceKind.Workspace) {
            workspaceTasks.push(task);
          } else {
            extensionTasks.push(task);
          }
        }
      }
    });
    const resolver = {
      resolve: async (uri4, alias) => {
        const data = resolverData.get(typeof uri4 === "string" ? uri4 : uri4.toString());
        if (!data) {
          return void 0;
        }
        return data.id.get(alias) || data.label.get(alias) || data.identifier.get(alias);
      }
    };
    if (workspaceTasks.length > 0) {
      if (workspaceTasks.length > 1) {
        this._log(localize(19470, null));
      }
      return { task: workspaceTasks[0], resolver };
    }
    if (extensionTasks.length === 0) {
      return void 0;
    }
    if (extensionTasks.length === 1) {
      return { task: extensionTasks[0], resolver };
    } else {
      const id2 = generateUuid();
      const task = new InMemoryTask(
        id2,
        { kind: TaskSourceKind.InMemory, label: "inMemory" },
        id2,
        "inMemory",
        { reevaluateOnRerun: true },
        {
          identifier: id2,
          dependsOn: extensionTasks.map((extensionTask) => {
            return { uri: extensionTask.getWorkspaceFolder().uri, task: extensionTask._id };
          }),
          name: id2
        }
      );
      return { task, resolver };
    }
  }
  _createResolver(grouped) {
    let resolverData;
    async function quickResolve(that, uri4, identifier2) {
      const foundTasks = await that._findWorkspaceTasks((task2) => {
        const taskUri = ConfiguringTask.is(task2) || CustomTask.is(task2) ? task2._source.config.workspaceFolder?.uri : void 0;
        const originalUri = typeof uri4 === "string" ? uri4 : uri4.toString();
        if (taskUri?.toString() !== originalUri) {
          return false;
        }
        if (isString(identifier2)) {
          return task2._label === identifier2 || task2.configurationProperties.identifier === identifier2;
        } else {
          const keyedIdentifier = task2.getDefinition(true);
          const searchIdentifier = TaskDefinition.createTaskIdentifier(identifier2, console);
          return searchIdentifier && keyedIdentifier ? searchIdentifier._key === keyedIdentifier._key : false;
        }
      });
      if (foundTasks.length === 0) {
        return void 0;
      }
      const task = foundTasks[0];
      if (ConfiguringTask.is(task)) {
        return that.tryResolveTask(task);
      }
      return task;
    }
    async function getResolverData(that) {
      if (resolverData === void 0) {
        resolverData = /* @__PURE__ */ new Map();
        (grouped || await that._getGroupedTasks()).forEach((tasks2, folder) => {
          let data = resolverData.get(folder);
          if (!data) {
            data = { label: /* @__PURE__ */ new Map(), identifier: /* @__PURE__ */ new Map(), taskIdentifier: /* @__PURE__ */ new Map() };
            resolverData.set(folder, data);
          }
          for (const task of tasks2) {
            data.label.set(task._label, task);
            if (task.configurationProperties.identifier) {
              data.identifier.set(task.configurationProperties.identifier, task);
            }
            const keyedIdentifier = task.getDefinition(true);
            if (keyedIdentifier !== void 0) {
              data.taskIdentifier.set(keyedIdentifier._key, task);
            }
          }
        });
      }
      return resolverData;
    }
    async function fullResolve(that, uri4, identifier2) {
      const allResolverData = await getResolverData(that);
      const data = allResolverData.get(typeof uri4 === "string" ? uri4 : uri4.toString());
      if (!data) {
        return void 0;
      }
      if (isString(identifier2)) {
        return data.label.get(identifier2) || data.identifier.get(identifier2);
      } else {
        const key3 = TaskDefinition.createTaskIdentifier(identifier2, console);
        return key3 !== void 0 ? data.taskIdentifier.get(key3._key) : void 0;
      }
    }
    return {
      resolve: async (uri4, identifier2) => {
        if (!identifier2) {
          return void 0;
        }
        if (resolverData === void 0 && grouped === void 0) {
          return await quickResolve(this, uri4, identifier2) ?? fullResolve(this, uri4, identifier2);
        } else {
          return fullResolve(this, uri4, identifier2);
        }
      }
    };
  }
  async _saveBeforeRun() {
    let SaveBeforeRunConfigOptions;
    ((SaveBeforeRunConfigOptions2) => {
      SaveBeforeRunConfigOptions2["Always"] = "always";
      SaveBeforeRunConfigOptions2["Never"] = "never";
      SaveBeforeRunConfigOptions2["Prompt"] = "prompt";
    })(SaveBeforeRunConfigOptions || (SaveBeforeRunConfigOptions = {}));
    const saveBeforeRunTaskConfig = this._configurationService.getValue("task.saveBeforeRun" /* SaveBeforeRun */);
    if (saveBeforeRunTaskConfig === "never" /* Never */) {
      return false;
    } else if (saveBeforeRunTaskConfig === "prompt" /* Prompt */ && this._editorService.editors.some((e4) => e4.isDirty())) {
      const { confirmed } = await this._dialogService.confirm({
        message: localize(19562, null),
        detail: localize(19468, null),
        primaryButton: localize(19477, null),
        cancelButton: localize(19476, null)
      });
      if (!confirmed) {
        return false;
      }
    }
    await this._editorService.saveAll({ reason: 1 /* EXPLICIT */ });
    return true;
  }
  async _executeTask(task, resolver, runSource) {
    let taskToRun = task;
    if (await this._saveBeforeRun()) {
      await this._configurationService.reloadConfiguration();
      await this._updateWorkspaceTasks();
      const taskFolder = task.getWorkspaceFolder();
      const taskIdentifier2 = task.configurationProperties.identifier;
      const taskType2 = CustomTask.is(task) ? task.customizes()?.type : ContributedTask.is(task) ? task.type : void 0;
      taskToRun = (taskFolder && taskIdentifier2 && runSource === 1 /* User */ ? await this.getTask(taskFolder, taskIdentifier2, false, taskType2) : task) ?? task;
    }
    await ProblemMatcherRegistry.onReady();
    const executeResult = runSource === 4 /* Reconnect */ ? this._getTaskSystem().reconnect(taskToRun, resolver) : this._getTaskSystem().run(taskToRun, resolver);
    if (executeResult) {
      return this._handleExecuteResult(executeResult, runSource);
    }
    return { exitCode: 0 };
  }
  async _handleExecuteResult(executeResult, runSource) {
    if (runSource && executeResult.task._id) {
      this._taskRunSources.set(executeResult.task._id, runSource);
    }
    if (runSource === 1 /* User */) {
      await this._setRecentlyUsedTask(executeResult.task);
    }
    if (executeResult.kind === 2 /* Active */) {
      const active = executeResult.active;
      if (active && active.same && runSource === 2 /* FolderOpen */ || runSource === 4 /* Reconnect */) {
        this._logService.debug("Ignoring task that is already active", executeResult.task);
        return executeResult.promise;
      }
      if (active && active.same) {
        this._handleInstancePolicy(executeResult.task, executeResult.task.runOptions.instancePolicy);
      } else {
        throw new TaskError(severity_default.Warning, localize(19556, null), 1 /* RunningTask */);
      }
    }
    this._setRecentlyUsedTask(executeResult.task);
    return executeResult.promise;
  }
  _handleInstancePolicy(task, policy) {
    if (!this._taskSystem?.isTaskVisible(task)) {
      this._taskSystem?.revealTask(task);
    }
    switch (policy) {
      case "terminateNewest" /* terminateNewest */:
        this._restart(this._getTaskSystem().getLastInstance(task) ?? task);
        break;
      case "terminateOldest" /* terminateOldest */:
        this._restart(this._getTaskSystem().getFirstInstance(task) ?? task);
        break;
      case "silent" /* silent */:
        break;
      case "warn" /* warn */:
        this._notificationService.warn(localize(19558, null));
        break;
      case "prompt" /* prompt */:
      default: {
        if (this._environmentService.isSessionsWindow) {
          this._logService.warn(`[tasks] InstancePolicy.prompt hit in sessions window for task '${task._label}'
${new Error().stack}`);
        }
        this._showQuickPick(
          this._taskSystem.getActiveTasks().filter((t2) => task._id === t2._id),
          localize(19509, null),
          {
            label: localize(19515, null),
            task: void 0
          },
          false,
          true,
          void 0
        ).then((entry) => {
          const task2 = entry ? entry.task : void 0;
          if (task2 === void 0 || task2 === null) {
            return;
          }
          this._restart(task2);
        });
      }
    }
  }
  async _restart(task) {
    if (!this._taskSystem) {
      return;
    }
    const isTaskRunning = await this.getActiveTasks().then((tasks2) => tasks2.some((t2) => t2.getMapKey() === task.getMapKey()));
    if (isTaskRunning) {
      const response = await this._taskSystem.terminate(task);
      if (!response.success) {
        this._notificationService.warn(localize(19561, null, isString(task) ? task : task.configurationProperties.name));
        return;
      }
    }
    try {
      const updatedTask = await this._findUpdatedTask(task);
      if (updatedTask) {
        await this.run(updatedTask);
      } else {
        const success = await this.run(task);
        if (!success || typeof success.exitCode === "number" && success.exitCode !== 0) {
          this._notificationService.warn(localize(19563, null, task.configurationProperties.name));
        }
      }
    } catch {
    }
  }
  async _findUpdatedTask(originalTask) {
    const mapStringToFolderTasks = await this._updateWorkspaceTasks(0 /* System */);
    for (const [_, folderResult] of mapStringToFolderTasks) {
      if (!folderResult.set?.tasks?.length && !folderResult.configurations?.byIdentifier) {
        continue;
      }
      if (folderResult.set?.tasks) {
        for (const task of folderResult.set.tasks) {
          if (task._id === originalTask._id) {
            return task;
          }
        }
      }
      if (folderResult.configurations?.byIdentifier) {
        for (const [_2, configuringTask] of Object.entries(folderResult.configurations.byIdentifier)) {
          if (configuringTask._id === originalTask._id) {
            return this.tryResolveTask(configuringTask);
          }
        }
      }
    }
    if (ContributedTask.is(originalTask)) {
      const allTasks = await this.tasks({ type: originalTask.type });
      for (const task of allTasks) {
        if (task._id === originalTask._id) {
          return task;
        }
      }
    }
    return void 0;
  }
  async terminate(task) {
    if (!await this._trust()) {
      return { success: true, task: void 0 };
    }
    if (!this._taskSystem) {
      return { success: true, task: void 0 };
    }
    return this._taskSystem.terminate(task);
  }
  _terminateAll() {
    if (!this._taskSystem) {
      return Promise.resolve([]);
    }
    return this._taskSystem.terminateAll();
  }
  _createTerminalTaskSystem() {
    return new TerminalTaskSystem(
      this._terminalService,
      this._terminalGroupService,
      this._outputService,
      this._paneCompositeService,
      this._viewsService,
      this._markerService,
      this._modelService,
      this._configurationResolverService,
      this._contextService,
      this._environmentService,
      AbstractTaskService.OutputChannelId,
      this._fileService,
      this._terminalProfileResolverService,
      this._pathService,
      this._viewDescriptorService,
      this._logService,
      this._notificationService,
      this._contextKeyService,
      this._instantiationService,
      (workspaceFolder) => {
        if (workspaceFolder) {
          return this._getTaskSystemInfo(workspaceFolder.uri.scheme);
        } else if (this._taskSystemInfos.size > 0) {
          const infos = Array.from(this._taskSystemInfos.entries());
          const notFile = infos.filter((info) => info[0] !== Schemas.file);
          if (notFile.length > 0) {
            return notFile[0][1][0];
          }
          return infos[0][1][0];
        } else {
          return void 0;
        }
      },
      async (taskKey) => {
        const taskMap = await this._getGroupedTasks();
        const allTasks = taskMap.all();
        for (const task of allTasks) {
          if (task.getMapKey() === taskKey) {
            return task;
          }
        }
        return void 0;
      }
    );
  }
  _isTaskProviderEnabled(type) {
    const definition = TaskDefinitionRegistry.get(type);
    return !definition || !definition.when || this._contextKeyService.contextMatchesRules(definition.when);
  }
  async _getGroupedTasks(filter2, waitToActivate, knownOnlyOrTrusted) {
    await this._waitForAllSupportedExecutions;
    const type = filter2?.type;
    const needsRecentTasksMigration = this._needsRecentTasksMigration();
    if (!waitToActivate) {
      await this._activateTaskProviders(filter2?.type);
    }
    const validTypes = /* @__PURE__ */ Object.create(null);
    TaskDefinitionRegistry.all().forEach((definition) => validTypes[definition.taskType] = true);
    validTypes["shell"] = true;
    validTypes["process"] = true;
    const contributedTaskSets = await new Promise((resolve3) => {
      const result2 = [];
      let counter = 0;
      const done = (value2) => {
        if (value2) {
          result2.push(value2);
        }
        if (--counter === 0) {
          resolve3(result2);
        }
      };
      const error = (error2) => {
        try {
          if (!isCancellationError(error2)) {
            if (error2 && isString(error2.message)) {
              this._log(`Error: ${error2.message}
`);
              this._showOutput(void 0, void 0, error2.message);
            } else {
              this._log("Unknown error received while collecting tasks from providers.");
              this._showOutput();
            }
          }
        } finally {
          if (--counter === 0) {
            resolve3(result2);
          }
        }
      };
      if (this._isProvideTasksEnabled() && this.schemaVersion === 2 /* V2_0_0 */ && this._providers.size > 0) {
        let foundAnyProviders = false;
        for (const [handle2, provider] of this._providers) {
          const providerType = this._providerTypes.get(handle2);
          if (type === void 0 || type === providerType) {
            if (providerType && !this._isTaskProviderEnabled(providerType)) {
              continue;
            }
            foundAnyProviders = true;
            counter++;
            raceTimeout(provider.provideTasks(validTypes).then((taskSet) => {
              for (const task of taskSet.tasks) {
                if (task.type !== this._providerTypes.get(handle2)) {
                  this._log(localize(19571, null, this._providerTypes.get(handle2), task.type));
                  if (task.type !== "shell" && task.type !== "process") {
                    this._showOutput();
                  }
                  break;
                }
              }
              return done(taskSet);
            }, error), 5e3, () => {
              done(void 0);
            });
          }
        }
        if (!foundAnyProviders) {
          resolve3(result2);
        }
      } else {
        resolve3(result2);
      }
    });
    const result = new TaskMap();
    const contributedTasks = new TaskMap();
    for (const set of contributedTaskSets) {
      for (const task of set.tasks) {
        const workspaceFolder = task.getWorkspaceFolder();
        if (workspaceFolder) {
          contributedTasks.add(workspaceFolder, task);
        }
      }
    }
    try {
      let tasks2 = [];
      if (!knownOnlyOrTrusted || this._workspaceTrustManagementService.isWorkspaceTrusted()) {
        tasks2 = Array.from(await this.getWorkspaceTasks());
      }
      await Promise.all(this._getCustomTaskPromises(tasks2, filter2, result, contributedTasks, waitToActivate));
      if (needsRecentTasksMigration) {
        await this._migrateRecentTasks(result.all());
      }
      return result;
    } catch {
      const result2 = new TaskMap();
      for (const set of contributedTaskSets) {
        for (const task of set.tasks) {
          const folder = task.getWorkspaceFolder();
          if (folder) {
            result2.add(folder, task);
          }
        }
      }
      return result2;
    }
  }
  _getCustomTaskPromises(customTasksKeyValuePairs, filter2, result, contributedTasks, waitToActivate) {
    return customTasksKeyValuePairs.map(async ([key3, folderTasks]) => {
      const contributed = contributedTasks.get(key3);
      if (!folderTasks.set) {
        if (contributed) {
          result.add(key3, ...contributed);
        }
        return;
      }
      if (this._contextService.getWorkbenchState() === 1 /* EMPTY */) {
        result.add(key3, ...folderTasks.set.tasks);
      } else {
        const configurations = folderTasks.configurations;
        const legacyTaskConfigurations = folderTasks.set ? this._getLegacyTaskConfigurations(folderTasks.set) : void 0;
        const customTasksToDelete = [];
        if (configurations || legacyTaskConfigurations) {
          const unUsedConfigurations = /* @__PURE__ */ new Set();
          if (configurations) {
            Object.keys(configurations.byIdentifier).forEach((key4) => unUsedConfigurations.add(key4));
          }
          for (const task of contributed) {
            if (!ContributedTask.is(task)) {
              continue;
            }
            if (configurations) {
              const configuringTask = configurations.byIdentifier[task.defines._key];
              if (configuringTask) {
                unUsedConfigurations.delete(task.defines._key);
                result.add(key3, createCustomTask(task, configuringTask));
              } else {
                result.add(key3, task);
              }
            } else if (legacyTaskConfigurations) {
              const configuringTask = legacyTaskConfigurations[task.defines._key];
              if (configuringTask) {
                result.add(key3, createCustomTask(task, configuringTask));
                customTasksToDelete.push(configuringTask);
              } else {
                result.add(key3, task);
              }
            } else {
              result.add(key3, task);
            }
          }
          if (customTasksToDelete.length > 0) {
            const toDelete = customTasksToDelete.reduce((map, task) => {
              map[task._id] = true;
              return map;
            }, /* @__PURE__ */ Object.create(null));
            for (const task of folderTasks.set.tasks) {
              if (toDelete[task._id]) {
                continue;
              }
              result.add(key3, task);
            }
          } else {
            result.add(key3, ...folderTasks.set.tasks);
          }
          const unUsedConfigurationsAsArray = Array.from(unUsedConfigurations);
          const unUsedConfigurationPromises = unUsedConfigurationsAsArray.map(async (value2) => {
            const configuringTask = configurations.byIdentifier[value2];
            if (filter2?.type && filter2.type !== configuringTask.configures.type) {
              return;
            }
            let requiredTaskProviderUnavailable = false;
            for (const [handle2, provider] of this._providers) {
              const providerType = this._providerTypes.get(handle2);
              if (configuringTask.type === providerType) {
                if (providerType && !this._isTaskProviderEnabled(providerType)) {
                  requiredTaskProviderUnavailable = true;
                  continue;
                }
                try {
                  const resolvedTask = await provider.resolveTask(configuringTask);
                  if (resolvedTask && resolvedTask._id === configuringTask._id) {
                    result.add(key3, createCustomTask(resolvedTask, configuringTask));
                    return;
                  }
                } catch (error) {
                }
              }
            }
            if (requiredTaskProviderUnavailable) {
              this._log(localize(
                19537,
                null,
                configuringTask.configures.type
              ));
            } else if (!waitToActivate) {
              this._log(localize(
                19513,
                null,
                configuringTask.configures.type,
                JSON.stringify(configuringTask._source.config.element, void 0, 4)
              ));
            }
          });
          await Promise.all(unUsedConfigurationPromises);
        } else {
          result.add(key3, ...folderTasks.set.tasks);
          result.add(key3, ...contributed);
        }
      }
    });
  }
  _getLegacyTaskConfigurations(workspaceTasks) {
    let result;
    function getResult() {
      if (result) {
        return result;
      }
      result = /* @__PURE__ */ Object.create(null);
      return result;
    }
    for (const task of workspaceTasks.tasks) {
      if (CustomTask.is(task)) {
        const commandName = task.command && task.command.name;
        if (commandName === "gulp" || commandName === "grunt" || commandName === "jake") {
          const identifier2 = KeyedTaskIdentifier.create({
            type: commandName,
            task: task.configurationProperties.name
          });
          getResult()[identifier2._key] = task;
        }
      }
    }
    return result;
  }
  async getWorkspaceTasks(runSource = 1 /* User */) {
    if (!await this._trust()) {
      return /* @__PURE__ */ new Map();
    }
    await raceTimeout(this._waitForAllSupportedExecutions, 2e3, () => {
      this._logService.warn("Timed out waiting for all supported executions");
    });
    await this._whenTaskSystemReady;
    if (this._workspaceTasksPromise) {
      return this._workspaceTasksPromise;
    }
    return this._updateWorkspaceTasks(runSource);
  }
  getTaskProblems(instanceId) {
    return this._taskSystem?.getTaskProblems(instanceId);
  }
  _updateWorkspaceTasks(runSource = 1 /* User */) {
    this._workspaceTasksPromise = this._computeWorkspaceTasks(runSource);
    return this._workspaceTasksPromise;
  }
  async _getAFolder() {
    let folder = this.workspaceFolders.length > 0 ? this.workspaceFolders[0] : void 0;
    if (!folder) {
      const userhome = await this._pathService.userHome();
      folder = new WorkspaceFolder({ uri: userhome, name: basename2(userhome), index: 0 });
    }
    return folder;
  }
  getTerminalsForTasks(task) {
    return this._taskSystem?.getTerminalsForTasks(task);
  }
  async _computeWorkspaceTasks(runSource = 1 /* User */) {
    const promises = [];
    for (const folder2 of this.workspaceFolders) {
      promises.push(this._computeWorkspaceFolderTasks(folder2, runSource));
    }
    const values = await Promise.all(promises);
    const result = /* @__PURE__ */ new Map();
    for (const value2 of values) {
      if (value2) {
        result.set(value2.workspaceFolder.uri.toString(), value2);
      }
    }
    const folder = await this._getAFolder();
    if (this._contextService.getWorkbenchState() !== 1 /* EMPTY */) {
      const workspaceFileTasks = await this._computeWorkspaceFileTasks(folder, runSource);
      if (workspaceFileTasks && this._workspace && this._workspace.configuration) {
        result.set(this._workspace.configuration.toString(), workspaceFileTasks);
      }
    }
    const userTasks = await this._computeUserTasks(folder, runSource);
    if (userTasks) {
      result.set(USER_TASKS_GROUP_KEY, userTasks);
    }
    const hasAnyTasks = Array.from(result.values()).some(
      (folderResult) => folderResult.set?.tasks && folderResult.set.tasks.length > 0 || folderResult.configurations?.byIdentifier && Object.keys(folderResult.configurations.byIdentifier).length > 0
    );
    this._tasksAvailableState.set(hasAnyTasks);
    return result;
  }
  get _jsonTasksSupported() {
    return ShellExecutionSupportedContext.getValue(this._contextKeyService) === true && ProcessExecutionSupportedContext.getValue(this._contextKeyService) === true;
  }
  async _computeWorkspaceFolderTasks(workspaceFolder, runSource = 1 /* User */) {
    const workspaceFolderConfiguration = this._executionEngine === 1 /* Process */ ? await this._computeLegacyConfiguration(workspaceFolder) : await this._computeConfiguration(workspaceFolder);
    if (!workspaceFolderConfiguration || !workspaceFolderConfiguration.config || workspaceFolderConfiguration.hasErrors) {
      return Promise.resolve({ workspaceFolder, set: void 0, configurations: void 0, hasErrors: workspaceFolderConfiguration ? workspaceFolderConfiguration.hasErrors : false });
    }
    await ProblemMatcherRegistry.onReady();
    const taskSystemInfo = this._getTaskSystemInfo(workspaceFolder.uri.scheme);
    const problemReporter = new ProblemReporter(this._outputChannel);
    const problemReporterListener = problemReporter.onDidError((error) => this._showOutput(runSource, void 0, error));
    const parseResult = parse13(workspaceFolder, void 0, taskSystemInfo ? taskSystemInfo.platform : platform, workspaceFolderConfiguration.config, problemReporter, 0 /* TasksJson */, this._contextKeyService);
    problemReporterListener.dispose();
    let hasErrors = false;
    if (!parseResult.validationStatus.isOK() && parseResult.validationStatus.state !== 1 /* Info */) {
      hasErrors = true;
    }
    if (problemReporter.status.isFatal()) {
      problemReporter.fatal(localize(19557, null));
      return { workspaceFolder, set: void 0, configurations: void 0, hasErrors };
    }
    let customizedTasks;
    if (parseResult.configured && parseResult.configured.length > 0) {
      customizedTasks = {
        byIdentifier: /* @__PURE__ */ Object.create(null)
      };
      for (const task of parseResult.configured) {
        customizedTasks.byIdentifier[task.configures._key] = task;
      }
    }
    if (!this._jsonTasksSupported && parseResult.custom.length > 0) {
      this._logService.warn("Custom workspace tasks are not supported.");
    }
    return { workspaceFolder, set: { tasks: this._jsonTasksSupported ? parseResult.custom : [] }, configurations: customizedTasks, hasErrors };
  }
  _testParseExternalConfig(config, location2) {
    if (!config) {
      return { config: void 0, hasParseErrors: false };
    }
    const parseErrors = config.$parseErrors;
    if (parseErrors) {
      let isAffected = false;
      for (const parseError of parseErrors) {
        if (/tasks\.json$/.test(parseError)) {
          isAffected = true;
          break;
        }
      }
      if (isAffected) {
        this._log(localize(19560, null, location2));
        this._showOutput(void 0, void 0, localize(19560, null, location2));
        return { config, hasParseErrors: true };
      }
    }
    return { config, hasParseErrors: false };
  }
  _log(value2, verbose) {
    if (!verbose || this._configurationService.getValue("task.verboseLogging" /* VerboseLogging */)) {
      this._outputChannel.append(value2 + "\n");
    }
  }
  async _computeWorkspaceFileTasks(workspaceFolder, runSource = 1 /* User */) {
    if (this._executionEngine === 1 /* Process */) {
      return this._emptyWorkspaceTaskResults(workspaceFolder);
    }
    const workspaceFileConfig = this._getConfiguration(workspaceFolder, TaskSourceKind.WorkspaceFile);
    const configuration2 = this._testParseExternalConfig(workspaceFileConfig.config, localize(19555, null));
    const customizedTasks = {
      byIdentifier: /* @__PURE__ */ Object.create(null)
    };
    const custom = [];
    await this._computeTasksForSingleConfig(workspaceFolder, configuration2.config, runSource, custom, customizedTasks.byIdentifier, 1 /* WorkspaceFile */);
    const engine = configuration2.config ? ExecutionEngine2.from(configuration2.config) : 2 /* Terminal */;
    if (engine === 1 /* Process */) {
      this._notificationService.warn(localize(19566, null));
      return this._emptyWorkspaceTaskResults(workspaceFolder);
    }
    return { workspaceFolder, set: { tasks: custom }, configurations: customizedTasks, hasErrors: configuration2.hasParseErrors };
  }
  async _computeUserTasks(workspaceFolder, runSource = 1 /* User */) {
    if (this._executionEngine === 1 /* Process */) {
      return this._emptyWorkspaceTaskResults(workspaceFolder);
    }
    const userTasksConfig = this._getConfiguration(workspaceFolder, TaskSourceKind.User);
    const configuration2 = this._testParseExternalConfig(userTasksConfig.config, localize(19554, null));
    const customizedTasks = {
      byIdentifier: /* @__PURE__ */ Object.create(null)
    };
    const custom = [];
    await this._computeTasksForSingleConfig(workspaceFolder, configuration2.config, runSource, custom, customizedTasks.byIdentifier, 2 /* User */);
    const engine = configuration2.config ? ExecutionEngine2.from(configuration2.config) : 2 /* Terminal */;
    if (engine === 1 /* Process */) {
      this._notificationService.warn(localize(19565, null));
      return this._emptyWorkspaceTaskResults(workspaceFolder);
    }
    return { workspaceFolder, set: { tasks: custom }, configurations: customizedTasks, hasErrors: configuration2.hasParseErrors };
  }
  _emptyWorkspaceTaskResults(workspaceFolder) {
    return { workspaceFolder, set: void 0, configurations: void 0, hasErrors: false };
  }
  async _computeTasksForSingleConfig(workspaceFolder, config, runSource, custom, customized, source, isRecentTask = false) {
    if (!config) {
      return false;
    } else if (!workspaceFolder) {
      this._logService.trace("TaskService.computeTasksForSingleConfig: no workspace folder for worskspace", this._workspace?.id);
      return false;
    }
    const taskSystemInfo = this._getTaskSystemInfo(workspaceFolder.uri.scheme);
    const problemReporter = new ProblemReporter(this._outputChannel);
    const parseResult = parse13(workspaceFolder, this._workspace, taskSystemInfo ? taskSystemInfo.platform : platform, config, problemReporter, source, this._contextKeyService, isRecentTask);
    let hasErrors = false;
    if (!parseResult.validationStatus.isOK() && parseResult.validationStatus.state !== 1 /* Info */) {
      this._showOutput(runSource);
      hasErrors = true;
    }
    if (problemReporter.status.isFatal()) {
      problemReporter.fatal(localize(19557, null));
      return hasErrors;
    }
    if (parseResult.configured && parseResult.configured.length > 0) {
      for (const task of parseResult.configured) {
        customized[task.configures._key] = task;
      }
    }
    if (!this._jsonTasksSupported && parseResult.custom.length > 0) {
      this._logService.warn("Custom workspace tasks are not supported.");
    } else {
      for (const task of parseResult.custom) {
        custom.push(task);
      }
    }
    return hasErrors;
  }
  _computeConfiguration(workspaceFolder) {
    const { config, hasParseErrors } = this._getConfiguration(workspaceFolder);
    return Promise.resolve({ workspaceFolder, config, hasErrors: hasParseErrors });
  }
  _computeWorkspaceFolderSetup() {
    const workspaceFolders = [];
    const ignoredWorkspaceFolders = [];
    let executionEngine = 2 /* Terminal */;
    let schemaVersion = 2 /* V2_0_0 */;
    let workspace;
    if (this._contextService.getWorkbenchState() === 2 /* FOLDER */) {
      const workspaceFolder = this._contextService.getWorkspace().folders[0];
      workspaceFolders.push(workspaceFolder);
      executionEngine = this._computeExecutionEngine(workspaceFolder);
      schemaVersion = this._computeJsonSchemaVersion(workspaceFolder);
    } else if (this._contextService.getWorkbenchState() === 3 /* WORKSPACE */) {
      workspace = this._contextService.getWorkspace();
      for (const workspaceFolder of this._contextService.getWorkspace().folders) {
        if (schemaVersion === this._computeJsonSchemaVersion(workspaceFolder)) {
          workspaceFolders.push(workspaceFolder);
        } else {
          ignoredWorkspaceFolders.push(workspaceFolder);
          this._log(localize(
            19508,
            null,
            workspaceFolder.uri.fsPath
          ));
        }
      }
    }
    return [workspaceFolders, ignoredWorkspaceFolders, executionEngine, schemaVersion, workspace];
  }
  _computeExecutionEngine(workspaceFolder) {
    const { config } = this._getConfiguration(workspaceFolder);
    if (!config) {
      return ExecutionEngine._default;
    }
    return ExecutionEngine2.from(config);
  }
  _computeJsonSchemaVersion(workspaceFolder) {
    const { config } = this._getConfiguration(workspaceFolder);
    if (!config) {
      return 2 /* V2_0_0 */;
    }
    return JsonSchemaVersion2.from(config);
  }
  _getConfiguration(workspaceFolder, source) {
    let result;
    if (source !== TaskSourceKind.User && this._contextService.getWorkbenchState() === 1 /* EMPTY */) {
      result = void 0;
    } else {
      const wholeConfig = this._configurationService.inspect("tasks", { resource: workspaceFolder.uri });
      switch (source) {
        case TaskSourceKind.User: {
          if (wholeConfig.userValue !== wholeConfig.workspaceFolderValue) {
            result = deepClone(wholeConfig.userValue);
          }
          break;
        }
        case TaskSourceKind.Workspace:
          result = deepClone(wholeConfig.workspaceFolderValue);
          break;
        case TaskSourceKind.WorkspaceFile: {
          if (this._contextService.getWorkbenchState() === 3 /* WORKSPACE */ && wholeConfig.workspaceFolderValue !== wholeConfig.workspaceValue) {
            result = deepClone(wholeConfig.workspaceValue);
          }
          break;
        }
        default:
          result = deepClone(wholeConfig.workspaceFolderValue);
      }
    }
    if (!result) {
      return { config: void 0, hasParseErrors: false };
    }
    const parseErrors = result.$parseErrors;
    if (parseErrors) {
      let isAffected = false;
      for (const parseError of parseErrors) {
        if (/tasks\.json$/.test(parseError)) {
          isAffected = true;
          break;
        }
      }
      if (isAffected) {
        this._log(localize(19559, null));
        this._showOutput(void 0, void 0, localize(19559, null));
        return { config: void 0, hasParseErrors: true };
      }
    }
    return { config: result, hasParseErrors: false };
  }
  inTerminal() {
    if (this._taskSystem) {
      return this._taskSystem instanceof TerminalTaskSystem;
    }
    return this._executionEngine === 2 /* Terminal */;
  }
  configureAction() {
    const thisCapture = this;
    return new class extends Action {
      constructor() {
        super(ConfigureTaskAction.ID, ConfigureTaskAction.TEXT.value, void 0, true, () => {
          thisCapture._runConfigureTasks();
          return Promise.resolve(void 0);
        });
      }
    }();
  }
  _handleError(err) {
    let showOutput = true;
    if (err instanceof TaskError) {
      const buildError = err;
      const needsConfig = buildError.code === 0 /* NotConfigured */ || buildError.code === 2 /* NoBuildTask */ || buildError.code === 3 /* NoTestTask */;
      const needsTerminate = buildError.code === 1 /* RunningTask */;
      if (needsConfig || needsTerminate) {
        this._notificationService.prompt(buildError.severity, buildError.message, [{
          label: needsConfig ? ConfigureTaskAction.TEXT.value : localize(19568, null),
          run: () => {
            if (needsConfig) {
              this._runConfigureTasks();
            } else {
              this._runTerminateCommand();
            }
          }
        }]);
      } else {
        this._notificationService.notify({ severity: buildError.severity, message: buildError.message });
      }
    } else if (err instanceof Error) {
      const error = err;
      this._notificationService.error(error.message);
      showOutput = false;
    } else if (isString(err)) {
      this._notificationService.error(err);
    } else {
      this._notificationService.error(localize(19564, null));
    }
    if (showOutput) {
      this._showOutput(void 0, void 0, isString(err) ? err : void 0);
    }
  }
  _showDetail() {
    return this._configurationService.getValue(QUICKOPEN_DETAIL_CONFIG);
  }
  async _createTaskQuickPickEntries(tasks2, group2 = false, sort2 = false, selectedEntry, includeRecents = true) {
    let encounteredTasks = {};
    if (tasks2 === void 0 || tasks2 === null || tasks2.length === 0) {
      return [];
    }
    const TaskQuickPickEntry = (task) => {
      const newEntry = { label: task._label, description: this.getTaskDescription(task), task, detail: this._showDetail() ? task.configurationProperties.detail : void 0 };
      if (encounteredTasks[task._id]) {
        if (encounteredTasks[task._id].length === 1) {
          encounteredTasks[task._id][0].label += " (1)";
        }
        newEntry.label = newEntry.label + " (" + (encounteredTasks[task._id].length + 1).toString() + ")";
      } else {
        encounteredTasks[task._id] = [];
      }
      encounteredTasks[task._id].push(newEntry);
      return newEntry;
    };
    function fillEntries(entries3, tasks3, groupLabel) {
      if (tasks3.length) {
        entries3.push({ type: "separator", label: groupLabel });
      }
      for (const task of tasks3) {
        const entry = TaskQuickPickEntry(task);
        entry.buttons = [{ iconClass: ThemeIcon.asClassName(configureTaskIcon), tooltip: localize(19465, null) }];
        if (selectedEntry && task === selectedEntry.task) {
          entries3.unshift(selectedEntry);
        } else {
          entries3.push(entry);
        }
      }
    }
    let entries2;
    if (group2) {
      entries2 = [];
      if (tasks2.length === 1) {
        entries2.push(TaskQuickPickEntry(tasks2[0]));
      } else {
        const recentlyUsedTasks = await this.getSavedTasks("historical");
        const recent = [];
        const recentSet = /* @__PURE__ */ new Set();
        let configured = [];
        let detected = [];
        const taskMap = /* @__PURE__ */ Object.create(null);
        tasks2.forEach((task) => {
          const key3 = task.getCommonTaskId();
          if (key3) {
            taskMap[key3] = task;
          }
        });
        recentlyUsedTasks.reverse().forEach((recentTask) => {
          const key3 = recentTask.getCommonTaskId();
          if (key3) {
            recentSet.add(key3);
            const task = taskMap[key3];
            if (task) {
              recent.push(task);
            }
          }
        });
        for (const task of tasks2) {
          const key3 = task.getCommonTaskId();
          if (!key3 || !recentSet.has(key3)) {
            if (task._source.kind === TaskSourceKind.Workspace || task._source.kind === TaskSourceKind.User) {
              configured.push(task);
            } else {
              detected.push(task);
            }
          }
        }
        const sorter3 = this.createSorter();
        if (includeRecents) {
          fillEntries(entries2, recent, localize(19471, null));
        }
        configured = configured.sort((a, b) => sorter3.compare(a, b));
        fillEntries(entries2, configured, localize(19464, null));
        detected = detected.sort((a, b) => sorter3.compare(a, b));
        fillEntries(entries2, detected, localize(19469, null));
      }
    } else {
      if (sort2) {
        const sorter3 = this.createSorter();
        tasks2 = tasks2.sort((a, b) => sorter3.compare(a, b));
      }
      entries2 = tasks2.map((task) => TaskQuickPickEntry(task));
    }
    encounteredTasks = {};
    return entries2;
  }
  async _showTwoLevelQuickPick(placeHolder, defaultEntry, type, name) {
    const taskQuickPick = this._instantiationService.createInstance(TaskQuickPick);
    try {
      return await taskQuickPick.show(placeHolder, defaultEntry, type, name);
    } finally {
      taskQuickPick.dispose();
    }
  }
  async _showQuickPick(tasks2, placeHolder, defaultEntry, group2 = false, sort2 = false, selectedEntry, additionalEntries, name) {
    const resolvedTasks = await tasks2;
    const entries2 = await raceTimeout(this._createTaskQuickPickEntries(resolvedTasks, group2, sort2, selectedEntry), 200, () => void 0);
    if (!entries2) {
      return void 0;
    }
    if (entries2.length === 1 && this._configurationService.getValue(QUICKOPEN_SKIP_CONFIG)) {
      return entries2[0];
    } else if (entries2.length === 0 && defaultEntry) {
      entries2.push(defaultEntry);
    } else if (entries2.length > 1 && additionalEntries && additionalEntries.length > 0) {
      entries2.push({ type: "separator", label: "" });
      entries2.push(additionalEntries[0]);
    }
    return this._quickInputService.pick(
      entries2,
      {
        value: name,
        placeHolder,
        matchOnDescription: true,
        onDidTriggerItemButton: (context2) => {
          const task = context2.item.task;
          this._quickInputService.cancel();
          if (ContributedTask.is(task)) {
            this.customize(task, void 0, true);
          } else if (CustomTask.is(task)) {
            this.openConfig(task);
          }
        }
      }
    );
  }
  _needsRecentTasksMigration() {
    return this.getRecentlyUsedTasksV1().size > 0 && this._getTasksFromStorage("historical").size === 0;
  }
  async _migrateRecentTasks(tasks2) {
    if (!this._needsRecentTasksMigration()) {
      return;
    }
    const recentlyUsedTasks = this.getRecentlyUsedTasksV1();
    const taskMap = /* @__PURE__ */ Object.create(null);
    tasks2.forEach((task) => {
      const key3 = task.getKey();
      if (key3) {
        taskMap[key3] = task;
      }
    });
    const reversed = [...recentlyUsedTasks.keys()].reverse();
    for (const key3 in reversed) {
      const task = taskMap[key3];
      if (task) {
        await this._setRecentlyUsedTask(task);
      }
    }
    this._storageService.remove(AbstractTaskService.RecentlyUsedTasks_Key, 1 /* WORKSPACE */);
  }
  _showIgnoredFoldersMessage() {
    if (this.ignoredWorkspaceFolders.length === 0 || !this.showIgnoreMessage) {
      return Promise.resolve(void 0);
    }
    this._notificationService.prompt(
      severity_default.Info,
      localize(19507, null, this.ignoredWorkspaceFolders.map((f) => f.name).join(", ")),
      [{
        label: localize(19517, null),
        isSecondary: true,
        run: () => {
          this._storageService.store(AbstractTaskService.IgnoreTask010DonotShowAgain_key, true, 1 /* WORKSPACE */, 1 /* MACHINE */);
          this._showIgnoreMessage = false;
        }
      }]
    );
    return Promise.resolve(void 0);
  }
  async _trust() {
    const context2 = this._contextKeyService.getContext(getActiveElement());
    if (ServerlessWebContext.getValue(this._contextKeyService) && !TaskExecutionSupportedContext?.evaluate(context2)) {
      return false;
    }
    await this._workspaceTrustManagementService.workspaceTrustInitialized;
    if (!this._workspaceTrustManagementService.isWorkspaceTrusted()) {
      return await this._workspaceTrustRequestService.requestWorkspaceTrust(
        {
          message: localize(19542, null)
        }
      ) === true;
    }
    return true;
  }
  async _runTaskCommand(filter2) {
    if (!this._tasksReconnected) {
      return;
    }
    if (!filter2) {
      return this._doRunTaskCommand();
    }
    const type = typeof filter2 === "string" ? void 0 : filter2.type;
    const taskName = typeof filter2 === "string" ? filter2 : filter2.task;
    const grouped = await this._getGroupedTasks({ type });
    const identifier2 = this._getTaskIdentifier(filter2);
    const tasks2 = grouped.all();
    const resolver = this._createResolver(grouped);
    const folderURIs = this._contextService.getWorkspace().folders.map((folder) => folder.uri);
    if (this._contextService.getWorkbenchState() === 3 /* WORKSPACE */) {
      folderURIs.push(this._contextService.getWorkspace().configuration);
    }
    folderURIs.push(USER_TASKS_GROUP_KEY);
    if (identifier2) {
      for (const uri4 of folderURIs) {
        const task = await resolver.resolve(uri4, identifier2);
        if (task) {
          this.run(task);
          return;
        }
      }
    }
    const exactMatchTask = !taskName ? void 0 : tasks2.find((t2) => t2.configurationProperties.identifier === taskName);
    if (!exactMatchTask) {
      return this._doRunTaskCommand(tasks2, type, taskName);
    }
    for (const uri4 of folderURIs) {
      const task = await resolver.resolve(uri4, taskName);
      if (task) {
        await this.run(task, { attachProblemMatcher: true }, 1 /* User */);
        return;
      }
    }
  }
  _tasksAndGroupedTasks(filter2) {
    if (!this._versionAndEngineCompatible(filter2)) {
      return { tasks: Promise.resolve([]), grouped: Promise.resolve(new TaskMap()) };
    }
    const grouped = this._getGroupedTasks(filter2);
    const tasks2 = grouped.then((map) => {
      if (!filter2 || !filter2.type) {
        return map.all();
      }
      const result = [];
      map.forEach((tasks3) => {
        for (const task of tasks3) {
          if (ContributedTask.is(task) && task.defines.type === filter2.type) {
            result.push(task);
          } else if (CustomTask.is(task)) {
            if (task.type === filter2.type) {
              result.push(task);
            } else {
              const customizes = task.customizes();
              if (customizes && customizes.type === filter2.type) {
                result.push(task);
              }
            }
          }
        }
      });
      return result;
    });
    return { tasks: tasks2, grouped };
  }
  _doRunTaskCommand(tasks2, type, name) {
    const pickThen = (task) => {
      if (task === void 0) {
        return;
      }
      if (task === null) {
        this._runConfigureTasks();
      } else {
        this.run(task, { attachProblemMatcher: true }, 1 /* User */).then(void 0, (reason) => {
        });
      }
    };
    const placeholder = localize(19533, null);
    this._showIgnoredFoldersMessage().then(() => {
      if (this._configurationService.getValue(USE_SLOW_PICKER)) {
        let taskResult = void 0;
        if (!tasks2) {
          taskResult = this._tasksAndGroupedTasks();
        }
        this._showQuickPick(
          tasks2 ? tasks2 : taskResult.tasks,
          placeholder,
          {
            label: "$(plus) " + localize(19514, null),
            task: null
          },
          true,
          void 0,
          void 0,
          void 0,
          name
        ).then((entry) => {
          return pickThen(entry ? entry.task : void 0);
        });
      } else {
        this._showTwoLevelQuickPick(
          placeholder,
          {
            label: "$(plus) " + localize(19514, null),
            task: null
          },
          type,
          name
        ).then(pickThen);
      }
    });
  }
  async rerun(terminalInstanceId) {
    const task = await this._taskSystem?.getTaskForTerminal(terminalInstanceId);
    if (task) {
      this._restart(task);
    } else {
      this._reRunTaskCommand(true);
    }
  }
  _reRunTaskCommand(onlyRerun) {
    ProblemMatcherRegistry.onReady().then(() => {
      return this._editorService.saveAll({ reason: 1 /* EXPLICIT */ }).then(() => {
        const executeResult = this._getTaskSystem().rerun();
        if (executeResult) {
          return this._handleExecuteResult(executeResult);
        } else {
          if (!onlyRerun && !this._taskRunningState.get()) {
            this._doRunTaskCommand();
          }
          return Promise.resolve(void 0);
        }
      });
    });
  }
  /**
   *
   * @param tasks - The tasks which need to be filtered
   * @param tasksInList - This tells splitPerGroupType to filter out globbed tasks (into defaults)
   * @returns
   */
  _getDefaultTasks(tasks2, taskGlobsInList = false) {
    const defaults = [];
    for (const task of tasks2.filter((t2) => !!t2.configurationProperties.group)) {
      if (taskGlobsInList && typeof task.configurationProperties.group.isDefault === "string") {
        defaults.push(task);
      } else if (!taskGlobsInList && task.configurationProperties.group.isDefault === true) {
        defaults.push(task);
      }
    }
    return defaults;
  }
  _runTaskGroupCommand(taskGroup, strings, configure, legacyCommand) {
    if (this.schemaVersion === 1 /* V0_1_0 */) {
      legacyCommand();
      return;
    }
    const options3 = {
      location: 10 /* Window */,
      title: strings.fetching
    };
    const promise = (async () => {
      async function runSingleTask(task, problemMatcherOptions, that) {
        that.run(task, problemMatcherOptions, 1 /* User */).then(void 0, (reason) => {
        });
      }
      const chooseAndRunTask = (tasks2) => {
        this._showIgnoredFoldersMessage().then(() => {
          this._showQuickPick(
            tasks2,
            strings.select,
            {
              label: strings.notFoundConfigure,
              task: null
            },
            true
          ).then((entry) => {
            const task = entry ? entry.task : void 0;
            if (task === void 0) {
              return;
            }
            if (task === null) {
              configure.apply(this);
              return;
            }
            runSingleTask(task, { attachProblemMatcher: true }, this);
          });
        });
      };
      let groupTasks = [];
      const { globGroupTasks, globTasksDetected } = await this._getGlobTasks(taskGroup._id);
      groupTasks = [...globGroupTasks];
      if (!globTasksDetected && groupTasks.length === 0) {
        groupTasks = await this._findWorkspaceTasksInGroup(taskGroup, true);
      }
      const handleMultipleTasks = (areGlobTasks) => {
        return this._getTasksForGroup(taskGroup).then((tasks2) => {
          if (tasks2.length > 0) {
            const defaults = this._getDefaultTasks(tasks2, areGlobTasks);
            if (defaults.length === 1) {
              runSingleTask(defaults[0], void 0, this);
              return;
            } else if (defaults.length > 0) {
              tasks2 = defaults;
            }
          }
          chooseAndRunTask(tasks2);
        });
      };
      const resolveTaskAndRun = (taskGroupTask) => {
        if (ConfiguringTask.is(taskGroupTask)) {
          this.tryResolveTask(taskGroupTask).then((resolvedTask) => {
            runSingleTask(resolvedTask, void 0, this);
          });
        } else {
          runSingleTask(taskGroupTask, void 0, this);
        }
      };
      if (groupTasks.length === 1) {
        return resolveTaskAndRun(groupTasks[0]);
      }
      if (globTasksDetected && groupTasks.length > 1) {
        return handleMultipleTasks(true);
      }
      if (!groupTasks.length) {
        groupTasks = await this._findWorkspaceTasksInGroup(taskGroup, true);
      }
      if (groupTasks.length === 1) {
        return resolveTaskAndRun(groupTasks[0]);
      }
      return handleMultipleTasks(false);
    })();
    this._progressService.withProgress(options3, () => promise);
  }
  async _getGlobTasks(taskGroupId) {
    let globTasksDetected = false;
    const absoluteURI = EditorResourceAccessor.getOriginalUri(this._editorService.activeEditor);
    if (absoluteURI) {
      const workspaceFolder = this._contextService.getWorkspaceFolder(absoluteURI);
      if (workspaceFolder) {
        const configuredTasks = this._getConfiguration(workspaceFolder)?.config?.tasks;
        if (configuredTasks) {
          globTasksDetected = configuredTasks.filter((task) => task.group && typeof task.group !== "string" && typeof task.group.isDefault === "string").length > 0;
          if (globTasksDetected) {
            const relativePath2 = workspaceFolder?.uri ? relativePath(workspaceFolder.uri, absoluteURI) ?? absoluteURI.path : absoluteURI.path;
            const globGroupTasks = await this._findWorkspaceTasks((task) => {
              const currentTaskGroup = task.configurationProperties.group;
              if (currentTaskGroup && typeof currentTaskGroup !== "string" && typeof currentTaskGroup.isDefault === "string") {
                return currentTaskGroup._id === taskGroupId && match(currentTaskGroup.isDefault, relativePath2, { ignoreCase: true });
              }
              globTasksDetected = false;
              return false;
            });
            return { globGroupTasks, globTasksDetected };
          }
        }
      }
    }
    return { globGroupTasks: [], globTasksDetected };
  }
  _runBuildCommand() {
    if (!this._tasksReconnected) {
      return;
    }
    return this._runTaskGroupCommand(TaskGroup2.Build, {
      fetching: localize(19499, null),
      select: localize(19529, null),
      notFoundConfigure: localize(19510, null)
    }, this._runConfigureDefaultBuildTask, this._build);
  }
  _runTestCommand() {
    return this._runTaskGroupCommand(TaskGroup2.Test, {
      fetching: localize(19500, null),
      select: localize(19536, null),
      notFoundConfigure: localize(19525, null)
    }, this._runConfigureDefaultTestTask, this._runTest);
  }
  _runTerminateCommand(arg) {
    if (arg === "terminateAll") {
      this._terminateAll();
      return;
    }
    const runQuickPick = (promise) => {
      this._showQuickPick(
        promise || this.getActiveTasks(),
        localize(19546, null),
        {
          label: localize(19519, null),
          task: void 0
        },
        false,
        true,
        void 0,
        [{
          label: localize(19548, null),
          id: "terminateAll",
          task: void 0
        }]
      ).then((entry) => {
        if (entry && entry.id === "terminateAll") {
          this._terminateAll();
        }
        const task = entry ? entry.task : void 0;
        if (task === void 0 || task === null) {
          return;
        }
        this.terminate(task);
      });
    };
    if (this.inTerminal()) {
      const identifier2 = this._getTaskIdentifier(arg);
      let promise;
      if (identifier2 !== void 0) {
        promise = this.getActiveTasks();
        promise.then((tasks2) => {
          for (const task of tasks2) {
            if (task.matches(identifier2)) {
              this.terminate(task);
              return;
            }
          }
          runQuickPick(promise);
        });
      } else {
        runQuickPick();
      }
    } else {
      this._isActive().then((active) => {
        if (active) {
          this._terminateAll().then((responses) => {
            const response = responses[0];
            if (response.success) {
              return;
            }
            if (response.code && response.code === 3 /* ProcessNotFound */) {
              this._notificationService.error(localize(19569, null));
            } else {
              this._notificationService.error(localize(19567, null));
            }
          });
        }
      });
    }
  }
  async _runRestartTaskCommand(arg) {
    const activeTasks = await this.getActiveTasks();
    if (activeTasks.length === 1) {
      this._restart(activeTasks[0]);
      return;
    }
    if (this.inTerminal()) {
      const identifier2 = this._getTaskIdentifier(arg);
      if (identifier2 !== void 0) {
        for (const task of activeTasks) {
          if (task.matches(identifier2)) {
            this._restart(task);
            return;
          }
        }
      }
      const entry = await this._showQuickPick(
        activeTasks,
        localize(19545, null),
        {
          label: localize(19521, null),
          task: null
        },
        false,
        true
      );
      if (entry && entry.task) {
        this._restart(entry.task);
      }
    } else {
      if (activeTasks.length > 0) {
        this._restart(activeTasks[0]);
      }
    }
  }
  async _runRerunAllRunningTasksCommand() {
    const activeTasks = await this.getActiveTasks();
    if (activeTasks.length === 0) {
      this._notificationService.info(localize(19516, null));
      return;
    }
    const restartPromises = activeTasks.map((task) => this._restart(task));
    await Promise.allSettled(restartPromises);
  }
  _getTaskIdentifier(filter2) {
    let result = void 0;
    if (isString(filter2)) {
      result = filter2;
    } else if (filter2 && isString(filter2.type)) {
      result = TaskDefinition.createTaskIdentifier(filter2, console);
    }
    return result;
  }
  _configHasTasks(taskConfig) {
    return !!taskConfig && !!taskConfig.tasks && taskConfig.tasks.length > 0;
  }
  _openTaskFile(resource, taskSource) {
    let configFileCreated = false;
    this._fileService.stat(resource).then((stat) => stat, () => void 0).then(async (stat) => {
      const fileExists = !!stat;
      const configValue = this._configurationService.inspect("tasks", { resource });
      let tasksExistInFile;
      let target;
      switch (taskSource) {
        case TaskSourceKind.User:
          tasksExistInFile = this._configHasTasks(configValue.userValue);
          target = 2 /* USER */;
          break;
        case TaskSourceKind.WorkspaceFile:
          tasksExistInFile = this._configHasTasks(configValue.workspaceValue);
          target = 5 /* WORKSPACE */;
          break;
        default:
          tasksExistInFile = this._configHasTasks(configValue.workspaceFolderValue);
          target = 6 /* WORKSPACE_FOLDER */;
      }
      let content;
      if (!tasksExistInFile) {
        const pickTemplateResult = await this._quickInputService.pick(getTemplates(), { placeHolder: localize(19547, null) });
        if (!pickTemplateResult) {
          return Promise.resolve(void 0);
        }
        content = pickTemplateResult.content;
        const editorConfig = this._configurationService.getValue();
        if (editorConfig.editor.insertSpaces) {
          content = content.replace(/(\n)(\t+)/g, (_, s1, s2) => s1 + " ".repeat(s2.length * editorConfig.editor.tabSize));
        }
        configFileCreated = true;
      }
      if (!fileExists && content) {
        return this._textFileService.create([{ resource, value: content }]).then((result) => {
          return result[0].resource;
        });
      } else if (fileExists && (tasksExistInFile || content)) {
        const statResource = stat?.resource;
        if (content && statResource) {
          this._configurationService.updateValue("tasks", parse5(content), { resource: statResource }, target);
        }
        return statResource;
      }
      return void 0;
    }).then((resource2) => {
      if (!resource2) {
        return;
      }
      this._editorService.openEditor({
        resource: resource2,
        options: {
          pinned: configFileCreated
          // pin only if config file is created #8727
        }
      });
    });
  }
  _isTaskEntry(value2) {
    const candidate = value2;
    return candidate && !!candidate.task;
  }
  _isSettingEntry(value2) {
    const candidate = value2;
    return candidate && !!candidate.settingType;
  }
  _configureTask(task) {
    if (ContributedTask.is(task)) {
      this.customize(task, void 0, true);
    } else if (CustomTask.is(task)) {
      this.openConfig(task);
    } else if (ConfiguringTask.is(task)) {
    }
  }
  _handleSelection(selection) {
    if (!selection) {
      return;
    }
    if (this._isTaskEntry(selection)) {
      this._configureTask(selection.task);
    } else if (this._isSettingEntry(selection)) {
      const taskQuickPick = this._instantiationService.createInstance(TaskQuickPick);
      taskQuickPick.handleSettingOption(selection.settingType);
    } else if (selection.folder && this._contextService.getWorkbenchState() !== 1 /* EMPTY */) {
      this._openTaskFile(selection.folder.toResource(".vscode/tasks.json"), TaskSourceKind.Workspace);
    } else {
      const resource = this._getResourceForKind(TaskSourceKind.User);
      if (resource) {
        this._openTaskFile(resource, TaskSourceKind.User);
      }
    }
  }
  getTaskDescription(task) {
    let description;
    if (task._source.kind === TaskSourceKind.User) {
      description = localize(19487, null);
    } else if (task._source.kind === TaskSourceKind.WorkspaceFile) {
      description = task.getWorkspaceFileName();
    } else if (this.needsFolderQualification()) {
      const workspaceFolder = task.getWorkspaceFolder();
      if (workspaceFolder) {
        description = workspaceFolder.name;
      }
    }
    return description;
  }
  async _runConfigureTasks() {
    if (!await this._trust()) {
      return;
    }
    let taskPromise;
    if (this.schemaVersion === 2 /* V2_0_0 */) {
      taskPromise = this._getGroupedTasks();
    } else {
      taskPromise = Promise.resolve(new TaskMap());
    }
    const stats = this._contextService.getWorkspace().folders.map((folder) => {
      return this._fileService.stat(folder.toResource(".vscode/tasks.json")).then((stat) => stat, () => void 0);
    });
    const createLabel = localize(19496, null);
    const openLabel = localize(19528, null);
    const tokenSource = new CancellationTokenSource();
    const cancellationToken = tokenSource.token;
    const entries2 = Promise.all(stats).then((stats2) => {
      return taskPromise.then((taskMap) => {
        const entries3 = [];
        let configuredCount = 0;
        let tasks2 = taskMap.all();
        if (tasks2.length > 0) {
          tasks2 = tasks2.sort((a, b) => a._label.localeCompare(b._label));
          for (const task of tasks2) {
            const entry = { label: TaskQuickPick.getTaskLabelWithIcon(task), task, description: this.getTaskDescription(task), detail: this._showDetail() ? task.configurationProperties.detail : void 0 };
            TaskQuickPick.applyColorStyles(task, entry, this._themeService);
            entries3.push(entry);
            if (!ContributedTask.is(task)) {
              configuredCount++;
            }
          }
        }
        const needsCreateOrOpen = configuredCount === 0;
        if (needsCreateOrOpen || taskMap.get(USER_TASKS_GROUP_KEY).length === configuredCount) {
          const label3 = stats2[0] !== void 0 ? openLabel : createLabel;
          if (entries3.length) {
            entries3.push({ type: "separator" });
          }
          entries3.push({ label: label3, folder: this._contextService.getWorkspace().folders[0] });
        }
        if (entries3.length === 1 && !needsCreateOrOpen) {
          tokenSource.cancel();
        }
        return entries3;
      });
    });
    const timeout2 = await Promise.race([new Promise((resolve3) => {
      entries2.then(() => resolve3(false));
    }), new Promise((resolve3) => {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        resolve3(true);
      }, 200);
    })]);
    if (!timeout2 && (await entries2).length === 1 && this._configurationService.getValue(QUICKOPEN_SKIP_CONFIG)) {
      const entry = (await entries2)[0];
      if (entry.task) {
        this._handleSelection(entry);
        return;
      }
    }
    const entriesWithSettings = entries2.then((resolvedEntries) => {
      resolvedEntries.push(...TaskQuickPick.allSettingEntries(this._configurationService));
      return resolvedEntries;
    });
    this._quickInputService.pick(
      entriesWithSettings,
      { placeHolder: localize(19535, null) },
      cancellationToken
    ).then(async (selection) => {
      if (cancellationToken.isCancellationRequested) {
        const task = (await entries2)[0];
        if (task.task) {
          selection = task;
        }
      }
      this._handleSelection(selection);
    });
  }
  _runConfigureDefaultBuildTask() {
    if (this.schemaVersion === 2 /* V2_0_0 */) {
      this.tasks().then(((tasks2) => {
        if (tasks2.length === 0) {
          this._runConfigureTasks();
          return;
        }
        const entries2 = [];
        let selectedTask;
        let selectedEntry;
        this._showIgnoredFoldersMessage().then(async () => {
          const { globGroupTasks } = await this._getGlobTasks(TaskGroup2.Build._id);
          let defaultTasks = globGroupTasks;
          if (!defaultTasks?.length) {
            defaultTasks = this._getDefaultTasks(tasks2, false);
          }
          let defaultBuildTask;
          if (defaultTasks.length === 1) {
            const group2 = defaultTasks[0].configurationProperties.group;
            if (group2) {
              if (typeof group2 === "string" && group2 === TaskGroup2.Build._id) {
                defaultBuildTask = defaultTasks[0];
              } else {
                defaultBuildTask = defaultTasks[0];
              }
            }
          }
          for (const task of tasks2) {
            if (task === defaultBuildTask) {
              const label3 = localize(19497, null, TaskQuickPick.getTaskLabelWithIcon(task, task.getQualifiedLabel()));
              selectedTask = task;
              selectedEntry = { label: label3, task, description: this.getTaskDescription(task), detail: this._showDetail() ? task.configurationProperties.detail : void 0 };
              TaskQuickPick.applyColorStyles(task, selectedEntry, this._themeService);
            } else {
              const entry = { label: TaskQuickPick.getTaskLabelWithIcon(task), task, description: this.getTaskDescription(task), detail: this._showDetail() ? task.configurationProperties.detail : void 0 };
              TaskQuickPick.applyColorStyles(task, entry, this._themeService);
              entries2.push(entry);
            }
          }
          if (selectedEntry) {
            entries2.unshift(selectedEntry);
          }
          const tokenSource = new CancellationTokenSource();
          const cancellationToken = tokenSource.token;
          this._quickInputService.pick(
            entries2,
            { placeHolder: localize(19535, null) },
            cancellationToken
          ).then(async (entry) => {
            if (cancellationToken.isCancellationRequested) {
              const task2 = (await entries2)[0];
              if (task2.task) {
                entry = task2;
              }
            }
            const task = entry && Object.hasOwn(entry, "task") ? entry.task : void 0;
            if (task === void 0 || task === null) {
              return;
            }
            if (task === selectedTask && CustomTask.is(task)) {
              this.openConfig(task);
            }
            if (!InMemoryTask.is(task)) {
              this.customize(task, { group: { kind: "build", isDefault: true } }, true).then(() => {
                if (selectedTask && task !== selectedTask && !InMemoryTask.is(selectedTask)) {
                  this.customize(selectedTask, { group: "build" }, false);
                }
              });
            }
          });
          this._quickInputService.pick(entries2, {
            placeHolder: localize(19531, null)
          }).then((entry) => {
            const task = entry && Object.hasOwn(entry, "task") ? entry.task : void 0;
            if (task === void 0 || task === null) {
              return;
            }
            if (task === selectedTask && CustomTask.is(task)) {
              this.openConfig(task);
            }
            if (!InMemoryTask.is(task)) {
              this.customize(task, { group: { kind: "build", isDefault: true } }, true).then(() => {
                if (selectedTask && task !== selectedTask && !InMemoryTask.is(selectedTask)) {
                  this.customize(selectedTask, { group: "build" }, false);
                }
              });
            }
          });
        });
      }));
    } else {
      this._runConfigureTasks();
    }
  }
  _runConfigureDefaultTestTask() {
    if (this.schemaVersion === 2 /* V2_0_0 */) {
      this.tasks().then(((tasks2) => {
        if (tasks2.length === 0) {
          this._runConfigureTasks();
          return;
        }
        let selectedTask;
        let selectedEntry;
        for (const task of tasks2) {
          const taskGroup = TaskGroup2.from(task.configurationProperties.group);
          if (taskGroup && taskGroup.isDefault && taskGroup._id === TaskGroup2.Test._id) {
            selectedTask = task;
            break;
          }
        }
        if (selectedTask) {
          selectedEntry = {
            label: localize(19498, null, selectedTask.getQualifiedLabel()),
            task: selectedTask,
            detail: this._showDetail() ? selectedTask.configurationProperties.detail : void 0
          };
        }
        this._showIgnoredFoldersMessage().then(() => {
          this._showQuickPick(
            tasks2,
            localize(19532, null),
            void 0,
            true,
            false,
            selectedEntry
          ).then((entry) => {
            const task = entry && Object.hasOwn(entry, "task") ? entry.task : void 0;
            if (!task) {
              return;
            }
            if (task === selectedTask && CustomTask.is(task)) {
              this.openConfig(task);
            }
            if (!InMemoryTask.is(task)) {
              this.customize(task, { group: { kind: "test", isDefault: true } }, true).then(() => {
                if (selectedTask && task !== selectedTask && !InMemoryTask.is(selectedTask)) {
                  this.customize(selectedTask, { group: "test" }, false);
                }
              });
            }
          });
        });
      }));
    } else {
      this._runConfigureTasks();
    }
  }
  async runShowTasks() {
    const activeTasksPromise = this.getActiveTasks();
    const activeTasks = await activeTasksPromise;
    let group2;
    if (activeTasks.length === 1) {
      this._taskSystem.revealTask(activeTasks[0]);
    } else if (activeTasks.length && activeTasks.every((task) => {
      if (InMemoryTask.is(task)) {
        return false;
      }
      if (!group2) {
        group2 = task.command.presentation?.group;
      }
      return task.command.presentation?.group && task.command.presentation.group === group2;
    })) {
      this._taskSystem.revealTask(activeTasks[0]);
    } else {
      this._showQuickPick(
        activeTasksPromise,
        localize(19534, null),
        {
          label: localize(19518, null),
          task: null
        },
        false,
        true
      ).then((entry) => {
        const task = entry ? entry.task : void 0;
        if (task === void 0 || task === null) {
          return;
        }
        this._taskSystem.revealTask(task);
      });
    }
  }
  async _createTasksDotOld(folder) {
    const tasksFile = folder.toResource(".vscode/tasks.json");
    if (await this._fileService.exists(tasksFile)) {
      const oldFile = tasksFile.with({ path: `${tasksFile.path}.old` });
      await this._fileService.copy(tasksFile, oldFile, true);
      return [oldFile, tasksFile];
    }
    return void 0;
  }
  _upgradeTask(task, suppressTaskName, globalConfig) {
    if (!CustomTask.is(task)) {
      return;
    }
    const configElement = {
      label: task._label
    };
    const oldTaskTypes = /* @__PURE__ */ new Set(["gulp", "jake", "grunt"]);
    if (isString(task.command.name) && oldTaskTypes.has(task.command.name)) {
      configElement.type = task.command.name;
      configElement.task = task.command.args[0];
    } else {
      if (task.command.runtime === 1 /* Shell */) {
        configElement.type = RuntimeType.toString(1 /* Shell */);
      }
      if (task.command.name && !suppressTaskName && !globalConfig.windows?.command && !globalConfig.osx?.command && !globalConfig.linux?.command) {
        configElement.command = task.command.name;
      } else if (suppressTaskName) {
        configElement.command = task._source.config.element.command;
      }
      if (task.command.args && (!Array.isArray(task.command.args) || task.command.args.length > 0)) {
        if (!globalConfig.windows?.args && !globalConfig.osx?.args && !globalConfig.linux?.args) {
          configElement.args = task.command.args;
        } else {
          configElement.args = task._source.config.element.args;
        }
      }
    }
    if (task.configurationProperties.presentation) {
      configElement.presentation = task.configurationProperties.presentation;
    }
    if (task.configurationProperties.isBackground) {
      configElement.isBackground = task.configurationProperties.isBackground;
    }
    if (task.configurationProperties.problemMatchers) {
      configElement.problemMatcher = task._source.config.element.problemMatcher;
    }
    if (task.configurationProperties.group) {
      configElement.group = task.configurationProperties.group;
    }
    task._source.config.element = configElement;
    const tempTask = new CustomTask(task._id, task._source, task._label, task.type, task.command, task.hasDefinedMatchers, task.runOptions, task.configurationProperties);
    const configTask = this._createCustomizableTask(tempTask);
    if (configTask) {
      return configTask;
    }
    return;
  }
  async _upgrade() {
    if (this.schemaVersion === 2 /* V2_0_0 */) {
      return;
    }
    if (!this._workspaceTrustManagementService.isWorkspaceTrusted()) {
      this._register(Event2.once(this._workspaceTrustManagementService.onDidChangeTrust)((isTrusted) => {
        if (isTrusted) {
          this._upgrade();
        }
      }));
      return;
    }
    const tasks2 = await this._getGroupedTasks();
    const fileDiffs = [];
    for (const folder of this.workspaceFolders) {
      const diff4 = await this._createTasksDotOld(folder);
      if (diff4) {
        fileDiffs.push(diff4);
      }
      if (!diff4) {
        continue;
      }
      const configTasks = [];
      const suppressTaskName = !!this._configurationService.getValue("tasks.suppressTaskName" /* SuppressTaskName */, { resource: folder.uri });
      const globalConfig = {
        windows: this._configurationService.getValue("tasks.windows" /* Windows */, { resource: folder.uri }),
        osx: this._configurationService.getValue("tasks.osx" /* Osx */, { resource: folder.uri }),
        linux: this._configurationService.getValue("tasks.linux" /* Linux */, { resource: folder.uri })
      };
      tasks2.get(folder).forEach((task) => {
        const configTask = this._upgradeTask(task, suppressTaskName, globalConfig);
        if (configTask) {
          configTasks.push(configTask);
        }
      });
      this._taskSystem = void 0;
      this._workspaceTasksPromise = void 0;
      await this._writeConfiguration(folder, "tasks.tasks", configTasks);
      await this._writeConfiguration(folder, "tasks.version", "2.0.0");
      if (this._configurationService.getValue("tasks.showOutput" /* ShowOutput */, { resource: folder.uri })) {
        await this._configurationService.updateValue("tasks.showOutput" /* ShowOutput */, void 0, { resource: folder.uri });
      }
      if (this._configurationService.getValue("tasks.isShellCommand" /* IsShellCommand */, { resource: folder.uri })) {
        await this._configurationService.updateValue("tasks.isShellCommand" /* IsShellCommand */, void 0, { resource: folder.uri });
      }
      if (this._configurationService.getValue("tasks.suppressTaskName" /* SuppressTaskName */, { resource: folder.uri })) {
        await this._configurationService.updateValue("tasks.suppressTaskName" /* SuppressTaskName */, void 0, { resource: folder.uri });
      }
    }
    this._updateSetup();
    this._notificationService.prompt(
      severity_default.Warning,
      fileDiffs.length === 1 ? localize(19549, null) : localize(19550, null),
      [{
        label: fileDiffs.length === 1 ? localize(19526, null) : localize(19527, null),
        run: async () => {
          for (const upgrade of fileDiffs) {
            await this._editorService.openEditor({
              original: { resource: upgrade[0] },
              modified: { resource: upgrade[1] }
            });
          }
        }
      }]
    );
  }
};

AbstractTaskService = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IMarkerService),
  __decorateParam(2, IOutputService),
  __decorateParam(3, IPaneCompositePartService),
  __decorateParam(4, IViewsService),
  __decorateParam(5, ICommandService),
  __decorateParam(6, IEditorService),
  __decorateParam(7, IFileService),
  __decorateParam(8, IWorkspaceContextService),
  __decorateParam(9, ITelemetryService),
  __decorateParam(10, ITextFileService),
  __decorateParam(11, IModelService),
  __decorateParam(12, IExtensionService),
  __decorateParam(13, IQuickInputService),
  __decorateParam(14, IConfigurationResolverService),
  __decorateParam(15, ITerminalService),
  __decorateParam(16, ITerminalGroupService),
  __decorateParam(17, IStorageService),
  __decorateParam(18, IProgressService),
  __decorateParam(19, IOpenerService),
  __decorateParam(20, IDialogService),
  __decorateParam(21, INotificationService),
  __decorateParam(22, IContextKeyService),
  __decorateParam(23, IWorkbenchEnvironmentService),
  __decorateParam(24, ITerminalProfileResolverService),
  __decorateParam(25, IPathService),
  __decorateParam(26, ITextModelService),
  __decorateParam(27, IPreferencesService),
  __decorateParam(28, IViewDescriptorService),
  __decorateParam(29, IWorkspaceTrustRequestService),
  __decorateParam(30, IWorkspaceTrustManagementService),
  __decorateParam(31, ILogService),
  __decorateParam(32, IThemeService),
  __decorateParam(33, ILifecycleService),
  __decorateParam(34, IRemoteAgentService),
  __decorateParam(35, IInstantiationService),
  __decorateParam(36, IChatService),
  __decorateParam(37, IChatAgentService),
  __decorateParam(38, IHostService)
], AbstractTaskService);
export { QUICKOPEN_HISTORY_LIMIT_CONFIG, PROBLEM_MATCHER_NEVER_CONFIG, USE_SLOW_PICKER, TaskTerminalType2, ConfigureTaskAction, ProblemReporter, TaskMap, AbstractTaskService };
