// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/hover/browser/hoverTypes.ts



// src/vs/editor/contrib/hover/browser/hoverTypes.ts
var HoverRangeAnchor = class {
  constructor(priority, range2, initialMousePosX, initialMousePosY) {
    this.priority = priority;
    this.range = range2;
    this.initialMousePosX = initialMousePosX;
    this.initialMousePosY = initialMousePosY;
    this.type = 1 /* Range */;
  }
  equals(other) {
    return other.type === 1 /* Range */ && this.range.equalsRange(other.range);
  }
  canAdoptVisibleHover(lastAnchor, showAtPosition) {
    return lastAnchor.type === 1 /* Range */ && showAtPosition.lineNumber === this.range.startLineNumber;
  }
};

var HoverForeignElementAnchor = class {
  constructor(priority, owner, range2, initialMousePosX, initialMousePosY, supportsMarkerHover) {
    this.priority = priority;
    this.owner = owner;
    this.range = range2;
    this.initialMousePosX = initialMousePosX;
    this.initialMousePosY = initialMousePosY;
    this.supportsMarkerHover = supportsMarkerHover;
    this.type = 2 /* ForeignElement */;
  }
  equals(other) {
    return other.type === 2 /* ForeignElement */ && this.owner === other.owner;
  }
  canAdoptVisibleHover(lastAnchor, showAtPosition) {
    return lastAnchor.type === 2 /* ForeignElement */ && this.owner === lastAnchor.owner;
  }
};

var RenderedHoverParts = class {
  constructor(renderedHoverParts, disposables) {
    this.renderedHoverParts = renderedHoverParts;
    this.disposables = disposables;
  }
  dispose() {
    for (const part of this.renderedHoverParts) {
      part.dispose();
    }
    this.disposables?.dispose();
  }
};

var HoverParticipantRegistry = new class HoverParticipantRegistry2 {
  constructor() {
    this._participants = [];
  }
  register(ctor) {
    this._participants.push(ctor);
  }
  getAll() {
    return this._participants;
  }
}();
export { HoverRangeAnchor, HoverForeignElementAnchor, RenderedHoverParts, HoverParticipantRegistry };
