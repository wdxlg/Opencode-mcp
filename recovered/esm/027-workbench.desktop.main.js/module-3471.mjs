// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/tasks/common/taskConfiguration.ts
import { isBoolean, isString, isStringArray, isUndefined } from "./module-0010.mjs";
import { deepClone } from "./module-0098.mjs";
import { localize } from "./module-0001.mjs";
import { CUSTOMIZED_TASK_TYPE, CommandString, ConfiguringTask, CustomTask, PanelKind, RevealKind, RevealProblemKind, RuntimeType, ShellQuoting, TaskDefinition, TaskGroup2, TaskSourceKind, USER_TASKS_GROUP_KEY } from "./module-1403.mjs";
import { ProblemMatcherParser, ProblemMatcherRegistry, isNamedProblemMatcher } from "./module-3464.mjs";
import { TaskDefinitionRegistry } from "./module-1402.mjs";
import { ProcessExecutionSupportedContext, ShellExecutionSupportedContext } from "./module-1404.mjs";
import { generateUuid } from "./module-0190.mjs";


// src/vs/workbench/contrib/tasks/common/taskConfiguration.ts
var ITaskIdentifier2;

((ITaskIdentifier4) => {
  function is(value2) {
    const candidate = value2;
    return candidate !== void 0 && isString(value2.type);
  }
  ITaskIdentifier4.is = is;
})(ITaskIdentifier2 || (ITaskIdentifier2 = {}));

var CommandString2;

((CommandString4) => {
  function value2(value3) {
    if (isString(value3)) {
      return value3;
    } else if (isStringArray(value3)) {
      return value3.join(" ");
    } else {
      if (isString(value3.value)) {
        return value3.value;
      } else {
        return value3.value.join(" ");
      }
    }
  }
  CommandString4.value = value2;
})(CommandString2 || (CommandString2 = {}));

var EMPTY_ARRAY = [];

Object.freeze(EMPTY_ARRAY);

function assignProperty(target, source, key3) {
  const sourceAtKey = source[key3];
  if (sourceAtKey !== void 0) {
    target[key3] = sourceAtKey;
  }
}

function fillProperty(target, source, key3) {
  const sourceAtKey = source[key3];
  if (target[key3] === void 0 && sourceAtKey !== void 0) {
    target[key3] = sourceAtKey;
  }
}

function _isEmpty(value2, properties, allowEmptyArray = false) {
  if (value2 === void 0 || value2 === null || properties === void 0) {
    return true;
  }
  for (const meta of properties) {
    const property = value2[meta.property];
    if (property !== void 0 && property !== null) {
      if (meta.type !== void 0 && !meta.type.isEmpty(property)) {
        return false;
      } else if (!Array.isArray(property) || property.length > 0 || allowEmptyArray) {
        return false;
      }
    }
  }
  return true;
}

function _assignProperties(target, source, properties) {
  if (!source || _isEmpty(source, properties)) {
    return target;
  }
  if (!target || _isEmpty(target, properties)) {
    return source;
  }
  for (const meta of properties) {
    const property = meta.property;
    let value2;
    if (meta.type !== void 0) {
      value2 = meta.type.assignProperties(target[property], source[property]);
    } else {
      value2 = source[property];
    }
    if (value2 !== void 0 && value2 !== null) {
      target[property] = value2;
    }
  }
  return target;
}

function _fillProperties(target, source, properties, allowEmptyArray = false) {
  if (!source || _isEmpty(source, properties)) {
    return target;
  }
  if (!target || _isEmpty(target, properties, allowEmptyArray)) {
    return source;
  }
  for (const meta of properties) {
    const property = meta.property;
    let value2;
    if (meta.type) {
      value2 = meta.type.fillProperties(target[property], source[property]);
    } else if (target[property] === void 0) {
      value2 = source[property];
    }
    if (value2 !== void 0 && value2 !== null) {
      target[property] = value2;
    }
  }
  return target;
}

function _fillDefaults(target, defaults, properties, context2) {
  if (target && Object.isFrozen(target)) {
    return target;
  }
  if (target === void 0 || target === null || defaults === void 0 || defaults === null) {
    if (defaults !== void 0 && defaults !== null) {
      return deepClone(defaults);
    } else {
      return void 0;
    }
  }
  for (const meta of properties) {
    const property = meta.property;
    if (target[property] !== void 0) {
      continue;
    }
    let value2;
    if (meta.type) {
      value2 = meta.type.fillDefaults(target[property], context2);
    } else {
      value2 = defaults[property];
    }
    if (value2 !== void 0 && value2 !== null) {
      target[property] = value2;
    }
  }
  return target;
}

function _freeze(target, properties) {
  if (target === void 0 || target === null) {
    return void 0;
  }
  if (Object.isFrozen(target)) {
    return target;
  }
  for (const meta of properties) {
    if (meta.type) {
      const value2 = target[meta.property];
      if (value2) {
        meta.type.freeze(value2);
      }
    }
  }
  Object.freeze(target);
  return target;
}

var RunOnOptions2;

((RunOnOptions3) => {
  function fromString(value2) {
    if (!value2) {
      return 1 /* default */;
    }
    switch (value2.toLowerCase()) {
      case "folderopen":
        return 2 /* folderOpen */;
      case "worktreecreated":
        return 3 /* worktreeCreated */;
      case "default":
      default:
        return 1 /* default */;
    }
  }
  RunOnOptions3.fromString = fromString;
})(RunOnOptions2 || (RunOnOptions2 = {}));

var RunOptions2;

((RunOptions3) => {
  const properties = [{ property: "reevaluateOnRerun" }, { property: "runOn" }, { property: "instanceLimit" }, { property: "instancePolicy" }];
  function fromConfiguration(value2) {
    return {
      reevaluateOnRerun: value2 ? value2.reevaluateOnRerun : true,
      runOn: value2 ? RunOnOptions2.fromString(value2.runOn) : 1 /* default */,
      instanceLimit: value2?.instanceLimit ? Math.max(value2.instanceLimit, 1) : 1,
      instancePolicy: value2 ? InstancePolicy2.fromString(value2.instancePolicy) : "prompt" /* prompt */
    };
  }
  RunOptions3.fromConfiguration = fromConfiguration;
  function assignProperties(target, source) {
    return _assignProperties(target, source, properties);
  }
  RunOptions3.assignProperties = assignProperties;
  function fillProperties(target, source) {
    return _fillProperties(target, source, properties);
  }
  RunOptions3.fillProperties = fillProperties;
})(RunOptions2 || (RunOptions2 = {}));

var InstancePolicy2;

((InstancePolicy3) => {
  function fromString(value2) {
    if (!value2) {
      return "prompt" /* prompt */;
    }
    switch (value2.toLowerCase()) {
      case "terminatenewest":
        return "terminateNewest" /* terminateNewest */;
      case "terminateoldest":
        return "terminateOldest" /* terminateOldest */;
      case "warn":
        return "warn" /* warn */;
      case "silent":
        return "silent" /* silent */;
      case "prompt":
      default:
        return "prompt" /* prompt */;
    }
  }
  InstancePolicy3.fromString = fromString;
})(InstancePolicy2 || (InstancePolicy2 = {}));

var ShellConfiguration;

