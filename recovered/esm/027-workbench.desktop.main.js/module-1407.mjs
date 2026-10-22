// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/browser/mainThreadTask.ts
import { CommandOptions, ConfiguringTask, ContributedTask, CustomTask, PresentationOptions, RunOptions, TaskDefinition, TaskSourceKind } from "./module-1403.mjs";
import { generateUuid } from "./module-0190.mjs";
import { isString } from "./module-0010.mjs";
import { URI } from "./module-0032.mjs";
import { localize } from "./module-0001.mjs";
import { Disposable } from "./module-0012.mjs";
import { ExtHostContext, MainContext } from "./module-0921.mjs";
import { ConfigurationResolverExpression } from "./module-1406.mjs";
import { ErrorNoTelemetry } from "./module-0004.mjs";
import { platform } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { extHostNamedCustomer } from "./module-0919.mjs";
import { ITaskService } from "./module-1404.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IConfigurationResolverService } from "./module-1405.mjs";


// src/vs/workbench/api/browser/mainThreadTask.ts
var TaskExecutionDTO;

((TaskExecutionDTO2) => {
  function from(value2) {
    return {
      id: value2.id,
      task: TaskDTO.from(value2.task)
    };
  }
  TaskExecutionDTO2.from = from;
})(TaskExecutionDTO || (TaskExecutionDTO = {}));

var TaskProblemMatcherStartedDto;

((TaskProblemMatcherStartedDto2) => {
  function from(value2) {
    return {
      execution: {
        id: value2.execution.id,
        task: TaskDTO.from(value2.execution.task)
      }
    };
  }
  TaskProblemMatcherStartedDto2.from = from;
})(TaskProblemMatcherStartedDto || (TaskProblemMatcherStartedDto = {}));

var TaskProblemMatcherEndedDto;

((TaskProblemMatcherEndedDto2) => {
  function from(value2) {
    return {
      execution: {
        id: value2.execution.id,
        task: TaskDTO.from(value2.execution.task)
      },
      hasErrors: value2.hasErrors
    };
  }
  TaskProblemMatcherEndedDto2.from = from;
})(TaskProblemMatcherEndedDto || (TaskProblemMatcherEndedDto = {}));

var TaskProcessStartedDTO;

((TaskProcessStartedDTO2) => {
  function from(value2, processId) {
    return {
      id: value2.id,
      processId
    };
  }
  TaskProcessStartedDTO2.from = from;
})(TaskProcessStartedDTO || (TaskProcessStartedDTO = {}));

var TaskProcessEndedDTO;

((TaskProcessEndedDTO2) => {
  function from(value2, exitCode) {
    return {
      id: value2.id,
      exitCode
    };
  }
  TaskProcessEndedDTO2.from = from;
})(TaskProcessEndedDTO || (TaskProcessEndedDTO = {}));

var TaskDefinitionDTO;

((TaskDefinitionDTO2) => {
  function from(value2) {
    const result = Object.assign(/* @__PURE__ */ Object.create(null), value2);
    delete result._key;
    return result;
  }
  TaskDefinitionDTO2.from = from;
  function to(value2, executeOnly) {
    let result = TaskDefinition.createTaskIdentifier(value2, console);
    if (result === void 0 && executeOnly) {
      result = {
        _key: generateUuid(),
        type: "$executeOnly"
      };
    }
    return result;
  }
  TaskDefinitionDTO2.to = to;
})(TaskDefinitionDTO || (TaskDefinitionDTO = {}));

var TaskPresentationOptionsDTO;

((TaskPresentationOptionsDTO2) => {
  function from(value2) {
    if (value2 === void 0 || value2 === null) {
      return void 0;
    }
    return Object.assign(/* @__PURE__ */ Object.create(null), value2);
  }
  TaskPresentationOptionsDTO2.from = from;
  function to(value2) {
    if (value2 === void 0 || value2 === null) {
      return PresentationOptions.defaults;
    }
    return Object.assign(/* @__PURE__ */ Object.create(null), PresentationOptions.defaults, value2);
  }
  TaskPresentationOptionsDTO2.to = to;
})(TaskPresentationOptionsDTO || (TaskPresentationOptionsDTO = {}));

