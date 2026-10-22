// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/colorPicker/browser/colorPickerWidget.ts
import { $, getWindow } from "./module-0075.mjs";
import { Widget } from "./module-0252.mjs";
import { PixelRatio } from "./module-0215.mjs";
import { ColorPickerHeader } from "./module-0616.mjs";
import { ColorPickerBody } from "./module-0614.mjs";


// src/vs/editor/contrib/colorPicker/browser/colorPickerWidget.ts
var $13 = $;

var ColorPickerWidget = class _ColorPickerWidget extends Widget {
  constructor(container2, model, pixelRatio, themeService, type) {
    super();
    this.model = model;
    this.pixelRatio = pixelRatio;
    this._register(PixelRatio.getInstance(getWindow(container2)).onDidChange(() => this.layout()));
    this._domNode = $13(".colorpicker-widget");
    container2.appendChild(this._domNode);
    this.header = this._register(new ColorPickerHeader(this._domNode, this.model, themeService, type));
    this.body = this._register(new ColorPickerBody(this._domNode, this.model, this.pixelRatio, type));
  }
  static {
    this.ID = "editor.contrib.colorPickerWidget";
  }
  getId() {
    return _ColorPickerWidget.ID;
  }
  layout() {
    this.body.layout();
  }
  get domNode() {
    return this._domNode;
  }
};
export { $13, ColorPickerWidget };
