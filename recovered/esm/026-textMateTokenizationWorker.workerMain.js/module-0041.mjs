// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateTokenizationWorker.workerMain.js
// Original module marker: src/vs/base/common/observableInternal/observables/derived.ts
import { DebugLocation } from "./module-0036.mjs";
import { Derived } from "./module-0040.mjs";
import { DebugNameData } from "./module-0031.mjs";
import { strictEquals } from "./module-0032.mjs";
import { _setDerivedOpts } from "./module-0037.mjs";


// src/vs/base/common/observableInternal/observables/derived.ts
function derivedOpts(options, computeFn, debugLocation = DebugLocation.ofCaller()) {
  return new Derived(
    new DebugNameData(options.owner, options.debugName, options.debugReferenceFn),
    computeFn,
    void 0,
    options.onLastObserverRemoved,
    options.equalsFn ?? strictEquals,
    debugLocation
  );
}

_setDerivedOpts(derivedOpts);
export { derivedOpts };
