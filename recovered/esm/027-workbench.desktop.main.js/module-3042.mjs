// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/common/observableUtils.ts



// src/vs/workbench/contrib/testing/common/observableUtils.ts
function onObservableChange(observable, callback) {
  const o = {
    beginUpdate() {
    },
    endUpdate() {
    },
    handlePossibleChange(observable2) {
      observable2.reportChanges();
    },
    handleChange(_observable, change) {
      callback(change);
    }
  };
  observable.addObserver(o);
  return {
    dispose() {
      observable.removeObserver(o);
    }
  };
}
export { onObservableChange };
