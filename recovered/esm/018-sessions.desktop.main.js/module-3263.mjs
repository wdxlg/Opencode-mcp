// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/tasks/browser/terminalTaskSystem.ts
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { CommandString, ContributedTask, CustomTask, InMemoryTask, RerunForActiveTerminalCommandId, TASK_TERMINAL_ACTIVE, TaskEvent, TaskSourceKind, rerunTaskIcon } from "./module-1402.mjs";
import { localize } from "./module-0001.mjs";
import { LinkedMap } from "./module-0008.mjs";
import { Emitter } from "./module-0017.mjs";
import { TaskTerminalStatus } from "./module-3260.mjs";
import { TaskProblemMonitor } from "./module-3262.mjs";
import { VSCodeSequence } from "./module-3261.mjs";
import { serializeVSCodeOscMessage } from "./module-3068.mjs";
import { TaskError, Triggers, VerifiedTask } from "./module-3256.mjs";
import { severity_default } from "./module-0266.mjs";
import { asArray } from "./module-0007.mjs";
import { TERMINAL_VIEW_ID } from "./module-1174.mjs";
import { isObject, isString } from "./module-0010.mjs";
import { basename, isAbsolute, join, parse, posix, sep } from "./module-0026.mjs";
import { PlatformToString, isWindows, platform } from "./module-0014.mjs";
import { StartStopProblemCollector, WatchingProblemCollector } from "./module-3259.mjs";
import { Markers } from "./module-3023.mjs";
import { Delayer } from "./module-0036.mjs";
import { Schemas } from "./module-0033.mjs";
import { isUNC } from "./module-0031.mjs";
import { toLocalResource } from "./module-0034.mjs";
import { URI } from "./module-0032.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { GroupKind } from "./module-3258.mjs";
import { Codicon } from "./module-0085.mjs";
import { generateUuid } from "./module-0190.mjs";
import { formatMessageForTerminal } from "./module-3052.mjs";
import { deepClone } from "./module-0098.mjs";
import { TerminalProcessExtHostProxy } from "./module-1270.mjs";
import { ProblemMatcherRegistry } from "./module-3250.mjs";


// src/vs/workbench/contrib/tasks/browser/terminalTaskSystem.ts
var TaskTerminalType = "Task";

var VariableResolver2 = class _VariableResolver {
  constructor(workspaceFolder, taskSystemInfo, values, _service) {
    this.workspaceFolder = workspaceFolder;
    this.taskSystemInfo = taskSystemInfo;
    this.values = values;
    this._service = _service;
  }
  static {
    this._regex = /\$\{(.*?)\}/g;
  }
  async resolve(value2) {
    const replacers = [];
    value2.replace(_VariableResolver._regex, (match2, ...args2) => {
      replacers.push(this._replacer(match2, args2));
      return match2;
    });
    const resolvedReplacers = await Promise.all(replacers);
    return value2.replace(_VariableResolver._regex, () => resolvedReplacers.shift());
  }
  async _replacer(match2, args2) {
    const result = this.values.get(match2.substring(2, match2.length - 1));
    if (result !== void 0 && result !== null) {
      return result;
    }
    if (this._service) {
      return this._service.resolveAsync(this.workspaceFolder, match2);
    }
    return match2;
  }
};

