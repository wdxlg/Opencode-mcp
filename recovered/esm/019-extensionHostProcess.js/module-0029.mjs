// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/base/common/async.ts
import { CancellationTokenSource } from "./module-0018.mjs";
import { BugIndicatingError, CancellationError } from "./module-0003.mjs";
import { Disposable, DisposableMap, MutableDisposable, isDisposable, toDisposable } from "./module-0011.mjs";
import { MicrotaskDelay } from "./module-0028.mjs";
import { Emitter, Event } from "./module-0017.mjs";
import { extUri } from "./module-0027.mjs";
import { setTimeout0 } from "./module-0014.mjs";


// src/vs/base/common/async.ts
function isThenable(obj) {
  return !!obj && typeof obj.then === "function";
}

function createCancelablePromise(callback) {
  const source = new CancellationTokenSource();
  const thenable = callback(source.token);
  let isCancelled = false;
  const promise = new Promise((resolve2, reject) => {
    const subscription = source.token.onCancellationRequested(() => {
      isCancelled = true;
      subscription.dispose();
      reject(new CancellationError());
    });
    Promise.resolve(thenable).then((value) => {
      subscription.dispose();
      source.dispose();
      if (!isCancelled) {
        resolve2(value);
      } else if (isDisposable(value)) {
        value.dispose();
      }
    }, (err) => {
      subscription.dispose();
      source.dispose();
      reject(err);
    });
  });
  return new class {
    cancel() {
      source.cancel();
      source.dispose();
    }
    then(resolve2, reject) {
      return promise.then(resolve2, reject);
    }
    catch(reject) {
      return this.then(void 0, reject);
    }
    finally(onfinally) {
      return promise.finally(onfinally);
    }
  }();
}

function raceCancellation(promise, token, defaultValue) {
  return new Promise((resolve2, reject) => {
    const ref = token.onCancellationRequested(() => {
      ref.dispose();
      resolve2(defaultValue);
    });
    promise.then(resolve2, reject).finally(() => ref.dispose());
  });
}

function raceCancellationError(promise, token) {
  return new Promise((resolve2, reject) => {
    const ref = token.onCancellationRequested(() => {
      ref.dispose();
      reject(new CancellationError());
    });
    promise.then(resolve2, reject).finally(() => ref.dispose());
  });
}

function asPromise(callback) {
  return new Promise((resolve2, reject) => {
    const item = callback();
    if (isThenable(item)) {
      item.then(resolve2, reject);
    } else {
      resolve2(item);
    }
  });
}

function promiseWithResolvers() {
  let resolve2;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve2 = res;
    reject = rej;
  });
  return { promise, resolve: resolve2, reject };
}

var Throttler = class {
  constructor() {
    this.activePromise = null;
    this.queuedPromise = null;
    this.queuedPromiseFactory = null;
    this.cancellationTokenSource = new CancellationTokenSource();
  }
  queue(promiseFactory) {
    if (this.cancellationTokenSource.token.isCancellationRequested) {
      return Promise.reject(new Error("Throttler is disposed"));
    }
    if (this.activePromise) {
      this.queuedPromiseFactory = promiseFactory;
      if (!this.queuedPromise) {
        const onComplete = () => {
          this.queuedPromise = null;
          if (this.cancellationTokenSource.token.isCancellationRequested) {
            return;
          }
          const result = this.queue(this.queuedPromiseFactory);
          this.queuedPromiseFactory = null;
          return result;
        };
        this.queuedPromise = new Promise((resolve2) => {
          this.activePromise.then(onComplete, onComplete).then(resolve2);
        });
      }
      return new Promise((resolve2, reject) => {
        this.queuedPromise.then(resolve2, reject);
      });
    }
    this.activePromise = promiseFactory(this.cancellationTokenSource.token);
    return new Promise((resolve2, reject) => {
      this.activePromise.then((result) => {
        this.activePromise = null;
        resolve2(result);
      }, (err) => {
        this.activePromise = null;
        reject(err);
      });
    });
  }
  dispose() {
    this.cancellationTokenSource.cancel();
  }
};

var Sequencer = class {
  constructor() {
    this.current = Promise.resolve(null);
  }
  queue(promiseTask) {
    return this.current = this.current.then(() => promiseTask(), () => promiseTask());
  }
};

var SequencerByKey = class {
  constructor() {
    this.promiseMap = /* @__PURE__ */ new Map();
  }
  queue(key, promiseTask) {
    const runningPromise = this.promiseMap.get(key) ?? Promise.resolve();
    const newPromise = runningPromise.catch(() => {
    }).then(promiseTask).finally(() => {
      if (this.promiseMap.get(key) === newPromise) {
        this.promiseMap.delete(key);
      }
    });
    this.promiseMap.set(key, newPromise);
    return newPromise;
  }
  peek(key) {
    return this.promiseMap.get(key) || void 0;
  }
  keys() {
    return this.promiseMap.keys();
  }
};

