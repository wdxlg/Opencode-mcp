// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/agentHostMain.js
// Original module marker: src/vs/platform/instantiation/common/instantiationService.ts
import { ServiceCollection } from "./module-0441.mjs";
import { IInstantiationService, _util } from "./module-0044.mjs";
import { Graph } from "./module-0440.mjs";
import { dispose, isDisposable, toDisposable } from "./module-0010.mjs";
import { illegalState } from "./module-0002.mjs";
import { SyncDescriptor } from "./module-0299.mjs";
import { GlobalIdleValue } from "./module-0027.mjs";
import { LinkedList } from "./module-0011.mjs";


// src/vs/platform/instantiation/common/instantiationService.ts
var _enableAllTracing = false;

var CyclicDependencyError = class extends Error {
  constructor(graph) {
    super("cyclic dependency between services");
    this.message = graph.findCycleSlow() ?? `UNABLE to detect cycle, dumping graph: 
${graph.toString()}`;
  }
};

var InstantiationService = class _InstantiationService {
  constructor(_services = new ServiceCollection(), _strict = false, _parent, _enableTracing = _enableAllTracing) {
    this._services = _services;
    this._strict = _strict;
    this._parent = _parent;
    this._enableTracing = _enableTracing;
    this._isDisposed = false;
    this._servicesToMaybeDispose = /* @__PURE__ */ new Set();
    this._children = /* @__PURE__ */ new Set();
    this._activeInstantiations = /* @__PURE__ */ new Set();
    this._services.set(IInstantiationService, this);
    this._globalGraph = _enableTracing ? _parent?._globalGraph ?? new Graph((e) => e) : void 0;
  }
  dispose() {
    if (!this._isDisposed) {
      this._isDisposed = true;
      dispose(this._children);
      this._children.clear();
      for (const candidate of this._servicesToMaybeDispose) {
        if (isDisposable(candidate)) {
          candidate.dispose();
        }
      }
      this._servicesToMaybeDispose.clear();
    }
  }
  _throwIfDisposed() {
    if (this._isDisposed) {
      throw new Error("InstantiationService has been disposed");
    }
  }
  createChild(services, store) {
    this._throwIfDisposed();
    const that = this;
    const result = new class extends _InstantiationService {
      dispose() {
        that._children.delete(result);
        super.dispose();
      }
    }(services, this._strict, this, this._enableTracing);
    this._children.add(result);
    store?.add(result);
    return result;
  }
  invokeFunction(fn, ...args) {
    this._throwIfDisposed();
    const _trace = Trace.traceInvocation(this._enableTracing, fn);
    let _done = false;
    try {
      const accessor = {
        get: (id2) => {
          if (_done) {
            throw illegalState("service accessor is only valid during the invocation of its target method");
          }
          const result = this._getOrCreateServiceInstance(id2, _trace);
          if (!result) {
            this._throwIfStrict(`[invokeFunction] unknown service '${id2}'`, false);
          }
          return result;
        }
      };
      return fn(accessor, ...args);
    } finally {
      _done = true;
      _trace.stop();
    }
  }
  createInstance(ctorOrDescriptor, ...rest) {
    this._throwIfDisposed();
    let _trace;
    let result;
    if (ctorOrDescriptor instanceof SyncDescriptor) {
      _trace = Trace.traceCreation(this._enableTracing, ctorOrDescriptor.ctor);
      result = this._createInstance(ctorOrDescriptor.ctor, ctorOrDescriptor.staticArguments.concat(rest), _trace);
    } else {
      _trace = Trace.traceCreation(this._enableTracing, ctorOrDescriptor);
      result = this._createInstance(ctorOrDescriptor, rest, _trace);
    }
    _trace.stop();
    return result;
  }
  _createInstance(ctor, args = [], _trace) {
    const serviceDependencies = _util.getServiceDependencies(ctor).sort((a, b) => a.index - b.index);
    const serviceArgs = [];
    for (const dependency of serviceDependencies) {
      const service = this._getOrCreateServiceInstance(dependency.id, _trace);
      if (!service) {
        this._throwIfStrict(`[createInstance] ${ctor.name} depends on UNKNOWN service ${dependency.id}.`, false);
      }
      serviceArgs.push(service);
    }
    const firstServiceArgPos = serviceDependencies.length > 0 ? serviceDependencies[0].index : args.length;
    if (args.length !== firstServiceArgPos) {
      console.trace(`[createInstance] First service dependency of ${ctor.name} at position ${firstServiceArgPos + 1} conflicts with ${args.length} static arguments`);
      const delta = firstServiceArgPos - args.length;
      if (delta > 0) {
        args = args.concat(new Array(delta));
      } else {
        args = args.slice(0, firstServiceArgPos);
      }
    }
    return Reflect.construct(ctor, args.concat(serviceArgs));
  }
  _setCreatedServiceInstance(id2, instance) {
    if (this._services.get(id2) instanceof SyncDescriptor) {
      this._services.set(id2, instance);
    } else if (this._parent) {
      this._parent._setCreatedServiceInstance(id2, instance);
    } else {
      throw new Error("illegalState - setting UNKNOWN service instance");
    }
  }
  _getServiceInstanceOrDescriptor(id2) {
    const instanceOrDesc = this._services.get(id2);
    if (!instanceOrDesc && this._parent) {
      return this._parent._getServiceInstanceOrDescriptor(id2);
    } else {
      return instanceOrDesc;
    }
  }
  _getOrCreateServiceInstance(id2, _trace) {
    if (this._globalGraph && this._globalGraphImplicitDependency) {
      this._globalGraph.insertEdge(this._globalGraphImplicitDependency, String(id2));
    }
    const thing = this._getServiceInstanceOrDescriptor(id2);
    if (thing instanceof SyncDescriptor) {
      return this._safeCreateAndCacheServiceInstance(id2, thing, _trace.branch(id2, true));
    } else {
      _trace.branch(id2, false);
      return thing;
    }
  }
  _safeCreateAndCacheServiceInstance(id2, desc, _trace) {
    if (this._activeInstantiations.has(id2)) {
      throw new Error(`illegal state - RECURSIVELY instantiating service '${id2}'`);
    }
    this._activeInstantiations.add(id2);
    try {
      return this._createAndCacheServiceInstance(id2, desc, _trace);
    } finally {
      this._activeInstantiations.delete(id2);
    }
  }
  _createAndCacheServiceInstance(id2, desc, _trace) {
    const graph = new Graph((data) => data.id.toString());
    let cycleCount = 0;
    const stack = [{ id: id2, desc, _trace }];
    const seen = /* @__PURE__ */ new Set();
    while (stack.length) {
      const item = stack.pop();
      if (seen.has(String(item.id))) {
        continue;
      }
      seen.add(String(item.id));
      graph.lookupOrInsertNode(item);
      if (cycleCount++ > 1e3) {
        throw new CyclicDependencyError(graph);
      }
      for (const dependency of _util.getServiceDependencies(item.desc.ctor)) {
        const instanceOrDesc = this._getServiceInstanceOrDescriptor(dependency.id);
        if (!instanceOrDesc) {
          this._throwIfStrict(`[createInstance] ${id2} depends on ${dependency.id} which is NOT registered.`, true);
        }
        this._globalGraph?.insertEdge(String(item.id), String(dependency.id));
        if (instanceOrDesc instanceof SyncDescriptor) {
          const d = { id: dependency.id, desc: instanceOrDesc, _trace: item._trace.branch(dependency.id, true) };
          graph.insertEdge(item, d);
          stack.push(d);
        }
      }
    }
    while (true) {
      const roots = graph.roots();
      if (roots.length === 0) {
        if (!graph.isEmpty()) {
          throw new CyclicDependencyError(graph);
        }
        break;
      }
      for (const { data } of roots) {
        const instanceOrDesc = this._getServiceInstanceOrDescriptor(data.id);
        if (instanceOrDesc instanceof SyncDescriptor) {
          const instance = this._createServiceInstanceWithOwner(data.id, data.desc.ctor, data.desc.staticArguments, data.desc.supportsDelayedInstantiation, data._trace);
          this._setCreatedServiceInstance(data.id, instance);
        }
        graph.removeNode(data);
      }
    }
    return this._getServiceInstanceOrDescriptor(id2);
  }
  _createServiceInstanceWithOwner(id2, ctor, args = [], supportsDelayedInstantiation, _trace) {
    if (this._services.get(id2) instanceof SyncDescriptor) {
      return this._createServiceInstance(id2, ctor, args, supportsDelayedInstantiation, _trace, this._servicesToMaybeDispose);
    } else if (this._parent) {
      return this._parent._createServiceInstanceWithOwner(id2, ctor, args, supportsDelayedInstantiation, _trace);
    } else {
      throw new Error(`illegalState - creating UNKNOWN service instance ${ctor.name}`);
    }
  }
  _createServiceInstance(id2, ctor, args = [], supportsDelayedInstantiation, _trace, disposeBucket) {
    if (!supportsDelayedInstantiation) {
      const result = this._createInstance(ctor, args, _trace);
      disposeBucket.add(result);
      return result;
    } else {
      const child = new _InstantiationService(void 0, this._strict, this, this._enableTracing);
      child._globalGraphImplicitDependency = String(id2);
      const earlyListeners = /* @__PURE__ */ new Map();
      const idle = new GlobalIdleValue(() => {
        const result = child._createInstance(ctor, args, _trace);
        for (const [key, values] of earlyListeners) {
          const candidate = result[key];
          if (typeof candidate === "function") {
            for (const value of values) {
              value.disposable = candidate.apply(result, value.listener);
            }
          }
        }
        earlyListeners.clear();
        disposeBucket.add(result);
        return result;
      });
      return new Proxy(/* @__PURE__ */ Object.create(null), {
        get(target, key) {
          if (!idle.isInitialized) {
            if (typeof key === "string" && (key.startsWith("onDid") || key.startsWith("onWill"))) {
              let list = earlyListeners.get(key);
              if (!list) {
                list = new LinkedList();
                earlyListeners.set(key, list);
              }
              const event = (callback, thisArg, disposables) => {
                if (idle.isInitialized) {
                  return idle.value[key](callback, thisArg, disposables);
                } else {
                  const entry = { listener: [callback, thisArg, disposables], disposable: void 0 };
                  const rm4 = list.push(entry);
                  const result = toDisposable(() => {
                    rm4();
                    entry.disposable?.dispose();
                  });
                  return result;
                }
              };
              return event;
            }
          }
          if (key in target) {
            return target[key];
          }
          const obj = idle.value;
          let prop = obj[key];
          if (typeof prop !== "function") {
            return prop;
          }
          prop = prop.bind(obj);
          target[key] = prop;
          return prop;
        },
        set(_target, p, value) {
          idle.value[p] = value;
          return true;
        },
        getPrototypeOf(_target) {
          return ctor.prototype;
        }
      });
    }
  }
  _throwIfStrict(msg, printWarning) {
    if (printWarning) {
      console.warn(msg);
    }
    if (this._strict) {
      throw new Error(msg);
    }
  }
};