((ShellConfiguration2) => {
  const properties = [{ property: "executable" }, { property: "args" }, { property: "quoting" }];
  function is(value2) {
    const candidate = value2;
    return candidate && (isString(candidate.executable) || isStringArray(candidate.args));
  }
  ShellConfiguration2.is = is;
  function from(config, context2) {
    if (!is(config)) {
      return void 0;
    }
    const result = {};
    if (config.executable !== void 0) {
      result.executable = config.executable;
    }
    if (config.args !== void 0) {
      result.args = config.args.slice();
    }
    if (config.quoting !== void 0) {
      result.quoting = deepClone(config.quoting);
    }
    return result;
  }
  ShellConfiguration2.from = from;
  function isEmpty(value2) {
    return _isEmpty(value2, properties, true);
  }
  ShellConfiguration2.isEmpty = isEmpty;
  function assignProperties(target, source) {
    return _assignProperties(target, source, properties);
  }
  ShellConfiguration2.assignProperties = assignProperties;
  function fillProperties(target, source) {
    return _fillProperties(target, source, properties, true);
  }
  ShellConfiguration2.fillProperties = fillProperties;
  function fillDefaults(value2, context2) {
    return value2;
  }
  ShellConfiguration2.fillDefaults = fillDefaults;
  function freeze3(value2) {
    if (!value2) {
      return void 0;
    }
    return Object.freeze(value2);
  }
  ShellConfiguration2.freeze = freeze3;
})(ShellConfiguration || (ShellConfiguration = {}));

var CommandOptions2;

((CommandOptions4) => {
  const properties = [{ property: "cwd" }, { property: "env" }, { property: "shell", type: ShellConfiguration }];
  const defaults = { cwd: "${workspaceFolder}" };
  function from(options3, context2) {
    const result = {};
    if (options3.cwd !== void 0) {
      if (isString(options3.cwd)) {
        result.cwd = options3.cwd;
      } else {
        context2.taskLoadIssues.push(localize(19866, null, options3.cwd));
      }
    }
    if (options3.env !== void 0) {
      result.env = deepClone(options3.env);
    }
    result.shell = ShellConfiguration.from(options3.shell, context2);
    return isEmpty(result) ? void 0 : result;
  }
  CommandOptions4.from = from;
  function isEmpty(value2) {
    return _isEmpty(value2, properties);
  }
  CommandOptions4.isEmpty = isEmpty;
  function assignProperties(target, source) {
    if (source === void 0 || isEmpty(source)) {
      return target;
    }
    if (target === void 0 || isEmpty(target)) {
      return source;
    }
    assignProperty(target, source, "cwd");
    if (target.env === void 0) {
      target.env = source.env;
    } else if (source.env !== void 0) {
      const env2 = /* @__PURE__ */ Object.create(null);
      if (target.env !== void 0) {
        Object.keys(target.env).forEach((key3) => env2[key3] = target.env[key3]);
      }
      if (source.env !== void 0) {
        Object.keys(source.env).forEach((key3) => env2[key3] = source.env[key3]);
      }
      target.env = env2;
    }
    target.shell = ShellConfiguration.assignProperties(target.shell, source.shell);
    return target;
  }
  CommandOptions4.assignProperties = assignProperties;
  function fillProperties(target, source) {
    return _fillProperties(target, source, properties);
  }
  CommandOptions4.fillProperties = fillProperties;
  function fillDefaults(value2, context2) {
    return _fillDefaults(value2, defaults, properties, context2);
  }
  CommandOptions4.fillDefaults = fillDefaults;
  function freeze3(value2) {
    return _freeze(value2, properties);
  }
  CommandOptions4.freeze = freeze3;
})(CommandOptions2 || (CommandOptions2 = {}));

var CommandConfiguration;

