// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/tasks/browser/taskTerminalStatus.ts
import { spinningLoading } from "./module-0479.mjs";
import { severity_default } from "./module-0266.mjs";
import { localize } from "./module-0001.mjs";
import { Codicon } from "./module-0085.mjs";
import { Disposable, DisposableMap, DisposableStore } from "./module-0012.mjs";
import { AccessibilitySignal, IAccessibilitySignalService } from "./module-0445.mjs";
import { StartStopProblemCollector } from "./module-3472.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITaskService } from "./module-1404.mjs";


// src/vs/workbench/contrib/tasks/browser/taskTerminalStatus.ts
var TASK_TERMINAL_STATUS_ID = "task_terminal_status";

var ACTIVE_TASK_STATUS = { id: TASK_TERMINAL_STATUS_ID, icon: spinningLoading, severity: severity_default.Info, tooltip: localize(19649, null) };

var SUCCEEDED_TASK_STATUS = { id: TASK_TERMINAL_STATUS_ID, icon: Codicon.check, severity: severity_default.Info, tooltip: localize(19654, null) };

var SUCCEEDED_INACTIVE_TASK_STATUS = { id: TASK_TERMINAL_STATUS_ID, icon: Codicon.check, severity: severity_default.Info, tooltip: localize(19655, null) };

var FAILED_TASK_STATUS = { id: TASK_TERMINAL_STATUS_ID, icon: Codicon.error, severity: severity_default.Error, tooltip: localize(19650, null) };

var FAILED_INACTIVE_TASK_STATUS = { id: TASK_TERMINAL_STATUS_ID, icon: Codicon.error, severity: severity_default.Error, tooltip: localize(19651, null) };

var WARNING_TASK_STATUS = { id: TASK_TERMINAL_STATUS_ID, icon: Codicon.warning, severity: severity_default.Warning, tooltip: localize(19656, null) };

var WARNING_INACTIVE_TASK_STATUS = { id: TASK_TERMINAL_STATUS_ID, icon: Codicon.warning, severity: severity_default.Warning, tooltip: localize(19657, null) };

var INFO_TASK_STATUS = { id: TASK_TERMINAL_STATUS_ID, icon: Codicon.info, severity: severity_default.Info, tooltip: localize(19652, null) };

var INFO_INACTIVE_TASK_STATUS = { id: TASK_TERMINAL_STATUS_ID, icon: Codicon.info, severity: severity_default.Info, tooltip: localize(19653, null) };

