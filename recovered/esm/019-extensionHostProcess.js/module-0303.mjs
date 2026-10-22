// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/contrib/tasks/common/tasks.ts
import { RawContextKey } from "./module-0049.mjs";
import { localize, localize2 } from "./module-0013.mjs";
import { isString } from "./module-0009.mjs";
import { TaskDefinitionRegistry } from "./module-0302.mjs";
import { deepClone } from "./module-0042.mjs";
import { registerIcon } from "./module-0208.mjs";
import { Codicon } from "./module-0083.mjs";


// src/vs/workbench/contrib/tasks/common/tasks.ts
var USER_TASKS_GROUP_KEY = "settings";

var TASK_RUNNING_STATE = new RawContextKey("taskRunning", false, localize(19888, null));

var TASK_TERMINAL_ACTIVE = new RawContextKey("taskTerminalActive", false, localize(19890, null));

var TASKS_CATEGORY = localize2(19889, "Tasks");

var ShellQuoting2 = /* @__PURE__ */ ((ShellQuoting3) => {
  ShellQuoting3[ShellQuoting3["Escape"] = 1] = "Escape";
  ShellQuoting3[ShellQuoting3["Strong"] = 2] = "Strong";
  ShellQuoting3[ShellQuoting3["Weak"] = 3] = "Weak";
  return ShellQuoting3;
})(ShellQuoting2 || {});

((ShellQuoting3) => {
  function from(value) {
    if (!value) {
      return 2 /* Strong */;
    }
    switch (value.toLowerCase()) {
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
  ShellQuoting3.from = from;
})(ShellQuoting2 || (ShellQuoting2 = {}));

var CommandOptions;

((CommandOptions3) => {
  CommandOptions3.defaults = { cwd: "${workspaceFolder}" };
})(CommandOptions || (CommandOptions = {}));

var RevealKind = /* @__PURE__ */ ((RevealKind2) => {
  RevealKind2[RevealKind2["Always"] = 1] = "Always";
  RevealKind2[RevealKind2["Silent"] = 2] = "Silent";
  RevealKind2[RevealKind2["Never"] = 3] = "Never";
  return RevealKind2;
})(RevealKind || {});

((RevealKind2) => {
  function fromString(value) {
    switch (value.toLowerCase()) {
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
  function fromString(value) {
    switch (value.toLowerCase()) {
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
  function fromString(value) {
    switch (value.toLowerCase()) {
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
  function fromString(value) {
    switch (value.toLowerCase()) {
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
  function toString(value) {
    switch (value) {
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

((CommandString2) => {
  function value(value2) {
    if (isString(value2)) {
      return value2;
    } else {
      return value2.value;
    }
  }
  CommandString2.value = value;
})(CommandString || (CommandString = {}));

var TaskGroup2;

((TaskGroup3) => {
  TaskGroup3.Clean = { _id: "clean", isDefault: false };
  TaskGroup3.Build = { _id: "build", isDefault: false };
  TaskGroup3.Rebuild = { _id: "rebuild", isDefault: false };
  TaskGroup3.Test = { _id: "test", isDefault: false };
  function is(value) {
    return value === TaskGroup3.Clean._id || value === TaskGroup3.Build._id || value === TaskGroup3.Rebuild._id || value === TaskGroup3.Test._id;
  }
  TaskGroup3.is = is;
  function from(value) {
    if (value === void 0) {
      return void 0;
    } else if (isString(value)) {
      if (is(value)) {
        return { _id: value, isDefault: false };
      }
      return void 0;
    } else {
      return value;
    }
  }
  TaskGroup3.from = from;
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

((RunOptions2) => {
  RunOptions2.defaults = { reevaluateOnRerun: true, runOn: 1 /* default */, instanceLimit: 1, instancePolicy: "prompt" /* prompt */ };
})(RunOptions || (RunOptions = {}));

var ExecutionEngine = /* @__PURE__ */ ((ExecutionEngine2) => {
  ExecutionEngine2[ExecutionEngine2["Process"] = 1] = "Process";
  ExecutionEngine2[ExecutionEngine2["Terminal"] = 2] = "Terminal";
  return ExecutionEngine2;
})(ExecutionEngine || {});

((ExecutionEngine2) => {
  ExecutionEngine2._default = 2 /* Terminal */;
})(ExecutionEngine || (ExecutionEngine = {}));

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

((KeyedTaskIdentifier2) => {
  function sortedStringify(literal) {
    const keys = Object.keys(literal).sort();
    let result = "";
    for (const key of keys) {
      let stringified = literal[key];
      if (stringified instanceof Object) {
        stringified = sortedStringify(stringified);
      } else if (typeof stringified === "string") {
        stringified = stringified.replace(/,/g, ",,");
      }
      result += key + "," + stringified + ",";
    }
    return result;
  }
  function create(value) {
    const resultKey = sortedStringify(value);
    const result = { _key: resultKey, type: value.taskType };
    Object.assign(result, value);
    return result;
  }
  KeyedTaskIdentifier2.create = create;
})(KeyedTaskIdentifier || (KeyedTaskIdentifier = {}));

var TaskDefinition;

((TaskDefinition2) => {
  function createTaskIdentifier(external, reporter) {
    const definition = TaskDefinitionRegistry.get(external.type);
    if (definition === void 0) {
      const copy2 = deepClone(external);
      delete copy2._key;
      return KeyedTaskIdentifier.create(copy2);
    }
    const literal = /* @__PURE__ */ Object.create(null);
    literal.type = definition.taskType;
    const required = /* @__PURE__ */ new Set();
    definition.required.forEach((element) => required.add(element));
    const properties = definition.properties;
    for (const property of Object.keys(properties)) {
      const value = external[property];
      if (value !== void 0 && value !== null) {
        literal[property] = value;
      } else if (required.has(property)) {
        const schema2 = properties[property];
        if (schema2.default !== void 0) {
          literal[property] = deepClone(schema2.default);
        } else {
          switch (schema2.type) {
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
export { USER_TASKS_GROUP_KEY, TASK_RUNNING_STATE, TASK_TERMINAL_ACTIVE, TASKS_CATEGORY, ShellQuoting2, CommandOptions, RevealKind, RevealProblemKind, PanelKind, PresentationOptions, RuntimeType, CommandString, TaskGroup2, TaskSourceKind, RunOptions, ExecutionEngine, TaskEvent, KeyedTaskIdentifier, TaskDefinition, rerunTaskIcon };