((CommandConfiguration2) => {
  let PresentationOptions2;
  ((PresentationOptions3) => {
    const properties2 = [{ property: "echo" }, { property: "reveal" }, { property: "revealProblems" }, { property: "focus" }, { property: "panel" }, { property: "showReuseMessage" }, { property: "clear" }, { property: "group" }, { property: "close" }, { property: "preserveTerminalName" }];
    function from2(config, context2) {
      let echo;
      let reveal;
      let revealProblems;
      let focus;
      let panel;
      let showReuseMessage;
      let clear;
      let group2;
      let close2;
      let preserveTerminalName;
      let hasProps = false;
      if (isBoolean(config.echoCommand)) {
        echo = config.echoCommand;
        hasProps = true;
      }
      if (isString(config.showOutput)) {
        reveal = RevealKind.fromString(config.showOutput);
        hasProps = true;
      }
      const presentation2 = config.presentation || config.terminal;
      if (presentation2) {
        if (isBoolean(presentation2.echo)) {
          echo = presentation2.echo;
        }
        if (isString(presentation2.reveal)) {
          reveal = RevealKind.fromString(presentation2.reveal);
        }
        if (isString(presentation2.revealProblems)) {
          revealProblems = RevealProblemKind.fromString(presentation2.revealProblems);
        }
        if (isBoolean(presentation2.focus)) {
          focus = presentation2.focus;
        }
        if (isString(presentation2.panel)) {
          panel = PanelKind.fromString(presentation2.panel);
        }
        if (isBoolean(presentation2.showReuseMessage)) {
          showReuseMessage = presentation2.showReuseMessage;
        }
        if (isBoolean(presentation2.clear)) {
          clear = presentation2.clear;
        }
        if (isString(presentation2.group)) {
          group2 = presentation2.group;
        }
        if (isBoolean(presentation2.close)) {
          close2 = presentation2.close;
        }
        if (isBoolean(presentation2.preserveTerminalName)) {
          preserveTerminalName = presentation2.preserveTerminalName;
        }
        hasProps = true;
      }
      if (!hasProps) {
        return void 0;
      }
      return { echo, reveal, revealProblems, focus, panel, showReuseMessage, clear, group: group2, close: close2, preserveTerminalName };
    }
    PresentationOptions3.from = from2;
    function assignProperties2(target, source) {
      return _assignProperties(target, source, properties2);
    }
    PresentationOptions3.assignProperties = assignProperties2;
    function fillProperties2(target, source) {
      return _fillProperties(target, source, properties2);
    }
    PresentationOptions3.fillProperties = fillProperties2;
    function fillDefaults2(value2, context2) {
      const defaultEcho = context2.engine === 2 /* Terminal */ ? true : false;
      return _fillDefaults(value2, { echo: defaultEcho, reveal: 1 /* Always */, revealProblems: 1 /* Never */, focus: false, panel: 1 /* Shared */, showReuseMessage: true, clear: false, preserveTerminalName: false }, properties2, context2);
    }
    PresentationOptions3.fillDefaults = fillDefaults2;
    function freeze4(value2) {
      return _freeze(value2, properties2);
    }
    PresentationOptions3.freeze = freeze4;
    function isEmpty2(value2) {
      return _isEmpty(value2, properties2);
    }
    PresentationOptions3.isEmpty = isEmpty2;
  })(PresentationOptions2 = CommandConfiguration2.PresentationOptions || (CommandConfiguration2.PresentationOptions = {}));
  let ShellString;
  ((ShellString2) => {
    function from2(value2) {
      if (value2 === void 0 || value2 === null) {
        return void 0;
      }
      if (isString(value2)) {
        return value2;
      } else if (isStringArray(value2)) {
        return value2.join(" ");
      } else {
        const quoting = ShellQuoting.from(value2.quoting);
        const result = isString(value2.value) ? value2.value : isStringArray(value2.value) ? value2.value.join(" ") : void 0;
        if (result) {
          return {
            value: result,
            quoting
          };
        } else {
          return void 0;
        }
      }
    }
    ShellString2.from = from2;
  })(ShellString || (ShellString = {}));
  const properties = [
    { property: "runtime" },
    { property: "name" },
    { property: "options", type: CommandOptions2 },
    { property: "args" },
    { property: "taskSelector" },
    { property: "suppressTaskName" },
    { property: "presentation", type: PresentationOptions2 }
  ];
  function from(config, context2) {
    let result = fromBase(config, context2);
    let osConfig = void 0;
    if (config.windows && context2.platform === 3 /* Windows */) {
      osConfig = fromBase(config.windows, context2);
    } else if (config.osx && context2.platform === 1 /* Mac */) {
      osConfig = fromBase(config.osx, context2);
    } else if (config.linux && context2.platform === 2 /* Linux */) {
      osConfig = fromBase(config.linux, context2);
    }
    if (osConfig) {
      result = assignProperties(result, osConfig, context2.schemaVersion === 2 /* V2_0_0 */);
    }
    return isEmpty(result) ? void 0 : result;
  }
  CommandConfiguration2.from = from;
  function fromBase(config, context2) {
    const name = ShellString.from(config.command);
    let runtime;
    if (isString(config.type)) {
      if (config.type === "shell" || config.type === "process") {
        runtime = RuntimeType.fromString(config.type);
      }
    }
    if (isBoolean(config.isShellCommand) || ShellConfiguration.is(config.isShellCommand)) {
      runtime = 1 /* Shell */;
    } else if (config.isShellCommand !== void 0) {
      runtime = !!config.isShellCommand ? 1 /* Shell */ : 2 /* Process */;
    }
    const result = {
      name,
      runtime,
      presentation: PresentationOptions2.from(config, context2)
    };
    if (config.args !== void 0) {
      result.args = [];
      for (const arg of config.args) {
        const converted = ShellString.from(arg);
        if (converted !== void 0) {
          result.args.push(converted);
        } else {
          context2.taskLoadIssues.push(
            localize(
              19865,
              null,
              arg ? JSON.stringify(arg, void 0, 4) : "undefined"
            )
          );
        }
      }
    }
    if (config.options !== void 0) {
      result.options = CommandOptions2.from(config.options, context2);
      if (result.options && result.options.shell === void 0 && ShellConfiguration.is(config.isShellCommand)) {
        result.options.shell = ShellConfiguration.from(config.isShellCommand, context2);
        if (context2.engine !== 2 /* Terminal */) {
          context2.taskLoadIssues.push(localize(19870, null));
        }
      }
    }
    if (isString(config.taskSelector)) {
      result.taskSelector = config.taskSelector;
    }
    if (isBoolean(config.suppressTaskName)) {
      result.suppressTaskName = config.suppressTaskName;
    }
    return isEmpty(result) ? void 0 : result;
  }
  function hasCommand(value2) {
    return value2 && !!value2.name;
  }
  CommandConfiguration2.hasCommand = hasCommand;
  function isEmpty(value2) {
    return _isEmpty(value2, properties);
  }
  CommandConfiguration2.isEmpty = isEmpty;
  function assignProperties(target, source, overwriteArgs) {
    if (isEmpty(source)) {
      return target;
    }
    if (isEmpty(target)) {
      return source;
    }
    assignProperty(target, source, "name");
    assignProperty(target, source, "runtime");
    assignProperty(target, source, "taskSelector");
    assignProperty(target, source, "suppressTaskName");
    if (source.args !== void 0) {
      if (target.args === void 0 || overwriteArgs) {
        target.args = source.args;
      } else {
        target.args = target.args.concat(source.args);
      }
    }
    target.presentation = PresentationOptions2.assignProperties(target.presentation, source.presentation);
    target.options = CommandOptions2.assignProperties(target.options, source.options);
    return target;
  }
  CommandConfiguration2.assignProperties = assignProperties;
  function fillProperties(target, source) {
    return _fillProperties(target, source, properties);
  }
  CommandConfiguration2.fillProperties = fillProperties;
  function fillGlobals(target, source, taskName) {
    if (source === void 0 || isEmpty(source)) {
      return target;
    }
    target = target || {
      name: void 0,
      runtime: void 0,
      presentation: void 0
    };
    if (target.name === void 0) {
      fillProperty(target, source, "name");
      fillProperty(target, source, "taskSelector");
      fillProperty(target, source, "suppressTaskName");
      let args2 = source.args ? source.args.slice() : [];
      if (!target.suppressTaskName && taskName) {
        if (target.taskSelector !== void 0) {
          args2.push(target.taskSelector + taskName);
        } else {
          args2.push(taskName);
        }
      }
      if (target.args) {
        args2 = args2.concat(target.args);
      }
      target.args = args2;
    }
    fillProperty(target, source, "runtime");
    target.presentation = PresentationOptions2.fillProperties(target.presentation, source.presentation);
    target.options = CommandOptions2.fillProperties(target.options, source.options);
    return target;
  }
  CommandConfiguration2.fillGlobals = fillGlobals;
  function fillDefaults(value2, context2) {
    if (!value2 || Object.isFrozen(value2)) {
      return;
    }
    if (value2.name !== void 0 && value2.runtime === void 0) {
      value2.runtime = 2 /* Process */;
    }
    value2.presentation = PresentationOptions2.fillDefaults(value2.presentation, context2);
    if (!isEmpty(value2)) {
      value2.options = CommandOptions2.fillDefaults(value2.options, context2);
    }
    if (value2.args === void 0) {
      value2.args = EMPTY_ARRAY;
    }
    if (value2.suppressTaskName === void 0) {
      value2.suppressTaskName = context2.schemaVersion === 2 /* V2_0_0 */;
    }
  }
  CommandConfiguration2.fillDefaults = fillDefaults;
  function freeze3(value2) {
    return _freeze(value2, properties);
  }
  CommandConfiguration2.freeze = freeze3;
})(CommandConfiguration || (CommandConfiguration = {}));

var ProblemMatcherConverter;

