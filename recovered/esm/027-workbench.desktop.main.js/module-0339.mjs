// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/browser/gpu/objectCollectionBuffer.ts
import { Disposable, dispose, toDisposable } from "./module-0012.mjs";
import { BufferDirtyTracker } from "./module-0338.mjs";
import { LinkedList } from "./module-0013.mjs";
import { Emitter, Event2 } from "./module-0017.mjs";


// src/vs/editor/browser/gpu/objectCollectionBuffer.ts
function createObjectCollectionBuffer(propertySpecs, capacity) {
  return new ObjectCollectionBuffer(propertySpecs, capacity);
}

var ObjectCollectionBuffer = class extends Disposable {
  constructor(propertySpecs, capacity) {
    super();
    this.propertySpecs = propertySpecs;
    this.capacity = capacity;
    this._dirtyTracker = new BufferDirtyTracker();
    this._propertySpecsMap = /* @__PURE__ */ new Map();
    this._entries = new LinkedList();
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._onDidChangeBuffer = this._register(new Emitter());
    this.onDidChangeBuffer = this._onDidChangeBuffer.event;
    this.view = new Float32Array(capacity * propertySpecs.length);
    this.buffer = this.view.buffer;
    this._entrySize = propertySpecs.length;
    for (let i2 = 0; i2 < propertySpecs.length; i2++) {
      const spec = {
        offset: i2,
        ...propertySpecs[i2]
      };
      this._propertySpecsMap.set(spec.name, spec);
    }
    this._register(toDisposable(() => dispose(this._entries)));
  }
  get bufferUsedSize() {
    return this.viewUsedSize * Float32Array.BYTES_PER_ELEMENT;
  }
  get viewUsedSize() {
    return this._entries.size * this._entrySize;
  }
  get entryCount() {
    return this._entries.size;
  }
  get dirtyTracker() {
    return this._dirtyTracker;
  }
  createEntry(data) {
    if (this._entries.size === this.capacity) {
      this._expandBuffer();
      this._onDidChangeBuffer.fire();
    }
    const value2 = new ObjectCollectionBufferEntry(this.view, this._propertySpecsMap, this._dirtyTracker, this._entries.size, data);
    const removeFromEntries = this._entries.push(value2);
    const listeners = [];
    listeners.push(Event2.forward(value2.onDidChange, this._onDidChange));
    listeners.push(value2.onWillDispose(() => {
      const deletedEntryIndex = value2.i;
      removeFromEntries();
      this.view.set(this.view.subarray(deletedEntryIndex * this._entrySize + 2, this._entries.size * this._entrySize + 2), deletedEntryIndex * this._entrySize);
      for (const entry of this._entries) {
        if (entry.i > deletedEntryIndex) {
          entry.i--;
        }
      }
      this._dirtyTracker.flag(deletedEntryIndex, (this._entries.size - deletedEntryIndex) * this._entrySize);
      dispose(listeners);
    }));
    return value2;
  }
  _expandBuffer() {
    this.capacity *= 2;
    const newView = new Float32Array(this.capacity * this._entrySize);
    newView.set(this.view);
    this.view = newView;
    this.buffer = this.view.buffer;
  }
};

var ObjectCollectionBufferEntry = class extends Disposable {
  constructor(_view, _propertySpecsMap, _dirtyTracker, i2, data) {
    super();
    this._view = _view;
    this._propertySpecsMap = _propertySpecsMap;
    this._dirtyTracker = _dirtyTracker;
    this.i = i2;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._onWillDispose = this._register(new Emitter());
    this.onWillDispose = this._onWillDispose.event;
    for (const propertySpec of this._propertySpecsMap.values()) {
      this._view[this.i * this._propertySpecsMap.size + propertySpec.offset] = data[propertySpec.name];
    }
    this._dirtyTracker.flag(this.i * this._propertySpecsMap.size, this._propertySpecsMap.size);
  }
  dispose() {
    this._onWillDispose.fire();
    super.dispose();
  }
  set(propertyName, value2) {
    const i2 = this.i * this._propertySpecsMap.size + this._propertySpecsMap.get(propertyName).offset;
    this._view[this._dirtyTracker.flag(i2)] = value2;
    this._onDidChange.fire();
  }
  get(propertyName) {
    return this._view[this.i * this._propertySpecsMap.size + this._propertySpecsMap.get(propertyName).offset];
  }
  setRaw(data) {
    if (data.length !== this._propertySpecsMap.size) {
      throw new Error(`Data length ${data.length} does not match the number of properties in the collection (${this._propertySpecsMap.size})`);
    }
    this._view.set(data, this.i * this._propertySpecsMap.size);
    this._dirtyTracker.flag(this.i * this._propertySpecsMap.size, this._propertySpecsMap.size);
  }
};
export { createObjectCollectionBuffer, ObjectCollectionBuffer, ObjectCollectionBufferEntry };
