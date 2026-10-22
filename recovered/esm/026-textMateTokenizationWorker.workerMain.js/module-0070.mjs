// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/services/textMate/browser/backgroundTokenization/worker/textMateTokenizationWorker.workerMain.js
// Original module marker: src/vs/editor/common/tokens/contiguousMultilineTokensBuilder.ts
import { readUInt32BE, writeUInt32BE } from "./module-0066.mjs";
import { ContiguousMultilineTokens } from "./module-0069.mjs";


// src/vs/editor/common/tokens/contiguousMultilineTokensBuilder.ts
var ContiguousMultilineTokensBuilder = class {
  static deserialize(buff) {
    let offset = 0;
    const count = readUInt32BE(buff, offset);
    offset += 4;
    const result = [];
    for (let i = 0; i < count; i++) {
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
    const size = this._serializeSize();
    const result = new Uint8Array(size);
    this._serialize(result);
    return result;
  }
  _serializeSize() {
    let result = 0;
    result += 4;
    for (let i = 0; i < this._tokens.length; i++) {
      result += this._tokens[i].serializeSize();
    }
    return result;
  }
  _serialize(destination) {
    let offset = 0;
    writeUInt32BE(destination, this._tokens.length, offset);
    offset += 4;
    for (let i = 0; i < this._tokens.length; i++) {
      offset = this._tokens[i].serialize(destination, offset);
    }
  }
};
export { ContiguousMultilineTokensBuilder };
