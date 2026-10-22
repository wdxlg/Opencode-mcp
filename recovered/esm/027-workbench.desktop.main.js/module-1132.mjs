// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/mergeEditor/browser/model/editing.ts
import { equals } from "./module-0007.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/workbench/contrib/mergeEditor/browser/model/editing.ts
var LineRangeEdit = class {
  constructor(range2, newLines) {
    this.range = range2;
    this.newLines = newLines;
  }
  equals(other) {
    return this.range.equals(other.range) && equals(this.newLines, other.newLines);
  }
  toEdits(modelLineCount) {
    return new LineEdits([this]).toEdits(modelLineCount);
  }
};

var RangeEdit = class {
  constructor(range2, newText) {
    this.range = range2;
    this.newText = newText;
  }
  equals(other) {
    return Range2.equalsRange(this.range, other.range) && this.newText === other.newText;
  }
};

var LineEdits = class {
  constructor(edits) {
    this.edits = edits;
  }
  toEdits(modelLineCount) {
    return this.edits.map((e) => {
      if (e.range.endLineNumberExclusive <= modelLineCount) {
        return {
          range: new Range2(e.range.startLineNumber, 1, e.range.endLineNumberExclusive, 1),
          text: e.newLines.map((s) => s + "\n").join("")
        };
      }
      if (e.range.startLineNumber === 1) {
        return {
          range: new Range2(1, 1, modelLineCount, Number.MAX_SAFE_INTEGER),
          text: e.newLines.join("\n")
        };
      }
      return {
        range: new Range2(e.range.startLineNumber - 1, Number.MAX_SAFE_INTEGER, modelLineCount, Number.MAX_SAFE_INTEGER),
        text: e.newLines.map((s) => "\n" + s).join("")
      };
    });
  }
};
export { LineRangeEdit, RangeEdit, LineEdits };
