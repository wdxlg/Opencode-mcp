// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostTypes/snippetTextEdit.ts
import { Range2 } from "./module-0227.mjs";
import { SnippetString } from "./module-0233.mjs";


// src/vs/workbench/api/common/extHostTypes/snippetTextEdit.ts
var SnippetTextEdit = class _SnippetTextEdit {
  static isSnippetTextEdit(thing) {
    if (thing instanceof _SnippetTextEdit) {
      return true;
    }
    if (!thing) {
      return false;
    }
    return Range2.isRange(thing.range) && SnippetString.isSnippetString(thing.snippet);
  }
  static replace(range, snippet) {
    return new _SnippetTextEdit(range, snippet);
  }
  static insert(position, snippet) {
    return _SnippetTextEdit.replace(new Range2(position, position), snippet);
  }
  constructor(range, snippet) {
    this.range = range;
    this.snippet = snippet;
  }
};
export { SnippetTextEdit };
