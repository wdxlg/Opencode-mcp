// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/contrib/notebook/common/services/notebookWebWorkerMain.js
// Original module marker: src/vs/editor/common/core/textChange.ts
import { readUInt32BE, writeUInt16LE, writeUInt32BE } from "./module-0023.mjs";
import { decodeUTF16LE } from "./module-0039.mjs";


// src/vs/editor/common/core/textChange.ts
function escapeNewLine(str) {
  return str.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
}

var TextChange = class _TextChange {
  constructor(oldPosition, oldText, newPosition, newText) {
    this.oldPosition = oldPosition;
    this.oldText = oldText;
    this.newPosition = newPosition;
    this.newText = newText;
  }
  get oldLength() {
    return this.oldText.length;
  }
  get oldEnd() {
    return this.oldPosition + this.oldText.length;
  }
  get newLength() {
    return this.newText.length;
  }
  get newEnd() {
    return this.newPosition + this.newText.length;
  }
  toString() {
    if (this.oldText.length === 0) {
      return `(insert@${this.oldPosition} "${escapeNewLine(this.newText)}")`;
    }
    if (this.newText.length === 0) {
      return `(delete@${this.oldPosition} "${escapeNewLine(this.oldText)}")`;
    }
    return `(replace@${this.oldPosition} "${escapeNewLine(this.oldText)}" with "${escapeNewLine(this.newText)}")`;
  }
  static _writeStringSize(str) {
    return 4 + 2 * str.length;
  }
  static _writeString(b, str, offset) {
    const len = str.length;
    writeUInt32BE(b, len, offset);
    offset += 4;
    for (let i = 0; i < len; i++) {
      writeUInt16LE(b, str.charCodeAt(i), offset);
      offset += 2;
    }
    return offset;
  }
  static _readString(b, offset) {
    const len = readUInt32BE(b, offset);
    offset += 4;
    return decodeUTF16LE(b, offset, len);
  }
  writeSize() {
    return 4 + 4 + _TextChange._writeStringSize(this.oldText) + _TextChange._writeStringSize(this.newText);
  }
  write(b, offset) {
    writeUInt32BE(b, this.oldPosition, offset);
    offset += 4;
    writeUInt32BE(b, this.newPosition, offset);
    offset += 4;
    offset = _TextChange._writeString(b, this.oldText, offset);
    offset = _TextChange._writeString(b, this.newText, offset);
    return offset;
  }
  static read(b, offset, dest) {
    const oldPosition = readUInt32BE(b, offset);
    offset += 4;
    const newPosition = readUInt32BE(b, offset);
    offset += 4;
    const oldText = _TextChange._readString(b, offset);
    offset += _TextChange._writeStringSize(oldText);
    const newText = _TextChange._readString(b, offset);
    offset += _TextChange._writeStringSize(newText);
    dest.push(new _TextChange(oldPosition, oldText, newPosition, newText));
    return offset;
  }
};
export { escapeNewLine, TextChange };
