// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/debug/browser/debugTaskRunner.ts
import { Emitter, Event2 } from "./module-0017.mjs";
import { localize } from "./module-0001.mjs";
import { CancellationTokenSource } from "./module-0025.mjs";
import { Markers } from "./module-3192.mjs";
import { severity_default } from "./module-0266.mjs";
import { createErrorWithActions } from "./module-0094.mjs";
import { toAction } from "./module-0082.mjs";
import { DEBUG_CONFIGURE_COMMAND_ID, DEBUG_CONFIGURE_LABEL } from "./module-2406.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { disposableTimeout } from "./module-0036.mjs";
import { ConfiguringTask, CustomTask } from "./module-1403.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITaskService } from "./module-1404.mjs";
import { IMarkerService } from "./module-0560.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IViewsService } from "./module-1246.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IStorageService } from "./module-0512.mjs";
import { ICommandService } from "./module-0087.mjs";
import { IProgressService } from "./module-0446.mjs";


// src/vs/workbench/contrib/debug/browser/debugTaskRunner.ts
var onceFilter = (event, filter2) => Event2.once(Event2.filter(event, filter2));

var DEBUG_TASK_ERROR_CHOICE_KEY = "debug.taskerrorchoice";

var ABORT_LABEL = localize(14570, null);

var DEBUG_ANYWAY_LABEL = localize(14572, null);

var DEBUG_ANYWAY_LABEL_NO_MEMO = localize(14573, null);

