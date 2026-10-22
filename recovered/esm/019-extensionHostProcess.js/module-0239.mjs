// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/api/node/extensionHostProcess.js
// Original module marker: src/vs/workbench/api/common/extHostTypes/snippetString.ts
import { __decorateClass } from "./module-0000.mjs";
import { es5ClassCompat } from "./module-0230.mjs";


// src/vs/workbench/api/common/extHostTypes/snippetString.ts
var SnippetString = class {
  constructor(value) {
    this._tabstop = 1;
    this.value = value || "";
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
  static _escape(value) {
    return value.replace(/\$|}|\\/g, "\\$&");
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
  appendPlaceholder(value, number = this._tabstop++) {
    if (typeof value === "function") {
      const nested = new SnippetString();
      nested._tabstop = this._tabstop;
      value(nested);
      this._tabstop = nested._tabstop;
      value = nested.value;
    } else {
      value = SnippetString._escape(value);
    }
    this.value += "${";
    this.value += number;
    this.value += ":";
    this.value += value;
    this.value += "}";
    return this;
  }
  appendChoice(values, number = this._tabstop++) {
    const value = values.map((s) => s.replaceAll(/[|\\,]/g, "\\$&")).join(",");
    this.value += "${";
    this.value += number;
    this.value += "|";
    this.value += value;
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
