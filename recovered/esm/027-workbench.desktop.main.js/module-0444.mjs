// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/observable/common/platformObservableUtils.ts
import { DebugLocation } from "./module-0046.mjs";
import { observableFromEventOpts } from "./module-0057.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { derivedOpts } from "./module-0054.mjs";


// src/vs/platform/observable/common/platformObservableUtils.ts
function observableConfigValue(key3, defaultValue, configurationService, debugLocation = DebugLocation.ofCaller()) {
  return observableFromEventOpts(
    { debugName: () => `Configuration Key "${key3}"` },
    (handleChange) => configurationService.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(key3)) {
        handleChange(e);
      }
    }),
    () => configurationService.getValue(key3) ?? defaultValue,
    debugLocation
  );
}

function bindContextKey(key3, service, computeValue, debugLocation = DebugLocation.ofCaller()) {
  const boundKey = key3.bindTo(service);
  const store = new DisposableStore();
  derivedOpts({ debugName: () => `Set Context Key "${key3.key}"` }, (reader) => {
    const value2 = computeValue(reader);
    boundKey.set(value2);
    return value2;
  }, debugLocation).recomputeInitiallyAndOnChange(store);
  return store;
}
export { observableConfigValue, bindContextKey };
