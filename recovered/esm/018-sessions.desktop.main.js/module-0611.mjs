// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/colorPicker/browser/colorPickerModel.ts
import { Disposable } from "./module-0012.mjs";
import { Emitter } from "./module-0017.mjs";


// src/vs/editor/contrib/colorPicker/browser/colorPickerModel.ts
var ColorPickerModel = class extends Disposable {
  constructor(color2, availableColorPresentations, presentationIndex) {
    super();
    this.presentationIndex = presentationIndex;
    this._onColorFlushed = this._register(new Emitter());
    this.onColorFlushed = this._onColorFlushed.event;
    this._onDidChangeColor = this._register(new Emitter());
    this.onDidChangeColor = this._onDidChangeColor.event;
    this._onDidChangePresentation = this._register(new Emitter());
    this.onDidChangePresentation = this._onDidChangePresentation.event;
    this.originalColor = color2;
    this._color = color2;
    this._colorPresentations = availableColorPresentations;
  }
  get color() {
    return this._color;
  }
  set color(color2) {
    if (this._color.equals(color2)) {
      return;
    }
    this._color = color2;
    this._onDidChangeColor.fire(color2);
  }
  get presentation() {
    return this.colorPresentations[this.presentationIndex];
  }
  get colorPresentations() {
    return this._colorPresentations;
  }
  set colorPresentations(colorPresentations) {
    this._colorPresentations = colorPresentations;
    if (this.presentationIndex > colorPresentations.length - 1) {
      this.presentationIndex = 0;
    }
    this._onDidChangePresentation.fire(this.presentation);
  }
  selectNextColorPresentation() {
    this.presentationIndex = (this.presentationIndex + 1) % this.colorPresentations.length;
    this.flushColor();
    this._onDidChangePresentation.fire(this.presentation);
  }
  guessColorPresentation(color2, originalText) {
    let presentationIndex = -1;
    for (let i2 = 0; i2 < this.colorPresentations.length; i2++) {
      if (originalText.toLowerCase() === this.colorPresentations[i2].label) {
        presentationIndex = i2;
        break;
      }
    }
    if (presentationIndex === -1) {
      const originalTextPrefix = originalText.split("(")[0].toLowerCase();
      for (let i2 = 0; i2 < this.colorPresentations.length; i2++) {
        if (this.colorPresentations[i2].label.toLowerCase().startsWith(originalTextPrefix)) {
          presentationIndex = i2;
          break;
        }
      }
    }
    if (presentationIndex !== -1 && presentationIndex !== this.presentationIndex) {
      this.presentationIndex = presentationIndex;
      this._onDidChangePresentation.fire(this.presentation);
    }
  }
  flushColor() {
    this._onColorFlushed.fire(this._color);
  }
};
export { ColorPickerModel };
