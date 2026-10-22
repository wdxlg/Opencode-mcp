// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/core/editOperation.ts
import { Range2 } from "./module-0106.mjs";


// src/vs/editor/common/core/editOperation.ts
var EditOperation = class {
  static insert(position2, text2) {
    return {
      range: new Range2(position2.lineNumber, position2.column, position2.lineNumber, position2.column),
      text: text2,
      forceMoveMarkers: true
    };
  }
  static delete(range2) {
    return {
      range: range2,
      text: null
    };
  }
  static replace(range2, text2) {
    return {
      range: range2,
      text: text2
    };
  }
  static replaceMove(range2, text2) {
    return {
      range: range2,
      text: text2,
      forceMoveMarkers: true
    };
  }
};
export { EditOperation };
