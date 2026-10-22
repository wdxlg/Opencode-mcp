// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/environment/common/environment.ts
import { __esm } from "./module-0000.mjs";
import { createDecorator, init_instantiation, refineServiceDecorator } from "./module-0039.mjs";


// src/vs/platform/environment/common/environment.ts
var IEnvironmentService, INativeEnvironmentService;

var init_environment = __esm({
  "src/vs/platform/environment/common/environment.ts"() {
    init_instantiation();
    IEnvironmentService = createDecorator("environmentService");
    INativeEnvironmentService = refineServiceDecorator(IEnvironmentService);
  }
});
export { IEnvironmentService, INativeEnvironmentService, init_environment };
