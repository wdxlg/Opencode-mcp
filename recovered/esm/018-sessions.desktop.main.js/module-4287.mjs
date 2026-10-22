// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/sessions/contrib/providers/remoteAgentHost/browser/cloudSandboxAgentHost.contribution.ts
import { registerSingleton } from "./module-0135.mjs";
import { CloudSandboxTelemetryService, ICloudSandboxTelemetryService } from "./module-4281.mjs";
import { ICloudSandboxAgentHostService, ICloudSandboxApiService } from "./module-3675.mjs";
import { CloudSandboxApiService } from "./module-4286.mjs";
import { CloudSandboxAgentHostService } from "./module-4283.mjs";
import { WorkbenchPhase, registerWorkbenchContribution2 } from "./module-0872.mjs";
import { CloudSandboxAgentHostContribution } from "./module-3688.mjs";


// src/vs/sessions/contrib/providers/remoteAgentHost/browser/cloudSandboxAgentHost.contribution.ts
registerSingleton(ICloudSandboxTelemetryService, CloudSandboxTelemetryService, 1 /* Delayed */);

registerSingleton(ICloudSandboxApiService, CloudSandboxApiService, 1 /* Delayed */);

registerSingleton(ICloudSandboxAgentHostService, CloudSandboxAgentHostService, 1 /* Delayed */);

registerWorkbenchContribution2(CloudSandboxAgentHostContribution.ID, CloudSandboxAgentHostContribution, WorkbenchPhase.AfterRestored);
export {};
