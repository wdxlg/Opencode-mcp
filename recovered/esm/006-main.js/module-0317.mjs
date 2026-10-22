// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/agentHost/common/agentHostTelemetryEnv.ts
import { __esm } from "./module-0000.mjs";


// src/vs/platform/agentHost/common/agentHostTelemetryEnv.ts
function buildAgentHostTelemetryIdEnv(ids) {
  const env2 = {};
  if (ids.machineId) {
    env2[AgentHostMachineIdEnvKey] = ids.machineId;
  }
  if (ids.sqmId) {
    env2[AgentHostSqmIdEnvKey] = ids.sqmId;
  }
  if (ids.devDeviceId) {
    env2[AgentHostDevDeviceIdEnvKey] = ids.devDeviceId;
  }
  return env2;
}

var AgentHostMachineIdEnvKey, AgentHostSqmIdEnvKey, AgentHostDevDeviceIdEnvKey;

var init_agentHostTelemetryEnv = __esm({
  "src/vs/platform/agentHost/common/agentHostTelemetryEnv.ts"() {
    AgentHostMachineIdEnvKey = "VSCODE_AGENT_HOST_MACHINE_ID";
    AgentHostSqmIdEnvKey = "VSCODE_AGENT_HOST_SQM_ID";
    AgentHostDevDeviceIdEnvKey = "VSCODE_AGENT_HOST_DEV_DEVICE_ID";
  }
});
export { buildAgentHostTelemetryIdEnv, AgentHostMachineIdEnvKey, AgentHostSqmIdEnvKey, AgentHostDevDeviceIdEnvKey, init_agentHostTelemetryEnv };
