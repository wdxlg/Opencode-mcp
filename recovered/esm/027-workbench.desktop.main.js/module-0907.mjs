// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/api/common/extHostTypes/textEdit.ts
import { Range4 } from "./module-0898.mjs";
import { Position2 } from "./module-0897.mjs";
import { illegalArgument } from "./module-0004.mjs";
import { __decorateClass } from "./module-0000.mjs";
import { es5ClassCompat } from "./module-0895.mjs";


// src/vs/workbench/api/common/extHostTypes/textEdit.ts
var TextEdit3 = class {
  static isTextEdit(thing) {
    if (thing instanceof TextEdit3) {
      return true;
    }
    if (!thing || typeof thing !== "object") {
      return false;
    }
    return Range4.isRange(thing) && typeof thing.newText === "string";
  }
  static replace(range2, newText) {
    return new TextEdit3(range2, newText);
  }
  static insert(position2, newText) {
    return TextEdit3.replace(new Range4(position2, position2), newText);
  }
  static delete(range2) {
    return TextEdit3.replace(range2, "");
  }
  static setEndOfLine(eol) {
    const ret = new TextEdit3(new Range4(new Position2(0, 0), new Position2(0, 0)), "");
    ret.newEol = eol;
    return ret;
  }
  get range() {
    return this._range;
  }
  set range(value2) {
    if (value2 && !Range4.isRange(value2)) {
      throw illegalArgument("range");
    }
    this._range = value2;
  }
  get newText() {
    return this._newText || "";
  }
  set newText(value2) {
    if (value2 && typeof value2 !== "string") {
      throw illegalArgument("newText");
    }
    this._newText = value2;
  }
  get newEol() {
    return this._newEol;
  }
  set newEol(value2) {
    if (value2 && typeof value2 !== "number") {
      throw illegalArgument("newEol");
    }
    this._newEol = value2;
  }
  constructor(range2, newText) {
    this._range = range2;
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

TextEdit3 = __decorateClass([
  es5ClassCompat
], TextEdit3);
export { TextEdit3 };
