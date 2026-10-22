// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/tasks/browser/taskQuickPick.ts
import { localize } from "./module-0001.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { Disposable, DisposableStore } from "./module-0012.mjs";
import { ConfiguringTask, ContributedTask, CustomTask } from "./module-1402.mjs";
import { deepClone } from "./module-0098.mjs";
import { createColorStyleElement, getColorClass } from "./module-1175.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { INotificationService, Severity2 } from "./module-0336.mjs";
import { isString } from "./module-0010.mjs";
import { showWithPinnedItems } from "./module-3190.mjs";
import { Event2 } from "./module-0017.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITaskService } from "./module-1403.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IQuickInputService } from "./module-0536.mjs";
import { IThemeService } from "./module-0287.mjs";
import { IDialogService } from "./module-0267.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/tasks/browser/taskQuickPick.ts
var QUICKOPEN_DETAIL_CONFIG = "task.quickOpen.detail";

var QUICKOPEN_SKIP_CONFIG = "task.quickOpen.skip";

function isWorkspaceFolder2(folder) {
  return "uri" in folder;
}

var SHOW_ALL = localize(19643, null);

var configureTaskIcon = registerIcon("tasks-list-configure", Codicon.gear, localize(19632, null));

var removeTaskIcon = registerIcon("tasks-remove", Codicon.close, localize(19637, null));

var runTaskStorageKey = "runTaskStorageKey";

