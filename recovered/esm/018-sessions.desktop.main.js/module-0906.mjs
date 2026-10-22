// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/workbench/api/common/extHostTypes/snippetString.ts
import { __decorateClass } from "./module-0000.mjs";
import { es5ClassCompat } from "./module-0897.mjs";


// src/vs/workbench/api/common/extHostTypes/snippetString.ts
var SnippetString = class {
  constructor(value2) {
    this._tabstop = 1;
    this.value = value2 || "";
  }
  static isSnippetString(thing) {
    if (thing instanceof SnippetString) {
      return true;
    }
    if (!thing || typeof thing !== "object") {
      return false;
    }
    return typeof thing.value === "string";
  }
  static _escape(value2) {
    return value2.replace(/\$|}|\\/g, "\\$&");
  }
  appendText(string) {
    this.value += SnippetString._escape(string);
    return this;
  }
  appendTabstop(number = this._tabstop++) {
    this.value += "$";
    this.value += number;
    return this;
  }
  appendPlaceholder(value2, number = this._tabstop++) {
    if (typeof value2 === "function") {
      const nested = new SnippetString();
      nested._tabstop = this._tabstop;
      value2(nested);
      this._tabstop = nested._tabstop;
      value2 = nested.value;
    } else {
      value2 = SnippetString._escape(value2);
    }
    this.value += "${";
    this.value += number;
    this.value += ":";
    this.value += value2;
    this.value += "}";
    return this;
  }
  appendChoice(values, number = this._tabstop++) {
    const value2 = values.map((s) => s.replaceAll(/[|\\,]/g, "\\$&")).join(",");
    this.value += "${";
    this.value += number;
    this.value += "|";
    this.value += value2;
    this.value += "|}";
    return this;
  }
  appendVariable(name, defaultValue) {
    if (typeof defaultValue === "function") {
      const nested = new SnippetString();
      nested._tabstop = this._tabstop;
      defaultValue(nested);
      this._tabstop = nested._tabstop;
      defaultValue = nested.value;
    } else if (typeof defaultValue === "string") {
      defaultValue = defaultValue.replace(/\$|}/g, "\\$&");
    }
    this.value += "${";
    this.value += name;
    if (defaultValue) {
      this.value += ":";
      this.value += defaultValue;
    }
    this.value += "}";
    return this;
  }
};

SnippetString = __decorateClass([
  es5ClassCompat
], SnippetString);
export { SnippetString };
