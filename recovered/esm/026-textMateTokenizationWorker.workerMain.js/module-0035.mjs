// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateTokenizationWorker.workerMain.js
// Original module marker: src/vs/base/common/observableInternal/transaction.ts
import { getLogger } from "./module-0034.mjs";
import { getFunctionName } from "./module-0031.mjs";
import { handleBugIndicatingErrorRecovery } from "./module-0033.mjs";


// src/vs/base/common/observableInternal/transaction.ts
function transaction(fn, getDebugName2) {
  const tx = new TransactionImpl(fn, getDebugName2);
  try {
    fn(tx);
  } finally {
    tx.finish();
  }
}

function subtransaction(tx, fn, getDebugName2) {
  if (!tx) {
    transaction(fn, getDebugName2);
  } else {
    fn(tx);
  }
}

var TransactionImpl = class {
  constructor(_fn, _getDebugName) {
    this._fn = _fn;
    this._getDebugName = _getDebugName;
    this._updatingObservers = [];
    getLogger()?.handleBeginTransaction(this);
  }
  getDebugName() {
    if (this._getDebugName) {
      return this._getDebugName();
    }
    return getFunctionName(this._fn);
  }
  updateObserver(observer, observable) {
    if (!this._updatingObservers) {
      handleBugIndicatingErrorRecovery("Transaction already finished!");
      transaction((tx) => {
        tx.updateObserver(observer, observable);
      });
      return;
    }
    this._updatingObservers.push({ observer, observable });
    observer.beginUpdate(observable);
  }
  finish() {
    const updatingObservers = this._updatingObservers;
    if (!updatingObservers) {
      handleBugIndicatingErrorRecovery("transaction.finish() has already been called!");
      return;
    }
    for (let i = 0; i < updatingObservers.length; i++) {
      const { observer, observable } = updatingObservers[i];
      observer.endUpdate(observable);
    }
    this._updatingObservers = null;
    getLogger()?.handleEndTransaction(this);
  }
  debugGetUpdatingObservers() {
    return this._updatingObservers;
  }
};
export { transaction, subtransaction, TransactionImpl };
