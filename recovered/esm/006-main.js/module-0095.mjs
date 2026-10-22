// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/main.js
// Original module marker: src/vs/platform/state/node/state.ts
import { __esm } from "./module-0000.mjs";
import { createDecorator, init_instantiation } from "./module-0039.mjs";


// src/vs/platform/state/node/state.ts
var IStateReadService, IStateService;

var init_state = __esm({
  "src/vs/platform/state/node/state.ts"() {
    init_instantiation();
    IStateReadService = createDecorator("stateReadService");
    IStateService = createDecorator("stateService");
  }
});
export { IStateReadService, IStateService, init_state };
