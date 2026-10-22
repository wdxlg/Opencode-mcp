// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/common/textModelGuides.ts



// src/vs/editor/common/textModelGuides.ts
var IndentGuide = class {
  constructor(visibleColumn, column, className2, horizontalLine, forWrappedLinesAfterColumn, forWrappedLinesBeforeOrAtColumn) {
    this.visibleColumn = visibleColumn;
    this.column = column;
    this.className = className2;
    this.horizontalLine = horizontalLine;
    this.forWrappedLinesAfterColumn = forWrappedLinesAfterColumn;
    this.forWrappedLinesBeforeOrAtColumn = forWrappedLinesBeforeOrAtColumn;
    if (visibleColumn !== -1 === (column !== -1)) {
      throw new Error();
    }
  }
};

var IndentGuideHorizontalLine = class {
  constructor(top2, endColumn) {
    this.top = top2;
    this.endColumn = endColumn;
  }
};
export { IndentGuide, IndentGuideHorizontalLine };