var RunOptionsDTO;

((RunOptionsDTO2) => {
  function from(value2) {
    if (value2 === void 0 || value2 === null) {
      return void 0;
    }
    return Object.assign(/* @__PURE__ */ Object.create(null), value2);
  }
  RunOptionsDTO2.from = from;
  function to(value2) {
    if (value2 === void 0 || value2 === null) {
      return RunOptions.defaults;
    }
    return Object.assign(/* @__PURE__ */ Object.create(null), RunOptions.defaults, value2);
  }
  RunOptionsDTO2.to = to;
})(RunOptionsDTO || (RunOptionsDTO = {}));

var ProcessExecutionOptionsDTO;

((ProcessExecutionOptionsDTO2) => {
  function from(value2) {
    if (value2 === void 0 || value2 === null) {
      return void 0;
    }
    return {
      cwd: value2.cwd,
      env: value2.env
    };
  }
  ProcessExecutionOptionsDTO2.from = from;
  function to(value2) {
    if (value2 === void 0 || value2 === null) {
      return CommandOptions.defaults;
    }
    return {
      cwd: value2.cwd || CommandOptions.defaults.cwd,
      env: value2.env
    };
  }
  ProcessExecutionOptionsDTO2.to = to;
})(ProcessExecutionOptionsDTO || (ProcessExecutionOptionsDTO = {}));

var ProcessExecutionDTO;

((ProcessExecutionDTO2) => {
  function is(value2) {
    const candidate = value2;
    return candidate && !!candidate.process;
  }
  ProcessExecutionDTO2.is = is;
  function from(value2) {
    const process3 = isString(value2.name) ? value2.name : value2.name.value;
    const args2 = value2.args ? value2.args.map((value3) => isString(value3) ? value3 : value3.value) : [];
    const result = {
      process: process3,
      args: args2
    };
    if (value2.options) {
      result.options = ProcessExecutionOptionsDTO.from(value2.options);
    }
    return result;
  }
  ProcessExecutionDTO2.from = from;
  function to(value2) {
    const result = {
      runtime: 2 /* Process */,
      name: value2.process,
      args: value2.args,
      presentation: void 0
    };
    result.options = ProcessExecutionOptionsDTO.to(value2.options);
    return result;
  }
  ProcessExecutionDTO2.to = to;
})(ProcessExecutionDTO || (ProcessExecutionDTO = {}));

var ShellExecutionOptionsDTO;

((ShellExecutionOptionsDTO2) => {
  function from(value2) {
    if (value2 === void 0 || value2 === null) {
      return void 0;
    }
    const result = {
      cwd: value2.cwd || CommandOptions.defaults.cwd,
      env: value2.env
    };
    if (value2.shell) {
      result.executable = value2.shell.executable;
      result.shellArgs = value2.shell.args;
      result.shellQuoting = value2.shell.quoting;
    }
    return result;
  }
  ShellExecutionOptionsDTO2.from = from;
  function to(value2) {
    if (value2 === void 0 || value2 === null) {
      return void 0;
    }
    const result = {
      cwd: value2.cwd,
      env: value2.env
    };
    if (value2.executable) {
      result.shell = {
        executable: value2.executable
      };
      if (value2.shellArgs) {
        result.shell.args = value2.shellArgs;
      }
      if (value2.shellQuoting) {
        result.shell.quoting = value2.shellQuoting;
      }
    }
    return result;
  }
  ShellExecutionOptionsDTO2.to = to;
})(ShellExecutionOptionsDTO || (ShellExecutionOptionsDTO = {}));

var ShellExecutionDTO;

