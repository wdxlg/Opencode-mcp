// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/tasks/browser/runAutomaticTasks.ts
import { Disposable } from "./module-0012.mjs";
import { Event2 } from "./module-0017.mjs";
import { TASKS_CATEGORY, TaskSourceKind } from "./module-1402.mjs";
import { joinPath } from "./module-0034.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITaskService } from "./module-1403.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { ILogService } from "./module-0095.mjs";
import { IStorageService } from "./module-0512.mjs";
import { IOpenerService } from "./module-0272.mjs";
import { Action2 } from "./module-0092.mjs";
import { IQuickInputService } from "./module-0536.mjs";


// src/vs/workbench/contrib/tasks/browser/runAutomaticTasks.ts
var HAS_PROMPTED_FOR_AUTOMATIC_TASKS = "task.hasPromptedForAutomaticTasks.v2";

var ALLOW_AUTOMATIC_TASKS = "task.allowAutomaticTasks";

var RunAutomaticTasks = class extends Disposable {
  constructor(_taskService, _configurationService, _workspaceTrustManagementService, _logService, _storageService, _notificationService, _openerService) {
    super();
    this._taskService = _taskService;
    this._configurationService = _configurationService;
    this._workspaceTrustManagementService = _workspaceTrustManagementService;
    this._logService = _logService;
    this._storageService = _storageService;
    this._notificationService = _notificationService;
    this._openerService = _openerService;
    this._hasRunTasks = false;
    if (this._taskService.isReconnected) {
      this._tryRunTasks();
    } else {
      this._register(Event2.once(this._taskService.onDidReconnectToTasks)(async () => await this._tryRunTasks()));
    }
    this._register(this._workspaceTrustManagementService.onDidChangeTrust(async () => await this._tryRunTasks()));
  }
  async _tryRunTasks() {
    if (!this._workspaceTrustManagementService.isWorkspaceTrusted()) {
      return;
    }
    const { value: value2, userValue } = this._configurationService.inspect(ALLOW_AUTOMATIC_TASKS);
    if (this._hasRunTasks || value2 === "off" && userValue !== void 0) {
      return;
    }
    this._hasRunTasks = true;
    this._logService.trace("RunAutomaticTasks: Trying to run tasks.");
    if (!this._taskService.hasTaskSystemInfo) {
      this._logService.trace("RunAutomaticTasks: Awaiting task system info.");
      await Event2.toPromise(Event2.once(this._taskService.onDidChangeTaskSystemInfo));
    }
    let workspaceTasks = await this._taskService.getWorkspaceTasks(2 /* FolderOpen */);
    this._logService.trace(`RunAutomaticTasks: Found ${workspaceTasks.size} automatic tasks`);
    let autoTasks = this._findAutoTasks(this._taskService, workspaceTasks);
    this._logService.trace(`RunAutomaticTasks: taskNames=${JSON.stringify(autoTasks.taskNames)}`);
    if (autoTasks.taskNames.length === 0) {
      const updatedWithinTimeout = await Promise.race([
        new Promise((resolve3) => {
          Event2.toPromise(Event2.once(this._taskService.onDidChangeTaskConfig)).then(() => resolve3(true));
        }),
        new Promise((resolve3) => {
          const timer = setTimeout(() => {
            clearTimeout(timer);
            resolve3(false);
          }, 1e4);
        })
      ]);
      if (!updatedWithinTimeout) {
        this._logService.trace(`RunAutomaticTasks: waited some extra time, but no update of tasks configuration`);
        return;
      }
      workspaceTasks = await this._taskService.getWorkspaceTasks(2 /* FolderOpen */);
      autoTasks = this._findAutoTasks(this._taskService, workspaceTasks);
      this._logService.trace(`RunAutomaticTasks: updated taskNames=${JSON.stringify(autoTasks.taskNames)}`);
    }
    this._runWithPermission(this._taskService, this._configurationService, this._storageService, this._notificationService, this._openerService, autoTasks.tasks, autoTasks.taskNames, autoTasks.locations);
  }
  _runTasks(taskService, tasks2) {
    tasks2.forEach((task) => {
      if (task instanceof Promise) {
        task.then((promiseResult) => {
          if (promiseResult) {
            taskService.run(promiseResult);
          }
        });
      } else {
        taskService.run(task);
      }
    });
  }
  _getTaskSource(source) {
    const taskKind = TaskSourceKind.toConfigurationTarget(source.kind);
    switch (taskKind) {
      case 6 /* WORKSPACE_FOLDER */: {
        return joinPath(source.config.workspaceFolder.uri, source.config.file);
      }
      case 5 /* WORKSPACE */: {
        return source.config.workspace?.configuration ?? void 0;
      }
    }
    return void 0;
  }
  _findAutoTasks(taskService, workspaceTaskResult) {
    const tasks2 = new Array();
    const taskNames = new Array();
    const locations = /* @__PURE__ */ new Map();
    if (workspaceTaskResult) {
      workspaceTaskResult.forEach((resultElement) => {
        if (resultElement.set) {
          resultElement.set.tasks.forEach((task) => {
            if (task.runOptions.runOn === 2 /* folderOpen */) {
              tasks2.push(task);
              taskNames.push(task._label);
              const location2 = this._getTaskSource(task._source);
              if (location2) {
                locations.set(location2.fsPath, location2);
              }
            }
          });
        }
        if (resultElement.configurations) {
          for (const configuredTask of Object.values(resultElement.configurations.byIdentifier)) {
            if (configuredTask.runOptions.runOn === 2 /* folderOpen */) {
              tasks2.push(new Promise((resolve3) => {
                taskService.getTask(resultElement.workspaceFolder, configuredTask._id, true).then((task) => resolve3(task));
              }));
              if (configuredTask._label) {
                taskNames.push(configuredTask._label);
              } else {
                taskNames.push(configuredTask.configures.task);
              }
              const location2 = this._getTaskSource(configuredTask._source);
              if (location2) {
                locations.set(location2.fsPath, location2);
              }
            }
          }
        }
      });
    }
    return { tasks: tasks2, taskNames, locations };
  }
  async _runWithPermission(taskService, configurationService, storageService, notificationService, openerService, tasks2, taskNames, locations) {
    if (taskNames.length === 0) {
      return;
    }
    if (configurationService.getValue(ALLOW_AUTOMATIC_TASKS) === "on") {
      this._runTasks(taskService, tasks2);
      return;
    }
    const hasShownPromptForAutomaticTasks = storageService.getBoolean(HAS_PROMPTED_FOR_AUTOMATIC_TASKS, 1 /* WORKSPACE */, false);
    if (hasShownPromptForAutomaticTasks) {
      return;
    }
    const allow = await this._showPrompt(notificationService, storageService, openerService, configurationService, taskNames, locations);
    if (allow) {
      this._runTasks(taskService, tasks2);
    }
  }
  _showPrompt(notificationService, storageService, openerService, configurationService, taskNames, locations) {
    return new Promise((resolve3) => {
      notificationService.prompt(
        Severity2.Info,
        localize(
          19576,
          null,
          taskNames.join(", "),
          Array.from(locations.keys()).join(", ")
        ),
        [
          {
            label: localize(19572, null),
            run: () => {
              resolve3(true);
              configurationService.updateValue(ALLOW_AUTOMATIC_TASKS, "on", 2 /* USER */);
            }
          },
          {
            label: localize(19573, null),
            run: () => {
              resolve3(false);
              configurationService.updateValue(ALLOW_AUTOMATIC_TASKS, "off", 2 /* USER */);
            }
          },
          {
            label: locations.size === 1 ? localize(19574, null) : localize(19575, null),
            run: async () => {
              for (const location2 of locations) {
                await openerService.open(location2[1]);
              }
              resolve3(false);
            }
          }
        ],
        { onCancel: () => resolve3(false) }
      );
      storageService.store(HAS_PROMPTED_FOR_AUTOMATIC_TASKS, true, 1 /* WORKSPACE */, 1 /* MACHINE */);
    });
  }
};

