// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/profiling/electron-main/windowProfiling.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { init_async, timeout } from "./module-0034.mjs";
import { ILogService, init_log } from "./module-0075.mjs";


// src/vs/platform/profiling/electron-main/windowProfiling.ts
var WindowProfiler;

var init_windowProfiling = __esm({
  "src/vs/platform/profiling/electron-main/windowProfiling.ts"() {
    init_async();
    init_log();
    WindowProfiler = class {
      constructor(_window, _sessionId, _logService) {
        this._window = _window;
        this._sessionId = _sessionId;
        this._logService = _logService;
      }
      async inspect(duration) {
        await this._connect();
        const inspector = this._window.webContents.debugger;
        await inspector.sendCommand("Profiler.start");
        this._logService.warn("[perf] profiling STARTED", this._sessionId);
        await timeout(duration);
        const data = await inspector.sendCommand("Profiler.stop");
        this._logService.warn("[perf] profiling DONE", this._sessionId);
        await this._disconnect();
        return data.profile;
      }
      async _connect() {
        const inspector = this._window.webContents.debugger;
        inspector.attach();
        await inspector.sendCommand("Profiler.enable");
      }
      async _disconnect() {
        const inspector = this._window.webContents.debugger;
        await inspector.sendCommand("Profiler.disable");
        inspector.detach();
      }
    };
    WindowProfiler = __decorateClass([
      __decorateParam(2, ILogService)
    ], WindowProfiler);
  }
});
export { WindowProfiler, init_windowProfiling };
