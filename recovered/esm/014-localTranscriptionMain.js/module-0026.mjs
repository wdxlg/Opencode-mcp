// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/localTranscription/node/localTranscriptionMain.js
// Original module marker: src/vs/base/common/async.ts
import { CancellationTokenSource } from "./module-0017.mjs";
import { BugIndicatingError, CancellationError } from "./module-0002.mjs";
import { DisposableMap, isDisposable } from "./module-0010.mjs";
import { Emitter, Event } from "./module-0016.mjs";
import { extUri } from "./module-0025.mjs";
import { setTimeout0 } from "./module-0013.mjs";


// src/vs/base/common/async.ts
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

var Sequencer = class {
  constructor() {
    this.current = Promise.resolve(null);
  }
  queue(promiseTask) {
    return this.current = this.current.then(() => promiseTask(), () => promiseTask());
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

var MAX_TIMEOUT_DELAY = 2 ** 31 - 1;

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
  async function settled(promises4) {
    let firstError = void 0;
    const result = await Promise.all(promises4.map((promise) => promise.then((value) => value, (error) => {
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
  static fromPromisesResolveOrder(promises4) {
    return new _AsyncIterableObject(async (emitter) => {
      await Promise.all(promises4.map(async (p) => emitter.emitOne(await p)));
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
  static fromPromisesResolveOrder(promises4) {
    return new _AsyncIterableProducer(async (emitter) => {
      await Promise.all(promises4.map(async (p) => emitter.emitOne(await p)));
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
export { createCancelablePromise, timeout, Sequencer, MAX_TIMEOUT_DELAY, Limiter, Queue, ResourceQueue, runWhenGlobalIdle, _runWhenIdle, DeferredPromise, Promises, AsyncIterableObject, ProducerConsumer, AsyncIterableProducer };
