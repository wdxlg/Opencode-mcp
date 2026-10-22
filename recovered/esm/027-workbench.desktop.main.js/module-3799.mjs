// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/lifecycle/common/lifecycle.ts
import { Promises, isThenable } from "./module-0036.mjs";


// src/vs/platform/lifecycle/common/lifecycle.ts
function handleVetos(vetos, onError) {
  if (vetos.length === 0) {
    return Promise.resolve(false);
  }
  const promises = [];
  let lazyValue = false;
  for (const valueOrPromise of vetos) {
    if (valueOrPromise === true) {
      return Promise.resolve(true);
    }
    if (isThenable(valueOrPromise)) {
      promises.push(valueOrPromise.then((value2) => {
        if (value2) {
          lazyValue = true;
        }
      }, (err) => {
        onError(err);
        lazyValue = true;
      }));
    }
  }
  return Promises.settled(promises).then(() => lazyValue);
}
export { handleVetos };
