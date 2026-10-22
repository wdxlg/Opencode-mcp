// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/telemetry/electron-main/errorTelemetry.ts
import { __decorateClass, __decorateParam, __esm } from "./module-0000.mjs";
import { init_errors, isSigPipeError, onUnexpectedError, setUnexpectedErrorHandler } from "./module-0010.mjs";
import { BaseErrorTelemetry, init_errorTelemetry } from "./module-0335.mjs";
import { ITelemetryService, init_telemetry } from "./module-0104.mjs";


// src/vs/platform/telemetry/electron-main/errorTelemetry.ts
var ErrorTelemetry;

var init_errorTelemetry2 = __esm({
  "src/vs/platform/telemetry/electron-main/errorTelemetry.ts"() {
    init_errors();
    init_errorTelemetry();
    init_telemetry();
    ErrorTelemetry = class extends BaseErrorTelemetry {
      constructor(logService, telemetryService) {
        super(telemetryService);
        this.logService = logService;
      }
      installErrorListeners() {
        setUnexpectedErrorHandler((error) => this.onUnexpectedError(error));
        process.on("uncaughtException", (error) => {
          if (!isSigPipeError(error)) {
            onUnexpectedError(error);
          }
        });
        process.on("unhandledRejection", (reason) => onUnexpectedError(reason));
      }
      onUnexpectedError(error) {
        this.logService.error(`[uncaught exception in main]: ${error}`);
        if (error.stack) {
          this.logService.error(error.stack);
        }
      }
    };
    ErrorTelemetry = __decorateClass([
      __decorateParam(1, ITelemetryService)
    ], ErrorTelemetry);
  }
});
export { ErrorTelemetry, init_errorTelemetry2 };
