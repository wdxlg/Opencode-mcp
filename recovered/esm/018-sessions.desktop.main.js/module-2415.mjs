// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/executionStatusBarItemController.ts
import { Disposable, MutableDisposable, dispose } from "./module-0012.mjs";
import { NotebookVisibleCellObserver } from "./module-2413.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IInstantiationService } from "./module-0077.mjs";
import { registerNotebookContribution } from "./module-1870.mjs";
import { RunOnceScheduler, disposableTimeout } from "./module-0036.mjs";
import { errorStateIcon, executingStateIcon, pendingStateIcon, successStateIcon } from "./module-1846.mjs";
import { themeColorFromId2 } from "./module-0287.mjs";
import { cellStatusIconError, cellStatusIconSuccess } from "./module-1941.mjs";
import { localize } from "./module-0001.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { INotebookExecutionStateService } from "./module-1386.mjs";
import { NotebookSetting } from "./module-0911.mjs";
import { language } from "./module-0014.mjs";
import { INotebookService } from "./module-0927.mjs";
import { IConfigurationService } from "./module-0132.mjs";


// src/vs/workbench/contrib/notebook/browser/contrib/cellStatusBar/executionStatusBarItemController.ts
function formatCellDuration(duration, showMilliseconds = true) {
  if (showMilliseconds && duration < 1e3) {
    return `${duration}ms`;
  }
  const minutes = Math.floor(duration / 1e3 / 60);
  const seconds = Math.floor(duration / 1e3) % 60;
  const tenths = Math.floor(duration % 1e3 / 100);
  if (minutes > 0) {
    return `${minutes}m ${seconds}.${tenths}s`;
  } else {
    return `${seconds}.${tenths}s`;
  }
}

var NotebookStatusBarController = class extends Disposable {
  constructor(_notebookEditor, _itemFactory) {
    super();
    this._notebookEditor = _notebookEditor;
    this._itemFactory = _itemFactory;
    this._visibleCells = /* @__PURE__ */ new Map();
    this._observer = this._register(new NotebookVisibleCellObserver(this._notebookEditor));
    this._register(this._observer.onDidChangeVisibleCells(this._updateVisibleCells, this));
    this._updateEverything();
  }
  _updateEverything() {
    this._visibleCells.forEach(dispose);
    this._visibleCells.clear();
    this._updateVisibleCells({ added: this._observer.visibleCells, removed: [] });
  }
  _updateVisibleCells(e4) {
    const vm = this._notebookEditor.getViewModel();
    if (!vm) {
      return;
    }
    for (const oldCell of e4.removed) {
      this._visibleCells.get(oldCell.handle)?.dispose();
      this._visibleCells.delete(oldCell.handle);
    }
    for (const newCell of e4.added) {
      this._visibleCells.set(newCell.handle, this._itemFactory(vm, newCell));
    }
  }
  dispose() {
    super.dispose();
    this._visibleCells.forEach(dispose);
    this._visibleCells.clear();
  }
};

var ExecutionStateCellStatusBarContrib = class extends Disposable {
  static {
    this.id = "workbench.notebook.statusBar.execState";
  }
  constructor(notebookEditor, instantiationService) {
    super();
    this._register(new NotebookStatusBarController(notebookEditor, (vm, cell) => instantiationService.createInstance(ExecutionStateCellStatusBarItem, vm, cell)));
  }
};

ExecutionStateCellStatusBarContrib = __decorateClass([
  __decorateParam(1, IInstantiationService)
], ExecutionStateCellStatusBarContrib);

registerNotebookContribution(ExecutionStateCellStatusBarContrib.id, ExecutionStateCellStatusBarContrib);

