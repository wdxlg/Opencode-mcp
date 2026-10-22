// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/common/model/fixedArray.ts
import { arrayInsert } from "./module-0007.mjs";


// src/vs/editor/common/model/fixedArray.ts
var FixedArray = class {
  constructor(_default) {
    this._default = _default;
    this._store = [];
  }
  get(index2) {
    if (index2 < this._store.length) {
      return this._store[index2];
    }
    return this._default;
  }
  set(index2, value2) {
    while (index2 >= this._store.length) {
      this._store[this._store.length] = this._default;
    }
    this._store[index2] = value2;
  }
  replace(index2, oldLength, newLength) {
    if (index2 >= this._store.length) {
      return;
    }
    if (oldLength === 0) {
      this.insert(index2, newLength);
      return;
    } else if (newLength === 0) {
      this.delete(index2, oldLength);
      return;
    }
    const before = this._store.slice(0, index2);
    const after2 = this._store.slice(index2 + oldLength);
    const insertArr = arrayFill(newLength, this._default);
    this._store = before.concat(insertArr, after2);
  }
  delete(deleteIndex, deleteCount) {
    if (deleteCount === 0 || deleteIndex >= this._store.length) {
      return;
    }
    this._store.splice(deleteIndex, deleteCount);
  }
  insert(insertIndex, insertCount) {
    if (insertCount === 0 || insertIndex >= this._store.length) {
      return;
    }
    const arr = [];
    for (let i2 = 0; i2 < insertCount; i2++) {
      arr[i2] = this._default;
    }
    this._store = arrayInsert(this._store, insertIndex, arr);
  }
};

function arrayFill(length, value2) {
  const arr = [];
  for (let i2 = 0; i2 < length; i2++) {
    arr[i2] = value2;
  }
  return arr;
}
export { arrayFill, FixedArray };
