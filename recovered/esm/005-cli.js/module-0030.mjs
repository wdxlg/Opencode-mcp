// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/cli.js
// Original module marker: src/vs/base/common/async.ts
import { CancellationTokenSource, init_cancellation } from "./module-0018.mjs";
import { BugIndicatingError, CancellationError, init_errors } from "./module-0006.mjs";
import { Disposable, DisposableMap, MutableDisposable, init_lifecycle, isDisposable } from "./module-0014.mjs";
import { __esm } from "./module-0000.mjs";
import { Emitter, Event, init_event } from "./module-0017.mjs";
import { extUri, init_resources } from "./module-0028.mjs";
import { init_platform, setTimeout0 } from "./module-0002.mjs";
import { init_symbols } from "./module-0029.mjs";
import { init_lazy } from "./module-0021.mjs";


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

var MAX_TIMEOUT_DELAY, Limiter, Queue, ResourceQueue, RunOnceScheduler, RunOnceWorker, ThrottledWorker, runWhenGlobalIdle, _runWhenIdle, DeferredPromise, Promises, AsyncIterableObject, ProducerConsumer, AsyncIterableProducer;

var init_async = __esm({
  "src/vs/base/common/async.ts"() {
    init_cancellation();
    init_errors();
    init_event();
    init_lifecycle();
    init_resources();
    init_platform();
    init_symbols();
    init_lazy();
    MAX_TIMEOUT_DELAY = 2 ** 31 - 1;
    Limiter = class {
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
    Queue = class extends Limiter {
      constructor() {
        super(1);
      }
    };
    ResourceQueue = class {
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
    RunOnceScheduler = class {
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
    RunOnceWorker = class extends RunOnceScheduler {
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
    ThrottledWorker = class extends Disposable {
      constructor(options, handler) {
        super();
        this.options = options;
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
    DeferredPromise = class _DeferredPromise {
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
    ((Promises3) => {
      async function settled(promises6) {
        let firstError = void 0;
        const result = await Promise.all(promises6.map((promise) => promise.then((value) => value, (error) => {
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
    AsyncIterableObject = class _AsyncIterableObject {
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
      static fromPromisesResolveOrder(promises6) {
        return new _AsyncIterableObject(async (emitter) => {
          await Promise.all(promises6.map(async (p) => emitter.emitOne(await p)));
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
    ProducerConsumer = class {
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
    AsyncIterableProducer = class _AsyncIterableProducer {
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
      static fromPromisesResolveOrder(promises6) {
        return new _AsyncIterableProducer(async (emitter) => {
          await Promise.all(promises6.map(async (p) => emitter.emitOne(await p)));
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
  }
});
export { isThenable, createCancelablePromise, timeout, MAX_TIMEOUT_DELAY, Limiter, Queue, ResourceQueue, RunOnceScheduler, RunOnceWorker, ThrottledWorker, runWhenGlobalIdle, _runWhenIdle, DeferredPromise, Promises, AsyncIterableObject, ProducerConsumer, AsyncIterableProducer, init_async };
