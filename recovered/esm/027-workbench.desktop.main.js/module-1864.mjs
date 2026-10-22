// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/performance/browser/inputLatencyContrib.ts
import { Disposable } from "./module-0012.mjs";
import { observableConfigValue } from "./module-0444.mjs";
import { derived } from "./module-0054.mjs";
import { throttledObservable } from "./module-0059.mjs";
import { inputLatency } from "./module-0222.mjs";
import { autorun } from "./module-0052.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { ITelemetryService } from "./module-0093.mjs";


// src/vs/workbench/contrib/performance/browser/inputLatencyContrib.ts
var InputLatencyContrib = class extends Disposable {
  constructor(_configurationService, _telemetryService) {
    super();
    this._configurationService = _configurationService;
    this._telemetryService = _telemetryService;
    const probability = observableConfigValue("telemetry.performance.inputLatencySamplingProbability", 0, this._configurationService);
    const sessionRandom = Math.random();
    const shouldReport = derived((reader) => sessionRandom < probability.read(reader));
    const throttled = throttledObservable(
      derived((reader) => ({ sampleCount: inputLatency.sampleCount.read(reader), shouldReport: shouldReport.read(reader) })),
      6e4
    );
    this._register(autorun((reader) => {
      const { shouldReport: shouldReport2 } = throttled.read(reader);
      const measurements = inputLatency.getAndClearMeasurements();
      if (!measurements) {
        return;
      }
      if (shouldReport2) {
        this._logSamples(measurements);
      }
    }));
  }
  _logSamples(measurements) {
    const memory = performance.memory;
    const usedJSHeapSize = memory?.usedJSHeapSize ?? -1;
    const jsHeapSizeLimit = memory?.jsHeapSizeLimit ?? -1;
    const jsHeapUsagePercentage = usedJSHeapSize >= 0 && jsHeapSizeLimit > 0 ? Math.round(usedJSHeapSize / jsHeapSizeLimit * 100) : -1;
    this._telemetryService.publicLog2("performance.inputLatency", {
      keydown: measurements.keydown,
      input: measurements.input,
      render: measurements.render,
      total: measurements.total,
      sampleCount: measurements.sampleCount,
      gpuAcceleration: this._configurationService.getValue("editor.experimentalGpuAcceleration") === "on",
      usedJSHeapSize,
      jsHeapSizeLimit,
      jsHeapUsagePercentage
    });
  }
};

InputLatencyContrib = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ITelemetryService)
], InputLatencyContrib);
export { InputLatencyContrib };
