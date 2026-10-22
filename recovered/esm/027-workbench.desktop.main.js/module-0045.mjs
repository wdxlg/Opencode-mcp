// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/observableInternal/transaction.ts
import { getLogger } from "./module-0044.mjs";
import { getFunctionName } from "./module-0041.mjs";
import { handleBugIndicatingErrorRecovery } from "./module-0043.mjs";


// src/vs/base/common/observableInternal/transaction.ts
function transaction(fn, getDebugName2) {
  const tx = new TransactionImpl(fn, getDebugName2);
  try {
    fn(tx);
  } finally {
    tx.finish();
  }
}

var _globalTransaction = void 0;

function globalTransaction(fn) {
  if (_globalTransaction) {
    fn(_globalTransaction);
  } else {
    const tx = new TransactionImpl(fn, void 0);
    _globalTransaction = tx;
    try {
      fn(tx);
    } finally {
      tx.finish();
      _globalTransaction = void 0;
    }
  }
}

async function asyncTransaction(fn, getDebugName2) {
  const tx = new TransactionImpl(fn, getDebugName2);
  try {
    await fn(tx);
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
    for (let i2 = 0; i2 < updatingObservers.length; i2++) {
      const { observer, observable } = updatingObservers[i2];
      observer.endUpdate(observable);
    }
    this._updatingObservers = null;
    getLogger()?.handleEndTransaction(this);
  }
  debugGetUpdatingObservers() {
    return this._updatingObservers;
  }
};
export { transaction, globalTransaction, asyncTransaction, subtransaction, _globalTransaction, TransactionImpl };
