// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/event.ts
import { env } from "./module-0015.mjs";
import { Disposable, DisposableMap, DisposableStore, combinedDisposable, toDisposable } from "./module-0012.mjs";
import { StopWatch } from "./module-0016.mjs";
import { onUnexpectedError } from "./module-0004.mjs";
import { LinkedList } from "./module-0013.mjs";
import { createSingleCallFunction } from "./module-0005.mjs";
import { diffSets } from "./module-0003.mjs";


// src/vs/base/common/event.ts
var _enableDisposeWithListenerWarning = false;

var _enableSnapshotPotentialLeakWarning = false;

var _bufferLeakWarnCountThreshold = 100;

var _bufferLeakWarnTimeThreshold = 6e4;

function _isBufferLeakWarningEnabled() {
  return !!env["VSCODE_DEV"];
}

var Event2;

((Event365) => {
  Event365.None = () => Disposable.None;
  function _addLeakageTraceLogic(options3) {
    if (_enableSnapshotPotentialLeakWarning) {
      const { onDidAddListener: origListenerDidAdd } = options3;
      const stack = Stacktrace.create();
      let count2 = 0;
      options3.onDidAddListener = () => {
        if (++count2 === 2) {
          console.warn("snapshotted emitter LIKELY used public and SHOULD HAVE BEEN created with DisposableStore. snapshotted here");
          stack.print();
        }
        origListenerDidAdd?.();
      };
    }
  }
  function defer(event, flushOnListenerRemove, disposable) {
    return debounce2(event, () => void 0, 0, void 0, flushOnListenerRemove ?? true, void 0, disposable);
  }
  Event365.defer = defer;
  function once(event) {
    return (listener, thisArgs = null, disposables) => {
      let didFire = false;
      let result = void 0;
      result = event((e) => {
        if (didFire) {
          return;
        } else if (result) {
          result.dispose();
        } else {
          didFire = true;
        }
        return listener.call(thisArgs, e);
      }, null, disposables);
      if (didFire) {
        result.dispose();
      }
      return result;
    };
  }
  Event365.once = once;
  function onceIf(event, condition) {
    return Event365.once(Event365.filter(event, condition));
  }
  Event365.onceIf = onceIf;
  function map(event, map2, disposable) {
    return snapshot((listener, thisArgs = null, disposables) => event((i2) => listener.call(thisArgs, map2(i2)), null, disposables), disposable);
  }
  Event365.map = map;
  function forEach(event, each, disposable) {
    return snapshot((listener, thisArgs = null, disposables) => event((i2) => {
      each(i2);
      listener.call(thisArgs, i2);
    }, null, disposables), disposable);
  }
  Event365.forEach = forEach;
  function filter2(event, filter3, disposable) {
    return snapshot((listener, thisArgs = null, disposables) => event((e) => filter3(e) && listener.call(thisArgs, e), null, disposables), disposable);
  }
  Event365.filter = filter2;
  function signal(event) {
    return event;
  }
  Event365.signal = signal;
  function any(...events) {
    return (listener, thisArgs = null, disposables) => {
      const disposable = combinedDisposable(...events.map((event) => event((e) => listener.call(thisArgs, e))));
      return addAndReturnDisposable(disposable, disposables);
    };
  }
  Event365.any = any;
  function reduce(event, merge4, initial, disposable) {
    let output = initial;
    return map(event, (e) => {
      output = merge4(output, e);
      return output;
    }, disposable);
  }
  Event365.reduce = reduce;
  function snapshot(event, disposable) {
    let listener;
    const options3 = {
      onWillAddFirstListener() {
        listener = event(emitter.fire, emitter);
      },
      onDidRemoveLastListener() {
        listener?.dispose();
      }
    };
    if (!disposable) {
      _addLeakageTraceLogic(options3);
    }
    const emitter = new Emitter(options3);
    disposable?.add(emitter);
    return emitter.event;
  }
  function addAndReturnDisposable(d, store) {
    if (store instanceof Array) {
      store.push(d);
    } else if (store) {
      store.add(d);
    }
    return d;
  }
  function debounce2(event, merge4, delay = 100, leading = false, flushOnListenerRemove = false, leakWarningThreshold, disposable) {
    let subscription = Disposable.None;
    let output = void 0;
    let handle2 = void 0;
    let numDebouncedCalls = 0;
    let doFire;
    const options3 = {
      leakWarningThreshold,
      onWillAddFirstListener() {
        subscription = event((cur) => {
          numDebouncedCalls++;
          output = merge4(output, cur);
          if (leading && !handle2) {
            emitter.fire(output);
            output = void 0;
          }
          doFire = () => {
            const _output = output;
            output = void 0;
            handle2 = void 0;
            if (!leading || numDebouncedCalls > 1) {
              emitter.fire(_output);
            }
            numDebouncedCalls = 0;
          };
          if (typeof delay === "number") {
            if (handle2) {
              clearTimeout(handle2);
            }
            handle2 = setTimeout(doFire, delay);
          } else {
            if (handle2 === void 0) {
              handle2 = null;
              queueMicrotask(doFire);
            }
          }
        });
      },
      onWillRemoveListener() {
        if (flushOnListenerRemove && numDebouncedCalls > 0) {
          doFire?.();
        }
      },
      onDidRemoveLastListener() {
        doFire = void 0;
        subscription.dispose();
      }
    };
    if (!disposable) {
      _addLeakageTraceLogic(options3);
    }
    const emitter = new Emitter(options3);
    disposable?.add(emitter);
    return emitter.event;
  }
  Event365.debounce = debounce2;
  function accumulate(event, delay = 0, flushOnListenerRemove, disposable) {
    return Event365.debounce(event, (last, e) => {
      if (!last) {
        return [e];
      }
      last.push(e);
      return last;
    }, delay, void 0, flushOnListenerRemove ?? true, void 0, disposable);
  }
  Event365.accumulate = accumulate;
  function throttle2(event, merge4, delay = 100, leading = true, trailing = true, leakWarningThreshold, disposable) {
    let subscription;
    let output = void 0;
    let handle2 = void 0;
    let numThrottledCalls = 0;
    const options3 = {
      leakWarningThreshold,
      onWillAddFirstListener() {
        subscription = event((cur) => {
          numThrottledCalls++;
          output = merge4(output, cur);
          if (handle2 === void 0) {
            if (leading) {
              emitter.fire(output);
              output = void 0;
              numThrottledCalls = 0;
            }
            if (typeof delay === "number") {
              handle2 = setTimeout(() => {
                if (trailing && numThrottledCalls > 0) {
                  emitter.fire(output);
                }
                output = void 0;
                handle2 = void 0;
                numThrottledCalls = 0;
              }, delay);
            } else {
              handle2 = 0;
              queueMicrotask(() => {
                if (trailing && numThrottledCalls > 0) {
                  emitter.fire(output);
                }
                output = void 0;
                handle2 = void 0;
                numThrottledCalls = 0;
              });
            }
          }
        });
      },
      onDidRemoveLastListener() {
        subscription.dispose();
      }
    };
    if (!disposable) {
      _addLeakageTraceLogic(options3);
    }
    const emitter = new Emitter(options3);
    disposable?.add(emitter);
    return emitter.event;
  }
  Event365.throttle = throttle2;
  function latch(event, equals5 = (a, b) => a === b, disposable) {
    let firstCall = true;
    let cache2;
    return filter2(event, (value2) => {
      const shouldEmit = firstCall || !equals5(value2, cache2);
      firstCall = false;
      cache2 = value2;
      return shouldEmit;
    }, disposable);
  }
  Event365.latch = latch;
  function split(event, isT, disposable) {
    return [
      Event365.filter(event, isT, disposable),
      Event365.filter(event, (e) => !isT(e), disposable)
    ];
  }
  Event365.split = split;
  function buffer(event, debugName, flushAfterTimeout = false, _buffer = [], disposable) {
    let buffer2 = _buffer.slice();
    let bufferLeakWarningData;
    if (_isBufferLeakWarningEnabled()) {
      bufferLeakWarningData = {
        stack: Stacktrace.create(),
        timerId: setTimeout(() => {
          if (buffer2 && buffer2.length > 0 && bufferLeakWarningData && !bufferLeakWarningData.warned) {
            bufferLeakWarningData.warned = true;
            console.warn(`[Event.buffer][${debugName}] potential LEAK detected: ${buffer2.length} events buffered for ${_bufferLeakWarnTimeThreshold / 1e3}s without being consumed. Buffered here:`);
            bufferLeakWarningData.stack.print();
          }
        }, _bufferLeakWarnTimeThreshold),
        warned: false
      };
      if (disposable) {
        disposable.add(toDisposable(() => clearTimeout(bufferLeakWarningData.timerId)));
      }
    }
    const clearLeakWarningTimer = () => {
      if (bufferLeakWarningData) {
        clearTimeout(bufferLeakWarningData.timerId);
      }
    };
    let listener = event((e) => {
      if (buffer2) {
        buffer2.push(e);
        if (_isBufferLeakWarningEnabled() && bufferLeakWarningData && !bufferLeakWarningData.warned && buffer2.length >= _bufferLeakWarnCountThreshold) {
          bufferLeakWarningData.warned = true;
          console.warn(`[Event.buffer][${debugName}] potential LEAK detected: ${buffer2.length} events buffered without being consumed. Buffered here:`);
          bufferLeakWarningData.stack.print();
        }
      } else {
        emitter.fire(e);
      }
    });
    if (disposable) {
      disposable.add(listener);
    }
    const flush = () => {
      buffer2?.forEach((e) => emitter.fire(e));
      buffer2 = null;
      clearLeakWarningTimer();
    };
    const emitter = new Emitter({
      onWillAddFirstListener() {
        if (!listener) {
          listener = event((e) => emitter.fire(e));
          if (disposable) {
            disposable.add(listener);
          }
        }
      },
      onDidAddFirstListener() {
        if (buffer2) {
          if (flushAfterTimeout) {
            setTimeout(flush);
          } else {
            flush();
          }
        }
      },
      onDidRemoveLastListener() {
        if (listener) {
          listener.dispose();
        }
        listener = null;
        clearLeakWarningTimer();
      }
    });
    if (disposable) {
      disposable.add(emitter);
    }
    return emitter.event;
  }
  Event365.buffer = buffer;
  function chain(event, sythensize) {
    const fn = (listener, thisArgs, disposables) => {
      const cs = sythensize(new ChainableSynthesis());
      return event(function(value2) {
        const result = cs.evaluate(value2);
        if (result !== HaltChainable) {
          listener.call(thisArgs, result);
        }
      }, void 0, disposables);
    };
    return fn;
  }
  Event365.chain = chain;
  const HaltChainable = /* @__PURE__ */ Symbol("HaltChainable");
  class ChainableSynthesis {
    constructor() {
      this.steps = [];
    }
    map(fn) {
      this.steps.push(fn);
      return this;
    }
    forEach(fn) {
      this.steps.push((v2) => {
        fn(v2);
        return v2;
      });
      return this;
    }
    filter(fn) {
      this.steps.push((v2) => fn(v2) ? v2 : HaltChainable);
      return this;
    }
    reduce(merge4, initial) {
      let last = initial;
      this.steps.push((v2) => {
        last = merge4(last, v2);
        return last;
      });
      return this;
    }
    latch(equals5 = (a, b) => a === b) {
      let firstCall = true;
      let cache2;
      this.steps.push((value2) => {
        const shouldEmit = firstCall || !equals5(value2, cache2);
        firstCall = false;
        cache2 = value2;
        return shouldEmit ? value2 : HaltChainable;
      });
      return this;
    }
    evaluate(value2) {
      for (const step of this.steps) {
        value2 = step(value2);
        if (value2 === HaltChainable) {
          break;
        }
      }
      return value2;
    }
  }
  function fromNodeEventEmitter(emitter, eventName, map2 = (id2) => id2) {
    const fn = (...args2) => result.fire(map2(...args2));
    const onFirstListenerAdd = () => emitter.on(eventName, fn);
    const onLastListenerRemove = () => emitter.removeListener(eventName, fn);
    const result = new Emitter({ onWillAddFirstListener: onFirstListenerAdd, onDidRemoveLastListener: onLastListenerRemove });
    return result.event;
  }
  Event365.fromNodeEventEmitter = fromNodeEventEmitter;
  function fromDOMEventEmitter(emitter, eventName, map2 = (id2) => id2) {
    const fn = (...args2) => result.fire(map2(...args2));
    const onFirstListenerAdd = () => emitter.addEventListener(eventName, fn);
    const onLastListenerRemove = () => emitter.removeEventListener(eventName, fn);
    const result = new Emitter({ onWillAddFirstListener: onFirstListenerAdd, onDidRemoveLastListener: onLastListenerRemove });
    return result.event;
  }
  Event365.fromDOMEventEmitter = fromDOMEventEmitter;
  function toPromise(event, disposables) {
    let cancelRef;
    let listener;
    const promise = new Promise((resolve3) => {
      listener = once(event)(resolve3);
      addToDisposables(listener, disposables);
      cancelRef = () => {
        disposeAndRemove(listener, disposables);
      };
    });
    promise.cancel = cancelRef;
    if (disposables) {
      promise.finally(() => disposeAndRemove(listener, disposables));
    }
    return promise;
  }
  Event365.toPromise = toPromise;
  function forward(from, to) {
    return from((e) => to.fire(e));
  }
  Event365.forward = forward;
  function runAndSubscribe(event, handler, initial) {
    handler(initial);
    return event((e) => handler(e));
  }
  Event365.runAndSubscribe = runAndSubscribe;
  class EmitterObserver {
    constructor(_observable, store) {
      this._observable = _observable;
      this._counter = 0;
      this._hasChanged = false;
      const options3 = {
        onWillAddFirstListener: () => {
          _observable.addObserver(this);
          this._observable.reportChanges();
        },
        onDidRemoveLastListener: () => {
          _observable.removeObserver(this);
        }
      };
      if (!store) {
        _addLeakageTraceLogic(options3);
      }
      this.emitter = new Emitter(options3);
      if (store) {
        store.add(this.emitter);
      }
    }
    beginUpdate(_observable) {
      this._counter++;
    }
    handlePossibleChange(_observable) {
    }
    handleChange(_observable, _change) {
      this._hasChanged = true;
    }
    endUpdate(_observable) {
      this._counter--;
      if (this._counter === 0) {
        this._observable.reportChanges();
        if (this._hasChanged) {
          this._hasChanged = false;
          this.emitter.fire(this._observable.get());
        }
      }
    }
  }
  function fromObservable(obs, store) {
    const observer = new EmitterObserver(obs, store);
    return observer.emitter.event;
  }
  Event365.fromObservable = fromObservable;
  function fromObservableLight(observable) {
    return (listener, thisArgs, disposables) => {
      let count2 = 0;
      let didChange = false;
      const observer = {
        beginUpdate() {
          count2++;
        },
        endUpdate() {
          count2--;
          if (count2 === 0) {
            observable.reportChanges();
            if (didChange) {
              didChange = false;
              listener.call(thisArgs);
            }
          }
        },
        handlePossibleChange() {
        },
        handleChange() {
          didChange = true;
        }
      };
      observable.addObserver(observer);
      observable.reportChanges();
      const disposable = {
        dispose() {
          observable.removeObserver(observer);
        }
      };
      addToDisposables(disposable, disposables);
      return disposable;
    };
  }
  Event365.fromObservableLight = fromObservableLight;
})(Event2 || (Event2 = {}));