var TaskTerminalStatus = class extends Disposable {
  constructor(taskService, _accessibilitySignalService) {
    super();
    this._accessibilitySignalService = _accessibilitySignalService;
    this.terminalMap = this._register(new DisposableMap());
    this._register(taskService.onDidStateChange((event) => {
      switch (event.kind) {
        case "processStarted" /* ProcessStarted */:
        case "active" /* Active */:
          this.eventActive(event);
          break;
        case "inactive" /* Inactive */:
          this.eventInactive(event);
          break;
        case "processEnded" /* ProcessEnded */:
          this.eventEnd(event);
          break;
      }
    }));
  }
  addTerminal(task, terminal2, problemMatcher) {
    const status2 = { id: TASK_TERMINAL_STATUS_ID, severity: severity_default.Info };
    terminal2.statusList.add(status2);
    const store = new DisposableStore();
    store.add(problemMatcher.onDidFindFirstMatch(() => {
      this._marker = terminal2.registerMarker();
      if (this._marker) {
        store.add(this._marker);
      }
    }));
    store.add(problemMatcher.onDidFindErrors(() => {
      if (this._marker) {
        terminal2.addBufferMarker({ marker: this._marker, hoverMessage: localize(19648, null), disableCommandStorage: true });
      }
    }));
    store.add(problemMatcher.onDidRequestInvalidateLastMarker(() => {
      this._marker?.dispose();
      this._marker = void 0;
    }));
    store.add(terminal2.onDisposed(() => {
      this.terminalMap.deleteAndDispose(terminal2.instanceId);
    }));
    this.terminalMap.set(terminal2.instanceId, {
      terminal: terminal2,
      task,
      status: status2,
      problemMatcher,
      taskRunEnded: false,
      dispose() {
        store.dispose();
      }
    });
  }
  terminalFromEvent(event) {
    if (!Object.hasOwn(event, "terminalId") || !event.terminalId) {
      return void 0;
    }
    return this.terminalMap.get(event.terminalId);
  }
  eventEnd(event) {
    const terminalData = this.terminalFromEvent(event);
    if (!terminalData) {
      return;
    }
    terminalData.taskRunEnded = true;
    terminalData.terminal.statusList.remove(terminalData.status);
    if (event.exitCode === 0 && (!terminalData.problemMatcher.maxMarkerSeverity || terminalData.problemMatcher.maxMarkerSeverity < 4 /* Warning */)) {
      this._accessibilitySignalService.playSignal(AccessibilitySignal.taskCompleted);
      if (terminalData.task.configurationProperties.isBackground) {
        for (const status2 of terminalData.terminal.statusList.statuses) {
          terminalData.terminal.statusList.remove(status2);
        }
      } else {
        terminalData.terminal.statusList.add(SUCCEEDED_TASK_STATUS);
      }
    } else if (event.exitCode || terminalData.problemMatcher.maxMarkerSeverity !== void 0 && terminalData.problemMatcher.maxMarkerSeverity === 8 /* Error */) {
      this._accessibilitySignalService.playSignal(AccessibilitySignal.taskFailed);
      terminalData.terminal.statusList.add(FAILED_TASK_STATUS);
    } else if (terminalData.problemMatcher.maxMarkerSeverity === 4 /* Warning */) {
      this._accessibilitySignalService.playSignal(AccessibilitySignal.taskFailed);
      terminalData.terminal.statusList.add(WARNING_TASK_STATUS);
    } else if (terminalData.problemMatcher.maxMarkerSeverity === 2 /* Info */) {
      terminalData.terminal.statusList.add(INFO_TASK_STATUS);
    }
  }
  eventInactive(event) {
    const terminalData = this.terminalFromEvent(event);
    if (!terminalData || !terminalData.problemMatcher || terminalData.taskRunEnded) {
      return;
    }
    terminalData.terminal.statusList.remove(terminalData.status);
    if (terminalData.problemMatcher.numberOfMatches === 0) {
      this._accessibilitySignalService.playSignal(AccessibilitySignal.taskCompleted);
      terminalData.terminal.statusList.add(SUCCEEDED_INACTIVE_TASK_STATUS);
    } else if (terminalData.problemMatcher.maxMarkerSeverity === 8 /* Error */) {
      this._accessibilitySignalService.playSignal(AccessibilitySignal.taskFailed);
      terminalData.terminal.statusList.add(FAILED_INACTIVE_TASK_STATUS);
    } else if (terminalData.problemMatcher.maxMarkerSeverity === 4 /* Warning */) {
      terminalData.terminal.statusList.add(WARNING_INACTIVE_TASK_STATUS);
    } else if (terminalData.problemMatcher.maxMarkerSeverity === 2 /* Info */) {
      terminalData.terminal.statusList.add(INFO_INACTIVE_TASK_STATUS);
    }
  }
  eventActive(event) {
    const terminalData = this.terminalFromEvent(event);
    if (!terminalData) {
      return;
    }
    terminalData.taskRunEnded = false;
    terminalData.terminal.statusList.remove(terminalData.status);
    if (terminalData.problemMatcher instanceof StartStopProblemCollector || terminalData.problemMatcher?.problemMatchers.length > 0 || event.runType === "singleRun" /* SingleRun */) {
      terminalData.terminal.statusList.add(ACTIVE_TASK_STATUS);
    }
  }
};

TaskTerminalStatus = __decorateClass([
  __decorateParam(0, ITaskService),
  __decorateParam(1, IAccessibilitySignalService)
], TaskTerminalStatus);
export { TASK_TERMINAL_STATUS_ID, ACTIVE_TASK_STATUS, SUCCEEDED_TASK_STATUS, SUCCEEDED_INACTIVE_TASK_STATUS, FAILED_TASK_STATUS, FAILED_INACTIVE_TASK_STATUS, WARNING_TASK_STATUS, WARNING_INACTIVE_TASK_STATUS, INFO_TASK_STATUS, INFO_INACTIVE_TASK_STATUS, TaskTerminalStatus };
