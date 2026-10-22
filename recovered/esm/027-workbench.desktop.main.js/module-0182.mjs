// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/diff/defaultLinesDiffComputer/utils.ts



// src/vs/editor/common/diff/defaultLinesDiffComputer/utils.ts
var Array2D = class {
  constructor(width2, height) {
    this.width = width2;
    this.height = height;
    this.array = [];
    this.array = new Array(width2 * height);
  }
  get(x, y) {
    return this.array[x + y * this.width];
  }
  set(x, y, value2) {
    this.array[x + y * this.width] = value2;
  }
};

function isSpace(charCode) {
  return charCode === 32 /* Space */ || charCode === 9 /* Tab */;
}

var LineRangeFragment = class _LineRangeFragment {
  constructor(range2, lines, source) {
    this.range = range2;
    this.lines = lines;
    this.source = source;
    this.histogram = [];
    let counter = 0;
    for (let i2 = range2.startLineNumber - 1; i2 < range2.endLineNumberExclusive - 1; i2++) {
      const line = lines[i2];
      for (let j = 0; j < line.length; j++) {
        counter++;
        const chr = line[j];
        const key4 = _LineRangeFragment.getKey(chr);
        this.histogram[key4] = (this.histogram[key4] || 0) + 1;
      }
      counter++;
      const key3 = _LineRangeFragment.getKey("\n");
      this.histogram[key3] = (this.histogram[key3] || 0) + 1;
    }
    this.totalCount = counter;
  }
  static {
    this.chrKeys = /* @__PURE__ */ new Map();
  }
  static getKey(chr) {
    let key3 = this.chrKeys.get(chr);
    if (key3 === void 0) {
      key3 = this.chrKeys.size;
      this.chrKeys.set(chr, key3);
    }
    return key3;
  }
  computeSimilarity(other) {
    let sumDifferences = 0;
    const maxLength = Math.max(this.histogram.length, other.histogram.length);
    for (let i2 = 0; i2 < maxLength; i2++) {
      sumDifferences += Math.abs((this.histogram[i2] ?? 0) - (other.histogram[i2] ?? 0));
    }
    return 1 - sumDifferences / (this.totalCount + other.totalCount);
  }
};
export { isSpace, Array2D, LineRangeFragment };
