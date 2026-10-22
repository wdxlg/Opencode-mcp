// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/agentHost/common/agentHostProcessTelemetry.ts
import { init_errorTelemetry, packErrorForTelemetry } from "./module-0335.mjs";
import { __esm } from "./module-0000.mjs";


// src/vs/platform/agentHost/common/agentHostProcessTelemetry.ts
function reportAgentHostProcessError(telemetryService, data, error) {
  const errorData = error === void 0 ? void 0 : packErrorForTelemetry(error);
  telemetryService.publicLogError2("agentHost.processError", {
    ...data,
    isError: true,
    ...errorData ? { callstack: errorData.callstack, msg: errorData.msg } : {}
  });
}

var init_agentHostProcessTelemetry = __esm({
  "src/vs/platform/agentHost/common/agentHostProcessTelemetry.ts"() {
    init_errorTelemetry();
  }
});
export { reportAgentHostProcessError, init_agentHostProcessTelemetry };
