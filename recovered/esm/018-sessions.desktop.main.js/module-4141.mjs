// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/contrib/performance/electron-browser/rendererAutoProfiler.ts
import { parseExtensionDevOptions } from "./module-1056.mjs";
import { generateUuid } from "./module-0190.mjs";
import { timeout } from "./module-0036.mjs";
import { joinPath } from "./module-0034.mjs";
import { VSBuffer } from "./module-0038.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { INativeWorkbenchEnvironmentService } from "./module-3824.mjs";
import { IFileService } from "./module-0269.mjs";
import { ILogService } from "./module-0095.mjs";
import { INativeHostService } from "./module-2566.mjs";
import { ITimerService } from "./module-1183.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { IProfileAnalysisWorkerService } from "./module-4085.mjs";


// src/vs/workbench/contrib/performance/electron-browser/rendererAutoProfiler.ts
var RendererProfiling = class {
  constructor(_environmentService, _fileService, _logService, nativeHostService, timerService, configService, profileAnalysisService) {
    this._environmentService = _environmentService;
    this._fileService = _fileService;
    this._logService = _logService;
    const devOpts = parseExtensionDevOptions(_environmentService);
    if (devOpts.isExtensionDevTestFromCli) {
      return;
    }
    timerService.perfBaseline.then((perfBaseline) => {
      (_environmentService.isBuilt ? _logService.info : _logService.trace).apply(_logService, [`[perf] Render performance baseline is ${perfBaseline}ms`]);
      if (perfBaseline < 0) {
        return;
      }
      const slowThreshold = perfBaseline * 10;
      const obs = new PerformanceObserver(async (list2) => {
        obs.takeRecords();
        const maxDuration = list2.getEntries().map((e4) => e4.duration).reduce((p, c) => Math.max(p, c), 0);
        if (maxDuration < slowThreshold) {
          return;
        }
        if (!configService.getValue("application.experimental.rendererProfiling")) {
          _logService.debug(`[perf] SLOW task detected (${maxDuration}ms) but renderer profiling is disabled via 'application.experimental.rendererProfiling'`);
          return;
        }
        const sessionId = generateUuid();
        _logService.warn(`[perf] Renderer reported VERY LONG TASK (${maxDuration}ms), starting profiling session '${sessionId}'`);
        obs.disconnect();
        for (let i2 = 0; i2 < 3; i2++) {
          try {
            const profile = await nativeHostService.profileRenderer(sessionId, 5e3);
            const output = await profileAnalysisService.analyseBottomUp(profile, (_url) => "<<renderer>>", perfBaseline, true);
            if (output === 2 /* Interesting */) {
              this._store(profile, sessionId);
              break;
            }
            timeout(15e3);
          } catch (err) {
            _logService.error(err);
            break;
          }
        }
        obs.observe({ entryTypes: ["longtask"] });
      });
      obs.observe({ entryTypes: ["longtask"] });
      this._observer = obs;
    });
  }
  dispose() {
    this._observer?.disconnect();
  }
  async _store(profile, sessionId) {
    const path = joinPath(this._environmentService.tmpDir, `renderer-${Math.random().toString(16).slice(2, 8)}.cpuprofile.json`);
    await this._fileService.writeFile(path, VSBuffer.fromString(JSON.stringify(profile)));
    this._logService.info(`[perf] stored profile to DISK '${path}'`, sessionId);
  }
};

RendererProfiling = __decorateClass([
  __decorateParam(0, INativeWorkbenchEnvironmentService),
  __decorateParam(1, IFileService),
  __decorateParam(2, ILogService),
  __decorateParam(3, INativeHostService),
  __decorateParam(4, ITimerService),
  __decorateParam(5, IConfigurationService),
  __decorateParam(6, IProfileAnalysisWorkerService)
], RendererProfiling);
export { RendererProfiling };
