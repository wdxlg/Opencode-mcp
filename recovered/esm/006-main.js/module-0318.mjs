// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/agentHost/common/agentHostTelemetry.ts
import { __esm } from "./module-0000.mjs";
import { init_telemetry } from "./module-0104.mjs";


// src/vs/platform/agentHost/common/agentHostTelemetry.ts
function telemetryLevelToAgentHostValue(telemetryLevel) {
  switch (telemetryLevel) {
    case 0 /* NONE */:
      return "off" /* OFF */;
    case 1 /* CRASH */:
      return "crash" /* CRASH */;
    case 2 /* ERROR */:
      return "error" /* ERROR */;
    case 3 /* USAGE */:
      return "all" /* ON */;
    default:
      return "off" /* OFF */;
  }
}

var AgentHostLaunchKindEnvVar;

var init_agentHostTelemetry = __esm({
  "src/vs/platform/agentHost/common/agentHostTelemetry.ts"() {
    init_telemetry();
    AgentHostLaunchKindEnvVar = "VSCODE_AGENT_HOST_LAUNCH_KIND";
  }
});
export { telemetryLevelToAgentHostValue, AgentHostLaunchKindEnvVar, init_agentHostTelemetry };