var EventProfiling = class _EventProfiling {
  constructor(name) {
    this.listenerCount = 0;
    this.invocationCount = 0;
    this.elapsedOverall = 0;
    this.durations = [];
    this.name = `${name}_${_EventProfiling._idPool++}`;
    _EventProfiling.all.add(this);
  }
  static {
    this.all = /* @__PURE__ */ new Set();
  }
  static {
    this._idPool = 0;
  }
  start(listenerCount) {
    this._stopWatch = new StopWatch();
    this.listenerCount = listenerCount;
  }
  stop() {
    if (this._stopWatch) {
      const elapsed = this._stopWatch.elapsed();
      this.durations.push(elapsed);
      this.elapsedOverall += elapsed;
      this.invocationCount += 1;
      this._stopWatch = void 0;
    }
  }
};

var _globalLeakWarningThreshold = -1;

function setGlobalLeakWarningThreshold(n2) {
  const oldValue = _globalLeakWarningThreshold;
  _globalLeakWarningThreshold = n2;
  return {
    dispose() {
      _globalLeakWarningThreshold = oldValue;
    }
  };
}

var leakageMonitorId = 1;

function nextLeakageMonitorName() {
  return (leakageMonitorId++).toString(16).padStart(3, "0");
}

var LeakageMonitor = class {
  constructor(_errorHandler, threshold, name = nextLeakageMonitorName()) {
    this._errorHandler = _errorHandler;
    this.threshold = threshold;
    this.name = name;
    this._warnCountdown = 0;
  }
  dispose() {
    this._stacks?.clear();
  }
  check(stack, listenerCount) {
    const threshold = this.threshold;
    if (threshold <= 0 || listenerCount < threshold) {
      return void 0;
    }
    if (!this._stacks) {
      this._stacks = /* @__PURE__ */ new Map();
    }
    const stackKey = stack.value;
    const count2 = this._stacks.get(stackKey) || 0;
    this._stacks.set(stackKey, count2 + 1);
    this._warnCountdown -= 1;
    if (this._warnCountdown <= 0) {
      this._warnCountdown = threshold * 0.5;
      const [topStack, topCount] = this.getMostFrequentStack();
      const emitterName = /^[0-9a-f]+$/i.test(this.name) ? void 0 : this.name;
      const message = `[${this.name}] potential listener LEAK detected, having ${listenerCount} listeners already. MOST frequent listener (${topCount}):`;
      console.warn(message);
      console.warn(topStack);
      const kind = topCount / listenerCount > 0.3 ? "dominated" : "popular";
      const error = new ListenerLeakError(kind, message, topStack, listenerCount, emitterName);
      this._errorHandler(error);
    }
    return () => {
      const count3 = this._stacks.get(stackKey) || 0;
      if (count3 <= 1) {
        this._stacks.delete(stackKey);
      } else {
        this._stacks.set(stackKey, count3 - 1);
      }
    };
  }
  getMostFrequentStack() {
    if (!this._stacks) {
      return void 0;
    }
    let topStack;
    let topCount = 0;
    for (const [stack, count2] of this._stacks) {
      if (!topStack || topCount < count2) {
        topStack = [stack, count2];
        topCount = count2;
      }
    }
    return topStack;
  }
};

