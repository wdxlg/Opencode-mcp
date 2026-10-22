// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/observableInternal/utils/utilsCancellation.ts
import { autorun } from "./module-0052.mjs";
import { CancellationError } from "./module-0004.mjs";


// src/vs/base/common/observableInternal/utils/utilsCancellation.ts
function waitForState(observable, predicate, isError, cancellationToken) {
  if (!predicate) {
    predicate = (state) => state !== null && state !== void 0;
  }
  return new Promise((resolve3, reject) => {
    let isImmediateRun = true;
    let shouldDispose = false;
    const stateObs = observable.map((state) => {
      return {
        isFinished: predicate(state),
        error: isError ? isError(state) : false,
        state
      };
    });
    const d = autorun((reader) => {
      const { isFinished, error, state } = stateObs.read(reader);
      if (isFinished || error) {
        if (isImmediateRun) {
          shouldDispose = true;
        } else {
          d.dispose();
        }
        if (error) {
          reject(error === true ? state : error);
        } else {
          resolve3(state);
        }
      }
    });
    if (cancellationToken) {
      const dc = cancellationToken.onCancellationRequested(() => {
        d.dispose();
        dc.dispose();
        reject(new CancellationError());
      });
      if (cancellationToken.isCancellationRequested) {
        d.dispose();
        dc.dispose();
        reject(new CancellationError());
        return;
      }
    }
    isImmediateRun = false;
    if (shouldDispose) {
      d.dispose();
    }
  });
}
export { waitForState };
