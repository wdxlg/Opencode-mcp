// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/tasks/common/tasks.ts
import { RawContextKey } from "./module-0089.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { isString } from "./module-0010.mjs";
import { basename2 } from "./module-0034.mjs";
import { TaskDefinitionRegistry } from "./module-1402.mjs";
import { deepClone } from "./module-0098.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";


// src/vs/workbench/contrib/tasks/common/tasks.ts
var USER_TASKS_GROUP_KEY = "settings";

var TASK_RUNNING_STATE = new RawContextKey("taskRunning", false, localize(19888, null));

var TASK_TERMINAL_ACTIVE = new RawContextKey("taskTerminalActive", false, localize(19890, null));

var TASKS_CATEGORY = localize2(19889, "Tasks");

var ShellQuoting = /* @__PURE__ */ ((ShellQuoting2) => {
  ShellQuoting2[ShellQuoting2["Escape"] = 1] = "Escape";
  ShellQuoting2[ShellQuoting2["Strong"] = 2] = "Strong";
  ShellQuoting2[ShellQuoting2["Weak"] = 3] = "Weak";
  return ShellQuoting2;
})(ShellQuoting || {});

var CUSTOMIZED_TASK_TYPE = "$customized";

((ShellQuoting2) => {
  function from(value2) {
    if (!value2) {
      return 2 /* Strong */;
    }
    switch (value2.toLowerCase()) {
      case "escape":
        return 1 /* Escape */;
      case "strong":
        return 2 /* Strong */;
      case "weak":
        return 3 /* Weak */;
      default:
        return 2 /* Strong */;
    }
  }
  ShellQuoting2.from = from;
})(ShellQuoting || (ShellQuoting = {}));

var CommandOptions;

((CommandOptions4) => {
  CommandOptions4.defaults = { cwd: "${workspaceFolder}" };
})(CommandOptions || (CommandOptions = {}));

var RevealKind = /* @__PURE__ */ ((RevealKind2) => {
  RevealKind2[RevealKind2["Always"] = 1] = "Always";
  RevealKind2[RevealKind2["Silent"] = 2] = "Silent";
  RevealKind2[RevealKind2["Never"] = 3] = "Never";
  return RevealKind2;
})(RevealKind || {});

((RevealKind2) => {
  function fromString(value2) {
    switch (value2.toLowerCase()) {
      case "always":
        return 1 /* Always */;
      case "silent":
        return 2 /* Silent */;
      case "never":
        return 3 /* Never */;
      default:
        return 1 /* Always */;
    }
  }
  RevealKind2.fromString = fromString;
})(RevealKind || (RevealKind = {}));

var RevealProblemKind = /* @__PURE__ */ ((RevealProblemKind2) => {
  RevealProblemKind2[RevealProblemKind2["Never"] = 1] = "Never";
  RevealProblemKind2[RevealProblemKind2["OnProblem"] = 2] = "OnProblem";
  RevealProblemKind2[RevealProblemKind2["Always"] = 3] = "Always";
  return RevealProblemKind2;
})(RevealProblemKind || {});

((RevealProblemKind2) => {
  function fromString(value2) {
    switch (value2.toLowerCase()) {
      case "always":
        return 3 /* Always */;
      case "never":
        return 1 /* Never */;
      case "onproblem":
        return 2 /* OnProblem */;
      default:
        return 2 /* OnProblem */;
    }
  }
  RevealProblemKind2.fromString = fromString;
})(RevealProblemKind || (RevealProblemKind = {}));

var PanelKind = /* @__PURE__ */ ((PanelKind2) => {
  PanelKind2[PanelKind2["Shared"] = 1] = "Shared";
  PanelKind2[PanelKind2["Dedicated"] = 2] = "Dedicated";
  PanelKind2[PanelKind2["New"] = 3] = "New";
  return PanelKind2;
})(PanelKind || {});

