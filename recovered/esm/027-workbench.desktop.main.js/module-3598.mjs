// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/workbench/contrib/outline/browser/outlineViewState.ts
import { Emitter } from "./module-0017.mjs";


// src/vs/workbench/contrib/outline/browser/outlineViewState.ts
var OutlineViewState = class {
  constructor() {
    this._followCursor = false;
    this._filterOnType = true;
    this._sortBy = 0 /* ByPosition */;
    this._onDidChange = new Emitter();
    this.onDidChange = this._onDidChange.event;
  }
  dispose() {
    this._onDidChange.dispose();
  }
  set followCursor(value2) {
    if (value2 !== this._followCursor) {
      this._followCursor = value2;
      this._onDidChange.fire({ followCursor: true });
    }
  }
  get followCursor() {
    return this._followCursor;
  }
  get filterOnType() {
    return this._filterOnType;
  }
  set filterOnType(value2) {
    if (value2 !== this._filterOnType) {
      this._filterOnType = value2;
      this._onDidChange.fire({ filterOnType: true });
    }
  }
  set sortBy(value2) {
    if (value2 !== this._sortBy) {
      this._sortBy = value2;
      this._onDidChange.fire({ sortBy: true });
    }
  }
  get sortBy() {
    return this._sortBy;
  }
  persist(storageService) {
    storageService.store("outline/state", JSON.stringify({
      followCursor: this.followCursor,
      sortBy: this.sortBy,
      filterOnType: this.filterOnType
    }), 1 /* WORKSPACE */, 1 /* MACHINE */);
  }
  restore(storageService) {
    const raw = storageService.get("outline/state", 1 /* WORKSPACE */);
    if (!raw) {
      return;
    }
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      return;
    }
    this.followCursor = data.followCursor;
    this.sortBy = data.sortBy ?? 0 /* ByPosition */;
    if (typeof data.filterOnType === "boolean") {
      this.filterOnType = data.filterOnType;
    }
  }
};
export { OutlineViewState };
