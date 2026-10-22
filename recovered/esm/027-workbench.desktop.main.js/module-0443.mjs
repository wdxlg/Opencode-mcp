// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/hotReloadHelpers.ts
import { isHotReloadEnabled, registerHotReloadHandler } from "./module-0442.mjs";
import { observableSignalFromEvent } from "./module-0062.mjs";
import { constObservable } from "./module-0061.mjs";
import { observableValue } from "./module-0048.mjs";


// src/vs/base/common/hotReloadHelpers.ts
function readHotReloadableExport(value2, reader) {
  observeHotReloadableExports([value2], reader);
  return value2;
}

function observeHotReloadableExports(values, reader) {
  if (isHotReloadEnabled()) {
    const o = observableSignalFromEvent(
      "reload",
      (event) => registerHotReloadHandler(({ oldExports }) => {
        if (![...Object.values(oldExports)].some((v2) => values.includes(v2))) {
          return void 0;
        }
        return (_newExports) => {
          event(void 0);
          return true;
        };
      })
    );
    o.read(reader);
  }
}

var classes = /* @__PURE__ */ new Map();

function createHotClass(clazz) {
  if (!isHotReloadEnabled()) {
    return constObservable(clazz);
  }
  const id2 = clazz.name;
  let existing = classes.get(id2);
  if (!existing) {
    existing = observableValue(id2, clazz);
    classes.set(id2, existing);
  } else {
    setTimeout(() => {
      existing.set(clazz, void 0);
    }, 0);
  }
  return existing;
}
export { readHotReloadableExport, observeHotReloadableExports, createHotClass, classes };