((ShellExecutionDTO2) => {
  function is(value2) {
    const candidate = value2;
    return candidate && (!!candidate.commandLine || !!candidate.command);
  }
  ShellExecutionDTO2.is = is;
  function from(value2) {
    const result = {};
    if (value2.name && isString(value2.name) && (value2.args === void 0 || value2.args === null || value2.args.length === 0)) {
      result.commandLine = value2.name;
    } else {
      result.command = value2.name;
      result.args = value2.args;
    }
    if (value2.options) {
      result.options = ShellExecutionOptionsDTO.from(value2.options);
    }
    return result;
  }
  ShellExecutionDTO2.from = from;
  function to(value2) {
    const result = {
      runtime: 1 /* Shell */,
      name: value2.commandLine ? value2.commandLine : value2.command,
      args: value2.args,
      presentation: void 0
    };
    if (value2.options) {
      result.options = ShellExecutionOptionsDTO.to(value2.options);
    }
    return result;
  }
  ShellExecutionDTO2.to = to;
})(ShellExecutionDTO || (ShellExecutionDTO = {}));

var CustomExecutionDTO;

((CustomExecutionDTO2) => {
  function is(value2) {
    const candidate = value2;
    return candidate && candidate.customExecution === "customExecution";
  }
  CustomExecutionDTO2.is = is;
  function from(value2) {
    return {
      customExecution: "customExecution"
    };
  }
  CustomExecutionDTO2.from = from;
  function to(value2) {
    return {
      runtime: 3 /* CustomExecution */,
      presentation: void 0
    };
  }
  CustomExecutionDTO2.to = to;
})(CustomExecutionDTO || (CustomExecutionDTO = {}));

var TaskSourceDTO;

((TaskSourceDTO2) => {
  function from(value2) {
    const result = {
      label: value2.label
    };
    if (value2.kind === TaskSourceKind.Extension) {
      result.extensionId = value2.extension;
      if (value2.workspaceFolder) {
        result.scope = value2.workspaceFolder.uri;
      } else {
        result.scope = value2.scope;
      }
    } else if (value2.kind === TaskSourceKind.Workspace) {
      result.extensionId = "$core";
      result.scope = value2.config.workspaceFolder ? value2.config.workspaceFolder.uri : 1 /* Global */;
    }
    return result;
  }
  TaskSourceDTO2.from = from;
  function to(value2, workspace) {
    let scope;
    let workspaceFolder;
    if (value2.scope === void 0 || typeof value2.scope === "number" && value2.scope !== 1 /* Global */) {
      if (workspace.getWorkspace().folders.length === 0) {
        scope = 1 /* Global */;
        workspaceFolder = void 0;
      } else {
        scope = 3 /* Folder */;
        workspaceFolder = workspace.getWorkspace().folders[0];
      }
    } else if (typeof value2.scope === "number") {
      scope = value2.scope;
    } else {
      scope = 3 /* Folder */;
      workspaceFolder = workspace.getWorkspaceFolder(URI.revive(value2.scope)) ?? void 0;
    }
    const result = {
      kind: TaskSourceKind.Extension,
      label: value2.label,
      extension: value2.extensionId,
      scope,
      workspaceFolder
    };
    return result;
  }
  TaskSourceDTO2.to = to;
})(TaskSourceDTO || (TaskSourceDTO = {}));

var TaskHandleDTO;

((TaskHandleDTO2) => {
  function is(value2) {
    const candidate = value2;
    return !!candidate && isString(candidate.id) && !!candidate.workspaceFolder;
  }
  TaskHandleDTO2.is = is;
})(TaskHandleDTO || (TaskHandleDTO = {}));

var TaskDTO;