var Stacktrace = class _Stacktrace {
  constructor(value2) {
    this.value = value2;
  }
  static create() {
    const err = new Error();
    return new _Stacktrace(err.stack ?? "");
  }
  print() {
    console.warn(this.value.split("\n").slice(2).join("\n"));
  }
};

var ListenerLeakError = class _ListenerLeakError extends Error {
  constructor(kind, details, stack, listenerCount, emitterName) {
    super(emitterName ? `[${emitterName}] potential listener LEAK detected, ${kind}` : `potential listener LEAK detected, ${kind}`);
    this.name = "ListenerLeakError";
    this.kind = kind;
    this.listenerCount = listenerCount;
    this.details = details;
    this.stack = stack;
  }
  static is(err) {
    return err instanceof _ListenerLeakError || err instanceof Error && typeof err.kind === "string" && typeof err.listenerCount === "number";
  }
};

var ListenerRefusalError = class extends ListenerLeakError {
  constructor(kind, details, stack, listenerCount, emitterName) {
    super(kind, details, stack, listenerCount, emitterName);
    this.name = "ListenerRefusalError";
  }
};

var id = 0;

var UniqueContainer = class {
  constructor(value2) {
    this.value = value2;
    this.id = id++;
  }
};

var compactionThreshold = 2;