var Trace = class _Trace {
  constructor(type, name) {
    this.type = type;
    this.name = name;
    this._start = Date.now();
    this._dep = [];
  }
  static {
    this.all = /* @__PURE__ */ new Set();
  }
  static {
    this._None = new class extends _Trace {
      constructor() {
        super(0 /* None */, null);
      }
      stop() {
      }
      branch() {
        return this;
      }
    }();
  }
  static traceInvocation(_enableTracing, ctor) {
    return !_enableTracing ? _Trace._None : new _Trace(2 /* Invocation */, ctor.name || new Error().stack.split("\n").slice(3, 4).join("\n"));
  }
  static traceCreation(_enableTracing, ctor) {
    return !_enableTracing ? _Trace._None : new _Trace(1 /* Creation */, ctor.name);
  }
  static {
    this._totals = 0;
  }
  branch(id2, first) {
    const child = new _Trace(3 /* Branch */, id2.toString());
    this._dep.push([id2, first, child]);
    return child;
  }
  stop() {
    const dur = Date.now() - this._start;
    _Trace._totals += dur;
    let causedCreation = false;
    function printChild(n, trace) {
      const res = [];
      const prefix = new Array(n + 1).join("	");
      for (const [id2, first, child] of trace._dep) {
        if (first && child) {
          causedCreation = true;
          res.push(`${prefix}CREATES -> ${id2}`);
          const nested = printChild(n + 1, child);
          if (nested) {
            res.push(nested);
          }
        } else {
          res.push(`${prefix}uses -> ${id2}`);
        }
      }
      return res.join("\n");
    }
    const lines = [
      `${this.type === 1 /* Creation */ ? "CREATE" : "CALL"} ${this.name}`,
      `${printChild(1, this)}`,
      `DONE, took ${dur.toFixed(2)}ms (grand total ${_Trace._totals.toFixed(2)}ms)`
    ];
    if (dur > 2 || causedCreation) {
      _Trace.all.add(lines.join("\n"));
    }
  }
};
export { _enableAllTracing, CyclicDependencyError, InstantiationService, Trace };