((TaskDTO2) => {
  function from(task) {
    if (task === void 0 || task === null || !CustomTask.is(task) && !ContributedTask.is(task) && !ConfiguringTask.is(task)) {
      return void 0;
    }
    const result = {
      _id: task._id,
      name: task.configurationProperties.name,
      definition: TaskDefinitionDTO.from(task.getDefinition(true)),
      source: TaskSourceDTO.from(task._source),
      execution: void 0,
      presentationOptions: !ConfiguringTask.is(task) && task.command ? TaskPresentationOptionsDTO.from(task.command.presentation) : void 0,
      isBackground: task.configurationProperties.isBackground,
      problemMatchers: [],
      hasDefinedMatchers: ContributedTask.is(task) ? task.hasDefinedMatchers : false,
      runOptions: RunOptionsDTO.from(task.runOptions)
    };
    result.group = TaskGroupDTO.from(task.configurationProperties.group);
    if (task.configurationProperties.detail) {
      result.detail = task.configurationProperties.detail;
    }
    if (!ConfiguringTask.is(task) && task.command) {
      switch (task.command.runtime) {
        case 2 /* Process */:
          result.execution = ProcessExecutionDTO.from(task.command);
          break;
        case 1 /* Shell */:
          result.execution = ShellExecutionDTO.from(task.command);
          break;
        case 3 /* CustomExecution */:
          result.execution = CustomExecutionDTO.from(task.command);
          break;
      }
    }
    if (task.configurationProperties.problemMatchers) {
      for (const matcher of task.configurationProperties.problemMatchers) {
        if (isString(matcher)) {
          result.problemMatchers.push(matcher);
        }
      }
    }
    return result;
  }
  TaskDTO2.from = from;
  function to(task, workspace, executeOnly, icon2, hide4) {
    if (!task || typeof task.name !== "string") {
      return void 0;
    }
    let command4;
    if (task.execution) {
      if (ShellExecutionDTO.is(task.execution)) {
        command4 = ShellExecutionDTO.to(task.execution);
      } else if (ProcessExecutionDTO.is(task.execution)) {
        command4 = ProcessExecutionDTO.to(task.execution);
      } else if (CustomExecutionDTO.is(task.execution)) {
        command4 = CustomExecutionDTO.to(task.execution);
      }
    }
    if (!command4) {
      return void 0;
    }
    command4.presentation = TaskPresentationOptionsDTO.to(task.presentationOptions);
    const source = TaskSourceDTO.to(task.source, workspace);
    const label3 = localize(5735, null, source.label, task.name);
    const definition = TaskDefinitionDTO.to(task.definition, executeOnly);
    const id2 = CustomExecutionDTO.is(task.execution) && task._id ? task._id : `${task.source.extensionId}.${definition._key}`;
    const result = new ContributedTask(
      id2,
      // uuidMap.getUUID(identifier)
      source,
      label3,
      definition.type,
      definition,
      command4,
      task.hasDefinedMatchers,
      RunOptionsDTO.to(task.runOptions),
      {
        name: task.name,
        identifier: label3,
        group: task.group,
        isBackground: !!task.isBackground,
        problemMatchers: task.problemMatchers.slice(),
        detail: task.detail,
        icon: icon2,
        hide: hide4
      }
    );
    return result;
  }
  TaskDTO2.to = to;
})(TaskDTO || (TaskDTO = {}));

var TaskGroupDTO;

((TaskGroupDTO2) => {
  function from(value2) {
    if (value2 === void 0) {
      return void 0;
    }
    return {
      _id: typeof value2 === "string" ? value2 : value2._id,
      isDefault: typeof value2 === "string" ? false : typeof value2.isDefault === "string" ? false : value2.isDefault
    };
  }
  TaskGroupDTO2.from = from;
})(TaskGroupDTO || (TaskGroupDTO = {}));

var TaskFilterDTO;

((TaskFilterDTO2) => {
  function from(value2) {
    return value2;
  }
  TaskFilterDTO2.from = from;
  function to(value2) {
    return value2;
  }
  TaskFilterDTO2.to = to;
})(TaskFilterDTO || (TaskFilterDTO = {}));