var forEachListener = (listeners, fn) => {
  if (listeners instanceof UniqueContainer) {
    fn(listeners);
  } else {
    for (let i2 = 0; i2 < listeners.length; i2++) {
      const l = listeners[i2];
      if (l) {
        fn(l);
      }
    }
  }
};

var Emitter = class {
  constructor(options3) {
    this._size = 0;
    this._options = options3;
    if (_globalLeakWarningThreshold > 0 || this._options?.leakWarningThreshold) {
      this._leakWarningThreshold = this._options?.leakWarningThreshold ?? _globalLeakWarningThreshold;
      this._leakWarningName = this._options?.leakWarningName ?? nextLeakageMonitorName();
      this._leakWarningErrorHandler = this._options?.onListenerError ?? onUnexpectedError;
    }
    this._perfMon = this._options?._profName ? new EventProfiling(this._options._profName) : void 0;
    this._deliveryQueue = this._options?.deliveryQueue;
  }
  _getLeakageMonitor() {
    if (this._leakWarningThreshold === void 0 || this._leakWarningName === void 0 || this._leakWarningErrorHandler === void 0) {
      return void 0;
    }
    return this._leakageMon ??= new LeakageMonitor(this._leakWarningErrorHandler, this._leakWarningThreshold, this._leakWarningName);
  }
  dispose() {
    if (!this._disposed) {
      this._disposed = true;
      if (this._deliveryQueue?.current === this) {
        this._deliveryQueue.reset();
      }
      if (this._listeners) {
        if (_enableDisposeWithListenerWarning) {
          const listeners = this._listeners;
          queueMicrotask(() => {
            forEachListener(listeners, (l) => l.stack?.print());
          });
        }
        this._listeners = void 0;
        this._size = 0;
      }
      this._options?.onDidRemoveLastListener?.();
      this._leakageMon?.dispose();
    }
  }
  /**
   * For the public to allow to subscribe
   * to events from this Emitter
   */
  get event() {
    this._event ??= (callback, thisArgs, disposables) => {
      if (this._leakWarningThreshold !== void 0 && this._size > this._leakWarningThreshold ** 2) {
        const leakageMon = this._getLeakageMonitor();
        if (leakageMon) {
          const message = `[${leakageMon.name}] REFUSES to accept new listeners because it exceeded its threshold by far (${this._size} vs ${leakageMon.threshold})`;
          console.warn(message);
          const tuple = leakageMon.getMostFrequentStack() ?? ["UNKNOWN stack", -1];
          const kind = tuple[1] / this._size > 0.3 ? "dominated" : "popular";
          const error = new ListenerRefusalError(kind, `${message}. HINT: Stack shows most frequent listener (${tuple[1]}-times)`, tuple[0], this._size, this._options?.leakWarningName);
          const errorHandler2 = this._options?.onListenerError || onUnexpectedError;
          errorHandler2(error);
          return Disposable.None;
        }
      }
      if (this._disposed) {
        return Disposable.None;
      }
      if (thisArgs) {
        callback = callback.bind(thisArgs);
      }
      const contained = new UniqueContainer(callback);
      let removeMonitor;
      let stack;
      if (this._leakWarningThreshold !== void 0 && this._size >= Math.ceil(this._leakWarningThreshold * 0.2)) {
        const leakageMon = this._getLeakageMonitor();
        if (leakageMon) {
          contained.stack = Stacktrace.create();
          removeMonitor = leakageMon.check(contained.stack, this._size + 1);
        }
      }
      if (_enableDisposeWithListenerWarning) {
        contained.stack = stack ?? Stacktrace.create();
      }
      if (!this._listeners) {
        this._options?.onWillAddFirstListener?.(this);
        this._listeners = contained;
        this._options?.onDidAddFirstListener?.(this);
      } else if (this._listeners instanceof UniqueContainer) {
        this._deliveryQueue ??= new EventDeliveryQueuePrivate();
        this._listeners = [this._listeners, contained];
      } else {
        this._listeners.push(contained);
      }
      this._options?.onDidAddListener?.(this);
      this._size++;
      const result = toDisposable(() => {
        removeMonitor?.();
        this._removeListener(contained);
      });
      addToDisposables(result, disposables);
      return result;
    };
    return this._event;
  }
  _removeListener(listener) {
    this._options?.onWillRemoveListener?.(this);
    if (!this._listeners) {
      return;
    }
    if (this._size === 1) {
      this._listeners = void 0;
      this._options?.onDidRemoveLastListener?.(this);
      this._size = 0;
      return;
    }
    const listeners = this._listeners;
    const index2 = listeners.indexOf(listener);
    if (index2 === -1) {
      console.log("disposed?", this._disposed);
      console.log("size?", this._size);
      console.log("arr?", JSON.stringify(this._listeners));
      throw new Error("Attempted to dispose unknown listener");
    }
    this._size--;
    listeners[index2] = void 0;
    const adjustDeliveryQueue = this._deliveryQueue.current === this;
    if (this._size * compactionThreshold <= listeners.length) {
      let n2 = 0;
      for (let i2 = 0; i2 < listeners.length; i2++) {
        if (listeners[i2]) {
          listeners[n2++] = listeners[i2];
        } else if (adjustDeliveryQueue && n2 < this._deliveryQueue.end) {
          this._deliveryQueue.end--;
          if (n2 < this._deliveryQueue.i) {
            this._deliveryQueue.i--;
          }
        }
      }
      listeners.length = n2;
    }
  }
  _deliver(listener, value2) {
    if (!listener) {
      return;
    }
    const errorHandler2 = this._options?.onListenerError || onUnexpectedError;
    if (!errorHandler2) {
      listener.value(value2);
      return;
    }
    try {
      listener.value(value2);
    } catch (e) {
      errorHandler2(e);
    }
  }
  /** Delivers items in the queue. Assumes the queue is ready to go. */
  _deliverQueue(dq) {
    const listeners = dq.current._listeners;
    while (dq.i < dq.end) {
      this._deliver(listeners[dq.i++], dq.value);
    }
    dq.reset();
  }
  /**
   * To be kept private to fire an event to
   * subscribers
   */
  fire(event) {
    if (this._deliveryQueue?.current) {
      this._deliverQueue(this._deliveryQueue);
      this._perfMon?.stop();
    }
    this._perfMon?.start(this._size);
    if (!this._listeners) {
    } else if (this._listeners instanceof UniqueContainer) {
      this._deliver(this._listeners, event);
    } else {
      const dq = this._deliveryQueue;
      dq.enqueue(this, event, this._listeners.length);
      this._deliverQueue(dq);
    }
    this._perfMon?.stop();
  }
  hasListeners() {
    return this._size > 0;
  }
};

