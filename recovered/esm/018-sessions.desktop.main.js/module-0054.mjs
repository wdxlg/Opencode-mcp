// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/observableInternal/observables/derived.ts
import { DebugLocation } from "./module-0046.mjs";
import { Derived, DerivedWithSetter } from "./module-0053.mjs";
import { DebugNameData } from "./module-0041.mjs";
import { strictEquals } from "./module-0042.mjs";
import { _setDerivedOpts } from "./module-0047.mjs";
import { DisposableStore } from "./module-0012.mjs";


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

function derivedWithSetter(owner, computeFn, setter, debugLocation = DebugLocation.ofCaller()) {
  return new DerivedWithSetter(
    new DebugNameData(owner, void 0, computeFn),
    computeFn,
    void 0,
    void 0,
    strictEquals,
    setter,
    debugLocation
  );
}

function derivedOpts(options3, computeFn, debugLocation = DebugLocation.ofCaller()) {
  return new Derived(
    new DebugNameData(options3.owner, options3.debugName, options3.debugReferenceFn),
    computeFn,
    void 0,
    options3.onLastObserverRemoved,
    options3.equalsFn ?? strictEquals,
    debugLocation
  );
}

_setDerivedOpts(derivedOpts);

function derivedHandleChanges(options3, computeFn, debugLocation = DebugLocation.ofCaller()) {
  return new Derived(
    new DebugNameData(options3.owner, options3.debugName, void 0),
    computeFn,
    options3.changeTracker,
    void 0,
    options3.equalityComparer ?? strictEquals,
    debugLocation
  );
}

function derivedDisposable(computeFnOrOwner, computeFnOrUndefined, debugLocation = DebugLocation.ofCaller()) {
  let computeFn;
  let owner;
  if (computeFnOrUndefined === void 0) {
    computeFn = computeFnOrOwner;
    owner = void 0;
  } else {
    owner = computeFnOrOwner;
    computeFn = computeFnOrUndefined;
  }
  let store = void 0;
  return new Derived(
    new DebugNameData(owner, void 0, computeFn),
    (r2) => {
      if (!store) {
        store = new DisposableStore();
      } else {
        store.clear();
      }
      const result = computeFn(r2);
      if (result) {
        store.add(result);
      }
      return result;
    },
    void 0,
    () => {
      if (store) {
        store.dispose();
        store = void 0;
      }
    },
    strictEquals,
    debugLocation
  );
}
export { derived, derivedWithSetter, derivedOpts, derivedHandleChanges, derivedDisposable };