var timeoutDeferred = (timeout2, fn) => {
  let scheduled = true;
  const handle = setTimeout(() => {
    scheduled = false;
    fn();
  }, timeout2);
  return {
    isTriggered: () => scheduled,
    dispose: () => {
      clearTimeout(handle);
      scheduled = false;
    }
  };
};

var microtaskDeferred = (fn) => {
  let scheduled = true;
  queueMicrotask(() => {
    if (scheduled) {
      scheduled = false;
      fn();
    }
  });
  return {
    isTriggered: () => scheduled,
    dispose: () => {
      scheduled = false;
    }
  };
};

var Delayer = class {
  constructor(defaultDelay) {
    this.defaultDelay = defaultDelay;
    this.deferred = null;
    this.completionPromise = null;
    this.doResolve = null;
    this.doReject = null;
    this.task = null;
  }
  trigger(task, delay = this.defaultDelay) {
    this.task = task;
    this.cancelTimeout();
    if (!this.completionPromise) {
      this.completionPromise = new Promise((resolve2, reject) => {
        this.doResolve = resolve2;
        this.doReject = reject;
      }).then(() => {
        this.completionPromise = null;
        this.doResolve = null;
        if (this.task) {
          const task2 = this.task;
          this.task = null;
          return task2();
        }
        return void 0;
      });
    }
    const fn = () => {
      this.deferred = null;
      this.doResolve?.(null);
    };
    this.deferred = delay === MicrotaskDelay ? microtaskDeferred(fn) : timeoutDeferred(delay, fn);
    return this.completionPromise;
  }
  isTriggered() {
    return !!this.deferred?.isTriggered();
  }
  cancel() {
    this.cancelTimeout();
    if (this.completionPromise) {
      this.doReject?.(new CancellationError());
      this.completionPromise = null;
    }
  }
  cancelTimeout() {
    this.deferred?.dispose();
    this.deferred = null;
  }
  dispose() {
    this.cancel();
  }
};

var ThrottledDelayer = class {
  constructor(defaultDelay) {
    this.delayer = new Delayer(defaultDelay);
    this.throttler = new Throttler();
  }
  trigger(promiseFactory, delay) {
    return this.delayer.trigger(() => this.throttler.queue(promiseFactory), delay);
  }
  isTriggered() {
    return this.delayer.isTriggered();
  }
  cancel() {
    this.delayer.cancel();
  }
  dispose() {
    this.delayer.dispose();
    this.throttler.dispose();
  }
};

var Barrier = class {
  constructor() {
    this._isOpen = false;
    this._promise = new Promise((c, e) => {
      this._completePromise = c;
    });
  }
  isOpen() {
    return this._isOpen;
  }
  open() {
    this._isOpen = true;
    this._completePromise(true);
  }
  wait() {
    return this._promise;
  }
};

function timeout(millis, token) {
  if (!token) {
    return createCancelablePromise((token2) => timeout(millis, token2));
  }
  return new Promise((resolve2, reject) => {
    const handle = setTimeout(() => {
      disposable.dispose();
      resolve2();
    }, millis);
    const disposable = token.onCancellationRequested(() => {
      clearTimeout(handle);
      disposable.dispose();
      reject(new CancellationError());
    });
  });
}

function disposableTimeout(handler, timeout2 = 0, store) {
  const timer2 = setTimeout(() => {
    handler();
    if (store) {
      disposable.dispose();
    }
  }, timeout2);
  const disposable = toDisposable(() => {
    clearTimeout(timer2);
    store?.delete(disposable);
  });
  store?.add(disposable);
  return disposable;
}

var MAX_TIMEOUT_DELAY = 2 ** 31 - 1;

function firstParallel(promiseList, shouldStop = (t) => !!t, defaultValue = null) {
  if (promiseList.length === 0) {
    return Promise.resolve(defaultValue);
  }
  let todo = promiseList.length;
  const finish = () => {
    todo = -1;
    for (const promise of promiseList) {
      promise.cancel?.();
    }
  };
  return new Promise((resolve2, reject) => {
    for (const promise of promiseList) {
      promise.then((result) => {
        if (--todo >= 0 && shouldStop(result)) {
          finish();
          resolve2(result);
        } else if (todo === 0) {
          resolve2(defaultValue);
        }
      }).catch((err) => {
        if (--todo >= 0) {
          finish();
          reject(err);
        }
      });
    }
  });
}

