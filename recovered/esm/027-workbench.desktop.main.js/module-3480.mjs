// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/tasks/browser/task.contribution.ts
import { Registry } from "./module-0090.mjs";
import { Extensions10, WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0870.mjs";
import { ManageAutomaticTaskRunning, RunAutomaticTasks } from "./module-3465.mjs";
import { Action2, MenuId, MenuRegistry, registerAction2 } from "./module-0092.mjs";
import { RerunAllRunningTasksCommandId, RerunForActiveTerminalCommandId, TASKS_CATEGORY, TASK_RUNNING_STATE, TASK_TERMINAL_ACTIVE, TaskGroup2, rerunTaskIcon } from "./module-1403.mjs";
import { ITaskService, TaskCommandsRegistered, TaskExecutionSupportedContext } from "./module-1404.mjs";
import { Disposable } from "./module-0012.mjs";
import { promiseWithResolvers } from "./module-0036.mjs";
import { localize, localize2 } from "./module-0001.mjs";
import { isString } from "./module-0010.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IStatusbarService } from "./module-0893.mjs";
import { IProgressService } from "./module-0446.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";
import { WorkbenchStateContext } from "./module-0949.mjs";
import { AbstractTaskService, ConfigureTaskAction } from "./module-3478.mjs";
import { KeybindingsRegistry } from "./module-0091.mjs";
import { Extensions15 } from "./module-1245.mjs";
import { Extensions18 } from "./module-1560.mjs";
import { TasksQuickAccessProvider } from "./module-3479.mjs";
import { tasksSchemaId } from "./module-1198.mjs";
import { jsonSchema_v1_default } from "./module-3467.mjs";
import { jsonSchema_v2_default, updateProblemMatchers, updateTaskDefinitions } from "./module-3468.mjs";
import { Extensions3 } from "./module-0138.mjs";
import { ProblemMatcherRegistry } from "./module-3464.mjs";
import { TaskDefinitionRegistry } from "./module-1402.mjs";
import { Extensions4 } from "./module-0140.mjs";
import { TerminalContextKeys } from "./module-1176.mjs";
import { ITerminalService } from "./module-1149.mjs";


// src/vs/workbench/contrib/tasks/browser/task.contribution.ts
var workbenchRegistry4 = Registry.as(Extensions10.Workbench);

workbenchRegistry4.registerWorkbenchContribution(RunAutomaticTasks, 4 /* Eventually */);

registerAction2(ManageAutomaticTaskRunning);

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: ManageAutomaticTaskRunning.ID,
    title: ManageAutomaticTaskRunning.LABEL,
    category: TASKS_CATEGORY
  },
  when: TaskExecutionSupportedContext
});

var TaskStatusBarContributions = class extends Disposable {
  constructor(_taskService, _statusbarService, _progressService) {
    super();
    this._taskService = _taskService;
    this._statusbarService = _statusbarService;
    this._progressService = _progressService;
    this._activeTasksCount = 0;
    this._registerListeners();
  }
  _registerListeners() {
    let promise = void 0;
    let resolve3;
    this._register(this._taskService.onDidStateChange((event) => {
      if (event.kind === "changed" /* Changed */) {
        this._updateRunningTasksStatus();
      }
      if (!this._ignoreEventForUpdateRunningTasksCount(event)) {
        switch (event.kind) {
          case "active" /* Active */:
            this._activeTasksCount++;
            if (this._activeTasksCount === 1) {
              if (!promise) {
                ({ promise, resolve: resolve3 } = promiseWithResolvers());
              }
            }
            break;
          case "inactive" /* Inactive */:
            if (this._activeTasksCount > 0) {
              this._activeTasksCount--;
              if (this._activeTasksCount === 0) {
                if (promise && resolve3) {
                  resolve3();
                }
              }
            }
            break;
          case "terminated" /* Terminated */:
            if (this._activeTasksCount !== 0) {
              this._activeTasksCount = 0;
              if (promise && resolve3) {
                resolve3();
              }
            }
            break;
        }
      }
      if (promise && event.kind === "active" /* Active */ && this._activeTasksCount === 1) {
        this._progressService.withProgress({ location: 10 /* Window */, command: "workbench.action.tasks.showTasks" }, (progress) => {
          progress.report({ message: localize(19581, null) });
          return promise;
        }).then(() => {
          promise = void 0;
        });
      }
    }));
  }
  async _updateRunningTasksStatus() {
    const tasks2 = await this._taskService.getActiveTasks();
    if (tasks2.length === 0) {
      if (this._runningTasksStatusItem) {
        this._runningTasksStatusItem.dispose();
        this._runningTasksStatusItem = void 0;
      }
    } else {
      const itemProps = {
        name: localize(19599, null),
        text: `$(tools) ${tasks2.length}`,
        ariaLabel: localize(19591, null, tasks2.length),
        tooltip: localize(19595, null),
        command: "workbench.action.tasks.showTasks"
      };
      if (!this._runningTasksStatusItem) {
        this._runningTasksStatusItem = this._statusbarService.addEntry(itemProps, "status.runningTasks", 0 /* LEFT */, { location: { id: "status.problems", priority: 50 }, alignment: 1 /* RIGHT */ });
      } else {
        this._runningTasksStatusItem.update(itemProps);
      }
    }
  }
  _ignoreEventForUpdateRunningTasksCount(event) {
    if (!this._taskService.inTerminal() || event.kind === "changed" /* Changed */) {
      return false;
    }
    if ((isString(event.group) ? event.group : event.group?._id) !== TaskGroup2.Build._id) {
      return true;
    }
    return event.__task.configurationProperties.problemMatchers === void 0 || event.__task.configurationProperties.problemMatchers.length === 0;
  }
};

