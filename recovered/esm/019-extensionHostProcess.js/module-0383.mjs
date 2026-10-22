// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostDiagnostics.ts
import { ResourceMap } from "./module-0007.mjs";
import { URI } from "./module-0025.mjs";
import { coalesce } from "./module-0006.mjs";
import { Diagnostic2 } from "./module-0245.mjs";
import { localize } from "./module-0013.mjs";
import { DebounceEmitter, Event } from "./module-0017.mjs";
import { MainContext } from "./module-0054.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { ILogService } from "./module-0062.mjs";
import { IExtHostFileSystemInfo } from "./module-0077.mjs";


// src/vs/workbench/api/common/extHostDiagnostics.ts
var DiagnosticCollection = class _DiagnosticCollection {
  constructor(_name, _owner, _maxDiagnosticsTotal, _maxDiagnosticsPerFile, _modelVersionIdProvider, extUri2, proxy, onDidChangeDiagnostics) {
    this._name = _name;
    this._owner = _owner;
    this._maxDiagnosticsTotal = _maxDiagnosticsTotal;
    this._maxDiagnosticsPerFile = _maxDiagnosticsPerFile;
    this._modelVersionIdProvider = _modelVersionIdProvider;
    this._isDisposed = false;
    this._maxDiagnosticsTotal = Math.max(_maxDiagnosticsPerFile, _maxDiagnosticsTotal);
    this.#data = new ResourceMap((uri2) => extUri2.getComparisonKey(uri2));
    this.#proxy = proxy;
    this.#onDidChangeDiagnostics = onDidChangeDiagnostics;
  }
  #proxy;
  #onDidChangeDiagnostics;
  #data;
  dispose() {
    if (!this._isDisposed) {
      this.#onDidChangeDiagnostics.fire([...this.#data.keys()]);
      this.#proxy?.$clear(this._owner);
      this.#data.clear();
      this._isDisposed = true;
    }
  }
  get name() {
    this._checkDisposed();
    return this._name;
  }
  set(first, diagnostics) {
    if (!first) {
      this.clear();
      return;
    }
    this._checkDisposed();
    let toSync = [];
    if (URI.isUri(first)) {
      if (!diagnostics) {
        this.delete(first);
        return;
      }
      this.#data.set(first, coalesce(diagnostics));
      toSync = [first];
    } else if (Array.isArray(first)) {
      toSync = [];
      let lastUri;
      first = [...first].sort(_DiagnosticCollection._compareIndexedTuplesByUri);
      for (const tuple of first) {
        const [uri2, diagnostics2] = tuple;
        if (!lastUri || uri2.toString() !== lastUri.toString()) {
          if (lastUri && this.#data.get(lastUri).length === 0) {
            this.#data.delete(lastUri);
          }
          lastUri = uri2;
          toSync.push(uri2);
          this.#data.set(uri2, []);
        }
        if (!diagnostics2) {
          const currentDiagnostics = this.#data.get(uri2);
          if (currentDiagnostics) {
            currentDiagnostics.length = 0;
          }
        } else {
          const currentDiagnostics = this.#data.get(uri2);
          currentDiagnostics?.push(...coalesce(diagnostics2));
        }
      }
    }
    this.#onDidChangeDiagnostics.fire(toSync);
    if (!this.#proxy) {
      return;
    }
    const entries = [];
    let totalMarkerCount = 0;
    for (const uri2 of toSync) {
      let marker = [];
      const diagnostics2 = this.#data.get(uri2);
      if (diagnostics2) {
        if (diagnostics2.length > this._maxDiagnosticsPerFile) {
          marker = [];
          const order = [0 /* Error */, 1 /* Warning */, 2 /* Information */, 3 /* Hint */];
          orderLoop: for (let i = 0; i < 4; i++) {
            for (const diagnostic of diagnostics2) {
              if (diagnostic.severity === order[i]) {
                const len = marker.push({ ...Diagnostic2.from(diagnostic), modelVersionId: this._modelVersionIdProvider(uri2) });
                if (len === this._maxDiagnosticsPerFile) {
                  break orderLoop;
                }
              }
            }
          }
          marker.push({
            severity: 2 /* Info */,
            message: localize(5877, null, diagnostics2.length - this._maxDiagnosticsPerFile),
            startLineNumber: marker[marker.length - 1].startLineNumber,
            startColumn: marker[marker.length - 1].startColumn,
            endLineNumber: marker[marker.length - 1].endLineNumber,
            endColumn: marker[marker.length - 1].endColumn
          });
        } else {
          marker = diagnostics2.map((diag) => ({ ...Diagnostic2.from(diag), modelVersionId: this._modelVersionIdProvider(uri2) }));
        }
      }
      entries.push([uri2, marker]);
      totalMarkerCount += marker.length;
      if (totalMarkerCount > this._maxDiagnosticsTotal) {
        break;
      }
    }
    this.#proxy.$changeMany(this._owner, entries);
  }
  delete(uri2) {
    this._checkDisposed();
    this.#onDidChangeDiagnostics.fire([uri2]);
    this.#data.delete(uri2);
    this.#proxy?.$changeMany(this._owner, [[uri2, void 0]]);
  }
  clear() {
    this._checkDisposed();
    this.#onDidChangeDiagnostics.fire([...this.#data.keys()]);
    this.#data.clear();
    this.#proxy?.$clear(this._owner);
  }
  forEach(callback, thisArg) {
    this._checkDisposed();
    for (const [uri2, values] of this) {
      callback.call(thisArg, uri2, values, this);
    }
  }
  *[Symbol.iterator]() {
    this._checkDisposed();
    for (const uri2 of this.#data.keys()) {
      yield [uri2, this.get(uri2)];
    }
  }
  get(uri2) {
    this._checkDisposed();
    const result = this.#data.get(uri2);
    if (Array.isArray(result)) {
      return Object.freeze(result.slice(0));
    }
    return [];
  }
  has(uri2) {
    this._checkDisposed();
    return Array.isArray(this.#data.get(uri2));
  }
  _checkDisposed() {
    if (this._isDisposed) {
      throw new Error("illegal state - object is disposed");
    }
  }
  static _compareIndexedTuplesByUri(a, b) {
    if (a[0].toString() < b[0].toString()) {
      return -1;
    } else if (a[0].toString() > b[0].toString()) {
      return 1;
    } else {
      return 0;
    }
  }
};

var ExtHostDiagnostics = class {
  constructor(mainContext, _logService, _fileSystemInfoService, _extHostDocumentsAndEditors) {
    this._logService = _logService;
    this._fileSystemInfoService = _fileSystemInfoService;
    this._extHostDocumentsAndEditors = _extHostDocumentsAndEditors;
    this._collections = /* @__PURE__ */ new Map();
    this._onDidChangeDiagnostics = new DebounceEmitter({ merge: (all) => all.flat(), delay: 50 });
    this.onDidChangeDiagnostics = Event.map(this._onDidChangeDiagnostics.event, ExtHostDiagnostics._mapper);
    this._proxy = mainContext.getProxy(MainContext.MainThreadDiagnostics);
  }
  static {
    this._idPool = 0;
  }
  static {
    this._maxDiagnosticsPerFile = 1e3;
  }
  static {
    this._maxDiagnosticsTotal = 1.1 * this._maxDiagnosticsPerFile;
  }
  static _mapper(last) {
    const map = new ResourceMap();
    for (const uri2 of last) {
      map.set(uri2, uri2);
    }
    return { uris: Object.freeze(Array.from(map.values())) };
  }
  createDiagnosticCollection(extensionId, name) {
    const { _collections, _proxy, _onDidChangeDiagnostics, _logService, _fileSystemInfoService, _extHostDocumentsAndEditors } = this;
    const loggingProxy = new class {
      $changeMany(owner2, entries) {
        _proxy.$changeMany(owner2, entries);
        _logService.trace("[DiagnosticCollection] change many (extension, owner, uris)", extensionId.value, owner2, entries.length === 0 ? "CLEARING" : entries);
      }
      $clear(owner2) {
        _proxy.$clear(owner2);
        _logService.trace("[DiagnosticCollection] remove all (extension, owner)", extensionId.value, owner2);
      }
      dispose() {
        _proxy.dispose();
      }
    }();
    let owner;
    if (!name) {
      name = "_generated_diagnostic_collection_name_#" + ExtHostDiagnostics._idPool++;
      owner = name;
    } else if (!_collections.has(name)) {
      owner = name;
    } else {
      this._logService.warn(`DiagnosticCollection with name '${name}' does already exist.`);
      do {
        owner = name + ExtHostDiagnostics._idPool++;
      } while (_collections.has(owner));
    }
    const result = new class extends DiagnosticCollection {
      constructor() {
        super(
          name,
          owner,
          ExtHostDiagnostics._maxDiagnosticsTotal,
          ExtHostDiagnostics._maxDiagnosticsPerFile,
          (uri2) => _extHostDocumentsAndEditors.getDocument(uri2)?.version,
          _fileSystemInfoService.extUri,
          loggingProxy,
          _onDidChangeDiagnostics
        );
        _collections.set(owner, this);
      }
      dispose() {
        super.dispose();
        _collections.delete(owner);
      }
    }();
    return result;
  }
  getDiagnostics(resource) {
    if (resource) {
      return this._getDiagnostics(resource);
    } else {
      const index = /* @__PURE__ */ new Map();
      const res = [];
      for (const collection of this._collections.values()) {
        collection.forEach((uri2, diagnostics) => {
          let idx = index.get(uri2.toString());
          if (typeof idx === "undefined") {
            idx = res.length;
            index.set(uri2.toString(), idx);
            res.push([uri2, []]);
          }
          res[idx][1] = res[idx][1].concat(diagnostics);
        });
      }
      return res;
    }
  }
  _getDiagnostics(resource) {
    let res = [];
    for (const collection of this._collections.values()) {
      if (collection.has(resource)) {
        res = res.concat(collection.get(resource));
      }
    }
    return res;
  }
  $acceptMarkersChange(data) {
    if (!this._mirrorCollection) {
      const name = "_generated_mirror";
      const collection = new DiagnosticCollection(
        name,
        name,
        Number.MAX_SAFE_INTEGER,
        Number.MAX_SAFE_INTEGER,
        // no limits because this collection is just a mirror of "sanitized" data
        (_uri) => void 0,
        this._fileSystemInfoService.extUri,
        void 0,
        this._onDidChangeDiagnostics
      );
      this._collections.set(name, collection);
      this._mirrorCollection = collection;
    }
    for (const [uri2, markers] of data) {
      if (markers.length === 0) {
        this._mirrorCollection.delete(URI.revive(uri2));
      } else {
        this._mirrorCollection.set(URI.revive(uri2), markers.map(Diagnostic2.to));
      }
    }
  }
};

ExtHostDiagnostics = __decorateClass([
  __decorateParam(1, ILogService),
  __decorateParam(2, IExtHostFileSystemInfo)
], ExtHostDiagnostics);
export { DiagnosticCollection, ExtHostDiagnostics };