RunAutomaticTasks = __decorateClass([
  __decorateParam(0, ITaskService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IWorkspaceTrustManagementService),
  __decorateParam(3, ILogService),
  __decorateParam(4, IStorageService),
  __decorateParam(5, INotificationService),
  __decorateParam(6, IOpenerService)
], RunAutomaticTasks);

var ManageAutomaticTaskRunning = class _ManageAutomaticTaskRunning extends Action2 {
  static {
    this.ID = "workbench.action.tasks.manageAutomaticRunning";
  }
  static {
    this.LABEL = localize(19579, null);
  }
  constructor() {
    super({
      id: _ManageAutomaticTaskRunning.ID,
      title: _ManageAutomaticTaskRunning.LABEL,
      category: TASKS_CATEGORY
    });
  }
  async run(accessor) {
    const quickInputService = accessor.get(IQuickInputService);
    const configurationService = accessor.get(IConfigurationService);
    const allowItem = { label: localize(19577, null) };
    const disallowItem = { label: localize(19578, null) };
    const value2 = await quickInputService.pick([allowItem, disallowItem], { canPickMany: false });
    if (!value2) {
      return;
    }
    configurationService.updateValue(ALLOW_AUTOMATIC_TASKS, value2 === allowItem ? "on" : "off", 2 /* USER */);
  }
};
export { HAS_PROMPTED_FOR_AUTOMATIC_TASKS, ALLOW_AUTOMATIC_TASKS, RunAutomaticTasks, ManageAutomaticTaskRunning };