var MainThreadTask = class extends Disposable {
  constructor(extHostContext, _taskService, _workspaceContextServer, _configurationResolverService) {
    super();
    this._taskService = _taskService;
    this._workspaceContextServer = _workspaceContextServer;
    this._configurationResolverService = _configurationResolverService;
    this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostTask);
    this._providers = /* @__PURE__ */ new Map();
    this._register(this._taskService.onDidStateChange(async (event) => {
      if (event.kind === "changed" /* Changed */) {
        return;
      }
      const task = event.__task;
      if (event.kind === "start" /* Start */) {
        const execution = TaskExecutionDTO.from(task.getTaskExecution());
        let resolvedDefinition = execution.task.definition;
        if (execution.task?.execution && CustomExecutionDTO.is(execution.task.execution) && event.resolvedVariables) {
          const expr = ConfigurationResolverExpression.parse(execution.task.definition);
          for (const replacement of expr.unresolved()) {
            const value2 = event.resolvedVariables.get(replacement.inner);
            if (value2 !== void 0) {
              expr.resolve(replacement, value2);
            }
          }
          resolvedDefinition = await this._configurationResolverService.resolveAsync(task.getWorkspaceFolder(), expr);
        }
        this._proxy.$onDidStartTask(execution, event.terminalId, resolvedDefinition);
      } else if (event.kind === "processStarted" /* ProcessStarted */) {
        this._proxy.$onDidStartTaskProcess(TaskProcessStartedDTO.from(task.getTaskExecution(), event.processId));
      } else if (event.kind === "processEnded" /* ProcessEnded */) {
        this._proxy.$onDidEndTaskProcess(TaskProcessEndedDTO.from(task.getTaskExecution(), event.exitCode));
      } else if (event.kind === "end" /* End */) {
        this._proxy.$OnDidEndTask(TaskExecutionDTO.from(task.getTaskExecution()));
      } else if (event.kind === "problemMatcherStarted" /* ProblemMatcherStarted */) {
        this._proxy.$onDidStartTaskProblemMatchers(TaskProblemMatcherStartedDto.from({ execution: task.getTaskExecution() }));
      } else if (event.kind === "problemMatcherEnded" /* ProblemMatcherEnded */) {
        this._proxy.$onDidEndTaskProblemMatchers(TaskProblemMatcherEndedDto.from({ execution: task.getTaskExecution(), hasErrors: false }));
      } else if (event.kind === "problemMatcherFoundErrors" /* ProblemMatcherFoundErrors */) {
        this._proxy.$onDidEndTaskProblemMatchers(TaskProblemMatcherEndedDto.from({ execution: task.getTaskExecution(), hasErrors: true }));
      }
    }));
  }
  dispose() {
    for (const value2 of this._providers.values()) {
      value2.disposable.dispose();
    }
    this._providers.clear();
    super.dispose();
  }
  $createTaskId(taskDTO) {
    return new Promise((resolve3, reject) => {
      const task = TaskDTO.to(taskDTO, this._workspaceContextServer, true);
      if (task) {
        resolve3(task._id);
      } else {
        reject(new Error("Task could not be created from DTO"));
      }
    });
  }
  $registerTaskProvider(handle2, type) {
    const provider = {
      provideTasks: (validTypes) => {
        return Promise.resolve(this._proxy.$provideTasks(handle2, validTypes)).then((value2) => {
          const tasks2 = [];
          for (const dto of value2.tasks) {
            const task = TaskDTO.to(dto, this._workspaceContextServer, true);
            if (task) {
              tasks2.push(task);
            } else {
              console.error(`Task System: can not convert task: ${JSON.stringify(dto.definition, void 0, 0)}. Task will be dropped`);
            }
          }
          const processedExtension = {
            ...value2.extension,
            extensionLocation: URI.revive(value2.extension.extensionLocation)
          };
          return {
            tasks: tasks2,
            extension: processedExtension
          };
        });
      },
      resolveTask: (task) => {
        const dto = TaskDTO.from(task);
        if (dto) {
          dto.name = dto.name === void 0 ? "" : dto.name;
          return Promise.resolve(this._proxy.$resolveTask(handle2, dto)).then((resolvedTask) => {
            if (resolvedTask) {
              return TaskDTO.to(resolvedTask, this._workspaceContextServer, true, task.configurationProperties.icon, task.configurationProperties.hide);
            }
            return void 0;
          });
        }
        return Promise.resolve(void 0);
      }
    };
    const disposable = this._taskService.registerTaskProvider(provider, type);
    this._providers.set(handle2, { disposable, provider });
    return Promise.resolve(void 0);
  }
  $unregisterTaskProvider(handle2) {
    const provider = this._providers.get(handle2);
    if (provider) {
      provider.disposable.dispose();
      this._providers.delete(handle2);
    }
    return Promise.resolve(void 0);
  }
  $fetchTasks(filter2) {
    return this._taskService.tasks(TaskFilterDTO.to(filter2)).then((tasks2) => {
      const result = [];
      for (const task of tasks2) {
        const item = TaskDTO.from(task);
        if (item) {
          result.push(item);
        }
      }
      return result;
    });
  }
  getWorkspace(value2) {
    let workspace;
    if (typeof value2 === "string") {
      workspace = value2;
    } else {
      const workspaceObject = this._workspaceContextServer.getWorkspace();
      const uri5 = URI.revive(value2);
      if (workspaceObject.configuration?.toString() === uri5.toString()) {
        workspace = workspaceObject;
      } else {
        workspace = this._workspaceContextServer.getWorkspaceFolder(uri5);
      }
    }
    return workspace;
  }
  async $getTaskExecution(value2) {
    if (TaskHandleDTO.is(value2)) {
      const workspace = this.getWorkspace(value2.workspaceFolder);
      if (workspace) {
        const task = await this._taskService.getTask(workspace, value2.id, true);
        if (task) {
          return {
            id: task._id,
            task: TaskDTO.from(task)
          };
        }
        throw new Error("Task not found");
      } else {
        throw new Error("No workspace folder");
      }
    } else {
      const task = TaskDTO.to(value2, this._workspaceContextServer, true);
      return {
        id: task._id,
        task: TaskDTO.from(task)
      };
    }
  }
  // Passing in a TaskHandleDTO will cause the task to get re-resolved, which is important for tasks are coming from the core,
  // such as those gotten from a fetchTasks, since they can have missing configuration properties.
  $executeTask(value2) {
    return new Promise((resolve3, reject) => {
      if (TaskHandleDTO.is(value2)) {
        const workspace = this.getWorkspace(value2.workspaceFolder);
        if (workspace) {
          this._taskService.getTask(workspace, value2.id, true).then((task) => {
            if (!task) {
              reject(new Error("Task not found"));
            } else {
              const result = {
                id: value2.id,
                task: TaskDTO.from(task)
              };
              this._taskService.run(task).then((summary) => {
                if (summary?.exitCode === void 0 || summary.exitCode !== 0) {
                  this._proxy.$OnDidEndTask(result);
                }
              }, (reason) => {
              });
              resolve3(result);
            }
          }, (_error) => {
            reject(new Error("Task not found"));
          });
        } else {
          reject(new Error("No workspace folder"));
        }
      } else {
        const task = TaskDTO.to(value2, this._workspaceContextServer, true);
        this._taskService.run(task).then(void 0, (reason) => {
        });
        const result = {
          id: task._id,
          task: TaskDTO.from(task)
        };
        resolve3(result);
      }
    });
  }
  $customExecutionComplete(id2, result) {
    return new Promise((resolve3, reject) => {
      this._taskService.getActiveTasks().then((tasks2) => {
        for (const task of tasks2) {
          if (id2 === task._id) {
            this._taskService.extensionCallbackTaskComplete(task, result).then((value2) => {
              resolve3(void 0);
            }, (error) => {
              reject(error);
            });
            return;
          }
        }
        reject(new Error("Task to mark as complete not found"));
      });
    });
  }
  $terminateTask(id2) {
    return new Promise((resolve3, reject) => {
      this._taskService.getActiveTasks().then((tasks2) => {
        for (const task of tasks2) {
          if (id2 === task._id) {
            this._taskService.terminate(task).then((value2) => {
              resolve3(void 0);
            }, (error) => {
              reject(void 0);
            });
            return;
          }
        }
        reject(new ErrorNoTelemetry("Task to terminate not found"));
      });
    });
  }
  $registerTaskSystem(key3, info) {
    let platform3;
    switch (info.platform) {
      case "Web":
        platform3 = 0 /* Web */;
        break;
      case "win32":
        platform3 = 3 /* Windows */;
        break;
      case "darwin":
        platform3 = 1 /* Mac */;
        break;
      case "linux":
        platform3 = 2 /* Linux */;
        break;
      default:
        platform3 = platform;
    }
    this._taskService.registerTaskSystem(key3, {
      platform: platform3,
      uriProvider: (path) => {
        return URI.from({ scheme: info.scheme, authority: info.authority, path });
      },
      context: this._extHostContext,
      resolveVariables: (workspaceFolder, toResolve, target) => {
        const vars = [];
        toResolve.variables.forEach((item) => vars.push(item));
        return Promise.resolve(this._proxy.$resolveVariables(workspaceFolder.uri, { process: toResolve.process, variables: vars })).then((values) => {
          const partiallyResolvedVars = Array.from(Object.values(values.variables));
          return new Promise((resolve3, reject) => {
            this._configurationResolverService.resolveWithInteraction(workspaceFolder, partiallyResolvedVars, "tasks", void 0, target).then((resolvedVars) => {
              if (!resolvedVars) {
                resolve3(void 0);
              }
              const result = {
                process: void 0,
                variables: /* @__PURE__ */ new Map()
              };
              for (let i2 = 0; i2 < partiallyResolvedVars.length; i2++) {
                const variableName = vars[i2].substring(2, vars[i2].length - 1);
                if (resolvedVars && values.variables[vars[i2]] === vars[i2]) {
                  const resolved = resolvedVars.get(variableName);
                  if (typeof resolved === "string") {
                    result.variables.set(variableName, resolved);
                  }
                } else {
                  result.variables.set(variableName, partiallyResolvedVars[i2]);
                }
              }
              if (isString(values.process)) {
                result.process = values.process;
              }
              resolve3(result);
            }, (reason) => {
              reject(reason);
            });
          });
        });
      },
      findExecutable: (command4, cwd2, paths) => {
        return this._proxy.$findExecutable(command4, cwd2, paths);
      }
    });
  }
  async $registerSupportedExecutions(custom, shell, process3) {
    return this._taskService.registerSupportedExecutions(custom, shell, process3);
  }
};

MainThreadTask = __decorateClass([
  extHostNamedCustomer(MainContext.MainThreadTask),
  __decorateParam(1, ITaskService),
  __decorateParam(2, IWorkspaceContextService),
  __decorateParam(3, IConfigurationResolverService)
], MainThreadTask);
export { TaskExecutionDTO, TaskProblemMatcherStartedDto, TaskProblemMatcherEndedDto, TaskProcessStartedDTO, TaskProcessEndedDTO, TaskDefinitionDTO, TaskPresentationOptionsDTO, RunOptionsDTO, ProcessExecutionOptionsDTO, ProcessExecutionDTO, ShellExecutionOptionsDTO, ShellExecutionDTO, CustomExecutionDTO, TaskSourceDTO, TaskHandleDTO, TaskDTO, TaskGroupDTO, TaskFilterDTO, MainThreadTask };
