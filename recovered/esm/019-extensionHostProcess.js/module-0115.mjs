// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/base/common/observableInternal/reactions/autorun.ts
import { DebugLocation } from "./module-0109.mjs";
import { AutorunObserver } from "./module-0114.mjs";
import { DebugNameData } from "./module-0104.mjs";


// src/vs/base/common/observableInternal/reactions/autorun.ts
function autorun(fn, debugLocation = DebugLocation.ofCaller()) {
  return new AutorunObserver(
    new DebugNameData(void 0, void 0, fn),
    fn,
    void 0,
    debugLocation
  );
}

function registerAutorunSelfDisposable(store, fn, debugLocation = DebugLocation.ofCaller()) {
  let ar;
  let disposeSync = false;
  ar = autorun((reader) => {
    fn({
      delayedStore: reader.delayedStore,
      store: reader.store,
      readObservable: reader.readObservable.bind(reader),
      dispose: () => {
        if (!ar) {
          disposeSync = true;
        } else {
          store.delete(ar);
        }
      }
    });
  }, debugLocation);
  if (disposeSync) {
    ar.dispose();
  } else {
    store.add(ar);
  }
}
export { autorun, registerAutorunSelfDisposable };
