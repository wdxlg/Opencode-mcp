// Recovered JavaScript implementation; original TS types are not recovered.
// Artifact: resources/app/out/vs/workbench/workbench.desktop.main.js
// Original module marker: src/vs/editor/contrib/colorPicker/browser/hoverColorPicker/hoverColorPickerParticipant.ts
import { AsyncIterableProducer } from "./module-0036.mjs";
import { ColorDetector } from "./module-0578.mjs";
import { createColorHover, updateColorPresentations, updateEditorModel } from "./module-0612.mjs";
import { RenderedHoverParts } from "./module-0575.mjs";
import { Dimension } from "./module-0075.mjs";
import { DisposableStore } from "./module-0012.mjs";
import { ColorPickerWidget } from "./module-0617.mjs";
import { Range2 } from "./module-0106.mjs";
import { localize } from "./module-0001.mjs";
import { __decorateClass, __decorateParam } from "./module-0000.mjs";
import { IThemeService } from "./module-0287.mjs";


// src/vs/editor/contrib/colorPicker/browser/hoverColorPicker/hoverColorPickerParticipant.ts
var ColorHover = class _ColorHover {
  constructor(owner, range2, model, provider) {
    this.owner = owner;
    this.range = range2;
    this.model = model;
    this.provider = provider;
    /**
     * Force the hover to always be rendered at this specific range,
     * even in the case of multiple hover parts.
     */
    this.forceShowAtRange = true;
  }
  isValidForHoverAnchor(anchor) {
    return anchor.type === 1 /* Range */ && this.range.startColumn <= anchor.range.startColumn && this.range.endColumn >= anchor.range.endColumn;
  }
  static fromBaseColor(owner, color2) {
    return new _ColorHover(owner, color2.range, color2.model, color2.provider);
  }
};

var HoverColorPickerParticipant = class {
  constructor(_editor, _themeService) {
    this._editor = _editor;
    this._themeService = _themeService;
    this.hoverOrdinal = 2;
  }
  computeSync(_anchor, _lineDecorations, source) {
    return [];
  }
  computeAsync(anchor, lineDecorations, source, token) {
    return AsyncIterableProducer.fromPromise(this._computeAsync(anchor, lineDecorations, source));
  }
  async _computeAsync(_anchor, lineDecorations, source) {
    if (!this._editor.hasModel()) {
      return [];
    }
    if (!this._isValidRequest(source)) {
      return [];
    }
    const colorDetector = ColorDetector.get(this._editor);
    if (!colorDetector) {
      return [];
    }
    for (const d of lineDecorations) {
      if (!colorDetector.isColorDecoration(d)) {
        continue;
      }
      const colorData = colorDetector.getColorData(d.range.getStartPosition());
      if (colorData) {
        const colorHover = ColorHover.fromBaseColor(this, await createColorHover(this._editor.getModel(), colorData.colorInfo, colorData.provider));
        return [colorHover];
      }
    }
    return [];
  }
  _isValidRequest(source) {
    const decoratorActivatedOn = this._editor.getOption(168 /* colorDecoratorsActivatedOn */);
    switch (source) {
      case 0 /* Mouse */:
        return decoratorActivatedOn === "hover" || decoratorActivatedOn === "clickAndHover";
      case 1 /* Click */:
        return decoratorActivatedOn === "click" || decoratorActivatedOn === "clickAndHover";
      case 2 /* Keyboard */:
        return true;
    }
  }
  renderHoverParts(context2, hoverParts) {
    const editor = this._editor;
    if (hoverParts.length === 0 || !editor.hasModel()) {
      return new RenderedHoverParts([]);
    }
    const minimumHeight = editor.getOption(75 /* lineHeight */) + 8;
    context2.setMinimumDimensions(new Dimension(302, minimumHeight));
    const disposables = new DisposableStore();
    const colorHover = hoverParts[0];
    const editorModel = editor.getModel();
    const model = colorHover.model;
    this._colorPicker = disposables.add(new ColorPickerWidget(context2.fragment, model, editor.getOption(163 /* pixelRatio */), this._themeService, "hover" /* Hover */));
    let editorUpdatedByColorPicker = false;
    let range2 = new Range2(colorHover.range.startLineNumber, colorHover.range.startColumn, colorHover.range.endLineNumber, colorHover.range.endColumn);
    disposables.add(model.onColorFlushed(async (color2) => {
      await updateColorPresentations(editorModel, model, color2, range2, colorHover);
      editorUpdatedByColorPicker = true;
      range2 = updateEditorModel(editor, range2, model);
    }));
    disposables.add(model.onDidChangeColor((color2) => {
      updateColorPresentations(editorModel, model, color2, range2, colorHover);
    }));
    disposables.add(editor.onDidChangeModelContent((e) => {
      if (editorUpdatedByColorPicker) {
        editorUpdatedByColorPicker = false;
      } else {
        context2.hide();
        editor.focus();
      }
    }));
    const renderedHoverPart = {
      hoverPart: ColorHover.fromBaseColor(this, colorHover),
      hoverElement: this._colorPicker.domNode,
      dispose() {
        disposables.dispose();
      }
    };
    return new RenderedHoverParts([renderedHoverPart]);
  }
  getAccessibleContent(hoverPart) {
    return localize(1060, null);
  }
  handleResize() {
    this._colorPicker?.layout();
  }
  handleContentsChanged() {
    this._colorPicker?.layout();
  }
  handleHide() {
    this._colorPicker?.dispose();
    this._colorPicker = void 0;
  }
  isColorPickerVisible() {
    return !!this._colorPicker;
  }
};

HoverColorPickerParticipant = __decorateClass([
  __decorateParam(1, IThemeService)
], HoverColorPickerParticipant);
export { ColorHover, HoverColorPickerParticipant };
