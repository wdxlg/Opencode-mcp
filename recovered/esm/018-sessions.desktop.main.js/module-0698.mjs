// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/gotoError/browser/markerNavigationService.ts
import { Emitter } from "./module-0017.mjs";
import { DisposableStore, toDisposable } from "./module-0012.mjs";
import { URI } from "./module-0032.mjs";
import { compare } from "./module-0030.mjs";
import { Range2 } from "./module-0106.mjs";
import { IMarkerService, MarkerSeverity2 } from "./module-0560.mjs";
import { binarySearch2, equals } from "./module-0007.mjs";
import { isEqual2 } from "./module-0034.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IConfigurationService } from "./module-0132.mjs";
import { createDecorator } from "./module-0077.mjs";
import { LinkedList } from "./module-0013.mjs";
import { registerSingleton } from "./module-0135.mjs";


// src/vs/editor/contrib/gotoError/browser/markerNavigationService.ts
var MarkerCoordinate = class {
  constructor(marker, index2, total) {
    this.marker = marker;
    this.index = index2;
    this.total = total;
  }
};

var MarkerList = class {
  constructor(resourceFilter, _markerService, _configService) {
    this._markerService = _markerService;
    this._configService = _configService;
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
    this._dispoables = new DisposableStore();
    this._markers = [];
    this._nextIdx = -1;
    if (URI.isUri(resourceFilter)) {
      this._resourceFilter = (uri4) => uri4.toString() === resourceFilter.toString();
    } else if (resourceFilter) {
      this._resourceFilter = resourceFilter;
    }
    const compareOrder = this._configService.getValue("problems.sortOrder");
    const compareMarker = (a, b) => {
      let res = compare(a.resource.toString(), b.resource.toString());
      if (res === 0) {
        if (compareOrder === "position") {
          res = Range2.compareRangesUsingStarts(a, b) || MarkerSeverity2.compare(a.severity, b.severity);
        } else {
          res = MarkerSeverity2.compare(a.severity, b.severity) || Range2.compareRangesUsingStarts(a, b);
        }
      }
      return res;
    };
    const updateMarker = () => {
      let newMarkers = this._markerService.read({
        resource: URI.isUri(resourceFilter) ? resourceFilter : void 0,
        severities: 8 /* Error */ | 4 /* Warning */ | 2 /* Info */
      });
      if (typeof resourceFilter === "function") {
        newMarkers = newMarkers.filter((m) => this._resourceFilter(m.resource));
      }
      newMarkers.sort(compareMarker);
      if (equals(
        newMarkers,
        this._markers,
        (a, b) => a.resource.toString() === b.resource.toString() && a.startLineNumber === b.startLineNumber && a.startColumn === b.startColumn && a.endLineNumber === b.endLineNumber && a.endColumn === b.endColumn && a.severity === b.severity && a.message === b.message
      )) {
        return false;
      }
      this._markers = newMarkers;
      return true;
    };
    updateMarker();
    this._dispoables.add(_markerService.onMarkerChanged((uris) => {
      if (!this._resourceFilter || uris.some((uri4) => this._resourceFilter(uri4))) {
        if (updateMarker()) {
          this._nextIdx = -1;
          this._onDidChange.fire();
        }
      }
    }));
  }
  dispose() {
    this._dispoables.dispose();
    this._onDidChange.dispose();
  }
  matches(uri4) {
    if (!this._resourceFilter && !uri4) {
      return true;
    }
    if (!this._resourceFilter || !uri4) {
      return false;
    }
    return this._resourceFilter(uri4);
  }
  get selected() {
    const marker = this._markers[this._nextIdx];
    return marker && new MarkerCoordinate(marker, this._nextIdx + 1, this._markers.length);
  }
  _initIdx(model, position2, fwd) {
    let idx = this._markers.findIndex((marker) => isEqual2(marker.resource, model.uri));
    if (idx < 0) {
      idx = binarySearch2(this._markers.length, (idx2) => compare(this._markers[idx2].resource.toString(), model.uri.toString()));
      if (idx < 0) {
        idx = ~idx;
      }
      if (fwd) {
        this._nextIdx = idx;
      } else {
        this._nextIdx = (this._markers.length + idx - 1) % this._markers.length;
      }
    } else {
      let found = false;
      let wentPast = false;
      for (let i2 = idx; i2 < this._markers.length; i2++) {
        let range2 = Range2.lift(this._markers[i2]);
        if (range2.isEmpty()) {
          const word = model.getWordAtPosition(range2.getStartPosition());
          if (word) {
            range2 = new Range2(range2.startLineNumber, word.startColumn, range2.startLineNumber, word.endColumn);
          }
        }
        if (position2 && (range2.containsPosition(position2) || position2.isBeforeOrEqual(range2.getStartPosition()))) {
          this._nextIdx = i2;
          found = true;
          wentPast = !range2.containsPosition(position2);
          break;
        }
        if (this._markers[i2].resource.toString() !== model.uri.toString()) {
          break;
        }
      }
      if (!found) {
        this._nextIdx = fwd ? 0 : this._markers.length - 1;
      } else if (wentPast && !fwd) {
        this._nextIdx -= 1;
      }
    }
    if (this._nextIdx < 0) {
      this._nextIdx = this._markers.length - 1;
    }
  }
  resetIndex() {
    this._nextIdx = -1;
  }
  move(fwd, model, position2) {
    if (this._markers.length === 0) {
      return false;
    }
    const oldIdx = this._nextIdx;
    if (this._nextIdx === -1) {
      this._initIdx(model, position2, fwd);
    } else if (fwd) {
      this._nextIdx = (this._nextIdx + 1) % this._markers.length;
    } else if (!fwd) {
      this._nextIdx = (this._nextIdx - 1 + this._markers.length) % this._markers.length;
    }
    if (oldIdx !== this._nextIdx) {
      return true;
    }
    return false;
  }
  find(uri4, position2) {
    let idx = this._markers.findIndex((marker) => marker.resource.toString() === uri4.toString());
    if (idx < 0) {
      return void 0;
    }
    for (; idx < this._markers.length; idx++) {
      if (Range2.containsPosition(this._markers[idx], position2)) {
        return new MarkerCoordinate(this._markers[idx], idx + 1, this._markers.length);
      }
    }
    return void 0;
  }
};

MarkerList = __decorateClass([
  __decorateParam(1, IMarkerService),
  __decorateParam(2, IConfigurationService)
], MarkerList);

var IMarkerNavigationService = createDecorator("IMarkerNavigationService");

var MarkerNavigationService = class {
  constructor(_markerService, _configService) {
    this._markerService = _markerService;
    this._configService = _configService;
    this._provider = new LinkedList();
  }
  registerProvider(provider) {
    const remove2 = this._provider.unshift(provider);
    return toDisposable(() => remove2());
  }
  getMarkerList(resource) {
    for (const provider of this._provider) {
      const result = provider.getMarkerList(resource);
      if (result) {
        return result;
      }
    }
    return new MarkerList(resource, this._markerService, this._configService);
  }
};

MarkerNavigationService = __decorateClass([
  __decorateParam(0, IMarkerService),
  __decorateParam(1, IConfigurationService)
], MarkerNavigationService);

registerSingleton(IMarkerNavigationService, MarkerNavigationService, 1 /* Delayed */);
export { MarkerCoordinate, MarkerList, IMarkerNavigationService, MarkerNavigationService };
