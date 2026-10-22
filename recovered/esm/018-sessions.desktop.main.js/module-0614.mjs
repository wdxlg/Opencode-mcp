// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/colorPicker/browser/colorPickerParts/colorPickerBody.ts
import { $, append } from "./module-0075.mjs";
import { Disposable } from "./module-0012.mjs";
import { SaturationBox } from "./module-0609.mjs";
import { HueStrip, OpacityStrip } from "./module-0613.mjs";
import { InsertButton } from "./module-0610.mjs";
import { Color, HSVA } from "./module-0197.mjs";


// src/vs/editor/contrib/colorPicker/browser/colorPickerParts/colorPickerBody.ts
var $10 = $;

var ColorPickerBody = class extends Disposable {
  constructor(container2, model, pixelRatio, type) {
    super();
    this.model = model;
    this.pixelRatio = pixelRatio;
    this._insertButton = null;
    this._domNode = $10(".colorpicker-body");
    append(container2, this._domNode);
    this._saturationBox = new SaturationBox(this._domNode, this.model, this.pixelRatio);
    this._register(this._saturationBox);
    this._register(this._saturationBox.onDidChange(this.onDidSaturationValueChange, this));
    this._register(this._saturationBox.onColorFlushed(this.flushColor, this));
    this._opacityStrip = new OpacityStrip(this._domNode, this.model, type);
    this._register(this._opacityStrip);
    this._register(this._opacityStrip.onDidChange(this.onDidOpacityChange, this));
    this._register(this._opacityStrip.onColorFlushed(this.flushColor, this));
    this._hueStrip = new HueStrip(this._domNode, this.model, type);
    this._register(this._hueStrip);
    this._register(this._hueStrip.onDidChange(this.onDidHueChange, this));
    this._register(this._hueStrip.onColorFlushed(this.flushColor, this));
    if (type === "standalone" /* Standalone */) {
      this._insertButton = this._register(new InsertButton(this._domNode));
      this._domNode.classList.add("standalone-colorpicker");
    }
  }
  flushColor() {
    this.model.flushColor();
  }
  onDidSaturationValueChange({ s, v: v2 }) {
    const hsva = this.model.color.hsva;
    this.model.color = new Color(new HSVA(hsva.h, s, v2, hsva.a));
  }
  onDidOpacityChange(a) {
    const hsva = this.model.color.hsva;
    this.model.color = new Color(new HSVA(hsva.h, hsva.s, hsva.v, a));
  }
  onDidHueChange(value2) {
    const hsva = this.model.color.hsva;
    const h3 = (1 - value2) * 360;
    this.model.color = new Color(new HSVA(h3 === 360 ? 0 : h3, hsva.s, hsva.v, hsva.a));
  }
  get domNode() {
    return this._domNode;
  }
  get saturationBox() {
    return this._saturationBox;
  }
  get opacityStrip() {
    return this._opacityStrip;
  }
  get hueStrip() {
    return this._hueStrip;
  }
  get enterButton() {
    return this._insertButton;
  }
  layout() {
    this._saturationBox.layout();
    this._opacityStrip.layout();
    this._hueStrip.layout();
  }
};
export { $10, ColorPickerBody };