var Limiter = class {
  constructor(maxDegreeOfParalellism) {
    this._size = 0;
    this._isDisposed = false;
    this.maxDegreeOfParalellism = maxDegreeOfParalellism;
    this.outstandingPromises = [];
    this.runningPromises = 0;
    this._onDrained = new Emitter();
  }
  /**
   *
   * @returns A promise that resolved when all work is done (onDrained) or when
   * there is nothing to do
   */
  whenIdle() {
    return this.size > 0 ? Event.toPromise(this.onDrained) : Promise.resolve();
  }
  get onDrained() {
    return this._onDrained.event;
  }
  get size() {
    return this._size;
  }
  queue(factory) {
    if (this._isDisposed) {
      throw new Error("Object has been disposed");
    }
    this._size++;
    return new Promise((c, e) => {
      this.outstandingPromises.push({ factory, c, e });
      this.consume();
    });
  }
  consume() {
    while (this.outstandingPromises.length && this.runningPromises < this.maxDegreeOfParalellism) {
      const iLimitedTask = this.outstandingPromises.shift();
      this.runningPromises++;
      const promise = iLimitedTask.factory();
      promise.then(iLimitedTask.c, iLimitedTask.e);
      promise.then(() => this.consumed(), () => this.consumed());
    }
  }
  consumed() {
    if (this._isDisposed) {
      return;
    }
    this.runningPromises--;
    if (--this._size === 0) {
      this._onDrained.fire();
    }
    if (this.outstandingPromises.length > 0) {
      this.consume();
    }
  }
  clear() {
    if (this._isDisposed) {
      throw new Error("Object has been disposed");
    }
    this.outstandingPromises.length = 0;
    this._size = this.runningPromises;
  }
  dispose() {
    this._isDisposed = true;
    this.outstandingPromises.length = 0;
    this._size = 0;
    this._onDrained.dispose();
  }
};

var Queue = class extends Limiter {
  constructor() {
    super(1);
  }
};

var ResourceQueue = class {
  constructor() {
    this.queues = /* @__PURE__ */ new Map();
    this.drainers = /* @__PURE__ */ new Set();
    this.drainListeners = void 0;
    this.drainListenerCount = 0;
  }
  async whenDrained() {
    if (this.isDrained()) {
      return;
    }
    const promise = new DeferredPromise();
    this.drainers.add(promise);
    return promise.p;
  }
  isDrained() {
    for (const [, queue] of this.queues) {
      if (queue.size > 0) {
        return false;
      }
    }
    return true;
  }
  queueSize(resource, extUri2 = extUri) {
    const key = extUri2.getComparisonKey(resource);
    return this.queues.get(key)?.size ?? 0;
  }
  queueFor(resource, factory, extUri2 = extUri) {
    const key = extUri2.getComparisonKey(resource);
    let queue = this.queues.get(key);
    if (!queue) {
      queue = new Queue();
      const drainListenerId = this.drainListenerCount++;
      const drainListener = Event.once(queue.onDrained)(() => {
        queue?.dispose();
        this.queues.delete(key);
        this.onDidQueueDrain();
        this.drainListeners?.deleteAndDispose(drainListenerId);
        if (this.drainListeners?.size === 0) {
          this.drainListeners.dispose();
          this.drainListeners = void 0;
        }
      });
      if (!this.drainListeners) {
        this.drainListeners = new DisposableMap();
      }
      this.drainListeners.set(drainListenerId, drainListener);
      this.queues.set(key, queue);
    }
    return queue.queue(factory);
  }
  onDidQueueDrain() {
    if (!this.isDrained()) {
      return;
    }
    this.releaseDrainers();
  }
  releaseDrainers() {
    for (const drainer of this.drainers) {
      drainer.complete();
    }
    this.drainers.clear();
  }
  dispose() {
    for (const [, queue] of this.queues) {
      queue.dispose();
    }
    this.queues.clear();
    this.releaseDrainers();
    this.drainListeners?.dispose();
  }
};

var TimeoutTimer = class {
  constructor(runner, timeout2) {
    this._isDisposed = false;
    this._token = void 0;
    if (typeof runner === "function" && typeof timeout2 === "number") {
      this.setIfNotSet(runner, timeout2);
    }
  }
  dispose() {
    this.cancel();
    this._isDisposed = true;
  }
  cancel() {
    if (this._token !== void 0) {
      clearTimeout(this._token);
      this._token = void 0;
    }
  }
  cancelAndSet(runner, timeout2) {
    if (this._isDisposed) {
      throw new BugIndicatingError(`Calling 'cancelAndSet' on a disposed TimeoutTimer`);
    }
    this.cancel();
    this._token = setTimeout(() => {
      this._token = void 0;
      runner();
    }, timeout2);
  }
  setIfNotSet(runner, timeout2) {
    if (this._isDisposed) {
      throw new BugIndicatingError(`Calling 'setIfNotSet' on a disposed TimeoutTimer`);
    }
    if (this._token !== void 0) {
      return;
    }
    this._token = setTimeout(() => {
      this._token = void 0;
      runner();
    }, timeout2);
  }
};

