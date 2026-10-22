// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/colorPicker/browser/colorPickerParts/colorPickerHeader.ts
import { $, EventType, addDisposableListener, append } from "./module-0075.mjs";
import { Disposable } from "./module-0012.mjs";
import { localize } from "./module-0001.mjs";
import { Color } from "./module-0197.mjs";
import { editorHoverBackground } from "./module-0229.mjs";
import { CloseButton } from "./module-0615.mjs";


// src/vs/editor/contrib/colorPicker/browser/colorPickerParts/colorPickerHeader.ts
var $12 = $;

var ColorPickerHeader = class extends Disposable {
  constructor(container2, model, themeService, type) {
    super();
    this.model = model;
    this.type = type;
    this._closeButton = null;
    this._domNode = $12(".colorpicker-header");
    append(container2, this._domNode);
    this._pickedColorNode = append(this._domNode, $12(".picked-color"));
    append(this._pickedColorNode, $12("span.codicon.codicon-color-mode"));
    this._pickedColorPresentation = append(this._pickedColorNode, document.createElement("span"));
    this._pickedColorPresentation.classList.add("picked-color-presentation");
    const tooltip = localize(1059, null);
    this._pickedColorNode.setAttribute("title", tooltip);
    this._originalColorNode = append(this._domNode, $12(".original-color"));
    this._originalColorNode.style.backgroundColor = Color.Format.CSS.format(this.model.originalColor) || "";
    this.backgroundColor = themeService.getColorTheme().getColor(editorHoverBackground) || Color.white;
    this._register(themeService.onDidColorThemeChange((theme) => {
      this.backgroundColor = theme.getColor(editorHoverBackground) || Color.white;
    }));
    this._register(addDisposableListener(this._pickedColorNode, EventType.CLICK, () => this.model.selectNextColorPresentation()));
    this._register(addDisposableListener(this._originalColorNode, EventType.CLICK, () => {
      this.model.color = this.model.originalColor;
      this.model.flushColor();
    }));
    this._register(model.onDidChangeColor(this.onDidChangeColor, this));
    this._register(model.onDidChangePresentation(this.onDidChangePresentation, this));
    this._pickedColorNode.style.backgroundColor = Color.Format.CSS.format(model.color) || "";
    this._pickedColorNode.classList.toggle("light", model.color.rgba.a < 0.5 ? this.backgroundColor.isLighter() : model.color.isLighter());
    this.onDidChangeColor(this.model.color);
    if (this.type === "standalone" /* Standalone */) {
      this._domNode.classList.add("standalone-colorpicker");
      this._closeButton = this._register(new CloseButton(this._domNode));
    }
  }
  get domNode() {
    return this._domNode;
  }
  get closeButton() {
    return this._closeButton;
  }
  get pickedColorNode() {
    return this._pickedColorNode;
  }
  get originalColorNode() {
    return this._originalColorNode;
  }
  onDidChangeColor(color2) {
    this._pickedColorNode.style.backgroundColor = Color.Format.CSS.format(color2) || "";
    this._pickedColorNode.classList.toggle("light", color2.rgba.a < 0.5 ? this.backgroundColor.isLighter() : color2.isLighter());
    this.onDidChangePresentation();
  }
  onDidChangePresentation() {
    this._pickedColorPresentation.textContent = this.model.presentation ? this.model.presentation.label : "";
  }
};
export { $12, ColorPickerHeader };