((ProblemMatcherConverter2) => {
  function namedFrom(declares, context2) {
    const result = /* @__PURE__ */ Object.create(null);
    if (!Array.isArray(declares)) {
      return result;
    }
    declares.forEach((value2) => {
      const namedProblemMatcher = new ProblemMatcherParser(context2.problemReporter).parse(value2);
      if (isNamedProblemMatcher(namedProblemMatcher)) {
        result[namedProblemMatcher.name] = namedProblemMatcher;
      } else {
        context2.problemReporter.error(localize(19869, null, JSON.stringify(value2, void 0, 4)));
      }
    });
    return result;
  }
  ProblemMatcherConverter2.namedFrom = namedFrom;
  function fromWithOsConfig(external, context2) {
    let result = {};
    const osExternal = external;
    if (osExternal.windows?.problemMatcher && context2.platform === 3 /* Windows */) {
      result = from(osExternal.windows.problemMatcher, context2);
    } else if (osExternal.osx?.problemMatcher && context2.platform === 1 /* Mac */) {
      result = from(osExternal.osx.problemMatcher, context2);
    } else if (osExternal.linux?.problemMatcher && context2.platform === 2 /* Linux */) {
      result = from(osExternal.linux.problemMatcher, context2);
    } else if (external.problemMatcher) {
      result = from(external.problemMatcher, context2);
    }
    return result;
  }
  ProblemMatcherConverter2.fromWithOsConfig = fromWithOsConfig;
  function from(config, context2) {
    const result = [];
    if (config === void 0) {
      return { value: result };
    }
    const errors = [];
    function addResult(matcher) {
      if (matcher.value) {
        result.push(matcher.value);
      }
      if (matcher.errors) {
        errors.push(...matcher.errors);
      }
    }
    const kind = getProblemMatcherKind(config);
    if (kind === 0 /* Unknown */) {
      const error = localize(
        19875,
        null,
        JSON.stringify(config, null, 4)
      );
      context2.problemReporter.warn(error);
    } else if (kind === 1 /* String */ || kind === 2 /* ProblemMatcher */) {
      addResult(resolveProblemMatcher(config, context2));
    } else if (kind === 3 /* Array */) {
      const problemMatchers = config;
      problemMatchers.forEach((problemMatcher) => {
        addResult(resolveProblemMatcher(problemMatcher, context2));
      });
    }
    return { value: result, errors };
  }
  ProblemMatcherConverter2.from = from;
  function getProblemMatcherKind(value2) {
    if (isString(value2)) {
      return 1 /* String */;
    } else if (Array.isArray(value2)) {
      return 3 /* Array */;
    } else if (!isUndefined(value2)) {
      return 2 /* ProblemMatcher */;
    } else {
      return 0 /* Unknown */;
    }
  }
  function resolveProblemMatcher(value2, context2) {
    if (isString(value2)) {
      let variableName = value2;
      if (variableName.length > 1 && variableName[0] === "$") {
        variableName = variableName.substring(1);
        const global = ProblemMatcherRegistry.get(variableName);
        if (global) {
          return { value: deepClone(global) };
        }
        let localProblemMatcher = context2.namedProblemMatchers[variableName];
        if (localProblemMatcher) {
          localProblemMatcher = deepClone(localProblemMatcher);
          delete localProblemMatcher.name;
          return { value: localProblemMatcher };
        }
      }
      return { errors: [localize(19867, null, value2)] };
    } else {
      const json = value2;
      return { value: new ProblemMatcherParser(context2.problemReporter).parse(json) };
    }
  }
})(ProblemMatcherConverter || (ProblemMatcherConverter = {}));

var GroupKind;

((GroupKind2) => {
  function from(external) {
    if (external === void 0) {
      return void 0;
    } else if (isString(external) && TaskGroup2.is(external)) {
      return { _id: external, isDefault: false };
    } else if (isString(external.kind) && TaskGroup2.is(external.kind)) {
      const group2 = external.kind;
      const isDefault = isUndefined(external.isDefault) ? false : external.isDefault;
      return { _id: group2, isDefault };
    }
    return void 0;
  }
  GroupKind2.from = from;
  function to(group2) {
    if (isString(group2)) {
      return group2;
    } else if (!group2.isDefault) {
      return group2._id;
    }
    return {
      kind: group2._id,
      isDefault: group2.isDefault
    };
  }
  GroupKind2.to = to;
})(GroupKind || (GroupKind = {}));

var TaskDependency;

((TaskDependency2) => {
  function uriFromSource(context2, source) {
    switch (source) {
      case 2 /* User */:
        return USER_TASKS_GROUP_KEY;
      case 0 /* TasksJson */:
        return context2.workspaceFolder.uri;
      default:
        return context2.workspace && context2.workspace.configuration ? context2.workspace.configuration : context2.workspaceFolder.uri;
    }
  }
  function from(external, context2, source) {
    if (isString(external)) {
      return { uri: uriFromSource(context2, source), task: external };
    } else if (ITaskIdentifier2.is(external)) {
      return {
        uri: uriFromSource(context2, source),
        task: TaskDefinition.createTaskIdentifier(external, context2.problemReporter)
      };
    } else {
      return void 0;
    }
  }
  TaskDependency2.from = from;
})(TaskDependency || (TaskDependency = {}));

var DependsOrder2;

((DependsOrder3) => {
  function from(order) {
    switch (order) {
      case "sequence" /* sequence */:
        return "sequence" /* sequence */;
      case "parallel" /* parallel */:
      default:
        return "parallel" /* parallel */;
    }
  }
  DependsOrder3.from = from;
})(DependsOrder2 || (DependsOrder2 = {}));

var ConfigurationProperties;

((ConfigurationProperties2) => {
  const properties = [
    { property: "name" },
    { property: "identifier" },
    { property: "group" },
    { property: "isBackground" },
    { property: "promptOnClose" },
    { property: "dependsOn" },
    { property: "presentation", type: CommandConfiguration.PresentationOptions },
    { property: "problemMatchers" },
    { property: "options" },
    { property: "icon" },
    { property: "hide" },
    { property: "inAgents" }
  ];
  function from(external, context2, includeCommandOptions, source, properties2) {
    if (!external) {
      return {};
    }
    const result = {};
    if (properties2) {
      for (const propertyName of Object.keys(properties2)) {
        if (external[propertyName] !== void 0) {
          result[propertyName] = deepClone(external[propertyName]);
        }
      }
    }
    if (isString(external.taskName)) {
      result.name = external.taskName;
    }
    if (isString(external.label) && context2.schemaVersion === 2 /* V2_0_0 */) {
      result.name = external.label;
    }
    if (isString(external.identifier)) {
      result.identifier = external.identifier;
    }
    result.icon = external.icon;
    result.hide = external.hide;
    result.inAgents = external.inAgents;
    if (external.isBackground !== void 0) {
      result.isBackground = !!external.isBackground;
    }
    if (external.promptOnClose !== void 0) {
      result.promptOnClose = !!external.promptOnClose;
    }
    result.group = GroupKind.from(external.group);
    if (external.dependsOn !== void 0) {
      if (Array.isArray(external.dependsOn)) {
        result.dependsOn = external.dependsOn.reduce((dependencies, item) => {
          const dependency = TaskDependency.from(item, context2, source);
          if (dependency) {
            dependencies.push(dependency);
          }
          return dependencies;
        }, []);
      } else {
        const dependsOnValue = TaskDependency.from(external.dependsOn, context2, source);
        result.dependsOn = dependsOnValue ? [dependsOnValue] : void 0;
      }
    }
    result.dependsOrder = DependsOrder2.from(external.dependsOrder);
    if (includeCommandOptions && (external.presentation !== void 0 || external.terminal !== void 0)) {
      result.presentation = CommandConfiguration.PresentationOptions.from(external, context2);
    }
    if (includeCommandOptions && external.options !== void 0) {
      result.options = CommandOptions2.from(external.options, context2);
    }
    const configProblemMatcher = ProblemMatcherConverter.fromWithOsConfig(external, context2);
    if (configProblemMatcher.value !== void 0) {
      result.problemMatchers = configProblemMatcher.value;
    }
    if (external.detail) {
      result.detail = external.detail;
    }
    return isEmpty(result) ? {} : { value: result, errors: configProblemMatcher.errors };
  }
  ConfigurationProperties2.from = from;
  function isEmpty(value2) {
    return _isEmpty(value2, properties);
  }
  ConfigurationProperties2.isEmpty = isEmpty;
})(ConfigurationProperties || (ConfigurationProperties = {}));