var DebugTaskRunner = class {
  constructor(taskService, markerService, configurationService, viewsService, dialogService, storageService, commandService, progressService) {
    this.taskService = taskService;
    this.markerService = markerService;
    this.configurationService = configurationService;
    this.viewsService = viewsService;
    this.dialogService = dialogService;
    this.storageService = storageService;
    this.commandService = commandService;
    this.progressService = progressService;
    this.globalCancellation = new CancellationTokenSource();
  }
  cancel() {
    this.globalCancellation.dispose(true);
    this.globalCancellation = new CancellationTokenSource();
  }
  dispose() {
    this.globalCancellation.dispose(true);
  }
  async runTaskAndCheckErrors(root, taskId) {
    try {
      const taskSummary = await this.runTask(root, taskId, this.globalCancellation.token);
      if (taskSummary && (taskSummary.exitCode === void 0 || taskSummary.cancelled)) {
        return 0 /* Failure */;
      }
      const errorCount = taskId ? this.markerService.read({ severities: 8 /* Error */, take: 2 }).length : 0;
      const successExitCode = taskSummary && taskSummary.exitCode === 0;
      const failureExitCode = taskSummary && taskSummary.exitCode !== 0;
      const onTaskErrors = this.configurationService.getValue("debug").onTaskErrors;
      if (successExitCode || onTaskErrors === "debugAnyway" || errorCount === 0 && !failureExitCode) {
        return 1 /* Success */;
      }
      if (onTaskErrors === "showErrors") {
        await this.viewsService.openView(Markers.MARKERS_VIEW_ID, true);
        return Promise.resolve(0 /* Failure */);
      }
      if (onTaskErrors === "abort") {
        return Promise.resolve(0 /* Failure */);
      }
      const taskLabel = typeof taskId === "string" ? taskId : taskId ? taskId.name : "";
      const message = errorCount > 1 ? localize(14578, null, taskLabel) : errorCount === 1 ? localize(14577, null, taskLabel) : taskSummary && typeof taskSummary.exitCode === "number" ? localize(14579, null, taskLabel, taskSummary.exitCode) : localize(14580, null, taskLabel);
      let DebugChoice;
      ((DebugChoice2) => {
        DebugChoice2[DebugChoice2["DebugAnyway"] = 1] = "DebugAnyway";
        DebugChoice2[DebugChoice2["ShowErrors"] = 2] = "ShowErrors";
        DebugChoice2[DebugChoice2["Cancel"] = 0] = "Cancel";
      })(DebugChoice || (DebugChoice = {}));
      const { result, checkboxChecked } = await this.dialogService.prompt({
        type: severity_default.Warning,
        message,
        buttons: [
          {
            label: DEBUG_ANYWAY_LABEL,
            run: () => 1 /* DebugAnyway */
          },
          {
            label: localize(14584, null),
            run: () => 2 /* ShowErrors */
          }
        ],
        cancelButton: {
          label: ABORT_LABEL,
          run: () => 0 /* Cancel */
        },
        checkbox: {
          label: localize(14581, null)
        }
      });
      const debugAnyway = result === 1 /* DebugAnyway */;
      const abort = result === 0 /* Cancel */;
      if (checkboxChecked) {
        this.configurationService.updateValue("debug.onTaskErrors", result === 1 /* DebugAnyway */ ? "debugAnyway" : abort ? "abort" : "showErrors");
      }
      if (abort) {
        return Promise.resolve(0 /* Failure */);
      }
      if (debugAnyway) {
        return 1 /* Success */;
      }
      await this.viewsService.openView(Markers.MARKERS_VIEW_ID, true);
      return Promise.resolve(0 /* Failure */);
    } catch (err) {
      const taskConfigureAction = this.taskService.configureAction();
      const choiceMap = JSON.parse(this.storageService.get(DEBUG_TASK_ERROR_CHOICE_KEY, 1 /* WORKSPACE */, "{}"));
      let choice = -1;
      let DebugChoice;
      ((DebugChoice2) => {
        DebugChoice2[DebugChoice2["DebugAnyway"] = 0] = "DebugAnyway";
        DebugChoice2[DebugChoice2["ConfigureTask"] = 1] = "ConfigureTask";
        DebugChoice2[DebugChoice2["Cancel"] = 2] = "Cancel";
      })(DebugChoice || (DebugChoice = {}));
      if (choiceMap[err.message] !== void 0) {
        choice = choiceMap[err.message];
      } else {
        const { result, checkboxChecked } = await this.dialogService.prompt({
          type: severity_default.Error,
          message: err.message,
          buttons: [
            {
              label: localize(14572, null),
              run: () => 0 /* DebugAnyway */
            },
            {
              label: taskConfigureAction.label,
              run: () => 1 /* ConfigureTask */
            }
          ],
          cancelButton: {
            run: () => 2 /* Cancel */
          },
          checkbox: {
            label: localize(14582, null)
          }
        });
        choice = result;
        if (checkboxChecked) {
          choiceMap[err.message] = choice;
          this.storageService.store(DEBUG_TASK_ERROR_CHOICE_KEY, JSON.stringify(choiceMap), 1 /* WORKSPACE */, 1 /* MACHINE */);
        }
      }
      if (choice === 1 /* ConfigureTask */) {
        await taskConfigureAction.run();
      }
      return choice === 0 /* DebugAnyway */ ? 1 /* Success */ : 0 /* Failure */;
    }
  }
  async runTask(root, taskId, token = this.globalCancellation.token) {
    if (!taskId) {
      return Promise.resolve(null);
    }
    if (!root) {
      return Promise.reject(new Error(localize(14576, null, typeof taskId === "string" ? taskId : taskId.type)));
    }
    const task = await this.taskService.getTask(root, taskId);
    if (!task) {
      const errorMessage = typeof taskId === "string" ? localize(14575, null, taskId) : localize(14574, null);
      return Promise.reject(createErrorWithActions(errorMessage, [toAction({ id: DEBUG_CONFIGURE_COMMAND_ID, label: DEBUG_CONFIGURE_LABEL, enabled: true, run: () => this.commandService.executeCommand(DEBUG_CONFIGURE_COMMAND_ID) })]));
    }
    let taskStarted = false;
    const store = new DisposableStore();
    const getTaskKey2 = (t2) => t2.getKey() ?? t2.getMapKey();
    const taskKey = getTaskKey2(task);
    const inactivePromise = new Promise((resolve3) => store.add(
      onceFilter(this.taskService.onDidStateChange, (e) => {
        return (e.kind === "inactive" /* Inactive */ || e.kind === "processEnded" /* ProcessEnded */ && e.exitCode === void 0) && getTaskKey2(e.__task) === taskKey;
      })((e) => {
        taskStarted = true;
        resolve3(e.kind === "processEnded" /* ProcessEnded */ ? { exitCode: e.exitCode } : null);
      })
    ));
    store.add(
      onceFilter(
        this.taskService.onDidStateChange,
        (e) => (e.kind === "active" /* Active */ || e.kind === "dependsOnStarted" /* DependsOnStarted */) && getTaskKey2(e.__task) === taskKey
      )(() => {
        taskStarted = true;
      })
    );
    const didAcquireInput = store.add(new Emitter());
    store.add(onceFilter(
      this.taskService.onDidStateChange,
      (e) => e.kind === "acquiredInput" /* AcquiredInput */ && getTaskKey2(e.__task) === taskKey
    )(() => didAcquireInput.fire()));
    const taskDonePromise = this.taskService.getActiveTasks().then(async (tasks2) => {
      if (tasks2.find((t2) => getTaskKey2(t2) === taskKey)) {
        didAcquireInput.fire();
        const busyTasks = await this.taskService.getBusyTasks();
        if (busyTasks.find((t2) => getTaskKey2(t2) === taskKey)) {
          taskStarted = true;
          return inactivePromise;
        }
        return Promise.resolve(null);
      }
      const taskPromise = this.taskService.run(task);
      if (task.configurationProperties.isBackground) {
        return inactivePromise;
      }
      return taskPromise.then((x) => x ?? null);
    });
    const result = new Promise((resolve3, reject) => {
      taskDonePromise.then((result2) => {
        taskStarted = true;
        resolve3(result2);
      }, (error) => reject(error));
      store.add(token.onCancellationRequested(() => {
        resolve3({ exitCode: void 0, cancelled: true });
        this.taskService.terminate(task).catch(() => {
        });
      }));
      store.add(didAcquireInput.event(() => {
        const waitTime = task.configurationProperties.isBackground ? 5e3 : 1e4;
        store.add(disposableTimeout(() => {
          if (!taskStarted) {
            const errorMessage = localize(14585, null, typeof taskId === "string" ? taskId : JSON.stringify(taskId));
            reject({ severity: severity_default.Error, message: errorMessage });
          }
        }, waitTime));
        const hideSlowPreLaunchWarning = this.configurationService.getValue("debug").hideSlowPreLaunchWarning;
        if (!hideSlowPreLaunchWarning) {
          store.add(disposableTimeout(() => {
            const message = localize(14583, null, task.configurationProperties.name);
            const buttons = [DEBUG_ANYWAY_LABEL_NO_MEMO, ABORT_LABEL];
            const canConfigure = task instanceof CustomTask || task instanceof ConfiguringTask;
            if (canConfigure) {
              buttons.splice(1, 0, localize(14571, null));
            }
            this.progressService.withProgress(
              { location: 15 /* Notification */, title: message, buttons },
              () => result.catch(() => {
              }),
              (choice) => {
                if (choice === void 0) {
                } else if (choice === 0) {
                  resolve3({ exitCode: 0 });
                } else {
                  resolve3({ exitCode: void 0, cancelled: true });
                  this.taskService.terminate(task).catch(() => {
                  });
                  if (canConfigure && choice === 1) {
                    this.taskService.openConfig(task);
                  }
                }
              }
            );
          }, 1e4));
        }
      }));
    });
    return result.finally(() => store.dispose());
  }
};

DebugTaskRunner = __decorateClass([
  __decorateParam(0, ITaskService),
  __decorateParam(1, IMarkerService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IViewsService),
  __decorateParam(4, IDialogService),
  __decorateParam(5, IStorageService),
  __decorateParam(6, ICommandService),
  __decorateParam(7, IProgressService)
], DebugTaskRunner);
export { onceFilter, DEBUG_TASK_ERROR_CHOICE_KEY, ABORT_LABEL, DEBUG_ANYWAY_LABEL, DEBUG_ANYWAY_LABEL_NO_MEMO, DebugTaskRunner };
