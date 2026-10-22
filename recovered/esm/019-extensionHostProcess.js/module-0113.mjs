// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/base/common/observableInternal/observables/observableValueOpts.ts
import { DebugLocation } from "./module-0109.mjs";
import { LazyObservableValue } from "./module-0112.mjs";
import { DebugNameData } from "./module-0104.mjs";
import { strictEquals } from "./module-0105.mjs";
import { ObservableValue } from "./module-0111.mjs";


// src/vs/base/common/observableInternal/observables/observableValueOpts.ts
function observableValueOpts(options2, initialValue, debugLocation = DebugLocation.ofCaller()) {
  if (options2.lazy) {
    return new LazyObservableValue(
      new DebugNameData(options2.owner, options2.debugName, void 0),
      initialValue,
      options2.equalsFn ?? strictEquals,
      debugLocation
    );
  }
  return new ObservableValue(
    new DebugNameData(options2.owner, options2.debugName, void 0),
    initialValue,
    options2.equalsFn ?? strictEquals,
    debugLocation
  );
}
export { observableValueOpts };
