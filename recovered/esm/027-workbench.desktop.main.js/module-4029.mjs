// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/performance/electron-browser/startupTimings.ts
import { StartupTimings } from "./module-4028.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { timeout } from "./module-0036.mjs";
import { coalesce } from "./module-0007.mjs";
import { URI } from "./module-0032.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IFileService } from "./module-0269.mjs";
import { ITimerService } from "./module-1183.mjs";
import { INativeHostService } from "./module-2591.mjs";
import { IEditorService } from "./module-0934.mjs";
import { IPaneCompositePartService } from "./module-1092.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ILifecycleService } from "./module-0868.mjs";
import { IUpdateService } from "./module-1181.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3727.mjs";
import { IProductService } from "./module-0873.mjs";
import { IWorkspaceTrustManagementService } from "./module-0854.mjs";
import { IStorageService } from "./module-0512.mjs";


// src/vs/workbench/contrib/performance/electron-browser/startupTimings.ts
var NativeStartupTimings = class extends StartupTimings {
  constructor(_fileService, _timerService, _nativeHostService, editorService, paneCompositeService, _telemetryService, lifecycleService, updateService, _environmentService, _productService, workspaceTrustService, _storageService) {
    super(editorService, paneCompositeService, lifecycleService, updateService, workspaceTrustService);
    this._fileService = _fileService;
    this._timerService = _timerService;
    this._nativeHostService = _nativeHostService;
    this._telemetryService = _telemetryService;
    this._environmentService = _environmentService;
    this._productService = _productService;
    this._storageService = _storageService;
    this._report().catch(onUnexpectedError);
  }
  async _report() {
    const standardStartupError = await this._isStandardStartup();
    this._appendStartupTimes(standardStartupError).catch(onUnexpectedError);
  }
  async _appendStartupTimes(standardStartupError) {
    const appendTo = this._environmentService.args["prof-append-timers"];
    const durationMarkers = this._environmentService.args["prof-duration-markers"];
    const durationMarkersFile = this._environmentService.args["prof-duration-markers-file"];
    if (!appendTo && !durationMarkers) {
      return;
    }
    try {
      await Promise.all([
        this._timerService.whenReady(),
        timeout(15e3)
        // wait: cached data creation, telemetry sending
      ]);
      const perfBaseline = await this._timerService.perfBaseline;
      const heapStatistics = await this._resolveStartupHeapStatistics();
      if (heapStatistics) {
        this._telemetryLogHeapStatistics(heapStatistics);
      }
      if (appendTo) {
        const content2 = coalesce([
          this._timerService.startupMetrics.ellapsed,
          this._productService.nameShort,
          (this._productService.commit || "").slice(0, 10) || "0000000000",
          this._telemetryService.sessionId,
          standardStartupError === void 0 ? "standard_start" : `NO_standard_start : ${standardStartupError}`,
          `${String(perfBaseline).padStart(4, "0")}ms`,
          heapStatistics ? this._printStartupHeapStatistics(heapStatistics) : void 0
        ]).join("	") + "\n";
        await this._appendContent(URI.file(appendTo), content2);
      }
      if (durationMarkers?.length) {
        const durations = [];
        for (const durationMarker of durationMarkers) {
          let duration = 0;
          if (durationMarker === "ellapsed") {
            duration = this._timerService.startupMetrics.ellapsed;
          } else if (durationMarker.indexOf("-") !== -1) {
            const markers = durationMarker.split("-");
            if (markers.length === 2) {
              duration = this._timerService.getDuration(markers[0], markers[1]);
            }
          }
          if (duration) {
            durations.push(durationMarker);
            durations.push(`${duration}`);
          }
        }
        const durationsContent = `${durations.join("	")}
`;
        if (durationMarkersFile) {
          await this._appendContent(URI.file(durationMarkersFile), durationsContent);
        } else {
          console.log(durationsContent);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      let exitCode = 0;
      try {
        await Promise.race([
          this._storageService.flush(1 /* SHUTDOWN */),
          timeout(5e3).then(() => {
            throw new Error("Timed out flushing profiled startup state.");
          })
        ]);
      } catch (error) {
        exitCode = 1;
        console.error(error);
      } finally {
        this._nativeHostService.exit(exitCode);
      }
    }
  }
  async _isStandardStartup() {
    const windowCount = await this._nativeHostService.getWindowCount();
    if (windowCount !== 1) {
      return `Expected window count : 1, Actual : ${windowCount}`;
    }
    return super._isStandardStartup();
  }
  async _appendContent(file, content2) {
    const chunks = [];
    if (await this._fileService.exists(file)) {
      chunks.push((await this._fileService.readFile(file)).value);
    }
    chunks.push(VSBuffer.fromString(content2));
    await this._fileService.writeFile(file, VSBuffer.concat(chunks));
  }
  async _resolveStartupHeapStatistics() {
    if (!this._environmentService.args["enable-tracing"] || !this._environmentService.args["trace-startup-file"] || this._environmentService.args["trace-startup-format"] !== "json" || !this._environmentService.args["trace-startup-duration"]) {
      return void 0;
    }
    const windowProcessId = await this._nativeHostService.getProcessId();
    const used = performance.memory?.usedJSHeapSize ?? 0;
    let minorGCs = 0;
    let majorGCs = 0;
    let garbage = 0;
    let duration = 0;
    try {
      const traceContents = JSON.parse((await this._fileService.readFile(URI.file(this._environmentService.args["trace-startup-file"]))).value.toString());
      for (const event of traceContents.traceEvents) {
        if (event.pid !== windowProcessId) {
          continue;
        }
        switch (event.name) {
          // Major/Minor GC Events
          case "MinorGC":
            minorGCs++;
            break;
          case "MajorGC":
            majorGCs++;
            break;
          // GC Events that block the main thread
          // Refs: https://v8.dev/blog/trash-talk
          case "V8.GCFinalizeMC":
          case "V8.GCScavenger":
            duration += event.dur;
            break;
        }
        if (event.name === "MajorGC" || event.name === "MinorGC") {
          if (typeof event.args?.usedHeapSizeAfter === "number" && typeof event.args.usedHeapSizeBefore === "number") {
            garbage += event.args.usedHeapSizeBefore - event.args.usedHeapSizeAfter;
          }
        }
      }
      return { minorGCs, majorGCs, used, garbage, duration: Math.round(duration / 1e3) };
    } catch (error) {
      console.error(error);
    }
    return void 0;
  }
  _telemetryLogHeapStatistics({ used, garbage, majorGCs, minorGCs, duration }) {
    this._telemetryService.publicLog2("startupHeapStatistics", {
      heapUsed: used,
      heapGarbage: garbage,
      majorGCs,
      minorGCs,
      gcsDuration: duration
    });
  }
  _printStartupHeapStatistics({ used, garbage, majorGCs, minorGCs, duration }) {
    const MB = 1024 * 1024;
    return `Heap: ${Math.round(used / MB)}MB (used) ${Math.round(garbage / MB)}MB (garbage) ${majorGCs} (MajorGC) ${minorGCs} (MinorGC) ${duration}ms (GC duration)`;
  }
};

NativeStartupTimings = __decorateClass([
  __decorateParam(0, IFileService),
  __decorateParam(1, ITimerService),
  __decorateParam(2, INativeHostService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, IPaneCompositePartService),
  __decorateParam(5, ITelemetryService),
  __decorateParam(6, ILifecycleService),
  __decorateParam(7, IUpdateService),
  __decorateParam(8, INativeWorkbenchEnvironmentService),
  __decorateParam(9, IProductService),
  __decorateParam(10, IWorkspaceTrustManagementService),
  __decorateParam(11, IStorageService)
], NativeStartupTimings);
export { NativeStartupTimings };