var label2 = "Workspace";

var ConfiguringTask2;

((ConfiguringTask3) => {
  const grunt = "grunt.";
  const jake = "jake.";
  const gulp = "gulp.";
  const npm = "vscode.npm.";
  const typescript = "vscode.typescript.";
  function from(external, context2, index2, source, registry4) {
    if (!external) {
      return void 0;
    }
    const type = external.type;
    const customize2 = external.customize;
    if (!type && !customize2) {
      context2.problemReporter.error(localize(19872, null, JSON.stringify(external, null, 4)));
      return void 0;
    }
    const typeDeclaration = type ? registry4?.get?.(type) || TaskDefinitionRegistry.get(type) : void 0;
    if (!typeDeclaration) {
      const message = localize(19874, null, type);
      context2.problemReporter.error(message);
      return void 0;
    }
    let identifier2;
    if (isString(customize2)) {
      if (customize2.indexOf(grunt) === 0) {
        identifier2 = { type: "grunt", task: customize2.substring(grunt.length) };
      } else if (customize2.indexOf(jake) === 0) {
        identifier2 = { type: "jake", task: customize2.substring(jake.length) };
      } else if (customize2.indexOf(gulp) === 0) {
        identifier2 = { type: "gulp", task: customize2.substring(gulp.length) };
      } else if (customize2.indexOf(npm) === 0) {
        identifier2 = { type: "npm", script: customize2.substring(npm.length + 4) };
      } else if (customize2.indexOf(typescript) === 0) {
        identifier2 = { type: "typescript", tsconfig: customize2.substring(typescript.length + 6) };
      }
    } else {
      if (isString(external.type)) {
        identifier2 = external;
      }
    }
    if (identifier2 === void 0) {
      context2.problemReporter.error(localize(
        19868,
        null,
        JSON.stringify(external, void 0, 0)
      ));
      return void 0;
    }
    const taskIdentifier2 = TaskDefinition.createTaskIdentifier(identifier2, context2.problemReporter);
    if (taskIdentifier2 === void 0) {
      context2.problemReporter.error(localize(
        19864,
        null,
        JSON.stringify(external, void 0, 0)
      ));
      return void 0;
    }
    const configElement = {
      workspaceFolder: context2.workspaceFolder,
      file: ".vscode/tasks.json",
      index: index2,
      element: external
    };
    let taskSource;
    switch (source) {
      case 2 /* User */: {
        taskSource = { kind: TaskSourceKind.User, config: configElement, label: label2 };
        break;
      }
      case 1 /* WorkspaceFile */: {
        taskSource = { kind: TaskSourceKind.WorkspaceFile, config: configElement, label: label2 };
        break;
      }
      default: {
        taskSource = { kind: TaskSourceKind.Workspace, config: configElement, label: label2 };
        break;
      }
    }
    const result = new ConfiguringTask(
      `${typeDeclaration.extensionId}.${taskIdentifier2._key}`,
      taskSource,
      void 0,
      type,
      taskIdentifier2,
      RunOptions2.fromConfiguration(external.runOptions),
      { hide: external.hide, inAgents: external.inAgents }
    );
    const configuration2 = ConfigurationProperties.from(external, context2, true, source, typeDeclaration.properties);
    result.addTaskLoadMessages(configuration2.errors);
    if (configuration2.value) {
      result.configurationProperties = Object.assign(result.configurationProperties, configuration2.value);
      if (result.configurationProperties.name) {
        result._label = result.configurationProperties.name;
      } else {
        let label3 = result.configures.type;
        if (typeDeclaration.required && typeDeclaration.required.length > 0) {
          for (const required of typeDeclaration.required) {
            const value2 = result.configures[required];
            if (value2) {
              label3 = label3 + ": " + value2;
              break;
            }
          }
        }
        result._label = label3;
      }
      if (!result.configurationProperties.identifier) {
        result.configurationProperties.identifier = taskIdentifier2._key;
      }
    }
    return result;
  }
  ConfiguringTask3.from = from;
})(ConfiguringTask2 || (ConfiguringTask2 = {}));

var CustomTask2;

