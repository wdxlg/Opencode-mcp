// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/observableInternal/observables/observableValueOpts.ts
import { DebugLocation } from "./module-0046.mjs";
import { LazyObservableValue } from "./module-0049.mjs";
import { DebugNameData } from "./module-0041.mjs";
import { strictEquals } from "./module-0042.mjs";
import { ObservableValue } from "./module-0048.mjs";


// src/vs/base/common/observableInternal/observables/observableValueOpts.ts
function observableValueOpts(options3, initialValue, debugLocation = DebugLocation.ofCaller()) {
  if (options3.lazy) {
    return new LazyObservableValue(
      new DebugNameData(options3.owner, options3.debugName, void 0),
      initialValue,
      options3.equalsFn ?? strictEquals,
      debugLocation
    );
  }
  return new ObservableValue(
    new DebugNameData(options3.owner, options3.debugName, void 0),
    initialValue,
    options3.equalsFn ?? strictEquals,
    debugLocation
  );
}
export { observableValueOpts };