var createEventDeliveryQueue = () => new EventDeliveryQueuePrivate();

var EventDeliveryQueuePrivate = class {
  constructor() {
    /**
     * Index in current's listener list.
     */
    this.i = -1;
    /**
     * The last index in the listener's list to deliver.
     */
    this.end = 0;
  }
  enqueue(emitter, value2, end) {
    this.i = 0;
    this.end = end;
    this.current = emitter;
    this.value = value2;
  }
  reset() {
    this.i = this.end;
    this.current = void 0;
    this.value = void 0;
  }
};

var AsyncEmitter = class extends Emitter {
  async fireAsync(data, token, promiseJoin) {
    if (!this._listeners) {
      return;
    }
    if (!this._asyncDeliveryQueue) {
      this._asyncDeliveryQueue = new LinkedList();
    }
    forEachListener(this._listeners, (listener) => this._asyncDeliveryQueue.push([listener.value, data]));
    while (this._asyncDeliveryQueue.size > 0 && !token.isCancellationRequested) {
      const [listener, data2] = this._asyncDeliveryQueue.shift();
      const thenables = [];
      const event = {
        ...data2,
        token,
        waitUntil: (p) => {
          if (Object.isFrozen(thenables)) {
            throw new Error("waitUntil can NOT be called asynchronous");
          }
          if (promiseJoin) {
            p = promiseJoin(p, listener);
          }
          thenables.push(p);
        }
      };
      try {
        listener(event);
      } catch (e) {
        onUnexpectedError(e);
        continue;
      }
      Object.freeze(thenables);
      await Promise.allSettled(thenables).then((values) => {
        for (const value2 of values) {
          if (value2.status === "rejected") {
            onUnexpectedError(value2.reason);
          }
        }
      });
    }
  }
};

