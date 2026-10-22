// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/colorPicker/browser/colorPickerParts/colorPickerStrip.ts
import { $, EventType, addDisposableListener, append, getDomNodePagePosition } from "./module-0075.mjs";
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";
import { GlobalPointerMoveMonitor } from "./module-0225.mjs";
import { Color, RGBA } from "./module-0197.mjs";


// src/vs/editor/contrib/colorPicker/browser/colorPickerParts/colorPickerStrip.ts
var $9 = $;

var Strip = class extends Disposable {
  constructor(container2, model, type) {
    super();
    this.model = model;
    this._onDidChange = this._register(new Emitter());
    this.onDidChange = this._onDidChange.event;
    this._onColorFlushed = this._register(new Emitter());
    this.onColorFlushed = this._onColorFlushed.event;
    if (type === "standalone" /* Standalone */) {
      this.domNode = append(container2, $9(".standalone-strip"));
      this.overlay = append(this.domNode, $9(".standalone-overlay"));
    } else {
      this.domNode = append(container2, $9(".strip"));
      this.overlay = append(this.domNode, $9(".overlay"));
    }
    this.slider = append(this.domNode, $9(".slider"));
    this.slider.style.top = `0px`;
    this._register(addDisposableListener(this.domNode, EventType.POINTER_DOWN, (e4) => this.onPointerDown(e4)));
    this._register(model.onDidChangeColor(this.onDidChangeColor, this));
    this.layout();
  }
  layout() {
    this.height = this.domNode.offsetHeight - this.slider.offsetHeight;
    const value2 = this.getValue(this.model.color);
    this.updateSliderPosition(value2);
  }
  onDidChangeColor(color2) {
    const value2 = this.getValue(color2);
    this.updateSliderPosition(value2);
  }
  onPointerDown(e4) {
    if (!e4.target || !(e4.target instanceof Element)) {
      return;
    }
    const monitor = this._register(new GlobalPointerMoveMonitor());
    const origin = getDomNodePagePosition(this.domNode);
    this.domNode.classList.add("grabbing");
    if (e4.target !== this.slider) {
      this.onDidChangeTop(e4.offsetY);
    }
    monitor.startMonitoring(e4.target, e4.pointerId, e4.buttons, (event) => this.onDidChangeTop(event.pageY - origin.top), () => null);
    const pointerUpListener = addDisposableListener(e4.target.ownerDocument, EventType.POINTER_UP, () => {
      this._onColorFlushed.fire();
      pointerUpListener.dispose();
      monitor.stopMonitoring(true);
      this.domNode.classList.remove("grabbing");
    }, true);
  }
  onDidChangeTop(top2) {
    const value2 = Math.max(0, Math.min(1, 1 - top2 / this.height));
    this.updateSliderPosition(value2);
    this._onDidChange.fire(value2);
  }
  updateSliderPosition(value2) {
    this.slider.style.top = `${(1 - value2) * this.height}px`;
  }
};

var OpacityStrip = class extends Strip {
  constructor(container2, model, type) {
    super(container2, model, type);
    this.domNode.classList.add("opacity-strip");
    this.onDidChangeColor(this.model.color);
  }
  onDidChangeColor(color2) {
    super.onDidChangeColor(color2);
    const { r: r2, g, b } = color2.rgba;
    const opaque2 = new Color(new RGBA(r2, g, b, 1));
    const transparent2 = new Color(new RGBA(r2, g, b, 0));
    this.overlay.style.background = `linear-gradient(to bottom, ${opaque2} 0%, ${transparent2} 100%)`;
  }
  getValue(color2) {
    return color2.hsva.a;
  }
};

var HueStrip = class extends Strip {
  constructor(container2, model, type) {
    super(container2, model, type);
    this.domNode.classList.add("hue-strip");
  }
  getValue(color2) {
    return 1 - color2.hsva.h / 360;
  }
};
export { $9, Strip, OpacityStrip, HueStrip };
