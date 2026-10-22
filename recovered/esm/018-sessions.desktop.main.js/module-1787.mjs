// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/markers/common/markerService.ts
import { Schemas } from "./module-0033.mjs";
import { ResourceMap, ResourceSet } from "./module-0008.mjs";
import { Iterable } from "./module-0011.mjs";
import { URI } from "./module-0032.mjs";
import { MicrotaskEmitter } from "./module-0017.mjs";
import { isFalsyOrEmpty, isNonEmptyArray } from "./module-0007.mjs";
import { toDisposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/platform/markers/common/markerService.ts
var unsupportedSchemas = /* @__PURE__ */ new Set([
  Schemas.inMemory,
  Schemas.vscodeSourceControl,
  Schemas.walkThrough,
  Schemas.walkThroughSnippet,
  Schemas.vscodeChatCodeBlock,
  Schemas.vscodeTerminal
]);

var DoubleResourceMap = class {
  constructor() {
    this._byResource = new ResourceMap();
    this._byOwner = /* @__PURE__ */ new Map();
  }
  set(resource, owner, value2) {
    let ownerMap = this._byResource.get(resource);
    if (!ownerMap) {
      ownerMap = /* @__PURE__ */ new Map();
      this._byResource.set(resource, ownerMap);
    }
    ownerMap.set(owner, value2);
    let resourceMap = this._byOwner.get(owner);
    if (!resourceMap) {
      resourceMap = new ResourceMap();
      this._byOwner.set(owner, resourceMap);
    }
    resourceMap.set(resource, value2);
  }
  get(resource, owner) {
    const ownerMap = this._byResource.get(resource);
    return ownerMap?.get(owner);
  }
  delete(resource, owner) {
    let removedA = false;
    let removedB = false;
    const ownerMap = this._byResource.get(resource);
    if (ownerMap) {
      removedA = ownerMap.delete(owner);
    }
    const resourceMap = this._byOwner.get(owner);
    if (resourceMap) {
      removedB = resourceMap.delete(resource);
    }
    if (removedA !== removedB) {
      throw new Error("illegal state");
    }
    return removedA && removedB;
  }
  values(key3) {
    if (typeof key3 === "string") {
      return this._byOwner.get(key3)?.values() ?? Iterable.empty();
    }
    if (URI.isUri(key3)) {
      return this._byResource.get(key3)?.values() ?? Iterable.empty();
    }
    return Iterable.map(Iterable.concat(...this._byOwner.values()), (map) => map[1]);
  }
};

var MarkerStats = class {
  constructor(service) {
    this.errors = 0;
    this.infos = 0;
    this.warnings = 0;
    this.unknowns = 0;
    this._data = new ResourceMap();
    this._service = service;
    this._subscription = service.onMarkerChanged(this._update, this);
  }
  dispose() {
    this._subscription.dispose();
  }
  _update(resources) {
    for (const resource of resources) {
      const oldStats = this._data.get(resource);
      if (oldStats) {
        this._substract(oldStats);
      }
      const newStats = this._resourceStats(resource);
      this._add(newStats);
      this._data.set(resource, newStats);
    }
  }
  _resourceStats(resource) {
    const result = { errors: 0, warnings: 0, infos: 0, unknowns: 0 };
    if (unsupportedSchemas.has(resource.scheme)) {
      return result;
    }
    for (const { severity } of this._service.read({ resource })) {
      if (severity === 8 /* Error */) {
        result.errors += 1;
      } else if (severity === 4 /* Warning */) {
        result.warnings += 1;
      } else if (severity === 2 /* Info */) {
        result.infos += 1;
      } else {
        result.unknowns += 1;
      }
    }
    return result;
  }
  _substract(op) {
    this.errors -= op.errors;
    this.warnings -= op.warnings;
    this.infos -= op.infos;
    this.unknowns -= op.unknowns;
  }
  _add(op) {
    this.errors += op.errors;
    this.warnings += op.warnings;
    this.infos += op.infos;
    this.unknowns += op.unknowns;
  }
};

var MarkerService = class _MarkerService {
  constructor() {
    this._onMarkerChanged = new MicrotaskEmitter({
      merge: _MarkerService._merge
    });
    this.onMarkerChanged = this._onMarkerChanged.event;
    this._data = new DoubleResourceMap();
    this._stats = new MarkerStats(this);
    this._filteredResources = new ResourceMap();
  }
  dispose() {
    this._stats.dispose();
    this._onMarkerChanged.dispose();
  }
  getStatistics() {
    return this._stats;
  }
  remove(owner, resources) {
    for (const resource of resources || []) {
      this.changeOne(owner, resource, []);
    }
  }
  changeOne(owner, resource, markerData) {
    if (isFalsyOrEmpty(markerData)) {
      const removed = this._data.delete(resource, owner);
      if (removed) {
        this._onMarkerChanged.fire([resource]);
      }
    } else {
      const markers = [];
      for (const data of markerData) {
        const marker = _MarkerService._toMarker(owner, resource, data);
        if (marker) {
          markers.push(marker);
        }
      }
      this._data.set(resource, owner, markers);
      this._onMarkerChanged.fire([resource]);
    }
  }
  installResourceFilter(resource, reason) {
    let reasons = this._filteredResources.get(resource);
    if (!reasons) {
      reasons = [];
      this._filteredResources.set(resource, reasons);
    }
    reasons.push(reason);
    this._onMarkerChanged.fire([resource]);
    return toDisposable(() => {
      const reasons2 = this._filteredResources.get(resource);
      if (!reasons2) {
        return;
      }
      const reasonIndex = reasons2.indexOf(reason);
      if (reasonIndex !== -1) {
        reasons2.splice(reasonIndex, 1);
        if (reasons2.length === 0) {
          this._filteredResources.delete(resource);
        }
        this._onMarkerChanged.fire([resource]);
      }
    });
  }
  static _toMarker(owner, resource, data) {
    let {
      code,
      severity,
      message,
      source,
      startLineNumber,
      startColumn,
      endLineNumber,
      endColumn,
      relatedInformation,
      modelVersionId,
      tags,
      origin
    } = data;
    if (!message) {
      return void 0;
    }
    startLineNumber = startLineNumber > 0 ? startLineNumber : 1;
    startColumn = startColumn > 0 ? startColumn : 1;
    endLineNumber = endLineNumber >= startLineNumber ? endLineNumber : startLineNumber;
    endColumn = endColumn > 0 ? endColumn : startColumn;
    return {
      resource,
      owner,
      code,
      severity,
      message,
      source,
      startLineNumber,
      startColumn,
      endLineNumber,
      endColumn,
      relatedInformation,
      modelVersionId,
      tags,
      origin
    };
  }
  changeAll(owner, data) {
    const changes = [];
    const existing = this._data.values(owner);
    if (existing) {
      for (const data2 of existing) {
        const first2 = Iterable.first(data2);
        if (first2) {
          changes.push(first2.resource);
          this._data.delete(first2.resource, owner);
        }
      }
    }
    if (isNonEmptyArray(data)) {
      const groups = new ResourceMap();
      for (const { resource, marker: markerData } of data) {
        const marker = _MarkerService._toMarker(owner, resource, markerData);
        if (!marker) {
          continue;
        }
        const array3 = groups.get(resource);
        if (!array3) {
          groups.set(resource, [marker]);
          changes.push(resource);
        } else {
          array3.push(marker);
        }
      }
      for (const [resource, value2] of groups) {
        this._data.set(resource, owner, value2);
      }
    }
    if (changes.length > 0) {
      this._onMarkerChanged.fire(changes);
    }
  }
  /**
   * Creates an information marker for filtered resources
   */
  _createFilteredMarker(resource, reasons) {
    const message = reasons.length === 1 ? localize(3111, null, reasons[0]) : localize(3112, null, reasons[0], reasons.length - 1);
    return {
      owner: "markersFilter",
      resource,
      severity: 2 /* Info */,
      message,
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: 1,
      endColumn: 1
    };
  }
  read(filter2 = /* @__PURE__ */ Object.create(null)) {
    let { owner, resource, severities, take } = filter2;
    if (!take || take < 0) {
      take = -1;
    }
    if (owner && resource) {
      const reasons = !filter2.ignoreResourceFilters ? this._filteredResources.get(resource) : void 0;
      if (reasons?.length) {
        const infoMarker = this._createFilteredMarker(resource, reasons);
        return [infoMarker];
      }
      const data = this._data.get(resource, owner);
      if (!data) {
        return [];
      }
      const result = [];
      for (const marker of data) {
        if (take > 0 && result.length === take) {
          break;
        }
        const reasons2 = !filter2.ignoreResourceFilters ? this._filteredResources.get(resource) : void 0;
        if (reasons2?.length) {
          result.push(this._createFilteredMarker(resource, reasons2));
        } else if (_MarkerService._accept(marker, severities)) {
          result.push(marker);
        }
      }
      return result;
    } else {
      const iterable = !owner && !resource ? this._data.values() : this._data.values(resource ?? owner);
      const result = [];
      const filtered = new ResourceSet();
      for (const markers of iterable) {
        for (const data of markers) {
          if (filtered.has(data.resource)) {
            continue;
          }
          if (take > 0 && result.length === take) {
            break;
          }
          const reasons = !filter2.ignoreResourceFilters ? this._filteredResources.get(data.resource) : void 0;
          if (reasons?.length) {
            result.push(this._createFilteredMarker(data.resource, reasons));
            filtered.add(data.resource);
          } else if (_MarkerService._accept(data, severities)) {
            result.push(data);
          }
        }
      }
      return result;
    }
  }
  static _accept(marker, severities) {
    return severities === void 0 || (severities & marker.severity) === marker.severity;
  }
  // --- event debounce logic
  static _merge(all) {
    const set = new ResourceMap();
    for (const array3 of all) {
      for (const item of array3) {
        set.set(item, true);
      }
    }
    return Array.from(set.keys());
  }
};
export { unsupportedSchemas, DoubleResourceMap, MarkerStats, MarkerService };