var TerminalTaskSystem = class _TerminalTaskSystem extends Disposable {
  constructor(_terminalService, _terminalGroupService, _outputService, _paneCompositeService, _viewsService, _markerService, _modelService, _configurationResolverService, _contextService, _environmentService, _outputChannelId, _fileService, _terminalProfileResolverService, _pathService, _viewDescriptorService, _logService, _notificationService, contextKeyService, instantiationService, taskSystemInfoResolver, _taskLookup) {
    super();
    this._terminalService = _terminalService;
    this._terminalGroupService = _terminalGroupService;
    this._outputService = _outputService;
    this._paneCompositeService = _paneCompositeService;
    this._viewsService = _viewsService;
    this._markerService = _markerService;
    this._modelService = _modelService;
    this._configurationResolverService = _configurationResolverService;
    this._contextService = _contextService;
    this._environmentService = _environmentService;
    this._outputChannelId = _outputChannelId;
    this._fileService = _fileService;
    this._terminalProfileResolverService = _terminalProfileResolverService;
    this._pathService = _pathService;
    this._viewDescriptorService = _viewDescriptorService;
    this._logService = _logService;
    this._notificationService = _notificationService;
    this._taskLookup = _taskLookup;
    this._isRerun = false;
    this._terminalCreationQueue = Promise.resolve();
    this._hasReconnected = false;
    this._terminalTabActions = [{ id: RerunForActiveTerminalCommandId, label: localize(19661, null), icon: rerunTaskIcon }];
    this._taskStartTimes = /* @__PURE__ */ new Map();
    this._capturedTaskVariables = /* @__PURE__ */ new Map();
    this._activeTasks = /* @__PURE__ */ Object.create(null);
    this._busyTasks = /* @__PURE__ */ Object.create(null);
    this._taskErrors = /* @__PURE__ */ Object.create(null);
    this._taskDependencies = /* @__PURE__ */ Object.create(null);
    this._terminals = /* @__PURE__ */ Object.create(null);
    this._idleTaskTerminals = new LinkedMap();
    this._sameTaskTerminals = /* @__PURE__ */ Object.create(null);
    this._onDidStateChange = this._register(new Emitter());
    this._taskSystemInfoResolver = taskSystemInfoResolver;
    this._register(this._terminalStatusManager = instantiationService.createInstance(TaskTerminalStatus));
    this._register(this._taskProblemMonitor = instantiationService.createInstance(TaskProblemMonitor));
    this._taskTerminalActive = TASK_TERMINAL_ACTIVE.bindTo(contextKeyService);
    this._register(this._terminalService.onDidChangeActiveInstance((e4) => this._taskTerminalActive.set(e4?.shellLaunchConfig.type === "Task")));
  }
  static {
    this.TelemetryEventName = "taskService";
  }
  static {
    this.ProcessVarName = "__process__";
  }
  static {
    this._shellQuotes = {
      "cmd": {
        strong: '"'
      },
      "powershell": {
        escape: {
          escapeChar: "`",
          charsToEscape: ` "'()`
        },
        strong: "'",
        weak: '"'
      },
      "bash": {
        escape: {
          escapeChar: "\\",
          charsToEscape: ` "'`
        },
        strong: "'",
        weak: '"'
      },
      "zsh": {
        escape: {
          escapeChar: "\\",
          charsToEscape: ` "'`
        },
        strong: "'",
        weak: '"'
      }
    };
  }
  static {
    this._osShellQuotes = {
      "Linux": _TerminalTaskSystem._shellQuotes["bash"],
      "Mac": _TerminalTaskSystem._shellQuotes["bash"],
      "Windows": _TerminalTaskSystem._shellQuotes["powershell"]
    };
  }
  taskShellIntegrationStartSequence(cwd2) {
    return VSCodeSequence("P" /* Property */, `${"HasRichCommandDetection" /* HasRichCommandDetection */}=True`) + VSCodeSequence("A" /* PromptStart */) + VSCodeSequence("P" /* Property */, `${"Task" /* Task */}=True`) + (cwd2 ? VSCodeSequence("P" /* Property */, `${"Cwd" /* Cwd */}=${typeof cwd2 === "string" ? cwd2 : cwd2.fsPath}`) : "") + VSCodeSequence("B" /* CommandStart */);
  }
  getTaskShellIntegrationOutputSequence(commandLineInfo) {
    return (commandLineInfo ? VSCodeSequence("E" /* CommandLine */, `${serializeVSCodeOscMessage(commandLineInfo.commandLine)};${commandLineInfo.nonce}`) : "") + VSCodeSequence("C" /* CommandExecuted */);
  }
  get onDidStateChange() {
    return this._onDidStateChange.event;
  }
  _log(value2) {
    this._appendOutput(value2 + "\n");
  }
  _showOutput() {
    this._outputService.showChannel(this._outputChannelId, true);
  }
  reconnect(task, resolver) {
    this._reconnectToTerminals();
    return this.run(task, resolver, Triggers.reconnect);
  }
  run(task, resolver, trigger = Triggers.command) {
    task = task.clone();
    const instances = InMemoryTask.is(task) || this._isTaskEmpty(task) ? [] : this._getInstances(task);
    const validInstance = instances.length < ((task.runOptions && task.runOptions.instanceLimit) ?? 1);
    const instance2 = instances[0]?.count?.count ?? 0;
    this._currentTask = new VerifiedTask(task, resolver, trigger);
    if (instance2 > 0) {
      task.instance = instance2;
    }
    if (!validInstance) {
      const terminalData = instances[instances.length - 1];
      this._lastTask = this._currentTask;
      return { kind: 2 /* Active */, task: terminalData.task, active: { same: true, background: task.configurationProperties.isBackground }, promise: terminalData.promise };
    }
    try {
      const executeResult = { kind: 1 /* Started */, task, started: {}, promise: this._executeTask(task, resolver, trigger, /* @__PURE__ */ new Set(), /* @__PURE__ */ new Map(), void 0) };
      executeResult.promise.then((summary) => {
        this._lastTask = this._currentTask;
      });
      return executeResult;
    } catch (error) {
      if (error instanceof TaskError) {
        throw error;
      } else if (error instanceof Error) {
        this._log(error.message);
        throw new TaskError(severity_default.Error, error.message, 7 /* UnknownError */);
      } else {
        this._log(error.toString());
        throw new TaskError(severity_default.Error, localize(19670, null), 7 /* UnknownError */);
      }
    }
  }
  getTerminalsForTasks(tasks2) {
    const results = [];
    for (const t2 of asArray(tasks2)) {
      for (const key3 of Object.keys(this._terminals)) {
        const value2 = this._terminals[key3];
        if (value2.lastTask === t2.getMapKey()) {
          results.push(value2.terminal.resource);
        }
      }
    }
    return results.length > 0 ? results : void 0;
  }
  getTaskProblems(instanceId) {
    return this._taskProblemMonitor.getTaskProblems(instanceId);
  }
  rerun() {
    if (this._lastTask && this._lastTask.verify()) {
      if (this._lastTask.task.runOptions.reevaluateOnRerun !== void 0 && !this._lastTask.task.runOptions.reevaluateOnRerun) {
        this._isRerun = true;
      }
      const result = this.run(this._lastTask.task, this._lastTask.resolver);
      result.promise.then((summary) => {
        this._isRerun = false;
      });
      return result;
    } else {
      return void 0;
    }
  }
  get lastTask() {
    return this._lastTask;
  }
  set lastTask(task) {
    this._lastTask = task;
  }
  _showTaskLoadErrors(task) {
    if (task.taskLoadMessages && task.taskLoadMessages.length > 0) {
      task.taskLoadMessages.forEach((loadMessage) => {
        this._log(loadMessage + "\n");
      });
      const openOutput = "Show Output";
      this._notificationService.prompt(
        severity_default.Warning,
        localize(
          19669,
          null,
          task._label
        ),
        [{
          label: openOutput,
          run: () => this._showOutput()
        }]
      );
    }
  }
  isTaskVisible(task) {
    const terminalData = this._activeTasks[task.getMapKey()];
    if (!terminalData?.terminal) {
      return false;
    }
    const activeTerminalInstance = this._terminalService.activeInstance;
    const isPanelShowingTerminal = !!this._viewsService.getActiveViewWithId(TERMINAL_VIEW_ID);
    return isPanelShowingTerminal && activeTerminalInstance?.instanceId === terminalData.terminal.instanceId;
  }
  revealTask(task) {
    const terminalData = this._activeTasks[task.getMapKey()];
    if (!terminalData?.terminal) {
      return false;
    }
    const isTerminalInPanel = this._viewDescriptorService.getViewLocationById(TERMINAL_VIEW_ID) === 1 /* Panel */;
    if (isTerminalInPanel && this.isTaskVisible(task)) {
      if (this._previousPanelId) {
        if (this._previousTerminalInstance) {
          this._terminalService.setActiveInstance(this._previousTerminalInstance);
        }
        this._paneCompositeService.openPaneComposite(this._previousPanelId, 1 /* Panel */);
      } else {
        this._paneCompositeService.hideActivePaneComposite(1 /* Panel */);
      }
      this._previousPanelId = void 0;
      this._previousTerminalInstance = void 0;
    } else {
      if (isTerminalInPanel) {
        this._previousPanelId = this._paneCompositeService.getActivePaneComposite(1 /* Panel */)?.getId();
        if (this._previousPanelId === TERMINAL_VIEW_ID) {
          this._previousTerminalInstance = this._terminalService.activeInstance ?? void 0;
        }
      }
      this._terminalService.setActiveInstance(terminalData.terminal);
      if (CustomTask.is(task) || ContributedTask.is(task)) {
        this._terminalGroupService.showPanel(task.command.presentation.focus);
      }
    }
    return true;
  }
  isActive() {
    return Promise.resolve(this.isActiveSync());
  }
  isActiveSync() {
    return Object.values(this._activeTasks).some((value2) => !!value2.terminal);
  }
  canAutoTerminate() {
    return Object.values(this._activeTasks).every((value2) => !value2.task.configurationProperties.promptOnClose);
  }
  getActiveTasks() {
    return Object.values(this._activeTasks).flatMap((value2) => value2.terminal ? value2.task : []);
  }
  getLastInstance(task) {
    const recentKey = task.getKey();
    return Object.values(this._activeTasks).reverse().find(
      (value2) => recentKey && recentKey === value2.task.getKey()
    )?.task;
  }
  getFirstInstance(task) {
    const recentKey = task.getKey();
    for (const task2 of this.getActiveTasks()) {
      if (recentKey && recentKey === task2.getKey()) {
        return task2;
      }
    }
    return void 0;
  }
  getBusyTasks() {
    return Object.keys(this._busyTasks).map((key3) => this._busyTasks[key3]);
  }
  customExecutionComplete(task, result) {
    const activeTerminal = this._activeTasks[task.getMapKey()];
    if (!activeTerminal?.terminal) {
      return Promise.reject(new Error("Expected to have a terminal for a custom execution task"));
    }
    return new Promise((resolve3) => {
      resolve3();
    });
  }
  _getInstances(task) {
    const recentKey = task.getKey();
    return Object.values(this._activeTasks).filter(
      (value2) => recentKey && recentKey === value2.task.getKey()
    );
  }
  _removeFromActiveTasks(task) {
    const key3 = typeof task === "string" ? task : task.getMapKey();
    const taskToRemove = this._activeTasks[key3];
    if (!taskToRemove) {
      return;
    }
    delete this._activeTasks[key3];
  }
  _fireTaskEvent(event) {
    if (event.kind !== "changed" /* Changed */ && event.kind !== "problemMatcherEnded" /* ProblemMatcherEnded */ && event.kind !== "problemMatcherStarted" /* ProblemMatcherStarted */) {
      const activeTask = this._activeTasks[event.__task.getMapKey()];
      if (activeTask) {
        activeTask.state = event.kind;
      }
    }
    this._onDidStateChange.fire(event);
  }
  terminate(task) {
    const activeTerminal = this._activeTasks[task.getMapKey()];
    if (!activeTerminal) {
      return Promise.resolve({ success: false, task: void 0 });
    }
    const terminal2 = activeTerminal.terminal;
    if (!terminal2) {
      return Promise.resolve({ success: false, task: void 0 });
    }
    return new Promise((resolve3, reject) => {
      const onExit = terminal2.onExit(() => {
        const terminatedTask = activeTerminal.task;
        try {
          onExit.dispose();
          this._fireTaskEvent(TaskEvent.terminated(terminatedTask, terminal2.instanceId, terminal2.exitReason));
        } catch (error) {
        }
        resolve3({ success: true, task: terminatedTask });
      });
      terminal2.dispose();
    });
  }
  terminateAll() {
    const promises = [];
    for (const [key3, terminalData] of Object.entries(this._activeTasks)) {
      const terminal2 = terminalData?.terminal;
      if (terminal2) {
        promises.push(new Promise((resolve3, reject) => {
          const onExit = terminal2.onExit(() => {
            const task = terminalData.task;
            try {
              onExit.dispose();
              this._fireTaskEvent(TaskEvent.terminated(task, terminal2.instanceId, terminal2.exitReason));
            } catch (error) {
            }
            if (this._activeTasks[key3] === terminalData) {
              delete this._activeTasks[key3];
            }
            resolve3({ success: true, task: terminalData.task });
          });
        }));
        terminal2.dispose();
      }
    }
    return Promise.all(promises);
  }
  _showDependencyCycleMessage(task) {
    this._log(localize(
      19659,
      null,
      task._label
    ));
    this._showOutput();
  }
  _executeTask(task, resolver, trigger, liveDependencies, encounteredTasks, alreadyResolved) {
    this._showTaskLoadErrors(task);
    const mapKey = task.getMapKey();
    const promise = Promise.resolve().then(async () => {
      alreadyResolved = alreadyResolved ?? /* @__PURE__ */ new Map();
      const promises = [];
      if (task.configurationProperties.dependsOn) {
        const nextLiveDependencies = new Set(liveDependencies).add(task.getCommonTaskId());
        for (const dependency of task.configurationProperties.dependsOn) {
          const dependencyTask = await resolver.resolve(dependency.uri, dependency.task);
          if (dependencyTask) {
            this._adoptConfigurationForDependencyTask(dependencyTask, task);
            const taskMapKey = task.getMapKey();
            const dependencyMapKey = dependencyTask.getMapKey();
            if (!this._taskDependencies[taskMapKey]) {
              this._taskDependencies[taskMapKey] = [];
            }
            if (!this._taskDependencies[taskMapKey].includes(dependencyMapKey)) {
              this._taskDependencies[taskMapKey].push(dependencyMapKey);
            }
            let taskResult;
            const commonKey = dependencyTask.getCommonTaskId();
            if (nextLiveDependencies.has(commonKey)) {
              this._showDependencyCycleMessage(dependencyTask);
              taskResult = Promise.resolve({});
            } else {
              taskResult = encounteredTasks.get(commonKey);
              if (!taskResult) {
                const activeTask2 = this._activeTasks[dependencyTask.getMapKey()] ?? this._getInstances(dependencyTask).pop();
                taskResult = activeTask2 && this._getDependencyPromise(activeTask2);
              }
            }
            if (!taskResult) {
              this._fireTaskEvent(TaskEvent.general("dependsOnStarted" /* DependsOnStarted */, task));
              taskResult = this._executeDependencyTask(dependencyTask, resolver, trigger, nextLiveDependencies, encounteredTasks, alreadyResolved);
            }
            encounteredTasks.set(commonKey, taskResult);
            promises.push(taskResult);
            if (task.configurationProperties.dependsOrder === "sequence" /* sequence */) {
              const promiseResult = await taskResult;
              if (promiseResult.exitCode !== 0) {
                break;
              }
            }
          } else {
            this._log(localize(
              19660,
              null,
              isString(dependency.task) ? dependency.task : JSON.stringify(dependency.task, void 0, 0),
              dependency.uri.toString()
            ));
            this._showOutput();
          }
        }
      }
      return Promise.all(promises).then((summaries) => {
        for (const summary of summaries) {
          if (summary.exitCode !== 0) {
            return { exitCode: summary.exitCode };
          }
        }
        if ((ContributedTask.is(task) || CustomTask.is(task)) && task.command) {
          if (this._isRerun) {
            return this._reexecuteCommand(task, trigger, alreadyResolved);
          } else {
            return this._executeCommand(task, trigger, alreadyResolved);
          }
        }
        return { exitCode: 0 };
      });
    }).finally(() => {
      if (this._activeTasks[mapKey] === activeTask) {
        delete this._activeTasks[mapKey];
      }
    });
    const lastInstance = this._getInstances(task).pop();
    const count2 = lastInstance?.count ?? { count: 0 };
    count2.count++;
    const activeTask = { task, promise, count: count2 };
    this._activeTasks[mapKey] = activeTask;
    return promise;
  }
  _createInactiveDependencyPromise(task) {
    return new Promise((resolve3) => {
      const taskInactiveDisposable = this.onDidStateChange((taskEvent) => {
        if (taskEvent.kind === "inactive" /* Inactive */ && taskEvent.__task === task) {
          taskInactiveDisposable.dispose();
          resolve3({ exitCode: 0 });
        }
      });
    });
  }
  _taskHasErrors(task) {
    const taskMapKey = task.getMapKey();
    if (this._taskErrors[taskMapKey]) {
      return true;
    }
    const dependencies = this._taskDependencies[taskMapKey];
    if (dependencies) {
      for (const dependencyMapKey of dependencies) {
        if (this._taskErrors[dependencyMapKey]) {
          return true;
        }
      }
    }
    return false;
  }
  _cleanupTaskTracking(task) {
    const taskMapKey = task.getMapKey();
    delete this._taskErrors[taskMapKey];
    delete this._taskDependencies[taskMapKey];
  }
  _adoptConfigurationForDependencyTask(dependencyTask, task) {
    if (dependencyTask.configurationProperties.icon) {
      dependencyTask.configurationProperties.icon.id ||= task.configurationProperties.icon?.id;
      dependencyTask.configurationProperties.icon.color ||= task.configurationProperties.icon?.color;
    } else {
      dependencyTask.configurationProperties.icon = task.configurationProperties.icon;
    }
  }
  async _getDependencyPromise(task) {
    if (!task.task.configurationProperties.isBackground) {
      return task.promise;
    }
    if (!task.task.configurationProperties.problemMatchers || task.task.configurationProperties.problemMatchers.length === 0) {
      return task.promise;
    }
    if (task.state === "inactive" /* Inactive */) {
      return { exitCode: 0 };
    }
    return this._createInactiveDependencyPromise(task.task);
  }
  async _executeDependencyTask(task, resolver, trigger, liveDependencies, encounteredTasks, alreadyResolved) {
    if (!task.configurationProperties.isBackground) {
      return this._executeTask(task, resolver, trigger, liveDependencies, encounteredTasks, alreadyResolved);
    }
    const inactivePromise = this._createInactiveDependencyPromise(task);
    return Promise.race([inactivePromise, this._executeTask(task, resolver, trigger, liveDependencies, encounteredTasks, alreadyResolved)]);
  }
  async _resolveAndFindExecutable(systemInfo, workspaceFolder, task, cwd2, envPath) {
    const command4 = await this._configurationResolverService.resolveAsync(workspaceFolder, CommandString.value(task.command.name));
    cwd2 = cwd2 ? await this._configurationResolverService.resolveAsync(workspaceFolder, cwd2) : void 0;
    const delimiter2 = (await this._pathService.path).delimiter;
    const paths = envPath ? await Promise.all(envPath.split(delimiter2).map((p) => this._configurationResolverService.resolveAsync(workspaceFolder, p))) : void 0;
    const foundExecutable = await systemInfo?.findExecutable(command4, cwd2, paths);
    if (foundExecutable) {
      return foundExecutable;
    }
    if (isAbsolute(command4)) {
      return command4;
    }
    return join(cwd2 ?? "", command4);
  }
  _findUnresolvedVariables(variables, alreadyResolved) {
    if (alreadyResolved.size === 0) {
      return variables;
    }
    const unresolved = /* @__PURE__ */ new Set();
    for (const variable of variables) {
      if (!alreadyResolved.has(variable.substring(2, variable.length - 1))) {
        unresolved.add(variable);
      }
    }
    return unresolved;
  }
  _mergeMaps(mergeInto, mergeFrom) {
    for (const entry of mergeFrom) {
      if (!mergeInto.has(entry[0])) {
        mergeInto.set(entry[0], entry[1]);
      }
    }
  }
  async _acquireInput(taskSystemInfo, workspaceFolder, task, variables, alreadyResolved) {
    const resolved = await this._resolveVariablesFromSet(taskSystemInfo, workspaceFolder, task, variables, alreadyResolved);
    this._fireTaskEvent(TaskEvent.general("acquiredInput" /* AcquiredInput */, task));
    return resolved;
  }
  _resolveVariablesFromSet(taskSystemInfo, workspaceFolder, task, variables, alreadyResolved) {
    const isProcess = task.command && task.command.runtime === 2 /* Process */;
    const options3 = task.command && task.command.options ? task.command.options : void 0;
    const cwd2 = options3 ? options3.cwd : void 0;
    let envPath = void 0;
    if (options3 && options3.env) {
      for (const key3 of Object.keys(options3.env)) {
        if (key3.toLowerCase() === "path") {
          if (isString(options3.env[key3])) {
            envPath = options3.env[key3];
          }
          break;
        }
      }
    }
    const unresolved = this._findUnresolvedVariables(variables, alreadyResolved);
    let resolvedVariables;
    if (taskSystemInfo && workspaceFolder) {
      const resolveSet = {
        variables: unresolved
      };
      if (taskSystemInfo.platform === 3 /* Windows */ && isProcess) {
        resolveSet.process = { name: CommandString.value(task.command.name) };
        if (cwd2) {
          resolveSet.process.cwd = cwd2;
        }
        if (envPath) {
          resolveSet.process.path = envPath;
        }
      }
      resolvedVariables = taskSystemInfo.resolveVariables(workspaceFolder, resolveSet, TaskSourceKind.toConfigurationTarget(task._source.kind)).then(async (resolved) => {
        if (!resolved) {
          return void 0;
        }
        this._mergeMaps(alreadyResolved, resolved.variables);
        resolved.variables = new Map(alreadyResolved);
        if (isProcess) {
          let process3 = CommandString.value(task.command.name);
          if (taskSystemInfo.platform === 3 /* Windows */) {
            process3 = await this._resolveAndFindExecutable(taskSystemInfo, workspaceFolder, task, cwd2, envPath);
          }
          resolved.variables.set(_TerminalTaskSystem.ProcessVarName, process3);
        }
        return resolved;
      });
      return resolvedVariables;
    } else {
      const variablesArray = new Array();
      unresolved.forEach((variable) => variablesArray.push(variable));
      return new Promise((resolve3, reject) => {
        this._configurationResolverService.resolveWithInteraction(workspaceFolder, variablesArray, "tasks", void 0, TaskSourceKind.toConfigurationTarget(task._source.kind)).then(async (resolvedVariablesMap) => {
          if (resolvedVariablesMap) {
            this._mergeMaps(alreadyResolved, resolvedVariablesMap);
            resolvedVariablesMap = new Map(alreadyResolved);
            if (isProcess) {
              let processVarValue;
              if (isWindows) {
                processVarValue = await this._resolveAndFindExecutable(taskSystemInfo, workspaceFolder, task, cwd2, envPath);
              } else {
                processVarValue = await this._configurationResolverService.resolveAsync(workspaceFolder, CommandString.value(task.command.name));
              }
              resolvedVariablesMap.set(_TerminalTaskSystem.ProcessVarName, processVarValue);
            }
            const resolvedVariablesResult = {
              variables: resolvedVariablesMap
            };
            resolve3(resolvedVariablesResult);
          } else {
            resolve3(void 0);
          }
        }, (reason) => {
          reject(reason);
        });
      });
    }
  }
  _executeCommand(task, trigger, alreadyResolved) {
    const taskWorkspaceFolder = task.getWorkspaceFolder();
    let workspaceFolder;
    if (taskWorkspaceFolder) {
      workspaceFolder = this._currentTask.workspaceFolder = taskWorkspaceFolder;
    } else {
      const folders = this._contextService.getWorkspace().folders;
      workspaceFolder = folders.length > 0 ? folders[0] : void 0;
    }
    const systemInfo = this._currentTask.systemInfo = this._taskSystemInfoResolver(workspaceFolder);
    const variables = /* @__PURE__ */ new Set();
    this._collectTaskVariables(variables, task);
    const resolvedVariables = this._acquireInput(systemInfo, workspaceFolder, task, variables, alreadyResolved);
    return resolvedVariables.then((resolvedVariables2) => {
      if (resolvedVariables2 && !this._isTaskEmpty(task)) {
        this._currentTask.resolvedVariables = resolvedVariables2;
        return this._executeInTerminal(task, trigger, new VariableResolver2(workspaceFolder, systemInfo, resolvedVariables2.variables, this._configurationResolverService), workspaceFolder);
      } else {
        this._fireTaskEvent(TaskEvent.general("end" /* End */, task));
        return Promise.resolve({ exitCode: 0 });
      }
    }, (reason) => {
      return Promise.reject(reason);
    });
  }
  _isTaskEmpty(task) {
    const isCustomExecution = task.command.runtime === 3 /* CustomExecution */;
    return !(task.command !== void 0 && task.command.runtime && (isCustomExecution || task.command.name !== void 0));
  }
  _reexecuteCommand(task, trigger, alreadyResolved) {
    const lastTask = this._lastTask;
    if (!lastTask) {
      return Promise.reject(new Error("No task previously run"));
    }
    const workspaceFolder = this._currentTask.workspaceFolder = lastTask.workspaceFolder;
    this._currentTask.systemInfo = lastTask.systemInfo;
    const variables = /* @__PURE__ */ new Set();
    this._collectTaskVariables(variables, task);
    let hasAllVariables = true;
    variables.forEach((value2) => {
      if (Object.hasOwn(lastTask.getVerifiedTask().resolvedVariables, value2.substring(2, value2.length - 1))) {
        hasAllVariables = false;
      }
    });
    if (!hasAllVariables) {
      return this._acquireInput(lastTask.getVerifiedTask().systemInfo, lastTask.getVerifiedTask().workspaceFolder, task, variables, alreadyResolved).then((resolvedVariables) => {
        if (!resolvedVariables) {
          this._fireTaskEvent(TaskEvent.general("end" /* End */, task));
          return { exitCode: 0 };
        }
        this._currentTask.resolvedVariables = resolvedVariables;
        return this._executeInTerminal(task, trigger, new VariableResolver2(lastTask.getVerifiedTask().workspaceFolder, lastTask.getVerifiedTask().systemInfo, resolvedVariables.variables, this._configurationResolverService), workspaceFolder);
      }, (reason) => {
        return Promise.reject(reason);
      });
    } else {
      this._currentTask.resolvedVariables = lastTask.getVerifiedTask().resolvedVariables;
      return this._executeInTerminal(task, trigger, new VariableResolver2(lastTask.getVerifiedTask().workspaceFolder, lastTask.getVerifiedTask().systemInfo, lastTask.getVerifiedTask().resolvedVariables.variables, this._configurationResolverService), workspaceFolder);
    }
  }
  async _executeInTerminal(task, trigger, resolver, workspaceFolder) {
    let terminal2 = void 0;
    let error = void 0;
    let promise = void 0;
    if (task.configurationProperties.isBackground) {
      const problemMatchers = await this._resolveMatchers(resolver, task.configurationProperties.problemMatchers);
      const watchingProblemMatcher = new WatchingProblemCollector(problemMatchers, this._markerService, this._modelService, this._fileService, this._logService);
      if (problemMatchers.length > 0 && !watchingProblemMatcher.isWatching()) {
        this._appendOutput(localize(19668, null, task._label));
        this._showOutput();
      }
      const toDispose = new DisposableStore();
      let eventCounter = 0;
      const mapKey = task.getMapKey();
      toDispose.add(watchingProblemMatcher.onDidStateChange((event) => {
        if (event.kind === "backgroundProcessingBegins" /* BackgroundProcessingBegins */) {
          eventCounter++;
          this._busyTasks[mapKey] = task;
          this._fireTaskEvent(TaskEvent.general("active" /* Active */, task, terminal2?.instanceId));
        } else if (event.kind === "backgroundProcessingEnds" /* BackgroundProcessingEnds */) {
          eventCounter--;
          if (this._busyTasks[mapKey]) {
            delete this._busyTasks[mapKey];
          }
          if (event.capturedVariables) {
            this._registerCapturedVariables(event.capturedVariables);
          }
          this._fireTaskEvent(TaskEvent.inactive(task, terminal2?.instanceId, this._takeTaskDuration(terminal2?.instanceId)));
          if (eventCounter === 0) {
            if (watchingProblemMatcher.numberOfMatches > 0 && watchingProblemMatcher.maxMarkerSeverity && watchingProblemMatcher.maxMarkerSeverity >= 8 /* Error */) {
              this._taskErrors[task.getMapKey()] = true;
              this._fireTaskEvent(TaskEvent.general("problemMatcherFoundErrors" /* ProblemMatcherFoundErrors */, task, terminal2?.instanceId));
              const reveal = task.command.presentation.reveal;
              const revealProblems = task.command.presentation.revealProblems;
              if (revealProblems === 2 /* OnProblem */) {
                this._viewsService.openView(Markers.MARKERS_VIEW_ID, true);
              } else if (reveal === 2 /* Silent */) {
                this._terminalService.setActiveInstance(terminal2);
                this._terminalGroupService.showPanel(false);
              }
            } else {
              this._fireTaskEvent(TaskEvent.problemMatcherEnded(task, this._taskHasErrors(task), terminal2?.instanceId));
            }
          }
        }
      }));
      watchingProblemMatcher.aboutToStart();
      let delayer5 = void 0;
      [terminal2, error] = await this._createTerminal(task, resolver, workspaceFolder);
      if (error) {
        return Promise.reject(new Error(error.message));
      }
      if (!terminal2) {
        return Promise.reject(new Error(`Failed to create terminal for task ${task._label}`));
      }
      this._terminalStatusManager.addTerminal(task, terminal2, watchingProblemMatcher);
      this._taskProblemMonitor.addTerminal(terminal2, watchingProblemMatcher);
      let processStartedSignaled = false;
      terminal2.processReady.then(() => {
        if (!processStartedSignaled) {
          this._fireTaskEvent(TaskEvent.processStarted(task, terminal2.instanceId, terminal2.processId));
          processStartedSignaled = true;
        }
      }, (_error) => {
        this._logService.error("Task terminal process never got ready");
      });
      this._taskStartTimes.set(terminal2.instanceId, Date.now());
      this._fireTaskEvent(TaskEvent.start(task, terminal2.instanceId, resolver.values));
      let onData;
      if (problemMatchers.length) {
        onData = terminal2.onLineData((line) => {
          watchingProblemMatcher.processLine(line);
          if (!delayer5) {
            delayer5 = new Delayer(3e3);
          }
          delayer5.trigger(() => {
            watchingProblemMatcher.forceDelivery();
            delayer5 = void 0;
          });
        });
      }
      promise = new Promise((resolve3, reject) => {
        const boundTerminal = terminal2;
        const onExit = terminal2.onExit((terminalLaunchResult) => {
          const exitCode = typeof terminalLaunchResult === "number" ? terminalLaunchResult : terminalLaunchResult?.code;
          onData?.dispose();
          onExit.dispose();
          const key3 = task.getMapKey();
          if (this._busyTasks[mapKey]) {
            delete this._busyTasks[mapKey];
          }
          const cur = this._activeTasks[key3];
          if (cur && cur.terminal === boundTerminal) {
            this._removeFromActiveTasks(task);
          }
          this._fireTaskEvent(TaskEvent.changed());
          if (terminalLaunchResult !== void 0) {
            switch (task.command.presentation.panel) {
              case 2 /* Dedicated */:
                this._sameTaskTerminals[key3] = terminal2.instanceId.toString();
                break;
              case 1 /* Shared */:
                this._idleTaskTerminals.set(key3, terminal2.instanceId.toString(), 1 /* AsOld */);
                break;
            }
          }
          const reveal = task.command.presentation.reveal;
          if (reveal === 2 /* Silent */ && (exitCode !== 0 || watchingProblemMatcher.numberOfMatches > 0 && watchingProblemMatcher.maxMarkerSeverity && watchingProblemMatcher.maxMarkerSeverity >= 8 /* Error */)) {
            try {
              this._terminalService.setActiveInstance(terminal2);
              this._terminalGroupService.showPanel(false);
            } catch (e4) {
            }
          }
          watchingProblemMatcher.done();
          watchingProblemMatcher.dispose();
          if (!processStartedSignaled) {
            this._fireTaskEvent(TaskEvent.processStarted(task, terminal2.instanceId, terminal2.processId));
            processStartedSignaled = true;
          }
          const durationMs = this._takeTaskDuration(terminal2.instanceId);
          this._fireTaskEvent(TaskEvent.processEnded(task, terminal2.instanceId, exitCode, durationMs));
          for (let i2 = 0; i2 < eventCounter; i2++) {
            this._fireTaskEvent(TaskEvent.inactive(task, terminal2.instanceId));
          }
          eventCounter = 0;
          this._fireTaskEvent(TaskEvent.general("end" /* End */, task));
          toDispose.dispose();
          resolve3({ exitCode: exitCode ?? void 0 });
        });
      });
      if (trigger === Triggers.reconnect && !!terminal2.xterm) {
        const bufferLines = [];
        const bufferReverseIterator = terminal2.xterm.getBufferReverseIterator();
        const startRegex = new RegExp(watchingProblemMatcher.beginPatterns.map((pattern) => pattern.source).join("|"));
        for (const nextLine of bufferReverseIterator) {
          bufferLines.push(nextLine);
          if (startRegex.test(nextLine)) {
            break;
          }
        }
        let delayer6 = void 0;
        for (let i2 = bufferLines.length - 1; i2 >= 0; i2--) {
          watchingProblemMatcher.processLine(bufferLines[i2]);
          if (!delayer6) {
            delayer6 = new Delayer(3e3);
          }
          delayer6.trigger(() => {
            watchingProblemMatcher.forceDelivery();
            delayer6 = void 0;
          });
        }
      }
    } else {
      [terminal2, error] = await this._createTerminal(task, resolver, workspaceFolder);
      if (error) {
        return Promise.reject(new Error(error.message));
      }
      if (!terminal2) {
        return Promise.reject(new Error(`Failed to create terminal for task ${task._label}`));
      }
      this._taskStartTimes.set(terminal2.instanceId, Date.now());
      this._fireTaskEvent(TaskEvent.start(task, terminal2.instanceId, resolver.values));
      const mapKey = task.getMapKey();
      this._busyTasks[mapKey] = task;
      this._fireTaskEvent(TaskEvent.general("active" /* Active */, task, terminal2.instanceId));
      const problemMatchers = await this._resolveMatchers(resolver, task.configurationProperties.problemMatchers);
      const startStopProblemMatcher = new StartStopProblemCollector(problemMatchers, this._markerService, this._modelService, 0 /* Clean */, this._fileService, this._logService);
      this._terminalStatusManager.addTerminal(task, terminal2, startStopProblemMatcher);
      this._taskProblemMonitor.addTerminal(terminal2, startStopProblemMatcher);
      const problemMatcherListener = startStopProblemMatcher.onDidStateChange((event) => {
        if (event.kind === "backgroundProcessingBegins" /* BackgroundProcessingBegins */) {
          this._fireTaskEvent(TaskEvent.general("problemMatcherStarted" /* ProblemMatcherStarted */, task, terminal2?.instanceId));
        } else if (event.kind === "backgroundProcessingEnds" /* BackgroundProcessingEnds */) {
          if (startStopProblemMatcher.numberOfMatches && startStopProblemMatcher.maxMarkerSeverity && startStopProblemMatcher.maxMarkerSeverity >= 8 /* Error */) {
            this._taskErrors[task.getMapKey()] = true;
            this._fireTaskEvent(TaskEvent.general("problemMatcherFoundErrors" /* ProblemMatcherFoundErrors */, task, terminal2?.instanceId));
          } else {
            this._fireTaskEvent(TaskEvent.problemMatcherEnded(task, this._taskHasErrors(task), terminal2?.instanceId));
          }
        }
      });
      let processStartedSignaled = false;
      terminal2.processReady.then(() => {
        if (!processStartedSignaled) {
          this._fireTaskEvent(TaskEvent.processStarted(task, terminal2.instanceId, terminal2.processId));
          processStartedSignaled = true;
        }
      }, (_error) => {
      });
      const onData = terminal2.onLineData((line) => {
        startStopProblemMatcher.processLine(line);
      });
      promise = new Promise((resolve3, reject) => {
        const boundTerminal = terminal2;
        const onExit = terminal2.onExit((terminalLaunchResult) => {
          const exitCode = typeof terminalLaunchResult === "number" ? terminalLaunchResult : terminalLaunchResult?.code;
          onExit.dispose();
          const key3 = task.getMapKey();
          const cur = this._activeTasks[key3];
          if (cur && cur.terminal === boundTerminal) {
            this._removeFromActiveTasks(task);
          }
          this._fireTaskEvent(TaskEvent.changed());
          if (terminalLaunchResult !== void 0) {
            switch (task.command.presentation.panel) {
              case 2 /* Dedicated */:
                this._sameTaskTerminals[key3] = terminal2.instanceId.toString();
                break;
              case 1 /* Shared */:
                this._idleTaskTerminals.set(key3, terminal2.instanceId.toString(), 1 /* AsOld */);
                break;
            }
          }
          const reveal = task.command.presentation.reveal;
          const revealProblems = task.command.presentation.revealProblems;
          const revealProblemPanel = terminal2 && revealProblems === 2 /* OnProblem */ && startStopProblemMatcher.numberOfMatches > 0;
          if (revealProblemPanel) {
            this._viewsService.openView(Markers.MARKERS_VIEW_ID);
          } else if (terminal2 && reveal === 2 /* Silent */ && (exitCode !== 0 || startStopProblemMatcher.numberOfMatches > 0 && startStopProblemMatcher.maxMarkerSeverity && startStopProblemMatcher.maxMarkerSeverity >= 8 /* Error */)) {
            try {
              this._terminalService.setActiveInstance(terminal2);
              this._terminalGroupService.showPanel(false);
            } catch (e4) {
            }
          }
          setTimeout(() => {
            onData.dispose();
            startStopProblemMatcher.done();
            startStopProblemMatcher.dispose();
            problemMatcherListener.dispose();
          }, 100);
          if (!processStartedSignaled && terminal2) {
            this._fireTaskEvent(TaskEvent.processStarted(task, terminal2.instanceId, terminal2.processId));
            processStartedSignaled = true;
          }
          const durationMs = this._takeTaskDuration(terminal2?.instanceId);
          this._fireTaskEvent(TaskEvent.processEnded(task, terminal2?.instanceId, exitCode ?? void 0, durationMs));
          if (this._busyTasks[mapKey]) {
            delete this._busyTasks[mapKey];
          }
          this._fireTaskEvent(TaskEvent.inactive(task, terminal2?.instanceId, durationMs));
          if (startStopProblemMatcher.numberOfMatches && startStopProblemMatcher.maxMarkerSeverity && startStopProblemMatcher.maxMarkerSeverity >= 8 /* Error */) {
            this._taskErrors[task.getMapKey()] = true;
            this._fireTaskEvent(TaskEvent.general("problemMatcherFoundErrors" /* ProblemMatcherFoundErrors */, task, terminal2?.instanceId));
          } else {
            this._fireTaskEvent(TaskEvent.problemMatcherEnded(task, this._taskHasErrors(task), terminal2?.instanceId));
          }
          this._fireTaskEvent(TaskEvent.general("end" /* End */, task, terminal2?.instanceId));
          this._cleanupTaskTracking(task);
          resolve3({ exitCode: exitCode ?? void 0 });
        });
      });
    }
    const showProblemPanel = task.command.presentation && task.command.presentation.revealProblems === 3 /* Always */;
    if (showProblemPanel) {
      this._viewsService.openView(Markers.MARKERS_VIEW_ID);
    } else if (task.command.presentation && (task.command.presentation.focus || task.command.presentation.reveal === 1 /* Always */)) {
      this._terminalService.setActiveInstance(terminal2);
      await this._terminalService.revealTerminal(terminal2);
      if (task.command.presentation.focus && terminal2) {
        await this._terminalService.focusInstance(terminal2);
      }
    }
    if (this._activeTasks[task.getMapKey()]) {
      this._activeTasks[task.getMapKey()].terminal = terminal2;
    } else {
      this._logService.warn("No active tasks found for the terminal.");
    }
    this._fireTaskEvent(TaskEvent.changed());
    return promise;
  }
  _takeTaskDuration(terminalId) {
    if (terminalId === void 0) {
      return void 0;
    }
    const startTime = this._taskStartTimes.get(terminalId);
    if (startTime === void 0) {
      return void 0;
    }
    this._taskStartTimes.delete(terminalId);
    return Date.now() - startTime;
  }
  _registerCapturedVariables(capturedVariables) {
    for (const [name, value2] of capturedVariables) {
      this._capturedTaskVariables.set(name, value2);
      if (!this._configurationResolverService.resolvableVariables.has(`taskVar:${name}`)) {
        this._configurationResolverService.contributeVariable(`taskVar:${name}`, async () => this._capturedTaskVariables.get(name));
      }
    }
  }
  _createTerminalName(task) {
    const needsFolderQualification = this._contextService.getWorkbenchState() === 3 /* WORKSPACE */;
    return needsFolderQualification ? task.getQualifiedLabel() : task.configurationProperties.name || "";
  }
  async _createShellLaunchConfig(task, workspaceFolder, variableResolver, platform3, options3, command4, args2, waitOnExit, presentationOptions) {
    let shellLaunchConfig;
    const isShellCommand = task.command.runtime === 1 /* Shell */;
    const needsFolderQualification = this._contextService.getWorkbenchState() === 3 /* WORKSPACE */;
    const terminalName = this._createTerminalName(task);
    const type = TaskTerminalType;
    const originalCommand = task.command.name;
    let cwd2;
    if (options3.cwd) {
      cwd2 = options3.cwd;
      if (!isAbsolute(cwd2)) {
        if (workspaceFolder && workspaceFolder.uri.scheme === Schemas.file) {
          cwd2 = join(workspaceFolder.uri.fsPath, cwd2);
        }
      }
      cwd2 = isUNC(cwd2) ? cwd2 : toLocalResource(URI.from({ scheme: Schemas.file, path: cwd2 }), this._environmentService.remoteAuthority, this._pathService.defaultUriScheme);
    }
    if (isShellCommand) {
      let os;
      switch (platform3) {
        case 3 /* Windows */:
          os = 1 /* Windows */;
          break;
        case 1 /* Mac */:
          os = 2 /* Macintosh */;
          break;
        case 2 /* Linux */:
        default:
          os = 3 /* Linux */;
          break;
      }
      const defaultProfile = await this._terminalProfileResolverService.getDefaultProfile({
        allowAutomationShell: true,
        os,
        remoteAuthority: this._environmentService.remoteAuthority
      });
      let icon2;
      if (task.configurationProperties.icon?.id) {
        icon2 = ThemeIcon.fromId(task.configurationProperties.icon.id);
      } else {
        const taskGroupKind = task.configurationProperties.group ? GroupKind.to(task.configurationProperties.group) : void 0;
        const kindId = typeof taskGroupKind === "string" ? taskGroupKind : taskGroupKind?.kind;
        icon2 = kindId === "test" ? ThemeIcon.fromId(Codicon.beaker.id) : defaultProfile.icon;
      }
      shellLaunchConfig = {
        name: terminalName,
        type,
        executable: defaultProfile.path,
        args: defaultProfile.args,
        env: { ...defaultProfile.env },
        icon: icon2,
        color: task.configurationProperties.icon?.color || void 0,
        waitOnExit
      };
      let shellSpecified = false;
      const shellOptions = task.command.options && task.command.options.shell;
      if (shellOptions) {
        if (shellOptions.executable) {
          if (shellOptions.executable !== shellLaunchConfig.executable) {
            shellLaunchConfig.args = void 0;
          }
          shellLaunchConfig.executable = await this._resolveVariable(variableResolver, shellOptions.executable);
          shellSpecified = true;
        }
        if (shellOptions.args) {
          shellLaunchConfig.args = await this._resolveVariables(variableResolver, shellOptions.args.slice());
        }
      }
      if (shellLaunchConfig.args === void 0) {
        shellLaunchConfig.args = [];
      }
      const shellArgs = Array.isArray(shellLaunchConfig.args) ? shellLaunchConfig.args.slice(0) : [shellLaunchConfig.args];
      const toAdd = [];
      const basename3 = posix.basename((await this._pathService.fileURI(shellLaunchConfig.executable)).path).toLowerCase();
      const commandLine = this._buildShellCommandLine(platform3, basename3, shellOptions, command4, originalCommand, args2);
      let windowsShellArgs = false;
      if (platform3 === 3 /* Windows */) {
        windowsShellArgs = true;
        const userHome = await this._pathService.userHome();
        if (basename3 === "cmd.exe" && (options3.cwd && isUNC(options3.cwd) || !options3.cwd && isUNC(userHome.fsPath))) {
          return void 0;
        }
        if (basename3 === "powershell.exe" || basename3 === "pwsh.exe") {
          if (!shellSpecified) {
            toAdd.push("-Command");
          }
        } else if (basename3 === "bash.exe" || basename3 === "zsh.exe") {
          windowsShellArgs = false;
          if (!shellSpecified) {
            toAdd.push("-c");
          }
        } else if (basename3 === "wsl.exe") {
          if (!shellSpecified) {
            toAdd.push("-e");
          }
        } else if (basename3 === "nu.exe") {
          if (!shellSpecified) {
            toAdd.push("-c");
          }
        } else {
          if (!shellSpecified) {
            toAdd.push("/d", "/c");
          }
        }
      } else {
        if (!shellSpecified) {
          if (platform3 === 1 /* Mac */) {
          }
          toAdd.push("-c");
        }
      }
      const combinedShellArgs = this._addAllArgument(toAdd, shellArgs);
      combinedShellArgs.push(commandLine);
      shellLaunchConfig.shellIntegrationNonce = generateUuid();
      const commandLineInfo = {
        commandLine,
        nonce: shellLaunchConfig.shellIntegrationNonce
      };
      shellLaunchConfig.args = windowsShellArgs ? combinedShellArgs.join(" ") : combinedShellArgs;
      if (task.command.presentation && task.command.presentation.echo) {
        if (needsFolderQualification && workspaceFolder) {
          const folder = cwd2 && typeof cwd2 === "object" && Object.hasOwn(cwd2, "path") ? basename(cwd2.path) : workspaceFolder.name;
          shellLaunchConfig.initialText = this.taskShellIntegrationStartSequence(cwd2) + formatMessageForTerminal(localize(19666, null, folder, commandLine), { excludeLeadingNewLine: true }) + this.getTaskShellIntegrationOutputSequence(commandLineInfo);
        } else {
          shellLaunchConfig.initialText = this.taskShellIntegrationStartSequence(cwd2) + formatMessageForTerminal(localize(19665, null, commandLine), { excludeLeadingNewLine: true }) + this.getTaskShellIntegrationOutputSequence(commandLineInfo);
        }
      } else {
        shellLaunchConfig.initialText = {
          text: this.taskShellIntegrationStartSequence(cwd2) + this.getTaskShellIntegrationOutputSequence(commandLineInfo),
          trailingNewLine: false
        };
      }
    } else {
      const commandExecutable = task.command.runtime !== 3 /* CustomExecution */ ? CommandString.value(command4) : void 0;
      const executable = !isShellCommand ? await this._resolveVariable(variableResolver, await this._resolveVariable(variableResolver, "${" + _TerminalTaskSystem.ProcessVarName + "}")) : commandExecutable;
      shellLaunchConfig = {
        name: terminalName,
        type,
        icon: task.configurationProperties.icon?.id ? ThemeIcon.fromId(task.configurationProperties.icon.id) : void 0,
        color: task.configurationProperties.icon?.color || void 0,
        executable,
        args: args2.map((a) => isString(a) ? a : a.value),
        waitOnExit
      };
      if (task.command.presentation && task.command.presentation.echo) {
        const getArgsToEcho = (args3) => {
          if (!args3 || args3.length === 0) {
            return "";
          }
          if (isString(args3)) {
            return args3;
          }
          return args3.join(" ");
        };
        if (needsFolderQualification && workspaceFolder) {
          shellLaunchConfig.initialText = this.taskShellIntegrationStartSequence(cwd2) + formatMessageForTerminal(localize(19666, null, workspaceFolder.name, `${shellLaunchConfig.executable} ${getArgsToEcho(shellLaunchConfig.args)}`), { excludeLeadingNewLine: true }) + this.getTaskShellIntegrationOutputSequence(void 0);
        } else {
          shellLaunchConfig.initialText = this.taskShellIntegrationStartSequence(cwd2) + formatMessageForTerminal(localize(19664, null, `${shellLaunchConfig.executable} ${getArgsToEcho(shellLaunchConfig.args)}`), { excludeLeadingNewLine: true }) + this.getTaskShellIntegrationOutputSequence(void 0);
        }
      } else {
        shellLaunchConfig.initialText = {
          text: this.taskShellIntegrationStartSequence(cwd2) + this.getTaskShellIntegrationOutputSequence(void 0),
          trailingNewLine: false
        };
      }
    }
    if (cwd2) {
      shellLaunchConfig.cwd = cwd2;
    }
    if (options3.env) {
      if (shellLaunchConfig.env) {
        shellLaunchConfig.env = { ...shellLaunchConfig.env, ...options3.env };
      } else {
        shellLaunchConfig.env = options3.env;
      }
    }
    shellLaunchConfig.isFeatureTerminal = true;
    shellLaunchConfig.useShellEnvironment = true;
    shellLaunchConfig.tabActions = this._terminalTabActions;
    return shellLaunchConfig;
  }
  _addAllArgument(shellCommandArgs, configuredShellArgs) {
    const combinedShellArgs = deepClone(configuredShellArgs);
    shellCommandArgs.forEach((element) => {
      const shouldAddShellCommandArg = configuredShellArgs.every((arg, index2) => {
        if (arg.toLowerCase() === element && configuredShellArgs.length > index2 + 1) {
          return !configuredShellArgs.slice(index2 + 1).every((testArg) => testArg.startsWith("-"));
        } else {
          return arg.toLowerCase() !== element;
        }
      });
      if (shouldAddShellCommandArg) {
        combinedShellArgs.push(element);
      }
    });
    return combinedShellArgs;
  }
  async _reconnectToTerminal(task) {
    const reconnectedInstances = this._terminalService.instances.filter((e4) => e4.reconnectionProperties?.ownerId === TaskTerminalType);
    return reconnectedInstances.find((e4) => getReconnectionData(e4)?.lastTask === task.getCommonTaskId());
  }
  async _doCreateTerminal(task, group2, launchConfigs) {
    const reconnectedTerminal = await this._reconnectToTerminal(task);
    const registerOnDisposed = (terminal2) => {
      const listener = terminal2.onDisposed(() => {
        this._fireTaskEvent(TaskEvent.terminated(task, terminal2.instanceId, terminal2.exitReason));
        listener.dispose();
      });
    };
    if (reconnectedTerminal) {
      if ((CustomTask.is(task) || ContributedTask.is(task)) && task.command.presentation) {
        reconnectedTerminal.waitOnExit = getWaitOnExitValue(task.command.presentation, task.configurationProperties);
      }
      registerOnDisposed(reconnectedTerminal);
      this._logService.trace("reconnected to task and terminal", task._id);
      return reconnectedTerminal;
    }
    if (group2) {
      for (const terminal2 of Object.values(this._terminals)) {
        if (terminal2.group === group2) {
          this._logService.trace(`Found terminal to split for group ${group2}`);
          const originalInstance = terminal2.terminal;
          const result = await this._terminalService.createTerminal({ location: { parentTerminal: originalInstance }, config: launchConfigs });
          registerOnDisposed(result);
          if (result) {
            return result;
          }
        }
      }
      this._logService.trace(`No terminal found to split for group ${group2}`);
    }
    const createdTerminal = await this._terminalService.createTerminal({ config: launchConfigs });
    registerOnDisposed(createdTerminal);
    return createdTerminal;
  }
  _reconnectToTerminals() {
    if (this._hasReconnected) {
      this._logService.trace(`Already reconnected to terminals, so returning`);
      return;
    }
    const reconnectedInstances = this._terminalService.instances.filter((e4) => e4.reconnectionProperties?.ownerId === TaskTerminalType);
    this._logService.trace(`Attempting reconnection of ${reconnectedInstances.length} terminals`);
    if (!reconnectedInstances.length) {
      this._logService.trace(`No terminals to reconnect to so returning`);
    } else {
      for (const terminal2 of reconnectedInstances) {
        const data = getReconnectionData(terminal2);
        if (data) {
          const terminalData = { lastTask: data.lastTask, group: data.group, terminal: terminal2, shellIntegrationNonce: data.shellIntegrationNonce };
          this._terminals[terminal2.instanceId] = terminalData;
          const listener = terminal2.onDisposed(() => {
            this._deleteTaskAndTerminal(terminal2, terminalData);
            listener.dispose();
          });
          this._logService.trace("Reconnecting to task terminal", terminalData.lastTask, terminal2.instanceId);
        }
      }
    }
    this._hasReconnected = true;
  }
  _deleteTaskAndTerminal(terminal2, terminalData) {
    delete this._terminals[terminal2.instanceId];
    delete this._sameTaskTerminals[terminalData.lastTask];
    this._idleTaskTerminals.delete(terminalData.lastTask);
    const mapKey = terminalData.lastTask;
    const cur = this._activeTasks[mapKey];
    if (cur && cur.terminal === terminal2) {
      this._removeFromActiveTasks(mapKey);
    }
    if (this._busyTasks[mapKey]) {
      delete this._busyTasks[mapKey];
    }
  }
  async _createTerminal(task, resolver, workspaceFolder) {
    const platform3 = resolver.taskSystemInfo ? resolver.taskSystemInfo.platform : platform;
    const options3 = await this._resolveOptions(resolver, task.command.options);
    const presentationOptions = task.command.presentation;
    if (!presentationOptions) {
      throw new Error("Task presentation options should not be undefined here.");
    }
    const waitOnExit = getWaitOnExitValue(presentationOptions, task.configurationProperties);
    let command4;
    let args2;
    let launchConfigs;
    if (task.command.runtime === 3 /* CustomExecution */) {
      this._currentTask.shellLaunchConfig = launchConfigs = {
        customPtyImplementation: (id2, cols, rows) => new TerminalProcessExtHostProxy(id2, cols, rows, this._terminalService),
        waitOnExit,
        name: this._createTerminalName(task),
        initialText: task.command.presentation && task.command.presentation.echo ? formatMessageForTerminal(localize(19663, null, task._label), { excludeLeadingNewLine: true }) : void 0,
        isFeatureTerminal: true,
        icon: task.configurationProperties.icon?.id ? ThemeIcon.fromId(task.configurationProperties.icon.id) : void 0,
        color: task.configurationProperties.icon?.color || void 0
      };
    } else {
      const resolvedResult = await this._resolveCommandAndArgs(resolver, task.command);
      command4 = resolvedResult.command;
      args2 = resolvedResult.args;
      this._currentTask.shellLaunchConfig = launchConfigs = await this._createShellLaunchConfig(task, workspaceFolder, resolver, platform3, options3, command4, args2, waitOnExit, presentationOptions);
      if (launchConfigs === void 0) {
        return [void 0, new TaskError(severity_default.Error, localize(19667, null), 7 /* UnknownError */)];
      }
    }
    const prefersSameTerminal = presentationOptions.panel === 2 /* Dedicated */;
    const allowsSharedTerminal = presentationOptions.panel === 1 /* Shared */;
    const group2 = presentationOptions.group;
    const taskKey = task.getMapKey();
    let terminalToReuse;
    if (prefersSameTerminal) {
      const terminalId = this._sameTaskTerminals[taskKey];
      if (terminalId) {
        terminalToReuse = this._terminals[terminalId];
        delete this._sameTaskTerminals[taskKey];
      }
    } else if (allowsSharedTerminal) {
      let terminalId = this._idleTaskTerminals.remove(taskKey);
      if (!terminalId) {
        for (const taskId of this._idleTaskTerminals.keys()) {
          const idleTerminalId = this._idleTaskTerminals.get(taskId);
          if (idleTerminalId && this._terminals[idleTerminalId] && this._terminals[idleTerminalId].group === group2) {
            terminalId = this._idleTaskTerminals.remove(taskId);
            break;
          }
        }
      }
      if (terminalId) {
        terminalToReuse = this._terminals[terminalId];
      }
    }
    if (terminalToReuse) {
      if (!launchConfigs) {
        throw new Error("Task shell launch configuration should not be undefined here.");
      }
      terminalToReuse.terminal.scrollToBottom();
      if (task.configurationProperties.isBackground) {
        launchConfigs.reconnectionProperties = { ownerId: TaskTerminalType, data: { lastTask: task.getCommonTaskId(), group: group2, label: task._label, id: task._id } };
      }
      if (terminalToReuse.shellIntegrationNonce) {
        if (isString(launchConfigs.initialText) && launchConfigs.shellIntegrationNonce) {
          launchConfigs.initialText = launchConfigs.initialText.replace(launchConfigs.shellIntegrationNonce, terminalToReuse.shellIntegrationNonce);
        }
      }
      await terminalToReuse.terminal.reuseTerminal(launchConfigs);
      if (task.command.presentation && task.command.presentation.clear) {
        terminalToReuse.terminal.clearBuffer();
      }
      this._terminals[terminalToReuse.terminal.instanceId.toString()].lastTask = taskKey;
      return [terminalToReuse.terminal, void 0];
    }
    this._terminalCreationQueue = this._terminalCreationQueue.then(() => this._doCreateTerminal(task, group2, launchConfigs));
    const terminal2 = await this._terminalCreationQueue;
    if (task.configurationProperties.isBackground) {
      terminal2.shellLaunchConfig.reconnectionProperties = { ownerId: TaskTerminalType, data: { lastTask: task.getCommonTaskId(), group: group2, label: task._label, id: task._id } };
    }
    const terminalKey = terminal2.instanceId.toString();
    const terminalData = { terminal: terminal2, lastTask: taskKey, group: group2, shellIntegrationNonce: terminal2.shellLaunchConfig.shellIntegrationNonce };
    const onDisposedListener = terminal2.onDisposed(() => {
      this._deleteTaskAndTerminal(terminal2, terminalData);
      onDisposedListener.dispose();
    });
    this._terminals[terminalKey] = terminalData;
    terminal2.shellLaunchConfig.tabActions = this._terminalTabActions;
    return [terminal2, void 0];
  }
  _buildShellCommandLine(platform3, shellExecutable, shellOptions, command4, originalCommand, args2) {
    const basename3 = parse(shellExecutable).name.toLowerCase();
    const shellQuoteOptions = this._getQuotingOptions(basename3, shellOptions, platform3);
    function needsQuotes(value3) {
      if (value3.length >= 2) {
        const first2 = value3[0] === shellQuoteOptions.strong ? shellQuoteOptions.strong : value3[0] === shellQuoteOptions.weak ? shellQuoteOptions.weak : void 0;
        if (first2 === value3[value3.length - 1]) {
          return false;
        }
      }
      let quote2;
      for (let i2 = 0; i2 < value3.length; i2++) {
        const ch = value3[i2];
        if (ch === quote2) {
          quote2 = void 0;
        } else if (quote2 !== void 0) {
          continue;
        } else if (ch === shellQuoteOptions.escape) {
          i2++;
        } else if (ch === shellQuoteOptions.strong || ch === shellQuoteOptions.weak) {
          quote2 = ch;
        } else if (ch === " ") {
          return true;
        }
      }
      return false;
    }
    function quote(value3, kind) {
      if (kind === 2 /* Strong */ && shellQuoteOptions.strong) {
        return [shellQuoteOptions.strong + value3 + shellQuoteOptions.strong, true];
      } else if (kind === 3 /* Weak */ && shellQuoteOptions.weak) {
        return [shellQuoteOptions.weak + value3 + shellQuoteOptions.weak, true];
      } else if (kind === 1 /* Escape */ && shellQuoteOptions.escape) {
        if (isString(shellQuoteOptions.escape)) {
          return [value3.replace(/ /g, shellQuoteOptions.escape + " "), true];
        } else {
          const buffer = [];
          for (const ch of shellQuoteOptions.escape.charsToEscape) {
            buffer.push(`\\${ch}`);
          }
          const regexp2 = new RegExp("[" + buffer.join(",") + "]", "g");
          const escapeChar = shellQuoteOptions.escape.escapeChar;
          return [value3.replace(regexp2, (match2) => escapeChar + match2), true];
        }
      }
      return [value3, false];
    }
    function quoteIfNecessary(value3) {
      if (isString(value3)) {
        if (needsQuotes(value3)) {
          return quote(value3, 2 /* Strong */);
        } else {
          return [value3, false];
        }
      } else {
        return quote(value3.value, value3.quoting);
      }
    }
    if ((!args2 || args2.length === 0) && isString(command4) && (command4 === originalCommand || needsQuotes(originalCommand))) {
      return command4;
    }
    const result = [];
    let commandQuoted = false;
    let argQuoted = false;
    let value2;
    let quoted;
    [value2, quoted] = quoteIfNecessary(command4);
    result.push(value2);
    commandQuoted = quoted;
    for (const arg of args2) {
      [value2, quoted] = quoteIfNecessary(arg);
      result.push(value2);
      argQuoted = argQuoted || quoted;
    }
    let commandLine = result.join(" ");
    if (platform3 === 3 /* Windows */) {
      if (basename3 === "cmd" && commandQuoted && argQuoted) {
        commandLine = '"' + commandLine + '"';
      } else if ((basename3 === "powershell" || basename3 === "pwsh") && commandQuoted) {
        commandLine = "& " + commandLine;
      }
    }
    return commandLine;
  }
  _getQuotingOptions(shellBasename, shellOptions, platform3) {
    if (shellOptions && shellOptions.quoting) {
      return shellOptions.quoting;
    }
    return _TerminalTaskSystem._shellQuotes[shellBasename] || _TerminalTaskSystem._osShellQuotes[PlatformToString(platform3)];
  }
  _collectTaskVariables(variables, task) {
    if (task.command && task.command.name) {
      this._collectCommandVariables(variables, task.command, task);
    }
    this._collectMatcherVariables(variables, task.configurationProperties.problemMatchers);
    if (task.command.runtime === 3 /* CustomExecution */ && (CustomTask.is(task) || ContributedTask.is(task))) {
      let definition;
      if (CustomTask.is(task)) {
        definition = task._source.config.element;
      } else {
        definition = deepClone(task.defines);
        delete definition._key;
        delete definition.type;
      }
      this._collectDefinitionVariables(variables, definition);
    }
  }
  _collectDefinitionVariables(variables, definition) {
    if (isString(definition)) {
      this._collectVariables(variables, definition);
    } else if (Array.isArray(definition)) {
      definition.forEach((element) => this._collectDefinitionVariables(variables, element));
    } else if (isObject(definition)) {
      for (const key3 of Object.keys(definition)) {
        this._collectDefinitionVariables(variables, definition[key3]);
      }
    }
  }
  _collectCommandVariables(variables, command4, task) {
    if (command4.runtime === 3 /* CustomExecution */) {
      return;
    }
    if (command4.name === void 0) {
      throw new Error("Command name should never be undefined here.");
    }
    this._collectVariables(variables, command4.name);
    command4.args?.forEach((arg) => this._collectVariables(variables, arg));
    const scope = task._source.scope;
    if (scope !== 1 /* Global */) {
      variables.add("${workspaceFolder}");
    }
    if (command4.options) {
      const options3 = command4.options;
      if (options3.cwd) {
        this._collectVariables(variables, options3.cwd);
      }
      const optionsEnv = options3.env;
      if (optionsEnv) {
        Object.keys(optionsEnv).forEach((key3) => {
          const value2 = optionsEnv[key3];
          if (isString(value2)) {
            this._collectVariables(variables, value2);
          }
        });
      }
      if (options3.shell) {
        if (options3.shell.executable) {
          this._collectVariables(variables, options3.shell.executable);
        }
        options3.shell.args?.forEach((arg) => this._collectVariables(variables, arg));
      }
    }
  }
  _collectMatcherVariables(variables, values) {
    if (values === void 0 || values === null || values.length === 0) {
      return;
    }
    values.forEach((value2) => {
      let matcher;
      if (isString(value2)) {
        if (value2[0] === "$") {
          matcher = ProblemMatcherRegistry.get(value2.substring(1));
        } else {
          matcher = ProblemMatcherRegistry.get(value2);
        }
      } else {
        matcher = value2;
      }
      if (matcher && matcher.filePrefix) {
        if (isString(matcher.filePrefix)) {
          this._collectVariables(variables, matcher.filePrefix);
        } else {
          for (const fp of [...asArray(matcher.filePrefix.include || []), ...asArray(matcher.filePrefix.exclude || [])]) {
            this._collectVariables(variables, fp);
          }
        }
      }
    });
  }
  _collectVariables(variables, value2) {
    const string = isString(value2) ? value2 : value2.value;
    const r2 = /\$\{(.*?)\}/g;
    let matches2;
    do {
      matches2 = r2.exec(string);
      if (matches2) {
        variables.add(matches2[0]);
      }
    } while (matches2);
  }
  async _resolveCommandAndArgs(resolver, commandConfig) {
    let args2 = commandConfig.args ? commandConfig.args.slice() : [];
    args2 = await this._resolveVariables(resolver, args2);
    const command4 = await this._resolveVariable(resolver, commandConfig.name);
    return { command: command4, args: args2 };
  }
  async _resolveVariables(resolver, value2) {
    return Promise.all(value2.map((s) => this._resolveVariable(resolver, s)));
  }
  async _resolveMatchers(resolver, values) {
    if (values === void 0 || values === null || values.length === 0) {
      return [];
    }
    const result = [];
    for (const value2 of values) {
      let matcher;
      if (isString(value2)) {
        if (value2[0] === "$") {
          matcher = ProblemMatcherRegistry.get(value2.substring(1));
        } else {
          matcher = ProblemMatcherRegistry.get(value2);
        }
      } else {
        matcher = value2;
      }
      if (!matcher) {
        this._appendOutput(localize(19671, null));
        continue;
      }
      const taskSystemInfo = resolver.taskSystemInfo;
      const hasFilePrefix = matcher.filePrefix !== void 0;
      const hasUriProvider = taskSystemInfo !== void 0 && taskSystemInfo.uriProvider !== void 0;
      if (!hasFilePrefix && !hasUriProvider) {
        result.push(matcher);
      } else {
        const copy = deepClone(matcher);
        if (hasUriProvider && taskSystemInfo !== void 0) {
          copy.uriProvider = taskSystemInfo.uriProvider;
        }
        if (hasFilePrefix) {
          const filePrefix = copy.filePrefix;
          if (isString(filePrefix)) {
            copy.filePrefix = await this._resolveVariable(resolver, filePrefix);
          } else if (filePrefix !== void 0) {
            if (filePrefix.include) {
              filePrefix.include = Array.isArray(filePrefix.include) ? await Promise.all(filePrefix.include.map((x) => this._resolveVariable(resolver, x))) : await this._resolveVariable(resolver, filePrefix.include);
            }
            if (filePrefix.exclude) {
              filePrefix.exclude = Array.isArray(filePrefix.exclude) ? await Promise.all(filePrefix.exclude.map((x) => this._resolveVariable(resolver, x))) : await this._resolveVariable(resolver, filePrefix.exclude);
            }
          }
        }
        result.push(copy);
      }
    }
    return result;
  }
  async _resolveVariable(resolver, value2) {
    if (isString(value2)) {
      return resolver.resolve(value2);
    } else if (value2 !== void 0) {
      return {
        value: await resolver.resolve(value2.value),
        quoting: value2.quoting
      };
    } else {
      throw new Error("Should never try to resolve undefined.");
    }
  }
  async _resolveOptions(resolver, options3) {
    if (options3 === void 0 || options3 === null) {
      let cwd2;
      try {
        cwd2 = await this._resolveVariable(resolver, "${workspaceFolder}");
      } catch (e4) {
      }
      return { cwd: cwd2 };
    }
    const result = isString(options3.cwd) ? { cwd: await this._resolveVariable(resolver, options3.cwd) } : { cwd: await this._resolveVariable(resolver, "${workspaceFolder}") };
    if (options3.env) {
      result.env = /* @__PURE__ */ Object.create(null);
      for (const key3 of Object.keys(options3.env)) {
        const value2 = options3.env[key3];
        if (isString(value2)) {
          result.env[key3] = await this._resolveVariable(resolver, value2);
        } else {
          result.env[key3] = String(value2);
        }
      }
    }
    return result;
  }
  static {
    this.WellKnownCommands = {
      "ant": true,
      "cmake": true,
      "eslint": true,
      "gradle": true,
      "grunt": true,
      "gulp": true,
      "jake": true,
      "jenkins": true,
      "jshint": true,
      "make": true,
      "maven": true,
      "msbuild": true,
      "msc": true,
      "nmake": true,
      "npm": true,
      "rake": true,
      "tsc": true,
      "xbuild": true
    };
  }
  getSanitizedCommand(cmd) {
    let result = cmd.toLowerCase();
    const index2 = result.lastIndexOf(sep);
    if (index2 !== -1) {
      result = result.substring(index2 + 1);
    }
    if (_TerminalTaskSystem.WellKnownCommands[result]) {
      return result;
    }
    return "other";
  }
  async getTaskForTerminal(instanceId) {
    for (const key3 of Object.keys(this._activeTasks)) {
      const activeTask = this._activeTasks[key3];
      if (activeTask.terminal?.instanceId === instanceId) {
        return activeTask.task;
      }
    }
    const terminalData = this._terminals[instanceId.toString()];
    if (terminalData?.lastTask) {
      return await this._taskLookup(terminalData.lastTask);
    }
    return void 0;
  }
  _appendOutput(output) {
    const outputChannel = this._outputService.getChannel(this._outputChannelId);
    outputChannel?.append(output);
  }
};

function getWaitOnExitValue(presentationOptions, configurationProperties) {
  if (presentationOptions.close === void 0 || presentationOptions.close === false) {
    if (presentationOptions.reveal !== 3 /* Never */ || !configurationProperties.isBackground || presentationOptions.close === false) {
      if (presentationOptions.panel === 3 /* New */) {
        return taskShellIntegrationWaitOnExitSequence(localize(19658, null));
      } else if (presentationOptions.showReuseMessage) {
        return taskShellIntegrationWaitOnExitSequence(localize(19662, null));
      } else {
        return true;
      }
    }
  }
  return !presentationOptions.close;
}

function taskShellIntegrationWaitOnExitSequence(message) {
  return (exitCode) => {
    return `${VSCodeSequence("D" /* CommandFinished */, exitCode.toString())}${message}`;
  };
}

function getReconnectionData(terminal2) {
  return terminal2.shellLaunchConfig.attachPersistentProcess?.reconnectionProperties?.data;
}
export { getWaitOnExitValue, taskShellIntegrationWaitOnExitSequence, getReconnectionData, TaskTerminalType, VariableResolver2, TerminalTaskSystem };
