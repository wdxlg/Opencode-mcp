// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/profiling/electron-browser/profileAnalysisWorkerService.ts
import { createDecorator } from "./module-0077.mjs";
import { WebWorkerDescriptor } from "./module-0160.mjs";
import { FileAccess } from "./module-0033.mjs";
import { reportSample } from "./module-4084.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ITelemetryService } from "./module-0093.mjs";
import { ILogService } from "./module-0095.mjs";
import { IWebWorkerService } from "./module-0161.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/platform/profiling/electron-browser/profileAnalysisWorkerService.ts
var IProfileAnalysisWorkerService = createDecorator("IProfileAnalysisWorkerService");

var ProfileAnalysisWorkerService = class {
  constructor(_telemetryService, _logService, _webWorkerService) {
    this._telemetryService = _telemetryService;
    this._logService = _logService;
    this._webWorkerService = _webWorkerService;
  }
  async _withWorker(callback) {
    const worker = this._webWorkerService.createWorkerClient(
      new WebWorkerDescriptor({
        esmModuleLocation: FileAccess.asBrowserUri("vs/platform/profiling/electron-browser/profileAnalysisWorkerMain.js"),
        label: "CpuProfileAnalysisWorker"
      })
    );
    try {
      const r2 = await callback(worker.proxy);
      return r2;
    } finally {
      worker.dispose();
    }
  }
  async analyseBottomUp(profile, callFrameClassifier, perfBaseline, sendAsErrorTelemtry) {
    return this._withWorker(async (worker) => {
      const result = await worker.$analyseBottomUp(profile);
      if (result.kind === 2 /* Interesting */) {
        for (const sample of result.samples) {
          reportSample({
            sample,
            perfBaseline,
            source: callFrameClassifier(sample.url)
          }, this._telemetryService, this._logService, sendAsErrorTelemtry);
        }
      }
      return result.kind;
    });
  }
  async analyseByLocation(profile, locations) {
    return this._withWorker(async (worker) => {
      const result = await worker.$analyseByUrlCategory(profile, locations);
      return result;
    });
  }
};

ProfileAnalysisWorkerService = __decorateClass([
  __decorateParam(0, ITelemetryService),
  __decorateParam(1, ILogService),
  __decorateParam(2, IWebWorkerService)
], ProfileAnalysisWorkerService);

registerSingleton(IProfileAnalysisWorkerService, ProfileAnalysisWorkerService, 1 /* Delayed */);
export { IProfileAnalysisWorkerService, ProfileAnalysisWorkerService };
