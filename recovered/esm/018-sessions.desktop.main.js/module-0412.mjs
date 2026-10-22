// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/tokens/contiguousMultilineTokensBuilder.ts
import { readUInt32BE, writeUInt32BE } from "./module-0038.mjs";
import { ContiguousMultilineTokens } from "./module-0411.mjs";


// src/vs/editor/common/tokens/contiguousMultilineTokensBuilder.ts
var ContiguousMultilineTokensBuilder = class {
  static deserialize(buff) {
    let offset = 0;
    const count2 = readUInt32BE(buff, offset);
    offset += 4;
    const result = [];
    for (let i2 = 0; i2 < count2; i2++) {
      offset = ContiguousMultilineTokens.deserialize(buff, offset, result);
    }
    return result;
  }
  constructor() {
    this._tokens = [];
  }
  add(lineNumber, lineTokens) {
    if (this._tokens.length > 0) {
      const last = this._tokens[this._tokens.length - 1];
      if (last.endLineNumber + 1 === lineNumber) {
        last.appendLineTokens(lineTokens);
        return;
      }
    }
    this._tokens.push(new ContiguousMultilineTokens(lineNumber, [lineTokens]));
  }
  finalize() {
    return this._tokens;
  }
  serialize() {
    const size3 = this._serializeSize();
    const result = new Uint8Array(size3);
    this._serialize(result);
    return result;
  }
  _serializeSize() {
    let result = 0;
    result += 4;
    for (let i2 = 0; i2 < this._tokens.length; i2++) {
      result += this._tokens[i2].serializeSize();
    }
    return result;
  }
  _serialize(destination) {
    let offset = 0;
    writeUInt32BE(destination, this._tokens.length, offset);
    offset += 4;
    for (let i2 = 0; i2 < this._tokens.length; i2++) {
      offset = this._tokens[i2].serialize(destination, offset);
    }
  }
};
export { ContiguousMultilineTokensBuilder };
