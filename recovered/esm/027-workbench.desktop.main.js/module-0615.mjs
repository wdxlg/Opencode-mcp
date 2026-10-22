// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/colorPicker/browser/colorPickerParts/colorPickerCloseButton.ts
import { $, EventType, addDisposableListener, append } from "./module-0075.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { ThemeIcon } from "./module-0086.mjs";
import { registerIcon } from "./module-0479.mjs";
import { Codicon } from "./module-0085.mjs";
import { localize } from "./module-0001.mjs";


// src/vs/editor/contrib/colorPicker/browser/colorPickerParts/colorPickerCloseButton.ts
var $11 = $;

var CloseButton = class extends Disposable {
  constructor(container3) {
    super();
    this._onClicked = this._register(new Emitter());
    this.onClicked = this._onClicked.event;
    this._button = document.createElement("div");
    this._button.classList.add("close-button");
    append(container3, this._button);
    const innerDiv = document.createElement("div");
    innerDiv.classList.add("close-button-inner-div");
    append(this._button, innerDiv);
    const closeButton = append(innerDiv, $11(".button" + ThemeIcon.asCSSSelector(registerIcon("color-picker-close", Codicon.close, localize(1058, null)))));
    closeButton.classList.add("close-icon");
    this._register(addDisposableListener(this._button, EventType.CLICK, () => {
      this._onClicked.fire();
    }));
  }
};
export { $11, CloseButton };
