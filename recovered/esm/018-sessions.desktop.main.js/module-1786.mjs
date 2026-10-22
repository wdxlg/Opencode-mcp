// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/services/markerDecorationsService.ts
import { Disposable, toDisposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { BidirectionalMap, ResourceMap } from "./module-0008.mjs";
import { Schemas } from "./module-0033.mjs";
import { Iterable } from "./module-0011.mjs";
import { Range2 } from "./module-0106.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IModelService } from "./module-0080.mjs";
import { IMarkerService } from "./module-0560.mjs";
import { diffSets } from "./module-0003.mjs";
import { themeColorFromId2 } from "./module-0287.mjs";
import { overviewRulerError, overviewRulerInfo, overviewRulerWarning } from "./module-0288.mjs";
import { minimapError, minimapInfo, minimapWarning } from "./module-0230.mjs";


// src/vs/editor/common/services/markerDecorationsService.ts
var MarkerDecorationsService = class extends Disposable {
  constructor(modelService, _markerService) {
    super();
    this._markerService = _markerService;
    this._onDidChangeMarker = this._register(new Emitter());
    this.onDidChangeMarker = this._onDidChangeMarker.event;
    this._suppressedRanges = new ResourceMap();
    this._markerDecorations = new ResourceMap();
    modelService.getModels().forEach((model) => this._onModelAdded(model));
    this._register(modelService.onModelAdded(this._onModelAdded, this));
    this._register(modelService.onModelRemoved(this._onModelRemoved, this));
    this._register(this._markerService.onMarkerChanged(this._handleMarkerChange, this));
  }
  dispose() {
    super.dispose();
    this._markerDecorations.forEach((value2) => value2.dispose());
    this._markerDecorations.clear();
  }
  getMarker(uri4, decoration3) {
    const markerDecorations = this._markerDecorations.get(uri4);
    return markerDecorations ? markerDecorations.getMarker(decoration3) || null : null;
  }
  getLiveMarkers(uri4) {
    const markerDecorations = this._markerDecorations.get(uri4);
    return markerDecorations ? markerDecorations.getMarkers() : [];
  }
  addMarkerSuppression(uri4, range2) {
    let suppressedRanges = this._suppressedRanges.get(uri4);
    if (!suppressedRanges) {
      suppressedRanges = /* @__PURE__ */ new Set();
      this._suppressedRanges.set(uri4, suppressedRanges);
    }
    suppressedRanges.add(range2);
    this._handleMarkerChange([uri4]);
    return toDisposable(() => {
      const suppressedRanges2 = this._suppressedRanges.get(uri4);
      if (suppressedRanges2) {
        suppressedRanges2.delete(range2);
        if (suppressedRanges2.size === 0) {
          this._suppressedRanges.delete(uri4);
        }
        this._handleMarkerChange([uri4]);
      }
    });
  }
  _handleMarkerChange(changedResources) {
    changedResources.forEach((resource) => {
      const markerDecorations = this._markerDecorations.get(resource);
      if (markerDecorations) {
        this._updateDecorations(markerDecorations);
      }
    });
  }
  _onModelAdded(model) {
    const markerDecorations = new MarkerDecorations(model);
    this._markerDecorations.set(model.uri, markerDecorations);
    this._updateDecorations(markerDecorations);
  }
  _onModelRemoved(model) {
    const markerDecorations = this._markerDecorations.get(model.uri);
    if (markerDecorations) {
      markerDecorations.dispose();
      this._markerDecorations.delete(model.uri);
    }
    if (model.uri.scheme === Schemas.inMemory || model.uri.scheme === Schemas.internal || model.uri.scheme === Schemas.vscode) {
      this._markerService?.read({ resource: model.uri }).map((marker) => marker.owner).forEach((owner) => this._markerService.remove(owner, [model.uri]));
    }
  }
  _updateDecorations(markerDecorations) {
    let markers = this._markerService.read({ resource: markerDecorations.model.uri, take: 500 });
    const suppressedRanges = this._suppressedRanges.get(markerDecorations.model.uri);
    if (suppressedRanges) {
      markers = markers.filter((marker) => {
        return !Iterable.some(suppressedRanges, (candidate) => Range2.areIntersectingOrTouching(candidate, marker));
      });
    }
    if (markerDecorations.update(markers)) {
      this._onDidChangeMarker.fire(markerDecorations.model);
    }
  }
};

MarkerDecorationsService = __decorateClass([
  __decorateParam(0, IModelService),
  __decorateParam(1, IMarkerService)
], MarkerDecorationsService);

var MarkerDecorations = class extends Disposable {
  constructor(model) {
    super();
    this.model = model;
    this._map = new BidirectionalMap();
    this._register(toDisposable(() => {
      this.model.deltaDecorations([...this._map.values()], []);
      this._map.clear();
    }));
  }
  update(markers) {
    const { added, removed } = diffSets(new Set(this._map.keys()), new Set(markers));
    if (added.length === 0 && removed.length === 0) {
      return false;
    }
    const oldIds = removed.map((marker) => this._map.get(marker));
    const newDecorations = added.map((marker) => {
      return {
        range: this._createDecorationRange(this.model, marker),
        options: this._createDecorationOption(marker)
      };
    });
    const ids = this.model.deltaDecorations(oldIds, newDecorations);
    for (const removedMarker of removed) {
      this._map.delete(removedMarker);
    }
    for (let index2 = 0; index2 < ids.length; index2++) {
      this._map.set(added[index2], ids[index2]);
    }
    return true;
  }
  getMarker(decoration3) {
    return this._map.getKey(decoration3.id);
  }
  getMarkers() {
    const res = [];
    this._map.forEach((id2, marker) => {
      const range2 = this.model.getDecorationRange(id2);
      if (range2) {
        res.push([range2, marker]);
      }
    });
    return res;
  }
  _createDecorationRange(model, rawMarker) {
    let ret = Range2.lift(rawMarker);
    if (rawMarker.severity === 1 /* Hint */ && !this._hasMarkerTag(rawMarker, 1 /* Unnecessary */) && !this._hasMarkerTag(rawMarker, 2 /* Deprecated */)) {
      ret = ret.setEndPosition(ret.startLineNumber, ret.startColumn + 2);
    }
    ret = model.validateRange(ret);
    if (ret.isEmpty()) {
      const maxColumn = model.getLineLastNonWhitespaceColumn(ret.startLineNumber) || model.getLineMaxColumn(ret.startLineNumber);
      if (maxColumn === 1 || ret.endColumn >= maxColumn) {
        return ret;
      }
      const word = model.getWordAtPosition(ret.getStartPosition());
      if (word) {
        ret = new Range2(ret.startLineNumber, word.startColumn, ret.endLineNumber, word.endColumn);
      }
    } else if (rawMarker.endColumn === Number.MAX_VALUE && rawMarker.startColumn === 1 && ret.startLineNumber === ret.endLineNumber) {
      const minColumn = model.getLineFirstNonWhitespaceColumn(rawMarker.startLineNumber);
      if (minColumn < ret.endColumn) {
        ret = new Range2(ret.startLineNumber, minColumn, ret.endLineNumber, ret.endColumn);
        rawMarker.startColumn = minColumn;
      }
    }
    return ret;
  }
  _createDecorationOption(marker) {
    let className2;
    let color2 = void 0;
    let zIndex;
    let inlineClassName = void 0;
    let minimap;
    switch (marker.severity) {
      case 1 /* Hint */:
        if (this._hasMarkerTag(marker, 2 /* Deprecated */)) {
          className2 = void 0;
        } else if (this._hasMarkerTag(marker, 1 /* Unnecessary */)) {
          className2 = "squiggly-unnecessary" /* EditorUnnecessaryDecoration */;
        } else {
          className2 = "squiggly-hint" /* EditorHintDecoration */;
        }
        zIndex = 0;
        break;
      case 2 /* Info */:
        className2 = "squiggly-info" /* EditorInfoDecoration */;
        color2 = themeColorFromId2(overviewRulerInfo);
        zIndex = 10;
        minimap = {
          color: themeColorFromId2(minimapInfo),
          position: 1 /* Inline */
        };
        break;
      case 4 /* Warning */:
        className2 = "squiggly-warning" /* EditorWarningDecoration */;
        color2 = themeColorFromId2(overviewRulerWarning);
        zIndex = 20;
        minimap = {
          color: themeColorFromId2(minimapWarning),
          position: 1 /* Inline */
        };
        break;
      case 8 /* Error */:
      default:
        className2 = "squiggly-error" /* EditorErrorDecoration */;
        color2 = themeColorFromId2(overviewRulerError);
        zIndex = 30;
        minimap = {
          color: themeColorFromId2(minimapError),
          position: 1 /* Inline */
        };
        break;
    }
    if (marker.tags) {
      if (marker.tags.indexOf(1 /* Unnecessary */) !== -1) {
        inlineClassName = "squiggly-inline-unnecessary" /* EditorUnnecessaryInlineDecoration */;
      }
      if (marker.tags.indexOf(2 /* Deprecated */) !== -1) {
        inlineClassName = "squiggly-inline-deprecated" /* EditorDeprecatedInlineDecoration */;
      }
    }
    return {
      description: "marker-decoration",
      stickiness: 1 /* NeverGrowsWhenTypingAtEdges */,
      className: className2,
      showIfCollapsed: true,
      overviewRuler: {
        color: color2,
        position: 4 /* Right */
      },
      minimap,
      zIndex,
      inlineClassName
    };
  }
  _hasMarkerTag(marker, tag2) {
    if (marker.tags) {
      return marker.tags.indexOf(tag2) >= 0;
    }
    return false;
  }
};
export { MarkerDecorationsService, MarkerDecorations };
