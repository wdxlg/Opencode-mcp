// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/worker/extensionHostWorkerMain.js
// Original module marker: src/vs/workbench/api/common/extHostTypes/textEdit.ts
import { Range2 } from "./module-0227.mjs";
import { Position2 } from "./module-0226.mjs";
import { illegalArgument } from "./module-0002.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { es5ClassCompat } from "./module-0224.mjs";


// src/vs/workbench/api/common/extHostTypes/textEdit.ts
var EndOfLine = /* @__PURE__ */ ((EndOfLine3) => {
  EndOfLine3[EndOfLine3["LF"] = 1] = "LF";
  EndOfLine3[EndOfLine3["CRLF"] = 2] = "CRLF";
  return EndOfLine3;
})(EndOfLine || {});

var TextEdit = class {
  static isTextEdit(thing) {
    if (thing instanceof TextEdit) {
      return true;
    }
    if (!thing || typeof thing !== "object") {
      return false;
    }
    return Range2.isRange(thing) && typeof thing.newText === "string";
  }
  static replace(range, newText) {
    return new TextEdit(range, newText);
  }
  static insert(position, newText) {
    return TextEdit.replace(new Range2(position, position), newText);
  }
  static delete(range) {
    return TextEdit.replace(range, "");
  }
  static setEndOfLine(eol) {
    const ret = new TextEdit(new Range2(new Position2(0, 0), new Position2(0, 0)), "");
    ret.newEol = eol;
    return ret;
  }
  get range() {
    return this._range;
  }
  set range(value) {
    if (value && !Range2.isRange(value)) {
      throw illegalArgument("range");
    }
    this._range = value;
  }
  get newText() {
    return this._newText || "";
  }
  set newText(value) {
    if (value && typeof value !== "string") {
      throw illegalArgument("newText");
    }
    this._newText = value;
  }
  get newEol() {
    return this._newEol;
  }
  set newEol(value) {
    if (value && typeof value !== "number") {
      throw illegalArgument("newEol");
    }
    this._newEol = value;
  }
  constructor(range, newText) {
    this._range = range;
    this._newText = newText;
  }
  toJSON() {
    return {
      range: this.range,
      newText: this.newText,
      newEol: this._newEol
    };
  }
};

TextEdit = __decorateClass([
  es5ClassCompat
], TextEdit);
export { EndOfLine, TextEdit };
