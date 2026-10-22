// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/controlFlow.ts
import { BugIndicatingError } from "./module-0004.mjs";


// src/vs/base/common/controlFlow.ts
var ReentrancyBarrier = class {
  constructor() {
    this._isOccupied = false;
  }
  /**
   * Calls `runner` if the barrier is not occupied.
   * During the call, the barrier becomes occupied.
   */
  runExclusivelyOrSkip(runner) {
    if (this._isOccupied) {
      return;
    }
    this._isOccupied = true;
    try {
      runner();
    } finally {
      this._isOccupied = false;
    }
  }
  /**
   * Calls `runner`. If the barrier is occupied, throws an error.
   * During the call, the barrier becomes active.
   */
  runExclusivelyOrThrow(runner) {
    if (this._isOccupied) {
      throw new BugIndicatingError(`ReentrancyBarrier: reentrant call detected!`);
    }
    this._isOccupied = true;
    try {
      runner();
    } finally {
      this._isOccupied = false;
    }
  }
  /**
   * Indicates if some runner occupies this barrier.
  */
  get isOccupied() {
    return this._isOccupied;
  }
  makeExclusiveOrSkip(fn) {
    return ((...args2) => {
      if (this._isOccupied) {
        return;
      }
      this._isOccupied = true;
      try {
        return fn(...args2);
      } finally {
        this._isOccupied = false;
      }
    });
  }
};
export { ReentrancyBarrier };