var PauseableEmitter = class extends Emitter {
  constructor(options3) {
    super(options3);
    this._isPaused = 0;
    this._eventQueue = new LinkedList();
    this._mergeFn = options3?.merge;
  }
  get isPaused() {
    return this._isPaused !== 0;
  }
  pause() {
    this._isPaused++;
  }
  resume() {
    if (this._isPaused !== 0 && --this._isPaused === 0) {
      if (this._mergeFn) {
        if (this._eventQueue.size > 0) {
          const events = Array.from(this._eventQueue);
          this._eventQueue.clear();
          super.fire(this._mergeFn(events));
        }
      } else {
        while (!this._isPaused && this._eventQueue.size !== 0) {
          super.fire(this._eventQueue.shift());
        }
      }
    }
  }
  fire(event) {
    if (this._size) {
      if (this._isPaused !== 0) {
        this._eventQueue.push(event);
      } else {
        super.fire(event);
      }
    }
  }
};

var DebounceEmitter = class extends PauseableEmitter {
  constructor(options3) {
    super(options3);
    this._delay = options3.delay ?? 100;
  }
  fire(event) {
    if (!this._handle) {
      this.pause();
      this._handle = setTimeout(() => {
        this._handle = void 0;
        this.resume();
      }, this._delay);
    }
    super.fire(event);
  }
};

