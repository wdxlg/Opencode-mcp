// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/observableInternal/experimental/reducer.ts
import { DerivedWithSetter } from "./module-0053.mjs";
import { DebugNameData } from "./module-0041.mjs";
import { strictEquals } from "./module-0042.mjs";
import { BugIndicatingError } from "./module-0004.mjs";
import { subtransaction } from "./module-0045.mjs";
import { DebugLocation } from "./module-0046.mjs";


// src/vs/base/common/observableInternal/experimental/reducer.ts
function observableReducerSettable(owner, options3) {
  let prevValue = void 0;
  let hasValue = false;
  const d = new DerivedWithSetter(
    new DebugNameData(owner, void 0, options3.update),
    (reader, changeSummary) => {
      if (!hasValue) {
        prevValue = options3.initial instanceof Function ? options3.initial() : options3.initial;
        hasValue = true;
      }
      const newValue = options3.update(reader, prevValue, changeSummary);
      prevValue = newValue;
      return newValue;
    },
    options3.changeTracker,
    () => {
      if (hasValue) {
        options3.disposeFinal?.(prevValue);
        hasValue = false;
      }
    },
    options3.equalityComparer ?? strictEquals,
    (value2, tx, change) => {
      if (!hasValue) {
        throw new BugIndicatingError("Can only set when there is a listener! This is to prevent leaks.");
      }
      subtransaction(tx, (tx2) => {
        prevValue = value2;
        d.setValue(value2, tx2, change);
      });
    },
    DebugLocation.ofCaller()
  );
  return d;
}
export { observableReducerSettable };
