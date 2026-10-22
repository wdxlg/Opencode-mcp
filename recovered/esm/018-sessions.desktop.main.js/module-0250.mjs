// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/base/common/decorators.ts



// src/vs/base/common/decorators.ts
function createDecorator2(mapFn) {
  return (_target, key3, descriptor) => {
    let fnKey = null;
    let fn = null;
    if (typeof descriptor.value === "function") {
      fnKey = "value";
      fn = descriptor.value;
    } else if (typeof descriptor.get === "function") {
      fnKey = "get";
      fn = descriptor.get;
    }
    if (!fn || typeof key3 === "symbol") {
      throw new Error("not supported");
    }
    descriptor[fnKey] = mapFn(fn, key3);
  };
}

function memoize(_target, key3, descriptor) {
  let fnKey = null;
  let fn = null;
  if (typeof descriptor.value === "function") {
    fnKey = "value";
    fn = descriptor.value;
    if (fn.length !== 0) {
      console.warn("Memoize should only be used in functions with zero parameters");
    }
  } else if (typeof descriptor.get === "function") {
    fnKey = "get";
    fn = descriptor.get;
  }
  if (!fn) {
    throw new Error("not supported");
  }
  const memoizeKey = `$memoize$${key3}`;
  descriptor[fnKey] = function(...args2) {
    if (!this.hasOwnProperty(memoizeKey)) {
      Object.defineProperty(this, memoizeKey, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: fn.apply(this, args2)
      });
    }
    return this[memoizeKey];
  };
}

function debounce(delay, reducer, initialValueProvider) {
  return createDecorator2((fn, key3) => {
    const timerKey = `$debounce$${key3}`;
    const resultKey = `$debounce$result$${key3}`;
    return function(...args2) {
      if (!this[resultKey]) {
        this[resultKey] = initialValueProvider ? initialValueProvider() : void 0;
      }
      clearTimeout(this[timerKey]);
      if (reducer) {
        this[resultKey] = reducer(this[resultKey], ...args2);
        args2 = [this[resultKey]];
      }
      this[timerKey] = setTimeout(() => {
        fn.apply(this, args2);
        this[resultKey] = initialValueProvider ? initialValueProvider() : void 0;
      }, delay);
    };
  });
}

function throttle(delay, reducer, initialValueProvider) {
  return createDecorator2((fn, key3) => {
    const timerKey = `$throttle$timer$${key3}`;
    const resultKey = `$throttle$result$${key3}`;
    const lastRunKey = `$throttle$lastRun$${key3}`;
    const pendingKey = `$throttle$pending$${key3}`;
    return function(...args2) {
      if (!this[resultKey]) {
        this[resultKey] = initialValueProvider ? initialValueProvider() : void 0;
      }
      if (this[lastRunKey] === null || this[lastRunKey] === void 0) {
        this[lastRunKey] = -Number.MAX_VALUE;
      }
      if (reducer) {
        this[resultKey] = reducer(this[resultKey], ...args2);
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
export { createDecorator2, memoize, debounce, throttle };
