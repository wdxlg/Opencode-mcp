// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/platform/quickinput/browser/tree/quickInputTreeSorter.ts
import { Disposable } from "./module-0012.mjs";


// src/vs/platform/quickinput/browser/tree/quickInputTreeSorter.ts
var QuickInputTreeSorter = class extends Disposable {
  constructor() {
    super(...arguments);
    this._sortByLabel = true;
  }
  get sortByLabel() {
    return this._sortByLabel;
  }
  set sortByLabel(value2) {
    this._sortByLabel = value2;
  }
  compare(a, b) {
    if (!this._sortByLabel) {
      return 0;
    }
    if (a.label < b.label) {
      return -1;
    } else if (a.label > b.label) {
      return 1;
    }
    if (a.description && b.description) {
      if (a.description < b.description) {
        return -1;
      } else if (a.description > b.description) {
        return 1;
      }
    } else if (a.description) {
      return -1;
    } else if (b.description) {
      return 1;
    }
    return 0;
  }
};
export { QuickInputTreeSorter };
