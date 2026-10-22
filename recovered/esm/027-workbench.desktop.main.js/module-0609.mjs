// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/colorPicker/browser/colorPickerParts/colorPickerSaturationBox.ts
import { $, EventType, addDisposableListener, append, getDomNodePagePosition } from "./module-0075.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { GlobalPointerMoveMonitor } from "./module-0225.mjs";
import { Color, HSVA } from "./module-0197.mjs";


// src/vs/editor/contrib/colorPicker/browser/colorPickerParts/colorPickerSaturationBox.ts
var $8 = $;

var SaturationBox = class extends Disposable {
  constructor(container3, model, pixelRatio) {
    super();
    this.model = model;
    this.pixelRatio = pixelRatio;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._onColorFlushed = this._register(new Emitter());
    this.onColorFlushed = this._onColorFlushed.event;
    this._domNode = $8(".saturation-wrap");
    append(container3, this._domNode);
    this._canvas = document.createElement("canvas");
    this._canvas.className = "saturation-box";
    append(this._domNode, this._canvas);
    this.selection = $8(".saturation-selection");
    append(this._domNode, this.selection);
    this.layout();
    this._register(addDisposableListener(this._domNode, EventType.POINTER_DOWN, (e) => this.onPointerDown(e)));
    this._register(this.model.onDidChangeColor(this.onDidChangeColor, this));
    this.monitor = null;
  }
  get domNode() {
    return this._domNode;
  }
  onPointerDown(e) {
    if (!e.target || !(e.target instanceof Element)) {
      return;
    }
    this.monitor = this._register(new GlobalPointerMoveMonitor());
    const origin = getDomNodePagePosition(this._domNode);
    if (e.target !== this.selection) {
      this.onDidChangePosition(e.offsetX, e.offsetY);
    }
    this.monitor.startMonitoring(e.target, e.pointerId, e.buttons, (event) => this.onDidChangePosition(event.pageX - origin.left, event.pageY - origin.top), () => null);
    const pointerUpListener = addDisposableListener(e.target.ownerDocument, EventType.POINTER_UP, () => {
      this._onColorFlushed.fire();
      pointerUpListener.dispose();
      if (this.monitor) {
        this.monitor.stopMonitoring(true);
        this.monitor = null;
      }
    }, true);
  }
  onDidChangePosition(left, top2) {
    const s = Math.max(0, Math.min(1, left / this.width));
    const v2 = Math.max(0, Math.min(1, 1 - top2 / this.height));
    this.paintSelection(s, v2);
    this._onDidChange.fire({ s, v: v2 });
  }
  layout() {
    this.width = this._domNode.offsetWidth;
    this.height = this._domNode.offsetHeight;
    this._canvas.width = this.width * this.pixelRatio;
    this._canvas.height = this.height * this.pixelRatio;
    this.paint();
    const hsva = this.model.color.hsva;
    this.paintSelection(hsva.s, hsva.v);
  }
  paint() {
    const hsva = this.model.color.hsva;
    const saturatedColor = new Color(new HSVA(hsva.h, 1, 1, 1));
    const ctx = this._canvas.getContext("2d");
    const whiteGradient = ctx.createLinearGradient(0, 0, this._canvas.width, 0);
    whiteGradient.addColorStop(0, "rgba(255, 255, 255, 1)");
    whiteGradient.addColorStop(0.5, "rgba(255, 255, 255, 0.5)");
    whiteGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    const blackGradient = ctx.createLinearGradient(0, 0, 0, this._canvas.height);
    blackGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    blackGradient.addColorStop(1, "rgba(0, 0, 0, 1)");
    ctx.rect(0, 0, this._canvas.width, this._canvas.height);
    ctx.fillStyle = Color.Format.CSS.format(saturatedColor);
    ctx.fill();
    ctx.fillStyle = whiteGradient;
    ctx.fill();
    ctx.fillStyle = blackGradient;
    ctx.fill();
  }
  paintSelection(s, v2) {
    this.selection.style.left = `${s * this.width}px`;
    this.selection.style.top = `${this.height - v2 * this.height}px`;
  }
  onDidChangeColor(color2) {
    if (this.monitor && this.monitor.isMonitoring()) {
      return;
    }
    this.paint();
    const hsva = color2.hsva;
    this.paintSelection(hsva.s, hsva.v);
  }
};
export { $8, SaturationBox };