((CustomTask3) => {
  function from(external, context2, index2, source) {
    if (!external) {
      return void 0;
    }
    let type = external.type;
    if (type === void 0 || type === null) {
      type = CUSTOMIZED_TASK_TYPE;
    }
    if (type !== CUSTOMIZED_TASK_TYPE && type !== "shell" && type !== "process") {
      context2.problemReporter.error(localize(19873, null, JSON.stringify(external, null, 4)));
      return void 0;
    }
    let taskName = external.taskName;
    if (isString(external.label) && context2.schemaVersion === 2 /* V2_0_0 */) {
      taskName = external.label;
    }
    if (!taskName) {
      context2.problemReporter.error(localize(19871, null, JSON.stringify(external, null, 4)));
      return void 0;
    }
    let taskSource;
    switch (source) {
      case 2 /* User */: {
        taskSource = { kind: TaskSourceKind.User, config: { index: index2, element: external, file: ".vscode/tasks.json", workspaceFolder: context2.workspaceFolder }, label: label2 };
        break;
      }
      case 1 /* WorkspaceFile */: {
        taskSource = { kind: TaskSourceKind.WorkspaceFile, config: { index: index2, element: external, file: ".vscode/tasks.json", workspaceFolder: context2.workspaceFolder, workspace: context2.workspace }, label: label2 };
        break;
      }
      default: {
        taskSource = { kind: TaskSourceKind.Workspace, config: { index: index2, element: external, file: ".vscode/tasks.json", workspaceFolder: context2.workspaceFolder }, label: label2 };
        break;
      }
    }
    const result = new CustomTask(
      context2.uuidMap.getUUID(taskName),
      taskSource,
      taskName,
      CUSTOMIZED_TASK_TYPE,
      void 0,
      false,
      RunOptions2.fromConfiguration(external.runOptions),
      {
        name: taskName,
        identifier: taskName
      }
    );
    const configuration2 = ConfigurationProperties.from(external, context2, false, source);
    result.addTaskLoadMessages(configuration2.errors);
    if (configuration2.value) {
      result.configurationProperties = Object.assign(result.configurationProperties, configuration2.value);
    }
    const supportLegacy = true;
    if (supportLegacy) {
      const legacy = external;
      if (result.configurationProperties.isBackground === void 0 && legacy.isWatching !== void 0) {
        result.configurationProperties.isBackground = !!legacy.isWatching;
      }
      if (result.configurationProperties.group === void 0) {
        if (legacy.isBuildCommand === true) {
          result.configurationProperties.group = TaskGroup2.Build;
        } else if (legacy.isTestCommand === true) {
          result.configurationProperties.group = TaskGroup2.Test;
        }
      }
    }
    const command4 = CommandConfiguration.from(external, context2);
    if (command4) {
      result.command = command4;
    }
    if (external.command !== void 0) {
      command4.suppressTaskName = true;
    }
    return result;
  }
  CustomTask3.from = from;
  function fillGlobals(task, globals) {
    if (CommandConfiguration.hasCommand(task.command) || task.configurationProperties.dependsOn === void 0) {
      task.command = CommandConfiguration.fillGlobals(task.command, globals.command, task.configurationProperties.name);
    }
    if (task.configurationProperties.problemMatchers === void 0 && globals.problemMatcher !== void 0) {
      task.configurationProperties.problemMatchers = deepClone(globals.problemMatcher);
      task.hasDefinedMatchers = true;
    }
    if (task.configurationProperties.promptOnClose === void 0 && task.configurationProperties.isBackground === void 0 && globals.promptOnClose !== void 0) {
      task.configurationProperties.promptOnClose = globals.promptOnClose;
    }
  }
  CustomTask3.fillGlobals = fillGlobals;
  function fillDefaults(task, context2) {
    CommandConfiguration.fillDefaults(task.command, context2);
    if (task.configurationProperties.promptOnClose === void 0) {
      task.configurationProperties.promptOnClose = task.configurationProperties.isBackground !== void 0 ? !task.configurationProperties.isBackground : true;
    }
    if (task.configurationProperties.isBackground === void 0) {
      task.configurationProperties.isBackground = false;
    }
    if (task.configurationProperties.problemMatchers === void 0) {
      task.configurationProperties.problemMatchers = EMPTY_ARRAY;
    }
  }
  CustomTask3.fillDefaults = fillDefaults;
  function createCustomTask2(contributedTask, configuredProps) {
    const result = new CustomTask(
      configuredProps._id,
      Object.assign({}, configuredProps._source, { customizes: contributedTask.defines }),
      configuredProps.configurationProperties.name || contributedTask._label,
      CUSTOMIZED_TASK_TYPE,
      contributedTask.command,
      false,
      contributedTask.runOptions,
      {
        name: configuredProps.configurationProperties.name || contributedTask.configurationProperties.name,
        identifier: configuredProps.configurationProperties.identifier || contributedTask.configurationProperties.identifier,
        icon: configuredProps.configurationProperties.icon,
        hide: configuredProps.configurationProperties.hide,
        inAgents: configuredProps.configurationProperties.inAgents
      }
    );
    result.addTaskLoadMessages(configuredProps.taskLoadMessages);
    const resultConfigProps = result.configurationProperties;
    assignProperty(resultConfigProps, configuredProps.configurationProperties, "group");
    assignProperty(resultConfigProps, configuredProps.configurationProperties, "isBackground");
    assignProperty(resultConfigProps, configuredProps.configurationProperties, "dependsOn");
    assignProperty(resultConfigProps, configuredProps.configurationProperties, "problemMatchers");
    assignProperty(resultConfigProps, configuredProps.configurationProperties, "promptOnClose");
    assignProperty(resultConfigProps, configuredProps.configurationProperties, "detail");
    result.command.presentation = CommandConfiguration.PresentationOptions.assignProperties(
      result.command.presentation,
      configuredProps.configurationProperties.presentation
    );
    result.command.options = CommandOptions2.assignProperties(result.command.options, configuredProps.configurationProperties.options);
    result.runOptions = RunOptions2.assignProperties(result.runOptions, configuredProps.runOptions);
    const contributedConfigProps = contributedTask.configurationProperties;
    fillProperty(resultConfigProps, contributedConfigProps, "group");
    fillProperty(resultConfigProps, contributedConfigProps, "isBackground");
    fillProperty(resultConfigProps, contributedConfigProps, "dependsOn");
    fillProperty(resultConfigProps, contributedConfigProps, "problemMatchers");
    fillProperty(resultConfigProps, contributedConfigProps, "promptOnClose");
    fillProperty(resultConfigProps, contributedConfigProps, "detail");
    result.command.presentation = CommandConfiguration.PresentationOptions.fillProperties(
      result.command.presentation,
      contributedConfigProps.presentation
    );
    result.command.options = CommandOptions2.fillProperties(result.command.options, contributedConfigProps.options);
    result.runOptions = RunOptions2.fillProperties(result.runOptions, contributedTask.runOptions);
    if (contributedTask.hasDefinedMatchers === true) {
      result.hasDefinedMatchers = true;
    }
    return result;
  }
  CustomTask3.createCustomTask = createCustomTask2;
})(CustomTask2 || (CustomTask2 = {}));

var TaskParser;