var TaskQuickPick = class extends Disposable {
  constructor(_taskService, _configurationService, _quickInputService, _notificationService, _themeService, _dialogService, _storageService) {
    super();
    this._taskService = _taskService;
    this._configurationService = _configurationService;
    this._quickInputService = _quickInputService;
    this._notificationService = _notificationService;
    this._themeService = _themeService;
    this._dialogService = _dialogService;
    this._storageService = _storageService;
    this._sorter = this._taskService.createSorter();
  }
  _showDetail() {
    return !!this._configurationService.getValue(QUICKOPEN_DETAIL_CONFIG);
  }
  _guessTaskLabel(task) {
    if (task._label) {
      return task._label;
    }
    if (ConfiguringTask.is(task)) {
      let label3 = task.configures.type;
      const configures = deepClone(task.configures);
      delete configures["_key"];
      delete configures["type"];
      Object.keys(configures).forEach((key3) => label3 += `: ${configures[key3]}`);
      return label3;
    }
    return "";
  }
  static getTaskLabelWithIcon(task, labelGuess) {
    const label3 = labelGuess || task._label;
    const icon2 = task.configurationProperties.icon;
    if (!icon2) {
      return `${label3}`;
    }
    return icon2.id ? `$(${icon2.id}) ${label3}` : `$(${Codicon.tools.id}) ${label3}`;
  }
  static applyColorStyles(task, entry, themeService) {
    if (task.configurationProperties.icon?.color) {
      const colorTheme = themeService.getColorTheme();
      const disposable = createColorStyleElement(colorTheme);
      entry.iconClasses = [getColorClass(task.configurationProperties.icon.color)];
      return disposable;
    }
    return;
  }
  _createTaskEntry(task, extraButtons = []) {
    const buttons = [
      { iconClass: ThemeIcon.asClassName(configureTaskIcon), tooltip: localize(19631, null) },
      ...extraButtons
    ];
    const entry = { label: TaskQuickPick.getTaskLabelWithIcon(task, this._guessTaskLabel(task)), description: this._taskService.getTaskDescription(task), task, detail: this._showDetail() ? task.configurationProperties.detail : void 0, buttons };
    const disposable = TaskQuickPick.applyColorStyles(task, entry, this._themeService);
    if (disposable) {
      this._register(disposable);
    }
    return entry;
  }
  _createEntriesForGroup(entries2, tasks2, groupLabel, extraButtons = []) {
    entries2.push({ type: "separator", label: groupLabel });
    tasks2.forEach((task) => {
      if (!task.configurationProperties.hide) {
        entries2.push(this._createTaskEntry(task, extraButtons));
      }
    });
  }
  _createTypeEntries(entries2, types) {
    entries2.push({ type: "separator", label: localize(19633, null) });
    types.forEach((type) => {
      entries2.push({ label: `$(folder) ${type}`, task: type, ariaLabel: localize(19645, null, type) });
    });
    entries2.push({ label: SHOW_ALL, task: SHOW_ALL, alwaysShow: true });
  }
  _handleFolderTaskResult(result) {
    const tasks2 = [];
    Array.from(result).forEach(([key3, folderTasks]) => {
      if (folderTasks.set) {
        tasks2.push(...folderTasks.set.tasks);
      }
      if (folderTasks.configurations) {
        for (const configuration2 in folderTasks.configurations.byIdentifier) {
          tasks2.push(folderTasks.configurations.byIdentifier[configuration2]);
        }
      }
    });
    return tasks2;
  }
  _dedupeConfiguredAndRecent(recentTasks, configuredTasks) {
    let dedupedConfiguredTasks = [];
    const foundRecentTasks = Array(recentTasks.length).fill(false);
    for (let j = 0; j < configuredTasks.length; j++) {
      const workspaceFolder = configuredTasks[j].getWorkspaceFolder()?.uri.toString();
      const definition = configuredTasks[j].getDefinition()?._key;
      const type = configuredTasks[j].type;
      const label3 = configuredTasks[j]._label;
      const recentKey = configuredTasks[j].getKey();
      const findIndex = recentTasks.findIndex((value2) => {
        return workspaceFolder && definition && value2.getWorkspaceFolder()?.uri.toString() === workspaceFolder && (value2.getDefinition()?._key === definition || value2.type === type && value2._label === label3) || recentKey && value2.getKey() === recentKey;
      });
      if (findIndex === -1) {
        dedupedConfiguredTasks.push(configuredTasks[j]);
      } else {
        recentTasks[findIndex] = configuredTasks[j];
        foundRecentTasks[findIndex] = true;
      }
    }
    dedupedConfiguredTasks = dedupedConfiguredTasks.sort((a, b) => this._sorter.compare(a, b));
    const prunedRecentTasks = [];
    for (let i2 = 0; i2 < recentTasks.length; i2++) {
      if (foundRecentTasks[i2] || ConfiguringTask.is(recentTasks[i2])) {
        prunedRecentTasks.push(recentTasks[i2]);
      }
    }
    return { configuredTasks: dedupedConfiguredTasks, recentTasks: prunedRecentTasks };
  }
  async getTopLevelEntries(defaultEntry) {
    if (this._topLevelEntries !== void 0) {
      return { entries: this._topLevelEntries };
    }
    let recentTasks = (await this._taskService.getSavedTasks("historical")).reverse();
    const configuredTasks = this._handleFolderTaskResult(await this._taskService.getWorkspaceTasks());
    const extensionTaskTypes = this._taskService.taskTypes();
    this._topLevelEntries = [];
    const dedupeAndPrune = this._dedupeConfiguredAndRecent(recentTasks, configuredTasks);
    const dedupedConfiguredTasks = dedupeAndPrune.configuredTasks;
    recentTasks = dedupeAndPrune.recentTasks;
    if (recentTasks.length > 0) {
      const removeRecentButton = {
        iconClass: ThemeIcon.asClassName(removeTaskIcon),
        tooltip: localize(19636, null)
      };
      this._createEntriesForGroup(this._topLevelEntries, recentTasks, localize(19635, null), [removeRecentButton]);
    }
    if (configuredTasks.length > 0) {
      if (dedupedConfiguredTasks.length > 0) {
        this._createEntriesForGroup(this._topLevelEntries, dedupedConfiguredTasks, localize(19630, null));
      }
    }
    if (defaultEntry && configuredTasks.length === 0) {
      this._topLevelEntries.push({ type: "separator", label: localize(19630, null) });
      this._topLevelEntries.push(defaultEntry);
    }
    if (extensionTaskTypes.length > 0) {
      this._createTypeEntries(this._topLevelEntries, extensionTaskTypes);
    }
    return { entries: this._topLevelEntries, isSingleConfigured: configuredTasks.length === 1 ? configuredTasks[0] : void 0 };
  }
  async handleSettingOption(selectedType) {
    const { confirmed } = await this._dialogService.confirm({
      type: Severity2.Warning,
      message: localize(
        19638,
        null,
        selectedType
      ),
      cancelButton: localize(19639, null)
    });
    if (confirmed) {
      await this._configurationService.updateValue(`${selectedType}.autoDetect`, "on");
      await new Promise((resolve3) => setTimeout(() => resolve3(), 100));
      return this.show(localize(19644, null), void 0, selectedType);
    }
    return void 0;
  }
  async show(placeHolder, defaultEntry, startAtType, name) {
    const disposables = new DisposableStore();
    const picker = disposables.add(this._quickInputService.createQuickPick({ useSeparators: true }));
    picker.placeholder = placeHolder;
    picker.matchOnDescription = true;
    picker.ignoreFocusOut = false;
    disposables.add(picker.onDidTriggerItemButton(async (context2) => {
      const task = context2.item.task;
      if (context2.button.iconClass === ThemeIcon.asClassName(removeTaskIcon)) {
        const key3 = task && !isString(task) ? task.getKey() : void 0;
        if (key3) {
          this._taskService.removeRecentlyUsedTask(key3);
        }
        const indexToRemove = picker.items.indexOf(context2.item);
        if (indexToRemove >= 0) {
          picker.items = [...picker.items.slice(0, indexToRemove), ...picker.items.slice(indexToRemove + 1)];
        }
      } else if (context2.button.iconClass === ThemeIcon.asClassName(configureTaskIcon)) {
        this._quickInputService.cancel();
        if (ContributedTask.is(task)) {
          this._taskService.customize(task, void 0, true);
        } else if (CustomTask.is(task) || ConfiguringTask.is(task)) {
          let canOpenConfig = false;
          try {
            canOpenConfig = await this._taskService.openConfig(task);
          } catch (e4) {
          }
          if (!canOpenConfig) {
            this._taskService.customize(task, void 0, true);
          }
        }
      }
    }));
    if (name) {
      picker.value = name;
    }
    let firstLevelTask = startAtType;
    if (!firstLevelTask) {
      const topLevelEntriesResult = await this.getTopLevelEntries(defaultEntry);
      if (topLevelEntriesResult.isSingleConfigured && this._configurationService.getValue(QUICKOPEN_SKIP_CONFIG)) {
        disposables.dispose();
        return this._toTask(topLevelEntriesResult.isSingleConfigured);
      }
      const taskQuickPickEntries = topLevelEntriesResult.entries;
      firstLevelTask = await this._doPickerFirstLevel(picker, taskQuickPickEntries, disposables);
    }
    do {
      if (isString(firstLevelTask)) {
        if (name) {
          await this._doPickerFirstLevel(picker, (await this.getTopLevelEntries(defaultEntry)).entries, disposables);
          disposables.dispose();
          return void 0;
        }
        const selectedEntry = await this.doPickerSecondLevel(picker, disposables, firstLevelTask);
        if (selectedEntry && !selectedEntry.settingType && selectedEntry.task === null) {
          picker.value = "";
          firstLevelTask = await this._doPickerFirstLevel(picker, (await this.getTopLevelEntries(defaultEntry)).entries, disposables);
        } else if (selectedEntry && isString(selectedEntry.settingType)) {
          disposables.dispose();
          return this.handleSettingOption(selectedEntry.settingType);
        } else {
          disposables.dispose();
          return selectedEntry?.task && !isString(selectedEntry?.task) ? this._toTask(selectedEntry?.task) : void 0;
        }
      } else if (firstLevelTask) {
        disposables.dispose();
        return this._toTask(firstLevelTask);
      } else {
        disposables.dispose();
        return firstLevelTask;
      }
    } while (1);
    return;
  }
  async _doPickerFirstLevel(picker, taskQuickPickEntries, disposables) {
    picker.items = taskQuickPickEntries;
    disposables.add(showWithPinnedItems(this._storageService, runTaskStorageKey, picker, true));
    const firstLevelPickerResult = await new Promise((resolve3) => {
      disposables.add(Event2.once(picker.onDidAccept)(async () => {
        resolve3(picker.selectedItems ? picker.selectedItems[0] : void 0);
      }));
    });
    return firstLevelPickerResult?.task;
  }
  async doPickerSecondLevel(picker, disposables, type, name) {
    picker.busy = true;
    if (type === SHOW_ALL) {
      const items = (await this._taskService.tasks()).filter((t2) => !t2.configurationProperties.hide).sort((a, b) => this._sorter.compare(a, b)).map((task) => this._createTaskEntry(task));
      items.push(...TaskQuickPick.allSettingEntries(this._configurationService));
      picker.items = items;
    } else {
      picker.value = name || "";
      picker.items = await this._getEntriesForProvider(type);
    }
    await picker.show();
    picker.busy = false;
    const secondLevelPickerResult = await new Promise((resolve3) => {
      disposables.add(Event2.once(picker.onDidAccept)(async () => {
        resolve3(picker.selectedItems ? picker.selectedItems[0] : void 0);
      }));
    });
    return secondLevelPickerResult;
  }
  static allSettingEntries(configurationService) {
    const entries2 = [];
    const gruntEntry = TaskQuickPick.getSettingEntry(configurationService, "grunt");
    if (gruntEntry) {
      entries2.push(gruntEntry);
    }
    const gulpEntry = TaskQuickPick.getSettingEntry(configurationService, "gulp");
    if (gulpEntry) {
      entries2.push(gulpEntry);
    }
    const jakeEntry = TaskQuickPick.getSettingEntry(configurationService, "jake");
    if (jakeEntry) {
      entries2.push(jakeEntry);
    }
    return entries2;
  }
  static getSettingEntry(configurationService, type) {
    if (configurationService.getValue(`${type}.autoDetect`) === "off") {
      return {
        label: "$(gear) " + localize(
          19640,
          null,
          type[0].toUpperCase() + type.slice(1),
          type
        ),
        task: null,
        settingType: type,
        alwaysShow: true
      };
    }
    return void 0;
  }
  async _getEntriesForProvider(type) {
    const tasks2 = (await this._taskService.tasks({ type })).sort((a, b) => this._sorter.compare(a, b));
    let taskQuickPickEntries = [];
    if (tasks2.length > 0) {
      for (const task of tasks2) {
        if (!task.configurationProperties.hide) {
          taskQuickPickEntries.push(this._createTaskEntry(task));
        }
      }
      taskQuickPickEntries.push({
        type: "separator"
      }, {
        label: localize(19641, null),
        task: null,
        alwaysShow: true
      });
    } else {
      taskQuickPickEntries = [{
        label: localize(19642, null, type),
        task: null,
        alwaysShow: true
      }];
    }
    const settingEntry = TaskQuickPick.getSettingEntry(this._configurationService, type);
    if (settingEntry) {
      taskQuickPickEntries.push(settingEntry);
    }
    return taskQuickPickEntries;
  }
  async _toTask(task) {
    if (!ConfiguringTask.is(task)) {
      return task;
    }
    const resolvedTask = await this._taskService.tryResolveTask(task);
    if (!resolvedTask) {
      this._notificationService.error(localize(19634, null, task.type));
    }
    return resolvedTask;
  }
};

TaskQuickPick = __decorateClass([
  __decorateParam(0, ITaskService),
  __decorateParam(1, IConfigurationService),
  __decorateParam(2, IQuickInputService),
  __decorateParam(3, INotificationService),
  __decorateParam(4, IThemeService),
  __decorateParam(5, IDialogService),
  __decorateParam(6, IStorageService)
], TaskQuickPick);
export { isWorkspaceFolder2, QUICKOPEN_DETAIL_CONFIG, QUICKOPEN_SKIP_CONFIG, SHOW_ALL, configureTaskIcon, removeTaskIcon, runTaskStorageKey, TaskQuickPick };
