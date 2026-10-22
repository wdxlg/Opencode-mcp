// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/observableInternal/logging/debugger/utils.ts



// src/vs/base/common/observableInternal/logging/debugger/utils.ts
var Throttler2 = class {
  constructor() {
    this._timeout = void 0;
  }
  throttle(fn, timeoutMs) {
    if (this._timeout === void 0) {
      this._timeout = setTimeout(() => {
        this._timeout = void 0;
        fn();
      }, timeoutMs);
    }
  }
  dispose() {
    if (this._timeout !== void 0) {
      clearTimeout(this._timeout);
    }
  }
};

function deepAssign(target, source) {
  for (const key3 in source) {
    if (!!target[key3] && typeof target[key3] === "object" && !!source[key3] && typeof source[key3] === "object") {
      deepAssign(target[key3], source[key3]);
    } else {
      target[key3] = source[key3];
    }
  }
}

function deepAssignDeleteNulls(target, source) {
  for (const key3 in source) {
    if (source[key3] === null) {
      delete target[key3];
    } else if (!!target[key3] && typeof target[key3] === "object" && !!source[key3] && typeof source[key3] === "object") {
      deepAssignDeleteNulls(target[key3], source[key3]);
    } else {
      target[key3] = source[key3];
    }
  }
}
export { deepAssign, deepAssignDeleteNulls, Throttler2 };