((PanelKind2) => {
  function fromString(value2) {
    switch (value2.toLowerCase()) {
      case "shared":
        return 1 /* Shared */;
      case "dedicated":
        return 2 /* Dedicated */;
      case "new":
        return 3 /* New */;
      default:
        return 1 /* Shared */;
    }
  }
  PanelKind2.fromString = fromString;
})(PanelKind || (PanelKind = {}));

var PresentationOptions;

((PresentationOptions2) => {
  PresentationOptions2.defaults = {
    echo: true,
    reveal: 1 /* Always */,
    revealProblems: 1 /* Never */,
    focus: false,
    panel: 1 /* Shared */,
    showReuseMessage: true,
    clear: false,
    preserveTerminalName: false
  };
})(PresentationOptions || (PresentationOptions = {}));

var RuntimeType = /* @__PURE__ */ ((RuntimeType2) => {
  RuntimeType2[RuntimeType2["Shell"] = 1] = "Shell";
  RuntimeType2[RuntimeType2["Process"] = 2] = "Process";
  RuntimeType2[RuntimeType2["CustomExecution"] = 3] = "CustomExecution";
  return RuntimeType2;
})(RuntimeType || {});

((RuntimeType2) => {
  function fromString(value2) {
    switch (value2.toLowerCase()) {
      case "shell":
        return 1 /* Shell */;
      case "process":
        return 2 /* Process */;
      case "customExecution":
        return 3 /* CustomExecution */;
      default:
        return 2 /* Process */;
    }
  }
  RuntimeType2.fromString = fromString;
  function toString(value2) {
    switch (value2) {
      case 1 /* Shell */:
        return "shell";
      case 2 /* Process */:
        return "process";
      case 3 /* CustomExecution */:
        return "customExecution";
      default:
        return "process";
    }
  }
  RuntimeType2.toString = toString;
})(RuntimeType || (RuntimeType = {}));

var CommandString;

((CommandString4) => {
  function value2(value3) {
    if (isString(value3)) {
      return value3;
    } else {
      return value3.value;
    }
  }
  CommandString4.value = value2;
})(CommandString || (CommandString = {}));

var TaskGroup2;

((TaskGroup4) => {
  TaskGroup4.Clean = { _id: "clean", isDefault: false };
  TaskGroup4.Build = { _id: "build", isDefault: false };
  TaskGroup4.Rebuild = { _id: "rebuild", isDefault: false };
  TaskGroup4.Test = { _id: "test", isDefault: false };
  function is(value2) {
    return value2 === TaskGroup4.Clean._id || value2 === TaskGroup4.Build._id || value2 === TaskGroup4.Rebuild._id || value2 === TaskGroup4.Test._id;
  }
  TaskGroup4.is = is;
  function from(value2) {
    if (value2 === void 0) {
      return void 0;
    } else if (isString(value2)) {
      if (is(value2)) {
        return { _id: value2, isDefault: false };
      }
      return void 0;
    } else {
      return value2;
    }
  }
  TaskGroup4.from = from;
})(TaskGroup2 || (TaskGroup2 = {}));

var TaskSourceKind;

((TaskSourceKind2) => {
  TaskSourceKind2.Workspace = "workspace";
  TaskSourceKind2.Extension = "extension";
  TaskSourceKind2.InMemory = "inMemory";
  TaskSourceKind2.WorkspaceFile = "workspaceFile";
  TaskSourceKind2.User = "user";
  function toConfigurationTarget(kind) {
    switch (kind) {
      case TaskSourceKind2.User:
        return 2 /* USER */;
      case TaskSourceKind2.WorkspaceFile:
        return 5 /* WORKSPACE */;
      default:
        return 6 /* WORKSPACE_FOLDER */;
    }
  }
  TaskSourceKind2.toConfigurationTarget = toConfigurationTarget;
})(TaskSourceKind || (TaskSourceKind = {}));

var RunOptions;

((RunOptions3) => {
  RunOptions3.defaults = { reevaluateOnRerun: true, runOn: 1 /* default */, instanceLimit: 1, instancePolicy: "prompt" /* prompt */ };
})(RunOptions || (RunOptions = {}));