var IntervalTimer = class {
  constructor() {
    this.disposable = void 0;
    this.isDisposed = false;
  }
  cancel() {
    this.disposable?.dispose();
    this.disposable = void 0;
  }
  cancelAndSet(runner, interval, context = globalThis) {
    if (this.isDisposed) {
      throw new BugIndicatingError(`Calling 'cancelAndSet' on a disposed IntervalTimer`);
    }
    this.cancel();
    const handle = context.setInterval(() => {
      runner();
    }, interval);
    this.disposable = toDisposable(() => {
      context.clearInterval(handle);
      this.disposable = void 0;
    });
  }
  dispose() {
    this.cancel();
    this.isDisposed = true;
  }
};

var RunOnceScheduler = class {
  constructor(runner, delay) {
    this.timeoutToken = void 0;
    this.runner = runner;
    this.timeout = delay;
    this.timeoutHandler = this.onTimeout.bind(this);
  }
  /**
   * Dispose RunOnceScheduler
   */
  dispose() {
    this.cancel();
    this.runner = null;
  }
  /**
   * Cancel current scheduled runner (if any).
   */
  cancel() {
    if (this.isScheduled()) {
      clearTimeout(this.timeoutToken);
      this.timeoutToken = void 0;
    }
  }
  /**
   * Cancel previous runner (if any) & schedule a new runner.
   */
  schedule(delay = this.timeout) {
    this.cancel();
    this.timeoutToken = setTimeout(this.timeoutHandler, delay);
  }
  get delay() {
    return this.timeout;
  }
  set delay(value) {
    this.timeout = value;
  }
  /**
   * Returns true if scheduled.
   */
  isScheduled() {
    return this.timeoutToken !== void 0;
  }
  flush() {
    if (this.isScheduled()) {
      this.cancel();
      this.doRun();
    }
  }
  onTimeout() {
    this.timeoutToken = void 0;
    if (this.runner) {
      this.doRun();
    }
  }
  doRun() {
    this.runner?.();
  }
};

var ProcessTimeRunOnceScheduler = class {
  constructor(runner, delay) {
    if (delay % 1e3 !== 0) {
      console.warn(`ProcessTimeRunOnceScheduler resolution is 1s, ${delay}ms is not a multiple of 1000ms.`);
    }
    this.runner = runner;
    this.timeout = delay;
    this.counter = 0;
    this.intervalToken = void 0;
    this.intervalHandler = this.onInterval.bind(this);
  }
  dispose() {
    this.cancel();
    this.runner = null;
  }
  cancel() {
    if (this.isScheduled()) {
      clearInterval(this.intervalToken);
      this.intervalToken = void 0;
    }
  }
  /**
   * Cancel previous runner (if any) & schedule a new runner.
   */
  schedule(delay = this.timeout) {
    if (delay % 1e3 !== 0) {
      console.warn(`ProcessTimeRunOnceScheduler resolution is 1s, ${delay}ms is not a multiple of 1000ms.`);
    }
    this.cancel();
    this.counter = Math.ceil(delay / 1e3);
    this.intervalToken = setInterval(this.intervalHandler, 1e3);
  }
  /**
   * Returns true if scheduled.
   */
  isScheduled() {
    return this.intervalToken !== void 0;
  }
  onInterval() {
    this.counter--;
    if (this.counter > 0) {
      return;
    }
    clearInterval(this.intervalToken);
    this.intervalToken = void 0;
    this.runner?.();
  }
};

var RunOnceWorker = class extends RunOnceScheduler {
  constructor(runner, timeout2) {
    super(runner, timeout2);
    this.units = [];
  }
  work(unit) {
    this.units.push(unit);
    if (!this.isScheduled()) {
      this.schedule();
    }
  }
  doRun() {
    const units = this.units;
    this.units = [];
    this.runner?.(units);
  }
  dispose() {
    this.units = [];
    super.dispose();
  }
};