var ExecutionStateCellStatusBarItem = class extends Disposable {
  constructor(_notebookViewModel, _cell, _executionStateService) {
    super();
    this._notebookViewModel = _notebookViewModel;
    this._cell = _cell;
    this._executionStateService = _executionStateService;
    this._currentItemIds = [];
    this._clearExecutingStateTimer = this._register(new MutableDisposable());
    this._update();
    this._register(this._executionStateService.onDidChangeExecution((e4) => {
      if (e4.type === 0 /* cell */ && e4.affectsCell(this._cell.uri)) {
        this._update();
      }
    }));
    this._register(this._cell.model.onDidChangeInternalMetadata(() => this._update()));
  }
  static {
    this.MIN_SPINNER_TIME = 500;
  }
  async _update() {
    const items = this._getItemsForCell();
    if (Array.isArray(items)) {
      this._currentItemIds = this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items }]);
    }
  }
  /**
   *	Returns undefined if there should be no change, and an empty array if all items should be removed.
   */
  _getItemsForCell() {
    const runState = this._executionStateService.getCellExecution(this._cell.uri);
    if (runState?.state === 3 /* Executing */ && typeof this._showedExecutingStateTime !== "number") {
      this._showedExecutingStateTime = Date.now();
    } else if (runState?.state !== 3 /* Executing */ && typeof this._showedExecutingStateTime === "number") {
      const timeUntilMin = ExecutionStateCellStatusBarItem.MIN_SPINNER_TIME - (Date.now() - this._showedExecutingStateTime);
      if (timeUntilMin > 0) {
        if (!this._clearExecutingStateTimer.value) {
          this._clearExecutingStateTimer.value = disposableTimeout(() => {
            this._showedExecutingStateTime = void 0;
            this._clearExecutingStateTimer.clear();
            this._update();
          }, timeUntilMin);
        }
        return void 0;
      } else {
        this._showedExecutingStateTime = void 0;
      }
    }
    const items = this._getItemForState(runState, this._cell.internalMetadata);
    return items;
  }
  _getItemForState(runState, internalMetadata) {
    const state = runState?.state;
    const { lastRunSuccess } = internalMetadata;
    if (!state && lastRunSuccess) {
      return [{
        text: `$(${successStateIcon.id})`,
        color: themeColorFromId2(cellStatusIconSuccess),
        tooltip: localize(17411, null),
        alignment: 1 /* Left */,
        priority: Number.MAX_SAFE_INTEGER
      }];
    } else if (!state && lastRunSuccess === false) {
      return [{
        text: `$(${errorStateIcon.id})`,
        color: themeColorFromId2(cellStatusIconError),
        tooltip: localize(17409, null),
        alignment: 1 /* Left */,
        priority: Number.MAX_SAFE_INTEGER
      }];
    } else if (state === 2 /* Pending */ || state === 1 /* Unconfirmed */) {
      return [{
        text: `$(${pendingStateIcon.id})`,
        tooltip: localize(17410, null),
        alignment: 1 /* Left */,
        priority: Number.MAX_SAFE_INTEGER
      }];
    } else if (state === 3 /* Executing */) {
      const icon2 = runState?.didPause ? executingStateIcon : ThemeIcon.modify(executingStateIcon, "spin");
      return [{
        text: `$(${icon2.id})`,
        tooltip: localize(17408, null),
        alignment: 1 /* Left */,
        priority: Number.MAX_SAFE_INTEGER
      }];
    }
    return [];
  }
  dispose() {
    super.dispose();
    this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items: [] }]);
  }
};

ExecutionStateCellStatusBarItem = __decorateClass([
  __decorateParam(2, INotebookExecutionStateService)
], ExecutionStateCellStatusBarItem);

var TimerCellStatusBarContrib = class extends Disposable {
  static {
    this.id = "workbench.notebook.statusBar.execTimer";
  }
  constructor(notebookEditor, instantiationService) {
    super();
    this._register(new NotebookStatusBarController(notebookEditor, (vm, cell) => instantiationService.createInstance(TimerCellStatusBarItem, vm, cell)));
  }
};

TimerCellStatusBarContrib = __decorateClass([
  __decorateParam(1, IInstantiationService)
], TimerCellStatusBarContrib);

registerNotebookContribution(TimerCellStatusBarContrib.id, TimerCellStatusBarContrib);

var UPDATE_TIMER_GRACE_PERIOD = 200;

