// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/gpu/bufferDirtyTracker.ts



// src/vs/editor/browser/gpu/bufferDirtyTracker.ts
var BufferDirtyTracker = class {
  get dataOffset() {
    return this._startIndex;
  }
  get dirtySize() {
    if (this._startIndex === void 0 || this._endIndex === void 0) {
      return void 0;
    }
    return this._endIndex - this._startIndex + 1;
  }
  get isDirty() {
    return this._startIndex !== void 0;
  }
  /**
   * Flag the index(es) as modified. Returns the index flagged.
   * @param index An index to flag.
   * @param length An optional length to flag. Defaults to 1.
   */
  flag(index2, length = 1) {
    this._flag(index2);
    if (length > 1) {
      this._flag(index2 + length - 1);
    }
    return index2;
  }
  _flag(index2) {
    if (this._startIndex === void 0 || index2 < this._startIndex) {
      this._startIndex = index2;
    }
    if (this._endIndex === void 0 || index2 > this._endIndex) {
      this._endIndex = index2;
    }
  }
  clear() {
    this._startIndex = void 0;
    this._endIndex = void 0;
  }
};
export { BufferDirtyTracker };