var ThrottledWorker = class extends Disposable {
  constructor(options2, handler) {
    super();
    this.options = options2;
    this.handler = handler;
    this.pendingWork = [];
    this.throttler = this._register(new MutableDisposable());
    this.disposed = false;
    this.lastExecutionTime = 0;
  }
  /**
   * The number of work units that are pending to be processed.
   */
  get pending() {
    return this.pendingWork.length;
  }
  /**
   * Add units to be worked on. Use `pending` to figure out
   * how many units are not yet processed after this method
   * was called.
   *
   * @returns whether the work was accepted or not. If the
   * worker is disposed, it will not accept any more work.
   * If the number of pending units would become larger
   * than `maxPendingWork`, more work will also not be accepted.
   */
  work(units) {
    if (this.disposed) {
      return false;
    }
    if (typeof this.options.maxBufferedWork === "number") {
      if (this.throttler.value) {
        if (this.pending + units.length > this.options.maxBufferedWork) {
          return false;
        }
      } else {
        if (this.pending + units.length - this.options.maxWorkChunkSize > this.options.maxBufferedWork) {
          return false;
        }
      }
    }
    for (const unit of units) {
      this.pendingWork.push(unit);
    }
    const timeSinceLastExecution = Date.now() - this.lastExecutionTime;
    if (!this.throttler.value && (!this.options.waitThrottleDelayBetweenWorkUnits || timeSinceLastExecution >= this.options.throttleDelay)) {
      this.doWork();
    } else if (!this.throttler.value && this.options.waitThrottleDelayBetweenWorkUnits) {
      this.scheduleThrottler(Math.max(this.options.throttleDelay - timeSinceLastExecution, 0));
    } else {
    }
    return true;
  }
  doWork() {
    this.lastExecutionTime = Date.now();
    this.handler(this.pendingWork.splice(0, this.options.maxWorkChunkSize));
    if (this.pendingWork.length > 0) {
      this.scheduleThrottler();
    }
  }
  scheduleThrottler(delay = this.options.throttleDelay) {
    this.throttler.value = new RunOnceScheduler(() => {
      this.throttler.clear();
      this.doWork();
    }, delay);
    this.throttler.value.schedule();
  }
  dispose() {
    super.dispose();
    this.pendingWork.length = 0;
    this.disposed = true;
  }
};

var runWhenGlobalIdle;

var _runWhenIdle;

(function() {
  const safeGlobal = globalThis;
  if (typeof safeGlobal.requestIdleCallback !== "function" || typeof safeGlobal.cancelIdleCallback !== "function") {
    _runWhenIdle = (_targetWindow, runner, timeout2) => {
      setTimeout0(() => {
        if (disposed) {
          return;
        }
        const end = Date.now() + 15;
        const deadline = {
          didTimeout: true,
          timeRemaining() {
            return Math.max(0, end - Date.now());
          }
        };
        runner(Object.freeze(deadline));
      });
      let disposed = false;
      return {
        dispose() {
          if (disposed) {
            return;
          }
          disposed = true;
        }
      };
    };
  } else {
    _runWhenIdle = (targetWindow, runner, timeout2) => {
      const handle = targetWindow.requestIdleCallback(runner, typeof timeout2 === "number" ? { timeout: timeout2 } : void 0);
      let disposed = false;
      return {
        dispose() {
          if (disposed) {
            return;
          }
          disposed = true;
          targetWindow.cancelIdleCallback(handle);
        }
      };
    };
  }
  runWhenGlobalIdle = (runner, timeout2) => _runWhenIdle(globalThis, runner, timeout2);
})();

var AbstractIdleValue = class {
  constructor(targetWindow, executor) {
    this._didRun = false;
    this._executor = () => {
      try {
        this._value = executor();
      } catch (err) {
        this._error = err;
      } finally {
        this._didRun = true;
      }
    };
    this._handle = _runWhenIdle(targetWindow, () => this._executor());
  }
  dispose() {
    this._handle.dispose();
  }
  get value() {
    if (!this._didRun) {
      this._handle.dispose();
      this._executor();
    }
    if (this._error) {
      throw this._error;
    }
    return this._value;
  }
  get isInitialized() {
    return this._didRun;
  }
};

var GlobalIdleValue = class extends AbstractIdleValue {
  constructor(executor) {
    super(globalThis, executor);
  }
};

async function retry(task, delay, retries) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      await timeout(delay);
    }
  }
  throw lastError;
}