var CommonTask = class {
  constructor(id2, label3, type, runOptions2, configurationProperties, source) {
    /**
     * The cached label.
     */
    this._label = "";
    this._id = id2;
    if (label3) {
      this._label = label3;
    }
    if (type) {
      this.type = type;
    }
    this.runOptions = runOptions2;
    this.configurationProperties = configurationProperties;
    this._source = source;
  }
  getDefinition(useSource) {
    return void 0;
  }
  getMapKey() {
    return this._id;
  }
  getKey() {
    return void 0;
  }
  getCommonTaskId() {
    const key3 = { folder: this.getFolderId(), id: this._id };
    return JSON.stringify(key3);
  }
  clone() {
    return this.fromObject(Object.assign({}, this));
  }
  getWorkspaceFolder() {
    return void 0;
  }
  getWorkspaceFileName() {
    return void 0;
  }
  getTelemetryKind() {
    return "unknown";
  }
  matches(key3, compareId = false) {
    if (key3 === void 0) {
      return false;
    }
    if (isString(key3)) {
      return key3 === this._label || key3 === this.configurationProperties.identifier || compareId && key3 === this._id;
    }
    const identifier2 = this.getDefinition(true);
    return identifier2 !== void 0 && identifier2._key === key3._key;
  }
  getQualifiedLabel() {
    const workspaceFolder = this.getWorkspaceFolder();
    if (workspaceFolder) {
      return `${this._label} (${workspaceFolder.name})`;
    } else {
      return this._label;
    }
  }
  getTaskExecution() {
    const result = {
      id: this._id,
      task: this
    };
    return result;
  }
  addTaskLoadMessages(messages) {
    if (this._taskLoadMessages === void 0) {
      this._taskLoadMessages = [];
    }
    if (messages) {
      this._taskLoadMessages = this._taskLoadMessages.concat(messages);
    }
  }
  get taskLoadMessages() {
    return this._taskLoadMessages;
  }
};

var CustomTask = class _CustomTask extends CommonTask {
  constructor(id2, source, label3, type, command4, hasDefinedMatchers, runOptions2, configurationProperties) {
    super(id2, label3, void 0, runOptions2, configurationProperties, source);
    /**
     * The command configuration
     */
    this.command = {};
    this._source = source;
    this.hasDefinedMatchers = hasDefinedMatchers;
    if (command4) {
      this.command = command4;
    }
  }
  clone() {
    return new _CustomTask(this._id, this._source, this._label, this.type, this.command, this.hasDefinedMatchers, this.runOptions, this.configurationProperties);
  }
  customizes() {
    if (this._source && this._source.customizes) {
      return this._source.customizes;
    }
    return void 0;
  }
  getDefinition(useSource = false) {
    if (useSource && this._source.customizes !== void 0) {
      return this._source.customizes;
    } else {
      let type;
      const commandRuntime = this.command ? this.command.runtime : void 0;
      switch (commandRuntime) {
        case 1 /* Shell */:
          type = "shell";
          break;
        case 2 /* Process */:
          type = "process";
          break;
        case 3 /* CustomExecution */:
          type = "customExecution";
          break;
        case void 0:
          type = "$composite";
          break;
        default:
          throw new Error("Unexpected task runtime");
      }
      const result = {
        type,
        _key: this._id,
        id: this._id
      };
      return result;
    }
  }
  static is(value2) {
    return value2 instanceof _CustomTask;
  }
  getMapKey() {
    const workspaceFolder = this._source.config.workspaceFolder;
    return workspaceFolder ? `${workspaceFolder.uri.toString()}|${this._id}|${this.instance}` : `${this._id}|${this.instance}`;
  }
  getFolderId() {
    return this._source.kind === TaskSourceKind.User ? USER_TASKS_GROUP_KEY : this._source.config.workspaceFolder?.uri.toString();
  }
  getCommonTaskId() {
    return this._source.customizes ? super.getCommonTaskId() : this.getKey() ?? super.getCommonTaskId();
  }
  /**
   * @returns A key representing the task
   */
  getKey() {
    const workspaceFolder = this.getFolderId();
    if (!workspaceFolder) {
      return void 0;
    }
    let id2 = this.configurationProperties.identifier;
    if (this._source.kind !== TaskSourceKind.Workspace) {
      id2 += this._source.kind;
    }
    const key3 = { type: CUSTOMIZED_TASK_TYPE, folder: workspaceFolder, id: id2 };
    return JSON.stringify(key3);
  }
  getWorkspaceFolder() {
    return this._source.config.workspaceFolder;
  }
  getWorkspaceFileName() {
    return this._source.config.workspace && this._source.config.workspace.configuration ? basename2(this._source.config.workspace.configuration) : void 0;
  }
  getTelemetryKind() {
    if (this._source.customizes) {
      return "workspace>extension";
    } else {
      return "workspace";
    }
  }
  fromObject(object2) {
    const obj = object2;
    return new _CustomTask(obj._id, obj._source, obj._label, obj.type, obj.command, obj.hasDefinedMatchers, obj.runOptions, obj.configurationProperties);
  }
};

