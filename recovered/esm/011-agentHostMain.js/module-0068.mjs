// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/base/common/observableInternal/reactions/autorun.ts
import { DebugLocation } from "./module-0062.mjs";
import { AutorunObserver } from "./module-0067.mjs";
import { DebugNameData } from "./module-0058.mjs";


// src/vs/base/common/observableInternal/reactions/autorun.ts
function autorun(fn, debugLocation = DebugLocation.ofCaller()) {
  return new AutorunObserver(
    new DebugNameData(void 0, void 0, fn),
    fn,
    void 0,
    debugLocation
  );
}
export { autorun };
