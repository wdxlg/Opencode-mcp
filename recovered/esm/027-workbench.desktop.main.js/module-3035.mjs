// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/testing/common/testingDecorations.ts
import { binarySearch } from "./module-0007.mjs";
import { createDecorator } from "./module-0077.mjs";


// src/vs/workbench/contrib/testing/common/testingDecorations.ts
var TestDecorations = class {
  constructor() {
    this.value = [];
  }
  /**
   * Adds a new value to the decorations.
   */
  push(value2) {
    const searchIndex = binarySearch(this.value, value2, (a, b) => a.line - b.line);
    this.value.splice(searchIndex < 0 ? ~searchIndex : searchIndex, 0, value2);
  }
  /**
   * Gets decorations on each line.
   */
  *lines() {
    if (!this.value.length) {
      return;
    }
    let startIndex = 0;
    let startLine = this.value[0].line;
    for (let i2 = 1; i2 < this.value.length; i2++) {
      const v2 = this.value[i2];
      if (v2.line !== startLine) {
        yield [startLine, this.value.slice(startIndex, i2)];
        startLine = v2.line;
        startIndex = i2;
      }
    }
    yield [startLine, this.value.slice(startIndex)];
  }
};

var ITestingDecorationsService = createDecorator("testingDecorationService");
export { TestDecorations, ITestingDecorationsService };