((TaskParser2) => {
  function isCustomTask(value2) {
    const type = value2.type;
    const customize2 = value2.customize;
    return customize2 === void 0 && (type === void 0 || type === null || type === CUSTOMIZED_TASK_TYPE || type === "shell" || type === "process");
  }
  const builtinTypeContextMap = {
    shell: ShellExecutionSupportedContext,
    process: ProcessExecutionSupportedContext
  };
  function from(externals, globals, context2, source, registry4) {
    const result = { custom: [], configured: [] };
    if (!externals) {
      return result;
    }
    const defaultBuildTask = { task: void 0, rank: -1 };
    const defaultTestTask = { task: void 0, rank: -1 };
    const schema2_0_0 = context2.schemaVersion === 2 /* V2_0_0 */;
    const baseLoadIssues = deepClone(context2.taskLoadIssues);
    for (let index2 = 0; index2 < externals.length; index2++) {
      const external = externals[index2];
      const definition = external.type ? registry4?.get?.(external.type) || TaskDefinitionRegistry.get(external.type) : void 0;
      let typeNotSupported = false;
      if (definition && definition.when && !context2.contextKeyService.contextMatchesRules(definition.when)) {
        typeNotSupported = true;
      } else if (!definition && external.type) {
        for (const key3 of Object.keys(builtinTypeContextMap)) {
          if (external.type === key3) {
            typeNotSupported = !ShellExecutionSupportedContext.evaluate(context2.contextKeyService.getContext(null));
            break;
          }
        }
      }
      if (typeNotSupported) {
        context2.problemReporter.info(localize(
          19878,
          null,
          external.type
        ));
        continue;
      }
      if (isCustomTask(external)) {
        const customTask = CustomTask2.from(external, context2, index2, source);
        if (customTask) {
          CustomTask2.fillGlobals(customTask, globals);
          CustomTask2.fillDefaults(customTask, context2);
          if (schema2_0_0) {
            if ((customTask.command === void 0 || customTask.command.name === void 0) && (customTask.configurationProperties.dependsOn === void 0 || customTask.configurationProperties.dependsOn.length === 0)) {
              context2.problemReporter.error(localize(
                19877,
                null,
                customTask.configurationProperties.name,
                JSON.stringify(external, void 0, 4)
              ));
              continue;
            }
          } else {
            if (customTask.command === void 0 || customTask.command.name === void 0) {
              context2.problemReporter.warn(localize(
                19876,
                null,
                customTask.configurationProperties.name,
                JSON.stringify(external, void 0, 4)
              ));
              continue;
            }
          }
          if (customTask.configurationProperties.group === TaskGroup2.Build && defaultBuildTask.rank < 2) {
            defaultBuildTask.task = customTask;
            defaultBuildTask.rank = 2;
          } else if (customTask.configurationProperties.group === TaskGroup2.Test && defaultTestTask.rank < 2) {
            defaultTestTask.task = customTask;
            defaultTestTask.rank = 2;
          } else if (customTask.configurationProperties.name === "build" && defaultBuildTask.rank < 1) {
            defaultBuildTask.task = customTask;
            defaultBuildTask.rank = 1;
          } else if (customTask.configurationProperties.name === "test" && defaultTestTask.rank < 1) {
            defaultTestTask.task = customTask;
            defaultTestTask.rank = 1;
          }
          customTask.addTaskLoadMessages(context2.taskLoadIssues);
          result.custom.push(customTask);
        }
      } else {
        const configuredTask = ConfiguringTask2.from(external, context2, index2, source, registry4);
        if (configuredTask) {
          configuredTask.addTaskLoadMessages(context2.taskLoadIssues);
          result.configured.push(configuredTask);
        }
      }
      context2.taskLoadIssues = deepClone(baseLoadIssues);
    }
    const defaultBuildGroupName = isString(defaultBuildTask.task?.configurationProperties.group) ? defaultBuildTask.task?.configurationProperties.group : defaultBuildTask.task?.configurationProperties.group?._id;
    const defaultTestTaskGroupName = isString(defaultTestTask.task?.configurationProperties.group) ? defaultTestTask.task?.configurationProperties.group : defaultTestTask.task?.configurationProperties.group?._id;
    if (defaultBuildGroupName !== TaskGroup2.Build._id && defaultBuildTask.rank > -1 && defaultBuildTask.rank < 2 && defaultBuildTask.task) {
      defaultBuildTask.task.configurationProperties.group = TaskGroup2.Build;
    } else if (defaultTestTaskGroupName !== TaskGroup2.Test._id && defaultTestTask.rank > -1 && defaultTestTask.rank < 2 && defaultTestTask.task) {
      defaultTestTask.task.configurationProperties.group = TaskGroup2.Test;
    }
    return result;
  }
  TaskParser2.from = from;
  function assignTasks(target, source) {
    if (source === void 0 || source.length === 0) {
      return target;
    }
    if (target === void 0 || target.length === 0) {
      return source;
    }
    if (source) {
      const map = /* @__PURE__ */ Object.create(null);
      target.forEach((task) => {
        map[task.configurationProperties.name] = task;
      });
      source.forEach((task) => {
        map[task.configurationProperties.name] = task;
      });
      const newTarget = [];
      target.forEach((task) => {
        newTarget.push(map[task.configurationProperties.name]);
        delete map[task.configurationProperties.name];
      });
      Object.keys(map).forEach((key3) => newTarget.push(map[key3]));
      target = newTarget;
    }
    return target;
  }
  TaskParser2.assignTasks = assignTasks;
})(TaskParser || (TaskParser = {}));

var Globals;

((Globals2) => {
  function from(config, context2) {
    let result = fromBase(config, context2);
    let osGlobals = void 0;
    if (config.windows && context2.platform === 3 /* Windows */) {
      osGlobals = fromBase(config.windows, context2);
    } else if (config.osx && context2.platform === 1 /* Mac */) {
      osGlobals = fromBase(config.osx, context2);
    } else if (config.linux && context2.platform === 2 /* Linux */) {
      osGlobals = fromBase(config.linux, context2);
    }
    if (osGlobals) {
      result = Globals2.assignProperties(result, osGlobals);
    }
    const command4 = CommandConfiguration.from(config, context2);
    if (command4) {
      result.command = command4;
    }
    Globals2.fillDefaults(result, context2);
    Globals2.freeze(result);
    return result;
  }
  Globals2.from = from;
  function fromBase(config, context2) {
    const result = {};
    if (config.suppressTaskName !== void 0) {
      result.suppressTaskName = !!config.suppressTaskName;
    }
    if (config.promptOnClose !== void 0) {
      result.promptOnClose = !!config.promptOnClose;
    }
    if (config.problemMatcher) {
      result.problemMatcher = ProblemMatcherConverter.from(config.problemMatcher, context2).value;
    }
    return result;
  }
  Globals2.fromBase = fromBase;
  function isEmpty(value2) {
    return !value2 || value2.command === void 0 && value2.promptOnClose === void 0 && value2.suppressTaskName === void 0;
  }
  Globals2.isEmpty = isEmpty;
  function assignProperties(target, source) {
    if (isEmpty(source)) {
      return target;
    }
    if (isEmpty(target)) {
      return source;
    }
    assignProperty(target, source, "promptOnClose");
    assignProperty(target, source, "suppressTaskName");
    return target;
  }
  Globals2.assignProperties = assignProperties;
  function fillDefaults(value2, context2) {
    if (!value2) {
      return;
    }
    CommandConfiguration.fillDefaults(value2.command, context2);
    if (value2.suppressTaskName === void 0) {
      value2.suppressTaskName = context2.schemaVersion === 2 /* V2_0_0 */;
    }
    if (value2.promptOnClose === void 0) {
      value2.promptOnClose = true;
    }
  }
  Globals2.fillDefaults = fillDefaults;
  function freeze3(value2) {
    Object.freeze(value2);
    if (value2.command) {
      CommandConfiguration.freeze(value2.command);
    }
  }
  Globals2.freeze = freeze3;
})(Globals || (Globals = {}));

var ExecutionEngine2;

((ExecutionEngine3) => {
  function from(config) {
    const runner = config.runner || config._runner;
    let result;
    if (runner) {
      switch (runner) {
        case "terminal":
          result = 2 /* Terminal */;
          break;
        case "process":
          result = 1 /* Process */;
          break;
      }
    }
    const schemaVersion = JsonSchemaVersion2.from(config);
    if (schemaVersion === 1 /* V0_1_0 */) {
      return result || 1 /* Process */;
    } else if (schemaVersion === 2 /* V2_0_0 */) {
      return 2 /* Terminal */;
    } else {
      throw new Error("Shouldn't happen.");
    }
  }
  ExecutionEngine3.from = from;
})(ExecutionEngine2 || (ExecutionEngine2 = {}));

var JsonSchemaVersion2;

((JsonSchemaVersion3) => {
  const _default = 2 /* V2_0_0 */;
  function from(config) {
    const version2 = config.version;
    if (!version2) {
      return _default;
    }
    switch (version2) {
      case "0.1.0":
        return 1 /* V0_1_0 */;
      case "2.0.0":
        return 2 /* V2_0_0 */;
      default:
        return _default;
    }
  }
  JsonSchemaVersion3.from = from;
})(JsonSchemaVersion2 || (JsonSchemaVersion2 = {}));