var ConfiguringTask = class _ConfiguringTask extends CommonTask {
  constructor(id2, source, label3, type, configures, runOptions2, configurationProperties) {
    super(id2, label3, type, runOptions2, configurationProperties, source);
    this._source = source;
    this.configures = configures;
  }
  static is(value2) {
    return value2 instanceof _ConfiguringTask;
  }
  fromObject(object2) {
    return object2;
  }
  getDefinition() {
    return this.configures;
  }
  getWorkspaceFileName() {
    return this._source.config.workspace && this._source.config.workspace.configuration ? basename2(this._source.config.workspace.configuration) : void 0;
  }
  getWorkspaceFolder() {
    return this._source.config.workspaceFolder;
  }
  getFolderId() {
    return this._source.kind === TaskSourceKind.User ? USER_TASKS_GROUP_KEY : this._source.config.workspaceFolder?.uri.toString();
  }
  getKey() {
    const workspaceFolder = this.getFolderId();
    if (!workspaceFolder) {
      return void 0;
    }
    let id2 = this.configurationProperties.identifier;
    if (this._source.kind !== TaskSourceKind.Workspace) {
      id2 += this._source.kind;
    }
    const key3 = { type: CUSTOMIZED_TASK_TYPE, folder: workspaceFolder, id: id2 };
    return JSON.stringify(key3);
  }
};

var ContributedTask = class _ContributedTask extends CommonTask {
  constructor(id2, source, label3, type, defines, command4, hasDefinedMatchers, runOptions2, configurationProperties) {
    super(id2, label3, type, runOptions2, configurationProperties, source);
    this.defines = defines;
    this.hasDefinedMatchers = hasDefinedMatchers;
    this.command = command4;
    this.icon = configurationProperties.icon;
    this.hide = configurationProperties.hide;
  }
  clone() {
    return new _ContributedTask(this._id, this._source, this._label, this.type, this.defines, this.command, this.hasDefinedMatchers, this.runOptions, this.configurationProperties);
  }
  getDefinition() {
    return this.defines;
  }
  static is(value2) {
    return value2 instanceof _ContributedTask;
  }
  getMapKey() {
    const workspaceFolder = this._source.workspaceFolder;
    return workspaceFolder ? `${this._source.scope.toString()}|${workspaceFolder.uri.toString()}|${this._id}|${this.instance}` : `${this._source.scope.toString()}|${this._id}|${this.instance}`;
  }
  getFolderId() {
    if (this._source.scope === 3 /* Folder */ && this._source.workspaceFolder) {
      return this._source.workspaceFolder.uri.toString();
    }
    return void 0;
  }
  getKey() {
    const key3 = { type: "contributed", scope: this._source.scope, id: this._id };
    key3.folder = this.getFolderId();
    return JSON.stringify(key3);
  }
  getWorkspaceFolder() {
    return this._source.workspaceFolder;
  }
  getTelemetryKind() {
    return "extension";
  }
  fromObject(object2) {
    const obj = object2;
    return new _ContributedTask(obj._id, obj._source, obj._label, obj.type, obj.defines, obj.command, obj.hasDefinedMatchers, obj.runOptions, obj.configurationProperties);
  }
};

