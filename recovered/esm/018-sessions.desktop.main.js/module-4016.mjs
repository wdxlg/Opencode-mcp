// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/services/extensions/common/lazyPromise.ts
import { CancellationError, onUnexpectedError } from "./module-0004.mjs";


// src/vs/workbench/services/extensions/common/lazyPromise.ts
var LazyPromise = class {
  constructor() {
    this._actual = null;
    this._actualOk = null;
    this._actualErr = null;
    this._hasValue = false;
    this._value = null;
    this._hasErr = false;
    this._err = null;
  }
  get [Symbol.toStringTag]() {
    return this.toString();
  }
  _ensureActual() {
    if (!this._actual) {
      this._actual = new Promise((c, e4) => {
        this._actualOk = c;
        this._actualErr = e4;
        if (this._hasValue) {
          this._actualOk(this._value);
        }
        if (this._hasErr) {
          this._actualErr(this._err);
        }
      });
    }
    return this._actual;
  }
  resolveOk(value2) {
    if (this._hasValue || this._hasErr) {
      return;
    }
    this._hasValue = true;
    this._value = value2;
    if (this._actual) {
      this._actualOk(value2);
    }
  }
  resolveErr(err) {
    if (this._hasValue || this._hasErr) {
      return;
    }
    this._hasErr = true;
    this._err = err;
    if (this._actual) {
      this._actualErr(err);
    } else {
      onUnexpectedError(err);
    }
  }
  then(success, error) {
    return this._ensureActual().then(success, error);
  }
  catch(error) {
    return this._ensureActual().then(void 0, error);
  }
  finally(callback) {
    return this._ensureActual().finally(callback);
  }
};

var CanceledLazyPromise = class extends LazyPromise {
  constructor() {
    super();
    this._hasErr = true;
    this._err = new CancellationError();
  }
};
export { LazyPromise, CanceledLazyPromise };