var UUIDMap = class {
  constructor(other) {
    this.current = /* @__PURE__ */ Object.create(null);
    if (other) {
      for (const key3 of Object.keys(other.current)) {
        const value2 = other.current[key3];
        if (Array.isArray(value2)) {
          this.current[key3] = value2.slice();
        } else {
          this.current[key3] = value2;
        }
      }
    }
  }
  start() {
    this.last = this.current;
    this.current = /* @__PURE__ */ Object.create(null);
  }
  getUUID(identifier2) {
    const lastValue = this.last ? this.last[identifier2] : void 0;
    let result = void 0;
    if (lastValue !== void 0) {
      if (Array.isArray(lastValue)) {
        result = lastValue.shift();
        if (lastValue.length === 0) {
          delete this.last[identifier2];
        }
      } else {
        result = lastValue;
        delete this.last[identifier2];
      }
    }
    if (result === void 0) {
      result = generateUuid();
    }
    const currentValue = this.current[identifier2];
    if (currentValue === void 0) {
      this.current[identifier2] = result;
    } else {
      if (Array.isArray(currentValue)) {
        currentValue.push(result);
      } else {
        const arrayValue = [currentValue];
        arrayValue.push(result);
        this.current[identifier2] = arrayValue;
      }
    }
    return result;
  }
  finish() {
    this.last = void 0;
  }
};

var ConfigurationParser = class {
  constructor(workspaceFolder, workspace, platform3, problemReporter, uuidMap) {
    this.workspaceFolder = workspaceFolder;
    this.workspace = workspace;
    this.platform = platform3;
    this.problemReporter = problemReporter;
    this.uuidMap = uuidMap;
  }
  run(fileConfig, source, contextKeyService) {
    const engine = ExecutionEngine2.from(fileConfig);
    const schemaVersion = JsonSchemaVersion2.from(fileConfig);
    const context2 = {
      workspaceFolder: this.workspaceFolder,
      workspace: this.workspace,
      problemReporter: this.problemReporter,
      uuidMap: this.uuidMap,
      namedProblemMatchers: {},
      engine,
      schemaVersion,
      platform: this.platform,
      taskLoadIssues: [],
      contextKeyService
    };
    const taskParseResult = this.createTaskRunnerConfiguration(fileConfig, context2, source);
    return {
      validationStatus: this.problemReporter.status,
      custom: taskParseResult.custom,
      configured: taskParseResult.configured,
      engine
    };
  }
  createTaskRunnerConfiguration(fileConfig, context2, source) {
    const globals = Globals.from(fileConfig, context2);
    if (this.problemReporter.status.isFatal()) {
      return { custom: [], configured: [] };
    }
    context2.namedProblemMatchers = ProblemMatcherConverter.namedFrom(fileConfig.declares, context2);
    let globalTasks = void 0;
    let externalGlobalTasks = void 0;
    if (fileConfig.windows && context2.platform === 3 /* Windows */) {
      globalTasks = TaskParser.from(fileConfig.windows.tasks, globals, context2, source).custom;
      externalGlobalTasks = fileConfig.windows.tasks;
    } else if (fileConfig.osx && context2.platform === 1 /* Mac */) {
      globalTasks = TaskParser.from(fileConfig.osx.tasks, globals, context2, source).custom;
      externalGlobalTasks = fileConfig.osx.tasks;
    } else if (fileConfig.linux && context2.platform === 2 /* Linux */) {
      globalTasks = TaskParser.from(fileConfig.linux.tasks, globals, context2, source).custom;
      externalGlobalTasks = fileConfig.linux.tasks;
    }
    if (context2.schemaVersion === 2 /* V2_0_0 */ && globalTasks && globalTasks.length > 0 && externalGlobalTasks && externalGlobalTasks.length > 0) {
      const taskContent = [];
      for (const task of externalGlobalTasks) {
        taskContent.push(JSON.stringify(task, null, 4));
      }
      context2.problemReporter.error(
        localize(
          19879,
          null,
          taskContent.join("\n")
        )
      );
    }
    let result = { custom: [], configured: [] };
    if (fileConfig.tasks) {
      result = TaskParser.from(fileConfig.tasks, globals, context2, source);
    }
    if (globalTasks) {
      result.custom = TaskParser.assignTasks(result.custom, globalTasks);
    }
    if ((!result.custom || result.custom.length === 0) && (globals.command && globals.command.name)) {
      const matchers = ProblemMatcherConverter.from(fileConfig.problemMatcher, context2).value ?? [];
      const isBackground = fileConfig.isBackground ? !!fileConfig.isBackground : fileConfig.isWatching ? !!fileConfig.isWatching : void 0;
      const name = CommandString.value(globals.command.name);
      const task = new CustomTask(
        context2.uuidMap.getUUID(name),
        Object.assign({}, source, "workspace", { config: { index: -1, element: fileConfig, workspaceFolder: context2.workspaceFolder } }),
        name,
        CUSTOMIZED_TASK_TYPE,
        {
          name: void 0,
          runtime: void 0,
          presentation: void 0,
          suppressTaskName: true
        },
        false,
        { reevaluateOnRerun: true },
        {
          name,
          identifier: name,
          group: TaskGroup2.Build,
          isBackground,
          problemMatchers: matchers
        }
      );
      const taskGroupKind = GroupKind.from(fileConfig.group);
      if (taskGroupKind !== void 0) {
        task.configurationProperties.group = taskGroupKind;
      } else if (fileConfig.group === "none") {
        task.configurationProperties.group = void 0;
      }
      CustomTask2.fillGlobals(task, globals);
      CustomTask2.fillDefaults(task, context2);
      result.custom = [task];
    }
    result.custom = result.custom || [];
    result.configured = result.configured || [];
    return result;
  }
};

var uuidMaps = /* @__PURE__ */ new Map();

var recentUuidMaps = /* @__PURE__ */ new Map();

function parse13(workspaceFolder, workspace, platform3, configuration2, logger, source, contextKeyService, isRecents = false) {
  const recentOrOtherMaps = isRecents ? recentUuidMaps : uuidMaps;
  let selectedUuidMaps = recentOrOtherMaps.get(source);
  if (!selectedUuidMaps) {
    recentOrOtherMaps.set(source, /* @__PURE__ */ new Map());
    selectedUuidMaps = recentOrOtherMaps.get(source);
  }
  let uuidMap = selectedUuidMaps.get(workspaceFolder.uri.toString());
  if (!uuidMap) {
    uuidMap = new UUIDMap();
    selectedUuidMaps.set(workspaceFolder.uri.toString(), uuidMap);
  }
  try {
    uuidMap.start();
    return new ConfigurationParser(workspaceFolder, workspace, platform3, logger, uuidMap).run(configuration2, source, contextKeyService);
  } finally {
    uuidMap.finish();
  }
}

function createCustomTask(contributedTask, configuredProps) {
  return CustomTask2.createCustomTask(contributedTask, configuredProps);
}
export { assignProperty, fillProperty, _isEmpty, _assignProperties, _fillProperties, _fillDefaults, _freeze, parse13, createCustomTask, ITaskIdentifier2, CommandString2, EMPTY_ARRAY, RunOnOptions2, RunOptions2, InstancePolicy2, ShellConfiguration, CommandOptions2, CommandConfiguration, ProblemMatcherConverter, GroupKind, TaskDependency, DependsOrder2, ConfigurationProperties, label2, ConfiguringTask2, CustomTask2, TaskParser, Globals, ExecutionEngine2, JsonSchemaVersion2, UUIDMap, ConfigurationParser, uuidMaps, recentUuidMaps };
