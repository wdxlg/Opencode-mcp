// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/platform/environment/common/environment.ts
import { createDecorator, refineServiceDecorator } from "./module-0038.mjs";


// src/vs/platform/environment/common/environment.ts
var IEnvironmentService = createDecorator("environmentService");

var INativeEnvironmentService = refineServiceDecorator(IEnvironmentService);
export { IEnvironmentService, INativeEnvironmentService };