TaskStatusBarContributions = __decorateClass([
  __decorateParam(0, ITaskService),
  __decorateParam(1, IStatusbarService),
  __decorateParam(2, IProgressService)
], TaskStatusBarContributions);

workbenchRegistry4.registerWorkbenchContribution(TaskStatusBarContributions, 3 /* Restored */);

MenuRegistry.appendMenuItem(MenuId.MenubarTerminalMenu, {
  group: "3_run" /* Run */,
  command: {
    id: "workbench.action.tasks.runTask",
    title: localize(19589, null)
  },
  order: 1,
  when: TaskExecutionSupportedContext
});

MenuRegistry.appendMenuItem(MenuId.MenubarTerminalMenu, {
  group: "3_run" /* Run */,
  command: {
    id: "workbench.action.tasks.build",
    title: localize(19584, null)
  },
  order: 2,
  when: TaskExecutionSupportedContext
});

MenuRegistry.appendMenuItem(MenuId.MenubarTerminalMenu, {
  group: "5_manage" /* Manage */,
  command: {
    precondition: TASK_RUNNING_STATE,
    id: "workbench.action.tasks.showTasks",
    title: localize(19588, null)
  },
  order: 1,
  when: TaskExecutionSupportedContext
});

MenuRegistry.appendMenuItem(MenuId.MenubarTerminalMenu, {
  group: "5_manage" /* Manage */,
  command: {
    precondition: TASK_RUNNING_STATE,
    id: "workbench.action.tasks.restartTask",
    title: localize(19587, null)
  },
  order: 2,
  when: TaskExecutionSupportedContext
});

MenuRegistry.appendMenuItem(MenuId.MenubarTerminalMenu, {
  group: "5_manage" /* Manage */,
  command: {
    precondition: TASK_RUNNING_STATE,
    id: "workbench.action.tasks.terminate",
    title: localize(19590, null)
  },
  order: 3,
  when: TaskExecutionSupportedContext
});

MenuRegistry.appendMenuItem(MenuId.MenubarTerminalMenu, {
  group: "7_configure" /* Configure */,
  command: {
    id: "workbench.action.tasks.configureTaskRunner",
    title: localize(19586, null)
  },
  order: 1,
  when: TaskExecutionSupportedContext
});

MenuRegistry.appendMenuItem(MenuId.MenubarTerminalMenu, {
  group: "7_configure" /* Configure */,
  command: {
    id: "workbench.action.tasks.configureDefaultBuildTask",
    title: localize(19585, null)
  },
  order: 2,
  when: TaskExecutionSupportedContext
});

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: "workbench.action.tasks.openWorkspaceFileTasks",
    title: localize2(19628, "Open Workspace Tasks"),
    category: TASKS_CATEGORY
  },
  when: ContextKeyExpr.and(WorkbenchStateContext.isEqualTo("workspace"), TaskExecutionSupportedContext)
});

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: ConfigureTaskAction.ID,
    title: ConfigureTaskAction.TEXT,
    category: TASKS_CATEGORY
  },
  when: TaskExecutionSupportedContext
});

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: "workbench.action.tasks.showLog",
    title: localize2(19597, "Show Task Log"),
    category: TASKS_CATEGORY
  },
  when: TaskExecutionSupportedContext
});

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: "workbench.action.tasks.runTask",
    title: localize2(19596, "Run Task"),
    category: TASKS_CATEGORY
  }
});

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: "workbench.action.tasks.reRunTask",
    title: localize2(19593, "Rerun Last Task"),
    category: TASKS_CATEGORY
  },
  when: TaskExecutionSupportedContext
});

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: "workbench.action.tasks.restartTask",
    title: localize2(19594, "Restart Running Task"),
    category: TASKS_CATEGORY
  },
  when: TaskExecutionSupportedContext
});

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: RerunAllRunningTasksCommandId,
    title: localize2(19592, "Rerun All Running Tasks"),
    category: TASKS_CATEGORY
  },
  when: TaskExecutionSupportedContext
});

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: "workbench.action.tasks.showTasks",
    title: localize2(19598, "Show Running Tasks"),
    category: TASKS_CATEGORY
  },
  when: TaskExecutionSupportedContext
});

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: "workbench.action.tasks.terminate",
    title: localize2(19625, "Terminate Task"),
    category: TASKS_CATEGORY
  },
  when: TaskExecutionSupportedContext
});

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: "workbench.action.tasks.build",
    title: localize2(19580, "Run Build Task"),
    category: TASKS_CATEGORY
  },
  when: TaskExecutionSupportedContext
});

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: "workbench.action.tasks.test",
    title: localize2(19626, "Run Test Task"),
    category: TASKS_CATEGORY
  },
  when: TaskExecutionSupportedContext
});

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: "workbench.action.tasks.configureDefaultBuildTask",
    title: localize2(19582, "Configure Default Build Task"),
    category: TASKS_CATEGORY
  },
  when: TaskExecutionSupportedContext
});

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: "workbench.action.tasks.configureDefaultTestTask",
    title: localize2(19583, "Configure Default Test Task"),
    category: TASKS_CATEGORY
  },
  when: TaskExecutionSupportedContext
});

MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
  command: {
    id: "workbench.action.tasks.openUserTasks",
    title: localize2(19627, "Open User Tasks"),
    category: TASKS_CATEGORY
  },
  when: TaskExecutionSupportedContext
});

var UserTasksGlobalActionContribution = class extends Disposable {
  constructor() {
    super();
    this.registerActions();
  }
  registerActions() {
    const id2 = "workbench.action.tasks.openUserTasks";
    const title = localize(19621, null);
    this._register(MenuRegistry.appendMenuItem(MenuId.GlobalActivity, {
      command: {
        id: id2,
        title
      },
      when: TaskExecutionSupportedContext,
      group: "2_configuration",
      order: 6
    }));
    this._register(MenuRegistry.appendMenuItem(MenuId.MenubarPreferencesMenu, {
      command: {
        id: id2,
        title
      },
      when: TaskExecutionSupportedContext,
      group: "2_configuration",
      order: 6
    }));
  }
};

workbenchRegistry4.registerWorkbenchContribution(UserTasksGlobalActionContribution, 3 /* Restored */);

KeybindingsRegistry.registerKeybindingRule({
  id: "workbench.action.tasks.build",
  weight: 200 /* WorkbenchContrib */,
  when: TaskCommandsRegistered,
  primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 32 /* KeyB */
});

var outputChannelRegistry = Registry.as(Extensions15.OutputChannels);

outputChannelRegistry.registerChannel({ id: AbstractTaskService.OutputChannelId, label: AbstractTaskService.OutputChannelLabel, log: false });

var quickAccessRegistry6 = Registry.as(Extensions18.Quickaccess);

var tasksPickerContextKey = "inTasksPicker";

quickAccessRegistry6.registerQuickAccessProvider({
  ctor: TasksQuickAccessProvider,
  prefix: TasksQuickAccessProvider.PREFIX,
  contextKey: tasksPickerContextKey,
  placeholder: localize(19624, null),
  helpEntries: [{ description: localize(19623, null), commandCenterOrder: 60 }]
});

var schema9 = {
  id: tasksSchemaId,
  description: "Task definition file",
  type: "object",
  allowTrailingCommas: true,
  allowComments: true,
  default: {
    version: "2.0.0",
    tasks: [
      {
        label: "My Task",
        command: "echo hello",
        type: "shell",
        args: [],
        problemMatcher: ["$tsc"],
        presentation: {
          reveal: "always"
        },
        group: "build"
      }
    ]
  }
};

schema9.definitions = {
  ...jsonSchema_v1_default.definitions,
  ...jsonSchema_v2_default.definitions
};

schema9.oneOf = [...jsonSchema_v2_default.oneOf || [], ...jsonSchema_v1_default.oneOf || []];

var jsonRegistry6 = Registry.as(Extensions3.JSONContribution);

jsonRegistry6.registerSchema(tasksSchemaId, schema9);

var TaskRegistryContribution = class extends Disposable {
  static {
    this.ID = "taskRegistryContribution";
  }
  constructor() {
    super();
    this._register(ProblemMatcherRegistry.onMatcherChanged(() => {
      updateProblemMatchers();
      jsonRegistry6.notifySchemaChanged(tasksSchemaId);
    }));
    this._register(TaskDefinitionRegistry.onDefinitionsChanged(() => {
      updateTaskDefinitions();
      jsonRegistry6.notifySchemaChanged(tasksSchemaId);
    }));
  }
};