var TimerCellStatusBarItem = class extends Disposable {
  constructor(_notebookViewModel, _cell, _executionStateService, _notebookService, _configurationService) {
    super();
    this._notebookViewModel = _notebookViewModel;
    this._cell = _cell;
    this._executionStateService = _executionStateService;
    this._notebookService = _notebookService;
    this._configurationService = _configurationService;
    this._currentItemIds = [];
    this._isVerbose = this._configurationService.getValue(NotebookSetting.cellExecutionTimeVerbosity) === "verbose";
    this._scheduler = this._register(new RunOnceScheduler(() => this._update(), TimerCellStatusBarItem.UPDATE_INTERVAL));
    this._update();
    this._register(this._cell.model.onDidChangeInternalMetadata(() => this._update()));
    this._register(this._configurationService.onDidChangeConfiguration((e4) => {
      if (e4.affectsConfiguration(NotebookSetting.cellExecutionTimeVerbosity)) {
        this._isVerbose = this._configurationService.getValue(NotebookSetting.cellExecutionTimeVerbosity) === "verbose";
        this._update();
      }
    }));
  }
  static {
    this.UPDATE_INTERVAL = 100;
  }
  async _update() {
    let timerItem;
    const runState = this._executionStateService.getCellExecution(this._cell.uri);
    const state = runState?.state;
    const startTime = this._cell.internalMetadata.runStartTime;
    const adjustment = this._cell.internalMetadata.runStartTimeAdjustment ?? 0;
    const endTime = this._cell.internalMetadata.runEndTime;
    if (runState?.didPause) {
      timerItem = void 0;
    } else if (state === 3 /* Executing */) {
      if (typeof startTime === "number") {
        timerItem = this._getTimeItem(startTime, Date.now(), adjustment);
        this._scheduler.schedule();
      }
    } else if (!state) {
      if (typeof startTime === "number" && typeof endTime === "number") {
        const timerDuration = Date.now() - startTime + adjustment;
        const executionDuration = endTime - startTime;
        const renderDuration = this._cell.internalMetadata.renderDuration ?? {};
        timerItem = this._getTimeItem(startTime, endTime, void 0, {
          timerDuration,
          executionDuration,
          renderDuration
        });
      }
    }
    const items = timerItem ? [timerItem] : [];
    if (!items.length && !!runState) {
      if (!this._deferredUpdate) {
        this._deferredUpdate = disposableTimeout(() => {
          this._deferredUpdate = void 0;
          this._currentItemIds = this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items }]);
        }, UPDATE_TIMER_GRACE_PERIOD, this._store);
      }
    } else {
      this._deferredUpdate?.dispose();
      this._deferredUpdate = void 0;
      this._currentItemIds = this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items }]);
    }
  }
  _getTimeItem(startTime, endTime, adjustment = 0, runtimeInformation) {
    const duration = endTime - startTime + adjustment;
    let tooltip;
    const lastExecution = new Date(endTime).toLocaleTimeString(language);
    if (runtimeInformation) {
      const { renderDuration, executionDuration, timerDuration } = runtimeInformation;
      let renderTimes = "";
      for (const key3 in renderDuration) {
        const rendererInfo = this._notebookService.getRendererInfo(key3);
        const args2 = encodeURIComponent(JSON.stringify({
          extensionId: rendererInfo?.extensionId.value ?? "",
          issueBody: `Auto-generated text from notebook cell performance - Please add an explanation for the performance issue, including cell content if possible.
The duration for the renderer, ${rendererInfo?.displayName ?? key3}, is slower than expected.
Execution Time: ${formatCellDuration(executionDuration)}
Renderer Duration: ${formatCellDuration(renderDuration[key3])}
`
        }));
        const renderIssueLink = renderDuration[key3] > 200 && executionDuration < 2e3 || renderDuration[key3] > 1e3;
        const linkText = rendererInfo?.displayName ?? key3;
        const rendererTitle = renderIssueLink ? `[${linkText}](command:workbench.action.openIssueReporter?${args2})` : `**${linkText}**`;
        renderTimes += `- ${rendererTitle} ${formatCellDuration(renderDuration[key3])}
`;
      }
      renderTimes += `
*${localize(17413, null)}*
`;
      tooltip = {
        value: localize(17412, null, lastExecution, formatCellDuration(executionDuration), formatCellDuration(timerDuration - executionDuration), renderTimes),
        isTrusted: true
      };
    }
    const executionText = this._isVerbose ? localize(17414, null, lastExecution, formatCellDuration(duration, false)) : formatCellDuration(duration, false);
    return {
      text: executionText,
      alignment: 1 /* Left */,
      priority: Number.MAX_SAFE_INTEGER - 5,
      tooltip
    };
  }
  dispose() {
    super.dispose();
    this._deferredUpdate?.dispose();
    this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items: [] }]);
  }
};

TimerCellStatusBarItem = __decorateClass([
  __decorateParam(2, INotebookExecutionStateService),
  __decorateParam(3, INotebookService),
  __decorateParam(4, IConfigurationService)
], TimerCellStatusBarItem);
export { formatCellDuration, NotebookStatusBarController, ExecutionStateCellStatusBarContrib, ExecutionStateCellStatusBarItem, TimerCellStatusBarContrib, UPDATE_TIMER_GRACE_PERIOD, TimerCellStatusBarItem };
