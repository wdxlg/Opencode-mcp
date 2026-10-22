// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/timer/browser/timerService.ts
import { createDecorator } from "./module-0077.mjs";
import { Barrier, timeout } from "./module-0036.mjs";
import { Registry } from "./module-0090.mjs";
import { TerminalExtensions } from "./module-1154.mjs";
import { getMarks } from "./module-0506.mjs";
import { createBlobWorker } from "./module-1182.mjs";
import { TelemetryTrustedValue } from "./module-0885.mjs";
import { isWeb } from "./module-0014.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IUpdateService } from "./module-1181.mjs";
import { IPaneCompositePartService } from "./module-1092.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";


// src/vs/workbench/services/timer/browser/timerService.ts
var ITimerService = createDecorator("timerService");

var PerfMarks = class {
  constructor() {
    this._entries = [];
  }
  setMarks(source, entries2) {
    this._entries.push([source, entries2]);
  }
  getDuration(from, to) {
    const fromEntry = this._findEntry(from);
    if (!fromEntry) {
      return 0;
    }
    const toEntry2 = this._findEntry(to);
    if (!toEntry2) {
      return 0;
    }
    return toEntry2.startTime - fromEntry.startTime;
  }
  getStartTime(mark2) {
    const entry = this._findEntry(mark2);
    return entry ? entry.startTime : -1;
  }
  _findEntry(name) {
    for (const [, marks] of this._entries) {
      for (let i2 = marks.length - 1; i2 >= 0; i2--) {
        if (marks[i2].name === name) {
          return marks[i2];
        }
      }
    }
  }
  getEntries() {
    return this._entries.slice(0);
  }
};

