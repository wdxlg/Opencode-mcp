// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/platform/environment/common/environment.ts
import { createDecorator2, refineServiceDecorator } from "./module-0048.mjs";


// src/vs/platform/environment/common/environment.ts
var IEnvironmentService = createDecorator2("environmentService");

var INativeEnvironmentService = refineServiceDecorator(IEnvironmentService);
export { IEnvironmentService, INativeEnvironmentService };