var DeferredPromise = class _DeferredPromise {
  static fromPromise(promise) {
    const deferred = new _DeferredPromise();
    deferred.settleWith(promise);
    return deferred;
  }
  get isRejected() {
    return this.outcome?.outcome === 1 /* Rejected */;
  }
  get isResolved() {
    return this.outcome?.outcome === 0 /* Resolved */;
  }
  get isSettled() {
    return !!this.outcome;
  }
  get value() {
    return this.outcome?.outcome === 0 /* Resolved */ ? this.outcome?.value : void 0;
  }
  constructor() {
    this.p = new Promise((c, e) => {
      this.completeCallback = c;
      this.errorCallback = e;
    });
  }
  complete(value) {
    if (this.isSettled) {
      return Promise.resolve();
    }
    return new Promise((resolve2) => {
      this.completeCallback(value);
      this.outcome = { outcome: 0 /* Resolved */, value };
      resolve2();
    });
  }
  error(err) {
    if (this.isSettled) {
      return Promise.resolve();
    }
    return new Promise((resolve2) => {
      this.errorCallback(err);
      this.outcome = { outcome: 1 /* Rejected */, value: err };
      resolve2();
    });
  }
  settleWith(promise) {
    return promise.then(
      (value) => this.complete(value),
      (error) => this.error(error)
    );
  }
  cancel() {
    return this.error(new CancellationError());
  }
};

var Promises;

((Promises3) => {
  async function settled(promises7) {
    let firstError = void 0;
    const result = await Promise.all(promises7.map((promise) => promise.then((value) => value, (error) => {
      if (!firstError) {
        firstError = error;
      }
      return void 0;
    })));
    if (typeof firstError !== "undefined") {
      throw firstError;
    }
    return result;
  }
  Promises3.settled = settled;
  function withAsyncBody(bodyFn) {
    return new Promise(async (resolve2, reject) => {
      try {
        await bodyFn(resolve2, reject);
      } catch (error) {
        reject(error);
      }
    });
  }
  Promises3.withAsyncBody = withAsyncBody;
})(Promises || (Promises = {}));

var AsyncIterableObject = class _AsyncIterableObject {
  static fromArray(items) {
    return new _AsyncIterableObject((writer) => {
      writer.emitMany(items);
    });
  }
  static fromPromise(promise) {
    return new _AsyncIterableObject(async (emitter) => {
      emitter.emitMany(await promise);
    });
  }
  static fromPromisesResolveOrder(promises7) {
    return new _AsyncIterableObject(async (emitter) => {
      await Promise.all(promises7.map(async (p) => emitter.emitOne(await p)));
    });
  }
  static merge(iterables) {
    return new _AsyncIterableObject(async (emitter) => {
      await Promise.all(iterables.map(async (iterable) => {
        for await (const item of iterable) {
          emitter.emitOne(item);
        }
      }));
    });
  }
  static {
    this.EMPTY = _AsyncIterableObject.fromArray([]);
  }
  constructor(executor, onReturn) {
    this._state = 0 /* Initial */;
    this._results = [];
    this._error = null;
    this._onReturn = onReturn;
    this._onStateChanged = new Emitter();
    queueMicrotask(async () => {
      const writer = {
        emitOne: (item) => this.emitOne(item),
        emitMany: (items) => this.emitMany(items),
        reject: (error) => this.reject(error)
      };
      try {
        await Promise.resolve(executor(writer));
        this.resolve();
      } catch (err) {
        this.reject(err);
      } finally {
        writer.emitOne = () => {
        };
        writer.emitMany = () => {
        };
        writer.reject = () => {
        };
      }
    });
  }
  [Symbol.asyncIterator]() {
    let i = 0;
    return {
      next: async () => {
        do {
          if (this._state === 2 /* DoneError */) {
            throw this._error;
          }
          if (i < this._results.length) {
            return { done: false, value: this._results[i++] };
          }
          if (this._state === 1 /* DoneOK */) {
            return { done: true, value: void 0 };
          }
          await Event.toPromise(this._onStateChanged.event);
        } while (true);
      },
      return: async () => {
        this._onReturn?.();
        return { done: true, value: void 0 };
      }
    };
  }
  static map(iterable, mapFn) {
    return new _AsyncIterableObject(async (emitter) => {
      for await (const item of iterable) {
        emitter.emitOne(mapFn(item));
      }
    });
  }
  map(mapFn) {
    return _AsyncIterableObject.map(this, mapFn);
  }
  static filter(iterable, filterFn) {
    return new _AsyncIterableObject(async (emitter) => {
      for await (const item of iterable) {
        if (filterFn(item)) {
          emitter.emitOne(item);
        }
      }
    });
  }
  filter(filterFn) {
    return _AsyncIterableObject.filter(this, filterFn);
  }
  static coalesce(iterable) {
    return _AsyncIterableObject.filter(iterable, (item) => !!item);
  }
  coalesce() {
    return _AsyncIterableObject.coalesce(this);
  }
  static async toPromise(iterable) {
    const result = [];
    for await (const item of iterable) {
      result.push(item);
    }
    return result;
  }
  toPromise() {
    return _AsyncIterableObject.toPromise(this);
  }
  /**
   * The value will be appended at the end.
   *
   * **NOTE** If `resolve()` or `reject()` have already been called, this method has no effect.
   */
  emitOne(value) {
    if (this._state !== 0 /* Initial */) {
      return;
    }
    this._results.push(value);
    this._onStateChanged.fire();
  }
  /**
   * The values will be appended at the end.
   *
   * **NOTE** If `resolve()` or `reject()` have already been called, this method has no effect.
   */
  emitMany(values) {
    if (this._state !== 0 /* Initial */) {
      return;
    }
    this._results = this._results.concat(values);
    this._onStateChanged.fire();
  }
  /**
   * Calling `resolve()` will mark the result array as complete.
   *
   * **NOTE** `resolve()` must be called, otherwise all consumers of this iterable will hang indefinitely, similar to a non-resolved promise.
   * **NOTE** If `resolve()` or `reject()` have already been called, this method has no effect.
   */
  resolve() {
    if (this._state !== 0 /* Initial */) {
      return;
    }
    this._state = 1 /* DoneOK */;
    this._onStateChanged.fire();
  }
  /**
   * Writing an error will permanently invalidate this iterable.
   * The current users will receive an error thrown, as will all future users.
   *
   * **NOTE** If `resolve()` or `reject()` have already been called, this method has no effect.
   */
  reject(error) {
    if (this._state !== 0 /* Initial */) {
      return;
    }
    this._state = 2 /* DoneError */;
    this._error = error;
    this._onStateChanged.fire();
  }
};

