// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/base/common/observableInternal/logging/debugger/devToolsLogger.ts
import { registerDebugChannel } from "./module-0070.mjs";
import { isDefined } from "./module-0010.mjs";
import { Derived } from "./module-0053.mjs";
import { ObservableValue } from "./module-0048.mjs";
import { FromEventObservable } from "./module-0057.mjs";
import { BugIndicatingError, onUnexpectedError } from "./module-0004.mjs";
import { formatValue } from "./module-0068.mjs";
import { AutorunObserver } from "./module-0051.mjs";
import { Throttler2, deepAssign, deepAssignDeleteNulls } from "./module-0071.mjs";
import { DebugLocation } from "./module-0046.mjs";


// src/vs/base/common/observableInternal/logging/debugger/devToolsLogger.ts
var DevToolsLogger = class _DevToolsLogger {
  constructor() {
    this._declarationId = 0;
    this._instanceId = 0;
    this._declarations = /* @__PURE__ */ new Map();
    this._instanceInfos = /* @__PURE__ */ new WeakMap();
    this._aliveInstances = /* @__PURE__ */ new Map();
    this._activeTransactions = /* @__PURE__ */ new Set();
    this._channel = registerDebugChannel("observableDevTools", () => {
      return {
        notifications: {
          setDeclarationIdFilter: (declarationIds) => {
          },
          logObservableValue: (observableId) => {
            console.log("logObservableValue", observableId);
          },
          flushUpdates: () => {
            this._flushUpdates();
          },
          resetUpdates: () => {
            this._pendingChanges = null;
            this._channel.api.notifications.handleChange(this._fullState, true);
          }
        },
        requests: {
          getDeclarations: () => {
            const result = {};
            for (const decl of this._declarations.values()) {
              result[decl.id] = decl;
            }
            return { decls: result };
          },
          getSummarizedInstances: () => {
            return null;
          },
          getObservableValueInfo: (instanceId) => {
            const obs = this._aliveInstances.get(instanceId);
            return {
              observers: [...obs.debugGetObservers()].map((d) => this._formatObserver(d)).filter(isDefined)
            };
          },
          getDerivedInfo: (instanceId) => {
            const d = this._aliveInstances.get(instanceId);
            return {
              dependencies: [...d.debugGetState().dependencies].map((d2) => this._formatObservable(d2)).filter(isDefined),
              observers: [...d.debugGetObservers()].map((d2) => this._formatObserver(d2)).filter(isDefined)
            };
          },
          getAutorunInfo: (instanceId) => {
            const obs = this._aliveInstances.get(instanceId);
            return {
              dependencies: [...obs.debugGetState().dependencies].map((d) => this._formatObservable(d)).filter(isDefined)
            };
          },
          getTransactionState: () => {
            return this.getTransactionState();
          },
          setValue: (instanceId, jsonValue) => {
            const obs = this._aliveInstances.get(instanceId);
            if (obs instanceof Derived) {
              obs.debugSetValue(jsonValue);
            } else if (obs instanceof ObservableValue) {
              obs.debugSetValue(jsonValue);
            } else if (obs instanceof FromEventObservable) {
              obs.debugSetValue(jsonValue);
            } else {
              throw new BugIndicatingError("Observable is not supported");
            }
            const observers = [...obs.debugGetObservers()];
            for (const d of observers) {
              d.beginUpdate(obs);
            }
            for (const d of observers) {
              d.handleChange(obs, void 0);
            }
            for (const d of observers) {
              d.endUpdate(obs);
            }
          },
          getValue: (instanceId) => {
            const obs = this._aliveInstances.get(instanceId);
            if (obs instanceof Derived) {
              return formatValue(obs.debugGetState().value, 200);
            } else if (obs instanceof ObservableValue) {
              return formatValue(obs.debugGetState().value, 200);
            }
            return void 0;
          },
          logValue: (instanceId) => {
            const obs = this._aliveInstances.get(instanceId);
            if (obs && "get" in obs) {
              console.log("Logged Value:", obs.get());
            } else {
              throw new BugIndicatingError("Observable is not supported");
            }
          },
          rerun: (instanceId) => {
            const obs = this._aliveInstances.get(instanceId);
            if (obs instanceof Derived) {
              obs.debugRecompute();
            } else if (obs instanceof AutorunObserver) {
              obs.debugRerun();
            } else {
              throw new BugIndicatingError("Observable is not supported");
            }
          }
        }
      };
    });
    this._pendingChanges = null;
    this._changeThrottler = new Throttler2();
    this._fullState = {};
    this._flushUpdates = () => {
      if (this._pendingChanges !== null) {
        this._channel.api.notifications.handleChange(this._pendingChanges, false);
        this._pendingChanges = null;
      }
    };
    DebugLocation.enable();
  }
  static {
    this._instance = void 0;
  }
  static getInstance() {
    if (_DevToolsLogger._instance === void 0) {
      _DevToolsLogger._instance = new _DevToolsLogger();
    }
    return _DevToolsLogger._instance;
  }
  getTransactionState() {
    const affected = [];
    const txs = [...this._activeTransactions];
    if (txs.length === 0) {
      return void 0;
    }
    const observerQueue = txs.flatMap((t2) => t2.debugGetUpdatingObservers() ?? []).map((o) => o.observer);
    const processedObservers = /* @__PURE__ */ new Set();
    while (observerQueue.length > 0) {
      const observer = observerQueue.shift();
      if (processedObservers.has(observer)) {
        continue;
      }
      processedObservers.add(observer);
      const state = this._getInfo(observer, (d) => {
        if (!processedObservers.has(d)) {
          observerQueue.push(d);
        }
      });
      if (state) {
        affected.push(state);
      }
    }
    return { names: txs.map((t2) => t2.getDebugName() ?? "tx"), affected };
  }
  _getObservableInfo(observable) {
    const info = this._instanceInfos.get(observable);
    if (!info) {
      onUnexpectedError(new BugIndicatingError("No info found"));
      return void 0;
    }
    return info;
  }
  _getAutorunInfo(autorun2) {
    const info = this._instanceInfos.get(autorun2);
    if (!info) {
      onUnexpectedError(new BugIndicatingError("No info found"));
      return void 0;
    }
    return info;
  }
  _getInfo(observer, queue) {
    if (observer instanceof Derived) {
      const observersToUpdate = [...observer.debugGetObservers()];
      for (const o of observersToUpdate) {
        queue(o);
      }
      const info = this._getObservableInfo(observer);
      if (!info) {
        return;
      }
      const observerState = observer.debugGetState();
      const base = { name: observer.debugName, instanceId: info.instanceId, updateCount: observerState.updateCount };
      const changedDependencies = [...info.changedObservables].map((o) => this._instanceInfos.get(o)?.instanceId).filter(isDefined);
      if (observerState.isComputing) {
        return { ...base, type: "observable/derived", state: "updating", changedDependencies, initialComputation: false };
      }
      switch (observerState.state) {
        case 0 /* initial */:
          return { ...base, type: "observable/derived", state: "noValue" };
        case 3 /* upToDate */:
          return { ...base, type: "observable/derived", state: "upToDate" };
        case 2 /* stale */:
          return { ...base, type: "observable/derived", state: "stale", changedDependencies };
        case 1 /* dependenciesMightHaveChanged */:
          return { ...base, type: "observable/derived", state: "possiblyStale" };
      }
    } else if (observer instanceof AutorunObserver) {
      const info = this._getAutorunInfo(observer);
      if (!info) {
        return void 0;
      }
      const base = { name: observer.debugName, instanceId: info.instanceId, updateCount: info.updateCount };
      const changedDependencies = [...info.changedObservables].map((o) => this._instanceInfos.get(o).instanceId);
      if (observer.debugGetState().isRunning) {
        return { ...base, type: "autorun", state: "updating", changedDependencies };
      }
      switch (observer.debugGetState().state) {
        case 3 /* upToDate */:
          return { ...base, type: "autorun", state: "upToDate" };
        case 2 /* stale */:
          return { ...base, type: "autorun", state: "stale", changedDependencies };
        case 1 /* dependenciesMightHaveChanged */:
          return { ...base, type: "autorun", state: "possiblyStale" };
      }
    }
    return void 0;
  }
  _formatObservable(obs) {
    const info = this._getObservableInfo(obs);
    if (!info) {
      return void 0;
    }
    return { name: obs.debugName, instanceId: info.instanceId };
  }
  _formatObserver(obs) {
    if (obs instanceof Derived) {
      return { name: obs.toString(), instanceId: this._getObservableInfo(obs)?.instanceId };
    }
    const autorunInfo = this._getAutorunInfo(obs);
    if (autorunInfo) {
      return { name: obs.toString(), instanceId: autorunInfo.instanceId };
    }
    return void 0;
  }
  _handleChange(update) {
    deepAssignDeleteNulls(this._fullState, update);
    if (this._pendingChanges === null) {
      this._pendingChanges = update;
    } else {
      deepAssign(this._pendingChanges, update);
    }
    this._changeThrottler.throttle(this._flushUpdates, 10);
  }
  _getDeclarationId(type, location2) {
    if (!location2) {
      return -1;
    }
    let decInfo = this._declarations.get(location2.id);
    if (decInfo === void 0) {
      decInfo = {
        id: this._declarationId++,
        type,
        url: location2.fileName,
        line: location2.line,
        column: location2.column
      };
      this._declarations.set(location2.id, decInfo);
      this._handleChange({ decls: { [decInfo.id]: decInfo } });
    }
    return decInfo.id;
  }
  handleObservableCreated(observable, location2) {
    const declarationId = this._getDeclarationId("observable/value", location2);
    const info = {
      declarationId,
      instanceId: this._instanceId++,
      listenerCount: 0,
      lastValue: void 0,
      updateCount: 0,
      changedObservables: /* @__PURE__ */ new Set()
    };
    this._instanceInfos.set(observable, info);
  }
  handleOnListenerCountChanged(observable, newCount) {
    const info = this._getObservableInfo(observable);
    if (!info) {
      return;
    }
    if (info.listenerCount === 0 && newCount > 0) {
      const type = observable instanceof Derived ? "observable/derived" : "observable/value";
      this._aliveInstances.set(info.instanceId, observable);
      this._handleChange({
        instances: {
          [info.instanceId]: {
            instanceId: info.instanceId,
            declarationId: info.declarationId,
            formattedValue: info.lastValue,
            type,
            name: observable.debugName
          }
        }
      });
    } else if (info.listenerCount > 0 && newCount === 0) {
      this._handleChange({
        instances: { [info.instanceId]: null }
      });
      this._aliveInstances.delete(info.instanceId);
    }
    info.listenerCount = newCount;
  }
  handleObservableUpdated(observable, changeInfo) {
    if (observable instanceof Derived) {
      this._handleDerivedRecomputed(observable, changeInfo);
      return;
    }
    const info = this._getObservableInfo(observable);
    if (info) {
      if (changeInfo.didChange) {
        info.lastValue = formatValue(changeInfo.newValue, 30);
        if (info.listenerCount > 0) {
          this._handleChange({
            instances: { [info.instanceId]: { formattedValue: info.lastValue } }
          });
        }
      }
    }
  }
  handleAutorunCreated(autorun2, location2) {
    const declarationId = this._getDeclarationId("autorun", location2);
    const info = {
      declarationId,
      instanceId: this._instanceId++,
      updateCount: 0,
      changedObservables: /* @__PURE__ */ new Set()
    };
    this._instanceInfos.set(autorun2, info);
    this._aliveInstances.set(info.instanceId, autorun2);
    if (info) {
      this._handleChange({
        instances: {
          [info.instanceId]: {
            instanceId: info.instanceId,
            declarationId: info.declarationId,
            runCount: 0,
            type: "autorun",
            name: autorun2.debugName
          }
        }
      });
    }
  }
  handleAutorunDisposed(autorun2) {
    const info = this._getAutorunInfo(autorun2);
    if (!info) {
      return;
    }
    this._handleChange({
      instances: { [info.instanceId]: null }
    });
    this._instanceInfos.delete(autorun2);
    this._aliveInstances.delete(info.instanceId);
  }
  handleAutorunDependencyChanged(autorun2, observable, change) {
    const info = this._getAutorunInfo(autorun2);
    if (!info) {
      return;
    }
    info.changedObservables.add(observable);
  }
  handleAutorunStarted(autorun2) {
  }
  handleAutorunFinished(autorun2) {
    const info = this._getAutorunInfo(autorun2);
    if (!info) {
      return;
    }
    info.changedObservables.clear();
    info.updateCount++;
    this._handleChange({
      instances: { [info.instanceId]: { runCount: info.updateCount } }
    });
  }
  handleDerivedDependencyChanged(derived2, observable, change) {
    const info = this._getObservableInfo(derived2);
    if (info) {
      info.changedObservables.add(observable);
    }
  }
  _handleDerivedRecomputed(observable, changeInfo) {
    const info = this._getObservableInfo(observable);
    if (!info) {
      return;
    }
    const formattedValue = formatValue(changeInfo.newValue, 30);
    info.updateCount++;
    info.changedObservables.clear();
    info.lastValue = formattedValue;
    if (info.listenerCount > 0) {
      this._handleChange({
        instances: { [info.instanceId]: { formattedValue, recomputationCount: info.updateCount } }
      });
    }
  }
  handleDerivedCleared(observable) {
    const info = this._getObservableInfo(observable);
    if (!info) {
      return;
    }
    info.lastValue = void 0;
    info.changedObservables.clear();
    if (info.listenerCount > 0) {
      this._handleChange({
        instances: {
          [info.instanceId]: {
            formattedValue: void 0
          }
        }
      });
    }
  }
  handleBeginTransaction(transaction2) {
    this._activeTransactions.add(transaction2);
  }
  handleEndTransaction(transaction2) {
    this._activeTransactions.delete(transaction2);
  }
};
export { DevToolsLogger };
