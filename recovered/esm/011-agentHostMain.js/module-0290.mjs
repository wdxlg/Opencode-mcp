// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/agentHost/node/copilot/copilotCliEnvironment.ts
import { AiAgentEnvValue, AiAgentEnvVar } from "./module-0192.mjs";


// src/vs/platform/agentHost/node/copilot/copilotCliEnvironment.ts
function createCopilotCliEnvironment(environment = process.env) {
  const env2 = Object.assign({}, environment, { ELECTRON_RUN_AS_NODE: "1" });
  delete env2["NODE_OPTIONS"];
  delete env2["VSCODE_INSPECTOR_OPTIONS"];
  delete env2["VSCODE_ESM_ENTRYPOINT"];
  delete env2["VSCODE_HANDLES_UNCAUGHT_ERRORS"];
  for (const key of Object.keys(env2)) {
    if (key === "ELECTRON_RUN_AS_NODE" || key === "VSCODE_AGENT_HOST_CAPI_URL_OVERRIDE") {
      continue;
    }
    if (key.startsWith("VSCODE_") || key.startsWith("ELECTRON_")) {
      delete env2[key];
    }
  }
  env2["COPILOT_CLI_RUN_AS_NODE"] = "1";
  env2["USE_BUILTIN_RIPGREP"] = "false";
  env2["COPILOT_MCP_APPS"] = "true";
  env2[AiAgentEnvVar] = AiAgentEnvValue;
  env2["AUTO_APPROVAL"] = "true";
  env2["AUTO_V2_ENDPOINT"] = "true";
  return env2;
}
export { createCopilotCliEnvironment };
