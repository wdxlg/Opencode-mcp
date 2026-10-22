// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/platform/terminal/common/capabilities/bufferMarkCapability.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/platform/terminal/common/capabilities/bufferMarkCapability.ts
var BufferMarkCapability = class extends Disposable {
  constructor(_terminal) {
    super();
    this._terminal = _terminal;
    this.type = 4 /* BufferMarkDetection */;
    this._idToMarkerMap = /* @__PURE__ */ new Map();
    this._anonymousMarkers = /* @__PURE__ */ new Map();
    this._onMarkAdded = this._register(new Emitter());
    this.onMarkAdded = this._onMarkAdded.event;
  }
  *markers() {
    for (const m of this._idToMarkerMap.values()) {
      yield m;
    }
    for (const m of this._anonymousMarkers.values()) {
      yield m;
    }
  }
  addMark(properties) {
    const marker = properties?.marker || this._terminal.registerMarker();
    const id2 = properties?.id;
    if (!marker) {
      return;
    }
    if (id2) {
      this._idToMarkerMap.set(id2, marker);
      marker.onDispose(() => this._idToMarkerMap.delete(id2));
    } else {
      this._anonymousMarkers.set(marker.id, marker);
      marker.onDispose(() => this._anonymousMarkers.delete(marker.id));
    }
    this._onMarkAdded.fire({ marker, id: id2, hidden: properties?.hidden, hoverMessage: properties?.hoverMessage });
  }
  getMark(id2) {
    return this._idToMarkerMap.get(id2);
  }
};
export { BufferMarkCapability };
