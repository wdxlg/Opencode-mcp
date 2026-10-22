// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/environment/common/environment.ts
import { createDecorator, refineServiceDecorator } from "./module-0077.mjs";


// src/vs/platform/environment/common/environment.ts
var IEnvironmentService = createDecorator("environmentService");

var INativeEnvironmentService = refineServiceDecorator(IEnvironmentService);
export { IEnvironmentService, INativeEnvironmentService };
