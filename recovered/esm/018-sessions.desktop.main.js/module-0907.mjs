// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/common/extHostTypes/snippetTextEdit.ts
import { Range4 } from "./module-0900.mjs";
import { SnippetString } from "./module-0906.mjs";


// src/vs/workbench/api/common/extHostTypes/snippetTextEdit.ts
var SnippetTextEdit = class _SnippetTextEdit {
  static isSnippetTextEdit(thing) {
    if (thing instanceof _SnippetTextEdit) {
      return true;
    }
    if (!thing) {
      return false;
    }
    return Range4.isRange(thing.range) && SnippetString.isSnippetString(thing.snippet);
  }
  static replace(range2, snippet) {
    return new _SnippetTextEdit(range2, snippet);
  }
  static insert(position2, snippet) {
    return _SnippetTextEdit.replace(new Range4(position2, position2), snippet);
  }
  constructor(range2, snippet) {
    this.range = range2;
    this.snippet = snippet;
  }
};
export { SnippetTextEdit };