var InMemoryTask = class _InMemoryTask extends CommonTask {
  constructor(id2, source, label3, type, runOptions2, configurationProperties) {
    super(id2, label3, type, runOptions2, configurationProperties, source);
    this._source = source;
  }
  clone() {
    return new _InMemoryTask(this._id, this._source, this._label, this.type, this.runOptions, this.configurationProperties);
  }
  static is(value2) {
    return value2 instanceof _InMemoryTask;
  }
  getTelemetryKind() {
    return "composite";
  }
  getMapKey() {
    return `${this._id}|${this.instance}`;
  }
  getFolderId() {
    return void 0;
  }
  fromObject(object2) {
    const obj = object2;
    return new _InMemoryTask(obj._id, obj._source, obj._label, obj.type, obj.runOptions, obj.configurationProperties);
  }
};

var ExecutionEngine = /* @__PURE__ */ ((ExecutionEngine3) => {
  ExecutionEngine3[ExecutionEngine3["Process"] = 1] = "Process";
  ExecutionEngine3[ExecutionEngine3["Terminal"] = 2] = "Terminal";
  return ExecutionEngine3;
})(ExecutionEngine || {});

((ExecutionEngine3) => {
  ExecutionEngine3._default = 2 /* Terminal */;
})(ExecutionEngine || (ExecutionEngine = {}));

var TaskSorter = class {
  constructor(workspaceFolders) {
    this._order = /* @__PURE__ */ new Map();
    for (let i2 = 0; i2 < workspaceFolders.length; i2++) {
      this._order.set(workspaceFolders[i2].uri.toString(), i2);
    }
  }
  compare(a, b) {
    const aw = a.getWorkspaceFolder();
    const bw = b.getWorkspaceFolder();
    if (aw && bw) {
      let ai = this._order.get(aw.uri.toString());
      ai = ai === void 0 ? 0 : ai + 1;
      let bi = this._order.get(bw.uri.toString());
      bi = bi === void 0 ? 0 : bi + 1;
      if (ai === bi) {
        return a._label.localeCompare(b._label);
      } else {
        return ai - bi;
      }
    } else if (!aw && bw) {
      return -1;
    } else if (aw && !bw) {
      return 1;
    } else {
      return 0;
    }
  }
};

var TaskEvent;

((TaskEvent2) => {
  function common(task) {
    return {
      taskId: task._id,
      taskName: task.configurationProperties.name,
      runType: task.configurationProperties.isBackground ? "background" /* Background */ : "singleRun" /* SingleRun */,
      group: task.configurationProperties.group,
      __task: task
    };
  }
  function start(task, terminalId, resolvedVariables) {
    return {
      ...common(task),
      kind: "start" /* Start */,
      terminalId,
      resolvedVariables
    };
  }
  TaskEvent2.start = start;
  function processStarted(task, terminalId, processId) {
    return {
      ...common(task),
      kind: "processStarted" /* ProcessStarted */,
      terminalId,
      processId
    };
  }
  TaskEvent2.processStarted = processStarted;
  function processEnded(task, terminalId, exitCode, durationMs) {
    return {
      ...common(task),
      kind: "processEnded" /* ProcessEnded */,
      terminalId,
      exitCode,
      durationMs
    };
  }
  TaskEvent2.processEnded = processEnded;
  function inactive(task, terminalId, durationMs) {
    return {
      ...common(task),
      kind: "inactive" /* Inactive */,
      terminalId,
      durationMs
    };
  }
  TaskEvent2.inactive = inactive;
  function terminated(task, terminalId, exitReason) {
    return {
      ...common(task),
      kind: "terminated" /* Terminated */,
      exitReason,
      terminalId
    };
  }
  TaskEvent2.terminated = terminated;
  function general(kind, task, terminalId) {
    return {
      ...common(task),
      kind,
      terminalId
    };
  }
  TaskEvent2.general = general;
  function problemMatcherEnded(task, hasErrors, terminalId) {
    return {
      ...common(task),
      kind: "problemMatcherEnded" /* ProblemMatcherEnded */,
      hasErrors
    };
  }
  TaskEvent2.problemMatcherEnded = problemMatcherEnded;
  function changed() {
    return { kind: "changed" /* Changed */ };
  }
  TaskEvent2.changed = changed;
})(TaskEvent || (TaskEvent = {}));