registerWorkbenchContribution2(TaskRegistryContribution.ID, TaskRegistryContribution, WorkbenchPhase.AfterRestored);

var configurationRegistry19 = Registry.as(Extensions4.Configuration);

configurationRegistry19.registerConfiguration({
  id: "task",
  order: 100,
  title: localize(19622, null),
  type: "object",
  properties: {
    ["task.problemMatchers.neverPrompt" /* ProblemMatchersNeverPrompt */]: {
      markdownDescription: localize(19605, null),
      "oneOf": [
        {
          type: "boolean",
          markdownDescription: localize(19607, null)
        },
        {
          type: "object",
          patternProperties: {
            ".*": {
              type: "boolean"
            }
          },
          markdownDescription: localize(19606, null),
          default: {
            "shell": true
          }
        }
      ],
      default: false
    },
    ["task.autoDetect" /* AutoDetect */]: {
      markdownDescription: localize(19603, null),
      type: "string",
      enum: ["on", "off"],
      default: "on"
    },
    ["task.slowProviderWarning" /* SlowProviderWarning */]: {
      markdownDescription: localize(19617, null),
      "oneOf": [
        {
          type: "boolean",
          markdownDescription: localize(19619, null)
        },
        {
          type: "array",
          items: {
            type: "string",
            markdownDescription: localize(19618, null)
          }
        }
      ],
      default: true
    },
    ["task.quickOpen.history" /* QuickOpenHistory */]: {
      markdownDescription: localize(19609, null),
      type: "number",
      default: 30,
      minimum: 0,
      maximum: 30
    },
    ["task.quickOpen.detail" /* QuickOpenDetail */]: {
      markdownDescription: localize(19608, null),
      type: "boolean",
      default: true
    },
    ["task.quickOpen.skip" /* QuickOpenSkip */]: {
      type: "boolean",
      description: localize(19611, null),
      default: false
    },
    ["task.quickOpen.showAll" /* QuickOpenShowAll */]: {
      type: "boolean",
      description: localize(19610, null),
      default: false
    },
    ["task.allowAutomaticTasks" /* AllowAutomaticTasks */]: {
      type: "string",
      enum: ["on", "off"],
      enumDescriptions: [
        localize(19602, null),
        localize(19601, null)
      ],
      description: localize(19600, null),
      default: "off",
      scope: 1 /* APPLICATION */,
      restricted: true
    },
    ["task.reconnection" /* Reconnection */]: {
      type: "boolean",
      description: localize(19612, null),
      default: true
    },
    ["task.saveBeforeRun" /* SaveBeforeRun */]: {
      markdownDescription: localize(
        19613,
        null
      ),
      type: "string",
      enum: ["always", "never", "prompt"],
      enumDescriptions: [
        localize(19614, null),
        localize(19615, null),
        localize(19616, null)
      ],
      default: "always"
    },
    ["task.notifyWindowOnTaskCompletion" /* NotifyWindowOnTaskCompletion */]: {
      type: "integer",
      markdownDescription: localize(19604, null),
      default: 6e4,
      minimum: -1,
      agentsWindow: { default: -1 }
    },
    ["task.verboseLogging" /* VerboseLogging */]: {
      type: "boolean",
      description: localize(19620, null),
      default: false
    }
  }
});

registerAction2(class extends Action2 {
  constructor() {
    super({
      id: RerunForActiveTerminalCommandId,
      icon: rerunTaskIcon,
      title: localize2(19629, "Rerun Task"),
      precondition: TASK_TERMINAL_ACTIVE,
      menu: [{ id: MenuId.TerminalInstanceContext, when: TASK_TERMINAL_ACTIVE }],
      keybinding: {
        when: TerminalContextKeys.focus,
        primary: 2048 /* CtrlCmd */ | 1024 /* Shift */ | 48 /* KeyR */,
        mac: {
          primary: 256 /* WinCtrl */ | 1024 /* Shift */ | 48 /* KeyR */
        },
        weight: 200 /* WorkbenchContrib */
      }
    });
  }
  async run(accessor, args2) {
    const terminalService = accessor.get(ITerminalService);
    const taskSystem = accessor.get(ITaskService);
    const instance2 = args2 ?? terminalService.activeInstance;
    if (instance2) {
      await taskSystem.rerun(instance2.instanceId);
    }
  }
});
export { workbenchRegistry4, TaskStatusBarContributions, UserTasksGlobalActionContribution, outputChannelRegistry, quickAccessRegistry6, tasksPickerContextKey, schema9, jsonRegistry6, TaskRegistryContribution, configurationRegistry19 };