var AsyncIterableSource = class {
  /**
   *
   * @param onReturn A function that will be called when consuming the async iterable
   * has finished by the consumer, e.g the for-await-loop has be existed (break, return) early.
   * This is NOT called when resolving this source by its owner.
   */
  constructor(onReturn) {
    this._deferred = new DeferredPromise();
    this._asyncIterable = new AsyncIterableObject((emitter) => {
      if (earlyError) {
        emitter.reject(earlyError);
        return;
      }
      if (earlyItems) {
        emitter.emitMany(earlyItems);
      }
      this._errorFn = (error) => emitter.reject(error);
      this._emitOneFn = (item) => emitter.emitOne(item);
      this._emitManyFn = (items) => emitter.emitMany(items);
      return this._deferred.p;
    }, onReturn);
    let earlyError;
    let earlyItems;
    this._errorFn = (error) => {
      if (!earlyError) {
        earlyError = error;
      }
    };
    this._emitOneFn = (item) => {
      if (!earlyItems) {
        earlyItems = [];
      }
      earlyItems.push(item);
    };
    this._emitManyFn = (items) => {
      if (!earlyItems) {
        earlyItems = items.slice();
      } else {
        items.forEach((item) => earlyItems.push(item));
      }
    };
  }
  get asyncIterable() {
    return this._asyncIterable;
  }
  resolve() {
    this._deferred.complete();
  }
  reject(error) {
    this._errorFn(error);
    this._deferred.complete();
  }
  emitOne(item) {
    this._emitOneFn(item);
  }
  emitMany(items) {
    this._emitManyFn(items);
  }
};

var ProducerConsumer = class {
  constructor() {
    this._unsatisfiedConsumers = [];
    this._unconsumedValues = [];
  }
  get hasFinalValue() {
    return !!this._finalValue;
  }
  produce(value) {
    this._ensureNoFinalValue();
    if (this._unsatisfiedConsumers.length > 0) {
      const deferred = this._unsatisfiedConsumers.shift();
      this._resolveOrRejectDeferred(deferred, value);
    } else {
      this._unconsumedValues.push(value);
    }
  }
  produceFinal(value) {
    this._ensureNoFinalValue();
    this._finalValue = value;
    for (const deferred of this._unsatisfiedConsumers) {
      this._resolveOrRejectDeferred(deferred, value);
    }
    this._unsatisfiedConsumers.length = 0;
  }
  _ensureNoFinalValue() {
    if (this._finalValue) {
      throw new BugIndicatingError("ProducerConsumer: cannot produce after final value has been set");
    }
  }
  _resolveOrRejectDeferred(deferred, value) {
    if (value.ok) {
      deferred.complete(value.value);
    } else {
      deferred.error(value.error);
    }
  }
  consume() {
    if (this._unconsumedValues.length > 0 || this._finalValue) {
      const value = this._unconsumedValues.length > 0 ? this._unconsumedValues.shift() : this._finalValue;
      if (value.ok) {
        return Promise.resolve(value.value);
      } else {
        return Promise.reject(value.error);
      }
    } else {
      const deferred = new DeferredPromise();
      this._unsatisfiedConsumers.push(deferred);
      return deferred.p;
    }
  }
};

