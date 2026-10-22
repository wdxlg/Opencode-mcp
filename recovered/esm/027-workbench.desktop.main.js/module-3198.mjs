// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/markers/browser/markersModel.ts
import { basename2, extUri } from "./module-0034.mjs";
import { IMarkerData, MarkerSeverity2 } from "./module-0560.mjs";
import { ResourceMap } from "./module-0008.mjs";
import { isNonEmptyArray } from "./module-0007.mjs";
import { Range2 } from "./module-0106.mjs";
import { splitLines } from "./module-0030.mjs";
import { Emitter } from "./module-0017.mjs";
import { unsupportedSchemas } from "./module-1813.mjs";
import { hash } from "./module-0039.mjs";


// src/vs/workbench/contrib/markers/browser/markersModel.ts
function compareMarkersByUri(a, b) {
  return extUri.compare(a.resource, b.resource);
}

function compareResourceMarkers(a, b) {
  const [firstMarkerOfA] = a.markers;
  const [firstMarkerOfB] = b.markers;
  let res = 0;
  if (firstMarkerOfA && firstMarkerOfB) {
    res = MarkerSeverity2.compare(firstMarkerOfA.marker.severity, firstMarkerOfB.marker.severity);
  }
  if (res === 0) {
    res = a.path.localeCompare(b.path) || a.name.localeCompare(b.name);
  }
  return res;
}

var ResourceMarkers = class _ResourceMarkers {
  constructor(id2, resource) {
    this.id = id2;
    this.resource = resource;
    this._markersMap = new ResourceMap();
    this._total = 0;
    this.path = this.resource.fsPath;
    this.name = basename2(this.resource);
  }
  get markers() {
    if (!this._cachedMarkers) {
      this._cachedMarkers = [...this._markersMap.values()].flat().sort(_ResourceMarkers._compareMarkers);
    }
    return this._cachedMarkers;
  }
  has(uri5) {
    return this._markersMap.has(uri5);
  }
  set(uri5, marker) {
    this.delete(uri5);
    if (isNonEmptyArray(marker)) {
      this._markersMap.set(uri5, marker);
      this._total += marker.length;
      this._cachedMarkers = void 0;
    }
  }
  delete(uri5) {
    const array3 = this._markersMap.get(uri5);
    if (array3) {
      this._total -= array3.length;
      this._cachedMarkers = void 0;
      this._markersMap.delete(uri5);
    }
  }
  get total() {
    return this._total;
  }
  static _compareMarkers(a, b) {
    return MarkerSeverity2.compare(a.marker.severity, b.marker.severity) || extUri.compare(a.resource, b.resource) || Range2.compareRangesUsingStarts(a.marker, b.marker);
  }
};

var Marker3 = class {
  constructor(id2, marker, relatedInformation = []) {
    this.id = id2;
    this.marker = marker;
    this.relatedInformation = relatedInformation;
  }
  get resource() {
    return this.marker.resource;
  }
  get range() {
    return this.marker;
  }
  get lines() {
    if (!this._lines) {
      this._lines = splitLines(this.marker.message);
    }
    return this._lines;
  }
  toString() {
    return JSON.stringify({
      ...this.marker,
      resource: this.marker.resource.path,
      relatedInformation: this.relatedInformation.length ? this.relatedInformation.map((r2) => ({ ...r2.raw, resource: r2.raw.resource.path })) : void 0
    }, null, "	");
  }
};

var MarkerTableItem = class extends Marker3 {
  constructor(marker, sourceMatches, codeMatches, messageMatches, fileMatches) {
    super(marker.id, marker.marker, marker.relatedInformation);
    this.sourceMatches = sourceMatches;
    this.codeMatches = codeMatches;
    this.messageMatches = messageMatches;
    this.fileMatches = fileMatches;
  }
};

var RelatedInformation = class {
  constructor(id2, marker, raw) {
    this.id = id2;
    this.marker = marker;
    this.raw = raw;
  }
};

var MarkersModel = class {
  constructor() {
    this.cachedSortedResources = void 0;
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
    this._total = 0;
    this.resourcesByUri = /* @__PURE__ */ new Map();
  }
  get resourceMarkers() {
    if (!this.cachedSortedResources) {
      this.cachedSortedResources = [...this.resourcesByUri.values()].sort(compareResourceMarkers);
    }
    return this.cachedSortedResources;
  }
  reset() {
    const removed = /* @__PURE__ */ new Set();
    for (const resourceMarker of this.resourcesByUri.values()) {
      removed.add(resourceMarker);
    }
    this.resourcesByUri.clear();
    this._total = 0;
    this._onDidChange.fire({ removed, added: /* @__PURE__ */ new Set(), updated: /* @__PURE__ */ new Set() });
  }
  get total() {
    return this._total;
  }
  getResourceMarkers(resource) {
    return this.resourcesByUri.get(extUri.getComparisonKey(resource, true)) ?? null;
  }
  setResourceMarkers(resourcesMarkers) {
    const change = { added: /* @__PURE__ */ new Set(), removed: /* @__PURE__ */ new Set(), updated: /* @__PURE__ */ new Set() };
    for (const [resource, rawMarkers] of resourcesMarkers) {
      if (unsupportedSchemas.has(resource.scheme)) {
        continue;
      }
      const key3 = extUri.getComparisonKey(resource, true);
      let resourceMarkers = this.resourcesByUri.get(key3);
      if (isNonEmptyArray(rawMarkers)) {
        if (!resourceMarkers) {
          const resourceMarkersId = this.id(resource.toString());
          resourceMarkers = new ResourceMarkers(resourceMarkersId, resource.with({ fragment: null }));
          this.resourcesByUri.set(key3, resourceMarkers);
          change.added.add(resourceMarkers);
        } else {
          change.updated.add(resourceMarkers);
        }
        const processedMarkerKeys = /* @__PURE__ */ new Set();
        const markers = [];
        for (const rawMarker of rawMarkers) {
          const markerKey = IMarkerData.makeKey(rawMarker) + rawMarker.resource.toString();
          if (processedMarkerKeys.has(markerKey)) {
            continue;
          }
          processedMarkerKeys.add(markerKey);
          const markerId = this.id(resourceMarkers.id, markerKey, 0, rawMarker.resource.toString());
          let relatedInformation = void 0;
          if (rawMarker.relatedInformation) {
            relatedInformation = rawMarker.relatedInformation.map((r2, index2) => new RelatedInformation(this.id(markerId, r2.resource.toString(), r2.startLineNumber, r2.startColumn, r2.endLineNumber, r2.endColumn, index2), rawMarker, r2));
          }
          markers.push(new Marker3(markerId, rawMarker, relatedInformation));
        }
        this._total -= resourceMarkers.total;
        resourceMarkers.set(resource, markers);
        this._total += resourceMarkers.total;
      } else if (resourceMarkers) {
        this._total -= resourceMarkers.total;
        resourceMarkers.delete(resource);
        this._total += resourceMarkers.total;
        if (resourceMarkers.total === 0) {
          this.resourcesByUri.delete(key3);
          change.removed.add(resourceMarkers);
        } else {
          change.updated.add(resourceMarkers);
        }
      }
    }
    this.cachedSortedResources = void 0;
    if (change.added.size || change.removed.size || change.updated.size) {
      this._onDidChange.fire(change);
    }
  }
  id(...values) {
    return `${hash(values)}`;
  }
  dispose() {
    this._onDidChange.dispose();
    this.resourcesByUri.clear();
  }
};
export { compareMarkersByUri, compareResourceMarkers, ResourceMarkers, Marker3, MarkerTableItem, RelatedInformation, MarkersModel };