var AbstractTimerService = class {
  constructor(_lifecycleService, _contextService, _extensionService, _updateService, _paneCompositeService, _editorService, _accessibilityService, _telemetryService, layoutService) {
    this._lifecycleService = _lifecycleService;
    this._contextService = _contextService;
    this._extensionService = _extensionService;
    this._updateService = _updateService;
    this._paneCompositeService = _paneCompositeService;
    this._editorService = _editorService;
    this._accessibilityService = _accessibilityService;
    this._telemetryService = _telemetryService;
    this._barrier = new Barrier();
    this._marks = new PerfMarks();
    this._rndValueShouldSendTelemetry = Math.random() < 0.03;
    Promise.all([
      this._extensionService.whenInstalledExtensionsRegistered(),
      // extensions registered
      _lifecycleService.when(3 /* Restored */),
      // workbench created and parts restored
      layoutService.whenRestored,
      // layout restored (including visible editors resolved)
      Promise.all(Array.from(Registry.as(TerminalExtensions.Backend).backends.values()).map((e) => e.whenReady))
    ]).then(() => {
      this.setPerformanceMarks("renderer", getMarks());
      return this._computeStartupMetrics();
    }).then((metrics) => {
      this._startupMetrics = metrics;
      this._reportStartupTimes(metrics);
      this._barrier.open();
    });
    this.perfBaseline = this._barrier.wait().then(() => this._lifecycleService.when(4 /* Eventually */)).then(() => timeout(this._startupMetrics.timers.ellapsedRequire)).then(() => {
      const jsSrc = (function() {
        let tooSlow = false;
        function fib(n2) {
          if (tooSlow) {
            return 0;
          }
          if (performance.now() - t1 >= 1e3) {
            tooSlow = true;
          }
          if (n2 <= 2) {
            return n2;
          }
          return fib(n2 - 1) + fib(n2 - 2);
        }
        const t1 = performance.now();
        fib(24);
        const value2 = Math.round(performance.now() - t1);
        self.postMessage({ value: tooSlow ? -1 : value2 });
      }).toString();
      const blob = new Blob([`(${jsSrc})();`], { type: "application/javascript" });
      const blobUrl = URL.createObjectURL(blob);
      const worker = createBlobWorker(blobUrl, { name: "perfBaseline" });
      return new Promise((resolve3) => {
        worker.onmessage = (e) => resolve3(e.data.value);
      }).finally(() => {
        worker.terminate();
        URL.revokeObjectURL(blobUrl);
      });
    });
  }
  whenReady() {
    return this._barrier.wait();
  }
  get startupMetrics() {
    if (!this._startupMetrics) {
      throw new Error("illegal state, MUST NOT access startupMetrics before whenReady has resolved");
    }
    return this._startupMetrics;
  }
  setPerformanceMarks(source, marks) {
    const codeMarks = marks.filter((mark2) => mark2.name.startsWith("code/"));
    this._marks.setMarks(source, codeMarks);
    this._reportPerformanceMarks(source, codeMarks);
  }
  getPerformanceMarks() {
    return this._marks.getEntries();
  }
  getDuration(from, to) {
    return this._marks.getDuration(from, to);
  }
  getStartTime(mark2) {
    return this._marks.getStartTime(mark2);
  }
  _reportStartupTimes(metrics) {
    this._telemetryService.publicLog("startupTimeVaried", metrics);
  }
  _shouldReportPerfMarks() {
    return this._rndValueShouldSendTelemetry;
  }
  _reportPerformanceMarks(source, marks) {
    if (!this._shouldReportPerfMarks()) {
      return;
    }
    for (const mark2 of marks) {
      this._telemetryService.publicLog2("startup.timer.mark", {
        source,
        name: new TelemetryTrustedValue(mark2.name),
        startTime: mark2.startTime
      });
    }
  }
  async _computeStartupMetrics() {
    const initialStartup = this._isInitialStartup();
    let startMark;
    if (isWeb) {
      startMark = "code/timeOrigin";
    } else {
      startMark = initialStartup ? "code/didStartMain" : "code/willOpenNewWindow";
    }
    const activeViewlet = this._paneCompositeService.getActivePaneComposite(0 /* Sidebar */);
    const activeAuxiliaryViewlet = this._paneCompositeService.getActivePaneComposite(2 /* AuxiliaryBar */);
    const activePanel = this._paneCompositeService.getActivePaneComposite(1 /* Panel */);
    const info = {
      ellapsed: this._marks.getDuration(startMark, "code/didStartWorkbench"),
      // reflections
      isLatestVersion: Boolean(await this._updateService.isLatestVersion()),
      didUseCachedData: this._didUseCachedData(),
      windowKind: this._lifecycleService.startupKind,
      windowCount: await this._getWindowCount(),
      viewletId: activeViewlet?.getId(),
      auxiliaryViewletId: activeAuxiliaryViewlet?.getId(),
      editorIds: this._editorService.visibleEditors.map((input) => input.typeId),
      panelId: activePanel ? activePanel.getId() : void 0,
      // timers
      timers: {
        ellapsedAppReady: initialStartup ? this._marks.getDuration("code/didStartMain", "code/mainAppReady") : void 0,
        ellapsedNlsGeneration: initialStartup ? this._marks.getDuration("code/willGenerateNls", "code/didGenerateNls") : void 0,
        ellapsedLoadMainBundle: initialStartup ? this._marks.getDuration("code/willLoadMainBundle", "code/didLoadMainBundle") : void 0,
        ellapsedRunMainBundle: initialStartup ? this._marks.getDuration("code/didStartMain", "code/didRunMainBundle") : void 0,
        ellapsedCrashReporter: initialStartup ? this._marks.getDuration("code/willStartCrashReporter", "code/didStartCrashReporter") : void 0,
        ellapsedMainServer: initialStartup ? this._marks.getDuration("code/willStartMainServer", "code/didStartMainServer") : void 0,
        ellapsedWindowCreate: initialStartup ? this._marks.getDuration("code/willCreateCodeWindow", "code/didCreateCodeWindow") : void 0,
        ellapsedWindowRestoreState: initialStartup ? this._marks.getDuration("code/willRestoreCodeWindowState", "code/didRestoreCodeWindowState") : void 0,
        ellapsedBrowserWindowCreate: initialStartup ? this._marks.getDuration("code/willCreateCodeBrowserWindow", "code/didCreateCodeBrowserWindow") : void 0,
        ellapsedWindowMaximize: initialStartup ? this._marks.getDuration("code/willMaximizeCodeWindow", "code/didMaximizeCodeWindow") : void 0,
        ellapsedWindowLoad: initialStartup ? this._marks.getDuration("code/mainAppReady", "code/willOpenNewWindow") : void 0,
        ellapsedWindowLoadToRequire: this._marks.getDuration("code/willOpenNewWindow", "code/willLoadWorkbenchMain"),
        ellapsedRequire: this._marks.getDuration("code/willLoadWorkbenchMain", "code/didLoadWorkbenchMain"),
        ellapsedWaitForWindowConfig: this._marks.getDuration("code/willWaitForWindowConfig", "code/didWaitForWindowConfig"),
        ellapsedStorageInit: this._marks.getDuration("code/willInitStorage", "code/didInitStorage"),
        ellapsedSharedProcesConnected: this._marks.getDuration("code/willConnectSharedProcess", "code/didConnectSharedProcess"),
        ellapsedWorkspaceServiceInit: this._marks.getDuration("code/willInitWorkspaceService", "code/didInitWorkspaceService"),
        ellapsedRequiredUserDataInit: this._marks.getDuration("code/willInitRequiredUserData", "code/didInitRequiredUserData"),
        ellapsedOtherUserDataInit: this._marks.getDuration("code/willInitOtherUserData", "code/didInitOtherUserData"),
        ellapsedExtensions: this._marks.getDuration("code/willLoadExtensions", "code/didLoadExtensions"),
        ellapsedEditorRestore: this._marks.getDuration("code/willRestoreEditors", "code/didRestoreEditors"),
        ellapsedViewletRestore: this._marks.getDuration("code/willRestoreViewlet", "code/didRestoreViewlet"),
        ellapsedAuxiliaryViewletRestore: this._marks.getDuration("code/willRestoreAuxiliaryBar", "code/didRestoreAuxiliaryBar"),
        ellapsedPanelRestore: this._marks.getDuration("code/willRestorePanel", "code/didRestorePanel"),
        ellapsedWorkbenchContributions: this._marks.getDuration("code/willCreateWorkbenchContributions/1", "code/didCreateWorkbenchContributions/2"),
        ellapsedWorkbench: this._marks.getDuration("code/willStartWorkbench", "code/didStartWorkbench"),
        ellapsedExtensionsReady: this._marks.getDuration(startMark, "code/didLoadExtensions"),
        ellapsedRenderer: this._marks.getDuration("code/didStartRenderer", "code/didStartWorkbench")
      },
      // system info
      platform: void 0,
      release: void 0,
      arch: void 0,
      totalmem: void 0,
      freemem: void 0,
      meminfo: void 0,
      cpus: void 0,
      loadavg: void 0,
      isVMLikelyhood: void 0,
      initialStartup,
      hasAccessibilitySupport: this._accessibilityService.isScreenReaderOptimized(),
      emptyWorkbench: this._contextService.getWorkbenchState() === 1 /* EMPTY */
    };
    await this._extendStartupInfo(info);
    return info;
  }
};

AbstractTimerService = __decorateClass([
  __decorateParam(0, ILifecycleService),
  __decorateParam(1, IWorkspaceContextService),
  __decorateParam(2, IExtensionService),
  __decorateParam(3, IUpdateService),
  __decorateParam(4, IPaneCompositePartService),
  __decorateParam(5, IEditorService),
  __decorateParam(6, IAccessibilityService),
  __decorateParam(7, ITelemetryService),
  __decorateParam(8, IWorkbenchLayoutService)
], AbstractTimerService);
export { ITimerService, PerfMarks, AbstractTimerService };
