// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/diffWorkerMain.js
// Original module marker: src/vs/editor/common/diff/linesDiffComputer.ts



// src/vs/editor/common/diff/linesDiffComputer.ts
var LinesDiff = class {
  constructor(changes, moves, hitTimeout) {
    this.changes = changes;
    this.moves = moves;
    this.hitTimeout = hitTimeout;
  }
};

var MovedText = class _MovedText {
  constructor(lineRangeMapping, changes) {
    this.lineRangeMapping = lineRangeMapping;
    this.changes = changes;
  }
  flip() {
    return new _MovedText(this.lineRangeMapping.flip(), this.changes.map((c) => c.flip()));
  }
};
export { LinesDiff, MovedText };