var MicrotaskEmitter = class extends Emitter {
  constructor(options3) {
    super(options3);
    this._queuedEvents = [];
    this._mergeFn = options3?.merge;
  }
  fire(event) {
    if (!this.hasListeners()) {
      return;
    }
    this._queuedEvents.push(event);
    if (this._queuedEvents.length === 1) {
      queueMicrotask(() => {
        if (this._mergeFn) {
          super.fire(this._mergeFn(this._queuedEvents));
        } else {
          this._queuedEvents.forEach((e) => super.fire(e));
        }
        this._queuedEvents = [];
      });
    }
  }
};

var EventMultiplexer = class {
  constructor() {
    this.hasListeners = false;
    this.events = [];
    this.emitter = new Emitter({
      onWillAddFirstListener: () => this.onFirstListenerAdd(),
      onDidRemoveLastListener: () => this.onLastListenerRemove()
    });
  }
  get event() {
    return this.emitter.event;
  }
  add(event) {
    const e = { event, listener: null };
    this.events.push(e);
    if (this.hasListeners) {
      this.hook(e);
    }
    const dispose2 = () => {
      if (this.hasListeners) {
        this.unhook(e);
      }
      const idx = this.events.indexOf(e);
      this.events.splice(idx, 1);
    };
    return toDisposable(createSingleCallFunction(dispose2));
  }
  onFirstListenerAdd() {
    this.hasListeners = true;
    this.events.forEach((e) => this.hook(e));
  }
  onLastListenerRemove() {
    this.hasListeners = false;
    this.events.forEach((e) => this.unhook(e));
  }
  hook(e) {
    e.listener = e.event((r2) => this.emitter.fire(r2));
  }
  unhook(e) {
    e.listener?.dispose();
    e.listener = null;
  }
  dispose() {
    this.emitter.dispose();
    for (const e of this.events) {
      e.listener?.dispose();
    }
    this.events = [];
  }
};

var DynamicListEventMultiplexer = class {
  constructor(items, onAddItem, onRemoveItem, getEvent) {
    this._store = new DisposableStore();
    const multiplexer = this._store.add(new EventMultiplexer());
    const itemListeners = this._store.add(new DisposableMap());
    function addItem(instance2) {
      itemListeners.set(instance2, multiplexer.add(getEvent(instance2)));
    }
    for (const instance2 of items) {
      addItem(instance2);
    }
    this._store.add(onAddItem((instance2) => {
      addItem(instance2);
    }));
    this._store.add(onRemoveItem((instance2) => {
      itemListeners.deleteAndDispose(instance2);
    }));
    this.event = multiplexer.event;
  }
  dispose() {
    this._store.dispose();
  }
};

