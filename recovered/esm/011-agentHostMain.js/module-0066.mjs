// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/base/common/observableInternal/observables/observableValueOpts.ts
import { DebugLocation } from "./module-0062.mjs";
import { LazyObservableValue } from "./module-0065.mjs";
import { DebugNameData } from "./module-0058.mjs";
import { strictEquals } from "./module-0050.mjs";
import { ObservableValue } from "./module-0064.mjs";


// src/vs/base/common/observableInternal/observables/observableValueOpts.ts
function observableValueOpts(options, initialValue, debugLocation = DebugLocation.ofCaller()) {
  if (options.lazy) {
    return new LazyObservableValue(
      new DebugNameData(options.owner, options.debugName, void 0),
      initialValue,
      options.equalsFn ?? strictEquals,
      debugLocation
    );
  }
  return new ObservableValue(
    new DebugNameData(options.owner, options.debugName, void 0),
    initialValue,
    options.equalsFn ?? strictEquals,
    debugLocation
  );
}
export { observableValueOpts };
