// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/sessions/sessions.desktop.main.js
// Original module marker: src/vs/editor/contrib/colorPicker/browser/hoverColorPicker/hoverColorPickerContribution.ts
import { Disposable } from "./module-0012.mjs";
import { isOnColorDecorator } from "./module-0653.mjs";
import { ContentHoverController } from "./module-0654.mjs";
import { Range2 } from "./module-0106.mjs";


// src/vs/editor/contrib/colorPicker/browser/hoverColorPicker/hoverColorPickerContribution.ts
var HoverColorPickerContribution = class extends Disposable {
  // ms
  constructor(_editor) {
    super();
    this._editor = _editor;
    this._register(_editor.onMouseDown((e4) => this.onMouseDown(e4)));
  }
  static {
    this.ID = "editor.contrib.colorContribution";
  }
  static {
    this.RECOMPUTE_TIME = 1e3;
  }
  dispose() {
    super.dispose();
  }
  onMouseDown(mouseEvent) {
    const colorDecoratorsActivatedOn = this._editor.getOption(168 /* colorDecoratorsActivatedOn */);
    if (colorDecoratorsActivatedOn !== "click" && colorDecoratorsActivatedOn !== "clickAndHover") {
      return;
    }
    if (!isOnColorDecorator(mouseEvent)) {
      return;
    }
    const hoverController = this._editor.getContribution(ContentHoverController.ID);
    if (!hoverController) {
      return;
    }
    if (hoverController.isColorPickerVisible) {
      return;
    }
    const targetRange = mouseEvent.target.range;
    if (!targetRange) {
      return;
    }
    const range2 = new Range2(targetRange.startLineNumber, targetRange.startColumn + 1, targetRange.endLineNumber, targetRange.endColumn + 1);
    hoverController.showContentHover(range2, 1 /* Immediate */, 1 /* Click */, false);
  }
};
export { HoverColorPickerContribution };
