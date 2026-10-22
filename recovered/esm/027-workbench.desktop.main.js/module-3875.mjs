// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/timer/electron-browser/timerService.ts
import { AbstractTimerService, ITimerService } from "./module-1183.mjs";
import { process2 } from "./module-3724.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3727.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IWorkspaceContextService } from "./module-0509.mjs";
import { IExtensionService } from "./module-0887.mjs";
import { IUpdateService } from "./module-1181.mjs";
import { IPaneCompositePartService } from "./module-1092.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IAccessibilityService } from "./module-0104.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { IWorkbenchLayoutService } from "./module-1118.mjs";
import { IProductService } from "./module-0873.mjs";
import { IStorageService } from "./module-0512.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/workbench/services/timer/electron-browser/timerService.ts
var TimerService = class extends AbstractTimerService {
  constructor(_nativeHostService, _environmentService, lifecycleService, contextService, extensionService, updateService, paneCompositeService, editorService, accessibilityService, telemetryService, layoutService, _productService, _storageService) {
    super(lifecycleService, contextService, extensionService, updateService, paneCompositeService, editorService, accessibilityService, telemetryService, layoutService);
    this._nativeHostService = _nativeHostService;
    this._environmentService = _environmentService;
    this._productService = _productService;
    this._storageService = _storageService;
    this.setPerformanceMarks("main", _environmentService.window.perfMarks);
  }
  _isInitialStartup() {
    return Boolean(this._environmentService.window.isInitialStartup);
  }
  _didUseCachedData() {
    return didUseCachedData(this._productService, this._storageService, this._environmentService);
  }
  _getWindowCount() {
    return this._nativeHostService.getWindowCount();
  }
  async _extendStartupInfo(info) {
    try {
      const [osProperties, osStatistics, virtualMachineHint, isARM64Emulated] = await Promise.all([
        this._nativeHostService.getOSProperties(),
        this._nativeHostService.getOSStatistics(),
        this._nativeHostService.getOSVirtualMachineHint(),
        this._nativeHostService.isRunningUnderARM64Translation()
      ]);
      info.totalmem = osStatistics.totalmem;
      info.freemem = osStatistics.freemem;
      info.platform = osProperties.platform;
      info.release = osProperties.release;
      info.arch = osProperties.arch;
      info.loadavg = osStatistics.loadavg;
      info.isARM64Emulated = isARM64Emulated;
      const processMemoryInfo = await process2.getProcessMemoryInfo();
      info.meminfo = {
        workingSetSize: processMemoryInfo.residentSet,
        privateBytes: processMemoryInfo.private,
        sharedBytes: processMemoryInfo.shared
      };
      info.isVMLikelyhood = Math.round(virtualMachineHint * 100);
      const rawCpus = osProperties.cpus;
      if (rawCpus && rawCpus.length > 0) {
        info.cpus = { count: rawCpus.length, speed: rawCpus[0].speed, model: rawCpus[0].model };
      }
    } catch (error) {
    }
  }
  _shouldReportPerfMarks() {
    return super._shouldReportPerfMarks() || Boolean(this._environmentService.args["prof-append-timers"]);
  }
};

TimerService = __decorateClass([
  __decorateParam(0, INativeHostService),
  __decorateParam(1, INativeWorkbenchEnvironmentService),
  __decorateParam(2, ILifecycleService),
  __decorateParam(3, IWorkspaceContextService),
  __decorateParam(4, IExtensionService),
  __decorateParam(5, IUpdateService),
  __decorateParam(6, IPaneCompositePartService),
  __decorateParam(7, IEditorService),
  __decorateParam(8, IAccessibilityService),
  __decorateParam(9, ITelemetryService),
  __decorateParam(10, IWorkbenchLayoutService),
  __decorateParam(11, IProductService),
  __decorateParam(12, IStorageService)
], TimerService);

registerSingleton(ITimerService, TimerService, 1 /* Delayed */);

var lastRunningCommitStorageKey = "perf/lastRunningCommit";

var _didUseCachedData = void 0;

function didUseCachedData(productService, storageService, environmentService) {
  if (typeof _didUseCachedData !== "boolean") {
    if (!environmentService.window.isCodeCaching || !productService.commit) {
      _didUseCachedData = false;
    } else if (storageService.get(lastRunningCommitStorageKey, -1 /* APPLICATION */) === productService.commit) {
      _didUseCachedData = true;
    } else {
      storageService.store(lastRunningCommitStorageKey, productService.commit, -1 /* APPLICATION */, 1 /* MACHINE */);
      _didUseCachedData = false;
    }
  }
  return _didUseCachedData;
}
export { didUseCachedData, TimerService, lastRunningCommitStorageKey, _didUseCachedData };
