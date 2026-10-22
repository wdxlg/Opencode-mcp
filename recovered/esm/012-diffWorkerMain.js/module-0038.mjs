// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/platform/agentHost/node/diffWorkerMain.js
// Original module marker: src/vs/editor/common/diff/defaultLinesDiffComputer/lineSequence.ts



// src/vs/editor/common/diff/defaultLinesDiffComputer/lineSequence.ts
var LineSequence = class {
  constructor(trimmedHash, lines) {
    this.trimmedHash = trimmedHash;
    this.lines = lines;
  }
  getElement(offset) {
    return this.trimmedHash[offset];
  }
  get length() {
    return this.trimmedHash.length;
  }
  getBoundaryScore(length) {
    const indentationBefore = length === 0 ? 0 : getIndentation(this.lines[length - 1]);
    const indentationAfter = length === this.lines.length ? 0 : getIndentation(this.lines[length]);
    return 1e3 - (indentationBefore + indentationAfter);
  }
  getText(range) {
    return this.lines.slice(range.start, range.endExclusive).join("\n");
  }
  isStronglyEqual(offset1, offset2) {
    return this.lines[offset1] === this.lines[offset2];
  }
};

function getIndentation(str) {
  let i = 0;
  while (i < str.length && (str.charCodeAt(i) === 32 /* Space */ || str.charCodeAt(i) === 9 /* Tab */)) {
    i++;
  }
  return i;
}
export { getIndentation, LineSequence };
