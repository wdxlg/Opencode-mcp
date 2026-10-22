// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/tasks/browser/tasksQuickAccess.ts
import { PickerQuickAccessProvider } from "./module-1528.mjs";
import { localize } from "./module-0001.mjs";
import { TaskQuickPick } from "./module-3477.mjs";
import { matchesFuzzy } from "./module-0453.mjs";
import { isString } from "./module-0010.mjs";
import { ConfiguringTask, ContributedTask, CustomTask } from "./module-1403.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { ITaskService } from "./module-1404.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { INotificationService } from "./module-0336.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/tasks/browser/tasksQuickAccess.ts
var TasksQuickAccessProvider = class extends PickerQuickAccessProvider {
  constructor(extensionService, _taskService, _configurationService, _quickInputService, _notificationService, _dialogService, _themeService, _storageService) {
    super(TasksQuickAccessProvider.PREFIX, {
      noResultsPick: {
        label: localize(19646, null)
      }
    });
    this._taskService = _taskService;
    this._configurationService = _configurationService;
    this._quickInputService = _quickInputService;
    this._notificationService = _notificationService;
    this._dialogService = _dialogService;
    this._themeService = _themeService;
    this._storageService = _storageService;
  }
  static {
    this.PREFIX = "task ";
  }
  async _getPicks(filter2, disposables, token) {
    if (token.isCancellationRequested) {
      return [];
    }
    const taskQuickPick = new TaskQuickPick(this._taskService, this._configurationService, this._quickInputService, this._notificationService, this._themeService, this._dialogService, this._storageService);
    const topLevelPicks = await taskQuickPick.getTopLevelEntries();
    const taskPicks = [];
    for (const entry of topLevelPicks.entries) {
      const highlights = matchesFuzzy(filter2, entry.label);
      if (!highlights) {
        continue;
      }
      if (entry.type === "separator") {
        taskPicks.push(entry);
      }
      const task = entry.task;
      const quickAccessEntry = entry;
      quickAccessEntry.highlights = { label: highlights };
      quickAccessEntry.trigger = (index2) => {
        if (index2 === 1 && quickAccessEntry.buttons?.length === 2) {
          const key3 = task && !isString(task) ? task.getKey() : void 0;
          if (key3) {
            this._taskService.removeRecentlyUsedTask(key3);
          }
          return 2 /* REFRESH_PICKER */;
        } else {
          if (ContributedTask.is(task)) {
            this._taskService.customize(task, void 0, true);
          } else if (CustomTask.is(task)) {
            this._taskService.openConfig(task);
          }
          return 1 /* CLOSE_PICKER */;
        }
      };
      quickAccessEntry.accept = async () => {
        if (isString(task)) {
          const showResult = await taskQuickPick.show(localize(19647, null), void 0, task);
          if (showResult) {
            this._taskService.run(showResult, { attachProblemMatcher: true });
          }
        } else {
          this._taskService.run(await this._toTask(task), { attachProblemMatcher: true });
        }
      };
      taskPicks.push(quickAccessEntry);
    }
    return taskPicks;
  }
  async _toTask(task) {
    if (!ConfiguringTask.is(task)) {
      return task;
    }
    return this._taskService.tryResolveTask(task);
  }
};

TasksQuickAccessProvider = __decorateClass([
  __decorateParam(0, IExtensionService),
  __decorateParam(1, ITaskService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IQuickInputService),
  __decorateParam(4, INotificationService),
  __decorateParam(5, IDialogService),
  __decorateParam(6, IThemeService),
  __decorateParam(7, IStorageService)
], TasksQuickAccessProvider);
export { TasksQuickAccessProvider };
