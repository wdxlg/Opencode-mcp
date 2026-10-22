// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/services/keybinding/common/keybindingIO.ts
import { KeybindingParser } from "./module-1663.mjs";
import { ContextKeyExpr } from "./module-0089.mjs";


// src/vs/workbench/services/keybinding/common/keybindingIO.ts
var KeybindingIO = class {
  static writeKeybindingItem(out, item) {
    if (!item.resolvedKeybinding) {
      return;
    }
    const quotedSerializedKeybinding = JSON.stringify(item.resolvedKeybinding.getUserSettingsLabel());
    out.write(`{ "key": ${rightPaddedString(quotedSerializedKeybinding + ",", 25)} "command": `);
    const quotedSerializedWhen = item.when ? JSON.stringify(item.when.serialize()) : "";
    const quotedSerializeCommand = JSON.stringify(item.command);
    if (quotedSerializedWhen.length > 0) {
      out.write(`${quotedSerializeCommand},`);
      out.writeLine();
      out.write(`                                     "when": ${quotedSerializedWhen}`);
    } else {
      out.write(`${quotedSerializeCommand}`);
    }
    if (item.commandArgs) {
      out.write(",");
      out.writeLine();
      out.write(`                                     "args": ${JSON.stringify(item.commandArgs)}`);
    }
    if (item.systemWide) {
      out.write(",");
      out.writeLine();
      out.write(`                                     "systemWide": true`);
    }
    out.write(" }");
  }
  static readUserKeybindingItem(input) {
    const keybinding = "key" in input && typeof input.key === "string" ? KeybindingParser.parseKeybinding(input.key) : null;
    const when = "when" in input && typeof input.when === "string" ? ContextKeyExpr.deserialize(input.when) : void 0;
    const command4 = "command" in input && typeof input.command === "string" ? input.command : null;
    const commandArgs = "args" in input && typeof input.args !== "undefined" ? input.args : void 0;
    const systemWide = "systemWide" in input && typeof input.systemWide === "boolean" ? input.systemWide : false;
    return {
      keybinding,
      command: command4,
      commandArgs,
      when,
      systemWide,
      _sourceKey: "key" in input && typeof input.key === "string" ? input.key : void 0
    };
  }
};

function rightPaddedString(str, minChars) {
  if (str.length < minChars) {
    return str + new Array(minChars - str.length).join(" ");
  }
  return str;
}

var OutputBuilder = class {
  constructor() {
    this._lines = [];
    this._currentLine = "";
  }
  write(str) {
    this._currentLine += str;
  }
  writeLine(str = "") {
    this._lines.push(this._currentLine + str);
    this._currentLine = "";
  }
  toString() {
    this.writeLine();
    return this._lines.join("\n");
  }
};
export { rightPaddedString, KeybindingIO, OutputBuilder };
