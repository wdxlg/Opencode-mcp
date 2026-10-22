// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/telemetry/node/errorTelemetry.ts
import { BaseErrorTelemetry } from "./module-0287.mjs";
import { isCancellationError, isSigPipeError, onUnexpectedError, setUnexpectedErrorHandler } from "./module-0002.mjs";


// src/vs/platform/telemetry/node/errorTelemetry.ts
var ErrorTelemetry = class extends BaseErrorTelemetry {
  installErrorListeners() {
    setUnexpectedErrorHandler((err) => console.error(err));
    const unhandledPromises = [];
    process.on("unhandledRejection", (reason, promise) => {
      unhandledPromises.push(promise);
      setTimeout(() => {
        const idx = unhandledPromises.indexOf(promise);
        if (idx >= 0) {
          promise.catch((e) => {
            unhandledPromises.splice(idx, 1);
            if (!isCancellationError(e)) {
              console.warn(`rejected promise not handled within 1 second: ${e}`);
              if (e.stack) {
                console.warn(`stack trace: ${e.stack}`);
              }
              if (reason) {
                onUnexpectedError(reason);
              }
            }
          });
        }
      }, 1e3);
    });
    process.on("rejectionHandled", (promise) => {
      const idx = unhandledPromises.indexOf(promise);
      if (idx >= 0) {
        unhandledPromises.splice(idx, 1);
      }
    });
    process.on("uncaughtException", (err) => {
      if (isSigPipeError(err)) {
        return;
      }
      onUnexpectedError(err);
    });
  }
};
export { ErrorTelemetry };
