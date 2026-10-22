// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/base/common/observableInternal/observables/derived.ts
import { DebugLocation } from "./module-0109.mjs";
import { Derived } from "./module-0116.mjs";
import { DebugNameData } from "./module-0104.mjs";
import { strictEquals } from "./module-0105.mjs";
import { _setDerivedOpts } from "./module-0110.mjs";


// src/vs/base/common/observableInternal/observables/derived.ts
function derived(computeFnOrOwner, computeFn, debugLocation = DebugLocation.ofCaller()) {
  if (computeFn !== void 0) {
    return new Derived(
      new DebugNameData(computeFnOrOwner, void 0, computeFn),
      computeFn,
      void 0,
      void 0,
      strictEquals,
      debugLocation
    );
  }
  return new Derived(
    // eslint-disable-next-line local/code-no-any-casts
    new DebugNameData(void 0, void 0, computeFnOrOwner),
    // eslint-disable-next-line local/code-no-any-casts
    computeFnOrOwner,
    void 0,
    void 0,
    strictEquals,
    debugLocation
  );
}

function derivedOpts(options2, computeFn, debugLocation = DebugLocation.ofCaller()) {
  return new Derived(
    new DebugNameData(options2.owner, options2.debugName, options2.debugReferenceFn),
    computeFn,
    void 0,
    options2.onLastObserverRemoved,
    options2.equalsFn ?? strictEquals,
    debugLocation
  );
}

_setDerivedOpts(derivedOpts);
export { derived, derivedOpts };
