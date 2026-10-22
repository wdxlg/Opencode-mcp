// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/base/common/decorators.ts



// src/vs/base/common/decorators.ts
function createDecorator2(mapFn) {
  return (_target, key, descriptor) => {
    let fnKey = null;
    let fn = null;
    if (typeof descriptor.value === "function") {
      fnKey = "value";
      fn = descriptor.value;
    } else if (typeof descriptor.get === "function") {
      fnKey = "get";
      fn = descriptor.get;
    }
    if (!fn || typeof key === "symbol") {
      throw new Error("not supported");
    }
    descriptor[fnKey] = mapFn(fn, key);
  };
}

function debounce(delay, reducer, initialValueProvider) {
  return createDecorator2((fn, key) => {
    const timerKey = `$debounce$${key}`;
    const resultKey = `$debounce$result$${key}`;
    return function(...args) {
      if (!this[resultKey]) {
        this[resultKey] = initialValueProvider ? initialValueProvider() : void 0;
      }
      clearTimeout(this[timerKey]);
      if (reducer) {
        this[resultKey] = reducer(this[resultKey], ...args);
        args = [this[resultKey]];
      }
      this[timerKey] = setTimeout(() => {
        fn.apply(this, args);
        this[resultKey] = initialValueProvider ? initialValueProvider() : void 0;
      }, delay);
    };
  });
}

function throttle(delay, reducer, initialValueProvider) {
  return createDecorator2((fn, key) => {
    const timerKey = `$throttle$timer$${key}`;
    const resultKey = `$throttle$result$${key}`;
    const lastRunKey = `$throttle$lastRun$${key}`;
    const pendingKey = `$throttle$pending$${key}`;
    return function(...args) {
      if (!this[resultKey]) {
        this[resultKey] = initialValueProvider ? initialValueProvider() : void 0;
      }
      if (this[lastRunKey] === null || this[lastRunKey] === void 0) {
        this[lastRunKey] = -Number.MAX_VALUE;
      }
      if (reducer) {
        this[resultKey] = reducer(this[resultKey], ...args);
      }
      if (this[pendingKey]) {
        return;
      }
      const nextTime = this[lastRunKey] + delay;
      if (nextTime <= Date.now()) {
        this[lastRunKey] = Date.now();
        fn.apply(this, [this[resultKey]]);
        this[resultKey] = initialValueProvider ? initialValueProvider() : void 0;
      } else {
        this[pendingKey] = true;
        this[timerKey] = setTimeout(() => {
          this[pendingKey] = false;
          this[lastRunKey] = Date.now();
          fn.apply(this, [this[resultKey]]);
          this[resultKey] = initialValueProvider ? initialValueProvider() : void 0;
        }, nextTime - Date.now());
      }
    };
  });
}
export { createDecorator2, debounce, throttle };