var KeyedTaskIdentifier;

((KeyedTaskIdentifier4) => {
  function sortedStringify(literal) {
    const keys = Object.keys(literal).sort();
    let result = "";
    for (const key3 of keys) {
      let stringified = literal[key3];
      if (stringified instanceof Object) {
        stringified = sortedStringify(stringified);
      } else if (typeof stringified === "string") {
        stringified = stringified.replace(/,/g, ",,");
      }
      result += key3 + "," + stringified + ",";
    }
    return result;
  }
  function create2(value2) {
    const resultKey = sortedStringify(value2);
    const result = { _key: resultKey, type: value2.taskType };
    Object.assign(result, value2);
    return result;
  }
  KeyedTaskIdentifier4.create = create2;
})(KeyedTaskIdentifier || (KeyedTaskIdentifier = {}));

var TaskDefinition;

((TaskDefinition2) => {
  function createTaskIdentifier(external, reporter) {
    const definition = TaskDefinitionRegistry.get(external.type);
    if (definition === void 0) {
      const copy = deepClone(external);
      delete copy._key;
      return KeyedTaskIdentifier.create(copy);
    }
    const literal = /* @__PURE__ */ Object.create(null);
    literal.type = definition.taskType;
    const required = /* @__PURE__ */ new Set();
    definition.required.forEach((element) => required.add(element));
    const properties = definition.properties;
    for (const property of Object.keys(properties)) {
      const value2 = external[property];
      if (value2 !== void 0 && value2 !== null) {
        literal[property] = value2;
      } else if (required.has(property)) {
        const schema10 = properties[property];
        if (schema10.default !== void 0) {
          literal[property] = deepClone(schema10.default);
        } else {
          switch (schema10.type) {
            case "boolean":
              literal[property] = false;
              break;
            case "number":
            case "integer":
              literal[property] = 0;
              break;
            case "string":
              literal[property] = "";
              break;
            default:
              reporter.error(localize(
                19887,
                null,
                JSON.stringify(external, void 0, 0),
                property
              ));
              return void 0;
          }
        }
      }
    }
    return KeyedTaskIdentifier.create(literal);
  }
  TaskDefinition2.createTaskIdentifier = createTaskIdentifier;
})(TaskDefinition || (TaskDefinition = {}));

var rerunTaskIcon = registerIcon("rerun-task", Codicon.refresh, localize(19886, null));

var RerunForActiveTerminalCommandId = "workbench.action.tasks.rerunForActiveTerminal";

var RerunAllRunningTasksCommandId = "workbench.action.tasks.rerunAllRunningTasks";
export { USER_TASKS_GROUP_KEY, TASK_RUNNING_STATE, TASK_TERMINAL_ACTIVE, TASKS_CATEGORY, ShellQuoting, CUSTOMIZED_TASK_TYPE, CommandOptions, RevealKind, RevealProblemKind, PanelKind, PresentationOptions, RuntimeType, CommandString, TaskGroup2, TaskSourceKind, RunOptions, CommonTask, CustomTask, ConfiguringTask, ContributedTask, InMemoryTask, ExecutionEngine, TaskSorter, TaskEvent, KeyedTaskIdentifier, TaskDefinition, rerunTaskIcon, RerunForActiveTerminalCommandId, RerunAllRunningTasksCommandId };