var EventBufferer = class {
  constructor() {
    this.data = [];
  }
  wrapEvent(event, reduce, initial) {
    return (listener, thisArgs, disposables) => {
      return event((i2) => {
        const data = this.data[this.data.length - 1];
        if (!reduce) {
          if (data) {
            data.buffers.push(() => listener.call(thisArgs, i2));
          } else {
            listener.call(thisArgs, i2);
          }
          return;
        }
        const reduceData = data;
        if (!reduceData) {
          listener.call(thisArgs, reduce(initial, i2));
          return;
        }
        reduceData.items ??= [];
        reduceData.items.push(i2);
        if (reduceData.buffers.length === 0) {
          data.buffers.push(() => {
            reduceData.reducedResult ??= initial ? reduceData.items.reduce(reduce, initial) : reduceData.items.reduce(reduce);
            listener.call(thisArgs, reduceData.reducedResult);
          });
        }
      }, void 0, disposables);
    };
  }
  bufferEvents(fn) {
    const data = { buffers: new Array() };
    this.data.push(data);
    const r2 = fn();
    this.data.pop();
    data.buffers.forEach((flush) => flush());
    return r2;
  }
};

var Relay = class {
  constructor() {
    this.listening = false;
    this.inputEvent = Event2.None;
    this.inputEventListener = Disposable.None;
    this.emitter = new Emitter({
      onDidAddFirstListener: () => {
        this.listening = true;
        this.inputEventListener = this.inputEvent(this.emitter.fire, this.emitter);
      },
      onDidRemoveLastListener: () => {
        this.listening = false;
        this.inputEventListener.dispose();
      }
    });
    this.event = this.emitter.event;
  }
  set input(event) {
    this.inputEvent = event;
    if (this.listening) {
      this.inputEventListener.dispose();
      this.inputEventListener = event(this.emitter.fire, this.emitter);
    }
  }
  dispose() {
    this.inputEventListener.dispose();
    this.emitter.dispose();
  }
};

var ValueWithChangeEvent = class {
  constructor(_value) {
    this._value = _value;
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
  }
  static const(value2) {
    return new ConstValueWithChangeEvent(value2);
  }
  get value() {
    return this._value;
  }
  set value(value2) {
    if (value2 !== this._value) {
      this._value = value2;
      this._onDidChange.fire(void 0);
    }
  }
};

var ConstValueWithChangeEvent = class {
  constructor(value2) {
    this.value = value2;
    this.onDidChange = Event2.None;
  }
};

function trackSetChanges(getData, onDidChangeData, handleItem) {
  const map = new DisposableMap();
  let oldData = new Set(getData());
  for (const d of oldData) {
    map.set(d, handleItem(d));
  }
  const store = new DisposableStore();
  store.add(onDidChangeData(() => {
    const newData = getData();
    const diff4 = diffSets(oldData, newData);
    for (const r2 of diff4.removed) {
      map.deleteAndDispose(r2);
    }
    for (const a of diff4.added) {
      map.set(a, handleItem(a));
    }
    oldData = new Set(newData);
  }));
  store.add(map);
  return store;
}

function addToDisposables(result, disposables) {
  if (disposables instanceof DisposableStore) {
    disposables.add(result);
  } else if (Array.isArray(disposables)) {
    disposables.push(result);
  }
}

function disposeAndRemove(result, disposables) {
  if (disposables instanceof DisposableStore) {
    disposables.delete(result);
  } else if (Array.isArray(disposables)) {
    const index2 = disposables.indexOf(result);
    if (index2 !== -1) {
      disposables.splice(index2, 1);
    }
  }
  result.dispose();
}
export { _isBufferLeakWarningEnabled, setGlobalLeakWarningThreshold, nextLeakageMonitorName, trackSetChanges, addToDisposables, disposeAndRemove, _enableDisposeWithListenerWarning, _enableSnapshotPotentialLeakWarning, _bufferLeakWarnCountThreshold, _bufferLeakWarnTimeThreshold, Event2, EventProfiling, _globalLeakWarningThreshold, leakageMonitorId, LeakageMonitor, Stacktrace, ListenerLeakError, ListenerRefusalError, id, UniqueContainer, compactionThreshold, forEachListener, Emitter, createEventDeliveryQueue, EventDeliveryQueuePrivate, AsyncEmitter, PauseableEmitter, DebounceEmitter, MicrotaskEmitter, EventMultiplexer, DynamicListEventMultiplexer, EventBufferer, Relay, ValueWithChangeEvent, ConstValueWithChangeEvent };
