// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/viewModel/glyphLanesModel.ts



// src/vs/editor/common/viewModel/glyphLanesModel.ts
var MAX_LANE = 3 /* Right */;

var GlyphMarginLanesModel = class {
  // always render at least one lane
  constructor(maxLine) {
    this.persist = 0;
    this._requiredLanes = 1;
    this.lanes = new Uint8Array(Math.ceil((maxLine + 1) * MAX_LANE / 8));
  }
  reset(maxLine) {
    const bytes = Math.ceil((maxLine + 1) * MAX_LANE / 8);
    if (this.lanes.length < bytes) {
      this.lanes = new Uint8Array(bytes);
    } else {
      this.lanes.fill(0);
    }
    this._requiredLanes = 1;
  }
  get requiredLanes() {
    return this._requiredLanes;
  }
  push(lane, range2, persist) {
    if (persist) {
      this.persist |= 1 << lane - 1;
    }
    for (let i2 = range2.startLineNumber; i2 <= range2.endLineNumber; i2++) {
      const bit = MAX_LANE * i2 + (lane - 1);
      this.lanes[bit >>> 3] |= 1 << bit % 8;
      this._requiredLanes = Math.max(this._requiredLanes, this.countAtLine(i2));
    }
  }
  getLanesAtLine(lineNumber) {
    const lanes = [];
    let bit = MAX_LANE * lineNumber;
    for (let i2 = 0; i2 < MAX_LANE; i2++) {
      if (this.persist & 1 << i2 || this.lanes[bit >>> 3] & 1 << bit % 8) {
        lanes.push(i2 + 1);
      }
      bit++;
    }
    return lanes.length ? lanes : [2 /* Center */];
  }
  countAtLine(lineNumber) {
    let bit = MAX_LANE * lineNumber;
    let count2 = 0;
    for (let i2 = 0; i2 < MAX_LANE; i2++) {
      if (this.persist & 1 << i2 || this.lanes[bit >>> 3] & 1 << bit % 8) {
        count2++;
      }
      bit++;
    }
    return count2;
  }
};
export { MAX_LANE, GlyphMarginLanesModel };