var AsyncIterableProducer = class _AsyncIterableProducer {
  constructor(executor, _onReturn) {
    this._onReturn = _onReturn;
    this._producerConsumer = new ProducerConsumer();
    this._iterator = {
      next: () => this._producerConsumer.consume(),
      return: () => {
        this._onReturn?.();
        return Promise.resolve({ done: true, value: void 0 });
      },
      throw: async (e) => {
        this._finishError(e);
        return { done: true, value: void 0 };
      }
    };
    queueMicrotask(async () => {
      const p = executor({
        emitOne: (value) => this._producerConsumer.produce({ ok: true, value: { done: false, value } }),
        emitMany: (values) => {
          for (const value of values) {
            this._producerConsumer.produce({ ok: true, value: { done: false, value } });
          }
        },
        reject: (error) => this._finishError(error)
      });
      if (!this._producerConsumer.hasFinalValue) {
        try {
          await p;
          this._finishOk();
        } catch (error) {
          this._finishError(error);
        }
      }
    });
  }
  static fromArray(items) {
    return new _AsyncIterableProducer((writer) => {
      writer.emitMany(items);
    });
  }
  static fromPromise(promise) {
    return new _AsyncIterableProducer(async (emitter) => {
      emitter.emitMany(await promise);
    });
  }
  static fromPromisesResolveOrder(promises7) {
    return new _AsyncIterableProducer(async (emitter) => {
      await Promise.all(promises7.map(async (p) => emitter.emitOne(await p)));
    });
  }
  static merge(iterables) {
    return new _AsyncIterableProducer(async (emitter) => {
      await Promise.all(iterables.map(async (iterable) => {
        for await (const item of iterable) {
          emitter.emitOne(item);
        }
      }));
    });
  }
  static {
    this.EMPTY = _AsyncIterableProducer.fromArray([]);
  }
  static map(iterable, mapFn) {
    return new _AsyncIterableProducer(async (emitter) => {
      for await (const item of iterable) {
        emitter.emitOne(mapFn(item));
      }
    });
  }
  static tee(iterable) {
    let emitter1;
    let emitter2;
    const defer = new DeferredPromise();
    const start = async () => {
      if (!emitter1 || !emitter2) {
        return;
      }
      try {
        for await (const item of iterable) {
          emitter1.emitOne(item);
          emitter2.emitOne(item);
        }
      } catch (err) {
        emitter1.reject(err);
        emitter2.reject(err);
      } finally {
        defer.complete();
      }
    };
    const p1 = new _AsyncIterableProducer(async (emitter) => {
      emitter1 = emitter;
      start();
      return defer.p;
    });
    const p2 = new _AsyncIterableProducer(async (emitter) => {
      emitter2 = emitter;
      start();
      return defer.p;
    });
    return [p1, p2];
  }
  map(mapFn) {
    return _AsyncIterableProducer.map(this, mapFn);
  }
  static coalesce(iterable) {
    return _AsyncIterableProducer.filter(iterable, (item) => !!item);
  }
  coalesce() {
    return _AsyncIterableProducer.coalesce(this);
  }
  static filter(iterable, filterFn) {
    return new _AsyncIterableProducer(async (emitter) => {
      for await (const item of iterable) {
        if (filterFn(item)) {
          emitter.emitOne(item);
        }
      }
    });
  }
  filter(filterFn) {
    return _AsyncIterableProducer.filter(this, filterFn);
  }
  _finishOk() {
    if (!this._producerConsumer.hasFinalValue) {
      this._producerConsumer.produceFinal({ ok: true, value: { done: true, value: void 0 } });
    }
  }
  _finishError(error) {
    if (!this._producerConsumer.hasFinalValue) {
      this._producerConsumer.produceFinal({ ok: false, error });
    }
  }
  [Symbol.asyncIterator]() {
    return this._iterator;
  }
};
export { isThenable, createCancelablePromise, raceCancellation, raceCancellationError, asPromise, promiseWithResolvers, timeout, disposableTimeout, firstParallel, retry, Throttler, Sequencer, SequencerByKey, timeoutDeferred, microtaskDeferred, Delayer, ThrottledDelayer, Barrier, MAX_TIMEOUT_DELAY, Limiter, Queue, ResourceQueue, TimeoutTimer, IntervalTimer, RunOnceScheduler, ProcessTimeRunOnceScheduler, RunOnceWorker, ThrottledWorker, runWhenGlobalIdle, _runWhenIdle, AbstractIdleValue, GlobalIdleValue, DeferredPromise, Promises, AsyncIterableObject, AsyncIterableSource, ProducerConsumer, AsyncIterableProducer };
