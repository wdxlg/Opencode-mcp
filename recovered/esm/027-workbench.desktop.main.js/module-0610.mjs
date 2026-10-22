// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/colorPicker/browser/colorPickerParts/colorPickerInsertButton.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { EventType, addDisposableListener, append } from "./module-0075.mjs";


// src/vs/editor/contrib/colorPicker/browser/colorPickerParts/colorPickerInsertButton.ts
var InsertButton = class extends Disposable {
  constructor(container3) {
    super();
    this._onClicked = this._register(new Emitter());
    this.onClicked = this._onClicked.event;
    this._button = append(container3, document.createElement("button"));
    this._button.classList.add("insert-button");
    this._button.textContent = "Insert";
    this._register(addDisposableListener(this._button, EventType.CLICK, () => {
      this._onClicked.fire();
    }));
  }
  get button() {
    return this._button;
  }
};
export { InsertButton };
